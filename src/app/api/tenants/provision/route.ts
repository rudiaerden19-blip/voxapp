import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getTemplate, buildWelcomeMessage } from '@/lib/tenant-templates';

// ============================================================
// TENANT PROVISIONING — Idempotent, herstelbaar
// ============================================================
//
// POST /api/tenants/provision
//
// Idempotentie:
//   - Bestaand email → 409 met tenant_id
//   - Bestaande tenant zonder agent → retry agent aanmaak
//   - Bestaande tenant met agent → 409
//   - Menu-items alleen als er nog geen zijn
//
// Volgorde:
//   1. Check bestaande tenant (email)
//   2. Als AGENT_PENDING → retry ElevenLabs
//   3. Nieuw: business → agent → menu
//

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error('Missing Supabase env vars');
  return createClient(url, key);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type DB = any;

// ElevenLabs appends /chat/completions when api_type is "chat_completions"
const CUSTOM_LLM_URL = 'https://www.voxapp.tech/api/voice-engine/v1';

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
            stability: 0.97,
            similarity_boost: 0.75,
            speed: 1.0,
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

async function ensureMenuItems(supabase: DB, tenantId: string, type: string): Promise<number> {
  const { count } = await supabase
    .from('menu_items')
    .select('id', { count: 'exact', head: true })
    .eq('business_id', tenantId);

  if (count && count > 0) return count;

  const template = getTemplate(type);
  if (!template) return 0;

  const menuRows = template.menu.map(item => ({
    business_id: tenantId,
    name: item.name,
    price: item.price,
    category: item.category || 'algemeen',
    is_available: true,
  }));

  const { error } = await supabase.from('menu_items').insert(menuRows);
  if (error) {
    console.error('[provision] Menu insert error:', error);
    return 0;
  }
  return template.menu.length;
}

async function retryAgentForTenant(
  supabase: DB,
  tenant: { id: string; name: string; welcome_message: string; ai_name: string; agent_id: string | null; type: string }
): Promise<NextResponse> {
  if (tenant.agent_id) {
    return NextResponse.json({
      status: 'already_provisioned',
      tenant_id: tenant.id,
      agent_id: tenant.agent_id,
      message: 'Tenant en agent bestaan al',
    }, { status: 409 });
  }

  const agentId = await createElevenLabsAgent(
    tenant.name,
    tenant.welcome_message || `Hallo, met ${tenant.name}, wat kan ik voor u doen?`,
    tenant.ai_name || 'Anja'
  );

  if (agentId) {
    await supabase
      .from('businesses')
      .update({ agent_id: agentId, subscription_status: 'trial' })
      .eq('id', tenant.id);

    console.log(JSON.stringify({
      level: 'info', service: 'provision', action: 'agent_retry_success',
      tenant_id: tenant.id, agent_id: agentId,
    }));

    const menuCount = await ensureMenuItems(supabase, tenant.id, tenant.type);

    return NextResponse.json({
      status: 'agent_created',
      tenant_id: tenant.id,
      agent_id: agentId,
      menu_count: menuCount,
      message: 'Agent alsnog aangemaakt voor bestaande tenant',
    });
  }

  console.error(JSON.stringify({
    level: 'error', service: 'provision', action: 'agent_retry_failed',
    tenant_id: tenant.id,
  }));

  return NextResponse.json({
    status: 'agent_pending',
    tenant_id: tenant.id,
    agent_id: null,
    message: 'Agent aanmaak opnieuw gefaald. Probeer later opnieuw.',
  }, { status: 503 });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const { name, type, email, phone } = body;
    if (!name || !type) {
      return NextResponse.json(
        { error: 'name en type zijn verplicht' },
        { status: 400 }
      );
    }

    const template = getTemplate(type);
    if (!template) {
      return NextResponse.json(
        { error: `Onbekend type: ${type}. Kies uit: frituur, restaurant, kapper, garage, dokter` },
        { status: 400 }
      );
    }

    const supabase = getSupabase();

    // ── IDEMPOTENTIE CHECK ──────────────────────────────────
    // Zoek bestaande tenant op email OF telefoon
    if (email || phone) {
      let query = supabase
        .from('businesses')
        .select('id, name, agent_id, welcome_message, ai_name, type');

      if (email) {
        query = query.eq('email', email);
      } else {
        query = query.eq('phone', phone);
      }

      const { data: existing } = await query.single();

      if (existing) {
        // Tenant bestaat al → retry agent als die ontbreekt, anders 409
        return retryAgentForTenant(supabase, existing);
      }
    }

    // ── NIEUWE TENANT ───────────────────────────────────────
    const aiName = body.ai_name || template.default_ai_name;
    const welcomeMessage = buildWelcomeMessage(template, name, aiName);

    // 1. Business record eerst (zonder agent_id)
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
        agent_id: null,
        welcome_message: welcomeMessage,
        ai_name: aiName,
        prep_time_pickup: template.prep_time_pickup,
        prep_time_delivery: template.prep_time_delivery,
        delivery_enabled: template.delivery_enabled,
        voice_id: '7qdUFMklKPaaAVMsBTBt',
        subscription_plan: 'starter',
        subscription_status: 'agent_pending',
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

    // 2. Menu items (idempotent — checkt of er al items zijn)
    const menuCount = await ensureMenuItems(supabase, tenantId, type);

    // 3. ElevenLabs agent
    const agentId = await createElevenLabsAgent(name, welcomeMessage, aiName);

    if (agentId) {
      await supabase
        .from('businesses')
        .update({ agent_id: agentId, subscription_status: 'trial' })
        .eq('id', tenantId);
    }

    console.log(JSON.stringify({
      level: 'info',
      service: 'provision',
      action: 'tenant_created',
      tenant_id: tenantId,
      tenant_name: name,
      type,
      agent_id: agentId,
      agent_status: agentId ? 'active' : 'pending',
      menu_count: menuCount,
    }));

    return NextResponse.json({
      status: agentId ? 'ok' : 'agent_pending',
      tenant_id: tenantId,
      agent_id: agentId,
      ai_name: aiName,
      welcome_message: welcomeMessage,
      menu_count: menuCount,
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
            'Tenant is aangemaakt met status AGENT_PENDING',
            'Menu is geladen',
            'ElevenLabs agent aanmaak gefaald — roep /api/tenants/provision opnieuw aan met zelfde email om te retrien',
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
