/**
 * Eénmalige setup: maakt Supabase Storage bucket + voice_sessions tabel aan.
 * Roep 1x aan: GET https://www.voxapp.tech/api/admin/setup-voice?key=SETUP
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET(request: NextRequest) {
  const key = request.nextUrl.searchParams.get('key');
  if (key !== 'SETUP') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const results: Record<string, string> = {};

  // 1. Maak voice-audio bucket aan (publiek)
  const { error: bucketError } = await supabase.storage.createBucket('voice-audio', {
    public: true,
    fileSizeLimit: 10 * 1024 * 1024, // 10MB
  });
  results.bucket = bucketError
    ? bucketError.message.includes('already exists')
      ? 'already exists ✓'
      : `ERROR: ${bucketError.message}`
    : 'created ✓';

  // 2. Maak voice_sessions tabel aan via raw SQL
  const { error: tableError } = await supabase.rpc('exec_sql', {
    query: `
      CREATE TABLE IF NOT EXISTS voice_sessions (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        call_control_id TEXT NOT NULL UNIQUE,
        business_id UUID NOT NULL,
        state TEXT NOT NULL DEFAULT 'GREETING',
        order_items JSONB NOT NULL DEFAULT '[]',
        delivery_type TEXT,
        customer_name TEXT,
        delivery_address TEXT,
        caller_phone TEXT,
        business_name TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
      ALTER TABLE voice_sessions DISABLE ROW LEVEL SECURITY;
    `,
  });
  results.voice_sessions_table = tableError
    ? `ERROR: ${tableError.message}`
    : 'created ✓';

  return NextResponse.json({ ok: true, results });
}
