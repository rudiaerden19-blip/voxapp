import { NextRequest, NextResponse } from 'next/server';

/**
 * Verifieer webhook secret (voor Vapi en AI tool endpoints).
 * Checkt x-webhook-secret en x-vapi-secret headers.
 * Returns null als geldig, NextResponse als ongeldig.
 */
export function verifyWebhookSecret(request: NextRequest): NextResponse | null {
  const secret = process.env.VAPI_WEBHOOK_SECRET;
  if (!secret) return null;

  const incoming = request.headers.get('x-webhook-secret')
    ?? request.headers.get('x-vapi-secret');

  if (incoming !== secret) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  return null;
}

/**
 * Verifieer admin API key (voor interne/admin endpoints).
 * Checkt x-api-key header tegen ADMIN_API_KEY env var.
 * Returns null als geldig, NextResponse als ongeldig.
 */
export function verifyAdminApiKey(request: NextRequest): NextResponse | null {
  const apiKey = process.env.ADMIN_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: 'ADMIN_API_KEY niet geconfigureerd' },
      { status: 500 }
    );
  }

  const incoming = request.headers.get('x-api-key');
  if (incoming !== apiKey) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  return null;
}

/**
 * Verifieer ElevenLabs webhook secret.
 * Checkt x-webhook-secret header tegen ELEVENLABS_WEBHOOK_SECRET env var.
 * Returns null als geldig, NextResponse als ongeldig.
 */
export function verifyElevenLabsSecret(request: NextRequest): NextResponse | null {
  const secret = process.env.ELEVENLABS_WEBHOOK_SECRET;
  if (!secret) return null;

  const incoming = request.headers.get('x-webhook-secret')
    ?? request.headers.get('x-elevenlabs-signature');

  if (!incoming || incoming !== secret) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  return null;
}
