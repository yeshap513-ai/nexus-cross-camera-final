# 🛡️ NEXUS: Cross-Camera Surveillance Intelligence Command Center

> **Gujarat Police Hackathon — Multi-Camera Automated Surveillance & ANPR Intelligence System**

NEXUS combines high-accuracy edge AI inference (YOLOv8 + EasyOCR) with spatio-temporal cross-camera correlation, an automated BOLO (Be-On-the-Lookout) watchlist engine, and a modern, high-contrast tactical React dashboard for law enforcement command centers.

---

## 🏗️ Architecture Overview

```
NEXUS/ (Cross_Camera_Intelligence)
├── frontend/                     # React 18 + Vite + Tailwind Tactical UI Dashboard
│   ├── src/
│   │   ├── components/
│   │   │   ├── common/           # TacticalCard, HSRPPlate, ThreatBadge
│   │   │   ├── layout/           # Navbar, Sidebar, ToastContainer, CommandPalette
│   │   │   └── pages/            # DashboardView, GISRouteTrackingView, LiveCamerasView,
│   │   │                         # VehicleSearchView, WatchlistRegistryView, RealTimeAlertsView,
│   │   │                         # InvestigationDossierView, AnalyticsView, CameraFleetView,
│   │   │                         # PipelineArchitectureView, SystemSettingsView
│   │   ├── context/              # AppContext (Live API sync with FastAPI backend)
│   │   ├── services/             # API client connecting to FastAPI port 8000
│   │   ├── data/                 # Grid node specifications & initial catalogs
│   │   └── utils/                # WebAudio sound effects manager
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
│
├── backend/                      # Python Core & AI Engine
│   ├── server.py                 # FastAPI REST API & Static Asset Server (Port 8000)
│   ├── detection.py              # YOLOv8 target detection (vehicles, persons, accessories)
│   ├── anpr.py                   # EasyOCR license plate recognition & HSV dominant color
│   ├── correlation.py            # Spatio-temporal multi-hop cross-camera trajectory tracking
│   ├── database.py               # SQLite storage for detections, alerts & CSV export
│   ├── ingestion.py              # Video stream demuxer & frame batch processing
│   ├── config.py                 # Camera GPS coordinates, target classes, police watchlist
│   ├── app.py                    # Supplementary Streamlit forensic dashboard (Port 8501)
│   ├── process_all_local.py      # Batch video processor script
│   ├── generate_demo_videos.py   # Multi-camera synthetic test stream generator
│   ├── export_csv.py             # Deliverable CSV exporter
│   ├── cross_camera_intel.db     # SQLite database (Real detections & alerts)
│   ├── yolov8n.pt                # YOLOv8 nano neural network weights
│   └── data/
│       ├── videos/               # Raw multi-camera CCTV feeds (cam_01.mp4 - cam_04.mp4)
│       ├── output_videos/        # Annotated detection feeds (annotated_CAM_01.mp4 - CAM_04)
│       └── snapshots/            # 1,000+ real cropped vehicle & license plate detections
│
├── requirements.txt              # Exact unified Python dependencies
├── .gitignore                    # Security filters (secrets, tokens, zips, cache)
├── README.md                     # System documentation
└── start_nexus.sh                # One-click startup script for Mac/Linux
```

---

## ⚡ Quick Start

### Prerequisites
- **Python 3.10+** (with `pip`)
- **Node.js v18+** & `npm`

### 1. One-Click Command Center Launch
Run the automated startup script:
```bash
./start_nexus.sh
```
This automatically verifies dependencies, clears stale ports, starts the FastAPI AI backend on port 8000, and boots the React Tactical Dashboard on port 3000.

### 2. Manual Service Launch (Optional)

**Terminal 1 — FastAPI Backend:**
```bash
cd backend
python3 -m uvicorn server:app --host 127.0.0.1 --port 8000
```

**Terminal 2 — React Tactical Dashboard:**
```bash
cd frontend
npm run dev -- --host 127.0.0.1 --port 3000
```

---

## 🌐 Operational Endpoints

| Service | URL | Purpose |
|---|---|---|
| **NEXUS Tactical Dashboard** | [http://localhost:3000](http://localhost:3000) | Primary user-facing command center |
| **FastAPI REST API Docs** | [http://localhost:8000/docs](http://localhost:8000/docs) | Interactive OpenAPI / Swagger documentation |
| **System Status Endpoint** | [http://localhost:8000/api/status](http://localhost:8000/api/status) | Real-time database & ingestion status |
| **CCTV Snapshots Archive** | [http://localhost:8000/snapshots/](http://localhost:8000/snapshots/) | Static access to vehicle & plate crops |
| **Camera Video Feeds** | [http://localhost:8000/videos/](http://localhost:8000/videos/) | Raw and annotated CCTV video playback |
| **Streamlit Analytics** | [http://localhost:8501](http://localhost:8501) | Supplementary forensic data dashboard |

---

## 🔍 Key REST APIs

- `GET /api/status`: Overall system status, detection counts, alert counts, and ingestion state.
- `GET /api/ingest`: Dynamic camera catalogue with GPS coordinates, RTSP URLs, FPS, and resolution.
- `GET /api/detections`: Real detection history from SQLite (with vehicle type, plate, color, confidence, snapshot path).
- `GET /api/alerts`: Real police watchlist matches and alerts.
- `GET /api/watchlist`: Active wanted/stolen vehicle BOLO list.
- `GET /api/correlate?plate={plate}`: High-confidence multi-hop cross-camera trajectory correlation.
- `GET /api/correlate/visual?object_class={cls}&color={col}`: Visual cross-camera attribute correlation.
- `POST /api/export`: Generates `detections_export.csv` containing all sequenced detections.
- `POST /api/process/run`: Triggers the end-to-end YOLOv8 + EasyOCR video pipeline across camera feeds.

---

## 🛡️ Security & Privacy
- Sensitive local files (`*.zip`, `.env`, credentials, local tokens, SQLite temp logs) are ignored via `.gitignore`.
- No sensitive keys or external cloud dependencies are required for core inference.
