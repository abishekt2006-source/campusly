from typing import Optional, List
from datetime import datetime
from pydantic import BaseModel, Field

class PostMediaBase(BaseModel):
    media_url: str
    media_type: str = Field(..., pattern="^(image|video)$")
    aspect_ratio: Optional[str] = "1:1"
    order_index: Optional[int] = 0

class PostMediaCreate(PostMediaBase):
    pass

class PostMediaResponse(PostMediaBase):
    id: Optional[str] = None
    created_at: Optional[datetime] = None

class PostCreate(BaseModel):
    content: str = Field(..., min_length=1, max_length=5000, description="Post text body")
    community_id: Optional[str] = None
    media: Optional[List[PostMediaCreate]] = []
    hashtags: Optional[List[str]] = []

class PostUpdate(BaseModel):
    content: Optional[str] = Field(None, min_length=1, max_length=5000)

class AuthorSummary(BaseModel):
    id: str
    username: str
    full_name: str
    avatar_url: Optional[str] = ""
    department: str
    semester: int
    is_verified: bool = True

class CommunitySummary(BaseModel):
    id: str
    name: str
    slug: str
    avatar_url: Optional[str] = ""

class PostResponse(BaseModel):
    id: str
    content: str
    author: AuthorSummary
    community: Optional[CommunitySummary] = None
    media: List[PostMediaResponse] = []
    hashtags: List[str] = []
    upvote_count: int = 0
    downvote_count: int = 0
    like_count: int = 0
    comment_count: int = 0
    is_pinned: bool = False
    user_voted: int = 0      # 1 (upvoted), -1 (downvoted), 0 (none)
    user_liked: bool = False
    user_bookmarked: bool = False
    created_at: datetime
    updated_at: Optional[datetime] = None

class VoteRequest(BaseModel):
    vote_type: int = Field(..., ge=-1, le=1, description="1 for upvote, -1 for downvote, 0 to cancel")

class CommentCreate(BaseModel):
    content: str = Field(..., min_length=1, max_length=1000)
    parent_id: Optional[str] = None

class CommentResponse(BaseModel):
    id: str
    post_id: str
    content: str
    author: AuthorSummary
    parent_id: Optional[str] = None
    upvote_count: int = 0
    downvote_count: int = 0
    user_voted: int = 0
    replies: List["CommentResponse"] = []
    created_at: datetime

CommentResponse.model_rebuild()
