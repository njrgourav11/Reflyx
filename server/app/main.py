"""
FastAPI Main Application
Entry point for the AI Coding Assistant backend server.
"""

import asyncio
import logging
from contextlib import asynccontextmanager
from typing import Dict, Any

from fastapi import FastAPI, HTTPException, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from fastapi.responses import JSONResponse
import uvicorn

from app.core.config import get_settings
from app.core.logging import setup_logging
from app.api.v1.router import api_router
from app.services.indexing_service import IndexingService
from app.services.websocket_manager import WebSocketManager
from app.utils.health_check import HealthChecker

# Initialize settings and logging
settings = get_settings()
setup_logging(settings.log_level)
logger = logging.getLogger(__name__)

# Global services
indexing_service: IndexingService = None
websocket_manager: WebSocketManager = None
health_checker: HealthChecker = None


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan manager."""
    global indexing_service, websocket_manager, health_checker
    
    logger.info("Starting AI Coding Assistant Backend...")
    
    try:
        # Initialize services
        indexing_service = IndexingService()
        websocket_manager = WebSocketManager()
        health_checker = HealthChecker()
        
        # Start background services
        await indexing_service.initialize()
        await health_checker.initialize()
        
        # Store services in app state
        app.state.indexing_service = indexing_service
        app.state.websocket_manager = websocket_manager
        app.state.health_checker = health_checker
        
        logger.info("✅ Backend services initialized successfully")
        
        yield
        
    except Exception as e:
        logger.error(f"❌ Failed to initialize services: {e}")
        raise
    finally:
        # Cleanup
        logger.info("Shutting down AI Coding Assistant Backend...")
        
        if indexing_service:
            await indexing_service.cleanup()
        if health_checker:
            await health_checker.cleanup()
            
        logger.info("✅ Backend shutdown complete")


# Create FastAPI application
app = FastAPI(
    title="AI Coding Assistant API",
    description="Local AI-powered coding assistant with semantic search and code generation",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan
)

# Add middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure appropriately for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.add_middleware(GZipMiddleware, minimum_size=1000)

# Include API routes
app.include_router(api_router, prefix="/api/v1")


@app.get("/", response_model=Dict[str, Any])
async def root():
    """Root endpoint with basic API information."""
    return {
        "name": "AI Coding Assistant API",
        "version": "1.0.0",
        "description": "Local AI-powered coding assistant",
        "docs_url": "/docs",
        "health_url": "/api/v1/health",
        "websocket_url": "/ws/chat"
    }


@app.websocket("/ws/chat")
async def websocket_chat_endpoint(websocket: WebSocket):
    """WebSocket endpoint for real-time chat communication."""
    await websocket.accept()
    
    try:
        # Add client to manager
        client_id = await websocket_manager.add_client(websocket)
        logger.info(f"WebSocket client connected: {client_id}")
        
        while True:
            # Receive message from client
            data = await websocket.receive_json()
            
            # Process message through websocket manager
            await websocket_manager.handle_message(client_id, data)
            
    except WebSocketDisconnect:
        logger.info(f"WebSocket client disconnected: {client_id}")
    except Exception as e:
        logger.error(f"WebSocket error: {e}")
        await websocket.send_json({
            "type": "error",
            "message": "Internal server error"
        })
    finally:
        # Remove client from manager
        if 'client_id' in locals():
            await websocket_manager.remove_client(client_id)


@app.exception_handler(HTTPException)
async def http_exception_handler(request, exc: HTTPException):
    """Custom HTTP exception handler."""
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "error": True,
            "message": exc.detail,
            "status_code": exc.status_code
        }
    )


@app.exception_handler(Exception)
async def general_exception_handler(request, exc: Exception):
    """General exception handler for unhandled errors."""
    logger.error(f"Unhandled exception: {exc}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={
            "error": True,
            "message": "Internal server error",
            "status_code": 500
        }
    )


if __name__ == "__main__":
    # Development server
    uvicorn.run(
        "app.main:app",
        host=settings.host,
        port=settings.port,
        reload=settings.debug,
        log_level=settings.log_level.lower(),
        access_log=True
    )
