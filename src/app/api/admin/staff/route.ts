import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

function createAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error('Missing Supabase environment variables');
  }

  return createClient(supabaseUrl, serviceRoleKey);
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const businessId = searchParams.get('business_id');
    const all = searchParams.get('all'); // Get all staff including inactive

    if (!businessId) {
      return NextResponse.json({ error: 'business_id required' }, { status: 400 });
    }

    const supabase = createAdminClient();

    let query = supabase
      .from('staff')
      .select('*')
      .eq('business_id', businessId)
      .order('name');

    if (!all) {
      query = query.eq('is_active', true);
    }

    const { data, error } = await query;

    if (error) throw error;

    return NextResponse.json(data || []);
  } catch (error) {
    console.error('Staff GET error:', error);
    return NextResponse.json({ error: 'Kon medewerkers niet ophalen' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { business_id, name, email, phone, working_hours, is_active } = body;

    if (!business_id || !name) {
      return NextResponse.json({ error: 'business_id en name zijn verplicht' }, { status: 400 });
    }

    const supabase = createAdminClient();

    const { data, error } = await supabase
      .from('staff')
      .insert({
        business_id,
        name: name.trim(),
        email: email?.trim() || null,
        phone: phone?.trim() || null,
        working_hours: working_hours || null,
        is_active: is_active !== false,
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    console.error('Staff POST error:', error);
    return NextResponse.json({ error: 'Kon medewerker niet aanmaken' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, name, email, phone, working_hours, is_active } = body;

    if (!id || !name) {
      return NextResponse.json({ error: 'id en name zijn verplicht' }, { status: 400 });
    }

    const supabase = createAdminClient();

    const { data, error } = await supabase
      .from('staff')
      .update({
        name: name.trim(),
        email: email?.trim() || null,
        phone: phone?.trim() || null,
        working_hours: working_hours || null,
        is_active: is_active !== false,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    console.error('Staff PUT error:', error);
    return NextResponse.json({ error: 'Kon medewerker niet bijwerken' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'id is verplicht' }, { status: 400 });
    }

    const supabase = createAdminClient();

    const { error } = await supabase
      .from('staff')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Staff DELETE error:', error);
    return NextResponse.json({ error: 'Kon medewerker niet verwijderen' }, { status: 500 });
  }
}
