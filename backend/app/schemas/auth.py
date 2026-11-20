from typing import Optional
from pydantic import BaseModel, Field

# Graceful fallback for EmailStr if email-validator is not yet installed
try:
    from pydantic import EmailStr
except ImportError:
    EmailStr = str

class StudentRegisterRequest(BaseModel):
    full_name: str = Field(..., min_length=2, max_length=100, description="Full student name")
    email: str = Field(..., pattern=r"^[\w\.-]+@[\w\.-]+\.\w+$", description="College email ending with configured college domain")
    username: str = Field(..., min_length=3, max_length=30, pattern=r"^[a-zA-Z0-9_]+$", description="Alphanumeric username")
    password: str = Field(..., min_length=6, max_length=128, description="Strong password")
    department: str = Field(..., description="Academic department, e.g. Computer Science")
    semester: int = Field(..., ge=1, le=12, description="Current semester (1-12)")
    avatar_url: Optional[str] = ""

class StudentLoginRequest(BaseModel):
    email: str = Field(..., pattern=r"^[\w\.-]+@[\w\.-]+\.\w+$")
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: dict

class TokenData(BaseModel):
    user_id: Optional[str] = None
    role: Optional[str] = "student"

class PasswordResetRequest(BaseModel):
    email: str = Field(..., pattern=r"^[\w\.-]+@[\w\.-]+\.\w+$")
