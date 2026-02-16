import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import crypto from 'crypto';

// Admin credentials - in production, use environment variables
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@voxapp.tech';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'VoxAdmin2024!';
const ADMIN_SESSION_SECRET = process.env.ADMIN_SESSION_SECRET || 'voxapp-admin-secret-key-2024';

// Generate a secure session token
function generateSessionToken(email: string): string {
  const data = `${email}:${Date.now()}:${ADMIN_SESSION_SECRET}`;
  return crypto.createHash('sha256').update(data).digest('hex');
}

// Verify session token
function verifySessionToken(token: string, email: string): boolean {
  // For simplicity, we just check if the token exists and matches format
  // In production, you'd want to store sessions in a database with expiry
  return token && token.length === 64; // SHA256 produces 64 hex chars
}

// POST - Login
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    // Verify credentials
    if (email !== ADMIN_EMAIL || password !== ADMIN_PASSWORD) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    // Generate session token
    const sessionToken = generateSessionToken(email);

    // Create response with session cookie
    const response = NextResponse.json({ 
      success: true, 
      message: 'Admin login successful' 
    });

    // Set HTTP-only cookie (more secure than localStorage)
    const cookieStore = await cookies();
    cookieStore.set('voxapp_admin_session', sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24, // 24 hours
      path: '/',
    });

    cookieStore.set('voxapp_admin_email', email, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24,
      path: '/',
    });

    return response;

  } catch (error: any) {
    console.error('Admin login error:', error);
    return NextResponse.json({ error: 'Login failed' }, { status: 500 });
  }
}

// GET - Check session
export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get('voxapp_admin_session')?.value;
    const adminEmail = cookieStore.get('voxapp_admin_email')?.value;

    if (!sessionToken || !adminEmail) {
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }

    if (!verifySessionToken(sessionToken, adminEmail)) {
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }

    return NextResponse.json({ 
      authenticated: true, 
      email: adminEmail 
    });

  } catch (error: any) {
    console.error('Admin session check error:', error);
    return NextResponse.json({ authenticated: false }, { status: 500 });
  }
}

// DELETE - Logout
export async function DELETE(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    
    cookieStore.delete('voxapp_admin_session');
    cookieStore.delete('voxapp_admin_email');

    return NextResponse.json({ success: true, message: 'Logged out' });

  } catch (error: any) {
    console.error('Admin logout error:', error);
    return NextResponse.json({ error: 'Logout failed' }, { status: 500 });
  }
}
