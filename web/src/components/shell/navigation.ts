export const NAV_ITEMS = [
  { id: 'home',         label: 'Home',         icon: 'home',         href: '/home' },
  { id: 'mentors',      label: 'Mentors',      icon: 'mentors',      href: '/mentors' },
  { id: 'interviews',   label: 'Interviews',   icon: 'interviews',   href: '/interviews' },
  { id: 'productivity', label: 'Productivity', icon: 'productivity', href: '/productivity' },
  { id: 'community',    label: 'Community',    icon: 'community',    href: '/community' },
  { id: 'friends',      label: 'Friends',      icon: 'users',        href: '/friends' },
] as const;

export const MENTOR_NAV_ITEMS = [
  { id: 'mentor-dashboard',    label: 'Dashboard',    icon: 'home',      href: '/mentor/dashboard' },
  { id: 'mentor-bookings',     label: 'Bookings',     icon: 'sessions',  href: '/mentor/bookings' },
  { id: 'mentor-availability', label: 'Availability', icon: 'calendar',  href: '/mentor/availability' },
  { id: 'mentor-earnings',     label: 'Earnings',     icon: 'trending',  href: '/mentor/earnings' },
  { id: 'mentor-reviews',      label: 'Reviews',      icon: 'star',      href: '/mentor/reviews' },
  { id: 'mentor-settings',     label: 'Settings',     icon: 'settings',  href: '/mentor/settings' },
] as const;

export type NavItem = (typeof NAV_ITEMS)[number] | (typeof MENTOR_NAV_ITEMS)[number];
