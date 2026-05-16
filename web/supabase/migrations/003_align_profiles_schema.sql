-- ═══════════════════════════════════════════════════════════════
-- Elm Origin — Align live profiles table to app expectations
-- Safe to run multiple times (all changes use IF NOT EXISTS /
-- DO NOTHING patterns).
-- ═══════════════════════════════════════════════════════════════

-- 1. Add full_name if missing (live DB may have display_name instead).
alter table public.profiles
  add column if not exists full_name text;

-- 2. If display_name exists, copy its values into full_name then drop it.
do $$ begin
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public'
      and table_name   = 'profiles'
      and column_name  = 'display_name'
  ) then
    update public.profiles
      set full_name = display_name
      where full_name is null and display_name is not null;

    alter table public.profiles drop column if exists display_name;
  end if;
end $$;

-- 3. Add every other column the app code references.
alter table public.profiles
  add column if not exists handle     text unique,
  add column if not exists avatar_url text,
  add column if not exists bio        text,
  add column if not exists plan       text not null default 'Free',
  add column if not exists is_mentor  boolean not null default false,
  add column if not exists streak     integer not null default 0,
  add column if not exists xp         integer not null default 0,
  add column if not exists field      text,
  add column if not exists year       text,
  add column if not exists institution text,
  add column if not exists cover_gradient text default 'brand',
  add column if not exists badges     jsonb default '[]'::jsonb;

-- 4. Ensure updated_at trigger exists.
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

do $$ begin
  if not exists (
    select 1 from pg_trigger
    where tgname = 'profiles_set_updated_at'
      and tgrelid = 'public.profiles'::regclass
  ) then
    execute 'create trigger profiles_set_updated_at
      before update on public.profiles
      for each row execute procedure public.set_updated_at()';
  end if;
end $$;

-- 5. Ensure auto-profile trigger exists so new sign-ups get a row.
create or replace function public.handle_new_user()
returns trigger language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, is_mentor)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    coalesce((new.raw_user_meta_data->>'is_mentor')::boolean, false)
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

do $$ begin
  if not exists (
    select 1 from pg_trigger
    where tgname = 'on_auth_user_created'
      and tgrelid = 'auth.users'::regclass
  ) then
    execute 'create trigger on_auth_user_created
      after insert on auth.users
      for each row execute procedure public.handle_new_user()';
  end if;
end $$;

-- 6. RLS (idempotent — create policy only if missing).
alter table public.profiles enable row level security;

do $$ begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'profiles'
      and policyname = 'profiles_select_public'
  ) then
    execute 'create policy profiles_select_public on public.profiles for select using (true)';
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'profiles'
      and policyname = 'profiles_update_own'
  ) then
    execute 'create policy profiles_update_own on public.profiles for update
      using (auth.uid() = id) with check (auth.uid() = id)';
  end if;
end $$;
