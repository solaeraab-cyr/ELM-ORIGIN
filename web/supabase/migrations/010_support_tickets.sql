-- ═══════════════════════════════════════════════════════════════
-- Elm Origin — Hybrid customer support: support_tickets table
-- ═══════════════════════════════════════════════════════════════

create table if not exists public.support_tickets (
  id                  uuid primary key default gen_random_uuid(),
  user_id             uuid references public.profiles(id) on delete set null,
  name                text not null,
  email               text not null,
  message             text not null,
  ai_conversation_log jsonb,
  status              text not null default 'open'
                        check (status in ('open','in_progress','resolved')),
  created_at          timestamptz not null default now(),
  resolved_at         timestamptz
);

create index if not exists support_tickets_status_idx
  on public.support_tickets (status, created_at desc);
create index if not exists support_tickets_user_idx
  on public.support_tickets (user_id);

alter table public.support_tickets enable row level security;

do $$ begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename  = 'support_tickets'
      and policyname = 'support_tickets_insert_any'
  ) then
    execute 'create policy "support_tickets_insert_any" on public.support_tickets
             for insert with check (
               user_id is null or user_id = auth.uid()
             )';
  end if;
end $$;

-- No public select policy — service role bypasses RLS.
