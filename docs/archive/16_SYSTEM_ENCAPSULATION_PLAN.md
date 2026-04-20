# MDGA System EncapsULATION & Architecture Review

현재 MDGA 프로젝트의 개발 및 서비스 구조에 대한 전반적인 진단과, 유지보수 및 확장성을 위한 캡슐화(Encapsulation)/체계화 계획입니다. 데모와 빠른 배포(MVP)를 위해 단일 파일에 몰아넣은(Monolithic) 로직들을 엔터프라이즈급 소프트웨어 구조로 분리하는 것이 핵심입니다.

## 1. 현재 아키텍처의 한계 및 진단 (Pain Points)

### 🚨 프론트엔드 (React / Vite)
*   **비대해진 `App.jsx` (God Object):** `App.jsx` 파일 하나가 온보딩(Onboarding), 지도 클릭 처리(MapController), 역지오코딩(Reverse Geocoding), 글로벌 상태 관리(UserContext, Toast), 라우팅(MainApp 탭 전환), 웹소켓 통신까지 모든 역할을 떠맡고 있습니다. 코드가 800줄이 넘어 유지보수가 매우 어렵습니다.
*   **상태 관리 부재:** Context API나 Zustand/Redux 같은 전역 상태 관리자 없이 컴포넌트 간 Props Drilling(데이터 내려주기)으로만 앱이 굴러가고 있어, 하위 컴포넌트(`DataMarket`, `QuestBoard` 등)에서 유저 정보를 쓸 때마다 Prop을 넘겨줘야 하는 번거로움이 있습니다.

### 🚨 백엔드 (FastAPI)
*   **비대해진 `main.py`:** 서버 실행, CORS 설정, FastAPI 라우터(API Endpoints), WebSocket 관리, Google Drive API 통신 로직, Gemini AI 프롬프트 생성 로직이 모두 `app/main.py` 한 곳에 묶여 있습니다.
*   **도메인 로직 혼재:** 데이터 수집(`ingest`), 채팅(`chat`), 권한 관리, 시뮬레이션 로직이 분리되어 있지 않고 컨트롤러에 그대로 노출되어 있어 테스트(Unit Test)를 작성하기가 어렵습니다.

### 🚨 개발 환경 및 DevOps 스크립트
*   **루트 디렉터리 난잡함:** 임시로 작성된 데이터 생성 스크립트(`seed_production.py`), UI 패치 스크립트(`add_combobox.js`), 테스트 스크린샷 봇(`take_playwright_shots.py`) 등 각종 `.js`, `.py` 스크립트들이 루트 폴더에 흩어져 있었습니다.

---

## 2. 캡슐화 및 체계화 계획 (Refactoring Plan)

이러한 문제들을 해결하고, 확장 가능하고 체계적인 "엔터프라이즈 구조"로 가기 위한 액션 아이템입니다.

### 🛠 1단계: 프로젝트 폴더 및 스크립트 체계화 (진행 완료 ✅)
루트 폴더에 지저분하게 널려있던 자동화 스크립트들과 봇들을 모두 `scripts/` 폴더로 모아 캡슐화했습니다.
*   **`scripts/` 폴더 신설:** 
    *   `take_playwright_shots.py` (E2E 테스트 및 스크린샷 봇)
    *   `seed_production.py` (데이터 레이크 및 DB 강제 시딩 봇)
    *   `clean_*.js`, `modify_*.js` (일회성 패치 스크립트들 보관)

### 🧩 2단계: 백엔드(FastAPI) 도메인 주도 설계(DDD) 적용 (예정)
`app/main.py`의 기능들을 용도별로 찢어서 캡슐화합니다.
*   `app/api/` (라우터 분리)
    *   `endpoints/ingest.py` (데이터 업로드/삭제 로직)
    *   `endpoints/dashboard.py` (차트/CSV 다운로드 등 조회 로직)
    *   `endpoints/ai.py` (Copilot 채팅 및 리포트 로직)
*   `app/services/` (비즈니스 로직 캡슐화)
    *   `google_drive.py` (get_drive_service, get_or_create_folder 등 드라이브 통신 전용 클래스)
    *   `gemini_ai.py` (프롬프트 빌딩, 모델 호출 전용 로직)
*   `app/core/` (인프라)
    *   `websocket.py` (ConnectionManager 분리)

### ⚛️ 3단계: 프론트엔드(React) 컴포넌트 및 상태 분리 (예정)
거대한 `App.jsx`를 쪼개어 단일 책임 원칙(SRP)을 부여합니다.
*   **상태 관리 분리:** `UserContext`와 `ToastContext`를 만들어, `App.jsx`에서 전역 상태를 감싸서(Provider) 하위 컴포넌트들이 `useContext`로 바로 빼서 쓸 수 있게 만듭니다. (Props 지옥 해결)
*   **페이지 단위 캡슐화:** 
    *   `src/pages/Onboarding.jsx` (초기 진입부 및 지도 클릭 로직 분리)
    *   `src/pages/MainLayout.jsx` (바텀 네비게이션 및 헤더 틀 분리)
*   **서비스 훅 분리:** 
    *   `src/hooks/useReverseGeocode.js` (Nominatim API 통신 분리)
    *   `src/hooks/useWebsocket.js` (실시간 서버 통신 분리)

---

## 3. 평가 및 제언
현재 서비스는 기능적으로 "모든 톱니바퀴가 라이브 환경에서 100% 정상 작동"하는 완벽한 수준입니다. (기능적 버그는 모두 잡혔습니다.)
하지만 상재님 말씀대로 **코드 레벨에서의 캡슐화(구조화)**가 되어 있지 않기 때문에, 만약 서비스 출시 후 새로운 기능(예: 결제 모듈, 관리자 전용 어드민 페이지)을 붙이려고 하면 `App.jsx`와 `main.py`가 폭발할 위험이 높습니다.

👉 **위에서 제시한 2단계(백엔드 분리)와 3단계(프론트 분리)를 지금 바로 진행하여 코드들을 체계적으로 찢어(Refactoring) 놓을까요?** 기능의 변화는 전혀 없이, 구조만 예쁘게 아키텍처링 하는 작업입니다!
