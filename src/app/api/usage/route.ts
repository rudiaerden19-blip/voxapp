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

// Plan limits in minutes
const PLAN_LIMITS: Record<string, number> = {
  starter: 375,
  pro: 940,
  professional: 940,
  business: 1875,
  enterprise: 1875,
};

// Extra minute costs
const EXTRA_MINUTE_COST: Record<string, number> = {
  starter: 0.15,
  pro: 0.12,
  professional: 0.12,
  business: 0.10,
  enterprise: 0.10,
};

// GET - Fetch usage statistics for a business
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const businessId = searchParams.get('business_id');
    const month = searchParams.get('month') || new Date().toISOString().slice(0, 7);

    if (!businessId) {
      return NextResponse.json({ error: 'business_id is required' }, { status: 400 });
    }

    const supabase = getSupabase();

    // Get business info
    const { data: business, error: businessError } = await supabase
      .from('businesses')
      .select('id, name, subscription_plan')
      .eq('id', businessId)
      .single();

    if (businessError || !business) {
      return NextResponse.json({ error: 'Business not found' }, { status: 404 });
    }

    // Get monthly usage
    const { data: monthlyUsage } = await supabase
      .from('usage_monthly')
      .select('*')
      .eq('business_id', businessId)
      .eq('month', month)
      .single();

    // Get recent call logs (last 50)
    const { data: recentCalls } = await supabase
      .from('call_logs')
      .select('id, duration_minutes, caller_phone, status, summary, created_at')
      .eq('business_id', businessId)
      .order('created_at', { ascending: false })
      .limit(50);

    // Get usage history (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    const startMonth = sixMonthsAgo.toISOString().slice(0, 7);

    const { data: usageHistory } = await supabase
      .from('usage_monthly')
      .select('month, total_calls, total_minutes, extra_minutes')
      .eq('business_id', businessId)
      .gte('month', startMonth)
      .order('month', { ascending: true });

    // Calculate current month stats
    const plan = business.subscription_plan || 'starter';
    const includedMinutes = PLAN_LIMITS[plan] || 375;
    const extraMinuteCost = EXTRA_MINUTE_COST[plan] || 0.15;
    
    const totalMinutes = monthlyUsage?.total_minutes || 0;
    const totalCalls = monthlyUsage?.total_calls || 0;
    const extraMinutes = Math.max(0, totalMinutes - includedMinutes);
    const extraCost = extraMinutes * extraMinuteCost;
    const usagePercentage = Math.min(100, Math.round((totalMinutes / includedMinutes) * 100));

    // Calculate daily average
    const today = new Date();
    const dayOfMonth = today.getDate();
    const avgMinutesPerDay = dayOfMonth > 0 ? Math.round(totalMinutes / dayOfMonth) : 0;
    const projectedMonthlyMinutes = avgMinutesPerDay * 30;

    return NextResponse.json({
      business: {
        id: business.id,
        name: business.name,
        plan: plan,
      },
      currentMonth: {
        month: month,
        totalCalls: totalCalls,
        totalMinutes: totalMinutes,
        includedMinutes: includedMinutes,
        extraMinutes: extraMinutes,
        extraCost: Math.round(extraCost * 100) / 100,
        usagePercentage: usagePercentage,
        avgMinutesPerDay: avgMinutesPerDay,
        projectedMonthlyMinutes: projectedMonthlyMinutes,
      },
      recentCalls: recentCalls || [],
      usageHistory: usageHistory || [],
      limits: {
        includedMinutes: includedMinutes,
        extraMinuteCost: extraMinuteCost,
      },
    });

  } catch (error: any) {
    console.error('Usage fetch error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
