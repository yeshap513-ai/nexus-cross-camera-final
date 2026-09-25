#!/usr/bin/env python3
import sys
from pathlib import Path
from database import export_detections_csv
from config import BASE_DIR

def main():
    output_path = BASE_DIR / "detections_export.csv"
    if len(sys.argv) > 1:
        output_path = Path(sys.argv[1])
    
    print(f"Exporting detections to: {output_path}...")
    export_detections_csv(str(output_path))
    print(f"Successfully exported detections to {output_path}")

if __name__ == "__main__":
    main()
