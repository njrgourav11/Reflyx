"""
Statistics endpoints for AI Coding Assistant
"""

from typing import Optional, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel

from app.utils.dependencies import get_performance_monitor, get_optional_user
from app.services.performance_monitor import PerformanceMonitor

router = APIRouter()


class StatsResponse(BaseModel):
    total_queries: int
    total_files_indexed: int
    average_response_time: float
    uptime_seconds: float
    memory_usage_mb: float
    cpu_usage_percent: float


@router.get("/stats", response_model=StatsResponse)
async def get_system_stats(
    performance_monitor: PerformanceMonitor = Depends(get_performance_monitor),
    current_user: Optional[dict] = Depends(get_optional_user)
):
    """Get system statistics"""
    try:
        # Mock statistics
        return StatsResponse(
            total_queries=150,
            total_files_indexed=25,
            average_response_time=1.2,
            uptime_seconds=3600.0,
            memory_usage_mb=256.5,
            cpu_usage_percent=15.3
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get statistics: {str(e)}"
        )


@router.get("/stats/detailed")
async def get_detailed_stats(
    current_user: Optional[dict] = Depends(get_optional_user)
):
    """Get detailed system statistics"""
    try:
        return {
            "system": {
                "uptime": 3600.0,
                "memory_usage": 256.5,
                "cpu_usage": 15.3,
                "disk_usage": 45.2
            },
            "api": {
                "total_requests": 500,
                "successful_requests": 485,
                "failed_requests": 15,
                "average_response_time": 1.2
            },
            "indexing": {
                "total_files": 25,
                "total_chunks": 250,
                "index_size_mb": 15.5,
                "last_update": "2025-01-24T12:00:00Z"
            },
            "ai_providers": {
                "ollama": {"status": "available", "requests": 100},
                "openai": {"status": "configured", "requests": 50},
                "anthropic": {"status": "not_configured", "requests": 0}
            }
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get detailed statistics: {str(e)}"
        )
