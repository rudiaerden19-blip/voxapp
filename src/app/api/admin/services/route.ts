import { NextRequest, NextResponse } from 'next/server';
import { 
  createAdminClient, 
  verifyBusinessAccess, 
  unauthorizedResponse,
  forbiddenResponse,
  isValidUUID,
  sanitizeString,
  isPositiveNumber
} from '@/lib/adminAuth';

// GET: Haal alle services op voor een business
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const businessId = searchParams.get('business_id');
    const all = searchParams.get('all') === 'true';

    // Validatie
    if (!businessId) {
      return NextResponse.json({ error: 'business_id is verplicht' }, { status: 400 });
    }

    if (!isValidUUID(businessId)) {
      return NextResponse.json({ error: 'Ongeldig business_id formaat' }, { status: 400 });
    }

    // Autorisatie check
    const auth = await verifyBusinessAccess(request, businessId);
    if (!auth.hasAccess) {
      return auth.error === 'Niet ingelogd' || auth.error === 'Ongeldige sessie'
        ? unauthorizedResponse(auth.error)
        : forbiddenResponse(auth.error || 'Geen toegang');
    }

    const supabase = createAdminClient();

    let query = supabase
      .from('services')
      .select('id, name, description, duration_minutes, price, is_active, created_at')
      .eq('business_id', businessId)
      .order('name');

    if (!all) {
      query = query.eq('is_active', true);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Services GET DB error:', error);
      return NextResponse.json({ error: 'Database fout bij ophalen diensten' }, { status: 500 });
    }

    return NextResponse.json(data || []);
  } catch (error) {
    console.error('Services GET error:', error);
    return NextResponse.json({ error: 'Interne serverfout' }, { status: 500 });
  }
}

// POST: Maak of update service
export async function POST(request: NextRequest) {
  try {
    // Parse body
    let body;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: 'Ongeldige JSON data' }, { status: 400 });
    }

    const { business_id, id, name, description, duration_minutes, price, is_active } = body;

    // Validatie
    if (!business_id) {
      return NextResponse.json({ error: 'business_id is verplicht' }, { status: 400 });
    }

    if (!isValidUUID(business_id)) {
      return NextResponse.json({ error: 'Ongeldig business_id formaat' }, { status: 400 });
    }

    if (id && !isValidUUID(id)) {
      return NextResponse.json({ error: 'Ongeldig service id formaat' }, { status: 400 });
    }

    // Autorisatie check
    const auth = await verifyBusinessAccess(request, business_id);
    if (!auth.hasAccess) {
      return auth.error === 'Niet ingelogd' || auth.error === 'Ongeldige sessie'
        ? unauthorizedResponse(auth.error)
        : forbiddenResponse(auth.error || 'Geen toegang');
    }

    // Valideer naam
    const sanitizedName = sanitizeString(name, 200);
    if (!sanitizedName || sanitizedName.length < 2) {
      return NextResponse.json({ error: 'Naam is verplicht (minimaal 2 karakters)' }, { status: 400 });
    }

    // Valideer prijs
    const priceNum = parseFloat(price);
    if (!isPositiveNumber(priceNum)) {
      return NextResponse.json({ error: 'Ongeldige prijs' }, { status: 400 });
    }

    // Valideer duur
    const durationNum = parseInt(duration_minutes);
    if (!Number.isInteger(durationNum) || durationNum < 1 || durationNum > 1440) {
      return NextResponse.json({ error: 'Ongeldige duur (1-1440 minuten)' }, { status: 400 });
    }

    const supabase = createAdminClient();

    const serviceData = {
      name: sanitizedName,
      description: sanitizeString(description, 1000) || null,
      duration_minutes: durationNum,
      price: priceNum,
      is_active: is_active !== false,
    };

    let result;
    if (id) {
      // Update
      const { data: existing } = await supabase
        .from('services')
        .select('id')
        .eq('id', id)
        .eq('business_id', business_id)
        .single();

      if (!existing) {
        return NextResponse.json({ error: 'Dienst niet gevonden' }, { status: 404 });
      }

      const { data: updated, error } = await supabase
        .from('services')
        .update({ ...serviceData, updated_at: new Date().toISOString() })
        .eq('id', id)
        .eq('business_id', business_id)
        .select()
        .single();
      
      if (error) {
        console.error('Service update DB error:', error);
        return NextResponse.json({ error: 'Database fout bij bijwerken dienst' }, { status: 500 });
      }

      result = updated;
    } else {
      // Insert
      const { data: inserted, error } = await supabase
        .from('services')
        .insert({ business_id, ...serviceData })
        .select()
        .single();
      
      if (error) {
        console.error('Service insert DB error:', error);
        return NextResponse.json({ error: 'Database fout bij aanmaken dienst' }, { status: 500 });
      }

      result = inserted;
    }

    if (!result) {
      return NextResponse.json({ error: 'Dienst opgeslagen maar data niet teruggekregen' }, { status: 500 });
    }

    return NextResponse.json(result, { status: id ? 200 : 201 });
  } catch (error) {
    console.error('Services POST error:', error);
    return NextResponse.json({ error: 'Interne serverfout' }, { status: 500 });
  }
}

// DELETE: Verwijder service
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const businessId = searchParams.get('business_id');

    // Validatie
    if (!id || !businessId) {
      return NextResponse.json({ error: 'id en business_id zijn verplicht' }, { status: 400 });
    }

    if (!isValidUUID(id) || !isValidUUID(businessId)) {
      return NextResponse.json({ error: 'Ongeldig id formaat' }, { status: 400 });
    }

    // Autorisatie check
    const auth = await verifyBusinessAccess(request, businessId);
    if (!auth.hasAccess) {
      return auth.error === 'Niet ingelogd' || auth.error === 'Ongeldige sessie'
        ? unauthorizedResponse(auth.error)
        : forbiddenResponse(auth.error || 'Geen toegang');
    }

    const supabase = createAdminClient();

    // Check of service bestaat
    const { data: existing } = await supabase
      .from('services')
      .select('id, name')
      .eq('id', id)
      .eq('business_id', businessId)
      .single();

    if (!existing) {
      return NextResponse.json({ error: 'Dienst niet gevonden' }, { status: 404 });
    }

    const { error } = await supabase
      .from('services')
      .delete()
      .eq('id', id)
      .eq('business_id', businessId);

    if (error) {
      console.error('Service delete DB error:', error);
      return NextResponse.json({ error: 'Database fout bij verwijderen dienst' }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      message: `Dienst "${existing.name}" verwijderd` 
    });
  } catch (error) {
    console.error('Services DELETE error:', error);
    return NextResponse.json({ error: 'Interne serverfout' }, { status: 500 });
  }
}
