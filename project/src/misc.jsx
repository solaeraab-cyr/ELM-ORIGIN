/* global React, Icon, Avatar, SubjectGlyph */
const { useState, useEffect, useRef } = React;

// ═══════════════════════════════════════
// COMMUNITY — Twitter-style 3-column feed
// ═══════════════════════════════════════

const EXAM_COMMUNITIES = [
  { id: 'world',  label: 'World Feed', icon: '🌐', members: 12400, joined: true },
  { id: 'jee',    label: 'JEE Mains',  icon: '⚡', members: 4820,  joined: true },
  { id: 'neet',   label: 'NEET UG',    icon: '🔬', members: 3910,  joined: true },
  { id: 'cat',    label: 'CAT',        icon: '📊', members: 2140,  joined: true },
  { id: 'upsc',   label: 'UPSC CSE',   icon: '🏛️', members: 1860,  joined: false },
  { id: 'gre',    label: 'GRE',        icon: '🎓', members: 1230,  joined: false },
  { id: 'ielts',  label: 'IELTS',      icon: '📝', members: 980,   joined: false },
];

const USERS = [
  { name: 'Priya Sharma',  handle: 'priya_s',   avatar: 'PS', plan: 'Pro' },
  { name: 'Arjun Mehta',   handle: 'arjunm',    avatar: 'AM', plan: 'Free' },
  { name: 'Dev Rathi',     handle: 'dev_r',     avatar: 'DR', plan: 'Pro' },
  { name: 'Kavya Iyer',    handle: 'kavyai',    avatar: 'KI', plan: 'Elite' },
  { name: 'Rohan Gupta',   handle: 'rohan_g',   avatar: 'RG', plan: 'Free' },
  { name: 'Meera Nair',    handle: 'meera_n',   avatar: 'MN', plan: 'Pro' },
  { name: 'Vikram Singh',  handle: 'vikrams',   avatar: 'VS', plan: 'Free' },
  { name: 'Sneha Patel',   handle: 'snehap',    avatar: 'SP', plan: 'Pro' },
];

const INITIAL_POSTS = [
  {
    id: 1,
    user: USERS[0],
    community: 'jee',
    communityLabel: 'JEE Mains',
    time: '2m ago',
    body: "Just solved 40 problems in Calculus back-to-back 🔥 The trick with limit problems is to always check for indeterminate forms first. Here's the approach that's been working for me:",
    image: null,
    tag: 'Study tip',
    likes: 142,
    replies: 23,
    reposts: 18,
    bookmarks: 47,
    liked: false,
    bookmarked: false,
    threadReplies: [
      { user: USERS[1], body: 'This is exactly what I needed. Been struggling with limits all week!', time: '1m ago', likes: 12 },
      { user: USERS[3], body: 'Sharing with my study group right now. Thanks Priya!', time: '30s ago', likes: 4 },
    ],
  },
  {
    id: 2,
    user: USERS[2],
    community: 'world',
    communityLabel: 'World Feed',
    time: '14m ago',
    body: "Hot take: The Pomodoro technique is overrated for deep technical study. Here's what actually works for 4-6 hour sessions without burning out 🧵",
    image: null,
    tag: null,
    likes: 89,
    replies: 31,
    reposts: 44,
    bookmarks: 112,
    liked: true,
    bookmarked: false,
    threadReplies: [
      { user: USERS[4], body: 'What do you recommend instead? Genuine question.', time: '10m ago', likes: 8 },
      { user: USERS[2], body: 'Ultra-long focus blocks (90-180min) with active recall breaks. The key is not to stop when you\'re in flow.', time: '8m ago', likes: 31 },
    ],
  },
  {
    id: 3,
    user: USERS[3],
    community: 'neet',
    communityLabel: 'NEET UG',
    time: '1h ago',
    body: 'Mock test score update: 680/720 in Biology 🎯 Dropped marks only in Plant Physiology. If anyone has good revision notes for Ch 11-13, please share! My notes are attached below ↓',
    image: null,
    tag: 'Progress',
    likes: 56,
    replies: 14,
    reposts: 7,
    bookmarks: 29,
    liked: false,
    bookmarked: true,
    threadReplies: [],
  },
  {
    id: 4,
    user: USERS[5],
    community: 'cat',
    communityLabel: 'CAT',
    time: '2h ago',
    body: "Quant Tip: For Geometry questions, always draw the figure even if it seems obvious. 80% of my errors were from assuming symmetry that wasn't there. Went from 68%ile to 89%ile in 6 weeks doing this.",
    image: null,
    tag: 'Strategy',
    likes: 203,
    replies: 41,
    reposts: 88,
    bookmarks: 167,
    liked: false,
    bookmarked: false,
    threadReplies: [
      { user: USERS[6], body: 'Any resource recommendations for Geometry specifically?', time: '1h ago', likes: 5 },
      { user: USERS[5], body: 'Arun Sharma\'s LOD 1 + 2 is gold. Do the starred ones first.', time: '55m ago', likes: 19 },
    ],
  },
  {
    id: 5,
    user: USERS[1],
    community: 'jee',
    communityLabel: 'JEE Mains',
    time: '3h ago',
    body: 'Anyone else finding the new NTA paper pattern harder? The shift in Chemistry weightage is real. Feeling a bit lost on the new Organic focus 😅',
    image: null,
    tag: null,
    likes: 34,
    replies: 18,
    reposts: 3,
    bookmarks: 12,
    liked: false,
    bookmarked: false,
    threadReplies: [
      { user: USERS[0], body: 'The new pattern is definitely trickier. Join the JEE room tonight at 8pm, we\'re doing a full paper analysis!', time: '2h ago', likes: 22 },
    ],
  },
  {
    id: 6,
    user: USERS[7],
    community: 'world',
    communityLabel: 'World Feed',
    time: '4h ago',
    body: 'Just had the most productive mentor session with Dr. Rao on Statistics. Cleared 3 weeks of confusion in 45 minutes. If you\'re struggling — stop Googling and book a session 🙏',
    image: null,
    tag: 'Testimonial',
    likes: 87,
    replies: 9,
    reposts: 24,
    bookmarks: 38,
    liked: true,
    bookmarked: true,
    threadReplies: [],
  },
];

const TRENDING = [
  { tag: '#JEE2026', posts: 2140, rise: '+18%' },
  { tag: '#NEETUGPrep', posts: 1830, rise: '+12%' },
  { tag: '#StudyWithMe', posts: 4210, rise: '+31%' },
  { tag: '#CATQuant', posts: 980, rise: '+9%' },
  { tag: '#InterviewSeason', posts: 1560, rise: '+44%' },
];

const UPCOMING_EVENTS = [
  { title: 'JEE Mock Marathon', time: 'Today, 8 PM', participants: 312 },
  { title: 'NEET Biology AMA', time: 'Tomorrow, 6 PM', participants: 180 },
  { title: 'CAT Quant Sprint', time: 'Sat, 10 AM', participants: 94 },
];

const PostCard = ({ post: initialPost, onClick }) => {
  const [post, setPost] = useState(initialPost);
  const toggle = (field, countField, e) => {
    e.stopPropagation();
    setPost(p => ({ ...p, [field]: !p[field], [countField]: p[countField] + (p[field] ? -1 : 1) }));
  };
  return (
    <article onClick={onClick} style={{
      padding: '20px 0', borderBottom: '1px solid var(--border-subtle)',
      cursor: 'pointer', transition: 'background 160ms',
    }}
      onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'}
      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
    >
      <div style={{ display: 'flex', gap: 12, padding: '0 24px' }}>
        <Avatar name={post.user.name} size={40}/>
        <div style={{ flex: 1, minWidth: 0 }}>
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap', marginBottom: 4 }}>
            <span style={{ fontFamily: 'Inter', fontWeight: 700, fontSize: 14, color: 'var(--text-primary)' }}>{post.user.name}</span>
            <span style={{ fontSize: 13, color: 'var(--text-tertiary)' }}>@{post.user.handle}</span>
            {post.user.plan !== 'Free' && (
              <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 6px', borderRadius: 999, background: post.user.plan === 'Elite' ? 'var(--gradient-brand)' : 'var(--gold-100)', color: post.user.plan === 'Elite' ? '#fff' : 'var(--gold-700)', letterSpacing: '0.04em' }}>{post.user.plan}</span>
            )}
            <span style={{ fontSize: 13, color: 'var(--text-tertiary)' }}>·</span>
            <span style={{ fontSize: 13, color: 'var(--text-tertiary)' }}>{post.time}</span>
            {post.tag && <span className="chip chip-sm chip-brand">{post.tag}</span>}
            <div style={{ marginLeft: 'auto' }}>
              <span className="chip chip-sm">{post.communityLabel}</span>
            </div>
          </div>
          {/* Body */}
          <p style={{ fontSize: 14, lineHeight: 1.6, color: 'var(--text-primary)', marginBottom: 14 }} className="line-clamp-3">{post.body}</p>
          {/* Actions */}
          <div style={{ display: 'flex', gap: 0, marginLeft: -8 }} onClick={e => e.stopPropagation()}>
            {[
              { icon: 'chat', count: post.replies, action: (e) => onClick && onClick(), color: 'var(--brand-500)' },
              { icon: 'refresh', count: post.reposts, action: null, color: 'var(--mint-600)' },
              { icon: 'star', count: post.likes, action: (e) => toggle('liked', 'likes', e), color: 'var(--gold-500)', active: post.liked },
              { icon: 'attach', count: post.bookmarks, action: (e) => toggle('bookmarked', 'bookmarks', e), color: 'var(--brand-400)', active: post.bookmarked },
            ].map(({ icon, count, action, color, active }, i) => (
              <button key={i} onClick={action || undefined}
                style={{
                  display: 'flex', alignItems: 'center', gap: 6, padding: '6px 10px', borderRadius: 999,
                  color: active ? color : 'var(--text-tertiary)', fontSize: 13,
                  transition: 'all 160ms',
                }}
                onMouseEnter={e => { e.currentTarget.style.color = color; e.currentTarget.style.background = `${color}18`; }}
                onMouseLeave={e => { e.currentTarget.style.color = active ? color : 'var(--text-tertiary)'; e.currentTarget.style.background = 'transparent'; }}
              >
                <Icon name={icon} size={15} stroke={active ? 2.5 : 1.75}/>
                <span style={{ fontFamily: 'JetBrains Mono', fontSize: 12 }}>{count}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </article>
  );
};

const ThreadPanel = ({ post, onClose }) => {
  const [reply, setReply] = useState('');
  const [replies, setReplies] = useState(post.threadReplies || []);
  const sendReply = () => {
    if (!reply.trim()) return;
    setReplies(r => [...r, { user: { name: 'Arjun Patel', handle: 'arjunp', avatar: 'AP', plan: 'Free' }, body: reply, time: 'now', likes: 0 }]);
    setReply('');
  };
  return (
    <div className="slide-in-right" style={{ flex: 1, display: 'flex', flexDirection: 'column', borderLeft: '1px solid var(--border-subtle)', height: '100%', overflow: 'hidden' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '16px 24px', borderBottom: '1px solid var(--border-subtle)' }}>
        <button onClick={onClose} style={{ color: 'var(--text-tertiary)', display: 'flex' }}><Icon name="x" size={18}/></button>
        <span className="font-heading" style={{ fontSize: 16, fontWeight: 600 }}>Thread</span>
      </div>
      <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        {/* Original post */}
        <div style={{ display: 'flex', gap: 12 }}>
          <Avatar name={post.user.name} size={40}/>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
              <span style={{ fontFamily: 'Inter', fontWeight: 700, fontSize: 14 }}>{post.user.name}</span>
              <span style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>@{post.user.handle}</span>
              <span style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>· {post.time}</span>
            </div>
            <p style={{ fontSize: 14, lineHeight: 1.6, color: 'var(--text-primary)' }}>{post.body}</p>
          </div>
        </div>
        <div style={{ height: 1, background: 'var(--border-subtle)' }}/>
        {/* Replies */}
        {replies.map((r, i) => (
          <div key={i} className="fade-in-up" style={{ display: 'flex', gap: 12, paddingLeft: 20, borderLeft: '2px solid var(--border-subtle)' }}>
            <Avatar name={r.user.name} size={32}/>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', gap: 6, alignItems: 'center', marginBottom: 4 }}>
                <span style={{ fontFamily: 'Inter', fontWeight: 600, fontSize: 13 }}>{r.user.name}</span>
                <span style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>@{r.user.handle} · {r.time}</span>
              </div>
              <p style={{ fontSize: 13, lineHeight: 1.5, color: 'var(--text-primary)' }}>{r.body}</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 8 }}>
                <button style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--text-tertiary)', fontSize: 12, padding: '4px 6px', borderRadius: 999 }}
                  onMouseEnter={e => e.currentTarget.style.color = 'var(--gold-500)'}
                  onMouseLeave={e => e.currentTarget.style.color = 'var(--text-tertiary)'}
                >
                  <Icon name="star" size={13}/>
                  <span style={{ fontFamily: 'JetBrains Mono', fontSize: 11 }}>{r.likes}</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
      {/* Reply composer */}
      <div style={{ padding: '14px 24px', borderTop: '1px solid var(--border-subtle)' }}>
        <div style={{ display: 'flex', gap: 10 }}>
          <Avatar name="Arjun Patel" size={32}/>
          <div style={{ flex: 1, background: 'var(--bg-surface)', border: '1px solid var(--border-default)', borderRadius: 14, overflow: 'hidden', transition: 'border-color 200ms' }}
            onFocusCapture={e => e.currentTarget.style.borderColor = 'var(--brand-400)'}
            onBlurCapture={e => e.currentTarget.style.borderColor = 'var(--border-default)'}
          >
            <textarea value={reply} onChange={e => setReply(e.target.value)} onKeyDown={e => { if (e.key === 'Enter' && e.metaKey) sendReply(); }}
              placeholder={`Reply to @${post.user.handle}…`}
              style={{ width: '100%', padding: '10px 14px', fontSize: 13, lineHeight: 1.5, resize: 'none', minHeight: 60, background: 'transparent', border: 'none', outline: 'none', color: 'var(--text-primary)' }}/>
            <div style={{ padding: '6px 12px', display: 'flex', justifyContent: 'flex-end' }}>
              <button onClick={sendReply} disabled={!reply.trim()} className="btn btn-brand btn-sm" style={{ opacity: reply.trim() ? 1 : 0.4 }}>Reply</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const Community = () => {
  const [activeChannel, setActiveChannel] = useState('world');
  const [tab, setTab] = useState('for-you');
  const [posts, setPosts] = useState(INITIAL_POSTS);
  const [composerText, setComposerText] = useState('');
  const [composerExpanded, setComposerExpanded] = useState(false);
  const [selectedCommunity, setSelectedCommunity] = useState('world');
  const [activeThread, setActiveThread] = useState(null);
  const [newPostsBanner, setNewPostsBanner] = useState(0);
  const composerRef = useRef(null);

  // Simulate new posts arriving
  useEffect(() => {
    const t = setTimeout(() => setNewPostsBanner(3), 8000);
    return () => clearTimeout(t);
  }, []);

  const submitPost = () => {
    if (!composerText.trim()) return;
    const community = EXAM_COMMUNITIES.find(c => c.id === selectedCommunity);
    const newPost = {
      id: Date.now(),
      user: { name: 'Arjun Patel', handle: 'arjunp', avatar: 'AP', plan: 'Free' },
      community: selectedCommunity,
      communityLabel: community?.label || 'World Feed',
      time: 'now',
      body: composerText,
      tag: null,
      likes: 0, replies: 0, reposts: 0, bookmarks: 0,
      liked: false, bookmarked: false, threadReplies: [],
    };
    setPosts(p => [newPost, ...p]);
    setComposerText('');
    setComposerExpanded(false);
  };

  const filteredPosts = posts.filter(p => activeChannel === 'world' || p.community === activeChannel);

  const channelInfo = EXAM_COMMUNITIES.find(c => c.id === activeChannel) || EXAM_COMMUNITIES[0];

  return (
    <div style={{ display: 'flex', height: 'calc(100vh - 68px)', overflow: 'hidden' }}>
      {/* ── Left: Channel list ── */}
      <aside style={{
        width: 248, flexShrink: 0,
        borderRight: '1px solid var(--border-subtle)',
        display: 'flex', flexDirection: 'column',
        overflowY: 'auto',
        padding: '20px 12px',
      }}>
        <div className="label-sm" style={{ padding: '0 8px 10px' }}>Your communities</div>
        {EXAM_COMMUNITIES.filter(c => c.joined).map(c => (
          <button key={c.id} onClick={() => setActiveChannel(c.id)} style={{
            display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px',
            borderRadius: 12, width: '100%', textAlign: 'left',
            background: activeChannel === c.id ? 'var(--bg-hover)' : 'transparent',
            color: activeChannel === c.id ? 'var(--text-primary)' : 'var(--text-secondary)',
            fontFamily: 'Inter', fontWeight: activeChannel === c.id ? 600 : 500, fontSize: 14,
            transition: 'all 160ms',
          }}
            onMouseEnter={e => { if (activeChannel !== c.id) e.currentTarget.style.background = 'rgba(14,18,40,0.04)'; }}
            onMouseLeave={e => { if (activeChannel !== c.id) e.currentTarget.style.background = 'transparent'; }}
          >
            <span style={{ fontSize: 18, width: 24, textAlign: 'center' }}>{c.icon}</span>
            <span style={{ flex: 1 }}>{c.label}</span>
            {activeChannel === c.id && <span style={{ width: 6, height: 6, borderRadius: 999, background: 'var(--brand-500)' }}/>}
          </button>
        ))}

        <div style={{ height: 1, background: 'var(--border-subtle)', margin: '12px 8px' }}/>
        <div className="label-sm" style={{ padding: '0 8px 10px' }}>Discover</div>
        {EXAM_COMMUNITIES.filter(c => !c.joined).map(c => (
          <button key={c.id} onClick={() => setActiveChannel(c.id)} style={{
            display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px',
            borderRadius: 12, width: '100%', textAlign: 'left',
            background: activeChannel === c.id ? 'var(--bg-hover)' : 'transparent',
            color: 'var(--text-tertiary)',
            fontFamily: 'Inter', fontWeight: 500, fontSize: 14,
            transition: 'all 160ms',
          }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(14,18,40,0.04)'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
          >
            <span style={{ fontSize: 18, width: 24, textAlign: 'center' }}>{c.icon}</span>
            <span style={{ flex: 1 }}>{c.label}</span>
            <span style={{ fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 999, border: '1px solid var(--border-default)', color: 'var(--brand-500)' }}>Join</span>
          </button>
        ))}
      </aside>

      {/* ── Center: Feed ── */}
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', borderRight: '1px solid var(--border-subtle)', overflowY: 'auto' }}>
        {/* Feed header */}
        <div style={{ position: 'sticky', top: 0, zIndex: 10, background: 'rgba(248,249,255,0.90)', backdropFilter: 'blur(16px)', borderBottom: '1px solid var(--border-subtle)' }}>
          <div style={{ padding: '16px 24px 0' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
              <span style={{ fontSize: 22 }}>{channelInfo.icon}</span>
              <span className="font-heading" style={{ fontSize: 17, fontWeight: 700 }}>{channelInfo.label}</span>
              <span className="chip chip-sm" style={{ marginLeft: 4 }}>{channelInfo.members.toLocaleString()} members</span>
            </div>
            {/* Filter tabs */}
            <div style={{ display: 'flex', gap: 0, borderBottom: '1px solid var(--border-subtle)', marginBottom: -1 }}>
              {[['for-you', 'For you'], ['following', 'Following'], ['trending', 'Trending'], ['latest', 'Latest']].map(([id, label]) => (
                <button key={id} onClick={() => setTab(id)} style={{
                  padding: '10px 18px', fontSize: 14, fontFamily: 'Inter', fontWeight: tab === id ? 600 : 400,
                  color: tab === id ? 'var(--text-primary)' : 'var(--text-tertiary)',
                  borderBottom: tab === id ? '2px solid var(--text-primary)' : '2px solid transparent',
                  transition: 'all 180ms',
                }}
                  onMouseEnter={e => { if (tab !== id) e.currentTarget.style.color = 'var(--text-secondary)'; }}
                  onMouseLeave={e => { if (tab !== id) e.currentTarget.style.color = 'var(--text-tertiary)'; }}
                >{label}</button>
              ))}
            </div>
          </div>
        </div>

        {/* New posts banner */}
        {newPostsBanner > 0 && (
          <div className="fade-in-up" style={{ margin: '12px 24px 0', textAlign: 'center' }}>
            <button onClick={() => setNewPostsBanner(0)} style={{
              display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 18px',
              borderRadius: 999, background: 'var(--text-primary)', color: '#fff',
              fontFamily: 'Inter', fontWeight: 600, fontSize: 13,
              boxShadow: 'var(--shadow-md)',
              transition: 'all 200ms',
            }}
              onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-1px)'}
              onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
            >
              <Icon name="trending" size={14}/> {newPostsBanner} new posts · Click to load
            </button>
          </div>
        )}

        {/* Composer */}
        <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border-subtle)' }}>
          <div style={{ display: 'flex', gap: 12 }}>
            <Avatar name="Arjun Patel" size={40}/>
            <div style={{ flex: 1 }}>
              <div style={{
                background: 'var(--bg-surface)', border: '1px solid var(--border-default)',
                borderRadius: composerExpanded ? 16 : 999,
                overflow: 'hidden', transition: 'border-radius 220ms var(--ease-out-expo), border-color 200ms',
              }}
                onFocusCapture={e => e.currentTarget.style.borderColor = 'var(--brand-400)'}
                onBlurCapture={e => e.currentTarget.style.borderColor = 'var(--border-default)'}
              >
                <textarea
                  ref={composerRef}
                  value={composerText}
                  onChange={e => setComposerText(e.target.value)}
                  onFocus={() => setComposerExpanded(true)}
                  placeholder={`Share something with the ${channelInfo.label} community…`}
                  style={{
                    width: '100%', padding: composerExpanded ? '14px 16px 10px' : '12px 16px',
                    fontSize: 14, lineHeight: 1.5, resize: 'none',
                    minHeight: composerExpanded ? 100 : 44,
                    background: 'transparent', border: 'none', outline: 'none', color: 'var(--text-primary)',
                    transition: 'min-height 220ms var(--ease-out-expo)',
                  }}
                />
                {composerExpanded && (
                  <div className="fade-in" style={{ padding: '10px 16px', display: 'flex', alignItems: 'center', gap: 10, borderTop: '1px solid var(--border-subtle)' }}>
                    <div style={{ display: 'flex', gap: 6, flex: 1, flexWrap: 'wrap' }}>
                      {EXAM_COMMUNITIES.filter(c => c.joined).map(c => (
                        <button key={c.id} onClick={() => setSelectedCommunity(c.id)} style={{
                          padding: '4px 10px', borderRadius: 999, fontSize: 12, fontFamily: 'Inter', fontWeight: 500,
                          border: '1px solid var(--border-default)',
                          background: selectedCommunity === c.id ? 'var(--text-primary)' : 'transparent',
                          color: selectedCommunity === c.id ? '#fff' : 'var(--text-secondary)',
                          transition: 'all 180ms',
                        }}>{c.icon} {c.label}</button>
                      ))}
                    </div>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button onClick={() => { setComposerExpanded(false); setComposerText(''); }} className="btn btn-ghost btn-sm">Cancel</button>
                      <button onClick={submitPost} disabled={!composerText.trim()} className="btn btn-brand btn-sm" style={{ opacity: composerText.trim() ? 1 : 0.5 }}>Post</button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Posts */}
        <div>
          {filteredPosts.map(post => (
            <PostCard key={post.id} post={post} onClick={() => setActiveThread(post)}/>
          ))}
          {filteredPosts.length === 0 && (
            <div style={{ padding: '60px 24px', textAlign: 'center', color: 'var(--text-tertiary)' }}>
              <p className="font-display" style={{ fontStyle: 'italic', fontSize: 18 }}>Nothing here yet — be first to post!</p>
            </div>
          )}
        </div>
      </div>

      {/* ── Right: Trending + suggestions ── */}
      {activeThread ? (
        <ThreadPanel post={activeThread} onClose={() => setActiveThread(null)}/>
      ) : (
        <aside style={{
          width: 308, flexShrink: 0,
          overflowY: 'auto', padding: '20px 20px',
          display: 'flex', flexDirection: 'column', gap: 20,
        }}>
          {/* Trending */}
          <div className="card" style={{ padding: 20 }}>
            <div className="font-heading" style={{ fontSize: 15, fontWeight: 700, marginBottom: 14 }}>Trending in your communities</div>
            {TRENDING.map((t, i) => (
              <div key={i} style={{ padding: '10px 0', borderBottom: i < TRENDING.length - 1 ? '1px solid var(--border-subtle)' : 'none' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ fontFamily: 'Inter', fontWeight: 600, fontSize: 14, color: 'var(--brand-600)' }}>{t.tag}</span>
                  <span className="chip chip-sm chip-mint" style={{ marginLeft: 'auto' }}>{t.rise}</span>
                </div>
                <div style={{ fontSize: 12, color: 'var(--text-tertiary)', marginTop: 2 }}>{t.posts.toLocaleString()} posts</div>
              </div>
            ))}
          </div>

          {/* Upcoming events */}
          <div className="card" style={{ padding: 20 }}>
            <div className="font-heading" style={{ fontSize: 15, fontWeight: 700, marginBottom: 14 }}>Upcoming events</div>
            {UPCOMING_EVENTS.map((ev, i) => (
              <div key={i} style={{ padding: '10px 0', borderBottom: i < UPCOMING_EVENTS.length - 1 ? '1px solid var(--border-subtle)' : 'none' }}>
                <div style={{ fontFamily: 'Inter', fontWeight: 600, fontSize: 13, color: 'var(--text-primary)' }}>{ev.title}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
                  <span style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>{ev.time}</span>
                  <span className="chip chip-sm"><Icon name="users" size={11}/> {ev.participants}</span>
                </div>
                <button className="btn btn-ghost btn-sm" style={{ marginTop: 8, width: '100%', justifyContent: 'center' }}>RSVP →</button>
              </div>
            ))}
          </div>

          {/* Suggested mentors */}
          <div className="card" style={{ padding: 20 }}>
            <div className="font-heading" style={{ fontSize: 15, fontWeight: 700, marginBottom: 14 }}>Mentors to follow</div>
            {[
              { name: 'Dr. Priya Iyer', sub: 'Data Science · IIT Bombay', rating: 4.9 },
              { name: 'Rajesh Nair', sub: 'Physics · JEE Expert', rating: 4.8 },
              { name: 'Meena Krishnan', sub: 'Chemistry · NEET Specialist', rating: 4.7 },
            ].map((m, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderBottom: i < 2 ? '1px solid var(--border-subtle)' : 'none' }}>
                <Avatar name={m.name} size={36}/>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontFamily: 'Inter', fontWeight: 600, fontSize: 13 }} className="truncate">{m.name}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-tertiary)', marginTop: 1 }} className="truncate">{m.sub}</div>
                </div>
                <button style={{ fontSize: 12, fontWeight: 600, padding: '4px 12px', borderRadius: 999, border: '1px solid var(--border-default)', color: 'var(--brand-600)', transition: 'all 160ms', whiteSpace: 'nowrap' }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'var(--brand-50)'; e.currentTarget.style.borderColor = 'var(--brand-300)'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'var(--border-default)'; }}
                >Follow</button>
              </div>
            ))}
          </div>
        </aside>
      )}
    </div>
  );
};

// ═══════════════════════════════════════
// SETTINGS — light, minimal
// ═══════════════════════════════════════
const Settings = ({ user, navigate, updateUser }) => {
  const [section, setSection] = useState('account');
  const dark = typeof window !== 'undefined' && document.documentElement.dataset.theme === 'dark';
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
                  <div>
                    <div className="label-sm" style={{ marginBottom: 6 }}>Username</div>
                    <input className="input" defaultValue="arjunp"/>
                  </div>
                  <div>
                    <div className="label-sm" style={{ marginBottom: 6 }}>Timezone</div>
                    <input className="input" defaultValue="IST (UTC+5:30)"/>
                  </div>
                </div>
                <button className="btn btn-brand btn-md" style={{ marginTop: 18 }}>Save changes</button>
              </div>
              <div className="card" style={{ padding: 26 }}>
                <h3 className="font-heading" style={{ fontSize: 16, fontWeight: 600, marginBottom: 14 }}>Security</h3>
                <SettingRow title="Password" sub="Last changed 3 months ago" right={<button className="btn btn-ghost btn-sm">Change</button>}/>
                <SettingRow title="Two-factor auth" sub="Authenticator app enabled" right={<span className="chip chip-sm" style={{ background: 'var(--mint-100)', color: 'var(--mint-700)', borderColor: 'transparent' }}>On</span>}/>
                <SettingRow title="Active sessions" sub="Signed in on 2 devices" right={<button className="btn btn-ghost btn-sm">Manage</button>} last/>
              </div>
              <div className="card" style={{ padding: 26, borderColor: 'var(--danger-100)' }}>
                <h3 className="font-heading" style={{ fontSize: 15, fontWeight: 600, marginBottom: 10, color: 'var(--danger-500)' }}>Danger zone</h3>
                <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 14 }}>Deleting your account is permanent and cannot be undone.</p>
                <button style={{ height: 36, padding: '0 16px', borderRadius: 999, border: '1px solid var(--danger-500)', color: 'var(--danger-500)', fontSize: 13, fontWeight: 600 }}>Delete account</button>
              </div>
            </>
          )}
          {section === 'subscription' && (
            <div className="card" style={{ padding: 32, background: 'linear-gradient(135deg, rgba(245,158,11,0.05), rgba(217,119,6,0.02))' }}>
              <span className="label-sm" style={{ color: 'var(--amber-600)' }}>Current plan</span>
              <h2 className="font-display" style={{ fontSize: 40, fontWeight: 500, fontStyle: 'italic', marginTop: 10, letterSpacing: '-0.02em' }}>Elm Origin {user?.plan || 'Free'}</h2>
              {user?.plan === 'Free' ? (
                <>
                  <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginTop: 8, lineHeight: 1.5 }}>Upgrade to Pro to unlock unlimited peer interviews, more collaborative rooms, and priority Nova access.</p>
                  <button onClick={() => navigate && navigate('pricing')} className="btn btn-brand btn-md" style={{ marginTop: 20 }}>
                    <Icon name="sparkles" size={15}/> Upgrade to Pro
                  </button>
                </>
              ) : (
                <>
                  <div style={{ fontSize: 14, color: 'var(--text-secondary)', marginTop: 6 }}>₹499/month · Renews Nov 30, 2026</div>
                  <div style={{ display: 'flex', gap: 10, marginTop: 24 }}>
                    <button className="btn btn-ghost btn-md">Change plan</button>
                    <button className="btn btn-ghost btn-md">View invoices</button>
                  </div>
                </>
              )}
            </div>
          )}
          {section === 'appearance' && (
            <>
              <div className="card" style={{ padding: 26 }}>
                <h3 className="font-heading" style={{ fontSize: 16, fontWeight: 600, marginBottom: 16 }}>Theme</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
                  {[['Light','Soft & bright',false],['Dark','Midnight',false],['System','Follow OS',false]].map(([n,d], i) => {
                    const isActive = i === 0 ? !dark : i === 1 ? dark : false;
                    return (
                      <button key={n} onClick={() => {
                        if (i === 0 && window.useTheme) { /* handled by TopBar */ }
                        if (typeof window.setTheme === 'function') window.setTheme(i === 0 ? 'light' : i === 1 ? 'dark' : 'light');
                      }} className="card card-hover" style={{ padding: 14, textAlign: 'left', borderColor: isActive ? 'var(--text-primary)' : 'var(--border-subtle)' }}>
                        <div style={{ height: 56, borderRadius: 8, background: i === 0 ? 'linear-gradient(135deg, #FFFFFF, #F3F4F8)' : i === 1 ? 'linear-gradient(135deg, #0E1228, #232845)' : 'linear-gradient(90deg, #FFFFFF 50%, #0E1228 50%)', marginBottom: 10, border: '1px solid var(--border-subtle)' }}/>
                        <div className="font-heading" style={{ fontSize: 13, fontWeight: 600 }}>{n}</div>
                        <div style={{ fontSize: 11, color: 'var(--text-tertiary)', marginTop: 2 }}>{d}</div>
                        {isActive && <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 4, color: 'var(--mint-600)', fontSize: 12, fontWeight: 600 }}><Icon name="check" size={12}/> Active</div>}
                      </button>
                    );
                  })}
                </div>
              </div>
              <div className="card" style={{ padding: 26 }}>
                <h3 className="font-heading" style={{ fontSize: 16, fontWeight: 600, marginBottom: 14 }}>Accessibility</h3>
                <ToggleRow title="Reduce motion" sub="Disables animations and transitions" defaultOn={false} last/>
              </div>
            </>
          )}
          {section === 'notifications' && (
            <div className="card" style={{ padding: 26 }}>
              <h3 className="font-heading" style={{ fontSize: 16, fontWeight: 600, marginBottom: 14 }}>What to notify me about</h3>
              {[
                ['Session reminders','15 min before each session',true],
                ['Mentor responses','When a mentor replies',true],
                ['Elm Together requests','When a peer wants to study with you',true],
                ['Community mentions','Someone @s you',true],
                ['Interview matches','When a peer match is found',true],
                ['Weekly digest','Study summary every Sunday',false],
                ['Marketing','New features and product updates',false],
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
              <div className="card" style={{ padding: 26 }}>
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
