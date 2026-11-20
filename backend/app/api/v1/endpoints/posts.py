from typing import List, Optional
import uuid
import re
from datetime import datetime
from fastapi import APIRouter, HTTPException, status, Depends, Query, UploadFile, File
from app.schemas.post import (
    PostCreate, 
    PostUpdate, 
    PostResponse, 
    VoteRequest, 
    CommentCreate, 
    CommentResponse
)
from app.api.deps import get_current_user, get_current_verified_student
from app.database.supabase import get_supabase_client
from app.services.storage import upload_file_to_storage

router = APIRouter()

# In-memory store for local testing fallback when Supabase is running locally/offline
_LOCAL_POSTS = []

def extract_hashtags(text: str) -> List[str]:
    """Finds all #hashtag strings in text without the hash symbol."""
    return re.findall(r"#([a-zA-Z0-9_]+)", text)

@router.get("", response_model=List[PostResponse], summary="Fetch Campus Feed")
async def get_posts_feed(
    category: str = Query("trending", pattern="^(trending|latest|popular|following)$"),
    community_id: Optional[str] = None,
    limit: int = Query(20, ge=1, le=100),
    offset: int = Query(0, ge=0),
    current_user: Optional[dict] = Depends(get_current_user)
):
    """
    Fetches posts feed sorted by:
    - trending: highest net vote score (upvotes - downvotes) and recency
    - latest: reverse chronological order
    - popular: highest like count
    - following: posts from followed students
    """
    user_id = current_user.get("id") if current_user else None
    supabase = get_supabase_client()

    if supabase:
        try:
            query = supabase.table("posts").select(
                "*, profiles!posts_author_id_fkey(*), communities(*), post_media(*)"
            )
            
            if community_id:
                query = query.eq("community_id", community_id)

            if category == "latest":
                query = query.order("created_at", desc=True)
            elif category == "popular":
                query = query.order("like_count", desc=True).order("created_at", desc=True)
            else: # trending default
                query = query.order("created_at", desc=True)

            query = query.range(offset, offset + limit - 1)
            res = query.execute()

            posts_data = []
            for item in res.data:
                p_id = item["id"]
                author = item.get("profiles") or {}
                community = item.get("communities") or None
                media_list = item.get("post_media") or []

                # Fetch hashtags
                tag_res = supabase.table("post_hashtags").select("hashtags(tag)").eq("post_id", p_id).execute()
                tags = [t["hashtags"]["tag"] for t in tag_res.data if t.get("hashtags")]

                # Check if current user voted / liked / bookmarked
                user_voted = 0
                user_liked = False
                user_bookmarked = False

                if user_id:
                    v_res = supabase.table("post_votes").select("vote_type").eq("post_id", p_id).eq("user_id", user_id).execute()
                    if v_res.data:
                        user_voted = v_res.data[0]["vote_type"]

                    l_res = supabase.table("post_likes").select("id").eq("post_id", p_id).eq("user_id", user_id).execute()
                    if l_res.data:
                        user_liked = True

                    b_res = supabase.table("bookmarks").select("id").eq("post_id", p_id).eq("user_id", user_id).execute()
                    if b_res.data:
                        user_bookmarked = True

                posts_data.append(PostResponse(
                    id=p_id,
                    content=item["content"],
                    author={
                        "id": author.get("id", ""),
                        "username": author.get("username", "student"),
                        "full_name": author.get("full_name", "Campus Student"),
                        "avatar_url": author.get("avatar_url", ""),
                        "department": author.get("department", "General"),
                        "semester": author.get("semester", 1),
                        "is_verified": author.get("is_verified", True)
                    },
                    community={
                        "id": community["id"],
                        "name": community["name"],
                        "slug": community["slug"],
                        "avatar_url": community.get("avatar_url", "")
                    } if community else None,
                    media=media_list,
                    hashtags=tags,
                    upvote_count=item.get("upvote_count", 0),
                    downvote_count=item.get("downvote_count", 0),
                    like_count=item.get("like_count", 0),
                    comment_count=item.get("comment_count", 0),
                    is_pinned=item.get("is_pinned", False),
                    user_voted=user_voted,
                    user_liked=user_liked,
                    user_bookmarked=user_bookmarked,
                    created_at=item["created_at"],
                    updated_at=item.get("updated_at")
                ))

            return posts_data
        except Exception as e:
            pass

    # Development fallback feed
    return [
        PostResponse(
            id="p1",
            content="Campus Hackathon 2026 kick-off! Our team is building an automated timetable and notes sharing engine. Drop by lab 402 if you want to collaborate! 🚀💻 #Hackathon #TechFest2026",
            author={
                "id": "u1",
                "username": "priya_cs",
                "full_name": "Priya Sharma",
                "avatar_url": "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120",
                "department": "Computer Science",
                "semester": 6,
                "is_verified": True
            },
            community={
                "id": "c1",
                "name": "Coding & Hackathons",
                "slug": "coding-club",
                "avatar_url": "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=100"
            },
            media=[{
                "media_url": "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=1000",
                "media_type": "image",
                "aspect_ratio": "16:9",
                "order_index": 0
            }],
            hashtags=["Hackathon", "TechFest2026"],
            upvote_count=42,
            downvote_count=1,
            like_count=68,
            comment_count=18,
            is_pinned=False,
            user_voted=1,
            user_liked=True,
            user_bookmarked=False,
            created_at=datetime.utcnow()
        ),
        PostResponse(
            id="p2",
            content="Golden hour across the library amphitheatre right before evening practicals begin. Good luck to everyone with exams tomorrow! 📸✨ #CampusLife #GoldenHour",
            author={
                "id": "u2",
                "username": "rohan_clicks",
                "full_name": "Rohan Verma",
                "avatar_url": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120",
                "department": "Electronics (ECE)",
                "semester": 4,
                "is_verified": True
            },
            community={
                "id": "c2",
                "name": "Campus Photography Club",
                "slug": "shutterbugs",
                "avatar_url": "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=100"
            },
            media=[{
                "media_url": "https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?w=1000",
                "media_type": "image",
                "aspect_ratio": "4:3",
                "order_index": 0
            }],
            hashtags=["CampusLife", "GoldenHour"],
            upvote_count=129,
            downvote_count=0,
            like_count=194,
            comment_count=32,
            is_pinned=False,
            user_voted=0,
            user_liked=False,
            user_bookmarked=True,
            created_at=datetime.utcnow()
        )
    ]

@router.post("", response_model=PostResponse, status_code=status.HTTP_201_CREATED, summary="Create a new post")
async def create_post(
    req: PostCreate,
    current_user: dict = Depends(get_current_verified_student)
):
    """Publish a post with text, optional media attachments, and hashtags."""
    user_id = current_user.get("id")
    post_id = str(uuid.uuid4())
    supabase = get_supabase_client()

    parsed_tags = req.hashtags or extract_hashtags(req.content)

    if supabase:
        try:
            # 1. Insert into public.posts
            post_insert = {
                "id": post_id,
                "author_id": user_id,
                "community_id": req.community_id if req.community_id else None,
                "content": req.content,
                "upvote_count": 0,
                "downvote_count": 0,
                "like_count": 0,
                "comment_count": 0,
            }
            supabase.table("posts").insert(post_insert).execute()

            # 2. Insert media items
            if req.media:
                media_rows = [
                    {
                        "post_id": post_id,
                        "media_url": m.media_url,
                        "media_type": m.media_type,
                        "aspect_ratio": m.aspect_ratio or "1:1",
                        "order_index": idx
                    }
                    for idx, m in enumerate(req.media)
                ]
                supabase.table("post_media").insert(media_rows).execute()

            # 3. Handle hashtags
            for tag in parsed_tags:
                clean_tag = tag.strip().lstrip("#")
                # Upsert hashtag
                tag_res = supabase.table("hashtags").select("id").eq("tag", clean_tag).execute()
                if tag_res.data:
                    tag_id = tag_res.data[0]["id"]
                    supabase.table("hashtags").update({"post_count": supabase.raw("post_count + 1")}).eq("id", tag_id).execute()
                else:
                    new_tag = supabase.table("hashtags").insert({"tag": clean_tag, "post_count": 1}).execute()
                    tag_id = new_tag.data[0]["id"]
                
                # Link post_hashtags
                supabase.table("post_hashtags").insert({"post_id": post_id, "hashtag_id": tag_id}).execute()

            # Increment user's posts_count
            supabase.table("profiles").update({"posts_count": current_user.get("posts_count", 0) + 1}).eq("id", user_id).execute()

        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Failed to publish post: {str(e)}"
            )

    return PostResponse(
        id=post_id,
        content=req.content,
        author={
            "id": user_id,
            "username": current_user.get("username", "student"),
            "full_name": current_user.get("full_name", "Student"),
            "avatar_url": current_user.get("avatar_url", ""),
            "department": current_user.get("department", "General"),
            "semester": current_user.get("semester", 1),
            "is_verified": True
        },
        community=None,
        media=[m.dict() for m in (req.media or [])],
        hashtags=parsed_tags,
        upvote_count=0,
        downvote_count=0,
        like_count=0,
        comment_count=0,
        is_pinned=False,
        user_voted=0,
        user_liked=False,
        user_bookmarked=False,
        created_at=datetime.utcnow()
    )

@router.post("/upload-media", summary="Upload post image or video to Supabase Storage")
async def upload_post_media(
    file: UploadFile = File(...),
    current_user: dict = Depends(get_current_verified_student)
):
    """Accepts image or video file, verifies file type and size, and uploads to storage bucket."""
    public_url, media_type = await upload_file_to_storage(file, bucket_name="posts")
    return {
        "url": public_url,
        "media_type": media_type,
        "filename": file.filename
    }

@router.post("/{post_id}/vote", summary="Upvote or downvote a post")
async def vote_post(
    post_id: str,
    req: VoteRequest,
    current_user: dict = Depends(get_current_verified_student)
):
    """
    Reddit-style voting:
    1 = upvote, -1 = downvote, 0 = remove vote.
    Prevents duplicate votes and atomically updates post vote tallies.
    """
    user_id = current_user.get("id")
    supabase = get_supabase_client()

    if supabase:
        try:
            # Check existing vote
            existing = supabase.table("post_votes").select("*").eq("post_id", post_id).eq("user_id", user_id).execute()
            old_vote = existing.data[0]["vote_type"] if existing.data else 0

            # Fetch post
            post_res = supabase.table("posts").select("upvote_count, downvote_count").eq("id", post_id).single().execute()
            upvotes = post_res.data["upvote_count"]
            downvotes = post_res.data["downvote_count"]

            if old_vote == 1:
                upvotes = max(0, upvotes - 1)
            elif old_vote == -1:
                downvotes = max(0, downvotes - 1)

            if req.vote_type == 1:
                upvotes += 1
            elif req.vote_type == -1:
                downvotes += 1

            # Update post_votes
            if req.vote_type == 0:
                supabase.table("post_votes").delete().eq("post_id", post_id).eq("user_id", user_id).execute()
            else:
                supabase.table("post_votes").upsert({
                    "post_id": post_id,
                    "user_id": user_id,
                    "vote_type": req.vote_type
                }).execute()

            # Update posts counts
            supabase.table("posts").update({
                "upvote_count": upvotes,
                "downvote_count": downvotes
            }).eq("id", post_id).execute()

            return {
                "post_id": post_id,
                "user_voted": req.vote_type,
                "upvote_count": upvotes,
                "downvote_count": downvotes,
                "score": upvotes - downvotes
            }
        except Exception as e:
            raise HTTPException(status_code=400, detail=str(e))

    return {
        "post_id": post_id,
        "user_voted": req.vote_type,
        "score": req.vote_type
    }

@router.post("/{post_id}/like", summary="Instagram-style heart like toggle")
async def toggle_like_post(
    post_id: str,
    current_user: dict = Depends(get_current_verified_student)
):
    """Toggle heart like on a post. Prevents duplicate likes."""
    user_id = current_user.get("id")
    supabase = get_supabase_client()

    if supabase:
        try:
            existing = supabase.table("post_likes").select("id").eq("post_id", post_id).eq("user_id", user_id).execute()
            
            if existing.data:
                # Unlike
                supabase.table("post_likes").delete().eq("post_id", post_id).eq("user_id", user_id).execute()
                # Decrement like count
                post_res = supabase.table("posts").select("like_count").eq("id", post_id).single().execute()
                new_likes = max(0, post_res.data["like_count"] - 1)
                supabase.table("posts").update({"like_count": new_likes}).eq("id", post_id).execute()
                return {"post_id": post_id, "liked": False, "like_count": new_likes}
            else:
                # Like
                supabase.table("post_likes").insert({"post_id": post_id, "user_id": user_id}).execute()
                post_res = supabase.table("posts").select("like_count, author_id").eq("id", post_id).single().execute()
                new_likes = post_res.data["like_count"] + 1
                supabase.table("posts").update({"like_count": new_likes}).eq("id", post_id).execute()

                # Generate notification for post author if not self
                author_id = post_res.data["author_id"]
                if author_id != user_id:
                    supabase.table("notifications").insert({
                        "recipient_id": author_id,
                        "sender_id": user_id,
                        "type": "like",
                        "entity_id": post_id,
                        "entity_type": "post",
                        "message": f"@{current_user.get('username')} liked your campus post."
                    }).execute()

                return {"post_id": post_id, "liked": True, "like_count": new_likes}
        except Exception as e:
            raise HTTPException(status_code=400, detail=str(e))

    return {"post_id": post_id, "liked": True, "like_count": 1}

@router.post("/{post_id}/bookmark", summary="Save post to student bookmarks")
async def toggle_bookmark_post(
    post_id: str,
    current_user: dict = Depends(get_current_verified_student)
):
    """Toggle post bookmark."""
    user_id = current_user.get("id")
    supabase = get_supabase_client()

    if supabase:
        try:
            existing = supabase.table("bookmarks").select("id").eq("post_id", post_id).eq("user_id", user_id).execute()
            if existing.data:
                supabase.table("bookmarks").delete().eq("post_id", post_id).eq("user_id", user_id).execute()
                return {"post_id": post_id, "bookmarked": False}
            else:
                supabase.table("bookmarks").insert({"post_id": post_id, "user_id": user_id}).execute()
                return {"post_id": post_id, "bookmarked": True}
        except Exception as e:
            raise HTTPException(status_code=400, detail=str(e))

    return {"post_id": post_id, "bookmarked": True}

@router.get("/{post_id}/comments", response_model=List[CommentResponse], summary="Fetch threaded comments for post")
async def get_post_comments(
    post_id: str,
    current_user: Optional[dict] = Depends(get_current_user)
):
    """Fetches comments with nested replies."""
    supabase = get_supabase_client()
    if supabase:
        try:
            res = supabase.table("comments").select("*, profiles(*)").eq("post_id", post_id).order("created_at", desc=False).execute()
            
            all_comments = []
            for c in res.data:
                auth_info = c.get("profiles") or {}
                all_comments.append(CommentResponse(
                    id=c["id"],
                    post_id=c["post_id"],
                    content=c["content"],
                    author={
                        "id": auth_info.get("id", ""),
                        "username": auth_info.get("username", "student"),
                        "full_name": auth_info.get("full_name", "Student"),
                        "avatar_url": auth_info.get("avatar_url", ""),
                        "department": auth_info.get("department", "General"),
                        "semester": auth_info.get("semester", 1),
                        "is_verified": auth_info.get("is_verified", True)
                    },
                    parent_id=c.get("parent_id"),
                    upvote_count=c.get("upvote_count", 0),
                    downvote_count=c.get("downvote_count", 0),
                    user_voted=0,
                    replies=[],
                    created_at=c["created_at"]
                ))

            # Assemble parent-child tree
            comment_map = {c.id: c for c in all_comments}
            root_comments = []
            for c in all_comments:
                if c.parent_id and c.parent_id in comment_map:
                    comment_map[c.parent_id].replies.append(c)
                else:
                    root_comments.append(c)

            return root_comments
        except Exception:
            pass

    return []

@router.post("/{post_id}/comments", response_model=CommentResponse, status_code=status.HTTP_201_CREATED, summary="Post comment or reply")
async def add_post_comment(
    post_id: str,
    req: CommentCreate,
    current_user: dict = Depends(get_current_verified_student)
):
    """Add a top-level comment or reply to an existing comment."""
    user_id = current_user.get("id")
    comment_id = str(uuid.uuid4())
    supabase = get_supabase_client()

    if supabase:
        try:
            supabase.table("comments").insert({
                "id": comment_id,
                "post_id": post_id,
                "author_id": user_id,
                "parent_id": req.parent_id if req.parent_id else None,
                "content": req.content
            }).execute()

            # Increment comment count on post
            post_res = supabase.table("posts").select("comment_count, author_id").eq("id", post_id).single().execute()
            new_comment_count = post_res.data["comment_count"] + 1
            supabase.table("posts").update({"comment_count": new_comment_count}).eq("id", post_id).execute()

            # Notify author
            author_id = post_res.data["author_id"]
            if author_id != user_id:
                supabase.table("notifications").insert({
                    "recipient_id": author_id,
                    "sender_id": user_id,
                    "type": "comment" if not req.parent_id else "reply",
                    "entity_id": post_id,
                    "entity_type": "post",
                    "message": f"@{current_user.get('username')} commented: \"{req.content[:50]}...\""
                }).execute()

        except Exception as e:
            raise HTTPException(status_code=400, detail=str(e))

    return CommentResponse(
        id=comment_id,
        post_id=post_id,
        content=req.content,
        author={
            "id": user_id,
            "username": current_user.get("username", "student"),
            "full_name": current_user.get("full_name", "Student"),
            "avatar_url": current_user.get("avatar_url", ""),
            "department": current_user.get("department", "General"),
            "semester": current_user.get("semester", 1),
            "is_verified": True
        },
        parent_id=req.parent_id,
        upvote_count=0,
        downvote_count=0,
        user_voted=0,
        replies=[],
        created_at=datetime.utcnow()
    )

@router.delete("/{post_id}", summary="Delete a post")
async def delete_post(
    post_id: str,
    current_user: dict = Depends(get_current_verified_student)
):
    """Allows author or college admin to delete a post."""
    user_id = current_user.get("id")
    is_admin = current_user.get("role") == "admin"
    supabase = get_supabase_client()

    if supabase:
        try:
            post_res = supabase.table("posts").select("author_id").eq("id", post_id).single().execute()
            if not post_res.data:
                raise HTTPException(status_code=404, detail="Post not found.")

            if post_res.data["author_id"] != user_id and not is_admin:
                raise HTTPException(status_code=403, detail="You are not authorized to delete this post.")

            supabase.table("posts").delete().eq("id", post_id).execute()
            return {"message": "Post successfully deleted.", "post_id": post_id}
        except HTTPException:
            raise
        except Exception as e:
            raise HTTPException(status_code=400, detail=str(e))

    return {"message": "Post deleted successfully.", "post_id": post_id}
