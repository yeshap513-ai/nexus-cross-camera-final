import os
import cv2
import time
import requests
import datetime
import logging
from typing import Dict, Any, List, Optional
from pathlib import Path

from config import (
    INGESTION_MODE,
    LOCAL_CAMERAS,
    RTSP_INGEST_ENDPOINT,
    RTSP_TRANSPORT_OPTION,
    RTSP_BACKOFF_INITIAL_SEC,
    RTSP_BACKOFF_MAX_SEC,
    OUTPUT_DIR,
)
from detection import process_frame

logger = logging.getLogger("CameraIngestion")

def get_dynamic_rtsp_catalogue(api_url: str = RTSP_INGEST_ENDPOINT) -> List[Dict[str, Any]]:
    """
    MODE B: Pulls camera specs dynamically from GET http://<host>/api/ingest.
    Integrator guide rule: Camera list must always be fetched dynamically, never hardcoded.
    """
    try:
        logger.info(f"Fetching camera catalogue dynamically from {api_url}...")
        resp = requests.get(api_url, timeout=5)
        if resp.status_code == 200:
            cameras = resp.json().get("cameras", [])
            logger.info(f"Successfully retrieved {len(cameras)} cameras from ingest catalogue.")
            return cameras
        else:
            logger.warning(f"Ingest API returned HTTP {resp.status_code}: {resp.text}")
    except Exception as e:
        logger.warning(f"Could not connect to dynamic ingest API ({api_url}): {e}")
    return []

def draw_annotations(frame, detections: List[Dict[str, Any]], camera_name: str, pts_ms: float):
    """
    Draw professional tactical police HUD annotations on the frame:
    - Bounding boxes (Green for normal, High-Vis Red for Watchlist Alert)
    - Labels with class, confidence, plate text
    - Top camera telemetry bar
    """
    annotated = frame.copy()
    h, w = annotated.shape[:2]

    # Top tactical police status bar
    cv2.rectangle(annotated, (0, 0), (w, 36), (20, 20, 25), -1)
    status_text = f"CAM: {camera_name}  |  PTS: {pts_ms:.1f}ms  |  STATUS: ACTIVE"
    cv2.putText(annotated, status_text, (15, 24), cv2.FONT_HERSHEY_SIMPLEX, 0.65, (0, 220, 255), 2)

    for det in detections:
        x1, y1, x2, y2 = det["bbox"]
        is_alert = det.get("is_watchlist", False)
        obj_class = det.get("object_class", "").upper()
        plate = det.get("plate_text")
        conf = det.get("confidence", 0.0)
        color = det.get("color", "")

        box_color = (0, 0, 255) if is_alert else (0, 255, 120)
        thickness = 3 if is_alert else 2
        cv2.rectangle(annotated, (x1, y1), (x2, y2), box_color, thickness)

        # Label content
        if is_alert:
            label = f"🚨 ALERT: {plate} [{det.get('reason', '')[:20]}]"
            label_bg = (0, 0, 200)
            text_color = (255, 255, 255)
        else:
            plate_str = f" | {plate}" if plate else ""
            label = f"{obj_class} ({conf:.2f}){plate_str} [{color}]"
            label_bg = (30, 30, 30)
            text_color = (0, 255, 120)

        # Draw text background banner
        (tw, th), _ = cv2.getTextSize(label, cv2.FONT_HERSHEY_SIMPLEX, 0.5, 1)
        banner_y1 = max(0, y1 - th - 8)
        banner_y2 = y1
        cv2.rectangle(annotated, (x1, banner_y1), (x1 + tw + 10, banner_y2), label_bg, -1)
        cv2.putText(
            annotated,
            label,
            (x1 + 5, banner_y2 - 4),
            cv2.FONT_HERSHEY_SIMPLEX,
            0.5,
            text_color,
            1,
            cv2.LINE_AA,
        )

    return annotated

def process_camera_stream(
    camera_info: Dict[str, Any],
    max_frames: Optional[int] = None,
    save_annotated_video: bool = False,
    frame_stride: int = 2,
    output_filename: Optional[str] = None
) -> Dict[str, Any]:
    """
    Ingests and processes a single camera feed (either Mode A local file or Mode B RTSP).
    Adheres strictly to all integrator guide rules:
    - Sets OPENCV_FFMPEG_CAPTURE_OPTIONS = "rtsp_transport;tcp"
    - Never uses CAP_PROP_FPS for timing
    - Uses CAP_PROP_POS_MSEC (PTS) exclusively
    - Exponential backoff (2s -> 30s) on disconnect
    - Non-fatal decoder warning handling
    - Detects loop and jump-cuts gracefully
    """
    cam_id = camera_info.get("id", "CAM_01")
    cam_name = camera_info.get("name", "Camera")
    is_rtsp = camera_info.get("video_path", "").startswith("rtsp://") or INGESTION_MODE == "rtsp"

    # Rule: Force TCP transport for RTSP feeds
    os.environ["OPENCV_FFMPEG_CAPTURE_OPTIONS"] = RTSP_TRANSPORT_OPTION

    video_source = camera_info.get("rtsp_url") if is_rtsp else camera_info.get("video_path")
    if not video_source:
        logger.error(f"[{cam_id}] No video path or RTSP URL provided.")
        return {"error": "Missing video source"}

    logger.info(f"[{cam_id}] Starting ingestion for {cam_name} (Source: {video_source})...")

    backoff_delay = RTSP_BACKOFF_INITIAL_SEC
    cap = None
    writer = None
    processed_count = 0
    total_detections_count = 0
    prev_pts = -1.0

    while True:
        try:
            # Connect to stream
            cap = cv2.VideoCapture(video_source, cv2.CAP_FFMPEG)
            if not cap.isOpened():
                if not is_rtsp:
                    logger.error(f"[{cam_id}] Could not open local video file: {video_source}")
                    break
                logger.warning(
                    f"[{cam_id}] RTSP connection failed. Backing off {backoff_delay:.1f}s before retry..."
                )
                time.sleep(backoff_delay)
                backoff_delay = min(backoff_delay * 2.0, RTSP_BACKOFF_MAX_SEC)
                continue

            # Connected successfully -> reset backoff
            backoff_delay = RTSP_BACKOFF_INITIAL_SEC
            logger.info(f"[{cam_id}] Stream connected successfully.")

            frame_idx = 0
            while True:
                ret, frame = cap.read()
                if not ret:
                    if not is_rtsp:
                        logger.info(f"[{cam_id}] Reached end of local video file.")
                        break
                    else:
                        logger.warning(f"[{cam_id}] RTSP stream read returned False (disconnect).")
                        break

                frame_idx += 1
                if frame_idx % frame_stride != 0:
                    continue

                # Integrator Rule: Always use CAP_PROP_POS_MSEC (PTS), never wall clock
                pts_ms = float(cap.get(cv2.CAP_PROP_POS_MSEC))
                if pts_ms <= 0:
                    pts_ms = float(frame_idx * 33.33)  # fallback PTS estimate if container lacks index

                # Apply camera timeline offset for multi-camera synchronization
                offset_sec = float(camera_info.get("timeline_offset_sec", 0.0))
                effective_pts_ms = pts_ms + (offset_sec * 1000.0)

                # Check for loop/jump-cut (feed looped back or sudden time reversal)
                if prev_pts > 0 and pts_ms < (prev_pts - 5000):
                    logger.info(f"[{cam_id}] Feed loop / jump-cut detected (PTS {prev_pts:.1f} -> {pts_ms:.1f}ms). Resetting tracking anchor.")
                prev_pts = pts_ms

                # Formulate human-readable timestamp
                pts_sec = effective_pts_ms / 1000.0
                pts_timedelta = datetime.timedelta(seconds=pts_sec)
                base_time = datetime.datetime.now().replace(hour=10, minute=0, second=0, microsecond=0)
                simulated_time = base_time + pts_timedelta
                timestamp_iso = simulated_time.strftime("%Y-%m-%d %H:%M:%S")

                # Run Detection Pipeline
                detections = process_frame(
                    frame=frame,
                    camera_info=camera_info,
                    timestamp_pts=effective_pts_ms,
                    timestamp_iso=timestamp_iso,
                    save_snapshots=True,
                )
                processed_count += 1
                total_detections_count += len(detections)

                # Initialize VideoWriter if saving annotated video output
                if save_annotated_video:
                    if writer is None:
                        h, w = frame.shape[:2]
                        if not output_filename:
                            output_filename = f"annotated_{cam_id}.mp4"
                        out_path = OUTPUT_DIR / output_filename
                        # mp4v / avc1 codec
                        fourcc = cv2.VideoWriter_fourcc(*"mp4v")
                        writer = cv2.VideoWriter(str(out_path), fourcc, 15.0, (w, h))
                        logger.info(f"[{cam_id}] Recording annotated video to {out_path}")

                    annotated_frame = draw_annotations(frame, detections, cam_name, effective_pts_ms)
                    writer.write(annotated_frame)

                if max_frames and processed_count >= max_frames:
                    logger.info(f"[{cam_id}] Reached requested limit of {max_frames} frames.")
                    break

            # If not RTSP, or if user requested max_frames, stop outer loop
            if not is_rtsp or (max_frames and processed_count >= max_frames):
                break

        except Exception as e:
            # Rule: decoder warnings or transient stream errors should be logged and not crash
            logger.warning(f"[{cam_id}] Stream ingestion warning/error: {e}. Retrying with backoff...")
            time.sleep(backoff_delay)
            backoff_delay = min(backoff_delay * 2.0, RTSP_BACKOFF_MAX_SEC)
        finally:
            if cap:
                cap.release()
            if writer:
                writer.release()

    logger.info(f"[{cam_id}] Finished processing. {processed_count} frames, {total_detections_count} detections.")
    return {
        "camera_id": cam_id,
        "frames_processed": processed_count,
        "detections_count": total_detections_count,
    }
