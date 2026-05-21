-- planner_tasks: simple per-user task list
create table if not exists public.planner_tasks (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  title       text not null,
  due_date    date not null default current_date,
  due_time    time,
  is_complete boolean not null default false,
  created_at  timestamptz not null default now()
);

create index if not exists planner_tasks_user_due_idx
  on public.planner_tasks (user_id, due_date);

alter table public.planner_tasks enable row level security;

drop policy if exists planner_tasks_select_own on public.planner_tasks;
create policy planner_tasks_select_own on public.planner_tasks
  for select using (auth.uid() = user_id);

drop policy if exists planner_tasks_insert_own on public.planner_tasks;
create policy planner_tasks_insert_own on public.planner_tasks
  for insert with check (auth.uid() = user_id);

drop policy if exists planner_tasks_update_own on public.planner_tasks;
create policy planner_tasks_update_own on public.planner_tasks
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists planner_tasks_delete_own on public.planner_tasks;
create policy planner_tasks_delete_own on public.planner_tasks
  for delete using (auth.uid() = user_id);


-- user_communities: which static community ids a user has joined
create table if not exists public.user_communities (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references auth.users(id) on delete cascade,
  community_id text not null,
  joined_at    timestamptz not null default now(),
  unique (user_id, community_id)
);

alter table public.user_communities enable row level security;

drop policy if exists user_communities_select_own on public.user_communities;
create policy user_communities_select_own on public.user_communities
  for select using (auth.uid() = user_id);

drop policy if exists user_communities_insert_own on public.user_communities;
create policy user_communities_insert_own on public.user_communities
  for insert with check (auth.uid() = user_id);

drop policy if exists user_communities_delete_own on public.user_communities;
create policy user_communities_delete_own on public.user_communities
  for delete using (auth.uid() = user_id);


-- event_rsvps: which static event ids a user has RSVP'd to
create table if not exists public.event_rsvps (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users(id) on delete cascade,
  event_id   text not null,
  rsvped_at  timestamptz not null default now(),
  unique (user_id, event_id)
);

alter table public.event_rsvps enable row level security;

drop policy if exists event_rsvps_select_own on public.event_rsvps;
create policy event_rsvps_select_own on public.event_rsvps
  for select using (auth.uid() = user_id);

drop policy if exists event_rsvps_insert_own on public.event_rsvps;
create policy event_rsvps_insert_own on public.event_rsvps
  for insert with check (auth.uid() = user_id);

drop policy if exists event_rsvps_delete_own on public.event_rsvps;
create policy event_rsvps_delete_own on public.event_rsvps
  for delete using (auth.uid() = user_id);
