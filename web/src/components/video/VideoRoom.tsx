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
import '@livekit/components-styles';
import VideoParticipant from './VideoParticipant';
import { listRoomMessages, sendRoomMessage } from '@/app/actions/rooms';
import { loadRoomNote, saveRoomNote } from '@/app/actions/roomNotes';
import { useRealtimeTable } from '@/hooks/useRealtimeSubscription';

interface VideoRoomProps {
  roomName: string;
  userName: string;
  token: string;
  onLeave: () => void;
  /** Real room UUID — enables persisted in-room chat (study/private rooms). */
  roomId?: string;
  /** Current user's profile id (for chat ownership styling). */
  userId?: string;
  /** Approx. number of people already in the room (shown on pre-join). */
  peerCount?: number;
  /** Public rooms have no chat (chat is private-rooms-only). */
  isPublic?: boolean;
}

// ── Theme constants (preserved from original) ───────────────────────────────
const BG = '#1a1a2e';
const HEADER_BG = 'rgba(26,26,46,0.95)';
const PANEL_BG = '#202234';

// ── Inline SVG icons ────────────────────────────────────────────────────────
const Svg = ({
  children,
  size = 20,
}: {
  children: React.ReactNode;
  size?: number;
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    {children}
  </svg>
);

const Icons = {
  mic: (
    <Svg>
      <path d="M12 2a3 3 0 0 0-3 3v6a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z" />
      <path d="M19 10v1a7 7 0 0 1-14 0v-1" />
      <path d="M12 18v4M8 22h8" />
    </Svg>
  ),
  micOff: (
    <Svg>
      <path d="M3 3l18 18" />
      <path d="M9 9v2a3 3 0 0 0 5.12 2.12M15 11V5a3 3 0 0 0-5.94-.6" />
      <path d="M19 10v1a7 7 0 0 1-.7 3.05M12 18v4M8 22h8M5 11v0a7 7 0 0 0 4.5 6.53" />
    </Svg>
  ),
  cam: (
    <Svg>
      <path d="M23 7l-7 5 7 5V7z" />
      <rect x="1" y="5" width="15" height="14" rx="2" />
    </Svg>
  ),
  camOff: (
    <Svg>
      <path d="M3 3l18 18" />
      <path d="M16 16H4a2 2 0 0 1-2-2V7a2 2 0 0 1 .59-1.41M10 5h4a2 2 0 0 1 2 2v3l4-3v8" />
    </Svg>
  ),
  screen: (
    <Svg>
      <rect x="2" y="3" width="20" height="14" rx="2" />
      <path d="M8 21h8M12 17v4" />
    </Svg>
  ),
  noise: (
    <Svg>
      <path d="M12 2a3 3 0 0 0-3 3v6a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z" />
      <path d="M19 10v1a7 7 0 0 1-14 0v-1" />
      <path d="M12 18v4" />
      <path d="M2 8c1 1 1 7 0 8M22 8c-1 1-1 7 0 8" />
    </Svg>
  ),
  notes: (
    <Svg>
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <path d="M14 2v6h6M8 13h8M8 17h6" />
    </Svg>
  ),
  chat: (
    <Svg>
      <path d="M21 11.5a8.38 8.38 0 0 1-9 8.5 8.5 8.5 0 0 1-3.8-.9L3 21l1.9-5.2A8.5 8.5 0 1 1 21 11.5z" />
    </Svg>
  ),
  people: (
    <Svg>
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
    </Svg>
  ),
  settings: (
    <Svg>
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </Svg>
  ),
  close: (
    <Svg size={18}>
      <path d="M18 6L6 18M6 6l12 12" />
    </Svg>
  ),
  send: (
    <Svg size={18}>
      <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
    </Svg>
  ),
  chevLeft: (
    <Svg size={16}>
      <path d="M15 18l-6-6 6-6" />
    </Svg>
  ),
  chevRight: (
    <Svg size={16}>
      <path d="M9 18l6-6-6-6" />
    </Svg>
  ),
};

// ── LiveKit room options (HD video + noise-cancelled audio) ─────────────────
function buildRoomOptions(opts: {
  videoDeviceId?: string;
  audioDeviceId?: string;
  noiseSuppression: boolean;
}): RoomOptions {
  return {
    adaptiveStream: true,
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
      resolution: {
        width: 1280,
        height: 720,
        frameRate: 30,
        aspectRatio: 16 / 9,
      },
      ...(opts.videoDeviceId ? { deviceId: opts.videoDeviceId } : {}),
    },
    publishDefaults: {
      videoCodec: 'vp8' as VideoCodec,
      videoEncoding: { maxBitrate: 1_700_000, maxFramerate: 30 },
      simulcast: true,
    },
  };
}

// ════════════════════════════════════════════════════════════════════════════
// PRE-JOIN SCREEN
// ════════════════════════════════════════════════════════════════════════════
function PreJoin({
  roomName,
  userName,
  peerCount,
  onJoin,
  onCancel,
}: {
  roomName: string;
  userName: string;
  peerCount?: number;
  onJoin: (s: {
    camOn: boolean;
    micOn: boolean;
    videoDeviceId?: string;
    audioDeviceId?: string;
  }) => void;
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
  const [videoDeviceId, setVideoDeviceId] = useState<string>('');
  const [audioDeviceId, setAudioDeviceId] = useState<string>('');
  const [level, setLevel] = useState(0);
  const [permError, setPermError] = useState<string | null>(null);

  const stopStream = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    audioCtxRef.current?.close().catch(() => {});
    audioCtxRef.current = null;
  }, []);

  useEffect(() => {
    let cancelled = false;
    stopStream();
    if (!camOn && !micOn) {
      setLevel(0);
      return;
    }
    navigator.mediaDevices
      .getUserMedia({
        video: camOn
          ? videoDeviceId
            ? { deviceId: { exact: videoDeviceId } }
            : true
          : false,
        audio: micOn
          ? audioDeviceId
            ? { deviceId: { exact: audioDeviceId } }
            : true
          : false,
      })
      .then((stream) => {
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;
        setPermError(null);
        if (videoRef.current) videoRef.current.srcObject = stream;
        navigator.mediaDevices.enumerateDevices().then((list) => {
          if (cancelled) return;
          setCams(list.filter((d) => d.kind === 'videoinput'));
          setMics(list.filter((d) => d.kind === 'audioinput'));
        });
        if (micOn && stream.getAudioTracks().length) {
          const Ctx =
            window.AudioContext ||
            (
              window as unknown as {
                webkitAudioContext: typeof AudioContext;
              }
            ).webkitAudioContext;
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
      .catch(() => {
        if (!cancelled)
          setPermError(
            'Camera / microphone unavailable. You can still join.',
          );
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [camOn, micOn, videoDeviceId, audioDeviceId]);

  useEffect(() => () => stopStream(), [stopStream]);

  const join = () => {
    stopStream();
    onJoin({
      camOn,
      micOn,
      videoDeviceId: videoDeviceId || undefined,
      audioDeviceId: audioDeviceId || undefined,
    });
  };

  const selectStyle: React.CSSProperties = {
    height: 38,
    borderRadius: 10,
    padding: '0 10px',
    maxWidth: 220,
    background: 'rgba(255,255,255,0.06)',
    color: '#fff',
    border: '1px solid rgba(255,255,255,0.12)',
    fontSize: 13,
    outline: 'none',
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1000,
        background: BG,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
      }}
    >
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 36,
          alignItems: 'center',
          justifyContent: 'center',
          maxWidth: 1000,
          width: '100%',
        }}
      >
        {/* Camera preview */}
        <div style={{ flex: '1 1 460px', maxWidth: 560 }}>
          <div
            style={{
              position: 'relative',
              width: '100%',
              aspectRatio: '16 / 9',
              borderRadius: 16,
              overflow: 'hidden',
              background: 'linear-gradient(135deg,#1f2440,#12162e)',
              boxShadow: '0 16px 50px rgba(0,0,0,0.5)',
            }}
          >
            {camOn ? (
              <video
                ref={videoRef}
                autoPlay
                muted
                playsInline
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                }}
              />
            ) : (
              <div
                style={{
                  width: '100%',
                  height: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexDirection: 'column',
                  gap: 12,
                  color: '#9aa0b4',
                }}
              >
                <div
                  style={{
                    width: 84,
                    height: 84,
                    borderRadius: 999,
                    background:
                      'var(--gradient-brand,linear-gradient(135deg,#1B2B8E,#3D52CC))',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 34,
                    fontWeight: 700,
                    color: '#fff',
                    fontFamily: 'Fraunces, serif',
                  }}
                >
                  {(userName || '?').charAt(0).toUpperCase()}
                </div>
                <span style={{ fontSize: 13 }}>Camera is off</span>
              </div>
            )}
            {micOn && (
              <div
                style={{
                  position: 'absolute',
                  bottom: 14,
                  left: 14,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '6px 10px',
                  borderRadius: 999,
                  background: 'rgba(0,0,0,0.45)',
                  backdropFilter: 'blur(6px)',
                }}
              >
                <span style={{ color: '#fff', display: 'flex' }}>
                  {Icons.mic}
                </span>
                <div
                  style={{
                    width: 70,
                    height: 5,
                    borderRadius: 999,
                    background: 'rgba(255,255,255,0.2)',
                    overflow: 'hidden',
                  }}
                >
                  <div
                    style={{
                      width: `${level}%`,
                      height: '100%',
                      background: '#34d399',
                      transition: 'width 90ms linear',
                    }}
                  />
                </div>
              </div>
            )}
            <div
              style={{
                position: 'absolute',
                bottom: 14,
                left: '50%',
                transform: 'translateX(-50%)',
                display: 'flex',
                gap: 12,
              }}
            >
              <CircleToggle
                on={micOn}
                onIcon={Icons.mic}
                offIcon={Icons.micOff}
                onClick={() => setMicOn((v) => !v)}
                label="Microphone"
              />
              <CircleToggle
                on={camOn}
                onIcon={Icons.cam}
                offIcon={Icons.camOff}
                onClick={() => setCamOn((v) => !v)}
                label="Camera"
              />
            </div>
          </div>
          {permError && (
            <div style={{ marginTop: 12, color: '#fbbf24', fontSize: 12 }}>
              {permError}
            </div>
          )}
          <div
            style={{
              display: 'flex',
              gap: 12,
              marginTop: 16,
              flexWrap: 'wrap',
            }}
          >
            {cams.length > 1 && (
              <select
                style={selectStyle}
                value={videoDeviceId}
                onChange={(e) => setVideoDeviceId(e.target.value)}
              >
                <option value="">Default camera</option>
                {cams.map((d) => (
                  <option key={d.deviceId} value={d.deviceId}>
                    {d.label || 'Camera'}
                  </option>
                ))}
              </select>
            )}
            {mics.length > 1 && (
              <select
                style={selectStyle}
                value={audioDeviceId}
                onChange={(e) => setAudioDeviceId(e.target.value)}
              >
                <option value="">Default microphone</option>
                {mics.map((d) => (
                  <option key={d.deviceId} value={d.deviceId}>
                    {d.label || 'Microphone'}
                  </option>
                ))}
              </select>
            )}
          </div>
        </div>

        {/* Join card */}
        <div style={{ flex: '0 1 320px', textAlign: 'center' }}>
          <h2
            style={{
              fontFamily: 'Fraunces, serif',
              fontSize: 30,
              fontWeight: 600,
              color: '#fff',
              marginBottom: 8,
              lineHeight: 1.15,
            }}
          >
            Ready to join?
          </h2>
          <p style={{ fontSize: 14, color: '#b6bbcd', marginBottom: 4 }}>
            {roomName}
          </p>
          {typeof peerCount === 'number' && (
            <p
              style={{ fontSize: 13, color: '#8b91a8', marginBottom: 24 }}
            >
              {peerCount === 0
                ? 'No one else here yet'
                : `${peerCount} ${peerCount === 1 ? 'person' : 'people'} in this room`}
            </p>
          )}
          <button
            onClick={join}
            style={{
              width: '100%',
              maxWidth: 240,
              height: 50,
              borderRadius: 999,
              background:
                'var(--gradient-brand,linear-gradient(135deg,#1B2B8E,#3D52CC))',
              color: '#fff',
              fontSize: 16,
              fontWeight: 600,
              border: 'none',
              cursor: 'pointer',
              boxShadow: '0 8px 24px rgba(34,54,176,0.45)',
            }}
          >
            Join now
          </button>
          <button
            onClick={() => {
              stopStream();
              onCancel();
            }}
            style={{
              display: 'block',
              margin: '14px auto 0',
              background: 'transparent',
              border: 'none',
              color: '#8b91a8',
              fontSize: 13,
              cursor: 'pointer',
            }}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

function CircleToggle({
  on,
  onIcon,
  offIcon,
  onClick,
  label,
}: {
  on: boolean;
  onIcon: React.ReactNode;
  offIcon: React.ReactNode;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      title={label}
      onClick={onClick}
      style={{
        width: 48,
        height: 48,
        borderRadius: 999,
        cursor: 'pointer',
        background: on ? 'rgba(255,255,255,0.16)' : '#ef4444',
        border: on ? '1px solid rgba(255,255,255,0.22)' : 'none',
        color: '#fff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backdropFilter: 'blur(6px)',
        transition: 'all 160ms',
      }}
    >
      {on ? onIcon : offIcon}
    </button>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// HEADER CONTROL BUTTON (compact pill style for top bar)
// ════════════════════════════════════════════════════════════════════════════
function HeaderBtn({
  icon,
  label,
  onClick,
  off,
  active,
  badge,
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  off?: boolean;
  active?: boolean;
  badge?: number;
}) {
  return (
    <button
      onClick={onClick}
      title={label}
      aria-label={label}
      style={{
        position: 'relative',
        width: 38,
        height: 38,
        borderRadius: 10,
        background: off
          ? 'rgba(239,68,68,0.2)'
          : active
            ? 'rgba(61,82,204,0.35)'
            : 'rgba(255,255,255,0.07)',
        border: off
          ? '1px solid rgba(239,68,68,0.4)'
          : active
            ? '1px solid rgba(61,82,204,0.5)'
            : '1px solid rgba(255,255,255,0.1)',
        color: off ? '#f87171' : active ? '#93a3ff' : '#b6bbcd',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'all 150ms',
        flexShrink: 0,
      }}
    >
      {icon}
      {!!badge && badge > 0 && (
        <span
          style={{
            position: 'absolute',
            top: -3,
            right: -3,
            minWidth: 16,
            height: 16,
            padding: '0 4px',
            borderRadius: 999,
            background: '#ef4444',
            color: '#fff',
            fontSize: 9,
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: `2px solid ${BG}`,
          }}
        >
          {badge > 9 ? '9+' : badge}
        </span>
      )}
    </button>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// SIDE PANELS (overlay style)
// ════════════════════════════════════════════════════════════════════════════
function PanelShell({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <div
      data-video-panel
      style={{
        position: 'absolute',
        top: 0,
        right: 0,
        bottom: 0,
        width: 340,
        maxWidth: '90vw',
        background: PANEL_BG,
        borderLeft: '1px solid rgba(255,255,255,0.08)',
        display: 'flex',
        flexDirection: 'column',
        zIndex: 20,
        boxShadow: '-8px 0 30px rgba(0,0,0,0.4)',
        animation: 'elmPanelIn 250ms ease',
      }}
    >
      <div
        style={{
          height: 52,
          padding: '0 16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
          flexShrink: 0,
        }}
      >
        <span
          style={{
            fontFamily: 'Fraunces, serif',
            fontSize: 15,
            fontWeight: 600,
            color: '#fff',
          }}
        >
          {title}
        </span>
        <button
          onClick={onClose}
          aria-label="Close panel"
          style={{
            width: 28,
            height: 28,
            borderRadius: 8,
            background: 'transparent',
            border: 'none',
            color: '#b6bbcd',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {Icons.close}
        </button>
      </div>
      {children}
    </div>
  );
}

function NotesPanel({
  roomKey,
  onClose,
}: {
  roomKey: string;
  onClose: () => void;
}) {
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
        const ls =
          typeof window !== 'undefined'
            ? localStorage.getItem(lsKey)
            : null;
        setContent(res.content || ls || '');
        setSavedAt(res.updatedAt);
      } else {
        setLocalOnly(true);
        setContent(
          typeof window !== 'undefined'
            ? (localStorage.getItem(lsKey) ?? '')
            : '',
        );
      }
      setLoaded(true);
    })();
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomKey]);

  const persist = useCallback(
    async (text: string) => {
      try {
        localStorage.setItem(lsKey, text);
      } catch {}
      const res = await saveRoomNote(roomKey, text);
      if (res.ok) {
        setLocalOnly(false);
        setSavedAt(res.updatedAt);
      } else {
        setLocalOnly(true);
        setSavedAt(new Date().toISOString());
      }
    },
    [roomKey, lsKey],
  );

  const onChange = (text: string) => {
    setContent(text);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => persist(text), 3000);
  };

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
      const text = contentRef.current;
      try {
        localStorage.setItem(lsKey, text);
      } catch {}
      saveRoomNote(roomKey, text).catch(() => {});
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  const savedLabel = savedAt
    ? `Last saved: ${new Date(savedAt).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}`
    : 'Not saved yet';

  return (
    <PanelShell title="Session Notes" onClose={onClose}>
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          padding: 14,
          minHeight: 0,
        }}
      >
        <textarea
          value={content}
          onChange={(e) => onChange(e.target.value)}
          placeholder={
            loaded ? 'Type your session notes… (auto-saves)' : 'Loading…'
          }
          disabled={!loaded}
          style={{
            flex: 1,
            width: '100%',
            resize: 'none',
            borderRadius: 10,
            padding: 12,
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.1)',
            color: '#e8ecff',
            fontSize: 14,
            lineHeight: 1.6,
            outline: 'none',
            fontFamily: 'inherit',
          }}
        />
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginTop: 10,
            fontSize: 11,
            color: '#8b91a8',
          }}
        >
          <span>{localOnly ? 'Notes saved locally' : savedLabel}</span>
          <span>{content.length} chars</span>
        </div>
      </div>
    </PanelShell>
  );
}

type ChatMsg = {
  id: string;
  room_id: string;
  user_id: string;
  content: string;
  created_at: string;
  author?: { full_name: string | null } | null;
};

function ChatPanel({
  roomId,
  userId,
  onClose,
  onSeen,
}: {
  roomId: string;
  userId?: string;
  onClose: () => void;
  onSeen: () => void;
}) {
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    onSeen();
  }, [onSeen, messages.length]);

  useEffect(() => {
    listRoomMessages(roomId).then((d) => setMessages(d as ChatMsg[]));
  }, [roomId]);

  useRealtimeTable<ChatMsg>({
    channelName: `video-chat:${roomId}`,
    table: 'room_messages',
    event: 'INSERT',
    filter: `room_id=eq.${roomId}`,
    onChange: (payload) => {
      const m = payload.new as ChatMsg | undefined;
      if (!m) return;
      setMessages((prev) =>
        prev.some((p) => p.id === m.id) ? prev : [...prev, m],
      );
    },
  });

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: 'smooth',
    });
  }, [messages]);

  const send = async () => {
    if (!input.trim() || sending) return;
    setSending(true);
    try {
      await sendRoomMessage(roomId, input.trim());
      setInput('');
    } catch {
    } finally {
      setSending(false);
    }
  };

  return (
    <PanelShell title="In-call messages" onClose={onClose}>
      <div
        ref={scrollRef}
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '12px 14px',
          display: 'flex',
          flexDirection: 'column',
          gap: 12,
        }}
      >
        {messages.length === 0 ? (
          <div
            style={{
              textAlign: 'center',
              padding: '50px 16px',
              color: '#8b91a8',
              fontSize: 13,
            }}
          >
            No messages yet
          </div>
        ) : (
          messages.map((m) => {
            const mine = m.user_id === userId;
            const name = mine
              ? 'You'
              : m.author?.full_name || 'Guest';
            return (
              <div
                key={m.id}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: mine ? 'flex-end' : 'flex-start',
                }}
              >
                <div
                  style={{
                    fontSize: 11,
                    color: '#8b91a8',
                    marginBottom: 3,
                  }}
                >
                  {name} ·{' '}
                  {new Date(m.created_at).toLocaleTimeString([], {
                    hour: 'numeric',
                    minute: '2-digit',
                  })}
                </div>
                <div
                  style={{
                    maxWidth: '85%',
                    padding: '8px 12px',
                    fontSize: 13,
                    lineHeight: 1.5,
                    wordBreak: 'break-word',
                    borderRadius: mine
                      ? '12px 12px 4px 12px'
                      : '12px 12px 12px 4px',
                    background: mine
                      ? 'var(--brand-500,#2236B0)'
                      : 'rgba(255,255,255,0.08)',
                    color: '#fff',
                  }}
                >
                  {m.content}
                </div>
              </div>
            );
          })
        )}
      </div>
      <div
        style={{
          padding: 12,
          borderTop: '1px solid rgba(255,255,255,0.08)',
          display: 'flex',
          gap: 8,
        }}
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              send();
            }
          }}
          placeholder="Send a message"
          style={{
            flex: 1,
            height: 40,
            padding: '0 12px',
            borderRadius: 10,
            background: 'rgba(255,255,255,0.06)',
            border: '1px solid rgba(255,255,255,0.12)',
            color: '#fff',
            fontSize: 13,
            outline: 'none',
          }}
        />
        <button
          onClick={send}
          disabled={!input.trim() || sending}
          aria-label="Send"
          style={{
            width: 40,
            height: 40,
            borderRadius: 10,
            background: input.trim()
              ? 'var(--brand-500,#2236B0)'
              : 'rgba(255,255,255,0.08)',
            color: '#fff',
            border: 'none',
            cursor: input.trim() ? 'pointer' : 'default',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {Icons.send}
        </button>
      </div>
    </PanelShell>
  );
}

function ParticipantsPanel({
  participants,
  localId,
  onClose,
}: {
  participants: (LocalParticipant | RemoteParticipant)[];
  localId: string;
  onClose: () => void;
}) {
  return (
    <PanelShell title={`Participants (${participants.length})`} onClose={onClose}>
      <div style={{ flex: 1, overflowY: 'auto', padding: '8px 8px' }}>
        {participants.map((p) => {
          const name =
            (p.name || p.identity.split('__')[0] || 'Guest') +
            (p.identity === localId ? ' (You)' : '');
          const micMuted = !!p.getTrackPublication(Track.Source.Microphone)
            ?.isMuted;
          const camOff = !p.isCameraEnabled;
          return (
            <div
              key={p.identity}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '10px 10px',
                borderRadius: 10,
              }}
            >
              <div
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: 999,
                  background:
                    'var(--gradient-brand,linear-gradient(135deg,#1B2B8E,#3D52CC))',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#fff',
                  fontWeight: 700,
                  fontFamily: 'Fraunces, serif',
                  flexShrink: 0,
                  fontSize: 13,
                }}
              >
                {name.charAt(0).toUpperCase()}
              </div>
              <span
                style={{
                  flex: 1,
                  color: '#e8ecff',
                  fontSize: 13,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {name}
              </span>
              <span
                style={{
                  color: micMuted ? '#f87171' : '#8b91a8',
                  display: 'flex',
                }}
              >
                <span style={{ width: 16, height: 16, display: 'flex' }}>
                  {micMuted ? Icons.micOff : Icons.mic}
                </span>
              </span>
              <span
                style={{
                  color: camOff ? '#f87171' : '#8b91a8',
                  display: 'flex',
                }}
              >
                <span style={{ width: 16, height: 16, display: 'flex' }}>
                  {camOff ? Icons.camOff : Icons.cam}
                </span>
              </span>
            </div>
          );
        })}
      </div>
    </PanelShell>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// PAGINATION — show TILES_PER_PAGE tiles at a time, StudyStream style
// ════════════════════════════════════════════════════════════════════════════
const TILES_PER_PAGE = 12;

// ════════════════════════════════════════════════════════════════════════════
// IN-CALL UI — StudyStream-style layout
// ════════════════════════════════════════════════════════════════════════════
type PanelKind = 'notes' | 'chat' | 'people' | null;

function VideoRoomInner({
  roomName,
  roomId,
  userId,
  onLeave,
  initialMic,
  initialCam,
  chatEnabled,
}: {
  roomName: string;
  roomId?: string;
  userId?: string;
  onLeave: () => void;
  initialMic: boolean;
  initialCam: boolean;
  chatEnabled: boolean;
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
  const [page, setPage] = useState(0);
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
    try {
      await localParticipant.setScreenShareEnabled(next);
      setScreenShareEnabled(next);
    } catch {}
  }, [localParticipant, screenShareEnabled]);

  const toggleNoiseCancel = useCallback(async () => {
    const next = !noiseCancel;
    setNoiseCancel(next);
    const audioTrack = localParticipant.getTrackPublication(
      Track.Source.Microphone,
    )?.audioTrack as LocalAudioTrack | undefined;
    if (audioTrack && 'restartTrack' in audioTrack) {
      try {
        await audioTrack.restartTrack({
          noiseSuppression: next,
          echoCancellation: true,
          autoGainControl: true,
        });
      } catch {}
    }
  }, [localParticipant, noiseCancel]);

  const allParticipants: (LocalParticipant | RemoteParticipant)[] =
    useMemo(
      () => [
        localParticipant,
        ...participants.filter(
          (p) => p.identity !== localParticipant.identity,
        ),
      ],
      [localParticipant, participants],
    );

  const totalPages = Math.max(
    1,
    Math.ceil(allParticipants.length / TILES_PER_PAGE),
  );
  const safePage = Math.min(page, totalPages - 1);
  const pagedParticipants = allParticipants.slice(
    safePage * TILES_PER_PAGE,
    (safePage + 1) * TILES_PER_PAGE,
  );

  const sharing = screenTracks.length > 0;

  // Responsive columns: 4 for desktop grid, fewer when not many participants.
  const tileCount = pagedParticipants.length;
  const cols = sharing ? 1 : tileCount <= 1 ? 1 : tileCount <= 2 ? 2 : tileCount <= 6 ? 3 : 4;

  const openPanel = (kind: Exclude<PanelKind, null>) => {
    setPanel((prev) => (prev === kind ? null : kind));
    if (kind === 'chat') setUnread(0);
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1000,
        background: BG,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <style>{`
        @keyframes elmPanelIn {
          from { transform: translateX(24px); opacity: 0 }
          to { transform: translateX(0); opacity: 1 }
        }
        [data-lk-local-participant] video { transform: scaleX(1) !important; }
        [data-video-grid]::-webkit-scrollbar { width: 6px }
        [data-video-grid]::-webkit-scrollbar-track { background: transparent }
        [data-video-grid]::-webkit-scrollbar-thumb {
          background: rgba(255,255,255,0.12);
          border-radius: 3px;
        }
      `}</style>

      {/* ══ TOP HEADER BAR ═══════════════════════════════════════════ */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 12,
          padding: '8px 16px',
          background: HEADER_BG,
          backdropFilter: 'blur(12px)',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          flexShrink: 0,
          zIndex: 10,
        }}
      >
        {/* Left: Finish session */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button
            onClick={onLeave}
            style={{
              height: 36,
              padding: '0 18px',
              borderRadius: 10,
              background: 'rgba(239,68,68,0.15)',
              border: '1px solid rgba(239,68,68,0.35)',
              color: '#f87171',
              fontSize: 13,
              fontWeight: 600,
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              transition: 'all 150ms',
            }}
          >
            Finish session
          </button>
        </div>

        {/* Center: A/V controls */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            padding: '4px 8px',
            borderRadius: 12,
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.06)',
          }}
        >
          <HeaderBtn
            icon={micEnabled ? Icons.mic : Icons.micOff}
            label={micEnabled ? 'Mute' : 'Unmute'}
            off={!micEnabled}
            onClick={toggleMic}
          />
          <HeaderBtn
            icon={cameraEnabled ? Icons.cam : Icons.camOff}
            label={
              cameraEnabled
                ? 'Turn off camera'
                : 'Turn on camera'
            }
            off={!cameraEnabled}
            onClick={toggleCamera}
          />
          <HeaderBtn
            icon={Icons.screen}
            label={
              screenShareEnabled
                ? 'Stop sharing'
                : 'Present screen'
            }
            active={screenShareEnabled}
            onClick={toggleScreenShare}
          />
          <HeaderBtn
            icon={Icons.noise}
            label={`Noise cancellation: ${noiseCancel ? 'On' : 'Off'}`}
            active={noiseCancel}
            onClick={toggleNoiseCancel}
          />
          <div
            style={{
              width: 1,
              height: 24,
              background: 'rgba(255,255,255,0.1)',
              margin: '0 2px',
            }}
          />
          <HeaderBtn
            icon={Icons.notes}
            label="Notes"
            active={panel === 'notes'}
            onClick={() => openPanel('notes')}
          />
          {roomId && chatEnabled && (
            <HeaderBtn
              icon={Icons.chat}
              label="Chat"
              active={panel === 'chat'}
              badge={panel === 'chat' ? 0 : unread}
              onClick={() => openPanel('chat')}
            />
          )}
          <HeaderBtn
            icon={Icons.people}
            label="Participants"
            active={panel === 'people'}
            onClick={() => openPanel('people')}
          />
        </div>

        {/* Right: page nav + count */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
          }}
        >
          {totalPages > 1 && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 4,
              }}
            >
              <button
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                disabled={safePage === 0}
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: 7,
                  background: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  color:
                    safePage === 0
                      ? 'rgba(255,255,255,0.2)'
                      : '#b6bbcd',
                  cursor: safePage === 0 ? 'default' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {Icons.chevLeft}
              </button>
              <span
                style={{
                  fontSize: 12,
                  fontFamily: 'JetBrains Mono, monospace',
                  color: '#b6bbcd',
                  minWidth: 48,
                  textAlign: 'center',
                }}
              >
                {safePage + 1} / {totalPages}
              </span>
              <button
                onClick={() =>
                  setPage((p) => Math.min(totalPages - 1, p + 1))
                }
                disabled={safePage >= totalPages - 1}
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: 7,
                  background: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  color:
                    safePage >= totalPages - 1
                      ? 'rgba(255,255,255,0.2)'
                      : '#b6bbcd',
                  cursor:
                    safePage >= totalPages - 1
                      ? 'default'
                      : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {Icons.chevRight}
              </button>
            </div>
          )}

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '5px 12px',
              borderRadius: 8,
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.08)',
            }}
          >
            <span style={{ color: '#b6bbcd', display: 'flex' }}>
              {Icons.people}
            </span>
            <span
              style={{
                color: '#e8ecff',
                fontSize: 13,
                fontWeight: 600,
                fontFamily: 'JetBrains Mono, monospace',
              }}
            >
              {allParticipants.length}
            </span>
          </div>
        </div>
      </div>

      {/* ══ MAIN CONTENT ═══════════════════════════════════════════ */}
      <div style={{ flex: 1, position: 'relative', minHeight: 0 }}>
        {/* Video tile grid */}
        <div
          style={{
            width: '100%',
            height: '100%',
            overflowY: 'auto',
            padding: 10,
          }}
        >
          {sharing ? (
            /* Screen-share mode: big screen + filmstrip */
            <div
              style={{
                display: 'flex',
                gap: 10,
                height: '100%',
                minHeight: 0,
              }}
            >
              <div
                style={{
                  flex: '0 0 75%',
                  borderRadius: 10,
                  overflow: 'hidden',
                  background: '#000',
                  minWidth: 0,
                }}
              >
                <TrackRefContext.Provider value={screenTracks[0]}>
                  <VideoTrack
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'contain',
                    }}
                  />
                </TrackRefContext.Provider>
              </div>
              <div
                style={{
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 8,
                  overflowY: 'auto',
                  minWidth: 0,
                }}
              >
                {allParticipants.map((p) => (
                  <VideoParticipant
                    key={p.identity}
                    participant={p}
                    isLocal={
                      p.identity === localParticipant.identity
                    }
                    compact
                  />
                ))}
              </div>
            </div>
          ) : (
            /* Normal grid mode — StudyStream 4-column dense layout */
            <div
              data-video-grid
              style={{
                display: 'grid',
                gap: 8,
                gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
                alignContent: 'start',
                width: '100%',
                minHeight: '100%',
              }}
            >
              {pagedParticipants.map((p) => (
                <div key={p.identity}>
                  <VideoParticipant
                    participant={p}
                    isLocal={
                      p.identity === localParticipant.identity
                    }
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Overlay panels (notes / chat / participants) */}
        {panel === 'notes' && (
          <NotesPanel
            roomKey={roomId || roomName}
            onClose={() => setPanel(null)}
          />
        )}
        {panel === 'chat' && roomId && chatEnabled && (
          <ChatPanel
            roomId={roomId}
            userId={userId}
            onClose={() => setPanel(null)}
            onSeen={() => {
              lastSeenCount.current = 0;
            }}
          />
        )}
        {panel === 'people' && (
          <ParticipantsPanel
            participants={allParticipants}
            localId={localParticipant.identity}
            onClose={() => setPanel(null)}
          />
        )}
      </div>

      {/* Hidden audio elements for remote playback */}
      {participants.map((p) => {
        const pub = p.getTrackPublication(Track.Source.Microphone);
        if (!pub?.track) return null;
        return (
          <TrackRefContext.Provider
            key={p.identity}
            value={{
              participant: p,
              publication: pub,
              source: Track.Source.Microphone,
            }}
          >
            <AudioTrack style={{ display: 'none' }} />
          </TrackRefContext.Provider>
        );
      })}

      {/* Off-screen unread tracker for chat */}
      {roomId && chatEnabled && panel !== 'chat' && (
        <UnreadWatcher
          roomId={roomId}
          userId={userId}
          onIncrement={() => setUnread((n) => n + 1)}
        />
      )}
    </div>
  );
}

function UnreadWatcher({
  roomId,
  userId,
  onIncrement,
}: {
  roomId: string;
  userId?: string;
  onIncrement: () => void;
}) {
  useRealtimeTable<ChatMsg>({
    channelName: `video-chat-unread:${roomId}`,
    table: 'room_messages',
    event: 'INSERT',
    filter: `room_id=eq.${roomId}`,
    onChange: (payload) => {
      const m = payload.new as ChatMsg | undefined;
      if (!m || m.user_id === userId) return;
      onIncrement();
    },
  });
  return null;
}

// ════════════════════════════════════════════════════════════════════════════
// COMING-SOON PLACEHOLDER (LiveKit not configured)
// ════════════════════════════════════════════════════════════════════════════
function VideoComingSoon({ onClose }: { onClose: () => void }) {
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1000,
        background: 'rgba(7,10,24,0.85)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
      }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: 400,
          maxWidth: '100%',
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 22,
          padding: 36,
          textAlign: 'center',
          boxShadow: 'var(--shadow-xl)',
        }}
      >
        <div style={{ fontSize: 48, marginBottom: 16 }}>🎥</div>
        <h3
          style={{
            fontFamily: 'Fraunces, serif',
            fontSize: 24,
            fontWeight: 600,
            marginBottom: 10,
          }}
        >
          Video calling coming soon
        </h3>
        <p
          style={{
            fontSize: 14,
            color: 'var(--text-secondary)',
            lineHeight: 1.6,
            marginBottom: 24,
          }}
        >
          Live video rooms with camera, mic, and screen sharing are on
          their way. We&apos;ll notify you when it&apos;s ready.
        </p>
        <button
          onClick={onClose}
          style={{
            height: 40,
            padding: '0 20px',
            borderRadius: 999,
            background: 'var(--bg-hover)',
            border: '1px solid var(--border-default)',
            fontSize: 14,
            fontWeight: 500,
          }}
        >
          Got it
        </button>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// MAIN EXPORT
// ════════════════════════════════════════════════════════════════════════════
export default function VideoRoom({
  roomName,
  userName,
  token,
  onLeave,
  roomId,
  userId,
  peerCount,
  isPublic,
}: VideoRoomProps) {
  const livekitUrl = process.env.NEXT_PUBLIC_LIVEKIT_URL;

  const [joined, setJoined] = useState(false);
  const [settings, setSettings] = useState<{
    camOn: boolean;
    micOn: boolean;
    videoDeviceId?: string;
    audioDeviceId?: string;
  }>({ camOn: true, micOn: true });

  const roomOptions = useMemo(
    () =>
      buildRoomOptions({
        videoDeviceId: settings.videoDeviceId,
        audioDeviceId: settings.audioDeviceId,
        noiseSuppression: true,
      }),
    [settings.videoDeviceId, settings.audioDeviceId],
  );

  if (!livekitUrl) {
    return <VideoComingSoon onClose={onLeave} />;
  }

  if (!joined) {
    return (
      <PreJoin
        roomName={roomName}
        userName={userName}
        peerCount={peerCount}
        onJoin={(s) => {
          setSettings(s);
          setJoined(true);
        }}
        onCancel={onLeave}
      />
    );
  }

  return (
    <LiveKitRoom
      video={settings.camOn}
      audio={settings.micOn}
      token={token}
      serverUrl={livekitUrl}
      options={roomOptions}
      onDisconnected={onLeave}
      style={{ height: '100%' }}
    >
      <VideoRoomInner
        roomName={roomName}
        roomId={roomId}
        userId={userId}
        onLeave={onLeave}
        initialMic={settings.micOn}
        initialCam={settings.camOn}
        chatEnabled={!isPublic}
      />
    </LiveKitRoom>
  );
}
