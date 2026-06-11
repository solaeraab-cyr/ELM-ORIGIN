import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// Mirrors the Cashfree mock pattern: when RAZORPAY_KEY_ID / RAZORPAY_KEY_SECRET
// aren't set, returns a synthetic mock_<ts> order id so the rest of the booking
// flow can run end-to-end in dev / on Vercel without real keys. When the keys
// ARE set, we wrap the Razorpay create-order API call in try/catch so a network
// error returns a clean 502.

export async function POST(req: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 });

  let amountPaise: number;
  let sessionId: string;
  let mentorId: string | null;
  try {
    const body = await req.json();
    amountPaise = Math.max(0, Number(body.amountPaise) | 0);
    sessionId = String(body.sessionId || '');
    mentorId = body.mentorId ? String(body.mentorId) : null;
    if (!amountPaise) return NextResponse.json({ error: 'Invalid amount' }, { status: 400 });
    if (!sessionId) return NextResponse.json({ error: 'Missing sessionId' }, { status: 400 });
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  // ── Mock mode ──────────────────────────────────────────────────────────
  if (!keyId || !keySecret) {
    return NextResponse.json({
      orderId: `mock_${Date.now()}`,
      amountPaise,
      currency: 'INR',
      status: 'mock',
      sessionId,
      mentorId,
    });
  }

  // ── Real Razorpay order ────────────────────────────────────────────────
  try {
    const res = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Basic ' + Buffer.from(`${keyId}:${keySecret}`).toString('base64'),
      },
      body: JSON.stringify({
        amount: amountPaise,
        currency: 'INR',
        receipt: `elm_${sessionId.slice(0, 12)}_${Date.now()}`,
        notes: { user_id: user.id, session_id: sessionId, mentor_id: mentorId ?? '' },
      }),
    });
    if (!res.ok) {
      const txt = await res.text();
      console.error('[razorpay create-order] error', txt);
      return NextResponse.json({ error: 'Failed to create order' }, { status: 502 });
    }
    const order = await res.json();
    return NextResponse.json({
      orderId: order.id,
      amountPaise: order.amount,
      currency: order.currency,
      status: 'real',
      sessionId,
      mentorId,
    });
  } catch (err) {
    console.error('[razorpay create-order] threw', err);
    return NextResponse.json({ error: 'Payment provider unreachable' }, { status: 502 });
  }
}
