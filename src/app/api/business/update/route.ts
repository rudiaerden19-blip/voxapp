import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

// Create admin client with service role key (bypasses RLS)
function createAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error('Missing Supabase environment variables');
  }

  return createClient(supabaseUrl, serviceRoleKey);
}

// PUT - Update business
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('Update request body:', JSON.stringify(body));
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json({ error: 'Business ID required' }, { status: 400 });
    }

    console.log('Updating business:', id, 'with:', JSON.stringify(updates));
    const supabase = createAdminClient();

    const { data, error } = await supabase
      .from('businesses')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Update business error:', error);
      return NextResponse.json({ error: error.message, details: error }, { status: 500 });
    }

    console.log('Update success:', data?.id);
    return NextResponse.json(data);
  } catch (error: unknown) {
    console.error('API error:', error);
    const message = error instanceof Error ? error.message : 'Server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
