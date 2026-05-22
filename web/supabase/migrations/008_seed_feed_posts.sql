-- ═══════════════════════════════════════════════════════════════
-- Seed: 3 student profiles + 25 community posts spread over the
-- last 14 days across jee / neet / cat / upsc / world / gre.
-- Re-runnable: every insert is ON CONFLICT DO NOTHING.
-- ═══════════════════════════════════════════════════════════════

do $$
declare
  -- existing mentor seeds from 002
  m1 uuid := '11111111-1111-1111-1111-111111110001';  -- Sarah Chen
  m2 uuid := '11111111-1111-1111-1111-111111110002';  -- Raj Patel
  m3 uuid := '11111111-1111-1111-1111-111111110003';  -- Maria Garcia
  m4 uuid := '11111111-1111-1111-1111-111111110004';  -- James Wilson
  m5 uuid := '11111111-1111-1111-1111-111111110005';  -- Anita Sharma

  -- new student seeds
  s1 uuid := '44444444-4444-4444-4444-444444440001';
  s2 uuid := '44444444-4444-4444-4444-444444440002';
  s3 uuid := '44444444-4444-4444-4444-444444440003';
begin

  -- ── auth.users for students ────────────────────────────────────
  insert into auth.users (
    id, instance_id, aud, role, email, encrypted_password,
    email_confirmed_at, created_at, updated_at,
    raw_user_meta_data, raw_app_meta_data
  ) values
    (s1, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
     'priya.s@elm-seed.example', crypt('not-a-real-password', gen_salt('bf')),
     now(), now(), now(),
     '{"full_name":"Priya Sharma"}'::jsonb,
     '{"provider":"email","providers":["email"]}'::jsonb),
    (s2, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
     'arjun.m@elm-seed.example', crypt('not-a-real-password', gen_salt('bf')),
     now(), now(), now(),
     '{"full_name":"Arjun Mehta"}'::jsonb,
     '{"provider":"email","providers":["email"]}'::jsonb),
    (s3, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
     'kavya.i@elm-seed.example', crypt('not-a-real-password', gen_salt('bf')),
     now(), now(), now(),
     '{"full_name":"Kavya Iyer"}'::jsonb,
     '{"provider":"email","providers":["email"]}'::jsonb)
  on conflict (id) do nothing;

  -- ── profiles for students ──────────────────────────────────────
  insert into public.profiles (id, email, role, full_name, handle, plan, is_mentor, bio)
  values
    (s1, 'priya.s@elm-seed.example',  'student', 'Priya Sharma', 'priya_s', 'Pro',   false,
     'JEE 2026 aspirant. Mostly studying Physics & Maths.'),
    (s2, 'arjun.m@elm-seed.example',  'student', 'Arjun Mehta',  'arjunm',  'Free',  false,
     'CS undergrad prepping for SDE interviews.'),
    (s3, 'kavya.i@elm-seed.example',  'student', 'Kavya Iyer',   'kavyai',  'Elite', false,
     'NEET 2026. Biology > everything else.')
  on conflict (id) do nothing;

  -- ── 25 demo posts spread across communities and ~14 days ─────
  -- created_at offsets are picked so Trending (last 7 days) has plenty.
  insert into public.posts
    (id, author_id, content, visibility, tags, like_count, comment_count, created_at)
  values
    -- jee
    ('55555555-5555-5555-5555-555555550001', s1,
     'Day 47 of consistent prep. Calculus is finally clicking after grinding 200 derivative problems this week.',
     'jee', array['Progress','Math'], 142, 23, now() - interval '2 hours'),
    ('55555555-5555-5555-5555-555555550002', s2,
     'Anyone else stuck on rotational dynamics? Specifically the rolling-without-slipping conditions for compound pulleys.',
     'jee', array['Question','Physics'], 18, 14, now() - interval '6 hours'),
    ('55555555-5555-5555-5555-555555550003', m2,
     'Quick tip from grading 500+ JEE Mains scripts: 60% of mistakes in Inorganic come from skipping electronic configuration. Memorize the exceptions cold.',
     'jee', array['Study tip','Chemistry'], 287, 41, now() - interval '1 day'),
    ('55555555-5555-5555-5555-555555550004', s1,
     'Just found this great explainer for indeterminate forms in limits — covers all 7 forms with worked examples. Sharing in case it helps.',
     'jee', array['Resource','Math'], 96, 17, now() - interval '2 days'),
    ('55555555-5555-5555-5555-555555550005', s2,
     'Mock paper score: 198/300. Up from 142 three weeks ago. The grind is real but it works.',
     'jee', array['Progress'], 73, 12, now() - interval '4 days'),

    -- neet
    ('55555555-5555-5555-5555-555555550006', s3,
     'NEET Biology AMA tomorrow 6pm — drop your toughest questions in the replies and I''ll prep them. Mostly Plant Physiology + Genetics.',
     'neet', array['Event','Biology'], 211, 38, now() - interval '5 hours'),
    ('55555555-5555-5555-5555-555555550007', s3,
     'Mock test result: 680/720. Plant Physiology is still my weak spot. Anyone have a clean resource for hormonal regulation?',
     'neet', array['Progress','Biology'], 168, 29, now() - interval '1 day'),
    ('55555555-5555-5555-5555-555555550008', m3,
     'Organic Chemistry mechanisms shortcut: if you can draw the curved arrows, you can predict the product. Stop memorizing reactions, start understanding electron flow.',
     'neet', array['Study tip','Chemistry'], 312, 47, now() - interval '2 days'),
    ('55555555-5555-5555-5555-555555550009', s3,
     'Stuck on a question — for the diagram I posted, is the structure trans-2-butene or cis-2-butene? Confused about E/Z notation.',
     'neet', array['Question','Chemistry'], 24, 19, now() - interval '3 days'),
    ('55555555-5555-5555-5555-555555550010', m4,
     'Reminder for NEET 2026 folks: NCERT first, coaching material second. Anything else is noise until you''ve mastered those two.',
     'neet', array['Study tip'], 446, 52, now() - interval '5 days'),

    -- cat
    ('55555555-5555-5555-5555-555555550011', s2,
     'Quant Tip: For Geometry questions, always draw the figure even if the question doesn''t require one. Went from 68%ile to 89%ile doing this for 6 weeks.',
     'cat', array['Study tip','Quant'], 203, 41, now() - interval '8 hours'),
    ('55555555-5555-5555-5555-555555550012', m1,
     'VARC is a reading habit, not a study topic. Read a long-form article every morning. 3 months in, your accuracy doubles.',
     'cat', array['Strategy','VARC'], 178, 33, now() - interval '2 days'),
    ('55555555-5555-5555-5555-555555550013', s2,
     'CAT mock 8/15 done. Sectionals: VARC 92%ile, DILR 71%ile, Quant 88%ile. DILR is killing me.',
     'cat', array['Progress'], 41, 11, now() - interval '3 days'),
    ('55555555-5555-5555-5555-555555550014', s1,
     'CAT Quant Sprint this Saturday 10 AM — 90 mins, 25 questions, full review. Comment to RSVP.',
     'cat', array['Event'], 67, 22, now() - interval '6 days'),

    -- upsc
    ('55555555-5555-5555-5555-555555550015', m5,
     'For UPSC GS-2 governance answers, structure matters more than content. Intro (3 lines) → 3 sub-themes (each with case study) → conclusion. Don''t over-engineer.',
     'upsc', array['Study tip','GS-2'], 234, 39, now() - interval '12 hours'),
    ('55555555-5555-5555-5555-555555550016', s2,
     'Day 1 of revising Modern History from Spectrum. Anyone else starting a revision cycle? Want to keep each other accountable.',
     'upsc', array['Motivation','History'], 52, 18, now() - interval '2 days'),
    ('55555555-5555-5555-5555-555555550017', m5,
     'Essay paper tip: pick stable themes (justice, freedom, equality) and write practice essays on a 90-min timer. Build the muscle.',
     'upsc', array['Study tip','Essay'], 189, 27, now() - interval '4 days'),
    ('55555555-5555-5555-5555-555555550018', s3,
     'Stuck — for CSAT 2024 Q47 on logical reasoning, the official answer feels wrong. Anyone solved it both ways?',
     'upsc', array['Question','CSAT'], 31, 21, now() - interval '7 days'),

    -- gre
    ('55555555-5555-5555-5555-555555550019', s1,
     'GRE 326 — Q170 V156 AWA 5.0. Used Manhattan + Magoosh + 8 ETS mocks. Happy to share my 8-week schedule in the comments.',
     'gre', array['Progress'],          124, 28, now() - interval '1 day'),
    ('55555555-5555-5555-5555-555555550020', m4,
     'GRE Verbal trick: text completion is mostly about contrast vs continuation. Find the pivot word first (but, although, however, and, also).',
     'gre', array['Study tip','Verbal'], 87, 15, now() - interval '3 days'),

    -- world
    ('55555555-5555-5555-5555-555555550021', s3,
     'Hot take: Pomodoro is overrated for deep technical study. Long unbroken blocks (90-120 min) work way better once your focus muscle is built.',
     'world', array['Strategy'], 156, 89, now() - interval '4 hours'),
    ('55555555-5555-5555-5555-555555550022', m1,
     'Just finished a mentor session with a JEE 2025 dropper who scored 312 on retake. Wanted to share what worked: consistency > intensity. Showing up daily for 6 months beat 14-hour cram weeks.',
     'world', array['Testimonial'], 423, 67, now() - interval '1 day'),
    ('55555555-5555-5555-5555-555555550023', s2,
     'Random rant: how does ANY exam prep platform still not have a dark mode toggle on its planner? Just me?',
     'world', array['Rant'], 234, 56, now() - interval '2 days'),
    ('55555555-5555-5555-5555-555555550024', m3,
     'New thread coming Monday — "How I revise" series. Going to walk through my exact spaced-repetition schedule for tough topics. Stay tuned.',
     'world', array['Resource'], 178, 22, now() - interval '6 days'),
    ('55555555-5555-5555-5555-555555550025', s1,
     'Streak update: 60 days. Lowest day was 90 mins on a fever day. Highest was 8 hrs. The trick is to NEVER zero out.',
     'world', array['Motivation'], 312, 41, now() - interval '10 days')
  on conflict (id) do nothing;

end $$;
