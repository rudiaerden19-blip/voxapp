export const runtime = 'nodejs';

import { parseTranscript } from '@/lib/appointment-engine/NLU';
import { transition } from '@/lib/appointment-engine/StateMachine';
import { generateResponse } from '@/lib/appointment-engine/ResponseGenerator';
import { AppointmentState, SessionState, CollectedData } from '@/lib/appointment-engine/types';

const EMPTY_COLLECTED: CollectedData = {
  service: null, date: null, time: null, name: null, phone: null,
};

function sseResponse(content: string): Response {
  const encoder = new TextEncoder();
  const chunk = {
    id: 'chatcmpl-voxapp',
    object: 'chat.completion.chunk',
    created: Math.floor(Date.now() / 1000),
    model: 'voxapp-orchestrator',
    choices: [{ index: 0, delta: { content }, finish_reason: null }],
  };

  const stream = new ReadableStream({
    start(controller) {
      controller.enqueue(encoder.encode(`data: ${JSON.stringify(chunk)}\n\n`));
      controller.enqueue(encoder.encode('data: [DONE]\n\n'));
      controller.close();
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const messages: { role: string; content: string }[] = body.messages || [];

    const lastUserMsg = [...messages].reverse().find(m => m.role === 'user');
    const transcript = lastUserMsg?.content?.trim() || '';

    console.log('[chat/completions] transcript:', transcript);

    // Rebuild session state van message history
    const session: SessionState = {
      callId: 'call',
      businessId: 'no-tenant',
      state: AppointmentState.GREETING,
      collected: { ...EMPTY_COLLECTED },
      retries: {},
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Replay alle eerdere assistant+user berichten om state te reconstrueren
    for (const msg of messages) {
      if (msg.role !== 'user' || !msg.content?.trim()) continue;
      const prev = parseTranscript(msg.content.trim());

      if (prev.entities.date) session.collected.date = prev.entities.date;
      if (prev.entities.time) session.collected.time = prev.entities.time;
      if (prev.entities.name) session.collected.name = prev.entities.name;
    }

    // Service matchen uit eerste user bericht
    if (!session.collected.service) {
      const firstUser = messages.find(m => m.role === 'user' && m.content?.trim());
      if (firstUser) {
        const cleaned = firstUser.content.trim().replace(/^(om te|ik wil|graag|een)\s+/i, '').trim();
        if (cleaned.length >= 2) session.collected.service = cleaned;
      }
    }

    // Bepaal huidige state op basis van verzamelde data
    if (session.collected.service) session.state = AppointmentState.COLLECT_DATE;
    if (session.collected.service && session.collected.date) session.state = AppointmentState.COLLECT_TIME;
    if (session.collected.service && session.collected.date && session.collected.time) session.state = AppointmentState.COLLECT_NAME;
    if (session.collected.service && session.collected.date && session.collected.time && session.collected.name) session.state = AppointmentState.CONFIRM;

    // Parse het huidige transcript
    const intent = parseTranscript(transcript);

    // In naam-stap: als NLU geen naam vindt, gebruik transcript als naam
    if (session.state === AppointmentState.COLLECT_NAME && !intent.entities.name && !session.collected.name) {
      const raw = transcript.replace(/^(mijn naam is|ik ben|ik heet|met)\s+/i, '').trim();
      if (raw.length >= 2) {
        intent.entities.name = raw.charAt(0).toUpperCase() + raw.slice(1);
      }
    }

    const result = transition(session, intent);
    session.state = result.newState;

    const response = generateResponse(result.response, session.collected, 'kapsalon Anja');

    console.log('[chat/completions] state:', session.state, '| response:', response);

    return sseResponse(response);
  } catch (error) {
    console.error('[chat/completions] ERROR:', error);
    return sseResponse('Sorry, er ging iets mis. Probeer het later opnieuw.');
  }
}
