'use client';

import { useEffect, useRef, useState } from 'react';
import { Avatar, Icon } from '@/components/primitives';
import { listRoomMessages, sendRoomMessage } from '@/app/actions/rooms';
import { useRealtimeTable } from '@/hooks/useRealtimeSubscription';

export type RoomMessage = {
  id: string;
  room_id: string;
  user_id: string;
  content: string;
  created_at: string;
  author?: { full_name: string | null; avatar_url: string | null } | null;
};

interface Props {
  roomId: string;
  currentUserId?: string;
  onClose: () => void;
}

export default function LiveRoomChat({ roomId, currentUserId, onClose }: Props) {
  const [messages, setMessages] = useState<RoomMessage[]>([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Initial load
  useEffect(() => {
    listRoomMessages(roomId).then(data => setMessages(data as RoomMessage[]));
  }, [roomId]);

  // Subscribe to new messages
  useRealtimeTable<RoomMessage>({
    channelName: `room-msgs:${roomId}`,
    table: 'room_messages',
    event: 'INSERT',
    filter: `room_id=eq.${roomId}`,
    onChange: (payload) => {
      const m = payload.new as RoomMessage | undefined;
      if (!m) return;
      setMessages(prev => prev.some(p => p.id === m.id) ? prev : [...prev, m]);
    },
  });

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages]);

  const send = async () => {
    if (!input.trim() || sending) return;
    setSending(true);
    try {
      await sendRoomMessage(roomId, input.trim());
      setInput('');
    } catch {
      // best-effort
    } finally {
      setSending(false);
    }
  };

  return (
    <>
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(7,10,24,0.40)', zIndex: 700 }} />
      <div style={{
        position: 'fixed', top: 0, right: 0, height: '100vh', width: 360, zIndex: 701,
        background: 'var(--bg-surface)', borderLeft: '1px solid var(--border-subtle)',
        boxShadow: 'var(--shadow-xl)', display: 'flex', flexDirection: 'column',
      }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontFamily: 'Fraunces, serif', fontSize: 17, fontWeight: 700 }}>Chat</span>
          <button onClick={onClose} style={{ width: 28, height: 28, borderRadius: 8, color: 'var(--text-tertiary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icon name="x" size={14} />
          </button>
        </div>

        <div ref={scrollRef} style={{ flex: 1, overflowY: 'auto', padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
          {messages.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-tertiary)', fontSize: 13 }}>
              <div style={{ fontSize: 28, marginBottom: 8 }}>💬</div>
              Be the first to say hi!
            </div>
          ) : messages.map(m => {
            const isMe = m.user_id === currentUserId;
            const name = m.author?.full_name || 'Anon';
            return (
              <div key={m.id} style={{ display: 'flex', gap: 8, flexDirection: isMe ? 'row-reverse' : 'row' }}>
                <Avatar name={name} size={28} />
                <div style={{ maxWidth: '75%' }}>
                  <div style={{ fontSize: 11, color: 'var(--text-tertiary)', marginBottom: 2, textAlign: isMe ? 'right' : 'left' }}>{isMe ? 'You' : name}</div>
                  <div style={{
                    padding: '8px 12px', borderRadius: isMe ? '14px 14px 4px 14px' : '14px 14px 14px 4px',
                    background: isMe ? 'var(--text-primary)' : 'var(--bg-hover)',
                    color: isMe ? '#fff' : 'var(--text-primary)',
                    fontSize: 13, lineHeight: 1.5, wordBreak: 'break-word',
                  }}>{m.content}</div>
                </div>
              </div>
            );
          })}
        </div>

        <div style={{ padding: 12, borderTop: '1px solid var(--border-subtle)' }}>
          <div style={{ display: 'flex', gap: 6 }}>
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } }}
              placeholder="Say something…"
              style={{ flex: 1, height: 38, padding: '0 12px', background: 'var(--bg-base)', border: '1px solid var(--border-default)', borderRadius: 10, fontSize: 13, color: 'var(--text-primary)', outline: 'none' }}
            />
            <button
              onClick={send}
              disabled={!input.trim() || sending}
              style={{ width: 38, height: 38, borderRadius: 10, background: input.trim() ? 'var(--gradient-brand)' : 'var(--bg-hover)', color: input.trim() ? '#fff' : 'var(--text-tertiary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              <Icon name="send" size={14} />
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
