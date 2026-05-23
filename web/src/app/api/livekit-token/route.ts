import { AccessToken } from 'livekit-server-sdk';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const apiKey = process.env.LIVEKIT_API_KEY;
  const apiSecret = process.env.LIVEKIT_API_SECRET;

  if (!apiKey || !apiSecret) {
    return NextResponse.json({ error: 'Video calling not configured' }, { status: 503 });
  }

  let roomName: string;
  let userName: string;

  try {
    const body = await req.json();
    roomName = String(body.roomName || '').trim();
    userName = String(body.userName || '').trim();
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  if (!roomName || !userName) {
    return NextResponse.json({ error: 'roomName and userName are required' }, { status: 400 });
  }

  const at = new AccessToken(apiKey, apiSecret, {
    // Unique identity prevents collisions when two users share a display
    // name (e.g. "You" / "Anon"); the human-readable name is shown in the UI.
    identity: `${userName}__${Math.random().toString(36).slice(2, 10)}`,
    name: userName,
    ttl: '4h',
  });

  at.addGrant({
    roomJoin: true,
    room: roomName,
    canPublish: true,
    canSubscribe: true,
    canPublishData: true,
  });

  const token = await at.toJwt();
  return NextResponse.json({ token });
}
