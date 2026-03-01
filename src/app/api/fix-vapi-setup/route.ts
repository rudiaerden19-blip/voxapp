import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const VAPI_ASSISTANT_ID = '0951136f-27b1-42cb-856c-32678ad1de57';

/**
 * POST /api/fix-vapi-setup
 * Voegt vapi_assistant_id kolom toe en koppelt aan alle businesses.
 * Roep aan na deploy om setup te voltooien.
 */
export async function POST() {
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !key) {
      return NextResponse.json({ error: 'SUPABASE_SERVICE_ROLE_KEY ontbreekt in Vercel' }, { status: 500 });
    }

    const supabase = createClient(url, key);

    // Voeg kolom toe (via RPC of direct - Supabase REST API ondersteunt geen ALTER)
    // We proberen gewoon te updaten; als kolom niet bestaat faalt dat
    const { data: businesses, error: listError } = await supabase
      .from('businesses')
      .select('id, name');

    if (listError) {
      return NextResponse.json({ error: listError.message }, { status: 500 });
    }

    if (!businesses?.length) {
      return NextResponse.json({ error: 'Geen businesses in database' }, { status: 404 });
    }

    // Update alle businesses met vapi_assistant_id
    let updateError: { message: string } | null = null;
    for (const b of businesses) {
      const { error } = await supabase
        .from('businesses')
        .update({ vapi_assistant_id: VAPI_ASSISTANT_ID } as Record<string, unknown>)
        .eq('id', b.id);
      if (error) {
        updateError = error;
        break;
      }
    }

    if (updateError) {
      const sql = 'ALTER TABLE businesses ADD COLUMN IF NOT EXISTS vapi_assistant_id TEXT; UPDATE businesses SET vapi_assistant_id = \'0951136f-27b1-42cb-856c-32678ad1de57\';';
      const sqlUrl = `https://supabase.com/dashboard/project/bkjqadaamxmwjeenzslr/sql/new?query=${encodeURIComponent(sql)}`;
      return NextResponse.json({
        error: updateError.message,
        hint: 'Kolom vapi_assistant_id ontbreekt. Klik om SQL uit te voeren:',
        fix_url: sqlUrl,
      }, { status: 500 });
    }

    return NextResponse.json({
      ok: true,
      message: `${businesses.length} business(s) gekoppeld aan Vapi assistant`,
      vapi_assistant_id: VAPI_ASSISTANT_ID,
    });
  } catch (err) {
    console.error('[fix-vapi-setup]', err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
