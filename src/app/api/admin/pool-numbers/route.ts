import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient, verifyAdminCookie, unauthorizedResponse } from '@/lib/adminAuth';

const MAX_CUSTOMERS_PER_POOL = 50;

// GET - Lijst poolnummers (admin)
export async function GET(request: NextRequest) {
  try {
    const { isAdmin, error: authError } = verifyAdminCookie(request);
    if (!isAdmin) return unauthorizedResponse(authError || 'Geen toegang');

    const supabase = createAdminClient();
    const { data: pools, error } = await supabase
      .from('pool_numbers')
      .select('id, phone_number, provider, status, country, monthly_cost, max_concurrent_calls, twilio_sid, default_agent_id, created_at')
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Aantal forwarding_numbers per pool
    const { data: forwarding } = await supabase
      .from('forwarding_numbers')
      .select('pool_number_id');

    const countByPool: Record<string, number> = {};
    for (const row of forwarding || []) {
      if (row.pool_number_id) {
        countByPool[row.pool_number_id] = (countByPool[row.pool_number_id] ?? 0) + 1;
      }
    }

    const poolsWithCount = (pools || []).map((p) => ({
      ...p,
      customer_count: countByPool[p.id] ?? 0,
      capacity_remaining: Math.max(0, MAX_CUSTOMERS_PER_POOL - (countByPool[p.id] ?? 0)),
    }));

    return NextResponse.json({ pool_numbers: poolsWithCount });
  } catch (err: unknown) {
    console.error('Admin pool-numbers GET:', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Fout bij ophalen' },
      { status: 500 }
    );
  }
}

// POST - Nieuw poolnummer toevoegen (admin)
export async function POST(request: NextRequest) {
  try {
    const { isAdmin, error: authError } = verifyAdminCookie(request);
    if (!isAdmin) return unauthorizedResponse(authError || 'Geen toegang');

    const body = await request.json();
    const {
      phone_number,
      provider = 'twilio',
      country = 'BE',
      monthly_cost = 25,
      max_concurrent_calls = 10,
    } = body;

    if (!phone_number || typeof phone_number !== 'string') {
      return NextResponse.json(
        { error: 'phone_number is verplicht (E.164, bijv. +32480210449)' },
        { status: 400 }
      );
    }

    const normalized = phone_number.replace(/\s/g, '').startsWith('+')
      ? phone_number.replace(/\s/g, '')
      : `+${phone_number.replace(/\s/g, '')}`;

    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from('pool_numbers')
      .insert({
        phone_number: normalized,
        provider: body.provider || 'twilio',
        status: 'active',
        country: country || 'BE',
        monthly_cost: Number(monthly_cost) || 25,
        max_concurrent_calls: Number(max_concurrent_calls) || 10,
        twilio_sid: body.twilio_sid || null,
        default_agent_id: body.default_agent_id || null,
      })
      .select()
      .single();

    if (error) {
      if (error.code === '23505') {
        return NextResponse.json(
          { error: 'Dit nummer staat al in de pool' },
          { status: 409 }
        );
      }
      throw error;
    }

    return NextResponse.json({ success: true, pool_number: data });
  } catch (err: unknown) {
    console.error('Admin pool-numbers POST:', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Fout bij toevoegen' },
      { status: 500 }
    );
  }
}
