'use client';

import { useEffect, useRef, useState } from 'react';
import { ParticipantContextIfNeeded, useIsSpeaking } from '@livekit/components-react';
import { ConnectionQuality, Participant, Track } from 'livekit-client';

interface VideoParticipantProps {
  participant: Participant;
  isLocal?: boolean;
  compact?: boolean;
}

const MicMutedIcon = ({ size = 14 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path d="M3 3l18 18" stroke="#f87171" strokeWidth="2" strokeLinecap="round" />
    <path d="M9 9v3a3 3 0 0 0 5.1 2.1M12 4a3 3 0 0 1 3 3v4" stroke="#f87171" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M5 11a7 7 0 0 0 .8 3.2M19 11a7 7 0 0 1-3.5 6M12 19v3" stroke="#f87171" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

const QUALITY_COLOR: Record<string, string> = {
  excellent: '#34d399', good: '#fbbf24', poor: '#f87171', lost: '#f87171', unknown: 'transparent',
};

export default function VideoParticipant({ participant, isLocal, compact }: VideoParticipantProps) {
  const isSpeaking = useIsSpeaking(participant);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isMicMuted, setIsMicMuted] = useState(false);
  const [isCameraOff, setIsCameraOff] = useState(false);
  const [quality, setQuality] = useState<string>('unknown');

  // Manually attach video track to <video> element — NO LiveKit VideoTrack component.
  // This gives us full control: no mirror, no transform, no adaptive downscaling.
  useEffect(() => {
    const el = videoRef.current;
    if (!el) return;

    const attach = () => {
      const pub = participant.getTrackPublication(Track.Source.Camera);
      if (pub?.track && !pub.isMuted) {
        pub.track.attach(el);
        setIsCameraOff(false);
      } else {
        // Detach WITHOUT stopping the underlying track.
        // LiveKit owns the track lifecycle — calling .stop() on a remote
        // track would break it re-appearing when they re-enable their camera.
        if (pub?.track) {
          pub.track.detach(el);
        } else {
          el.srcObject = null;
        }
        setIsCameraOff(true);
      }
    };

    attach();

    participant.on('trackSubscribed', attach);
    participant.on('trackUnsubscribed', attach);
    participant.on('trackMuted', attach);
    participant.on('trackUnmuted', attach);
    participant.on('trackPublished', attach);
    participant.on('trackUnpublished', attach);

    return () => {
      participant.off('trackSubscribed', attach);
      participant.off('trackUnsubscribed', attach);
      participant.off('trackMuted', attach);
      participant.off('trackUnmuted', attach);
      participant.off('trackPublished', attach);
      participant.off('trackUnpublished', attach);
      // Detach on unmount
      const pub = participant.getTrackPublication(Track.Source.Camera);
      if (pub?.track && el) {
        pub.track.detach(el);
      }
    };
  }, [participant]);

  // Track mic status
  useEffect(() => {
    const update = () => {
      setIsMicMuted(!!participant.getTrackPublication(Track.Source.Microphone)?.isMuted);
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

  const displayName = participant.name || participant.identity.split('__')[0] || 'Guest';
  const qualityColor = QUALITY_COLOR[quality] ?? 'transparent';

  return (
    <ParticipantContextIfNeeded participant={participant}>
      <div style={{
        position: 'relative', width: '100%', height: '100%', aspectRatio: '16 / 9',
        borderRadius: compact ? 8 : 14, overflow: 'hidden',
        background: 'linear-gradient(135deg, #1f2440 0%, #12162e 100%)',
        border: `2.5px solid ${isSpeaking ? 'var(--brand-400, #3D52CC)' : 'rgba(255,255,255,0.06)'}`,
        boxShadow: isSpeaking
          ? '0 0 0 3px rgba(61,82,204,0.35), 0 8px 30px rgba(0,0,0,0.45)'
          : '0 6px 22px rgba(0,0,0,0.35)',
        transition: 'border-color 200ms ease, box-shadow 200ms ease',
      }}>
        {/* RAW video element — zero transforms, zero LiveKit CSS */}
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted={isLocal}
          style={{
            position: 'absolute', inset: 0, width: '100%', height: '100%',
            objectFit: 'cover',
            // ABSOLUTELY NO MIRROR. This is a raw element, nothing can override it.
            transform: 'none',
            display: isCameraOff ? 'none' : 'block',
          }}
        />

        {/* Avatar fallback when camera off */}
        {isCameraOff && (
          <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{
              width: compact ? 40 : 72, height: compact ? 40 : 72, borderRadius: 999,
              background: 'var(--gradient-brand, linear-gradient(135deg,#1B2B8E,#3D52CC))',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: compact ? 16 : 28, fontWeight: 700, color: '#fff',
              fontFamily: 'Fraunces, serif', boxShadow: '0 4px 18px rgba(0,0,0,0.4)',
            }}>
              {displayName.charAt(0).toUpperCase()}
            </div>
          </div>
        )}

        {/* Connection quality dot */}
        {quality !== 'unknown' && (
          <div title={`Connection: ${quality}`} style={{
            position: 'absolute', top: 10, right: 10,
            width: 10, height: 10, borderRadius: 999,
            background: qualityColor, boxShadow: `0 0 8px ${qualityColor}`,
            border: '1.5px solid rgba(0,0,0,0.3)',
          }} />
        )}

        {/* Name + mic overlay */}
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0,
          padding: compact ? '16px 8px 7px' : '28px 14px 10px',
          background: 'linear-gradient(to top, rgba(0,0,0,0.72), transparent)',
          display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 6,
        }}>
          <span style={{
            display: 'flex', alignItems: 'center', gap: 6,
            fontSize: compact ? 11 : 14, fontWeight: 600, color: '#fff',
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            textShadow: '0 1px 4px rgba(0,0,0,0.7)',
          }}>
            {isMicMuted && <MicMutedIcon size={compact ? 12 : 15} />}
            {displayName}
            {isLocal && <span style={{ opacity: 0.55, fontWeight: 400, marginLeft: 2 }}>(You)</span>}
          </span>
        </div>
      </div>
    </ParticipantContextIfNeeded>
  );
}
