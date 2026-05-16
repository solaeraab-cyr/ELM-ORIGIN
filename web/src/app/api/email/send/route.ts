import { NextResponse } from 'next/server';
import { sendEmail } from '@/lib/email';
import {
  welcomeEmail,
  paymentReceiptEmail,
  sessionReminderEmail,
  friendRequestEmail,
} from '@/lib/email-templates';

type TemplateKey = 'welcome' | 'payment_receipt' | 'session_reminder' | 'friend_request';

function buildTemplate(template: TemplateKey, data: Record<string, unknown>) {
  switch (template) {
    case 'welcome':
      return welcomeEmail(String(data.userName ?? ''), String(data.email ?? ''));
    case 'payment_receipt':
      return paymentReceiptEmail(
        String(data.userName ?? ''),
        String(data.plan ?? ''),
        Number(data.amount ?? 0),
      );
    case 'session_reminder':
      return sessionReminderEmail(
        String(data.userName ?? ''),
        String(data.sessionTitle ?? ''),
        String(data.time ?? ''),
      );
    case 'friend_request':
      return friendRequestEmail(String(data.userName ?? ''), String(data.fromUser ?? ''));
    default:
      return null;
  }
}

export async function POST(req: Request) {
  let to: string;
  let template: TemplateKey;
  let data: Record<string, unknown>;

  try {
    const body = await req.json();
    to = String(body.to ?? '').trim();
    template = body.template as TemplateKey;
    data = (body.data as Record<string, unknown>) ?? {};
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  if (!to) {
    return NextResponse.json({ error: 'Missing "to" field' }, { status: 400 });
  }

  const built = buildTemplate(template, data);
  if (!built) {
    return NextResponse.json({ error: `Unknown template: ${template}` }, { status: 400 });
  }

  const result = await sendEmail({ to, subject: built.subject, html: built.html });

  if (!result.sent && result.reason === 'not_configured') {
    return NextResponse.json({ sent: false, reason: 'not_configured' });
  }

  if (!result.sent) {
    return NextResponse.json({ sent: false, reason: result.reason }, { status: 502 });
  }

  return NextResponse.json({ sent: true });
}
