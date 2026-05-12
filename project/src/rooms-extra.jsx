/* global React, Icon, Avatar, StatusRing */
const { useState: useStateRX, useEffect: useEffectRX, useRef: useRefRX } = React;

// ═══════════════════════════════════════════════════════
// FIX 1 — CREATE ROOM MODAL
// FIX 2 — PARTICIPANTS DRAWER
// FIX 3 — SESSION CONTROLS / RoomSession
// FIX 4 — GROUP INTERVIEW ROOM
// FIX 5 — SUBSCRIPTION GATE MODAL (6 variants)
// ═══════════════════════════════════════════════════════

// ── Shared modal backdrop ─────────────────────
const RXBackdrop = ({ children, onClose }) => (
  <div onClick={onClose} style={{
    position: 'fixed', inset: 0, zIndex: 600,
    background: 'rgba(7,10,24,0.70)', backdropFilter: 'blur(8px)',
    display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24,
  }}>
    <div onClick={e => e.stopPropagation()}>{children}</div>
  </div>
);

// ─────────────────────────────────────────────────────────
// FIX 1 — CREATE ROOM MODAL
// ─────────────────────────────────────────────────────────
const RX_SUBJECTS = ['Algorithms','Calculus','Linear Algebra','Quantum Physics','Organic Chemistry','Molecular Biology','Mechanical Eng','Microeconomics','Marketing','Constitutional Law','Anatomy','Statistics','UX Research','Mandarin'];
const RX_TYPES = [
  { id: 'public', icon: '🌐', label: 'Public', desc: 'Anyone can join' },
  { id: 'collab', icon: '💬', label: 'Collaborative', desc: 'Discuss freely' },
  { id: 'private', icon: '🔒', label: 'Private', desc: 'Password protected' },
  { id: 'interview', icon: '🎤', label: 'Group Interview', desc: 'Practice mock rounds' },
];

const CreateRoomModal = ({ onClose, onCreate, user }) => {
  const u = user || window.USER || { plan: 'Free', collabRoomsCreatedToday: 0 };
  const collabLeft = (window.collabRoomsLeft ? window.collabRoomsLeft(u) : Infinity);
  const collabQuota = (window.COLLAB_ROOM_QUOTA ? window.COLLAB_ROOM_QUOTA[u.plan] : Infinity);
  const [name, setName] = useStateRX('');
  const [subject, setSubject] = useStateRX('');
  const [subjQuery, setSubjQuery] = useStateRX('');
  const [subjOpen, setSubjOpen] = useStateRX(false);
  const [type, setType] = useStateRX('public');
  const [password, setPassword] = useStateRX('');
  const [mode, setMode] = useStateRX('discussion');
  const [pomo, setPomo] = useStateRX('classic');
  const [customWork, setCustomWork] = useStateRX(45);
  const [customBreak, setCustomBreak] = useStateRX(10);
  const [maxP, setMaxP] = useStateRX(10);
  const [inviteOnly, setInviteOnly] = useStateRX(false);
  const [iFormat, setIFormat] = useStateRX('Technical');
  const [iSpeakerTime, setISpeakerTime] = useStateRX(5);
  const [evaluator, setEvaluator] = useStateRX(true);
  const [submitting, setSubmitting] = useStateRX(false);
  const [exiting, setExiting] = useStateRX(false);

  useEffectRX(() => {
    const onKey = (e) => { if (e.key === 'Escape') doClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  useEffectRX(() => {
    if (type === 'interview') setMaxP(6);
  }, [type]);

  const doClose = () => { setExiting(true); setTimeout(onClose, 220); };

  const submit = () => {
    if (!name.trim() || !subject) return;
    if (type === 'collab' && !(window.canCreateCollabRoom ? window.canCreateCollabRoom(u) : true)) {
      if (window.openGate) window.openGate('collab-room', { plan: u.plan, quota: collabQuota });
      return;
    }
    setSubmitting(true);
    if (type === 'collab' && window.updateUser) {
      window.updateUser(prev => ({ ...prev, collabRoomsCreatedToday: (prev.collabRoomsCreatedToday || 0) + 1 }));
    }
    setTimeout(() => {
      const newRoom = {
        id: 'r-' + Date.now(),
        name, subject, type, mode,
        pomodoro: pomo === 'custom' ? `${customWork}/${customBreak}` : pomo,
        max: maxP, count: 1,
        host: 'You',
        format: type === 'interview' ? iFormat : null,
        speakerTime: type === 'interview' ? iSpeakerTime : null,
        evaluator: type === 'interview' ? evaluator : null,
      };
      onCreate(newRoom);
    }, 800);
  };

  const filteredSubj = RX_SUBJECTS.filter(s => s.toLowerCase().includes(subjQuery.toLowerCase()));

  return (
    <RXBackdrop onClose={doClose}>
      <div style={{
        width: 480, maxHeight: '85vh', overflow: 'auto',
        background: 'var(--bg-surface)',
        borderRadius: 'var(--radius-2xl, 24px)',
        border: '1px solid var(--border-subtle)',
        boxShadow: 'var(--shadow-xl)',
        animation: exiting ? 'modalOut 200ms var(--ease-in-expo) forwards' : 'modalIn 350ms var(--ease-out-expo)',
      }}>
        {/* Header */}
        <div style={{ padding: '22px 28px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-subtle)' }}>
          <div>
            <div className="font-display" style={{ fontFamily: 'Fraunces', fontSize: 22, fontWeight: 700 }}>Start a study room</div>
            <div style={{ fontSize: 12, color: 'var(--text-tertiary)', marginTop: 2 }}>Pick how you want to focus together.</div>
          </div>
          <button onClick={doClose} style={{ width: 30, height: 30, borderRadius: 8, color: 'var(--text-tertiary)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icon name="x" size={16}/>
          </button>
        </div>

        <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 18 }}>
          {/* Name */}
          <div>
            <RXLabel>Room name<RXCounter v={name.length} m={48}/></RXLabel>
            <input value={name} onChange={e => setName(e.target.value.slice(0, 48))} placeholder="Wednesday DP grind"
              style={rxInput}/>
          </div>

          {/* Subject searchable */}
          <div style={{ position: 'relative' }}>
            <RXLabel>Subject</RXLabel>
            <button onClick={() => setSubjOpen(!subjOpen)} style={{ ...rxInput, textAlign: 'left', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: subject ? 'var(--text-primary)' : 'var(--text-muted)' }}>{subject || 'Select a subject…'}</span>
              <Icon name="chevronD" size={14}/>
            </button>
            {subjOpen && (
              <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, marginTop: 4, background: 'var(--bg-surface)', border: '1px solid var(--border-default)', borderRadius: 12, maxHeight: 220, overflowY: 'auto', zIndex: 10, boxShadow: 'var(--shadow-md)' }}>
                <input autoFocus value={subjQuery} onChange={e => setSubjQuery(e.target.value)} placeholder="Search…"
                  style={{ width: '100%', height: 36, padding: '0 12px', border: 'none', borderBottom: '1px solid var(--border-subtle)', background: 'transparent', fontSize: 13, outline: 'none' }}/>
                {filteredSubj.map(s => (
                  <button key={s} onClick={() => { setSubject(s); setSubjOpen(false); setSubjQuery(''); }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    style={{ display: 'block', width: '100%', textAlign: 'left', padding: '8px 12px', fontSize: 13, color: 'var(--text-primary)' }}>{s}</button>
                ))}
              </div>
            )}
          </div>

          {/* Room type 2x2 */}
          <div>
            <RXLabel>Room type</RXLabel>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              {type === 'collab' && u.plan !== 'Elite' && (
                <div style={{ gridColumn: '1 / -1', fontSize: 11, color: collabLeft > 0 ? 'var(--text-tertiary)' : 'var(--danger-500)', marginBottom: 4 }}>
                  {collabLeft > 0 ? `${collabLeft} collaborative room${collabLeft === 1 ? '' : 's'} left today` : `Daily limit reached (${collabQuota}/day on ${u.plan})`}
                </div>
              )}
              {RX_TYPES.map(t => {
                const sel = type === t.id;
                return (
                  <button key={t.id} onClick={() => setType(t.id)} style={{
                    padding: 14, borderRadius: 12, textAlign: 'left',
                    background: sel ? 'var(--glass-brand-bg)' : 'var(--bg-surface)',
                    border: '1.5px solid ' + (sel ? 'var(--brand-500)' : 'var(--border-default)'),
                    boxShadow: sel ? '0 0 0 4px rgba(42,63,184,0.10)' : 'none',
                    transition: 'all 180ms',
                  }}>
                    <div style={{ fontSize: 18, marginBottom: 4 }}>{t.icon}</div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>{t.label}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-tertiary)', marginTop: 2 }}>{t.desc}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Slide-in: password */}
          {type === 'private' && (
            <div style={{ animation: 'fadeInUp 280ms var(--ease-out-expo)' }}>
              <RXLabel>Room password</RXLabel>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="At least 4 characters"
                style={rxInput}/>
            </div>
          )}

          {/* Slide-in: interview extras */}
          {type === 'interview' && (
            <div style={{ animation: 'fadeInUp 280ms var(--ease-out-expo)', padding: 14, background: 'var(--bg-base)', borderRadius: 12, border: '1px solid var(--border-subtle)' }}>
              <RXLabel>Interview format</RXLabel>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 14 }}>
                {[
                  { v: 'Technical', i: '💻' },{ v: 'HR', i: '🤝' },
                  { v: 'Case Study', i: '📊' },{ v: 'Mock GD', i: '👥' },
                ].map(f => {
                  const sel = iFormat === f.v;
                  return (
                    <button key={f.v} onClick={() => setIFormat(f.v)} style={{
                      height: 30, padding: '0 12px', borderRadius: 999, fontSize: 12, fontWeight: 600,
                      background: sel ? 'var(--gradient-brand)' : 'var(--bg-surface)',
                      color: sel ? '#fff' : 'var(--text-secondary)',
                      border: '1px solid ' + (sel ? 'transparent' : 'var(--border-default)'),
                    }}>{f.i} {f.v}</button>
                  );
                })}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                <span style={{ fontSize: 12, fontWeight: 600 }}>Time per speaker</span>
                <RXStepper value={iSpeakerTime} onChange={setISpeakerTime} min={2} max={20} suffix="min"/>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 12, fontWeight: 600 }}>Enable evaluator</span>
                <RXToggle on={evaluator} onChange={setEvaluator}/>
              </div>
            </div>
          )}

          {/* Study mode pills */}
          <div>
            <RXLabel>Study mode</RXLabel>
            <div style={{ display: 'flex', gap: 6 }}>
              {[
                { v: 'silent', l: '🔇 Silent' },
                { v: 'discussion', l: '💬 Discussion' },
                { v: 'live', l: '⚡ Live' },
              ].map(m => {
                const sel = mode === m.v;
                return (
                  <button key={m.v} onClick={() => setMode(m.v)} style={{
                    flex: 1, height: 36, borderRadius: 999, fontSize: 12, fontWeight: 600,
                    background: sel ? 'var(--gradient-brand)' : 'var(--bg-surface)',
                    color: sel ? '#fff' : 'var(--text-secondary)',
                    border: '1px solid ' + (sel ? 'transparent' : 'var(--border-default)'),
                  }}>{m.l}</button>
                );
              })}
            </div>
          </div>

          {/* Pomodoro */}
          <div>
            <RXLabel>Pomodoro preset</RXLabel>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 6 }}>
              {[
                { v: 'classic', l: 'Classic', s: '25/5' },
                { v: 'deep', l: 'Deep', s: '50/10' },
                { v: 'long', l: 'Long', s: '90/20' },
                { v: 'custom', l: 'Custom', s: '⚙' },
              ].map(p => {
                const sel = pomo === p.v;
                return (
                  <button key={p.v} onClick={() => setPomo(p.v)} style={{
                    padding: '8px 0', borderRadius: 10, fontSize: 11, fontWeight: 600, lineHeight: 1.3,
                    background: sel ? 'var(--gradient-brand)' : 'var(--bg-surface)',
                    color: sel ? '#fff' : 'var(--text-secondary)',
                    border: '1px solid ' + (sel ? 'transparent' : 'var(--border-default)'),
                  }}>
                    <div>{p.l}</div>
                    <div style={{ fontFamily: 'JetBrains Mono', fontSize: 10, opacity: sel ? 0.85 : 0.7 }}>{p.s}</div>
                  </button>
                );
              })}
            </div>
            {pomo === 'custom' && (
              <div style={{ display: 'flex', gap: 8, marginTop: 8, animation: 'fadeInUp 200ms' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 10, color: 'var(--text-tertiary)', marginBottom: 4 }}>Work (min)</div>
                  <input type="number" value={customWork} onChange={e => setCustomWork(parseInt(e.target.value)||25)} style={rxInput}/>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 10, color: 'var(--text-tertiary)', marginBottom: 4 }}>Break (min)</div>
                  <input type="number" value={customBreak} onChange={e => setCustomBreak(parseInt(e.target.value)||5)} style={rxInput}/>
                </div>
              </div>
            )}
          </div>

          {/* Max participants */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <RXLabel inline>Max participants {type === 'interview' && <span style={{ color: 'var(--text-tertiary)', fontWeight: 400 }}>(locked at 6)</span>}</RXLabel>
            <RXStepper value={maxP} onChange={setMaxP} min={2} max={50} disabled={type === 'interview'}/>
          </div>

          {/* Invite only */}
          <div style={{ padding: 12, background: 'var(--bg-base)', borderRadius: 12, border: '1px solid var(--border-subtle)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600 }}>Invite only</div>
                <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>Hide from public list, join by link only</div>
              </div>
              <RXToggle on={inviteOnly} onChange={setInviteOnly}/>
            </div>
            {inviteOnly && (
              <div style={{ marginTop: 10, display: 'flex', gap: 6, animation: 'fadeInUp 200ms' }}>
                <input readOnly value={`elmorigin.com/r/${(name || 'untitled').toLowerCase().replace(/\s+/g,'-')}`} style={{ ...rxInput, height: 34, fontFamily: 'JetBrains Mono', fontSize: 11 }}/>
                <button className="btn btn-ghost btn-sm" style={{ height: 34 }}>Copy</button>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div style={{ padding: '16px 24px', borderTop: '1px solid var(--border-subtle)', display: 'flex', gap: 10 }}>
          <button onClick={doClose} className="btn btn-ghost btn-md" style={{ flex: 1 }}>Cancel</button>
          <button onClick={submit} disabled={!name.trim() || !subject || submitting} className="btn btn-brand btn-lg" style={{ flex: 2, background: 'var(--gradient-brand)', opacity: (!name.trim() || !subject) ? 0.5 : 1 }}>
            {submitting ? <span style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: 999, animation: 'orbit 800ms linear infinite' }}/> : 'Create & Enter Room →'}
          </button>
        </div>
      </div>
    </RXBackdrop>
  );
};

const RXLabel = ({ children, inline }) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: inline ? 0 : 6 }}>
    <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)' }}>{children}</label>
  </div>
);
const RXCounter = ({ v, m }) => <span style={{ fontSize: 11, fontFamily: 'JetBrains Mono', color: v > m ? 'var(--danger-500)' : 'var(--text-tertiary)' }}>{v}/{m}</span>;
const rxInput = {
  width: '100%', height: 40, padding: '0 14px',
  background: 'var(--bg-surface)', border: '1.5px solid var(--border-default)',
  borderRadius: 10, fontSize: 13, fontFamily: 'Inter', color: 'var(--text-primary)', outline: 'none',
};

const RXStepper = ({ value, onChange, min = 0, max = 100, suffix, disabled }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 0, opacity: disabled ? 0.5 : 1, pointerEvents: disabled ? 'none' : 'auto' }}>
    <button onClick={() => onChange(Math.max(min, value - 1))} style={{ width: 28, height: 28, borderRadius: '8px 0 0 8px', border: '1px solid var(--border-default)', background: 'var(--bg-surface)', color: 'var(--text-secondary)', fontSize: 14, fontWeight: 700 }}>−</button>
    <div style={{ minWidth: 50, height: 28, padding: '0 10px', borderTop: '1px solid var(--border-default)', borderBottom: '1px solid var(--border-default)', background: 'var(--bg-surface)', fontSize: 12, fontWeight: 700, fontFamily: 'JetBrains Mono', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>{value}{suffix && <span style={{ fontSize: 9, marginLeft: 3, color: 'var(--text-tertiary)' }}>{suffix}</span>}</div>
    <button onClick={() => onChange(Math.min(max, value + 1))} style={{ width: 28, height: 28, borderRadius: '0 8px 8px 0', border: '1px solid var(--border-default)', background: 'var(--bg-surface)', color: 'var(--text-secondary)', fontSize: 14, fontWeight: 700 }}>+</button>
  </div>
);

const RXToggle = ({ on, onChange }) => (
  <button onClick={() => onChange(!on)} style={{
    width: 40, height: 22, borderRadius: 999, position: 'relative',
    background: on ? 'var(--gradient-brand)' : 'var(--bg-hover)', border: 'none',
  }}>
    <span style={{ position: 'absolute', top: 2, left: on ? 20 : 2, width: 18, height: 18, borderRadius: 999, background: '#fff', boxShadow: 'var(--shadow-sm)', transition: 'left 200ms var(--ease-spring)' }}/>
  </button>
);

// ─────────────────────────────────────────────────────────
// FIX 5 — SUBSCRIPTION GATE MODAL (6 variants)
// ─────────────────────────────────────────────────────────
const GATE_VARIANTS = {
  'elm-together': {
    icon: '👥', headline: 'Study with this person',
    desc: 'Elm Together pairs you with someone studying right now — you focus side-by-side without the awkward.',
    free: 'Free: solo focus only',
    pro: 'Pro: pair-focus with anyone in any room',
  },
  'extra-session': {
    icon: '⏱', headline: 'You\'ve hit your monthly limit',
    desc: 'Free includes 2 mentor sessions per month. Upgrade for unlimited bookings and faster matching.',
    free: 'Free: 2 sessions per month',
    pro: 'Pro: unlimited sessions + priority booking',
  },
  'collab-room': {
    icon: '🔗', headline: 'You’ve hit today’s collaborative room limit',
    desc: '{plan} plan allows {quota} collaborative rooms per day. Upgrade to Pro for 5/day, or Elite for unlimited.',
    free: '{plan}: {quota} collaborative rooms / day',
    pro: 'Pro: 5 / day  ·  Elite: unlimited',
  },
  'peer-interview-quota': {
    icon: '✨', headline: 'You’ve done today’s peer interview',
    desc: '{plan} plan allows {quota} peer interview per day. Upgrade to Pro for 3/day, or Elite for unlimited practice.',
    free: '{plan}: {quota} peer interview / day',
    pro: 'Pro: 3 / day  ·  Elite: unlimited',
  },
  'group-interview-quota': {
    icon: '👥', headline: 'You’ve started today’s group interview',
    desc: '{plan} plan allows {quota} group interview per day. Upgrade to Pro for 3/day, or Elite for unlimited.',
    free: '{plan}: {quota} group interview / day',
    pro: 'Pro: 3 / day  ·  Elite: unlimited',
  },
  'nova-limit': {
    icon: '✨', headline: 'You\'ve used today\'s Nova messages',
    desc: 'Free gets 20 Nova messages per day. Upgrade for unlimited tutoring across every subject.',
    free: 'Free: 20 messages/day',
    pro: 'Pro: unlimited Nova + voice mode + image analysis',
  },
  'direct-message': {
    icon: '💬', headline: 'Message your mentor anytime',
    desc: 'DM your mentor between sessions for quick questions. Free users can only message during bookings.',
    free: 'Free: in-session chat only',
    pro: 'Pro: 24/7 mentor DMs',
  },
  'generic': {
    icon: '⭐', headline: 'This feature is part of Pro',
    desc: 'Unlock the full ELM Origin experience — better focus tools, more mentors, and zero limits.',
    free: 'Free: core features',
    pro: 'Pro: everything unlocked',
  },
};

const GateModal = ({ variant = 'generic', context, onClose, onUpgrade }) => {
  const [shake, setShake] = useStateRX(false);
  const [exiting, setExiting] = useStateRX(false);
  const raw = GATE_VARIANTS[variant] || GATE_VARIANTS.generic;
  const interpolate = (str) => {
    if (!context) return str;
    return Object.entries(context).reduce((s, [k, val]) => s.split('{' + k + '}').join(String(val)), str);
  };
  const v = { ...raw, headline: interpolate(raw.headline), desc: interpolate(raw.desc), free: interpolate(raw.free), pro: interpolate(raw.pro) };

  const doClose = () => {
    setShake(true);
    setTimeout(() => { setExiting(true); setTimeout(onClose, 220); }, 320);
  };
  useEffectRX(() => {
    const onKey = (e) => { if (e.key === 'Escape') doClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  return (
    <RXBackdrop onClose={doClose}>
      <div style={{
        width: 440, padding: 40, borderRadius: 24,
        background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)',
        boxShadow: 'var(--shadow-xl)', textAlign: 'center',
        animation: exiting ? 'modalOut 220ms forwards' : (shake ? 'shake 320ms' : 'modalIn 350ms var(--ease-out-expo)'),
      }}>
        <div style={{
          width: 56, height: 56, borderRadius: 16, margin: '0 auto 20px',
          background: 'linear-gradient(135deg, rgba(13,23,87,0.12), rgba(61,82,204,0.12))',
          color: 'var(--brand-600)', fontSize: 26,
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        }}>{v.icon}</div>
        <h2 className="font-display italic" style={{ fontFamily: 'Fraunces', fontSize: 24, fontWeight: 700, fontStyle: 'italic', marginBottom: 10, lineHeight: 1.2 }}>
          {v.headline}
        </h2>
        <p style={{ fontFamily: 'Instrument Sans', fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.55, marginBottom: 22 }}>
          {v.desc}
        </p>
        <div style={{ background: 'var(--bg-base)', border: '1px solid var(--border-subtle)', borderRadius: 12, padding: '12px 16px', marginBottom: 20, textAlign: 'left' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: 'var(--text-tertiary)', marginBottom: 6 }}>
            <span style={{ color: 'var(--text-muted)', fontFamily: 'JetBrains Mono', fontWeight: 700 }}>✗</span> {v.free}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: 'var(--text-primary)', fontWeight: 600 }}>
            <span style={{ color: 'var(--mint-500)', fontFamily: 'JetBrains Mono', fontWeight: 700 }}>✓</span> {v.pro}
          </div>
        </div>
        <div style={{ fontSize: 11, color: 'var(--text-tertiary)', marginBottom: 16 }}>
          Joined by <strong style={{ color: 'var(--text-primary)' }}>8,400+ Pro students</strong> this week
        </div>
        <button onClick={onUpgrade} className="btn btn-brand btn-lg" style={{ width: '100%', background: 'var(--gradient-brand)', marginBottom: 8 }}>
          Upgrade to Pro — ₹499/mo
        </button>
        <button onClick={doClose} className="btn btn-ghost btn-sm" style={{ width: '100%', color: 'var(--text-tertiary)' }}>Maybe later</button>
        <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 14, fontFamily: 'JetBrains Mono' }}>
          7-day trial · No card required · Cancel anytime
        </div>
      </div>
    </RXBackdrop>
  );
};

// ─────────────────────────────────────────────────────────
// FIX 2 — PARTICIPANTS DRAWER
// ─────────────────────────────────────────────────────────
const ParticipantsDrawer = ({ onClose, participants, onElmTogether, currentUser }) => {
  const [exiting, setExiting] = useStateRX(false);
  const [shakeId, setShakeId] = useStateRX(null);
  const [toastId, setToastId] = useStateRX(null);

  const close = () => { setExiting(true); setTimeout(onClose, 380); };

  const onTogether = (p) => {
    if (p.hasPro) {
      setToastId(p.id);
      setTimeout(() => setToastId(null), 3000);
    } else {
      setShakeId(p.id);
      setTimeout(() => { setShakeId(null); onElmTogether(p); }, 420);
    }
  };

  return (
    <>
      <div onClick={close} style={{ position: 'fixed', inset: 0, background: 'rgba(7,10,24,0.40)', zIndex: 700 }}/>
      <div style={{
        position: 'fixed', top: 0, right: 0, height: '100vh', width: 320, zIndex: 701,
        background: 'var(--bg-surface)',
        borderLeft: '1px solid var(--border-subtle)',
        boxShadow: 'var(--shadow-xl)',
        animation: exiting ? 'panelOut 360ms var(--ease-in-expo) forwards' : 'panelIn 400ms var(--ease-out-expo)',
        display: 'flex', flexDirection: 'column',
      }}>
        <div style={{ padding: '18px 20px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span className="font-display" style={{ fontFamily: 'Fraunces', fontSize: 18, fontWeight: 700 }}>Participants</span>
            <span style={{ height: 22, padding: '0 8px', background: 'var(--glass-brand-bg)', color: 'var(--brand-600)', borderRadius: 999, fontSize: 11, fontFamily: 'JetBrains Mono', fontWeight: 700, display: 'inline-flex', alignItems: 'center' }}>{participants.length}</span>
          </div>
          <button onClick={close} style={{ width: 28, height: 28, borderRadius: 8, color: 'var(--text-tertiary)' }}><Icon name="x" size={14}/></button>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: 8 }}>
          {participants.map(p => {
            const isYou = p.name === currentUser;
            return (
              <div key={p.id} style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '10px 12px', borderRadius: 10,
                animation: shakeId === p.id ? 'shake 380ms' : 'none',
              }}>
                <StatusRing status={p.status === 'focused' ? 'focus' : p.status === 'break' ? 'break' : 'gray'} size={40}>
                  <Avatar name={p.name} size={36}/>
                </StatusRing>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ fontFamily: 'Figtree', fontWeight: 600, fontSize: 13, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name}</span>
                    {isYou && <span style={{ fontSize: 9, padding: '1px 6px', background: 'var(--bg-hover)', color: 'var(--text-secondary)', borderRadius: 4, fontWeight: 700 }}>YOU</span>}
                    {p.host && <span style={{ fontSize: 9, padding: '1px 6px', background: 'var(--gold-100)', color: 'var(--gold-700)', borderRadius: 4, fontWeight: 700 }}>HOST</span>}
                  </div>
                  <div style={{ fontSize: 11, fontFamily: 'JetBrains Mono', color: 'var(--text-tertiary)', marginTop: 2 }}>
                    {p.studyTime} · <span style={{ color: p.status === 'focused' ? 'var(--mint-600)' : p.status === 'break' ? 'var(--gold-600)' : 'var(--text-muted)' }}>{p.status}</span>
                  </div>
                </div>
                {!isYou && (
                  <div style={{ position: 'relative' }}>
                    <button onClick={() => onTogether(p)} className="btn btn-ghost btn-sm" style={{ height: 28, fontSize: 11, padding: '0 8px' }}>
                      👤 Together
                    </button>
                    {toastId === p.id && (
                      <div style={{ position: 'absolute', right: 0, top: '110%', whiteSpace: 'nowrap', padding: '6px 10px', background: 'var(--mint-100)', color: 'var(--mint-700)', borderRadius: 8, fontSize: 11, fontWeight: 600, animation: 'fadeInUp 200ms', zIndex: 5 }}>
                        Request sent ✓
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
};

// ─────────────────────────────────────────────────────────
// FIX 3 — ROOM SESSION (full screen with controls bar)
// ─────────────────────────────────────────────────────────
const RoomSession = ({ room, navigate, onLeaveSummary }) => {
  const [isMuted, setIsMuted] = useStateRX(false);
  const [isCameraOff, setIsCameraOff] = useStateRX(true);
  const [isSharing, setIsSharing] = useStateRX(false);
  const [showAmbient, setShowAmbient] = useStateRX(false);
  const [ambient, setAmbient] = useStateRX(null);
  const [showGoal, setShowGoal] = useStateRX(false);
  const [goal, setGoal] = useStateRX('');
  const [showNotes, setShowNotes] = useStateRX(false);
  const [notes, setNotes] = useStateRX('');
  const [drawer, setDrawer] = useStateRX(false);
  const [gate, setGate] = useStateRX(null);
  const [leave, setLeave] = useStateRX(false);
  const [seconds, setSeconds] = useStateRX(0);

  useEffectRX(() => {
    const t = setInterval(() => setSeconds(s => s + 1), 1000);
    return () => clearInterval(t);
  }, []);

  const isInterview = room?.type === 'interview';

  const fmt = (s) => {
    const m = Math.floor(s / 60), sec = s % 60;
    return `${String(m).padStart(2,'0')}:${String(sec).padStart(2,'0')}`;
  };

  const participants = [
    { id: 'p1', name: 'Arjun Patel', host: false, studyTime: fmt(seconds), status: 'focused', hasPro: true },
    { id: 'p2', name: 'Priya Singh', host: true, studyTime: '01:42:18', status: 'focused', hasPro: false },
    { id: 'p3', name: 'Rohan Mehta', host: false, studyTime: '00:58:04', status: 'break', hasPro: true },
    { id: 'p4', name: 'Sara Kapoor', host: false, studyTime: '00:31:22', status: 'focused', hasPro: false },
    { id: 'p5', name: 'Vikram Joshi', host: false, studyTime: '02:11:45', status: 'away', hasPro: false },
  ];

  if (isInterview) {
    return <GroupInterviewSession room={room} navigate={navigate} onLeaveSummary={onLeaveSummary}/>;
  }

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 200, background: 'var(--bg-base)', display: 'flex', flexDirection: 'column' }}>
      {/* Top */}
      <div style={{ height: 56, padding: '0 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--bg-surface)', borderBottom: '1px solid var(--border-subtle)' }}>
        <button onClick={() => setLeave(true)} className="btn btn-ghost btn-sm">← Leave</button>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span className="font-display" style={{ fontFamily: 'Fraunces', fontSize: 16, fontWeight: 700 }}>{room?.name || 'Room'}</span>
          <span className="chip chip-brand" style={{ fontSize: 11 }}>{room?.subject || 'Study'}</span>
          <span style={{ fontFamily: 'JetBrains Mono', fontSize: 12, color: 'var(--text-tertiary)' }}>· {participants.length} in room</span>
        </div>
        <div style={{ fontFamily: 'JetBrains Mono', fontSize: 14, fontWeight: 600, color: 'var(--brand-600)' }}>{fmt(seconds)}</div>
      </div>

      {/* Body */}
      <div style={{ flex: 1, padding: 24, overflow: 'auto' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 280px', gap: 20 }}>
          <div style={{
            background: 'var(--bg-surface)', borderRadius: 20, border: '1px solid var(--border-subtle)',
            padding: 32, minHeight: 360, display: 'flex', flexDirection: 'column',
          }}>
            <div style={{ fontSize: 11, fontFamily: 'JetBrains Mono', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>
              {room?.mode === 'silent' ? '🔇 Silent focus' : room?.mode === 'live' ? '⚡ Live' : '💬 Discussion'} · Pomodoro {room?.pomodoro || '25/5'}
            </div>
            <div className="font-display" style={{ fontFamily: 'Fraunces', fontSize: 28, fontWeight: 600, marginBottom: 8 }}>
              {goal ? `Today: ${goal}` : 'Set a goal to anchor your session'}
            </div>
            <p style={{ fontSize: 14, color: 'var(--text-tertiary)', lineHeight: 1.6, marginBottom: 24 }}>
              You're in a {room?.type || 'public'} room with {participants.length - 1} others. Webcam stays off by default — turn it on if you want presence.
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8, marginTop: 'auto' }}>
              {participants.slice(0, 4).map(p => (
                <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: 10, background: 'var(--bg-base)', borderRadius: 12, border: '1px solid var(--border-subtle)' }}>
                  <Avatar name={p.name} size={32}/>
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div style={{ fontSize: 12, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name}</div>
                    <div style={{ fontSize: 10, fontFamily: 'JetBrains Mono', color: 'var(--mint-600)' }}>● focused {p.studyTime}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 16, padding: 18 }}>
            <div className="font-display" style={{ fontFamily: 'Fraunces', fontSize: 14, fontWeight: 700, marginBottom: 12 }}>Pomodoro</div>
            <div style={{ fontFamily: 'JetBrains Mono', fontSize: 36, fontWeight: 600, color: 'var(--brand-600)', textAlign: 'center', padding: '14px 0' }}>
              {fmt(Math.max(0, 25*60 - seconds))}
            </div>
            <div style={{ height: 4, borderRadius: 999, background: 'var(--bg-hover)', overflow: 'hidden', marginBottom: 14 }}>
              <div style={{ height: '100%', width: `${Math.min(100, (seconds / (25*60)) * 100)}%`, background: 'var(--gradient-brand)' }}/>
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-tertiary)', marginBottom: 14, textAlign: 'center' }}>Focus → 5 min break</div>
            <div className="font-display" style={{ fontFamily: 'Fraunces', fontSize: 13, fontWeight: 700, marginBottom: 8, marginTop: 18 }}>Now playing</div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{ambient ? ambient : 'No ambient sound'}</div>
          </div>
        </div>
      </div>

      {/* Notes panel */}
      {showNotes && (
        <div onClick={() => setShowNotes(false)} style={{ position: 'fixed', inset: 0, zIndex: 750, background: 'rgba(7,10,24,0.30)' }}>
          <div onClick={e => e.stopPropagation()} style={{ position: 'absolute', right: 0, top: 0, height: '100vh', width: 360, background: 'var(--bg-surface)', borderLeft: '1px solid var(--border-subtle)', padding: 20, animation: 'panelIn 380ms var(--ease-out-expo)' }}>
            <div className="font-display" style={{ fontFamily: 'Fraunces', fontSize: 18, fontWeight: 700, marginBottom: 14 }}>Session notes</div>
            <textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Jot anything you want to keep…" style={{ width: '100%', height: 'calc(100vh - 120px)', padding: 14, border: '1px solid var(--border-default)', borderRadius: 12, fontSize: 13, lineHeight: 1.6, fontFamily: 'Instrument Sans', resize: 'none', outline: 'none', background: 'var(--bg-base)' }}/>
          </div>
        </div>
      )}

      {/* BOTTOM CONTROLS BAR */}
      <div style={{
        height: 56, padding: '0 16px',
        background: 'var(--bg-surface)', borderTop: '1px solid var(--border-subtle)',
        display: 'grid', gridTemplateColumns: '1fr auto 1fr', alignItems: 'center', gap: 8,
      }}>
        {/* LEFT */}
        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          <div style={{ position: 'relative' }}>
            <button onClick={() => setShowAmbient(!showAmbient)} className="btn btn-ghost btn-sm">🎵 Ambient</button>
            {showAmbient && (
              <div style={{ position: 'absolute', bottom: '110%', left: 0, padding: 6, background: 'var(--bg-surface)', border: '1px solid var(--border-default)', borderRadius: 12, boxShadow: 'var(--shadow-lg)', display: 'flex', gap: 4, zIndex: 100 }}>
                {[
                  { e: '☕', l: 'Cafe' },{ e: '🌧', l: 'Rain' },{ e: '🌿', l: 'Forest' },
                  { e: '🎹', l: 'Piano' },{ e: '🎵', l: 'Lo-fi' },{ e: '✕', l: 'Off' },
                ].map(a => (
                  <button key={a.l} onClick={() => { setAmbient(a.l === 'Off' ? null : a.l); setShowAmbient(false); }} title={a.l}
                    style={{ width: 36, height: 36, borderRadius: 10, fontSize: 16, background: ambient === a.l ? 'var(--glass-brand-bg)' : 'transparent' }}>{a.e}</button>
                ))}
              </div>
            )}
          </div>
          <button onClick={() => setShowNotes(true)} className="btn btn-ghost btn-sm">📝 Notes</button>
          <div style={{ position: 'relative' }}>
            <button onClick={() => setShowGoal(!showGoal)} className="btn btn-ghost btn-sm">🎯 Goal</button>
            {showGoal && (
              <div style={{ position: 'absolute', bottom: '110%', left: 0, padding: 12, background: 'var(--bg-surface)', border: '1px solid var(--border-default)', borderRadius: 12, boxShadow: 'var(--shadow-lg)', width: 280, zIndex: 100 }}>
                <input autoFocus value={goal} onChange={e => setGoal(e.target.value)} onKeyDown={e => e.key === 'Enter' && setShowGoal(false)} placeholder="What will you finish today?" style={rxInput}/>
              </div>
            )}
          </div>
        </div>

        {/* CENTER */}
        <div style={{ display: 'flex', gap: 8 }}>
          <RXMediaButton on={!isMuted} onClick={() => setIsMuted(!isMuted)} icon={isMuted ? '🔇' : '🎙'} active={!isMuted} danger={isMuted}/>
          <RXMediaButton on={!isCameraOff} onClick={() => setIsCameraOff(!isCameraOff)} icon="📷" active={!isCameraOff} danger={isCameraOff}/>
          <button onClick={() => setIsSharing(!isSharing)} style={{
            height: 42, padding: '0 14px', borderRadius: 12, fontSize: 13, fontWeight: 600,
            background: isSharing ? 'var(--gradient-brand)' : 'var(--bg-base)',
            color: isSharing ? '#fff' : 'var(--text-secondary)',
            border: '1px solid ' + (isSharing ? 'transparent' : 'var(--border-default)'),
          }}>🖥 {isSharing ? 'Sharing' : 'Share'}</button>
        </div>

        {/* RIGHT */}
        <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end', alignItems: 'center' }}>
          <button disabled={room?.mode === 'silent'} title={room?.mode === 'silent' ? 'Chat disabled in Silent mode' : ''} className="btn btn-ghost btn-sm" style={{ opacity: room?.mode === 'silent' ? 0.4 : 1, cursor: room?.mode === 'silent' ? 'not-allowed' : 'pointer' }}>💬 Chat</button>
          <button onClick={() => setDrawer(true)} className="btn btn-ghost btn-sm">👥 Participants</button>
          <button onClick={() => setLeave(true)} className="btn btn-ghost btn-sm" style={{ color: 'var(--danger-500)' }}>→ Leave</button>
        </div>
      </div>

      {drawer && <ParticipantsDrawer onClose={() => setDrawer(false)} participants={participants} currentUser="Arjun Patel" onElmTogether={() => setGate('elm-together')}/>}
      {gate && <GateModal variant={gate} onClose={() => setGate(null)} onUpgrade={() => { setGate(null); navigate('pricing'); }}/>}
      {leave && (
        <RXBackdrop onClose={() => setLeave(false)}>
          <div style={{ width: 460, padding: 32, background: 'var(--bg-surface)', borderRadius: 20, border: '1px solid var(--border-subtle)', boxShadow: 'var(--shadow-xl)', animation: 'modalIn 320ms var(--ease-out-expo)' }}>
            <div className="font-display italic" style={{ fontFamily: 'Fraunces', fontSize: 22, fontWeight: 700, fontStyle: 'italic', marginBottom: 16 }}>Leave this session?</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, padding: 14, background: 'var(--bg-base)', borderRadius: 12, marginBottom: 18 }}>
              <div><div style={{ fontSize: 10, color: 'var(--text-tertiary)' }}>Focused</div><div style={{ fontFamily: 'JetBrains Mono', fontSize: 18, fontWeight: 700 }}>{fmt(seconds)}</div></div>
              <div><div style={{ fontSize: 10, color: 'var(--text-tertiary)' }}>Pomodoros</div><div style={{ fontFamily: 'JetBrains Mono', fontSize: 18, fontWeight: 700 }}>{Math.floor(seconds/(25*60))}</div></div>
              <div><div style={{ fontSize: 10, color: 'var(--text-tertiary)' }}>XP earned</div><div style={{ fontFamily: 'JetBrains Mono', fontSize: 18, fontWeight: 700, color: 'var(--mint-600)' }}>+{Math.floor(seconds/30)}</div></div>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={() => setLeave(false)} className="btn btn-ghost btn-lg" style={{ flex: 1 }}>Stay in room</button>
              <button onClick={() => onLeaveSummary && onLeaveSummary({ seconds, room })} className="btn btn-brand btn-lg" style={{ flex: 1, background: 'var(--gradient-brand)' }}>Leave & see summary</button>
            </div>
          </div>
        </RXBackdrop>
      )}
    </div>
  );
};

const RXMediaButton = ({ icon, active, danger, onClick }) => (
  <button onClick={onClick} style={{
    width: 42, height: 42, borderRadius: 12, fontSize: 16,
    background: active ? 'var(--gradient-brand)' : (danger ? 'rgba(225,29,72,0.10)' : 'var(--bg-base)'),
    color: active ? '#fff' : (danger ? 'var(--danger-500)' : 'var(--text-secondary)'),
    border: '1px solid ' + (active ? 'transparent' : (danger ? 'rgba(225,29,72,0.25)' : 'var(--border-default)')),
    transition: 'all 180ms', display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
  }}>{icon}</button>
);

// ─────────────────────────────────────────────────────────
// FIX 4 — GROUP INTERVIEW SESSION
// ─────────────────────────────────────────────────────────
const GroupInterviewSession = ({ room, navigate, onLeaveSummary }) => {
  const [turn, setTurn] = useStateRX(1);
  const [countdown, setCountdown] = useStateRX((room?.speakerTime || 5) * 60);
  const [ratings, setRatings] = useStateRX({ comm: 0, tech: 0, conf: 0 });
  const [feedbackNotes, setFeedbackNotes] = useStateRX('');
  const [savedSet, setSavedSet] = useStateRX(new Set());
  const [drawer, setDrawer] = useStateRX(false);
  const [ended, setEnded] = useStateRX(false);
  const [askEnd, setAskEnd] = useStateRX(false);
  const [elapsed, setElapsed] = useStateRX(0);

  const speakers = [
    { id: 1, name: 'Arjun Patel' },
    { id: 2, name: 'Priya Singh' },
    { id: 3, name: 'Rohan Mehta' },
    { id: 4, name: 'Sara Kapoor' },
    { id: 5, name: 'Vikram Joshi' },
  ];

  useEffectRX(() => {
    const t = setInterval(() => {
      setCountdown(c => Math.max(0, c - 1));
      setElapsed(e => e + 1);
    }, 1000);
    return () => clearInterval(t);
  }, []);

  useEffectRX(() => { setCountdown((room?.speakerTime || 5) * 60); }, [turn, room]);

  const fmt = (s) => `${String(Math.floor(s/60)).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`;
  const fmtElapsed = (s) => `${String(Math.floor(s/3600)).padStart(2,'0')}:${String(Math.floor((s%3600)/60)).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`;

  const next = () => {
    if (turn >= speakers.length) { setAskEnd(true); return; }
    setSavedSet(s => new Set([...s, turn]));
    setRatings({ comm: 0, tech: 0, conf: 0 });
    setFeedbackNotes('');
    setTurn(t => t + 1);
  };

  const cdColor = countdown < 10 ? 'var(--danger-500)' : countdown < 30 ? 'var(--gold-500)' : 'var(--text-primary)';

  if (ended) {
    return (
      <div style={{ position: 'fixed', inset: 0, zIndex: 200, background: 'var(--bg-base)', overflow: 'auto', padding: 40 }}>
        <div style={{ maxWidth: 720, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', padding: '40px 0 30px' }}>
            <div style={{ width: 64, height: 64, borderRadius: 999, background: 'var(--gradient-brand)', color: '#fff', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: 18, boxShadow: 'var(--shadow-lg)' }}>
              <Icon name="check" size={30}/>
            </div>
            <h1 className="font-display italic" style={{ fontFamily: 'Fraunces', fontStyle: 'italic', fontSize: 36, fontWeight: 800, marginBottom: 8 }}>Interview complete ✓</h1>
            <p style={{ color: 'var(--text-tertiary)' }}>{speakers.length} participants · {fmtElapsed(elapsed)} elapsed</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 14, marginBottom: 32 }}>
            {speakers.map(s => (
              <div key={s.id} style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 16, padding: 18, display: 'flex', alignItems: 'center', gap: 12 }}>
                <Avatar name={s.name} size={48}/>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: 14 }}>{s.name}</div>
                  <div style={{ fontFamily: 'JetBrains Mono', fontSize: 12, color: 'var(--gold-600)' }}>★ {(3.8 + s.id * 0.1).toFixed(1)}</div>
                  <div style={{ fontSize: 11, color: 'var(--mint-600)', marginTop: 2 }}>Feedback saved ✓</div>
                </div>
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button className="btn btn-ghost btn-lg" style={{ flex: 1 }}>View full feedback report</button>
            <button onClick={() => navigate('home')} className="btn btn-brand btn-lg" style={{ flex: 1, background: 'var(--gradient-brand)' }}>Return to dashboard</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 200, background: 'var(--bg-base)', display: 'flex', flexDirection: 'column' }}>
      {/* TOP BAR */}
      <div style={{ height: 48, padding: '0 20px', background: 'var(--bg-surface)', borderBottom: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', gap: 12 }}>
        <span className="font-display" style={{ fontFamily: 'Fraunces', fontSize: 14, fontWeight: 700 }}>{room?.name || 'Mock Interview'}</span>
        <span style={{ height: 22, padding: '0 8px', background: 'linear-gradient(135deg, rgba(245,158,11,0.18), rgba(245,158,11,0.08))', color: 'var(--gold-700)', borderRadius: 999, fontSize: 10, fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 4 }}>🎤 GROUP INTERVIEW</span>
        <span className="chip chip-brand" style={{ fontSize: 11 }}>{room?.format || 'Technical'}</span>
        <div style={{ flex: 1 }}/>
        <span style={{ fontFamily: 'JetBrains Mono', fontSize: 12, color: 'var(--text-tertiary)' }}>{fmtElapsed(elapsed)}</span>
        <span style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>· {speakers.length} participants</span>
      </div>

      {/* MAIN 3-COL */}
      <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '200px 1fr 240px', gap: 12, padding: 16, overflow: 'hidden' }}>
        {/* Turn Order */}
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
                  animation: isCur ? 'pulse 2.4s infinite' : 'none',
                  opacity: isDone ? 0.55 : 1,
                }}>
                  <span style={{ fontFamily: 'JetBrains Mono', fontSize: 10 }}>{i + 1}</span>
                  <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.name}</span>
                  {isDone && <Icon name="check" size={12}/>}
                </div>
              );
            })}
          </div>
        </div>

        {/* Speaker spotlight */}
        <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 16, padding: 24, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{ width: 280, height: 280, borderRadius: 24, background: 'var(--bg-base)', border: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
            <div style={{ position: 'absolute', inset: -4, borderRadius: 26, background: 'var(--gradient-brand)', filter: 'blur(8px)', opacity: 0.35, animation: 'pulse 2.4s infinite' }}/>
            <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <Avatar name={speakers.find(s => s.id === turn)?.name || 'A'} size={96}/>
              <div className="font-display" style={{ fontFamily: 'Fraunces', fontSize: 22, fontWeight: 600, marginTop: 14 }}>
                {speakers.find(s => s.id === turn)?.name}
              </div>
              <div style={{ fontSize: 11, color: 'var(--mint-600)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginTop: 4 }}>● Speaking</div>
            </div>
          </div>
          <div style={{ fontFamily: 'JetBrains Mono', fontSize: 56, fontWeight: 700, color: cdColor, marginTop: 24, animation: countdown < 10 ? 'shake 320ms infinite' : 'none' }}>
            {fmt(countdown)}
          </div>
          <div style={{ display: 'flex', gap: 6, marginTop: 18, flexWrap: 'wrap', justifyContent: 'center' }}>
            {speakers.filter(s => s.id !== turn).slice(0, 4).map((s, i) => {
              const isNext = s.id === turn + 1;
              return (
                <div key={s.id} style={{
                  width: 80, height: 96, borderRadius: 12,
                  background: 'var(--bg-base)', border: '1px solid ' + (isNext ? 'var(--gold-500)' : 'var(--border-subtle)'),
                  padding: 8, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                  animation: isNext ? 'pulse 2s infinite' : 'none',
                }}>
                  <Avatar name={s.name} size={36}/>
                  <div style={{ fontSize: 10, fontWeight: 600, marginTop: 6, textAlign: 'center', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '100%' }}>{s.name.split(' ')[0]}</div>
                  {isNext && <div style={{ fontSize: 9, color: 'var(--gold-700)', fontWeight: 700 }}>NEXT</div>}
                </div>
              );
            })}
          </div>
        </div>

        {/* Feedback Panel */}
        <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 14, padding: 16, overflowY: 'auto' }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12 }}>Feedback for current speaker</div>
          {[
            { k: 'comm', l: 'Communication' },
            { k: 'tech', l: 'Technical depth' },
            { k: 'conf', l: 'Confidence' },
          ].map(r => (
            <div key={r.k} style={{ marginBottom: 10 }}>
              <div style={{ fontSize: 11, fontWeight: 600, marginBottom: 4 }}>{r.l}</div>
              <div style={{ display: 'flex', gap: 4 }}>
                {[1,2,3,4,5].map(n => (
                  <button key={n} onClick={() => setRatings({ ...ratings, [r.k]: n })} style={{ fontSize: 16, color: ratings[r.k] >= n ? 'var(--gold-500)' : 'var(--text-muted)' }}>★</button>
                ))}
              </div>
            </div>
          ))}
          <textarea value={feedbackNotes} onChange={e => setFeedbackNotes(e.target.value)} placeholder="Strengths, areas to improve…"
            style={{ width: '100%', height: 90, padding: 10, border: '1px solid var(--border-default)', borderRadius: 10, fontSize: 12, fontFamily: 'Instrument Sans', resize: 'none', outline: 'none', background: 'var(--bg-base)', marginBottom: 10 }}/>
          <div style={{ display: 'flex', gap: 6 }}>
            <button onClick={() => { setSavedSet(s => new Set([...s, turn])); }} className="btn btn-ghost btn-sm" style={{ flex: 1 }}>Save</button>
            <button onClick={next} className="btn btn-ghost btn-sm" style={{ flex: 1 }}>Skip →</button>
          </div>
        </div>
      </div>

      {/* BOTTOM */}
      <div style={{ height: 56, padding: '0 16px', background: 'var(--bg-surface)', borderTop: '1px solid var(--border-subtle)', display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: 8, alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: 6 }}>
          <button className="btn btn-ghost btn-sm">📝 Notes</button>
          <button className="btn btn-ghost btn-sm">📋 Agenda</button>
          <button className="btn btn-ghost btn-sm">🎙 Mute</button>
          <button className="btn btn-ghost btn-sm">📷 Camera</button>
          <button className="btn btn-ghost btn-sm">🖥 Share</button>
        </div>
        <button onClick={next} className="btn btn-brand btn-md" style={{ background: 'var(--gradient-brand)' }}>→ Next Speaker</button>
        <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
          <button className="btn btn-ghost btn-sm">💬 Chat</button>
          <button onClick={() => setDrawer(true)} className="btn btn-ghost btn-sm">👥 Participants</button>
          <button onClick={() => setAskEnd(true)} className="btn btn-ghost btn-sm" style={{ color: 'var(--danger-500)' }}>→ Leave</button>
        </div>
      </div>

      {drawer && <ParticipantsDrawer onClose={() => setDrawer(false)} participants={speakers.map((s, i) => ({ ...s, host: i === 0, studyTime: fmtElapsed(elapsed - i*60), status: i === turn-1 ? 'focused' : (savedSet.has(s.id) ? 'break' : 'focused'), hasPro: i % 2 === 0 }))} currentUser="Arjun Patel" onElmTogether={() => {}}/>}
      {askEnd && (
        <RXBackdrop onClose={() => setAskEnd(false)}>
          <div style={{ width: 420, padding: 28, background: 'var(--bg-surface)', borderRadius: 18, boxShadow: 'var(--shadow-xl)', animation: 'modalIn 320ms' }}>
            <div className="font-display italic" style={{ fontFamily: 'Fraunces', fontSize: 20, fontWeight: 700, fontStyle: 'italic', marginBottom: 8 }}>End the session?</div>
            <p style={{ fontSize: 13, color: 'var(--text-tertiary)', marginBottom: 18 }}>Everyone will see the summary and feedback report.</p>
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={() => setAskEnd(false)} className="btn btn-ghost btn-md" style={{ flex: 1 }}>Cancel</button>
              <button onClick={() => { setAskEnd(false); setEnded(true); }} className="btn btn-brand btn-md" style={{ flex: 1, background: 'var(--gradient-brand)' }}>End session</button>
            </div>
          </div>
        </RXBackdrop>
      )}
    </div>
  );
};

window.CreateRoomModal = CreateRoomModal;
window.GateModal = GateModal;
window.ParticipantsDrawer = ParticipantsDrawer;
window.RoomSession = RoomSession;
window.GroupInterviewSession = GroupInterviewSession;
