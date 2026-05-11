# MDGA - 배포 가이드 및 CI/CD 파이프라인 (Deployment Guide)

본 문서는 새로운 개발 환경 셋업, 배포 환경 변수 관리, 그리고 CI/CD 자동화 파이프라인의 구성 방식을 정의합니다.

## 1. 환경 변수 (Environment Variables) 관리 목록

배포 환경(Render, Cloudflare, Supabase) 콘솔에 반드시 등록해야 하는 핵심 환경 변수 목록입니다. (주의: 소스 코드 커밋 금지)

### 1.1 Backend (Render.com)
*   `DATABASE_URL`: Supabase PostgreSQL 연결 DSN (`postgresql://user:password@host:port/dbname?sslmode=require`)
*   `GOOGLE_OAUTH_CLIENT_ID`: Google OAuth Client ID
*   `GOOGLE_OAUTH_CLIENT_SECRET`: Google OAuth Client Secret
*   `GOOGLE_OAUTH_REFRESH_TOKEN`: Google OAuth Refresh Token
*   `GOOGLE_DRIVE_FOLDER_ID`: Google Drive Folder ID
*   `GOOGLE_SERVICE_ACCOUNT_JSON`: Google Drive Service Account의 JSON Key 값 (문자열 형태로 이스케이프하여 주입).
*   `GEMINI_API_KEY`: Google AI Studio에서 발급받은 Gemini 2.5 API Key.
*   `GEMINI_MODEL`: `gemini-2.5-pro` (사용할 Gemini 모델명).
*   `ALLOWED_ORIGINS`: `https://mdga-2026.pages.dev,http://localhost:5173,http://localhost:4173` (보안을 위해 허용된 도메인 리스트)
*   `B2B_API_KEYS`: 콤마로 구분된 B2B API Key 리스트.

### 1.2 Frontend (Cloudflare Pages)
*   `VITE_API_URL`: `https://mdga-api.onrender.com` (Render 백엔드 API 주소)

## 2. CI/CD 파이프라인 설계 (GitHub Actions)

MDGA는 안정적인 배포 환경 테스트를 위해 2단계의 워크플로우를 가집니다. 구성 파일은 `.github/workflows/` 에 위치합니다.

### Step 1: Continuous Integration (CI - PR 생성 시)
*   **트리거:** `main` 브랜치로 향하는 Pull Request 생성 또는 커밋 푸시.
*   **작업 내용:**
    1.  **Backend Job:**
        *   Python 3.11 환경 세팅.
        *   `pip install -r requirements.txt`
        *   `ruff check .` 및 `black --check .` (코드 컨벤션 검사)
        *   `pytest` 실행 (단위 테스트 통과 여부 확인)
    2.  **Frontend Job:**
        *   Node.js 20.x 환경 세팅.
        *   `npm install`
        *   `npm run lint`
        *   `npm run build` (빌드 에러 검출)
*   **결과:** 하나라도 실패하면 PR Merge를 차단 (Branch Protection Rule).

### Step 2: Continuous Deployment (CD - Main 머지 시)
*   **트리거:** `main` 브랜치에 코드 병합(Merge) 발생.
*   **작업 내용:**
    1.  **Backend Deploy:**
        *   GitHub Action이 Render Deploy Webhook URL을 호출 (`curl -X POST $RENDER_DEPLOY_HOOK`).
        *   Render가 GitHub에서 최신 코드를 pull하고 Docker 빌드 후 컨테이너 교체.
    2.  **Frontend Deploy:**
        *   Cloudflare Pages의 GitHub App 연동에 의해 자동 빌드 트리거.
        *   빌드 완료 후 글로벌 엣지에 새 버전 배포.

## 3. 마이그레이션 (DB Migration) 가이드
Supabase DB 스키마가 변경될 경우 백엔드 배포 전(또는 시작 시) 다음 절차를 따릅니다.
1.  로컬에서 스키마 변경 사항 생성: `alembic revision --autogenerate -m "added new column"`
2.  로컬 테스트 후 생성된 마이그레이션 스크립트 커밋.
3.  Render 배포 시 Start Command에 자동 적용 스크립트 포함 권장:
    *   `alembic upgrade head && uvicorn app.main:app --host 0.0.0.0 --port $PORT`
