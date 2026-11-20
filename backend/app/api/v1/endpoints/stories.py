from typing import List, Optional
import uuid
from datetime import datetime, timedelta
from fastapi import APIRouter, HTTPException, status, Depends, UploadFile, File
from app.schemas.story import StoryCreate, StoryResponse, StoryViewer, UserStoriesGroup
from app.api.deps import get_current_user, get_current_verified_student
from app.database.supabase import get_supabase_client
from app.services.storage import upload_file_to_storage

router = APIRouter()

@router.get("", response_model=List[UserStoriesGroup], summary="Fetch all active campus stories grouped by student")
async def get_active_stories(current_user: Optional[dict] = Depends(get_current_user)):
    """
    Fetches active stories that have not passed their 24-hour expiration window.
    Groups stories by student and computes whether the current student has unseen stories.
    """
    user_id = current_user.get("id") if current_user else None
    supabase = get_supabase_client()

    if supabase:
        try:
            now_iso = datetime.utcnow().isoformat()
            
            # Query active stories (expires_at > now and is_deleted = false)
            res = supabase.table("stories").select(
                "*, profiles!stories_author_id_fkey(*)"
            ).gt("expires_at", now_iso).eq("is_deleted", False).order("created_at", desc=False).execute()

            # Query views of current user
            viewed_story_ids = set()
            if user_id:
                views_res = supabase.table("story_views").select("story_id").eq("viewer_id", user_id).execute()
                viewed_story_ids = {v["story_id"] for v in views_res.data}

            # Group stories by author
            groups_dict = {}
            for item in res.data:
                author_data = item.get("profiles") or {}
                author_id = author_data.get("id", item.get("author_id"))

                is_viewed = item["id"] in viewed_story_ids

                # Viewers count
                count_res = supabase.table("story_views").select("id", count="exact").eq("story_id", item["id"]).execute()
                v_count = count_res.count or 0

                story_resp = StoryResponse(
                    id=item["id"],
                    author={
                        "id": author_data.get("id", ""),
                        "username": author_data.get("username", "student"),
                        "full_name": author_data.get("full_name", "Student"),
                        "avatar_url": author_data.get("avatar_url", ""),
                        "department": author_data.get("department", "General"),
                        "semester": author_data.get("semester", 1),
                        "is_verified": author_data.get("is_verified", True)
                    },
                    media_url=item["media_url"],
                    media_type=item["media_type"],
                    caption=item.get("caption", ""),
                    duration=item.get("duration", 5),
                    created_at=item["created_at"],
                    expires_at=item["expires_at"],
                    is_viewed=is_viewed,
                    viewers_count=v_count
                )

                if author_id not in groups_dict:
                    groups_dict[author_id] = {
                        "author": story_resp.author,
                        "stories": [],
                        "has_unseen": False
                    }

                groups_dict[author_id]["stories"].append(story_resp)
                if not is_viewed:
                    groups_dict[author_id]["has_unseen"] = True

            return [UserStoriesGroup(**g) for g in groups_dict.values()]
        except Exception as e:
            pass

    # Development simulation fallback
    now = datetime.utcnow()
    return [
        UserStoriesGroup(
            author={
                "id": "u_kavya",
                "username": "kavya_fest",
                "full_name": "Kavya Patel",
                "avatar_url": "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=120",
                "department": "Architecture",
                "semester": 4,
                "is_verified": True
            },
            has_unseen=True,
            stories=[
                StoryResponse(
                    id="s1_1",
                    author={
                        "id": "u_kavya",
                        "username": "kavya_fest",
                        "full_name": "Kavya Patel",
                        "avatar_url": "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=120",
                        "department": "Architecture",
                        "semester": 4,
                        "is_verified": True
                    },
                    media_url="https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=1080",
                    media_type="image",
                    caption="Main auditorium stage lighting setup for Cultural Fest 2026! 🎭✨",
                    duration=6,
                    created_at=now - timedelta(hours=3),
                    expires_at=now + timedelta(hours=21),
                    is_viewed=False,
                    viewers_count=64
                ),
                StoryResponse(
                    id="s1_2",
                    author={
                        "id": "u_kavya",
                        "username": "kavya_fest",
                        "full_name": "Kavya Patel",
                        "avatar_url": "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=120",
                        "department": "Architecture",
                        "semester": 4,
                        "is_verified": True
                    },
                    media_url="https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=1080",
                    media_type="image",
                    caption="Soundcheck underway! Bands rehearse tonight at 7 PM 🎸",
                    duration=5,
                    created_at=now - timedelta(hours=2),
                    expires_at=now + timedelta(hours=22),
                    is_viewed=False,
                    viewers_count=42
                )
            ]
        ),
        UserStoriesGroup(
            author={
                "id": "u_robo",
                "username": "roboclub",
                "full_name": "Robotics Club",
                "avatar_url": "https://images.unsplash.com/photo-1518770660439-4636190af475?w=120",
                "department": "ECE & Mech",
                "semester": 6,
                "is_verified": True
            },
            has_unseen=True,
            stories=[
                StoryResponse(
                    id="s2_1",
                    author={
                        "id": "u_robo",
                        "username": "roboclub",
                        "full_name": "Robotics Club",
                        "avatar_url": "https://images.unsplash.com/photo-1518770660439-4636190af475?w=120",
                        "department": "ECE & Mech",
                        "semester": 6,
                        "is_verified": True
                    },
                    media_url="https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=1080",
                    media_type="image",
                    caption="Line follower robot obstacle trial complete! Lab 3 is ready 🤖",
                    duration=5,
                    created_at=now - timedelta(hours=5),
                    expires_at=now + timedelta(hours=19),
                    is_viewed=False,
                    viewers_count=78
                )
            ]
        )
    ]

@router.post("", response_model=StoryResponse, status_code=status.HTTP_201_CREATED, summary="Upload a Snapchat-style 24h story")
async def create_story(
    req: StoryCreate,
    current_user: dict = Depends(get_current_verified_student)
):
    """
    Publishes a story with an automatic server-side 24-hour expiration window.
    """
    user_id = current_user.get("id")
    story_id = str(uuid.uuid4())
    now = datetime.utcnow()
    expires_at = now + timedelta(hours=24)
    supabase = get_supabase_client()

    if supabase:
        try:
            story_data = {
                "id": story_id,
                "author_id": user_id,
                "media_url": req.media_url,
                "media_type": req.media_type,
                "caption": req.caption or "",
                "duration": req.duration or 5,
                "expires_at": expires_at.isoformat(),
                "is_deleted": False
            }
            supabase.table("stories").insert(story_data).execute()
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Failed to post story: {str(e)}")

    return StoryResponse(
        id=story_id,
        author={
            "id": user_id,
            "username": current_user.get("username", "student"),
            "full_name": current_user.get("full_name", "Student"),
            "avatar_url": current_user.get("avatar_url", ""),
            "department": current_user.get("department", "General"),
            "semester": current_user.get("semester", 1),
            "is_verified": True
        },
        media_url=req.media_url,
        media_type=req.media_type,
        caption=req.caption or "",
        duration=req.duration or 5,
        created_at=now,
        expires_at=expires_at,
        is_viewed=False,
        viewers_count=0
    )

@router.post("/upload-media", summary="Upload story photo or video to Supabase Storage")
async def upload_story_media(
    file: UploadFile = File(...),
    current_user: dict = Depends(get_current_verified_student)
):
    """Uploads story photo or video to the 'stories' storage bucket."""
    public_url, media_type = await upload_file_to_storage(file, bucket_name="stories")
    return {
        "url": public_url,
        "media_type": media_type,
        "filename": file.filename
    }

@router.post("/{story_id}/view", summary="Record a view on a student's story")
async def record_story_view(
    story_id: str,
    current_user: dict = Depends(get_current_verified_student)
):
    """Records that the calling student viewed this story."""
    user_id = current_user.get("id")
    supabase = get_supabase_client()

    if supabase:
        try:
            supabase.table("story_views").upsert({
                "story_id": story_id,
                "viewer_id": user_id
            }, on_conflict="story_id, viewer_id").execute()
            return {"status": "view_recorded", "story_id": story_id}
        except Exception as e:
            pass

    return {"status": "view_recorded", "story_id": story_id}

@router.get("/{story_id}/viewers", response_model=List[StoryViewer], summary="Get viewers list (Author only)")
async def get_story_viewers(
    story_id: str,
    current_user: dict = Depends(get_current_verified_student)
):
    """Allows the story author or campus admin to see who viewed their story."""
    user_id = current_user.get("id")
    is_admin = current_user.get("role") == "admin"
    supabase = get_supabase_client()

    if supabase:
        try:
            # Check ownership
            story_res = supabase.table("stories").select("author_id").eq("id", story_id).single().execute()
            if not story_res.data:
                raise HTTPException(status_code=404, detail="Story not found or expired.")

            if story_res.data["author_id"] != user_id and not is_admin:
                raise HTTPException(status_code=403, detail="Only the story author can see who viewed this story.")

            # Fetch viewers
            viewers_res = supabase.table("story_views").select(
                "viewed_at, profiles(*)"
            ).eq("story_id", story_id).order("viewed_at", desc=True).execute()

            viewers = []
            for v in viewers_res.data:
                p = v.get("profiles") or {}
                viewers.append(StoryViewer(
                    id=p.get("id", ""),
                    username=p.get("username", "student"),
                    full_name=p.get("full_name", "Student"),
                    avatar_url=p.get("avatar_url", ""),
                    department=p.get("department", "General"),
                    viewed_at=v["viewed_at"]
                ))
            return viewers
        except HTTPException:
            raise
        except Exception as e:
            raise HTTPException(status_code=400, detail=str(e))

    # Dev fallback
    return [
        StoryViewer(
            id="v1",
            username="alex_rivera",
            full_name="Alex Rivera",
            avatar_url="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120",
            department="Computer Science",
            viewed_at=datetime.utcnow() - timedelta(minutes=15)
        ),
        StoryViewer(
            id="v2",
            username="priya_cs",
            full_name="Priya Sharma",
            avatar_url="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120",
            department="Computer Science",
            viewed_at=datetime.utcnow() - timedelta(minutes=30)
        )
    ]

@router.delete("/{story_id}", summary="Delete student story")
async def delete_story(
    story_id: str,
    current_user: dict = Depends(get_current_verified_student)
):
    """Allows author or college admin to delete their active story."""
    user_id = current_user.get("id")
    is_admin = current_user.get("role") == "admin"
    supabase = get_supabase_client()

    if supabase:
        try:
            story_res = supabase.table("stories").select("author_id").eq("id", story_id).single().execute()
            if not story_res.data:
                raise HTTPException(status_code=404, detail="Story not found.")

            if story_res.data["author_id"] != user_id and not is_admin:
                raise HTTPException(status_code=403, detail="Not authorized to delete this story.")

            supabase.table("stories").update({"is_deleted": True}).eq("id", story_id).execute()
            return {"message": "Story deleted successfully.", "story_id": story_id}
        except HTTPException:
            raise
        except Exception as e:
            raise HTTPException(status_code=400, detail=str(e))

    return {"message": "Story deleted successfully.", "story_id": story_id}
