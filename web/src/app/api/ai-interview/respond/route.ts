import { createClient } from '@/lib/supabase/server';
import {
  aiInterviewAvailable,
  sarvamSynthesize,
  streamInterviewerTurn,
  transcribeWebmAudio,
} from '@/lib/aiInterview/clients';

// One turn, streamed: user audio → Groq Whisper → Groq LLM (streamed tokens) →
// Sarvam TTS per sentence. Emits Server-Sent Events so the client can play
// sentence audio as it arrives instead of waiting for the full reply.
//
// SSE events:
//   event: user   { text }                          — Whisper transcript
//   event: text   { sentence, index }               — next sentence as it's parsed
//   event: audio  { index, audioBase64, mime }      — Sarvam WAV for that sentence
//   event: done   { fullReply, sessionShouldEnd }   — final state
//   event: error  { message, stage }                — recoverable error

export const runtime = 'nodejs';
export const maxDuration = 60;

const END_MARKER = /\[END\]\s*$/i;

function splitSentences(buf: string): { sentences: string[]; rest: string } {
  // Pull off any number of complete sentences ending in . ? ! followed by
  // whitespace or end-of-buffer. Leaves the partial tail in `rest`.
  const sentences: string[] = [];
  let rest = buf;
  while (true) {
    const m = rest.match(/^([\s\S]*?[.!?])(\s+|$)/);
    if (!m) break;
    const sentence = m[1].trim();
    if (sentence) sentences.push(sentence);
    rest = rest.slice(m[0].length);
  }
  return { sentences, rest };
}

export async function POST(req: Request) {
  const cfg = aiInterviewAvailable();
  if (!cfg.ok) {
    return new Response(JSON.stringify({ error: 'unavailable', missing: cfg.missing }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return new Response(JSON.stringify({ error: 'Unauthorised' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  let form: FormData;
  try { form = await req.formData(); } catch {
    return new Response(JSON.stringify({ error: 'Invalid body' }), {
      status: 400, headers: { 'Content-Type': 'application/json' },
    });
  }
  const sessionId = String(form.get('sessionId') || '');
  const audio = form.get('audio');
  if (!sessionId || !(audio instanceof Blob)) {
    return new Response(JSON.stringify({ error: 'Missing sessionId or audio' }), {
      status: 400, headers: { 'Content-Type': 'application/json' },
    });
  }

  const { data: sess } = await supabase
    .from('interview_sessions')
    .select('id, student_id, feedback')
    .eq('id', sessionId)
    .maybeSingle();
  if (!sess || sess.student_id !== user.id) {
    return new Response(JSON.stringify({ error: 'Session not found' }), {
      status: 404, headers: { 'Content-Type': 'application/json' },
    });
  }
  const systemPrompt = (sess.feedback as string | null) || '';

  const encoder = new TextEncoder();
  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const send = (event: string, data: Record<string, unknown>) => {
        controller.enqueue(encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`));
      };

      let userText = '';
      try { userText = await transcribeWebmAudio(audio); }
      catch (e) {
        console.error('[respond] groq stt', e);
        send('error', { stage: 'stt', message: e instanceof Error ? e.message : String(e) });
      }
      await supabase.from('interview_transcripts').insert({
        session_id: sessionId, role: 'user', content: userText,
      });
      send('user', { text: userText });

      const { data: history } = await supabase
        .from('interview_transcripts')
        .select('role, content')
        .eq('session_id', sessionId)
        .order('created_at', { ascending: true });

      let buf = '';
      let fullReply = '';
      let sentenceIdx = 0;
      const emit = async (sentence: string) => {
        const cleaned = sentence.replace(END_MARKER, '').trim();
        if (!cleaned) return;
        const idx = sentenceIdx++;
        send('text', { sentence: cleaned, index: idx });
        try {
          const audioBase64 = await sarvamSynthesize(cleaned);
          send('audio', { index: idx, audioBase64, mime: 'audio/wav' });
        } catch (e) {
          console.error('[respond] sarvam', e);
          send('error', { stage: 'tts', index: idx, message: e instanceof Error ? e.message : String(e) });
        }
      };

      try {
        for await (const token of streamInterviewerTurn(
          systemPrompt,
          (history ?? []).map(r => ({ role: r.role as 'ai' | 'user', content: r.content as string })),
        )) {
          buf += token;
          fullReply += token;
          const { sentences, rest } = splitSentences(buf);
          buf = rest;
          for (const s of sentences) await emit(s);
        }
        if (buf.trim()) await emit(buf.trim());
      } catch (e) {
        console.error('[respond] groq llm stream', e);
        send('error', { stage: 'llm', message: e instanceof Error ? e.message : String(e) });
        controller.close();
        return;
      }

      const sessionShouldEnd = END_MARKER.test(fullReply.trim());
      const cleanReply = fullReply.replace(END_MARKER, '').trim();

      await supabase.from('interview_transcripts').insert({
        session_id: sessionId, role: 'ai', content: cleanReply,
      });
      if (sessionShouldEnd) {
        await supabase
          .from('interview_sessions')
          .update({ status: 'completed', ended_at: new Date().toISOString() })
          .eq('id', sessionId);
      }

      send('done', { fullReply: cleanReply, sessionShouldEnd });
      controller.close();
    },
  });

  return new Response(stream, {
    status: 200,
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no',
    },
  });
}
