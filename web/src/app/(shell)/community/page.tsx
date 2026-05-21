'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Avatar, Icon } from '@/components/primitives';
import { useRealtimeTable } from '@/hooks/useRealtimeSubscription';
import {
  joinCommunity,
  listJoinedCommunityIds,
  listRsvpedEventIds,
  toggleEventRsvp,
} from '@/app/actions/community';
import {
  createPost,
  listFollowingPosts,
  listLatestPosts,
  listTrendingPosts,
  listFollowedIds,
  toggleFollow,
  type FeedPost,
} from '@/app/actions/feeds';
import { toast } from '@/lib/toast';

type UserShape = { name: string; handle: string; plan: 'Free' | 'Pro' | 'Elite' };

type Post = {
  id: string;
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

type Tab = 'for-you' | 'following' | 'trending' | 'latest';
const TABS: { id: Tab; label: string }[] = [
  { id: 'for-you',   label: 'For you'   },
  { id: 'following', label: 'Following' },
  { id: 'trending',  label: 'Trending'  },
  { id: 'latest',    label: 'Latest'    },
];

const COMMUNITIES = [
  { id: 'world', label: 'World Feed', icon: '🌐', members: 12400, joined: true },
  { id: 'jee',   label: 'JEE Mains',  icon: '⚡', members: 4820,  joined: true },
  { id: 'neet',  label: 'NEET UG',    icon: '🔬', members: 3910,  joined: true },
  { id: 'cat',   label: 'CAT',        icon: '📊', members: 2140,  joined: true },
  { id: 'upsc',  label: 'UPSC CSE',   icon: '🏛️', members: 1860,  joined: false },
  { id: 'gre',   label: 'GRE',        icon: '🎓', members: 1230,  joined: false },
];

const TRENDING_TAGS = [
  { tag: '#JEE2026',         posts: 2140, rise: '+18%', community: 'jee' },
  { tag: '#NEETUGPrep',      posts: 1830, rise: '+12%', community: 'neet' },
  { tag: '#StudyWithMe',     posts: 4210, rise: '+31%', community: 'world' },
  { tag: '#CATQuant',        posts: 980,  rise: '+9%',  community: 'cat' },
  { tag: '#InterviewSeason', posts: 1560, rise: '+44%', community: 'world' },
];

const EVENTS = [
  { id: 'jee-mock-marathon-2026', title: 'JEE Mock Marathon', time: 'Today, 8 PM',    participants: 312 },
  { id: 'neet-bio-ama-2026',      title: 'NEET Biology AMA',  time: 'Tomorrow, 6 PM', participants: 180 },
  { id: 'cat-quant-sprint-2026',  title: 'CAT Quant Sprint',  time: 'Sat, 10 AM',     participants: 94  },
];

// Suggested mentors get a stable target_id so the toggleFollow row sticks.
const SUGGESTED_MENTORS = [
  { id: 'mentor-priya-iyer',     name: 'Dr. Priya Iyer', sub: 'Data Science · IIT Bombay', rating: 4.9 },
  { id: 'mentor-rajesh-nair',    name: 'Rajesh Nair',    sub: 'Physics · JEE Expert',      rating: 4.8 },
  { id: 'mentor-meena-krishnan', name: 'Meena Krishnan', sub: 'Chemistry · NEET',          rating: 4.7 },
  { id: 'mentor-arjun-mehta',    name: 'Arjun Mehta',    sub: 'CS · Stripe',               rating: 4.9 },
];

function relativeTime(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const min = Math.floor(diff / 60_000);
  if (min < 1) return 'now';
  if (min < 60) return `${min}m ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h ago`;
  const day = Math.floor(hr / 24);
  if (day === 1) return 'yesterday';
  if (day < 7) return `${day}d ago`;
  return new Date(iso).toLocaleDateString();
}

function feedPostToCard(p: FeedPost, communityLabelFor: (id: string) => string): Post {
  const name = p.author?.full_name ?? p.author?.handle ?? 'Someone';
  const handle = p.author?.handle ?? 'user';
  const planRaw = p.author?.plan ?? 'Free';
  const plan: UserShape['plan'] = planRaw === 'Pro' || planRaw === 'Elite' ? planRaw : 'Free';
  return {
    id: p.id,
    user: { name, handle, plan },
    community: p.community_id,
    communityLabel: communityLabelFor(p.community_id),
    time: relativeTime(p.created_at),
    body: p.body,
    tag: p.tag,
    likes: p.like_count,
    replies: p.comment_count,
    reposts: 0,
    bookmarks: 0,
    liked: false,
    bookmarked: false,
    threadReplies: [],
  };
}

function PostCard({ post, onClick }: { post: Post; onClick: () => void }) {
  const [p, setP] = useState(post);
  // Keep local UI in sync if the parent passes a new post (e.g. after refetch).
  useEffect(() => { setP(post); }, [post]);
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
    setReplies(r => [...r, { user: { name: 'You', handle: 'you', plan: 'Free' }, body: reply, time: 'now', likes: 0 }]);
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
          <Avatar name="You" size={32} />
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

function FeedSkeleton() {
  return (
    <div>
      {[0, 1, 2].map(i => (
        <div key={i} style={{ padding: '20px 24px', borderBottom: '1px solid var(--border-subtle)' }}>
          <div style={{ display: 'flex', gap: 12 }}>
            <div style={{ width: 40, height: 40, borderRadius: 999, background: 'var(--bg-hover)' }} />
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={{ width: 160, height: 12, borderRadius: 4, background: 'var(--bg-hover)' }} />
              <div style={{ width: '90%', height: 12, borderRadius: 4, background: 'var(--bg-hover)' }} />
              <div style={{ width: '70%', height: 12, borderRadius: 4, background: 'var(--bg-hover)' }} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function CommunityPage() {
  const [active, setActive] = useState('world');
  const [tab, setTab] = useState<Tab>('for-you');
  const [feedPosts, setFeedPosts] = useState<Post[]>([]);
  const [feedLoading, setFeedLoading] = useState(true);
  const [composer, setComposer] = useState('');
  const [composerOpen, setComposerOpen] = useState(false);
  const [posting, setPosting] = useState(false);
  const [selectedCommunity, setSelectedCommunity] = useState('world');
  const [thread, setThread] = useState<Post | null>(null);
  const [newBanner, setNewBanner] = useState(0);
  const [joinedIds, setJoinedIds] = useState<string[]>([]);
  const [rsvpedIds, setRsvpedIds] = useState<string[]>([]);
  const [followedMentors, setFollowedMentors] = useState<string[]>([]);
  const [pendingFollowIds, setPendingFollowIds] = useState<string[]>([]);
  const composerRef = useRef<HTMLTextAreaElement>(null);

  const allCommunities = COMMUNITIES.map(c => ({
    ...c,
    joined: c.joined || joinedIds.includes(c.id),
  }));

  const communityLabelFor = useCallback((id: string) => {
    return COMMUNITIES.find(c => c.id === id)?.label ?? id;
  }, []);

  useRealtimeTable({
    channelName: 'community-posts',
    table: 'posts',
    event: 'INSERT',
    onChange: () => setNewBanner(c => c + 1),
  });

  // Initial load: joined communities, RSVPs, followed mentors.
  useEffect(() => {
    listJoinedCommunityIds().then(setJoinedIds).catch(() => {});
    listRsvpedEventIds().then(setRsvpedIds).catch(() => {});
    listFollowedIds().then(({ mentors }) => setFollowedMentors(mentors)).catch(() => {});
  }, []);

  // Load the feed whenever the tab or active community changes.
  useEffect(() => {
    let cancelled = false;
    setFeedLoading(true);

    const loader = (async (): Promise<FeedPost[]> => {
      if (tab === 'following')  return listFollowingPosts({ limit: 50 });
      if (tab === 'trending')   return listTrendingPosts({ limit: 50, days: 7 });
      if (tab === 'latest')     return listLatestPosts({ limit: 50 });
      // For you = latest, filtered to active community ('world' shows all)
      const all = await listLatestPosts({ limit: 100 });
      return active === 'world' ? all : all.filter(p => p.community_id === active);
    })();

    loader
      .then(rows => {
        if (cancelled) return;
        setFeedPosts(rows.map(r => feedPostToCard(r, communityLabelFor)));
      })
      .catch(err => {
        if (cancelled) return;
        console.error('[feed]', err);
        setFeedPosts([]);
      })
      .finally(() => {
        if (!cancelled) setFeedLoading(false);
      });

    return () => { cancelled = true; };
  }, [tab, active, communityLabelFor]);

  const handleJoin = async (communityId: string, label: string) => {
    setJoinedIds(prev => prev.includes(communityId) ? prev : [...prev, communityId]);
    setActive(communityId);
    toast(`Joined ${label}`);
    try {
      await joinCommunity(communityId);
    } catch (err) {
      setJoinedIds(prev => prev.filter(id => id !== communityId));
      toast(err instanceof Error ? err.message : 'Could not join community');
    }
  };

  const handleRsvp = async (eventId: string) => {
    const wasRsvped = rsvpedIds.includes(eventId);
    setRsvpedIds(prev => wasRsvped ? prev.filter(id => id !== eventId) : [...prev, eventId]);
    try {
      await toggleEventRsvp(eventId, !wasRsvped);
    } catch (err) {
      setRsvpedIds(prev => wasRsvped ? [...prev, eventId] : prev.filter(id => id !== eventId));
      toast(err instanceof Error ? err.message : 'Could not update RSVP');
    }
  };

  const handleFollowMentor = async (mentorId: string, name: string) => {
    if (pendingFollowIds.includes(mentorId)) return;
    const wasFollowing = followedMentors.includes(mentorId);
    setPendingFollowIds(prev => [...prev, mentorId]);
    setFollowedMentors(prev => wasFollowing ? prev.filter(id => id !== mentorId) : [...prev, mentorId]);
    try {
      const res = await toggleFollow({ target_type: 'mentor', target_id: mentorId });
      // Reconcile with server result in case our optimistic guess was wrong.
      setFollowedMentors(prev =>
        res.following ? Array.from(new Set([...prev, mentorId])) : prev.filter(id => id !== mentorId)
      );
      if (res.following) toast(`Following ${name}`);
    } catch (err) {
      setFollowedMentors(prev => wasFollowing ? [...prev, mentorId] : prev.filter(id => id !== mentorId));
      toast(err instanceof Error ? err.message : 'Could not update follow');
    } finally {
      setPendingFollowIds(prev => prev.filter(id => id !== mentorId));
    }
  };

  const submit = async () => {
    const body = composer.trim();
    if (!body || posting) return;
    setPosting(true);
    try {
      const created = await createPost({ body, community_id: selectedCommunity });
      const card = feedPostToCard(created, communityLabelFor);
      setFeedPosts(prev => [card, ...prev]);
      setComposer('');
      setComposerOpen(false);
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Could not post');
    } finally {
      setPosting(false);
    }
  };

  const activeCommunity = allCommunities.find(c => c.id === active) || allCommunities[0];

  const tabIsCommunityFiltered = tab === 'for-you';
  const visiblePosts = tabIsCommunityFiltered
    ? feedPosts // already filtered in the loader
    : feedPosts;

  const emptyMessage =
    tab === 'following' ? 'Follow some people or communities to see their posts here.'
    : tab === 'trending'  ? 'Nothing trending yet — check back later.'
    : tab === 'latest'    ? 'Nothing here yet — be the first to post!'
    :                       'Nothing here yet — be the first to post!';

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '248px minmax(0, 1fr) 308px', height: 'calc(100vh - 68px)', overflow: 'hidden' }}>
      {/* Left */}
      <aside style={{ borderRight: '1px solid var(--border-subtle)', display: 'flex', flexDirection: 'column', overflowY: 'auto', padding: '20px 12px' }}>
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.06em', color: 'var(--text-tertiary)', textTransform: 'uppercase', padding: '0 8px 10px' }}>Your communities</div>
        {allCommunities.filter(c => c.joined).map(c => (
          <button
            key={c.id}
            onClick={() => setActive(c.id)}
            style={{
              display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 12, width: '100%', textAlign: 'left',
              background: active === c.id ? 'var(--bg-hover)' : 'transparent',
              color: active === c.id ? 'var(--text-primary)' : 'var(--text-secondary)',
              fontWeight: active === c.id ? 600 : 500, fontSize: 14,
              cursor: 'pointer', transition: 'background 160ms, color 160ms',
            }}
            onMouseEnter={e => { if (active !== c.id) { e.currentTarget.style.background = 'var(--bg-hover)'; e.currentTarget.style.color = 'var(--text-primary)'; } }}
            onMouseLeave={e => { if (active !== c.id) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-secondary)'; } }}
          >
            <span style={{ fontSize: 18, width: 24, textAlign: 'center' }}>{c.icon}</span>
            <span style={{ flex: 1 }}>{c.label}</span>
            {active === c.id && <span style={{ width: 6, height: 6, borderRadius: 999, background: 'var(--brand-500)' }} />}
          </button>
        ))}
        <div style={{ height: 1, background: 'var(--border-subtle)', margin: '12px 8px' }} />
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.06em', color: 'var(--text-tertiary)', textTransform: 'uppercase', padding: '0 8px 10px' }}>Discover</div>
        {allCommunities.filter(c => !c.joined).map(c => (
          <button
            key={c.id}
            onClick={() => handleJoin(c.id, c.label)}
            style={{
              display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 12, width: '100%', textAlign: 'left',
              background: 'transparent', color: 'var(--text-tertiary)', fontWeight: 500, fontSize: 14,
              cursor: 'pointer', transition: 'background 160ms, color 160ms',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg-hover)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-tertiary)'; }}
          >
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
              {TABS.map(t => {
                const isActive = tab === t.id;
                return (
                  <button
                    key={t.id}
                    onClick={() => setTab(t.id)}
                    style={{
                      padding: '10px 18px', fontSize: 14, fontWeight: isActive ? 600 : 400,
                      color: isActive ? 'var(--text-primary)' : 'var(--text-tertiary)',
                      borderBottom: isActive ? '2px solid var(--text-primary)' : '2px solid transparent',
                      cursor: 'pointer', transition: 'color 160ms',
                      background: 'transparent',
                    }}
                    onMouseEnter={e => { if (!isActive) e.currentTarget.style.color = 'var(--text-secondary)'; }}
                    onMouseLeave={e => { if (!isActive) e.currentTarget.style.color = 'var(--text-tertiary)'; }}
                  >{t.label}</button>
                );
              })}
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
            <Avatar name="You" size={40} />
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
                    {allCommunities.filter(c => c.joined).map(c => (
                      <button
                        key={c.id}
                        onClick={() => setSelectedCommunity(c.id)}
                        style={{
                          padding: '4px 10px', borderRadius: 999, fontSize: 12, fontWeight: 500,
                          border: '1px solid var(--border-default)',
                          background: selectedCommunity === c.id ? 'var(--text-primary)' : 'transparent',
                          color: selectedCommunity === c.id ? '#fff' : 'var(--text-secondary)',
                          cursor: 'pointer',
                        }}
                      >{c.icon} {c.label}</button>
                    ))}
                  </div>
                  <button onClick={() => { setComposerOpen(false); setComposer(''); }} style={{ padding: '6px 12px', borderRadius: 999, background: 'transparent', fontSize: 12, fontWeight: 500, color: 'var(--text-secondary)' }}>Cancel</button>
                  <button
                    onClick={submit}
                    disabled={!composer.trim() || posting}
                    style={{ padding: '6px 14px', borderRadius: 999, background: composer.trim() && !posting ? 'var(--gradient-brand)' : 'var(--bg-hover)', color: composer.trim() && !posting ? '#fff' : 'var(--text-tertiary)', fontSize: 12, fontWeight: 600, cursor: composer.trim() && !posting ? 'pointer' : 'not-allowed' }}
                  >{posting ? 'Posting…' : 'Post'}</button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Posts */}
        <div>
          {feedLoading ? (
            <FeedSkeleton />
          ) : visiblePosts.length === 0 ? (
            <div style={{ padding: '60px 24px', textAlign: 'center', color: 'var(--text-tertiary)' }}>
              <p style={{ fontFamily: 'Fraunces, serif', fontStyle: 'italic', fontSize: 18 }}>{emptyMessage}</p>
            </div>
          ) : (
            visiblePosts.map(p => <PostCard key={p.id} post={p} onClick={() => setThread(p)} />)
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
            {TRENDING_TAGS.map((t, i) => (
              <button
                key={i}
                onClick={() => setActive(t.community)}
                style={{
                  display: 'block', width: '100%', textAlign: 'left',
                  padding: '10px 8px', margin: '0 -8px',
                  borderRadius: 10, background: 'transparent',
                  borderBottom: i < TRENDING_TAGS.length - 1 ? '1px solid var(--border-subtle)' : 'none',
                  cursor: 'pointer', transition: 'background 160ms',
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--brand-600)' }}>{t.tag}</span>
                  <span style={{ marginLeft: 'auto', padding: '2px 8px', borderRadius: 999, background: 'rgba(16,185,129,0.10)', color: 'var(--mint-600)', fontSize: 11, fontWeight: 600 }}>{t.rise}</span>
                </div>
                <div style={{ fontSize: 12, color: 'var(--text-tertiary)', marginTop: 2 }}>{t.posts.toLocaleString()} posts</div>
              </button>
            ))}
          </div>
          <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 16, padding: 20 }}>
            <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 14 }}>Upcoming events</div>
            {EVENTS.map((ev, i) => {
              const isRsvped = rsvpedIds.includes(ev.id);
              return (
                <div key={ev.id} style={{ padding: '10px 0', borderBottom: i < EVENTS.length - 1 ? '1px solid var(--border-subtle)' : 'none' }}>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>{ev.title}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
                    <span style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>{ev.time}</span>
                    <span style={{ padding: '2px 8px', borderRadius: 999, background: 'var(--bg-hover)', fontSize: 11, color: 'var(--text-secondary)' }}><Icon name="users" size={11} /> {ev.participants + (isRsvped ? 1 : 0)}</span>
                  </div>
                  <button
                    onClick={() => handleRsvp(ev.id)}
                    style={{
                      marginTop: 8, width: '100%', height: 32, borderRadius: 999,
                      background: isRsvped ? 'var(--brand-500)' : 'var(--bg-hover)',
                      color: isRsvped ? '#fff' : 'var(--text-primary)',
                      border: `1px solid ${isRsvped ? 'var(--brand-500)' : 'var(--border-subtle)'}`,
                      fontSize: 12, fontWeight: 500,
                      cursor: 'pointer', transition: 'all 160ms',
                    }}
                    onMouseEnter={e => { if (!isRsvped) { e.currentTarget.style.background = 'var(--border-subtle)'; } }}
                    onMouseLeave={e => { if (!isRsvped) { e.currentTarget.style.background = 'var(--bg-hover)'; } }}
                  >
                    {isRsvped ? "RSVP'd ✓" : 'RSVP →'}
                  </button>
                </div>
              );
            })}
          </div>
          <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 16, padding: 20 }}>
            <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 14 }}>Mentors to follow</div>
            {SUGGESTED_MENTORS.map((m, i) => {
              const isFollowing = followedMentors.includes(m.id);
              const isPending = pendingFollowIds.includes(m.id);
              return (
                <div key={m.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderBottom: i < SUGGESTED_MENTORS.length - 1 ? '1px solid var(--border-subtle)' : 'none' }}>
                  <Avatar name={m.name} size={36} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{m.name}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>{m.sub}</div>
                  </div>
                  <button
                    onClick={() => handleFollowMentor(m.id, m.name)}
                    disabled={isPending}
                    style={{
                      fontSize: 12, fontWeight: 600, padding: '4px 12px', borderRadius: 999,
                      border: `1px solid ${isFollowing ? 'var(--brand-500)' : 'var(--border-default)'}`,
                      background: isFollowing ? 'var(--brand-500)' : 'transparent',
                      color: isFollowing ? '#fff' : 'var(--brand-500)',
                      cursor: isPending ? 'wait' : 'pointer', transition: 'all 160ms',
                      opacity: isPending ? 0.7 : 1,
                    }}
                    onMouseEnter={e => {
                      if (isPending || isFollowing) return;
                      e.currentTarget.style.background = 'var(--bg-hover)';
                      e.currentTarget.style.borderColor = 'var(--border-strong)';
                    }}
                    onMouseLeave={e => {
                      if (isPending || isFollowing) return;
                      e.currentTarget.style.background = 'transparent';
                      e.currentTarget.style.borderColor = 'var(--border-default)';
                    }}
                  >{isFollowing ? 'Following' : 'Follow'}</button>
                </div>
              );
            })}
          </div>
        </aside>
      )}
    </div>
  );
}
