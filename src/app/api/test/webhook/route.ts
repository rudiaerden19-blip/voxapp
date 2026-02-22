import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

// GET - Create test order directly in database
export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabase();
    
    // Get frituur nolim business
    const { data: business, error: bizError } = await supabase
      .from('businesses')
      .select('id, name, type')
      .eq('type', 'frituur')
      .limit(1)
      .single();
    
    if (bizError || !business) {
      // Try to get any business
      const { data: anyBusiness } = await supabase
        .from('businesses')
        .select('id, name, type')
        .limit(1)
        .single();
      
      if (!anyBusiness) {
        return NextResponse.json({ error: 'No business found', bizError }, { status: 404 });
      }
      
      // Create test order for any business
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          business_id: anyBusiness.id,
          customer_name: 'Test Klant',
          customer_phone: '0478123456',
          order_type: 'pickup',
          status: 'pending',
          total_amount: 12.50,
          notes: 'TEST BESTELLING - 2x friet, 1x frikandel',
          source: 'phone',
          created_at: new Date().toISOString(),
        })
        .select()
        .single();
      
      return NextResponse.json({ 
        success: !orderError, 
        business: anyBusiness,
        order,
        error: orderError?.message
      });
    }
    
    // Create test order for frituur
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        business_id: business.id,
        customer_name: 'Test Klant ' + new Date().toLocaleTimeString(),
        customer_phone: '0478123456',
        order_type: 'pickup',
        status: 'pending',
        total_amount: 12.50,
        notes: 'TEST BESTELLING - 2x friet groot, 1x frikandel speciaal, mayo en ketchup',
        source: 'phone',
        created_at: new Date().toISOString(),
      })
      .select()
      .single();
    
    if (orderError) {
      return NextResponse.json({ 
        success: false, 
        business,
        error: orderError.message,
        details: orderError
      }, { status: 500 });
    }
    
    return NextResponse.json({ 
      success: true, 
      message: 'Test order created! Check kitchen screen.',
      business: business.name,
      order 
    });
    
  } catch (error: any) {
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
}

// POST - Simulate ElevenLabs webhook
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Forward to actual webhook handler
    const webhookResponse = await fetch(new URL('/api/webhooks/elevenlabs', request.url), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    
    const result = await webhookResponse.json();
    
    return NextResponse.json({
      webhook_response: result,
      test: true,
    });
    
  } catch (error: any) {
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
}
