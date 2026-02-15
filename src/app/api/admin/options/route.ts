import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

function createAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceRoleKey) throw new Error('Missing Supabase env vars');
  return createClient(supabaseUrl, serviceRoleKey);
}

// GET: Haal optiegroepen + choices
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const businessId = searchParams.get('business_id');
    if (!businessId) return NextResponse.json({ error: 'business_id required' }, { status: 400 });

    const supabase = createAdminClient();

    const { data: groups, error } = await supabase
      .from('option_groups')
      .select('*')
      .eq('business_id', businessId)
      .eq('is_active', true)
      .order('sort_order', { ascending: true });

    if (error) throw error;

    // Haal choices voor elke groep
    const groupsWithChoices = await Promise.all((groups || []).map(async (group) => {
      const { data: choices } = await supabase
        .from('option_choices')
        .select('id, name, price, sort_order')
        .eq('option_group_id', group.id)
        .eq('is_active', true)
        .order('sort_order', { ascending: true });
      
      return { ...group, choices: choices || [] };
    }));

    return NextResponse.json(groupsWithChoices);
  } catch (error) {
    console.error('Options GET error:', error);
    return NextResponse.json({ error: 'Kon opties niet ophalen' }, { status: 500 });
  }
}

// POST: Maak of update optiegroep + choices
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { business_id, id, choices, ...groupData } = body;
    if (!business_id) return NextResponse.json({ error: 'business_id required' }, { status: 400 });

    const supabase = createAdminClient();

    let savedGroup;
    if (id) {
      // Update groep
      const { data, error } = await supabase
        .from('option_groups')
        .update({
          name: groupData.name,
          type: groupData.type || 'multiple',
          required: groupData.required || false,
          sort_order: groupData.sort_order || 0,
        })
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      savedGroup = data;

      // Verwijder oude choices
      await supabase.from('option_choices').delete().eq('option_group_id', id);
    } else {
      // Maak nieuwe groep
      const { data, error } = await supabase
        .from('option_groups')
        .insert({
          business_id,
          name: groupData.name,
          type: groupData.type || 'multiple',
          required: groupData.required || false,
          sort_order: groupData.sort_order || 0,
          is_active: true,
        })
        .select()
        .single();
      if (error) throw error;
      savedGroup = data;
    }

    // Voeg choices toe
    if (savedGroup && choices && choices.length > 0) {
      const choicesData = choices
        .filter((c: { name: string }) => c.name?.trim())
        .map((choice: { name: string; price?: number }, index: number) => ({
          option_group_id: savedGroup.id,
          business_id,
          name: choice.name,
          price: choice.price || 0,
          sort_order: index,
          is_active: true,
        }));
      
      if (choicesData.length > 0) {
        await supabase.from('option_choices').insert(choicesData);
      }
    }

    // Return groep met choices
    const { data: finalChoices } = await supabase
      .from('option_choices')
      .select('id, name, price, sort_order')
      .eq('option_group_id', savedGroup.id)
      .order('sort_order', { ascending: true });

    return NextResponse.json({ ...savedGroup, choices: finalChoices || [] });
  } catch (error) {
    console.error('Options POST error:', error);
    return NextResponse.json({ error: 'Kon optiegroep niet opslaan' }, { status: 500 });
  }
}

// DELETE: Verwijder optiegroep
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const businessId = searchParams.get('business_id');
    if (!id || !businessId) return NextResponse.json({ error: 'id and business_id required' }, { status: 400 });

    const supabase = createAdminClient();

    // Verwijder choices, links, en groep
    await supabase.from('option_choices').delete().eq('option_group_id', id);
    await supabase.from('product_option_links').delete().eq('option_group_id', id);
    const { error } = await supabase.from('option_groups').delete().eq('id', id).eq('business_id', businessId);
    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Options DELETE error:', error);
    return NextResponse.json({ error: 'Kon optiegroep niet verwijderen' }, { status: 500 });
  }
}
