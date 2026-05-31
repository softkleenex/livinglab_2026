# MDGA - 현재 인프라스트럭처 현황 (Current State)

본 문서는 MDGA 프로젝트가 현재 의존하고 운영되고 있는 라이브 환경의 인프라스트럭처 컴포넌트를 상세히 기술합니다.

## 1. Frontend: Cloudflare Pages
*   **유형:** Global Edge CDN & Static Site Hosting
*   **배포 단위:** `dist/` (Vite Build Output)
*   **특징 및 이유:**
    *   글로벌 엣지 네트워크를 통한 매우 빠른 초기 로딩 속도 보장.
    *   무제한에 가까운 대역폭(Bandwidth) 제공으로 트래픽 스파이크에 강함.
    *   GitHub과 직접 연동되어 Main 브랜치 푸시 시 자동 빌드 및 배포(CI/CD) 기본 제공.
    *   SSL/TLS 인증서 자동 갱신 및 적용.

## 2. Backend: Render.com (Web Service)
*   **유형:** Managed Container Service (PaaS)
*   **배포 단위:** `Dockerfile` (Python 3.11 환경)
*   **설정 및 특징:**
    *   **Start Command:** `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
    *   **Environment Variables:** 데이터베이스 DSN, 각종 API Key(Gemini, 기상청, Google Drive) 주입.
    *   **Auto-Deploy:** GitHub Webhook을 통해 Main 브랜치 업데이트 시 자동 배포.
    *   **Health Check & E2E Testing:** `/api/v1/health` 엔드포인트를 통해 컨테이너 상태 모니터링. 추가적으로 `test_production.py` E2E 테스트 스크립트를 통해 Render 배포 환경에서의 통합 플로우가 상시 검증되고 있습니다.

## 3. Database: Supabase (Managed PostgreSQL)
*   **유형:** Database as a Service (DBaaS)
*   **버전:** PostgreSQL 15+
*   **특징 및 구성:**
    *   완전 관리형 RDBMS로, 자동 백업(Daily) 및 복구(Point-in-Time Recovery) 지원.
    *   커넥션 풀링(Connection Pooling, PgBouncer 내장)을 통해 FastAPI의 비동기 세션 부하 분산.
    *   Alembic을 활용한 마이그레이션 적용 및 `DB_SCHEMA.md`에 정의된 3NF 스키마 유지 (`DataAPIKey` 등 최신 스키마 포함).
    *   (선택적) RLS(Row Level Security)를 활성화하여 DB 레벨에서의 데이터 접근 통제 가능.

## 4. Data Lake & File Storage: Google Drive
*   **유형:** Cloud File Storage
*   **접근 방식:** Google Drive API (REST API)
*   **특징 및 사용 이유:**
    *   비용 효율성: 초기 MVP 및 소규모 서비스 운영 시 AWS S3 대비 비용 효율적이며, 관리자(농업 기관 등)가 Drive UI를 통해 원본 파일(사진, CSV)을 직관적으로 확인 가능.
    *   **보안 스코프:** `https://www.googleapis.com/auth/drive.file` 스코프를 사용. 이는 애플리케이션(MDGA)이 직접 업로드하거나 생성한 파일/폴더에만 접근을 허용하여, 사용자의 전체 드라이브 데이터를 읽지 못하도록 하는 최소 권한(Least Privilege) 원칙 준수.
    *   **데이터 맵핑:** Drive에서 반환받은 `file_id`와 `webViewLink`를 Supabase `data_entries` 테이블에 저장하여 관계형 데이터와 비정형 데이터를 연결.

## 5. AI & External Services
*   **Google Gemini 2.5 Pro Vision:** 멀티모달 파서 (비정형 데이터 -> 정형 JSON). Render 백엔드에서 API 형태로 호출.
*   **공공데이터포털 (기상청):** Render 백엔드 내부 스케줄러(APScheduler)가 주기적으로 호출하여 날씨 데이터를 동기화.
