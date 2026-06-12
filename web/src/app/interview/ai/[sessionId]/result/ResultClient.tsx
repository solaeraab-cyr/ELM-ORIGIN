'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { ScorecardRow, TurnRow } from './page';

export default function ResultClient({
  sessionId, scorecard: initialScorecard, turns, meta,
}: {
  sessionId: string;
  scorecard: ScorecardRow | null;
  turns: TurnRow[];
  meta: { interview_format: string | null; prompt: string | null; started_at: string | null; ended_at: string | null } | null;
}) {
  const router = useRouter();
  const [scorecard, setScorecard] = useState<ScorecardRow | null>(initialScorecard);
  const [showTranscript, setShowTranscript] = useState(false);
  const [generating, setGenerating] = useState(!initialScorecard);
  const [shareCopied, setShareCopied] = useState(false);

  // If the user lands here before the scorecard has been written, kick it off.
  useEffect(() => {
    if (scorecard || !generating) return;
    (async () => {
      try {
        const res = await fetch('/api/ai-interview/end', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ sessionId }) });
        const data = await res.json();
        if (data.scorecard) setScorecard(data.scorecard);
      } catch { /* leave generating=true so the placeholder stays */ }
      setGenerating(false);
    })();
  }, [scorecard, generating, sessionId]);

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-base)', padding: '40px 24px 80px' }}>
      <div style={{ maxWidth: 880, margin: '0 auto' }}>
        <div style={{ marginBottom: 6, fontSize: 12, color: 'var(--text-tertiary)', letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: 700 }}>{meta?.interview_format ?? 'AI Mock Interview'}</div>
        <h1 style={{ fontFamily: 'Fraunces, serif', fontSize: 36, fontWeight: 700, letterSpacing: '-0.02em', marginBottom: 8 }}>Scorecard</h1>
        <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 28 }}>{meta?.prompt ? `Topic: ${meta.prompt}` : 'AI-graded across content, communication, and confidence.'}</p>

        {!scorecard && generating && (
          <div style={{ padding: 32, textAlign: 'center', background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 18, marginBottom: 24 }}>
            Generating your scorecard…
          </div>
        )}

        {scorecard && (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 14, marginBottom: 28 }}>
              <Circle label="Content" value={scorecard.content_score} />
              <Circle label="Communication" value={scorecard.communication_score} />
              <Circle label="Confidence" value={scorecard.confidence_score} />
              <Circle label="Overall" value={scorecard.overall_score} highlight />
            </div>

            <Section title="Strengths">
              <ul style={LIST}>
                {(scorecard.strengths ?? []).map((s, i) => <li key={i} style={LI}><span style={DOT('var(--mint-500)')} />{s}</li>)}
                {(!scorecard.strengths || scorecard.strengths.length === 0) && <li style={LI_MUTED}>—</li>}
              </ul>
            </Section>

            <Section title="Areas to work on">
              <ul style={LIST}>
                {(scorecard.improvements ?? []).map((s, i) => <li key={i} style={LI}><span style={DOT('var(--amber-500)')} />{s}</li>)}
                {(!scorecard.improvements || scorecard.improvements.length === 0) && <li style={LI_MUTED}>—</li>}
              </ul>
            </Section>

            {scorecard.next_steps && (
              <Section title="Next steps">
                <p style={{ fontSize: 14, lineHeight: 1.6, color: 'var(--text-secondary)' }}>{scorecard.next_steps}</p>
              </Section>
            )}
          </>
        )}

        <div style={{ marginTop: 14, marginBottom: 28 }}>
          <button
            onClick={() => setShowTranscript(v => !v)}
            style={{ background: 'transparent', border: 'none', color: 'var(--brand-500)', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}
          >
            {showTranscript ? 'Hide full transcript' : 'View full transcript'}
          </button>
          {showTranscript && (
            <div style={{ marginTop: 14, background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 14, padding: 18 }}>
              <div style={{ fontSize: 11, color: 'var(--text-tertiary)', marginBottom: 10 }}>Click any AI bubble to replay it via your browser voice (free tier).</div>
              {turns.map((t) => (
                <div key={t.id} style={{ marginBottom: 12, padding: 10, borderRadius: 10, background: t.role === 'ai' ? 'var(--bg-hover)' : 'rgba(79,70,229,0.06)', position: 'relative' }}>
                  <div style={{ fontSize: 11, color: 'var(--text-tertiary)', fontWeight: 700, marginBottom: 4 }}>{t.role === 'ai' ? 'INTERVIEWER' : 'CANDIDATE'}</div>
                  <div style={{ fontSize: 14, lineHeight: 1.5, whiteSpace: 'pre-wrap' }}>{t.content}</div>
                  {t.role === 'ai' && (
                    <button
                      onClick={() => {
                        if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
                        window.speechSynthesis.cancel();
                        const u = new SpeechSynthesisUtterance(t.content);
                        const v = window.speechSynthesis.getVoices();
                        const picked =
                          v.find(x => x.lang === 'en-IN') ||
                          v.find(x => x.lang.startsWith('en-') && /Google|Microsoft/.test(x.name)) ||
                          v.find(x => x.lang.startsWith('en-'));
                        if (picked) u.voice = picked;
                        window.speechSynthesis.speak(u);
                      }}
                      title="Replay"
                      style={{ position: 'absolute', top: 8, right: 8, height: 26, padding: '0 10px', borderRadius: 999, background: 'var(--bg-surface)', border: '1px solid var(--border-default)', fontSize: 11, fontWeight: 600, cursor: 'pointer' }}
                    >▶ Replay</button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <button
            onClick={() => router.push('/interviews')}
            style={{ height: 48, padding: '0 22px', borderRadius: 999, background: 'var(--gradient-brand)', color: '#fff', fontSize: 14, fontWeight: 600, border: 'none', cursor: 'pointer' }}
          >
            Practice again
          </button>
          {scorecard?.share_token && (
            <button
              onClick={async () => {
                const url = `${window.location.origin}/interview/ai/share/${scorecard.share_token}`;
                try { await navigator.clipboard.writeText(url); setShareCopied(true); setTimeout(() => setShareCopied(false), 2000); } catch {}
              }}
              style={{ height: 48, padding: '0 22px', borderRadius: 999, background: 'var(--bg-hover)', border: '1px solid var(--border-default)', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}
            >
              {shareCopied ? 'Link copied!' : 'Share scorecard'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function Circle({ label, value, highlight }: { label: string; value: number | null; highlight?: boolean }) {
  const v = value ?? 0;
  const colour = highlight ? 'var(--brand-500)' : 'var(--mint-600)';
  return (
    <div style={{ background: 'var(--bg-surface)', border: highlight ? '2px solid var(--brand-500)' : '1px solid var(--border-subtle)', borderRadius: 18, padding: 18, textAlign: 'center' }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>{label}</div>
      <div style={{ fontFamily: 'Fraunces, serif', fontSize: 40, fontWeight: 700, color: colour }}>{value ?? '–'}<span style={{ fontSize: 18, color: 'var(--text-tertiary)' }}>/10</span></div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 18 }}>
      <h2 style={{ fontFamily: 'Fraunces, serif', fontSize: 18, fontWeight: 600, marginBottom: 10 }}>{title}</h2>
      {children}
    </div>
  );
}

const LIST: React.CSSProperties = { listStyle: 'none', padding: 0, margin: 0 };
const LI: React.CSSProperties = { display: 'flex', alignItems: 'flex-start', gap: 10, padding: '8px 0', fontSize: 14, color: 'var(--text-primary)', lineHeight: 1.5 };
const LI_MUTED: React.CSSProperties = { ...LI, color: 'var(--text-tertiary)' };
const DOT = (c: string): React.CSSProperties => ({ width: 8, height: 8, borderRadius: 999, marginTop: 6, background: c, flexShrink: 0 });
