# MDGA Backend

[🇰🇷 한국어](README.md) | [🇺🇸 English](README_EN.md)

MDGA(Universal Data Engine) 플랫폼의 코어 백엔드 모듈입니다.
공공데이터 연동, Gemini 기반 멀티모달 데이터 파이프라인, 그리고 3NF 정규화된 데이터베이스 관리를 담당합니다.

## ✨ 주요 기능 및 아키텍처

*   **데이터 파이프라인 엔진:** Gemini 2.5 Pro Vision을 이용해 수기 영농일지/이미지 등 비정형 데이터를 AI-Ready JSON으로 파싱 및 구조화.
*   **외부 데이터 소스 연동:** 기상청(KMA) 및 농촌진흥청(RDA) API 스케줄링 및 연동을 통한 환경 데이터 수집.
*   **합성 데이터(Synthetic Data) 시뮬레이션:** 수집된 실측 데이터와 공공데이터를 융합하여 수확량 변동성, 미래 기후 시뮬레이터 등 핵심 지표 산출.
*   **AI 안전망(Safety Alignment) 우회:** 시스템 제어용 의도 분석기(Intent Parser)를 통해 DB 트랜잭션과 자연어 챗봇 응답 분리 적용.
*   **Google Drive Data Lake:** 최소 스코프(`auth/drive.file`)를 통한 안전한 객체 파일 분리 저장.

## 🛠 Tech Stack

*   **Framework:** Python 3.11, FastAPI, Uvicorn
*   **Database:** SQLAlchemy, PostgreSQL (또는 SQLite)
*   **AI Integration:** Google Gemini 2.5 Pro
*   **External APIs:** Hugging Face Datasets API, KMA, RDA, Google Drive API

## 🚀 Getting Started

### 1. 가상환경 세팅 및 의존성 설치
```bash
python -m venv venv
source venv/bin/activate  # Mac/Linux
# venv\Scripts\activate    # Windows
pip install -r requirements.txt
```

### 2. 환경변수 설정
프로젝트 루트의 `.env.example`을 참고하여 `.env` 파일을 생성합니다.
```env
DATABASE_URL=postgresql://user:pass@localhost:5432/mdga
GEMINI_API_KEY=your_gemini_api_key
GEMINI_MODEL=gemini-2.5-pro
GOOGLE_OAUTH_CLIENT_ID=your_oauth_client
GOOGLE_OAUTH_CLIENT_SECRET=your_oauth_secret
GOOGLE_OAUTH_REFRESH_TOKEN=your_oauth_refresh_token
GOOGLE_DRIVE_FOLDER_ID=your_target_folder_id
```
> **주의:** 구글 드라이브 연동 시 '개인 계정'의 용량을 사용하기 위해서는 서비스 계정(`GOOGLE_SERVICE_ACCOUNT_JSON`)을 사용하지 않고 반드시 **OAuth 2.0 Refresh Token** 방식을 사용해야 합니다. 서비스 계정 변수가 존재할 경우 Quota(용량) 에러가 발생할 수 있습니다.

### 3. 서버 실행
```bash
uvicorn app.main:app --reload
```
서버 구동 후 `http://localhost:8000/docs` 에서 Swagger UI API 문서를 확인할 수 있습니다.

## 📁 주요 폴더 구조
- `app/api/`: REST API 엔드포인트 정의.
- `app/core/`: DB 연결, 웹소켓, 핵심 비즈니스 로직.
- `app/services/`: 외부 서비스 연동 (Gemini AI, Google Drive, 공공데이터 등).
- `scripts/`: 데이터 초기화(Seed) 및 유틸리티 스크립트.
- `tests/`: Pytest 기반 통합/유닛 테스트.
