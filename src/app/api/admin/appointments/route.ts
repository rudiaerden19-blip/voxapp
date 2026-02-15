import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

// Admin client met service role key (bypass RLS)
function createAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error('Missing Supabase environment variables');
  }

  return createClient(supabaseUrl, serviceRoleKey);
}

// GET: Haal afspraken op voor een business
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const businessId = searchParams.get('business_id');
    const startDate = searchParams.get('start_date');
    const endDate = searchParams.get('end_date');

    if (!businessId) {
      return NextResponse.json({ error: 'business_id required' }, { status: 400 });
    }

    const supabase = createAdminClient();

    let query = supabase
      .from('appointments')
      .select('*')
      .eq('business_id', businessId)
      .order('start_time');

    if (startDate) {
      query = query.gte('start_time', startDate);
    }
    if (endDate) {
      query = query.lte('start_time', endDate);
    }

    const { data, error } = await query;

    if (error) throw error;

    return NextResponse.json(data || []);
  } catch (error) {
    console.error('Appointments GET error:', error);
    return NextResponse.json({ error: 'Kon afspraken niet ophalen' }, { status: 500 });
  }
}

// POST: Maak of update afspraak
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, business_id, ...appointmentData } = body;

    if (!business_id) {
      return NextResponse.json({ error: 'business_id required' }, { status: 400 });
    }

    const supabase = createAdminClient();

    let result;
    if (id) {
      // Update
      const { data: updated, error } = await supabase
        .from('appointments')
        .update(appointmentData)
        .eq('id', id)
        .eq('business_id', business_id)
        .select()
        .single();
      
      if (error) throw error;
      result = updated;
    } else {
      // Insert
      const { data: inserted, error } = await supabase
        .from('appointments')
        .insert({ business_id, ...appointmentData })
        .select()
        .single();
      
      if (error) throw error;
      result = inserted;
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('Appointments POST error:', error);
    return NextResponse.json({ error: 'Kon afspraak niet opslaan' }, { status: 500 });
  }
}

// DELETE: Verwijder afspraak
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const businessId = searchParams.get('business_id');

    if (!id || !businessId) {
      return NextResponse.json({ error: 'id and business_id required' }, { status: 400 });
    }

    const supabase = createAdminClient();

    const { error } = await supabase
      .from('appointments')
      .delete()
      .eq('id', id)
      .eq('business_id', businessId);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Appointments DELETE error:', error);
    return NextResponse.json({ error: 'Kon afspraak niet verwijderen' }, { status: 500 });
  }
}
