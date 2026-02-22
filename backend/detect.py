from ultralytics import YOLO

model = YOLO("yolov8n.pt")
results = model(r"C:\python\yolo\photo.jpeg", show=True)