'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Icon from '@/components/primitives/Icon';
import { listMyNotifications, markAllNotificationsRead, markNotificationRead } from '@/app/actions/notifications';
import { type Notification, TYPE_COLORS, ROUTE_FOR_NOTIF, timeAgo } from '@/lib/notification-types';

interface Props { onClose: () => void }

export default function NotificationDropdown({ onClose }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const [list, setList] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    listMyNotifications(10).then(data => {
      setList(data as Notification[]);
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    setTimeout(() => document.addEventListener('mousedown', onClick), 0);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [onClose]);

  const markOne = (id: string) => {
    setList(l => l.map(n => n.id === id ? { ...n, read: true } : n));
    markNotificationRead(id).catch(() => {});
  };
  const markAll = () => {
    setList(l => l.map(n => ({ ...n, read: true })));
    markAllNotificationsRead().catch(() => {});
  };
  const unreadCount = list.filter(n => !n.read).length;

  return (
    <div ref={ref} style={{
      position: 'absolute', top: 'calc(100% + 8px)', right: 0,
      width: 360, maxHeight: 460,
      background: 'var(--bg-surface)', border: '1px solid var(--border-default)',
      borderRadius: 18, boxShadow: 'var(--shadow-xl)',
      overflow: 'hidden', display: 'flex', flexDirection: 'column', zIndex: 60,
    }}>
      <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
        <span style={{ fontWeight: 600, fontSize: 14 }}>
          Notifications{unreadCount > 0 && <span style={{ marginLeft: 8, fontSize: 11, background: 'var(--brand-500)', color: '#fff', borderRadius: 999, padding: '2px 7px', fontWeight: 700 }}>{unreadCount}</span>}
        </span>
        <button onClick={markAll} style={{ fontSize: 12, color: 'var(--brand-500)', fontWeight: 600 }}>Mark all read</button>
      </div>

      <div style={{ overflowY: 'auto', flex: 1, padding: 8, display: 'flex', flexDirection: 'column', gap: 4 }}>
        {loading ? (
          <div style={{ padding: 20, textAlign: 'center', fontSize: 12, color: 'var(--text-tertiary)' }}>Loading…</div>
        ) : list.length === 0 ? (
          <div style={{ padding: 20, textAlign: 'center', fontSize: 12, color: 'var(--text-tertiary)' }}>No notifications yet</div>
        ) : list.slice(0, 5).map(n => {
          const c = TYPE_COLORS[n.type] || TYPE_COLORS.system;
          return (
            <div key={n.id} onClick={() => { markOne(n.id); router.push(ROUTE_FOR_NOTIF(n)); onClose(); }}
              style={{
                display: 'flex', alignItems: 'flex-start', gap: 10, padding: '10px 12px',
                borderRadius: 10, cursor: 'pointer',
                background: n.read ? 'transparent' : 'rgba(79,70,229,0.04)',
                position: 'relative', transition: 'background 160ms',
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'}
              onMouseLeave={e => e.currentTarget.style.background = n.read ? 'transparent' : 'rgba(79,70,229,0.04)'}
            >
              {!n.read && <div style={{ position: 'absolute', left: 4, top: '50%', transform: 'translateY(-50%)', width: 5, height: 5, borderRadius: 999, background: 'var(--brand-500)' }} />}
              <div style={{ width: 28, height: 28, borderRadius: 999, background: c.bg, color: c.fg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginLeft: n.read ? 0 : 6 }}>
                <Icon name={c.icon as never} size={13} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1.3 }}>{n.title}</div>
                {n.description && <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{n.description}</div>}
              </div>
              <span style={{ fontSize: 11, color: 'var(--text-tertiary)', whiteSpace: 'nowrap', flexShrink: 0 }}>{timeAgo(n.created_at)}</span>
            </div>
          );
        })}
      </div>

      <Link href="/notifications" onClick={onClose} style={{
        padding: '12px 18px', borderTop: '1px solid var(--border-subtle)',
        fontSize: 13, fontWeight: 600, color: 'var(--brand-500)', textAlign: 'center',
        display: 'block', textDecoration: 'none', flexShrink: 0,
      }}>See all notifications →</Link>
    </div>
  );
}
