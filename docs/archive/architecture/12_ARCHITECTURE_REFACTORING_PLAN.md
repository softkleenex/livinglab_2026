# MDGA: Architecture & Folder Structure Refactoring Plan (v2.0)

## 1. 개요 (Overview)
현재 MDGA 프로젝트는 단기간에 급격한 기능 추가(B2B 스마트팜 피벗, 거버넌스 시뮬레이터 차트 고도화, 실시간 WebSocket, 글로벌 토스트 알림 등)를 겪으며 하나의 파일(`App.jsx` 및 `main.py`)에 너무 많은 로직이 비대하게 집중되었습니다(Monolithic Anti-pattern). 
지속 가능한 개발(Sustainable Development)과 유지보수성(Maintainability), 그리고 향후 다양한 산업군으로의 무한 확장을 위해 **폴더 구조 및 코드 아키텍처의 전면적인 리팩토링(Refactoring)**을 계획합니다.

## 2. 현행 구조의 문제점 (Pain Points)
*   **프론트엔드 (`frontend/src/App.jsx` - 약 1100줄):**
    *   상태 관리(State), API 호출(Data Fetching), UI 렌더링(JSX), 애니메이션 로직(Framer Motion)이 한 곳에 섞여 있어 가독성이 떨어짐.
    *   새로운 컴포넌트(예: ReportModal, WalletModal, GovernanceSim)를 추가할 때마다 파일이 무거워져 렌더링 병목 현상(Re-rendering bottleneck) 우려.
*   **백엔드 (`backend/app/main.py` - 약 600줄):**
    *   라우터(API Endpoints), 비즈니스 로직(HierarchyEngine), 외부 API 연동(Open-Meteo, Google Drive), LLM 연동(Gemini)이 분리되지 않음.
    *   테스트 코드 작성이 까다롭고, 특정 로직 수정 시 전체 앱의 안정성에 영향을 줌.

## 3. 리팩토링 목표 구조 (Target Architecture)

### 3.1. Frontend (React + Vite)
도메인 중심 설계(Feature-Driven) 및 관심사 분리(Separation of Concerns).

```text
frontend/src/
├── components/          # 공통/재사용 가능한 UI 컴포넌트
│   ├── common/          # Badge, BigStat, Toast, Sparkline
│   ├── dashboard/       # PersonalDashboard, GovernanceSim, DigitalTwinMap
│   └── modals/          # ReportModal, WalletModal, IngestModal
├── pages/               # 메인 화면, 온보딩 화면 등 페이지 레벨
│   ├── MainApp.jsx
│   └── Onboarding.jsx
├── hooks/               # Custom Hooks (API, WebSocket 등)
│   ├── useHierarchy.js
│   └── useWebSocket.js
├── utils/               # 유틸리티 함수 (API Client, Constants)
│   └── api.js
├── assets/              # 이미지, 아이콘
└── App.jsx              # 라우팅 및 전역 상태 제공자 (초경량화)
```

### 3.2. Backend (FastAPI)
계층형 아키텍처(Layered Architecture) 적용.

```text
backend/app/
├── core/                # 설정, 전역 상태, 데이터베이스, 의존성 주입
│   ├── config.py        # 환경변수(Env) 및 앱 설정
│   └── engine.py        # HierarchyEngine 싱글톤 인스턴스
├── models/              # Pydantic 모델 및 데이터 스키마
│   └── schemas.py
├── routers/             # API 엔드포인트 정의 (컨트롤러)
│   ├── ingest.py
│   ├── dashboard.py
│   └── simulation.py
├── services/            # 비즈니스 로직 및 외부 서비스 연동
│   ├── ai_service.py    # Gemini LLM 호출
│   ├── weather.py       # Open-Meteo 연동
│   └── drive.py         # Google Drive 업로드
└── main.py              # FastAPI 앱 초기화 및 미들웨어/라우터 등록 (초경량화)
```

## 4. 리팩토링 추진 계획 (Action Plan)
1.  **Phase 1: 백엔드 분리 (Backend Modularization)**
    *   가장 치명적인(Critical) 비즈니스 로직이 담긴 백엔드부터 쪼갭니다.
    *   메모리 부족(OOM) 방지를 위해 한 번에 1~2개의 서비스/라우터 파일씩 안전하게 이동시킵니다.
    *   **테스트:** 변경 후 라이브 서버(Render)에 배포하여 E2E 스크립트로 동작 확인.
2.  **Phase 2: 프론트엔드 모달/컴포넌트 분리 (Frontend Extraction)**
    *   `App.jsx`에서 `WalletModal`, `ReportModal`, `GovernanceSim` 등 덩치가 큰 컴포넌트들을 별도 파일로 추출합니다.
    *   **테스트:** 로컬 빌드(`npm run build`) 후 Cloudflare Pages 라이브 서버에 배포하여 화면 렌더링 확인.
3.  **Phase 3: 상태 관리 및 훅 분리 (State & Hooks)**
    *   복잡한 `useEffect`와 WebSocket 통신 로직을 커스텀 훅으로 빼내어 테스트 용이성을 극대화합니다.

## 5. 결론 및 기대 효과 (Conclusion & Impact)
이 구조로 개편되면, 추후 "물류업", "관광업", "부동산" 등 새로운 산업군이 추가되거나, 새로운 대시보드 테마가 도입되더라도, 기존 코드를 건드리지 않고 해당 폴더에 파일만 추가(Open-Closed Principle)하는 방식으로 **무한 확장**이 가능합니다. 
또한 개발자가 각 모듈별로 명확히 코드를 관리할 수 있어 유지보수 효율성이 500% 이상 증가합니다.