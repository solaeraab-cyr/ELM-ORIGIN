-- ═══════════════════════════════════════════════════════════════
-- Elm Origin — Seed interview_sessions sample data
-- Run this in Supabase SQL editor. Idempotent on the listed IDs.
-- ═══════════════════════════════════════════════════════════════

insert into public.interview_sessions (
  id, type, initiator_id, partner_id, config, status, score, started_at, ended_at, created_at
) values
  -- 1. Upcoming peer interview (tomorrow)
  (
    '33333333-3333-3333-3333-333333330001',
    'peer',
    '11111111-1111-1111-1111-111111110002',  -- Prof. Raj Patel
    null,
    jsonb_build_object(
      'topic', 'DSA',
      'scheduled_for', to_char(now() + interval '1 day', 'YYYY-MM-DD"T"HH24:MI:SS"Z"'),
      'duration_minutes', 45,
      'difficulty', 'mirror'
    ),
    'pending',
    null,
    null,
    null,
    now()
  ),
  -- 2. Upcoming group interview (day after tomorrow)
  (
    '33333333-3333-3333-3333-333333330002',
    'group',
    '11111111-1111-1111-1111-111111110003',  -- Maria Garcia
    null,
    jsonb_build_object(
      'topic', 'System Design',
      'scheduled_for', to_char(now() + interval '2 days', 'YYYY-MM-DD"T"HH24:MI:SS"Z"'),
      'duration_minutes', 60,
      'max_participants', 5
    ),
    'pending',
    null,
    null,
    null,
    now()
  ),
  -- 3. Completed peer interview (yesterday)
  (
    '33333333-3333-3333-3333-333333330003',
    'peer',
    '11111111-1111-1111-1111-111111110001',  -- Dr. Sarah Chen
    '11111111-1111-1111-1111-111111110005',  -- Anita Sharma
    jsonb_build_object(
      'topic', 'ML',
      'scheduled_for', to_char(now() - interval '1 day', 'YYYY-MM-DD"T"HH24:MI:SS"Z"'),
      'duration_minutes', 45
    ),
    'completed',
    82,
    now() - interval '1 day',
    now() - interval '1 day' + interval '45 minutes',
    now() - interval '1 day' - interval '5 minutes'
  )
on conflict (id) do update
  set config = excluded.config,
      status = excluded.status,
      score  = excluded.score;
