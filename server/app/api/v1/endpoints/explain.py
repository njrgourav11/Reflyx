"""
Code explanation endpoints for AI Coding Assistant
"""

from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field

from app.utils.dependencies import get_llm_service, get_optional_user
from app.services.llm_service import LLMService

router = APIRouter()


class ExplainRequest(BaseModel):
    code: str = Field(..., description="Code to explain")
    language: str = Field(..., description="Programming language")
    detail_level: str = Field(default="medium", description="Level of detail")


class ExplainResponse(BaseModel):
    explanation: str
    language: str
    complexity: str = "medium"


@router.post("/explain", response_model=ExplainResponse)
async def explain_code(
    request: ExplainRequest,
    llm_service: LLMService = Depends(get_llm_service),
    current_user: Optional[dict] = Depends(get_optional_user)
):
    """Explain code functionality"""
    try:
        # Mock explanation
        explanation = f"""**Code Explanation ({request.language})**

This {request.language} code performs the following operations:

**Overview:**
The selected code snippet demonstrates typical {request.language} patterns and functionality.

**Key Components:**
1. **Structure**: Well-organized code following best practices
2. **Logic**: Clear implementation of the intended functionality  
3. **Style**: Consistent with {request.language} conventions

**Detailed Analysis:**
```{request.language}
{request.code[:200]}{'...' if len(request.code) > 200 else ''}
```

**What it does:**
- Implements core functionality using {request.language} features
- Follows established patterns and conventions
- Handles data processing and operations appropriately

**Best Practices Observed:**
- Proper error handling
- Clear variable naming
- Appropriate use of {request.language} idioms
- Good code organization

This is a mock explanation. Configure AI providers for detailed analysis."""

        return ExplainResponse(
            explanation=explanation,
            language=request.language,
            complexity="medium"
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Code explanation failed: {str(e)}"
        )
