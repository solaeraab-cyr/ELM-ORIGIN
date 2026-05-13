'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function createInterviewSession(input: { type: 'peer' | 'group' | 'coach'; partnerId?: string | null; config?: Record<string, unknown> }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not signed in');
  const { data, error } = await supabase
    .from('interview_sessions')
    .insert({
      type: input.type,
      initiator_id: user.id,
      partner_id: input.partnerId ?? null,
      config: input.config ?? {},
      status: 'pending',
    })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function startInterviewSession(id: string) {
  const supabase = await createClient();
  await supabase.from('interview_sessions').update({ status: 'active', started_at: new Date().toISOString() }).eq('id', id);
}

export async function completeInterviewSession(id: string, score: number, feedback: Record<string, unknown>) {
  const supabase = await createClient();
  await supabase.from('interview_sessions').update({
    status: 'completed',
    ended_at: new Date().toISOString(),
    score,
    feedback,
  }).eq('id', id);
  revalidatePath('/interviews');
}

export async function listMyInterviewSessions() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];
  const { data } = await supabase
    .from('interview_sessions')
    .select('*, partner:profiles!partner_id(*)')
    .or(`initiator_id.eq.${user.id},partner_id.eq.${user.id}`)
    .order('created_at', { ascending: false });
  return data ?? [];
}
