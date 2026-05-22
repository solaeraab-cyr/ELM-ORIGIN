-- ═══════════════════════════════════════════════════════════════
-- Elm Origin — Allow participants to delete their friends row
-- (Needed for rejectFriendRequest and removeFriend.)
-- Safe to run multiple times.
-- ═══════════════════════════════════════════════════════════════

do $$ begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename  = 'friends'
      and policyname = 'friends_delete_participants'
  ) then
    execute 'create policy "friends_delete_participants" on public.friends for delete using (auth.uid() in (sender_id, receiver_id))';
  end if;
end $$;
