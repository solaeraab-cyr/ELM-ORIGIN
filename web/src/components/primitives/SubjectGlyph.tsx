type Subject =
  | 'Mathematics'
  | 'Physics'
  | 'Chemistry'
  | 'Biology'
  | 'Computer Science'
  | 'Data Science'
  | 'Writing'
  | 'History'
  | 'Business'
  | 'Design'
  | 'Medicine'
  | 'Languages'
  | string;

interface SubjectGlyphProps {
  subject: Subject;
  size?: number;
}

const subjectMap: Record<string, { color: string; shape: string }> = {
  Mathematics: { color: 'oklch(70% 0.15 265)', shape: '∫' },
  Physics: { color: 'oklch(70% 0.13 220)', shape: '∿' },
  Chemistry: { color: 'oklch(70% 0.14 160)', shape: '⚛' },
  Biology: { color: 'oklch(70% 0.13 145)', shape: '✿' },
  'Computer Science': { color: 'oklch(70% 0.15 285)', shape: '{}' },
  'Data Science': { color: 'oklch(70% 0.14 30)', shape: '∑' },
  Writing: { color: 'oklch(70% 0.12 40)', shape: '¶' },
  History: { color: 'oklch(70% 0.12 60)', shape: '§' },
  Business: { color: 'oklch(70% 0.13 90)', shape: '◆' },
  Design: { color: 'oklch(70% 0.14 320)', shape: '◇' },
  Medicine: { color: 'oklch(70% 0.14 15)', shape: '＋' },
  Languages: { color: 'oklch(70% 0.13 195)', shape: 'あ' },
};

export default function SubjectGlyph({ subject, size = 14 }: SubjectGlyphProps) {
  const m = subjectMap[subject] ?? { color: 'var(--brand-400)', shape: '●' };
  return (
    <span
      style={{
        color: m.color,
        fontFamily: 'JetBrains Mono, monospace',
        fontSize: size,
        fontWeight: 600,
      }}
    >
      {m.shape}
    </span>
  );
}
