import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Privacy Policy — ELM Origin',
  description: 'How ELM Origin collects, uses, and protects your personal data.',
};

const EFFECTIVE_DATE = 'May 16, 2025';

const S: React.CSSProperties = {
  fontFamily: 'Fraunces, serif',
  fontSize: 22,
  fontWeight: 600,
  marginTop: 44,
  marginBottom: 12,
  letterSpacing: '-0.01em',
};
const P: React.CSSProperties = { fontSize: 15, lineHeight: 1.8, color: 'var(--text-secondary)', marginBottom: 14 };
const LI: React.CSSProperties = { fontSize: 15, lineHeight: 1.8, color: 'var(--text-secondary)', marginBottom: 6 };

export default function PrivacyPage() {
  return (
    <div style={{ padding: '80px 24px 120px', maxWidth: 760, margin: '0 auto' }}>
      <div style={{ marginBottom: 8 }}>
        <Link href="/" style={{ fontSize: 13, color: 'var(--text-tertiary)', textDecoration: 'none' }}>← ELM Origin</Link>
      </div>

      <h1 style={{ fontFamily: 'Fraunces, serif', fontSize: 'clamp(32px, 5vw, 48px)', fontWeight: 800, letterSpacing: '-0.02em', marginTop: 16, marginBottom: 8 }}>
        Privacy Policy
      </h1>
      <p style={{ fontSize: 14, color: 'var(--text-tertiary)', marginBottom: 48 }}>
        Effective date: {EFFECTIVE_DATE} &nbsp;·&nbsp; Last updated: {EFFECTIVE_DATE}
      </p>

      <p style={P}>
        ELM Origin (&quot;we&quot;, &quot;us&quot;, or &quot;our&quot;) operates the ELM Origin education platform (the &quot;Service&quot;). This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our Service. By accessing or using ELM Origin, you agree to the terms of this Privacy Policy.
      </p>

      {/* 1 */}
      <h2 style={S}>1. Information We Collect</h2>
      <p style={P}><strong>Account Information</strong> — When you register, we collect your name, email address, and optional profile details (handle, bio, institution, year of study, profile photo).</p>
      <p style={P}><strong>Usage Data</strong> — We automatically collect information about how you interact with the platform: pages visited, study room activity, interview sessions, feature usage, and timestamps.</p>
      <p style={P}><strong>Payment Information</strong> — For paid subscriptions, billing is handled by our payment processors (Cashfree / Razorpay). We store only a subscription status and plan identifier — we never store raw card numbers, UPI handles, or bank details.</p>
      <p style={P}><strong>Communications</strong> — If you contact our support team, we retain those communications to resolve your issue and improve the Service.</p>
      <p style={P}><strong>Cookies &amp; Local Storage</strong> — We use session cookies for authentication and localStorage for user preferences (theme, notification settings). See Section 7 for details.</p>

      {/* 2 */}
      <h2 style={S}>2. How We Use Your Information</h2>
      <ul style={{ paddingLeft: 22, marginBottom: 14 }}>
        {[
          'Provide, maintain, and improve the Service',
          'Personalise your learning experience and recommendations',
          'Process subscription payments and send receipts',
          'Send transactional emails (session reminders, mentor replies) — only if you opt in',
          'Enforce our Terms of Service and prevent fraud or abuse',
          'Comply with legal obligations',
          'Aggregate anonymised analytics to understand how students use the platform',
        ].map(item => <li key={item} style={LI}>{item}</li>)}
      </ul>
      <p style={P}>We <strong>do not</strong> sell your personal data to third parties for advertising purposes.</p>

      {/* 3 */}
      <h2 style={S}>3. Sharing of Information</h2>
      <p style={P}>We share your information only in the following limited circumstances:</p>
      <ul style={{ paddingLeft: 22, marginBottom: 14 }}>
        {[
          'Service providers — cloud hosting (Supabase / AWS), payment processors, analytics tools — under confidentiality agreements',
          'Other users — your public profile (name, handle, avatar, bio) is visible to other users of the platform',
          'Legal requirements — if required by applicable law, court order, or to protect the rights of ELM Origin or others',
          'Business transfers — in the event of a merger, acquisition, or sale of assets, your data may be transferred (you will be notified)',
        ].map(item => <li key={item} style={LI}>{item}</li>)}
      </ul>

      {/* 4 */}
      <h2 style={S}>4. Data Retention</h2>
      <p style={P}>We retain your account data for as long as your account is active. If you delete your account, we will delete or anonymise your personal data within 30 days, except where retention is required by law or legitimate business purposes (e.g., billing records for up to 7 years as required under Indian law).</p>

      {/* 5 */}
      <h2 style={S}>5. Your Rights</h2>
      <p style={P}>Depending on your jurisdiction, you may have the following rights:</p>
      <ul style={{ paddingLeft: 22, marginBottom: 14 }}>
        {[
          'Access — request a copy of the personal data we hold about you',
          'Correction — request correction of inaccurate or incomplete data',
          'Deletion — request deletion of your account and personal data',
          'Portability — receive your data in a machine-readable format',
          'Objection — object to certain processing activities',
          'Withdrawal of consent — withdraw consent to optional processing at any time',
        ].map(item => <li key={item} style={LI}>{item}</li>)}
      </ul>
      <p style={P}>To exercise these rights, email us at <strong>privacy@elmorigin.com</strong>. We will respond within 30 days.</p>

      {/* 6 */}
      <h2 style={S}>6. Account Deletion</h2>
      <p style={P}>You may request account deletion at any time via <strong>Settings → Account → Delete Account</strong> or by emailing privacy@elmorigin.com. Upon deletion:</p>
      <ul style={{ paddingLeft: 22, marginBottom: 14 }}>
        {[
          'Your profile, posts, and study room history will be permanently removed',
          'Your username will be released and may be claimed by others',
          'Active subscriptions will be cancelled; no prorated refund is issued for the current billing period',
          'Anonymised usage data may be retained for analytics',
        ].map(item => <li key={item} style={LI}>{item}</li>)}
      </ul>

      {/* 7 */}
      <h2 style={S}>7. Cookie Policy</h2>
      <p style={P}>We use the following types of cookies and browser storage:</p>
      <ul style={{ paddingLeft: 22, marginBottom: 14 }}>
        {[
          'Session cookies — required for authentication; deleted when you sign out',
          'Preference storage (localStorage) — stores your theme choice and notification preferences; never sent to our servers',
          'Analytics cookies — anonymised usage data collected via privacy-friendly analytics; you may opt out in Settings',
        ].map(item => <li key={item} style={LI}>{item}</li>)}
      </ul>
      <p style={P}>We do not use third-party advertising cookies.</p>

      {/* 8 */}
      <h2 style={S}>8. Security</h2>
      <p style={P}>We implement industry-standard security measures including HTTPS/TLS encryption in transit, AES-256 encryption at rest (via Supabase), row-level security policies, and regular security audits. No system is perfectly secure; in the event of a data breach we will notify affected users within 72 hours as required by applicable law.</p>

      {/* 9 */}
      <h2 style={S}>9. Children&apos;s Privacy</h2>
      <p style={P}>ELM Origin is intended for users aged 13 and above. We do not knowingly collect personal information from children under 13. If you believe a child under 13 has provided us their information, please contact privacy@elmorigin.com and we will delete it promptly.</p>

      {/* 10 */}
      <h2 style={S}>10. Changes to This Policy</h2>
      <p style={P}>We may update this Privacy Policy from time to time. Material changes will be communicated via email or an in-app notice at least 14 days before taking effect. Your continued use of the Service after the effective date constitutes acceptance of the updated policy.</p>

      {/* 11 */}
      <h2 style={S}>11. Contact Us</h2>
      <p style={P}>Questions, requests, or complaints about this Privacy Policy should be directed to:</p>
      <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 14, padding: '20px 24px', fontSize: 14, lineHeight: 1.8, color: 'var(--text-secondary)' }}>
        <strong style={{ color: 'var(--text-primary)' }}>ELM Origin — Privacy Team</strong><br />
        Email: privacy@elmorigin.com<br />
        Response time: within 30 business days
      </div>

      <div style={{ marginTop: 60, paddingTop: 24, borderTop: '1px solid var(--border-subtle)', display: 'flex', gap: 24, fontSize: 13, color: 'var(--text-tertiary)' }}>
        <Link href="/legal/terms" style={{ color: 'var(--text-tertiary)', textDecoration: 'none' }}>Terms of Service</Link>
        <Link href="/" style={{ color: 'var(--text-tertiary)', textDecoration: 'none' }}>Back to ELM Origin</Link>
      </div>
    </div>
  );
}
