import sys
import logging
from config import LOCAL_CAMERAS
from database import init_db, get_all_detections, get_all_alerts
from ingestion import process_camera_stream

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(name)s: %(message)s")

def main():
    print("=" * 70)
    print("GUJARAT POLICE SURVEILLANCE GRID: INGESTING ALL 4 CAMERAS")
    print("=" * 70)
    init_db()

    for idx, cam in enumerate(LOCAL_CAMERAS):
        print(f"\n>>> Processing Feed {idx+1}/{len(LOCAL_CAMERAS)}: {cam['name']} ({cam['id']})...")
        res = process_camera_stream(
            camera_info=cam,
            max_frames=45,
            save_annotated_video=True,
            output_filename=f"annotated_{cam['id']}.mp4"
        )
        print(f"Finished {cam['id']}: {res['frames_processed']} frames, {res['detections_count']} detections.")

    total_dets = len(get_all_detections(limit=2000))
    total_alerts = len(get_all_alerts(limit=500))
    print("\n" + "=" * 70)
    print(f"INGESTION COMPLETE:")
    print(f"Total Detections Logged in SQLite: {total_dets}")
    print(f"Total Watchlist Alerts Triggered: {total_alerts}")
    print("=" * 70)

if __name__ == "__main__":
    main()
