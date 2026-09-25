import math
import logging
from typing import List, Dict, Any, Optional
from database import get_connection
from config import VISUAL_CORRELATION_TIME_WINDOW_SEC

logger = logging.getLogger("CorrelationEngine")

def haversine_distance_meters(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Calculate great-circle distance between two GPS coordinates in meters."""
    R = 6371000.0  # Earth radius in meters
    phi1 = math.radians(lat1)
    phi2 = math.radians(lat2)
    delta_phi = math.radians(lat2 - lat1)
    delta_lambda = math.radians(lon2 - lon1)

    a = (math.sin(delta_phi / 2.0) ** 2 +
         math.cos(phi1) * math.cos(phi2) * (math.sin(delta_lambda / 2.0) ** 2))
    c = 2.0 * math.atan2(math.sqrt(a), math.sqrt(1.0 - a))
    return R * c

def aggregate_camera_hops(
    detections: List[Dict[str, Any]],
    base_confidence: float,
    confidence_type: str,
    same_camera_window_sec: float = 10.0
) -> Dict[str, Any]:
    """
    Groups consecutive detections at the same camera into a distinct 'Camera Hop/Checkpoint'.
    Computes inter-camera transit time, distance traveled, and estimated speed.
    """
    if not detections:
        return {
            "total_hops": 0,
            "raw_detections_count": 0,
            "cameras_visited": [],
            "journey": [],
            "coordinates": [],
            "confidence_score": 0.0,
            "confidence_type": "None",
        }

    # Sort chronologically by timestamp_pts
    sorted_dets = sorted(detections, key=lambda d: d.get("timestamp_pts", 0.0))

    # Group into camera visits
    camera_visits = []
    current_visit = None

    for det in sorted_dets:
        cam_id = det["camera_id"]
        pts = det.get("timestamp_pts", 0.0)

        if current_visit is None:
            current_visit = {
                "camera_id": cam_id,
                "camera_name": det.get("camera_name", cam_id),
                "latitude": det.get("latitude", 0.0),
                "longitude": det.get("longitude", 0.0),
                "first_seen_pts": pts,
                "last_seen_pts": pts,
                "first_seen_iso": det.get("timestamp_iso", ""),
                "last_seen_iso": det.get("timestamp_iso", ""),
                "best_snapshot": det.get("snapshot_path", ""),
                "plate_text": det.get("plate_text", ""),
                "color": det.get("color", ""),
                "object_class": det.get("object_class", ""),
                "best_confidence": det.get("confidence", 0.0),
                "detection_count": 1,
            }
        elif current_visit["camera_id"] == cam_id and (pts - current_visit["last_seen_pts"]) <= (same_camera_window_sec * 1000.0):
            # Same camera within temporal window
            current_visit["last_seen_pts"] = pts
            current_visit["last_seen_iso"] = det.get("timestamp_iso", "")
            current_visit["detection_count"] += 1
            if det.get("confidence", 0.0) > current_visit["best_confidence"]:
                current_visit["best_confidence"] = det.get("confidence", 0.0)
                if det.get("snapshot_path"):
                    current_visit["best_snapshot"] = det.get("snapshot_path")
                if det.get("plate_text"):
                    current_visit["plate_text"] = det.get("plate_text")
        else:
            # Different camera or new arrival after gap
            camera_visits.append(current_visit)
            current_visit = {
                "camera_id": cam_id,
                "camera_name": det.get("camera_name", cam_id),
                "latitude": det.get("latitude", 0.0),
                "longitude": det.get("longitude", 0.0),
                "first_seen_pts": pts,
                "last_seen_pts": pts,
                "first_seen_iso": det.get("timestamp_iso", ""),
                "last_seen_iso": det.get("timestamp_iso", ""),
                "best_snapshot": det.get("snapshot_path", ""),
                "plate_text": det.get("plate_text", ""),
                "color": det.get("color", ""),
                "object_class": det.get("object_class", ""),
                "best_confidence": det.get("confidence", 0.0),
                "detection_count": 1,
            }

    if current_visit is not None:
        camera_visits.append(current_visit)

    # Now calculate hop progression between checkpoints
    journey = []
    coordinates = []
    cameras_visited = []

    prev_hop = None
    for idx, visit in enumerate(camera_visits):
        lat = visit["latitude"]
        lon = visit["longitude"]
        time_delta_sec = 0.0
        distance_meters = 0.0
        speed_kmh = 0.0

        if prev_hop is not None:
            time_delta_sec = max(0.0, (visit["first_seen_pts"] - prev_hop["last_seen_pts"]) / 1000.0)
            if lat and lon and prev_hop["latitude"] and prev_hop["longitude"]:
                distance_meters = haversine_distance_meters(
                    prev_hop["latitude"], prev_hop["longitude"], lat, lon
                )
                if time_delta_sec > 0:
                    speed_kmh = round((distance_meters / time_delta_sec) * 3.6, 1)

        hop_record = {
            "hop_number": idx + 1,
            "camera_id": visit["camera_id"],
            "camera_name": visit["camera_name"],
            "timestamp_pts": visit["first_seen_pts"],
            "timestamp_iso": visit["first_seen_iso"],
            "last_seen_iso": visit["last_seen_iso"],
            "duration_at_cam_sec": round((visit["last_seen_pts"] - visit["first_seen_pts"]) / 1000.0, 1),
            "detections_at_cam": visit["detection_count"],
            "time_delta_from_prev_sec": round(time_delta_sec, 2),
            "distance_from_prev_m": round(distance_meters, 1),
            "estimated_speed_kmh": speed_kmh,
            "latitude": lat,
            "longitude": lon,
            "snapshot_path": visit["best_snapshot"],
            "plate_text": visit["plate_text"],
            "color": visit["color"],
            "object_class": visit["object_class"],
            "confidence_score": base_confidence,
            "confidence_type": confidence_type,
        }
        journey.append(hop_record)
        if lat and lon:
            coordinates.append((lat, lon))
        if visit["camera_name"] not in cameras_visited:
            cameras_visited.append(visit["camera_name"])

        prev_hop = visit

    return {
        "total_hops": len(journey),
        "raw_detections_count": len(detections),
        "unique_cameras_count": len(cameras_visited),
        "cameras_visited": cameras_visited,
        "journey": journey,
        "coordinates": coordinates,
        "confidence_score": base_confidence,
        "confidence_type": confidence_type,
    }

def correlate_by_plate(plate_query: str) -> Dict[str, Any]:
    """
    EASY CASE: Correlate cross-camera detections by license plate text.
    High Confidence match (0.95).
    """
    norm_query = plate_query.strip().upper().replace(" ", "").replace("-", "")
    if not norm_query:
        return {"error": "Plate query is empty"}

    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""
        SELECT * FROM detections
        WHERE plate_text IS NOT NULL AND plate_text != ''
        ORDER BY timestamp_pts ASC
    """)
    rows = [dict(r) for r in cursor.fetchall()]
    conn.close()

    matched_dets = []
    for r in rows:
        p = (r.get("plate_text") or "").upper().replace(" ", "").replace("-", "")
        if norm_query in p or p in norm_query:
            matched_dets.append(r)

    if not matched_dets:
        return {
            "query": plate_query,
            "total_hops": 0,
            "journey": [],
            "coordinates": [],
            "message": f"No detections found for plate '{plate_query}'",
            "confidence_type": "None",
            "confidence_score": 0.0,
        }

    unique_cams = len(set(d["camera_id"] for d in matched_dets))
    confidence_score = 0.95 if unique_cams > 1 else 0.90
    confidence_type = "HIGH CONFIDENCE (License Plate Correlation)"

    result = aggregate_camera_hops(matched_dets, confidence_score, confidence_type)
    result["query"] = plate_query
    return result

def correlate_by_visual(
    object_class: str,
    color: str,
    time_window_sec: float = VISUAL_CORRELATION_TIME_WINDOW_SEC,
) -> Dict[str, Any]:
    """
    HARDER CASE: Correlate by object_class + color across cameras.
    Distinctly flagged as LOWER CONFIDENCE match (0.60).
    """
    conn = get_connection()
    cursor = conn.cursor()

    params = [object_class.lower(), color.capitalize()]
    query = """
        SELECT * FROM detections
        WHERE LOWER(object_class) = ? AND color = ?
        ORDER BY timestamp_pts ASC
    """

    cursor.execute(query, params)
    rows = [dict(r) for r in cursor.fetchall()]
    conn.close()

    if not rows:
        return {
            "object_class": object_class,
            "color": color,
            "total_hops": 0,
            "journey": [],
            "coordinates": [],
            "message": f"No visual matches found for {color} {object_class}",
            "confidence_type": "None",
            "confidence_score": 0.0,
        }

    # Group records within the time window
    matched_group = []
    for r in rows:
        if not matched_group:
            matched_group.append(r)
        else:
            delta_sec = abs(r["timestamp_pts"] - matched_group[-1]["timestamp_pts"]) / 1000.0
            if delta_sec <= time_window_sec:
                matched_group.append(r)
            elif len(matched_group) < 2:
                matched_group = [r]

    confidence_score = 0.60
    confidence_type = "LOWER CONFIDENCE (Visual Attribute Correlation: Class + Color)"

    result = aggregate_camera_hops(matched_group, confidence_score, confidence_type)
    result["object_class"] = object_class
    result["color"] = color
    return result
