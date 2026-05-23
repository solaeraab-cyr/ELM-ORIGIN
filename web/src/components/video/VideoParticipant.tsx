'use client';

import { useEffect, useState } from 'react';
import { ParticipantContextIfNeeded, TrackRefContext, VideoTrack, useIsSpeaking } from '@livekit/components-react';
import { ConnectionQuality, Participant, Track } from 'livekit-client';

interface VideoParticipantProps {
  participant: Participant;
  isLocal?: boolean;
  /** Smaller chrome for filmstrip thumbnails. */
  compact?: boolean;
}

const QUALITY_COLOR: Record<string, string> = {
  excellent: '#34d399',
  good: '#fbbf24',
  poor: '#f87171',
  lost: '#f87171',
  unknown: 'transparent',
};

export default function VideoParticipant({ participant, isLocal, compact }: VideoParticipantProps) {
  const isSpeaking = useIsSpeaking(participant);

  const [isMicMuted, setIsMicMuted] = useState(false);
  const [isCameraOff, setIsCameraOff] = useState(false);
  const [quality, setQuality] = useState<string>('unknown');

  useEffect(() => {
    const update = () => {
      setIsMicMuted(!!(participant.getTrackPublication(Track.Source.Microphone)?.isMuted));
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
  const displayName = participant.name || participant.identity.split('__')[0] || 'Guest';
  const qualityColor = QUALITY_COLOR[quality] ?? 'transparent';

  return (
    <ParticipantContextIfNeeded participant={participant}>
      <div
        style={{
          position: 'relative',
          width: '100%',
          height: '100%',
          aspectRatio: '16 / 9',
          borderRadius: 12,
          overflow: 'hidden',
          background: 'linear-gradient(135deg, #1f2440 0%, #12162e 100%)',
          border: `2px solid ${isSpeaking ? 'var(--brand-400, #3D52CC)' : 'rgba(255,255,255,0.06)'}`,
          boxShadow: isSpeaking
            ? '0 0 0 2px rgba(61,82,204,0.45), 0 8px 30px rgba(0,0,0,0.45)'
            : '0 6px 22px rgba(0,0,0,0.35)',
          transition: 'border-color 180ms ease, box-shadow 180ms ease',
        }}
      >
        {cameraPublication?.track && !isCameraOff ? (
          <TrackRefContext.Provider
            value={{ participant, publication: cameraPublication, source: Track.Source.Camera }}
          >
            <VideoTrack
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              // Mirror only the local camera, like Google Meet.
              {...(isLocal ? { 'data-lk-local-participant': true } : {})}
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
                width: compact ? 40 : 64,
                height: compact ? 40 : 64,
                borderRadius: 999,
                background: 'var(--gradient-brand, linear-gradient(135deg,#1B2B8E,#3D52CC))',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: compact ? 16 : 26,
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

        {/* Connection quality dot */}
        {quality !== 'unknown' && (
          <div
            title={`Connection: ${quality}`}
            style={{
              position: 'absolute',
              top: 8,
              right: 8,
              width: 9,
              height: 9,
              borderRadius: 999,
              background: qualityColor,
              boxShadow: `0 0 8px ${qualityColor}`,
              border: '1px solid rgba(0,0,0,0.3)',
            }}
          />
        )}

        {/* Name + status overlay */}
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            padding: compact ? '14px 8px 6px' : '24px 12px 9px',
            background: 'linear-gradient(to top, rgba(0,0,0,0.7), transparent)',
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'space-between',
            gap: 6,
          }}
        >
          <span
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              fontSize: compact ? 11 : 13,
              fontWeight: 600,
              color: '#fff',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              textShadow: '0 1px 3px rgba(0,0,0,0.6)',
            }}
          >
            {isMicMuted && (
              <svg width={compact ? 12 : 14} height={compact ? 12 : 14} viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0 }}>
                <path d="M3 3l18 18" stroke="#f87171" strokeWidth="2" strokeLinecap="round" />
                <path d="M9 9v3a3 3 0 0 0 5.1 2.1M12 4a3 3 0 0 1 3 3v4" stroke="#f87171" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M5 11a7 7 0 0 0 .8 3.2M19 11a7 7 0 0 1-3.5 6M12 19v3" stroke="#f87171" strokeWidth="2" strokeLinecap="round" />
              </svg>
            )}
            {displayName}
            {isLocal && ' (You)'}
          </span>
        </div>
      </div>
    </ParticipantContextIfNeeded>
  );
}
