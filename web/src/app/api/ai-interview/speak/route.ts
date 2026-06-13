import { NextResponse } from 'next/server';
// The package's `main` points at index.ts (raw TS) which Turbopack can't load,
// so we import the built ESM bundle directly. Types are still picked up.
import { tts } from 'edge-tts/out/index.js';

// Microsoft Edge online neural TTS — free, no API key. Voice: en-IN-NeerjaNeural
// (warm Indian English female). Returns audio/mpeg for an <audio> element.

export const runtime = 'nodejs';
export const maxDuration = 30;

export async function POST(req: Request) {
  let body: { text?: unknown };
  try { body = await req.json(); } catch {
    return NextResponse.json({ error: 'Invalid body' }, { status: 400 });
  }
  const text = typeof body.text === 'string' ? body.text.trim() : '';
  if (!text) return NextResponse.json({ error: 'text required' }, { status: 400 });

  try {
    const buf = await tts(text, {
      voice: 'en-IN-NeerjaNeural',
      rate: '+5%',
      pitch: '+0Hz',
      volume: '+0%',
    });
    return new Response(new Uint8Array(buf), {
      status: 200,
      headers: {
        'Content-Type': 'audio/mpeg',
        'Cache-Control': 'no-store',
      },
    });
  } catch (err) {
    console.error('[ai-interview/speak] edge-tts failed:', err);
    return NextResponse.json(
      { error: 'tts_failed', message: err instanceof Error ? err.message : String(err) },
      { status: 502 },
    );
  }
}
