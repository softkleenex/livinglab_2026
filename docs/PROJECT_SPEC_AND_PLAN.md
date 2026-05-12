# MDGA (Universal Data Engine) - 상세 작업 명세서 및 프로젝트 기획안 (v2.1)

본 문서는 MDGA 프로젝트의 개발 및 운영을 위한 **단일 진실 공급원(Single Source of Truth)**입니다. 
본 프로젝트는 **현재 이미 Render, Supabase, Cloudflare Pages, Google Drive를 통해 라이브 환경에 배포가 완료된 상태**이며, 이후의 모든 개발은 해당 인프라 위에서 이루어지고 검증됩니다.

---

## 1. 프로젝트 개요 (Project Overview)

### 1.1 비전 및 미션
*   **비전:** 파편화된 농업 데이터(농기계 로그, 영농일지, 생육 이미지)를 고부가가치의 지능형 합성 데이터로 전환하는 B2B 데이터 엔진 구축.
*   **미션:** 비정형 데이터의 자동 정형화(AI-Ready), 지역 단위 공간 계층화, 기후 및 작황 시뮬레이션을 통한 고품질 합성 데이터 생성 및 거래 마켓플레이스 제공.

### 1.2 기 구축된 시스템 인프라 현황 (Deployed Infrastructure)
*자세한 시스템 구성은 [`architecture/SYSTEM_ARCH.md`](./architecture/SYSTEM_ARCH.md) 문서를 참조하세요.*
*   **Frontend:** React 19, Vite, Tailwind CSS (현재 **Cloudflare Pages**에 배포 및 운영 중)
*   **Backend:** Python 3.11, FastAPI, SQLAlchemy 2.0 (현재 **Render.com** 웹 서비스로 배포 및 운영 중)
*   **Database:** PostgreSQL (**Supabase** Managed DB로 연동 완료)
*   **Storage (Data Lake):** **Google Drive API** (업로드된 영농일지 이미지 및 파일 보관용 스토리지)
*   **AI/Data:** Google Gemini 2.5 Pro Vision, 공공데이터포털 API (기상청).

### 1.3 🚨 핵심 QA 및 테스트 정책 (Testing & QA Policy)
*   **"모든 테스트는 배포 환경에서 이루어져야 비로소 통과(Passed)된 것으로 간주한다."**
*   로컬(Local) 환경에서의 기능 작동은 1차 검증일 뿐이며, 반드시 CI/CD를 거쳐 Render 및 Cloudflare에 배포된 이후, **실제 라이브 URL에서 E2E(End-to-End) 테스트가 성공해야** 해당 태스크가 완료된 것으로 취급합니다.
*   Google Drive 업로드 권한, CORS 이슈, Supabase 연결 안정성 등은 배포 환경에서만 정확히 검증 가능하기 때문입니다.

---

## 2. 상세 기획 및 요구사항 명세 (Detailed Requirements & Spec)

### 2.1 핵심 비즈니스 시나리오 (MDGA 4대 핵심 기능)
멘토링 피드백을 반영한 농업 AX(Agricultural AX) 피봇팅에 따른 최종 타겟 페르소나 및 핵심 서비스 로직은 분리된 상세 문서를 참조하십시오:
👉 **[핵심 서비스 기획 및 로직 (docs/service_logic/CORE_LOGIC_AND_PLANNING.md)](./service_logic/CORE_LOGIC_AND_PLANNING.md)**

*(참고: MVP 배포 버전에서는 외부 유료/공공 API 연동의 한계로 인해, '기상청(KMA)', '농진청(RDA)' 및 '쇼핑몰 매출 데이터', 'B2B 합성 데이터 엔진' 등은 백엔드 내에서 AI 기반의 동적 시뮬레이션으로 제공하도록 경계를 설정했습니다.)*

### 2.2 핵심 모듈 정의
#### A. 데이터 파이프라인 & AI 파서 (Data Pipeline Engine)
*   `Intent Analyzer` & `Data Extractor` 구조 구현.
*   **Google Drive 파일 매니저:** 이미지 업로드, 조회, 삭제 시 OAuth 최소 권한(drive.file)을 이용하여 엑세스 제어.

#### B. 계층형 데이터 관리 시스템 (Hierarchy Engine)
*   GeoJSON 매핑 및 Farm -> Region 롤업 로직 연산.

#### C. 합성 데이터 시뮬레이터 (Synthetic Data Generator)
*   기후 스트레스 계수 및 열 스트레스 지수(THI) 기반 수확량 변동성 시뮬레이션.

---

## 3. 프로젝트 일정 및 마일스톤 (Project Schedule & Milestones)

이미 인프라 및 CI/CD가 구축되어 있으므로, 비즈니스 로직 고도화 및 안정화에 집중합니다.

*   **Sprint 1: 기반 로직 고도화 및 Google Drive 스토리지 연동**
    *   FastAPI와 Google Drive API 연동 고도화 (이미지 저장 및 권한 제어).
    *   Gemini 2.5 Pro Vision 2-Step 파서 완성 및 배포 환경 테스트.
*   **Sprint 2: 롤업(Roll-up) 엔진 및 공간 매핑 적용**
    *   Supabase DB 상의 Farm 데이터를 Region 단위로 롤업하는 비동기 서비스 구현.
    *   프론트엔드(Cloudflare) Leaflet.js 기반 Twin Map 렌더링.
*   **Sprint 3: 합성 데이터 시뮬레이터 적용**
    *   기후 시나리오에 따른 예측 수확량 및 THI 산출 로직 구현.
    *   생성된 데이터를 Supabase `synthetic_data`에 적재.
*   **Sprint 4: 데이터 마켓플레이스 UI/UX 및 연동**
    *   마켓플레이스 카탈로그 및 결제 모의 화면 구현.
    *   데이터 구매용 API Key 발급 시스템 구현 완료 (`DataAPIKey` 테이블 연동 및 프론트엔드 UI 통합).
*   **Sprint 5: 배포 환경 E2E 테스트 및 최적화**
    *   **[필수]** 전체 플로우(업로드 -> Google Drive -> Gemini 파싱 -> Supabase 적재 -> 시각화)를 Render 실서버에서 통합 테스트. `test_live.py` 스크립트를 통한 라이브 E2E 테스트 검증 완료.
    *   Render.com 무료 티어의 한계(Sleep)를 극복하기 위해 **Starter ($7)** 요금제로 무중단 운영 환경 적용.
*   **Sprint 6: Mockup 제거 및 실데이터(Real Data) 파이프라인 완성 (현재 완료 상태)**
    *   가짜(Random) 시드 데이터 대신, **Hugging Face (`jason1966/aksahaha_crop-recommendation`)** 오픈 데이터셋을 다운로드 및 정제하여 실제 DB 초기 상태(Initial State) 적재.
    *   프론트엔드 하드코딩(Mockup) 전면 제거. B2B 마켓 이미지 업로드 및 AI 실시간 판별 로직(Gemini 연동), 지갑(Wallet) 잔액 조회, CSV Export 등 사용자 End-to-End 워크플로우 100% 백엔드 API 연동 완료.

---

### 4.2 문서 관리 구조 (`/docs`)
```text
docs/
├── PROJECT_SPEC_AND_PLAN.md    # 현재 문서 (전체 프로젝트 명세 및 계획)
├── PORTFOLIO_GUIDE.md          # 포트폴리오 및 면접용 핵심 성과 가이드
├── README.md                   # 전체 문서 통합 인덱스 (목차)
├── architecture/               # 아키텍처 및 시스템 설계
│   ├── SYSTEM_ARCH.md          # 인프라 구성도, 배포 전략, 시퀀스 다이어그램
│   └── DB_SCHEMA.md            # ERD 명세 및 테이블 컬럼 상세 정의서
├── api/                        # API 연동 규격서
│   ├── REST_API_DOCS.md        # 백엔드 제공 RESTful API 명세
│   └── EXTERNAL_API_DOCS.md    # 외부 API 연동 가이드
├── infrastructure/             # 🛠 인프라스트럭처 명세
│   ├── CURRENT_STATE.md        # 현재 배포 인프라 상세 분석 (Render, Supabase 등)
│   ├── DEPLOYMENT_GUIDE.md     # 환경 변수, CI/CD, 마이그레이션 등 배포 가이드
│   ├── SECURITY_COMPLIANCE.md  # 통신, 저장, 권한(OAuth, JWT, RLS) 보안 정책
│   └── FUTURE_EXPANSION.md     # Redis, PostGIS, Task Queue 등 향후 확장 로드맵
├── design/                     # 화면 및 사용자 플로우 설계
│   └── USER_FLOW.md            # 유저 시나리오 및 플로우 차트 설명
├── requirements/               # 요구사항 및 정책 명세
│   └── BUSINESS_RULES.md       # 핵심 비즈니스 로직 및 제약사항
└── service_logic/              # 농업 AX 타겟 페르소나 및 핵심 서비스 로직 상세 정의
    └── CORE_LOGIC_AND_PLANNING.md
```
