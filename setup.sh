#!/bin/bash

# MDGA: High-Fidelity Full-Stack Setup Script

PROJECT_ROOT="/Volumes/samsd/workspace_v2/livinglab_2026"
echo "==============================================="
echo "🚀 MDGA 풀스택 환경 구축을 시작합니다..."
echo "==============================================="

# 1. Backend Setup
echo "📂 [1/2] 백엔드(FastAPI) 설정 중..."
cd $PROJECT_ROOT/backend
python3 -m venv venv
source venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt
echo "✅ 백엔드 환경 구축 완료"

# 2. Frontend Setup
echo "📂 [2/2] 프론트엔드(React) 설정 중..."
cd $PROJECT_ROOT/frontend
npm install
echo "✅ 프론트엔드 환경 구축 완료"

echo "==============================================="
echo "🎉 모든 설정이 완료되었습니다!"
echo "-----------------------------------------------"
echo "💡 실행 방법:"
echo "1. 백엔드: cd backend && source venv/bin/activate && python app/main.py"
echo "2. 프론트엔드: cd frontend && npm run dev"
echo "==============================================="
