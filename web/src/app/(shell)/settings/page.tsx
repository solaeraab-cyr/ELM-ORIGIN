'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Avatar from '@/components/primitives/Avatar';
import Icon from '@/components/primitives/Icon';

function SettingRow({ title, sub, right, last }: { title: string; sub: string; right: React.ReactNode; last?: boolean }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 0', borderBottom: last ? 'none' : '1px solid var(--border-subtle)' }}>
      <div>
        <div style={{ fontWeight: 500, fontSize: 14 }}>{title}</div>
        <div style={{ fontSize: 12, color: 'var(--text-tertiary)', marginTop: 2 }}>{sub}</div>
      </div>
      {right}
    </div>
  );
}

function Toggle({ defaultOn }: { defaultOn: boolean }) {
  const [on, setOn] = useState(defaultOn);
  return (
    <button onClick={() => setOn(o => !o)} style={{
      width: 42, height: 24, borderRadius: 999,
      background: on ? 'var(--text-primary)' : 'var(--bg-subtle, var(--bg-hover))',
      position: 'relative', transition: 'background 220ms', flexShrink: 0,
    }}>
      <div style={{ position: 'absolute', top: 2, left: on ? 20 : 2, width: 20, height: 20, borderRadius: 999, background: '#fff', boxShadow: 'var(--shadow-xs)', transition: 'left 240ms var(--ease-spring)' }} />
    </button>
  );
}

function ToggleRow({ title, sub, defaultOn, last }: { title: string; sub: string; defaultOn: boolean; last?: boolean }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 0', borderBottom: last ? 'none' : '1px solid var(--border-subtle)' }}>
      <div>
        <div style={{ fontWeight: 500, fontSize: 14 }}>{title}</div>
        <div style={{ fontSize: 12, color: 'var(--text-tertiary)', marginTop: 2 }}>{sub}</div>
      </div>
      <Toggle defaultOn={defaultOn} />
    </div>
  );
}

const CARD: React.CSSProperties = { background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 16, padding: 26 };

export default function SettingsPage() {
  const [section, setSection] = useState('account');
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>('light');
  const [deleteText, setDeleteText] = useState('');

  useEffect(() => {
    const stored = localStorage.getItem('elmorigin:theme') as 'light' | 'dark' | 'system' | null;
    if (stored) setTheme(stored);
  }, []);

  const applyTheme = (t: 'light' | 'dark' | 'system') => {
    setTheme(t);
    localStorage.setItem('elmorigin:theme', t);
    const resolved = t === 'system'
      ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
      : t;
    document.documentElement.dataset.theme = resolved;
  };

  const NAV = [
    ['account', 'Account', 'settings'],
    ['subscription', 'Subscription', 'star'],
    ['appearance', 'Appearance', 'sparkles'],
    ['notifications', 'Notifications', 'bell'],
    ['help', 'Help', 'chat'],
  ] as const;

  return (
    <div style={{ padding: '32px 40px', maxWidth: 1000, margin: '0 auto' }}>
      <h1 style={{ fontFamily: 'Fraunces, serif', fontSize: 44, fontWeight: 500, letterSpacing: '-0.02em', marginBottom: 32 }}>Settings</h1>

      <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: 32 }}>
        {/* Left nav */}
        <nav style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {NAV.map(([id, label, icon]) => (
            <button key={id} onClick={() => setSection(id)} style={{
              display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px',
              borderRadius: 10,
              background: section === id ? 'var(--bg-hover)' : 'transparent',
              color: section === id ? 'var(--text-primary)' : 'var(--text-secondary)',
              fontWeight: section === id ? 600 : 500, fontSize: 14,
              transition: 'all 180ms', textAlign: 'left',
            }}>
              <Icon name={icon} size={15} /> {label}
            </button>
          ))}
        </nav>

        {/* Content */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          {section === 'account' && (
            <>
              <div style={CARD}>
                <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 18 }}>Profile</h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 22 }}>
                  <Avatar name="Arjun Patel" size={68} />
                  <div>
                    <div style={{ fontWeight: 600 }}>Arjun Patel</div>
                    <div style={{ fontSize: 12, color: 'var(--text-tertiary)', marginTop: 2 }}>@arjunp</div>
                  </div>
                  <button style={{ marginLeft: 'auto', height: 34, padding: '0 14px', borderRadius: 999, background: 'var(--bg-hover)', border: '1px solid var(--border-default)', fontSize: 13, fontWeight: 500 }}>Change photo</button>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                  {([['Full name', 'Arjun Patel'], ['Email', 'arjun@elmorigin.com'], ['Username', 'arjunp'], ['Timezone', 'IST (UTC+5:30)']] as const).map(([label, val]) => (
                    <div key={label}>
                      <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.06em', color: 'var(--text-tertiary)', textTransform: 'uppercase', marginBottom: 6 }}>{label}</div>
                      <input defaultValue={val} style={{ width: '100%', height: 40, padding: '0 12px', background: 'var(--bg-base)', border: '1px solid var(--border-default)', borderRadius: 10, fontSize: 14, color: 'var(--text-primary)', outline: 'none' }} />
                    </div>
                  ))}
                </div>
                <button style={{ marginTop: 18, height: 36, padding: '0 18px', borderRadius: 999, background: 'var(--gradient-brand)', color: '#fff', fontSize: 13, fontWeight: 600 }}>Save changes</button>
              </div>

              <div style={CARD}>
                <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 14 }}>Security</h3>
                <SettingRow title="Password" sub="Last changed 3 months ago" right={<button style={{ height: 32, padding: '0 14px', borderRadius: 999, background: 'var(--bg-hover)', border: '1px solid var(--border-default)', fontSize: 13, fontWeight: 500 }}>Change</button>} />
                <SettingRow title="Two-factor auth" sub="Authenticator app enabled" right={<span style={{ padding: '4px 10px', borderRadius: 999, background: 'rgba(16,185,129,0.10)', color: 'var(--mint-600)', fontSize: 12, fontWeight: 600 }}>On</span>} />
                <SettingRow title="Active sessions" sub="Signed in on 2 devices" right={<button style={{ height: 32, padding: '0 14px', borderRadius: 999, background: 'var(--bg-hover)', border: '1px solid var(--border-default)', fontSize: 13, fontWeight: 500 }}>Manage</button>} last />
              </div>

              <div style={{ ...CARD, borderColor: 'rgba(239,68,68,0.25)' }}>
                <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 6, color: '#ef4444' }}>Danger zone</h3>
                <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 14, lineHeight: 1.5 }}>
                  Deleting your account is permanent and cannot be undone. Type <strong>DELETE MY ACCOUNT</strong> to confirm.
                </p>
                <input
                  value={deleteText}
                  onChange={e => setDeleteText(e.target.value)}
                  placeholder="Type DELETE MY ACCOUNT"
                  style={{ width: '100%', height: 40, padding: '0 12px', background: 'var(--bg-base)', border: '1px solid var(--border-default)', borderRadius: 10, fontSize: 13, color: 'var(--text-primary)', outline: 'none', marginBottom: 12 }}
                />
                <button
                  disabled={deleteText !== 'DELETE MY ACCOUNT'}
                  style={{
                    height: 36, padding: '0 18px', borderRadius: 999,
                    border: '1px solid #ef4444',
                    color: deleteText === 'DELETE MY ACCOUNT' ? '#fff' : '#ef4444',
                    background: deleteText === 'DELETE MY ACCOUNT' ? '#ef4444' : 'transparent',
                    fontSize: 13, fontWeight: 600,
                    opacity: deleteText === 'DELETE MY ACCOUNT' ? 1 : 0.55,
                    transition: 'all 200ms',
                  }}
                >Delete account</button>
              </div>
            </>
          )}

          {section === 'subscription' && (
            <div style={{ ...CARD, background: 'linear-gradient(135deg, rgba(245,158,11,0.05), rgba(217,119,6,0.02))' }}>
              <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', color: 'var(--amber-600)', textTransform: 'uppercase' }}>Current plan</span>
              <h2 style={{ fontFamily: 'Fraunces, serif', fontSize: 40, fontWeight: 500, fontStyle: 'italic', marginTop: 10, letterSpacing: '-0.02em' }}>Elm Origin Free</h2>
              <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginTop: 8, lineHeight: 1.5 }}>Upgrade to Pro to unlock unlimited peer interviews, more collaborative rooms, and priority Nova access.</p>
              <Link href="/pricing" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, marginTop: 20, height: 40, padding: '0 20px', borderRadius: 999, background: 'var(--gradient-brand)', color: '#fff', fontSize: 14, fontWeight: 600, textDecoration: 'none' }}>
                <Icon name="sparkles" size={15} /> Upgrade to Pro
              </Link>
            </div>
          )}

          {section === 'appearance' && (
            <>
              <div style={CARD}>
                <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16 }}>Theme</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
                  {([
                    ['light', 'Light', 'Soft & bright', 'linear-gradient(135deg, #FFFFFF, #F3F4F8)'],
                    ['dark', 'Dark', 'Midnight', 'linear-gradient(135deg, #0E1228, #232845)'],
                    ['system', 'System', 'Follow OS', 'linear-gradient(90deg, #FFFFFF 50%, #0E1228 50%)'],
                  ] as const).map(([id, name, desc, preview]) => (
                    <button key={id} onClick={() => applyTheme(id)} style={{
                      padding: 14, textAlign: 'left', background: 'var(--bg-surface)',
                      border: `2px solid ${theme === id ? 'var(--text-primary)' : 'var(--border-subtle)'}`,
                      borderRadius: 14, transition: 'border-color 200ms', cursor: 'pointer',
                    }}>
                      <div style={{ height: 56, borderRadius: 8, background: preview, marginBottom: 10, border: '1px solid var(--border-subtle)' }} />
                      <div style={{ fontWeight: 600, fontSize: 13 }}>{name}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-tertiary)', marginTop: 2 }}>{desc}</div>
                      {theme === id && <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 4, color: 'var(--mint-600)', fontSize: 12, fontWeight: 600 }}><Icon name="check" size={12} /> Active</div>}
                    </button>
                  ))}
                </div>
              </div>
              <div style={CARD}>
                <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 14 }}>Accessibility</h3>
                <ToggleRow title="Reduce motion" sub="Disables animations and transitions" defaultOn={false} last />
              </div>
            </>
          )}

          {section === 'notifications' && (
            <div style={CARD}>
              <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 14 }}>What to notify me about</h3>
              {([
                ['Session reminders', '15 min before each session', true],
                ['Mentor responses', 'When a mentor replies', true],
                ['Study partner requests', 'When a peer wants to study with you', true],
                ['Community mentions', 'Someone @s you', true],
                ['Interview matches', 'When a peer match is found', true],
                ['Weekly digest', 'Study summary every Sunday', false],
                ['Marketing', 'New features and product updates', false],
              ] as const).map(([n, d, on], i, a) => (
                <ToggleRow key={n} title={n} sub={d} defaultOn={on} last={i === a.length - 1} />
              ))}
            </div>
          )}

          {section === 'help' && (
            <>
              <div style={CARD}>
                <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 10 }}>Help & support</h3>
                <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.6 }}>Browse our knowledge base, or reach out — we respond within 4 hours.</p>
                <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
                  <button style={{ height: 36, padding: '0 18px', borderRadius: 999, background: 'var(--bg-hover)', border: '1px solid var(--border-default)', fontSize: 13, fontWeight: 500 }}>Knowledge base</button>
                  <button style={{ height: 36, padding: '0 18px', borderRadius: 999, background: 'var(--gradient-brand)', color: '#fff', fontSize: 13, fontWeight: 600 }}>Contact support</button>
                </div>
              </div>
              <div style={CARD}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                  <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, fontWeight: 600, letterSpacing: '0.10em', color: 'var(--text-tertiary)', textTransform: 'uppercase', padding: '3px 7px', border: '1px solid var(--border-default)', borderRadius: 4 }}>DEV</span>
                  <h3 style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-secondary)', margin: 0 }}>Preview screens</h3>
                </div>
                <p style={{ fontSize: 13, color: 'var(--text-tertiary)', marginBottom: 16 }}>Jump directly to utility & error screens.</p>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {([['Preview Maintenance', '/maintenance'], ['Preview Session Expired', '/session-expired']] as const).map(([label, href]) => (
                    <Link key={label} href={href} style={{ height: 32, padding: '0 14px', borderRadius: 999, background: 'var(--bg-hover)', border: '1px solid var(--border-default)', fontSize: 13, fontWeight: 500, textDecoration: 'none', color: 'var(--text-primary)', display: 'flex', alignItems: 'center' }}>{label}</Link>
                  ))}
                </div>
              </div>
            </>
          )}

        </div>
      </div>
    </div>
  );
}
