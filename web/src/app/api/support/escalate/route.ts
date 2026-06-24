import { createClient as createServerClient } from '@/lib/supabase/server';
import { createClient } from '@supabase/supabase-js';
import { sendEmail } from '@/lib/email';

export const runtime = 'nodejs';

type ChatMessage = { role: 'user' | 'assistant'; content: string };

function escapeHtml(s: string) {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function adminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key) return null;
  return createClient(url, key, { auth: { persistSession: false } });
}

export async function POST(req: Request) {
  let body: {
    name?: string;
    email?: string;
    message?: string;
    history?: ChatMessage[];
  };
  try { body = await req.json(); } catch {
    return new Response(JSON.stringify({ error: 'Invalid body' }), { status: 400 });
  }
  const name = (body.name || '').trim();
  const email = (body.email || '').trim();
  const message = (body.message || '').trim();
  const history = Array.isArray(body.history) ? body.history : [];

  if (!name || !email || !message) {
    return new Response(JSON.stringify({ error: 'Missing fields' }), { status: 400 });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return new Response(JSON.stringify({ error: 'Invalid email' }), { status: 400 });
  }

  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  const insertRow = {
    user_id: user?.id ?? null,
    name,
    email,
    message,
    ai_conversation_log: history,
    status: 'open' as const,
  };

  // Use service role if available so anon users can also insert reliably;
  // otherwise fall back to the user-scoped client (RLS allows null user_id).
  const admin = adminClient();
  const writer = admin ?? supabase;
  const { data: ticket, error } = await writer
    .from('support_tickets')
    .insert(insertRow)
    .select('id')
    .single();

  if (error) {
    console.error('[support/escalate] insert failed:', error);
    return new Response(JSON.stringify({ error: 'Could not save ticket' }), { status: 500 });
  }

  const supportEmail = process.env.SUPPORT_EMAIL;
  let emailWarning: string | null = null;

  if (supportEmail) {
    const transcript = history
      .map(h => `<p><b>${h.role === 'user' ? 'User' : 'AI'}:</b> ${escapeHtml(h.content)}</p>`)
      .join('');
    const subject = `ELM support: ${name} — ${message.slice(0, 60)}`;
    const html = `
      <h2>New ELM support ticket</h2>
      <p><b>Ticket ID:</b> ${ticket.id}</p>
      <p><b>From:</b> ${escapeHtml(name)} &lt;${escapeHtml(email)}&gt;</p>
      <p><b>User ID:</b> ${user?.id ?? '(anonymous)'}</p>
      <h3>Issue</h3>
      <p>${escapeHtml(message)}</p>
      <h3>Conversation so far</h3>
      ${transcript || '<p><i>(no prior chat)</i></p>'}
      <hr/>
      <p>Reply directly to <a href="mailto:${escapeHtml(email)}">${escapeHtml(email)}</a> to respond to the user.</p>
    `;
    const result = await sendEmail({ to: supportEmail, subject, html });
    if (!result.sent) {
      console.warn('[support/escalate] email not sent:', result.reason);
      if (result.reason === 'not_configured') {
        emailWarning = 'email_not_configured';
        console.log('[support/escalate] ESCALATION (no email):', { ticketId: ticket.id, name, email, message });
      }
    }
  } else {
    emailWarning = 'support_email_missing';
    console.log('[support/escalate] ESCALATION (no SUPPORT_EMAIL):', { ticketId: ticket.id, name, email, message, history });
  }

  return new Response(
    JSON.stringify({ ticketId: ticket.id, emailWarning }),
    { status: 200, headers: { 'Content-Type': 'application/json' } },
  );
}
