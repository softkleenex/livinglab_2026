# MDGA Frontend

[🇰🇷 한국어](README.md) | [🇺🇸 English](README_EN.md)

The frontend module of the MDGA (Universal Data Engine) platform.
It provides visualization of agricultural/smart farm data, B2B data trading, AI-based dashboards, and Twin Map services.

## ✨ Key Features & Components

*   **Twin Map (Digital Twin Map):** Based on Leaflet, it rolls up data from individual farms into neighborhood -> district -> city units and renders them on the map.
*   **Data Converter:** An unstructured data capitalization dashboard through multimodal AI scanning.
*   **B2B Market:** A marketplace UI where synthetic data and B-grade produce can be purchased and traded.
*   **Synthesis Insight:** A simulation dashboard converging data from KMA and RDA.
*   **MDGA Copilot:** An enterprise AI chatbot interface for data cognition and control.

## 🛠 Tech Stack

*   **Framework:** React 19 + Vite
*   **Styling:** Tailwind CSS
*   **Animations:** Framer Motion
*   **Charts:** Recharts
*   **Maps:** Leaflet
*   **Icons:** Lucide Icons

## 🚀 Getting Started

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Run the development server:**
   ```bash
   npm run dev
   ```

3. **Build for production:**
   ```bash
   npm run build
   ```

## 🌍 Deployment Environment
*   The frontend is currently deployed and operating on **Cloudflare Pages**.
*   Backend API Connection: The Render backend address is bound to the environment variable `VITE_API_URL` (default: `https://mdga-api.onrender.com`).

## 📁 Folder Structure (based on src)
- `components/`: Collection of UI components by main feature (dashboards, modals, etc.)
- `pages/`: Routing and view configuration (MainApp, Onboarding, etc.)
- `services/`: Modules for backend API integration and data requests
- `contexts/` / `hooks/`: State management and custom hooks
- `utils/`: Common utility functions
