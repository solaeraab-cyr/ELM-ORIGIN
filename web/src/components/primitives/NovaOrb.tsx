interface NovaOrbProps {
  size?: number;
  animated?: boolean;
}

export default function NovaOrb({ size = 32, animated = true }: NovaOrbProps) {
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: 999,
        background: 'var(--gradient-ai)',
        position: 'relative',
        boxShadow: '0 0 32px rgba(16,185,129,0.30)',
        animation: animated ? 'novaOrb 14s linear infinite' : 'none',
        flexShrink: 0,
      }}
    >
      <div
        style={{
          position: 'absolute',
          inset: '15%',
          background: 'radial-gradient(circle at 30% 30%, rgba(255,255,255,0.55), transparent 55%)',
          borderRadius: 999,
        }}
      />
    </div>
  );
}
