/* global React, Icon, Avatar, StatusRing */
const { useState, useEffect, useRef } = React;

// ═══════════════════════════════════════
// ACTIVE STUDY ROOM SESSION — full-screen immersive
// ═══════════════════════════════════════

const PARTICIPANTS = [
  { name: 'Priya S.',   status: 'focus', time: '1h 24m' },
  { name: 'Dev R.',     status: 'focus', time: '1h 02m' },
  { name: 'Ananya M.',  status: 'break', time: '48m'    },
  { name: 'Vikram S.',  status: 'focus', time: '2h 05m' },
  { name: 'Arjun Patel',status: 'focus', time: '0h 34m', isYou: true },
  { name: 'Karan I.',   status: 'away',  time: '15m'    },
];

const AMBIENT = [
  { id: 'coffee', label: 'Coffee Shop', glyph: '☕' },
  { id: 'rain',   label: 'Rain',        glyph: '🌧' },
  { id: 'forest', label: 'Forest',      glyph: '🌿' },
  { id: 'piano',  label: 'Piano',       glyph: '🎹' },
  { id: 'lofi',   label: 'Lo-Fi',       glyph: '🎵' },
  { id: 'off',    label: 'Off',         glyph: '✕'  },
];

const FOCUS_DURATION  = 25 * 60;
const BREAK_DURATION  = 5  * 60;

const RoomSession = ({ room, onLeave }) => {
  const [phase,      setPhase]      = useState('FOCUS'); // 'FOCUS' | 'BREAK'
  const [timeLeft,   setTimeLeft]   = useState(FOCUS_DURATION);
  const [running,    setRunning]    = useState(true);
  const [pomoDots,   setPomoDots]   = useState([true, true, false, false]);
  const [elapsed,    setElapsed]    = useState(34 * 60); // seconds elapsed this session
  const [showNotes,  setShowNotes]  = useState(false);
  const [showNova,   setShowNova]   = useState(false);
  const [noteText,   setNoteText]   = useState('');
  const [noteSaved,  setNoteSaved]  = useState(false);
  const [showLeave,  setShowLeave]  = useState(false);
  const notesRef    = useRef(null);

  const total = phase === 'FOCUS' ? FOCUS_DURATION : BREAK_DURATION;

  // Timer tick
  useEffect(() => {
    if (!running) return;
    const t = setInterval(() => {
      setTimeLeft(s => {
        if (s <= 1) {
          clearInterval(t);
          if (phase === 'FOCUS') {
            setPhase('BREAK');
            setTimeLeft(BREAK_DURATION);
            setPomoDots(d => { const n = [...d]; const idx = n.indexOf(false); if (idx !== -1) n[idx] = true; return n; });
          } else {
            setPhase('FOCUS');
            setTimeLeft(FOCUS_DURATION);
          }
          return 0;
        }
        return s - 1;
      });
      setElapsed(e => e + 1);
    }, 1000);
    return () => clearInterval(t);
  }, [running, phase]);



  const fmt = (s) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
  const fmtElapsed = (s) => `${Math.floor(s / 3600)}h ${String(Math.floor((s % 3600) / 60)).padStart(2, '0')}m`;

  const isMobile = window.innerWidth <= 768;
  const RING_R  = isMobile ? 88 : 108;
  const RING_C  = 2 * Math.PI * RING_R;
  const progress = (total - timeLeft) / total;
  const dashOffset = RING_C * (1 - progress);

  const isFocus = phase === 'FOCUS';
  const ringColor = isFocus ? 'url(#timerGrad)' : 'var(--mint-500)';

  const saveNote = () => {
    setNoteSaved(true);
    setTimeout(() => setNoteSaved(false), 2000);
  };

  const handleLeave = () => setShowLeave(true);
  const confirmLeave = () => onLeave({ elapsed, pomoDots: pomoDots.filter(Boolean).length });

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 100,
      background: 'var(--bg-base)',
      display: 'flex', flexDirection: 'column',
      overflow: 'hidden',
      fontFamily: 'Instrument Sans',
    }}>

      {/* ─── TOP STRIP ─── */}
      <div style={{
        height: isMobile ? 52 : 46, flexShrink: 0,
        display: 'flex', alignItems: 'center',
        padding: isMobile ? '0 16px' : '0 28px',
        borderBottom: '1px solid var(--border-subtle)',
        background: 'rgba(250,250,247,0.92)',
        backdropFilter: 'blur(12px)',
        gap: 16,
      }}>
        {/* Left: room name + subject */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1 }}>
          <span style={{ fontFamily: 'Figtree', fontWeight: 700, fontSize: 14, color: 'var(--text-primary)' }}>
            {room?.topic || 'Calculus — eigenvalues & diagonalization'}
          </span>
          <span style={{
            padding: '3px 10px', borderRadius: 999, fontSize: 11,
            background: 'rgba(79,70,229,0.07)', color: 'var(--brand-600)',
            border: '1px solid rgba(79,70,229,0.16)',
            fontFamily: 'Figtree', fontWeight: 600,
          }}>{room?.subject || 'Mathematics'}</span>
        </div>

        {/* Center: mode pill */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 6,
          padding: '5px 14px', borderRadius: 999,
          background: 'var(--bg-surface)', border: '1px solid var(--border-default)',
          fontFamily: 'Figtree', fontWeight: 600, fontSize: 12, color: 'var(--text-secondary)',
          boxShadow: 'var(--shadow-xs)',
        }}>
          <span style={{ fontSize: 12 }}>🔇</span> Silent Mode
        </div>

        {/* Right: elapsed + participant count */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, flex: 1, justifyContent: 'flex-end' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-tertiary)', fontSize: 13 }}>
            <Icon name="clock" size={13}/>
            <span style={{ fontFamily: 'JetBrains Mono', fontSize: 13, color: 'var(--text-secondary)' }}>{fmtElapsed(elapsed)}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, color: 'var(--text-tertiary)', fontSize: 12 }}>
            <Icon name="users" size={13}/>
            <span style={{ fontFamily: 'Figtree', fontWeight: 600, color: 'var(--text-secondary)', fontSize: 13 }}>{PARTICIPANTS.length}</span>
          </div>
        </div>
      </div>

      {/* ─── MAIN CONTENT ─── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', position: 'relative' }}>

        {/* Participants (top ~28%) */}
        <div style={isMobile
          ? { padding: '12px 16px 10px', borderBottom: '1px solid var(--border-subtle)', flexShrink: 0, overflowX: 'auto' }
          : { padding: '20px 40px 16px', borderBottom: '1px solid var(--border-subtle)', flexShrink: 0 }
        }>
          <div style={{ display: 'flex', flexWrap: isMobile ? 'nowrap' : 'wrap', gap: isMobile ? 8 : 12, justifyContent: isMobile ? 'flex-start' : 'center' }}>
            {PARTICIPANTS.map((p, i) => (
              <ParticipantTile key={i} participant={p} idx={i}/>
            ))}
          </div>
        </div>

        {/* Timer CENTER */}
        <div style={{
          flex: 1, display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          padding: '24px 0',
          gap: 0,
        }}>
          {/* Phase label */}
          <div className="label-sm" style={{ marginBottom: 20, letterSpacing: '0.22em', color: isFocus ? 'var(--brand-500)' : 'var(--mint-600)', fontSize: 11 }}>
            {isFocus ? 'FOCUS' : 'BREAK TIME'}
          </div>

          {/* SVG Ring */}
          <div style={{ position: 'relative', width: isMobile ? 200 : 240, height: isMobile ? 200 : 240 }}>
            <svg width={isMobile ? 200 : 240} height={isMobile ? 200 : 240} viewBox={isMobile ? '0 0 200 200' : '0 0 240 240'} style={{ transform: 'rotate(-90deg)' }}>
              <defs>
                <linearGradient id="timerGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#4F46E5"/>
                  <stop offset="100%" stopColor="#818CF8"/>
                </linearGradient>
              </defs>
              <circle cx={isMobile ? 100 : 120} cy={isMobile ? 100 : 120} r={RING_R}
                fill="none" stroke="var(--border-subtle)" strokeWidth="8"
              />
              <circle cx={isMobile ? 100 : 120} cy={isMobile ? 100 : 120} r={RING_R}
                fill="none" stroke={ringColor} strokeWidth="8" strokeLinecap="round"
                strokeDasharray={RING_C} strokeDashoffset={dashOffset}
                style={{ transition: 'stroke-dashoffset 1s linear' }}
              />
            </svg>
            {/* Countdown center */}
            <div style={{
              position: 'absolute', inset: 0,
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center',
            }}>
              <div style={{
                fontFamily: 'JetBrains Mono', fontWeight: 600,
                fontSize: isMobile ? 42 : 52, lineHeight: 1, letterSpacing: '-0.02em',
                color: 'var(--text-primary)',
              }}>{fmt(timeLeft)}</div>
            </div>
          </div>

          {/* Pomodoro dots */}
          <div style={{ display: 'flex', gap: 8, marginTop: 20 }}>
            {pomoDots.map((filled, i) => (
              <div key={i} style={{
                width: 10, height: 10, borderRadius: 999,
                background: filled
                  ? (isFocus ? 'var(--brand-500)' : 'var(--mint-500)')
                  : 'var(--border-default)',
                transition: 'background 400ms',
              }}/>
            ))}
          </div>

          {/* Controls */}
          <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
            <ControlBtn icon={running ? 'pause' : 'play'} label={running ? 'Pause' : 'Resume'} onClick={() => setRunning(r => !r)}/>
            <ControlBtn icon="chevronR" label="Skip" onClick={() => {
              if (isFocus) { setPhase('BREAK'); setTimeLeft(BREAK_DURATION); }
              else { setPhase('FOCUS'); setTimeLeft(FOCUS_DURATION); }
              setRunning(true);
            }}/>
            <ControlBtn icon="x" label="End" onClick={handleLeave} danger/>
          </div>
        </div>
      </div>

      {/* ─── BOTTOM ACTION BAR ─── */}
      <div style={{
        height: isMobile ? 60 : 56, flexShrink: 0,
        background: 'rgba(250,250,247,0.94)',
        backdropFilter: 'blur(12px)',
        borderTop: '1px solid var(--border-subtle)',
        display: 'flex', alignItems: 'center',
        padding: isMobile ? '0 8px' : '0 28px',
      }}>
        {/* Left cluster */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, flex: 1 }}>
          <BarBtn icon="nova" label="Ask Nova" active={showNova} onClick={() => { setShowNova(n => !n); if (showNotes) setShowNotes(false); }}/>
          <BarBtn icon="note" label="Notes" active={showNotes} onClick={() => { setShowNotes(n => !n); if (showNova) setShowNova(false); }}/>
          <BarBtn icon="target" label="Goal" onClick={() => {}}/>
        </div>

        {/* Center spacer with session info */}
        <div style={{ display: 'flex', flex: 1, justifyContent: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ width: 6, height: 6, borderRadius: 999, background: 'var(--mint-500)', animation: 'pulse 2.2s infinite' }}/>
            <span style={{ fontFamily: 'JetBrains Mono', fontSize: 11, color: 'var(--text-tertiary)' }}>Session active</span>
          </div>
        </div>

        {/* Right cluster */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, flex: 1, justifyContent: 'flex-end' }}>
          <BarBtn icon="users" label="Participants" onClick={() => {}}/>
          <BarBtn icon="leave" label="Leave" danger onClick={handleLeave}/>
        </div>
      </div>

      {/* ─── NOVA AI PANEL ─── */}
      <NovaRoomPanel show={showNova} onClose={() => setShowNova(false)} isMobile={isMobile}/>

      {/* ─── NOTES PANEL ─── */}
      <div style={{
        position: 'fixed', top: 0, right: 0, bottom: 0,
        width: isMobile ? '100%' : 360,
        background: 'var(--bg-surface)',
        borderLeft: '1px solid var(--border-subtle)',
        display: 'flex', flexDirection: 'column',
        boxShadow: 'var(--shadow-xl)',
        transform: showNotes ? 'translateX(0)' : 'translateX(100%)',
        transition: 'transform 380ms var(--ease-out-expo)',
        zIndex: 50,
      }}>
        <div style={{ padding: '18px 20px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div className="font-heading" style={{ fontSize: 15, fontWeight: 600 }}>Session Notes</div>
          <button onClick={() => setShowNotes(false)} style={{ color: 'var(--text-tertiary)', padding: 4, borderRadius: 6 }}
            onMouseEnter={e => e.currentTarget.style.color = 'var(--text-primary)'}
            onMouseLeave={e => e.currentTarget.style.color = 'var(--text-tertiary)'}
          ><Icon name="x" size={16}/></button>
        </div>

        {/* Mini toolbar */}
        <div style={{ padding: '10px 16px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', gap: 4 }}>
          {[['B', 'bold'], ['I', 'italic'], ['H1', 'heading'], ['≡', 'list']].map(([label, _]) => (
            <button key={label} style={{
              width: 30, height: 28, borderRadius: 6,
              fontFamily: 'Figtree', fontWeight: 700, fontSize: label === 'H1' ? 10 : 13,
              color: 'var(--text-secondary)',
              border: '1px solid var(--border-default)',
              transition: 'all 160ms',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
              onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg-hover)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
            >{label}</button>
          ))}
        </div>

        <textarea value={noteText} onChange={e => setNoteText(e.target.value)}
          placeholder="Type your notes here…&#10;&#10;You can save them to your Productivity Hub."
          style={{
            flex: 1, resize: 'none', padding: '18px 20px',
            fontFamily: 'Instrument Sans', fontSize: 14, lineHeight: 1.7,
            background: 'transparent', border: 'none', outline: 'none',
            color: 'var(--text-primary)',
          }}
        />

        <div style={{ padding: '14px 20px', borderTop: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', gap: 10 }}>
          <button onClick={saveNote} style={{
            flex: 1, height: 38, borderRadius: 999,
            background: 'var(--text-primary)', color: '#fff',
            fontFamily: 'Figtree', fontWeight: 600, fontSize: 13,
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
            transition: 'all 200ms',
          }}
            onMouseEnter={e => { e.currentTarget.style.background = '#1C2140'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'var(--text-primary)'; e.currentTarget.style.transform = 'translateY(0)'; }}
          >
            {noteSaved ? <><Icon name="check" size={13} stroke={2.5}/> Saved!</> : <><Icon name="book" size={13}/> Save to Hub</>}
          </button>
        </div>
      </div>

      {/* ─── LEAVE CONFIRMATION ─── */}
      {showLeave && (
        <div className="fade-in" style={{
          position: 'fixed', inset: 0, background: 'rgba(14,18,40,0.24)',
          backdropFilter: 'blur(4px)', zIndex: 200,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }} onClick={() => setShowLeave(false)}>
          <div className="modal-in" style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-default)',
            borderRadius: 20, padding: 32, width: 380,
            boxShadow: 'var(--shadow-xl)',
          }} onClick={e => e.stopPropagation()}>
            <h3 className="font-display" style={{ fontSize: 26, fontWeight: 500, letterSpacing: '-0.02em', marginBottom: 8 }}>
              Leave this session?
            </h3>
            <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.55, marginBottom: 20 }}>
              You've studied for <span style={{ fontFamily: 'JetBrains Mono', fontWeight: 600, color: 'var(--text-primary)' }}>{fmtElapsed(elapsed)}</span> today. Your progress will be saved.
            </p>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => setShowLeave(false)} style={{
                flex: 1, height: 44, borderRadius: 999, border: '1px solid var(--border-default)',
                fontFamily: 'Figtree', fontWeight: 600, fontSize: 14, color: 'var(--text-primary)',
                background: 'var(--bg-surface)', transition: 'all 180ms',
              }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'}
                onMouseLeave={e => e.currentTarget.style.background = 'var(--bg-surface)'}
              >Stay in Room</button>
              <button onClick={confirmLeave} style={{
                flex: 1, height: 44, borderRadius: 999,
                background: 'var(--text-primary)', color: '#fff',
                fontFamily: 'Figtree', fontWeight: 600, fontSize: 14,
                transition: 'all 180ms',
              }}
                onMouseEnter={e => { e.currentTarget.style.background = '#1C2140'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'var(--text-primary)'; e.currentTarget.style.transform = 'translateY(0)'; }}
              >Leave & See Summary</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Participant tile — blurred avatar with status ring
const ParticipantTile = ({ participant: p, idx }) => {
  const [hovered, setHovered] = useState(false);
  const ringColor = p.status === 'focus' ? 'var(--mint-500)' : p.status === 'break' ? 'var(--amber-400)' : 'var(--text-muted)';

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
        padding: '12px 14px', borderRadius: 14,
        background: p.isYou ? 'rgba(79,70,229,0.05)' : 'transparent',
        border: p.isYou ? '1px solid rgba(79,70,229,0.16)' : '1px solid transparent',
        transition: 'all 220ms', cursor: 'default',
        minWidth: 80,
      }}
    >
      <div style={{
        width: 50, height: 50, borderRadius: 999,
        border: `2px solid ${ringColor}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: `0 0 0 1px ${ringColor}22`,
        transition: 'filter 300ms',
        overflow: 'hidden',
      }}>
        <div style={{
          filter: (!p.isYou && !hovered) ? 'blur(3px)' : 'none',
          transition: 'filter 300ms',
        }}>
          <Avatar name={p.name} size={46} tint={idx}/>
        </div>
      </div>

      <div style={{ textAlign: 'center' }}>
        <div style={{ fontFamily: 'Figtree', fontWeight: 600, fontSize: 12, color: 'var(--text-primary)' }}>
          {p.isYou ? 'You' : p.name.split(' ')[0]}
        </div>
        <div style={{ fontFamily: 'JetBrains Mono', fontSize: 10, color: 'var(--text-tertiary)', marginTop: 2 }}>{p.time}</div>
      </div>

      <div style={{
        width: 6, height: 6, borderRadius: 999,
        background: ringColor,
        transition: 'background 400ms',
      }}/>
    </div>
  );
};

// Small control button for timer area
const ControlBtn = ({ icon, label, onClick, danger }) => (
  <button onClick={onClick} style={{
    display: 'flex', alignItems: 'center', gap: 7,
    height: 40, padding: '0 18px', borderRadius: 999,
    background: 'var(--bg-surface)',
    border: `1px solid ${danger ? 'rgba(239,68,68,0.22)' : 'var(--border-default)'}`,
    color: danger ? 'var(--error, #EF4444)' : 'var(--text-secondary)',
    fontFamily: 'Figtree', fontWeight: 600, fontSize: 13,
    boxShadow: 'var(--shadow-xs)',
    transition: 'all 200ms var(--ease-smooth)',
  }}
    onMouseEnter={e => { e.currentTarget.style.background = danger ? 'rgba(239,68,68,0.06)' : 'var(--bg-hover)'; e.currentTarget.style.borderColor = danger ? 'rgba(239,68,68,0.35)' : 'var(--border-strong)'; e.currentTarget.style.color = danger ? '#EF4444' : 'var(--text-primary)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
    onMouseLeave={e => { e.currentTarget.style.background = 'var(--bg-surface)'; e.currentTarget.style.borderColor = danger ? 'rgba(239,68,68,0.22)' : 'var(--border-default)'; e.currentTarget.style.color = danger ? '#EF4444' : 'var(--text-secondary)'; e.currentTarget.style.transform = 'translateY(0)'; }}
  >
    <Icon name={icon} size={14}/> {label}
  </button>
);

// Bottom bar button
const BarBtn = ({ icon, label, onClick, active, danger }) => (
  <button onClick={onClick} style={{
    display: 'flex', alignItems: 'center', gap: 6,
    height: 34, padding: '0 12px', borderRadius: 8,
    background: active ? 'var(--bg-hover)' : 'transparent',
    border: active ? '1px solid var(--border-default)' : '1px solid transparent',
    color: danger ? 'rgba(239,68,68,0.7)' : (active ? 'var(--text-primary)' : 'var(--text-tertiary)'),
    fontFamily: 'Figtree', fontWeight: 500, fontSize: 12,
    transition: 'all 160ms',
  }}
    onMouseEnter={e => { e.currentTarget.style.background = danger ? 'rgba(239,68,68,0.06)' : 'var(--bg-hover)'; e.currentTarget.style.color = danger ? '#EF4444' : 'var(--text-primary)'; e.currentTarget.style.borderColor = danger ? 'rgba(239,68,68,0.22)' : 'var(--border-default)'; }}
    onMouseLeave={e => { e.currentTarget.style.background = active ? 'var(--bg-hover)' : 'transparent'; e.currentTarget.style.color = danger ? 'rgba(239,68,68,0.7)' : (active ? 'var(--text-primary)' : 'var(--text-tertiary)'); e.currentTarget.style.borderColor = active ? 'var(--border-default)' : 'transparent'; }}
  >
    <Icon name={icon} size={14}/> {label}
  </button>
);

// ─── NOVA IN-SESSION PANEL ───────────────────────────────
const NovaRoomPanel = ({ show, onClose, isMobile = false }) => {
  const [thread,  setThread]  = useState([]);
  const [msg,     setMsg]     = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [thread, loading]);

  const send = async (text) => {
    const content = (text || msg).trim();
    if (!content || loading) return;
    setMsg('');
    const newThread = [...thread, { role: 'user', content }];
    setThread(newThread);
    setLoading(true);
    try {
      const res = await window.claude.complete({
        messages: [{ role: 'user', content: `You are Nova, a concise AI tutor. The student is in an active study session and has a quick doubt. Give a short, clear answer — aim for under 100 words. Use a worked example if helpful. Question: ${content}` }]
      });
      setThread(t => [...t, { role: 'ai', content: res }]);
    } catch {
      setThread(t => [...t, { role: 'ai', content: "Couldn't reach network. Try again." }]);
    }
    setLoading(false);
  };

  const QUICK = ['Explain this concept simply', 'Give me an example', 'What formula applies here?', 'Check my working'];

  return (
    <div style={{
      position: 'fixed', top: 0, right: 0, bottom: 0,
      width: isMobile ? '100%' : 360,
      background: 'var(--bg-surface)',
      borderLeft: isMobile ? 'none' : '1px solid var(--border-subtle)',
      display: 'flex', flexDirection: 'column',
      boxShadow: 'var(--shadow-xl)',
      transform: show ? 'translateX(0)' : 'translateX(100%)',
      transition: 'transform 380ms var(--ease-out-expo)',
      zIndex: 50,
    }}>
      {/* Header */}
      <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', gap: 10 }}>
        <div className="nova-orb" style={{ width: 26, height: 26, flexShrink: 0 }}/>
        <div style={{ flex: 1 }}>
          <div className="font-heading" style={{ fontSize: 14, fontWeight: 600 }}>Ask Nova</div>
          <div style={{ fontSize: 11, color: 'var(--mint-600)', fontFamily: 'Figtree', fontWeight: 500 }}>Quick doubts · stay in focus</div>
        </div>
        <button onClick={onClose} style={{ color: 'var(--text-tertiary)', padding: 4 }}
          onMouseEnter={e => e.currentTarget.style.color = 'var(--text-primary)'}
          onMouseLeave={e => e.currentTarget.style.color = 'var(--text-tertiary)'}
        ><Icon name="x" size={16}/></button>
      </div>

      {/* Thread / empty state */}
      {thread.length === 0 ? (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px 20px', gap: 16 }}>
          <div className="nova-orb" style={{ width: 48, height: 48 }}/>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', textAlign: 'center', lineHeight: 1.5 }}>
            Got a doubt? Ask me anything without leaving your session.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 7, width: '100%' }}>
            {QUICK.map(q => (
              <button key={q} onClick={() => send(q)} style={{
                padding: '10px 14px', borderRadius: 10, textAlign: 'left',
                background: 'var(--bg-surface)', border: '1px solid var(--border-default)',
                fontSize: 12, fontFamily: 'Figtree', fontWeight: 500, color: 'var(--text-secondary)',
                transition: 'all 160ms',
              }}
                onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg-hover)'; e.currentTarget.style.color = 'var(--text-primary)'; e.currentTarget.style.borderColor = 'var(--border-strong)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'var(--bg-surface)'; e.currentTarget.style.color = 'var(--text-secondary)'; e.currentTarget.style.borderColor = 'var(--border-default)'; }}
              >{q}</button>
            ))}
          </div>
        </div>
      ) : (
        <div ref={scrollRef} style={{ flex: 1, overflowY: 'auto', padding: '16px 16px 8px' }}>
          {thread.map((m, i) => (
            <div key={i} className="fade-in-up" style={{ display: 'flex', gap: 10, marginBottom: 14, flexDirection: m.role === 'user' ? 'row-reverse' : 'row' }}>
              {m.role === 'ai' && <div className="nova-orb" style={{ width: 22, height: 22, flexShrink: 0, marginTop: 2 }}/>}
              <div style={{
                maxWidth: '82%', padding: '10px 13px',
                background: m.role === 'user' ? 'var(--text-primary)' : 'var(--bg-hover)',
                color: m.role === 'user' ? '#fff' : 'var(--text-primary)',
                border: m.role === 'ai' ? '1px solid var(--border-subtle)' : 'none',
                borderRadius: m.role === 'user' ? '14px 14px 3px 14px' : '3px 14px 14px 14px',
                fontSize: 13, lineHeight: 1.6, fontFamily: 'Instrument Sans',
                whiteSpace: 'pre-wrap',
              }}>{m.content}</div>
            </div>
          ))}
          {loading && (
            <div style={{ display: 'flex', gap: 10, marginBottom: 14 }}>
              <div className="nova-orb" style={{ width: 22, height: 22, flexShrink: 0 }}/>
              <div style={{ padding: '10px 14px', background: 'var(--bg-hover)', border: '1px solid var(--border-subtle)', borderRadius: '3px 14px 14px 14px', display: 'flex', gap: 5, alignItems: 'center' }}>
                <span className="nova-dot"/><span className="nova-dot"/><span className="nova-dot"/>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Input */}
      <div style={{ padding: '12px 14px', borderTop: '1px solid var(--border-subtle)' }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 6,
          background: 'var(--bg-hover)', border: '1px solid var(--border-default)',
          borderRadius: 999, padding: '4px 4px 4px 14px',
          transition: 'border-color 200ms',
        }}
          onFocusCapture={e => e.currentTarget.style.borderColor = 'var(--border-strong)'}
          onBlurCapture={e => e.currentTarget.style.borderColor = 'var(--border-default)'}
        >
          <input value={msg} onChange={e => setMsg(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') send(); }}
            placeholder="Ask a quick question…"
            style={{ flex: 1, fontSize: 13, fontFamily: 'Instrument Sans', background: 'transparent', border: 'none', outline: 'none', color: 'var(--text-primary)', height: 34 }}
          />
          <button onClick={() => send()} disabled={!msg.trim() || loading} style={{
            width: 32, height: 32, borderRadius: 999, flexShrink: 0,
            background: msg.trim() ? 'var(--text-primary)' : 'transparent',
            color: msg.trim() ? '#fff' : 'var(--text-muted)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'all 200ms',
          }}><Icon name="send" size={13}/></button>
        </div>
        <div style={{ fontSize: 10, color: 'var(--text-muted)', textAlign: 'center', marginTop: 6, fontFamily: 'Instrument Sans' }}>
          Nova stays quiet — your timer keeps running.
        </div>
      </div>
    </div>
  );
};

window.RoomSession = RoomSession;
