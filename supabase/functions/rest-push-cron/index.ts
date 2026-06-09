import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { buildPushPayload } from 'npm:@block65/webcrypto-web-push@1.0.2';

// Backstop delivery for short-lived scheduled pushes (rest-timer complete).
// The app inserts a row into public.scheduled_pushes with fire_at = rest end.
// On normal completion the app deletes its own row, so this cron only ever
// fires the ones that survived because the device/app was killed. Runs every
// minute, so worst-case latency is ~60s (acceptable tradeoff vs. SW setTimeout
// which dies when the OS reaps the idle service worker).

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SERVICE_ROLE = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const VAPID_PUBLIC = Deno.env.get('VAPID_PUBLIC_KEY')!;
const VAPID_PRIVATE = Deno.env.get('VAPID_PRIVATE_KEY')!;
const VAPID_SUBJECT = Deno.env.get('VAPID_SUBJECT') || 'mailto:alkanzilgir@gmail.com';
const CRON_SECRET = Deno.env.get('CRON_SECRET') || '';
const admin = createClient(SUPABASE_URL, SERVICE_ROLE);

type Sub = { id: string; user_id: string; endpoint: string; p256dh: string; auth: string };

// ttl kept short: a rest-complete alert is useless if delivered minutes late.
async function pushOne(sub: Sub, payload: object, ttl = 180): Promise<number> {
  const vapid = { subject: VAPID_SUBJECT, publicKey: VAPID_PUBLIC, privateKey: VAPID_PRIVATE };
  const pushSubscription = { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } };
  const built: any = await buildPushPayload({ data: JSON.stringify(payload), options: { ttl } }, pushSubscription, vapid);
  const res = await fetch(sub.endpoint, built);
  return res.status;
}

Deno.serve(async (req: Request) => {
  if (!CRON_SECRET) return new Response('forbidden: CRON_SECRET not set', { status: 403 });
  if ((req.headers.get('x-cron-secret') || '') !== CRON_SECRET) return new Response('forbidden', { status: 403 });

  const results: Record<string, number> = { due: 0, sent: 0, pruned: 0, deleted: 0, errors: 0 };
  const errlog: string[] = [];
  try {
    // Drop anything more than 15 min stale so the table never accumulates.
    await admin.from('scheduled_pushes').delete().lt('fire_at', new Date(Date.now() - 15 * 60 * 1000).toISOString());

    // Rows due now (+5s grace), not yet sent.
    const { data: due } = await admin
      .from('scheduled_pushes')
      .select('id, user_id, title, body, tag, url')
      .is('sent_at', null)
      .lte('fire_at', new Date(Date.now() + 5000).toISOString())
      .limit(200);
    if (!due || due.length === 0) return json({ ...results, note: 'nothing due' });
    results.due = due.length;

    const userIds = [...new Set(due.map((d: any) => d.user_id))];
    const { data: subs } = await admin
      .from('push_subscriptions')
      .select('id, user_id, endpoint, p256dh, auth')
      .in('user_id', userIds);
    const byUser = new Map<string, Sub[]>();
    (subs as Sub[] | null || []).forEach((s) => { const a = byUser.get(s.user_id) || []; a.push(s); byUser.set(s.user_id, a); });

    const doneIds: string[] = [];
    for (const item of due as any[]) {
      for (const s of (byUser.get(item.user_id) || [])) {
        try {
          // renotify:false — if the SW already fired the local alert under the
          // same 'rest' tag, this silently replaces it instead of double-buzzing.
          const status = await pushOne(s, { title: item.title, body: item.body, url: item.url || '/', tag: item.tag || 'rest', renotify: false });
          if (status >= 200 && status < 300) results.sent++;
          else if (status === 404 || status === 410) { await admin.from('push_subscriptions').delete().eq('id', s.id); results.pruned++; }
          else { results.errors++; errlog.push(`${status} on ${s.id}`); }
        } catch (e: any) { results.errors++; errlog.push(String(e?.message || e).slice(0, 200)); }
      }
      doneIds.push(item.id);
    }
    if (doneIds.length) { await admin.from('scheduled_pushes').delete().in('id', doneIds); results.deleted = doneIds.length; }
    return json({ ...results, errlog });
  } catch (e: any) {
    return json({ ...results, fatal: String(e?.message || e) }, 500);
  }
});

function json(b: unknown, status = 200) { return new Response(JSON.stringify(b), { status, headers: { 'Content-Type': 'application/json' } }); }
