'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Icon from '@/components/primitives/Icon';
import { joinRoom, deleteRoom, type RoomCard } from '@/app/actions/rooms';
import { toast } from '@/lib/toast';
import { roomCode, roomLink } from '@/lib/roomCode';
import { createClient } from '@/lib/supabase/client';
import CreateRoomModal from './CreateRoomModal';

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

interface Props {
  room: RoomCard;
  variant: 'mine' | 'public';
  /** Profile id of the signed-in user. Required to gate the host-only kebab. */
  currentUserId?: string;
  /** Callback fired after a successful host-only delete (e.g. for optimistic
   *  list updates in the parent). */
  onDeleted?: (id: string) => void;
}

export default function RoomCardView({ room, variant, currentUserId, onDeleted }: Props) {
  const router = useRouter();
  const [joining, setJoining] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const hostName = room.host?.full_name || 'Host';
  const isFull = room.participant_count >= room.max_participants;
  // Strict host check — never show host-only controls otherwise.
  const isHost = !!currentUserId && currentUserId === room.creator_id;

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

  // Close the host menu on outside click.
  useEffect(() => {
    if (!menuOpen) return;
    const onClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    };
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setMenuOpen(false); };
    document.addEventListener('mousedown', onClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [menuOpen]);

  const copyLink = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setMenuOpen(false);
    try { await navigator.clipboard.writeText(roomLink(room.id)); toast('Link copied'); }
    catch { toast('Copy failed'); }
  };
  const copyCode = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setMenuOpen(false);
    try { await navigator.clipboard.writeText(roomCode(room.id)); toast('Code copied'); }
    catch { toast('Copy failed'); }
  };
  const openEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    setMenuOpen(false);
    setEditOpen(true);
  };
  const askDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    setMenuOpen(false);
    setConfirmDelete(true);
  };

  const doDelete = async () => {
    if (deleting) return;
    setDeleting(true);
    // Tell anyone currently in the room to disconnect & route home. We send the
    // broadcast BEFORE the server delete so listeners don't race against
    // dropping rows. Fire-and-forget; if the channel doesn't subscribe in time,
    // the server delete still proceeds.
    try {
      const supabase = createClient();
      const ch = supabase.channel(`room-control:${room.id}`);
      await new Promise<void>((resolve) => {
        let done = false;
        ch.subscribe(status => {
          if (done) return;
          if (status === 'SUBSCRIBED') { done = true; resolve(); }
        });
        // Bail after 800ms so a slow channel doesn't block the user.
        setTimeout(() => { if (!done) { done = true; resolve(); } }, 800);
      });
      await ch.send({ type: 'broadcast', event: 'deleted', payload: { roomId: room.id } });
      supabase.removeChannel(ch);
    } catch { /* ignore — server delete is the source of truth */ }

    const res = await deleteRoom(room.id);
    if (!res.ok) {
      setDeleting(false);
      toast(res.error);
      return;
    }
    setConfirmDelete(false);
    setDeleting(false);
    toast('Room deleted');
    onDeleted?.(room.id);
    router.refresh();
  };

  return (
    <div
      onClick={() => { if (!menuOpen && !editOpen && !confirmDelete) enter(); }}
      style={{
        position: 'relative',
        background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)',
        borderRadius: 18, padding: 20, display: 'flex', flexDirection: 'column', gap: 14,
        transition: 'all 200ms var(--ease-smooth)', cursor: 'pointer',
      }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--border-strong)'; e.currentTarget.style.boxShadow = 'var(--shadow-md)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-subtle)'; e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'translateY(0)'; }}
    >
      {isHost && (
        <div ref={menuRef} style={{ position: 'absolute', top: 10, right: 10, zIndex: 2 }} onClick={e => e.stopPropagation()}>
          <button
            onClick={(e) => { e.stopPropagation(); setMenuOpen(o => !o); }}
            title="Room actions"
            aria-label="Room actions"
            style={{
              width: 28, height: 28, borderRadius: 8, padding: 0,
              background: menuOpen ? 'var(--bg-hover)' : 'transparent',
              border: '1px solid ' + (menuOpen ? 'var(--border-default)' : 'transparent'),
              color: 'var(--text-secondary)', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 16, lineHeight: 1, fontWeight: 700,
            }}
          >⋯</button>
          {menuOpen && (
            <div style={{
              position: 'absolute', top: 'calc(100% + 6px)', right: 0, minWidth: 200,
              background: 'var(--bg-surface)', border: '1px solid var(--border-default)',
              borderRadius: 12, boxShadow: 'var(--shadow-lg)', padding: 6, zIndex: 10,
            }}>
              <MenuItem label="Copy invite link" onClick={copyLink} />
              <MenuItem label="Copy room code" hint={roomCode(room.id)} onClick={copyCode} />
              <MenuItem label="Edit room" onClick={openEdit} />
              <div style={{ height: 1, background: 'var(--border-subtle)', margin: '4px 2px' }} />
              <MenuItem label="Delete room" danger onClick={askDelete} />
            </div>
          )}
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8, paddingRight: isHost ? 36 : 0 }}>
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

      {/* Edit modal — reuses the create form pre-filled with this room's data. */}
      {editOpen && (
        <div onClick={e => e.stopPropagation()}>
          <CreateRoomModal
            onClose={() => setEditOpen(false)}
            editing={room}
            onSaved={() => setEditOpen(false)}
          />
        </div>
      )}

      {/* Delete confirmation dialog. */}
      {confirmDelete && (
        <div
          onClick={(e) => { e.stopPropagation(); if (!deleting) setConfirmDelete(false); }}
          style={{
            position: 'fixed', inset: 0, zIndex: 700,
            background: 'rgba(7,10,24,0.55)', backdropFilter: 'blur(6px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24,
            cursor: 'default',
          }}
        >
          <div onClick={e => e.stopPropagation()} style={{
            width: 460, maxWidth: '100%', padding: 28, background: 'var(--bg-surface)',
            borderRadius: 18, border: '1px solid var(--border-subtle)', boxShadow: 'var(--shadow-xl)',
          }}>
            <div style={{ fontFamily: 'Fraunces, serif', fontSize: 22, fontWeight: 700, marginBottom: 8 }}>Delete this room?</div>
            <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.55, marginBottom: 18 }}>
              This will permanently delete &ldquo;<strong style={{ color: 'var(--text-primary)' }}>{room.title}</strong>&rdquo; and end any active session. Chat, notes, and board data for this room will be lost. This cannot be undone.
            </p>
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                onClick={() => { if (!deleting) setConfirmDelete(false); }}
                disabled={deleting}
                style={{ flex: 1, height: 44, padding: '0 14px', borderRadius: 999, background: 'var(--bg-hover)', border: '1px solid var(--border-default)', fontSize: 14, fontWeight: 500, cursor: deleting ? 'default' : 'pointer' }}
              >Cancel</button>
              <button
                onClick={doDelete}
                disabled={deleting}
                style={{
                  flex: 1, height: 44, padding: '0 14px', borderRadius: 999,
                  background: '#ef4444', color: '#fff', border: 'none',
                  fontSize: 14, fontWeight: 600, cursor: deleting ? 'default' : 'pointer',
                  opacity: deleting ? 0.7 : 1,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                }}
              >{deleting ? 'Deleting…' : 'Delete room'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function MenuItem({ label, hint, danger, onClick }: { label: string; hint?: string; danger?: boolean; onClick: (e: React.MouseEvent) => void }) {
  return (
    <button
      onClick={onClick}
      style={{
        width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10,
        padding: '9px 12px', borderRadius: 8, border: 'none', background: 'transparent', textAlign: 'left',
        color: danger ? '#ef4444' : 'var(--text-primary)', fontSize: 13, fontWeight: 500, cursor: 'pointer',
      }}
      onMouseEnter={e => { e.currentTarget.style.background = danger ? 'rgba(239,68,68,0.08)' : 'var(--bg-hover)'; }}
      onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
    >
      <span>{label}</span>
      {hint && <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, color: 'var(--text-tertiary)' }}>{hint}</span>}
    </button>
  );
}
