/* global React */
const { useState: useStateL, useEffect: useEffectL, useMemo: useMemoL } = React;

// ═══════════════════════════════════════
// ELM ORIGIN — LANDING PAGE
// ═══════════════════════════════════════

const EXAM_MARQUEE = [
  'JEE Mains','JEE Advanced','NEET UG','NEET PG','CAT','UPSC CSE','GATE','GRE',
  'GMAT','SAT','IELTS','TOEFL','CFA','CA','CLAT','Class 12 Boards'
];

const FEATURE_BLOCKS = [
  {
    eyebrow: 'STUDY ROOMS',
    title: 'Your study room, open 24/7.',
    body: 'Join live rooms filtered by your exam. See who else is studying. Turn your camera on and lock in — together.',
    link: 'Join a room →',
    flip: false,
    visual: 'rooms',
  },
  {
    eyebrow: 'NOVA AI',
    title: 'Ask anything. Get it instantly.',
    body: 'Nova is your always-on AI tutor. Understands your subject, your level, your exam. Never judges, never rushes.',
    link: 'Meet Nova →',
    flip: true,
    tinted: true,
    visual: 'nova',
  },
  {
    eyebrow: 'MENTORS',
    title: 'Real mentors. Real progress.',
    body: 'Book 1:1 sessions with verified experts in your domain. JEE toppers, IIM grads, working professionals.',
    link: 'Browse mentors →',
    flip: false,
    visual: 'mentors',
  },
  {
    eyebrow: 'INTERVIEW PREP',
    title: 'Practise until it\u2019s effortless.',
    body: 'AI coaching with instant structured feedback. Live peer practice with matched students. Both modes include screen share.',
    link: 'Try a session →',
    flip: true,
    tinted: true,
    visual: 'interviews',
  },
];

// ── Hero study tile mock ──────────────────────────────────
function StudyTile({ name, subject, streak, hearts, tint }) {
  return (
    <div className="studytile" style={{ animationDelay: `${(tint % 4) * 0.5}s` }}>
      <div style={{
        position: 'absolute', inset: 0,
        background: `radial-gradient(circle at 30% 30%, rgba(123,143,232,${0.18 + (tint%3)*0.05}), transparent 60%)`,
      }}/>
      {/* avatar */}
      <div style={{
        position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)',
        width: 56, height: 56, borderRadius: '50%',
        background: ['#3D52CC','#7B8FE8','#B8C4F4','#1B2B8E'][tint % 4],
        color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: 'Inter', fontWeight: 700, fontSize: 18, letterSpacing: '0.02em',
      }}>{name.split(' ').map(n => n[0]).join('').slice(0,2)}</div>
      {/* mic indicator */}
      <span style={{ position: 'absolute', top: 10, left: 10, width: 8, height: 8, borderRadius: 999, background: '#10B981', boxShadow: '0 0 0 3px rgba(16,185,129,0.30)' }}/>
      {/* streak chip */}
      <span style={{
        position: 'absolute', top: 8, right: 8,
        padding: '3px 8px', borderRadius: 999, fontSize: 10, fontWeight: 700,
        background: 'rgba(245,158,11,0.20)', color: '#FCD34D',
      }}>🔥 {streak}</span>
      {/* bottom bar */}
      <div style={{
        position: 'absolute', left: 0, right: 0, bottom: 0, padding: '20px 12px 8px',
        background: 'linear-gradient(transparent, rgba(5,10,30,0.92))',
        display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end',
      }}>
        <div>
          <div style={{ color: '#fff', fontSize: 11, fontWeight: 600 }}>{name}</div>
          <div style={{ color: 'rgba(255,255,255,0.55)', fontSize: 9, fontStyle: 'italic' }}>{subject}</div>
        </div>
        <div style={{ color: '#fff', fontSize: 10, opacity: 0.75 }}>♥ {hearts}</div>
      </div>
    </div>
  );
}

function HeroVisual() {
  const tiles = [
    { name: 'Priya M', subject: 'Organic Chem', streak: 47, hearts: 12 },
    { name: 'Rohan K', subject: 'Calculus', streak: 22, hearts: 8 },
    { name: 'Aisha S', subject: 'Polity Notes', streak: 91, hearts: 31 },
    { name: 'Dev R', subject: 'Algorithms', streak: 14, hearts: 5 },
  ];
  return (
    <div style={{ position: 'relative', width: '100%', maxWidth: 560, aspectRatio: '4 / 3' }}>
      {/* 2x2 tile grid */}
      <div style={{
        display: 'grid', gridTemplateColumns: '1fr 1fr', gridTemplateRows: '1fr 1fr',
        gap: 12, width: '100%', height: '100%',
        padding: 18,
        background: 'var(--bg-surface)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 28,
        boxShadow: 'var(--shadow-xl)',
      }}>
        {tiles.map((t, i) => <StudyTile key={i} {...t} tint={i}/>)}
      </div>
      {/* floating badges */}
      <div className="float-badge" style={{ top: -16, left: -22, animationDelay: '0s' }}>
        <span style={{ fontSize: 14 }}>🔥</span>
        <span>15-day streak</span>
      </div>
      <div className="float-badge" style={{ bottom: 38, left: -32, animationDelay: '1.2s', background: 'var(--mint-100)', color: 'var(--mint-700)', borderColor: 'transparent' }}>
        <span style={{ width: 7, height: 7, borderRadius: 999, background: 'var(--mint-500)' }}/>
        <span>47 students live</span>
      </div>
      <div className="float-badge" style={{ top: 30, right: -26, animationDelay: '2.4s', background: 'var(--gold-100)', color: 'var(--gold-700)', borderColor: 'transparent' }}>
        <span>★ 4.9 mentor rating</span>
      </div>
    </div>
  );
}

// ── Feature block visuals ─────────────────────────────────
function FeatureVisual({ kind }) {
  if (kind === 'rooms') {
    return (
      <div style={{
        background: '#050A1E', borderRadius: 24, padding: 18,
        boxShadow: 'var(--shadow-xl)',
        display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8,
        aspectRatio: '4/3',
      }}>
        {[0,1,2,3,4,5,6,7,8].map(i => (
          <div key={i} className="studytile" style={{ aspectRatio: '4/3', animationDelay: `${(i%4)*0.4}s` }}>
            <div style={{
              position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)',
              width: 28, height: 28, borderRadius: '50%',
              background: ['#3D52CC','#7B8FE8','#10B981','#F59E0B'][i%4],
              color: '#fff', display:'flex', alignItems:'center', justifyContent:'center',
              fontWeight: 700, fontSize: 11,
            }}>{['PM','RK','AS','DR','VK','NS','TM','RA','SH'][i]}</div>
          </div>
        ))}
      </div>
    );
  }
  if (kind === 'nova') {
    return (
      <div style={{
        background: 'var(--bg-surface)', borderRadius: 24, padding: 28,
        boxShadow: 'var(--shadow-xl)', border: '1px solid var(--border-subtle)',
        display: 'flex', flexDirection: 'column', gap: 14, aspectRatio: '4/3', justifyContent: 'center',
      }}>
        <div style={{ alignSelf: 'flex-end', maxWidth: '78%', padding: '12px 16px', borderRadius: '18px 18px 4px 18px', background: 'var(--brand-600)', color: '#fff', fontSize: 14, lineHeight: 1.5 }}>
          Explain why entropy always increases in an isolated system.
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
          <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--gradient-ai)', flexShrink: 0, display:'flex', alignItems:'center', justifyContent:'center', color:'#fff' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2 14 10 22 12 14 14 12 22 10 14 2 12 10 10z"/></svg>
          </div>
          <div style={{ maxWidth: '82%', padding: '12px 16px', borderRadius: '18px 18px 18px 4px', background: 'var(--bg-subtle)', color: 'var(--text-primary)', fontSize: 13.5, lineHeight: 1.6 }}>
            Entropy reflects the number of microstates — and statistically, a system has overwhelmingly more disordered arrangements than ordered ones…
            <span style={{ display: 'inline-block', width: 7, height: 14, background: 'var(--brand-500)', verticalAlign:'middle', marginLeft: 4, animation: 'blink 1s steps(1) infinite' }}/>
          </div>
        </div>
      </div>
    );
  }
  if (kind === 'mentors') {
    const cards = [
      { name: 'Ravi M', tag: 'IIT Delhi · Physics', rating: 4.9 },
      { name: 'Anika P', tag: 'IIM-A · Marketing', rating: 4.8 },
      { name: 'Dev S', tag: 'AIIMS · Biology', rating: 5.0 },
    ];
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, aspectRatio: '4/3', justifyContent: 'center' }}>
        {cards.map((m, i) => (
          <div key={i} style={{
            display: 'flex', alignItems: 'center', gap: 14, padding: 16,
            background: 'var(--bg-surface)', borderRadius: 16,
            border: '1px solid var(--border-subtle)', boxShadow: i === 1 ? 'var(--shadow-md)' : 'var(--shadow-xs)',
            transform: i === 1 ? 'scale(1.04)' : 'none',
          }}>
            <div style={{ width: 44, height: 44, borderRadius: '50%', background: ['#3D52CC','#10B981','#F59E0B'][i], color: '#fff', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:700, fontSize: 14 }}>{m.name.split(' ').map(n=>n[0]).join('')}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600, fontSize: 14 }}>{m.name}</div>
              <div style={{ color: 'var(--text-tertiary)', fontSize: 12, marginTop: 2 }}>{m.tag}</div>
            </div>
            <div style={{ fontSize: 13, fontWeight: 600 }}>★ {m.rating}</div>
            <div style={{ padding: '6px 14px', borderRadius: 999, background: 'var(--brand-600)', color: '#fff', fontSize: 12, fontWeight: 600 }}>Book</div>
          </div>
        ))}
      </div>
    );
  }
  // interviews — score ring + dim bars
  return (
    <div style={{ background: 'var(--bg-surface)', borderRadius: 24, padding: 28, boxShadow: 'var(--shadow-xl)', border: '1px solid var(--border-subtle)', aspectRatio: '4/3', display: 'flex', flexDirection: 'column', gap: 18 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
        <ScoreRingSVG score={74}/>
        <div>
          <div style={{ fontSize: 11, letterSpacing: '0.10em', textTransform: 'uppercase', color: 'var(--text-tertiary)', fontWeight: 600 }}>Overall score</div>
          <div style={{ fontFamily: 'Fraunces', fontSize: 36, color: 'var(--brand-600)', lineHeight: 1, marginTop: 4 }}>74<span style={{ fontSize: 16, color: 'var(--text-tertiary)' }}>/100</span></div>
          <div style={{ fontSize: 12, color: 'var(--mint-600)', marginTop: 4, fontWeight: 600 }}>+8 from last attempt</div>
        </div>
      </div>
      {[['Content',80],['Structure',70],['Confidence',65],['Depth',72]].map(([l,v]) => (
        <div key={l}>
          <div style={{ display:'flex', justifyContent:'space-between', fontSize: 12, color: 'var(--text-secondary)', marginBottom: 4 }}>
            <span>{l}</span><span style={{ fontFamily: 'JetBrains Mono', color: 'var(--text-primary)' }}>{v}%</span>
          </div>
          <div style={{ height: 6, background: 'var(--bg-subtle)', borderRadius: 999, overflow: 'hidden' }}>
            <div style={{ width: `${v}%`, height: '100%', background: 'var(--brand-600)', borderRadius: 999 }}/>
          </div>
        </div>
      ))}
    </div>
  );
}

function ScoreRingSVG({ score = 74, size = 96 }) {
  const r = (size - 12) / 2;
  const c = 2 * Math.PI * r;
  const off = c - (score / 100) * c;
  return (
    <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
      <circle cx={size/2} cy={size/2} r={r} stroke="var(--bg-subtle)" strokeWidth="8" fill="none"/>
      <circle cx={size/2} cy={size/2} r={r} stroke="var(--brand-600)" strokeWidth="8" fill="none"
        strokeDasharray={c} strokeDashoffset={off} strokeLinecap="round"
        style={{ transition: 'stroke-dashoffset 800ms var(--ease-out-expo)' }}/>
    </svg>
  );
}

// ── Pricing ───────────────────────────────────────────────
function PricingSection({ navigate }) {
  const [annual, setAnnual] = useStateL(false);
  const monthly = annual ? 0 : 0;
  return (
    <section style={{ padding: '96px 56px', maxWidth: 1180, margin: '0 auto' }}>
      <div style={{ textAlign: 'center', marginBottom: 48 }}>
        <div className="font-display" style={{ fontSize: 'clamp(36px, 5vw, 56px)', fontWeight: 500, lineHeight: 1.05 }}>
          Simple <span style={{ fontStyle: 'italic', color: 'var(--brand-600)' }}>pricing.</span>
        </div>
        <p style={{ fontSize: 18, color: 'var(--text-secondary)', marginTop: 14, maxWidth: 540, marginLeft: 'auto', marginRight: 'auto' }}>
          Start free. Upgrade when you\u2019re ready. Cancel anytime.
        </p>
        <div style={{ display: 'inline-flex', marginTop: 24, padding: 4, borderRadius: 999, background: 'var(--bg-subtle)', border: '1px solid var(--border-subtle)' }}>
          {[['Monthly', false], ['Annual — save 30%', true]].map(([l, v]) => (
            <button key={String(v)} onClick={() => setAnnual(v)} style={{
              padding: '8px 18px', borderRadius: 999, fontSize: 13, fontWeight: 600,
              background: annual === v ? 'var(--bg-surface)' : 'transparent',
              color: annual === v ? 'var(--text-primary)' : 'var(--text-secondary)',
              boxShadow: annual === v ? 'var(--shadow-xs)' : 'none',
              transition: 'all 220ms var(--ease-smooth)',
            }}>{l}</button>
          ))}
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 24, maxWidth: 800, margin: '0 auto' }}>
        <div className="price-card">
          <div style={{ fontSize: 13, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--text-tertiary)' }}>Free forever</div>
          <div className="font-display" style={{ fontSize: 42, fontWeight: 500, marginTop: 8, lineHeight: 1 }}>₹0<span style={{ fontSize: 16, color: 'var(--text-tertiary)' }}> / month</span></div>
          <div style={{ marginTop: 24, display: 'flex', flexDirection: 'column', gap: 12 }}>
            {[['✓','2 study rooms per day'],['✓','2 Elm Together requests / day'],['✓','5 Nova AI questions / day'],['✓','3 interview sessions / month'],['✗','Direct mentor messaging'],['✗','Unlimited screen share'],['✗','Priority booking']].map(([k,t],i) => (
              <div key={i} style={{ display: 'flex', gap: 10, fontSize: 14, color: k==='✗' ? 'var(--text-tertiary)' : 'var(--text-secondary)' }}>
                <span style={{ color: k==='✓' ? 'var(--mint-500)' : 'var(--text-muted)', fontWeight: 700, width: 16 }}>{k}</span>{t}
              </div>
            ))}
          </div>
          <button onClick={() => navigate('signup-student')} className="landing-cta-ghost" style={{ width: '100%', marginTop: 28, justifyContent: 'center' }}>Get started</button>
        </div>
        <div className="price-card featured" style={{ position: 'relative' }}>
          <span className="chip-gold" style={{ position: 'absolute', top: 20, right: 20 }}>★ Most popular</span>
          <div style={{ fontSize: 13, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--gold-600)' }}>Pro</div>
          <div className="font-display" style={{ fontSize: 42, fontWeight: 500, marginTop: 8, lineHeight: 1 }}>
            {annual ? '₹2,499' : '₹299'}<span style={{ fontSize: 16, color: 'var(--text-tertiary)' }}> / {annual ? 'year' : 'month'}</span>
          </div>
          {annual && <div style={{ fontSize: 12, color: 'var(--mint-600)', fontWeight: 600, marginTop: 6 }}>Save ₹1,089 annually</div>}
          <div style={{ marginTop: 24, display: 'flex', flexDirection: 'column', gap: 12 }}>
            {['Unlimited study rooms','Unlimited Elm Together','Unlimited Nova AI','Unlimited interviews + screen share','Direct mentor messaging','Priority mentor booking','Dark mode + custom frame'].map((t,i) => (
              <div key={i} style={{ display: 'flex', gap: 10, fontSize: 14, color: 'var(--text-primary)' }}>
                <span style={{ color: 'var(--mint-500)', fontWeight: 700, width: 16 }}>✓</span>{t}
              </div>
            ))}
          </div>
          <button onClick={() => navigate('signup-student')} className="landing-cta" style={{ width: '100%', marginTop: 28, justifyContent: 'center' }}>Try Pro free for 7 days →</button>
        </div>
      </div>
    </section>
  );
}

// ── Testimonials ──────────────────────────────────────────
function Testimonials() {
  const items = [
    { name: 'Priya M.', tag: 'Preparing for JEE Advanced', q: 'I went from solo grinding to actually studying with people. My streak is 91 days now.' },
    { name: 'Aarav S.', tag: 'NEET UG aspirant', q: 'Nova explains things the way my chemistry teacher never could. Like a patient genius on call.' },
    { name: 'Tanvi R.', tag: 'CAT — IIM Bangalore admit', q: 'The mock interviews on Elm Origin were tougher than the real thing. That\u2019s exactly why I cleared it.' },
  ];
  return (
    <section className="section-tinted" style={{ padding: '96px 56px' }}>
      <div style={{ maxWidth: 1180, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 56 }}>
          <div className="font-display" style={{ fontSize: 'clamp(36px, 5vw, 52px)', fontWeight: 500, lineHeight: 1.05 }}>
            Loved by <span style={{ fontStyle: 'italic', color: 'var(--brand-600)' }}>serious</span> students.
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20 }}>
          {items.map((t, i) => (
            <div key={i} style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 20, padding: 28 }}>
              <div style={{ fontSize: 32, color: 'var(--brand-300)', lineHeight: 1, fontFamily: 'Fraunces' }}>“</div>
              <p style={{ fontSize: 16, lineHeight: 1.65, color: 'var(--text-primary)', marginTop: 6, marginBottom: 24 }}>{t.q}</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 38, height: 38, borderRadius: '50%', background: ['#1B2B8E','#10B981','#F59E0B'][i], color: '#fff', display:'flex', alignItems:'center', justifyContent:'center', fontWeight: 700, fontSize: 13 }}>{t.name.split(' ').map(n=>n[0]).join('')}</div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>{t.name}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>{t.tag}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Main Landing ──────────────────────────────────────────
function Landing({ navigate, theme, setTheme }) {
  const dark = theme === 'dark';
  return (
    <div style={{ background: 'var(--bg-base)', minHeight: '100vh', color: 'var(--text-primary)' }}>
      {/* NAV */}
      <nav className="landing-nav">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <img src="assets/elm-origin-logo.png" alt="Elm Origin" style={{ height: 32 }}/>
        </div>
        <div className="desktop-only" style={{ display: 'flex', gap: 28 }}>
          {['Features','For Students','For Mentors','Pricing'].map(l => (
            <a key={l} href="#" style={{ fontSize: 14, color: 'var(--text-secondary)', fontWeight: 500, transition: 'color 180ms' }}
              onMouseEnter={e => e.currentTarget.style.color = 'var(--text-primary)'}
              onMouseLeave={e => e.currentTarget.style.color = 'var(--text-secondary)'}
            >{l}</a>
          ))}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button className="theme-pill" onClick={() => setTheme(dark ? 'light' : 'dark')} title="Toggle theme">
            {dark ? (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/></svg>
            ) : (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
            )}
          </button>
          <button onClick={() => navigate('home')} className="desktop-only" style={{ height: 40, padding: '0 16px', fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', borderRadius: 999 }}>
            Log in
          </button>
          <button onClick={() => navigate('home')} className="landing-cta" style={{ height: 40, padding: '0 18px', fontSize: 14 }}>
            Get started free
          </button>
        </div>
      </nav>

      {/* HERO */}
      <section style={{ padding: 'clamp(48px, 7vw, 96px) 56px 64px', position: 'relative', overflow: 'hidden' }}>
        <div style={{
          maxWidth: 1180, margin: '0 auto',
          display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: 60, alignItems: 'center',
        }}>
          <div className="stagger-in">
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              padding: '6px 14px', borderRadius: 999,
              background: 'var(--brand-50)', color: 'var(--brand-600)',
              fontSize: 12.5, fontWeight: 600,
            }}>
              <span>🌟</span> Now in early access — free to join
            </div>
            <h1 className="font-display" style={{
              fontSize: 'clamp(44px, 6.5vw, 76px)', fontWeight: 500, lineHeight: 1.02,
              marginTop: 22, letterSpacing: '-0.025em',
            }}>
              Study smarter,<br/>
              <span style={{ fontStyle: 'italic', color: 'var(--brand-600)' }}>together.</span>
            </h1>
            <p style={{ fontSize: 'clamp(16px, 1.5vw, 20px)', color: 'var(--text-secondary)', marginTop: 22, lineHeight: 1.55, maxWidth: 520, textWrap: 'pretty' }}>
              Elm Origin brings live study rooms, expert mentors, AI tutoring, and interview prep into one beautifully focused space.
            </p>
            <div style={{ display: 'flex', gap: 14, marginTop: 32, flexWrap: 'wrap' }}>
              <button onClick={() => navigate('home')} className="landing-cta">Start for free →</button>
              <button className="landing-cta-ghost">▶ See how it works</button>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 24, fontSize: 13, color: 'var(--text-tertiary)' }}>
              <div style={{ display: 'flex' }}>
                {['#1B2B8E','#10B981','#F59E0B','#3D52CC'].map((c,i) => (
                  <div key={i} style={{ width: 26, height: 26, borderRadius: '50%', background: c, marginLeft: i ? -8 : 0, border: '2px solid var(--bg-base)' }}/>
                ))}
              </div>
              <span>Joined by <strong style={{ color: 'var(--text-primary)' }}>12,000+</strong> students</span>
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <HeroVisual/>
          </div>
        </div>
      </section>

      {/* MARQUEE */}
      <div className="marquee-mask" style={{ padding: '20px 0', background: 'var(--bg-subtle)', borderTop: '1px solid var(--border-subtle)', borderBottom: '1px solid var(--border-subtle)' }}>
        <div className="marquee-track">
          {[...EXAM_MARQUEE, ...EXAM_MARQUEE].map((e, i) => (
            <span key={i} style={{ fontSize: 14, color: 'var(--text-secondary)', fontWeight: 500, whiteSpace: 'nowrap' }}>
              {e} <span style={{ color: 'var(--text-muted)', marginLeft: 48 }}>·</span>
            </span>
          ))}
        </div>
      </div>

      {/* FEATURE BLOCKS */}
      {FEATURE_BLOCKS.map((b, i) => (
        <section key={i} className={b.tinted ? 'section-tinted' : ''} style={{ padding: 'clamp(64px, 8vw, 112px) 56px' }}>
          <div style={{
            maxWidth: 1180, margin: '0 auto',
            display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: 64, alignItems: 'center',
            direction: b.flip ? 'rtl' : 'ltr',
          }}>
            <div style={{ direction: 'ltr' }}>
              <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.10em', color: 'var(--brand-600)' }}>{b.eyebrow}</div>
              <h2 className="font-display" style={{ fontSize: 'clamp(32px, 4vw, 48px)', fontWeight: 500, lineHeight: 1.08, marginTop: 12, letterSpacing: '-0.02em' }}>{b.title}</h2>
              <p style={{ fontSize: 18, color: 'var(--text-secondary)', marginTop: 20, lineHeight: 1.6, textWrap: 'pretty', maxWidth: 480 }}>{b.body}</p>
              <button onClick={() => navigate('home')} style={{ marginTop: 24, fontSize: 15, fontWeight: 600, color: 'var(--brand-600)', display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                {b.link}
              </button>
            </div>
            <div style={{ direction: 'ltr' }}>
              <FeatureVisual kind={b.visual}/>
            </div>
          </div>
        </section>
      ))}

      {/* PRICING */}
      <PricingSection navigate={navigate}/>

      {/* TESTIMONIALS */}
      <Testimonials/>

      {/* FINAL CTA */}
      <section style={{ padding: '96px 56px', textAlign: 'center' }}>
        <div className="font-display" style={{ fontSize: 'clamp(36px, 5.5vw, 64px)', fontWeight: 500, lineHeight: 1.05, letterSpacing: '-0.02em' }}>
          Your next exam is <span style={{ fontStyle: 'italic', color: 'var(--brand-600)' }}>closer</span> than you think.
        </div>
        <p style={{ fontSize: 18, color: 'var(--text-secondary)', marginTop: 16, maxWidth: 560, marginLeft: 'auto', marginRight: 'auto' }}>
          Start your streak today. Free forever, no credit card.
        </p>
        <button onClick={() => navigate('home')} className="landing-cta" style={{ marginTop: 32, height: 60, padding: '0 32px', fontSize: 16 }}>
          Start for free →
        </button>
      </section>

      {/* FOOTER */}
      <footer style={{ background: '#0D1757', color: '#fff', padding: '56px 56px 32px' }}>
        <div style={{ maxWidth: 1180, margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 40, marginBottom: 40 }}>
            <div>
              <div style={{ fontFamily: 'Fraunces', fontWeight: 500, fontSize: 22 }}>Elm Origin</div>
              <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.55)', marginTop: 8, lineHeight: 1.6 }}>Built for serious students.</p>
            </div>
            {[
              ['Product', ['Features','Pricing','Mentors','Roadmap']],
              ['Company', ['About','Blog','Careers','Press']],
              ['Support', ['Help center','Contact','Privacy','Terms']],
            ].map(([h, links]) => (
              <div key={h}>
                <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.10em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.50)', marginBottom: 14 }}>{h}</div>
                {links.map(l => (
                  <a key={l} href="#" style={{ display: 'block', fontSize: 14, color: 'rgba(255,255,255,0.80)', marginBottom: 8 }}>{l}</a>
                ))}
              </div>
            ))}
          </div>
          <div style={{ paddingTop: 24, borderTop: '1px solid rgba(255,255,255,0.10)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)' }}>© 2025 Elm Origin. All rights reserved.</div>
            <div style={{ display: 'flex', gap: 14, fontSize: 12, color: 'rgba(255,255,255,0.55)' }}>
              <a href="#">Twitter / X</a><a href="#">LinkedIn</a><a href="#">Instagram</a><a href="#">YouTube</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

window.Landing = Landing;
