import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

// Admin Supabase client
function createAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceRoleKey) throw new Error('Missing Supabase env vars');
  return createClient(supabaseUrl, serviceRoleKey);
}

interface BusinessData {
  id: string;
  name: string;
  type: string;
  phone: string | null;
  email: string | null;
  street: string | null;
  city: string | null;
  postal_code: string | null;
  opening_hours: Record<string, { open: string; close: string; closed: boolean }> | null;
  voice_id: string | null;
  welcome_message: string | null;
  agent_id: string | null;
}

interface StaffMember {
  id: string;
  name: string;
  is_active: boolean;
}

interface Service {
  id: string;
  name: string;
  duration_minutes: number;
  price: number;
}

// Build complete AI prompt with all business data
function buildSystemPrompt(
  business: BusinessData,
  staff: StaffMember[],
  services: Service[],
  aiContext: string,
  faqs: Array<{ question: string; answer: string }>
): string {
  const dayNames: Record<string, string> = {
    monday: 'maandag', tuesday: 'dinsdag', wednesday: 'woensdag',
    thursday: 'donderdag', friday: 'vrijdag', saturday: 'zaterdag', sunday: 'zondag'
  };

  // Format opening hours
  let openingHoursText = '';
  if (business.opening_hours) {
    const lines: string[] = [];
    for (const [day, hours] of Object.entries(business.opening_hours)) {
      const dayNL = dayNames[day] || day;
      if (hours.closed) {
        lines.push(`${dayNL}: gesloten`);
      } else {
        lines.push(`${dayNL}: ${hours.open} - ${hours.close}`);
      }
    }
    openingHoursText = lines.join('\n');
  }

  // Format address
  let addressText = '';
  if (business.street || business.city) {
    const parts = [business.street, business.postal_code, business.city].filter(Boolean);
    addressText = parts.join(', ');
  }

  // Format staff
  const activeStaff = staff.filter(s => s.is_active);
  const staffText = activeStaff.length > 0 
    ? activeStaff.map(s => s.name).join(', ')
    : 'Niet opgegeven';

  // Format services
  const servicesText = services.length > 0
    ? services.map(s => `- ${s.name} (${s.duration_minutes} min, €${s.price.toFixed(2)})`).join('\n')
    : 'Niet opgegeven';

  // Format FAQs
  const faqsText = faqs.length > 0
    ? faqs.map(f => `V: ${f.question}\nA: ${f.answer}`).join('\n\n')
    : '';

  // Build the complete prompt
  return `# OVER JOU
Je bent de AI receptionist van ${business.name}. ${aiContext}

# BELANGRIJKE REGELS
1. Wees ALTIJD vriendelijk, warm en behulpzaam
2. Geef ALTIJD de ECHTE informatie hieronder, zeg NOOIT "kijk op de website"
3. Als je iets niet weet, zeg dat eerlijk en bied aan om door te verbinden
4. Bij het maken van afspraken: vraag naam, telefoonnummer, gewenste datum/tijd, en reden
5. Bevestig altijd de afspraakdetails aan het einde

# BEDRIJFSGEGEVENS
Naam: ${business.name}
Type: ${business.type}
${addressText ? `Adres: ${addressText}` : ''}
${business.phone ? `Telefoon: ${business.phone}` : ''}
${business.email ? `E-mail: ${business.email}` : ''}

# OPENINGSUREN
${openingHoursText || 'Niet opgegeven - vraag de klant om later terug te bellen'}

# MEDEWERKERS / ARTSEN / SPECIALISTEN
${staffText}

# DIENSTEN / BEHANDELINGEN
${servicesText}

# VEELGESTELDE VRAGEN
${faqsText}

# VOORBEELDGESPREKKEN

Klant: "Waar zijn jullie gevestigd?"
Jij: "Wij zitten op ${addressText || '[adres niet ingesteld]'}. Heeft u verder nog vragen?"

Klant: "Wat zijn jullie openingsuren?"
Jij: "Onze openingsuren zijn:\n${openingHoursText || '[niet ingesteld]'}\nKan ik u ergens mee helpen?"

Klant: "Ik wil een afspraak maken"
Jij: "Ja natuurlijk, dat regel ik graag voor u. Mag ik uw naam?"

Klant: "Kan ik mijn afspraak verzetten?"
Jij: "Ja hoor, geen probleem. Mag ik uw naam en telefoonnummer zodat ik uw afspraak kan opzoeken?"
`;
}

// POST - Create or update ElevenLabs agent
export async function POST(request: NextRequest) {
  try {
    const elevenLabsKey = process.env.ELEVENLABS_API_KEY;
    if (!elevenLabsKey) {
      return NextResponse.json({ error: 'ELEVENLABS_API_KEY niet ingesteld' }, { status: 500 });
    }

    const body = await request.json();
    const { business_id, ai_context, faqs } = body;

    if (!business_id) {
      return NextResponse.json({ error: 'business_id is verplicht' }, { status: 400 });
    }

    const supabase = createAdminClient();

    // Get business data
    const { data: business, error: bizError } = await supabase
      .from('businesses')
      .select('*')
      .eq('id', business_id)
      .single();

    if (bizError || !business) {
      return NextResponse.json({ error: 'Bedrijf niet gevonden' }, { status: 404 });
    }

    // Get staff
    const { data: staff } = await supabase
      .from('staff')
      .select('id, name, is_active')
      .eq('business_id', business_id)
      .eq('is_active', true);

    // Get services
    const { data: services } = await supabase
      .from('services')
      .select('id, name, duration_minutes, price')
      .eq('business_id', business_id);

    // Build system prompt
    const systemPrompt = buildSystemPrompt(
      business as BusinessData,
      (staff || []) as StaffMember[],
      (services || []) as Service[],
      ai_context || '',
      faqs || []
    );

    // ElevenLabs agent config
    const agentConfig = {
      conversation_config: {
        agent: {
          prompt: {
            prompt: systemPrompt,
          },
          first_message: business.welcome_message || `Goedendag, welkom bij ${business.name}. Waarmee kan ik u helpen?`,
          language: 'nl',
        },
        tts: {
          voice_id: business.voice_id || 'pFZP5JQG7iQjIQuC4Bku', // Default Belgian voice
        },
      },
      name: `${business.name} Receptionist`,
    };

    let agentId = business.agent_id;
    let response;

    if (agentId) {
      // Update existing agent
      response = await fetch(`https://api.elevenlabs.io/v1/convai/agents/${agentId}`, {
        method: 'PATCH',
        headers: {
          'xi-api-key': elevenLabsKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(agentConfig),
      });
    } else {
      // Create new agent
      response = await fetch('https://api.elevenlabs.io/v1/convai/agents/create', {
        method: 'POST',
        headers: {
          'xi-api-key': elevenLabsKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(agentConfig),
      });
    }

    if (!response.ok) {
      const errorText = await response.text();
      console.error('ElevenLabs agent error:', errorText);
      return NextResponse.json({ error: 'Kon agent niet aanmaken/updaten', details: errorText }, { status: 500 });
    }

    const agentData = await response.json();
    const newAgentId = agentData.agent_id || agentId;

    // Save agent_id to business
    if (newAgentId && newAgentId !== agentId) {
      await supabase
        .from('businesses')
        .update({ agent_id: newAgentId })
        .eq('id', business_id);
    }

    return NextResponse.json({
      success: true,
      agent_id: newAgentId,
      message: agentId ? 'Agent bijgewerkt' : 'Agent aangemaakt',
    });

  } catch (error) {
    console.error('Agent API error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

// GET - Get agent status
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const businessId = searchParams.get('business_id');

    if (!businessId) {
      return NextResponse.json({ error: 'business_id is verplicht' }, { status: 400 });
    }

    const supabase = createAdminClient();
    const { data: business } = await supabase
      .from('businesses')
      .select('agent_id, name')
      .eq('id', businessId)
      .single();

    if (!business) {
      return NextResponse.json({ error: 'Bedrijf niet gevonden' }, { status: 404 });
    }

    return NextResponse.json({
      has_agent: !!business.agent_id,
      agent_id: business.agent_id,
    });

  } catch (error) {
    console.error('Agent GET error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
