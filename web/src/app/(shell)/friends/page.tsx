'use client';

import { useEffect, useState, useCallback, useTransition, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Avatar from '@/components/primitives/Avatar';
import Icon from '@/components/primitives/Icon';
import { createClient } from '@/lib/supabase/client';
import {
  listFriends,
  listPendingRequests,
  listSentRequests,
  searchProfiles,
  acceptFriendRequest,
  rejectFriendRequest,
  removeFriend,
  sendFriendRequest,
} from '@/app/actions/friends';

type Tab = 'friends' | 'requests' | 'find';

type Friend = Awaited<ReturnType<typeof listFriends>>[number];
type PendingRequest = Awaited<ReturnType<typeof listPendingRequests>>[number];
type SentRequest = Awaited<ReturnType<typeof listSentRequests>>[number];
type ProfileResult = Awaited<ReturnType<typeof searchProfiles>>[number];

function Toast({ msg, type }: { msg: string; type: 'success' | 'error' }) {
  return (
    <div style={{
      position: 'fixed', bottom: 80, left: '50%', transform: 'translateX(-50%)',
      zIndex: 200, padding: '12px 20px', borderRadius: 999,
      background: type === 'success' ? '#10B981' : '#ef4444',
      color: '#fff', fontSize: 13, fontWeight: 600,
      boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
      whiteSpace: 'nowrap',
      animation: 'toastIn 200ms ease',
    }}>{msg}</div>
  );
}

function FriendCard({ item, onRemove }: { item: Friend; onRemove: (id: string) => void }) {
  const [removing, startRemove] = useTransition();
  const f = item.friend;
  const name = f.full_name || f.handle || 'Unknown';
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 18px', background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 14 }}>
      <Avatar name={name} size={44} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--text-primary)' }}>{name}</div>
        {f.handle && <div style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>@{f.handle}</div>}
        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{f.plan} plan</div>
      </div>
      <button
        disabled={removing}
        onClick={() => startRemove(async () => { await removeFriend(item.id); onRemove(item.id); })}
        style={{ height: 32, padding: '0 12px', borderRadius: 999, fontSize: 12, fontWeight: 500, color: 'var(--danger-600)', background: 'var(--danger-100)', border: '1px solid rgba(225,29,72,0.2)', cursor: removing ? 'wait' : 'pointer', opacity: removing ? 0.6 : 1 }}
      >
        {removing ? '…' : 'Remove'}
      </button>
    </div>
  );
}

function RequestCard({ item, onAccept, onDecline }: { item: PendingRequest; onAccept: (id: string) => void; onDecline: (id: string) => void }) {
  const [actingAccept, startAccept] = useTransition();
  const [actingDecline, startDecline] = useTransition();
  const s = item.sender;
  const name = s.full_name || s.handle || 'Unknown';
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 18px', background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 14 }}>
      <Avatar name={name} size={44} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--text-primary)' }}>{name}</div>
        {s.handle && <div style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>@{s.handle}</div>}
        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{s.plan} plan</div>
      </div>
      <div style={{ display: 'flex', gap: 8 }}>
        <button
          disabled={actingAccept}
          onClick={() => startAccept(async () => { await acceptFriendRequest(item.id); onAccept(item.id); })}
          style={{ height: 32, padding: '0 14px', borderRadius: 999, fontSize: 12, fontWeight: 600, background: 'var(--gradient-brand)', color: '#fff', cursor: actingAccept ? 'wait' : 'pointer', opacity: actingAccept ? 0.6 : 1 }}
        >
          {actingAccept ? '…' : 'Accept'}
        </button>
        <button
          disabled={actingDecline}
          onClick={() => startDecline(async () => { await rejectFriendRequest(item.id); onDecline(item.id); })}
          style={{ height: 32, padding: '0 12px', borderRadius: 999, fontSize: 12, fontWeight: 500, color: 'var(--text-secondary)', background: 'var(--bg-hover)', border: '1px solid var(--border-subtle)', cursor: actingDecline ? 'wait' : 'pointer', opacity: actingDecline ? 0.6 : 1 }}
        >
          {actingDecline ? '…' : 'Decline'}
        </button>
      </div>
    </div>
  );
}

function SearchResultCard({ profile, sentIds, onSend }: { profile: ProfileResult; sentIds: Set<string>; onSend: (id: string) => void }) {
  const [sending, startSend] = useTransition();
  const [errMsg, setErrMsg] = useState('');
  const already = sentIds.has(profile.id);
  const name = profile.full_name || profile.handle || 'Unknown';
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 18px', background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 14 }}>
      <Avatar name={name} size={44} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontWeight: 600, fontSize: 14, color: 'var(--text-primary)' }}>{name}</span>
          {profile.is_mentor && <span style={{ fontSize: 10, fontWeight: 600, padding: '2px 6px', borderRadius: 999, background: 'rgba(79,70,229,0.1)', color: 'var(--brand-500)' }}>Mentor</span>}
        </div>
        {profile.handle && <div style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>@{profile.handle}</div>}
        {errMsg && <div style={{ fontSize: 11, color: 'var(--danger-600)', marginTop: 2 }}>{errMsg}</div>}
      </div>
      <button
        disabled={sending || already}
        onClick={() => {
          setErrMsg('');
          startSend(async () => {
            const res = await sendFriendRequest(profile.id);
            if (res.ok) { onSend(profile.id); }
            else { setErrMsg(res.error ?? 'Failed'); }
          });
        }}
        style={{
          height: 32, padding: '0 14px', borderRadius: 999, fontSize: 12, fontWeight: 600,
          background: already ? 'var(--bg-hover)' : 'var(--gradient-brand)',
          color: already ? 'var(--text-secondary)' : '#fff',
          border: already ? '1px solid var(--border-subtle)' : 'none',
          cursor: sending || already ? 'default' : 'pointer',
          opacity: sending ? 0.6 : 1,
        }}
      >
        {sending ? '…' : already ? 'Sent' : 'Add Friend'}
      </button>
    </div>
  );
}

export default function FriendsPage() {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>('friends');
  const [friends, setFriends] = useState<Friend[]>([]);
  const [pending, setPending] = useState<PendingRequest[]>([]);
  const [sent, setSent] = useState<SentRequest[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<ProfileResult[]>([]);
  const [sentIds, setSentIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showToast = useCallback((msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  }, []);

  const reload = useCallback(async () => {
    setLoading(true);
    const [f, p, s] = await Promise.all([listFriends(), listPendingRequests(), listSentRequests()]);
    setFriends(f);
    setPending(p);
    setSent(s);
    setSentIds(new Set(s.map((r) => r.receiver.id)));
    setLoading(false);
  }, []);

  useEffect(() => { reload(); }, [reload]);

  // Realtime subscription
  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel('friends-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'friends' }, (payload) => {
        const ev = payload.eventType;
        if (ev === 'INSERT') {
          const row = payload.new as { status: string };
          if (row.status === 'pending') {
            showToast('You have a new friend request!');
          }
        }
        if (ev === 'UPDATE') {
          const row = payload.new as { status: string };
          if (row.status === 'accepted') {
            showToast('Your friend request was accepted!');
          }
        }
        reload();
        router.refresh();
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [reload, router, showToast]);

  // Debounced search
  useEffect(() => {
    if (!searchQuery.trim()) { setSearchResults([]); return; }
    if (searchTimer.current) clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(async () => {
      setSearching(true);
      const results = await searchProfiles(searchQuery);
      setSearchResults(results);
      setSearching(false);
    }, 350);
    return () => { if (searchTimer.current) clearTimeout(searchTimer.current); };
  }, [searchQuery]);

  const tabStyle = (t: Tab) => ({
    padding: '10px 20px', borderRadius: 999, fontSize: 14, fontWeight: tab === t ? 600 : 500,
    background: tab === t ? 'var(--bg-surface)' : 'transparent',
    color: tab === t ? 'var(--text-primary)' : 'var(--text-secondary)',
    boxShadow: tab === t ? 'var(--shadow-xs)' : 'none',
    cursor: 'pointer', transition: 'all 200ms',
    display: 'flex', alignItems: 'center', gap: 6,
  } as React.CSSProperties);

  return (
    <div style={{ padding: '32px 40px', maxWidth: 760, margin: '0 auto' }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontFamily: 'Fraunces, serif', fontSize: 32, fontWeight: 700, letterSpacing: '-0.02em', marginBottom: 4 }}>Friends</h1>
        <p style={{ fontSize: 14, color: 'var(--text-tertiary)' }}>Connect with peers, study together, and keep each other accountable.</p>
      </div>

      {/* Tab bar */}
      <div style={{ display: 'flex', gap: 4, padding: 4, background: 'var(--bg-subtle)', borderRadius: 999, marginBottom: 28, width: 'fit-content' }}>
        <button style={tabStyle('friends')} onClick={() => setTab('friends')}>
          <Icon name="users" size={15} /> Friends {friends.length > 0 && <span style={{ fontSize: 11, background: 'var(--bg-hover)', padding: '1px 6px', borderRadius: 999 }}>{friends.length}</span>}
        </button>
        <button style={tabStyle('requests')} onClick={() => setTab('requests')}>
          <Icon name="bell" size={15} /> Requests
          {pending.length > 0 && <span style={{ fontSize: 11, background: 'var(--gradient-brand)', color: '#fff', padding: '1px 6px', borderRadius: 999 }}>{pending.length}</span>}
        </button>
        <button style={tabStyle('find')} onClick={() => setTab('find')}>
          <Icon name="search" size={15} /> Find Friends
        </button>
      </div>

      {loading && tab !== 'find' ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {[1, 2, 3].map((i) => (
            <div key={i} style={{ height: 76, borderRadius: 14, background: 'var(--bg-hover)', animation: 'pulse 1.5s ease-in-out infinite' }} />
          ))}
        </div>
      ) : (
        <>
          {tab === 'friends' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {friends.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-tertiary)' }}>
                  <div style={{ fontSize: 40, marginBottom: 12 }}>👥</div>
                  <div style={{ fontFamily: 'Fraunces, serif', fontSize: 22, fontStyle: 'italic', marginBottom: 8 }}>No friends yet</div>
                  <div style={{ fontSize: 14 }}>Search for people to connect with!</div>
                  <button
                    onClick={() => setTab('find')}
                    style={{ marginTop: 16, height: 40, padding: '0 20px', borderRadius: 999, background: 'var(--gradient-brand)', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}
                  >
                    Find Friends
                  </button>
                </div>
              ) : (
                friends.map((f) => (
                  <FriendCard
                    key={f.id}
                    item={f}
                    onRemove={(id) => {
                      setFriends((prev) => prev.filter((x) => x.id !== id));
                      showToast('Friend removed');
                      router.refresh();
                    }}
                  />
                ))
              )}
            </div>
          )}

          {tab === 'requests' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div>
                <h3 style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-tertiary)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 10 }}>
                  Incoming ({pending.length})
                </h3>
                {pending.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-tertiary)', background: 'var(--bg-surface)', borderRadius: 14, border: '1px solid var(--border-subtle)' }}>
                    <div style={{ fontSize: 30, marginBottom: 8 }}>🕊️</div>
                    <div style={{ fontSize: 14 }}>No pending requests</div>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {pending.map((r) => (
                      <RequestCard
                        key={r.id}
                        item={r}
                        onAccept={(id) => {
                          setPending((prev) => prev.filter((x) => x.id !== id));
                          showToast('Friend request accepted!');
                          reload();
                          router.refresh();
                        }}
                        onDecline={(id) => {
                          setPending((prev) => prev.filter((x) => x.id !== id));
                          showToast('Request declined');
                          router.refresh();
                        }}
                      />
                    ))}
                  </div>
                )}
              </div>

              {sent.length > 0 && (
                <div>
                  <h3 style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-tertiary)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 10 }}>
                    Sent ({sent.length})
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {sent.map((r) => {
                      const name = r.receiver.full_name || r.receiver.handle || 'Unknown';
                      return (
                        <div key={r.id} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 18px', background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 14 }}>
                          <Avatar name={name} size={44} />
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--text-primary)' }}>{name}</div>
                            {r.receiver.handle && <div style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>@{r.receiver.handle}</div>}
                          </div>
                          <span style={{ fontSize: 12, color: 'var(--text-tertiary)', padding: '4px 10px', borderRadius: 999, background: 'var(--bg-hover)', border: '1px solid var(--border-subtle)' }}>Pending</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {tab === 'find' && (
            <div>
              <div style={{ position: 'relative', marginBottom: 20 }}>
                <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)', pointerEvents: 'none' }}>
                  <Icon name="search" size={16} />
                </span>
                <input
                  type="text"
                  placeholder="Search by name or @handle…"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  autoFocus
                  style={{
                    width: '100%', height: 48, paddingLeft: 42, paddingRight: 16,
                    borderRadius: 12, border: '1px solid var(--border-default)',
                    background: 'var(--bg-surface)', color: 'var(--text-primary)',
                    fontSize: 14, outline: 'none', boxSizing: 'border-box',
                    transition: 'border-color 200ms',
                  }}
                />
              </div>

              {searching && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {[1, 2, 3].map((i) => (
                    <div key={i} style={{ height: 76, borderRadius: 14, background: 'var(--bg-hover)', animation: 'pulse 1.5s ease-in-out infinite' }} />
                  ))}
                </div>
              )}

              {!searching && searchQuery && searchResults.length === 0 && (
                <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-tertiary)' }}>
                  <div style={{ fontSize: 30, marginBottom: 8 }}>🔍</div>
                  <div style={{ fontSize: 14 }}>No users found for &ldquo;{searchQuery}&rdquo;</div>
                </div>
              )}

              {!searching && searchResults.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {searchResults.map((p) => (
                    <SearchResultCard
                      key={p.id}
                      profile={p}
                      sentIds={sentIds}
                      onSend={(id) => {
                        setSentIds((prev) => new Set([...prev, id]));
                        showToast('Friend request sent!');
                      }}
                    />
                  ))}
                </div>
              )}

              {!searchQuery && (
                <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-tertiary)' }}>
                  <div style={{ fontSize: 40, marginBottom: 12 }}>🔎</div>
                  <div style={{ fontFamily: 'Fraunces, serif', fontSize: 20, fontStyle: 'italic', marginBottom: 6 }}>Find people to connect with</div>
                  <div style={{ fontSize: 14 }}>Search by name or username above</div>
                </div>
              )}
            </div>
          )}
        </>
      )}

      {toast && <Toast msg={toast.msg} type={toast.type} />}
      <style>{`
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
        @keyframes toastIn { from { opacity: 0; transform: translate(-50%, 10px); } to { opacity: 1; transform: translate(-50%, 0); } }
      `}</style>
    </div>
  );
}
