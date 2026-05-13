type ProgressVariant = 'brand' | 'mint' | 'amber';

interface ProgressProps {
  value: number;
  max?: number;
  variant?: ProgressVariant;
}

const variantColors: Record<ProgressVariant, string> = {
  brand: 'var(--gradient-brand)',
  mint: 'var(--mint-500)',
  amber: 'var(--gold-500)',
};

export default function Progress({ value, max = 100, variant = 'brand' }: ProgressProps) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100));
  return (
    <div
      style={{
        height: 4,
        background: 'var(--bg-elevated)',
        borderRadius: 999,
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          height: '100%',
          width: `${pct}%`,
          background: variantColors[variant],
          transition: 'width 400ms var(--ease-out-expo)',
        }}
      />
    </div>
  );
}
