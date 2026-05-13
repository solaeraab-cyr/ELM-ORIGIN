import Link from 'next/link';

const AMBIENT = 'radial-gradient(ellipse 1100px 600px at 50% 30%, rgba(27,43,142,0.14) 0%, transparent 60%), radial-gradient(ellipse 700px 400px at 90% 90%, rgba(245,158,11,0.08) 0%, transparent 60%)';

export default function SessionExpiredPage() {
  return (
    <div style={{
      minHeight: '100vh', background: 'var(--bg-base)', position: 'relative',
      overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24,
    }}>
      <div aria-hidden="true" style={{ position: 'absolute', inset: 0, background: AMBIENT, opacity: 0.55, pointerEvents: 'none' }} />

      <div style={{
        position: 'relative', zIndex: 1,
        width: '100%', maxWidth: 420,
        background: 'var(--bg-surface)', border: '1px solid var(--border-default)',
        borderRadius: 24, padding: 40, textAlign: 'center',
        boxShadow: '0 24px 60px -20px rgba(14,18,40,0.18), 0 4px 14px -4px rgba(14,18,40,0.08)',
      }}>
        {/* Lock icon */}
        <div style={{
          width: 64, height: 64, borderRadius: 18,
          background: 'var(--gradient-brand)',
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          marginBottom: 18, boxShadow: '0 12px 32px -10px rgba(27,43,142,0.45)',
        }}>
          <svg viewBox="0 0 24 24" width="30" height="30" fill="none" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <rect x="4" y="11" width="16" height="10" rx="2.5" />
            <path d="M8 11V8a4 4 0 0 1 8 0v3" />
            <circle cx="12" cy="16" r="1.2" fill="white" />
          </svg>
        </div>

        <h2 style={{ fontFamily: 'Fraunces, serif', fontSize: 24, fontWeight: 700, marginBottom: 10 }}>
          Session expired
        </h2>
        <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 28 }}>
          Logged out after inactivity. Your progress is saved.
        </p>

        <Link href="/login" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 48, borderRadius: 999, background: 'var(--gradient-brand)', color: '#fff', fontSize: 15, fontWeight: 600, textDecoration: 'none', boxShadow: '0 6px 18px rgba(27,43,142,0.30)', marginBottom: 14 }}>
          Log Back In
        </Link>

        <Link href="/" style={{ fontSize: 13, color: 'var(--text-tertiary)', textDecoration: 'none', fontWeight: 500 }}>
          Return to home
        </Link>
      </div>
    </div>
  );
}
