# MDGA: Final Technical & Functional Specifications (v3.0)

## 1. 개요 (Executive Summary)
본 문서는 MDGA(Living Lab 2026) 프로젝트의 기능적(Functional), 기술적(Technical), 그리고 운영적(Operational) 스펙을 총망라한 최종 명세서입니다. 초기 아이디어였던 단순 상권 데이터 취합 앱에서 벗어나, **PWA, STT/TTS, PostgreSQL, 실시간 기상청 데이터가 결합된 초거대 B2B 데이터 자산화 SaaS**로 진화한 모든 내용을 담고 있습니다.

## 2. 기능적 명세 (Functional Specifications)

### 2.1. 사용자 페르소나 및 온보딩 (Onboarding)
*   **Guest 모드:** 신뢰도 가중치에 페널티를 받는 익명 사용자.
*   **Store/Farm 모드 (구글 로그인):** 특정 산업군(요식업, 스마트팜 등)과 위치를 지정하여 진입하는 생산자/사업자. 입력된 산업군에 따라 앱 내 모든 AI 프롬프트와 UI(리포트 이름 등)가 동적으로 변경됨.
*   **Gov/Leader 모드:** 하위 노드들의 데이터를 익명화하여 롤업(Roll-up)된 통계로 보는 정책 담당자 및 상인회장.

### 2.2. 데이터 수집 및 자산화 (Data Ingestion)
*   **Vision AI 기반 영수증/일지 스캔:** 사진을 업로드하면 Gemini Pro Vision이 내용을 텍스트로 추출하여 분석.
*   **AI Voice Assistant (STT):** 키보드 입력이 불편한 현장 작업자를 위해, Web Speech API 기반 음성 녹음 기능을 제공. 마이크 펄스 애니메이션이 적용된 모달에서 음성을 텍스트로 변환 후 업로드.
*   **신뢰도 및 자산화 로직 (Trust Index):** 업로드된 데이터는 AI 교차 검증을 통해 0~100점의 신뢰 지수를 부여받으며, 이에 비례하여 `$MDGA` 토큰(자산)이 지급됨.

### 2.3. B2B 맞춤형 대시보드 및 리포트 (Dashboard & Report)
*   **듀얼 지표 대시보드:** 누적 자산과 AI 예측 성장률(Pulse)을 실시간 스파크라인(Sparkline) 차트로 제공.
*   **주간 컨설팅 리포트 (기상청 연동):** `Open-Meteo API`를 통해 타겟 지역의 7일간 기상 데이터(최고기온, 강수량 등)를 실시간으로 가져와, 사용자의 산업군(Industry)에 맞게 프롬프트에 주입하여 완벽한 맞춤형 AI 리포트 생성.
*   **리포트 읽어주기 (TTS):** 생성된 리포트를 음성 합성 엔진(Speech Synthesis)을 통해 스마트폰 스피커로 읽어주는 기능 제공.
*   **데이터 추출 (CSV Export):** 자신이 올린 전체 데이터를 엑셀 등에서 활용할 수 있도록 CSV 포맷으로 즉시 다운로드.

### 2.4. 거버넌스 및 데이터 경제 생태계 (Governance & Market)
*   **디지털 트윈 맵 (React-Leaflet):** 구청/시청 담당자의 대시보드에 하위 상권/농장들이 실제 위도/경도(Lat/Lng) 기반 마커로 지도 위에 렌더링 됨.
*   **정책 시뮬레이터 (GovernanceSim):** 특정 지역에 예산을 투입할 때 발생하는 ROI, 일자리 창출 효과를 AI가 모의실험하고 Framer Motion 막대그래프로 시각화.
*   **Quest Board (데이터 현상금):** 공공기관이 필요한 데이터에 현상금을 걸고 소상공인이 퀘스트를 수락하여 데이터를 제공하는 크라우드소싱 시스템.
*   **Data Market:** 모인 `$MDGA` 토큰을 사용해 타 업종/지역의 정제된 고급 데이터셋을 구매.
*   **MDGA Wallet:** 누적된 토큰을 실제 원화(KRW)로 환전 신청하는 플로우(UI) 완비.

---

## 3. 기술적 명세 (Technical Specifications)

### 3.1. Frontend Architecture
*   **Framework:** React 18, Vite 6
*   **PWA (Progressive Web App):** `vite-plugin-pwa`를 적용하여 Web Manifest(`manifest.webmanifest`)와 Service Worker를 자동 생성. 스마트폰 홈 화면에 아이콘 형태로 앱 설치 지원 및 오프라인 정적 파일 캐싱 적용.
*   **State Management:** 모놀리식 `App.jsx` 구조를 탈피하여, `src/components/dashboard` 및 `src/components/modals` 폴더로 철저한 컴포넌트 분리(Modularization).
*   **Styling & Animation:** TailwindCSS, Framer Motion (부드러운 모달 트랜지션, 퀘스트 수락 시 레이아웃 점프 방지, 시뮬레이터 막대그래프 성장 애니메이션).
*   **Map API:** `react-leaflet`, `leaflet` (CARTO Dark Matter 테마 적용).

### 3.2. Backend Architecture
*   **Framework:** FastAPI (비동기 I/O 최적화).
*   **Database:** SQLAlchemy ORM (`app/core/database.py`). 로컬에서는 SQLite, 실서버(Render)에서는 환경변수(`DATABASE_URL`)를 감지해 PostgreSQL로 자동 전환. 데이터 영구 보존(Persistence) 달성.
*   **Engine Logic:** `app/core/engine.py`로 핵심 트리 노드 탐색 및 롤업 엔진 분리.
*   **Hyper-Realistic Seed Data:** 앱 초기 구동 시, 단순한 더미 데이터가 아닌 "스마트팜", "요식업", "첨단 제조업" 등 실제 B2B 환경에 부합하는 고품질 모의 데이터(매출 수천만 원 단위, 디테일한 고용/생산 인사이트 포함)를 DB와 계층 트리에 자동 주입(`seed_initial_data`)하여 시연(Demo) 완성도를 극대화.
*   **External Integrations:**
    *   `httpx`: 비동기 기상청 데이터(Open-Meteo) 호출.
    *   `google.generativeai`: Gemini 1.5 모델 호출 (Vision 및 Text 처리).
    *   `google-api-python-client`: 구글 드라이브 이미지 저장 연동.
*   **Real-time Comm:** WebSockets 기반 전역 알림(Toast) 및 대시보드 상태 갱신.

---

## 4. 운영 및 배포 명세 (Operational Specifications)

### 4.1. 배포 파이프라인 (CI/CD)
운영 효율성을 극대화하기 위해 Shell Script 기반 원클릭(One-click) 배포 스크립트를 구현했습니다.
*   **`dev_ops/deploy_prod.sh`**: git add/commit/push 후 Render.com 워크스페이스를 스캔하여 백엔드 API 서비스 배포 명령(Deploy Trigger)을 전송.
*   **`dev_ops/deploy_frontend.sh`**: 프론트엔드 폴더에서 `npm run build` 후 `npx wrangler pages deploy` 명령을 통해 Cloudflare Pages 글로벌 엣지 CDN에 수 초 내에 무중단 배포.

### 4.2. 보안 및 안정성
*   **Error Handling:** 프론트엔드의 거의 모든 버튼과 API 호출부에 로딩 스피너(`RefreshCw`)와 에러 핸들링 로직(에러 발생 시 Global Toast 팝업) 적용.
*   **Graceful Degradation:** 공공 API 통신 실패 시, 하드코딩된 Fallback 데이터를 사용하도록 설계되어 서버 크래시 방지 (Pytest 통과).
*   **CORS:** 백엔드 미들웨어에서 Cloudflare Pages 도메인만 허용하도록 화이트리스트 관리.

## 5. 결론
이 명세서는 MDGA가 단순히 "아이디어"에 머물지 않고, 확장 가능한 백엔드 DB 구조, 세련된 UI/UX 애니메이션, 그리고 실제 라이브 서비스(PWA, CDN 배포)로 동작하는 **현업 수준의 상용 소프트웨어(Enterprise-ready SaaS)**임을 입증합니다.
## 5. Google Drive Data Lake Integration
*   **Hierarchical Dynamic Routing:** 백엔드는 업로드된 데이터의 위치 정보(예: `대구광역시/달서구/성서산업단지/미래반도체`)를 기반으로 Google Drive API를 호출하여, 실시간으로 폴더 계층(Tree) 구조를 탐색 및 자동 생성합니다.
*   **Origin & Generated 분리 저장:** 
    *   최하단 사업장(Store) 폴더 내부에 `origin`과 `generated` 폴더를 자동 구축합니다.
    *   **origin:** 사용자가 업로드한 원본 텍스트(RawText) 및 원본 이미지 파일 보관.
    *   **generated:** Gemini 1.5 Pro 모델이 원본 데이터를 분석하여 도출한 산업군 특화 컨설팅 인사이트(AI_Insight) 텍스트 파일 보관.
*   **영구 삭제 동기화:** 사용자가 프론트엔드 대시보드에서 데이터 삭제 시, DB 레코드 삭제 및 신뢰도/자산가치 차감뿐만 아니라, Google Drive API를 통해 실제 드라이브 내 원본 파일까지 완전히 영구 삭제(Garbage Collection)하여 스토리지 누수를 방지합니다.
