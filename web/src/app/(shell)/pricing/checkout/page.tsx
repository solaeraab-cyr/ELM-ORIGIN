'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

type PlanId = 'pro' | 'elite';
type Stage = 'confirm' | 'processing' | 'success' | 'error';

const PLAN_DETAILS = {
  pro: {
    name: 'Pro',
    price: 99,
    color: 'var(--gradient-brand)',
    features: [
      '10 study rooms / day',
      '10 peer interviews / day',
      '50 AI chats / month',
      '25 friend requests / month',
      'Private & collaborative rooms',
      'Priority mentor booking',
      'Community badges',
    ],
  },
  elite: {
    name: 'Elite',
    price: 299,
    color: 'linear-gradient(135deg,#F59E0B,#D97706)',
    features: [
      'Unlimited study rooms',
      'Unlimited peer interviews',
      'Unlimited AI chats',
      'Unlimited friend requests',
      '1-on-1 mentor sessions',
      'All badges + perks',
      'Priority 24/7 support',
      'Early access features',
    ],
  },
} as const satisfies Record<PlanId, { name: string; price: number; color: string; features: string[] }>;

function CheckoutContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const planParam = searchParams.get('plan')?.toLowerCase() as PlanId | null;

  const [stage, setStage] = useState<Stage>('confirm');
  const [errorMsg, setErrorMsg] = useState('');
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const isMockMode = !process.env.NEXT_PUBLIC_CASHFREE_APP_ID;

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) { router.replace('/login'); return; }
      setUserEmail(user.email ?? '');
      const { data } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', user.id)
        .single();
      setUserName((data?.full_name as string | null) ?? user.email?.split('@')[0] ?? 'User');
    });
  }, [router]);

  if (!planParam || !(planParam in PLAN_DETAILS)) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        <div style={{ textAlign: 'center' }}>
          <p style={{ color: 'var(--text-secondary)', marginBottom: 16 }}>Invalid plan selected.</p>
          <Link href="/pricing" style={{ color: 'var(--brand-500, #4f46e5)', fontWeight: 600 }}>← Back to pricing</Link>
        </div>
      </div>
    );
  }

  const plan = PLAN_DETAILS[planParam];

  const handlePay = async () => {
    setStage('processing');
    try {
      // Create order
      const orderRes = await fetch('/api/payments/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: planParam }),
      });
      const order = await orderRes.json();
      if (order.error) throw new Error(order.error);

      // Mock mode: simulate 2s processing then verify
      if (order.status === 'mock') {
        await new Promise(r => setTimeout(r, 2000));
      }

      // Verify & update plan
      const verifyRes = await fetch('/api/payments/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId: order.orderId, plan: planParam }),
      });
      const verify = await verifyRes.json();
      if (verify.error) throw new Error(verify.error);

      setStage('success');
    } catch (err) {
      setErrorMsg((err as Error).message ?? 'Something went wrong');
      setStage('error');
    }
  };

  // ── Success screen ─────────────────────────────────────────────────────────
  if (stage === 'success') {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, background: 'var(--bg-base)' }}>
        <div style={{ width: 460, maxWidth: '100%', background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 24, padding: 40, textAlign: 'center', boxShadow: 'var(--shadow-xl)' }}>
          <div style={{ width: 72, height: 72, borderRadius: 999, background: '#10b981', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', fontSize: 32, boxShadow: '0 0 0 12px rgba(16,185,129,0.12)' }}>✓</div>
          <h2 style={{ fontFamily: 'Fraunces, serif', fontStyle: 'italic', fontSize: 32, fontWeight: 600, marginBottom: 8 }}>
            Welcome to {plan.name}!
          </h2>
          <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 10 }}>
            Your account has been upgraded.{isMockMode && <span style={{ color: 'var(--text-tertiary)' }}> (Mock payment)</span>}
          </p>
          <p style={{ fontSize: 13, color: 'var(--text-tertiary)', marginBottom: 28 }}>
            A receipt has been recorded in your account.
          </p>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
            <Link href="/invoices" style={{ height: 40, padding: '0 18px', borderRadius: 999, background: 'var(--bg-hover)', border: '1px solid var(--border-default)', fontSize: 13, fontWeight: 500, display: 'inline-flex', alignItems: 'center', textDecoration: 'none', color: 'var(--text-primary)' }}>
              View receipt
            </Link>
            <button
              onClick={() => router.push('/home')}
              style={{ height: 40, padding: '0 20px', borderRadius: 999, background: plan.color, color: '#fff', fontSize: 13, fontWeight: 600, border: 'none' }}
            >
              Go to dashboard →
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Error screen ───────────────────────────────────────────────────────────
  if (stage === 'error') {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        <div style={{ width: 440, maxWidth: '100%', background: 'var(--bg-surface)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: 22, padding: 36, textAlign: 'center' }}>
          <div style={{ fontSize: 40, marginBottom: 16 }}>⚠️</div>
          <h3 style={{ fontFamily: 'Fraunces, serif', fontSize: 22, fontWeight: 600, marginBottom: 8 }}>Payment failed</h3>
          <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 24 }}>{errorMsg}</p>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
            <button onClick={() => setStage('confirm')} style={{ height: 40, padding: '0 18px', borderRadius: 999, background: 'var(--bg-hover)', border: '1px solid var(--border-default)', fontSize: 13, fontWeight: 500 }}>Try again</button>
            <Link href="/pricing" style={{ height: 40, padding: '0 18px', borderRadius: 999, background: 'var(--bg-hover)', border: '1px solid var(--border-default)', fontSize: 13, fontWeight: 500, display: 'inline-flex', alignItems: 'center', textDecoration: 'none', color: 'var(--text-primary)' }}>← Back</Link>
          </div>
        </div>
      </div>
    );
  }

  // ── Processing screen ──────────────────────────────────────────────────────
  if (stage === 'processing') {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: 52, height: 52, borderRadius: 999, border: '3px solid var(--brand-500, #4f46e5)', borderTopColor: 'transparent', margin: '0 auto 20px', animation: 'spin 0.8s linear infinite' }} />
          <p style={{ fontSize: 15, fontWeight: 600 }}>Processing payment…</p>
          <p style={{ fontSize: 13, color: 'var(--text-tertiary)', marginTop: 6 }}>Please don't close this window.</p>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      </div>
    );
  }

  // ── Confirm screen ─────────────────────────────────────────────────────────
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-base)', padding: '60px 24px' }}>
      <div style={{ maxWidth: 520, margin: '0 auto' }}>

        <Link href="/pricing" style={{ fontSize: 13, color: 'var(--text-tertiary)', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 4, marginBottom: 32 }}>
          ← Back to pricing
        </Link>

        <h1 style={{ fontFamily: 'Fraunces, serif', fontSize: 36, fontWeight: 700, letterSpacing: '-0.02em', marginBottom: 6 }}>
          Upgrade to {plan.name}
        </h1>
        <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 32 }}>
          {userName && <>Hi {userName} — </>}review your order below.
        </p>

        {/* Order summary card */}
        <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 18, padding: 26, marginBottom: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', color: 'var(--text-tertiary)', textTransform: 'uppercase', marginBottom: 4 }}>Plan</div>
              <div style={{ fontFamily: 'Fraunces, serif', fontSize: 26, fontWeight: 700 }}>ELM Origin {plan.name}</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', color: 'var(--text-tertiary)', textTransform: 'uppercase', marginBottom: 4 }}>Monthly</div>
              <div style={{ fontFamily: 'Fraunces, serif', fontSize: 26, fontWeight: 700 }}>₹{plan.price}</div>
            </div>
          </div>
          <div style={{ height: 1, background: 'var(--border-subtle)', marginBottom: 16 }} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {plan.features.map(f => (
              <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}>
                <span style={{ color: '#10b981', fontWeight: 700, flexShrink: 0 }}>✓</span>
                <span style={{ color: 'var(--text-secondary)' }}>{f}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Billing details */}
        <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 14, padding: 18, marginBottom: 20 }}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', color: 'var(--text-tertiary)', textTransform: 'uppercase', marginBottom: 14 }}>Billing details</div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 8 }}>
            <span style={{ color: 'var(--text-secondary)' }}>Email</span>
            <span style={{ fontWeight: 500 }}>{userEmail || '…'}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 8 }}>
            <span style={{ color: 'var(--text-secondary)' }}>Billing cycle</span>
            <span style={{ fontWeight: 500 }}>Monthly</span>
          </div>
          <div style={{ height: 1, background: 'var(--border-subtle)', margin: '12px 0' }} />
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 15, fontWeight: 700 }}>
            <span>Total due today</span>
            <span>₹{plan.price}</span>
          </div>
        </div>

        {/* Mock mode notice */}
        {isMockMode && (
          <div style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)', borderRadius: 12, padding: '12px 16px', marginBottom: 20, display: 'flex', gap: 10, alignItems: 'flex-start' }}>
            <span style={{ fontSize: 16, flexShrink: 0 }}>🧪</span>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              <strong>Mock payment mode</strong> — No real payment will be charged. Click pay to simulate a successful transaction and upgrade your plan.
            </p>
          </div>
        )}

        <button
          onClick={handlePay}
          style={{
            width: '100%', height: 52, borderRadius: 999,
            background: plan.color,
            color: '#fff', fontSize: 15, fontWeight: 700,
            border: 'none', cursor: 'pointer',
            boxShadow: '0 4px 20px rgba(79,70,229,0.3)',
          }}
        >
          {isMockMode ? `🧪 Simulate ₹${plan.price} payment` : `🔒 Pay ₹${plan.price} securely`}
        </button>

        <p style={{ fontSize: 12, color: 'var(--text-tertiary)', textAlign: 'center', marginTop: 14 }}>
          {isMockMode
            ? 'Mock mode — plan will be upgraded, no real charge'
            : '🔒 Secured by Cashfree · Cancel anytime · 30-day money-back'}
        </p>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: 40, height: 40, borderRadius: 999, border: '3px solid var(--brand-500, #4f46e5)', borderTopColor: 'transparent', animation: 'spin 0.8s linear infinite' }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    }>
      <CheckoutContent />
    </Suspense>
  );
}
