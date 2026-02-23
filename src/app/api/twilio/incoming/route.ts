import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function getSupabase() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error('Missing Supabase environment variables');
  }
  
  return createClient(supabaseUrl, serviceRoleKey);
}

function normalizePhoneNumber(phone: string): string {
  let normalized = phone.replace(/[^\d+]/g, '');
  if (!normalized.startsWith('+')) {
    if (normalized.startsWith('0')) {
      normalized = '+32' + normalized.slice(1);
    } else if (normalized.startsWith('32')) {
      normalized = '+' + normalized;
    } else {
      normalized = '+' + normalized;
    }
  }
  return normalized;
}

// POST - Handle incoming Twilio call
// Twilio sends form-urlencoded data
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    
    // Twilio webhook parameters
    const to = formData.get('To') as string;           // Pool number that received the call
    const from = formData.get('From') as string;       // Caller's number
    const callSid = formData.get('CallSid') as string;
    const forwardedFrom = formData.get('ForwardedFrom') as string; // Original forwarded number
    const sipDiversion = formData.get('SipHeader_Diversion') as string; // SIP Diversion header
    
    console.log('Twilio incoming call:', { to, from, forwardedFrom, sipDiversion, callSid });

    const supabase = getSupabase();
    
    // Try to find the business by:
    // 1. ForwardedFrom header (GSM forwarding)
    // 2. SIP Diversion header
    // 3. Direct pool number lookup
    
    let businessId: string | null = null;
    let agentId: string | null = null;
    let businessName = 'VoxApp';
    
    // Check ForwardedFrom first (most common for GSM call forwarding)
    const originalNumber = forwardedFrom 
      ? normalizePhoneNumber(forwardedFrom)
      : sipDiversion 
        ? extractNumberFromDiversion(sipDiversion)
        : null;
    
    if (originalNumber) {
      const { data: forwardingRecord } = await supabase
        .from('forwarding_numbers')
        .select('business_id')
        .eq('phone_number', originalNumber)
        .eq('is_active', true)
        .single();
      
      if (forwardingRecord) {
        businessId = forwardingRecord.business_id;
        
        const { data: business } = await supabase
          .from('businesses')
          .select('elevenlabs_agent_id, name')
          .eq('id', businessId)
          .single();
        
        if (business?.elevenlabs_agent_id) {
          agentId = business.elevenlabs_agent_id;
          businessName = business.name || 'VoxApp';
          console.log(`Forwarded call for ${businessName}, agent: ${agentId}`);
        }
      }
    }
    
    // If no agent found, check if pool number has a default agent
    if (!agentId) {
      const normalizedTo = normalizePhoneNumber(to);
      
      const { data: poolNumber } = await supabase
        .from('pool_numbers')
        .select('default_agent_id')
        .eq('phone_number', normalizedTo)
        .eq('status', 'active')
        .single();
      
      if (poolNumber?.default_agent_id) {
        agentId = poolNumber.default_agent_id;
        console.log('Using default pool agent:', agentId);
      }
    }

    // Resolve businessId from agentId if not yet set
    if (!businessId && agentId) {
      const { data: bizFromAgent } = await supabase
        .from('businesses')
        .select('id, name')
        .or(`agent_id.eq.${agentId},elevenlabs_agent_id.eq.${agentId}`)
        .single();
      
      if (bizFromAgent) {
        businessId = bizFromAgent.id;
        businessName = bizFromAgent.name || 'VoxApp';
        console.log(`Resolved business from agent: ${businessName} (${businessId})`);
      }
    }
    
    // Generate TwiML response
    const voiceServerUrl = process.env.VOICE_SERVER_URL;

    if (voiceServerUrl && businessId) {
      // NEW PIPELINE: Twilio Media Streams → voice-server (Deepgram STT + ElevenLabs TTS)
      const wsUrl = voiceServerUrl.replace('https://', 'wss://').replace('http://', 'ws://');
      const callerNumber = from ? normalizePhoneNumber(from) : '';

      console.log(`Using voice-server pipeline: ${wsUrl}/stream`);

      const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Connect>
    <Stream url="${wsUrl}/stream">
      <Parameter name="business_id" value="${businessId}" />
      <Parameter name="caller_id" value="${callerNumber}" />
    </Stream>
  </Connect>
</Response>`;

      return new NextResponse(twiml, {
        headers: { 'Content-Type': 'text/xml' },
      });
    } else if (agentId) {
      // LEGACY: Connect to ElevenLabs via SIP
      const elevenlabsSipUri = `sip:${agentId}@phone.elevenlabs.io`;
      
      const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Dial>
    <Sip>${elevenlabsSipUri}</Sip>
  </Dial>
</Response>`;
      
      return new NextResponse(twiml, {
        headers: { 'Content-Type': 'text/xml' },
      });
    } else {
      // No agent configured - play error message
      const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say language="nl-BE">Sorry, dit nummer is momenteel niet beschikbaar. Probeer later opnieuw.</Say>
  <Hangup />
</Response>`;
      
      return new NextResponse(twiml, {
        headers: { 'Content-Type': 'text/xml' },
      });
    }
    
  } catch (error: any) {
    console.error('Twilio incoming error:', error);
    
    // Return error TwiML
    const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say language="nl-BE">Er is een technische fout opgetreden.</Say>
  <Hangup />
</Response>`;
    
    return new NextResponse(twiml, {
      headers: { 'Content-Type': 'text/xml' },
    });
  }
}

// Extract number from SIP Diversion header
function extractNumberFromDiversion(diversion: string): string | null {
  if (!diversion) return null;
  
  const sipMatch = diversion.match(/sip:(\+?\d+)@/i);
  if (sipMatch) return normalizePhoneNumber(sipMatch[1]);
  
  const telMatch = diversion.match(/tel:(\+?\d+)/i);
  if (telMatch) return normalizePhoneNumber(telMatch[1]);
  
  const directMatch = diversion.match(/(\+?\d{9,15})/);
  if (directMatch) return normalizePhoneNumber(directMatch[1]);
  
  return null;
}

// GET - Health check
export async function GET() {
  return NextResponse.json({
    status: 'ok',
    endpoint: 'Twilio incoming call webhook',
    usage: 'Set this URL as your Twilio number webhook',
  });
}
