/* global React, Icon, Avatar */
const { useState, useEffect, useRef } = React;

// ═══════════════════════════════════════
// AUTH — Login, Signup (5 steps), Forgot, Reset
// ═══════════════════════════════════════

// ─── Shared shell ───
const AuthCard = ({ children, maxW = 480 }) => (
  <div style={{
    minHeight: '100vh',
    background: 'var(--bg-base)',
    backgroundImage: 'radial-gradient(ellipse 900px 500px at 90% -5%, rgba(27,43,142,0.06) 0%, transparent 60%), radial-gradient(ellipse 600px 400px at 0% 100%, rgba(245,158,11,0.04) 0%, transparent 60%)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    padding: '40px 20px', overflowY: 'auto'
  }}>
    <div className="modal-in" style={{
      width: '100%', maxWidth: maxW,
      background: 'var(--bg-surface)',
      border: '1px solid var(--border-subtle)',
      borderRadius: 28, padding: 48,
      boxShadow: 'var(--shadow-xl)'
    }}>
      {children}
    </div>
  </div>
);

const Logo = ({ size = 32 }) => (
  <img src="assets/elm-origin-logo.png" alt="Elm Origin" style={{ height: size, width: 'auto', display: 'block' }}/>
);

const ProgressBar = ({ step, total }) => (
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32 }}>
    <div style={{ display: 'flex', gap: 6, flex: 1 }}>
      {Array.from({ length: total }).map((_, i) => (
        <div key={i} style={{
          height: 3, flex: 1, borderRadius: 999,
          background: i < step ? 'var(--gradient-brand)' : 'var(--bg-hover)',
          transition: 'background 320ms var(--ease-smooth)'
        }}/>
      ))}
    </div>
    <span className="label-sm" style={{ marginLeft: 14, fontSize: 11 }}>Step {step} of {total}</span>
  </div>
);

const Field = ({ icon, type = 'text', value, onChange, placeholder, error, valid, rightSlot, autoFocus, onBlur }) => {
  const [focus, setFocus] = useState(false);
  const borderColor = error ? 'var(--danger-500)' : valid ? 'var(--mint-500)' : focus ? 'var(--brand-500)' : 'var(--border-default)';
  return (
    <div>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 10,
        height: 48, padding: '0 14px',
        background: 'var(--bg-surface)',
        border: '1.5px solid ' + borderColor,
        borderRadius: 12,
        transition: 'border-color 200ms, box-shadow 200ms',
        boxShadow: focus ? '0 0 0 4px ' + (error ? 'rgba(225,29,72,0.10)' : 'rgba(27,43,142,0.10)') : 'none',
      }}>
        {icon && <span style={{ color: 'var(--text-tertiary)' }}><Icon name={icon} size={16}/></span>}
        <input
          type={type} value={value} onChange={onChange}
          onFocus={() => setFocus(true)}
          onBlur={(e) => { setFocus(false); onBlur && onBlur(e); }}
          placeholder={placeholder} autoFocus={autoFocus}
          style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', color: 'var(--text-primary)', fontSize: 14 }}
        />
        {valid && <span style={{ color: 'var(--mint-600)' }}><Icon name="check" size={16} stroke={2.5}/></span>}
        {error && <span style={{ color: 'var(--danger-500)' }}><Icon name="x" size={16} stroke={2.5}/></span>}
        {rightSlot}
      </div>
      {error && <div style={{ marginTop: 6, fontSize: 12, color: 'var(--danger-500)' }}>{error}</div>}
    </div>
  );
};

const SocialButton = ({ provider }) => (
  <button className="btn btn-ghost btn-lg" style={{ width: '100%', justifyContent: 'center', gap: 10 }}>
    {provider === 'google' ? (
      <svg width="18" height="18" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
    ) : (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/></svg>
    )}
    Continue with {provider === 'google' ? 'Google' : 'Apple'}
  </button>
);

const Divider = ({ text = 'or' }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '20px 0' }}>
    <div style={{ flex: 1, height: 1, background: 'var(--border-subtle)' }}/>
    <span style={{ fontSize: 11, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600 }}>{text}</span>
    <div style={{ flex: 1, height: 1, background: 'var(--border-subtle)' }}/>
  </div>
);

// ─── Password strength ───
const passwordStrength = (pw) => {
  if (!pw) return { score: 0, label: '', color: 'var(--bg-hover)' };
  let score = 0;
  if (pw.length >= 8) score++;
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw) && pw.length >= 12) score++;
  const map = [
    { score: 0, label: '', color: 'var(--bg-hover)' },
    { score: 1, label: 'Weak', color: 'var(--danger-500)' },
    { score: 2, label: 'Fair', color: 'var(--gold-500)' },
    { score: 3, label: 'Good', color: 'var(--mint-500)' },
    { score: 4, label: 'Strong', color: 'var(--brand-500)' },
  ];
  return map[score];
};

const StrengthMeter = ({ pw }) => {
  const { score, label, color } = passwordStrength(pw);
  return (
    <div style={{ marginTop: 8 }}>
      <div style={{ display: 'flex', gap: 4 }}>
        {[1,2,3,4].map(i => (
          <div key={i} style={{
            flex: 1, height: 3, borderRadius: 999,
            background: i <= score ? (i === 4 && score === 4 ? 'var(--gradient-brand)' : color) : 'var(--bg-hover)',
            transition: 'background 240ms var(--ease-smooth)'
          }}/>
        ))}
      </div>
      {label && <div style={{ fontSize: 11, marginTop: 4, color, fontWeight: 600 }}>{label}</div>}
    </div>
  );
};

// ═══════════════════════════════════════
// SIGNUP — 5 steps
// ═══════════════════════════════════════

const SignupFlow = ({ navigate, onComplete }) => {
  const [step, setStep] = useState(1);
  const [data, setData] = useState({
    name: '', email: '', password: '', emailValid: null,
    avatarIdx: 0, displayName: '', pronouns: '',
    subjects: [],
    studyHours: 3, prep: 'JEE', style: 'both',
  });

  const update = (patch) => setData(d => ({ ...d, ...patch }));

  if (step === 5) return <SignupWelcome data={data} onEnter={() => onComplete(data)}/>;

  return (
    <AuthCard>
      <ProgressBar step={step} total={5}/>
      {step > 1 && (
        <button onClick={() => setStep(s => s - 1)} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: 'var(--text-tertiary)', fontSize: 13, fontWeight: 500, marginBottom: 18 }}>
          <Icon name="chevronL" size={14}/> Back
        </button>
      )}
      {step === 1 && <SignupStep1 data={data} update={update} next={() => setStep(2)} navigate={navigate}/>}
      {step === 2 && <SignupStep2 data={data} update={update} next={() => setStep(3)}/>}
      {step === 3 && <SignupStep3 data={data} update={update} next={() => setStep(4)}/>}
      {step === 4 && <SignupStep4 data={data} update={update} next={() => setStep(5)}/>}
    </AuthCard>
  );
};

// ─── Step 1: Account ───
const SignupStep1 = ({ data, update, next, navigate }) => {
  const [showPw, setShowPw] = useState(false);
  const [emailErr, setEmailErr] = useState('');
  const [loading, setLoading] = useState(false);

  const validateEmail = (e) => {
    const v = e.target.value;
    const ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
    if (v && !ok) setEmailErr('Enter a valid email'); else setEmailErr('');
    update({ emailValid: v && ok });
  };

  const { score } = passwordStrength(data.password);
  const canSubmit = data.name.trim() && data.emailValid && score >= 2;

  const submit = () => {
    if (!canSubmit) return;
    setLoading(true);
    setTimeout(() => { setLoading(false); next(); }, 700);
  };

  return (
    <>
      <div style={{ marginBottom: 24 }}><Logo size={32}/></div>
      <h2 className="font-display" style={{ fontSize: 30, fontWeight: 700, marginBottom: 8 }}>Create your account</h2>
      <p style={{ fontSize: 14, color: 'var(--text-tertiary)', marginBottom: 24 }}>Join thousands of students learning together.</p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 4 }}>
        <SocialButton provider="google"/>
        <SocialButton provider="apple"/>
      </div>
      <Divider/>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <Field icon="profile" placeholder="Full name" value={data.name} onChange={e => update({ name: e.target.value })}/>
        <Field icon="mail" type="email" placeholder="Email address" value={data.email}
          onChange={e => update({ email: e.target.value })} onBlur={validateEmail}
          valid={data.emailValid === true} error={emailErr}/>
        <div>
          <Field icon="settings" type={showPw ? 'text' : 'password'} placeholder="Password" value={data.password}
            onChange={e => update({ password: e.target.value })}
            rightSlot={
              <button type="button" onClick={() => setShowPw(s => !s)} style={{ color: 'var(--text-tertiary)' }}>
                <Icon name={showPw ? 'x' : 'check'} size={14}/>
              </button>
            }/>
          <StrengthMeter pw={data.password}/>
        </div>
      </div>

      <button onClick={submit} disabled={!canSubmit || loading} className="btn btn-brand btn-lg" style={{ width: '100%', marginTop: 24, opacity: !canSubmit ? 0.5 : 1, cursor: !canSubmit ? 'not-allowed' : 'pointer' }}>
        {loading ? <span style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: 999, animation: 'orbit 800ms linear infinite' }}/> : <>Continue <Icon name="chevronR" size={14}/></>}
      </button>

      <p style={{ fontSize: 11, color: 'var(--text-muted)', textAlign: 'center', marginTop: 14, lineHeight: 1.5 }}>
        By continuing, you agree to our <a style={{ color: 'var(--brand-500)' }}>Terms</a> and <a style={{ color: 'var(--brand-500)' }}>Privacy Policy</a>.
      </p>
      <p style={{ fontSize: 13, color: 'var(--text-tertiary)', textAlign: 'center', marginTop: 18 }}>
        Already have an account? <a onClick={() => navigate('login')} style={{ color: 'var(--brand-500)', cursor: 'pointer', fontWeight: 600 }}>Log in</a>
      </p>
    </>
  );
};

// ─── Step 2: Profile ───
const SignupStep2 = ({ data, update, next }) => {
  const avatars = [
    { hue: 220, glyph: '🧑‍🚀' }, { hue: 30, glyph: '🧑‍🎨' }, { hue: 160, glyph: '🧑‍🔬' }, { hue: 285, glyph: '🧑‍🎓' },
    { hue: 195, glyph: '🧑‍💻' }, { hue: 350, glyph: '🧑‍🏫' }, { hue: 60, glyph: '🧑‍🍳' }, { hue: 0, glyph: '🧑‍🚒' },
  ];
  const displayName = data.displayName || data.name.split(' ')[0];

  return (
    <>
      <h2 className="font-display" style={{ fontSize: 28, fontWeight: 700, marginBottom: 6 }}>Set up your profile</h2>
      <p style={{ fontSize: 14, color: 'var(--text-tertiary)', marginBottom: 26 }}>Pick an avatar — you can change it later.</p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 22 }}>
        {avatars.map((a, i) => {
          const selected = data.avatarIdx === i;
          return (
            <button key={i} onClick={() => update({ avatarIdx: i })}
              style={{
                width: 64, height: 64, borderRadius: 999,
                background: 'linear-gradient(135deg, oklch(85% 0.10 ' + a.hue + '), oklch(72% 0.16 ' + a.hue + '))',
                fontSize: 28, lineHeight: '64px', textAlign: 'center',
                border: selected ? '3px solid transparent' : '3px solid transparent',
                boxShadow: selected ? '0 0 0 3px var(--brand-500), 0 6px 20px rgba(27,43,142,0.30)' : 'none',
                opacity: selected ? 1 : 0.7,
                transform: selected ? 'scale(1.08)' : 'scale(1)',
                transition: 'all 280ms var(--ease-spring)',
                margin: '0 auto', cursor: 'pointer'
              }}
              onMouseEnter={e => { if (!selected) { e.currentTarget.style.boxShadow = '0 0 0 2px var(--border-brand)'; e.currentTarget.style.transform = 'scale(1.04)'; e.currentTarget.style.opacity = 1; } }}
              onMouseLeave={e => { if (!selected) { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.opacity = 0.7; } }}
            >
              {a.glyph}
            </button>
          );
        })}
      </div>

      <button className="btn btn-ghost btn-sm" style={{ width: '100%', marginBottom: 22 }}>
        <Icon name="plus" size={14}/> Upload your own photo
      </button>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 22 }}>
        <div>
          <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6, display: 'block' }}>Display name</label>
          <Field value={displayName} onChange={e => update({ displayName: e.target.value })}/>
        </div>
        <div>
          <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6, display: 'block' }}>Pronouns <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>(optional)</span></label>
          <select value={data.pronouns} onChange={e => update({ pronouns: e.target.value })}
            style={{ width: '100%', height: 48, padding: '0 14px', background: 'var(--bg-surface)', border: '1.5px solid var(--border-default)', borderRadius: 12, fontSize: 14, color: 'var(--text-primary)' }}>
            <option value="">Select…</option>
            <option>she/her</option><option>he/him</option><option>they/them</option><option>Prefer not to say</option>
          </select>
        </div>
      </div>

      <button onClick={next} className="btn btn-brand btn-lg" style={{ width: '100%' }}>Continue <Icon name="chevronR" size={14}/></button>
    </>
  );
};

// ─── Step 3: Subjects ───
const SignupStep3 = ({ data, update, next }) => {
  const SUBJECTS = ['Mathematics','Physics','Chemistry','Biology','Computer Science','Engineering','Economics','Business','Law','Medicine','Writing','History','Languages','Design','Psychology','Political Science','Data Science','Other'];
  const toggle = (s) => {
    const has = data.subjects.includes(s);
    if (has) update({ subjects: data.subjects.filter(x => x !== s) });
    else if (data.subjects.length < 3) update({ subjects: [...data.subjects, s] });
  };
  const full = data.subjects.length >= 3;

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 6 }}>
        <h2 className="font-display" style={{ fontSize: 28, fontWeight: 700 }}>What are you studying?</h2>
        <span className="label-sm" style={{ fontSize: 11 }}>{data.subjects.length}/3 selected</span>
      </div>
      <p style={{ fontSize: 14, color: 'var(--text-tertiary)', marginBottom: 22 }}>Pick up to 3 subjects you want to focus on.</p>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 26 }}>
        {SUBJECTS.map(s => {
          const sel = data.subjects.includes(s);
          const dim = full && !sel;
          return (
            <button key={s} onClick={() => !dim && toggle(s)} style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              height: 36, padding: '0 14px',
              borderRadius: 999, fontSize: 13, fontWeight: 500,
              background: sel ? 'var(--gradient-brand)' : 'var(--bg-surface)',
              color: sel ? '#fff' : 'var(--text-secondary)',
              border: sel ? '1px solid transparent' : '1px solid var(--border-default)',
              opacity: dim ? 0.4 : 1,
              cursor: dim ? 'not-allowed' : 'pointer',
              transition: 'all 200ms var(--ease-smooth)',
              transform: sel ? 'scale(1.02)' : 'scale(1)',
              boxShadow: sel ? '0 4px 14px rgba(27,43,142,0.25)' : 'none'
            }}
              onMouseEnter={e => { if (!sel && !dim) e.currentTarget.style.borderColor = 'var(--border-brand)'; }}
              onMouseLeave={e => { if (!sel && !dim) e.currentTarget.style.borderColor = 'var(--border-default)'; }}
            >
              {sel && <Icon name="check" size={12} stroke={2.5}/>}
              {s}
            </button>
          );
        })}
      </div>

      <button onClick={next} disabled={data.subjects.length === 0} className="btn btn-brand btn-lg" style={{ width: '100%', opacity: data.subjects.length === 0 ? 0.5 : 1, cursor: data.subjects.length === 0 ? 'not-allowed' : 'pointer' }}>
        Continue <Icon name="chevronR" size={14}/>
      </button>
    </>
  );
};

// ─── Step 4: Goals ───
const SignupStep4 = ({ data, update, next }) => {
  const hours = data.studyHours;
  const pct = ((hours - 0.5) / (8 - 0.5)) * 100;

  return (
    <>
      <h2 className="font-display" style={{ fontSize: 28, fontWeight: 700, marginBottom: 6 }}>Set your first goal.</h2>
      <p style={{ fontSize: 14, color: 'var(--text-tertiary)', marginBottom: 28 }}>You can adjust these anytime.</p>

      <div style={{ marginBottom: 28 }}>
        <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 18, display: 'block' }}>Daily study target</label>
        <div style={{ position: 'relative', padding: '36px 0 8px' }}>
          <div style={{
            position: 'absolute', top: 0, left: `calc(${pct}% - 30px)`,
            background: 'var(--glass-brand-bg)', border: '1px solid var(--border-brand)',
            color: 'var(--brand-600)', padding: '4px 10px', borderRadius: 999,
            fontFamily: 'JetBrains Mono', fontSize: 11, fontWeight: 600,
            transition: 'left 100ms'
          }}>
            {hours < 1 ? `${Math.round(hours*60)}m` : `${hours}h${(hours % 1) ? ' 30m' : ''}`}
          </div>
          <input type="range" min="0.5" max="8" step="0.5" value={hours} onChange={e => update({ studyHours: parseFloat(e.target.value) })}
            style={{
              width: '100%', height: 6, appearance: 'none', borderRadius: 999,
              background: `linear-gradient(to right, var(--brand-500) 0%, var(--brand-400) ${pct}%, var(--bg-hover) ${pct}%, var(--bg-hover) 100%)`,
              outline: 'none', cursor: 'pointer'
            }}/>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--text-tertiary)', marginTop: 10, fontFamily: 'JetBrains Mono' }}>
            <span>30m</span><span>4h</span><span>8h</span>
          </div>
        </div>
      </div>

      <div style={{ marginBottom: 24 }}>
        <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 8, display: 'block' }}>I'm preparing for</label>
        <select value={data.prep} onChange={e => update({ prep: e.target.value })}
          style={{ width: '100%', height: 48, padding: '0 14px', background: 'var(--bg-surface)', border: '1.5px solid var(--border-default)', borderRadius: 12, fontSize: 14, color: 'var(--text-primary)' }}>
          <option>JEE</option><option>GATE</option><option>UPSC</option><option>CAT</option>
          <option>University Semester</option><option>Professional Certification</option><option>Other</option>
        </select>
      </div>

      <div style={{ marginBottom: 28 }}>
        <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 10, display: 'block' }}>Study style</label>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
          {[
            { id: 'solo', emoji: '🎧', label: 'Solo & silent' },
            { id: 'group', emoji: '👥', label: 'With others' },
            { id: 'both', emoji: '🔀', label: 'Both' },
          ].map(o => {
            const sel = data.style === o.id;
            return (
              <button key={o.id} onClick={() => update({ style: o.id })} style={{
                padding: '16px 10px',
                background: sel ? 'var(--glass-brand-bg)' : 'var(--bg-surface)',
                border: '1.5px solid ' + (sel ? 'var(--border-brand)' : 'var(--border-subtle)'),
                borderRadius: 14, textAlign: 'center',
                boxShadow: sel ? 'var(--shadow-brand)' : 'none',
                transition: 'all 200ms var(--ease-smooth)', cursor: 'pointer',
                color: sel ? 'var(--brand-600)' : 'var(--text-secondary)'
              }}>
                <div style={{ fontSize: 24, marginBottom: 6 }}>{o.emoji}</div>
                <div style={{ fontSize: 12, fontWeight: 600 }}>{o.label}</div>
              </button>
            );
          })}
        </div>
      </div>

      <button onClick={next} className="btn btn-brand btn-lg" style={{ width: '100%' }}>Finish setup <Icon name="chevronR" size={14}/></button>
    </>
  );
};

// ─── Step 5: Welcome (cinematic) ───
const SignupWelcome = ({ data, onEnter }) => {
  const [phase, setPhase] = useState(1);
  const firstName = (data.displayName || data.name).split(' ')[0] || 'friend';

  useEffect(() => {
    const t1 = setTimeout(() => setPhase(2), 700);
    const t2 = setTimeout(() => setPhase(3), 1400);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  return (
    <div style={{
      minHeight: '100vh', background: 'var(--bg-base)',
      backgroundImage: 'radial-gradient(ellipse 1200px 600px at 50% 0%, rgba(27,43,142,0.08) 0%, transparent 60%), radial-gradient(ellipse 800px 500px at 50% 100%, rgba(245,158,11,0.05) 0%, transparent 60%)',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      padding: 32, position: 'relative', overflow: 'hidden'
    }}>
      {/* Phase 1 wordmark */}
      {phase === 1 && (
        <div style={{ display: 'flex', gap: 6 }}>
          {'ELM Origin'.split('').map((ch, i) => (
            <span key={i} className="font-display" style={{
              fontSize: 56, fontWeight: 700, color: 'var(--brand-600)',
              animation: `slideInTop 480ms var(--ease-out-expo) ${i * 30}ms both`
            }}>{ch === ' ' ? '\u00A0' : ch}</span>
          ))}
        </div>
      )}

      {/* Phase 2 + 3 */}
      {phase >= 2 && (
        <>
          <div style={{ position: 'absolute', top: 32, left: 32, animation: 'fadeInUp 600ms var(--ease-out-expo)' }}>
            <Logo size={28}/>
          </div>
          <div style={{ textAlign: 'center', maxWidth: 720, animation: 'fadeInUp 700ms var(--ease-out-expo)' }}>
            <h1 className="font-display italic" style={{ fontSize: 60, fontWeight: 800, lineHeight: 1.05, marginBottom: 16 }}>
              Welcome to <span style={{ background: 'var(--gradient-brand)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>ELM Origin</span>, {firstName}.
            </h1>
            <p style={{ fontSize: 17, color: 'var(--text-secondary)', marginBottom: 36, animation: 'fadeInUp 600ms 200ms var(--ease-out-expo) both', opacity: 0 }}>
              Three things to try first — or just dive in.
            </p>

            {phase === 3 && (
              <>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, maxWidth: 620, margin: '0 auto 36px' }}>
                  {[
                    { icon: '🤖', title: 'Try Nova AI', sub: 'Your study copilot', bg: 'var(--glass-ai-bg)', border: 'rgba(16,185,129,0.30)' },
                    { icon: '📚', title: 'Join a Study Room', sub: 'Live with others', bg: 'var(--glass-brand-bg)', border: 'var(--border-brand)' },
                    { icon: '👤', title: 'Find a Mentor', sub: 'Real expert guidance', bg: 'var(--glass-amber-bg)', border: 'rgba(245,158,11,0.30)' },
                  ].map((c, i) => (
                    <div key={i} style={{
                      padding: 18, borderRadius: 16, background: c.bg, border: '1px solid ' + c.border,
                      textAlign: 'left',
                      animation: `fadeInUp 500ms var(--ease-out-expo) ${i * 150 + 100}ms both`, opacity: 0
                    }}>
                      <div style={{ fontSize: 28, marginBottom: 8 }}>{c.icon}</div>
                      <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>{c.title}</div>
                      <div style={{ fontSize: 12, color: 'var(--text-tertiary)', marginTop: 2 }}>{c.sub}</div>
                    </div>
                  ))}
                </div>
                <button onClick={onEnter} className="btn btn-brand btn-xl" style={{ animation: 'fadeInUp 500ms 600ms var(--ease-out-expo) both', opacity: 0 }}>
                  Enter ELM Origin <Icon name="chevronR" size={16}/>
                </button>
              </>
            )}
          </div>
        </>
      )}
    </div>
  );
};

// ═══════════════════════════════════════
// LOGIN PAGE
// ═══════════════════════════════════════

const LoginPage = ({ navigate, onLogin }) => {
  const [role, setRole] = useState('student');
  const [email, setEmail] = useState('');
  const [pw, setPw] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [err, setErr] = useState({});
  const [shake, setShake] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [loading, setLoading] = useState(false);
  const [lockedUntil, setLockedUntil] = useState(null);
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    if (lockedUntil) {
      const t = setInterval(() => setNow(Date.now()), 1000);
      return () => clearInterval(t);
    }
  }, [lockedUntil]);

  const remaining = lockedUntil ? Math.max(0, Math.ceil((lockedUntil - now) / 1000)) : 0;
  const isLocked = remaining > 0;
  const mm = String(Math.floor(remaining / 60)).padStart(2, '0');
  const ss = String(remaining % 60).padStart(2, '0');

  const submit = () => {
    if (isLocked) return;
    setErr({});
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setErr({ email: 'Enter a valid email' }); return; }
    if (!pw) { setErr({ pw: 'Enter your password' }); return; }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      // demo: any password "demo1234" succeeds, otherwise fail
      if (pw === 'demo1234' || pw.length >= 8) {
        onLogin(role === 'mentor');
      } else {
        const newAttempts = attempts + 1;
        setAttempts(newAttempts);
        setErr({ pw: 'Incorrect password' });
        setShake(true);
        setTimeout(() => setShake(false), 400);
        if (newAttempts >= 5) setLockedUntil(Date.now() + 5 * 60 * 1000);
      }
    }, 600);
  };

  return (
    <AuthCard>
      <div style={{ marginBottom: 24, textAlign: 'center' }}><Logo size={36}/></div>

      {/* Role toggle */}
      <div style={{ display: 'flex', padding: 4, background: 'var(--bg-subtle)', borderRadius: 999, marginBottom: 26, position: 'relative' }}>
        <div style={{
          position: 'absolute', top: 4, bottom: 4,
          width: 'calc(50% - 4px)',
          left: role === 'student' ? 4 : 'calc(50%)',
          background: 'var(--gradient-brand)', borderRadius: 999,
          transition: 'left 240ms var(--ease-spring)',
          boxShadow: '0 4px 14px rgba(27,43,142,0.30)'
        }}/>
        {['student', 'mentor'].map(r => (
          <button key={r} onClick={() => setRole(r)} style={{
            flex: 1, height: 40, position: 'relative', zIndex: 1,
            color: role === r ? '#fff' : 'var(--text-secondary)',
            fontSize: 13, fontWeight: 600, textTransform: 'capitalize',
            transition: 'color 200ms'
          }}>{r}</button>
        ))}
      </div>

      <h2 className="font-display" style={{ fontSize: 28, fontWeight: 700, marginBottom: 6 }}>
        {role === 'mentor' ? 'Mentor portal' : 'Welcome back'}
      </h2>
      <p style={{ fontSize: 14, color: 'var(--text-tertiary)', marginBottom: 24 }}>
        {role === 'mentor' ? 'Sign in to your mentor dashboard.' : 'Pick up where you left off.'}
      </p>

      {isLocked && (
        <div style={{ background: 'var(--gold-100)', border: '1px solid rgba(245,158,11,0.30)', color: 'var(--gold-700)', padding: '12px 14px', borderRadius: 12, fontSize: 13, marginBottom: 18, display: 'flex', alignItems: 'center', gap: 10 }}>
          <Icon name="x" size={16}/>
          <div style={{ flex: 1 }}>Too many attempts. Try again in <span style={{ fontFamily: 'JetBrains Mono', fontWeight: 600 }}>{mm}:{ss}</span></div>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 14, animation: shake ? 'shake 360ms' : 'none' }}>
        <Field icon="mail" type="email" placeholder="Email address" value={email} onChange={e => { setEmail(e.target.value); setErr(p => ({ ...p, email: undefined })); }} error={err.email}/>
        <div>
          <Field icon="settings" type={showPw ? 'text' : 'password'} placeholder="Password" value={pw} onChange={e => { setPw(e.target.value); setErr(p => ({ ...p, pw: undefined })); }} error={err.pw}
            rightSlot={<button onClick={() => setShowPw(s => !s)} style={{ color: 'var(--text-tertiary)' }}><Icon name={showPw ? 'x' : 'check'} size={14}/></button>}/>
          <div style={{ marginTop: 8, textAlign: 'right' }}>
            <a onClick={() => navigate('forgot-password')} style={{ fontSize: 12, color: 'var(--brand-500)', cursor: 'pointer', fontWeight: 600 }}>Forgot password?</a>
          </div>
        </div>
      </div>

      <button onClick={submit} disabled={loading || isLocked} className="btn btn-brand btn-lg" style={{ width: '100%', marginTop: 22, opacity: isLocked ? 0.5 : 1 }}>
        {loading ? <span style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: 999, animation: 'orbit 800ms linear infinite' }}/> : <>Log in <Icon name="chevronR" size={14}/></>}
      </button>

      <Divider/>
      <SocialButton provider="google"/>

      <p style={{ fontSize: 13, color: 'var(--text-tertiary)', textAlign: 'center', marginTop: 22 }}>
        New to ELM Origin? <a onClick={() => navigate('signup')} style={{ color: 'var(--brand-500)', cursor: 'pointer', fontWeight: 600 }}>Create an account</a>
      </p>

      <style>{`@keyframes shake { 0%,100% { transform: translateX(0); } 20% { transform: translateX(-6px); } 40% { transform: translateX(6px); } 60% { transform: translateX(-4px); } 80% { transform: translateX(4px); } }`}</style>
    </AuthCard>
  );
};

// ═══════════════════════════════════════
// FORGOT PASSWORD
// ═══════════════════════════════════════

const ForgotPasswordPage = ({ navigate }) => {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');

  const submit = () => {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setErr('Enter a valid email'); return; }
    setErr(''); setLoading(true);
    setTimeout(() => { setLoading(false); setSent(true); }, 700);
  };

  return (
    <AuthCard>
      <div style={{ marginBottom: 24, textAlign: 'center' }}><Logo size={36}/></div>
      {!sent ? (
        <>
          <h2 className="font-display" style={{ fontSize: 28, fontWeight: 700, marginBottom: 6, textAlign: 'center' }}>Reset your password</h2>
          <p style={{ fontSize: 14, color: 'var(--text-tertiary)', marginBottom: 24, textAlign: 'center' }}>Enter your email and we'll send a reset link.</p>
          <Field icon="mail" type="email" placeholder="Email address" value={email} onChange={e => { setEmail(e.target.value); setErr(''); }} error={err}/>
          <button onClick={submit} disabled={loading} className="btn btn-brand btn-lg" style={{ width: '100%', marginTop: 18 }}>
            {loading ? <span style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: 999, animation: 'orbit 800ms linear infinite' }}/> : 'Send reset link'}
          </button>
          <button onClick={() => navigate('login')} className="btn btn-ghost btn-md" style={{ width: '100%', marginTop: 10 }}>← Back to login</button>
        </>
      ) : (
        <div style={{ textAlign: 'center', animation: 'fadeInUp 500ms var(--ease-spring)' }}>
          <div style={{
            width: 80, height: 80, borderRadius: 999,
            background: 'var(--gradient-brand)',
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            marginBottom: 20, color: '#fff',
            boxShadow: '0 12px 36px rgba(27,43,142,0.30)'
          }}>
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
          </div>
          <h2 className="font-display italic" style={{ fontSize: 26, fontWeight: 700, marginBottom: 8 }}>Check your inbox</h2>
          <p style={{ fontSize: 14, color: 'var(--text-tertiary)', marginBottom: 24 }}>We sent a reset link to <strong style={{ color: 'var(--text-primary)' }}>{email}</strong></p>
          <div style={{ display: 'flex', gap: 16, justifyContent: 'center', marginBottom: 22 }}>
            <a style={{ color: 'var(--brand-500)', cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>Resend email</a>
            <span style={{ color: 'var(--text-muted)' }}>·</span>
            <a onClick={() => setSent(false)} style={{ color: 'var(--brand-500)', cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>Change email</a>
          </div>
          <button onClick={() => navigate('reset-password')} className="btn btn-ghost btn-md" style={{ width: '100%', marginBottom: 8 }}>I have a reset link →</button>
          <button onClick={() => navigate('login')} className="btn btn-ghost btn-md" style={{ width: '100%' }}>← Back to login</button>
        </div>
      )}
    </AuthCard>
  );
};

// ═══════════════════════════════════════
// RESET PASSWORD
// ═══════════════════════════════════════

const ResetPasswordPage = ({ navigate }) => {
  const [pw, setPw] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [done, setDone] = useState(false);
  const [count, setCount] = useState(3);
  const [loading, setLoading] = useState(false);

  const match = pw && confirm && pw === confirm;
  const mismatch = confirm && pw !== confirm;
  const { score } = passwordStrength(pw);
  const canSubmit = score >= 2 && match;

  const submit = () => {
    if (!canSubmit) return;
    setLoading(true);
    setTimeout(() => { setLoading(false); setDone(true); }, 700);
  };

  useEffect(() => {
    if (!done) return;
    const t = setInterval(() => setCount(c => c - 1), 1000);
    const goto = setTimeout(() => navigate('login'), 3000);
    return () => { clearInterval(t); clearTimeout(goto); };
  }, [done]);

  return (
    <AuthCard>
      <div style={{ marginBottom: 24, textAlign: 'center' }}><Logo size={36}/></div>
      {!done ? (
        <>
          <h2 className="font-display" style={{ fontSize: 28, fontWeight: 700, marginBottom: 6, textAlign: 'center' }}>Set a new password</h2>
          <p style={{ fontSize: 14, color: 'var(--text-tertiary)', marginBottom: 24, textAlign: 'center' }}>Choose something strong — you'll use it from now on.</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <Field icon="settings" type={showPw ? 'text' : 'password'} placeholder="New password" value={pw} onChange={e => setPw(e.target.value)}
                rightSlot={<button onClick={() => setShowPw(s => !s)} style={{ color: 'var(--text-tertiary)' }}><Icon name={showPw ? 'x' : 'check'} size={14}/></button>}/>
              <StrengthMeter pw={pw}/>
            </div>
            <Field icon="settings" type={showPw ? 'text' : 'password'} placeholder="Confirm password" value={confirm} onChange={e => setConfirm(e.target.value)}
              valid={match} error={mismatch ? "Passwords don't match" : ''}/>
          </div>
          <button onClick={submit} disabled={!canSubmit || loading} className="btn btn-brand btn-lg" style={{ width: '100%', marginTop: 22, opacity: canSubmit ? 1 : 0.5 }}>
            {loading ? <span style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: 999, animation: 'orbit 800ms linear infinite' }}/> : 'Reset password'}
          </button>
        </>
      ) : (
        <div style={{ textAlign: 'center', animation: 'fadeInUp 500ms var(--ease-spring)' }}>
          <div style={{
            width: 80, height: 80, borderRadius: 999,
            background: 'var(--gradient-ai)',
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            marginBottom: 20, color: '#fff',
            boxShadow: 'var(--shadow-ai)',
            animation: 'pulseRing 1.6s ease-out infinite'
          }}>
            <Icon name="check" size={42} stroke={3}/>
          </div>
          <h2 className="font-display italic" style={{ fontSize: 26, fontWeight: 700, marginBottom: 8 }}>Password updated!</h2>
          <p style={{ fontSize: 14, color: 'var(--text-tertiary)' }}>Redirecting to login in <span style={{ fontFamily: 'JetBrains Mono', color: 'var(--brand-600)', fontWeight: 600 }}>{Math.max(0, count)}…</span></p>
        </div>
      )}
    </AuthCard>
  );
};

window.SignupFlow = SignupFlow;
window.LoginPage = LoginPage;
window.ForgotPasswordPage = ForgotPasswordPage;
window.ResetPasswordPage = ResetPasswordPage;
