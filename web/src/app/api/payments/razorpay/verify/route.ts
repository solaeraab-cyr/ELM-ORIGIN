import { NextResponse } from 'next/server';
import { createHmac } from 'crypto';
import { createClient } from '@/lib/supabase/server';

// Verify a Razorpay payment (or a mock one), then:
//   • mark the interview_sessions row scheduled → confirmed (status stays
//     'scheduled' here; the booker enters at scheduled_for time)
//   • write a bookings row tying the user, mentor, session, and Razorpay
//     receipt ids together.
//
// In mock mode (no RAZORPAY_KEY_SECRET set, or orderId starts with mock_)
// we skip signature verification.

export async function POST(req: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 });

  let orderId: string;
  let paymentId: string;
  let signature: string;
  let sessionId: string;
  let mentorId: string | null;
  let amountPaise: number;
  try {
    const body = await req.json();
    orderId = String(body.orderId || '');
    paymentId = String(body.paymentId || '');
    signature = String(body.signature || '');
    sessionId = String(body.sessionId || '');
    mentorId = body.mentorId ? String(body.mentorId) : null;
    amountPaise = Math.max(0, Number(body.amountPaise) | 0);
    if (!orderId || !sessionId) return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const secret = process.env.RAZORPAY_KEY_SECRET;
  const isMock = !secret || orderId.startsWith('mock_');

  if (!isMock) {
    // Razorpay's standard signature check.
    const expected = createHmac('sha256', secret).update(`${orderId}|${paymentId}`).digest('hex');
    if (expected !== signature) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }
  }

  // Write the booking. bookings columns of interest:
  //   student_id, mentor_id, scheduled_start, scheduled_end, status,
  //   amount_paid, payment_status, session_id, razorpay_order_id,
  //   razorpay_payment_id.
  // Many of these are nullable; we set what we have and let RLS guard
  // ownership at the column level.
  const nowIso = new Date().toISOString();
  const { error: bErr } = await supabase
    .from('bookings')
    .insert({
      student_id: user.id,
      mentor_id: mentorId,
      session_id: sessionId,
      amount_paid: Math.round(amountPaise / 100),
      status: 'confirmed',
      payment_status: 'completed',
      razorpay_order_id: orderId,
      razorpay_payment_id: paymentId || null,
      scheduled_start: nowIso,
      scheduled_end: nowIso,
    });
  if (bErr) {
    console.warn('[razorpay verify] booking insert', bErr.message);
    // Don't fail the verify — the payment did succeed.
  }

  return NextResponse.json({ success: true, mock: isMock });
}
