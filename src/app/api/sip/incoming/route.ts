import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Create admin Supabase client
function getSupabase() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error('Missing Supabase environment variables');
  }
  
  return createClient(supabaseUrl, serviceRoleKey);
}

// Normalize phone number to E.164 format
function normalizePhoneNumber(phone: string): string {
  // Remove all non-digit characters except +
  let normalized = phone.replace(/[^\d+]/g, '');
  
  // Add + if missing
  if (!normalized.startsWith('+')) {
    // Assume Belgian number if starts with 0
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

// Parse Diversion header to extract original dialed number
// SIP Diversion header format: <sip:+32XXXXXXXX@domain>;reason=no-answer
function parseDiversionHeader(diversion: string): string | null {
  if (!diversion) return null;
  
  // Extract the number from various formats
  // Format 1: <sip:+32123456789@domain>
  // Format 2: +32123456789
  // Format 3: sip:+32123456789@domain
  
  const sipMatch = diversion.match(/sip:(\+?\d+)@/i);
  if (sipMatch) {
    return normalizePhoneNumber(sipMatch[1]);
  }
  
  const telMatch = diversion.match(/tel:(\+?\d+)/i);
  if (telMatch) {
    return normalizePhoneNumber(telMatch[1]);
  }
  
  // Direct number in header
  const directMatch = diversion.match(/(\+?\d{9,15})/);
  if (directMatch) {
    return normalizePhoneNumber(directMatch[1]);
  }
  
  return null;
}

// POST - Handle incoming SIP call with Diversion header
// This endpoint is called by the SIP provider (DIDWW) when a forwarded call arrives
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Expected fields from SIP provider webhook
    const {
      to,              // VoxApp pool number that received the call
      from,            // Caller's phone number
      diversion,       // SIP Diversion header (original forwarded number)
      call_id,         // Unique call identifier
      sip_call_id,     // SIP Call-ID header
    } = body;

    const supabase = getSupabase();

    // Parse the Diversion header to get the original dialed number
    const originalNumber = parseDiversionHeader(diversion);
    
    console.log('Incoming SIP call:', {
      to,
      from,
      diversion,
      originalNumber,
      call_id,
    });

    let businessId: string | null = null;
    let agentId: string | null = null;

    if (originalNumber) {
      // Look up which business owns this forwarded number
      const { data: forwardingRecord, error: forwardingError } = await supabase
        .from('forwarding_numbers')
        .select('business_id')
        .eq('phone_number', originalNumber)
        .eq('is_active', true)
        .single();

      if (forwardingRecord) {
        businessId = forwardingRecord.business_id;
        
        // Get the business's AI agent
        const { data: business } = await supabase
          .from('businesses')
          .select('elevenlabs_agent_id, name')
          .eq('id', businessId)
          .single();

        if (business?.elevenlabs_agent_id) {
          agentId = business.elevenlabs_agent_id;
          console.log(`Forwarded call for ${business.name}, using agent ${agentId}`);
        }
      } else {
        console.log('No forwarding record found for:', originalNumber);
      }
    }

    // If no agent found via Diversion header, check if the pool number has a default agent
    if (!agentId) {
      const normalizedTo = normalizePhoneNumber(to);
      
      const { data: poolNumber } = await supabase
        .from('pool_numbers')
        .select('id')
        .eq('phone_number', normalizedTo)
        .eq('status', 'active')
        .single();

      if (poolNumber) {
        // Could set a default agent here, or return an error
        console.log('Call to pool number without Diversion header');
      }
    }

    // Return routing instructions for the SIP provider
    // The provider will use this to route the call to ElevenLabs
    if (agentId) {
      return NextResponse.json({
        action: 'connect_to_agent',
        agent_id: agentId,
        business_id: businessId,
        metadata: {
          original_number: originalNumber,
          caller: from,
          pool_number: to,
          call_id: call_id,
        },
      });
    } else {
      // No agent configured - could play a message or route to voicemail
      return NextResponse.json({
        action: 'reject',
        reason: 'no_agent_configured',
        message: 'Dit nummer is niet geconfigureerd',
      });
    }

  } catch (error: any) {
    console.error('SIP incoming call error:', error);
    return NextResponse.json({ 
      error: error.message,
      action: 'reject',
    }, { status: 500 });
  }
}

// GET - Health check
export async function GET() {
  return NextResponse.json({
    status: 'ok',
    endpoint: 'SIP incoming call handler',
    description: 'Processes incoming calls with Diversion headers',
  });
}
