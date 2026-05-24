'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Icon from '@/components/primitives/Icon';
import CreateRoomModal from '@/components/rooms/CreateRoomModal';
import RoomCardView from '@/components/rooms/RoomCardView';
import { findRoomByCode, type RoomCard } from '@/app/actions/rooms';
import { toast } from '@/lib/toast';

interface Props {
  publicRooms: RoomCard[];
  myRooms: RoomCard[];
  scheduledRooms: RoomCard[];
}

type Tab = 'public' | 'mine' | 'scheduled';

function JoinByCode() {
  const router = useRouter();
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);

  const join = async () => {
    if (busy || code.trim().length < 2) return;
    setBusy(true);
    const match = await findRoomByCode(code);
    setBusy(false);
    if (!match) {
      toast('Room not found. Check the code and try again.');
      return;
    }
    router.push(`/room/${match.id}`);
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, height: 40, padding: '0 6px 0 14px', borderRadius: 999, background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}>
      <Icon name="lock" size={14} />
      <input
        value={code}
        onChange={e => setCode(e.target.value)}
        onKeyDown={e => { if (e.key === 'Enter') join(); }}
        placeholder="Enter room code (ELM-XXXXXX)"
        style={{ border: 'none', outline: 'none', background: 'transparent', fontSize: 13, color: 'var(--text-primary)', width: 200, fontFamily: 'JetBrains Mono, monospace' }}
      />
      <button onClick={join} disabled={busy} style={{ height: 30, padding: '0 14px', borderRadius: 999, background: 'var(--gradient-brand)', color: '#fff', fontSize: 12, fontWeight: 600, cursor: 'pointer', opacity: busy ? 0.7 : 1 }}>
        {busy ? '…' : 'Join'}
      </button>
    </div>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <div style={{ background: 'var(--bg-surface)', border: '1px dashed var(--border-default)', borderRadius: 18, padding: 40, textAlign: 'center' }}>
      <div style={{ fontSize: 28, marginBottom: 8 }}>🌱</div>
      <div style={{ fontFamily: 'Fraunces, serif', fontStyle: 'italic', fontSize: 18, marginBottom: 4 }}>{text}</div>
      <div style={{ fontSize: 13, color: 'var(--text-tertiary)' }}>Start one — others will join.</div>
    </div>
  );
}

export default function RoomsClient({ publicRooms, myRooms, scheduledRooms }: Props) {
  const [createOpen, setCreateOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [tab, setTab] = useState<Tab>('public');

  const filteredPublic = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return publicRooms;
    return publicRooms.filter(r =>
      r.title.toLowerCase().includes(q) || (r.subject ?? '').toLowerCase().includes(q));
  }, [publicRooms, query]);

  const tabs: { id: Tab; label: string; count: number }[] = [
    { id: 'public', label: 'Public Rooms', count: publicRooms.length },
    { id: 'mine', label: 'My Rooms', count: myRooms.length },
    { id: 'scheduled', label: 'Scheduled', count: scheduledRooms.length },
  ];

  return (
    <div style={{ padding: '32px 40px', maxWidth: 1120, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 16, marginBottom: 24 }}>
        <div>
          <h1 style={{ fontFamily: 'Fraunces, serif', fontSize: 34, fontWeight: 700, letterSpacing: '-0.02em' }}>Study Rooms</h1>
          <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginTop: 4 }}>Join a live room, enter a code, or start your own.</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          <JoinByCode />
          <button onClick={() => setCreateOpen(true)} style={{ height: 40, padding: '0 18px', borderRadius: 999, background: 'var(--gradient-brand)', color: '#fff', fontSize: 14, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
            <Icon name="plus" size={15} /> Create Room
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, borderBottom: '1px solid var(--border-subtle)', marginBottom: 24 }}>
        {tabs.map(t => {
          const active = tab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              style={{
                padding: '10px 16px', background: 'transparent', cursor: 'pointer',
                fontSize: 14, fontWeight: active ? 700 : 500,
                color: active ? 'var(--text-primary)' : 'var(--text-tertiary)',
                borderBottom: `2px solid ${active ? 'var(--brand-500)' : 'transparent'}`,
                marginBottom: -1, display: 'flex', alignItems: 'center', gap: 6,
              }}
            >
              {t.label}
              <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-tertiary)' }}>{t.count}</span>
            </button>
          );
        })}
      </div>

      {tab === 'public' && (
        <>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, height: 36, padding: '0 12px', borderRadius: 999, background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}>
              <Icon name="search" size={14} />
              <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Filter by title or subject…" style={{ border: 'none', outline: 'none', background: 'transparent', fontSize: 13, color: 'var(--text-primary)', width: 180 }} />
            </div>
          </div>
          {filteredPublic.length === 0 ? (
            <EmptyState text={query ? 'No rooms match your search' : 'No public rooms active right now'} />
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
              {filteredPublic.map(r => <RoomCardView key={r.id} room={r} variant="public" />)}
            </div>
          )}
        </>
      )}

      {tab === 'mine' && (
        myRooms.length === 0 ? (
          <EmptyState text="You haven't created or joined any rooms yet" />
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
            {myRooms.map(r => <RoomCardView key={r.id} room={r} variant="mine" />)}
          </div>
        )
      )}

      {tab === 'scheduled' && (
        scheduledRooms.length === 0 ? (
          <EmptyState text="No upcoming scheduled rooms" />
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
            {scheduledRooms.map(r => <RoomCardView key={r.id} room={r} variant="public" />)}
          </div>
        )
      )}

      {createOpen && <CreateRoomModal onClose={() => setCreateOpen(false)} />}
    </div>
  );
}
