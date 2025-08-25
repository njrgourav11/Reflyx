"""
API Request Models
Pydantic models for incoming API requests.
"""

from typing import List, Optional, Dict, Any, Literal
from pydantic import BaseModel, Field, validator


class IndexRequest(BaseModel):
    """Request model for codebase indexing."""
    
    workspace_path: str = Field(..., description="Path to the workspace/codebase to index")
    force_reindex: bool = Field(default=False, description="Force complete re-indexing")
    include_patterns: Optional[List[str]] = Field(default=None, description="File patterns to include")
    exclude_patterns: Optional[List[str]] = Field(default=None, description="File patterns to exclude")
    max_files: Optional[int] = Field(default=None, description="Maximum number of files to index")
    
    @validator("workspace_path")
    def validate_workspace_path(cls, v):
        """Validate workspace path is not empty."""
        if not v or not v.strip():
            raise ValueError("Workspace path cannot be empty")
        return v.strip()


class QueryRequest(BaseModel):
    """Request model for codebase queries."""
    
    query: str = Field(..., description="Natural language query about the codebase")
    workspace_path: Optional[str] = Field(default=None, description="Specific workspace to query")
    max_results: int = Field(default=10, description="Maximum number of results to return")
    similarity_threshold: float = Field(default=0.7, description="Minimum similarity threshold")
    include_context: bool = Field(default=True, description="Include surrounding code context")
    language_filter: Optional[List[str]] = Field(default=None, description="Filter by programming languages")
    
    @validator("query")
    def validate_query(cls, v):
        """Validate query is not empty."""
        if not v or not v.strip():
            raise ValueError("Query cannot be empty")
        return v.strip()
    
    @validator("max_results")
    def validate_max_results(cls, v):
        """Validate max_results is within reasonable bounds."""
        if v < 1 or v > 50:
            raise ValueError("max_results must be between 1 and 50")
        return v
    
    @validator("similarity_threshold")
    def validate_similarity_threshold(cls, v):
        """Validate similarity threshold is between 0 and 1."""
        if v < 0.0 or v > 1.0:
            raise ValueError("similarity_threshold must be between 0.0 and 1.0")
        return v


class ExplainRequest(BaseModel):
    """Request model for code explanation."""
    
    code: str = Field(..., description="Code snippet to explain")
    language: Optional[str] = Field(default=None, description="Programming language of the code")
    file_path: Optional[str] = Field(default=None, description="File path for additional context")
    include_dependencies: bool = Field(default=True, description="Include related code dependencies")
    explanation_level: Literal["basic", "detailed", "expert"] = Field(
        default="detailed", 
        description="Level of explanation detail"
    )
    
    @validator("code")
    def validate_code(cls, v):
        """Validate code is not empty."""
        if not v or not v.strip():
            raise ValueError("Code cannot be empty")
        return v.strip()


class GenerateRequest(BaseModel):
    """Request model for code generation."""
    
    prompt: str = Field(..., description="Description of code to generate")
    language: str = Field(..., description="Target programming language")
    context: Optional[str] = Field(default=None, description="Additional context or existing code")
    style: Literal["concise", "detailed", "production"] = Field(
        default="detailed",
        description="Code generation style"
    )
    include_tests: bool = Field(default=False, description="Include unit tests")
    include_docs: bool = Field(default=True, description="Include documentation/comments")
    max_length: int = Field(default=1000, description="Maximum length of generated code")
    
    @validator("prompt")
    def validate_prompt(cls, v):
        """Validate prompt is not empty."""
        if not v or not v.strip():
            raise ValueError("Prompt cannot be empty")
        return v.strip()
    
    @validator("language")
    def validate_language(cls, v):
        """Validate language is supported."""
        supported_languages = [
            "python", "javascript", "typescript", "java", "cpp", "c", 
            "rust", "go", "php", "ruby", "csharp", "swift", "kotlin"
        ]
        if v.lower() not in supported_languages:
            raise ValueError(f"Language must be one of: {', '.join(supported_languages)}")
        return v.lower()
    
    @validator("max_length")
    def validate_max_length(cls, v):
        """Validate max_length is reasonable."""
        if v < 50 or v > 5000:
            raise ValueError("max_length must be between 50 and 5000")
        return v


class SimilarCodeRequest(BaseModel):
    """Request model for finding similar code."""
    
    code: str = Field(..., description="Code snippet to find similar patterns for")
    language: Optional[str] = Field(default=None, description="Programming language filter")
    workspace_path: Optional[str] = Field(default=None, description="Specific workspace to search")
    similarity_threshold: float = Field(default=0.8, description="Minimum similarity threshold")
    max_results: int = Field(default=10, description="Maximum number of similar code snippets")
    include_exact_matches: bool = Field(default=False, description="Include exact matches")
    
    @validator("code")
    def validate_code(cls, v):
        """Validate code is not empty."""
        if not v or not v.strip():
            raise ValueError("Code cannot be empty")
        return v.strip()
    
    @validator("similarity_threshold")
    def validate_similarity_threshold(cls, v):
        """Validate similarity threshold."""
        if v < 0.0 or v > 1.0:
            raise ValueError("similarity_threshold must be between 0.0 and 1.0")
        return v


class RefactorRequest(BaseModel):
    """Request model for refactoring suggestions."""
    
    code: str = Field(..., description="Code to analyze for refactoring")
    language: str = Field(..., description="Programming language of the code")
    file_path: Optional[str] = Field(default=None, description="File path for context")
    refactor_type: Literal["general", "performance", "readability", "maintainability"] = Field(
        default="general",
        description="Type of refactoring to focus on"
    )
    include_examples: bool = Field(default=True, description="Include refactored code examples")
    
    @validator("code")
    def validate_code(cls, v):
        """Validate code is not empty."""
        if not v or not v.strip():
            raise ValueError("Code cannot be empty")
        return v.strip()


class ChatMessage(BaseModel):
    """Chat message model for WebSocket communication."""
    
    type: Literal["query", "explain", "generate", "similar", "refactor"] = Field(
        ..., 
        description="Type of chat message"
    )
    content: str = Field(..., description="Message content")
    metadata: Optional[Dict[str, Any]] = Field(default=None, description="Additional metadata")
    session_id: Optional[str] = Field(default=None, description="Chat session identifier")
    
    @validator("content")
    def validate_content(cls, v):
        """Validate content is not empty."""
        if not v or not v.strip():
            raise ValueError("Content cannot be empty")
        return v.strip()


class HealthCheckRequest(BaseModel):
    """Request model for health check with optional detailed checks."""
    
    include_services: bool = Field(default=True, description="Include service health checks")
    include_models: bool = Field(default=True, description="Include AI model availability checks")
    timeout: int = Field(default=10, description="Timeout for health checks in seconds")
    
    @validator("timeout")
    def validate_timeout(cls, v):
        """Validate timeout is reasonable."""
        if v < 1 or v > 60:
            raise ValueError("timeout must be between 1 and 60 seconds")
        return v
