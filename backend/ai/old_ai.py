import cv2
import numpy as np

OUTPUT_PATH = "storage/outputs/map.png"

def analyze_image(path):
    img = cv2.imread(path)

    if img is None:
        return {"error": "Invalid image"}

    img = cv2.resize(img, (600, 600))

    green = img[:, :, 1]
    norm = green / 255.0

    health_map = np.zeros_like(green)

    health_map[norm > 0.6] = 2
    health_map[(norm > 0.4) & (norm <= 0.6)] = 1
    health_map[norm <= 0.4] = 0

    color_map = np.zeros((600, 600, 3), dtype=np.uint8)
    color_map[health_map == 2] = [0, 255, 0]
    color_map[health_map == 1] = [0, 255, 255]
    color_map[health_map == 0] = [0, 0, 255]

    cv2.imwrite(OUTPUT_PATH, color_map)

    total = health_map.size
    poor = np.sum(health_map == 0)
    moderate = np.sum(health_map == 1)
    healthy = np.sum(health_map == 2)

    severity = (poor / total) * 100

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

    spray_percentage = (poor / total) * 100

    fingerprint = {
        "stress_ratio": float(poor / total),
        "green_mean": float(np.mean(green)),
        "variance": float(np.var(green))
    }

    return {
        "severity": round(severity, 2),
        "zones": {
            "healthy": round((healthy / total) * 100, 2),
            "moderate": round((moderate / total) * 100, 2),
            "poor": round((poor / total) * 100, 2)
        },
        "spray_required_percent": round(spray_percentage, 2),
        "spray_zones": spray_zones,
        "fingerprint": fingerprint,
        "map_path": OUTPUT_PATH
    }