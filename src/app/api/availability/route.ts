import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

// Create Supabase client with service role for API access
const getSupabase = () => createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface OpeningHours {
  open: string;
  close: string;
  closed: boolean;
}

interface TimeSlot {
  start: string;
  end: string;
  available: boolean;
}

// Map day index (0=Sunday) to English day name
const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];

/**
 * GET /api/availability
 * 
 * Query params:
 * - business_id: UUID of the business
 * - date: Date in YYYY-MM-DD format
 * - duration: Duration in minutes (optional, default 30)
 * 
 * Returns:
 * - is_open: boolean - whether business is open on this day
 * - opening_hours: { open, close } - opening hours for this day
 * - slots: Array of available time slots
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabase();
    const { searchParams } = new URL(request.url);
    const businessId = searchParams.get('business_id');
    const dateStr = searchParams.get('date');
    const duration = parseInt(searchParams.get('duration') || '30');

    // Validate required params
    if (!businessId) {
      return NextResponse.json({ error: 'business_id is required' }, { status: 400 });
    }
    if (!dateStr) {
      return NextResponse.json({ error: 'date is required (YYYY-MM-DD)' }, { status: 400 });
    }

    // Parse date
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) {
      return NextResponse.json({ error: 'Invalid date format' }, { status: 400 });
    }

    // Get business with opening hours
    const { data: business, error: bizError } = await supabase
      .from('businesses')
      .select('id, name, opening_hours')
      .eq('id', businessId)
      .single();

    if (bizError || !business) {
      return NextResponse.json({ error: 'Business not found' }, { status: 404 });
    }

    // Get day of week
    const dayOfWeek = dayNames[date.getDay()];
    const openingHours = business.opening_hours as Record<string, OpeningHours> | null;
    
    // Check if business has opening hours configured
    if (!openingHours || !openingHours[dayOfWeek]) {
      return NextResponse.json({
        business_id: businessId,
        business_name: business.name,
        date: dateStr,
        day: dayOfWeek,
        is_open: false,
        message: 'Geen openingsuren geconfigureerd voor deze dag',
        slots: [],
      });
    }

    const dayHours = openingHours[dayOfWeek];

    // Check if closed
    if (dayHours.closed) {
      return NextResponse.json({
        business_id: businessId,
        business_name: business.name,
        date: dateStr,
        day: dayOfWeek,
        is_open: false,
        message: 'Gesloten op deze dag',
        opening_hours: null,
        slots: [],
      });
    }

    // Get existing appointments for this day
    const startOfDay = new Date(dateStr);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(dateStr);
    endOfDay.setHours(23, 59, 59, 999);

    const { data: appointments } = await supabase
      .from('appointments')
      .select('start_time, end_time')
      .eq('business_id', businessId)
      .gte('start_time', startOfDay.toISOString())
      .lte('start_time', endOfDay.toISOString())
      .in('status', ['scheduled', 'confirmed']);

    // Generate available slots
    const slots: TimeSlot[] = [];
    const [openHour, openMinute] = dayHours.open.split(':').map(Number);
    const [closeHour, closeMinute] = dayHours.close.split(':').map(Number);

    // Create slot times
    let currentTime = new Date(dateStr);
    currentTime.setHours(openHour, openMinute, 0, 0);

    const closingTime = new Date(dateStr);
    closingTime.setHours(closeHour, closeMinute, 0, 0);

    const now = new Date();

    while (currentTime < closingTime) {
      const slotEnd = new Date(currentTime.getTime() + duration * 60000);
      
      // Don't go past closing time
      if (slotEnd > closingTime) break;

      // Check if slot is in the past
      const isPast = currentTime < now;

      // Check if slot conflicts with existing appointments
      const hasConflict = appointments?.some(apt => {
        const aptStart = new Date(apt.start_time);
        const aptEnd = new Date(apt.end_time);
        return (currentTime < aptEnd && slotEnd > aptStart);
      });

      slots.push({
        start: currentTime.toTimeString().slice(0, 5), // HH:MM format
        end: slotEnd.toTimeString().slice(0, 5),
        available: !isPast && !hasConflict,
      });

      // Move to next slot
      currentTime = new Date(currentTime.getTime() + duration * 60000);
    }

    return NextResponse.json({
      business_id: businessId,
      business_name: business.name,
      date: dateStr,
      day: dayOfWeek,
      is_open: true,
      opening_hours: {
        open: dayHours.open,
        close: dayHours.close,
      },
      duration_minutes: duration,
      slots: slots,
      available_count: slots.filter(s => s.available).length,
    });

  } catch (error) {
    console.error('Availability API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/availability/check
 * 
 * Quick check if a specific time is available
 * Body: { business_id, datetime, duration }
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabase();
    const body = await request.json();
    const { business_id, datetime, duration = 30 } = body;

    if (!business_id || !datetime) {
      return NextResponse.json(
        { error: 'business_id and datetime are required' },
        { status: 400 }
      );
    }

    const requestedTime = new Date(datetime);
    if (isNaN(requestedTime.getTime())) {
      return NextResponse.json({ error: 'Invalid datetime format' }, { status: 400 });
    }

    // Get business
    const { data: business, error: bizError } = await supabase
      .from('businesses')
      .select('id, name, opening_hours')
      .eq('id', business_id)
      .single();

    if (bizError || !business) {
      return NextResponse.json({ error: 'Business not found' }, { status: 404 });
    }

    const dayOfWeek = dayNames[requestedTime.getDay()];
    const openingHours = business.opening_hours as Record<string, OpeningHours> | null;

    // Check opening hours
    if (!openingHours || !openingHours[dayOfWeek] || openingHours[dayOfWeek].closed) {
      return NextResponse.json({
        available: false,
        reason: 'Gesloten op deze dag',
        business_name: business.name,
      });
    }

    const dayHours = openingHours[dayOfWeek];
    const [openHour, openMin] = dayHours.open.split(':').map(Number);
    const [closeHour, closeMin] = dayHours.close.split(':').map(Number);

    const requestedHour = requestedTime.getHours();
    const requestedMin = requestedTime.getMinutes();
    const endTime = new Date(requestedTime.getTime() + duration * 60000);
    const endHour = endTime.getHours();
    const endMin = endTime.getMinutes();

    // Check if within opening hours
    const opensAt = openHour * 60 + openMin;
    const closesAt = closeHour * 60 + closeMin;
    const startsAt = requestedHour * 60 + requestedMin;
    const endsAt = endHour * 60 + endMin;

    if (startsAt < opensAt || endsAt > closesAt) {
      return NextResponse.json({
        available: false,
        reason: `Buiten openingsuren (${dayHours.open} - ${dayHours.close})`,
        business_name: business.name,
      });
    }

    // Check if in the past
    if (requestedTime < new Date()) {
      return NextResponse.json({
        available: false,
        reason: 'Dit tijdstip is al voorbij',
        business_name: business.name,
      });
    }

    // Check for conflicts
    const { data: conflicts } = await supabase
      .from('appointments')
      .select('id, start_time, end_time')
      .eq('business_id', business_id)
      .lt('start_time', endTime.toISOString())
      .gt('end_time', requestedTime.toISOString())
      .in('status', ['scheduled', 'confirmed']);

    if (conflicts && conflicts.length > 0) {
      return NextResponse.json({
        available: false,
        reason: 'Er is al een afspraak op dit tijdstip',
        business_name: business.name,
      });
    }

    return NextResponse.json({
      available: true,
      business_name: business.name,
      datetime: requestedTime.toISOString(),
      duration_minutes: duration,
    });

  } catch (error) {
    console.error('Availability check error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
