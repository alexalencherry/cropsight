from .engine import CropBrain, run_inference
from .processor import optimize_for_analysis, get_tiles
import cv2
import numpy as np
import os

OUTPUT_PATH = "storage/outputs/map.png"

def analyze_image(path):
    """
    Consolidated analysis function using both original and friend's logic.
    """
    # 1. Optimize image for analysis (Friend's logic)
    optimize_for_analysis(path)

    # 2. Run friend's inference (ExG Index)
    # Using run_inference directly as it handles mask saving
    results = run_inference(path)

    if "error" in results:
        return results

    # 3. Generate the original color map (Original logic)
    img = cv2.imread(path)
    if img is None:
        return {"error": "Invalid image"}

    img_resize = cv2.resize(img, (600, 600))
    green = img_resize[:, :, 1]
    norm = green / 255.0

    health_map = np.zeros_like(green)
    health_map[norm > 0.6] = 2
    health_map[(norm > 0.4) & (norm <= 0.6)] = 1
    health_map[norm <= 0.4] = 0

    color_map = np.zeros((600, 600, 3), dtype=np.uint8)
    color_map[health_map == 2] = [0, 255, 0] # Green
    color_map[health_map == 1] = [0, 255, 255] # Yellow
    color_map[health_map == 0] = [0, 0, 255] # Red

    cv2.imwrite(OUTPUT_PATH, color_map)

    # 4. Calculate grid-based spray zones (Original logic)
    grid_size = 50
    spray_zones = []
    
    for i in range(0, 600, grid_size):
        for j in range(0, 600, grid_size):
            cell = health_map[i:i+grid_size, j:j+grid_size]
            poor_ratio = np.sum(cell == 0) / cell.size
            if poor_ratio > 0.5:
                spray_zones.append({
                    "x": int(i),
                    "y": int(j),
                    "action": "Spray"
                })

    # 5. Combine results
    return {
        "severity": results["stress_percentage"],
        "overall_health": results["overall_health"],
        "status": results["status"],
        "recommendation": results["recommendation"],
        "zones": {
            "healthy": round(results["overall_health"], 2),
            "poor": round(results["stress_percentage"], 2),
            "moderate": 0 
        },
        "spray_required_percent": results["stress_percentage"],
        "spray_zones": spray_zones,
        "mask_url": results.get("mask_url"), # Path to saved mask
        "map_path": OUTPUT_PATH
    }
