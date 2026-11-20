from typing import List, Optional
from datetime import datetime
from fastapi import APIRouter, HTTPException, status, Depends
from app.schemas.admin import AdminStatsResponse, UserActionRequest, ReportActionRequest
from app.schemas.report import ReportResponse
from app.schemas.user import ProfileResponse
from app.api.deps import get_current_admin
from app.database.supabase import get_supabase_client

router = APIRouter()

@router.get("/stats", response_model=AdminStatsResponse, summary="Get platform moderation & system metrics")
async def get_admin_stats(admin_user: dict = Depends(get_current_admin)):
    """Overview statistics for college administrators."""
    supabase = get_supabase_client()

    if supabase:
        try:
            students_res = supabase.table("profiles").select("id", count="exact").execute()
            posts_res = supabase.table("posts").select("id", count="exact").execute()
            comms_res = supabase.table("communities").select("id", count="exact").execute()
            stories_res = supabase.table("stories").select("id", count="exact").gt("expires_at", datetime.utcnow().isoformat()).execute()
            reports_res = supabase.table("reports").select("id", count="exact").eq("status", "pending").execute()
            verif_res = supabase.table("profiles").select("id", count="exact").eq("is_verified", False).execute()

            return AdminStatsResponse(
                total_students=students_res.count or 0,
                total_posts=posts_res.count or 0,
                total_communities=comms_res.count or 0,
                total_stories=stories_res.count or 0,
                pending_reports=reports_res.count or 0,
                pending_verifications=verif_res.count or 0
            )
        except Exception:
            pass

    # Simulation fallback
    return AdminStatsResponse(
        total_students=2410,
        total_posts=1850,
        total_communities=18,
        total_stories=42,
        pending_reports=3,
        pending_verifications=5
    )

@router.get("/users", summary="List registered students for administration")
async def get_all_users_admin(admin_user: dict = Depends(get_current_admin)):
    """List students with ban and verification status."""
    supabase = get_supabase_client()
    if supabase:
        try:
            res = supabase.table("profiles").select("*").order("created_at", desc=True).limit(100).execute()
            return res.data or []
        except Exception:
            pass

    # Simulation fallback
    return [
        {
            "id": "u1",
            "username": "alex_rivera",
            "full_name": "Alex Rivera",
            "email": "alex.cs@college.edu",
            "department": "Computer Science",
            "semester": 6,
            "role": "student",
            "is_verified": True,
            "is_banned": False,
            "created_at": datetime.utcnow()
        },
        {
            "id": "u2",
            "username": "suspicious_user",
            "full_name": "Test Spammer",
            "email": "spam@outsider.com",
            "department": "General",
            "semester": 1,
            "role": "student",
            "is_verified": False,
            "is_banned": True,
            "created_at": datetime.utcnow()
        }
    ]

@router.post("/users/{user_id}/action", summary="Approve, reject, ban, or unban student")
async def moderate_user(
    user_id: str,
    req: UserActionRequest,
    admin_user: dict = Depends(get_current_admin)
):
    """Execute administrative action on student account."""
    supabase = get_supabase_client()

    update_payload = {}
    if req.action == "verify":
        update_payload = {"is_verified": True}
    elif req.action == "ban":
        update_payload = {"is_banned": True}
    elif req.action == "unban":
        update_payload = {"is_banned": False}
    elif req.action == "reject":
        update_payload = {"is_verified": False, "is_banned": True}
    else:
        raise HTTPException(status_code=400, detail="Invalid action.")

    if supabase:
        try:
            supabase.table("profiles").update(update_payload).eq("id", user_id).execute()
        except Exception as e:
            raise HTTPException(status_code=400, detail=str(e))

    return {"status": "success", "user_id": user_id, "action": req.action}

@router.get("/reports", summary="View reported content moderation queue")
async def get_reported_content(admin_user: dict = Depends(get_current_admin)):
    """List pending reports."""
    supabase = get_supabase_client()
    if supabase:
        try:
            res = supabase.table("reports").select("*, profiles!reports_reporter_id_fkey(*)").order("created_at", desc=True).execute()
            return res.data or []
        except Exception:
            pass

    # Simulation fallback
    return [
        {
            "id": "rep_1",
            "reporter": {"username": "priya_cs", "full_name": "Priya Sharma"},
            "target_type": "post",
            "target_id": "p_toxic_1",
            "reason": "Harassment / inappropriate language in comments",
            "status": "pending",
            "created_at": datetime.utcnow()
        }
    ]

@router.post("/reports/{report_id}/action", summary="Resolve a moderation report")
async def resolve_report(
    report_id: str,
    req: ReportActionRequest,
    admin_user: dict = Depends(get_current_admin)
):
    """Take action on reported content (delete post or dismiss report)."""
    supabase = get_supabase_client()
    if supabase:
        try:
            report_res = supabase.table("reports").select("*").eq("id", report_id).single().execute()
            if not report_res.data:
                raise HTTPException(status_code=404, detail="Report not found.")

            target_type = report_res.data["target_type"]
            target_id = report_res.data["target_id"]

            if req.action == "action_taken":
                # Delete target content if requested
                if target_type == "post":
                    supabase.table("posts").delete().eq("id", target_id).execute()
                elif target_type == "comment":
                    supabase.table("comments").delete().eq("id", target_id).execute()
                elif target_type == "story":
                    supabase.table("stories").update({"is_deleted": True}).eq("id", target_id).execute()

            # Update report status
            new_status = "action_taken" if req.action == "action_taken" else "dismissed"
            supabase.table("reports").update({
                "status": new_status,
                "admin_notes": req.admin_notes or ""
            }).eq("id", report_id).execute()

            return {"status": "resolved", "report_id": report_id, "outcome": new_status}
        except Exception as e:
            raise HTTPException(status_code=400, detail=str(e))

    return {"status": "resolved", "report_id": report_id}
