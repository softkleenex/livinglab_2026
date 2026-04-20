# 🏗️ MDGA System Architecture & Directory Structure
> LivingLab 2026 프로젝트의 최종(결정판) 폴더 아키텍처 및 역할(Role) 개요입니다.

이 문서는 시스템 전체의 구조와 파일들이 맡은 구체적인 역할을 정의합니다. 전체 프레임워크는 **백엔드(FastAPI)**와 **프론트엔드(React/Vite)**의 명확한 책임 분리로 구성되어 있습니다.

---

## 📂 최상위 디렉터리 (Root Level)

```text
livinglab_2026/
├── backend/            # 핵심 AI 서버 & 데이터 렌더 API
├── frontend/           # 지능형 대시보드 UI
├── docs/               # 문서 통합 저장소 (기획, 전략, 기술 명세)
├── dev_ops/            # 자동화 배포 관리, 로깅 파이프라인
├── tests/              # E2E 퀄리티/무결성 테스트 스트립트군
└── .github/            # GitHub Actions CI/CD 스크립트
```

### 🔹 Root Script Files
* `setup.sh`: Python 패키지, Node 모듈, `.env` 등을 구축하는 시스템 초기화 스크립트.
* `dev.sh`: 프론트엔드(`vite`)와 백엔드(`uvicorn`)를 백그라운드 프로세스로 묶어 동시에 구동(포트 8000 & 5173 맵핑)시키는 로컬 통합 개발 스크립트.
* `.env` / `.env.example`: 시스템 인프라 키 세트(Google Drive OAuth, Gemini API 등) 저장소.

---

## ⚙️ 1. Backend (`/backend/`)
데이터 Ingest(수집), AI 파싱 및 Vectorize 도출, Google Drive와의 비동기 통신을 전담합니다.

```text
backend/
├── app/
│   └── main.py                 # FastAPI 엔진 라우트 진입점. (Drive API 및 Gemini 연동 로직 포함)
├── generate_oauth_token.py     # OAuth2 인증을 가동해 refresh_token을 로컬에서 확보하는 스크립트
├── token.json                  # (Git Ignore) 자동 발급된 구글 드라이브 권한 토큰 (Refresh Token 포함)
├── client_secret.json          # (Git Ignore) Oauth GCP OAuth Client 파일 
└── requirements.txt            # 파이썬 의존성 패키지 명세
```

---

## 🎨 2. Frontend (`/frontend/`)
React, Tailwind CSS, Framer Motion이 시너지를 발휘하는 하이엔드 모바일 퍼스트 뷰를 구성합니다.

```text
frontend/
├── index.html                  # 싱글 페이지 애플리케이션 진입점
├── vite.config.js              # 번들 및 개발 서버 최적화 설정
├── package.json                # 노드 의존성 및 스크립트 명세
├── src/
│   ├── App.jsx                 # 통합 화면 라우팅, 모달 (Ingest, Governance), State 관장
│   ├── main.jsx                # React DOM 렌더러
│   └── index.css / App.css     # Tailwind CSS 변수 정의 및 공통 스타일 계층
└── public/                     # 정적 에셋 서빙 디렉토리 (아이콘 등)
```

---

## 🚀 3. DevOps (`/dev_ops/`)
시스템 빌드업과 모니터링을 자율적으로 통제하는 파이프라인입니다.

```text
dev_ops/
├── deploy_prod.sh              # 깃허브 푸시와 Render 클라우드 배포 호출을 관장
├── monitor_render_logs.sh      # 프로덕션 상태 실시간 추적 스크립트
└── autopilot.sh                # 시스템 부하 검사
```

---

## 🧬 4. Tests (`/tests/`)
End-To-End (E2E) 무결성을 검증하고, 특히 구글 드라이브 연동 등 핵심 생태계가 온전한지 스캔합니다.

```text
tests/
├── test_data_flow.py           # Ingestion -> Drive -> Explore 흐름이 전부 뚫려있는지 검증
├── test_production.py          # Render 배포 서버를 대상으로 한 HTTP 통신 체크
└── system_check.py             # 시스템 환경 구동 체크
```

---

## 📚 5. Documentation (`/docs/`)
단순 코드를 넘어 비즈니스 밸류와 기획 과정을 증명하는 3-Pillar+α 문서들입니다. 
* `0_ARCHITECTURE.md`: 현재 파일 (전체 구조 조망)
* `1_PROPOSAL.md`: 초기 요구사항 명세, 기획 의도 및 제안서
* `2_STRATEGY.md`: 사용자 경험 및 비즈니스 모델 설계
* `3_TECHNICAL.md`: 기술 스택 근거 및 시스템 구조 구상
* `4_functions.txt`: AI 파서와 작동할 Function Call 리스트 러프 스케치
* `5_DATA_LIFECYCLE.md`: 데이터 주입부터 블록체인화, 시뮬레이션에 이르는 파이프라인 생애주기 명세
