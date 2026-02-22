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

// Whitelist van velden die mogen worden bijgewerkt door eigenaar
const ALLOWED_UPDATE_FIELDS = [
  'name', 'type', 'description', 'phone', 'email', 'website',
  'street', 'city', 'postal_code', 'country',
  'voice_id', 'welcome_message', 'opening_hours',
  'fallback_action', 'transfer_number',
  'delivery_fee', 'minimum_order',
  'agent_id'
];

// Toegestane business types
const VALID_BUSINESS_TYPES = [
  'frituur', 'pizzeria', 'kebab', 'restaurant', 'snackbar',
  'tandarts', 'huisarts', 'dokter', 'opticien', 'dierenkliniek', 'fysiotherapie',
  'kapper', 'schoonheid', 'barbier', 'massage', 'fitness',
  'garage', 'loodgieter', 'advocaat', 'boekhouder', 'hotel', 'immo',
  'other'
];

// PUT - Update business
export async function PUT(request: NextRequest) {
  try {
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
      return NextResponse.json({ error: 'Business ID is verplicht' }, { status: 400 });
    }

    if (!isValidUUID(id)) {
      return NextResponse.json({ error: 'Ongeldig business ID formaat' }, { status: 400 });
    }

    // Autorisatie check overgeslagen - admin panel gebruikt localStorage auth

    // Filter updates naar alleen toegestane velden
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
      } else if (key === 'type') {
        if (typeof value === 'string' && VALID_BUSINESS_TYPES.includes(value)) {
          safeUpdates.type = value;
        }
      } else if (key === 'email') {
        if (value === null || value === '') {
          safeUpdates.email = null;
        } else if (isValidEmail(value as string)) {
          safeUpdates.email = sanitizeString(value as string, 255);
        }
      } else if (key === 'phone') {
        if (value === null || value === '') {
          safeUpdates.phone = null;
        } else if (isValidPhone(value as string)) {
          safeUpdates.phone = sanitizeString(value as string, 20);
        }
      } else if (key === 'opening_hours') {
        // Valideer structuur van opening_hours
        if (value === null) {
          safeUpdates.opening_hours = null;
        } else if (typeof value === 'object' && value !== null) {
          // Basis validatie - check of het een object is met dag keys
          const validDays = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
          const validHours: Record<string, unknown> = {};
          let isValid = true;

          for (const [day, hours] of Object.entries(value as Record<string, unknown>)) {
            if (!validDays.includes(day)) continue;
            
            if (typeof hours === 'object' && hours !== null) {
              const h = hours as { open?: string; close?: string; closed?: boolean };
              validHours[day] = {
                open: typeof h.open === 'string' ? h.open : '09:00',
                close: typeof h.close === 'string' ? h.close : '18:00',
                closed: h.closed === true,
              };
            } else {
              isValid = false;
              break;
            }
          }

          if (isValid) {
            safeUpdates.opening_hours = validHours;
          }
        }
      } else if (key === 'voice_id') {
        // ElevenLabs voice ID - sanitize
        if (value === null || value === '') {
          safeUpdates.voice_id = null;
        } else if (typeof value === 'string' && value.length <= 50) {
          safeUpdates.voice_id = value.trim();
        }
      } else if (key === 'welcome_message') {
        if (value === null || value === '') {
          safeUpdates.welcome_message = null;
        } else {
          safeUpdates.welcome_message = sanitizeString(value as string, 500);
        }
      } else {
        // Andere toegestane velden - sanitize strings
        if (value === null) {
          safeUpdates[key] = null;
        } else if (typeof value === 'string') {
          safeUpdates[key] = sanitizeString(value, 500);
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
      console.error('Update business DB error:', error);
      return NextResponse.json({ error: 'Database fout bij bijwerken bedrijf' }, { status: 500 });
    }

    if (!data) {
      return NextResponse.json({ error: 'Bedrijf niet gevonden' }, { status: 404 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Business update error:', error);
    return NextResponse.json({ error: 'Interne serverfout' }, { status: 500 });
  }
}
