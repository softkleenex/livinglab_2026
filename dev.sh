#!/bin/bash

# MDGA: High-Fidelity Full-Stack Unified Runner

export PATH="/opt/homebrew/bin:$PATH"

PROJECT_ROOT="/Volumes/samsd/workspace_v2/livinglab_2026"
echo "==============================================="
echo "🚀 MDGA 통합 엔진 가동을 시작합니다..."
echo "==============================================="

# 터미널 종료 시 모든 프로세스 동시 종료를 위한 함수
cleanup() {
    echo -e "\n🛑 서비스를 종료하고 프로세스를 정리합니다..."
    kill $BACKEND_PID $FRONTEND_PID 2>/dev/null
    exit
}

# Ctrl+C 감지 시 cleanup 함수 실행
trap cleanup INT TERM

# 1. Backend Start (Background)
echo "📡 [1/2] FastAPI 백엔드 서버 시작 중 (Port: 8080)..."
cd $PROJECT_ROOT/backend
source venv/bin/activate
# nohup이나 로그 파일 없이 실시간 출력을 위해 백그라운드 실행
uvicorn app.main:app --host 0.0.0.0 --port 8080 &
BACKEND_PID=$!

# 백엔드가 뜰 때까지 잠시 대기
sleep 2

# 2. Frontend Start (Background)
echo "🎨 [2/2] React 프론트엔드 서버 시작 중 (Port: 5173)..."
cd $PROJECT_ROOT/frontend
npm run dev -- --host &
FRONTEND_PID=$!

echo "-----------------------------------------------"
echo "✅ 모든 시스템이 가동되었습니다!"
echo "📍 백엔드 API: http://localhost:8080"
echo "📍 프론트엔드: http://localhost:5173"
echo "-----------------------------------------------"
echo "💡 종료하려면 이 터미널에서 Ctrl+C를 누르세요."
echo "==============================================="

# 프로세스가 유지되도록 대기
wait
