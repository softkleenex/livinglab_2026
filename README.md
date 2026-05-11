# MDGA (Universal Data Engine) 🚀

**차세대 농림/스마트팜 특화 데이터 파이프라인 및 합성 데이터 SaaS 플랫폼**

MDGA는 파편화된 농기계 데이터, 수기 영농일지, 작물 생육 데이터를 수집 및 결합하여 고품질의 **'합성 데이터(Synthetic Data)'를 생성하고 유통하는 B2B SaaS 플랫폼**입니다. 단순 데이터 저장 및 챗봇을 넘어, 공공데이터(기상청, 농진청)와 실측 데이터를 융합해 생산자(농가/스마트팜) 및 연구기관에 필수적인 비즈니스 인사이트를 제공합니다.

![MDGA App](docs/screenshots/01_login.png)

## 📚 상세 문서 (Documentation)
자세한 아키텍처, 기능 명세 및 프로젝트 기획은 `docs/` 폴더를 참조하세요:
- [📖 상세 프로젝트 명세 및 단일 통합 문서 (Single Source of Truth)](docs/README.md)
- [🛠️ 기획 및 작업 명세 (Task Specification)](docs/PROJECT_SPEC_AND_PLAN.md)
- [💼 포트폴리오 가이드](docs/PORTFOLIO_GUIDE.md)

## 🏗️ 시스템 구성 (System Architecture)
- **[Frontend (React/Vite)](frontend/README.md)**: Twin Map 지역 계층 엔진, 합성 데이터 거래소, AI 대시보드 UI.
- **[Backend (FastAPI/Python)](backend/README.md)**: 데이터 파이프라인, AI 파싱(Gemini), 공공데이터 연동 및 RDBMS 기반의 3NF 구조 서버.

## 🚀 Setup & Installation (빠른 시작)

### Environment Variables (`backend/.env`)
```env
DATABASE_URL=postgresql://user:pass@localhost:5432/mdga
GEMINI_API_KEY=your_gemini_api_key
GEMINI_MODEL=gemini-2.5-pro
GOOGLE_OAUTH_CLIENT_ID=your_oauth_client
GOOGLE_OAUTH_CLIENT_SECRET=your_oauth_secret
GOOGLE_DRIVE_FOLDER_ID=your_target_folder_id
```

### Running Locally
```bash
# Start Backend
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload

# Start Frontend
cd frontend
npm install
npm run dev
```

---
*Built with passion for the ultimate Data Assetization experience.* 🌍
