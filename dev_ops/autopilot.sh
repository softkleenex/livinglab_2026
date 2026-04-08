#!/bin/bash
# MDGA Auto-Pilot: Build, Deploy, Test, and Self-Heal Loop

PROJECT_DIR="/Volumes/samsd/workspace_v2/livinglab_2026"
FRONTEND_DIR="$PROJECT_DIR/frontend"
DIST_DIR="$FRONTEND_DIR/dist"
PROJECT_NAME="mdga-2026"

echo "🚀 [Auto-Pilot] Starting Masterpiece Validation Cycle..."

# 1. Build
echo "📦 Building Production Bundle..."
cd $FRONTEND_DIR && npm run build
if [ $? -ne 0 ]; then
    echo "❌ Build Failed. Triggering Self-Repair..."
    exit 1
fi

# 2. Deploy
echo "🌐 Deploying to Cloudflare Pages..."
# Note: Assumes authentication is already handled or environment variables are set
npx --yes wrangler pages deploy $DIST_DIR --project-name $PROJECT_NAME --commit-dirty=true
if [ $? -ne 0 ]; then
    echo "❌ Deployment Failed."
    exit 1
fi

echo "✅ Cycle Complete. Awaiting Browser Agent Validation..."
