'use client';

import { useState, useEffect } from 'react';

const AMBIENT = 'radial-gradient(ellipse 1100px 600px at 50% 30%, rgba(27,43,142,0.14) 0%, transparent 60%), radial-gradient(ellipse 700px 400px at 90% 90%, rgba(245,158,11,0.08) 0%, transparent 60%), radial-gradient(ellipse 500px 300px at 10% 80%, rgba(16,185,129,0.08) 0%, transparent 60%)';

function DotPulse() {
  const [n, setN] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setN(x => (x + 1) % 4), 400);
    return () => clearInterval(t);
  }, []);
  return <span style={{ display: 'inline-block', width: 14, textAlign: 'left' }}>{'...'.slice(0, n)}</span>;
}

export default function MaintenancePage() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [shake, setShake] = useState(false);

  const submit = () => {
    const valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
    if (!valid) {
      setShake(true);
      setTimeout(() => setShake(false), 450);
      return;
    }
    setSubmitted(true);
  };

  return (
    <div style={{
      minHeight: '100vh', background: 'var(--bg-base)', position: 'relative',
      overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 24px',
    }}>
      <div aria-hidden="true" style={{ position: 'absolute', inset: 0, background: AMBIENT, opacity: 0.85, pointerEvents: 'none' }} />

      <div style={{ position: 'relative', zIndex: 1, textAlign: 'center', maxWidth: 560 }}>
        {/* Wrench icon */}
        <div style={{
          width: 84, height: 84, borderRadius: 22,
          background: 'var(--gradient-brand)',
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          marginBottom: 28, boxShadow: '0 14px 40px -12px rgba(27,43,142,0.40)',
        }}>
          <svg viewBox="0 0 24 24" width="40" height="40" fill="none" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M14.7 6.3a4 4 0 0 0-5.4 5.4L3 18l3 3 6.3-6.3a4 4 0 0 0 5.4-5.4l-2.3 2.3-2.4-2.4 2.3-2.3z" />
          </svg>
        </div>

        <h1 style={{ fontFamily: 'Fraunces, serif', fontSize: 'clamp(36px, 6vw, 52px)', fontWeight: 600, fontStyle: 'italic', lineHeight: 1.1, marginBottom: 16, letterSpacing: '-0.02em' }}>
          We&apos;re upgrading your experience
        </h1>

        <p style={{ fontSize: 18, color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 28 }}>
          Back online in approximately <strong style={{ color: 'var(--text-primary)', fontWeight: 600 }}>30 minutes</strong>.
        </p>

        {/* Status pill */}
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 10,
          padding: '10px 18px', borderRadius: 999,
          background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)',
          marginBottom: 36, boxShadow: 'var(--shadow-xs)',
        }}>
          <span style={{ width: 8, height: 8, borderRadius: 999, background: '#10b981', boxShadow: '0 0 0 4px rgba(16,185,129,0.18)' }} />
          <span style={{ fontSize: 12, color: '#10b981', fontFamily: 'JetBrains Mono, monospace', fontWeight: 500, letterSpacing: '0.02em' }}>
            checking system status<DotPulse />
          </span>
        </div>

        {!submitted ? (
          <div className={shake ? 'util-shake' : ''} style={{ display: 'flex', gap: 8, justifyContent: 'center', maxWidth: 440, margin: '0 auto', flexWrap: 'wrap' }}>
            <input
              type="email" placeholder="your@email.com" value={email}
              onChange={e => setEmail(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') submit(); }}
              style={{ flex: 1, minWidth: 220, height: 48, padding: '0 16px', background: 'var(--bg-surface)', border: '1px solid var(--border-default)', borderRadius: 12, fontSize: 14, color: 'var(--text-primary)', outline: 'none' }}
            />
            <button onClick={submit} style={{ height: 48, padding: '0 22px', borderRadius: 12, background: 'var(--gradient-brand)', color: '#fff', fontSize: 14, fontWeight: 600 }}>
              Notify me
            </button>
          </div>
        ) : (
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 10,
            padding: '12px 22px', borderRadius: 12,
            background: 'rgba(16,185,129,0.10)', border: '1px solid rgba(16,185,129,0.25)',
            color: '#10b981', fontSize: 14, fontWeight: 500,
          }}>
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
            We&apos;ll email you when we&apos;re back.
          </div>
        )}
      </div>

      <style>{`@keyframes util-shake { 0%,100%{transform:translateX(0)} 20%,60%{transform:translateX(-6px)} 40%,80%{transform:translateX(6px)} } .util-shake { animation: util-shake 420ms ease-out; }`}</style>
    </div>
  );
}
