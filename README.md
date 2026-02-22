# 🚗 Pothole Detection & Route Navigation System

**AI-Powered Smart Road Monitoring for Safer Transportation**

An intelligent pothole detection system combined with real-time navigation and route planning. This project uses Deep Learning and Computer Vision to detect potholes in real-time and help drivers avoid hazardous roads.

---

## 📋 Table of Contents
- [Overview](#overview)
- [Features](#features)
- [System Requirements](#system-requirements)
- [Project Structure](#project-structure)
- [Installation](#installation)
- [Setup & Configuration](#setup--configuration)
- [Running the Application](#running-the-application)
- [Technologies Used](#technologies-used)
- [Team](#team)
- [Future Improvements](#future-improvements)
- [Troubleshooting](#troubleshooting)

---

## 🎯 Overview

Road potholes are a critical infrastructure problem causing:
- ❌ Thousands of accidents annually
- 💰 Millions in vehicle damage claims
- 🚦 Regular traffic disruptions
- ⚠️ Safety hazards for cyclists and motorcyclists

Our AI-powered solution provides:
- **Real-time Detection**: Identify potholes instantly from images/videos
- **Smart Navigation**: Plan routes that avoid detected pothole zones
- **Live Tracking**: GPS-based navigation with pothole alerts
- **Admin Dashboard**: Monitor all detections across your city
- **Mobile-Ready**: Responsive design for all devices

---

## ✨ Features

### Core Detection Features
- ✅ YOLOv8 based real-time pothole detection
- ✅ Multi-format support (images, videos, live camera)
- ✅ Severity classification (Minor, Moderate, Major)
- ✅ Confidence scoring and bounding box visualization
- ✅ Batch processing capabilities

### Navigation & Route Planning
- 🗺️ Interactive map with pothole markers
- 🚗 Route planning with pothole avoidance
- 📍 Live GPS tracking and navigation
- 🔔 Real-time alerts when approaching potholes
- 📊 Route statistics and hazard analysis

### Admin & Analytics
- 📈 Dashboard with comprehensive statistics
- 👥 User management and authentication
- 🎯 Pothole heatmap visualization
- 📋 Detection history and reports
- 🎵 Sound alerts for critical hazards

### User Features
- 🎬 Video upload and analysis
- 📸 Image detection
- 🎮 Demo mode with sample data
- 🔊 Customizable audio alerts
- ☁️ Volunteer contribution system

---

## 💻 System Requirements

### Minimum Requirements
| Component | Requirement |
|-----------|------------|
| **OS** | Windows 10+ / macOS 10.14+ / Ubuntu 18.04+ |
| **CPU** | Intel Core i5 / AMD Ryzen 5 or better |
| **RAM** | 8 GB minimum (16 GB recommended) |
| **GPU** | NVIDIA GPU with CUDA support (optional, for faster processing) |
| **Storage** | 5 GB free space (for models and dependencies) |
| **Python** | 3.8+ |
| **Node.js** | 16.0+ |
| **npm** | 8.0+ |

### Python Dependencies
```
torch >= 2.0
ultralytics >= 8.0
opencv-python >= 4.6
fastapi >= 0.100
uvicorn >= 0.23
```

### Node.js Dependencies
```
next.js >= 14.0
react >= 18.0
react-leaflet >= 4.0
axios >= 1.0
```

---

## 📁 Project Structure

```
achievers-main/
├── backend/                 # FastAPI backend server
│   ├── app.py              # Main Flask/FastAPI application
│   ├── detect.py           # Core YOLO detection logic
│   ├── detect_potholes_in_images.py
│   ├── detecting_potholes_in_videos.py
│   ├── pothole.pt          # Trained YOLOv8 model (pothole-specific)
│   ├── yolov8n.pt          # YOLOv8 nano pretrained model
│   ├── pyproject.toml
│   ├── requirements.txt
│   ├── users.json          # User database
│   ├── results/            # Detection outputs
│   ├── uploads/            # User uploaded files
│   └── static/             # Static assets (sounds, etc.)
│
├── frontend/               # Next.js React frontend
│   ├── app/               # Pages and layouts
│   │   ├── page.tsx       # Home page
│   │   ├── navigation/    # Route planning & navigation
│   │   ├── admin/         # Admin dashboard
│   │   ├── detect/        # Detection pages
│   │   ├── upload/        # File upload
│   │   └── ...other pages
│   ├── components/        # Reusable React components
│   │   ├── RouteMap.jsx
│   │   ├── PotholeAlertMap.jsx
│   │   ├── Dashboard.jsx
│   │   └── ...other components
│   ├── services/          # API services
│   ├── public/            # Static files
│   └── package.json
│
└── README.md              # This file
```

---

## 🔧 Installation

### Step 1: Clone the Repository
```bash
git clone https://github.com/yourusername/achievers.git
cd achievers-main
```

### Step 2: Setup Backend

#### Create Python Virtual Environment
```bash
cd backend
python -m venv venv

# Activate virtual environment
# On Windows:
.\venv\Scripts\Activate.ps1

# On macOS/Linux:
source venv/bin/activate
```

#### Install Python Dependencies
```bash
pip install -r requirements.txt
# Or if using poetry:
poetry install
```

#### Download Pre-trained Models
The models (`pothole.pt` and `yolov8n.pt`) should already be in the backend folder. If missing:
```bash
python -c "from ultralytics import YOLO; YOLO('yolov8n.pt')"
```

### Step 3: Setup Frontend

#### Install Node Dependencies
```bash
cd ../frontend
npm install
```

#### Configure Environment Variables
Create a `.env.local` file in the frontend directory:
```env
NEXT_PUBLIC_BACKEND_URL=http://localhost:8000
NEXT_PUBLIC_MAP_API_KEY=your_openstreetmap_key
```

---

## ⚙️ Setup & Configuration

### Backend Configuration

1. **Environment Variables** (.env file in backend/):
```env
BACKEND_PORT=8000
UPLOAD_FOLDER=./uploads
MAX_UPLOAD_SIZE=100MB
CORS_ORIGINS=http://localhost:3000,http://localhost:3001
DATABASE_URL=./users.json
```

2. **Model Configuration** (in `detect.py`):
```python
MODEL_PATH = "pothole.pt"  # Pothole-specific model
CONFIDENCE_THRESHOLD = 0.5
NMS_THRESHOLD = 0.45
```

### Frontend Configuration

1. **API Connector** (`services/apiConnector.js`):
   - Review and configure API endpoints
   - Update backend URL if needed

2. **Map Settings** (`components/RouteMap.jsx`):
   - Uses OpenStreetMap (Nominatim) for location search
   - No API key required for basic usage

---

## 🚀 Running the Application

### Terminal 1: Start Backend Server
```bash
cd backend

# Activate virtual environment
.\venv\Scripts\Activate.ps1  # Windows
# or
source venv/bin/activate  # macOS/Linux

# Run the server
python app.py
# or with uvicorn:
uvicorn app:app --reload --port 8000
```

**Backend will be running at**: `http://localhost:8000`

### Terminal 2: Start Frontend Server
```bash
cd frontend
npm run dev
```

**Frontend will be running at**: `http://localhost:3000`

### Access the Application
- **Web App**: Open browser to `http://localhost:3000`
- **Admin Dashboard**: `http://localhost:3000/admin`
- **Navigation**: `http://localhost:3000/navigation`
- **Detection**: `http://localhost:3000/detect`
- **API Docs**: `http://localhost:8000/docs` (if using FastAPI)

---

## 🧠 Technologies Used

### Backend Stack
- 🐍 **Python 3.8+** - Programming language
- 🚀 **FastAPI** - Modern web framework
- 🔥 **PyTorch** - Deep learning framework
- 🎯 **YOLOv8** - Object detection model
- 📷 **OpenCV** - Computer vision library
- 📊 **NumPy** - Numerical computing

### Frontend Stack
- ⚛️ **React 18+** - UI library
- 📦 **Next.js 14+** - React framework
- 🗺️ **Leaflet/React-Leaflet** - Interactive maps
- 🎨 **Tailwind CSS** - Styling
- 🌐 **Axios** - HTTP client

### Infrastructure
- 🐳 **Docker** (optional) - Containerization
- 🔄 **CORS** - Cross-origin resource sharing
- 📱 **Mobile-responsive** - All devices

---

## 👥 Team

**Team Achievers** - Hackathon Project

| Role | Member |
|------|--------|
| 👑 Team Lead | Prem |
| 🤝 Co-Lead | Nirbhay |
| 💻 Technical Lead | Priyanshu |
| 📊 Research & Advisory | Nishu, Jayram |

---

## 🚀 Future Improvements

- [ ] 📍 GPS tagging with automatic geolocation
- [ ] ☁️ Cloud storage integration (AWS S3, Google Cloud)
- [ ] 📱 Native mobile apps (iOS/Android)
- [ ] 🛰️ Smart city dashboard with municipal integration
- [ ] 🔔 Real-time push notifications
- [ ] 🤖 Machine learning model improvements
- [ ] 🌍 Multi-language support
- [ ] 📊 Advanced analytics and reporting
- [ ] 🔐 Enhanced security and authentication
- [ ] ⚡ Performance optimization

---

## 🐛 Troubleshooting

### Backend Issues

**Port 8000 already in use:**
```bash
# Windows
netstat -ano | findstr :8000
taskkill /PID <PID> /F

# macOS/Linux
lsof -i :8000
kill -9 <PID>
```

**CUDA/GPU not detected:**
```bash
# Check PyTorch installation
python -c "import torch; print(torch.cuda.is_available())"

# Run on CPU if GPU unavailable (slower but works)
# Modify device to 'cpu' in detect.py
```

**Model file not found:**
- Ensure `pothole.pt` is in the backend folder
- Download from: [YOLOv8 Models](https://github.com/ultralytics/assets/releases)

### Frontend Issues

**npm install fails:**
```bash
rm -rf node_modules package-lock.json
npm cache clean --force
npm install
```

**Map not showing:**
- Check browser console for errors
- Verify internet connection (needs OpenStreetMap tiles)
- Clear browser cache

**Port 3000 occupied:**
```bash
npm run dev -- -p 3001  # Use alternate port
```

**API connection errors:**
- Verify backend is running: `http://localhost:8000`
- Check CORS settings in backend
- Review browser console network tab

### General Issues

**Virtual environment not activating:**
- Ensure Python 3.8+ is installed
- Recreate venv: `python -m venv venv`

**Dependencies installation slow:**
- Use pip's cache: `pip install --no-cache-dir`
- Use Python package index mirror (faster in some regions)

---

## 📝 API Endpoints (Backend)

### Detection Endpoints
- `POST /detect/image` - Detect potholes in image
- `POST /detect/video` - Process video for potholes
- `GET /detect/results/<id>` - Get detection results

### Admin Endpoints
- `GET /admin/stats` - Get statistics
- `GET /admin/reports` - Get all reports
- `POST /admin/users` - User management

### Navigation Endpoints
- `GET /navigation/route` - Get route with potholes
- `GET /navigation/nearby` - Get nearby potholes

---

## 📄 License

This project is developed for educational and smart city initiative purposes.

---

## 💬 Support & Contributions

For issues, questions, or contributions:
1. Check existing issues on GitHub
2. Create detailed bug reports with reproduction steps
3. Submit pull requests with clear descriptions

---

**Last Updated**: February 2026
**Version**: 1.0.0
**Status**: Active Development
