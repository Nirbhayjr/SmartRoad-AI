from typing import List
from pydantic import BaseModel
from fastapi import FastAPI, File, UploadFile, HTTPException, Form, Request, Body
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from ultralytics import YOLO
import cv2
import numpy as np
import os
from datetime import datetime
import base64
import tempfile
import json
import hashlib
import secrets
import uuid
import urllib.request
import io
import zipfile

# Initialize the app
app = FastAPI(title="SmartRoad API", version="1.0.0")

# Serve saved results (images/videos) as static files so frontend can fetch them
from fastapi.staticfiles import StaticFiles
app.mount("/results", StaticFiles(directory=os.path.join(os.getcwd(), "results")), name="results")
# Serve custom alert sounds placed in backend/static/sounds
os.makedirs(os.path.join(os.getcwd(), "static", "sounds"), exist_ok=True)
app.mount("/sounds", StaticFiles(directory=os.path.join(os.getcwd(), "static", "sounds")), name="sounds")

# Add CORS middleware to allow frontend requests
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load YOLO model
try:
    # Force YOLO to load on CPU to avoid allocating memory for GPU context
    # Use task='detect' and avoid loading half-precision unless specified.
    import torch
    device = "cpu"
    # To reduce memory usage, we disable some heavy caches if possible
    model = YOLO("pothole.pt")
    model.to(device)
except Exception as e:
    print(f"Warning: model loading error: {e}. Using generic yolov8n.pt")
    # yolov8n is ultra-lightweight
    model = YOLO("yolov8n.pt")
    model.to("cpu")
# ================= ADMIN DASHBOARD MEMORY STORAGE =================

dashboard_data = {
    "total_uploads": 0,
    "total_detections": 0,
    "minor": 0,
    "moderate": 0,
    "major": 0,
    "reports": []   # store full report objects
}  

# Ensure results folders exist
os.makedirs(os.path.join(os.getcwd(), "results", "images"), exist_ok=True)
os.makedirs(os.path.join(os.getcwd(), "results", "videos"), exist_ok=True)

# Helper function to classify severity based on area
def classify_severity(area):
    if area < 5000:
        return "Minor"
    elif area < 20000:
        return "Moderate"
    else:
        return "Major"

# Helper function to get color based on severity
def get_severity_color(severity):
    colors = {
        "Minor": (0, 255, 0),      # Green
        "Moderate": (0, 255, 255),  # Yellow
        "Major": (0, 0, 255)        # Red
    }
    return colors.get(severity, (0, 255, 0))

# Helper function to detect potholes in frame/image
def detect_potholes(image_array):
    """Run YOLO detection on image and return results"""
    results = model(image_array)
    detections = []
    # Allowed class names for potholes (update if your model uses a different label)
    ALLOWED_CLASSES = {"pothole", "potholes"}
   
    for r in results:
        # r.names maps class indices to names for this result/model
        names_map = getattr(r, 'names', None) or getattr(model, 'names', {})

        for box in r.boxes:
            # optional: check predicted class if available
            class_id = None
            try:
                class_id = int(box.cls[0])
            except Exception:
                class_id = None

            class_name = None
            if class_id is not None and names_map is not None:
                class_name = names_map.get(class_id, None)

            # Require a class name and skip if it's not a pothole
            if not class_name or class_name.lower() not in ALLOWED_CLASSES:
                continue

            x1, y1, x2, y2 = box.xyxy[0]
            conf = float(box.conf[0])

            x1, y1, x2, y2 = int(x1), int(y1), int(x2), int(y2)

            # Calculate area
            width = x2 - x1
            height = y2 - y1
            area = width * height

            severity = classify_severity(area)

            detections.append({
                "bbox": [x1, y1, x2, y2],
                "confidence": round(conf, 2),
                "area": area,
                "severity": severity,
                "width": width,
                "height": height
            })
   
    return detections

# Helper function to draw detections on image
def draw_detections(image, detections):
    """Draw bounding boxes and labels on image"""
    for detection in detections:
        x1, y1, x2, y2 = detection["bbox"]
        severity = detection["severity"]
        conf = detection["confidence"]
       
        color = get_severity_color(severity)
       
        # Draw bounding box
        cv2.rectangle(image, (x1, y1), (x2, y2), color, 2)
       
        # Put label
        label = f"{severity} ({conf:.2f})"
        cv2.putText(image, label, (x1, y1 - 10),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.6, color, 2)
   
    return image

# Helper function to convert image to base64
def image_to_base64(image_array):
    """Convert numpy array to base64 string"""
    _, buffer = cv2.imencode('.jpg', image_array)
    return base64.b64encode(buffer).decode('utf-8')


def parse_coords_from_string(s):
    """Try to parse latitude and longitude from a free-form string.
    Returns (lat, lng) as floats or (None, None) if not found.
    """
    if not s or not isinstance(s, str):
        return None, None
    import re
    # find sequences that look like floats (with optional sign and decimals)
    nums = re.findall(r"[-+]?[0-9]*\.?[0-9]+", s)
    if len(nums) >= 2:
        try:
            a = float(nums[0])
            b = float(nums[1])
            # Heuristic: lat must be between -90 and 90, lng between -180 and 180
            if -90 <= a <= 90 and -180 <= b <= 180:
                return a, b
            if -90 <= b <= 90 and -180 <= a <= 180:
                return b, a
        except Exception:
            return None, None
    return None, None


# ----------------- Simple user store -----------------
USERS_FILE = os.path.join(os.getcwd(), "users.json")

def load_users():
    try:
        with open(USERS_FILE, 'r', encoding='utf-8') as f:
            return json.load(f)
    except Exception:
        return []

def save_users(users):
    with open(USERS_FILE, 'w', encoding='utf-8') as f:
        json.dump(users, f, indent=2)


def find_user_by_token(token: str):
    if not token:
        return None
    users = load_users()
    for u in users:
        if u.get('token') == token:
            return u
    return None


def credit_user_by_token(token: str, coins: int, meta: dict = None):
    if not token or coins <= 0:
        return None
    users = load_users()
    for u in users:
        if u.get('token') == token:
            u['coins'] = int(u.get('coins', 0)) + int(coins)
            uploads = u.get('uploads') or []
            entry = {
                'id': uuid.uuid4().hex,
                'timestamp': datetime.now().isoformat(),
                'coins': int(coins),
                'meta': meta or {}
            }
            uploads.append(entry)
            u['uploads'] = uploads
            save_users(users)
            return u
    return None

def hash_password(password, salt=None):
    if salt is None:
        salt = secrets.token_hex(16)
    pwd = hashlib.pbkdf2_hmac('sha256', password.encode('utf-8'), salt.encode('utf-8'), 100000)
    return salt, pwd.hex()

def verify_password(password, salt, pwd_hash):
    _, h = hash_password(password, salt)
    return h == pwd_hash

# Create users file if missing
if not os.path.exists(USERS_FILE):
    save_users([])

# ============== ROOT ENDPOINTS ==============

@app.get("/")
def read_root():
    return {
        "message": "SmartRoad Backend API",
        "version": "1.0.0",
        "endpoints": {
            "demo": "/demo",
            "detect_image": "/detect/image",
            "detect_video": "/detect/video",
            "health": "/health"
        }
    }

@app.get("/demo")
def read_demo():
    """Demo endpoint"""
    return {
        "success": True,
        "message": "SmartRoad Backend is working!",
        "data": {
            "timestamp": datetime.now().isoformat(),
            "status": "Backend API is connected",
            "serverInfo": {
                "name": "SmartRoad Backend",
                "version": "1.0.0",
                "type": "FastAPI"
            }
        }
    }

@app.get("/health")
def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "model_loaded": model is not None,
        "timestamp": datetime.now().isoformat()
    }

# ============== IMAGE DETECTION ENDPOINTS ==============

@app.post("/detect/image")
async def detect_image(
    file: UploadFile = File(...),
    latitude: str = Form(None),
    longitude: str = Form(None),
    description: str = Form(None),
    is_critical: str = Form(None),
    token: str = Form(None),
    request: Request = None,
):
    """
    Detect potholes in uploaded image
   
    Returns:
    - detections: List of detected potholes with coordinates and severity
    - image_with_detections: Base64 encoded image with drawn detections
    - statistics: Summary of detections
    """
   
    try:
        # Read uploaded file
        contents = await file.read()
        nparr = np.frombuffer(contents, np.uint8)
        image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

        # Save original upload to results/images
        try:
            fname = f"{int(datetime.now().timestamp())}_{file.filename}"
            save_path = os.path.join(os.getcwd(), "results", "images", fname)
            with open(save_path, "wb") as f:
                f.write(contents)
        except Exception:
            save_path = None
       
        if image is None:
            raise HTTPException(status_code=400, detail="Invalid image file")
       
        # Detect potholes
        detections = detect_potholes(image)
       
        # Draw detections on image
        image_with_detections = draw_detections(image.copy(), detections)
       
        # Convert to base64
        image_base64 = image_to_base64(image_with_detections)
       
        # Cache dimensions before GC cleanup
        image_height = image.shape[0]
        image_width = image.shape[1]

        # Manual GC to keep RAM usage under 512MB for free tier Render
        import gc
        del image
        del nparr
        gc.collect()

        # Calculate statistics
        severity_count = {
            "Minor": len([d for d in detections if d["severity"] == "Minor"]),
            "Moderate": len([d for d in detections if d["severity"] == "Moderate"]),
            "Major": len([d for d in detections if d["severity"] == "Major"])
        }
        # ================= UPDATE ADMIN DASHBOARD =================

        dashboard_data["total_uploads"] += 1
        dashboard_data["total_detections"] += len(detections)
        dashboard_data["minor"] += severity_count["Minor"]
        dashboard_data["moderate"] += severity_count["Moderate"]
        dashboard_data["major"] += severity_count["Major"]

        # Build report entry including location if provided
        try:
            lat = float(latitude) if latitude not in (None, "") else None
        except Exception:
            lat = None
        try:
            lng = float(longitude) if longitude not in (None, "") else None
        except Exception:
            lng = None

        # If lat/lng not provided, attempt to parse from description (or free-form location text)
        if (lat is None or lng is None) and description:
            p_lat, p_lng = parse_coords_from_string(description)
            if p_lat is not None and p_lng is not None:
                lat, lng = p_lat, p_lng

        # Prefer coordinates for location when available; keep original description separately
        location_str = f"{lat},{lng}" if lat is not None and lng is not None else (description or "Unknown Road")

        # Resolve uploader from token (form token or Authorization header)
        auth_token = token
        if not auth_token and request is not None:
            auth_hdr = request.headers.get('authorization') or request.headers.get('Authorization')
            if auth_hdr and isinstance(auth_hdr, str) and auth_hdr.lower().startswith('bearer '):
                auth_token = auth_hdr.split(' ', 1)[1].strip()

        uploader = None
        try:
            uploader = find_user_by_token(auth_token) if auth_token else None
        except Exception:
            uploader = None

        report = {
            "id": len(dashboard_data["reports"]) + 1,
            "type": "image",
            "source": "user",
            "location": location_str,
            "description": description,
            "status": "In Review",
            "progress": 25,
            "detections": len(detections),
            "severity": severity_count,
            "timestamp": datetime.now().isoformat(),
            "lat": lat,
            "lng": lng,
            "image_path": save_path,
            "image_with_detections": image_base64,
            # uploader info (if authenticated)
            "uploader_id": uploader.get('id') if uploader else None,
            "uploader_name": uploader.get('name') if uploader else "Anonymous",
            "verified": bool(uploader),
        }

        # If no detections, add a note so frontends can display a friendly message
        if len(detections) == 0:
            report["note"] = "No potholes detected in the submitted image."

        dashboard_data["reports"].append(report)
       
       
        # Credit coins to user if authenticated and detections found
        no_potholes = len(detections) == 0
        try:
            # try token from form first, then header Authorization
            auth_token = token
            if not auth_token and request is not None:
                auth_hdr = request.headers.get('authorization') or request.headers.get('Authorization')
                if auth_hdr and auth_hdr.lower().startswith('bearer '):
                    auth_token = auth_hdr.split(' ', 1)[1].strip()

            if auth_token and not no_potholes:
                # award 10 coins for image reports that contain detections
                credit_user_by_token(auth_token, 10, { 'report_id': report.get('id'), 'type': 'image', 'detections': len(detections) })
        except Exception:
            pass
        return {
            "success": True,
            "message": "No potholes detected" if no_potholes else "Image detection completed",
            "no_potholes": no_potholes,
            "detections": detections,
            "image_with_detections": image_base64,
            "statistics": {
                "total_detections": len(detections),
                "severity_breakdown": severity_count,
                "image_height": image_height,
                "image_width": image_width
            },
            "timestamp": datetime.now().isoformat()
        }
   
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing image: {str(e)}")


@app.post("/detect/url-image")
async def detect_image_from_url(body: dict = Body(...), request: Request = None):
    """Fetch an image from a remote URL and run detection."""
    try:
        image_url = body.get('image_url') if isinstance(body, dict) else None
        if not image_url:
            raise HTTPException(status_code=400, detail="image_url is required")

        # Download image bytes
        try:
            with urllib.request.urlopen(image_url, timeout=15) as resp:
                contents = resp.read()
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Failed to download image: {str(e)}")

        nparr = np.frombuffer(contents, np.uint8)
        image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        if image is None:
            raise HTTPException(status_code=400, detail="Downloaded file is not a valid image")

        detections = detect_potholes(image)
        image_with_detections = draw_detections(image.copy(), detections)
        image_base64 = image_to_base64(image_with_detections)

        # Cache dimensions before GC cleanup
        image_height = image.shape[0]
        image_width = image.shape[1]

        # Manual garbage collection to prevent memory ballooning on 512MB Render instances
        import gc
        del image
        del nparr
        gc.collect()

        severity_count = {
            "Minor": len([d for d in detections if d["severity"] == "Minor"]),
            "Moderate": len([d for d in detections if d["severity"] == "Moderate"]),
            "Major": len([d for d in detections if d["severity"] == "Major"])
        }

        return {
            "success": True,
            "message": "Image detection completed",
            "detections": detections,
            "image_with_detections": image_base64,
            "statistics": {
                "total_detections": len(detections),
                "severity_breakdown": severity_count,
                "image_height": image_height,
                "image_width": image_width
            },
            "timestamp": datetime.now().isoformat()
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing url image: {str(e)}")


@app.post("/detect/batch")
async def detect_batch(
    file: UploadFile = File(None),
    zip_url: str = Form(None)
):
    """Process a batch ZIP (uploaded file or remote zip URL). Returns per-image results and a summary."""
    try:
        # Read zip bytes from upload or URL
        if file is not None:
            contents = await file.read()
        elif zip_url:
            try:
                with urllib.request.urlopen(zip_url, timeout=30) as resp:
                    contents = resp.read()
            except Exception as e:
                raise HTTPException(status_code=400, detail=f"Failed to download zip: {str(e)}")
        else:
            raise HTTPException(status_code=400, detail="Provide an uploaded zip file or zip_url")

        # Open zip
        try:
            zf = zipfile.ZipFile(io.BytesIO(contents))
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Invalid ZIP archive: {str(e)}")

        image_files = [n for n in zf.namelist() if n.lower().endswith(('.jpg', '.jpeg', '.png'))]
        results = []
        max_process = 200
        processed = 0

        for name in image_files:
            if processed >= max_process:
                break
            try:
                data = zf.read(name)
                nparr = np.frombuffer(data, np.uint8)
                image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
                if image is None:
                    continue

                detections = detect_potholes(image)
                annotated = draw_detections(image.copy(), detections)
                annotated_b64 = image_to_base64(annotated)

                # Cache shape before GC
                image_width = image.shape[1]
                image_height = image.shape[0]

                import gc
                del image
                del nparr
                gc.collect()

                results.append({
                    'filename': name,
                    'detections': detections,
                    'image_with_detections': annotated_b64,
                    'statistics': {
                        'total_detections': len(detections),
                        'image_width': image_width,
                        'image_height': image_height
                    }
                })
                processed += 1
            except Exception:
                continue

        summary = {
            'processed': processed,
            'total_files_in_zip': len(image_files),
            'successful': len(results)
        }

        return {
            'success': True,
            'summary': summary,
            'results': results,
            'timestamp': datetime.now().isoformat()
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Batch processing error: {str(e)}")

# ============== VIDEO DETECTION ENDPOINTS ==============

@app.post("/detect/video")
async def detect_video(
    file: UploadFile = File(...),
    latitude: str = Form(None),
    longitude: str = Form(None),
    description: str = Form(None),
    is_critical: str = Form(None),
    token: str = Form(None),
    request: Request = None,
):
    """
    Detect potholes in uploaded video
    Processes frames and deduplicates similar detections across frames
   
    Returns:
    - detections: Unique potholes detected
    - statistics: Summary statistics
    """
   
    try:
        # Create a unique report id and artifact directory for provenance/evidence
        report_id = uuid.uuid4().hex
        artifacts_dir = os.path.join(os.getcwd(), "results", "artifacts", report_id)
        os.makedirs(artifacts_dir, exist_ok=True)
        os.makedirs(os.path.join(artifacts_dir, "thumbs"), exist_ok=True)

        # Read and save uploaded video
        contents = await file.read()
        with tempfile.NamedTemporaryFile(delete=False, suffix=".mp4") as tmp_file:
            tmp_file.write(contents)
            tmp_path = tmp_file.name

        # Also persist a copy to results/videos
        try:
            vname = f"{int(datetime.now().timestamp())}_{file.filename}"
            save_vpath = os.path.join(os.getcwd(), "results", "videos", vname)
            with open(save_vpath, "wb") as vf:
                vf.write(contents)
        except Exception:
            save_vpath = None
        # Also save a copy into artifacts for provenance
        try:
            art_orig = os.path.join(artifacts_dir, "original.mp4")
            with open(art_orig, "wb") as af:
                af.write(contents)
        except Exception:
            art_orig = None
       
        # Open video
        cap = cv2.VideoCapture(tmp_path)
       
        if not cap.isOpened():
            raise HTTPException(status_code=400, detail="Invalid video file")
       
        fps = cap.get(cv2.CAP_PROP_FPS)
        total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
       
        frame_count = 0
        processed_frames = 0
        all_detections = []
        max_detections_per_frame = 0
        # Prepare annotated video writer (write resized frames as processed)
        annotated_tmp = os.path.join(artifacts_dir, "annotated.mp4")
        fourcc = cv2.VideoWriter_fourcc(*'mp4v')
        writer = cv2.VideoWriter(annotated_tmp, fourcc, max(1.0, fps or 10.0), (640, 480))

        # Per-frame log for provenance
        per_frame_logs = []
       
        while True:
            ret, frame = cap.read()
            if not ret:
                break
           
            frame_count += 1
           
            # Process every 3rd frame for performance (reduces redundant detections)
            if frame_count % 3 != 0:
                continue
           
            processed_frames += 1
           
            # Resize frame for faster processing
            frame = cv2.resize(frame, (640, 480))
           
            # Detect potholes in this frame
            frame_detections = detect_potholes(frame)

            # Draw detections on a copy and write to annotated video for evidence
            try:
                annotated_frame = draw_detections(frame.copy(), frame_detections)
            except Exception:
                annotated_frame = frame
            try:
                writer.write(annotated_frame)
            except Exception:
                pass

            # Add entry(s) to per-frame log
            if frame_detections:
                max_detections_per_frame = max(max_detections_per_frame, len(frame_detections))
                # attach frame reference and frame_index to each detection for preview generation
                for det in frame_detections:
                    det['frame'] = frame.copy()
                    det['frame_index'] = frame_count
                all_detections.extend(frame_detections)
                try:
                    entry = {"frame_index": frame_count, "detections": []}
                    for fd in frame_detections:
                        entry["detections"].append({
                            "bbox": fd.get("bbox"),
                            "confidence": fd.get("confidence"),
                            "area": fd.get("area"),
                            "severity": fd.get("severity"),
                        })
                    per_frame_logs.append(entry)
                except Exception:
                    pass
            
            # Manual GC to prevent memory overflow on 512MB RAM instances
            import gc
            del frame
            del annotated_frame
            gc.collect()
       
        cap.release()
        try:
            writer.release()
        except Exception:
            pass
       
        # Clean up temporary file
        os.unlink(tmp_path)
       
        # Deduplicate detections - assume similar boxes in consecutive frames are same pothole
        # Group by approximate location and take average
        unique_detections = []
        used_indices = set()
       
        # Helper to create a cropped, annotated thumbnail from a frame and bbox
        def frame_crop_base64(frame_img, bbox, padding=12, max_width=640):
            h, w = frame_img.shape[:2]
            x1, y1, x2, y2 = bbox
            x1 = max(0, x1 - padding)
            y1 = max(0, y1 - padding)
            x2 = min(w, x2 + padding)
            y2 = min(h, y2 + padding)
            crop = frame_img[y1:y2, x1:x2]
            if crop.size == 0:
                return None
            # draw bbox relative to crop
            rel_bbox = [padding, padding, (x2 - x1) - padding, (y2 - y1) - padding]
            try:
                crop_annot = draw_detections(crop.copy(), [{"bbox": [0, 0, crop.shape[1], crop.shape[0]], "severity": classify_severity((crop.shape[1]*crop.shape[0])), "confidence": 1.0}])
            except Exception:
                crop_annot = crop
            _, buffer = cv2.imencode('.jpg', crop_annot)
            return base64.b64encode(buffer).decode('utf-8')

        for i, det1 in enumerate(all_detections):
            if i in used_indices:
                continue
           
            # Start a cluster with this detection
            cluster = [det1]
            used_indices.add(i)
           
            x1_1, y1_1, x2_1, y2_1 = det1["bbox"]
            center_x1 = (x1_1 + x2_1) / 2
            center_y1 = (y1_1 + y2_1) / 2
           
            # Find similar detections nearby
            for j, det2 in enumerate(all_detections[i+1:], start=i+1):
                if j in used_indices:
                    continue
               
                x1_2, y1_2, x2_2, y2_2 = det2["bbox"]
                center_x2 = (x1_2 + x2_2) / 2
                center_y2 = (y1_2 + y2_2) / 2
               
                # If centers are close (within 50 pixels), consider them same pothole
                distance = ((center_x1 - center_x2) ** 2 + (center_y1 - center_y2) ** 2) ** 0.5
                if distance < 50:
                    cluster.append(det2)
                    used_indices.add(j)
           
            # Average the cluster to get final detection
            avg_x1 = sum(d["bbox"][0] for d in cluster) / len(cluster)
            avg_y1 = sum(d["bbox"][1] for d in cluster) / len(cluster)
            avg_x2 = sum(d["bbox"][2] for d in cluster) / len(cluster)
            avg_y2 = sum(d["bbox"][3] for d in cluster) / len(cluster)
            avg_conf = sum(d["confidence"] for d in cluster) / len(cluster)
           
            width = avg_x2 - avg_x1
            height = avg_y2 - avg_y1
            area = width * height
            severity = classify_severity(area)
           
            # choose representative detection for preview (first in cluster)
            rep = cluster[0]
            rep_frame = rep.get('frame', None)

            # build preview image for this cluster if we have a frame
            preview_b64 = None
            if rep_frame is not None:
                try:
                    preview_b64 = frame_crop_base64(rep_frame, [int(avg_x1), int(avg_y1), int(avg_x2), int(avg_y2)])
                except Exception:
                    preview_b64 = None

            unique_detections.append({
                "bbox": [int(avg_x1), int(avg_y1), int(avg_x2), int(avg_y2)],
                "confidence": round(avg_conf, 2),
                "area": int(area),
                "severity": severity,
                "width": int(width),
                "height": int(height),
                "occurrences": len(cluster),  # How many frames this pothole appeared in
                "preview_image": preview_b64,
                "frame_index": rep.get('frame_index', None),
                "sample_description": description
            })
       
        # Calculate statistics
        severity_count = {
            "Minor": len([d for d in unique_detections if d["severity"] == "Minor"]),
            "Moderate": len([d for d in unique_detections if d["severity"] == "Moderate"]),
            "Major": len([d for d in unique_detections if d["severity"] == "Major"])
        }
        # ================= UPDATE ADMIN DASHBOARD =================

        dashboard_data["total_uploads"] += 1
        dashboard_data["total_detections"] += len(unique_detections)
        dashboard_data["minor"] += severity_count["Minor"]
        dashboard_data["moderate"] += severity_count["Moderate"]
        dashboard_data["major"] += severity_count["Major"]

        # Build report entry including location if provided
        try:
            lat = float(latitude) if latitude not in (None, "") else None
        except Exception:
            lat = None
        try:
            lng = float(longitude) if longitude not in (None, "") else None
        except Exception:
            lng = None

        # If lat/lng not provided, attempt to parse from description (or free-form location text)
        if (lat is None or lng is None) and description:
            p_lat, p_lng = parse_coords_from_string(description)
            if p_lat is not None and p_lng is not None:
                lat, lng = p_lat, p_lng

        # Prefer coordinates for location when available; keep original description separately
        location_str = f"{lat},{lng}" if lat is not None and lng is not None else (description or "Unknown Road")

        # Build previews list from unique_detections (if detection objects include preview_image)
        previews = []
        for ud in unique_detections:
            if ud.get('preview_image'):
                previews.append({
                    'preview_image': f"data:image/jpeg;base64,{ud['preview_image']}",
                    'frame_index': ud.get('frame_index'),
                    'severity': ud.get('severity'),
                    'occurrences': ud.get('occurrences')
                })

        # Save detection log and thumbnails into artifacts dir for verifiable evidence
        detection_log = {
            "report_id": report_id,
            "timestamp": datetime.now().isoformat(),
            "model": {
                "name": getattr(model, 'model', str(model)) if model is not None else 'unknown',
                "weights": getattr(model, 'yaml', None) or getattr(model, 'path', None) or None
            },
            "video_info": {
                "total_frames": total_frames,
                "processed_frames": processed_frames,
                "fps": fps
            },
            "per_frame_logs": per_frame_logs,
            "unique_detections": unique_detections,
        }

        try:
            log_path = os.path.join(artifacts_dir, "detection_log.json")
            with open(log_path, 'w', encoding='utf-8') as lf:
                json.dump(detection_log, lf, indent=2)
        except Exception:
            log_path = None

        # Save thumbnails (from previews) as files for quick inspection
        thumb_files = []
        try:
            for idx, ud in enumerate(unique_detections):
                b64 = ud.get('preview_image')
                if not b64:
                    continue
                # if preview_image is already data URI, strip prefix
                if b64.startswith('data:'):
                    b64data = b64.split(',', 1)[1]
                else:
                    b64data = b64
                try:
                    img_bytes = base64.b64decode(b64data)
                    thumb_name = f"thumb_{idx+1:03d}.jpg"
                    thumb_path = os.path.join(artifacts_dir, "thumbs", thumb_name)
                    with open(thumb_path, 'wb') as tf:
                        tf.write(img_bytes)
                    thumb_files.append(os.path.join("/results", "artifacts", report_id, "thumbs", thumb_name))
                except Exception:
                    continue
        except Exception:
            thumb_files = []

        # Finalize annotated video path (relative to static mount)
        annotated_rel = None
        try:
            annotated_rel = os.path.join("/results", "artifacts", report_id, "annotated.mp4")
            # annotated_tmp was created in artifacts_dir already
        except Exception:
            annotated_rel = None

        report = {
            "id": len(dashboard_data["reports"]) + 1,
            "type": "video",
            "source": "user",
            "location": location_str,
            "description": description,
            "status": "In Review",
            "progress": 25,
            "detections": len(unique_detections),
            "severity": severity_count,
            "timestamp": datetime.now().isoformat(),
            "lat": lat,
            "lng": lng,
            "video_path": save_vpath,
            "previews": previews,
            "artifacts_url": f"/results/artifacts/{report_id}/",
            "artifacts": {
                "original": f"/results/artifacts/{report_id}/original.mp4" if art_orig else None,
                "annotated": f"/results/artifacts/{report_id}/annotated.mp4" if annotated_rel else None,
                "log": f"/results/artifacts/{report_id}/detection_log.json" if log_path else None,
                "thumbs": thumb_files,
            },
            # uploader info (if token provided)
            "uploader_id": None,
            "uploader_name": "Anonymous",
            "verified": False,
        }

        if len(unique_detections) == 0:
            report["note"] = "No potholes detected in the submitted video."

        dashboard_data["reports"].append(report)
       
        no_potholes_video = len(unique_detections) == 0
        try:
            auth_token = token
            if not auth_token and request is not None:
                auth_hdr = request.headers.get('authorization') or request.headers.get('Authorization')
                if auth_hdr and auth_hdr.lower().startswith('bearer '):
                    auth_token = auth_hdr.split(' ', 1)[1].strip()

            uploader = None
            try:
                uploader = find_user_by_token(auth_token) if auth_token else None
            except Exception:
                uploader = None

            if uploader:
                report['uploader_id'] = uploader.get('id')
                report['uploader_name'] = uploader.get('name')
                report['verified'] = True

            if auth_token and not no_potholes_video:
                # award 20 coins for video reports that contain detections
                credit_user_by_token(auth_token, 20, { 'report_id': report.get('id'), 'type': 'video', 'detections': len(unique_detections) })
        except Exception:
            pass
        return {
            "success": True,
            "message": ("No potholes detected" if no_potholes_video else f"Video detection completed - Found {len(unique_detections)} unique potholes"),
            "no_potholes": no_potholes_video,
            "video_info": {
                "total_frames": total_frames,
                "processed_frames": processed_frames,
                "fps": fps,
                "max_detections_in_frame": max_detections_per_frame
            },
            "detections": unique_detections,
            "statistics": {
                "total_detections": len(unique_detections),
                "severity_breakdown": severity_count,
                "frames_analyzed": processed_frames
            },
            "timestamp": datetime.now().isoformat()
        }
   
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing video: {str(e)}")

# ============== ITEMS ENDPOINT ==============

@app.get("/items/{item_id}")
def read_item(item_id: int, q: str = None):
    return {"item_id": item_id, "query": q}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=False)

# ============== ADMIN DASHBOARD ENDPOINT ==============

@app.get("/admin/stats")
def get_admin_stats():
    return {
        "success": True,
        "data": dashboard_data,
        "timestamp": datetime.now().isoformat()
    }


@app.get("/admin/report/{report_id}/artifacts")
def get_report_artifacts(report_id: str):
    """Return artifact file URLs for a given report id (if available)."""
    artifacts_dir = os.path.join(os.getcwd(), "results", "artifacts", report_id)
    if not os.path.exists(artifacts_dir):
        return JSONResponse(status_code=404, content={"success": False, "message": "Artifacts not found"})

    def _exists_rel(p):
        return f"/results/artifacts/{report_id}/{os.path.basename(p)}" if os.path.exists(os.path.join(artifacts_dir, os.path.basename(p))) else None

    orig = _exists_rel("original.mp4")
    ann = _exists_rel("annotated.mp4")
    log = _exists_rel("detection_log.json")

    thumbs_dir = os.path.join(artifacts_dir, "thumbs")
    thumbs = []
    if os.path.exists(thumbs_dir):
        for fn in sorted(os.listdir(thumbs_dir)):
            thumbs.append(f"/results/artifacts/{report_id}/thumbs/{fn}")

    return {"success": True, "data": {"report_id": report_id, "original": orig, "annotated": ann, "log": log, "thumbs": thumbs}}


@app.post("/admin/report/{report_id}/status")
def update_report_status(report_id: int, payload: dict = Body(...)):
    """Update a report's status/progress/notes (admin action).
    Also propagate status to any user upload entries that reference this report_id.
    """
    # Find report
    for r in dashboard_data.get("reports", []):
        if r.get("id") == int(report_id):
            # update fields
            new_status = payload.get("status")
            if new_status:
                r["status"] = new_status
            if payload.get("progress") is not None:
                try:
                    r["progress"] = int(payload.get("progress", r.get("progress", 0)))
                except Exception:
                    pass
            if payload.get("notes"):
                r.setdefault("admin_notes", []).append({"timestamp": datetime.now().isoformat(), "note": payload.get("notes")})

            # Propagate status to users' upload entries that reference this report_id
            try:
                users = load_users()
                changed = False
                for u in users:
                    uploads = u.get("uploads") or []
                    for up in uploads:
                        meta = up.get("meta") or {}
                        if meta.get("report_id") == r.get("id"):
                            meta["status"] = r.get("status")
                            up["meta"] = meta
                            changed = True
                if changed:
                    save_users(users)
            except Exception:
                pass

            return {"success": True, "message": "Report updated", "report": r}

    return JSONResponse(status_code=404, content={"success": False, "message": "Report not found"})


# ============== AUTH ENDPOINTS ==============


@app.post("/auth/signup")
def auth_signup(name: str = Form(...), email: str = Form(...), password: str = Form(...)):
    """Register a new user. Stores a salted password hash in users.json and returns a simple token."""
    users = load_users()
    email = (email or "").strip().lower()
    if any(u.get('email') == email for u in users):
        return JSONResponse(status_code=400, content={"success": False, "message": "User already exists"})

    salt, pwd_hash = hash_password(password)
    user = {
        "id": uuid.uuid4().hex,
        "name": name,
        "email": email,
        "salt": salt,
        "pwd_hash": pwd_hash,
        "created_at": datetime.now().isoformat(),
        "token": uuid.uuid4().hex,
        "coins": 0,
        "uploads": []
    }
    users.append(user)
    save_users(users)
    return {"success": True, "message": "User created", "data": {"id": user["id"], "token": user["token"], "name": user["name"], "email": user["email"], "coins": user.get("coins", 0), "uploads": user.get("uploads", [])}}


@app.post("/auth/login")
def auth_login(email: str = Form(...), password: str = Form(...)):
    """Simple login: verify password and return token."""
    users = load_users()
    email = (email or "").strip().lower()
    user = next((u for u in users if u.get('email') == email), None)
    if not user:
        return JSONResponse(status_code=401, content={"success": False, "message": "Invalid credentials"})

    if not verify_password(password, user.get('salt', ''), user.get('pwd_hash', '')):
        return JSONResponse(status_code=401, content={"success": False, "message": "Invalid credentials"})

    # refresh token for session
    token = uuid.uuid4().hex
    user['token'] = token
    save_users(users)

    return {"success": True, "message": "Authenticated", "data": {"id": user.get('id'), "token": token, "name": user.get('name'), "email": user.get('email'), "coins": user.get('coins', 0), "uploads": user.get('uploads', [])}}


@app.get('/auth/me')
def auth_me(request: Request):
    """Return the authenticated user's record based on bearer token in Authorization header or query token."""
    auth_hdr = request.headers.get('authorization') or request.query_params.get('token')
    token = None
    if auth_hdr:
        if isinstance(auth_hdr, str) and auth_hdr.lower().startswith('bearer '):
            token = auth_hdr.split(' ', 1)[1].strip()
        else:
            token = auth_hdr

    user = find_user_by_token(token)
    if not user:
        return JSONResponse(status_code=401, content={"success": False, "message": "Not authenticated"})

    # return safe user data
    safe = {"id": user.get('id'), "name": user.get('name'), "email": user.get('email'), "coins": user.get('coins', 0), "uploads": user.get('uploads', [])}
    return {"success": True, "data": safe}


