'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Icon } from '@/components/primitives';
import { toast } from '@/lib/toast';

const STEPS = ['Basic', 'Expertise', 'Credentials', 'Availability', 'Pricing', 'Review'] as const;
type Step = typeof STEPS[number];

const inputStyle: React.CSSProperties = {
  width: '100%', height: 42, padding: '0 14px',
  background: 'var(--bg-surface)', border: '1.5px solid var(--border-default)',
  borderRadius: 12, fontSize: 14, color: 'var(--text-primary)', outline: 'none',
};

const labelStyle: React.CSSProperties = { fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6, display: 'block' };

export default function MentorSetupPage() {
  const router = useRouter();
  const [stepIdx, setStepIdx] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  const [data, setData] = useState({
    name: '', headline: '', timezone: 'IST (UTC+5:30)',
    primary: 'Data Science', subjects: ['Statistics'] as string[],
    education: '', cert: '',
    daysOn: { Mon: true, Tue: true, Wed: true, Thu: true, Fri: true, Sat: false, Sun: false } as Record<string, boolean>,
    voice30: 499, video60: 999,
  });
  const [tagInput, setTagInput] = useState('');

  const step: Step = STEPS[stepIdx];
  const next = () => setStepIdx(i => Math.min(STEPS.length - 1, i + 1));
  const back = () => setStepIdx(i => Math.max(0, i - 1));

  const finish = () => {
    setSubmitting(true);
    setTimeout(() => {
      toast('You\'re live as a mentor 🎉');
      router.push('/mentor/dashboard');
    }, 1200);
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-base)', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div style={{ padding: '20px 32px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Link href="/" style={{ fontFamily: 'Fraunces, serif', fontSize: 22, fontWeight: 700, textDecoration: 'none', color: 'var(--text-primary)' }}>elm origin</Link>
        <div style={{ fontSize: 13, color: 'var(--text-tertiary)' }}>Mentor setup · Step {stepIdx + 1} of {STEPS.length}</div>
      </div>

      {/* Progress strip */}
      <div style={{ padding: '12px 32px', display: 'flex', gap: 6 }}>
        {STEPS.map((s, i) => (
          <div key={s} style={{ flex: 1, height: 4, borderRadius: 2, background: i <= stepIdx ? 'var(--gradient-brand)' : 'var(--bg-hover)', transition: 'background 300ms' }} />
        ))}
      </div>

      {/* Body */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '40px 20px 120px' }}>
        <div style={{ width: '100%', maxWidth: 580, background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 24, padding: 40, boxShadow: 'var(--shadow-xl)' }}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', color: 'var(--brand-500)', textTransform: 'uppercase', marginBottom: 10 }}>Step {stepIdx + 1}: {step}</div>

          {step === 'Basic' && (
            <>
              <h2 style={{ fontFamily: 'Fraunces, serif', fontSize: 28, fontWeight: 600, marginBottom: 20 }}>Tell us about yourself</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div>
                  <label style={labelStyle}>Full name</label>
                  <input value={data.name} onChange={e => setData(d => ({ ...d, name: e.target.value }))} placeholder="Priya Sharma" style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Headline (max 80 chars)</label>
                  <input value={data.headline} onChange={e => setData(d => ({ ...d, headline: e.target.value.slice(0, 80) }))} placeholder="Data Scientist · IIT Bombay PhD" style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Timezone</label>
                  <select value={data.timezone} onChange={e => setData(d => ({ ...d, timezone: e.target.value }))} style={inputStyle}>
                    {['IST (UTC+5:30)', 'PST (UTC-8)', 'EST (UTC-5)', 'GMT (UTC)', 'SGT (UTC+8)'].map(o => <option key={o}>{o}</option>)}
                  </select>
                </div>
              </div>
            </>
          )}

          {step === 'Expertise' && (
            <>
              <h2 style={{ fontFamily: 'Fraunces, serif', fontSize: 28, fontWeight: 600, marginBottom: 20 }}>What do you teach?</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div>
                  <label style={labelStyle}>Primary field</label>
                  <select value={data.primary} onChange={e => setData(d => ({ ...d, primary: e.target.value }))} style={inputStyle}>
                    {['Data Science', 'Software Engineering', 'Product', 'Design', 'Business', 'Medicine', 'Other'].map(o => <option key={o}>{o}</option>)}
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Subjects you teach (Enter to add)</label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, padding: 10, border: '1.5px solid var(--border-default)', borderRadius: 12, background: 'var(--bg-surface)' }}>
                    {data.subjects.map((s, i) => (
                      <span key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 10px', borderRadius: 999, background: 'rgba(79,70,229,0.10)', color: 'var(--brand-600)', fontSize: 12, fontWeight: 500 }}>
                        {s}
                        <button onClick={() => setData(d => ({ ...d, subjects: d.subjects.filter((_, k) => k !== i) }))} style={{ background: 'transparent', color: 'var(--brand-600)', padding: 0, fontSize: 14 }}>×</button>
                      </span>
                    ))}
                    <input
                      value={tagInput}
                      onChange={e => setTagInput(e.target.value)}
                      onKeyDown={e => {
                        if (e.key === 'Enter' && tagInput.trim()) {
                          setData(d => ({ ...d, subjects: [...d.subjects, tagInput.trim()] }));
                          setTagInput('');
                        }
                      }}
                      placeholder="Add subject + Enter"
                      style={{ flex: 1, minWidth: 140, background: 'transparent', border: 'none', outline: 'none', fontSize: 13 }}
                    />
                  </div>
                </div>
              </div>
            </>
          )}

          {step === 'Credentials' && (
            <>
              <h2 style={{ fontFamily: 'Fraunces, serif', fontSize: 28, fontWeight: 600, marginBottom: 20 }}>Where did you study?</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div>
                  <label style={labelStyle}>Highest education</label>
                  <input value={data.education} onChange={e => setData(d => ({ ...d, education: e.target.value }))} placeholder="PhD, IIT Bombay · 2018" style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Notable certification (optional)</label>
                  <input value={data.cert} onChange={e => setData(d => ({ ...d, cert: e.target.value }))} placeholder="Google Cloud ML Engineer · 2021" style={inputStyle} />
                </div>
                <p style={{ fontSize: 12, color: 'var(--text-tertiary)', lineHeight: 1.5 }}>
                  Verified mentors get a ✓ badge and 30% more bookings on average. We&apos;ll ask for proof later.
                </p>
              </div>
            </>
          )}

          {step === 'Availability' && (
            <>
              <h2 style={{ fontFamily: 'Fraunces, serif', fontSize: 28, fontWeight: 600, marginBottom: 20 }}>When are you available?</h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(90px, 1fr))', gap: 8 }}>
                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(d => {
                  const on = data.daysOn[d];
                  return (
                    <button
                      key={d}
                      onClick={() => setData(x => ({ ...x, daysOn: { ...x.daysOn, [d]: !on } }))}
                      style={{
                        padding: 16, borderRadius: 14, textAlign: 'center',
                        background: on ? 'rgba(79,70,229,0.08)' : 'var(--bg-hover)',
                        border: `1.5px solid ${on ? 'var(--brand-500)' : 'var(--border-subtle)'}`,
                        cursor: 'pointer',
                      }}
                    >
                      <div style={{ fontSize: 11, fontWeight: 700, color: on ? 'var(--brand-600)' : 'var(--text-tertiary)', letterSpacing: '0.06em' }}>{d.toUpperCase()}</div>
                      <div style={{ fontSize: 10, marginTop: 6, color: on ? 'var(--brand-500)' : 'var(--text-tertiary)', fontWeight: 600 }}>{on ? '9 AM – 5 PM' : 'Off'}</div>
                    </button>
                  );
                })}
              </div>
              <p style={{ fontSize: 12, color: 'var(--text-tertiary)', marginTop: 16 }}>You can fine-tune time slots later in your dashboard.</p>
            </>
          )}

          {step === 'Pricing' && (
            <>
              <h2 style={{ fontFamily: 'Fraunces, serif', fontSize: 28, fontWeight: 600, marginBottom: 20 }}>Set your prices</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div>
                  <label style={labelStyle}>Voice · 30 min</label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span>₹</span>
                    <input type="number" value={data.voice30} onChange={e => setData(d => ({ ...d, voice30: +e.target.value }))} style={{ ...inputStyle, fontFamily: 'JetBrains Mono, monospace' }} />
                  </div>
                </div>
                <div>
                  <label style={labelStyle}>Video · 60 min</label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span>₹</span>
                    <input type="number" value={data.video60} onChange={e => setData(d => ({ ...d, video60: +e.target.value }))} style={{ ...inputStyle, fontFamily: 'JetBrains Mono, monospace' }} />
                  </div>
                </div>
                <div style={{ padding: 14, background: 'rgba(16,185,129,0.08)', borderRadius: 12, fontSize: 13, color: 'var(--mint-600)', lineHeight: 1.55 }}>
                  Elm Origin takes 15%. At ₹{data.video60}/60-min, you earn <strong>₹{Math.round(data.video60 * 0.85)}</strong> per session.
                </div>
              </div>
            </>
          )}

          {step === 'Review' && (
            <>
              <h2 style={{ fontFamily: 'Fraunces, serif', fontSize: 28, fontWeight: 600, marginBottom: 8 }}>You&apos;re ready to launch</h2>
              <p style={{ fontSize: 13, color: 'var(--text-tertiary)', marginBottom: 20 }}>Here&apos;s what students will see.</p>
              <div style={{ background: 'var(--bg-hover)', borderRadius: 14, padding: 18, marginBottom: 18 }}>
                <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 4 }}>{data.name || 'Your name'}</div>
                <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 10 }}>{data.headline || 'Add a headline'}</div>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 10 }}>
                  {data.subjects.slice(0, 4).map(s => (
                    <span key={s} style={{ padding: '3px 8px', borderRadius: 999, background: 'var(--bg-surface)', fontSize: 11, color: 'var(--text-secondary)' }}>{s}</span>
                  ))}
                </div>
                <div style={{ fontSize: 13, color: 'var(--mint-600)', fontWeight: 600 }}>From ₹{data.voice30}/30min</div>
              </div>
              <p style={{ fontSize: 12, color: 'var(--text-tertiary)', lineHeight: 1.6 }}>
                By going live you agree to our mentor terms. You can pause your profile anytime.
              </p>
            </>
          )}

          <div style={{ display: 'flex', gap: 10, marginTop: 28 }}>
            {stepIdx > 0 && (
              <button onClick={back} style={{ height: 44, padding: '0 18px', borderRadius: 999, background: 'var(--bg-hover)', border: '1px solid var(--border-default)', fontSize: 14, fontWeight: 500 }}>Back</button>
            )}
            <div style={{ flex: 1 }} />
            {stepIdx < STEPS.length - 1 ? (
              <button
                onClick={next}
                style={{ height: 48, padding: '0 24px', borderRadius: 999, background: 'var(--gradient-brand)', color: '#fff', fontSize: 14, fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 8 }}
              >Continue <Icon name="chevronR" size={13} /></button>
            ) : (
              <button
                onClick={finish}
                disabled={submitting}
                style={{ height: 48, padding: '0 24px', borderRadius: 999, background: 'var(--gradient-brand)', color: '#fff', fontSize: 14, fontWeight: 600, opacity: submitting ? 0.7 : 1, display: 'inline-flex', alignItems: 'center', gap: 8 }}
              >{submitting ? 'Going live…' : 'Go to Dashboard →'}</button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
