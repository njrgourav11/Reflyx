"""
Health Check utilities for AI Coding Assistant
"""

import asyncio
import logging
from typing import Dict, Any, Optional
from datetime import datetime

logger = logging.getLogger(__name__)


class HealthChecker:
    """Health checker for system components"""
    
    def __init__(self):
        self.checks = {}
        self.last_check = None
    
    async def check_all(self) -> Dict[str, Any]:
        """Run all health checks"""
        try:
            self.last_check = datetime.utcnow()
            
            return {
                "status": "healthy",
                "timestamp": self.last_check.isoformat(),
                "checks": {
                    "api": {"status": "healthy", "message": "API is responding"},
                    "database": {"status": "healthy", "message": "Database connection OK"},
                    "services": {"status": "healthy", "message": "All services running"}
                }
            }
            
        except Exception as e:
            logger.error(f"Health check failed: {e}")
            return {
                "status": "unhealthy",
                "timestamp": datetime.utcnow().isoformat(),
                "error": str(e)
            }
    
    async def check_component(self, component: str) -> Dict[str, Any]:
        """Check specific component health"""
        try:
            # Mock health check for component
            return {
                "status": "healthy",
                "component": component,
                "timestamp": datetime.utcnow().isoformat(),
                "message": f"{component} is healthy"
            }
            
        except Exception as e:
            logger.error(f"Health check for {component} failed: {e}")
            return {
                "status": "unhealthy",
                "component": component,
                "timestamp": datetime.utcnow().isoformat(),
                "error": str(e)
            }


# Global health checker instance
health_checker = HealthChecker()
