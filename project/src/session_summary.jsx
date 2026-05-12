/* global React, Icon */
const { useState, useEffect } = React;

// ═══════════════════════════════════════
// SESSION SUMMARY — full screen overlay
// ═══════════════════════════════════════

const MOODS = [
  { emoji: '😔', label: 'Rough' },
  { emoji: '😐', label: 'Okay'  },
  { emoji: '🙂', label: 'Good'  },
  { emoji: '😊', label: 'Great' },
  { emoji: '🤩', label: 'Flow'  },
];

const SessionSummary = ({ sessionData, onReturn, onDashboard }) => {
  const [mood,     setMood]     = useState(null);
  const [visible,  setVisible]  = useState(false);
  const [xpBurst,  setXpBurst]  = useState(false);

  // Stagger entrance
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 60);
    const x = setTimeout(() => setXpBurst(true), 900);
    return () => { clearTimeout(t); clearTimeout(x); };
  }, []);

  const {
    roomName   = 'Calculus — eigenvalues & diagonalization',
    subject    = 'Mathematics',
    timeStudied = '34m',
    pomodoros  = 2,
    xpEarned   = 85,
    dayStreak  = 15,
  } = sessionData || {};

  const today = new Date(2026, 3, 28).toLocaleDateString('en', { weekday: 'long', month: 'long', day: 'numeric' });

  const stats = [
    { icon: 'clock',       label: 'Time Studied',  value: timeStudied,      color: 'var(--brand-500)',  bg: 'rgba(79,70,229,0.07)' },
    { icon: 'productivity', label: 'Pomodoros',    value: `${pomodoros}`,   color: 'oklch(58% 0.18 20)', bg: 'rgba(239,100,50,0.07)' },
    { icon: 'sparkles',    label: 'XP Earned',     value: `+${xpEarned}`,   color: 'var(--amber-500)',  bg: 'rgba(217,119,6,0.07)',   burst: true },
    { icon: 'fire',        label: 'Day Streak',    value: `${dayStreak}d`,  color: 'var(--amber-600)',  bg: 'rgba(180,83,9,0.07)' },
  ];

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 200,
      background: 'var(--bg-base)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '16px 16px 32px',
      overflow: 'auto',
    }}>

      {/* Ambient glow */}
      <div style={{
        position: 'fixed', top: '-20%', left: '50%', transform: 'translateX(-50%)',
        width: 600, height: 400, borderRadius: 999, pointerEvents: 'none',
        background: 'radial-gradient(ellipse, rgba(79,70,229,0.09) 0%, transparent 70%)',
      }}/>

      <div style={{
        width: '100%', maxWidth: 480,
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(16px)',
        transition: 'opacity 500ms var(--ease-out-expo), transform 500ms var(--ease-out-expo)',
      }}>

        {/* ─── Checkmark + greeting ─── */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{
            width: 72, height: 72, borderRadius: 999, margin: '0 auto 22px',
            background: 'var(--text-primary)', color: '#fff',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 0 0 10px rgba(14,18,40,0.07), var(--shadow-lg)',
            animation: visible ? 'checkIn 600ms var(--ease-spring) both' : 'none',
          }}>
            <Icon name="check" size={32} stroke={2.5}/>
          </div>

          <h1 className="font-display italic" style={{
            fontSize: 44, fontWeight: 600, letterSpacing: '-0.03em', lineHeight: 1.05,
            color: 'var(--text-primary)',
            animation: visible ? 'fadeInUp 500ms 200ms var(--ease-out-expo) both' : 'none',
          }}>
            Great session!
          </h1>

          <div style={{
            marginTop: 10,
            animation: visible ? 'fadeInUp 500ms 300ms var(--ease-out-expo) both' : 'none',
          }}>
            <div style={{
              display: 'inline-flex', flexDirection: 'column', alignItems: 'center', gap: 3,
            }}>
              <span style={{ fontFamily: 'Figtree', fontWeight: 600, fontSize: 14, color: 'var(--text-secondary)' }}>
                {roomName}
              </span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{
                  padding: '3px 10px', borderRadius: 999, fontSize: 11,
                  background: 'rgba(79,70,229,0.07)', color: 'var(--brand-600)',
                  border: '1px solid rgba(79,70,229,0.14)',
                  fontFamily: 'Figtree', fontWeight: 600,
                }}>{subject}</span>
                <span style={{ fontSize: 12, color: 'var(--text-tertiary)', fontFamily: 'Instrument Sans' }}>
                  {today}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ─── 4-stat grid ─── */}
        <div style={{
          display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 28,
          animation: visible ? 'fadeInUp 500ms 400ms var(--ease-out-expo) both' : 'none',
        }}>
          {stats.map((s, i) => (
            <div key={s.label} style={{
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 16, padding: '18px 20px',
              boxShadow: 'var(--shadow-xs)',
              transition: 'transform 280ms var(--ease-out-expo), box-shadow 280ms var(--ease-out-expo)',
              cursor: 'default',
              position: 'relative', overflow: 'hidden',
            }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = 'var(--shadow-md)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'var(--shadow-xs)'; }}
            >
              {/* Icon */}
              <div style={{
                width: 32, height: 32, borderRadius: 9, marginBottom: 12,
                background: s.bg,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: s.color,
              }}>
                <Icon name={s.icon} size={15}/>
              </div>

              {/* Value */}
              <div style={{
                fontFamily: 'JetBrains Mono', fontWeight: 600,
                fontSize: 30, lineHeight: 1, letterSpacing: '-0.02em',
                color: 'var(--text-primary)',
                transform: (s.burst && xpBurst) ? 'scale(1.18)' : 'scale(1)',
                transition: 'transform 500ms var(--ease-spring)',
              }}>
                {s.value}
              </div>

              {/* Label */}
              <div style={{ fontFamily: 'Figtree', fontWeight: 500, fontSize: 12, color: 'var(--text-tertiary)', marginTop: 5 }}>
                {s.label}
              </div>

              {/* XP burst particles */}
              {s.burst && xpBurst && (
                <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden' }}>
                  {[...Array(6)].map((_, pi) => (
                    <div key={pi} style={{
                      position: 'absolute',
                      top: '50%', left: '50%',
                      width: 5, height: 5, borderRadius: 999,
                      background: s.color,
                      animation: `burst${pi} 600ms var(--ease-out-expo) both`,
                    }}/>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* ─── Mood check ─── */}
        <div style={{
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 16, padding: '20px 24px',
          marginBottom: 24,
          animation: visible ? 'fadeInUp 500ms 520ms var(--ease-out-expo) both' : 'none',
        }}>
          <div style={{ fontFamily: 'Figtree', fontWeight: 600, fontSize: 14, color: 'var(--text-primary)', marginBottom: 16, textAlign: 'center' }}>
            How was your focus?
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
            {MOODS.map((m, i) => (
              <button key={i} onClick={() => setMood(i)} style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
                flex: 1, padding: '10px 4px', borderRadius: 12,
                background: mood === i ? 'var(--bg-hover)' : 'transparent',
                border: mood === i ? '1px solid var(--border-strong)' : '1px solid var(--border-subtle)',
                cursor: 'pointer',
                transition: 'all 200ms var(--ease-spring)',
                transform: mood === i ? 'translateY(-3px) scale(1.05)' : 'translateY(0) scale(1)',
              }}
                onMouseEnter={e => { if (mood !== i) { e.currentTarget.style.background = 'var(--bg-hover)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}}
                onMouseLeave={e => { if (mood !== i) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.transform = 'translateY(0)'; }}}
              >
                <span style={{
                  fontSize: 26,
                  filter: mood !== null && mood !== i ? 'grayscale(60%) opacity(0.6)' : 'none',
                  transition: 'filter 250ms',
                }}>{m.emoji}</span>
                <span style={{
                  fontSize: 10, fontFamily: 'Figtree', fontWeight: 600,
                  color: mood === i ? 'var(--text-primary)' : 'var(--text-tertiary)',
                  letterSpacing: '0.04em',
                  textTransform: 'uppercase',
                  transition: 'color 200ms',
                }}>{m.label}</span>
              </button>
            ))}
          </div>

          {mood !== null && (
            <div className="fade-in-up" style={{
              marginTop: 14, textAlign: 'center',
              fontSize: 13, color: 'var(--text-secondary)', fontFamily: 'Instrument Sans',
            }}>
              {['Keep going — tomorrow will be better.', 'Decent session. Consistency wins.', 'Nice work! Keep that energy going.', "That's what it looks like! 🔥", 'Flow state achieved. You crushed it!'][mood]}
            </div>
          )}
        </div>

        {/* ─── Actions ─── */}
        <div style={{
          display: 'flex', gap: 10,
          animation: visible ? 'fadeInUp 500ms 640ms var(--ease-out-expo) both' : 'none',
        }}>
          <button onClick={onReturn} style={{
            flex: 1, height: 48, borderRadius: 999,
            border: '1px solid var(--border-default)',
            background: 'var(--bg-surface)',
            color: 'var(--text-primary)',
            fontFamily: 'Figtree', fontWeight: 600, fontSize: 14,
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
            transition: 'all 200ms var(--ease-smooth)',
            boxShadow: 'var(--shadow-xs)',
          }}
            onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg-hover)'; e.currentTarget.style.borderColor = 'var(--border-strong)'; e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = 'var(--shadow-sm)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'var(--bg-surface)'; e.currentTarget.style.borderColor = 'var(--border-default)'; e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'var(--shadow-xs)'; }}
          >
            <Icon name="rooms" size={15}/> Return to Rooms
          </button>

          <button onClick={onDashboard} style={{
            flex: 1, height: 48, borderRadius: 999,
            background: 'var(--text-primary)', color: '#fff',
            fontFamily: 'Figtree', fontWeight: 600, fontSize: 14,
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
            transition: 'all 200ms var(--ease-smooth)',
            boxShadow: 'var(--shadow-sm)',
          }}
            onMouseEnter={e => { e.currentTarget.style.background = '#1C2140'; e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = 'var(--shadow-md)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'var(--text-primary)'; e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'var(--shadow-sm)'; }}
          >
            <Icon name="home" size={15}/> Go to Dashboard
          </button>
        </div>
      </div>

      {/* ─── Extra keyframes for checkmark + burst ─── */}
      <style>{`
        @keyframes checkIn {
          0%   { transform: scale(0.4) rotate(-8deg); opacity: 0; }
          60%  { transform: scale(1.12) rotate(2deg); opacity: 1; }
          100% { transform: scale(1) rotate(0deg); opacity: 1; }
        }
        ${[...Array(6)].map((_, i) => {
          const angle = (i / 6) * 360;
          const dist = 24 + Math.random() * 16;
          const x = Math.cos(angle * Math.PI / 180) * dist;
          const y = Math.sin(angle * Math.PI / 180) * dist;
          return `
            @keyframes burst${i} {
              0%   { transform: translate(-50%, -50%) scale(0); opacity: 1; }
              70%  { transform: translate(calc(-50% + ${x}px), calc(-50% + ${y}px)) scale(1); opacity: 1; }
              100% { transform: translate(calc(-50% + ${x * 1.4}px), calc(-50% + ${y * 1.4}px)) scale(0); opacity: 0; }
            }
          `;
        }).join('')}
      `}</style>
    </div>
  );
};

window.SessionSummary = SessionSummary;
