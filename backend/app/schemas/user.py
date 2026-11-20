from typing import Optional
from datetime import datetime
from pydantic import BaseModel, Field

class ProfileBase(BaseModel):
    username: str
    full_name: str
    email: str = Field(..., pattern=r"^[\w\.-]+@[\w\.-]+\.\w+$")
    department: str
    semester: int
    bio: Optional[str] = ""
    avatar_url: Optional[str] = ""
    cover_url: Optional[str] = ""
    role: str = "student"
    is_verified: bool = False

class ProfileUpdate(BaseModel):
    full_name: Optional[str] = None
    bio: Optional[str] = None
    avatar_url: Optional[str] = None
    cover_url: Optional[str] = None
    department: Optional[str] = None
    semester: Optional[int] = None

class ProfileResponse(ProfileBase):
    id: str
    followers_count: int = 0
    following_count: int = 0
    posts_count: int = 0
    is_banned: bool = False
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True
