'use client';

import { useState } from 'react';
import Link from 'next/link';
import Icon from '@/components/primitives/Icon';
import CreateRoomModal from '@/components/rooms/CreateRoomModal';

export type RoomRow = {
  id: string;
  topic: string;
  subject: string | null;
  mode: 'focus' | 'discussion' | 'collab' | 'group-interview' | string;
  max_participants: number;
  pomodoro: string | null;
  host: { full_name: string | null } | null;
};

const SUBJECT_COLORS: Record<string, string> = {
  Mathematics: 'var(--brand-500)',
  'Computer Science': 'var(--mint-600)',
  Physics: 'var(--amber-500)',
  Chemistry: '#e879f9',
  Writing: '#f43f5e',
  Biology: '#10b981',
};

const PLAN_ITEMS = [
  { time: '09:00', label: 'Linear Algebra — eigenvectors', done: true, type: 'study' },
  { time: '11:00', label: 'Session with Priya Sharma', done: true, type: 'session', live: true },
  { time: '14:00', label: 'Complete Pomodoro block × 3', done: false, type: 'focus' },
  { time: '17:00', label: 'Review flashcards — Organic Chem', done: false, type: 'review' },
];

const FILTERS = ['All', 'Mathematics', 'Computer Science', 'Physics', 'Chemistry', 'Writing'];

function RoomCard({ room }: { room: RoomRow }) {
  const subject = room.subject || 'Study';
  const color = SUBJECT_COLORS[subject] || 'var(--brand-500)';
  const HUES = [250, 280, 310];
  const hostName = room.host?.full_name || 'Host';
  return (
    <Link
      href={`/room/${room.id}`}
      style={{
        background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)',
        borderRadius: 18, padding: 20, display: 'flex', flexDirection: 'column', gap: 14,
        transition: 'all 200ms var(--ease-smooth)', cursor: 'pointer',
        textDecoration: 'none', color: 'inherit',
      }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--border-strong)'; e.currentTarget.style.boxShadow = 'var(--shadow-md)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-subtle)'; e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'translateY(0)'; }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <span style={{ fontSize: 11, fontWeight: 700, color, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{subject}</span>
        <span style={{ fontSize: 11, color: 'var(--text-tertiary)', fontFamily: 'JetBrains Mono, monospace' }}>{room.pomodoro || '25/5'}</span>
      </div>
      <div>
        <div style={{ fontFamily: 'Fraunces, serif', fontWeight: 600, fontSize: 16, color: 'var(--text-primary)', lineHeight: 1.3, marginBottom: 4 }}>{room.topic}</div>
        <div style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>Host: {hostName}</div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <div style={{ display: 'flex' }}>
            {[0, 1, 2].map(i => (
              <div key={i} style={{ width: 24, height: 24, borderRadius: 999, background: `oklch(55% 0.18 ${HUES[i]})`, border: '2px solid var(--bg-surface)', marginLeft: i > 0 ? -8 : 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, color: '#fff', fontWeight: 700 }}>
                {String.fromCharCode(65 + i)}
              </div>
            ))}
          </div>
          <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>/{room.max_participants}</span>
          <span style={{ fontSize: 10, fontWeight: 600, padding: '2px 7px', borderRadius: 999, background: 'rgba(16,185,129,0.10)', color: 'var(--mint-600)' }}>Live</span>
        </div>
        <span style={{ height: 32, padding: '0 14px', borderRadius: 999, background: 'var(--gradient-brand)', color: '#fff', fontSize: 12, fontWeight: 600, display: 'inline-flex', alignItems: 'center' }}>Join</span>
      </div>
    </Link>
  );
}

interface HomeClientProps {
  rooms: RoomRow[];
  greetingName: string;
  streak: number;
}

export default function HomeClient({ rooms, greetingName, streak }: HomeClientProps) {
  const [filter, setFilter] = useState('All');
  const [checked, setChecked] = useState<number[]>([0, 1]);
  const [createOpen, setCreateOpen] = useState(false);

  const now = new Date();
  const dayName = now.toLocaleDateString('en-US', { weekday: 'long' });
  const dateStr = now.toLocaleDateString('en-US', { month: 'long', day: 'numeric' });
  const filteredRooms = filter === 'All' ? rooms : rooms.filter(r => r.subject === filter);

  return (
    <div style={{ padding: '32px 40px', maxWidth: 1120, margin: '0 auto' }}>
      <div style={{ marginBottom: 32 }}>
        <p style={{ fontSize: 13, color: 'var(--text-tertiary)', marginBottom: 4, fontFamily: 'Instrument Sans, system-ui' }}>{dayName}, {dateStr}</p>
        <h1 style={{ fontFamily: 'Fraunces, serif', fontSize: 38, fontWeight: 700, letterSpacing: '-0.02em', marginBottom: 4 }}>
          Good afternoon, {greetingName} 👋
        </h1>
        <p style={{ fontSize: 14, color: 'var(--text-secondary)' }}>
          You&apos;re on a <strong style={{ color: 'var(--amber-500)' }}>{streak}-day streak</strong> — keep it going!
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 36 }}>
        {[
          { label: 'Focus today', value: '2h 18m', icon: 'focus' as const, color: 'var(--brand-500)' },
          { label: 'This week',   value: '14h',    icon: 'trending' as const, color: 'var(--mint-600)' },
          { label: 'Sessions',    value: '12',     icon: 'sessions' as const, color: 'var(--amber-500)' },
          { label: 'Streak',      value: `${streak}d 🔥`, icon: 'star' as const, color: '#f43f5e' },
        ].map(stat => (
          <div key={stat.label} style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 16, padding: '18px 20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
              <div style={{ width: 28, height: 28, borderRadius: 8, background: `${stat.color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon name={stat.icon} size={14} color={stat.color} />
              </div>
              <span style={{ fontSize: 12, color: 'var(--text-tertiary)', fontWeight: 500 }}>{stat.label}</span>
            </div>
            <div style={{ fontFamily: 'Fraunces, serif', fontSize: 26, fontWeight: 700 }}>{stat.value}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 32, alignItems: 'start' }}>
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h2 style={{ fontFamily: 'Fraunces, serif', fontSize: 22, fontWeight: 600 }}>Live Study Rooms</h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>{rooms.length} active</span>
              <button onClick={() => setCreateOpen(true)} style={{ height: 34, padding: '0 14px', borderRadius: 999, background: 'var(--gradient-brand)', color: '#fff', fontSize: 13, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
                <Icon name="plus" size={14} /> Create room
              </button>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 20 }}>
            {FILTERS.map(f => (
              <button key={f} onClick={() => setFilter(f)} style={{
                height: 32, padding: '0 14px', borderRadius: 999,
                background: filter === f ? 'var(--text-primary)' : 'var(--bg-surface)',
                color: filter === f ? '#fff' : 'var(--text-secondary)',
                border: `1px solid ${filter === f ? 'var(--text-primary)' : 'var(--border-subtle)'}`,
                fontSize: 13, fontWeight: 500, cursor: 'pointer',
              }}>{f}</button>
            ))}
          </div>
          {filteredRooms.length === 0 ? (
            <div style={{ background: 'var(--bg-surface)', border: '1px dashed var(--border-default)', borderRadius: 18, padding: 32, textAlign: 'center' }}>
              <div style={{ fontSize: 28, marginBottom: 8 }}>🌱</div>
              <div style={{ fontFamily: 'Fraunces, serif', fontStyle: 'italic', fontSize: 18, marginBottom: 4 }}>No rooms active right now</div>
              <div style={{ fontSize: 13, color: 'var(--text-tertiary)' }}>Start one — others will join.</div>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
              {filteredRooms.map(room => <RoomCard key={room.id} room={room} />)}
            </div>
          )}
        </div>

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
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer',
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
