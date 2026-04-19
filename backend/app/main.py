from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
import os
from dotenv import load_dotenv

load_dotenv()
load_dotenv(os.path.join(os.path.dirname(__file__), "../../.env"), override=True)

from app.core.engine import engine
from sqlalchemy.orm import Session
from app.core.database import get_db, DataEntry, SessionLocal
from app.core.websocket import manager

from app.api.endpoints.hierarchy import router as hierarchy_router
from app.api.endpoints.dashboard import router as dashboard_router
from app.api.endpoints.ingest import router as ingest_router
from app.api.endpoints.chat import router as chat_router
from app.api.endpoints.agora import router as agora_router
from app.api.endpoints.admin import router as admin_router

app = FastAPI(title="MDGA Masterpiece OS v2.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Engine is now stateless and queries DB dynamically, no startup restore needed

# WebSocket Route
@app.websocket("/ws/updates")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            data = await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(websocket)

# Routers
app.include_router(hierarchy_router, prefix="/api/hierarchy", tags=["Hierarchy"])
app.include_router(hierarchy_router, prefix="/api", tags=["API Root hierarchy"]) # /api/user/context, /api/stores/all
app.include_router(dashboard_router, prefix="/api/dashboard", tags=["Dashboard"])
app.include_router(ingest_router, prefix="/api/ingest", tags=["Ingest"])
app.include_router(chat_router, prefix="/api/chat", tags=["Chat"])
app.include_router(agora_router, prefix="/api/agora", tags=["Agora"])
app.include_router(admin_router, prefix="/api", tags=["Admin"])
