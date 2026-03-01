import { NextResponse } from 'next/server';

const PHONE = '+32480210478';
const ASSISTANT_ID = '0951136f-27b1-42cb-856c-32678ad1de57';
const CREDENTIAL_ID = '22a72fe7-a07a-4963-a158-f34ec14397e1';
const VAPI_TELNYX_WEBHOOK = 'https://api.eu.vapi.ai/telnyx/inbound_call';

/**
 * POST /api/fix-vapi-phone
 * Oplost "geen aansluiting": zet Telnyx webhook naar Vapi + voeg nummer toe in Vapi.
 * Roept alles automatisch aan — geen handmatige stappen.
 */
export async function POST() {
  const results: { step: string; ok: boolean; message: string }[] = [];

  try {
    // Stap 1: Telnyx webhook naar Vapi zetten (als webhook nu naar voxapp wijst)
    const telnyxKey = process.env.TELNYX_API_KEY;
    if (telnyxKey) {
      const listRes = await fetch('https://api.telnyx.com/v2/call_control_applications?page[size]=50', {
        headers: { Authorization: `Bearer ${telnyxKey}` },
      });
      if (listRes.ok) {
        const listData = await listRes.json();
        const apps = listData.data ?? [];
        for (const app of apps) {
          const url = app.webhook_event_url ?? '';
          const wijstNaarVoxapp = url.includes('voxapp.tech') || url.includes('voxapp');
          if (wijstNaarVoxapp && app.id) {
            const patchRes = await fetch(`https://api.telnyx.com/v2/call_control_applications/${app.id}`, {
              method: 'PATCH',
              headers: {
                Authorization: `Bearer ${telnyxKey}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                application_name: app.application_name ?? 'voxapp',
                webhook_event_url: VAPI_TELNYX_WEBHOOK,
              }),
            });
            if (patchRes.ok) {
              results.push({ step: 'telnyx_webhook', ok: true, message: `Webhook gezet naar Vapi (app ${app.id})` });
            } else {
              const err = await patchRes.text();
              results.push({ step: 'telnyx_webhook', ok: false, message: `Telnyx PATCH mislukt: ${err}` });
            }
          }
        }
        if (apps.length === 0) {
          results.push({ step: 'telnyx_webhook', ok: true, message: 'Geen apps met voxapp-webhook gevonden' });
        } else if (!results.some((r) => r.step === 'telnyx_webhook')) {
          results.push({ step: 'telnyx_webhook', ok: true, message: 'Geen webhook naar voxapp — al correct' });
        }
      } else {
        results.push({ step: 'telnyx_webhook', ok: false, message: `Telnyx list failed: ${listRes.status}` });
      }
    } else {
      results.push({ step: 'telnyx_webhook', ok: false, message: 'TELNYX_API_KEY ontbreekt' });
    }

    // Stap 2: Nummer in Vapi
    const vapiKey = process.env.VAPI_API_KEY;
    if (!vapiKey) {
      results.push({ step: 'vapi_number', ok: false, message: 'VAPI_API_KEY ontbreekt' });
    } else {
      const listRes = await fetch('https://api.vapi.ai/phone-number', {
        headers: { Authorization: `Bearer ${vapiKey}` },
      });
      if (!listRes.ok) {
        results.push({ step: 'vapi_number', ok: false, message: `Vapi list failed: ${listRes.status}` });
      } else {
        const numbers = await listRes.json();
        const exists = Array.isArray(numbers) && numbers.find((n: { number: string }) => n.number === PHONE);
        if (exists) {
          results.push({ step: 'vapi_number', ok: true, message: `Nummer ${PHONE} staat al in Vapi` });
        } else {
          const createRes = await fetch('https://api.vapi.ai/phone-number', {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${vapiKey}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              provider: 'telnyx',
              number: PHONE,
              credentialId: CREDENTIAL_ID,
              assistantId: ASSISTANT_ID,
              name: 'VoxApp Kapper BE',
            }),
          });
          const data = await createRes.json();
          if (createRes.ok) {
            results.push({ step: 'vapi_number', ok: true, message: `Nummer ${PHONE} toegevoegd aan Vapi` });
          } else {
            results.push({ step: 'vapi_number', ok: false, message: `Vapi create failed: ${JSON.stringify(data)}` });
          }
        }
      }
    }

    const allOk = results.every((r) => r.ok);
    return NextResponse.json({
      ok: allOk,
      results,
      message: allOk ? 'Fix voltooid. Bel +32480210478 om te testen.' : 'Sommige stappen mislukt.',
    });
  } catch (err) {
    console.error('[fix-vapi-phone]', err);
    return NextResponse.json({
      ok: false,
      results,
      error: String(err),
    }, { status: 500 });
  }
}
