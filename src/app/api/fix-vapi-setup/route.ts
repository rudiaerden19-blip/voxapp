import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

/**
 * POST /api/fix-vapi-setup
 * Koppelt vapi_assistant_id (uit env) aan alle businesses.
 */
export async function POST() {
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const assistantId = process.env.VAPI_ASSISTANT_ID;

    if (!url || !key) {
      return NextResponse.json({ error: 'SUPABASE_SERVICE_ROLE_KEY ontbreekt in Vercel' }, { status: 500 });
    }
    if (!assistantId) {
      return NextResponse.json({ error: 'VAPI_ASSISTANT_ID ontbreekt in env' }, { status: 500 });
    }

    const supabase = createClient(url, key);

    const { data: businesses, error: listError } = await supabase
      .from('businesses')
      .select('id, name');

    if (listError) {
      return NextResponse.json({ error: listError.message }, { status: 500 });
    }

    if (!businesses?.length) {
      return NextResponse.json({ error: 'Geen businesses in database' }, { status: 404 });
    }

    let updateError: { message: string } | null = null;
    for (const b of businesses) {
      const { error } = await supabase
        .from('businesses')
        .update({ vapi_assistant_id: assistantId } as Record<string, unknown>)
        .eq('id', b.id);
      if (error) {
        updateError = error;
        break;
      }
    }

    if (updateError) {
      return NextResponse.json({
        error: updateError.message,
        hint: 'Kolom vapi_assistant_id ontbreekt waarschijnlijk. Voeg toe via SQL Editor.',
      }, { status: 500 });
    }

    return NextResponse.json({
      ok: true,
      message: `${businesses.length} business(s) gekoppeld aan Vapi EU assistant`,
      vapi_assistant_id: assistantId,
      region: 'EU',
    });
  } catch (err) {
    console.error('[fix-vapi-setup]', err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
