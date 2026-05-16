import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Terms of Service — ELM Origin',
  description: 'Terms and conditions for using the ELM Origin education platform.',
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

export default function TermsPage() {
  return (
    <div style={{ padding: '80px 24px 120px', maxWidth: 760, margin: '0 auto' }}>
      <div style={{ marginBottom: 8 }}>
        <Link href="/" style={{ fontSize: 13, color: 'var(--text-tertiary)', textDecoration: 'none' }}>← ELM Origin</Link>
      </div>

      <h1 style={{ fontFamily: 'Fraunces, serif', fontSize: 'clamp(32px, 5vw, 48px)', fontWeight: 800, letterSpacing: '-0.02em', marginTop: 16, marginBottom: 8 }}>
        Terms of Service
      </h1>
      <p style={{ fontSize: 14, color: 'var(--text-tertiary)', marginBottom: 48 }}>
        Effective date: {EFFECTIVE_DATE} &nbsp;·&nbsp; Last updated: {EFFECTIVE_DATE}
      </p>

      <p style={P}>
        Welcome to ELM Origin. By creating an account or using any part of the ELM Origin platform (&quot;Service&quot;), you agree to be bound by these Terms of Service (&quot;Terms&quot;). If you do not agree, do not use the Service. These Terms constitute a legally binding agreement between you and ELM Origin (&quot;Company&quot;, &quot;we&quot;, &quot;us&quot;).
      </p>

      {/* 1 */}
      <h2 style={S}>1. Eligibility</h2>
      <p style={P}>You must be at least 13 years old to use ELM Origin. By using the Service you represent and warrant that you meet this requirement and that all information you provide is accurate. If you are under 18, you represent that a parent or guardian has reviewed and agreed to these Terms on your behalf.</p>

      {/* 2 */}
      <h2 style={S}>2. Account Registration</h2>
      <p style={P}>You are responsible for maintaining the confidentiality of your account credentials. You agree to:</p>
      <ul style={{ paddingLeft: 22, marginBottom: 14 }}>
        {[
          'Provide accurate, current, and complete information during registration',
          'Keep your password secure and not share it with others',
          'Notify us immediately at support@elmorigin.com of any unauthorised access',
          'Accept responsibility for all activity that occurs under your account',
        ].map(item => <li key={item} style={LI}>{item}</li>)}
      </ul>
      <p style={P}>We reserve the right to suspend or terminate accounts that violate these Terms.</p>

      {/* 3 */}
      <h2 style={S}>3. Acceptable Use</h2>
      <p style={P}>You agree not to use ELM Origin to:</p>
      <ul style={{ paddingLeft: 22, marginBottom: 14 }}>
        {[
          'Violate any applicable law or regulation',
          'Harass, bully, or harm other users',
          'Post or transmit misleading, defamatory, obscene, or illegal content',
          'Impersonate another person or entity',
          'Attempt to gain unauthorised access to any part of the Service or its infrastructure',
          'Scrape, crawl, or systematically download platform content without written permission',
          'Use the platform to conduct commercial activities without our prior written consent',
          'Interfere with or disrupt the integrity or performance of the Service',
        ].map(item => <li key={item} style={LI}>{item}</li>)}
      </ul>
      <p style={P}>We reserve the right to remove content and suspend accounts that violate these guidelines without prior notice.</p>

      {/* 4 */}
      <h2 style={S}>4. Subscription Plans &amp; Payment</h2>
      <p style={P}>ELM Origin offers Free, Pro (₹99/month), and Elite (₹299/month) subscription tiers. By subscribing to a paid plan you agree to:</p>
      <ul style={{ paddingLeft: 22, marginBottom: 14 }}>
        {[
          'Pay all applicable fees as described at the time of purchase',
          'Provide valid payment information; subscriptions auto-renew monthly unless cancelled',
          'Cancel before the renewal date to avoid being charged for the next billing cycle',
        ].map(item => <li key={item} style={LI}>{item}</li>)}
      </ul>
      <p style={P}><strong>Refunds.</strong> We offer a 30-day money-back guarantee on first-time Pro or Elite subscriptions. Subsequent billing cycles are non-refundable. To request a refund, contact support@elmorigin.com within 30 days of the charge.</p>
      <p style={P}><strong>Price changes.</strong> We may change subscription prices with at least 30 days&apos; notice. Price changes take effect at your next renewal date.</p>

      {/* 5 */}
      <h2 style={S}>5. Mentor Sessions</h2>
      <p style={P}>ELM Origin connects students with independent mentors. Mentor sessions are billed separately per session. By booking a mentor session you agree that:</p>
      <ul style={{ paddingLeft: 22, marginBottom: 14 }}>
        {[
          'Cancellations made less than 24 hours before the session are non-refundable',
          'Mentors are independent contractors; ELM Origin is not responsible for advice given in sessions',
          'Any disputes regarding session quality should be reported within 48 hours via our support channel',
        ].map(item => <li key={item} style={LI}>{item}</li>)}
      </ul>

      {/* 6 */}
      <h2 style={S}>6. User Content</h2>
      <p style={P}>You retain ownership of any content you post (profile information, community posts, study notes). By posting content on ELM Origin, you grant us a non-exclusive, worldwide, royalty-free licence to display and distribute that content within the Service.</p>
      <p style={P}>You are solely responsible for the content you post. We reserve the right to remove content that violates these Terms or our Community Guidelines.</p>

      {/* 7 */}
      <h2 style={S}>7. Intellectual Property</h2>
      <p style={P}>All trademarks, logos, platform design, and original content created by ELM Origin are our exclusive property. You may not reproduce, distribute, or create derivative works from our proprietary content without written permission.</p>

      {/* 8 */}
      <h2 style={S}>8. Privacy</h2>
      <p style={P}>Your use of ELM Origin is also governed by our <Link href="/legal/privacy" style={{ color: 'var(--text-primary)', fontWeight: 500 }}>Privacy Policy</Link>, which is incorporated into these Terms by reference.</p>

      {/* 9 */}
      <h2 style={S}>9. Disclaimers</h2>
      <p style={P}>THE SERVICE IS PROVIDED &quot;AS IS&quot; WITHOUT WARRANTIES OF ANY KIND, EXPRESS OR IMPLIED. ELM ORIGIN DOES NOT WARRANT THAT THE SERVICE WILL BE UNINTERRUPTED, ERROR-FREE, OR FREE OF VIRUSES. YOUR USE OF THE SERVICE IS AT YOUR OWN RISK.</p>
      <p style={P}>ELM Origin does not guarantee any specific academic outcomes, job placements, or career results from using the platform.</p>

      {/* 10 */}
      <h2 style={S}>10. Limitation of Liability</h2>
      <p style={P}>TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, ELM ORIGIN SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES ARISING OUT OF YOUR USE OF THE SERVICE. OUR TOTAL LIABILITY FOR ANY CLAIM SHALL NOT EXCEED THE AMOUNT YOU PAID TO US IN THE 12 MONTHS PRECEDING THE CLAIM.</p>

      {/* 11 */}
      <h2 style={S}>11. Termination</h2>
      <p style={P}>You may close your account at any time via <strong>Settings → Account → Delete Account</strong>. We may terminate or suspend your account immediately if you violate these Terms. Upon termination, your right to use the Service ceases and we may delete your account data as described in our Privacy Policy.</p>

      {/* 12 */}
      <h2 style={S}>12. Governing Law &amp; Dispute Resolution</h2>
      <p style={P}>These Terms are governed by the laws of India. Any dispute arising from these Terms shall first be attempted to be resolved through good-faith negotiation. If unresolved within 30 days, disputes shall be submitted to binding arbitration under the Indian Arbitration and Conciliation Act, 1996, in Bengaluru, Karnataka.</p>

      {/* 13 */}
      <h2 style={S}>13. Changes to These Terms</h2>
      <p style={P}>We may update these Terms from time to time. We will notify you of material changes via email or in-app notice at least 14 days before the new Terms take effect. Continued use of the Service after the effective date constitutes acceptance.</p>

      {/* 14 */}
      <h2 style={S}>14. Contact</h2>
      <p style={P}>Questions about these Terms should be directed to:</p>
      <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 14, padding: '20px 24px', fontSize: 14, lineHeight: 1.8, color: 'var(--text-secondary)' }}>
        <strong style={{ color: 'var(--text-primary)' }}>ELM Origin — Legal</strong><br />
        Email: legal@elmorigin.com<br />
        Response time: within 30 business days
      </div>

      <div style={{ marginTop: 60, paddingTop: 24, borderTop: '1px solid var(--border-subtle)', display: 'flex', gap: 24, fontSize: 13, color: 'var(--text-tertiary)' }}>
        <Link href="/legal/privacy" style={{ color: 'var(--text-tertiary)', textDecoration: 'none' }}>Privacy Policy</Link>
        <Link href="/" style={{ color: 'var(--text-tertiary)', textDecoration: 'none' }}>Back to ELM Origin</Link>
      </div>
    </div>
  );
}
