import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { aiInterviewAvailable, claudeNextTurn, transcribeWebmAudio, ttsToBuffer, uploadAudio } from '@/lib/aiInterview/clients';

// One turn: user audio → Whisper → Claude → ElevenLabs → response audio.
// All four legs persist to interview_transcripts so the result page can replay.

export const runtime = 'nodejs';
export const maxDuration = 60;

export async function POST(req: Request) {
  const cfg = aiInterviewAvailable();
  if (!cfg.ok) return NextResponse.json({ error: 'unavailable', missing: cfg.missing }, { status: 503 });

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 });

  let form: FormData;
  try { form = await req.formData(); } catch {
    return NextResponse.json({ error: 'Invalid body' }, { status: 400 });
  }
  const sessionId = String(form.get('sessionId') || '');
  const audio = form.get('audio');
  if (!sessionId || !(audio instanceof Blob)) {
    return NextResponse.json({ error: 'Missing sessionId or audio' }, { status: 400 });
  }

  // Verify ownership + load system prompt + history.
  const { data: sess } = await supabase
    .from('interview_sessions')
    .select('id, student_id, feedback')
    .eq('id', sessionId)
    .maybeSingle();
  if (!sess || sess.student_id !== user.id) {
    return NextResponse.json({ error: 'Session not found' }, { status: 404 });
  }
  const systemPrompt = (sess.feedback as string | null) || '';

  // Whisper transcribe + upload user audio in parallel.
  const userAudioBuffer = await audio.arrayBuffer();
  const [userText, userAudioUrl] = await Promise.all([
    transcribeWebmAudio(audio).catch(() => ''),
    uploadAudio({ sessionId, role: 'user', buffer: userAudioBuffer, mime: audio.type || 'audio/webm' }),
  ]);

  await supabase.from('interview_transcripts').insert({
    session_id: sessionId,
    role: 'user',
    content: userText,
    audio_url: userAudioUrl,
  });

  // Load full history (after the user turn we just inserted).
  const { data: history } = await supabase
    .from('interview_transcripts')
    .select('role, content')
    .eq('session_id', sessionId)
    .order('created_at', { ascending: true });

  let claudeOut: { reply: string; shouldEnd: boolean };
  try {
    claudeOut = await claudeNextTurn({
      systemPrompt,
      history: (history ?? []).map(r => ({ role: r.role as 'ai' | 'user', content: r.content as string })),
    });
  } catch (e) {
    console.error('[respond] claude', e);
    return NextResponse.json({ error: 'AI failed to respond' }, { status: 502 });
  }

  // TTS the AI reply.
  let aiAudioUrl: string | null = null;
  const tts = await ttsToBuffer(claudeOut.reply);
  if (tts) {
    aiAudioUrl = await uploadAudio({ sessionId, role: 'ai', buffer: tts.buffer, mime: tts.mime });
  }

  await supabase.from('interview_transcripts').insert({
    session_id: sessionId,
    role: 'ai',
    content: claudeOut.reply,
    audio_url: aiAudioUrl,
  });

  if (claudeOut.shouldEnd) {
    await supabase
      .from('interview_sessions')
      .update({ status: 'completed', ended_at: new Date().toISOString() })
      .eq('id', sessionId);
  }

  return NextResponse.json({
    userText,
    aiResponseText: claudeOut.reply,
    aiResponseAudioUrl: aiAudioUrl,
    sessionShouldEnd: claudeOut.shouldEnd,
  });
}
