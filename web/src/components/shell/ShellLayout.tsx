import { redirect } from 'next/navigation';
import type { ReactNode } from 'react';
import { createClient } from '@/lib/supabase/server';
import Sidebar from './Sidebar';
import TopBar from './TopBar';
import MobileBottomNav from './MobileBottomNav';

interface ShellLayoutProps {
  children: ReactNode;
}

export default async function ShellLayout({ children }: ShellLayoutProps) {
  const supabase = await createClient();

  const { data: { user }, error: userError } = await supabase.auth.getUser();
  console.log('[SHELL_LAYOUT]', { hasUser: !!user, userId: user?.id, userError: userError?.message });
  if (!user) redirect('/login');

  const [{ data: profile }, { count: pendingCount }] = await Promise.all([
    supabase.from('profiles').select('full_name, handle, plan, is_mentor, streak').eq('id', user.id).single(),
    supabase.from('friends').select('*', { count: 'exact', head: true }).eq('receiver_id', user.id).eq('status', 'pending'),
  ]);

  const safeProfile = {
    id: user.id,
    full_name: profile?.full_name ?? null,
    handle: profile?.handle ?? null,
    plan: profile?.plan ?? 'Free',
    is_mentor: profile?.is_mentor ?? false,
    streak: profile?.streak ?? 0,
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-base)' }}>
      <Sidebar isMentor={safeProfile.is_mentor} user={safeProfile} pendingFriendRequests={pendingCount ?? 0} />

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, overflow: 'hidden' }}>
        <TopBar user={safeProfile} />
        <main style={{ flex: 1, overflowY: 'auto', paddingBottom: 80 }}>
          {children}
        </main>
      </div>

      <MobileBottomNav isMentor={safeProfile.is_mentor} pendingFriendRequests={pendingCount ?? 0} />
    </div>
  );
}
