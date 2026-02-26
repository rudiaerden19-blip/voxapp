import { NextRequest, NextResponse } from "next/server";

const TELNYX_API_KEY = process.env.TELNYX_API_KEY!;
const PUBLIC_WSS_URL = process.env.PUBLIC_WSS_URL!;

async function telnyxAction(
  callControlId: string,
  action: string,
  body: Record<string, unknown> = {}
) {
  await fetch(
    `https://api.telnyx.com/v2/calls/${callControlId}/actions/${action}`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${TELNYX_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    }
  );
}

export async function POST(req: NextRequest) {
  const payload = await req.json();
  const event = payload?.data?.event_type;
  const callControlId = payload?.data?.payload?.call_control_id;

  if (!callControlId) {
    return NextResponse.json({}, { status: 200 });
  }

  if (event === "call.initiated") {
    await telnyxAction(callControlId, "answer");
  }

  if (event === "call.answered") {
    await telnyxAction(callControlId, "streaming_start", {
      stream_url: `${PUBLIC_WSS_URL}/ws/telnyx`,
      stream_track: "inbound_track",
    });
  }

  return NextResponse.json({}, { status: 200 });
}
