'use client';

import { Suspense, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { resetPassword } from '../actions';
import AuthCard from '@/components/auth/AuthCard';
import Field from '@/components/auth/Field';
import Logo from '@/components/auth/Logo';

function ForgotPasswordForm() {
  const searchParams = useSearchParams();
  const errorParam = searchParams.get('error');
  const [email, setEmail] = useState('');

  return (
    <AuthCard>
      <div style={{ marginBottom: 24, textAlign: 'center' }}>
        <Logo size={36} />
      </div>

      <h2 style={{ fontFamily: 'Fraunces, serif', fontSize: 28, fontWeight: 700, marginBottom: 6, textAlign: 'center' }}>Reset your password</h2>
      <p style={{ fontSize: 14, color: 'var(--text-tertiary)', marginBottom: 24, textAlign: 'center' }}>Enter your email and we'll send a reset link.</p>

      {errorParam && (
        <div style={{ background: 'var(--danger-100)', border: '1px solid rgba(225,29,72,0.20)', color: 'var(--danger-600)', padding: '12px 14px', borderRadius: 12, fontSize: 13, marginBottom: 18 }}>
          {decodeURIComponent(errorParam)}
        </div>
      )}

      <form action={resetPassword} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <Field
          icon="mail"
          type="email"
          name="email"
          placeholder="Email address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
        />
        <button type="submit" style={{
          width: '100%', height: 48, borderRadius: 999,
          background: 'var(--gradient-brand)', color: '#fff',
          fontFamily: 'Inter, system-ui', fontWeight: 600, fontSize: 15,
          boxShadow: '0 6px 18px rgba(27,43,142,0.30)',
          transition: 'all 220ms var(--ease-smooth)',
          marginTop: 4,
        }}
          onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateY(-1px)')}
          onMouseLeave={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
        >
          Send reset link
        </button>
      </form>

      <div style={{ marginTop: 16 }}>
        <Link href="/login" style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4,
          width: '100%', height: 44, borderRadius: 999,
          background: 'var(--bg-surface)', border: '1px solid var(--border-default)',
          color: 'var(--text-primary)', fontFamily: 'Inter, system-ui', fontWeight: 500, fontSize: 14,
          textDecoration: 'none', transition: 'all 200ms',
        }}
          onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--bg-hover)'; e.currentTarget.style.borderColor = 'var(--border-strong)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--bg-surface)'; e.currentTarget.style.borderColor = 'var(--border-default)'; }}
        >← Back to login</Link>
      </div>
    </AuthCard>
  );
}

export default function ForgotPasswordPage() {
  return (
    <Suspense>
      <ForgotPasswordForm />
    </Suspense>
  );
}
