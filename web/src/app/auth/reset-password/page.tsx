'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import AuthCard from '@/components/auth/AuthCard';
import Field from '@/components/auth/Field';
import Logo from '@/components/auth/Logo';
import Icon from '@/components/primitives/Icon';
import { createClient } from '@/lib/supabase/client';

export default function ResetPasswordPage() {
  const router = useRouter();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // If the recovery link arrived as ?code=... (PKCE flow), exchange it for a
  // session so updateUser() works. The browser client's detectSessionInUrl
  // handles the hash variant automatically.
  useEffect(() => {
    const url = new URL(window.location.href);
    const code = url.searchParams.get('code');
    if (!code) return;
    const supabase = createClient();
    supabase.auth.exchangeCodeForSession(code).then(() => {
      url.searchParams.delete('code');
      window.history.replaceState({}, '', url.pathname + (url.search ? `?${url.searchParams}` : ''));
    }).catch(() => {});
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!newPassword || !confirmPassword) {
      setError('Please fill in both password fields');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      const supabase = createClient();
      const { error: updateError } = await supabase.auth.updateUser({ password: newPassword });
      if (updateError) {
        setError(updateError.message);
        return;
      }
      setSuccess('Password updated');
      setTimeout(() => router.push('/login'), 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not update password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthCard>
      <div style={{ marginBottom: 24, textAlign: 'center' }}>
        <Logo size={36} />
      </div>

      <h2 style={{ fontFamily: 'Fraunces, serif', fontSize: 28, fontWeight: 700, marginBottom: 6, textAlign: 'center' }}>Set a new password</h2>
      <p style={{ fontSize: 14, color: 'var(--text-tertiary)', marginBottom: 24, textAlign: 'center' }}>Choose a strong password you haven't used before.</p>

      {error && (
        <div style={{ background: 'var(--danger-100)', border: '1px solid rgba(225,29,72,0.20)', color: 'var(--danger-600)', padding: '12px 14px', borderRadius: 12, fontSize: 13, marginBottom: 18 }}>
          {error}
        </div>
      )}

      {success && (
        <div style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.25)', color: 'var(--success-600, #047857)', padding: '12px 14px', borderRadius: 12, fontSize: 13, marginBottom: 18 }}>
          {success} — redirecting to login…
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <Field
          icon="lock"
          type={showPw ? 'text' : 'password'}
          name="new_password"
          placeholder="New password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          autoComplete="new-password"
          minLength={8}
          rightSlot={
            <button type="button" onClick={() => setShowPw((s) => !s)} style={{ color: 'var(--text-tertiary)', flexShrink: 0 }}>
              <Icon name={showPw ? 'x' : 'check'} size={14} />
            </button>
          }
        />
        <Field
          icon="lock"
          type={showPw ? 'text' : 'password'}
          name="confirm_password"
          placeholder="Confirm new password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          autoComplete="new-password"
          minLength={8}
        />

        <button type="submit" disabled={loading || !!success} style={{
          width: '100%', height: 48, borderRadius: 999,
          background: 'var(--gradient-brand)', color: '#fff',
          fontFamily: 'Inter, system-ui', fontWeight: 600, fontSize: 15,
          boxShadow: '0 6px 18px rgba(27,43,142,0.30)',
          transition: 'all 220ms var(--ease-smooth)',
          marginTop: 4,
          cursor: loading ? 'wait' : 'pointer',
          opacity: loading || success ? 0.85 : 1,
        }}
          onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateY(-1px)')}
          onMouseLeave={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
        >
          {loading ? 'Updating…' : 'Update password'}
        </button>
      </form>
    </AuthCard>
  );
}
