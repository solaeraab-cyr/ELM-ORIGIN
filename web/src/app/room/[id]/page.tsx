'use client';

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { Avatar, Icon } from '@/components/primitives';
import ParticipantsDrawer from '@/components/rooms/ParticipantsDrawer';
import { createClient } from '@/lib/supabase/client';
import dynamic from 'next/dynamic';
import { useVideoRoom } from '@/components/video/useVideoRoom';
import { getRoomDetail, joinRoom, leaveRoom, type RoomDetail } from '@/app/actions/rooms';
import { useRealtimeBroadcast } from '@/hooks/useRealtimeSubscription';
import { toast } from '@/lib/toast';

const VideoRoom = dynamic(() => import('@/components/video/VideoRoom'), { ssr: false });

const fmt = (s: number) => {
  const m = Math.floor(s / 60), sec = s % 60;
  return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
};
const fmtLong = (s: number) =>
  `${String(Math.floor(s / 3600)).padStart(2, '0')}:${String(Math.floor((s % 3600) / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;


// ════════════════════════════════════════════════════════════════════════════
// FOCUS / STUDY / COLLABORATION ROOM
// Thin wrapper: load me + room metadata, mint a LiveKit token, mount VideoRoom.
// All in-room UX (Pomodoro, Goal, Ambient, Notes, Chat, Live Board, controls,
// participant tiles) lives inside VideoRoom as toggle panels — there is no
// separate study shell any more.
// ════════════════════════════════════════════════════════════════════════════
function FocusRoom({ roomId }: { roomId: string }) {
  const router = useRouter();
  const [me, setMe] = useState<{ id: string; name: string } | null>(null);
  const [detail, setDetail] = useState<RoomDetail | null>(null);
  const video = useVideoRoom(roomId, me?.name ?? 'Anon', me?.id);
  const isDbRoom = /^[0-9a-f]{8}-[0-9a-f]{4}-/i.test(roomId);

  // Load current user identity (id + display name).
  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) return;
      const { data: p } = await supabase.from('profiles').select('full_name').eq('id', user.id).single();
      setMe({ id: user.id, name: (p?.full_name as string | null) || 'Anon' });
    });
  }, []);

  // Load the real DB room + best-effort join.
  useEffect(() => {
    if (!isDbRoom) return;
    let cancelled = false;
    getRoomDetail(roomId).then(d => {
      if (cancelled || !d) return;
      setDetail(d);
      if (!d.amIParticipant && !d.amICreator) {
        joinRoom(roomId).then(res => {
          if (res === 'full') toast('This room is full');
          else if (res === 'pending') toast('Request to join sent — waiting for approval');
        }).catch(() => {});
      }
    }).catch(() => {});
    return () => { cancelled = true; };
  }, [roomId, isDbRoom]);

  // Auto-mount the video room once we know who we are (no "Video" launch
  // button any more — the video room *is* the room).
  useEffect(() => {
    if (!me?.name) return;
    if (video.open || video.loading) return;
    video.joinVideo();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [me?.name]);

  const handleLeave = () => {
    if (isDbRoom) leaveRoom(roomId).catch(() => {});
    router.push('/home');
  };

  // If the host deletes this room while we're in it, the deleter's client
  // emits a 'deleted' broadcast on room-control:{id}. Bail gracefully —
  // LiveKit disconnects when the page unmounts.
  useRealtimeBroadcast<{ roomId: string }>({
    channelName: `room-control:${roomId}`,
    event: 'deleted',
    enabled: isDbRoom,
    onMessage: () => {
      toast('This room was deleted by the host');
      router.push('/home');
    },
  });

  if (!me || !video.open) {
    return (
      <div style={{ position: 'fixed', inset: 0, background: '#1a1a2e', color: '#b6bbcd', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13 }}>
        Loading room…
      </div>
    );
  }

  return (
    <VideoRoom
      roomName={roomId}
      userName={me.name}
      token={video.token}
      onLeave={handleLeave}
      roomId={roomId}
      userId={me.id}
      peerCount={detail?.participant_count ?? 0}
      isPublic={detail ? detail.is_public : true}
      roomTitle={detail?.title}
      roomSubject={detail?.subject ?? null}
      roomType={detail?.room_type}
    />
  );
}


// ════════════════════════════════════════════════════════════════════════════
// GROUP INTERVIEW ROOM — separate structured-interview UX, unchanged.
// ════════════════════════════════════════════════════════════════════════════
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
  return isInterview ? <GroupInterviewRoom roomId={id} /> : <FocusRoom roomId={id} />;
}
