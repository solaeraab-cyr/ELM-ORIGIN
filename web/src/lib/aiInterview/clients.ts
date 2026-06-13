// Free-tier stack: Groq Whisper-large-v3 for STT + Groq Llama 3.3 70B for LLM.
// Browser-side Web Speech API handles TTS — no server-side audio synthesis,
// no audio storage, no third-party voice billing.

import Groq from 'groq-sdk';
import type { ChatCompletion, ChatCompletionCreateParamsNonStreaming } from 'groq-sdk/resources/chat/completions';

export function aiInterviewAvailable(): { ok: boolean; missing: string[] } {
  const missing: string[] = [];
  if (!process.env.GROQ_API_KEY) missing.push('GROQ_API_KEY');
  return { ok: missing.length === 0, missing };
}

function groq() {
  const key = process.env.GROQ_API_KEY;
  if (!key) throw new Error('GROQ_API_KEY missing');
  return new Groq({ apiKey: key });
}

const STT_MODEL = 'whisper-large-v3';
const LLM_MODEL = 'openai/gpt-oss-120b';
const LLM_MODEL_FALLBACK = 'llama-3.3-70b-versatile';

async function chatWithFallback(
  params: Omit<ChatCompletionCreateParamsNonStreaming, 'model'>,
): Promise<ChatCompletion> {
  try {
    return await groq().chat.completions.create({ ...params, model: LLM_MODEL });
  } catch (err) {
    console.warn(`[aiInterview] primary model ${LLM_MODEL} failed, falling back to ${LLM_MODEL_FALLBACK}:`, err);
    return await groq().chat.completions.create({ ...params, model: LLM_MODEL_FALLBACK });
  }
}

// ── STT ─────────────────────────────────────────────────────────────────────
export async function transcribeWebmAudio(audioBlob: Blob): Promise<string> {
  // Groq's audio API mirrors OpenAI's, so the SDK accepts a File.
  const file = new File([audioBlob], 'turn.webm', { type: audioBlob.type || 'audio/webm' });
  const r = await groq().audio.transcriptions.create({
    file,
    model: STT_MODEL,
    response_format: 'json',
  });
  return ((r as { text?: string }).text || '').trim();
}

// ── LLM: per-turn interviewer reply (strict JSON) ───────────────────────────
export type LlmTurnInput = {
  systemPrompt: string;
  history: { role: 'ai' | 'user'; content: string }[];
};

export async function nextInterviewerTurn(input: LlmTurnInput): Promise<{ reply: string; shouldEnd: boolean }> {
  const messages: { role: 'system' | 'user' | 'assistant'; content: string }[] = [
    { role: 'system', content: input.systemPrompt },
    ...input.history.map(t => ({
      role: (t.role === 'ai' ? 'assistant' : 'user') as 'assistant' | 'user',
      content: t.content,
    })),
  ];
  const res = await chatWithFallback({
    messages,
    max_tokens: 400,
    response_format: { type: 'json_object' },
  });
  const text = (res.choices?.[0]?.message?.content ?? '').trim();
  let parsed: { reply?: string; shouldEnd?: boolean };
  try {
    parsed = JSON.parse(text);
  } catch {
    const m = text.match(/\{[\s\S]*\}/);
    parsed = m ? JSON.parse(m[0]) : { reply: text, shouldEnd: false };
  }
  return {
    reply: String(parsed.reply ?? text ?? ''),
    shouldEnd: !!parsed.shouldEnd,
  };
}

// ── LLM: post-interview scorecard (strict JSON) ─────────────────────────────
export async function generateScorecard(systemPrompt: string, transcript: string): Promise<Record<string, unknown>> {
  const res = await chatWithFallback({
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: transcript },
    ],
    max_tokens: 1200,
    response_format: { type: 'json_object' },
  });
  const text = (res.choices?.[0]?.message?.content ?? '').trim();
  try { return JSON.parse(text); }
  catch {
    const m = text.match(/\{[\s\S]*\}/);
    return m ? JSON.parse(m[0]) : { raw: text };
  }
}
