import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { PLAN_MINUTES } from '@/lib/planFacts';
import { verifyElevenLabsSecret } from '@/lib/apiAuth';

function getSupabase() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error('Missing Supabase environment variables');
  }
  return createClient(supabaseUrl, serviceRoleKey);
}

export async function POST(request: NextRequest) {
  const authError = verifyElevenLabsSecret(request);
  if (authError) return authError;

  try {
    const body = await request.json();

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

    let business = null;

    if (agent_id) {
      const { data } = await supabase
        .from('businesses')
        .select('id, name, subscription_plan')
        .eq('agent_id', agent_id)
        .single();
      business = data;
    }

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

    // ── CALL LOG ────────────────────────────────────────────
    const { error: insertError } = await supabase
      .from('call_logs')
      .insert({
        business_id: business.id,
        conversation_id,
        agent_id,
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
    }

    // ── USAGE TRACKING ─────────────────────────────────────
    const currentMonth = new Date().toISOString().slice(0, 7);

    const { data: existingUsage } = await supabase
      .from('usage_monthly')
      .select('*')
      .eq('business_id', business.id)
      .eq('month', currentMonth)
      .single();

    if (existingUsage) {
      await supabase
        .from('usage_monthly')
        .update({
          total_calls: existingUsage.total_calls + 1,
          total_minutes: existingUsage.total_minutes + durationMinutes,
          updated_at: new Date().toISOString(),
        })
        .eq('id', existingUsage.id);
    } else {
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

  } catch (error: unknown) {
    console.error('Webhook processing error:', error);
    return NextResponse.json({
      received: true,
      error: error instanceof Error ? error.message : String(error),
    });
  }
}

export async function GET() {
  return NextResponse.json({
    status: 'ok',
    endpoint: 'ElevenLabs webhook receiver (read-only — no order creation)',
  });
}
