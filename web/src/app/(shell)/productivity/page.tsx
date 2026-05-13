'use client';

import { useState, useEffect, useRef } from 'react';
import Icon from '@/components/primitives/Icon';

// ── Focus Timer ──────────────────────────────────────────────────
const PHASES = [
  { id: 'focus', label: 'FOCUS', duration: 25 * 60, color: 'var(--brand-500)' },
  { id: 'short', label: 'SHORT BREAK', duration: 5 * 60, color: 'var(--mint-500)' },
  { id: 'long', label: 'LONG BREAK', duration: 15 * 60, color: 'var(--amber-500)' },
];

function TimerRing({ secondsLeft, totalSeconds, color }: { secondsLeft: number; totalSeconds: number; color: string }) {
  const R = 90;
  const C = 2 * Math.PI * R;
  const progress = secondsLeft / totalSeconds;
  const offset = C * (1 - progress);
  const mins = Math.floor(secondsLeft / 60).toString().padStart(2, '0');
  const secs = (secondsLeft % 60).toString().padStart(2, '0');
  return (
    <svg viewBox="0 0 220 220" width="220" height="220" style={{ display: 'block', margin: '0 auto' }}>
      <circle cx="110" cy="110" r={R} fill="none" stroke="var(--border-subtle)" strokeWidth="8" />
      <circle cx="110" cy="110" r={R} fill="none" stroke={color} strokeWidth="8"
        strokeDasharray={C} strokeDashoffset={offset} strokeLinecap="round"
        style={{ transformOrigin: '110px 110px', transform: 'rotate(-90deg)', transition: 'stroke-dashoffset 800ms linear, stroke 400ms' }} />
      <text x="110" y="100" textAnchor="middle" style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 42, fontWeight: 700, fill: 'var(--text-primary)' }}>
        {mins}:{secs}
      </text>
      <text x="110" y="126" textAnchor="middle" style={{ fontFamily: 'Inter, system-ui', fontSize: 12, fill: 'var(--text-tertiary)' }}>
        remaining
      </text>
    </svg>
  );
}

function FocusTab() {
  const [phaseIdx, setPhaseIdx] = useState(0);
  const [running, setRunning] = useState(false);
  const [secsLeft, setSecsLeft] = useState(PHASES[0].duration);
  const [pomos, setPomos] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const phase = PHASES[phaseIdx];

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        setSecsLeft(s => {
          if (s <= 1) {
            clearInterval(intervalRef.current!);
            setRunning(false);
            if (phase.id === 'focus') setPomos(p => p + 1);
            return 0;
          }
          return s - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [running, phase.id]);

  const selectPhase = (i: number) => {
    setPhaseIdx(i);
    setRunning(false);
    setSecsLeft(PHASES[i].duration);
  };

  const reset = () => { setRunning(false); setSecsLeft(phase.duration); };

  return (
    <div style={{ maxWidth: 520, margin: '0 auto', textAlign: 'center', paddingTop: 20 }}>
      {/* Phase buttons */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginBottom: 36 }}>
        {PHASES.map((p, i) => (
          <button key={p.id} onClick={() => selectPhase(i)} style={{
            padding: '8px 18px', borderRadius: 999, fontSize: 12, fontWeight: 700, letterSpacing: '0.06em',
            background: phaseIdx === i ? phase.color : 'var(--bg-surface)',
            color: phaseIdx === i ? '#fff' : 'var(--text-secondary)',
            border: `1px solid ${phaseIdx === i ? phase.color : 'var(--border-subtle)'}`,
            transition: 'all 200ms',
          }}>{p.label}</button>
        ))}
      </div>

      <TimerRing secondsLeft={secsLeft} totalSeconds={phase.duration} color={phase.color} />

      {/* Pomodoro dots */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: 8, margin: '24px 0' }}>
        {[0, 1, 2, 3].map(i => (
          <div key={i} style={{ width: 10, height: 10, borderRadius: 999, background: i < (pomos % 4) ? phase.color : 'var(--border-default)', transition: 'background 300ms' }} />
        ))}
      </div>

      {/* Controls */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: 14, alignItems: 'center' }}>
        <button onClick={reset} style={{ width: 44, height: 44, borderRadius: 999, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', color: 'var(--text-secondary)' }}>
          <Icon name="refresh" size={16} />
        </button>
        <button onClick={() => setRunning(r => !r)} style={{
          width: 72, height: 72, borderRadius: 999,
          background: running ? 'var(--bg-surface)' : phase.color,
          color: running ? 'var(--text-primary)' : '#fff',
          border: `2px solid ${running ? 'var(--border-default)' : phase.color}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: running ? 'none' : `0 8px 24px -8px ${phase.color}88`,
          transition: 'all 200ms', fontSize: 22,
        }}>
          {running ? '⏸' : '▶'}
        </button>
        <button onClick={() => { const next = (phaseIdx + 1) % PHASES.length; selectPhase(next); }} style={{ width: 44, height: 44, borderRadius: 999, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', color: 'var(--text-secondary)' }}>
          <Icon name="chevronR" size={16} />
        </button>
      </div>

      <p style={{ marginTop: 28, fontSize: 13, color: 'var(--text-tertiary)' }}>
        Completed today: <strong style={{ color: 'var(--text-primary)' }}>{pomos}</strong> pomodoro{pomos !== 1 ? 's' : ''}
      </p>
    </div>
  );
}

// ── Notes Tab ────────────────────────────────────────────────────
const NOTES_SEED = [
  { id: 1, title: 'Linear Algebra Notes', body: 'Eigenvectors are vectors that only scale under a linear transformation. λv = Av...', updated: '2h ago' },
  { id: 2, title: 'JEE Physics — Rotational', body: 'Angular momentum L = Iω. Torque = dL/dt. For conservation: no net external torque.', updated: 'yesterday' },
  { id: 3, title: 'React Performance', body: 'useMemo for expensive calculations, useCallback for stable function refs, React.memo for component memoization.', updated: '3d ago' },
];

function NotesTab() {
  const [notes, setNotes] = useState(NOTES_SEED);
  const [activeId, setActiveId] = useState(1);
  const active = notes.find(n => n.id === activeId) || notes[0];

  const updateBody = (body: string) => setNotes(ns => ns.map(n => n.id === activeId ? { ...n, body, updated: 'now' } : n));

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: 0, height: 560, border: '1px solid var(--border-subtle)', borderRadius: 18, overflow: 'hidden' }}>
      {/* List */}
      <div style={{ borderRight: '1px solid var(--border-subtle)', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: 13, fontWeight: 600 }}>Notes</span>
          <button onClick={() => {
            const id = Date.now();
            setNotes(ns => [{ id, title: 'New Note', body: '', updated: 'now' }, ...ns]);
            setActiveId(id);
          }} style={{ width: 26, height: 26, borderRadius: 6, background: 'var(--brand-500)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, lineHeight: 1 }}>+</button>
        </div>
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {notes.map(n => (
            <button key={n.id} onClick={() => setActiveId(n.id)} style={{
              width: '100%', padding: '14px 16px', textAlign: 'left',
              background: activeId === n.id ? 'var(--bg-hover)' : 'transparent',
              borderBottom: '1px solid var(--border-subtle)',
              borderLeft: activeId === n.id ? '3px solid var(--brand-500)' : '3px solid transparent',
            }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>{n.title}</div>
              <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>{n.updated}</div>
            </button>
          ))}
        </div>
      </div>
      {/* Editor */}
      <div style={{ display: 'flex', flexDirection: 'column', background: 'var(--bg-surface)' }}>
        <div style={{ padding: '12px 20px', borderBottom: '1px solid var(--border-subtle)' }}>
          <input value={active?.title || ''} onChange={e => setNotes(ns => ns.map(n => n.id === activeId ? { ...n, title: e.target.value } : n))}
            style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-primary)', background: 'transparent', border: 'none', outline: 'none', width: '100%' }} />
        </div>
        <textarea value={active?.body || ''} onChange={e => updateBody(e.target.value)}
          placeholder="Start writing…"
          style={{ flex: 1, padding: '16px 20px', fontSize: 14, lineHeight: 1.7, color: 'var(--text-primary)', background: 'transparent', border: 'none', outline: 'none', resize: 'none', fontFamily: 'Inter, system-ui' }} />
      </div>
    </div>
  );
}

// ── Planner Tab ──────────────────────────────────────────────────
const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const HOURS = Array.from({ length: 8 }, (_, i) => `${9 + i}:00`);
const EVENTS: Record<string, { label: string; color: string; row: number; span: number }[]> = {
  Mon: [{ label: 'Linear Algebra', color: 'var(--brand-500)', row: 0, span: 2 }],
  Tue: [{ label: 'React Patterns', color: 'var(--mint-500)', row: 2, span: 1 }, { label: 'Physics Sprint', color: 'var(--amber-500)', row: 5, span: 2 }],
  Wed: [{ label: 'Mentor Session', color: '#e879f9', row: 1, span: 1 }],
  Thu: [{ label: 'Deep Work Block', color: 'var(--brand-400)', row: 0, span: 3 }],
  Fri: [{ label: 'Organic Chem', color: '#f43f5e', row: 3, span: 2 }],
  Sat: [{ label: 'Mock Test', color: 'var(--amber-600)', row: 0, span: 4 }],
  Sun: [],
};

function PlannerTab() {
  return (
    <div style={{ overflowX: 'auto' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '60px repeat(7, 1fr)', minWidth: 700 }}>
        {/* Header */}
        <div style={{ padding: '12px 0', borderBottom: '1px solid var(--border-subtle)' }} />
        {DAYS.map(d => (
          <div key={d} style={{ padding: '12px 8px', textAlign: 'center', fontSize: 12, fontWeight: 600, color: 'var(--text-tertiary)', borderBottom: '1px solid var(--border-subtle)' }}>{d}</div>
        ))}
        {/* Rows */}
        {HOURS.map((h, rowIdx) => (
          <>
            <div key={`h-${h}`} style={{ padding: '0 8px', height: 60, display: 'flex', alignItems: 'flex-start', paddingTop: 8, fontSize: 11, color: 'var(--text-tertiary)', fontFamily: 'JetBrains Mono, monospace', borderBottom: '1px solid var(--border-subtle)' }}>{h}</div>
            {DAYS.map(d => {
              const event = EVENTS[d]?.find(e => e.row === rowIdx);
              return (
                <div key={`${d}-${h}`} style={{ height: 60, borderBottom: '1px solid var(--border-subtle)', borderLeft: '1px solid var(--border-subtle)', padding: 4, position: 'relative' }}>
                  {event && (
                    <div style={{
                      position: 'absolute', left: 4, right: 4, top: 4,
                      height: event.span * 60 - 8,
                      background: `${event.color}22`,
                      border: `1px solid ${event.color}66`,
                      borderRadius: 8, padding: '4px 8px',
                      fontSize: 11, fontWeight: 600, color: event.color,
                      overflow: 'hidden', zIndex: 1,
                    }}>{event.label}</div>
                  )}
                </div>
              );
            })}
          </>
        ))}
      </div>
    </div>
  );
}

// ── Analytics Tab ────────────────────────────────────────────────
const WEEK_DATA = [
  { day: 'Mon', hours: 3.5 }, { day: 'Tue', hours: 2 }, { day: 'Wed', hours: 4 },
  { day: 'Thu', hours: 1.5 }, { day: 'Fri', hours: 3 }, { day: 'Sat', hours: 5 }, { day: 'Sun', hours: 2.5 },
];
const SUBJECTS = [
  { name: 'Mathematics', pct: 38, color: 'var(--brand-500)' },
  { name: 'CS', pct: 28, color: 'var(--mint-500)' },
  { name: 'Physics', pct: 22, color: 'var(--amber-500)' },
  { name: 'Other', pct: 12, color: 'var(--text-tertiary)' },
];

function Donut({ data }: { data: typeof SUBJECTS }) {
  const R = 50; const C = 2 * Math.PI * R;
  let cumulative = 0;
  return (
    <svg viewBox="0 0 120 120" width="120" height="120">
      {data.map((s, i) => {
        const dashLen = (s.pct / 100) * C;
        const offset = C - cumulative * C / 100;
        cumulative += s.pct;
        return (
          <circle key={i} cx="60" cy="60" r={R} fill="none" stroke={s.color} strokeWidth="18"
            strokeDasharray={`${dashLen} ${C - dashLen}`} strokeDashoffset={offset}
            style={{ transformOrigin: '60px 60px', transform: 'rotate(-90deg)' }} />
        );
      })}
    </svg>
  );
}

function StreakCalendar() {
  const weeks = 22;
  const days = 7;
  const intensities = ['var(--bg-hover)', 'rgba(79,70,229,0.2)', 'rgba(79,70,229,0.4)', 'rgba(79,70,229,0.7)', 'var(--brand-500)'];
  return (
    <div style={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
      {Array.from({ length: weeks }).map((_, w) => (
        <div key={w} style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {Array.from({ length: days }).map((_, d) => {
            const intensity = Math.floor(Math.random() * 5);
            return <div key={d} style={{ width: 12, height: 12, borderRadius: 3, background: intensities[intensity] }} />;
          })}
        </div>
      ))}
    </div>
  );
}

function AnalyticsTab() {
  const maxHours = Math.max(...WEEK_DATA.map(d => d.hours));
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14 }}>
        {[['14h', 'This week'], ['21%', 'vs last week'], ['4', 'Sessions'], ['15', 'Day streak']].map(([v, l]) => (
          <div key={l} style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 14, padding: 18 }}>
            <div style={{ fontFamily: 'Fraunces, serif', fontSize: 28, fontWeight: 700, marginBottom: 4 }}>{v}</div>
            <div style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>{l}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 240px', gap: 20 }}>
        {/* Bar chart */}
        <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 16, padding: 20 }}>
          <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 20 }}>Focus hours this week</div>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, height: 140 }}>
            {WEEK_DATA.map(d => (
              <div key={d.day} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                <div style={{ width: '100%', height: Math.round((d.hours / maxHours) * 120), background: 'var(--gradient-brand)', borderRadius: '6px 6px 0 0', transition: 'height 600ms var(--ease-smooth)', minHeight: 4 }} />
                <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>{d.day}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Donut */}
        <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 16, padding: 20 }}>
          <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 16 }}>By subject</div>
          <Donut data={SUBJECTS} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 12 }}>
            {SUBJECTS.map(s => (
              <div key={s.name} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12 }}>
                <div style={{ width: 10, height: 10, borderRadius: 2, background: s.color, flexShrink: 0 }} />
                <span style={{ flex: 1, color: 'var(--text-secondary)' }}>{s.name}</span>
                <span style={{ fontFamily: 'JetBrains Mono, monospace', color: 'var(--text-tertiary)' }}>{s.pct}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Streak calendar */}
      <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 16, padding: 20 }}>
        <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 16 }}>Activity — last 22 weeks</div>
        <StreakCalendar />
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 12, fontSize: 11, color: 'var(--text-tertiary)' }}>
          <span>Less</span>
          {['var(--bg-hover)', 'rgba(79,70,229,0.2)', 'rgba(79,70,229,0.4)', 'rgba(79,70,229,0.7)', 'var(--brand-500)'].map((c, i) => (
            <div key={i} style={{ width: 12, height: 12, borderRadius: 3, background: c }} />
          ))}
          <span>More</span>
        </div>
      </div>
    </div>
  );
}

// ── Main Page ────────────────────────────────────────────────────
const TABS = ['Focus', 'Notes', 'Planner', 'Analytics'];

export default function ProductivityPage() {
  const [tab, setTab] = useState('Focus');
  return (
    <div style={{ padding: '32px 40px', maxWidth: 1100, margin: '0 auto' }}>
      <h1 style={{ fontFamily: 'Fraunces, serif', fontSize: 38, fontWeight: 700, letterSpacing: '-0.02em', marginBottom: 28 }}>Productivity</h1>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 2, background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 12, padding: 4, marginBottom: 32, width: 'fit-content' }}>
        {TABS.map(t => (
          <button key={t} onClick={() => setTab(t)} style={{
            padding: '8px 20px', borderRadius: 9, fontSize: 14, fontWeight: 500,
            background: tab === t ? 'var(--text-primary)' : 'transparent',
            color: tab === t ? '#fff' : 'var(--text-secondary)',
            transition: 'all 200ms',
          }}>{t}</button>
        ))}
      </div>

      {tab === 'Focus' && <FocusTab />}
      {tab === 'Notes' && <NotesTab />}
      {tab === 'Planner' && <PlannerTab />}
      {tab === 'Analytics' && <AnalyticsTab />}
    </div>
  );
}
