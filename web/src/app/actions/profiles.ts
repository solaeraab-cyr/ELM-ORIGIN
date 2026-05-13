'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function getMyProfile() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single();
  return data;
}

export async function getProfile(id: string) {
  const supabase = await createClient();
  const { data } = await supabase.from('profiles').select('*').eq('id', id).single();
  return data;
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
  // Insert empty mentor_profile row if it doesn't exist
  await supabase.from('mentor_profiles').insert({ id: user.id }).select().single();
  revalidatePath('/mentor/dashboard');
}

export async function getMentorProfile(id: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from('mentor_profiles')
    .select('*, profile:profiles(*)')
    .eq('id', id)
    .single();
  return data;
}

export async function updateMentorProfile(patch: Record<string, unknown>) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not signed in');
  const { error } = await supabase.from('mentor_profiles').update(patch).eq('id', user.id);
  if (error) throw error;
  revalidatePath('/mentor/profile-edit');
}

export async function listMentors(filters?: { field?: string; minRating?: number; maxPrice?: number; query?: string }) {
  const supabase = await createClient();
  let q = supabase
    .from('mentor_profiles')
    .select('*, profile:profiles!inner(*)')
    .eq('accepting_bookings', true);
  if (filters?.minRating) q = q.gte('rating', filters.minRating);
  const { data } = await q;
  if (!data) return [];
  let list = data;
  if (filters?.field && filters.field !== 'All') {
    list = list.filter(m => Array.isArray(m.subjects) && (m.subjects as string[]).includes(filters.field!));
  }
  if (filters?.query) {
    const term = filters.query.toLowerCase();
    list = list.filter(m => {
      const p = m.profile as { full_name?: string | null } | null;
      return (p?.full_name?.toLowerCase().includes(term) || m.headline?.toLowerCase().includes(term));
    });
  }
  return list;
}
