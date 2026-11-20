from typing import Optional, List
from datetime import datetime
from pydantic import BaseModel, Field
from app.schemas.post import AuthorSummary

class StoryViewer(BaseModel):
    id: str
    username: str
    full_name: str
    avatar_url: Optional[str] = ""
    department: str
    viewed_at: datetime

class StoryCreate(BaseModel):
    media_url: str = Field(..., description="Public CDN URL from Supabase Storage")
    media_type: str = Field(..., pattern="^(image|video)$")
    caption: Optional[str] = Field("", max_length=255)
    duration: Optional[int] = Field(5, ge=3, le=30, description="Duration in seconds (3-30s)")

class StoryResponse(BaseModel):
    id: str
    author: AuthorSummary
    media_url: str
    media_type: str
    caption: str = ""
    duration: int = 5
    created_at: datetime
    expires_at: datetime
    is_viewed: bool = False
    viewers_count: int = 0
    viewers: Optional[List[StoryViewer]] = None

class UserStoriesGroup(BaseModel):
    author: AuthorSummary
    has_unseen: bool = False
    stories: List[StoryResponse]
