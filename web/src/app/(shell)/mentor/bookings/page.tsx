'use client';

import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Avatar, Icon } from '@/components/primitives';
import {
  MENTOR_PENDING_REQUESTS, MENTOR_UPCOMING, MENTOR_PAST, MENTOR_CANCELLED,
  type PendingRequest, type UpcomingSession, type CancelledSession,
} from '@/lib/mentor-data';
import { toast } from '@/lib/toast';

type Tab = 'requests' | 'upcoming' | 'past' | 'cancelled';

function TabBar({ tabs, active, onChange }: {
  tabs: { id: Tab; label: string; count: number; tint: 'amber' | 'mint' | 'neutral' }[];
  active: Tab; onChange: (t: Tab) => void;
}) {
  return (
    <div style={{ display: 'inline-flex', background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 12, padding: 4, gap: 2, marginBottom: 18, flexWrap: 'wrap' }}>
      {tabs.map(t => {
        const a = active === t.id;
        return (
          <button
            key={t.id}
            onClick={() => onChange(t.id)}
            style={{
              padding: '8px 16px', borderRadius: 8, fontSize: 13, fontWeight: 600,
              background: a ? 'var(--bg-hover)' : 'transparent',
              color: a ? 'var(--text-primary)' : 'var(--text-secondary)',
              display: 'inline-flex', alignItems: 'center', gap: 8,
              cursor: 'pointer',
            }}
          >
            {t.label}
            {t.count > 0 && (
              <span style={{
                padding: '1px 7px', borderRadius: 999, fontSize: 11, fontWeight: 700,
                background: t.tint === 'amber' ? 'rgba(245,158,11,0.14)' : t.tint === 'mint' ? 'rgba(16,185,129,0.14)' : 'rgba(120,120,140,0.14)',
                color: t.tint === 'amber' ? 'var(--amber-600)' : t.tint === 'mint' ? 'var(--mint-600)' : 'var(--text-tertiary)',
              }}>{t.count}</span>
            )}
          </button>
        );
      })}
    </div>
  );
}

function RequestCard({ req, onAccept, onDecline, onSuggest }: {
  req: PendingRequest;
  onAccept: (req: PendingRequest) => void;
  onDecline: (req: PendingRequest, reason: string | null) => void;
  onSuggest: (req: PendingRequest, slot: { date: string; time: string }) => void;
}) {
  const [mode, setMode] = useState<'idle' | 'accept' | 'decline' | 'suggest' | 'accepted' | 'declined' | 'suggested' | 'leaving'>('idle');
  const [reason, setReason] = useState<string | null>(null);
  const [sdate, setSdate] = useState('');
  const [stime, setStime] = useState('10:00 AM');

  const onConfirmAccept = () => {
    setMode('accepted');
    setTimeout(() => { setMode('leaving'); setTimeout(() => onAccept(req), 320); }, 700);
  };
  const onConfirmDecline = () => {
    setMode('declined');
    setTimeout(() => { setMode('leaving'); setTimeout(() => onDecline(req, reason), 320); }, 600);
  };
  const onSendSuggest = () => {
    setMode('suggested');
    onSuggest(req, { date: sdate, time: stime });
  };

  return (
    <div style={{
      background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)',
      borderLeft: `3px solid ${mode === 'accepted' ? 'var(--mint-500)' : mode === 'suggested' ? 'var(--brand-500)' : 'var(--amber-500)'}`,
      borderRadius: 16, padding: 20,
      transition: 'all 320ms cubic-bezier(0.16,1,0.3,1)',
      transform: mode === 'leaving' ? 'translateX(40px)' : 'translateX(0)',
      opacity: mode === 'leaving' ? 0 : mode === 'suggested' ? 0.75 : 1,
      maxHeight: mode === 'leaving' ? 0 : 600, overflow: 'hidden',
      marginBottom: 12,
    }}>
      <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
        <Avatar name={req.student.name} size={48} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 600, fontSize: 14 }}>{req.student.name} <span style={{ color: 'var(--text-tertiary)', fontWeight: 400, fontSize: 12 }}>· Requested {req.requestedAt}</span></div>
          <div style={{ display: 'flex', gap: 10, marginTop: 6, fontSize: 12, color: 'var(--text-secondary)', alignItems: 'center', flexWrap: 'wrap' }}>
            <span>{req.date}</span><span>·</span><span>{req.time}</span><span>·</span><span>{req.duration} min</span><span>·</span>
            <Icon name={req.type === 'video' ? 'video' : 'mic'} size={13} /><span style={{ textTransform: 'capitalize' }}>{req.type}</span>
          </div>
          {req.topic && <div style={{ marginTop: 8, fontSize: 13 }}><span style={{ color: 'var(--text-tertiary)' }}>Topic: </span>{req.topic}</div>}
          {req.agenda && (
            <div style={{ marginTop: 10, padding: 12, background: 'var(--bg-hover)', borderRadius: 10, border: '1px solid var(--border-subtle)', fontStyle: 'italic', fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              {req.agenda}
            </div>
          )}
        </div>
      </div>

      <div style={{ marginTop: 14, paddingTop: 14, borderTop: '1px solid var(--border-subtle)' }}>
        {mode === 'idle' && (
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <button onClick={() => setMode('accept')} style={{ padding: '8px 14px', borderRadius: 10, background: 'var(--gradient-brand)', color: '#fff', fontSize: 13, fontWeight: 600 }}>✓ Accept</button>
            <button onClick={() => setMode('decline')} style={{ padding: '8px 14px', borderRadius: 10, background: 'transparent', border: '1px solid rgba(239,68,68,0.35)', color: '#ef4444', fontSize: 13, fontWeight: 600 }}>✗ Decline</button>
            <button onClick={() => setMode('suggest')} style={{ padding: '8px 14px', borderRadius: 10, background: 'var(--bg-hover)', border: '1px solid var(--border-default)', fontSize: 13, fontWeight: 500 }}>⟳ Suggest other time</button>
          </div>
        )}
        {mode === 'accept' && (
          <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
            <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Send confirmation to {req.student.name}?</span>
            <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
              <button onClick={() => setMode('idle')} style={{ padding: '8px 12px', borderRadius: 10, background: 'transparent', fontSize: 12, fontWeight: 500, color: 'var(--text-secondary)' }}>← Back</button>
              <button onClick={onConfirmAccept} style={{ padding: '8px 14px', borderRadius: 10, background: 'var(--gradient-brand)', color: '#fff', fontSize: 13, fontWeight: 600 }}>Confirm Accept</button>
            </div>
          </div>
        )}
        {mode === 'decline' && (
          <div>
            <div style={{ fontSize: 12, color: 'var(--text-tertiary)', marginBottom: 8 }}>Choose a reason:</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 10 }}>
              {['Schedule conflict', 'Outside my expertise', 'Bad fit for topic', 'Other'].map(r => (
                <button
                  key={r}
                  onClick={() => setReason(r)}
                  style={{
                    padding: '6px 12px', borderRadius: 999, fontSize: 12, fontWeight: 500,
                    background: reason === r ? 'rgba(79,70,229,0.10)' : 'var(--bg-hover)',
                    color: reason === r ? 'var(--brand-600)' : 'var(--text-secondary)',
                    border: `1px solid ${reason === r ? 'var(--brand-500)' : 'var(--border-default)'}`,
                  }}
                >{r}</button>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button onClick={() => { setMode('idle'); setReason(null); }} style={{ padding: '8px 12px', borderRadius: 10, background: 'transparent', fontSize: 12, fontWeight: 500, color: 'var(--text-secondary)' }}>← Back</button>
              <button
                onClick={onConfirmDecline}
                disabled={!reason}
                style={{ padding: '8px 14px', borderRadius: 10, background: reason ? '#ef4444' : 'var(--bg-hover)', color: reason ? '#fff' : 'var(--text-tertiary)', fontSize: 13, fontWeight: 600, opacity: reason ? 1 : 0.6 }}
              >Confirm Decline</button>
            </div>
          </div>
        )}
        {mode === 'suggest' && (
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
            <input
              type="date"
              value={sdate}
              onChange={e => setSdate(e.target.value)}
              style={{ padding: '8px 10px', background: 'var(--bg-hover)', border: '1px solid var(--border-default)', borderRadius: 10, fontSize: 12, color: 'var(--text-primary)' }}
            />
            <select
              value={stime}
              onChange={e => setStime(e.target.value)}
              style={{ padding: '8px 10px', background: 'var(--bg-hover)', border: '1px solid var(--border-default)', borderRadius: 10, fontSize: 12, color: 'var(--text-primary)' }}
            >
              {['9:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', '2:00 PM', '3:00 PM', '4:00 PM', '5:00 PM', '6:00 PM', '7:00 PM'].map(t => <option key={t}>{t}</option>)}
            </select>
            <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
              <button onClick={() => setMode('idle')} style={{ padding: '8px 12px', borderRadius: 10, background: 'transparent', fontSize: 12, fontWeight: 500, color: 'var(--text-secondary)' }}>← Back</button>
              <button
                onClick={onSendSuggest}
                disabled={!sdate}
                style={{ padding: '8px 14px', borderRadius: 10, background: sdate ? 'var(--gradient-brand)' : 'var(--bg-hover)', color: sdate ? '#fff' : 'var(--text-tertiary)', fontSize: 13, fontWeight: 600 }}
              >Send Suggestion</button>
            </div>
          </div>
        )}
        {mode === 'accepted' && <div style={{ color: 'var(--mint-600)', fontWeight: 600, fontSize: 13 }}>✓ Accepted · Confirmation sent</div>}
        {mode === 'declined' && <div style={{ color: '#ef4444', fontWeight: 600, fontSize: 13 }}>✗ Declined</div>}
        {mode === 'suggested' && <div style={{ color: 'var(--brand-600)', fontWeight: 600, fontSize: 13 }}>⟳ Suggestion sent — waiting on {req.student.name}</div>}
      </div>
    </div>
  );
}

function UpcomingCard({ s, onCancel }: { s: UpcomingSession; onCancel: (s: UpcomingSession) => void }) {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const isSoon = s.date === 'Today' && (s.minsAway ?? 0) <= 60;
  return (
    <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderLeft: '3px solid var(--mint-500)', borderRadius: 16, padding: 20, marginBottom: 12, display: 'flex', gap: 14, alignItems: 'flex-start' }}>
      <Avatar name={s.student.name} size={48} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          <span style={{ fontWeight: 600, fontSize: 14 }}>{s.student.name}</span>
          <span style={{ padding: '2px 8px', borderRadius: 999, background: 'rgba(16,185,129,0.14)', color: 'var(--mint-600)', fontSize: 11, fontWeight: 600 }}>Confirmed ✓</span>
        </div>
        <div style={{ display: 'flex', gap: 10, marginTop: 6, fontSize: 12, color: 'var(--text-secondary)', alignItems: 'center', flexWrap: 'wrap' }}>
          <span>{s.date}</span><span>·</span><span>{s.time}</span><span>·</span><span>{s.duration} min</span><span>·</span>
          <Icon name={s.type === 'video' ? 'video' : 'mic'} size={13} /><span style={{ textTransform: 'capitalize' }}>{s.type}</span>
        </div>
        {s.topic && <div style={{ marginTop: 6, fontSize: 13 }}>{s.topic}</div>}
        {expanded && (
          <div style={{ marginTop: 10, padding: 12, background: 'var(--bg-hover)', borderRadius: 10, fontStyle: 'italic', fontSize: 13, color: 'var(--text-secondary)' }}>
            Student note: Looking forward to going deep on this. I&apos;ve prepared a few questions and a notebook with my current attempts.
          </div>
        )}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'flex-end', position: 'relative', flexShrink: 0 }}>
        <span style={{ fontSize: 11, color: 'var(--text-tertiary)', fontWeight: 600 }}>{s.date === 'Today' ? 'Today' : `in ${s.date}`}</span>
        <button
          onClick={() => isSoon && router.push(`/mentor/live/${s.id}`)}
          disabled={!isSoon}
          style={{ padding: '7px 14px', borderRadius: 10, background: isSoon ? 'var(--gradient-brand)' : 'var(--bg-hover)', color: isSoon ? '#fff' : 'var(--text-tertiary)', fontSize: 12, fontWeight: 600, opacity: isSoon ? 1 : 0.6 }}
        >Join Session</button>
        <div style={{ display: 'flex', gap: 6 }}>
          <button onClick={() => setExpanded(e => !e)} style={{ padding: '4px 10px', borderRadius: 999, background: 'transparent', fontSize: 11, color: 'var(--text-secondary)' }}>{expanded ? 'Hide' : 'Agenda'}</button>
          <button onClick={() => setMenuOpen(o => !o)} style={{ padding: '4px 8px', borderRadius: 999, background: 'transparent', fontSize: 14, color: 'var(--text-secondary)' }}>⋯</button>
        </div>
        {menuOpen && (
          <div style={{ position: 'absolute', top: 76, right: 0, background: 'var(--bg-surface)', border: '1px solid var(--border-default)', borderRadius: 10, boxShadow: 'var(--shadow-lg)', minWidth: 180, zIndex: 20 }}>
            <button onClick={() => { setMenuOpen(false); toast('Reschedule request sent'); }} style={{ display: 'block', width: '100%', padding: '9px 14px', textAlign: 'left', background: 'transparent', fontSize: 13 }}>Reschedule</button>
            <button onClick={() => { setMenuOpen(false); onCancel(s); }} style={{ display: 'block', width: '100%', padding: '9px 14px', textAlign: 'left', background: 'transparent', fontSize: 13, color: '#ef4444' }}>Cancel with message</button>
          </div>
        )}
      </div>
    </div>
  );
}

function EmptyState({ msg, cta }: { msg: string; cta?: { label: string; onClick: () => void } }) {
  return (
    <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-tertiary)' }}>
      <div style={{ fontFamily: 'Fraunces, serif', fontStyle: 'italic', fontSize: 18, marginBottom: 14 }}>{msg}</div>
      {cta && <button onClick={cta.onClick} style={{ height: 36, padding: '0 14px', borderRadius: 999, background: 'var(--bg-hover)', border: '1px solid var(--border-default)', fontSize: 13, fontWeight: 500 }}>{cta.label}</button>}
    </div>
  );
}

function MentorBookingsInner() {
  const router = useRouter();
  const sp = useSearchParams();
  const [tab, setTab] = useState<Tab>((sp.get('tab') as Tab) || 'requests');
  const [requests, setRequests] = useState<PendingRequest[]>(MENTOR_PENDING_REQUESTS);
  const [upcoming, setUpcoming] = useState<UpcomingSession[]>(MENTOR_UPCOMING);
  const [cancelled, setCancelled] = useState<CancelledSession[]>(MENTOR_CANCELLED);

  const acceptReq = (req: PendingRequest) => {
    setRequests(rs => rs.filter(r => r.id !== req.id));
    setUpcoming(u => [{
      id: 'u-' + req.id, student: req.student, date: req.date, time: req.time,
      duration: req.duration, type: req.type, topic: req.topic, minsAway: 9999,
    }, ...u]);
    toast(`Accepted · Email sent to ${req.student.name}`);
  };
  const declineReq = (req: PendingRequest, reason: string | null) => {
    setRequests(rs => rs.filter(r => r.id !== req.id));
    toast(`Request declined${reason ? ` · ${reason}` : ''}`);
  };
  const suggestReq = () => toast('Suggestion sent — waiting on student');
  const cancelSession = (s: UpcomingSession) => {
    setUpcoming(u => u.filter(x => x.id !== s.id));
    setCancelled(c => [{
      id: 'c-' + s.id, student: s.student, date: s.date, time: s.time,
      duration: s.duration, type: s.type, topic: s.topic,
      refundStatus: `Refunded ₹${Math.round((s.duration === 60 ? 999 : 499) * 0.85)}`,
      cancelledBy: 'mentor',
    }, ...c]);
    toast('Session cancelled · Student notified');
  };

  const tabs: { id: Tab; label: string; count: number; tint: 'amber' | 'mint' | 'neutral' }[] = [
    { id: 'requests',  label: 'Requests',  count: requests.length, tint: 'amber' },
    { id: 'upcoming',  label: 'Upcoming',  count: upcoming.length, tint: 'mint' },
    { id: 'past',      label: 'Past',      count: 0,                tint: 'neutral' },
    { id: 'cancelled', label: 'Cancelled', count: cancelled.length, tint: 'neutral' },
  ];

  return (
    <div style={{ maxWidth: 1080, margin: '0 auto', padding: '32px 40px 80px' }}>
      <h1 style={{ fontFamily: 'Fraunces, serif', fontWeight: 500, fontSize: 36, margin: '0 0 6px' }}>Bookings</h1>
      <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 24 }}>Manage incoming requests and your upcoming schedule</p>
      <TabBar tabs={tabs} active={tab} onChange={setTab} />

      {tab === 'requests' && (
        requests.length === 0
          ? <EmptyState msg="No pending requests right now 🌱" cta={{ label: 'Update availability', onClick: () => router.push('/mentor/availability') }} />
          : requests.map(req => <RequestCard key={req.id} req={req} onAccept={acceptReq} onDecline={declineReq} onSuggest={suggestReq} />)
      )}
      {tab === 'upcoming' && (
        upcoming.length === 0
          ? <EmptyState msg="No upcoming sessions" cta={{ label: 'Update availability', onClick: () => router.push('/mentor/availability') }} />
          : upcoming.map(s => <UpcomingCard key={s.id} s={s} onCancel={cancelSession} />)
      )}
      {tab === 'past' && (
        MENTOR_PAST.map(p => (
          <div key={p.id} style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderLeft: '3px solid var(--border-default)', borderRadius: 16, padding: 18, marginBottom: 10, opacity: 0.85, display: 'flex', gap: 14, alignItems: 'center' }}>
            <Avatar name={p.student.name} size={40} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 600, fontSize: 14 }}>{p.student.name}</div>
              <div style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>{p.date} · {p.time} · {p.duration} min · {p.topic}</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontFamily: 'Fraunces, serif', fontWeight: 600, fontSize: 17, color: 'var(--mint-600)' }}>+₹{p.revenueNet}</div>
              <button onClick={() => toast('Notes drawer (stub)')} style={{ padding: '4px 10px', borderRadius: 999, background: 'transparent', fontSize: 11, color: 'var(--text-secondary)', marginTop: 2 }}>View Notes</button>
            </div>
          </div>
        ))
      )}
      {tab === 'cancelled' && (
        cancelled.length === 0
          ? <EmptyState msg="No cancellations" />
          : cancelled.map(c => (
            <div key={c.id} style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderLeft: '3px solid var(--border-default)', borderRadius: 16, padding: 18, marginBottom: 10, opacity: 0.7, display: 'flex', gap: 14, alignItems: 'center' }}>
              <Avatar name={c.student.name} size={40} />
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: 14 }}>{c.student.name}</div>
                <div style={{ fontSize: 12, color: 'var(--text-tertiary)', textDecoration: 'line-through' }}>{c.date} · {c.time} · {c.topic}</div>
                <div style={{ fontSize: 11, color: 'var(--text-tertiary)', marginTop: 3 }}>Cancelled by {c.cancelledBy}</div>
              </div>
              <span style={{ padding: '4px 10px', borderRadius: 999, background: 'rgba(16,185,129,0.12)', color: 'var(--mint-600)', fontSize: 11, fontWeight: 600 }}>{c.refundStatus}</span>
            </div>
          ))
      )}
    </div>
  );
}

export default function MentorBookingsPage() {
  return (
    <Suspense>
      <MentorBookingsInner />
    </Suspense>
  );
}
