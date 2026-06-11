'use client';

import { useCallback, useEffect, useRef, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

type Turn = { id: string; role: 'ai' | 'user'; content: string; audio_url: string | null };
type SessionMeta = { id: string; interview_format: string | null; prompt: string | null; started_at: string | null };

const BG = '#0f1226';
const PANEL_BG = '#1a1e3a';

export default function AiInterviewPage({ params }: { params: Promise<{ sessionId: string }> }) {
  const { sessionId } = use(params);
  const router = useRouter();
  const [turns, setTurns] = useState<Turn[]>([]);
  const [meta, setMeta] = useState<SessionMeta | null>(null);
  const [state, setState] = useState<'idle' | 'listening' | 'thinking' | 'speaking' | 'ended'>('idle');
  const [error, setError] = useState<string | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const audioElRef = useRef<HTMLAudioElement | null>(null);
  const recRef = useRef<MediaRecorder | null>(null);
  const recChunksRef = useRef<BlobPart[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const startedAtRef = useRef<number>(Date.now());
  const transcriptRef = useRef<HTMLDivElement | null>(null);

  // Load session metadata + existing transcript on mount.
  useEffect(() => {
    const supabase = createClient();
    (async () => {
      const [{ data: s }, { data: t }] = await Promise.all([
        supabase.from('interview_sessions').select('id, interview_format, prompt, started_at').eq('id', sessionId).maybeSingle(),
        supabase.from('interview_transcripts').select('id, role, content, audio_url').eq('session_id', sessionId).order('created_at', { ascending: true }),
      ]);
      if (s) setMeta(s as unknown as SessionMeta);
      if (t) setTurns(t as unknown as Turn[]);
      // Auto-play the opening AI turn if it has audio.
      const opening = (t ?? []).find(x => x.role === 'ai');
      if (opening?.audio_url) {
        playAudio(opening.audio_url);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId]);

  // Session timer.
  useEffect(() => {
    startedAtRef.current = Date.now();
    const t = setInterval(() => setElapsed(Math.floor((Date.now() - startedAtRef.current) / 1000)), 1000);
    return () => clearInterval(t);
  }, []);

  // Auto-scroll the transcript on new turns.
  useEffect(() => {
    if (transcriptRef.current) transcriptRef.current.scrollTop = transcriptRef.current.scrollHeight;
  }, [turns.length]);

  // ── Audio playback (AI speaking) ─────────────────────────────────────
  const playAudio = useCallback((url: string) => {
    setState('speaking');
    if (!audioElRef.current) audioElRef.current = new Audio();
    const el = audioElRef.current;
    el.src = url;
    el.onended = () => setState('ended-check' as unknown as 'idle');
    el.play().catch(() => { setState('idle'); });
  }, []);

  // Reset to idle when "speaking" → "ended-check" we briefly set above.
  useEffect(() => {
    if ((state as string) === 'ended-check') setState('idle');
  }, [state]);

  const stopAudio = () => {
    audioElRef.current?.pause();
    if (audioElRef.current) audioElRef.current.currentTime = 0;
    setState('idle');
  };

  // ── Recording (user speaking) ────────────────────────────────────────
  const startRecording = useCallback(async () => {
    if (state !== 'idle' && state !== 'speaking') return;
    if (state === 'speaking') stopAudio();
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true } });
      streamRef.current = stream;
      const mr = new MediaRecorder(stream, { mimeType: 'audio/webm;codecs=opus' });
      recChunksRef.current = [];
      mr.ondataavailable = (e) => { if (e.data.size > 0) recChunksRef.current.push(e.data); };
      mr.start();
      recRef.current = mr;
      setState('listening');
    } catch {
      setError('Microphone unavailable. Check permissions.');
      setState('idle');
    }
  }, [state]);

  const stopRecording = useCallback(async () => {
    const mr = recRef.current;
    if (!mr) return;
    const blob: Blob = await new Promise(resolve => {
      mr.onstop = () => resolve(new Blob(recChunksRef.current, { type: 'audio/webm' }));
      mr.stop();
    });
    streamRef.current?.getTracks().forEach(t => t.stop());
    streamRef.current = null;
    recRef.current = null;
    if (blob.size < 800) { setState('idle'); return; } // <0.5s of audio — likely a tap

    setState('thinking');
    try {
      const fd = new FormData();
      fd.append('sessionId', sessionId);
      fd.append('audio', blob, 'turn.webm');
      const res = await fetch('/api/ai-interview/respond', { method: 'POST', body: fd });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'AI failed');
        setState('idle');
        return;
      }
      setTurns(prev => [
        ...prev,
        { id: `u-${Date.now()}`, role: 'user', content: data.userText, audio_url: null },
        { id: `a-${Date.now()}`, role: 'ai', content: data.aiResponseText, audio_url: data.aiResponseAudioUrl },
      ]);
      if (data.aiResponseAudioUrl) {
        playAudio(data.aiResponseAudioUrl);
      } else {
        setState('idle');
      }
      if (data.sessionShouldEnd) {
        setTimeout(() => endInterview(), 1200);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Network error');
      setState('idle');
    }
  }, [sessionId, playAudio]);

  // Spacebar = hold-to-talk.
  useEffect(() => {
    const isInputFocused = () => {
      const a = document.activeElement;
      return a && (a.tagName === 'INPUT' || a.tagName === 'TEXTAREA' || (a as HTMLElement).isContentEditable);
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.code !== 'Space' || e.repeat || isInputFocused()) return;
      e.preventDefault();
      startRecording();
    };
    const onKeyUp = (e: KeyboardEvent) => {
      if (e.code !== 'Space' || isInputFocused()) return;
      e.preventDefault();
      stopRecording();
    };
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
    };
  }, [startRecording, stopRecording]);

  const endInterview = useCallback(async () => {
    setState('thinking');
    try {
      await fetch('/api/ai-interview/end', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ sessionId }) });
    } catch { /* result page will retry */ }
    router.push(`/interview/ai/${sessionId}/result`);
  }, [sessionId, router]);

  // Count question turns for sidebar.
  const aiQuestionCount = turns.filter(t => t.role === 'ai').length;

  return (
    <div style={{ position: 'fixed', inset: 0, background: BG, color: '#e8ecff', display: 'flex', flexDirection: 'column' }}>
      {/* Top bar */}
      <div style={{ height: 60, padding: '0 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(15,18,38,0.95)', borderBottom: '1px solid rgba(255,255,255,0.06)', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontFamily: 'Fraunces, serif', fontSize: 16, fontWeight: 700 }}>ELM AI Mock Interview</span>
          {meta?.interview_format && (
            <span style={{ padding: '3px 10px', borderRadius: 999, background: 'rgba(79,70,229,0.18)', color: '#b8c4f4', fontSize: 11, fontWeight: 700 }}>{meta.interview_format}</span>
          )}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 13, color: '#b6bbcd' }}>{fmt(elapsed)}</span>
          <button onClick={endInterview} style={{ height: 36, padding: '0 14px', borderRadius: 10, background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.4)', color: '#f87171', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>End interview</button>
        </div>
      </div>

      <div style={{ flex: 1, display: 'flex', minHeight: 0 }}>
        {/* Transcript */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
          <div ref={transcriptRef} style={{ flex: 1, overflowY: 'auto', padding: '24px max(24px, 8vw)', display: 'flex', flexDirection: 'column', gap: 16 }}>
            {turns.length === 0 && <div style={{ color: '#8b91a8', fontSize: 13, textAlign: 'center', paddingTop: 80 }}>Preparing your interviewer…</div>}
            {turns.map((t) => (
              <Bubble key={t.id} role={t.role} content={t.content} audioUrl={t.audio_url} onPlay={(u) => playAudio(u)} />
            ))}
          </div>

          {/* Status + Hold-to-Talk */}
          <div style={{ padding: '14px 20px 24px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, borderTop: '1px solid rgba(255,255,255,0.06)', background: 'rgba(15,18,38,0.85)', flexShrink: 0 }}>
            <StatusLine state={state} />
            <button
              onMouseDown={startRecording}
              onMouseUp={stopRecording}
              onTouchStart={(e) => { e.preventDefault(); startRecording(); }}
              onTouchEnd={(e) => { e.preventDefault(); stopRecording(); }}
              disabled={state === 'thinking'}
              style={{
                width: 96, height: 96, borderRadius: 999,
                background: state === 'listening'
                  ? 'linear-gradient(135deg, #f43f5e, #ef4444)'
                  : state === 'thinking'
                  ? 'rgba(255,255,255,0.08)'
                  : 'var(--gradient-brand, linear-gradient(135deg,#1B2B8E,#3D52CC))',
                color: '#fff', border: 'none', fontSize: 32, cursor: state === 'thinking' ? 'wait' : 'pointer',
                boxShadow: state === 'listening' ? '0 0 0 12px rgba(239,68,68,0.18)' : '0 8px 24px rgba(34,54,176,0.45)',
                transition: 'all 200ms',
              }}
              aria-label="Hold to talk"
            >
              {state === 'listening' ? '🔴' : state === 'thinking' ? '⏳' : '🎙️'}
            </button>
            <span style={{ fontSize: 11, color: '#8b91a8' }}>Hold to talk · or press <kbd style={{ padding: '1px 6px', borderRadius: 4, background: 'rgba(255,255,255,0.08)', fontFamily: 'inherit' }}>Space</kbd></span>
            {state === 'speaking' && (
              <button onClick={stopAudio} style={{ height: 30, padding: '0 14px', borderRadius: 999, background: 'rgba(255,255,255,0.08)', color: '#e8ecff', border: '1px solid rgba(255,255,255,0.12)', fontSize: 12, cursor: 'pointer' }}>Stop AI</button>
            )}
            {error && <div style={{ fontSize: 12, color: '#f87171' }}>{error}</div>}
          </div>
        </div>

        {/* Right sidebar */}
        {sidebarOpen && (
          <aside style={{ width: 280, background: PANEL_BG, borderLeft: '1px solid rgba(255,255,255,0.06)', padding: 18, display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontFamily: 'Fraunces, serif', fontSize: 14, fontWeight: 700 }}>Session</div>
              <button onClick={() => setSidebarOpen(false)} style={{ background: 'transparent', border: 'none', color: '#8b91a8', cursor: 'pointer', fontSize: 16 }}>×</button>
            </div>
            <InfoRow label="Format" value={meta?.interview_format ?? '—'} />
            <InfoRow label="Topic" value={meta?.prompt ?? '—'} />
            <InfoRow label="Elapsed" value={fmt(elapsed)} mono />
            <InfoRow label="Questions" value={String(Math.max(0, aiQuestionCount - 1))} mono />
            <div style={{ marginTop: 'auto', fontSize: 11, color: '#8b91a8', lineHeight: 1.5 }}>
              Hold the button or Space to talk. Release to send. The interview will wrap up after 8–12 substantive questions.
            </div>
          </aside>
        )}
        {!sidebarOpen && (
          <button onClick={() => setSidebarOpen(true)} style={{ position: 'absolute', top: 70, right: 16, width: 34, height: 34, borderRadius: 8, background: PANEL_BG, color: '#b6bbcd', border: '1px solid rgba(255,255,255,0.08)', cursor: 'pointer' }}>⋯</button>
        )}
      </div>
    </div>
  );
}

function Bubble({ role, content, audioUrl, onPlay }: { role: 'ai' | 'user'; content: string; audioUrl: string | null; onPlay: (url: string) => void }) {
  const isAi = role === 'ai';
  return (
    <div style={{ display: 'flex', justifyContent: isAi ? 'flex-start' : 'flex-end' }}>
      <div style={{ maxWidth: 640, padding: '12px 16px', borderRadius: isAi ? '14px 14px 14px 4px' : '14px 14px 4px 14px', background: isAi ? 'rgba(255,255,255,0.06)' : 'linear-gradient(135deg, #1B2B8E, #3D52CC)', color: '#fff', fontSize: 14, lineHeight: 1.55, position: 'relative' }}>
        {isAi && <div style={{ fontSize: 11, fontWeight: 700, color: '#b6bbcd', marginBottom: 4 }}>ELM AI Interviewer</div>}
        <div style={{ whiteSpace: 'pre-wrap' }}>{content}</div>
        {audioUrl && (
          <button onClick={() => onPlay(audioUrl)} title="Replay" style={{ position: 'absolute', top: 8, right: 8, width: 24, height: 24, borderRadius: 999, background: 'rgba(0,0,0,0.25)', color: '#fff', border: 'none', fontSize: 11, cursor: 'pointer' }}>▶</button>
        )}
      </div>
    </div>
  );
}

function StatusLine({ state }: { state: string }) {
  const map: Record<string, { text: string; color: string }> = {
    idle: { text: 'Ready when you are', color: '#8b91a8' },
    listening: { text: 'Listening…', color: '#f87171' },
    thinking: { text: 'AI is thinking…', color: '#fbbf24' },
    speaking: { text: 'AI is speaking', color: '#34d399' },
  };
  const s = map[state] ?? map.idle;
  return <span style={{ fontSize: 12, fontWeight: 600, color: s.color }}>{s.text}</span>;
}

function InfoRow({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div>
      <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', color: '#8b91a8', textTransform: 'uppercase', marginBottom: 2 }}>{label}</div>
      <div style={{ fontSize: 13, fontWeight: 600, fontFamily: mono ? 'JetBrains Mono, monospace' : 'inherit' }}>{value}</div>
    </div>
  );
}

function fmt(s: number) {
  const m = Math.floor(s / 60), sec = s % 60;
  return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
}
