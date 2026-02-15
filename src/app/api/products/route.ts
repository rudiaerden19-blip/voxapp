import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase';

export interface Product {
  id?: string;
  business_id: string;
  category: string;
  name: string;
  description?: string;
  price: number;
  duration_minutes?: number; // Voor kappers/diensten
  sort_order?: number;
  is_available?: boolean;
  is_popular?: boolean;
  is_promo?: boolean;
  promo_price?: number;
  image_url?: string;
}

// GET: Haal alle producten op voor het bedrijf
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

    // Haal producten op
    const { data: products, error } = await supabase
      .from('menu_items')
      .select('*')
      .eq('business_id', business.id)
      .order('sort_order', { ascending: true })
      .order('name', { ascending: true });

    if (error) throw error;

    return NextResponse.json(products || []);
  } catch (error) {
    console.error('Products GET error:', error);
    return NextResponse.json({ error: 'Kon producten niet ophalen' }, { status: 500 });
  }
}

// POST: Maak nieuw product of update bestaand
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Niet ingelogd' }, { status: 401 });
    }

    const body = await request.json();
    const product: Product = body;

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
    if (product.id) {
      const { data: existing } = await supabase
        .from('menu_items')
        .select('business_id')
        .eq('id', product.id)
        .single();
      
      if (existing && existing.business_id !== business.id) {
        return NextResponse.json({ error: 'Geen toegang' }, { status: 403 });
      }
    }

    const productData = {
      business_id: business.id,
      category: product.category || 'Overig',
      name: product.name,
      description: product.description || null,
      price: product.price,
      duration_minutes: product.duration_minutes || null,
      sort_order: product.sort_order || 0,
      is_available: product.is_available ?? true,
      is_popular: product.is_popular ?? false,
      is_promo: product.is_promo ?? false,
      promo_price: product.is_promo ? product.promo_price : null,
      image_url: product.image_url || null,
    };

    let result;
    if (product.id) {
      // Update
      const { data, error } = await supabase
        .from('menu_items')
        .update(productData)
        .eq('id', product.id)
        .select()
        .single();
      
      if (error) throw error;
      result = data;
    } else {
      // Insert
      const { data, error } = await supabase
        .from('menu_items')
        .insert(productData)
        .select()
        .single();
      
      if (error) throw error;
      result = data;
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('Products POST error:', error);
    return NextResponse.json({ error: 'Kon product niet opslaan' }, { status: 500 });
  }
}

// DELETE: Verwijder product
export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Niet ingelogd' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const productId = searchParams.get('id');

    if (!productId) {
      return NextResponse.json({ error: 'Product ID vereist' }, { status: 400 });
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

    // Verwijder product (RLS zorgt voor beveiliging)
    const { error } = await supabase
      .from('menu_items')
      .delete()
      .eq('id', productId)
      .eq('business_id', business.id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Products DELETE error:', error);
    return NextResponse.json({ error: 'Kon product niet verwijderen' }, { status: 500 });
  }
}
