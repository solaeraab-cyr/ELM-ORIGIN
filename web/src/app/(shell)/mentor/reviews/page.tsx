'use client';

import { useEffect, useMemo, useState } from 'react';
import { Avatar, Icon } from '@/components/primitives';
import { MENTOR_ALL_REVIEWS } from '@/lib/mentor-data';
import { toast } from '@/lib/toast';

type Review = (typeof MENTOR_ALL_REVIEWS)[number] & { responseDate?: string };

function StarDisplay({ rating, size = 14 }: { rating: number; size?: number }) {
  return (
    <div style={{ display: 'flex', gap: 2 }}>
      {[1, 2, 3, 4, 5].map(s => (
        <svg
          key={s} width={size} height={size} viewBox="0 0 24 24"
          fill={s <= rating ? 'var(--amber-500)' : 'transparent'}
          stroke={s <= rating ? 'var(--amber-500)' : 'var(--border-default)'}
          strokeWidth="1.5"
        >
          <path d="m12 3 2.9 6 6.6.6-5 4.4 1.5 6.5L12 17l-6 3.5 1.5-6.5-5-4.4 6.6-.6L12 3Z" />
        </svg>
      ))}
    </div>
  );
}

type Filter = 'All' | '5' | '4' | '3' | 'Critical';
type SortBy = 'newest' | 'oldest' | 'highest' | 'lowest';

export default function MentorReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>(MENTOR_ALL_REVIEWS);
  const [filter, setFilter] = useState<Filter>('All');
  const [sortBy, setSortBy] = useState<SortBy>('newest');
  const [respondingIdx, setRespondingIdx] = useState<number | null>(null);
  const [responseText, setResponseText] = useState('');
  const [animBars, setAnimBars] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setAnimBars(true), 100);
    return () => clearTimeout(t);
  }, []);

  const avgRating = (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1);
  const dist = [5, 4, 3, 2, 1].map(n => ({ stars: n, count: reviews.filter(r => r.rating === n).length }));

  const filtered = useMemo(() => {
    let list = [...reviews];
    if (filter === 'Critical') list = list.filter(r => r.rating <= 2);
    else if (filter !== 'All') list = list.filter(r => r.rating === parseInt(filter));
    if (sortBy === 'highest') list.sort((a, b) => b.rating - a.rating);
    else if (sortBy === 'lowest') list.sort((a, b) => a.rating - b.rating);
    return list;
  }, [reviews, filter, sortBy]);

  const submitResponse = (i: number) => {
    if (!responseText.trim()) return;
    const today = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    setReviews(rs => rs.map((r, idx) => idx === i ? { ...r, responded: true, response: responseText, responseDate: today } : r));
    setRespondingIdx(null);
    setResponseText('');
    toast('Reply posted ✓');
  };

  const editReply = (i: number) => {
    setResponseText(reviews[i].response || '');
    setRespondingIdx(i);
  };

  const isWithin24h = (dateStr?: string) => {
    if (!dateStr) return false;
    const dt = new Date(dateStr);
    return (Date.now() - dt.getTime()) < 24 * 60 * 60 * 1000;
  };

  return (
    <div style={{ maxWidth: 1080, margin: '0 auto', padding: '32px 40px 80px' }}>
      <h1 style={{ fontFamily: 'Fraunces, serif', fontSize: 36, fontWeight: 500, letterSpacing: '-0.02em', marginBottom: 28 }}>Reviews</h1>

      {/* Summary */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 20, marginBottom: 28 }}>
        <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 18, padding: 28, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
          <div style={{ fontFamily: 'Fraunces, serif', fontSize: 72, fontWeight: 500, letterSpacing: '-0.04em', lineHeight: 1 }}>{avgRating}</div>
          <StarDisplay rating={Math.round(parseFloat(avgRating))} size={20} />
          <div style={{ fontSize: 13, color: 'var(--text-tertiary)', marginTop: 4 }}>{reviews.length} reviews total</div>
        </div>
        <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 18, padding: 28, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 10 }}>
          {dist.map(d => (
            <div key={d.stars} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 12, width: 14, color: 'var(--text-tertiary)' }}>{d.stars}</span>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="var(--amber-500)" stroke="none"><path d="m12 3 2.9 6 6.6.6-5 4.4 1.5 6.5L12 17l-6 3.5 1.5-6.5-5-4.4 6.6-.6L12 3Z" /></svg>
              <div style={{ flex: 1, height: 8, background: 'var(--bg-hover)', borderRadius: 999, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: animBars ? `${(d.count / reviews.length) * 100}%` : '0%', background: 'var(--amber-500)', borderRadius: 999, transition: 'width 800ms var(--ease-out-expo)' }} />
              </div>
              <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 12, width: 20, textAlign: 'right', color: 'var(--text-tertiary)' }}>{d.count}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Filters + sort */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 22, flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {(['All', '5', '4', '3', 'Critical'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              style={{
                height: 32, padding: '0 14px', borderRadius: 999, fontSize: 13, fontWeight: 500,
                background: filter === f ? 'var(--text-primary)' : 'var(--bg-surface)',
                color: filter === f ? '#fff' : 'var(--text-secondary)',
                border: `1px solid ${filter === f ? 'var(--text-primary)' : 'var(--border-subtle)'}`,
              }}
            >{f === 'Critical' ? 'Critical 1–2★' : f === 'All' ? 'All' : `${f}★`}</button>
          ))}
        </div>
        <div style={{ marginLeft: 'auto' }}>
          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value as SortBy)}
            style={{ height: 32, padding: '0 12px', borderRadius: 999, border: '1px solid var(--border-subtle)', background: 'var(--bg-surface)', fontSize: 13, color: 'var(--text-primary)' }}
          >
            <option value="newest">Newest first</option>
            <option value="oldest">Oldest first</option>
            <option value="highest">Highest rated</option>
            <option value="lowest">Lowest rated</option>
          </select>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-tertiary)' }}>
            <div style={{ fontFamily: 'Fraunces, serif', fontStyle: 'italic', fontSize: 18 }}>No reviews match this filter</div>
          </div>
        ) : filtered.map((r) => {
          const i = reviews.findIndex(rev => rev === r);
          return (
            <div key={i} style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 16, padding: 24 }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 12 }}>
                <Avatar name={r.student} size={40} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                    <span style={{ fontWeight: 600, fontSize: 14 }}>{r.student}</span>
                    <StarDisplay rating={r.rating} />
                    <span style={{ fontSize: 12, color: 'var(--text-tertiary)', marginLeft: 'auto' }}>{r.date}</span>
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text-tertiary)', marginTop: 2 }}>{r.topic}</div>
                </div>
              </div>
              <p style={{ fontSize: 14, lineHeight: 1.6, color: 'var(--text-primary)', marginBottom: r.responded || respondingIdx === i ? 16 : 0 }}>{r.body}</p>

              {r.responded && respondingIdx !== i && (
                <div style={{ background: 'var(--bg-hover)', borderRadius: 12, padding: '12px 16px', borderLeft: '3px solid var(--brand-500)' }}>
                  <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.06em', color: 'var(--text-tertiary)', textTransform: 'uppercase', marginBottom: 6, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span>Your response</span>
                    {isWithin24h(r.responseDate) && (
                      <button onClick={() => editReply(i)} style={{ fontSize: 12, fontWeight: 600, color: 'var(--brand-500)', textTransform: 'none', letterSpacing: 0 }}>Edit reply</button>
                    )}
                  </div>
                  <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5 }}>{r.response}</p>
                </div>
              )}

              {respondingIdx === i && (
                <div style={{ marginTop: 8 }}>
                  <textarea
                    value={responseText}
                    onChange={e => setResponseText(e.target.value)}
                    placeholder="Write a thoughtful response…"
                    style={{ width: '100%', minHeight: 80, padding: 12, background: 'var(--bg-hover)', border: '1px solid var(--border-default)', borderRadius: 10, fontSize: 13, lineHeight: 1.6, resize: 'vertical', outline: 'none', marginBottom: 10 }}
                  />
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button onClick={() => { setRespondingIdx(null); setResponseText(''); }} style={{ height: 32, padding: '0 12px', borderRadius: 999, background: 'transparent', fontSize: 12, fontWeight: 500, color: 'var(--text-secondary)' }}>Cancel</button>
                    <button
                      onClick={() => submitResponse(i)}
                      disabled={!responseText.trim()}
                      style={{ height: 32, padding: '0 14px', borderRadius: 999, background: responseText.trim() ? 'var(--gradient-brand)' : 'var(--bg-hover)', color: responseText.trim() ? '#fff' : 'var(--text-tertiary)', fontSize: 12, fontWeight: 600 }}
                    >Post Reply</button>
                  </div>
                </div>
              )}

              {!r.responded && respondingIdx !== i && (
                <button
                  onClick={() => { setRespondingIdx(i); setResponseText(''); }}
                  style={{ marginTop: 8, fontSize: 13, fontWeight: 500, color: 'var(--brand-500)', display: 'flex', alignItems: 'center', gap: 4, background: 'transparent' }}
                >
                  <Icon name="chat" size={13} /> Respond to this review
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
