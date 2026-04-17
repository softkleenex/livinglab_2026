from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
import os
from dotenv import load_dotenv

load_dotenv()
load_dotenv(os.path.join(os.path.dirname(__file__), "../../.env"), override=True)

# Important: import these after load_dotenv so that services get env vars properly
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

@app.on_event("startup")
def restore_engine_from_db():
    db = SessionLocal()
    try:
        entries = db.query(DataEntry).order_by(DataEntry.created_at.asc()).all()
        print(f"🔄 Restoring engine from DB: {len(entries)} entries found.")
        types = ["Gu", "Dong", "Street", "Store"]
        
        for e in entries:
            path_list = [p for p in e.location_path.split("/") if p]
            target_obj = engine.create_or_get_path(path_list, types)
            
            entry_dict = {
                "id": e.id,
                "timestamp": str(e.created_at.strftime("%Y-%m-%d %H:%M")),
                "insights": e.insights,
                "hash": e.hash_val,
                "drive_link": e.drive_link,
                "scope": "store_specific" if len(path_list) >= 4 else "regional_general",
                "trust_index": e.trust_index,
                "raw_text": e.raw_text,
                "effective_value": e.effective_value
            }
            if "data_entries" not in target_obj:
                target_obj["data_entries"] = []
            target_obj["data_entries"].append(entry_dict)
            if len(target_obj["data_entries"]) > 50:
                target_obj["data_entries"].pop(0)
            
            if e.effective_value:
                engine.add_value_bottom_up(path_list, e.effective_value)
                
        print("✅ Successfully restored engine state from DB!")
    except Exception as e:
        print(f"Error restoring data: {e}")
    finally:
        db.close()

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
