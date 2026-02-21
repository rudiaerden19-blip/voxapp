import { NextRequest, NextResponse } from 'next/server';
import { 
  createAdminClient, 
  verifyAdmin, 
  verifyAdminCookie,
  unauthorizedResponse,
  forbiddenResponse,
  isValidUUID,
  isValidEmail,
  isValidPhone,
  sanitizeString
} from '@/lib/adminAuth';

// Toegestane business types
const VALID_BUSINESS_TYPES = [
  'restaurant', 'frituur', 'pizzeria', 'kebab', 'snackbar', 'bakker', 'slager', 'traiteur',
  'kapper', 'schoonheidssalon', 'nagelsalon', 'spa', 'massagesalon',
  'dokter', 'tandarts', 'ziekenhuis', 'opticien', 'dierenkliniek',
  'advocaat', 'boekhouder', 'loodgieter', 'elektricien', 'aannemer',
  'other'
];

// Toegestane subscription plans
const VALID_PLANS = ['starter', 'professional', 'enterprise'];

// Toegestane subscription statuses
const VALID_STATUSES = ['trial', 'active', 'cancelled', 'past_due'];

// Whitelist van velden die mogen worden bijgewerkt
const ALLOWED_UPDATE_FIELDS = [
  'name', 'email', 'phone', 'type', 'description', 'website',
  'street', 'city', 'postal_code', 'country',
  'subscription_plan', 'subscription_status',
  'voice_id', 'welcome_message', 'opening_hours'
];

// GET - Haal alle tenants op (requires admin cookie)
export async function GET(request: NextRequest) {
  try {
    // Verify admin session
    const { isAdmin, error: authError } = verifyAdminCookie(request);
    if (!isAdmin) {
      return unauthorizedResponse(authError || 'Geen toegang');
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (id && !isValidUUID(id)) {
      return NextResponse.json({ error: 'Ongeldig tenant ID formaat' }, { status: 400 });
    }
    
    const supabase = createAdminClient();

    let query = supabase.from('businesses').select('*');
    
    if (id) {
      query = query.eq('id', id);
    } else {
      query = query.order('created_at', { ascending: false });
    }

    const { data, error } = await query;

    if (error) {
      console.error('Get tenants DB error:', error);
      return NextResponse.json({ error: 'Database fout bij ophalen tenants' }, { status: 500 });
    }

    return NextResponse.json(data || [], {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate',
        'Pragma': 'no-cache',
      },
    });
  } catch (error) {
    console.error('Tenants GET error:', error);
    return NextResponse.json({ error: 'Interne serverfout' }, { status: 500 });
  }
}

// POST - Maak nieuwe tenant (alleen admin)
export async function POST(request: NextRequest) {
  try {
    // Verify admin session
    const { isAdmin, error: authError } = verifyAdminCookie(request);
    if (!isAdmin) {
      return unauthorizedResponse(authError || 'Geen toegang');
    }

    // Parse body
    let body;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: 'Ongeldige JSON data' }, { status: 400 });
    }

    const { name, email, phone, type, plan } = body;

    // Validatie
    const sanitizedName = sanitizeString(name, 200);
    if (!sanitizedName || sanitizedName.length < 2) {
      return NextResponse.json({ error: 'Bedrijfsnaam is verplicht (minimaal 2 karakters)' }, { status: 400 });
    }

    if (email && !isValidEmail(email)) {
      return NextResponse.json({ error: 'Ongeldig email formaat' }, { status: 400 });
    }

    if (phone && !isValidPhone(phone)) {
      return NextResponse.json({ error: 'Ongeldig telefoonnummer formaat' }, { status: 400 });
    }

    const businessType = type && VALID_BUSINESS_TYPES.includes(type) ? type : 'other';
    const subscriptionPlan = plan && VALID_PLANS.includes(plan) ? plan : 'starter';

    const supabase = createAdminClient();

    // Trial eindigt over 7 dagen
    const trialEndsAt = new Date();
    trialEndsAt.setDate(trialEndsAt.getDate() + 7);

    const { data, error } = await supabase.from('businesses').insert({
      name: sanitizedName,
      email: email ? sanitizeString(email, 255) : null,
      phone: phone ? sanitizeString(phone, 20) : null,
      type: businessType,
      subscription_plan: subscriptionPlan,
      subscription_status: 'trial',
      trial_ends_at: trialEndsAt.toISOString(),
      user_id: null,
    }).select().single();

    if (error) {
      console.error('Create tenant DB error:', error);
      return NextResponse.json({ error: 'Database fout bij aanmaken tenant' }, { status: 500 });
    }

    if (!data) {
      return NextResponse.json({ error: 'Tenant aangemaakt maar data niet teruggekregen' }, { status: 500 });
    }

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error('Tenants POST error:', error);
    return NextResponse.json({ error: 'Interne serverfout' }, { status: 500 });
  }
}

// PUT - Update tenant (alleen admin)
export async function PUT(request: NextRequest) {
  try {
    // Verify admin session
    const { isAdmin, error: authError } = verifyAdminCookie(request);
    if (!isAdmin) {
      return unauthorizedResponse(authError || 'Geen toegang');
    }

    // Parse body
    let body;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: 'Ongeldige JSON data' }, { status: 400 });
    }

    const { id, ...updates } = body;

    // Validatie
    if (!id) {
      return NextResponse.json({ error: 'Tenant ID is verplicht' }, { status: 400 });
    }
    
    if (!isValidUUID(id)) {
      return NextResponse.json({ error: 'Ongeldig tenant ID formaat' }, { status: 400 });
    }

    // Filter updates naar alleen toegestane velden (voorkom mass assignment)
    const safeUpdates: Record<string, unknown> = {};
    
    for (const [key, value] of Object.entries(updates)) {
      if (!ALLOWED_UPDATE_FIELDS.includes(key)) {
        continue; // Skip niet-toegestane velden
      }

      // Valideer specifieke velden
      if (key === 'name') {
        const sanitized = sanitizeString(value as string, 200);
        if (sanitized && sanitized.length >= 2) {
          safeUpdates.name = sanitized;
        }
      } else if (key === 'email') {
        if (!value) {
          safeUpdates.email = null;
        } else if (isValidEmail(value as string)) {
          safeUpdates.email = sanitizeString(value as string, 255);
        }
      } else if (key === 'phone') {
        if (!value) {
          safeUpdates.phone = null;
        } else if (isValidPhone(value as string)) {
          safeUpdates.phone = sanitizeString(value as string, 20);
        }
      } else if (key === 'type') {
        if (VALID_BUSINESS_TYPES.includes(value as string)) {
          safeUpdates.type = value;
        }
      } else if (key === 'subscription_plan') {
        if (VALID_PLANS.includes(value as string)) {
          safeUpdates.subscription_plan = value;
        }
      } else if (key === 'subscription_status') {
        if (VALID_STATUSES.includes(value as string)) {
          safeUpdates.subscription_status = value;
        }
      } else if (key === 'opening_hours') {
        // Valideer structuur van opening_hours
        if (typeof value === 'object' && value !== null) {
          safeUpdates.opening_hours = value;
        }
      } else {
        // Andere toegestane velden - sanitize strings
        if (typeof value === 'string') {
          safeUpdates[key] = sanitizeString(value, 500);
        } else if (value === null || typeof value === 'boolean' || typeof value === 'number') {
          safeUpdates[key] = value;
        }
      }
    }

    if (Object.keys(safeUpdates).length === 0) {
      return NextResponse.json({ error: 'Geen geldige updates opgegeven' }, { status: 400 });
    }

    // Voeg updated_at toe
    safeUpdates.updated_at = new Date().toISOString();

    const supabase = createAdminClient();

    const { data, error } = await supabase
      .from('businesses')
      .update(safeUpdates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Update tenant DB error:', error);
      return NextResponse.json({ error: 'Database fout bij bijwerken tenant' }, { status: 500 });
    }

    if (!data) {
      return NextResponse.json({ error: 'Tenant niet gevonden' }, { status: 404 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Tenants PUT error:', error);
    return NextResponse.json({ error: 'Interne serverfout' }, { status: 500 });
  }
}

// DELETE - Verwijder tenant (alleen admin)
export async function DELETE(request: NextRequest) {
  try {
    // Verify admin session
    const { isAdmin, error: authError } = verifyAdminCookie(request);
    if (!isAdmin) {
      return unauthorizedResponse(authError || 'Geen toegang');
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    // Validatie
    if (!id) {
      return NextResponse.json({ error: 'Tenant ID is verplicht' }, { status: 400 });
    }
    
    if (!isValidUUID(id)) {
      return NextResponse.json({ error: 'Ongeldig tenant ID formaat' }, { status: 400 });
    }

    const supabase = createAdminClient();

    // Check of tenant bestaat en haal user_id + email op
    const { data: existing } = await supabase
      .from('businesses')
      .select('id, name, user_id, email')
      .eq('id', id)
      .single();

    if (!existing) {
      return NextResponse.json({ error: 'Tenant niet gevonden' }, { status: 404 });
    }

    // Bescherm eigenaar account - mag nooit verwijderd worden
    const PROTECTED_EMAILS = ['rudiaerden19@gmail.com'];
    if (existing.email && PROTECTED_EMAILS.includes(existing.email.toLowerCase())) {
      return NextResponse.json({ error: 'Deze account is beschermd en kan niet verwijderd worden' }, { status: 403 });
    }

    // 1. Verwijder business record
    const { error } = await supabase
      .from('businesses')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Delete tenant DB error:', error);
      return NextResponse.json({ error: 'Database fout bij verwijderen tenant' }, { status: 500 });
    }

    // 2. Verwijder ook de auth user
    if (existing.user_id) {
      const { error: authError } = await supabase.auth.admin.deleteUser(existing.user_id);
      if (authError) {
        console.error('Delete auth user error:', authError);
        // Business is al verwijderd, dus we geven een waarschuwing
      }
    }

    return NextResponse.json({ success: true, message: `Tenant "${existing.name}" en gebruiker verwijderd` });
  } catch (error) {
    console.error('Tenants DELETE error:', error);
    return NextResponse.json({ error: 'Interne serverfout' }, { status: 500 });
  }
}
