# Intelligent SUMO-YOLO Traffic Control System

A high-performance, vision-integrated traffic management system that uses YOLOv8 to monitor SUMO simulations and intelligently control traffic signals in real-time.

![Vision Analytics](debug_frame_4way.png)

## 🚀 Key Features

- **Vision-Based Density Detection**: Uses **YOLOv8** to identify and count vehicles (cars, trucks, buses) directly from the SUMO-GUI window.
- **Dynamic Signal Timing**: Implements a density-weighted green light allocation algorithm (higher density = more green time).
- **Emergency Vehicle Priority**: Vision-based detection of emergency vehicles (blue-flashers) providing immediate priority signal preemption.
- **Starvation Prevention**: Guaranteed service for all lanes using a Round-Robin cycle combined with a maximum wait-time "Starvation Fix."
- **Real-Time Dashboard**:
  - **Live Console Feed**: Detailed step-by-step logs of lane densities and signal decisions.
  - **Web Interface**: A modern React-based frontend providing a visual representation of the junction status.
  - **Socket.io Streaming**: Low-latency state synchronization between the Python controller and the web dashboard.

## 🛠️ Tech Stack

- **Backend**: Python 3.x, OpenCV, MSS (Screen Capture), Win32GUI
- **Simulation**: Eclipse SUMO (Simulation of Urban MObility)
- **AI/ML**: Ultralytics YOLOv8 (yolov8n.pt)
- **Communication**: Flask, Flask-SocketIO
- **Frontend**: React, Vite, Socket.io-client

## 📋 Prerequisites

1.  **SUMO**: [Install Eclipse SUMO](https://www.eclipse.org/sumo/) and set the `SUMO_HOME` environment variable.
2.  **Python Packages**:
    ```bash
    pip install opencv-python numpy mss pywin32 ultralytics flask flask-socketio flask-cors
    ```
3.  **YOLO Model**: Ensure `yolov8n.pt` is in the root directory.

## 🏃 Running the Project

### 1. Start the Intelligent Controller
Run the main script. This will launch SUMO-GUI and start the vision agent.
```bash
python main.py
```
*Note: Ensure the SUMO-GUI window is visible on your screen after it launches so the vision agent can capture it.*

### 2. Start the Monitoring Dashboard (Optional)
Navigate to the frontend directory and start the development server.
```bash
cd frontend
npm install
npm run dev
```
Open your browser to the provided URL (usually `http://localhost:5173`) to view the live junction map.

## 🧠 System Architecture

1.  **Vision Agent**: Captures the SUMO-GUI window, applies Region of Interest (ROI) masks to each lane, and runs YOLOv8 detections. It also performs pixel-level analysis for emergency vehicle detection.
2.  **Decision Agent**: Analyzes the density data. It follows a clockwise Round-Robin sequence but intercepts the cycle if an emergency vehicle is detected or if a lane has been waiting too long.
3.  **TraCI Bridge**: Communicates decisions back to SUMO, setting traffic light phases and stepping the simulation.
4.  **Web Server**: Broadcasts the internal state (densities, phases, reasons) to all connected clients.

## 📂 File Structure

- `main.py`: The heart of the system containing Vision, Decision, and Server logic.
- `traffic.sumocfg`: SUMO configuration file.
- `map.net.xml`: The 4-way junction network definition.
- `routes.rou.xml`: Traffic demand and vehicle route definitions.
- `frontend/`: The React dashboard source code.
- `yolov8n.pt`: Pre-trained YOLOv8 weights.

---
*Developed for intelligent urban traffic management experiments.*
