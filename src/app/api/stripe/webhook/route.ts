import { NextRequest, NextResponse } from 'next/server';
import { getStripe } from '@/lib/stripe';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import Stripe from 'stripe';

// Lazy initialization for Supabase admin client
let supabaseAdminInstance: SupabaseClient | null = null;

function getSupabaseAdmin(): SupabaseClient {
  if (!supabaseAdminInstance) {
    supabaseAdminInstance = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
  }
  return supabaseAdminInstance;
}

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get('stripe-signature');

  if (!signature) {
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 });
  }

  const stripe = getStripe();
  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const businessId = session.metadata?.businessId;
        const customerId = session.customer as string;
        const subscriptionId = session.subscription as string;

        if (businessId) {
          await getSupabaseAdmin()
            .from('businesses')
            .update({
              subscription_status: 'trial',
              stripe_customer_id: customerId,
              stripe_subscription_id: subscriptionId,
            })
            .eq('id', businessId);
        }
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        const businessId = subscription.metadata?.businessId;
        
        let status = 'inactive';
        if (subscription.status === 'active') status = 'active';
        else if (subscription.status === 'trialing') status = 'trial';
        else if (subscription.status === 'past_due') status = 'past_due';
        else if (subscription.status === 'canceled') status = 'canceled';

        if (businessId) {
          await getSupabaseAdmin()
            .from('businesses')
            .update({ subscription_status: status })
            .eq('id', businessId);
        }
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        const businessId = subscription.metadata?.businessId;

        if (businessId) {
          await getSupabaseAdmin()
            .from('businesses')
            .update({ subscription_status: 'canceled' })
            .eq('id', businessId);
        }
        break;
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice;
        const subscriptionId = (invoice as any).subscription as string | null;
        
        // Update subscription status to active after successful payment
        if (subscriptionId) {
          const subscription = await stripe.subscriptions.retrieve(subscriptionId);
          const businessId = subscription.metadata?.businessId;
          
          if (businessId) {
            await getSupabaseAdmin()
              .from('businesses')
              .update({ subscription_status: 'active' })
              .eq('id', businessId);
          }
        }
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        const subscriptionId = (invoice as any).subscription as string | null;
        
        if (subscriptionId) {
          const subscription = await stripe.subscriptions.retrieve(subscriptionId);
          const businessId = subscription.metadata?.businessId;
          
          if (businessId) {
            await getSupabaseAdmin()
              .from('businesses')
              .update({ subscription_status: 'past_due' })
              .eq('id', businessId);
          }
        }
        break;
      }
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error('Webhook handler error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
