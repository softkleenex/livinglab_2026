from fastapi import FastAPI, WebSocket, WebSocketDisconnect, Request
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from starlette.exceptions import HTTPException as StarletteHTTPException
import os
import traceback
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

app = FastAPI(title="MDGA Enterprise B2B SaaS", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Global Error Handlers (B2B Standard) ---
@app.exception_handler(StarletteHTTPException)
async def http_exception_handler(request: Request, exc: StarletteHTTPException):
    return JSONResponse(
        status_code=exc.status_code,
        content={"status": "error", "code": exc.status_code, "message": exc.detail, "path": request.url.path},
    )

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    traceback.print_exc()
    return JSONResponse(
        status_code=500,
        content={"status": "error", "code": 500, "message": "Internal Server Error", "details": str(exc), "path": request.url.path},
    )

@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    return JSONResponse(
        status_code=422,
        content={"status": "error", "code": 422, "message": "Validation Error", "details": exc.errors(), "path": request.url.path},
    )
# --------------------------------------------

# WebSocket Route
@app.websocket("/ws/v1/updates")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            data = await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(websocket)

# Backward Compatibility (Optional) but we migrate fully to v1
@app.websocket("/ws/updates")
async def websocket_endpoint_legacy(websocket: WebSocket):
    await websocket_endpoint(websocket)

# Routers - API Versioning (v1)
app.include_router(hierarchy_router, prefix="/api/v1/hierarchy", tags=["Hierarchy v1"])
app.include_router(hierarchy_router, prefix="/api/v1", tags=["API Root hierarchy v1"])
app.include_router(dashboard_router, prefix="/api/v1/dashboard", tags=["Dashboard v1"])
app.include_router(ingest_router, prefix="/api/v1/ingest", tags=["Ingest v1"])
app.include_router(chat_router, prefix="/api/v1/chat", tags=["Chat v1"])
app.include_router(agora_router, prefix="/api/v1/agora", tags=["Agora v1"])
app.include_router(admin_router, prefix="/api/v1", tags=["Admin v1"])

# Legacy routers mapped to v1 to avoid breaking existing clients during migration
app.include_router(hierarchy_router, prefix="/api/hierarchy", tags=["Legacy"], include_in_schema=False)
app.include_router(hierarchy_router, prefix="/api", tags=["Legacy"], include_in_schema=False)
app.include_router(dashboard_router, prefix="/api/dashboard", tags=["Legacy"], include_in_schema=False)
app.include_router(ingest_router, prefix="/api/ingest", tags=["Legacy"], include_in_schema=False)
app.include_router(chat_router, prefix="/api/chat", tags=["Legacy"], include_in_schema=False)
app.include_router(agora_router, prefix="/api/agora", tags=["Legacy"], include_in_schema=False)
