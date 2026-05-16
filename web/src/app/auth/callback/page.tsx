'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export default function AuthCallbackPage() {
  const router = useRouter();

  useEffect(() => {
    const supabase = createClient();

    const finish = async () => {
      const url = new URL(window.location.href);
      const errorDescription =
        url.searchParams.get('error_description') || url.searchParams.get('error');

      if (errorDescription) {
        router.replace(`/login?error=${encodeURIComponent(errorDescription)}`);
        return;
      }

      // Implicit flow: tokens are in the URL fragment. The browser client
      // with detectSessionInUrl auto-consumes them, so just wait for session.
      // PKCE fallback: ?code= present — try to exchange it (may fail without verifier).
      const code = url.searchParams.get('code');
      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        if (error) {
          router.replace(`/login?error=${encodeURIComponent(error.message)}`);
          return;
        }
      } else {
        // Give Supabase a tick to consume the URL hash.
        await new Promise((r) => setTimeout(r, 100));
      }

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.replace('/login?error=Sign-in%20failed');
        return;
      }

      // Best-effort profile upsert (ignored if it fails — trigger covers new users).
      const user = session.user;
      await supabase.from('profiles').upsert(
        {
          id: user.id,
          email: user.email ?? '',
          full_name:
            user.user_metadata?.full_name ??
            user.user_metadata?.name ??
            user.email?.split('@')[0] ??
            '',
          avatar_url: user.user_metadata?.avatar_url ?? null,
          plan: 'Free',
        },
        { onConflict: 'id', ignoreDuplicates: true }
      );

      router.replace('/home');
    };

    finish();
  }, [router]);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>Completing sign-in…</p>
    </div>
  );
}
