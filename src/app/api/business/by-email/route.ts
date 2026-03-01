import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient, verifyAdminCookie } from '@/lib/adminAuth';

export async function GET(request: NextRequest) {
  const auth = verifyAdminCookie(request);
  if (!auth.isAdmin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');

    if (!email) {
      return NextResponse.json({ error: 'Email required' }, { status: 400 });
    }

    const supabase = createAdminClient();

    // Try by email first
    let { data, error } = await supabase
      .from('businesses')
      .select('*')
      .eq('email', email)
      .single();

    if (error || !data) {
      // Try by user_id via profiles
      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', email)
        .single();
      
      if (profile) {
        const { data: bizByUser } = await supabase
          .from('businesses')
          .select('*')
          .eq('user_id', profile.id)
          .single();
        data = bizByUser;
      }
    }

    if (!data) {
      return NextResponse.json({ error: 'Business not found' }, { status: 404 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
