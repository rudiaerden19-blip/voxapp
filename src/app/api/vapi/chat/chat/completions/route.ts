export const runtime = "nodejs"

export async function POST(req: Request) {
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
            delta: {
              content: "Hallo, waarmee kan ik u helpen?"
            },
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
      "Connection": "keep-alive"
    }
  })
}
