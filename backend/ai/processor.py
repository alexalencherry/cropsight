import cv2
import os

def optimize_for_analysis(img_path):
    """
    Prevents Mac memory crashes by ensuring image isn't too large.
    """
    img = cv2.imread(img_path)
    if img is None:
        return False
        
    h, w = img.shape[:2]
    
    # If image is massive, downscale it for the demo
    if max(h, w) > 1500:
        scaling_factor = 1500 / max(h, w)
        new_size = (int(w * scaling_factor), int(h * scaling_factor))
        img = cv2.resize(img, new_size, interpolation=cv2.INTER_AREA)
        cv2.imwrite(img_path, img)
        return True
    return False

def get_tiles(img_path, tile_size=256):
    """
    Splits image into tiles if specific zone-analysis is needed.
    """
    img = cv2.imread(img_path)
    h, w = img.shape[:2]
    tiles = []
    
    for y in range(0, h, tile_size):
        for x in range(0, w, tile_size):
            tile = img[y:y+tile_size, x:x+tile_size]
            tiles.append(tile)
    return tiles