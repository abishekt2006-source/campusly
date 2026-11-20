# 📖 CAMPUSLY BACKEND REST API DOCUMENTATION

This document provides complete documentation for the Campusly FastAPI REST API.

---

## 🌐 Base URL & Interactive Docs
- **Local Development Base URL**: `http://127.0.0.1:8000/api/v1`
- **Interactive Swagger UI**: `http://127.0.0.1:8000/docs`
- **ReDoc Documentation**: `http://127.0.0.1:8000/redoc`

---

## 🔒 Authentication Flow
Campusly uses standard **OAuth2 HTTP Bearer Tokens**.
When a student logs in or registers, the server responds with a signed JWT `access_token`.
Include this token in the `Authorization` header for all protected endpoints:
```http
Authorization: Bearer <your_access_token>
```

---

## 📌 API Endpoints Overview

### 1. System Health
- `GET /`: Returns API service metadata and current status.
- `GET /health`: Liveness probe for Vercel and container orchestration.

### 2. Authentication & Verification (`/api/v1/auth`)
- `GET /api/v1/auth/verify-domain?email={email}`: Pre-check if email domain matches college.
- `POST /api/v1/auth/register`: Register verified student.
- `POST /api/v1/auth/login`: Authenticate student and issue JWT Bearer token.
- `GET /api/v1/auth/me`: Get current authenticated student profile.
- `POST /api/v1/auth/reset-password`: Dispatch password recovery link.

### 3. Student Profiles (`/api/v1/users`)
- `GET /api/v1/users/{username}`: Public student profile with follower stats and department details.
- `PATCH /api/v1/users/me`: Update profile details (bio, avatar, cover photo, semester).
- `POST /api/v1/users/{username}/follow`: Follow/unfollow toggle with database count updates.
- `GET /api/v1/users/{username}/posts`: Posts authored by specific student.
- `GET /api/v1/users/me/bookmarks`: Private saved posts for the current student.

### 4. Feed, Posts & Voting (`/api/v1/posts`)
- `GET /api/v1/posts?category=trending|latest|popular|following`: Campus feed with pagination.
- `POST /api/v1/posts`: Create a new post with text, media, and hashtags.
- `POST /api/v1/posts/upload-media`: Upload image or video to Supabase Storage.
- `POST /api/v1/posts/{post_id}/vote`: Upvote (+1) or downvote (-1) Reddit-style.
- `POST /api/v1/posts/{post_id}/like`: Heart like toggle.
- `POST /api/v1/posts/{post_id}/bookmark`: Bookmark toggle.
- `GET /api/v1/posts/{post_id}/comments`: Threaded nested comments tree.
- `POST /api/v1/posts/{post_id}/comments`: Post comment or reply.
- `DELETE /api/v1/posts/{post_id}`: Delete post (author or admin only).

### 5. Campus Stories (`/api/v1/stories`)
- `GET /api/v1/stories`: Active stories grouped by student (excludes expired >24h).
- `POST /api/v1/stories`: Publish 24h photo or video story.
- `POST /api/v1/stories/upload-media`: Upload media to `stories` bucket.
- `POST /api/v1/stories/{story_id}/view`: Record a view by student.
- `GET /api/v1/stories/{story_id}/viewers`: Viewers roster (author or admin only).
- `DELETE /api/v1/stories/{story_id}`: Delete active story.

### 6. Sub-Campus Communities (`/api/v1/communities`)
- `GET /api/v1/communities`: List communities with search filter.
- `POST /api/v1/communities`: Create community (creator assigned as admin/mod).
- `GET /api/v1/communities/{slug}`: Community details, rules, and member status.
- `POST /api/v1/communities/{slug}/join`: Join community.
- `POST /api/v1/communities/{slug}/leave`: Leave community.

### 7. Campus Notifications (`/api/v1/notifications`)
- `GET /api/v1/notifications`: In-app notification alerts for likes, replies, follows, tags.
- `PATCH /api/v1/notifications/{id}/read`: Mark notification as read.
- `POST /api/v1/notifications/read-all`: Mark all notifications as read.

### 8. Global Search (`/api/v1/search`)
- `GET /api/v1/search?q={query}&type=all|students|communities|posts|hashtags`: Unified search across campus entities.

### 9. Content Reporting & Safety (`/api/v1/reports`)
- `POST /api/v1/reports`: Flag inappropriate content or user for moderator review.

### 10. College Administration & Moderation (`/api/v1/admin`)
- `GET /api/v1/admin/stats`: Total counts of students, posts, communities, stories, and pending reports.
- `GET /api/v1/admin/users`: List enrolled students with verification and ban status.
- `POST /api/v1/admin/users/{user_id}/action`: Moderate user account (`verify`, `reject`, `ban`, `unban`).
- `GET /api/v1/admin/reports`: Content moderation queue.
- `POST /api/v1/admin/reports/{report_id}/action`: Resolve report (`dismiss` or `action_taken` deleting target content).
