'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { NAV_ITEMS, MENTOR_NAV_ITEMS } from './navigation';
import Icon from '../primitives/Icon';
import Avatar from '../primitives/Avatar';
import type { IconName } from '../primitives/Icon';

interface Profile {
  full_name: string | null;
  handle: string | null;
  plan: string;
  is_mentor: boolean;
  streak: number;
}

interface SidebarProps {
  isMentor: boolean;
  user: Profile;
}

export default function Sidebar({ isMentor, user }: SidebarProps) {
  const pathname = usePathname();
  const NAV = isMentor ? MENTOR_NAV_ITEMS : NAV_ITEMS;
  const isFree = user.plan === 'Free';
  const displayName = user.full_name || user.handle || 'You';

  return (
    <aside
      style={{
        width: 232,
        flexShrink: 0,
        background: 'var(--bg-sidebar)',
        borderRight: '1px solid var(--border-subtle)',
        display: 'flex',
        flexDirection: 'column',
        padding: '28px 18px',
        height: '100vh',
        position: 'sticky',
        top: 0,
      }}
      className="hidden md:flex"
    >
      {/* Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '4px 6px 32px' }}>
        <Image src="/elm-origin-logo.png" alt="Elm Origin" height={32} width={120} style={{ height: 32, width: 'auto' }} priority />
      </div>

      {/* Nav */}
      <nav style={{ display: 'flex', flexDirection: 'column', gap: 2, flex: 1 }}>
        {NAV.map((item) => {
          const active = pathname === item.href || pathname.startsWith(item.href + '/');
          return (
            <Link
              key={item.id}
              href={item.href}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '11px 14px',
                borderRadius: 12,
                color: active ? 'var(--text-primary)' : 'var(--text-secondary)',
                background: active ? 'var(--bg-surface)' : 'transparent',
                boxShadow: active ? 'var(--shadow-xs)' : 'none',
                fontFamily: 'Inter, system-ui, sans-serif',
                fontWeight: active ? 600 : 500,
                fontSize: 14,
                transition: 'all 220ms var(--ease-smooth)',
                textDecoration: 'none',
              }}
            >
              <span style={{ color: active ? 'var(--brand-500)' : 'currentColor', transition: 'color 220ms' }}>
                <Icon name={item.icon as IconName} size={18} />
              </span>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Bottom: streak + upgrade + profile */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {/* Streak card */}
        <div style={{ borderRadius: 14, padding: 14, background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 34, height: 34, borderRadius: 10, background: 'rgba(217,119,6,0.10)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--amber-500)' }}>
              <Icon name="fire" size={18} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: 'Fraunces, serif', fontWeight: 700, fontSize: 22, lineHeight: 1, color: 'var(--text-primary)' }}>
                {user.streak}
              </div>
              <div style={{ fontSize: 10, color: 'var(--text-tertiary)', marginTop: 2, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Day streak</div>
            </div>
          </div>
        </div>

        {/* Upgrade button (Free only) */}
        {isFree && (
          <Link href="/pricing" style={{
            display: 'flex', alignItems: 'center', gap: 10,
            padding: '11px 14px', borderRadius: 12,
            background: 'linear-gradient(135deg, var(--brand-500), var(--brand-700))',
            color: '#fff', fontFamily: 'Inter, system-ui', fontWeight: 600, fontSize: 13,
            boxShadow: 'var(--shadow-sm)', textDecoration: 'none',
          }}>
            <Icon name="sparkles" size={15} />
            <span>Upgrade to Pro</span>
          </Link>
        )}

        {/* Profile chip */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: 8, borderRadius: 12, cursor: 'default' }}>
          <Link href="/profile" style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1, minWidth: 0, textDecoration: 'none' }}>
            <Avatar name={displayName} size={32} />
            <div style={{ flex: 1, minWidth: 0, overflow: 'hidden' }}>
              <div style={{ fontFamily: 'Inter', fontWeight: 600, fontSize: 13, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {displayName}
              </div>
              <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>
                {user.plan} {user.handle ? `· @${user.handle}` : ''}
              </div>
            </div>
          </Link>
          <Link href="/settings" title="Settings" style={{ color: 'var(--text-tertiary)', padding: 4 }}>
            <Icon name="settings" size={14} strokeWidth={1.5} />
          </Link>
        </div>
      </div>
    </aside>
  );
}
