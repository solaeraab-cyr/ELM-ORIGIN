'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export type InterviewType = 'peer' | 'group' | 'coach';
export type InterviewStatus = 'pending' | 'active' | 'completed' | 'cancelled';

export type CreateInterviewInput = {
  type: InterviewType;
  topic: string;
  scheduledFor: string; // ISO timestamp
  partnerId?: string | null;
  extraConfig?: Record<string, unknown>;
};

const PLAN_QUOTAS: Record<string, number> = {
  Free: 2,
  Pro: 10,
  Elite: Infinity,
};

// ── Live DB ⇄ UI mapping ─────────────────────────────────────────────────────
// interview_sessions columns: student_id, interview_type CHECK('peer'|'coach'),
// partner_id, prompt, role, scheduled_for, score, started_at, ended_at,
// feedback (text), status CHECK('scheduled'|'ongoing'|'completed'|'cancelled').
// The UI works with { type, initiator_id, config:{topic,scheduled_for}, status }
// using its own status vocabulary (pending/active). We stash the UI type in the
// otherwise-unused `role` column so 'group' survives (interview_type only allows
// peer|coach), and map statuses both ways.

const UI_STATUS: Record<string, InterviewStatus> = {
  scheduled: 'pending',
  ongoing: 'active',
  completed: 'completed',
  cancelled: 'cancelled',
};

function dbInterviewType(t: InterviewType): 'peer' | 'coach' {
  return t === 'coach' ? 'coach' : 'peer';
}

type DbRow = Record<string, unknown> & {
  id: string;
  student_id: string;
  interview_type: string;
  role: string | null;
  prompt: string | null;
  scheduled_for: string | null;
  status: string;
  partner_id: string | null;
};

function toUiRow(row: DbRow) {
  const { interview_type, role, prompt, scheduled_for, student_id, status, ...rest } = row;
  return {
    ...rest,
    student_id,
    initiator_id: student_id,
    type: (role as InterviewType) || (interview_type as InterviewType),
    status: UI_STATUS[status] ?? 'pending',
    config: { topic: prompt ?? undefined, scheduled_for: scheduled_for ?? undefined },
    initiator: (rest as Record<string, unknown>).initiator,
    partner: (rest as Record<string, unknown>).partner,
  };
}

const SELECT = '*, initiator:profiles!student_id(id,full_name,avatar_url,handle), partner:profiles!partner_id(id,full_name,avatar_url,handle)';

async function todaysInterviewCount(supabase: Awaited<ReturnType<typeof createClient>>, userId: string) {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const { count } = await supabase
    .from('interview_sessions')
    .select('id', { count: 'exact', head: true })
    .eq('student_id', userId)
    .gte('created_at', start.toISOString());
  return count ?? 0;
}

export async function getInterviewQuota() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { plan: 'Free', limit: 2, used: 0, remaining: 2 };
    const { data: profile } = await supabase.from('profiles').select('plan').eq('id', user.id).maybeSingle();
    const plan = profile?.plan ?? 'Free';
    const limit = PLAN_QUOTAS[plan] ?? 2;
    const used = await todaysInterviewCount(supabase, user.id);
    const remaining = Number.isFinite(limit) ? Math.max(0, limit - used) : Infinity;
    return { plan, limit, used, remaining };
  } catch {
    return { plan: 'Free', limit: 2, used: 0, remaining: 2 };
  }
}

export async function createInterview(input: CreateInterviewInput) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { ok: false as const, error: 'Not signed in' };

    const { data: profile } = await supabase.from('profiles').select('plan').eq('id', user.id).maybeSingle();
    const plan = profile?.plan ?? 'Free';
    const limit = PLAN_QUOTAS[plan] ?? 2;
    const used = await todaysInterviewCount(supabase, user.id);
    if (Number.isFinite(limit) && used >= limit) {
      return { ok: false as const, error: 'quota_exceeded', plan, limit, used };
    }

    const { data, error } = await supabase
      .from('interview_sessions')
      .insert({
        student_id: user.id,
        interview_type: dbInterviewType(input.type),
        role: input.type,
        prompt: input.topic,
        scheduled_for: input.scheduledFor,
        partner_id: input.partnerId ?? null,
        status: 'scheduled',
      })
      .select()
      .single();

    if (error) return { ok: false as const, error: error.message };
    revalidatePath('/interviews');
    return { ok: true as const, interview: data };
  } catch (err) {
    return { ok: false as const, error: err instanceof Error ? err.message : 'unknown_error' };
  }
}

export async function listInterviews(userId?: string) {
  try {
    const supabase = await createClient();
    let uid = userId;
    if (!uid) {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];
      uid = user.id;
    }
    const { data } = await supabase
      .from('interview_sessions')
      .select(SELECT)
      .or(`student_id.eq.${uid},partner_id.eq.${uid}`)
      .order('created_at', { ascending: false });
    return (data ?? []).map(r => toUiRow(r as unknown as DbRow));
  } catch {
    return [];
  }
}

export async function listAvailableInterviews() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    const { data } = await supabase
      .from('interview_sessions')
      .select(SELECT)
      .is('partner_id', null)
      .eq('status', 'scheduled')
      .order('created_at', { ascending: false })
      .limit(50);
    const rows = (data ?? []).map(r => toUiRow(r as unknown as DbRow));
    return user ? rows.filter(r => r.initiator_id !== user.id) : rows;
  } catch {
    return [];
  }
}

export async function joinInterview(interviewId: string, userId?: string) {
  try {
    const supabase = await createClient();
    let uid = userId;
    if (!uid) {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return { ok: false as const, error: 'Not signed in' };
      uid = user.id;
    }
    const { error } = await supabase
      .from('interview_sessions')
      .update({ partner_id: uid, status: 'ongoing', started_at: new Date().toISOString() })
      .eq('id', interviewId)
      .is('partner_id', null);
    if (error) return { ok: false as const, error: error.message };
    revalidatePath('/interviews');
    return { ok: true as const };
  } catch (err) {
    return { ok: false as const, error: err instanceof Error ? err.message : 'unknown_error' };
  }
}

export async function cancelInterview(interviewId: string) {
  try {
    const supabase = await createClient();
    const { error } = await supabase
      .from('interview_sessions')
      .update({ status: 'cancelled' })
      .eq('id', interviewId);
    if (error) return { ok: false as const, error: error.message };
    revalidatePath('/interviews');
    return { ok: true as const };
  } catch (err) {
    return { ok: false as const, error: err instanceof Error ? err.message : 'unknown_error' };
  }
}

export async function completeInterview(interviewId: string, score?: number, feedback?: Record<string, unknown>) {
  try {
    const supabase = await createClient();
    const update: Record<string, unknown> = {
      status: 'completed',
      ended_at: new Date().toISOString(),
    };
    if (typeof score === 'number') update.score = score;
    if (feedback) update.feedback = JSON.stringify(feedback);
    const { error } = await supabase.from('interview_sessions').update(update).eq('id', interviewId);
    if (error) return { ok: false as const, error: error.message };
    revalidatePath('/interviews');
    return { ok: true as const };
  } catch (err) {
    return { ok: false as const, error: err instanceof Error ? err.message : 'unknown_error' };
  }
}

export async function getInterview(interviewId: string) {
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from('interview_sessions')
      .select(SELECT)
      .eq('id', interviewId)
      .maybeSingle();
    return data ? toUiRow(data as unknown as DbRow) : null;
  } catch {
    return null;
  }
}

// ── Backwards-compatible aliases (existing call sites in the repo) ────────
export async function createInterviewSession(input: { type: InterviewType; partnerId?: string | null; config?: Record<string, unknown> }) {
  const res = await createInterview({
    type: input.type,
    topic: (input.config?.topic as string) ?? '',
    scheduledFor: (input.config?.scheduled_for as string) ?? new Date().toISOString(),
    partnerId: input.partnerId ?? null,
  });
  if (!res.ok) throw new Error(res.error || 'Failed to create interview');
  return res.interview;
}

export async function startInterviewSession(id: string) {
  const supabase = await createClient();
  await supabase.from('interview_sessions').update({ status: 'ongoing', started_at: new Date().toISOString() }).eq('id', id);
}

export async function completeInterviewSession(id: string, score: number, feedback: Record<string, unknown>) {
  return completeInterview(id, score, feedback);
}

export async function listMyInterviewSessions() {
  return listInterviews();
}
