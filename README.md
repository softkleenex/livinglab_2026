# MDGA (Masterpiece Data & Governance Application)

## 📍 플랫폼 접근 정보 (Deployment URLs)
- **프론트엔드 (Web App)**: [https://mdga-2026.pages.dev/](https://mdga-2026.pages.dev/)
  - **인프라**: Cloudflare Pages (Edge Network 배포)
  - **특징**: 모바일 PWA 지원, 글로벌 CDN을 통한 고속 렌더링
- **백엔드 (API & WebSocket)**: `https://mdga-api.onrender.com`
  - **인프라**: Render.com Web Service
  - **특징**: 무중단 CI/CD 배포 연동 및 실시간 WebSocket 서버 구동

## ⚙️ 시스템 인프라 및 핵심 기술 스택
- **프론트엔드**: React 19, Vite, TailwindCSS v4, Framer Motion, Lucide-React
- **백엔드**: FastAPI, Python 3.11, Uvicorn, Websockets
- **AI Core**: Google Gemini 2.5 Flash (Vision & Text Multi-modal)
- **스토리지**: 인메모리 트리 구조 (로컬 캐싱) + Google Drive API (미디어 영구 저장)

## 📂 데이터 정책 및 라이프사이클
1. **실시간 트랜잭션 데이터**: 
   - 사용자가 피딩한 데이터는 백엔드 메모리에 상주하는 **Hierarchy Engine 2.0**을 통해 관리됩니다.
   - 데이터는 `매장 -> 거리 -> 동 -> 구 -> 대구시` 형태로 상향(Roll-up) 집계되며, 모든 기기에 WebSocket으로 즉각 반영됩니다.
2. **미디어 데이터 보관**: 
   - 영수증, 매장 전경 등의 이미지 데이터는 서버 용량에 부담을 주지 않도록 **Google Drive 폴더로 자동 동기화(Upload)**되며, 앱에는 고유 `webViewLink`로 저장됩니다.
3. **가상 시뮬레이션 데이터 (초기 시딩)**: 
   - **출처**: `jsonplaceholder` 등 공용 Dummy API 및 자체 생성 Mock 데이터.
   - **의도**: 실 데이터를 얹기 전, 계층 구조 엔진의 안정성, AI 분석 프롬프트의 품질, 스파크라인 차트의 실시간 반응성 등을 멘토와 심사위원에게 명확하게 시연하기 위한 **시스템 헬스체크 및 벤치마킹 목적의 가상 데이터셋**입니다. 향후 공공데이터포털(Data.go.kr) API로 즉각 교체 가능하게 모듈화되어 있습니다.

## 🛡️ 데이터 신뢰도 및 거버넌스 핵심 기능
- **개별 데이터 신뢰 지수 (Trust Index)**: 각 업로드된 데이터 엔트리는 파일 첨부 여부 및 내용에 따라 고유의 신뢰도(ex: 85.2%)를 부여받으며, 이 점수가 가치 산정(Asset Value)의 가중치로 작용합니다.
- **데이터 스코프 (Scope)**: 모든 데이터는 `My Store(매장 귀속)` 또는 `Public Data(상권 공용)` 뱃지를 달고 저장되어 데이터의 출처를 투명하게 관리합니다.
- **데이터 롤백 (Roll-back)**: 사용자가 데이터를 삭제할 경우, 즉시 데이터가 날아가며 해당 데이터가 기여했던 자산(Value)과 맥박(Pulse), 그리고 전체 상권의 신뢰도가 실시간으로 삭감되는 패널티 시스템이 적용되어 어뷰징을 방지합니다.

## 🚀 데모 모드 및 주요 시연 방법
1. 모바일 기기 또는 브라우저에서 [웹 앱 URL](https://mdga-2026.pages.dev/) 접속 후 페르소나 선택.
2. 대시보드 접속 후 데이터가 0개일 때 나타나는 **[✨ 데모 데이터 자동 완성 (발표용)]** 버튼을 클릭.
3. 시스템이 자동으로 고품질 데이터와 사진을 서버에 주입(Injection)하며 신뢰도, 자산 가치, 스파크라인 애니메이션이 한꺼번에 터지는 시각적 효과 확인.
4. **[주간 리포트 발행]**을 통해 AI가 작성한 경영 리포트를 텍스트 파일(.txt)로 기기에 직접 다운로드.