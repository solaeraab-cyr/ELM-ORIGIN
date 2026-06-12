import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { aiInterviewAvailable } from '@/lib/aiInterview/clients';
import { openingFor, systemPromptFor } from '@/lib/aiInterview/prompts';

// Start an AI mock interview. Creates the session row, persists the Phase 1
// opening (deterministic per format), returns the text — the client speaks it
// via window.speechSynthesis.

export const runtime = 'nodejs';

export async function POST(req: Request) {
  const cfg = aiInterviewAvailable();
  if (!cfg.ok) return NextResponse.json({ error: 'unavailable', missing: cfg.missing }, { status: 503 });

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 });

  let format: string, topic: string, subject: string | null;
  try {
    const body = await req.json();
    format = String(body.format || 'General Mock Interview').trim();
    topic = String(body.topic || '').trim();
    subject = body.subject ? String(body.subject) : null;
  } catch {
    return NextResponse.json({ error: 'Invalid body' }, { status: 400 });
  }

  // Quota: Free 2/day, Pro 10/day, Elite unlimited.
  const startOfDay = new Date(); startOfDay.setHours(0, 0, 0, 0);
  const { count: usedToday } = await supabase
    .from('interview_sessions')
    .select('id', { count: 'exact', head: true })
    .eq('student_id', user.id)
    .eq('interview_type', 'ai')
    .gte('created_at', startOfDay.toISOString());
  const { data: profile } = await supabase.from('profiles').select('plan').eq('id', user.id).maybeSingle();
  const plan = (profile?.plan as string | null) ?? 'Free';
  const limit = plan === 'Elite' ? Infinity : plan === 'Pro' ? 10 : 2;
  if ((usedToday ?? 0) >= limit) {
    return NextResponse.json({ error: 'quota_exceeded', plan, limit, used: usedToday }, { status: 402 });
  }

  // Insert the session row.
  const { data: sess, error: sessErr } = await supabase
    .from('interview_sessions')
    .insert({
      student_id: user.id,
      interview_type: 'ai',
      role: 'ai',
      prompt: topic,
      interview_format: format,
      start_mode: 'now',
      status: 'ongoing',
      started_at: new Date().toISOString(),
    })
    .select('id')
    .single();
  if (sessErr || !sess) {
    return NextResponse.json({ error: sessErr?.message || 'Could not create session' }, { status: 500 });
  }

  // Stash the system prompt on the session row's `feedback` text column so
  // the respond/end endpoints don't need to rebuild it from the format string.
  const systemPrompt = systemPromptFor({ format, topic, subject });
  await supabase.from('interview_sessions').update({ feedback: systemPrompt }).eq('id', sess.id);

  // Persist the Phase-1 opening (no TTS — the client speaks it).
  const opening = openingFor(format);
  await supabase.from('interview_transcripts').insert({
    session_id: sess.id,
    role: 'ai',
    content: opening,
  });

  return NextResponse.json({
    sessionId: sess.id,
    openingQuestion: opening,
  });
}
