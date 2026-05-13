'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { Avatar, Icon, NovaOrb } from '@/components/primitives';
import NovaChat from '@/components/nova/NovaChat';
import { MENTORS, type Mentor } from '@/lib/mentors';

const FILTERS = ['All', 'Mathematics', 'Computer Science', 'Physics', 'Writing', 'Design', 'Medicine'];
const RATING_FILTERS = ['Any rating', '4.5+', '4.8+', '4.9+'];
const PRICE_FILTERS = ['Any price', 'Under ₹600', '₹600–₹900', '₹900+'];

function MentorCard({ m }: { m: Mentor }) {
  return (
    <Link
      href={`/mentors/${m.id}`}
      style={{
        background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)',
        borderRadius: 18, padding: 22, textDecoration: 'none', color: 'inherit',
        display: 'flex', flexDirection: 'column',
        transition: 'all 200ms var(--ease-smooth)', cursor: 'pointer',
      }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--border-strong)'; e.currentTarget.style.boxShadow = 'var(--shadow-md)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-subtle)'; e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'translateY(0)'; }}
    >
      <div style={{ display: 'flex', gap: 14, alignItems: 'center', marginBottom: 14 }}>
        <div style={{ position: 'relative' }}>
          <Avatar name={m.name} size={48} />
          {m.online && <div style={{ position: 'absolute', bottom: -1, right: -1, width: 12, height: 12, borderRadius: 999, background: 'var(--mint-500, #10b981)', border: '2.5px solid var(--bg-surface)' }} />}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)' }}>{m.name}</div>
          <div style={{ fontSize: 12, color: 'var(--text-tertiary)', marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{m.title}</div>
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, color: 'var(--text-secondary)', marginBottom: 12 }}>
        <span><span style={{ color: 'var(--amber-500)' }}>★</span> <strong style={{ color: 'var(--text-primary)' }}>{m.rating}</strong> <span style={{ color: 'var(--text-tertiary)' }}>({m.reviews})</span></span>
        <span style={{ color: 'var(--text-tertiary)' }}>·</span>
        <span>{m.students} students</span>
      </div>
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 16 }}>
        {m.tags.slice(0, 3).map(t => (
          <span key={t} style={{ padding: '4px 10px', borderRadius: 999, background: 'var(--bg-hover)', border: '1px solid var(--border-subtle)', fontSize: 11, color: 'var(--text-secondary)' }}>{t}</span>
        ))}
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 12, borderTop: '1px solid var(--border-subtle)', marginTop: 'auto' }}>
        <div>
          <span style={{ fontWeight: 700, fontSize: 15, color: 'var(--text-primary)' }}>₹{m.price}</span>
          <span style={{ fontSize: 11, color: 'var(--text-tertiary)', marginLeft: 4 }}>/ 30 min</span>
        </div>
        <span style={{ fontSize: 12, color: 'var(--brand-500)', fontWeight: 600 }}>Book →</span>
      </div>
    </Link>
  );
}

function HumanMentorsTab() {
  const [q, setQ] = useState('');
  const [filter, setFilter] = useState('All');
  const [ratingF, setRatingF] = useState(RATING_FILTERS[0]);
  const [priceF, setPriceF] = useState(PRICE_FILTERS[0]);

  const list = useMemo(() => MENTORS.filter(m => {
    if (filter !== 'All' && !m.tags.includes(filter)) return false;
    if (q && !(m.name + m.title + m.tags.join(' ')).toLowerCase().includes(q.toLowerCase())) return false;
    if (ratingF === '4.5+' && m.rating < 4.5) return false;
    if (ratingF === '4.8+' && m.rating < 4.8) return false;
    if (ratingF === '4.9+' && m.rating < 4.9) return false;
    if (priceF === 'Under ₹600' && m.price >= 600) return false;
    if (priceF === '₹600–₹900' && (m.price < 600 || m.price > 900)) return false;
    if (priceF === '₹900+' && m.price < 900) return false;
    return true;
  }), [q, filter, ratingF, priceF]);

  return (
    <>
      {/* Search */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: 6, background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 999, marginBottom: 16, boxShadow: 'var(--shadow-xs)' }}>
        <span style={{ paddingLeft: 12, color: 'var(--text-muted)' }}><Icon name="search" size={16} /></span>
        <input
          value={q}
          onChange={e => setQ(e.target.value)}
          placeholder="Search by name, subject, or skill…"
          style={{ flex: 1, height: 40, background: 'transparent', border: 'none', outline: 'none', color: 'var(--text-primary)', fontSize: 14 }}
        />
      </div>

      {/* Subject chips */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 12, flexWrap: 'wrap' }}>
        {FILTERS.map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            style={{
              height: 32, padding: '0 14px', borderRadius: 999,
              background: filter === f ? 'var(--text-primary)' : 'var(--bg-surface)',
              color: filter === f ? '#fff' : 'var(--text-secondary)',
              border: `1px solid ${filter === f ? 'var(--text-primary)' : 'var(--border-subtle)'}`,
              fontSize: 13, fontWeight: 500, cursor: 'pointer',
            }}
          >{f}</button>
        ))}
      </div>

      {/* Rating + price chips */}
      <div style={{ display: 'flex', gap: 14, marginBottom: 28, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.06em', color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>Rating</span>
          {RATING_FILTERS.map(f => (
            <button
              key={f}
              onClick={() => setRatingF(f)}
              style={{
                height: 28, padding: '0 10px', borderRadius: 999, fontSize: 12, fontWeight: 500,
                background: ratingF === f ? 'var(--brand-500)' : 'var(--bg-surface)',
                color: ratingF === f ? '#fff' : 'var(--text-secondary)',
                border: `1px solid ${ratingF === f ? 'var(--brand-500)' : 'var(--border-subtle)'}`,
                cursor: 'pointer',
              }}
            >{f}</button>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.06em', color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>Price</span>
          {PRICE_FILTERS.map(f => (
            <button
              key={f}
              onClick={() => setPriceF(f)}
              style={{
                height: 28, padding: '0 10px', borderRadius: 999, fontSize: 12, fontWeight: 500,
                background: priceF === f ? 'var(--brand-500)' : 'var(--bg-surface)',
                color: priceF === f ? '#fff' : 'var(--text-secondary)',
                border: `1px solid ${priceF === f ? 'var(--brand-500)' : 'var(--border-subtle)'}`,
                cursor: 'pointer',
              }}
            >{f}</button>
          ))}
        </div>
      </div>

      {list.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-tertiary)' }}>
          <div style={{ fontSize: 40, marginBottom: 14 }}>🔍</div>
          <div style={{ fontFamily: 'Fraunces, serif', fontSize: 22, fontWeight: 500, color: 'var(--text-primary)', marginBottom: 6 }}>No mentors match those filters</div>
          <div style={{ fontSize: 13 }}>Try widening your search.</div>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 14 }}>
          {list.map(m => <MentorCard key={m.id} m={m} />)}
        </div>
      )}
    </>
  );
}

function NovaTab() {
  const [started, setStarted] = useState(false);
  if (started) return <NovaChat />;
  return (
    <div style={{ maxWidth: 720, margin: '0 auto', textAlign: 'center', paddingTop: 40 }}>
      <div style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center', marginBottom: 24 }}>
        <NovaOrb size={84} />
      </div>
      <h2 style={{ fontFamily: 'Fraunces, serif', fontSize: 42, fontWeight: 500, lineHeight: 1.1, letterSpacing: '-0.02em', marginBottom: 14 }}>
        Meet <span style={{ fontStyle: 'italic', color: 'var(--mint-600)' }}>Nova</span>, your AI tutor.
      </h2>
      <p style={{ fontSize: 16, color: 'var(--text-secondary)', maxWidth: 480, margin: '0 auto 36px', lineHeight: 1.6 }}>
        Always on. Replies in seconds. Ask anything — math, writing, code, a concept you&apos;re stuck on.
      </p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 36 }}>
        {[
          ['Instant', 'Replies in under 2s'],
          ['Unlimited', 'Ask as many questions as you want'],
          ['Free with Pro', 'No per-message charges'],
        ].map(([t, d]) => (
          <div key={t} style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 14, padding: 18, textAlign: 'left' }}>
            <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 4 }}>{t}</div>
            <div style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>{d}</div>
          </div>
        ))}
      </div>
      <button
        onClick={() => setStarted(true)}
        style={{
          height: 52, padding: '0 28px', borderRadius: 999,
          background: 'var(--gradient-ai, linear-gradient(135deg, #10b981, #06b6d4))',
          color: '#fff', fontSize: 15, fontWeight: 600,
          display: 'inline-flex', alignItems: 'center', gap: 8,
          boxShadow: '0 6px 18px rgba(16,185,129,0.30)',
          cursor: 'pointer',
        }}
      >
        Start a conversation with Nova <Icon name="chevronR" size={14} />
      </button>
    </div>
  );
}

export default function MentorsPage() {
  const [tab, setTab] = useState<'nova' | 'human'>('human');

  return (
    <div style={{ padding: '32px 40px', maxWidth: 1120, margin: '0 auto' }}>
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', color: 'var(--text-tertiary)', textTransform: 'uppercase', marginBottom: 8 }}>Mentors</div>
        <h1 style={{ fontFamily: 'Fraunces, serif', fontSize: 'clamp(34px, 4vw, 44px)', fontWeight: 500, letterSpacing: '-0.02em', lineHeight: 1.1, maxWidth: 720 }}>
          Learn with an <span style={{ fontStyle: 'italic' }}>AI tutor</span>, or book time with a real <span style={{ fontStyle: 'italic' }}>human expert</span>.
        </h1>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, padding: 4, background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 12, marginBottom: 32, width: 'fit-content' }}>
        {([
          { id: 'nova' as const, label: 'Nova AI' },
          { id: 'human' as const, label: 'Human Mentors' },
        ]).map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            style={{
              padding: '8px 22px', borderRadius: 9, fontSize: 14, fontWeight: 500,
              background: tab === t.id ? 'var(--text-primary)' : 'transparent',
              color: tab === t.id ? '#fff' : 'var(--text-secondary)',
              transition: 'all 200ms', cursor: 'pointer',
            }}
          >{t.label}</button>
        ))}
      </div>

      {tab === 'nova' ? <NovaTab /> : <HumanMentorsTab />}
    </div>
  );
}
