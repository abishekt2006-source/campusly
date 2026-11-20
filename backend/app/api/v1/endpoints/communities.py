from typing import List, Optional
import uuid
from datetime import datetime
from fastapi import APIRouter, HTTPException, status, Depends, Query
from app.schemas.community import CommunityCreate, CommunityResponse, CommunityMemberResponse
from app.schemas.post import PostResponse
from app.api.deps import get_current_user, get_current_verified_student
from app.database.supabase import get_supabase_client

router = APIRouter()

# Fallback in-memory list for initial dev/seeding
_DEFAULT_COMMUNITIES = [
    {
        "id": "c_cs",
        "name": "Computer Science Department",
        "slug": "cs-dept",
        "description": "Official and student discussion hub for CS & IT engineering students. Share notes, project ideas, hackathons, and lab announcements.",
        "rules": "1. Respect batchmates.\n2. No plagiarized code.\n3. Keep discussions academic & tech-oriented.",
        "avatar_url": "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=300",
        "cover_url": "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=1200",
        "members_count": 1240,
        "posts_count": 184,
        "is_private": False,
        "created_at": datetime.utcnow()
    },
    {
        "id": "c_coding",
        "name": "Coding & Open Source Club",
        "slug": "coding-club",
        "description": "DSA, competitive programming, Open Source contributions, and campus Hackathon teams.",
        "rules": "1. Post problem links with doubts.\n2. Help juniors.\n3. Promote open-source culture.",
        "avatar_url": "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=300",
        "cover_url": "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=1200",
        "members_count": 890,
        "posts_count": 112,
        "is_private": False,
        "created_at": datetime.utcnow()
    },
    {
        "id": "c_photo",
        "name": "Campus Photography Club",
        "slug": "shutterbugs",
        "description": "Capture campus sunsets, college fest highlights, architecture, and student life.",
        "rules": "1. Credit the photographer.\n2. No unauthorized personal portraits.\n3. High-res uploads encouraged.",
        "avatar_url": "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=300",
        "cover_url": "https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?w=1200",
        "members_count": 640,
        "posts_count": 96,
        "is_private": False,
        "created_at": datetime.utcnow()
    },
    {
        "id": "c_memes",
        "name": "Campus Memes & Banter",
        "slug": "campus-memes",
        "description": "Relatable exam stress memes, canteen chronicles, and professor anecdotes (in good humor).",
        "rules": "1. No malicious targeting or harassment.\n2. Keep it light-hearted.\n3. Protect privacy.",
        "avatar_url": "https://images.unsplash.com/photo-1531259683007-016a7b628fc3?w=300",
        "cover_url": "https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=1200",
        "members_count": 2400,
        "posts_count": 420,
        "is_private": False,
        "created_at": datetime.utcnow()
    },
    {
        "id": "c_fests",
        "name": "Campus Events & Fest Hub",
        "slug": "college-fests",
        "description": "Annual cultural fest, tech symposiums, sports tournaments, and club recruitment schedules.",
        "rules": "1. Include date, time, and venue.\n2. Official posters must be readable.",
        "avatar_url": "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=300",
        "cover_url": "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=1200",
        "members_count": 1820,
        "posts_count": 78,
        "is_private": False,
        "created_at": datetime.utcnow()
    },
    {
        "id": "c_confess",
        "name": "Anonymous Confessions",
        "slug": "campus-confessions",
        "description": "Speak your mind, share wholesome crushes, campus thoughts, and college nostalgia anonymously.",
        "rules": "1. Zero tolerance for hate speech or naming individuals.\n2. Reviewed by community moderators.",
        "avatar_url": "https://images.unsplash.com/photo-1513151233558-d860c5398176?w=300",
        "cover_url": "https://images.unsplash.com/photo-1508739773434-c26b3d09e071?w=1200",
        "members_count": 3100,
        "posts_count": 650,
        "is_private": False,
        "created_at": datetime.utcnow()
    }
]

@router.get("", response_model=List[CommunityResponse], summary="List all campus communities")
async def list_communities(
    q: Optional[str] = None,
    trending: bool = False,
    current_user: Optional[dict] = Depends(get_current_user)
):
    """Lists communities with search query and member status."""
    user_id = current_user.get("id") if current_user else None
    supabase = get_supabase_client()

    if supabase:
        try:
            query = supabase.table("communities").select("*, profiles!communities_creator_id_fkey(*)")
            if q:
                query = query.ilike("name", f"%{q}%")
            if trending:
                query = query.order("members_count", desc=True)
            else:
                query = query.order("name", desc=False)

            res = query.execute()

            # Check joined communities
            joined_dict = {}
            if user_id:
                m_res = supabase.table("community_members").select("community_id, role").eq("user_id", user_id).execute()
                joined_dict = {m["community_id"]: m["role"] for m in m_res.data}

            results = []
            for item in res.data:
                comm_id = item["id"]
                creator = item.get("profiles") or {}
                results.append(CommunityResponse(
                    id=comm_id,
                    name=item["name"],
                    slug=item["slug"],
                    description=item["description"],
                    rules=item.get("rules", ""),
                    avatar_url=item.get("avatar_url", ""),
                    cover_url=item.get("cover_url", ""),
                    creator={
                        "id": creator.get("id", ""),
                        "username": creator.get("username", "admin"),
                        "full_name": creator.get("full_name", "Campus Staff"),
                        "avatar_url": creator.get("avatar_url", ""),
                        "department": creator.get("department", "Administration"),
                        "semester": 1,
                        "is_verified": True
                    } if creator else None,
                    members_count=item.get("members_count", 1),
                    posts_count=item.get("posts_count", 0),
                    is_private=item.get("is_private", False),
                    is_member=comm_id in joined_dict,
                    user_role=joined_dict.get(comm_id),
                    created_at=item["created_at"],
                    updated_at=item.get("updated_at")
                ))

            return results
        except Exception as e:
            pass

    # Development simulation fallback
    filtered = _DEFAULT_COMMUNITIES
    if q:
        filtered = [c for c in _DEFAULT_COMMUNITIES if q.lower() in c["name"].lower() or q.lower() in c["slug"].lower()]
    return [CommunityResponse(**c, is_member=False) for c in filtered]

@router.post("", response_model=CommunityResponse, status_code=status.HTTP_201_CREATED, summary="Create a new community")
async def create_community(
    req: CommunityCreate,
    current_user: dict = Depends(get_current_verified_student)
):
    """
    Creates a new community.
    Creator automatically becomes the community moderator/admin.
    """
    user_id = current_user.get("id")
    comm_id = str(uuid.uuid4())
    supabase = get_supabase_client()

    clean_slug = req.slug.strip().lower()

    if supabase:
        try:
            # Check unique slug
            exist = supabase.table("communities").select("id").eq("slug", clean_slug).execute()
            if exist.data and len(exist.data) > 0:
                raise HTTPException(status_code=400, detail=f"Community with slug 'c/{clean_slug}' already exists.")

            comm_data = {
                "id": comm_id,
                "name": req.name,
                "slug": clean_slug,
                "description": req.description,
                "rules": req.rules or "",
                "avatar_url": req.avatar_url or "",
                "cover_url": req.cover_url or "",
                "creator_id": user_id,
                "members_count": 1,
                "posts_count": 0,
                "is_private": req.is_private or False
            }
            supabase.table("communities").insert(comm_data).execute()

            # Creator joins as admin/moderator
            supabase.table("community_members").insert({
                "community_id": comm_id,
                "user_id": user_id,
                "role": "admin"
            }).execute()

        except HTTPException:
            raise
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Failed to create community: {str(e)}")

    return CommunityResponse(
        id=comm_id,
        name=req.name,
        slug=clean_slug,
        description=req.description,
        rules=req.rules or "",
        avatar_url=req.avatar_url or "",
        cover_url=req.cover_url or "",
        creator={
            "id": user_id,
            "username": current_user.get("username", "student"),
            "full_name": current_user.get("full_name", "Student"),
            "avatar_url": current_user.get("avatar_url", ""),
            "department": current_user.get("department", "General"),
            "semester": current_user.get("semester", 1),
            "is_verified": True
        },
        members_count=1,
        posts_count=0,
        is_member=True,
        user_role="admin",
        created_at=datetime.utcnow()
    )

@router.get("/{slug}", response_model=CommunityResponse, summary="Get community details by slug")
async def get_community_by_slug(
    slug: str,
    current_user: Optional[dict] = Depends(get_current_user)
):
    """Retrieve details for a specific community."""
    user_id = current_user.get("id") if current_user else None
    supabase = get_supabase_client()

    if supabase:
        try:
            res = supabase.table("communities").select(
                "*, profiles!communities_creator_id_fkey(*)"
            ).eq("slug", slug.lower()).single().execute()

            if not res.data:
                raise HTTPException(status_code=404, detail=f"Community 'c/{slug}' not found.")

            comm = res.data
            comm_id = comm["id"]

            is_member = False
            user_role = None
            if user_id:
                m_res = supabase.table("community_members").select("role").eq("community_id", comm_id).eq("user_id", user_id).execute()
                if m_res.data:
                    is_member = True
                    user_role = m_res.data[0]["role"]

            creator = comm.get("profiles") or {}
            return CommunityResponse(
                id=comm_id,
                name=comm["name"],
                slug=comm["slug"],
                description=comm["description"],
                rules=comm.get("rules", ""),
                avatar_url=comm.get("avatar_url", ""),
                cover_url=comm.get("cover_url", ""),
                creator={
                    "id": creator.get("id", ""),
                    "username": creator.get("username", "creator"),
                    "full_name": creator.get("full_name", "Creator"),
                    "avatar_url": creator.get("avatar_url", ""),
                    "department": creator.get("department", "General"),
                    "semester": 1,
                    "is_verified": True
                } if creator else None,
                members_count=comm.get("members_count", 1),
                posts_count=comm.get("posts_count", 0),
                is_private=comm.get("is_private", False),
                is_member=is_member,
                user_role=user_role,
                created_at=comm["created_at"],
                updated_at=comm.get("updated_at")
            )
        except HTTPException:
            raise
        except Exception:
            pass

    # Simulation fallback
    for c in _DEFAULT_COMMUNITIES:
        if c["slug"] == slug.lower():
            return CommunityResponse(**c, is_member=False)

    raise HTTPException(status_code=404, detail=f"Community 'c/{slug}' not found.")

@router.post("/{slug}/join", summary="Join a community")
async def join_community(
    slug: str,
    current_user: dict = Depends(get_current_verified_student)
):
    """Enrolls the student in this community."""
    user_id = current_user.get("id")
    supabase = get_supabase_client()

    if supabase:
        try:
            comm_res = supabase.table("communities").select("id, members_count").eq("slug", slug.lower()).single().execute()
            if not comm_res.data:
                raise HTTPException(status_code=404, detail="Community not found.")

            comm_id = comm_res.data["id"]

            # Add to community_members
            supabase.table("community_members").upsert({
                "community_id": comm_id,
                "user_id": user_id,
                "role": "member"
            }, on_conflict="community_id, user_id").execute()

            # Increment members_count
            new_count = comm_res.data["members_count"] + 1
            supabase.table("communities").update({"members_count": new_count}).eq("id", comm_id).execute()

            return {"status": "joined", "community": slug, "members_count": new_count}
        except Exception as e:
            raise HTTPException(status_code=400, detail=str(e))

    return {"status": "joined", "community": slug}

@router.post("/{slug}/leave", summary="Leave a community")
async def leave_community(
    slug: str,
    current_user: dict = Depends(get_current_verified_student)
):
    """Unenrolls the student from this community."""
    user_id = current_user.get("id")
    supabase = get_supabase_client()

    if supabase:
        try:
            comm_res = supabase.table("communities").select("id, members_count").eq("slug", slug.lower()).single().execute()
            if not comm_res.data:
                raise HTTPException(status_code=404, detail="Community not found.")

            comm_id = comm_res.data["id"]

            # Remove from community_members
            supabase.table("community_members").delete().eq("community_id", comm_id).eq("user_id", user_id).execute()

            # Decrement members_count
            new_count = max(0, comm_res.data["members_count"] - 1)
            supabase.table("communities").update({"members_count": new_count}).eq("id", comm_id).execute()

            return {"status": "left", "community": slug, "members_count": new_count}
        except Exception as e:
            raise HTTPException(status_code=400, detail=str(e))

    return {"status": "left", "community": slug}
