import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

// Create an appointment (called by AI agent)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      business_id,
      customer_name,
      customer_phone,
      customer_email,
      date,
      time,
      service_id,
      service_name,
      staff_id,
      notes,
      duration_minutes,
    } = body;

    // Validation
    if (!business_id || !customer_name || !customer_phone || !date || !time) {
      return NextResponse.json({ 
        success: false,
        error: 'Ontbrekende gegevens. Naam, telefoonnummer, datum en tijd zijn verplicht.' 
      }, { status: 400 });
    }

    const supabase = createAdminClient();

    // Get service duration if service_id provided
    let appointmentDuration = duration_minutes || 30;
    if (service_id) {
      const { data: service } = await supabase
        .from('services')
        .select('duration_minutes')
        .eq('id', service_id)
        .single();
      if (service?.duration_minutes) {
        appointmentDuration = service.duration_minutes;
      }
    }

    // Parse date and time
    const [hours, minutes] = time.split(':').map(Number);
    const startTime = new Date(date);
    startTime.setHours(hours, minutes, 0, 0);
    
    const endTime = new Date(startTime.getTime() + appointmentDuration * 60000);

    // Check for conflicts
    const { data: conflicts } = await supabase
      .from('appointments')
      .select('id, start_time, end_time')
      .eq('business_id', business_id)
      .neq('status', 'cancelled')
      .or(`and(start_time.lt.${endTime.toISOString()},end_time.gt.${startTime.toISOString()})`);

    if (conflicts && conflicts.length > 0) {
      return NextResponse.json({
        success: false,
        error: `Dit tijdslot is helaas niet meer beschikbaar. Er staat al een afspraak gepland van ${new Date(conflicts[0].start_time).toLocaleTimeString('nl-NL', { hour: '2-digit', minute: '2-digit' })} tot ${new Date(conflicts[0].end_time).toLocaleTimeString('nl-NL', { hour: '2-digit', minute: '2-digit' })}.`,
        conflict: true,
      });
    }

    // Check max appointments per day
    const startOfDay = new Date(startTime);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(startTime);
    endOfDay.setHours(23, 59, 59, 999);

    const { data: business } = await supabase
      .from('businesses')
      .select('max_appointments_per_day, name')
      .eq('id', business_id)
      .single();

    const maxPerDay = business?.max_appointments_per_day || 8;

    const { count: dayCount } = await supabase
      .from('appointments')
      .select('*', { count: 'exact', head: true })
      .eq('business_id', business_id)
      .gte('start_time', startOfDay.toISOString())
      .lte('start_time', endOfDay.toISOString())
      .neq('status', 'cancelled');

    if ((dayCount || 0) >= maxPerDay) {
      return NextResponse.json({
        success: false,
        error: `We kunnen helaas geen afspraken meer inplannen op ${startTime.toLocaleDateString('nl-NL')}. Kies een andere dag.`,
        day_full: true,
      });
    }

    // Create the appointment
    const { data: appointment, error: insertError } = await supabase
      .from('appointments')
      .insert({
        business_id,
        customer_name,
        customer_phone,
        customer_email: customer_email || null,
        start_time: startTime.toISOString(),
        end_time: endTime.toISOString(),
        service_id: service_id || null,
        staff_id: staff_id || null,
        notes: notes || service_name || null,
        status: 'scheduled',
        booked_by: 'ai',
      })
      .select()
      .single();

    if (insertError) {
      console.error('Insert appointment error:', insertError);
      return NextResponse.json({
        success: false,
        error: 'Er ging iets mis bij het maken van de afspraak. Probeer het opnieuw.',
      }, { status: 500 });
    }

    // Format confirmation message
    const dateStr = startTime.toLocaleDateString('nl-NL', { 
      weekday: 'long', 
      day: 'numeric', 
      month: 'long' 
    });
    const timeStr = startTime.toLocaleTimeString('nl-NL', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });

    return NextResponse.json({
      success: true,
      appointment_id: appointment.id,
      confirmation: {
        date: dateStr,
        time: timeStr,
        duration: `${appointmentDuration} minuten`,
        customer_name,
        customer_phone,
        service: service_name || notes || 'Afspraak',
      },
      message: `Uw afspraak is bevestigd voor ${dateStr} om ${timeStr}. Tot dan!`,
    });

  } catch (error) {
    console.error('Create appointment error:', error);
    return NextResponse.json({ 
      success: false,
      error: 'Server error' 
    }, { status: 500 });
  }
}
