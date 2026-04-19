# MDGA (Universal Data Engine) 🚀
**A Next-Generation B2B Data Assetization & Governance SaaS Platform**

![MDGA App](docs/screenshots/deployed_home.png)

MDGA is a comprehensive B2B SaaS platform designed to transform raw field data (text, images, logs) into verified, valuable digital assets. It features a real-time dynamic hierarchy map, AI-driven business insights, and a seamless integration with Google Drive as a Data Lake. 

## ✨ Core Features & Highlights

1. **Dynamic Regional Hierarchy Engine (Twin Map)**
   - Automatically rolls up assets and activity levels (Pulse) from individual stores/nodes to upper geographical layers (City -> District -> Neighborhood -> Street).
   - Real-time rendering of a data-driven Twin Map reflecting local economic health.

2. **Data Assetization & RAG Pipeline**
   - **Multi-modal Ingestion:** Users can feed raw text or images (e.g., daily sales, smart farm metrics).
   - **Google Drive Data Lake:** Raw files are securely persisted in a dynamically created folder structure (e.g., `[대구광역시]/[북구]/[산격동]...`).
   - **AI Copilot Insights:** Gemini 2.5 Pro analyzes the data and instantly returns actionable, industry-specific business insights (saved as `.txt` back to Drive).

3. **Enterprise-Grade AI Copilot (Function Calling)**
   - Context-aware chatbot that knows your store's total value, industry, and previous data entries.
   - **System Execution via Two-Step Parsing:** The AI doesn't just talk; it modifies the system. Through an advanced parser, the Copilot securely processes commands to `DELETE`, `CREATE`, or `MODIFY` data entries on behalf of the user, keeping the DB and Drive synchronized in real-time.

4. **Automated Weekly Dashboards & Governance Simulators**
   - Automatically cross-validates your store's metrics against regional averages and real-time weather APIs to output professional, markdown-formatted reports.
   - City planners can run a "Governance Simulator" to predict the ROI and Job Creation of macro-investments in specific regions.

---

## 🏗️ Technical Architecture & Refactoring Journey

### 1. Database Normalization & Stateless Scaling
*   **Challenge:** The MVP relied on a monolithic `DataEntry` table and kept the entire hierarchical tree state in the server's RAM (`engine.py`). This prevented horizontal scaling (Scale-out) as multiple server instances would hold different states. Furthermore, there was no way to permanently delete a "Store" entity.
*   **Overcome:** 
    *   Migrated from an append-only JSON-like DB to a **fully normalized Relational Database Model (RDBMS)**.
    *   Separated into `Region`, `Store`, and `DataEntry` tables with rigid Foreign Keys.
    *   Implemented `ON DELETE CASCADE`: Deleting a Store now safely triggers a transactional rollback—destroying all child `DataEntry` records, recalculating upstream `Total Value` for all parent regions, and orchestrating the deletion of corresponding files in Google Drive.
    *   The `HierarchyEngine` is now 100% **Stateless**, querying the DB dynamically on every request.

### 2. Bypassing AI "Safety Alignment" for System Control
*   **Challenge:** We wanted the user to simply say "Delete the data I just uploaded" to the AI Copilot. However, Gemini's built-in safety alignment consistently refused the request, responding with *"I am just an assistant and do not have permission to delete database records."*
*   **Overcome (Two-Step AI Parsing):** 
    *   Instead of relying on a single Chat prompt, we separated the logic into a **System Intent Parser** and a **Conversational Persona**.
    *   The Parser is fed a strict `response_schema` (JSON) and instructed to be an emotionless machine that simply maps user intents to `action_type: "DELETE"` and extracts the `target_hash`.
    *   The Python backend interprets this JSON, safely executes the SQLAlchemy delete transactions, and only then is the Conversational Persona invoked to politely confirm the deletion to the user.

### 3. Securing Google Drive Uploads (OAuth Scope)
*   **Challenge:** When attempting to wipe the entire Drive folder during a system reset, the Google Drive API returned a `403 Forbidden` error (`appNotAuthorizedToChild`), even though the Service Account owned the root folder.
*   **Overcome:** Diagnosed that the OAuth scope was limited to `auth/drive.file` (can only manage files created by the app). Instead of dangerously escalating the scope to full drive access, we encapsulated the exact file IDs (derived from DB `hash_val`) created by the app, allowing surgically precise `delete` commands exclusively on MDGA-generated assets without touching the user's personal files.

---

## 🛠 Tech Stack

- **Frontend:** React 18, Vite, Tailwind CSS, Framer Motion, Recharts, Lucide Icons.
- **Backend:** Python 3.12, FastAPI, SQLAlchemy (PostgreSQL / SQLite), Uvicorn.
- **AI & Cloud:** Google Gemini 2.5 Pro (Generative AI), Google Drive API (OAuth 2.0).
- **Deployment:** Cloudflare Pages (Frontend), Render (Backend).

## 🚀 Setup & Installation

### Environment Variables (`backend/.env`)
```env
DATABASE_URL=postgresql://user:pass@localhost:5432/mdga
GEMINI_API_KEY=your_gemini_api_key
GEMINI_MODEL=gemini-2.5-pro
GOOGLE_OAUTH_CLIENT_ID=your_oauth_client
GOOGLE_OAUTH_CLIENT_SECRET=your_oauth_secret
GOOGLE_DRIVE_FOLDER_ID=your_target_folder_id
```

### Running Locally
```bash
# Start Backend
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload

# Start Frontend
cd frontend
npm install
npm run dev
```

---
*Built with passion for the ultimate Data Assetization experience.* 🌍
