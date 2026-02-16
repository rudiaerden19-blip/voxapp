import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const getSupabase = () => createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// POST - Initiate an outbound call (callback)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      business_id, 
      to_number, 
      agent_id,
      first_message, // Optional custom first message
      dynamic_variables // Optional variables to pass to the agent
    } = body;

    if (!business_id || !to_number) {
      return NextResponse.json({ error: 'business_id and to_number required' }, { status: 400 });
    }

    const supabase = getSupabase();

    // Get business phone number
    const { data: phoneNumber, error: phoneError } = await supabase
      .from('phone_numbers')
      .select('*')
      .eq('business_id', business_id)
      .eq('status', 'active')
      .single();

    if (phoneError || !phoneNumber) {
      return NextResponse.json({ error: 'No active phone number for this business' }, { status: 400 });
    }

    // Use provided agent_id or get from phone number
    const agentIdToUse = agent_id || phoneNumber.agent_id;

    if (!agentIdToUse) {
      return NextResponse.json({ error: 'No agent configured for this number' }, { status: 400 });
    }

    // Initiate outbound call via ElevenLabs
    const response = await fetch('https://api.elevenlabs.io/v1/convai/twilio/outbound-call', {
      method: 'POST',
      headers: {
        'xi-api-key': process.env.ELEVENLABS_API_KEY!,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        agent_id: agentIdToUse,
        to: to_number,
        from: phoneNumber.phone_number,
        first_message: first_message,
        dynamic_variables: dynamic_variables,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('ElevenLabs outbound call error:', errorText);
      return NextResponse.json({ 
        error: 'Failed to initiate call',
        details: errorText 
      }, { status: 500 });
    }

    const callData = await response.json();

    // Log the outbound call
    await supabase.from('conversations').insert({
      business_id,
      phone_number: to_number,
      direction: 'outbound',
      status: 'initiated',
      agent_id: agentIdToUse,
      call_sid: callData.call_sid,
      created_at: new Date().toISOString(),
    } as any);

    return NextResponse.json({
      success: true,
      call_sid: callData.call_sid,
      message: 'Outbound call initiated'
    });

  } catch (error: any) {
    console.error('Outbound call error:', error);
    return NextResponse.json({ error: error.message || 'Failed to initiate call' }, { status: 500 });
  }
}
