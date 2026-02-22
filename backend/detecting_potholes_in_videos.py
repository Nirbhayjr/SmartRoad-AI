from ultralytics import YOLO
import cv2

# Load pothole-trained model
model = YOLO(r"D:\smartroad\backend\pothole.pt")

# Open video file
cap = cv2.VideoCapture(r"D:\smartroad\backend\assests\vid2.mp4")

# Get original FPS of video
fps = cap.get(cv2.CAP_PROP_FPS)
delay = int(1000 / fps)  # Maintain original speed

frame_count = 0
writer = None
show_gui = True
import os, time
out_dir = os.path.join(os.getcwd(), "results", "videos")
os.makedirs(out_dir, exist_ok=True)
out_path = os.path.join(out_dir, f"annotated_{int(time.time())}.mp4")

while True:
    ret, frame = cap.read()
    if not ret:
        break

    frame_count += 1

    # 🔥 Skip frames for speed (change 2 to 3 or 4 if needed)
    if frame_count % 2 != 0:
        continue

    # 🔥 Resize frame to speed up detection
    frame = cv2.resize(frame, (640, 480))

    # Run YOLO detection
    results = model(frame)

    for r in results:
        for box in r.boxes:
            x1, y1, x2, y2 = box.xyxy[0]
            conf = float(box.conf[0])

            x1, y1, x2, y2 = int(x1), int(y1), int(x2), int(y2)

            # Calculate area
            width = x2 - x1
            height = y2 - y1
            area = width * height

            # Severity classification
            if area < 5000:
                severity = "Minor"
                color = (0, 255, 0)
            elif area < 20000:
                severity = "Moderate"
                color = (0, 255, 255)
            else:
                severity = "Major"
                color = (0, 0, 255)

            # Draw bounding box
            cv2.rectangle(frame, (x1, y1), (x2, y2), color, 2)

            label = f"{severity} ({conf:.2f})"
            cv2.putText(frame, label, (x1, y1 - 10),
                        cv2.FONT_HERSHEY_SIMPLEX,
                        0.6, color, 2)

    # Try to show in a GUI; if not available, fallback to writing an output video
    if show_gui:
        try:
            cv2.imshow("Pothole Detection", frame)
            if cv2.waitKey(delay) & 0xFF == ord('q'):
                break
        except Exception:
            show_gui = False

    if not show_gui:
        # Initialize writer when first needed
        if writer is None:
            fourcc = cv2.VideoWriter_fourcc(*'mp4v')
            h, w = frame.shape[:2]
            try:
                writer = cv2.VideoWriter(out_path, fourcc, max(1.0, fps/2), (w, h))
            except Exception:
                writer = None
        if writer is not None:
            # write the frame (note: we resized to 640x480 earlier)
            writer.write(frame)

cap.release()
if writer is not None:
    writer.release()
    print(f"No GUI available — saved annotated video to: {out_path}")
try:
    cv2.destroyAllWindows()
except Exception:
    pass
