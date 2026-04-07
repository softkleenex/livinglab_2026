# 3. Technical Design & Operations

## 3.1 프론트엔드 아키텍처 (Mobile-First Web App)
- **Framework**: React (Vite) + Tailwind CSS + Framer Motion.
- **Design Pattern**: **App Shell Architecture** 적용.
  - 고정된 상단 헤더 및 하단 네비게이션을 통해 모바일 브라우저 간섭 차단.
  - 독립적인 스크롤 영역 제어로 네이티브 앱 수준의 사용자 경험 제공.
- **Responsiveness**: `svh` 단위를 사용한 동적 높이 최적화 및 뷰포트 고정(user-scalable=no).

## 3.2 백엔드 및 AI 파이프라인
- **Engine**: FastAPI (Python 3.11) 기반 비동기 API 서버.
- **AI Core**: Google Gemini 1.5 Flash (Multimodal: Text + Vision 분석).
- **Data Pooling**: 개별 데이터를 중앙 데이터 호수(Shared Data Lake)로 통합 분석하는 집단 지성 알고리즘.

## 3.3 데이터 스토리지 및 보안
- **File Storage**: Google Drive API 연동 (사용자 이미지 영구 보존).
- **Database**: Google Sheets API (메타데이터 및 분석 이력 관리).
- **Security**: 전송 데이터 AES-256 암호화 및 커뮤니티 데이터 익명화 엔진.

## 3.4 프로덕션 배포 전략
- **Frontend**: Cloudflare Pages (Vite 빌드 최적화 및 Edge 배포).
- **Backend**: Render.com (전용 컴퓨팅 인스턴스 가동).
- **CI/CD**: GitHub Actions 기반의 자동 무결성 검증 및 배포 트리거.
