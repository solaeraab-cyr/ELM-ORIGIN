'use client';

import { useEffect, useRef, useState } from 'react';
import { Avatar, Icon } from '@/components/primitives';
import { useRealtimeTable } from '@/hooks/useRealtimeSubscription';

type UserShape = { name: string; handle: string; plan: 'Free' | 'Pro' | 'Elite' };

type Post = {
  id: number;
  user: UserShape;
  community: string;
  communityLabel: string;
  time: string;
  body: string;
  tag: string | null;
  likes: number; replies: number; reposts: number; bookmarks: number;
  liked: boolean; bookmarked: boolean;
  threadReplies: { user: UserShape; body: string; time: string; likes: number }[];
};

const COMMUNITIES = [
  { id: 'world', label: 'World Feed', icon: '🌐', members: 12400, joined: true },
  { id: 'jee',   label: 'JEE Mains',  icon: '⚡', members: 4820,  joined: true },
  { id: 'neet',  label: 'NEET UG',    icon: '🔬', members: 3910,  joined: true },
  { id: 'cat',   label: 'CAT',        icon: '📊', members: 2140,  joined: true },
  { id: 'upsc',  label: 'UPSC CSE',   icon: '🏛️', members: 1860,  joined: false },
  { id: 'gre',   label: 'GRE',        icon: '🎓', members: 1230,  joined: false },
];

const USERS: UserShape[] = [
  { name: 'Priya Sharma', handle: 'priya_s', plan: 'Pro' },
  { name: 'Arjun Mehta',  handle: 'arjunm',  plan: 'Free' },
  { name: 'Dev Rathi',    handle: 'dev_r',   plan: 'Pro' },
  { name: 'Kavya Iyer',   handle: 'kavyai',  plan: 'Elite' },
  { name: 'Rohan Gupta',  handle: 'rohan_g', plan: 'Free' },
  { name: 'Meera Nair',   handle: 'meera_n', plan: 'Pro' },
];

const INITIAL_POSTS: Post[] = [
  { id: 1, user: USERS[0], community: 'jee',   communityLabel: 'JEE Mains',  time: '2m ago',  body: 'Just solved 40 problems in Calculus back-to-back 🔥 The trick with limits is to always check for indeterminate forms first.', tag: 'Study tip', likes: 142, replies: 23, reposts: 18, bookmarks: 47, liked: false, bookmarked: false, threadReplies: [{ user: USERS[1], body: 'This is exactly what I needed!', time: '1m ago', likes: 12 }] },
  { id: 2, user: USERS[2], community: 'world', communityLabel: 'World Feed', time: '14m ago', body: "Hot take: Pomodoro is overrated for deep technical study. Here's what actually works for 4-6 hour sessions without burning out 🧵", tag: null, likes: 89,  replies: 31, reposts: 44, bookmarks: 112, liked: true,  bookmarked: false, threadReplies: [] },
  { id: 3, user: USERS[3], community: 'neet',  communityLabel: 'NEET UG',    time: '1h ago',  body: 'Mock test score update: 680/720 in Biology 🎯 Dropped marks only in Plant Physiology.', tag: 'Progress', likes: 56, replies: 14, reposts: 7, bookmarks: 29, liked: false, bookmarked: true, threadReplies: [] },
  { id: 4, user: USERS[5], community: 'cat',   communityLabel: 'CAT',        time: '2h ago',  body: 'Quant Tip: For Geometry questions, always draw the figure. Went from 68%ile to 89%ile in 6 weeks doing this.', tag: 'Strategy', likes: 203, replies: 41, reposts: 88, bookmarks: 167, liked: false, bookmarked: false, threadReplies: [] },
  { id: 5, user: USERS[1], community: 'jee',   communityLabel: 'JEE Mains',  time: '3h ago',  body: 'Anyone else finding the new NTA paper pattern harder? The shift in Chemistry weightage is real.', tag: null, likes: 34, replies: 18, reposts: 3, bookmarks: 12, liked: false, bookmarked: false, threadReplies: [] },
  { id: 6, user: USERS[4], community: 'world', communityLabel: 'World Feed', time: '4h ago',  body: 'Just had the most productive mentor session with Dr. Rao on Statistics. Cleared 3 weeks of confusion in 45 minutes.', tag: 'Testimonial', likes: 87, replies: 9, reposts: 24, bookmarks: 38, liked: true, bookmarked: true, threadReplies: [] },
];

const TRENDING = [
  { tag: '#JEE2026',       posts: 2140, rise: '+18%' },
  { tag: '#NEETUGPrep',    posts: 1830, rise: '+12%' },
  { tag: '#StudyWithMe',   posts: 4210, rise: '+31%' },
  { tag: '#CATQuant',      posts: 980,  rise: '+9%' },
  { tag: '#InterviewSeason', posts: 1560, rise: '+44%' },
];

const EVENTS = [
  { title: 'JEE Mock Marathon',  time: 'Today, 8 PM',     participants: 312 },
  { title: 'NEET Biology AMA',   time: 'Tomorrow, 6 PM',  participants: 180 },
  { title: 'CAT Quant Sprint',   time: 'Sat, 10 AM',      participants: 94 },
];

const SUGGESTED_MENTORS = [
  { name: 'Dr. Priya Iyer',    sub: 'Data Science · IIT Bombay', rating: 4.9 },
  { name: 'Rajesh Nair',       sub: 'Physics · JEE Expert',      rating: 4.8 },
  { name: 'Meena Krishnan',    sub: 'Chemistry · NEET',          rating: 4.7 },
  { name: 'Arjun Mehta',       sub: 'CS · Stripe',               rating: 4.9 },
];

function PostCard({ post, onClick }: { post: Post; onClick: () => void }) {
  const [p, setP] = useState(post);
  const toggle = (e: React.MouseEvent, field: 'liked' | 'bookmarked', countField: 'likes' | 'bookmarks') => {
    e.stopPropagation();
    setP(x => ({ ...x, [field]: !x[field], [countField]: x[countField] + (x[field] ? -1 : 1) } as Post));
  };
  return (
    <article onClick={onClick} style={{ padding: '20px 24px', borderBottom: '1px solid var(--border-subtle)', cursor: 'pointer', transition: 'background 160ms' }}
      onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'}
      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
    >
      <div style={{ display: 'flex', gap: 12 }}>
        <Avatar name={p.user.name} size={40} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap', marginBottom: 4 }}>
            <span style={{ fontWeight: 700, fontSize: 14 }}>{p.user.name}</span>
            <span style={{ fontSize: 13, color: 'var(--text-tertiary)' }}>@{p.user.handle}</span>
            {p.user.plan !== 'Free' && (
              <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 6px', borderRadius: 999, background: p.user.plan === 'Elite' ? 'var(--gradient-brand)' : 'rgba(245,158,11,0.20)', color: p.user.plan === 'Elite' ? '#fff' : 'var(--amber-600)', letterSpacing: '0.04em' }}>{p.user.plan}</span>
            )}
            <span style={{ fontSize: 13, color: 'var(--text-tertiary)' }}>· {p.time}</span>
            {p.tag && <span style={{ padding: '2px 8px', borderRadius: 999, background: 'rgba(79,70,229,0.10)', color: 'var(--brand-600)', fontSize: 11, fontWeight: 600 }}>{p.tag}</span>}
            <span style={{ marginLeft: 'auto', padding: '2px 8px', borderRadius: 999, background: 'var(--bg-hover)', fontSize: 11, color: 'var(--text-secondary)' }}>{p.communityLabel}</span>
          </div>
          <p style={{ fontSize: 14, lineHeight: 1.6, marginBottom: 14 }}>{p.body}</p>
          <div style={{ display: 'flex', gap: 0, marginLeft: -8 }} onClick={e => e.stopPropagation()}>
            {[
              { icon: 'chat' as const,    count: p.replies, color: 'var(--brand-500)', active: false, onClick: undefined },
              { icon: 'refresh' as const, count: p.reposts, color: 'var(--mint-600)',   active: false, onClick: undefined },
              { icon: 'star' as const,    count: p.likes,   color: 'var(--amber-500)',  active: p.liked,      onClick: (e: React.MouseEvent) => toggle(e, 'liked', 'likes') },
              { icon: 'attach' as const,  count: p.bookmarks, color: 'var(--brand-400)', active: p.bookmarked, onClick: (e: React.MouseEvent) => toggle(e, 'bookmarked', 'bookmarks') },
            ].map((a, i) => (
              <button
                key={i}
                onClick={a.onClick}
                style={{
                  display: 'flex', alignItems: 'center', gap: 6, padding: '6px 10px', borderRadius: 999,
                  color: a.active ? a.color : 'var(--text-tertiary)', fontSize: 13, transition: 'all 160ms',
                }}
                onMouseEnter={e => { e.currentTarget.style.color = a.color; e.currentTarget.style.background = `${a.color}18`; }}
                onMouseLeave={e => { e.currentTarget.style.color = a.active ? a.color : 'var(--text-tertiary)'; e.currentTarget.style.background = 'transparent'; }}
              >
                <Icon name={a.icon} size={15} />
                <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 12 }}>{a.count}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </article>
  );
}

function ThreadPanel({ post, onClose }: { post: Post; onClose: () => void }) {
  const [reply, setReply] = useState('');
  const [replies, setReplies] = useState(post.threadReplies);

  const send = () => {
    if (!reply.trim()) return;
    setReplies(r => [...r, { user: { name: 'Arjun Patel', handle: 'arjunp', plan: 'Free' }, body: reply, time: 'now', likes: 0 }]);
    setReply('');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', borderLeft: '1px solid var(--border-subtle)' }}>
      <div style={{ padding: '16px 24px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', gap: 12 }}>
        <button onClick={onClose} style={{ color: 'var(--text-tertiary)' }}><Icon name="x" size={16} /></button>
        <span style={{ fontWeight: 600, fontSize: 16 }}>Thread</span>
      </div>
      <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div style={{ display: 'flex', gap: 12 }}>
          <Avatar name={post.user.name} size={40} />
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 4 }}>{post.user.name} <span style={{ color: 'var(--text-tertiary)', fontWeight: 400, fontSize: 12 }}>@{post.user.handle} · {post.time}</span></div>
            <p style={{ fontSize: 14, lineHeight: 1.6 }}>{post.body}</p>
          </div>
        </div>
        <div style={{ height: 1, background: 'var(--border-subtle)' }} />
        {replies.map((r, i) => (
          <div key={i} style={{ display: 'flex', gap: 12, paddingLeft: 16, borderLeft: '2px solid var(--border-subtle)' }}>
            <Avatar name={r.user.name} size={32} />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 4 }}>{r.user.name} <span style={{ color: 'var(--text-tertiary)', fontSize: 12 }}>@{r.user.handle} · {r.time}</span></div>
              <p style={{ fontSize: 13, lineHeight: 1.5 }}>{r.body}</p>
            </div>
          </div>
        ))}
      </div>
      <div style={{ padding: '14px 24px', borderTop: '1px solid var(--border-subtle)' }}>
        <div style={{ display: 'flex', gap: 10 }}>
          <Avatar name="Arjun Patel" size={32} />
          <div style={{ flex: 1, background: 'var(--bg-surface)', border: '1px solid var(--border-default)', borderRadius: 14 }}>
            <textarea
              value={reply}
              onChange={e => setReply(e.target.value)}
              placeholder={`Reply to @${post.user.handle}…`}
              style={{ width: '100%', padding: 12, fontSize: 13, resize: 'none', minHeight: 60, background: 'transparent', border: 'none', outline: 'none', color: 'var(--text-primary)' }}
            />
            <div style={{ padding: '6px 12px', display: 'flex', justifyContent: 'flex-end' }}>
              <button onClick={send} disabled={!reply.trim()} style={{ height: 30, padding: '0 12px', borderRadius: 999, background: reply.trim() ? 'var(--gradient-brand)' : 'var(--bg-hover)', color: reply.trim() ? '#fff' : 'var(--text-tertiary)', fontSize: 12, fontWeight: 600 }}>Reply</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CommunityPage() {
  const [active, setActive] = useState('world');
  const [posts, setPosts] = useState(INITIAL_POSTS);
  const [composer, setComposer] = useState('');
  const [composerOpen, setComposerOpen] = useState(false);
  const [selectedCommunity, setSelectedCommunity] = useState('world');
  const [thread, setThread] = useState<Post | null>(null);
  const [newBanner, setNewBanner] = useState(0);
  const composerRef = useRef<HTMLTextAreaElement>(null);

  // Live: bump the new-posts banner each time a new row lands in `posts`.
  useRealtimeTable({
    channelName: 'community-posts',
    table: 'posts',
    event: 'INSERT',
    onChange: () => setNewBanner(c => c + 1),
  });

  const submit = () => {
    if (!composer.trim()) return;
    const c = COMMUNITIES.find(x => x.id === selectedCommunity);
    const newPost: Post = {
      id: Date.now(),
      user: { name: 'Arjun Patel', handle: 'arjunp', plan: 'Free' },
      community: selectedCommunity,
      communityLabel: c?.label || 'World Feed',
      time: 'now',
      body: composer,
      tag: null,
      likes: 0, replies: 0, reposts: 0, bookmarks: 0,
      liked: false, bookmarked: false, threadReplies: [],
    };
    setPosts(p => [newPost, ...p]);
    setComposer('');
    setComposerOpen(false);
  };

  const filteredPosts = posts.filter(p => active === 'world' || p.community === active);
  const activeCommunity = COMMUNITIES.find(c => c.id === active) || COMMUNITIES[0];

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '248px minmax(0, 1fr) 308px', height: 'calc(100vh - 68px)', overflow: 'hidden' }}>
      {/* Left */}
      <aside style={{ borderRight: '1px solid var(--border-subtle)', display: 'flex', flexDirection: 'column', overflowY: 'auto', padding: '20px 12px' }}>
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.06em', color: 'var(--text-tertiary)', textTransform: 'uppercase', padding: '0 8px 10px' }}>Your communities</div>
        {COMMUNITIES.filter(c => c.joined).map(c => (
          <button
            key={c.id}
            onClick={() => setActive(c.id)}
            style={{
              display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 12, width: '100%', textAlign: 'left',
              background: active === c.id ? 'var(--bg-hover)' : 'transparent',
              color: active === c.id ? 'var(--text-primary)' : 'var(--text-secondary)',
              fontWeight: active === c.id ? 600 : 500, fontSize: 14,
            }}
          >
            <span style={{ fontSize: 18, width: 24, textAlign: 'center' }}>{c.icon}</span>
            <span style={{ flex: 1 }}>{c.label}</span>
            {active === c.id && <span style={{ width: 6, height: 6, borderRadius: 999, background: 'var(--brand-500)' }} />}
          </button>
        ))}
        <div style={{ height: 1, background: 'var(--border-subtle)', margin: '12px 8px' }} />
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.06em', color: 'var(--text-tertiary)', textTransform: 'uppercase', padding: '0 8px 10px' }}>Discover</div>
        {COMMUNITIES.filter(c => !c.joined).map(c => (
          <button key={c.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 12, width: '100%', textAlign: 'left', background: 'transparent', color: 'var(--text-tertiary)', fontWeight: 500, fontSize: 14 }}>
            <span style={{ fontSize: 18, width: 24, textAlign: 'center' }}>{c.icon}</span>
            <span style={{ flex: 1 }}>{c.label}</span>
            <span style={{ fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 999, border: '1px solid var(--border-default)', color: 'var(--brand-500)' }}>Join</span>
          </button>
        ))}
      </aside>

      {/* Center */}
      <div style={{ overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
        <div style={{ position: 'sticky', top: 0, zIndex: 10, background: 'rgba(248,249,255,0.90)', backdropFilter: 'blur(16px)', borderBottom: '1px solid var(--border-subtle)' }}>
          <div style={{ padding: '16px 24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: 22 }}>{activeCommunity.icon}</span>
              <span style={{ fontSize: 17, fontWeight: 700 }}>{activeCommunity.label}</span>
              <span style={{ marginLeft: 4, padding: '2px 8px', borderRadius: 999, background: 'var(--bg-hover)', fontSize: 11, color: 'var(--text-secondary)' }}>{activeCommunity.members.toLocaleString()} members</span>
            </div>
            <div style={{ display: 'flex', gap: 0, marginTop: 14, borderBottom: '1px solid var(--border-subtle)', marginBottom: -1 }}>
              {['For you', 'Following', 'Trending', 'Latest'].map((label, i) => (
                <button
                  key={label}
                  style={{
                    padding: '10px 18px', fontSize: 14, fontWeight: i === 0 ? 600 : 400,
                    color: i === 0 ? 'var(--text-primary)' : 'var(--text-tertiary)',
                    borderBottom: i === 0 ? '2px solid var(--text-primary)' : '2px solid transparent',
                  }}
                >{label}</button>
              ))}
            </div>
          </div>
        </div>

        {newBanner > 0 && (
          <div style={{ margin: '12px 24px 0', textAlign: 'center' }}>
            <button
              onClick={() => setNewBanner(0)}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 18px', borderRadius: 999, background: 'var(--text-primary)', color: '#fff', fontWeight: 600, fontSize: 13, boxShadow: 'var(--shadow-md)' }}
            >
              <Icon name="trending" size={14} /> {newBanner} new posts · Click to load
            </button>
          </div>
        )}

        {/* Composer */}
        <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border-subtle)' }}>
          <div style={{ display: 'flex', gap: 12 }}>
            <Avatar name="Arjun Patel" size={40} />
            <div style={{ flex: 1, background: 'var(--bg-surface)', border: '1px solid var(--border-default)', borderRadius: composerOpen ? 16 : 999, overflow: 'hidden', transition: 'border-radius 220ms' }}>
              <textarea
                ref={composerRef}
                value={composer}
                onChange={e => setComposer(e.target.value)}
                onFocus={() => setComposerOpen(true)}
                placeholder={`Share something with the ${activeCommunity.label} community…`}
                style={{ width: '100%', padding: composerOpen ? '14px 16px 10px' : '12px 16px', fontSize: 14, lineHeight: 1.5, resize: 'none', minHeight: composerOpen ? 100 : 44, background: 'transparent', border: 'none', outline: 'none', color: 'var(--text-primary)', fontFamily: 'Inter, system-ui' }}
              />
              {composerOpen && (
                <div style={{ padding: '10px 16px', display: 'flex', alignItems: 'center', gap: 10, borderTop: '1px solid var(--border-subtle)', flexWrap: 'wrap' }}>
                  <div style={{ display: 'flex', gap: 6, flex: 1, flexWrap: 'wrap' }}>
                    {COMMUNITIES.filter(c => c.joined).map(c => (
                      <button
                        key={c.id}
                        onClick={() => setSelectedCommunity(c.id)}
                        style={{
                          padding: '4px 10px', borderRadius: 999, fontSize: 12, fontWeight: 500,
                          border: '1px solid var(--border-default)',
                          background: selectedCommunity === c.id ? 'var(--text-primary)' : 'transparent',
                          color: selectedCommunity === c.id ? '#fff' : 'var(--text-secondary)',
                        }}
                      >{c.icon} {c.label}</button>
                    ))}
                  </div>
                  <button onClick={() => { setComposerOpen(false); setComposer(''); }} style={{ padding: '6px 12px', borderRadius: 999, background: 'transparent', fontSize: 12, fontWeight: 500, color: 'var(--text-secondary)' }}>Cancel</button>
                  <button
                    onClick={submit}
                    disabled={!composer.trim()}
                    style={{ padding: '6px 14px', borderRadius: 999, background: composer.trim() ? 'var(--gradient-brand)' : 'var(--bg-hover)', color: composer.trim() ? '#fff' : 'var(--text-tertiary)', fontSize: 12, fontWeight: 600 }}
                  >Post</button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Posts */}
        <div>
          {filteredPosts.map(p => <PostCard key={p.id} post={p} onClick={() => setThread(p)} />)}
          {filteredPosts.length === 0 && (
            <div style={{ padding: '60px 24px', textAlign: 'center', color: 'var(--text-tertiary)' }}>
              <p style={{ fontFamily: 'Fraunces, serif', fontStyle: 'italic', fontSize: 18 }}>Nothing here yet — be first to post!</p>
            </div>
          )}
        </div>
      </div>

      {/* Right */}
      {thread ? (
        <ThreadPanel post={thread} onClose={() => setThread(null)} />
      ) : (
        <aside style={{ overflowY: 'auto', padding: '20px 20px', display: 'flex', flexDirection: 'column', gap: 20, borderLeft: '1px solid var(--border-subtle)' }}>
          <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 16, padding: 20 }}>
            <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 14 }}>Trending in your communities</div>
            {TRENDING.map((t, i) => (
              <div key={i} style={{ padding: '10px 0', borderBottom: i < TRENDING.length - 1 ? '1px solid var(--border-subtle)' : 'none' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--brand-600)' }}>{t.tag}</span>
                  <span style={{ marginLeft: 'auto', padding: '2px 8px', borderRadius: 999, background: 'rgba(16,185,129,0.10)', color: 'var(--mint-600)', fontSize: 11, fontWeight: 600 }}>{t.rise}</span>
                </div>
                <div style={{ fontSize: 12, color: 'var(--text-tertiary)', marginTop: 2 }}>{t.posts.toLocaleString()} posts</div>
              </div>
            ))}
          </div>
          <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 16, padding: 20 }}>
            <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 14 }}>Upcoming events</div>
            {EVENTS.map((ev, i) => (
              <div key={i} style={{ padding: '10px 0', borderBottom: i < EVENTS.length - 1 ? '1px solid var(--border-subtle)' : 'none' }}>
                <div style={{ fontSize: 13, fontWeight: 600 }}>{ev.title}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
                  <span style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>{ev.time}</span>
                  <span style={{ padding: '2px 8px', borderRadius: 999, background: 'var(--bg-hover)', fontSize: 11, color: 'var(--text-secondary)' }}><Icon name="users" size={11} /> {ev.participants}</span>
                </div>
                <button style={{ marginTop: 8, width: '100%', height: 32, borderRadius: 999, background: 'var(--bg-hover)', border: '1px solid var(--border-subtle)', fontSize: 12, fontWeight: 500 }}>RSVP →</button>
              </div>
            ))}
          </div>
          <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 16, padding: 20 }}>
            <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 14 }}>Mentors to follow</div>
            {SUGGESTED_MENTORS.map((m, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderBottom: i < SUGGESTED_MENTORS.length - 1 ? '1px solid var(--border-subtle)' : 'none' }}>
                <Avatar name={m.name} size={36} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{m.name}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>{m.sub}</div>
                </div>
                <button style={{ fontSize: 12, fontWeight: 600, padding: '4px 12px', borderRadius: 999, border: '1px solid var(--border-default)', color: 'var(--brand-500)' }}>Follow</button>
              </div>
            ))}
          </div>
        </aside>
      )}
    </div>
  );
}
