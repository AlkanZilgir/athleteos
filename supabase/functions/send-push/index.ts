import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { buildPushPayload } from 'npm:@block65/webcrypto-web-push@1.0.2';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SERVICE_ROLE = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY')!;
const VAPID_PUBLIC = Deno.env.get('VAPID_PUBLIC_KEY')!;
const VAPID_PRIVATE = Deno.env.get('VAPID_PRIVATE_KEY')!;
const VAPID_SUBJECT = Deno.env.get('VAPID_SUBJECT') || 'mailto:alkanzilgir@gmail.com';

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS'
};

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });
  try {
    const auth = req.headers.get('Authorization') || '';
    const jwt = auth.replace(/^Bearer\s+/i, '');
    if (!jwt) return json({ error: 'unauthorized' }, 401);

    const userClient = createClient(SUPABASE_URL, ANON_KEY, { global: { headers: { Authorization: `Bearer ${jwt}` } } });
    const { data: u } = await userClient.auth.getUser();
    const user = u?.user;
    if (!user) return json({ error: 'unauthorized' }, 401);

    const body = await req.json().catch(() => ({}));
    const title = (body.title || 'AthleteOS').toString().slice(0, 100);
    const message = (body.body || '').toString().slice(0, 280);
    const url = (body.url || '/').toString().slice(0, 500);
    const tag = (body.tag || 'aos').toString().slice(0, 60);

    const admin = createClient(SUPABASE_URL, SERVICE_ROLE);
    const { data: subs, error } = await admin
      .from('push_subscriptions')
      .select('id, endpoint, p256dh, auth')
      .eq('user_id', user.id);
    if (error) return json({ error: error.message }, 500);
    if (!subs || subs.length === 0) return json({ sent: 0 });

    const vapid = { subject: VAPID_SUBJECT, publicKey: VAPID_PUBLIC, privateKey: VAPID_PRIVATE };
    const payload = JSON.stringify({ title, body: message, url, tag });
    const stale: string[] = [];
    let sent = 0;
    for (const s of subs as any[]) {
      try {
        const built: any = await buildPushPayload({ data: payload, options: { ttl: 60 * 60 * 24 } }, { endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } }, vapid);
        const res = await fetch(s.endpoint, built);
        if (res.ok) sent++;
        else if (res.status === 404 || res.status === 410) stale.push(s.id);
      } catch (_e) { /* swallow individual */ }
    }
    if (stale.length) await admin.from('push_subscriptions').delete().in('id', stale);
    return json({ sent, pruned: stale.length });
  } catch (e: any) {
    return json({ error: e?.message || 'failed' }, 500);
  }
});

function json(body: unknown, status = 200) { return new Response(JSON.stringify(body), { status, headers: { ...cors, 'Content-Type': 'application/json' } }); }
