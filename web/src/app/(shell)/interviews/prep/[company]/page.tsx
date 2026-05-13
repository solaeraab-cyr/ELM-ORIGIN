'use client';

import { use, useState } from 'react';
import Link from 'next/link';
import { notFound, useRouter } from 'next/navigation';
import { Icon } from '@/components/primitives';
import { COMPANIES, COMPANY_QUESTIONS } from '@/lib/interviews';

export default function CompanyPrepPage({ params }: { params: Promise<{ company: string }> }) {
  const { company: companySlug } = use(params);
  const router = useRouter();
  const company = COMPANIES.find(c => c.name.toLowerCase() === companySlug.toLowerCase());
  if (!company) notFound();

  const [tab, setTab] = useState<'All' | 'Coding' | 'System Design' | 'Behavioral'>('All');
  const [done, setDone] = useState<Record<string, boolean>>({});

  const questions = COMPANY_QUESTIONS[company.name] || COMPANY_QUESTIONS.Google;
  const filtered = tab === 'All' ? questions : questions.filter(q => q.t === tab);
  const doneCount = Object.values(done).filter(Boolean).length;

  return (
    <div style={{ maxWidth: 960, margin: '0 auto', padding: '32px 40px' }}>
      <Link href="/interviews" style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 13, color: 'var(--text-secondary)', marginBottom: 16, textDecoration: 'none' }}>
        <Icon name="chevronL" size={13} /> Back to interviews
      </Link>
      <div style={{ display: 'flex', alignItems: 'center', gap: 18, marginBottom: 18, flexWrap: 'wrap' }}>
        <div style={{ width: 56, height: 56, borderRadius: 14, background: `${company.tone}14`, color: company.tone, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Fraunces, serif', fontSize: 26, fontWeight: 700 }}>{company.mono}</div>
        <div>
          <h1 style={{ fontFamily: 'Fraunces, serif', fontSize: 40, fontWeight: 500, letterSpacing: '-0.02em', lineHeight: 1.05 }}>{company.name}</h1>
          <div style={{ fontSize: 13, color: 'var(--text-tertiary)', marginTop: 2 }}>{company.qs} verified questions · updated weekly</div>
        </div>
      </div>

      <div style={{ margin: '24px 0', padding: 14, background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 12, display: 'flex', alignItems: 'center', gap: 14 }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 12, color: 'var(--text-tertiary)', marginBottom: 4 }}>Your progress</div>
          <div style={{ height: 6, background: 'var(--bg-hover)', borderRadius: 999, overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${(doneCount / questions.length) * 100}%`, background: 'var(--gradient-brand)', transition: 'width 360ms' }} />
          </div>
        </div>
        <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 14, fontWeight: 600 }}>{doneCount}/{questions.length}</div>
      </div>

      <div style={{ display: 'flex', gap: 4, padding: 4, background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 12, marginBottom: 18, width: 'fit-content', flexWrap: 'wrap' }}>
        {(['All', 'Coding', 'System Design', 'Behavioral'] as const).map(t => {
          const a = tab === t;
          return (
            <button
              key={t}
              onClick={() => setTab(t)}
              style={{
                padding: '8px 16px', borderRadius: 9, fontSize: 13, fontWeight: 600,
                background: a ? 'var(--bg-hover)' : 'transparent',
                color: a ? 'var(--text-primary)' : 'var(--text-secondary)',
              }}
            >{t}</button>
          );
        })}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {filtered.map((q, i) => {
          const isDone = !!done[q.q];
          return (
            <div key={i} style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 16, padding: 18, display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
              <button
                onClick={() => setDone(d => ({ ...d, [q.q]: !d[q.q] }))}
                style={{
                  width: 22, height: 22, borderRadius: 6,
                  border: `1.5px solid ${isDone ? 'var(--mint-500)' : 'var(--border-default)'}`,
                  background: isDone ? 'var(--mint-500)' : 'transparent',
                  color: '#fff', display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0, cursor: 'pointer',
                }}
              >{isDone && <Icon name="check" size={12} />}</button>
              <div style={{ flex: 1, minWidth: 240 }}>
                <div style={{ fontSize: 14, fontWeight: 600, lineHeight: 1.4, textDecoration: isDone ? 'line-through' : 'none', color: isDone ? 'var(--text-tertiary)' : 'var(--text-primary)' }}>{q.q}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 6, flexWrap: 'wrap' }}>
                  <span style={{ padding: '3px 8px', borderRadius: 999, background: 'var(--bg-hover)', fontSize: 11, color: 'var(--text-secondary)' }}>{q.t}</span>
                  <span style={{
                    padding: '3px 8px', borderRadius: 999, background: 'var(--bg-hover)', fontSize: 11,
                    color: q.d === 'Hard' ? '#ef4444' : q.d === 'Medium' ? 'var(--amber-600)' : 'var(--mint-600)', fontWeight: 600,
                  }}>{q.d}</span>
                  <span style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>Asked in {q.freq} interviews this year</span>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                <button onClick={() => router.push('/nova')} style={{ height: 32, padding: '0 12px', borderRadius: 999, background: 'var(--bg-hover)', border: '1px solid var(--border-default)', fontSize: 12, fontWeight: 500 }}>Solo</button>
                <button onClick={() => router.push('/interviews')} style={{ height: 32, padding: '0 12px', borderRadius: 999, background: 'var(--bg-hover)', border: '1px solid var(--border-default)', fontSize: 12, fontWeight: 500 }}>Peer</button>
                <button onClick={() => router.push('/interviews')} style={{ height: 32, padding: '0 12px', borderRadius: 999, background: 'var(--gradient-brand)', color: '#fff', fontSize: 12, fontWeight: 600 }}>Coach</button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
