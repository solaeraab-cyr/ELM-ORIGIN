'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  LiveKitRoom,
  useLocalParticipant,
  useParticipants,
  useTracks,
  VideoTrack,
  AudioTrack,
  TrackRefContext,
} from '@livekit/components-react';
import { LocalParticipant, RemoteParticipant, Track } from 'livekit-client';
import '@livekit/components-styles';
import VideoParticipant from './VideoParticipant';

interface VideoRoomProps {
  roomName: string;
  userName: string;
  token: string;
  onLeave: () => void;
}

function VideoRoomInner({ onLeave }: { onLeave: () => void }) {
  const { localParticipant } = useLocalParticipant();
  const participants = useParticipants();
  const [micEnabled, setMicEnabled] = useState(true);
  const [cameraEnabled, setCameraEnabled] = useState(true);
  const [screenShareEnabled, setScreenShareEnabled] = useState(false);

  const screenTracks = useTracks([Track.Source.ScreenShare]);

  const toggleMic = useCallback(async () => {
    await localParticipant.setMicrophoneEnabled(!micEnabled);
    setMicEnabled(v => !v);
  }, [localParticipant, micEnabled]);

  const toggleCamera = useCallback(async () => {
    await localParticipant.setCameraEnabled(!cameraEnabled);
    setCameraEnabled(v => !v);
  }, [localParticipant, cameraEnabled]);

  const toggleScreenShare = useCallback(async () => {
    await localParticipant.setScreenShareEnabled(!screenShareEnabled);
    setScreenShareEnabled(v => !v);
  }, [localParticipant, screenShareEnabled]);

  // All participants including local
  const allParticipants: (LocalParticipant | RemoteParticipant)[] = [
    localParticipant,
    ...participants.filter(p => p.identity !== localParticipant.identity),
  ];

  // Grid sizing
  const count = allParticipants.length;
  const cols = count <= 1 ? 1 : count <= 4 ? 2 : 3;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1000,
        background: '#070A18',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Header */}
      <div
        style={{
          height: 52,
          padding: '0 20px',
          background: 'rgba(14,18,40,0.9)',
          borderBottom: '1px solid rgba(255,255,255,0.07)',
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          backdropFilter: 'blur(8px)',
        }}
      >
        <div
          style={{
            width: 8,
            height: 8,
            borderRadius: 999,
            background: '#10b981',
            boxShadow: '0 0 8px #10b981',
          }}
        />
        <span
          style={{
            fontFamily: 'Fraunces, serif',
            fontSize: 15,
            fontWeight: 600,
            color: '#fff',
          }}
        >
          Video · {count} participant{count !== 1 ? 's' : ''}
        </span>
        <div style={{ flex: 1 }} />
        <button
          onClick={onLeave}
          style={{
            height: 32,
            padding: '0 14px',
            borderRadius: 999,
            background: 'rgba(239,68,68,0.15)',
            border: '1px solid rgba(239,68,68,0.3)',
            color: '#ef4444',
            fontSize: 13,
            fontWeight: 600,
          }}
        >
          Leave video
        </button>
      </div>

      {/* Screen share banner */}
      {screenTracks.length > 0 && (
        <div style={{ flex: 1, padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ flex: 1, borderRadius: 14, overflow: 'hidden', background: '#000' }}>
            <TrackRefContext.Provider value={screenTracks[0]}>
              <VideoTrack style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
            </TrackRefContext.Provider>
          </div>
          <div
            style={{
              display: 'flex',
              gap: 8,
              overflowX: 'auto',
              paddingBottom: 4,
            }}
          >
            {allParticipants.map(p => (
              <div key={p.identity} style={{ width: 160, flexShrink: 0 }}>
                <VideoParticipant
                  participant={p as RemoteParticipant}
                  isLocal={p.identity === localParticipant.identity}
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Video grid */}
      {screenTracks.length === 0 && (
        <div
          style={{
            flex: 1,
            padding: 16,
            display: 'grid',
            gridTemplateColumns: `repeat(${cols}, 1fr)`,
            gap: 10,
            alignContent: 'center',
            overflowY: 'auto',
          }}
        >
          {allParticipants.map(p => (
            <VideoParticipant
              key={p.identity}
              participant={p as RemoteParticipant}
              isLocal={p.identity === localParticipant.identity}
            />
          ))}
        </div>
      )}

      {/* Audio tracks (invisible but required for remote audio playback) */}
      {participants.map(p => {
        const pub = p.getTrackPublication(Track.Source.Microphone);
        if (!pub?.track) return null;
        return (
          <TrackRefContext.Provider
            key={p.identity}
            value={{ participant: p, publication: pub, source: Track.Source.Microphone }}
          >
            <AudioTrack style={{ display: 'none' }} />
          </TrackRefContext.Provider>
        );
      })}

      {/* Controls */}
      <div
        style={{
          height: 72,
          background: 'rgba(14,18,40,0.95)',
          borderTop: '1px solid rgba(255,255,255,0.07)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 12,
          backdropFilter: 'blur(8px)',
        }}
      >
        <ControlButton
          active={micEnabled}
          activeLabel="🎙 Mic on"
          inactiveLabel="🔇 Muted"
          onClick={toggleMic}
        />
        <ControlButton
          active={cameraEnabled}
          activeLabel="📷 Camera on"
          inactiveLabel="📷 Camera off"
          onClick={toggleCamera}
        />
        <ControlButton
          active={screenShareEnabled}
          activeLabel="🖥 Sharing"
          inactiveLabel="🖥 Share screen"
          onClick={toggleScreenShare}
        />
        <button
          onClick={onLeave}
          style={{
            height: 44,
            padding: '0 22px',
            borderRadius: 999,
            background: '#ef4444',
            color: '#fff',
            fontSize: 14,
            fontWeight: 600,
            border: 'none',
          }}
        >
          Leave
        </button>
      </div>
    </div>
  );
}

function ControlButton({
  active,
  activeLabel,
  inactiveLabel,
  onClick,
}: {
  active: boolean;
  activeLabel: string;
  inactiveLabel: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        height: 44,
        padding: '0 16px',
        borderRadius: 999,
        background: active ? 'rgba(79,70,229,0.18)' : 'rgba(239,68,68,0.12)',
        border: `1px solid ${active ? 'rgba(79,70,229,0.4)' : 'rgba(239,68,68,0.3)'}`,
        color: active ? '#818CF8' : '#ef4444',
        fontSize: 13,
        fontWeight: 600,
        transition: 'all 180ms',
      }}
    >
      {active ? activeLabel : inactiveLabel}
    </button>
  );
}

// ── Placeholder shown when LiveKit is not configured ─────────────────────────

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
        onClick={e => e.stopPropagation()}
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
          Live video rooms with camera, mic, and screen sharing are on their way. We&apos;ll notify you when it&apos;s ready.
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

// ── Main export ───────────────────────────────────────────────────────────────

export default function VideoRoom({ roomName, userName, token, onLeave }: VideoRoomProps) {
  const livekitUrl = process.env.NEXT_PUBLIC_LIVEKIT_URL;

  if (!livekitUrl) {
    return <VideoComingSoon onClose={onLeave} />;
  }

  return (
    <LiveKitRoom
      video={true}
      audio={true}
      token={token}
      serverUrl={livekitUrl}
      onDisconnected={onLeave}
      style={{ height: '100%' }}
    >
      <VideoRoomInner onLeave={onLeave} />
    </LiveKitRoom>
  );
}
