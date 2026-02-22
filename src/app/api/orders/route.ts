import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { requireTenant, TenantError } from '@/lib/tenant';

const getSupabase = () => createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// GET - Fetch orders for a business
export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabase();
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const period = searchParams.get('period');

    const tenant = requireTenant(searchParams.get('business_id'));
    const businessId = tenant.tenant_id;

    let query = supabase
      .from('orders')
      .select('*')
      .eq('business_id', businessId)
      .order('created_at', { ascending: false });

    // Filter by status
    if (status) {
      const statuses = status.split(',');
      query = query.in('status', statuses);
    }

    // Filter by period
    if (period && period !== 'all') {
      const now = new Date();
      let startDate: Date;

      switch (period) {
        case 'today':
          startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          break;
        case 'week':
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case 'month':
          startDate = new Date(now.getFullYear(), now.getMonth(), 1);
          break;
        default:
          startDate = new Date(0);
      }

      query = query.gte('created_at', startDate.toISOString());
    }

    const { data, error } = await query.limit(500);

    if (error) {
      console.error('Error fetching orders:', error);
      return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
    }

    // Zorg dat items altijd een array is (keukenscherm verwacht order.items[])
    const orders = (data || []).map((o: { items?: unknown }) => ({
      ...o,
      items: Array.isArray(o.items) ? o.items : [],
    }));
    return NextResponse.json(orders);
  } catch (error) {
    if (error instanceof TenantError) return NextResponse.json({ error: error.message }, { status: 400 });
    console.error('Orders GET error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

// POST - Create a new order (called by AI or manual)
export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabase();
    const body = await request.json();
    const {
      business_id,
      customer_name,
      customer_phone,
      customer_address,
      delivery_type, // 'delivery' or 'pickup'
      delivery_time,
      items, // Array of { product_id, product_name, quantity, price, options, notes }
      notes,
      total_amount,
    } = body;

    const tenant = requireTenant(business_id);

    if (!customer_name || !customer_phone || !items || items.length === 0) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Calculate total if not provided
    const calculatedTotal = total_amount || items.reduce((sum: number, item: any) => {
      return sum + (item.price * item.quantity);
    }, 0);

    const { data, error } = await supabase
      .from('orders')
      .insert({
        business_id: tenant.tenant_id,
        customer_name,
        customer_phone,
        customer_address,
        delivery_type: delivery_type || 'pickup',
        delivery_time,
        items,
        notes,
        total_amount: calculatedTotal,
        status: 'new',
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating order:', error);
      return NextResponse.json({ error: 'Failed to create order' }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (error) {
    if (error instanceof TenantError) return NextResponse.json({ error: error.message }, { status: 400 });
    console.error('Orders POST error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
