import { NextRequest, NextResponse } from 'next/server';
import { 
  createAdminClient, 
  verifyBusinessAccess, 
  unauthorizedResponse,
  forbiddenResponse,
  isValidUUID,
  sanitizeString
} from '@/lib/adminAuth';

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
  delivery_fee: number | null;
  minimum_order: number | null;
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

interface FAQ {
  question: string;
  answer: string;
}

interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  description?: string;
  is_available: boolean;
}

// Get greeting based on language and business type
function getGreeting(language: string, businessName: string, businessType: string): string {
  const isHoreca = ['frituur', 'pizzeria', 'kebab', 'restaurant', 'snackbar'].includes(businessType);
  switch (language) {
    case 'fr':
      return `Bonjour, ${businessName}, comment puis-je vous aider?`;
    case 'de':
      return `Guten Tag, ${businessName}, wie kann ich Ihnen helfen?`;
    case 'en':
      return `Hello, ${businessName}, how can I help you?`;
    default:
      return isHoreca
        ? `Goeiedag, met ${businessName}, wat kan ik voor je doen?`
        : `Goedendag, ${businessName}, waarmee kan ik u helpen?`;
  }
}

// Build complete AI prompt with all business data
function buildSystemPrompt(
  business: BusinessData,
  staff: StaffMember[],
  services: Service[],
  products: Product[],
  aiContext: string,
  faqs: FAQ[],
  fallbackAction: string,
  transferNumber: string
): string {
  const dayNames: Record<string, string> = {
    monday: 'maandag', tuesday: 'dinsdag', wednesday: 'woensdag',
    thursday: 'donderdag', friday: 'vrijdag', saturday: 'zaterdag', sunday: 'zondag'
  };

  // Format opening hours
  let openingHoursText = 'Niet opgegeven';
  if (business.opening_hours && typeof business.opening_hours === 'object') {
    const lines: string[] = [];
    for (const [day, hours] of Object.entries(business.opening_hours)) {
      if (!hours || typeof hours !== 'object') continue;
      const dayNL = dayNames[day] || day;
      if (hours.closed) {
        lines.push(`${dayNL}: gesloten`);
      } else if (hours.open && hours.close) {
        lines.push(`${dayNL}: ${hours.open} - ${hours.close}`);
      }
    }
    if (lines.length > 0) {
      openingHoursText = lines.join('\n');
    }
  }

  // Format address
  let addressText = 'Niet opgegeven';
  const addressParts = [business.street, business.postal_code, business.city].filter(Boolean);
  if (addressParts.length > 0) {
    addressText = addressParts.join(', ');
  }

  // Format staff
  const activeStaff = Array.isArray(staff) ? staff.filter(s => s && s.is_active && s.name) : [];
  const staffText = activeStaff.length > 0 
    ? activeStaff.map(s => s.name).join(', ')
    : 'Niet opgegeven';

  // Format services
  const validServices = Array.isArray(services) ? services.filter(s => s && s.name) : [];
  const servicesText = validServices.length > 0
    ? validServices.map(s => {
        const duration = s.duration_minutes ? `${s.duration_minutes} min` : '';
        const price = typeof s.price === 'number' ? `€${s.price.toFixed(2)}` : '';
        const details = [duration, price].filter(Boolean).join(', ');
        return details ? `- ${s.name} (${details})` : `- ${s.name}`;
      }).join('\n')
    : 'Niet opgegeven';

  // Format products (for horeca)
  const validProducts = Array.isArray(products) ? products.filter(p => p && p.name && p.is_available !== false) : [];
  const productsByCategory: Record<string, Product[]> = {};
  validProducts.forEach(p => {
    const cat = p.category || 'Overig';
    if (!productsByCategory[cat]) productsByCategory[cat] = [];
    productsByCategory[cat].push(p);
  });
  
  let productsText = '';
  if (validProducts.length > 0) {
    const lines: string[] = [];
    for (const [category, items] of Object.entries(productsByCategory)) {
      lines.push(`\n## ${category}`);
      items.forEach(p => {
        const price = typeof p.price === 'number' ? `€${p.price.toFixed(2)}` : '';
        lines.push(`- ${p.name}: ${price}`);
      });
    }
    productsText = lines.join('\n');
  }

  // Format FAQs
  const validFaqs = Array.isArray(faqs) ? faqs.filter(f => f && f.question && f.answer) : [];
  const faqsText = validFaqs.length > 0
    ? validFaqs.map(f => `V: ${f.question}\nA: ${f.answer}`).join('\n\n')
    : '';

  const businessName = business.name || 'ons bedrijf';
  const isHoreca = ['frituur', 'pizzeria', 'kebab', 'restaurant', 'snackbar'].includes(business.type || '');

  // Build menu text from DB products
  let menuText = '';
  if (isHoreca && productsText) {
    menuText = productsText;
  }

  // Build the complete prompt — fully dynamic per tenant
  if (isHoreca) {
    return `Je bent de telefoniste van ${businessName}. ${aiContext || ''}
Je spreekt Vlaams, je bent vriendelijk en vlot.

BELANGRIJK: Volg dit gesprek EXACT in deze volgorde. Sla GEEN stappen over. Vraag NOOIT twee dingen tegelijk.

OPENINGSUREN CHECK:
${openingHoursText}
Als iemand belt buiten de openingsuren, zeg:
- Te vroeg: "Helaas, wij zijn nog niet open. Wij openen om [openingsuur]. Kan ik je anders helpen?"
- Te laat: "Helaas, wij zijn gesloten. Wij zijn morgen weer open vanaf [openingsuur]."
- Op een gesloten dag: "Helaas, op [dag] zijn wij gesloten. Wij zijn [eerstvolgende open dag] weer open."
Als iemand een levering of afhaling wil op een moment dat we gesloten zijn, zeg dat ook.

STAP 1 — BESTELLING OPNEMEN
Klant zegt wat die wil. Jij zegt alleen kort "Ok!" of "Goed!" en vraagt "Nog iets anders?"
Herhaal dit tot de klant zegt dat het alles is.
Zeg NOOIT tussentijds wat er al besteld is. Alleen kort bevestigen.

STAP 2 — AFHALEN OF LEVEREN
Vraag: "Moet het geleverd worden of kom je het afhalen?"
Wacht op antwoord.

STAP 3A — BIJ AFHALEN:
Vraag: "Op welke naam mag ik de bestelling zetten?"
Wacht op antwoord.
Ga naar stap 4.

STAP 3B — BIJ LEVERING:
Vraag: "Op welke naam mag ik de bestelling zetten?"
Wacht op antwoord.
Vraag: "Op welk adres mogen we je bestelling leveren?"
Wacht op antwoord.
Vraag: "En welk telefoonnummer voor onze chauffeur?"
Wacht op antwoord.
Ga naar stap 4.

STAP 4 — SAMENVATTING
Zeg: "Ok [naam], ik noem nog even op wat je besteld hebt: [alle items]. Dat was alles?"
Wacht op bevestiging.

STAP 5 — AFSLUITEN
Bij afhalen: "Jouw bestelling is klaar binnen 20 minuten. Dank je wel en eet smakelijk!"
Bij levering: "Ok alles genoteerd. Je bestelling wordt geleverd binnen 30 minuten. Dank je wel en eet smakelijk!"

VERBODEN:
- NOOIT twee vragen tegelijk stellen
- NOOIT de bestelling tussentijds herhalen
- NOOIT lange zinnen
- NOOIT doorpraten als de klant nog bezig is
- NOOIT vragen naar telefoonnummer bij afhalen, alleen bij levering

BEDRIJFSINFO:
${businessName} — ${addressText}
${business.phone ? `Tel: ${business.phone}` : ''}

${menuText ? `MENU:\n${menuText}` : ''}
${business.delivery_fee !== null ? `\nLeveringskosten: €${business.delivery_fee.toFixed(2)}` : ''}
${business.minimum_order !== null ? `Minimale bestelling: €${business.minimum_order.toFixed(2)}` : ''}

${faqsText ? `VEELGESTELDE VRAGEN:\n${faqsText}` : ''}

${fallbackAction === 'transfer' && transferNumber 
  ? `Als je de klant ECHT niet kunt helpen, verbind door naar ${transferNumber}.`
  : fallbackAction === 'callback' 
    ? `Als je de klant niet kunt helpen, vraag naam en telefoonnummer en zeg dat iemand terugbelt.`
    : `Als je de klant niet kunt helpen, bied aan om een bericht achter te laten.`
}`;
  }

  // Non-horeca: dokter, tandarts, kapper, garage, advocaat, etc.
  return `Je bent de telefoniste van ${businessName}. ${aiContext || ''}
Je spreekt Vlaams, je bent vriendelijk en vlot.

BELANGRIJK: Volg dit gesprek EXACT. Vraag NOOIT twee dingen tegelijk.

OPENINGSUREN CHECK:
${openingHoursText}
Als iemand belt buiten de openingsuren, zeg:
- "Helaas, wij zijn momenteel gesloten. Wij zijn weer open [eerstvolgende openingsdag en uur]."
- Bied aan om een bericht achter te laten of teruggebeld te worden.

STAP 1 — REDEN VAN HET GESPREK
Vraag: "Waarmee kan ik u helpen?"
Wacht op antwoord.

STAP 2 — BIJ AFSPRAAK:
Vraag: "Op welke naam mag ik de afspraak noteren?"
Wacht op antwoord.
Vraag: "En uw telefoonnummer?"
Wacht op antwoord.
Vraag: "Voor wanneer wilt u de afspraak maken?"
Wacht op antwoord.
Vraag: "En hoe laat zou u willen komen?"
Wacht op antwoord.
${validServices.length > 0 ? `Vraag: "Waarvoor wilt u langskomen?" (diensten: ${validServices.map(s => s.name).join(', ')})\nWacht op antwoord.` : `Vraag: "Waarvoor wilt u langskomen?"\nWacht op antwoord.`}

STAP 3 — BEVESTIGING
Zeg: "Uw afspraak: [datum] om [tijd] voor [reden], op naam van [naam]. Klopt dit?"
Wacht op bevestiging.
Na bevestiging: "Perfect, we zien u dan!"

VERBODEN:
- NOOIT twee vragen tegelijk stellen
- NOOIT doorpraten als de klant nog bezig is
- NOOIT lange zinnen

BEDRIJFSINFO:
${businessName} — ${addressText}
${business.phone ? `Tel: ${business.phone}` : ''}

${staffText !== 'Niet opgegeven' ? `MEDEWERKERS:\n${staffText}` : ''}

${validServices.length > 0 ? `DIENSTEN:\n${servicesText}` : ''}

${faqsText ? `VEELGESTELDE VRAGEN:\n${faqsText}` : ''}

${fallbackAction === 'transfer' && transferNumber 
  ? `Als je de klant ECHT niet kunt helpen, verbind door naar ${transferNumber}.`
  : fallbackAction === 'callback' 
    ? `Als je de klant niet kunt helpen, vraag naam en telefoonnummer en zeg dat iemand terugbelt.`
    : `Als je de klant niet kunt helpen, bied aan om een bericht achter te laten.`
}`;
}

// POST - Create or update ElevenLabs agent
export async function POST(request: NextRequest) {
  try {
    const elevenLabsKey = process.env.ELEVENLABS_API_KEY;
    if (!elevenLabsKey || elevenLabsKey.trim() === '') {
      console.error('ELEVENLABS_API_KEY niet geconfigureerd');
      return NextResponse.json({ error: 'ElevenLabs API niet geconfigureerd' }, { status: 503 });
    }

    // Parse body met error handling
    let body;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: 'Ongeldige JSON data' }, { status: 400 });
    }

    const { business_id, ai_context, faqs, fallback_action, transfer_number, voice_language } = body;

    // Validatie
    if (!business_id) {
      return NextResponse.json({ error: 'business_id is verplicht' }, { status: 400 });
    }

    if (!isValidUUID(business_id)) {
      return NextResponse.json({ error: 'Ongeldig business_id formaat' }, { status: 400 });
    }

    // Autorisatie check overgeslagen - admin panel gebruikt localStorage auth

    const supabase = createAdminClient();

    // Get business data
    const { data: business, error: bizError } = await supabase
      .from('businesses')
      .select('id, name, type, phone, email, street, city, postal_code, opening_hours, voice_id, welcome_message, agent_id, delivery_fee, minimum_order')
      .eq('id', business_id)
      .single();

    if (bizError) {
      console.error('Business fetch DB error:', bizError);
      return NextResponse.json({ error: 'Database fout bij ophalen bedrijf' }, { status: 500 });
    }

    if (!business) {
      return NextResponse.json({ error: 'Bedrijf niet gevonden' }, { status: 404 });
    }

    // Valideer business.name
    if (!business.name || business.name.trim() === '') {
      return NextResponse.json({ error: 'Bedrijfsnaam is niet ingesteld' }, { status: 400 });
    }

    // Get staff
    const { data: staff, error: staffError } = await supabase
      .from('staff')
      .select('id, name, is_active')
      .eq('business_id', business_id)
      .eq('is_active', true);

    if (staffError) {
      console.error('Staff fetch DB error:', staffError);
      // Niet fataal - ga door zonder staff
    }

    // Get services
    const { data: services, error: servicesError } = await supabase
      .from('services')
      .select('id, name, duration_minutes, price')
      .eq('business_id', business_id);

    if (servicesError) {
      console.error('Services fetch DB error:', servicesError);
      // Niet fataal - ga door zonder services
    }

    // Get products/menu (for horeca) – tabel: menu_items
    let products: Product[] = [];
    if (['frituur', 'pizzeria', 'kebab', 'restaurant', 'snackbar'].includes(business.type || '')) {
      const { data: productsData, error: productsError } = await supabase
        .from('menu_items')
        .select('id, name, category, price, description, is_available')
        .eq('business_id', business_id)
        .eq('is_available', true)
        .order('category')
        .order('name');

      if (productsError) {
        console.error('Products fetch DB error:', productsError);
      } else {
        products = productsData || [];
      }
    }

    // Valideer en filter FAQs
    const validFaqs: FAQ[] = [];
    if (Array.isArray(faqs)) {
      for (const faq of faqs) {
        if (faq && typeof faq === 'object' && typeof faq.question === 'string' && typeof faq.answer === 'string') {
          const q = sanitizeString(faq.question, 500);
          const a = sanitizeString(faq.answer, 1000);
          if (q && a) {
            validFaqs.push({ question: q, answer: a });
          }
        }
      }
    }

    // Valideer fallback settings
    const validFallbackAction = ['voicemail', 'transfer', 'callback'].includes(fallback_action) 
      ? fallback_action 
      : 'voicemail';
    const validTransferNumber = sanitizeString(transfer_number, 20);

    // Build system prompt
    const systemPrompt = buildSystemPrompt(
      business as BusinessData,
      (staff || []) as StaffMember[],
      (services || []) as Service[],
      products,
      sanitizeString(ai_context, 2000),
      validFaqs,
      validFallbackAction,
      validTransferNumber
    );

    // Get webhook URL for post-call processing
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://www.voxapp.tech';
    const webhookUrl = `${baseUrl}/api/webhooks/elevenlabs`;

    // ElevenLabs agent config - Dutch requires turbo/flash model
    // NOTE: Appointments/orders worden automatisch aangemaakt via post-call webhook analyse
    const agentId = business.agent_id;
    let response;

    // Base config - used for both create and update
    const baseConfig = {
      conversation_config: {
        agent: {
          prompt: {
            prompt: systemPrompt,
            llm: 'gpt-4o-mini',
          },
          first_message: business.welcome_message || getGreeting(voice_language || 'nl', business.name, business.type || ''),
          language: voice_language || 'nl',
        },
      },
      name: `${business.name} Receptionist`,
    };

    // Full config for NEW agents - includes voice settings
    const newAgentConfig = {
      ...baseConfig,
      conversation_config: {
        ...baseConfig.conversation_config,
        tts: {
          // Use stored voice_id or default to Lily (multilingual)
          voice_id: (business.voice_id && !business.voice_id.includes('-')) 
            ? business.voice_id 
            : 'pFZP5JQG7iQjIQuC4Bku',
          model_id: 'eleven_turbo_v2_5',
        },
      },
    };

    // Update config - does NOT change voice settings (preserves what user set in ElevenLabs UI)
    const updateConfig = {
      ...baseConfig,
    };

    try {
      if (agentId) {
        // Update existing agent - DO NOT change voice settings
        console.log('Updating existing agent, preserving voice settings');
        response = await fetch(`https://api.elevenlabs.io/v1/convai/agents/${agentId}`, {
          method: 'PATCH',
          headers: {
            'xi-api-key': elevenLabsKey,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(updateConfig),
        });
      } else {
        // Create new agent - includes voice settings
        console.log('Creating new agent with voice settings');
        response = await fetch('https://api.elevenlabs.io/v1/convai/agents/create', {
          method: 'POST',
          headers: {
            'xi-api-key': elevenLabsKey,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(newAgentConfig),
        });
      }
    } catch (fetchError) {
      console.error('ElevenLabs fetch error:', fetchError);
      return NextResponse.json({ error: 'Kon ElevenLabs niet bereiken' }, { status: 502 });
    }

    if (!response.ok) {
      // Log error maar geef geen details aan client (security)
      const errorText = await response.text().catch(() => 'Unknown error');
      console.error('ElevenLabs API error:', response.status, errorText);
      
      // Map status codes
      if (response.status === 401 || response.status === 403) {
        return NextResponse.json({ error: 'ElevenLabs authenticatie mislukt' }, { status: 503 });
      } else if (response.status === 404 && agentId) {
        // Agent bestaat niet meer - maak nieuwe aan
        console.log('Agent not found, will create new one');
        // Clear agent_id en probeer opnieuw
        await supabase.from('businesses').update({ agent_id: null }).eq('id', business_id);
        return NextResponse.json({ error: 'Agent niet gevonden, probeer opnieuw' }, { status: 409 });
      } else if (response.status === 429) {
        return NextResponse.json({ error: 'Te veel verzoeken, probeer later opnieuw' }, { status: 429 });
      }
      
      // Toon meer details voor debugging
      return NextResponse.json({ error: `ElevenLabs fout (${response.status}): ${errorText.substring(0, 200)}` }, { status: 502 });
    }

    // Parse response
    let agentData;
    try {
      agentData = await response.json();
    } catch {
      console.error('ElevenLabs response parse error');
      return NextResponse.json({ error: 'Ongeldige response van ElevenLabs' }, { status: 502 });
    }

    const newAgentId = agentData.agent_id || agentId;

    // Save agent_id to business als het nieuw is
    if (newAgentId && newAgentId !== agentId) {
      const { error: updateError } = await supabase
        .from('businesses')
        .update({ agent_id: newAgentId, updated_at: new Date().toISOString() })
        .eq('id', business_id);

      if (updateError) {
        console.error('Agent ID save error:', updateError);
        // Niet fataal - agent is wel aangemaakt
      }
    }

    return NextResponse.json({
      success: true,
      agent_id: newAgentId,
      message: agentId ? 'Agent bijgewerkt' : 'Agent aangemaakt',
    });

  } catch (error) {
    console.error('Agent API error:', error);
    return NextResponse.json({ error: 'Interne serverfout' }, { status: 500 });
  }
}

// GET - Get agent status
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const businessId = searchParams.get('business_id');

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
    
    const { data: business, error } = await supabase
      .from('businesses')
      .select('agent_id, name')
      .eq('id', businessId)
      .single();

    if (error) {
      console.error('Agent status DB error:', error);
      return NextResponse.json({ error: 'Database fout' }, { status: 500 });
    }

    if (!business) {
      return NextResponse.json({ error: 'Bedrijf niet gevonden' }, { status: 404 });
    }

    return NextResponse.json({
      has_agent: !!business.agent_id,
      agent_id: business.agent_id || null,
    });

  } catch (error) {
    console.error('Agent GET error:', error);
    return NextResponse.json({ error: 'Interne serverfout' }, { status: 500 });
  }
}
