"""
Dependency injection utilities for AI Coding Assistant
Provides FastAPI dependencies for services and configurations
"""

from functools import lru_cache
from typing import Generator, Optional
import logging

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

from app.core.config import get_settings, Settings
from app.services.health_service import health_service, HealthService
from app.services.llm_service import LLMService
from app.services.rag_service import RAGService
from app.services.websocket_manager import WebSocketManager
from app.services.performance_monitor import PerformanceMonitor

logger = logging.getLogger(__name__)

# Security
security = HTTPBearer(auto_error=False)

# Global service instances
_llm_service: Optional[LLMService] = None
_rag_service: Optional[RAGService] = None
_websocket_manager: Optional[WebSocketManager] = None
_performance_monitor: Optional[PerformanceMonitor] = None


def get_settings_dependency() -> Settings:
    """Get application settings"""
    return get_settings()


def get_health_service() -> HealthService:
    """Get health service instance"""
    return health_service


@lru_cache()
def get_llm_service() -> LLMService:
    """Get LLM service instance (singleton)"""
    global _llm_service
    if _llm_service is None:
        settings = get_settings()
        _llm_service = LLMService(settings)
    return _llm_service


@lru_cache()
def get_rag_service() -> RAGService:
    """Get RAG service instance (singleton)"""
    global _rag_service
    if _rag_service is None:
        settings = get_settings()
        _rag_service = RAGService(settings)
    return _rag_service


@lru_cache()
def get_websocket_manager() -> WebSocketManager:
    """Get WebSocket manager instance (singleton)"""
    global _websocket_manager
    if _websocket_manager is None:
        _websocket_manager = WebSocketManager()
    return _websocket_manager


@lru_cache()
def get_performance_monitor() -> PerformanceMonitor:
    """Get performance monitor instance (singleton)"""
    global _performance_monitor
    if _performance_monitor is None:
        _performance_monitor = PerformanceMonitor()
    return _performance_monitor


async def get_current_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security),
    settings: Settings = Depends(get_settings_dependency)
) -> Optional[dict]:
    """
    Get current user from JWT token (optional authentication)
    Returns None if no authentication is provided or required
    """
    if not settings.require_auth:
        return None
    
    if not credentials:
        if settings.require_auth:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Authentication required",
                headers={"WWW-Authenticate": "Bearer"},
            )
        return None
    
    try:
        # In a real implementation, you would validate the JWT token here
        # For now, we'll just return a mock user
        return {
            "id": "user123",
            "username": "developer",
            "email": "dev@example.com"
        }
    except Exception as e:
        logger.error(f"Authentication failed: {e}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )


def get_optional_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security)
) -> Optional[dict]:
    """Get current user without requiring authentication"""
    if not credentials:
        return None
    
    try:
        # Mock user for development
        return {
            "id": "user123",
            "username": "developer",
            "email": "dev@example.com"
        }
    except Exception:
        return None


class DatabaseSession:
    """Mock database session for development"""
    
    def __init__(self):
        self.data = {}
    
    def get(self, key: str, default=None):
        return self.data.get(key, default)
    
    def set(self, key: str, value):
        self.data[key] = value
    
    def delete(self, key: str):
        return self.data.pop(key, None)
    
    def close(self):
        pass


def get_database() -> Generator[DatabaseSession, None, None]:
    """Get database session (mock implementation)"""
    db = DatabaseSession()
    try:
        yield db
    finally:
        db.close()


def validate_api_key(
    api_key: Optional[str] = None,
    settings: Settings = Depends(get_settings_dependency)
) -> bool:
    """Validate API key for external access"""
    if not settings.api_key_required:
        return True
    
    if not api_key:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="API key required"
        )
    
    # In production, validate against stored API keys
    valid_keys = getattr(settings, 'valid_api_keys', [])
    if api_key not in valid_keys:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid API key"
        )
    
    return True


def get_request_id() -> str:
    """Generate unique request ID for tracing"""
    import uuid
    return str(uuid.uuid4())


class RateLimiter:
    """Simple in-memory rate limiter"""
    
    def __init__(self):
        self.requests = {}
    
    def is_allowed(self, key: str, limit: int = 100, window: int = 3600) -> bool:
        """Check if request is allowed within rate limit"""
        import time
        
        current_time = time.time()
        window_start = current_time - window
        
        if key not in self.requests:
            self.requests[key] = []
        
        # Clean old requests
        self.requests[key] = [
            req_time for req_time in self.requests[key] 
            if req_time > window_start
        ]
        
        # Check limit
        if len(self.requests[key]) >= limit:
            return False
        
        # Add current request
        self.requests[key].append(current_time)
        return True


# Global rate limiter instance
rate_limiter = RateLimiter()


def check_rate_limit(
    request_key: str = "global",
    limit: int = 100,
    window: int = 3600
) -> bool:
    """Check rate limit for requests"""
    if not rate_limiter.is_allowed(request_key, limit, window):
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Rate limit exceeded"
        )
    return True


def get_client_ip(request) -> str:
    """Get client IP address from request"""
    # Check for forwarded headers
    forwarded_for = request.headers.get("X-Forwarded-For")
    if forwarded_for:
        return forwarded_for.split(",")[0].strip()
    
    real_ip = request.headers.get("X-Real-IP")
    if real_ip:
        return real_ip
    
    # Fallback to direct connection
    return getattr(request.client, 'host', 'unknown')


# Cleanup function for graceful shutdown
async def cleanup_services():
    """Cleanup services on application shutdown"""
    global _llm_service, _rag_service, _websocket_manager, _performance_monitor
    
    try:
        if _websocket_manager:
            await _websocket_manager.disconnect_all()
        
        if _performance_monitor:
            await _performance_monitor.stop()
        
        if _rag_service:
            await _rag_service.cleanup()
        
        if _llm_service:
            await _llm_service.cleanup()
        
        logger.info("Services cleaned up successfully")
        
    except Exception as e:
        logger.error(f"Error during service cleanup: {e}")


# Initialize services on startup
async def initialize_services():
    """Initialize services on application startup"""
    try:
        # Initialize services
        get_llm_service()
        get_rag_service()
        get_websocket_manager()
        get_performance_monitor()
        
        logger.info("Services initialized successfully")
        
    except Exception as e:
        logger.error(f"Error during service initialization: {e}")
        raise
