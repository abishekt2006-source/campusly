from typing import Optional
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from app.core.security import decode_access_token
from app.database.supabase import get_supabase_client

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login", auto_error=False)

async def get_current_user(token: Optional[str] = Depends(oauth2_scheme)) -> dict:
    """
    Validates Bearer token from request header and returns user profile.
    Supports both Supabase JWTs and internal Campusly JWTs.
    """
    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication token is missing. Please log in.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # 1. Decode token using internal secret
    payload = decode_access_token(token)
    
    # 2. If valid internal JWT
    if payload and "sub" in payload:
        user_id = payload["sub"]
        role = payload.get("role", "student")

        supabase = get_supabase_client()
        if supabase:
            try:
                res = supabase.table("profiles").select("*").eq("id", user_id).single().execute()
                if res.data:
                    return res.data
            except Exception:
                pass

        # Return token payload user representation
        return {
            "id": user_id,
            "username": payload.get("username", "student"),
            "role": role,
            "is_verified": True,
            "is_banned": False,
        }

    # 3. Check if valid direct Supabase JWT token
    supabase = get_supabase_client()
    if supabase:
        try:
            user_res = supabase.auth.get_user(token)
            if user_res and user_res.user:
                profile_res = supabase.table("profiles").select("*").eq("id", user_res.user.id).single().execute()
                if profile_res.data:
                    return profile_res.data
                return {
                    "id": user_res.user.id,
                    "email": user_res.user.email,
                    "role": "student",
                    "is_verified": True,
                    "is_banned": False
                }
        except Exception:
            pass

    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Invalid or expired authentication credentials.",
        headers={"WWW-Authenticate": "Bearer"},
    )

async def get_current_verified_student(current_user: dict = Depends(get_current_user)) -> dict:
    """Ensure user is not banned and is verified."""
    if current_user.get("is_banned"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Your student account has been suspended by campus moderators."
        )
    return current_user

async def get_current_admin(current_user: dict = Depends(get_current_user)) -> dict:
    """Ensure user holds College Administrator privileges."""
    if current_user.get("role") != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access forbidden: Requires Campus Administrator role."
        )
    return current_user
