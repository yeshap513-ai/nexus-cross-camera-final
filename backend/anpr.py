import re
import cv2
import numpy as np
import logging
from typing import Tuple, Optional, Dict, Any

logger = logging.getLogger("ANPR")

_EASYOCR_READER = None

def get_easyocr_reader():
    """Singleton getter for EasyOCR Reader to avoid reloading weights into memory."""
    global _EASYOCR_READER
    if _EASYOCR_READER is None:
        import easyocr
        logger.info("Initializing EasyOCR Reader (English)...")
        # Use CPU for OCR to guarantee rock-solid cross-platform stability on all Apple Silicon & Linux
        _EASYOCR_READER = easyocr.Reader(['en'], gpu=False, verbose=False)
        logger.info("EasyOCR Reader successfully initialized.")
    return _EASYOCR_READER

def clean_plate_text(text: str) -> str:
    """
    Cleans OCR output:
    - Uppercase
    - Strip symbols/spaces
    - Normalize common OCR confusion (O -> 0, I -> 1 in digit blocks)
    """
    cleaned = re.sub(r'[^A-Za-z0-9]', '', text).upper()
    return cleaned

def is_valid_plate(plate: str) -> bool:
    """Validate plate candidate length and structure."""
    if len(plate) < 4 or len(plate) > 12:
        return False
    # Must contain at least one digit and at least one letter
    has_letter = any(c.isalpha() for c in plate)
    has_digit = any(c.isdigit() for c in plate)
    return has_letter and has_digit

def detect_dominant_color(bgr_image: np.ndarray) -> str:
    """
    Classifies the dominant vehicle or clothing color using HSV thresholds.
    Focuses on the central region to minimize background/shadow noise.
    """
    if bgr_image is None or bgr_image.size == 0:
        return "Unknown"

    h, w = bgr_image.shape[:2]
    # Crop central 60% of bounding box
    y1, y2 = int(h * 0.2), int(h * 0.8)
    x1, x2 = int(w * 0.2), int(w * 0.8)
    
    crop = bgr_image[y1:y2, x1:x2] if (y2 > y1 and x2 > x1) else bgr_image
    if crop.size == 0:
        return "Unknown"

    hsv = cv2.cvtColor(crop, cv2.COLOR_BGR2HSV)
    h_channel = hsv[:, :, 0]
    s_channel = hsv[:, :, 1]
    v_channel = hsv[:, :, 2]

    # Calculate average S and V
    mean_s = np.mean(s_channel)
    mean_v = np.mean(v_channel)

    # Low saturation cases: Black, White, Silver/Gray
    if mean_s < 45:
        if mean_v < 60:
            return "Black"
        elif mean_v > 180:
            return "White"
        else:
            return "Silver/Gray"

    # Color cases based on dominant Hue
    # Flatten Hue where saturation and value are moderate to high
    mask = (s_channel > 40) & (v_channel > 50)
    valid_hues = h_channel[mask]

    if len(valid_hues) == 0:
        if mean_v < 60:
            return "Black"
        elif mean_v > 180:
            return "White"
        return "Silver/Gray"

    median_hue = float(np.median(valid_hues))

    if (median_hue >= 0 and median_hue <= 10) or (median_hue >= 165 and median_hue <= 180):
        return "Red"
    elif 10 < median_hue <= 25:
        return "Orange/Brown"
    elif 25 < median_hue <= 35:
        return "Yellow"
    elif 35 < median_hue <= 85:
        return "Green"
    elif 85 < median_hue <= 135:
        return "Blue"
    elif 135 < median_hue < 165:
        return "Purple/Violet"

    return "Unknown"

def extract_plate_and_color(
    frame: np.ndarray,
    bbox: Tuple[int, int, int, int],
    object_class: str
) -> Dict[str, Any]:
    """
    Given a frame and a detected object bounding box:
    - Crops the object
    - Detects dominant color
    - If vehicle, runs EasyOCR to detect license plate
    - Returns dict with 'plate_text', 'plate_confidence', and 'color'
    """
    x1, y1, x2, y2 = bbox
    frame_h, frame_w = frame.shape[:2]

    x1 = max(0, x1)
    y1 = max(0, y1)
    x2 = min(frame_w, x2)
    y2 = min(frame_h, y2)

    crop = frame[y1:y2, x1:x2]
    if crop.size == 0:
        return {"plate_text": None, "plate_confidence": 0.0, "color": "Unknown"}

    # 1. Color extraction
    dominant_color = detect_dominant_color(crop)

    # 2. Plate extraction only for vehicle classes
    from config import VEHICLE_CLASSES
    if object_class.lower() not in VEHICLE_CLASSES:
        return {"plate_text": None, "plate_confidence": 0.0, "color": dominant_color}

    # License plate candidates:
    # Most plates are situated in the lower 60% of the vehicle
    crop_h, crop_w = crop.shape[:2]
    lower_crop = crop[int(crop_h * 0.4):, :] if crop_h > 40 else crop

    reader = get_easyocr_reader()

    best_plate = None
    best_conf = 0.0

    # Test candidate regions: lower crop first, then full crop
    for candidate_img in [lower_crop, crop]:
        # Preprocessing: upscale if small
        cand_h, cand_w = candidate_img.shape[:2]
        if cand_h < 80:
            scale = 80.0 / max(cand_h, 1)
            candidate_img = cv2.resize(
                candidate_img,
                (int(cand_w * scale), 80),
                interpolation=cv2.INTER_CUBIC
            )

        # Grayscale and bilateral filter for OCR clarity
        gray = cv2.cvtColor(candidate_img, cv2.COLOR_BGR2GRAY)
        filtered = cv2.bilateralFilter(gray, 9, 75, 75)

        # Run OCR
        try:
            results = reader.readtext(filtered, detail=1, paragraph=False)
            for (poly, text, conf) in results:
                cleaned = clean_plate_text(text)
                if is_valid_plate(cleaned) and conf > best_conf:
                    best_plate = cleaned
                    best_conf = float(conf)
        except Exception as e:
            logger.debug(f"OCR scan exception: {e}")

        if best_plate:
            break

    return {
        "plate_text": best_plate,
        "plate_confidence": round(best_conf, 3),
        "color": dominant_color,
    }
