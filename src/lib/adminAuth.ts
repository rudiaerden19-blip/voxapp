import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

// Admin user IDs (jouw account en toekomstige admins)
const ADMIN_USER_IDS = [
  'e2ea6530-0c7a-48fd-a0df-3c404ca08753', // Rudi
];

// Admin credentials for cookie-based auth
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@voxapp.tech';

// Create admin Supabase client
export function createAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error('Missing Supabase environment variables');
  }
  
  return createClient(supabaseUrl, serviceRoleKey);
}

// Create regular Supabase client for auth checks
function createAuthClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  if (!supabaseUrl || !anonKey) {
    throw new Error('Missing Supabase environment variables');
  }
  
  return createClient(supabaseUrl, anonKey);
}

// Extract auth token from request cookies
function getAuthToken(request: NextRequest): string | null {
  // Check Authorization header first
  const authHeader = request.headers.get('authorization');
  if (authHeader?.startsWith('Bearer ')) {
    return authHeader.slice(7);
  }
  
  // Check for Supabase auth cookies (format: sb-<project-ref>-auth-token)
  const cookies = request.cookies;
  
  // Try common Supabase cookie patterns
  for (const cookie of cookies.getAll()) {
    if (cookie.name.startsWith('sb-') && cookie.name.endsWith('-auth-token')) {
      try {
        // The cookie value is a JSON object with access_token
        const parsed = JSON.parse(cookie.value);
        if (parsed.access_token) {
          return parsed.access_token;
        }
      } catch {
        // If it's not JSON, try using it directly
        if (cookie.value) {
          return cookie.value;
        }
      }
    }
  }
  
  // Also try the old format
  const accessToken = cookies.get('sb-access-token')?.value;
  if (accessToken) return accessToken;
  
  // Try supabase-auth-token
  const supabaseAuth = cookies.get('supabase-auth-token')?.value;
  if (supabaseAuth) {
    try {
      const parsed = JSON.parse(supabaseAuth);
      return parsed.access_token || parsed[0]?.access_token;
    } catch {
      return supabaseAuth;
    }
  }
  
  return null;
}

// Verify user is authenticated and is admin
export async function verifyAdmin(request: NextRequest): Promise<{
  isAdmin: boolean;
  userId: string | null;
  error: string | null;
}> {
  try {
    const token = getAuthToken(request);
    
    if (!token) {
      return { isAdmin: false, userId: null, error: 'Niet ingelogd' };
    }
    
    const supabase = createAuthClient();
    const { data: { user }, error } = await supabase.auth.getUser(token);
    
    if (error || !user) {
      return { isAdmin: false, userId: null, error: 'Ongeldige sessie' };
    }
    
    // Check if user is admin
    if (!ADMIN_USER_IDS.includes(user.id)) {
      return { isAdmin: false, userId: user.id, error: 'Geen admin rechten' };
    }
    
    return { isAdmin: true, userId: user.id, error: null };
  } catch (err) {
    console.error('Admin auth error:', err);
    return { isAdmin: false, userId: null, error: 'Authenticatie fout' };
  }
}

// Verify user owns the business or is admin
export async function verifyBusinessAccess(
  request: NextRequest,
  businessId: string
): Promise<{
  hasAccess: boolean;
  userId: string | null;
  isAdmin: boolean;
  error: string | null;
}> {
  try {
    const token = getAuthToken(request);
    
    if (!token) {
      return { hasAccess: false, userId: null, isAdmin: false, error: 'Niet ingelogd' };
    }
    
    const supabase = createAuthClient();
    const { data: { user }, error } = await supabase.auth.getUser(token);
    
    if (error || !user) {
      return { hasAccess: false, userId: null, isAdmin: false, error: 'Ongeldige sessie' };
    }
    
    // Admin has access to everything
    if (ADMIN_USER_IDS.includes(user.id)) {
      return { hasAccess: true, userId: user.id, isAdmin: true, error: null };
    }
    
    // Check if user owns the business
    const adminSupabase = createAdminClient();
    const { data: business } = await adminSupabase
      .from('businesses')
      .select('user_id')
      .eq('id', businessId)
      .single();
    
    if (!business) {
      return { hasAccess: false, userId: user.id, isAdmin: false, error: 'Bedrijf niet gevonden' };
    }
    
    if (business.user_id !== user.id) {
      return { hasAccess: false, userId: user.id, isAdmin: false, error: 'Geen toegang tot dit bedrijf' };
    }
    
    return { hasAccess: true, userId: user.id, isAdmin: false, error: null };
  } catch (err) {
    console.error('Business access auth error:', err);
    return { hasAccess: false, userId: null, isAdmin: false, error: 'Authenticatie fout' };
  }
}

// Verify admin from HTTP-only session cookies (standalone admin auth)
export function verifyAdminCookie(request: NextRequest): {
  isAdmin: boolean;
  email: string | null;
  error: string | null;
} {
  try {
    const sessionToken = request.cookies.get('voxapp_admin_session')?.value;
    const adminEmail = request.cookies.get('voxapp_admin_email')?.value;

    if (!sessionToken || !adminEmail) {
      return { isAdmin: false, email: null, error: 'Geen admin sessie' };
    }

    // Verify token format (SHA256 = 64 hex chars)
    if (sessionToken.length !== 64) {
      return { isAdmin: false, email: null, error: 'Ongeldige sessie token' };
    }

    // Verify it's our admin email
    if (adminEmail !== ADMIN_EMAIL) {
      return { isAdmin: false, email: null, error: 'Geen admin rechten' };
    }

    return { isAdmin: true, email: adminEmail, error: null };
  } catch (err) {
    console.error('Admin cookie verification error:', err);
    return { isAdmin: false, email: null, error: 'Verificatie fout' };
  }
}

// Helper to return unauthorized response
export function unauthorizedResponse(error: string): NextResponse {
  return NextResponse.json({ error }, { status: 401 });
}

// Helper to return forbidden response
export function forbiddenResponse(error: string): NextResponse {
  return NextResponse.json({ error }, { status: 403 });
}

// Validate UUID format
export function isValidUUID(str: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(str);
}

// Validate email format
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Validate phone format (basic)
export function isValidPhone(phone: string): boolean {
  // Allow digits, spaces, dashes, plus, parentheses
  const phoneRegex = /^[\d\s\-+()]{6,20}$/;
  return phoneRegex.test(phone);
}

// Sanitize string input
export function sanitizeString(str: string | null | undefined, maxLength = 500): string {
  if (!str) return '';
  return str.trim().slice(0, maxLength);
}

// Validate positive number
export function isPositiveNumber(num: number | null | undefined): boolean {
  return typeof num === 'number' && !isNaN(num) && num >= 0;
}
