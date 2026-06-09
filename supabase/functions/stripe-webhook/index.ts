import Stripe from 'npm:stripe@14.21.0';
import { createClient } from 'jsr:@supabase/supabase-js@2';

const stripeKey = Deno.env.get('STRIPE_SECRET_KEY')!;
const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET')!;
const supaUrl = Deno.env.get('SUPABASE_URL')!;
const svcKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const stripe = new Stripe(stripeKey, { apiVersion: '2024-06-20' });
const admin = createClient(supaUrl, svcKey);

async function findUserIdByCustomer(customerId: string): Promise<string | null> {
  const { data } = await admin
    .from('profiles')
    .select('id')
    .eq('stripe_customer_id', customerId)
    .maybeSingle();
  return data?.id ?? null;
}

async function applySubscription(userId: string, sub: Stripe.Subscription, plan: string | null) {
  const active = sub.status === 'active' || sub.status === 'trialing';
  const until = sub.current_period_end ? new Date(sub.current_period_end * 1000).toISOString() : null;
  const update: Record<string, unknown> = {
    is_premium: active,
    premium_plan: active ? plan ?? null : null,
    premium_until: until,
    stripe_subscription_id: sub.id,
    updated_at: new Date().toISOString(),
  };
  await admin.from('profiles').update(update).eq('id', userId);
}

Deno.serve(async (req) => {
  if (req.method !== 'POST') return new Response('method_not_allowed', { status: 405 });
  const sig = req.headers.get('stripe-signature');
  if (!sig) return new Response('missing_signature', { status: 400 });
  const body = await req.text();

  let event: Stripe.Event;
  try {
    event = await stripe.webhooks.constructEventAsync(body, sig, webhookSecret);
  } catch (err) {
    return new Response('invalid_signature: ' + (err as Error).message, { status: 400 });
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.metadata?.supabase_user_id ?? null;
        const plan = session.metadata?.plan ?? null;
        const customerId = (session.customer as string) ?? null;
        if (!userId) break;

        if (session.mode === 'payment') {
          await admin.from('profiles').update({
            is_premium: true,
            premium_plan: 'lifetime',
            premium_until: null,
            stripe_customer_id: customerId,
            updated_at: new Date().toISOString(),
          }).eq('id', userId);
        } else if (session.mode === 'subscription' && session.subscription) {
          const sub = await stripe.subscriptions.retrieve(session.subscription as string);
          await admin.from('profiles').update({
            stripe_customer_id: customerId,
          }).eq('id', userId);
          await applySubscription(userId, sub, plan);
        }
        break;
      }
      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const sub = event.data.object as Stripe.Subscription;
        const userId = sub.metadata?.supabase_user_id ?? await findUserIdByCustomer(sub.customer as string);
        if (!userId) break;
        const plan = sub.metadata?.plan ?? null;
        await applySubscription(userId, sub, plan);
        break;
      }
      case 'customer.subscription.deleted': {
        const sub = event.data.object as Stripe.Subscription;
        const userId = sub.metadata?.supabase_user_id ?? await findUserIdByCustomer(sub.customer as string);
        if (!userId) break;
        // Preserve lifetime access; otherwise revoke.
        const { data: profile } = await admin
          .from('profiles')
          .select('premium_plan')
          .eq('id', userId)
          .maybeSingle();
        if (profile?.premium_plan === 'lifetime') break;
        await admin.from('profiles').update({
          is_premium: false,
          premium_plan: null,
          premium_until: null,
          stripe_subscription_id: null,
          updated_at: new Date().toISOString(),
        }).eq('id', userId);
        break;
      }
      case 'invoice.payment_failed': {
        // Optional: mark something for follow-up. Keep premium active until subscription is actually cancelled by Stripe.
        break;
      }
    }
    return new Response('ok', { status: 200 });
  } catch (err) {
    console.error('webhook handler error', err);
    return new Response('handler_error: ' + (err as Error).message, { status: 500 });
  }
});
