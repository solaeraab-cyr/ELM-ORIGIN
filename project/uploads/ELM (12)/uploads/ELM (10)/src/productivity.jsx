/* global React, Icon, SubjectGlyph */
const { useState, useEffect } = React;

// ═══════════════════════════════════════
// PRODUCTIVITY — Pomodoro + Notes + Planner + Analytics (light, minimal)
// ═══════════════════════════════════════
const Productivity = () => {
  const [tab, setTab] = useState('timer');
  const tabs = [
    { id: 'timer', label: 'Focus' },
    { id: 'notes', label: 'Notes' },
    { id: 'planner', label: 'Planner' },
    { id: 'analytics', label: 'Analytics' },
  ];
  return (
    <div className="page">
      <div className="fade-in-up" style={{ marginBottom: 28 }}>
        <div className="label-sm" style={{ marginBottom: 12 }}>Productivity</div>
        <h1 className="font-display" style={{ fontSize: 44, fontWeight: 500, letterSpacing: '-0.02em', lineHeight: 1.05 }}>
          Your <span style={{ fontStyle: 'italic' }}>study tools</span>.
        </h1>
      </div>

      <div style={{ display: 'flex', gap: 4, marginBottom: 32, borderBottom: '1px solid var(--border-subtle)' }}>
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{
            padding: '12px 16px',
            fontFamily: 'Inter', fontWeight: 600, fontSize: 14,
            color: tab === t.id ? 'var(--text-primary)' : 'var(--text-tertiary)',
            borderBottom: '2px solid ' + (tab === t.id ? 'var(--text-primary)' : 'transparent'),
            marginBottom: -1,
            transition: 'all 200ms var(--ease-smooth)',
          }}
            onMouseEnter={e => { if (tab !== t.id) e.currentTarget.style.color = 'var(--text-secondary)'; }}
            onMouseLeave={e => { if (tab !== t.id) e.currentTarget.style.color = 'var(--text-tertiary)'; }}
          >{t.label}</button>
        ))}
      </div>

      <div className="fade-in" key={tab}>
        {tab === 'timer' && <FocusTimer/>}
        {tab === 'notes' && <NotesTab/>}
        {tab === 'planner' && <PlannerTab/>}
        {tab === 'analytics' && <AnalyticsTab/>}
      </div>
    </div>
  );
};

// ─── FOCUS TIMER ─────────────────────────
const FocusTimer = () => {
  const [phase, setPhase] = useState('FOCUS');
  const durations = { FOCUS: 25*60, SHORT: 5*60, LONG: 15*60 };
  const [timeLeft, setTimeLeft] = useState(durations.FOCUS);
  const [running, setRunning] = useState(false);
  const total = durations[phase];

  useEffect(() => {
    if (!running) return;
    const t = setInterval(() => setTimeLeft(s => Math.max(0, s-1)), 1000);
    return () => clearInterval(t);
  }, [running]);

  useEffect(() => { setTimeLeft(durations[phase]); setRunning(false); }, [phase]);

  const progress = 1 - timeLeft / total;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '20px 0' }}>
      <div style={{ display: 'flex', gap: 4, padding: 4, background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 999, marginBottom: 44 }}>
        {[['FOCUS','Focus · 25'], ['SHORT','Short · 5'], ['LONG','Long · 15']].map(([id, label]) => (
          <button key={id} onClick={() => setPhase(id)} style={{
            padding: '8px 18px', borderRadius: 999, fontSize: 13, fontFamily: 'Inter', fontWeight: 600,
            color: phase === id ? '#fff' : 'var(--text-secondary)',
            background: phase === id ? 'var(--text-primary)' : 'transparent',
            transition: 'all 220ms var(--ease-smooth)',
          }}>{label}</button>
        ))}
      </div>

      <TimerRing size={340} progress={progress} timeLeft={timeLeft}/>

      <div style={{ marginTop: 40, display: 'flex', gap: 14 }}>
        <button onClick={() => { setTimeLeft(total); setRunning(false); }}
          style={{ width: 48, height: 48, borderRadius: 999, background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', color: 'var(--text-secondary)', transition: 'all 220ms' }}
          onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.05)'; e.currentTarget.style.background = 'var(--bg-hover)'; }}
          onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.background = 'var(--bg-surface)'; }}
        ><Icon name="refresh" size={16}/></button>
        <button onClick={() => setRunning(r => !r)}
          style={{
            width: 68, height: 68, borderRadius: 999, background: 'var(--text-primary)', color: '#fff',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: 'var(--shadow-lg)', transition: 'all 220ms var(--ease-spring)',
          }}
          onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.05)'; }}
          onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; }}
        ><Icon name={running ? 'pause' : 'play'} size={22}/></button>
        <button
          style={{ width: 48, height: 48, borderRadius: 999, background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', color: 'var(--text-secondary)', transition: 'all 220ms' }}
          onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.05)'; e.currentTarget.style.background = 'var(--bg-hover)'; }}
          onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.background = 'var(--bg-surface)'; }}
        ><Icon name="chevronR" size={16}/></button>
      </div>

      <div style={{ marginTop: 48, display: 'flex', gap: 10, alignItems: 'center' }}>
        {[1,2,3,4].map(i => (
          <div key={i} style={{
            width: 10, height: 10, borderRadius: 999,
            background: i <= 2 ? 'var(--text-primary)' : 'var(--bg-subtle)',
            transition: 'background 280ms',
          }}/>
        ))}
        <span style={{ fontSize: 13, color: 'var(--text-tertiary)', marginLeft: 8 }}>2 / 4 pomodoros today</span>
      </div>
    </div>
  );
};

const TimerRing = ({ size = 340, progress = 0, timeLeft = 1500 }) => {
  const r = size/2 - 8;
  const c = 2*Math.PI*r;
  const mm = Math.floor(timeLeft / 60);
  const ss = timeLeft % 60;
  return (
    <div style={{ position: 'relative', width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size/2} cy={size/2} r={r} stroke="var(--bg-hover)" strokeWidth="3" fill="none"/>
        <circle cx={size/2} cy={size/2} r={r} stroke="var(--text-primary)" strokeWidth="3" fill="none"
          strokeDasharray={c} strokeDashoffset={c * (1 - progress)} strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 1s linear' }}/>
      </svg>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ fontFamily: 'Fraunces', fontSize: 96, fontWeight: 300, letterSpacing: '-0.04em', lineHeight: 1 }}>
          {`${String(mm).padStart(2,'0')}:${String(ss).padStart(2,'0')}`}
        </div>
        <div className="label-sm" style={{ marginTop: 8 }}>Focus</div>
      </div>
    </div>
  );
};

// ─── NOTES ────────────────────────────────
const NotesTab = () => {
  const [notes, setNotes] = useState([
    { id: 1, title: 'Chain rule · multivariable', date: 'Today', tag: 'Mathematics', preview: '∂f/∂x = ∂f/∂u · ∂u/∂x + ∂f/∂v · ∂v/∂x. Draw the tree diagram first.' },
    { id: 2, title: 'useReducer vs useState', date: 'Today', tag: 'Computer Science', preview: 'Prefer useReducer when: multiple related updates, or next state depends on previous.' },
    { id: 3, title: 'Essay draft — philosophy of AI', date: 'Yesterday', tag: 'Writing', preview: 'Opening paragraph needs more tension. Flip thesis to the positive claim.' },
    { id: 4, title: 'SN1 vs SN2', date: '2 days ago', tag: 'Chemistry', preview: 'Tertiary carbons favor SN1. Primary carbons favor SN2. Solvent matters.' },
  ]);
  const [selected, setSelected] = useState(notes[0]);

  const newNote = () => {
    const n = { id: Date.now(), title: 'Untitled', date: 'Now', tag: 'General', preview: '' };
    setNotes([n, ...notes]);
    setSelected(n);
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: 20, height: 'calc(100vh - 280px)', minHeight: 560 }}>
      {/* List */}
      <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 16, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: 14, borderBottom: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div className="font-heading" style={{ fontSize: 14, fontWeight: 600 }}>Notes · {notes.length}</div>
          <button onClick={newNote} style={{
            width: 30, height: 30, borderRadius: 10, background: 'var(--text-primary)', color: '#fff',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'transform 220ms var(--ease-spring)',
          }}
            onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.08) rotate(90deg)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'scale(1) rotate(0deg)'}
          ><Icon name="plus" size={14} stroke={2.2}/></button>
        </div>
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {notes.map(n => {
            const active = selected?.id === n.id;
            return (
              <button key={n.id} onClick={() => setSelected(n)} style={{
                display: 'block', width: '100%', padding: '14px 16px',
                textAlign: 'left',
                background: active ? 'var(--bg-hover)' : 'transparent',
                borderLeft: '2px solid ' + (active ? 'var(--text-primary)' : 'transparent'),
                borderBottom: '1px solid var(--border-subtle)',
                transition: 'background 160ms',
              }}
                onMouseEnter={e => { if (!active) e.currentTarget.style.background = 'var(--bg-hover)'; }}
                onMouseLeave={e => { if (!active) e.currentTarget.style.background = 'transparent'; }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 10, marginBottom: 4 }}>
                  <span className="font-heading truncate" style={{ fontSize: 14, fontWeight: 600, flex: 1, minWidth: 0 }}>{n.title}</span>
                  <span style={{ fontSize: 10, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.06em', flexShrink: 0 }}>{n.date}</span>
                </div>
                <div className="line-clamp-2" style={{ fontSize: 12, color: 'var(--text-tertiary)', lineHeight: 1.5, wordBreak: 'break-word' }}>{n.preview}</div>
                <div style={{ marginTop: 8 }}>
                  <span className="chip chip-sm">{n.tag}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Editor */}
      <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 16, padding: 32, overflow: 'hidden', display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        {selected && (
          <>
            <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
              <span className="chip chip-sm">{selected.tag}</span>
              <span style={{ fontSize: 12, color: 'var(--text-tertiary)', alignSelf: 'center' }}>{selected.date}</span>
            </div>
            <input
              defaultValue={selected.title}
              className="font-display"
              style={{ fontSize: 36, fontWeight: 500, letterSpacing: '-0.02em', width: '100%', maxWidth: '100%', boxSizing: 'border-box', border: 'none', outline: 'none', background: 'transparent', color: 'var(--text-primary)', marginBottom: 20 }}
            />
            <textarea
              defaultValue={selected.preview + '\n\nStart writing here…'}
              style={{ flex: 1, width: '100%', maxWidth: '100%', boxSizing: 'border-box', minHeight: 300, border: 'none', outline: 'none', resize: 'none', background: 'transparent', fontSize: 15, lineHeight: 1.7, color: 'var(--text-primary)', fontFamily: 'Instrument Sans', overflowY: 'auto' }}
            />
          </>
        )}
      </div>
    </div>
  );
};

// ─── PLANNER ──────────────────────────────
const PlannerTab = () => {
  const days = ['Mon 21','Tue 22','Wed 23','Thu 24','Fri 25','Sat 26','Sun 27'];
  const hours = ['8 AM','10 AM','12 PM','2 PM','4 PM','6 PM','8 PM','10 PM'];
  const events = {
    '0-2': { label: 'React deep-dive', color: 'brand' },
    '2-3': { label: 'Calculus', color: 'amber' },
    '3-5': { label: 'Mentor · Priya', color: 'brand' },
    '4-4': { label: 'Chemistry', color: 'neutral' },
    '5-6': { label: 'Thesis review', color: 'amber' },
  };
  return (
    <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 16, padding: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <h3 className="font-heading" style={{ fontSize: 18, fontWeight: 600 }}>Apr 21 — Apr 27</h3>
          <p style={{ fontSize: 12, color: 'var(--text-tertiary)', marginTop: 3 }}>Your week · 5 events</p>
        </div>
        <div style={{ display: 'flex', gap: 4 }}>
          <button className="btn btn-ghost btn-sm"><Icon name="chevronL" size={14}/></button>
          <button className="btn btn-ghost btn-sm">Today</button>
          <button className="btn btn-ghost btn-sm"><Icon name="chevronR" size={14}/></button>
          <div style={{ width: 1, background: 'var(--border-subtle)', margin: '0 8px' }}/>
          <button className="btn btn-primary btn-sm"><Icon name="plus" size={12} stroke={2.4}/> Add</button>
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '56px repeat(7, 1fr)', gap: 1, background: 'var(--border-subtle)', borderRadius: 12, overflow: 'hidden', border: '1px solid var(--border-subtle)' }}>
        <div style={{ background: 'var(--bg-surface)' }}/>
        {days.map((d, i) => (
          <div key={d} style={{ background: 'var(--bg-surface)', padding: '10px 8px', textAlign: 'center', fontFamily: 'Inter', fontWeight: 600, fontSize: 12, color: i === 2 ? 'var(--text-primary)' : 'var(--text-tertiary)' }}>
            {d}
          </div>
        ))}
        {hours.map((h, hi) => (
          <React.Fragment key={h}>
            <div style={{ background: 'var(--bg-surface)', padding: '14px 6px', fontSize: 11, color: 'var(--text-tertiary)', fontFamily: 'JetBrains Mono', textAlign: 'right' }}>{h}</div>
            {days.map((d, di) => {
              const key = `${di}-${hi}`;
              const e = events[key];
              return (
                <div key={di} style={{ background: 'var(--bg-surface)', minHeight: 56, padding: 4, position: 'relative' }}>
                  {e && (
                    <div style={{
                      background: e.color === 'brand' ? 'var(--brand-100)' : e.color === 'amber' ? 'var(--amber-100)' : 'var(--bg-hover)',
                      borderLeft: '3px solid ' + (e.color === 'brand' ? 'var(--brand-500)' : e.color === 'amber' ? 'var(--amber-500)' : 'var(--text-muted)'),
                      padding: '8px 10px', borderRadius: 8,
                      fontSize: 12, fontFamily: 'Inter', fontWeight: 500,
                      color: e.color === 'brand' ? 'var(--brand-600)' : e.color === 'amber' ? 'var(--amber-600)' : 'var(--text-primary)',
                      cursor: 'pointer',
                      transition: 'all 180ms var(--ease-smooth)',
                    }}
                      onMouseEnter={ev => { ev.currentTarget.style.transform = 'translateY(-1px)'; ev.currentTarget.style.boxShadow = 'var(--shadow-xs)'; }}
                      onMouseLeave={ev => { ev.currentTarget.style.transform = 'translateY(0)'; ev.currentTarget.style.boxShadow = 'none'; }}
                    >{e.label}</div>
                  )}
                </div>
              );
            })}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

// ─── ANALYTICS ────────────────────────────
const AnalyticsTab = () => {
  const weekData = [2.1, 3.4, 1.8, 4.2, 2.9, 0.5, 1.1];
  const days = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
  const subjects = [
    { name: 'Mathematics', pct: 34, color: '#6366F1' },
    { name: 'Computer Science', pct: 28, color: '#10B981' },
    { name: 'Physics', pct: 20, color: '#F59E0B' },
    { name: 'Writing', pct: 12, color: '#A78BFA' },
    { name: 'Other', pct: 6, color: '#CBD5E1' },
  ];

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 20 }}>
        {[
          ['This week', '14h', '+2h vs last'],
          ['Daily avg', '2h', '+15m'],
          ['Streak', '15d', 'personal best'],
          ['Focus sessions', '6', 'this week'],
        ].map(([l,v,s], i) => (
          <div key={i} className="card" style={{ animation: `fadeInUp 400ms ${i*60}ms var(--ease-out-expo) both` }}>
            <div className="label-sm" style={{ marginBottom: 8 }}>{l}</div>
            <div className="font-display" style={{ fontSize: 34, fontWeight: 500, letterSpacing: '-0.02em' }}>{v}</div>
            <div style={{ fontSize: 12, color: 'var(--mint-600)', marginTop: 4 }}>{s}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: 14, marginBottom: 14 }}>
        <div className="card">
          <h3 className="font-heading" style={{ fontSize: 15, fontWeight: 600, marginBottom: 20 }}>Study hours · this week</h3>
          <div style={{ display: 'flex', alignItems: 'end', gap: 12, height: 200, padding: '10px 0 16px' }}>
            {weekData.map((h, i) => (
              <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                <div style={{ flex: 1, width: '100%', display: 'flex', alignItems: 'end' }}>
                  <div style={{
                    width: '100%',
                    height: `${(h/4.5)*100}%`,
                    background: i === 3 ? 'var(--text-primary)' : 'var(--bg-subtle)',
                    borderRadius: '6px 6px 2px 2px',
                    transition: 'height 700ms var(--ease-out-expo)',
                    animation: `growBar 700ms ${i*80}ms var(--ease-out-expo) both`,
                  }}/>
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-tertiary)', fontFamily: 'Inter', fontWeight: 500 }}>{days[i]}</div>
                <div style={{ fontSize: 11, color: i === 3 ? 'var(--text-primary)' : 'var(--text-tertiary)', fontFamily: 'JetBrains Mono' }}>{h}h</div>
              </div>
            ))}
          </div>
        </div>
        <div className="card">
          <h3 className="font-heading" style={{ fontSize: 15, fontWeight: 600, marginBottom: 20 }}>By subject</h3>
          <Donut data={subjects}/>
          <div style={{ marginTop: 20, display: 'flex', flexDirection: 'column', gap: 10 }}>
            {subjects.map(s => (
              <div key={s.name} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13 }}>
                <div style={{ width: 10, height: 10, borderRadius: 3, background: s.color }}/>
                <span style={{ flex: 1, color: 'var(--text-secondary)' }}>{s.name}</span>
                <span style={{ color: 'var(--text-tertiary)', fontFamily: 'JetBrains Mono' }}>{s.pct}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="card">
        <h3 className="font-heading" style={{ fontSize: 15, fontWeight: 600, marginBottom: 20 }}>Study calendar · last 22 weeks</h3>
        <StreakCalendar/>
      </div>
    </div>
  );
};

const Donut = ({ data }) => {
  let offset = 0;
  const r = 58, c = 2*Math.PI*r;
  return (
    <div style={{ position: 'relative', width: 160, height: 160, margin: '0 auto' }}>
      <svg width="160" height="160" style={{ transform: 'rotate(-90deg)' }}>
        {data.map((d, i) => {
          const pct = d.pct / 100;
          const dash = c * pct;
          const el = <circle key={i} cx="80" cy="80" r={r} fill="none" stroke={d.color} strokeWidth="14" strokeDasharray={`${dash} ${c}`} strokeDashoffset={-offset * c} style={{ transition: 'stroke-dasharray 600ms var(--ease-out-expo)' }}/>;
          offset += pct;
          return el;
        })}
      </svg>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <div className="font-display" style={{ fontSize: 26, fontWeight: 500 }}>14h</div>
        <div className="label-sm">This week</div>
      </div>
    </div>
  );
};

const StreakCalendar = () => {
  const cells = [];
  for (let w = 0; w < 22; w++) {
    const col = [];
    for (let d = 0; d < 7; d++) {
      const intensity = Math.random();
      let bg;
      if (intensity < 0.25) bg = 'var(--bg-hover)';
      else if (intensity < 0.5) bg = 'rgba(99,102,241,0.20)';
      else if (intensity < 0.75) bg = 'rgba(99,102,241,0.50)';
      else bg = 'var(--brand-500)';
      col.push(<div key={d} style={{ width: 14, height: 14, borderRadius: 3, background: bg, transition: 'transform 160ms', cursor: 'pointer' }}
        onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.3)'}
        onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
      />);
    }
    cells.push(<div key={w} style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>{col}</div>);
  }
  return (
    <div>
      <div style={{ display: 'flex', gap: 3, overflowX: 'auto' }}>{cells}</div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 14, fontSize: 11, color: 'var(--text-tertiary)' }}>
        <span>Less</span>
        <div style={{ width: 12, height: 12, borderRadius: 3, background: 'var(--bg-hover)' }}/>
        <div style={{ width: 12, height: 12, borderRadius: 3, background: 'rgba(99,102,241,0.20)' }}/>
        <div style={{ width: 12, height: 12, borderRadius: 3, background: 'rgba(99,102,241,0.50)' }}/>
        <div style={{ width: 12, height: 12, borderRadius: 3, background: 'var(--brand-500)' }}/>
        <span>More</span>
      </div>
    </div>
  );
};

window.Productivity = Productivity;
