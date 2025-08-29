"""
Lightweight FastAPI app for Vercel Serverless
- Keeps only minimal endpoints compatible with Vercel size/time limits
- Exposes the same paths expected by the VS Code extension (/api/v1/*)

Vercel's @vercel/python runtime auto-detects ASGI apps (FastAPI/Starlette)
when an `app` object is exported by this module.
"""
from typing import Any, Dict
from datetime import datetime

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel


app = FastAPI(title="AI Coding Assistant API (Vercel)", version="1.0.0")

# CORS - lock this down to your frontend domain(s) in production
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class QueryRequest(BaseModel):
    query: str
    max_results: int = 5


@app.get("/")
async def root() -> Dict[str, Any]:
    return {
        "name": "AI Coding Assistant API (Vercel)",
        "version": "1.0.0",
        "docs_url": "/docs",
        "health_url": "/api/v1/health",
    }


@app.get("/api/v1/health")
async def health() -> Dict[str, Any]:
    return {
        "success": True,
        "status": "healthy",
        "service": "AI Coding Assistant (Vercel)",
        "timestamp": datetime.utcnow().isoformat(),
        "services": {"api": "ok"},
    }


@app.post("/api/v1/query")
async def query_codebase(req: QueryRequest) -> Dict[str, Any]:
    # NOTE: This is a minimal placeholder to comply with serverless limits.
    # In production, proxy to a persistent backend that runs the heavy ML work.
    return {
        "success": True,
        "query": req.query,
        "response": f"Serverless placeholder response for: {req.query}",
        "results": [],
        "metadata": {
            "provider": "serverless",
            "model": "n/a",
            "processing_time": 0.05,
        },
    }


@app.get("/api/v1/stats")
async def stats() -> Dict[str, Any]:
    return {
        "success": True,
        "data": {"indexed_files": 0, "total_queries": 0, "uptime": "serverless"},
    }


# Optional: allow local development with `python api/index.py`
if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000)

