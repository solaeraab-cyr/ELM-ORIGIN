'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { signOut } from '@/app/(auth)/actions';
import Avatar from '../primitives/Avatar';
import Icon from '../primitives/Icon';
import type { IconName } from '../primitives/Icon';

interface Profile {
  full_name: string | null;
  handle: string | null;
  plan: string;
  is_mentor: boolean;
}

interface AvatarDropdownProps {
  user: Profile;
}

const STUDENT_ITEMS: [string, string, IconName][] = [
  ['/profile',      'View profile',  'user'],
  ['/my-sessions',  'My sessions',   'calendar'],
  ['/settings',     'Settings',      'settings'],
  ['/pricing',      'Upgrade',       'sparkles'],
];

const MENTOR_ITEMS: [string, string, IconName][] = [
  ['/mentor/profile', 'Edit profile',         'user'],
  ['/mentor/bookings','Bookings',              'calendar'],
  ['/mentor/earnings','Earnings',              'trending'],
  ['/mentor/settings','Settings',              'settings'],
];

export default function AvatarDropdown({ user }: AvatarDropdownProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const displayName = user.full_name || user.handle || 'You';

  useEffect(() => {
    const onMouse = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onMouse);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onMouse);
      document.removeEventListener('keydown', onKey);
    };
  }, []);

  const items = user.is_mentor ? MENTOR_ITEMS : STUDENT_ITEMS;

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button
        onClick={() => setOpen((o) => !o)}
        style={{
          display: 'flex', alignItems: 'center', gap: 8,
          height: 40, padding: '0 8px 0 6px', borderRadius: 999,
          background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)',
          cursor: 'pointer',
        }}
      >
        <Avatar name={displayName} size={28} />
        <Icon name="chevronD" size={12} color="var(--text-tertiary)" />
      </button>

      {open && (
        <div style={{
          position: 'absolute', top: 48, right: 0, zIndex: 50,
          minWidth: 220, background: 'var(--bg-surface)',
          border: '1px solid var(--border-subtle)', borderRadius: 14,
          boxShadow: 'var(--shadow-lg)', padding: 8,
        }}>
          {/* User info header */}
          <div style={{ padding: '10px 12px 12px', borderBottom: '1px solid var(--border-subtle)', marginBottom: 6 }}>
            <div style={{ fontFamily: 'Inter', fontWeight: 600, fontSize: 13, color: 'var(--text-primary)' }}>{displayName}</div>
            <div style={{ fontSize: 11, color: 'var(--text-tertiary)', marginTop: 2 }}>{user.plan} plan</div>
          </div>

          {items.map(([href, label, icon]) => (
            <Link
              key={href}
              href={href}
              onClick={() => setOpen(false)}
              style={{
                display: 'flex', alignItems: 'center', gap: 10,
                width: '100%', padding: '9px 12px', borderRadius: 8,
                fontFamily: 'Inter', fontSize: 13, color: 'var(--text-primary)',
                textDecoration: 'none',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(14,18,40,0.04)')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
            >
              <Icon name={icon} size={14} color="var(--text-tertiary)" />
              {label}
            </Link>
          ))}

          <div style={{ height: 1, background: 'var(--border-subtle)', margin: '6px 4px' }} />

          <form action={signOut}>
            <button
              type="submit"
              style={{
                display: 'flex', alignItems: 'center', gap: 10,
                width: '100%', padding: '9px 12px', borderRadius: 8,
                fontFamily: 'Inter', fontSize: 13, color: '#b42318', textAlign: 'left',
                cursor: 'pointer',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(180,35,24,0.06)')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
            >
              <Icon name="logout" size={14} />
              Sign out
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
