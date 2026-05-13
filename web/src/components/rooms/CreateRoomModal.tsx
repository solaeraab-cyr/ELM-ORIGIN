'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Icon } from '@/components/primitives';
import { toast } from '@/lib/toast';

const SUBJECTS = ['Algorithms', 'Calculus', 'Linear Algebra', 'Quantum Physics', 'Organic Chemistry', 'Molecular Biology', 'Mechanical Eng', 'Microeconomics', 'Marketing', 'Constitutional Law', 'Anatomy', 'Statistics', 'UX Research', 'Mandarin'];

type Mode = 'focus' | 'discussion' | 'collab' | 'group-interview';
type RoomType = 'public' | 'private';

const MODES = [
  { v: 'focus' as const,        l: '🔇 Silent focus', d: 'No talking · pure work' },
  { v: 'discussion' as const,   l: '💬 Discussion',    d: 'Talk freely · ask questions' },
  { v: 'collab' as const,       l: '⚡ Collaborative', d: 'Shared whiteboard · work together' },
  { v: 'group-interview' as const, l: '🎤 Group Interview', d: 'Practice mock rounds (max 6)' },
];

interface Props { onClose: () => void }

const inputStyle: React.CSSProperties = {
  width: '100%', height: 40, padding: '0 14px',
  background: 'var(--bg-base)', border: '1px solid var(--border-default)',
  borderRadius: 10, fontSize: 13, color: 'var(--text-primary)', outline: 'none',
};

const labelStyle: React.CSSProperties = {
  fontSize: 11, fontWeight: 700, letterSpacing: '0.06em',
  color: 'var(--text-tertiary)', textTransform: 'uppercase', marginBottom: 8, display: 'block',
};

export default function CreateRoomModal({ onClose }: Props) {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [subject, setSubject] = useState('');
  const [subjQuery, setSubjQuery] = useState('');
  const [subjOpen, setSubjOpen] = useState(false);
  const [mode, setMode] = useState<Mode>('focus');
  const [maxP, setMaxP] = useState(10);
  const [type, setType] = useState<RoomType>('public');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape' && !submitting) onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose, submitting]);

  // Enforce 6 max when interview mode
  useEffect(() => {
    if (mode === 'group-interview' && maxP > 6) setMaxP(6);
  }, [mode, maxP]);

  const canContinue =
    (step === 1 && name.trim()) ||
    (step === 2 && subject) ||
    (step === 3) ||
    (step === 4);

  const create = () => {
    setSubmitting(true);
    setTimeout(() => {
      const newId = mode === 'group-interview' ? `gi-${Date.now()}` : `r-${Date.now()}`;
      toast('Room created — entering now…');
      router.push(`/room/${newId}`);
    }, 800);
  };

  const next = () => {
    if (step === 4) { create(); return; }
    setStep(s => s + 1);
  };

  const filteredSubj = SUBJECTS.filter(s => s.toLowerCase().includes(subjQuery.toLowerCase()));

  return (
    <div onClick={() => { if (!submitting) onClose(); }} style={{
      position: 'fixed', inset: 0, zIndex: 600,
      background: 'rgba(7,10,24,0.55)', backdropFilter: 'blur(8px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24,
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        width: 520, maxWidth: '100%', maxHeight: '90vh', overflow: 'auto',
        background: 'var(--bg-surface)', borderRadius: 24,
        border: '1px solid var(--border-subtle)', boxShadow: 'var(--shadow-xl)',
        animation: 'modalIn 350ms var(--ease-out-expo)',
      }}>
        {/* Header */}
        <div style={{ padding: '22px 28px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-subtle)' }}>
          <div>
            <div style={{ fontFamily: 'Fraunces, serif', fontSize: 22, fontWeight: 700 }}>Start a study room</div>
            <div style={{ fontSize: 12, color: 'var(--text-tertiary)', marginTop: 2 }}>Step {step} of 4</div>
          </div>
          <button onClick={onClose} disabled={submitting} style={{ width: 30, height: 30, borderRadius: 8, color: 'var(--text-tertiary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icon name="x" size={16} />
          </button>
        </div>

        {/* Progress strip */}
        <div style={{ padding: '12px 28px 0', display: 'flex', gap: 4 }}>
          {[1, 2, 3, 4].map(s => (
            <div key={s} style={{
              flex: 1, height: 3, borderRadius: 2,
              background: s <= step ? 'var(--text-primary)' : 'var(--bg-hover)',
              transition: 'background 300ms',
            }} />
          ))}
        </div>

        <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 18 }}>
          {step === 1 && (
            <>
              <h2 style={{ fontFamily: 'Fraunces, serif', fontSize: 24, fontWeight: 500, marginBottom: 8 }}>What&apos;s the room name?</h2>
              <div>
                <label style={labelStyle}>Room name · {name.length}/48</label>
                <input
                  autoFocus
                  value={name}
                  onChange={e => setName(e.target.value.slice(0, 48))}
                  placeholder="Wednesday DP grind"
                  style={inputStyle}
                />
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <h2 style={{ fontFamily: 'Fraunces, serif', fontSize: 24, fontWeight: 500, marginBottom: 8 }}>Pick a subject</h2>
              <div style={{ position: 'relative' }}>
                <label style={labelStyle}>Subject</label>
                <button
                  onClick={() => setSubjOpen(!subjOpen)}
                  style={{ ...inputStyle, textAlign: 'left', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                >
                  <span style={{ color: subject ? 'var(--text-primary)' : 'var(--text-muted)' }}>{subject || 'Select a subject…'}</span>
                  <Icon name="chevronD" size={14} />
                </button>
                {subjOpen && (
                  <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, marginTop: 4, background: 'var(--bg-surface)', border: '1px solid var(--border-default)', borderRadius: 12, maxHeight: 220, overflowY: 'auto', zIndex: 10, boxShadow: 'var(--shadow-md)' }}>
                    <input
                      autoFocus
                      value={subjQuery}
                      onChange={e => setSubjQuery(e.target.value)}
                      placeholder="Search…"
                      style={{ width: '100%', height: 36, padding: '0 12px', border: 'none', borderBottom: '1px solid var(--border-subtle)', background: 'transparent', fontSize: 13, outline: 'none' }}
                    />
                    {filteredSubj.map(s => (
                      <button
                        key={s}
                        onClick={() => { setSubject(s); setSubjOpen(false); setSubjQuery(''); }}
                        style={{ display: 'block', width: '100%', textAlign: 'left', padding: '8px 12px', fontSize: 13, color: 'var(--text-primary)' }}
                      >{s}</button>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}

          {step === 3 && (
            <>
              <h2 style={{ fontFamily: 'Fraunces, serif', fontSize: 24, fontWeight: 500, marginBottom: 8 }}>How will you study?</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {MODES.map(m => {
                  const sel = mode === m.v;
                  return (
                    <button
                      key={m.v}
                      onClick={() => setMode(m.v)}
                      style={{
                        padding: 14, borderRadius: 12, textAlign: 'left',
                        background: sel ? 'rgba(79,70,229,0.06)' : 'var(--bg-surface)',
                        border: `1.5px solid ${sel ? 'var(--brand-500)' : 'var(--border-default)'}`,
                        transition: 'all 180ms', cursor: 'pointer',
                      }}
                    >
                      <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 2 }}>{m.l}</div>
                      <div style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>{m.d}</div>
                    </button>
                  );
                })}
              </div>
            </>
          )}

          {step === 4 && (
            <>
              <h2 style={{ fontFamily: 'Fraunces, serif', fontSize: 24, fontWeight: 500, marginBottom: 8 }}>Final details</h2>
              <div>
                <label style={labelStyle}>Max participants {mode === 'group-interview' && <span style={{ color: 'var(--text-tertiary)', fontWeight: 400, marginLeft: 4 }}>(locked at 6)</span>}</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: 0 }}>
                  <button
                    onClick={() => setMaxP(Math.max(2, maxP - 1))}
                    disabled={mode === 'group-interview'}
                    style={{ width: 36, height: 36, borderRadius: '10px 0 0 10px', border: '1px solid var(--border-default)', background: 'var(--bg-surface)', color: 'var(--text-secondary)', fontSize: 16, fontWeight: 700 }}
                  >−</button>
                  <div style={{ minWidth: 60, height: 36, padding: '0 14px', borderTop: '1px solid var(--border-default)', borderBottom: '1px solid var(--border-default)', background: 'var(--bg-surface)', fontSize: 14, fontWeight: 700, fontFamily: 'JetBrains Mono, monospace', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{maxP}</div>
                  <button
                    onClick={() => setMaxP(Math.min(mode === 'group-interview' ? 6 : 50, maxP + 1))}
                    disabled={mode === 'group-interview'}
                    style={{ width: 36, height: 36, borderRadius: '0 10px 10px 0', border: '1px solid var(--border-default)', background: 'var(--bg-surface)', color: 'var(--text-secondary)', fontSize: 16, fontWeight: 700 }}
                  >+</button>
                </div>
              </div>
              <div>
                <label style={labelStyle}>Visibility</label>
                <div style={{ display: 'flex', gap: 6 }}>
                  {(['public', 'private'] as const).map(t => (
                    <button
                      key={t}
                      onClick={() => setType(t)}
                      style={{
                        flex: 1, height: 40, borderRadius: 999, fontSize: 13, fontWeight: 600,
                        background: type === t ? 'var(--text-primary)' : 'var(--bg-surface)',
                        color: type === t ? '#fff' : 'var(--text-secondary)',
                        border: `1px solid ${type === t ? 'var(--text-primary)' : 'var(--border-subtle)'}`,
                      }}
                    >{t === 'public' ? '🌐 Public' : '🔒 Private'}</button>
                  ))}
                </div>
              </div>
              <div style={{ background: 'var(--bg-base)', border: '1px solid var(--border-subtle)', borderRadius: 12, padding: 14, fontSize: 13, color: 'var(--text-secondary)' }}>
                <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>Ready to launch</div>
                <div>{name} · {subject} · {MODES.find(m => m.v === mode)?.l} · up to {maxP} · {type}</div>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div style={{ padding: '16px 24px', borderTop: '1px solid var(--border-subtle)', display: 'flex', gap: 10 }}>
          {step > 1 && !submitting && (
            <button
              onClick={() => setStep(s => s - 1)}
              style={{ flex: 1, height: 44, padding: '0 18px', borderRadius: 999, background: 'var(--bg-hover)', border: '1px solid var(--border-default)', fontSize: 14, fontWeight: 500 }}
            >Back</button>
          )}
          <button
            onClick={next}
            disabled={!canContinue || submitting}
            style={{
              flex: step === 1 ? 1 : 2, height: 48, padding: '0 22px', borderRadius: 999,
              background: 'var(--gradient-brand)', color: '#fff',
              fontSize: 14, fontWeight: 600,
              opacity: !canContinue || submitting ? 0.55 : 1,
              cursor: !canContinue || submitting ? 'default' : 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            }}
          >
            {submitting ? (
              <>
                <span style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: 999, animation: 'spin 0.8s linear infinite' }} />
                Creating…
              </>
            ) : step === 4 ? (
              <>Create & Enter Room <Icon name="chevronR" size={13} /></>
            ) : (
              <>Continue <Icon name="chevronR" size={13} /></>
            )}
          </button>
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } } @keyframes modalIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }`}</style>
      </div>
    </div>
  );
}
