'use client';

import { useEffect, useRef, useState, use, useTransition } from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Avatar, Icon } from '@/components/primitives';
import BookingFlow from '@/components/booking/BookingFlow';
import { getMentor, type Mentor } from '@/lib/mentors';
import { toast } from '@/lib/toast';
import { sendFriendRequest } from '@/app/actions/friends';

const MENTOR_REVIEWS = [
  { id: 1, name: 'Ananya R.', stars: 5, date: 'Apr 2026', text: 'Priya broke down eigenvalues better than my prof. Walked through 3 worked examples and gave me practice problems for homework.', helpful: 18 },
  { id: 2, name: 'Vikram P.', stars: 5, date: 'Mar 2026', text: 'Excellent at connecting concepts. We covered gradient descent and she tied it back to chain rule from last week.', helpful: 12 },
  { id: 3, name: 'Riya S.',   stars: 4, date: 'Mar 2026', text: 'Great session, slightly rushed at the end. Would book again.', helpful: 4 },
  { id: 4, name: 'Karan D.',  stars: 5, date: 'Feb 2026', text: 'Clear, patient, makes the hard stuff feel obvious.', helpful: 9 },
  { id: 5, name: 'Maya T.',   stars: 3, date: 'Jan 2026', text: 'Felt like the agenda was too ambitious. Got through half.', helpful: 2 },
];

function ReviewCard({ r }: { r: typeof MENTOR_REVIEWS[0] }) {
  const [helpful, setHelpful] = useState(r.helpful);
  const [marked, setMarked] = useState(false);
  return (
    <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 14, padding: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <Avatar name={r.name} size={36} />
          <div>
            <div style={{ fontWeight: 600, fontSize: 13 }}>{r.name}</div>
            <div style={{ color: 'var(--amber-500)', fontSize: 12 }}>{'★'.repeat(r.stars)}{'☆'.repeat(5 - r.stars)}</div>
          </div>
        </div>
        <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>{r.date}</div>
      </div>
      <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>{r.text}</p>
      <button
        onClick={() => { if (!marked) { setHelpful(h => h + 1); setMarked(true); toast('Marked helpful'); } }}
        style={{ marginTop: 12, fontSize: 12, color: marked ? 'var(--brand-500)' : 'var(--text-tertiary)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}
      >
        👍 {helpful} found this helpful
      </button>
    </div>
  );
}

type SlotPick = { date: Date; time: string };

function MentorDetail({ mentor }: { mentor: Mentor }) {
  const [tab, setTab] = useState<'about' | 'experience' | 'reviews' | 'availability'>('about');
  const [reviewFilter, setReviewFilter] = useState<'All' | '5' | '4' | '3' | 'Critical'>('All');
  const [saved, setSaved] = useState(false);
  const [showFloat, setShowFloat] = useState(false);
  const [bookingOpen, setBookingOpen] = useState(false);
  const [prefill, setPrefill] = useState<SlotPick | null>(null);
  const [friendSent, setFriendSent] = useState(false);
  const [sendingFriend, startFriendSend] = useTransition();
  const heroRef = useRef<HTMLDivElement>(null);

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
  const breakdown = [5, 4, 3, 2, 1].map(s => ({
    s,
    pct: Math.max(2, Math.round(MENTOR_REVIEWS.filter(r => r.stars === s).length / MENTOR_REVIEWS.length * 100)),
  }));

  const openBooking = (slot?: SlotPick) => {
    if (slot) setPrefill(slot); else setPrefill(null);
    setBookingOpen(true);
  };

  return (
    <div style={{ padding: '24px 40px 80px', maxWidth: 1100, margin: '0 auto' }}>
      {/* Top bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 22 }}>
        <Link href="/mentors" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--text-tertiary)', fontWeight: 500, textDecoration: 'none' }}>
          <Icon name="chevronL" size={13} /> Back to Mentors
        </Link>
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={() => { setSaved(s => !s); toast(saved ? 'Removed from favorites' : 'Saved to your favorites'); }}
            style={{ height: 32, padding: '0 12px', borderRadius: 999, background: 'transparent', fontSize: 13, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 4 }}
          >
            <span style={{ color: saved ? '#f43f5e' : 'inherit' }}>{saved ? '♥' : '♡'}</span> {saved ? 'Saved' : 'Save'}
          </button>
          <button
            disabled={sendingFriend || friendSent}
            onClick={() => startFriendSend(async () => {
              const res = await sendFriendRequest(String(m.id));
              if (res.ok) { setFriendSent(true); toast('Friend request sent!'); }
              else { toast(res.error ?? 'Could not send request'); }
            })}
            style={{ height: 32, padding: '0 12px', borderRadius: 999, fontSize: 13, fontWeight: 500, display: 'flex', alignItems: 'center', gap: 4, background: friendSent ? 'var(--bg-hover)' : 'transparent', color: friendSent ? 'var(--brand-500)' : 'var(--text-secondary)', border: friendSent ? '1px solid var(--border-subtle)' : 'none', cursor: sendingFriend || friendSent ? 'default' : 'pointer', opacity: sendingFriend ? 0.6 : 1 }}
          >
            <Icon name="users" size={13} /> {sendingFriend ? '…' : friendSent ? 'Request sent' : 'Add Friend'}
          </button>
          <button
            onClick={() => { if (typeof navigator !== 'undefined') { navigator.clipboard?.writeText(`https://elmorigin.app/m/${m.id}`); toast('Link copied'); } }}
            style={{ height: 32, padding: '0 12px', borderRadius: 999, background: 'transparent', fontSize: 13, color: 'var(--text-secondary)' }}
          >
            ↗ Share
          </button>
        </div>
      </div>

      {/* Hero */}
      <div
        ref={heroRef}
        style={{
          background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 20,
          padding: 32, marginBottom: 24, display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 32,
        }}
      >
        <div>
          <div style={{ position: 'relative', width: 120, height: 120, marginBottom: 18 }}>
            <Avatar name={m.name} size={120} />
            <div style={{ position: 'absolute', bottom: 0, right: 0, width: 32, height: 32, borderRadius: 999, background: 'var(--gradient-brand)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '3px solid var(--bg-surface)' }}>
              <Icon name="check" size={14} />
            </div>
          </div>
          <h1 style={{ fontFamily: 'Fraunces, serif', fontSize: 36, fontWeight: 700, letterSpacing: '-0.02em', marginBottom: 6 }}>{m.name}</h1>
          <div style={{ color: 'var(--text-secondary)', fontFamily: 'Instrument Sans, system-ui', fontSize: 15, marginBottom: 14 }}>{m.title}</div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 16 }}>
            {m.tags.map(t => (
              <span key={t} style={{ padding: '4px 10px', borderRadius: 999, background: 'var(--bg-hover)', border: '1px solid var(--border-subtle)', fontSize: 12, color: 'var(--text-secondary)' }}>{t}</span>
            ))}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, color: 'var(--text-secondary)', marginBottom: 8 }}>
            <span><span style={{ color: 'var(--amber-500)' }}>★</span> <strong style={{ fontFamily: 'JetBrains Mono, monospace', color: 'var(--text-primary)' }}>{m.rating}</strong></span>
            <span>·</span>
            <span><span style={{ fontFamily: 'JetBrains Mono, monospace' }}>{m.reviews}</span> reviews</span>
            <span>·</span>
            <span><span style={{ fontFamily: 'JetBrains Mono, monospace' }}>{m.students}</span> students</span>
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-tertiary)', marginBottom: 12 }}>🇬🇧 English · 🇮🇳 Hindi</div>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '4px 10px', borderRadius: 999, background: 'var(--bg-hover)', border: '1px solid var(--border-subtle)', fontSize: 12, color: 'var(--text-secondary)' }}>
            <Icon name="clock" size={11} /> Replies in ~2h
          </span>
        </div>

        <div style={{ background: 'linear-gradient(135deg, rgba(79,70,229,0.06), rgba(99,102,241,0.02))', border: '1px solid rgba(79,70,229,0.20)', borderRadius: 18, padding: 22, display: 'flex', flexDirection: 'column' }}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', color: 'var(--brand-600)', textTransform: 'uppercase', marginBottom: 14 }}>Pricing</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 18 }}>
            {prices.map(p => (
              <div key={p.label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                <span style={{ color: 'var(--text-secondary)' }}>{p.label}</span>
                <span style={{ fontFamily: 'JetBrains Mono, monospace', fontWeight: 600, color: 'var(--text-primary)' }}>₹{p.val}</span>
              </div>
            ))}
          </div>
          <button
            onClick={() => openBooking()}
            style={{
              width: '100%', height: 48, borderRadius: 999,
              background: 'var(--gradient-brand)', color: '#fff',
              fontSize: 14, fontWeight: 600,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              boxShadow: '0 6px 18px rgba(27,43,142,0.30)',
              cursor: 'pointer',
            }}
          >
            Book a Session <Icon name="chevronR" size={14} />
          </button>
          <div style={{ fontSize: 11, color: 'var(--text-tertiary)', textAlign: 'center', marginTop: 10 }}>Cancel free up to 4h before</div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ position: 'sticky', top: 68, zIndex: 5, display: 'flex', gap: 28, background: 'var(--bg-base)', borderBottom: '1px solid var(--border-subtle)', padding: '14px 0', marginBottom: 28 }}>
        {(['about', 'experience', 'reviews', 'availability'] as const).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            style={{
              position: 'relative', padding: '8px 2px', textTransform: 'capitalize',
              color: tab === t ? 'var(--text-primary)' : 'var(--text-secondary)',
              fontWeight: tab === t ? 600 : 500, fontSize: 14,
            }}
          >
            {t}
            {tab === t && <div style={{ position: 'absolute', bottom: -15, left: 0, right: 0, height: 3, borderRadius: 2, background: 'var(--gradient-brand)' }} />}
          </button>
        ))}
      </div>

      {tab === 'about' && (
        <div style={{ maxWidth: 760 }}>
          <p style={{ fontSize: 15, lineHeight: 1.7, color: 'var(--text-primary)', marginBottom: 24 }}>
            I&apos;m a {m.title.toLowerCase()} with years of teaching experience. I love helping students bridge the gap between textbook material and the kind of work you actually do in industry. We&apos;ll work through problems together — no copy-paste, no jargon, just clarity.
          </p>
          <blockquote style={{ fontFamily: 'Fraunces, serif', fontStyle: 'italic', fontSize: 19, color: 'var(--text-secondary)', borderLeft: '3px solid var(--brand-500)', paddingLeft: 20, marginLeft: 0, marginBottom: 28, lineHeight: 1.5 }}>
            &quot;The best way to learn is to be allowed to be wrong out loud, then taught why it&apos;s wrong.&quot;
          </blockquote>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
            {[['Sessions delivered', m.students], ['Avg rating', `${m.rating} ★`], ['Repeat students', '62%']].map(([l, v]) => (
              <div key={l} style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 14, padding: 18 }}>
                <div style={{ fontFamily: 'Fraunces, serif', fontSize: 26, fontWeight: 600 }}>{v}</div>
                <div style={{ fontSize: 12, color: 'var(--text-tertiary)', marginTop: 4 }}>{l}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === 'experience' && (
        <div style={{ maxWidth: 760 }}>
          <h3 style={{ fontSize: 17, fontWeight: 600, marginBottom: 18 }}>Education</h3>
          <div style={{ marginBottom: 36 }}>
            {[
              ['2014', 'B.Tech', 'IIT Bombay'],
              ['2017', 'M.S.', 'Stanford University'],
              ['2018', 'Joined industry', m.title.split('·')[1]?.trim() || 'Tech'],
            ].map(([yr, deg, inst], i, a) => (
              <div key={i} style={{ display: 'flex', gap: 16, position: 'relative', paddingBottom: i < a.length - 1 ? 22 : 0 }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <div style={{ width: 12, height: 12, borderRadius: 999, background: 'var(--brand-500)', marginTop: 4 }} />
                  {i < a.length - 1 && <div style={{ flex: 1, width: 2, background: 'var(--border-default)', marginTop: 2 }} />}
                </div>
                <div>
                  <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, color: 'var(--text-tertiary)' }}>{yr}</div>
                  <div style={{ fontWeight: 600, fontSize: 14, marginTop: 2 }}>{deg}</div>
                  <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 2 }}>{inst}</div>
                </div>
              </div>
            ))}
          </div>
          <h3 style={{ fontSize: 17, fontWeight: 600, marginBottom: 14 }}>Specializations</h3>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {m.tags.concat(['Worked Examples', 'Mock Tests', 'Coaching']).map(s => (
              <span key={s} style={{ padding: '4px 10px', borderRadius: 999, background: 'var(--bg-hover)', border: '1px solid var(--border-subtle)', fontSize: 12, color: 'var(--text-secondary)' }}>{s}</span>
            ))}
          </div>
        </div>
      )}

      {tab === 'reviews' && (
        <div>
          <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 18, padding: 24, marginBottom: 20, display: 'grid', gridTemplateColumns: '180px 1fr', gap: 28, alignItems: 'center' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontFamily: 'Fraunces, serif', fontSize: 56, fontWeight: 700, color: 'var(--amber-500)', lineHeight: 1 }}>{m.rating}</div>
              <div style={{ color: 'var(--amber-500)', fontSize: 14, margin: '6px 0' }}>★★★★★</div>
              <div style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>({m.reviews} reviews)</div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {breakdown.map(({ s, pct }) => (
                <div key={s} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 12 }}>
                  <span style={{ width: 32, color: 'var(--text-secondary)' }}>{s}★</span>
                  <div style={{ flex: 1, height: 6, borderRadius: 999, background: 'var(--bg-hover)', overflow: 'hidden' }}>
                    <div style={{ width: `${pct}%`, height: '100%', background: 'var(--gradient-brand)', transition: 'width 600ms' }} />
                  </div>
                  <span style={{ width: 36, textAlign: 'right', fontFamily: 'JetBrains Mono, monospace', color: 'var(--text-tertiary)' }}>{pct}%</span>
                </div>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', gap: 6, marginBottom: 18, flexWrap: 'wrap' }}>
            {(['All', '5', '4', '3', 'Critical'] as const).map(f => (
              <button
                key={f}
                onClick={() => setReviewFilter(f)}
                style={{
                  height: 32, padding: '0 14px', borderRadius: 999, fontSize: 13, fontWeight: 500,
                  background: reviewFilter === f ? 'var(--text-primary)' : 'var(--bg-surface)',
                  color: reviewFilter === f ? '#fff' : 'var(--text-secondary)',
                  border: `1px solid ${reviewFilter === f ? 'var(--text-primary)' : 'var(--border-subtle)'}`,
                }}
              >
                {f === 'Critical' ? 'Critical 1–2★' : f === 'All' ? 'All' : `${f}★`}
              </button>
            ))}
          </div>

          {filtered.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 60, color: 'var(--text-tertiary)' }}>
              <div style={{ fontSize: 32, marginBottom: 8 }}>🌱</div>
              <div style={{ fontFamily: 'Fraunces, serif', fontStyle: 'italic', fontSize: 22 }}>No critical reviews yet</div>
              <div style={{ fontSize: 13, marginTop: 6 }}>This mentor has only positive feedback so far.</div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {filtered.map(r => <ReviewCard key={r.id} r={r} />)}
            </div>
          )}
        </div>
      )}

      {tab === 'availability' && (
        <div>
          <p style={{ fontSize: 13, color: 'var(--text-tertiary)', marginBottom: 14 }}>Tap a slot to pre-fill the booking.</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 12 }}>
            {Array.from({ length: 7 }).map((_, i) => {
              const d = new Date();
              d.setDate(d.getDate() + i);
              const slots = ['10:00 AM', '2:30 PM', '4:00 PM', '5:30 PM'].slice(0, 2 + (i % 3));
              const taken = i % 3 === 0;
              return (
                <div key={i} style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 14, padding: 14 }}>
                  <div style={{ fontWeight: 600, fontSize: 12, color: 'var(--text-tertiary)' }}>{d.toLocaleDateString('en', { weekday: 'short' })}</div>
                  <div style={{ fontFamily: 'Fraunces, serif', fontSize: 22, fontWeight: 600, marginBottom: 10 }}>{d.getDate()}</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    {slots.map((s, j) => {
                      const isTaken = taken && j === 0;
                      return (
                        <button
                          key={s}
                          disabled={isTaken}
                          onClick={() => openBooking({ date: d, time: s.replace(' AM', '').replace(' PM', '') })}
                          style={{
                            height: 28, borderRadius: 999, fontSize: 11, fontWeight: 500,
                            background: 'var(--bg-hover)', color: 'var(--text-primary)',
                            border: '1px solid var(--border-subtle)',
                            opacity: isTaken ? 0.4 : 1,
                            textDecoration: isTaken ? 'line-through' : 'none',
                            cursor: isTaken ? 'not-allowed' : 'pointer',
                          }}
                        >{s}</button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Floating bottom CTA */}
      {showFloat && (
        <div style={{
          position: 'fixed', bottom: 24, left: '50%', transform: 'translateX(-50%)', zIndex: 50,
          background: 'var(--bg-surface)', border: '1px solid var(--border-default)',
          borderRadius: 999, padding: '8px 8px 8px 16px',
          display: 'flex', alignItems: 'center', gap: 14,
          boxShadow: 'var(--shadow-xl)',
          animation: 'fadeInUp 220ms var(--ease-out-expo)',
        }}>
          <Avatar name={m.name} size={32} />
          <span style={{ fontSize: 13, fontWeight: 600 }}>{m.name}</span>
          <button
            onClick={() => openBooking()}
            style={{ height: 36, padding: '0 16px', borderRadius: 999, background: 'var(--gradient-brand)', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}
          >Book a Session</button>
        </div>
      )}

      {bookingOpen && (
        <BookingFlow
          mentor={mentor}
          initialDate={prefill?.date}
          initialTime={prefill?.time}
          onClose={() => setBookingOpen(false)}
        />
      )}
      <style>{`@keyframes fadeInUp { from { opacity: 0; transform: translate(-50%, 12px); } to { opacity: 1; transform: translate(-50%, 0); } }`}</style>
    </div>
  );
}

export default function MentorDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const mentor = getMentor(id);
  if (!mentor) notFound();
  return <MentorDetail mentor={mentor} />;
}
