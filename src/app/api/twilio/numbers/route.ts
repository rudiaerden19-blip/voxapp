import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import Twilio from 'twilio';

const getSupabase = () => createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const getTwilioClient = () => {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  if (!accountSid || !authToken) {
    throw new Error('Twilio credentials not configured');
  }
  return Twilio(accountSid, authToken);
};

// GET - Search available numbers or get business phone numbers
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const businessId = searchParams.get('business_id');
  const action = searchParams.get('action'); // 'search' or 'list'
  const country = searchParams.get('country') || 'BE'; // Default Belgium
  const areaCode = searchParams.get('area_code');

  try {
    // List numbers for a business
    if (action === 'list' && businessId) {
      const supabase = getSupabase();
      const { data, error } = await supabase
        .from('phone_numbers')
        .select('*')
        .eq('business_id', businessId);

      if (error) {
        return NextResponse.json({ error: 'Failed to fetch numbers' }, { status: 500 });
      }

      return NextResponse.json({ numbers: data || [] });
    }

    // Search available numbers to purchase
    if (action === 'search') {
      const client = getTwilioClient();
      
      const searchParams: any = {
        voiceEnabled: true,
      };

      // Handle different country codes
      let numbers;
      if (country === 'BE') {
        numbers = await client.availablePhoneNumbers('BE')
          .local
          .list({ ...searchParams, limit: 10 });
      } else if (country === 'NL') {
        numbers = await client.availablePhoneNumbers('NL')
          .local
          .list({ ...searchParams, limit: 10 });
      } else if (country === 'FR') {
        numbers = await client.availablePhoneNumbers('FR')
          .local
          .list({ ...searchParams, limit: 10 });
      } else if (country === 'DE') {
        numbers = await client.availablePhoneNumbers('DE')
          .local
          .list({ ...searchParams, limit: 10 });
      } else {
        // US/Canada toll-free as fallback
        numbers = await client.availablePhoneNumbers('US')
          .tollFree
          .list({ limit: 10 });
      }

      const available = numbers.map((num: any) => ({
        phone_number: num.phoneNumber,
        friendly_name: num.friendlyName,
        locality: num.locality,
        region: num.region,
        country: country,
        capabilities: {
          voice: num.capabilities?.voice ?? true,
          sms: num.capabilities?.sms ?? false,
        },
      }));

      return NextResponse.json({ available });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });

  } catch (error: any) {
    console.error('Twilio numbers error:', error);
    return NextResponse.json({ 
      error: error.message || 'Failed to fetch numbers',
      details: error.code 
    }, { status: 500 });
  }
}

// POST - Purchase a number and assign to business
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { business_id, phone_number, agent_id } = body;

    if (!business_id || !phone_number) {
      return NextResponse.json({ error: 'business_id and phone_number required' }, { status: 400 });
    }

    const client = getTwilioClient();
    const supabase = getSupabase();

    // 1. Purchase the number from Twilio
    const purchasedNumber = await client.incomingPhoneNumbers.create({
      phoneNumber: phone_number,
      voiceMethod: 'POST',
      // We'll update the webhook URL after we import to ElevenLabs
    });

    // 2. Import to ElevenLabs (if agent_id provided)
    let elevenlabsPhoneId = null;
    if (agent_id) {
      const elevenlabsResponse = await fetch('https://api.elevenlabs.io/v1/convai/phone-numbers', {
        method: 'POST',
        headers: {
          'xi-api-key': process.env.ELEVENLABS_API_KEY!,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phone_number: phone_number,
          provider: 'twilio',
          label: `VoxApp - ${business_id}`,
          agent_id: agent_id,
          // Twilio credentials for native integration
          twilio_account_sid: process.env.TWILIO_ACCOUNT_SID,
          twilio_auth_token: process.env.TWILIO_AUTH_TOKEN,
        }),
      });

      if (elevenlabsResponse.ok) {
        const elevenlabsData = await elevenlabsResponse.json();
        elevenlabsPhoneId = elevenlabsData.phone_number_id;
      } else {
        console.error('ElevenLabs import failed:', await elevenlabsResponse.text());
      }
    }

    // 3. Save to our database
    const { data, error } = await supabase
      .from('phone_numbers')
      .insert({
        business_id,
        phone_number: purchasedNumber.phoneNumber,
        twilio_sid: purchasedNumber.sid,
        elevenlabs_phone_id: elevenlabsPhoneId,
        agent_id: agent_id || null,
        status: 'active',
        country: phone_number.startsWith('+32') ? 'BE' : 
                 phone_number.startsWith('+31') ? 'NL' :
                 phone_number.startsWith('+33') ? 'FR' :
                 phone_number.startsWith('+49') ? 'DE' : 'OTHER',
        monthly_cost: 1.50, // Typical Twilio cost for EU number
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);
      // Try to release the Twilio number if DB fails
      await client.incomingPhoneNumbers(purchasedNumber.sid).remove();
      return NextResponse.json({ error: 'Failed to save number' }, { status: 500 });
    }

    // 4. Update business with primary phone number
    await supabase
      .from('businesses')
      .update({ 
        ai_phone_number: purchasedNumber.phoneNumber,
      } as any)
      .eq('id', business_id);

    return NextResponse.json({
      success: true,
      phone_number: data,
      message: 'Number purchased and configured successfully'
    });

  } catch (error: any) {
    console.error('Purchase number error:', error);
    return NextResponse.json({ 
      error: error.message || 'Failed to purchase number',
      code: error.code 
    }, { status: 500 });
  }
}

// DELETE - Release a phone number
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const numberId = searchParams.get('id');

    if (!numberId) {
      return NextResponse.json({ error: 'id required' }, { status: 400 });
    }

    const supabase = getSupabase();
    const client = getTwilioClient();

    // Get the number details
    const { data: phoneNumber, error: fetchError } = await supabase
      .from('phone_numbers')
      .select('*')
      .eq('id', numberId)
      .single();

    if (fetchError || !phoneNumber) {
      return NextResponse.json({ error: 'Number not found' }, { status: 404 });
    }

    // 1. Remove from ElevenLabs if configured
    if (phoneNumber.elevenlabs_phone_id) {
      await fetch(`https://api.elevenlabs.io/v1/convai/phone-numbers/${phoneNumber.elevenlabs_phone_id}`, {
        method: 'DELETE',
        headers: {
          'xi-api-key': process.env.ELEVENLABS_API_KEY!,
        },
      });
    }

    // 2. Release from Twilio
    if (phoneNumber.twilio_sid) {
      await client.incomingPhoneNumbers(phoneNumber.twilio_sid).remove();
    }

    // 3. Remove from database
    await supabase
      .from('phone_numbers')
      .delete()
      .eq('id', numberId);

    // 4. Clear from business if it was the primary number
    await supabase
      .from('businesses')
      .update({ ai_phone_number: null } as any)
      .eq('ai_phone_number', phoneNumber.phone_number);

    return NextResponse.json({ success: true });

  } catch (error: any) {
    console.error('Delete number error:', error);
    return NextResponse.json({ error: error.message || 'Failed to delete number' }, { status: 500 });
  }
}
