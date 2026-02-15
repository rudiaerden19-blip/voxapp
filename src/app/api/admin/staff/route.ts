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

    if (!businessId) {
      return NextResponse.json({ error: 'business_id required' }, { status: 400 });
    }

    const supabase = createAdminClient();

    const { data, error } = await supabase
      .from('staff')
      .select('id, name, is_active')
      .eq('business_id', businessId)
      .eq('is_active', true)
      .order('name');

    if (error) throw error;

    return NextResponse.json(data || []);
  } catch (error) {
    console.error('Staff GET error:', error);
    return NextResponse.json({ error: 'Kon medewerkers niet ophalen' }, { status: 500 });
  }
}
