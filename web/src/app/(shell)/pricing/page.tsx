'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

type PlanId = 'Free' | 'Pro' | 'Elite';

const PLANS: {
  id: PlanId;
  name: string;
  price: number;
  tagline: string;
  highlight?: boolean;
  premium?: boolean;
  limits: string[];
  features: string[];
}[] = [
  {
    id: 'Free',
    name: 'Free',
    price: 0,
    tagline: 'Perfect to get started',
    limits: ['3 rooms / day', '2 interviews / day', '5 AI chats / month', '5 friend requests / month'],
    features: [
      'Public study rooms',
      'Basic Pomodoro timer',
      'Community access',
      'Basic mentor access',
      'Peer study matching',
    ],
  },
  {
    id: 'Pro',
    name: 'Pro',
    price: 99,
    tagline: 'Most popular',
    highlight: true,
    limits: ['10 rooms / day', '10 interviews / day', '50 AI chats / month', '25 friend requests / month'],
    features: [
      'Everything in Free',
      'Private & collaborative rooms',
      'Custom Pomodoro timers',
      'Priority mentor booking',
      'Interview analytics',
      'Community badges',
    ],
  },
  {
    id: 'Elite',
    name: 'Elite',
    price: 299,
    tagline: 'For serious learners',
    premium: true,
    limits: ['Unlimited rooms', 'Unlimited interviews', 'Unlimited AI chats', 'Unlimited friend requests'],
    features: [
      'Everything in Pro',
      '1-on-1 mentor sessions',
      'Personal study coach',
      'Career mentor matching',
      'All badges + perks',
      'Priority 24/7 support',
      'Early access features',
    ],
  },
];

const PLAN_ORDER: PlanId[] = ['Free', 'Pro', 'Elite'];

const COMPARISON_ROWS: { label: string; free: string | boolean; pro: string | boolean; elite: string | boolean }[] = [
  { label: 'Study rooms / day',         free: '3',         pro: '10',          elite: 'Unlimited' },
  { label: 'Peer interviews / day',     free: '2',         pro: '10',          elite: 'Unlimited' },
  { label: 'Nova AI chats / month',     free: '5',         pro: '50',          elite: 'Unlimited' },
  { label: 'Friend requests / month',   free: '5',         pro: '25',          elite: 'Unlimited' },
  { label: 'Private rooms',             free: false,       pro: true,          elite: true        },
  { label: 'Custom Pomodoro timers',    free: false,       pro: true,          elite: true        },
  { label: 'Interview analytics',       free: false,       pro: true,          elite: true        },
  { label: 'Community badges',          free: false,       pro: true,          elite: true        },
  { label: 'Priority mentor booking',   free: false,       pro: true,          elite: true        },
  { label: '1-on-1 mentor sessions',    free: false,       pro: false,         elite: true        },
  { label: 'Personal study coach',      free: false,       pro: false,         elite: true        },
  { label: 'All badges + perks',        free: false,       pro: false,         elite: true        },
  { label: 'Priority 24/7 support',     free: false,       pro: false,         elite: true        },
  { label: 'Early access features',     free: false,       pro: false,         elite: true        },
];

const FAQ = [
  ['What happens at the end of my free trial?', 'Your account remains active on the Free plan. We never auto-charge you without explicit consent.'],
  ['Can I switch between plans?', 'Yes — upgrade or downgrade anytime. Prorated for the current cycle.'],
  ['How does mentor billing work?', 'Mentor sessions are billed per session at the time of booking. Your monthly allowance is applied automatically.'],
  ['Is there a student discount?', 'Yes! Verify with your .edu or institute email and get an additional 20% off annual plans.'],
  ['What payment methods will you accept?', 'Card, UPI, Net Banking, and Wallets via Cashfree and Razorpay. Secured by 256-bit encryption.'],
];

function CellVal({ val, accent }: { val: string | boolean; accent?: boolean }) {
  if (typeof val === 'boolean') {
    return val
      ? <span style={{ color: accent ? 'var(--brand-500, #4f46e5)' : '#10b981', fontWeight: 700, fontSize: 16 }}>✓</span>
      : <span style={{ color: 'var(--text-tertiary)', fontSize: 15 }}>—</span>;
  }
  return <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{val}</span>;
}

export default function PricingPage() {
  const router = useRouter();
  const [userPlan, setUserPlan] = useState<PlanId | null>(null);
  const [loadingPlan, setLoadingPlan] = useState(true);
  const [faqOpen, setFaqOpen] = useState<number | null>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) { setLoadingPlan(false); return; }
      const { data } = await supabase
        .from('profiles')
        .select('plan')
        .eq('id', user.id)
        .single();
      const raw = (data?.plan as string | null) ?? 'Free';
      const plan = PLAN_ORDER.includes(raw as PlanId) ? (raw as PlanId) : 'Free';
      setUserPlan(plan);
      setLoadingPlan(false);
    });
  }, []);

  const handleUpgrade = (planId: PlanId) => {
    router.push(`/pricing/checkout?plan=${planId.toLowerCase()}`);
  };

  const userPlanIndex = userPlan ? PLAN_ORDER.indexOf(userPlan) : -1;

  const getCtaLabel = (plan: typeof PLANS[0]): string => {
    if (loadingPlan) return '...';
    const idx = PLAN_ORDER.indexOf(plan.id);
    if (userPlan === plan.id) return 'Current Plan';
    if (idx < userPlanIndex) return 'Downgrade';
    return plan.id === 'Free' ? 'Get Started' : `Upgrade to ${plan.name}`;
  };

  const isCurrentPlan = (id: PlanId) => !loadingPlan && userPlan === id;
  const isUpgrade = (id: PlanId) => {
    const idx = PLAN_ORDER.indexOf(id);
    return idx > userPlanIndex;
  };

  return (
    <div style={{ padding: '32px 40px 80px', maxWidth: 1100, margin: '0 auto' }}>
      <style>{`
        @keyframes pulse  { 0%,100% { opacity:1 } 50% { opacity:0.5 } }
      `}</style>

      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: 48, paddingTop: 24 }}>
        <h1 style={{ fontFamily: 'Fraunces, serif', fontSize: 'clamp(34px, 5vw, 52px)', fontWeight: 800, lineHeight: 1.05, letterSpacing: '-0.02em', maxWidth: 720, margin: '0 auto 14px' }}>
          The environment. The support. The results.
        </h1>
        <p style={{ fontSize: 17, color: 'var(--text-secondary)' }}>Start free. Upgrade when you&apos;re ready.</p>
        {userPlan && !loadingPlan && (
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, marginTop: 14, padding: '6px 14px', borderRadius: 999, background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', fontSize: 13 }}>
            <span style={{ color: 'var(--text-tertiary)' }}>You are on</span>
            <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{userPlan}</span>
          </div>
        )}
      </div>

      {/* Plan cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 22, marginBottom: 60, alignItems: 'center' }}>
        {PLANS.map(plan => {
          const current = isCurrentPlan(plan.id);
          const upgrade = isUpgrade(plan.id);
          const ctaLabel = getCtaLabel(plan);

          return (
            <div key={plan.id} style={{
              position: 'relative', padding: 32, borderRadius: 22,
              background: plan.premium
                ? 'linear-gradient(180deg, rgba(245,158,11,0.06), var(--bg-surface))'
                : plan.highlight
                  ? 'linear-gradient(180deg, rgba(79,70,229,0.08), var(--bg-surface))'
                  : 'var(--bg-surface)',
              border: `1.5px solid ${current ? '#10b981' : plan.highlight ? 'var(--brand-400, var(--brand-500))' : plan.premium ? 'var(--amber-400, var(--amber-500))' : 'var(--border-subtle)'}`,
              transform: plan.highlight ? 'scale(1.03)' : 'scale(1)',
              boxShadow: current
                ? '0 24px 60px -20px rgba(16,185,129,0.25)'
                : plan.highlight
                  ? '0 24px 60px -20px rgba(79,70,229,0.25)'
                  : 'none',
            }}>
              {/* Badge */}
              {current ? (
                <div style={{ position: 'absolute', top: -14, left: '50%', transform: 'translateX(-50%)', padding: '5px 14px', borderRadius: 999, background: '#10b981', color: '#fff', fontSize: 11, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>
                  Current Plan
                </div>
              ) : plan.highlight ? (
                <div style={{ position: 'absolute', top: -14, left: '50%', transform: 'translateX(-50%)', padding: '5px 14px', borderRadius: 999, background: 'var(--gradient-brand)', color: '#fff', fontSize: 11, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>
                  Most Popular
                </div>
              ) : plan.premium ? (
                <div style={{ position: 'absolute', top: -14, left: '50%', transform: 'translateX(-50%)', padding: '5px 14px', borderRadius: 999, background: 'linear-gradient(135deg,#F59E0B,#D97706)', color: '#fff', fontSize: 11, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>
                  Best Value
                </div>
              ) : null}

              <div style={{ fontWeight: 700, fontSize: 18, marginBottom: 4 }}>{plan.name}</div>
              <div style={{ fontSize: 12, color: 'var(--text-tertiary)', marginBottom: 18 }}>{plan.tagline}</div>

              {/* Price */}
              <div style={{ fontFamily: 'Fraunces, serif', fontSize: 40, fontWeight: 700, marginBottom: 6, letterSpacing: '-0.01em' }}>
                {plan.price === 0 ? 'Free' : <>₹{plan.price}<span style={{ fontSize: 16, color: 'var(--text-secondary)', fontWeight: 500 }}>/mo</span></>}
              </div>

              {/* Limits */}
              <div style={{ marginBottom: 22, display: 'flex', flexDirection: 'column', gap: 5 }}>
                {plan.limits.map((l, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--text-secondary)' }}>
                    <span style={{ width: 6, height: 6, borderRadius: 999, background: plan.highlight ? 'var(--brand-500, #4f46e5)' : plan.premium ? '#F59E0B' : 'var(--text-tertiary)', flexShrink: 0 }} />
                    {l}
                  </div>
                ))}
              </div>

              {/* Features */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 26 }}>
                {plan.features.map((f, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 9, fontSize: 13 }}>
                    <span style={{ color: plan.highlight ? 'var(--brand-500, #4f46e5)' : '#10b981', fontWeight: 700, fontSize: 12, marginTop: 1, flexShrink: 0 }}>✓</span>
                    <span style={{ color: 'var(--text-primary)', lineHeight: 1.4 }}>{f}</span>
                  </div>
                ))}
              </div>

              {/* CTA */}
              {loadingPlan ? (
                <div style={{ width: '100%', height: 48, borderRadius: 999, background: 'var(--bg-hover)', animation: 'pulse 1.5s ease-in-out infinite' }} />
              ) : (
                <button
                  onClick={upgrade ? () => handleUpgrade(plan.id) : undefined}
                  disabled={current}
                  style={{
                    width: '100%', height: 48, borderRadius: 999, fontSize: 14, fontWeight: 600,
                    background: current
                      ? 'var(--bg-hover)'
                      : plan.premium
                        ? 'linear-gradient(135deg,#F59E0B,#D97706)'
                        : plan.highlight
                          ? 'var(--gradient-brand)'
                          : 'var(--bg-hover)',
                    color: current
                      ? 'var(--text-secondary)'
                      : (plan.highlight || plan.premium) ? '#fff' : 'var(--text-primary)',
                    border: (current || plan.highlight || plan.premium) ? 'none' : '1px solid var(--border-default)',
                    cursor: current ? 'default' : 'pointer',
                    opacity: loadingPlan ? 0.6 : 1,
                    transition: 'all 200ms',
                  }}
                >
                  {ctaLabel}
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* Trust bar */}
      <div style={{ textAlign: 'center', color: 'var(--text-secondary)', fontSize: 14, marginBottom: 72 }}>
        🔒 Secure payments &nbsp;·&nbsp; 🔄 Cancel anytime &nbsp;·&nbsp; 💰 30-day money-back
      </div>

      {/* Feature comparison table */}
      <div style={{ marginBottom: 72 }}>
        <h2 style={{ fontFamily: 'Fraunces, serif', fontSize: 28, fontWeight: 500, textAlign: 'center', marginBottom: 28 }}>Compare plans</h2>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', background: 'var(--bg-surface)', borderRadius: 18, overflow: 'hidden', border: '1px solid var(--border-subtle)' }}>
            <thead>
              <tr style={{ background: 'var(--bg-hover)' }}>
                <th style={{ padding: '16px 22px', textAlign: 'left', fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', borderBottom: '1px solid var(--border-subtle)', width: '40%' }}>Feature</th>
                {PLANS.map(p => (
                  <th key={p.id} style={{ padding: '16px 22px', textAlign: 'center', fontSize: 13, fontWeight: 700, color: isCurrentPlan(p.id) ? '#10b981' : 'var(--text-primary)', borderBottom: '1px solid var(--border-subtle)' }}>
                    {p.name}
                    {isCurrentPlan(p.id) && <span style={{ display: 'block', fontSize: 10, fontWeight: 600, color: '#10b981', letterSpacing: '0.05em', textTransform: 'uppercase', marginTop: 2 }}>Current</span>}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {COMPARISON_ROWS.map((row, i) => (
                <tr key={i} style={{ background: i % 2 === 0 ? 'var(--bg-surface)' : 'var(--bg-hover, rgba(0,0,0,0.02))' }}>
                  <td style={{ padding: '13px 22px', fontSize: 13, color: 'var(--text-secondary)', borderBottom: '1px solid var(--border-subtle)', fontWeight: 500 }}>{row.label}</td>
                  <td style={{ padding: '13px 22px', textAlign: 'center', borderBottom: '1px solid var(--border-subtle)' }}><CellVal val={row.free} /></td>
                  <td style={{ padding: '13px 22px', textAlign: 'center', borderBottom: '1px solid var(--border-subtle)', background: 'rgba(79,70,229,0.03)' }}><CellVal val={row.pro} accent /></td>
                  <td style={{ padding: '13px 22px', textAlign: 'center', borderBottom: '1px solid var(--border-subtle)' }}><CellVal val={row.elite} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* FAQ */}
      <div style={{ maxWidth: 720, margin: '0 auto' }}>
        <h2 style={{ fontFamily: 'Fraunces, serif', fontSize: 28, fontWeight: 500, textAlign: 'center', marginBottom: 28 }}>Frequently asked</h2>
        {FAQ.map(([q, a], i) => (
          <div key={i} style={{
            background: 'var(--bg-surface)', borderRadius: 14, marginBottom: 10, overflow: 'hidden',
            border: `1px solid ${faqOpen === i ? 'var(--brand-400, var(--brand-500))' : 'var(--border-subtle)'}`,
            transition: 'border-color 200ms',
          }}>
            <button onClick={() => setFaqOpen(faqOpen === i ? null : i)} style={{
              width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '18px 22px', textAlign: 'left',
            }}>
              <span style={{ fontSize: 15, fontWeight: 600 }}>{q}</span>
              <span style={{ fontSize: 22, color: 'var(--text-tertiary)', transition: 'transform 200ms', transform: faqOpen === i ? 'rotate(45deg)' : 'rotate(0)', flexShrink: 0, marginLeft: 16 }}>+</span>
            </button>
            {faqOpen === i && (
              <div style={{ padding: '0 22px 20px', fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.7 }}>{a}</div>
            )}
          </div>
        ))}
      </div>

    </div>
  );
}
