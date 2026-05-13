'use client';

import { useEffect, useState } from 'react';
import { Avatar, Icon } from '@/components/primitives';
import { toast } from '@/lib/toast';
import type { Mentor } from '@/lib/mentors';

interface BookingFlowProps {
  mentor: Mentor;
  initialDate?: Date;
  initialTime?: string;
  onClose: () => void;
}

type SessionType = 'voice' | 'video';

function Row({ l, r }: { l: string; r: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', fontSize: 14 }}>
      <span style={{ color: 'var(--text-tertiary)' }}>{l}</span>
      <span style={{ fontFamily: 'Inter, system-ui', fontWeight: 500, color: 'var(--text-primary)' }}>{r}</span>
    </div>
  );
}

export default function BookingFlow({ mentor, initialDate, initialTime, onClose }: BookingFlowProps) {
  const [step, setStep] = useState(1);
  const [sessionType, setSessionType] = useState<SessionType>('video');
  const [date, setDate] = useState<Date | null>(initialDate ?? null);
  const [time, setTime] = useState<string | null>(initialTime ?? null);
  const [duration, setDuration] = useState<30 | 60>(60);
  const [agenda, setAgenda] = useState('');
  const [paying, setPaying] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape' && !paying) onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose, paying]);

  const dates: Date[] = [];
  const today = new Date();
  for (let i = 0; i < 10; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() + i);
    dates.push(d);
  }
  const times = ['10:00', '11:30', '1:00', '2:30', '4:00', '5:30', '7:00', '8:30'];
  const basePrice = duration === 30 ? mentor.price : Math.round(mentor.price * 1.7);
  const typeAddon = sessionType === 'video' ? 100 : 0;
  const subtotal = basePrice + typeAddon;
  const discount = 100;
  const total = subtotal - discount;

  const pay = () => {
    setPaying(true);
    setTimeout(() => {
      setPaying(false);
      setStep(5);
    }, 1500);
  };

  const next = () => {
    if (step === 1 && !sessionType) return;
    if (step === 2 && (!date || !time)) return;
    if (step === 4) { pay(); return; }
    setStep(s => s + 1);
  };

  const canContinue =
    (step === 1 && sessionType) ||
    (step === 2 && date && time) ||
    step === 3 ||
    step === 4;

  return (
    <div
      onClick={() => { if (!paying) onClose(); }}
      style={{
        position: 'fixed', inset: 0, background: 'rgba(14,18,40,0.28)', backdropFilter: 'blur(6px)',
        zIndex: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          width: 540, maxWidth: '100%', maxHeight: '90vh', overflowY: 'auto',
          background: 'var(--bg-surface)', borderRadius: 24, padding: 32,
          boxShadow: 'var(--shadow-xl)',
          animation: 'modalIn 350ms var(--ease-out-expo)',
        }}
      >
        {/* Progress strip */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <div style={{ display: 'flex', gap: 4 }}>
            {[1, 2, 3, 4].map(s => (
              <div key={s} style={{
                height: 3, width: 36, borderRadius: 2,
                background: s <= step ? 'var(--text-primary)' : 'var(--bg-hover)',
                transition: 'background 300ms',
              }} />
            ))}
          </div>
          <button
            onClick={() => { if (!paying) onClose(); }}
            disabled={paying}
            style={{ color: 'var(--text-tertiary)', width: 28, height: 28, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          ><Icon name="x" size={18} /></button>
        </div>

        {/* Mentor pill */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 12, background: 'var(--bg-hover)', borderRadius: 12, marginBottom: 24 }}>
          <Avatar name={mentor.name} size={36} />
          <div>
            <div style={{ fontWeight: 600, fontSize: 13 }}>{mentor.name}</div>
            <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>★ {mentor.rating} · {mentor.title}</div>
          </div>
        </div>

        {/* Step 1: session type */}
        {step === 1 && (
          <>
            <h2 style={{ fontFamily: 'Fraunces, serif', fontSize: 26, fontWeight: 500, marginBottom: 8 }}>How do you want to meet?</h2>
            <p style={{ fontSize: 13, color: 'var(--text-tertiary)', marginBottom: 20 }}>Pick voice for quick check-ins; video for whiteboarding.</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              {([
                { id: 'voice' as const, icon: '🎙️', label: 'Voice call', desc: '30 / 60 min', price: `₹${mentor.price}+` },
                { id: 'video' as const, icon: '📹', label: 'Video call', desc: 'Share screen + whiteboard', price: `₹${mentor.price + 100}+` },
              ]).map(opt => {
                const sel = sessionType === opt.id;
                return (
                  <button
                    key={opt.id}
                    onClick={() => setSessionType(opt.id)}
                    style={{
                      padding: 18, borderRadius: 14, textAlign: 'left',
                      background: sel ? 'rgba(79,70,229,0.06)' : 'var(--bg-surface)',
                      border: `1.5px solid ${sel ? 'var(--brand-500)' : 'var(--border-default)'}`,
                      transition: 'all 180ms', cursor: 'pointer',
                    }}
                  >
                    <div style={{ fontSize: 22, marginBottom: 8 }}>{opt.icon}</div>
                    <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 4 }}>{opt.label}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>{opt.desc}</div>
                    <div style={{ fontSize: 12, color: 'var(--brand-500)', fontWeight: 600, marginTop: 6 }}>{opt.price}</div>
                  </button>
                );
              })}
            </div>
          </>
        )}

        {/* Step 2: date/time */}
        {step === 2 && (
          <>
            <h2 style={{ fontFamily: 'Fraunces, serif', fontSize: 26, fontWeight: 500, marginBottom: 20 }}>When works for you?</h2>
            <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 12, marginBottom: 20 }}>
              {dates.map((d, i) => {
                const active = date && d.getDate() === date.getDate() && d.getMonth() === date.getMonth();
                return (
                  <button
                    key={i}
                    onClick={() => setDate(d)}
                    style={{
                      minWidth: 64, padding: '12px 8px', borderRadius: 12,
                      background: active ? 'var(--text-primary)' : 'var(--bg-surface)',
                      border: `1px solid ${active ? 'var(--text-primary)' : 'var(--border-subtle)'}`,
                      color: active ? '#fff' : 'var(--text-primary)', textAlign: 'center',
                      transition: 'all 220ms', cursor: 'pointer', flexShrink: 0,
                    }}
                  >
                    <div style={{ fontSize: 10, letterSpacing: '0.06em', textTransform: 'uppercase', opacity: 0.7 }}>{d.toLocaleDateString('en', { weekday: 'short' })}</div>
                    <div style={{ fontSize: 20, fontWeight: 600, fontFamily: 'Fraunces, serif', marginTop: 3 }}>{d.getDate()}</div>
                  </button>
                );
              })}
            </div>
            {date && (
              <>
                <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.06em', color: 'var(--text-tertiary)', textTransform: 'uppercase', marginBottom: 12 }}>Available times</div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
                  {times.map(t => {
                    const active = time === t;
                    return (
                      <button
                        key={t}
                        onClick={() => setTime(t)}
                        style={{
                          height: 42, borderRadius: 999, fontSize: 13, fontWeight: 500,
                          background: active ? 'var(--text-primary)' : 'var(--bg-surface)',
                          color: active ? '#fff' : 'var(--text-primary)',
                          border: `1px solid ${active ? 'var(--text-primary)' : 'var(--border-subtle)'}`,
                          cursor: 'pointer',
                        }}
                      >{t} PM</button>
                    );
                  })}
                </div>
              </>
            )}
          </>
        )}

        {/* Step 3: duration + agenda */}
        {step === 3 && (
          <>
            <h2 style={{ fontFamily: 'Fraunces, serif', fontSize: 26, fontWeight: 500, marginBottom: 20 }}>How long?</h2>
            <div style={{ display: 'flex', gap: 4, padding: 4, background: 'var(--bg-hover)', borderRadius: 12, marginBottom: 24 }}>
              {([30, 60] as const).map(d => (
                <button
                  key={d}
                  onClick={() => setDuration(d)}
                  style={{
                    flex: 1, height: 38, borderRadius: 9, fontSize: 13, fontWeight: 600,
                    background: duration === d ? 'var(--bg-surface)' : 'transparent',
                    color: duration === d ? 'var(--text-primary)' : 'var(--text-secondary)',
                    boxShadow: duration === d ? 'var(--shadow-xs)' : 'none',
                  }}
                >{d} min · ₹{d === 30 ? mentor.price : Math.round(mentor.price * 1.7)}</button>
              ))}
            </div>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.06em', color: 'var(--text-tertiary)', textTransform: 'uppercase', marginBottom: 10 }}>What would you like to cover?</div>
            <textarea
              value={agenda}
              onChange={e => setAgenda(e.target.value.slice(0, 300))}
              placeholder="e.g. I'm stuck on eigenvalues and how they're used for diagonalization…"
              style={{
                width: '100%', height: 140, padding: 14,
                background: 'var(--bg-base)', border: '1px solid var(--border-default)',
                borderRadius: 12, fontSize: 14, lineHeight: 1.6,
                fontFamily: 'Inter, system-ui', color: 'var(--text-primary)',
                outline: 'none', resize: 'none',
              }}
            />
            <div style={{ fontSize: 11, color: 'var(--text-tertiary)', textAlign: 'right', marginTop: 4 }}>{agenda.length}/300</div>
          </>
        )}

        {/* Step 4: payment */}
        {step === 4 && (
          <>
            <h2 style={{ fontFamily: 'Fraunces, serif', fontSize: 26, fontWeight: 500, marginBottom: 20 }}>Review & pay</h2>
            <div style={{ background: 'var(--bg-hover)', borderRadius: 14, padding: 18, marginBottom: 20 }}>
              <Row l="Mentor" r={mentor.name} />
              <Row l="Type" r={sessionType === 'video' ? '📹 Video' : '🎙️ Voice'} />
              <Row l="When" r={`${date?.toLocaleDateString('en', { month: 'short', day: 'numeric' })} · ${time} PM`} />
              <Row l="Length" r={`${duration} min`} />
              <div style={{ height: 1, background: 'var(--border-subtle)', margin: '10px 0' }} />
              <Row l="Subtotal" r={`₹${subtotal}`} />
              <Row l="Pro discount" r={<span style={{ color: 'var(--mint-600)' }}>−₹{discount}</span>} />
              <div style={{ height: 1, background: 'var(--border-subtle)', margin: '10px 0' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: 600, fontSize: 15 }}>Total</span>
                <span style={{ fontFamily: 'Fraunces, serif', fontSize: 22, fontWeight: 600 }}>₹{total}</span>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 6, marginBottom: 12 }}>
              {['Card', 'UPI', 'Pay later'].map((p, i) => (
                <button
                  key={p}
                  style={{
                    flex: 1, height: 38, borderRadius: 999, fontSize: 13, fontWeight: 500,
                    background: i === 0 ? 'var(--text-primary)' : 'var(--bg-surface)',
                    color: i === 0 ? '#fff' : 'var(--text-secondary)',
                    border: `1px solid ${i === 0 ? 'var(--text-primary)' : 'var(--border-subtle)'}`,
                  }}
                >{p}</button>
              ))}
            </div>
            <input
              placeholder="Card number"
              style={{ width: '100%', height: 42, padding: '0 14px', background: 'var(--bg-base)', border: '1px solid var(--border-default)', borderRadius: 10, fontSize: 14, fontFamily: 'JetBrains Mono, monospace', color: 'var(--text-primary)', outline: 'none', marginBottom: 8 }}
            />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              <input placeholder="MM / YY" style={{ height: 42, padding: '0 14px', background: 'var(--bg-base)', border: '1px solid var(--border-default)', borderRadius: 10, fontSize: 14, fontFamily: 'JetBrains Mono, monospace', color: 'var(--text-primary)', outline: 'none' }} />
              <input placeholder="CVV" style={{ height: 42, padding: '0 14px', background: 'var(--bg-base)', border: '1px solid var(--border-default)', borderRadius: 10, fontSize: 14, fontFamily: 'JetBrains Mono, monospace', color: 'var(--text-primary)', outline: 'none' }} />
            </div>
          </>
        )}

        {/* Step 5: success */}
        {step === 5 && (
          <div style={{ textAlign: 'center', padding: '24px 0' }}>
            <div style={{
              width: 68, height: 68, borderRadius: 999, margin: '0 auto 20px',
              background: 'var(--mint-500, #10b981)', color: '#fff',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 0 0 8px rgba(16,185,129,0.12)',
            }}><Icon name="check" size={30} /></div>
            <h2 style={{ fontFamily: 'Fraunces, serif', fontStyle: 'italic', fontSize: 30, fontWeight: 500, marginBottom: 8 }}>
              You&apos;re booked.
            </h2>
            <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginTop: 4, marginBottom: 28, lineHeight: 1.5 }}>
              Session with {mentor.name} on {date?.toLocaleDateString('en', { weekday: 'long', month: 'long', day: 'numeric' })} at {time} PM.
            </p>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
              <button style={{ height: 40, padding: '0 18px', borderRadius: 999, background: 'var(--bg-hover)', border: '1px solid var(--border-default)', fontSize: 13, fontWeight: 500 }}>Add to calendar</button>
              <button
                onClick={() => { toast('Session booked ✓'); onClose(); }}
                style={{ height: 40, padding: '0 20px', borderRadius: 999, background: 'var(--gradient-brand)', color: '#fff', fontSize: 13, fontWeight: 600 }}
              >Done</button>
            </div>
          </div>
        )}

        {/* Footer buttons (steps 1-4) */}
        {step < 5 && (
          <div style={{ display: 'flex', gap: 10, marginTop: 28 }}>
            {step > 1 && !paying && (
              <button
                onClick={() => setStep(s => s - 1)}
                style={{ height: 42, padding: '0 18px', borderRadius: 999, background: 'var(--bg-hover)', border: '1px solid var(--border-default)', fontSize: 14, fontWeight: 500 }}
              >Back</button>
            )}
            <div style={{ flex: 1 }} />
            <button
              onClick={next}
              disabled={!canContinue || paying}
              style={{
                height: 44, padding: '0 22px', borderRadius: 999,
                background: 'var(--gradient-brand)', color: '#fff',
                fontSize: 14, fontWeight: 600,
                opacity: !canContinue || paying ? 0.55 : 1,
                cursor: !canContinue || paying ? 'default' : 'pointer',
                display: 'flex', alignItems: 'center', gap: 8,
              }}
            >
              {paying ? (
                <>
                  <span style={{ width: 14, height: 14, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: 999, animation: 'spin 0.8s linear infinite' }} />
                  Processing…
                </>
              ) : step === 4 ? (
                <>Pay ₹{total} <Icon name="chevronR" size={13} /></>
              ) : (
                <>Continue <Icon name="chevronR" size={13} /></>
              )}
            </button>
          </div>
        )}
        <style>{`@keyframes spin { to { transform: rotate(360deg); } } @keyframes modalIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }`}</style>
      </div>
    </div>
  );
}
