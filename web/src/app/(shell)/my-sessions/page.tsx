'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Avatar, Icon } from '@/components/primitives';
import BookingFlow from '@/components/booking/BookingFlow';
import { MENTORS, type Mentor } from '@/lib/mentors';
import { toast } from '@/lib/toast';
import { useRealtimeTable } from '@/hooks/useRealtimeSubscription';
import { createClient } from '@/lib/supabase/client';

type SessionStatus = 'upcoming' | 'past' | 'cancelled';
type SessionType = 'voice' | 'video';

type Session = {
  id: number;
  mentor: Mentor;
  topic: string;
  date: string;
  time: string;
  duration: number;
  type: SessionType;
  status: SessionStatus;
  countdown?: string;
  agenda?: string;
  reviewed?: boolean;
  reviewStars?: number;
  refund?: string;
};

const buildSessions = (): Session[] => [
  { id: 1, mentor: MENTORS[0], topic: 'Intro to Pandas DataFrames', date: 'Apr 28, 2026', time: '4:00 PM', duration: 60, type: 'video', status: 'upcoming', countdown: 'in 2 days', agenda: 'Walk through the assignment from last week and intro DataFrame groupby + merge.' },
  { id: 2, mentor: MENTORS[3], topic: 'JEE Physics — rotational mechanics', date: 'Apr 28, 2026', time: '7:30 PM', duration: 30, type: 'voice', status: 'upcoming', countdown: 'in 18 min', agenda: 'Cover angular momentum problem set.' },
  { id: 3, mentor: MENTORS[1], topic: 'System design — rate limiters', date: 'May 2, 2026', time: '10:00 AM', duration: 60, type: 'video', status: 'upcoming', countdown: 'in 5 days', agenda: 'Whiteboard a token bucket + sliding window.' },
  { id: 4, mentor: MENTORS[0], topic: 'Linear algebra review', date: 'Apr 15, 2026', time: '3:00 PM', duration: 60, type: 'video', status: 'past', reviewed: false },
  { id: 5, mentor: MENTORS[2], topic: 'Thesis writing — argumentation', date: 'Apr 10, 2026', time: '11:00 AM', duration: 30, type: 'voice', status: 'past', reviewed: true, reviewStars: 5 },
  { id: 6, mentor: MENTORS[3], topic: 'JEE — calc warm-up', date: 'Apr 5, 2026', time: '6:00 PM', duration: 30, type: 'voice', status: 'past', reviewed: true, reviewStars: 4 },
  { id: 7, mentor: MENTORS[4], topic: 'Portfolio review', date: 'Mar 30, 2026', time: '5:00 PM', duration: 60, type: 'video', status: 'cancelled', refund: 'Refunded ₹599' },
  { id: 8, mentor: MENTORS[1], topic: 'React performance deep dive', date: 'Mar 22, 2026', time: '8:00 PM', duration: 60, type: 'video', status: 'past', reviewed: false },
  { id: 9, mentor: MENTORS[5], topic: 'NEET PG — Cardio MCQs', date: 'Mar 12, 2026', time: '9:00 PM', duration: 60, type: 'video', status: 'cancelled', refund: 'Pending refund' },
];

const menuBtn: React.CSSProperties = { display: 'block', width: '100%', textAlign: 'left', padding: '8px 12px', borderRadius: 8, fontSize: 13, color: 'var(--text-primary)' };

function SessionCard({
  session: s, menuOpen, setMenuOpen, agendaOpen, setAgendaOpen,
  onJoin, onReschedule, onCancel, onReview, onRebook,
}: {
  session: Session;
  menuOpen: boolean; setMenuOpen: (v: boolean) => void;
  agendaOpen: boolean; setAgendaOpen: (v: boolean) => void;
  onJoin: () => void; onReschedule: () => void; onCancel: () => void;
  onReview: () => void; onRebook: () => void;
}) {
  const isUpcoming = s.status === 'upcoming';
  const isCancelled = s.status === 'cancelled';
  const isPast = s.status === 'past';
  const joinActive = isUpcoming && !!s.countdown && s.countdown.includes('min');
  const countdownBg = !s.countdown
    ? 'transparent'
    : s.countdown.includes('min')
    ? 'var(--gradient-brand)'
    : s.countdown.includes('hour')
    ? 'var(--amber-500)'
    : 'var(--mint-500, #10b981)';

  return (
    <div style={{
      background: 'var(--bg-surface)', borderRadius: 16,
      padding: 18, display: 'flex', flexDirection: 'column', gap: 12,
      opacity: isCancelled ? 0.7 : isPast ? 0.86 : 1,
      borderLeft: isPast ? '3px solid var(--text-tertiary)' : isCancelled ? '3px solid #f43f5e' : '1px solid var(--border-subtle)',
      border: '1px solid var(--border-subtle)',
    }}>
      <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
        <Avatar name={s.mentor.name} size={52} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 600, fontSize: 15, textDecoration: isCancelled ? 'line-through' : 'none' }}>{s.topic}</div>
          <div style={{ color: 'var(--text-secondary)', fontSize: 12, marginTop: 3, display: 'flex', alignItems: 'center', gap: 4 }}>
            with {s.mentor.name} · {s.date} · {s.time} · {s.duration}min{' '}
            <Icon name={s.type === 'video' ? 'mentors' : 'mic'} size={11} />
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8, position: 'relative' }}>
          {isUpcoming && s.countdown && (
            <span style={{ fontSize: 11, fontWeight: 600, padding: '4px 10px', borderRadius: 999, background: countdownBg, color: '#fff' }}>{s.countdown}</span>
          )}
          {isCancelled && s.refund && (
            <span style={{ padding: '4px 10px', borderRadius: 999, background: 'var(--bg-hover)', color: s.refund.includes('Pending') ? 'var(--amber-600)' : 'var(--mint-600)', fontSize: 11, fontWeight: 600 }}>{s.refund}</span>
          )}
          {isUpcoming && (
            <div style={{ display: 'flex', gap: 6 }}>
              <button
                onClick={onJoin}
                disabled={!joinActive}
                title={joinActive ? '' : 'Available 15 min before start'}
                style={{
                  height: 32, padding: '0 14px', borderRadius: 999,
                  background: 'var(--gradient-brand)', color: '#fff',
                  fontSize: 12, fontWeight: 600,
                  opacity: joinActive ? 1 : 0.5, cursor: joinActive ? 'pointer' : 'not-allowed',
                }}
              >Join Session</button>
              <button
                onClick={() => setAgendaOpen(!agendaOpen)}
                style={{ height: 32, padding: '0 12px', borderRadius: 999, background: 'var(--bg-hover)', border: '1px solid var(--border-subtle)', fontSize: 12, fontWeight: 500 }}
              >View Agenda</button>
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                style={{ height: 32, padding: '0 10px', borderRadius: 999, background: 'var(--bg-hover)', border: '1px solid var(--border-subtle)', fontSize: 14, fontWeight: 500 }}
              >⋯</button>
              {menuOpen && (
                <div style={{ position: 'absolute', top: '100%', right: 0, marginTop: 6, background: 'var(--bg-surface)', border: '1px solid var(--border-default)', borderRadius: 12, padding: 6, minWidth: 180, boxShadow: 'var(--shadow-lg)', zIndex: 10 }}>
                  <button onClick={onReschedule} style={menuBtn}>Reschedule</button>
                  <button onClick={onCancel} style={{ ...menuBtn, color: '#f43f5e' }}>Cancel with message</button>
                </div>
              )}
            </div>
          )}
          {isPast && (
            <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
              {s.reviewed ? (
                <span style={{ fontSize: 12, color: 'var(--mint-600)', fontWeight: 600 }}>★ {s.reviewStars} · Reviewed</span>
              ) : (
                <button
                  onClick={onReview}
                  style={{ height: 32, padding: '0 14px', borderRadius: 999, background: 'var(--gradient-brand)', color: '#fff', fontSize: 12, fontWeight: 600 }}
                >Leave Review</button>
              )}
              <button
                onClick={onRebook}
                style={{ height: 32, padding: '0 12px', borderRadius: 999, background: 'var(--bg-hover)', border: '1px solid var(--border-subtle)', fontSize: 12, fontWeight: 500 }}
              >Book Again</button>
            </div>
          )}
        </div>
      </div>
      {agendaOpen && s.agenda && (
        <div style={{ padding: 12, background: 'var(--bg-hover)', borderRadius: 10, fontSize: 13, color: 'var(--text-secondary)' }}>
          <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.06em', color: 'var(--text-tertiary)', textTransform: 'uppercase', marginRight: 6 }}>Agenda</span>
          {s.agenda}
        </div>
      )}
    </div>
  );
}

function ModalShell({ onClose, children, width = 520 }: { onClose: () => void; children: React.ReactNode; width?: number }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);
  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(14,18,40,0.28)', backdropFilter: 'blur(6px)', zIndex: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div onClick={e => e.stopPropagation()} style={{ width: '100%', maxWidth: width, maxHeight: '90vh', overflowY: 'auto', background: 'var(--bg-surface)', borderRadius: 22, padding: 28, boxShadow: 'var(--shadow-xl)', border: '1px solid var(--border-subtle)' }}>
        {children}
      </div>
    </div>
  );
}

export default function MySessionsPage() {
  const router = useRouter();
  const [filter, setFilter] = useState<SessionStatus>('upcoming');
  const [sessions, setSessions] = useState<Session[]>(buildSessions);
  const [myUserId, setMyUserId] = useState<string | null>(null);

  useEffect(() => {
    createClient().auth.getUser().then(({ data: { user } }) => setMyUserId(user?.id ?? null));
  }, []);

  // Live: surface booking status changes (e.g. mentor confirms/declines) as toasts.
  useRealtimeTable<{ id: string; status: string; mentor_id: string; student_id: string }>({
    channelName: `bookings:${myUserId ?? 'anon'}`,
    table: 'bookings',
    event: 'UPDATE',
    filter: myUserId ? `student_id=eq.${myUserId}` : undefined,
    enabled: !!myUserId,
    onChange: (payload) => {
      const b = payload.new as { status?: string } | undefined;
      if (!b) return;
      const label = b.status === 'confirmed' ? 'Booking confirmed ✓' :
                    b.status === 'declined' ? 'Booking declined' :
                    b.status === 'cancelled' ? 'Booking cancelled' : null;
      if (label) toast(label);
    },
  });
  const [menuId, setMenuId] = useState<number | null>(null);
  const [agendaOpen, setAgendaOpen] = useState<number | null>(null);
  const [modal, setModal] = useState<{ kind: 'reschedule' | 'cancel' | 'review'; session: Session } | null>(null);
  const [reschDate, setReschDate] = useState('May 5, 2026');
  const [reason, setReason] = useState('');
  const [stars, setStars] = useState(5);
  const [reviewText, setReviewText] = useState('');
  const [booking, setBooking] = useState<Mentor | null>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) setMenuId(null);
    };
    if (menuId !== null) {
      setTimeout(() => document.addEventListener('mousedown', onClick), 0);
      return () => document.removeEventListener('mousedown', onClick);
    }
  }, [menuId]);

  const counts = {
    upcoming: sessions.filter(s => s.status === 'upcoming').length,
    past: sessions.filter(s => s.status === 'past').length,
    cancelled: sessions.filter(s => s.status === 'cancelled').length,
  };
  const list = sessions.filter(s => s.status === filter);

  const empty = filter === 'upcoming'
    ? { title: 'No upcoming sessions', desc: 'Book a mentor to start learning 1-on-1', cta: { label: 'Find a Mentor', onClick: () => router.push('/mentors') } }
    : filter === 'past'
    ? { title: 'Your session history will appear here', desc: '', cta: null }
    : { title: 'No cancellations — keep that streak going', desc: '', cta: null };

  return (
    <div ref={wrapperRef} style={{ padding: '32px 40px', maxWidth: 900, margin: '0 auto' }}>
      <div style={{ marginBottom: 22 }}>
        <h1 style={{ fontFamily: 'Fraunces, serif', fontSize: 38, fontWeight: 500, letterSpacing: '-0.02em' }}>My sessions</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginTop: 6 }}>Your upcoming and past 1-on-1 sessions.</p>
      </div>

      <div style={{ display: 'flex', gap: 6, marginBottom: 24, flexWrap: 'wrap' }}>
        {([['upcoming', 'Upcoming'], ['past', 'Past'], ['cancelled', 'Cancelled']] as const).map(([k, l]) => (
          <button
            key={k}
            onClick={() => setFilter(k)}
            style={{
              height: 32, padding: '0 14px', borderRadius: 999, fontSize: 13, fontWeight: 500,
              background: filter === k ? 'var(--text-primary)' : 'var(--bg-surface)',
              color: filter === k ? '#fff' : 'var(--text-secondary)',
              border: `1px solid ${filter === k ? 'var(--text-primary)' : 'var(--border-subtle)'}`,
            }}
          >{l} ({counts[k]})</button>
        ))}
      </div>

      {list.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '80px 20px', color: 'var(--text-tertiary)' }}>
          <div style={{ fontSize: 40, marginBottom: 14 }}>📅</div>
          <div style={{ fontFamily: 'Fraunces, serif', fontSize: 22, fontWeight: 500, color: 'var(--text-primary)', marginBottom: 6 }}>{empty.title}</div>
          {empty.desc && <div style={{ fontSize: 13, marginBottom: 20, maxWidth: 320, margin: '0 auto 20px' }}>{empty.desc}</div>}
          {empty.cta && (
            <button
              onClick={empty.cta.onClick}
              style={{ height: 40, padding: '0 20px', borderRadius: 999, background: 'var(--gradient-brand)', color: '#fff', fontSize: 14, fontWeight: 600 }}
            >{empty.cta.label}</button>
          )}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {list.map(s => (
            <SessionCard
              key={s.id}
              session={s}
              menuOpen={menuId === s.id}
              setMenuOpen={(v) => setMenuId(v ? s.id : null)}
              agendaOpen={agendaOpen === s.id}
              setAgendaOpen={(v) => setAgendaOpen(v ? s.id : null)}
              onJoin={() => router.push(`/room/mentor-${s.id}`)}
              onReschedule={() => { setMenuId(null); setModal({ kind: 'reschedule', session: s }); }}
              onCancel={() => { setMenuId(null); setModal({ kind: 'cancel', session: s }); }}
              onReview={() => setModal({ kind: 'review', session: s })}
              onRebook={() => setBooking(s.mentor)}
            />
          ))}
        </div>
      )}

      {modal && (
        <ModalShell onClose={() => setModal(null)}>
          {modal.kind === 'reschedule' && (
            <>
              <h3 style={{ fontFamily: 'Fraunces, serif', fontSize: 22, fontWeight: 600, marginBottom: 14 }}>Reschedule session</h3>
              <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 16 }}>Pick a new date for &quot;{modal.session.topic}&quot;.</p>
              <input value={reschDate} onChange={e => setReschDate(e.target.value)}
                style={{ width: '100%', height: 42, padding: '0 14px', background: 'var(--bg-base)', border: '1px solid var(--border-default)', borderRadius: 10, fontSize: 14, color: 'var(--text-primary)', outline: 'none', marginBottom: 18 }}
              />
              <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                <button onClick={() => setModal(null)} style={{ height: 38, padding: '0 16px', borderRadius: 999, background: 'var(--bg-hover)', border: '1px solid var(--border-default)', fontSize: 13, fontWeight: 500 }}>Cancel</button>
                <button onClick={() => {
                  setSessions(ss => ss.map(x => x.id === modal.session.id ? { ...x, date: reschDate, countdown: 'rescheduled' } : x));
                  setModal(null);
                  toast(`Rescheduled to ${reschDate} ✓`);
                }} style={{ height: 38, padding: '0 16px', borderRadius: 999, background: 'var(--gradient-brand)', color: '#fff', fontSize: 13, fontWeight: 600 }}>Save</button>
              </div>
            </>
          )}
          {modal.kind === 'cancel' && (
            <>
              <h3 style={{ fontFamily: 'Fraunces, serif', fontSize: 22, fontWeight: 600, marginBottom: 10 }}>Cancel session?</h3>
              <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 16 }}>Tell {modal.session.mentor.name} why (optional).</p>
              <textarea value={reason} onChange={e => setReason(e.target.value)} placeholder="Schedule conflict…"
                style={{ width: '100%', height: 100, padding: 14, background: 'var(--bg-base)', border: '1px solid var(--border-default)', borderRadius: 10, fontSize: 14, color: 'var(--text-primary)', outline: 'none', resize: 'none', marginBottom: 18 }}
              />
              <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                <button onClick={() => setModal(null)} style={{ height: 38, padding: '0 16px', borderRadius: 999, background: 'var(--bg-hover)', border: '1px solid var(--border-default)', fontSize: 13, fontWeight: 500 }}>Keep session</button>
                <button onClick={() => {
                  setSessions(ss => ss.map(x => x.id === modal.session.id ? { ...x, status: 'cancelled', refund: 'Pending refund' } : x));
                  setModal(null);
                  toast('Session cancelled, refund processing');
                }} style={{ height: 38, padding: '0 16px', borderRadius: 999, background: '#f43f5e', color: '#fff', fontSize: 13, fontWeight: 600 }}>Confirm cancel</button>
              </div>
            </>
          )}
          {modal.kind === 'review' && (
            <>
              <h3 style={{ fontFamily: 'Fraunces, serif', fontSize: 22, fontWeight: 600, marginBottom: 14 }}>How was your session?</h3>
              <div style={{ display: 'flex', gap: 6, justifyContent: 'center', marginBottom: 20, fontSize: 32 }}>
                {[1, 2, 3, 4, 5].map(n => (
                  <button key={n} onClick={() => setStars(n)} style={{ color: n <= stars ? 'var(--amber-500)' : 'var(--text-tertiary)' }}>★</button>
                ))}
              </div>
              <textarea value={reviewText} onChange={e => setReviewText(e.target.value)} placeholder="What stood out?"
                style={{ width: '100%', height: 110, padding: 14, background: 'var(--bg-base)', border: '1px solid var(--border-default)', borderRadius: 10, fontSize: 14, color: 'var(--text-primary)', outline: 'none', resize: 'none', marginBottom: 18 }}
              />
              <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                <button onClick={() => setModal(null)} style={{ height: 38, padding: '0 16px', borderRadius: 999, background: 'var(--bg-hover)', border: '1px solid var(--border-default)', fontSize: 13, fontWeight: 500 }}>Skip</button>
                <button onClick={() => {
                  setSessions(ss => ss.map(x => x.id === modal.session.id ? { ...x, reviewed: true, reviewStars: stars } : x));
                  setModal(null);
                  toast('Thanks for your review ✓');
                }} style={{ height: 38, padding: '0 16px', borderRadius: 999, background: 'var(--gradient-brand)', color: '#fff', fontSize: 13, fontWeight: 600 }}>Submit review</button>
              </div>
            </>
          )}
        </ModalShell>
      )}

      {booking && <BookingFlow mentor={booking} onClose={() => setBooking(null)} />}
    </div>
  );
}
