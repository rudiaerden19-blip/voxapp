import { createClient } from '@supabase/supabase-js';
import { AvailabilityResult, BusinessConfig, ServiceInfo } from './types';

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error('Supabase env vars ontbreken');
  return createClient(url, key);
}

const DAY_NAMES = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];

/**
 * Check of een specifiek tijdstip beschikbaar is.
 * Checkt: openingsuren, conflicten, verleden.
 * Retourneert beschikbaarheid + alternatieven bij conflict.
 */
export async function checkAvailability(
  businessId: string,
  date: string,        // YYYY-MM-DD
  time: string,        // HH:mm
  durationMinutes = 30,
): Promise<AvailabilityResult> {
  const supabase = getSupabase();

  // Haal business op
  const { data: business } = await supabase
    .from('businesses')
    .select('id, name, opening_hours')
    .eq('id', businessId)
    .single();

  if (!business) {
    return { available: false, reason: 'Bedrijf niet gevonden.' };
  }

  // Check openingsuren
  const requestedDate = new Date(`${date}T${time}:00`);
  const dayOfWeek = DAY_NAMES[requestedDate.getDay()];
  const openingHours = business.opening_hours as Record<string, { open: string; close: string; closed: boolean }> | null;

  if (!openingHours || !openingHours[dayOfWeek]) {
    return {
      available: false,
      reason: 'We zijn op die dag gesloten.',
    };
  }

  const dayHours = openingHours[dayOfWeek];
  if (dayHours.closed) {
    return {
      available: false,
      reason: 'We zijn op die dag gesloten.',
      openingHours: { open: dayHours.open, close: dayHours.close },
    };
  }

  // Check of het tijdstip binnen openingsuren valt
  const [openH, openM] = dayHours.open.split(':').map(Number);
  const [closeH, closeM] = dayHours.close.split(':').map(Number);
  const [reqH, reqM] = time.split(':').map(Number);

  const opensAt = openH * 60 + openM;
  const closesAt = closeH * 60 + closeM;
  const startsAt = reqH * 60 + reqM;
  const endsAt = startsAt + durationMinutes;

  if (startsAt < opensAt || endsAt > closesAt) {
    return {
      available: false,
      reason: `Dat valt buiten onze openingsuren. We zijn open van ${dayHours.open} tot ${dayHours.close}.`,
      openingHours: { open: dayHours.open, close: dayHours.close },
    };
  }

  // Check of het in het verleden is
  if (requestedDate < new Date()) {
    return {
      available: false,
      reason: 'Dat tijdstip is al voorbij.',
    };
  }

  // Check conflicten
  const endTime = new Date(requestedDate.getTime() + durationMinutes * 60000);

  const { data: conflicts } = await supabase
    .from('appointments')
    .select('id, start_time, end_time')
    .eq('business_id', businessId)
    .neq('status', 'cancelled')
    .lt('start_time', endTime.toISOString())
    .gt('end_time', requestedDate.toISOString());

  if (conflicts && conflicts.length > 0) {
    // Zoek alternatieven
    const alternatives = await findAlternatives(
      supabase, businessId, date, durationMinutes, opensAt, closesAt, time,
    );

    return {
      available: false,
      reason: 'Dat tijdstip is al bezet.',
      alternatives,
    };
  }

  return { available: true };
}

/**
 * Zoek de 2 dichtstbijzijnde vrije slots rond een gewenst tijdstip.
 */
async function findAlternatives(
  supabase: ReturnType<typeof getSupabase>,
  businessId: string,
  date: string,
  durationMinutes: number,
  opensAt: number,
  closesAt: number,
  requestedTime: string,
): Promise<string[]> {
  const [reqH, reqM] = requestedTime.split(':').map(Number);
  const requestedMinutes = reqH * 60 + reqM;

  // Haal alle afspraken van die dag op
  const startOfDay = new Date(`${date}T00:00:00`);
  const endOfDay = new Date(`${date}T23:59:59`);

  const { data: appointments } = await supabase
    .from('appointments')
    .select('start_time, end_time')
    .eq('business_id', businessId)
    .neq('status', 'cancelled')
    .gte('start_time', startOfDay.toISOString())
    .lte('start_time', endOfDay.toISOString());

  const alternatives: { time: string; distance: number }[] = [];

  // Genereer alle mogelijke slots en check
  for (let mins = opensAt; mins + durationMinutes <= closesAt; mins += 30) {
    const slotStart = new Date(`${date}T${String(Math.floor(mins / 60)).padStart(2, '0')}:${String(mins % 60).padStart(2, '0')}:00`);
    const slotEnd = new Date(slotStart.getTime() + durationMinutes * 60000);

    // Skip slots in het verleden
    if (slotStart < new Date()) continue;

    // Check conflict
    const hasConflict = appointments?.some(apt => {
      const aptStart = new Date(apt.start_time);
      const aptEnd = new Date(apt.end_time);
      return slotStart < aptEnd && slotEnd > aptStart;
    });

    if (!hasConflict) {
      const distance = Math.abs(mins - requestedMinutes);
      const timeStr = `${String(Math.floor(mins / 60)).padStart(2, '0')}:${String(mins % 60).padStart(2, '0')}`;
      alternatives.push({ time: timeStr, distance });
    }
  }

  // Sorteer op afstand tot gewenst tijdstip, neem de 2 dichtstbijzijnde
  alternatives.sort((a, b) => a.distance - b.distance);
  return alternatives.slice(0, 2).map(a => a.time);
}

/**
 * Haal diensten op voor een business.
 */
export async function getServices(businessId: string): Promise<ServiceInfo[]> {
  const supabase = getSupabase();

  const { data } = await supabase
    .from('services')
    .select('id, name, duration_minutes, price')
    .eq('business_id', businessId)
    .eq('is_active', true)
    .order('name');

  return (data || []).map(s => ({
    id: s.id,
    name: s.name,
    duration_minutes: s.duration_minutes,
    price: s.price,
  }));
}

/**
 * Fuzzy match een dienst-naam tegen de beschikbare diensten.
 * Retourneert de beste match of null.
 */
export function matchService(input: string, services: ServiceInfo[]): ServiceInfo | null {
  const lower = input.toLowerCase().trim();

  // Exacte match
  const exact = services.find(s => s.name.toLowerCase() === lower);
  if (exact) return exact;

  // Bevat match
  const contains = services.find(s =>
    lower.includes(s.name.toLowerCase()) || s.name.toLowerCase().includes(lower)
  );
  if (contains) return contains;

  // Eerste-woord match
  const firstWord = lower.split(/\s+/)[0];
  if (firstWord.length >= 3) {
    const partial = services.find(s =>
      s.name.toLowerCase().startsWith(firstWord) || firstWord.startsWith(s.name.toLowerCase().split(/\s+/)[0])
    );
    if (partial) return partial;
  }

  return null;
}

/**
 * Haal business config op via assistant ID.
 */
export async function getBusinessByAssistantId(assistantId: string): Promise<BusinessConfig | null> {
  const supabase = getSupabase();

  const { data } = await supabase
    .from('businesses')
    .select('id, name, type, opening_hours')
    .eq('vapi_assistant_id', assistantId)
    .single();

  if (!data) {
    // Probeer ook op elevenlabs_agent_id of agent_id
    const { data: byAgent } = await supabase
      .from('businesses')
      .select('id, name, type, opening_hours')
      .eq('elevenlabs_agent_id', assistantId)
      .single();

    if (!byAgent) return null;
    return byAgent as BusinessConfig;
  }

  return data as BusinessConfig;
}
