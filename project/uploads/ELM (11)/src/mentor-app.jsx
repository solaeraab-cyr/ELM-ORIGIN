/* global React, Icon, Avatar, NovaOrb, Progress, MOLabeled, MOInput, MOSelect */
const { useState: useStateMA, useEffect: useEffectMA, useRef: useRefMA, useMemo: useMemoMA } = React;

// ═══════════════════════════════════════════════════════════════
// MENTOR APP — shared data, primitives, and DASHBOARD
// (Profile-edit, availability, bookings live in mentor-app-2.jsx)
// ═══════════════════════════════════════════════════════════════

const MENTOR_USER = {
  name: 'Dr. Priya Iyer',
  email: 'priya.iyer@research.iitb.ac.in',
  headline: 'Data Scientist · IIT Bombay PhD',
  bio: 'I work at the intersection of statistics and machine learning. I spent 6 years at Google Research before transitioning to teaching. I love demystifying complex math for students who think they\'re "not math people".',
  teachingApproach: 'I believe in working through problems together — not lecturing. Most of our session will be you driving, me asking the right questions.',
  rating: 4.9,
  totalReviews: 248,
  totalSessions: 1840,
  repeatStudentsPct: 62,
  acceptingBookings: true,
  responseTimeMin: 120,
  responseRatePct: 97,
  profileCompletionPct: 80,
  country: 'India',
  timezone: 'IST (UTC+5:30)',
  languages: ['English', 'Hindi'],
  primary: 'Data Science',
  subjects: ['Statistics', 'Machine learning', 'Pandas', 'Time series', 'A/B testing'],
  education: [
    { degree: 'PhD, Statistics', institution: 'IIT Bombay', year: '2018' },
    { degree: 'B.Tech, Computer Science', institution: 'IIT Madras', year: '2012' },
  ],
  certs: [
    { name: 'Google Cloud ML Engineer', issuer: 'Google', year: '2021' },
  ],
  pricing: { voice: { enabled: true, p30: 499, p60: 899 }, video: { enabled: true, p30: 599, p60: 999 }, instantBook: true },
  days: {
    Mon: { on: true,  slots: [['9:00 AM','5:00 PM']] },
    Tue: { on: true,  slots: [['9:00 AM','5:00 PM']] },
    Wed: { on: true,  slots: [['9:00 AM','5:00 PM']] },
    Thu: { on: true,  slots: [['9:00 AM','5:00 PM']] },
    Fri: { on: true,  slots: [['9:00 AM','5:00 PM']] },
    Sat: { on: false, slots: [] },
    Sun: { on: false, slots: [] },
  },
  buffer: 15,
  advanceBookingWindow: '1 month',
  blockedDates: ['2026-05-15', '2026-05-16'],
};

const MENTOR_SESSIONS_TODAY = [
  { id: 's1', student: { name: 'Rohan Das' },    time: '9:00 AM',  duration: 60, type: 'video', topic: 'Linear algebra basics',         status: 'completed' },
  { id: 's2', student: { name: 'Arjun Patel' },  time: '11:00 AM', duration: 60, type: 'video', topic: 'Pandas DataFrames intro',       status: 'upcoming', minsAway: 18 },
  { id: 's3', student: { name: 'Sneha Mehta' },  time: '2:30 PM',  duration: 30, type: 'voice', topic: 'Resume review for FAANG roles', status: 'upcoming', minsAway: 340 },
];

const MENTOR_PENDING_REQUESTS = [
  { id: 'r1', student: { name: 'Karan Iyer' },   requestedAt: '2h ago', date: 'Apr 26', time: '4:00 PM',  duration: 60, type: 'video', topic: 'Help with thesis chapter 3', agenda: 'I want to discuss the methodology section before submitting on Friday.' },
  { id: 'r2', student: { name: 'Ananya Roy' },   requestedAt: '5h ago', date: 'Apr 28', time: '11:00 AM', duration: 30, type: 'voice', topic: '', agenda: '' },
  { id: 'r3', student: { name: 'Vikram Singh' }, requestedAt: '1d ago', date: 'Apr 30', time: '7:00 PM',  duration: 60, type: 'video', topic: 'Career change to data science', agenda: 'I\'m an electrical engineer with 5 years experience, looking to pivot. Want advice on portfolio projects and which sub-field to target.' },
];

const MENTOR_UPCOMING = [
  { id: 'u1', student: { name: 'Arjun Patel' }, date: 'Today',   time: '11:00 AM', duration: 60, type: 'video', topic: 'Pandas DataFrames intro', minsAway: 18 },
  { id: 'u2', student: { name: 'Sneha Mehta' }, date: 'Today',   time: '2:30 PM',  duration: 30, type: 'voice', topic: 'Resume review for FAANG roles', minsAway: 340 },
  { id: 'u3', student: { name: 'Diya Rao' },    date: 'Apr 25',  time: '5:00 PM',  duration: 60, type: 'video', topic: 'Time series forecasting', minsAway: 2880 },
  { id: 'u4', student: { name: 'Aniket M.' },   date: 'Apr 26',  time: '10:00 AM', duration: 30, type: 'voice', topic: 'PhD application essay review', minsAway: 4200 },
  { id: 'u5', student: { name: 'Tara K.' },     date: 'Apr 27',  time: '3:00 PM',  duration: 60, type: 'video', topic: 'A/B test design', minsAway: 5800 },
];

const MENTOR_PAST = [
  { id: 'p1', student: { name: 'Rohan Das' },   date: 'Today',  time: '9:00 AM',  duration: 60, type: 'video', topic: 'Linear algebra basics',  revenueNet: 849 },
  { id: 'p2', student: { name: 'Priya N.' },    date: 'Apr 21', time: '5:00 PM',  duration: 30, type: 'voice', topic: 'Stats interview prep',   revenueNet: 424 },
  { id: 'p3', student: { name: 'Aman G.' },     date: 'Apr 19', time: '3:00 PM',  duration: 60, type: 'video', topic: 'Pandas advanced',        revenueNet: 849 },
  { id: 'p4', student: { name: 'Lakshmi S.' },  date: 'Apr 17', time: '11:00 AM', duration: 60, type: 'video', topic: 'NumPy fundamentals',     revenueNet: 849 },
  { id: 'p5', student: { name: 'Karthik V.' },  date: 'Apr 15', time: '6:00 PM',  duration: 30, type: 'voice', topic: 'Resume feedback',        revenueNet: 424 },
  { id: 'p6', student: { name: 'Mira S.' },     date: 'Apr 14', time: '10:00 AM', duration: 60, type: 'video', topic: 'Decision trees',         revenueNet: 849 },
  { id: 'p7', student: { name: 'Dev K.' },      date: 'Apr 12', time: '4:00 PM',  duration: 60, type: 'video', topic: 'A/B testing intro',      revenueNet: 849 },
  { id: 'p8', student: { name: 'Neha B.' },     date: 'Apr 10', time: '2:00 PM',  duration: 30, type: 'voice', topic: 'PhD app strategy',       revenueNet: 424 },
];

const MENTOR_CANCELLED = [
  { id: 'c1', student: { name: 'Aditya B.' }, date: 'Apr 18', time: '6:00 PM', duration: 60, type: 'video', topic: 'Linear algebra', refundStatus: 'Refunded ₹849', cancelledBy: 'student' },
  { id: 'c2', student: { name: 'Meena R.' },  date: 'Apr 12', time: '4:00 PM', duration: 30, type: 'voice', topic: 'Career advice',  refundStatus: 'Refunded ₹424', cancelledBy: 'mentor' },
];

const RECENT_REVIEWS = [
  { id: 'rv1', student: 'Rohan Das', rating: 5, excerpt: 'Priya makes the most complex topics feel approachable. Best mentor I\'ve had on the platform.', date: '2 days ago' },
  { id: 'rv2', student: 'Diya Rao',  rating: 5, excerpt: 'Came in confused about which models to use. Left with a clear action plan.', date: '5 days ago' },
  { id: 'rv3', student: 'Aman G.',   rating: 4, excerpt: 'Very thorough explanation. Wish we had more time for the second topic.', date: '1 week ago' },
];

// ═══════════════════════════════════════════════════════════════
// SHARED — Toast, Section, AvailabilityGrid
// ═══════════════════════════════════════════════════════════════

const TIMES_OF_DAY = ['8:00 AM','8:30 AM','9:00 AM','9:30 AM','10:00 AM','10:30 AM','11:00 AM','11:30 AM','12:00 PM','12:30 PM','1:00 PM','1:30 PM','2:00 PM','2:30 PM','3:00 PM','3:30 PM','4:00 PM','4:30 PM','5:00 PM','5:30 PM','6:00 PM','6:30 PM','7:00 PM','7:30 PM','8:00 PM','8:30 PM','9:00 PM'];
const DAY_KEYS = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];

const useToasts = () => {
  const [toasts, setToasts] = useStateMA([]);
  const toast = (msg, opts = {}) => {
    const id = Math.random().toString(36).slice(2);
    setToasts(t => [...t, { id, msg, kind: opts.kind || 'success' }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), opts.duration || 3000);
  };
  const ToastHost = () => (
    <div style={{ position: 'fixed', top: 84, right: 24, zIndex: 200, display: 'flex', flexDirection: 'column', gap: 8, pointerEvents: 'none' }}>
      {toasts.map(t => {
        const accent = t.kind === 'error' ? 'var(--red-500, #b42318)' : t.kind === 'warn' ? 'var(--amber-500)' : 'var(--mint-500)';
        return (
          <div key={t.id} style={{
            background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)',
            borderLeft: `3px solid ${accent}`,
            padding: '12px 16px', borderRadius: 10, fontSize: 13, color: 'var(--text-primary)',
            boxShadow: 'var(--shadow-md)', minWidth: 240, maxWidth: 360, pointerEvents: 'auto',
            animation: 'slideInRight 200ms var(--ease-out-expo)',
          }}>{t.msg}</div>
        );
      })}
    </div>
  );
  return { toast, ToastHost };
};

const MASection = ({ title, status, defaultOpen = true, children }) => {
  const [open, setOpen] = useStateMA(defaultOpen);
  return (
    <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 16, overflow: 'hidden' }}>
      <button onClick={() => setOpen(o => !o)} style={{
        display: 'flex', alignItems: 'center', gap: 12, width: '100%',
        padding: '18px 24px', background: 'transparent', textAlign: 'left',
      }}>
        <span style={{ flex: 1, fontFamily: 'Inter', fontWeight: 600, fontSize: 15, color: 'var(--text-primary)' }}>{title}</span>
        {status && (
          <span style={{
            fontSize: 11, fontWeight: 600, padding: '3px 9px', borderRadius: 999,
            background: status === 'Complete' ? 'rgba(16,185,129,0.10)' : 'rgba(245,158,11,0.10)',
            color: status === 'Complete' ? 'var(--mint-700)' : 'var(--amber-600)',
          }}>{status}</span>
        )}
        <span style={{ color: 'var(--text-tertiary)', transition: 'transform 200ms', transform: open ? 'rotate(180deg)' : 'rotate(0deg)' }}>
          <Icon name="chevronD" size={16}/>
        </span>
      </button>
      {open && <div style={{ padding: '0 24px 24px', borderTop: '1px solid var(--border-subtle)' }}>{children}</div>}
    </div>
  );
};

const AvailabilityGrid = ({ days, onChange }) => {
  const toggleDay = (d) => {
    const day = days[d];
    onChange({ ...days, [d]: { on: !day.on, slots: !day.on && day.slots.length === 0 ? [['9:00 AM','5:00 PM']] : day.slots } });
  };
  const setSlot = (d, i, k, v) => {
    const slots = days[d].slots.map((s, idx) => idx === i ? (k === 0 ? [v, s[1]] : [s[0], v]) : s);
    onChange({ ...days, [d]: { ...days[d], slots } });
  };
  const addSlot = (d) => onChange({ ...days, [d]: { ...days[d], slots: [...days[d].slots, ['10:00 AM','12:00 PM']] } });
  const rmSlot = (d, i) => onChange({ ...days, [d]: { ...days[d], slots: days[d].slots.filter((_, k) => k !== i) } });

  return (
    <>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 8, marginBottom: 18 }}>
        {DAY_KEYS.map(d => {
          const on = days[d].on;
          return (
            <div key={d} style={{
              background: on ? 'var(--glass-brand-bg)' : 'var(--bg-base)',
              border: '1px solid ' + (on ? 'var(--border-brand)' : 'var(--border-subtle)'),
              borderRadius: 12, padding: 10, textAlign: 'center', transition: 'all 200ms',
            }}>
              <div style={{ fontFamily: 'Inter', fontSize: 11, fontWeight: 700, color: on ? 'var(--brand-700)' : 'var(--text-tertiary)', marginBottom: 8, letterSpacing: '0.05em' }}>{d.toUpperCase()}</div>
              <button onClick={() => toggleDay(d)} style={{
                width: '100%', height: 24, borderRadius: 999, fontSize: 10, fontWeight: 700,
                background: on ? 'var(--gradient-brand)' : 'var(--bg-hover)',
                color: on ? '#fff' : 'var(--text-tertiary)',
              }}>{on ? 'ON' : 'OFF'}</button>
            </div>
          );
        })}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {DAY_KEYS.filter(d => days[d].on).map(d => (
          <div key={d} style={{ padding: 12, background: 'var(--bg-base)', borderRadius: 12, border: '1px solid var(--border-subtle)' }}>
            <div style={{ fontFamily: 'Inter', fontSize: 12, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>{d}</div>
            {days[d].slots.map((s, i) => (
              <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 6 }}>
                <select value={s[0]} onChange={e => setSlot(d, i, 0, e.target.value)} style={{ flex: 1, height: 34, padding: '0 10px', borderRadius: 8, border: '1px solid var(--border-default)', fontSize: 12, background: 'var(--bg-surface)' }}>
                  {TIMES_OF_DAY.map(t => <option key={t}>{t}</option>)}
                </select>
                <span style={{ color: 'var(--text-muted)' }}>→</span>
                <select value={s[1]} onChange={e => setSlot(d, i, 1, e.target.value)} style={{ flex: 1, height: 34, padding: '0 10px', borderRadius: 8, border: '1px solid var(--border-default)', fontSize: 12, background: 'var(--bg-surface)' }}>
                  {TIMES_OF_DAY.map(t => <option key={t}>{t}</option>)}
                </select>
                <button onClick={() => rmSlot(d, i)} style={{ width: 28, height: 28, color: 'var(--text-tertiary)', borderRadius: 6 }} title="Remove slot"><Icon name="x" size={12}/></button>
              </div>
            ))}
            <button onClick={() => addSlot(d)} style={{ fontSize: 12, color: 'var(--brand-500)', fontWeight: 600, marginTop: 4 }}>+ Add slot</button>
          </div>
        ))}
      </div>
    </>
  );
};

// ═══════════════════════════════════════════════════════════════
// C1 — MENTOR DASHBOARD
// ═══════════════════════════════════════════════════════════════

const MentorDashboard = ({ navigate, mentor }) => {
  const { toast, ToastHost } = useToasts();
  const [accepting, setAccepting] = useStateMA(mentor.acceptingBookings);
  const [pending, setPending] = useStateMA(MENTOR_PENDING_REQUESTS);
  const [declineFor, setDeclineFor] = useStateMA(null);
  const [drawerSession, setDrawerSession] = useStateMA(null);

  const accept = (id) => {
    setPending(p => p.map(r => r.id === id ? { ...r, _state: 'accepted' } : r));
    const req = pending.find(r => r.id === id);
    setTimeout(() => {
      setPending(p => p.filter(r => r.id !== id));
      toast(`Session accepted · ${req?.student.name} notified`);
    }, 800);
  };
  const decline = (id, reason) => {
    setPending(p => p.map(r => r.id === id ? { ...r, _state: 'declined' } : r));
    setTimeout(() => {
      setPending(p => p.filter(r => r.id !== id));
      toast('Request declined');
    }, 500);
    setDeclineFor(null);
  };

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '32px 40px' }}>
      <ToastHost/>

      {/* Greeting */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 20,
        background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)',
        borderRadius: 20, padding: 28, marginBottom: 24, boxShadow: 'var(--shadow-xs)',
      }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: 'Fraunces', fontWeight: 600, fontStyle: 'italic', fontSize: 30, color: 'var(--text-primary)', letterSpacing: '-0.01em' }}>Good morning, Priya ☀️</div>
          <div style={{ fontFamily: 'Inter', fontSize: 14, color: 'var(--text-secondary)', marginTop: 6 }}>You have 2 sessions today. Next in 18 min.</div>
        </div>
        <button onClick={() => { setAccepting(a => !a); toast(accepting ? "You're no longer accepting bookings" : "You're back online ✓", { kind: accepting ? 'warn' : 'success' }); }}
          style={{
            display: 'flex', alignItems: 'center', gap: 8,
            height: 38, padding: '0 16px', borderRadius: 999,
            background: accepting ? 'rgba(16,185,129,0.10)' : 'var(--bg-base)',
            border: '1px solid ' + (accepting ? 'rgba(16,185,129,0.30)' : 'var(--border-default)'),
            color: accepting ? 'var(--mint-700)' : 'var(--text-tertiary)',
            fontFamily: 'Inter', fontSize: 13, fontWeight: 600,
          }}>
          <span style={{ width: 8, height: 8, borderRadius: 999, background: accepting ? 'var(--mint-500)' : 'var(--text-tertiary)', boxShadow: accepting ? '0 0 0 4px rgba(16,185,129,0.15)' : 'none' }}/>
          {accepting ? 'Accepting bookings' : 'Not taking bookings'}
        </button>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 24 }}>
        {[
          { label: 'TODAY', big: '2', sub: 'Sessions today', tone: 'var(--text-primary)' },
          { label: 'THIS WEEK', big: '₹6,420', sub: 'Earnings', tone: 'var(--amber-600)' },
          { label: '248 REVIEWS', big: '4.9 ★', sub: 'Avg rating', tone: 'var(--text-primary)' },
          { label: 'LAST 30 DAYS', big: '97%', sub: 'Response rate', tone: 'var(--text-primary)' },
        ].map((s, i) => (
          <div key={i} style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 16, padding: 22 }}>
            <div className="label-sm" style={{ marginBottom: 8 }}>{s.label}</div>
            <div style={{ fontFamily: 'Fraunces', fontWeight: 700, fontSize: 30, color: s.tone, lineHeight: 1.1, letterSpacing: '-0.01em' }}>{s.big}</div>
            <div style={{ fontSize: 12, color: 'var(--text-tertiary)', marginTop: 4 }}>{s.sub}</div>
          </div>
        ))}
      </div>

      {/* Row 2: today + pending */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 20, marginBottom: 20 }}>
        {/* Today's sessions */}
        <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 16, padding: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18 }}>
            <h3 style={{ flex: 1, fontFamily: 'Inter', fontWeight: 600, fontSize: 16, margin: 0 }}>Today's sessions</h3>
            <span style={{ fontSize: 11, fontWeight: 600, padding: '3px 9px', borderRadius: 999, background: 'var(--bg-base)', color: 'var(--text-secondary)' }}>{MENTOR_SESSIONS_TODAY.length} scheduled</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {MENTOR_SESSIONS_TODAY.map(s => {
              const completed = s.status === 'completed';
              const joinable = !completed && (s.minsAway || 99) <= 15;
              return (
                <button key={s.id} onClick={() => !completed && setDrawerSession(s)} style={{
                  display: 'flex', alignItems: 'center', gap: 14,
                  padding: '14px 16px', borderRadius: 12,
                  background: completed ? 'var(--bg-base)' : 'var(--bg-surface)',
                  border: '1px solid ' + (completed ? 'var(--border-subtle)' : 'var(--border-default)'),
                  opacity: completed ? 0.65 : 1, textAlign: 'left', cursor: completed ? 'default' : 'pointer',
                }}>
                  <div style={{ width: 56, fontFamily: 'JetBrains Mono', fontSize: 12, color: 'var(--text-tertiary)' }}>{s.time}</div>
                  <Avatar name={s.student.name} size={36}/>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontFamily: 'Inter', fontWeight: 600, fontSize: 14 }}>{s.student.name}</span>
                      <span style={{ color: 'var(--text-tertiary)' }}><Icon name={s.type === 'video' ? 'video' : 'mic'} size={13}/></span>
                      <span style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>· {s.duration}min</span>
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }} className="truncate">{s.topic}</div>
                  </div>
                  {completed ? (
                    <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--mint-700)' }}>✓ Completed</span>
                  ) : joinable ? (
                    <button onClick={(e) => { e.stopPropagation(); navigate('mentor-live', { session: s }); }} style={{ height: 34, padding: '0 16px', borderRadius: 999, background: 'var(--gradient-brand)', color: '#fff', fontFamily: 'Inter', fontWeight: 600, fontSize: 12, boxShadow: 'var(--shadow-sm)' }}>Join</button>
                  ) : (
                    <span title="Available 15 min before" style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>in {Math.floor(s.minsAway / 60)}h {s.minsAway % 60}m</span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Pending requests */}
        <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderLeft: pending.length ? '3px solid var(--amber-500)' : '1px solid var(--border-subtle)', borderRadius: 16, padding: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
            <h3 style={{ flex: 1, fontFamily: 'Inter', fontWeight: 600, fontSize: 16, margin: 0 }}>Pending requests</h3>
            <span style={{ fontSize: 11, fontWeight: 600, padding: '3px 9px', borderRadius: 999, background: 'rgba(245,158,11,0.12)', color: 'var(--amber-600)' }}>{pending.length} pending</span>
          </div>
          {pending.length === 0 ? (
            <div style={{ padding: '24px 0', textAlign: 'center', fontSize: 13, color: 'var(--text-tertiary)' }}>No pending requests 🌱</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {pending.slice(0, 3).map(r => (
                <div key={r.id} style={{
                  background: 'var(--bg-base)', borderRadius: 12, padding: '12px 14px',
                  transition: 'all 400ms var(--ease-out-expo)',
                  opacity: r._state ? 0 : 1,
                  transform: r._state ? 'translateY(-8px)' : 'translateY(0)',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                    <Avatar name={r.student.name} size={26}/>
                    <span style={{ fontFamily: 'Inter', fontSize: 13, fontWeight: 600 }}>{r.student.name}</span>
                    <span style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>· {r.requestedAt}</span>
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginBottom: 8 }}>{r.date} · {r.time} · {r.duration}min</div>
                  {declineFor === r.id ? (
                    <div style={{ background: 'var(--bg-surface)', borderRadius: 8, padding: 8, marginTop: 6 }}>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 8 }}>
                        {['Schedule conflict', 'Not my expertise', 'Other'].map(rs => (
                          <button key={rs} onClick={() => decline(r.id, rs)} style={{ fontSize: 11, padding: '4px 8px', borderRadius: 999, border: '1px solid var(--border-default)', background: 'var(--bg-base)', color: 'var(--text-secondary)' }}>{rs}</button>
                        ))}
                      </div>
                      <button onClick={() => setDeclineFor(null)} style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>← Back</button>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button onClick={() => accept(r.id)} style={{ flex: 1, height: 30, borderRadius: 8, background: 'var(--gradient-brand)', color: '#fff', fontFamily: 'Inter', fontSize: 12, fontWeight: 600 }}>✓ Accept</button>
                      <button onClick={() => setDeclineFor(r.id)} style={{ flex: 1, height: 30, borderRadius: 8, background: 'var(--bg-surface)', border: '1px solid var(--border-default)', color: 'var(--text-secondary)', fontFamily: 'Inter', fontSize: 12, fontWeight: 600 }}>✗ Decline</button>
                    </div>
                  )}
                </div>
              ))}
              <button onClick={() => navigate('mentor-bookings', { tab: 'requests' })} style={{ fontSize: 12, color: 'var(--brand-500)', fontWeight: 600, padding: '6px 0', textAlign: 'left', background: 'transparent' }}>View all requests →</button>
            </div>
          )}
        </div>
      </div>

      {/* Row 3: reviews + profile completion */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 16, padding: 24 }}>
          <h3 style={{ fontFamily: 'Inter', fontWeight: 600, fontSize: 16, margin: '0 0 14px' }}>Recent reviews</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {RECENT_REVIEWS.map(rv => (
              <div key={rv.id}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                  {[1,2,3,4,5].map(i => (
                    <span key={i} style={{ color: i <= rv.rating ? 'var(--amber-500)' : 'var(--text-muted)' }}><Icon name="star" size={13}/></span>
                  ))}
                  <span style={{ fontSize: 11, color: 'var(--text-tertiary)', marginLeft: 4 }}>{rv.date}</span>
                </div>
                <div style={{ fontFamily: 'Instrument Sans', fontStyle: 'italic', fontSize: 13, color: 'var(--text-primary)', lineHeight: 1.5 }}>"{rv.excerpt}"</div>
                <div style={{ fontSize: 11, color: 'var(--text-tertiary)', marginTop: 4 }}>— {rv.student}</div>
              </div>
            ))}
          </div>
          <button onClick={() => navigate('mentor-reviews')} style={{ fontSize: 12, color: 'var(--brand-500)', fontWeight: 600, marginTop: 14, background: 'transparent' }}>View all reviews →</button>
        </div>

        <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 16, padding: 24, display: 'flex', flexDirection: 'column' }}>
          <h3 style={{ fontFamily: 'Inter', fontWeight: 600, fontSize: 16, margin: '0 0 14px' }}>Profile completion</h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: 18, flex: 1 }}>
            <ProgressRing pct={mentor.profileCompletionPct}/>
            <ul style={{ flex: 1, padding: 0, margin: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 8 }}>
              {['Add a profile video intro', 'Set your weekend availability', 'Complete certification verification'].map((it, i) => (
                <li key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--text-secondary)' }}>
                  <span style={{ width: 5, height: 5, borderRadius: 999, background: 'var(--amber-500)' }}/>{it}
                </li>
              ))}
            </ul>
          </div>
          <button onClick={() => navigate('mentor-profile-edit')} className="btn btn-ghost btn-sm" style={{ marginTop: 16, alignSelf: 'flex-start' }}>Complete profile →</button>
        </div>
      </div>

      {/* Session detail drawer */}
      {drawerSession && (
        <SessionDrawer session={drawerSession} onClose={() => setDrawerSession(null)} navigate={navigate}/>
      )}

      <style>{`
        @keyframes slideInRight { from { transform: translateX(20px); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
      `}</style>
    </div>
  );
};

const ProgressRing = ({ pct, size = 92 }) => {
  const r = (size - 12) / 2;
  const c = 2 * Math.PI * r;
  return (
    <div style={{ position: 'relative', width: size, height: size }}>
      <svg width={size} height={size}>
        <circle cx={size/2} cy={size/2} r={r} stroke="var(--bg-base)" strokeWidth="8" fill="none"/>
        <circle cx={size/2} cy={size/2} r={r} stroke="url(#pgrad)" strokeWidth="8" fill="none"
          strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c - (c * pct / 100)}
          transform={`rotate(-90 ${size/2} ${size/2})`}/>
        <defs>
          <linearGradient id="pgrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#0D1757"/>
            <stop offset="100%" stopColor="#3D52CC"/>
          </linearGradient>
        </defs>
      </svg>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Fraunces', fontWeight: 700, fontSize: 22, color: 'var(--text-primary)' }}>{pct}%</div>
    </div>
  );
};

const SessionDrawer = ({ session, onClose, navigate }) => (
  <>
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(14,18,40,0.20)', zIndex: 100, animation: 'fadeIn 200ms ease' }}/>
    <div style={{ position: 'fixed', top: 0, right: 0, bottom: 0, width: 420, background: 'var(--bg-surface)', borderLeft: '1px solid var(--border-subtle)', boxShadow: 'var(--shadow-xl)', zIndex: 101, padding: 28, overflowY: 'auto', animation: 'slideInRight 240ms var(--ease-out-expo)' }}>
      <button onClick={onClose} style={{ position: 'absolute', top: 18, right: 18, width: 32, height: 32, borderRadius: 8, color: 'var(--text-tertiary)' }}><Icon name="x" size={16}/></button>
      <h3 style={{ fontFamily: 'Fraunces', fontWeight: 600, fontSize: 22, margin: '0 0 4px' }}>Session details</h3>
      <div style={{ fontSize: 13, color: 'var(--text-tertiary)', marginBottom: 18 }}>{session.time} · {session.duration} min</div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 18 }}>
        <Avatar name={session.student.name} size={44}/>
        <div>
          <div style={{ fontFamily: 'Inter', fontWeight: 600, fontSize: 15 }}>{session.student.name}</div>
          <div style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>Student</div>
        </div>
      </div>
      <div className="label-sm" style={{ marginBottom: 6 }}>TOPIC</div>
      <div style={{ fontSize: 14, color: 'var(--text-primary)', marginBottom: 18 }}>{session.topic}</div>
      <div className="label-sm" style={{ marginBottom: 6 }}>STUDENT NOTES</div>
      <div style={{ background: 'var(--bg-base)', borderRadius: 10, padding: 14, fontFamily: 'Instrument Sans', fontStyle: 'italic', fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
        Looking forward to going deep on this. I've prepared a few questions and a notebook with my current attempts.
      </div>
      <button onClick={() => { onClose(); navigate('mentor-live', { session }); }} disabled={(session.minsAway || 99) > 15} style={{
        width: '100%', height: 44, marginTop: 24, borderRadius: 12, fontFamily: 'Inter', fontWeight: 600, fontSize: 14,
        background: (session.minsAway || 99) <= 15 ? 'var(--gradient-brand)' : 'var(--bg-base)',
        color: (session.minsAway || 99) <= 15 ? '#fff' : 'var(--text-tertiary)',
        opacity: (session.minsAway || 99) <= 15 ? 1 : 0.7,
      }}>{(session.minsAway || 99) <= 15 ? 'Join session' : `Available in ${Math.floor((session.minsAway || 99) / 60)}h ${(session.minsAway || 99) % 60}m`}</button>
    </div>
  </>
);

// Exports
Object.assign(window, {
  MENTOR_USER, MENTOR_SESSIONS_TODAY, MENTOR_PENDING_REQUESTS, MENTOR_UPCOMING, MENTOR_PAST, MENTOR_CANCELLED, RECENT_REVIEWS,
  AvailabilityGrid, MASection, MentorDashboard,
  TIMES_OF_DAY, DAY_KEYS, useToasts: useToasts,
});
