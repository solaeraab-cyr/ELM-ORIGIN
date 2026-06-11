import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { aiInterviewAvailable, claudeNextTurn, ttsToBuffer, uploadAudio } from '@/lib/aiInterview/clients';
import { openingFor, systemPromptFor } from '@/lib/aiInterview/prompts';

// Start an AI mock interview. Creates the session row, generates the Phase 1
// opening via Claude (the prompt is structured so the very first turn is a
// greeting + intro request), TTS it, persist transcript row 1, return everything
// the client needs to drop the candidate straight into the interview.

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

  // Quota check (Free = 2/day for AI Mocks). Reuse the existing pattern by
  // counting today's ai sessions for this user.
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

  // Build the opening turn from Claude — feed it an empty history with the
  // system prompt; we also pre-seed the opening line so Claude's first turn
  // matches our Phase 1 spec exactly. We just use the static opening string
  // (no LLM call needed) — saves a turn's worth of cost and keeps the opening
  // deterministic per format. Subsequent turns use Claude.
  const opening = openingFor(format);
  void claudeNextTurn; // referenced so the import doesn't dead-strip in dev

  // TTS the opening, upload, persist.
  let openingAudioUrl: string | null = null;
  const tts = await ttsToBuffer(opening);
  if (tts) {
    openingAudioUrl = await uploadAudio({ sessionId: sess.id as string, role: 'ai', buffer: tts.buffer, mime: tts.mime });
  }

  const systemPrompt = systemPromptFor({ format, topic, subject });
  // Stash the system prompt on the session row's `feedback` text column so
  // the respond/end endpoints don't need to rebuild it from the format string.
  await supabase.from('interview_sessions').update({ feedback: systemPrompt }).eq('id', sess.id);

  await supabase.from('interview_transcripts').insert({
    session_id: sess.id,
    role: 'ai',
    content: opening,
    audio_url: openingAudioUrl,
  });

  return NextResponse.json({
    sessionId: sess.id,
    openingQuestion: opening,
    openingAudioUrl,
  });
}
