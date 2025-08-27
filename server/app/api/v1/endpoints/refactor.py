"""
Code refactoring endpoints for AI Coding Assistant
"""

from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field

from app.utils.dependencies import get_llm_service, get_optional_user
from app.services.llm_service import LLMService

router = APIRouter()


class RefactorRequest(BaseModel):
    code: str = Field(..., description="Code to refactor")
    language: str = Field(..., description="Programming language")
    refactor_type: str = Field(default="general", description="Type of refactoring")


class RefactorSuggestion(BaseModel):
    title: str
    description: str
    original_code: str
    refactored_code: str
    confidence: float


class RefactorResponse(BaseModel):
    suggestions: List[RefactorSuggestion]
    total_suggestions: int


@router.post("/refactor", response_model=RefactorResponse)
async def get_refactor_suggestions(
    request: RefactorRequest,
    llm_service: LLMService = Depends(get_llm_service),
    current_user: Optional[dict] = Depends(get_optional_user)
):
    """Get refactoring suggestions for code"""
    try:
        # Mock refactoring suggestions
        suggestions = [
            RefactorSuggestion(
                title="Extract Method",
                description="Consider extracting repeated logic into a separate method",
                original_code=request.code[:100] + "...",
                refactored_code=f"# Refactored {request.language} code\ndef extracted_method():\n    # Extracted logic\n    pass",
                confidence=0.85
            ),
            RefactorSuggestion(
                title="Improve Variable Names",
                description="Use more descriptive variable names",
                original_code=request.code[:100] + "...",
                refactored_code=f"# Improved variable names\ndescriptive_variable = process_data()",
                confidence=0.75
            )
        ]
        
        return RefactorResponse(
            suggestions=suggestions,
            total_suggestions=len(suggestions)
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Refactoring suggestions failed: {str(e)}"
        )
