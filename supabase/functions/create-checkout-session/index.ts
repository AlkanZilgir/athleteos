import Stripe from 'npm:stripe@14.21.0';
import { createClient } from 'jsr:@supabase/supabase-js@2';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS, 'Content-Type': 'application/json' },
  });

// Stripe validates that success_url/cancel_url are syntactically URLs, but it
// does NOT restrict them to the account's own domains. An unvalidated value
// here mints a stripe.com link that redirects wherever the caller likes, which
// is a phishing primitive on our account. Legitimate clients only ever send
// their own location, so anything off our origin is refused.
function safeReturnUrl(candidate: unknown): string {
  const fallback = Deno.env.get('APP_BASE_URL') || 'http://localhost:8080/index.html';
  if (typeof candidate !== 'string' || candidate === '') return fallback;
  try {
    const want = new URL(candidate);
    const base = new URL(fallback);
    if (want.origin !== base.origin) return fallback;
    // Drop any fragment; the caller appends its own #paywall=... marker.
    want.hash = '';
    return want.toString();
  } catch {
    return fallback;
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: CORS });
  if (req.method !== 'POST') return json({ error: 'method_not_allowed' }, 405);

  try {
    const stripeKey = Deno.env.get('STRIPE_SECRET_KEY');
    if (!stripeKey) return json({ error: 'stripe_not_configured' }, 500);
    const stripe = new Stripe(stripeKey, { apiVersion: '2024-06-20' });

    const PRICE_BY_PLAN: Record<string, string | undefined> = {
      monthly: Deno.env.get('STRIPE_PRICE_MONTHLY'),
      yearly: Deno.env.get('STRIPE_PRICE_YEARLY'),
      lifetime: Deno.env.get('STRIPE_PRICE_LIFETIME'),
    };

    const supaUrl = Deno.env.get('SUPABASE_URL')!;
    const anonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const svcKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    const userSupa = createClient(supaUrl, anonKey, {
      global: { headers: { Authorization: req.headers.get('Authorization') ?? '' } },
    });
    const { data: userRes, error: userErr } = await userSupa.auth.getUser();
    if (userErr || !userRes.user) return json({ error: 'unauthenticated' }, 401);
    const user = userRes.user;

    const body = await req.json().catch(() => ({}));
    const plan: string = String(body.plan ?? '');
    // hasOwn, not a bare lookup: PRICE_BY_PLAN is an object literal, so
    // plan="constructor" would otherwise return a truthy prototype member and
    // sail past this guard into a confusing 500 from Stripe.
    const priceId = Object.hasOwn(PRICE_BY_PLAN, plan) ? PRICE_BY_PLAN[plan] : undefined;
    if (!priceId) return json({ error: 'unknown_plan', plan }, 400);

    const admin = createClient(supaUrl, svcKey);
    const { data: profile } = await admin
      .from('profiles')
      .select('stripe_customer_id, name')
      .eq('id', user.id)
      .maybeSingle();

    let customerId = profile?.stripe_customer_id;
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        name: profile?.name || undefined,
        metadata: { supabase_user_id: user.id },
      });
      customerId = customer.id;
      await admin.from('profiles').update({ stripe_customer_id: customerId }).eq('id', user.id);
    }

    const base = safeReturnUrl(body.returnUrl);
    const mode = plan === 'lifetime' ? 'payment' : 'subscription';

    const sessionParams: Stripe.Checkout.SessionCreateParams = {
      customer: customerId,
      mode,
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${base}#paywall=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${base}#paywall=cancel`,
      allow_promotion_codes: true,
      metadata: { supabase_user_id: user.id, plan },
    };
    if (mode === 'subscription' && plan === 'yearly') {
      sessionParams.subscription_data = { trial_period_days: 7, metadata: { supabase_user_id: user.id, plan } };
    } else if (mode === 'subscription') {
      sessionParams.subscription_data = { metadata: { supabase_user_id: user.id, plan } };
    }

    const session = await stripe.checkout.sessions.create(sessionParams);
    return json({ url: session.url, id: session.id });
  } catch (err) {
    console.error('checkout error', err);
    return json({ error: String((err as Error).message || err) }, 500);
  }
});
