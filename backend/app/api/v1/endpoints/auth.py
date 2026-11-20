from fastapi import APIRouter, HTTPException, status, Depends
from app.schemas.auth import StudentRegisterRequest, StudentLoginRequest, TokenResponse, PasswordResetRequest
from app.core.security import validate_college_email, create_access_token, get_password_hash, verify_password
from app.core.config import settings
from app.database.supabase import get_supabase_client
from app.api.deps import get_current_user
import uuid

router = APIRouter()

@router.get("/verify-domain", summary="Check if email domain is allowed")
def check_college_email_domain(email: str):
    """Instant check for client-side forms to verify if the entered email matches the configured college domain."""
    is_valid = validate_college_email(email)
    return {
        "email": email,
        "is_allowed": is_valid,
        "required_domain": settings.COLLEGE_EMAIL_DOMAIN or "Any verified student"
    }

@router.post("/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED, summary="Register a verified student")
async def register_student(req: StudentRegisterRequest):
    """
    Register a new college student:
    - Enforces strict college email domain match
    - Registers through Supabase Auth (which activates the PostgreSQL on_auth_user_created trigger)
    - Returns session token and user profile
    """
    # 1. Enforce College Email Domain
    if not validate_college_email(req.email):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Registration restricted to official college email addresses ending with '@{settings.COLLEGE_EMAIL_DOMAIN}'."
        )

    supabase = get_supabase_client()

    if supabase:
        try:
            # Check if username is already taken in public.profiles
            existing = supabase.table("profiles").select("id").eq("username", req.username).execute()
            if existing.data and len(existing.data) > 0:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Username '@{req.username}' is already in use by another student."
                )

            # Register with Supabase Auth
            auth_response = supabase.auth.sign_up({
                "email": req.email,
                "password": req.password,
                "options": {
                    "data": {
                        "full_name": req.full_name,
                        "username": req.username,
                        "department": req.department,
                        "semester": req.semester,
                        "role": "student",
                        "avatar_url": req.avatar_url or f"https://api.dicebear.com/7.x/bottts/svg?seed={req.username}",
                        "is_verified": True
                    }
                }
            })

            user_id = str(auth_response.user.id) if auth_response.user else str(uuid.uuid4())
            token = create_access_token(subject=user_id, role="student")

            return {
                "access_token": token,
                "token_type": "bearer",
                "user": {
                    "id": user_id,
                    "email": req.email,
                    "username": req.username,
                    "full_name": req.full_name,
                    "department": req.department,
                    "semester": req.semester,
                    "role": "student",
                    "is_verified": True
                }
            }
        except HTTPException:
            raise
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Registration error: {str(e)}"
            )
    else:
        # Development fallback mode
        mock_id = str(uuid.uuid4())
        token = create_access_token(subject=mock_id, role="student")
        return {
            "access_token": token,
            "token_type": "bearer",
            "user": {
                "id": mock_id,
                "email": req.email,
                "username": req.username,
                "full_name": req.full_name,
                "department": req.department,
                "semester": req.semester,
                "role": "student",
                "is_verified": True
            }
        }

@router.post("/login", response_model=TokenResponse, summary="Student sign in")
async def login_student(req: StudentLoginRequest):
    """Authenticate student and issue JWT Bearer session token."""
    supabase = get_supabase_client()

    if supabase:
        try:
            auth_res = supabase.auth.sign_in_with_password({
                "email": req.email,
                "password": req.password
            })
            if not auth_res.user:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Invalid college email or password."
                )

            # Retrieve profile details
            profile_res = supabase.table("profiles").select("*").eq("id", auth_res.user.id).single().execute()
            profile = profile_res.data if profile_res.data else {}

            token = create_access_token(
                subject=str(auth_res.user.id),
                role=profile.get("role", "student")
            )

            return {
                "access_token": token,
                "token_type": "bearer",
                "user": profile or {
                    "id": str(auth_res.user.id),
                    "email": req.email,
                    "role": "student"
                }
            }
        except HTTPException:
            raise
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid college email or password."
            )
    else:
        # Development mode login
        mock_id = "mock_student_lead"
        is_admin = req.email.startswith("admin@")
        role = "admin" if is_admin else "student"
        token = create_access_token(subject=mock_id, role=role)
        return {
            "access_token": token,
            "token_type": "bearer",
            "user": {
                "id": mock_id,
                "email": req.email,
                "username": req.email.split("@")[0],
                "full_name": "Verified Campus User",
                "department": "Computer Science",
                "semester": 6,
                "role": role,
                "is_verified": True
            }
        }

@router.get("/me", summary="Get currently authenticated student profile")
async def get_current_student_profile(current_user: dict = Depends(get_current_user)):
    """Fetch current user's profile information."""
    return current_user

@router.post("/reset-password", summary="Request password reset")
async def request_password_reset(req: PasswordResetRequest):
    """Trigger Supabase Auth password recovery email."""
    supabase = get_supabase_client()
    if supabase:
        try:
            supabase.auth.reset_password_for_email(req.email)
        except Exception:
            pass # Avoid leaking whether the email exists
    return {"message": "If this email is registered, a password recovery link has been dispatched."}
