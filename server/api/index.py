"""
Production-friendly FastAPI Serverless API for Vercel (Python)
- Implements the endpoints the VS Code extension expects
- Lightweight (no heavy ML libs); suited for Vercel Serverless constraints
- For full AI features, proxy to external providers or a persistent backend
"""
from __future__ import annotations

import os
from datetime import datetime
from typing import Any, Dict, List, Optional

from fastapi import FastAPI, HTTPException, Query, WebSocket
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

APP_NAME = "AI Coding Assistant API"
APP_VERSION = "1.0.0"

app = FastAPI(title=f"{APP_NAME} (Vercel)", version=APP_VERSION)

# CORS - tighten in production by setting ALLOWED_ORIGINS env as a comma-separated list
allowed_origins = os.getenv("ALLOWED_ORIGINS", "*")
allow_origins = [o.strip() for o in allowed_origins.split(",")] if allowed_origins else ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allow_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ====== Models (minimal) ======
class QueryRequest(BaseModel):
    query: str
    workspace_path: Optional[str] = None
    max_results: int = 10
    similarity_threshold: float = 0.7
    include_context: bool = True
    conversation_history: Optional[List[Dict[str, Any]]] = None

class ExplainRequest(BaseModel):
    code: str
    language: Optional[str] = None
    file_path: Optional[str] = None
    explanation_level: Optional[str] = None

class GenerateRequest(BaseModel):
    prompt: str
    language: Optional[str] = None
    context: Optional[str] = None
    style: Optional[str] = None
    include_tests: Optional[bool] = False
    include_docs: Optional[bool] = False
    max_length: Optional[int] = None

class SimilarCodeRequest(BaseModel):
    code: str
    language: Optional[str] = None
    workspace_path: Optional[str] = None
    similarity_threshold: Optional[float] = 0.7
    max_results: Optional[int] = 10
    include_exact_matches: Optional[bool] = False

class IndexFileRequest(BaseModel):
    file_path: str
    content: str
    language: Optional[str] = None

class IndexWorkspaceRequest(BaseModel):
    workspace_path: str
    force_reindex: Optional[bool] = False
    include_patterns: Optional[List[str]] = None
    exclude_patterns: Optional[List[str]] = None
    max_files: Optional[int] = None

# ====== Routes ======
@app.get("/")
async def root() -> Dict[str, Any]:
    return {
        "name": APP_NAME,
        "version": APP_VERSION,
        "docs_url": "/docs",
        "health_url": "/api/v1/health",
    }

@app.get("/api/v1/health")
async def health() -> Dict[str, Any]:
    return {
        "success": True,
        "status": "healthy",
        "service": f"{APP_NAME} (Vercel)",
        "timestamp": datetime.utcnow().isoformat(),
        "services": {"api": "ok"},
    }

@app.post("/api/v1/query")
async def query_codebase(req: QueryRequest) -> Dict[str, Any]:
    # Placeholder implementation suitable for serverless
    return {
        "success": True,
        "query": req.query,
        "response": f"Serverless response for: {req.query}",
        "results": [],
        "metadata": {"provider": "serverless", "model": "n/a", "processing_time": 0.05},
    }

@app.post("/api/v1/explain")
async def explain_code(req: ExplainRequest) -> Dict[str, Any]:
    return {
        "success": True,
        "explanation": f"This is a minimal explanation for language={req.language}.",
        "details": {"file_path": req.file_path, "level": req.explanation_level},
    }

@app.post("/api/v1/generate")
async def generate_code(req: GenerateRequest) -> Dict[str, Any]:
    code = f"// Generated code placeholder for prompt: {req.prompt}\n"
    return {"success": True, "code": code, "metadata": {"provider": "serverless"}}

@app.post("/api/v1/refactor")
async def refactor_code(payload: Dict[str, Any]) -> Dict[str, Any]:
    return {"success": True, "suggestions": ["Extract function", "Rename variables"], "metadata": {}}

@app.post("/api/v1/similar")
async def similar_code(req: SimilarCodeRequest) -> Dict[str, Any]:
    return {"success": True, "similar": [], "metadata": {}}

# --- Indexing endpoints (no-op implementations; persist externally if needed) ---
@app.post("/api/v1/index/workspace")
async def index_workspace(req: IndexWorkspaceRequest) -> Dict[str, Any]:
    return {"success": True, "message": "Workspace indexing accepted (serverless no-op)", "files_indexed": 0}

@app.post("/api/v1/index/file")
async def index_file(req: IndexFileRequest) -> Dict[str, Any]:
    # In a real deployment, push to a queue or external DB/vector store
    return {"success": True, "message": f"Indexed file (no-op): {req.file_path}"}

@app.delete("/api/v1/index/file")
async def remove_file(file_path: str = Query(...)) -> Dict[str, Any]:
    return {"success": True, "message": f"Removed file (no-op): {file_path}"}

@app.get("/api/v1/index/status")
async def index_status(workspace_path: Optional[str] = None) -> Dict[str, Any]:
    return {"success": True, "status": "idle", "indexed_files": 0}

@app.get("/api/v1/index/files")
async def list_indexed_files(workspace_path: Optional[str] = None, limit: int = 100, offset: int = 0) -> Dict[str, Any]:
    return {"success": True, "files": [], "limit": limit, "offset": offset}

@app.get("/api/v1/stats")
async def stats() -> Dict[str, Any]:
    return {"success": True, "data": {"indexed_files": 0, "total_queries": 0, "uptime": "serverless"}}

# --- WebSocket placeholder (not supported in Python Serverless on Vercel) ---
@app.websocket("/ws/chat")
async def websocket_chat(ws: WebSocket):
    # Accept and immediately close with a message to use HTTP endpoints
    await ws.accept()
    await ws.send_text("WebSocket streaming is not available on this deployment. Use HTTP endpoints.")
    await ws.close(code=1000)

# Local dev convenience
if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000)

