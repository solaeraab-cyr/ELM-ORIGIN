'use client';

import { useState } from 'react';
import Icon from '@/components/primitives/Icon';

const FEATURES = {
  explorer: [
    [true,  'Public study rooms'],
    [true,  '25-min Pomodoro timer'],
    [true,  '20 Nova messages/day'],
    [true,  '2 mentor sessions/month'],
    [false, 'Collaborative rooms'],
    [false, 'Unlimited Nova'],
    [false, 'DM mentors anytime'],
    [false, 'Custom themes'],
    [false, 'Goal tracking'],
    [false, 'Advanced analytics'],
  ],
  pro: [
    [true, 'Public study rooms'],
    [true, 'Custom Pomodoro timers'],
    [true, 'Unlimited Nova messages'],
    [true, '4 mentor sessions/month'],
    [true, 'Collaborative & private rooms'],
    [true, 'Voice & image Nova'],
    [true, 'DM mentors anytime'],
    [true, 'Custom themes'],
    [true, 'Goal tracking'],
    [true, 'Advanced analytics'],
  ],
  elite: [
    [true, 'Everything in Pro'],
    [true, 'Priority booking with top mentors'],
    [true, 'Group masterclasses included'],
    [true, 'Personal study coach'],
    [true, 'Career mentor matching'],
    [true, '4 sessions/mo with verified mentors'],
    [true, 'White-glove onboarding'],
    [true, 'Quarterly progress reports'],
    [true, 'Early access features'],
    [true, '24/7 priority support'],
  ],
} as const;

const FAQ = [
  ['What happens at the end of my free trial?', 'Your account remains active on the Free plan. We never auto-charge you without explicit consent.'],
  ['Can I switch between plans?', 'Yes — upgrade or downgrade anytime. Prorated for the current cycle.'],
  ['How does mentor billing work?', 'Mentor sessions are billed per session at the time of booking. Your monthly allowance is applied automatically.'],
  ['Is there a student discount?', 'Yes! Verify with your .edu or institute email and get an additional 20% off annual plans.'],
  ['What payment methods do you accept?', 'Card, UPI, Net Banking, and Wallets via Cashfree and Razorpay. Secured by 256-bit encryption.'],
];

function PlanCard({
  name, tagline, price, features, ctaLabel, ctaVariant, ctaDisabled, ctaSub, onCta, highlight, premium,
}: {
  name: string; tagline: string; price: React.ReactNode;
  features: readonly (readonly [boolean, string])[];
  ctaLabel: string; ctaVariant: 'ghost' | 'primary' | 'premium';
  ctaDisabled?: boolean; ctaSub?: string;
  onCta: () => void; highlight?: boolean; premium?: boolean;
}) {
  return (
    <div style={{
      position: 'relative', padding: 32, borderRadius: 22,
      background: premium
        ? 'linear-gradient(180deg, rgba(245,158,11,0.06), var(--bg-surface))'
        : highlight
          ? 'linear-gradient(180deg, rgba(79,70,229,0.08), var(--bg-surface))'
          : 'var(--bg-surface)',
      border: `1px solid ${highlight ? 'var(--brand-400, var(--brand-500))' : premium ? 'var(--amber-400, var(--amber-500))' : 'var(--border-subtle)'}`,
      transform: highlight ? 'scale(1.03)' : 'scale(1)',
      boxShadow: highlight ? '0 24px 60px -20px rgba(79,70,229,0.30)' : 'none',
    }}>
      {highlight && <div style={{ position: 'absolute', top: -14, left: '50%', transform: 'translateX(-50%)', padding: '5px 14px', borderRadius: 999, background: 'var(--gradient-brand)', color: '#fff', fontSize: 11, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>Most Popular</div>}
      {premium && <div style={{ position: 'absolute', top: -14, left: '50%', transform: 'translateX(-50%)', padding: '5px 14px', borderRadius: 999, background: 'linear-gradient(135deg,#F59E0B,#D97706)', color: '#fff', fontSize: 11, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>Elite</div>}
      <div style={{ fontWeight: 700, fontSize: 18, marginBottom: 4 }}>{name}</div>
      <div style={{ fontSize: 12, color: 'var(--text-tertiary)', marginBottom: 18 }}>{tagline}</div>
      <div style={{ fontFamily: 'Fraunces, serif', fontSize: 38, fontWeight: 700, marginBottom: 22, letterSpacing: '-0.01em' }}>{price}</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 9, marginBottom: 24 }}>
        {features.map(([ok, label], i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13 }}>
            <span style={{ width: 16, height: 16, borderRadius: 999, display: 'flex', alignItems: 'center', justifyContent: 'center', color: ok ? (highlight ? 'var(--brand-500)' : 'var(--mint-600)') : 'var(--text-tertiary)', fontWeight: 700, fontSize: 11, flexShrink: 0 }}>{ok ? '✓' : '✗'}</span>
            <span style={{ color: ok ? 'var(--text-primary)' : 'var(--text-tertiary)', opacity: ok ? 1 : 0.7 }}>{label}</span>
          </div>
        ))}
      </div>
      <button onClick={onCta} disabled={ctaDisabled} style={{
        width: '100%', height: 48, borderRadius: 999, fontSize: 14, fontWeight: 600,
        background: ctaVariant === 'primary' ? 'var(--gradient-brand)' : ctaVariant === 'premium' ? 'linear-gradient(135deg,#F59E0B,#D97706)' : 'var(--bg-hover)',
        color: ctaVariant === 'ghost' ? 'var(--text-primary)' : '#fff',
        border: ctaVariant === 'ghost' ? '1px solid var(--border-default)' : 'none',
        opacity: ctaDisabled ? 0.55 : 1,
        cursor: ctaDisabled ? 'default' : 'pointer',
        transition: 'all 200ms',
      }}>{ctaLabel}</button>
      {ctaSub && <div style={{ fontSize: 11, color: 'var(--text-tertiary)', textAlign: 'center', marginTop: 10 }}>{ctaSub}</div>}
    </div>
  );
}

function CheckoutModal({ plan, price, onClose, onSuccess }: { plan: 'pro' | 'elite'; price: number; onClose: () => void; onSuccess: () => void }) {
  const [status, setStatus] = useState<'form' | 'loading' | 'success'>('form');
  const [card, setCard] = useState('');
  const planName = plan === 'pro' ? 'Pro' : 'Elite';
  const formatCard = (v: string) => v.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim();

  const pay = () => {
    setStatus('loading');
    setTimeout(() => setStatus('success'), 1500);
  };

  return (
    <div onClick={status === 'loading' ? undefined : onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(14,18,40,0.28)', backdropFilter: 'blur(6px)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div onClick={e => e.stopPropagation()} style={{ width: '100%', maxWidth: 440, background: 'var(--bg-surface)', borderRadius: 22, padding: 32, boxShadow: 'var(--shadow-xl)', border: '1px solid var(--border-subtle)' }}>

        {status === 'form' && (
          <>
            <h3 style={{ fontFamily: 'Fraunces, serif', fontSize: 26, fontWeight: 600, marginBottom: 20 }}>Upgrade to {planName}</h3>
            <div style={{ background: 'linear-gradient(135deg, rgba(79,70,229,0.06), transparent)', border: '1px solid var(--border-subtle)', borderRadius: 12, padding: 16, marginBottom: 18, display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontWeight: 600 }}>{planName} plan</span>
              <span style={{ fontFamily: 'JetBrains Mono, monospace', fontWeight: 600 }}>₹{price}/mo</span>
            </div>
            <div style={{ display: 'flex', gap: 6, marginBottom: 14 }}>
              {['Card', 'UPI', 'Net Banking'].map((t, i) => (
                <button key={t} style={{ flex: 1, height: 34, borderRadius: 999, fontSize: 13, fontWeight: 500, background: i === 0 ? 'var(--text-primary)' : 'var(--bg-surface)', color: i === 0 ? '#fff' : 'var(--text-secondary)', border: '1px solid var(--border-default)' }}>{t}</button>
              ))}
            </div>
            <input placeholder="Card number" value={card} onChange={e => setCard(formatCard(e.target.value))}
              style={{ width: '100%', height: 42, padding: '0 14px', background: 'var(--bg-base)', border: '1px solid var(--border-default)', borderRadius: 10, fontSize: 14, fontFamily: 'JetBrains Mono, monospace', color: 'var(--text-primary)', outline: 'none', marginBottom: 8 }} />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 14 }}>
              {['MM / YY', 'CVV'].map(p => (
                <input key={p} placeholder={p} style={{ height: 42, padding: '0 14px', background: 'var(--bg-base)', border: '1px solid var(--border-default)', borderRadius: 10, fontSize: 14, fontFamily: 'JetBrains Mono, monospace', color: 'var(--text-primary)', outline: 'none' }} />
              ))}
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-tertiary)', textAlign: 'center', marginBottom: 16 }}>🔒 Secured by Cashfree · Visa · MC · RuPay</div>
            <button onClick={pay} style={{ width: '100%', height: 48, borderRadius: 999, background: 'var(--gradient-brand)', color: '#fff', fontSize: 15, fontWeight: 600 }}>🔒 Pay ₹{price} Securely</button>
          </>
        )}

        {status === 'loading' && (
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <div style={{ width: 48, height: 48, borderRadius: 999, border: '3px solid var(--brand-500)', borderTopColor: 'transparent', margin: '0 auto 20px', animation: 'spin 0.8s linear infinite' }} />
            <div style={{ fontWeight: 600, fontSize: 15 }}>Processing…</div>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </div>
        )}

        {status === 'success' && (
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <div style={{ width: 72, height: 72, borderRadius: 999, background: 'var(--mint-500, #10b981)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', boxShadow: '0 0 0 10px rgba(16,185,129,0.12)' }}>
              <Icon name="check" size={32} />
            </div>
            <h3 style={{ fontFamily: 'Fraunces, serif', fontStyle: 'italic', fontSize: 28, fontWeight: 500, marginBottom: 6 }}>Welcome to {planName} 🎉</h3>
            <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 24 }}>Your account has been upgraded.</p>
            <button onClick={onSuccess} style={{ height: 44, padding: '0 24px', borderRadius: 999, background: 'var(--gradient-brand)', color: '#fff', fontSize: 14, fontWeight: 600 }}>Continue to Dashboard</button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function PricingPage() {
  const [billing, setBilling] = useState<'monthly' | 'annual'>('annual');
  const [checkout, setCheckout] = useState<'pro' | 'elite' | null>(null);
  const [faqOpen, setFaqOpen] = useState<number | null>(null);

  const prices = {
    pro:   billing === 'monthly' ? 499  : 349,
    elite: billing === 'monthly' ? 1299 : 899,
  };

  return (
    <div style={{ padding: '32px 40px 80px', maxWidth: 1100, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: 36, paddingTop: 24 }}>
        <h1 style={{ fontFamily: 'Fraunces, serif', fontSize: 'clamp(34px, 5vw, 52px)', fontWeight: 800, lineHeight: 1.05, letterSpacing: '-0.02em', maxWidth: 720, margin: '0 auto 14px' }}>
          The environment. The support. The results.
        </h1>
        <p style={{ fontSize: 17, color: 'var(--text-secondary)' }}>Start free. Upgrade when you&apos;re ready.</p>
      </div>

      {/* Billing toggle */}
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 40 }}>
        <div style={{ display: 'flex', padding: 4, borderRadius: 999, background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', gap: 2 }}>
          {(['monthly', 'annual'] as const).map(b => (
            <button key={b} onClick={() => setBilling(b)} style={{
              padding: '8px 22px', borderRadius: 999, fontSize: 13, fontWeight: 600,
              color: billing === b ? '#fff' : 'var(--text-secondary)',
              background: billing === b ? 'var(--gradient-brand)' : 'transparent',
              transition: 'all 220ms',
            }}>
              {b.charAt(0).toUpperCase() + b.slice(1)}
              {b === 'annual' && <span style={{ marginLeft: 6, fontSize: 11, color: billing === b ? 'rgba(255,255,255,0.85)' : 'var(--amber-600)', fontWeight: 700 }}>Save 30%</span>}
            </button>
          ))}
        </div>
      </div>

      {/* Plan cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 22, marginBottom: 60, alignItems: 'center' }}>
        <PlanCard
          name="Explorer" tagline="Perfect to get started" price="Free forever"
          features={FEATURES.explorer}
          ctaLabel="You're on Explorer" ctaVariant="ghost" ctaDisabled
          onCta={() => {}}
        />
        <PlanCard
          name="Pro" tagline="Most popular" highlight
          price={<>{billing === 'annual' && <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 16, color: 'var(--text-tertiary)', textDecoration: 'line-through', marginRight: 8 }}>₹499</span>}₹{prices.pro}<span style={{ fontSize: 16, color: 'var(--text-secondary)' }}>/mo</span></>}
          features={FEATURES.pro}
          ctaLabel="Start Pro Free — 7 Days" ctaVariant="primary"
          ctaSub="No card required for trial"
          onCta={() => setCheckout('pro')}
        />
        <PlanCard
          name="Elite" tagline="For serious learners" premium
          price={<>₹{prices.elite}<span style={{ fontSize: 16, color: 'var(--text-secondary)' }}>/mo</span></>}
          features={FEATURES.elite}
          ctaLabel="Go Elite" ctaVariant="premium"
          ctaSub="Includes 4 sessions/month with verified mentors"
          onCta={() => setCheckout('elite')}
        />
      </div>

      <div style={{ textAlign: 'center', color: 'var(--text-secondary)', fontSize: 14, marginBottom: 60 }}>
        🔒 Secure payments &nbsp;·&nbsp; 🔄 Cancel anytime &nbsp;·&nbsp; 🎁 7-Day Trial &nbsp;·&nbsp; 💰 30-day money-back
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

      {checkout && (
        <CheckoutModal
          plan={checkout}
          price={prices[checkout]}
          onClose={() => setCheckout(null)}
          onSuccess={() => setCheckout(null)}
        />
      )}
    </div>
  );
}
