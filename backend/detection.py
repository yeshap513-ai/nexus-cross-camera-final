import os
import cv2
import uuid
import logging
from typing import List, Dict, Any, Tuple
from ultralytics import YOLO

from config import (
    SNAPSHOT_DIR,
    TARGET_CLASSES,
    DETECTION_CONFIDENCE_THRESHOLD,
    WATCHLIST,
)
from database import insert_detection, insert_alert
from anpr import extract_plate_and_color

logger = logging.getLogger("DetectionEngine")

_YOLO_MODEL = None

def get_yolo_model() -> YOLO:
    """Singleton getter for YOLOv8 model."""
    global _YOLO_MODEL
    if _YOLO_MODEL is None:
        logger.info("Loading YOLOv8 nano model (yolov8n.pt)...")
        # Pretrained COCO weights are automatically downloaded by ultralytics
        _YOLO_MODEL = YOLO("yolov8n.pt")
        logger.info("YOLOv8 nano model loaded successfully.")
    return _YOLO_MODEL

def check_watchlist_match(plate_text: str) -> Tuple[bool, str, str]:
    """
    Check if a detected plate matches any plate in the watchlist.
    Performs exact match or robust substring/normalized comparison.
    Returns (is_match, matched_plate, reason).
    """
    if not plate_text:
        return False, "", ""

    norm_detected = plate_text.upper().replace(" ", "").replace("-", "")

    for watch_plate, reason in WATCHLIST.items():
        norm_watch = watch_plate.upper().replace(" ", "").replace("-", "")
        if norm_detected == norm_watch or norm_watch in norm_detected or norm_detected in norm_watch:
            return True, watch_plate, reason

    return False, "", ""

def process_frame(
    frame,
    camera_info: Dict[str, Any],
    timestamp_pts: float,
    timestamp_iso: str,
    save_snapshots: bool = True
) -> List[Dict[str, Any]]:
    """
    Detects target objects in frame, crops snapshots, runs ANPR & color extraction,
    evaluates against the police watchlist, and saves to database.
    Returns list of processed detection dictionaries.
    """
    model = get_yolo_model()
    # Run YOLO detection
    results = model(frame, verbose=False, conf=DETECTION_CONFIDENCE_THRESHOLD)
    
    detections_found = []
    cam_id = camera_info.get("id", "CAM_UNKNOWN")
    cam_name = camera_info.get("name", "Unknown Camera")
    cam_lat = camera_info.get("latitude", 0.0)
    cam_lon = camera_info.get("longitude", 0.0)

    for result in results:
        boxes = result.boxes
        if boxes is None or len(boxes) == 0:
            continue

        for box in boxes:
            cls_id = int(box.cls[0].item())
            if cls_id not in TARGET_CLASSES:
                continue

            obj_class = TARGET_CLASSES[cls_id]
            conf = float(box.conf[0].item())

            xyxy = box.xyxy[0].cpu().numpy().astype(int)
            x1, y1, x2, y2 = xyxy

            # Crop snapshot image
            frame_h, frame_w = frame.shape[:2]
            crop_x1 = max(0, x1)
            crop_y1 = max(0, y1)
            crop_x2 = min(frame_w, x2)
            crop_y2 = min(frame_h, y2)
            crop_img = frame[crop_y1:crop_y2, crop_x1:crop_x2]

            snapshot_rel_path = ""
            if save_snapshots and crop_img.size > 0:
                snap_filename = f"{cam_id}_{int(timestamp_pts)}_{uuid.uuid4().hex[:6]}.jpg"
                snap_full_path = SNAPSHOT_DIR / snap_filename
                cv2.imwrite(str(snap_full_path), crop_img)
                # Store relative path for portability across environments
                snapshot_rel_path = f"data/snapshots/{snap_filename}"

            # ANPR & Color extraction
            anpr_result = extract_plate_and_color(frame, (x1, y1, x2, y2), obj_class)
            plate_text = anpr_result.get("plate_text")
            color = anpr_result.get("color", "Unknown")

            # Watchlist check
            is_watchlist, matched_plate, reason = check_watchlist_match(plate_text)
            if is_watchlist:
                # Format urgent alert print
                alert_banner = (
                    f"\n{'='*70}\n"
                    f"🚨🚨 [POLICE WATCHLIST ALERT] MATCH DETECTED! 🚨🚨\n"
                    f"Plate: {matched_plate} (Read as: {plate_text})\n"
                    f"Location: {cam_name} ({cam_id}) [GPS: {cam_lat:.4f}, {cam_lon:.4f}]\n"
                    f"Timestamp (PTS): {timestamp_pts:.2f} ms | ISO: {timestamp_iso}\n"
                    f"Reason: {reason}\n"
                    f"Snapshot: {snapshot_rel_path}\n"
                    f"{'='*70}\n"
                )
                print(alert_banner)
                logger.warning(alert_banner)

                # Persist to alerts table
                insert_alert(
                    camera_id=cam_id,
                    timestamp_pts=timestamp_pts,
                    timestamp_iso=timestamp_iso,
                    plate_text=matched_plate,
                    reason=reason,
                    snapshot_path=snapshot_rel_path,
                )

            # Persist detection to database
            det_id = insert_detection(
                camera_id=cam_id,
                camera_name=cam_name,
                timestamp_pts=timestamp_pts,
                timestamp_iso=timestamp_iso,
                object_class=obj_class,
                plate_text=plate_text,
                color=color,
                confidence=conf,
                snapshot_path=snapshot_rel_path,
                latitude=cam_lat,
                longitude=cam_lon,
            )

            det_info = {
                "id": det_id,
                "camera_id": cam_id,
                "camera_name": cam_name,
                "bbox": (x1, y1, x2, y2),
                "object_class": obj_class,
                "confidence": conf,
                "plate_text": plate_text,
                "color": color,
                "is_watchlist": is_watchlist,
                "reason": reason,
                "snapshot_path": snapshot_rel_path,
                "timestamp_pts": timestamp_pts,
            }
            detections_found.append(det_info)

    return detections_found
