/* global React */
const { useState, useEffect, useRef, useMemo, createContext, useContext } = React;

// ═══════════════════════════════════════
// ICONS (inline SVG — minimal, no emoji slop)
// ═══════════════════════════════════════
const Icon = ({ name, size = 20, stroke = 1.75, ...props }) => {
  const s = size;
  const paths = {
    home: <><path d="M3 10.5L12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1v-9.5Z"/></>,
    rooms: <><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 10h18M8 5v14"/></>,
    nova: <><circle cx="12" cy="12" r="4"/><path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6l1.4 1.4M17 17l1.4 1.4M5.6 18.4 7 17M17 7l1.4-1.4"/></>,
    mentors: <><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4.4 3.6-8 8-8s8 3.6 8 8"/></>,
    productivity: <><circle cx="12" cy="13" r="7"/><path d="M12 9v4l2 2M9 2h6M12 2v3"/></>,
    community: <><circle cx="9" cy="10" r="3"/><circle cx="17" cy="8" r="2.5"/><path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6M14 20c0-2.5 1.7-4.5 4-5"/></>,
    sessions: <><rect x="3" y="4" width="18" height="17" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></>,
    bell: <><path d="M18 16v-5a6 6 0 0 0-12 0v5l-2 2h16l-2-2ZM10 21a2 2 0 0 0 4 0"/></>,
    settings: <><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3h.1A1.7 1.7 0 0 0 10 3.1V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8v.1c.3.6.9 1 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1Z"/></>,
    search: <><circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/></>,
    plus: <><path d="M12 5v14M5 12h14"/></>,
    x: <><path d="m18 6-12 12M6 6l12 12"/></>,
    check: <><path d="M5 12l5 5L20 7"/></>,
    chevronR: <><path d="m9 6 6 6-6 6"/></>,
    refresh: <><path d="M3 12a9 9 0 0 1 15-6.7L21 8M21 3v5h-5M21 12a9 9 0 0 1-15 6.7L3 16M3 21v-5h5"/></>,
    chevronL: <><path d="m15 6-6 6 6 6"/></>,
    chevronD: <><path d="m6 9 6 6 6-6"/></>,
    play: <><path d="M7 4v16l13-8L7 4Z" fill="currentColor" stroke="none"/></>,
    pause: <><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></>,
    mic: <><rect x="9" y="3" width="6" height="12" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3"/></>,
    video: <><rect x="3" y="6" width="13" height="12" rx="2"/><path d="m16 10 5-3v10l-5-3"/></>,
    sparkles: <><path d="M12 3v3M12 18v3M4.2 4.2l2.1 2.1M17.7 17.7l2.1 2.1M3 12h3M18 12h3M4.2 19.8l2.1-2.1M17.7 6.3l2.1-2.1"/></>,
    book: <><path d="M4 19V5a2 2 0 0 1 2-2h14v18H6a2 2 0 0 0-2 2M8 7h8M8 11h8"/></>,
    fire: <><path d="M12 2c3 4 6 6 6 11a6 6 0 0 1-12 0c0-2 1-3 2-4 0 2 1 3 2 3 0-4 2-7 2-10Z"/></>,
    star: <><path d="m12 3 2.9 6 6.6.6-5 4.4 1.5 6.5L12 17l-6 3.5 1.5-6.5-5-4.4 6.6-.6L12 3Z"/></>,
    attach: <><path d="m21 12-9 9a6 6 0 0 1-8.5-8.5L13 3a4 4 0 0 1 5.7 5.7L9.4 18a2 2 0 0 1-2.8-2.8L15 7"/></>,
    send: <><path d="m22 2-10 20-3-9-9-3 22-8Z"/></>,
    users: <><circle cx="9" cy="8" r="4"/><circle cx="17" cy="7" r="3"/><path d="M3 21a6 6 0 0 1 12 0M15 21c0-2.5 1.5-4.5 4-5"/></>,
    lock: <><rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/></>,
    calendar: <><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M16 3v4M8 3v4M3 11h18"/></>,
    clock: <><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></>,
    headphones: <><path d="M3 18v-6a9 9 0 0 1 18 0v6M3 18a2 2 0 0 0 2 2h2v-8H5a2 2 0 0 0-2 2M21 18a2 2 0 0 1-2 2h-2v-8h2a2 2 0 0 1 2 2"/></>,
    note: <><path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9l-6-6Z"/><path d="M14 3v6h6"/></>,
    target: <><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.5" fill="currentColor"/></>,
    logout: <><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4M10 17l5-5-5-5M15 12H3"/></>,
    trending: <><path d="M3 17l6-6 4 4 8-8M14 7h7v7"/></>,
    chat: <><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v10Z"/></>,
    leave: <><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/></>,
    verified: <><path d="M12 2 9 5H5v4L2 12l3 3v4h4l3 3 3-3h4v-4l3-3-3-3V5h-4L12 2Z"/><path d="m9 12 2 2 4-4"/></>,
    grid: <><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></>,
    shuffle: <><path d="M16 3h5v5M4 20 21 3M21 16v5h-5M15 15l6 6M4 4l5 5"/></>,
    interviews: <><path d="M8 3v4M16 3v4M4 9h16M6 5h12a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2Z"/><path d="m9 14 2 2 4-4"/></>,
  };
  return (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round" {...props}>
      {paths[name] || null}
    </svg>
  );
};

// Nova orb
const NovaOrb = ({ size = 32 }) => (
  <div className="nova-orb" style={{ width: size, height: size }} />
);

// Avatar (colored gradient, initials)
const Avatar = ({ name = "?", size = 40, tint = 0 }) => {
  const initials = name.split(' ').map(n => n[0]).slice(0,2).join('').toUpperCase();
  const hues = [265, 220, 195, 160, 30, 320, 285, 210];
  const h = hues[(name.charCodeAt(0) + tint) % hues.length];
  return (
    <div className="avatar" style={{
      width: size, height: size, fontSize: size * 0.36,
      background: `linear-gradient(135deg, oklch(60% 0.18 ${h}), oklch(70% 0.14 ${h + 30}))`
    }}>
      {initials}
    </div>
  );
};

// Status ring wrapper
const StatusRing = ({ status = 'focus', size = 48, children }) => {
  const color = status === 'focus' ? 'var(--mint-500)' : status === 'break' ? 'var(--amber-400)' : 'var(--text-tertiary)';
  return (
    <div style={{
      width: size + 8, height: size + 8, borderRadius: 999,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      boxShadow: `inset 0 0 0 2px ${color}`,
    }}>{children}</div>
  );
};

// Progress bar
const Progress = ({ value = 0, max = 100, color = 'var(--gradient-brand)' }) => (
  <div style={{ height: 4, background: 'var(--bg-elevated)', borderRadius: 999, overflow: 'hidden' }}>
    <div style={{ height: '100%', width: `${(value/max)*100}%`, background: color, transition: 'width 400ms var(--ease-out-expo)' }}/>
  </div>
);

// Subject pill with icon glyph (original, not emoji slop — using small shapes)
const SubjectGlyph = ({ subject, size = 14 }) => {
  const map = {
    'Mathematics': { color: 'oklch(70% 0.15 265)', shape: '∫' },
    'Physics': { color: 'oklch(70% 0.13 220)', shape: '∿' },
    'Chemistry': { color: 'oklch(70% 0.14 160)', shape: '⚛' },
    'Biology': { color: 'oklch(70% 0.13 145)', shape: '✿' },
    'Computer Science': { color: 'oklch(70% 0.15 285)', shape: '{}' },
    'Data Science': { color: 'oklch(70% 0.14 30)', shape: '∑' },
    'Writing': { color: 'oklch(70% 0.12 40)', shape: '¶' },
    'History': { color: 'oklch(70% 0.12 60)', shape: '§' },
    'Business': { color: 'oklch(70% 0.13 90)', shape: '◆' },
    'Design': { color: 'oklch(70% 0.14 320)', shape: '◇' },
    'Medicine': { color: 'oklch(70% 0.14 15)', shape: '＋' },
    'Languages': { color: 'oklch(70% 0.13 195)', shape: 'あ' },
  };
  const m = map[subject] || { color: 'var(--brand-400)', shape: '●' };
  return <span style={{ color: m.color, fontFamily: 'JetBrains Mono', fontSize: size, fontWeight: 600 }}>{m.shape}</span>;
};

Object.assign(window, { Icon, NovaOrb, Avatar, StatusRing, Progress, SubjectGlyph });
