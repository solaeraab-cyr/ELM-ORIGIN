'use client';

import { Suspense, useState, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import AuthCard from '@/components/auth/AuthCard';
import Field from '@/components/auth/Field';
import SocialButton from '@/components/auth/SocialButton';
import Divider from '@/components/auth/Divider';
import Logo from '@/components/auth/Logo';
import Icon from '@/components/primitives/Icon';
import { createClient } from '@/lib/supabase/client';

function LoginForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const errorParamRaw = searchParams.get('error');
  const codeParam = searchParams.get('code');

  // Suppress Supabase's PKCE false-alarm error in the URL. The OAuth callback
  // already established a session via the implicit flow hash; this stale
  // ?error= is from Supabase's server-side PKCE attempt and is not actionable.
  const isPkceFalseAlarm = !!errorParamRaw && /pkce|code verifier/i.test(decodeURIComponent(errorParamRaw));
  const errorParam = isPkceFalseAlarm ? null : errorParamRaw;

  useEffect(() => {
    if (isPkceFalseAlarm) {
      window.history.replaceState({}, '', '/login');
    }
  }, [isPkceFalseAlarm]);

  const [exchanging, setExchanging] = useState(!!codeParam);

  useEffect(() => {
    if (!codeParam) return;
    setExchanging(true);
    const supabase = createClient();
    supabase.auth.exchangeCodeForSession(codeParam).then(({ error }) => {
      if (error) {
        console.error('[LOGIN] exchangeCodeForSession failed', error.message);
        setExchanging(false);
        // PKCE verifier failures are noise — drop the user back on a clean /login.
        if (/pkce|code verifier/i.test(error.message)) {
          router.replace('/login');
        } else {
          router.replace(`/login?error=${encodeURIComponent(error.message)}`);
        }
      } else {
        router.replace('/home');
      }
    });
  }, [codeParam, router]);

  const [role, setRole] = useState<'student' | 'mentor'>('student');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const handleLogin = async () => {
    setFormError(null);
    if (!email || !password) {
      setFormError('Email and password are required');
      return;
    }
    setLoading(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        setFormError(error.message);
        return;
      }
      router.push('/home');
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Sign-in failed');
    } finally {
      setLoading(false);
    }
  };

  if (exchanging) {
    return (
      <AuthCard>
        <div style={{ textAlign: 'center', padding: '48px 0' }}>
          <Logo size={36} />
          <p style={{ marginTop: 24, color: 'var(--text-secondary)', fontSize: 14 }}>Completing sign-in…</p>
        </div>
      </AuthCard>
    );
  }

  return (
    <AuthCard>
      <div style={{ marginBottom: 24, textAlign: 'center' }}>
        <Logo size={36} />
      </div>

      {/* Role toggle */}
      <div style={{ display: 'flex', padding: 4, background: 'var(--bg-subtle)', borderRadius: 999, marginBottom: 26, position: 'relative' }}>
        <div style={{
          position: 'absolute', top: 4, bottom: 4,
          width: 'calc(50% - 4px)',
          left: role === 'student' ? 4 : 'calc(50%)',
          background: 'var(--gradient-brand)', borderRadius: 999,
          transition: 'left 240ms var(--ease-spring)',
          boxShadow: '0 4px 14px rgba(27,43,142,0.30)',
        }}/>
        {(['student', 'mentor'] as const).map((r) => (
          <button key={r} type="button" onClick={() => setRole(r)} style={{
            flex: 1, height: 40, position: 'relative', zIndex: 1,
            color: role === r ? '#fff' : 'var(--text-secondary)',
            fontSize: 13, fontWeight: 600, textTransform: 'capitalize',
            transition: 'color 200ms',
          }}>{r}</button>
        ))}
      </div>

      <h2 style={{ fontFamily: 'Fraunces, serif', fontSize: 28, fontWeight: 700, marginBottom: 6 }}>
        {role === 'mentor' ? 'Mentor portal' : 'Welcome back'}
      </h2>
      <p style={{ fontSize: 14, color: 'var(--text-tertiary)', marginBottom: 24 }}>
        {role === 'mentor' ? 'Sign in to your mentor dashboard.' : 'Pick up where you left off.'}
      </p>

      {(formError || errorParam) && (
        <div style={{ background: 'var(--danger-100)', border: '1px solid rgba(225,29,72,0.20)', color: 'var(--danger-600)', padding: '12px 14px', borderRadius: 12, fontSize: 13, marginBottom: 18 }}>
          {formError ?? decodeURIComponent(errorParam!)}
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <Field
          icon="mail"
          type="email"
          name="email"
          placeholder="Email address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
        />
        <div>
          <Field
            icon="lock"
            type={showPw ? 'text' : 'password'}
            name="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            rightSlot={
              <button type="button" onClick={() => setShowPw((s) => !s)} style={{ color: 'var(--text-tertiary)', flexShrink: 0 }}>
                <Icon name={showPw ? 'x' : 'check'} size={14} />
              </button>
            }
          />
          <div style={{ marginTop: 8, textAlign: 'right' }}>
            <Link href="/forgot-password" style={{ fontSize: 12, color: 'var(--brand-500)', fontWeight: 600 }}>Forgot password?</Link>
          </div>
        </div>

        <button type="button" onClick={handleLogin} style={{
          width: '100%', height: 48, borderRadius: 999,
          background: 'var(--gradient-brand)', color: '#fff',
          fontFamily: 'Inter, system-ui', fontWeight: 600, fontSize: 15,
          boxShadow: '0 6px 18px rgba(27,43,142,0.30)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
          transition: 'all 220ms var(--ease-smooth)',
          marginTop: 8,
          cursor: loading ? 'wait' : 'pointer',
        }}>
          {loading ? 'Signing in…' : <>Log in <Icon name="chevronR" size={14} /></>}
        </button>
      </div>

      <Divider />
      <SocialButton provider="google" />

      <p style={{ fontSize: 13, color: 'var(--text-tertiary)', textAlign: 'center', marginTop: 22 }}>
        New to ELM Origin?{' '}
        <Link href="/signup" style={{ color: 'var(--brand-500)', fontWeight: 600 }}>Create an account</Link>
      </p>
    </AuthCard>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
