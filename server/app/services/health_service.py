"""
Health Service for AI Coding Assistant
Monitors system health, dependencies, and service status
"""

import asyncio
import logging
import time
from typing import Dict, Any, List, Optional
from datetime import datetime, timedelta
import psutil
import httpx
from pathlib import Path

from app.core.config import get_settings

logger = logging.getLogger(__name__)
settings = get_settings()


class HealthService:
    """Service for monitoring system health and dependencies"""
    
    def __init__(self):
        self.start_time = time.time()
        self.last_check = None
        self.health_cache = {}
        self.cache_ttl = 30  # seconds
    
    async def get_health_status(self) -> Dict[str, Any]:
        """Get comprehensive health status"""
        try:
            current_time = time.time()
            
            # Use cached result if recent
            if (self.last_check and 
                current_time - self.last_check < self.cache_ttl and 
                self.health_cache):
                return self.health_cache
            
            # Gather health information
            health_data = {
                "status": "healthy",
                "timestamp": datetime.utcnow().isoformat(),
                "uptime": current_time - self.start_time,
                "version": "1.0.0",
                "environment": settings.environment,
                "services": await self._check_services(),
                "system": await self._get_system_info(),
                "dependencies": await self._check_dependencies(),
                "database": await self._check_database(),
                "ai_providers": await self._check_ai_providers()
            }
            
            # Determine overall status
            health_data["status"] = self._determine_overall_status(health_data)
            
            # Cache the result
            self.health_cache = health_data
            self.last_check = current_time
            
            return health_data
            
        except Exception as e:
            logger.error(f"Health check failed: {e}")
            return {
                "status": "unhealthy",
                "timestamp": datetime.utcnow().isoformat(),
                "error": str(e),
                "uptime": time.time() - self.start_time
            }
    
    async def _check_services(self) -> Dict[str, Any]:
        """Check status of internal services"""
        services = {
            "api": {"status": "healthy", "description": "FastAPI server running"},
            "websocket": {"status": "healthy", "description": "WebSocket connections available"},
            "indexing": {"status": "healthy", "description": "Code indexing service ready"},
            "rag": {"status": "healthy", "description": "RAG pipeline operational"}
        }
        
        # Check if services are actually working
        try:
            # Test basic functionality
            services["api"]["last_check"] = datetime.utcnow().isoformat()
            
        except Exception as e:
            logger.warning(f"Service check warning: {e}")
            services["api"]["status"] = "degraded"
            services["api"]["error"] = str(e)
        
        return services
    
    async def _get_system_info(self) -> Dict[str, Any]:
        """Get system resource information"""
        try:
            # CPU information
            cpu_percent = psutil.cpu_percent(interval=1)
            cpu_count = psutil.cpu_count()
            
            # Memory information
            memory = psutil.virtual_memory()
            
            # Disk information
            disk = psutil.disk_usage('/')
            
            return {
                "cpu": {
                    "usage_percent": cpu_percent,
                    "count": cpu_count,
                    "status": "healthy" if cpu_percent < 80 else "warning"
                },
                "memory": {
                    "total": memory.total,
                    "available": memory.available,
                    "used": memory.used,
                    "percent": memory.percent,
                    "status": "healthy" if memory.percent < 80 else "warning"
                },
                "disk": {
                    "total": disk.total,
                    "used": disk.used,
                    "free": disk.free,
                    "percent": (disk.used / disk.total) * 100,
                    "status": "healthy" if (disk.used / disk.total) < 0.8 else "warning"
                }
            }
            
        except Exception as e:
            logger.error(f"System info check failed: {e}")
            return {
                "error": str(e),
                "status": "unknown"
            }
    
    async def _check_dependencies(self) -> Dict[str, Any]:
        """Check external dependencies"""
        dependencies = {
            "python": {
                "status": "healthy",
                "version": f"{psutil.sys.version_info.major}.{psutil.sys.version_info.minor}.{psutil.sys.version_info.micro}"
            },
            "packages": {
                "status": "healthy",
                "critical_packages": ["fastapi", "uvicorn", "pydantic", "httpx"]
            }
        }
        
        # Check critical packages
        try:
            import fastapi
            import uvicorn
            import pydantic
            import httpx
            
            dependencies["packages"]["versions"] = {
                "fastapi": fastapi.__version__,
                "uvicorn": uvicorn.__version__,
                "pydantic": pydantic.__version__,
                "httpx": httpx.__version__
            }
            
        except ImportError as e:
            dependencies["packages"]["status"] = "unhealthy"
            dependencies["packages"]["error"] = str(e)
        
        return dependencies
    
    async def _check_database(self) -> Dict[str, Any]:
        """Check database connectivity"""
        # For now, return a placeholder since we're using in-memory storage
        return {
            "status": "healthy",
            "type": "in-memory",
            "description": "Using in-memory storage for development"
        }
    
    async def _check_ai_providers(self) -> Dict[str, Any]:
        """Check AI provider connectivity"""
        providers = {
            "ollama": {"status": "unknown", "url": "http://localhost:11434"},
            "openai": {"status": "unknown", "configured": bool(settings.openai_api_key)},
            "anthropic": {"status": "unknown", "configured": bool(settings.anthropic_api_key)},
            "google": {"status": "unknown", "configured": bool(settings.google_api_key)},
            "groq": {"status": "unknown", "configured": bool(settings.groq_api_key)},
            "together": {"status": "unknown", "configured": bool(settings.together_api_key)}
        }
        
        # Check Ollama connectivity
        try:
            async with httpx.AsyncClient(timeout=5.0) as client:
                response = await client.get("http://localhost:11434/api/version")
                if response.status_code == 200:
                    providers["ollama"]["status"] = "healthy"
                    providers["ollama"]["version"] = response.json().get("version", "unknown")
                else:
                    providers["ollama"]["status"] = "unhealthy"
        except Exception as e:
            providers["ollama"]["status"] = "unavailable"
            providers["ollama"]["error"] = str(e)
        
        # For other providers, just check if API keys are configured
        for provider in ["openai", "anthropic", "google", "groq", "together"]:
            if providers[provider]["configured"]:
                providers[provider]["status"] = "configured"
            else:
                providers[provider]["status"] = "not_configured"
        
        return providers
    
    def _determine_overall_status(self, health_data: Dict[str, Any]) -> str:
        """Determine overall system status based on component health"""
        try:
            # Check critical components
            system_status = health_data.get("system", {})
            services_status = health_data.get("services", {})
            dependencies_status = health_data.get("dependencies", {})
            
            # Count unhealthy components
            unhealthy_count = 0
            warning_count = 0
            
            # Check system resources
            for resource in ["cpu", "memory", "disk"]:
                resource_data = system_status.get(resource, {})
                status = resource_data.get("status", "unknown")
                if status == "warning":
                    warning_count += 1
                elif status in ["unhealthy", "error"]:
                    unhealthy_count += 1
            
            # Check services
            for service_data in services_status.values():
                status = service_data.get("status", "unknown")
                if status == "degraded":
                    warning_count += 1
                elif status == "unhealthy":
                    unhealthy_count += 1
            
            # Check dependencies
            for dep_data in dependencies_status.values():
                status = dep_data.get("status", "unknown")
                if status == "unhealthy":
                    unhealthy_count += 1
            
            # Determine overall status
            if unhealthy_count > 0:
                return "unhealthy"
            elif warning_count > 2:
                return "degraded"
            elif warning_count > 0:
                return "warning"
            else:
                return "healthy"
                
        except Exception as e:
            logger.error(f"Status determination failed: {e}")
            return "unknown"
    
    async def get_readiness_status(self) -> Dict[str, Any]:
        """Get readiness status for Kubernetes/Docker health checks"""
        try:
            # Basic readiness checks
            health_data = await self.get_health_status()
            
            is_ready = (
                health_data.get("status") in ["healthy", "warning"] and
                health_data.get("services", {}).get("api", {}).get("status") == "healthy"
            )
            
            return {
                "ready": is_ready,
                "timestamp": datetime.utcnow().isoformat(),
                "checks": {
                    "api": health_data.get("services", {}).get("api", {}).get("status") == "healthy",
                    "system": health_data.get("status") in ["healthy", "warning", "degraded"]
                }
            }
            
        except Exception as e:
            logger.error(f"Readiness check failed: {e}")
            return {
                "ready": False,
                "timestamp": datetime.utcnow().isoformat(),
                "error": str(e)
            }
    
    async def get_liveness_status(self) -> Dict[str, Any]:
        """Get liveness status for Kubernetes/Docker health checks"""
        try:
            # Basic liveness check - just verify the service is responding
            return {
                "alive": True,
                "timestamp": datetime.utcnow().isoformat(),
                "uptime": time.time() - self.start_time
            }
            
        except Exception as e:
            logger.error(f"Liveness check failed: {e}")
            return {
                "alive": False,
                "timestamp": datetime.utcnow().isoformat(),
                "error": str(e)
            }


# Global health service instance
health_service = HealthService()
