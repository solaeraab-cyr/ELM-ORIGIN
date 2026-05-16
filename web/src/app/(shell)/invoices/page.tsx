'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

type Transaction = {
  id: string;
  order_id: string;
  plan: string;
  amount: number;
  currency: string;
  status: string;
  is_mock: boolean;
  created_at: string;
};

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric',
  });
}

function StatusBadge({ status, isMock }: { status: string; isMock: boolean }) {
  const color = status === 'paid'
    ? { bg: 'rgba(16,185,129,0.10)', text: 'var(--mint-600, #059669)' }
    : { bg: 'rgba(245,158,11,0.10)', text: 'var(--amber-600, #d97706)' };
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '3px 10px', borderRadius: 999, background: color.bg, color: color.text, fontSize: 11, fontWeight: 700 }}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
      {isMock && <span style={{ opacity: 0.7 }}>· Mock</span>}
    </span>
  );
}

export default function InvoicesPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) { setLoading(false); return; }
      const { data, error: dbErr } = await supabase
        .from('transactions')
        .select('id, order_id, plan, amount, currency, status, is_mock, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      if (dbErr) {
        // Table may not exist yet — show empty state gracefully
        console.warn('[invoices]', dbErr.message);
      }
      setTransactions((data as Transaction[]) ?? []);
      setLoading(false);
    });
  }, []);

  return (
    <div style={{ padding: '32px 40px 80px', maxWidth: 780, margin: '0 auto' }}>
      <div style={{ marginBottom: 6 }}>
        <Link href="/settings" style={{ fontSize: 13, color: 'var(--text-tertiary)', textDecoration: 'none' }}>← Settings</Link>
      </div>
      <h1 style={{ fontFamily: 'Fraunces, serif', fontSize: 40, fontWeight: 700, letterSpacing: '-0.02em', marginBottom: 6 }}>
        Billing &amp; Invoices
      </h1>
      <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 36 }}>Your payment history and plan upgrades.</p>

      {loading && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {[1, 2, 3].map(i => (
            <div key={i} style={{ height: 72, borderRadius: 14, background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', animation: 'pulse 1.5s ease-in-out infinite' }} />
          ))}
          <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.5} }`}</style>
        </div>
      )}

      {!loading && error && (
        <div style={{ background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 14, padding: 20, fontSize: 14, color: '#ef4444' }}>
          {error}
        </div>
      )}

      {!loading && !error && transactions.length === 0 && (
        <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 18, padding: '60px 40px', textAlign: 'center' }}>
          <div style={{ fontSize: 44, marginBottom: 16 }}>🧾</div>
          <h3 style={{ fontFamily: 'Fraunces, serif', fontSize: 22, fontWeight: 600, marginBottom: 8 }}>No transactions yet</h3>
          <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 24 }}>
            Your invoices will appear here once you upgrade your plan.
          </p>
          <Link
            href="/pricing"
            style={{ display: 'inline-flex', alignItems: 'center', height: 40, padding: '0 20px', borderRadius: 999, background: 'var(--gradient-brand)', color: '#fff', fontSize: 13, fontWeight: 600, textDecoration: 'none' }}
          >
            View plans →
          </Link>
        </div>
      )}

      {!loading && !error && transactions.length > 0 && (
        <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 18, overflow: 'hidden' }}>
          {/* Table header */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 120px 100px 120px', padding: '12px 22px', background: 'var(--bg-hover)', borderBottom: '1px solid var(--border-subtle)' }}>
            {['Plan', 'Date', 'Amount', 'Status'].map(h => (
              <div key={h} style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.06em', color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>{h}</div>
            ))}
          </div>

          {transactions.map((tx, i) => (
            <div
              key={tx.id}
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 120px 100px 120px',
                padding: '16px 22px',
                borderBottom: i < transactions.length - 1 ? '1px solid var(--border-subtle)' : 'none',
                alignItems: 'center',
              }}
            >
              <div>
                <div style={{ fontWeight: 600, fontSize: 14 }}>ELM Origin {tx.plan}</div>
                <div style={{ fontSize: 11, fontFamily: 'JetBrains Mono, monospace', color: 'var(--text-tertiary)', marginTop: 2 }}>
                  {tx.order_id}
                </div>
              </div>
              <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{fmtDate(tx.created_at)}</div>
              <div style={{ fontFamily: 'Fraunces, serif', fontWeight: 700, fontSize: 15 }}>
                {tx.currency === 'INR' ? '₹' : '$'}{tx.amount}
              </div>
              <StatusBadge status={tx.status} isMock={tx.is_mock} />
            </div>
          ))}
        </div>
      )}

      <div style={{ marginTop: 28, fontSize: 13, color: 'var(--text-tertiary)' }}>
        Questions about billing? <Link href="/settings?section=help" style={{ color: 'var(--text-primary)', fontWeight: 500 }}>Contact support</Link>
      </div>
    </div>
  );
}
