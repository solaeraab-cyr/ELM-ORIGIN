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
  let userId: string;

  try {
    const body = await req.json();
    roomName = String(body.roomName || '').trim();
    userName = String(body.userName || '').trim();
    userId = String(body.userId || '').trim();
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  if (!roomName || !userName) {
    return NextResponse.json({ error: 'roomName and userName are required' }, { status: 400 });
  }

  // Identity policy: when the caller knows the user's profile id, use it so
  // every other room feature that keys on user_id (chat ownership, LiveBoard
  // marker handoff, the sync-handshake leader tiebreak) lines up. Fall back to
  // `${userName}__random` for ad-hoc rooms / unauthenticated guests, which
  // preserves the prior collision-avoidance for users sharing a display name.
  const identity = userId || `${userName}__${Math.random().toString(36).slice(2, 10)}`;

  const at = new AccessToken(apiKey, apiSecret, {
    identity,
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
