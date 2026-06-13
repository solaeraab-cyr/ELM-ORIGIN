import { NextResponse } from 'next/server';

// Sarvam Bulbul:v3 over plain HTTPS — no WebSocket, so it's compatible with
// Vercel serverless. Returns audio/wav (Sarvam ships base64 WAV); the browser
// <audio> element plays WAV natively, so the client doesn't care about MIME.

export const runtime = 'nodejs';
export const maxDuration = 30;

const SARVAM_TTS_URL = 'https://api.sarvam.ai/text-to-speech';
const SARVAM_MODEL = 'bulbul:v3';
// Confirmed bulbul:v3 female Indian voice from Sarvam's published voice list.
// Anushka/Meera are v2-only and not supported by v3. Priya is the warmest
// female English-friendly voice Sarvam ships for v3.
const SARVAM_SPEAKER = 'priya';

export async function POST(req: Request) {
  const key = process.env.SARVAM_API_KEY;
  if (!key) return NextResponse.json({ error: 'unavailable', missing: ['SARVAM_API_KEY'] }, { status: 503 });

  let body: { text?: unknown };
  try { body = await req.json(); } catch {
    return NextResponse.json({ error: 'Invalid body' }, { status: 400 });
  }
  const text = typeof body.text === 'string' ? body.text.trim() : '';
  if (!text) return NextResponse.json({ error: 'text required' }, { status: 400 });

  try {
    const res = await fetch(SARVAM_TTS_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-subscription-key': key,
      },
      body: JSON.stringify({
        text: text.slice(0, 2500),
        target_language_code: 'en-IN',
        model: SARVAM_MODEL,
        speaker: SARVAM_SPEAKER,
      }),
    });
    if (!res.ok) {
      const errText = await res.text().catch(() => '');
      console.error('[ai-interview/speak] sarvam non-2xx:', res.status, errText.slice(0, 500));
      return NextResponse.json({ error: 'tts_failed', status: res.status }, { status: 502 });
    }
    const data = await res.json() as { audios?: unknown };
    const audios = Array.isArray(data.audios) ? data.audios : [];
    const first = typeof audios[0] === 'string' ? audios[0] : '';
    if (!first) {
      console.error('[ai-interview/speak] sarvam empty audios:', JSON.stringify(data).slice(0, 300));
      return NextResponse.json({ error: 'tts_empty' }, { status: 502 });
    }
    const buf = Buffer.from(first, 'base64');
    return new Response(new Uint8Array(buf), {
      status: 200,
      headers: {
        'Content-Type': 'audio/wav',
        'Cache-Control': 'no-store',
      },
    });
  } catch (err) {
    console.error('[ai-interview/speak] sarvam threw:', err);
    return NextResponse.json(
      { error: 'tts_failed', message: err instanceof Error ? err.message : String(err) },
      { status: 502 },
    );
  }
}
