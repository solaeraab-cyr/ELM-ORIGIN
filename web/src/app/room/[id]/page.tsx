'use client';

import { useEffect, useRef, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { Avatar, Icon } from '@/components/primitives';
import ParticipantsDrawer, { type Participant } from '@/components/rooms/ParticipantsDrawer';
import LiveRoomChat from '@/components/rooms/LiveRoomChat';
import { useGate } from '@/components/gate/GateContext';
import { useRealtimePresence } from '@/hooks/useRealtimeSubscription';
import { createClient } from '@/lib/supabase/client';
import dynamic from 'next/dynamic';
import { useVideoRoom } from '@/components/video/useVideoRoom';

const VideoRoom = dynamic(() => import('@/components/video/VideoRoom'), { ssr: false });

const fmt = (s: number) => {
  const m = Math.floor(s / 60), sec = s % 60;
  return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
};
const fmtLong = (s: number) =>
  `${String(Math.floor(s / 3600)).padStart(2, '0')}:${String(Math.floor((s % 3600) / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

function MediaButton({ icon, active, danger, onClick }: { icon: string; active?: boolean; danger?: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{
        width: 42, height: 42, borderRadius: 12, fontSize: 16,
        background: active ? 'var(--gradient-brand)' : (danger ? 'rgba(239,68,68,0.12)' : 'var(--bg-base)'),
        color: active ? '#fff' : (danger ? '#ef4444' : 'var(--text-secondary)'),
        border: '1px solid ' + (active ? 'transparent' : (danger ? 'rgba(239,68,68,0.25)' : 'var(--border-default)')),
        transition: 'all 180ms', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
      }}
    >{icon}</button>
  );
}

type PresenceMeta = { user_id: string; name: string };

function FocusRoom({ roomId, isInterview }: { roomId: string; isInterview: boolean }) {
  const router = useRouter();
  const { openGate } = useGate();
  const [isMuted, setIsMuted] = useState(false);
  const [isCameraOff, setIsCameraOff] = useState(true);
  const [isSharing, setIsSharing] = useState(false);
  const [showAmbient, setShowAmbient] = useState(false);
  const [ambient, setAmbient] = useState<string | null>(null);
  const [showGoal, setShowGoal] = useState(false);
  const [goal, setGoal] = useState('');
  const [showNotes, setShowNotes] = useState(false);
  const [notes, setNotes] = useState('');
  const [drawer, setDrawer] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [leave, setLeave] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [livePresence, setLivePresence] = useState<PresenceMeta[]>([]);
  const [me, setMe] = useState<{ id: string; name: string } | null>(null);
  const video = useVideoRoom(roomId, me?.name ?? 'Anon');

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) return;
      const { data: p } = await supabase.from('profiles').select('full_name').eq('id', user.id).single();
      setMe({ id: user.id, name: (p?.full_name as string | null) || 'Anon' });
    });
  }, []);

  useRealtimePresence<PresenceMeta>({
    channelName: `room:${roomId}`,
    meta: me ? { user_id: me.id, name: me.name } : { user_id: 'anon', name: 'Anon' },
    enabled: !!me,
    onSync: (state) => {
      const list: PresenceMeta[] = [];
      for (const v of Object.values(state)) for (const p of v) list.push(p as unknown as PresenceMeta);
      setLivePresence(list);
    },
  });

  useEffect(() => {
    const t = setInterval(() => setSeconds(s => s + 1), 1000);
    return () => clearInterval(t);
  }, []);

  const room = {
    name: roomId.startsWith('mentor-') ? '1-on-1 Mentor Session' : 'Study Room',
    subject: 'Study',
    mode: 'discussion' as const,
    pomodoro: '25/5',
    type: isInterview ? 'interview' : 'public',
  };

  const participants: Participant[] = [
    { id: 'p1', name: 'Arjun Patel', studyTime: fmt(seconds), status: 'focused', hasPro: true },
    { id: 'p2', name: 'Priya Singh', host: true, studyTime: '01:42:18', status: 'focused', hasPro: false },
    { id: 'p3', name: 'Rohan Mehta', studyTime: '00:58:04', status: 'break', hasPro: true },
    { id: 'p4', name: 'Sara Kapoor', studyTime: '00:31:22', status: 'focused', hasPro: false },
    { id: 'p5', name: 'Vikram Joshi', studyTime: '02:11:45', status: 'away', hasPro: false },
  ];

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 200, background: 'var(--bg-base)', display: 'flex', flexDirection: 'column' }}>
      {/* Top bar */}
      <div style={{ height: 56, padding: '0 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--bg-surface)', borderBottom: '1px solid var(--border-subtle)' }}>
        <button onClick={() => setLeave(true)} style={{ height: 32, padding: '0 12px', borderRadius: 8, background: 'transparent', color: 'var(--text-secondary)', fontSize: 13, fontWeight: 500, display: 'flex', alignItems: 'center', gap: 4 }}>
          <Icon name="chevronL" size={13} /> Leave
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1, justifyContent: 'center' }}>
          <span style={{ fontFamily: 'Fraunces, serif', fontSize: 16, fontWeight: 700 }}>{room.name}</span>
          <span style={{ padding: '3px 10px', borderRadius: 999, background: 'rgba(79,70,229,0.10)', color: 'var(--brand-600)', fontSize: 11, fontWeight: 600 }}>{room.subject}</span>
          <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 12, color: 'var(--text-tertiary)' }}>· {Math.max(participants.length, livePresence.length)} in room</span>
        </div>
        <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 14, fontWeight: 600, color: 'var(--brand-600)' }}>{fmt(seconds)}</div>
      </div>

      {/* Body */}
      <div style={{ flex: 1, padding: 24, overflow: 'auto' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 280px', gap: 20 }}>
          <div style={{
            background: 'var(--bg-surface)', borderRadius: 20, border: '1px solid var(--border-subtle)',
            padding: 32, minHeight: 360, display: 'flex', flexDirection: 'column',
          }}>
            <div style={{ fontSize: 11, fontFamily: 'JetBrains Mono, monospace', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>
              💬 Discussion · Pomodoro {room.pomodoro}
            </div>
            <div style={{ fontFamily: 'Fraunces, serif', fontSize: 28, fontWeight: 600, marginBottom: 8 }}>
              {goal ? `Today: ${goal}` : 'Set a goal to anchor your session'}
            </div>
            <p style={{ fontSize: 14, color: 'var(--text-tertiary)', lineHeight: 1.6, marginBottom: 24 }}>
              You&apos;re in a room with {participants.length - 1} others. Webcam stays off by default — turn it on if you want presence.
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 8, marginTop: 'auto' }}>
              {participants.slice(0, 4).map(p => (
                <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: 10, background: 'var(--bg-base)', borderRadius: 12, border: '1px solid var(--border-subtle)' }}>
                  <Avatar name={p.name} size={32} />
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div style={{ fontSize: 12, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name}</div>
                    <div style={{ fontSize: 10, fontFamily: 'JetBrains Mono, monospace', color: 'var(--mint-600)' }}>● focused {p.studyTime}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 16, padding: 18 }}>
            <div style={{ fontFamily: 'Fraunces, serif', fontSize: 14, fontWeight: 700, marginBottom: 12 }}>Pomodoro</div>
            <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 36, fontWeight: 600, color: 'var(--brand-600)', textAlign: 'center', padding: '14px 0' }}>
              {fmt(Math.max(0, 25 * 60 - seconds))}
            </div>
            <div style={{ height: 4, borderRadius: 999, background: 'var(--bg-hover)', overflow: 'hidden', marginBottom: 14 }}>
              <div style={{ height: '100%', width: `${Math.min(100, (seconds / (25 * 60)) * 100)}%`, background: 'var(--gradient-brand)' }} />
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-tertiary)', marginBottom: 14, textAlign: 'center' }}>Focus → 5 min break</div>
            <div style={{ fontFamily: 'Fraunces, serif', fontSize: 13, fontWeight: 700, marginTop: 18, marginBottom: 8 }}>Now playing</div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{ambient ?? 'No ambient sound'}</div>
          </div>
        </div>
      </div>

      {/* Notes panel */}
      {showNotes && (
        <div onClick={() => setShowNotes(false)} style={{ position: 'fixed', inset: 0, zIndex: 750, background: 'rgba(7,10,24,0.30)' }}>
          <div onClick={e => e.stopPropagation()} style={{
            position: 'absolute', right: 0, top: 0, height: '100vh', width: 360,
            background: 'var(--bg-surface)', borderLeft: '1px solid var(--border-subtle)', padding: 20,
          }}>
            <div style={{ fontFamily: 'Fraunces, serif', fontSize: 18, fontWeight: 700, marginBottom: 14 }}>Session notes</div>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Jot anything you want to keep…"
              style={{ width: '100%', height: 'calc(100vh - 120px)', padding: 14, border: '1px solid var(--border-default)', borderRadius: 12, fontSize: 13, lineHeight: 1.6, resize: 'none', outline: 'none', background: 'var(--bg-base)' }}
            />
          </div>
        </div>
      )}

      {/* Bottom controls */}
      <div style={{
        minHeight: 56, padding: '8px 16px',
        background: 'var(--bg-surface)', borderTop: '1px solid var(--border-subtle)',
        display: 'grid', gridTemplateColumns: '1fr auto 1fr', alignItems: 'center', gap: 8, flexWrap: 'wrap',
      }}>
        <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative' }}>
            <button onClick={() => setShowAmbient(!showAmbient)} style={{ height: 36, padding: '0 12px', borderRadius: 8, background: 'transparent', fontSize: 13, fontWeight: 500, color: 'var(--text-secondary)' }}>🎵 Ambient</button>
            {showAmbient && (
              <div style={{ position: 'absolute', bottom: '110%', left: 0, padding: 6, background: 'var(--bg-surface)', border: '1px solid var(--border-default)', borderRadius: 12, boxShadow: 'var(--shadow-lg)', display: 'flex', gap: 4, zIndex: 100 }}>
                {[
                  { e: '☕', l: 'Cafe' }, { e: '🌧', l: 'Rain' }, { e: '🌿', l: 'Forest' },
                  { e: '🎹', l: 'Piano' }, { e: '🎵', l: 'Lo-fi' }, { e: '✕', l: 'Off' },
                ].map(a => (
                  <button
                    key={a.l}
                    onClick={() => { setAmbient(a.l === 'Off' ? null : a.l); setShowAmbient(false); }}
                    title={a.l}
                    style={{ width: 36, height: 36, borderRadius: 10, fontSize: 16, background: ambient === a.l ? 'rgba(79,70,229,0.10)' : 'transparent' }}
                  >{a.e}</button>
                ))}
              </div>
            )}
          </div>
          <button onClick={() => setShowNotes(true)} style={{ height: 36, padding: '0 12px', borderRadius: 8, background: 'transparent', fontSize: 13, fontWeight: 500, color: 'var(--text-secondary)' }}>📝 Notes</button>
          <div style={{ position: 'relative' }}>
            <button onClick={() => setShowGoal(!showGoal)} style={{ height: 36, padding: '0 12px', borderRadius: 8, background: 'transparent', fontSize: 13, fontWeight: 500, color: 'var(--text-secondary)' }}>🎯 Goal</button>
            {showGoal && (
              <div style={{ position: 'absolute', bottom: '110%', left: 0, padding: 12, background: 'var(--bg-surface)', border: '1px solid var(--border-default)', borderRadius: 12, boxShadow: 'var(--shadow-lg)', width: 280, zIndex: 100 }}>
                <input
                  autoFocus
                  value={goal}
                  onChange={e => setGoal(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') setShowGoal(false); }}
                  placeholder="What will you finish today?"
                  style={{ width: '100%', height: 40, padding: '0 14px', background: 'var(--bg-base)', border: '1px solid var(--border-default)', borderRadius: 10, fontSize: 13, color: 'var(--text-primary)', outline: 'none' }}
                />
              </div>
            )}
          </div>
        </div>

        <div style={{ display: 'flex', gap: 8 }}>
          <MediaButton onClick={() => setIsMuted(!isMuted)} icon={isMuted ? '🔇' : '🎙'} active={!isMuted} danger={isMuted} />
          <MediaButton onClick={() => setIsCameraOff(!isCameraOff)} icon="📷" active={!isCameraOff} danger={isCameraOff} />
          <button
            onClick={() => setIsSharing(!isSharing)}
            style={{
              height: 42, padding: '0 14px', borderRadius: 12, fontSize: 13, fontWeight: 600,
              background: isSharing ? 'var(--gradient-brand)' : 'var(--bg-base)',
              color: isSharing ? '#fff' : 'var(--text-secondary)',
              border: '1px solid ' + (isSharing ? 'transparent' : 'var(--border-default)'),
            }}
          >🖥 {isSharing ? 'Sharing' : 'Share'}</button>
          <button
            onClick={video.joinVideo}
            disabled={video.loading}
            title={!process.env.NEXT_PUBLIC_LIVEKIT_URL ? 'Video calling coming soon' : 'Join video call'}
            style={{
              height: 42, padding: '0 14px', borderRadius: 12, fontSize: 13, fontWeight: 600,
              background: video.open ? 'var(--gradient-brand)' : 'var(--bg-base)',
              color: video.open ? '#fff' : 'var(--text-secondary)',
              border: '1px solid ' + (video.open ? 'transparent' : 'var(--border-default)'),
              opacity: video.loading ? 0.6 : 1,
            }}
          >🎥 {video.loading ? '…' : 'Video'}</button>
        </div>

        <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end', alignItems: 'center', flexWrap: 'wrap' }}>
          <button onClick={() => setChatOpen(true)} style={{ height: 36, padding: '0 12px', borderRadius: 8, background: 'transparent', fontSize: 13, fontWeight: 500, color: 'var(--text-secondary)' }}>💬 Chat</button>
          <button onClick={() => setDrawer(true)} style={{ height: 36, padding: '0 12px', borderRadius: 8, background: 'transparent', fontSize: 13, fontWeight: 500, color: 'var(--text-secondary)' }}>👥 Participants</button>
          <button onClick={() => setLeave(true)} style={{ height: 36, padding: '0 12px', borderRadius: 8, background: 'transparent', fontSize: 13, fontWeight: 500, color: '#ef4444' }}>→ Leave</button>
        </div>
      </div>

      {drawer && (
        <ParticipantsDrawer
          onClose={() => setDrawer(false)}
          participants={participants}
          currentUser="Arjun Patel"
          onElmTogether={() => openGate('elm-together')}
        />
      )}

      {chatOpen && (
        <LiveRoomChat roomId={roomId} currentUserId={me?.id} onClose={() => setChatOpen(false)} />
      )}

      {video.open && (
        <VideoRoom
          roomName={roomId}
          userName={me?.name ?? 'Anon'}
          token={video.token}
          onLeave={video.leaveVideo}
        />
      )}

      {leave && (
        <div onClick={() => setLeave(false)} style={{ position: 'fixed', inset: 0, zIndex: 800, background: 'rgba(7,10,24,0.55)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
          <div onClick={e => e.stopPropagation()} style={{
            width: 460, maxWidth: '100%', padding: 32, background: 'var(--bg-surface)', borderRadius: 20,
            border: '1px solid var(--border-subtle)', boxShadow: 'var(--shadow-xl)',
          }}>
            <div style={{ fontFamily: 'Fraunces, serif', fontStyle: 'italic', fontSize: 22, fontWeight: 700, marginBottom: 16 }}>Leave this session?</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, padding: 14, background: 'var(--bg-base)', borderRadius: 12, marginBottom: 18 }}>
              <div>
                <div style={{ fontSize: 10, color: 'var(--text-tertiary)' }}>Focused</div>
                <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 18, fontWeight: 700 }}>{fmt(seconds)}</div>
              </div>
              <div>
                <div style={{ fontSize: 10, color: 'var(--text-tertiary)' }}>Pomodoros</div>
                <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 18, fontWeight: 700 }}>{Math.floor(seconds / (25 * 60))}</div>
              </div>
              <div>
                <div style={{ fontSize: 10, color: 'var(--text-tertiary)' }}>XP earned</div>
                <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 18, fontWeight: 700, color: 'var(--mint-600)' }}>+{Math.floor(seconds / 30)}</div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={() => setLeave(false)} style={{ flex: 1, height: 44, padding: '0 18px', borderRadius: 999, background: 'var(--bg-hover)', border: '1px solid var(--border-default)', fontSize: 14, fontWeight: 500 }}>Stay in room</button>
              <button onClick={() => router.push('/home')} style={{ flex: 1, height: 44, padding: '0 18px', borderRadius: 999, background: 'var(--gradient-brand)', color: '#fff', fontSize: 14, fontWeight: 600 }}>Leave & see summary</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function GroupInterviewRoom({ roomId }: { roomId: string }) {
  const router = useRouter();
  const [turn, setTurn] = useState(1);
  const [countdown, setCountdown] = useState(5 * 60);
  const [ratings, setRatings] = useState({ comm: 0, tech: 0, conf: 0 });
  const [feedbackNotes, setFeedbackNotes] = useState('');
  const [savedSet, setSavedSet] = useState<Set<number>>(new Set());
  const [drawer, setDrawer] = useState(false);
  const [ended, setEnded] = useState(false);
  const [askEnd, setAskEnd] = useState(false);
  const [elapsed, setElapsed] = useState(0);

  const speakers = [
    { id: 1, name: 'Arjun Patel' },
    { id: 2, name: 'Priya Singh' },
    { id: 3, name: 'Rohan Mehta' },
    { id: 4, name: 'Sara Kapoor' },
    { id: 5, name: 'Vikram Joshi' },
  ];

  useEffect(() => {
    const t = setInterval(() => {
      setCountdown(c => Math.max(0, c - 1));
      setElapsed(e => e + 1);
    }, 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => { setCountdown(5 * 60); }, [turn]);

  const next = () => {
    if (turn >= speakers.length) { setAskEnd(true); return; }
    setSavedSet(s => new Set([...s, turn]));
    setRatings({ comm: 0, tech: 0, conf: 0 });
    setFeedbackNotes('');
    setTurn(t => t + 1);
  };

  const cdColor = countdown < 10 ? '#ef4444' : countdown < 30 ? 'var(--amber-500)' : 'var(--text-primary)';

  if (ended) {
    return (
      <div style={{ position: 'fixed', inset: 0, zIndex: 200, background: 'var(--bg-base)', overflow: 'auto', padding: 40 }}>
        <div style={{ maxWidth: 720, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', padding: '40px 0 30px' }}>
            <div style={{ width: 64, height: 64, borderRadius: 999, background: 'var(--gradient-brand)', color: '#fff', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: 18 }}>
              <Icon name="check" size={30} />
            </div>
            <h1 style={{ fontFamily: 'Fraunces, serif', fontStyle: 'italic', fontSize: 36, fontWeight: 800, marginBottom: 8 }}>Interview complete ✓</h1>
            <p style={{ color: 'var(--text-tertiary)' }}>{speakers.length} participants · {fmtLong(elapsed)} elapsed</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 14, marginBottom: 32 }}>
            {speakers.map(s => (
              <div key={s.id} style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 16, padding: 18, display: 'flex', alignItems: 'center', gap: 12 }}>
                <Avatar name={s.name} size={48} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: 14 }}>{s.name}</div>
                  <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 12, color: 'var(--amber-600)' }}>★ {(3.8 + s.id * 0.1).toFixed(1)}</div>
                  <div style={{ fontSize: 11, color: 'var(--mint-600)', marginTop: 2 }}>Feedback saved ✓</div>
                </div>
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button style={{ flex: 1, height: 48, padding: '0 18px', borderRadius: 999, background: 'var(--bg-hover)', border: '1px solid var(--border-default)', fontSize: 14, fontWeight: 500 }}>View full feedback report</button>
            <button onClick={() => router.push('/home')} style={{ flex: 1, height: 48, padding: '0 18px', borderRadius: 999, background: 'var(--gradient-brand)', color: '#fff', fontSize: 14, fontWeight: 600 }}>Return to dashboard</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 200, background: 'var(--bg-base)', display: 'flex', flexDirection: 'column' }}>
      <div style={{ height: 48, padding: '0 20px', background: 'var(--bg-surface)', borderBottom: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
        <span style={{ fontFamily: 'Fraunces, serif', fontSize: 14, fontWeight: 700 }}>Mock Interview · {roomId}</span>
        <span style={{ height: 22, padding: '0 8px', background: 'linear-gradient(135deg, rgba(245,158,11,0.18), rgba(245,158,11,0.08))', color: 'var(--amber-600)', borderRadius: 999, fontSize: 10, fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 4 }}>🎤 GROUP INTERVIEW</span>
        <div style={{ flex: 1 }} />
        <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 12, color: 'var(--text-tertiary)' }}>{fmtLong(elapsed)} · {speakers.length} participants</span>
      </div>

      <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '200px 1fr 240px', gap: 12, padding: 16, overflow: 'hidden' }}>
        <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 14, padding: 14, overflowY: 'auto' }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>Turn order</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {speakers.map((s, i) => {
              const isDone = savedSet.has(s.id);
              const isCur = s.id === turn;
              return (
                <div key={s.id} style={{
                  display: 'flex', alignItems: 'center', gap: 8, padding: '8px 10px',
                  background: isCur ? 'var(--gradient-brand)' : (isDone ? 'var(--bg-base)' : 'var(--bg-surface)'),
                  color: isCur ? '#fff' : (isDone ? 'var(--text-tertiary)' : 'var(--text-primary)'),
                  border: '1px solid ' + (isCur ? 'transparent' : 'var(--border-subtle)'),
                  borderRadius: 10, fontSize: 12, fontWeight: 600,
                  opacity: isDone ? 0.55 : 1,
                }}>
                  <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10 }}>{i + 1}</span>
                  <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.name}</span>
                  {isDone && <Icon name="check" size={12} />}
                </div>
              );
            })}
          </div>
        </div>

        <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 16, padding: 24, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{ width: 280, height: 280, borderRadius: 24, background: 'var(--bg-base)', border: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
            <div style={{ position: 'absolute', inset: -4, borderRadius: 26, background: 'var(--gradient-brand)', filter: 'blur(8px)', opacity: 0.35 }} />
            <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <Avatar name={speakers.find(s => s.id === turn)?.name || 'A'} size={96} />
              <div style={{ fontFamily: 'Fraunces, serif', fontSize: 22, fontWeight: 600, marginTop: 14 }}>
                {speakers.find(s => s.id === turn)?.name}
              </div>
              <div style={{ fontSize: 11, color: 'var(--mint-600)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginTop: 4 }}>● Speaking</div>
            </div>
          </div>
          <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 56, fontWeight: 700, color: cdColor, marginTop: 24 }}>
            {fmt(countdown)}
          </div>
        </div>

        <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 14, padding: 16, overflowY: 'auto' }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12 }}>Feedback for current speaker</div>
          {[
            { k: 'comm' as const, l: 'Communication' },
            { k: 'tech' as const, l: 'Technical depth' },
            { k: 'conf' as const, l: 'Confidence' },
          ].map(r => (
            <div key={r.k} style={{ marginBottom: 10 }}>
              <div style={{ fontSize: 11, fontWeight: 600, marginBottom: 4 }}>{r.l}</div>
              <div style={{ display: 'flex', gap: 4 }}>
                {[1, 2, 3, 4, 5].map(n => (
                  <button key={n} onClick={() => setRatings({ ...ratings, [r.k]: n })} style={{ fontSize: 16, color: ratings[r.k] >= n ? 'var(--amber-500)' : 'var(--text-muted)' }}>★</button>
                ))}
              </div>
            </div>
          ))}
          <textarea
            value={feedbackNotes}
            onChange={e => setFeedbackNotes(e.target.value)}
            placeholder="Strengths, areas to improve…"
            style={{ width: '100%', height: 90, padding: 10, border: '1px solid var(--border-default)', borderRadius: 10, fontSize: 12, resize: 'none', outline: 'none', background: 'var(--bg-base)', marginBottom: 10 }}
          />
          <div style={{ display: 'flex', gap: 6 }}>
            <button onClick={() => setSavedSet(s => new Set([...s, turn]))} style={{ flex: 1, height: 32, padding: '0 12px', borderRadius: 999, background: 'var(--bg-hover)', border: '1px solid var(--border-subtle)', fontSize: 12, fontWeight: 500 }}>Save</button>
            <button onClick={next} style={{ flex: 1, height: 32, padding: '0 12px', borderRadius: 999, background: 'var(--bg-hover)', border: '1px solid var(--border-subtle)', fontSize: 12, fontWeight: 500 }}>Skip →</button>
          </div>
        </div>
      </div>

      <div style={{ minHeight: 56, padding: '8px 16px', background: 'var(--bg-surface)', borderTop: '1px solid var(--border-subtle)', display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: 8, alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: 6 }}>
          <button style={{ height: 36, padding: '0 12px', borderRadius: 8, background: 'transparent', fontSize: 13, fontWeight: 500, color: 'var(--text-secondary)' }}>🎙 Mute</button>
          <button style={{ height: 36, padding: '0 12px', borderRadius: 8, background: 'transparent', fontSize: 13, fontWeight: 500, color: 'var(--text-secondary)' }}>📷 Camera</button>
        </div>
        <button onClick={next} style={{ height: 40, padding: '0 20px', borderRadius: 999, background: 'var(--gradient-brand)', color: '#fff', fontSize: 14, fontWeight: 600 }}>→ Next Speaker</button>
        <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
          <button onClick={() => setDrawer(true)} style={{ height: 36, padding: '0 12px', borderRadius: 8, background: 'transparent', fontSize: 13, fontWeight: 500, color: 'var(--text-secondary)' }}>👥 Participants</button>
          <button onClick={() => setAskEnd(true)} style={{ height: 36, padding: '0 12px', borderRadius: 8, background: 'transparent', fontSize: 13, fontWeight: 500, color: '#ef4444' }}>→ Leave</button>
        </div>
      </div>

      {drawer && (
        <ParticipantsDrawer
          onClose={() => setDrawer(false)}
          participants={speakers.map((s, i) => ({
            id: String(s.id), name: s.name, host: i === 0,
            studyTime: fmtLong(Math.max(0, elapsed - i * 60)),
            status: i === turn - 1 ? 'focused' : (savedSet.has(s.id) ? 'break' : 'focused'),
            hasPro: i % 2 === 0,
          }))}
          currentUser="Arjun Patel"
        />
      )}

      {askEnd && (
        <div onClick={() => setAskEnd(false)} style={{ position: 'fixed', inset: 0, zIndex: 800, background: 'rgba(7,10,24,0.55)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
          <div onClick={e => e.stopPropagation()} style={{ width: 420, maxWidth: '100%', padding: 28, background: 'var(--bg-surface)', borderRadius: 18, boxShadow: 'var(--shadow-xl)' }}>
            <div style={{ fontFamily: 'Fraunces, serif', fontStyle: 'italic', fontSize: 20, fontWeight: 700, marginBottom: 8 }}>End the session?</div>
            <p style={{ fontSize: 13, color: 'var(--text-tertiary)', marginBottom: 18 }}>Everyone will see the summary and feedback report.</p>
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={() => setAskEnd(false)} style={{ flex: 1, height: 40, padding: '0 14px', borderRadius: 999, background: 'var(--bg-hover)', border: '1px solid var(--border-default)', fontSize: 13, fontWeight: 500 }}>Cancel</button>
              <button onClick={() => { setAskEnd(false); setEnded(true); }} style={{ flex: 1, height: 40, padding: '0 14px', borderRadius: 999, background: 'var(--gradient-brand)', color: '#fff', fontSize: 13, fontWeight: 600 }}>End session</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function RoomPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const isInterview = id.startsWith('gi-') || id.startsWith('interview-');
  return isInterview ? <GroupInterviewRoom roomId={id} /> : <FocusRoom roomId={id} isInterview={false} />;
}
