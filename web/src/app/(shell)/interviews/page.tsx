'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Avatar, Icon } from '@/components/primitives';
import BookingFlow from '@/components/booking/BookingFlow';
import { INTERVIEW_COACHES, PEER_POOL, INTERVIEW_UPCOMING, COMPANIES, type Coach } from '@/lib/interviews';
import type { Mentor } from '@/lib/mentors';

function StatCard({ label, value, sub, highlight, accent }: { label: string; value: string; sub: string; highlight?: boolean; accent?: 'amber' | 'brand' }) {
  const color = accent === 'amber' ? 'var(--amber-500)' : accent === 'brand' ? 'var(--brand-500)' : 'var(--text-primary)';
  return (
    <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 16, padding: 22, position: 'relative', overflow: 'hidden' }}>
      {highlight && <div style={{ position: 'absolute', top: -40, right: -40, width: 120, height: 120, borderRadius: 999, background: 'radial-gradient(circle, rgba(16,185,129,0.10), transparent 70%)' }} />}
      <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>{label}</div>
      <div style={{ fontFamily: 'Fraunces, serif', fontSize: 36, fontWeight: 500, marginTop: 10, letterSpacing: '-0.03em', color }}>{value}</div>
      <div style={{ fontSize: 12, color: highlight ? 'var(--mint-600)' : 'var(--text-tertiary)', marginTop: 6, fontWeight: highlight ? 600 : 400 }}>{sub}</div>
    </div>
  );
}

function CoachPillar({ onBrowse, onBook }: { onBrowse: () => void; onBook: (c: Coach) => void }) {
  return (
    <div style={{
      background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)',
      borderRadius: 24, padding: 28, position: 'relative', overflow: 'hidden',
      boxShadow: 'var(--shadow-xs)', transition: 'transform 360ms, box-shadow 360ms',
    }}>
      <div style={{ position: 'absolute', top: -60, right: -60, width: 200, height: 200, borderRadius: 999, background: 'radial-gradient(circle, rgba(79,70,229,0.08), transparent 70%)', pointerEvents: 'none' }} />
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 22, position: 'relative' }}>
        <span style={{ width: 6, height: 6, borderRadius: 999, background: 'var(--brand-500)' }} />
        <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', color: 'var(--brand-600)', textTransform: 'uppercase' }}>Coach me · 1:1</span>
      </div>
      <h2 style={{ fontFamily: 'Fraunces, serif', fontSize: 32, fontWeight: 500, lineHeight: 1.05, letterSpacing: '-0.02em', position: 'relative' }}>
        Book a verified<br /><span style={{ fontStyle: 'italic' }}>interview coach.</span>
      </h2>
      <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginTop: 10, lineHeight: 1.55, position: 'relative' }}>
        Engineers, admissions officers, and former hiring managers. They&apos;ve sat on both sides of the table.
      </p>
      <div style={{ marginTop: 22, marginBottom: 20, position: 'relative' }}>
        {INTERVIEW_COACHES.slice(0, 3).map((c, i) => (
          <button
            key={c.id}
            onClick={() => onBook(c)}
            style={{
              display: 'flex', alignItems: 'center', gap: 12,
              padding: '12px 0', width: '100%', textAlign: 'left',
              borderTop: i === 0 ? 'none' : '1px solid var(--border-subtle)',
              background: 'transparent', cursor: 'pointer', transition: 'background 160ms',
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
          >
            <div style={{ position: 'relative' }}>
              <Avatar name={c.name} size={38} tint={i} />
              {c.online && <span style={{ position: 'absolute', bottom: 0, right: 0, width: 10, height: 10, borderRadius: 999, background: 'var(--mint-500)', border: '2px solid var(--bg-surface)' }} />}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ fontSize: 14, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.name}</span>
                <Icon name="check" size={10} color="var(--brand-500)" />
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-tertiary)', marginTop: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.title} · {c.placed}</div>
            </div>
            <div style={{ textAlign: 'right', flexShrink: 0 }}>
              <div style={{ fontSize: 11, color: 'var(--mint-600)', fontWeight: 600 }}>{c.next}</div>
              <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>₹{c.price}</div>
            </div>
          </button>
        ))}
      </div>
      <button onClick={onBrowse} style={{ width: '100%', height: 44, borderRadius: 999, background: 'var(--gradient-brand)', color: '#fff', fontWeight: 600, fontSize: 14, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
        Browse all coaches <Icon name="chevronR" size={14} />
      </button>
    </div>
  );
}

function PeerPillar({ onQueue, onGroupStart }: { onQueue: () => void; onGroupStart: () => void }) {
  const [difficulty, setDifficulty] = useState<'easier' | 'mirror' | 'harder'>('mirror');
  const [type, setType] = useState<'coding' | 'system' | 'behavioral' | 'mixed'>('coding');
  const [duration, setDuration] = useState<30 | 45 | 60>(30);
  const types = [
    { id: 'coding' as const,     label: 'Coding' },
    { id: 'system' as const,     label: 'System design' },
    { id: 'behavioral' as const, label: 'Behavioral' },
    { id: 'mixed' as const,      label: 'Mixed' },
  ];
  const onlineCount = PEER_POOL.filter(p => p.online).length;

  return (
    <div style={{
      background: 'linear-gradient(145deg, #0E1228 0%, #1C2140 100%)',
      borderRadius: 24, padding: 28, color: '#fff',
      position: 'relative', overflow: 'hidden',
    }}>
      <div style={{
        position: 'absolute', inset: -40,
        background: 'radial-gradient(ellipse 400px 300px at 80% 20%, rgba(99,102,241,0.35), transparent 60%), radial-gradient(ellipse 300px 260px at 10% 100%, rgba(16,185,129,0.22), transparent 60%)',
        pointerEvents: 'none',
      }} />

      <div style={{ position: 'relative', zIndex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 22 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ width: 8, height: 8, borderRadius: 999, background: '#10B981', boxShadow: '0 0 0 4px rgba(16,185,129,0.24)' }} />
            <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.75)' }}>Live · {onlineCount} ready</span>
          </div>
          <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, color: 'rgba(255,255,255,0.55)' }}>~90s match</span>
        </div>

        <h2 style={{ fontFamily: 'Fraunces, serif', fontSize: 32, fontWeight: 500, lineHeight: 1.05, letterSpacing: '-0.02em', color: '#fff' }}>
          Go head-to-head.<br /><span style={{ fontStyle: 'italic', background: 'linear-gradient(90deg, #A78BFA, #6EE7B7)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Peer battles.</span>
        </h2>
        <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.70)', marginTop: 10, lineHeight: 1.55 }}>
          Matched with someone prepping for the same role. You interview them, they interview you. Rate each other.
        </p>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 20, marginBottom: 22, padding: '12px 14px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 14 }}>
          <div style={{ display: 'flex' }}>
            {PEER_POOL.filter(p => p.online).slice(0, 5).map((p, i) => (
              <div key={p.name} style={{ marginLeft: i === 0 ? 0 : -8, border: '2px solid #1C2140', borderRadius: 999 }}>
                <Avatar name={p.avatar} size={26} tint={i + 2} />
              </div>
            ))}
          </div>
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.70)', flex: 1 }}>
            <span style={{ color: '#fff', fontWeight: 600 }}>Dev, Ananya, Sara</span> +{onlineCount - 3} looking to pair now
          </div>
        </div>

        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.50)', marginBottom: 8, fontWeight: 700 }}>Type</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 6 }}>
            {types.map(t => {
              const active = type === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => setType(t.id)}
                  style={{
                    padding: '10px 8px', borderRadius: 10,
                    background: active ? 'rgba(255,255,255,0.14)' : 'rgba(255,255,255,0.04)',
                    border: `1px solid ${active ? 'rgba(255,255,255,0.30)' : 'rgba(255,255,255,0.06)'}`,
                    color: active ? '#fff' : 'rgba(255,255,255,0.70)',
                    fontSize: 12, fontWeight: active ? 600 : 500,
                  }}
                >{t.label}</button>
              );
            })}
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 20 }}>
          <div>
            <div style={{ fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.50)', marginBottom: 8, fontWeight: 700 }}>Level</div>
            <div style={{ display: 'flex', gap: 4, padding: 3, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 10 }}>
              {(['easier', 'mirror', 'harder'] as const).map((id, i) => {
                const active = difficulty === id;
                const symbol = ['−', '=', '+'][i];
                return (
                  <button
                    key={id}
                    onClick={() => setDifficulty(id)}
                    style={{
                      flex: 1, padding: '8px 4px', borderRadius: 8,
                      background: active ? 'rgba(255,255,255,0.14)' : 'transparent',
                      color: active ? '#fff' : 'rgba(255,255,255,0.55)',
                      fontFamily: 'JetBrains Mono, monospace', fontSize: 13, fontWeight: 600,
                    }}
                  >{symbol}</button>
                );
              })}
            </div>
          </div>
          <div>
            <div style={{ fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.50)', marginBottom: 8, fontWeight: 700 }}>Length</div>
            <div style={{ display: 'flex', gap: 4, padding: 3, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 10 }}>
              {([30, 45, 60] as const).map(d => {
                const active = duration === d;
                return (
                  <button
                    key={d}
                    onClick={() => setDuration(d)}
                    style={{
                      flex: 1, padding: '8px 4px', borderRadius: 8,
                      background: active ? 'rgba(255,255,255,0.14)' : 'transparent',
                      color: active ? '#fff' : 'rgba(255,255,255,0.55)',
                      fontSize: 12, fontWeight: 600,
                    }}
                  >{d}m</button>
                );
              })}
            </div>
          </div>
        </div>

        <button
          onClick={onQueue}
          style={{
            width: '100%', height: 52, borderRadius: 999,
            background: 'linear-gradient(135deg, #A78BFA 0%, #6EE7B7 100%)',
            color: '#0E1228', fontWeight: 700, fontSize: 15,
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            boxShadow: '0 10px 30px rgba(167,139,250,0.35)',
            marginBottom: 10,
          }}
        >
          Queue for match
          <Icon name="chevronR" size={14} />
        </button>
        <button
          onClick={onGroupStart}
          style={{
            width: '100%', height: 38, borderRadius: 999,
            background: 'rgba(255,255,255,0.06)', color: '#fff',
            fontWeight: 600, fontSize: 13,
            border: '1px solid rgba(255,255,255,0.12)',
          }}
        >
          🎤 Start group interview (max 6)
        </button>
        <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.50)', textAlign: 'center', marginTop: 10 }}>
          Free · Earn XP · Anonymous option available
        </div>
      </div>
    </div>
  );
}

function CoachListModal({ onClose, onBook }: { onClose: () => void; onBook: (c: Coach) => void }) {
  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(7,10,24,0.55)', backdropFilter: 'blur(8px)', zIndex: 500, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div onClick={e => e.stopPropagation()} style={{ width: 720, maxWidth: '100%', maxHeight: '90vh', overflow: 'auto', background: 'var(--bg-surface)', borderRadius: 24, padding: 32, border: '1px solid var(--border-subtle)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
          <h2 style={{ fontFamily: 'Fraunces, serif', fontSize: 26, fontWeight: 600 }}>All Coaches</h2>
          <button onClick={onClose} style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--bg-hover)' }}><Icon name="x" size={16} /></button>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 14 }}>
          {INTERVIEW_COACHES.map((c, i) => (
            <button
              key={c.id}
              onClick={() => onBook(c)}
              style={{
                background: 'var(--bg-hover)', border: '1px solid var(--border-subtle)',
                borderRadius: 16, padding: 18, textAlign: 'left', cursor: 'pointer',
                transition: 'all 200ms',
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--brand-500)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-subtle)'; e.currentTarget.style.transform = 'translateY(0)'; }}
            >
              <div style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
                <Avatar name={c.name} size={48} tint={i} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>{c.name}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>{c.title}</div>
                  <div style={{ fontSize: 12, color: 'var(--mint-600)', fontWeight: 600, marginTop: 4 }}>★ {c.rating} · {c.placed}</div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 12 }}>
                {c.specialties.map(s => (
                  <span key={s} style={{ padding: '3px 8px', borderRadius: 999, background: 'var(--bg-surface)', fontSize: 11, fontWeight: 500, color: 'var(--text-secondary)' }}>{s}</span>
                ))}
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 12, borderTop: '1px solid var(--border-subtle)' }}>
                <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>From <strong>₹{c.price}</strong></span>
                <span style={{ fontSize: 12, color: 'var(--brand-500)', fontWeight: 600 }}>Book →</span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function PeerMatchingModal({ onCancel, onMatched }: { onCancel: () => void; onMatched: (id: string) => void }) {
  const [elapsed, setElapsed] = useState(0);
  const [phase, setPhase] = useState<'searching' | 'found' | 'ready'>('searching');
  const [matched, setMatched] = useState<typeof PEER_POOL[0] | null>(null);

  useState(() => {
    const t = setInterval(() => setElapsed(e => e + 1), 1000);
    setTimeout(() => {
      setMatched(PEER_POOL.filter(p => p.online)[Math.floor(Math.random() * 4)]);
      setPhase('found');
    }, 4500);
    setTimeout(() => setPhase('ready'), 6300);
    return () => clearInterval(t);
  });

  const phrases = [
    'Scanning 3,241 students online…',
    'Finding someone at your level…',
    'Matching interview type…',
    'Checking timezone compatibility…',
    'Almost there…',
  ];
  const phrase = phrases[Math.min(elapsed, phrases.length - 1)];

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 800,
      background: 'linear-gradient(180deg, #0E1228 0%, #1C2140 100%)',
      color: '#fff', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', padding: 40,
    }}>
      <button onClick={onCancel} style={{ position: 'absolute', top: 28, left: 28, color: 'rgba(255,255,255,0.60)', fontSize: 13, fontWeight: 500, display: 'flex', alignItems: 'center', gap: 6, background: 'transparent' }}>
        <Icon name="x" size={16} /> Cancel
      </button>

      {phase === 'searching' && (
        <>
          <div style={{ position: 'relative', width: 260, height: 260, marginBottom: 40 }}>
            {[0, 1, 2].map(i => (
              <div key={i} style={{
                position: 'absolute', inset: 0, borderRadius: 999,
                border: '2px solid rgba(167,139,250,0.35)',
                animation: `matchPulse 2.4s ${i * 0.8}s infinite var(--ease-out-expo)`,
              }} />
            ))}
            <div style={{
              position: 'absolute', inset: 54, borderRadius: 999,
              background: 'linear-gradient(135deg, #A78BFA, #6EE7B7)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: 'Fraunces, serif', fontSize: 64, color: '#0E1228',
              boxShadow: '0 0 80px rgba(167,139,250,0.45)',
            }}>{['◎', '◉', '◍', '◐'][elapsed % 4]}</div>
          </div>
          <h2 style={{ fontFamily: 'Fraunces, serif', fontSize: 38, fontWeight: 500, textAlign: 'center' }}>
            Finding your <span style={{ fontStyle: 'italic', color: '#A78BFA' }}>match</span>…
          </h2>
          <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.60)', marginTop: 14 }}>{phrase}</p>
          <div style={{ marginTop: 40, padding: '10px 16px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 999, fontFamily: 'JetBrains Mono, monospace', fontSize: 12 }}>
            {String(Math.floor(elapsed / 60)).padStart(2, '0')}:{String(elapsed % 60).padStart(2, '0')} elapsed
          </div>
        </>
      )}

      {phase === 'found' && matched && (
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: 140, height: 140, margin: '0 auto 28px', borderRadius: 999, background: 'linear-gradient(135deg, #A78BFA, #6EE7B7)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Fraunces, serif', fontSize: 60, color: '#0E1228', boxShadow: '0 0 100px rgba(167,139,250,0.50)' }}>
            {matched.avatar}
          </div>
          <div style={{ color: '#6EE7B7', marginBottom: 8, fontSize: 12, fontWeight: 700, letterSpacing: '0.08em' }}>MATCHED</div>
          <h2 style={{ fontFamily: 'Fraunces, serif', fontSize: 42, fontWeight: 500 }}>Meet <span style={{ fontStyle: 'italic' }}>{matched.name}</span></h2>
          <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.70)', marginTop: 8 }}>{matched.level} · {matched.skill} · {matched.xp.toLocaleString()} XP</p>
        </div>
      )}

      {phase === 'ready' && matched && (
        <div style={{ textAlign: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 24, marginBottom: 40, justifyContent: 'center' }}>
            <Avatar name="You" size={88} />
            <div style={{ fontFamily: 'Fraunces, serif', fontStyle: 'italic', fontSize: 36, color: 'rgba(255,255,255,0.50)' }}>vs</div>
            <div style={{ width: 88, height: 88, borderRadius: 999, background: 'linear-gradient(135deg, #A78BFA, #6EE7B7)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Fraunces, serif', fontSize: 40, color: '#0E1228' }}>{matched.avatar}</div>
          </div>
          <h2 style={{ fontFamily: 'Fraunces, serif', fontSize: 36, fontWeight: 500, marginBottom: 10 }}>Ready?</h2>
          <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.65)', maxWidth: 420, lineHeight: 1.6, marginBottom: 28, marginLeft: 'auto', marginRight: 'auto' }}>
            You&apos;ll each take a turn as interviewer and interviewee. Be kind, be honest, rate at the end.
          </p>
          <button
            onClick={() => onMatched(`peer-${Date.now()}`)}
            style={{
              height: 52, padding: '0 40px', borderRadius: 999,
              background: 'linear-gradient(135deg, #A78BFA 0%, #6EE7B7 100%)',
              color: '#0E1228', fontWeight: 700, fontSize: 15,
              boxShadow: '0 14px 40px rgba(167,139,250,0.45)',
            }}
          >Start interview →</button>
        </div>
      )}
      <style>{`@keyframes matchPulse { 0% { transform: scale(0.6); opacity: 1; } 100% { transform: scale(1.4); opacity: 0; } }`}</style>
    </div>
  );
}

export default function InterviewsPage() {
  const router = useRouter();
  const [matchingOpen, setMatchingOpen] = useState(false);
  const [coachListOpen, setCoachListOpen] = useState(false);
  const [bookingCoach, setBookingCoach] = useState<Coach | null>(null);
  const [groupConfigOpen, setGroupConfigOpen] = useState(false);

  // Adapter: Coach → Mentor shape so BookingFlow can reuse
  const coachToMentor = (c: Coach): Mentor => ({
    id: c.id,
    name: c.name,
    title: c.title,
    rating: c.rating,
    reviews: c.sessions,
    students: c.sessions,
    price: c.price,
    subject: c.specialties.join(' · '),
    online: c.online,
    tags: c.specialties,
  });

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '32px 40px' }}>
      <div style={{ marginBottom: 32 }}>
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', color: 'var(--text-tertiary)', textTransform: 'uppercase', marginBottom: 14 }}>Interviews</div>
        <h1 style={{ fontFamily: 'Fraunces, serif', fontSize: 'clamp(36px, 5vw, 52px)', fontWeight: 500, lineHeight: 1.02, letterSpacing: '-0.02em', maxWidth: 780 }}>
          Get <span style={{ fontStyle: 'italic' }}>interview-ready</span>.<br />
          Coaches on call. Peers on demand.
        </h1>
        <p style={{ fontSize: 17, color: 'var(--text-secondary)', marginTop: 14, maxWidth: 580, lineHeight: 1.55 }}>
          Practice with verified coaches — or queue up against a peer at your level. 2-minute match. Real feedback.
        </p>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14, marginBottom: 36 }}>
        <StatCard label="Interviews done" value="24" sub="12 peer · 12 coach" />
        <StatCard label="Avg. score"      value="78" sub="+6 in last 30 days" highlight />
        <StatCard label="Current streak"  value="6"  sub="wins in a row" accent="amber" />
        <StatCard label="Global rank"     value="#412" sub="top 4% this month" accent="brand" />
      </div>

      {/* Two pillars */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: 16, marginBottom: 48 }}>
        <CoachPillar onBrowse={() => setCoachListOpen(true)} onBook={c => setBookingCoach(c)} />
        <PeerPillar onQueue={() => setMatchingOpen(true)} onGroupStart={() => setGroupConfigOpen(true)} />
      </div>

      {/* Schedule */}
      <div style={{ marginBottom: 48 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 18 }}>
          <h2 style={{ fontFamily: 'Fraunces, serif', fontSize: 28, fontWeight: 500, letterSpacing: '-0.02em' }}>
            Your <span style={{ fontStyle: 'italic' }}>schedule</span>
          </h2>
        </div>
        <div style={{ display: 'flex', gap: 12, overflowX: 'auto', paddingBottom: 4 }}>
          {INTERVIEW_UPCOMING.map((u, i) => {
            const isPeer = u.type === 'peer';
            return (
              <div key={i} style={{ minWidth: 340, background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 16, padding: 20, display: 'flex', alignItems: 'center', gap: 14 }}>
                <div style={{
                  width: 48, height: 48, borderRadius: 12,
                  background: isPeer ? 'rgba(16,185,129,0.10)' : 'rgba(79,70,229,0.10)',
                  color: isPeer ? 'var(--mint-600)' : 'var(--brand-600)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                }}>
                  <Icon name={isPeer ? 'users' : 'mentors'} size={20} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <span style={{ height: 20, padding: '0 8px', borderRadius: 999, background: isPeer ? 'rgba(16,185,129,0.10)' : 'rgba(79,70,229,0.10)', color: isPeer ? 'var(--mint-600)' : 'var(--brand-500)', fontSize: 10, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', display: 'flex', alignItems: 'center' }}>{isPeer ? 'Peer' : 'Coach'}</span>
                    <span style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>with {u.with}</span>
                  </div>
                  <div style={{ fontSize: 14, fontWeight: 600 }}>{u.topic}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-tertiary)', marginTop: 2 }}>{u.time} · {u.mins}m</div>
                </div>
                <button
                  onClick={() => router.push(isPeer ? `/interview/peer/${i + 1}` : `/interview/coach/${i + 1}`)}
                  style={{ height: 34, padding: '0 14px', borderRadius: 999, background: 'var(--bg-hover)', border: '1px solid var(--border-default)', fontSize: 13, fontWeight: 500 }}
                >Join</button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Companies */}
      <div>
        <div style={{ marginBottom: 18 }}>
          <h2 style={{ fontFamily: 'Fraunces, serif', fontSize: 28, fontWeight: 500, letterSpacing: '-0.02em' }}>
            Prep by <span style={{ fontStyle: 'italic' }}>company</span>
          </h2>
          <p style={{ fontSize: 13, color: 'var(--text-tertiary)', marginTop: 4 }}>Real questions from recent interviews. Updated weekly.</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12 }}>
          {COMPANIES.map(c => (
            <Link
              key={c.name}
              href={`/interviews/prep/${c.name.toLowerCase()}`}
              style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 16, padding: 22, textDecoration: 'none', color: 'inherit', display: 'block', transition: 'all 200ms' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--border-strong)'; e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = 'var(--shadow-md)'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-subtle)'; e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
            >
              <div style={{ width: 40, height: 40, borderRadius: 10, background: `${c.tone}14`, color: c.tone, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Fraunces, serif', fontSize: 18, fontWeight: 700, marginBottom: 14 }}>{c.mono}</div>
              <div style={{ fontSize: 16, fontWeight: 600 }}>{c.name}</div>
              <div style={{ fontSize: 12, color: 'var(--text-tertiary)', marginTop: 2 }}>{c.qs} verified questions</div>
              <div style={{ marginTop: 16, paddingTop: 14, borderTop: '1px solid var(--border-subtle)', fontSize: 12, color: 'var(--brand-500)', fontWeight: 600, display: 'flex', justifyContent: 'space-between' }}>
                Start prep <Icon name="chevronR" size={12} />
              </div>
            </Link>
          ))}
        </div>
      </div>

      {matchingOpen && (
        <PeerMatchingModal
          onCancel={() => setMatchingOpen(false)}
          onMatched={(id) => { setMatchingOpen(false); router.push(`/interview/peer/${id}`); }}
        />
      )}
      {coachListOpen && (
        <CoachListModal onClose={() => setCoachListOpen(false)} onBook={c => { setCoachListOpen(false); setBookingCoach(c); }} />
      )}
      {bookingCoach && (
        <BookingFlow mentor={coachToMentor(bookingCoach)} onClose={() => setBookingCoach(null)} />
      )}
      {groupConfigOpen && (
        <div onClick={() => setGroupConfigOpen(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(7,10,24,0.55)', backdropFilter: 'blur(6px)', zIndex: 500, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div onClick={e => e.stopPropagation()} style={{ width: 460, maxWidth: '100%', padding: 28, background: 'var(--bg-surface)', borderRadius: 20, border: '1px solid var(--border-subtle)' }}>
            <h3 style={{ fontFamily: 'Fraunces, serif', fontSize: 22, fontWeight: 600, marginBottom: 14 }}>Start a group interview</h3>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 18 }}>Up to 6 participants take turns interviewing each other on the same topic.</p>
            <button
              onClick={() => { setGroupConfigOpen(false); router.push(`/interview/group/${Date.now()}`); }}
              style={{ width: '100%', height: 44, borderRadius: 999, background: 'var(--gradient-brand)', color: '#fff', fontWeight: 600, fontSize: 14 }}
            >Create & enter →</button>
          </div>
        </div>
      )}
    </div>
  );
}
