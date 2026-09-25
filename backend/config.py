import os
from pathlib import Path

# Base directories
BASE_DIR = Path(__file__).resolve().parent
DATA_DIR = BASE_DIR / "data"
VIDEO_DIR = DATA_DIR / "videos"
SNAPSHOT_DIR = DATA_DIR / "snapshots"
OUTPUT_DIR = DATA_DIR / "output_videos"
DB_PATH = BASE_DIR / "cross_camera_intel.db"

# Ensure runtime directories exist
VIDEO_DIR.mkdir(parents=True, exist_ok=True)
SNAPSHOT_DIR.mkdir(parents=True, exist_ok=True)
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

# Ingestion Mode: "local" (Mode A) or "rtsp" (Mode B)
INGESTION_MODE = os.getenv("INGESTION_MODE", "local").lower()

# Mode A - Local Video Cameras (Gujarat Police Grid Coordinates)
LOCAL_CAMERAS = [
    {
        "id": "CAM_01",
        "name": "SG Highway - ISKCON Junction",
        "latitude": 23.0298,
        "longitude": 72.5074,
        "video_path": str(VIDEO_DIR / "cam_01.mp4"),
        "timeline_offset_sec": 0.0,
    },
    {
        "id": "CAM_02",
        "name": "Pakwan Cross Road - Bodakdev",
        "latitude": 23.0372,
        "longitude": 72.5118,
        "video_path": str(VIDEO_DIR / "cam_02.mp4"),
        "timeline_offset_sec": 120.0,  # +2 minutes transit
    },
    {
        "id": "CAM_03",
        "name": "Shivranjani Cross Road",
        "latitude": 23.0264,
        "longitude": 72.5321,
        "video_path": str(VIDEO_DIR / "cam_03.mp4"),
        "timeline_offset_sec": 300.0,  # +5 minutes transit
    },
    {
        "id": "CAM_04",
        "name": "Nehrunagar Circle",
        "latitude": 23.0189,
        "longitude": 72.5442,
        "video_path": str(VIDEO_DIR / "cam_04.mp4"),
        "timeline_offset_sec": 480.0,  # +8 minutes transit
    },
]

# Mode B - RTSP Ingestion Configuration
RTSP_INGEST_API_HOST = os.getenv("RTSP_INGEST_API_HOST", "http://127.0.0.1:8000")
RTSP_INGEST_ENDPOINT = f"{RTSP_INGEST_API_HOST}/api/ingest"
RTSP_TRANSPORT_OPTION = "rtsp_transport;tcp"
RTSP_BACKOFF_INITIAL_SEC = 2.0
RTSP_BACKOFF_MAX_SEC = 30.0

# YOLOv8 Target Classes (COCO indices & names)
# 0: person, 1: bicycle, 2: car, 3: motorcycle, 5: bus, 7: truck, 24: backpack, 26: handbag
TARGET_CLASSES = {
    0: "person",
    1: "bicycle",
    2: "car",
    3: "motorcycle",
    5: "bus",
    7: "truck",
    24: "backpack",
    26: "handbag",
}
VEHICLE_CLASSES = {"car", "motorcycle", "bus", "truck"}
PERSON_AND_OBJECT_CLASSES = {"person", "backpack", "handbag", "bicycle"}

# Confidence Threshold for YOLO detection
DETECTION_CONFIDENCE_THRESHOLD = 0.40

# Correlation configuration
VISUAL_CORRELATION_TIME_WINDOW_SEC = 300.0  # 5 minutes window for soft visual match

# Hardcoded Watchlist (Gujarat Police Wanted/Stolen Vehicles)
WATCHLIST = {
    "GJ01AB1234": "Stolen Vehicle - Navrangpura FIR #102/2026",
    "GJ05CD5678": "Armed Robbery Suspect - Crime Branch Case #5678",
    "GJ27EF9012": "Hit & Run Suspect - Satellite Traffic FIR #9012",
    "GJ01XY4321": "Surveillance Order - High Priority Transit",
    "MH02BZ9999": "Interstate Contraband Smuggling Alert #441",
}
