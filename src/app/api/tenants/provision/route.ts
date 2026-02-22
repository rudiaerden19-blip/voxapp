import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getTemplate, buildWelcomeMessage } from '@/lib/tenant-templates';

// ============================================================
// TENANT PROVISIONING — Zero-touch onboarding
// ============================================================
//
// POST /api/tenants/provision
//
// Creates:
//   1. Business record in Supabase
//   2. Menu items from template
//   3. ElevenLabs agent (Custom LLM mode)
//   4. Links everything together
//
// Input:
//   { name, type, email, phone, address, city, postal_code, country, ai_name? }
//
// Output:
//   { tenant_id, agent_id, welcome_message, menu_count, status }
//

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error('Missing Supabase env vars');
  return createClient(url, key);
}

const CUSTOM_LLM_URL = 'https://www.voxapp.tech/api/voice-engine/v1/chat/completions';

async function createElevenLabsAgent(
  businessName: string,
  welcomeMessage: string,
  aiName: string,
  language: string = 'nl'
): Promise<string | null> {
  const apiKey = process.env.ELEVENLABS_API_KEY;
  if (!apiKey) {
    console.error('[provision] Missing ELEVENLABS_API_KEY');
    return null;
  }

  try {
    const response = await fetch('https://api.elevenlabs.io/v1/convai/agents/create', {
      method: 'POST',
      headers: {
        'xi-api-key': apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: `${businessName} - ${aiName}`,
        conversation_config: {
          agent: {
            prompt: {
              prompt: `Je bent ${aiName}, de AI-receptionist van ${businessName}. Je volgt de state machine — je beslist NIETS zelf.`,
            },
            first_message: welcomeMessage,
            language,
          },
          tts: {
            voice_id: '7qdUFMklKPaaAVMsBTBt',
            model_id: 'eleven_multilingual_v2',
            stability: 0.75,
            similarity_boost: 0.85,
          },
        },
        platform_settings: {
          custom_llm: {
            url: CUSTOM_LLM_URL,
            model: 'voice-order-system',
          },
        },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[provision] ElevenLabs agent creation failed:', response.status, errorText);
      return null;
    }

    const data = await response.json();
    return data.agent_id || null;
  } catch (error) {
    console.error('[provision] ElevenLabs API error:', error);
    return null;
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    const { name, type, email, phone } = body;
    if (!name || !type) {
      return NextResponse.json(
        { error: 'name en type zijn verplicht' },
        { status: 400 }
      );
    }

    // Get template for business type
    const template = getTemplate(type);
    if (!template) {
      return NextResponse.json(
        { error: `Onbekend type: ${type}. Kies uit: frituur, restaurant, kapper, garage, dokter` },
        { status: 400 }
      );
    }

    const aiName = body.ai_name || template.default_ai_name;
    const welcomeMessage = buildWelcomeMessage(template, name, aiName);

    const supabase = getSupabase();

    // Check if tenant already exists (by name + email)
    if (email) {
      const { data: existing } = await supabase
        .from('businesses')
        .select('id')
        .eq('email', email)
        .single();
      if (existing) {
        return NextResponse.json(
          { error: 'Er bestaat al een tenant met dit e-mailadres', tenant_id: existing.id },
          { status: 409 }
        );
      }
    }

    // 1. Create ElevenLabs agent
    const agentId = await createElevenLabsAgent(name, welcomeMessage, aiName);

    // 2. Create business record
    const { data: business, error: bizError } = await supabase
      .from('businesses')
      .insert({
        name: name.toLowerCase(),
        type,
        email: email || null,
        phone: phone || null,
        address: body.address || null,
        city: body.city || null,
        postal_code: body.postal_code || null,
        country: body.country || 'België',
        agent_id: agentId,
        welcome_message: welcomeMessage,
        ai_name: aiName,
        prep_time_pickup: template.prep_time_pickup,
        prep_time_delivery: template.prep_time_delivery,
        delivery_enabled: template.delivery_enabled,
        voice_id: '7qdUFMklKPaaAVMsBTBt',
        subscription_plan: 'starter',
        subscription_status: 'trial',
        trial_ends_at: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
        enabled_modules: ['orders', 'menu', 'kitchen'],
      })
      .select('id')
      .single();

    if (bizError || !business) {
      console.error('[provision] Business insert error:', bizError);
      return NextResponse.json(
        { error: 'Kan tenant niet aanmaken', details: bizError?.message },
        { status: 500 }
      );
    }

    const tenantId = business.id;

    // 3. Insert menu items from template
    const menuRows = template.menu.map(item => ({
      business_id: tenantId,
      name: item.name,
      price: item.price,
      category: item.category || 'algemeen',
      is_available: true,
    }));

    const { error: menuError } = await supabase
      .from('menu_items')
      .insert(menuRows);

    if (menuError) {
      console.error('[provision] Menu insert error:', menuError);
    }

    console.log(JSON.stringify({
      level: 'info',
      service: 'provision',
      action: 'tenant_created',
      tenant_id: tenantId,
      tenant_name: name,
      type,
      agent_id: agentId,
      menu_count: template.menu.length,
    }));

    return NextResponse.json({
      status: 'ok',
      tenant_id: tenantId,
      agent_id: agentId,
      ai_name: aiName,
      welcome_message: welcomeMessage,
      menu_count: template.menu.length,
      type,
      trial_days: 14,
      next_steps: agentId
        ? [
            'Tenant is actief',
            'ElevenLabs agent is aangemaakt',
            'Menu is geladen',
            'Custom LLM endpoint is gekoppeld',
            'Twilio nummer moet nog gekoppeld worden',
          ]
        : [
            'Tenant is aangemaakt',
            'Menu is geladen',
            'ElevenLabs agent moet handmatig aangemaakt worden (geen API key)',
            'Twilio nummer moet nog gekoppeld worden',
          ],
    });

  } catch (error: unknown) {
    console.error('[provision] Error:', error);
    return NextResponse.json(
      { error: 'Provisioning gefaald', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
