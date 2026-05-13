'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Icon } from '@/components/primitives';

const EXPERTISE = ['Computer Science', 'Mathematics', 'Physics', 'Chemistry', 'Biology', 'Engineering', 'Economics', 'Business', 'Law', 'Medicine', 'Data Science', 'Design', 'Languages', 'Other'];

const inputStyle: React.CSSProperties = {
  width: '100%', height: 44, padding: '0 14px',
  background: 'var(--bg-surface)', border: '1.5px solid var(--border-default)',
  borderRadius: 12, fontSize: 14, color: 'var(--text-primary)', outline: 'none',
};

const labelStyle: React.CSSProperties = {
  fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6, display: 'flex', justifyContent: 'space-between',
};

const AMBIENT: React.CSSProperties = {
  position: 'relative',
  background: 'var(--bg-surface)',
  backgroundImage: 'radial-gradient(ellipse 700px 320px at 92% -10%, rgba(27,43,142,0.06), transparent 60%)',
};

export default function MentorApplyPage() {
  const router = useRouter();
  const [data, setData] = useState({ name: '', email: '', linkedin: '', primary: '', secondary: '', years: '', bio: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const update = (patch: Partial<typeof data>) => setData(d => ({ ...d, ...patch }));

  const validate = () => {
    const e: Record<string, string> = {};
    if (!data.name.trim()) e.name = 'Required';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) e.email = 'Enter a valid email';
    if (!data.linkedin.trim() || !/linkedin\.com/i.test(data.linkedin)) e.linkedin = 'Enter your LinkedIn URL';
    if (!data.primary) e.primary = 'Pick one';
    if (!data.years) e.years = 'Pick one';
    if (data.bio.length > 300) e.bio = 'Max 300 characters';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = () => {
    if (!validate()) return;
    setLoading(true);
    setTimeout(() => { setLoading(false); setSubmitted(true); }, 800);
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-base)', overflowY: 'auto' }}>
      {/* Hero */}
      <div style={{ height: 200, ...AMBIENT, borderBottom: '1px solid var(--border-subtle)', padding: '0 56px', position: 'relative' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '24px 0' }}>
          <Link href="/" style={{ fontFamily: 'Fraunces, serif', fontSize: 22, fontWeight: 700, textDecoration: 'none', color: 'var(--text-primary)' }}>elm origin</Link>
          <Link href="/" style={{ height: 32, padding: '0 14px', borderRadius: 999, background: 'var(--bg-hover)', border: '1px solid var(--border-default)', fontSize: 13, fontWeight: 500, textDecoration: 'none', color: 'var(--text-primary)', display: 'flex', alignItems: 'center' }}>← Back to landing</Link>
        </div>
        <div style={{ maxWidth: 1080, margin: '0 auto', paddingTop: 16 }}>
          <h1 style={{
            fontFamily: 'Fraunces, serif', fontWeight: 800, fontSize: 'clamp(32px, 5vw, 44px)', letterSpacing: '-0.02em', lineHeight: 1.05,
            background: 'var(--gradient-brand)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
          }}>Teach what you know. Earn what you deserve.</h1>
          <div style={{ display: 'flex', gap: 22, marginTop: 14, flexWrap: 'wrap' }}>
            {[['₹40L+', 'earned by mentors'], ['4.8★', 'avg rating'], ['120+', 'active mentors']].map(([v, l]) => (
              <div key={l}>
                <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 14, fontWeight: 600 }}>{v}</span>
                <span style={{ fontSize: 12, color: 'var(--text-tertiary)', marginLeft: 6 }}>{l}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Form card */}
      <div style={{ padding: '40px 20px 80px', display: 'flex', justifyContent: 'center' }}>
        <div style={{
          width: '100%', maxWidth: 580,
          background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)',
          borderRadius: 24, padding: 40, boxShadow: 'var(--shadow-xl)',
        }}>
          {!submitted ? (
            <>
              <h2 style={{ fontFamily: 'Fraunces, serif', fontSize: 26, fontWeight: 700, marginBottom: 6 }}>Apply to mentor on Elm Origin</h2>
              <p style={{ fontSize: 13, color: 'var(--text-tertiary)', marginBottom: 24 }}>Most applications get reviewed within 2–3 business days.</p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div>
                  <div style={labelStyle}>Full name</div>
                  <input value={data.name} onChange={e => update({ name: e.target.value })} placeholder="Priya Sharma" style={{ ...inputStyle, borderColor: errors.name ? '#ef4444' : 'var(--border-default)' }} />
                  {errors.name && <div style={{ fontSize: 11, color: '#ef4444', marginTop: 4 }}>{errors.name}</div>}
                </div>
                <div>
                  <div style={labelStyle}>Email</div>
                  <input type="email" value={data.email} onChange={e => update({ email: e.target.value })} placeholder="you@email.com" style={{ ...inputStyle, borderColor: errors.email ? '#ef4444' : 'var(--border-default)' }} />
                  {errors.email && <div style={{ fontSize: 11, color: '#ef4444', marginTop: 4 }}>{errors.email}</div>}
                </div>
                <div>
                  <div style={labelStyle}>LinkedIn URL</div>
                  <input value={data.linkedin} onChange={e => update({ linkedin: e.target.value })} placeholder="https://linkedin.com/in/…" style={{ ...inputStyle, borderColor: errors.linkedin ? '#ef4444' : 'var(--border-default)' }} />
                  {errors.linkedin && <div style={{ fontSize: 11, color: '#ef4444', marginTop: 4 }}>{errors.linkedin}</div>}
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12 }}>
                  <div>
                    <div style={labelStyle}>Primary expertise</div>
                    <select value={data.primary} onChange={e => update({ primary: e.target.value })} style={{ ...inputStyle, borderColor: errors.primary ? '#ef4444' : 'var(--border-default)' }}>
                      <option value="">Select…</option>
                      {EXPERTISE.map(o => <option key={o}>{o}</option>)}
                    </select>
                  </div>
                  <div>
                    <div style={labelStyle}>Secondary (optional)</div>
                    <select value={data.secondary} onChange={e => update({ secondary: e.target.value })} style={inputStyle}>
                      <option value="">None</option>
                      {EXPERTISE.map(o => <option key={o}>{o}</option>)}
                    </select>
                  </div>
                </div>
                <div>
                  <div style={labelStyle}>Years teaching</div>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    {['<1', '1–3', '3–5', '5–10', '10+'].map(opt => {
                      const sel = data.years === opt;
                      return (
                        <button
                          key={opt}
                          onClick={() => update({ years: opt })}
                          style={{
                            flex: 1, minWidth: 70, height: 38, borderRadius: 999, fontSize: 12, fontWeight: 600,
                            background: sel ? 'var(--gradient-brand)' : 'var(--bg-surface)',
                            color: sel ? '#fff' : 'var(--text-secondary)',
                            border: `1px solid ${sel ? 'transparent' : 'var(--border-default)'}`,
                          }}
                        >{opt}</button>
                      );
                    })}
                  </div>
                </div>
                <div>
                  <div style={labelStyle}>
                    <span>Short bio (why you want to mentor)</span>
                    <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, color: data.bio.length > 300 ? '#ef4444' : 'var(--text-tertiary)' }}>{data.bio.length}/300</span>
                  </div>
                  <textarea
                    value={data.bio}
                    onChange={e => update({ bio: e.target.value.slice(0, 300) })}
                    placeholder="Tell students what you teach and how you teach it…"
                    style={{ width: '100%', minHeight: 100, padding: '12px 14px', background: 'var(--bg-surface)', border: '1.5px solid var(--border-default)', borderRadius: 12, fontSize: 14, color: 'var(--text-primary)', resize: 'vertical', outline: 'none', lineHeight: 1.6 }}
                  />
                </div>

                <button
                  onClick={submit}
                  disabled={loading}
                  style={{ height: 48, padding: '0 24px', borderRadius: 999, background: 'var(--gradient-brand)', color: '#fff', fontSize: 15, fontWeight: 600, marginTop: 8, boxShadow: '0 6px 18px rgba(27,43,142,0.30)', opacity: loading ? 0.7 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
                >{loading ? 'Submitting…' : 'Submit Application'}</button>
              </div>
            </>
          ) : (
            <div style={{ textAlign: 'center', padding: '20px 0' }}>
              <div style={{ width: 72, height: 72, margin: '0 auto 20px', borderRadius: 999, background: 'var(--mint-500, #10b981)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 0 10px rgba(16,185,129,0.12)' }}>
                <Icon name="check" size={32} />
              </div>
              <h2 style={{ fontFamily: 'Fraunces, serif', fontStyle: 'italic', fontSize: 30, fontWeight: 600, marginBottom: 10 }}>Application received.</h2>
              <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 28 }}>
                We&apos;ll review your details and email you at <strong>{data.email}</strong> within 2–3 business days.
              </p>
              <button
                onClick={() => router.push('/mentor-setup')}
                style={{ height: 44, padding: '0 22px', borderRadius: 999, background: 'var(--gradient-brand)', color: '#fff', fontSize: 14, fontWeight: 600 }}
              >Continue to setup (preview)</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
