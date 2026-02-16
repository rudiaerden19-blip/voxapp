import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Create admin Supabase client
function getSupabase() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error('Missing Supabase environment variables');
  }
  
  return createClient(supabaseUrl, serviceRoleKey);
}

// Normalize phone number to E.164 format
function normalizePhoneNumber(phone: string): string {
  let normalized = phone.replace(/[^\d+]/g, '');
  
  if (!normalized.startsWith('+')) {
    if (normalized.startsWith('0')) {
      normalized = '+32' + normalized.slice(1);
    } else if (normalized.startsWith('32')) {
      normalized = '+' + normalized;
    } else {
      normalized = '+' + normalized;
    }
  }
  
  return normalized;
}

// Validate Belgian phone number
function isValidBelgianNumber(phone: string): boolean {
  const normalized = normalizePhoneNumber(phone);
  // Belgian numbers: +32 followed by 9 digits
  return /^\+32\d{9}$/.test(normalized);
}

// GET - List forwarding numbers for a business
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const businessId = searchParams.get('business_id');

    if (!businessId) {
      return NextResponse.json({ error: 'business_id is required' }, { status: 400 });
    }

    const supabase = getSupabase();

    const { data, error } = await supabase
      .from('forwarding_numbers')
      .select(`
        *,
        pool_numbers:pool_number_id (
          phone_number,
          country
        )
      `)
      .eq('business_id', businessId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Also get available pool numbers
    const { data: poolNumbers } = await supabase
      .from('pool_numbers')
      .select('id, phone_number, country')
      .eq('status', 'active');

    return NextResponse.json({
      forwarding_numbers: data || [],
      pool_numbers: poolNumbers || [],
    });

  } catch (error: any) {
    console.error('Error fetching forwarding numbers:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST - Add a new forwarding number
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { business_id, phone_number, forwarding_type = 'all' } = body;

    if (!business_id || !phone_number) {
      return NextResponse.json({ 
        error: 'business_id and phone_number are required' 
      }, { status: 400 });
    }

    // Normalize and validate the phone number
    const normalizedNumber = normalizePhoneNumber(phone_number);
    
    if (!isValidBelgianNumber(normalizedNumber)) {
      return NextResponse.json({ 
        error: 'Ongeldig Belgisch telefoonnummer. Gebruik formaat: +32xxxxxxxxx of 0xxxxxxxxx' 
      }, { status: 400 });
    }

    const supabase = getSupabase();

    // Check if number is already registered
    const { data: existing } = await supabase
      .from('forwarding_numbers')
      .select('id, business_id')
      .eq('phone_number', normalizedNumber)
      .single();

    if (existing) {
      return NextResponse.json({ 
        error: 'Dit telefoonnummer is al geregistreerd' 
      }, { status: 400 });
    }

    // Get active pool numbers with fewer than 50 forwarding numbers (max 50 klanten per nummer)
    const { data: allPools } = await supabase
      .from('pool_numbers')
      .select('id, phone_number')
      .eq('status', 'active');

    if (!allPools?.length) {
      return NextResponse.json(
        { error: 'Geen poolnummers beschikbaar. Neem contact op met support.' },
        { status: 503 }
      );
    }

    const { data: counts } = await supabase
      .from('forwarding_numbers')
      .select('pool_number_id');

    const countByPool: Record<string, number> = {};
    for (const p of allPools) countByPool[p.id] = 0;
    for (const row of counts || []) {
      if (row.pool_number_id) countByPool[row.pool_number_id] = (countByPool[row.pool_number_id] ?? 0) + 1;
    }

    const poolWithCapacity = allPools
      .filter((p) => (countByPool[p.id] ?? 0) < 50)
      .sort((a, b) => (countByPool[a.id] ?? 0) - (countByPool[b.id] ?? 0))[0];

    if (!poolWithCapacity) {
      return NextResponse.json(
        { error: 'Alle poolnummers zijn vol (max 50 klanten per nummer). Er worden binnenkort nieuwe nummers toegevoegd.' },
        { status: 503 }
      );
    }

    const poolNumberId = poolWithCapacity.id;
    const poolPhoneNumber = poolWithCapacity.phone_number;

    // Insert the forwarding number
    const { data, error } = await supabase
      .from('forwarding_numbers')
      .insert({
        business_id,
        phone_number: normalizedNumber,
        pool_number_id: poolNumberId,
        forwarding_type,
        is_active: true,
      })
      .select()
      .single();

    if (error) throw error;

    // Generate forwarding instructions
    let forwardingInstructions = '';
    if (poolPhoneNumber) {
      forwardingInstructions = generateForwardingInstructions(poolPhoneNumber, forwarding_type);
    }

    return NextResponse.json({
      success: true,
      forwarding_number: data,
      pool_number: poolPhoneNumber,
      instructions: forwardingInstructions,
    });

  } catch (error: any) {
    console.error('Error adding forwarding number:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE - Remove a forwarding number
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const businessId = searchParams.get('business_id');

    if (!id || !businessId) {
      return NextResponse.json({ error: 'id and business_id are required' }, { status: 400 });
    }

    const supabase = getSupabase();

    // Verify ownership before deleting
    const { data: existing } = await supabase
      .from('forwarding_numbers')
      .select('id, phone_number')
      .eq('id', id)
      .eq('business_id', businessId)
      .single();

    if (!existing) {
      return NextResponse.json({ error: 'Forwarding number not found' }, { status: 404 });
    }

    const { error } = await supabase
      .from('forwarding_numbers')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return NextResponse.json({
      success: true,
      message: 'Doorschakeling verwijderd',
      deleted_number: existing.phone_number,
    });

  } catch (error: any) {
    console.error('Error deleting forwarding number:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// Generate forwarding instructions based on type
function generateForwardingInstructions(poolNumber: string, forwardingType: string): string {
  // Format pool number for GSM codes (without +)
  const formattedNumber = poolNumber.replace('+', '');
  
  const instructions: Record<string, string> = {
    all: `Doorschakelen alle oproepen:
1. Bel **21*${formattedNumber}# op uw telefoon
2. Alle oproepen worden nu doorgeschakeld naar de AI

Om te annuleren: ##21#`,

    no_answer: `Doorschakelen als u niet opneemt:
1. Bel **61*${formattedNumber}# op uw telefoon
2. Oproepen die niet worden beantwoord gaan naar de AI

Om te annuleren: ##61#`,

    busy: `Doorschakelen als u in gesprek bent:
1. Bel **67*${formattedNumber}# op uw telefoon
2. Als uw lijn bezet is, gaat de oproep naar de AI

Om te annuleren: ##67#`,

    unavailable: `Doorschakelen als u niet bereikbaar bent:
1. Bel **62*${formattedNumber}# op uw telefoon
2. Als u niet bereikbaar bent, gaat de oproep naar de AI

Om te annuleren: ##62#`,
  };

  return instructions[forwardingType] || instructions.all;
}
