import type { ReactNode } from 'react';

type Status = 'focus' | 'break' | 'idle';

interface StatusRingProps {
  status?: Status;
  size?: number;
  children?: ReactNode;
}

export default function StatusRing({ status = 'focus', size = 48, children }: StatusRingProps) {
  const color =
    status === 'focus'
      ? 'var(--mint-500)'
      : status === 'break'
      ? 'var(--amber-400)'
      : 'var(--text-tertiary)';

  return (
    <div
      style={{
        width: size + 8,
        height: size + 8,
        borderRadius: 999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: `inset 0 0 0 2px ${color}`,
      }}
    >
      {children}
    </div>
  );
}
