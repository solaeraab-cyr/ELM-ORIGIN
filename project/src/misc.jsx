/* global React, Icon, Avatar, SubjectGlyph */
const { useState } = React;

// ═══════════════════════════════════════
// COMMUNITY — minimal, light
// ═══════════════════════════════════════
const Community = () => {
  const [channel, setChannel] = useState('world');
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([
    { who: 'Ananya R.', country: '🇮🇳', msg: 'Anyone working on JEE mocks tonight? Need a partner for 10pm.', time: '2:14 PM' },
    { who: 'Vikram S.', country: '🇮🇳', msg: 'System design interview tomorrow 😬 wish me luck', time: '2:16 PM' },
    { who: 'Elena R.', country: '🇮🇹', msg: 'That thesis writing room yesterday was incredible, thanks everyone', time: '2:18 PM' },
    { who: 'You',      country: '🇮🇳', msg: "Good luck Vikram! I've got a LeetCode session at 8, join if you want", time: '2:20 PM', me: true },
    { who: 'Dev M.',   country: '🇺🇸', msg: 'Anyone have good resources for organic chem reaction mechanisms?', time: '2:22 PM' },
    { who: 'Sara T.',  country: '🇸🇬', msg: '@Dev I can share my flashcard deck, DM me', time: '2:23 PM' },
  ]);

  const send = () => {
    if (!input.trim()) return;
    setMessages(m => [...m, { who: 'You', country: '🇮🇳', msg: input, time: 'now', me: true }]);
    setInput('');
  };

  const channels = [
    { id: 'world', label: 'World chat', icon: '🌐', count: 3241 },
    { id: 'cs',    label: 'computer-science', count: 842 },
    { id: 'math',  label: 'mathematics', count: 612 },
    { id: 'phys',  label: 'physics', count: 391 },
    { id: 'write', label: 'writing', count: 240 },
  ];

  return (
    <div style={{ display: 'flex', height: 'calc(100vh - 68px)', overflow: 'hidden' }}>
      {/* Channels */}
      <aside style={{ width: 240, flexShrink: 0, borderRight: '1px solid var(--border-subtle)', padding: 20, display: 'flex', flexDirection: 'column', gap: 4 }}>
        <div className="label-sm" style={{ padding: '4px 10px 10px' }}>Channels</div>
        {channels.map(c => (
          <button key={c.id} onClick={() => setChannel(c.id)} style={{
            display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px', borderRadius: 10,
            background: channel === c.id ? 'var(--bg-hover)' : 'transparent',
            color: channel === c.id ? 'var(--text-primary)' : 'var(--text-secondary)',
            fontFamily: 'Inter', fontWeight: channel === c.id ? 600 : 500, fontSize: 14,
            transition: 'all 160ms',
          }}
            onMouseEnter={e => { if (channel !== c.id) e.currentTarget.style.background = 'var(--bg-hover)'; }}
            onMouseLeave={e => { if (channel !== c.id) e.currentTarget.style.background = 'transparent'; }}
          >
            <span style={{ color: 'var(--text-tertiary)', fontSize: 14 }}>{c.icon || '#'}</span>
            <span style={{ flex: 1, textAlign: 'left' }}>{c.label}</span>
            <span style={{ fontSize: 10, color: 'var(--text-tertiary)', fontFamily: 'JetBrains Mono' }}>{c.count}</span>
          </button>
        ))}

        <div className="label-sm" style={{ padding: '20px 10px 10px' }}>Friends · online</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, padding: '0 10px' }}>
          {['A','V','M','R','S','D','P','K'].map((n, i) => (
            <div key={i} style={{ position: 'relative', transition: 'transform 180ms' }}
              onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
              onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
            >
              <Avatar name={n} size={30} tint={i}/>
              {i < 3 && <div style={{ position: 'absolute', bottom: 0, right: 0, width: 8, height: 8, borderRadius: 999, background: 'var(--mint-500)', border: '1.5px solid var(--bg-base)' }}/>}
            </div>
          ))}
        </div>
      </aside>

      {/* Chat */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '20px 32px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 22 }}>🌐</span>
          <div>
            <div className="font-heading" style={{ fontSize: 16, fontWeight: 600 }}>World chat</div>
            <div style={{ fontSize: 12, color: 'var(--text-tertiary)', marginTop: 2 }}>Global student community</div>
          </div>
          <div style={{ flex: 1 }}/>
          <span className="chip chip-sm"><span style={{ width: 6, height: 6, borderRadius: 999, background: 'var(--mint-500)', display: 'inline-block' }}/> 3,241 online</span>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '24px 32px', display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ flex: 1, height: 1, background: 'var(--border-subtle)' }}/>
            <span className="label-sm">Today</span>
            <div style={{ flex: 1, height: 1, background: 'var(--border-subtle)' }}/>
          </div>
          {messages.map((m, i) => (
            <div key={i} className="fade-in-up" style={{ display: 'flex', gap: 10, alignItems: 'start', flexDirection: m.me ? 'row-reverse' : 'row' }}>
              <Avatar name={m.who} size={32} tint={i}/>
              <div style={{ maxWidth: '60%' }}>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 4, justifyContent: m.me ? 'flex-end' : 'flex-start' }}>
                  <span style={{ fontFamily: 'Inter', fontWeight: 600, fontSize: 13 }}>{m.who}</span>
                  <span style={{ fontSize: 12 }}>{m.country}</span>
                  <span style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>{m.time}</span>
                </div>
                <div style={{
                  padding: '12px 16px',
                  background: m.me ? 'var(--text-primary)' : 'var(--bg-surface)',
                  color: m.me ? '#fff' : 'var(--text-primary)',
                  border: m.me ? 'none' : '1px solid var(--border-subtle)',
                  borderRadius: m.me ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                  fontSize: 14, lineHeight: 1.5,
                }}>{m.msg}</div>
              </div>
            </div>
          ))}
        </div>

        <div style={{ padding: 24 }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 6, padding: 6,
            background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)',
            borderRadius: 999, boxShadow: 'var(--shadow-xs)',
            transition: 'all 200ms',
          }}>
            <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') send(); }}
              placeholder="Message the world…"
              style={{ flex: 1, height: 40, padding: '0 16px', background: 'transparent', border: 'none', outline: 'none', color: 'var(--text-primary)', fontSize: 14 }}/>
            <button onClick={send} style={{
              width: 38, height: 38, borderRadius: 999,
              background: input.trim() ? 'var(--text-primary)' : 'var(--bg-hover)',
              color: input.trim() ? '#fff' : 'var(--text-muted)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'all 220ms',
            }}><Icon name="send" size={14}/></button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════
// SETTINGS — light, minimal
// ═══════════════════════════════════════
const Settings = ({ user, navigate }) => {
  const [section, setSection] = useState('account');
  const nav = [
    ['account','Account','settings'],
    ['subscription','Subscription','star'],
    ['appearance','Appearance','sparkles'],
    ['notifications','Notifications','bell'],
    ['help','Help','chat'],
  ];
  return (
    <div className="page">
      <h1 className="font-display" style={{ fontSize: 44, fontWeight: 500, letterSpacing: '-0.02em', marginBottom: 32 }}>Settings</h1>
      <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: 32 }}>
        <nav style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {nav.map(([id, label, icon]) => (
            <button key={id} onClick={() => setSection(id)} style={{
              display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px',
              borderRadius: 10,
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
          {section === 'account' && (
            <>
              <div className="card" style={{ padding: 26 }}>
                <h3 className="font-heading" style={{ fontSize: 16, fontWeight: 600, marginBottom: 18 }}>Profile</h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 22 }}>
                  <Avatar name={user.name} size={68}/>
                  <div>
                    <div className="font-heading" style={{ fontWeight: 600 }}>{user.name}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-tertiary)', marginTop: 2 }}>@{user.name.toLowerCase().replace(' ','')}</div>
                  </div>
                  <button className="btn btn-ghost btn-sm" style={{ marginLeft: 'auto' }}>Change photo</button>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                  <div>
                    <div className="label-sm" style={{ marginBottom: 6 }}>Full name</div>
                    <input className="input" defaultValue={user.name}/>
                  </div>
                  <div>
                    <div className="label-sm" style={{ marginBottom: 6 }}>Email</div>
                    <input className="input" defaultValue="arjun@elmorigin.com"/>
                  </div>
                </div>
              </div>
              <div className="card" style={{ padding: 26 }}>
                <h3 className="font-heading" style={{ fontSize: 16, fontWeight: 600, marginBottom: 14 }}>Security</h3>
                <SettingRow title="Password" sub="Last changed 3 months ago" right={<button className="btn btn-ghost btn-sm">Change</button>}/>
                <SettingRow title="Two-factor auth" sub="Authenticator app enabled" right={<span className="chip chip-sm" style={{ background: 'var(--mint-100)', color: 'var(--mint-700)', borderColor: 'transparent' }}>On</span>} last/>
              </div>
            </>
          )}
          {section === 'subscription' && (
            <div className="card" style={{ padding: 32, background: 'linear-gradient(135deg, rgba(245,158,11,0.05), rgba(217,119,6,0.02))' }}>
              <span className="label-sm" style={{ color: 'var(--amber-600)' }}>Current plan</span>
              <h2 className="font-display" style={{ fontSize: 40, fontWeight: 500, fontStyle: 'italic', marginTop: 10, letterSpacing: '-0.02em' }}>Elm Origin Pro</h2>
              <div style={{ fontSize: 14, color: 'var(--text-secondary)', marginTop: 6 }}>₹499/month · Renews Nov 30, 2026</div>
              <div style={{ display: 'flex', gap: 10, marginTop: 24 }}>
                <button className="btn btn-ghost btn-md">Change plan</button>
                <button className="btn btn-ghost btn-md">View invoices</button>
              </div>
            </div>
          )}
          {section === 'appearance' && (
            <div className="card" style={{ padding: 26 }}>
              <h3 className="font-heading" style={{ fontSize: 16, fontWeight: 600, marginBottom: 16 }}>Theme</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
                {[['Light','Soft & bright',true],['Dark','Midnight',false],['System','Follow OS',false]].map(([n,d,active], i) => (
                  <button key={n} className="card card-hover" style={{ padding: 14, textAlign: 'left', borderColor: active ? 'var(--text-primary)' : 'var(--border-subtle)' }}>
                    <div style={{ height: 56, borderRadius: 8, background: i === 0 ? 'linear-gradient(135deg, #FFFFFF, #F3F4F8)' : i === 1 ? 'linear-gradient(135deg, #0E1228, #232845)' : 'linear-gradient(90deg, #FFFFFF 50%, #0E1228 50%)', marginBottom: 10, border: '1px solid var(--border-subtle)' }}/>
                    <div className="font-heading" style={{ fontSize: 13, fontWeight: 600 }}>{n}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-tertiary)', marginTop: 2 }}>{d}</div>
                  </button>
                ))}
              </div>
            </div>
          )}
          {section === 'notifications' && (
            <div className="card" style={{ padding: 26 }}>
              <h3 className="font-heading" style={{ fontSize: 16, fontWeight: 600, marginBottom: 14 }}>What to notify me about</h3>
              {[
                ['Session reminders','15 min before each session',true],
                ['Mentor responses','When a mentor replies',true],
                ['Community mentions','Someone @s you',true],
                ['Weekly digest','Every Sunday',false],
                ['Marketing','New features',false],
              ].map(([n,d,on], i, a) => <ToggleRow key={n} title={n} sub={d} defaultOn={on} last={i === a.length-1}/>)}
            </div>
          )}
          {section === 'help' && (
            <>
              <div className="card" style={{ padding: 32 }}>
                <h3 className="font-heading" style={{ fontSize: 18, fontWeight: 600, marginBottom: 10 }}>Help & support</h3>
                <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.6 }}>Browse our knowledge base, or reach out — we respond within 4 hours.</p>
                <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
                  <button className="btn btn-ghost btn-md">Knowledge base</button>
                  <button className="btn btn-primary btn-md">Contact support</button>
                </div>
              </div>
              <div className="card" style={{ padding: 26, marginTop: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                  <span style={{ fontFamily: 'JetBrains Mono', fontSize: 10, fontWeight: 600, letterSpacing: '0.10em', color: 'var(--text-tertiary)', textTransform: 'uppercase', padding: '3px 7px', border: '1px solid var(--border-default)', borderRadius: 4 }}>DEV</span>
                  <h3 className="font-heading" style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-secondary)', margin: 0 }}>Preview screens</h3>
                </div>
                <p style={{ fontSize: 13, color: 'var(--text-tertiary)', marginBottom: 16 }}>Jump directly to utility & error screens.</p>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  <button className="btn btn-ghost btn-sm" onClick={() => navigate && navigate('404')}>Preview 404</button>
                  <button className="btn btn-ghost btn-sm" onClick={() => navigate && navigate('500')}>Preview 500</button>
                  <button className="btn btn-ghost btn-sm" onClick={() => navigate && navigate('maintenance')}>Preview Maintenance</button>
                  <button className="btn btn-ghost btn-sm" onClick={() => navigate && navigate('session-expired')}>Preview Session Expired</button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

const SettingRow = ({ title, sub, right, last }) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 0', borderBottom: last ? 'none' : '1px solid var(--border-subtle)' }}>
    <div>
      <div style={{ fontFamily: 'Inter', fontWeight: 500, fontSize: 14 }}>{title}</div>
      <div style={{ fontSize: 12, color: 'var(--text-tertiary)', marginTop: 2 }}>{sub}</div>
    </div>
    {right}
  </div>
);

const ToggleRow = ({ title, sub, defaultOn, last }) => {
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
        position: 'relative', transition: 'background 220ms',
      }}>
        <div style={{ position: 'absolute', top: 2, left: on ? 20 : 2, width: 20, height: 20, borderRadius: 999, background: '#fff', boxShadow: 'var(--shadow-xs)', transition: 'left 240ms var(--ease-spring)' }}/>
      </button>
    </div>
  );
};

window.Community = Community;
window.Settings = Settings;
