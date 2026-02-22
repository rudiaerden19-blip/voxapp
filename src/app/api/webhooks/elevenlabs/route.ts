import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { PLAN_MINUTES } from '@/lib/planFacts';

// Horeca business types that take orders
const HORECA_TYPES = ['frituur', 'pizzeria', 'kebab', 'restaurant', 'snackbar'];

// Parse phone number from transcript
function extractPhoneNumber(text: string): string | null {
  const phonePatterns = [
    /(?:telefoonnummer|nummer|telefoon|bellen)[:\s]*([+\d\s\-()]{8,})/i,
    /([+]?32[\s\-]?\d{3}[\s\-]?\d{2}[\s\-]?\d{2}[\s\-]?\d{2})/,
    /([+]?31[\s\-]?\d{9})/,
    /(0\d{1,3}[\s\-]?\d{2,3}[\s\-]?\d{2,3}[\s\-]?\d{2,3})/,
  ];
  
  for (const pattern of phonePatterns) {
    const match = text.match(pattern);
    if (match) {
      return match[1].replace(/[\s\-()]/g, '');
    }
  }
  return null;
}

// Parse customer name from transcript
function extractCustomerName(text: string): string | null {
  const namePatterns = [
    /(?:mijn naam is|ik ben|naam is|heet)\s+([A-Za-zÀ-ÿ]+(?:\s+[A-Za-zÀ-ÿ]+)?)/i,
    /(?:voor|op naam van|onder de naam)\s+([A-Za-zÀ-ÿ]+(?:\s+[A-Za-zÀ-ÿ]+)?)/i,
  ];
  
  for (const pattern of namePatterns) {
    const match = text.match(pattern);
    if (match) {
      return match[1].trim();
    }
  }
  return null;
}

// Check if transcript confirms an appointment
function detectAppointmentConfirmation(text: string): boolean {
  const confirmationPhrases = [
    /afspraak\s+(?:is\s+)?(?:bevestigd|ingepland|gemaakt)/i,
    /u\s+staat\s+(?:nu\s+)?ingepland/i,
    /tot\s+(?:dan|ziens)/i,
    /we\s+zien\s+u\s+(?:op|om)/i,
  ];
  
  return confirmationPhrases.some(p => p.test(text));
}

// Check if transcript confirms an order
function detectOrderConfirmation(text: string): boolean {
  const confirmationPhrases = [
    /bestelling\s+(?:is\s+)?(?:bevestigd|genoteerd|klaar)/i,
    /totaal\s+(?:is|komt op|bedraagt)/i,
    /(?:afhalen|bezorgen)\s+om/i,
    /uw\s+bestelling/i,
  ];
  
  return confirmationPhrases.some(p => p.test(text));
}

// Extract date and time from transcript
function extractDateTime(text: string): { date: string | null; time: string | null } {
  let date: string | null = null;
  let time: string | null = null;
  
  // Time patterns
  const timeMatch = text.match(/(?:om|rond|tegen)\s+(\d{1,2})[\s:.](\d{2})?(?:\s*uur)?/i);
  if (timeMatch) {
    const hours = timeMatch[1].padStart(2, '0');
    const minutes = timeMatch[2] || '00';
    time = `${hours}:${minutes}`;
  }
  
  // Date patterns
  const today = new Date();
  if (/vandaag/i.test(text)) {
    date = today.toISOString().split('T')[0];
  } else if (/morgen/i.test(text)) {
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    date = tomorrow.toISOString().split('T')[0];
  } else if (/overmorgen/i.test(text)) {
    const dayAfter = new Date(today);
    dayAfter.setDate(dayAfter.getDate() + 2);
    date = dayAfter.toISOString().split('T')[0];
  }
  
  // Day names
  const dayNames = ['zondag', 'maandag', 'dinsdag', 'woensdag', 'donderdag', 'vrijdag', 'zaterdag'];
  const dayMatch = text.toLowerCase().match(new RegExp(`(${dayNames.join('|')})`));
  if (dayMatch && !date) {
    const targetDay = dayNames.indexOf(dayMatch[1]);
    const current = today.getDay();
    let daysToAdd = targetDay - current;
    if (daysToAdd <= 0) daysToAdd += 7;
    const targetDate = new Date(today);
    targetDate.setDate(targetDate.getDate() + daysToAdd);
    date = targetDate.toISOString().split('T')[0];
  }
  
  return { date, time };
}

// Extract delivery type
function extractDeliveryType(text: string): 'pickup' | 'delivery' {
  if (/bezorg|lever|brengen/i.test(text)) {
    return 'delivery';
  }
  return 'pickup';
}

// Extract address
function extractAddress(text: string): string | null {
  const addressPatterns = [
    /(?:adres|bezorgen naar|leveren op|straat)\s*[:is]?\s*([A-Za-z0-9À-ÿ\s,]+\d+[A-Za-z]?(?:\s*,?\s*\d{4}\s*[A-Za-z]+)?)/i,
  ];
  
  for (const pattern of addressPatterns) {
    const match = text.match(pattern);
    if (match) {
      return match[1].trim();
    }
  }
  return null;
}

// Create admin Supabase client for webhook handling
function getSupabase() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error('Missing Supabase environment variables');
  }
  
  return createClient(supabaseUrl, serviceRoleKey);
}

// POST - Receive webhook from ElevenLabs after call completion
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Log EVERYTHING for debugging
    console.log('=== ELEVENLABS WEBHOOK RECEIVED ===');
    console.log('Full payload:', JSON.stringify(body, null, 2));
    
    // Try multiple possible field names
    const agent_id = body.agent_id || body.agentId || body.data?.agent_id || body.conversation?.agent_id;
    const conversation_id = body.conversation_id || body.conversationId || body.data?.conversation_id || body.id;
    const transcript = body.transcript || body.data?.transcript || body.conversation?.transcript || body.analysis?.transcript;
    const call_duration_seconds = body.call_duration_seconds || body.duration || body.data?.duration || body.call_duration_secs || 0;
    const caller_phone_number = body.caller_phone_number || body.phone_number || body.data?.caller_phone || body.metadata?.phone;
    const call_successful = body.call_successful !== false && body.status !== 'failed';
    const summary = body.summary || body.data?.summary || body.analysis?.summary;
    
    console.log('Parsed: agent_id=', agent_id, 'conversation_id=', conversation_id);

    const supabase = getSupabase();

    // If no agent_id, try to find business by any means
    let business = null;
    
    if (agent_id) {
      const { data } = await supabase
        .from('businesses')
        .select('id, name, subscription_plan')
        .eq('agent_id', agent_id)
        .single();
      business = data;
    }
    
    // Fallback: get first frituur business for testing
    if (!business) {
      const { data } = await supabase
        .from('businesses')
        .select('id, name, subscription_plan')
        .eq('type', 'frituur')
        .limit(1)
        .single();
      business = data;
      console.log('Using fallback business:', business?.name);
    }

    if (!business) {
      console.error('No business found');
      return NextResponse.json({ received: true, processed: false });
    }

    const durationMinutes = Math.ceil((call_duration_seconds || 0) / 60);

    // Insert call log
    const { error: insertError } = await supabase
      .from('call_logs')
      .insert({
        business_id: business.id,
        conversation_id: conversation_id,
        agent_id: agent_id,
        duration_seconds: call_duration_seconds || 0,
        duration_minutes: durationMinutes,
        caller_phone: caller_phone_number || null,
        status: call_successful ? 'completed' : 'failed',
        transcript: transcript || null,
        summary: summary || null,
        metadata: metadata || null,
        created_at: timestamp || new Date().toISOString(),
      });

    if (insertError) {
      console.error('Error inserting call log:', insertError);
      // Return 200 anyway to prevent ElevenLabs from retrying
    }

    // Update monthly usage aggregation
    const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM format
    
    const { data: existingUsage } = await supabase
      .from('usage_monthly')
      .select('*')
      .eq('business_id', business.id)
      .eq('month', currentMonth)
      .single();

    if (existingUsage) {
      // Update existing record
      await supabase
        .from('usage_monthly')
        .update({
          total_calls: existingUsage.total_calls + 1,
          total_minutes: existingUsage.total_minutes + durationMinutes,
          updated_at: new Date().toISOString(),
        })
        .eq('id', existingUsage.id);
    } else {
      // Create new monthly record
      const planLimit = PLAN_MINUTES[business.subscription_plan || 'starter'] ?? PLAN_MINUTES.starter;
      
      await supabase
        .from('usage_monthly')
        .insert({
          business_id: business.id,
          month: currentMonth,
          total_calls: 1,
          total_minutes: durationMinutes,
          included_minutes: planLimit,
          extra_minutes: 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });
    }

    // Check if over limit and update extra minutes
    const { data: updatedUsage } = await supabase
      .from('usage_monthly')
      .select('*')
      .eq('business_id', business.id)
      .eq('month', currentMonth)
      .single();

    if (updatedUsage && updatedUsage.total_minutes > updatedUsage.included_minutes) {
      const extraMinutes = updatedUsage.total_minutes - updatedUsage.included_minutes;
      await supabase
        .from('usage_monthly')
        .update({ extra_minutes: extraMinutes })
        .eq('id', updatedUsage.id);
    }

    // === AUTOMATIC APPOINTMENT/ORDER EXTRACTION ===
    // Only process if we have a transcript
    if (transcript && call_successful) {
      const transcriptText = typeof transcript === 'string' 
        ? transcript 
        : JSON.stringify(transcript);
      
      // Get business type to determine if it's horeca or appointment-based
      const { data: fullBusiness } = await supabase
        .from('businesses')
        .select('type')
        .eq('id', business.id)
        .single();
      
      const isHoreca = fullBusiness?.type && HORECA_TYPES.includes(fullBusiness.type);
      
      if (isHoreca && detectOrderConfirmation(transcriptText)) {
        // Extract order details
        const customerName = extractCustomerName(transcriptText) || 'Telefoon klant';
        const customerPhone = extractPhoneNumber(transcriptText) || caller_phone_number || '';
        const deliveryType = extractDeliveryType(transcriptText);
        const customerAddress = deliveryType === 'delivery' ? extractAddress(transcriptText) : null;
        const { time: deliveryTime } = extractDateTime(transcriptText);
        
        // Create order with summary as notes (items to be parsed manually or from summary)
        const { error: orderError } = await supabase
          .from('orders')
          .insert({
            business_id: business.id,
            customer_name: customerName,
            customer_phone: customerPhone,
            customer_address: customerAddress,
            delivery_type: deliveryType,
            delivery_time: deliveryTime,
            items: [], // Would need AI parsing for detailed items
            notes: summary || 'Bestelling via telefoon - zie transcript voor details',
            status: 'new',
            source: 'phone',
            total_amount: 0, // Would need AI parsing
          });
        
        if (orderError) {
          console.error('Error creating order from transcript:', orderError);
        } else {
          console.log('Order created from call transcript for business:', business.id);
        }
        
      } else if (!isHoreca && detectAppointmentConfirmation(transcriptText)) {
        // Extract appointment details
        const customerName = extractCustomerName(transcriptText) || 'Telefoon klant';
        const customerPhone = extractPhoneNumber(transcriptText) || caller_phone_number || '';
        const { date, time } = extractDateTime(transcriptText);
        
        if (date && time) {
          const [hours, minutes] = time.split(':').map(Number);
          const startTime = new Date(date);
          startTime.setHours(hours, minutes, 0, 0);
          const endTime = new Date(startTime.getTime() + 30 * 60000); // Default 30 min
          
          // Check for conflicts before inserting
          const { data: conflicts } = await supabase
            .from('appointments')
            .select('id')
            .eq('business_id', business.id)
            .neq('status', 'cancelled')
            .gte('start_time', startTime.toISOString())
            .lt('start_time', endTime.toISOString());
          
          if (!conflicts || conflicts.length === 0) {
            const { error: appointmentError } = await supabase
              .from('appointments')
              .insert({
                business_id: business.id,
                customer_name: customerName,
                customer_phone: customerPhone,
                start_time: startTime.toISOString(),
                end_time: endTime.toISOString(),
                status: 'scheduled',
                booked_by: 'ai',
                notes: summary || 'Afspraak via telefoon',
              });
            
            if (appointmentError) {
              console.error('Error creating appointment from transcript:', appointmentError);
            } else {
              console.log('Appointment created from call transcript for business:', business.id);
            }
          } else {
            console.log('Appointment slot already taken, skipping creation');
          }
        }
      }
    }

    return NextResponse.json({ 
      received: true, 
      processed: true,
      business_id: business.id,
      duration_minutes: durationMinutes,
    });

  } catch (error: any) {
    console.error('Webhook processing error:', error);
    // Return 200 to prevent retries
    return NextResponse.json({ 
      received: true, 
      error: error.message 
    });
  }
}

// GET - Health check for webhook endpoint
export async function GET() {
  return NextResponse.json({ 
    status: 'ok',
    endpoint: 'ElevenLabs webhook receiver',
  });
}
