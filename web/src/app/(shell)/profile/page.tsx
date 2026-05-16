'use client';

import { useState, useEffect } from 'react';
import Avatar from '@/components/primitives/Avatar';
import Icon from '@/components/primitives/Icon';
import { createClient } from '@/lib/supabase/client';

const COVER_PRESETS = [
  { id: 'brand',   grad: 'linear-gradient(135deg,#4F46E5,#6366F1,#818CF8)' },
  { id: 'warm',    grad: 'linear-gradient(135deg,#F59E0B,#EF4444,#D946EF)' },
  { id: 'ai',      grad: 'linear-gradient(135deg,#10B981,#06B6D4,#3B82F6)' },
  { id: 'premium', grad: 'linear-gradient(135deg,#F59E0B,#D97706,#B45309)' },
  { id: 'violet',  grad: 'linear-gradient(135deg,#8B5CF6,#A855F7,#EC4899)' },
  { id: 'twilight',grad: 'linear-gradient(135deg,#1E293B,#4F46E5,#7C3AED)' },
];

const BADGES = [
  { id: 'first',    name: 'First Session',  desc: 'Completed your first 1-on-1 session', earned: true,  rarity: '92% of students', emoji: '🌱' },
  { id: 'streak7',  name: '7-Day Streak',   desc: 'Logged in 7 days in a row',           earned: true,  rarity: '64% of students', emoji: '🔥' },
  { id: 'streak30', name: '30-Day Streak',  desc: 'Logged in 30 days in a row',          earned: false, rarity: '18% of students', emoji: '🔥' },
  { id: 'quiz',     name: 'Quiz Master',    desc: 'Scored 100% on 5 quizzes',            earned: true,  rarity: '41% of students', emoji: '🎯' },
  { id: 'night',    name: 'Night Owl',      desc: 'Studied past midnight 10 times',      earned: false, rarity: '23% of students', emoji: '🌙' },
  { id: 'early',    name: 'Early Bird',     desc: 'Started before 7am 10 times',         earned: false, rarity: '15% of students', emoji: '🌅' },
  { id: 'top10',    name: 'Top 10%',        desc: 'Among the top 10% this month',        earned: true,  rarity: '10% of students', emoji: '🏆' },
  { id: 'helpful',  name: 'Helpful',        desc: 'Got 25 helpful marks on reviews',     earned: false, rarity: '8% of students',  emoji: '🤝' },
  { id: 'pro',      name: 'Pro Member',     desc: 'Upgraded to a Pro plan',              earned: false, rarity: '34% of students', emoji: '⭐' },
  { id: 'verified', name: 'Verified',       desc: 'Completed full identity verification',earned: true,  rarity: '52% of students', emoji: '✓' },
];

type Draft = { name: string; handle: string; tagline: string; bio: string };

function Skeleton({ w, h, r = 8 }: { w: number | string; h: number; r?: number }) {
  return <div style={{ width: w, height: h, borderRadius: r, background: 'var(--bg-hover)', animation: 'pulse 1.5s ease-in-out infinite' }} />;
}

function Toast({ msg, ok }: { msg: string; ok: boolean }) {
  return (
    <div style={{
      position: 'fixed', bottom: 80, left: '50%', transform: 'translateX(-50%)',
      zIndex: 100, padding: '12px 20px', borderRadius: 999,
      background: ok ? '#10B981' : '#ef4444', color: '#fff',
      fontSize: 13, fontWeight: 600, boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
      animation: 'fadeUp 0.2s ease',
    }}>{msg}</div>
  );
}

export default function ProfilePage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null);
  const [email, setEmail] = useState('');
  const [plan, setPlan] = useState('Free');
  const [streak, setStreak] = useState(0);
  const [xp, setXp] = useState(0);
  const [cover, setCover] = useState('brand');
  const [coverOpen, setCoverOpen] = useState(false);
  const [edit, setEdit] = useState(false);
  const [tab, setTab] = useState('about');
  const [draft, setDraft] = useState<Draft>({ name: '', handle: '', tagline: '', bio: '' });
  const [saved, setSaved] = useState<Draft>(draft);
  const [openBadge, setOpenBadge] = useState<typeof BADGES[0] | null>(null);

  useEffect(() => {
    const c = localStorage.getItem('elmorigin:cover');
    if (c) setCover(c);

    const supabase = createClient();
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) { setLoading(false); return; }
      setEmail(user.email ?? '');
      try {
        const { data: profile } = await supabase
          .from('profiles')
          .select('full_name, handle, bio, plan, streak, xp')
          .eq('id', user.id)
          .single();
        if (profile) {
          const initial: Draft = {
            name:    (profile.full_name as string | null) ?? user.email?.split('@')[0] ?? '',
            handle:  (profile.handle    as string | null) ?? '',
            tagline: '',
            bio:     (profile.bio       as string | null) ?? '',
          };
          setDraft(initial);
          setSaved(initial);
          setPlan((profile.plan   as string | null) ?? 'Free');
          setStreak((profile.streak as number | null) ?? 0);
          setXp((profile.xp       as number | null) ?? 0);
        }
      } catch (err) {
        console.error('[profile] fetch failed', err);
      } finally {
        setLoading(false);
      }
    });
  }, []);

  useEffect(() => { localStorage.setItem('elmorigin:cover', cover); }, [cover]);

  const showToast = (msg: string, ok = true) => {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 2800);
  };

  const handleSave = async () => {
    setSaving(true);
    const supabase = createClient();
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not signed in');
      const { error } = await supabase.from('profiles').update({
        full_name: draft.name.trim() || null,
        handle:    draft.handle.trim() || null,
        bio:       draft.bio.trim() || null,
      }).eq('id', user.id);
      if (error) throw error;
      setSaved(draft);
      setEdit(false);
      showToast('Profile saved ✓');
    } catch (err: unknown) {
      showToast((err as Error).message ?? 'Save failed', false);
    } finally {
      setSaving(false);
    }
  };

  const dirty = JSON.stringify(draft) !== JSON.stringify(saved);
  const coverGrad = COVER_PRESETS.find(c => c.id === cover)?.grad || COVER_PRESETS[0].grad;

  return (
    <div style={{ padding: '0 40px 100px', maxWidth: 900, margin: '0 auto' }}>
      <style>{`
        @keyframes pulse { 0%,100% { opacity:1 } 50% { opacity:0.5 } }
        @keyframes fadeUp { from { opacity:0; transform:translateX(-50%) translateY(8px) } to { opacity:1; transform:translateX(-50%) translateY(0) } }
      `}</style>

      {/* Cover */}
      <div style={{ height: 200, borderRadius: '0 0 18px 18px', background: coverGrad, position: 'relative', marginLeft: -40, marginRight: -40 }}>
        <button onClick={() => setCoverOpen(true)} style={{ position: 'absolute', top: 16, right: 16, height: 34, padding: '0 14px', borderRadius: 999, background: 'rgba(255,255,255,0.18)', color: '#fff', backdropFilter: 'blur(10px)', fontSize: 13, fontWeight: 600, border: '1px solid rgba(255,255,255,0.25)' }}>
          ✏ Edit Cover
        </button>
      </div>

      {/* Avatar row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: -44, marginBottom: 18 }}>
        <div style={{ borderRadius: 999, boxShadow: '0 0 0 4px var(--bg-base)' }}>
          {loading ? <Skeleton w={96} h={96} r={999} /> : <Avatar name={saved.name || email} size={96} />}
        </div>
        {!edit && !loading && (
          <button onClick={() => setEdit(true)} style={{ height: 36, padding: '0 16px', borderRadius: 999, background: 'var(--bg-surface)', border: '1px solid var(--border-default)', fontSize: 13, fontWeight: 500, color: 'var(--text-primary)' }}>
            Edit Profile
          </button>
        )}
      </div>

      {/* Identity */}
      <div style={{ marginBottom: 24 }}>
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <Skeleton w={200} h={36} r={8} />
            <Skeleton w={100} h={18} r={6} />
            <Skeleton w={280} h={18} r={6} />
          </div>
        ) : edit ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <input value={draft.name} onChange={e => setDraft({ ...draft, name: e.target.value })} placeholder="Full name" style={{ fontFamily: 'Fraunces, serif', fontWeight: 700, fontSize: 28, background: 'var(--bg-surface)', border: '1px solid var(--border-default)', borderRadius: 10, padding: '8px 14px', color: 'var(--text-primary)', outline: 'none' }} />
            <input value={draft.handle} onChange={e => setDraft({ ...draft, handle: e.target.value })} placeholder="@handle" style={{ fontSize: 13, background: 'var(--bg-surface)', border: '1px solid var(--border-default)', borderRadius: 10, padding: '6px 12px', color: 'var(--text-secondary)', outline: 'none' }} />
            <input value={draft.tagline} onChange={e => setDraft({ ...draft, tagline: e.target.value })} placeholder="Tagline (e.g. CS · 2nd Year · IIT Bombay)" style={{ fontSize: 13, background: 'var(--bg-surface)', border: '1px solid var(--border-default)', borderRadius: 10, padding: '6px 12px', color: 'var(--text-secondary)', outline: 'none' }} />
          </div>
        ) : (
          <>
            <h1 style={{ fontFamily: 'Fraunces, serif', fontSize: 32, fontWeight: 700, letterSpacing: '-0.02em', marginBottom: 4 }}>{saved.name || email.split('@')[0]}</h1>
            {saved.handle && <div style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: 2 }}>{saved.handle}</div>}
            {saved.tagline && <div style={{ color: 'var(--text-secondary)', fontSize: 13, marginBottom: 12 }}>{saved.tagline}</div>}
            <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
              <span style={{ padding: '4px 10px', borderRadius: 999, background: 'rgba(27,43,142,0.08)', border: '1px solid rgba(27,43,142,0.15)', fontSize: 12, color: 'var(--brand-500)', fontWeight: 600 }}>{plan}</span>
              <span style={{ padding: '4px 10px', borderRadius: 999, background: 'var(--bg-hover)', border: '1px solid var(--border-subtle)', fontSize: 12, color: 'var(--text-secondary)' }}>{email}</span>
            </div>
          </>
        )}
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 28 }}>
        {loading
          ? Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} w="100%" h={80} r={14} />)
          : [['Streak', `${streak} 🔥`], ['XP', xp.toLocaleString()], ['Plan', plan], ['Status', 'Active']].map(([l, v]) => (
              <div key={l} style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 14, padding: 18 }}>
                <div style={{ fontFamily: 'Fraunces, serif', fontSize: 26, fontWeight: 700 }}>{v}</div>
                <div style={{ fontSize: 12, color: 'var(--text-tertiary)', marginTop: 4 }}>{l}</div>
              </div>
            ))}
      </div>

      {/* Badges strip */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', color: 'var(--text-tertiary)', textTransform: 'uppercase', marginBottom: 10 }}>Badges</div>
        <div style={{ display: 'flex', gap: 10, overflowX: 'auto', paddingBottom: 6 }}>
          {BADGES.map(b => (
            <button key={b.id} onClick={() => setOpenBadge(b)} title={b.name} style={{
              flexShrink: 0, width: 56, height: 56, borderRadius: 14,
              background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              filter: b.earned ? 'none' : 'grayscale(0.6) opacity(0.55)',
              fontSize: 22, cursor: 'pointer',
            }}>{b.emoji}</button>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 24, borderBottom: '1px solid var(--border-subtle)', marginBottom: 24 }}>
        {['about', 'activity', 'badges'].map(t => (
          <button key={t} onClick={() => setTab(t)} style={{
            position: 'relative', padding: '10px 0', textTransform: 'capitalize',
            color: tab === t ? 'var(--text-primary)' : 'var(--text-secondary)',
            fontWeight: tab === t ? 600 : 500, fontSize: 14,
          }}>
            {t}
            {tab === t && <div style={{ position: 'absolute', bottom: -1, left: 0, right: 0, height: 3, background: 'var(--gradient-brand)', borderRadius: 2 }} />}
          </button>
        ))}
      </div>

      {tab === 'about' && (
        <div style={{ maxWidth: 720 }}>
          {loading ? <Skeleton w="100%" h={100} r={12} /> : edit ? (
            <textarea value={draft.bio} onChange={e => setDraft({ ...draft, bio: e.target.value.slice(0, 400) })}
              placeholder="Tell others about yourself…"
              style={{ width: '100%', height: 130, padding: '12px 14px', background: 'var(--bg-surface)', border: '1px solid var(--border-default)', borderRadius: 12, fontSize: 14, lineHeight: 1.7, color: 'var(--text-primary)', outline: 'none', resize: 'none' }} />
          ) : (
            <p style={{ fontSize: 15, lineHeight: 1.7, color: 'var(--text-primary)' }}>{saved.bio || <span style={{ color: 'var(--text-tertiary)', fontStyle: 'italic' }}>No bio yet — click Edit Profile to add one.</span>}</p>
          )}
          <h3 style={{ fontSize: 16, fontWeight: 600, marginTop: 26, marginBottom: 12 }}>Current goals</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[['Finish PyTorch course', 68], ['100 algorithm problems', 42], ['Read 5 ML papers', 80]].map(([t, p]) => (
              <div key={t} style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 12, padding: 14 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 6 }}>
                  <span style={{ fontWeight: 600 }}>{t}</span>
                  <span style={{ fontFamily: 'JetBrains Mono, monospace', color: 'var(--text-tertiary)' }}>{p}%</span>
                </div>
                <div style={{ height: 6, background: 'var(--bg-hover)', borderRadius: 999, overflow: 'hidden' }}>
                  <div style={{ width: `${p}%`, height: '100%', background: 'var(--gradient-brand)' }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === 'activity' && (
        <div style={{ maxWidth: 720 }}>
          {[
            ['focus', 'Completed 25-min focus session', '2h ago'],
            ['mentors', 'Booked session with Priya Sharma', 'yesterday'],
            ['sparkles', 'Earned 7-Day Streak badge', '3 days ago'],
            ['community', 'Joined React Patterns room', 'last week'],
          ].map(([ic, t, when], i, a) => (
            <div key={i} style={{ display: 'flex', gap: 14, padding: '14px 0', borderBottom: i < a.length - 1 ? '1px solid var(--border-subtle)' : 'none' }}>
              <div style={{ width: 32, height: 32, borderRadius: 10, background: 'var(--bg-hover)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: 'var(--brand-500)' }}>
                <Icon name={ic as never} size={14} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 500 }}>{t}</div>
                <div style={{ fontSize: 11, color: 'var(--text-tertiary)', marginTop: 2 }}>{when}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === 'badges' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 14 }}>
          {BADGES.map(b => (
            <button key={b.id} onClick={() => setOpenBadge(b)} style={{
              padding: 18, textAlign: 'center', background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 16,
              filter: b.earned ? 'none' : 'grayscale(0.6) opacity(0.6)', position: 'relative', cursor: 'pointer',
            }}>
              <div style={{ fontSize: 36, marginBottom: 8 }}>{b.emoji}</div>
              <div style={{ fontSize: 12, fontWeight: 600 }}>{b.name}</div>
              {!b.earned && <div style={{ position: 'absolute', top: 8, right: 8, fontSize: 11 }}>🔒</div>}
            </button>
          ))}
        </div>
      )}

      {/* Cover picker modal */}
      {coverOpen && (
        <div onClick={() => setCoverOpen(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(14,18,40,0.28)', backdropFilter: 'blur(6px)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div onClick={e => e.stopPropagation()} style={{ width: '100%', maxWidth: 420, background: 'var(--bg-surface)', borderRadius: 22, padding: 28, boxShadow: 'var(--shadow-xl)', border: '1px solid var(--border-subtle)' }}>
            <h3 style={{ fontFamily: 'Fraunces, serif', fontSize: 22, fontWeight: 600, marginBottom: 16 }}>Pick a cover</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
              {COVER_PRESETS.map(c => (
                <button key={c.id} onClick={() => { setCover(c.id); setCoverOpen(false); }} style={{ height: 80, borderRadius: 12, background: c.grad, border: cover === c.id ? '3px solid var(--brand-500)' : '2px solid transparent', cursor: 'pointer' }} />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Badge modal */}
      {openBadge && (
        <div onClick={() => setOpenBadge(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(14,18,40,0.28)', backdropFilter: 'blur(6px)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div onClick={e => e.stopPropagation()} style={{ width: '100%', maxWidth: 380, background: 'var(--bg-surface)', borderRadius: 22, padding: 32, boxShadow: 'var(--shadow-xl)', border: '1px solid var(--border-subtle)', textAlign: 'center' }}>
            <div style={{ fontSize: 56, marginBottom: 12, filter: openBadge.earned ? 'none' : 'grayscale(0.6)' }}>{openBadge.emoji}</div>
            <h3 style={{ fontFamily: 'Fraunces, serif', fontSize: 22, fontWeight: 600, marginBottom: 6 }}>{openBadge.name}</h3>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 14 }}>{openBadge.desc}</p>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.06em', color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>{openBadge.rarity} have this</div>
          </div>
        </div>
      )}

      {/* Sticky save bar */}
      {edit && (
        <div style={{ position: 'fixed', bottom: 24, left: '50%', transform: 'translateX(-50%)', zIndex: 50, background: 'var(--bg-surface)', border: '1px solid var(--border-default)', borderRadius: 999, padding: '8px 8px 8px 18px', display: 'flex', alignItems: 'center', gap: 12, boxShadow: 'var(--shadow-xl)' }}>
          <span style={{ fontSize: 13, color: dirty ? 'var(--amber-600)' : 'var(--text-tertiary)' }}>{dirty ? 'Unsaved changes' : 'No changes'}</span>
          <button onClick={() => { setDraft(saved); setEdit(false); }} style={{ height: 34, padding: '0 14px', borderRadius: 999, background: 'var(--bg-hover)', border: '1px solid var(--border-default)', fontSize: 13, fontWeight: 500 }}>Discard</button>
          <button onClick={handleSave} disabled={saving} style={{ height: 34, padding: '0 14px', borderRadius: 999, background: 'var(--gradient-brand)', color: '#fff', fontSize: 13, fontWeight: 600, opacity: saving ? 0.7 : 1, cursor: saving ? 'wait' : 'pointer' }}>
            {saving ? 'Saving…' : 'Save Changes'}
          </button>
        </div>
      )}

      {toast && <Toast msg={toast.msg} ok={toast.ok} />}
    </div>
  );
}
