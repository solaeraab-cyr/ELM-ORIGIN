-- ═══════════════════════════════════════════════════════════════
-- Elm Origin — Phase 1C Full Schema
-- Apply via Supabase SQL Editor (after the original schema.sql)
-- ═══════════════════════════════════════════════════════════════

-- ── 1. Extend profiles table ──────────────────────────────────
alter table public.profiles
  add column if not exists field           text,
  add column if not exists year            text,
  add column if not exists institution     text,
  add column if not exists cover_gradient  text default 'brand',
  add column if not exists badges          jsonb default '[]'::jsonb;

-- ── 2. mentor_profiles ────────────────────────────────────────
create table if not exists public.mentor_profiles (
  id                    uuid primary key references public.profiles(id) on delete cascade,
  headline              text,
  bio                   text,
  teaching_approach     text,
  primary_field         text,
  subjects              jsonb default '[]'::jsonb,
  education             jsonb default '[]'::jsonb,
  certifications        jsonb default '[]'::jsonb,
  pricing               jsonb default '{"voice":{"enabled":true,"p30":499,"p60":899},"video":{"enabled":true,"p30":599,"p60":999}}'::jsonb,
  availability          jsonb default '{}'::jsonb,
  buffer_minutes        integer default 15,
  advance_window        text default '1 month',
  blocked_dates         jsonb default '[]'::jsonb,
  timezone              text default 'IST (UTC+5:30)',
  languages             jsonb default '["English"]'::jsonb,
  accepting_bookings    boolean default true,
  response_rate         integer default 0,
  response_time_min     integer default 120,
  total_sessions        integer default 0,
  rating                numeric(2,1) default 0,
  total_reviews         integer default 0,
  profile_completion    integer default 0,
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now()
);

create trigger mentor_profiles_set_updated_at
  before update on public.mentor_profiles
  for each row execute procedure public.set_updated_at();

alter table public.mentor_profiles enable row level security;

create policy "mentor_profiles_select_public" on public.mentor_profiles for select using (true);
create policy "mentor_profiles_update_own"    on public.mentor_profiles for update using (auth.uid() = id) with check (auth.uid() = id);
create policy "mentor_profiles_insert_own"    on public.mentor_profiles for insert with check (auth.uid() = id);

-- ── 3. rooms ──────────────────────────────────────────────────
create table if not exists public.rooms (
  id                uuid primary key default gen_random_uuid(),
  topic             text not null,
  subject           text,
  host_id           uuid references public.profiles(id) on delete cascade,
  mode              text default 'focus' check (mode in ('focus', 'discussion', 'collab', 'group-interview')),
  visibility        text default 'public' check (visibility in ('public', 'private')),
  max_participants  integer default 6 check (max_participants between 2 and 50),
  is_active         boolean default true,
  pomodoro          text default '25/5',
  created_at        timestamptz not null default now()
);

alter table public.rooms enable row level security;
create policy "rooms_select_public"      on public.rooms for select using (visibility = 'public' or host_id = auth.uid());
create policy "rooms_insert_authenticated" on public.rooms for insert with check (auth.uid() = host_id);
create policy "rooms_update_host"        on public.rooms for update using (auth.uid() = host_id);
create policy "rooms_delete_host"        on public.rooms for delete using (auth.uid() = host_id);

-- ── 4. room_participants ──────────────────────────────────────
create table if not exists public.room_participants (
  room_id    uuid not null references public.rooms(id) on delete cascade,
  user_id    uuid not null references public.profiles(id) on delete cascade,
  joined_at  timestamptz not null default now(),
  role       text default 'participant' check (role in ('host', 'participant')),
  primary key (room_id, user_id)
);

alter table public.room_participants enable row level security;
create policy "room_participants_select" on public.room_participants for select using (true);
create policy "room_participants_insert_own" on public.room_participants for insert with check (auth.uid() = user_id);
create policy "room_participants_delete_own" on public.room_participants for delete using (auth.uid() = user_id);

-- ── 5. bookings ───────────────────────────────────────────────
create table if not exists public.bookings (
  id              uuid primary key default gen_random_uuid(),
  student_id      uuid not null references public.profiles(id) on delete cascade,
  mentor_id       uuid not null references public.profiles(id) on delete cascade,
  type            text not null check (type in ('voice', 'video')),
  scheduled_date  date not null,
  scheduled_time  text not null,
  duration        integer not null check (duration in (30, 60)),
  status          text not null default 'pending' check (status in ('pending', 'confirmed', 'completed', 'cancelled', 'declined')),
  agenda          text,
  price           integer not null,
  decline_reason  text,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create trigger bookings_set_updated_at before update on public.bookings for each row execute procedure public.set_updated_at();

alter table public.bookings enable row level security;
create policy "bookings_select_participants" on public.bookings for select using (auth.uid() in (student_id, mentor_id));
create policy "bookings_insert_student"      on public.bookings for insert with check (auth.uid() = student_id);
create policy "bookings_update_participants" on public.bookings for update using (auth.uid() in (student_id, mentor_id));

-- ── 6. sessions (actual conducted sessions) ──────────────────
create table if not exists public.sessions (
  id              uuid primary key default gen_random_uuid(),
  booking_id      uuid references public.bookings(id) on delete cascade,
  started_at      timestamptz,
  ended_at        timestamptz,
  notes_student   text,
  notes_mentor    text,
  recording_url   text,
  created_at      timestamptz not null default now()
);

alter table public.sessions enable row level security;
create policy "sessions_select_participants" on public.sessions for select using (
  exists (select 1 from public.bookings b where b.id = sessions.booking_id and auth.uid() in (b.student_id, b.mentor_id))
);
create policy "sessions_insert_participants" on public.sessions for insert with check (
  exists (select 1 from public.bookings b where b.id = sessions.booking_id and auth.uid() in (b.student_id, b.mentor_id))
);
create policy "sessions_update_participants" on public.sessions for update using (
  exists (select 1 from public.bookings b where b.id = sessions.booking_id and auth.uid() in (b.student_id, b.mentor_id))
);

-- ── 7. reviews ────────────────────────────────────────────────
create table if not exists public.reviews (
  id            uuid primary key default gen_random_uuid(),
  session_id    uuid references public.sessions(id) on delete set null,
  reviewer_id   uuid not null references public.profiles(id) on delete cascade,
  reviewee_id   uuid not null references public.profiles(id) on delete cascade,
  rating        integer not null check (rating between 1 and 5),
  text          text,
  reply         text,
  reply_date    timestamptz,
  created_at    timestamptz not null default now()
);

alter table public.reviews enable row level security;
create policy "reviews_select_public" on public.reviews for select using (true);
create policy "reviews_insert_reviewer" on public.reviews for insert with check (auth.uid() = reviewer_id);
create policy "reviews_update_reviewee" on public.reviews for update using (auth.uid() = reviewee_id);

-- ── 8. posts ──────────────────────────────────────────────────
create table if not exists public.posts (
  id            uuid primary key default gen_random_uuid(),
  author_id     uuid not null references public.profiles(id) on delete cascade,
  community     text not null default 'world',
  content       text not null,
  image_url     text,
  tag           text,
  likes_count   integer not null default 0,
  replies_count integer not null default 0,
  reposts_count integer not null default 0,
  bookmarks_count integer not null default 0,
  created_at    timestamptz not null default now()
);

alter table public.posts enable row level security;
create policy "posts_select_public" on public.posts for select using (true);
create policy "posts_insert_author" on public.posts for insert with check (auth.uid() = author_id);
create policy "posts_update_author" on public.posts for update using (auth.uid() = author_id);
create policy "posts_delete_author" on public.posts for delete using (auth.uid() = author_id);

-- ── 9. post_interactions ─────────────────────────────────────
create table if not exists public.post_interactions (
  post_id    uuid not null references public.posts(id) on delete cascade,
  user_id    uuid not null references public.profiles(id) on delete cascade,
  type       text not null check (type in ('like', 'repost', 'bookmark')),
  created_at timestamptz not null default now(),
  primary key (post_id, user_id, type)
);

alter table public.post_interactions enable row level security;
create policy "post_interactions_select_public" on public.post_interactions for select using (true);
create policy "post_interactions_insert_own"    on public.post_interactions for insert with check (auth.uid() = user_id);
create policy "post_interactions_delete_own"    on public.post_interactions for delete using (auth.uid() = user_id);

-- ── 10. comments (post thread replies) ───────────────────────
create table if not exists public.comments (
  id          uuid primary key default gen_random_uuid(),
  post_id     uuid not null references public.posts(id) on delete cascade,
  author_id   uuid not null references public.profiles(id) on delete cascade,
  content     text not null,
  likes_count integer not null default 0,
  created_at  timestamptz not null default now()
);

alter table public.comments enable row level security;
create policy "comments_select_public" on public.comments for select using (true);
create policy "comments_insert_author" on public.comments for insert with check (auth.uid() = author_id);
create policy "comments_delete_author" on public.comments for delete using (auth.uid() = author_id);

-- ── 11. notifications ─────────────────────────────────────────
create table if not exists public.notifications (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references public.profiles(id) on delete cascade,
  type        text not null,
  title       text not null,
  description text,
  data        jsonb default '{}'::jsonb,
  read        boolean not null default false,
  created_at  timestamptz not null default now()
);

create index if not exists notifications_user_unread_idx on public.notifications(user_id, created_at desc) where read = false;

alter table public.notifications enable row level security;
create policy "notifications_select_own" on public.notifications for select using (auth.uid() = user_id);
create policy "notifications_update_own" on public.notifications for update using (auth.uid() = user_id);

-- ── 12. friends ───────────────────────────────────────────────
create table if not exists public.friends (
  id           uuid primary key default gen_random_uuid(),
  sender_id    uuid not null references public.profiles(id) on delete cascade,
  receiver_id  uuid not null references public.profiles(id) on delete cascade,
  status       text not null default 'pending' check (status in ('pending', 'accepted', 'declined')),
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  unique (sender_id, receiver_id)
);

create trigger friends_set_updated_at before update on public.friends for each row execute procedure public.set_updated_at();

alter table public.friends enable row level security;
create policy "friends_select_participants" on public.friends for select using (auth.uid() in (sender_id, receiver_id));
create policy "friends_insert_sender"       on public.friends for insert with check (auth.uid() = sender_id);
create policy "friends_update_receiver"     on public.friends for update using (auth.uid() = receiver_id);

-- ── 13. interview_sessions ────────────────────────────────────
create table if not exists public.interview_sessions (
  id            uuid primary key default gen_random_uuid(),
  type          text not null check (type in ('peer', 'group', 'coach')),
  initiator_id  uuid not null references public.profiles(id) on delete cascade,
  partner_id    uuid references public.profiles(id) on delete set null,
  config        jsonb default '{}'::jsonb,
  status        text not null default 'pending' check (status in ('pending', 'active', 'completed', 'cancelled')),
  score         integer,
  feedback      jsonb default '{}'::jsonb,
  started_at    timestamptz,
  ended_at      timestamptz,
  created_at    timestamptz not null default now()
);

alter table public.interview_sessions enable row level security;
create policy "interview_sessions_select_participants" on public.interview_sessions for select using (auth.uid() in (initiator_id, partner_id));
create policy "interview_sessions_insert_initiator"   on public.interview_sessions for insert with check (auth.uid() = initiator_id);
create policy "interview_sessions_update_participants" on public.interview_sessions for update using (auth.uid() in (initiator_id, partner_id));

-- ── 14. daily_quotas ──────────────────────────────────────────
create table if not exists public.daily_quotas (
  user_id            uuid not null references public.profiles(id) on delete cascade,
  date               date not null default current_date,
  peer_interviews    integer not null default 0,
  group_interviews   integer not null default 0,
  collab_rooms       integer not null default 0,
  friend_requests    integer not null default 0,
  nova_messages      integer not null default 0,
  primary key (user_id, date)
);

alter table public.daily_quotas enable row level security;
create policy "daily_quotas_select_own" on public.daily_quotas for select using (auth.uid() = user_id);
create policy "daily_quotas_upsert_own" on public.daily_quotas for insert with check (auth.uid() = user_id);
create policy "daily_quotas_update_own" on public.daily_quotas for update using (auth.uid() = user_id);

-- ── 15. transactions (mentor earnings) ────────────────────────
create table if not exists public.transactions (
  id           uuid primary key default gen_random_uuid(),
  booking_id   uuid references public.bookings(id) on delete set null,
  mentor_id    uuid not null references public.profiles(id) on delete cascade,
  amount       integer not null,
  fee          integer not null default 0,
  net          integer not null,
  status       text not null default 'pending' check (status in ('pending', 'paid', 'failed')),
  payout_date  date,
  created_at   timestamptz not null default now()
);

alter table public.transactions enable row level security;
create policy "transactions_select_mentor" on public.transactions for select using (auth.uid() = mentor_id);

-- ── 16. user_notes (productivity tab) ─────────────────────────
create table if not exists public.user_notes (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references public.profiles(id) on delete cascade,
  title       text not null default 'New Note',
  body        text default '',
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create trigger user_notes_set_updated_at before update on public.user_notes for each row execute procedure public.set_updated_at();

alter table public.user_notes enable row level security;
create policy "user_notes_all_own" on public.user_notes for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ── 17. room_messages (live chat) ─────────────────────────────
create table if not exists public.room_messages (
  id          uuid primary key default gen_random_uuid(),
  room_id     uuid not null references public.rooms(id) on delete cascade,
  user_id     uuid not null references public.profiles(id) on delete cascade,
  content     text not null,
  created_at  timestamptz not null default now()
);

create index if not exists room_messages_room_idx on public.room_messages(room_id, created_at);

alter table public.room_messages enable row level security;
create policy "room_messages_select_public" on public.room_messages for select using (true);
create policy "room_messages_insert_own"    on public.room_messages for insert with check (auth.uid() = user_id);

-- ── Realtime publication: enable streaming for required tables ──
alter publication supabase_realtime add table public.rooms;
alter publication supabase_realtime add table public.room_messages;
alter publication supabase_realtime add table public.room_participants;
alter publication supabase_realtime add table public.notifications;
alter publication supabase_realtime add table public.bookings;
alter publication supabase_realtime add table public.posts;
alter publication supabase_realtime add table public.post_interactions;
alter publication supabase_realtime add table public.friends;
