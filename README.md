<div align="center">
  <br />
    <img src="https://raw.githubusercontent.com/lucide-icons/lucide/main/icons/globe-2.svg" alt="logo" width="80" height="auto" />
  <br />

  <h1>🌍 GeoTrack</h1>
  
  <p>
    <strong>A high-performance IP geolocation tracker built with React, Vite, and Flask.</strong>
  </p>

  <h3>🚀 <a href="https://geotrack-app.onrender.com/">Live Demo</a></h3>

  <p>
    <a href="https://react.dev/"><img src="https://img.shields.io/badge/Frontend-React%2018-blue?style=for-the-badge&logo=react" alt="React" /></a>
    <a href="https://vitejs.dev/"><img src="https://img.shields.io/badge/Build-Vite-646CFF?style=for-the-badge&logo=vite" alt="Vite" /></a>
    <a href="https://flask.palletsprojects.com/"><img src="https://img.shields.io/badge/Backend-Flask-black?style=for-the-badge&logo=flask" alt="Flask" /></a>
    <a href="https://leafletjs.com/"><img src="https://img.shields.io/badge/Maps-Google%20Tiles-success?style=for-the-badge&logo=googlemaps" alt="Maps" /></a>
  </p>
</div>

<br />

## 🪐 Overview
GeoTrack is an incredibly snappy, full-stack web application designed to instantly locate and visualize the origin of any IP Address on an interactive globe mapping system.

Powered by a dual **React UI** and robust **Python Flask** architecture, this tool bypasses complex networking restrictions to pull real-time ASN and geological data, cleanly plotting it over dynamic Google Map tiles!

### ✨ Key Features
- ⚡ **Instant IP Tracking:** Type any IP to grab exact longitude/latitude structures.
- 🗺️ **Interactive Interface:** Seamless map generation pulling active coordinate grids in real-time.
- 💻 **"Track My IP":** Automatically detects and tracks your personal public IP dynamically.
- 🛡️ **Robust Python Core:** Utilizes an integrated backend `api/track` gateway to abstract network calls securely.
- 🎨 **Glassmorphism Aesthetic:** Completely customized dark-mode aesthetic with vibrant UI cards.

---

## 🛠️ Tech Stack
| Domain | Technology |
|---|---|
| **Frontend Framework** | React (v18) + TypeScript |
| **Styling** | TailwindCSS |
| **Mapping Engine** | Leaflet + React-Leaflet |
| **Icons & Animations** | Lucide React, Framer Motion |
| **Backend API** | Python Flask (Served via Gunicorn) |
| **Package Management** | `uv` (Python), `npm` (Node.js) |

---

## 🚀 Getting Started Locally

### Prerequisites
Make sure you have both **Node.js** and **Python (v3.11+)** installed on your system. 

### Development Setup
1. **Clone the repository**
   ```bash
   git clone https://github.com/Legends0024/ip-mapper.git
   cd ip-mapper
   ```

2. **Start the Frontend UI** (Terminal 1)
   ```bash
   npm install
   npm run dev
   ```

3. **Start the Backend Server** (Terminal 2)
   ```bash
   uv sync
   uv run python app.py
   ```

4. Head over to **`http://localhost:5173`** in your browser!

---

## ☁️ Deployment (Render)
This project is configured out of the box for free deployment on [Render](https://render.com).

1. Push your code to your GitHub repo.
2. Link your repo in the Render dashboard and create a **Web Service**.
3. Set your **Build Command**: `./build.sh`
4. Set your **Start Command**: `uv run gunicorn app:app -b 0.0.0.0:$PORT`
5. *Deploy!* 🎉

---

<div align="center">
  <sub>Built with ❤️ by Legends0024.</sub>
</div>
