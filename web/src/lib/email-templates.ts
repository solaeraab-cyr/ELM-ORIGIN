type EmailTemplate = { subject: string; html: string };

const base = (content: string) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>ELM Origin</title>
</head>
<body style="margin:0;padding:0;background:#F3F4F8;font-family:'Helvetica Neue',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#F3F4F8;padding:40px 16px;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.07);">

        <!-- Header -->
        <tr>
          <td style="background:linear-gradient(135deg,#1B2B8E,#4F46E5);padding:32px 40px;">
            <span style="font-family:Georgia,serif;font-size:22px;font-weight:700;color:#ffffff;letter-spacing:-0.01em;">ELM Origin</span>
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td style="padding:36px 40px 28px;">
            ${content}
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="padding:20px 40px 32px;border-top:1px solid #E5E7EB;">
            <p style="margin:0;font-size:12px;color:#9CA3AF;line-height:1.6;">
              You received this email because you have an account at ELM Origin.<br/>
              <a href="https://elmorigin.com" style="color:#6366F1;text-decoration:none;">elmorigin.com</a>
              &nbsp;·&nbsp;
              <a href="https://elmorigin.com/legal/privacy" style="color:#6366F1;text-decoration:none;">Privacy Policy</a>
            </p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>
`;

const btn = (href: string, label: string) =>
  `<a href="${href}" style="display:inline-block;padding:14px 28px;background:linear-gradient(135deg,#1B2B8E,#4F46E5);color:#ffffff;font-size:14px;font-weight:600;text-decoration:none;border-radius:999px;margin-top:24px;">${label}</a>`;

const h1 = (text: string) =>
  `<h1 style="margin:0 0 8px;font-family:Georgia,serif;font-size:28px;font-weight:700;color:#111827;letter-spacing:-0.02em;">${text}</h1>`;

const p = (text: string) =>
  `<p style="margin:12px 0 0;font-size:15px;color:#4B5563;line-height:1.65;">${text}</p>`;

// ── Templates ─────────────────────────────────────────────────────────────────

export function welcomeEmail(userName: string, _email: string): EmailTemplate {
  return {
    subject: `Welcome to ELM Origin, ${userName}! 🎓`,
    html: base(`
      ${h1(`Welcome, ${userName}!`)}
      ${p('You\'ve just joined a community of students who are serious about learning. Your account is ready — here\'s what you can do right now:')}
      <ul style="margin:18px 0 0;padding-left:20px;font-size:14px;color:#4B5563;line-height:2;">
        <li>Join a <strong>live study room</strong> and focus with peers</li>
        <li>Practice with <strong>AI-powered mock interviews</strong></li>
        <li>Connect with a <strong>verified mentor</strong> in your field</li>
        <li>Chat with <strong>Nova</strong>, your AI study assistant</li>
      </ul>
      ${btn('https://elmorigin.com/home', 'Go to your dashboard →')}
      ${p('If you have any questions, reply to this email — we\'re happy to help.')}
    `),
  };
}

export function paymentReceiptEmail(
  userName: string,
  plan: string,
  amount: number,
): EmailTemplate {
  const now = new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
  return {
    subject: `Your ELM Origin ${plan} plan receipt`,
    html: base(`
      ${h1('Payment confirmed ✓')}
      ${p(`Hi ${userName}, your upgrade to <strong>ELM Origin ${plan}</strong> is active.`)}

      <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:24px;background:#F9FAFB;border-radius:12px;overflow:hidden;border:1px solid #E5E7EB;">
        <tr>
          <td style="padding:14px 20px;font-size:13px;color:#6B7280;border-bottom:1px solid #E5E7EB;">Plan</td>
          <td style="padding:14px 20px;font-size:13px;font-weight:600;color:#111827;text-align:right;border-bottom:1px solid #E5E7EB;">ELM Origin ${plan}</td>
        </tr>
        <tr>
          <td style="padding:14px 20px;font-size:13px;color:#6B7280;border-bottom:1px solid #E5E7EB;">Date</td>
          <td style="padding:14px 20px;font-size:13px;font-weight:600;color:#111827;text-align:right;border-bottom:1px solid #E5E7EB;">${now}</td>
        </tr>
        <tr>
          <td style="padding:14px 20px;font-size:14px;font-weight:700;color:#111827;">Total</td>
          <td style="padding:14px 20px;font-size:14px;font-weight:700;color:#111827;text-align:right;">₹${amount}</td>
        </tr>
      </table>

      ${btn('https://elmorigin.com/invoices', 'View your invoices →')}
      ${p('Your plan renews monthly. You can cancel anytime from <strong>Settings → Subscription</strong>.')}
    `),
  };
}

export function sessionReminderEmail(
  userName: string,
  sessionTitle: string,
  time: string,
): EmailTemplate {
  return {
    subject: `Reminder: "${sessionTitle}" starts soon`,
    html: base(`
      ${h1('Your session is starting soon ⏰')}
      ${p(`Hi ${userName}, just a heads-up — <strong>${sessionTitle}</strong> begins at <strong>${time}</strong>.`)}
      ${p('Prepare your workspace, close distracting tabs, and get ready to focus.')}
      ${btn('https://elmorigin.com/home', 'Open ELM Origin →')}
      ${p('You\'re getting this reminder because you have an upcoming session. To manage reminders, visit <a href="https://elmorigin.com/settings" style="color:#6366F1;">Settings → Notifications</a>.')}
    `),
  };
}

export function friendRequestEmail(userName: string, fromUser: string): EmailTemplate {
  return {
    subject: `${fromUser} sent you a friend request on ELM Origin`,
    html: base(`
      ${h1('New friend request 👋')}
      ${p(`Hi ${userName}, <strong>${fromUser}</strong> wants to connect with you on ELM Origin.`)}
      ${p('Study together, share notes, and keep each other accountable.')}
      ${btn('https://elmorigin.com/home', 'View request →')}
      ${p('To manage notification preferences, visit <a href="https://elmorigin.com/settings" style="color:#6366F1;">Settings → Notifications</a>.')}
    `),
  };
}
