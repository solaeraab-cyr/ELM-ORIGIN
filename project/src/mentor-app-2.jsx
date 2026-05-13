/* global React, Icon, Avatar, MOLabeled, MOInput, MOSelect, MASection, AvailabilityGrid, MENTOR_USER, MENTOR_PENDING_REQUESTS, MENTOR_UPCOMING, MENTOR_PAST, MENTOR_CANCELLED */
const { useState: usM2, useEffect: usE2, useRef: usR2, useMemo: usMM2 } = React;

// ═══════════════════════════════════════════════════════════════
// Tiny toast helper (delegates to window.toast if present)
// ═══════════════════════════════════════════════════════════════
const tToast = (msg, kind = 'success') => {
  if (window.toast) return window.toast(msg, kind);
  const el = document.createElement('div');
  el.textContent = msg;
  Object.assign(el.style, {
    position: 'fixed', top: 24, right: 24, zIndex: 9999,
    background: 'var(--bg-surface)', color: 'var(--text-primary)',
    padding: '12px 18px', borderRadius: 12,
    borderLeft: `3px solid var(--${kind === 'error' ? 'error' : kind === 'amber' ? 'amber-500' : 'mint-500'})`,
    boxShadow: 'var(--shadow-lg)', font: '500 13px/1.4 Inter, system-ui',
    transition: 'opacity 220ms, transform 220ms', opacity: 0, transform: 'translateY(-8px)',
  });
  document.body.appendChild(el);
  requestAnimationFrame(() => { el.style.opacity = 1; el.style.transform = 'translateY(0)'; });
  setTimeout(() => { el.style.opacity = 0; setTimeout(() => el.remove(), 240); }, 3000);
};

// ═══════════════════════════════════════════════════════════════
// C2 — MENTOR PROFILE EDIT
// ═══════════════════════════════════════════════════════════════
const MentorProfileEdit = ({ navigate, mentor }) => {
  const initial = usMM2(() => JSON.parse(JSON.stringify(mentor || MENTOR_USER)), [mentor]);
  const [draft, setDraft] = usM2(initial);
  const [saved, setSaved] = usM2(initial);
  const [aiOpen, setAiOpen] = usM2(false);
  const [aiLoading, setAiLoading] = usM2(false);
  const dirty = JSON.stringify(draft) !== JSON.stringify(saved);
  const setField = (k, v) => setDraft(d => ({ ...d, [k]: v }));
  const setPricing = (kind, k, v) => setDraft(d => ({ ...d, pricing: { ...d.pricing, [kind]: { ...d.pricing[kind], [k]: v } } }));

  const onBack = () => {
    if (dirty && !confirm('Discard unsaved changes?')) return;
    navigate('mentor-dashboard');
  };
  const onSave = () => { setSaved(draft); tToast('Profile updated ✓'); };
  const onDiscard = () => setDraft(saved);

  const aiGenerate = () => {
    setAiOpen(true); setAiLoading(true);
    setTimeout(() => {
      const generated = 'I\'m a data scientist with an IIT Bombay PhD and 6 years at Google Research. My specialty is making the math behind machine learning feel obvious — I\'ve helped hundreds of students who said they weren\'t "math people" land roles at top product companies. I teach by working through real problems together, not lecturing.';
      setField('bio', generated);
      setAiLoading(false);
      setTimeout(() => { setAiOpen(false); tToast('Generated — edit as needed'); }, 350);
    }, 1500);
  };

  const charCounter = (val, max) => {
    const n = (val || '').length;
    const color = n >= max ? 'var(--error)' : n >= max * 0.8 ? 'var(--amber-500)' : 'var(--text-tertiary)';
    return <span style={{ fontFamily: 'JetBrains Mono', fontSize: 11, color }}>{n}/{max}</span>;
  };

  const lowest = Math.min(
    draft.pricing.voice.enabled ? draft.pricing.voice.p30 : Infinity,
    draft.pricing.video.enabled ? draft.pricing.video.p30 : Infinity,
  );

  return (
    <div style={{ maxWidth: 1080, margin: '0 auto', padding: '32px 40px 140px' }}>
      <button onClick={onBack} className="btn btn-ghost btn-sm" style={{ marginBottom: 16 }}>← Back to Dashboard</button>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 24 }}>
        <h1 style={{ fontFamily: 'Fraunces', fontWeight: 500, fontSize: 36, margin: 0 }}>Edit Profile</h1>
        <span style={{ padding: '5px 12px', borderRadius: 999, fontSize: 11, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase',
          background: draft.acceptingBookings ? 'rgba(16,185,129,0.12)' : 'rgba(120,120,140,0.12)',
          color: draft.acceptingBookings ? 'var(--mint-600)' : 'var(--text-tertiary)' }}>
          {draft.acceptingBookings ? '● Public' : '○ Hidden'}
        </span>
      </div>

      {/* Live preview */}
      <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 16, padding: 16, marginBottom: 24 }}>
        <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--brand-500)', marginBottom: 10 }}>How students see your profile</div>
        <div style={{ display: 'flex', gap: 14, padding: 14, background: 'var(--bg-base)', borderRadius: 12, border: '1px solid var(--border-subtle)' }}>
          <Avatar name={draft.name} size={48}/>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontFamily: 'Inter', fontWeight: 600, fontSize: 14 }}>{draft.name}</div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{draft.headline}</div>
            <div style={{ display: 'flex', gap: 10, marginTop: 6, fontSize: 11, color: 'var(--text-tertiary)' }}>
              <span style={{ color: 'var(--amber-500)' }}>★ {draft.rating}</span>
              <span>·</span>
              <span>{(draft.subjects || []).slice(0,2).join(' · ')}</span>
              <span>·</span>
              <span style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>From ₹{lowest === Infinity ? '—' : lowest}/30min</span>
            </div>
          </div>
        </div>
      </div>

      {/* Sections */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <MASection title="Photo" status="complete">
          <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
            <div style={{ width: 120, height: 120, borderRadius: '50%', background: 'var(--gradient-brand)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Fraunces', fontWeight: 600, fontSize: 36, color: '#fff' }}>
              {(draft.name || '?').split(' ').map(s => s[0]).slice(0,2).join('')}
            </div>
            <div>
              <button className="btn btn-ghost btn-sm" onClick={() => tToast('Crop modal stub — pretend you cropped 🌿', 'amber')}>Change photo</button>
              <div style={{ fontSize: 11, color: 'var(--text-tertiary)', marginTop: 8 }}>PNG or JPG, max 5MB</div>
            </div>
          </div>
        </MASection>

        <MASection title="Basic info" status="complete">
          <MOLabeled label="Full name"><MOInput value={draft.name} onChange={v => setField('name', v)}/></MOLabeled>
          <MOLabeled label={<span style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}><span>Headline</span>{charCounter(draft.headline, 80)}</span>}>
            <MOInput value={draft.headline} onChange={v => setField('headline', v.slice(0, 80))}/>
          </MOLabeled>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <MOLabeled label="Country"><MOSelect value={draft.country} onChange={v => setField('country', v)} options={['India','United States','United Kingdom','Canada','Singapore','Other']}/></MOLabeled>
            <MOLabeled label="Timezone"><MOSelect value={draft.timezone} onChange={v => setField('timezone', v)} options={['IST (UTC+5:30)','PST (UTC-8)','EST (UTC-5)','GMT (UTC)','SGT (UTC+8)']}/></MOLabeled>
          </div>
        </MASection>

        <MASection title="Bio" status="complete">
          <MOLabeled label={<span style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}><span>About me</span>{charCounter(draft.bio, 600)}</span>}>
            <textarea value={draft.bio} onChange={e => setField('bio', e.target.value.slice(0, 600))} rows={5} style={{ width: '100%', padding: '12px 14px', background: 'var(--bg-base)', border: '1px solid var(--border-default)', borderRadius: 10, fontFamily: 'Instrument Sans', fontSize: 14, color: 'var(--text-primary)', resize: 'vertical', outline: 'none', lineHeight: 1.6 }}/>
            <div style={{ marginTop: 8, position: 'relative' }}>
              <button onClick={aiGenerate} disabled={aiLoading} style={{ padding: '6px 12px', borderRadius: 8, background: 'transparent', border: '1px solid var(--border-default)', fontSize: 12, color: 'var(--brand-500)', fontWeight: 600 }}>
                {aiLoading ? '✨ Generating…' : '✨ AI · Help me write'}
              </button>
              {aiOpen && (
                <div style={{ position: 'absolute', top: 38, left: 0, background: 'var(--bg-surface)', border: '1px solid var(--border-default)', borderRadius: 12, padding: 12, boxShadow: 'var(--shadow-lg)', fontSize: 12, color: 'var(--text-secondary)', width: 280 }}>
                  {aiLoading ? 'Generating from your credentials…' : 'Done — pasted into your bio'}
                </div>
              )}
            </div>
          </MOLabeled>
          <MOLabeled label={<span style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}><span>Teaching approach</span>{charCounter(draft.teachingApproach, 400)}</span>}>
            <textarea value={draft.teachingApproach} onChange={e => setField('teachingApproach', e.target.value.slice(0, 400))} rows={3} style={{ width: '100%', padding: '12px 14px', background: 'var(--bg-base)', border: '1px solid var(--border-default)', borderRadius: 10, fontFamily: 'Instrument Sans', fontSize: 14, color: 'var(--text-primary)', resize: 'vertical', outline: 'none', lineHeight: 1.6 }}/>
          </MOLabeled>
        </MASection>

        <MASection title="Expertise" status="complete">
          <MOLabeled label="Primary field"><MOSelect value={draft.primary} onChange={v => setField('primary', v)} options={['Data Science','Software Engineering','Product','Design','Business','Other']}/></MOLabeled>
          <MOLabeled label="Subjects you teach">
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {(draft.subjects || []).map((s, i) => (
                <span key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 10px', borderRadius: 999, background: 'var(--brand-50)', color: 'var(--brand-700)', fontSize: 12, fontWeight: 500 }}>
                  {s}
                  <button onClick={() => setField('subjects', draft.subjects.filter((_, k) => k !== i))} style={{ background: 'transparent', color: 'var(--brand-700)', padding: 0, fontSize: 14 }}>×</button>
                </span>
              ))}
              <input placeholder="Add subject + Enter" onKeyDown={e => {
                if (e.key === 'Enter' && e.target.value.trim() && (draft.subjects || []).length < 10) {
                  setField('subjects', [...(draft.subjects || []), e.target.value.trim()]);
                  e.target.value = '';
                }
              }} style={{ flex: 1, minWidth: 140, background: 'transparent', border: 'none', outline: 'none', fontSize: 12, color: 'var(--text-primary)' }}/>
            </div>
          </MOLabeled>
        </MASection>

        <MASection title="Session pricing" status="complete">
          {['voice', 'video'].map(kind => (
            <div key={kind} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '12px 0', borderBottom: '1px solid var(--border-subtle)' }}>
              <button onClick={() => setPricing(kind, 'enabled', !draft.pricing[kind].enabled)} style={{
                width: 44, height: 24, borderRadius: 12, padding: 0, position: 'relative',
                background: draft.pricing[kind].enabled ? 'var(--gradient-brand)' : 'var(--bg-base)',
                border: '1px solid var(--border-default)',
              }}>
                <span style={{ position: 'absolute', top: 2, left: draft.pricing[kind].enabled ? 22 : 2, width: 18, height: 18, borderRadius: '50%', background: '#fff', transition: 'left 180ms' }}/>
              </button>
              <span style={{ fontFamily: 'Inter', fontWeight: 600, fontSize: 14, width: 80, textTransform: 'capitalize' }}>{kind}</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>₹</span>
                <input type="number" value={draft.pricing[kind].p30} onChange={e => setPricing(kind, 'p30', +e.target.value)} disabled={!draft.pricing[kind].enabled} style={{ width: 80, padding: '7px 10px', border: '1px solid var(--border-default)', borderRadius: 8, fontFamily: 'JetBrains Mono', fontSize: 13, background: 'var(--bg-base)', color: 'var(--text-primary)' }}/>
                <span style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>/30min</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>₹</span>
                <input type="number" value={draft.pricing[kind].p60} onChange={e => setPricing(kind, 'p60', +e.target.value)} disabled={!draft.pricing[kind].enabled} style={{ width: 80, padding: '7px 10px', border: '1px solid var(--border-default)', borderRadius: 8, fontFamily: 'JetBrains Mono', fontSize: 13, background: 'var(--bg-base)', color: 'var(--text-primary)' }}/>
                <span style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>/60min</span>
              </div>
            </div>
          ))}
          <div style={{ marginTop: 14, fontSize: 12, color: 'var(--text-tertiary)' }}>Lernova takes 15%. You receive 85%. At ₹{draft.pricing.video.p60}/60-min, you earn <strong style={{ color: 'var(--mint-600)' }}>₹{Math.round(draft.pricing.video.p60 * 0.85)}</strong>.</div>
        </MASection>

        <MASection title="Visibility" status="complete">
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <button onClick={() => setField('acceptingBookings', !draft.acceptingBookings)} style={{
              width: 52, height: 28, borderRadius: 14, padding: 0, position: 'relative',
              background: draft.acceptingBookings ? 'var(--gradient-brand)' : 'var(--bg-base)',
              border: '1px solid var(--border-default)',
            }}>
              <span style={{ position: 'absolute', top: 2, left: draft.acceptingBookings ? 26 : 2, width: 22, height: 22, borderRadius: '50%', background: '#fff', transition: 'left 180ms', boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }}/>
            </button>
            <div>
              <div style={{ fontFamily: 'Inter', fontWeight: 600, fontSize: 14 }}>Accept new bookings</div>
              <div style={{ fontSize: 12, color: draft.acceptingBookings ? 'var(--text-tertiary)' : 'var(--amber-600)', fontStyle: draft.acceptingBookings ? 'normal' : 'italic', marginTop: 3 }}>
                {draft.acceptingBookings ? 'Your profile is visible to all students' : "Profile hidden from search. Existing students see 'Not taking bookings'."}
              </div>
            </div>
          </div>
        </MASection>
      </div>

      {/* Sticky save bar */}
      {dirty && (
        <div style={{
          position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 80,
          background: 'var(--bg-surface)', borderTop: '1px solid var(--border-default)',
          boxShadow: '0 -8px 24px rgba(14,18,40,0.08)',
          padding: '14px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          animation: 'slideUpFooter 220ms cubic-bezier(0.16,1,0.3,1)',
        }}>
          <style>{`@keyframes slideUpFooter { from { transform: translateY(100%); } to { transform: translateY(0); } }`}</style>
          <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>You have unsaved changes</div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button onClick={onDiscard} className="btn btn-ghost btn-md">Discard</button>
            <button onClick={onSave} className="btn btn-primary btn-md" style={{ background: 'var(--gradient-brand)', color: '#fff' }}>Save Changes</button>
          </div>
        </div>
      )}
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════
// C3 — MENTOR AVAILABILITY
// ═══════════════════════════════════════════════════════════════
const MentorAvailability = ({ navigate, mentor }) => {
  const initial = usMM2(() => ({
    days: JSON.parse(JSON.stringify((mentor || MENTOR_USER).days)),
    buffer: (mentor || MENTOR_USER).buffer,
    window: (mentor || MENTOR_USER).advanceBookingWindow,
    blockedDates: [...((mentor || MENTOR_USER).blockedDates || [])],
    timezone: (mentor || MENTOR_USER).timezone,
  }), [mentor]);
  const [draft, setDraft] = usM2(initial);
  const [saved, setSaved] = usM2(initial);
  const [savingAnim, setSavingAnim] = usM2(false);
  const [newDate, setNewDate] = usM2('');
  const dirty = JSON.stringify(draft) !== JSON.stringify(saved);

  const onSave = () => {
    setSavingAnim(true);
    setTimeout(() => { setSaved(draft); setSavingAnim(false); tToast('Availability updated ✓'); }, 600);
  };
  const onDiscard = () => setDraft(saved);

  const addBlockedDate = () => {
    if (!newDate) return;
    if (draft.blockedDates.includes(newDate)) return;
    setDraft(d => ({ ...d, blockedDates: [...d.blockedDates, newDate].sort() }));
    setNewDate('');
  };

  const fmtDate = (d) => {
    try { return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }); }
    catch { return d; }
  };

  const onBack = () => {
    if (dirty && !confirm('Discard unsaved changes?')) return;
    navigate('mentor-dashboard');
  };

  const seg = (val, setter, options) => (
    <div style={{ display: 'inline-flex', background: 'var(--bg-base)', border: '1px solid var(--border-default)', borderRadius: 10, padding: 3, gap: 2 }}>
      {options.map(o => {
        const active = val === o;
        return (
          <button key={o} onClick={() => setter(o)} style={{
            padding: '7px 14px', borderRadius: 8, fontSize: 12, fontWeight: 600,
            background: active ? 'var(--gradient-brand)' : 'transparent',
            color: active ? '#fff' : 'var(--text-secondary)',
            border: 'none', transition: 'all 180ms',
          }}>{o}</button>
        );
      })}
    </div>
  );

  return (
    <div style={{ maxWidth: 1080, margin: '0 auto', padding: '32px 40px 140px' }}>
      <button onClick={onBack} className="btn btn-ghost btn-sm" style={{ marginBottom: 16 }}>← Back to Dashboard</button>
      <h1 style={{ fontFamily: 'Fraunces', fontWeight: 500, fontSize: 36, margin: '0 0 8px' }}>Your Availability</h1>
      <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 28 }}>Set when you're open for bookings. Block specific dates under Exceptions.</p>

      {/* Weekly schedule */}
      <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 18, padding: 28, marginBottom: 18 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
          <h3 style={{ fontFamily: 'Inter', fontWeight: 600, fontSize: 16, margin: 0 }}>Weekly Schedule</h3>
          <MOSelect value={draft.timezone} onChange={v => setDraft(d => ({ ...d, timezone: v }))} options={['IST (UTC+5:30)','PST (UTC-8)','EST (UTC-5)','GMT (UTC)','SGT (UTC+8)']}/>
        </div>
        {window.AvailabilityGrid
          ? <AvailabilityGrid days={draft.days} onChange={(days) => setDraft(d => ({ ...d, days }))}/>
          : <div style={{ color: 'var(--text-tertiary)', fontSize: 13 }}>Loading grid…</div>}
      </div>

      {/* Settings */}
      <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 18, padding: 24, marginBottom: 18 }}>
        <h3 style={{ fontFamily: 'Inter', fontWeight: 600, fontSize: 16, margin: '0 0 16px' }}>Settings</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '180px 1fr', gap: 16, alignItems: 'center', rowGap: 14 }}>
          <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Buffer between sessions</div>
          <div>{seg(draft.buffer, v => setDraft(d => ({ ...d, buffer: v })), [0, 15, 30].map(v => v))}</div>
          <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Advance booking window</div>
          <div>{seg(draft.window, v => setDraft(d => ({ ...d, window: v })), ['1 week','2 weeks','1 month','3 months'])}</div>
        </div>
      </div>

      {/* Blocked dates */}
      <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 18, padding: 24 }}>
        <h3 style={{ fontFamily: 'Inter', fontWeight: 600, fontSize: 16, margin: '0 0 4px' }}>Exceptions / Blocked dates</h3>
        <p style={{ fontSize: 12, color: 'var(--text-tertiary)', margin: '0 0 14px' }}>Dates you can't take bookings (vacations, holidays, conferences)</p>
        <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
          <input type="date" value={newDate} onChange={e => setNewDate(e.target.value)} style={{ padding: '8px 12px', background: 'var(--bg-base)', border: '1px solid var(--border-default)', borderRadius: 10, fontSize: 13, fontFamily: 'Inter', color: 'var(--text-primary)' }}/>
          <button onClick={addBlockedDate} className="btn btn-ghost btn-sm" style={{ background: 'var(--bg-base)', border: '1px solid var(--border-default)' }}>+ Add</button>
        </div>
        {draft.blockedDates.length === 0 ? (
          <div style={{ fontSize: 13, color: 'var(--text-tertiary)', fontStyle: 'italic' }}>No blocked dates</div>
        ) : (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {draft.blockedDates.map(d => (
              <span key={d} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 12px', borderRadius: 999, background: 'var(--bg-base)', border: '1px solid var(--border-default)', fontSize: 12, color: 'var(--text-primary)' }}>
                {fmtDate(d)}
                <button onClick={() => setDraft(dd => ({ ...dd, blockedDates: dd.blockedDates.filter(x => x !== d) }))} style={{ background: 'transparent', color: 'var(--text-tertiary)', padding: 0, fontSize: 14, lineHeight: 1 }}>×</button>
              </span>
            ))}
          </div>
        )}
      </div>

      {dirty && (
        <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 80, background: 'var(--bg-surface)', borderTop: '1px solid var(--border-default)', boxShadow: '0 -8px 24px rgba(14,18,40,0.08)', padding: '14px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', animation: 'slideUpFooter 220ms cubic-bezier(0.16,1,0.3,1)' }}>
          <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Unsaved changes to your schedule</div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button onClick={onDiscard} className="btn btn-ghost btn-md">Discard</button>
            <button onClick={onSave} disabled={savingAnim} className="btn btn-primary btn-md" style={{ background: 'var(--gradient-brand)', color: '#fff', opacity: savingAnim ? 0.7 : 1 }}>{savingAnim ? 'Saving…' : 'Save Schedule'}</button>
          </div>
        </div>
      )}
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════
// C4 — MENTOR BOOKINGS  (Requests / Upcoming / Past / Cancelled)
// ═══════════════════════════════════════════════════════════════
const TYPE_ICON = { voice: 'mic', video: 'video' };

const TabBar = ({ tabs, active, onChange }) => (
  <div style={{ display: 'inline-flex', background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 12, padding: 4, gap: 2, marginBottom: 18 }}>
    {tabs.map(t => {
      const a = active === t.id;
      return (
        <button key={t.id} onClick={() => onChange(t.id)} style={{
          padding: '8px 16px', borderRadius: 8, fontSize: 13, fontWeight: 600,
          background: a ? 'var(--bg-base)' : 'transparent',
          color: a ? 'var(--text-primary)' : 'var(--text-secondary)',
          boxShadow: a ? 'inset 0 0 0 1px var(--border-default), 0 0 0 2px transparent' : 'none',
          borderBottom: a ? '3px solid transparent' : 'none',
          backgroundImage: a ? 'linear-gradient(var(--bg-base), var(--bg-base)), var(--gradient-brand)' : 'none',
          backgroundOrigin: a ? 'border-box' : '',
          backgroundClip: a ? 'padding-box, border-box' : '',
          display: 'inline-flex', alignItems: 'center', gap: 8,
          position: 'relative',
        }}>
          {t.label}
          {t.count > 0 && (
            <span style={{
              padding: '1px 7px', borderRadius: 999, fontSize: 11, fontWeight: 700,
              background: t.tint === 'amber' ? 'rgba(217,119,6,0.14)' : t.tint === 'mint' ? 'rgba(16,185,129,0.14)' : 'rgba(120,120,140,0.14)',
              color: t.tint === 'amber' ? 'var(--amber-600)' : t.tint === 'mint' ? 'var(--mint-600)' : 'var(--text-tertiary)',
            }}>{t.count}</span>
          )}
        </button>
      );
    })}
  </div>
);

const RequestCard = ({ req, onAccept, onDecline, onSuggest }) => {
  const [mode, setMode] = usM2('idle'); // idle | accept | decline | suggest | accepted | declined | suggested | leaving
  const [reason, setReason] = usM2(null);
  const [sdate, setSdate] = usM2(''); const [stime, setStime] = usM2('10:00 AM');

  const onConfirmAccept = () => {
    setMode('accepted');
    setTimeout(() => { setMode('leaving'); setTimeout(() => onAccept(req), 320); }, 700);
  };
  const onConfirmDecline = () => {
    setMode('declined');
    setTimeout(() => { setMode('leaving'); setTimeout(() => onDecline(req, reason), 320); }, 600);
  };
  const onSendSuggest = () => {
    setMode('suggested');
    onSuggest(req, { date: sdate, time: stime });
  };

  return (
    <div style={{
      background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)',
      borderLeft: `3px solid var(--${mode === 'accepted' ? 'mint' : mode === 'suggested' ? 'brand' : 'amber'}-500)`,
      borderRadius: 16, padding: 20,
      transition: 'all 320ms cubic-bezier(0.16,1,0.3,1)',
      transform: mode === 'leaving' ? 'translateX(40px)' : 'translateX(0)',
      opacity: mode === 'leaving' ? 0 : mode === 'suggested' ? 0.75 : 1,
      maxHeight: mode === 'leaving' ? 0 : 600, overflow: 'hidden',
      marginBottom: 12,
    }}>
      <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
        <Avatar name={req.student.name} size={48}/>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontFamily: 'Inter', fontWeight: 600, fontSize: 14 }}>{req.student.name} <span style={{ color: 'var(--text-tertiary)', fontWeight: 400, fontSize: 12 }}>· Requested {req.requestedAt}</span></div>
          <div style={{ display: 'flex', gap: 10, marginTop: 6, fontSize: 12, color: 'var(--text-secondary)', alignItems: 'center' }}>
            <span>{req.date}</span><span>·</span><span>{req.time}</span><span>·</span><span>{req.duration} min</span><span>·</span>
            <Icon name={TYPE_ICON[req.type]} size={13}/><span style={{ textTransform: 'capitalize' }}>{req.type}</span>
          </div>
          {req.topic && <div style={{ marginTop: 8, fontSize: 13 }}><span style={{ color: 'var(--text-tertiary)' }}>Topic: </span>{req.topic}</div>}
          {req.agenda && (
            <div style={{ marginTop: 10, padding: 12, background: 'var(--bg-base)', borderRadius: 10, border: '1px solid var(--border-subtle)', fontFamily: 'Instrument Sans', fontStyle: 'italic', fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              {req.agenda}
            </div>
          )}
        </div>
      </div>

      <div style={{ marginTop: 14, paddingTop: 14, borderTop: '1px solid var(--border-subtle)' }}>
        {mode === 'idle' && (
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={() => setMode('accept')} style={{ padding: '8px 14px', borderRadius: 10, background: 'var(--gradient-brand)', color: '#fff', fontSize: 13, fontWeight: 600 }}>✓ Accept</button>
            <button onClick={() => setMode('decline')} style={{ padding: '8px 14px', borderRadius: 10, background: 'transparent', border: '1px solid rgba(239,68,68,0.35)', color: 'var(--error)', fontSize: 13, fontWeight: 600 }}>✗ Decline</button>
            <button onClick={() => setMode('suggest')} className="btn btn-ghost btn-sm">⟳ Suggest other time</button>
          </div>
        )}
        {mode === 'accept' && (
          <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
            <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Send confirmation to {req.student.name}?</span>
            <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
              <button onClick={() => setMode('idle')} className="btn btn-ghost btn-sm">← Back</button>
              <button onClick={onConfirmAccept} style={{ padding: '8px 14px', borderRadius: 10, background: 'var(--gradient-brand)', color: '#fff', fontSize: 13, fontWeight: 600 }}>Confirm Accept</button>
            </div>
          </div>
        )}
        {mode === 'decline' && (
          <div>
            <div style={{ fontSize: 12, color: 'var(--text-tertiary)', marginBottom: 8 }}>Choose a reason:</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 10 }}>
              {['Schedule conflict','Outside my expertise','Bad fit for topic','Other'].map(r => (
                <button key={r} onClick={() => setReason(r)} style={{
                  padding: '6px 12px', borderRadius: 999, fontSize: 12, fontWeight: 500,
                  background: reason === r ? 'var(--brand-50)' : 'var(--bg-base)',
                  color: reason === r ? 'var(--brand-700)' : 'var(--text-secondary)',
                  border: `1px solid ${reason === r ? 'var(--brand-300)' : 'var(--border-default)'}`,
                }}>{r}</button>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button onClick={() => { setMode('idle'); setReason(null); }} className="btn btn-ghost btn-sm">← Back</button>
              <button onClick={onConfirmDecline} disabled={!reason} style={{ padding: '8px 14px', borderRadius: 10, background: reason ? 'var(--error)' : 'var(--bg-base)', color: reason ? '#fff' : 'var(--text-tertiary)', fontSize: 13, fontWeight: 600, opacity: reason ? 1 : 0.6 }}>Confirm Decline</button>
            </div>
          </div>
        )}
        {mode === 'suggest' && (
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
            <input type="date" value={sdate} onChange={e => setSdate(e.target.value)} style={{ padding: '8px 10px', background: 'var(--bg-base)', border: '1px solid var(--border-default)', borderRadius: 10, fontSize: 12, fontFamily: 'Inter', color: 'var(--text-primary)' }}/>
            <select value={stime} onChange={e => setStime(e.target.value)} style={{ padding: '8px 10px', background: 'var(--bg-base)', border: '1px solid var(--border-default)', borderRadius: 10, fontSize: 12, fontFamily: 'Inter', color: 'var(--text-primary)' }}>
              {['9:00 AM','10:00 AM','11:00 AM','12:00 PM','2:00 PM','3:00 PM','4:00 PM','5:00 PM','6:00 PM','7:00 PM'].map(t => <option key={t}>{t}</option>)}
            </select>
            <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
              <button onClick={() => setMode('idle')} className="btn btn-ghost btn-sm">← Back</button>
              <button onClick={onSendSuggest} disabled={!sdate} style={{ padding: '8px 14px', borderRadius: 10, background: sdate ? 'var(--gradient-brand)' : 'var(--bg-base)', color: sdate ? '#fff' : 'var(--text-tertiary)', fontSize: 13, fontWeight: 600 }}>Send Suggestion</button>
            </div>
          </div>
        )}
        {mode === 'accepted' && <div style={{ color: 'var(--mint-600)', fontWeight: 600, fontSize: 13 }}>✓ Accepted · Confirmation sent</div>}
        {mode === 'declined' && <div style={{ color: 'var(--error)', fontWeight: 600, fontSize: 13 }}>✗ Declined</div>}
        {mode === 'suggested' && <div style={{ color: 'var(--brand-600)', fontWeight: 600, fontSize: 13 }}>⟳ Suggestion sent — waiting on {req.student.name}</div>}
      </div>
    </div>
  );
};

const UpcomingCard = ({ s, navigate, onCancel }) => {
  const [menuOpen, setMenuOpen] = usM2(false);
  const [expanded, setExpanded] = usM2(false);
  const isSoon = s.date === 'Today' && /AM|PM/.test(s.time);
  return (
    <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderLeft: '3px solid var(--mint-500)', borderRadius: 16, padding: 20, marginBottom: 12, display: 'flex', gap: 14, alignItems: 'flex-start' }}>
      <Avatar name={s.student.name} size={48}/>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontFamily: 'Inter', fontWeight: 600, fontSize: 14 }}>{s.student.name}</span>
          <span style={{ padding: '2px 8px', borderRadius: 999, background: 'rgba(16,185,129,0.14)', color: 'var(--mint-600)', fontSize: 11, fontWeight: 600 }}>Confirmed ✓</span>
        </div>
        <div style={{ display: 'flex', gap: 10, marginTop: 6, fontSize: 12, color: 'var(--text-secondary)', alignItems: 'center' }}>
          <span>{s.date}</span><span>·</span><span>{s.time}</span><span>·</span><span>{s.duration} min</span><span>·</span>
          <Icon name={TYPE_ICON[s.type]} size={13}/><span style={{ textTransform: 'capitalize' }}>{s.type}</span>
        </div>
        {s.topic && <div style={{ marginTop: 6, fontSize: 13, color: 'var(--text-primary)' }}>{s.topic}</div>}
        {expanded && (
          <div style={{ marginTop: 10, padding: 12, background: 'var(--bg-base)', borderRadius: 10, fontFamily: 'Instrument Sans', fontStyle: 'italic', fontSize: 13, color: 'var(--text-secondary)' }}>
            Student note: Looking forward to going deep on this. I've prepared a few questions and a notebook with my current attempts.
          </div>
        )}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'flex-end', position: 'relative' }}>
        <span style={{ fontSize: 11, color: 'var(--text-tertiary)', fontWeight: 600 }}>{s.date === 'Today' ? 'Today' : `in ${s.date}`}</span>
        <button onClick={() => isSoon && navigate('mentor-live', { session: s })} disabled={!isSoon} style={{ padding: '7px 14px', borderRadius: 10, background: isSoon ? 'var(--gradient-brand)' : 'var(--bg-base)', color: isSoon ? '#fff' : 'var(--text-tertiary)', fontSize: 12, fontWeight: 600, opacity: isSoon ? 1 : 0.6 }}>Join Session</button>
        <div style={{ display: 'flex', gap: 6 }}>
          <button onClick={() => setExpanded(e => !e)} className="btn btn-ghost btn-sm" style={{ fontSize: 11 }}>{expanded ? 'Hide' : 'Agenda'}</button>
          <button onClick={() => setMenuOpen(o => !o)} className="btn btn-ghost btn-sm" style={{ fontSize: 14, padding: '4px 8px' }}>⋯</button>
        </div>
        {menuOpen && (
          <div style={{ position: 'absolute', top: 76, right: 0, background: 'var(--bg-surface)', border: '1px solid var(--border-default)', borderRadius: 10, boxShadow: 'var(--shadow-lg)', minWidth: 180, zIndex: 20 }}>
            <button onClick={() => { setMenuOpen(false); tToast('Reschedule request sent'); }} style={{ display: 'block', width: '100%', padding: '9px 14px', textAlign: 'left', background: 'transparent', fontSize: 13 }}>Reschedule</button>
            <button onClick={() => { setMenuOpen(false); onCancel(s); }} style={{ display: 'block', width: '100%', padding: '9px 14px', textAlign: 'left', background: 'transparent', fontSize: 13, color: 'var(--error)' }}>Cancel with message</button>
          </div>
        )}
      </div>
    </div>
  );
};

const MentorBookings = ({ navigate, initialTab }) => {
  const [tab, setTab] = usM2(initialTab || 'requests');
  const [requests, setRequests] = usM2(MENTOR_PENDING_REQUESTS);
  const [upcoming, setUpcoming] = usM2(MENTOR_UPCOMING);
  const [cancelled, setCancelled] = usM2(MENTOR_CANCELLED);

  const acceptReq = (req) => {
    setRequests(rs => rs.filter(r => r.id !== req.id));
    setUpcoming(u => [{ id: 'u-' + req.id, student: req.student, date: req.date, time: req.time, duration: req.duration, type: req.type, topic: req.topic }, ...u]);
    tToast(`Accepted · Email sent to ${req.student.name}`);
  };
  const declineReq = (req, reason) => {
    setRequests(rs => rs.filter(r => r.id !== req.id));
    tToast(`Request declined · ${reason || ''}`);
  };
  const suggestReq = (req) => { tToast('Suggestion sent — waiting on student'); };
  const cancelSession = (s) => {
    setUpcoming(u => u.filter(x => x.id !== s.id));
    setCancelled(c => [{ id: 'c-' + s.id, student: s.student, date: s.date, time: s.time, duration: s.duration, type: s.type, topic: s.topic, refundStatus: `Refunded ₹${Math.round((s.duration === 60 ? 999 : 499) * 0.85)}`, cancelledBy: 'mentor' }, ...c]);
    tToast('Session cancelled · Student notified');
  };

  const tabs = [
    { id: 'requests',  label: 'Requests',  count: requests.length, tint: 'amber' },
    { id: 'upcoming',  label: 'Upcoming',  count: upcoming.length, tint: 'mint' },
    { id: 'past',      label: 'Past',      count: 0,                tint: 'neutral' },
    { id: 'cancelled', label: 'Cancelled', count: cancelled.length, tint: 'neutral' },
  ];

  return (
    <div style={{ maxWidth: 1080, margin: '0 auto', padding: '32px 40px 80px' }}>
      <h1 style={{ fontFamily: 'Fraunces', fontWeight: 500, fontSize: 36, margin: '0 0 6px' }}>Bookings</h1>
      <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 24 }}>Manage incoming requests and your upcoming schedule</p>
      <TabBar tabs={tabs} active={tab} onChange={setTab}/>

      {tab === 'requests' && (
        requests.length === 0
          ? <EmptyState msg="No pending requests right now 🌱" cta={{ label: 'Update availability', onClick: () => navigate('mentor-availability') }}/>
          : requests.map(req => <RequestCard key={req.id} req={req} onAccept={acceptReq} onDecline={declineReq} onSuggest={suggestReq}/>)
      )}
      {tab === 'upcoming' && (
        upcoming.length === 0
          ? <EmptyState msg="No upcoming sessions" cta={{ label: 'Update availability', onClick: () => navigate('mentor-availability') }}/>
          : upcoming.map(s => <UpcomingCard key={s.id} s={s} navigate={navigate} onCancel={cancelSession}/>)
      )}
      {tab === 'past' && (
        MENTOR_PAST.map(p => (
          <div key={p.id} style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderLeft: '3px solid var(--border-default)', borderRadius: 16, padding: 18, marginBottom: 10, opacity: 0.85, display: 'flex', gap: 14, alignItems: 'center' }}>
            <Avatar name={p.student.name} size={40}/>
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: 'Inter', fontWeight: 600, fontSize: 14 }}>{p.student.name}</div>
              <div style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>{p.date} · {p.time} · {p.duration} min · {p.topic}</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontFamily: 'Fraunces', fontWeight: 600, fontSize: 17, color: 'var(--mint-600)' }}>+₹{p.revenueNet}</div>
              <button onClick={() => tToast('Notes drawer stub', 'amber')} className="btn btn-ghost btn-sm" style={{ fontSize: 11, marginTop: 2 }}>View Notes</button>
            </div>
          </div>
        ))
      )}
      {tab === 'cancelled' && (
        cancelled.length === 0
          ? <EmptyState msg="No cancellations"/>
          : cancelled.map(c => (
            <div key={c.id} style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderLeft: '3px solid var(--border-default)', borderRadius: 16, padding: 18, marginBottom: 10, opacity: 0.7, display: 'flex', gap: 14, alignItems: 'center' }}>
              <Avatar name={c.student.name} size={40}/>
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: 'Inter', fontWeight: 600, fontSize: 14 }}>{c.student.name}</div>
                <div style={{ fontSize: 12, color: 'var(--text-tertiary)', textDecoration: 'line-through' }}>{c.date} · {c.time} · {c.topic}</div>
                <div style={{ fontSize: 11, color: 'var(--text-tertiary)', marginTop: 3 }}>Cancelled by {c.cancelledBy}</div>
              </div>
              <span style={{ padding: '4px 10px', borderRadius: 999, background: 'rgba(16,185,129,0.12)', color: 'var(--mint-600)', fontSize: 11, fontWeight: 600 }}>{c.refundStatus}</span>
            </div>
          ))
      )}
    </div>
  );
};

const EmptyState = ({ msg, cta }) => (
  <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-tertiary)' }}>
    <div style={{ fontFamily: 'Fraunces', fontStyle: 'italic', fontSize: 18, marginBottom: 14 }}>{msg}</div>
    {cta && <button onClick={cta.onClick} className="btn btn-ghost btn-sm" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-default)' }}>{cta.label}</button>}
  </div>
);

// ═══════════════════════════════════════════════════════════════
// MENTOR EARNINGS
// ═══════════════════════════════════════════════════════════════
const MONTHLY_DATA = [
  { month: 'Nov', earned: 12400 },
  { month: 'Dec', earned: 15800 },
  { month: 'Jan', earned: 18200 },
  { month: 'Feb', earned: 14600 },
  { month: 'Mar', earned: 21300 },
  { month: 'Apr', earned: 19700 },
  { month: 'May', earned: 9800 },
];

const TRANSACTIONS = [
  { student: 'Rahul Sharma', type: 'Video · 60 min', date: 'May 10, 2026', amount: 999, status: 'paid' },
  { student: 'Priya Gupta',  type: 'Video · 30 min', date: 'May 9, 2026',  amount: 599, status: 'paid' },
  { student: 'Arjun Mehta',  type: 'Voice · 60 min', date: 'May 7, 2026',  amount: 899, status: 'paid' },
  { student: 'Kavya Iyer',   type: 'Video · 60 min', date: 'May 5, 2026',  amount: 999, status: 'paid' },
  { student: 'Dev Rathi',    type: 'Video · 30 min', date: 'May 2, 2026',  amount: 599, status: 'pending' },
  { student: 'Meera Nair',   type: 'Voice · 60 min', date: 'Apr 30, 2026', amount: 899, status: 'paid' },
  { student: 'Rohan Gupta',  type: 'Video · 60 min', date: 'Apr 28, 2026', amount: 999, status: 'paid' },
];

const MentorEarnings = ({ navigate }) => {
  const maxEarned = Math.max(...MONTHLY_DATA.map(d => d.earned));
  const thisMonth = MONTHLY_DATA[MONTHLY_DATA.length - 1];
  const lastMonth = MONTHLY_DATA[MONTHLY_DATA.length - 2];
  const totalEarned = MONTHLY_DATA.reduce((s, d) => s + d.earned, 0);
  const pending = TRANSACTIONS.filter(t => t.status === 'pending').reduce((s, t) => s + t.amount, 0);

  return (
    <div className="page">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32 }}>
        <h1 className="font-display" style={{ fontSize: 44, fontWeight: 500, letterSpacing: '-0.02em' }}>Earnings</h1>
        <button className="btn btn-ghost btn-md"><Icon name="trending" size={15}/> Request payout</button>
      </div>

      {/* Summary cards */}
      <div className="stagger-in" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 36 }}>
        {[
          { label: 'This month', value: `₹${thisMonth.earned.toLocaleString()}`, sub: `vs ₹${lastMonth.earned.toLocaleString()} last month`, color: 'var(--mint-600)' },
          { label: 'Pending payout', value: `₹${pending.toLocaleString()}`, sub: 'Clears in 3-5 days', color: 'var(--gold-600)' },
          { label: 'Total earned', value: `₹${totalEarned.toLocaleString()}`, sub: 'Last 7 months', color: 'var(--brand-600)' },
          { label: 'Sessions',    value: `${TRANSACTIONS.length}`, sub: 'This month', color: 'var(--text-secondary)' },
        ].map(s => (
          <div key={s.label} className="card lift" style={{ padding: 22 }}>
            <div className="label-sm">{s.label}</div>
            <div className="font-display" style={{ fontSize: 32, fontWeight: 500, marginTop: 10, letterSpacing: '-0.03em', color: s.color }}>{s.value}</div>
            <div style={{ fontSize: 12, color: 'var(--text-tertiary)', marginTop: 6 }}>{s.sub}</div>
          </div>
        ))}
      </div>

      {/* Monthly bar chart */}
      <div className="card" style={{ padding: 28, marginBottom: 28 }}>
        <h3 className="font-heading" style={{ fontSize: 16, fontWeight: 600, marginBottom: 24 }}>Monthly earnings</h3>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 12, height: 160 }}>
          {MONTHLY_DATA.map((d, i) => {
            const isLast = i === MONTHLY_DATA.length - 1;
            const pct = (d.earned / maxEarned) * 100;
            return (
              <div key={d.month} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                <div style={{ fontSize: 11, fontFamily: 'JetBrains Mono', color: 'var(--text-tertiary)', opacity: isLast ? 1 : 0.7 }}>₹{(d.earned/1000).toFixed(1)}k</div>
                <div style={{
                  width: '100%', height: `${pct}%`, minHeight: 4,
                  background: isLast ? 'var(--gradient-brand)' : 'var(--bg-subtle)',
                  border: isLast ? 'none' : '1px solid var(--border-default)',
                  borderRadius: '6px 6px 0 0',
                  transition: 'height 600ms var(--ease-out-expo)',
                  boxShadow: isLast ? 'var(--shadow-brand)' : 'none',
                }}/>
                <div style={{ fontSize: 11, color: 'var(--text-tertiary)', fontFamily: 'Inter', fontWeight: isLast ? 600 : 400 }}>{d.month}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Transaction list */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '18px 24px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center' }}>
          <h3 className="font-heading" style={{ fontSize: 16, fontWeight: 600, flex: 1 }}>Transactions</h3>
          <button className="btn btn-ghost btn-sm"><Icon name="trending" size={13}/> Export CSV</button>
        </div>
        {TRANSACTIONS.map((t, i) => (
          <div key={i} style={{
            display: 'flex', alignItems: 'center', gap: 14, padding: '16px 24px',
            borderBottom: i < TRANSACTIONS.length - 1 ? '1px solid var(--border-subtle)' : 'none',
            transition: 'background 160ms',
          }}
            onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
          >
            <Avatar name={t.student} size={36}/>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontFamily: 'Inter', fontWeight: 600, fontSize: 14 }}>{t.student}</div>
              <div style={{ fontSize: 12, color: 'var(--text-tertiary)', marginTop: 2 }}>{t.type} · {t.date}</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontFamily: 'JetBrains Mono', fontWeight: 600, fontSize: 15, color: 'var(--text-primary)' }}>₹{t.amount.toLocaleString()}</div>
              <span style={{
                fontSize: 10, fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase',
                padding: '2px 8px', borderRadius: 999, marginTop: 4, display: 'inline-block',
                background: t.status === 'paid' ? 'var(--mint-100)' : 'var(--gold-100)',
                color: t.status === 'paid' ? 'var(--mint-700)' : 'var(--gold-700)',
              }}>{t.status}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════
// MENTOR REVIEWS
// ═══════════════════════════════════════════════════════════════
const MENTOR_REVIEWS_DATA = [
  { student: 'Rahul S.', rating: 5, date: 'May 10, 2026', topic: 'Statistics · A/B testing', body: 'Dr. Iyer explained everything so clearly. I finally understand hypothesis testing after 3 months of confusion. Highly recommend!', responded: false },
  { student: 'Kavya I.', rating: 5, date: 'May 5, 2026',  topic: 'Machine learning', body: 'Amazing session. She caught my conceptual gap in gradient descent immediately and fixed it in 10 minutes.', responded: true, response: 'Thank you Kavya! Really enjoyed our session.' },
  { student: 'Dev R.',   rating: 4, date: 'Apr 28, 2026', topic: 'Time series', body: 'Very knowledgeable. Could have slowed down a bit in the ARIMA section, but overall excellent.', responded: false },
  { student: 'Meera N.', rating: 5, date: 'Apr 20, 2026', topic: 'Data Science', body: 'Best mentor I\'ve had on this platform. Priya goes above and beyond — even sent notes after the session!', responded: true, response: 'Always happy to go the extra mile 🙏' },
  { student: 'Arjun P.', rating: 5, date: 'Apr 15, 2026', topic: 'Pandas · Data wrangling', body: 'She helped me debug a tricky merge issue I\'d been stuck on for days. Straight to the point, no fluff.', responded: false },
];

const StarDisplay = ({ rating, size = 14 }) => (
  <div style={{ display: 'flex', gap: 2 }}>
    {[1,2,3,4,5].map(s => (
      <svg key={s} width={size} height={size} viewBox="0 0 24 24" fill={s <= rating ? 'var(--gold-500)' : 'var(--bg-subtle)'} stroke={s <= rating ? 'var(--gold-500)' : 'var(--border-default)'} strokeWidth="1.5">
        <path d="m12 3 2.9 6 6.6.6-5 4.4 1.5 6.5L12 17l-6 3.5 1.5-6.5-5-4.4 6.6-.6L12 3Z"/>
      </svg>
    ))}
  </div>
);

const MentorReviews = ({ navigate }) => {
  const [respondingTo, setRespondingTo] = useState(null);
  const [responseText, setResponseText] = useState('');
  const [reviews, setReviews] = useState(MENTOR_REVIEWS_DATA);
  const avgRating = (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1);
  const dist = [5,4,3,2,1].map(n => ({ stars: n, count: reviews.filter(r => r.rating === n).length }));

  const submitResponse = (i) => {
    if (!responseText.trim()) return;
    setReviews(rs => rs.map((r, idx) => idx === i ? { ...r, responded: true, response: responseText } : r));
    setRespondingTo(null);
    setResponseText('');
  };

  return (
    <div className="page">
      <h1 className="font-display" style={{ fontSize: 44, fontWeight: 500, letterSpacing: '-0.02em', marginBottom: 32 }}>Reviews</h1>

      {/* Summary */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 20, marginBottom: 32 }}>
        <div className="card" style={{ padding: 28, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
          <div className="font-display" style={{ fontSize: 72, fontWeight: 500, letterSpacing: '-0.04em', color: 'var(--text-primary)', lineHeight: 1 }}>{avgRating}</div>
          <StarDisplay rating={Math.round(avgRating)} size={20}/>
          <div style={{ fontSize: 13, color: 'var(--text-tertiary)', marginTop: 4 }}>{reviews.length} reviews total</div>
        </div>
        <div className="card" style={{ padding: 28, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 10 }}>
          {dist.map(d => (
            <div key={d.stars} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontFamily: 'JetBrains Mono', fontSize: 12, width: 14, color: 'var(--text-tertiary)' }}>{d.stars}</span>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="var(--gold-400)" stroke="none"><path d="m12 3 2.9 6 6.6.6-5 4.4 1.5 6.5L12 17l-6 3.5 1.5-6.5-5-4.4 6.6-.6L12 3Z"/></svg>
              <div style={{ flex: 1, height: 8, background: 'var(--bg-subtle)', borderRadius: 999, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${(d.count / reviews.length) * 100}%`, background: 'var(--gold-400)', borderRadius: 999, transition: 'width 600ms var(--ease-out-expo)' }}/>
              </div>
              <span style={{ fontFamily: 'JetBrains Mono', fontSize: 12, width: 20, textAlign: 'right', color: 'var(--text-tertiary)' }}>{d.count}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Review list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {reviews.map((r, i) => (
          <div key={i} className="card" style={{ padding: 24 }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 12 }}>
              <Avatar name={r.student} size={40}/>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                  <span style={{ fontFamily: 'Inter', fontWeight: 600, fontSize: 14 }}>{r.student}</span>
                  <StarDisplay rating={r.rating}/>
                  <span style={{ fontSize: 12, color: 'var(--text-tertiary)', marginLeft: 'auto' }}>{r.date}</span>
                </div>
                <div style={{ fontSize: 12, color: 'var(--text-tertiary)', marginTop: 2 }}>{r.topic}</div>
              </div>
            </div>
            <p style={{ fontSize: 14, lineHeight: 1.6, color: 'var(--text-primary)', marginBottom: r.responded || respondingTo === i ? 16 : 0 }}>{r.body}</p>

            {r.responded && (
              <div style={{ background: 'var(--bg-subtle)', borderRadius: 12, padding: '12px 16px', borderLeft: '3px solid var(--brand-400)' }}>
                <div className="label-sm" style={{ marginBottom: 6 }}>Your response</div>
                <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5 }}>{r.response}</p>
              </div>
            )}

            {!r.responded && respondingTo === i && (
              <div className="fade-in" style={{ marginTop: 8 }}>
                <textarea value={responseText} onChange={e => setResponseText(e.target.value)}
                  placeholder="Write a thoughtful response…"
                  className="textarea" style={{ minHeight: 80, marginBottom: 10 }}/>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button className="btn btn-ghost btn-sm" onClick={() => { setRespondingTo(null); setResponseText(''); }}>Cancel</button>
                  <button className="btn btn-brand btn-sm" onClick={() => submitResponse(i)} disabled={!responseText.trim()}>Submit response</button>
                </div>
              </div>
            )}

            {!r.responded && respondingTo !== i && (
              <button onClick={() => { setRespondingTo(i); setResponseText(''); }}
                style={{ marginTop: 8, fontSize: 13, fontWeight: 500, color: 'var(--brand-500)', display: 'flex', alignItems: 'center', gap: 4 }}>
                <Icon name="chat" size={13}/> Respond to this review
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════
// MENTOR SETTINGS
// ═══════════════════════════════════════════════════════════════
const MentorSettings = ({ navigate }) => {
  const [section, setSection] = useState('profile');
  const nav = [
    ['profile', 'Profile visibility', 'settings'],
    ['payments', 'Payments & payouts', 'trending'],
    ['notifications', 'Notifications', 'bell'],
    ['account', 'Account', 'lock'],
  ];

  return (
    <div className="page">
      <h1 className="font-display" style={{ fontSize: 44, fontWeight: 500, letterSpacing: '-0.02em', marginBottom: 32 }}>Mentor Settings</h1>
      <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: 32 }}>
        <nav style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {nav.map(([id, label, icon]) => (
            <button key={id} onClick={() => setSection(id)} style={{
              display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 10,
              background: section === id ? 'var(--bg-hover)' : 'transparent',
              color: section === id ? 'var(--text-primary)' : 'var(--text-secondary)',
              fontFamily: 'Inter', fontWeight: section === id ? 600 : 500, fontSize: 14,
              transition: 'all 180ms',
            }}>
              <Icon name={icon} size={15}/> {label}
            </button>
          ))}
        </nav>

        <div className="fade-in" key={section} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {section === 'profile' && (
            <div className="card" style={{ padding: 26 }}>
              <h3 className="font-heading" style={{ fontSize: 16, fontWeight: 600, marginBottom: 18 }}>Profile visibility</h3>
              {[
                ['Show full name', 'Display your full name publicly', true],
                ['Show email', 'Visible to booked students only', false],
                ['Show LinkedIn', 'Link to your LinkedIn profile', true],
                ['Featured mentor', 'Appear in homepage spotlight', true],
                ['Accept instant bookings', 'Students can book without prior approval', true],
                ['Show rating publicly', 'Your rating is visible on your profile', true],
              ].map(([title, sub, on], i, a) => (
                <MentorSettingToggle key={title} title={title} sub={sub} defaultOn={on} last={i === a.length - 1}/>
              ))}
            </div>
          )}

          {section === 'payments' && (
            <>
              <div className="card" style={{ padding: 26 }}>
                <h3 className="font-heading" style={{ fontSize: 16, fontWeight: 600, marginBottom: 18 }}>Payout account</h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 18px', background: 'var(--bg-subtle)', borderRadius: 12, marginBottom: 16 }}>
                  <div style={{ width: 40, height: 40, borderRadius: 12, background: 'var(--brand-100)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Icon name="trending" size={18} style={{ color: 'var(--brand-600)' }}/>
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontFamily: 'Inter', fontWeight: 600, fontSize: 14 }}>HDFC Bank · ••••4291</div>
                    <div style={{ fontSize: 12, color: 'var(--text-tertiary)', marginTop: 2 }}>Primary payout account</div>
                  </div>
                  <button className="btn btn-ghost btn-sm">Change</button>
                </div>
                <button className="btn btn-ghost btn-sm"><Icon name="plus" size={14}/> Add account</button>
              </div>
              <div className="card" style={{ padding: 26 }}>
                <h3 className="font-heading" style={{ fontSize: 16, fontWeight: 600, marginBottom: 14 }}>Payout schedule</h3>
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                  {['Weekly (every Monday)', 'Bi-weekly', 'Monthly (1st)'].map((opt, i) => (
                    <button key={opt} style={{
                      padding: '8px 16px', borderRadius: 999, fontSize: 13, fontFamily: 'Inter', fontWeight: 500,
                      background: i === 0 ? 'var(--text-primary)' : 'var(--bg-surface)',
                      color: i === 0 ? '#fff' : 'var(--text-secondary)',
                      border: i === 0 ? 'none' : '1px solid var(--border-default)',
                      transition: 'all 180ms',
                    }}>{opt}</button>
                  ))}
                </div>
                <div style={{ marginTop: 16, padding: '12px 16px', background: 'var(--mint-100)', borderRadius: 10, display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                  <Icon name="check" size={14} style={{ color: 'var(--mint-700)', marginTop: 2, flexShrink: 0 }}/>
                  <div style={{ fontSize: 12, color: 'var(--mint-700)', lineHeight: 1.5 }}>Elm Origin takes a <strong>15% platform fee</strong>. You keep 85% of each session fee. Taxes are your responsibility — download your earnings report for your records.</div>
                </div>
              </div>
            </>
          )}

          {section === 'notifications' && (
            <div className="card" style={{ padding: 26 }}>
              <h3 className="font-heading" style={{ fontSize: 16, fontWeight: 600, marginBottom: 14 }}>Notify me about</h3>
              {[
                ['New booking requests', 'When a student requests a session', true],
                ['Session reminders', '15 min before each session', true],
                ['New reviews', 'When a student leaves a review', true],
                ['Payout processed', 'When your weekly payout clears', true],
                ['Platform updates', 'Product changes and announcements', false],
                ['Student messages', 'Direct messages from students', true],
              ].map(([title, sub, on], i, a) => (
                <MentorSettingToggle key={title} title={title} sub={sub} defaultOn={on} last={i === a.length - 1}/>
              ))}
            </div>
          )}

          {section === 'account' && (
            <>
              <div className="card" style={{ padding: 26 }}>
                <h3 className="font-heading" style={{ fontSize: 16, fontWeight: 600, marginBottom: 14 }}>Account</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                  <div>
                    <div className="label-sm" style={{ marginBottom: 6 }}>Full name</div>
                    <input className="input" defaultValue="Dr. Priya Iyer"/>
                  </div>
                  <div>
                    <div className="label-sm" style={{ marginBottom: 6 }}>Email</div>
                    <input className="input" defaultValue="priya.iyer@research.iitb.ac.in"/>
                  </div>
                </div>
                <button className="btn btn-brand btn-md" style={{ marginTop: 18 }}>Save changes</button>
              </div>
              <div className="card" style={{ padding: 26 }}>
                <h3 className="font-heading" style={{ fontSize: 16, fontWeight: 600, marginBottom: 14 }}>Security</h3>
                <MentorSettingRow title="Password" sub="Last changed 2 months ago" right={<button className="btn btn-ghost btn-sm">Change</button>} last/>
              </div>
              <div className="card" style={{ padding: 26, borderColor: 'var(--danger-100)' }}>
                <h3 className="font-heading" style={{ fontSize: 15, fontWeight: 600, color: 'var(--danger-500)', marginBottom: 8 }}>Pause profile</h3>
                <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 14 }}>Pausing hides your profile from search and prevents new bookings. Existing bookings are unaffected.</p>
                <button style={{ height: 36, padding: '0 16px', borderRadius: 999, border: '1px solid var(--danger-500)', color: 'var(--danger-500)', fontSize: 13, fontWeight: 600 }}>Pause profile</button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

const MentorSettingRow = ({ title, sub, right, last }) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 0', borderBottom: last ? 'none' : '1px solid var(--border-subtle)' }}>
    <div>
      <div style={{ fontFamily: 'Inter', fontWeight: 500, fontSize: 14 }}>{title}</div>
      <div style={{ fontSize: 12, color: 'var(--text-tertiary)', marginTop: 2 }}>{sub}</div>
    </div>
    {right}
  </div>
);

const MentorSettingToggle = ({ title, sub, defaultOn, last }) => {
  const [on, setOn] = useState(defaultOn);
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 0', borderBottom: last ? 'none' : '1px solid var(--border-subtle)' }}>
      <div>
        <div style={{ fontFamily: 'Inter', fontWeight: 500, fontSize: 14 }}>{title}</div>
        <div style={{ fontSize: 12, color: 'var(--text-tertiary)', marginTop: 2 }}>{sub}</div>
      </div>
      <button onClick={() => setOn(!on)} style={{
        width: 42, height: 24, borderRadius: 999,
        background: on ? 'var(--text-primary)' : 'var(--bg-subtle)',
        position: 'relative', transition: 'background 220ms', flexShrink: 0,
      }}>
        <div style={{ position: 'absolute', top: 2, left: on ? 20 : 2, width: 20, height: 20, borderRadius: 999, background: '#fff', boxShadow: 'var(--shadow-xs)', transition: 'left 240ms var(--ease-spring)' }}/>
      </button>
    </div>
  );
};

// Exports
Object.assign(window, { MentorProfileEdit, MentorAvailability, MentorBookings, MentorEarnings, MentorReviews, MentorSettings });
