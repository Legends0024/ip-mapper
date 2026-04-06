# 🌍 GeoTrack — IP Geolocation & CNIP Intelligence

> **Prototype v2.1** — A professional-grade cybersecurity dashboard and **CNIP Tutor** for real-time IP protocol analysis and geolocation.

![Status](https://img.shields.io/badge/Status-Academic_Prototype-blueviolet?style=flat-square)
![Stack](https://img.shields.io/badge/Stack-React%20+%20Flask%20+%20SQLite-blue?style=flat-square)
![Net-Intelligence](https://img.shields.io/badge/Intelligence-AS_%7C_BGP_%7C_L3_Binary-emerald?style=flat-square)

---

## ✨ Overview

GeoTrack is a full-stack intelligence platform built for **Computer Networks and Internet Protocols (CNIP)** students and security professionals. It provides deep-level IP address analysis, interactive high-contrast mapping, and a built-in AI tutor to explain complex networking concepts.

---

## 🎓 Academic Features (CNIP Focus)

- **Layer 3 Analysis:** View IP addresses in **32-bit Binary** and **Hexadecimal** formats.
- **Address Classification:** Automatic identification of IPv4 Classes (A, B, C, D, E).
- **RIR Mapping:** Real-time identification of Regional Internet Registries (APNIC, ARIN, RIPE, etc.).
- **NetGuide Chatbot:** An interactive tutor that explains concepts like BGP, Autonomous Systems (AS), and the OSI Model.
- **Reverse DNS:** Integrated PTR lookups to find hostnames from IP addresses.

---

## 🚀 Key Features

### 🤖 NetGuide — Interactive Tutor
- Floating dashboard chatbot with a pre-trained networking knowledge base.
- Explains specific results (e.g., "Why is this Class B?") with a single click.
- Guides users through project features and networking theory.

### 🗺️ High-Contrast Interactive Map
- **Light Voyager Theme:** Designed for perfect visibility against the dark dashboard UI.
- Supports multiple markers, fly-to animations, and side-by-side IP comparisons.

### 🔍 Advanced IP Lookup
- Instant geolocation (Country, City, ISP, AS Number).
- Heuristic-based **Risk Detection** for VPNs, Proxies, and Hosting providers.
- Persistence via SQLite for all search history and analytics.

---

## 🏗️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 18, Vite, Tailwind CSS, Framer Motion |
| **Logic** | Python Flask, Flask-CORS, `ipaddress` library |
| **Knowledge** | Custom Rule-Based CNIP Matcher |
| **Mapping** | Leaflet + CartoDB Voyager (Light) |
| **Database** | SQLite (Persistent Storage) |

---

## ⚙️ Getting Started

### Prerequisites
- **Node.js** 18+
- **Python** 3.11+

### Setup

```bash
# 1. Install Dependencies
npm install
pip install flask flask-cors requests gunicorn

# 2. Run Backend
python app.py

# 3. Run Frontend
npm run dev
```

---

## ☁️ Deployment (Render)
This project is configured out of the box for free deployment on [Render](https://geotrack-app.onrender.com/).

## 🎨 Design Philosophy

- **High Contrast:** Ultra-light map tiles (CARTO Positron) on a deep navy glassmorphism dashboard.
- **Educational UI:** Monospace terminal-style analysis for protocol data.
- **Responsive:** Fluid animations and layout for all screen sizes.


## 📝 Notes

- **Free Tier:** Uses `ip-api.com` (45 requests/min limit).
- **Prototypes:** This is an academic project designed for demonstration of networking principles.

---

## 👤 Author

**Manav** — Full-Stack Developer & CNIP Student
