function passwordStrength(pw: string) {
  if (!pw) return { score: 0, label: '', color: 'var(--bg-hover)' };
  let score = 0;
  if (pw.length >= 8) score++;
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw) && pw.length >= 12) score++;
  const map = [
    { score: 0, label: '',       color: 'var(--bg-hover)'    },
    { score: 1, label: 'Weak',   color: 'var(--danger-500)'  },
    { score: 2, label: 'Fair',   color: 'var(--gold-500)'    },
    { score: 3, label: 'Good',   color: 'var(--mint-500)'    },
    { score: 4, label: 'Strong', color: 'var(--brand-500)'   },
  ];
  return map[score];
}

interface StrengthMeterProps {
  pw: string;
}

export default function StrengthMeter({ pw }: StrengthMeterProps) {
  const { score, label, color } = passwordStrength(pw);
  return (
    <div style={{ marginTop: 8 }}>
      <div style={{ display: 'flex', gap: 4 }}>
        {[1, 2, 3, 4].map((i) => (
          <div key={i} style={{
            flex: 1, height: 3, borderRadius: 999,
            background: i <= score ? (i === 4 && score === 4 ? 'var(--gradient-brand)' : color) : 'var(--bg-hover)',
            transition: 'background 240ms var(--ease-smooth)',
          }} />
        ))}
      </div>
      {label && <div style={{ fontSize: 11, marginTop: 4, color, fontWeight: 600 }}>{label}</div>}
    </div>
  );
}
