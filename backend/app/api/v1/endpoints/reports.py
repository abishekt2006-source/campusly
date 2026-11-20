import uuid
from datetime import datetime
from fastapi import APIRouter, HTTPException, status, Depends
from app.schemas.report import ReportCreate, ReportResponse
from app.api.deps import get_current_verified_student
from app.database.supabase import get_supabase_client

router = APIRouter()

@router.post("", response_model=ReportResponse, status_code=status.HTTP_201_CREATED, summary="Report inappropriate content or user")
async def create_report(
    req: ReportCreate,
    current_user: dict = Depends(get_current_verified_student)
):
    """Students can flag posts, comments, stories, or users for admin moderation."""
    user_id = current_user.get("id")
    report_id = str(uuid.uuid4())
    supabase = get_supabase_client()

    if supabase:
        try:
            report_data = {
                "id": report_id,
                "reporter_id": user_id,
                "target_type": req.target_type,
                "target_id": req.target_id,
                "reason": req.reason,
                "status": "pending",
                "admin_notes": ""
            }
            supabase.table("reports").insert(report_data).execute()
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Failed to submit report: {str(e)}")

    return ReportResponse(
        id=report_id,
        reporter={
            "id": user_id,
            "username": current_user.get("username", "student"),
            "full_name": current_user.get("full_name", "Student"),
            "avatar_url": current_user.get("avatar_url", ""),
            "department": current_user.get("department", "General"),
            "semester": current_user.get("semester", 1),
            "is_verified": True
        },
        target_type=req.target_type,
        target_id=req.target_id,
        reason=req.reason,
        status="pending",
        admin_notes="",
        created_at=datetime.utcnow()
    )
