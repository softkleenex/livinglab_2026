# MDGA: Universal AI-Data Engine
> **2026 지역전략산업 문제해결 지식재산 리빙랩 (High-Fidelity Full-Stack)**

## 🚀 프로젝트 개요 (Overview)
지역 산업 현장의 파편화된 데이터를 LLM(Gemini)과 결합하여 도시 정책과 비즈니스 전략으로 전환하는 **하이엔드 지능형 데이터 플랫폼**입니다.

## 📂 통합 문서 가이드 (Classified Documentation)

1.  **Vision & Proposal**: [1. 기획 의도 및 제안서](./docs/1_PROPOSAL.md)
    -   배경, 문제 정의, 핵심 해결 방안 및 기대 효과.
2.  **Service Strategy**: [2. 서비스 및 비즈니스 전략](./docs/2_STRATEGY.md)
    -   페르소나, 사용자 여정, BM 및 지식재산(IP) 확보 계획.
3.  **Technical Design**: [3. 기술 설계 및 운영 가이드](./docs/3_TECHNICAL.md)
    -   풀스택 아키텍처, 데이터 파이프라인, 보안 및 배포 전략.
4.  **Resources**: [지식 베이스 및 원본 요구사항](./docs/original_requirements/)
    -   정책 데이터셋 및 초기 기획서 아카이브.

## 🛠️ 시스템 구성 (System Architecture)
-   **Frontend**: React + Tailwind CSS (Vite)
-   **Backend**: FastAPI (Python 3.11)
-   **AI Engine**: Google Gemini 2.5 Flash
-   **Database**: Cloud Google Sheets (Real-time Persistence)

## 💻 빠른 시작 (Quick Start)

### Backend
```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python app/main.py
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

---
Developed for **2026 지식재산 리빙랩** by MDGA Team.
