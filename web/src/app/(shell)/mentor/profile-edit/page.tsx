'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { Avatar, Icon } from '@/components/primitives';
import { MENTOR_USER, type MentorUser } from '@/lib/mentor-data';
import { toast } from '@/lib/toast';

function Section({ title, status = 'complete', defaultOpen = true, children }: { title: string; status?: 'complete' | 'incomplete'; defaultOpen?: boolean; children: React.ReactNode }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 16, overflow: 'hidden' }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{ display: 'flex', alignItems: 'center', gap: 12, width: '100%', padding: '18px 24px', background: 'transparent', textAlign: 'left', cursor: 'pointer' }}
      >
        <span style={{ flex: 1, fontWeight: 600, fontSize: 15 }}>{title}</span>
        <span style={{
          fontSize: 11, fontWeight: 600, padding: '3px 9px', borderRadius: 999,
          background: status === 'complete' ? 'rgba(16,185,129,0.10)' : 'rgba(245,158,11,0.10)',
          color: status === 'complete' ? 'var(--mint-600)' : 'var(--amber-600)',
        }}>{status === 'complete' ? 'Complete' : 'Incomplete'}</span>
        <span style={{ color: 'var(--text-tertiary)', transition: 'transform 200ms', transform: open ? 'rotate(180deg)' : 'rotate(0)' }}>
          <Icon name="chevronD" size={16} />
        </span>
      </button>
      {open && <div style={{ padding: '0 24px 24px', borderTop: '1px solid var(--border-subtle)', display: 'flex', flexDirection: 'column', gap: 14 }}>{children}</div>}
    </div>
  );
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.06em', color: 'var(--text-tertiary)', textTransform: 'uppercase', marginBottom: 6, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>{children}</div>;
}

const inputStyle: React.CSSProperties = {
  width: '100%', height: 40, padding: '0 14px',
  background: 'var(--bg-base)', border: '1px solid var(--border-default)',
  borderRadius: 10, fontSize: 14, color: 'var(--text-primary)', outline: 'none',
};

const textareaStyle: React.CSSProperties = {
  width: '100%', padding: '12px 14px',
  background: 'var(--bg-base)', border: '1px solid var(--border-default)',
  borderRadius: 10, fontSize: 14, color: 'var(--text-primary)',
  outline: 'none', resize: 'vertical', lineHeight: 1.6,
  fontFamily: 'Inter, system-ui',
};

export default function MentorProfileEditPage() {
  const initial = useMemo<MentorUser>(() => JSON.parse(JSON.stringify(MENTOR_USER)), []);
  const [draft, setDraft] = useState<MentorUser>(initial);
  const [saved, setSaved] = useState<MentorUser>(initial);
  const [aiLoading, setAiLoading] = useState(false);
  const [tagInput, setTagInput] = useState('');
  const dirty = JSON.stringify(draft) !== JSON.stringify(saved);

  const setField = <K extends keyof MentorUser>(k: K, v: MentorUser[K]) => setDraft(d => ({ ...d, [k]: v }));
  const setPricing = (kind: 'voice' | 'video', k: 'enabled' | 'p30' | 'p60', v: number | boolean) =>
    setDraft(d => ({ ...d, pricing: { ...d.pricing, [kind]: { ...d.pricing[kind], [k]: v } } }));

  const aiGenerate = () => {
    setAiLoading(true);
    setTimeout(() => {
      const generated = "I'm a data scientist with an IIT Bombay PhD and 6 years at Google Research. My specialty is making the math behind machine learning feel obvious — I've helped hundreds of students who said they weren't \"math people\" land roles at top product companies. I teach by working through real problems together, not lecturing.";
      setField('bio', generated);
      setAiLoading(false);
      toast('Generated — edit as needed');
    }, 1500);
  };

  const charCounter = (val: string, max: number) => {
    const n = val.length;
    const color = n >= max ? '#ef4444' : n >= max * 0.8 ? 'var(--amber-600)' : 'var(--text-tertiary)';
    return <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, color }}>{n}/{max}</span>;
  };

  const lowest = Math.min(
    draft.pricing.voice.enabled ? draft.pricing.voice.p30 : Infinity,
    draft.pricing.video.enabled ? draft.pricing.video.p30 : Infinity,
  );

  return (
    <div style={{ maxWidth: 1080, margin: '0 auto', padding: '32px 40px 140px' }}>
      <Link href="/mentor/dashboard" style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 13, color: 'var(--text-secondary)', marginBottom: 16, textDecoration: 'none' }}>
        <Icon name="chevronL" size={13} /> Back to Dashboard
      </Link>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <h1 style={{ fontFamily: 'Fraunces, serif', fontWeight: 500, fontSize: 36, margin: 0 }}>Edit Profile</h1>
        <span style={{
          padding: '5px 12px', borderRadius: 999, fontSize: 11, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase',
          background: draft.acceptingBookings ? 'rgba(16,185,129,0.12)' : 'var(--bg-hover)',
          color: draft.acceptingBookings ? 'var(--mint-600)' : 'var(--text-tertiary)',
        }}>{draft.acceptingBookings ? '● Public' : '○ Hidden'}</span>
      </div>

      {/* Live preview */}
      <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 16, padding: 16, marginBottom: 24 }}>
        <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--brand-500)', marginBottom: 10 }}>How students see your profile</div>
        <div style={{ display: 'flex', gap: 14, padding: 14, background: 'var(--bg-hover)', borderRadius: 12, border: '1px solid var(--border-subtle)' }}>
          <Avatar name={draft.name} size={48} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontWeight: 600, fontSize: 14 }}>{draft.name}</div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{draft.headline}</div>
            <div style={{ display: 'flex', gap: 10, marginTop: 6, fontSize: 11, color: 'var(--text-tertiary)', flexWrap: 'wrap' }}>
              <span style={{ color: 'var(--amber-500)' }}>★ {draft.rating}</span>
              <span>·</span>
              <span>{draft.subjects.slice(0, 2).join(' · ')}</span>
              <span>·</span>
              <span style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>From ₹{lowest === Infinity ? '—' : lowest}/30min</span>
            </div>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <Section title="Photo">
          <div style={{ display: 'flex', alignItems: 'center', gap: 24, flexWrap: 'wrap' }}>
            <div style={{ width: 120, height: 120, borderRadius: '50%', background: 'var(--gradient-brand)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Fraunces, serif', fontWeight: 600, fontSize: 36, color: '#fff' }}>
              {draft.name.split(' ').map(s => s[0]).slice(0, 2).join('')}
            </div>
            <div>
              <button
                onClick={() => toast('Crop modal (stub) — pretend you cropped')}
                style={{ height: 36, padding: '0 14px', borderRadius: 999, background: 'var(--bg-hover)', border: '1px solid var(--border-default)', fontSize: 13, fontWeight: 500 }}
              >Change photo</button>
              <div style={{ fontSize: 11, color: 'var(--text-tertiary)', marginTop: 8 }}>PNG or JPG, max 5MB</div>
            </div>
          </div>
        </Section>

        <Section title="Basic info">
          <div>
            <FieldLabel>Full name</FieldLabel>
            <input value={draft.name} onChange={e => setField('name', e.target.value)} style={inputStyle} />
          </div>
          <div>
            <FieldLabel>Headline {charCounter(draft.headline, 80)}</FieldLabel>
            <input value={draft.headline} onChange={e => setField('headline', e.target.value.slice(0, 80))} style={inputStyle} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14 }}>
            <div>
              <FieldLabel>Country</FieldLabel>
              <select value={draft.country} onChange={e => setField('country', e.target.value)} style={inputStyle}>
                {['India', 'United States', 'United Kingdom', 'Canada', 'Singapore', 'Other'].map(o => <option key={o}>{o}</option>)}
              </select>
            </div>
            <div>
              <FieldLabel>Timezone</FieldLabel>
              <select value={draft.timezone} onChange={e => setField('timezone', e.target.value)} style={inputStyle}>
                {['IST (UTC+5:30)', 'PST (UTC-8)', 'EST (UTC-5)', 'GMT (UTC)', 'SGT (UTC+8)'].map(o => <option key={o}>{o}</option>)}
              </select>
            </div>
          </div>
        </Section>

        <Section title="Bio">
          <div>
            <FieldLabel>About me {charCounter(draft.bio, 600)}</FieldLabel>
            <textarea value={draft.bio} onChange={e => setField('bio', e.target.value.slice(0, 600))} rows={5} style={textareaStyle} />
            <div style={{ marginTop: 8 }}>
              <button
                onClick={aiGenerate}
                disabled={aiLoading}
                style={{ padding: '6px 12px', borderRadius: 8, background: 'transparent', border: '1px solid var(--border-default)', fontSize: 12, color: 'var(--brand-500)', fontWeight: 600 }}
              >
                {aiLoading ? '✨ Generating…' : '✨ AI · Help me write'}
              </button>
            </div>
          </div>
          <div>
            <FieldLabel>Teaching approach {charCounter(draft.teachingApproach, 400)}</FieldLabel>
            <textarea value={draft.teachingApproach} onChange={e => setField('teachingApproach', e.target.value.slice(0, 400))} rows={3} style={textareaStyle} />
          </div>
        </Section>

        <Section title="Expertise">
          <div>
            <FieldLabel>Primary field</FieldLabel>
            <select value={draft.primary} onChange={e => setField('primary', e.target.value)} style={inputStyle}>
              {['Data Science', 'Software Engineering', 'Product', 'Design', 'Business', 'Other'].map(o => <option key={o}>{o}</option>)}
            </select>
          </div>
          <div>
            <FieldLabel>Subjects you teach</FieldLabel>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, padding: 10, border: '1px solid var(--border-default)', borderRadius: 10, background: 'var(--bg-base)' }}>
              {draft.subjects.map((s, i) => (
                <span key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 10px', borderRadius: 999, background: 'rgba(79,70,229,0.10)', color: 'var(--brand-600)', fontSize: 12, fontWeight: 500 }}>
                  {s}
                  <button onClick={() => setField('subjects', draft.subjects.filter((_, k) => k !== i))} style={{ background: 'transparent', color: 'var(--brand-600)', padding: 0, fontSize: 14 }}>×</button>
                </span>
              ))}
              <input
                value={tagInput}
                onChange={e => setTagInput(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter' && tagInput.trim() && draft.subjects.length < 10) {
                    setField('subjects', [...draft.subjects, tagInput.trim()]);
                    setTagInput('');
                  }
                }}
                placeholder="Add subject + Enter"
                style={{ flex: 1, minWidth: 140, background: 'transparent', border: 'none', outline: 'none', fontSize: 12, color: 'var(--text-primary)' }}
              />
            </div>
          </div>
        </Section>

        <Section title="Credentials">
          <div>
            <FieldLabel>Education</FieldLabel>
            {draft.education.map((e, i) => (
              <div key={i} style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 2fr) minmax(0, 2fr) 90px 36px', gap: 8, marginBottom: 8 }}>
                <input value={e.degree} onChange={ev => setField('education', draft.education.map((x, k) => k === i ? { ...x, degree: ev.target.value } : x))} style={inputStyle} placeholder="Degree" />
                <input value={e.institution} onChange={ev => setField('education', draft.education.map((x, k) => k === i ? { ...x, institution: ev.target.value } : x))} style={inputStyle} placeholder="Institution" />
                <input value={e.year} onChange={ev => setField('education', draft.education.map((x, k) => k === i ? { ...x, year: ev.target.value } : x))} style={inputStyle} placeholder="Year" />
                <button onClick={() => setField('education', draft.education.filter((_, k) => k !== i))} style={{ background: 'transparent', color: 'var(--text-tertiary)' }}>
                  <Icon name="x" size={14} />
                </button>
              </div>
            ))}
            <button
              onClick={() => setField('education', [...draft.education, { degree: '', institution: '', year: '' }])}
              style={{ fontSize: 12, color: 'var(--brand-500)', fontWeight: 600, background: 'transparent' }}
            >+ Add education</button>
          </div>
          <div>
            <FieldLabel>Certifications</FieldLabel>
            {draft.certs.map((c, i) => (
              <div key={i} style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 2fr) minmax(0, 2fr) 90px 36px', gap: 8, marginBottom: 8 }}>
                <input value={c.name} onChange={ev => setField('certs', draft.certs.map((x, k) => k === i ? { ...x, name: ev.target.value } : x))} style={inputStyle} placeholder="Name" />
                <input value={c.issuer} onChange={ev => setField('certs', draft.certs.map((x, k) => k === i ? { ...x, issuer: ev.target.value } : x))} style={inputStyle} placeholder="Issuer" />
                <input value={c.year} onChange={ev => setField('certs', draft.certs.map((x, k) => k === i ? { ...x, year: ev.target.value } : x))} style={inputStyle} placeholder="Year" />
                <button onClick={() => setField('certs', draft.certs.filter((_, k) => k !== i))} style={{ background: 'transparent', color: 'var(--text-tertiary)' }}>
                  <Icon name="x" size={14} />
                </button>
              </div>
            ))}
            <button
              onClick={() => setField('certs', [...draft.certs, { name: '', issuer: '', year: '' }])}
              style={{ fontSize: 12, color: 'var(--brand-500)', fontWeight: 600, background: 'transparent' }}
            >+ Add certification</button>
          </div>
        </Section>

        <Section title="Session pricing">
          {(['voice', 'video'] as const).map(kind => (
            <div key={kind} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '12px 0', borderBottom: '1px solid var(--border-subtle)', flexWrap: 'wrap' }}>
              <button
                onClick={() => setPricing(kind, 'enabled', !draft.pricing[kind].enabled)}
                style={{
                  width: 44, height: 24, borderRadius: 12, padding: 0, position: 'relative',
                  background: draft.pricing[kind].enabled ? 'var(--gradient-brand)' : 'var(--bg-hover)',
                  border: '1px solid var(--border-default)',
                }}
              >
                <span style={{ position: 'absolute', top: 2, left: draft.pricing[kind].enabled ? 22 : 2, width: 18, height: 18, borderRadius: '50%', background: '#fff', transition: 'left 180ms' }} />
              </button>
              <span style={{ fontWeight: 600, fontSize: 14, width: 80, textTransform: 'capitalize' }}>{kind}</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>₹</span>
                <input
                  type="number" value={draft.pricing[kind].p30}
                  onChange={e => setPricing(kind, 'p30', +e.target.value)}
                  disabled={!draft.pricing[kind].enabled}
                  style={{ width: 80, padding: '7px 10px', border: '1px solid var(--border-default)', borderRadius: 8, fontFamily: 'JetBrains Mono, monospace', fontSize: 13, background: 'var(--bg-base)', color: 'var(--text-primary)' }}
                />
                <span style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>/30min</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>₹</span>
                <input
                  type="number" value={draft.pricing[kind].p60}
                  onChange={e => setPricing(kind, 'p60', +e.target.value)}
                  disabled={!draft.pricing[kind].enabled}
                  style={{ width: 80, padding: '7px 10px', border: '1px solid var(--border-default)', borderRadius: 8, fontFamily: 'JetBrains Mono, monospace', fontSize: 13, background: 'var(--bg-base)', color: 'var(--text-primary)' }}
                />
                <span style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>/60min</span>
              </div>
            </div>
          ))}
          <div style={{ marginTop: 14, fontSize: 12, color: 'var(--text-tertiary)' }}>
            Elm Origin takes 15%. You receive 85%. At ₹{draft.pricing.video.p60}/60-min, you earn <strong style={{ color: 'var(--mint-600)' }}>₹{Math.round(draft.pricing.video.p60 * 0.85)}</strong>.
          </div>
        </Section>

        <Section title="Visibility">
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
            <button
              onClick={() => setField('acceptingBookings', !draft.acceptingBookings)}
              style={{
                width: 52, height: 28, borderRadius: 14, padding: 0, position: 'relative',
                background: draft.acceptingBookings ? 'var(--gradient-brand)' : 'var(--bg-hover)',
                border: '1px solid var(--border-default)',
              }}
            >
              <span style={{ position: 'absolute', top: 2, left: draft.acceptingBookings ? 26 : 2, width: 22, height: 22, borderRadius: '50%', background: '#fff', transition: 'left 180ms', boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }} />
            </button>
            <div>
              <div style={{ fontWeight: 600, fontSize: 14 }}>Accept new bookings</div>
              <div style={{ fontSize: 12, color: draft.acceptingBookings ? 'var(--text-tertiary)' : 'var(--amber-600)', fontStyle: draft.acceptingBookings ? 'normal' : 'italic', marginTop: 3 }}>
                {draft.acceptingBookings ? 'Your profile is visible to all students' : "Profile hidden from search. Existing students see 'Not taking bookings'."}
              </div>
            </div>
          </div>
        </Section>
      </div>

      {/* Sticky save bar */}
      {dirty && (
        <div style={{
          position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 80,
          background: 'var(--bg-surface)', borderTop: '1px solid var(--border-default)',
          boxShadow: '0 -8px 24px rgba(14,18,40,0.08)',
          padding: '14px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap',
        }}>
          <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>You have unsaved changes</div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button onClick={() => setDraft(saved)} style={{ height: 38, padding: '0 16px', borderRadius: 999, background: 'var(--bg-hover)', border: '1px solid var(--border-default)', fontSize: 13, fontWeight: 500 }}>Discard</button>
            <button
              onClick={() => { setSaved(draft); toast('Profile updated ✓'); }}
              style={{ height: 38, padding: '0 18px', borderRadius: 999, background: 'var(--gradient-brand)', color: '#fff', fontSize: 13, fontWeight: 600 }}
            >Save Changes</button>
          </div>
        </div>
      )}
    </div>
  );
}
