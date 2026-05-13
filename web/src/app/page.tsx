import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import Landing from '@/components/landing/Landing';

export const dynamic = 'force-dynamic';

export default async function RootPage() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (user) redirect('/home');
  } catch (error) {
    console.error('Auth error:', error);
    // Continue to Landing if auth fails
  }

  return <Landing />;
}
