'use client';

import { useEffect, useRef, useState } from 'react';
import { Avatar, Icon, NovaOrb } from '@/components/primitives';

type Msg = { role: 'user' | 'ai'; content: string };

const SUGGESTIONS = [
  "Explain eigenvalues like I'm a first-year student",
  'Help me write a thesis statement about renewable energy',
  'Quiz me on the Krebs cycle',
  'Give me 3 JEE-level calculus problems',
];

const DEMO_RESPONSES: Record<string, string> = {
  eigen: `Imagine you push a vector through a transformation (matrix). Most vectors get rotated and stretched in messy ways. But a few special ones — eigenvectors — only get scaled. They point in the same direction before and after.

The scale factor is the eigenvalue (λ). Mathematically: Av = λv.

Why it matters: in any linear system, eigenvectors are the "natural axes." If you rewrite the system in those coordinates, complicated dynamics become trivial.

Quick example: rotation by 0° keeps every vector pointing the same way, so every λ = 1. Rotation by 180° flips every vector, so every λ = −1. Real-world: PCA, vibration modes, Google PageRank.`,
  thesis: `Strong thesis statements take a position you can argue, not a fact everyone agrees on.

Weak: "Renewable energy is important for the environment."
Strong: "Aggressively subsidizing residential solar in India would cut household emissions faster than any utility-scale policy, because rooftop adoption bypasses transmission losses and political bottlenecks."

Three moves to sharpen yours:
1. Name a specific claim (not a topic).
2. Add a "because" — your evidence in one phrase.
3. Pick the boldest version you can defend with data.

Send me your draft and I'll push it to be sharper.`,
  krebs: `Quick quiz — answer mentally before I confirm:

1. Where does the Krebs cycle happen inside the cell?
2. What 2-carbon molecule enters the cycle each turn?
3. How many NADH are produced per turn?
4. Which intermediate is regenerated, closing the loop?
5. The cycle runs how many times per glucose molecule?

Reveal when ready — and tell me which ones you guessed.`,
  jee: `Three calculus problems at JEE Advanced level:

1. Find the area enclosed by y = x²·ln(x), the x-axis, and x = e.

2. Let f(x) = ∫₀ˣ (sin t)/(1 + t²) dt. Show that f is bounded on ℝ and find lim x→∞ f(x).

3. If f(x) = max{x³ − 3x, x² − 2x} on [−2, 2], find ∫₋₂² f(x) dx.

Try problem 1 first — it's the most direct. Show me your setup and I'll guide if you get stuck.`,
};

function pickDemoResponse(query: string): string {
  const q = query.toLowerCase();
  if (q.includes('eigen')) return DEMO_RESPONSES.eigen;
  if (q.includes('thesis') || q.includes('renewable')) return DEMO_RESPONSES.thesis;
  if (q.includes('krebs')) return DEMO_RESPONSES.krebs;
  if (q.includes('jee') || q.includes('calculus problem')) return DEMO_RESPONSES.jee;
  return `Great question. Here's how I'd think about it:\n\nFirst, what's the underlying concept being tested? Once you can name it in one sentence, the path forward becomes much clearer.\n\nTell me what you've tried so far, and we'll work it out together — step by step.`;
}

export default function NovaChat() {
  const [msg, setMsg] = useState('');
  const [thread, setThread] = useState<Msg[]>([]);
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [thread, loading]);

  const send = (text?: string) => {
    const content = (text || msg).trim();
    if (!content || loading) return;
    setMsg('');
    setThread(t => [...t, { role: 'user', content }]);
    setLoading(true);
    setTimeout(() => {
      setThread(t => [...t, { role: 'ai', content: pickDemoResponse(content) }]);
      setLoading(false);
    }, 900);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 68px - 100px)', maxWidth: 880, margin: '0 auto', width: '100%' }}>
      {thread.length === 0 ? (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', paddingBottom: 40 }}>
          <NovaOrb size={72} />
          <h1 style={{ fontFamily: 'Fraunces, serif', fontSize: 44, fontWeight: 500, letterSpacing: '-0.02em', marginTop: 28 }}>
            I&apos;m <span style={{ fontStyle: 'italic', color: 'var(--mint-600)' }}>Nova</span>.
          </h1>
          <p style={{ fontSize: 16, color: 'var(--text-secondary)', marginTop: 10, textAlign: 'center', maxWidth: 440, lineHeight: 1.55 }}>
            Ask me anything — math, writing, code, a concept you&apos;re stuck on. I&apos;ll explain at your pace.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10, marginTop: 36, width: '100%', maxWidth: 640 }}>
            {SUGGESTIONS.map(s => (
              <button
                key={s}
                onClick={() => send(s)}
                style={{
                  padding: '14px 18px',
                  background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)',
                  borderRadius: 14, textAlign: 'left', fontSize: 14, color: 'var(--text-primary)',
                  fontFamily: 'Instrument Sans, system-ui', lineHeight: 1.4,
                  transition: 'all 280ms var(--ease-out-expo)',
                  cursor: 'pointer',
                }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.borderColor = 'var(--border-strong)'; e.currentTarget.style.boxShadow = 'var(--shadow-sm)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.borderColor = 'var(--border-subtle)'; e.currentTarget.style.boxShadow = 'none'; }}
              >{s}</button>
            ))}
          </div>
        </div>
      ) : (
        <div ref={scrollRef} style={{ flex: 1, overflowY: 'auto', paddingBottom: 20, paddingRight: 4 }}>
          {thread.map((m, i) => (
            <div key={i} style={{
              display: 'flex', gap: 14, padding: '18px 0',
              flexDirection: m.role === 'user' ? 'row-reverse' : 'row',
            }}>
              {m.role === 'ai' ? <NovaOrb size={30} animated={false} /> : <Avatar name="You" size={30} />}
              <div style={{
                maxWidth: '78%', padding: '14px 18px',
                background: m.role === 'user' ? 'var(--text-primary)' : 'var(--bg-surface)',
                color: m.role === 'user' ? '#fff' : 'var(--text-primary)',
                border: m.role === 'ai' ? '1px solid var(--border-subtle)' : 'none',
                borderRadius: m.role === 'user' ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                fontSize: 15, lineHeight: 1.6, whiteSpace: 'pre-wrap',
              }}>{m.content}</div>
            </div>
          ))}
          {loading && (
            <div style={{ display: 'flex', gap: 14, padding: '18px 0' }}>
              <NovaOrb size={30} animated={false} />
              <div style={{ padding: '18px 22px', background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: '18px 18px 18px 4px', display: 'flex', gap: 6, alignItems: 'center' }}>
                <span style={{ width: 6, height: 6, borderRadius: 999, background: 'var(--mint-500)', animation: 'novaDot 1.2s infinite' }} />
                <span style={{ width: 6, height: 6, borderRadius: 999, background: 'var(--mint-500)', animation: 'novaDot 1.2s 0.2s infinite' }} />
                <span style={{ width: 6, height: 6, borderRadius: 999, background: 'var(--mint-500)', animation: 'novaDot 1.2s 0.4s infinite' }} />
              </div>
            </div>
          )}
        </div>
      )}

      {/* Input */}
      <div style={{ paddingTop: 12 }}>
        <div style={{
          display: 'flex', gap: 8, alignItems: 'center',
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 999, padding: 6, boxShadow: 'var(--shadow-sm)',
        }}>
          <input
            value={msg}
            onChange={e => setMsg(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') send(); }}
            placeholder="Ask Nova anything…"
            style={{ flex: 1, height: 44, padding: '0 18px', fontSize: 15, background: 'transparent', border: 'none', outline: 'none', color: 'var(--text-primary)' }}
          />
          <button
            onClick={() => send()}
            disabled={!msg.trim() || loading}
            style={{
              width: 44, height: 44, borderRadius: 999,
              background: msg.trim() ? 'var(--text-primary)' : 'var(--bg-hover)',
              color: msg.trim() ? '#fff' : 'var(--text-muted)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: msg.trim() ? 'pointer' : 'default',
            }}
          >
            <Icon name="send" size={15} />
          </button>
        </div>
        <div style={{ fontSize: 11, color: 'var(--text-muted)', textAlign: 'center', marginTop: 10, fontFamily: 'Instrument Sans, system-ui' }}>
          Nova can make mistakes. Double-check important answers.
        </div>
      </div>
      <style>{`@keyframes novaDot { 0%, 80%, 100% { opacity: 0.3; } 40% { opacity: 1; } }`}</style>
    </div>
  );
}
