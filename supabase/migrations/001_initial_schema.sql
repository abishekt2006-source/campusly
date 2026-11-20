-- ==============================================================================
-- CAMPUSLY: COLLEGE EXCLUSIVE SOCIAL NETWORKING PLATFORM
-- INITIAL DATABASE SCHEMA MIGRATION (001_initial_schema.sql)
-- Target: Supabase PostgreSQL (Supports RLS, UUIDs, Triggers, Storage)
-- ==============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. ENUM TYPES
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('student', 'moderator', 'admin');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE media_type AS ENUM ('image', 'video');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE community_role AS ENUM ('member', 'moderator', 'admin');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE report_status AS ENUM ('pending', 'reviewed', 'dismissed', 'action_taken');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE report_target_type AS ENUM ('post', 'comment', 'story', 'user', 'community');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE notification_type AS ENUM ('like', 'comment', 'reply', 'follow', 'mention', 'community_announcement');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- ==============================================================================
-- 3. CORE TABLES
-- ==============================================================================

-- 3.1 PROFILES TABLE (Linked with Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    username VARCHAR(30) UNIQUE NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    department VARCHAR(100) NOT NULL,
    semester INT CHECK (semester >= 1 AND semester <= 12),
    bio TEXT DEFAULT '',
    avatar_url TEXT DEFAULT '',
    cover_url TEXT DEFAULT '',
    role user_role DEFAULT 'student',
    is_verified BOOLEAN DEFAULT FALSE,
    is_banned BOOLEAN DEFAULT FALSE,
    followers_count INT DEFAULT 0 CHECK (followers_count >= 0),
    following_count INT DEFAULT 0 CHECK (following_count >= 0),
    posts_count INT DEFAULT 0 CHECK (posts_count >= 0),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for searching profiles and filtering by department
CREATE INDEX IF NOT EXISTS idx_profiles_username ON public.profiles(username);
CREATE INDEX IF NOT EXISTS idx_profiles_department ON public.profiles(department);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);

-- 3.2 COMMUNITIES TABLE (Reddit-style sub-campus spaces)
CREATE TABLE IF NOT EXISTS public.communities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(80) NOT NULL,
    slug VARCHAR(80) UNIQUE NOT NULL,
    description TEXT NOT NULL,
    rules TEXT DEFAULT '',
    avatar_url TEXT DEFAULT '',
    cover_url TEXT DEFAULT '',
    creator_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    members_count INT DEFAULT 1 CHECK (members_count >= 0),
    posts_count INT DEFAULT 0 CHECK (posts_count >= 0),
    is_private BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_communities_slug ON public.communities(slug);
CREATE INDEX IF NOT EXISTS idx_communities_members_count ON public.communities(members_count DESC);

-- 3.3 COMMUNITY MEMBERS TABLE
CREATE TABLE IF NOT EXISTS public.community_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    community_id UUID NOT NULL REFERENCES public.communities(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    role community_role DEFAULT 'member',
    joined_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT unique_community_member UNIQUE (community_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_community_members_comm ON public.community_members(community_id);
CREATE INDEX IF NOT EXISTS idx_community_members_user ON public.community_members(user_id);

-- 3.4 POSTS TABLE (Instagram & Reddit hybrid feed)
CREATE TABLE IF NOT EXISTS public.posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    author_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    community_id UUID REFERENCES public.communities(id) ON DELETE SET NULL,
    content TEXT NOT NULL,
    upvote_count INT DEFAULT 0,
    downvote_count INT DEFAULT 0,
    like_count INT DEFAULT 0 CHECK (like_count >= 0),
    comment_count INT DEFAULT 0 CHECK (comment_count >= 0),
    is_pinned BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_posts_author ON public.posts(author_id);
CREATE INDEX IF NOT EXISTS idx_posts_community ON public.posts(community_id);
CREATE INDEX IF NOT EXISTS idx_posts_created_at ON public.posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_posts_trending ON public.posts((upvote_count - downvote_count) DESC, created_at DESC);

-- 3.5 POST MEDIA TABLE (Images & Videos support)
CREATE TABLE IF NOT EXISTS public.post_media (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
    media_url TEXT NOT NULL,
    media_type media_type NOT NULL,
    aspect_ratio VARCHAR(10) DEFAULT '1:1',
    order_index INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_post_media_post ON public.post_media(post_id, order_index);

-- 3.6 COMMENTS TABLE (Reddit-style nested comment threads)
CREATE TABLE IF NOT EXISTS public.comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
    author_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    parent_id UUID REFERENCES public.comments(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    upvote_count INT DEFAULT 0,
    downvote_count INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_comments_post ON public.comments(post_id);
CREATE INDEX IF NOT EXISTS idx_comments_parent ON public.comments(parent_id);

-- 3.7 POST LIKES & VOTES (Instagram likes + Reddit upvotes/downvotes)
CREATE TABLE IF NOT EXISTS public.post_likes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT unique_post_like UNIQUE (post_id, user_id)
);

CREATE TABLE IF NOT EXISTS public.post_votes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    vote_type SMALLINT NOT NULL CHECK (vote_type IN (-1, 1)),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT unique_post_vote UNIQUE (post_id, user_id)
);

CREATE TABLE IF NOT EXISTS public.comment_votes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    comment_id UUID NOT NULL REFERENCES public.comments(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    vote_type SMALLINT NOT NULL CHECK (vote_type IN (-1, 1)),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT unique_comment_vote UNIQUE (comment_id, user_id)
);

-- 3.8 STORIES TABLE (Snapchat-style 24-hour expiring media)
CREATE TABLE IF NOT EXISTS public.stories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    author_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    media_url TEXT NOT NULL,
    media_type media_type NOT NULL,
    caption VARCHAR(255) DEFAULT '',
    duration INT DEFAULT 5 CHECK (duration >= 3 AND duration <= 30),
    expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '24 hours'),
    is_deleted BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_stories_author ON public.stories(author_id);
CREATE INDEX IF NOT EXISTS idx_stories_active ON public.stories(expires_at, is_deleted);

-- 3.9 STORY VIEWS (Track who viewed whose story)
CREATE TABLE IF NOT EXISTS public.story_views (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    story_id UUID NOT NULL REFERENCES public.stories(id) ON DELETE CASCADE,
    viewer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    viewed_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT unique_story_view UNIQUE (story_id, viewer_id)
);

CREATE INDEX IF NOT EXISTS idx_story_views_story ON public.story_views(story_id);

-- VIEW: Active Stories (Ensures expired stories are automatically excluded)
CREATE OR REPLACE VIEW public.active_stories AS
SELECT s.*, p.username, p.full_name, p.avatar_url, p.department
FROM public.stories s
JOIN public.profiles p ON s.author_id = p.id
WHERE s.expires_at > NOW() AND s.is_deleted = FALSE;

-- 3.10 FOLLOWS TABLE
CREATE TABLE IF NOT EXISTS public.follows (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    follower_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    following_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT unique_follower_following UNIQUE (follower_id, following_id),
    CONSTRAINT no_self_follow CHECK (follower_id <> following_id)
);

CREATE INDEX IF NOT EXISTS idx_follows_follower ON public.follows(follower_id);
CREATE INDEX IF NOT EXISTS idx_follows_following ON public.follows(following_id);

-- 3.11 BOOKMARKS TABLE
CREATE TABLE IF NOT EXISTS public.bookmarks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT unique_user_bookmark UNIQUE (user_id, post_id)
);

CREATE INDEX IF NOT EXISTS idx_bookmarks_user ON public.bookmarks(user_id);

-- 3.12 NOTIFICATIONS TABLE
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    recipient_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    type notification_type NOT NULL,
    entity_id UUID,
    entity_type VARCHAR(50),
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notifications_recipient ON public.notifications(recipient_id, is_read, created_at DESC);

-- 3.13 REPORTS TABLE (Moderation & Admin oversight)
CREATE TABLE IF NOT EXISTS public.reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reporter_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    target_type report_target_type NOT NULL,
    target_id UUID NOT NULL,
    reason TEXT NOT NULL,
    status report_status DEFAULT 'pending',
    admin_notes TEXT DEFAULT '',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_reports_status ON public.reports(status, created_at DESC);

-- 3.14 HASHTAGS & POST_HASHTAGS
CREATE TABLE IF NOT EXISTS public.hashtags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tag VARCHAR(50) UNIQUE NOT NULL,
    post_count INT DEFAULT 1 CHECK (post_count >= 0),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_hashtags_tag ON public.hashtags(tag);

CREATE TABLE IF NOT EXISTS public.post_hashtags (
    post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
    hashtag_id UUID NOT NULL REFERENCES public.hashtags(id) ON DELETE CASCADE,
    PRIMARY KEY (post_id, hashtag_id)
);

-- ==============================================================================
-- 4. TRIGGERS & STORED PROCEDURES
-- ==============================================================================

-- 4.1 Update timestamp trigger function
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_profiles_updated_at ON public.profiles;
CREATE TRIGGER set_profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_posts_updated_at ON public.posts;
CREATE TRIGGER set_posts_updated_at
BEFORE UPDATE ON public.posts
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_communities_updated_at ON public.communities;
CREATE TRIGGER set_communities_updated_at
BEFORE UPDATE ON public.communities
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_comments_updated_at ON public.comments;
CREATE TRIGGER set_comments_updated_at
BEFORE UPDATE ON public.comments
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- 4.2 Auth to Profile Synchronizer:
-- When a user registers through Supabase Auth, automatically populate profiles table.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (
        id,
        email,
        full_name,
        username,
        department,
        semester,
        avatar_url,
        role,
        is_verified
    )
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', 'Student User'),
        COALESCE(NEW.raw_user_meta_data->>'username', SPLIT_PART(NEW.email, '@', 1)),
        COALESCE(NEW.raw_user_meta_data->>'department', 'General'),
        COALESCE((NEW.raw_user_meta_data->>'semester')::INT, 1),
        COALESCE(NEW.raw_user_meta_data->>'avatar_url', ''),
        COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'student'),
        -- Auto-verify if email ends with college domain (configured in auth) or default to false
        COALESCE((NEW.raw_user_meta_data->>'is_verified')::BOOLEAN, FALSE)
    )
    ON CONFLICT (id) DO NOTHING;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 4.3 Like & Vote Count Management Functions
CREATE OR REPLACE FUNCTION public.update_post_like_count()
RETURNS TRIGGER AS $$
BEGIN
    IF (TG_OP = 'INSERT') THEN
        UPDATE public.posts SET like_count = like_count + 1 WHERE id = NEW.post_id;
    ELSIF (TG_OP = 'DELETE') THEN
        UPDATE public.posts SET like_count = GREATEST(0, like_count - 1) WHERE id = OLD.post_id;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_post_likes_count ON public.post_likes;
CREATE TRIGGER trigger_post_likes_count
AFTER INSERT OR DELETE ON public.post_likes
FOR EACH ROW EXECUTE FUNCTION public.update_post_like_count();

-- 4.4 Follows Count Sync
CREATE OR REPLACE FUNCTION public.update_follow_counts()
RETURNS TRIGGER AS $$
BEGIN
    IF (TG_OP = 'INSERT') THEN
        UPDATE public.profiles SET following_count = following_count + 1 WHERE id = NEW.follower_id;
        UPDATE public.profiles SET followers_count = followers_count + 1 WHERE id = NEW.following_id;
    ELSIF (TG_OP = 'DELETE') THEN
        UPDATE public.profiles SET following_count = GREATEST(0, following_count - 1) WHERE id = OLD.follower_id;
        UPDATE public.profiles SET followers_count = GREATEST(0, followers_count - 1) WHERE id = OLD.following_id;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_follow_counts ON public.follows;
CREATE TRIGGER trigger_follow_counts
AFTER INSERT OR DELETE ON public.follows
FOR EACH ROW EXECUTE FUNCTION public.update_follow_counts();

-- ==============================================================================
-- 5. ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_media ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comment_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.story_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.communities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hashtags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_hashtags ENABLE ROW LEVEL SECURITY;

-- 5.1 PROFILES POLICIES
CREATE POLICY "Public profiles are viewable by authenticated users"
ON public.profiles FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Users can update their own profile"
ON public.profiles FOR UPDATE
TO authenticated
USING (auth.uid() = id);

-- 5.2 POSTS POLICIES
CREATE POLICY "Posts viewable by authenticated users"
ON public.posts FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Verified users can create posts"
ON public.posts FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Authors and Admins can update posts"
ON public.posts FOR UPDATE
TO authenticated
USING (auth.uid() = author_id OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "Authors, Moderators and Admins can delete posts"
ON public.posts FOR DELETE
TO authenticated
USING (
    auth.uid() = author_id 
    OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
    OR (community_id IS NOT NULL AND EXISTS (
        SELECT 1 FROM public.community_members 
        WHERE community_id = posts.community_id 
        AND user_id = auth.uid() 
        AND role IN ('moderator', 'admin')
    ))
);

-- 5.3 POST MEDIA POLICIES
CREATE POLICY "Post media viewable by authenticated users"
ON public.post_media FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Post media insertable by post author"
ON public.post_media FOR INSERT
TO authenticated
WITH CHECK (EXISTS (SELECT 1 FROM public.posts WHERE id = post_id AND author_id = auth.uid()));

-- 5.4 STORIES POLICIES
CREATE POLICY "Active stories viewable by authenticated users"
ON public.stories FOR SELECT
TO authenticated
USING (expires_at > NOW() AND is_deleted = FALSE);

CREATE POLICY "Users can insert their own stories"
ON public.stories FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Authors can update or delete their stories"
ON public.stories FOR UPDATE
TO authenticated
USING (auth.uid() = author_id);

-- 5.5 NOTIFICATIONS POLICIES
CREATE POLICY "Users can read their own notifications"
ON public.notifications FOR SELECT
TO authenticated
USING (auth.uid() = recipient_id);

CREATE POLICY "System and users can insert notifications"
ON public.notifications FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Users can update their notifications (mark as read)"
ON public.notifications FOR UPDATE
TO authenticated
USING (auth.uid() = recipient_id);

-- ==============================================================================
-- 6. SUPABASE STORAGE BUCKETS SETUP
-- ==============================================================================

-- Create Storage Buckets if not existing
INSERT INTO storage.buckets (id, name, public)
VALUES 
    ('avatars', 'avatars', true),
    ('posts', 'posts', true),
    ('stories', 'stories', true),
    ('communities', 'communities', true)
ON CONFLICT (id) DO NOTHING;

-- Storage Policies: Public Read Access
CREATE POLICY "Public Read for Avatars" ON storage.objects
FOR SELECT USING (bucket_id = 'avatars');

CREATE POLICY "Public Read for Posts" ON storage.objects
FOR SELECT USING (bucket_id = 'posts');

CREATE POLICY "Public Read for Stories" ON storage.objects
FOR SELECT USING (bucket_id = 'stories');

CREATE POLICY "Public Read for Communities" ON storage.objects
FOR SELECT USING (bucket_id = 'communities');

-- Storage Policies: Authenticated Upload Access
CREATE POLICY "Authenticated Users can upload Avatars" ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'avatars');

CREATE POLICY "Authenticated Users can upload Posts Media" ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'posts');

CREATE POLICY "Authenticated Users can upload Stories Media" ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'stories');

CREATE POLICY "Authenticated Users can upload Community Media" ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'communities');
