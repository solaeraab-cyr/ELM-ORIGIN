'use client';

import { useEffect, useState } from 'react';
import { ParticipantContextIfNeeded, ParticipantName, TrackRefContext, VideoTrack, useIsSpeaking } from '@livekit/components-react';
import { Participant, Track } from 'livekit-client';

interface VideoParticipantProps {
  participant: Participant;
  isLocal?: boolean;
}

export default function VideoParticipant({ participant, isLocal }: VideoParticipantProps) {
  const isSpeaking = useIsSpeaking(participant);

  // Poll mute/camera state from participant object directly
  const [isMicMuted, setIsMicMuted] = useState(false);
  const [isCameraOff, setIsCameraOff] = useState(false);

  useEffect(() => {
    const update = () => {
      setIsMicMuted(!!(participant.getTrackPublication(Track.Source.Microphone)?.isMuted));
      setIsCameraOff(!participant.isCameraEnabled);
    };
    update();
    participant.on('trackMuted', update);
    participant.on('trackUnmuted', update);
    participant.on('trackPublished', update);
    participant.on('trackUnpublished', update);
    return () => {
      participant.off('trackMuted', update);
      participant.off('trackUnmuted', update);
      participant.off('trackPublished', update);
      participant.off('trackUnpublished', update);
    };
  }, [participant]);

  const cameraPublication = participant.getTrackPublication(Track.Source.Camera);

  return (
    <ParticipantContextIfNeeded participant={participant}>
      <div
        style={{
          position: 'relative',
          width: '100%',
          aspectRatio: '16/9',
          borderRadius: 14,
          overflow: 'hidden',
          background: '#0E1228',
          border: `2px solid ${isSpeaking ? '#10b981' : 'rgba(255,255,255,0.08)'}`,
          transition: 'border-color 200ms',
        }}
      >
        {/* Video track */}
        {cameraPublication?.track && !isCameraOff ? (
          <TrackRefContext.Provider
            value={{ participant, publication: cameraPublication, source: Track.Source.Camera }}
          >
            <VideoTrack style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </TrackRefContext.Provider>
        ) : (
          <div
            style={{
              width: '100%',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'linear-gradient(135deg, rgba(27,43,142,0.13), rgba(14,18,40,0.55))',
            }}
          >
            <div
              style={{
                width: 56,
                height: 56,
                borderRadius: 999,
                background: 'var(--gradient-brand)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 22,
                fontWeight: 700,
                color: '#fff',
                fontFamily: 'Fraunces, serif',
              }}
            >
              {(participant.name ?? '?').charAt(0).toUpperCase()}
            </div>
          </div>
        )}

        {/* Name + status overlay */}
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            padding: '20px 10px 8px',
            background: 'linear-gradient(to top, rgba(7,10,24,0.85), transparent)',
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'space-between',
          }}
        >
          <ParticipantName
            participant={participant}
            style={{ fontSize: 12, fontWeight: 600, color: '#fff' }}
          />
          <div style={{ display: 'flex', gap: 4 }}>
            {isMicMuted && (
              <span
                title="Microphone muted"
                style={{
                  width: 20,
                  height: 20,
                  borderRadius: 999,
                  background: 'rgba(239,68,68,0.85)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 10,
                }}
              >
                🔇
              </span>
            )}
            {isLocal && (
              <span
                style={{
                  padding: '2px 6px',
                  borderRadius: 999,
                  background: 'rgba(16,185,129,0.75)',
                  color: '#fff',
                  fontSize: 9,
                  fontWeight: 700,
                  letterSpacing: '0.05em',
                }}
              >
                YOU
              </span>
            )}
          </div>
        </div>
      </div>
    </ParticipantContextIfNeeded>
  );
}
