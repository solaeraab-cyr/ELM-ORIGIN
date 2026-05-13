'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export type GateVariant =
  | 'elm-together'
  | 'extra-session'
  | 'collab-room'
  | 'nova-limit'
  | 'direct-message'
  | 'friends-quota'
  | 'friends-accept'
  | 'peer-interview-quota'
  | 'group-interview-quota'
  | 'generic';

export type GateContextValues = Record<string, string | number>;

type GateDef = {
  icon: string;
  headline: string;
  desc: string;
  free: string;
  pro: string;
};

export const GATE_VARIANTS: Record<GateVariant, GateDef> = {
  'elm-together': {
    icon: '👥',
    headline: 'Study with this person',
    desc: 'Elm Together pairs you with someone studying right now — you focus side-by-side without the awkward.',
    free: 'Free: solo focus only',
    pro: 'Pro: pair-focus with anyone in any room',
  },
  'extra-session': {
    icon: '⏱',
    headline: "You've hit your monthly limit",
    desc: 'Free includes 2 mentor sessions per month. Upgrade for unlimited bookings and faster matching.',
    free: 'Free: 2 sessions per month',
    pro: 'Pro: unlimited sessions + priority booking',
  },
  'collab-room': {
    icon: '🔗',
    headline: "You've hit today's collaborative room limit",
    desc: '{plan} plan allows {quota} collaborative rooms per day. Upgrade to Pro for 5/day, or Elite for unlimited.',
    free: '{plan}: {quota} collaborative rooms / day',
    pro: 'Pro: 5 / day  ·  Elite: unlimited',
  },
  'peer-interview-quota': {
    icon: '✨',
    headline: "You've done today's peer interview",
    desc: '{plan} plan allows {quota} peer interview per day. Upgrade to Pro for 3/day, or Elite for unlimited practice.',
    free: '{plan}: {quota} peer interview / day',
    pro: 'Pro: 3 / day  ·  Elite: unlimited',
  },
  'group-interview-quota': {
    icon: '👥',
    headline: "You've started today's group interview",
    desc: '{plan} plan allows {quota} group interview per day. Upgrade to Pro for 3/day, or Elite for unlimited.',
    free: '{plan}: {quota} group interview / day',
    pro: 'Pro: 3 / day  ·  Elite: unlimited',
  },
  'nova-limit': {
    icon: '✨',
    headline: "You've used today's Nova messages",
    desc: 'Free gets 20 Nova messages per day. Upgrade for unlimited tutoring across every subject.',
    free: 'Free: 20 messages/day',
    pro: 'Pro: unlimited Nova + voice mode + image analysis',
  },
  'direct-message': {
    icon: '💬',
    headline: 'Message your mentor anytime',
    desc: 'DM your mentor between sessions for quick questions. Free users can only message during bookings.',
    free: 'Free: in-session chat only',
    pro: 'Pro: 24/7 mentor DMs',
  },
  'friends-quota': {
    icon: '🤝',
    headline: "You've hit your friend quota",
    desc: 'Free includes 10 study friends. Upgrade for unlimited connections across the platform.',
    free: 'Free: 10 friends',
    pro: 'Pro: unlimited friends',
  },
  'friends-accept': {
    icon: '🤝',
    headline: 'Accept this request?',
    desc: 'Pro users can accept any number of friend requests without limits.',
    free: 'Free: 10 active friends',
    pro: 'Pro: unlimited friends',
  },
  generic: {
    icon: '⭐',
    headline: 'This feature is part of Pro',
    desc: 'Unlock the full ELM Origin experience — better focus tools, more mentors, and zero limits.',
    free: 'Free: core features',
    pro: 'Pro: everything unlocked',
  },
};

interface GateModalProps {
  variant?: GateVariant;
  context?: GateContextValues;
  onClose: () => void;
}

export default function GateModal({ variant = 'generic', context, onClose }: GateModalProps) {
  const router = useRouter();
  const [shake, setShake] = useState(false);
  const raw = GATE_VARIANTS[variant] || GATE_VARIANTS.generic;
  const interpolate = (str: string) => {
    if (!context) return str;
    return Object.entries(context).reduce((s, [k, val]) => s.split('{' + k + '}').join(String(val)), str);
  };
  const v = {
    icon: raw.icon,
    headline: interpolate(raw.headline),
    desc: interpolate(raw.desc),
    free: interpolate(raw.free),
    pro: interpolate(raw.pro),
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') doClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  const doClose = () => {
    setShake(true);
    setTimeout(() => onClose(), 320);
  };

  return (
    <div
      onClick={doClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 600,
        background: 'rgba(7,10,24,0.70)', backdropFilter: 'blur(8px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24,
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          width: 440, padding: 40, borderRadius: 24,
          background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)',
          boxShadow: 'var(--shadow-xl)', textAlign: 'center',
          animation: shake ? 'shake 320ms' : 'modalIn 350ms var(--ease-out-expo)',
        }}
      >
        <div style={{
          width: 56, height: 56, borderRadius: 16, margin: '0 auto 20px',
          background: 'linear-gradient(135deg, rgba(13,23,87,0.12), rgba(61,82,204,0.12))',
          color: 'var(--brand-600)', fontSize: 26,
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        }}>{v.icon}</div>
        <h2 style={{ fontFamily: 'Fraunces, serif', fontSize: 24, fontWeight: 700, fontStyle: 'italic', marginBottom: 10, lineHeight: 1.2 }}>
          {v.headline}
        </h2>
        <p style={{ fontFamily: 'Instrument Sans, system-ui', fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.55, marginBottom: 22 }}>
          {v.desc}
        </p>
        <div style={{ background: 'var(--bg-base)', border: '1px solid var(--border-subtle)', borderRadius: 12, padding: '12px 16px', marginBottom: 20, textAlign: 'left' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: 'var(--text-tertiary)', marginBottom: 6 }}>
            <span style={{ color: 'var(--text-muted)', fontFamily: 'JetBrains Mono, monospace', fontWeight: 700 }}>✗</span> {v.free}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: 'var(--text-primary)', fontWeight: 600 }}>
            <span style={{ color: 'var(--mint-500)', fontFamily: 'JetBrains Mono, monospace', fontWeight: 700 }}>✓</span> {v.pro}
          </div>
        </div>
        <div style={{ fontSize: 11, color: 'var(--text-tertiary)', marginBottom: 16 }}>
          Joined by <strong style={{ color: 'var(--text-primary)' }}>8,400+ Pro students</strong> this week
        </div>
        <button
          onClick={() => { onClose(); router.push('/pricing'); }}
          style={{
            width: '100%', height: 48, borderRadius: 999,
            background: 'var(--gradient-brand)', color: '#fff',
            fontFamily: 'Inter, system-ui', fontWeight: 600, fontSize: 15,
            marginBottom: 8, boxShadow: '0 6px 18px rgba(27,43,142,0.30)',
          }}
        >
          Upgrade to Pro — ₹499/mo
        </button>
        <button
          onClick={doClose}
          style={{
            width: '100%', height: 36, color: 'var(--text-tertiary)',
            fontSize: 13, fontWeight: 500, background: 'transparent',
          }}
        >
          Maybe later
        </button>
        <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 14, fontFamily: 'JetBrains Mono, monospace' }}>
          7-day trial · No card required · Cancel anytime
        </div>
      </div>
    </div>
  );
}
