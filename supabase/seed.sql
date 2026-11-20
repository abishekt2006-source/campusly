-- ==============================================================================
-- CAMPUSLY: INITIAL SEED DATA (supabase/seed.sql)
-- Starter communities, sample hashtags and college categories
-- ==============================================================================

-- 1. Insert Initial Campus Communities
INSERT INTO public.communities (name, slug, description, rules, avatar_url, cover_url)
VALUES 
    (
        'Computer Science Department',
        'cs-dept',
        'Official and student discussion hub for CS & IT engineering students. Share notes, project ideas, hackathons, and lab announcements.',
        '1. Respect fellow batchmates.\n2. No plagiarized code without attribution.\n3. Keep discussions academic and tech-oriented.',
        'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=300',
        'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=1200'
    ),
    (
        'Electronics & Instrumentation',
        'ece-ice-dept',
        'Hardware, microcontrollers, VLSI, and campus lab discussions.',
        '1. Share project schematics constructively.\n2. Respect lab safety and equipment rules.',
        'https://images.unsplash.com/photo-1518770660439-4636190af475?w=300',
        'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=1200'
    ),
    (
        'Coding & Open Source Club',
        'coding-club',
        'DSA, competitive programming, Open Source contributions, and campus Hackathon teams.',
        '1. Post LeetCode/Codeforces queries with problem links.\n2. Help juniors with doubts.\n3. Promote open source culture.',
        'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=300',
        'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=1200'
    ),
    (
        'Campus Photography Club',
        'shutterbugs',
        'Capture campus sunsets, college fest highlights, architecture, and student life.',
        '1. Credit the photographer.\n2. No unauthorized personal portraits.\n3. High-res uploads encouraged.',
        'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=300',
        'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?w=1200'
    ),
    (
        'Campus Memes & Banter',
        'campus-memes',
        'Laughter, relatable exam stress memes, canteen chronicles, and professor anecdotes (all in good humor).',
        '1. No cyberbullying or malicious targeting.\n2. Keep it light-hearted and clean.\n3. Protect privacy.',
        'https://images.unsplash.com/photo-1531259683007-016a7b628fc3?w=300',
        'https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=1200'
    ),
    (
        'Campus Events & Fest Hub',
        'college-fests',
        'Annual cultural fest, tech symposiums, sports tournaments, and club recruitment schedules.',
        '1. Event coordinators must include date, time, and venue.\n2. Official posters must be readable.',
        'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=300',
        'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=1200'
    ),
    (
        'Anonymous Confessions',
        'campus-confessions',
        'Speak your mind, share wholesome crushes, campus thoughts, and college nostalgia anonymously.',
        '1. Strict zero tolerance for harassment, hate speech, or naming individuals.\n2. All posts are reviewed by community moderators.',
        'https://images.unsplash.com/photo-1513151233558-d860c5398176?w=300',
        'https://images.unsplash.com/photo-1508739773434-c26b3d09e071?w=1200'
    )
ON CONFLICT (slug) DO NOTHING;

-- 2. Insert Starter Hashtags
INSERT INTO public.hashtags (tag, post_count)
VALUES 
    ('CampusLife', 45),
    ('TechFest2026', 120),
    ('Hackathon', 30),
    ('ExamWeek', 88),
    ('FreshersParty', 62),
    ('CanteenVibes', 29)
ON CONFLICT (tag) DO NOTHING;
