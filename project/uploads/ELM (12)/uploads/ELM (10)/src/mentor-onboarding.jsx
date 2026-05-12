/* global React, Icon, Avatar */
const { useState: useStateMO, useEffect: useEffectMO, useRef: useRefMO } = React;

// ═══════════════════════════════════════════════════════
// MENTOR APPLICATION + MENTOR SETUP (6 steps)
// Built to match existing AuthCard / Field patterns
// ═══════════════════════════════════════════════════════

const moExpertiseOptions = [
  'Computer Science','Mathematics','Physics','Chemistry','Biology',
  'Engineering','Economics','Business','Law','Medicine',
  'Data Science','Design','Languages','Other'
];

const moAmbientHero = {
  position: 'relative',
  background: 'var(--bg-surface)',
  backgroundImage: 'radial-gradient(ellipse 700px 320px at 92% -10%, rgba(27,43,142,0.06), transparent 60%)',
};

const MOLogo = ({ size = 30 }) => (
  <img src="assets/elm-origin-logo.png" alt="Elm Origin" style={{ height: size, width: 'auto', display: 'block' }}/>
);

// ────────────────────────────────────────────────
// MENTOR APPLICATION PAGE  (route: mentor-apply)
// ────────────────────────────────────────────────
const MentorApplyPage = ({ navigate }) => {
  const [data, setData] = useStateMO({
    name: '', email: '', linkedin: '',
    primary: '', secondary: '', years: '',
    bio: '', files: [],
  });
  const [errors, setErrors] = useStateMO({});
  const [submitted, setSubmitted] = useStateMO(false);
  const [loading, setLoading] = useStateMO(false);
  const [dragOver, setDragOver] = useStateMO(false);

  const update = (patch) => setData(d => ({ ...d, ...patch }));

  const validate = () => {
    const e = {};
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
    setTimeout(() => { setLoading(false); setSubmitted(true); }, 700);
  };

  const onDropFiles = (fileList) => {
    const arr = Array.from(fileList).slice(0, 4).map(f => ({
      name: f.name, size: Math.round(f.size / 1024),
      kind: f.type.includes('pdf') ? 'pdf' : 'img'
    }));
    update({ files: [...data.files, ...arr].slice(0, 4) });
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-base)', overflowY: 'auto' }}>
      {/* ── Hero strip 200px ── */}
      <div style={{
        height: 200, ...moAmbientHero,
        borderBottom: '1px solid var(--border-subtle)',
        display: 'flex', flexDirection: 'column', justifyContent: 'center',
        padding: '0 56px',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'absolute', top: 24, left: 56, right: 56 }}>
          <MOLogo size={28}/>
          <button onClick={() => navigate('landing')} className="btn btn-ghost btn-sm">← Back to landing</button>
        </div>
        <div style={{ maxWidth: 1080, margin: '0 auto', width: '100%', paddingTop: 28 }}>
          <h1 className="font-display" style={{
            fontFamily: 'Fraunces', fontWeight: 800, fontSize: 44, letterSpacing: '-0.02em',
            lineHeight: 1.05, color: 'var(--text-primary)',
            background: 'var(--gradient-brand)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'
          }}>
            Teach what you know. Earn what you deserve.
          </h1>
          <div style={{ display: 'flex', gap: 22, marginTop: 14, flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', gap: 22 }}>
              {[
                { v: '₹40L+', l: 'earned by mentors' },
                { v: '4.8★', l: 'avg rating' },
                { v: '120+', l: 'active mentors' },
              ].map(s => (
                <div key={s.l} style={{ fontFamily: 'Inter' }}>
                  <span style={{ fontFamily: 'JetBrains Mono', fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>{s.v}</span>
                  <span style={{ fontSize: 12, color: 'var(--text-tertiary)', marginLeft: 6 }}>{s.l}</span>
                </div>
              ))}
            </div>
            <div style={{ flex: 1 }}/>
            <div style={{ display: 'flex', gap: 8 }}>
              {[
                { i: '◆', t: 'Your price' },
                { i: '◷', t: 'Your schedule' },
                { i: '★', t: 'Your reputation' },
              ].map(c => (
                <span key={c.t} className="chip chip-brand" style={{ fontSize: 12 }}>
                  <span style={{ fontFamily: 'JetBrains Mono', marginRight: 4, color: 'var(--brand-500)' }}>{c.i}</span>
                  {c.t}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Form card ── */}
      <div style={{ padding: '40px 20px 80px', display: 'flex', justifyContent: 'center' }}>
        <div className="modal-in" style={{
          width: '100%', maxWidth: 580,
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 24, padding: 40,
          boxShadow: 'var(--shadow-xl)',
        }}>
          {!submitted ? (
            <>
              <h2 className="font-display" style={{ fontFamily: 'Fraunces', fontSize: 26, fontWeight: 700, marginBottom: 6 }}>
                Apply to mentor on ELM Origin
              </h2>
              <p style={{ fontSize: 13, color: 'var(--text-tertiary)', marginBottom: 24 }}>
                Most applications get reviewed within 2–3 business days.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <MOLabeled label="Full name" error={errors.name}>
                  <MOInput value={data.name} onChange={e => update({ name: e.target.value })} placeholder="Priya Sharma" error={errors.name}/>
                </MOLabeled>

                <MOLabeled label="Email" error={errors.email}>
                  <MOInput type="email" value={data.email} onChange={e => update({ email: e.target.value })} placeholder="you@email.com" error={errors.email}/>
                </MOLabeled>

                <MOLabeled label="LinkedIn URL" error={errors.linkedin}>
                  <MOInput value={data.linkedin} onChange={e => update({ linkedin: e.target.value })} placeholder="https://linkedin.com/in/…" error={errors.linkedin}/>
                </MOLabeled>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <MOLabeled label="Primary expertise" error={errors.primary}>
                    <MOSelect value={data.primary} onChange={e => update({ primary: e.target.value })} error={errors.primary}>
                      <option value="">Select…</option>
                      {moExpertiseOptions.map(o => <option key={o}>{o}</option>)}
                    </MOSelect>
                  </MOLabeled>
                  <MOLabeled label="Secondary (optional)">
                    <MOSelect value={data.secondary} onChange={e => update({ secondary: e.target.value })}>
                      <option value="">None</option>
                      {moExpertiseOptions.map(o => <option key={o}>{o}</option>)}
                    </MOSelect>
                  </MOLabeled>
                </div>

                <MOLabeled label="Years teaching" error={errors.years}>
                  <div style={{ display: 'flex', gap: 6 }}>
                    {['<1','1–3','3–5','5–10','10+'].map(opt => {
                      const sel = data.years === opt;
                      return (
                        <button key={opt} onClick={() => update({ years: opt })} style={{
                          flex: 1, height: 38, borderRadius: 999, fontSize: 12, fontWeight: 600,
                          background: sel ? 'var(--gradient-brand)' : 'var(--bg-surface)',
                          color: sel ? '#fff' : 'var(--text-secondary)',
                          border: '1px solid ' + (sel ? 'transparent' : 'var(--border-default)'),
                          cursor: 'pointer', transition: 'all 200ms',
                        }}>{opt}</button>
                      );
                    })}
                  </div>
                </MOLabeled>

                <MOLabeled label="Short bio" right={<span style={{ fontSize: 11, color: data.bio.length > 300 ? 'var(--danger-500)' : 'var(--text-tertiary)', fontFamily: 'JetBrains Mono' }}>{data.bio.length}/300</span>}>
                  <textarea value={data.bio} onChange={e => update({ bio: e.target.value.slice(0, 300) })}
                    placeholder="Tell students what you teach and how you teach it…"
                    style={{
                      width: '100%', minHeight: 88, padding: '12px 14px',
                      background: 'var(--bg-surface)',
                      border: '1.5px solid var(--border-default)',
                      borderRadius: 12, fontSize: 14, fontFamily: 'Inter',
                      color: 'var(--text-primary)', resize: 'vertical',
                    }}/>
                </MOLabeled>

                <MOLabeled label="Credentials">
                  <div
                    onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                    onDragLeave={() => setDragOver(false)}
                    onDrop={e => { e.preventDefault(); setDragOver(false); onDropFiles(e.dataTransfer.files); }}
                    style={{
                      border: `2px dashed ${dragOver ? 'var(--brand-500)' : 'var(--border-brand)'}`,
                      background: dragOver ? 'var(--glass-brand-bg)' : 'var(--bg-surface)',
                      borderRadius: 'var(--radius-xl)',
                      padding: 40, textAlign: 'center', cursor: 'pointer',
                      transition: 'all 200ms',
                    }}
                  >
                    <div style={{
                      width: 44, height: 44, borderRadius: 12,
                      background: 'var(--glass-brand-bg)', color: 'var(--brand-600)',
                      display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: 10,
                    }}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><path d="M12 3v12"/>
                      </svg>
                    </div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>
                      Drop your degree, certs, or résumé
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--text-tertiary)', fontFamily: 'JetBrains Mono' }}>PDF, JPG, PNG · up to 4 files</div>
                  </div>
                  {data.files.length > 0 && (
                    <div style={{ marginTop: 10, display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                      {data.files.map((f, i) => (
                        <span key={i} style={{
                          display: 'inline-flex', alignItems: 'center', gap: 8, height: 30, padding: '0 10px 0 8px',
                          background: 'var(--glass-brand-bg)', border: '1px solid var(--border-brand)',
                          borderRadius: 999, fontSize: 12,
                        }}>
                          <span style={{
                            width: 18, height: 18, borderRadius: 4,
                            background: 'var(--brand-500)', color: '#fff',
                            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                            fontFamily: 'JetBrains Mono', fontSize: 9, fontWeight: 700,
                          }}>{f.kind === 'pdf' ? 'PDF' : 'IMG'}</span>
                          <span style={{ color: 'var(--text-primary)', maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{f.name}</span>
                          <button onClick={() => update({ files: data.files.filter((_, k) => k !== i) })} style={{ color: 'var(--text-tertiary)', display: 'inline-flex' }}>
                            <Icon name="x" size={12}/>
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </MOLabeled>

                <button onClick={submit} disabled={loading} className="btn btn-brand btn-lg" style={{ width: '100%', marginTop: 8, background: 'var(--gradient-brand)' }}>
                  {loading ? <span style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: 999, animation: 'orbit 800ms linear infinite' }}/> : 'Submit application'}
                </button>
              </div>
            </>
          ) : (
            <div style={{ textAlign: 'center', padding: '12px 0', animation: 'modalIn 420ms var(--ease-out-expo)' }}>
              <div style={{
                width: 56, height: 56, borderRadius: 999,
                background: 'var(--gradient-brand)',
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                marginBottom: 18, color: '#fff', boxShadow: 'var(--shadow-md)',
              }}>
                <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="5 12 10 17 20 7"/>
                </svg>
              </div>
              <h2 className="font-display italic" style={{ fontFamily: 'Fraunces', fontSize: 26, fontWeight: 700, marginBottom: 8, fontStyle: 'italic' }}>
                Application received, {data.name.split(' ')[0]}!
              </h2>
              <p style={{ fontSize: 14, color: 'var(--text-tertiary)', marginBottom: 26, lineHeight: 1.55 }}>
                We'll email <strong style={{ color: 'var(--text-primary)' }}>{data.email}</strong> within 2–3 business days with next steps.
              </p>
              <button onClick={() => navigate('landing')} className="btn btn-ghost btn-md" style={{ width: '100%' }}>
                Back to ELM Origin
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ── Small form helpers ─────────────────────────────────────
const MOLabeled = ({ label, right, error, children }) => (
  <div>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 6 }}>
      <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)' }}>{label}</label>
      {right}
    </div>
    {children}
    {error && <div style={{ marginTop: 4, fontSize: 11, color: 'var(--danger-500)' }}>{error}</div>}
  </div>
);

const MOInput = ({ error, ...p }) => (
  <input {...p} style={{
    width: '100%', height: 44, padding: '0 14px',
    background: 'var(--bg-surface)',
    border: '1.5px solid ' + (error ? 'var(--danger-500)' : 'var(--border-default)'),
    borderRadius: 12, fontSize: 14, color: 'var(--text-primary)', outline: 'none',
    fontFamily: 'Inter',
  }}/>
);
const MOSelect = ({ error, children, ...p }) => (
  <select {...p} style={{
    width: '100%', height: 44, padding: '0 14px',
    background: 'var(--bg-surface)',
    border: '1.5px solid ' + (error ? 'var(--danger-500)' : 'var(--border-default)'),
    borderRadius: 12, fontSize: 14, color: 'var(--text-primary)', outline: 'none',
  }}>{children}</select>
);

// ────────────────────────────────────────────────
// MENTOR SETUP — 6 steps  (route: mentor-setup)
// ────────────────────────────────────────────────
const MentorSetupFlow = ({ navigate, prefilled, onComplete }) => {
  const [step, setStep] = useStateMO(1);
  const [data, setData] = useStateMO({
    email: prefilled?.email || 'mentor@elmorigin.com',
    password: '',
    photoDataUrl: null,
    headline: '',
    bio: '',
    name: prefilled?.name || 'Priya Sharma',
    primary: prefilled?.primary || 'Computer Science',
    subjects: [],
    levelsBySubject: {},
    languages: ['English'],
    education: [{ degree: '', institution: '', year: '' }],
    certs: [],
    linkedin: prefilled?.linkedin || '',
    days: { Mon: { on: true, slots: [['9:00 AM','5:00 PM']] }, Tue: { on: true, slots: [['9:00 AM','5:00 PM']] }, Wed: { on: true, slots: [['9:00 AM','5:00 PM']] }, Thu: { on: true, slots: [['9:00 AM','5:00 PM']] }, Fri: { on: true, slots: [['9:00 AM','5:00 PM']] }, Sat: { on: false, slots: [] }, Sun: { on: false, slots: [] } },
    buffer: 15,
    timezone: 'IST (UTC+5:30)',
    advance: '1 month',
    voiceOn: true, voice30: 599, voice60: 999,
    videoOn: true, video30: 799, video60: 1299,
    instant: true,
    pendingReview: false,
  });
  const update = (patch) => setData(d => ({ ...d, ...patch }));
  const total = 6;

  const finish = () => onComplete && onComplete();

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-base)', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '40px 20px' }}>
      <div style={{ width: '100%', maxWidth: 580 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 22 }}>
          <MOLogo size={26}/>
          <span style={{ fontSize: 11, fontFamily: 'Inter', fontWeight: 600, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Mentor onboarding</span>
        </div>

        {/* progress bar */}
        <div className="modal-in" style={{
          background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)',
          borderRadius: 24, padding: 36, boxShadow: 'var(--shadow-xl)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 }}>
            <div style={{ display: 'flex', gap: 5, flex: 1 }}>
              {Array.from({ length: total }).map((_, i) => (
                <div key={i} style={{
                  height: 3, flex: 1, borderRadius: 999,
                  background: i < step ? 'var(--gradient-brand)' : 'var(--bg-hover)',
                  transition: 'background 320ms var(--ease-smooth)'
                }}/>
              ))}
            </div>
            <span style={{ marginLeft: 12, fontSize: 11, color: 'var(--text-tertiary)', fontFamily: 'JetBrains Mono', fontWeight: 600 }}>Step {step} of {total}</span>
          </div>

          {step > 1 && (
            <button onClick={() => setStep(s => s - 1)} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: 'var(--text-tertiary)', fontSize: 13, fontWeight: 500, marginBottom: 16 }}>
              <Icon name="chevronL" size={14}/> Back
            </button>
          )}

          {step === 1 && <MOStep1 data={data} update={update} next={() => setStep(2)}/>}
          {step === 2 && <MOStep2 data={data} update={update} next={() => setStep(3)}/>}
          {step === 3 && <MOStep3 data={data} update={update} next={() => setStep(4)}/>}
          {step === 4 && <MOStep4 data={data} update={update} next={() => setStep(5)}/>}
          {step === 5 && <MOStep5 data={data} update={update} next={() => { update({ pendingReview: !!prefilled?.fromApply }); setStep(6); }}/>}
          {step === 6 && <MOStep6 data={data} finish={finish}/>}
        </div>
      </div>
    </div>
  );
};

// ── STEP 1: Account ──
const MOStep1 = ({ data, update, next }) => {
  const score = (() => {
    const pw = data.password; if (!pw) return 0;
    let s = 0; if (pw.length >= 8) s++; if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) s++; if (/[0-9]/.test(pw)) s++; if (/[^A-Za-z0-9]/.test(pw) && pw.length >= 12) s++;
    return s;
  })();
  const can = score >= 2;
  const labels = ['', 'Weak', 'Fair', 'Good', 'Strong'];
  const colors = ['', 'var(--danger-500)', 'var(--gold-500)', 'var(--mint-500)', 'var(--brand-500)'];
  return (
    <>
      <h2 className="font-display" style={{ fontFamily: 'Fraunces', fontSize: 26, fontWeight: 700, marginBottom: 6 }}>Create your mentor account</h2>
      <p style={{ fontSize: 13, color: 'var(--text-tertiary)', marginBottom: 22 }}>We'll use this to send you booking notifications and payouts.</p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <MOLabeled label="Email">
          <MOInput value={data.email} onChange={e => update({ email: e.target.value })}/>
        </MOLabeled>
        <MOLabeled label="Password" right={data.password && <span style={{ fontSize: 11, color: colors[score], fontWeight: 700 }}>{labels[score]}</span>}>
          <MOInput type="password" value={data.password} onChange={e => update({ password: e.target.value })} placeholder="At least 8 characters"/>
          <div style={{ display: 'flex', gap: 4, marginTop: 8 }}>
            {[1,2,3,4].map(i => (
              <div key={i} style={{ flex: 1, height: 3, borderRadius: 999, background: i <= score ? colors[score] : 'var(--bg-hover)', transition: 'background 240ms' }}/>
            ))}
          </div>
        </MOLabeled>
      </div>
      <button onClick={next} disabled={!can} className="btn btn-brand btn-lg" style={{ width: '100%', marginTop: 26, opacity: can ? 1 : 0.5, background: 'var(--gradient-brand)' }}>
        Continue <Icon name="chevronR" size={14}/>
      </button>
    </>
  );
};

// ── STEP 2: Profile & Photo ──
const MOStep2 = ({ data, update, next }) => {
  const [showCrop, setShowCrop] = useStateMO(false);
  const [aiSuggesting, setAiSuggesting] = useStateMO(false);
  const fileRef = useRefMO(null);

  const onPhoto = (file) => {
    const url = URL.createObjectURL(file);
    update({ photoDataUrl: url });
    setShowCrop(true);
  };

  const aiHelp = () => {
    setAiSuggesting(true);
    setTimeout(() => {
      const sample = "I help students bridge the gap between intuition and rigor in computer science. After 7 years teaching algorithms at IIT and mentoring 200+ engineers into FAANG roles, I've found most learners aren't stuck on syntax — they're stuck on framing. We'll work through problems the way you'd actually face them on the job.";
      update({ bio: sample.slice(0, 500) });
      setAiSuggesting(false);
    }, 900);
  };

  const can = !!data.photoDataUrl && data.headline.length > 0 && data.headline.length <= 80 && data.name.length > 0;

  return (
    <>
      <h2 className="font-display" style={{ fontFamily: 'Fraunces', fontSize: 26, fontWeight: 700, marginBottom: 6 }}>Your mentor profile</h2>
      <p style={{ fontSize: 13, color: 'var(--text-tertiary)', marginBottom: 22 }}>This is what students see first. Keep it warm, specific, and honest.</p>

      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 24 }}>
        <input ref={fileRef} type="file" accept="image/*" hidden onChange={e => e.target.files[0] && onPhoto(e.target.files[0])}/>
        <button onClick={() => fileRef.current.click()} style={{
          width: 160, height: 160, borderRadius: 999, position: 'relative',
          background: data.photoDataUrl ? `center/cover url(${data.photoDataUrl})` : 'var(--glass-brand-bg)',
          border: '2px dashed ' + (data.photoDataUrl ? 'transparent' : 'var(--border-brand)'),
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', overflow: 'hidden',
          boxShadow: data.photoDataUrl ? 'var(--shadow-md)' : 'none',
        }}>
          {!data.photoDataUrl && (
            <div style={{ textAlign: 'center', color: 'var(--brand-600)' }}>
              <div style={{ fontSize: 28, lineHeight: 1, marginBottom: 6 }}>📷</div>
              <div style={{ fontSize: 11, fontWeight: 600 }}>Required</div>
              <div style={{ fontSize: 10, color: 'var(--text-tertiary)', marginTop: 2 }}>Click to upload</div>
            </div>
          )}
        </button>
        <div style={{ marginTop: 10, fontSize: 11, color: 'var(--text-tertiary)' }}>
          {data.photoDataUrl ? <button onClick={() => fileRef.current.click()} style={{ color: 'var(--brand-500)', fontWeight: 600 }}>Change photo</button> : 'PNG or JPG · 400×400 minimum'}
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <MOLabeled label="Full name (as it appears on your degree)">
          <MOInput value={data.name} onChange={e => update({ name: e.target.value })}/>
        </MOLabeled>
        <MOLabeled label="Professional headline" right={<span style={{ fontSize: 11, fontFamily: 'JetBrains Mono', color: data.headline.length > 80 ? 'var(--danger-500)' : 'var(--text-tertiary)' }}>{data.headline.length}/80</span>}>
          <MOInput value={data.headline} onChange={e => update({ headline: e.target.value.slice(0, 80) })} placeholder="e.g. CS Professor at IIT Delhi · Algorithms · DP"/>
        </MOLabeled>
        <MOLabeled label="Short bio" right={
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <button onClick={aiHelp} disabled={aiSuggesting} className="btn btn-ghost btn-sm" style={{ height: 26, padding: '0 10px', fontSize: 11 }}>
              {aiSuggesting ? <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><span className="nova-dot"/><span className="nova-dot"/><span className="nova-dot"/></span> : <>✨ AI Help me write</>}
            </button>
            <span style={{ fontSize: 11, fontFamily: 'JetBrains Mono', color: data.bio.length > 500 ? 'var(--danger-500)' : 'var(--text-tertiary)' }}>{data.bio.length}/500</span>
          </div>
        }>
          <textarea value={data.bio} onChange={e => update({ bio: e.target.value.slice(0, 500) })}
            placeholder="What's your teaching philosophy? Who do you love working with?"
            style={{
              width: '100%', minHeight: 120, padding: '12px 14px',
              background: 'var(--bg-surface)', border: '1.5px solid var(--border-default)',
              borderRadius: 12, fontSize: 14, fontFamily: 'Inter', color: 'var(--text-primary)',
              resize: 'vertical', lineHeight: 1.55,
            }}/>
        </MOLabeled>
      </div>

      <button onClick={next} disabled={!can} className="btn btn-brand btn-lg" style={{ width: '100%', marginTop: 24, opacity: can ? 1 : 0.5, background: 'var(--gradient-brand)' }}>
        Continue <Icon name="chevronR" size={14}/>
      </button>

      {showCrop && (
        <div onClick={() => setShowCrop(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(13,23,87,0.55)', backdropFilter: 'blur(8px)', zIndex: 600, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div onClick={e => e.stopPropagation()} className="modal-in" style={{ width: 380, background: 'var(--bg-surface)', borderRadius: 20, padding: 24, boxShadow: 'var(--shadow-xl)' }}>
            <div className="font-display" style={{ fontFamily: 'Fraunces', fontSize: 18, fontWeight: 700, marginBottom: 14 }}>Crop your photo</div>
            <div style={{ width: 200, height: 200, borderRadius: 999, background: `center/cover url(${data.photoDataUrl})`, margin: '0 auto 18px', boxShadow: 'inset 0 0 0 4px var(--bg-surface), 0 0 0 1px var(--border-subtle)' }}/>
            <button onClick={() => setShowCrop(false)} className="btn btn-brand btn-md" style={{ width: '100%', background: 'var(--gradient-brand)' }}>Use this photo</button>
          </div>
        </div>
      )}
    </>
  );
};

// ── STEP 3: Expertise ──
const MOStep3 = ({ data, update, next }) => {
  const [draft, setDraft] = useStateMO('');
  const addSubject = (s) => {
    const v = (s || draft).trim();
    if (!v || data.subjects.length >= 10 || data.subjects.includes(v)) return;
    update({ subjects: [...data.subjects, v], levelsBySubject: { ...data.levelsBySubject, [v]: ['Intermediate'] } });
    setDraft('');
  };
  const removeSubject = (s) => {
    const next = { ...data.levelsBySubject }; delete next[s];
    update({ subjects: data.subjects.filter(x => x !== s), levelsBySubject: next });
  };
  const toggleLevel = (s, lvl) => {
    const cur = data.levelsBySubject[s] || [];
    const nxt = cur.includes(lvl) ? cur.filter(x => x !== lvl) : [...cur, lvl];
    update({ levelsBySubject: { ...data.levelsBySubject, [s]: nxt } });
  };
  const langs = [
    { f: '🇮🇳', n: 'Hindi' }, { f: '🇮🇳', n: 'Tamil' }, { f: '🇮🇳', n: 'Telugu' },
    { f: '🌐', n: 'English' }, { f: '🇩🇪', n: 'German' }, { f: '🇫🇷', n: 'French' }, { f: '🇪🇸', n: 'Spanish' },
  ];
  const toggleLang = (n) => {
    const has = data.languages.includes(n);
    update({ languages: has ? data.languages.filter(x => x !== n) : [...data.languages, n] });
  };

  return (
    <>
      <h2 className="font-display" style={{ fontFamily: 'Fraunces', fontSize: 26, fontWeight: 700, marginBottom: 6 }}>Your expertise</h2>
      <p style={{ fontSize: 13, color: 'var(--text-tertiary)', marginBottom: 20 }}>What can students book you to teach?</p>

      <MOLabeled label="Primary field">
        <MOSelect value={data.primary} onChange={e => update({ primary: e.target.value })}>
          {moExpertiseOptions.map(o => <option key={o}>{o}</option>)}
        </MOSelect>
      </MOLabeled>

      <div style={{ marginTop: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 6 }}>
          <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)' }}>Subjects you teach</label>
          <span style={{ fontSize: 11, color: 'var(--text-tertiary)', fontFamily: 'JetBrains Mono' }}>{data.subjects.length}/10</span>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 8 }}>
          {data.subjects.map(s => (
            <span key={s} style={{
              display: 'inline-flex', alignItems: 'center', gap: 6, height: 30, padding: '0 8px 0 12px',
              background: 'var(--glass-brand-bg)', border: '1px solid var(--border-brand)',
              borderRadius: 999, fontSize: 12, fontWeight: 500, color: 'var(--brand-700)',
              animation: 'modalIn 240ms var(--ease-out-expo)',
            }}>
              {s}
              <button onClick={() => removeSubject(s)} style={{ color: 'var(--brand-500)', display: 'inline-flex' }}><Icon name="x" size={11}/></button>
            </span>
          ))}
        </div>
        <input value={draft} onChange={e => setDraft(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addSubject(); } }}
          placeholder="Type a subject and press Enter (e.g. Algorithms)"
          style={{ width: '100%', height: 40, padding: '0 14px', background: 'var(--bg-surface)', border: '1.5px solid var(--border-default)', borderRadius: 10, fontSize: 13 }}
        />

        {data.subjects.length > 0 && (
          <div style={{ marginTop: 12, padding: 14, background: 'var(--bg-base)', borderRadius: 12, border: '1px solid var(--border-subtle)' }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10 }}>Levels per subject</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {data.subjects.map(s => (
                <div key={s} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ flex: 1, fontSize: 13, fontWeight: 500 }}>{s}</span>
                  <div style={{ display: 'flex', gap: 4 }}>
                    {['Beginner','Intermediate','Advanced'].map(lvl => {
                      const sel = (data.levelsBySubject[s] || []).includes(lvl);
                      return (
                        <button key={lvl} onClick={() => toggleLevel(s, lvl)} style={{
                          height: 26, padding: '0 10px', borderRadius: 999, fontSize: 11, fontWeight: 600,
                          background: sel ? 'var(--gradient-brand)' : 'var(--bg-surface)',
                          color: sel ? '#fff' : 'var(--text-secondary)',
                          border: '1px solid ' + (sel ? 'transparent' : 'var(--border-default)'),
                        }}>{lvl}</button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div style={{ marginTop: 18 }}>
        <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6, display: 'block' }}>Teaching languages</label>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {langs.map(l => {
            const sel = data.languages.includes(l.n);
            return (
              <button key={l.n} onClick={() => toggleLang(l.n)} style={{
                display: 'inline-flex', alignItems: 'center', gap: 6, height: 32, padding: '0 12px', borderRadius: 999, fontSize: 12, fontWeight: 500,
                background: sel ? 'var(--gradient-brand)' : 'var(--bg-surface)',
                color: sel ? '#fff' : 'var(--text-secondary)',
                border: '1px solid ' + (sel ? 'transparent' : 'var(--border-default)'),
              }}><span>{l.f}</span> {l.n}</button>
            );
          })}
        </div>
      </div>

      <MOInlineList
        title="Education" addLabel="+ Add Education"
        items={data.education}
        cols={['Degree', 'Institution', 'Year']}
        onChange={(items) => update({ education: items })}
      />
      <MOInlineList
        title="Certifications (optional)" addLabel="+ Add Certification"
        items={data.certs} cols={['Name', 'Issuer', 'Year']}
        showUpload onChange={(items) => update({ certs: items })}
      />

      <MOLabeled label="LinkedIn URL"><MOInput value={data.linkedin} onChange={e => update({ linkedin: e.target.value })} placeholder="https://linkedin.com/in/…"/></MOLabeled>

      <button onClick={next} disabled={data.subjects.length === 0} className="btn btn-brand btn-lg" style={{ width: '100%', marginTop: 22, opacity: data.subjects.length === 0 ? 0.5 : 1, background: 'var(--gradient-brand)' }}>
        Continue <Icon name="chevronR" size={14}/>
      </button>
    </>
  );
};

const MOInlineList = ({ title, addLabel, items, cols, showUpload, onChange }) => {
  const add = () => onChange([...items, Object.fromEntries(cols.map(c => [c.toLowerCase(), '']))]);
  const remove = (i) => onChange(items.filter((_, k) => k !== i));
  const set = (i, key, v) => onChange(items.map((it, k) => k === i ? { ...it, [key]: v } : it));
  return (
    <div style={{ marginTop: 18 }}>
      <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 8, display: 'block' }}>{title}</label>
      {items.map((it, i) => (
        <div key={i} style={{ display: 'grid', gridTemplateColumns: showUpload ? '1.5fr 1.5fr 80px auto auto' : '1.5fr 1.5fr 80px auto', gap: 6, marginBottom: 6, alignItems: 'center' }}>
          {cols.map(c => (
            <input key={c} value={it[c.toLowerCase()] || ''} onChange={e => set(i, c.toLowerCase(), e.target.value)} placeholder={c}
              style={{ height: 36, padding: '0 10px', background: 'var(--bg-surface)', border: '1px solid var(--border-default)', borderRadius: 8, fontSize: 12 }}/>
          ))}
          {showUpload && <button className="btn btn-ghost btn-sm" style={{ height: 36, padding: '0 8px', fontSize: 11 }}>📎</button>}
          <button onClick={() => remove(i)} style={{ width: 28, height: 28, borderRadius: 8, color: 'var(--text-tertiary)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icon name="x" size={12}/>
          </button>
        </div>
      ))}
      <button onClick={add} style={{ fontSize: 12, color: 'var(--brand-500)', fontWeight: 600 }}>{addLabel}</button>
    </div>
  );
};

// ── STEP 4: Availability ──
const MOStep4 = ({ data, update, next }) => {
  const days = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
  const toggleDay = (d) => {
    const day = data.days[d];
    const next = { ...data.days, [d]: { on: !day.on, slots: !day.on && day.slots.length === 0 ? [['9:00 AM','5:00 PM']] : day.slots } };
    update({ days: next });
  };
  const setSlot = (d, i, k, v) => {
    const slots = data.days[d].slots.map((s, idx) => idx === i ? (k === 0 ? [v, s[1]] : [s[0], v]) : s);
    update({ days: { ...data.days, [d]: { ...data.days[d], slots } } });
  };
  const addSlot = (d) => update({ days: { ...data.days, [d]: { ...data.days[d], slots: [...data.days[d].slots, ['10:00 AM','12:00 PM']] } } });
  const rmSlot = (d, i) => update({ days: { ...data.days, [d]: { ...data.days[d], slots: data.days[d].slots.filter((_, k) => k !== i) } } });
  const times = ['8:00 AM','9:00 AM','10:00 AM','11:00 AM','12:00 PM','1:00 PM','2:00 PM','3:00 PM','4:00 PM','5:00 PM','6:00 PM','7:00 PM','8:00 PM','9:00 PM'];

  return (
    <>
      <h2 className="font-display" style={{ fontFamily: 'Fraunces', fontSize: 26, fontWeight: 700, marginBottom: 6 }}>Set your schedule</h2>
      <p style={{ fontSize: 13, color: 'var(--text-tertiary)', marginBottom: 20 }}>You can change all of this later. We'll only show students times you've explicitly opened.</p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 6, marginBottom: 18 }}>
        {days.map(d => {
          const on = data.days[d].on;
          return (
            <div key={d} style={{ background: on ? 'var(--glass-brand-bg)' : 'var(--bg-base)', border: '1px solid ' + (on ? 'var(--border-brand)' : 'var(--border-subtle)'), borderRadius: 12, padding: 8, textAlign: 'center', transition: 'all 200ms' }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: on ? 'var(--brand-700)' : 'var(--text-tertiary)', marginBottom: 6 }}>{d}</div>
              <button onClick={() => toggleDay(d)} style={{
                width: '100%', height: 22, borderRadius: 999, fontSize: 10, fontWeight: 700,
                background: on ? 'var(--gradient-brand)' : 'var(--bg-hover)',
                color: on ? '#fff' : 'var(--text-tertiary)',
              }}>{on ? 'ON' : 'OFF'}</button>
            </div>
          );
        })}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 18 }}>
        {days.filter(d => data.days[d].on).map(d => (
          <div key={d} style={{ padding: 10, background: 'var(--bg-base)', borderRadius: 10, border: '1px solid var(--border-subtle)' }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>{d}</div>
            {data.days[d].slots.map((s, i) => (
              <div key={i} style={{ display: 'flex', gap: 6, alignItems: 'center', marginBottom: 4 }}>
                <select value={s[0]} onChange={e => setSlot(d, i, 0, e.target.value)} style={{ flex: 1, height: 32, padding: '0 10px', borderRadius: 8, border: '1px solid var(--border-default)', fontSize: 12, background: 'var(--bg-surface)' }}>
                  {times.map(t => <option key={t}>{t}</option>)}
                </select>
                <span style={{ color: 'var(--text-muted)' }}>→</span>
                <select value={s[1]} onChange={e => setSlot(d, i, 1, e.target.value)} style={{ flex: 1, height: 32, padding: '0 10px', borderRadius: 8, border: '1px solid var(--border-default)', fontSize: 12, background: 'var(--bg-surface)' }}>
                  {times.map(t => <option key={t}>{t}</option>)}
                </select>
                <button onClick={() => rmSlot(d, i)} style={{ width: 24, height: 24, color: 'var(--text-tertiary)' }}><Icon name="x" size={12}/></button>
              </div>
            ))}
            <button onClick={() => addSlot(d)} style={{ fontSize: 11, color: 'var(--brand-500)', fontWeight: 600, marginTop: 4 }}>+ Add another slot</button>
          </div>
        ))}
      </div>

      <MOLabeled label="Buffer between sessions">
        <div style={{ display: 'flex', gap: 6 }}>
          {[0, 15, 30].map(b => {
            const sel = data.buffer === b;
            return (
              <button key={b} onClick={() => update({ buffer: b })} style={{
                flex: 1, height: 36, borderRadius: 999, fontSize: 12, fontWeight: 600,
                background: sel ? 'var(--gradient-brand)' : 'var(--bg-surface)', color: sel ? '#fff' : 'var(--text-secondary)',
                border: '1px solid ' + (sel ? 'transparent' : 'var(--border-default)'),
              }}>{b === 0 ? 'None' : `${b} min`}</button>
            );
          })}
        </div>
      </MOLabeled>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 14 }}>
        <MOLabeled label="Timezone">
          <MOSelect value={data.timezone} onChange={e => update({ timezone: e.target.value })}>
            <option>IST (UTC+5:30)</option><option>UTC</option><option>EST (UTC-5)</option><option>PST (UTC-8)</option><option>GMT</option><option>SGT (UTC+8)</option>
          </MOSelect>
        </MOLabeled>
        <MOLabeled label="Advance booking window">
          <div style={{ display: 'flex', gap: 4 }}>
            {['1 week','2 weeks','1 month','3 months'].map(o => {
              const sel = data.advance === o;
              return (
                <button key={o} onClick={() => update({ advance: o })} style={{
                  flex: 1, height: 36, borderRadius: 8, fontSize: 11, fontWeight: 600,
                  background: sel ? 'var(--gradient-brand)' : 'var(--bg-surface)', color: sel ? '#fff' : 'var(--text-secondary)',
                  border: '1px solid ' + (sel ? 'transparent' : 'var(--border-default)'),
                }}>{o}</button>
              );
            })}
          </div>
        </MOLabeled>
      </div>

      <button onClick={next} className="btn btn-brand btn-lg" style={{ width: '100%', marginTop: 22, background: 'var(--gradient-brand)' }}>
        Continue <Icon name="chevronR" size={14}/>
      </button>
    </>
  );
};

// ── STEP 5: Pricing ──
const MOStep5 = ({ data, update, next }) => {
  const earn = (n) => Math.round((n || 0) * 0.85);
  return (
    <>
      <h2 className="font-display" style={{ fontFamily: 'Fraunces', fontSize: 26, fontWeight: 700, marginBottom: 6 }}>Set your session rates</h2>
      <p style={{ fontSize: 13, color: 'var(--text-tertiary)', marginBottom: 18 }}>Most new mentors start around ₹599 / 30 min and adjust upward as reviews come in.</p>

      <div style={{
        background: 'var(--gold-100)', borderLeft: '3px solid var(--gold-500)',
        padding: '12px 14px', borderRadius: 10, fontSize: 12, color: 'var(--gold-700)',
        marginBottom: 18, lineHeight: 1.5,
      }}>
        <strong>ELM Origin takes 15% platform fee.</strong> You keep 85%. Payouts every Monday.
      </div>

      <MOPriceRow icon="🔊" label="Voice Call" data={data} update={update} on={data.voiceOn} toggleKey="voiceOn" k30="voice30" k60="voice60"/>
      <MOPriceRow icon="📹" label="Video Meet" data={data} update={update} on={data.videoOn} toggleKey="videoOn" k30="video30" k60="video60"/>

      <div style={{ marginTop: 18, padding: 14, background: 'var(--bg-base)', borderRadius: 12, border: '1px solid var(--border-subtle)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
          <div>
            <div style={{ fontSize: 13, fontWeight: 600 }}>Instant booking</div>
            <div style={{ fontSize: 11, color: data.instant ? 'var(--mint-700)' : 'var(--gold-700)', marginTop: 2 }}>
              {data.instant ? 'Students can book you directly' : 'You review each request'}
            </div>
          </div>
          <button onClick={() => update({ instant: !data.instant })} style={{
            width: 44, height: 24, borderRadius: 999, position: 'relative',
            background: data.instant ? 'var(--gradient-brand)' : 'var(--bg-hover)',
            transition: 'background 200ms',
          }}>
            <span style={{ position: 'absolute', top: 2, left: data.instant ? 22 : 2, width: 20, height: 20, borderRadius: 999, background: '#fff', boxShadow: 'var(--shadow-sm)', transition: 'left 200ms var(--ease-spring)' }}/>
          </button>
        </div>
      </div>

      <button onClick={next} className="btn btn-brand btn-lg" style={{ width: '100%', marginTop: 22, background: 'var(--gradient-brand)' }}>
        Continue <Icon name="chevronR" size={14}/>
      </button>
    </>
  );
};

const MOPriceRow = ({ icon, label, data, update, on, toggleKey, k30, k60 }) => (
  <div style={{ marginBottom: 12, padding: 14, background: 'var(--bg-surface)', borderRadius: 12, border: '1px solid var(--border-subtle)' }}>
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: on ? 12 : 0 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <span style={{ fontSize: 16 }}>{icon}</span>
        <span style={{ fontSize: 13, fontWeight: 700 }}>{label}</span>
      </div>
      <button onClick={() => update({ [toggleKey]: !on })} style={{
        width: 40, height: 22, borderRadius: 999, position: 'relative',
        background: on ? 'var(--gradient-brand)' : 'var(--bg-hover)',
      }}>
        <span style={{ position: 'absolute', top: 2, left: on ? 20 : 2, width: 18, height: 18, borderRadius: 999, background: '#fff', boxShadow: 'var(--shadow-sm)', transition: 'left 200ms var(--ease-spring)' }}/>
      </button>
    </div>
    {on && (
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        {[{ d: '30 min', k: k30 }, { d: '60 min', k: k60 }].map(s => (
          <div key={s.d}>
            <div style={{ fontSize: 11, color: 'var(--text-tertiary)', fontWeight: 600, marginBottom: 4 }}>{s.d}</div>
            <div style={{ display: 'flex', alignItems: 'center', height: 38, padding: '0 10px', background: 'var(--bg-base)', border: '1px solid var(--border-default)', borderRadius: 10 }}>
              <span style={{ color: 'var(--text-tertiary)', marginRight: 4, fontFamily: 'JetBrains Mono', fontSize: 13 }}>₹</span>
              <input type="number" value={data[s.k] || ''} onChange={e => update({ [s.k]: parseInt(e.target.value) || 0 })} style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', fontSize: 13, fontFamily: 'JetBrains Mono', color: 'var(--text-primary)' }}/>
            </div>
            <div style={{ fontSize: 11, color: 'var(--mint-700)', fontWeight: 600, marginTop: 4, fontFamily: 'JetBrains Mono' }}>You earn ₹{earnHelper(data[s.k])}</div>
          </div>
        ))}
      </div>
    )}
  </div>
);
const earnHelper = (n) => Math.round((n || 0) * 0.85);

// ── STEP 6: Welcome ──
const MOStep6 = ({ data, finish }) => {
  const pending = data.pendingReview;
  return (
    <div style={{ textAlign: 'center', padding: '8px 0' }}>
      <div style={{
        width: 72, height: 72, borderRadius: 999,
        background: pending ? 'var(--gold-100)' : 'var(--gradient-brand)',
        color: pending ? 'var(--gold-700)' : '#fff',
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        marginBottom: 18, boxShadow: 'var(--shadow-md)',
        animation: 'modalIn 480ms var(--ease-spring)',
      }}>
        <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          {pending ? <><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></> : <polyline points="5 12 10 17 20 7"/>}
        </svg>
      </div>
      <h2 className="font-display italic" style={{ fontFamily: 'Fraunces', fontSize: 28, fontWeight: 700, fontStyle: 'italic', marginBottom: 10 }}>
        {pending ? 'Almost there!' : "You're all set!"}
      </h2>
      <p style={{ fontSize: 14, color: 'var(--text-secondary)', maxWidth: 420, margin: '0 auto 28px', lineHeight: 1.55 }}>
        {pending
          ? 'Your profile is ready. Our team is doing a final review of your credentials — you\'ll get an email within 2–3 business days, and your dashboard is unlocked in the meantime.'
          : 'Your mentor profile is live. Students can find you, and your dashboard is ready.'}
      </p>
      <button onClick={finish} className="btn btn-brand btn-lg" style={{ width: '100%', maxWidth: 320, background: 'var(--gradient-brand)' }}>
        Go to Mentor Dashboard <Icon name="chevronR" size={14}/>
      </button>
    </div>
  );
};

window.MentorApplyPage = MentorApplyPage;
window.MentorSetupFlow = MentorSetupFlow;
