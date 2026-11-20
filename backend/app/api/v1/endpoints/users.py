from typing import List, Optional
from fastapi import APIRouter, HTTPException, status, Depends
from app.schemas.user import ProfileResponse, ProfileUpdate
from app.schemas.post import PostResponse
from app.schemas.community import CommunityResponse
from app.api.deps import get_current_user, get_current_verified_student
from app.database.supabase import get_supabase_client

router = APIRouter()

@router.get("/{username}", summary="Get student public profile")
async def get_user_profile(
    username: str, 
    current_user: Optional[dict] = Depends(get_current_user)
):
    """Retrieve public profile info for any campus student."""
    supabase = get_supabase_client()
    caller_id = current_user.get("id") if current_user else None

    if supabase:
        try:
            res = supabase.table("profiles").select(
                "id, username, full_name, email, department, semester, bio, avatar_url, cover_url, role, is_verified, followers_count, following_count, posts_count, created_at"
            ).eq("username", username.lower()).single().execute()

            if not res.data:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=f"Student '@{username}' not found on campus."
                )
            
            profile_data = res.data
            target_id = profile_data["id"]

            # Check if caller is following this student
            is_following = False
            if caller_id and caller_id != target_id:
                f_res = supabase.table("follows").select("id").eq("follower_id", caller_id).eq("following_id", target_id).execute()
                is_following = bool(f_res.data)

            return {**profile_data, "is_following": is_following}
        except HTTPException:
            raise
        except Exception:
            pass
    
    # Fallback simulation
    return {
        "id": "mock_id",
        "username": username,
        "full_name": f"{username.replace('_', ' ').title()}",
        "email": f"{username}@college.edu",
        "department": "Computer Science",
        "semester": 6,
        "bio": "Enthusiastic learner & campus explorer 🚀 Coding club lead.",
        "avatar_url": f"https://api.dicebear.com/7.x/bottts/svg?seed={username}",
        "cover_url": "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=1200",
        "role": "student",
        "is_verified": True,
        "followers_count": 142,
        "following_count": 98,
        "posts_count": 12,
        "is_following": False
    }

@router.patch("/me", summary="Update current student profile")
async def update_my_profile(
    updates: ProfileUpdate, 
    current_user: dict = Depends(get_current_verified_student)
):
    """Update personal details (bio, avatar, cover photo, semester)."""
    user_id = current_user.get("id")
    update_data = {k: v for k, v in updates.dict(exclude_unset=True).items() if v is not None}

    if not update_data:
        return current_user

    supabase = get_supabase_client()
    if supabase:
        try:
            res = supabase.table("profiles").update(update_data).eq("id", user_id).execute()
            if res.data and len(res.data) > 0:
                return res.data[0]
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Could not update profile: {str(e)}"
            )

    return {**current_user, **update_data}

@router.post("/{username}/follow", summary="Follow or unfollow a student")
async def toggle_follow_user(
    username: str,
    current_user: dict = Depends(get_current_verified_student)
):
    """Toggles follow on target student. Automatically updates follower counts."""
    caller_id = current_user.get("id")
    supabase = get_supabase_client()

    if supabase:
        try:
            # Find target user
            target_res = supabase.table("profiles").select("id, username, followers_count").eq("username", username.lower()).single().execute()
            if not target_res.data:
                raise HTTPException(status_code=404, detail="Student not found.")

            target_id = target_res.data["id"]
            if target_id == caller_id:
                raise HTTPException(status_code=400, detail="You cannot follow your own profile.")

            # Check if already following
            existing = supabase.table("follows").select("id").eq("follower_id", caller_id).eq("following_id", target_id).execute()

            if existing.data:
                # Unfollow
                supabase.table("follows").delete().eq("follower_id", caller_id).eq("following_id", target_id).execute()
                # Decrement counts
                supabase.table("profiles").update({"following_count": max(0, current_user.get("following_count", 1) - 1)}).eq("id", caller_id).execute()
                new_followers = max(0, target_res.data["followers_count"] - 1)
                supabase.table("profiles").update({"followers_count": new_followers}).eq("id", target_id).execute()
                return {"status": "unfollowed", "username": username, "followers_count": new_followers}
            else:
                # Follow
                supabase.table("follows").insert({"follower_id": caller_id, "following_id": target_id}).execute()
                # Increment counts
                supabase.table("profiles").update({"following_count": current_user.get("following_count", 0) + 1}).eq("id", caller_id).execute()
                new_followers = target_res.data["followers_count"] + 1
                supabase.table("profiles").update({"followers_count": new_followers}).eq("id", target_id).execute()

                # Generate notification
                supabase.table("notifications").insert({
                    "recipient_id": target_id,
                    "sender_id": caller_id,
                    "type": "follow",
                    "entity_id": caller_id,
                    "entity_type": "profile",
                    "message": f"@{current_user.get('username')} started following your campus profile."
                }).execute()

                return {"status": "following", "username": username, "followers_count": new_followers}
        except HTTPException:
            raise
        except Exception as e:
            raise HTTPException(status_code=400, detail=str(e))

    return {"status": "following", "username": username}

@router.get("/{username}/posts", summary="Get all posts by a specific student")
async def get_user_posts(
    username: str,
    current_user: Optional[dict] = Depends(get_current_user)
):
    """Retrieve posts authored by student."""
    supabase = get_supabase_client()
    if supabase:
        try:
            u_res = supabase.table("profiles").select("id").eq("username", username.lower()).single().execute()
            if not u_res.data:
                return []

            author_id = u_res.data["id"]
            p_res = supabase.table("posts").select(
                "*, profiles!posts_author_id_fkey(*), communities(*), post_media(*)"
            ).eq("author_id", author_id).order("created_at", desc=True).execute()

            posts = []
            for item in p_res.data:
                posts.append({
                    "id": item["id"],
                    "content": item["content"],
                    "author": item.get("profiles") or {},
                    "community": item.get("communities"),
                    "media": item.get("post_media") or [],
                    "hashtags": [],
                    "upvote_count": item.get("upvote_count", 0),
                    "downvote_count": item.get("downvote_count", 0),
                    "like_count": item.get("like_count", 0),
                    "comment_count": item.get("comment_count", 0),
                    "created_at": item["created_at"]
                })
            return posts
        except Exception:
            pass

    return []

@router.get("/me/bookmarks", summary="Get current student's bookmarked posts")
async def get_my_bookmarks(current_user: dict = Depends(get_current_verified_student)):
    """Fetch all saved posts for current student."""
    user_id = current_user.get("id")
    supabase = get_supabase_client()
    if supabase:
        try:
            b_res = supabase.table("bookmarks").select(
                "post_id, posts(*, profiles!posts_author_id_fkey(*), communities(*), post_media(*))"
            ).eq("user_id", user_id).order("created_at", desc=True).execute()

            saved = []
            for b in b_res.data:
                p = b.get("posts")
                if p:
                    saved.append({
                        "id": p["id"],
                        "content": p["content"],
                        "author": p.get("profiles") or {},
                        "community": p.get("communities"),
                        "media": p.get("post_media") or [],
                        "hashtags": [],
                        "upvote_count": p.get("upvote_count", 0),
                        "downvote_count": p.get("downvote_count", 0),
                        "like_count": p.get("like_count", 0),
                        "comment_count": p.get("comment_count", 0),
                        "created_at": p["created_at"],
                        "user_bookmarked": True
                    })
            return saved
        except Exception:
            pass

    return []
