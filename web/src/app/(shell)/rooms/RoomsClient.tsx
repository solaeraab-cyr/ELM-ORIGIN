'use client';

import { useMemo, useState } from 'react';
import Icon from '@/components/primitives/Icon';
import CreateRoomModal from '@/components/rooms/CreateRoomModal';
import RoomCardView from '@/components/rooms/RoomCardView';
import { type RoomCard } from '@/app/actions/rooms';

interface Props {
  publicRooms: RoomCard[];
  myRooms: RoomCard[];
}

export default function RoomsClient({ publicRooms, myRooms }: Props) {
  const [createOpen, setCreateOpen] = useState(false);
  const [query, setQuery] = useState('');

  const filteredPublic = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return publicRooms;
    return publicRooms.filter(r =>
      r.title.toLowerCase().includes(q) || (r.subject ?? '').toLowerCase().includes(q));
  }, [publicRooms, query]);

  return (
    <div style={{ padding: '32px 40px', maxWidth: 1120, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 16, marginBottom: 28 }}>
        <div>
          <h1 style={{ fontFamily: 'Fraunces, serif', fontSize: 34, fontWeight: 700, letterSpacing: '-0.02em' }}>Study Rooms</h1>
          <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginTop: 4 }}>Join a live room or start your own.</p>
        </div>
        <button onClick={() => setCreateOpen(true)} style={{ height: 40, padding: '0 18px', borderRadius: 999, background: 'var(--gradient-brand)', color: '#fff', fontSize: 14, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
          <Icon name="plus" size={15} /> Create Room
        </button>
      </div>

      {myRooms.length > 0 && (
        <div style={{ marginBottom: 36 }}>
          <h2 style={{ fontFamily: 'Fraunces, serif', fontSize: 22, fontWeight: 600, marginBottom: 16 }}>Your Rooms</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
            {myRooms.map(r => <RoomCardView key={r.id} room={r} variant="mine" />)}
          </div>
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, gap: 12, flexWrap: 'wrap' }}>
        <h2 style={{ fontFamily: 'Fraunces, serif', fontSize: 22, fontWeight: 600 }}>Public Rooms</h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, height: 36, padding: '0 12px', borderRadius: 999, background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}>
          <Icon name="search" size={14} />
          <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Filter rooms…" style={{ border: 'none', outline: 'none', background: 'transparent', fontSize: 13, color: 'var(--text-primary)', width: 160 }} />
        </div>
      </div>

      {filteredPublic.length === 0 ? (
        <div style={{ background: 'var(--bg-surface)', border: '1px dashed var(--border-default)', borderRadius: 18, padding: 40, textAlign: 'center' }}>
          <div style={{ fontSize: 28, marginBottom: 8 }}>🌱</div>
          <div style={{ fontFamily: 'Fraunces, serif', fontStyle: 'italic', fontSize: 18, marginBottom: 4 }}>{query ? 'No rooms match your search' : 'No public rooms active right now'}</div>
          <div style={{ fontSize: 13, color: 'var(--text-tertiary)' }}>Start one — others will join.</div>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
          {filteredPublic.map(r => <RoomCardView key={r.id} room={r} variant="public" />)}
        </div>
      )}

      {createOpen && <CreateRoomModal onClose={() => setCreateOpen(false)} />}
    </div>
  );
}
