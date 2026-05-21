-- ═══════════════════════════════════════════════════════════════
-- Feeds & follows: extend posts, add follows, RLS, indexes.
-- Posts already exists (migration 001) with the live shape:
--   author_id, visibility, content, tags[], like_count, comment_count.
-- Don't rename those columns — legacy code in src/app/actions/posts.ts
-- maps them via PostgREST aliases. Just add what's missing.
-- ═══════════════════════════════════════════════════════════════

-- 1) updated_at on posts (was missing in 001)
alter table public.posts
  add column if not exists updated_at timestamptz not null default now();

-- 2) Indexes for feed queries
create index if not exists posts_visibility_created_idx
  on public.posts (visibility, created_at desc);

create index if not exists posts_created_idx
  on public.posts (created_at desc);

-- 3) follows table — user/community/mentor follows in one table
create table if not exists public.follows (
  id           uuid primary key default gen_random_uuid(),
  follower_id  uuid not null references auth.users(id) on delete cascade,
  target_type  text not null check (target_type in ('user', 'community', 'mentor')),
  target_id    text not null,
  created_at   timestamptz not null default now(),
  unique (follower_id, target_type, target_id)
);

create index if not exists follows_follower_type_idx
  on public.follows (follower_id, target_type);

alter table public.follows enable row level security;

drop policy if exists follows_select_own on public.follows;
create policy follows_select_own on public.follows
  for select using (auth.uid() = follower_id);

drop policy if exists follows_insert_own on public.follows;
create policy follows_insert_own on public.follows
  for insert with check (auth.uid() = follower_id);

drop policy if exists follows_delete_own on public.follows;
create policy follows_delete_own on public.follows
  for delete using (auth.uid() = follower_id);

-- 4) Re-assert posts RLS to match the spec (idempotent — drops and recreates)
alter table public.posts enable row level security;

drop policy if exists posts_select_public on public.posts;
create policy posts_select_public on public.posts
  for select using (true);

drop policy if exists posts_insert_author on public.posts;
create policy posts_insert_author on public.posts
  for insert with check (auth.uid() = author_id);

drop policy if exists posts_update_author on public.posts;
create policy posts_update_author on public.posts
  for update using (auth.uid() = author_id);

drop policy if exists posts_delete_author on public.posts;
create policy posts_delete_author on public.posts
  for delete using (auth.uid() = author_id);
