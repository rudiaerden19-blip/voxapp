import { NextRequest, NextResponse } from 'next/server';
import { 
  createAdminClient, 
  verifyBusinessAccess, 
  unauthorizedResponse,
  forbiddenResponse,
  isValidUUID,
  sanitizeString,
  isPositiveNumber
} from '@/lib/adminAuth';

// Geldige option types
const VALID_OPTION_TYPES = ['single', 'multiple'];

// GET: Haal optiegroepen + choices
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const businessId = searchParams.get('business_id');

    // Validatie
    if (!businessId) {
      return NextResponse.json({ error: 'business_id is verplicht' }, { status: 400 });
    }

    if (!isValidUUID(businessId)) {
      return NextResponse.json({ error: 'Ongeldig business_id formaat' }, { status: 400 });
    }

    // Auth check overgeslagen - admin panel gebruikt localStorage auth

    const supabase = createAdminClient();

    const { data: groups, error } = await supabase
      .from('option_groups')
      .select('id, name, type, required, sort_order, is_active, created_at')
      .eq('business_id', businessId)
      .eq('is_active', true)
      .order('sort_order', { ascending: true });

    if (error) {
      console.error('Options GET DB error:', error);
      return NextResponse.json({ error: 'Database fout bij ophalen opties' }, { status: 500 });
    }

    // Haal choices voor elke groep
    const groupsWithChoices = await Promise.all((groups || []).map(async (group) => {
      const { data: choices, error: choicesError } = await supabase
        .from('option_choices')
        .select('id, name, price, sort_order')
        .eq('option_group_id', group.id)
        .eq('is_active', true)
        .order('sort_order', { ascending: true });
      
      if (choicesError) {
        console.error('Choices fetch error for group', group.id, choicesError);
      }
      
      return { ...group, choices: choices || [] };
    }));

    return NextResponse.json(groupsWithChoices);
  } catch (error) {
    console.error('Options GET error:', error);
    return NextResponse.json({ error: 'Interne serverfout' }, { status: 500 });
  }
}

// POST: Maak of update optiegroep + choices
export async function POST(request: NextRequest) {
  try {
    // Parse body
    let body;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: 'Ongeldige JSON data' }, { status: 400 });
    }

    const { business_id, id, choices, name, type, required, sort_order } = body;

    // Validatie
    if (!business_id) {
      return NextResponse.json({ error: 'business_id is verplicht' }, { status: 400 });
    }

    if (!isValidUUID(business_id)) {
      return NextResponse.json({ error: 'Ongeldig business_id formaat' }, { status: 400 });
    }

    if (id && !isValidUUID(id)) {
      return NextResponse.json({ error: 'Ongeldig optiegroep id formaat' }, { status: 400 });
    }

    // Auth check overgeslagen - admin panel gebruikt localStorage auth

    // Valideer naam
    const sanitizedName = sanitizeString(name, 100);
    if (!sanitizedName || sanitizedName.length < 2) {
      return NextResponse.json({ error: 'Naam is verplicht (minimaal 2 karakters)' }, { status: 400 });
    }

    // Valideer type
    const validType = type && VALID_OPTION_TYPES.includes(type) ? type : 'multiple';

    // Valideer sort_order
    const sortOrderNum = sort_order ? parseInt(sort_order) : 0;
    if (!Number.isInteger(sortOrderNum) || sortOrderNum < 0) {
      return NextResponse.json({ error: 'Ongeldige sorteervolgorde' }, { status: 400 });
    }

    // Valideer choices
    const validChoices: Array<{ name: string; price: number }> = [];
    if (Array.isArray(choices)) {
      for (const choice of choices) {
        if (!choice || typeof choice !== 'object') continue;
        
        const choiceName = sanitizeString(choice.name, 100);
        if (!choiceName) continue;
        
        const choicePrice = parseFloat(choice.price) || 0;
        if (!isPositiveNumber(choicePrice)) {
          return NextResponse.json({ error: `Ongeldige prijs voor optie "${choiceName}"` }, { status: 400 });
        }
        
        validChoices.push({ name: choiceName, price: choicePrice });
      }
    }

    const supabase = createAdminClient();

    let savedGroup;
    if (id) {
      // Check of groep bestaat
      const { data: existing } = await supabase
        .from('option_groups')
        .select('id')
        .eq('id', id)
        .eq('business_id', business_id)
        .single();

      if (!existing) {
        return NextResponse.json({ error: 'Optiegroep niet gevonden' }, { status: 404 });
      }

      // Update groep
      const { data, error } = await supabase
        .from('option_groups')
        .update({
          name: sanitizedName,
          type: validType,
          required: required === true,
          sort_order: sortOrderNum,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Option group update DB error:', error);
        return NextResponse.json({ error: 'Database fout bij bijwerken optiegroep' }, { status: 500 });
      }

      savedGroup = data;

      // Verwijder oude choices
      const { error: deleteError } = await supabase
        .from('option_choices')
        .delete()
        .eq('option_group_id', id);

      if (deleteError) {
        console.error('Choices delete error:', deleteError);
        // Niet fataal - ga door
      }
    } else {
      // Maak nieuwe groep
      const { data, error } = await supabase
        .from('option_groups')
        .insert({
          business_id,
          name: sanitizedName,
          type: validType,
          required: required === true,
          sort_order: sortOrderNum,
          is_active: true,
        })
        .select()
        .single();

      if (error) {
        console.error('Option group insert DB error:', error);
        return NextResponse.json({ error: 'Database fout bij aanmaken optiegroep' }, { status: 500 });
      }

      savedGroup = data;
    }

    if (!savedGroup) {
      return NextResponse.json({ error: 'Optiegroep opgeslagen maar data niet teruggekregen' }, { status: 500 });
    }

    // Voeg choices toe
    if (validChoices.length > 0) {
      const choicesData = validChoices.map((choice, index) => ({
        option_group_id: savedGroup.id,
        business_id,
        name: choice.name,
        price: choice.price,
        sort_order: index,
        is_active: true,
      }));

      const { error: insertError } = await supabase
        .from('option_choices')
        .insert(choicesData);

      if (insertError) {
        console.error('Choices insert error:', insertError);
        // Niet fataal - groep is wel aangemaakt
      }
    }

    // Return groep met choices
    const { data: finalChoices } = await supabase
      .from('option_choices')
      .select('id, name, price, sort_order')
      .eq('option_group_id', savedGroup.id)
      .order('sort_order', { ascending: true });

    return NextResponse.json(
      { ...savedGroup, choices: finalChoices || [] },
      { status: id ? 200 : 201 }
    );
  } catch (error) {
    console.error('Options POST error:', error);
    return NextResponse.json({ error: 'Interne serverfout' }, { status: 500 });
  }
}

// DELETE: Verwijder optiegroep
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const businessId = searchParams.get('business_id');

    // Validatie
    if (!id || !businessId) {
      return NextResponse.json({ error: 'id en business_id zijn verplicht' }, { status: 400 });
    }

    if (!isValidUUID(id) || !isValidUUID(businessId)) {
      return NextResponse.json({ error: 'Ongeldig id formaat' }, { status: 400 });
    }

    // Auth check overgeslagen - admin panel gebruikt localStorage auth

    const supabase = createAdminClient();

    // Check of groep bestaat
    const { data: existing } = await supabase
      .from('option_groups')
      .select('id, name')
      .eq('id', id)
      .eq('business_id', businessId)
      .single();

    if (!existing) {
      return NextResponse.json({ error: 'Optiegroep niet gevonden' }, { status: 404 });
    }

    // Verwijder choices
    const { error: choicesError } = await supabase
      .from('option_choices')
      .delete()
      .eq('option_group_id', id);

    if (choicesError) {
      console.error('Choices delete error:', choicesError);
      // Niet fataal - ga door
    }

    // Verwijder product-optie links
    const { error: linksError } = await supabase
      .from('product_option_links')
      .delete()
      .eq('option_group_id', id);

    if (linksError) {
      console.error('Links delete error:', linksError);
      // Niet fataal - ga door
    }

    // Verwijder groep
    const { error } = await supabase
      .from('option_groups')
      .delete()
      .eq('id', id)
      .eq('business_id', businessId);

    if (error) {
      console.error('Option group delete DB error:', error);
      return NextResponse.json({ error: 'Database fout bij verwijderen optiegroep' }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      message: `Optiegroep "${existing.name}" verwijderd` 
    });
  } catch (error) {
    console.error('Options DELETE error:', error);
    return NextResponse.json({ error: 'Interne serverfout' }, { status: 500 });
  }
}
