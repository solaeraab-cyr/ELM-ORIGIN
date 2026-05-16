'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

const PLAN_MONTHLY_LIMITS: Record<string, number> = {
  Free: 5,
  Pro: 25,
  Elite: Infinity,
};

async function getMonthlyFriendRequestCount(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
): Promise<number> {
  const firstDay = new Date();
  firstDay.setDate(1);
  const { data } = await supabase
    .from('daily_quotas')
    .select('friend_requests')
    .eq('user_id', userId)
    .gte('date', firstDay.toISOString().slice(0, 10));
  return (data ?? []).reduce((sum, row) => sum + (row.friend_requests ?? 0), 0);
}

export async function sendFriendRequest(receiverId: string) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not signed in');
    if (receiverId === user.id) throw new Error('Cannot friend yourself');

    // Check existing relationship
    const { data: existing } = await supabase
      .from('friends')
      .select('id, status')
      .or(`and(sender_id.eq.${user.id},receiver_id.eq.${receiverId}),and(sender_id.eq.${receiverId},receiver_id.eq.${user.id})`)
      .maybeSingle();
    if (existing) {
      if (existing.status === 'accepted') throw new Error('Already friends');
      if (existing.status === 'pending') throw new Error('Request already sent');
    }

    // Check monthly quota
    const { data: profile } = await supabase
      .from('profiles')
      .select('plan')
      .eq('id', user.id)
      .single();
    const plan = profile?.plan ?? 'Free';
    const limit = PLAN_MONTHLY_LIMITS[plan] ?? 5;
    if (limit !== Infinity) {
      const used = await getMonthlyFriendRequestCount(supabase, user.id);
      if (used >= limit) throw new Error(`Monthly friend request limit reached (${limit} for ${plan} plan)`);
    }

    const { error } = await supabase
      .from('friends')
      .insert({ sender_id: user.id, receiver_id: receiverId, status: 'pending' });
    if (error) throw error;

    // Increment daily quota
    const today = new Date().toISOString().slice(0, 10);
    const { data: quotaRow } = await supabase
      .from('daily_quotas')
      .select('friend_requests')
      .eq('user_id', user.id)
      .eq('date', today)
      .maybeSingle();
    if (quotaRow) {
      await supabase.from('daily_quotas').update({ friend_requests: (quotaRow.friend_requests ?? 0) + 1 }).eq('user_id', user.id).eq('date', today);
    } else {
      await supabase.from('daily_quotas').insert({ user_id: user.id, date: today, friend_requests: 1 });
    }

    // Notify receiver
    await supabase.from('notifications').insert({
      user_id: receiverId,
      type: 'friend_request',
      title: 'New friend request',
      description: '',
      data: { sender_id: user.id },
    });

    revalidatePath('/friends');
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : String(err) };
  }
}

export async function acceptFriendRequest(requestId: string) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not signed in');

    const { error } = await supabase
      .from('friends')
      .update({ status: 'accepted' })
      .eq('id', requestId)
      .eq('receiver_id', user.id);
    if (error) throw error;

    revalidatePath('/friends');
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : String(err) };
  }
}

export async function rejectFriendRequest(requestId: string) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not signed in');

    const { error } = await supabase
      .from('friends')
      .update({ status: 'declined' })
      .eq('id', requestId)
      .eq('receiver_id', user.id);
    if (error) throw error;

    revalidatePath('/friends');
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : String(err) };
  }
}

export async function removeFriend(friendRowId: string) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not signed in');

    const { error } = await supabase
      .from('friends')
      .delete()
      .eq('id', friendRowId)
      .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`);
    if (error) throw error;

    revalidatePath('/friends');
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : String(err) };
  }
}

export async function listFriends() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data } = await supabase
      .from('friends')
      .select('id, sender_id, receiver_id, created_at, sender:profiles!sender_id(id,full_name,handle,avatar_url,plan), receiver:profiles!receiver_id(id,full_name,handle,avatar_url,plan)')
      .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
      .eq('status', 'accepted');
    return (data ?? []).map((row) => {
      const friend = row.sender_id === user.id ? row.receiver : row.sender;
      return { id: row.id, friend: friend as unknown as { id: string; full_name: string | null; handle: string | null; avatar_url: string | null; plan: string }, since: row.created_at };
    });
  } catch {
    return [];
  }
}

export async function listPendingRequests() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data } = await supabase
      .from('friends')
      .select('id, created_at, sender:profiles!sender_id(id,full_name,handle,avatar_url,plan)')
      .eq('receiver_id', user.id)
      .eq('status', 'pending');
    return (data ?? []).map((row) => ({
      id: row.id,
      sender: row.sender as unknown as { id: string; full_name: string | null; handle: string | null; avatar_url: string | null; plan: string },
      created_at: row.created_at,
    }));
  } catch {
    return [];
  }
}

export async function listSentRequests() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data } = await supabase
      .from('friends')
      .select('id, created_at, receiver:profiles!receiver_id(id,full_name,handle,avatar_url,plan)')
      .eq('sender_id', user.id)
      .eq('status', 'pending');
    return (data ?? []).map((row) => ({
      id: row.id,
      receiver: row.receiver as unknown as { id: string; full_name: string | null; handle: string | null; avatar_url: string | null; plan: string },
      created_at: row.created_at,
    }));
  } catch {
    return [];
  }
}

export async function checkFriendStatus(otherUserId: string): Promise<'none' | 'pending_sent' | 'pending_received' | 'accepted' | 'declined'> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return 'none';

    const { data } = await supabase
      .from('friends')
      .select('sender_id, status')
      .or(`and(sender_id.eq.${user.id},receiver_id.eq.${otherUserId}),and(sender_id.eq.${otherUserId},receiver_id.eq.${user.id})`)
      .maybeSingle();

    if (!data) return 'none';
    if (data.status === 'accepted') return 'accepted';
    if (data.status === 'declined') return 'declined';
    if (data.status === 'pending') {
      return data.sender_id === user.id ? 'pending_sent' : 'pending_received';
    }
    return 'none';
  } catch {
    return 'none';
  }
}

export async function searchProfiles(query: string) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || !query.trim()) return [];

    const q = query.trim();
    const { data } = await supabase
      .from('profiles')
      .select('id, full_name, handle, avatar_url, plan, is_mentor')
      .neq('id', user.id)
      .or(`full_name.ilike.%${q}%,handle.ilike.%${q}%`)
      .limit(20);
    return data ?? [];
  } catch {
    return [];
  }
}

export async function getPendingRequestCount(): Promise<number> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return 0;

    const { count } = await supabase
      .from('friends')
      .select('*', { count: 'exact', head: true })
      .eq('receiver_id', user.id)
      .eq('status', 'pending');
    return count ?? 0;
  } catch {
    return 0;
  }
}
