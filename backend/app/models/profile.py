from sqlalchemy import Column, String, Integer, Boolean, DateTime, Text
from sqlalchemy.dialects.postgresql import UUID
from datetime import datetime
import uuid
from app.database.session import Base

class Profile(Base):
    __tablename__ = "profiles"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    username = Column(String(30), unique=True, nullable=False, index=True)
    full_name = Column(String(100), nullable=False)
    email = Column(String(255), unique=True, nullable=False, index=True)
    department = Column(String(100), nullable=False, index=True)
    semester = Column(Integer, nullable=False)
    bio = Column(Text, default="")
    avatar_url = Column(Text, default="")
    cover_url = Column(Text, default="")
    role = Column(String(20), default="student", index=True) # student, moderator, admin
    is_verified = Column(Boolean, default=False)
    is_banned = Column(Boolean, default=False)
    followers_count = Column(Integer, default=0)
    following_count = Column(Integer, default=0)
    posts_count = Column(Integer, default=0)
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)
    updated_at = Column(DateTime(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow)
