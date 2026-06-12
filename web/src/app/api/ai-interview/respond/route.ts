import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { aiInterviewAvailable, nextInterviewerTurn, transcribeWebmAudio } from '@/lib/aiInterview/clients';

// One turn: user audio → Groq Whisper → Groq Llama 3.3 70B → text reply.
// TTS happens in the browser (window.speechSynthesis), so no audio storage.

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

  // Verify ownership + load system prompt.
  const { data: sess } = await supabase
    .from('interview_sessions')
    .select('id, student_id, feedback')
    .eq('id', sessionId)
    .maybeSingle();
  if (!sess || sess.student_id !== user.id) {
    return NextResponse.json({ error: 'Session not found' }, { status: 404 });
  }
  const systemPrompt = (sess.feedback as string | null) || '';

  let userText = '';
  try { userText = await transcribeWebmAudio(audio); }
  catch (e) { console.error('[respond] groq stt', e); }

  await supabase.from('interview_transcripts').insert({
    session_id: sessionId,
    role: 'user',
    content: userText,
  });

  // Load full history (after the user turn we just inserted).
  const { data: history } = await supabase
    .from('interview_transcripts')
    .select('role, content')
    .eq('session_id', sessionId)
    .order('created_at', { ascending: true });

  let llmOut: { reply: string; shouldEnd: boolean };
  try {
    llmOut = await nextInterviewerTurn({
      systemPrompt,
      history: (history ?? []).map(r => ({ role: r.role as 'ai' | 'user', content: r.content as string })),
    });
  } catch (e) {
    console.error('[respond] groq llm', e);
    return NextResponse.json({ error: 'AI failed to respond' }, { status: 502 });
  }

  await supabase.from('interview_transcripts').insert({
    session_id: sessionId,
    role: 'ai',
    content: llmOut.reply,
  });

  if (llmOut.shouldEnd) {
    await supabase
      .from('interview_sessions')
      .update({ status: 'completed', ended_at: new Date().toISOString() })
      .eq('id', sessionId);
  }

  return NextResponse.json({
    userText,
    aiResponseText: llmOut.reply,
    sessionShouldEnd: llmOut.shouldEnd,
  });
}
