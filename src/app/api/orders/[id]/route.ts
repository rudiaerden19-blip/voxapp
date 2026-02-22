import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { requireTenant, TenantError } from '@/lib/tenant';

const getSupabase = () => createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// GET - Get single order (tenant-scoped)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = getSupabase();
    const { id } = await params;
    const tenant = requireTenant(new URL(request.url).searchParams.get('business_id'));

    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('id', id)
      .eq('business_id', tenant.tenant_id)
      .single();

    if (error) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    return NextResponse.json(data);
  } catch (error) {
    if (error instanceof TenantError) return NextResponse.json({ error: error.message }, { status: 400 });
    console.error('Order GET error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

// PATCH - Update order (tenant-scoped)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = getSupabase();
    const { id } = await params;
    const body = await request.json();
    const tenant = requireTenant(body.business_id);
    const { status, notes, delivery_time } = body;

    const updates: Record<string, any> = {};
    
    if (status) {
      const validStatuses = ['new', 'preparing', 'ready', 'delivered', 'archived'];
      if (!validStatuses.includes(status)) {
        return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
      }
      updates.status = status;
      
      // Add timestamps for status changes
      if (status === 'delivered') {
        updates.delivered_at = new Date().toISOString();
      }
      if (status === 'archived') {
        updates.archived_at = new Date().toISOString();
      }
    }

    if (notes !== undefined) updates.notes = notes;
    if (delivery_time !== undefined) updates.delivery_time = delivery_time;

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: 'No updates provided' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('orders')
      .update(updates)
      .eq('id', id)
      .eq('business_id', tenant.tenant_id)
      .select()
      .single();

    if (error) {
      console.error('Error updating order:', error);
      return NextResponse.json({ error: 'Failed to update order' }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (error) {
    if (error instanceof TenantError) return NextResponse.json({ error: error.message }, { status: 400 });
    console.error('Order PATCH error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

// DELETE - Delete order (tenant-scoped)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = getSupabase();
    const { id } = await params;
    const tenant = requireTenant(new URL(request.url).searchParams.get('business_id'));

    const { error } = await supabase
      .from('orders')
      .delete()
      .eq('id', id)
      .eq('business_id', tenant.tenant_id);

    if (error) {
      console.error('Error deleting order:', error);
      return NextResponse.json({ error: 'Failed to delete order' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof TenantError) return NextResponse.json({ error: error.message }, { status: 400 });
    console.error('Order DELETE error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
