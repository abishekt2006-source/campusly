from typing import Optional
from datetime import datetime
from pydantic import BaseModel, Field
from app.schemas.post import AuthorSummary

class ReportCreate(BaseModel):
    target_type: str = Field(..., pattern="^(post|comment|story|user|community)$")
    target_id: str
    reason: str = Field(..., min_length=3, max_length=500)

class ReportResponse(BaseModel):
    id: str
    reporter: Optional[AuthorSummary] = None
    target_type: str
    target_id: str
    reason: str
    status: str = "pending" # pending, reviewed, dismissed, action_taken
    admin_notes: Optional[str] = ""
    created_at: datetime
