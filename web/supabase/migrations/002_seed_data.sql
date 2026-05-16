-- ═══════════════════════════════════════════════════════════════
-- Elm Origin — Seed data (matches the live DB schema)
-- Idempotent: re-runnable without errors.
-- ═══════════════════════════════════════════════════════════════

do $$
declare
  m1 uuid := '11111111-1111-1111-1111-111111110001';
  m2 uuid := '11111111-1111-1111-1111-111111110002';
  m3 uuid := '11111111-1111-1111-1111-111111110003';
  m4 uuid := '11111111-1111-1111-1111-111111110004';
  m5 uuid := '11111111-1111-1111-1111-111111110005';
  r1 uuid := '22222222-2222-2222-2222-222222220001';
  r2 uuid := '22222222-2222-2222-2222-222222220002';
  r3 uuid := '22222222-2222-2222-2222-222222220003';
begin

  -- ── auth.users (required so profile FKs hold) ────────────────
  insert into auth.users (
    id, instance_id, aud, role, email, encrypted_password,
    email_confirmed_at, created_at, updated_at,
    raw_user_meta_data, raw_app_meta_data
  ) values
    (m1, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
     'sarah.chen@elm-seed.example', crypt('not-a-real-password', gen_salt('bf')),
     now(), now(), now(),
     '{"full_name":"Dr. Sarah Chen","is_mentor":true}'::jsonb,
     '{"provider":"email","providers":["email"]}'::jsonb),
    (m2, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
     'raj.patel@elm-seed.example', crypt('not-a-real-password', gen_salt('bf')),
     now(), now(), now(),
     '{"full_name":"Prof. Raj Patel","is_mentor":true}'::jsonb,
     '{"provider":"email","providers":["email"]}'::jsonb),
    (m3, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
     'maria.garcia@elm-seed.example', crypt('not-a-real-password', gen_salt('bf')),
     now(), now(), now(),
     '{"full_name":"Maria Garcia","is_mentor":true}'::jsonb,
     '{"provider":"email","providers":["email"]}'::jsonb),
    (m4, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
     'james.wilson@elm-seed.example', crypt('not-a-real-password', gen_salt('bf')),
     now(), now(), now(),
     '{"full_name":"James Wilson","is_mentor":true}'::jsonb,
     '{"provider":"email","providers":["email"]}'::jsonb),
    (m5, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
     'anita.sharma@elm-seed.example', crypt('not-a-real-password', gen_salt('bf')),
     now(), now(), now(),
     '{"full_name":"Anita Sharma","is_mentor":true}'::jsonb,
     '{"provider":"email","providers":["email"]}'::jsonb)
  on conflict (id) do nothing;

  -- ── profiles ──────────────────────────────────────────────────
  -- Columns per the live schema: id, email, role, full_name, handle,
  -- plan, is_mentor, bio, avatar_url, streak, xp.
  insert into public.profiles (id, email, role, full_name, handle, plan, is_mentor, bio)
  values
    (m1, 'sarah.chen@elm-seed.example',  'mentor', 'Dr. Sarah Chen',   'sarahchen',   'Free', true,
     'Stanford CS PhD with 10 years of teaching experience in Machine Learning.'),
    (m2, 'raj.patel@elm-seed.example',   'mentor', 'Prof. Raj Patel',  'rajpatel',    'Free', true,
     'IIT Delhi graduate specialising in algorithms and competitive programming.'),
    (m3, 'maria.garcia@elm-seed.example','mentor', 'Maria Garcia',     'mariag',      'Free', true,
     'Senior Software Engineer at Google focused on system design and architecture.'),
    (m4, 'james.wilson@elm-seed.example','mentor', 'James Wilson',     'jameswil',    'Free', true,
     'Full-stack developer and mentor with expertise in React, Node, and Postgres.'),
    (m5, 'anita.sharma@elm-seed.example','mentor', 'Anita Sharma',     'anitasharma', 'Free', true,
     'Data Scientist with 8 years of industry experience in ML and statistics.')
  on conflict (id) do nothing;

  -- ── mentor_profiles ───────────────────────────────────────────
  -- Columns per the live schema: id, user_id (FK→profiles.id),
  -- bio, expertise (text[]), hourly_rate, languages (text[]),
  -- timezone, availability_status, total_reviews, avg_rating,
  -- total_sessions, ...
  insert into public.mentor_profiles (
    user_id, bio, expertise, hourly_rate, languages, timezone,
    availability_status, total_reviews, avg_rating, total_sessions
  ) values
    (m1, 'Helping students master ML fundamentals with clarity and confidence.',
     array['Machine Learning','Deep Learning','Python'], 75,
     array['English'], 'America/Los_Angeles', 'available', 124, 4.9, 320),
    (m2, 'Algorithms, data structures, and competitive programming made intuitive.',
     array['Algorithms','Data Structures','C++'], 60,
     array['English','Hindi'], 'Asia/Kolkata', 'available', 98, 4.8, 280),
    (m3, 'System design interviews and scalable architecture, demystified.',
     array['System Design','Distributed Systems','Interview Prep'], 90,
     array['English','Spanish'], 'America/New_York', 'available', 156, 4.95, 410),
    (m4, 'From React to Postgres — end-to-end web development coaching.',
     array['Web Development','React','Node.js'], 55,
     array['English'], 'Europe/London', 'available', 72, 4.7, 190),
    (m5, 'Hands-on data science: modelling, visualisation, and production pipelines.',
     array['Data Science','Statistics','Pandas'], 70,
     array['English','Hindi'], 'Asia/Kolkata', 'available', 88, 4.85, 240)
  on conflict do nothing;

  -- ── rooms ─────────────────────────────────────────────────────
  -- Columns per the live schema: id, creator_id, title, subject,
  -- description, duration_minutes, max_participants, is_public,
  -- requires_approval, room_type, scheduled_for, status.
  insert into public.rooms (
    id, creator_id, title, subject, description, duration_minutes,
    max_participants, is_public, requires_approval, room_type, status
  ) values
    (r1, m4, 'JavaScript Study Group', 'Web Development',
     'Daily live practice and code reviews. Drop in any time.',
     60, 10, true, false, 'discussion', 'active'),
    (r2, m2, 'Math Problem Solving',   'Mathematics',
     'Focused work block on advanced calculus problems.',
     45, 8, true, false, 'focus', 'active'),
    (r3, m1, 'Python ML Lab',          'Machine Learning',
     'Hands-on ML projects — bring a notebook and questions.',
     90, 15, true, false, 'collab', 'active')
  on conflict (id) do nothing;

  -- ── posts ─────────────────────────────────────────────────────
  -- Columns per the live schema: id, author_id, content, visibility,
  -- tags (text[]), like_count, comment_count, image_urls (text[]),
  -- is_pinned.
  insert into public.posts (id, author_id, content, visibility, tags, like_count, comment_count)
  values
    ('33333333-3333-3333-3333-333333330001', m1,
     'Just wrapped a session on gradient descent — love seeing the lightbulb moments!',
     'world', array['ML','teaching'], 24, 3),
    ('33333333-3333-3333-3333-333333330002', m3,
     'System design tip: always start with the requirements, not the architecture.',
     'world', array['Interview','SystemDesign'], 41, 7),
    ('33333333-3333-3333-3333-333333330003', m2,
     'New problem set on dynamic programming just dropped. Who''s joining the session?',
     'world', array['Algorithms','DP'], 18, 5),
    ('33333333-3333-3333-3333-333333330004', m4,
     'React 19 server actions changed how I think about forms. Worth a deep dive.',
     'world', array['Web','React'], 33, 9),
    ('33333333-3333-3333-3333-333333330005', m5,
     'Reminder: clean data beats clever models. Every. Single. Time.',
     'world', array['Data','MLOps'], 56, 12)
  on conflict (id) do nothing;

end $$;
