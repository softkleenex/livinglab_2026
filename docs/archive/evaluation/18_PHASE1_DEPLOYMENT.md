# MDGA Deployment & Troubleshooting Log (v1.0.1)

## 🚨 Overview of Production Issues & Resolutions

During the final production deployment phase, several critical issues were identified regarding data flow, API integrations, and frontend-backend communication. The following describes the root causes and the implemented solutions.

### 1. Weekly Report Generation Failure ("리포트를 생성하지 못했습니다.")
*   **Root Cause 1 (Frontend):** The `locationPath` parameter sent from the frontend `ReportModal.jsx` contained Korean characters, slashes (`/`), and spaces, which were not properly URL-encoded when appended directly to the query string.
*   **Root Cause 2 (Backend):** In `dashboard.py`, the `HierarchyEngine` failed to locate the parent region object in the database for top-level paths, returning `None`. Attempting to access metadata on this `None` object resulted in a `TypeError`.
*   **Root Cause 3 (Data Sync):** The initial seed script (`sync_seed.py`) only uploaded files to Google Drive but **did not** populate the PostgreSQL database (`DataEntry` table). The weekly report requires historical DB entries to generate insights.
*   **Resolution:**
    *   Updated the frontend `axios.get` call to use the `params` object, ensuring safe and automatic URL encoding.
    *   Implemented a fallback in the backend (`dashboard.py`) to provide a default `parent_obj` if the database query returns `None`.
    *   Created and executed a dedicated DB seeding script (`backend/db_seed.py`) to correctly populate the production PostgreSQL database via `HierarchyEngine`, resolving the "Not enough data" error.

### 2. File Ingestion (.zip) Upload Failure (500 Error)
*   **Root Cause:** The `ingest` API endpoint blindly assumed all uploaded files with valid contents were images by calling `startswith('image/')` on the `file_content_type`. For non-image files like `.zip` where `file_content_type` could be ambiguous or absent, it threw an `AttributeError` and crashed the server.
*   **Resolution:** Added robust null-checking (`if file and file_content_type and file_content_type.startswith('image/')`) to safely bypass vision processing for zip files, allowing them to proceed to text analysis and storage without crashing.

### 3. Gemini AI "Model Not Found" (404 Error)
*   **Root Cause:** The `google-generativeai` SDK version (`v1beta`) installed on the server did not recognize the model string `gemini-1.5-pro-latest`. Furthermore, the `gemini-1.5-pro` string was triggering "API Key Leaked" and "Spending Cap Exceeded" (429) errors.
*   **Resolution:** Upgraded the configuration to use the highly capable and generous free-tier model `gemini-2.5-flash` in `app/core/config.py`.

### 4. Google Drive Upload "invalid_grant" (Storage Error)
*   **Root Cause 1 (Service Account Limitations):** Initial attempts used a Service Account, but Google Workspace policies restrict free storage quotas for Service Accounts, causing a `403 storageQuotaExceeded` error.
*   **Root Cause 2 (OAuth Refresh Token Formatting):** Switched to OAuth user credentials. However, pasting the `GOOGLE_OAUTH_REFRESH_TOKEN` into the Render dashboard introduced hidden whitespace/newlines at the end of the string, causing Google's API to reject the grant (`invalid_grant: Bad Request`).
*   **Resolution:**
    *   Disabled the Service Account path in `google_drive.py` to force standard OAuth usage.
    *   Added `.strip()` to all OAuth credential reads in `google_drive.py` to sanitize environment variables from Render, which completely resolved the `invalid_grant` token errors and restored full Drive upload functionality.

## 🚀 Final Architecture Status
The system is now fully operational in the production environment.
*   **Frontend:** Cloudflare Pages (Successfully fetching encoded paths)
*   **Backend:** Render (Handling all data types, stripped env vars, robust fallbacks)
*   **Database:** Supabase PostgreSQL (Seeded and syncing with Hierarchy Engine)
*   **Cloud Storage:** Google Drive API (OAuth 2.0 authorized and actively generating share links)
*   **AI Core:** Google Gemini 2.5 Flash (Executing qualitative analysis and report generation)
