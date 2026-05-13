'use client';

import { useEffect, useState } from 'react';
import Icon from '../primitives/Icon';
import AvatarDropdown from './AvatarDropdown';
import NotificationDropdown from './NotificationDropdown';
import { unreadNotificationCount } from '@/app/actions/notifications';
import { useRealtimeTable } from '@/hooks/useRealtimeSubscription';
import { toast } from '@/lib/toast';

interface Profile {
  id?: string;
  full_name: string | null;
  handle: string | null;
  plan: string;
  is_mentor: boolean;
}

interface TopBarProps {
  user: Profile;
}

type NotifRow = { id: string; user_id: string; title: string; read: boolean };

export default function TopBar({ user }: TopBarProps) {
  const [notifOpen, setNotifOpen] = useState(false);
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    unreadNotificationCount().then(setUnread).catch(() => {});
  }, []);

  useRealtimeTable<NotifRow>({
    channelName: `notif:${user.id ?? 'anon'}`,
    table: 'notifications',
    event: 'INSERT',
    filter: user.id ? `user_id=eq.${user.id}` : undefined,
    enabled: !!user.id,
    onChange: (payload) => {
      const n = payload.new as NotifRow | undefined;
      if (!n) return;
      setUnread(c => c + 1);
      toast(n.title);
    },
  });

  return (
    <header style={{
      height: 68, padding: '0 32px',
      display: 'flex', alignItems: 'center', gap: 12,
      background: 'rgba(248,249,255,0.80)',
      backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
      position: 'sticky', top: 0, zIndex: 10,
      borderBottom: '1px solid var(--border-subtle)', flexShrink: 0,
    }}>
      <div style={{ flex: 1 }} />

      {/* Search */}
      <button style={{
        display: 'flex', alignItems: 'center', gap: 10,
        height: 40, padding: '0 16px', borderRadius: 999,
        color: 'var(--text-tertiary)', fontSize: 13,
        minWidth: 260, background: 'var(--bg-surface)',
        border: '1px solid var(--border-subtle)', cursor: 'text',
      }}>
        <Icon name="search" size={15} />
        <span>Search mentors, rooms, topics…</span>
        <span style={{ marginLeft: 'auto', fontFamily: 'JetBrains Mono, monospace', fontSize: 11, border: '1px solid var(--border-default)', padding: '2px 6px', borderRadius: 4, color: 'var(--text-muted)' }}>⌘K</span>
      </button>

      {/* Notifications */}
      <div style={{ position: 'relative' }}>
        <button
          onClick={() => { setNotifOpen(o => !o); if (!notifOpen) setUnread(0); }}
          style={{
            width: 40, height: 40, borderRadius: 999,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: notifOpen ? 'var(--text-primary)' : 'var(--text-secondary)',
            background: notifOpen ? 'var(--bg-hover)' : 'var(--bg-surface)',
            border: `1px solid ${notifOpen ? 'var(--border-strong)' : 'var(--border-subtle)'}`,
            position: 'relative',
          }}
        >
          <Icon name="bell" size={16} />
          {unread > 0 && (
            <span style={{
              position: 'absolute', top: 4, right: 4,
              minWidth: 16, height: 16, borderRadius: 999,
              background: 'var(--amber-500)', color: '#fff',
              fontSize: 10, fontWeight: 700, padding: '0 4px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              border: '2px solid var(--bg-surface)',
            }}>{unread > 9 ? '9+' : unread}</span>
          )}
        </button>
        {notifOpen && <NotificationDropdown onClose={() => setNotifOpen(false)} />}
      </div>

      <AvatarDropdown user={user} />
    </header>
  );
}
