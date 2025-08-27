"""
Similar code search endpoints for AI Coding Assistant
"""

from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field

from app.utils.dependencies import get_rag_service, get_optional_user
from app.services.rag_service import RAGService

router = APIRouter()


class SimilarRequest(BaseModel):
    code: str = Field(..., description="Code to find similar patterns for")
    language: str = Field(..., description="Programming language")
    max_results: int = Field(default=10, description="Maximum results")


class SimilarResult(BaseModel):
    file_path: str
    content: str
    similarity_score: float
    language: str


class SimilarResponse(BaseModel):
    results: List[SimilarResult]
    total_found: int


@router.post("/similar", response_model=SimilarResponse)
async def find_similar_code(
    request: SimilarRequest,
    rag_service: RAGService = Depends(get_rag_service),
    current_user: Optional[dict] = Depends(get_optional_user)
):
    """Find similar code patterns"""
    try:
        # Mock similar code results
        mock_results = [
            SimilarResult(
                file_path="src/utils/helpers.py",
                content=f"# Similar {request.language} pattern\n{request.code[:100]}...",
                similarity_score=0.92,
                language=request.language
            ),
            SimilarResult(
                file_path="src/components/processor.py", 
                content=f"# Related {request.language} logic\ndef process():\n    return result",
                similarity_score=0.78,
                language=request.language
            )
        ]
        
        return SimilarResponse(
            results=mock_results,
            total_found=len(mock_results)
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Similar code search failed: {str(e)}"
        )
