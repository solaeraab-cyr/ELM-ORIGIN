'use client';

import { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import AuthCard from '@/components/auth/AuthCard';
import Field from '@/components/auth/Field';
import SocialButton from '@/components/auth/SocialButton';
import Divider from '@/components/auth/Divider';
import StrengthMeter from '@/components/auth/StrengthMeter';
import Logo from '@/components/auth/Logo';
import Icon from '@/components/primitives/Icon';
import { createClient } from '@/lib/supabase/client';

function SignupForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const errorParamRaw = searchParams.get('error');
  const isPkceFalseAlarm = !!errorParamRaw && /pkce|code verifier/i.test(decodeURIComponent(errorParamRaw));
  const errorParam = isPkceFalseAlarm ? null : errorParamRaw;

  useEffect(() => {
    if (isPkceFalseAlarm) {
      window.history.replaceState({}, '', '/signup');
    }
  }, [isPkceFalseAlarm]);

  const [role, setRole] = useState<'student' | 'mentor'>('student');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [emailValid, setEmailValid] = useState<boolean | null>(null);
  const [emailErr, setEmailErr] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const validateEmail = (e: React.FocusEvent<HTMLInputElement>) => {
    const v = e.target.value;
    const ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
    setEmailErr(v && !ok ? 'Enter a valid email' : '');
    setEmailValid(v && ok ? true : null);
  };

  const handleContinue = async () => {
    setFormError(null);
    if (!email || !password) {
      setFormError('Email and password are required');
      return;
    }
    setLoading(true);
    try {
      const supabase = createClient();
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: fullName, role, is_mentor: role === 'mentor' } },
      });

      if (error) {
        const msg = error.message || '';
        if (/disabled/i.test(msg)) {
          setFormError('Please enable email signups in the Supabase dashboard (Authentication → Providers → Email).');
        } else {
          setFormError(msg);
        }
        setLoading(false);
        return;
      }

      // Case (e): user is created AND a session was issued (email confirmation off)
      if (data.user && data.session) {
        await supabase.from('profiles').upsert(
          {
            id: data.user.id,
            email,
            full_name: fullName || email.split('@')[0],
            role,
            is_mentor: role === 'mentor',
            plan: 'Free',
          },
          { onConflict: 'id', ignoreDuplicates: false }
        );
        fetch('/api/email/send', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            to: email,
            template: 'welcome',
            data: { userName: fullName || email.split('@')[0], email },
          }),
        }).catch(() => {});
        router.push('/home');
        return;
      }

      // Case (f): user created but no session — confirmation required.
      // Try to sign in directly in case confirmation is actually off but session
      // just wasn't returned with signUp.
      if (data.user && !data.session) {
        const { data: signInData, error: signInErr } = await supabase.auth.signInWithPassword({ email, password });
        if (!signInErr && signInData.user) {
          await supabase.from('profiles').upsert(
            {
              id: signInData.user.id,
              email,
              full_name: fullName || email.split('@')[0],
              role,
              is_mentor: role === 'mentor',
              plan: 'Free',
            },
            { onConflict: 'id', ignoreDuplicates: false }
          );
          router.push('/home');
          return;
        }
        router.push('/check-email');
        return;
      }

      setFormError('Sign-up did not complete. Please try again.');
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Sign-up failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthCard>
      <div style={{ marginBottom: 24 }}>
        <Logo size={32} />
      </div>

      <h2 style={{ fontFamily: 'Fraunces, serif', fontSize: 30, fontWeight: 700, marginBottom: 8 }}>Create your account</h2>
      <p style={{ fontSize: 14, color: 'var(--text-tertiary)', marginBottom: 24 }}>Join thousands of students learning together.</p>

      {/* Role toggle */}
      <div style={{ display: 'flex', padding: 4, background: 'var(--bg-subtle)', borderRadius: 999, marginBottom: 22, position: 'relative' }}>
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
            flex: 1, height: 36, position: 'relative', zIndex: 1,
            color: role === r ? '#fff' : 'var(--text-secondary)',
            fontSize: 13, fontWeight: 600, textTransform: 'capitalize',
            transition: 'color 200ms',
          }}>{r}</button>
        ))}
      </div>

      {(formError || errorParam) && (
        <div style={{ background: 'var(--danger-100)', border: '1px solid rgba(225,29,72,0.20)', color: 'var(--danger-600)', padding: '12px 14px', borderRadius: 12, fontSize: 13, marginBottom: 18 }}>
          {formError ?? decodeURIComponent(errorParam!)}
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 4 }}>
        <SocialButton provider="google" />
      </div>
      <Divider />

      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <Field
          icon="user"
          name="full_name"
          placeholder="Full name"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          autoComplete="name"
        />
        <Field
          icon="mail"
          type="email"
          name="email"
          placeholder="Email address"
          value={email}
          onChange={(e) => { setEmail(e.target.value); setEmailErr(''); setEmailValid(null); }}
          onBlur={validateEmail}
          valid={emailValid === true}
          error={emailErr}
          autoComplete="email"
        />
        <div>
          <Field
            icon="lock"
            type={showPw ? 'text' : 'password'}
            name="password"
            placeholder="Password (min 8 characters)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="new-password"
            minLength={8}
            rightSlot={
              <button type="button" onClick={() => setShowPw((s) => !s)} style={{ color: 'var(--text-tertiary)', flexShrink: 0 }}>
                <Icon name={showPw ? 'x' : 'check'} size={14} />
              </button>
            }
          />
          <StrengthMeter pw={password} />
        </div>

        <button type="button" onClick={handleContinue} style={{
          width: '100%', height: 48, borderRadius: 999,
          background: 'var(--gradient-brand)', color: '#fff',
          fontFamily: 'Inter, system-ui', fontWeight: 600, fontSize: 15,
          boxShadow: '0 6px 18px rgba(27,43,142,0.30)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
          transition: 'all 220ms var(--ease-smooth)',
          marginTop: 8,
          cursor: loading ? 'wait' : 'pointer',
        }}>
          {loading ? 'Creating account…' : <>Continue as {role} <Icon name="chevronR" size={14} /></>}
        </button>
      </div>

      <p style={{ fontSize: 11, color: 'var(--text-muted)', textAlign: 'center', marginTop: 14, lineHeight: 1.5 }}>
        By continuing, you agree to our{' '}
        <Link href="/legal/terms" style={{ color: 'var(--brand-500)' }}>Terms</Link> and{' '}
        <Link href="/legal/privacy" style={{ color: 'var(--brand-500)' }}>Privacy Policy</Link>.
      </p>
      <p style={{ fontSize: 13, color: 'var(--text-tertiary)', textAlign: 'center', marginTop: 18 }}>
        Already have an account?{' '}
        <Link href="/login" style={{ color: 'var(--brand-500)', fontWeight: 600 }}>Log in</Link>
      </p>
    </AuthCard>
  );
}

export default function SignupPage() {
  return (
    <Suspense>
      <SignupForm />
    </Suspense>
  );
}
