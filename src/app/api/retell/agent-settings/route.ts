import { NextRequest, NextResponse } from 'next/server';

const RETELL_API_KEY = process.env.RETELL_API_KEY!;
const AGENT_ID = 'agent_5fa359e670973594f991a6e750';
const LLM_ID = 'llm_81db8f8c0f2395879457bee97651';

export async function GET() {
  try {
    const [agentRes, llmRes] = await Promise.all([
      fetch(`https://api.retellai.com/get-agent/${AGENT_ID}`, {
        headers: { Authorization: `Bearer ${RETELL_API_KEY}` },
      }),
      fetch(`https://api.retellai.com/get-retell-llm/${LLM_ID}`, {
        headers: { Authorization: `Bearer ${RETELL_API_KEY}` },
      }),
    ]);

    const agent = await agentRes.json();
    const llm = await llmRes.json();

    return NextResponse.json({
      interruption_sensitivity: agent.interruption_sensitivity ?? 0.6,
      general_prompt: llm.general_prompt ?? '',
    });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const { interruption_sensitivity, general_prompt } = await req.json();

    const updates: Promise<Response>[] = [];

    if (general_prompt !== undefined) {
      updates.push(
        fetch(`https://api.retellai.com/update-retell-llm/${LLM_ID}`, {
          method: 'PATCH',
          headers: {
            Authorization: `Bearer ${RETELL_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ general_prompt }),
        })
      );
    }

    if (interruption_sensitivity !== undefined) {
      updates.push(
        fetch(`https://api.retellai.com/update-agent/${AGENT_ID}`, {
          method: 'PATCH',
          headers: {
            Authorization: `Bearer ${RETELL_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ interruption_sensitivity }),
        })
      );
    }

    await Promise.all(updates);
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
