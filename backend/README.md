# 🛡️ Cross-Camera Vehicle & Person Intelligence
### Gujarat Police Hackathon Prototype — Automated Multi-Camera Surveillance & ANPR Intelligence System

A fully functional, end-to-end Python prototype designed for police and smart city surveillance command centers. It ingests CCTV camera feeds, detects vehicles and persons in real time using YOLOv8, reads license plates using EasyOCR, checks targets against a police watchlist, automatically correlates suspect movement across multiple cameras, and renders an interactive dashboard with route mapping.

---

## 🚀 Key Capabilities

1. **Dual Ingestion Engine**:
   - **Mode A (Local Video Mode)**: Reads 2–4 local `.mp4` video files representing different camera checkpoints with GPS coordinates and timestamps.
   - **Mode B (Live RTSP Grid Mode)**: Connects to live network RTSP feeds following all integrator specifications (forced TCP transport, strict PTS-based timing via `CAP_PROP_POS_MSEC`, automatic exponential backoff reconnects from 2s to 30s, resilient non-fatal decoder handling, and dynamic camera catalogue discovery from `/api/ingest`).

2. **AI Detection & Attribute Extraction**:
   - **YOLOv8 (Ultralytics)**: Pretrained COCO weights detecting `car`, `motorcycle`, `bus`, `truck`, `person`, `backpack`, `handbag`, `bicycle`.
   - **ANPR (License Plate Reading)**: EasyOCR plate recognition with character normalization and preprocessing.
   - **Dominant Color Extraction**: HSV-based color classification (White, Red, Blue, Black, Silver/Gray, Yellow, Green) for backup attributes.
   - **Snapshot Generation**: Automatically crops and saves suspect bounding boxes to `data/snapshots/`.

3. **Dual-Tier Correlation Engine**:
   - **High Confidence Correlation (0.95)**: Matches identical license plate sightings across different cameras, constructing a chronological hop-by-hop journey with travel time, spatial distance, and estimated transit speed (km/h).
   - **Visual Attribute Correlation (0.60)**: Correlates pedestrians or vehicles with unreadable plates by `object_class` + `color` within a configurable temporal window. Displays clearly marked as `LOWER CONFIDENCE`.

4. **Real-Time Watchlist & Alert System**:
   - Built-in police database of stolen/wanted vehicles (e.g., `GJ01AB1234` Stolen Vehicle FIR #102/2026, `GJ05CD5678` Armed Robbery Case #5678).
   - Immediate terminal alert and database persistence with timestamp, camera name, and snapshot thumbnail.

5. **Police Command Dashboard**:
   - Built in **Streamlit** with dark-mode tactical police theme.
   - **GIS Route Map (`streamlit-folium`)**: Visualizes camera positions in Ahmedabad, plots transit lines connecting consecutive hops, and shows numbered checkpoint markers with snapshots and telemetry.
   - **Deliverables**: Instant 1-click CSV export and an in-dashboard video player for annotated MP4 video feeds.

---

## 📂 System Architecture & File Structure

```text
gujarat_police_hackathon/
├── config.py                 # System configuration, camera metadata, GPS, watchlist
├── database.py               # SQLite interface, detections & alerts schema, CSV exporter
├── anpr.py                   # EasyOCR ANPR plate reader & HSV color extraction
├── detection.py              # YOLOv8 object detection, snapshot cropper & alert triggers
├── correlation.py            # Multi-camera correlation engine (plate & visual attributes)
├── ingestion.py              # Camera ingestion module (Mode A local files & Mode B RTSP)
├── server.py                 # FastAPI backend REST API (port 8000)
├── app.py                    # Streamlit police command center dashboard (port 8501)
├── generate_demo_videos.py   # Traffic feed generator creating multi-camera test videos
├── process_all_local.py      # Batch camera processing script
├── export_csv.py             # CLI CSV export deliverable utility
├── cross_camera_intel.db     # SQLite single-file database
├── detections_export.csv     # Exported detections CSV
└── data/
    ├── videos/               # Camera video feeds (cam_01.mp4, cam_02.mp4, ...)
    ├── snapshots/            # Cropped object snapshots
    └── output_videos/        # Annotated video files (annotated_CAM_01.mp4, ...)
```

---

## 🛠️ Tech Stack (Strictly Lean)

- **Backend**: Python 3.13 + FastAPI (`uvicorn`)
- **Video Handling**: OpenCV (`cv2`) using FFmpeg backend
- **Object Detection**: YOLOv8 nano (`ultralytics`, pretrained COCO weights)
- **ANPR**: `easyocr` (English model)
- **Database**: SQLite3 (`cross_camera_intel.db`)
- **Dashboard**: `streamlit` + `streamlit-folium` (`folium`)
- **Hardware Acceleration**: Apple Silicon MPS / CPU auto-detected

---

## 🚦 How to Run & Test

Both the **FastAPI Backend** and the **Streamlit Dashboard** are already running live!

### 1. View the Live Dashboard
Open your web browser and navigate to:
👉 **[http://localhost:8501](http://localhost:8501)**

### 2. View the REST API
👉 **[http://localhost:8000/docs](http://localhost:8000/docs)** (Interactive Swagger UI)
- `GET /api/status`: System status and active camera counts
- `GET /api/ingest`: Mode B dynamic camera catalogue
- `GET /api/alerts`: Real-time police watchlist alerts
- `GET /api/correlate?plate=GJ01AB1234`: Cross-camera plate correlation trajectory
- `GET /api/correlate/visual?object_class=person&color=Red`: Visual attribute trajectory

### 3. Re-run Ingestion on Camera Feeds
To re-process all camera feeds and generate new annotated video deliverables:
```bash
python3 process_all_local.py
```

### 4. Export Detections to CSV
```bash
python3 export_csv.py
```
Outputs `detections_export.csv` with columns:
`timestamp, camera_id, object_class, plate_text, confidence, latitude, longitude`

### 5. Using Your Own Recorded MP4 Clips
To use your own local video recordings:
1. Place 2 to 4 `.mp4` video files into `data/videos/`:
   - `data/videos/cam_01.mp4`
   - `data/videos/cam_02.mp4`
   - `data/videos/cam_03.mp4`
   - `data/videos/cam_04.mp4`
2. Run `python3 process_all_local.py`
3. Refresh the Streamlit dashboard at `http://localhost:8501` to view your detections and routes!

---

## 🏆 Verified Hackathon Deliverables

- ✅ **Fully Functional Real Code**: Real YOLOv8 detection, real EasyOCR plate reads, real database inserts.
- ✅ **Cross-Camera Correlation**:
  - `GJ01AB1234` correlated across 3 distinct cameras: **ISKCON Junction (CAM_01) ➔ Pakwan (CAM_02) ➔ Shivranjani (CAM_03)** with 95% High Confidence, travel time, and speed.
  - `person (Red shirt)` correlated across **Shivranjani (CAM_03) ➔ Nehrunagar (CAM_04)** with 60% Lower Confidence.
- ✅ **Real-Time Watchlist Alerts**: Fired and stored with snapshots, camera names, timestamps, and FIR reasons.
- ✅ **Annotated Output Video**: Saved in `data/output_videos/annotated_CAM_01.mp4` (and for all 4 cameras) playable in dashboard.
- ✅ **Detections CSV Export**: Formatted to exact specifications in `detections_export.csv`.
