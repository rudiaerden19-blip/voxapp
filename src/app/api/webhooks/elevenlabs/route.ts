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
    /(?:mijn naam is|ik ben|ik heet|naam is)\s+([A-Za-zÀ-ÿ]{2,}(?:[ ][A-Za-zÀ-ÿ]{2,})?)/im,
    /(?:op naam van|onder de naam)\s+([A-Za-zÀ-ÿ]{2,}(?:[ ][A-Za-zÀ-ÿ]{2,})?)/im,
    /(?:naam mag ik.*zetten|naam mag ik.*noteren)[\s\S]{0,30}?user:\s*([A-Za-zÀ-ÿ]{2,})/im,
  ];
  
  const badWords = ['agent', 'user', 'klant', 'unknown', 'telefoon', 'hallo', 'goeiedag',
    'bestellen', 'bestelling', 'afhalen', 'bezorgen', 'leveren', 'doen', 'helpen',
    'ja', 'nee', 'ok', 'goed', 'nog', 'iets', 'anders', 'dat', 'was', 'het', 'niet',
    'voor', 'met', 'een', 'kan', 'wil', 'graag', 'zou'];
  
  for (const pattern of namePatterns) {
    const match = text.match(pattern);
    if (match) {
      const name = match[1].trim();
      if (badWords.includes(name.toLowerCase())) continue;
      if (name.length < 2) continue;
      return name;
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

// Load menu prices from database for the given business
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function loadMenuPrices(supabase: any, businessId: string): Promise<Record<string, number>> {
  const { data } = await supabase
    .from('menu_items')
    .select('name, price')
    .eq('business_id', businessId)
    .eq('is_available', true);
  
  const prices: Record<string, number> = {};
  if (Array.isArray(data)) {
    for (const item of data) {
      if (item.name && typeof item.price === 'number') {
        prices[item.name.toLowerCase()] = item.price;
      }
    }
  }
  return prices;
}

function lookupPrice(item: string, menuPrices: Record<string, number>): number {
  const lower = item.toLowerCase().trim();
  if (menuPrices[lower]) return menuPrices[lower];
  for (const [key, price] of Object.entries(menuPrices)) {
    if (lower.includes(key) || key.includes(lower)) return price;
  }
  return 0;
}

// Split order text into individual items, look up prices, format as receipt lines
function buildReceipt(
  messages: { role?: string; message?: string; text?: string }[],
  menuPrices: Record<string, number>
): { notes: string; total: number } {
  // Step 1: Get the raw order text from agent's summary or user messages
  let rawText = '';

  // Try agent's confirmation/summary line first
  for (let i = messages.length - 1; i >= 0; i--) {
    const m = messages[i];
    if (m.role !== 'agent') continue;
    const txt = m.message || m.text || '';
    if (/samenvatten|samenvatting|ik noem.*op|even op.*besteld|dus\b.*friet|dus\b.*besteld|klopt\s*dat\s*\?/i.test(txt)) {
      rawText = txt
        .replace(/^ok\s+\w+\s*,?\s*/i, '')
        .replace(/even\s+samenvatten\s*:?\s*/i, '')
        .replace(/ik noem nog even op wat je besteld hebt\s*:?\s*/i, '')
        .replace(/dat was alles\s*\??/i, '')
        .replace(/klopt\s*(dat|dit)\s*\??/i, '')
        .replace(/^\s*dus\s*:?\s*/i, '')
        .replace(/,?\s*op naam van\s+[\w\s]+/i, '')
        .replace(/,?\s*afhalen\b.*/i, '')
        .replace(/,?\s*bezorgen\b.*/i, '')
        .trim().replace(/\.\s*$/, '');
      if (rawText.length > 5) break;
      rawText = '';
    }
  }

  // Fallback: user messages (skip greetings/questions/answers)
  if (!rawText) {
    const skip = /^(hallo|hey|goeie|dag|ja\b|nee\b|klopt|dat was|mijn naam|ik heet|ik ben|op naam|telefoon|\d{4}|afhalen|bezorgen|leveren|kan ik bestellen|ik wil bestellen|ik zou graag|dat is het|dat is alles|meer niet|niks meer|dank|bedankt|ok\b)/i;
    const lines: string[] = [];
    for (const m of messages) {
      if (m.role !== 'user') continue;
      const txt = (m.message || m.text || '').trim();
      if (!txt || txt.length < 3 || skip.test(txt)) continue;
      lines.push(txt);
    }
    rawText = lines.join(', ');
  }

  if (!rawText) return { notes: 'Bestelling via telefoon', total: 0 };

  // Step 2: Split into individual items
  const parts = rawText.split(/,\s*|\ben\s+(?=een\b|\béén\b|\b\d|\bfriet|\bbicky|\bfrikandel|\bkroket|\bcola|\bfanta|\bwater|\bcurry|\bice)/i)
    .map(p => p.trim())
    .filter(p => p.length > 2);

  // Step 3: For each part, extract qty + name, look up price
  let total = 0;
  const receiptLines: string[] = [];
  const sortedMenu = Object.entries(menuPrices).sort((a, b) => b[0].length - a[0].length);

  for (const part of parts) {
    // Extract quantity
    let qty = 1;
    let itemText = part;
    const qm = part.match(/^(\d+)\s*[x×]?\s*/i) || part.match(/^(een|één|twee|drie|vier|vijf)\s+/i);
    if (qm) {
      const map: Record<string, number> = { een: 1, één: 1, twee: 2, drie: 3, vier: 4, vijf: 5 };
      qty = map[qm[1].toLowerCase()] || parseInt(qm[1]) || 1;
      itemText = part.substring(qm[0].length).trim();
    }

    // Clean filler
    itemText = itemText.replace(/^(ik wil|ik zou graag|graag|eh|euh|uh)\s+/i, '').trim();
    itemText = itemText.replace(/^(een|één)\s+/i, '').trim();
    itemText = itemText.replace(/\s*(alstublieft|aub|svp|blikje|bakje)\s*/i, ' ').trim();
    if (itemText.length < 2) continue;

    // Look up price
    const lower = itemText.toLowerCase();
    let price = 0;
    let matchedName = itemText;
    for (const [menuName, menuPrice] of sortedMenu) {
      if (lower.includes(menuName) || menuName.includes(lower)) {
        price = menuPrice;
        matchedName = menuName.charAt(0).toUpperCase() + menuName.slice(1);
        break;
      }
    }
    if (price === 0) {
      matchedName = itemText.charAt(0).toUpperCase() + itemText.slice(1);
    }

    const lineTotal = price * qty;
    total += lineTotal;
    const priceStr = lineTotal > 0 ? `€${lineTotal.toFixed(2)}` : '';
    receiptLines.push(`${qty}  ${matchedName}  ${priceStr}`);
  }

  if (receiptLines.length === 0) return { notes: rawText, total: 0 };
  return { notes: receiptLines.join('\n'), total };
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

// Extract delivery type — match whole words only to avoid false positives (e.g. "stoofvleessaus" contains "lev")
function extractDeliveryType(text: string): 'pickup' | 'delivery' {
  if (/\bbezorg\w*\b|\blever\w*\b|\bbrengen\b/i.test(text)) {
    if (/\bafhalen\b/i.test(text)) {
      const afhalenIdx = text.search(/\bafhalen\b/i);
      const bezorgIdx = text.search(/\bbezorg\w*\b|\blever\w*\b|\bbrengen\b/i);
      return afhalenIdx > bezorgIdx ? 'pickup' : 'delivery';
    }
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
    
    // ElevenLabs post-call webhook wraps everything in body.data
    const d = body.data || body;
    const agent_id = d.agent_id || body.agent_id || null;
    const conversation_id = d.conversation_id || body.conversation_id || null;
    const transcript = d.transcript || body.transcript || null;
    const call_duration_seconds = d.metadata?.call_duration_secs || d.call_duration_secs || body.call_duration_seconds || body.duration || 0;
    const caller_phone_number = d.caller_phone || d.caller_phone_number || body.caller_phone_number || null;
    const call_successful = (d.analysis?.call_successful !== 'failure') && (body.call_successful !== false) && (body.status !== 'failed');
    const summary = d.analysis?.transcript_summary || d.summary || body.summary || null;
    const metadata = d.metadata || body.metadata || null;
    const timestamp = body.event_timestamp ? new Date(body.event_timestamp * 1000).toISOString() : (body.timestamp || new Date().toISOString());
    
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
      // Convert transcript array to readable text for parsing
      let transcriptText: string;
      if (typeof transcript === 'string') {
        transcriptText = transcript;
      } else if (Array.isArray(transcript)) {
        transcriptText = transcript.map((m: { role?: string; message?: string; text?: string }) => 
          `${m.role || 'unknown'}: ${m.message || m.text || ''}`
        ).join('\n');
      } else {
        transcriptText = JSON.stringify(transcript);
      }
      
      // Get business type to determine if it's horeca or appointment-based
      const { data: fullBusiness } = await supabase
        .from('businesses')
        .select('type')
        .eq('id', business.id)
        .single();
      
      const isHoreca = fullBusiness?.type && HORECA_TYPES.includes(fullBusiness.type);
      
      // For horeca businesses, ALWAYS create an order from successful calls
      if (isHoreca) {
        const customerName = extractCustomerName(transcriptText) || 'Telefoon klant';
        const customerPhone = extractPhoneNumber(transcriptText) || caller_phone_number || '';
        const deliveryType = extractDeliveryType(transcriptText);
        const customerAddress = deliveryType === 'delivery' ? extractAddress(transcriptText) : null;
        const { time: deliveryTime } = extractDateTime(transcriptText);
        
        // Extract order from the agent's own summary + calculate total from menu prices
        const menuPrices = await loadMenuPrices(supabase, business.id);
        const { notes: orderNotes, total: totalAmount } = Array.isArray(transcript)
          ? buildReceipt(transcript, menuPrices)
          : { notes: transcriptText.substring(0, 500), total: 0 };
        
        const { error: orderError } = await supabase
          .from('orders')
          .insert({
            business_id: business.id,
            customer_name: customerName,
            customer_phone: customerPhone,
            order_type: deliveryType,
            notes: orderNotes,
            status: 'pending',
            source: 'phone',
            total_amount: totalAmount,
            created_at: new Date().toISOString()
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
