from typing import List
from datetime import datetime, timedelta
from fastapi import APIRouter, HTTPException, status, Depends
from app.schemas.notification import NotificationResponse
from app.api.deps import get_current_verified_student
from app.database.supabase import get_supabase_client

router = APIRouter()

@router.get("", response_model=List[NotificationResponse], summary="Get student notifications")
async def get_my_notifications(current_user: dict = Depends(get_current_verified_student)):
    """Fetch recent notifications for currently signed in student."""
    user_id = current_user.get("id")
    supabase = get_supabase_client()

    if supabase:
        try:
            res = supabase.table("notifications").select(
                "*, profiles!notifications_sender_id_fkey(*)"
            ).eq("recipient_id", user_id).order("created_at", desc=True).limit(50).execute()

            items = []
            for n in res.data:
                s = n.get("profiles") or {}
                items.append(NotificationResponse(
                    id=n["id"],
                    recipient_id=n["recipient_id"],
                    sender={
                        "id": s.get("id", ""),
                        "username": s.get("username", "student"),
                        "full_name": s.get("full_name", "Student"),
                        "avatar_url": s.get("avatar_url", ""),
                        "department": s.get("department", "General"),
                        "semester": s.get("semester", 1),
                        "is_verified": s.get("is_verified", True)
                    } if s else None,
                    type=n["type"],
                    entity_id=n.get("entity_id"),
                    entity_type=n.get("entity_type"),
                    message=n["message"],
                    is_read=n.get("is_read", False),
                    created_at=n["created_at"]
                ))
            return items
        except Exception:
            pass

    # Simulation fallback
    now = datetime.utcnow()
    return [
        NotificationResponse(
            id="n1",
            recipient_id=user_id,
            sender={
                "id": "u1",
                "username": "priya_cs",
                "full_name": "Priya Sharma",
                "avatar_url": "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120",
                "department": "Computer Science",
                "semester": 6,
                "is_verified": True
            },
            type="like",
            message="liked your post about the campus hackathon.",
            is_read=False,
            created_at=now - timedelta(minutes=20)
        ),
        NotificationResponse(
            id="n2",
            recipient_id=user_id,
            sender={
                "id": "u2",
                "username": "rohan_clicks",
                "full_name": "Rohan Verma",
                "avatar_url": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120",
                "department": "Electronics (ECE)",
                "semester": 4,
                "is_verified": True
            },
            type="follow",
            message="started following your campus profile.",
            is_read=False,
            created_at=now - timedelta(hours=1)
        ),
        NotificationResponse(
            id="n3",
            recipient_id=user_id,
            sender=None,
            type="community_announcement",
            message="c/cs-dept posted an announcement: 'Registration open for HackFest 2026'.",
            is_read=True,
            created_at=now - timedelta(hours=4)
        )
    ]

@router.patch("/{notification_id}/read", summary="Mark notification as read")
async def mark_notification_read(
    notification_id: str,
    current_user: dict = Depends(get_current_verified_student)
):
    """Mark a specific notification as read."""
    supabase = get_supabase_client()
    if supabase:
        try:
            supabase.table("notifications").update({"is_read": True}).eq("id", notification_id).eq("recipient_id", current_user.get("id")).execute()
        except Exception:
            pass
    return {"status": "read", "id": notification_id}

@router.post("/read-all", summary="Mark all notifications as read")
async def mark_all_notifications_read(current_user: dict = Depends(get_current_verified_student)):
    """Mark all unread notifications for current student as read."""
    user_id = current_user.get("id")
    supabase = get_supabase_client()
    if supabase:
        try:
            supabase.table("notifications").update({"is_read": True}).eq("recipient_id", user_id).execute()
        except Exception:
            pass
    return {"status": "all_marked_read"}
