export type NotifType = 'session' | 'community' | 'system' | 'booking_request' | 'booking_accepted' | 'booking_declined' | 'booking_cancelled' | 'friend_request' | string;

export type Notification = {
  id: string;
  type: NotifType;
  title: string;
  description: string | null;
  read: boolean;
  created_at: string;
  data?: Record<string, unknown>;
};

export const TYPE_COLORS: Record<string, { bg: string; fg: string; icon: string }> = {
  session:          { bg: 'rgba(79,70,229,0.10)',  fg: 'var(--brand-500)', icon: 'calendar' },
  booking_request:  { bg: 'rgba(245,158,11,0.10)', fg: 'var(--amber-600)', icon: 'calendar' },
  booking_accepted: { bg: 'rgba(16,185,129,0.10)', fg: 'var(--mint-600)',  icon: 'check' },
  booking_declined: { bg: 'rgba(239,68,68,0.10)',  fg: '#ef4444',           icon: 'x' },
  booking_cancelled:{ bg: 'rgba(239,68,68,0.10)',  fg: '#ef4444',           icon: 'x' },
  community:        { bg: 'rgba(16,185,129,0.10)', fg: 'var(--mint-600)',  icon: 'mentors' },
  friend_request:   { bg: 'rgba(16,185,129,0.10)', fg: 'var(--mint-600)',  icon: 'mentors' },
  system:           { bg: 'rgba(245,158,11,0.10)', fg: 'var(--amber-600)', icon: 'sparkles' },
};

export const ROUTE_FOR_NOTIF = (n: Notification) => {
  if (n.type.startsWith('booking')) return '/my-sessions';
  if (n.type === 'session') return '/my-sessions';
  if (n.type === 'friend_request') return '/community';
  if (n.type === 'community') return '/community';
  if (n.title.toLowerCase().includes('badge')) return '/profile';
  if (n.title.toLowerCase().includes('report')) return '/productivity';
  return '/home';
};

export const timeAgo = (iso: string): string => {
  const diff = Date.now() - new Date(iso).getTime();
  const s = Math.floor(diff / 1000);
  if (s < 60) return `${s}s ago`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return `${d}d ago`;
};
