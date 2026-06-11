'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export type InterviewType = 'peer' | 'group' | 'coach';
export type InterviewStatus = 'pending' | 'active' | 'completed' | 'cancelled';

// New modes added in Part B redesign. Stored directly in interview_type
// (CHECK was relaxed to peer|coach|ai|group|mentor|premium).
export type InterviewMode = 'ai' | 'peer' | 'group' | 'mentor' | 'premium';
export type StartMode = 'now' | 'scheduled';

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

// Read-only env probe so the client can grey out the AI Mock card if the
// admin hasn't set the three required keys.
export async function checkAiInterviewAvailable(): Promise<{ ok: boolean; missing: string[] }> {
  const missing: string[] = [];
  if (!process.env.OPENAI_API_KEY) missing.push('OPENAI_API_KEY');
  if (!process.env.ANTHROPIC_API_KEY) missing.push('ANTHROPIC_API_KEY');
  if (!process.env.ELEVENLABS_API_KEY) missing.push('ELEVENLABS_API_KEY');
  return { ok: missing.length === 0, missing };
}


// ════════════════════════════════════════════════════════════════════════════
// Part B — new mode + interviewer + start-now flows
// ════════════════════════════════════════════════════════════════════════════

export type CreateSessionInput = {
  mode: InterviewMode;
  startMode: StartMode;
  topic: string;
  interviewFormat?: string | null;
  scheduledFor?: string | null;
  interviewerId?: string | null;
  pricePaise?: number;
};

export type CreateSessionResult =
  | { ok: true; id: string; status: string }
  | { ok: false; error: string };

/**
 * New entry point for the redesigned Create Interview form. Writes the row
 * directly with the new mode/start_mode/interview_format/interviewer_id/
 * price_paise columns. Used by AI Mock, Group, Mentor, and Premium flows.
 * (Peer 1-on-1 + Start Now goes through enqueuePeerMatch instead.)
 */
export async function createSession(input: CreateSessionInput): Promise<CreateSessionResult> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { ok: false, error: 'Not signed in' };

    // Mode-aware status:
    //   • AI + start_now    → 'live'      (open the room immediately)
    //   • mentor/premium    → 'scheduled' (waits for booking confirmation)
    //   • everything else   → 'scheduled'
    const status =
      input.mode === 'ai' && input.startMode === 'now' ? 'live' : 'scheduled';

    const { data, error } = await supabase
      .from('interview_sessions')
      .insert({
        student_id: user.id,
        interview_type: input.mode,
        role: input.mode,                              // mirror UI mode for legacy readers
        prompt: input.topic,
        interview_format: input.interviewFormat ?? null,
        interviewer_id: input.interviewerId ?? null,
        scheduled_for: input.scheduledFor ?? null,
        price_paise: input.pricePaise ?? 0,
        start_mode: input.startMode,
        status,
        started_at: status === 'live' ? new Date().toISOString() : null,
      })
      .select('id, status')
      .single();

    if (error || !data) {
      console.error('[createSession]', error?.message);
      return { ok: false, error: error?.message || 'Could not create session' };
    }
    revalidatePath('/interviews');
    return { ok: true, id: data.id as string, status: data.status as string };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : 'unknown_error' };
  }
}

// ── Interviewer (mentor) listing for the Mentor / Premium tiers ──────────
export type InterviewerCard = {
  user_id: string;
  full_name: string | null;
  avatar_url: string | null;
  current_role: string | null;
  current_company: string | null;
  years_experience: number | null;
  tier: 'regular' | 'premium';
  is_faang_verified: boolean;
  price_paise: number;
  avg_rating: number;
  total_sessions: number;
};

export async function listInterviewers(opts: { tier?: 'regular' | 'premium' } = {}): Promise<InterviewerCard[]> {
  try {
    const supabase = await createClient();
    let q = supabase
      .from('mentor_profiles')
      .select(
        'user_id, tier, is_faang_verified, price_per_session_paise, current_role, current_company, years_experience, avg_rating, total_sessions, profile:profiles!user_id(full_name, avatar_url)'
      )
      .eq('is_interviewer', true)
      .order('avg_rating', { ascending: false })
      .limit(50);
    if (opts.tier) q = q.eq('tier', opts.tier);
    const { data, error } = await q;
    if (error) {
      console.error('[listInterviewers]', error.message);
      return [];
    }
    return (data ?? []).map((row) => {
      const r = row as unknown as {
        user_id: string;
        tier: 'regular' | 'premium';
        is_faang_verified: boolean;
        price_per_session_paise: number;
        current_role: string | null;
        current_company: string | null;
        years_experience: number | null;
        avg_rating: number | null;
        total_sessions: number | null;
        profile: { full_name: string | null; avatar_url: string | null } | null;
      };
      return {
        user_id: r.user_id,
        full_name: r.profile?.full_name ?? null,
        avatar_url: r.profile?.avatar_url ?? null,
        current_role: r.current_role,
        current_company: r.current_company,
        years_experience: r.years_experience,
        tier: r.tier,
        is_faang_verified: !!r.is_faang_verified,
        price_paise: r.price_per_session_paise ?? 0,
        avg_rating: Number(r.avg_rating ?? 0),
        total_sessions: r.total_sessions ?? 0,
      };
    });
  } catch (err) {
    console.error('[listInterviewers] threw', err);
    return [];
  }
}

// ── Peer 1-on-1 Start Now: enqueue + cancel ──────────────────────────────
// peer_queue CHECKs: interview_type ('Coding'|'System design'|'Behavioral'|'Mixed'),
// level ('Easy'|'Medium'|'Hard'), length_min (30|45|60).
// We map our Interview Format → that vocabulary so the row passes the CHECK.

function mapFormatToPeerType(format: string | null | undefined): 'Coding' | 'System design' | 'Behavioral' | 'Mixed' {
  const f = (format ?? '').toLowerCase();
  if (f.includes('coding')) return 'Coding';
  if (f.includes('system design')) return 'System design';
  if (f.includes('behavioral') || f.includes('hr')) return 'Behavioral';
  return 'Mixed';
}

export type EnqueuePeerInput = { format?: string | null; level?: 'Easy' | 'Medium' | 'Hard'; lengthMin?: 30 | 45 | 60 };
export type EnqueuePeerResult = { ok: true; queueId: string } | { ok: false; error: string };

export async function enqueuePeerMatch(input: EnqueuePeerInput = {}): Promise<EnqueuePeerResult> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { ok: false, error: 'Not signed in' };
    const { data, error } = await supabase
      .from('peer_queue')
      .insert({
        user_id: user.id,
        interview_type: mapFormatToPeerType(input.format),
        level: input.level ?? 'Medium',
        length_min: input.lengthMin ?? 30,
        status: 'waiting',
      })
      .select('id')
      .single();
    if (error || !data) return { ok: false, error: error?.message || 'Could not enqueue' };
    return { ok: true, queueId: data.id as string };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : 'unknown_error' };
  }
}

export async function cancelPeerMatch(queueId: string): Promise<{ ok: boolean }> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { ok: false };
    await supabase
      .from('peer_queue')
      .update({ status: 'cancelled' })
      .eq('id', queueId)
      .eq('user_id', user.id);
    return { ok: true };
  } catch { return { ok: false }; }
}

export async function pollPeerMatch(queueId: string): Promise<{ status: 'waiting' | 'matched' | 'cancelled'; sessionId: string | null }> {
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from('peer_queue')
      .select('status, session_id')
      .eq('id', queueId)
      .maybeSingle();
    if (!data) return { status: 'cancelled', sessionId: null };
    return {
      status: (data.status as 'waiting' | 'matched' | 'cancelled') ?? 'waiting',
      sessionId: (data.session_id as string | null) ?? null,
    };
  } catch { return { status: 'waiting', sessionId: null }; }
}
