# 🎓 CAMPUSLY – College-Exclusive Social Networking Platform

Campusly is a high-performance, modern, college-exclusive social networking platform blending the best of **Reddit** (communities, upvotes/downvotes, threaded discussions), **Snapchat Stories** (24-hour self-expiring photo/video stories, progress indicators, viewer counters), and **Instagram** (curated media feed, profiles, likes, hashtags).

---

## 🏛 System Architecture

Campusly is architected as a decoupled, production-ready, cloud-native full-stack application:

```
┌────────────────────────────────────────────────────────┐
│                   CLIENT LAYER                         │
│   React (Vite) + Tailwind CSS + Lucide Icons           │
│   Hosted on Netlify (Edge CDN, SSL, Global Distribution│
└───────────────▲────────────────────────▲───────────────┘
                │ REST API               │ Supabase Realtime & Auth
                ▼                        ▼
┌───────────────────────────┐    ┌───────────────────────────┐
│       BACKEND LAYER       │    │     DATA & MEDIA LAYER    │
│  Python 3.11+ / FastAPI   │───▶│   Supabase (PostgreSQL)   │
│  Pydantic + SQLAlchemy    │    │   - 18 Relational Tables  │
│  Hosted on Vercel Functions│    │   - Row Level Security    │
└───────────────────────────┘    │   - Storage (Avatars/Posts│
                                 │     Stories/Communities)  │
                                 └───────────────────────────┘
```

### 1. Communication Flow
1. **Student Browsing & Actions**: The React client communicates with the FastAPI REST API via Axios/Fetch with standard JWT Bearer tokens issued upon verified college student login.
2. **Media Storage**: Media files (photos, post carousels, videos, stories) are uploaded directly to Supabase Storage with strict size limits, MIME validation, and signed/public URLs.
3. **Realtime Updates**: Notifications, live upvote counters, and chat/comments leverage Supabase Realtime channels directly in the browser when active.
4. **Vercel Serverless Compatibility**: The backend is organized to execute seamlessly as stateless Vercel Python serverless handlers without memory leaks or long-running daemon dependencies. 24-hour story expiration is enforced automatically at the PostgreSQL database level using views and database triggers (`WHERE expires_at > NOW() AND is_deleted = FALSE`).

---

## 🗄 Database Design (Supabase PostgreSQL)

The database schema (`supabase/migrations/001_initial_schema.sql`) contains 18 normalized tables:

| Table | Purpose | Key Relationships |
| :--- | :--- | :--- |
| `profiles` | Extended student profile (dept, semester, bio, verification) | Primary key = `auth.users(id)` |
| `posts` | Main feed posts (text, media, polls) | Belongs to `profiles`, optional `communities` |
| `post_media` | Ordered carousel photos and short videos | Cascades from `posts` |
| `comments` | Threaded discussions with nesting support | Cascades from `posts`, self-referencing `parent_id` |
| `post_likes` | Instagram-style heart likes (prevents duplicates) | Compound unique `(post_id, user_id)` |
| `post_votes` | Reddit-style upvotes (+1) & downvotes (-1) | Compound unique `(post_id, user_id)` |
| `comment_votes`| Comment upvotes & downvotes | Compound unique `(comment_id, user_id)` |
| `stories` | 24-hour self-expiring photo/video stories | Belongs to `profiles`, indexed on `expires_at` |
| `story_views` | Who watched whose story & view counter | Compound unique `(story_id, viewer_id)` |
| `communities` | Sub-campus spaces (Clubs, Departments, Confessions)| Managed by moderators & admins |
| `community_members`| Member roster with roles (`member`, `moderator`, `admin`)| Unique `(community_id, user_id)` |
| `follows` | Student follow graph | Unique `(follower_id, following_id)` |
| `bookmarks` | Saved posts for future study or viewing | Unique `(user_id, post_id)` |
| `notifications` | Real-time alerts for likes, replies, follows, tags | Belongs to recipient, links to entities |
| `reports` | Student moderation flags for bad content | Monitored in Admin Dashboard |
| `hashtags` | Trending campus tags (`#TechFest2026`, etc.) | Unique tag name with auto-counter |
| `post_hashtags`| Many-to-many link between posts & hashtags | Primary key `(post_id, hashtag_id)` |

---

## 📁 Project Directory Structure

```
campusly/
├── .gitignore
├── README.md
├── backend/
│   ├── .env.example
│   ├── requirements.txt
│   ├── vercel.json
│   └── app/
│       ├── __init__.py
│       ├── main.py
│       ├── api/
│       │   └── v1/
│       │       ├── api.py
│       │       └── endpoints/
│       │           ├── auth.py
│       │           ├── users.py
│       │           ├── posts.py
│       │           ├── stories.py
│       │           ├── communities.py
│       │           ├── notifications.py
│       │           └── admin.py
│       ├── core/
│       │   ├── config.py
│       │   └── security.py
│       ├── database/
│       │   ├── session.py
│       │   └── supabase.py
│       ├── models/
│       ├── schemas/
│       └── services/
├── frontend/
│   ├── .env.example
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── index.html
│   └── src/
│       ├── App.jsx
│       ├── main.jsx
│       ├── components/
│       │   ├── common/
│       │   ├── feed/
│       │   ├── stories/
│       │   └── layout/
│       ├── pages/
│       ├── context/
│       ├── hooks/
│       └── services/
└── supabase/
    ├── migrations/
    │   └── 001_initial_schema.sql
    └── seed.sql
```

---

## 🚦 10-Phase Implementation Roadmap

- [x] **Phase 1: Project Architecture, Database Design, & Setup** (Completed)
- [x] **Phase 2: Frontend Foundation & Design System** (Completed)
- [x] **Phase 3: FastAPI Backend & Supabase Auth Integration** (Completed)
- [x] **Phase 4: Home Feed, Post Creation, Media Uploads & Voting** (Completed)
- [x] **Phase 5: Snapchat-Style 24h Expiring Stories System** (Completed)
- [x] **Phase 6: Campus Communities & Student Profiles** (Completed)
- [x] **Phase 7: Realtime Notifications, Search & Explore** (Completed)
- [x] **Phase 8: Admin Dashboard, Content Moderation & Security Guardrails** (Completed)
- [x] **Phase 9: End-to-End Testing & Performance Polish** (Completed)
- [ ] **Phase 10: Production Deployment (Vercel Backend, Netlify Frontend, Supabase DB)**
- [ ] **Phase 7: Realtime Notifications, Search & Explore**
- [ ] **Phase 8: Admin Dashboard, Content Moderation & Security Guardrails**
- [ ] **Phase 9: End-to-End Testing & Performance Polish**
- [ ] **Phase 10: Production Deployment (Vercel Backend, Netlify Frontend, Supabase DB)**
