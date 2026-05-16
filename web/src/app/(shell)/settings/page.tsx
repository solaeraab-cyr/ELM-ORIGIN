'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Avatar from '@/components/primitives/Avatar';
import Icon from '@/components/primitives/Icon';
import { createClient } from '@/lib/supabase/client';

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

const NOTIF_KEYS = [
  'session_reminders',
  'mentor_responses',
  'study_partner_requests',
  'community_mentions',
  'interview_matches',
  'weekly_digest',
  'marketing',
] as const;
type NotifKey = typeof NOTIF_KEYS[number];
const NOTIF_DEFAULTS: Record<NotifKey, boolean> = {
  session_reminders: true,
  mentor_responses: true,
  study_partner_requests: true,
  community_mentions: true,
  interview_matches: true,
  weekly_digest: false,
  marketing: false,
};
const NOTIF_LABELS: Record<NotifKey, [string, string]> = {
  session_reminders: ['Session reminders', '15 min before each session'],
  mentor_responses: ['Mentor responses', 'When a mentor replies'],
  study_partner_requests: ['Study partner requests', 'When a peer wants to study with you'],
  community_mentions: ['Community mentions', 'Someone @s you'],
  interview_matches: ['Interview matches', 'When a peer match is found'],
  weekly_digest: ['Weekly digest', 'Study summary every Sunday'],
  marketing: ['Marketing', 'New features and product updates'],
};

function NotifToggleRow({ notifKey, notifs, setNotifs, last }: { notifKey: NotifKey; notifs: Record<NotifKey, boolean>; setNotifs: (k: NotifKey, v: boolean) => void; last?: boolean }) {
  const on = notifs[notifKey];
  const [label, sub] = NOTIF_LABELS[notifKey];
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 0', borderBottom: last ? 'none' : '1px solid var(--border-subtle)' }}>
      <div>
        <div style={{ fontWeight: 500, fontSize: 14 }}>{label}</div>
        <div style={{ fontSize: 12, color: 'var(--text-tertiary)', marginTop: 2 }}>{sub}</div>
      </div>
      <button onClick={() => setNotifs(notifKey, !on)} style={{
        width: 42, height: 24, borderRadius: 999,
        background: on ? 'var(--text-primary)' : 'var(--bg-subtle, var(--bg-hover))',
        position: 'relative', transition: 'background 220ms', flexShrink: 0,
      }}>
        <div style={{ position: 'absolute', top: 2, left: on ? 20 : 2, width: 20, height: 20, borderRadius: 999, background: '#fff', boxShadow: 'var(--shadow-xs)', transition: 'left 240ms var(--ease-spring)' }} />
      </button>
    </div>
  );
}

const CARD: React.CSSProperties = { background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 16, padding: 26 };

export default function SettingsPage() {
  const router = useRouter();
  const [section, setSection] = useState('account');
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>('light');
  const [deleteText, setDeleteText] = useState('');
  const [deleteConfirmed, setDeleteConfirmed] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  // User data from Supabase
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [handle, setHandle] = useState('');
  const [plan, setPlan] = useState('Free');
  const [loading, setLoading] = useState(true);

  // Notification prefs from localStorage
  const [notifs, setNotifsState] = useState<Record<NotifKey, boolean>>(NOTIF_DEFAULTS);

  useEffect(() => {
    const stored = localStorage.getItem('elmorigin:theme') as 'light' | 'dark' | 'system' | null;
    if (stored) setTheme(stored);

    // Load notification prefs
    const notifStored = localStorage.getItem('elmorigin:notifs');
    if (notifStored) {
      try {
        const parsed = JSON.parse(notifStored);
        setNotifsState(prev => ({ ...prev, ...parsed }));
      } catch { /* ignore */ }
    }

    // Load user data
    const supabase = createClient();
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) { setLoading(false); return; }
      setEmail(user.email ?? '');
      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name, handle, plan')
        .eq('id', user.id)
        .single();
      if (profile) {
        setFullName(profile.full_name ?? user.email?.split('@')[0] ?? '');
        setHandle(profile.handle ?? '');
        setPlan(profile.plan ?? 'Free');
      }
      setLoading(false);
    });
  }, []);

  const setNotifs = useCallback((key: NotifKey, value: boolean) => {
    setNotifsState(prev => {
      const next = { ...prev, [key]: value };
      localStorage.setItem('elmorigin:notifs', JSON.stringify(next));
      return next;
    });
  }, []);

  const applyTheme = (t: 'light' | 'dark' | 'system') => {
    setTheme(t);
    localStorage.setItem('elmorigin:theme', t);
    const resolved = t === 'system'
      ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
      : t;
    document.documentElement.dataset.theme = resolved;
  };

  const handleSignOut = async () => {
    setSigningOut(true);
    const supabase = createClient();
    await supabase.auth.signOut();
    router.replace('/login');
  };

  const handleDeleteAccount = () => {
    setDeleteConfirmed(true);
  };

  const NAV = [
    ['account', 'Account', 'settings'],
    ['subscription', 'Subscription', 'star'],
    ['appearance', 'Appearance', 'sparkles'],
    ['notifications', 'Notifications', 'bell'],
    ['help', 'Help', 'chat'],
  ] as const;

  const displayName = fullName || email.split('@')[0] || 'User';

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
          <div style={{ marginTop: 'auto', paddingTop: 16 }}>
            <button
              onClick={handleSignOut}
              disabled={signingOut}
              style={{
                display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px',
                borderRadius: 10, width: '100%',
                background: 'transparent',
                color: '#ef4444',
                fontWeight: 500, fontSize: 14,
                transition: 'all 180ms', textAlign: 'left',
                opacity: signingOut ? 0.6 : 1,
              }}
            >
              <Icon name="logout" size={15} /> {signingOut ? 'Signing out…' : 'Sign out'}
            </button>
          </div>
        </nav>

        {/* Content */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          {section === 'account' && (
            <>
              <div style={CARD}>
                <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 18 }}>Profile</h3>
                {loading ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {[68, 40, 40].map((h, i) => (
                      <div key={i} style={{ height: h, borderRadius: 10, background: 'var(--bg-hover)', animation: 'pulse 1.5s ease-in-out infinite' }} />
                    ))}
                  </div>
                ) : (
                  <>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 22 }}>
                      <Avatar name={displayName} size={68} />
                      <div>
                        <div style={{ fontWeight: 600 }}>{displayName}</div>
                        {handle && <div style={{ fontSize: 12, color: 'var(--text-tertiary)', marginTop: 2 }}>@{handle}</div>}
                      </div>
                      <Link href="/profile" style={{ marginLeft: 'auto', height: 34, padding: '0 14px', borderRadius: 999, background: 'var(--bg-hover)', border: '1px solid var(--border-default)', fontSize: 13, fontWeight: 500, textDecoration: 'none', color: 'var(--text-primary)', display: 'flex', alignItems: 'center' }}>Edit profile</Link>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                      {([['Full name', fullName || '—'], ['Email', email]] as const).map(([label, val]) => (
                        <div key={label}>
                          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.06em', color: 'var(--text-tertiary)', textTransform: 'uppercase', marginBottom: 6 }}>{label}</div>
                          <input
                            readOnly
                            value={val}
                            style={{ width: '100%', height: 40, padding: '0 12px', background: 'var(--bg-base)', border: '1px solid var(--border-default)', borderRadius: 10, fontSize: 14, color: 'var(--text-primary)', outline: 'none', cursor: 'default' }}
                          />
                        </div>
                      ))}
                    </div>
                    <p style={{ fontSize: 12, color: 'var(--text-tertiary)', marginTop: 12 }}>
                      To edit your name or handle, visit your <Link href="/profile" style={{ color: 'var(--text-primary)', fontWeight: 500 }}>Profile page</Link>.
                    </p>
                  </>
                )}
              </div>

              <div style={CARD}>
                <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 14 }}>Security</h3>
                <SettingRow title="Password" sub="Manage your password via email reset" right={<button style={{ height: 32, padding: '0 14px', borderRadius: 999, background: 'var(--bg-hover)', border: '1px solid var(--border-default)', fontSize: 13, fontWeight: 500 }}>Reset</button>} />
                <SettingRow title="Sign out of all devices" sub="Revokes all active sessions" right={
                  <button
                    onClick={handleSignOut}
                    disabled={signingOut}
                    style={{ height: 32, padding: '0 14px', borderRadius: 999, background: 'var(--bg-hover)', border: '1px solid var(--border-default)', fontSize: 13, fontWeight: 500, opacity: signingOut ? 0.6 : 1 }}
                  >
                    {signingOut ? 'Signing out…' : 'Sign out'}
                  </button>
                } last />
              </div>

              <div style={{ ...CARD, borderColor: 'rgba(239,68,68,0.25)' }}>
                <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 6, color: '#ef4444' }}>Danger zone</h3>
                {deleteConfirmed ? (
                  <div style={{ padding: '16px', background: 'rgba(239,68,68,0.06)', borderRadius: 10, border: '1px solid rgba(239,68,68,0.15)' }}>
                    <p style={{ fontSize: 14, fontWeight: 600, color: '#ef4444', marginBottom: 6 }}>Account deletion requires support</p>
                    <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: 12 }}>
                      To delete your account and all associated data, please contact our support team. We'll process your request within 48 hours.
                    </p>
                    <div style={{ display: 'flex', gap: 10 }}>
                      <button
                        onClick={() => { setDeleteConfirmed(false); setDeleteText(''); }}
                        style={{ height: 34, padding: '0 14px', borderRadius: 999, background: 'var(--bg-hover)', border: '1px solid var(--border-default)', fontSize: 13, fontWeight: 500 }}
                      >Cancel</button>
                      <button
                        style={{ height: 34, padding: '0 14px', borderRadius: 999, background: '#ef4444', color: '#fff', fontSize: 13, fontWeight: 600 }}
                        onClick={() => setSection('help')}
                      >Contact support</button>
                    </div>
                  </div>
                ) : (
                  <>
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
                      onClick={handleDeleteAccount}
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
                  </>
                )}
              </div>
            </>
          )}

          {section === 'subscription' && (
            <div style={{ ...CARD, background: 'linear-gradient(135deg, rgba(245,158,11,0.05), rgba(217,119,6,0.02))' }}>
              <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', color: 'var(--amber-600)', textTransform: 'uppercase' }}>Current plan</span>
              {loading ? (
                <div style={{ height: 48, width: 240, borderRadius: 10, background: 'var(--bg-hover)', marginTop: 10, animation: 'pulse 1.5s ease-in-out infinite' }} />
              ) : (
                <h2 style={{ fontFamily: 'Fraunces, serif', fontSize: 40, fontWeight: 500, fontStyle: 'italic', marginTop: 10, letterSpacing: '-0.02em' }}>
                  Elm Origin {plan}
                </h2>
              )}
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
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 0' }}>
                  <div>
                    <div style={{ fontWeight: 500, fontSize: 14 }}>Reduce motion</div>
                    <div style={{ fontSize: 12, color: 'var(--text-tertiary)', marginTop: 2 }}>Disables animations and transitions</div>
                  </div>
                  <button
                    onClick={() => setNotifs('session_reminders', !notifs.session_reminders)}
                    style={{
                      width: 42, height: 24, borderRadius: 999,
                      background: 'var(--bg-subtle, var(--bg-hover))',
                      position: 'relative', flexShrink: 0,
                    }}
                  >
                    <div style={{ position: 'absolute', top: 2, left: 2, width: 20, height: 20, borderRadius: 999, background: '#fff', boxShadow: 'var(--shadow-xs)' }} />
                  </button>
                </div>
              </div>
            </>
          )}

          {section === 'notifications' && (
            <div style={CARD}>
              <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 14 }}>What to notify me about</h3>
              {NOTIF_KEYS.map((key, i) => (
                <NotifToggleRow
                  key={key}
                  notifKey={key}
                  notifs={notifs}
                  setNotifs={setNotifs}
                  last={i === NOTIF_KEYS.length - 1}
                />
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
