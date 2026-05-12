/* global React, Icon, Avatar */
const { useState, useEffect, useRef } = React;

// ═══════════════════════════════════════
// INTERVIEWS — Coaching + Peer Match
// Gen-Z/Alpha mindset: social, fast, gamified, status-aware
// ═══════════════════════════════════════

const INTERVIEW_COACHES = [
  { id: 1, name: 'Priya Sharma',    title: 'Data Scientist · Google',       rating: 4.9, sessions: 340, price: 1299, specialties: ['ML', 'System Design'], next: 'Tomorrow · 6:00 PM', online: true, placed: '180+ at FAANG' },
  { id: 2, name: 'Arjun Mehta',     title: 'Senior Engineer · Stripe',      rating: 4.9, sessions: 220, price: 1499, specialties: ['Coding', 'Behavioral'], next: 'Today · 9:00 PM',   online: true, placed: '90+ at unicorns' },
  { id: 3, name: 'Dr. Elena Rossi', title: 'Admissions · Oxford',           rating: 5.0, sessions: 98,  price: 1999, specialties: ['MBA', 'PhD'],         next: 'Fri · 4:00 PM',     online: false, placed: 'Ivy League admits' },
  { id: 4, name: 'Karan Iyer',      title: 'IIT-B · Interview coach',       rating: 4.9, sessions: 410, price: 899,  specialties: ['JEE Viva', 'IIT prep'], next: 'Today · 7:30 PM',  online: true, placed: '420+ at IITs' },
];

const PEER_POOL = [
  { name: 'Dev R.',    level: 'L4',   skill: 'DSA',          avatar: 'D', online: true,  xp: 2840 },
  { name: 'Ananya M.', level: 'L5',   skill: 'System Design', avatar: 'A', online: true,  xp: 3920 },
  { name: 'Vikram S.', level: 'L3',   skill: 'Behavioral',   avatar: 'V', online: true,  xp: 1460 },
  { name: 'Sara C.',   level: 'L4',   skill: 'Product',      avatar: 'S', online: true,  xp: 2580 },
  { name: 'Rohan K.',  level: 'L5',   skill: 'DSA',          avatar: 'R', online: false, xp: 4210 },
  { name: 'Mei L.',    level: 'L4',   skill: 'SQL/Data',     avatar: 'M', online: true,  xp: 2910 },
];

const UPCOMING = [
  { type: 'coach', with: 'Priya Sharma', topic: 'Mock system design · Stripe onsite', time: 'Today · 9:00 PM', role: 'Staff Eng', mins: 60 },
  { type: 'peer',  with: 'Dev R.',       topic: 'Two Sigma coding round — trade',      time: 'Tomorrow · 5:30 PM', role: 'SWE', mins: 45 },
];

const Interviews = ({ user }) => {
  const [view, setView] = useState('hub'); // hub | matching | live-coach | live-peer | ai-coach | feedback
  const [matchState, setMatchState] = useState(null);

  const startMatch = (mode) => {
    setMatchState({ mode, startedAt: Date.now() });
    setView('matching');
  };

  if (view === 'ai-coach') {
    return <AICoach back={() => setView('hub')}/>;
  }
  if (view === 'matching') {
    return <PeerMatching config={matchState} back={() => setView('hub')} onMatched={() => setView('live-peer')}/>;
  }
  if (view === 'live-peer') {
    return <LivePeerInterview back={() => setView('hub')} onEnd={() => setView('feedback')}/>;
  }
  if (view === 'feedback') {
    return <MutualFeedback back={() => setView('hub')}/>;
  }

  return (
    <div className="page">
      {/* Eyebrow */}
      <div className="fade-in-up" style={{ marginBottom: 40 }}>
        <div className="label-sm" style={{ marginBottom: 14 }}>Interviews</div>
        <h1 className="font-display" style={{ fontSize: 56, fontWeight: 500, lineHeight: 1.02, letterSpacing: '-0.02em', maxWidth: 780 }}>
          Get <span style={{ fontStyle: 'italic' }}>interview-ready</span>.<br/>
          Coaches on call. Peers on demand.
        </h1>
        <p style={{ fontSize: 17, color: 'var(--text-secondary)', marginTop: 14, maxWidth: 580, lineHeight: 1.55 }}>
          Practice with verified coaches — or queue up against a peer at your level. 2-minute match. Real feedback.
        </p>
      </div>

      {/* Stats strip */}
      <div className="stagger-in" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 48 }}>
        <StatCard label="Interviews done"  value="24"   sub="12 peer · 12 coach"/>
        <StatCard label="Avg. score"       value="78"   sub="+6 in last 30 days" highlight/>
        <StatCard label="Current streak"   value="6"    sub="wins in a row" accent="amber"/>
        <StatCard label="Global rank"      value="#412" sub="top 4% this month" accent="brand"/>
      </div>

      {/* AI Interview Coach — instant, always-on */}
      <div style={{ marginBottom: 16 }}>
        <AICoachLauncher onStart={() => setView('ai-coach')}/>
      </div>

      {/* Two pillars */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 48 }}>
        <CoachPillar/>
        <PeerPillar onMatch={startMatch} pool={PEER_POOL}/>
      </div>

      {/* Upcoming */}
      <div style={{ marginBottom: 48 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 18 }}>
          <h2 className="font-display" style={{ fontSize: 28, fontWeight: 500, letterSpacing: '-0.02em' }}>
            Your <span style={{ fontStyle: 'italic' }}>schedule</span>
          </h2>
          <button className="btn btn-ghost btn-sm">View all</button>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          {UPCOMING.map((u, i) => <UpcomingCard key={i} u={u}/>)}
        </div>
      </div>

      {/* Company prep */}
      <div>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 18 }}>
          <div>
            <h2 className="font-display" style={{ fontSize: 28, fontWeight: 500, letterSpacing: '-0.02em' }}>
              Prep by <span style={{ fontStyle: 'italic' }}>company</span>
            </h2>
            <p style={{ fontSize: 13, color: 'var(--text-tertiary)', marginTop: 4 }}>Real questions from recent interviews. Updated weekly.</p>
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
          {[
            { name: 'Google',  mono: 'G', qs: 142, tone: '#4285F4' },
            { name: 'Stripe',  mono: 'S', qs: 88,  tone: '#635BFF' },
            { name: 'Amazon',  mono: 'A', qs: 210, tone: '#FF9900' },
            { name: 'Meta',    mono: 'M', qs: 124, tone: '#0866FF' },
          ].map((c, i) => (
            <div key={c.name} className="card card-hover" style={{ padding: 22, animation: `fadeInUp 420ms ${i*60}ms var(--ease-out-expo) both` }}>
              <div style={{
                width: 40, height: 40, borderRadius: 10,
                background: c.tone + '14',
                color: c.tone,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: 'Fraunces', fontSize: 18, fontWeight: 700,
                marginBottom: 14,
              }}>{c.mono}</div>
              <div className="font-heading" style={{ fontSize: 16, fontWeight: 600 }}>{c.name}</div>
              <div style={{ fontSize: 12, color: 'var(--text-tertiary)', marginTop: 2 }}>{c.qs} verified questions</div>
              <div style={{ marginTop: 16, paddingTop: 14, borderTop: '1px solid var(--border-subtle)', fontSize: 12, color: 'var(--brand-500)', fontFamily: 'Inter', fontWeight: 600, display: 'flex', justifyContent: 'space-between' }}>
                Start prep <Icon name="chevronR" size={12}/>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// ─── Stats ────────────────────────────────
const StatCard = ({ label, value, sub, highlight, accent }) => {
  const color = accent === 'amber' ? 'var(--amber-500)' : accent === 'brand' ? 'var(--brand-500)' : 'var(--text-primary)';
  return (
    <div className="card lift" style={{ padding: 22, position: 'relative', overflow: 'hidden' }}>
      {highlight && (
        <div style={{ position: 'absolute', top: -40, right: -40, width: 120, height: 120, borderRadius: 999, background: 'radial-gradient(circle, rgba(16,185,129,0.10), transparent 70%)' }}/>
      )}
      <div className="label-sm">{label}</div>
      <div className="font-display" style={{ fontSize: 38, fontWeight: 500, marginTop: 10, letterSpacing: '-0.03em', color }}>{value}</div>
      <div style={{ fontSize: 12, color: highlight ? 'var(--mint-600)' : 'var(--text-tertiary)', marginTop: 6, fontFamily: 'Inter', fontWeight: highlight ? 600 : 400 }}>{sub}</div>
    </div>
  );
};

// ─── Pillar: Coaches ──────────────────────
const CoachPillar = () => {
  return (
    <div style={{
      background: 'var(--bg-surface)',
      border: '1px solid var(--border-subtle)',
      borderRadius: 24, padding: 28,
      position: 'relative', overflow: 'hidden',
      boxShadow: 'var(--shadow-xs)',
      transition: 'transform 360ms var(--ease-out-expo), box-shadow 360ms var(--ease-out-expo)',
    }}
      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = 'var(--shadow-md)'; }}
      onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'var(--shadow-xs)'; }}
    >
      <div style={{ position: 'absolute', top: -60, right: -60, width: 200, height: 200, borderRadius: 999, background: 'radial-gradient(circle, rgba(79,70,229,0.08), transparent 70%)', pointerEvents: 'none' }}/>

      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 22 }}>
        <span style={{ width: 6, height: 6, borderRadius: 999, background: 'var(--brand-500)' }}/>
        <span className="label-sm" style={{ color: 'var(--brand-600)' }}>Coach me · 1:1</span>
      </div>

      <h2 className="font-display" style={{ fontSize: 36, fontWeight: 500, lineHeight: 1.05, letterSpacing: '-0.02em' }}>
        Book a verified<br/><span style={{ fontStyle: 'italic' }}>interview coach.</span>
      </h2>
      <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginTop: 10, lineHeight: 1.55 }}>
        Engineers, admissions officers, and former hiring managers. They've sat on both sides of the table.
      </p>

      {/* Stacked coach preview */}
      <div style={{ marginTop: 22, marginBottom: 20 }}>
        {INTERVIEW_COACHES.slice(0, 3).map((c, i) => (
          <div key={c.id} style={{
            display: 'flex', alignItems: 'center', gap: 12,
            padding: '12px 0',
            borderTop: i === 0 ? 'none' : '1px solid var(--border-subtle)',
            cursor: 'pointer',
            transition: 'background 160ms, padding 160ms',
          }}
            onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg-hover)'; e.currentTarget.style.paddingLeft = '8px'; e.currentTarget.style.paddingRight = '8px'; e.currentTarget.style.marginLeft = '-8px'; e.currentTarget.style.marginRight = '-8px'; e.currentTarget.style.borderRadius = '10px'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.paddingLeft = '0'; e.currentTarget.style.paddingRight = '0'; e.currentTarget.style.marginLeft = '0'; e.currentTarget.style.marginRight = '0'; }}
          >
            <div style={{ position: 'relative' }}>
              <Avatar name={c.name} size={38} tint={i}/>
              {c.online && <span style={{ position: 'absolute', bottom: 0, right: 0, width: 10, height: 10, borderRadius: 999, background: 'var(--mint-500)', border: '2px solid var(--bg-surface)' }}/>}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span className="font-heading truncate" style={{ fontSize: 14, fontWeight: 600 }}>{c.name}</span>
                <span style={{ width: 14, height: 14, borderRadius: 999, background: 'var(--brand-500)', color: '#fff', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Icon name="check" size={8} stroke={3}/></span>
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-tertiary)', marginTop: 1 }} className="truncate">{c.title} · {c.placed}</div>
            </div>
            <div style={{ textAlign: 'right', flexShrink: 0 }}>
              <div style={{ fontSize: 11, color: 'var(--mint-600)', fontFamily: 'Inter', fontWeight: 600 }}>{c.next}</div>
              <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>₹{c.price}</div>
            </div>
          </div>
        ))}
      </div>

      <button className="btn btn-primary btn-md" style={{ width: '100%' }}>
        Browse all coaches <Icon name="chevronR" size={14}/>
      </button>
    </div>
  );
};

// ─── Pillar: Peers (the hero) ─────────────
const PeerPillar = ({ onMatch, pool }) => {
  const [difficulty, setDifficulty] = useState('mirror');
  const [type, setType] = useState('coding');
  const [duration, setDuration] = useState(30);

  const types = [
    { id: 'coding',    label: 'Coding',       icon: 'productivity' },
    { id: 'system',    label: 'System design', icon: 'sparkles' },
    { id: 'behavioral',label: 'Behavioral',   icon: 'chat' },
    { id: 'mixed',     label: 'Mixed',        icon: 'shuffle' },
  ];

  const onlineCount = pool.filter(p => p.online).length;

  return (
    <div style={{
      background: 'linear-gradient(145deg, #0E1228 0%, #1C2140 100%)',
      borderRadius: 24, padding: 28,
      color: '#fff',
      position: 'relative', overflow: 'hidden',
      transition: 'transform 360ms var(--ease-out-expo), box-shadow 360ms var(--ease-out-expo)',
    }}
      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 20px 60px rgba(79,70,229,0.30)'; }}
      onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
    >
      {/* Animated gradient aura */}
      <div style={{
        position: 'absolute', inset: -40,
        background: 'radial-gradient(ellipse 400px 300px at 80% 20%, rgba(99,102,241,0.35), transparent 60%), radial-gradient(ellipse 300px 260px at 10% 100%, rgba(16,185,129,0.22), transparent 60%)',
        pointerEvents: 'none',
        animation: 'pulseGlow 6s var(--ease-smooth) infinite',
      }}/>

      <div style={{ position: 'relative', zIndex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 22 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ width: 8, height: 8, borderRadius: 999, background: '#10B981', boxShadow: '0 0 0 4px rgba(16,185,129,0.24)', animation: 'pulseDot 2s infinite' }}/>
            <span style={{ fontFamily: 'Inter', fontWeight: 600, fontSize: 12, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.75)' }}>Live · {onlineCount} ready</span>
          </div>
          <span style={{ fontFamily: 'JetBrains Mono', fontSize: 10, color: 'rgba(255,255,255,0.55)' }}>~90s match</span>
        </div>

        <h2 className="font-display" style={{ fontSize: 36, fontWeight: 500, lineHeight: 1.05, letterSpacing: '-0.02em', color: '#fff' }}>
          Go head-to-head.<br/><span style={{ fontStyle: 'italic', background: 'linear-gradient(90deg, #A78BFA, #6EE7B7)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>Peer battles.</span>
        </h2>
        <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.70)', marginTop: 10, lineHeight: 1.55 }}>
          Matched with someone prepping for the same role. You interview them, they interview you. Rate each other. Climb the ladder.
        </p>

        {/* Live peer avatars ticker */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 20, marginBottom: 22, padding: '12px 14px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 14 }}>
          <div style={{ display: 'flex' }}>
            {pool.filter(p => p.online).slice(0, 5).map((p, i) => (
              <div key={p.name} style={{ marginLeft: i === 0 ? 0 : -8, border: '2px solid #1C2140', borderRadius: 999, position: 'relative' }}>
                <Avatar name={p.avatar} size={26} tint={i+2}/>
              </div>
            ))}
          </div>
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.70)', flex: 1 }}>
            <span style={{ color: '#fff', fontFamily: 'Inter', fontWeight: 600 }}>Dev, Ananya, Sara</span> +{onlineCount - 3} looking to pair now
          </div>
        </div>

        {/* Config */}
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.50)', marginBottom: 8, fontFamily: 'Inter', fontWeight: 600 }}>Type</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 6 }}>
            {types.map(t => {
              const active = type === t.id;
              return (
                <button key={t.id} onClick={() => setType(t.id)} style={{
                  padding: '10px 8px', borderRadius: 10,
                  background: active ? 'rgba(255,255,255,0.14)' : 'rgba(255,255,255,0.04)',
                  border: '1px solid ' + (active ? 'rgba(255,255,255,0.30)' : 'rgba(255,255,255,0.06)'),
                  color: active ? '#fff' : 'rgba(255,255,255,0.70)',
                  fontFamily: 'Inter', fontSize: 12, fontWeight: active ? 600 : 500,
                  transition: 'all 200ms var(--ease-smooth)',
                }}>{t.label}</button>
              );
            })}
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 20 }}>
          <div>
            <div style={{ fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.50)', marginBottom: 8, fontFamily: 'Inter', fontWeight: 600 }}>Level</div>
            <div style={{ display: 'flex', gap: 4, padding: 3, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 10 }}>
              {[['easier','−'], ['mirror','='], ['harder','+']].map(([id, symbol]) => {
                const active = difficulty === id;
                return (
                  <button key={id} onClick={() => setDifficulty(id)} style={{
                    flex: 1, padding: '8px 4px', borderRadius: 8,
                    background: active ? 'rgba(255,255,255,0.14)' : 'transparent',
                    color: active ? '#fff' : 'rgba(255,255,255,0.55)',
                    fontFamily: 'JetBrains Mono', fontSize: 13, fontWeight: 600,
                    transition: 'all 200ms',
                  }}>{symbol}</button>
                );
              })}
            </div>
          </div>
          <div>
            <div style={{ fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.50)', marginBottom: 8, fontFamily: 'Inter', fontWeight: 600 }}>Length</div>
            <div style={{ display: 'flex', gap: 4, padding: 3, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 10 }}>
              {[30, 45, 60].map(d => {
                const active = duration === d;
                return (
                  <button key={d} onClick={() => setDuration(d)} style={{
                    flex: 1, padding: '8px 4px', borderRadius: 8,
                    background: active ? 'rgba(255,255,255,0.14)' : 'transparent',
                    color: active ? '#fff' : 'rgba(255,255,255,0.55)',
                    fontFamily: 'Inter', fontSize: 12, fontWeight: 600,
                    transition: 'all 200ms',
                  }}>{d}m</button>
                );
              })}
            </div>
          </div>
        </div>

        <button onClick={() => onMatch({ type, difficulty, duration })}
          style={{
            width: '100%', height: 52, borderRadius: 999,
            background: 'linear-gradient(135deg, #A78BFA 0%, #6EE7B7 100%)',
            color: '#0E1228',
            fontFamily: 'Inter', fontWeight: 700, fontSize: 15,
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            boxShadow: '0 10px 30px rgba(167,139,250,0.35)',
            transition: 'transform 220ms var(--ease-spring), box-shadow 220ms',
          }}
          onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px) scale(1.02)'; }}
          onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0) scale(1)'; }}
        >
          Queue for match
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M13 4l8 8-8 8M21 12H3"/></svg>
        </button>
        <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.50)', textAlign: 'center', marginTop: 10, fontFamily: 'Instrument Sans' }}>
          Free · Earn XP · Anonymous option available
        </div>
      </div>
    </div>
  );
};

// ─── Upcoming card ────────────────────────
const UpcomingCard = ({ u }) => {
  const isPeer = u.type === 'peer';
  return (
    <div className="card card-hover" style={{ padding: 20, display: 'flex', alignItems: 'center', gap: 14 }}>
      <div style={{
        width: 48, height: 48, borderRadius: 12,
        background: isPeer ? 'rgba(16,185,129,0.10)' : 'rgba(79,70,229,0.10)',
        color: isPeer ? 'var(--mint-600)' : 'var(--brand-600)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0,
      }}><Icon name={isPeer ? 'users' : 'mentors'} size={20}/></div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
          <span className="chip chip-sm" style={{ background: isPeer ? 'rgba(16,185,129,0.08)' : 'rgba(79,70,229,0.06)', color: isPeer ? 'var(--mint-700)' : 'var(--brand-600)', borderColor: 'transparent', height: 20, fontSize: 10, letterSpacing: '0.06em', textTransform: 'uppercase' }}>{isPeer ? 'Peer' : 'Coach'}</span>
          <span style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>with {u.with}</span>
        </div>
        <div className="font-heading truncate" style={{ fontSize: 14, fontWeight: 600 }}>{u.topic}</div>
        <div style={{ fontSize: 12, color: 'var(--text-tertiary)', marginTop: 2 }}>{u.time} · {u.mins}m</div>
      </div>
      <button className="btn btn-ghost btn-sm">Join</button>
    </div>
  );
};

// ─── Peer matching — animated ─────────────
const PeerMatching = ({ config, back, onMatched }) => {
  const [elapsed, setElapsed] = useState(0);
  const [matched, setMatched] = useState(null);
  const [phase, setPhase] = useState('searching'); // searching | found | ready

  useEffect(() => {
    const t = setInterval(() => setElapsed(e => e + 1), 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setMatched(PEER_POOL.filter(p => p.online)[Math.floor(Math.random() * 4)]);
      setPhase('found');
    }, 4500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (phase === 'found') {
      const t = setTimeout(() => setPhase('ready'), 1800);
      return () => clearTimeout(t);
    }
  }, [phase]);

  const phrases = [
    'Scanning 3,241 students online…',
    'Finding someone at your level…',
    'Matching interview type…',
    'Checking timezone compatibility…',
    'Almost there…',
  ];
  const phrase = phrases[Math.min(elapsed, phrases.length - 1)];

  return (
    <div style={{
      position: 'fixed', inset: 0, left: 232, // offset for sidebar
      background: 'linear-gradient(180deg, #0E1228 0%, #1C2140 100%)',
      color: '#fff',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      zIndex: 50, padding: 40,
    }}>
      <button onClick={back} style={{ position: 'absolute', top: 28, left: 28, color: 'rgba(255,255,255,0.60)', fontFamily: 'Inter', fontSize: 13, fontWeight: 500, display: 'flex', alignItems: 'center', gap: 6 }}>
        <Icon name="x" size={16}/> Cancel
      </button>

      {phase !== 'found' && phase !== 'ready' && (
        <>
          {/* Rings */}
          <div style={{ position: 'relative', width: 260, height: 260, marginBottom: 40 }}>
            {[0, 1, 2].map(i => (
              <div key={i} style={{
                position: 'absolute', inset: 0, borderRadius: 999,
                border: '2px solid rgba(167,139,250,0.35)',
                animation: `matchPulse 2.4s ${i * 0.8}s infinite var(--ease-out-expo)`,
              }}/>
            ))}
            <div style={{
              position: 'absolute', inset: 54, borderRadius: 999,
              background: 'linear-gradient(135deg, #A78BFA, #6EE7B7)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: 'Fraunces', fontSize: 64, fontWeight: 300, color: '#0E1228',
              boxShadow: '0 0 80px rgba(167,139,250,0.45)',
            }}>
              {['◎','◉','◍','◐'][elapsed % 4]}
            </div>
          </div>

          <div className="label-sm" style={{ color: 'rgba(255,255,255,0.55)', marginBottom: 10 }}>Peer match · {config?.type} · {config?.duration}m</div>
          <h2 className="font-display" style={{ fontSize: 38, fontWeight: 500, letterSpacing: '-0.02em', textAlign: 'center', color: '#fff' }}>
            Finding your <span style={{ fontStyle: 'italic', color: '#A78BFA' }}>match</span>…
          </h2>
          <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.60)', marginTop: 14, textAlign: 'center', minHeight: 22, transition: 'opacity 300ms' }} key={phrase}>
            {phrase}
          </p>

          <div style={{ marginTop: 40, display: 'flex', alignItems: 'center', gap: 10, padding: '10px 16px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 999 }}>
            <span style={{ width: 6, height: 6, borderRadius: 999, background: '#10B981', animation: 'pulseDot 1.5s infinite' }}/>
            <span style={{ fontFamily: 'JetBrains Mono', fontSize: 12, color: 'rgba(255,255,255,0.70)' }}>{String(Math.floor(elapsed/60)).padStart(2,'0')}:{String(elapsed%60).padStart(2,'0')} elapsed</span>
          </div>
        </>
      )}

      {phase === 'found' && matched && (
        <div className="fade-in-up" style={{ textAlign: 'center' }}>
          <div style={{ position: 'relative', display: 'inline-block', marginBottom: 28 }}>
            <div style={{
              width: 140, height: 140, borderRadius: 999,
              background: 'linear-gradient(135deg, #A78BFA, #6EE7B7)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: 'Fraunces', fontSize: 60, fontWeight: 500, color: '#0E1228',
              boxShadow: '0 0 100px rgba(167,139,250,0.50)',
              animation: 'matchSpring 800ms var(--ease-spring)',
            }}>{matched.avatar}</div>
            <div style={{ position: 'absolute', top: -6, right: -6, width: 36, height: 36, borderRadius: 999, background: '#10B981', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 20px rgba(16,185,129,0.40)' }}>
              <Icon name="check" size={18} stroke={3}/>
            </div>
          </div>
          <div className="label-sm" style={{ color: '#6EE7B7', marginBottom: 8 }}>Matched</div>
          <h2 className="font-display" style={{ fontSize: 42, fontWeight: 500, letterSpacing: '-0.02em', color: '#fff' }}>
            Meet <span style={{ fontStyle: 'italic' }}>{matched.name}</span>
          </h2>
          <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.70)', marginTop: 8 }}>{matched.level} · {matched.skill} · {matched.xp.toLocaleString()} XP</p>
        </div>
      )}

      {phase === 'ready' && matched && (
        <div className="fade-in" style={{ textAlign: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 24, marginBottom: 40 }}>
            <Avatar name="You" size={88}/>
            <div style={{ fontFamily: 'Fraunces', fontStyle: 'italic', fontSize: 36, color: 'rgba(255,255,255,0.50)' }}>vs</div>
            <div style={{ width: 88, height: 88, borderRadius: 999, background: 'linear-gradient(135deg, #A78BFA, #6EE7B7)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Fraunces', fontSize: 40, fontWeight: 500, color: '#0E1228' }}>{matched.avatar}</div>
          </div>
          <h2 className="font-display" style={{ fontSize: 36, fontWeight: 500, letterSpacing: '-0.02em', color: '#fff', marginBottom: 10 }}>Ready?</h2>
          <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.65)', maxWidth: 420, lineHeight: 1.6, marginBottom: 28 }}>
            You'll each take a turn as interviewer and interviewee. Be kind, be honest, rate at the end.
          </p>
          <button onClick={onMatched} className="btn btn-lg" style={{
            background: 'linear-gradient(135deg, #A78BFA 0%, #6EE7B7 100%)',
            color: '#0E1228', fontWeight: 700, padding: '0 40px',
            boxShadow: '0 14px 40px rgba(167,139,250,0.45)',
          }}>Start interview →</button>
        </div>
      )}
    </div>
  );
};

// ─── Live peer interview ──────────────────
const LivePeerInterview = ({ back, onEnd }) => {
  const [elapsed, setElapsed] = useState(0);
  const [role, setRole] = useState('interviewer'); // interviewer | candidate
  useEffect(() => {
    const t = setInterval(() => setElapsed(e => e + 1), 1000);
    return () => clearInterval(t);
  }, []);

  const mm = Math.floor(elapsed/60), ss = elapsed%60;

  return (
    <div className="fade-in" style={{ padding: '28px 48px', maxWidth: 1400, margin: '0 auto' }}>
      <button onClick={back} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--text-tertiary)', marginBottom: 20, fontFamily: 'Inter', fontWeight: 500 }}>
        <Icon name="chevronL" size={14}/> Back
      </button>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
        <span className="chip chip-mint"><span style={{ width: 6, height: 6, borderRadius: 999, background: 'var(--mint-500)', animation: 'pulseDot 1.5s infinite' }}/> Live · {String(mm).padStart(2,'0')}:{String(ss).padStart(2,'0')}</span>
        <span style={{ fontSize: 13, color: 'var(--text-tertiary)' }}>Coding · 30 min · L4</span>
        <div style={{ flex: 1 }}/>
        <div style={{ display: 'flex', gap: 4, padding: 4, background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 999 }}>
          {[['interviewer','You ask'], ['candidate','You answer']].map(([id, label]) => (
            <button key={id} onClick={() => setRole(id)} style={{
              padding: '6px 14px', borderRadius: 999, fontSize: 12, fontFamily: 'Inter', fontWeight: 600,
              color: role === id ? '#fff' : 'var(--text-secondary)',
              background: role === id ? 'var(--text-primary)' : 'transparent',
              transition: 'all 220ms',
            }}>{label}</button>
          ))}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 16 }}>
        {/* Main interview area */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Question prompt */}
          <div className="card" style={{ padding: 24 }}>
            <div className="label-sm" style={{ marginBottom: 8 }}>Problem · Two Sum variant</div>
            <h2 className="font-display" style={{ fontSize: 24, fontWeight: 500, letterSpacing: '-0.02em', lineHeight: 1.35 }}>
              Given a sorted array and target <span style={{ fontFamily: 'JetBrains Mono', fontSize: 20, background: 'var(--bg-hover)', padding: '2px 8px', borderRadius: 6 }}>T</span>, return the indices of two numbers that sum to <span style={{ fontStyle: 'italic' }}>T</span>.
            </h2>
            <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
              <span className="chip chip-sm">Easy</span>
              <span className="chip chip-sm">Arrays</span>
              <span className="chip chip-sm">Two pointers</span>
              <span className="chip chip-sm">O(n) target</span>
            </div>
          </div>

          {/* Code editor placeholder */}
          <div style={{ background: '#0E1228', color: '#E2E8F0', borderRadius: 16, padding: 24, minHeight: 340, fontFamily: 'JetBrains Mono', fontSize: 13, lineHeight: 1.8, position: 'relative' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 14, fontSize: 11, color: 'rgba(255,255,255,0.40)' }}>
              <span style={{ width: 10, height: 10, borderRadius: 999, background: '#EF4444' }}/>
              <span style={{ width: 10, height: 10, borderRadius: 999, background: '#F59E0B' }}/>
              <span style={{ width: 10, height: 10, borderRadius: 999, background: '#10B981' }}/>
              <span style={{ marginLeft: 'auto' }}>solution.js · Dev is typing…</span>
            </div>
            <div><span style={{ color: '#94A3B8' }}>1</span>  <span style={{ color: '#C084FC' }}>function</span> <span style={{ color: '#60A5FA' }}>twoSum</span>(<span style={{ color: '#FBBF24' }}>nums</span>, <span style={{ color: '#FBBF24' }}>target</span>) {"{"}</div>
            <div><span style={{ color: '#94A3B8' }}>2</span>    <span style={{ color: '#C084FC' }}>let</span> left = <span style={{ color: '#6EE7B7' }}>0</span>, right = nums.length - <span style={{ color: '#6EE7B7' }}>1</span>;</div>
            <div><span style={{ color: '#94A3B8' }}>3</span>    <span style={{ color: '#C084FC' }}>while</span> (left &lt; right) {"{"}</div>
            <div><span style={{ color: '#94A3B8' }}>4</span>      <span style={{ color: '#C084FC' }}>const</span> sum = nums[left] + nums[right];</div>
            <div><span style={{ color: '#94A3B8' }}>5</span>      <span style={{ color: '#C084FC' }}>if</span> (sum === target) <span style={{ color: '#C084FC' }}>return</span> [left, right];<span style={{ animation: 'blink 1s infinite', marginLeft: 4 }}>▎</span></div>
            <div><span style={{ color: '#94A3B8' }}>6</span>      <span style={{ color: '#475569' }}>// ...</span></div>
            <div><span style={{ color: '#94A3B8' }}>7</span>    {"}"}</div>
            <div><span style={{ color: '#94A3B8' }}>8</span>  {"}"}</div>
          </div>

          {/* Controls */}
          <div className="card" style={{ padding: 14, display: 'flex', alignItems: 'center', gap: 10 }}>
            <button className="btn btn-ghost btn-md"><Icon name="mic" size={15}/> Muted</button>
            <button className="btn btn-ghost btn-md"><Icon name="video" size={15}/> Camera off</button>
            <button className="btn btn-ghost btn-md">Hint</button>
            <div style={{ flex: 1 }}/>
            <button className="btn btn-ghost btn-md">Pass to partner</button>
            <button onClick={onEnd || back} className="btn btn-md" style={{ background: '#EF4444', color: '#fff' }}>End</button>
          </div>
        </div>

        {/* Side: partner + notes */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{
              aspectRatio: '4/3', background: 'linear-gradient(135deg, #A78BFA, #6EE7B7)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: 'Fraunces', fontSize: 72, color: '#0E1228', position: 'relative',
            }}>
              D
              <div style={{ position: 'absolute', bottom: 10, left: 10, display: 'flex', alignItems: 'center', gap: 6, padding: '4px 10px', background: 'rgba(14,18,40,0.70)', borderRadius: 999, color: '#fff', fontSize: 11, fontFamily: 'Inter', fontWeight: 600 }}>
                <span style={{ width: 6, height: 6, borderRadius: 999, background: '#10B981' }}/>
                Dev R. · L4
              </div>
              <div style={{ position: 'absolute', top: 10, right: 10, display: 'flex', gap: 6 }}>
                <div style={{ width: 28, height: 28, borderRadius: 999, background: 'rgba(14,18,40,0.70)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon name="mic" size={12}/></div>
              </div>
            </div>
          </div>

          <div className="card" style={{ padding: 16 }}>
            <div className="label-sm" style={{ marginBottom: 10 }}>Your notes</div>
            <textarea placeholder="Jot observations while they code — used for your feedback at the end."
              style={{ width: '100%', height: 160, background: 'transparent', border: 'none', outline: 'none', resize: 'none', fontFamily: 'Instrument Sans', fontSize: 13, lineHeight: 1.55, color: 'var(--text-primary)' }}/>
          </div>

          <div className="card" style={{ padding: 16 }}>
            <div className="label-sm" style={{ marginBottom: 10 }}>Rubric</div>
            {['Problem understanding','Communication','Code quality','Edge cases','Time complexity'].map((r, i) => (
              <div key={r} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '6px 0', fontSize: 13 }}>
                <span style={{ flex: 1, color: 'var(--text-secondary)' }}>{r}</span>
                <div style={{ display: 'flex', gap: 3 }}>
                  {[1,2,3,4,5].map(s => (
                    <button key={s} style={{ width: 14, height: 14, borderRadius: 3, background: s <= 3 ? 'var(--text-primary)' : 'var(--bg-subtle)' }}/>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

window.Interviews = Interviews;

// ═══════════════════════════════════════
// AI INTERVIEW COACH — launcher card + 3-step flow
// ═══════════════════════════════════════

const AICoachLauncher = ({ onStart }) => (
  <div style={{
    background: 'linear-gradient(135deg, rgba(16,185,129,0.06) 0%, rgba(42,63,184,0.05) 100%)',
    border: '1px solid var(--border-subtle)',
    borderRadius: 22, padding: 22,
    display: 'flex', alignItems: 'center', gap: 22,
    position: 'relative', overflow: 'hidden',
  }}>
    <div className="nova-orb" style={{ width: 56, height: 56, flexShrink: 0 }}/>
    <div style={{ flex: 1, minWidth: 0 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
        <span className="label-sm" style={{ color: 'var(--mint-700)' }}>Nova · AI coach</span>
        <span className="chip chip-sm chip-mint" style={{ height: 20, fontSize: 10 }}>Always on</span>
      </div>
      <div className="font-display" style={{ fontSize: 22, fontWeight: 500, letterSpacing: '-0.02em' }}>
        Practice any time. <span style={{ fontStyle: 'italic' }}>Instant feedback.</span>
      </div>
      <div style={{ display: 'flex', gap: 6, marginTop: 10, flexWrap: 'wrap' }}>
        {['Technical', 'Behavioural', 'Case Study'].map(t => (
          <span key={t} className="chip chip-sm">{t}</span>
        ))}
      </div>
    </div>
    <button onClick={onStart} className="btn btn-brand btn-md" style={{ flexShrink: 0 }}>
      Start session <Icon name="chevronR" size={14}/>
    </button>
  </div>
);

const AI_DOMAINS = ['Software Engineering','Finance','Consulting','Medicine','Law','UPSC','Marketing','General HR'];
const AI_QUESTIONS = {
  'Software Engineering': "Explain how a hash map works internally. When would you choose one over a list, and what are the tradeoffs?",
  'Finance': "Walk me through a DCF. What assumptions matter most, and how would you stress-test them?",
  'Consulting': "Our client is a regional coffee chain seeing 12% drop in same-store sales. How do you diagnose the cause?",
  'Medicine': "A 45-year-old presents with sudden chest pain radiating to the left arm. Walk me through your differential and initial workup.",
  'Law': "Your client breached a contract in good faith due to a supplier failure. How do you frame their defense?",
  'UPSC': "How does India's federal structure differ from the US, and what are the practical implications for centre-state relations?",
  'Marketing': "Launch plan for a new D2C protein brand targeting Gen Z in tier-2 cities — first 90 days.",
  'General HR': "Tell me about a time you had to give difficult feedback to a peer. How did you approach it and what was the outcome?",
};

const AICoach = ({ back }) => {
  const [step, setStep] = useState(1); // 1 configure, 2 question, 3 feedback
  const [domain, setDomain] = useState('Software Engineering');
  const [qType, setQType] = useState('Technical');
  const [difficulty, setDifficulty] = useState('Medium');
  const [answer, setAnswer] = useState('');
  const [voice, setVoice] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [showModel, setShowModel] = useState(false);

  useEffect(() => {
    if (step !== 2) return;
    const t = setInterval(() => setElapsed(e => e + 1), 1000);
    return () => clearInterval(t);
  }, [step]);

  const reset = () => { setStep(1); setAnswer(''); setElapsed(0); setShowModel(false); };

  return (
    <div className="page fade-in">
      {/* Crumb */}
      <button onClick={back} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--text-tertiary)', marginBottom: 22, fontFamily: 'Inter', fontWeight: 500 }}>
        <Icon name="chevronL" size={14}/> Back to interviews
      </button>

      {/* Step indicator */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 32 }}>
        <div className="nova-orb" style={{ width: 32, height: 32 }}/>
        <div>
          <div className="label-sm" style={{ color: 'var(--mint-700)', marginBottom: 2 }}>Nova · AI coach</div>
          <div style={{ fontFamily: 'Inter', fontSize: 13, color: 'var(--text-tertiary)' }}>
            Step {step} of 3 · {step === 1 ? 'Configure' : step === 2 ? 'Answer' : 'Feedback'}
          </div>
        </div>
        <div style={{ flex: 1 }}/>
        <div style={{ display: 'flex', gap: 6 }}>
          {[1,2,3].map(s => (
            <div key={s} style={{
              width: s === step ? 28 : 8, height: 8, borderRadius: 999,
              background: s <= step ? 'var(--brand-500)' : 'var(--bg-subtle)',
              transition: 'all 360ms var(--ease-out-expo)',
            }}/>
          ))}
        </div>
      </div>

      {/* Step 1 — Configure */}
      {step === 1 && (
        <div className="fade-in-up" style={{ maxWidth: 760 }}>
          <h1 className="font-display" style={{ fontSize: 44, fontWeight: 500, letterSpacing: '-0.02em', lineHeight: 1.05 }}>
            What are we <span style={{ fontStyle: 'italic' }}>practicing</span>?
          </h1>
          <p style={{ fontSize: 15, color: 'var(--text-secondary)', marginTop: 10, marginBottom: 36 }}>
            Pick a domain, question type, and difficulty. Nova will tailor your prompt.
          </p>

          {/* Domain */}
          <div style={{ marginBottom: 28 }}>
            <div className="label-sm" style={{ marginBottom: 12 }}>Choose your domain</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {AI_DOMAINS.map(d => {
                const active = domain === d;
                return (
                  <button key={d} onClick={() => setDomain(d)}
                    className={'chip' + (active ? ' active' : '')}
                    style={{ height: 36, padding: '0 16px', fontSize: 13 }}>{d}</button>
                );
              })}
            </div>
          </div>

          {/* Type */}
          <div style={{ marginBottom: 28 }}>
            <div className="label-sm" style={{ marginBottom: 12 }}>Question type</div>
            <div className="toggle-row">
              {['Technical','Behavioural','Case Study'].map(t => (
                <button key={t} onClick={() => setQType(t)} className={qType === t ? 'active' : ''}>{t}</button>
              ))}
            </div>
          </div>

          {/* Difficulty */}
          <div style={{ marginBottom: 40 }}>
            <div className="label-sm" style={{ marginBottom: 12 }}>Difficulty</div>
            <div style={{ display: 'flex', gap: 8 }}>
              {['Easy','Medium','Hard'].map(d => {
                const active = difficulty === d;
                return (
                  <button key={d} onClick={() => setDifficulty(d)}
                    className={'chip' + (active ? ' active' : '')}
                    style={{ height: 36, padding: '0 18px', fontSize: 13 }}>{d}</button>
                );
              })}
            </div>
          </div>

          <button onClick={() => setStep(2)} className="btn btn-brand btn-lg">
            Get my question <Icon name="chevronR" size={14}/>
          </button>
        </div>
      )}

      {/* Step 2 — Question + Answer */}
      {step === 2 && (
        <div className="fade-in-up" style={{ maxWidth: 860 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
            <span className="chip chip-sm chip-brand">{domain}</span>
            <span className="chip chip-sm">{qType}</span>
            <span className="chip chip-sm chip-amber">{difficulty}</span>
            <div style={{ flex: 1 }}/>
            <span style={{ fontFamily: 'JetBrains Mono', fontSize: 13, color: 'var(--text-tertiary)' }}>
              {String(Math.floor(elapsed/60)).padStart(2,'0')}:{String(elapsed%60).padStart(2,'0')}
            </span>
          </div>

          {/* Question card */}
          <div style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-default)',
            borderRadius: 20, padding: 32,
            marginBottom: 20,
            position: 'relative', overflow: 'hidden',
          }}>
            <div style={{ position: 'absolute', top: -50, right: -50, width: 180, height: 180, borderRadius: 999, background: 'radial-gradient(circle, rgba(16,185,129,0.06), transparent 70%)' }}/>
            <div className="label-sm" style={{ marginBottom: 14, color: 'var(--mint-700)' }}>Your question</div>
            <h2 className="font-display" style={{ fontSize: 28, fontWeight: 500, lineHeight: 1.3, letterSpacing: '-0.02em' }}>
              {AI_QUESTIONS[domain]}
            </h2>
          </div>

          {/* Mode toggle */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
            <div className="toggle-row">
              <button onClick={() => setVoice(false)} className={!voice ? 'active' : ''}>Type</button>
              <button onClick={() => setVoice(true)}  className={voice ? 'active' : ''}>Voice</button>
            </div>
            <div style={{ flex: 1 }}/>
            <button onClick={() => setStep(2)} className="btn-text" style={{ fontSize: 13 }}>Skip this question</button>
          </div>

          {/* Answer area */}
          {!voice ? (
            <textarea
              value={answer} onChange={e => setAnswer(e.target.value)}
              placeholder="Type your answer here… take your time."
              className="textarea"
              style={{ minHeight: 220, fontSize: 15, lineHeight: 1.6 }}
            />
          ) : (
            <div className="card" style={{ padding: 40, textAlign: 'center' }}>
              <div style={{ width: 80, height: 80, borderRadius: 999, background: 'rgba(239,68,68,0.10)', color: '#EF4444', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 18px', position: 'relative' }}>
                <Icon name="mic" size={32}/>
                <span style={{ position: 'absolute', inset: -6, borderRadius: 999, border: '2px solid rgba(239,68,68,0.40)', animation: 'matchPulse 2s infinite' }}/>
              </div>
              <div style={{ fontFamily: 'Inter', fontWeight: 600, fontSize: 16 }}>Recording…</div>
              <div style={{ fontSize: 13, color: 'var(--text-tertiary)', marginTop: 4 }}>Speak naturally. Tap mic to stop.</div>
            </div>
          )}

          <div style={{ display: 'flex', gap: 10, marginTop: 22 }}>
            <button onClick={() => setStep(1)} className="btn btn-ghost btn-md">Back</button>
            <button onClick={() => setStep(3)} className="btn btn-brand btn-md" style={{ marginLeft: 'auto' }}>
              Submit answer <Icon name="chevronR" size={14}/>
            </button>
          </div>
        </div>
      )}

      {/* Step 3 — Feedback */}
      {step === 3 && (
        <div className="fade-in-up" style={{ maxWidth: 860 }}>
          <div className="label-sm" style={{ color: 'var(--mint-700)', marginBottom: 8 }}>Nova's feedback</div>
          <h1 className="font-display" style={{ fontSize: 40, fontWeight: 500, letterSpacing: '-0.02em', lineHeight: 1.05 }}>
            Solid foundation, room to <span style={{ fontStyle: 'italic' }}>sharpen</span>.
          </h1>

          <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: 20, marginTop: 32 }}>
            {/* Score ring */}
            <div className="card" style={{ padding: 24, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              <ScoreRing score={74}/>
              <div style={{ marginTop: 16, fontFamily: 'Inter', fontSize: 12, letterSpacing: '0.10em', textTransform: 'uppercase', color: 'var(--text-tertiary)', fontWeight: 600 }}>Overall score</div>
              <div style={{ fontSize: 13, color: 'var(--mint-700)', marginTop: 6, fontFamily: 'Inter', fontWeight: 600 }}>+8 from last attempt</div>
            </div>

            {/* Dimensions */}
            <div className="card" style={{ padding: 24 }}>
              <div className="label-sm" style={{ marginBottom: 16 }}>Breakdown</div>
              {[
                ['Content & Accuracy', 82],
                ['Structure & Clarity', 70],
                ['Confidence & Tone', 76],
                ['Depth of Insight', 64],
              ].map(([label, val]) => (
                <div key={label} style={{ marginBottom: 14 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                    <span style={{ fontFamily: 'Inter', fontSize: 13, fontWeight: 500, color: 'var(--text-secondary)' }}>{label}</span>
                    <span style={{ fontFamily: 'JetBrains Mono', fontSize: 13, color: 'var(--text-primary)', fontWeight: 500 }}>{val}</span>
                  </div>
                  <div style={{ height: 6, background: 'var(--bg-subtle)', borderRadius: 999, overflow: 'hidden' }}>
                    <div style={{
                      height: '100%', width: `${val}%`,
                      background: val >= 80 ? 'var(--mint-500)' : val >= 65 ? 'var(--brand-500)' : 'var(--amber-500)',
                      transition: 'width 800ms var(--ease-out-expo)',
                    }}/>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Feedback text */}
          <div className="card" style={{ padding: 24, marginTop: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
              <div className="nova-orb" style={{ width: 24, height: 24 }}/>
              <span className="label-sm" style={{ color: 'var(--mint-700)' }}>Nova says</span>
            </div>
            <p style={{ fontSize: 15, lineHeight: 1.65, color: 'var(--text-primary)' }}>
              You correctly identified the O(1) average lookup and tied it to hash collision handling — that's the heart of the answer. Your structure was clear: you defined the data structure, gave a use case, and compared with arrays. What's missing is depth on the tradeoffs: when buckets get crowded, lookups degrade, and load factor matters. A senior engineer would also touch on memory overhead and cache locality.
            </p>
          </div>

          {/* What could be better */}
          <div className="card" style={{ padding: 24, marginTop: 12 }}>
            <div className="label-sm" style={{ marginBottom: 14, color: 'var(--amber-600)' }}>What could be better</div>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[
                'Mention worst-case behaviour: O(n) when many keys hash to the same bucket.',
                'Compare memory footprint: hash maps trade space for time. Quantify roughly.',
                'Briefly note when an array is actually preferable — small N, ordered iteration.',
              ].map((t, i) => (
                <li key={i} style={{ display: 'flex', gap: 10, fontSize: 14, lineHeight: 1.55, color: 'var(--text-secondary)' }}>
                  <span style={{ color: 'var(--amber-500)', flexShrink: 0, marginTop: 2 }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="m6 9 6 6 6-6"/></svg>
                  </span>
                  <span>{t}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Model answer */}
          <div className="card" style={{ padding: 0, marginTop: 12, overflow: 'hidden' }}>
            <button onClick={() => setShowModel(s => !s)} style={{
              width: '100%', padding: '18px 24px',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              fontFamily: 'Inter', fontSize: 14, fontWeight: 600, color: 'var(--text-primary)',
            }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Icon name="sparkles" size={16}/> See a strong answer
              </span>
              <Icon name={showModel ? 'chevronD' : 'chevronR'} size={14}/>
            </button>
            {showModel && (
              <div className="fade-in" style={{ padding: '0 24px 24px', borderTop: '1px solid var(--border-subtle)' }}>
                <p style={{ fontSize: 14, lineHeight: 1.7, color: 'var(--text-secondary)', marginTop: 18 }}>
                  A hash map stores key-value pairs in buckets indexed by a hash of the key. Average insert, lookup, and delete are O(1); worst-case is O(n) when keys collide and a bucket degenerates into a list. Use a hash map when you need fast lookups by key with no need for ordering — e.g. counting word frequencies, deduping IDs, caching. Prefer an array (or list) when N is small (overhead dominates), when you need ordered iteration, or when keys are dense integers (use the index directly). Tradeoffs: hash maps consume extra memory for the bucket array and store hashes; arrays are denser and more cache-friendly.
                </p>
              </div>
            )}
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: 10, marginTop: 28 }}>
            <button onClick={reset} className="btn btn-brand btn-lg">
              Next question <Icon name="chevronR" size={14}/>
            </button>
            <button onClick={() => setStep(2)} className="btn btn-ghost btn-lg">Try again</button>
            <div style={{ flex: 1 }}/>
            <button onClick={back} className="btn-text" style={{ fontSize: 14 }}>Back to hub</button>
          </div>
        </div>
      )}
    </div>
  );
};

const ScoreRing = ({ score = 74, size = 168 }) => {
  const r = (size - 16) / 2;
  const c = 2 * Math.PI * r;
  const offset = c - (score / 100) * c;
  const color = score >= 80 ? 'var(--mint-500)' : score >= 65 ? 'var(--brand-500)' : 'var(--amber-500)';
  return (
    <div style={{ position: 'relative', width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size/2} cy={size/2} r={r} stroke="var(--bg-subtle)" strokeWidth={10} fill="none"/>
        <circle cx={size/2} cy={size/2} r={r} stroke={color} strokeWidth={10} fill="none"
          strokeDasharray={c} strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 1.2s var(--ease-out-expo)' }}/>
      </svg>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <div className="font-display" style={{ fontSize: 48, fontWeight: 500, letterSpacing: '-0.03em', lineHeight: 1 }}>{score}</div>
        <div style={{ fontFamily: 'JetBrains Mono', fontSize: 11, color: 'var(--text-tertiary)', marginTop: 4 }}>/ 100</div>
      </div>
    </div>
  );
};

window.AICoach = AICoach;
window.AICoachLauncher = AICoachLauncher;

// ═══════════════════════════════════════
// MUTUAL FEEDBACK — post-peer interview
// ═══════════════════════════════════════
const MutualFeedback = ({ back }) => {
  const [stars, setStars] = useState(4);
  const [vibe, setVibe] = useState(2); // 0–4 emoji index
  const [note, setNote] = useState('');
  const emojis = ['😞','😕','🙂','😀','🤩'];

  return (
    <div className="page fade-in" style={{ maxWidth: 760 }}>
      <button onClick={back} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--text-tertiary)', marginBottom: 22, fontFamily: 'Inter', fontWeight: 500 }}>
        <Icon name="chevronL" size={14}/> Back to interviews
      </button>

      <div className="label-sm" style={{ marginBottom: 10 }}>Session complete</div>
      <h1 className="font-display" style={{ fontSize: 44, fontWeight: 500, letterSpacing: '-0.02em', lineHeight: 1.05 }}>
        Nice run. How was <span style={{ fontStyle: 'italic' }}>Dev R.</span>?
      </h1>
      <p style={{ fontSize: 15, color: 'var(--text-secondary)', marginTop: 10, marginBottom: 36 }}>
        Honest ratings power good matches. They never see your written notes — only the stars.
      </p>

      {/* Star rating */}
      <div className="card" style={{ padding: 24, marginBottom: 14 }}>
        <div className="label-sm" style={{ marginBottom: 14 }}>Rate your peer</div>
        <div style={{ display: 'flex', gap: 6, marginBottom: 18 }}>
          {[1,2,3,4,5].map(n => (
            <button key={n} onClick={() => setStars(n)} style={{
              width: 44, height: 44, color: n <= stars ? 'var(--amber-500)' : 'var(--text-muted)',
              transition: 'transform 180ms var(--ease-spring), color 200ms',
            }}
              onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.15)'}
              onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
            ><Icon name="star" size={32} stroke={1.5}/></button>
          ))}
        </div>
        <textarea
          value={note} onChange={e => setNote(e.target.value)}
          placeholder="Optional note (private to Dev) — what they did well, what to work on…"
          className="textarea" style={{ minHeight: 90, fontSize: 14 }}/>
      </div>

      {/* Session vibe */}
      <div className="card" style={{ padding: 24, marginBottom: 14 }}>
        <div className="label-sm" style={{ marginBottom: 14 }}>Rate the session</div>
        <div style={{ display: 'flex', justifyContent: 'space-between', maxWidth: 380 }}>
          {emojis.map((e, i) => (
            <button key={i} onClick={() => setVibe(i)} style={{
              width: 56, height: 56, fontSize: 28, borderRadius: 14,
              background: vibe === i ? 'var(--brand-50)' : 'transparent',
              border: '1px solid ' + (vibe === i ? 'var(--brand-300)' : 'transparent'),
              transition: 'all 220ms var(--ease-spring)',
              transform: vibe === i ? 'scale(1.08)' : 'scale(1)',
            }}>{e}</button>
          ))}
        </div>
      </div>

      {/* Nova summary */}
      <div className="card" style={{ padding: 24, marginBottom: 28, background: 'linear-gradient(135deg, rgba(16,185,129,0.04), rgba(42,63,184,0.03))' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
          <div className="nova-orb" style={{ width: 24, height: 24 }}/>
          <span className="label-sm" style={{ color: 'var(--mint-700)' }}>Nova's read</span>
        </div>
        <p style={{ fontSize: 15, lineHeight: 1.65 }}>
          You asked 3 strong follow-up questions and stayed calm when Dev got stuck. Work on structuring your case opening — you jumped to assumptions before clarifying scope. Try the &ldquo;clarify, structure, hypothesise&rdquo; pattern next time.
        </p>
      </div>

      <div style={{ display: 'flex', gap: 10 }}>
        <button onClick={back} className="btn btn-brand btn-lg">
          Submit & continue <Icon name="chevronR" size={14}/>
        </button>
        <button onClick={back} className="btn btn-ghost btn-lg">Skip rating</button>
      </div>
    </div>
  );
};

window.MutualFeedback = MutualFeedback;

// ═══════════════════════════════════════
// UPGRADE MODAL — Pro paywall
// ═══════════════════════════════════════
const UpgradeModal = ({ feature = 'this feature', close }) => (
  <div onClick={close} style={{
    position: 'fixed', inset: 0, zIndex: 400,
    background: 'rgba(14,18,40,0.45)',
    backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    padding: 20,
  }}>
    <div onClick={e => e.stopPropagation()} className="modal-in" style={{
      width: '100%', maxWidth: 440,
      background: 'var(--bg-surface)',
      borderRadius: 24, overflow: 'hidden',
      boxShadow: 'var(--shadow-xl)',
      border: '1px solid var(--border-subtle)',
      position: 'relative',
    }}>
      <button onClick={close} style={{
        position: 'absolute', top: 16, right: 16, zIndex: 2,
        width: 32, height: 32, borderRadius: 999,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: 'var(--text-tertiary)',
        background: 'var(--bg-hover)',
      }}><Icon name="x" size={14}/></button>

      {/* Header with crown */}
      <div style={{
        padding: '36px 28px 24px',
        background: 'linear-gradient(180deg, rgba(245,158,11,0.08) 0%, transparent 100%)',
        textAlign: 'center', position: 'relative',
      }}>
        <div style={{
          width: 64, height: 64, borderRadius: 18,
          background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 18px',
          boxShadow: '0 12px 28px rgba(217,119,6,0.30)',
        }}>
          <svg width="32" height="32" viewBox="0 0 24 24" fill="white" stroke="white" strokeWidth="1.5" strokeLinejoin="round">
            <path d="M3 9l3 9h12l3-9-5 3-4-7-4 7-5-3z"/>
            <circle cx="12" cy="20" r="0.6"/>
          </svg>
        </div>
        <div className="label-sm" style={{ color: 'var(--brand-600)', marginBottom: 8 }}>Pro feature</div>
        <h2 className="font-display" style={{ fontSize: 24, fontWeight: 500, letterSpacing: '-0.02em', lineHeight: 1.2 }}>
          {feature} requires <span style={{ fontStyle: 'italic' }}>Pro</span>.
        </h2>
      </div>

      {/* Benefits */}
      <div style={{ padding: '8px 28px 24px' }}>
        {[
          ['users', 'Unlimited Study Together requests'],
          ['sparkles', 'Unlimited Nova AI questions'],
          ['calendar', 'Priority mentor booking'],
          ['interviews', 'Unlimited interview sessions'],
        ].map(([icon, text]) => (
          <div key={text} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0' }}>
            <div style={{
              width: 32, height: 32, borderRadius: 9,
              background: 'var(--brand-50)', color: 'var(--brand-600)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}><Icon name={icon} size={15}/></div>
            <span style={{ fontFamily: 'Inter', fontSize: 14, color: 'var(--text-primary)', fontWeight: 500 }}>{text}</span>
          </div>
        ))}
      </div>

      {/* Price */}
      <div style={{ padding: '0 28px 12px' }}>
        <div style={{
          background: 'var(--bg-subtle)',
          borderRadius: 14, padding: '14px 18px',
          display: 'flex', alignItems: 'baseline', gap: 6,
        }}>
          <span className="font-display" style={{ fontSize: 28, fontWeight: 500, letterSpacing: '-0.02em' }}>₹299</span>
          <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>/month · cancel anytime</span>
        </div>
        <div style={{ fontSize: 12, color: 'var(--text-tertiary)', marginTop: 8, paddingLeft: 4 }}>
          Or <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>₹2,499/year</span> — save ₹1,089
        </div>
      </div>

      {/* CTA */}
      <div style={{ padding: '16px 28px 28px' }}>
        <button className="btn btn-brand btn-lg" style={{ width: '100%' }}>
          Upgrade to Pro <Icon name="chevronR" size={14}/>
        </button>
        <button onClick={close} className="btn-text" style={{ width: '100%', textAlign: 'center', display: 'block', marginTop: 14, fontSize: 13, color: 'var(--text-tertiary)' }}>
          Maybe later
        </button>
      </div>
    </div>
  </div>
);

window.UpgradeModal = UpgradeModal;
