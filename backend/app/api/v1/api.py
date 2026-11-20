from fastapi import APIRouter
from app.api.v1.endpoints import auth, users, posts, stories, communities, notifications, search, reports, admin

api_router = APIRouter()

api_router.include_router(auth.router, prefix="/auth", tags=["Authentication & Student Verification"])
api_router.include_router(users.router, prefix="/users", tags=["Student Profiles"])
api_router.include_router(posts.router, prefix="/posts", tags=["Home Feed, Posts & Voting"])
api_router.include_router(stories.router, prefix="/stories", tags=["Campus Stories (Snapchat-style 24h)"])
api_router.include_router(communities.router, prefix="/communities", tags=["Campus Communities & Clubs"])
api_router.include_router(notifications.router, prefix="/notifications", tags=["Campus Notifications"])
api_router.include_router(search.router, prefix="/search", tags=["Global Campus Search"])
api_router.include_router(reports.router, prefix="/reports", tags=["Content Reporting & Safety"])
api_router.include_router(admin.router, prefix="/admin", tags=["College Administration & Moderation"])
