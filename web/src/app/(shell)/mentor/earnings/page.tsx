'use client';

import { useMemo, useState } from 'react';
import { Avatar, Icon } from '@/components/primitives';
import { MENTOR_EARNINGS_WEEKLY, MENTOR_EARNINGS_MONTHLY, MENTOR_TRANSACTIONS, MENTOR_PAYOUT } from '@/lib/mentor-data';
import { toast } from '@/lib/toast';

type Range = 'week' | 'month' | 'all';

function LineChart({ data }: { data: { label: string; earned: number }[] }) {
  const [hover, setHover] = useState<{ x: number; y: number; pt: typeof data[0] } | null>(null);
  const W = 700, H = 220, PADX = 30, PADY = 24;
  const max = Math.max(1, ...data.map(d => d.earned));
  const dx = (W - 2 * PADX) / Math.max(1, data.length - 1);

  const points = data.map((d, i) => ({
    x: PADX + i * dx,
    y: H - PADY - (d.earned / max) * (H - 2 * PADY),
    d,
  }));

  const path = points.map((p, i) => {
    if (i === 0) return `M ${p.x} ${p.y}`;
    const prev = points[i - 1];
    const mx = (prev.x + p.x) / 2;
    return `C ${mx} ${prev.y}, ${mx} ${p.y}, ${p.x} ${p.y}`;
  }).join(' ');

  const fillPath = `${path} L ${PADX + (data.length - 1) * dx} ${H - PADY} L ${PADX} ${H - PADY} Z`;

  const onMove = (e: React.MouseEvent<SVGSVGElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * W;
    let nearest = points[0]; let nd = Infinity;
    for (const p of points) {
      const d = Math.abs(p.x - x);
      if (d < nd) { nd = d; nearest = p; }
    }
    setHover({ x: nearest.x, y: nearest.y, pt: nearest.d });
  };

  return (
    <svg viewBox={`0 0 ${W} ${H + 28}`} width="100%" height={H + 28} onMouseMove={onMove} onMouseLeave={() => setHover(null)} style={{ display: 'block' }}>
      <defs>
        <linearGradient id="earnFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="rgba(79,70,229,0.30)" />
          <stop offset="100%" stopColor="rgba(79,70,229,0.02)" />
        </linearGradient>
        <linearGradient id="earnStroke" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#0D1757" />
          <stop offset="100%" stopColor="#3D52CC" />
        </linearGradient>
      </defs>
      {/* Y gridlines */}
      {[0.25, 0.5, 0.75, 1].map(t => (
        <line key={t} x1={PADX} y1={H - PADY - t * (H - 2 * PADY)} x2={W - PADX} y2={H - PADY - t * (H - 2 * PADY)} stroke="var(--border-subtle)" strokeDasharray="2 4" />
      ))}
      <path d={fillPath} fill="url(#earnFill)" />
      <path d={path} fill="none" stroke="url(#earnStroke)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      {points.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r={hover && hover.pt.label === p.d.label ? 5 : 3} fill="#3D52CC" stroke="var(--bg-surface)" strokeWidth="2" />
      ))}
      {points.map((p, i) => (
        <text key={i} x={p.x} y={H - 4} textAnchor="middle" style={{ fontSize: 11, fill: 'var(--text-tertiary)', fontFamily: 'Inter, system-ui' }}>{p.d.label}</text>
      ))}
      {hover && (
        <g style={{ pointerEvents: 'none' }}>
          <line x1={hover.x} y1={PADY} x2={hover.x} y2={H - PADY} stroke="var(--brand-500)" strokeWidth="1" strokeDasharray="3 3" opacity="0.6" />
          <rect x={Math.min(hover.x + 8, W - 110)} y={hover.y - 28} width="100" height="40" rx="6" fill="var(--bg-surface)" stroke="var(--border-default)" />
          <text x={Math.min(hover.x + 16, W - 102)} y={hover.y - 12} style={{ fontSize: 11, fill: 'var(--text-tertiary)' }}>{hover.pt.label}</text>
          <text x={Math.min(hover.x + 16, W - 102)} y={hover.y + 5} style={{ fontSize: 13, fontWeight: 700, fill: 'var(--text-primary)', fontFamily: 'JetBrains Mono, monospace' }}>₹{hover.pt.earned.toLocaleString()}</text>
        </g>
      )}
    </svg>
  );
}

export default function MentorEarningsPage() {
  const [range, setRange] = useState<Range>('month');
  const [filter, setFilter] = useState<'all' | 'voice' | 'video'>('all');
  const [confirmPayout, setConfirmPayout] = useState(false);

  const chartData = useMemo(() => {
    if (range === 'week') return MENTOR_EARNINGS_WEEKLY.map(d => ({ label: d.day, earned: d.earned }));
    if (range === 'month') return MENTOR_EARNINGS_MONTHLY.map(d => ({ label: d.month, earned: d.earned }));
    return MENTOR_EARNINGS_MONTHLY.map(d => ({ label: d.month, earned: d.earned }));
  }, [range]);

  const txns = filter === 'all' ? MENTOR_TRANSACTIONS : MENTOR_TRANSACTIONS.filter(t => t.sessionType === filter);

  const totalEarned = chartData.reduce((s, d) => s + d.earned, 0);
  const sessionsCount = MENTOR_TRANSACTIONS.length;
  const avgPerSession = Math.round(totalEarned / Math.max(1, sessionsCount));

  const exportCSV = () => {
    const headers = ['Student', 'Type', 'Date', 'Amount', 'Status'];
    const rows = txns.map(t => [t.student, t.type, t.date, t.amount, t.status]);
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `earnings-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast('CSV downloaded');
  };

  return (
    <div style={{ maxWidth: 1080, margin: '0 auto', padding: '32px 40px 80px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <h1 style={{ fontFamily: 'Fraunces, serif', fontSize: 36, fontWeight: 500, letterSpacing: '-0.02em' }}>Earnings</h1>
        <div style={{ display: 'inline-flex', background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 12, padding: 4, gap: 2 }}>
          {([['week', 'This Week'], ['month', 'Month'], ['all', 'All Time']] as const).map(([id, label]) => {
            const a = range === id;
            return (
              <button
                key={id}
                onClick={() => setRange(id)}
                style={{
                  padding: '8px 14px', borderRadius: 8, fontSize: 12, fontWeight: 600,
                  background: a ? 'var(--bg-hover)' : 'transparent',
                  color: a ? 'var(--text-primary)' : 'var(--text-secondary)',
                  cursor: 'pointer',
                }}
              >{label}</button>
            );
          })}
        </div>
      </div>

      {/* 3 stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14, marginBottom: 24 }}>
        <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 16, padding: 22 }}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', color: 'var(--mint-600)', textTransform: 'uppercase' }}>Total earned</div>
          <div style={{ fontFamily: 'Fraunces, serif', fontWeight: 700, fontSize: 32, color: 'var(--mint-600)', marginTop: 8, letterSpacing: '-0.01em' }}>₹{totalEarned.toLocaleString()}</div>
        </div>
        <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 16, padding: 22 }}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>Sessions</div>
          <div style={{ fontFamily: 'Fraunces, serif', fontWeight: 700, fontSize: 32, marginTop: 8 }}>{sessionsCount}</div>
        </div>
        <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 16, padding: 22 }}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>Avg / session</div>
          <div style={{ fontFamily: 'Fraunces, serif', fontWeight: 700, fontSize: 32, marginTop: 8 }}>₹{avgPerSession.toLocaleString()}</div>
        </div>
      </div>

      {/* Pending payout */}
      <div style={{ background: 'linear-gradient(135deg, rgba(245,158,11,0.06), transparent)', border: '1px solid rgba(245,158,11,0.20)', borderRadius: 16, padding: 22, marginBottom: 24, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', color: 'var(--amber-600)', textTransform: 'uppercase' }}>Pending payout</div>
          <div style={{ fontFamily: 'Fraunces, serif', fontWeight: 700, fontSize: 28, marginTop: 6 }}>₹{MENTOR_PAYOUT.pending}</div>
          <div style={{ fontSize: 12, color: 'var(--text-tertiary)', marginTop: 4 }}>Next payout: {MENTOR_PAYOUT.nextPayoutDate}</div>
        </div>
        <button
          onClick={() => setConfirmPayout(true)}
          style={{ height: 42, padding: '0 18px', borderRadius: 999, background: 'linear-gradient(135deg, #f59e0b, #d97706)', color: '#fff', fontSize: 13, fontWeight: 600 }}
        >Request Early Payout</button>
      </div>

      {/* Chart */}
      <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 16, padding: 22, marginBottom: 24 }}>
        <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 14 }}>Earnings over time</h3>
        <LineChart data={chartData} />
      </div>

      {/* Transactions */}
      <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 16, overflow: 'hidden' }}>
        <div style={{ padding: '18px 22px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
          <h3 style={{ fontSize: 14, fontWeight: 600, margin: 0 }}>Transactions</h3>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
            <div style={{ display: 'inline-flex', background: 'var(--bg-hover)', borderRadius: 999, padding: 3, gap: 2 }}>
              {(['all', 'voice', 'video'] as const).map(f => {
                const a = filter === f;
                return (
                  <button
                    key={f}
                    onClick={() => setFilter(f)}
                    style={{
                      padding: '5px 12px', borderRadius: 999, fontSize: 12, fontWeight: 600,
                      background: a ? 'var(--bg-surface)' : 'transparent',
                      color: a ? 'var(--text-primary)' : 'var(--text-secondary)',
                      boxShadow: a ? 'var(--shadow-xs)' : 'none',
                    }}
                  >{f === 'all' ? 'All' : f === 'voice' ? '🎙 Voice' : '📹 Video'}</button>
                );
              })}
            </div>
            <button onClick={exportCSV} style={{ height: 32, padding: '0 12px', borderRadius: 999, background: 'var(--bg-hover)', border: '1px solid var(--border-default)', fontSize: 12, fontWeight: 500, display: 'flex', alignItems: 'center', gap: 4 }}>
              <Icon name="trending" size={13} /> Export CSV
            </button>
          </div>
        </div>
        {txns.length === 0 ? (
          <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-tertiary)', fontSize: 13 }}>No transactions for this filter</div>
        ) : txns.map((t, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '16px 22px', borderBottom: i < txns.length - 1 ? '1px solid var(--border-subtle)' : 'none' }}>
            <Avatar name={t.student} size={36} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 600, fontSize: 14 }}>{t.student}</div>
              <div style={{ fontSize: 12, color: 'var(--text-tertiary)', marginTop: 2 }}>{t.type} · {t.date}</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontFamily: 'JetBrains Mono, monospace', fontWeight: 600, fontSize: 15 }}>₹{t.amount.toLocaleString()}</div>
              <span style={{
                fontSize: 10, fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase',
                padding: '2px 8px', borderRadius: 999, marginTop: 4, display: 'inline-block',
                background: t.status === 'paid' ? 'rgba(16,185,129,0.12)' : 'rgba(245,158,11,0.12)',
                color: t.status === 'paid' ? 'var(--mint-600)' : 'var(--amber-600)',
              }}>{t.status}</span>
            </div>
          </div>
        ))}
      </div>

      {confirmPayout && (
        <div onClick={() => setConfirmPayout(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(7,10,24,0.55)', backdropFilter: 'blur(6px)', zIndex: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div onClick={e => e.stopPropagation()} style={{ width: 460, maxWidth: '100%', padding: 28, background: 'var(--bg-surface)', borderRadius: 18, boxShadow: 'var(--shadow-xl)', border: '1px solid var(--border-subtle)' }}>
            <h3 style={{ fontFamily: 'Fraunces, serif', fontSize: 22, fontWeight: 600, marginBottom: 10 }}>Request early payout?</h3>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 16 }}>
              ₹{MENTOR_PAYOUT.pending} will be transferred to your {MENTOR_PAYOUT.method} account (••••{MENTOR_PAYOUT.accountLast4}) within 2 hours.
              A 2% instant payout fee applies.
            </p>
            <div style={{ background: 'var(--bg-hover)', borderRadius: 12, padding: 14, marginBottom: 18, fontSize: 13 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ color: 'var(--text-tertiary)' }}>Amount</span>
                <span>₹{MENTOR_PAYOUT.pending}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ color: 'var(--text-tertiary)' }}>Instant fee (2%)</span>
                <span>−₹{Math.round(MENTOR_PAYOUT.pending * 0.02)}</span>
              </div>
              <div style={{ height: 1, background: 'var(--border-subtle)', margin: '8px 0' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700 }}>
                <span>You receive</span>
                <span style={{ color: 'var(--mint-600)' }}>₹{Math.round(MENTOR_PAYOUT.pending * 0.98)}</span>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button onClick={() => setConfirmPayout(false)} style={{ height: 38, padding: '0 16px', borderRadius: 999, background: 'var(--bg-hover)', border: '1px solid var(--border-default)', fontSize: 13, fontWeight: 500 }}>Cancel</button>
              <button
                onClick={() => { setConfirmPayout(false); toast('Payout requested — funds arriving in 2 hours'); }}
                style={{ height: 38, padding: '0 16px', borderRadius: 999, background: 'linear-gradient(135deg, #f59e0b, #d97706)', color: '#fff', fontSize: 13, fontWeight: 600 }}
              >Confirm Payout</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
