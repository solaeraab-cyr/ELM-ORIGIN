'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Icon } from '@/components/primitives';
import { toast } from '@/lib/toast';
import { createRoom, type RoomType } from '@/app/actions/rooms';
import { roomCode, roomLink } from '@/lib/roomCode';

interface Props { onClose: () => void }

// ── Subject taxonomy ─────────────────────────────────────────────────────
// Grouped for <optgroup>. Subject is OPTIONAL on a room.
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

// Pure-JS title→subject auto-suggest. Longest keyword wins; case-insensitive
// substring match. Only used to default-select when the user hasn't picked
// a subject manually.
const SUBJECT_KEYWORDS_RAW: { key: string; subject: string }[] = [
  { key: 'JEE Advanced', subject: 'JEE Advanced' },
  { key: 'NEET PG', subject: 'NEET-PG' },
  { key: 'NEET-PG', subject: 'NEET-PG' },
  { key: 'JEE Main', subject: 'JEE Main' },
  { key: 'Civil Services', subject: 'UPSC CSE' },
  { key: 'SSC CGL', subject: 'SSC CGL' },
  { key: 'CA Final', subject: 'CA Final' },
  { key: 'JEE', subject: 'JEE Main' },
  { key: 'NEET', subject: 'NEET-UG' },
  { key: 'EAMCET', subject: 'EAMCET' },
  { key: 'KCET', subject: 'KCET' },
  { key: 'MHCET', subject: 'MHT-CET' },
  { key: 'MHT', subject: 'MHT-CET' },
  { key: 'UPSC', subject: 'UPSC CSE' },
  { key: 'APPSC', subject: 'APPSC (Andhra)' },
  { key: 'TSPSC', subject: 'TSPSC (Telangana)' },
  { key: 'GATE', subject: 'GATE' },
  { key: 'CLAT', subject: 'CLAT' },
  { key: 'GMAT', subject: 'GMAT' },
  { key: 'GRE', subject: 'GRE' },
  { key: 'IELTS', subject: 'IELTS' },
  { key: 'TOEFL', subject: 'TOEFL' },
  { key: 'SBI', subject: 'SBI PO' },
  { key: 'IBPS', subject: 'IBPS PO' },
  { key: 'CGL', subject: 'SSC CGL' },
  { key: 'NDA', subject: 'NDA' },
  { key: 'CDS', subject: 'CDS' },
  { key: 'CFA', subject: 'CFA L1' },
  { key: 'USMLE', subject: 'USMLE Step 1' },
  { key: 'AWS', subject: 'AWS SAA' },
  // 'CAT' is intentionally last among the short keys so longer matches
  // like 'EAMCET'/'KCET'/'MHCET' (which all contain "CAT" as a substring)
  // don't get mis-routed. Sort by length DESC handles this — we keep it
  // explicit here for readability.
  { key: 'CAT', subject: 'CAT' },
];

const SUBJECT_KEYWORDS = [...SUBJECT_KEYWORDS_RAW].sort((a, b) => b.key.length - a.key.length);

function suggestSubject(title: string): string | null {
  const t = title.toLowerCase();
  if (!t) return null;
  for (const { key, subject } of SUBJECT_KEYWORDS) {
    if (t.includes(key.toLowerCase())) return subject;
  }
  return null;
}

// ── Interview Format options (collaboration rooms only) ─────────────────
const INTERVIEW_FORMATS = [
  'HR / Behavioral', 'Technical Coding', 'System Design', 'Case Study (Consulting)',
  'Finance Technical (IB / Equity)', 'Product Management', 'Data Science / ML',
  'Sales Role-play', 'Portfolio Review', 'Whiteboard / Design Challenge',
  'Group Discussion (GD)', 'Aptitude Test', 'UPSC Personality Test',
  'SSB (Defense) Interview', 'Bank PI / GD', 'General Mock Interview',
];

const inputStyle: React.CSSProperties = {
  width: '100%', minHeight: 40, padding: '10px 14px',
  background: 'var(--bg-base)', border: '1px solid var(--border-default)',
  borderRadius: 10, fontSize: 14, color: 'var(--text-primary)', outline: 'none',
  fontFamily: 'Inter, system-ui',
};

const labelStyle: React.CSSProperties = {
  fontSize: 11, fontWeight: 700, letterSpacing: '0.06em',
  color: 'var(--text-tertiary)', textTransform: 'uppercase', marginBottom: 6, display: 'block',
};

const DURATIONS = [30, 45, 60, 90, 120];

export default function CreateRoomModal({ onClose }: Props) {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState('');
  // True once the user has explicitly chosen a subject — stops the title-based
  // auto-suggest from overwriting a deliberate selection.
  const [subjectTouched, setSubjectTouched] = useState(false);
  const [description, setDescription] = useState('');
  const [roomType, setRoomType] = useState<RoomType>('study');
  const [interviewFormat, setInterviewFormat] = useState('');
  const [visibility, setVisibility] = useState<'public' | 'private'>('public');
  const [maxP, setMaxP] = useState(10);
  const [duration, setDuration] = useState(60);
  const [requiresApproval, setRequiresApproval] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [created, setCreated] = useState<{ id: string } | null>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape' && !submitting) onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose, submitting]);

  // Auto-suggest subject from title keywords until the user picks one manually.
  const suggested = useMemo(() => suggestSubject(title), [title]);
  useEffect(() => {
    if (subjectTouched) return;
    if (suggested && suggested !== subject) setSubject(suggested);
  }, [suggested, subjectTouched, subject]);

  // Subject is optional now. Only title is required.
  const canCreate = title.trim().length > 0 && !submitting;

  const create = async () => {
    if (!canCreate) return;
    setSubmitting(true);
    const result = await createRoom({
      title,
      subject: subject || undefined,
      description,
      roomType,
      visibility,
      maxParticipants: maxP,
      durationMinutes: duration,
      requiresApproval: visibility === 'private' ? requiresApproval : false,
      interviewFormat: roomType === 'collaboration' && interviewFormat ? interviewFormat : null,
    });
    if (!result.ok) {
      toast(result.error);
      setSubmitting(false);
      return;
    }
    setCreated({ id: result.id });
    setSubmitting(false);
  };

  if (created) {
    return <RoomCreatedModal roomId={created.id} onClose={onClose} onEnter={() => router.push(`/room/${created.id}`)} />;
  }

  return (
    <div onClick={() => { if (!submitting) onClose(); }} style={{
      position: 'fixed', inset: 0, zIndex: 600,
      background: 'rgba(7,10,24,0.55)', backdropFilter: 'blur(8px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24,
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        width: 520, maxWidth: '100%', maxHeight: '90vh', overflow: 'auto',
        background: 'var(--bg-surface)', borderRadius: 24,
        border: '1px solid var(--border-subtle)', boxShadow: 'var(--shadow-xl)',
        animation: 'modalIn 350ms var(--ease-out-expo)',
      }}>
        {/* Header */}
        <div style={{ padding: '22px 28px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-subtle)' }}>
          <div style={{ fontFamily: 'Fraunces, serif', fontSize: 22, fontWeight: 700 }}>Start a study room</div>
          <button onClick={onClose} disabled={submitting} style={{ width: 30, height: 30, borderRadius: 8, color: 'var(--text-tertiary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icon name="x" size={16} />
          </button>
        </div>

        <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 18 }}>
          <div>
            <label style={labelStyle}>Title <span style={{ color: 'var(--danger-500)' }}>*</span></label>
            <input autoFocus value={title} onChange={e => setTitle(e.target.value.slice(0, 80))} placeholder="Wednesday DP grind" style={inputStyle} />
          </div>

          <div>
            <label style={labelStyle}>Subject <span style={{ fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>(optional)</span></label>
            <select
              value={subject}
              onChange={e => { setSubject(e.target.value); setSubjectTouched(true); }}
              style={{ ...inputStyle, height: 42, cursor: 'pointer' }}
            >
              <option value="">No subject</option>
              {SUBJECT_GROUPS.map(g => (
                <optgroup key={g.label} label={g.label}>
                  {g.items.map(s => <option key={s} value={s}>{s}</option>)}
                </optgroup>
              ))}
            </select>
            {!subjectTouched && suggested && (
              <div style={{ fontSize: 11, color: 'var(--text-tertiary)', marginTop: 4 }}>
                Suggested from title — pick another to override
              </div>
            )}
          </div>

          <div>
            <label style={labelStyle}>Description <span style={{ fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>(optional)</span></label>
            <textarea value={description} onChange={e => setDescription(e.target.value.slice(0, 280))} placeholder="What's the focus for this session?" rows={2} style={{ ...inputStyle, resize: 'none', lineHeight: 1.5 }} />
          </div>

          <div>
            <label style={labelStyle}>Room type</label>
            <div style={{ display: 'flex', gap: 8 }}>
              {([['study', '📚 Study', 'Focused individual work alongside others'], ['collaboration', '⚡ Collaboration', 'Work together, talk, share']] as const).map(([v, l, d]) => {
                const sel = roomType === v;
                return (
                  <button key={v} onClick={() => setRoomType(v as RoomType)} style={{
                    flex: 1, padding: 12, borderRadius: 12, textAlign: 'left',
                    background: sel ? 'rgba(79,70,229,0.06)' : 'var(--bg-surface)',
                    border: `1.5px solid ${sel ? 'var(--brand-500)' : 'var(--border-default)'}`,
                    cursor: 'pointer', transition: 'all 160ms',
                  }}>
                    <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 2 }}>{l}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-tertiary)', lineHeight: 1.4 }}>{d}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {roomType === 'collaboration' && (
            <div>
              <label style={labelStyle}>Interview Format <span style={{ fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>(optional)</span></label>
              <select value={interviewFormat} onChange={e => setInterviewFormat(e.target.value)} style={{ ...inputStyle, height: 42, cursor: 'pointer' }}>
                <option value="">(none / not an interview)</option>
                {INTERVIEW_FORMATS.map(f => <option key={f} value={f}>{f}</option>)}
              </select>
            </div>
          )}

          <div style={{ display: 'flex', gap: 16 }}>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>Visibility</label>
              <div style={{ display: 'flex', gap: 6 }}>
                {(['public', 'private'] as const).map(t => (
                  <button key={t} onClick={() => setVisibility(t)} style={{
                    flex: 1, height: 40, borderRadius: 999, fontSize: 13, fontWeight: 600,
                    background: visibility === t ? 'var(--text-primary)' : 'var(--bg-surface)',
                    color: visibility === t ? '#fff' : 'var(--text-secondary)',
                    border: `1px solid ${visibility === t ? 'var(--text-primary)' : 'var(--border-subtle)'}`,
                    cursor: 'pointer',
                  }}>{t === 'public' ? '🌐 Public' : '🔒 Private'}</button>
                ))}
              </div>
            </div>
            <div style={{ width: 150 }}>
              <label style={labelStyle}>Duration</label>
              <select value={duration} onChange={e => setDuration(Number(e.target.value))} style={{ ...inputStyle, height: 40, cursor: 'pointer' }}>
                {DURATIONS.map(d => <option key={d} value={d}>{d} min</option>)}
              </select>
            </div>
          </div>

          <div>
            <label style={labelStyle}>Max participants</label>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <button onClick={() => setMaxP(Math.max(2, maxP - 1))} style={{ width: 38, height: 38, borderRadius: '10px 0 0 10px', border: '1px solid var(--border-default)', background: 'var(--bg-surface)', color: 'var(--text-secondary)', fontSize: 16, fontWeight: 700, cursor: 'pointer' }}>−</button>
              <input
                type="number"
                value={maxP}
                min={2}
                max={50}
                onChange={e => setMaxP(Math.max(2, Math.min(50, Number(e.target.value) || 2)))}
                style={{ width: 64, height: 38, textAlign: 'center', borderTop: '1px solid var(--border-default)', borderBottom: '1px solid var(--border-default)', border: '1px solid var(--border-default)', background: 'var(--bg-surface)', fontSize: 14, fontWeight: 700, fontFamily: 'JetBrains Mono, monospace', color: 'var(--text-primary)', outline: 'none' }}
              />
              <button onClick={() => setMaxP(Math.min(50, maxP + 1))} style={{ width: 38, height: 38, borderRadius: '0 10px 10px 0', border: '1px solid var(--border-default)', background: 'var(--bg-surface)', color: 'var(--text-secondary)', fontSize: 16, fontWeight: 700, cursor: 'pointer' }}>+</button>
            </div>
          </div>

          {visibility === 'private' && (
            <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', fontSize: 13, color: 'var(--text-secondary)' }}>
              <input type="checkbox" checked={requiresApproval} onChange={e => setRequiresApproval(e.target.checked)} />
              Require approval before others can join
            </label>
          )}
        </div>

        {/* Footer */}
        <div style={{ padding: '16px 24px', borderTop: '1px solid var(--border-subtle)', display: 'flex', gap: 10 }}>
          <button onClick={onClose} disabled={submitting} style={{ flex: 1, height: 48, borderRadius: 999, background: 'var(--bg-hover)', border: '1px solid var(--border-default)', fontSize: 14, fontWeight: 500, cursor: 'pointer' }}>Cancel</button>
          <button onClick={create} disabled={!canCreate} style={{
            flex: 2, height: 48, padding: '0 22px', borderRadius: 999,
            background: 'var(--gradient-brand)', color: '#fff', fontSize: 14, fontWeight: 600,
            opacity: !canCreate ? 0.55 : 1, cursor: !canCreate ? 'default' : 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          }}>
            {submitting ? (
              <><span style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: 999, animation: 'spin 0.8s linear infinite' }} /> Creating…</>
            ) : (
              <>Create &amp; Enter Room <Icon name="chevronR" size={13} /></>
            )}
          </button>
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } } @keyframes modalIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }`}</style>
      </div>
    </div>
  );
}

function CopyRow({ label, value }: { label: string; value: string }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      toast('Copy failed — select and copy manually');
    }
  };
  return (
    <div>
      <label style={labelStyle}>{label}</label>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 12px', background: 'var(--bg-base)', border: '1px solid var(--border-default)', borderRadius: 10 }}>
        <span style={{ flex: 1, minWidth: 0, fontFamily: 'JetBrains Mono, monospace', fontSize: 13, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{value}</span>
        <button onClick={copy} style={{ flexShrink: 0, height: 30, padding: '0 12px', borderRadius: 8, background: copied ? 'var(--mint-500)' : 'var(--bg-hover)', color: copied ? '#fff' : 'var(--text-primary)', border: '1px solid var(--border-default)', fontSize: 12, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5 }}>
          {copied ? <><Icon name="check" size={12} /> Copied</> : '📋 Copy'}
        </button>
      </div>
    </div>
  );
}

function RoomCreatedModal({ roomId, onClose, onEnter }: { roomId: string; onClose: () => void; onEnter: () => void }) {
  const code = roomCode(roomId);
  const link = roomLink(roomId);
  const shareWhatsApp = () => {
    const text = `Join my study room on ELM Origin! Code: ${code}  Link: ${link}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank', 'noopener,noreferrer');
  };
  return (
    <div onClick={onClose} style={{
      position: 'fixed', inset: 0, zIndex: 600,
      background: 'rgba(7,10,24,0.55)', backdropFilter: 'blur(8px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24,
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        width: 480, maxWidth: '100%', background: 'var(--bg-surface)', borderRadius: 24,
        border: '1px solid var(--border-subtle)', boxShadow: 'var(--shadow-xl)',
        animation: 'modalIn 350ms var(--ease-out-expo)', padding: 28,
      }}>
        <div style={{ textAlign: 'center', marginBottom: 22 }}>
          <div style={{ width: 56, height: 56, margin: '0 auto 12px', borderRadius: 999, background: 'rgba(16,185,129,0.12)', color: 'var(--mint-600)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icon name="check" size={28} />
          </div>
          <div style={{ fontFamily: 'Fraunces, serif', fontSize: 24, fontWeight: 700 }}>Room created!</div>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4 }}>Share the code or link so others can join.</p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <CopyRow label="Room code" value={code} />
          <CopyRow label="Share link" value={link} />
        </div>

        <div style={{ display: 'flex', gap: 10, marginTop: 24 }}>
          <button onClick={shareWhatsApp} style={{ flex: 1, height: 48, borderRadius: 999, background: 'var(--bg-hover)', border: '1px solid var(--border-default)', fontSize: 14, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
            Share via WhatsApp
          </button>
          <button onClick={onEnter} style={{ flex: 1, height: 48, borderRadius: 999, background: 'var(--gradient-brand)', color: '#fff', fontSize: 14, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
            Enter Room <Icon name="chevronR" size={13} />
          </button>
        </div>
        <style>{`@keyframes modalIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }`}</style>
      </div>
    </div>
  );
}
