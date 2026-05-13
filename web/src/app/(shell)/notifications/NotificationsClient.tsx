'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import Icon from '@/components/primitives/Icon';
import { markAllNotificationsRead, markNotificationRead } from '@/app/actions/notifications';
import { type Notification, TYPE_COLORS, ROUTE_FOR_NOTIF, timeAgo } from '@/lib/notification-types';

function NotifItem({ n, onMarkRead, onClick }: { n: Notification; onMarkRead: () => void; onClick: () => void }) {
  const c = TYPE_COLORS[n.type] || TYPE_COLORS.system;
  return (
    <div onClick={onClick} style={{
      position: 'relative', cursor: 'pointer',
      display: 'flex', alignItems: 'flex-start', gap: 12,
      padding: '14px 18px', borderRadius: 12,
      background: n.read ? 'transparent' : 'rgba(79,70,229,0.04)',
      border: '1px solid ' + (n.read ? 'var(--border-subtle)' : 'rgba(79,70,229,0.18)'),
      transition: 'background 200ms',
    }}>
      {!n.read && <div style={{ position: 'absolute', left: 6, top: '50%', transform: 'translateY(-50%)', width: 6, height: 6, borderRadius: 999, background: 'var(--brand-500)' }} />}
      <div style={{ width: 32, height: 32, borderRadius: 999, background: c.bg, color: c.fg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginLeft: n.read ? 0 : 8 }}>
        <Icon name={c.icon as never} size={14} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 14, fontWeight: 600 }}>{n.title}</div>
        {n.description && <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2, lineHeight: 1.5 }}>{n.description}</div>}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6 }}>
        <span style={{ fontSize: 11, color: 'var(--text-tertiary)', whiteSpace: 'nowrap' }}>{timeAgo(n.created_at)}</span>
        {!n.read && (
          <button onClick={e => { e.stopPropagation(); onMarkRead(); }} style={{ fontSize: 12, color: 'var(--brand-500)', fontWeight: 600 }}>✓</button>
        )}
      </div>
    </div>
  );
}

interface Props { initial: Notification[] }

export default function NotificationsClient({ initial }: Props) {
  const router = useRouter();
  const [list, setList] = useState<Notification[]>(initial);
  const [tab, setTab] = useState<'All' | 'Sessions' | 'Community' | 'System'>('All');
  const [, startTransition] = useTransition();

  const counts = {
    All: list.length,
    Sessions: list.filter(n => n.type === 'session' || n.type.startsWith('booking')).length,
    Community: list.filter(n => n.type === 'community' || n.type === 'friend_request').length,
    System: list.filter(n => n.type === 'system').length,
  };
  const filtered = list.filter(n => {
    if (tab === 'All') return true;
    if (tab === 'Sessions') return n.type === 'session' || n.type.startsWith('booking');
    if (tab === 'Community') return n.type === 'community' || n.type === 'friend_request';
    return n.type === 'system';
  });
  const anyUnread = list.some(n => !n.read);

  const markOne = (id: string) => {
    setList(l => l.map(n => n.id === id ? { ...n, read: true } : n));
    startTransition(() => { markNotificationRead(id).catch(() => {}); });
  };
  const markAll = () => {
    setList(l => l.map(n => ({ ...n, read: true })));
    startTransition(() => { markAllNotificationsRead().catch(() => {}); });
  };

  return (
    <div style={{ padding: '32px 40px', maxWidth: 760, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 22 }}>
        <h1 style={{ fontFamily: 'Fraunces, serif', fontSize: 36, fontWeight: 700, letterSpacing: '-0.02em' }}>Notifications</h1>
        <button onClick={markAll} disabled={!anyUnread} style={{ fontSize: 13, color: anyUnread ? 'var(--brand-500)' : 'var(--text-tertiary)', fontWeight: 600, opacity: anyUnread ? 1 : 0.5 }}>Mark all read</button>
      </div>

      <div style={{ display: 'flex', gap: 6, marginBottom: 22, flexWrap: 'wrap' }}>
        {(['All', 'Sessions', 'Community', 'System'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)} style={{
            height: 32, padding: '0 14px', borderRadius: 999, fontSize: 13, fontWeight: 500,
            background: tab === t ? 'var(--text-primary)' : 'var(--bg-surface)',
            color: tab === t ? '#fff' : 'var(--text-secondary)',
            border: `1px solid ${tab === t ? 'var(--text-primary)' : 'var(--border-subtle)'}`,
          }}>{t} ({counts[t]})</button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '80px 20px', color: 'var(--text-tertiary)' }}>
          <div style={{ fontSize: 40, marginBottom: 14 }}>📭</div>
          <div style={{ fontFamily: 'Fraunces, serif', fontSize: 22, fontWeight: 500, color: 'var(--text-primary)', marginBottom: 6 }}>All caught up!</div>
          <div style={{ fontSize: 13 }}>We&apos;ll let you know when something new lands.</div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {filtered.map(n => (
            <NotifItem key={n.id} n={n}
              onMarkRead={() => markOne(n.id)}
              onClick={() => { markOne(n.id); router.push(ROUTE_FOR_NOTIF(n)); }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
