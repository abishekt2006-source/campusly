from typing import Optional
from datetime import datetime
from pydantic import BaseModel
from app.schemas.post import AuthorSummary

class NotificationResponse(BaseModel):
    id: str
    recipient_id: str
    sender: Optional[AuthorSummary] = None
    type: str # like, comment, reply, follow, mention, community_announcement
    entity_id: Optional[str] = None
    entity_type: Optional[str] = None
    message: str
    is_read: bool = False
    created_at: datetime
