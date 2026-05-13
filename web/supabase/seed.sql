-- ═══════════════════════════════════════════════════════════════
-- Elm Origin — seed demo data
-- Apply via Supabase SQL Editor after migrations
-- NOTE: this seed assumes real auth users exist already.
--       It picks the first 12 auth users it finds and assigns roles.
-- ═══════════════════════════════════════════════════════════════

-- Helper: pick up to N auth users (must already exist)
with seed_users as (
  select id, email, row_number() over (order by created_at) as rn
  from auth.users
  limit 20
)
-- Make first 10 mentors, ensure profile rows
insert into public.mentor_profiles (id, headline, bio, primary_field, subjects, pricing, rating, total_reviews, total_sessions, accepting_bookings)
select
  u.id,
  case u.rn
    when 1 then 'Data Scientist · Google'
    when 2 then 'Senior Engineer · Stripe'
    when 3 then 'PhD · Cognitive Science · Oxford'
    when 4 then 'IIT-JEE Coach · 8 yrs'
    when 5 then 'Product Designer · Linear'
    when 6 then 'Cardiologist · AIIMS'
    when 7 then 'ML Researcher · DeepMind'
    when 8 then 'Investment Banker · Goldman'
    when 9 then 'Writing Coach · Harvard MBA'
    when 10 then 'Startup Founder · YC W22'
    else 'Mentor'
  end as headline,
  'Experienced mentor focused on real-world skills. Sessions are conversational — no monologues, no jargon, just clarity.' as bio,
  case (u.rn % 6)
    when 0 then 'Data Science' when 1 then 'Software Engineering'
    when 2 then 'Research' when 3 then 'Mathematics'
    when 4 then 'Design' else 'Business'
  end,
  jsonb_build_array(
    case (u.rn % 6)
      when 0 then 'Statistics' when 1 then 'React'
      when 2 then 'Writing' when 3 then 'JEE'
      when 4 then 'Portfolio Review' else 'Pitch decks'
    end,
    'General mentorship'
  ),
  jsonb_build_object(
    'voice', jsonb_build_object('enabled', true, 'p30', 499 + (u.rn * 100), 'p60', 899 + (u.rn * 150)),
    'video', jsonb_build_object('enabled', true, 'p30', 599 + (u.rn * 100), 'p60', 999 + (u.rn * 150))
  ),
  4.5 + ((u.rn % 5) * 0.1),
  50 + u.rn * 12,
  100 + u.rn * 40,
  true
from seed_users u
where u.rn <= 10
on conflict (id) do nothing;

-- Mark those as mentors in profiles
update public.profiles p set is_mentor = true
where p.id in (
  select id from auth.users order by created_at limit 10
);

-- Seed posts (community)
insert into public.posts (author_id, community, content, tag, likes_count, replies_count, reposts_count, bookmarks_count, created_at)
select
  u.id,
  case (u.rn % 4) when 0 then 'world' when 1 then 'jee' when 2 then 'neet' else 'cat' end,
  case (u.rn % 8)
    when 0 then 'Just solved 40 problems in Calculus back-to-back 🔥 The trick with limits is to check for indeterminate forms first.'
    when 1 then 'Hot take: Pomodoro is overrated for deep technical study. 90-min blocks with active recall are gold.'
    when 2 then 'Mock test 680/720 in Biology 🎯 dropped marks only in Plant Physiology.'
    when 3 then 'Quant tip: always draw the figure. 80% of my geometry mistakes came from assumed symmetry.'
    when 4 then 'Anyone else finding the new NTA pattern harder? Chemistry weightage shift is real.'
    when 5 then 'Best mentor session of the year. Cleared 3 weeks of confusion in 45 minutes.'
    when 6 then 'Started using spaced repetition for organic chem mechanisms — game changer.'
    else 'How do you all stay motivated during a long prep cycle?'
  end,
  case (u.rn % 4) when 0 then 'Study tip' when 1 then 'Progress' when 2 then null else 'Strategy' end,
  20 + (random() * 200)::int,
  (random() * 30)::int,
  (random() * 20)::int,
  (random() * 50)::int,
  now() - (random() * interval '5 days')
from (select id, row_number() over (order by created_at) as rn from auth.users limit 12) u;

-- Seed sample rooms hosted by first 6 users
insert into public.rooms (topic, subject, host_id, mode, visibility, max_participants, pomodoro)
select
  case (u.rn % 5)
    when 0 then 'Linear Algebra Deep Dive'
    when 1 then 'React Patterns & Performance'
    when 2 then 'JEE Electrostatics Sprint'
    when 3 then 'Organic Mechanisms — Arrows'
    else 'System Design Interview Prep'
  end,
  case (u.rn % 5)
    when 0 then 'Mathematics' when 1 then 'Computer Science'
    when 2 then 'Physics' when 3 then 'Chemistry' else 'Computer Science'
  end,
  u.id,
  case (u.rn % 4) when 0 then 'focus' when 1 then 'discussion' when 2 then 'collab' else 'discussion' end,
  'public',
  6,
  '25/5'
from (select id, row_number() over (order by created_at) as rn from auth.users limit 6) u;

-- Seed notifications for the first user (so the bell badge shows something on login)
with first_user as (select id from auth.users order by created_at limit 1)
insert into public.notifications (user_id, type, title, description, read)
select
  fu.id,
  unnest(array['session', 'community', 'system', 'session', 'community', 'system']),
  unnest(array[
    'Session starts in 30 minutes',
    'Arjun M. accepted your friend request',
    'New badge earned: 7-Day Streak 🔥',
    'Booking confirmed: Dr. Elena Rossi',
    'You have 3 unread messages in React Patterns',
    'Productivity report ready'
  ]),
  unnest(array[
    'With Priya Sharma · Intro to Pandas',
    '',
    'You unlocked your second badge',
    'April 28, 4:00 PM · Video session',
    '',
    'Last week: 14h focused, +12% vs the week before'
  ]),
  unnest(array[false, false, false, true, true, true])
from first_user fu;
