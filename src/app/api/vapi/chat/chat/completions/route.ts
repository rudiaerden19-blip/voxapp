export const runtime = "nodejs"

import { parseTranscript, parseDag, parseTijd } from "@/lib/appointment-engine/NLU"
import { generateResponse } from "@/lib/appointment-engine/ResponseGenerator"

interface SessionData {
  service: string | null
  date: string | null
  time: string | null
  name: string | null
}

/**
 * Parse user input en retourneer gevonden velden.
 */
function parseInput(transcript: string): Partial<SessionData> {
  const result: Partial<SessionData> = {}
  const parsed = parseTranscript(transcript)

  if (parsed.entities.date) result.date = parsed.entities.date
  if (parsed.entities.time) result.time = parsed.entities.time
  if (parsed.entities.name) result.name = parsed.entities.name

  return result
}

/**
 * Bepaal state puur op basis van welke data al verzameld is.
 */
function getNextState(data: SessionData): string {
  if (!data.service) return "ASK_SERVICE"
  if (!data.date) return "ASK_DATE"
  if (!data.time) return "ASK_TIME"
  if (!data.name) return "ASK_NAME"
  return "CONFIRM"
}

/**
 * Genereer antwoord op basis van state.
 */
function makeReply(state: string, data: SessionData): string {
  switch (state) {
    case "ASK_SERVICE":
      return "Waarvoor wil je graag een afspraak maken?"
    case "ASK_DATE":
      return "Op welke dag zou je graag langskomen?"
    case "ASK_TIME":
      return "Om hoe laat zou je willen komen?"
    case "ASK_NAME":
      return "Mag ik je naam weten?"
    case "CONFIRM": {
      const dag = data.date || ""
      const tijd = data.time || ""
      const dienst = data.service || "afspraak"
      return `${data.name}, ik kan je inplannen op ${dag} om ${tijd} voor ${dienst}. Klopt dat?`
    }
    default:
      return "Waarmee kan ik je helpen?"
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const messages: { role: string; content: string }[] = body.messages || []

    // Bouw session data op uit ALLE user berichten (stateless replay)
    const data: SessionData = {
      service: null,
      date: null,
      time: null,
      name: null,
    }

    const userMessages = messages.filter(m => m.role === "user" && m.content?.trim())

    for (let i = 0; i < userMessages.length; i++) {
      const text = userMessages[i].content.trim()
      const parsed = parseInput(text)

      // Eerste user bericht = service (als nog niet gezet)
      if (i === 0 && !data.service) {
        const cleaned = text.replace(/^(om te|ik wil|graag|een|voor)\s+/i, "").trim()
        if (cleaned.length >= 2) data.service = cleaned
      }

      // Merge parsed entities
      if (parsed.date && !data.date) data.date = parsed.date
      if (parsed.time && !data.time) data.time = parsed.time

      // Naam: alleen als service+date+time al gezet zijn
      if (data.service && data.date && data.time && !data.name) {
        if (parsed.name) {
          data.name = parsed.name
        } else if (i >= 3) {
          // 4e user bericht is waarschijnlijk de naam
          const raw = text.replace(/^(mijn naam is|ik ben|ik heet|met)\s+/i, "").trim()
          if (raw.length >= 2 && !parseDag(raw) && !parseTijd(raw)) {
            data.name = raw.charAt(0).toUpperCase() + raw.slice(1)
          }
        }
      }
    }

    const state = getNextState(data)
    const replyText = makeReply(state, data)

    console.log("[chat/completions] data:", JSON.stringify(data), "| state:", state, "| reply:", replyText)

    // SSE response
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
