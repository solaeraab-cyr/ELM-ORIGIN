'use server';

// Meeting notes for a video room.
//
// The live `notes` table (migration 006) has columns:
//   id, user_id, title, body, updated_at, created_at
// There is no room_id / content column, so we associate a note with a room
// by storing a stable marker in `title` ("Meeting · <roomKey>") and the text
// in `body`. This keeps notes in Supabase (and visible from the Notes UI)
// while adapting to the real schema. The client also mirrors to localStorage
// as an offline fallback.

import { createClient } from '@/lib/supabase/server';

const titleFor = (roomKey: string) => `Meeting · ${roomKey}`;

export async function loadRoomNote(roomKey: string): Promise<{ ok: boolean; content: string; updatedAt: string | null }> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { ok: false, content: '', updatedAt: null };

    const { data } = await supabase
      .from('notes')
      .select('body, updated_at')
      .eq('user_id', user.id)
      .eq('title', titleFor(roomKey))
      .order('updated_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    return { ok: true, content: (data?.body as string | null) ?? '', updatedAt: (data?.updated_at as string | null) ?? null };
  } catch {
    return { ok: false, content: '', updatedAt: null };
  }
}

export async function saveRoomNote(roomKey: string, content: string): Promise<{ ok: boolean; updatedAt: string | null }> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { ok: false, updatedAt: null };

    const title = titleFor(roomKey);
    const { data: existing } = await supabase
      .from('notes')
      .select('id')
      .eq('user_id', user.id)
      .eq('title', title)
      .limit(1)
      .maybeSingle();

    const now = new Date().toISOString();

    if (existing?.id) {
      const { error } = await supabase
        .from('notes')
        .update({ body: content, updated_at: now })
        .eq('id', existing.id);
      if (error) throw error;
    } else {
      const { error } = await supabase
        .from('notes')
        .insert({ user_id: user.id, title, body: content, updated_at: now });
      if (error) throw error;
    }

    return { ok: true, updatedAt: now };
  } catch {
    return { ok: false, updatedAt: null };
  }
}
