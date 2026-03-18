from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import shutil
import os

from ai import analyze_image
from report import generate_pdf

app = FastAPI(title="CropSight Backend")

# ✅ CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:3000"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ✅ Serve static files (IMPORTANT for images)
app.mount("/static", StaticFiles(directory="storage"), name="static")

UPLOAD_DIR = "storage/uploads"

@app.get("/")
def home():
    return {"status": "Backend running", "message": "Welcome to CropSight API"}

@app.post("/upload")
async def upload(file: UploadFile = File(...)):
    file_path = os.path.join(UPLOAD_DIR, file.filename)

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    return {"file_path": file_path}

@app.post("/analyze")
def analyze(data: dict):
    path = data.get("file_path")

    result = analyze_image(path)

    if "error" in result:
        return result

    severity = result["severity"]

    if severity < 20:
        action = "No spray needed. Crop is healthy."
    elif severity < 50:
        action = "Targeted spraying required in affected zones."
    else:
        action = "Immediate spraying required in multiple zones."

    result["action"] = action

    # ✅ ADD THIS (VERY IMPORTANT)
    result["map_url"] = "http://127.0.0.1:8000/static/outputs/map.png"
    
    # Also provide the mask if it exists
    if "mask_url" in result:
        # Construct the full static URL for the mask
        # Since it's saved next to the original file in storage/uploads
        filename = os.path.basename(result["mask_url"])
        result["mask_url"] = f"http://127.0.0.1:8000/static/uploads/{filename}"

    return result

@app.post("/report")
def report(data: dict):
    severity = data["severity"]
    action = data["action"]

    pdf_path = generate_pdf(severity, action)

    return {"report_path": pdf_path}