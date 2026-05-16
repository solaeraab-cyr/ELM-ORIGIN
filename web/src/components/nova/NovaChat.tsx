'use client';

import { useEffect, useRef, useState } from 'react';
import { Avatar, Icon, NovaOrb } from '@/components/primitives';

type Msg = { role: 'user' | 'ai'; content: string; ts: Date };

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

const RANDOM_RESPONSES = [
  `Great question! Here's what I'd suggest for studying that topic:\n\nStart by building a solid mental model before diving into details. Sketch the big picture, then fill in the parts that feel fuzzy. Once you can explain the idea in one sentence, you're ready to tackle the harder variations.`,
  `Try breaking the problem into smaller parts. Start with the simplest version you can imagine — what happens when n=1, or when all values are equal? Often the base case reveals the structure of the full solution.`,
  `That's a common interview question. The key approach is to think about trade-offs: time vs. space, readability vs. performance. Interviewers want to see your reasoning, not just the answer — narrate every decision.`,
  `I recommend practicing with spaced repetition. Review the concept today, again in 2 days, then 1 week, then 1 month. Your brain consolidates memory during sleep, so short daily sessions beat long weekly cramming every time.`,
  `Let me explain that concept step by step:\n\n1. First, understand what problem it solves — why does this concept exist?\n2. Work through the simplest example by hand.\n3. Identify the pattern.\n4. Then try a harder case without looking at your notes.`,
  `The mistake most students make here is jumping to the formula before understanding the intuition. Slow down. Draw a diagram. Label what you know and what you're solving for. The formula will follow naturally.`,
  `Here's a study technique that works really well for this: teach it to an imaginary student. If you can explain it out loud without hesitating, you understand it. Every time you get stuck, that's exactly the gap to fill.`,
  `This topic shows up constantly in competitive exams. Focus on the 20% of concepts that appear in 80% of questions. Master the fundamentals deeply rather than skimming every edge case — you'll score more reliably.`,
  `Think about it from first principles. Strip away everything you've memorised and ask: if I had to derive this from scratch, where would I start? That exercise builds the kind of deep understanding that doesn't crack under exam pressure.`,
  `Good instinct on that approach! One refinement: consider the edge cases early. What happens at the boundaries? What if the input is zero, negative, or very large? Handling edge cases explicitly shows examiner-level thinking.`,
];

function pickDemoResponse(query: string): string {
  const q = query.toLowerCase();
  if (q.includes('eigen')) return DEMO_RESPONSES.eigen;
  if (q.includes('thesis') || q.includes('renewable')) return DEMO_RESPONSES.thesis;
  if (q.includes('krebs')) return DEMO_RESPONSES.krebs;
  if (q.includes('jee') || q.includes('calculus problem')) return DEMO_RESPONSES.jee;
  return RANDOM_RESPONSES[Math.floor(Math.random() * RANDOM_RESPONSES.length)];
}

function fmt(d: Date) {
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export default function NovaChat() {
  const [msg, setMsg] = useState('');
  const [thread, setThread] = useState<Msg[]>([]);
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [thread, loading]);

  const send = (text?: string) => {
    const content = (text || msg).trim();
    if (!content || loading) return;
    setMsg('');
    inputRef.current?.focus();
    setThread(t => [...t, { role: 'user', content, ts: new Date() }]);
    setLoading(true);
    const delay = 1000 + Math.random() * 800;
    setTimeout(() => {
      setThread(t => [...t, { role: 'ai', content: pickDemoResponse(content), ts: new Date() }]);
      setLoading(false);
    }, delay);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 68px - 64px)', maxWidth: 880, margin: '0 auto', width: '100%' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, paddingBottom: 16, borderBottom: '1px solid var(--border-subtle)', marginBottom: 4, flexShrink: 0 }}>
        <NovaOrb size={28} animated={thread.length === 0 || loading} />
        <div>
          <div style={{ fontFamily: 'Fraunces, serif', fontWeight: 600, fontSize: 17, letterSpacing: '-0.01em' }}>
            Nova AI Assistant{' '}
            <span style={{ fontSize: 11, fontFamily: 'Instrument Sans, system-ui', fontWeight: 600, padding: '2px 8px', borderRadius: 999, background: 'rgba(16,185,129,0.12)', color: 'var(--mint-600)', verticalAlign: 'middle', letterSpacing: 0 }}>
              Preview Mode
            </span>
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-tertiary)', marginTop: 1 }}>Ask me anything — I&apos;m here to help you learn</div>
        </div>
      </div>

      {/* Thread */}
      {thread.length === 0 ? (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', paddingBottom: 32 }}>
          <NovaOrb size={64} />
          <h1 style={{ fontFamily: 'Fraunces, serif', fontSize: 40, fontWeight: 500, letterSpacing: '-0.02em', marginTop: 24 }}>
            I&apos;m <span style={{ fontStyle: 'italic', color: 'var(--mint-600)' }}>Nova</span>.
          </h1>
          <p style={{ fontSize: 15, color: 'var(--text-secondary)', marginTop: 8, textAlign: 'center', maxWidth: 420, lineHeight: 1.55 }}>
            Ask me anything — math, writing, code, a concept you&apos;re stuck on. I&apos;ll explain at your pace.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10, marginTop: 32, width: '100%', maxWidth: 620 }}>
            {SUGGESTIONS.map(s => (
              <button
                key={s}
                onClick={() => send(s)}
                style={{
                  padding: '13px 16px',
                  background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)',
                  borderRadius: 14, textAlign: 'left', fontSize: 13, color: 'var(--text-primary)',
                  fontFamily: 'Instrument Sans, system-ui', lineHeight: 1.4,
                  transition: 'all 240ms var(--ease-out-expo)',
                  cursor: 'pointer',
                }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.borderColor = 'var(--border-strong)'; e.currentTarget.style.boxShadow = 'var(--shadow-sm)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.borderColor = 'var(--border-subtle)'; e.currentTarget.style.boxShadow = 'none'; }}
              >{s}</button>
            ))}
          </div>
        </div>
      ) : (
        <div ref={scrollRef} style={{ flex: 1, overflowY: 'auto', paddingBottom: 16, paddingRight: 2 }}>
          {thread.map((m, i) => (
            <div key={i} style={{
              display: 'flex', gap: 12, padding: '14px 0',
              flexDirection: m.role === 'user' ? 'row-reverse' : 'row',
              alignItems: 'flex-end',
            }}>
              {m.role === 'ai' ? <NovaOrb size={28} animated={false} /> : <Avatar name="You" size={28} />}
              <div style={{ maxWidth: '76%', display: 'flex', flexDirection: 'column', gap: 4, alignItems: m.role === 'user' ? 'flex-end' : 'flex-start' }}>
                <div style={{
                  padding: '12px 16px',
                  background: m.role === 'user' ? '#1B2B8E' : 'var(--bg-surface)',
                  color: m.role === 'user' ? '#fff' : 'var(--text-primary)',
                  border: m.role === 'ai' ? '1px solid var(--border-subtle)' : 'none',
                  borderRadius: m.role === 'user' ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                  fontSize: 14, lineHeight: 1.65, whiteSpace: 'pre-wrap',
                  boxShadow: m.role === 'user' ? '0 2px 8px rgba(27,43,142,0.25)' : 'none',
                }}>{m.content}</div>
                <span style={{ fontSize: 10, color: 'var(--text-muted)', paddingLeft: m.role === 'ai' ? 4 : 0, paddingRight: m.role === 'user' ? 4 : 0 }}>
                  {fmt(m.ts)}
                </span>
              </div>
            </div>
          ))}
          {loading && (
            <div style={{ display: 'flex', gap: 12, padding: '14px 0', alignItems: 'flex-end' }}>
              <NovaOrb size={28} animated={false} />
              <div style={{ padding: '14px 20px', background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: '18px 18px 18px 4px', display: 'flex', gap: 5, alignItems: 'center' }}>
                <span style={{ width: 6, height: 6, borderRadius: 999, background: 'var(--mint-500)', animation: 'novaDot 1.2s infinite', display: 'block' }} />
                <span style={{ width: 6, height: 6, borderRadius: 999, background: 'var(--mint-500)', animation: 'novaDot 1.2s 0.2s infinite', display: 'block' }} />
                <span style={{ width: 6, height: 6, borderRadius: 999, background: 'var(--mint-500)', animation: 'novaDot 1.2s 0.4s infinite', display: 'block' }} />
              </div>
            </div>
          )}
        </div>
      )}

      {/* Input */}
      <div style={{ paddingTop: 10, flexShrink: 0 }}>
        <div style={{
          display: 'flex', gap: 8, alignItems: 'center',
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 999, padding: 6, boxShadow: 'var(--shadow-sm)',
        }}>
          <input
            ref={inputRef}
            value={msg}
            onChange={e => setMsg(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) send(); }}
            placeholder="Ask Nova anything…"
            style={{ flex: 1, height: 42, padding: '0 16px', fontSize: 14, background: 'transparent', border: 'none', outline: 'none', color: 'var(--text-primary)' }}
          />
          <button
            onClick={() => send()}
            disabled={!msg.trim() || loading}
            style={{
              width: 42, height: 42, borderRadius: 999,
              background: msg.trim() && !loading ? '#1B2B8E' : 'var(--bg-hover)',
              color: msg.trim() && !loading ? '#fff' : 'var(--text-muted)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: msg.trim() && !loading ? 'pointer' : 'default',
              transition: 'background 200ms',
            }}
          >
            <Icon name="send" size={15} />
          </button>
        </div>
        <div style={{ fontSize: 11, color: 'var(--text-muted)', textAlign: 'center', marginTop: 8, fontFamily: 'Instrument Sans, system-ui' }}>
          Powered by Claude AI — Full AI features coming soon
        </div>
      </div>

      <style>{`@keyframes novaDot { 0%, 80%, 100% { opacity: 0.25; transform: scale(0.85); } 40% { opacity: 1; transform: scale(1); } }`}</style>
    </div>
  );
}
