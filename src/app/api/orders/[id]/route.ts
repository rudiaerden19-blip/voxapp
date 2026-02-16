import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// GET - Get single order
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Order GET error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

// PATCH - Update order (status, etc.)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
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
      .select()
      .single();

    if (error) {
      console.error('Error updating order:', error);
      return NextResponse.json({ error: 'Failed to update order' }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Order PATCH error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

// DELETE - Delete order (admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const { error } = await supabase
      .from('orders')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting order:', error);
      return NextResponse.json({ error: 'Failed to delete order' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Order DELETE error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
