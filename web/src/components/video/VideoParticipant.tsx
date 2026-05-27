'use client';

import { useEffect, useState, useCallback } from 'react';
import {
  ParticipantContextIfNeeded,
  TrackRefContext,
  VideoTrack,
  useIsSpeaking,
} from '@livekit/components-react';
import { ConnectionQuality, Participant, Track } from 'livekit-client';

interface VideoParticipantProps {
  participant: Participant;
  isLocal?: boolean;
  /** Smaller chrome for filmstrip thumbnails (screen-share mode). */
  compact?: boolean;
}

/* ── Tiny inline icons ──────────────────────────────────────────────────── */
const MicMutedIcon = ({ size = 14 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path d="M3 3l18 18" stroke="#f87171" strokeWidth="2" strokeLinecap="round" />
    <path
      d="M9 9v3a3 3 0 0 0 5.1 2.1M12 4a3 3 0 0 1 3 3v4"
      stroke="#f87171"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M5 11a7 7 0 0 0 .8 3.2M19 11a7 7 0 0 1-3.5 6M12 19v3"
      stroke="#f87171"
      strokeWidth="2"
      strokeLinecap="round"
    />
  </svg>
);

const CamOffIcon = ({ size = 14 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path
      d="M16 16H4a2 2 0 0 1-2-2V7a2 2 0 0 1 .59-1.41M10 5h4a2 2 0 0 1 2 2v3l4-3v8"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path d="M3 3l18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

const PinIcon = () => (
  <svg width={14} height={14} viewBox="0 0 24 24" fill="none">
    <path
      d="M12 17v5M9 3h6l-1 7h4l-6 8 1-5H7l2-10z"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const StarIcon = () => (
  <svg width={12} height={12} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 22 12 18.56 5.82 22 7 14.14l-5-4.87 6.91-1.01z" />
  </svg>
);

const QUALITY_COLOR: Record<string, string> = {
  excellent: '#34d399',
  good: '#fbbf24',
  poor: '#f87171',
  lost: '#f87171',
  unknown: 'transparent',
};

export default function VideoParticipant({
  participant,
  isLocal,
  compact,
}: VideoParticipantProps) {
  const isSpeaking = useIsSpeaking(participant);

  const [isMicMuted, setIsMicMuted] = useState(false);
  const [isCameraOff, setIsCameraOff] = useState(false);
  const [quality, setQuality] = useState<string>('unknown');
  const [pinned, setPinned] = useState(false);

  useEffect(() => {
    const update = () => {
      setIsMicMuted(
        !!participant.getTrackPublication(Track.Source.Microphone)?.isMuted,
      );
      setIsCameraOff(!participant.isCameraEnabled);
    };
    const updateQuality = (q: ConnectionQuality) => setQuality(String(q));
    update();
    setQuality(String(participant.connectionQuality));
    participant.on('trackMuted', update);
    participant.on('trackUnmuted', update);
    participant.on('trackPublished', update);
    participant.on('trackUnpublished', update);
    participant.on('connectionQualityChanged', updateQuality);
    return () => {
      participant.off('trackMuted', update);
      participant.off('trackUnmuted', update);
      participant.off('trackPublished', update);
      participant.off('trackUnpublished', update);
      participant.off('connectionQualityChanged', updateQuality);
    };
  }, [participant]);

  const cameraPublication = participant.getTrackPublication(Track.Source.Camera);
  const displayName =
    participant.name || participant.identity.split('__')[0] || 'Guest';
  const qualityColor = QUALITY_COLOR[quality] ?? 'transparent';

  // Deterministic "star score" based on identity for visual demo purposes.
  // In production, this would come from a focus-points / session-duration backend.
  const starScore = Math.abs(
    displayName.split('').reduce((a, c) => a + c.charCodeAt(0), 0) % 100,
  );

  return (
    <ParticipantContextIfNeeded participant={participant}>
      <div
        style={{
          position: 'relative',
          width: '100%',
          aspectRatio: compact ? '16 / 9' : '4 / 3',
          borderRadius: compact ? 8 : 10,
          overflow: 'hidden',
          background: 'linear-gradient(135deg, #1f2440 0%, #12162e 100%)',
          border: `2px solid ${
            isSpeaking
              ? 'var(--brand-400, #3D52CC)'
              : 'rgba(255,255,255,0.06)'
          }`,
          boxShadow: isSpeaking
            ? '0 0 0 2px rgba(61,82,204,0.45), 0 4px 16px rgba(0,0,0,0.4)'
            : '0 2px 10px rgba(0,0,0,0.3)',
          transition: 'border-color 180ms ease, box-shadow 180ms ease',
          cursor: 'default',
        }}
      >
        {/* ── Video / avatar ─────────────────────────────────────────── */}
        {cameraPublication?.track && !isCameraOff ? (
          <TrackRefContext.Provider
            value={{
              participant,
              publication: cameraPublication,
              source: Track.Source.Camera,
            }}
          >
            <VideoTrack
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
              }}
            />
          </TrackRefContext.Provider>
        ) : (
          <div
            style={{
              width: '100%',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <div
              style={{
                width: compact ? 36 : 56,
                height: compact ? 36 : 56,
                borderRadius: 999,
                background:
                  'var(--gradient-brand, linear-gradient(135deg,#1B2B8E,#3D52CC))',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: compact ? 15 : 22,
                fontWeight: 700,
                color: '#fff',
                fontFamily: 'Fraunces, serif',
                boxShadow: '0 4px 18px rgba(0,0,0,0.4)',
              }}
            >
              {displayName.charAt(0).toUpperCase()}
            </div>
          </div>
        )}

        {/* ── Top-left: pin + star score ─────────────────────────────── */}
        {!compact && (
          <div
            style={{
              position: 'absolute',
              top: 6,
              left: 6,
              display: 'flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            <button
              onClick={() => setPinned((p) => !p)}
              title="Pin participant"
              style={{
                width: 26,
                height: 26,
                borderRadius: 6,
                border: 'none',
                background: pinned
                  ? 'rgba(61,82,204,0.8)'
                  : 'rgba(0,0,0,0.45)',
                backdropFilter: 'blur(4px)',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'background 150ms',
              }}
            >
              <PinIcon />
            </button>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 3,
                padding: '3px 8px 3px 6px',
                borderRadius: 6,
                background: 'rgba(0,0,0,0.45)',
                backdropFilter: 'blur(4px)',
                color: '#fbbf24',
                fontSize: 11,
                fontWeight: 700,
                fontFamily: 'JetBrains Mono, monospace',
              }}
            >
              <StarIcon />
              {starScore}
            </div>
          </div>
        )}

        {/* ── Top-right: connection quality + status icons ────────── */}
        <div
          style={{
            position: 'absolute',
            top: 6,
            right: 6,
            display: 'flex',
            alignItems: 'center',
            gap: 5,
          }}
        >
          {isCameraOff && (
            <div
              style={{
                width: 26,
                height: 26,
                borderRadius: 6,
                background: 'rgba(0,0,0,0.45)',
                backdropFilter: 'blur(4px)',
                color: '#f87171',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <CamOffIcon size={14} />
            </div>
          )}
          {quality !== 'unknown' && (
            <div
              title={`Connection: ${quality}`}
              style={{
                width: 26,
                height: 26,
                borderRadius: 6,
                background: 'rgba(0,0,0,0.45)',
                backdropFilter: 'blur(4px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <div
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: 999,
                  background: qualityColor,
                  boxShadow: `0 0 6px ${qualityColor}`,
                }}
              />
            </div>
          )}
        </div>

        {/* ── Bottom overlay: name + mic status ──────────────────── */}
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            padding: compact ? '16px 8px 6px' : '28px 10px 8px',
            background:
              'linear-gradient(to top, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.35) 60%, transparent 100%)',
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'space-between',
            gap: 4,
          }}
        >
          {/* Left: avatar + name + subject */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              minWidth: 0,
              flex: 1,
            }}
          >
            {/* Mini avatar badge */}
            {!compact && (
              <div
                style={{
                  width: 24,
                  height: 24,
                  borderRadius: 999,
                  background:
                    'var(--gradient-brand, linear-gradient(135deg,#1B2B8E,#3D52CC))',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 10,
                  fontWeight: 700,
                  color: '#fff',
                  fontFamily: 'Fraunces, serif',
                  flexShrink: 0,
                  border: '1.5px solid rgba(255,255,255,0.25)',
                }}
              >
                {displayName.charAt(0).toUpperCase()}
              </div>
            )}
            <div style={{ minWidth: 0 }}>
              <div
                style={{
                  fontSize: compact ? 11 : 12,
                  fontWeight: 600,
                  color: '#fff',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  textShadow: '0 1px 4px rgba(0,0,0,0.7)',
                  lineHeight: 1.2,
                }}
              >
                {displayName}
                {isLocal && (
                  <span style={{ opacity: 0.6, fontWeight: 400 }}> (You)</span>
                )}
              </div>
              {/* Subject / status line — placeholder for future feature */}
              {!compact && (
                <div
                  style={{
                    fontSize: 10,
                    color: 'rgba(255,255,255,0.6)',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    lineHeight: 1.3,
                    marginTop: 1,
                  }}
                >
                  {isLocal ? 'Studying' : 'Focus session'}
                </div>
              )}
            </div>
          </div>

          {/* Right: mic muted indicator */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0 }}>
            {isMicMuted && (
              <div
                style={{
                  width: 24,
                  height: 24,
                  borderRadius: 6,
                  background: 'rgba(248,113,113,0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <MicMutedIcon size={13} />
              </div>
            )}
          </div>
        </div>
      </div>
    </ParticipantContextIfNeeded>
  );
}
