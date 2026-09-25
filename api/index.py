from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(
    title="NEXUS Cross-Camera Intelligence API"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/api/status")
def status():
    return {
        "status": "online",
        "message": "NEXUS API is running on Vercel",
        "processing": False
    }


@app.get("/api/detections")
def detections():
    return []


@app.get("/api/alerts")
def alerts():
    return []


@app.get("/api/watchlist")
def watchlist():
    return []


@app.get("/api/ingest")
def ingest():
    return {
        "status": "online",
        "message": "Camera ingestion API is available"
    }


@app.get("/api/correlate")
def correlate():
    return {
        "matches": [],
        "count": 0
    }


@app.get("/api/correlate/visual")
def visual_correlation():
    return {
        "matches": [],
        "count": 0
    }


@app.post("/api/export")
def export_data():
    return {
        "status": "success",
        "message": "Export endpoint is available"
    }


@app.post("/api/process/run")
def process():
    return {
        "status": "unavailable",
        "message": "AI video processing is not available inside the Vercel serverless function."
    }
