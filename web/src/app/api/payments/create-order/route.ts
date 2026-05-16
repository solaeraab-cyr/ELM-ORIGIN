import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(req: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 });
  }

  let plan: string;
  let amount: number;
  try {
    const body = await req.json();
    plan = String(body.plan ?? '').toLowerCase();
    amount = plan === 'elite' ? 299 : 99;
    if (plan !== 'pro' && plan !== 'elite') {
      return NextResponse.json({ error: 'Invalid plan' }, { status: 400 });
    }
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const appId = process.env.CASHFREE_APP_ID;
  const secretKey = process.env.CASHFREE_SECRET_KEY;

  // ── Mock mode ──────────────────────────────────────────────────────────────
  if (!appId || !secretKey) {
    return NextResponse.json({
      orderId: `mock_${Date.now()}`,
      status: 'mock',
      plan,
      amount,
    });
  }

  // ── Real Cashfree order ────────────────────────────────────────────────────
  const env = process.env.CASHFREE_ENV === 'PROD' ? 'prod' : 'sandbox';
  const baseUrl = env === 'prod'
    ? 'https://api.cashfree.com/pg/orders'
    : 'https://sandbox.cashfree.com/pg/orders';

  const orderId = `elmorigin_${user.id.slice(0, 8)}_${Date.now()}`;

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, email')
    .eq('id', user.id)
    .single();

  const res = await fetch(baseUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-version': '2023-08-01',
      'x-client-id': appId,
      'x-client-secret': secretKey,
    },
    body: JSON.stringify({
      order_id: orderId,
      order_amount: amount,
      order_currency: 'INR',
      customer_details: {
        customer_id: user.id,
        customer_email: profile?.email ?? user.email ?? '',
        customer_name: profile?.full_name ?? 'User',
        customer_phone: '9999999999',
      },
      order_meta: {
        return_url: `${process.env.NEXT_PUBLIC_APP_URL ?? ''}/pricing/checkout?plan=${plan}&order_id={order_id}&status={payment_status}`,
      },
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    console.error('[create-order] Cashfree error:', err);
    return NextResponse.json({ error: 'Failed to create order' }, { status: 502 });
  }

  const order = await res.json();
  return NextResponse.json({
    orderId: order.order_id,
    paymentSessionId: order.payment_session_id,
    status: 'real',
    plan,
    amount,
  });
}
