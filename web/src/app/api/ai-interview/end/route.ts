import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { aiInterviewAvailable, generateScorecard } from '@/lib/aiInterview/clients';
import { SCORECARD_PROMPT } from '@/lib/aiInterview/prompts';

// Generate the post-interview scorecard via Groq Llama 3.3 70B. Idempotent —
// returns the existing row on retry.

export const runtime = 'nodejs';
export const maxDuration = 60;

export async function POST(req: Request) {
  const cfg = aiInterviewAvailable();
  if (!cfg.ok) return NextResponse.json({ error: 'unavailable', missing: cfg.missing }, { status: 503 });

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 });

  let sessionId: string;
  try {
    const body = await req.json();
    sessionId = String(body.sessionId || '');
    if (!sessionId) throw new Error();
  } catch {
    return NextResponse.json({ error: 'Missing sessionId' }, { status: 400 });
  }

  const { data: sess } = await supabase
    .from('interview_sessions')
    .select('id, student_id')
    .eq('id', sessionId)
    .maybeSingle();
  if (!sess || sess.student_id !== user.id) {
    return NextResponse.json({ error: 'Session not found' }, { status: 404 });
  }

  const { data: existing } = await supabase
    .from('interview_scorecards')
    .select('*')
    .eq('session_id', sessionId)
    .maybeSingle();
  if (existing) return NextResponse.json({ scorecard: existing });

  const { data: rows } = await supabase
    .from('interview_transcripts')
    .select('role, content')
    .eq('session_id', sessionId)
    .order('created_at', { ascending: true });
  const transcript = (rows ?? [])
    .map(r => `${r.role === 'ai' ? 'INTERVIEWER' : 'CANDIDATE'}: ${r.content}`)
    .join('\n\n');

  let raw: Record<string, unknown>;
  try {
    raw = await generateScorecard(SCORECARD_PROMPT, transcript);
  } catch (e) {
    console.error('[end] groq scorecard', e);
    return NextResponse.json({ error: 'Scoring failed' }, { status: 502 });
  }

  const card = {
    session_id: sessionId,
    content_score: clampInt(raw.content_score),
    communication_score: clampInt(raw.communication_score),
    confidence_score: clampInt(raw.confidence_score),
    overall_score: clampInt(raw.overall_score),
    strengths: Array.isArray(raw.strengths) ? raw.strengths : [],
    improvements: Array.isArray(raw.improvements) ? raw.improvements : [],
    next_steps: typeof raw.next_steps === 'string' ? raw.next_steps : null,
  };

  const { data: inserted } = await supabase
    .from('interview_scorecards')
    .insert(card)
    .select('*')
    .maybeSingle();

  await supabase
    .from('interview_sessions')
    .update({ status: 'completed', ended_at: new Date().toISOString() })
    .eq('id', sessionId);

  return NextResponse.json({ scorecard: inserted ?? card });
}

function clampInt(v: unknown): number | null {
  const n = typeof v === 'number' ? v : Number(v);
  if (!Number.isFinite(n)) return null;
  return Math.max(0, Math.min(10, Math.round(n)));
}
