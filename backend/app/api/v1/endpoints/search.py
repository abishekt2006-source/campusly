from typing import Optional, List, Dict, Any
from fastapi import APIRouter, Query, Depends
from app.api.deps import get_current_user
from app.database.supabase import get_supabase_client

router = APIRouter()

@router.get("", summary="Global campus search")
async def global_search(
    q: str = Query(..., min_length=1),
    type: str = Query("all", pattern="^(all|students|communities|posts|hashtags)$"),
    current_user: Optional[dict] = Depends(get_current_user)
):
    """
    Search across verified students, communities, post content, and hashtags.
    """
    clean_q = q.strip().lstrip("#")
    supabase = get_supabase_client()

    results: Dict[str, Any] = {
        "query": q,
        "students": [],
        "communities": [],
        "posts": [],
        "hashtags": []
    }

    if supabase:
        try:
            # 1. Search students
            if type in ("all", "students"):
                s_res = supabase.table("profiles").select(
                    "id, username, full_name, avatar_url, department, semester, is_verified"
                ).or_(f"username.ilike.%{clean_q}%,full_name.ilike.%{clean_q}%,department.ilike.%{clean_q}%").limit(10).execute()
                results["students"] = s_res.data or []

            # 2. Search communities
            if type in ("all", "communities"):
                c_res = supabase.table("communities").select(
                    "id, name, slug, description, avatar_url, members_count"
                ).or_(f"name.ilike.%{clean_q}%,slug.ilike.%{clean_q}%").limit(10).execute()
                results["communities"] = c_res.data or []

            # 3. Search posts
            if type in ("all", "posts"):
                p_res = supabase.table("posts").select(
                    "id, content, created_at, upvote_count, like_count, comment_count, profiles(*), communities(*)"
                ).ilike("content", f"%{clean_q}%").limit(10).execute()
                results["posts"] = p_res.data or []

            # 4. Search hashtags
            if type in ("all", "hashtags"):
                h_res = supabase.table("hashtags").select("id, tag, post_count").ilike("tag", f"%{clean_q}%").limit(10).execute()
                results["hashtags"] = h_res.data or []

            return results
        except Exception:
            pass

    # Simulation fallback
    return {
        "query": q,
        "students": [
            {
                "id": "u1",
                "username": "priya_cs",
                "full_name": "Priya Sharma",
                "avatar_url": "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120",
                "department": "Computer Science",
                "semester": 6,
                "is_verified": True
            },
            {
                "id": "u2",
                "username": "rohan_clicks",
                "full_name": "Rohan Verma",
                "avatar_url": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120",
                "department": "Electronics (ECE)",
                "semester": 4,
                "is_verified": True
            }
        ] if type in ("all", "students") else [],
        "communities": [
            {
                "id": "c1",
                "name": "Coding & Open Source Club",
                "slug": "coding-club",
                "description": "DSA, competitive programming, and campus Hackathon teams.",
                "avatar_url": "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=300",
                "members_count": 890
            }
        ] if type in ("all", "communities") else [],
        "posts": [],
        "hashtags": [
            {"id": "h1", "tag": "TechFest2026", "post_count": 142},
            {"id": "h2", "tag": "CampusLife", "post_count": 89}
        ] if type in ("all", "hashtags") else []
    }
