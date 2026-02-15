import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase';

// GET: Haal gekoppelde optiegroepen op voor een product
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Niet ingelogd' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const productId = searchParams.get('product_id');

    if (!productId) {
      return NextResponse.json({ error: 'Product ID vereist' }, { status: 400 });
    }

    // Haal gekoppelde optiegroep IDs op
    const { data: links, error } = await supabase
      .from('product_option_links')
      .select('option_group_id')
      .eq('menu_item_id', productId);

    if (error) throw error;

    const optionGroupIds = (links || []).map(l => l.option_group_id);

    return NextResponse.json(optionGroupIds);
  } catch (error) {
    console.error('Product options GET error:', error);
    return NextResponse.json({ error: 'Kon gekoppelde opties niet ophalen' }, { status: 500 });
  }
}

// POST: Update gekoppelde optiegroepen voor een product
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Niet ingelogd' }, { status: 401 });
    }

    const body = await request.json();
    const { product_id, option_group_ids } = body;

    if (!product_id) {
      return NextResponse.json({ error: 'Product ID vereist' }, { status: 400 });
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

    // Verifieer dat product bij dit bedrijf hoort
    const { data: product } = await supabase
      .from('menu_items')
      .select('business_id')
      .eq('id', product_id)
      .single();

    if (!product || product.business_id !== business.id) {
      return NextResponse.json({ error: 'Geen toegang tot dit product' }, { status: 403 });
    }

    // Verwijder bestaande koppelingen
    await supabase
      .from('product_option_links')
      .delete()
      .eq('menu_item_id', product_id);

    // Voeg nieuwe koppelingen toe
    if (option_group_ids && option_group_ids.length > 0) {
      const linksToInsert = option_group_ids.map((groupId: string) => ({
        menu_item_id: product_id,
        option_group_id: groupId,
        business_id: business.id,
      }));

      const { error } = await supabase
        .from('product_option_links')
        .insert(linksToInsert);

      if (error) throw error;
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Product options POST error:', error);
    return NextResponse.json({ error: 'Kon opties niet koppelen' }, { status: 500 });
  }
}
