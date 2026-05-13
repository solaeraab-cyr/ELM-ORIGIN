import Link from 'next/link';
import AuthCard from '@/components/auth/AuthCard';
import Logo from '@/components/auth/Logo';

export default async function CheckEmailPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string }>;
}) {
  const { type } = await searchParams;
  const isReset = type === 'reset';

  return (
    <AuthCard>
      <div style={{ textAlign: 'center', animation: 'fadeInUp 500ms var(--ease-spring)' }}>
        <div style={{ marginBottom: 20, display: 'flex', justifyContent: 'center' }}>
          <Logo size={28} />
        </div>
        <div style={{
          width: 80, height: 80, borderRadius: 999,
          background: 'var(--gradient-brand)',
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          marginBottom: 20, color: '#fff',
          boxShadow: '0 12px 36px rgba(27,43,142,0.30)',
        }}>
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
            <polyline points="22,6 12,13 2,6"/>
          </svg>
        </div>
        <h2 style={{ fontFamily: 'Fraunces, serif', fontStyle: 'italic', fontSize: 26, fontWeight: 700, marginBottom: 8 }}>Check your inbox</h2>
        <p style={{ fontSize: 14, color: 'var(--text-tertiary)', marginBottom: 28, lineHeight: 1.55 }}>
          {isReset
            ? "We sent a password reset link. Follow the instructions in the email."
            : "We sent a confirmation link. Click it to activate your account."}
        </p>
        <Link href="/login" style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          height: 44, borderRadius: 999,
          background: 'var(--bg-surface)', border: '1px solid var(--border-default)',
          color: 'var(--text-primary)', fontFamily: 'Inter, system-ui', fontWeight: 500, fontSize: 14,
          textDecoration: 'none',
        }}>← Back to login</Link>
      </div>
    </AuthCard>
  );
}
