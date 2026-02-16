import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Health check endpoint for E2E testing and monitoring

interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  checks: {
    name: string;
    status: 'pass' | 'fail' | 'warn';
    message?: string;
    latency_ms?: number;
  }[];
  version?: string;
}

export async function GET(request: NextRequest) {
  const checks: HealthStatus['checks'] = [];
  let overallStatus: HealthStatus['status'] = 'healthy';

  // Check 1: Environment variables
  const envCheck = checkEnvironmentVariables();
  checks.push(envCheck);
  if (envCheck.status === 'fail') overallStatus = 'unhealthy';

  // Check 2: Supabase connection
  const supabaseCheck = await checkSupabase();
  checks.push(supabaseCheck);
  if (supabaseCheck.status === 'fail') overallStatus = 'unhealthy';
  else if (supabaseCheck.status === 'warn') overallStatus = 'degraded';

  // Check 3: ElevenLabs API
  const elevenlabsCheck = await checkElevenLabs();
  checks.push(elevenlabsCheck);
  if (elevenlabsCheck.status === 'fail') {
    if (overallStatus === 'healthy') overallStatus = 'degraded';
  }

  const response: HealthStatus = {
    status: overallStatus,
    timestamp: new Date().toISOString(),
    checks,
    version: process.env.npm_package_version || '1.0.0',
  };

  const httpStatus = overallStatus === 'healthy' ? 200 : 
                     overallStatus === 'degraded' ? 200 : 503;

  return NextResponse.json(response, { status: httpStatus });
}

function checkEnvironmentVariables(): HealthStatus['checks'][0] {
  const required = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'SUPABASE_SERVICE_ROLE_KEY',
    'ELEVENLABS_API_KEY',
  ];

  const missing = required.filter(key => !process.env[key]);

  if (missing.length === 0) {
    return { name: 'environment', status: 'pass', message: 'All required env vars present' };
  } else {
    return { 
      name: 'environment', 
      status: 'fail', 
      message: `Missing: ${missing.join(', ')}` 
    };
  }
}

async function checkSupabase(): Promise<HealthStatus['checks'][0]> {
  const start = Date.now();
  
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseKey) {
      return { name: 'supabase', status: 'fail', message: 'Missing credentials' };
    }

    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Simple query to test connection
    const { error } = await supabase.from('businesses').select('id').limit(1);
    const latency = Date.now() - start;

    if (error) {
      return { 
        name: 'supabase', 
        status: 'fail', 
        message: error.message,
        latency_ms: latency,
      };
    }

    return { 
      name: 'supabase', 
      status: latency > 5000 ? 'warn' : 'pass',
      message: latency > 5000 ? 'High latency' : 'Connected',
      latency_ms: latency,
    };
  } catch (error: any) {
    return { 
      name: 'supabase', 
      status: 'fail', 
      message: error.message,
      latency_ms: Date.now() - start,
    };
  }
}

async function checkElevenLabs(): Promise<HealthStatus['checks'][0]> {
  const start = Date.now();
  
  try {
    const apiKey = process.env.ELEVENLABS_API_KEY;

    if (!apiKey) {
      return { name: 'elevenlabs', status: 'warn', message: 'API key not configured' };
    }

    // Check ElevenLabs API (just get user info)
    const response = await fetch('https://api.elevenlabs.io/v1/user', {
      headers: { 'xi-api-key': apiKey },
    });

    const latency = Date.now() - start;

    if (response.ok) {
      return { 
        name: 'elevenlabs', 
        status: latency > 3000 ? 'warn' : 'pass',
        message: latency > 3000 ? 'High latency' : 'Connected',
        latency_ms: latency,
      };
    } else {
      return { 
        name: 'elevenlabs', 
        status: 'warn', 
        message: `HTTP ${response.status}`,
        latency_ms: latency,
      };
    }
  } catch (error: any) {
    return { 
      name: 'elevenlabs', 
      status: 'warn', 
      message: error.message,
      latency_ms: Date.now() - start,
    };
  }
}
