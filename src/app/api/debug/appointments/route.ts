import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient, verifyAdminCookie } from '@/lib/adminAuth';

export async function GET(request: NextRequest) {
  const auth = verifyAdminCookie(request);
  if (!auth.isAdmin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const { searchParams } = new URL(request.url);
    const businessId = searchParams.get('business_id');
    const email = searchParams.get('email');

    const supabase = createAdminClient();

    let business: { id: string; name: string; vapi_assistant_id: string | null; agent_id: string | null } | null = null;

    if (businessId) {
      const { data } = await supabase.from('businesses').select('*').eq('id', businessId).single();
      business = data ? { id: data.id, name: data.name, vapi_assistant_id: (data as { vapi_assistant_id?: string }).vapi_assistant_id ?? null, agent_id: (data as { agent_id?: string }).agent_id ?? null } : null;
    } else if (email) {
      let { data } = await supabase.from('businesses').select('*').eq('email', email).single();
      if (!data) {
        const { data: profile } = await supabase.from('profiles').select('id').eq('email', email).single();
        if (profile) {
          const res = await supabase.from('businesses').select('*').eq('user_id', profile.id).single();
          data = res.data;
        }
      }
      business = data ? { id: data.id, name: data.name, vapi_assistant_id: (data as { vapi_assistant_id?: string }).vapi_assistant_id ?? null, agent_id: (data as { agent_id?: string }).agent_id ?? null } : null;
    }

    if (!business) {
      return NextResponse.json({ error: 'Business niet gevonden. Geef business_id of email.' }, { status: 404 });
    }

    const { data: appointments } = await supabase
      .from('appointments')
      .select('id, customer_name, start_time, status, notes, created_at')
      .eq('business_id', business.id)
      .order('created_at', { ascending: false })
      .limit(50);

    const { count } = await supabase
      .from('appointments')
      .select('*', { count: 'exact', head: true })
      .eq('business_id', business.id);

    return NextResponse.json({
      business: {
        id: business.id,
        name: business.name,
        vapi_assistant_id: business.vapi_assistant_id,
        agent_id: business.agent_id,
        verwacht_assistant_id: process.env.VAPI_ASSISTANT_ID ?? 'niet-geconfigureerd',
        ok: !!business.vapi_assistant_id && business.vapi_assistant_id === (process.env.VAPI_ASSISTANT_ID ?? ''),
      },
      appointments_count: count ?? 0,
      appointments: appointments ?? [],
    });
  } catch (err) {
    console.error('[debug/appointments]', err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
