# MDGA Production Deployment Guide

본 프로젝트는 하이엔드 풀스택 구조(React + FastAPI)로 설계되었으므로, 프론트엔드와 백엔드를 각각 최적의 플랫폼에 배포합니다.

## 1. 프론트엔드 배포 (Cloudflare Pages) - 추천
가장 빠르고 현대적인 정적 웹 호스팅 서비스입니다.

1.  [Cloudflare Dashboard](https://dash.cloudflare.com/) 접속 -> **Workers & Pages** 선택.
2.  **Create application** -> **Pages** -> **Connect to Git** 클릭.
3.  `softkleenex/livinglab_2026` 저장소 연결.
4.  **Build settings**:
    -   Framework preset: `Vite`
    -   Build command: `cd frontend && npm install && npm run build`
    -   Build output directory: `frontend/dist`
5.  **Environment variables**:
    -   `VITE_API_URL`: 백엔드 배포 후 발급받은 URL 입력 (예: `https://mdga-api.onrender.com`)
6.  **Save and Deploy** 클릭.

## 2. 백엔드 배포 (Render.com)
Python FastAPI 전용 무료 티어를 제공하는 강력한 플랫폼입니다.

1.  [Render](https://render.com/) 접속 및 로그인 -> **New +** -> **Web Service** 클릭.
2.  `softkleenex/livinglab_2026` 저장소 연결.
3.  **Service settings**:
    -   Name: `mdga-backend`
    -   Runtime: `Python 3`
    -   Build Command: `cd backend && pip install -r requirements.txt`
    -   Start Command: `cd backend && uvicorn app.main:app --host 0.0.0.0 --port $PORT`
4.  **Advanced** -> **Add Environment Variable**:
    - `GEMINI_API_KEY`: `YOUR_GEMINI_API_KEY` (발급받은 키 입력)
5.  **Create Web Service** 클릭.

## 3. 최종 연결 (중요!)
백엔드 배포가 완료되면 발급된 주소를 Cloudflare Pages의 `VITE_API_URL` 변수에 넣고 다시 한번 빌드하면 모든 연동이 끝납니다.

---
Developed for **2026 지식재산 리빙랩** by MDGA Team.
