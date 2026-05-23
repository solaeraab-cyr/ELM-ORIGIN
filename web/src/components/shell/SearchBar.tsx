'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Icon from '../primitives/Icon';
import { searchAll, type SearchResults } from '@/app/actions/rooms';

export default function SearchBar() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResults>({ rooms: [], mentors: [] });
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  // Debounced search (300ms), min 2 chars.
  useEffect(() => {
    const q = query.trim();
    if (q.length < 2) {
      setResults({ rooms: [], mentors: [] });
      setLoading(false);
      return;
    }
    setLoading(true);
    const t = setTimeout(() => {
      searchAll(q)
        .then(r => setResults(r))
        .catch(() => setResults({ rooms: [], mentors: [] }))
        .finally(() => setLoading(false));
    }, 300);
    return () => clearTimeout(t);
  }, [query]);

  // Close on outside click.
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  const go = (href: string) => {
    setOpen(false);
    setQuery('');
    router.push(href);
  };

  const hasQuery = query.trim().length >= 2;
  const isEmpty = hasQuery && !loading && results.rooms.length === 0 && results.mentors.length === 0;

  return (
    <div ref={wrapRef} style={{ position: 'relative', minWidth: 260 }}>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 10,
        height: 40, padding: '0 16px', borderRadius: open ? '20px 20px 0 0' : 999,
        color: 'var(--text-tertiary)', fontSize: 13,
        background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)',
        borderBottom: open ? '1px solid transparent' : '1px solid var(--border-subtle)',
      }}>
        <Icon name="search" size={15} />
        <input
          value={query}
          onChange={e => setQuery(e.target.value)}
          onFocus={() => setOpen(true)}
          placeholder="Search mentors, rooms, topics…"
          style={{ flex: 1, border: 'none', outline: 'none', background: 'transparent', fontSize: 13, color: 'var(--text-primary)' }}
        />
        {query && (
          <button onClick={() => setQuery('')} style={{ color: 'var(--text-tertiary)', display: 'flex' }}>
            <Icon name="x" size={13} />
          </button>
        )}
      </div>

      {open && hasQuery && (
        <div style={{
          position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 200,
          background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)',
          borderTop: 'none', borderRadius: '0 0 16px 16px',
          boxShadow: 'var(--shadow-lg)', maxHeight: 380, overflowY: 'auto', padding: '8px 0',
        }}>
          {loading && (
            <div style={{ padding: '14px 16px', fontSize: 13, color: 'var(--text-tertiary)' }}>Searching…</div>
          )}

          {!loading && isEmpty && (
            <div style={{ padding: '20px 16px', fontSize: 13, color: 'var(--text-tertiary)', textAlign: 'center' }}>No results found</div>
          )}

          {!loading && results.rooms.length > 0 && (
            <div>
              <div style={{ padding: '6px 16px', fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>Rooms</div>
              {results.rooms.map(r => (
                <button key={r.id} onClick={() => go(`/room/${r.id}`)} style={{
                  display: 'flex', alignItems: 'center', gap: 10, width: '100%', textAlign: 'left',
                  padding: '8px 16px', background: 'transparent', cursor: 'pointer',
                }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <span style={{ fontSize: 14 }}>📚</span>
                  <span style={{ minWidth: 0, flex: 1 }}>
                    <span style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.title}</span>
                    {r.subject && <span style={{ display: 'block', fontSize: 11, color: 'var(--text-tertiary)' }}>{r.subject}</span>}
                  </span>
                </button>
              ))}
            </div>
          )}

          {!loading && results.mentors.length > 0 && (
            <div>
              <div style={{ padding: '6px 16px', fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>Mentors</div>
              {results.mentors.map(m => (
                <button key={m.id} onClick={() => go(`/mentors/${m.id}`)} style={{
                  display: 'flex', alignItems: 'center', gap: 10, width: '100%', textAlign: 'left',
                  padding: '8px 16px', background: 'transparent', cursor: 'pointer',
                }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <span style={{ fontSize: 14 }}>🎓</span>
                  <span style={{ minWidth: 0, flex: 1 }}>
                    <span style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{m.full_name || m.handle || 'Mentor'}</span>
                    {m.handle && <span style={{ display: 'block', fontSize: 11, color: 'var(--text-tertiary)' }}>@{m.handle}</span>}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
