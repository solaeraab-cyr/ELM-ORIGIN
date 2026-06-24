'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

type Msg = { role: 'user' | 'assistant'; content: string };

const GREETING =
  "Hi! 👋 I'm the ELM Assistant. I can help with how to use ELM, troubleshooting AI Mock, mentors, payments, or anything else. What can I help you with?";

const ESCALATE_KEYWORDS = [
  'refund', 'account delete', 'delete my account', 'frustrated',
  'not working', 'broken', 'human', 'agent', 'person', 'reshma',
];

function shouldEscalateLocal(text: string): boolean {
  const t = text.toLowerCase();
  return ESCALATE_KEYWORDS.some(k => t.includes(k));
}

function newSessionId() {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID();
  return `s_${Date.now()}_${Math.random().toString(36).slice(2)}`;
}

export default function SupportWidget() {
  const pathname = usePathname();
  const hide = !!pathname && /^\/interview\/ai\/[^/]+/.test(pathname);

  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [streamingText, setStreamingText] = useState('');
  const [showEscalation, setShowEscalation] = useState(false);
  const [submittedTicket, setSubmittedTicket] = useState(false);
  const [emailWarning, setEmailWarning] = useState<string | null>(null);

  const [escEmail, setEscEmail] = useState('');
  const [escName, setEscName] = useState('');
  const [escMessage, setEscMessage] = useState('');
  const [escSubmitting, setEscSubmitting] = useState(false);
  const [escError, setEscError] = useState<string | null>(null);

  const sessionIdRef = useRef<string>('');
  const scrollRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!sessionIdRef.current) sessionIdRef.current = newSessionId();
  }, []);

  useEffect(() => {
    if (open && messages.length === 0) {
      setMessages([{ role: 'assistant', content: GREETING }]);
    }
  }, [open, messages.length]);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, streamingText, showEscalation, submittedTicket]);

  // Prefill name & email from auth session when escalation form opens
  useEffect(() => {
    if (!showEscalation) return;
    let cancelled = false;
    (async () => {
      try {
        const sb = createClient();
        const { data: { user } } = await sb.auth.getUser();
        if (cancelled || !user) return;
        if (!escEmail && user.email) setEscEmail(user.email);
        if (!escName) {
          const meta = user.user_metadata as { full_name?: string; name?: string } | undefined;
          const n = meta?.full_name || meta?.name || '';
          if (n) setEscName(n);
        }
      } catch { /* anon */ }
    })();
    return () => { cancelled = true; };
  }, [showEscalation, escEmail, escName]);

  const openEscalation = useCallback((prefill?: string) => {
    setShowEscalation(true);
    setEscMessage(prev => prev || prefill || '');
  }, []);

  const sendMessage = useCallback(async () => {
    const text = input.trim();
    if (!text || sending) return;
    const next: Msg[] = [...messages, { role: 'user', content: text }];
    setMessages(next);
    setInput('');
    setSending(true);
    setStreamingText('');

    try {
      const res = await fetch('/api/support/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: sessionIdRef.current,
          message: text,
          history: next.slice(0, -1),
        }),
      });
      if (!res.ok || !res.body) {
        throw new Error(`HTTP ${res.status}`);
      }
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buf = '';
      let accum = '';
      let escalated = false;
      let finalText = '';

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        buf += decoder.decode(value, { stream: true });
        const events = buf.split('\n\n');
        buf = events.pop() ?? '';
        for (const ev of events) {
          const lines = ev.split('\n');
          let evName = 'message';
          let data = '';
          for (const ln of lines) {
            if (ln.startsWith('event:')) evName = ln.slice(6).trim();
            else if (ln.startsWith('data:')) data += ln.slice(5).trim();
          }
          if (!data) continue;
          try {
            const payload = JSON.parse(data);
            if (evName === 'text' && payload.token) {
              accum += payload.token as string;
              setStreamingText(accum);
            } else if (evName === 'done') {
              finalText = (payload.text as string) || accum;
              escalated = !!payload.shouldEscalate;
            } else if (evName === 'error') {
              throw new Error((payload.message as string) || 'stream error');
            }
          } catch {
            // ignore parse errors
          }
        }
      }

      const reply = finalText || accum || '(no reply)';
      setMessages(m => [...m, { role: 'assistant', content: reply }]);
      setStreamingText('');

      const escalate = escalated || shouldEscalateLocal(text) || shouldEscalateLocal(reply);
      if (escalate) openEscalation(text);
    } catch (e) {
      console.error('[support] chat error', e);
      setMessages(m => [
        ...m,
        {
          role: 'assistant',
          content: "Sorry, I had trouble responding. Let me get this to a human — click 'Talk to a human →' below.",
        },
      ]);
      setStreamingText('');
    } finally {
      setSending(false);
    }
  }, [input, messages, sending, openEscalation]);

  const submitEscalation = useCallback(async () => {
    setEscError(null);
    const email = escEmail.trim();
    const name = escName.trim();
    const msg = escMessage.trim();
    if (!name) { setEscError('Please enter your name.'); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setEscError('Please enter a valid email.'); return;
    }
    if (!msg) { setEscError('Please describe the issue.'); return; }

    setEscSubmitting(true);
    try {
      const res = await fetch('/api/support/escalate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, message: msg, history: messages }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
      setSubmittedTicket(true);
      setShowEscalation(false);
      setEmailWarning(data.emailWarning ?? null);
      setMessages(m => [
        ...m,
        {
          role: 'assistant',
          content: `Got it! I've sent your message to Reshma. She'll reply to ${email} within 24 hours. You can close this chat or keep talking with me.`,
        },
      ]);
    } catch (e) {
      setEscError(e instanceof Error ? e.message : 'Could not submit. Please try again.');
    } finally {
      setEscSubmitting(false);
    }
  }, [escEmail, escName, escMessage, messages]);

  if (hide) return null;

  return (
    <>
      {/* Floating bubble */}
      {!open && (
        <button
          type="button"
          aria-label="Open ELM Support chat"
          onClick={() => setOpen(true)}
          className="fixed bottom-5 right-5 z-[60] flex h-14 w-14 items-center justify-center rounded-full text-2xl text-white shadow-brand transition hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2"
          style={{ background: 'var(--gradient-brand)' }}
        >
          💬
        </button>
      )}

      {/* Panel */}
      {open && (
        <div
          role="dialog"
          aria-label="ELM Support"
          className="fixed z-[60] bg-white text-slate-900 shadow-2xl border border-slate-200 flex flex-col
                     inset-0 sm:inset-auto sm:bottom-5 sm:right-5 sm:w-[380px] sm:h-[600px] sm:rounded-2xl sm:max-h-[85vh] overflow-hidden"
        >
          {/* Top bar */}
          <div
            className="flex items-center justify-between px-4 py-3 text-white"
            style={{ background: 'var(--gradient-brand)' }}
          >
            <div className="flex flex-col">
              <div className="flex items-center gap-2 font-semibold">
                ELM Support
                <span className="inline-block h-2 w-2 rounded-full bg-green-400 shadow-[0_0_6px_rgba(74,222,128,0.8)]" />
              </div>
              <div className="text-xs opacity-80">AI Assistant · usually replies instantly</div>
            </div>
            <button
              type="button"
              aria-label="Close support chat"
              onClick={() => setOpen(false)}
              className="rounded p-1 hover:bg-white/15"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>

          {/* Conversation */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto px-3 py-3 space-y-2 bg-slate-50">
            {messages.map((m, i) => (
              <MessageBubble key={i} role={m.role} content={m.content} />
            ))}
            {sending && (
              streamingText
                ? <MessageBubble role="assistant" content={streamingText} />
                : <TypingIndicator />
            )}

            {showEscalation && !submittedTicket && (
              <div className="mt-3 rounded-lg border border-slate-200 bg-white p-3 text-sm">
                <div className="mb-2 font-medium">Got it. Let me get this to Reshma. Quick info:</div>
                <input
                  type="text"
                  placeholder="Your name"
                  value={escName}
                  onChange={(e) => setEscName(e.target.value)}
                  className="mb-2 w-full rounded-md border border-slate-300 px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400"
                />
                <input
                  type="email"
                  placeholder="Email"
                  value={escEmail}
                  onChange={(e) => setEscEmail(e.target.value)}
                  className="mb-2 w-full rounded-md border border-slate-300 px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400"
                />
                <textarea
                  placeholder="What's the issue?"
                  value={escMessage}
                  onChange={(e) => setEscMessage(e.target.value)}
                  rows={3}
                  className="mb-2 w-full resize-none rounded-md border border-slate-300 px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400"
                />
                {escError && <div className="mb-2 text-xs text-red-600">{escError}</div>}
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowEscalation(false)}
                    className="rounded-md px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={submitEscalation}
                    disabled={escSubmitting}
                    className="rounded-md px-3 py-1.5 text-xs font-medium text-white disabled:opacity-60"
                    style={{ background: 'var(--gradient-brand)' }}
                  >
                    {escSubmitting ? 'Sending…' : 'Send'}
                  </button>
                </div>
              </div>
            )}

            {emailWarning && (
              <div className="rounded-md bg-amber-50 px-3 py-2 text-xs text-amber-800 border border-amber-200">
                Note: email delivery isn't fully configured on this server, but your ticket was saved and Reshma will see it.
              </div>
            )}
          </div>

          {/* Input area */}
          <div className="border-t border-slate-200 bg-white px-3 py-2">
            <form
              onSubmit={(e) => { e.preventDefault(); sendMessage(); }}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type a message…"
                disabled={sending}
                className="flex-1 rounded-full border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400 disabled:opacity-60"
              />
              <button
                type="submit"
                disabled={sending || !input.trim()}
                className="rounded-full px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
                style={{ background: 'var(--gradient-brand)' }}
              >
                Send
              </button>
            </form>
            <button
              type="button"
              onClick={() => openEscalation(messages.filter(m => m.role === 'user').slice(-1)[0]?.content)}
              className="mt-1 block w-full text-center text-xs text-slate-500 hover:text-brand-600 hover:underline"
            >
              Talk to a human →
            </button>
          </div>
        </div>
      )}
    </>
  );
}

function MessageBubble({ role, content }: { role: 'user' | 'assistant'; content: string }) {
  if (role === 'user') {
    return (
      <div className="flex justify-end">
        <div
          className="max-w-[80%] rounded-2xl rounded-br-sm px-3 py-2 text-sm text-white whitespace-pre-wrap break-words"
          style={{ background: 'var(--gradient-brand)' }}
        >
          {content}
        </div>
      </div>
    );
  }
  return (
    <div className="flex justify-start">
      <div className="max-w-[80%] rounded-2xl rounded-bl-sm bg-slate-200 px-3 py-2 text-sm text-slate-800 whitespace-pre-wrap break-words">
        {content}
      </div>
    </div>
  );
}

function TypingIndicator() {
  return (
    <div className="flex justify-start">
      <div className="rounded-2xl rounded-bl-sm bg-slate-200 px-3 py-2">
        <span className="inline-flex gap-1">
          <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-500" style={{ animationDelay: '0ms' }} />
          <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-500" style={{ animationDelay: '120ms' }} />
          <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-500" style={{ animationDelay: '240ms' }} />
        </span>
      </div>
    </div>
  );
}
