interface AvatarProps {
  name?: string;
  src?: string | null;
  size?: number;
  tint?: number;
}

export default function Avatar({ name = '?', src, size = 32, tint = 0 }: AvatarProps) {
  const initials = (name || '?')
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  const hues = [265, 220, 195, 160, 30, 320, 285, 210];
  const h = hues[((name || '?').charCodeAt(0) + tint) % hues.length];

  if (src) {
    return (
      <img
        src={src}
        alt={name}
        style={{
          width: size,
          height: size,
          borderRadius: 999,
          objectFit: 'cover',
          flexShrink: 0,
        }}
      />
    );
  }

  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: 999,
        background: `linear-gradient(135deg, oklch(60% 0.18 ${h}), oklch(70% 0.14 ${h + 30}))`,
        color: '#fff',
        fontFamily: 'Inter, system-ui, sans-serif',
        fontWeight: 700,
        fontSize: size * 0.36,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        overflow: 'hidden',
      }}
    >
      {initials}
    </div>
  );
}
