import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

// Check available appointment slots for a business
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { business_id, date, service_id } = body;

    if (!business_id || !date) {
      return NextResponse.json({ error: 'business_id and date required' }, { status: 400 });
    }

    const supabase = createAdminClient();

    // Get business settings
    const { data: business } = await supabase
      .from('businesses')
      .select('opening_hours, max_appointments_per_day')
      .eq('id', business_id)
      .single();

    const maxPerDay = business?.max_appointments_per_day || 8;

    // Get service duration if provided
    let serviceDuration = 30; // default 30 minutes
    if (service_id) {
      const { data: service } = await supabase
        .from('services')
        .select('duration_minutes')
        .eq('id', service_id)
        .single();
      if (service?.duration_minutes) {
        serviceDuration = service.duration_minutes;
      }
    }

    // Parse the requested date
    const requestedDate = new Date(date);
    const dayOfWeek = requestedDate.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();

    // Check opening hours for this day
    let openTime = '09:00';
    let closeTime = '18:00';
    let isClosed = false;

    if (business?.opening_hours && typeof business.opening_hours === 'object') {
      const dayHours = business.opening_hours[dayOfWeek];
      if (dayHours) {
        if (dayHours.closed) {
          isClosed = true;
        } else {
          openTime = dayHours.open || '09:00';
          closeTime = dayHours.close || '18:00';
        }
      }
    }

    if (isClosed) {
      return NextResponse.json({
        available: false,
        message: `We zijn gesloten op ${dayOfWeek}`,
        available_slots: [],
      });
    }

    // Get existing appointments for this day
    const startOfDay = new Date(requestedDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(requestedDate);
    endOfDay.setHours(23, 59, 59, 999);

    const { data: existingAppointments } = await supabase
      .from('appointments')
      .select('start_time, end_time')
      .eq('business_id', business_id)
      .gte('start_time', startOfDay.toISOString())
      .lte('start_time', endOfDay.toISOString())
      .neq('status', 'cancelled');

    // Check if max appointments reached
    const appointmentCount = existingAppointments?.length || 0;
    if (appointmentCount >= maxPerDay) {
      return NextResponse.json({
        available: false,
        message: `We zitten helaas vol op ${requestedDate.toLocaleDateString('nl-NL')}. Kies een andere dag.`,
        available_slots: [],
      });
    }

    // Generate available time slots
    const [openHour, openMin] = openTime.split(':').map(Number);
    const [closeHour, closeMin] = closeTime.split(':').map(Number);

    const slots: string[] = [];
    const slotDate = new Date(requestedDate);
    slotDate.setHours(openHour, openMin, 0, 0);

    const closeDateTime = new Date(requestedDate);
    closeDateTime.setHours(closeHour, closeMin, 0, 0);

    while (slotDate < closeDateTime) {
      const slotEnd = new Date(slotDate.getTime() + serviceDuration * 60000);
      
      // Check if this slot conflicts with existing appointments
      const slotStart = slotDate.getTime();
      const slotEndTime = slotEnd.getTime();

      const hasConflict = existingAppointments?.some(apt => {
        const aptStart = new Date(apt.start_time).getTime();
        const aptEnd = new Date(apt.end_time).getTime();
        return (slotStart < aptEnd && slotEndTime > aptStart);
      });

      if (!hasConflict) {
        slots.push(slotDate.toLocaleTimeString('nl-NL', { hour: '2-digit', minute: '2-digit' }));
      }

      // Move to next slot (30 min intervals)
      slotDate.setMinutes(slotDate.getMinutes() + 30);
    }

    return NextResponse.json({
      available: slots.length > 0,
      date: requestedDate.toLocaleDateString('nl-NL'),
      opening_hours: `${openTime} - ${closeTime}`,
      available_slots: slots.slice(0, 10), // Return max 10 slots
      total_available: slots.length,
      message: slots.length > 0 
        ? `Er zijn nog ${slots.length} tijdsloten beschikbaar`
        : 'Geen beschikbare tijdsloten op deze dag',
    });

  } catch (error) {
    console.error('Check availability error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
