import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// GET - Get delivery config for a business
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const { data, error } = await supabase
      .from('businesses')
      .select('delivery_config')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching delivery config:', error);
      return NextResponse.json({ error: 'Business not found' }, { status: 404 });
    }

    return NextResponse.json({ delivery_config: data?.delivery_config || null });
  } catch (error) {
    console.error('Delivery config GET error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

// PUT - Update delivery config
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { delivery_config } = body;

    if (!delivery_config) {
      return NextResponse.json({ error: 'delivery_config required' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('businesses')
      .update({ delivery_config })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating delivery config:', error);
      return NextResponse.json({ error: 'Failed to update' }, { status: 500 });
    }

    return NextResponse.json({ success: true, delivery_config: data.delivery_config });
  } catch (error) {
    console.error('Delivery config PUT error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
