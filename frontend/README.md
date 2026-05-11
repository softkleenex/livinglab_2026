# MDGA Frontend

MDGA(Universal Data Engine) 플랫폼의 프론트엔드 모듈입니다.
농림/스마트팜 데이터를 시각화하고, B2B 데이터 거래, AI 기반 대시보드 및 Twin Map 서비스를 제공합니다.

## ✨ 주요 기능 및 컴포넌트

*   **Twin Map (디지털 트윈 맵):** Leaflet을 기반으로 개별 농가의 데이터를 동 -> 구 -> 시 단위로 롤업하여 지도에 렌더링.
*   **Data Converter:** 멀티모달 AI 스캔을 통한 비정형 데이터 자산화 대시보드.
*   **B2B Market:** 합성 데이터(Synthetic Data)를 구매 및 거래할 수 있는 마켓플레이스 UI.
*   **Synthesis Insight:** 기상청 및 농진청 데이터를 융합한 시뮬레이션 대시보드.
*   **MDGA Copilot:** 데이터 인지 및 제어를 위한 엔터프라이즈 AI 챗봇 인터페이스.

## 🛠 Tech Stack

*   **Framework:** React 19 + Vite
*   **Styling:** Tailwind CSS
*   **Animations:** Framer Motion
*   **Charts:** Recharts
*   **Maps:** Leaflet
*   **Icons:** Lucide Icons

## 🚀 Getting Started

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Run the development server:**
   ```bash
   npm run dev
   ```

3. **Build for production:**
   ```bash
   npm run build
   ```

## 🌍 배포 환경 (Deployment)
*   현재 프론트엔드는 **Cloudflare Pages**에 배포되어 운영 중입니다.
*   백엔드 API 연결: 환경변수 `VITE_API_URL` (기본값: `https://mdga-api.onrender.com`)에 Render 백엔드 주소가 바인딩되어 있습니다.

## 📁 폴더 구조 (src 기준)
- `components/`: 주요 기능별 UI 컴포넌트 모음 (대시보드, 모달 등)
- `pages/`: 라우팅 및 뷰 구성 (MainApp, Onboarding 등)
- `services/`: 백엔드 API 연동 및 데이터 요청 모듈
- `contexts/` / `hooks/`: 상태 관리 및 커스텀 훅
- `utils/`: 공통 유틸리티 함수
