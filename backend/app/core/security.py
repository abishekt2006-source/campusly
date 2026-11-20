import hashlib
import secrets
from datetime import datetime, timedelta
from typing import Optional, Any, Union
import jwt
from jwt.exceptions import PyJWTError
from app.core.config import settings

def get_password_hash(password: str) -> str:
    """
    Hashes password using PBKDF2-HMAC-SHA256 with a unique random salt.
    100% pure standard library: requires zero C/C++ compiler or native toolchain.
    """
    salt = secrets.token_hex(16)
    key = hashlib.pbkdf2_hmac('sha256', password.encode('utf-8'), salt.encode('utf-8'), 100000)
    return f"{salt}${key.hex()}"

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verifies plain password against stored salt$hash in constant time."""
    try:
        if "$" not in hashed_password:
            return False
        salt, key_hex = hashed_password.split("$", 1)
        new_key = hashlib.pbkdf2_hmac('sha256', plain_password.encode('utf-8'), salt.encode('utf-8'), 100000)
        return secrets.compare_digest(new_key.hex(), key_hex)
    except Exception:
        return False

def create_access_token(subject: Union[str, Any], expires_delta: Optional[timedelta] = None, role: str = "student") -> str:
    """Generate signed JWT access token using PyJWT."""
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    
    to_encode = {
        "exp": expire,
        "sub": str(subject),
        "role": role,
        "type": "access_token"
    }
    return jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)

def decode_access_token(token: str) -> Optional[dict]:
    """Decode and validate JWT access token."""
    try:
        return jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
    except PyJWTError:
        return None

def validate_college_email(email: str) -> bool:
    """
    Ensure the registering student's email belongs to the configured college domain.
    E.g. john@college.edu matches domain 'college.edu'.
    """
    if not settings.COLLEGE_EMAIL_DOMAIN:
        return True # Open / manual admin verification mode
    
    email_clean = email.strip().lower()
    expected_domain = f"@{settings.COLLEGE_EMAIL_DOMAIN.strip().lower()}"
    return email_clean.endswith(expected_domain)
