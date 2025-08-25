"""
API v1 Router
Main router for all v1 API endpoints.
"""

from fastapi import APIRouter

from app.api.v1.endpoints import (
    health,
    indexing,
    query,
    explain,
    generate,
    similar,
    refactor,
    stats
)

# Create main API router
api_router = APIRouter()

# Include all endpoint routers
api_router.include_router(
    health.router,
    prefix="/health",
    tags=["health"]
)

api_router.include_router(
    indexing.router,
    prefix="/index",
    tags=["indexing"]
)

api_router.include_router(
    query.router,
    prefix="/query",
    tags=["query"]
)

api_router.include_router(
    explain.router,
    prefix="/explain",
    tags=["explain"]
)

api_router.include_router(
    generate.router,
    prefix="/generate",
    tags=["generate"]
)

api_router.include_router(
    similar.router,
    prefix="/similar",
    tags=["similar"]
)

api_router.include_router(
    refactor.router,
    prefix="/refactor",
    tags=["refactor"]
)

api_router.include_router(
    stats.router,
    prefix="/stats",
    tags=["stats"]
)
