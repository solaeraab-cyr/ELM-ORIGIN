import type { ReactNode } from 'react';

interface AuthCardProps {
  children: ReactNode;
  maxW?: number;
}

export default function AuthCard({ children, maxW = 480 }: AuthCardProps) {
  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--bg-base)',
      backgroundImage: 'radial-gradient(ellipse 900px 500px at 90% -5%, rgba(27,43,142,0.06) 0%, transparent 60%), radial-gradient(ellipse 600px 400px at 0% 100%, rgba(245,158,11,0.04) 0%, transparent 60%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px 20px',
      overflowY: 'auto',
    }}>
      <div
        className="modal-in"
        style={{
          width: '100%',
          maxWidth: maxW,
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 28,
          padding: 48,
          boxShadow: 'var(--shadow-xl)',
        }}
      >
        {children}
      </div>
    </div>
  );
}
