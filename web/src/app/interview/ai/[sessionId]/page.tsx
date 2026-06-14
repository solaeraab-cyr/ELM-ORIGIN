'use client';

import { useCallback, useEffect, useRef, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

type Turn = { id: string; role: 'ai' | 'user'; content: string };
type SessionMeta = { id: string; interview_format: string | null; prompt: string | null; started_at: string | null };
type UiState = 'idle' | 'connecting' | 'speaking' | 'listening' | 'thinking' | 'muted';

const BG = '#0f1226';
const PANEL_BG = '#1a1e3a';

// Browser-TTS fallback picker — only used if /api/ai-interview/speak fails.
function pickBrowserVoice(voices: SpeechSynthesisVoice[]): SpeechSynthesisVoice | null {
  if (!voices.length) return null;
  return (
    voices.find(v => v.lang === 'en-IN') ||
    voices.find(v => v.lang.startsWith('en-') && /Google|Microsoft/.test(v.name)) ||
    voices.find(v => v.lang.startsWith('en-')) ||
    null
  );
}

function decodeBase64ToBlob(b64: string, mime: string): Blob {
  const bin = atob(b64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return new Blob([bytes], { type: mime });
}

export default function AiInterviewPage({ params }: { params: Promise<{ sessionId: string }> }) {
  const { sessionId } = use(params);
  const router = useRouter();
  const [turns, setTurns] = useState<Turn[]>([]);
  const [meta, setMeta] = useState<SessionMeta | null>(null);
  const [state, setState] = useState<UiState>('idle');
  const [error, setError] = useState<string | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [started, setStarted] = useState(false);
  const [micDenied, setMicDenied] = useState(false);
  const [tapRecording, setTapRecording] = useState(false);

  // Audio playback queue (sentence index → blob) so we can play sentences as
  // they stream in even though Sarvam's TTS resolves out of order.
  const audioBufRef = useRef<Map<number, Blob>>(new Map());
  const nextPlayIdxRef = useRef(0);
  const currentAudioRef = useRef<HTMLAudioElement | null>(null);
  const currentUrlRef = useRef<string | null>(null);
  const streamDoneRef = useRef(false);
  const pendingSessionEndRef = useRef(false);

  // VAD instance — kept as `any` because the typings live in onnxruntime-web.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const vadRef = useRef<any>(null);
  const vadEnabledRef = useRef(false);
  const browserVoiceRef = useRef<SpeechSynthesisVoice | null>(null);
  const startedAtRef = useRef<number>(Date.now());
  const transcriptRef = useRef<HTMLDivElement | null>(null);

  // Tap-to-record (mic-denied fallback) refs.
  const tapRecRef = useRef<MediaRecorder | null>(null);
  const tapChunksRef = useRef<BlobPart[]>([]);
  const tapStreamRef = useRef<MediaStream | null>(null);

  // ── Browser TTS fallback ─────────────────────────────────────────────
  useEffect(() => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    const refresh = () => {
      const v = pickBrowserVoice(window.speechSynthesis.getVoices());
      if (v) browserVoiceRef.current = v;
    };
    refresh();
    window.speechSynthesis.onvoiceschanged = refresh;
    return () => { window.speechSynthesis.onvoiceschanged = null; };
  }, []);

  const speakBrowser = useCallback((text: string, reason: string) => {
    console.warn(`[TTS fallback] using browser speechSynthesis — reason: ${reason}`);
    if (typeof window === 'undefined' || !('speechSynthesis' in window) || !text) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    if (browserVoiceRef.current) u.voice = browserVoiceRef.current;
    u.onstart = () => setState('speaking');
    u.onend = () => onSentenceFinished();
    u.onerror = () => onSentenceFinished();
    window.speechSynthesis.speak(u);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Audio queue drain ────────────────────────────────────────────────
  const drainAudioQueue = useCallback(() => {
    if (currentAudioRef.current) return;
    const blob = audioBufRef.current.get(nextPlayIdxRef.current);
    if (!blob) {
      if (streamDoneRef.current && audioBufRef.current.size === 0) {
        onAllAudioFinished();
      }
      return;
    }
    audioBufRef.current.delete(nextPlayIdxRef.current);
    const url = URL.createObjectURL(blob);
    currentUrlRef.current = url;
    const a = new Audio(url);
    currentAudioRef.current = a;
    setState('speaking');
    const cleanup = () => {
      if (currentUrlRef.current === url) {
        URL.revokeObjectURL(url);
        currentUrlRef.current = null;
      }
      if (currentAudioRef.current === a) currentAudioRef.current = null;
    };
    a.onended = () => { cleanup(); nextPlayIdxRef.current += 1; drainAudioQueue(); };
    a.onerror = () => {
      cleanup();
      console.warn('[TTS fallback] <audio> playback failed for sentence', nextPlayIdxRef.current);
      nextPlayIdxRef.current += 1;
      drainAudioQueue();
    };
    a.play().catch(err => {
      console.warn('[TTS fallback] audio.play() rejected:', err);
      cleanup();
      nextPlayIdxRef.current += 1;
      drainAudioQueue();
    });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const onSentenceFinished = useCallback(() => {
    nextPlayIdxRef.current += 1;
    drainAudioQueue();
  }, [drainAudioQueue]);

  const onAllAudioFinished = useCallback(() => {
    if (pendingSessionEndRef.current) {
      pendingSessionEndRef.current = false;
      endInterview();
      return;
    }
    // Hand mic back to the VAD so the candidate can answer.
    if (vadEnabledRef.current && vadRef.current) {
      try { vadRef.current.start(); } catch { /* noop */ }
      setState('listening');
    } else if (micDenied) {
      setState('idle');
    } else {
      setState('idle');
    }
  }, [micDenied]); // eslint-disable-line react-hooks/exhaustive-deps

  const stopAllAudio = useCallback(() => {
    const a = currentAudioRef.current;
    if (a) { try { a.pause(); } catch { /* noop */ } currentAudioRef.current = null; }
    if (currentUrlRef.current) {
      URL.revokeObjectURL(currentUrlRef.current);
      currentUrlRef.current = null;
    }
    audioBufRef.current.clear();
    nextPlayIdxRef.current = 0;
    streamDoneRef.current = false;
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  }, []);

  // ── Speak a text turn via Sarvam (/api/ai-interview/speak) ───────────
  // Used for the opening line; sentence-by-sentence streaming handles
  // subsequent AI turns directly from /api/ai-interview/respond.
  const speakOneShot = useCallback(async (text: string) => {
    if (!text) { onAllAudioFinished(); return; }
    audioBufRef.current.clear();
    nextPlayIdxRef.current = 0;
    streamDoneRef.current = true; // single sentence → drain decides end
    try {
      const res = await fetch('/api/ai-interview/speak', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      });
      if (!res.ok) throw new Error(`speak ${res.status}`);
      const blob = await res.blob();
      audioBufRef.current.set(0, blob);
      drainAudioQueue();
    } catch (err) {
      console.warn('[TTS fallback] /speak unavailable:', err);
      speakBrowser(text, `speak fetch failed: ${err instanceof Error ? err.message : String(err)}`);
    }
  }, [drainAudioQueue, onAllAudioFinished, speakBrowser]);

  // ── Send a recorded user turn through the streaming /respond SSE ─────
  const sendTurn = useCallback(async (blob: Blob) => {
    setState('thinking');
    // Pause VAD while the AI is thinking/speaking — don't pick up its voice.
    if (vadRef.current) { try { await vadRef.current.pause(); } catch { /* noop */ } }
    stopAllAudio();
    streamDoneRef.current = false;

    let res: Response;
    try {
      const fd = new FormData();
      fd.append('sessionId', sessionId);
      fd.append('audio', blob, blob.type.includes('wav') ? 'turn.wav' : 'turn.webm');
      res = await fetch('/api/ai-interview/respond', { method: 'POST', body: fd });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Network error');
      setState('idle');
      return;
    }
    if (!res.ok || !res.body) {
      let msg = `respond ${res.status}`;
      try { const j = await res.json(); msg = j.error || msg; } catch { /* noop */ }
      setError(msg);
      setState('idle');
      return;
    }

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let textBuf = '';
    let aiTurnId: string | null = null;
    let aiTurnContent = '';

    const handleEvent = (event: string, data: string) => {
      let payload: Record<string, unknown> = {};
      try { payload = JSON.parse(data); } catch { /* noop */ }
      if (event === 'user') {
        const text = String(payload.text || '');
        if (text) setTurns(prev => [...prev, { id: `u-${Date.now()}`, role: 'user', content: text }]);
      } else if (event === 'text') {
        const sentence = String(payload.sentence || '');
        if (!sentence) return;
        aiTurnContent = aiTurnContent ? `${aiTurnContent} ${sentence}` : sentence;
        if (!aiTurnId) {
          aiTurnId = `a-${Date.now()}`;
          const id = aiTurnId;
          setTurns(prev => [...prev, { id, role: 'ai', content: sentence }]);
        } else {
          const id = aiTurnId;
          const content = aiTurnContent;
          setTurns(prev => prev.map(t => (t.id === id ? { ...t, content } : t)));
        }
      } else if (event === 'audio') {
        const idx = typeof payload.index === 'number' ? payload.index : nextPlayIdxRef.current;
        const b64 = String(payload.audioBase64 || '');
        const mime = String(payload.mime || 'audio/wav');
        if (!b64) return;
        const audioBlob = decodeBase64ToBlob(b64, mime);
        audioBufRef.current.set(idx, audioBlob);
        drainAudioQueue();
      } else if (event === 'error') {
        const stage = String(payload.stage || '');
        const message = String(payload.message || '');
        console.warn(`[TTS fallback] stream error in stage=${stage}: ${message}`);
        if (stage === 'tts') {
          // Single-sentence TTS failed: skip that index and let the queue drain.
          const idx = typeof payload.index === 'number' ? payload.index : nextPlayIdxRef.current;
          if (idx === nextPlayIdxRef.current && !currentAudioRef.current) {
            nextPlayIdxRef.current += 1;
            drainAudioQueue();
          }
        } else {
          setError(`${stage}: ${message}`);
        }
      } else if (event === 'done') {
        if (payload.sessionShouldEnd) pendingSessionEndRef.current = true;
        streamDoneRef.current = true;
        drainAudioQueue();
      }
    };

    // SSE parser
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      textBuf += decoder.decode(value, { stream: true });
      let nl;
      while ((nl = textBuf.indexOf('\n\n')) !== -1) {
        const raw = textBuf.slice(0, nl);
        textBuf = textBuf.slice(nl + 2);
        let event = 'message';
        let data = '';
        for (const line of raw.split('\n')) {
          if (line.startsWith('event:')) event = line.slice(6).trim();
          else if (line.startsWith('data:')) data += line.slice(5).trim();
        }
        if (data) handleEvent(event, data);
      }
    }
    streamDoneRef.current = true;
    drainAudioQueue();
  }, [drainAudioQueue, sessionId, speakBrowser, stopAllAudio]);

  // ── VAD setup ────────────────────────────────────────────────────────
  const initVad = useCallback(async () => {
    if (vadRef.current) return true;
    try {
      const mod = await import('@ricky0123/vad-web');
      const { MicVAD, utils } = mod;
      const vad = await MicVAD.new({
        onSpeechStart: () => {
          if (state !== 'speaking') setState('listening');
        },
        onSpeechEnd: async (audio: Float32Array) => {
          const wav = utils.encodeWAV(audio);
          const blob = new Blob([wav], { type: 'audio/wav' });
          // Pause VAD until AI finishes its response.
          try { vad.pause(); } catch { /* noop */ }
          await sendTurn(blob);
        },
        onVADMisfire: () => { /* too-short blip; stay listening */ },
      });
      vadRef.current = vad;
      vadEnabledRef.current = true;
      return true;
    } catch (e) {
      console.error('[ai-interview] VAD init failed:', e);
      setMicDenied(true);
      vadEnabledRef.current = false;
      return false;
    }
  }, [sendTurn, state]);

  const handleStart = useCallback(async () => {
    setError(null);
    setState('connecting');
    setStarted(true);
    startedAtRef.current = Date.now();
    const ok = await initVad();
    // Speak the opening (already persisted by /start, just play it).
    const opening = turns.find(t => t.role === 'ai')?.content || '';
    if (opening) await speakOneShot(opening);
    if (!ok) {
      // Mic denied — leave at idle; user uses the tap-to-record button.
      if (!opening) setState('idle');
    }
  }, [initVad, speakOneShot, turns]);

  const handleMuteToggle = useCallback(async () => {
    if (!vadRef.current) return;
    if (state === 'muted') {
      try { await vadRef.current.start(); } catch { /* noop */ }
      vadEnabledRef.current = true;
      setState(currentAudioRef.current ? 'speaking' : 'listening');
    } else {
      try { await vadRef.current.pause(); } catch { /* noop */ }
      vadEnabledRef.current = false;
      setState('muted');
    }
  }, [state]);

  // ── Tap-to-record fallback (mic-denied path) ─────────────────────────
  const tapStart = useCallback(async () => {
    if (tapRecording || state === 'thinking' || state === 'speaking') return;
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true } });
      tapStreamRef.current = stream;
      const mr = new MediaRecorder(stream, { mimeType: 'audio/webm;codecs=opus' });
      tapChunksRef.current = [];
      mr.ondataavailable = (e) => { if (e.data.size > 0) tapChunksRef.current.push(e.data); };
      mr.start();
      tapRecRef.current = mr;
      setTapRecording(true);
      setState('listening');
    } catch {
      setError('Microphone unavailable. Check browser permissions.');
      setState('idle');
    }
  }, [state, tapRecording]);

  const tapStop = useCallback(async () => {
    const mr = tapRecRef.current;
    if (!mr) return;
    const blob: Blob = await new Promise(resolve => {
      mr.onstop = () => resolve(new Blob(tapChunksRef.current, { type: 'audio/webm' }));
      mr.stop();
    });
    tapStreamRef.current?.getTracks().forEach(t => t.stop());
    tapStreamRef.current = null;
    tapRecRef.current = null;
    setTapRecording(false);
    if (blob.size < 800) { setState('idle'); return; }
    await sendTurn(blob);
  }, [sendTurn]);

  // ── Session load ─────────────────────────────────────────────────────
  useEffect(() => {
    const supabase = createClient();
    (async () => {
      const [{ data: s }, { data: t }] = await Promise.all([
        supabase.from('interview_sessions').select('id, interview_format, prompt, started_at').eq('id', sessionId).maybeSingle(),
        supabase.from('interview_transcripts').select('id, role, content').eq('session_id', sessionId).order('created_at', { ascending: true }),
      ]);
      if (s) setMeta(s as unknown as SessionMeta);
      if (t) setTurns(t as unknown as Turn[]);
    })();
  }, [sessionId]);

  useEffect(() => {
    const t = setInterval(() => setElapsed(Math.floor((Date.now() - startedAtRef.current) / 1000)), 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    if (transcriptRef.current) transcriptRef.current.scrollTop = transcriptRef.current.scrollHeight;
  }, [turns.length]);

  // Cleanup on unmount.
  useEffect(() => {
    return () => {
      if (vadRef.current) { try { vadRef.current.destroy(); } catch { /* noop */ } vadRef.current = null; }
      stopAllAudio();
    };
  }, [stopAllAudio]);

  const endInterview = useCallback(async () => {
    stopAllAudio();
    if (vadRef.current) { try { await vadRef.current.destroy(); } catch { /* noop */ } vadRef.current = null; }
    setState('thinking');
    try {
      await fetch('/api/ai-interview/end', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId }),
      });
    } catch { /* result page will retry */ }
    router.push(`/interview/ai/${sessionId}/result`);
  }, [sessionId, router, stopAllAudio]);

  const aiQuestionCount = turns.filter(t => t.role === 'ai').length;

  return (
    <div style={{ position: 'fixed', inset: 0, background: BG, color: '#e8ecff', display: 'flex', flexDirection: 'column' }}>
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
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
          <div ref={transcriptRef} style={{ flex: 1, overflowY: 'auto', padding: '24px max(24px, 8vw)', display: 'flex', flexDirection: 'column', gap: 16 }}>
            {turns.length === 0 && <div style={{ color: '#8b91a8', fontSize: 13, textAlign: 'center', paddingTop: 80 }}>Preparing your interviewer…</div>}
            {turns.map((t) => (
              <Bubble key={t.id} role={t.role} content={t.content} />
            ))}
          </div>

          <div style={{ padding: '14px 20px 24px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, borderTop: '1px solid rgba(255,255,255,0.06)', background: 'rgba(15,18,38,0.85)', flexShrink: 0 }}>
            {!started ? (
              <button
                onClick={handleStart}
                disabled={turns.length === 0}
                style={{
                  height: 60, padding: '0 32px', borderRadius: 999,
                  background: 'var(--gradient-brand, linear-gradient(135deg,#1B2B8E,#3D52CC))',
                  color: '#fff', border: 'none', fontSize: 18, fontWeight: 700,
                  cursor: turns.length === 0 ? 'wait' : 'pointer',
                  boxShadow: '0 8px 24px rgba(34,54,176,0.45)',
                }}
              >
                {turns.length === 0 ? 'Loading…' : '🎙️  Start Interview'}
              </button>
            ) : micDenied ? (
              <>
                <span style={{ fontSize: 11, color: '#fbbf24', marginBottom: 4 }}>Mic auto-detect unavailable — tap to talk:</span>
                <button
                  onClick={tapRecording ? tapStop : tapStart}
                  disabled={state === 'thinking' || state === 'speaking'}
                  style={{
                    width: 96, height: 96, borderRadius: 999,
                    background: tapRecording ? 'linear-gradient(135deg, #f43f5e, #ef4444)' :
                      (state === 'thinking' || state === 'speaking') ? 'rgba(255,255,255,0.08)' :
                      'var(--gradient-brand, linear-gradient(135deg,#1B2B8E,#3D52CC))',
                    color: '#fff', border: 'none', fontSize: 28,
                    cursor: (state === 'thinking' || state === 'speaking') ? 'wait' : 'pointer',
                  }}
                  aria-label={tapRecording ? 'Stop recording' : 'Start recording'}
                >
                  {tapRecording ? '⏹' : '🎙️'}
                </button>
                <StatusLine state={state} />
              </>
            ) : (
              <>
                <ListeningIndicator state={state} />
                <StatusLine state={state} />
                <button
                  onClick={handleMuteToggle}
                  style={{ height: 30, padding: '0 14px', borderRadius: 999, background: 'rgba(255,255,255,0.08)', color: '#e8ecff', border: '1px solid rgba(255,255,255,0.12)', fontSize: 12, cursor: 'pointer' }}
                >
                  {state === 'muted' ? '🔊 Unmute' : '🔇 Mute'}
                </button>
              </>
            )}
            {error && <div style={{ fontSize: 12, color: '#f87171' }}>{error}</div>}
          </div>
        </div>

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
              Speak naturally — the AI auto-detects when you start and stop. The interview wraps up after 8–12 substantive questions.
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

function Bubble({ role, content }: { role: 'ai' | 'user'; content: string }) {
  const isAi = role === 'ai';
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: isAi ? 'flex-start' : 'flex-end' }}>
      <div style={{ maxWidth: 640, padding: '12px 16px', borderRadius: isAi ? '14px 14px 14px 4px' : '14px 14px 4px 14px', background: isAi ? 'rgba(255,255,255,0.06)' : 'linear-gradient(135deg, #1B2B8E, #3D52CC)', color: '#fff', fontSize: 14, lineHeight: 1.55 }}>
        {isAi && <div style={{ fontSize: 11, fontWeight: 700, color: '#b6bbcd', marginBottom: 4 }}>ELM AI Interviewer</div>}
        <div style={{ whiteSpace: 'pre-wrap' }}>{content}</div>
      </div>
    </div>
  );
}

function StatusLine({ state }: { state: UiState }) {
  const map: Record<UiState, { text: string; color: string }> = {
    idle: { text: 'Ready', color: '#8b91a8' },
    connecting: { text: 'Connecting…', color: '#8b91a8' },
    listening: { text: 'Listening…', color: '#f87171' },
    thinking: { text: 'Thinking…', color: '#fbbf24' },
    speaking: { text: 'AI is speaking', color: '#34d399' },
    muted: { text: 'Muted', color: '#8b91a8' },
  };
  const s = map[state] ?? map.idle;
  return <span style={{ fontSize: 12, fontWeight: 600, color: s.color }}>{s.text}</span>;
}

function ListeningIndicator({ state }: { state: UiState }) {
  const isListening = state === 'listening';
  const isSpeaking = state === 'speaking';
  const isThinking = state === 'thinking';
  const colorRing = isListening ? 'rgba(248,113,113,0.35)' : isSpeaking ? 'rgba(52,211,153,0.35)' : 'rgba(255,255,255,0.08)';
  const colorBg = isSpeaking ? 'linear-gradient(135deg, #10b981, #059669)' : 'var(--gradient-brand, linear-gradient(135deg,#1B2B8E,#3D52CC))';
  return (
    <div
      aria-hidden
      style={{
        width: 96, height: 96, borderRadius: 999,
        background: colorBg,
        color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 36,
        boxShadow: `0 0 0 ${isListening || isSpeaking ? 14 : 0}px ${colorRing}`,
        transition: 'box-shadow 200ms, background 200ms',
        animation: isListening ? 'elm-pulse 1.4s ease-in-out infinite' : undefined,
      }}
    >
      {isThinking ? '⏳' : '🎙️'}
      <style jsx>{`
        @keyframes elm-pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.06); }
        }
      `}</style>
    </div>
  );
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
