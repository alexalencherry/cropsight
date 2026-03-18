import cv2
import numpy as np

class CropBrain:
    def __init__(self, threshold=0.1):
        self.threshold = threshold

    def analyze(self, img_path):
        # 1. Load image
        img = cv2.imread(img_path)
        if img is None:
            return {"error": "File not found"}

        # 2. Excess Green Index (ExG = 2*G - R - B)
        img_float = img.astype(np.float32) / 255.0
        b, g, r = cv2.split(img_float)
        exg = (2 * g) - r - b

        # 3. Health Scoring
        # Create a mask where White (255) = Stressed Area
        stress_mask = (exg <= self.threshold).astype(np.uint8) * 255
        
        total = stress_mask.size
        stressed_count = np.count_nonzero(stress_mask == 255)
        
        stress_val = (stressed_count / total) * 100
        health_val = 100 - stress_val

        return {
            "overall_health": round(health_val, 2),
            "stress_percentage": round(stress_val, 2),
            "status": "Healthy" if health_val > 75 else "Action Required",
            "recommendation": "Maintain" if health_val > 75 else "Check Irrigation/Nutrients",
            "mask_data": stress_mask
        }

def run_inference(image_path):
    """
    Bridge function for the Backend Engineer to call.
    """
    brain = CropBrain(threshold=0.1)
    results = brain.analyze(image_path)
    
    if "mask_data" in results:
        # Save the mask as a file for the Frontend to load
        mask_path = image_path.replace(".", "_mask.")
        cv2.imwrite(mask_path, results["mask_data"])
        results["mask_url"] = mask_path
        # Remove raw array so JSON doesn't break
        del results["mask_data"]
        
    return results