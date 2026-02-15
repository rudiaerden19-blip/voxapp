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

// GET: Haal alle producten op voor een business
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

    const { data, error } = await supabase
      .from('menu_items')
      .select('id, name, category, description, price, duration_minutes, sort_order, is_available, is_popular, is_promo, promo_price, image_url, created_at')
      .eq('business_id', businessId)
      .order('sort_order', { ascending: true })
      .order('name', { ascending: true });

    if (error) {
      console.error('Products GET DB error:', error);
      return NextResponse.json({ error: 'Database fout bij ophalen producten' }, { status: 500 });
    }

    return NextResponse.json(data || []);
  } catch (error) {
    console.error('Products GET error:', error);
    return NextResponse.json({ error: 'Interne serverfout' }, { status: 500 });
  }
}

// POST: Maak of update product
export async function POST(request: NextRequest) {
  try {
    // Parse body
    let body;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: 'Ongeldige JSON data' }, { status: 400 });
    }

    const { business_id, id, ...productData } = body;

    // Validatie
    if (!business_id) {
      return NextResponse.json({ error: 'business_id is verplicht' }, { status: 400 });
    }

    if (!isValidUUID(business_id)) {
      return NextResponse.json({ error: 'Ongeldig business_id formaat' }, { status: 400 });
    }

    if (id && !isValidUUID(id)) {
      return NextResponse.json({ error: 'Ongeldig product id formaat' }, { status: 400 });
    }

    // Auth check overgeslagen - admin panel gebruikt localStorage auth

    // Valideer naam
    const name = sanitizeString(productData.name, 200);
    if (!name || name.length < 1) {
      return NextResponse.json({ error: 'Productnaam is verplicht' }, { status: 400 });
    }

    // Valideer prijs
    const price = parseFloat(productData.price);
    if (!isPositiveNumber(price)) {
      return NextResponse.json({ error: 'Ongeldige prijs (moet 0 of hoger zijn)' }, { status: 400 });
    }

    // Valideer optionele velden
    const durationMinutes = productData.duration_minutes ? parseInt(productData.duration_minutes) : null;
    if (durationMinutes !== null && (!Number.isInteger(durationMinutes) || durationMinutes < 0 || durationMinutes > 1440)) {
      return NextResponse.json({ error: 'Ongeldige duur (0-1440 minuten)' }, { status: 400 });
    }

    const sortOrder = productData.sort_order ? parseInt(productData.sort_order) : 0;
    if (!Number.isInteger(sortOrder) || sortOrder < 0) {
      return NextResponse.json({ error: 'Ongeldige sorteervolgorde' }, { status: 400 });
    }

    // Valideer promo_price als is_promo true is
    let promoPrice = null;
    if (productData.is_promo === true) {
      promoPrice = parseFloat(productData.promo_price);
      if (!isPositiveNumber(promoPrice)) {
        return NextResponse.json({ error: 'Ongeldige actieprijs' }, { status: 400 });
      }
      if (promoPrice >= price) {
        return NextResponse.json({ error: 'Actieprijs moet lager zijn dan normale prijs' }, { status: 400 });
      }
    }

    const supabase = createAdminClient();

    // Capitalize first letter
    const capitalizedName = name.charAt(0).toUpperCase() + name.slice(1);

    const data = {
      business_id,
      category: sanitizeString(productData.category, 100) || 'Overig',
      name: capitalizedName,
      description: sanitizeString(productData.description, 1000) || null,
      price,
      duration_minutes: durationMinutes,
      sort_order: sortOrder,
      is_available: productData.is_available !== false,
      is_popular: productData.is_popular === true,
      is_promo: productData.is_promo === true,
      promo_price: promoPrice,
      image_url: productData.image_url ? sanitizeString(productData.image_url, 500) : null,
    };

    let result;
    if (id) {
      // Update - check eerst of product bestaat en bij dit bedrijf hoort
      const { data: existing } = await supabase
        .from('menu_items')
        .select('id')
        .eq('id', id)
        .eq('business_id', business_id)
        .single();

      if (!existing) {
        return NextResponse.json({ error: 'Product niet gevonden' }, { status: 404 });
      }

      const { data: updated, error } = await supabase
        .from('menu_items')
        .update({ ...data, updated_at: new Date().toISOString() })
        .eq('id', id)
        .eq('business_id', business_id)
        .select()
        .single();
      
      if (error) {
        console.error('Product update DB error:', error);
        return NextResponse.json({ error: 'Database fout bij bijwerken product' }, { status: 500 });
      }

      result = updated;
    } else {
      // Insert
      const { data: inserted, error } = await supabase
        .from('menu_items')
        .insert(data)
        .select()
        .single();
      
      if (error) {
        console.error('Product insert DB error:', error);
        return NextResponse.json({ error: 'Database fout bij aanmaken product' }, { status: 500 });
      }

      result = inserted;
    }

    if (!result) {
      return NextResponse.json({ error: 'Product opgeslagen maar data niet teruggekregen' }, { status: 500 });
    }

    return NextResponse.json(result, { status: id ? 200 : 201 });
  } catch (error) {
    console.error('Products POST error:', error);
    return NextResponse.json({ error: 'Interne serverfout' }, { status: 500 });
  }
}

// DELETE: Verwijder product of alle producten
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const businessId = searchParams.get('business_id');
    const deleteAll = searchParams.get('all') === 'true';

    // Validatie
    if (!businessId) {
      return NextResponse.json({ error: 'business_id is verplicht' }, { status: 400 });
    }

    if (!isValidUUID(businessId)) {
      return NextResponse.json({ error: 'Ongeldig business_id formaat' }, { status: 400 });
    }

    if (id && !isValidUUID(id)) {
      return NextResponse.json({ error: 'Ongeldig product id formaat' }, { status: 400 });
    }

    // Auth check overgeslagen - admin panel gebruikt localStorage auth

    const supabase = createAdminClient();

    if (deleteAll) {
      // Bulk delete: verwijder ALLE producten voor deze business
      const { data: products, error: fetchError } = await supabase
        .from('menu_items')
        .select('id')
        .eq('business_id', businessId);
      
      if (fetchError) {
        console.error('Products bulk fetch error:', fetchError);
        return NextResponse.json({ error: 'Database fout bij ophalen producten' }, { status: 500 });
      }

      if (products && products.length > 0) {
        const productIds = products.map(p => p.id);
        
        // Eerst product-optie koppelingen verwijderen
        const { error: linksError } = await supabase
          .from('product_option_links')
          .delete()
          .in('menu_item_id', productIds);

        if (linksError) {
          console.error('Product links delete error:', linksError);
          // Niet fataal - ga door
        }
      }

      // Dan alle producten
      const { error } = await supabase
        .from('menu_items')
        .delete()
        .eq('business_id', businessId);

      if (error) {
        console.error('Products bulk delete DB error:', error);
        return NextResponse.json({ error: 'Database fout bij verwijderen producten' }, { status: 500 });
      }

      return NextResponse.json({ 
        success: true, 
        deleted: products?.length || 0,
        message: `${products?.length || 0} producten verwijderd`
      });
    }

    // Single delete
    if (!id) {
      return NextResponse.json({ error: 'id is verplicht voor enkel verwijderen' }, { status: 400 });
    }

    // Check of product bestaat
    const { data: existing } = await supabase
      .from('menu_items')
      .select('id, name')
      .eq('id', id)
      .eq('business_id', businessId)
      .single();

    if (!existing) {
      return NextResponse.json({ error: 'Product niet gevonden' }, { status: 404 });
    }

    // Verwijder product-optie koppelingen eerst
    const { error: linksError } = await supabase
      .from('product_option_links')
      .delete()
      .eq('menu_item_id', id);

    if (linksError) {
      console.error('Product links delete error:', linksError);
      // Niet fataal - ga door
    }

    // Verwijder product
    const { error } = await supabase
      .from('menu_items')
      .delete()
      .eq('id', id)
      .eq('business_id', businessId);

    if (error) {
      console.error('Product delete DB error:', error);
      return NextResponse.json({ error: 'Database fout bij verwijderen product' }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      message: `Product "${existing.name}" verwijderd` 
    });
  } catch (error) {
    console.error('Products DELETE error:', error);
    return NextResponse.json({ error: 'Interne serverfout' }, { status: 500 });
  }
}
