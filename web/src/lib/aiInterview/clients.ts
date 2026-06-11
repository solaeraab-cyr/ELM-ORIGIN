// Thin SDK wrappers + ElevenLabs fetch helper. Each constructor reads its key
// from env at call-time so missing keys surface as a clean runtime error rather
// than a build-time crash.

import Anthropic from '@anthropic-ai/sdk';
import OpenAI from 'openai';
import { createClient } from '@/lib/supabase/server';

export function aiInterviewAvailable(): { ok: boolean; missing: string[] } {
  const missing: string[] = [];
  if (!process.env.OPENAI_API_KEY) missing.push('OPENAI_API_KEY');
  if (!process.env.ANTHROPIC_API_KEY) missing.push('ANTHROPIC_API_KEY');
  if (!process.env.ELEVENLABS_API_KEY) missing.push('ELEVENLABS_API_KEY');
  return { ok: missing.length === 0, missing };
}

function anthropic() {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) throw new Error('ANTHROPIC_API_KEY missing');
  return new Anthropic({ apiKey: key });
}

function openai() {
  const key = process.env.OPENAI_API_KEY;
  if (!key) throw new Error('OPENAI_API_KEY missing');
  return new OpenAI({ apiKey: key });
}

const ELEVENLABS_DEFAULT_VOICE = 'EXAVITQu4vr4xnSDxMaL'; // 'Sarah' — friendly senior
const ELEVENLABS_MODEL = 'eleven_turbo_v2_5';            // cheap + fast

export async function ttsToBuffer(text: string, voiceId = ELEVENLABS_DEFAULT_VOICE): Promise<{ buffer: ArrayBuffer; mime: string } | null> {
  const key = process.env.ELEVENLABS_API_KEY;
  if (!key) return null;
  const res = await fetch(
    `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}?optimize_streaming_latency=3`,
    {
      method: 'POST',
      headers: { 'xi-api-key': key, 'Content-Type': 'application/json', 'Accept': 'audio/mpeg' },
      body: JSON.stringify({
        text,
        model_id: ELEVENLABS_MODEL,
        voice_settings: { stability: 0.5, similarity_boost: 0.75 },
      }),
    },
  );
  if (!res.ok) {
    console.error('[elevenlabs] tts', res.status, await res.text().catch(() => ''));
    return null;
  }
  return { buffer: await res.arrayBuffer(), mime: 'audio/mpeg' };
}

export async function transcribeWebmAudio(audioBlob: Blob): Promise<string> {
  // OpenAI SDK accepts Web File objects.
  const file = new File([audioBlob], 'turn.webm', { type: audioBlob.type || 'audio/webm' });
  const r = await openai().audio.transcriptions.create({
    model: 'whisper-1',
    file,
  });
  return (r.text || '').trim();
}

export type ClaudeTurnInput = {
  systemPrompt: string;
  history: { role: 'ai' | 'user'; content: string }[];
};

export async function claudeNextTurn(input: ClaudeTurnInput): Promise<{ reply: string; shouldEnd: boolean }> {
  const a = anthropic();
  const messages = input.history.map(t => ({
    role: (t.role === 'ai' ? 'assistant' : 'user') as 'assistant' | 'user',
    content: t.content,
  }));
  const res = await a.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 400,
    system: input.systemPrompt,
    messages,
  });
  const text = res.content
    .filter((b) => b.type === 'text')
    .map((b) => (b as { type: 'text'; text: string }).text)
    .join('\n')
    .trim();
  // Try to parse strict JSON. If the model wrapped it in prose, pull the first {...}.
  let parsed: { reply: string; shouldEnd: boolean };
  try {
    parsed = JSON.parse(text);
  } catch {
    const m = text.match(/\{[\s\S]*\}/);
    parsed = m ? JSON.parse(m[0]) : { reply: text, shouldEnd: false };
  }
  return { reply: String(parsed.reply ?? text), shouldEnd: !!parsed.shouldEnd };
}

export async function claudeScorecard(systemPrompt: string, transcript: string): Promise<Record<string, unknown>> {
  const a = anthropic();
  const res = await a.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 1200,
    system: systemPrompt,
    messages: [{ role: 'user', content: transcript }],
  });
  const text = res.content
    .filter((b) => b.type === 'text')
    .map((b) => (b as { type: 'text'; text: string }).text)
    .join('\n')
    .trim();
  try { return JSON.parse(text); }
  catch {
    const m = text.match(/\{[\s\S]*\}/);
    return m ? JSON.parse(m[0]) : { raw: text };
  }
}

// Upload an audio buffer to the ai-interview-audio bucket and return a public URL.
export async function uploadAudio(opts: { sessionId: string; role: 'ai' | 'user'; buffer: ArrayBuffer; mime: string }): Promise<string | null> {
  try {
    const supabase = await createClient();
    const ext = opts.mime.includes('webm') ? 'webm' : 'mp3';
    const path = `${opts.sessionId}/${opts.role}-${Date.now()}.${ext}`;
    const { error } = await supabase.storage
      .from('ai-interview-audio')
      .upload(path, opts.buffer as ArrayBuffer, { contentType: opts.mime, upsert: false });
    if (error) {
      console.error('[uploadAudio]', error.message);
      return null;
    }
    const { data } = supabase.storage.from('ai-interview-audio').getPublicUrl(path);
    return data.publicUrl;
  } catch (e) {
    console.error('[uploadAudio] threw', e);
    return null;
  }
}
