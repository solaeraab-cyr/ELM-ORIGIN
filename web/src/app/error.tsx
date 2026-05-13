'use client';

import { useEffect } from 'react';
import Link from 'next/link';

const AMBIENT = 'radial-gradient(ellipse 1100px 600px at 50% 30%, rgba(27,43,142,0.14) 0%, transparent 60%), radial-gradient(ellipse 700px 400px at 90% 90%, rgba(245,158,11,0.08) 0%, transparent 60%), radial-gradient(ellipse 500px 300px at 10% 80%, rgba(16,185,129,0.08) 0%, transparent 60%)';

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => { console.error(error); }, [error]);

  return (
    <html>
      <body>
        <div style={{
          minHeight: '100vh', background: 'var(--bg-base)', position: 'relative',
          overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 24px',
          fontFamily: 'Inter, system-ui, sans-serif',
        }}>
          <div aria-hidden="true" style={{ position: 'absolute', inset: 0, background: AMBIENT, opacity: 0.85, pointerEvents: 'none' }} />

          <div style={{ position: 'relative', zIndex: 1, textAlign: 'center', maxWidth: 560 }}>
            <svg viewBox="0 0 260 170" width="200" style={{ display: 'block', margin: '0 auto 28px' }} aria-hidden="true">
              <defs>
                <linearGradient id="g500" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="var(--brand-400)" />
                  <stop offset="100%" stopColor="var(--brand-600)" />
                </linearGradient>
              </defs>
              <g stroke="url(#g500)" strokeWidth="2.2" fill="none" strokeLinecap="round" strokeLinejoin="round">
                <rect x="20" y="76" width="34" height="22" rx="3" />
                <line x1="26" y1="74" x2="26" y2="68" /><line x1="48" y1="74" x2="48" y2="68" />
                <path d="M 54 87 Q 78 70 96 92 Q 108 105 116 96" />
              </g>
              <g stroke="url(#g500)" strokeWidth="2.2" fill="none" strokeLinecap="round" strokeLinejoin="round">
                <rect x="206" y="76" width="34" height="22" rx="3" />
                <line x1="212" y1="100" x2="212" y2="106" /><line x1="234" y1="100" x2="234" y2="106" />
                <path d="M 206 87 Q 182 70 164 92 Q 152 105 144 96" />
              </g>
              <g stroke="var(--brand-400)" strokeWidth="2" strokeLinecap="round" fill="none">
                <line x1="124" y1="100" x2="118" y2="94" />
                <line x1="130" y1="98" x2="130" y2="88" />
                <line x1="136" y1="100" x2="142" y2="94" />
                <line x1="120" y1="112" x2="114" y2="116" />
                <line x1="140" y1="112" x2="146" y2="116" />
              </g>
            </svg>

            <h1 style={{ fontFamily: 'Fraunces, serif', fontSize: 'clamp(72px, 12vw, 120px)', fontWeight: 600, fontStyle: 'italic', lineHeight: 0.95, marginBottom: 16, letterSpacing: '-0.04em', color: 'var(--text-primary)' }}>500</h1>

            <h2 style={{ fontFamily: 'Fraunces, serif', fontSize: 'clamp(20px, 3.6vw, 28px)', fontWeight: 500, fontStyle: 'italic', marginBottom: 14, color: 'var(--text-primary)' }}>
              Something broke on our end.
            </h2>
            <p style={{ fontSize: 16, color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 36, maxWidth: 420, margin: '0 auto 36px' }}>
              Our team has been notified. Try refreshing in a moment.
            </p>

            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
              <button onClick={reset} style={{ height: 48, padding: '0 24px', borderRadius: 999, background: 'var(--gradient-brand)', color: '#fff', fontSize: 15, fontWeight: 600, boxShadow: '0 6px 18px rgba(27,43,142,0.30)', cursor: 'pointer' }}>
                ↻ Try again
              </button>
              <Link href="/home" style={{ height: 44, padding: '0 20px', borderRadius: 999, background: 'var(--bg-surface)', border: '1px solid var(--border-default)', color: 'var(--text-primary)', fontSize: 14, fontWeight: 500, display: 'flex', alignItems: 'center', textDecoration: 'none' }}>
                Go to Dashboard
              </Link>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}
