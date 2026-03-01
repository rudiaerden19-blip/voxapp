export const runtime = "nodejs"

import { parseTranscript } from "@/lib/appointment-engine/NLU"
import { transition } from "@/lib/appointment-engine/StateMachine"
import { generateResponse } from "@/lib/appointment-engine/ResponseGenerator"
import { getSession, saveSession } from "@/lib/appointment-engine/SessionStore"
import { AppointmentState } from "@/lib/appointment-engine/types"

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const messages: { role: string; content: string }[] = body.messages || []

    const lastUserMsg = [...messages].reverse().find(m => m.role === "user")
    const transcript = lastUserMsg?.content?.trim() || ""

    const callId =
      body?.call?.id ||
      body?.metadata?.call_id ||
      `call_${Date.now()}`

    const businessId = process.env.DEFAULT_TENANT_ID || "no-tenant"

    // 1. Load session
    let session
    try {
      session = await getSession(callId, businessId)
    } catch {
      session = {
        callId,
        businessId,
        state: AppointmentState.GREETING,
        collected: { service: null, date: null, time: null, name: null, phone: null },
        retries: {},
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
    }

    // 2. Parse input (regex NLU)
    const parsed = parseTranscript(transcript)

    // 3. Service matchen als nog niet gezet
    if (
      (session.state === AppointmentState.GREETING || session.state === AppointmentState.COLLECT_SERVICE)
      && !session.collected.service
      && transcript.length >= 2
    ) {
      const cleaned = transcript.replace(/^(om te|ik wil|graag|een)\s+/i, "").trim()
      if (cleaned.length >= 2) {
        parsed.entities.service = cleaned
        session.collected.service = cleaned
      }
    }

    // 4. Determine next state
    const result = transition(session, parsed)
    session.state = result.newState

    // 5. Generate response text
    const replyText = generateResponse(result.response, session.collected, "kapsalon Anja")

    // 6. Save session
    try { await saveSession(session) } catch { /* ignore */ }

    // 7. SSE response
    const encoder = new TextEncoder()

    const stream = new ReadableStream({
      start(controller) {
        const chunk = {
          id: "chatcmpl-voxapp",
          object: "chat.completion.chunk",
          created: Math.floor(Date.now() / 1000),
          model: "voxapp-orchestrator",
          choices: [
            {
              index: 0,
              delta: { content: replyText },
              finish_reason: null
            }
          ]
        }

        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify(chunk)}\n\n`)
        )

        controller.enqueue(
          encoder.encode(`data: [DONE]\n\n`)
        )

        controller.close()
      }
    })

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive"
      }
    })
  } catch (error) {
    console.error("[chat/completions] ERROR:", error)
    return new Response("Internal error", { status: 500 })
  }
}
