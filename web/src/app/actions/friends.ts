'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function listMyFriends() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];
  const { data } = await supabase
    .from('friends')
    .select('*, sender:profiles!sender_id(*), receiver:profiles!receiver_id(*)')
    .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
    .eq('status', 'accepted');
  return data ?? [];
}

export async function listPendingRequests() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];
  const { data } = await supabase
    .from('friends')
    .select('*, sender:profiles!sender_id(*)')
    .eq('receiver_id', user.id)
    .eq('status', 'pending');
  return data ?? [];
}

export async function sendFriendRequest(receiverId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not signed in');
  if (receiverId === user.id) throw new Error('Cannot friend yourself');
  await supabase.from('friends').insert({ sender_id: user.id, receiver_id: receiverId, status: 'pending' });
  await supabase.from('notifications').insert({
    user_id: receiverId,
    type: 'friend_request',
    title: 'New friend request',
    description: '',
    data: { sender_id: user.id },
  });
  revalidatePath('/community');
}

export async function respondToFriendRequest(requestId: string, accept: boolean) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not signed in');
  await supabase.from('friends').update({ status: accept ? 'accepted' : 'declined' }).eq('id', requestId).eq('receiver_id', user.id);
  revalidatePath('/community');
}
