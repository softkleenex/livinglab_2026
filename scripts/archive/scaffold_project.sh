#!/bin/bash

# MDGA 프로젝트 스캐폴딩 스크립트 (Project Scaffold Script)
# 이 스크립트는 프로젝트 루트 디렉토리(/Volumes/samsd/workspace_v2/livinglab_2026/)에서 실행하는 것을 권장합니다.
# 폴더 구조와 빈 파일들을 생성하여 초기 프로젝트 뼈대를 잡습니다.

echo "MDGA 프로젝트 폴더 구조 생성을 시작합니다..."

# 최상위 프로젝트 경로 설정 (스크립트 위치 기반 부모 폴더)
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

echo "Project Root: $PROJECT_ROOT"

# 1. 백엔드 폴더 구조 생성
echo "1. 백엔드 폴더 구조 생성 중..."
mkdir -p "$PROJECT_ROOT/backend/app/api/v1"
mkdir -p "$PROJECT_ROOT/backend/app/core"
mkdir -p "$PROJECT_ROOT/backend/app/models"
mkdir -p "$PROJECT_ROOT/backend/app/schemas"
mkdir -p "$PROJECT_ROOT/backend/app/services"
mkdir -p "$PROJECT_ROOT/backend/scripts"
mkdir -p "$PROJECT_ROOT/backend/tests"

# 백엔드 기본 파일 생성 (빈 파일)
touch "$PROJECT_ROOT/backend/app/main.py"
touch "$PROJECT_ROOT/backend/requirements.txt"
touch "$PROJECT_ROOT/backend/Dockerfile"

# 2. 프론트엔드 폴더 구조 생성
echo "2. 프론트엔드 폴더 구조 생성 중..."
mkdir -p "$PROJECT_ROOT/frontend/src/assets"
mkdir -p "$PROJECT_ROOT/frontend/src/components/common"
mkdir -p "$PROJECT_ROOT/frontend/src/components/map"
mkdir -p "$PROJECT_ROOT/frontend/src/components/market"
mkdir -p "$PROJECT_ROOT/frontend/src/contexts"
mkdir -p "$PROJECT_ROOT/frontend/src/hooks"
mkdir -p "$PROJECT_ROOT/frontend/src/pages/Home"
mkdir -p "$PROJECT_ROOT/frontend/src/pages/TwinMap"
mkdir -p "$PROJECT_ROOT/frontend/src/pages/DataMarket"
mkdir -p "$PROJECT_ROOT/frontend/src/pages/Analytics"
mkdir -p "$PROJECT_ROOT/frontend/src/services"
mkdir -p "$PROJECT_ROOT/frontend/src/utils"
mkdir -p "$PROJECT_ROOT/frontend/public"

# 프론트엔드 기본 파일 생성 (빈 파일)
touch "$PROJECT_ROOT/frontend/src/App.jsx"
touch "$PROJECT_ROOT/frontend/src/main.jsx"
touch "$PROJECT_ROOT/frontend/index.html"
touch "$PROJECT_ROOT/frontend/vite.config.js"
touch "$PROJECT_ROOT/frontend/package.json"

# 3. 문서 폴더(docs) 구조 생성
echo "3. 문서 폴더(docs) 구조 생성 중..."
mkdir -p "$PROJECT_ROOT/docs/architecture"
mkdir -p "$PROJECT_ROOT/docs/api"
mkdir -p "$PROJECT_ROOT/docs/design/screenshots"
mkdir -p "$PROJECT_ROOT/docs/requirements"

touch "$PROJECT_ROOT/docs/architecture/SYSTEM_ARCH.md"
touch "$PROJECT_ROOT/docs/architecture/DB_SCHEMA.md"
touch "$PROJECT_ROOT/docs/api/REST_API_DOCS.md"
touch "$PROJECT_ROOT/docs/api/EXTERNAL_API_DOCS.md"
touch "$PROJECT_ROOT/docs/design/USER_FLOW.md"
touch "$PROJECT_ROOT/docs/requirements/BUSINESS_RULES.md"

# 4. 루트 및 설정 파일 생성
echo "4. 글로벌 설정 파일 생성 중..."
touch "$PROJECT_ROOT/.env.example"
touch "$PROJECT_ROOT/.gitignore"

echo "MDGA 프로젝트 뼈대 생성이 완료되었습니다!"
