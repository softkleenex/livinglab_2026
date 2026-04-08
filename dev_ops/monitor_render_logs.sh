#!/bin/bash

# ==============================================================
# MDGA Real-time Render Logs Monitor
# ==============================================================

export PATH="$HOME/.local/bin:$PATH"

if ! command -v render &> /dev/null; then
    echo "❌ Render CLI가 설치되어 있지 않습니다."
    exit 1
fi

echo "==============================================="
echo "📡 Render 서버의 실시간 로그(Live Stream)를 터미널로 연결합니다..."
echo "==============================================="

# json output을 파싱해서 mdga-api의 서비스 ID를 찾습니다.
SERVICE_ID=$(render services -o json | grep -B2 -A2 '"name": "mdga-api"' | grep '"id":' | head -1 | awk -F'"' '{print $4}')

if [ -z "$SERVICE_ID" ]; then
    echo "❌ 'mdga-api'라는 이름의 서비스를 찾을 수 없습니다."
    exit 1
fi

echo "✅ 타겟 서비스: mdga-api ($SERVICE_ID)"
echo "💡 (팁) 로그 스트리밍을 종료하려면 Ctrl+C 를 누르세요."
echo ""

# Logs stream
render logs $SERVICE_ID
