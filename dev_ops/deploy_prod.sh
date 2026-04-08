#!/bin/bash

# ==============================================================
# MDGA Auto Deployment Pipeline (Render CLI)
# ==============================================================

export PATH="$HOME/.local/bin:$PATH"

# 1. 렌더 CLI 설치 여부 확인
if ! command -v render &> /dev/null; then
    echo "❌ Render CLI가 설치되어 있지 않습니다."
    echo "먼저 터미널에서 render login 을 통해 인증을 완료해주세요."
    exit 1
fi

echo "==============================================="
echo "🚀 1단계: GitHub 푸시로 빌드 스냅샷 생성..."
echo "==============================================="
git add .
git commit -m "Auto deployment (Production Fixes)" || echo "No changes to commit."
git push origin main
if [ $? -ne 0 ]; then
    echo "❌ Git Push 실패! 권한이나 원격 저장소 상태를 확인하세요."
    exit 1
fi

echo "==============================================="
echo "🔥 2단계: Render 'mdga-api' 서비스 강제 배포 시작..."
echo "==============================================="

# 서비스 이름 기반 탐색 후 트리거
echo "💡 Render 워크스페이스에서 'mdga-api' Service ID를 탐색합니다..."
# 이 스크립트를 위해서는 먼저 터미널에 `render login`을 해두셔야 합니다.

# json output을 파싱해서 mdga-api의 서비스 ID를 찾습니다.
SERVICE_ID=$(render services -o json | grep -B2 -A2 '"name": "mdga-api"' | grep '"id":' | head -1 | awk -F'"' '{print $4}')

if [ -z "$SERVICE_ID" ]; then
    echo "❌ 'mdga-api'라는 이름의 서비스를 찾을 수 없습니다. 이름이 다르거나 Workspace가 다릅니다."
    echo "사용 가능한 서비스 목록을 보려면 `render services`를 입력하세요."
    exit 1
fi

echo "✅ 서비스 ID 확인: $SERVICE_ID"
echo "⏳ 배포 프로세스를 시작하고, 완료될 때까지 터미널에서 대기합니다 (--wait)..."

# Deploy Trigger & Wait
render deploys create $SERVICE_ID --wait

if [ $? -eq 0 ]; then
    echo "==============================================="
    echo "🎉 프로덕션 배포가 성공적으로 완료되었습니다!"
    echo "==============================================="
else
    echo "==============================================="
    echo "🚨 배포 실패! 로그를 즉시 확인하기 위해 모니터링 스크립트를 실행하세요."
    echo "실행: ./dev_ops/monitor_render_logs.sh"
    echo "==============================================="
    exit 1
fi
