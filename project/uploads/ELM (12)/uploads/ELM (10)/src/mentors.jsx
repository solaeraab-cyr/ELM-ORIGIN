/* global React, Icon, Avatar, SubjectGlyph */
const { useState, useEffect, useRef } = React;

// ═══════════════════════════════════════
// MENTORS — entry screen, then AI or Human branch
// ═══════════════════════════════════════
const MentorsHub = ({ openMode }) => {
  return (
    <div className="page">
      <div className="fade-in-up" style={{ marginBottom: 48 }}>
        <div className="label-sm" style={{ marginBottom: 14 }}>Mentors</div>
        <h1 className="font-display" style={{ fontSize: 56, fontWeight: 500, lineHeight: 1.05, maxWidth: 720, letterSpacing: '-0.02em' }}>
          Learn with an <span style={{ fontStyle: 'italic' }}>AI tutor</span>, or book time with a real <span style={{ fontStyle: 'italic' }}>human expert</span>.
        </h1>
        <p style={{ fontSize: 17, color: 'var(--text-secondary)', marginTop: 16, maxWidth: 560, lineHeight: 1.55 }}>
          Two ways to get unstuck. Nova is always on. Humans give you their hours.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        <ChoiceCard
          variant="ai"
          eyebrow="Instant · Free with Pro"
          title="Nova AI"
          italic="Always on."
          desc="Ask anything. Get worked solutions, explanations at your level, and practice problems — in seconds."
          meta={['Available now', 'Replies in under 2s', 'Unlimited questions']}
          cta="Start a conversation"
          onClick={() => openMode('ai')}
        />
        <ChoiceCard
          variant="human"
          eyebrow="30-60 min · From ₹499"
          title="Human Mentors"
          italic="Real experts."
          desc="Book a live session with a verified expert — IIT professors, Google engineers, PhDs, clinicians."
          meta={['840+ mentors', 'Average 4.9★', 'Book in 2 minutes']}
          cta="Browse mentors"
          onClick={() => openMode('human')}
        />
      </div>

      <div style={{ marginTop: 56 }}>
        <h2 className="font-heading" style={{ fontSize: 20, fontWeight: 600, marginBottom: 20 }}>Recent activity</h2>
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          {[
            { type: 'ai', title: 'Asked Nova about chain rule in multivariable calculus', time: '2 hours ago' },
            { type: 'human', title: 'Session with Priya Sharma — Linear Algebra', time: 'Yesterday · 60 min' },
            { type: 'ai', title: 'Asked Nova to explain the Krebs cycle', time: '2 days ago' },
            { type: 'human', title: 'Session with Arjun Mehta — React patterns', time: '4 days ago · 30 min' },
          ].map((r, i, a) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', gap: 16, padding: '16px 22px',
              borderBottom: i < a.length - 1 ? '1px solid var(--border-subtle)' : 'none',
              transition: 'background 220ms var(--ease-smooth)', cursor: 'pointer',
            }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              <div style={{
                width: 36, height: 36, borderRadius: 10,
                background: r.type === 'ai' ? 'rgba(16,185,129,0.10)' : 'rgba(79,70,229,0.08)',
                color: r.type === 'ai' ? 'var(--mint-600)' : 'var(--brand-500)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}><Icon name={r.type === 'ai' ? 'sparkles' : 'mentors'} size={15}/></div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontFamily: 'Inter', fontWeight: 500, color: 'var(--text-primary)' }}>{r.title}</div>
                <div style={{ fontSize: 12, color: 'var(--text-tertiary)', marginTop: 2 }}>{r.time}</div>
              </div>
              <Icon name="chevronR" size={14}/>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const ChoiceCard = ({ variant, eyebrow, title, italic, desc, meta, cta, onClick }) => {
  const [hover, setHover] = useState(false);
  const isAI = variant === 'ai';
  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        background: 'var(--bg-surface)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 24,
        padding: 32,
        cursor: 'pointer',
        position: 'relative',
        overflow: 'hidden',
        transition: 'transform 360ms var(--ease-out-expo), box-shadow 360ms var(--ease-out-expo), border-color 360ms var(--ease-out-expo)',
        transform: hover ? 'translateY(-6px)' : 'translateY(0)',
        boxShadow: hover ? (isAI ? 'var(--shadow-ai)' : 'var(--shadow-brand)') : 'var(--shadow-xs)',
        borderColor: hover ? (isAI ? 'rgba(16,185,129,0.30)' : 'var(--border-brand)') : 'var(--border-subtle)',
      }}
    >
      {/* Ambient glow */}
      <div style={{
        position: 'absolute', top: -80, right: -80, width: 240, height: 240, borderRadius: 999,
        background: isAI ? 'radial-gradient(circle, rgba(16,185,129,0.16) 0%, transparent 70%)' : 'radial-gradient(circle, rgba(79,70,229,0.14) 0%, transparent 70%)',
        opacity: hover ? 1 : 0.55,
        transition: 'opacity 500ms var(--ease-smooth)',
        pointerEvents: 'none',
      }}/>

      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 28 }}>
        {isAI ? (
          <div className="nova-orb" style={{ width: 40, height: 40 }}/>
        ) : (
          <div style={{
            width: 40, height: 40, borderRadius: 12,
            background: 'var(--gradient-brand)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff',
          }}><Icon name="mentors" size={19}/></div>
        )}
        <span className="label-sm" style={{ color: isAI ? 'var(--mint-600)' : 'var(--brand-500)' }}>{eyebrow}</span>
      </div>

      <h2 className="font-display" style={{ fontSize: 44, fontWeight: 500, lineHeight: 1.05, letterSpacing: '-0.02em', color: 'var(--text-primary)' }}>
        {title}<br/>
        <span style={{ fontStyle: 'italic', color: 'var(--text-secondary)' }}>{italic}</span>
      </h2>

      <p style={{ fontSize: 15, color: 'var(--text-secondary)', marginTop: 18, lineHeight: 1.55, minHeight: 72 }}>{desc}</p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, margin: '24px 0' }}>
        {meta.map(m => (
          <div key={m} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, color: 'var(--text-secondary)' }}>
            <div style={{ width: 16, height: 16, borderRadius: 999, background: isAI ? 'var(--mint-100)' : 'var(--brand-100)', color: isAI ? 'var(--mint-700)' : 'var(--brand-600)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Icon name="check" size={9} stroke={3}/>
            </div>
            {m}
          </div>
        ))}
      </div>

      <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 14, fontFamily: 'Inter', fontWeight: 600, color: 'var(--text-primary)', paddingTop: 18, borderTop: '1px solid var(--border-subtle)', width: '100%', justifyContent: 'space-between' }}>
        <span>{cta}</span>
        <span style={{
          transform: hover ? 'translateX(4px)' : 'translateX(0)',
          transition: 'transform 280ms var(--ease-out-expo)',
          color: isAI ? 'var(--mint-600)' : 'var(--brand-500)',
        }}><Icon name="chevronR" size={16} stroke={2.2}/></span>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════
// AI MENTOR — Nova chat (minimal, light)
// ═══════════════════════════════════════
const NovaChat = ({ back }) => {
  const [msg, setMsg] = useState('');
  const [thread, setThread] = useState([]);
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [thread, loading]);

  const send = async (text) => {
    const content = text || msg;
    if (!content.trim() || loading) return;
    setMsg('');
    const newThread = [...thread, { role: 'user', content }];
    setThread(newThread);
    setLoading(true);
    try {
      const res = await window.claude.complete({
        messages: [
          { role: 'user', content: `You are Nova, a concise, friendly AI tutor inside the Elm Origin app. Explain clearly, use short paragraphs, prefer worked examples. Keep answers under 180 words unless the student asks for more detail. Question: ${content}` }
        ],
      });
      setThread(t => [...t, { role: 'ai', content: res }]);
    } catch {
      setThread(t => [...t, { role: 'ai', content: "I couldn't reach the network. Try again in a moment." }]);
    }
    setLoading(false);
  };

  const suggestions = [
    'Explain eigenvalues like I\'m a first-year student',
    'Help me write a thesis statement about renewable energy',
    'Quiz me on the Krebs cycle',
    'Give me 3 JEE-level calculus problems',
  ];

  return (
    <div className="fade-in" style={{ padding: '32px 56px 0', maxWidth: 880, margin: '0 auto', display: 'flex', flexDirection: 'column', height: 'calc(100vh - 68px)' }}>
      <button onClick={back} style={{ display: 'inline-flex', alignSelf: 'flex-start', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--text-tertiary)', marginBottom: 24, fontFamily: 'Inter', fontWeight: 500 }}
        onMouseEnter={e => e.currentTarget.style.color = 'var(--text-primary)'}
        onMouseLeave={e => e.currentTarget.style.color = 'var(--text-tertiary)'}
      >
        <Icon name="chevronL" size={14}/> Back to mentors
      </button>

      {thread.length === 0 ? (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', paddingBottom: 60 }}>
          <div className="nova-orb" style={{ width: 72, height: 72, marginBottom: 28 }}/>
          <h1 className="font-display" style={{ fontSize: 44, fontWeight: 500, letterSpacing: '-0.02em' }}>
            I'm <span style={{ fontStyle: 'italic', color: 'var(--mint-600)' }}>Nova</span>.
          </h1>
          <p style={{ fontSize: 16, color: 'var(--text-secondary)', marginTop: 10, textAlign: 'center', maxWidth: 440, lineHeight: 1.55 }}>
            Ask me anything — math, writing, code, a concept you're stuck on. I'll explain at your pace.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 36, width: '100%', maxWidth: 640 }}>
            {suggestions.map((s, i) => (
              <button key={s} onClick={() => send(s)}
                style={{
                  padding: '14px 18px',
                  background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)',
                  borderRadius: 14, textAlign: 'left', fontSize: 14, color: 'var(--text-primary)',
                  fontFamily: 'Instrument Sans', lineHeight: 1.4,
                  transition: 'all 280ms var(--ease-out-expo)',
                  animation: `fadeInUp 500ms ${i*80}ms var(--ease-out-expo) both`,
                }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.borderColor = 'var(--border-strong)'; e.currentTarget.style.boxShadow = 'var(--shadow-sm)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.borderColor = 'var(--border-subtle)'; e.currentTarget.style.boxShadow = 'none'; }}
              >{s}</button>
            ))}
          </div>
        </div>
      ) : (
        <div ref={scrollRef} style={{ flex: 1, overflowY: 'auto', paddingBottom: 20 }}>
          {thread.map((m, i) => (
            <div key={i} className="fade-in-up" style={{
              display: 'flex', gap: 14, padding: '18px 0',
              flexDirection: m.role === 'user' ? 'row-reverse' : 'row',
            }}>
              {m.role === 'ai' && <div className="nova-orb" style={{ width: 30, height: 30, flexShrink: 0 }}/>}
              {m.role === 'user' && <Avatar name="You" size={30}/>}
              <div style={{
                maxWidth: '78%',
                padding: '14px 18px',
                background: m.role === 'user' ? 'var(--text-primary)' : 'var(--bg-surface)',
                color: m.role === 'user' ? '#fff' : 'var(--text-primary)',
                border: m.role === 'ai' ? '1px solid var(--border-subtle)' : 'none',
                borderRadius: m.role === 'user' ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                fontSize: 15, lineHeight: 1.6,
                whiteSpace: 'pre-wrap',
              }}>{m.content}</div>
            </div>
          ))}
          {loading && (
            <div style={{ display: 'flex', gap: 14, padding: '18px 0' }}>
              <div className="nova-orb" style={{ width: 30, height: 30 }}/>
              <div style={{ padding: '18px 22px', background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: '18px 18px 18px 4px', display: 'flex', gap: 6, alignItems: 'center' }}>
                <span className="nova-dot"/><span className="nova-dot"/><span className="nova-dot"/>
              </div>
            </div>
          )}
        </div>
      )}

      <div style={{ paddingBottom: 28, paddingTop: 12 }}>
        <div style={{
          display: 'flex', gap: 8, alignItems: 'center',
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 999,
          padding: 6,
          boxShadow: 'var(--shadow-sm)',
          transition: 'all 220ms',
        }}
          onFocusCapture={e => e.currentTarget.style.borderColor = 'var(--brand-500)'}
          onBlurCapture={e => e.currentTarget.style.borderColor = 'var(--border-subtle)'}
        >
          <input value={msg} onChange={e => setMsg(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') send(); }}
            placeholder="Ask Nova anything…"
            style={{ flex: 1, height: 44, padding: '0 18px', fontSize: 15, background: 'transparent', border: 'none', outline: 'none', color: 'var(--text-primary)' }}/>
          <button onClick={() => send()} disabled={!msg.trim() || loading}
            style={{
              width: 44, height: 44, borderRadius: 999,
              background: msg.trim() ? 'var(--text-primary)' : 'var(--bg-hover)',
              color: msg.trim() ? '#fff' : 'var(--text-muted)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'all 220ms',
            }}><Icon name="send" size={15}/></button>
        </div>
        <div style={{ fontSize: 11, color: 'var(--text-muted)', textAlign: 'center', marginTop: 10, fontFamily: 'Instrument Sans' }}>
          Nova can make mistakes. Double-check important answers.
        </div>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════
// HUMAN MENTORS directory
// ═══════════════════════════════════════
const MENTORS = [
  { id: 1, name: 'Priya Sharma',   title: 'Data Scientist · Google', rating: 4.9, reviews: 312, students: 1840, price: 599, subject: 'Mathematics · Data Science', online: true, tags: ['Mathematics','Data Science','Python'] },
  { id: 2, name: 'Arjun Mehta',    title: 'Senior Engineer · Stripe', rating: 4.8, reviews: 184, students: 920,  price: 799, subject: 'Computer Science', online: true, tags: ['Computer Science','React','System Design'] },
  { id: 3, name: 'Dr. Elena Rossi',title: 'PhD · Cognitive Science · Oxford', rating: 5.0, reviews: 98, students: 340, price: 999, subject: 'Writing · Research', online: false, tags: ['Writing','Research','Psychology'] },
  { id: 4, name: 'Karan Iyer',     title: 'IIT-JEE Coach · 8 yrs',    rating: 4.9, reviews: 521, students: 2400, price: 499, subject: 'Physics · Mathematics', online: true, tags: ['Mathematics','Physics','JEE'] },
  { id: 5, name: 'Sara Chen',      title: 'Product Designer · Linear',rating: 4.9, reviews: 142, students: 580,  price: 899, subject: 'Design', online: false, tags: ['Design','UX','Portfolio Review'] },
  { id: 6, name: 'Dr. Rahul Nair', title: 'Cardiologist · AIIMS',     rating: 4.9, reviews: 76,  students: 210,  price: 1299,subject: 'Medicine', online: false, tags: ['Medicine','NEET PG'] },
];

const HumanMentors = ({ back, openMentor }) => {
  const [q, setQ] = useState('');
  const [filter, setFilter] = useState('All');
  const filters = ['All','Mathematics','Computer Science','Physics','Writing','Design','Medicine'];
  const list = MENTORS.filter(m => {
    if (filter !== 'All' && !m.tags.includes(filter)) return false;
    if (q && !(m.name + m.title + m.tags.join(' ')).toLowerCase().includes(q.toLowerCase())) return false;
    return true;
  });
  return (
    <div className="page">
      <button onClick={back} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--text-tertiary)', marginBottom: 20, fontFamily: 'Inter', fontWeight: 500 }}
        onMouseEnter={e => e.currentTarget.style.color = 'var(--text-primary)'}
        onMouseLeave={e => e.currentTarget.style.color = 'var(--text-tertiary)'}
      >
        <Icon name="chevronL" size={14}/> Back to mentors
      </button>

      <div className="fade-in-up" style={{ marginBottom: 28 }}>
        <h1 className="font-display" style={{ fontSize: 48, fontWeight: 500, letterSpacing: '-0.02em', lineHeight: 1.05 }}>
          Find your <span style={{ fontStyle: 'italic' }}>human mentor</span>
        </h1>
        <p style={{ fontSize: 16, color: 'var(--text-secondary)', marginTop: 10 }}>840+ verified experts. Book in two minutes.</p>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: 6, background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 999, marginBottom: 20, boxShadow: 'var(--shadow-xs)' }}>
        <span style={{ paddingLeft: 12, color: 'var(--text-muted)' }}><Icon name="search" size={16}/></span>
        <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search by name, subject, or skill…"
          style={{ flex: 1, height: 40, background: 'transparent', border: 'none', outline: 'none', color: 'var(--text-primary)', fontSize: 14 }}/>
        <button className="btn btn-ghost btn-sm">Filters</button>
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 28, flexWrap: 'wrap' }}>
        {filters.map(f => <button key={f} className={`chip ${filter===f ? 'active' : ''}`} onClick={() => setFilter(f)}>{f}</button>)}
      </div>

      <div className="stagger-in" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 14 }}>
        {list.map((m, i) => (
          <div key={m.id} className="card card-hover" onClick={() => openMentor(m)} style={{ padding: 22 }}>
            <div style={{ display: 'flex', gap: 14, alignItems: 'center', marginBottom: 14 }}>
              <div style={{ position: 'relative' }}>
                <Avatar name={m.name} size={48}/>
                {m.online && <div style={{ position: 'absolute', bottom: -1, right: -1, width: 12, height: 12, borderRadius: 999, background: 'var(--mint-500)', border: '2.5px solid var(--bg-surface)' }}/>}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div className="font-heading" style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)' }}>{m.name}</div>
                <div style={{ fontSize: 12, color: 'var(--text-tertiary)', marginTop: 2 }} className="truncate">{m.title}</div>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 13, color: 'var(--text-secondary)', marginBottom: 12 }}>
              <span><span style={{ color: 'var(--amber-500)' }}>★</span> <span style={{ fontFamily: 'Inter', fontWeight: 600, color: 'var(--text-primary)' }}>{m.rating}</span> <span style={{ color: 'var(--text-tertiary)' }}>({m.reviews})</span></span>
              <span style={{ color: 'var(--text-tertiary)' }}>·</span>
              <span>{m.students} students</span>
            </div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 16 }}>
              {m.tags.slice(0,3).map(t => <span key={t} className="chip chip-sm">{t}</span>)}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 12, borderTop: '1px solid var(--border-subtle)' }}>
              <div>
                <span style={{ fontFamily: 'Inter', fontWeight: 700, fontSize: 15, color: 'var(--text-primary)' }}>₹{m.price}</span>
                <span style={{ fontSize: 11, color: 'var(--text-tertiary)', marginLeft: 4 }}>/ 30 min</span>
              </div>
              <span style={{ fontSize: 12, color: 'var(--brand-500)', fontFamily: 'Inter', fontWeight: 600 }}>
                Book →
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Booking modal (simpler, light)
const BookingFlow = ({ mentor, close }) => {
  const [step, setStep] = useState(1);
  const [date, setDate] = useState(null);
  const [time, setTime] = useState(null);
  const [duration, setDuration] = useState(60);
  const [agenda, setAgenda] = useState('');

  const dates = [];
  const today = new Date(2026, 3, 23);
  for (let i = 0; i < 10; i++) {
    const d = new Date(today); d.setDate(d.getDate() + i);
    dates.push(d);
  }
  const times = ['10:00','11:30','1:00','2:30','4:00','5:30','7:00','8:30'];
  const price = duration === 30 ? mentor.price : Math.round(mentor.price * 1.7);

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(14,18,40,0.28)', backdropFilter: 'blur(6px)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }} onClick={close}>
      <div className="modal-in" style={{ width: 540, maxHeight: '90vh', overflowY: 'auto', background: 'var(--bg-surface)', borderRadius: 24, padding: 32, boxShadow: 'var(--shadow-xl)' }} onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <div style={{ display: 'flex', gap: 4 }}>
            {[1,2,3,4].map(s => (
              <div key={s} style={{ height: 3, width: 36, borderRadius: 2, background: s <= step ? 'var(--text-primary)' : 'var(--bg-subtle)', transition: 'background 300ms' }}/>
            ))}
          </div>
          <button onClick={close} style={{ color: 'var(--text-tertiary)' }}><Icon name="x" size={18}/></button>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 12, background: 'var(--bg-hover)', borderRadius: 12, marginBottom: 24 }}>
          <Avatar name={mentor.name} size={36}/>
          <div>
            <div style={{ fontFamily: 'Inter', fontWeight: 600, fontSize: 13 }}>{mentor.name}</div>
            <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>★ {mentor.rating} · {mentor.title}</div>
          </div>
        </div>

        {step === 1 && (
          <>
            <h2 className="font-display" style={{ fontSize: 28, fontWeight: 500, marginBottom: 20 }}>When works for you?</h2>
            <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 12, marginBottom: 20 }}>
              {dates.map((d, i) => {
                const active = date && d.getDate() === date.getDate();
                return (
                  <button key={i} onClick={() => setDate(d)} style={{
                    minWidth: 64, padding: '12px 8px',
                    borderRadius: 12,
                    background: active ? 'var(--text-primary)' : 'var(--bg-surface)',
                    border: '1px solid ' + (active ? 'var(--text-primary)' : 'var(--border-subtle)'),
                    color: active ? '#fff' : 'var(--text-primary)',
                    textAlign: 'center',
                    transition: 'all 220ms var(--ease-smooth)',
                  }}>
                    <div style={{ fontSize: 10, letterSpacing: '0.06em', textTransform: 'uppercase', opacity: 0.7 }}>{d.toLocaleDateString('en', { weekday: 'short' })}</div>
                    <div style={{ fontSize: 20, fontWeight: 600, fontFamily: 'Fraunces', marginTop: 3 }}>{d.getDate()}</div>
                  </button>
                );
              })}
            </div>
            {date && (
              <div className="fade-in-up">
                <div className="label-sm" style={{ marginBottom: 12 }}>Available times</div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
                  {times.map((t, i) => (
                    <button key={t} onClick={() => setTime(t)} className="chip" style={{
                      height: 42, justifyContent: 'center', fontSize: 13,
                      background: time === t ? 'var(--text-primary)' : 'var(--bg-surface)',
                      color: time === t ? '#fff' : '',
                      borderColor: time === t ? 'var(--text-primary)' : '',
                      animation: `fadeInUp 280ms ${i*40}ms var(--ease-out-expo) both`,
                    }}>{t} PM</button>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {step === 2 && (
          <>
            <h2 className="font-display" style={{ fontSize: 28, fontWeight: 500, marginBottom: 20 }}>How long?</h2>
            <div className="toggle-row" style={{ width: '100%', marginBottom: 24 }}>
              <button className={duration===30 ? 'active' : ''} onClick={() => setDuration(30)} style={{ flex: 1 }}>30 min · ₹{mentor.price}</button>
              <button className={duration===60 ? 'active' : ''} onClick={() => setDuration(60)} style={{ flex: 1 }}>60 min · ₹{Math.round(mentor.price * 1.7)}</button>
            </div>
            <div className="label-sm" style={{ marginBottom: 10 }}>What would you like to cover?</div>
            <textarea className="textarea" value={agenda} onChange={e => setAgenda(e.target.value)}
              placeholder="e.g. I'm stuck on eigenvalues and how they're used for diagonalization…"
              style={{ height: 140, fontSize: 14 }} maxLength={300}/>
          </>
        )}

        {step === 3 && (
          <>
            <h2 className="font-display" style={{ fontSize: 28, fontWeight: 500, marginBottom: 20 }}>Review & pay</h2>
            <div style={{ background: 'var(--bg-hover)', borderRadius: 14, padding: 18, marginBottom: 20, fontSize: 14 }}>
              <Row l="Mentor" r={mentor.name}/>
              <Row l="When"   r={`${date?.toLocaleDateString('en', { month: 'short', day: 'numeric' })} · ${time} PM`}/>
              <Row l="Length" r={`${duration} min`}/>
              <div style={{ height: 1, background: 'var(--border-subtle)', margin: '10px 0' }}/>
              <Row l="Subtotal" r={`₹${price}`}/>
              <Row l="Pro discount" r={<span style={{ color: 'var(--mint-600)' }}>−₹100</span>}/>
              <div style={{ height: 1, background: 'var(--border-subtle)', margin: '10px 0' }}/>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span className="font-heading" style={{ fontWeight: 600, fontSize: 15 }}>Total</span>
                <span className="font-display" style={{ fontSize: 22, fontWeight: 600 }}>₹{price - 100}</span>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 6, marginBottom: 12 }}>
              {['Card','UPI','Pay later'].map((p, i) => (
                <button key={p} className="chip" style={{ flex: 1, justifyContent: 'center', background: i === 0 ? 'var(--text-primary)' : '', color: i === 0 ? '#fff' : '', borderColor: i === 0 ? 'var(--text-primary)' : '' }}>{p}</button>
              ))}
            </div>
            <input className="input" placeholder="Card number" style={{ marginBottom: 8 }}/>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              <input className="input" placeholder="MM / YY"/>
              <input className="input" placeholder="CVV"/>
            </div>
          </>
        )}

        {step === 4 && (
          <div style={{ textAlign: 'center', padding: '24px 0' }}>
            <div style={{
              width: 68, height: 68, borderRadius: 999, margin: '0 auto 20px',
              background: 'var(--mint-500)', color: '#fff',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 0 0 8px rgba(16,185,129,0.12)',
              animation: 'modalIn 500ms var(--ease-spring)',
            }}><Icon name="check" size={30} stroke={3}/></div>
            <h2 className="font-display italic" style={{ fontSize: 32, fontWeight: 500 }}>You're booked.</h2>
            <p style={{ fontSize: 15, color: 'var(--text-secondary)', marginTop: 10 }}>
              Session with {mentor.name} on {date?.toLocaleDateString('en', { weekday: 'long', month: 'long', day: 'numeric' })} at {time} PM.
            </p>
            <div style={{ display: 'flex', gap: 10, marginTop: 28, justifyContent: 'center' }}>
              <button className="btn btn-ghost btn-md">Add to calendar</button>
              <button className="btn btn-primary btn-md" onClick={close}>Done</button>
            </div>
          </div>
        )}

        {step < 4 && (
          <div style={{ display: 'flex', gap: 10, marginTop: 28 }}>
            {step > 1 && <button className="btn btn-ghost btn-md" onClick={() => setStep(s => s - 1)}>Back</button>}
            <div style={{ flex: 1 }}/>
            <button className="btn btn-primary btn-md"
              disabled={(step === 1 && (!date || !time))}
              onClick={() => setStep(s => s + 1)}>
              {step === 3 ? `Pay ₹${price - 100}` : 'Continue'} <Icon name="chevronR" size={13}/>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

const Row = ({ l, r }) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0' }}>
    <span style={{ color: 'var(--text-tertiary)' }}>{l}</span>
    <span style={{ fontFamily: 'Inter', fontWeight: 500, color: 'var(--text-primary)' }}>{r}</span>
  </div>
);

window.MentorsHub = MentorsHub;
window.NovaChat = NovaChat;
window.HumanMentors = HumanMentors;
window.BookingFlow = BookingFlow;
