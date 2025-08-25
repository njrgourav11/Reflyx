"""
API Response Models
Pydantic models for API responses.
"""

from typing import List, Optional, Dict, Any, Union
from datetime import datetime
from pydantic import BaseModel, Field


class BaseResponse(BaseModel):
    """Base response model with common fields."""
    
    success: bool = Field(..., description="Whether the request was successful")
    message: Optional[str] = Field(default=None, description="Response message")
    timestamp: datetime = Field(default_factory=datetime.utcnow, description="Response timestamp")


class ErrorResponse(BaseResponse):
    """Error response model."""
    
    success: bool = Field(default=False)
    error_code: Optional[str] = Field(default=None, description="Error code for programmatic handling")
    details: Optional[Dict[str, Any]] = Field(default=None, description="Additional error details")


class CodeChunk(BaseModel):
    """Model representing a code chunk/snippet."""
    
    id: str = Field(..., description="Unique identifier for the code chunk")
    file_path: str = Field(..., description="Path to the source file")
    function_name: Optional[str] = Field(default=None, description="Function/method name")
    class_name: Optional[str] = Field(default=None, description="Class name if applicable")
    language: str = Field(..., description="Programming language")
    content: str = Field(..., description="Code content")
    line_start: int = Field(..., description="Starting line number")
    line_end: int = Field(..., description="Ending line number")
    similarity_score: Optional[float] = Field(default=None, description="Similarity score for search results")
    context: Optional[str] = Field(default=None, description="Surrounding code context")
    last_modified: Optional[datetime] = Field(default=None, description="Last modification time")


class IndexResponse(BaseResponse):
    """Response model for indexing operations."""
    
    success: bool = Field(default=True)
    workspace_path: str = Field(..., description="Path of the indexed workspace")
    files_processed: int = Field(..., description="Number of files processed")
    chunks_created: int = Field(..., description="Number of code chunks created")
    processing_time: float = Field(..., description="Processing time in seconds")
    errors: List[str] = Field(default_factory=list, description="List of processing errors")
    warnings: List[str] = Field(default_factory=list, description="List of processing warnings")
    
    class Config:
        schema_extra = {
            "example": {
                "success": True,
                "message": "Workspace indexed successfully",
                "workspace_path": "/path/to/workspace",
                "files_processed": 150,
                "chunks_created": 1250,
                "processing_time": 45.2,
                "errors": [],
                "warnings": ["Skipped binary file: image.png"],
                "timestamp": "2024-01-15T10:30:00Z"
            }
        }


class QueryResponse(BaseResponse):
    """Response model for codebase queries."""
    
    success: bool = Field(default=True)
    query: str = Field(..., description="Original query")
    results: List[CodeChunk] = Field(..., description="Matching code chunks")
    total_results: int = Field(..., description="Total number of results found")
    processing_time: float = Field(..., description="Query processing time in seconds")
    
    class Config:
        schema_extra = {
            "example": {
                "success": True,
                "message": "Query processed successfully",
                "query": "user authentication functions",
                "results": [
                    {
                        "id": "chunk_123",
                        "file_path": "src/auth/login.py",
                        "function_name": "authenticate_user",
                        "class_name": "AuthService",
                        "language": "python",
                        "content": "def authenticate_user(username, password):\n    # Authentication logic here\n    pass",
                        "line_start": 15,
                        "line_end": 25,
                        "similarity_score": 0.92
                    }
                ],
                "total_results": 5,
                "processing_time": 0.15,
                "timestamp": "2024-01-15T10:30:00Z"
            }
        }


class ExplanationResponse(BaseResponse):
    """Response model for code explanations."""
    
    success: bool = Field(default=True)
    code: str = Field(..., description="Original code snippet")
    explanation: str = Field(..., description="Detailed code explanation")
    language: str = Field(..., description="Programming language")
    complexity_analysis: Optional[Dict[str, Any]] = Field(default=None, description="Code complexity metrics")
    dependencies: List[CodeChunk] = Field(default_factory=list, description="Related code dependencies")
    suggestions: List[str] = Field(default_factory=list, description="Improvement suggestions")
    processing_time: float = Field(..., description="Processing time in seconds")
    
    class Config:
        schema_extra = {
            "example": {
                "success": True,
                "message": "Code explained successfully",
                "code": "def fibonacci(n):\n    if n <= 1:\n        return n\n    return fibonacci(n-1) + fibonacci(n-2)",
                "explanation": "This function implements the Fibonacci sequence using recursion...",
                "language": "python",
                "complexity_analysis": {
                    "time_complexity": "O(2^n)",
                    "space_complexity": "O(n)",
                    "cyclomatic_complexity": 3
                },
                "dependencies": [],
                "suggestions": ["Consider using memoization to improve performance"],
                "processing_time": 0.8,
                "timestamp": "2024-01-15T10:30:00Z"
            }
        }


class GenerationResponse(BaseResponse):
    """Response model for code generation."""
    
    success: bool = Field(default=True)
    prompt: str = Field(..., description="Original generation prompt")
    generated_code: str = Field(..., description="Generated code")
    language: str = Field(..., description="Programming language")
    explanation: Optional[str] = Field(default=None, description="Explanation of generated code")
    tests: Optional[str] = Field(default=None, description="Generated unit tests")
    documentation: Optional[str] = Field(default=None, description="Generated documentation")
    processing_time: float = Field(..., description="Generation time in seconds")
    
    class Config:
        schema_extra = {
            "example": {
                "success": True,
                "message": "Code generated successfully",
                "prompt": "Create a REST API endpoint for user login",
                "generated_code": "@app.post('/login')\ndef login(credentials: LoginCredentials):\n    # Login implementation\n    pass",
                "language": "python",
                "explanation": "This endpoint handles user login with POST method...",
                "tests": "def test_login():\n    # Test implementation\n    pass",
                "processing_time": 2.1,
                "timestamp": "2024-01-15T10:30:00Z"
            }
        }


class SimilarCodeResponse(BaseResponse):
    """Response model for similar code search."""
    
    success: bool = Field(default=True)
    original_code: str = Field(..., description="Original code snippet")
    similar_chunks: List[CodeChunk] = Field(..., description="Similar code chunks")
    total_found: int = Field(..., description="Total number of similar chunks found")
    processing_time: float = Field(..., description="Search processing time in seconds")
    
    class Config:
        schema_extra = {
            "example": {
                "success": True,
                "message": "Similar code found successfully",
                "original_code": "def calculate_total(items):\n    return sum(item.price for item in items)",
                "similar_chunks": [
                    {
                        "id": "chunk_456",
                        "file_path": "src/billing/calculator.py",
                        "function_name": "compute_sum",
                        "content": "def compute_sum(values):\n    return sum(v for v in values)",
                        "similarity_score": 0.85
                    }
                ],
                "total_found": 3,
                "processing_time": 0.12,
                "timestamp": "2024-01-15T10:30:00Z"
            }
        }


class RefactorResponse(BaseResponse):
    """Response model for refactoring suggestions."""
    
    success: bool = Field(default=True)
    original_code: str = Field(..., description="Original code")
    suggestions: List[Dict[str, Any]] = Field(..., description="Refactoring suggestions")
    refactored_examples: List[str] = Field(default_factory=list, description="Refactored code examples")
    impact_analysis: Optional[Dict[str, Any]] = Field(default=None, description="Impact analysis of changes")
    processing_time: float = Field(..., description="Analysis time in seconds")
    
    class Config:
        schema_extra = {
            "example": {
                "success": True,
                "message": "Refactoring suggestions generated",
                "original_code": "def process_data(data):\n    result = []\n    for item in data:\n        if item > 0:\n            result.append(item * 2)\n    return result",
                "suggestions": [
                    {
                        "type": "list_comprehension",
                        "description": "Use list comprehension for better performance",
                        "priority": "medium"
                    }
                ],
                "refactored_examples": [
                    "def process_data(data):\n    return [item * 2 for item in data if item > 0]"
                ],
                "processing_time": 0.5,
                "timestamp": "2024-01-15T10:30:00Z"
            }
        }


class HealthResponse(BaseResponse):
    """Response model for health checks."""
    
    success: bool = Field(default=True)
    status: str = Field(..., description="Overall system status")
    services: Dict[str, Dict[str, Any]] = Field(..., description="Individual service statuses")
    models: Dict[str, Dict[str, Any]] = Field(default_factory=dict, description="AI model statuses")
    system_info: Dict[str, Any] = Field(..., description="System information")
    uptime: float = Field(..., description="System uptime in seconds")
    
    class Config:
        schema_extra = {
            "example": {
                "success": True,
                "message": "System is healthy",
                "status": "healthy",
                "services": {
                    "qdrant": {
                        "status": "healthy",
                        "response_time": 0.05,
                        "collections": 1
                    },
                    "redis": {
                        "status": "healthy",
                        "response_time": 0.02
                    }
                },
                "models": {
                    "embedding": {
                        "status": "loaded",
                        "model_name": "all-MiniLM-L6-v2"
                    },
                    "llm": {
                        "status": "available",
                        "model_name": "codellama:7b-code"
                    }
                },
                "system_info": {
                    "cpu_usage": 25.5,
                    "memory_usage": 45.2,
                    "disk_usage": 60.1
                },
                "uptime": 3600.0,
                "timestamp": "2024-01-15T10:30:00Z"
            }
        }


class StatsResponse(BaseResponse):
    """Response model for system statistics."""
    
    success: bool = Field(default=True)
    indexing_stats: Dict[str, Any] = Field(..., description="Indexing statistics")
    query_stats: Dict[str, Any] = Field(..., description="Query statistics")
    performance_metrics: Dict[str, Any] = Field(..., description="Performance metrics")
    storage_info: Dict[str, Any] = Field(..., description="Storage information")
    
    class Config:
        schema_extra = {
            "example": {
                "success": True,
                "message": "Statistics retrieved successfully",
                "indexing_stats": {
                    "total_files": 1500,
                    "total_chunks": 12000,
                    "last_indexed": "2024-01-15T09:00:00Z",
                    "languages": {
                        "python": 800,
                        "javascript": 400,
                        "typescript": 300
                    }
                },
                "query_stats": {
                    "total_queries": 250,
                    "avg_response_time": 0.15,
                    "cache_hit_rate": 0.75
                },
                "performance_metrics": {
                    "avg_indexing_speed": 1200,
                    "avg_query_time": 0.12,
                    "memory_usage": 2.1
                },
                "storage_info": {
                    "vector_db_size": "150MB",
                    "cache_size": "50MB",
                    "total_storage": "200MB"
                },
                "timestamp": "2024-01-15T10:30:00Z"
            }
        }
