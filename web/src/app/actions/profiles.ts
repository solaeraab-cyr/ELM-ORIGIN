'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

// Schema notes:
//   mentor_profiles.user_id is the FK to profiles.id (NOT id).
//   Columns: bio, expertise (text[]), hourly_rate, languages, timezone,
//            availability_status, total_reviews, avg_rating, total_sessions, ...

export async function getMyProfile() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  try {
    const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single();
    return data;
  } catch {
    return null;
  }
}

export async function getProfile(id: string) {
  const supabase = await createClient();
  try {
    const { data } = await supabase.from('profiles').select('*').eq('id', id).single();
    return data;
  } catch {
    return null;
  }
}

export async function updateMyProfile(patch: Record<string, unknown>) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not signed in');
  const { error } = await supabase.from('profiles').update(patch).eq('id', user.id);
  if (error) throw error;
  revalidatePath('/profile');
  revalidatePath('/settings');
}

export async function becomeMentor() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not signed in');
  const { error: profileErr } = await supabase.from('profiles').update({ is_mentor: true }).eq('id', user.id);
  if (profileErr) throw profileErr;
  // Insert empty mentor_profile row if it doesn't exist (user_id is the FK).
  await supabase
    .from('mentor_profiles')
    .insert({ user_id: user.id, availability_status: 'available' })
    .select()
    .single()
    .then(() => {}, () => {});
  revalidatePath('/mentor/dashboard');
}

export async function getMentorProfile(userId: string) {
  const supabase = await createClient();
  try {
    const { data } = await supabase
      .from('mentor_profiles')
      .select('*, profile:profiles!user_id(*)')
      .eq('user_id', userId)
      .single();
    return data;
  } catch {
    return null;
  }
}

export async function updateMentorProfile(patch: Record<string, unknown>) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not signed in');
  const { error } = await supabase.from('mentor_profiles').update(patch).eq('user_id', user.id);
  if (error) throw error;
  revalidatePath('/mentor/profile-edit');
}

export async function listMentors(filters?: { field?: string; minRating?: number; maxPrice?: number; query?: string }) {
  const supabase = await createClient();
  try {
    // Alias avg_rating → rating so existing UI keeps working.
    let q = supabase
      .from('mentor_profiles')
      .select('*, rating:avg_rating, profile:profiles!user_id(*)')
      .eq('availability_status', 'available');
    if (filters?.minRating) q = q.gte('avg_rating', filters.minRating);
    if (filters?.maxPrice) q = q.lte('hourly_rate', filters.maxPrice);
    const { data, error } = await q;
    if (error) {
      console.error('[listMentors]', error.message);
      return [];
    }
    let list = data ?? [];
    if (filters?.field && filters.field !== 'All') {
      list = list.filter(
        (m) => Array.isArray(m.expertise) && (m.expertise as string[]).includes(filters.field!)
      );
    }
    if (filters?.query) {
      const term = filters.query.toLowerCase();
      list = list.filter((m) => {
        const p = m.profile as { full_name?: string | null } | null;
        return (
          p?.full_name?.toLowerCase().includes(term) ||
          (m.bio as string | null)?.toLowerCase().includes(term)
        );
      });
    }
    return list;
  } catch (err) {
    console.error('[listMentors] threw', err);
    return [];
  }
}
