'use client';

import { useState } from 'react';
import Link from 'next/link';
import AuthCard from '@/components/auth/AuthCard';
import Field from '@/components/auth/Field';
import Logo from '@/components/auth/Logo';
import { createClient } from '@/lib/supabase/client';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    if (!email) {
      setError('Email is required');
      return;
    }
    setLoading(true);
    try {
      const supabase = createClient();
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      });
      if (resetError) {
        setError(resetError.message);
        return;
      }
      setSuccess('Check your email for a reset link');
      setEmail('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not send reset link');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthCard>
      <div style={{ marginBottom: 24, textAlign: 'center' }}>
        <Logo size={36} />
      </div>

      <h2 style={{ fontFamily: 'Fraunces, serif', fontSize: 28, fontWeight: 700, marginBottom: 6, textAlign: 'center' }}>Reset your password</h2>
      <p style={{ fontSize: 14, color: 'var(--text-tertiary)', marginBottom: 24, textAlign: 'center' }}>Enter your email and we'll send a reset link.</p>

      {error && (
        <div style={{ background: 'var(--danger-100)', border: '1px solid rgba(225,29,72,0.20)', color: 'var(--danger-600)', padding: '12px 14px', borderRadius: 12, fontSize: 13, marginBottom: 18 }}>
          {error}
        </div>
      )}

      {success && (
        <div style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.25)', color: 'var(--success-600, #047857)', padding: '12px 14px', borderRadius: 12, fontSize: 13, marginBottom: 18 }}>
          {success}
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <Field
          icon="mail"
          type="email"
          name="email"
          placeholder="Email address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
        />
        <button type="submit" disabled={loading} style={{
          width: '100%', height: 48, borderRadius: 999,
          background: 'var(--gradient-brand)', color: '#fff',
          fontFamily: 'Inter, system-ui', fontWeight: 600, fontSize: 15,
          boxShadow: '0 6px 18px rgba(27,43,142,0.30)',
          transition: 'all 220ms var(--ease-smooth)',
          marginTop: 4,
          cursor: loading ? 'wait' : 'pointer',
          opacity: loading ? 0.85 : 1,
        }}
          onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateY(-1px)')}
          onMouseLeave={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
        >
          {loading ? 'Sending…' : 'Send reset link'}
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
