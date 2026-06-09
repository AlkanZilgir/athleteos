import Stripe from 'npm:stripe@14.21.0';
import { createClient } from 'jsr:@supabase/supabase-js@2';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};
const json = (b: unknown, s = 200) =>
  new Response(JSON.stringify(b), { status: s, headers: { ...CORS, 'Content-Type': 'application/json' } });

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: CORS });
  if (req.method !== 'POST') return json({ error: 'method_not_allowed' }, 405);

  try {
    const stripeKey = Deno.env.get('STRIPE_SECRET_KEY');
    if (!stripeKey) return json({ error: 'stripe_not_configured' }, 500);
    const stripe = new Stripe(stripeKey, { apiVersion: '2024-06-20' });

    const supaUrl = Deno.env.get('SUPABASE_URL')!;
    const anonKey = Deno.env.get('SUPABASE_ANON_KEY')!;

    const userSupa = createClient(supaUrl, anonKey, {
      global: { headers: { Authorization: req.headers.get('Authorization') ?? '' } },
    });
    const { data: userRes, error: userErr } = await userSupa.auth.getUser();
    if (userErr || !userRes.user) return json({ error: 'unauthenticated' }, 401);

    const { data: profile } = await userSupa
      .from('profiles')
      .select('stripe_customer_id')
      .eq('id', userRes.user.id)
      .maybeSingle();
    if (!profile?.stripe_customer_id) return json({ error: 'no_customer' }, 400);

    const body = await req.json().catch(() => ({}));
    const returnUrl: string = body.returnUrl || Deno.env.get('APP_BASE_URL') || 'http://localhost:8080/index.html';

    const session = await stripe.billingPortal.sessions.create({
      customer: profile.stripe_customer_id,
      return_url: returnUrl,
    });
    return json({ url: session.url });
  } catch (err) {
    console.error('portal error', err);
    return json({ error: String((err as Error).message || err) }, 500);
  }
});
