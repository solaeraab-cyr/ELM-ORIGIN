import Groq from 'groq-sdk';

export const runtime = 'nodejs';
export const maxDuration = 60;

const LLM_MODEL = 'openai/gpt-oss-120b';
const LLM_MODEL_FALLBACK = 'llama-3.3-70b-versatile';

const SYSTEM_PROMPT = `You are ELM Assistant, a friendly customer support AI for ELM Origin — a collaborative study and interview prep platform for Indian students and professionals.

PRODUCT KNOWLEDGE:
- ELM has: Study Rooms (focused individual work), Collaboration Rooms (with whiteboard, screen share), AI Mock Interview (free 2/day, then paid), Peer 1-on-1 / Group Mocks (free), Mentor 1-on-1 (₹500+), Premium Mentor (Ex-FAANG/Senior industry, ₹3000+).
- AI Mock Interview uses voice — warm Indian female voice (Priya). Conversation is auto-detected via VAD, no buttons.
- Live Board: collaborative whiteboard inside collaboration rooms, everyone can draw or one person at a time.
- Pricing: most things free. Paid tiers for mentor bookings via Razorpay (currently in mock mode).
- Built by Solaeraab Private Limited, based in Ongole, AP. Founder: Reshma Shaik.

YOUR JOB:
- Answer questions clearly and concisely (2-4 sentences usually).
- Friendly, warm, conversational tone.
- If a user reports a bug, ask for: what they tried, what happened, what browser/device they're on. Then offer to escalate to a human.
- If you genuinely don't know the answer, or the user is frustrated, or they're asking for refund / account deletion / something requiring human action — tell the user: "I'll forward this to Reshma from our team. She'll get back to you within 24 hours. Could you share your email so she can reply?" and at the very end of your reply append a NEW LINE containing exactly the token <ESCALATE>.
- Never invent features, prices, or policies. If unsure, say "Let me forward this to a human — they'll have the right answer." and append <ESCALATE>.
- Never claim to do things you can't (you can't refund money, change accounts, etc.). Always escalate those.

DO NOT:
- Make up features
- Promise specific delivery times for new features
- Discuss competitors or other AI tools by name unless asked
- Use markdown headers or bullet points — this is a chat, write prose`;

type ChatMessage = { role: 'user' | 'assistant'; content: string };

function groq() {
  const key = process.env.GROQ_API_KEY;
  if (!key) throw new Error('GROQ_API_KEY missing');
  return new Groq({ apiKey: key });
}

async function streamWithFallback(messages: { role: 'system' | 'user' | 'assistant'; content: string }[]) {
  try {
    return await groq().chat.completions.create({
      model: LLM_MODEL,
      messages,
      max_tokens: 500,
      stream: true,
    });
  } catch (err) {
    console.warn('[support] primary model failed, falling back:', err);
    return await groq().chat.completions.create({
      model: LLM_MODEL_FALLBACK,
      messages,
      max_tokens: 500,
      stream: true,
    });
  }
}

export async function POST(req: Request) {
  if (!process.env.GROQ_API_KEY) {
    return new Response(JSON.stringify({ error: 'unavailable' }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  let body: { sessionId?: string; message?: string; history?: ChatMessage[] };
  try { body = await req.json(); } catch {
    return new Response(JSON.stringify({ error: 'Invalid body' }), { status: 400 });
  }
  const message = (body.message || '').trim();
  if (!message) {
    return new Response(JSON.stringify({ error: 'Missing message' }), { status: 400 });
  }
  const history = Array.isArray(body.history) ? body.history.slice(-20) : [];

  const messages: { role: 'system' | 'user' | 'assistant'; content: string }[] = [
    { role: 'system', content: SYSTEM_PROMPT },
    ...history.map(h => ({ role: h.role, content: h.content })),
    { role: 'user', content: message },
  ];

  const encoder = new TextEncoder();
  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const send = (event: string, data: Record<string, unknown>) => {
        controller.enqueue(encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`));
      };
      let full = '';
      try {
        const completion = await streamWithFallback(messages);
        for await (const chunk of completion) {
          const token = chunk.choices?.[0]?.delta?.content ?? '';
          if (!token) continue;
          full += token;
          // Don't stream the escalate marker to the user
          const clean = token.replace(/<ESCALATE>/g, '');
          if (clean) send('text', { token: clean });
        }
      } catch (e) {
        console.error('[support] stream error', e);
        send('error', { message: e instanceof Error ? e.message : String(e) });
        controller.close();
        return;
      }
      const shouldEscalate = /<ESCALATE>/i.test(full);
      const finalText = full.replace(/<ESCALATE>/gi, '').trim();
      send('done', { text: finalText, shouldEscalate });
      controller.close();
    },
  });

  return new Response(stream, {
    status: 200,
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no',
    },
  });
}
