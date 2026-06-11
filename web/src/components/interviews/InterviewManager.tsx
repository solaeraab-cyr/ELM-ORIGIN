'use client';

import { useEffect, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Avatar, Icon } from '@/components/primitives';
import {
  createInterview,
  listInterviews,
  listAvailableInterviews,
  joinInterview,
  cancelInterview,
  getInterviewQuota,
  createSession,
  listInterviewers,
  enqueuePeerMatch,
  cancelPeerMatch,
  pollPeerMatch,
  checkAiInterviewAvailable,
  type InterviewType,
  type InterviewMode,
  type InterviewerCard,
} from '@/app/actions/interviews';

type Tab = 'mine' | 'available' | 'create';

type ProfileLite = { id: string; full_name: string | null; avatar_url: string | null; handle: string | null };

type InterviewRow = {
  id: string;
  type: InterviewType;
  initiator_id: string;
  partner_id: string | null;
  status: 'pending' | 'active' | 'completed' | 'cancelled';
  config: { topic?: string; scheduled_for?: string } & Record<string, unknown>;
  score: number | null;
  started_at: string | null;
  ended_at: string | null;
  created_at: string;
  initiator?: ProfileLite | null;
  partner?: ProfileLite | null;
};

// Shared subject taxonomy (same as Create Room).
const SUBJECT_GROUPS: { label: string; items: string[] }[] = [
  { label: 'Academic Subjects', items: ['Mathematics', 'Physics', 'Chemistry', 'Biology', 'Computer Science', 'Economics', 'Engineering', 'Medicine', 'Law', 'Languages', 'History', 'Business'] },
  { label: 'Engineering Entrance Exams', items: ['JEE Main', 'JEE Advanced', 'BITSAT', 'EAMCET', 'KCET', 'MHT-CET', 'WBJEE', 'COMEDK', 'VITEEE', 'SRMJEEE', 'KIITEE'] },
  { label: 'Medical Entrance Exams', items: ['NEET-UG', 'NEET-PG', 'AIIMS / INI-CET', 'FMGE', 'NExT', 'AIAPGET (AYUSH)', 'AIPVT (Vet)'] },
  { label: 'Civil Services & Govt (Central)', items: ['UPSC CSE', 'UPSC IFS', 'UPSC IES / ESE', 'UPSC CMS', 'UPSC CAPF', 'UPSC NDA', 'UPSC CDS'] },
  { label: 'State Civil Services (PSC)', items: ['APPSC (Andhra)', 'TSPSC (Telangana)', 'MPSC (Maharashtra)', 'KPSC (Karnataka)', 'TNPSC (Tamil Nadu)', 'UPPSC', 'BPSC (Bihar)', 'RPSC (Rajasthan)', 'WBPSC', 'HPSC (Haryana)', 'PPSC (Punjab)', 'JPSC (Jharkhand)', 'Other State PSC'] },
  { label: 'Management / MBA', items: ['CAT', 'XAT', 'MAT', 'SNAP', 'CMAT', 'NMAT', 'IIFT', 'MICAT', 'TISS-NET', 'IBSAT', 'IPMAT'] },
  { label: 'Banking & Finance Govt', items: ['SBI PO', 'SBI Clerk', 'IBPS PO', 'IBPS Clerk', 'IBPS SO', 'RBI Grade B', 'NABARD', 'SIDBI', 'LIC AAO'] },
  { label: 'SSC (Staff Selection)', items: ['SSC CGL', 'SSC CHSL', 'SSC MTS', 'SSC GD', 'SSC JE', 'SSC Stenographer', 'SSC CPO'] },
  { label: 'Defense', items: ['NDA', 'CDS', 'AFCAT', 'INET (Indian Navy)', 'TES (Tech Entry)', 'Agniveer', 'SSB Interview'] },
  { label: 'Railways (RRB)', items: ['RRB NTPC', 'RRB ALP', 'RRB JE', 'RRB Group D', 'RRB Paramedical'] },
  { label: 'Teaching / Academia', items: ['CTET', 'State TET', 'UGC NET', 'CSIR NET', 'KVS', 'NVS', 'DSSSB Teacher'] },
  { label: 'Law', items: ['CLAT', 'AILET', 'LSAT-India', 'MH-CET Law', 'AIBE'] },
  { label: 'Design & Architecture', items: ['NID DAT', 'NIFT', 'UCEED', 'CEED', 'NATA', 'JEE B.Arch'] },
  { label: 'Engineering PG', items: ['GATE', 'IIT JAM', 'GPAT'] },
  { label: 'Commerce / Finance Certs', items: ['CA Foundation', 'CA Inter', 'CA Final', 'CMA', 'CS', 'ACCA', 'CFA L1', 'CFA L2', 'CFA L3', 'FRM'] },
  { label: 'International Study Abroad', items: ['SAT', 'ACT', 'GRE', 'GMAT', 'LSAT', 'MCAT', 'A-Levels', 'AP Exams'] },
  { label: 'English Proficiency', items: ['IELTS', 'TOEFL', 'PTE Academic', 'Duolingo English Test', 'Cambridge CAE/CPE'] },
  { label: 'Medical Abroad', items: ['USMLE Step 1', 'USMLE Step 2', 'USMLE Step 3', 'PLAB (UK)', 'AMC (Australia)', 'MCCQE (Canada)'] },
  { label: 'IT / Tech Certifications', items: ['AWS SAA', 'AWS SAP', 'AWS Developer', 'Azure AZ-104', 'Azure AZ-305', 'GCP Cloud', 'Cisco CCNA', 'Cisco CCNP', 'CISSP', 'CompTIA Security+', 'Kubernetes CKA/CKAD'] },
  { label: 'Project Mgmt & Quality', items: ['PMP', 'PRINCE2', 'Lean Six Sigma Green Belt', 'Lean Six Sigma Black Belt'] },
  { label: 'School-Level', items: ['Class 10 Boards', 'Class 12 Boards', 'NTSE', 'Olympiads (Math/Physics/Chem/Bio/CS)', 'INSPIRE / KVPY', 'NMMS'] },
  { label: 'Other', items: ['Other'] },
];

// Shared interview-format list (same as Create Room).
const INTERVIEW_FORMATS = [
  'HR / Behavioral', 'Technical Coding', 'System Design', 'Case Study (Consulting)',
  'Finance Technical (IB / Equity)', 'Product Management', 'Data Science / ML',
  'Sales Role-play', 'Portfolio Review', 'Whiteboard / Design Challenge',
  'Group Discussion (GD)', 'Aptitude Test', 'UPSC Personality Test',
  'SSB (Defense) Interview', 'Bank PI / GD', 'General Mock Interview',
];

// 5 interview modes, in the order the spec wants them rendered.
const MODES: { id: InterviewMode; emoji: string; title: string; sub: string; price: string; premium?: boolean }[] = [
  { id: 'ai',      emoji: '🤖', title: 'AI Mock Interview', sub: 'Practice anytime with our AI',           price: 'Free (2/day)' },
  { id: 'peer',    emoji: '👤', title: 'Peer 1-on-1',       sub: 'Match with another aspirant',            price: 'Free' },
  { id: 'group',   emoji: '👥', title: 'Group Mock',        sub: '3–5 aspirants',                          price: 'Free' },
  { id: 'mentor',  emoji: '🎯', title: 'Mentor 1-on-1',     sub: 'Verified ELM mentor',                    price: 'From ₹500' },
  { id: 'premium', emoji: '⭐', title: 'Premium Mentor',    sub: 'Ex-FAANG / Senior industry', price: 'From ₹3000', premium: true },
];

const TYPE_LABEL: Record<InterviewType, string> = {
  peer: 'Peer · 1-on-1',
  group: 'Group · 3-5',
  coach: 'Mock · AI',
};

const STATUS_COLOR: Record<InterviewRow['status'], { bg: string; fg: string; label: string }> = {
  pending: { bg: 'rgba(245,158,11,0.12)', fg: 'var(--amber-500, #f59e0b)', label: 'Upcoming' },
  active: { bg: 'rgba(16,185,129,0.12)', fg: 'var(--mint-600, #059669)', label: 'In Progress' },
  completed: { bg: 'rgba(79,70,229,0.12)', fg: 'var(--brand-500, #4f46e5)', label: 'Completed' },
  cancelled: { bg: 'rgba(148,163,184,0.16)', fg: '#64748b', label: 'Cancelled' },
};

function fmtScheduled(iso?: string) {
  if (!iso) return 'Anytime';
  try {
    const d = new Date(iso);
    return d.toLocaleString(undefined, {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  } catch {
    return iso;
  }
}

function detailPath(row: InterviewRow) {
  if (row.type === 'group') return `/interview/group/${row.id}`;
  if (row.type === 'coach') return `/interview/coach/${row.id}`;
  return `/interview/peer/${row.id}`;
}

function InterviewCard({
  row,
  currentUserId,
  onCancel,
  onJoin,
  context,
}: {
  row: InterviewRow;
  currentUserId: string | null;
  onCancel?: (id: string) => void;
  onJoin?: (id: string) => void;
  context: 'mine' | 'available';
}) {
  const router = useRouter();
  const isCreator = currentUserId === row.initiator_id;
  const status = STATUS_COLOR[row.status];
  const topic = row.config?.topic ?? 'Open topic';
  const scheduled = row.config?.scheduled_for;

  return (
    <div
      style={{
        background: 'var(--bg-surface)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 16,
        padding: 18,
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
        <span
          style={{
            height: 22,
            padding: '0 10px',
            borderRadius: 999,
            background: 'var(--bg-hover)',
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: '0.04em',
            textTransform: 'uppercase',
            color: 'var(--text-secondary)',
            display: 'inline-flex',
            alignItems: 'center',
          }}
        >
          {TYPE_LABEL[row.type]}
        </span>
        <span
          style={{
            height: 22,
            padding: '0 10px',
            borderRadius: 999,
            background: status.bg,
            color: status.fg,
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: '0.04em',
            textTransform: 'uppercase',
            display: 'inline-flex',
            alignItems: 'center',
          }}
        >
          {status.label}
        </span>
      </div>

      <div>
        <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 2 }}>{topic}</div>
        <div style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>{fmtScheduled(scheduled)}</div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        {row.initiator && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Avatar name={row.initiator.full_name ?? 'U'} size={22} />
            <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{row.initiator.full_name ?? 'Anonymous'}</span>
          </div>
        )}
        {row.partner_id && row.partner && (
          <>
            <span style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>·</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Avatar name={row.partner.full_name ?? 'P'} size={22} />
              <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{row.partner.full_name ?? 'Partner'}</span>
            </div>
          </>
        )}
      </div>

      <div style={{ display: 'flex', gap: 8, marginTop: 'auto' }}>
        {context === 'available' && (
          <button
            onClick={() => onJoin?.(row.id)}
            style={{
              height: 36,
              padding: '0 16px',
              borderRadius: 999,
              background: 'var(--gradient-brand, linear-gradient(135deg, #4f46e5, #7c3aed))',
              color: '#fff',
              fontSize: 13,
              fontWeight: 600,
              border: 'none',
            }}
          >
            Join
          </button>
        )}
        {context === 'mine' && (row.status === 'pending' || row.status === 'active') && (
          <button
            onClick={() => router.push(detailPath(row))}
            style={{
              height: 36,
              padding: '0 16px',
              borderRadius: 999,
              background: 'var(--gradient-brand, linear-gradient(135deg, #4f46e5, #7c3aed))',
              color: '#fff',
              fontSize: 13,
              fontWeight: 600,
              border: 'none',
            }}
          >
            {row.status === 'active' ? 'Resume' : 'Join'}
          </button>
        )}
        {context === 'mine' && isCreator && (row.status === 'pending' || row.status === 'active') && (
          <button
            onClick={() => onCancel?.(row.id)}
            style={{
              height: 36,
              padding: '0 14px',
              borderRadius: 999,
              background: 'var(--bg-hover)',
              border: '1px solid var(--border-default, var(--border-subtle))',
              color: 'var(--text-secondary)',
              fontSize: 13,
              fontWeight: 500,
            }}
          >
            Cancel
          </button>
        )}
      </div>
    </div>
  );
}

function CreateInterviewForm({
  onCreated,
  quota,
}: {
  onCreated: () => void;
  quota: { plan: string; limit: number; used: number; remaining: number } | null;
}) {
  const router = useRouter();
  const [mode, setMode] = useState<InterviewMode>('ai');
  const [startMode, setStartMode] = useState<'now' | 'scheduled'>('now');
  const [topic, setTopic] = useState<string>('');
  const [format, setFormat] = useState<string>('');
  const [date, setDate] = useState<string>(() => new Date(Date.now() + 24 * 3600 * 1000).toISOString().slice(0, 10));
  const [time, setTime] = useState<string>('18:00');
  const [submitting, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  // Interviewer list (mentor / premium tiers).
  const [interviewers, setInterviewers] = useState<InterviewerCard[]>([]);
  const [selectedInterviewer, setSelectedInterviewer] = useState<InterviewerCard | null>(null);
  const [loadingInterviewers, setLoadingInterviewers] = useState(false);
  useEffect(() => {
    if (mode !== 'mentor' && mode !== 'premium') {
      setInterviewers([]);
      setSelectedInterviewer(null);
      return;
    }
    setLoadingInterviewers(true);
    listInterviewers({ tier: mode === 'premium' ? 'premium' : 'regular' })
      .then((list) => { setInterviewers(list); setSelectedInterviewer(null); })
      .finally(() => setLoadingInterviewers(false));
  }, [mode]);

  // Peer Start-Now search state.
  const [peerQueueId, setPeerQueueId] = useState<string | null>(null);
  const [peerElapsed, setPeerElapsed] = useState(0);
  useEffect(() => {
    if (!peerQueueId) return;
    const t0 = Date.now();
    const tick = setInterval(async () => {
      setPeerElapsed(Math.floor((Date.now() - t0) / 1000));
      const r = await pollPeerMatch(peerQueueId);
      if (r.status === 'matched' && r.sessionId) {
        clearInterval(tick);
        setPeerQueueId(null);
        window.location.href = `/room/${r.sessionId}`;
      }
    }, 2500);
    return () => clearInterval(tick);
  }, [peerQueueId]);

  // Mock Razorpay checkout state.
  const [paying, setPaying] = useState(false);

  // AI Mock availability probe — disables the card if env keys are missing.
  const [aiAvailable, setAiAvailable] = useState<{ ok: boolean; missing: string[] } | null>(null);
  useEffect(() => { checkAiInterviewAvailable().then(setAiAvailable); }, []);

  // Start Now is only enabled for AI and Peer modes.
  const canStartNow = mode === 'ai' || mode === 'peer';
  const effectiveStartMode = canStartNow ? startMode : 'scheduled';
  const overLimit = quota ? Number.isFinite(quota.limit) && quota.used >= quota.limit : false;

  // Submit label depends on mode + timing.
  const isMentorTier = mode === 'mentor' || mode === 'premium';
  const submitLabel = (() => {
    if (submitting || paying) return mode === 'ai' && effectiveStartMode === 'now' ? 'Starting…' : 'Working…';
    if (isMentorTier) {
      const price = selectedInterviewer?.price_paise ?? 0;
      return `Pay ₹${Math.round(price / 100)} & Book Session`;
    }
    if (effectiveStartMode === 'now') {
      if (mode === 'ai') return 'Start AI Interview';
      if (mode === 'peer') return 'Find a match now';
    }
    return 'Create Interview';
  })();

  const submitDisabled = submitting || paying || overLimit || !topic || (isMentorTier && !selectedInterviewer);

  // ── Submit dispatch ─────────────────────────────────────────────────────
  const submit = () => {
    setError(null);

    // Peer 1-on-1 + Start Now → peer_queue (no interview_sessions row yet;
    // the match flow inserts one).
    if (mode === 'peer' && effectiveStartMode === 'now') {
      startTransition(async () => {
        const r = await enqueuePeerMatch({ format });
        if (!r.ok) { setError(r.error); return; }
        setPeerQueueId(r.queueId);
      });
      return;
    }

    // Mentor / Premium → create a scheduled session row + mock Razorpay.
    if (isMentorTier && selectedInterviewer) {
      startTransition(async () => {
        const scheduledFor = new Date(`${date}T${time}`).toISOString();
        const sess = await createSession({
          mode,
          startMode: 'scheduled',
          topic,
          interviewFormat: format || null,
          scheduledFor,
          interviewerId: selectedInterviewer.user_id,
          pricePaise: selectedInterviewer.price_paise,
        });
        if (!sess.ok) { setError(sess.error); return; }

        // Mock Razorpay checkout — fetch a mock order, "confirm", call verify.
        setPaying(true);
        try {
          const orderRes = await fetch('/api/payments/razorpay/create-order', {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              amountPaise: selectedInterviewer.price_paise,
              sessionId: sess.id,
              mentorId: selectedInterviewer.user_id,
            }),
          });
          const order = await orderRes.json();
          if (!orderRes.ok) throw new Error(order.error || 'Order failed');
          const ok = window.confirm(`Mock checkout: pay ₹${Math.round(selectedInterviewer.price_paise / 100)}?`);
          if (!ok) { setPaying(false); return; }
          await fetch('/api/payments/razorpay/verify', {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              orderId: order.orderId,
              paymentId: `mock_pay_${Date.now()}`,
              signature: 'mock',
              sessionId: sess.id,
              mentorId: selectedInterviewer.user_id,
              amountPaise: selectedInterviewer.price_paise,
            }),
          });
          setPaying(false);
          onCreated();
        } catch (e) {
          setPaying(false);
          setError(e instanceof Error ? e.message : 'Payment failed');
        }
      });
      return;
    }

    // AI Mock + Start Now → /api/ai-interview/start (creates the session row
    // server-side, generates the opening turn + TTS, returns the sessionId).
    if (mode === 'ai' && effectiveStartMode === 'now') {
      startTransition(async () => {
        try {
          const res = await fetch('/api/ai-interview/start', {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ format: format || 'General Mock Interview', topic, subject: topic }),
          });
          const data = await res.json();
          if (!res.ok) {
            if (data.error === 'unavailable') {
              setError(`AI Mock is currently unavailable — admin setup needed (${(data.missing || []).join(', ')}).`);
            } else if (data.error === 'quota_exceeded') {
              setError(`You've hit your ${data.plan ?? 'Free'} daily AI Mock limit (${data.limit ?? 2}).`);
            } else {
              setError(data.error || 'Failed to start AI interview');
            }
            return;
          }
          window.location.href = `/interview/ai/${data.sessionId}`;
        } catch (e) {
          setError(e instanceof Error ? e.message : 'Network error');
        }
      });
      return;
    }

    // All other paths (Group/Peer/AI scheduled) → createSession + onCreated.
    startTransition(async () => {
      const scheduledFor =
        effectiveStartMode === 'now'
          ? new Date().toISOString()
          : new Date(`${date}T${time}`).toISOString();

      const res = await createSession({
        mode,
        startMode: effectiveStartMode,
        topic,
        interviewFormat: format || null,
        scheduledFor,
      });
      if (!res.ok) {
        setError(res.error || 'Failed to create interview');
        return;
      }
      onCreated();
    });
  };

  // ── Searching-for-peer overlay ──────────────────────────────────────────
  if (peerQueueId) {
    return (
      <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 16, padding: 28, maxWidth: 640, textAlign: 'center' }}>
        <div style={{ fontFamily: 'Fraunces, serif', fontSize: 24, fontWeight: 500, marginBottom: 8 }}>Searching for a match…</div>
        <div style={{ fontSize: 13, color: 'var(--text-tertiary)', marginBottom: 18 }}>{peerElapsed}s elapsed — we&apos;ll route you both into the room once paired.</div>
        <button
          onClick={async () => {
            const id = peerQueueId; setPeerQueueId(null);
            if (id) await cancelPeerMatch(id);
          }}
          style={{ height: 40, padding: '0 22px', borderRadius: 999, background: 'var(--bg-hover)', border: '1px solid var(--border-default)', fontSize: 13, fontWeight: 600 }}
        >Cancel search</button>
      </div>
    );
  }

  return (
    <div
      style={{
        background: 'var(--bg-surface)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 16,
        padding: 24,
        maxWidth: 640,
      }}
    >
      <h3 style={{ fontFamily: 'Fraunces, serif', fontSize: 24, fontWeight: 500, marginBottom: 6 }}>Create a new interview</h3>
      <p style={{ fontSize: 13, color: 'var(--text-tertiary)', marginBottom: 22 }}>
        Start now or schedule for later — choose a mode, topic, and format.
      </p>

      {quota && (
        <div style={{ fontSize: 12, color: overLimit ? 'var(--amber-500, #f59e0b)' : 'var(--text-tertiary)', marginBottom: 18, padding: '8px 12px', borderRadius: 8, background: overLimit ? 'rgba(245,158,11,0.10)' : 'var(--bg-hover)', border: '1px solid var(--border-subtle)' }}>
          {Number.isFinite(quota.limit) ? `${quota.plan} plan · ${quota.used}/${quota.limit} interviews today` : `${quota.plan} plan · unlimited interviews`}
          {overLimit && <> · <a href="/pricing" style={{ color: 'var(--brand-500, #4f46e5)', fontWeight: 600 }}>Upgrade</a></>}
        </div>
      )}

      {/* ── Timing toggle ──────────────────────────────────────────────── */}
      <div style={{ marginBottom: 20 }}>
        <label style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase', color: 'var(--text-tertiary)', display: 'block', marginBottom: 8 }}>When</label>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          {(['now', 'scheduled'] as const).map(s => {
            const active = effectiveStartMode === s;
            const disabled = s === 'now' && !canStartNow;
            return (
              <button
                key={s}
                onClick={() => !disabled && setStartMode(s)}
                disabled={disabled}
                style={{
                  padding: '14px 12px', borderRadius: 12,
                  background: active ? 'var(--brand-500, #4f46e5)' : 'var(--bg-hover)',
                  color: active ? '#fff' : disabled ? 'var(--text-muted, #94a3b8)' : 'var(--text-primary)',
                  border: `1px solid ${active ? 'var(--brand-500, #4f46e5)' : 'var(--border-subtle)'}`,
                  fontSize: 14, fontWeight: 600,
                  cursor: disabled ? 'not-allowed' : 'pointer',
                  opacity: disabled ? 0.6 : 1, textAlign: 'left',
                }}
              >
                <div>{s === 'now' ? '⚡ Start Now' : '📅 Schedule for later'}</div>
                {disabled && <div style={{ fontSize: 11, fontWeight: 400, opacity: 0.8, marginTop: 2 }}>available for AI &amp; Peer</div>}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── 5 Mode cards ──────────────────────────────────────────────── */}
      <div style={{ marginBottom: 20 }}>
        <label style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase', color: 'var(--text-tertiary)', display: 'block', marginBottom: 8 }}>Interview mode</label>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 8 }}>
          {MODES.map(m => {
            const active = mode === m.id;
            const gold = m.premium;
            // AI Mock disabled iff the env probe returned not-ok. Other modes
            // are always enabled.
            const disabled = m.id === 'ai' && aiAvailable && !aiAvailable.ok;
            return (
              <button
                key={m.id}
                onClick={() => !disabled && setMode(m.id)}
                disabled={!!disabled}
                title={disabled ? `Currently unavailable — admin setup needed (${aiAvailable?.missing.join(', ')})` : ''}
                style={{
                  padding: '14px 12px', borderRadius: 12, textAlign: 'left',
                  background: active ? (gold ? 'rgba(245,158,11,0.18)' : 'var(--brand-500, #4f46e5)') : 'var(--bg-hover)',
                  color: active && !gold ? '#fff' : disabled ? 'var(--text-muted, #94a3b8)' : 'var(--text-primary)',
                  border: `1px solid ${active ? (gold ? 'var(--amber-500, #f59e0b)' : 'var(--brand-500, #4f46e5)') : 'var(--border-subtle)'}`,
                  fontSize: 13, fontWeight: 600, cursor: disabled ? 'not-allowed' : 'pointer',
                  opacity: disabled ? 0.55 : 1,
                }}
              >
                <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 4 }}>{m.emoji} {m.title}</div>
                <div style={{ fontSize: 11, fontWeight: 400, opacity: 0.85, marginBottom: 6, lineHeight: 1.4 }}>{m.sub}</div>
                <div style={{ fontSize: 11, fontWeight: 700, color: gold ? 'var(--amber-600, #d97706)' : (active ? 'rgba(255,255,255,0.85)' : 'var(--text-tertiary)') }}>
                  {disabled ? 'Unavailable' : m.price}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Topic / Subject (grouped) ─────────────────────────────────── */}
      <div style={{ marginBottom: 20 }}>
        <label style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase', color: 'var(--text-tertiary)', display: 'block', marginBottom: 8 }}>Topic / Subject</label>
        <select
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          style={{ width: '100%', height: 42, padding: '0 12px', background: 'var(--bg-base)', border: '1px solid var(--border-default, var(--border-subtle))', borderRadius: 10, fontSize: 14, color: 'var(--text-primary)' }}
        >
          <option value="">Select a topic…</option>
          {SUBJECT_GROUPS.map(g => (
            <optgroup key={g.label} label={g.label}>
              {g.items.map(s => <option key={s} value={s}>{s}</option>)}
            </optgroup>
          ))}
        </select>
      </div>

      {/* ── Interview Format ──────────────────────────────────────────── */}
      <div style={{ marginBottom: 20 }}>
        <label style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase', color: 'var(--text-tertiary)', display: 'block', marginBottom: 8 }}>Interview format</label>
        <select
          value={format}
          onChange={(e) => setFormat(e.target.value)}
          style={{ width: '100%', height: 42, padding: '0 12px', background: 'var(--bg-base)', border: '1px solid var(--border-default, var(--border-subtle))', borderRadius: 10, fontSize: 14, color: 'var(--text-primary)' }}
        >
          <option value="">No specific format</option>
          {INTERVIEW_FORMATS.map(f => <option key={f} value={f}>{f}</option>)}
        </select>
      </div>

      {/* ── Conditional: mentor list ──────────────────────────────────── */}
      {isMentorTier && (
        <div style={{ marginBottom: 20 }}>
          <label style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase', color: 'var(--text-tertiary)', display: 'block', marginBottom: 8 }}>
            {mode === 'premium' ? 'Pick a premium mentor' : 'Pick a mentor'}
          </label>
          {loadingInterviewers ? (
            <div style={{ fontSize: 13, color: 'var(--text-tertiary)', padding: 14 }}>Loading…</div>
          ) : interviewers.length === 0 ? (
            <div style={{ fontSize: 13, color: 'var(--text-tertiary)', padding: 14, background: 'var(--bg-hover)', borderRadius: 10, border: '1px solid var(--border-subtle)' }}>
              No {mode === 'premium' ? 'premium' : ''} mentors available right now — check back soon.
            </div>
          ) : (
            <div style={{ display: 'grid', gap: 8 }}>
              {interviewers.map(iv => {
                const sel = selectedInterviewer?.user_id === iv.user_id;
                return (
                  <button
                    key={iv.user_id}
                    onClick={() => setSelectedInterviewer(iv)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 12, padding: 12,
                      background: sel ? 'rgba(79,70,229,0.08)' : 'var(--bg-hover)',
                      border: `1.5px solid ${sel ? 'var(--brand-500, #4f46e5)' : 'var(--border-subtle)'}`,
                      borderRadius: 12, cursor: 'pointer', textAlign: 'left',
                    }}
                  >
                    <Avatar name={iv.full_name ?? 'Mentor'} size={48} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 14, fontWeight: 700 }}>
                        {iv.full_name ?? 'Mentor'}
                        {iv.is_faang_verified && (
                          <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 6px', borderRadius: 999, background: 'rgba(245,158,11,0.15)', color: 'var(--amber-600, #d97706)' }}>
                            ⭐ Verified FAANG / Senior Industry
                          </span>
                        )}
                      </div>
                      <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                        {iv.current_role || '—'}{iv.current_company ? ` · ${iv.current_company}` : ''}
                        {typeof iv.years_experience === 'number' ? ` · ${iv.years_experience}y exp` : ''}
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>
                        {iv.avg_rating ? `${iv.avg_rating.toFixed(1)} ★` : 'No ratings yet'}
                        {iv.total_sessions ? ` · ${iv.total_sessions} sessions` : ''}
                      </div>
                    </div>
                    <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>₹{Math.round(iv.price_paise / 100)}</div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ── Date / time (only when scheduling) ─────────────────────────── */}
      {effectiveStartMode === 'scheduled' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 24 }}>
          <div>
            <label style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase', color: 'var(--text-tertiary)', display: 'block', marginBottom: 8 }}>Date</label>
            <input type="date" value={date} onChange={e => setDate(e.target.value)}
              style={{ width: '100%', height: 42, padding: '0 12px', background: 'var(--bg-base)', border: '1px solid var(--border-default, var(--border-subtle))', borderRadius: 10, fontSize: 14, color: 'var(--text-primary)' }} />
          </div>
          <div>
            <label style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase', color: 'var(--text-tertiary)', display: 'block', marginBottom: 8 }}>Time</label>
            <input type="time" value={time} onChange={e => setTime(e.target.value)}
              style={{ width: '100%', height: 42, padding: '0 12px', background: 'var(--bg-base)', border: '1px solid var(--border-default, var(--border-subtle))', borderRadius: 10, fontSize: 14, color: 'var(--text-primary)' }} />
          </div>
        </div>
      )}

      {error && (
        <div style={{ fontSize: 13, color: '#ef4444', marginBottom: 14 }}>{error}</div>
      )}

      <button
        onClick={submit}
        disabled={submitDisabled}
        style={{
          width: '100%', height: 48, borderRadius: 999,
          background: 'var(--gradient-brand, linear-gradient(135deg, #4f46e5, #7c3aed))',
          color: '#fff', fontWeight: 600, fontSize: 15, border: 'none',
          opacity: submitDisabled ? 0.6 : 1, cursor: submitDisabled ? 'not-allowed' : 'pointer',
        }}
      >
        {overLimit ? 'Daily limit reached' : submitLabel}
      </button>
      {/* router import keeps webpack happy when we conditionally redirect. */}
      <span style={{ display: 'none' }}>{router && ' '}</span>
    </div>
  );
}

export default function InterviewManager({ currentUserId }: { currentUserId: string | null }) {
  const [tab, setTab] = useState<Tab>('mine');
  const [mine, setMine] = useState<InterviewRow[]>([]);
  const [available, setAvailable] = useState<InterviewRow[]>([]);
  const [quota, setQuota] = useState<{ plan: string; limit: number; used: number; remaining: number } | null>(null);
  const [loading, setLoading] = useState(false);

  const refresh = async () => {
    setLoading(true);
    const [m, a, q] = await Promise.all([
      listInterviews(),
      listAvailableInterviews(),
      getInterviewQuota(),
    ]);
    setMine(m as unknown as InterviewRow[]);
    setAvailable(a as unknown as InterviewRow[]);
    setQuota(q);
    setLoading(false);
  };

  useEffect(() => {
    refresh();
  }, []);

  const handleCancel = async (id: string) => {
    await cancelInterview(id);
    refresh();
  };

  const handleJoin = async (id: string) => {
    const res = await joinInterview(id);
    if (res.ok) {
      const row = available.find((r) => r.id === id);
      if (row) {
        window.location.href = detailPath(row);
        return;
      }
    }
    refresh();
  };

  const tabs: { id: Tab; label: string; count?: number }[] = [
    { id: 'mine', label: 'My Interviews', count: mine.length },
    { id: 'available', label: 'Available', count: available.length },
    { id: 'create', label: 'Create New' },
  ];

  return (
    <section
      style={{
        background: 'var(--bg-base)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 20,
        padding: 24,
        marginBottom: 48,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18, flexWrap: 'wrap', gap: 12 }}>
        <h2 style={{ fontFamily: 'Fraunces, serif', fontSize: 26, fontWeight: 500, letterSpacing: '-0.02em' }}>
          Manage <span style={{ fontStyle: 'italic' }}>interviews</span>
        </h2>
        {quota && Number.isFinite(quota.limit) && (
          <span style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>
            {quota.plan} · {quota.used}/{quota.limit} today
          </span>
        )}
      </div>

      <div
        role="tablist"
        style={{
          display: 'flex',
          gap: 4,
          padding: 4,
          background: 'var(--bg-hover)',
          borderRadius: 12,
          marginBottom: 22,
          width: 'fit-content',
        }}
      >
        {tabs.map((t) => {
          const active = tab === t.id;
          return (
            <button
              key={t.id}
              role="tab"
              aria-selected={active}
              onClick={() => setTab(t.id)}
              style={{
                padding: '8px 16px',
                borderRadius: 8,
                background: active ? 'var(--bg-surface)' : 'transparent',
                color: active ? 'var(--text-primary)' : 'var(--text-secondary)',
                fontSize: 13,
                fontWeight: 600,
                border: 'none',
                boxShadow: active ? 'var(--shadow-xs, 0 1px 2px rgba(0,0,0,0.05))' : 'none',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
              }}
            >
              {t.label}
              {typeof t.count === 'number' && (
                <span
                  style={{
                    padding: '1px 7px',
                    borderRadius: 999,
                    background: active ? 'var(--bg-hover)' : 'var(--bg-surface)',
                    fontSize: 11,
                    fontWeight: 700,
                    color: 'var(--text-tertiary)',
                  }}
                >
                  {t.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {loading && mine.length === 0 && available.length === 0 ? (
        <div style={{ fontSize: 13, color: 'var(--text-tertiary)', padding: '24px 0' }}>Loading…</div>
      ) : tab === 'mine' ? (
        mine.length === 0 ? (
          <div style={{ padding: '32px 0', textAlign: 'center' }}>
            <div style={{ fontSize: 28, marginBottom: 8 }}>🎯</div>
            <div style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 14 }}>You haven&apos;t scheduled any interviews yet.</div>
            <button
              onClick={() => setTab('create')}
              style={{
                height: 38,
                padding: '0 18px',
                borderRadius: 999,
                background: 'var(--gradient-brand, linear-gradient(135deg, #4f46e5, #7c3aed))',
                color: '#fff',
                fontSize: 13,
                fontWeight: 600,
                border: 'none',
              }}
            >
              Create your first interview
            </button>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 14 }}>
            {mine.map((row) => (
              <InterviewCard key={row.id} row={row} currentUserId={currentUserId} onCancel={handleCancel} context="mine" />
            ))}
          </div>
        )
      ) : tab === 'available' ? (
        available.length === 0 ? (
          <div style={{ padding: '32px 0', textAlign: 'center', fontSize: 14, color: 'var(--text-secondary)' }}>
            No open interviews right now. Check back soon — or create one.
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 14 }}>
            {available.map((row) => (
              <InterviewCard key={row.id} row={row} currentUserId={currentUserId} onJoin={handleJoin} context="available" />
            ))}
          </div>
        )
      ) : (
        <CreateInterviewForm
          quota={quota}
          onCreated={() => {
            setTab('mine');
            refresh();
          }}
        />
      )}
    </section>
  );
}
