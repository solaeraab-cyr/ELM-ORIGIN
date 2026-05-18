'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export default function AuthCallback() {
  const router = useRouter();

  useEffect(() => {
    const supabase = createClient();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) {
        supabase
          .from('profiles')
          .upsert(
            {
              id: session.user.id,
              email: session.user.email ?? '',
              full_name:
                (session.user.user_metadata?.full_name as string | undefined) ||
                (session.user.user_metadata?.name as string | undefined) ||
                '',
              role: 'student',
              plan: 'Free',
              is_mentor: false,
            },
            { onConflict: 'id' }
          )
          .then(() => {
            router.push('/home');
          });
      }
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        router.push('/home');
      }
    });

    const timeout = setTimeout(() => {
      router.push('/login');
    }, 5000);

    return () => {
      subscription.unsubscribe();
      clearTimeout(timeout);
    };
  }, [router]);

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#0F172A' }}>
      <div style={{ textAlign: 'center', color: 'white' }}>
        <div style={{ width: 40, height: 40, border: '3px solid #2563EB', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 16px' }} />
        <p style={{ fontSize: 16 }}>Completing sign-in...</p>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  );
}
