'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  LiveKitRoom,
  useLocalParticipant,
  useParticipants,
  useTracks,
  VideoTrack,
  AudioTrack,
  TrackRefContext,
} from '@livekit/components-react';
import {
  LocalParticipant,
  RemoteParticipant,
  Track,
  type LocalAudioTrack,
  type RoomOptions,
  type VideoCodec,
} from 'livekit-client';
// NOTE: We intentionally do NOT import '@livekit/components-styles'
// because it force-mirrors local video. All styling is custom below.
import VideoParticipant from './VideoParticipant';
import { listRoomMessages, sendRoomMessage } from '@/app/actions/rooms';
import { loadRoomNote, saveRoomNote } from '@/app/actions/roomNotes';
import { useRealtimeTable } from '@/hooks/useRealtimeSubscription';

interface VideoRoomProps {
  roomName: string;
  userName: string;
  token: string;
  onLeave: () => void;
  roomId?: string;
  userId?: string;
  peerCount?: number;
  isPublic?: boolean;
}

// ── Theme ───────────────────────────────────────────────────────────────────
const BG = '#1a1a2e';
const BAR_BG = 'rgba(32,33,36,0.94)';
const PANEL_BG = '#202234';

// ── SVG Icons ───────────────────────────────────────────────────────────────
const Svg = ({ children, size = 22 }: { children: React.ReactNode; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">{children}</svg>
);
const Icons = {
  mic:      <Svg><path d="M12 2a3 3 0 0 0-3 3v6a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z"/><path d="M19 10v1a7 7 0 0 1-14 0v-1"/><path d="M12 18v4M8 22h8"/></Svg>,
  micOff:   <Svg><path d="M3 3l18 18"/><path d="M9 9v2a3 3 0 0 0 5.12 2.12M15 11V5a3 3 0 0 0-5.94-.6"/><path d="M19 10v1a7 7 0 0 1-.7 3.05M12 18v4M8 22h8M5 11v0a7 7 0 0 0 4.5 6.53"/></Svg>,
  cam:      <Svg><path d="M23 7l-7 5 7 5V7z"/><rect x="1" y="5" width="15" height="14" rx="2"/></Svg>,
  camOff:   <Svg><path d="M3 3l18 18"/><path d="M16 16H4a2 2 0 0 1-2-2V7a2 2 0 0 1 .59-1.41M10 5h4a2 2 0 0 1 2 2v3l4-3v8"/></Svg>,
  screen:   <Svg><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/></Svg>,
  noise:    <Svg><path d="M12 2a3 3 0 0 0-3 3v6a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z"/><path d="M19 10v1a7 7 0 0 1-14 0v-1"/><path d="M12 18v4"/><path d="M2 8c1 1 1 7 0 8M22 8c-1 1-1 7 0 8"/></Svg>,
  notes:    <Svg><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6M8 13h8M8 17h6"/></Svg>,
  chat:     <Svg><path d="M21 11.5a8.38 8.38 0 0 1-9 8.5 8.5 8.5 0 0 1-3.8-.9L3 21l1.9-5.2A8.5 8.5 0 1 1 21 11.5z"/></Svg>,
  people:   <Svg><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></Svg>,
  hangup:   <Svg><path d="M22 16.92a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 1h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z"/></Svg>,
  close:    <Svg size={18}><path d="M18 6L6 18M6 6l12 12"/></Svg>,
  send:     <Svg size={18}><path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/></Svg>,
  link:     <Svg><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></Svg>,
  check:    <Svg size={16}><path d="M20 6L9 17l-5-5"/></Svg>,
};

// ── LiveKit room options ────────────────────────────────────────────────────
function buildRoomOptions(opts: {
  videoDeviceId?: string;
  audioDeviceId?: string;
  noiseSuppression: boolean;
}): RoomOptions {
  return {
    // adaptiveStream OFF — we want full 1080p always, not downscaled based on tile size
    adaptiveStream: false,
    dynacast: true,
    audioCaptureDefaults: {
      echoCancellation: true,
      noiseSuppression: opts.noiseSuppression,
      autoGainControl: true,
      sampleRate: 48000,
      channelCount: 1,
      ...(opts.audioDeviceId ? { deviceId: opts.audioDeviceId } : {}),
    },
    videoCaptureDefaults: {
      resolution: { width: 1920, height: 1080, frameRate: 30, aspectRatio: 16 / 9 },
      ...(opts.videoDeviceId ? { deviceId: opts.videoDeviceId } : {}),
    },
    publishDefaults: {
      videoCodec: 'vp8' as VideoCodec,
      videoEncoding: { maxBitrate: 3_000_000, maxFramerate: 30 },
      simulcast: true,
    },
  };
}


// ════════════════════════════════════════════════════════════════════════════
// PRE-JOIN SCREEN
// ════════════════════════════════════════════════════════════════════════════
function PreJoin({ roomName, userName, peerCount, onJoin, onCancel }: {
  roomName: string; userName: string; peerCount?: number;
  onJoin: (s: { camOn: boolean; micOn: boolean; videoDeviceId?: string; audioDeviceId?: string }) => void;
  onCancel: () => void;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const rafRef = useRef<number | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);

  const [camOn, setCamOn] = useState(true);
  const [micOn, setMicOn] = useState(true);
  const [cams, setCams] = useState<MediaDeviceInfo[]>([]);
  const [mics, setMics] = useState<MediaDeviceInfo[]>([]);
  const [videoDeviceId, setVideoDeviceId] = useState('');
  const [audioDeviceId, setAudioDeviceId] = useState('');
  const [level, setLevel] = useState(0);
  const [permError, setPermError] = useState<string | null>(null);

  const stopStream = useCallback(() => {
    streamRef.current?.getTracks().forEach(t => t.stop());
    streamRef.current = null;
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    audioCtxRef.current?.close().catch(() => {});
    audioCtxRef.current = null;
  }, []);

  useEffect(() => {
    let cancelled = false;
    stopStream();
    if (!camOn && !micOn) { setLevel(0); return; }
    navigator.mediaDevices
      .getUserMedia({
        video: camOn ? (videoDeviceId ? { deviceId: { exact: videoDeviceId } } : true) : false,
        audio: micOn ? (audioDeviceId ? { deviceId: { exact: audioDeviceId } } : true) : false,
      })
      .then(stream => {
        if (cancelled) { stream.getTracks().forEach(t => t.stop()); return; }
        streamRef.current = stream;
        setPermError(null);
        if (videoRef.current) videoRef.current.srcObject = stream;
        navigator.mediaDevices.enumerateDevices().then(list => {
          if (cancelled) return;
          setCams(list.filter(d => d.kind === 'videoinput'));
          setMics(list.filter(d => d.kind === 'audioinput'));
        });
        if (micOn && stream.getAudioTracks().length) {
          const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
          const ctx = new Ctx();
          audioCtxRef.current = ctx;
          const src = ctx.createMediaStreamSource(stream);
          const analyser = ctx.createAnalyser();
          analyser.fftSize = 256;
          src.connect(analyser);
          const data = new Uint8Array(analyser.frequencyBinCount);
          const tick = () => {
            analyser.getByteFrequencyData(data);
            const avg = data.reduce((a, b) => a + b, 0) / data.length;
            setLevel(Math.min(100, (avg / 140) * 100));
            rafRef.current = requestAnimationFrame(tick);
          };
          tick();
        }
      })
      .catch(() => { if (!cancelled) setPermError('Camera / microphone unavailable. You can still join.'); });
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [camOn, micOn, videoDeviceId, audioDeviceId]);

  useEffect(() => () => stopStream(), [stopStream]);

  const join = () => { stopStream(); onJoin({ camOn, micOn, videoDeviceId: videoDeviceId || undefined, audioDeviceId: audioDeviceId || undefined }); };

  const selectStyle: React.CSSProperties = {
    height: 38, borderRadius: 10, padding: '0 10px', maxWidth: 220,
    background: 'rgba(255,255,255,0.06)', color: '#fff',
    border: '1px solid rgba(255,255,255,0.12)', fontSize: 13, outline: 'none',
  };

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 1000, background: BG, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 36, alignItems: 'center', justifyContent: 'center', maxWidth: 1000, width: '100%' }}>
        {/* Camera preview — NOT mirrored */}
        <div style={{ flex: '1 1 460px', maxWidth: 560 }}>
          <div style={{ position: 'relative', width: '100%', aspectRatio: '16 / 9', borderRadius: 16, overflow: 'hidden', background: 'linear-gradient(135deg,#1f2440,#12162e)', boxShadow: '0 16px 50px rgba(0,0,0,0.5)' }}>
            {camOn ? (
              <video ref={videoRef} autoPlay muted playsInline style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 12, color: '#9aa0b4' }}>
                <div style={{ width: 84, height: 84, borderRadius: 999, background: 'var(--gradient-brand,linear-gradient(135deg,#1B2B8E,#3D52CC))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 34, fontWeight: 700, color: '#fff', fontFamily: 'Fraunces, serif' }}>
                  {(userName || '?').charAt(0).toUpperCase()}
                </div>
                <span style={{ fontSize: 13 }}>Camera is off</span>
              </div>
            )}

            {/* Mic level */}
            {micOn && (
              <div style={{ position: 'absolute', bottom: 14, left: 14, display: 'flex', alignItems: 'center', gap: 8, padding: '6px 10px', borderRadius: 999, background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(6px)' }}>
                <span style={{ color: '#fff', display: 'flex' }}>{Icons.mic}</span>
                <div style={{ width: 70, height: 5, borderRadius: 999, background: 'rgba(255,255,255,0.2)', overflow: 'hidden' }}>
                  <div style={{ width: `${level}%`, height: '100%', background: '#34d399', transition: 'width 90ms linear' }} />
                </div>
              </div>
            )}

            {/* Preview toggles */}
            <div style={{ position: 'absolute', bottom: 14, left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: 12 }}>
              <CircleToggle on={micOn} onIcon={Icons.mic} offIcon={Icons.micOff} onClick={() => setMicOn(v => !v)} label="Microphone" />
              <CircleToggle on={camOn} onIcon={Icons.cam} offIcon={Icons.camOff} onClick={() => setCamOn(v => !v)} label="Camera" />
            </div>
          </div>

          {permError && <div style={{ marginTop: 12, color: '#fbbf24', fontSize: 12 }}>{permError}</div>}

          {/* Device selectors */}
          <div style={{ display: 'flex', gap: 12, marginTop: 16, flexWrap: 'wrap' }}>
            {cams.length > 1 && (
              <select style={selectStyle} value={videoDeviceId} onChange={e => setVideoDeviceId(e.target.value)}>
                <option value="">Default camera</option>
                {cams.map(d => <option key={d.deviceId} value={d.deviceId}>{d.label || 'Camera'}</option>)}
              </select>
            )}
            {mics.length > 1 && (
              <select style={selectStyle} value={audioDeviceId} onChange={e => setAudioDeviceId(e.target.value)}>
                <option value="">Default microphone</option>
                {mics.map(d => <option key={d.deviceId} value={d.deviceId}>{d.label || 'Microphone'}</option>)}
              </select>
            )}
          </div>

          {/* Quality info badges */}
          <div style={{ display: 'flex', gap: 8, marginTop: 14, flexWrap: 'wrap' }}>
            <QualityBadge label="Video" value="1080p HD" />
            <QualityBadge label="Audio" value="48 kHz" />
            <QualityBadge label="Noise cancel" value="On" color="#34d399" />
          </div>
        </div>

        {/* Join card */}
        <div style={{ flex: '0 1 320px', textAlign: 'center' }}>
          <h2 style={{ fontFamily: 'Fraunces, serif', fontSize: 30, fontWeight: 600, color: '#fff', marginBottom: 8, lineHeight: 1.15 }}>Ready to join?</h2>
          <p style={{ fontSize: 14, color: '#b6bbcd', marginBottom: 4 }}>{roomName}</p>
          {typeof peerCount === 'number' && (
            <p style={{ fontSize: 13, color: '#8b91a8', marginBottom: 24 }}>
              {peerCount === 0 ? 'No one else here yet' : `${peerCount} ${peerCount === 1 ? 'person' : 'people'} in this room`}
            </p>
          )}
          <button onClick={join} style={{ width: '100%', maxWidth: 240, height: 50, borderRadius: 999, background: 'var(--gradient-brand,linear-gradient(135deg,#1B2B8E,#3D52CC))', color: '#fff', fontSize: 16, fontWeight: 600, border: 'none', cursor: 'pointer', boxShadow: '0 8px 24px rgba(34,54,176,0.45)' }}>
            Join now
          </button>
          <button onClick={() => { stopStream(); onCancel(); }} style={{ display: 'block', margin: '14px auto 0', background: 'transparent', border: 'none', color: '#8b91a8', fontSize: 13, cursor: 'pointer' }}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

function QualityBadge({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 6, padding: '5px 10px', borderRadius: 8,
      background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)', fontSize: 11,
    }}>
      <span style={{ color: '#8b91a8' }}>{label}:</span>
      <span style={{ color: color || '#e8ecff', fontWeight: 600, fontFamily: 'JetBrains Mono, monospace' }}>{value}</span>
    </div>
  );
}

function CircleToggle({ on, onIcon, offIcon, onClick, label }: { on: boolean; onIcon: React.ReactNode; offIcon: React.ReactNode; onClick: () => void; label: string }) {
  return (
    <button title={label} onClick={onClick} style={{
      width: 48, height: 48, borderRadius: 999, cursor: 'pointer',
      background: on ? 'rgba(255,255,255,0.16)' : '#ef4444',
      border: on ? '1px solid rgba(255,255,255,0.22)' : 'none',
      color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
      backdropFilter: 'blur(6px)', transition: 'all 160ms',
    }}>
      {on ? onIcon : offIcon}
    </button>
  );
}


// ════════════════════════════════════════════════════════════════════════════
// CONTROL BUTTON (floating bar)
// ════════════════════════════════════════════════════════════════════════════
function ControlButton({ icon, label, onClick, danger, off, active, badge }: {
  icon: React.ReactNode; label: string; onClick: () => void;
  danger?: boolean; off?: boolean; active?: boolean; badge?: number;
}) {
  const [hover, setHover] = useState(false);
  const bg = danger ? '#ef4444' : off ? '#ef4444' : active ? 'rgba(61,82,204,0.9)' : 'rgba(255,255,255,0.1)';
  const border = danger || off ? 'none' : active ? '1px solid rgba(61,82,204,0.6)' : '1px solid rgba(255,255,255,0.14)';
  return (
    <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
      {hover && (
        <div style={{ position: 'absolute', bottom: 'calc(100% + 8px)', whiteSpace: 'nowrap', padding: '5px 9px', borderRadius: 7, background: 'rgba(0,0,0,0.85)', color: '#fff', fontSize: 12, pointerEvents: 'none', zIndex: 30 }}>
          {label}
        </div>
      )}
      <button onClick={onClick} onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)} aria-label={label}
        style={{
          position: 'relative', minWidth: 48, width: 48, height: 48, borderRadius: 999,
          background: bg, border, color: '#fff', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 160ms',
        }}
      >
        {icon}
        {!!badge && badge > 0 && (
          <span style={{ position: 'absolute', top: -2, right: -2, minWidth: 18, height: 18, padding: '0 4px', borderRadius: 999, background: '#ef4444', color: '#fff', fontSize: 10, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', border: `2px solid ${BG}` }}>
            {badge > 9 ? '9+' : badge}
          </span>
        )}
      </button>
    </div>
  );
}


// ════════════════════════════════════════════════════════════════════════════
// INVITE / SHARE ROOM LINK
// ════════════════════════════════════════════════════════════════════════════
function InviteButton() {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback
      const ta = document.createElement('textarea');
      ta.value = window.location.href;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };
  return (
    <button onClick={copy} style={{
      height: 40, padding: '0 16px', borderRadius: 999, display: 'flex', alignItems: 'center', gap: 7,
      background: copied ? 'rgba(52,211,153,0.15)' : 'rgba(255,255,255,0.08)',
      border: copied ? '1px solid rgba(52,211,153,0.4)' : '1px solid rgba(255,255,255,0.12)',
      color: copied ? '#34d399' : '#e8ecff',
      fontSize: 13, fontWeight: 600, cursor: 'pointer', transition: 'all 200ms', whiteSpace: 'nowrap',
    }}>
      {copied ? Icons.check : Icons.link}
      {copied ? 'Link copied!' : 'Invite'}
    </button>
  );
}


// ════════════════════════════════════════════════════════════════════════════
// SIDE PANELS
// ════════════════════════════════════════════════════════════════════════════
function PanelShell({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div data-video-panel style={{
      width: 320, flexShrink: 0, height: '100%', background: PANEL_BG,
      borderLeft: '1px solid rgba(255,255,255,0.08)', display: 'flex', flexDirection: 'column',
      animation: 'lkPanelIn 300ms ease',
    }}>
      <div style={{ height: 56, padding: '0 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
        <span style={{ fontFamily: 'Fraunces, serif', fontSize: 16, fontWeight: 600, color: '#fff' }}>{title}</span>
        <button onClick={onClose} aria-label="Close panel" style={{ width: 30, height: 30, borderRadius: 8, background: 'transparent', border: 'none', color: '#b6bbcd', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{Icons.close}</button>
      </div>
      {children}
    </div>
  );
}

function NotesPanel({ roomKey, onClose }: { roomKey: string; onClose: () => void }) {
  const lsKey = `elm_notes_${roomKey}`;
  const [content, setContent] = useState('');
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const [localOnly, setLocalOnly] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const contentRef = useRef('');
  contentRef.current = content;

  useEffect(() => {
    let active = true;
    (async () => {
      const res = await loadRoomNote(roomKey);
      if (!active) return;
      if (res.ok) {
        const ls = typeof window !== 'undefined' ? localStorage.getItem(lsKey) : null;
        setContent(res.content || ls || '');
        setSavedAt(res.updatedAt);
      } else {
        setLocalOnly(true);
        setContent(typeof window !== 'undefined' ? localStorage.getItem(lsKey) ?? '' : '');
      }
      setLoaded(true);
    })();
    return () => { active = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomKey]);

  const persist = useCallback(async (text: string) => {
    try { localStorage.setItem(lsKey, text); } catch {}
    const res = await saveRoomNote(roomKey, text);
    if (res.ok) { setLocalOnly(false); setSavedAt(res.updatedAt); }
    else { setLocalOnly(true); setSavedAt(new Date().toISOString()); }
  }, [roomKey, lsKey]);

  const onChange = (text: string) => {
    setContent(text);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => persist(text), 3000);
  };

  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
    const text = contentRef.current;
    try { localStorage.setItem(lsKey, text); } catch {}
    saveRoomNote(roomKey, text).catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const savedLabel = savedAt ? `Last saved: ${new Date(savedAt).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}` : 'Not saved yet';

  return (
    <PanelShell title="Meeting Notes" onClose={onClose}>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: 14, minHeight: 0 }}>
        <textarea value={content} onChange={e => onChange(e.target.value)}
          placeholder={loaded ? 'Type your meeting notes… (auto-saves)' : 'Loading…'} disabled={!loaded}
          style={{ flex: 1, width: '100%', resize: 'none', borderRadius: 10, padding: 12, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#e8ecff', fontSize: 14, lineHeight: 1.6, outline: 'none', fontFamily: 'inherit' }}
        />
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 10, fontSize: 11, color: '#8b91a8' }}>
          <span>{localOnly ? 'Notes saved locally' : savedLabel}</span>
          <span>{content.length} chars</span>
        </div>
      </div>
    </PanelShell>
  );
}

type ChatMsg = { id: string; room_id: string; user_id: string; content: string; created_at: string; author?: { full_name: string | null } | null };

function ChatPanel({ roomId, userId, onClose, onSeen }: { roomId: string; userId?: string; onClose: () => void; onSeen: () => void }) {
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => { onSeen(); }, [onSeen, messages.length]);
  useEffect(() => { listRoomMessages(roomId).then(d => setMessages(d as ChatMsg[])); }, [roomId]);

  useRealtimeTable<ChatMsg>({
    channelName: `video-chat:${roomId}`, table: 'room_messages', event: 'INSERT',
    filter: `room_id=eq.${roomId}`,
    onChange: payload => {
      const m = payload.new as ChatMsg | undefined;
      if (!m) return;
      setMessages(prev => (prev.some(p => p.id === m.id) ? prev : [...prev, m]));
    },
  });

  useEffect(() => { scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' }); }, [messages]);

  const send = async () => {
    if (!input.trim() || sending) return;
    setSending(true);
    try { await sendRoomMessage(roomId, input.trim()); setInput(''); } catch {} finally { setSending(false); }
  };

  return (
    <PanelShell title="In-call messages" onClose={onClose}>
      <div ref={scrollRef} style={{ flex: 1, overflowY: 'auto', padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 12 }}>
        {messages.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '50px 16px', color: '#8b91a8', fontSize: 13 }}>No messages yet</div>
        ) : messages.map(m => {
          const mine = m.user_id === userId;
          const name = mine ? 'You' : (m.author?.full_name || 'Guest');
          return (
            <div key={m.id} style={{ display: 'flex', flexDirection: 'column', alignItems: mine ? 'flex-end' : 'flex-start' }}>
              <div style={{ fontSize: 11, color: '#8b91a8', marginBottom: 3 }}>
                {name} · {new Date(m.created_at).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}
              </div>
              <div style={{
                maxWidth: '85%', padding: '8px 12px', fontSize: 13, lineHeight: 1.5, wordBreak: 'break-word',
                borderRadius: mine ? '12px 12px 4px 12px' : '12px 12px 12px 4px',
                background: mine ? 'var(--brand-500,#2236B0)' : 'rgba(255,255,255,0.08)', color: '#fff',
              }}>{m.content}</div>
            </div>
          );
        })}
      </div>
      <div style={{ padding: 12, borderTop: '1px solid rgba(255,255,255,0.08)', display: 'flex', gap: 8 }}>
        <input value={input} onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } }}
          placeholder="Send a message"
          style={{ flex: 1, height: 40, padding: '0 12px', borderRadius: 10, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', color: '#fff', fontSize: 13, outline: 'none' }}
        />
        <button onClick={send} disabled={!input.trim() || sending} aria-label="Send"
          style={{ width: 40, height: 40, borderRadius: 10, background: input.trim() ? 'var(--brand-500,#2236B0)' : 'rgba(255,255,255,0.08)', color: '#fff', border: 'none', cursor: input.trim() ? 'pointer' : 'default', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {Icons.send}
        </button>
      </div>
    </PanelShell>
  );
}

function ParticipantsPanel({ participants, localId, onClose }: { participants: (LocalParticipant | RemoteParticipant)[]; localId: string; onClose: () => void }) {
  return (
    <PanelShell title={`Participants (${participants.length})`} onClose={onClose}>
      <div style={{ flex: 1, overflowY: 'auto', padding: '8px 8px' }}>
        {participants.map(p => {
          const name = (p.name || p.identity.split('__')[0] || 'Guest') + (p.identity === localId ? ' (You)' : '');
          const micMuted = !!p.getTrackPublication(Track.Source.Microphone)?.isMuted;
          const camOff = !p.isCameraEnabled;
          return (
            <div key={p.identity} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 10px', borderRadius: 10 }}>
              <div style={{ width: 36, height: 36, borderRadius: 999, background: 'var(--gradient-brand,linear-gradient(135deg,#1B2B8E,#3D52CC))', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontFamily: 'Fraunces, serif', flexShrink: 0 }}>
                {name.charAt(0).toUpperCase()}
              </div>
              <span style={{ flex: 1, color: '#e8ecff', fontSize: 14, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{name}</span>
              <span style={{ color: micMuted ? '#f87171' : '#8b91a8', display: 'flex' }}><span style={{ width: 18, height: 18, display: 'flex' }}>{micMuted ? Icons.micOff : Icons.mic}</span></span>
              <span style={{ color: camOff ? '#f87171' : '#8b91a8', display: 'flex' }}><span style={{ width: 18, height: 18, display: 'flex' }}>{camOff ? Icons.camOff : Icons.cam}</span></span>
            </div>
          );
        })}
      </div>
    </PanelShell>
  );
}


// ════════════════════════════════════════════════════════════════════════════
// IN-CALL UI  —  Google Meet adaptive layout
// ════════════════════════════════════════════════════════════════════════════
type PanelKind = 'notes' | 'chat' | 'people' | null;

function VideoRoomInner({ roomName, roomId, userId, onLeave, initialMic, initialCam, chatEnabled }: {
  roomName: string; roomId?: string; userId?: string; onLeave: () => void;
  initialMic: boolean; initialCam: boolean; chatEnabled: boolean;
}) {
  const { localParticipant } = useLocalParticipant();
  const participants = useParticipants();
  const screenTracks = useTracks([Track.Source.ScreenShare]);

  const [micEnabled, setMicEnabled] = useState(initialMic);
  const [cameraEnabled, setCameraEnabled] = useState(initialCam);
  const [screenShareEnabled, setScreenShareEnabled] = useState(false);
  const [noiseCancel, setNoiseCancel] = useState(true);
  const [panel, setPanel] = useState<PanelKind>(null);
  const [unread, setUnread] = useState(0);
  const lastSeenCount = useRef(0);

  const toggleMic = useCallback(async () => {
    const next = !micEnabled;
    await localParticipant.setMicrophoneEnabled(next);
    setMicEnabled(next);
  }, [localParticipant, micEnabled]);

  const toggleCamera = useCallback(async () => {
    const next = !cameraEnabled;
    await localParticipant.setCameraEnabled(next);
    setCameraEnabled(next);
  }, [localParticipant, cameraEnabled]);

  const toggleScreenShare = useCallback(async () => {
    const next = !screenShareEnabled;
    try { await localParticipant.setScreenShareEnabled(next); setScreenShareEnabled(next); } catch {}
  }, [localParticipant, screenShareEnabled]);

  const toggleNoiseCancel = useCallback(async () => {
    const next = !noiseCancel;
    setNoiseCancel(next);
    const audioTrack = localParticipant.getTrackPublication(Track.Source.Microphone)?.audioTrack as LocalAudioTrack | undefined;
    if (audioTrack && 'restartTrack' in audioTrack) {
      try { await audioTrack.restartTrack({ noiseSuppression: next, echoCancellation: true, autoGainControl: true }); } catch {}
    }
  }, [localParticipant, noiseCancel]);

  const allParticipants: (LocalParticipant | RemoteParticipant)[] = useMemo(() => [
    localParticipant,
    ...participants.filter(p => p.identity !== localParticipant.identity),
  ], [localParticipant, participants]);

  const count = allParticipants.length;
  const sharing = screenTracks.length > 0;

  // Google Meet adaptive grid: 1→centered, 2→side-by-side, 3-4→2×2, 5+→3-col
  const cols = count <= 1 ? 1 : count <= 4 ? 2 : 3;

  const openPanel = (kind: Exclude<PanelKind, null>) => {
    setPanel(prev => (prev === kind ? null : kind));
    if (kind === 'chat') setUnread(0);
  };

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 1000, background: BG, display: 'flex', flexDirection: 'column' }}>
      <style>{`
        @keyframes lkPanelIn { from { transform: translateX(24px); opacity: 0 } to { transform: translateX(0); opacity: 1 } }
        video { transform: none !important; -webkit-transform: none !important; }
      `}</style>

      {/* ── Room info bar (top) ────────────────────────────────── */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12,
        padding: '8px 16px', borderBottom: '1px solid rgba(255,255,255,0.06)', flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ color: '#e8ecff', fontSize: 14, fontWeight: 600, fontFamily: 'Fraunces, serif' }}>{roomName}</span>
          <span style={{ color: '#8b91a8', fontSize: 12 }}>·</span>
          <span style={{ color: '#8b91a8', fontSize: 12, fontFamily: 'JetBrains Mono, monospace' }}>{count} {count === 1 ? 'person' : 'people'}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {/* Quality indicators */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '4px 10px', borderRadius: 8, background: 'rgba(255,255,255,0.05)', fontSize: 11, color: '#8b91a8' }}>
            <span style={{ color: noiseCancel ? '#34d399' : '#f87171', fontSize: 10 }}>●</span>
            NC {noiseCancel ? 'On' : 'Off'}
          </div>
          <div style={{ padding: '4px 10px', borderRadius: 8, background: 'rgba(255,255,255,0.05)', fontSize: 11, color: '#8b91a8', fontFamily: 'JetBrains Mono, monospace' }}>
            1080p
          </div>
          <InviteButton />
        </div>
      </div>

      {/* ── Stage + panel ──────────────────────────────────────── */}
      <div style={{ flex: 1, display: 'flex', minHeight: 0 }}>
        <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', padding: 16, gap: 12, overflow: 'hidden' }}>
          {sharing ? (
            <div style={{ flex: 1, display: 'flex', gap: 12, minHeight: 0 }}>
              {/* Screen share — 75% */}
              <div style={{ flex: '0 0 75%', borderRadius: 14, overflow: 'hidden', background: '#000', minWidth: 0 }}>
                <TrackRefContext.Provider value={screenTracks[0]}>
                  <VideoTrack style={{ width: '100%', height: '100%', objectFit: 'contain', transform: 'none' }} />
                </TrackRefContext.Provider>
              </div>
              {/* Filmstrip — 25% */}
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 10, overflowY: 'auto', minWidth: 0 }}>
                {allParticipants.map(p => (
                  <VideoParticipant key={p.identity} participant={p} isLocal={p.identity === localParticipant.identity} compact />
                ))}
              </div>
            </div>
          ) : (
            /* Google Meet adaptive grid */
            <div data-video-grid style={{
              flex: 1, display: 'grid', gap: 12, minHeight: 0, overflowY: 'auto',
              gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
              alignContent: 'center', justifyItems: 'center',
              maxWidth: count === 1 ? '65%' : count === 2 ? '90%' : '100%',
              margin: '0 auto', width: '100%',
            }}>
              {allParticipants.map(p => (
                <div key={p.identity} style={{ width: '100%' }}>
                  <VideoParticipant participant={p} isLocal={p.identity === localParticipant.identity} />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right side panel */}
        {panel === 'notes' && <NotesPanel roomKey={roomId || roomName} onClose={() => setPanel(null)} />}
        {panel === 'chat' && roomId && chatEnabled && (
          <ChatPanel roomId={roomId} userId={userId} onClose={() => setPanel(null)} onSeen={() => { lastSeenCount.current = 0; }} />
        )}
        {panel === 'people' && (
          <ParticipantsPanel participants={allParticipants} localId={localParticipant.identity} onClose={() => setPanel(null)} />
        )}
      </div>

      {/* Hidden audio */}
      {participants.map(p => {
        const pub = p.getTrackPublication(Track.Source.Microphone);
        if (!pub?.track) return null;
        return (
          <TrackRefContext.Provider key={p.identity} value={{ participant: p, publication: pub, source: Track.Source.Microphone }}>
            <AudioTrack style={{ display: 'none' }} />
          </TrackRefContext.Provider>
        );
      })}

      {/* ── Floating controls bar (bottom center) ─────────────── */}
      <div style={{ display: 'flex', justifyContent: 'center', paddingBottom: 18, paddingTop: 4 }}>
        <div data-video-controls style={{
          display: 'flex', alignItems: 'center', gap: 10, padding: '10px 18px', borderRadius: 18,
          background: BAR_BG, backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
          boxShadow: '0 8px 30px rgba(0,0,0,0.45)', border: '1px solid rgba(255,255,255,0.08)',
          maxWidth: 'calc(100vw - 24px)',
        }}>
          <ControlButton icon={micEnabled ? Icons.mic : Icons.micOff} label={micEnabled ? 'Mute' : 'Unmute'} off={!micEnabled} onClick={toggleMic} />
          <ControlButton icon={cameraEnabled ? Icons.cam : Icons.camOff} label={cameraEnabled ? 'Turn off camera' : 'Turn on camera'} off={!cameraEnabled} onClick={toggleCamera} />
          <ControlButton icon={Icons.screen} label={screenShareEnabled ? 'Stop sharing' : 'Present screen'} active={screenShareEnabled} onClick={toggleScreenShare} />
          <ControlButton icon={Icons.noise} label={`Noise cancellation: ${noiseCancel ? 'On' : 'Off'}`} active={noiseCancel} onClick={toggleNoiseCancel} />
          <div style={{ width: 1, height: 28, background: 'rgba(255,255,255,0.12)', margin: '0 2px' }} />
          <ControlButton icon={Icons.notes} label="Notes" active={panel === 'notes'} onClick={() => openPanel('notes')} />
          {roomId && chatEnabled && <ControlButton icon={Icons.chat} label="Chat" active={panel === 'chat'} badge={panel === 'chat' ? 0 : unread} onClick={() => openPanel('chat')} />}
          <ControlButton icon={Icons.people} label="Participants" active={panel === 'people'} onClick={() => openPanel('people')} />
          <div style={{ width: 1, height: 28, background: 'rgba(255,255,255,0.12)', margin: '0 2px' }} />
          <ControlButton icon={Icons.hangup} label="Leave call" danger onClick={onLeave} />
        </div>
      </div>

      {/* Unread watcher */}
      {roomId && chatEnabled && panel !== 'chat' && (
        <UnreadWatcher roomId={roomId} userId={userId} onIncrement={() => setUnread(n => n + 1)} />
      )}
    </div>
  );
}

function UnreadWatcher({ roomId, userId, onIncrement }: { roomId: string; userId?: string; onIncrement: () => void }) {
  useRealtimeTable<ChatMsg>({
    channelName: `video-chat-unread:${roomId}`, table: 'room_messages', event: 'INSERT',
    filter: `room_id=eq.${roomId}`,
    onChange: payload => { const m = payload.new as ChatMsg | undefined; if (!m || m.user_id === userId) return; onIncrement(); },
  });
  return null;
}


// ════════════════════════════════════════════════════════════════════════════
// COMING-SOON PLACEHOLDER
// ════════════════════════════════════════════════════════════════════════════
function VideoComingSoon({ onClose }: { onClose: () => void }) {
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(7,10,24,0.85)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{ width: 400, maxWidth: '100%', background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 22, padding: 36, textAlign: 'center', boxShadow: 'var(--shadow-xl)' }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>🎥</div>
        <h3 style={{ fontFamily: 'Fraunces, serif', fontSize: 24, fontWeight: 600, marginBottom: 10 }}>Video calling coming soon</h3>
        <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 24 }}>
          Live video rooms with camera, mic, and screen sharing are on their way. We&apos;ll notify you when it&apos;s ready.
        </p>
        <button onClick={onClose} style={{ height: 40, padding: '0 20px', borderRadius: 999, background: 'var(--bg-hover)', border: '1px solid var(--border-default)', fontSize: 14, fontWeight: 500 }}>Got it</button>
      </div>
    </div>
  );
}


// ════════════════════════════════════════════════════════════════════════════
// MAIN EXPORT
// ════════════════════════════════════════════════════════════════════════════
export default function VideoRoom({ roomName, userName, token, onLeave, roomId, userId, peerCount, isPublic }: VideoRoomProps) {
  const livekitUrl = process.env.NEXT_PUBLIC_LIVEKIT_URL;

  const [joined, setJoined] = useState(false);
  const [settings, setSettings] = useState<{ camOn: boolean; micOn: boolean; videoDeviceId?: string; audioDeviceId?: string }>({ camOn: true, micOn: true });

  const roomOptions = useMemo(
    () => buildRoomOptions({ videoDeviceId: settings.videoDeviceId, audioDeviceId: settings.audioDeviceId, noiseSuppression: true }),
    [settings.videoDeviceId, settings.audioDeviceId],
  );

  if (!livekitUrl) return <VideoComingSoon onClose={onLeave} />;

  if (!joined) {
    return <PreJoin roomName={roomName} userName={userName} peerCount={peerCount}
      onJoin={s => { setSettings(s); setJoined(true); }} onCancel={onLeave} />;
  }

  return (
    <LiveKitRoom video={settings.camOn} audio={settings.micOn} token={token}
      serverUrl={livekitUrl} options={roomOptions} onDisconnected={onLeave} style={{ height: '100%' }}>
      <VideoRoomInner roomName={roomName} roomId={roomId} userId={userId} onLeave={onLeave}
        initialMic={settings.micOn} initialCam={settings.camOn} chatEnabled={!isPublic} />
    </LiveKitRoom>
  );
}
