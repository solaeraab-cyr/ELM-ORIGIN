'use client';

import { use, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Avatar, Icon } from '@/components/primitives';

const fmt = (s: number) =>
  `${String(Math.floor(s / 3600)).padStart(2, '0')}:${String(Math.floor((s % 3600) / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

type AgendaItem = { id: number; label: string; done: boolean };
type Note = { id: number; ts: number; text: string };
type Milestone = { id: number; label: string; stamped?: number };

function MediaBtn({ icon, active, danger, onClick }: { icon: string; active?: boolean; danger?: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{
        width: 44, height: 44, borderRadius: 12, fontSize: 17,
        background: active ? 'var(--gradient-brand)' : (danger ? 'rgba(239,68,68,0.12)' : 'var(--bg-base)'),
        color: active ? '#fff' : (danger ? '#ef4444' : 'var(--text-secondary)'),
        border: '1px solid ' + (active ? 'transparent' : (danger ? 'rgba(239,68,68,0.25)' : 'var(--border-default)')),
        cursor: 'pointer',
      }}
    >{icon}</button>
  );
}

function PostSessionScreen({ onDone }: { onDone: () => void }) {
  const [animatedEarnings, setAnimatedEarnings] = useState(0);
  const target = 849;
  const [sentiment, setSentiment] = useState<string | null>(null);

  useEffect(() => {
    const start = performance.now();
    const dur = 1200;
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / dur);
      const eased = 1 - Math.pow(1 - t, 3);
      setAnimatedEarnings(Math.round(target * eased));
      if (t < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, []);

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-base)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 40 }}>
      <div style={{ maxWidth: 520, textAlign: 'center', width: '100%' }}>
        <div style={{ width: 80, height: 80, margin: '0 auto 24px', borderRadius: 999, background: 'var(--gradient-brand)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon name="check" size={36} />
        </div>
        <h1 style={{ fontFamily: 'Fraunces, serif', fontStyle: 'italic', fontSize: 38, fontWeight: 700, letterSpacing: '-0.02em', marginBottom: 12 }}>Session complete.</h1>
        <p style={{ fontSize: 15, color: 'var(--text-secondary)', marginBottom: 28 }}>You earned</p>
        <div style={{ fontFamily: 'Fraunces, serif', fontSize: 72, fontWeight: 700, color: 'var(--mint-600)', marginBottom: 32, letterSpacing: '-0.03em' }}>
          +₹{animatedEarnings}
        </div>
        <div style={{ marginBottom: 32 }}>
          <div style={{ fontSize: 13, color: 'var(--text-tertiary)', marginBottom: 12 }}>How did it go?</div>
          <div style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap' }}>
            {[['Great', '🤩'], ['Good', '🙂'], ['OK', '😐'], ['Tough', '😬']].map(([label, emoji]) => (
              <button
                key={label}
                onClick={() => setSentiment(label)}
                style={{
                  height: 42, padding: '0 18px', borderRadius: 999, fontSize: 13, fontWeight: 500,
                  background: sentiment === label ? 'var(--text-primary)' : 'var(--bg-surface)',
                  color: sentiment === label ? '#fff' : 'var(--text-secondary)',
                  border: `1px solid ${sentiment === label ? 'var(--text-primary)' : 'var(--border-default)'}`,
                  display: 'inline-flex', alignItems: 'center', gap: 6,
                }}
              >{emoji} {label}</button>
            ))}
          </div>
        </div>
        <button onClick={onDone} style={{ height: 48, padding: '0 32px', borderRadius: 999, background: 'var(--gradient-brand)', color: '#fff', fontSize: 15, fontWeight: 600 }}>Done</button>
      </div>
    </div>
  );
}

export default function MentorLivePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();

  const [elapsed, setElapsed] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isCameraOff, setIsCameraOff] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [askEnd, setAskEnd] = useState(false);
  const [ended, setEnded] = useState(false);

  // PIP drag state
  const [pip, setPip] = useState({ x: 24, y: 80 });
  const dragRef = useRef<{ down: boolean; ox: number; oy: number; startX: number; startY: number }>({ down: false, ox: 0, oy: 0, startX: 0, startY: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  const onPipMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    dragRef.current = { down: true, ox: e.clientX, oy: e.clientY, startX: pip.x, startY: pip.y };
  };
  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (!dragRef.current.down) return;
      const dx = e.clientX - dragRef.current.ox;
      const dy = e.clientY - dragRef.current.oy;
      const rect = containerRef.current?.getBoundingClientRect();
      const maxX = (rect?.width || 1000) - 200 - 24;
      const maxY = (rect?.height || 600) - 130 - 80;
      setPip({
        x: Math.max(8, Math.min(maxX, dragRef.current.startX + dx)),
        y: Math.max(72, Math.min(maxY, dragRef.current.startY + dy)),
      });
    };
    const onUp = () => { dragRef.current.down = false; };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    return () => { window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp); };
  }, []);

  // Timer
  useEffect(() => {
    const t = setInterval(() => setElapsed(s => s + 1), 1000);
    return () => clearInterval(t);
  }, []);

  // Agenda
  const [agendaOpen, setAgendaOpen] = useState(true);
  const [agenda, setAgenda] = useState<AgendaItem[]>([
    { id: 1, label: 'Walk through last week\'s assignment', done: false },
    { id: 2, label: 'Intro to DataFrame groupby + merge', done: false },
    { id: 3, label: 'Pandas merge vs join (worked examples)', done: false },
    { id: 4, label: 'Q&A and next-week plan', done: false },
  ]);

  // Private notes
  const [notes, setNotes] = useState('');
  const [quickNotes, setQuickNotes] = useState<Note[]>([]);
  const [quickInput, setQuickInput] = useState('');
  const addQuickNote = () => {
    if (!quickInput.trim()) return;
    setQuickNotes(n => [...n, { id: Date.now(), ts: elapsed, text: quickInput }]);
    setQuickInput('');
  };

  // Milestones
  const [milestones, setMilestones] = useState<Milestone[]>([
    { id: 1, label: 'Started warmup' },
    { id: 2, label: 'Introduced new concept' },
    { id: 3, label: 'Student attempted alone' },
    { id: 4, label: 'Solved together' },
    { id: 5, label: 'Next steps assigned' },
  ]);
  const stampMilestone = (id: number) => {
    setMilestones(ms => ms.map(m => m.id === id ? { ...m, stamped: m.stamped ?? elapsed } : m));
  };

  if (ended) return <PostSessionScreen onDone={() => router.push('/mentor/dashboard')} />;

  const student = { name: 'Arjun Patel', email: 'arjun@elmorigin.com', subject: 'Pandas DataFrames intro' };

  return (
    <div ref={containerRef} style={{ position: 'fixed', inset: 0, background: 'var(--bg-base)', display: 'flex', flexDirection: 'column' }}>
      {/* Top bar */}
      <div style={{ height: 56, padding: '0 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--bg-surface)', borderBottom: '1px solid var(--border-subtle)' }}>
        <button onClick={() => setAskEnd(true)} style={{ height: 32, padding: '0 12px', borderRadius: 8, background: 'transparent', color: 'var(--text-secondary)', fontSize: 13, fontWeight: 500, display: 'flex', alignItems: 'center', gap: 4 }}>
          <Icon name="chevronL" size={13} /> Leave
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontFamily: 'Fraunces, serif', fontSize: 15, fontWeight: 700 }}>Mentor session · {id}</span>
          <span style={{ padding: '3px 10px', borderRadius: 999, background: 'rgba(16,185,129,0.10)', color: 'var(--mint-600)', fontSize: 11, fontWeight: 600 }}>● Live</span>
        </div>
        <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 16, fontWeight: 700, color: 'var(--brand-600)' }}>{fmt(elapsed)}</div>
      </div>

      {/* Body */}
      <div style={{ flex: 1, display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 320px)', overflow: 'hidden' }}>
        {/* Video stage */}
        <div style={{ position: 'relative', background: '#0E1228', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
          {/* Student video placeholder */}
          <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 18, color: 'rgba(255,255,255,0.85)' }}>
            <Avatar name={student.name} size={140} />
            <div style={{ fontFamily: 'Fraunces, serif', fontWeight: 600, fontSize: 24 }}>{student.name}</div>
            <div style={{ fontSize: 13, opacity: 0.7 }}>Student · Camera on</div>
          </div>

          {/* PIP (mentor) */}
          <div
            onMouseDown={onPipMouseDown}
            style={{
              position: 'absolute', left: pip.x, top: pip.y,
              width: 200, height: 130, borderRadius: 14,
              background: 'rgba(13,23,87,0.85)', border: '2px solid rgba(255,255,255,0.12)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 6,
              cursor: 'grab', userSelect: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.35)',
            }}
          >
            <Avatar name="Dr. Priya Iyer" size={48} />
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.9)', fontWeight: 600 }}>You · {isCameraOff ? 'Camera off' : 'Camera on'}</div>
            <div style={{ position: 'absolute', top: 6, left: 6, fontSize: 9, padding: '2px 6px', background: 'rgba(255,255,255,0.15)', borderRadius: 4, color: '#fff', fontWeight: 700 }}>MENTOR</div>
          </div>
        </div>

        {/* Right panel */}
        <div style={{ background: 'var(--bg-surface)', borderLeft: '1px solid var(--border-subtle)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          {/* Student info */}
          <div style={{ padding: 18, borderBottom: '1px solid var(--border-subtle)' }}>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.06em', color: 'var(--text-tertiary)', textTransform: 'uppercase', marginBottom: 8 }}>Student</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <Avatar name={student.name} size={40} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 600, fontSize: 14 }}>{student.name}</div>
                <div style={{ fontSize: 12, color: 'var(--text-tertiary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{student.email}</div>
              </div>
            </div>
            <div style={{ marginTop: 10, padding: '8px 12px', background: 'var(--bg-hover)', borderRadius: 8, fontSize: 12 }}>
              <strong>Topic:</strong> {student.subject}
            </div>
          </div>

          <div style={{ flex: 1, overflowY: 'auto', padding: 18, display: 'flex', flexDirection: 'column', gap: 18 }}>
            {/* Agenda */}
            <div>
              <button onClick={() => setAgendaOpen(o => !o)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', padding: 0, background: 'transparent', marginBottom: 10 }}>
                <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.06em', color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>Agenda</span>
                <Icon name="chevronD" size={14} color="var(--text-tertiary)" />
              </button>
              {agendaOpen && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {agenda.map(item => (
                    <label key={item.id} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, padding: '8px 10px', background: 'var(--bg-base)', borderRadius: 8, fontSize: 13, cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={item.done}
                        onChange={() => setAgenda(a => a.map(x => x.id === item.id ? { ...x, done: !x.done } : x))}
                        style={{ marginTop: 2 }}
                      />
                      <span style={{ flex: 1, textDecoration: item.done ? 'line-through' : 'none', color: item.done ? 'var(--text-tertiary)' : 'var(--text-primary)' }}>{item.label}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>

            {/* Milestones */}
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.06em', color: 'var(--text-tertiary)', textTransform: 'uppercase', marginBottom: 10 }}>Milestones</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {milestones.map(m => (
                  <button
                    key={m.id}
                    onClick={() => stampMilestone(m.id)}
                    disabled={m.stamped !== undefined}
                    style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8,
                      padding: '8px 12px', borderRadius: 8,
                      background: m.stamped !== undefined ? 'var(--bg-hover)' : 'rgba(79,70,229,0.06)',
                      border: `1px solid ${m.stamped !== undefined ? 'var(--border-subtle)' : 'rgba(79,70,229,0.25)'}`,
                      opacity: m.stamped !== undefined ? 0.65 : 1,
                      fontSize: 13, cursor: m.stamped !== undefined ? 'default' : 'pointer',
                      transition: 'all 200ms',
                    }}
                  >
                    <span style={{ color: m.stamped !== undefined ? 'var(--text-tertiary)' : 'var(--brand-600)', fontWeight: 500 }}>{m.label}</span>
                    {m.stamped !== undefined && <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, color: 'var(--text-tertiary)' }}>{fmt(m.stamped)}</span>}
                  </button>
                ))}
              </div>
            </div>

            {/* Private notes */}
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.06em', color: 'var(--text-tertiary)', textTransform: 'uppercase', marginBottom: 10 }}>Private notes</div>
              <textarea
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="Anything you want to remember…"
                style={{ width: '100%', minHeight: 80, padding: 10, background: 'var(--bg-base)', border: '1px solid var(--border-default)', borderRadius: 8, fontSize: 12, lineHeight: 1.6, resize: 'vertical', outline: 'none', marginBottom: 10 }}
              />
              <div style={{ display: 'flex', gap: 6 }}>
                <input
                  value={quickInput}
                  onChange={e => setQuickInput(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') addQuickNote(); }}
                  placeholder="Quick note…"
                  style={{ flex: 1, height: 32, padding: '0 10px', background: 'var(--bg-base)', border: '1px solid var(--border-default)', borderRadius: 8, fontSize: 12, color: 'var(--text-primary)', outline: 'none' }}
                />
                <button onClick={addQuickNote} style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--gradient-brand)', color: '#fff' }}>+</button>
              </div>
              {quickNotes.length > 0 && (
                <div style={{ marginTop: 10, display: 'flex', flexDirection: 'column', gap: 4 }}>
                  {quickNotes.map(n => (
                    <div key={n.id} style={{ fontSize: 11, color: 'var(--text-secondary)' }}>
                      <span style={{ fontFamily: 'JetBrains Mono, monospace', color: 'var(--brand-500)', marginRight: 6 }}>{fmt(n.ts)}</span>
                      {n.text}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Media bar */}
      <div style={{ minHeight: 64, padding: '8px 16px', background: 'var(--bg-surface)', borderTop: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, flexWrap: 'wrap' }}>
        <MediaBtn onClick={() => setIsMuted(!isMuted)} icon={isMuted ? '🔇' : '🎙'} active={!isMuted} danger={isMuted} />
        <MediaBtn onClick={() => setIsCameraOff(!isCameraOff)} icon="📷" active={!isCameraOff} danger={isCameraOff} />
        <MediaBtn onClick={() => setIsSharing(!isSharing)} icon="🖥" active={isSharing} />
        <button onClick={() => setAskEnd(true)} style={{ height: 44, padding: '0 18px', borderRadius: 12, background: '#ef4444', color: '#fff', fontSize: 13, fontWeight: 600 }}>End Session</button>
      </div>

      {askEnd && (
        <div onClick={() => setAskEnd(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(7,10,24,0.55)', backdropFilter: 'blur(6px)', zIndex: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
          <div onClick={e => e.stopPropagation()} style={{ width: 460, maxWidth: '100%', padding: 28, background: 'var(--bg-surface)', borderRadius: 18, boxShadow: 'var(--shadow-xl)', border: '1px solid var(--border-subtle)' }}>
            <h3 style={{ fontFamily: 'Fraunces, serif', fontStyle: 'italic', fontSize: 22, fontWeight: 700, marginBottom: 10 }}>End this session?</h3>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 18 }}>{student.name} will get a notification and you&apos;ll see your earnings breakdown.</p>
            <div style={{ background: 'var(--bg-hover)', borderRadius: 12, padding: 14, marginBottom: 18, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
              <div><div style={{ fontSize: 10, color: 'var(--text-tertiary)' }}>Elapsed</div><div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 16, fontWeight: 700 }}>{fmt(elapsed)}</div></div>
              <div><div style={{ fontSize: 10, color: 'var(--text-tertiary)' }}>Milestones</div><div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 16, fontWeight: 700 }}>{milestones.filter(m => m.stamped !== undefined).length}</div></div>
              <div><div style={{ fontSize: 10, color: 'var(--text-tertiary)' }}>Earnings</div><div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 16, fontWeight: 700, color: 'var(--mint-600)' }}>₹849</div></div>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={() => setAskEnd(false)} style={{ flex: 1, height: 44, padding: '0 16px', borderRadius: 999, background: 'var(--bg-hover)', border: '1px solid var(--border-default)', fontSize: 13, fontWeight: 500 }}>Continue session</button>
              <button
                onClick={() => { setAskEnd(false); setEnded(true); }}
                style={{ flex: 1, height: 44, padding: '0 16px', borderRadius: 999, background: 'var(--gradient-brand)', color: '#fff', fontSize: 13, fontWeight: 600 }}
              >End & see summary</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
