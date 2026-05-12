// ═══════════════════════════════════════
// UTILITY & ERROR SCREENS — D1–D4
// 404 · 500 · Maintenance · Session Expired
// All public, full-screen, no app shell.
// ═══════════════════════════════════════

const { useState, useEffect } = React;

// Reuse the landing hero ambient backdrop so utility screens share visual DNA.
const AMBIENT_BG = 'radial-gradient(ellipse 1100px 600px at 50% 30%, rgba(27,43,142,0.14) 0%, transparent 60%), radial-gradient(ellipse 700px 400px at 90% 90%, rgba(245,158,11,0.08) 0%, transparent 60%), radial-gradient(ellipse 500px 300px at 10% 80%, rgba(16,185,129,0.08) 0%, transparent 60%)';

// ── Inline keyframe injection (idempotent) ───────────────
const ensureUtilityKeyframes = () => {
  if (typeof document === 'undefined') return;
  if (document.getElementById('utility-keyframes')) return;
  const s = document.createElement('style');
  s.id = 'utility-keyframes';
  s.textContent = `
    @keyframes utilityPulse { 0%, 100% { transform: scale(1); opacity: 1; } 50% { transform: scale(1.4); opacity: 0.55; } }
    @keyframes utilityFloat { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
    @keyframes utilityShake { 0%, 100% { transform: translateX(0); } 20%, 60% { transform: translateX(-6px); } 40%, 80% { transform: translateX(6px); } }
    @keyframes utilityFadeUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
    @keyframes utilitySpark { 0%, 100% { opacity: 0.3; transform: scale(0.8); } 50% { opacity: 1; transform: scale(1.1); } }
    .util-fade-in { animation: utilityFadeUp 520ms var(--ease-smooth, ease-out) both; }
    .util-shake { animation: utilityShake 420ms ease-out; }
  `;
  document.head.appendChild(s);
};

// ═══════════════════════════════════════
// SHARED SHELL — used by D1, D2, D4
// ═══════════════════════════════════════
const UtilityShell = ({ children, navigate }) => {
  useEffect(() => { ensureUtilityKeyframes(); }, []);
  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--bg-base)',
      position: 'relative',
      overflow: 'hidden',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '40px 24px',
    }}>
      {/* Ambient gradient layer */}
      <div aria-hidden="true" style={{
        position: 'absolute', inset: 0,
        background: AMBIENT_BG,
        opacity: 0.85,
        pointerEvents: 'none',
      }}/>

      {/* Decorative floating dots */}
      <div aria-hidden="true" style={{ position: 'absolute', top: '18%', left: '14%', width: 10, height: 10, borderRadius: 999, background: 'var(--brand-400)', opacity: 0.45, filter: 'blur(2px)', animation: 'utilityFloat 7s ease-in-out infinite' }}/>
      <div aria-hidden="true" style={{ position: 'absolute', top: '32%', right: '18%', width: 6, height: 6, borderRadius: 999, background: 'var(--mint-400)', opacity: 0.55, filter: 'blur(1px)', animation: 'utilityFloat 9s ease-in-out infinite 1.5s' }}/>
      <div aria-hidden="true" style={{ position: 'absolute', bottom: '22%', right: '24%', width: 8, height: 8, borderRadius: 999, background: 'var(--brand-300)', opacity: 0.40, filter: 'blur(2px)', animation: 'utilityFloat 11s ease-in-out infinite 0.8s' }}/>
      <div aria-hidden="true" style={{ position: 'absolute', bottom: '30%', left: '20%', width: 5, height: 5, borderRadius: 999, background: 'var(--mint-400)', opacity: 0.45, filter: 'blur(1px)', animation: 'utilityFloat 8s ease-in-out infinite 2.2s' }}/>

      {/* Logo top-left */}
      <button
        onClick={() => navigate && navigate('landing')}
        aria-label="Elm Origin home"
        style={{
          position: 'absolute', top: 28, left: 32, zIndex: 3,
          background: 'transparent', border: 'none', padding: 0, cursor: 'pointer',
          display: 'flex', alignItems: 'center', gap: 10,
        }}
      >
        <img src="assets/elm-origin-logo.png" alt="" style={{ height: 28, width: 'auto', display: 'block' }}
             onError={(e) => { e.currentTarget.style.display = 'none'; }}/>
      </button>

      {/* Content */}
      <div className="util-fade-in" style={{ position: 'relative', zIndex: 1, textAlign: 'center', maxWidth: 560 }}>
        {children}
      </div>
    </div>
  );
};

// ═══════════════════════════════════════
// D1 · 404 NOT FOUND
// ═══════════════════════════════════════
const NotFoundPage = ({ navigate, isMentor }) => (
  <UtilityShell navigate={navigate}>
    {/* Minimal line-art illustration: floating "?" above a desk + sparkles */}
    <svg viewBox="0 0 260 170" width="240" style={{ marginBottom: 24, display: 'block', margin: '0 auto 24px' }} aria-hidden="true">
      <defs>
        <linearGradient id="util404Stroke" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="var(--brand-400)"/>
          <stop offset="100%" stopColor="var(--mint-400)"/>
        </linearGradient>
      </defs>
      {/* Floating "?" */}
      <g style={{ animation: 'utilityFloat 4.5s ease-in-out infinite', transformOrigin: '130px 55px' }}>
        <circle cx="130" cy="55" r="32" fill="none" stroke="url(#util404Stroke)" strokeWidth="2.2"/>
        <path d="M 119 47 Q 119 37 130 37 Q 141 37 141 47 Q 141 54 132 58 L 132 68" fill="none" stroke="url(#util404Stroke)" strokeWidth="2.2" strokeLinecap="round"/>
        <circle cx="132" cy="77" r="2" fill="var(--brand-400)"/>
      </g>
      {/* Sparkles */}
      <g stroke="var(--mint-400)" strokeWidth="1.5" strokeLinecap="round" fill="none">
        <g style={{ animation: 'utilitySpark 2.6s ease-in-out infinite', transformOrigin: '74px 40px' }}>
          <line x1="74" y1="34" x2="74" y2="46"/>
          <line x1="68" y1="40" x2="80" y2="40"/>
        </g>
        <g style={{ animation: 'utilitySpark 3.2s ease-in-out infinite 0.6s', transformOrigin: '190px 32px' }}>
          <line x1="190" y1="27" x2="190" y2="37"/>
          <line x1="185" y1="32" x2="195" y2="32"/>
        </g>
        <g style={{ animation: 'utilitySpark 2.9s ease-in-out infinite 1.1s', transformOrigin: '212px 80px' }}>
          <line x1="212" y1="76" x2="212" y2="84"/>
          <line x1="208" y1="80" x2="216" y2="80"/>
        </g>
      </g>
      {/* Desk */}
      <g stroke="var(--brand-400)" strokeWidth="2" fill="none" strokeLinecap="round">
        <line x1="50" y1="130" x2="210" y2="130"/>
        <line x1="65" y1="130" x2="65" y2="156"/>
        <line x1="195" y1="130" x2="195" y2="156"/>
        {/* Tiny lamp on desk */}
        <line x1="80" y1="130" x2="80" y2="115"/>
        <path d="M 73 115 L 87 115 L 84 108 L 76 108 Z" strokeLinejoin="round"/>
        {/* Tiny book */}
        <rect x="160" y="120" width="22" height="10" rx="1"/>
        <line x1="171" y1="120" x2="171" y2="130"/>
      </g>
    </svg>

    <h1 style={{
      fontFamily: 'Fraunces',
      fontSize: 'clamp(96px, 18vw, 180px)',
      fontWeight: 700,
      fontStyle: 'italic',
      lineHeight: 0.95,
      marginBottom: 12,
      background: 'var(--gradient-brand)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      backgroundClip: 'text',
      letterSpacing: '-0.04em',
    }}>404</h1>

    <h2 style={{ fontFamily: 'Fraunces', fontSize: 'clamp(24px, 4vw, 32px)', fontWeight: 500, fontStyle: 'italic', marginBottom: 14, color: 'var(--text-primary)' }}>
      This page wandered off.
    </h2>

    <p style={{ fontSize: 16, color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 36, maxWidth: 420, margin: '0 auto 36px' }}>
      Maybe it went to a study room. Let's get you back on track.
    </p>

    <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
      <button className="btn btn-primary btn-lg" onClick={() => navigate(isMentor ? 'mentor-dashboard' : 'home')}>
        ← Go to Dashboard
      </button>
      <button className="btn btn-ghost btn-md" onClick={() => navigate('landing')}>
        Go to Lernova home
      </button>
    </div>
  </UtilityShell>
);

// ═══════════════════════════════════════
// D2 · MAINTENANCE MODE
// ═══════════════════════════════════════
const DotPulse = () => {
  const [n, setN] = useState(0);
  useEffect(() => { const t = setInterval(() => setN(x => (x + 1) % 4), 400); return () => clearInterval(t); }, []);
  return <span style={{ display: 'inline-block', width: 14, textAlign: 'left' }}>{'.'.repeat(n)}</span>;
};

const MaintenancePage = ({ navigate }) => {
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
    <UtilityShell navigate={navigate}>
      {/* Wrench / gear icon */}
      <div style={{
        width: 84, height: 84, borderRadius: 22,
        background: 'var(--gradient-brand)',
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        marginBottom: 28, boxShadow: '0 14px 40px -12px rgba(27,43,142,0.40)',
        animation: 'utilityFloat 5s ease-in-out infinite',
      }}>
        <svg viewBox="0 0 24 24" width="40" height="40" fill="none" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M14.7 6.3a4 4 0 0 0-5.4 5.4L3 18l3 3 6.3-6.3a4 4 0 0 0 5.4-5.4l-2.3 2.3-2.4-2.4 2.3-2.3z"/>
        </svg>
      </div>

      <h1 style={{ fontFamily: 'Fraunces', fontSize: 'clamp(36px, 6vw, 56px)', fontWeight: 600, fontStyle: 'italic', lineHeight: 1.1, marginBottom: 16, letterSpacing: '-0.02em' }}>
        We're upgrading your experience
      </h1>

      <p style={{ fontSize: 18, color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 28 }}>
        Back online in approximately <strong style={{ color: 'var(--text-primary)', fontWeight: 600 }}>30 minutes</strong>.
      </p>

      {/* Status pill */}
      <div style={{
        display: 'inline-flex', alignItems: 'center', gap: 10,
        padding: '10px 18px', borderRadius: 999,
        background: 'var(--bg-surface)',
        border: '1px solid var(--border-subtle)',
        marginBottom: 36, boxShadow: 'var(--shadow-xs)',
      }}>
        <span style={{ width: 8, height: 8, borderRadius: 999, background: 'var(--mint-500)', animation: 'utilityPulse 1.6s ease-in-out infinite', boxShadow: '0 0 0 4px rgba(16,185,129,0.18)' }}/>
        <span style={{ fontSize: 12, color: 'var(--mint-600)', fontFamily: 'JetBrains Mono', fontWeight: 500, letterSpacing: '0.02em' }}>
          checking system status<DotPulse/>
        </span>
      </div>

      {!submitted ? (
        <div className={shake ? 'util-shake' : ''} style={{ display: 'flex', gap: 8, justifyContent: 'center', maxWidth: 440, margin: '0 auto', flexWrap: 'wrap' }}>
          <input
            type="email"
            placeholder="your@email.com"
            value={email}
            onChange={e => setEmail(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') submit(); }}
            className="input"
            style={{ flex: 1, minWidth: 220, height: 48 }}
          />
          <button className="btn btn-primary btn-md" style={{ height: 48 }} onClick={submit}>
            Notify me
          </button>
        </div>
      ) : (
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 10,
          padding: '12px 22px', borderRadius: 12,
          background: 'rgba(16,185,129,0.10)',
          border: '1px solid rgba(16,185,129,0.25)',
          color: 'var(--mint-600)', fontSize: 14, fontWeight: 500,
        }} className="util-fade-in">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
          We'll email you when we're back.
        </div>
      )}
    </UtilityShell>
  );
};

// ═══════════════════════════════════════
// D3 · SESSION EXPIRED  (centered glass card — own shell)
// ═══════════════════════════════════════
const SessionExpiredPage = ({ navigate }) => {
  useEffect(() => { ensureUtilityKeyframes(); }, []);
  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--bg-base)',
      position: 'relative',
      overflow: 'hidden',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 24,
    }}>
      <div aria-hidden="true" style={{
        position: 'absolute', inset: 0,
        background: AMBIENT_BG,
        opacity: 0.55,
        pointerEvents: 'none',
      }}/>

      {/* Logo top-left */}
      <button
        onClick={() => navigate('landing')}
        aria-label="Elm Origin home"
        style={{
          position: 'absolute', top: 28, left: 32, zIndex: 3,
          background: 'transparent', border: 'none', padding: 0, cursor: 'pointer',
        }}
      >
        <img src="assets/elm-origin-logo.png" alt="" style={{ height: 28, width: 'auto', display: 'block' }}
             onError={(e) => { e.currentTarget.style.display = 'none'; }}/>
      </button>

      <div className="util-fade-in" style={{
        position: 'relative', zIndex: 1,
        width: '100%', maxWidth: 420,
        background: 'var(--bg-surface)',
        border: '1px solid var(--border-default)',
        borderRadius: 24,
        padding: 40,
        textAlign: 'center',
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
            <rect x="4" y="11" width="16" height="10" rx="2.5"/>
            <path d="M8 11V8a4 4 0 0 1 8 0v3"/>
            <circle cx="12" cy="16" r="1.2" fill="currentColor"/>
          </svg>
        </div>

        <h2 style={{ fontFamily: 'Figtree, Inter, system-ui', fontSize: 22, fontWeight: 700, marginBottom: 10, color: 'var(--text-primary)' }}>
          Session expired
        </h2>

        <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 28 }}>
          Logged out after inactivity. Your progress is saved.
        </p>

        <button
          className="btn btn-primary btn-lg"
          style={{ width: '100%' }}
          onClick={() => navigate('login')}
        >
          Log Back In
        </button>

        <button
          onClick={() => navigate('landing')}
          style={{
            marginTop: 14, background: 'transparent', border: 'none',
            color: 'var(--text-tertiary)', fontSize: 13, cursor: 'pointer',
            fontFamily: 'Inter', fontWeight: 500,
          }}
        >
          Return to home
        </button>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════
// D4 · 500 SERVER ERROR
// ═══════════════════════════════════════
const ServerErrorPage = ({ navigate }) => (
  <UtilityShell navigate={navigate}>
    {/* Broken cable / static SVG */}
    <svg viewBox="0 0 260 170" width="220" style={{ display: 'block', margin: '0 auto 28px' }} aria-hidden="true">
      <defs>
        <linearGradient id="util500Stroke" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="var(--brand-400)"/>
          <stop offset="100%" stopColor="var(--brand-600)"/>
        </linearGradient>
      </defs>
      {/* Left plug */}
      <g stroke="url(#util500Stroke)" strokeWidth="2.2" fill="none" strokeLinecap="round" strokeLinejoin="round">
        <rect x="20" y="76" width="34" height="22" rx="3"/>
        <line x1="26" y1="74" x2="26" y2="68"/>
        <line x1="48" y1="74" x2="48" y2="68"/>
        {/* Cable left */}
        <path d="M 54 87 Q 78 70 96 92 Q 108 105 116 96"/>
      </g>
      {/* Right plug */}
      <g stroke="url(#util500Stroke)" strokeWidth="2.2" fill="none" strokeLinecap="round" strokeLinejoin="round">
        <rect x="206" y="76" width="34" height="22" rx="3"/>
        <line x1="212" y1="100" x2="212" y2="106"/>
        <line x1="234" y1="100" x2="234" y2="106"/>
        {/* Cable right */}
        <path d="M 206 87 Q 182 70 164 92 Q 152 105 144 96"/>
      </g>
      {/* Broken middle — sparks */}
      <g stroke="var(--brand-400)" strokeWidth="2" strokeLinecap="round" fill="none">
        <g style={{ animation: 'utilitySpark 1.4s ease-in-out infinite', transformOrigin: '130px 100px' }}>
          <line x1="124" y1="100" x2="118" y2="94"/>
          <line x1="130" y1="98" x2="130" y2="88"/>
          <line x1="136" y1="100" x2="142" y2="94"/>
        </g>
        <g style={{ animation: 'utilitySpark 1.8s ease-in-out infinite 0.4s', transformOrigin: '130px 108px' }}>
          <line x1="120" y1="112" x2="114" y2="116"/>
          <line x1="140" y1="112" x2="146" y2="116"/>
          <circle cx="130" cy="112" r="1.5" fill="var(--brand-400)"/>
        </g>
      </g>
      {/* Static dots floor */}
      <g fill="var(--text-tertiary)" opacity="0.4">
        <circle cx="40" cy="140" r="1.2"/>
        <circle cx="60" cy="144" r="1"/>
        <circle cx="90" cy="140" r="1.4"/>
        <circle cx="120" cy="145" r="1"/>
        <circle cx="150" cy="140" r="1.2"/>
        <circle cx="180" cy="144" r="1"/>
        <circle cx="210" cy="140" r="1.3"/>
      </g>
    </svg>

    <h1 style={{
      fontFamily: 'Fraunces',
      fontSize: 'clamp(72px, 12vw, 120px)',
      fontWeight: 600,
      fontStyle: 'italic',
      lineHeight: 0.95,
      marginBottom: 12,
      color: 'var(--text-primary)',
      letterSpacing: '-0.04em',
    }}>500</h1>

    <h2 style={{ fontFamily: 'Fraunces', fontSize: 'clamp(22px, 3.6vw, 28px)', fontWeight: 500, fontStyle: 'italic', marginBottom: 14, color: 'var(--text-primary)' }}>
      Something broke on our end.
    </h2>

    <p style={{ fontSize: 16, color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 36, maxWidth: 420, margin: '0 auto 36px' }}>
      Our team has been notified. Try refreshing in a moment.
    </p>

    <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
      <button className="btn btn-primary btn-lg" onClick={() => window.location.reload()}>
        ↻ Refresh Page
      </button>
      <button className="btn btn-ghost btn-md" onClick={() => navigate('home')}>
        Go to Dashboard
      </button>
    </div>
  </UtilityShell>
);

// ═══════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════
window.NotFoundPage = NotFoundPage;
window.MaintenancePage = MaintenancePage;
window.SessionExpiredPage = SessionExpiredPage;
window.ServerErrorPage = ServerErrorPage;
window.UtilityShell = UtilityShell;
