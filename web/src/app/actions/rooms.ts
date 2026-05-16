'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

// Schema mapping (live DB → legacy UI shape, via PostgREST aliases):
//   title          → topic
//   room_type      → mode
//   creator_id FK  → host (profiles join)
// Writes use the real column names.

export async function listActiveRooms() {
  const supabase = await createClient();
  try {
    const { data, error } = await supabase
      .from('rooms')
      .select(
        'id, topic:title, subject, mode:room_type, max_participants, created_at, host:profiles!creator_id(full_name, handle, avatar_url)'
      )
      .eq('is_public', true)
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(50);
    if (error) {
      console.error('[listActiveRooms]', error.message);
      return [];
    }
    return (data ?? []).map((r) => ({ ...r, pomodoro: '25/5' }));
  } catch (err) {
    console.error('[listActiveRooms] threw', err);
    return [];
  }
}

export async function getRoom(id: string) {
  const supabase = await createClient();
  try {
    const { data } = await supabase.from('rooms').select('*').eq('id', id).single();
    return data;
  } catch {
    return null;
  }
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
      creator_id: user.id,
      title: input.topic,
      subject: input.subject,
      room_type: input.mode,
      is_public: input.visibility === 'public',
      max_participants: input.maxParticipants,
      status: 'active',
    })
    .select()
    .single();
  if (error) throw error;
  // room_participants is best-effort; swallow if table/column differs.
  await supabase
    .from('room_participants')
    .insert({ room_id: data.id, user_id: user.id, role: 'host' })
    .then(() => {}, () => {});
  revalidatePath('/home');
  return data;
}

export async function joinRoom(roomId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not signed in');
  await supabase
    .from('room_participants')
    .insert({ room_id: roomId, user_id: user.id, role: 'participant' })
    .then(() => {}, () => {});
}

export async function leaveRoom(roomId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;
  await supabase
    .from('room_participants')
    .delete()
    .eq('room_id', roomId)
    .eq('user_id', user.id)
    .then(() => {}, () => {});
}

export async function listRoomMessages(roomId: string) {
  const supabase = await createClient();
  try {
    const { data } = await supabase
      .from('room_messages')
      .select('*, author:profiles!user_id(full_name, avatar_url)')
      .eq('room_id', roomId)
      .order('created_at')
      .limit(200);
    return data ?? [];
  } catch {
    return [];
  }
}

export async function sendRoomMessage(roomId: string, content: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not signed in');
  if (!content.trim()) return;
  const { error } = await supabase.from('room_messages').insert({ room_id: roomId, user_id: user.id, content });
  if (error) throw error;
}
