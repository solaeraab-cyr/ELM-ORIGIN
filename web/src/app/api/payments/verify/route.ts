import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

const PLAN_LABELS: Record<string, string> = { pro: 'Pro', elite: 'Elite' };
const PLAN_AMOUNTS: Record<string, number> = { pro: 99, elite: 299 };

export async function POST(req: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 });
  }

  let orderId: string;
  let plan: string;
  try {
    const body = await req.json();
    orderId = String(body.orderId ?? '');
    plan = String(body.plan ?? '').toLowerCase();
    if (plan !== 'pro' && plan !== 'elite') {
      return NextResponse.json({ error: 'Invalid plan' }, { status: 400 });
    }
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const appId = process.env.CASHFREE_APP_ID;
  const secretKey = process.env.CASHFREE_SECRET_KEY;
  const planLabel = PLAN_LABELS[plan];
  const amount = PLAN_AMOUNTS[plan];

  // ── Verify real Cashfree payment ───────────────────────────────────────────
  if (appId && secretKey && !orderId.startsWith('mock_')) {
    const env = process.env.CASHFREE_ENV === 'PROD' ? 'prod' : 'sandbox';
    const baseUrl = env === 'prod'
      ? `https://api.cashfree.com/pg/orders/${orderId}`
      : `https://sandbox.cashfree.com/pg/orders/${orderId}`;

    const res = await fetch(baseUrl, {
      headers: {
        'x-api-version': '2023-08-01',
        'x-client-id': appId,
        'x-client-secret': secretKey,
      },
    });

    if (!res.ok) {
      return NextResponse.json({ error: 'Could not verify payment' }, { status: 502 });
    }

    const order = await res.json();
    if (order.order_status !== 'PAID') {
      return NextResponse.json({ error: 'Payment not completed', status: order.order_status }, { status: 402 });
    }
  }

  // ── Update plan in profiles ────────────────────────────────────────────────
  const { error: profileErr } = await supabase
    .from('profiles')
    .update({ plan: planLabel })
    .eq('id', user.id);

  if (profileErr) {
    console.error('[verify] profile update failed:', profileErr.message);
    return NextResponse.json({ error: 'Failed to update plan' }, { status: 500 });
  }

  // ── Write transaction record ───────────────────────────────────────────────
  // Best-effort — don't fail the verify if the transactions table doesn't exist yet
  await supabase.from('transactions').insert({
    user_id: user.id,
    order_id: orderId,
    plan: planLabel,
    amount,
    currency: 'INR',
    status: 'paid',
    is_mock: orderId.startsWith('mock_'),
    created_at: new Date().toISOString(),
  }).then(({ error }) => {
    if (error) console.warn('[verify] transactions insert skipped:', error.message);
  });

  return NextResponse.json({ success: true, plan: planLabel });
}
