# 🏆 MDGA: Final Architecture & Implementation Specs

본 문서는 `livinglab_2026` 프로젝트의 **최종적으로 구현된 아키텍처 및 시스템 명세**를 정리합니다. 초기 기획서의 "바텀업(Bottom-Up) 데이터 기여 모델"과 "페르소나별 맞춤형 워크스페이스"를 기반으로, 추가적으로 도입된 혁신 기능(Vision AI, WebSocket, PWA)들을 포함합니다.

---

## 1. 🏗️ 시스템 아키텍처 개요 (System Architecture)

전체 시스템은 **React(Vite) + TailwindCSS** 기반의 프론트엔드 모바일-퍼스트 웹앱과, **FastAPI + Python + Google Gemini AI** 기반의 지능형 백엔드로 구성됩니다.

- **Frontend (Web App / PWA)**
  - UI/UX: 다크 테마(Deep Navy) 기반의 App-like 모바일 퍼스트 디자인.
  - State & Routing: 가상 경로 기반 탐색(`currentPath`) 및 하단 내비게이션(Bottom Nav)을 이용한 페르소나별 탭 렌더링.
  - PWA: `manifest.json` 적용으로 모바일 기기 홈 화면 설치(Add to Home Screen) 완벽 지원.

- **Backend (FastAPI / Render)**
  - REST API: 컨텍스트 설정, 대시보드 데이터 페치, 정책 시뮬레이터 차트 연동.
  - Base URL: `https://mdga-api.onrender.com`
  - Hierarchy Engine 2.0: 데이터를 `Store -> Street -> Dong -> Gu` 형태로 롤업(Roll-up)하여 자산(Asset Value)과 맥박(Pulse Rate)을 집계하는 인메모리 트리 구조.
  - 외부 연동: Google Drive(이미지 원본 저장용, `GOOGLE_DRIVE_FOLDER_ID` 연동), Google Gemini API (최신 **Gemini 2.5 Flash** 모델 사용).
  - 공공 API 시딩: 서버 시작 시 `jsonplaceholder` 등을 활용해 가상 랜드마크(경대북문, 동성로 등) 상권 데이터를 자동 시딩.

---

## 2. ⚡ 실시간 데이터 동기화 (WebSocket Real-time Updates)

**"누군가 데이터를 올리면, 관리자의 지도가 살아 숨쉰다."**

- **구현 방식**: FastAPI의 `WebSocket` 채널(`ws/updates`)을 개설하고, 중앙 `ConnectionManager`가 연결된 모든 클라이언트(프론트엔드)를 관리.
- **WebSocket URL**: `wss://mdga-api.onrender.com/ws/updates`
- **동작 원리**: 
  1. `소상공인` 페르소나가 자신의 매장에서 **영수증/데이터를 업로드(Ingest)**.
  2. Hierarchy Engine에서 해당 노드 및 부모 노드들의 **Pulse Rate(맥박)와 Value(자산)** 상승.
  3. `ConnectionManager.broadcast()`를 통해 연결된 모든 기기(상권 리더의 트윈 맵 등)에 업데이트 이벤트 전송.
  4. 프론트엔드의 전역 `useEffect`가 이벤트를 수신하여 **새로고침 없이 실시간으로 대시보드 리렌더링(Refetch)**.

---

## 3. 👁️ 멀티모달 Vision AI 피딩 (Hyper-Feeding)

텍스트뿐만 아니라 **이미지 형태의 오프라인 데이터(영수증, 장부, 매장 사진 등)를 디지털 자산화**합니다.

- **업로드 UI**: 프론트엔드 Ingest Modal에서 파일이 선택되면 `URL.createObjectURL`을 통해 모달 내에 다크 톤의 **Vision AI Ready** 프리뷰(Preview) 제공.
- **백엔드 분석**: `multipart/form-data`로 전송된 이미지(`UploadFile`)를 `PIL.Image` 스트림으로 변환. 
- **AI Core**: **Gemini 2.5 Flash** 연동. 프롬프트 텍스트와 함께 멀티모달 입력(Image 객체)을 던져 매장 전경 피드백, 영수증 품목 기반 인사이트 등 시각적인 "가상 지능 분석" 솔루션을 도출하여 사용자에게 즉각 반환.
- **데이터 보존**: 업로드된 이미지는 서버 메모리에 머물지 않고 즉시 **Google Drive**의 지정된 폴더로 전송되어 영구 링크(`webViewLink`)로 변환 및 저장됩니다.

---

## 4. 📈 데이터 분석 및 시각화 (Advanced Analytics)

- **Sparkline 실시간 차트**: 각 매장과 상권 노드의 **최근 10회 활동 데이터**를 기반으로 한 경량 SVG 스파크라인 차트를 도입했습니다.
  - 소상공인은 자신의 매장 맥박(Pulse) 변화 추이를 시각적으로 확인 가능.
  - 상권 리더와 정책 담당자는 트윈 맵 리스트에서 각 노드의 활성도 트렌드를 한눈에 파악.
- **다이내믹 데이터 시딩**: 공공 API와 연동하여 대구광역시 전역의 가상 상권 데이터를 수집하고, 각 노드에 랜덤한 히스토리 데이터를 부여하여 시스템 시작 시점부터 풍부한 시각적 정보를 제공합니다.

---

## 5. 🧭 페르소나별 뷰와 어플리케이션 플로우 (App Flow)

### 🧑‍🍳 Level 1: 소상공인 (Store Level)
- **온보딩**: 산업군(요식업 등)과 상세 매장 주소 입력.
- **내 매장 대시보드**: 내 매장의 자산(₩) 및 맥박(BPM) 확인, 주변 상권 평균치와의 비교. 실시간 AI 컨설팅(보상) 내역 확인.
- **데이터 피딩 (번개 아이콘)**: 영수증/전경 텍스트+이미지 멀티모달 업로드 및 실시간 자산 획득.

### 🤝 Level 2: 상권 리더 (Street/Dong Level)
- **온보딩**: 관리하는 상권(동, 거리) 영역까지만 입력.
- **트윈 맵 (Explorer)**: 하위 노드(상점들)의 리스트업. 리스트에는 각 상점의 **ACTIVITY(BPM)** 가 색상(녹색/적색) 게이지 및 수치로 시각화되어 표기됨.
- **정책 시뮬레이터**: 예산 슬라이더 조절 후 AI 시뮬레이션 실행 -> 성장률 막대 차트(Impact Analysis) 애니메이션 확인.

### 🏛️ Level 3: 정책 담당자 (Gu/City Level)
- **온보딩**: 특정 구역 할당 없이 대구광역시(City Level) 전체 권한으로 진입.
- **디지털 트윈 맵 (전체 관망)**: 초기 시딩된 모든 구/동/거리의 활성도와 노드 밀집도 조망.
- **거버넌스 시뮬레이터**: 거시적 예산 투입에 대한 지역별 파급 효과(ROI, 일자리) 분석.

---

## 5. 🛠️ 기술 스택 및 라이브러리 요약
- **Frontend**: `React 18`, `Vite`, `TailwindCSS v4 (Inline CSS)`, `framer-motion` (애니메이션), `lucide-react` (아이콘 팩), `axios` (HTTP 및 WS).
- **Backend**: `FastAPI`, `Uvicorn`, `google-generativeai`, `Pillow`, `google-api-python-client` (Drive), `websockets`.
- **CI/CD**: 프론트엔드는 **Cloudflare Pages**(`https://mdga-2026.pages.dev/`)를 통해 Edge 배포되며, 백엔드는 Render.com 에 연동되어 무결성 검증 및 배포됩니다.

이로써 **MDGA: Universal Data Engine**의 최종 MVP(Minimum Viable Product)는 실시간 통신, 멀티모달 AI, 반응형 PWA가 융합된 완벽한 프로토타입으로 완성되었습니다.