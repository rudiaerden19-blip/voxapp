import { NextRequest, NextResponse } from 'next/server';
import { 
  createAdminClient, 
  verifyBusinessAccess, 
  unauthorizedResponse,
  forbiddenResponse,
  isValidUUID,
  isValidEmail,
  isValidPhone,
  sanitizeString
} from '@/lib/adminAuth';

// GET - Haal medewerkers op
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
      .from('staff')
      .select('id, name, email, phone, working_hours, is_active, created_at, updated_at')
      .eq('business_id', businessId)
      .order('name');

    if (!all) {
      query = query.eq('is_active', true);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Staff GET DB error:', error);
      return NextResponse.json({ error: 'Database fout bij ophalen medewerkers' }, { status: 500 });
    }

    return NextResponse.json(data || []);
  } catch (error) {
    console.error('Staff GET error:', error);
    return NextResponse.json({ error: 'Interne serverfout' }, { status: 500 });
  }
}

// POST - Maak nieuwe medewerker
export async function POST(request: NextRequest) {
  try {
    // Parse body met error handling
    let body;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: 'Ongeldige JSON data' }, { status: 400 });
    }

    const { business_id, name, email, phone, working_hours, is_active } = body;

    // Validatie
    if (!business_id) {
      return NextResponse.json({ error: 'business_id is verplicht' }, { status: 400 });
    }
    
    if (!isValidUUID(business_id)) {
      return NextResponse.json({ error: 'Ongeldig business_id formaat' }, { status: 400 });
    }

    const sanitizedName = sanitizeString(name, 100);
    if (!sanitizedName || sanitizedName.length < 2) {
      return NextResponse.json({ error: 'Naam is verplicht (minimaal 2 karakters)' }, { status: 400 });
    }

    if (email && !isValidEmail(email)) {
      return NextResponse.json({ error: 'Ongeldig email formaat' }, { status: 400 });
    }

    if (phone && !isValidPhone(phone)) {
      return NextResponse.json({ error: 'Ongeldig telefoonnummer formaat' }, { status: 400 });
    }

    // Autorisatie check
    const auth = await verifyBusinessAccess(request, business_id);
    if (!auth.hasAccess) {
      return auth.error === 'Niet ingelogd' || auth.error === 'Ongeldige sessie'
        ? unauthorizedResponse(auth.error)
        : forbiddenResponse(auth.error || 'Geen toegang');
    }

    const supabase = createAdminClient();

    const { data, error } = await supabase
      .from('staff')
      .insert({
        business_id,
        name: sanitizedName,
        email: email ? sanitizeString(email, 255) : null,
        phone: phone ? sanitizeString(phone, 20) : null,
        working_hours: working_hours || null,
        is_active: is_active !== false,
      })
      .select('id, name, email, phone, working_hours, is_active, created_at')
      .single();

    if (error) {
      console.error('Staff POST DB error:', error);
      return NextResponse.json({ error: 'Database fout bij aanmaken medewerker' }, { status: 500 });
    }

    if (!data) {
      return NextResponse.json({ error: 'Medewerker aangemaakt maar data niet teruggekregen' }, { status: 500 });
    }

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error('Staff POST error:', error);
    return NextResponse.json({ error: 'Interne serverfout' }, { status: 500 });
  }
}

// PUT - Update medewerker
export async function PUT(request: NextRequest) {
  try {
    // Parse body met error handling
    let body;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: 'Ongeldige JSON data' }, { status: 400 });
    }

    const { id, business_id, name, email, phone, working_hours, is_active } = body;

    // Validatie
    if (!id) {
      return NextResponse.json({ error: 'id is verplicht' }, { status: 400 });
    }
    
    if (!isValidUUID(id)) {
      return NextResponse.json({ error: 'Ongeldig id formaat' }, { status: 400 });
    }

    const sanitizedName = sanitizeString(name, 100);
    if (!sanitizedName || sanitizedName.length < 2) {
      return NextResponse.json({ error: 'Naam is verplicht (minimaal 2 karakters)' }, { status: 400 });
    }

    if (email && !isValidEmail(email)) {
      return NextResponse.json({ error: 'Ongeldig email formaat' }, { status: 400 });
    }

    if (phone && !isValidPhone(phone)) {
      return NextResponse.json({ error: 'Ongeldig telefoonnummer formaat' }, { status: 400 });
    }

    const supabase = createAdminClient();

    // Haal eerst de medewerker op om business_id te krijgen voor auth check
    const { data: existingStaff, error: fetchError } = await supabase
      .from('staff')
      .select('business_id')
      .eq('id', id)
      .single();

    if (fetchError || !existingStaff) {
      return NextResponse.json({ error: 'Medewerker niet gevonden' }, { status: 404 });
    }

    // Autorisatie check
    const auth = await verifyBusinessAccess(request, business_id || existingStaff.business_id);
    if (!auth.hasAccess) {
      return auth.error === 'Niet ingelogd' || auth.error === 'Ongeldige sessie'
        ? unauthorizedResponse(auth.error)
        : forbiddenResponse(auth.error || 'Geen toegang');
    }

    const { data, error } = await supabase
      .from('staff')
      .update({
        name: sanitizedName,
        email: email ? sanitizeString(email, 255) : null,
        phone: phone ? sanitizeString(phone, 20) : null,
        working_hours: working_hours || null,
        is_active: is_active !== false,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select('id, name, email, phone, working_hours, is_active, updated_at')
      .single();

    if (error) {
      console.error('Staff PUT DB error:', error);
      return NextResponse.json({ error: 'Database fout bij bijwerken medewerker' }, { status: 500 });
    }

    if (!data) {
      return NextResponse.json({ error: 'Medewerker niet gevonden' }, { status: 404 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Staff PUT error:', error);
    return NextResponse.json({ error: 'Interne serverfout' }, { status: 500 });
  }
}

// DELETE - Verwijder medewerker
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    // Validatie
    if (!id) {
      return NextResponse.json({ error: 'id is verplicht' }, { status: 400 });
    }
    
    if (!isValidUUID(id)) {
      return NextResponse.json({ error: 'Ongeldig id formaat' }, { status: 400 });
    }

    const supabase = createAdminClient();

    // Haal eerst de medewerker op voor auth check
    const { data: existingStaff, error: fetchError } = await supabase
      .from('staff')
      .select('business_id')
      .eq('id', id)
      .single();

    if (fetchError || !existingStaff) {
      return NextResponse.json({ error: 'Medewerker niet gevonden' }, { status: 404 });
    }

    // Autorisatie check
    const auth = await verifyBusinessAccess(request, existingStaff.business_id);
    if (!auth.hasAccess) {
      return auth.error === 'Niet ingelogd' || auth.error === 'Ongeldige sessie'
        ? unauthorizedResponse(auth.error)
        : forbiddenResponse(auth.error || 'Geen toegang');
    }

    const { error } = await supabase
      .from('staff')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Staff DELETE DB error:', error);
      return NextResponse.json({ error: 'Database fout bij verwijderen medewerker' }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: 'Medewerker verwijderd' });
  } catch (error) {
    console.error('Staff DELETE error:', error);
    return NextResponse.json({ error: 'Interne serverfout' }, { status: 500 });
  }
}
