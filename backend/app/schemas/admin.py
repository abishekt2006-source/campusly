from typing import Optional, List
from datetime import datetime
from pydantic import BaseModel

class AdminStatsResponse(BaseModel):
    total_students: int
    total_posts: int
    total_communities: int
    total_stories: int
    pending_reports: int
    pending_verifications: int

class UserActionRequest(BaseModel):
    action: str # verify, reject, ban, unban
    admin_notes: Optional[str] = ""

class ReportActionRequest(BaseModel):
    action: str # dismiss, action_taken (delete target)
    admin_notes: Optional[str] = ""
