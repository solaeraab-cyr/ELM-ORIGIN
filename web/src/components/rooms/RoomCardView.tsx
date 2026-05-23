'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Icon from '@/components/primitives/Icon';
import { joinRoom, type RoomCard } from '@/app/actions/rooms';
import { toast } from '@/lib/toast';

function RoomTypeBadge({ type }: { type: string }) {
  const isCollab = type === 'collaboration';
  return (
    <span style={{
      fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 999,
      background: isCollab ? 'rgba(245,158,11,0.12)' : 'rgba(79,70,229,0.10)',
      color: isCollab ? 'var(--amber-600)' : 'var(--brand-600)',
      letterSpacing: '0.04em', textTransform: 'uppercase',
    }}>{isCollab ? '⚡ Collab' : '📚 Study'}</span>
  );
}

export default function RoomCardView({ room, variant }: { room: RoomCard; variant: 'mine' | 'public' }) {
  const router = useRouter();
  const [joining, setJoining] = useState(false);
  const hostName = room.host?.full_name || 'Host';
  const isFull = room.participant_count >= room.max_participants;

  const enter = () => router.push(`/room/${room.id}`);

  const join = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (joining || isFull) return;
    setJoining(true);
    try {
      const res = await joinRoom(room.id);
      if (res === 'full') { toast('This room is full'); setJoining(false); return; }
      if (res === 'pending') { toast('Request to join sent'); setJoining(false); return; }
      if (res === 'error') { toast('Could not join room'); setJoining(false); return; }
      router.push(`/room/${room.id}`);
    } catch {
      toast('Could not join room');
      setJoining(false);
    }
  };

  return (
    <div
      onClick={enter}
      style={{
        background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)',
        borderRadius: 18, padding: 20, display: 'flex', flexDirection: 'column', gap: 14,
        transition: 'all 200ms var(--ease-smooth)', cursor: 'pointer',
      }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--border-strong)'; e.currentTarget.style.boxShadow = 'var(--shadow-md)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-subtle)'; e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'translateY(0)'; }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
        <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--brand-500)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{room.subject || 'Study'}</span>
        <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexShrink: 0 }}>
          {!room.is_public && <span style={{ fontSize: 10 }}>🔒</span>}
          <RoomTypeBadge type={room.room_type} />
        </div>
      </div>
      <div>
        <div style={{ fontFamily: 'Fraunces, serif', fontWeight: 600, fontSize: 16, color: 'var(--text-primary)', lineHeight: 1.3, marginBottom: 4 }}>{room.title}</div>
        <div style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>Host: {hostName}</div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 12, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 4 }}>
            <Icon name="users" size={13} /> {room.participant_count}/{room.max_participants}
          </span>
          <span style={{ fontSize: 10, fontWeight: 600, padding: '2px 7px', borderRadius: 999, background: 'rgba(16,185,129,0.10)', color: 'var(--mint-600)' }}>{room.status === 'active' ? 'Live' : room.status}</span>
        </div>
        {variant === 'mine' ? (
          <button onClick={(e) => { e.stopPropagation(); enter(); }} style={{ height: 32, padding: '0 14px', borderRadius: 999, background: 'var(--bg-hover)', border: '1px solid var(--border-default)', color: 'var(--text-primary)', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>Enter</button>
        ) : (
          <button
            onClick={join}
            disabled={joining || isFull}
            style={{
              height: 32, padding: '0 14px', borderRadius: 999,
              background: isFull ? 'var(--bg-hover)' : 'var(--gradient-brand)',
              color: isFull ? 'var(--text-tertiary)' : '#fff',
              border: 'none', fontSize: 12, fontWeight: 600,
              cursor: isFull ? 'default' : 'pointer', opacity: joining ? 0.7 : 1,
            }}
          >{isFull ? 'Room Full' : joining ? '…' : 'Join'}</button>
        )}
      </div>
    </div>
  );
}
