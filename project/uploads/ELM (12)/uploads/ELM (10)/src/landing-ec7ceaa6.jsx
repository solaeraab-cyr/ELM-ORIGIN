/* global React, Icon, Avatar */
const { useState: useStateL, useEffect: useEffectL, useRef: useRefL } = React;

// ═══════════════════════════════════════
// ELM ORIGIN — LANDING PAGE
// Spec: scrollable marketing page, fixed nav, hero + 7 sections + footer
// ═══════════════════════════════════════

const Landing = ({ navigate, theme, setTheme }) => {
  const [scrolled, setScrolled] = useStateL(false);
  const [mobileMenu, setMobileMenu] = useStateL(false);

  useEffectL(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div style={{ background: 'var(--bg-base)', color: 'var(--text-primary)', minHeight: '100vh', overflowX: 'hidden' }}>
      <LandingNav scrolled={scrolled} navigate={navigate} mobileMenu={mobileMenu} setMobileMenu={setMobileMenu} theme={theme} setTheme={setTheme}/>
      <Hero navigate={navigate}/>
      <ProblemSection/>
      <FeaturesSection/>
      <HowItWorks/>
      <MentorShowcase/>
      <Testimonials/>
      <PricingPreview navigate={navigate}/>
      <FinalCTA navigate={navigate}/>
      <Footer/>
    </div>
  );
};

// ─── Nav ──────────────────────────────────
const LandingNav = ({ scrolled, navigate, mobileMenu, setMobileMenu, theme, setTheme }) => {
  const dark = theme === 'dark';
  const links = [
    { label: 'Features', target: 'features' },
    { label: 'Mentors', target: 'mentors' },
    { label: 'Pricing', target: 'pricing' },
    { label: 'Community', target: 'community' },
  ];
  const scrollTo = (id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    setMobileMenu(false);
  };

  return (
    <>
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, height: 64, zIndex: 100,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 56px',
        background: scrolled ? (dark ? 'rgba(7,13,40,0.86)' : 'rgba(255,255,255,0.86)') : 'transparent',
        backdropFilter: scrolled ? 'blur(20px) saturate(140%)' : 'none',
        WebkitBackdropFilter: scrolled ? 'blur(20px) saturate(140%)' : 'none',
        borderBottom: scrolled ? '1px solid var(--border-subtle)' : '1px solid transparent',
        transition: 'all 250ms var(--ease-smooth)',
      }} className="landing-nav-root">
        {/* Logo */}
        <button onClick={() => navigate('landing')} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <img src="assets/elm-origin-logo.png" alt="Elm Origin" style={{ height: 30, width: 'auto', display: 'block' }}/>
        </button>

        {/* Center links — desktop */}
        <div className="desktop-only" style={{ display: 'flex', gap: 4 }}>
          {links.map(l => (
            <button key={l.label} onClick={() => scrollTo(l.target)}
              style={{
                padding: '8px 16px', borderRadius: 999,
                fontFamily: 'Inter', fontWeight: 500, fontSize: 14,
                color: 'var(--text-secondary)',
                transition: 'all 200ms var(--ease-smooth)',
              }}
              onMouseEnter={e => { e.currentTarget.style.color = 'var(--text-primary)'; e.currentTarget.style.background = 'var(--bg-hover)'; }}
              onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-secondary)'; e.currentTarget.style.background = 'transparent'; }}
            >{l.label}</button>
          ))}
        </div>

        {/* Right CTAs — desktop */}
        <div className="desktop-only" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {setTheme && (
            <button onClick={() => setTheme(dark ? 'light' : 'dark')} title={dark ? 'Light mode' : 'Dark mode'} className="theme-pill" style={{ width: 34, height: 34 }}>
              {dark
                ? <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/></svg>
                : <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
              }
            </button>
          )}
          <button onClick={() => navigate('login')} style={{
            height: 34, padding: '0 16px', borderRadius: 999,
            fontFamily: 'Inter', fontWeight: 500, fontSize: 14,
            color: 'var(--text-primary)',
            background: 'transparent',
            border: '1px solid var(--border-default)',
            transition: 'all 200ms var(--ease-smooth)',
          }}
            onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg-hover)'; e.currentTarget.style.borderColor = 'var(--border-strong)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'var(--border-default)'; }}
          >Log in</button>
          <button onClick={() => navigate('signup')} style={{
            height: 34, padding: '0 18px', borderRadius: 999,
            fontFamily: 'Inter', fontWeight: 600, fontSize: 14,
            color: '#fff',
            background: 'var(--gradient-brand)',
            boxShadow: '0 6px 18px rgba(27,43,142,0.28)',
            transition: 'all 220ms var(--ease-smooth)',
          }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 10px 26px rgba(27,43,142,0.36)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 6px 18px rgba(27,43,142,0.28)'; }}
          >Get Started Free</button>
        </div>

        {/* Mobile hamburger */}
        <button className="mobile-only" onClick={() => setMobileMenu(true)} style={{ width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-primary)' }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M3 6h18M3 12h18M3 18h18"/></svg>
        </button>
      </nav>

      {/* Mobile overlay */}
      {mobileMenu && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 200,
          background: dark ? 'rgba(7,13,40,0.96)' : 'rgba(255,255,255,0.96)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          display: 'flex', flexDirection: 'column',
          padding: '20px 24px',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: 44 }}>
            <img src="assets/elm-origin-logo.png" alt="Elm Origin" style={{ height: 28 }}/>
            <button onClick={() => setMobileMenu(false)} style={{ width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-primary)' }}>
              <Icon name="x" size={20}/>
            </button>
          </div>
          <div className="stagger-in" style={{ display: 'flex', flexDirection: 'column', gap: 4, marginTop: 40 }}>
            {links.map(l => (
              <button key={l.label} onClick={() => scrollTo(l.target)} style={{
                textAlign: 'left', padding: '16px 8px', fontSize: 24,
                fontFamily: 'Fraunces', fontWeight: 500, color: 'var(--text-primary)',
                borderBottom: '1px solid var(--border-subtle)',
              }}>{l.label}</button>
            ))}
            <button onClick={() => navigate('login')} style={{ textAlign: 'left', padding: '16px 8px', fontSize: 24, fontFamily: 'Fraunces', fontWeight: 500, color: 'var(--text-primary)', borderBottom: '1px solid var(--border-subtle)' }}>Log in</button>
            <button onClick={() => navigate('signup')} className="landing-cta" style={{ marginTop: 16, justifyContent: 'center' }}>Get Started Free</button>
          </div>
        </div>
      )}
    </>
  );
};

// ─── Hero ────────────────────────────────
const Hero = ({ navigate }) => {
  return (
    <section style={{
      minHeight: '100vh', position: 'relative',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '120px 24px 80px',
      background: 'var(--bg-base)',
      overflow: 'hidden',
    }}>
      {/* Background ambient + rotating orb */}
      <div aria-hidden="true" style={{
        position: 'absolute', inset: 0,
        background: 'radial-gradient(ellipse 1100px 600px at 50% 30%, rgba(27,43,142,0.14) 0%, transparent 60%), radial-gradient(ellipse 700px 400px at 90% 90%, rgba(245,158,11,0.08) 0%, transparent 60%)',
        pointerEvents: 'none',
      }}/>
      <div aria-hidden="true" style={{
        position: 'absolute', top: '50%', left: '50%',
        width: 600, height: 600, marginTop: -300, marginLeft: -300,
        background: 'conic-gradient(from 0deg, rgba(27,43,142,0.16), rgba(123,143,232,0.08), rgba(245,158,11,0.10), rgba(27,43,142,0.16))',
        filter: 'blur(80px)',
        animation: 'orbit 28s linear infinite',
        borderRadius: '50%',
        opacity: 0.6,
        pointerEvents: 'none',
      }}/>

      {/* Floating mockup tiles (desktop only, behind content) */}
      <FloatingMockups/>

      {/* Center content */}
      <div style={{ position: 'relative', maxWidth: 780, textAlign: 'center', zIndex: 2 }} className="stagger-in">
        {/* Eyebrow */}
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          padding: '6px 14px', borderRadius: 999,
          background: 'var(--glass-brand-bg)',
          border: '1px solid rgba(27,43,142,0.20)',
          color: 'var(--brand-600)',
          fontSize: 13, fontWeight: 500,
          marginBottom: 28,
        }}>
          <span style={{ fontSize: 14 }}>✦</span>
          <span>AI-Powered Study Environment</span>
        </div>

        {/* H1 */}
        <h1 className="font-display" style={{
          fontFamily: 'Fraunces, serif',
          fontWeight: 800,
          fontSize: 'clamp(40px, 7vw, 80px)',
          lineHeight: 1.02,
          letterSpacing: '-0.025em',
          margin: 0,
          color: 'var(--text-primary)',
        }}>
          The study environment<br/>
          <span style={{ fontStyle: 'italic', fontWeight: 600, color: 'var(--brand-600)' }}>you were always missing.</span>
        </h1>

        {/* Subtext */}
        <p style={{
          fontFamily: 'Inter, sans-serif',
          fontSize: 18, lineHeight: 1.55,
          color: 'var(--text-secondary)',
          maxWidth: 560, margin: '24px auto 0',
        }}>
          Live study rooms, AI tutors, real mentors, and tools built for one thing: helping you actually finish what you started.
        </p>

        {/* CTAs */}
        <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap', marginTop: 36 }}>
          <button onClick={() => navigate('signup')} className="landing-cta" style={{ height: 56, fontSize: 16, padding: '0 30px' }}>
            Get Started Free <span style={{ marginLeft: 4 }}>→</span>
          </button>
          <button className="landing-cta-ghost" style={{ height: 56, fontSize: 16, padding: '0 28px' }}>
            <span style={{ width: 22, height: 22, borderRadius: 999, background: 'var(--brand-100)', color: 'var(--brand-600)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 9 }}>▶</span>
            Watch Demo
          </button>
        </div>

        {/* Social proof */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, marginTop: 32 }}>
          <div style={{ display: 'flex' }}>
            {['Aanya', 'Rohan', 'Priya'].map((n, i) => (
              <div key={n} style={{ marginLeft: i === 0 ? 0 : -8, border: '2px solid var(--bg-base)', borderRadius: 999 }}>
                <Avatar name={n} size={26} tint={i}/>
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, color: 'var(--text-secondary)' }}>
            <span style={{ width: 8, height: 8, borderRadius: 999, background: 'var(--gold-500)', boxShadow: '0 0 0 4px rgba(245,158,11,0.25)', animation: 'pulseDot 2s infinite' }}/>
            <span><strong style={{ color: 'var(--text-primary)' }}>12,400+</strong> students studying right now</span>
          </div>
        </div>
      </div>
    </section>
  );
};

const FloatingMockups = () => {
  const tiles = [
    { x: '8%', y: '20%', rot: -6, label: 'Physics · Live', count: '24', color: 'var(--brand-600)' },
    { x: '78%', y: '18%', rot: 4, label: 'Nova: Solving…', count: 'AI', color: 'var(--mint-600)' },
    { x: '12%', y: '70%', rot: -2, label: 'Streak · 15 days', count: '🔥', color: 'var(--gold-600)' },
  ];
  return (
    <>
      {tiles.map((t, i) => (
        <div key={i} className="desktop-only" style={{
          position: 'absolute', left: t.x, top: t.y,
          width: 220,
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 16,
          padding: 14,
          boxShadow: 'var(--shadow-lg)',
          transform: `rotate(${t.rot}deg)`,
          animation: `floatBadge ${6 + i}s ease-in-out infinite ${i * 0.5}s`,
          zIndex: 1,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
            <span style={{ width: 24, height: 24, borderRadius: 6, background: t.color, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 11, fontWeight: 700 }}>{t.count}</span>
            <span style={{ width: 6, height: 6, borderRadius: 999, background: 'var(--mint-500)' }}/>
          </div>
          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{t.label}</div>
          <div style={{ marginTop: 8, height: 4, borderRadius: 4, background: 'var(--bg-subtle)', overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${50 + i * 15}%`, background: t.color, borderRadius: 4 }}/>
          </div>
        </div>
      ))}
    </>
  );
};

// ─── Problem Section ────────────────────
const ProblemSection = () => {
  const without = [
    'Studying alone, no accountability',
    'Stuck on a doubt for hours',
    'No one to ask when you’re lost',
    'Motivation crashes by week 2',
  ];
  const withElm = [
    'Live rooms — focus alongside others',
    'Nova answers in seconds, anytime',
    'Real mentors, 1:1, on demand',
    'Streaks, analytics, momentum',
  ];

  return (
    <section style={{ padding: '96px 24px', background: 'var(--bg-surface)', borderTop: '1px solid var(--border-subtle)', borderBottom: '1px solid var(--border-subtle)' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <div className="label-sm" style={{ color: 'var(--brand-400)', textAlign: 'center', marginBottom: 14, fontSize: 12, fontWeight: 700, letterSpacing: '0.12em' }}>THE PROBLEM</div>
        <h2 className="font-display" style={{
          fontFamily: 'Fraunces', fontWeight: 700,
          fontSize: 'clamp(28px, 4.5vw, 40px)', lineHeight: 1.15, textAlign: 'center',
          maxWidth: 720, margin: '0 auto 56px',
          color: 'var(--text-primary)', letterSpacing: '-0.02em',
        }}>
          You have the content.<br/>
          <span style={{ color: 'var(--text-secondary)' }}>Not the environment.</span>
        </h2>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 24 }}>
          {/* Without */}
          <div style={{
            background: 'var(--bg-subtle)',
            border: '1px solid var(--border-subtle)',
            borderLeft: '3px solid var(--danger-500)',
            borderRadius: 18, padding: 32,
          }}>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.10em', color: 'var(--danger-500)', textTransform: 'uppercase', marginBottom: 8 }}>Without ELM Origin</div>
            <div style={{ fontFamily: 'Fraunces', fontWeight: 600, fontSize: 22, marginBottom: 20, color: 'var(--text-primary)' }}>The grind alone.</div>
            <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: 14 }}>
              {without.map(t => (
                <li key={t} style={{ display: 'flex', gap: 12, alignItems: 'flex-start', fontSize: 15, color: 'var(--text-secondary)' }}>
                  <span style={{ width: 22, height: 22, borderRadius: 999, background: 'var(--danger-100)', color: 'var(--danger-500)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: 13, fontWeight: 700 }}>✗</span>
                  <span>{t}</span>
                </li>
              ))}
            </ul>
          </div>
          {/* With */}
          <div style={{
            background: 'var(--glass-brand-bg)',
            border: '1px solid rgba(27,43,142,0.20)',
            borderRadius: 18, padding: 32,
            position: 'relative',
            overflow: 'hidden',
          }}>
            <div aria-hidden="true" style={{ position: 'absolute', top: -40, right: -40, width: 200, height: 200, borderRadius: '50%', background: 'radial-gradient(circle, rgba(27,43,142,0.15) 0%, transparent 70%)' }}/>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.10em', color: 'var(--brand-600)', textTransform: 'uppercase', marginBottom: 8, position: 'relative' }}>With ELM Origin</div>
            <div style={{ fontFamily: 'Fraunces', fontWeight: 600, fontSize: 22, marginBottom: 20, color: 'var(--text-primary)', position: 'relative' }}>The environment, finally.</div>
            <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: 14, position: 'relative' }}>
              {withElm.map(t => (
                <li key={t} style={{ display: 'flex', gap: 12, alignItems: 'flex-start', fontSize: 15, color: 'var(--text-primary)' }}>
                  <span style={{ width: 22, height: 22, borderRadius: 999, background: 'var(--mint-100)', color: 'var(--mint-700)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: 13, fontWeight: 700 }}>✓</span>
                  <span>{t}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
};

// ─── Features ────────────────────────────
const FeaturesSection = () => {
  const features = [
    { icon: 'rooms', title: 'Live Study Rooms', body: 'Camera-on or off. Quiet co-working with people on the same exam. Always something open, 24/7.', accent: 'var(--gradient-brand)' },
    { icon: 'sparkles', title: 'Nova AI Tutor', body: 'Ask anything. Get explanations, examples, practice. Trained on your subjects, your level. Always patient.', accent: 'var(--gradient-ai)', special: true },
    { icon: 'mentors', title: 'Verified Mentors', body: 'Book 1:1 with toppers, IIM grads, and working pros. From ₹599/session. Your terms, your time.', accent: 'var(--gradient-brand)' },
    { icon: 'interviews', title: 'Interview Practice', body: 'Mock interviews with peers or AI. Get feedback that hits — communication, content, presence.', accent: 'var(--gradient-brand)' },
    { icon: 'productivity', title: 'Tools That Compound', body: 'Pomodoro, notes, planner, streak analytics. Everything builds momentum, nothing fights for tabs.', accent: 'var(--gradient-brand)' },
  ];

  return (
    <section id="features" style={{ padding: '96px 24px', background: 'var(--bg-base)' }}>
      <div style={{ maxWidth: 1180, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 56 }}>
          <div className="label-sm" style={{ color: 'var(--brand-400)', marginBottom: 14, fontSize: 12, fontWeight: 700, letterSpacing: '0.12em' }}>WHAT'S INSIDE</div>
          <h2 className="font-display" style={{ fontFamily: 'Fraunces', fontWeight: 700, fontSize: 'clamp(28px, 4.5vw, 40px)', letterSpacing: '-0.02em', color: 'var(--text-primary)' }}>
            One platform. <span style={{ fontStyle: 'italic', color: 'var(--brand-600)' }}>Five superpowers.</span>
          </h2>
        </div>

        <div className="stagger-in" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 22 }}>
          {features.slice(0, 4).map(f => <FeatureCard key={f.title} {...f}/>)}
          <div style={{ gridColumn: '1 / -1', maxWidth: 540, margin: '0 auto', width: '100%' }}>
            <FeatureCard {...features[4]}/>
          </div>
        </div>
      </div>
    </section>
  );
};

const FeatureCard = ({ icon, title, body, accent, special }) => {
  return (
    <div style={{
      background: special ? 'linear-gradient(180deg, rgba(16,185,129,0.05) 0%, var(--bg-surface) 30%)' : 'var(--bg-surface)',
      border: '1px solid var(--border-subtle)',
      borderRadius: 20,
      padding: 32,
      position: 'relative',
      overflow: 'hidden',
      transition: 'transform 280ms var(--ease-out-expo), box-shadow 280ms, border-color 280ms',
    }}
      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = 'var(--shadow-lg)'; e.currentTarget.style.borderColor = 'var(--border-default)'; }}
      onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.borderColor = 'var(--border-subtle)'; }}
    >
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: accent }}/>
      <div style={{
        width: 48, height: 48, borderRadius: 12,
        background: special ? 'var(--mint-100)' : 'var(--brand-50)',
        color: special ? 'var(--mint-700)' : 'var(--brand-600)',
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        marginBottom: 18,
      }}>
        <Icon name={icon} size={22}/>
      </div>
      <h3 style={{ fontFamily: 'Inter', fontWeight: 600, fontSize: 19, color: 'var(--text-primary)', marginBottom: 8, letterSpacing: '-0.01em' }}>{title}</h3>
      <p style={{ fontFamily: 'Inter', fontSize: 14.5, lineHeight: 1.55, color: 'var(--text-secondary)' }}>{body}</p>
    </div>
  );
};

// ─── How It Works ───────────────────────
const HowItWorks = () => {
  const steps = [
    { n: 1, title: 'Sign up & choose your field', sub: '30 seconds. Pick your exam, your level, your goals.' },
    { n: 2, title: 'Join a room or book a mentor', sub: 'Instant access. No waitlists, no scheduling drama.' },
    { n: 3, title: 'Track progress, stay consistent', sub: 'Streaks, analytics, community. Momentum compounds.' },
  ];

  return (
    <section style={{ padding: '96px 24px', background: 'var(--bg-surface)', borderTop: '1px solid var(--border-subtle)', borderBottom: '1px solid var(--border-subtle)' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 64 }}>
          <div className="label-sm" style={{ color: 'var(--brand-400)', marginBottom: 14, fontSize: 12, fontWeight: 700, letterSpacing: '0.12em' }}>HOW IT WORKS</div>
          <h2 className="font-display" style={{ fontFamily: 'Fraunces', fontWeight: 700, fontSize: 'clamp(28px, 4.5vw, 40px)', letterSpacing: '-0.02em', color: 'var(--text-primary)' }}>
            From zero to <span style={{ fontStyle: 'italic', color: 'var(--brand-600)' }}>locked in</span> — in three steps.
          </h2>
        </div>

        <div className="stagger-in" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 32, position: 'relative' }}>
          {steps.map((s, i) => (
            <div key={s.n} style={{ textAlign: 'center', position: 'relative' }}>
              <div style={{
                width: 56, height: 56, borderRadius: '50%',
                background: 'var(--gradient-brand)',
                color: '#fff',
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: 'Fraunces', fontWeight: 700, fontSize: 22,
                marginBottom: 20,
                boxShadow: '0 8px 22px rgba(27,43,142,0.30)',
                position: 'relative', zIndex: 2,
              }}>{s.n}</div>
              <h3 style={{ fontFamily: 'Inter', fontWeight: 600, fontSize: 18, color: 'var(--text-primary)', marginBottom: 8, letterSpacing: '-0.01em' }}>{s.title}</h3>
              <p style={{ fontFamily: 'Inter', fontSize: 14, lineHeight: 1.55, color: 'var(--text-secondary)', maxWidth: 280, margin: '0 auto' }}>{s.sub}</p>

              {/* Connector */}
              {i < steps.length - 1 && (
                <div className="desktop-only" aria-hidden="true" style={{
                  position: 'absolute', top: 28, left: 'calc(50% + 36px)', right: 'calc(-50% + 36px)',
                  borderTop: '2px dashed var(--border-strong)', zIndex: 1,
                }}/>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

// ─── Mentor Showcase (auto-scroll) ─────
const MentorShowcase = () => {
  const mentors = [
    { name: 'Dr. Anika Rao', title: 'JEE Physics · IIT-B', rating: 4.9, tags: ['Physics', 'Mech'], price: 599, tint: 0 },
    { name: 'Rohan Malhotra', title: 'CAT 99.8% · IIM-A', rating: 4.95, tags: ['Quant', 'Verbal'], price: 799, tint: 1 },
    { name: 'Priya Iyer', title: 'NEET Biology · AIIMS', rating: 4.9, tags: ['Biology'], price: 699, tint: 2 },
    { name: 'Aakash Verma', title: 'Software · Ex-Google', rating: 4.8, tags: ['DSA', 'System'], price: 999, tint: 3 },
    { name: 'Megha Shah', title: 'UPSC · IAS 2022', rating: 4.95, tags: ['Polity', 'Hist'], price: 899, tint: 4 },
    { name: 'Arjun Nair', title: 'GATE CSE · AIR 12', rating: 4.85, tags: ['CN', 'OS'], price: 599, tint: 5 },
    { name: 'Sara Khan', title: 'GMAT 760 · Wharton', rating: 4.9, tags: ['Quant'], price: 1299, tint: 6 },
    { name: 'Kabir Sharma', title: 'JEE Maths · IIT-D', rating: 4.9, tags: ['Calculus'], price: 599, tint: 7 },
  ];

  const [paused, setPaused] = useStateL(false);

  return (
    <section id="mentors" style={{ padding: '96px 0', background: 'var(--bg-base)' }}>
      <div style={{ maxWidth: 1180, margin: '0 auto', padding: '0 24px', textAlign: 'center', marginBottom: 48 }}>
        <div className="label-sm" style={{ color: 'var(--brand-400)', marginBottom: 14, fontSize: 12, fontWeight: 700, letterSpacing: '0.12em' }}>MENTORS</div>
        <h2 className="font-display" style={{ fontFamily: 'Fraunces', fontWeight: 700, fontSize: 'clamp(28px, 4.5vw, 40px)', letterSpacing: '-0.02em', color: 'var(--text-primary)' }}>
          Real people. <span style={{ fontStyle: 'italic', color: 'var(--brand-600)' }}>Real outcomes.</span>
        </h2>
      </div>

      <div className="marquee-mask" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
        <div className="marquee-track" style={{ animationPlayState: paused ? 'paused' : 'running' }}>
          {[...mentors, ...mentors].map((m, i) => (
            <MentorCard key={i} {...m}/>
          ))}
        </div>
      </div>
    </section>
  );
};

const MentorCard = ({ name, title, rating, tags, price, tint }) => (
  <div style={{
    flexShrink: 0, width: 220,
    background: 'var(--bg-surface)',
    border: '1px solid var(--border-subtle)',
    borderRadius: 18,
    padding: 22,
    transition: 'transform 240ms var(--ease-out-expo), box-shadow 240ms',
    cursor: 'pointer',
  }}
    onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = 'var(--shadow-lg)'; }}
    onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
  >
    <Avatar name={name} size={64} tint={tint}/>
    <div style={{ marginTop: 12, fontFamily: 'Inter', fontWeight: 600, fontSize: 14, color: 'var(--text-primary)' }}>{name}</div>
    <div style={{ fontSize: 12, color: 'var(--text-tertiary)', marginTop: 2 }}>{title}</div>
    <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 4, fontSize: 12 }}>
      <span style={{ color: 'var(--gold-500)' }}>★</span>
      <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{rating}</span>
    </div>
    <div style={{ marginTop: 10, display: 'flex', gap: 4, flexWrap: 'wrap' }}>
      {tags.map(t => (
        <span key={t} style={{ fontSize: 10, fontWeight: 600, padding: '3px 8px', borderRadius: 999, background: 'var(--brand-50)', color: 'var(--brand-600)' }}>{t}</span>
      ))}
    </div>
    <div style={{ marginTop: 14, paddingTop: 12, borderTop: '1px solid var(--border-subtle)', fontSize: 12, color: 'var(--text-tertiary)' }}>
      from <strong style={{ color: 'var(--gold-600)', fontFamily: 'Inter', fontWeight: 700 }}>₹{price}</strong>
    </div>
  </div>
);

// ─── Testimonials ──────────────────────
const Testimonials = () => {
  const items = [
    { quote: 'I went from skipping study days to a 47-day streak. The rooms are everything.', name: 'Aanya S.', field: 'JEE 2026', tint: 0 },
    { quote: 'Nova explained limits in 30 seconds what 3 hours of YouTube couldn’t. Wild.', name: 'Rohit M.', field: 'NEET 2026', tint: 1 },
    { quote: 'My CAT score jumped 12 percentile in 6 weeks. The mentor sessions hit different.', name: 'Megha P.', field: 'CAT 2025', tint: 2 },
    { quote: 'Mock interviews with peers got me my first SDE offer. The feedback is brutal & useful.', name: 'Kabir T.', field: 'SDE @ Razorpay', tint: 3 },
    { quote: 'It feels like everyone around me is actually working. That changed everything for me.', name: 'Sara N.', field: 'UPSC 2026', tint: 4 },
  ];

  const [idx, setIdx] = useStateL(0);
  useEffectL(() => {
    const id = setInterval(() => setIdx(i => (i + 1) % items.length), 5000);
    return () => clearInterval(id);
  }, [items.length]);

  return (
    <section style={{ padding: '96px 24px', background: 'var(--bg-surface)', borderTop: '1px solid var(--border-subtle)', borderBottom: '1px solid var(--border-subtle)' }}>
      <div style={{ maxWidth: 1180, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 56 }}>
          <div className="label-sm" style={{ color: 'var(--brand-400)', marginBottom: 14, fontSize: 12, fontWeight: 700, letterSpacing: '0.12em' }}>STUDENT VOICES</div>
          <h2 className="font-display" style={{ fontFamily: 'Fraunces', fontWeight: 700, fontSize: 'clamp(28px, 4.5vw, 40px)', letterSpacing: '-0.02em', color: 'var(--text-primary)' }}>
            Built with them. <span style={{ fontStyle: 'italic', color: 'var(--brand-600)' }}>Loved by them.</span>
          </h2>
        </div>

        <div style={{ overflow: 'hidden' }}>
          <div style={{
            display: 'flex', gap: 22,
            transform: `translateX(calc(-${idx * 100}% / 3))`,
            transition: 'transform 700ms var(--ease-out-expo)',
          }}>
            {items.map((t, i) => <TestimonialCard key={i} {...t}/>)}
          </div>
        </div>

        <div style={{ display: 'flex', gap: 6, justifyContent: 'center', marginTop: 32 }}>
          {items.map((_, i) => (
            <button key={i} onClick={() => setIdx(i)} style={{
              width: i === idx ? 22 : 6, height: 6, borderRadius: 999,
              background: i === idx ? 'var(--brand-500)' : 'var(--border-strong)',
              transition: 'all 280ms var(--ease-smooth)',
            }}/>
          ))}
        </div>
      </div>
    </section>
  );
};

const TestimonialCard = ({ quote, name, field, tint }) => (
  <div style={{
    flexShrink: 0,
    width: 'calc((100% - 44px) / 3)',
    minWidth: 280,
    background: 'var(--bg-base)',
    border: '1px solid var(--border-subtle)',
    borderRadius: 20,
    padding: 28,
    position: 'relative',
  }}>
    <div style={{ fontFamily: 'Fraunces', fontStyle: 'italic', fontWeight: 500, fontSize: 64, lineHeight: 0.6, color: 'var(--brand-300)', marginBottom: 16 }}>“</div>
    <p style={{ fontFamily: 'Inter', fontSize: 15.5, lineHeight: 1.55, color: 'var(--text-primary)', marginBottom: 24 }}>{quote}</p>
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, paddingTop: 16, borderTop: '1px solid var(--border-subtle)' }}>
      <Avatar name={name} size={36} tint={tint}/>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{name}</div>
        <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>{field}</div>
      </div>
      <div style={{ color: 'var(--gold-500)', fontSize: 12, letterSpacing: 2 }}>★★★★★</div>
    </div>
  </div>
);

// ─── Pricing Preview ───────────────────
const PricingPreview = ({ navigate }) => {
  const plans = [
    { name: 'Free', price: '₹0', sub: 'forever', features: ['3 rooms / week', 'Limited Nova queries', 'Community access'], cta: 'Start free', highlight: false },
    { name: 'Pro', price: '₹399', sub: 'per month', features: ['Unlimited rooms', 'Unlimited Nova', 'Mentor sessions discount', 'Advanced analytics', 'Priority matching'], cta: 'Start 7-day trial', highlight: true },
    { name: 'Pro Max', price: '₹699', sub: 'per month', features: ['Everything in Pro', '2 mentor sessions / month', '1:1 interview prep', 'Group rooms', 'Verified badge'], cta: 'Go Pro Max', highlight: false },
  ];

  return (
    <section id="pricing" style={{ padding: '96px 24px', background: 'var(--bg-base)' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 56 }}>
          <div className="label-sm" style={{ color: 'var(--brand-400)', marginBottom: 14, fontSize: 12, fontWeight: 700, letterSpacing: '0.12em' }}>PRICING</div>
          <h2 className="font-display" style={{ fontFamily: 'Fraunces', fontWeight: 700, fontSize: 'clamp(28px, 4.5vw, 40px)', letterSpacing: '-0.02em', color: 'var(--text-primary)' }}>
            Pick a plan. <span style={{ fontStyle: 'italic', color: 'var(--brand-600)' }}>Cancel whenever.</span>
          </h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 22, alignItems: 'start' }}>
          {plans.map(p => (
            <div key={p.name} className="price-card" style={{
              transform: p.highlight ? 'scale(1.03)' : 'none',
              boxShadow: p.highlight ? 'var(--shadow-brand)' : 'var(--shadow-sm)',
              border: p.highlight ? '1.5px solid var(--brand-500)' : '1px solid var(--border-subtle)',
              background: p.highlight ? 'linear-gradient(180deg, var(--brand-50) 0%, var(--bg-surface) 30%)' : 'var(--bg-surface)',
            }}>
              {p.highlight && (
                <div style={{ display: 'inline-flex', padding: '4px 12px', borderRadius: 999, background: 'var(--gradient-brand)', color: '#fff', fontSize: 11, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 16 }}>Most popular</div>
              )}
              <div style={{ fontFamily: 'Inter', fontWeight: 600, fontSize: 14, color: 'var(--text-secondary)', marginBottom: 8 }}>{p.name}</div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: 4 }}>
                <span style={{ fontFamily: 'Fraunces', fontWeight: 700, fontSize: 38, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>{p.price}</span>
                <span style={{ fontSize: 13, color: 'var(--text-tertiary)' }}>{p.sub}</span>
              </div>
              <ul style={{ listStyle: 'none', padding: 0, margin: '24px 0', display: 'flex', flexDirection: 'column', gap: 10 }}>
                {p.features.map(f => (
                  <li key={f} style={{ display: 'flex', gap: 8, fontSize: 13.5, color: 'var(--text-secondary)' }}>
                    <span style={{ color: 'var(--mint-500)', fontWeight: 700 }}>✓</span>
                    {f}
                  </li>
                ))}
              </ul>
              <button onClick={() => navigate('signup')} style={{
                width: '100%', height: 44, borderRadius: 999,
                background: p.highlight ? 'var(--gradient-brand)' : 'var(--bg-surface)',
                border: p.highlight ? 'none' : '1px solid var(--border-default)',
                color: p.highlight ? '#fff' : 'var(--text-primary)',
                fontFamily: 'Inter', fontWeight: 600, fontSize: 14,
                boxShadow: p.highlight ? '0 6px 18px rgba(27,43,142,0.30)' : 'none',
                transition: 'all 220ms var(--ease-smooth)',
              }}
                onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-1px)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
              >{p.cta}</button>
            </div>
          ))}
        </div>

        <div style={{ textAlign: 'center', marginTop: 40 }}>
          <button onClick={() => navigate('pricing')} style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            color: 'var(--brand-500)', fontFamily: 'Inter', fontWeight: 600, fontSize: 14,
          }}
            onMouseEnter={e => e.currentTarget.style.color = 'var(--brand-700)'}
            onMouseLeave={e => e.currentTarget.style.color = 'var(--brand-500)'}
          >See full pricing →</button>
        </div>
      </div>
    </section>
  );
};

// ─── Final CTA ─────────────────────────
const FinalCTA = ({ navigate }) => {
  return (
    <section id="community" style={{
      padding: '120px 24px', textAlign: 'center', background: 'var(--bg-base)',
      position: 'relative', overflow: 'hidden',
    }}>
      <div aria-hidden="true" style={{
        position: 'absolute', inset: 0,
        background: 'radial-gradient(ellipse 800px 400px at 50% 50%, rgba(27,43,142,0.10) 0%, transparent 60%)',
      }}/>
      <div style={{ position: 'relative', maxWidth: 760, margin: '0 auto' }}>
        <h2 className="font-display" style={{
          fontFamily: 'Fraunces', fontWeight: 800, fontStyle: 'italic',
          fontSize: 'clamp(36px, 6vw, 64px)',
          lineHeight: 1.05, letterSpacing: '-0.025em',
          background: 'var(--gradient-brand)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          marginBottom: 36,
        }}>
          Your best study year<br/>starts tonight.
        </h2>
        <button onClick={() => navigate('signup')} className="landing-cta" style={{ height: 60, fontSize: 16, padding: '0 32px' }}>
          Get Started Free <span style={{ marginLeft: 4 }}>→</span>
        </button>
        <div style={{ marginTop: 32, display: 'flex', justifyContent: 'center', gap: 10, flexWrap: 'wrap' }}>
          {['Free plan forever', '7-day Pro trial', 'Cancel anytime'].map(t => (
            <span key={t} style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              padding: '6px 14px', borderRadius: 999,
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-subtle)',
              fontSize: 12, color: 'var(--text-secondary)', fontWeight: 500,
            }}>
              <span style={{ color: 'var(--mint-500)' }}>✓</span>{t}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
};

// ─── Footer ────────────────────────────
const Footer = () => {
  const cols = [
    { title: 'Product', items: ['Study Rooms', 'Nova AI', 'Mentors', 'Interviews', 'Productivity'] },
    { title: 'Company', items: ['About', 'Blog', 'Careers', 'Press', 'Brand'] },
    { title: 'Support', items: ['Help Center', 'Contact', 'Status', 'Privacy', 'Terms'] },
  ];
  return (
    <footer style={{ padding: '64px 24px 36px', background: 'var(--bg-surface)', borderTop: '1px solid var(--border-subtle)' }}>
      <div style={{ maxWidth: 1180, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 40 }}>
        <div style={{ maxWidth: 280 }}>
          <img src="assets/elm-origin-logo.png" alt="Elm Origin" style={{ height: 28, marginBottom: 14 }}/>
          <p style={{ fontSize: 13, lineHeight: 1.6, color: 'var(--text-tertiary)', marginBottom: 18 }}>
            The study environment you were always missing.
          </p>
          <div style={{ display: 'flex', gap: 8 }}>
            {['twitter', 'instagram', 'linkedin'].map(s => (
              <button key={s} style={{
                width: 32, height: 32, borderRadius: 999,
                background: 'var(--bg-subtle)',
                color: 'var(--text-secondary)',
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 11, fontWeight: 600,
              }}>{s[0].toUpperCase()}</button>
            ))}
          </div>
        </div>
        {cols.map(c => (
          <div key={c.title}>
            <div style={{ fontFamily: 'Inter', fontWeight: 700, fontSize: 12, letterSpacing: '0.10em', textTransform: 'uppercase', color: 'var(--text-primary)', marginBottom: 14 }}>{c.title}</div>
            <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
              {c.items.map(i => (
                <li key={i}><a style={{ fontSize: 13, color: 'var(--text-tertiary)', cursor: 'pointer' }}>{i}</a></li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div style={{ maxWidth: 1180, margin: '40px auto 0', paddingTop: 24, borderTop: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, fontSize: 12, color: 'var(--text-tertiary)' }}>
        <div>© 2026 ELM Origin</div>
        <div>Made for learners everywhere.</div>
      </div>
    </footer>
  );
};

window.Landing = Landing;
