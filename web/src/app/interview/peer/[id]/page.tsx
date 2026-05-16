'use client';

import { use, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Avatar, Icon } from '@/components/primitives';
import dynamic from 'next/dynamic';
import { useVideoRoom } from '@/components/video/useVideoRoom';
import { getInterview, completeInterview } from '@/app/actions/interviews';

const VideoRoom = dynamic(() => import('@/components/video/VideoRoom'), { ssr: false });

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

type InterviewMeta = {
  id: string;
  type: 'peer' | 'group' | 'coach';
  status: 'pending' | 'active' | 'completed' | 'cancelled';
  config: { topic?: string; scheduled_for?: string } & Record<string, unknown>;
  initiator?: { full_name: string | null; avatar_url: string | null } | null;
  partner?: { full_name: string | null; avatar_url: string | null } | null;
} | null;

function Countdown({ target }: { target: string }) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);
  const diff = Math.max(0, Math.floor((new Date(target).getTime() - now) / 1000));
  const d = Math.floor(diff / 86400);
  const h = Math.floor((diff % 86400) / 3600);
  const m = Math.floor((diff % 3600) / 60);
  const s = diff % 60;
  return (
    <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 32, fontWeight: 600, color: 'var(--text-primary)' }}>
      {d > 0 && <>{d}d </>}
      {String(h).padStart(2, '0')}:{String(m).padStart(2, '0')}:{String(s).padStart(2, '0')}
    </div>
  );
}

function NotFoundView() {
  const router = useRouter();
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-base)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 40 }}>
      <div style={{ maxWidth: 420, textAlign: 'center' }}>
        <div style={{ fontSize: 56, marginBottom: 16 }}>🔎</div>
        <h1 style={{ fontFamily: 'Fraunces, serif', fontSize: 32, fontWeight: 500, marginBottom: 10 }}>Interview not found</h1>
        <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 24 }}>It may have been cancelled or never existed.</p>
        <button
          onClick={() => router.push('/interviews')}
          style={{ height: 44, padding: '0 22px', borderRadius: 999, background: 'var(--gradient-brand)', color: '#fff', fontSize: 14, fontWeight: 600 }}
        >
          Back to interviews
        </button>
      </div>
    </div>
  );
}

function WaitingView({ meta }: { meta: NonNullable<InterviewMeta> }) {
  const router = useRouter();
  const scheduled = meta.config?.scheduled_for;
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-base)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 40 }}>
      <div style={{ maxWidth: 520, textAlign: 'center', background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 20, padding: 36 }}>
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', color: 'var(--text-tertiary)', textTransform: 'uppercase', marginBottom: 10 }}>{meta.type === 'coach' ? 'Coach session' : meta.type === 'group' ? 'Group interview' : 'Peer interview'}</div>
        <h1 style={{ fontFamily: 'Fraunces, serif', fontSize: 36, fontWeight: 500, marginBottom: 8 }}>
          {meta.config?.topic ?? 'Interview'}
        </h1>
        <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 24 }}>
          Starts in
        </p>
        {scheduled && <Countdown target={scheduled} />}
        <p style={{ fontSize: 12, color: 'var(--text-tertiary)', marginTop: 14 }}>
          Scheduled for {scheduled ? new Date(scheduled).toLocaleString() : 'TBD'}
        </p>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'center', marginTop: 26 }}>
          <button
            onClick={() => router.push('/interviews')}
            style={{ height: 40, padding: '0 18px', borderRadius: 999, background: 'var(--bg-hover)', border: '1px solid var(--border-subtle)', fontSize: 13, fontWeight: 500 }}
          >
            Back
          </button>
          <button
            onClick={() => window.location.reload()}
            style={{ height: 40, padding: '0 18px', borderRadius: 999, background: 'var(--gradient-brand)', color: '#fff', fontSize: 13, fontWeight: 600 }}
          >
            Start now
          </button>
        </div>
      </div>
    </div>
  );
}

type Phase = 'live' | 'feedback' | 'done';

function FeedbackScreen({ onSubmit }: { onSubmit: () => void }) {
  const [scores, setScores] = useState<Record<string, number>>({ comm: 4, tech: 4, struct: 4, conf: 4 });
  const [notes, setNotes] = useState('');

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-base)', padding: 40 }}>
      <div style={{ maxWidth: 720, margin: '0 auto' }}>
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', color: 'var(--text-tertiary)', textTransform: 'uppercase', marginBottom: 10 }}>Session complete</div>
        <h1 style={{ fontFamily: 'Fraunces, serif', fontSize: 44, fontWeight: 500, letterSpacing: '-0.02em', lineHeight: 1.05, marginBottom: 8 }}>
          Nice run. How was <span style={{ fontStyle: 'italic' }}>your peer</span>?
        </h1>
        <p style={{ fontSize: 15, color: 'var(--text-secondary)', marginBottom: 32 }}>Honest ratings power good matches.</p>

        {[
          { k: 'comm', l: 'Communication' },
          { k: 'tech', l: 'Technical depth' },
          { k: 'struct', l: 'Problem structuring' },
          { k: 'conf', l: 'Confidence' },
        ].map(r => (
          <div key={r.k} style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 14, padding: 18, marginBottom: 10 }}>
            <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 10 }}>{r.l}</div>
            <div style={{ display: 'flex', gap: 6 }}>
              {[1, 2, 3, 4, 5].map(n => (
                <button
                  key={n}
                  onClick={() => setScores({ ...scores, [r.k]: n })}
                  style={{ width: 38, height: 38, fontSize: 22, color: n <= scores[r.k] ? 'var(--amber-500)' : 'var(--text-muted)' }}
                >★</button>
              ))}
            </div>
            <textarea
              placeholder="Optional note (private)…"
              style={{ width: '100%', minHeight: 60, padding: 10, marginTop: 10, background: 'var(--bg-base)', border: '1px solid var(--border-default)', borderRadius: 8, fontSize: 13, resize: 'vertical', outline: 'none' }}
            />
          </div>
        ))}

        <textarea
          value={notes}
          onChange={e => setNotes(e.target.value)}
          placeholder="Overall summary feedback…"
          style={{ width: '100%', minHeight: 100, padding: 14, background: 'var(--bg-surface)', border: '1px solid var(--border-default)', borderRadius: 12, fontSize: 14, resize: 'vertical', outline: 'none', marginBottom: 20 }}
        />

        <button onClick={onSubmit} style={{ height: 48, padding: '0 24px', borderRadius: 999, background: 'var(--gradient-brand)', color: '#fff', fontSize: 15, fontWeight: 600 }}>Submit & continue</button>
      </div>
    </div>
  );
}

function DoneScreen({ onDone }: { onDone: () => void }) {
  const [score, setScore] = useState(0);
  useEffect(() => {
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / 1200);
      setScore(Math.round(82 * (1 - Math.pow(1 - t, 3))));
      if (t < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, []);

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-base)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 40 }}>
      <div style={{ maxWidth: 520, textAlign: 'center' }}>
        <div style={{ fontSize: 56, marginBottom: 16 }}>🎯</div>
        <h1 style={{ fontFamily: 'Fraunces, serif', fontStyle: 'italic', fontSize: 38, fontWeight: 700, marginBottom: 12 }}>Score posted.</h1>
        <p style={{ fontSize: 15, color: 'var(--text-secondary)', marginBottom: 24 }}>Your interview score:</p>
        <div style={{ fontFamily: 'Fraunces, serif', fontSize: 96, fontWeight: 700, color: 'var(--mint-600)', marginBottom: 8, letterSpacing: '-0.03em' }}>{score}</div>
        <div style={{ fontSize: 13, color: 'var(--mint-600)', fontWeight: 600, marginBottom: 32 }}>+6 from your average</div>
        <button onClick={onDone} style={{ height: 48, padding: '0 32px', borderRadius: 999, background: 'var(--gradient-brand)', color: '#fff', fontSize: 15, fontWeight: 600 }}>Done</button>
      </div>
    </div>
  );
}

export default function PeerInterviewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>('live');
  const [elapsed, setElapsed] = useState(0);
  const [role, setRole] = useState<'interviewer' | 'candidate'>('interviewer');
  const [scratch, setScratch] = useState('');
  const [meta, setMeta] = useState<InterviewMeta>(undefined as unknown as InterviewMeta);
  const [metaLoaded, setMetaLoaded] = useState(false);
  const video = useVideoRoom(`interview-${id}`, 'You');

  useEffect(() => {
    if (!UUID_RE.test(id)) {
      setMetaLoaded(true);
      return;
    }
    getInterview(id).then((m) => {
      setMeta(m as InterviewMeta);
      setMetaLoaded(true);
    });
  }, [id]);

  useEffect(() => {
    if (phase !== 'live') return;
    const t = setInterval(() => setElapsed(e => e + 1), 1000);
    return () => clearInterval(t);
  }, [phase]);

  // Role swap at midpoint (every 15 min)
  useEffect(() => {
    if (elapsed > 0 && elapsed % (15 * 60) === 0) {
      setRole(r => r === 'interviewer' ? 'candidate' : 'interviewer');
    }
  }, [elapsed]);

  const fmt = (s: number) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

  // DB-backed flow: if id is a UUID and the record is gone → 404
  if (UUID_RE.test(id) && metaLoaded && meta === null) return <NotFoundView />;
  // Waiting state for scheduled interviews in the future
  if (UUID_RE.test(id) && metaLoaded && meta && meta.status === 'pending') {
    const sched = meta.config?.scheduled_for;
    if (sched && new Date(sched).getTime() > Date.now() + 60_000) {
      return <WaitingView meta={meta} />;
    }
  }

  if (phase === 'feedback') return <FeedbackScreen onSubmit={async () => {
    if (UUID_RE.test(id)) {
      await completeInterview(id, 82, { rated_at: new Date().toISOString() });
    }
    setPhase('done');
  }} />;
  if (phase === 'done') return <DoneScreen onDone={() => router.push('/interviews')} />;

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'var(--bg-base)', display: 'flex', flexDirection: 'column' }}>
      {/* Top */}
      <div style={{ height: 56, padding: '0 24px', background: 'var(--bg-surface)', borderBottom: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <button onClick={() => router.push('/interviews')} style={{ height: 32, padding: '0 12px', borderRadius: 8, background: 'transparent', fontSize: 13, fontWeight: 500, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 4 }}>
          <Icon name="chevronL" size={13} /> Leave
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ padding: '4px 10px', borderRadius: 999, background: 'rgba(16,185,129,0.10)', color: 'var(--mint-600)', fontSize: 11, fontWeight: 600 }}>● Live · {fmt(elapsed)}</span>
          <span style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>
            {meta?.type ? meta.type.charAt(0).toUpperCase() + meta.type.slice(1) : 'Peer'}
            {meta?.config?.topic ? ` · ${meta.config.topic}` : ''}
            {!meta && ` · #${id.slice(0, 8)}`}
          </span>
        </div>
        <div style={{ display: 'flex', gap: 4, padding: 3, background: 'var(--bg-base)', borderRadius: 999, border: '1px solid var(--border-subtle)' }}>
          {(['interviewer', 'candidate'] as const).map(r => (
            <button
              key={r}
              onClick={() => setRole(r)}
              style={{
                padding: '5px 12px', borderRadius: 999, fontSize: 12, fontWeight: 600,
                background: role === r ? 'var(--text-primary)' : 'transparent',
                color: role === r ? '#fff' : 'var(--text-secondary)',
              }}
            >{r === 'interviewer' ? 'You ask' : 'You answer'}</button>
          ))}
        </div>
      </div>

      {/* Body */}
      <div style={{ flex: 1, display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 280px)', overflow: 'hidden' }}>
        {/* Main */}
        <div style={{ padding: 24, overflow: 'auto', display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 16, padding: 24 }}>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', color: 'var(--text-tertiary)', textTransform: 'uppercase', marginBottom: 8 }}>Problem · Two Sum variant</div>
            <h2 style={{ fontFamily: 'Fraunces, serif', fontSize: 22, fontWeight: 500, lineHeight: 1.4 }}>
              Given a sorted array and target <span style={{ fontFamily: 'JetBrains Mono, monospace', background: 'var(--bg-hover)', padding: '2px 8px', borderRadius: 6 }}>T</span>, return the indices of two numbers that sum to <span style={{ fontStyle: 'italic' }}>T</span>.
            </h2>
            <div style={{ display: 'flex', gap: 6, marginTop: 14, flexWrap: 'wrap' }}>
              {['Easy', 'Arrays', 'Two pointers'].map(c => (
                <span key={c} style={{ padding: '4px 10px', borderRadius: 999, background: 'var(--bg-hover)', fontSize: 11, color: 'var(--text-secondary)' }}>{c}</span>
              ))}
            </div>
          </div>
          <div style={{ flex: 1, minHeight: 280 }}>
            <textarea
              value={scratch}
              onChange={e => setScratch(e.target.value)}
              placeholder="// Shared scratchpad — both of you see what's typed here."
              style={{ width: '100%', height: '100%', minHeight: 320, padding: 16, background: '#0E1228', color: '#E2E8F0', border: 'none', borderRadius: 16, fontFamily: 'JetBrains Mono, monospace', fontSize: 13, lineHeight: 1.7, resize: 'none', outline: 'none' }}
            />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            <button style={{ height: 38, padding: '0 14px', borderRadius: 8, background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', fontSize: 12 }}><Icon name="mic" size={13} /> Muted</button>
            <button
              onClick={video.joinVideo}
              disabled={video.loading}
              title={!process.env.NEXT_PUBLIC_LIVEKIT_URL ? 'Video calling coming soon' : 'Join video call'}
              style={{
                height: 38, padding: '0 14px', borderRadius: 8, fontSize: 12,
                background: video.open ? 'rgba(79,70,229,0.10)' : 'var(--bg-surface)',
                border: `1px solid ${video.open ? 'rgba(79,70,229,0.3)' : 'var(--border-subtle)'}`,
                color: video.open ? 'var(--brand-500, #4f46e5)' : 'var(--text-primary)',
                fontWeight: video.open ? 600 : 400,
                opacity: video.loading ? 0.6 : 1,
              }}
            >🎥 {video.loading ? '…' : video.open ? 'In video' : 'Join video'}</button>
            <button style={{ height: 38, padding: '0 14px', borderRadius: 8, background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', fontSize: 12 }}>Pass to partner</button>
            <div style={{ flex: 1 }} />
            <button
              onClick={() => setPhase('feedback')}
              style={{ height: 38, padding: '0 16px', borderRadius: 8, background: '#ef4444', color: '#fff', fontSize: 13, fontWeight: 600 }}
            >End interview</button>
          </div>
          {video.open && (
            <VideoRoom
              roomName={`interview-${id}`}
              userName="You"
              token={video.token}
              onLeave={video.leaveVideo}
            />
          )}
        </div>

        {/* Right panel */}
        <div style={{ background: 'var(--bg-surface)', borderLeft: '1px solid var(--border-subtle)', padding: 14, display: 'flex', flexDirection: 'column', gap: 12, overflow: 'auto' }}>
          <div style={{ borderRadius: 12, overflow: 'hidden' }}>
            <div style={{ aspectRatio: '4/3', background: 'linear-gradient(135deg, #A78BFA, #6EE7B7)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Fraunces, serif', fontSize: 60, color: '#0E1228', position: 'relative' }}>
              D
              <div style={{ position: 'absolute', bottom: 8, left: 8, padding: '3px 8px', background: 'rgba(14,18,40,0.70)', borderRadius: 999, color: '#fff', fontSize: 10, fontWeight: 600 }}>Partner · L4</div>
            </div>
          </div>
          <div style={{ borderRadius: 12, overflow: 'hidden' }}>
            <div style={{ aspectRatio: '4/3', background: '#1C2140', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.85)', position: 'relative' }}>
              <Avatar name="You" size={64} />
              <div style={{ position: 'absolute', bottom: 8, left: 8, padding: '3px 8px', background: 'rgba(14,18,40,0.70)', borderRadius: 999, color: '#fff', fontSize: 10, fontWeight: 600 }}>You</div>
            </div>
          </div>
          <div style={{ background: 'var(--bg-base)', border: '1px solid var(--border-subtle)', borderRadius: 10, padding: 10 }}>
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.06em', color: 'var(--text-tertiary)', textTransform: 'uppercase', marginBottom: 6 }}>Rubric</div>
            {['Problem understanding', 'Communication', 'Code quality', 'Edge cases'].map(r => (
              <div key={r} style={{ fontSize: 11, color: 'var(--text-secondary)', padding: '4px 0' }}>• {r}</div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
