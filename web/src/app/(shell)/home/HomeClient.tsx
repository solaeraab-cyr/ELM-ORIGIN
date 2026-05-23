'use client';

import { useEffect, useState } from 'react';
import Icon from '@/components/primitives/Icon';
import CreateRoomModal from '@/components/rooms/CreateRoomModal';
import RoomCardView from '@/components/rooms/RoomCardView';
import { type RoomCard } from '@/app/actions/rooms';

const PLAN_ITEMS = [
  { time: '09:00', label: 'Linear Algebra — eigenvectors', done: true, type: 'study' },
  { time: '11:00', label: 'Session with Priya Sharma', done: true, type: 'session', live: true },
  { time: '14:00', label: 'Complete Pomodoro block × 3', done: false, type: 'focus' },
  { time: '17:00', label: 'Review flashcards — Organic Chem', done: false, type: 'review' },
];

interface HomeClientProps {
  publicRooms: RoomCard[];
  myRooms: RoomCard[];
  greetingName: string;
  streak: number;
}

export default function HomeClient({ publicRooms, myRooms, greetingName, streak }: HomeClientProps) {
  const [createOpen, setCreateOpen] = useState(false);
  const [checked, setChecked] = useState<number[]>([0, 1]);

  // Compute the date on the client only — rendering new Date() during SSR and
  // again on hydration produces a text mismatch (server UTC vs browser local
  // can land on different calendar days), which throws React hydration #418.
  const [dateLabel, setDateLabel] = useState('');
  useEffect(() => {
    const now = new Date();
    const dayName = now.toLocaleDateString('en-US', { weekday: 'long' });
    const dateStr = now.toLocaleDateString('en-US', { month: 'long', day: 'numeric' });
    setDateLabel(`${dayName}, ${dateStr}`);
  }, []);

  return (
    <div style={{ padding: '32px 40px', maxWidth: 1120, margin: '0 auto' }}>
      <div style={{ marginBottom: 32, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <p style={{ fontSize: 13, color: 'var(--text-tertiary)', marginBottom: 4, fontFamily: 'Instrument Sans, system-ui', minHeight: 18 }}>{dateLabel}</p>
          <h1 style={{ fontFamily: 'Fraunces, serif', fontSize: 38, fontWeight: 700, letterSpacing: '-0.02em', marginBottom: 4 }}>
            Good afternoon, {greetingName}
          </h1>
          <p style={{ fontSize: 14, color: 'var(--text-secondary)' }}>
            You&apos;re on a <strong style={{ color: 'var(--amber-500)' }}>{streak}-day streak</strong> — keep it going!
          </p>
        </div>
        <button onClick={() => setCreateOpen(true)} style={{ height: 40, padding: '0 18px', borderRadius: 999, background: 'var(--gradient-brand)', color: '#fff', fontSize: 14, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
          <Icon name="plus" size={15} /> Create Room
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 32, alignItems: 'start' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 36 }}>
          {/* Your Rooms */}
          {myRooms.length > 0 && (
            <div>
              <h2 style={{ fontFamily: 'Fraunces, serif', fontSize: 22, fontWeight: 600, marginBottom: 16 }}>Your Rooms</h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
                {myRooms.map(room => <RoomCardView key={room.id} room={room} variant="mine" />)}
              </div>
            </div>
          )}

          {/* Public Rooms */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h2 style={{ fontFamily: 'Fraunces, serif', fontSize: 22, fontWeight: 600 }}>Public Rooms</h2>
              <span style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>{publicRooms.length} active</span>
            </div>
            {publicRooms.length === 0 ? (
              <div style={{ background: 'var(--bg-surface)', border: '1px dashed var(--border-default)', borderRadius: 18, padding: 32, textAlign: 'center' }}>
                <div style={{ fontSize: 28, marginBottom: 8 }}>🌱</div>
                <div style={{ fontFamily: 'Fraunces, serif', fontStyle: 'italic', fontSize: 18, marginBottom: 4 }}>No public rooms active right now</div>
                <div style={{ fontSize: 13, color: 'var(--text-tertiary)' }}>Start one — others will join.</div>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
                {publicRooms.map(room => <RoomCardView key={room.id} room={room} variant="public" />)}
              </div>
            )}
          </div>
        </div>

        {/* Today's plan */}
        <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 18, padding: 22 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
            <h3 style={{ fontFamily: 'Fraunces, serif', fontSize: 18, fontWeight: 600 }}>Today&apos;s plan</h3>
            <Icon name="calendar" size={15} color="var(--text-tertiary)" />
          </div>
          {PLAN_ITEMS.map((item, i) => {
            const isDone = checked.includes(i);
            return (
              <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '12px 0', borderBottom: i < PLAN_ITEMS.length - 1 ? '1px solid var(--border-subtle)' : 'none' }}>
                <button onClick={() => setChecked(c => isDone ? c.filter(x => x !== i) : [...c, i])} style={{
                  width: 20, height: 20, borderRadius: 6, marginTop: 1, flexShrink: 0,
                  border: `2px solid ${isDone ? 'var(--mint-500)' : 'var(--border-default)'}`,
                  background: isDone ? 'var(--mint-500)' : 'transparent',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
                }}>{isDone && <Icon name="check" size={11} color="#fff" />}</button>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                    <span style={{ fontSize: 13, fontWeight: isDone ? 400 : 500, color: isDone ? 'var(--text-tertiary)' : 'var(--text-primary)', textDecoration: isDone ? 'line-through' : 'none' }}>{item.label}</span>
                    {item.live && !isDone && <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 6px', borderRadius: 999, background: 'rgba(239,68,68,0.12)', color: '#ef4444' }}>LIVE</span>}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text-tertiary)', fontFamily: 'JetBrains Mono, monospace' }}>{item.time}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {createOpen && <CreateRoomModal onClose={() => setCreateOpen(false)} />}
    </div>
  );
}
