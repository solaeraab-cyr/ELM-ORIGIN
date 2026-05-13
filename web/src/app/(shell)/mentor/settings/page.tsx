'use client';

import { useEffect, useState } from 'react';
import { Avatar, Icon } from '@/components/primitives';
import { MENTOR_PAYOUT } from '@/lib/mentor-data';
import { toast } from '@/lib/toast';

const cardStyle: React.CSSProperties = { background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 16, padding: 26 };
const inputStyle: React.CSSProperties = { width: '100%', height: 40, padding: '0 14px', background: 'var(--bg-base)', border: '1px solid var(--border-default)', borderRadius: 10, fontSize: 14, color: 'var(--text-primary)', outline: 'none' };
const labelStyle: React.CSSProperties = { fontSize: 11, fontWeight: 700, letterSpacing: '0.06em', color: 'var(--text-tertiary)', textTransform: 'uppercase', marginBottom: 6 };

function Toggle({ defaultOn }: { defaultOn: boolean }) {
  const [on, setOn] = useState(defaultOn);
  return (
    <button
      onClick={() => setOn(!on)}
      style={{
        width: 42, height: 24, borderRadius: 999, background: on ? 'var(--text-primary)' : 'var(--bg-hover)',
        position: 'relative', transition: 'background 220ms', flexShrink: 0,
      }}
    >
      <div style={{ position: 'absolute', top: 2, left: on ? 20 : 2, width: 20, height: 20, borderRadius: 999, background: '#fff', boxShadow: 'var(--shadow-xs)', transition: 'left 240ms var(--ease-spring)' }} />
    </button>
  );
}

function ToggleRow({ title, sub, defaultOn, last }: { title: string; sub: string; defaultOn: boolean; last?: boolean }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 0', borderBottom: last ? 'none' : '1px solid var(--border-subtle)', gap: 12 }}>
      <div>
        <div style={{ fontWeight: 500, fontSize: 14 }}>{title}</div>
        <div style={{ fontSize: 12, color: 'var(--text-tertiary)', marginTop: 2 }}>{sub}</div>
      </div>
      <Toggle defaultOn={defaultOn} />
    </div>
  );
}

function PayoutModal({ onClose, onSaved }: { onClose: () => void; onSaved: () => void }) {
  const [tab, setTab] = useState<'bank' | 'upi'>('bank');
  const [accName, setAccName] = useState('Priya Iyer');
  const [accNumber, setAccNumber] = useState('XXXXXXXX4291');
  const [ifsc, setIfsc] = useState('HDFC0001234');
  const [upi, setUpi] = useState(MENTOR_PAYOUT.upi);
  const [pan, setPan] = useState(MENTOR_PAYOUT.pan);
  const [verifyStage, setVerifyStage] = useState<'idle' | 'sent' | 'verifying' | 'success' | 'failed'>('idle');
  const [pennyInput, setPennyInput] = useState('');

  const panValid = /^[A-Z]{5}[0-9]{4}[A-Z]$/.test(pan);

  const sendPenny = () => {
    setVerifyStage('sent');
    setTimeout(() => setVerifyStage('verifying'), 1200);
  };
  const verifyPenny = () => {
    if (pennyInput.endsWith('7')) {
      setVerifyStage('success');
      setTimeout(() => { onSaved(); onClose(); }, 800);
    } else {
      setVerifyStage('failed');
    }
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(7,10,24,0.55)', backdropFilter: 'blur(6px)', zIndex: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div onClick={e => e.stopPropagation()} style={{ width: 480, maxWidth: '100%', maxHeight: '90vh', overflow: 'auto', background: 'var(--bg-surface)', borderRadius: 20, padding: 28, border: '1px solid var(--border-subtle)', boxShadow: 'var(--shadow-xl)' }}>
        <h3 style={{ fontFamily: 'Fraunces, serif', fontSize: 22, fontWeight: 600, marginBottom: 18 }}>Edit Payout Details</h3>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 4, padding: 4, background: 'var(--bg-hover)', borderRadius: 12, marginBottom: 18 }}>
          {(['bank', 'upi'] as const).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              style={{
                flex: 1, height: 36, borderRadius: 9, fontSize: 13, fontWeight: 600,
                background: tab === t ? 'var(--bg-surface)' : 'transparent',
                color: tab === t ? 'var(--text-primary)' : 'var(--text-secondary)',
                boxShadow: tab === t ? 'var(--shadow-xs)' : 'none',
              }}
            >{t === 'bank' ? '🏦 Bank Account' : '📱 UPI'}</button>
          ))}
        </div>

        {tab === 'bank' ? (
          <>
            <div style={{ marginBottom: 12 }}><div style={labelStyle}>Account holder name</div><input value={accName} onChange={e => setAccName(e.target.value)} style={inputStyle} /></div>
            <div style={{ marginBottom: 12 }}><div style={labelStyle}>Account number</div><input value={accNumber} onChange={e => setAccNumber(e.target.value)} style={inputStyle} /></div>
            <div style={{ marginBottom: 12 }}><div style={labelStyle}>IFSC code</div><input value={ifsc} onChange={e => setIfsc(e.target.value.toUpperCase())} style={{ ...inputStyle, fontFamily: 'JetBrains Mono, monospace' }} /></div>
          </>
        ) : (
          <div style={{ marginBottom: 12 }}>
            <div style={labelStyle}>UPI ID</div>
            <input value={upi} onChange={e => setUpi(e.target.value)} style={{ ...inputStyle, fontFamily: 'JetBrains Mono, monospace' }} />
          </div>
        )}

        <div style={{ marginBottom: 16 }}>
          <div style={labelStyle}>PAN number</div>
          <input
            value={pan}
            onChange={e => setPan(e.target.value.toUpperCase())}
            style={{ ...inputStyle, fontFamily: 'JetBrains Mono, monospace', borderColor: pan && !panValid ? '#ef4444' : 'var(--border-default)' }}
            placeholder="ABCDE1234F"
          />
          {pan && !panValid && <div style={{ fontSize: 11, color: '#ef4444', marginTop: 4 }}>Invalid format (e.g. ABCDE1234F)</div>}
        </div>

        {/* Penny-drop verification */}
        <div style={{ background: 'var(--bg-hover)', borderRadius: 12, padding: 16, marginBottom: 18 }}>
          <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 4 }}>Verify with penny-drop</div>
          <div style={{ fontSize: 12, color: 'var(--text-tertiary)', marginBottom: 12 }}>We&apos;ll send ₹1 to your account. Enter the exact paise amount we deposit to confirm.</div>
          {verifyStage === 'idle' && (
            <button onClick={sendPenny} style={{ height: 36, padding: '0 14px', borderRadius: 999, background: 'var(--text-primary)', color: '#fff', fontSize: 13, fontWeight: 600 }}>Send ₹1 verification</button>
          )}
          {verifyStage === 'sent' && (
            <div style={{ fontSize: 12, color: 'var(--brand-600)' }}>Sending verification deposit…</div>
          )}
          {(verifyStage === 'verifying' || verifyStage === 'failed') && (
            <div>
              <div style={{ fontSize: 12, color: verifyStage === 'failed' ? '#ef4444' : 'var(--mint-600)', marginBottom: 8 }}>
                {verifyStage === 'failed' ? 'Did not match. Try again — check your bank app.' : 'Deposit sent! Enter the paise amount.'}
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <input
                  value={pennyInput}
                  onChange={e => { setPennyInput(e.target.value); if (verifyStage === 'failed') setVerifyStage('verifying'); }}
                  placeholder="e.g. 47"
                  style={{ ...inputStyle, flex: 1, fontFamily: 'JetBrains Mono, monospace' }}
                />
                <button
                  onClick={verifyPenny}
                  disabled={!pennyInput}
                  style={{ height: 40, padding: '0 14px', borderRadius: 10, background: pennyInput ? 'var(--gradient-brand)' : 'var(--bg-surface)', color: pennyInput ? '#fff' : 'var(--text-tertiary)', fontSize: 13, fontWeight: 600 }}
                >Verify</button>
              </div>
            </div>
          )}
          {verifyStage === 'success' && (
            <div style={{ fontSize: 13, color: 'var(--mint-600)', fontWeight: 600 }}>✓ Account verified — saving…</div>
          )}
        </div>

        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          <button onClick={onClose} style={{ height: 38, padding: '0 16px', borderRadius: 999, background: 'var(--bg-hover)', border: '1px solid var(--border-default)', fontSize: 13, fontWeight: 500 }}>Cancel</button>
        </div>
      </div>
    </div>
  );
}

export default function MentorSettingsPage() {
  const [section, setSection] = useState<string>('account');
  const [payoutOpen, setPayoutOpen] = useState(false);
  const [schedule, setSchedule] = useState<'Instant' | 'Weekly' | 'Monthly'>(MENTOR_PAYOUT.schedule);
  const [deleteText, setDeleteText] = useState('');

  const NAV = [
    ['account', 'Account', 'settings'],
    ['payout', 'Payout & Banking', 'trending'],
    ['pricing', 'Session Pricing', 'star'],
    ['visibility', 'Profile Visibility', 'sparkles'],
    ['notifications', 'Notifications', 'bell'],
    ['appearance', 'Appearance', 'sparkles'],
    ['help', 'Help', 'chat'],
  ] as const;

  return (
    <div style={{ maxWidth: 1080, margin: '0 auto', padding: '32px 40px 80px' }}>
      <h1 style={{ fontFamily: 'Fraunces, serif', fontSize: 38, fontWeight: 500, letterSpacing: '-0.02em', marginBottom: 28 }}>Mentor Settings</h1>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 240px) minmax(0, 1fr)', gap: 32 }}>
        <nav style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {NAV.map(([id, label, icon]) => (
            <button
              key={id}
              onClick={() => setSection(id)}
              style={{
                display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 10,
                background: section === id ? 'var(--bg-hover)' : 'transparent',
                color: section === id ? 'var(--text-primary)' : 'var(--text-secondary)',
                fontWeight: section === id ? 600 : 500, fontSize: 14,
                textAlign: 'left',
              }}
            >
              <Icon name={icon} size={15} /> {label}
            </button>
          ))}
        </nav>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {section === 'account' && (
            <>
              <div style={cardStyle}>
                <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 18 }}>Profile</h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 22, flexWrap: 'wrap' }}>
                  <Avatar name="Dr. Priya Iyer" size={68} />
                  <div>
                    <div style={{ fontWeight: 600 }}>Dr. Priya Iyer</div>
                    <div style={{ fontSize: 12, color: 'var(--text-tertiary)', marginTop: 2 }}>priya.iyer@research.iitb.ac.in</div>
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14 }}>
                  <div><div style={labelStyle}>Full name</div><input defaultValue="Dr. Priya Iyer" style={inputStyle} /></div>
                  <div><div style={labelStyle}>Email</div><input defaultValue="priya.iyer@research.iitb.ac.in" style={inputStyle} /></div>
                </div>
                <button onClick={() => toast('Saved ✓')} style={{ marginTop: 18, height: 36, padding: '0 18px', borderRadius: 999, background: 'var(--gradient-brand)', color: '#fff', fontSize: 13, fontWeight: 600 }}>Save changes</button>
              </div>

              <div style={{ ...cardStyle, borderColor: 'rgba(239,68,68,0.25)' }}>
                <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 6, color: '#ef4444' }}>Danger zone</h3>
                <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 14, lineHeight: 1.5 }}>
                  Deleting your mentor account removes your profile, history, and pending bookings. Type <strong>DELETE MY ACCOUNT</strong> to confirm.
                </p>
                <input
                  value={deleteText}
                  onChange={e => setDeleteText(e.target.value)}
                  placeholder="Type DELETE MY ACCOUNT"
                  style={{ ...inputStyle, marginBottom: 12 }}
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
                  }}
                >Delete account</button>
              </div>
            </>
          )}

          {section === 'payout' && (
            <>
              <div style={cardStyle}>
                <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 18 }}>Payout account</h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 18px', background: 'var(--bg-hover)', borderRadius: 12, marginBottom: 16, flexWrap: 'wrap' }}>
                  <div style={{ width: 40, height: 40, borderRadius: 12, background: 'rgba(79,70,229,0.10)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--brand-600)' }}>
                    <Icon name="trending" size={18} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: 14 }}>{MENTOR_PAYOUT.method} · ••••{MENTOR_PAYOUT.accountLast4}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-tertiary)', marginTop: 2 }}>Primary payout account · UPI {MENTOR_PAYOUT.upi}</div>
                  </div>
                  <button onClick={() => setPayoutOpen(true)} style={{ height: 32, padding: '0 14px', borderRadius: 999, background: 'var(--bg-surface)', border: '1px solid var(--border-default)', fontSize: 13, fontWeight: 500 }}>Edit Payout Details</button>
                </div>
                <div style={{ ...labelStyle, marginBottom: 8 }}>PAN</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ padding: '6px 10px', borderRadius: 8, background: 'var(--bg-hover)', fontFamily: 'JetBrains Mono, monospace', fontSize: 13 }}>{MENTOR_PAYOUT.pan}</span>
                  <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--mint-600)' }}>✓ Verified</span>
                </div>
              </div>
              <div style={cardStyle}>
                <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 14 }}>Payout schedule</h3>
                <div style={{ display: 'inline-flex', background: 'var(--bg-hover)', borderRadius: 12, padding: 4, gap: 2, flexWrap: 'wrap' }}>
                  {(['Instant', 'Weekly', 'Monthly'] as const).map(s => {
                    const a = schedule === s;
                    return (
                      <button
                        key={s}
                        onClick={() => setSchedule(s)}
                        style={{
                          padding: '8px 14px', borderRadius: 9, fontSize: 13, fontWeight: 600,
                          background: a ? 'var(--bg-surface)' : 'transparent',
                          color: a ? 'var(--text-primary)' : 'var(--text-secondary)',
                          boxShadow: a ? 'var(--shadow-xs)' : 'none',
                        }}
                      >{s}{s === 'Instant' ? ' (2% fee)' : ''}</button>
                    );
                  })}
                </div>
                <div style={{ marginTop: 16, padding: '12px 16px', background: 'rgba(16,185,129,0.10)', borderRadius: 10, fontSize: 12, color: 'var(--mint-600)', lineHeight: 1.5 }}>
                  Elm Origin takes a 15% platform fee. You keep 85% of each session. Taxes are your responsibility.
                </div>
              </div>
            </>
          )}

          {section === 'pricing' && (
            <div style={cardStyle}>
              <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 18 }}>Session pricing</h3>
              <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 18 }}>Configure your default rates. You can override per-session when negotiating with specific students.</p>
              {[['Voice · 30min', 499], ['Voice · 60min', 899], ['Video · 30min', 599], ['Video · 60min', 999]].map(([label, val]) => (
                <div key={label as string} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid var(--border-subtle)' }}>
                  <span style={{ fontSize: 14, fontWeight: 500 }}>{label}</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>₹</span>
                    <input type="number" defaultValue={val} style={{ width: 90, padding: '7px 10px', border: '1px solid var(--border-default)', borderRadius: 8, fontFamily: 'JetBrains Mono, monospace', fontSize: 13, background: 'var(--bg-base)', color: 'var(--text-primary)' }} />
                  </div>
                </div>
              ))}
            </div>
          )}

          {section === 'visibility' && (
            <div style={cardStyle}>
              <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 14 }}>Profile visibility</h3>
              {[
                ['Show full name', 'Display your full name publicly', true],
                ['Show email', 'Visible to booked students only', false],
                ['Show LinkedIn', 'Link to your LinkedIn profile', true],
                ['Featured mentor', 'Appear in homepage spotlight', true],
                ['Accept instant bookings', 'Students can book without approval', true],
                ['Show rating publicly', 'Your rating is visible on profile', true],
              ].map(([t, s, on], i, a) => (
                <ToggleRow key={t as string} title={t as string} sub={s as string} defaultOn={on as boolean} last={i === a.length - 1} />
              ))}
            </div>
          )}

          {section === 'notifications' && (
            <div style={cardStyle}>
              <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 14 }}>Notify me about</h3>
              {[
                ['New booking requests', 'When a student requests a session', true],
                ['Session reminders', '15 min before each session', true],
                ['New reviews', 'When a student leaves a review', true],
                ['Payout processed', 'When your payout clears', true],
                ['Platform updates', 'Product changes', false],
                ['Student messages', 'Direct messages from students', true],
              ].map(([t, s, on], i, a) => (
                <ToggleRow key={t as string} title={t as string} sub={s as string} defaultOn={on as boolean} last={i === a.length - 1} />
              ))}
            </div>
          )}

          {section === 'appearance' && (
            <div style={cardStyle}>
              <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 14 }}>Appearance</h3>
              <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Theme settings live under your <a href="/settings" style={{ color: 'var(--brand-500)' }}>main account settings</a>.</p>
            </div>
          )}

          {section === 'help' && (
            <div style={cardStyle}>
              <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 10 }}>Mentor support</h3>
              <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.6 }}>Got questions about payouts, taxes, or growing your bookings? Our mentor team responds within 4 hours.</p>
              <button onClick={() => toast('Support thread opened')} style={{ marginTop: 16, height: 38, padding: '0 18px', borderRadius: 999, background: 'var(--gradient-brand)', color: '#fff', fontSize: 13, fontWeight: 600 }}>Contact support</button>
            </div>
          )}
        </div>
      </div>

      {payoutOpen && <PayoutModal onClose={() => setPayoutOpen(false)} onSaved={() => toast('Payout details updated ✓')} />}
    </div>
  );
}
