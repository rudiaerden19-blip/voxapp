import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';
import { verifyWebhookSecret } from '@/lib/apiAuth';

function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

interface OrderItem {
  product_name: string;
  product_id?: string;
  quantity: number;
  price?: number;
  options?: string[];
  notes?: string;
}

export async function POST(request: NextRequest) {
  const authError = verifyWebhookSecret(request);
  if (authError) return authError;

  try {
    const body = await request.json();
    const {
      business_id,
      customer_name,
      customer_phone,
      customer_address,
      delivery_type, // 'pickup' or 'delivery'
      delivery_time,
      items,
      notes,
    } = body;

    // Validation
    if (!business_id || !customer_name || !customer_phone || !items || items.length === 0) {
      return NextResponse.json({ 
        success: false,
        error: 'Ontbrekende gegevens. Naam, telefoonnummer en bestelling zijn verplicht.' 
      }, { status: 400 });
    }

    if (delivery_type === 'delivery' && !customer_address) {
      return NextResponse.json({ 
        success: false,
        error: 'Voor bezorging is een adres verplicht.' 
      }, { status: 400 });
    }

    const supabase = createAdminClient();

    // Get business info
    const { data: business } = await supabase
      .from('businesses')
      .select('name, delivery_fee, minimum_order')
      .eq('id', business_id)
      .single();

    // Calculate total from items
    let totalAmount = 0;
    const orderItems: OrderItem[] = [];

    for (const item of items) {
      // Try to find product in menu_items to get price
      if (item.product_name) {
        const { data: product } = await supabase
          .from('menu_items')
          .select('id, name, price')
          .eq('business_id', business_id)
          .ilike('name', `%${item.product_name}%`)
          .limit(1)
          .single();

        const itemPrice = item.price || product?.price || 0;
        const quantity = item.quantity || 1;

        orderItems.push({
          product_id: product?.id || null,
          product_name: item.product_name,
          quantity,
          price: itemPrice,
          options: item.options || [],
          notes: item.notes || null,
        });

        totalAmount += itemPrice * quantity;
      }
    }

    // Add delivery fee if applicable
    const deliveryFee = delivery_type === 'delivery' && business?.delivery_fee ? business.delivery_fee : 0;
    totalAmount += deliveryFee;

    // Check minimum order for delivery
    if (delivery_type === 'delivery' && business?.minimum_order && totalAmount < business.minimum_order) {
      return NextResponse.json({
        success: false,
        error: `Het minimale bestelbedrag voor bezorging is €${business.minimum_order.toFixed(2)}. Uw bestelling is €${(totalAmount - deliveryFee).toFixed(2)}.`,
      });
    }

    // Calculate estimated ready time (default 30 min for pickup, 45 min for delivery)
    const now = new Date();
    let estimatedReadyTime: Date;
    
    if (delivery_time) {
      // Parse delivery_time if it's a specific time like "19:30"
      if (delivery_time.includes(':')) {
        const [hours, minutes] = delivery_time.split(':').map(Number);
        estimatedReadyTime = new Date(now);
        estimatedReadyTime.setHours(hours, minutes, 0, 0);
      } else {
        // Add minutes to now (e.g., "30 minuten")
        const mins = parseInt(delivery_time) || (delivery_type === 'delivery' ? 45 : 30);
        estimatedReadyTime = new Date(now.getTime() + mins * 60000);
      }
    } else {
      const defaultMinutes = delivery_type === 'delivery' ? 45 : 30;
      estimatedReadyTime = new Date(now.getTime() + defaultMinutes * 60000);
    }

    // Create the order
    const { data: order, error: insertError } = await supabase
      .from('orders')
      .insert({
        business_id,
        customer_name,
        customer_phone,
        customer_address: customer_address || null,
        delivery_type: delivery_type || 'pickup',
        delivery_time: estimatedReadyTime.toLocaleTimeString('nl-NL', { hour: '2-digit', minute: '2-digit' }),
        items: orderItems,
        notes: notes || null,
        total_amount: totalAmount,
        status: 'new',
        source: 'phone',
        estimated_ready_time: estimatedReadyTime.toISOString(),
      })
      .select()
      .single();

    if (insertError) {
      console.error('Insert order error:', insertError);
      return NextResponse.json({
        success: false,
        error: 'Er ging iets mis bij het plaatsen van de bestelling. Probeer het opnieuw.',
      }, { status: 500 });
    }

    // Build confirmation message
    const itemsText = orderItems.map(item => 
      `${item.quantity}x ${item.product_name}${item.options?.length ? ` (${item.options.join(', ')})` : ''}`
    ).join(', ');

    const timeStr = estimatedReadyTime.toLocaleTimeString('nl-NL', { hour: '2-digit', minute: '2-digit' });

    let confirmationMessage = '';
    if (delivery_type === 'delivery') {
      confirmationMessage = `Uw bestelling (${itemsText}) wordt rond ${timeStr} bezorgd op ${customer_address}. Totaal: €${totalAmount.toFixed(2)}${deliveryFee > 0 ? ` (incl. €${deliveryFee.toFixed(2)} bezorgkosten)` : ''}.`;
    } else {
      confirmationMessage = `Uw bestelling (${itemsText}) is klaar om ${timeStr} voor afhalen. Totaal: €${totalAmount.toFixed(2)}.`;
    }

    return NextResponse.json({
      success: true,
      order_id: order.id,
      order_number: order.order_number,
      confirmation: {
        items: orderItems,
        delivery_type,
        delivery_time: timeStr,
        customer_address: delivery_type === 'delivery' ? customer_address : null,
        total_amount: totalAmount,
        delivery_fee: deliveryFee,
      },
      message: confirmationMessage,
    });

  } catch (error) {
    console.error('Create order error:', error);
    return NextResponse.json({ 
      success: false,
      error: 'Server error' 
    }, { status: 500 });
  }
}
