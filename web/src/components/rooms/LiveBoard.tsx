'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import '@excalidraw/excalidraw/index.css';
import { useRealtimeBroadcast } from '@/hooks/useRealtimeSubscription';

// Excalidraw is browser-only and ~2-3 MB — lazy-load it.
const Excalidraw = dynamic(
  async () => (await import('@excalidraw/excalidraw')).Excalidraw,
  { ssr: false, loading: () => <BoardSkeleton /> },
);

// ── Types we share (kept loose to avoid coupling to Excalidraw internals) ────
type Participant = { user_id: string; name: string };
type MarkerHolder = 'all' | string;

type ScenePayload = { senderId: string; elements: unknown[] };
type PointerPayload = { senderId: string; name: string; color: string; x: number; y: number; button?: 'down' | 'up' };
type MarkerPayload = { mode: MarkerHolder };
type ClearPayload = { senderId: string };
type SyncRequestPayload = { requestId: string; requesterId: string };
type SyncResponsePayload = { requestId: string; elements: unknown[] };

interface Props {
  roomId: string;
  currentUserId: string;
  currentUserName: string;
  participants: Participant[];
}

// Deterministic colour per user — same id always renders the same cursor colour.
const PALETTE = ['#4f46e5', '#10b981', '#f59e0b', '#ec4899', '#06b6d4', '#84cc16', '#f97316', '#a855f7'];
function colorFor(id: string) {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0;
  return PALETTE[h % PALETTE.length];
}

function BoardSkeleton() {
  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-base)', color: 'var(--text-tertiary)', fontSize: 13 }}>
      Loading board…
    </div>
  );
}

// Distribute participants evenly around 4 sides of the board.
function distributeRing(participants: Participant[]) {
  const n = participants.length;
  if (n === 0) return { top: [], right: [], bottom: [], left: [] };
  const topCount = Math.floor(n / 4);
  const rightCount = Math.ceil((n - topCount) / 3);
  const bottomCount = Math.ceil((n - topCount - rightCount) / 2);
  const leftCount = n - topCount - rightCount - bottomCount;
  return {
    top: participants.slice(0, topCount),
    right: participants.slice(topCount, topCount + rightCount),
    bottom: participants.slice(topCount + rightCount, topCount + rightCount + bottomCount),
    left: participants.slice(topCount + rightCount + bottomCount, topCount + rightCount + bottomCount + leftCount),
  };
}

function Avatar({ p, isHolder, hasPen, onClick }: { p: Participant; isHolder: boolean; hasPen: boolean; onClick: () => void }) {
  const color = colorFor(p.user_id);
  const initial = (p.name || '?').trim().charAt(0).toUpperCase();
  return (
    <button
      onClick={onClick}
      title={`Give marker to ${p.name}`}
      style={{
        position: 'relative', width: 52, height: 52, borderRadius: 999, padding: 0,
        background: color, color: '#fff',
        fontFamily: 'Fraunces, serif', fontSize: 22, fontWeight: 700,
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        border: isHolder ? '3px solid #fff' : '2px solid rgba(255,255,255,0.2)',
        boxShadow: isHolder
          ? `0 0 0 4px ${color}55, 0 0 24px ${color}aa`
          : '0 4px 14px rgba(0,0,0,0.18)',
        cursor: 'pointer', transition: 'all 200ms',
      }}
    >
      {initial}
      {hasPen && (
        <span style={{
          position: 'absolute', bottom: -4, right: -4,
          width: 22, height: 22, borderRadius: 999,
          background: 'var(--gradient-brand)', color: '#fff',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 12, border: '2px solid var(--bg-surface)',
        }} aria-label="Has marker">✏</span>
      )}
      <span style={{
        position: 'absolute', top: '100%', left: '50%', transform: 'translateX(-50%)',
        marginTop: 4, fontSize: 10, fontWeight: 600,
        color: 'var(--text-secondary)', whiteSpace: 'nowrap', maxWidth: 80,
        overflow: 'hidden', textOverflow: 'ellipsis',
      }}>{p.name}</span>
    </button>
  );
}

// useThrottle: invoke fn at most once per `ms`, with a trailing call so the last update isn't lost.
function useThrottle<TArgs extends unknown[]>(fn: (...args: TArgs) => void, ms: number) {
  const last = useRef(0);
  const pending = useRef<TArgs | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const fnRef = useRef(fn);
  fnRef.current = fn;

  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);

  return useCallback((...args: TArgs) => {
    const now = Date.now();
    const wait = last.current + ms - now;
    if (wait <= 0) {
      last.current = now;
      fnRef.current(...args);
    } else {
      pending.current = args;
      if (!timer.current) {
        timer.current = setTimeout(() => {
          timer.current = null;
          if (pending.current) {
            last.current = Date.now();
            fnRef.current(...pending.current);
            pending.current = null;
          }
        }, wait);
      }
    }
  }, [ms]);
}

// We need to keep an imperative handle to Excalidraw to push remote scene + collaborators.
// Avoid importing internal types from the package (paths change between versions).
type ExcalidrawApi = {
  updateScene: (data: Record<string, unknown>) => void;
  getSceneElements: () => readonly unknown[];
};

export default function LiveBoard({ roomId, currentUserId, currentUserName, participants }: Props) {
  const [marker, setMarker] = useState<MarkerHolder>('all');
  const [api, setApi] = useState<ExcalidrawApi | null>(null);
  // remote collaborators -> Excalidraw appState.collaborators (Map keyed by socket-like id)
  const collabsRef = useRef<Map<string, { pointer: { x: number; y: number }; button: 'down' | 'up'; username: string; color: { background: string; stroke: string }; id: string }>>(new Map());

  // Loop guard: when applying a remote scene (regular delta OR initial sync),
  // Excalidraw's onChange will fire — we must NOT rebroadcast it as if we drew.
  const applyingRemoteRef = useRef(false);
  // Initial-sync handshake state.
  const hasSyncedRef = useRef(false);
  const pendingRequestIdRef = useRef<string | null>(null);
  const recentlyAnsweredRef = useRef<Set<string>>(new Set());

  // Width tracking — fall back to a horizontal strip when narrow or when there are
  // too many participants to ring nicely.
  const [w, setW] = useState<number>(() => (typeof window !== 'undefined' ? window.innerWidth : 1024));
  useEffect(() => {
    const onResize = () => setW(window.innerWidth);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);
  const isCompact = w < 900 || participants.length > 16;

  const canDraw = marker === 'all' || marker === currentUserId;
  const drawerName = useMemo(() => {
    if (marker === 'all') return 'everyone';
    const p = participants.find(x => x.user_id === marker);
    return p?.name ?? 'someone';
  }, [marker, participants]);

  // ── Broadcast channels ──────────────────────────────────────────────────────
  const channel = `liveboard:${roomId}`;

  const sceneBroadcast = useRealtimeBroadcast<ScenePayload>({
    channelName: channel, event: 'scene',
    onMessage: (msg) => {
      if (!api || msg.senderId === currentUserId) return;
      applyingRemoteRef.current = true;
      api.updateScene({ elements: msg.elements });
      // Reset on the next tick so Excalidraw's onChange (which fires after
      // updateScene) doesn't echo this back as our own edit.
      setTimeout(() => { applyingRemoteRef.current = false; }, 0);
    },
  });

  const pointerBroadcast = useRealtimeBroadcast<PointerPayload>({
    channelName: channel, event: 'pointer',
    onMessage: (msg) => {
      if (!api || msg.senderId === currentUserId) return;
      collabsRef.current.set(msg.senderId, {
        id: msg.senderId,
        username: msg.name,
        pointer: { x: msg.x, y: msg.y },
        button: msg.button ?? 'up',
        color: { background: msg.color, stroke: msg.color },
      });
      api.updateScene({ collaborators: new Map(collabsRef.current) });
    },
  });

  const markerBroadcast = useRealtimeBroadcast<MarkerPayload>({
    channelName: channel, event: 'marker',
    onMessage: (msg) => setMarker(msg.mode),
  });

  const clearBroadcast = useRealtimeBroadcast<ClearPayload>({
    channelName: channel, event: 'clear',
    onMessage: () => { api?.updateScene({ elements: [] }); },
  });

  // ── Initial-sync handshake ────────────────────────────────────────────────
  // A user opening the board emits 'sync-request' (with a unique requestId).
  // Exactly one existing peer should answer with the current scene:
  //   • the marker holder if there is one
  //   • else, when the marker is 'all', the participant with the lowest
  //     user_id (deterministic tiebreak — we don't track join timestamps,
  //     so this is our stand-in for "longest in the room")
  // Small random delay (60-140 ms) debounces if multiple peers somehow
  // qualify; recentlyAnsweredRef de-dupes per requestId.
  const syncResponseBroadcast = useRealtimeBroadcast<SyncResponsePayload>({
    channelName: channel, event: 'sync-response',
    onMessage: (msg) => {
      if (!api) return;
      if (!pendingRequestIdRef.current || msg.requestId !== pendingRequestIdRef.current) return;
      pendingRequestIdRef.current = null;
      hasSyncedRef.current = true;
      applyingRemoteRef.current = true;
      api.updateScene({ elements: msg.elements });
      setTimeout(() => { applyingRemoteRef.current = false; }, 0);
    },
  });

  const syncRequestBroadcast = useRealtimeBroadcast<SyncRequestPayload>({
    channelName: channel, event: 'sync-request',
    onMessage: (msg) => {
      if (!api || msg.requesterId === currentUserId) return;
      if (recentlyAnsweredRef.current.has(msg.requestId)) return;

      const iAmMarkerHolder = marker === currentUserId;
      let iAmLeader = false;
      if (marker === 'all') {
        const ids = Array.from(new Set([...participants.map(p => p.user_id), currentUserId]));
        ids.sort();
        iAmLeader = ids[0] === currentUserId;
      }
      if (!iAmMarkerHolder && !iAmLeader) return;

      recentlyAnsweredRef.current.add(msg.requestId);
      // Free the entry after a while so the Set can't grow unbounded.
      setTimeout(() => recentlyAnsweredRef.current.delete(msg.requestId), 10_000);

      const delay = 60 + Math.floor(Math.random() * 80);
      setTimeout(() => {
        const elements = api.getSceneElements();
        syncResponseBroadcast.send({ requestId: msg.requestId, elements: [...elements] });
      }, delay);
    },
  });

  // Send the initial sync-request once the Excalidraw API is mounted.
  // Retry a few times because the broadcast channel may still be subscribing
  // when we first try to send.
  useEffect(() => {
    if (!api || hasSyncedRef.current) return;
    const id = `req_${Math.random().toString(36).slice(2, 10)}_${Date.now()}`;
    pendingRequestIdRef.current = id;
    let attempts = 0;
    let timer: ReturnType<typeof setTimeout>;
    const tick = () => {
      if (hasSyncedRef.current) return;
      if (attempts >= 4) { pendingRequestIdRef.current = null; return; }
      attempts++;
      syncRequestBroadcast.send({ requestId: id, requesterId: currentUserId });
      timer = setTimeout(tick, 800);
    };
    timer = setTimeout(tick, 200);
    return () => { clearTimeout(timer); };
  }, [api, syncRequestBroadcast, currentUserId]);

  // ── Local handlers ──────────────────────────────────────────────────────────
  const sendScene = useThrottle((elements: readonly unknown[]) => {
    sceneBroadcast.send({ senderId: currentUserId, elements: elements as unknown[] });
  }, 250);

  const sendPointer = useThrottle((x: number, y: number, button: 'down' | 'up') => {
    pointerBroadcast.send({
      senderId: currentUserId, name: currentUserName,
      color: colorFor(currentUserId), x, y, button,
    });
  }, 80);

  const handleChange = useCallback((elements: readonly unknown[]) => {
    if (applyingRemoteRef.current) return; // skip echo of a remote scene we just applied
    if (!canDraw) return; // viewers don't broadcast
    sendScene(elements);
  }, [canDraw, sendScene]);

  const handlePointer = useCallback((payload: { pointer: { x: number; y: number }; button: 'down' | 'up' }) => {
    sendPointer(payload.pointer.x, payload.pointer.y, payload.button);
  }, [sendPointer]);

  const giveMarker = (userId: MarkerHolder) => {
    setMarker(userId);
    markerBroadcast.send({ mode: userId });
  };

  const clearBoard = () => {
    api?.updateScene({ elements: [] });
    clearBroadcast.send({ senderId: currentUserId });
  };

  const resetAll = () => {
    giveMarker('all');
    clearBoard();
  };

  // Layout split
  const sides = useMemo(() => distributeRing(participants), [participants]);

  return (
    // Claim a tall vertical slot so the board doesn't collapse to a strip
    // when the parent (VideoRoom's flex column) hasn't been given a forced
    // height by the surrounding layout. 75vh / 640px floor matches the
    // BoardFrame's own minHeight so the two don't fight.
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 'min(75vh, 640px)', gap: 12, padding: 12 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ width: 10, height: 10, borderRadius: 999, background: 'var(--mint-500)', boxShadow: '0 0 0 4px rgba(16,185,129,0.18)' }} />
          <h2 style={{ fontFamily: 'Fraunces, serif', fontSize: 22, fontWeight: 600, margin: 0 }}>Live board</h2>
          <span style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>click a face to draw</span>
        </div>
      </div>

      {/* Ring + board */}
      {isCompact ? (
        <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
          <CompactStrip participants={participants} marker={marker} giveMarker={giveMarker} currentUserId={currentUserId} />
          <BoardFrame setApi={setApi} canDraw={canDraw} onChange={handleChange} onPointer={handlePointer} />
        </div>
      ) : participants.length >= 2 ? (
        // Ring around the board — only when there are at least 2 people to
        // distribute. Rows trimmed from 80→60 and cols from 80→60 so the
        // central 1fr cell can host a centered square board.
        <div style={{ flex: 1, minHeight: 0, display: 'grid', gridTemplateColumns: '60px minmax(0, 1fr) 60px', gridTemplateRows: '60px 1fr 60px', gap: 10 }}>
          <div /> {/* top-left corner */}
          <RingRow items={sides.top} marker={marker} giveMarker={giveMarker} currentUserId={currentUserId} />
          <div /> {/* top-right corner */}
          <RingCol items={sides.left} marker={marker} giveMarker={giveMarker} currentUserId={currentUserId} />
          {/* Flex wrapper centers the square within the 1fr cell. */}
          <div style={{ gridColumn: '2 / 3', gridRow: '2 / 3', display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 0 }}>
            <BoardFrame setApi={setApi} canDraw={canDraw} onChange={handleChange} onPointer={handlePointer} square />
          </div>
          <RingCol items={sides.right} marker={marker} giveMarker={giveMarker} currentUserId={currentUserId} />
          <div />
          <RingRow items={sides.bottom} marker={marker} giveMarker={giveMarker} currentUserId={currentUserId} />
          <div />
        </div>
      ) : (
        // ≤1 participant on desktop: skip the ring (one avatar stranded on
        // the edge looks lonely). Same centered square sizing as ring mode.
        <div style={{ flex: 1, minHeight: 0, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <BoardFrame setApi={setApi} canDraw={canDraw} onChange={handleChange} onPointer={handlePointer} square />
        </div>
      )}

      {/* Footer: drawing-now + controls */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
        <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
          Drawing now: <strong style={{ color: 'var(--text-primary)' }}>{participants.length === 0 ? 'no one yet' : drawerName}</strong>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={() => giveMarker('all')} style={{
            height: 32, padding: '0 14px', borderRadius: 999,
            background: marker === 'all' ? 'var(--gradient-brand)' : 'var(--bg-hover)',
            color: marker === 'all' ? '#fff' : 'var(--text-primary)',
            border: '1px solid var(--border-default)', fontSize: 12, fontWeight: 600, cursor: 'pointer',
          }}>All draw</button>
          <button onClick={clearBoard} style={{
            height: 32, padding: '0 14px', borderRadius: 999,
            background: 'var(--bg-hover)', color: 'var(--text-primary)',
            border: '1px solid var(--border-default)', fontSize: 12, fontWeight: 600, cursor: 'pointer',
          }}>Clear board</button>
          <button onClick={resetAll} style={{
            height: 32, padding: '0 14px', borderRadius: 999,
            background: 'var(--bg-hover)', color: 'var(--text-primary)',
            border: '1px solid var(--border-default)', fontSize: 12, fontWeight: 600, cursor: 'pointer',
          }}>Reset</button>
        </div>
      </div>
    </div>
  );
}

function RingRow({ items, marker, giveMarker, currentUserId }: { items: Participant[]; marker: MarkerHolder; giveMarker: (id: MarkerHolder) => void; currentUserId: string }) {
  return (
    <div style={{ gridColumn: '2 / 3', display: 'flex', alignItems: 'center', justifyContent: 'space-around', gap: 10, paddingBottom: 14 }}>
      {items.map(p => (
        <Avatar key={p.user_id} p={p}
          isHolder={marker === p.user_id || (marker === 'all' && p.user_id === currentUserId)}
          hasPen={marker === p.user_id}
          onClick={() => giveMarker(p.user_id)} />
      ))}
    </div>
  );
}

function RingCol({ items, marker, giveMarker, currentUserId }: { items: Participant[]; marker: MarkerHolder; giveMarker: (id: MarkerHolder) => void; currentUserId: string }) {
  return (
    <div style={{ gridRow: '2 / 3', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'space-around', gap: 10, paddingRight: 14 }}>
      {items.map(p => (
        <Avatar key={p.user_id} p={p}
          isHolder={marker === p.user_id || (marker === 'all' && p.user_id === currentUserId)}
          hasPen={marker === p.user_id}
          onClick={() => giveMarker(p.user_id)} />
      ))}
    </div>
  );
}

function CompactStrip({ participants, marker, giveMarker, currentUserId }: { participants: Participant[]; marker: MarkerHolder; giveMarker: (id: MarkerHolder) => void; currentUserId: string }) {
  return (
    <div style={{ overflowX: 'auto', whiteSpace: 'nowrap', paddingBottom: 20 }}>
      <div style={{ display: 'inline-flex', alignItems: 'center', gap: 14, padding: '0 8px' }}>
        {participants.map(p => (
          <Avatar key={p.user_id} p={p}
            isHolder={marker === p.user_id || (marker === 'all' && p.user_id === currentUserId)}
            hasPen={marker === p.user_id}
            onClick={() => giveMarker(p.user_id)} />
        ))}
      </div>
    </div>
  );
}

function BoardFrame({ setApi, canDraw, onChange, onPointer, square = false }: {
  setApi: (api: ExcalidrawApi | null) => void;
  canDraw: boolean;
  onChange: (elements: readonly unknown[]) => void;
  onPointer: (payload: { pointer: { x: number; y: number }; button: 'down' | 'up' }) => void;
  /** Square mode: a centered ~600-700 px canvas with breathing room on both
   *  sides. Used by ring and solo layouts on desktop. The compact strip
   *  layout passes `square=false` so the board stays full-bleed on phones. */
  square?: boolean;
}) {
  // Common chrome.
  const baseStyle: React.CSSProperties = {
    borderRadius: 18, overflow: 'hidden',
    border: '1px solid var(--border-default)',
    background: 'var(--bg-surface)',
    boxShadow: 'var(--shadow-md)',
    position: 'relative',
  };

  // Two sizing modes:
  //   • square: aspectRatio:1/1, capped at min(700px, 75vh) so it doesn't
  //     stretch across wide monitors and stays sized to the smaller axis on
  //     tall narrow ones. Centered horizontally within its parent.
  //   • full: width:100%, height:100% + a min-height floor — for the compact
  //     phone/many-people layout where the board owns the whole column.
  const sizingStyle: React.CSSProperties = square
    ? { width: '100%', maxWidth: 'min(700px, 75vh)', aspectRatio: '1 / 1', marginInline: 'auto' }
    : { width: '100%', height: '100%', minHeight: 'min(60vh, 480px)' };

  return (
    <div style={{ ...baseStyle, ...sizingStyle }}>
      <Excalidraw
        excalidrawAPI={(api) => setApi(api as unknown as ExcalidrawApi)}
        viewModeEnabled={!canDraw}
        onChange={onChange as never}
        onPointerUpdate={onPointer as never}
        UIOptions={{
          canvasActions: {
            loadScene: false,
            saveToActiveFile: false,
            export: false,
            saveAsImage: false,
          },
        }}
      />
    </div>
  );
}
