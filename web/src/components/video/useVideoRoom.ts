'use client';

import { useState, useCallback } from 'react';

export interface VideoRoomState {
  open: boolean;
  token: string;
  loading: boolean;
  error: string | null;
}

export function useVideoRoom(roomName: string, userName: string, userId?: string) {
  const [state, setState] = useState<VideoRoomState>({
    open: false,
    token: '',
    loading: false,
    error: null,
  });

  const joinVideo = useCallback(async () => {
    // If LiveKit URL is not set, open anyway — VideoRoom will show the placeholder
    if (!process.env.NEXT_PUBLIC_LIVEKIT_URL) {
      setState(s => ({ ...s, open: true, token: '' }));
      return;
    }

    setState(s => ({ ...s, loading: true, error: null }));
    try {
      const res = await fetch('/api/livekit-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        // userId becomes the LiveKit identity so chat ownership + LiveBoard
        // marker handoff key off the same profile id.
        body: JSON.stringify({ roomName, userName, userId }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setState({ open: true, token: data.token, loading: false, error: null });
    } catch (err) {
      setState(s => ({
        ...s,
        loading: false,
        error: (err as Error).message,
        // Still open — VideoRoom will show coming-soon if unconfigured
        open: true,
        token: '',
      }));
    }
  }, [roomName, userName, userId]);

  const leaveVideo = useCallback(() => {
    setState({ open: false, token: '', loading: false, error: null });
  }, []);

  return { ...state, joinVideo, leaveVideo };
}
