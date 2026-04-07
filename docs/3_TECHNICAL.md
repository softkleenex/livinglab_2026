# 3. Technical Design & Operations

## 3.1 시스템 아키텍처 (Full-Stack)
- **Frontend**: React (Vite) + Tailwind CSS + Framer Motion (High-Fidelity UI).
- **Backend**: FastAPI (Python) - 고성능 비동기 API 처리 및 AI 파이프라인.
- **AI Core**: Google Gemini 2.5 Flash (Large Context Reasoning).
- **Data Grounding**: Open-Meteo (Weather), Google News RSS (Trends) 실시간 결합.

## 3.2 데이터 파이프라인 (Hierarchical Aggregation)
- **Ingestion**: 어떤 형태의 데이터(Text, Image, JSON)도 수용하는 Universal Adapter.
- **Semantic Mapping**: AI 자동 분류 시스템을 통해 리스트에 없는 항목도 의미론적으로 자동 할당.
- **Persistence**: Google Sheets API를 통한 클라우드 데이터 무손실 영속성 확보.

## 3.3 보안 및 운영 (Security & Ops)
- **Privacy**: 데이터 전송 시 AES-256 암호화 및 커뮤니티 공유 시 익명 마스킹 처리.
- **Deployment**: Cloudflare Pages (Frontend) & Render (Backend) 또는 Docker 기반 하이브리드 배포.
- **Integrity**: `system_check.py`를 통한 전역 엔진 무결성 상시 검증.
