# MDGA (Multi-dimensional Data Gathering Architecture)

![MDGA Banner](https://img.shields.io/badge/MDGA-Universal%20Data%20Engine-101725?style=for-the-badge&logo=databricks&logoColor=3b82f6)
![Vite](https://img.shields.io/badge/vite-%23646CFF.svg?style=for-the-badge&logo=vite&logoColor=white)
![React](https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB)
![TailwindCSS](https://img.shields.io/badge/tailwindcss-%2338B2AC.svg?style=for-the-badge&logo=tailwind-css&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-005571?style=for-the-badge&logo=fastapi)
![PostgreSQL](https://img.shields.io/badge/postgresql-4169e1?style=for-the-badge&logo=postgresql&logoColor=white)
![Gemini](https://img.shields.io/badge/Gemini%201.5%20Pro-8E75B2?style=for-the-badge&logo=googlebard&logoColor=white)

**MDGA(Living Lab 2026)**는 데이터 파편화 문제를 해결하고 소상공인, 스마트팜 농부, 지역 상권 리더, 정책 담당자를 하나로 연결하는 **초거대 B2B 데이터 자산화 SaaS 플랫폼**입니다.

사용자의 산업군(요식업, 스마트팜 등)을 동적으로 인식하여 1초 만에 맞춤형 대시보드로 변신하며, AI가 실시간 날씨 데이터와 상권 데이터를 결합해 완벽한 경영 컨설팅을 제공합니다.

🌐 **Live Demo (PWA 지원):** [https://mdga-2026.pages.dev](https://mdga-2026.pages.dev)

---

## 🔥 핵심 기능 (Core Features)

### 1. 🎤 Voice & Vision AI Ingestion (장갑 낀 농부도 1초 만에 기록)
*   **음성 기록 (STT):** 키보드를 칠 수 없는 현장(주방, 비닐하우스)에서 스마트폰 마이크 버튼만 누르면 음성을 텍스트로 자동 변환 및 데이터베이스에 자산화.
*   **비전 스캔:** 수기 영농일지나 장부, 매장 전경 사진을 업로드하면 Vision AI가 분석하여 인사이트 추출.

### 2. 🧠 Context-Aware AI Copilot (나만의 산업별 챗봇)
*   **산업군 자동 인식:** 온보딩 시 '요식업', '스마트팜', '서비스업' 등을 입력하면 AI 프롬프트가 해당 산업에 맞게 즉시 재구성.
*   **실시간 날씨(Open-Meteo) 융합:** "다음 주 비가 오니 배달을 늘리세요", "기온이 오르니 파종 간격을 넓히세요" 등 기상청 API와 융합된 소름 돋는 주간 리포트 발행.
*   **TTS 음성 피드백:** 글씨를 읽기 힘든 현장 작업자를 위해 AI가 경영 조언을 스피커로 또렷하게 읽어주는 Text-To-Speech 엔진 탑재.

### 3. 💸 Web3.0 토큰 이코노미 & 마켓 (데이터가 돈이 되는 세상)
*   **$MDGA Wallet:** 사용자가 데이터를 업로드할 때마다 AI 교차 검증(Trust Index)을 거쳐 가상 토큰 지급 및 원화(KRW) 환전 시뮬레이션 지원.
*   **Trust Data Market:** 모인 토큰으로 타 지역/타 업종의 고급 분석 데이터셋(예: "산격동 스마트팜 생육-날씨 상관관계")을 구매할 수 있는 거래소 구축.
*   **Quest Board (데이터 현상금):** 공공기관/상인회가 특정 데이터 수집을 위해 현상금을 걸고, 현장 사용자들이 능동적으로 데이터를 제출하는 크라우드 소싱 기반의 퀘스트 시스템.

### 4. 🗺️ 디지털 트윈 맵 & 거버넌스 시뮬레이터 (공공기관용)
*   **실시간 디지털 트윈 (React-Leaflet):** 개별 상점과 농장에서 모인 데이터가 익명화되어 구청/시청 담당자의 대시보드 지도 위에 실시간 마커로 렌더링.
*   **예산 투입 시뮬레이터:** 1억 원의 예산을 특정 구역에 투입했을 때 발생하는 ROI, 일자리 창출, 산업별 파급 효과(Impact Index)를 화려한 Framer-Motion 차트와 함께 AI가 사전 모의실험.

### 5. 📊 하이퍼 리얼리즘 초기 모의 데이터 (Hyper-Realistic Seed Data)
*   **산업별 맞춤형 시드 데이터:** 앱 초기 진입 시 빈 화면이 아닌, "스마트팜", "요식업", "제조업" 등 실제 현장에서 발생할 법한 구체적이고 현실적인 고용 창출 및 매출 지표(수백~수천만 원 단위)가 데이터베이스에 자동 주입되어 있어 즉각적인 테스트 및 완벽한 B2B 데모 시연이 가능합니다.

---

## 🛠️ 기술 스택 (Tech Stack)

### Frontend (PWA Ready)
*   **Framework:** React 18 + Vite
*   **Styling:** Tailwind CSS + Framer Motion (고급 애니메이션)
*   **Map & UI:** React-Leaflet (CARTO Dark Matter 타일), Lucide React (아이콘)
*   **PWA:** `vite-plugin-pwa` (스마트폰 홈 화면 설치 및 오프라인 캐싱 지원)
*   **Deployment:** Cloudflare Pages (글로벌 엣지 무중단 배포)

### Backend (Robust API)
*   **Framework:** FastAPI (Python 3.12+)
*   **AI Engine:** Google Gemini 1.5 Pro/Flash (비전, 텍스트, 컨텍스트 융합)
*   **Database:** SQLAlchemy ORM (PostgreSQL 실서버 연동 / SQLite 로컬 폴백)
*   **Real-time:** WebSockets (데이터 피딩 시 전역 대시보드 즉시 동기화)
*   **External APIs:** Open-Meteo (무료 기상청 API), Google Drive API (미디어 스토리지)
*   **Deployment:** Render (자동 빌드 및 배포 파이프라인)

---

## 📂 프로젝트 구조 (Architecture)

프론트엔드는 확장을 위해 완벽한 모듈화(Phase 2)를 거쳤으며, 백엔드는 계층형(Layered) 구조를 채택했습니다.

```text
livinglab_2026/
├── frontend/                 # PWA 프론트엔드 (React + Vite)
│   ├── src/
│   │   ├── components/
│   │   │   ├── dashboard/    # DataMarket, DigitalTwinMap, GovernanceSim, MDGACopilot, QuestBoard
│   │   │   └── modals/       # IngestModal, ReportModal, UpgradeModal, VoiceRecordModal, WalletModal
│   │   ├── App.jsx           # 메인 라우팅 및 뷰 포트
│   │   └── main.jsx
│   └── vite.config.js        # PWA 및 빌드 설정
│
├── backend/                  # 백엔드 (FastAPI)
│   ├── app/
│   │   ├── core/
│   │   │   ├── database.py   # SQLAlchemy DB 세팅 (PostgreSQL)
│   │   │   └── engine.py     # 하이퍼 계층(Hierarchy) 엔진 코어 로직
│   │   └── main.py           # API 라우터 (Ingest, Chat, Report, Explorer 등)
│   └── requirements.txt      # 파이썬 의존성
│
├── docs/                     # 프로젝트 기획, 발표 스크립트, 시스템 아키텍처 문서
└── dev_ops/                  # 쉘 스크립트 (Cloudflare 및 Render 원클릭 배포 자동화)
```

---

## 🚀 빠른 시작 (Getting Started)

### 1. 프론트엔드 실행
```bash
cd frontend
npm install
npm run dev
# 접속: http://localhost:5173
```

### 2. 백엔드 실행
```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload
# API 문서 접속: http://localhost:8000/docs
```

## 🏆 심사위원 발표용 스크립트
본 프로젝트의 심사/피칭용 공식 대본과 화면 플로우 가이드는 [`docs/13_FINAL_PITCH_SCRIPT.md`](docs/13_FINAL_PITCH_SCRIPT.md) 파일에 완벽하게 정리되어 있습니다.

---
**Designed for 2026 Living Lab Innovation Challenge.**
*Powered by Gemini CLI & Autonomous Developer AI.*