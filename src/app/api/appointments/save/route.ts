export const runtime = "nodejs"

import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

function vapiResult(toolCallId: string, result: string) {
  return Response.json({ results: [{ toolCallId, result }] })
}

function dagNaarDatum(dag: string): string {
  const DAGEN: Record<string, number> = {
    zondag: 0, maandag: 1, dinsdag: 2, woensdag: 3,
    donderdag: 4, vrijdag: 5, zaterdag: 6,
  }
  const nu = new Date()

  if (/^\d{4}-\d{2}-\d{2}$/.test(dag)) return dag

  const lower = dag.toLowerCase().trim()
  let dagNr = -1
  for (const [naam, nr] of Object.entries(DAGEN)) {
    if (lower.includes(naam)) { dagNr = nr; break }
  }

  if (dagNr === -1) return nu.toISOString().split("T")[0]

  let diff = dagNr - nu.getDay()
  if (diff <= 0) diff += 7
  const d = new Date(nu)
  d.setDate(nu.getDate() + diff)
  return d.toISOString().split("T")[0]
}

export async function POST(req: Request) {
  let toolCallId = "unknown"

  try {
    const body = await req.json()

    // Vapi stuurt function call in dit format
    const toolCall = body?.message?.toolCallList?.[0]
    toolCallId = toolCall?.id ?? "unknown"

    let args: Record<string, string> = {}
    if (toolCall?.function?.arguments) {
      args = typeof toolCall.function.arguments === "string"
        ? JSON.parse(toolCall.function.arguments)
        : toolCall.function.arguments
    }

    const { naam, dienst, datum, tijdstip } = args

    if (!naam || !datum || !tijdstip) {
      return vapiResult(toolCallId, "Ik heb je naam, dag en tijdstip nodig.")
    }

    const isoDate = dagNaarDatum(datum)
    const uurMatch = String(tijdstip).match(/(\d{1,2}):?(\d{2})?/)
    const uur = uurMatch ? parseInt(uurMatch[1]) : 9
    const min = uurMatch?.[2] ? parseInt(uurMatch[2]) : 0

    const startTime = new Date(`${isoDate}T${String(uur).padStart(2, "0")}:${String(min).padStart(2, "0")}:00`)
    const endTime = new Date(startTime.getTime() + 30 * 60 * 1000)

    const { error } = await supabase.from("appointments").insert({
      customer_name: naam,
      customer_phone: body?.message?.call?.customer?.number ?? "",
      start_time: startTime.toISOString(),
      end_time: endTime.toISOString(),
      status: "confirmed",
      booked_by: "ai",
      notes: dienst || "afspraak",
    })

    if (error) {
      console.error("[appointments/save] DB error:", error.message, error.code)
      return vapiResult(toolCallId, "Er ging iets mis bij het opslaan.")
    }

    return vapiResult(toolCallId, `Afspraak bevestigd voor ${naam} op ${datum} om ${tijdstip}.`)

  } catch (e) {
    console.error("[appointments/save] Error:", e)
    return vapiResult(toolCallId, "Er ging iets mis.")
  }
}
