import type { CreateEmailOptions } from 'resend';

const FROM = 'ELM Origin <noreply@elmorigin.com>';

export type SendEmailOptions = {
  to: string | string[];
  subject: string;
  html: string;
};

/**
 * Sends an email via Resend.
 * Returns { sent: true } on success.
 * Returns { sent: false, reason } if not configured or on error — never throws.
 */
export async function sendEmail(
  opts: SendEmailOptions,
): Promise<{ sent: boolean; reason?: string }> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return { sent: false, reason: 'not_configured' };
  }

  try {
    // Dynamic import keeps Resend out of the client bundle
    const { Resend } = await import('resend');
    const resend = new Resend(apiKey);

    const payload: CreateEmailOptions = {
      from: FROM,
      to: Array.isArray(opts.to) ? opts.to : [opts.to],
      subject: opts.subject,
      html: opts.html,
    };

    const { error } = await resend.emails.send(payload);
    if (error) {
      console.error('[email] Resend error:', error.message);
      return { sent: false, reason: error.message };
    }
    return { sent: true };
  } catch (err) {
    console.error('[email] unexpected error:', err);
    return { sent: false, reason: String(err) };
  }
}
