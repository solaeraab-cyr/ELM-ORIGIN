'use client';

import { useState, useEffect, useRef } from 'react';
import Icon from '@/components/primitives/Icon';
import { addTask, deleteTask, listTasksForDate, toggleTaskComplete, type PlannerTask } from '@/app/actions/planner';
import { createNote, deleteNote, listNotes, updateNote, type Note } from '@/app/actions/notes';
import { toast } from '@/lib/toast';

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
function relativeTime(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const min = Math.floor(diff / 60000);
  if (min < 1) return 'just now';
  if (min < 60) return `${min}m ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h ago`;
  const day = Math.floor(hr / 24);
  if (day === 1) return 'yesterday';
  if (day < 7) return `${day}d ago`;
  return new Date(iso).toLocaleDateString();
}

function NotesTab() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');

  // Track the values last persisted so blur handlers can skip no-op writes.
  const savedRef = useRef<{ title: string; body: string } | null>(null);

  useEffect(() => {
    listNotes()
      .then(rows => {
        setNotes(rows);
        if (rows.length > 0) {
          setActiveId(rows[0].id);
          setTitle(rows[0].title ?? '');
          setBody(rows[0].body);
          savedRef.current = { title: rows[0].title ?? '', body: rows[0].body };
        }
      })
      .catch(() => toast('Could not load notes'))
      .finally(() => setLoading(false));
  }, []);

  const active = notes.find(n => n.id === activeId) ?? null;

  const selectNote = (id: string) => {
    if (id === activeId) return;
    const n = notes.find(x => x.id === id);
    if (!n) return;
    setActiveId(id);
    setTitle(n.title ?? '');
    setBody(n.body);
    savedRef.current = { title: n.title ?? '', body: n.body };
  };

  const onNew = async () => {
    try {
      const created = await createNote();
      setNotes(prev => [created, ...prev]);
      setActiveId(created.id);
      setTitle('');
      setBody('');
      savedRef.current = { title: '', body: '' };
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Could not create note');
    }
  };

  const saveIfChanged = async (field: 'title' | 'body') => {
    if (!activeId || !savedRef.current) return;
    const next = field === 'title' ? title : body;
    if (next === savedRef.current[field]) return;
    const patch = field === 'title' ? { title: next.trim() === '' ? null : next } : { body: next };
    const now = new Date().toISOString();
    setNotes(prev =>
      prev
        .map(n => n.id === activeId ? { ...n, ...patch, updated_at: now } : n)
        .sort((a, b) => a.updated_at < b.updated_at ? 1 : -1)
    );
    savedRef.current = { ...savedRef.current, [field]: next };
    try {
      await updateNote(activeId, patch);
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Could not save note');
    }
  };

  const onDelete = async (id: string) => {
    const prev = notes;
    const wasActive = id === activeId;
    const remaining = notes.filter(n => n.id !== id);
    setNotes(remaining);
    if (wasActive) {
      const fallback = remaining[0] ?? null;
      setActiveId(fallback?.id ?? null);
      setTitle(fallback?.title ?? '');
      setBody(fallback?.body ?? '');
      savedRef.current = fallback ? { title: fallback.title ?? '', body: fallback.body } : null;
    }
    try {
      await deleteNote(id);
    } catch (err) {
      setNotes(prev);
      toast(err instanceof Error ? err.message : 'Could not delete note');
    }
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: 0, height: 560, border: '1px solid var(--border-subtle)', borderRadius: 18, overflow: 'hidden' }}>
      {/* List */}
      <div style={{ borderRight: '1px solid var(--border-subtle)', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: 13, fontWeight: 600 }}>Notes</span>
          <button
            onClick={onNew}
            title="New note"
            style={{ width: 26, height: 26, borderRadius: 6, background: 'var(--brand-500)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
          >
            <Icon name="plus" size={14} />
          </button>
        </div>
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {loading ? (
            <div style={{ padding: 24, textAlign: 'center', color: 'var(--text-tertiary)', fontSize: 13 }}>Loading…</div>
          ) : notes.length === 0 ? (
            <div style={{ padding: 24, textAlign: 'center', color: 'var(--text-tertiary)', fontSize: 13 }}>
              No notes yet — click <strong style={{ color: 'var(--text-secondary)' }}>+</strong> to add one
            </div>
          ) : (
            notes.map(n => {
              const isActive = activeId === n.id;
              const displayTitle = (isActive ? title : n.title)?.trim() || 'Untitled';
              const preview = (isActive ? body : n.body).split('\n')[0].slice(0, 60);
              return (
                <div
                  key={n.id}
                  onClick={() => selectNote(n.id)}
                  style={{
                    position: 'relative',
                    padding: '14px 40px 14px 16px', cursor: 'pointer',
                    background: isActive ? 'var(--bg-hover)' : 'transparent',
                    borderBottom: '1px solid var(--border-subtle)',
                    borderLeft: isActive ? '3px solid var(--brand-500)' : '3px solid transparent',
                    transition: 'background 160ms',
                  }}
                  onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = 'var(--bg-hover)'; }}
                  onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = 'transparent'; }}
                >
                  <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {displayTitle}
                  </div>
                  {preview && (
                    <div style={{ fontSize: 11, color: 'var(--text-tertiary)', marginBottom: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {preview}
                    </div>
                  )}
                  <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>{relativeTime(n.updated_at)}</div>
                  <button
                    onClick={e => { e.stopPropagation(); onDelete(n.id); }}
                    aria-label="Delete note"
                    style={{
                      position: 'absolute', top: 10, right: 10,
                      width: 24, height: 24, borderRadius: 6,
                      background: 'transparent', color: 'var(--text-tertiary)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      cursor: 'pointer', transition: 'all 160ms',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg-surface)'; e.currentTarget.style.color = 'var(--danger-500)'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-tertiary)'; }}
                  >
                    <Icon name="x" size={12} />
                  </button>
                </div>
              );
            })
          )}
        </div>
      </div>
      {/* Editor */}
      <div style={{ display: 'flex', flexDirection: 'column', background: 'var(--bg-surface)' }}>
        {active ? (
          <>
            <div style={{ padding: '12px 20px', borderBottom: '1px solid var(--border-subtle)' }}>
              <input
                value={title}
                onChange={e => setTitle(e.target.value)}
                onBlur={() => saveIfChanged('title')}
                placeholder="Untitled"
                style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-primary)', background: 'transparent', border: 'none', outline: 'none', width: '100%' }}
              />
            </div>
            <textarea
              value={body}
              onChange={e => setBody(e.target.value)}
              onBlur={() => saveIfChanged('body')}
              placeholder="Start writing…"
              style={{ flex: 1, padding: '16px 20px', fontSize: 14, lineHeight: 1.7, color: 'var(--text-primary)', background: 'transparent', border: 'none', outline: 'none', resize: 'none', fontFamily: 'Inter, system-ui' }}
            />
          </>
        ) : (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 12, color: 'var(--text-tertiary)' }}>
            <Icon name="attach" size={24} />
            <div style={{ fontSize: 14 }}>Select a note or create a new one</div>
            <button
              onClick={onNew}
              style={{ padding: '8px 16px', borderRadius: 999, background: 'var(--brand-500)', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}
            >+ New note</button>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Planner Tab ──────────────────────────────────────────────────
function todayISO() {
  const d = new Date();
  const tz = d.getTimezoneOffset();
  return new Date(d.getTime() - tz * 60_000).toISOString().slice(0, 10);
}

function PlannerTab() {
  const today = todayISO();
  const [tasks, setTasks] = useState<PlannerTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState('');
  const [dueDate, setDueDate] = useState(today);
  const [dueTime, setDueTime] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    listTasksForDate(today)
      .then(setTasks)
      .catch(() => toast('Could not load tasks'))
      .finally(() => setLoading(false));
  }, [today]);

  const onAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || submitting) return;
    setSubmitting(true);
    try {
      const created = await addTask({
        title: title.trim(),
        due_date: dueDate,
        due_time: dueTime || null,
      });
      if (created.due_date === today) {
        setTasks(prev => [...prev, created].sort((a, b) => {
          if (a.due_time === b.due_time) return 0;
          if (!a.due_time) return 1;
          if (!b.due_time) return -1;
          return a.due_time < b.due_time ? -1 : 1;
        }));
      }
      setTitle('');
      setDueTime('');
      setDueDate(today);
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Could not add task');
    } finally {
      setSubmitting(false);
    }
  };

  const onToggle = async (task: PlannerTask) => {
    const next = !task.is_complete;
    setTasks(prev => prev.map(t => t.id === task.id ? { ...t, is_complete: next } : t));
    try {
      await toggleTaskComplete(task.id, next);
    } catch (err) {
      setTasks(prev => prev.map(t => t.id === task.id ? { ...t, is_complete: !next } : t));
      toast(err instanceof Error ? err.message : 'Could not update task');
    }
  };

  const onDelete = async (task: PlannerTask) => {
    const prev = tasks;
    setTasks(p => p.filter(t => t.id !== task.id));
    try {
      await deleteTask(task.id);
    } catch (err) {
      setTasks(prev);
      toast(err instanceof Error ? err.message : 'Could not delete task');
    }
  };

  return (
    <div style={{ maxWidth: 640, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Add task */}
      <form
        onSubmit={onAdd}
        style={{
          background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)',
          borderRadius: 16, padding: 18, display: 'flex', flexDirection: 'column', gap: 12,
        }}
      >
        <input
          value={title}
          onChange={e => setTitle(e.target.value)}
          placeholder="What needs doing?"
          style={{
            background: 'transparent', border: 'none', outline: 'none',
            fontSize: 15, fontWeight: 500, color: 'var(--text-primary)',
            padding: '4px 2px',
          }}
        />
        <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--text-tertiary)' }}>
            <Icon name="calendar" size={13} />
            <input
              type="date"
              value={dueDate}
              onChange={e => setDueDate(e.target.value)}
              style={{ border: '1px solid var(--border-subtle)', borderRadius: 8, padding: '4px 8px', fontSize: 12, background: 'var(--bg-base)', color: 'var(--text-primary)', fontFamily: 'inherit' }}
            />
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--text-tertiary)' }}>
            <Icon name="focus" size={13} />
            <input
              type="time"
              value={dueTime}
              onChange={e => setDueTime(e.target.value)}
              style={{ border: '1px solid var(--border-subtle)', borderRadius: 8, padding: '4px 8px', fontSize: 12, background: 'var(--bg-base)', color: 'var(--text-primary)', fontFamily: 'inherit' }}
            />
          </label>
          <button
            type="submit"
            disabled={!title.trim() || submitting}
            style={{
              marginLeft: 'auto', padding: '7px 18px', borderRadius: 999,
              background: title.trim() && !submitting ? 'var(--gradient-brand)' : 'var(--bg-hover)',
              color: title.trim() && !submitting ? '#fff' : 'var(--text-tertiary)',
              fontSize: 13, fontWeight: 600,
              cursor: title.trim() && !submitting ? 'pointer' : 'not-allowed',
              transition: 'opacity 160ms',
            }}
          >{submitting ? 'Adding…' : 'Add task'}</button>
        </div>
      </form>

      {/* Today's tasks */}
      <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 16, padding: 18 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 12, letterSpacing: '0.04em', textTransform: 'uppercase' }}>Today</div>
        {loading ? (
          <div style={{ padding: 20, textAlign: 'center', color: 'var(--text-tertiary)', fontSize: 13 }}>Loading…</div>
        ) : tasks.length === 0 ? (
          <div style={{ padding: 24, textAlign: 'center', color: 'var(--text-tertiary)', fontSize: 13 }}>No tasks yet — add one above</div>
        ) : (
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column' }}>
            {tasks.map((t, i) => (
              <li
                key={t.id}
                style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '12px 4px',
                  borderTop: i === 0 ? 'none' : '1px solid var(--border-subtle)',
                }}
              >
                <button
                  type="button"
                  onClick={() => onToggle(t)}
                  aria-label={t.is_complete ? 'Mark incomplete' : 'Mark complete'}
                  style={{
                    width: 20, height: 20, borderRadius: 6, flexShrink: 0,
                    border: `2px solid ${t.is_complete ? 'var(--mint-500)' : 'var(--border-default)'}`,
                    background: t.is_complete ? 'var(--mint-500)' : 'transparent',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    cursor: 'pointer', transition: 'all 160ms',
                  }}
                >{t.is_complete && <Icon name="check" size={11} color="#fff" />}</button>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    fontSize: 14, fontWeight: 500,
                    color: t.is_complete ? 'var(--text-tertiary)' : 'var(--text-primary)',
                    textDecoration: t.is_complete ? 'line-through' : 'none',
                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                  }}>{t.title}</div>
                  {t.due_time && (
                    <div style={{ fontSize: 11, color: 'var(--text-tertiary)', fontFamily: 'JetBrains Mono, monospace', marginTop: 2 }}>
                      {t.due_time.slice(0, 5)}
                    </div>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => onDelete(t)}
                  aria-label="Delete task"
                  style={{
                    width: 32, height: 32, borderRadius: 8, flexShrink: 0,
                    color: 'var(--text-tertiary)', background: 'transparent',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    cursor: 'pointer', transition: 'all 160ms',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg-hover)'; e.currentTarget.style.color = 'var(--danger-500)'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-tertiary)'; }}
                >
                  <Icon name="x" size={14} />
                </button>
              </li>
            ))}
          </ul>
        )}
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
