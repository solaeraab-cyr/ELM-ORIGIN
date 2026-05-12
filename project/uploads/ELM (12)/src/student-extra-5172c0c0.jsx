/* global React, Icon, Avatar, NovaOrb, MENTORS */
const { useState, useEffect, useRef, useMemo } = React;

// ═══════════════════════════════════════════════════════════════
// SHARED helpers (toast, modal shell)
// ═══════════════════════════════════════════════════════════════
const toast = (msg) => {
  const id = 'eo-toast-' + Date.now();
  const el = document.createElement('div');
  el.id = id;
  el.textContent = msg;
  el.style.cssText = `
    position:fixed; right:24px; bottom:32px; z-index:9999;
    background: var(--bg-elevated, #fff);
    color: var(--text-primary);
    padding: 12px 18px; border-radius: 14px;
    border: 1px solid var(--border-default);
    box-shadow: var(--shadow-lg, 0 10px 30px rgba(0,0,0,0.15));
    font: 500 14px Inter, sans-serif;
    transform: translateX(20px); opacity: 0;
    transition: all 280ms cubic-bezier(.16,1,.3,1);
  `;
  document.body.appendChild(el);
  requestAnimationFrame(() => { el.style.transform = 'translateX(0)'; el.style.opacity = '1'; });
  setTimeout(() => { el.style.transform = 'translateX(20px)'; el.style.opacity = '0'; setTimeout(() => el.remove(), 320); }, 2600);
};

const ModalShell = ({ onClose, children, width = 520 }) => (
  <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(14,18,40,0.28)', backdropFilter: 'blur(6px)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
    <div className="modal-in" onClick={e => e.stopPropagation()} style={{ width: '100%', maxWidth: width, maxHeight: '90vh', overflowY: 'auto', background: 'var(--bg-surface)', borderRadius: 22, padding: 28, boxShadow: 'var(--shadow-xl)', border: '1px solid var(--border-subtle)' }}>
      {children}
    </div>
  </div>
);

// ═══════════════════════════════════════════════════════════════
// B4c · MENTOR PROFILE DETAIL
// ═══════════════════════════════════════════════════════════════
const MENTOR_REVIEWS = [
  { id: 1, name: 'Ananya R.', stars: 5, date: 'Apr 2026', text: 'Priya broke down eigenvalues better than my prof. Walked through 3 worked examples and gave me practice problems for homework.', helpful: 18 },
  { id: 2, name: 'Vikram P.', stars: 5, date: 'Mar 2026', text: 'Excellent at connecting concepts. We covered gradient descent and she tied it back to chain rule from last week.', helpful: 12 },
  { id: 3, name: 'Riya S.',   stars: 4, date: 'Mar 2026', text: 'Great session, slightly rushed at the end. Would book again.', helpful: 4 },
  { id: 4, name: 'Karan D.',  stars: 5, date: 'Feb 2026', text: 'Clear, patient, makes the hard stuff feel obvious.', helpful: 9 },
  { id: 5, name: 'Maya T.',   stars: 3, date: 'Jan 2026', text: 'Felt like the agenda was too ambitious. Got through half.', helpful: 2 },
];

const MentorProfileDetail = ({ mentor, navigate, openBooking }) => {
  const [tab, setTab] = useState('about');
  const [reviewFilter, setReviewFilter] = useState('All');
  const [saved, setSaved] = useState(false);
  const [showFloat, setShowFloat] = useState(false);
  const heroRef = useRef(null);

  useEffect(() => {
    const onScroll = () => {
      if (!heroRef.current) return;
      const r = heroRef.current.getBoundingClientRect();
      setShowFloat(r.bottom < 80);
    };
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const m = mentor;
  const prices = [
    { label: 'Voice · 30min', val: m.price },
    { label: 'Voice · 60min', val: Math.round(m.price * 1.7) },
    { label: 'Video · 30min', val: m.price + 100 },
    { label: 'Video · 60min', val: Math.round((m.price + 100) * 1.7) },
  ];
  const filtered = MENTOR_REVIEWS.filter(r => {
    if (reviewFilter === 'All') return true;
    if (reviewFilter === 'Critical') return r.stars <= 2;
    return r.stars === parseInt(reviewFilter);
  });
  const breakdown = [5,4,3,2,1].map(s => ({ s, pct: Math.max(2, Math.round(MENTOR_REVIEWS.filter(r => r.stars === s).length / MENTOR_REVIEWS.length * 100)) }));

  return (
    <div className="page fade-in" style={{ paddingBottom: 80 }}>
      {/* Top bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 22 }}>
        <button onClick={() => navigate('mentors')} className="btn btn-ghost btn-sm">
          <Icon name="chevronL" size={13}/> Back to Mentors
        </button>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={() => { setSaved(s => !s); toast(saved ? 'Removed from favorites' : 'Saved to your favorites'); }} className="btn btn-ghost btn-sm" title="Save">
            <span style={{ color: saved ? 'var(--rose-500, #f43f5e)' : 'inherit' }}>{saved ? '♥' : '♡'}</span> {saved ? 'Saved' : 'Save'}
          </button>
          <button onClick={() => { navigator.clipboard?.writeText(`https://elmorigin.app/m/${m.id}`); toast('Link copied'); }} className="btn btn-ghost btn-sm">↗ Share</button>
        </div>
      </div>

      {/* Hero */}
      <div ref={heroRef} className="card" style={{ padding: 32, marginBottom: 24, display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 32 }}>
        <div>
          <div style={{ position: 'relative', width: 120, height: 120, marginBottom: 18 }}>
            <Avatar name={m.name} size={120}/>
            <div style={{ position: 'absolute', inset: 0, borderRadius: 999, boxShadow: '0 0 0 4px var(--bg-surface)' }}/>
            <div style={{ position: 'absolute', bottom: 0, right: 0, width: 32, height: 32, borderRadius: 999, background: 'var(--gradient-brand, linear-gradient(135deg,#4F46E5,#6366F1))', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '3px solid var(--bg-surface)' }}>
              <Icon name="check" size={14} stroke={3}/>
            </div>
          </div>
          <h1 className="font-display" style={{ fontSize: 36, fontWeight: 700, letterSpacing: '-0.02em', marginBottom: 6 }}>{m.name}</h1>
          <div style={{ color: 'var(--text-secondary)', fontFamily: 'Instrument Sans', fontSize: 15, marginBottom: 14 }}>{m.title}</div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 16 }}>
            {m.tags.map(t => <span key={t} className="chip chip-sm">{t}</span>)}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, color: 'var(--text-secondary)', marginBottom: 8 }}>
            <span><span style={{ color: 'var(--amber-500)' }}>★</span> <span style={{ fontFamily: 'JetBrains Mono', fontWeight: 600, color: 'var(--text-primary)' }}>{m.rating}</span></span>
            <span>·</span>
            <span><span style={{ fontFamily: 'JetBrains Mono' }}>{m.reviews}</span> reviews</span>
            <span>·</span>
            <span><span style={{ fontFamily: 'JetBrains Mono' }}>{m.students}</span> students</span>
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-tertiary)', marginBottom: 12 }}>🇬🇧 English · 🇮🇳 Hindi</div>
          <span className="chip chip-sm"><Icon name="clock" size={11}/> Replies in ~2h</span>
        </div>

        <div style={{ background: 'linear-gradient(135deg, rgba(79,70,229,0.06), rgba(99,102,241,0.02))', border: '1px solid var(--border-brand, rgba(79,70,229,0.20))', borderRadius: 18, padding: 22, display: 'flex', flexDirection: 'column' }}>
          <div className="label-sm" style={{ marginBottom: 14, color: 'var(--brand-600)' }}>Pricing</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 18 }}>
            {prices.map(p => (
              <div key={p.label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                <span style={{ color: 'var(--text-secondary)' }}>{p.label}</span>
                <span style={{ fontFamily: 'JetBrains Mono', fontWeight: 600, color: 'var(--text-primary)' }}>₹{p.val}</span>
              </div>
            ))}
          </div>
          <button onClick={openBooking} className="btn btn-primary btn-lg" style={{ width: '100%', justifyContent: 'center' }}>
            Book a Session <Icon name="chevronR" size={14}/>
          </button>
          <div style={{ fontSize: 11, color: 'var(--text-tertiary)', textAlign: 'center', marginTop: 10 }}>Cancel free up to 4h before</div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ position: 'sticky', top: 68, zIndex: 5, display: 'flex', gap: 28, background: 'var(--bg-base)', borderBottom: '1px solid var(--border-subtle)', padding: '14px 0', marginBottom: 28 }}>
        {['about','experience','reviews','availability'].map(t => (
          <button key={t} onClick={() => setTab(t)} style={{
            position: 'relative', padding: '8px 2px', textTransform: 'capitalize',
            color: tab === t ? 'var(--text-primary)' : 'var(--text-secondary)',
            fontFamily: 'Inter', fontWeight: tab === t ? 600 : 500, fontSize: 14,
          }}>
            {t}
            {tab === t && <div style={{ position: 'absolute', bottom: -15, left: 0, right: 0, height: 3, borderRadius: 2, background: 'var(--gradient-brand, var(--brand-500))' }}/>}
          </button>
        ))}
      </div>

      {tab === 'about' && (
        <div className="fade-in-up" style={{ maxWidth: 760 }}>
          <p style={{ fontSize: 15, lineHeight: 1.7, color: 'var(--text-primary)', marginBottom: 24 }}>
            I'm a data scientist at Google with 8+ years of teaching experience. I love helping students bridge the gap between textbook math and the kind of math you actually use to build models. We'll work through problems together — no copy-paste, no jargon, just clarity.
          </p>
          <blockquote style={{ fontFamily: 'Fraunces', fontStyle: 'italic', fontSize: 19, color: 'var(--text-secondary)', borderLeft: '3px solid var(--brand-400, var(--brand-500))', paddingLeft: 20, marginLeft: 0, marginBottom: 28, lineHeight: 1.5 }}>
            "The best way to learn math is to be allowed to be wrong out loud, then taught why it's wrong."
          </blockquote>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
            {[['Sessions delivered', m.students], ['Avg rating', m.rating + ' ★'], ['Repeat students', '62%']].map(([l, v]) => (
              <div key={l} className="card" style={{ padding: 18 }}>
                <div className="font-display" style={{ fontSize: 26, fontWeight: 600 }}>{v}</div>
                <div className="label-sm" style={{ marginTop: 4 }}>{l}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === 'experience' && (
        <div className="fade-in-up" style={{ maxWidth: 760 }}>
          <h3 className="font-heading" style={{ fontSize: 17, fontWeight: 600, marginBottom: 18 }}>Education</h3>
          <div style={{ marginBottom: 36 }}>
            {[
              ['2014', 'B.Tech, Computer Science', 'IIT Bombay'],
              ['2017', 'M.S. Statistics', 'Stanford University'],
              ['2018', 'Joined Google Research', 'Mountain View, CA'],
            ].map(([yr, deg, inst], i, a) => (
              <div key={i} style={{ display: 'flex', gap: 16, position: 'relative', paddingBottom: i < a.length - 1 ? 22 : 0 }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <div style={{ width: 12, height: 12, borderRadius: 999, background: 'var(--brand-500)', marginTop: 4 }}/>
                  {i < a.length - 1 && <div style={{ flex: 1, width: 2, background: 'var(--border-default)', marginTop: 2 }}/>}
                </div>
                <div>
                  <div style={{ fontFamily: 'JetBrains Mono', fontSize: 11, color: 'var(--text-tertiary)' }}>{yr}</div>
                  <div style={{ fontFamily: 'Inter', fontWeight: 600, fontSize: 14, marginTop: 2 }}>{deg}</div>
                  <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 2 }}>{inst}</div>
                </div>
              </div>
            ))}
          </div>
          <h3 className="font-heading" style={{ fontSize: 17, fontWeight: 600, marginBottom: 14 }}>Certifications</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10, marginBottom: 28 }}>
            {[['TensorFlow Developer', 'Google', '2021'], ['Deep Learning Specialization', 'deeplearning.ai', '2020']].map(([n, iss, yr]) => (
              <div key={n} className="card" style={{ padding: 14 }}>
                <div style={{ fontWeight: 600, fontSize: 13 }}>{n}</div>
                <div style={{ fontSize: 12, color: 'var(--text-tertiary)', marginTop: 2 }}>{iss} · {yr}</div>
              </div>
            ))}
          </div>
          <h3 className="font-heading" style={{ fontSize: 17, fontWeight: 600, marginBottom: 14 }}>Specializations</h3>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {['Linear Algebra','Probability','Bayesian Statistics','Pandas','NumPy','Scikit-learn','PyTorch','TensorFlow','Causal Inference'].map(s => (
              <span key={s} className="chip chip-sm">{s}</span>
            ))}
          </div>
        </div>
      )}

      {tab === 'reviews' && (
        <div className="fade-in-up">
          <div className="card" style={{ padding: 24, marginBottom: 20, display: 'grid', gridTemplateColumns: '180px 1fr', gap: 28, alignItems: 'center' }}>
            <div style={{ textAlign: 'center' }}>
              <div className="font-display" style={{ fontSize: 56, fontWeight: 700, color: 'var(--amber-500)', lineHeight: 1 }}>{m.rating}</div>
              <div style={{ color: 'var(--amber-500)', fontSize: 14, margin: '6px 0' }}>★★★★★</div>
              <div className="label-sm">({m.reviews} reviews)</div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {breakdown.map(({ s, pct }) => (
                <div key={s} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 12 }}>
                  <span style={{ width: 32, color: 'var(--text-secondary)' }}>{s}★</span>
                  <div style={{ flex: 1, height: 6, borderRadius: 999, background: 'var(--bg-subtle, var(--bg-hover))', overflow: 'hidden' }}>
                    <div style={{ width: pct + '%', height: '100%', background: 'var(--gradient-brand, var(--brand-500))', transition: 'width 600ms cubic-bezier(.16,1,.3,1)' }}/>
                  </div>
                  <span style={{ width: 36, textAlign: 'right', fontFamily: 'JetBrains Mono', color: 'var(--text-tertiary)' }}>{pct}%</span>
                </div>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', gap: 6, marginBottom: 18, flexWrap: 'wrap' }}>
            {['All','5','4','3','Critical'].map(f => (
              <button key={f} onClick={() => setReviewFilter(f)} className={`chip ${reviewFilter === f ? 'active' : ''}`}>
                {f === 'Critical' ? 'Critical 1–2★' : f === 'All' ? 'All' : f + '★'}
              </button>
            ))}
          </div>

          {filtered.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 60, color: 'var(--text-tertiary)' }}>
              <div style={{ fontSize: 32, marginBottom: 8 }}>🌱</div>
              <div className="font-display italic" style={{ fontSize: 22 }}>No critical reviews yet</div>
              <div style={{ fontSize: 13, marginTop: 6 }}>This mentor has only positive feedback so far.</div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {filtered.map(r => <ReviewCard key={r.id} r={r}/>)}
            </div>
          )}
        </div>
      )}

      {tab === 'availability' && (
        <div className="fade-in-up">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 12 }}>
            {Array.from({ length: 7 }).map((_, i) => {
              const d = new Date(2026, 4, 11 + i);
              const slots = ['10:00 AM','2:30 PM','4:00 PM','5:30 PM'].slice(0, 2 + (i % 3));
              const taken = i % 3 === 0;
              return (
                <div key={i} className="card" style={{ padding: 14 }}>
                  <div style={{ fontFamily: 'Inter', fontWeight: 600, fontSize: 12, color: 'var(--text-tertiary)' }}>{d.toLocaleDateString('en', { weekday: 'short' })}</div>
                  <div className="font-display" style={{ fontSize: 22, fontWeight: 600, marginBottom: 10 }}>{d.getDate()}</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    {slots.map((s, j) => {
                      const isTaken = taken && j === 0;
                      return (
                        <button key={s} disabled={isTaken} onClick={() => { openBooking(); toast('Time pre-filled in booking'); }} className="chip chip-sm" style={{
                          justifyContent: 'center', fontSize: 11, opacity: isTaken ? 0.4 : 1,
                          textDecoration: isTaken ? 'line-through' : 'none',
                        }}>{s}</button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Floating CTA */}
      {showFloat && (
        <div className="fade-in-up" style={{ position: 'fixed', bottom: 24, left: '50%', transform: 'translateX(-50%)', zIndex: 50, background: 'var(--bg-surface)', border: '1px solid var(--border-default)', borderRadius: 999, padding: '8px 8px 8px 16px', display: 'flex', alignItems: 'center', gap: 14, boxShadow: 'var(--shadow-xl)' }}>
          <Avatar name={m.name} size={32}/>
          <span style={{ fontSize: 13, fontWeight: 600 }}>{m.name}</span>
          <button onClick={openBooking} className="btn btn-primary btn-sm">Book a Session</button>
        </div>
      )}
    </div>
  );
};

const ReviewCard = ({ r }) => {
  const [helpful, setHelpful] = useState(r.helpful);
  const [marked, setMarked] = useState(false);
  return (
    <div className="card" style={{ padding: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <Avatar name={r.name} size={36}/>
          <div>
            <div style={{ fontWeight: 600, fontSize: 13 }}>{r.name}</div>
            <div style={{ color: 'var(--amber-500)', fontSize: 12 }}>{'★'.repeat(r.stars)}{'☆'.repeat(5 - r.stars)}</div>
          </div>
        </div>
        <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>{r.date}</div>
      </div>
      <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>{r.text}</p>
      <button onClick={() => { if (!marked) { setHelpful(h => h + 1); setMarked(true); toast('Marked helpful'); } }} style={{ marginTop: 12, fontSize: 12, color: marked ? 'var(--brand-500)' : 'var(--text-tertiary)' }}>
        👍 {helpful} found this helpful
      </button>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════
// B4e · MY SESSIONS
// ═══════════════════════════════════════════════════════════════
const buildSessions = () => {
  const M = window.MENTORS || [];
  return [
    { id: 1, mentor: M[0], topic: 'Intro to Pandas DataFrames', date: 'Apr 28, 2026', time: '4:00 PM', duration: 60, type: 'video', status: 'upcoming', countdown: 'in 2 days', agenda: 'Walk through the assignment from last week and intro DataFrame groupby + merge.' },
    { id: 2, mentor: M[3], topic: 'JEE Physics — rotational mechanics', date: 'Apr 28, 2026', time: '7:30 PM', duration: 30, type: 'voice', status: 'upcoming', countdown: 'in 18 min', agenda: 'Cover angular momentum problem set.' },
    { id: 3, mentor: M[1], topic: 'System design — rate limiters', date: 'May 2, 2026', time: '10:00 AM', duration: 60, type: 'video', status: 'upcoming', countdown: 'in 5 days', agenda: 'Whiteboard a token bucket + sliding window.' },
    { id: 4, mentor: M[0], topic: 'Linear algebra review', date: 'Apr 15, 2026', time: '3:00 PM', duration: 60, type: 'video', status: 'past', reviewed: false },
    { id: 5, mentor: M[2], topic: 'Thesis writing — argumentation', date: 'Apr 10, 2026', time: '11:00 AM', duration: 30, type: 'voice', status: 'past', reviewed: true, reviewStars: 5 },
    { id: 6, mentor: M[3], topic: 'JEE — calc warm-up', date: 'Apr 5, 2026', time: '6:00 PM', duration: 30, type: 'voice', status: 'past', reviewed: true, reviewStars: 4 },
    { id: 7, mentor: M[4], topic: 'Portfolio review', date: 'Mar 30, 2026', time: '5:00 PM', duration: 60, type: 'video', status: 'cancelled', refund: 'Refunded ₹599' },
  ].filter(s => s.mentor);
};

const MySessions = ({ user, navigate, openBooking }) => {
  const [filter, setFilter] = useState('upcoming');
  const [sessions, setSessions] = useState(buildSessions);
  const [menuId, setMenuId] = useState(null);
  const [modal, setModal] = useState(null); // {kind, session}
  const [agendaOpen, setAgendaOpen] = useState(null);

  const counts = {
    upcoming: sessions.filter(s => s.status === 'upcoming').length,
    past: sessions.filter(s => s.status === 'past').length,
    cancelled: sessions.filter(s => s.status === 'cancelled').length,
  };
  const list = sessions.filter(s => s.status === filter);

  return (
    <div className="page fade-in">
      <div style={{ marginBottom: 22 }}>
        <h1 className="font-display" style={{ fontSize: 38, fontWeight: 500 }}>My sessions</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginTop: 6 }}>Your upcoming and past 1-on-1 sessions.</p>
      </div>

      <div style={{ display: 'flex', gap: 6, marginBottom: 24, flexWrap: 'wrap' }}>
        {[['upcoming','Upcoming'],['past','Past'],['cancelled','Cancelled']].map(([k, l]) => (
          <button key={k} onClick={() => setFilter(k)} className={`chip ${filter === k ? 'active' : ''}`}>
            {l} ({counts[k]})
          </button>
        ))}
      </div>

      {list.length === 0 ? (
        <EmptyState
          icon="📅"
          title={filter === 'upcoming' ? 'No upcoming sessions' : filter === 'past' ? 'Your session history will appear here' : 'No cancellations — keep that streak going'}
          desc={filter === 'upcoming' ? 'Book a mentor to start learning 1-on-1' : ''}
          cta={filter === 'upcoming' ? { label: 'Find a Mentor', onClick: () => navigate('mentors') } : null}
        />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {list.map(s => (
            <SessionCard key={s.id} session={s} agendaOpen={agendaOpen === s.id} setAgendaOpen={(v) => setAgendaOpen(v ? s.id : null)}
              menuOpen={menuId === s.id} setMenuOpen={(v) => setMenuId(v ? s.id : null)}
              onJoin={() => navigate('room', { id: 'mentor-' + s.id, topic: s.topic, subject: s.mentor.subject, host: s.mentor.name, participants: 2, max: 2, duration: '0m', vibe: 'focus', type: 'mentor-session' })}
              onReschedule={() => { setMenuId(null); setModal({ kind: 'reschedule', session: s }); }}
              onCancel={() => { setMenuId(null); setModal({ kind: 'cancel', session: s }); }}
              onReview={() => setModal({ kind: 'review', session: s })}
              onRebook={() => openBooking(s.mentor)}
            />
          ))}
        </div>
      )}

      {modal && <SessionModal modal={modal} onClose={() => setModal(null)}
        onResched={(d) => { setSessions(ss => ss.map(x => x.id === modal.session.id ? { ...x, date: d, countdown: 'rescheduled' } : x)); setModal(null); toast('Rescheduled to ' + d + ' ✓'); }}
        onConfirmCancel={() => { setSessions(ss => ss.map(x => x.id === modal.session.id ? { ...x, status: 'cancelled', refund: 'Pending refund' } : x)); setModal(null); toast('Session cancelled, refund processing'); }}
        onSubmitReview={(stars) => { setSessions(ss => ss.map(x => x.id === modal.session.id ? { ...x, reviewed: true, reviewStars: stars } : x)); setModal(null); toast('Thanks for your review ✓'); }}
      />}
    </div>
  );
};

const SessionCard = ({ session: s, menuOpen, setMenuOpen, agendaOpen, setAgendaOpen, onJoin, onReschedule, onCancel, onReview, onRebook }) => {
  const isUpcoming = s.status === 'upcoming';
  const isCancelled = s.status === 'cancelled';
  const isPast = s.status === 'past';
  const joinActive = isUpcoming && s.countdown && s.countdown.includes('min');
  const countdownColor = !s.countdown ? null : s.countdown.includes('min') ? 'var(--gradient-brand, var(--brand-500))' : s.countdown.includes('hour') ? 'var(--amber-500)' : 'var(--mint-500)';

  return (
    <div className="card" style={{
      padding: 18, display: 'flex', flexDirection: 'column', gap: 12,
      opacity: isCancelled ? 0.7 : isPast ? 0.86 : 1,
      borderLeft: isPast ? '3px solid var(--text-tertiary)' : isCancelled ? '3px solid var(--rose-400, var(--text-tertiary))' : '1px solid var(--border-subtle)',
    }}>
      <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
        <Avatar name={s.mentor.name} size={52}/>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontFamily: 'Inter', fontWeight: 600, fontSize: 15, textDecoration: isCancelled ? 'line-through' : 'none' }}>{s.topic}</div>
          <div style={{ color: 'var(--text-secondary)', fontSize: 12, marginTop: 3 }}>
            with {s.mentor.name} · {s.date} · {s.time} · {s.duration}min <Icon name={s.type === 'video' ? 'mentors' : 'mic'} size={11}/>
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8, position: 'relative' }}>
          {isUpcoming && s.countdown && (
            <span style={{ fontSize: 11, fontFamily: 'Inter', fontWeight: 600, padding: '4px 10px', borderRadius: 999, background: typeof countdownColor === 'string' && countdownColor.includes('gradient') ? countdownColor : 'transparent', backgroundColor: typeof countdownColor === 'string' && !countdownColor.includes('gradient') ? countdownColor : undefined, color: '#fff' }}>{s.countdown}</span>
          )}
          {isCancelled && (
            <span className="chip chip-sm" style={{ color: s.refund.includes('Pending') ? 'var(--amber-600)' : 'var(--mint-600)' }}>{s.refund}</span>
          )}
          {isUpcoming && (
            <div style={{ display: 'flex', gap: 6 }}>
              <button onClick={onJoin} disabled={!joinActive} className="btn btn-primary btn-sm" title={joinActive ? '' : 'Available 15 min before start'} style={{ opacity: joinActive ? 1 : 0.5 }}>Join Session</button>
              <button onClick={() => setAgendaOpen(!agendaOpen)} className="btn btn-ghost btn-sm">View Agenda</button>
              <button onClick={() => setMenuOpen(!menuOpen)} className="btn btn-ghost btn-sm" style={{ padding: '0 10px' }}>⋯</button>
              {menuOpen && (
                <div style={{ position: 'absolute', top: '100%', right: 0, marginTop: 6, background: 'var(--bg-surface)', border: '1px solid var(--border-default)', borderRadius: 12, padding: 6, minWidth: 180, boxShadow: 'var(--shadow-lg)', zIndex: 10 }}>
                  <button onClick={onReschedule} style={menuBtn}>Reschedule</button>
                  <button onClick={onCancel} style={{ ...menuBtn, color: 'var(--rose-500, var(--text-primary))' }}>Cancel with message</button>
                </div>
              )}
            </div>
          )}
          {isPast && (
            <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
              {s.reviewed ? (
                <span style={{ fontSize: 12, color: 'var(--mint-600)' }}>★ {s.reviewStars} · Reviewed</span>
              ) : (
                <button onClick={onReview} className="btn btn-primary btn-sm">Leave Review</button>
              )}
              <button onClick={onRebook} className="btn btn-ghost btn-sm">Book Again</button>
            </div>
          )}
        </div>
      </div>
      {agendaOpen && s.agenda && (
        <div className="fade-in" style={{ padding: 12, background: 'var(--bg-hover)', borderRadius: 10, fontSize: 13, color: 'var(--text-secondary)' }}>
          <span className="label-sm" style={{ marginRight: 6 }}>Agenda</span>{s.agenda}
        </div>
      )}
    </div>
  );
};

const menuBtn = { display: 'block', width: '100%', textAlign: 'left', padding: '8px 12px', borderRadius: 8, fontSize: 13, color: 'var(--text-primary)' };

const SessionModal = ({ modal, onClose, onResched, onConfirmCancel, onSubmitReview }) => {
  const [reschDate, setReschDate] = useState('May 5, 2026');
  const [reason, setReason] = useState('');
  const [stars, setStars] = useState(5);
  const [reviewText, setReviewText] = useState('');

  return (
    <ModalShell onClose={onClose}>
      {modal.kind === 'reschedule' && (
        <>
          <h3 className="font-display" style={{ fontSize: 22, fontWeight: 600, marginBottom: 14 }}>Reschedule session</h3>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 16 }}>Pick a new date for "{modal.session.topic}".</p>
          <input className="input" value={reschDate} onChange={e => setReschDate(e.target.value)} style={{ marginBottom: 18 }}/>
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
            <button onClick={onClose} className="btn btn-ghost btn-md">Cancel</button>
            <button onClick={() => onResched(reschDate)} className="btn btn-primary btn-md">Save</button>
          </div>
        </>
      )}
      {modal.kind === 'cancel' && (
        <>
          <h3 className="font-display" style={{ fontSize: 22, fontWeight: 600, marginBottom: 10 }}>Cancel session?</h3>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 16 }}>Tell {modal.session.mentor.name} why (optional).</p>
          <textarea className="textarea" value={reason} onChange={e => setReason(e.target.value)} placeholder="Schedule conflict…" style={{ height: 100, marginBottom: 18 }}/>
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
            <button onClick={onClose} className="btn btn-ghost btn-md">Keep session</button>
            <button onClick={onConfirmCancel} className="btn btn-md" style={{ background: 'var(--rose-500, #f43f5e)', color: '#fff' }}>Confirm cancel</button>
          </div>
        </>
      )}
      {modal.kind === 'review' && (
        <>
          <h3 className="font-display" style={{ fontSize: 22, fontWeight: 600, marginBottom: 14 }}>How was your session?</h3>
          <div style={{ display: 'flex', gap: 6, justifyContent: 'center', marginBottom: 20, fontSize: 32 }}>
            {[1,2,3,4,5].map(n => (
              <button key={n} onClick={() => setStars(n)} style={{ color: n <= stars ? 'var(--amber-500)' : 'var(--text-tertiary)' }}>★</button>
            ))}
          </div>
          <textarea className="textarea" value={reviewText} onChange={e => setReviewText(e.target.value)} placeholder="What stood out?" style={{ height: 110, marginBottom: 18 }}/>
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
            <button onClick={onClose} className="btn btn-ghost btn-md">Skip</button>
            <button onClick={() => onSubmitReview(stars)} className="btn btn-primary btn-md">Submit review</button>
          </div>
        </>
      )}
    </ModalShell>
  );
};

const EmptyState = ({ icon, title, desc, cta }) => (
  <div style={{ textAlign: 'center', padding: '80px 20px', color: 'var(--text-tertiary)' }}>
    <div style={{ fontSize: 40, marginBottom: 14 }}>{icon}</div>
    <div className="font-display" style={{ fontSize: 22, fontWeight: 500, color: 'var(--text-primary)', marginBottom: 6 }}>{title}</div>
    {desc && <div style={{ fontSize: 13, marginBottom: 20, maxWidth: 320, margin: '0 auto 20px' }}>{desc}</div>}
    {cta && <button onClick={cta.onClick} className="btn btn-primary btn-md">{cta.label}</button>}
  </div>
);

// ═══════════════════════════════════════════════════════════════
// B7 · PROFILE
// ═══════════════════════════════════════════════════════════════
const COVER_PRESETS = [
  { id: 'brand',   grad: 'linear-gradient(135deg,#4F46E5,#6366F1,#818CF8)' },
  { id: 'warm',    grad: 'linear-gradient(135deg,#F59E0B,#EF4444,#D946EF)' },
  { id: 'ai',      grad: 'linear-gradient(135deg,#10B981,#06B6D4,#3B82F6)' },
  { id: 'premium', grad: 'linear-gradient(135deg,#F59E0B,#D97706,#B45309)' },
  { id: 'violet',  grad: 'linear-gradient(135deg,#8B5CF6,#A855F7,#EC4899)' },
  { id: 'twilight',grad: 'linear-gradient(135deg,#1E293B,#4F46E5,#7C3AED)' },
];

const BADGES = [
  { id: 'first',     name: 'First Session',  desc: 'Completed your first 1-on-1 session', earned: true,  rarity: '92% of students' },
  { id: 'streak7',   name: '7-Day Streak',   desc: 'Logged in 7 days in a row',           earned: true,  rarity: '64% of students' },
  { id: 'streak30',  name: '30-Day Streak',  desc: 'Logged in 30 days in a row',          earned: false, rarity: '18% of students' },
  { id: 'quiz',      name: 'Quiz Master',    desc: 'Scored 100% on 5 quizzes',            earned: true,  rarity: '41% of students' },
  { id: 'night',     name: 'Night Owl',      desc: 'Studied past midnight 10 times',      earned: false, rarity: '23% of students' },
  { id: 'early',     name: 'Early Bird',     desc: 'Started before 7am 10 times',         earned: false, rarity: '15% of students' },
  { id: 'top10',     name: 'Top 10%',        desc: 'Among the top 10% this month',        earned: true,  rarity: '10% of students' },
  { id: 'helpful',   name: 'Helpful',        desc: 'Got 25 helpful marks on reviews',     earned: false, rarity: '8% of students' },
  { id: 'pro',       name: 'Pro Member',     desc: 'Upgraded to a Pro plan',              earned: false, rarity: '34% of students' },
  { id: 'verified',  name: 'Verified',       desc: 'Completed full identity verification',earned: true,  rarity: '52% of students' },
];

const ProfilePage = ({ user, navigate }) => {
  const [cover, setCover] = useState(() => localStorage.getItem('elmorigin:cover') || 'brand');
  const [coverOpen, setCoverOpen] = useState(false);
  const [edit, setEdit] = useState(false);
  const [tab, setTab] = useState('about');
  const [draft, setDraft] = useState({ name: user.name, handle: '@arjun', tagline: 'CS · 2nd Year · IIT Bombay', bio: 'Building toward a career in ML systems. Currently obsessed with distributed training and the math behind it.' });
  const [saved, setSaved] = useState(draft);
  const [openBadge, setOpenBadge] = useState(null);

  useEffect(() => { localStorage.setItem('elmorigin:cover', cover); }, [cover]);
  const dirty = JSON.stringify(draft) !== JSON.stringify(saved);
  const coverGrad = COVER_PRESETS.find(c => c.id === cover)?.grad || COVER_PRESETS[0].grad;

  return (
    <div className="page fade-in" style={{ paddingBottom: 100 }}>
      {/* Cover */}
      <div style={{ height: 200, borderRadius: 18, background: coverGrad, position: 'relative', marginBottom: 0 }}>
        <button onClick={() => setCoverOpen(true)} className="btn btn-sm" style={{ position: 'absolute', top: 16, right: 16, background: 'rgba(255,255,255,0.18)', color: '#fff', backdropFilter: 'blur(10px)' }}>✏ Edit Cover</button>
      </div>

      {/* Avatar row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: -40, marginBottom: 18, padding: '0 8px' }}>
        <div style={{ position: 'relative', borderRadius: 999, boxShadow: '0 0 0 4px var(--bg-base)' }}>
          <Avatar name={saved.name} size={96}/>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {!edit ? (
            <button onClick={() => setEdit(true)} className="btn btn-ghost btn-md">Edit Profile</button>
          ) : null}
        </div>
      </div>

      {/* Identity */}
      <div style={{ marginBottom: 24 }}>
        {edit ? (
          <>
            <input className="input" value={draft.name} onChange={e => setDraft({ ...draft, name: e.target.value })} style={{ fontFamily: 'Fraunces', fontWeight: 700, fontSize: 30, marginBottom: 8 }}/>
            <input className="input" value={draft.handle} onChange={e => setDraft({ ...draft, handle: e.target.value })} style={{ fontSize: 13, marginBottom: 8 }}/>
            <input className="input" value={draft.tagline} onChange={e => setDraft({ ...draft, tagline: e.target.value })} style={{ fontSize: 13 }}/>
          </>
        ) : (
          <>
            <h1 className="font-display" style={{ fontSize: 32, fontWeight: 700, letterSpacing: '-0.02em' }}>{saved.name}</h1>
            <div style={{ color: 'var(--text-secondary)', fontSize: 14, marginTop: 4 }}>{saved.handle}</div>
            <div style={{ color: 'var(--text-secondary)', fontSize: 13, marginTop: 4 }}>{saved.tagline}</div>
            <div style={{ display: 'flex', gap: 6, marginTop: 12 }}>
              {['Computer Science','Mathematics','Machine Learning'].map(t => <span key={t} className="chip chip-sm">{t}</span>)}
            </div>
          </>
        )}
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 28 }}>
        {[['Sessions', 12], ['Streak', '15 🔥'], ['Mentors', 4], ['Goals', '3 active']].map(([l, v]) => (
          <div key={l} className="card" style={{ padding: 18 }}>
            <div className="font-display" style={{ fontSize: 26, fontWeight: 700 }}>{v}</div>
            <div className="label-sm" style={{ marginTop: 4 }}>{l}</div>
          </div>
        ))}
      </div>

      {/* Badges strip */}
      <div style={{ marginBottom: 28 }}>
        <div className="label-sm" style={{ marginBottom: 10 }}>Badges</div>
        <div style={{ display: 'flex', gap: 10, overflowX: 'auto', paddingBottom: 6 }}>
          {BADGES.map(b => (
            <button key={b.id} onClick={() => setOpenBadge(b)} title={b.name} style={{
              flexShrink: 0, width: 56, height: 56, borderRadius: 14,
              background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              filter: b.earned ? 'none' : 'grayscale(0.6) opacity(0.55)',
              fontSize: 22,
            }}>{b.id === 'streak7' || b.id === 'streak30' ? '🔥' : b.id === 'quiz' ? '🎯' : b.id === 'night' ? '🌙' : b.id === 'early' ? '🌅' : b.id === 'top10' ? '🏆' : b.id === 'helpful' ? '🤝' : b.id === 'pro' ? '⭐' : b.id === 'verified' ? '✓' : '🌱'}</button>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 24, borderBottom: '1px solid var(--border-subtle)', marginBottom: 24 }}>
        {['about','activity','badges'].map(t => (
          <button key={t} onClick={() => setTab(t)} style={{
            position: 'relative', padding: '10px 0', textTransform: 'capitalize',
            color: tab === t ? 'var(--text-primary)' : 'var(--text-secondary)',
            fontFamily: 'Inter', fontWeight: tab === t ? 600 : 500, fontSize: 14,
          }}>{t}
            {tab === t && <div style={{ position: 'absolute', bottom: -1, left: 0, right: 0, height: 3, background: 'var(--gradient-brand, var(--brand-500))' }}/>}
          </button>
        ))}
      </div>

      {tab === 'about' && (
        <div className="fade-in-up" style={{ maxWidth: 720 }}>
          {edit ? (
            <textarea className="textarea" value={draft.bio} onChange={e => setDraft({ ...draft, bio: e.target.value.slice(0, 400) })} style={{ height: 130 }}/>
          ) : (
            <p style={{ fontSize: 15, lineHeight: 1.7, color: 'var(--text-primary)' }}>{saved.bio}</p>
          )}
          <h3 className="font-heading" style={{ fontSize: 16, fontWeight: 600, marginTop: 26, marginBottom: 12 }}>Current goals</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[['Finish PyTorch course', 68], ['100 algorithm problems', 42], ['Read 5 ML papers', 80]].map(([t, p]) => (
              <div key={t} className="card" style={{ padding: 14 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 6 }}>
                  <span style={{ fontWeight: 600 }}>{t}</span>
                  <span style={{ fontFamily: 'JetBrains Mono', color: 'var(--text-tertiary)' }}>{p}%</span>
                </div>
                <div style={{ height: 6, background: 'var(--bg-hover)', borderRadius: 999, overflow: 'hidden' }}>
                  <div style={{ width: p + '%', height: '100%', background: 'var(--gradient-brand, var(--brand-500))' }}/>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === 'activity' && (
        <div className="fade-in-up" style={{ maxWidth: 720 }}>
          {[
            ['focus','Completed 25-min focus session', '2h ago', 'productivity'],
            ['mentors','Booked session with Priya Sharma', 'yesterday', 'my-sessions'],
            ['sparkles','Earned 7-Day Streak badge', '3 days ago', 'profile'],
            ['community','Joined React Patterns room', 'last week', 'rooms'],
          ].map(([ic, t, when, route], i, a) => (
            <button key={i} onClick={() => navigate(route)} style={{ display: 'flex', gap: 14, width: '100%', textAlign: 'left', padding: '14px 0', borderBottom: i < a.length - 1 ? '1px solid var(--border-subtle)' : 'none' }}>
              <div style={{ width: 32, height: 32, borderRadius: 10, background: 'var(--bg-hover)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: 'var(--brand-500)' }}>
                <Icon name={ic} size={14}/>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 500 }}>{t}</div>
                <div style={{ fontSize: 11, color: 'var(--text-tertiary)', marginTop: 2 }}>{when}</div>
              </div>
            </button>
          ))}
        </div>
      )}

      {tab === 'badges' && (
        <div className="fade-in-up" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 14 }}>
          {BADGES.map(b => (
            <button key={b.id} onClick={() => setOpenBadge(b)} className="card" style={{ padding: 18, textAlign: 'center', filter: b.earned ? 'none' : 'grayscale(0.6) opacity(0.6)', position: 'relative' }}>
              <div style={{ fontSize: 36, marginBottom: 8 }}>{b.id === 'streak7' || b.id === 'streak30' ? '🔥' : b.id === 'quiz' ? '🎯' : b.id === 'night' ? '🌙' : b.id === 'early' ? '🌅' : b.id === 'top10' ? '🏆' : b.id === 'helpful' ? '🤝' : b.id === 'pro' ? '⭐' : b.id === 'verified' ? '✓' : '🌱'}</div>
              <div style={{ fontSize: 12, fontWeight: 600 }}>{b.name}</div>
              {!b.earned && <div style={{ position: 'absolute', top: 8, right: 8, fontSize: 11 }}>🔒</div>}
            </button>
          ))}
        </div>
      )}

      {coverOpen && (
        <ModalShell onClose={() => setCoverOpen(false)} width={420}>
          <h3 className="font-display" style={{ fontSize: 22, fontWeight: 600, marginBottom: 16 }}>Pick a cover</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
            {COVER_PRESETS.map(c => (
              <button key={c.id} onClick={() => { setCover(c.id); setCoverOpen(false); toast('Cover updated'); }} style={{ height: 80, borderRadius: 12, background: c.grad, border: cover === c.id ? '3px solid var(--brand-500)' : '2px solid transparent' }}/>
            ))}
          </div>
        </ModalShell>
      )}

      {openBadge && (
        <ModalShell onClose={() => setOpenBadge(null)} width={380}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 56, marginBottom: 12, filter: openBadge.earned ? 'none' : 'grayscale(0.6)' }}>{openBadge.id === 'streak7' || openBadge.id === 'streak30' ? '🔥' : openBadge.id === 'quiz' ? '🎯' : openBadge.id === 'night' ? '🌙' : openBadge.id === 'early' ? '🌅' : openBadge.id === 'top10' ? '🏆' : openBadge.id === 'helpful' ? '🤝' : openBadge.id === 'pro' ? '⭐' : openBadge.id === 'verified' ? '✓' : '🌱'}</div>
            <h3 className="font-display" style={{ fontSize: 22, fontWeight: 600, marginBottom: 6 }}>{openBadge.name}</h3>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 14 }}>{openBadge.desc}</p>
            <div className="label-sm">{openBadge.rarity} have this</div>
          </div>
        </ModalShell>
      )}

      {edit && (
        <div className="fade-in-up" style={{ position: 'fixed', bottom: 24, left: '50%', transform: 'translateX(-50%)', zIndex: 50, background: 'var(--bg-surface)', border: '1px solid var(--border-default)', borderRadius: 999, padding: '8px 8px 8px 18px', display: 'flex', alignItems: 'center', gap: 12, boxShadow: 'var(--shadow-xl)' }}>
          <span style={{ fontSize: 13, color: dirty ? 'var(--amber-600)' : 'var(--text-tertiary)' }}>{dirty ? 'Unsaved changes' : 'No changes'}</span>
          <button onClick={() => { setDraft(saved); setEdit(false); }} className="btn btn-ghost btn-sm">Discard</button>
          <button onClick={() => { setSaved(draft); setEdit(false); toast('Profile updated ✓'); }} className="btn btn-primary btn-sm">Save Changes</button>
        </div>
      )}
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════
// B8 · NOTIFICATIONS
// ═══════════════════════════════════════════════════════════════
const NOTIFICATIONS_SEED = [
  { id: 1, type: 'session',   icon: 'calendar',  title: 'Session starts in 30 minutes', desc: 'With Priya Sharma · Intro to Pandas',          time: '30m ago', read: false },
  { id: 2, type: 'community', icon: 'mentors',   title: 'Arjun M. accepted your friend request', desc: '',                                      time: '2h ago',  read: false },
  { id: 3, type: 'system',    icon: 'sparkles',  title: 'New badge earned: 7-Day Streak 🔥', desc: 'You unlocked your second badge',           time: '1d ago',  read: false },
  { id: 4, type: 'session',   icon: 'calendar',  title: 'Booking confirmed: Dr. Elena Rossi', desc: 'April 28, 4:00 PM · Video session',       time: '2d ago',  read: true },
  { id: 5, type: 'community', icon: 'community', title: 'You have 3 unread messages in React Patterns', desc: '',                              time: '3d ago',  read: true },
  { id: 6, type: 'system',    icon: 'sparkles',  title: 'Productivity report ready',         desc: 'Last week: 14h focused, +12% vs the week before', time: '5d ago', read: true },
];

const typeColor = {
  session:   { bg: 'rgba(79,70,229,0.10)',  fg: 'var(--brand-500)' },
  community: { bg: 'rgba(16,185,129,0.10)', fg: 'var(--mint-600)' },
  system:    { bg: 'rgba(245,158,11,0.10)', fg: 'var(--amber-600)' },
};

const routeForNotif = (n) => {
  if (n.type === 'session') return 'my-sessions';
  if (n.type === 'community') return 'community';
  if (n.title.toLowerCase().includes('badge')) return 'profile';
  if (n.title.toLowerCase().includes('report')) return 'productivity';
  return 'home';
};

let _notifStore = null;
const useNotifications = () => {
  const [list, setList] = useState(() => {
    if (_notifStore) return _notifStore;
    try { const saved = JSON.parse(localStorage.getItem('elmorigin:notifs') || 'null'); _notifStore = saved || NOTIFICATIONS_SEED; }
    catch { _notifStore = NOTIFICATIONS_SEED; }
    return _notifStore;
  });
  useEffect(() => { _notifStore = list; localStorage.setItem('elmorigin:notifs', JSON.stringify(list)); }, [list]);
  return [list, setList];
};

const NotificationItem = ({ n, compact, onClick, onMarkRead }) => {
  const c = typeColor[n.type] || typeColor.system;
  return (
    <div onClick={onClick} style={{
      position: 'relative', cursor: 'pointer',
      display: 'flex', alignItems: 'flex-start', gap: 12,
      padding: compact ? '10px 12px' : '14px 18px',
      borderRadius: 12,
      background: n.read ? 'transparent' : 'rgba(79,70,229,0.04)',
      border: '1px solid ' + (n.read ? 'var(--border-subtle)' : 'rgba(79,70,229,0.18)'),
      transition: 'background 200ms',
    }}
      onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'}
      onMouseLeave={e => e.currentTarget.style.background = n.read ? 'transparent' : 'rgba(79,70,229,0.04)'}
    >
      {!n.read && <div style={{ position: 'absolute', left: 6, top: '50%', transform: 'translateY(-50%)', width: 6, height: 6, borderRadius: 999, background: 'var(--brand-500)' }}/>}
      <div style={{ width: 28, height: 28, borderRadius: 999, background: c.bg, color: c.fg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginLeft: n.read ? 0 : 8 }}>
        <Icon name={n.icon} size={13}/>
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: compact ? 13 : 14, fontFamily: 'Inter', fontWeight: 600, color: 'var(--text-primary)' }}>{n.title}</div>
        {n.desc && <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2, lineHeight: 1.5 }}>{n.desc}</div>}
      </div>
      <div style={{ fontSize: 11, color: 'var(--text-tertiary)', whiteSpace: 'nowrap' }}>{n.time}</div>
      {!n.read && !compact && (
        <button onClick={e => { e.stopPropagation(); onMarkRead(); }} className="btn btn-ghost btn-sm" style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)' }}>✓</button>
      )}
    </div>
  );
};

const NotificationsPage = ({ navigate }) => {
  const [list, setList] = useNotifications();
  const [tab, setTab] = useState('All');
  const filtered = tab === 'All' ? list : list.filter(n => n.type.toLowerCase() === tab.toLowerCase().replace(/s$/, ''));
  const counts = { All: list.length, Sessions: list.filter(n => n.type==='session').length, Community: list.filter(n => n.type==='community').length, System: list.filter(n => n.type==='system').length };
  const anyUnread = list.some(n => !n.read);

  return (
    <div className="page fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 22 }}>
        <h1 className="font-display" style={{ fontSize: 36, fontWeight: 500 }}>Notifications</h1>
        <button onClick={() => { setList(l => l.map(n => ({ ...n, read: true }))); toast('All marked as read'); }} disabled={!anyUnread} className="btn btn-ghost btn-sm" style={{ opacity: anyUnread ? 1 : 0.4 }}>Mark all read</button>
      </div>

      <div style={{ display: 'flex', gap: 6, marginBottom: 22, flexWrap: 'wrap' }}>
        {['All','Sessions','Community','System'].map(t => (
          <button key={t} onClick={() => setTab(t)} className={`chip ${tab === t ? 'active' : ''}`}>{t} ({counts[t]})</button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon="📭" title="All caught up! 🌱" desc="We'll let you know when something new lands."/>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {filtered.map(n => (
            <NotificationItem key={n.id} n={n}
              onClick={() => { setList(l => l.map(x => x.id === n.id ? { ...x, read: true } : x)); navigate(routeForNotif(n)); }}
              onMarkRead={() => setList(l => l.map(x => x.id === n.id ? { ...x, read: true } : x))}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const NotificationDropdown = ({ navigate, close }) => {
  const [list, setList] = useNotifications();
  const ref = useRef(null);

  useEffect(() => {
    const onClick = e => { if (ref.current && !ref.current.contains(e.target)) close(); };
    const onKey = e => { if (e.key === 'Escape') close(); };
    setTimeout(() => document.addEventListener('mousedown', onClick), 0);
    document.addEventListener('keydown', onKey);
    return () => { document.removeEventListener('mousedown', onClick); document.removeEventListener('keydown', onKey); };
  }, [close]);

  return (
    <div ref={ref} className="fade-in" style={{
      position: 'absolute', top: 'calc(100% + 8px)', right: 0,
      width: 360, maxHeight: 460,
      background: 'var(--bg-surface)', border: '1px solid var(--border-default)',
      borderRadius: 18, boxShadow: 'var(--shadow-xl)',
      overflow: 'hidden', display: 'flex', flexDirection: 'column', zIndex: 60,
    }}>
      <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontFamily: 'Inter', fontWeight: 600, fontSize: 14 }}>Notifications</span>
        <button onClick={() => { setList(l => l.map(n => ({ ...n, read: true }))); toast('All marked as read'); }} style={{ fontSize: 12, color: 'var(--brand-500)' }}>Mark all read</button>
      </div>
      <div style={{ padding: 6, overflowY: 'auto', flex: 1 }}>
        {list.slice(0, 5).map(n => (
          <NotificationItem key={n.id} n={n} compact
            onClick={() => { setList(l => l.map(x => x.id === n.id ? { ...x, read: true } : x)); navigate(routeForNotif(n)); close(); }}
            onMarkRead={() => setList(l => l.map(x => x.id === n.id ? { ...x, read: true } : x))}
          />
        ))}
      </div>
      <button onClick={() => { navigate('notifications'); close(); }} style={{ padding: '12px 18px', borderTop: '1px solid var(--border-subtle)', fontSize: 13, fontWeight: 600, color: 'var(--brand-500)', textAlign: 'center' }}>
        See all notifications →
      </button>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════
// B10 · PRICING
// ═══════════════════════════════════════════════════════════════
const PRICING_FEATURES = {
  explorer: [
    [true, 'Public study rooms'],
    [true, '25-min Pomodoro timer'],
    [true, '20 Nova messages/day'],
    [true, '2 mentor sessions/month'],
    [false, 'Collaborative rooms'],
    [false, 'Unlimited Nova'],
    [false, 'DM mentors anytime'],
    [false, 'Custom themes'],
    [false, 'Goal tracking'],
    [false, 'Advanced analytics'],
  ],
  pro: [
    [true, 'Public study rooms'],
    [true, 'Custom Pomodoro timers'],
    [true, 'Unlimited Nova messages'],
    [true, '4 mentor sessions/month'],
    [true, 'Collaborative & private rooms'],
    [true, 'Voice & image Nova'],
    [true, 'DM mentors anytime'],
    [true, 'Custom themes'],
    [true, 'Goal tracking'],
    [true, 'Advanced analytics'],
  ],
  elite: [
    [true, 'Everything in Pro'],
    [true, 'Priority booking with top mentors'],
    [true, 'Group masterclasses included'],
    [true, 'Personal study coach'],
    [true, 'Career mentor matching'],
    [true, '4 sessions/mo with verified mentors'],
    [true, 'White-glove onboarding'],
    [true, 'Quarterly progress reports'],
    [true, 'Early access features'],
    [true, '24/7 priority support'],
  ],
};

const PricingPage = ({ navigate, user }) => {
  const [billing, setBilling] = useState('annual');
  const [checkout, setCheckout] = useState(null); // 'pro' | 'elite' | null
  const [faqOpen, setFaqOpen] = useState(null);

  const prices = {
    pro:   billing === 'monthly' ? 499  : 349,
    elite: billing === 'monthly' ? 1299 : 899,
  };

  return (
    <div className="page fade-in" style={{ paddingBottom: 80 }}>
      <div style={{ textAlign: 'center', marginBottom: 36, paddingTop: 24 }}>
        <h1 className="font-display" style={{ fontSize: 'clamp(34px, 5vw, 52px)', fontWeight: 800, lineHeight: 1.05, letterSpacing: '-0.02em', maxWidth: 720, margin: '0 auto' }}>
          The environment. The support. The results.
        </h1>
        <p style={{ fontSize: 17, color: 'var(--text-secondary)', marginTop: 14 }}>Start free. Upgrade when you're ready.</p>
      </div>

      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 36 }}>
        <div style={{ display: 'flex', padding: 4, borderRadius: 999, background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', position: 'relative' }}>
          {['monthly','annual'].map((b, i) => (
            <button key={b} onClick={() => setBilling(b)} style={{
              padding: '8px 22px', borderRadius: 999, fontSize: 13, fontFamily: 'Inter', fontWeight: 600,
              color: billing === b ? '#fff' : 'var(--text-secondary)',
              background: billing === b ? 'var(--gradient-brand, var(--brand-500))' : 'transparent',
              transition: 'all 220ms cubic-bezier(.16,1,.3,1)',
              textTransform: 'capitalize',
            }}>{b}{b === 'annual' && <span style={{ marginLeft: 6, fontSize: 11, color: billing === b ? 'rgba(255,255,255,0.85)' : 'var(--amber-600)' }}>Save 30%</span>}</button>
          ))}
        </div>
      </div>

      {/* Plans */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 22, marginBottom: 60 }}>
        {/* Explorer */}
        <PlanCard
          name="Explorer"
          tagline="Perfect to get started"
          price="Free forever"
          features={PRICING_FEATURES.explorer}
          ctaLabel={user.plan === 'Free' ? "You're on Explorer" : 'Get Started Free'}
          ctaVariant="ghost"
          ctaDisabled={user.plan === 'Free'}
          onCta={() => { if (user.plan !== 'Free') toast('Downgrade not enabled in demo'); }}
        />
        {/* Pro */}
        <PlanCard
          name="Pro"
          highlight
          tagline="Most popular"
          price={<><span style={{ fontFamily: 'JetBrains Mono', fontSize: 16, color: 'var(--text-tertiary)', textDecoration: billing === 'annual' ? 'line-through' : 'none', marginRight: 8 }}>{billing === 'annual' ? '₹499' : ''}</span>₹{prices.pro}<span style={{ fontSize: 16, color: 'var(--text-secondary)' }}>/mo</span></>}
          features={PRICING_FEATURES.pro}
          ctaLabel={user.plan === 'Pro' ? "You're on Pro" : 'Start Pro Free — 7 Days'}
          ctaVariant="primary"
          ctaDisabled={user.plan === 'Pro' || user.plan === 'Elite'}
          ctaSub="No card required for trial"
          onCta={() => { if (user.plan !== 'Pro' && user.plan !== 'Elite') setCheckout('pro'); }}
        />
        {/* Elite */}
        <PlanCard
          name="Elite"
          premium
          tagline="For serious learners"
          price={<>₹{prices.elite}<span style={{ fontSize: 16, color: 'var(--text-secondary)' }}>/mo</span></>}
          features={PRICING_FEATURES.elite}
          ctaLabel={user.plan === 'Elite' ? "You're on Elite" : 'Go Elite'}
          ctaVariant="premium"
          ctaDisabled={user.plan === 'Elite'}
          ctaSub="Includes 4 sessions/month with verified mentors"
          onCta={() => { if (user.plan !== 'Elite') setCheckout('elite'); }}
        />
      </div>

      <div style={{ textAlign: 'center', color: 'var(--text-secondary)', fontSize: 14, marginBottom: 60 }}>
        🔒 Secure payments &nbsp;·&nbsp; 🔄 Cancel anytime &nbsp;·&nbsp; 🎁 7-Day Trial &nbsp;·&nbsp; 💰 30-day money-back
      </div>

      <div style={{ maxWidth: 720, margin: '0 auto' }}>
        <h2 className="font-display" style={{ fontSize: 28, fontWeight: 500, textAlign: 'center', marginBottom: 28 }}>Frequently asked</h2>
        {[
          ['What happens at the end of my free trial?', 'Your account remains active on the Free plan. We never auto-charge you without explicit consent.'],
          ['Can I switch between plans?', 'Yes — upgrade or downgrade anytime. Prorated for the current cycle.'],
          ['How does mentor billing work?', 'Mentor sessions are billed per session at the time of booking. Your monthly allowance is applied automatically.'],
          ['Is there a student discount?', 'Yes! Verify with your .edu or institute email and get an additional 20% off annual plans.'],
          ['What payment methods do you accept?', 'Card, UPI, Net Banking, and Wallets via Cashfree and Razorpay. Secured by 256-bit encryption.'],
        ].map(([q, a], i) => (
          <div key={i} className="card" style={{ padding: 0, marginBottom: 10, overflow: 'hidden', borderColor: faqOpen === i ? 'var(--brand-300, var(--brand-500))' : undefined }}>
            <button onClick={() => setFaqOpen(faqOpen === i ? null : i)} style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '18px 22px', textAlign: 'left' }}>
              <span style={{ fontSize: 15, fontWeight: 600 }}>{q}</span>
              <span style={{ fontSize: 22, color: 'var(--text-tertiary)', transition: 'transform 200ms', transform: faqOpen === i ? 'rotate(45deg)' : 'rotate(0)' }}>+</span>
            </button>
            {faqOpen === i && (
              <div style={{ padding: '0 22px 20px', fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.7 }}>{a}</div>
            )}
          </div>
        ))}
      </div>

      {checkout && <CheckoutModal plan={checkout} price={prices[checkout]} onClose={() => setCheckout(null)} onSuccess={() => {
        const planName = checkout === 'pro' ? 'Pro' : 'Elite';
        try { const u = JSON.parse(localStorage.getItem('elmorigin:user') || '{}'); localStorage.setItem('elmorigin:user', JSON.stringify({ ...u, plan: planName })); } catch {}
        if (window.USER) window.USER.plan = planName;
        toast(`Welcome to ${planName} 🎉`);
        setCheckout(null);
        navigate('home');
      }}/>}
    </div>
  );
};

const PlanCard = ({ name, tagline, price, features, ctaLabel, ctaVariant, ctaDisabled, ctaSub, onCta, highlight, premium }) => (
  <div style={{
    position: 'relative', padding: 32,
    borderRadius: 22,
    background: premium ? 'linear-gradient(180deg, rgba(245,158,11,0.06), var(--bg-surface))' : highlight ? 'linear-gradient(180deg, rgba(79,70,229,0.08), var(--bg-surface))' : 'var(--bg-surface)',
    border: '1px solid ' + (highlight ? 'var(--brand-400, var(--brand-500))' : premium ? 'var(--amber-400, var(--amber-500))' : 'var(--border-subtle)'),
    transform: highlight ? 'scale(1.03)' : 'scale(1)',
    boxShadow: highlight ? '0 24px 60px -20px rgba(79,70,229,0.30)' : 'var(--shadow-xs)',
  }}>
    {highlight && <div style={{ position: 'absolute', top: -14, left: '50%', transform: 'translateX(-50%)', padding: '5px 14px', borderRadius: 999, background: 'var(--gradient-brand, var(--brand-500))', color: '#fff', fontSize: 11, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase' }}>Most Popular</div>}
    {premium && <div style={{ position: 'absolute', top: -14, left: '50%', transform: 'translateX(-50%)', padding: '5px 14px', borderRadius: 999, background: 'linear-gradient(135deg,#F59E0B,#D97706)', color: '#fff', fontSize: 11, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase' }}>Elite</div>}
    <div style={{ fontFamily: 'Inter', fontWeight: 700, fontSize: 18, marginBottom: 4 }}>{name}</div>
    <div style={{ fontSize: 12, color: 'var(--text-tertiary)', marginBottom: 18 }}>{tagline}</div>
    <div className="font-display" style={{ fontSize: 38, fontWeight: 700, marginBottom: 22, letterSpacing: '-0.01em' }}>{price}</div>
    <div style={{ display: 'flex', flexDirection: 'column', gap: 9, marginBottom: 24 }}>
      {features.map(([ok, label], i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13 }}>
          <span style={{ width: 16, height: 16, borderRadius: 999, display: 'flex', alignItems: 'center', justifyContent: 'center', color: ok ? (highlight ? 'var(--brand-500)' : 'var(--mint-600)') : 'var(--text-tertiary)', fontWeight: 700, fontSize: 11 }}>{ok ? '✓' : '✗'}</span>
          <span style={{ color: ok ? 'var(--text-primary)' : 'var(--text-tertiary)', opacity: ok ? 1 : 0.7 }}>{label}</span>
        </div>
      ))}
    </div>
    <button onClick={onCta} disabled={ctaDisabled} className={`btn btn-lg ${ctaVariant === 'primary' ? 'btn-primary' : ctaVariant === 'premium' ? '' : 'btn-ghost'}`} style={{
      width: '100%', justifyContent: 'center',
      background: ctaVariant === 'premium' ? 'linear-gradient(135deg,#F59E0B,#D97706)' : undefined,
      color: ctaVariant === 'premium' ? '#fff' : undefined,
      opacity: ctaDisabled ? 0.55 : 1, cursor: ctaDisabled ? 'default' : 'pointer',
    }}>{ctaLabel}</button>
    {ctaSub && <div style={{ fontSize: 11, color: 'var(--text-tertiary)', textAlign: 'center', marginTop: 10 }}>{ctaSub}</div>}
  </div>
);

const CheckoutModal = ({ plan, price, onClose, onSuccess }) => {
  const [status, setStatus] = useState('form'); // form | loading | success
  const [card, setCard] = useState('');
  const planName = plan === 'pro' ? 'Pro' : 'Elite';

  const formatCard = v => v.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim();

  const pay = () => {
    setStatus('loading');
    setTimeout(() => setStatus('success'), 1500);
  };

  return (
    <ModalShell onClose={status === 'loading' ? () => {} : onClose} width={440}>
      {status === 'form' && (
        <>
          <h3 className="font-display" style={{ fontSize: 26, fontWeight: 600, marginBottom: 16 }}>Upgrade to {planName}</h3>
          <div className="card" style={{ padding: 16, marginBottom: 18, background: 'linear-gradient(135deg, rgba(79,70,229,0.06), transparent)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontWeight: 600 }}>{planName} plan</span>
              <span style={{ fontFamily: 'JetBrains Mono', fontWeight: 600 }}>₹{price}/mo</span>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 6, marginBottom: 14 }}>
            {['Card','UPI','Net Banking'].map((t, i) => (
              <button key={t} className={`chip ${i === 0 ? 'active' : ''}`} style={{ flex: 1, justifyContent: 'center' }}>{t}</button>
            ))}
          </div>
          <input className="input" placeholder="Card number" value={card} onChange={e => setCard(formatCard(e.target.value))} style={{ marginBottom: 8, fontFamily: 'JetBrains Mono' }}/>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 14 }}>
            <input className="input" placeholder="MM / YY" style={{ fontFamily: 'JetBrains Mono' }}/>
            <input className="input" placeholder="CVV" style={{ fontFamily: 'JetBrains Mono' }}/>
          </div>
          <div style={{ fontSize: 11, color: 'var(--text-tertiary)', textAlign: 'center', marginBottom: 16 }}>🔒 Secured by Cashfree · Visa · MC · RuPay</div>
          <button onClick={pay} className="btn btn-primary btn-lg" style={{ width: '100%', justifyContent: 'center' }}>🔒 Pay ₹{price} Securely</button>
        </>
      )}
      {status === 'loading' && (
        <div style={{ textAlign: 'center', padding: 50 }}>
          <div className="nova-orb" style={{ width: 56, height: 56, margin: '0 auto 18px' }}/>
          <div style={{ fontFamily: 'Inter', fontWeight: 600 }}>Processing…</div>
        </div>
      )}
      {status === 'success' && (
        <div style={{ textAlign: 'center', padding: '20px 0' }}>
          <div style={{ width: 72, height: 72, borderRadius: 999, background: 'var(--mint-500)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', boxShadow: '0 0 0 10px rgba(16,185,129,0.12)' }}>
            <Icon name="check" size={32} stroke={3}/>
          </div>
          <h3 className="font-display italic" style={{ fontSize: 28, fontWeight: 500, marginBottom: 6 }}>Welcome to {planName} 🎉</h3>
          <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 22 }}>Your account has been upgraded.</p>
          <button onClick={onSuccess} className="btn btn-primary btn-md">Continue to Dashboard</button>
        </div>
      )}
    </ModalShell>
  );
};

// ═══════════════════════════════════════════════════════════════
// Expose
// ═══════════════════════════════════════════════════════════════
window.MentorProfileDetail = MentorProfileDetail;
window.MySessions = MySessions;
window.ProfilePage = ProfilePage;
window.NotificationsPage = NotificationsPage;
window.NotificationDropdown = NotificationDropdown;
window.PricingPage = PricingPage;
window.toast = window.toast || toast;
