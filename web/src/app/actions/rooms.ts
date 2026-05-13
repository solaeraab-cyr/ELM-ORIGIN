'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function listActiveRooms() {
  const supabase = await createClient();
  const { data } = await supabase
    .from('rooms')
    .select('*, host:profiles!host_id(full_name, handle, avatar_url)')
    .eq('is_active', true)
    .eq('visibility', 'public')
    .order('created_at', { ascending: false })
    .limit(50);
  return data ?? [];
}

export async function getRoom(id: string) {
  const supabase = await createClient();
  const { data } = await supabase.from('rooms').select('*').eq('id', id).single();
  return data;
}

export async function createRoom(input: {
  topic: string;
  subject: string;
  mode: 'focus' | 'discussion' | 'collab' | 'group-interview';
  maxParticipants: number;
  visibility: 'public' | 'private';
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not signed in');
  const { data, error } = await supabase
    .from('rooms')
    .insert({
      topic: input.topic, subject: input.subject, host_id: user.id,
      mode: input.mode, visibility: input.visibility,
      max_participants: input.maxParticipants,
    })
    .select()
    .single();
  if (error) throw error;
  await supabase.from('room_participants').insert({ room_id: data.id, user_id: user.id, role: 'host' });
  revalidatePath('/home');
  return data;
}

export async function joinRoom(roomId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not signed in');
  await supabase.from('room_participants').insert({ room_id: roomId, user_id: user.id, role: 'participant' });
}

export async function leaveRoom(roomId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;
  await supabase.from('room_participants').delete().eq('room_id', roomId).eq('user_id', user.id);
}

export async function listRoomMessages(roomId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from('room_messages')
    .select('*, author:profiles!user_id(full_name, avatar_url)')
    .eq('room_id', roomId)
    .order('created_at')
    .limit(200);
  return data ?? [];
}

export async function sendRoomMessage(roomId: string, content: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not signed in');
  if (!content.trim()) return;
  const { error } = await supabase.from('room_messages').insert({ room_id: roomId, user_id: user.id, content });
  if (error) throw error;
}
