import { NextRequest, NextResponse } from 'next/server';
import { createHash, randomBytes } from 'crypto';

const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
  console.error('[admin/auth] ADMIN_EMAIL of ADMIN_PASSWORD env var ontbreekt');
}

function generateSessionToken(): string {
  return createHash('sha256')
    .update(randomBytes(32))
    .digest('hex');
}

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  path: '/',
  maxAge: 60 * 60 * 24 * 7, // 7 dagen
};

export async function POST(request: NextRequest) {
  try {
    if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
      return NextResponse.json(
        { error: 'Admin login niet geconfigureerd. Stel ADMIN_EMAIL en ADMIN_PASSWORD in.' },
        { status: 500 }
      );
    }

    const body = await request.json();
    const { email, password } = body;

    if (email !== ADMIN_EMAIL || password !== ADMIN_PASSWORD) {
      return NextResponse.json(
        { error: 'Ongeldige admin credentials' },
        { status: 401 }
      );
    }

    const sessionToken = generateSessionToken();
    const response = NextResponse.json({ success: true });

    response.cookies.set('voxapp_admin_session', sessionToken, COOKIE_OPTIONS);
    response.cookies.set('voxapp_admin_email', ADMIN_EMAIL, COOKIE_OPTIONS);

    return response;
  } catch {
    return NextResponse.json({ error: 'Login mislukt' }, { status: 500 });
  }
}

// GET — Check session
export async function GET(request: NextRequest) {
  const session = request.cookies.get('voxapp_admin_session')?.value;
  const email = request.cookies.get('voxapp_admin_email')?.value;

  if (session && session.length === 64 && email === ADMIN_EMAIL) {
    return NextResponse.json({ authenticated: true, email });
  }

  return NextResponse.json({ authenticated: false }, { status: 401 });
}

// DELETE — Logout
export async function DELETE() {
  const response = NextResponse.json({ success: true });

  response.cookies.set('voxapp_admin_session', '', { ...COOKIE_OPTIONS, maxAge: 0 });
  response.cookies.set('voxapp_admin_email', '', { ...COOKIE_OPTIONS, maxAge: 0 });

  return response;
}
