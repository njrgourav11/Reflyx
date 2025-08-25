"""
Health Check Endpoints
System health monitoring and status endpoints.
"""

import time
import psutil
from typing import Dict, Any
from fastapi import APIRouter, Depends, HTTPException, Request
from fastapi.responses import JSONResponse

from app.models.requests import HealthCheckRequest
from app.models.responses import HealthResponse
from app.core.logging import get_logger
from app.services.health_service import HealthService
from app.utils.dependencies import get_health_service

router = APIRouter()
logger = get_logger(__name__)


@router.get("", response_model=HealthResponse)
async def health_check(
    request: Request,
    health_service: HealthService = Depends(get_health_service)
):
    """
    Basic health check endpoint.
    Returns overall system health status.
    """
    try:
        start_time = time.time()
        
        # Get basic health status
        health_status = await health_service.get_basic_health()
        
        processing_time = time.time() - start_time
        
        return HealthResponse(
            success=True,
            message="Health check completed",
            status=health_status["status"],
            services=health_status["services"],
            models=health_status.get("models", {}),
            system_info=health_status["system_info"],
            uptime=health_status["uptime"]
        )
        
    except Exception as e:
        logger.error(f"Health check failed: {e}")
        raise HTTPException(
            status_code=500,
            detail="Health check failed"
        )


@router.post("/detailed", response_model=HealthResponse)
async def detailed_health_check(
    request_data: HealthCheckRequest,
    health_service: HealthService = Depends(get_health_service)
):
    """
    Detailed health check with configurable options.
    Includes comprehensive service and model checks.
    """
    try:
        start_time = time.time()
        
        # Get detailed health status
        health_status = await health_service.get_detailed_health(
            include_services=request_data.include_services,
            include_models=request_data.include_models,
            timeout=request_data.timeout
        )
        
        processing_time = time.time() - start_time
        
        return HealthResponse(
            success=True,
            message="Detailed health check completed",
            status=health_status["status"],
            services=health_status["services"],
            models=health_status.get("models", {}),
            system_info=health_status["system_info"],
            uptime=health_status["uptime"]
        )
        
    except Exception as e:
        logger.error(f"Detailed health check failed: {e}")
        raise HTTPException(
            status_code=500,
            detail="Detailed health check failed"
        )


@router.get("/live")
async def liveness_probe():
    """
    Kubernetes liveness probe endpoint.
    Simple check to verify the application is running.
    """
    return JSONResponse(
        status_code=200,
        content={"status": "alive", "timestamp": time.time()}
    )


@router.get("/ready")
async def readiness_probe(
    health_service: HealthService = Depends(get_health_service)
):
    """
    Kubernetes readiness probe endpoint.
    Checks if the application is ready to serve requests.
    """
    try:
        # Check critical services
        is_ready = await health_service.check_readiness()
        
        if is_ready:
            return JSONResponse(
                status_code=200,
                content={"status": "ready", "timestamp": time.time()}
            )
        else:
            return JSONResponse(
                status_code=503,
                content={"status": "not_ready", "timestamp": time.time()}
            )
            
    except Exception as e:
        logger.error(f"Readiness check failed: {e}")
        return JSONResponse(
            status_code=503,
            content={"status": "error", "error": str(e), "timestamp": time.time()}
        )


@router.get("/metrics")
async def get_metrics():
    """
    Basic metrics endpoint for monitoring.
    Returns system metrics in a simple format.
    """
    try:
        # Get system metrics
        cpu_percent = psutil.cpu_percent(interval=1)
        memory = psutil.virtual_memory()
        disk = psutil.disk_usage('/')
        
        # Get process info
        process = psutil.Process()
        process_memory = process.memory_info()
        
        metrics = {
            "system": {
                "cpu_percent": cpu_percent,
                "memory_percent": memory.percent,
                "memory_available": memory.available,
                "disk_percent": (disk.used / disk.total) * 100,
                "disk_free": disk.free
            },
            "process": {
                "memory_rss": process_memory.rss,
                "memory_vms": process_memory.vms,
                "cpu_percent": process.cpu_percent(),
                "num_threads": process.num_threads(),
                "create_time": process.create_time()
            },
            "timestamp": time.time()
        }
        
        return JSONResponse(content=metrics)
        
    except Exception as e:
        logger.error(f"Metrics collection failed: {e}")
        raise HTTPException(
            status_code=500,
            detail="Failed to collect metrics"
        )
