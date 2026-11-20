from typing import Optional, List
from datetime import datetime
from pydantic import BaseModel, Field
from app.schemas.post import AuthorSummary

class CommunityBase(BaseModel):
    name: str = Field(..., min_length=2, max_length=80)
    slug: str = Field(..., min_length=2, max_length=80, pattern=r"^[a-z0-9-]+$")
    description: str = Field(..., min_length=5, max_length=1000)
    rules: Optional[str] = ""
    avatar_url: Optional[str] = ""
    cover_url: Optional[str] = ""
    is_private: Optional[bool] = False

class CommunityCreate(CommunityBase):
    pass

class CommunityResponse(CommunityBase):
    id: str
    creator: Optional[AuthorSummary] = None
    members_count: int = 1
    posts_count: int = 0
    is_member: bool = False
    user_role: Optional[str] = None # member, moderator, admin
    created_at: datetime
    updated_at: Optional[datetime] = None

class CommunityMemberResponse(BaseModel):
    user: AuthorSummary
    role: str = "member"
    joined_at: datetime
