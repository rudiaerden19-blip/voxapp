import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { PLAN_MINUTES } from '@/lib/planFacts';

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
    // Verify webhook signature (ElevenLabs sends a signature header)
    const signature = request.headers.get('x-elevenlabs-signature');
    const webhookSecret = process.env.ELEVENLABS_WEBHOOK_SECRET;
    
    // In production, verify the signature
    // For now, we'll accept all webhooks but log a warning if no secret is set
    if (webhookSecret && !signature) {
      console.warn('ElevenLabs webhook received without signature');
    }

    const body = await request.json();
    
    // ElevenLabs webhook payload structure
    const {
      conversation_id,
      agent_id,
      call_duration_seconds,
      call_successful,
      caller_phone_number,
      transcript,
      summary,
      metadata,
      timestamp,
    } = body;

    if (!agent_id) {
      return NextResponse.json({ error: 'Missing agent_id' }, { status: 400 });
    }

    const supabase = getSupabase();

    // Find the business associated with this agent
    const { data: business, error: businessError } = await supabase
      .from('businesses')
      .select('id, name, subscription_plan')
      .eq('elevenlabs_agent_id', agent_id)
      .single();

    if (businessError || !business) {
      console.error('Business not found for agent:', agent_id);
      // Still return 200 to acknowledge receipt
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
