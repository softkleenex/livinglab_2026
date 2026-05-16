# MDGA Backend

[🇰🇷 한국어](README.md) | [🇺🇸 English](README_EN.md)

The core backend module of the MDGA (Universal Data Engine) platform.
It handles public data integration, Gemini-based multimodal data pipelines, and 3NF normalized database management.

## ✨ Key Features & Architecture

*   **Data Pipeline Engine:** Uses Gemini 2.5 Pro Vision to parse and structure unstructured data like handwritten farming logs and images into AI-Ready JSON.
*   **External Data Source Integration:** Collects environmental data through scheduling and integration with KMA (Korea Meteorological Administration) and RDA (Rural Development Administration) APIs.
*   **Synthetic Data Simulation:** Fuses collected empirical data with public data to calculate core metrics such as yield volatility and future climate simulators.
*   **Safety Alignment Bypass:** Applies separation of DB transactions and natural language chatbot responses via an Intent Parser for system control.
*   **Google Drive Data Lake:** Secure object file separation storage using minimal scope (`auth/drive.file`).

## 🛠 Tech Stack

*   **Framework:** Python 3.11, FastAPI, Uvicorn
*   **Database:** SQLAlchemy, PostgreSQL (or SQLite)
*   **AI Integration:** Google Gemini 2.5 Pro
*   **External APIs:** Hugging Face Datasets API, KMA, RDA, Google Drive API

## 🚀 Getting Started

### 1. Virtual Environment Setup & Dependency Installation
```bash
python -m venv venv
source venv/bin/activate  # Mac/Linux
# venv\Scripts\activate    # Windows
pip install -r requirements.txt
```

### 2. Environment Variables Configuration
Create a `.env` file referencing `.env.example` in the project root.
```env
DATABASE_URL=postgresql://user:pass@localhost:5432/mdga
GEMINI_API_KEY=your_gemini_api_key
GEMINI_MODEL=gemini-2.5-pro
GOOGLE_OAUTH_CLIENT_ID=your_oauth_client
GOOGLE_OAUTH_CLIENT_SECRET=your_oauth_secret
GOOGLE_OAUTH_REFRESH_TOKEN=your_oauth_refresh_token
GOOGLE_DRIVE_FOLDER_ID=your_target_folder_id
```
> **Notice:** To use the quota of a 'Personal Account' for Google Drive integration, you must use the **OAuth 2.0 Refresh Token** method instead of a Service Account (`GOOGLE_SERVICE_ACCOUNT_JSON`). If the Service Account variable exists, a Quota Error may occur.

### 3. Run Server
```bash
uvicorn app.main:app --reload
```
After starting the server, you can check the Swagger UI API documentation at `http://localhost:8000/docs`.

## 📁 Key Folder Structure
- `app/api/`: REST API endpoint definitions.
- `app/core/`: DB connection, WebSockets, core business logic.
- `app/services/`: External service integration (Gemini AI, Google Drive, public data, etc.).
- `scripts/`: Data initialization (Seed) and utility scripts.
- `tests/`: Pytest-based integration/unit tests.
