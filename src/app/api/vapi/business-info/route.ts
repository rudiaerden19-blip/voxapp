import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const getSupabase = () => createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

const DAY_NAMES: Record<string, string> = {
  monday: 'maandag', tuesday: 'dinsdag', wednesday: 'woensdag',
  thursday: 'donderdag', friday: 'vrijdag', saturday: 'zaterdag', sunday: 'zondag',
};

const JS_DAY_TO_KEY: Record<number, string> = {
  0: 'sunday', 1: 'monday', 2: 'tuesday', 3: 'wednesday',
  4: 'thursday', 5: 'friday', 6: 'saturday',
};

function isCurrentlyOpen(openingHours: Record<string, { open: string; close: string; closed: boolean }> | null): {
  open: boolean;
  message: string;
  todayHours: string;
} {
  if (!openingHours) return { open: true, message: 'Openingsuren niet geconfigureerd.', todayHours: 'onbekend' };

  const now = new Date();
  const dayKey = JS_DAY_TO_KEY[now.getDay()];
  const todaySchedule = openingHours[dayKey];

  if (!todaySchedule || todaySchedule.closed) {
    // Find next open day
    for (let i = 1; i <= 7; i++) {
      const nextDayKey = JS_DAY_TO_KEY[(now.getDay() + i) % 7];
      const nextSchedule = openingHours[nextDayKey];
      if (nextSchedule && !nextSchedule.closed) {
        return {
          open: false,
          message: `Gesloten vandaag. Volgende openingsdag: ${DAY_NAMES[nextDayKey]} ${nextSchedule.open}–${nextSchedule.close}.`,
          todayHours: 'gesloten',
        };
      }
    }
    return { open: false, message: 'Momenteel gesloten.', todayHours: 'gesloten' };
  }

  const [openH, openM] = todaySchedule.open.split(':').map(Number);
  const [closeH, closeM] = todaySchedule.close.split(':').map(Number);
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const openMinutes = openH * 60 + openM;
  const closeMinutes = closeH * 60 + closeM;
  const todayHours = `${todaySchedule.open}–${todaySchedule.close}`;

  if (currentMinutes < openMinutes) {
    return { open: false, message: `Nog niet open. Vandaag open vanaf ${todaySchedule.open}.`, todayHours };
  }
  if (currentMinutes >= closeMinutes) {
    return { open: false, message: `Gesloten. Vandaag was het laatste uur ${todaySchedule.close}.`, todayHours };
  }
  return { open: true, message: `Open. Vandaag open tot ${todaySchedule.close}.`, todayHours };
}

function formatOpeningHours(openingHours: Record<string, { open: string; close: string; closed: boolean }> | null): string {
  if (!openingHours) return 'Niet geconfigureerd';
  const lines: string[] = [];
  const order = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
  for (const day of order) {
    const h = openingHours[day];
    if (!h) continue;
    lines.push(h.closed ? `${DAY_NAMES[day]}: gesloten` : `${DAY_NAMES[day]}: ${h.open}–${h.close}`);
  }
  return lines.join(', ');
}

async function handleRequest(businessId: string) {
  try {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('businesses')
      .select('name, type, phone, opening_hours, delivery_fee, minimum_order, delivery_config')
      .eq('id', businessId)
      .single();

    if (error || !data) {
      return NextResponse.json({ error: 'Business niet gevonden' }, { status: 404 });
    }

    const deliveryConfig = data.delivery_config as Record<string, unknown> | null;
    const deliveryEnabled: boolean = deliveryConfig?.delivery_enabled !== false;
    const deliveryFee: number = typeof deliveryConfig?.delivery_fee === 'number'
      ? deliveryConfig.delivery_fee
      : typeof data.delivery_fee === 'number' ? data.delivery_fee : 0;
    const minimumOrder: number = typeof deliveryConfig?.minimum_order === 'number'
      ? deliveryConfig.minimum_order
      : typeof data.minimum_order === 'number' ? data.minimum_order : 0;

    const openingHours = data.opening_hours as Record<string, { open: string; close: string; closed: boolean }> | null;
    const status = isCurrentlyOpen(openingHours);

    return NextResponse.json({
      business_name: data.name,
      currently_open: status.open,
      open_status_message: status.message,
      today_hours: status.todayHours,
      all_opening_hours: formatOpeningHours(openingHours),
      delivery_enabled: deliveryEnabled,
      delivery_fee_eur: deliveryFee,
      minimum_order_eur: minimumOrder,
      delivery_summary: deliveryEnabled
        ? `Levering mogelijk. Bezorgkost: €${deliveryFee.toFixed(2)}${minimumOrder > 0 ? `, minimum bestelling: €${minimumOrder.toFixed(2)}` : ''}.`
        : 'Enkel afhalen mogelijk, geen levering.',
    });
  } catch (err) {
    console.error('[vapi/business-info]', err);
    return NextResponse.json({ error: 'Serverfout' }, { status: 500 });
  }
}

// GET ?business_id=xxx (directe aanroep of test)
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const businessId = searchParams.get('business_id') ?? '0267c0ae-c997-421a-a259-e7559840897b';
  return handleRequest(businessId);
}

// POST { business_id: "xxx" } — VAPI tool call
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const businessId = body.business_id ?? '0267c0ae-c997-421a-a259-e7559840897b';
    return handleRequest(businessId);
  } catch {
    return NextResponse.json({ error: 'Ongeldige request' }, { status: 400 });
  }
}
