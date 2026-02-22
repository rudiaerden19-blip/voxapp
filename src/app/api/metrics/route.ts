import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { requireTenant, TenantError } from '@/lib/tenant';

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error('Missing Supabase env vars');
  return createClient(url, key);
}

export async function GET(request: NextRequest) {
  try {
    const tenantId = request.nextUrl.searchParams.get('tenant_id');
    const tenant = requireTenant(tenantId);

    const supabase = getSupabase();
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();

    const [ordersToday, ordersTotal, activeSessions, pendingOrders] = await Promise.all([
      supabase
        .from('orders')
        .select('id', { count: 'exact', head: true })
        .eq('business_id', tenant.tenant_id)
        .gte('created_at', todayStart),

      supabase
        .from('orders')
        .select('id, total_amount', { count: 'exact' })
        .eq('business_id', tenant.tenant_id)
        .limit(0),

      supabase
        .from('voice_sessions')
        .select('conversation_id', { count: 'exact', head: true })
        .eq('business_id', tenant.tenant_id),

      supabase
        .from('orders')
        .select('id', { count: 'exact', head: true })
        .eq('business_id', tenant.tenant_id)
        .in('status', ['pending', 'new', 'preparing']),
    ]);

    // Revenue today
    const { data: revenueData } = await supabase
      .from('orders')
      .select('total_amount')
      .eq('business_id', tenant.tenant_id)
      .gte('created_at', todayStart);

    const revenueToday = (revenueData || []).reduce(
      (sum: number, o: { total_amount: number }) => sum + (o.total_amount || 0),
      0
    );

    return NextResponse.json({
      tenant_id: tenant.tenant_id,
      timestamp: now.toISOString(),
      metrics: {
        orders_today: ordersToday.count || 0,
        orders_total: ordersTotal.count || 0,
        revenue_today: Math.round(revenueToday * 100) / 100,
        active_sessions: activeSessions.count || 0,
        pending_orders: pendingOrders.count || 0,
      },
    });

  } catch (error: unknown) {
    if (error instanceof TenantError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
