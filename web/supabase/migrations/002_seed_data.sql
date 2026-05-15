-- ═══════════════════════════════════════════════════════════════
-- Elm Origin — Seed data
-- Run in Supabase SQL Editor (uses elevated privileges to insert
-- into auth.users; safe to re-run — all inserts use ON CONFLICT).
-- ═══════════════════════════════════════════════════════════════

-- ── Fixed UUIDs so seed is idempotent across re-runs ──────────
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
  -- Seed auth.users for the mentors (so FK constraints hold).
  insert into auth.users (id, instance_id, aud, role, email, encrypted_password,
                          email_confirmed_at, created_at, updated_at,
                          raw_user_meta_data, raw_app_meta_data)
  values
    (m1, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
     'sarah.chen@example.com', crypt('seed-password-not-used', gen_salt('bf')),
     now(), now(), now(),
     '{"full_name":"Dr. Sarah Chen"}'::jsonb, '{"provider":"seed"}'::jsonb),
    (m2, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
     'raj.patel@example.com', crypt('seed-password-not-used', gen_salt('bf')),
     now(), now(), now(),
     '{"full_name":"Prof. Raj Patel"}'::jsonb, '{"provider":"seed"}'::jsonb),
    (m3, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
     'maria.garcia@example.com', crypt('seed-password-not-used', gen_salt('bf')),
     now(), now(), now(),
     '{"full_name":"Maria Garcia"}'::jsonb, '{"provider":"seed"}'::jsonb),
    (m4, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
     'james.wilson@example.com', crypt('seed-password-not-used', gen_salt('bf')),
     now(), now(), now(),
     '{"full_name":"James Wilson"}'::jsonb, '{"provider":"seed"}'::jsonb),
    (m5, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
     'anita.sharma@example.com', crypt('seed-password-not-used', gen_salt('bf')),
     now(), now(), now(),
     '{"full_name":"Anita Sharma"}'::jsonb, '{"provider":"seed"}'::jsonb)
  on conflict (id) do nothing;

  -- Profiles
  insert into public.profiles (id, email, full_name, handle, plan, is_mentor, tier)
  values
    (m1, 'sarah.chen@example.com',  'Dr. Sarah Chen',   'sarahchen',  'Free', true, 'free'),
    (m2, 'raj.patel@example.com',   'Prof. Raj Patel',  'rajpatel',   'Free', true, 'free'),
    (m3, 'maria.garcia@example.com','Maria Garcia',     'mariag',     'Free', true, 'free'),
    (m4, 'james.wilson@example.com','James Wilson',     'jameswil',   'Free', true, 'free'),
    (m5, 'anita.sharma@example.com','Anita Sharma',     'anitasharma','Free', true, 'free')
  on conflict (id) do nothing;

  -- Mentor profiles
  insert into public.mentor_profiles (id, headline, bio, primary_field, rating, total_reviews, total_sessions, accepting_bookings)
  values
    (m1, 'Stanford CS PhD — 10 yrs teaching ML', 'Helping students master ML fundamentals.', 'Machine Learning', 4.9, 124, 320, true),
    (m2, 'IIT Delhi — Algorithms specialist',    'Algorithms and competitive programming.', 'Algorithms',       4.8,  98, 280, true),
    (m3, 'Senior SWE @ Google — System Design',  'System design interviews and architecture.', 'System Design',  4.95, 156, 410, true),
    (m4, 'Full-stack engineer & mentor',         'Web development from React to Postgres.', 'Web Development',  4.7,  72, 190, true),
    (m5, 'Data Scientist — 8 yrs experience',    'Hands-on data science and statistics.', 'Data Science',       4.85, 88, 240, true)
  on conflict (id) do nothing;

  -- Public active rooms
  insert into public.rooms (id, topic, subject, host_id, mode, visibility, max_participants, is_active)
  values
    (r1, 'JavaScript Study Group', 'Web Development',  m4, 'discussion', 'public', 10, true),
    (r2, 'Math Problem Solving',   'Mathematics',      m2, 'focus',      'public',  8, true),
    (r3, 'Python ML Lab',          'Machine Learning', m1, 'collab',     'public', 15, true)
  on conflict (id) do nothing;

  -- Host as participant
  insert into public.room_participants (room_id, user_id, role) values
    (r1, m4, 'host'), (r2, m2, 'host'), (r3, m1, 'host')
  on conflict do nothing;

  -- Community posts
  insert into public.posts (id, author_id, community, content, tag, likes_count, replies_count)
  values
    ('33333333-3333-3333-3333-333333330001', m1, 'world', 'Just finished a session on gradient descent — love seeing the lightbulb moments!', 'ML', 24, 3),
    ('33333333-3333-3333-3333-333333330002', m3, 'world', 'System design tip: always start with the requirements, not the architecture.', 'Interview', 41, 7),
    ('33333333-3333-3333-3333-333333330003', m2, 'world', 'New problem set on dynamic programming dropped. Who''s in?', 'Algorithms', 18, 5),
    ('33333333-3333-3333-3333-333333330004', m4, 'world', 'React 19 server actions changed how I think about forms. Worth exploring.', 'Web', 33, 9),
    ('33333333-3333-3333-3333-333333330005', m5, 'world', 'Reminder: clean data beats clever models. Every. Single. Time.', 'Data', 56, 12)
  on conflict (id) do nothing;
end $$;
