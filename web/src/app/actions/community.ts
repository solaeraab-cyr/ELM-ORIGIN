'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function listJoinedCommunityIds(): Promise<string[]> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];
  const { data } = await supabase
    .from('user_communities')
    .select('community_id')
    .eq('user_id', user.id);
  return (data ?? []).map((r) => r.community_id);
}

export async function joinCommunity(communityId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not signed in');

  const { error } = await supabase
    .from('user_communities')
    .insert({ user_id: user.id, community_id: communityId });

  // Treat the unique-violation as a no-op so re-clicks don't blow up.
  if (error && error.code !== '23505') throw new Error(error.message);
  revalidatePath('/community');
}

export async function listRsvpedEventIds(): Promise<string[]> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];
  const { data } = await supabase
    .from('event_rsvps')
    .select('event_id')
    .eq('user_id', user.id);
  return (data ?? []).map((r) => r.event_id);
}

export async function toggleEventRsvp(eventId: string, rsvped: boolean) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not signed in');

  if (rsvped) {
    const { error } = await supabase
      .from('event_rsvps')
      .insert({ user_id: user.id, event_id: eventId });
    if (error && error.code !== '23505') throw new Error(error.message);
  } else {
    const { error } = await supabase
      .from('event_rsvps')
      .delete()
      .eq('user_id', user.id)
      .eq('event_id', eventId);
    if (error) throw new Error(error.message);
  }
  revalidatePath('/community');
}
