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
    identity: userName,
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
