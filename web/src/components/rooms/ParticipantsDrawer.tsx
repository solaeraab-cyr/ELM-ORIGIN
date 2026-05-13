'use client';

import { useEffect, useState } from 'react';
import { Avatar, Icon, StatusRing } from '@/components/primitives';

export type Participant = {
  id: string;
  name: string;
  host?: boolean;
  studyTime: string;
  status: 'focused' | 'break' | 'away';
  hasPro?: boolean;
};

interface Props {
  onClose: () => void;
  participants: Participant[];
  currentUser?: string;
  onElmTogether?: (p: Participant) => void;
}

export default function ParticipantsDrawer({ onClose, participants, currentUser, onElmTogether }: Props) {
  const [toastId, setToastId] = useState<string | null>(null);
  const [shakeId, setShakeId] = useState<string | null>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  const onTogether = (p: Participant) => {
    if (p.hasPro) {
      setToastId(p.id);
      setTimeout(() => setToastId(null), 3000);
    } else {
      setShakeId(p.id);
      setTimeout(() => { setShakeId(null); onElmTogether?.(p); }, 420);
    }
  };

  return (
    <>
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(7,10,24,0.40)', zIndex: 700 }} />
      <div style={{
        position: 'fixed', top: 0, right: 0, height: '100vh', width: 320, zIndex: 701,
        background: 'var(--bg-surface)',
        borderLeft: '1px solid var(--border-subtle)',
        boxShadow: 'var(--shadow-xl)',
        display: 'flex', flexDirection: 'column',
        animation: 'panelIn 380ms var(--ease-out-expo)',
      }}>
        <div style={{ padding: '18px 20px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontFamily: 'Fraunces, serif', fontSize: 18, fontWeight: 700 }}>Participants</span>
            <span style={{ height: 22, padding: '0 8px', background: 'rgba(79,70,229,0.10)', color: 'var(--brand-600)', borderRadius: 999, fontSize: 11, fontFamily: 'JetBrains Mono, monospace', fontWeight: 700, display: 'inline-flex', alignItems: 'center' }}>{participants.length}</span>
          </div>
          <button onClick={onClose} style={{ width: 28, height: 28, borderRadius: 8, color: 'var(--text-tertiary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icon name="x" size={14} />
          </button>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: 8 }}>
          {participants.map(p => {
            const isYou = p.name === currentUser;
            return (
              <div key={p.id} style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '10px 12px', borderRadius: 10,
                animation: shakeId === p.id ? 'shake 380ms' : 'none',
                position: 'relative',
              }}>
                <StatusRing status={p.status === 'focused' ? 'focus' : p.status === 'break' ? 'break' : 'idle'} size={40}>
                  <Avatar name={p.name} size={36} />
                </StatusRing>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ fontWeight: 600, fontSize: 13, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name}</span>
                    {isYou && <span style={{ fontSize: 9, padding: '1px 6px', background: 'var(--bg-hover)', color: 'var(--text-secondary)', borderRadius: 4, fontWeight: 700 }}>YOU</span>}
                    {p.host && <span style={{ fontSize: 9, padding: '1px 6px', background: 'rgba(245,158,11,0.15)', color: 'var(--amber-600)', borderRadius: 4, fontWeight: 700 }}>HOST</span>}
                  </div>
                  <div style={{ fontSize: 11, fontFamily: 'JetBrains Mono, monospace', color: 'var(--text-tertiary)', marginTop: 2 }}>
                    {p.studyTime} ·{' '}
                    <span style={{ color: p.status === 'focused' ? 'var(--mint-600)' : p.status === 'break' ? 'var(--amber-600)' : 'var(--text-muted)' }}>{p.status}</span>
                  </div>
                </div>
                {!isYou && (
                  <div style={{ position: 'relative' }}>
                    <button
                      onClick={() => onTogether(p)}
                      style={{ height: 28, fontSize: 11, padding: '0 10px', borderRadius: 999, background: 'var(--bg-hover)', border: '1px solid var(--border-subtle)', color: 'var(--text-secondary)', cursor: 'pointer' }}
                    >👤 Together</button>
                    {toastId === p.id && (
                      <div style={{ position: 'absolute', right: 0, top: '110%', whiteSpace: 'nowrap', padding: '6px 10px', background: 'rgba(16,185,129,0.15)', color: 'var(--mint-600)', borderRadius: 8, fontSize: 11, fontWeight: 600, zIndex: 5 }}>
                        Request sent ✓
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
      <style>{`@keyframes panelIn { from { transform: translateX(100%); } to { transform: translateX(0); } } @keyframes shake { 0%,100%{transform:translateX(0)} 25%{transform:translateX(-6px)} 75%{transform:translateX(6px)} }`}</style>
    </>
  );
}
