import os
import threading
from typing import Optional, List, Dict, Any
from pathlib import Path
from fastapi import FastAPI, Query, BackgroundTasks, HTTPException
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from config import (
    BASE_DIR,
    SNAPSHOT_DIR,
    OUTPUT_DIR,
    VIDEO_DIR,
    LOCAL_CAMERAS,
    INGESTION_MODE,
    WATCHLIST,
)
from database import (
    init_db,
    get_all_detections,
    get_all_alerts,
    export_detections_csv,
    get_connection,
)
from correlation import correlate_by_plate, correlate_by_visual
from ingestion import process_camera_stream, get_dynamic_rtsp_catalogue

# Initialize SQLite database
init_db()

app = FastAPI(
    title="Cross-Camera Vehicle & Person Intelligence API",
    description="Gujarat Police Hackathon - Multi-Camera Automated Surveillance & ANPR Intelligence System",
    version="1.0.0",
)

# Enable CORS for dashboard and external clients
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Serve snapshots and videos statically for dashboard and map popups
app.mount("/snapshots", StaticFiles(directory=str(SNAPSHOT_DIR)), name="snapshots")
app.mount("/videos", StaticFiles(directory=str(VIDEO_DIR)), name="videos")
app.mount("/output_videos", StaticFiles(directory=str(OUTPUT_DIR)), name="output_videos")

# Processing state tracker
PROCESSING_STATE = {
    "is_running": False,
    "active_camera": None,
    "processed_cameras": [],
    "total_detections": 0,
}

@app.get("/api/status")
def get_status():
    """Returns system status, ingestion mode, database stats, and active watchlist."""
    conn = get_connection()
    c = conn.cursor()
    c.execute("SELECT COUNT(*) FROM detections")
    det_count = c.fetchone()[0]
    c.execute("SELECT COUNT(*) FROM alerts")
    alert_count = c.fetchone()[0]
    conn.close()

    return {
        "status": "online",
        "ingestion_mode": INGESTION_MODE,
        "total_detections": det_count,
        "total_alerts": alert_count,
        "processing_state": PROCESSING_STATE,
        "watchlist_items": len(WATCHLIST),
        "configured_cameras": len(LOCAL_CAMERAS),
    }

@app.get("/api/ingest")
def get_camera_catalogue():
    """
    MODE B Dynamic Camera Catalogue Endpoint.
    Integrator guide rule: Camera list must always be fetched dynamically from /api/ingest.
    Provides camera specs (resolution, codec, FPS, RTSP URLs, GPS coordinates).
    """
    catalogue = [
        {
            "id": cam["id"],
            "name": cam["name"],
            "rtsp_url": cam.get("video_path", f"rtsp://127.0.0.1:8554/{cam['id'].lower()}"),
            "video_url": f"/videos/{os.path.basename(cam['video_path'])}" if cam.get("video_path") else None,
            "annotated_video_url": f"/output_videos/annotated_{cam['id']}.mp4",
            "latitude": cam["latitude"],
            "longitude": cam["longitude"],
            "codec": "h264",
            "resolution": "1920x1080",
            "fps": 30,
            "status": "ACTIVE",
        }
        for cam in LOCAL_CAMERAS
    ]
    return {
        "grid_name": "Gujarat Police Surveillance Grid (Ahmedabad Urban Zone)",
        "total_cameras": len(catalogue),
        "cameras": catalogue,
    }

@app.get("/api/watchlist")
def get_watchlist():
    """Retrieve active police watchlist target entries."""
    return [
        {
            "plate": plate,
            "reason": reason,
            "threatLevel": "CRITICAL" if any(w in reason.lower() for w in ["stolen", "robbery", "smuggling", "kidnap"]) else "HIGH",
            "status": "WANTED / ACTIVE BOLO",
            "crimeCategory": reason,
            "caseNumber": f"FIR-{plate[-4:]}/2026",
            "vehicle": "Target Motor Vehicle",
            "color": "Silver/Gray",
        }
        for plate, reason in WATCHLIST.items()
    ]

@app.get("/api/detections")
def get_detections(
    camera_id: Optional[str] = Query(None, description="Filter by camera ID"),
    object_class: Optional[str] = Query(None, description="Filter by object class"),
    limit: int = Query(200, ge=1, le=1000),
):
    """Retrieve detections with optional filtering."""
    return get_all_detections(camera_id=camera_id, object_class=object_class, limit=limit)

@app.get("/api/alerts")
def get_alerts(limit: int = Query(50, ge=1, le=200)):
    """Retrieve police watchlist alerts, most recent first."""
    return get_all_alerts(limit=limit)

@app.get("/api/correlate")
def correlate_plate(plate: str = Query(..., description="License plate to search and correlate")):
    """
    EASY CASE: Cross-camera correlation by license plate.
    Returns sequenced camera-by-camera trajectory with HIGH CONFIDENCE.
    """
    result = correlate_by_plate(plate)
    return result

@app.get("/api/correlate/visual")
def correlate_visual(
    object_class: str = Query(..., description="Object class (e.g. person, car)"),
    color: str = Query(..., description="Dominant color (e.g. Red, Black, White)"),
    time_window_sec: float = Query(300.0, description="Correlation time window in seconds"),
):
    """
    HARDER CASE: Cross-camera correlation by visual attributes (object class + color).
    Returns sequenced trajectory with LOWER CONFIDENCE clearly marked.
    """
    result = correlate_by_visual(object_class=object_class, color=color, time_window_sec=time_window_sec)
    return result

@app.post("/api/export")
def export_csv():
    """Export all detections to CSV as required by output deliverables."""
    csv_file = BASE_DIR / "detections_export.csv"
    export_detections_csv(str(csv_file))
    return {
        "message": "Export completed successfully",
        "csv_path": str(csv_file),
        "filename": "detections_export.csv",
    }

def run_all_local_cameras_worker(max_frames_per_cam: int = 150):
    """Background worker to process all local camera feeds."""
    global PROCESSING_STATE
    PROCESSING_STATE["is_running"] = True
    PROCESSING_STATE["processed_cameras"] = []

    for cam in LOCAL_CAMERAS:
        PROCESSING_STATE["active_camera"] = cam["name"]
        res = process_camera_stream(
            camera_info=cam,
            max_frames=max_frames_per_cam,
            save_annotated_video=True,
            output_filename=f"annotated_{cam['id']}.mp4",
        )
        PROCESSING_STATE["processed_cameras"].append(res)
        PROCESSING_STATE["total_detections"] += res.get("detections_count", 0)

    PROCESSING_STATE["is_running"] = False
    PROCESSING_STATE["active_camera"] = None

@app.post("/api/process/run")
def trigger_processing(background_tasks: BackgroundTasks, max_frames: int = Query(150)):
    """Triggers end-to-end ingestion and AI processing in the background."""
    if PROCESSING_STATE["is_running"]:
        return {"status": "already_running", "message": "Video ingestion is currently in progress."}

    background_tasks.add_task(run_all_local_cameras_worker, max_frames)
    return {"status": "started", "message": f"Processing queued for {len(LOCAL_CAMERAS)} cameras."}

# Serve compiled React frontend in single-container deployment (e.g. Railway / Production)
FRONTEND_DIST = BASE_DIR / "static_frontend"
if not FRONTEND_DIST.exists():
    FRONTEND_DIST = BASE_DIR.parent / "frontend" / "dist"

if FRONTEND_DIST.exists():
    assets_dir = FRONTEND_DIST / "assets"
    if assets_dir.exists():
        app.mount("/assets", StaticFiles(directory=str(assets_dir)), name="assets")

    @app.get("/{full_path:path}")
    async def serve_spa(full_path: str):
        # Don't intercept API, snapshots, or videos
        if full_path.startswith(("api", "snapshots", "videos", "output_videos", "docs", "openapi.json")):
            raise HTTPException(status_code=404, detail="Not found")
        file_path = FRONTEND_DIST / full_path
        if file_path.is_file():
            return FileResponse(file_path)
        index_file = FRONTEND_DIST / "index.html"
        if index_file.exists():
            return FileResponse(index_file)
        raise HTTPException(status_code=404, detail="Frontend index.html not found")

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    uvicorn.run("server:app", host="0.0.0.0", port=port, reload=False)
