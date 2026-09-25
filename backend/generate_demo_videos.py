import cv2
import numpy as np
import os
from pathlib import Path
from config import VIDEO_DIR, DATA_DIR

def draw_hsrp_plate(image, x, y, w, h, text):
    """Draws an authentic Indian HSRP license plate with IND blue strip and crisp black lettering."""
    cv2.rectangle(image, (x, y), (x + w, y + h), (245, 245, 245), -1)
    cv2.rectangle(image, (x, y), (x + w, y + h), (0, 0, 0), 2)
    # Blue IND strip
    strip_w = max(6, int(w * 0.12))
    cv2.rectangle(image, (x, y), (x + strip_w, y + h), (180, 50, 0), -1)
    # Text
    cv2.putText(
        image,
        text,
        (x + strip_w + 6, y + int(h * 0.72)),
        cv2.FONT_HERSHEY_SIMPLEX,
        0.75 * (h / 38.0),
        (0, 0, 0),
        2,
        cv2.LINE_AA,
    )

def recolor_sprite(img_bgr, target_color="white"):
    """Recolors vehicle sprite to White, Red, Blue, or Black."""
    res = img_bgr.copy()
    if target_color == "white":
        hsv = cv2.cvtColor(res, cv2.COLOR_BGR2HSV).astype(np.float32)
        hsv[:, :, 1] = hsv[:, :, 1] * 0.2
        hsv[:, :, 2] = np.clip(hsv[:, :, 2] * 1.3, 0, 255)
        res = cv2.cvtColor(hsv.astype(np.uint8), cv2.COLOR_HSV2BGR)
    elif target_color == "red":
        hsv = cv2.cvtColor(res, cv2.COLOR_BGR2HSV).astype(np.float32)
        hsv[:, :, 0] = 0
        hsv[:, :, 1] = np.clip(hsv[:, :, 1] * 1.5, 120, 255)
        res = cv2.cvtColor(hsv.astype(np.uint8), cv2.COLOR_HSV2BGR)
    elif target_color == "blue":
        hsv = cv2.cvtColor(res, cv2.COLOR_BGR2HSV).astype(np.float32)
        hsv[:, :, 0] = 110
        hsv[:, :, 1] = np.clip(hsv[:, :, 1] * 1.6, 130, 255)
        res = cv2.cvtColor(hsv.astype(np.uint8), cv2.COLOR_HSV2BGR)
    elif target_color == "black":
        res = (res.astype(np.float32) * 0.35).astype(np.uint8)
    return res

def overlay_sprite(background, sprite, x, y):
    """Safely overlays sprite on background image handling clipping."""
    bg_h, bg_w = background.shape[:2]
    sp_h, sp_w = sprite.shape[:2]

    x1_bg = max(0, x)
    y1_bg = max(0, y)
    x2_bg = min(bg_w, x + sp_w)
    y2_bg = min(bg_h, y + sp_h)

    x1_sp = max(0, -x)
    y1_sp = max(0, -y)
    x2_sp = x1_sp + (x2_bg - x1_bg)
    y2_sp = y1_sp + (y2_bg - y1_bg)

    if x2_bg > x1_bg and y2_bg > y1_bg and x2_sp > x1_sp and y2_sp > y1_sp:
        background[y1_bg:y2_bg, x1_bg:x2_bg] = sprite[y1_sp:y2_sp, x1_sp:x2_sp]

def render_camera_clip(
    output_path: Path,
    camera_name: str,
    camera_id: str,
    events: list,
    duration_sec: int = 6,
    fps: int = 15,
):
    """Renders a surveillance camera video feed with realistic photo-composite vehicles and people."""
    width, height = 960, 540
    fourcc = cv2.VideoWriter_fourcc(*"mp4v")
    writer = cv2.VideoWriter(str(output_path), fourcc, float(fps), (width, height))

    # Base sprites
    base_car = cv2.imread(str(DATA_DIR / "car_sprite.jpg"))
    base_person = cv2.imread(str(DATA_DIR / "person_sprite.jpg"))
    base_bus = cv2.imread(str(DATA_DIR / "bus_sprite.jpg"))
    base_moto = cv2.imread(str(DATA_DIR / "motorcycle_sample.jpg")) if (DATA_DIR / "motorcycle_sample.jpg").exists() else None
    base_truck = cv2.imread(str(DATA_DIR / "truck_sample.jpg")) if (DATA_DIR / "truck_sample.jpg").exists() else None
    base_bike = cv2.imread(str(DATA_DIR / "bicycle_sample.jpg")) if (DATA_DIR / "bicycle_sample.jpg").exists() else None

    total_frames = duration_sec * fps

    for frame_idx in range(total_frames):
        t_sec = frame_idx / float(fps)
        pts_ms = t_sec * 1000.0

        # CCTV asphalt roadway
        frame = np.full((height, width, 3), (65, 65, 70), dtype=np.uint8)

        # Sidewalk & Road Curbs
        cv2.rectangle(frame, (0, 0), (width, 85), (110, 115, 115), -1)
        cv2.rectangle(frame, (0, height - 75), (width, height), (110, 115, 115), -1)
        cv2.line(frame, (0, 85), (width, 85), (200, 200, 200), 2)
        cv2.line(frame, (0, height - 75), (width, height - 75), (200, 200, 200), 2)

        # Lane markings
        for y_lane in [220, 340]:
            for lx in range(0, width, 70):
                cv2.line(frame, (lx, y_lane), (lx + 40, y_lane), (220, 220, 220), 2)

        # Surveillance camera watermark HUD
        hud_text = f"GUJARAT POLICE SURVEILLANCE GRID | {camera_id}: {camera_name.upper()} | PTS: {pts_ms:.0f}ms"
        cv2.rectangle(frame, (0, 0), (width, 34), (20, 20, 25), -1)
        cv2.putText(frame, hud_text, (20, 23), cv2.FONT_HERSHEY_SIMPLEX, 0.55, (0, 230, 255), 1, cv2.LINE_AA)

        # Render scheduled vehicle and pedestrian events
        for ev in events:
            start_t = ev["start_time"]
            speed = ev["speed"]
            y_pos = ev["y"]
            obj_type = ev["type"]

            if t_sec >= start_t:
                dt = t_sec - start_t
                x_pos = int(ev.get("start_x", -320) + speed * dt)

                if -400 <= x_pos <= width + 100:
                    if obj_type == "car" and base_car is not None:
                        car_img = cv2.resize(base_car, (ev.get("width", 300), ev.get("height", 240)))
                        car_img = recolor_sprite(car_img, ev.get("color_name", "white"))
                        if ev.get("plate"):
                            pw, ph = 180, 42
                            px = int((car_img.shape[1] - pw) / 2)
                            py = int(car_img.shape[0] * 0.72)
                            draw_hsrp_plate(car_img, px, py, pw, ph, ev["plate"])
                        overlay_sprite(frame, car_img, x_pos, y_pos)

                    elif obj_type == "bus" and base_bus is not None:
                        bus_img = cv2.resize(base_bus, (ev.get("width", 380), ev.get("height", 250)))
                        overlay_sprite(frame, bus_img, x_pos, y_pos)

                    elif obj_type == "truck" and base_truck is not None:
                        truck_img = cv2.resize(base_truck, (ev.get("width", 360), ev.get("height", 250)))
                        overlay_sprite(frame, truck_img, x_pos, y_pos)

                    elif obj_type == "motorcycle" and base_moto is not None:
                        moto_img = cv2.resize(base_moto, (ev.get("width", 220), ev.get("height", 190)))
                        overlay_sprite(frame, moto_img, x_pos, y_pos)

                    elif obj_type == "bicycle" and base_bike is not None:
                        bike_img = cv2.resize(base_bike, (ev.get("width", 200), ev.get("height", 180)))
                        overlay_sprite(frame, bike_img, x_pos, y_pos)

                    elif obj_type == "person" and base_person is not None:
                        person_img = cv2.resize(base_person, (ev.get("width", 110), ev.get("height", 280)))
                        if ev.get("shirt_color") == "red":
                            hsv = cv2.cvtColor(person_img, cv2.COLOR_BGR2HSV).astype(np.float32)
                            hsv[:, :, 0] = 0
                            hsv[:, :, 1] = np.clip(hsv[:, :, 1] * 1.8, 120, 255)
                            person_img = cv2.cvtColor(hsv.astype(np.uint8), cv2.COLOR_HSV2BGR)
                        overlay_sprite(frame, person_img, x_pos, y_pos)

        writer.write(frame)

    writer.release()
    print(f"Generated realistic feed: {output_path}")

def generate_all():
    """Generates all 4 coordinated feeds."""
    VIDEO_DIR.mkdir(parents=True, exist_ok=True)

    # CAM 1: SG Highway - ISKCON Junction
    # Watchlist vehicle GJ01AB1234 (White car) + Blue car GJ01XY9876 + City Bus
    cam1_events = [
        {
            "type": "car",
            "start_time": 0.4,
            "speed": 260,
            "y": 140,
            "color_name": "white",
            "plate": "GJ 01 AB 1234",
            "width": 320,
            "height": 260,
        },
        {
            "type": "bus",
            "start_time": 1.2,
            "speed": 220,
            "y": 100,
            "width": 380,
            "height": 250,
        },
        {
            "type": "car",
            "start_time": 2.2,
            "speed": 250,
            "y": 190,
            "color_name": "blue",
            "plate": "GJ 01 XY 9876",
            "width": 310,
            "height": 250,
        },
    ]
    render_camera_clip(VIDEO_DIR / "cam_01.mp4", "SG Highway - ISKCON Junction", "CAM_01", cam1_events)

    # CAM 2: Pakwan Cross Road
    # Watchlist vehicle GJ05CD5678 (Red car) + Motorcycle + Watchlist GJ01AB1234 (White car)
    cam2_events = [
        {
            "type": "car",
            "start_time": 0.3,
            "speed": 260,
            "y": 150,
            "color_name": "red",
            "plate": "GJ 05 CD 5678",
            "width": 310,
            "height": 250,
        },
        {
            "type": "motorcycle",
            "start_time": 1.2,
            "speed": 280,
            "y": 180,
            "width": 220,
            "height": 190,
        },
        {
            "type": "car",
            "start_time": 2.0,
            "speed": 260,
            "y": 140,
            "color_name": "white",
            "plate": "GJ 01 AB 1234",
            "width": 320,
            "height": 260,
        },
    ]
    render_camera_clip(VIDEO_DIR / "cam_02.mp4", "Pakwan Cross Road", "CAM_02", cam2_events)

    # CAM 3: Shivranjani Cross Road
    # Watchlist vehicle GJ01AB1234 (White car) + Heavy Truck + Suspect pedestrian (Person in red)
    cam3_events = [
        {
            "type": "car",
            "start_time": 0.4,
            "speed": 260,
            "y": 140,
            "color_name": "white",
            "plate": "GJ 01 AB 1234",
            "width": 320,
            "height": 260,
        },
        {
            "type": "truck",
            "start_time": 1.0,
            "speed": 210,
            "y": 110,
            "width": 360,
            "height": 250,
        },
        {
            "type": "person",
            "start_time": 0.8,
            "speed": 100,
            "y": 200,
            "shirt_color": "red",
            "width": 110,
            "height": 280,
        },
    ]
    render_camera_clip(VIDEO_DIR / "cam_03.mp4", "Shivranjani Cross Road", "CAM_03", cam3_events)

    # CAM 4: Nehrunagar Circle
    # Watchlist vehicle GJ05CD5678 (Red car) + Bicycle rider + Suspect pedestrian (Person in red)
    cam4_events = [
        {
            "type": "car",
            "start_time": 0.4,
            "speed": 260,
            "y": 150,
            "color_name": "red",
            "plate": "GJ 05 CD 5678",
            "width": 310,
            "height": 250,
        },
        {
            "type": "bicycle",
            "start_time": 1.0,
            "speed": 130,
            "y": 220,
            "width": 200,
            "height": 180,
        },
        {
            "type": "person",
            "start_time": 0.8,
            "speed": 100,
            "y": 200,
            "shirt_color": "red",
            "width": 110,
            "height": 280,
        },
    ]
    render_camera_clip(VIDEO_DIR / "cam_04.mp4", "Nehrunagar Circle", "CAM_04", cam4_events)

if __name__ == "__main__":
    generate_all()
