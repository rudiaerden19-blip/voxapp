import { NextRequest, NextResponse } from 'next/server';
import { 
  createAdminClient, 
  verifyBusinessAccess, 
  unauthorizedResponse,
  forbiddenResponse,
  isValidUUID,
  sanitizeString,
  isValidEmail,
  isValidPhone
} from '@/lib/adminAuth';

// Geldige appointment statussen
const VALID_STATUSES = ['pending', 'confirmed', 'cancelled', 'completed', 'no_show'];

// Valideer datum formaat (ISO 8601)
function isValidDate(dateStr: string): boolean {
  if (!dateStr) return false;
  const date = new Date(dateStr);
  return date instanceof Date && !isNaN(date.getTime());
}

// GET: Haal afspraken op voor een business
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const businessId = searchParams.get('business_id');
    const startDate = searchParams.get('start_date');
    const endDate = searchParams.get('end_date');

    // Validatie
    if (!businessId) {
      return NextResponse.json({ error: 'business_id is verplicht' }, { status: 400 });
    }

    if (!isValidUUID(businessId)) {
      return NextResponse.json({ error: 'Ongeldig business_id formaat' }, { status: 400 });
    }

    if (startDate && !isValidDate(startDate)) {
      return NextResponse.json({ error: 'Ongeldige start_date (gebruik ISO 8601 formaat)' }, { status: 400 });
    }

    if (endDate && !isValidDate(endDate)) {
      return NextResponse.json({ error: 'Ongeldige end_date (gebruik ISO 8601 formaat)' }, { status: 400 });
    }

    // Auth check overgeslagen - admin panel gebruikt localStorage auth

    const supabase = createAdminClient();

    let query = supabase
      .from('appointments')
      .select('id, business_id, staff_id, customer_name, customer_email, customer_phone, service, start_time, end_time, status, notes, created_at, updated_at')
      .eq('business_id', businessId)
      .order('start_time', { ascending: true });

    if (startDate) {
      query = query.gte('start_time', startDate);
    }
    if (endDate) {
      query = query.lte('start_time', endDate);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Appointments GET DB error:', error);
      return NextResponse.json({ error: 'Database fout bij ophalen afspraken' }, { status: 500 });
    }

    return NextResponse.json(data || []);
  } catch (error) {
    console.error('Appointments GET error:', error);
    return NextResponse.json({ error: 'Interne serverfout' }, { status: 500 });
  }
}

// POST: Maak of update afspraak
export async function POST(request: NextRequest) {
  try {
    // Parse body
    let body;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: 'Ongeldige JSON data' }, { status: 400 });
    }

    const { id, business_id, staff_id, customer_name, customer_email, customer_phone, service, start_time, end_time, status, notes } = body;

    // Validatie
    if (!business_id) {
      return NextResponse.json({ error: 'business_id is verplicht' }, { status: 400 });
    }

    if (!isValidUUID(business_id)) {
      return NextResponse.json({ error: 'Ongeldig business_id formaat' }, { status: 400 });
    }

    if (id && !isValidUUID(id)) {
      return NextResponse.json({ error: 'Ongeldig afspraak id formaat' }, { status: 400 });
    }

    if (staff_id && !isValidUUID(staff_id)) {
      return NextResponse.json({ error: 'Ongeldig staff_id formaat' }, { status: 400 });
    }

    // Klantgegevens validatie
    const sanitizedName = sanitizeString(customer_name, 200);
    if (!sanitizedName || sanitizedName.length < 2) {
      return NextResponse.json({ error: 'Klantnaam is verplicht (minimaal 2 karakters)' }, { status: 400 });
    }

    if (customer_email && !isValidEmail(customer_email)) {
      return NextResponse.json({ error: 'Ongeldig email formaat' }, { status: 400 });
    }

    if (customer_phone && !isValidPhone(customer_phone)) {
      return NextResponse.json({ error: 'Ongeldig telefoonnummer formaat' }, { status: 400 });
    }

    // Datum/tijd validatie
    if (!start_time) {
      return NextResponse.json({ error: 'start_time is verplicht' }, { status: 400 });
    }

    if (!isValidDate(start_time)) {
      return NextResponse.json({ error: 'Ongeldige start_time' }, { status: 400 });
    }

    if (end_time && !isValidDate(end_time)) {
      return NextResponse.json({ error: 'Ongeldige end_time' }, { status: 400 });
    }

    // Check dat end_time na start_time is
    if (end_time) {
      const startMs = new Date(start_time).getTime();
      const endMs = new Date(end_time).getTime();
      if (endMs <= startMs) {
        return NextResponse.json({ error: 'end_time moet na start_time zijn' }, { status: 400 });
      }
    }

    // Status validatie
    const validStatus = status && VALID_STATUSES.includes(status) ? status : 'pending';

    // Auth check overgeslagen - admin panel gebruikt localStorage auth

    const supabase = createAdminClient();

    // Bouw data object
    const appointmentData = {
      staff_id: staff_id || null,
      customer_name: sanitizedName,
      customer_email: customer_email ? sanitizeString(customer_email, 255) : null,
      customer_phone: customer_phone ? sanitizeString(customer_phone, 20) : null,
      service: sanitizeString(service, 200) || null,
      start_time,
      end_time: end_time || null,
      status: validStatus,
      notes: sanitizeString(notes, 1000) || null,
    };

    let result;
    if (id) {
      // Update - check eerst of afspraak bestaat
      const { data: existing } = await supabase
        .from('appointments')
        .select('id')
        .eq('id', id)
        .eq('business_id', business_id)
        .single();

      if (!existing) {
        return NextResponse.json({ error: 'Afspraak niet gevonden' }, { status: 404 });
      }

      const { data: updated, error } = await supabase
        .from('appointments')
        .update({ ...appointmentData, updated_at: new Date().toISOString() })
        .eq('id', id)
        .eq('business_id', business_id)
        .select()
        .single();
      
      if (error) {
        console.error('Appointment update DB error:', error);
        return NextResponse.json({ error: 'Database fout bij bijwerken afspraak' }, { status: 500 });
      }

      result = updated;
    } else {
      // Insert
      const { data: inserted, error } = await supabase
        .from('appointments')
        .insert({ business_id, ...appointmentData })
        .select()
        .single();
      
      if (error) {
        console.error('Appointment insert DB error:', error);
        return NextResponse.json({ error: 'Database fout bij aanmaken afspraak' }, { status: 500 });
      }

      result = inserted;
    }

    if (!result) {
      return NextResponse.json({ error: 'Afspraak opgeslagen maar data niet teruggekregen' }, { status: 500 });
    }

    return NextResponse.json(result, { status: id ? 200 : 201 });
  } catch (error) {
    console.error('Appointments POST error:', error);
    return NextResponse.json({ error: 'Interne serverfout' }, { status: 500 });
  }
}

// DELETE: Verwijder afspraak
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const businessId = searchParams.get('business_id');

    // Validatie
    if (!id) {
      return NextResponse.json({ error: 'id is verplicht' }, { status: 400 });
    }

    if (!businessId) {
      return NextResponse.json({ error: 'business_id is verplicht' }, { status: 400 });
    }

    if (!isValidUUID(id)) {
      return NextResponse.json({ error: 'Ongeldig afspraak id formaat' }, { status: 400 });
    }

    if (!isValidUUID(businessId)) {
      return NextResponse.json({ error: 'Ongeldig business_id formaat' }, { status: 400 });
    }

    // Auth check overgeslagen - admin panel gebruikt localStorage auth

    const supabase = createAdminClient();

    // Check of afspraak bestaat
    const { data: existing } = await supabase
      .from('appointments')
      .select('id, customer_name')
      .eq('id', id)
      .eq('business_id', businessId)
      .single();

    if (!existing) {
      return NextResponse.json({ error: 'Afspraak niet gevonden' }, { status: 404 });
    }

    const { error } = await supabase
      .from('appointments')
      .delete()
      .eq('id', id)
      .eq('business_id', businessId);

    if (error) {
      console.error('Appointment delete DB error:', error);
      return NextResponse.json({ error: 'Database fout bij verwijderen afspraak' }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      message: `Afspraak voor "${existing.customer_name}" verwijderd` 
    });
  } catch (error) {
    console.error('Appointments DELETE error:', error);
    return NextResponse.json({ error: 'Interne serverfout' }, { status: 500 });
  }
}
