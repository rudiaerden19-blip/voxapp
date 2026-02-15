import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

// Admin client met service role key (bypass RLS)
function createAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error('Missing Supabase environment variables');
  }

  return createClient(supabaseUrl, serviceRoleKey);
}

// GET: Haal alle producten op voor een business
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const businessId = searchParams.get('business_id');

    if (!businessId) {
      return NextResponse.json({ error: 'business_id required' }, { status: 400 });
    }

    const supabase = createAdminClient();

    const { data, error } = await supabase
      .from('menu_items')
      .select('*')
      .eq('business_id', businessId)
      .order('sort_order', { ascending: true })
      .order('name', { ascending: true });

    if (error) throw error;

    return NextResponse.json(data || []);
  } catch (error) {
    console.error('Products GET error:', error);
    return NextResponse.json({ error: 'Kon producten niet ophalen' }, { status: 500 });
  }
}

// POST: Maak of update product
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { business_id, id, ...productData } = body;

    if (!business_id) {
      return NextResponse.json({ error: 'business_id required' }, { status: 400 });
    }

    const supabase = createAdminClient();

    // Capitalize first letter
    const capitalizedName = productData.name 
      ? productData.name.charAt(0).toUpperCase() + productData.name.slice(1)
      : '';

    const data = {
      business_id,
      category: productData.category || 'Overig',
      name: capitalizedName,
      description: productData.description || null,
      price: productData.price || 0,
      duration_minutes: productData.duration_minutes || null,
      sort_order: productData.sort_order || 0,
      is_available: productData.is_available ?? true,
      is_popular: productData.is_popular ?? false,
      is_promo: productData.is_promo ?? false,
      promo_price: productData.is_promo ? productData.promo_price : null,
      image_url: productData.image_url || null,
    };

    let result;
    if (id) {
      // Update
      const { data: updated, error } = await supabase
        .from('menu_items')
        .update(data)
        .eq('id', id)
        .eq('business_id', business_id)
        .select()
        .single();
      
      if (error) throw error;
      result = updated;
    } else {
      // Insert
      const { data: inserted, error } = await supabase
        .from('menu_items')
        .insert(data)
        .select()
        .single();
      
      if (error) throw error;
      result = inserted;
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('Products POST error:', error);
    return NextResponse.json({ error: 'Kon product niet opslaan' }, { status: 500 });
  }
}

// DELETE: Verwijder product of alle producten
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const businessId = searchParams.get('business_id');
    const deleteAll = searchParams.get('all') === 'true';

    if (!businessId) {
      return NextResponse.json({ error: 'business_id required' }, { status: 400 });
    }

    const supabase = createAdminClient();

    if (deleteAll) {
      // Bulk delete: verwijder ALLE producten voor deze business
      // Eerst alle product-optie koppelingen
      const { data: products } = await supabase
        .from('menu_items')
        .select('id')
        .eq('business_id', businessId);
      
      if (products && products.length > 0) {
        const productIds = products.map(p => p.id);
        await supabase
          .from('product_option_links')
          .delete()
          .in('menu_item_id', productIds);
      }

      // Dan alle producten
      const { error } = await supabase
        .from('menu_items')
        .delete()
        .eq('business_id', businessId);

      if (error) throw error;

      return NextResponse.json({ success: true, deleted: products?.length || 0 });
    }

    // Single delete
    if (!id) {
      return NextResponse.json({ error: 'id required for single delete' }, { status: 400 });
    }

    // Verwijder product-optie koppelingen eerst
    await supabase
      .from('product_option_links')
      .delete()
      .eq('menu_item_id', id);

    // Verwijder product
    const { error } = await supabase
      .from('menu_items')
      .delete()
      .eq('id', id)
      .eq('business_id', businessId);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Products DELETE error:', error);
    return NextResponse.json({ error: 'Kon product niet verwijderen' }, { status: 500 });
  }
}
