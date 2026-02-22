from ultralytics import YOLO
import cv2

# Configurable thresholds
MINOR_MAX_AREA = 5000
MODERATE_MAX_AREA = 20000

# Allowed class labels (adjust to your model's class names)
ALLOWED_CLASSES = {"pothole", "potholes"}

# Load your pothole-trained model
model = YOLO(r"C:\Users\kjayr\Desktop\hackathon\backend\pothole.pt")

# Print available class names for debugging
try:
    print("Model class names:", getattr(model, 'names', {}))
except Exception:
    pass

# Load image (update path as needed)
image_path = r"C:\Users\kjayr\Desktop\hackathon\backend\pothole1.webp"
image = cv2.imread(image_path)
if image is None:
    raise SystemExit(f"Could not read image at {image_path}")

# Run detection
results = model(image)

for r in results:
    boxes = getattr(r, 'boxes', [])
    names_map = getattr(r, 'names', None) or getattr(model, 'names', {})

    for box in boxes:
        # Check class id/name if available
        class_id = None
        try:
            class_id = int(box.cls[0])
        except Exception:
            class_id = None

        class_name = None
        if class_id is not None and names_map is not None:
            class_name = names_map.get(class_id, None)

        # Require a class name and skip non-pothole detections
        if not class_name or class_name.lower() not in ALLOWED_CLASSES:
            continue

        # Get coordinates
        x1, y1, x2, y2 = box.xyxy[0]
        conf = float(box.conf[0])

        # Convert to int
        x1, y1, x2, y2 = int(x1), int(y1), int(x2), int(y2)

        # Calculate area
        width = max(0, x2 - x1)
        height = max(0, y2 - y1)
        area = width * height

        # Severity classification
        if area < MINOR_MAX_AREA:
            severity = "Minor"
            color = (0, 255, 0)
        elif area < MODERATE_MAX_AREA:
            severity = "Moderate"
            color = (0, 255, 255)
        else:
            severity = "Major"
            color = (0, 0, 255)

        # Draw bounding box
        cv2.rectangle(image, (x1, y1), (x2, y2), color, 2)

        # Put label
        label = f"{severity} ({conf:.2f})"
        cv2.putText(image, label, (x1, y1 - 10), cv2.FONT_HERSHEY_SIMPLEX, 0.6, color, 2)

# Show result if possible, otherwise save annotated image to results
try:
    cv2.imshow("Pothole Detection", image)
    cv2.waitKey(0)
    cv2.destroyAllWindows()
except Exception:
    out_dir = r"C:\Users\kjayr\Desktop\hackathon\backend\results\images"
    import os, time
    os.makedirs(out_dir, exist_ok=True)
    out_path = os.path.join(out_dir, f"annotated_{int(time.time())}.jpg")
    cv2.imwrite(out_path, image)
    print(f"No GUI available — saved annotated image to: {out_path}")
