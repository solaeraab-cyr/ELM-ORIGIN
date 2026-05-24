'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { parseRoomCode } from '@/lib/roomCode';

// Live `rooms` schema (real columns):
//   id, creator_id, title, subject, description, duration_minutes,
//   max_participants, is_public, requires_approval,
//   room_type CHECK ('study' | 'collaboration'),
//   scheduled_for, status CHECK ('active'|'archived'|'cancelled'),
//   created_at, updated_at
// room_participants: room_id, user_id, role ('host'|'participant'), joined_at
// room_messages: id, room_id, user_id, content, created_at

export type RoomType = 'study' | 'collaboration';

export type RoomCard = {
  id: string;
  creator_id: string;
  title: string;
  subject: string | null;
  description: string | null;
  room_type: RoomType;
  is_public: boolean;
  requires_approval: boolean;
  max_participants: number;
  duration_minutes: number | null;
  status: string;
  created_at: string;
  scheduled_for: string | null;
  participant_count: number;
  host: { full_name: string | null; handle: string | null; avatar_url: string | null } | null;
};

const ROOM_SELECT =
  'id, creator_id, title, subject, description, room_type, is_public, requires_approval, max_participants, duration_minutes, status, created_at, scheduled_for, host:profiles!creator_id(full_name, handle, avatar_url)';

async function attachCounts(
  supabase: Awaited<ReturnType<typeof createClient>>,
  rooms: Omit<RoomCard, 'participant_count'>[],
): Promise<RoomCard[]> {
  if (rooms.length === 0) return [];
  const ids = rooms.map(r => r.id);
  const counts: Record<string, number> = {};
  const { data } = await supabase
    .from('room_participants')
    .select('room_id')
    .in('room_id', ids);
  for (const row of data ?? []) counts[row.room_id] = (counts[row.room_id] ?? 0) + 1;
  return rooms.map(r => ({ ...r, participant_count: counts[r.id] ?? 0 }));
}

export async function listActiveRooms(): Promise<RoomCard[]> {
  const supabase = await createClient();
  try {
    const { data, error } = await supabase
      .from('rooms')
      .select(ROOM_SELECT)
      .eq('is_public', true)
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(50);
    if (error) {
      console.error('[listActiveRooms]', error.message);
      return [];
    }
    return attachCounts(supabase, (data ?? []) as unknown as Omit<RoomCard, 'participant_count'>[]);
  } catch (err) {
    console.error('[listActiveRooms] threw', err);
    return [];
  }
}

// Upcoming public rooms with a future scheduled_for time.
export async function listScheduledRooms(): Promise<RoomCard[]> {
  const supabase = await createClient();
  try {
    const { data, error } = await supabase
      .from('rooms')
      .select(ROOM_SELECT)
      .eq('is_public', true)
      .eq('status', 'active')
      .not('scheduled_for', 'is', null)
      .gt('scheduled_for', new Date().toISOString())
      .order('scheduled_for', { ascending: true })
      .limit(50);
    if (error) {
      console.error('[listScheduledRooms]', error.message);
      return [];
    }
    return attachCounts(supabase, (data ?? []) as unknown as Omit<RoomCard, 'participant_count'>[]);
  } catch (err) {
    console.error('[listScheduledRooms] threw', err);
    return [];
  }
}

// Resolve a shared room code (e.g. "ELM-A3F8C2") to a room id. Matches the
// code against the leading hex of active room ids. Returns null if no match.
export async function findRoomByCode(code: string): Promise<{ id: string } | null> {
  const prefix = parseRoomCode(code);
  if (!prefix) return null;
  const supabase = await createClient();
  try {
    const { data, error } = await supabase
      .from('rooms')
      .select('id')
      .eq('status', 'active')
      .limit(1000);
    if (error) {
      console.error('[findRoomByCode]', error.message);
      return null;
    }
    const match = (data ?? []).find(r => (r.id as string).replace(/-/g, '').toLowerCase().startsWith(prefix));
    return match ? { id: match.id as string } : null;
  } catch (err) {
    console.error('[findRoomByCode] threw', err);
    return null;
  }
}

// Rooms the current user created OR is a participant in (includes private).
export async function listMyRooms(): Promise<RoomCard[]> {
  const supabase = await createClient();
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];
    const { data: parts } = await supabase
      .from('room_participants')
      .select('room_id')
      .eq('user_id', user.id);
    const joinedIds = (parts ?? []).map(p => p.room_id);

    // creator rooms OR joined rooms, active only, dedup by id
    const orFilter = joinedIds.length > 0
      ? `creator_id.eq.${user.id},id.in.(${joinedIds.join(',')})`
      : `creator_id.eq.${user.id}`;

    const { data, error } = await supabase
      .from('rooms')
      .select(ROOM_SELECT)
      .eq('status', 'active')
      .or(orFilter)
      .order('created_at', { ascending: false })
      .limit(50);
    if (error) {
      console.error('[listMyRooms]', error.message);
      return [];
    }
    return attachCounts(supabase, (data ?? []) as unknown as Omit<RoomCard, 'participant_count'>[]);
  } catch (err) {
    console.error('[listMyRooms] threw', err);
    return [];
  }
}

export type RoomDetail = RoomCard & {
  amICreator: boolean;
  amIParticipant: boolean;
  isFull: boolean;
};

export async function getRoomDetail(id: string): Promise<RoomDetail | null> {
  const supabase = await createClient();
  try {
    const { data, error } = await supabase.from('rooms').select(ROOM_SELECT).eq('id', id).single();
    if (error || !data) return null;
    const { data: { user } } = await supabase.auth.getUser();
    const { data: parts } = await supabase
      .from('room_participants')
      .select('user_id')
      .eq('room_id', id);
    const participantIds = (parts ?? []).map(p => p.user_id);
    const room = data as unknown as Omit<RoomCard, 'participant_count'>;
    const participant_count = participantIds.length;
    return {
      ...room,
      participant_count,
      amICreator: !!user && room.creator_id === user.id,
      amIParticipant: !!user && participantIds.includes(user.id),
      isFull: participant_count >= room.max_participants,
    };
  } catch (err) {
    console.error('[getRoomDetail] threw', err);
    return null;
  }
}

// Kept for backward-compat (raw row).
export async function getRoom(id: string) {
  const supabase = await createClient();
  try {
    const { data } = await supabase.from('rooms').select('*').eq('id', id).single();
    return data;
  } catch {
    return null;
  }
}

export type CreateRoomResult =
  | { ok: true; id: string }
  | { ok: false; error: string };

export async function createRoom(input: {
  title: string;
  subject: string;
  description?: string;
  roomType: RoomType;
  visibility: 'public' | 'private';
  maxParticipants: number;
  durationMinutes: number;
  requiresApproval?: boolean;
}): Promise<CreateRoomResult> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: 'Not signed in' };

  const title = input.title.trim();
  const subject = input.subject.trim();
  if (!title) return { ok: false, error: 'Title is required' };
  if (!subject) return { ok: false, error: 'Subject is required' };

  const { data, error } = await supabase
    .from('rooms')
    .insert({
      creator_id: user.id,
      title,
      subject,
      description: input.description?.trim() || null,
      room_type: input.roomType,                 // 'study' | 'collaboration' — matches CHECK
      is_public: input.visibility === 'public',
      requires_approval: input.requiresApproval ?? false,
      max_participants: input.maxParticipants,
      duration_minutes: input.durationMinutes,
      status: 'active',
    })
    .select('id')
    .single();
  if (error || !data) {
    console.error('[createRoom]', error?.message);
    return { ok: false, error: error?.message || 'Could not create room' };
  }

  // Add the creator as host participant. Log failures rather than swallowing
  // them silently — an RLS gap here was invisible for a long time.
  const { error: partErr } = await supabase
    .from('room_participants')
    .insert({ room_id: data.id, user_id: user.id, role: 'host' });
  if (partErr) console.error('[createRoom] host participant insert', partErr.message);

  revalidatePath('/home');
  revalidatePath('/rooms');
  return { ok: true, id: data.id };
}

export type JoinResult = 'joined' | 'already' | 'full' | 'pending' | 'error';

export async function joinRoom(roomId: string): Promise<JoinResult> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return 'error';

  const { data: room } = await supabase
    .from('rooms')
    .select('creator_id, max_participants, requires_approval')
    .eq('id', roomId)
    .single();
  if (!room) return 'error';

  const { data: existing } = await supabase
    .from('room_participants')
    .select('user_id')
    .eq('room_id', roomId);
  const ids = (existing ?? []).map(p => p.user_id);
  if (ids.includes(user.id)) return 'already';
  if (room.creator_id === user.id) {
    // creator should always be a participant; ensure the row exists
    await supabase.from('room_participants').insert({ room_id: roomId, user_id: user.id, role: 'host' }).then(() => {}, () => {});
    return 'joined';
  }
  if (ids.length >= room.max_participants) return 'full';

  // requires_approval can't be queued in the current schema (no 'pending'
  // participant state), so surface a pending status without inserting.
  if (room.requires_approval) return 'pending';

  const { error } = await supabase
    .from('room_participants')
    .insert({ room_id: roomId, user_id: user.id, role: 'participant' });
  if (error) {
    console.error('[joinRoom]', error.message);
    return 'error';
  }
  revalidatePath('/home');
  return 'joined';
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

// ── Global search (rooms by title/subject + mentors by name) ──────
export type SearchResults = {
  rooms: { id: string; title: string; subject: string | null }[];
  mentors: { id: string; full_name: string | null; handle: string | null }[];
};

export async function searchAll(query: string): Promise<SearchResults> {
  const q = query.trim();
  if (q.length < 2) return { rooms: [], mentors: [] };
  const supabase = await createClient();
  const like = `%${q}%`;

  const [{ data: rooms }, { data: mentors }] = await Promise.all([
    supabase
      .from('rooms')
      .select('id, title, subject')
      .eq('is_public', true)
      .eq('status', 'active')
      .or(`title.ilike.${like},subject.ilike.${like}`)
      .limit(6),
    supabase
      .from('profiles')
      .select('id, full_name, handle')
      .eq('is_mentor', true)
      .or(`full_name.ilike.${like},handle.ilike.${like}`)
      .limit(6),
  ]);

  return {
    rooms: (rooms ?? []) as SearchResults['rooms'],
    mentors: (mentors ?? []) as SearchResults['mentors'],
  };
}

// ── Chat (private rooms) ──────────────────────────────────────────
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
