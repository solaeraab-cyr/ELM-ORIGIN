'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { NAV_ITEMS, MENTOR_NAV_ITEMS } from './navigation';
import Icon from '../primitives/Icon';
import type { IconName } from '../primitives/Icon';

interface MobileBottomNavProps {
  isMentor: boolean;
}

export default function MobileBottomNav({ isMentor }: MobileBottomNavProps) {
  const pathname = usePathname();
  const NAV = isMentor ? MENTOR_NAV_ITEMS : NAV_ITEMS;

  return (
    <nav
      style={{
        position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 20,
        height: 64,
        display: 'flex',
        alignItems: 'center',
        background: 'rgba(248,249,255,0.92)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderTop: '1px solid var(--border-subtle)',
        paddingBottom: 'env(safe-area-inset-bottom)',
      }}
      className="md:hidden"
    >
      {NAV.map((item) => {
        const active = pathname === item.href || pathname.startsWith(item.href + '/');
        return (
          <Link
            key={item.id}
            href={item.href}
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 3,
              padding: '6px 4px',
              color: active ? 'var(--brand-600)' : 'var(--text-tertiary)',
              textDecoration: 'none',
              transition: 'color 200ms',
            }}
          >
            <Icon name={item.icon as IconName} size={20} strokeWidth={active ? 2 : 1.6} />
            <span style={{ fontSize: 10, fontWeight: active ? 600 : 500, fontFamily: 'Inter, system-ui' }}>
              {item.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
