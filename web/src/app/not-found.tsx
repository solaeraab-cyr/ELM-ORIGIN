import Link from 'next/link';

const AMBIENT = 'radial-gradient(ellipse 1100px 600px at 50% 30%, rgba(27,43,142,0.14) 0%, transparent 60%), radial-gradient(ellipse 700px 400px at 90% 90%, rgba(245,158,11,0.08) 0%, transparent 60%), radial-gradient(ellipse 500px 300px at 10% 80%, rgba(16,185,129,0.08) 0%, transparent 60%)';

export default function NotFound() {
  return (
    <div style={{
      minHeight: '100vh', background: 'var(--bg-base)', position: 'relative',
      overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 24px',
    }}>
      <div aria-hidden="true" style={{ position: 'absolute', inset: 0, background: AMBIENT, opacity: 0.85, pointerEvents: 'none' }} />

      {/* Floating dots */}
      <div aria-hidden="true" style={{ position: 'absolute', top: '18%', left: '14%', width: 10, height: 10, borderRadius: 999, background: 'var(--brand-400)', opacity: 0.45, filter: 'blur(2px)' }} />
      <div aria-hidden="true" style={{ position: 'absolute', top: '32%', right: '18%', width: 6, height: 6, borderRadius: 999, background: 'var(--mint-400, #34d399)', opacity: 0.55, filter: 'blur(1px)' }} />
      <div aria-hidden="true" style={{ position: 'absolute', bottom: '22%', right: '24%', width: 8, height: 8, borderRadius: 999, background: 'var(--brand-300)', opacity: 0.40, filter: 'blur(2px)' }} />

      <div style={{ position: 'relative', zIndex: 1, textAlign: 'center', maxWidth: 560 }}>
        <svg viewBox="0 0 260 170" width="220" style={{ display: 'block', margin: '0 auto 28px' }} aria-hidden="true">
          <defs>
            <linearGradient id="g404" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="var(--brand-400)" />
              <stop offset="100%" stopColor="#34d399" />
            </linearGradient>
          </defs>
          <g style={{ transformOrigin: '130px 55px' }}>
            <circle cx="130" cy="55" r="32" fill="none" stroke="url(#g404)" strokeWidth="2.2" />
            <path d="M 119 47 Q 119 37 130 37 Q 141 37 141 47 Q 141 54 132 58 L 132 68" fill="none" stroke="url(#g404)" strokeWidth="2.2" strokeLinecap="round" />
            <circle cx="132" cy="77" r="2" fill="var(--brand-400)" />
          </g>
          <g stroke="#34d399" strokeWidth="1.5" strokeLinecap="round" fill="none">
            <line x1="74" y1="34" x2="74" y2="46" /><line x1="68" y1="40" x2="80" y2="40" />
            <line x1="190" y1="27" x2="190" y2="37" /><line x1="185" y1="32" x2="195" y2="32" />
            <line x1="212" y1="76" x2="212" y2="84" /><line x1="208" y1="80" x2="216" y2="80" />
          </g>
          <g stroke="var(--brand-400)" strokeWidth="2" fill="none" strokeLinecap="round">
            <line x1="50" y1="130" x2="210" y2="130" />
            <line x1="65" y1="130" x2="65" y2="156" /><line x1="195" y1="130" x2="195" y2="156" />
            <line x1="80" y1="130" x2="80" y2="115" />
            <path d="M 73 115 L 87 115 L 84 108 L 76 108 Z" strokeLinejoin="round" />
            <rect x="160" y="120" width="22" height="10" rx="1" /><line x1="171" y1="120" x2="171" y2="130" />
          </g>
        </svg>

        <h1 style={{
          fontFamily: 'Fraunces, serif', fontSize: 'clamp(96px, 18vw, 160px)',
          fontWeight: 700, fontStyle: 'italic', lineHeight: 0.9, marginBottom: 16,
          background: 'var(--gradient-brand)', WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent', backgroundClip: 'text', letterSpacing: '-0.04em',
        }}>404</h1>

        <h2 style={{ fontFamily: 'Fraunces, serif', fontSize: 'clamp(22px, 4vw, 30px)', fontWeight: 500, fontStyle: 'italic', marginBottom: 14 }}>
          This page wandered off.
        </h2>
        <p style={{ fontSize: 16, color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 36, maxWidth: 420, margin: '0 auto 36px' }}>
          Maybe it went to a study room. Let&apos;s get you back on track.
        </p>

        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link href="/home" style={{ height: 48, padding: '0 24px', borderRadius: 999, background: 'var(--gradient-brand)', color: '#fff', fontSize: 15, fontWeight: 600, display: 'flex', alignItems: 'center', textDecoration: 'none', boxShadow: '0 6px 18px rgba(27,43,142,0.30)' }}>
            ← Go to Dashboard
          </Link>
          <Link href="/" style={{ height: 44, padding: '0 20px', borderRadius: 999, background: 'var(--bg-surface)', border: '1px solid var(--border-default)', color: 'var(--text-primary)', fontSize: 14, fontWeight: 500, display: 'flex', alignItems: 'center', textDecoration: 'none' }}>
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}
