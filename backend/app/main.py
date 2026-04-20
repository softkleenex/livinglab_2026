"""
MDGA (Universal Data Engine) Main Application Module.

This module initializes the FastAPI application, sets up middleware (including CORS),
defines global exception handlers for standardized error responses, and includes
the versioned API routers for the B2B SaaS platform.
"""

from fastapi import FastAPI, WebSocket, WebSocketDisconnect, Request
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from starlette.exceptions import HTTPException as StarletteHTTPException
import os
import traceback
import logging
from dotenv import load_dotenv
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

# Configure Enterprise Structured Logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S"
)
logger = logging.getLogger("mdga_enterprise")

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

# Setup Rate Limiter to prevent API abuse
limiter = Limiter(key_func=get_remote_address)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# Security: Restrict CORS to trusted origins in production
ALLOWED_ORIGINS = os.getenv("ALLOWED_ORIGINS", "http://localhost:4173,http://localhost:5173,https://mdga-2026.pages.dev").split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

# --- Global Error Handlers (B2B Standard) ---
@app.exception_handler(StarletteHTTPException)
async def http_exception_handler(request: Request, exc: StarletteHTTPException):
    """Handles standard HTTP exceptions and formats them into a consistent JSON response."""
    logger.error(f"HTTP Exception: {exc.status_code} - {exc.detail} on {request.url.path}")
    return JSONResponse(
        status_code=exc.status_code,
        content={"status": "error", "code": exc.status_code, "message": exc.detail, "path": request.url.path},
    )

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    """Catches all unhandled exceptions to prevent server crashes and hides stack traces from clients."""
    logger.critical(f"Unhandled Exception on {request.url.path}: {str(exc)}", exc_info=True)
    # Security: Do not expose internal details (str(exc)) in production.
    detail_msg = "Internal Server Error" if os.getenv("ENV") == "production" else str(exc)
    return JSONResponse(
        status_code=500,
        content={"status": "error", "code": 500, "message": "Internal Server Error", "details": detail_msg, "path": request.url.path},
    )

@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    """Handles Pydantic validation errors for incoming requests."""
    logger.warning(f"Validation Error on {request.url.path}: {exc.errors()}")
    return JSONResponse(
        status_code=422,
        content={"status": "error", "code": 422, "message": "Validation Error", "details": exc.errors(), "path": request.url.path},
    )
# --------------------------------------------

# WebSocket Route
@app.websocket("/ws/v1/updates")
async def websocket_endpoint(websocket: WebSocket):
    """Manages real-time WebSocket connections for live data dashboard updates."""
    await manager.connect(websocket)
    try:
        while True:
            data = await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(websocket)

# Routers - API Versioning (v1)
app.include_router(hierarchy_router, prefix="/api/v1/hierarchy", tags=["Hierarchy v1"])
app.include_router(dashboard_router, prefix="/api/v1/dashboard", tags=["Dashboard v1"])
app.include_router(ingest_router, prefix="/api/v1/ingest", tags=["Ingest v1"])
app.include_router(chat_router, prefix="/api/v1/chat", tags=["Chat v1"])
app.include_router(agora_router, prefix="/api/v1/agora", tags=["Agora v1"])
app.include_router(admin_router, prefix="/api/v1", tags=["Admin v1"])
