import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase';

export interface OptionChoice {
  id?: string;
  option_group_id?: string;
  business_id?: string;
  name: string;
  price: number;
  sort_order?: number;
  is_active?: boolean;
}

export interface OptionGroup {
  id?: string;
  business_id?: string;
  name: string;
  type: 'single' | 'multiple';
  required: boolean;
  sort_order?: number;
  is_active?: boolean;
  choices?: OptionChoice[];
}

// GET: Haal alle optiegroepen op met hun keuzes
export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Niet ingelogd' }, { status: 401 });
    }

    // Haal business_id op
    const { data: business } = await supabase
      .from('businesses')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (!business) {
      return NextResponse.json({ error: 'Geen bedrijf gevonden' }, { status: 404 });
    }

    // Haal optiegroepen op
    const { data: groups, error: groupsError } = await supabase
      .from('option_groups')
      .select('*')
      .eq('business_id', business.id)
      .eq('is_active', true)
      .order('sort_order', { ascending: true });

    if (groupsError) throw groupsError;

    // Haal alle keuzes op voor deze groepen
    const groupIds = (groups || []).map(g => g.id);
    
    let choices: OptionChoice[] = [];
    if (groupIds.length > 0) {
      const { data: choicesData, error: choicesError } = await supabase
        .from('option_choices')
        .select('*')
        .in('option_group_id', groupIds)
        .eq('is_active', true)
        .order('sort_order', { ascending: true });

      if (choicesError) throw choicesError;
      choices = choicesData || [];
    }

    // Combineer groepen met hun keuzes
    const result = (groups || []).map(group => ({
      ...group,
      choices: choices.filter(c => c.option_group_id === group.id)
    }));

    return NextResponse.json(result);
  } catch (error) {
    console.error('Options GET error:', error);
    return NextResponse.json({ error: 'Kon opties niet ophalen' }, { status: 500 });
  }
}

// POST: Maak/update optiegroep met keuzes
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Niet ingelogd' }, { status: 401 });
    }

    const body: OptionGroup = await request.json();

    // Haal business_id op
    const { data: business } = await supabase
      .from('businesses')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (!business) {
      return NextResponse.json({ error: 'Geen bedrijf gevonden' }, { status: 404 });
    }

    const groupData = {
      business_id: business.id,
      name: body.name,
      type: body.type || 'multiple',
      required: body.required ?? false,
      sort_order: body.sort_order || 0,
      is_active: body.is_active ?? true,
    };

    let groupId: string;

    if (body.id) {
      // Update bestaande groep
      const { data, error } = await supabase
        .from('option_groups')
        .update(groupData)
        .eq('id', body.id)
        .eq('business_id', business.id)
        .select()
        .single();
      
      if (error) throw error;
      groupId = data.id;
    } else {
      // Maak nieuwe groep
      const { data, error } = await supabase
        .from('option_groups')
        .insert(groupData)
        .select()
        .single();
      
      if (error) throw error;
      groupId = data.id;
    }

    // Verwerk keuzes
    if (body.choices && body.choices.length > 0) {
      // Verwijder oude keuzes voor deze groep
      await supabase
        .from('option_choices')
        .delete()
        .eq('option_group_id', groupId);

      // Voeg nieuwe keuzes toe
      const choicesToInsert = body.choices
        .filter(c => c.name && c.name.trim())
        .map((choice, index) => ({
          option_group_id: groupId,
          business_id: business.id,
          name: choice.name.trim(),
          price: choice.price || 0,
          sort_order: index,
          is_active: true,
        }));

      if (choicesToInsert.length > 0) {
        const { error: choicesError } = await supabase
          .from('option_choices')
          .insert(choicesToInsert);
        
        if (choicesError) throw choicesError;
      }
    }

    // Haal volledige groep op met keuzes
    const { data: finalGroup } = await supabase
      .from('option_groups')
      .select('*')
      .eq('id', groupId)
      .single();

    const { data: finalChoices } = await supabase
      .from('option_choices')
      .select('*')
      .eq('option_group_id', groupId)
      .order('sort_order', { ascending: true });

    return NextResponse.json({
      ...finalGroup,
      choices: finalChoices || []
    });
  } catch (error) {
    console.error('Options POST error:', error);
    return NextResponse.json({ error: 'Kon optiegroep niet opslaan' }, { status: 500 });
  }
}

// DELETE: Verwijder optiegroep
export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Niet ingelogd' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const groupId = searchParams.get('id');

    if (!groupId) {
      return NextResponse.json({ error: 'Optiegroep ID vereist' }, { status: 400 });
    }

    // Verifieer eigenaarschap
    const { data: business } = await supabase
      .from('businesses')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (!business) {
      return NextResponse.json({ error: 'Geen bedrijf gevonden' }, { status: 404 });
    }

    // Verwijder keuzes eerst (cascade zou dit ook doen, maar expliciet is beter)
    await supabase
      .from('option_choices')
      .delete()
      .eq('option_group_id', groupId);

    // Verwijder groep
    const { error } = await supabase
      .from('option_groups')
      .delete()
      .eq('id', groupId)
      .eq('business_id', business.id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Options DELETE error:', error);
    return NextResponse.json({ error: 'Kon optiegroep niet verwijderen' }, { status: 500 });
  }
}
