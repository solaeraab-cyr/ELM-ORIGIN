'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Avatar, Icon } from '@/components/primitives';
import { MENTOR_USER, MENTOR_SESSIONS_TODAY, MENTOR_PENDING_REQUESTS, RECENT_REVIEWS, type PendingRequest } from '@/lib/mentor-data';
import { toast } from '@/lib/toast';

function ProgressRing({ pct, size = 92 }: { pct: number; size?: number }) {
  const r = (size - 12) / 2;
  const c = 2 * Math.PI * r;
  return (
    <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size}>
        <circle cx={size / 2} cy={size / 2} r={r} stroke="var(--bg-hover)" strokeWidth="8" fill="none" />
        <circle
          cx={size / 2} cy={size / 2} r={r} stroke="url(#pgrad)" strokeWidth="8" fill="none"
          strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c - (c * pct) / 100}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
        <defs>
          <linearGradient id="pgrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#0D1757" />
            <stop offset="100%" stopColor="#3D52CC" />
          </linearGradient>
        </defs>
      </svg>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Fraunces, serif', fontWeight: 700, fontSize: 22 }}>{pct}%</div>
    </div>
  );
}

type RequestWithState = PendingRequest & { _state?: 'accepted' | 'declined' };

export default function MentorDashboardPage() {
  const router = useRouter();
  const [accepting, setAccepting] = useState(MENTOR_USER.acceptingBookings);
  const [pending, setPending] = useState<RequestWithState[]>(MENTOR_PENDING_REQUESTS);
  const [declineFor, setDeclineFor] = useState<string | null>(null);

  const accept = (id: string) => {
    setPending(p => p.map(r => r.id === id ? { ...r, _state: 'accepted' } : r));
    const req = pending.find(r => r.id === id);
    setTimeout(() => {
      setPending(p => p.filter(r => r.id !== id));
      toast(`Session accepted · ${req?.student.name} notified`);
    }, 800);
  };

  const decline = (id: string) => {
    setPending(p => p.map(r => r.id === id ? { ...r, _state: 'declined' } : r));
    setTimeout(() => {
      setPending(p => p.filter(r => r.id !== id));
      toast('Request declined');
    }, 500);
    setDeclineFor(null);
  };

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '32px 40px' }}>
      {/* Greeting */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap',
        background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)',
        borderRadius: 20, padding: 28, marginBottom: 24,
      }}>
        <div style={{ flex: 1, minWidth: 240 }}>
          <div style={{ fontFamily: 'Fraunces, serif', fontWeight: 600, fontStyle: 'italic', fontSize: 30, letterSpacing: '-0.01em' }}>Good morning, Priya ☀️</div>
          <div style={{ fontSize: 14, color: 'var(--text-secondary)', marginTop: 6 }}>You have 2 sessions today. Next in 18 min.</div>
        </div>
        <button
          onClick={() => { setAccepting(a => !a); toast(accepting ? "You're no longer accepting bookings" : "You're back online ✓"); }}
          style={{
            display: 'flex', alignItems: 'center', gap: 8,
            height: 38, padding: '0 16px', borderRadius: 999,
            background: accepting ? 'rgba(16,185,129,0.10)' : 'var(--bg-hover)',
            border: `1px solid ${accepting ? 'rgba(16,185,129,0.30)' : 'var(--border-default)'}`,
            color: accepting ? 'var(--mint-600)' : 'var(--text-tertiary)',
            fontSize: 13, fontWeight: 600, cursor: 'pointer',
          }}
        >
          <span style={{ width: 8, height: 8, borderRadius: 999, background: accepting ? 'var(--mint-500)' : 'var(--text-tertiary)', boxShadow: accepting ? '0 0 0 4px rgba(16,185,129,0.15)' : 'none' }} />
          {accepting ? 'Accepting bookings' : 'Not taking bookings'}
        </button>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14, marginBottom: 24 }}>
        {[
          { label: 'TODAY',         big: '2',      sub: 'Sessions today', tone: 'var(--text-primary)' },
          { label: 'THIS WEEK',     big: '₹6,420', sub: 'Earnings',       tone: 'var(--amber-600)' },
          { label: '248 REVIEWS',   big: '4.9 ★',  sub: 'Avg rating',     tone: 'var(--text-primary)' },
          { label: 'LAST 30 DAYS',  big: '97%',    sub: 'Response rate',  tone: 'var(--text-primary)' },
        ].map(s => (
          <div key={s.label} style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 16, padding: 22 }}>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', color: 'var(--text-tertiary)', textTransform: 'uppercase', marginBottom: 8 }}>{s.label}</div>
            <div style={{ fontFamily: 'Fraunces, serif', fontWeight: 700, fontSize: 30, color: s.tone, lineHeight: 1.1, letterSpacing: '-0.01em' }}>{s.big}</div>
            <div style={{ fontSize: 12, color: 'var(--text-tertiary)', marginTop: 4 }}>{s.sub}</div>
          </div>
        ))}
      </div>

      {/* Today's sessions + Pending */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.4fr) minmax(0, 1fr)', gap: 20, marginBottom: 20 }}>
        {/* Today */}
        <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 16, padding: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18 }}>
            <h3 style={{ flex: 1, fontWeight: 600, fontSize: 16, margin: 0 }}>Today&apos;s sessions</h3>
            <span style={{ fontSize: 11, fontWeight: 600, padding: '3px 9px', borderRadius: 999, background: 'var(--bg-hover)', color: 'var(--text-secondary)' }}>{MENTOR_SESSIONS_TODAY.length} scheduled</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {MENTOR_SESSIONS_TODAY.map(s => {
              const completed = s.status === 'completed';
              const joinable = !completed && (s.minsAway ?? 99) <= 15;
              return (
                <div key={s.id} style={{
                  display: 'flex', alignItems: 'center', gap: 14,
                  padding: '14px 16px', borderRadius: 12,
                  background: completed ? 'var(--bg-hover)' : 'var(--bg-surface)',
                  border: `1px solid ${completed ? 'var(--border-subtle)' : 'var(--border-default)'}`,
                  opacity: completed ? 0.65 : 1,
                }}>
                  <div style={{ width: 56, fontFamily: 'JetBrains Mono, monospace', fontSize: 12, color: 'var(--text-tertiary)', flexShrink: 0 }}>{s.time}</div>
                  <Avatar name={s.student.name} size={36} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontWeight: 600, fontSize: 14 }}>{s.student.name}</span>
                      <Icon name={s.type === 'video' ? 'video' : 'mic'} size={13} color="var(--text-tertiary)" />
                      <span style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>· {s.duration}min</span>
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.topic}</div>
                  </div>
                  {completed ? (
                    <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--mint-600)' }}>✓ Completed</span>
                  ) : joinable ? (
                    <button
                      onClick={() => router.push(`/mentor/live/${s.id}`)}
                      style={{ height: 34, padding: '0 16px', borderRadius: 999, background: 'var(--gradient-brand)', color: '#fff', fontWeight: 600, fontSize: 12 }}
                    >Join</button>
                  ) : (
                    <span style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>in {Math.floor((s.minsAway ?? 0) / 60)}h {(s.minsAway ?? 0) % 60}m</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Pending */}
        <div style={{
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-subtle)',
          borderLeft: pending.length ? '3px solid var(--amber-500)' : '1px solid var(--border-subtle)',
          borderRadius: 16, padding: 24,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
            <h3 style={{ flex: 1, fontWeight: 600, fontSize: 16, margin: 0 }}>Pending requests</h3>
            <span style={{ fontSize: 11, fontWeight: 600, padding: '3px 9px', borderRadius: 999, background: 'rgba(245,158,11,0.12)', color: 'var(--amber-600)' }}>{pending.length} pending</span>
          </div>
          {pending.length === 0 ? (
            <div style={{ padding: '24px 0', textAlign: 'center', fontSize: 13, color: 'var(--text-tertiary)' }}>No pending requests 🌱</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {pending.slice(0, 3).map(r => (
                <div key={r.id} style={{
                  background: 'var(--bg-hover)', borderRadius: 12, padding: '12px 14px',
                  transition: 'all 400ms var(--ease-out-expo)',
                  opacity: r._state ? 0 : 1,
                  transform: r._state ? 'translateY(-8px)' : 'translateY(0)',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                    <Avatar name={r.student.name} size={26} />
                    <span style={{ fontSize: 13, fontWeight: 600 }}>{r.student.name}</span>
                    <span style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>· {r.requestedAt}</span>
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginBottom: 8 }}>{r.date} · {r.time} · {r.duration}min</div>
                  {declineFor === r.id ? (
                    <div style={{ background: 'var(--bg-surface)', borderRadius: 8, padding: 8 }}>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 8 }}>
                        {['Schedule conflict', 'Not my expertise', 'Other'].map(rs => (
                          <button
                            key={rs}
                            onClick={() => decline(r.id)}
                            style={{ fontSize: 11, padding: '4px 8px', borderRadius: 999, border: '1px solid var(--border-default)', background: 'var(--bg-surface)', color: 'var(--text-secondary)' }}
                          >{rs}</button>
                        ))}
                      </div>
                      <button onClick={() => setDeclineFor(null)} style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>← Back</button>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button
                        onClick={() => accept(r.id)}
                        style={{ flex: 1, height: 30, borderRadius: 8, background: 'var(--gradient-brand)', color: '#fff', fontSize: 12, fontWeight: 600 }}
                      >✓ Accept</button>
                      <button
                        onClick={() => setDeclineFor(r.id)}
                        style={{ flex: 1, height: 30, borderRadius: 8, background: 'var(--bg-surface)', border: '1px solid var(--border-default)', color: 'var(--text-secondary)', fontSize: 12, fontWeight: 600 }}
                      >✗ Decline</button>
                    </div>
                  )}
                </div>
              ))}
              <button onClick={() => router.push('/mentor/bookings?tab=requests')} style={{ fontSize: 12, color: 'var(--brand-500)', fontWeight: 600, padding: '6px 0', textAlign: 'left', background: 'transparent' }}>View all requests →</button>
            </div>
          )}
        </div>
      </div>

      {/* Reviews + Profile completion */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 20 }}>
        <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 16, padding: 24 }}>
          <h3 style={{ fontWeight: 600, fontSize: 16, margin: '0 0 14px' }}>Recent reviews</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {RECENT_REVIEWS.map(rv => (
              <div key={rv.id}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                  {[1, 2, 3, 4, 5].map(i => (
                    <Icon key={i} name="star" size={13} color={i <= rv.rating ? 'var(--amber-500)' : 'var(--text-muted)'} />
                  ))}
                  <span style={{ fontSize: 11, color: 'var(--text-tertiary)', marginLeft: 4 }}>{rv.date}</span>
                </div>
                <div style={{ fontFamily: 'Instrument Sans, system-ui', fontStyle: 'italic', fontSize: 13, lineHeight: 1.5 }}>&quot;{rv.excerpt}&quot;</div>
                <div style={{ fontSize: 11, color: 'var(--text-tertiary)', marginTop: 4 }}>— {rv.student}</div>
              </div>
            ))}
          </div>
          <button onClick={() => router.push('/mentor/reviews')} style={{ fontSize: 12, color: 'var(--brand-500)', fontWeight: 600, marginTop: 14, background: 'transparent' }}>View all reviews →</button>
        </div>

        <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 16, padding: 24, display: 'flex', flexDirection: 'column' }}>
          <h3 style={{ fontWeight: 600, fontSize: 16, margin: '0 0 14px' }}>Profile completion</h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: 18, flex: 1 }}>
            <ProgressRing pct={MENTOR_USER.profileCompletionPct} />
            <ul style={{ flex: 1, padding: 0, margin: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 8 }}>
              {['Add a profile video intro', 'Set your weekend availability', 'Complete certification verification'].map((it, i) => (
                <li key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--text-secondary)' }}>
                  <span style={{ width: 5, height: 5, borderRadius: 999, background: 'var(--amber-500)' }} />{it}
                </li>
              ))}
            </ul>
          </div>
          <button
            onClick={() => router.push('/mentor/profile-edit')}
            style={{ marginTop: 16, alignSelf: 'flex-start', height: 36, padding: '0 14px', borderRadius: 999, background: 'var(--bg-hover)', border: '1px solid var(--border-default)', fontSize: 13, fontWeight: 500 }}
          >Complete profile →</button>
        </div>
      </div>
    </div>
  );
}
