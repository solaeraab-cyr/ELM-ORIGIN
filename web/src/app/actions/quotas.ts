'use server';

import { createClient } from '@/lib/supabase/server';

export async function getMyQuotaToday() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const today = new Date().toISOString().slice(0, 10);
  const { data } = await supabase
    .from('daily_quotas')
    .select('*')
    .eq('user_id', user.id)
    .eq('date', today)
    .maybeSingle();
  if (data) return data;
  // Initialise row for today
  const { data: inserted } = await supabase
    .from('daily_quotas')
    .insert({ user_id: user.id, date: today })
    .select()
    .single();
  return inserted;
}

export async function incrementQuota(field: 'peer_interviews' | 'group_interviews' | 'collab_rooms' | 'friend_requests' | 'nova_messages') {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not signed in');
  const today = new Date().toISOString().slice(0, 10);
  const { data: existing } = await supabase
    .from('daily_quotas')
    .select(field)
    .eq('user_id', user.id)
    .eq('date', today)
    .maybeSingle();
  const current = (existing as Record<string, number> | null)?.[field] ?? 0;
  if (existing) {
    await supabase.from('daily_quotas').update({ [field]: current + 1 }).eq('user_id', user.id).eq('date', today);
  } else {
    await supabase.from('daily_quotas').insert({ user_id: user.id, date: today, [field]: 1 });
  }
}
