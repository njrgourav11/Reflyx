#!/usr/bin/env python3
"""
Minimal Test Server for AI Coding Assistant
Tests basic functionality without heavy dependencies.
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import httpx
import os
from typing import Dict, Any

app = FastAPI(title="AI Coding Assistant - Test Server", version="1.0.0")

# CORS middleware
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

class HealthResponse(BaseModel):
    success: bool
    status: str
    services: Dict[str, Any]

@app.get("/api/v1/health", response_model=HealthResponse)
async def health_check():
    """Health check endpoint."""
    services = {}
    
    # Check Qdrant
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get("http://localhost:6333/health", timeout=5.0)
            services["qdrant"] = {"status": "healthy" if response.status_code == 200 else "unhealthy"}
    except:
        services["qdrant"] = {"status": "unavailable"}
    
    # Check Redis
    try:
        import redis
        r = redis.Redis(host='localhost', port=6379, decode_responses=True)
        r.ping()
        services["redis"] = {"status": "healthy"}
    except:
        services["redis"] = {"status": "unavailable"}
    
    return HealthResponse(
        success=True,
        status="healthy",
        services=services
    )

@app.post("/api/v1/query")
async def query_codebase(request: QueryRequest):
    """Simple query endpoint for testing."""
    return {
        "success": True,
        "query": request.query,
        "response": f"Test response for: {request.query}",
        "results": [],
        "metadata": {
            "provider": "test",
            "model": "test-model",
            "processing_time": 0.1
        }
    }

class ExplainRequest(BaseModel):
    code: str
    language: str = "python"

class GenerateRequest(BaseModel):
    prompt: str
    language: str = "python"

@app.post("/api/v1/explain")
async def explain_code(request: ExplainRequest):
    """Code explanation endpoint for testing."""
    return {
        "success": True,
        "code": request.code,
        "language": request.language,
        "explanation": f"This {request.language} code does the following: [Test explanation for provided code]",
        "metadata": {
            "provider": "test",
            "model": "test-model",
            "processing_time": 0.2
        }
    }

@app.post("/api/v1/generate")
async def generate_code(request: GenerateRequest):
    """Code generation endpoint for testing."""
    return {
        "success": True,
        "prompt": request.prompt,
        "language": request.language,
        "generated_code": f"# Generated {request.language} code for: {request.prompt}\nprint('Hello from generated code!')",
        "metadata": {
            "provider": "test",
            "model": "test-model",
            "processing_time": 0.3
        }
    }

@app.get("/api/v1/stats")
async def get_stats():
    """Get system statistics."""
    return {
        "success": True,
        "data": {
            "indexed_files": 0,
            "total_queries": 0,
            "uptime": "0s"
        }
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
