-- Elm Origin — Phase 1A Database Schema
-- Apply via Supabase SQL Editor

-- Profiles table (mirrors auth.users, one row per user)
create table public.profiles (
  id            uuid        references auth.users on delete cascade primary key,
  email         text        not null,
  full_name     text,
  handle        text        unique,
  avatar_url    text,
  bio           text,
  plan          text        not null default 'Free' check (plan in ('Free', 'Pro', 'Elite')),
  is_mentor     boolean     not null default false,
  streak        integer     not null default 0,
  xp            integer     not null default 0,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- Auto-insert a profile row whenever a new user signs up
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, is_mentor)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    coalesce((new.raw_user_meta_data->>'is_mentor')::boolean, false)
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Auto-update updated_at on row change
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute procedure public.set_updated_at();

-- Row Level Security
alter table public.profiles enable row level security;

-- Anyone can read any profile (public feed, mentor listings, etc.)
create policy "profiles_select_public"
  on public.profiles for select
  using (true);

-- Users can only update their own profile
create policy "profiles_update_own"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- Profiles are inserted only by the trigger (service role bypasses RLS)
-- No insert policy needed for regular users
