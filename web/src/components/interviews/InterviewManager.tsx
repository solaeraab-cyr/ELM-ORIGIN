'use client';

import { useEffect, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Avatar, Icon } from '@/components/primitives';
import {
  createInterview,
  listInterviews,
  listAvailableInterviews,
  joinInterview,
  cancelInterview,
  getInterviewQuota,
  type InterviewType,
} from '@/app/actions/interviews';

type Tab = 'mine' | 'available' | 'create';

type ProfileLite = { id: string; full_name: string | null; avatar_url: string | null; handle: string | null };

type InterviewRow = {
  id: string;
  type: InterviewType;
  initiator_id: string;
  partner_id: string | null;
  status: 'pending' | 'active' | 'completed' | 'cancelled';
  config: { topic?: string; scheduled_for?: string } & Record<string, unknown>;
  score: number | null;
  started_at: string | null;
  ended_at: string | null;
  created_at: string;
  initiator?: ProfileLite | null;
  partner?: ProfileLite | null;
};

const TOPICS = ['DSA', 'System Design', 'Behavioral', 'Frontend', 'Backend', 'ML'];

const TYPE_LABEL: Record<InterviewType, string> = {
  peer: 'Peer · 1-on-1',
  group: 'Group · 3-5',
  coach: 'Mock · AI',
};

const STATUS_COLOR: Record<InterviewRow['status'], { bg: string; fg: string; label: string }> = {
  pending: { bg: 'rgba(245,158,11,0.12)', fg: 'var(--amber-500, #f59e0b)', label: 'Upcoming' },
  active: { bg: 'rgba(16,185,129,0.12)', fg: 'var(--mint-600, #059669)', label: 'In Progress' },
  completed: { bg: 'rgba(79,70,229,0.12)', fg: 'var(--brand-500, #4f46e5)', label: 'Completed' },
  cancelled: { bg: 'rgba(148,163,184,0.16)', fg: '#64748b', label: 'Cancelled' },
};

function fmtScheduled(iso?: string) {
  if (!iso) return 'Anytime';
  try {
    const d = new Date(iso);
    return d.toLocaleString(undefined, {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  } catch {
    return iso;
  }
}

function detailPath(row: InterviewRow) {
  if (row.type === 'group') return `/interview/group/${row.id}`;
  if (row.type === 'coach') return `/interview/coach/${row.id}`;
  return `/interview/peer/${row.id}`;
}

function InterviewCard({
  row,
  currentUserId,
  onCancel,
  onJoin,
  context,
}: {
  row: InterviewRow;
  currentUserId: string | null;
  onCancel?: (id: string) => void;
  onJoin?: (id: string) => void;
  context: 'mine' | 'available';
}) {
  const router = useRouter();
  const isCreator = currentUserId === row.initiator_id;
  const status = STATUS_COLOR[row.status];
  const topic = row.config?.topic ?? 'Open topic';
  const scheduled = row.config?.scheduled_for;

  return (
    <div
      style={{
        background: 'var(--bg-surface)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 16,
        padding: 18,
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
        <span
          style={{
            height: 22,
            padding: '0 10px',
            borderRadius: 999,
            background: 'var(--bg-hover)',
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: '0.04em',
            textTransform: 'uppercase',
            color: 'var(--text-secondary)',
            display: 'inline-flex',
            alignItems: 'center',
          }}
        >
          {TYPE_LABEL[row.type]}
        </span>
        <span
          style={{
            height: 22,
            padding: '0 10px',
            borderRadius: 999,
            background: status.bg,
            color: status.fg,
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: '0.04em',
            textTransform: 'uppercase',
            display: 'inline-flex',
            alignItems: 'center',
          }}
        >
          {status.label}
        </span>
      </div>

      <div>
        <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 2 }}>{topic}</div>
        <div style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>{fmtScheduled(scheduled)}</div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        {row.initiator && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Avatar name={row.initiator.full_name ?? 'U'} size={22} />
            <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{row.initiator.full_name ?? 'Anonymous'}</span>
          </div>
        )}
        {row.partner_id && row.partner && (
          <>
            <span style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>·</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Avatar name={row.partner.full_name ?? 'P'} size={22} />
              <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{row.partner.full_name ?? 'Partner'}</span>
            </div>
          </>
        )}
      </div>

      <div style={{ display: 'flex', gap: 8, marginTop: 'auto' }}>
        {context === 'available' && (
          <button
            onClick={() => onJoin?.(row.id)}
            style={{
              height: 36,
              padding: '0 16px',
              borderRadius: 999,
              background: 'var(--gradient-brand, linear-gradient(135deg, #4f46e5, #7c3aed))',
              color: '#fff',
              fontSize: 13,
              fontWeight: 600,
              border: 'none',
            }}
          >
            Join
          </button>
        )}
        {context === 'mine' && (row.status === 'pending' || row.status === 'active') && (
          <button
            onClick={() => router.push(detailPath(row))}
            style={{
              height: 36,
              padding: '0 16px',
              borderRadius: 999,
              background: 'var(--gradient-brand, linear-gradient(135deg, #4f46e5, #7c3aed))',
              color: '#fff',
              fontSize: 13,
              fontWeight: 600,
              border: 'none',
            }}
          >
            {row.status === 'active' ? 'Resume' : 'Join'}
          </button>
        )}
        {context === 'mine' && isCreator && (row.status === 'pending' || row.status === 'active') && (
          <button
            onClick={() => onCancel?.(row.id)}
            style={{
              height: 36,
              padding: '0 14px',
              borderRadius: 999,
              background: 'var(--bg-hover)',
              border: '1px solid var(--border-default, var(--border-subtle))',
              color: 'var(--text-secondary)',
              fontSize: 13,
              fontWeight: 500,
            }}
          >
            Cancel
          </button>
        )}
      </div>
    </div>
  );
}

function CreateInterviewForm({
  onCreated,
  quota,
}: {
  onCreated: () => void;
  quota: { plan: string; limit: number; used: number; remaining: number } | null;
}) {
  const [type, setType] = useState<InterviewType>('peer');
  const [topic, setTopic] = useState<string>(TOPICS[0]);
  const [date, setDate] = useState<string>(() => new Date(Date.now() + 24 * 3600 * 1000).toISOString().slice(0, 10));
  const [time, setTime] = useState<string>('18:00');
  const [submitting, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const overLimit = quota ? Number.isFinite(quota.limit) && quota.used >= quota.limit : false;

  const submit = () => {
    setError(null);
    const scheduledFor = new Date(`${date}T${time}`).toISOString();
    startTransition(async () => {
      const res = await createInterview({ type, topic, scheduledFor });
      if (!res.ok) {
        if (res.error === 'quota_exceeded') {
          setError(`You've hit your ${quota?.plan ?? 'Free'} plan limit of ${quota?.limit ?? 2} interviews/day.`);
        } else {
          setError(res.error || 'Failed to create interview');
        }
        return;
      }
      onCreated();
    });
  };

  return (
    <div
      style={{
        background: 'var(--bg-surface)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 16,
        padding: 24,
        maxWidth: 640,
      }}
    >
      <h3 style={{ fontFamily: 'Fraunces, serif', fontSize: 24, fontWeight: 500, marginBottom: 6 }}>Create a new interview</h3>
      <p style={{ fontSize: 13, color: 'var(--text-tertiary)', marginBottom: 22 }}>
        Schedule a session — others can join from the &quot;Available&quot; tab if you leave the partner open.
      </p>

      {quota && (
        <div
          style={{
            fontSize: 12,
            color: overLimit ? 'var(--amber-500, #f59e0b)' : 'var(--text-tertiary)',
            marginBottom: 18,
            padding: '8px 12px',
            borderRadius: 8,
            background: overLimit ? 'rgba(245,158,11,0.10)' : 'var(--bg-hover)',
            border: '1px solid var(--border-subtle)',
          }}
        >
          {Number.isFinite(quota.limit)
            ? `${quota.plan} plan · ${quota.used}/${quota.limit} interviews today`
            : `${quota.plan} plan · unlimited interviews`}
          {overLimit && <> · <a href="/pricing" style={{ color: 'var(--brand-500, #4f46e5)', fontWeight: 600 }}>Upgrade</a></>}
        </div>
      )}

      <div style={{ marginBottom: 20 }}>
        <label style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase', color: 'var(--text-tertiary)', display: 'block', marginBottom: 8 }}>Interview type</label>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
          {(['peer', 'group', 'coach'] as InterviewType[]).map((t) => {
            const active = type === t;
            const disabled = t === 'coach';
            return (
              <button
                key={t}
                onClick={() => !disabled && setType(t)}
                disabled={disabled}
                style={{
                  padding: '12px 10px',
                  borderRadius: 12,
                  background: active ? 'var(--brand-500, #4f46e5)' : 'var(--bg-hover)',
                  color: active ? '#fff' : disabled ? 'var(--text-muted, #94a3b8)' : 'var(--text-primary)',
                  border: `1px solid ${active ? 'var(--brand-500, #4f46e5)' : 'var(--border-subtle)'}`,
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: disabled ? 'not-allowed' : 'pointer',
                  opacity: disabled ? 0.6 : 1,
                  textAlign: 'left',
                }}
                title={disabled ? 'Coming soon' : ''}
              >
                <div>{t === 'peer' ? 'Peer' : t === 'group' ? 'Group' : 'Mock (AI)'}</div>
                <div style={{ fontSize: 11, fontWeight: 400, opacity: 0.8, marginTop: 2 }}>
                  {t === 'peer' ? '1-on-1' : t === 'group' ? '3-5 people' : 'Coming soon'}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div style={{ marginBottom: 20 }}>
        <label style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase', color: 'var(--text-tertiary)', display: 'block', marginBottom: 8 }}>Topic / Subject</label>
        <select
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          style={{
            width: '100%',
            height: 42,
            padding: '0 12px',
            background: 'var(--bg-base)',
            border: '1px solid var(--border-default, var(--border-subtle))',
            borderRadius: 10,
            fontSize: 14,
            color: 'var(--text-primary)',
          }}
        >
          {TOPICS.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 24 }}>
        <div>
          <label style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase', color: 'var(--text-tertiary)', display: 'block', marginBottom: 8 }}>Date</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            style={{
              width: '100%',
              height: 42,
              padding: '0 12px',
              background: 'var(--bg-base)',
              border: '1px solid var(--border-default, var(--border-subtle))',
              borderRadius: 10,
              fontSize: 14,
              color: 'var(--text-primary)',
            }}
          />
        </div>
        <div>
          <label style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase', color: 'var(--text-tertiary)', display: 'block', marginBottom: 8 }}>Time</label>
          <input
            type="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            style={{
              width: '100%',
              height: 42,
              padding: '0 12px',
              background: 'var(--bg-base)',
              border: '1px solid var(--border-default, var(--border-subtle))',
              borderRadius: 10,
              fontSize: 14,
              color: 'var(--text-primary)',
            }}
          />
        </div>
      </div>

      {error && (
        <div style={{ fontSize: 13, color: '#ef4444', marginBottom: 14 }}>{error}</div>
      )}

      <button
        onClick={submit}
        disabled={submitting || overLimit}
        style={{
          width: '100%',
          height: 48,
          borderRadius: 999,
          background: 'var(--gradient-brand, linear-gradient(135deg, #4f46e5, #7c3aed))',
          color: '#fff',
          fontWeight: 600,
          fontSize: 15,
          border: 'none',
          opacity: submitting || overLimit ? 0.6 : 1,
          cursor: submitting || overLimit ? 'not-allowed' : 'pointer',
        }}
      >
        {submitting ? 'Creating…' : overLimit ? 'Daily limit reached' : 'Create Interview'}
      </button>
    </div>
  );
}

export default function InterviewManager({ currentUserId }: { currentUserId: string | null }) {
  const [tab, setTab] = useState<Tab>('mine');
  const [mine, setMine] = useState<InterviewRow[]>([]);
  const [available, setAvailable] = useState<InterviewRow[]>([]);
  const [quota, setQuota] = useState<{ plan: string; limit: number; used: number; remaining: number } | null>(null);
  const [loading, setLoading] = useState(false);

  const refresh = async () => {
    setLoading(true);
    const [m, a, q] = await Promise.all([
      listInterviews(),
      listAvailableInterviews(),
      getInterviewQuota(),
    ]);
    setMine(m as InterviewRow[]);
    setAvailable(a as InterviewRow[]);
    setQuota(q);
    setLoading(false);
  };

  useEffect(() => {
    refresh();
  }, []);

  const handleCancel = async (id: string) => {
    await cancelInterview(id);
    refresh();
  };

  const handleJoin = async (id: string) => {
    const res = await joinInterview(id);
    if (res.ok) {
      const row = available.find((r) => r.id === id);
      if (row) {
        window.location.href = detailPath(row);
        return;
      }
    }
    refresh();
  };

  const tabs: { id: Tab; label: string; count?: number }[] = [
    { id: 'mine', label: 'My Interviews', count: mine.length },
    { id: 'available', label: 'Available', count: available.length },
    { id: 'create', label: 'Create New' },
  ];

  return (
    <section
      style={{
        background: 'var(--bg-base)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 20,
        padding: 24,
        marginBottom: 48,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18, flexWrap: 'wrap', gap: 12 }}>
        <h2 style={{ fontFamily: 'Fraunces, serif', fontSize: 26, fontWeight: 500, letterSpacing: '-0.02em' }}>
          Manage <span style={{ fontStyle: 'italic' }}>interviews</span>
        </h2>
        {quota && Number.isFinite(quota.limit) && (
          <span style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>
            {quota.plan} · {quota.used}/{quota.limit} today
          </span>
        )}
      </div>

      <div
        role="tablist"
        style={{
          display: 'flex',
          gap: 4,
          padding: 4,
          background: 'var(--bg-hover)',
          borderRadius: 12,
          marginBottom: 22,
          width: 'fit-content',
        }}
      >
        {tabs.map((t) => {
          const active = tab === t.id;
          return (
            <button
              key={t.id}
              role="tab"
              aria-selected={active}
              onClick={() => setTab(t.id)}
              style={{
                padding: '8px 16px',
                borderRadius: 8,
                background: active ? 'var(--bg-surface)' : 'transparent',
                color: active ? 'var(--text-primary)' : 'var(--text-secondary)',
                fontSize: 13,
                fontWeight: 600,
                border: 'none',
                boxShadow: active ? 'var(--shadow-xs, 0 1px 2px rgba(0,0,0,0.05))' : 'none',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
              }}
            >
              {t.label}
              {typeof t.count === 'number' && (
                <span
                  style={{
                    padding: '1px 7px',
                    borderRadius: 999,
                    background: active ? 'var(--bg-hover)' : 'var(--bg-surface)',
                    fontSize: 11,
                    fontWeight: 700,
                    color: 'var(--text-tertiary)',
                  }}
                >
                  {t.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {loading && mine.length === 0 && available.length === 0 ? (
        <div style={{ fontSize: 13, color: 'var(--text-tertiary)', padding: '24px 0' }}>Loading…</div>
      ) : tab === 'mine' ? (
        mine.length === 0 ? (
          <div style={{ padding: '32px 0', textAlign: 'center' }}>
            <div style={{ fontSize: 28, marginBottom: 8 }}>🎯</div>
            <div style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 14 }}>You haven&apos;t scheduled any interviews yet.</div>
            <button
              onClick={() => setTab('create')}
              style={{
                height: 38,
                padding: '0 18px',
                borderRadius: 999,
                background: 'var(--gradient-brand, linear-gradient(135deg, #4f46e5, #7c3aed))',
                color: '#fff',
                fontSize: 13,
                fontWeight: 600,
                border: 'none',
              }}
            >
              Create your first interview
            </button>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 14 }}>
            {mine.map((row) => (
              <InterviewCard key={row.id} row={row} currentUserId={currentUserId} onCancel={handleCancel} context="mine" />
            ))}
          </div>
        )
      ) : tab === 'available' ? (
        available.length === 0 ? (
          <div style={{ padding: '32px 0', textAlign: 'center', fontSize: 14, color: 'var(--text-secondary)' }}>
            No open interviews right now. Check back soon — or create one.
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 14 }}>
            {available.map((row) => (
              <InterviewCard key={row.id} row={row} currentUserId={currentUserId} onJoin={handleJoin} context="available" />
            ))}
          </div>
        )
      ) : (
        <CreateInterviewForm
          quota={quota}
          onCreated={() => {
            setTab('mine');
            refresh();
          }}
        />
      )}
    </section>
  );
}
