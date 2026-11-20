import os
from typing import List, Union
from pydantic import AnyHttpUrl, validator
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    APP_NAME: str = "Campusly API"
    ENVIRONMENT: str = "development"
    DEBUG: bool = True
    API_V1_PREFIX: str = "/api/v1"

    # Security
    SECRET_KEY: str = os.getenv("SECRET_KEY", "campusly-super-secure-production-ready-jwt-secret-key-32chars")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7 # 7 days persistent session

    # College Exclusive Domain Filter (e.g. "college.edu", "mycampus.ac.in")
    # If empty string, allows any student verified by admin
    COLLEGE_EMAIL_DOMAIN: str = os.getenv("COLLEGE_EMAIL_DOMAIN", "college.edu")

    # CORS Origins
    CORS_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
        "https://*.netlify.app",
        "https://*.vercel.app"
    ]

    # Supabase Credentials
    SUPABASE_URL: str = os.getenv("SUPABASE_URL", "https://your-project-id.supabase.co")
    SUPABASE_KEY: str = os.getenv("SUPABASE_KEY", "your-supabase-anon-key")
    SUPABASE_SERVICE_ROLE_KEY: str = os.getenv("SUPABASE_SERVICE_ROLE_KEY", "your-supabase-service-role-key")

    # PostgreSQL Direct Connection URI (SQLAlchemy)
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL", 
        "postgresql://postgres:password@localhost:5432/postgres"
    )

    # Supabase Storage Buckets
    STORAGE_BUCKET_AVATARS: str = "avatars"
    STORAGE_BUCKET_POSTS: str = "posts"
    STORAGE_BUCKET_STORIES: str = "stories"
    STORAGE_BUCKET_COMMUNITIES: str = "communities"

    class Config:
        env_file = ".env"
        case_sensitive = True
        extra = "allow"

settings = Settings()
