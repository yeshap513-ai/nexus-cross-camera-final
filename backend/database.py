import sqlite3
import csv
import logging
from typing import List, Dict, Any, Optional
from pathlib import Path
from config import DB_PATH

logger = logging.getLogger("Database")

def get_connection(db_path: Path = DB_PATH) -> sqlite3.Connection:
    conn = sqlite3.connect(str(db_path), check_same_thread=False)
    conn.row_factory = sqlite3.Row
    return conn

def init_db(db_path: Path = DB_PATH) -> None:
    """Initialize SQLite database with required tables and indexes."""
    conn = get_connection(db_path)
    cursor = conn.cursor()

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS detections (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        camera_id TEXT NOT NULL,
        camera_name TEXT,
        timestamp_pts REAL NOT NULL,
        timestamp_iso TEXT NOT NULL,
        object_class TEXT NOT NULL,
        plate_text TEXT,
        color TEXT,
        confidence REAL NOT NULL,
        snapshot_path TEXT,
        latitude REAL,
        longitude REAL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    """)

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS alerts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        camera_id TEXT NOT NULL,
        timestamp_pts REAL NOT NULL,
        timestamp_iso TEXT NOT NULL,
        plate_text TEXT NOT NULL,
        reason TEXT NOT NULL,
        snapshot_path TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    """)

    cursor.execute("CREATE INDEX IF NOT EXISTS idx_det_plate ON detections(plate_text);")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_det_camera ON detections(camera_id);")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_det_class_color ON detections(object_class, color);")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_alerts_plate ON alerts(plate_text);")

    conn.commit()
    conn.close()
    logger.info(f"Database initialized at {db_path}")

def insert_detection(
    camera_id: str,
    camera_name: str,
    timestamp_pts: float,
    timestamp_iso: str,
    object_class: str,
    plate_text: Optional[str],
    color: str,
    confidence: float,
    snapshot_path: str,
    latitude: float,
    longitude: float,
    db_path: Path = DB_PATH
) -> int:
    """Insert a new detection record into the database."""
    conn = get_connection(db_path)
    cursor = conn.cursor()
    cursor.execute(
        """
        INSERT INTO detections (
            camera_id, camera_name, timestamp_pts, timestamp_iso,
            object_class, plate_text, color, confidence,
            snapshot_path, latitude, longitude
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """,
        (
            camera_id, camera_name, timestamp_pts, timestamp_iso,
            object_class, plate_text, color, round(confidence, 4),
            snapshot_path, latitude, longitude
        ),
    )
    det_id = cursor.lastrowid
    conn.commit()
    conn.close()
    return det_id

def insert_alert(
    camera_id: str,
    timestamp_pts: float,
    timestamp_iso: str,
    plate_text: str,
    reason: str,
    snapshot_path: str,
    db_path: Path = DB_PATH
) -> int:
    """Insert a new watchlist alert into the database."""
    conn = get_connection(db_path)
    cursor = conn.cursor()
    cursor.execute(
        """
        INSERT INTO alerts (
            camera_id, timestamp_pts, timestamp_iso,
            plate_text, reason, snapshot_path
        ) VALUES (?, ?, ?, ?, ?, ?)
        """,
        (camera_id, timestamp_pts, timestamp_iso, plate_text, reason, snapshot_path),
    )
    alert_id = cursor.lastrowid
    conn.commit()
    conn.close()
    return alert_id

def get_all_detections(
    camera_id: Optional[str] = None,
    object_class: Optional[str] = None,
    limit: int = 500,
    db_path: Path = DB_PATH
) -> List[Dict[str, Any]]:
    """Retrieve detections with optional filters."""
    conn = get_connection(db_path)
    cursor = conn.cursor()
    query = "SELECT * FROM detections WHERE 1=1"
    params = []

    if camera_id:
        query += " AND camera_id = ?"
        params.append(camera_id)
    if object_class:
        query += " AND object_class = ?"
        params.append(object_class)

    query += " ORDER BY id DESC LIMIT ?"
    params.append(limit)

    cursor.execute(query, params)
    rows = [dict(r) for r in cursor.fetchall()]
    conn.close()
    return rows

def get_all_alerts(limit: int = 100, db_path: Path = DB_PATH) -> List[Dict[str, Any]]:
    """Retrieve watchlist alerts, newest first."""
    conn = get_connection(db_path)
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM alerts ORDER BY id DESC LIMIT ?", (limit,))
    rows = [dict(r) for r in cursor.fetchall()]
    conn.close()
    return rows

def export_detections_csv(output_csv_path: str, db_path: Path = DB_PATH) -> str:
    """Export all detections to CSV as required by output deliverables."""
    conn = get_connection(db_path)
    cursor = conn.cursor()
    cursor.execute("""
        SELECT timestamp_iso AS timestamp, camera_id, object_class,
               plate_text, confidence, latitude, longitude
        FROM detections
        ORDER BY timestamp_pts ASC
    """)
    rows = cursor.fetchall()
    
    with open(output_csv_path, mode="w", newline="", encoding="utf-8") as f:
        writer = csv.writer(f)
        writer.writerow(["timestamp", "camera_id", "object_class", "plate_text", "confidence", "latitude", "longitude"])
        for row in rows:
            writer.writerow([
                row["timestamp"],
                row["camera_id"],
                row["object_class"],
                row["plate_text"] or "",
                row["confidence"],
                row["latitude"],
                row["longitude"]
            ])
            
    conn.close()
    return output_csv_path
