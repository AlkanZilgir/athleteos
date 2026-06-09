import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { buildPushPayload } from 'npm:@block65/webcrypto-web-push@1.0.2';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SERVICE_ROLE = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const VAPID_PUBLIC = Deno.env.get('VAPID_PUBLIC_KEY')!;
const VAPID_PRIVATE = Deno.env.get('VAPID_PRIVATE_KEY')!;
const VAPID_SUBJECT = Deno.env.get('VAPID_SUBJECT') || 'mailto:alkanzilgir@gmail.com';
const CRON_SECRET = Deno.env.get('CRON_SECRET') || '';
const admin = createClient(SUPABASE_URL, SERVICE_ROLE);

type DbSub = { id: string; user_id: string; endpoint: string; p256dh: string; auth: string };
type Due = { kind: string; title: string; body: string; url?: string };

async function pushOne(sub: { endpoint: string; p256dh: string; auth: string }, payload: object, ttl = 60 * 60 * 12): Promise<number> {
  const vapid = { subject: VAPID_SUBJECT, publicKey: VAPID_PUBLIC, privateKey: VAPID_PRIVATE };
  const pushSubscription = { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } };
  const message = { data: JSON.stringify(payload), options: { ttl } };
  const built: any = await buildPushPayload(message, pushSubscription, vapid);
  const res = await fetch(sub.endpoint, built);
  return res.status;
}

Deno.serve(async (req: Request) => {
  if (!CRON_SECRET) return new Response('forbidden: CRON_SECRET not set', { status: 403 });
  if ((req.headers.get('x-cron-secret') || '') !== CRON_SECRET) return new Response('forbidden', { status: 403 });

  const debug = req.headers.get('x-debug-force') === '1';
  const debugUser = req.headers.get('x-debug-user') || '';
  const debugKind = req.headers.get('x-debug-kind') || 'debug';
  const results: Record<string, number> = { workout: 0, protein: 0, streak_save: 0, re_engage: 0, weekly_recap: 0, debug: 0, pruned: 0, errors: 0 };
  const errlog: string[] = [];
  try {
    const { data: subs } = await admin.from('push_subscriptions').select('id, user_id, endpoint, p256dh, auth');
    if (!subs || subs.length === 0) return json({ ...results, note: 'no subs' });
    const byUser = new Map<string, DbSub[]>();
    for (const s of subs as DbSub[]) { const a = byUser.get(s.user_id) || []; a.push(s); byUser.set(s.user_id, a); }
    const userIds = [...byUser.keys()].filter(u => !debugUser || u === debugUser);
    if (userIds.length === 0) return json({ ...results, note: 'no matching users' });
    const { data: profilesData } = await admin
      .from('profiles')
      .select('id, timezone, notif_workout, notif_protein, notif_workout_time, notif_protein_time, protein_goal')
      .in('id', userIds);
    const profiles = new Map<string, any>();
    (profilesData || []).forEach((p: any) => profiles.set(p.id, p));

    for (const uid of userIds) {
      try {
        const prof = profiles.get(uid) || {};
        const local = localParts(prof.timezone || 'UTC');
        const today = local.ymd;
        const due: Due[] = debug
          ? [{ kind: debugKind, title: 'Cron alive 🔔', body: 'Notifications cron is wired and healthy.', url: '/' }]
          : await whatToSend(uid, prof, local, today);
        for (const item of due) {
          if (!debug) { const ok = await tryClaim(uid, item.kind, today); if (!ok) continue; }
          for (const s of (byUser.get(uid) || [])) {
            try {
              const status = await pushOne(s, { title: item.title, body: item.body, url: item.url || '/', tag: item.kind });
              if (status >= 200 && status < 300) results[item.kind] = (results[item.kind] || 0) + 1;
              else if (status === 404 || status === 410) { await admin.from('push_subscriptions').delete().eq('id', s.id); results.pruned++; }
              else { results.errors++; errlog.push(`${status} on ${s.id}`); }
            } catch (e: any) { results.errors++; errlog.push(String(e?.message || e).slice(0, 200)); }
          }
        }
      } catch (e: any) { results.errors++; errlog.push(`user ${uid}: ${String(e?.message || e).slice(0, 200)}`); }
    }
    return json({ ...results, errlog });
  } catch (e: any) {
    return json({ ...results, fatal: String(e?.message || e) }, 500);
  }
});

function json(b: unknown, status = 200) { return new Response(JSON.stringify(b), { status, headers: { 'Content-Type': 'application/json' } }); }
function localParts(tz: string) {
  const fmt = new Intl.DateTimeFormat('en-US', { timeZone: tz, hour12: false, weekday: 'short', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' });
  const p = fmt.formatToParts(new Date()).reduce<Record<string, string>>((a, x) => { a[x.type] = x.value; return a; }, {});
  return { ymd: `${p.year}-${p.month}-${p.day}`, hour: parseInt(p.hour, 10), minute: parseInt(p.minute, 10), weekday: p.weekday };
}
function parseHHMM(s: string | null) { if (!s) return null; const m = s.match(/^(\d{1,2}):(\d{2})$/); return m ? { h: +m[1], m: +m[2] } : null; }
function withinWindow(l: { hour: number; minute: number }, t: { h: number; m: number }, w: number) { const d = (l.hour * 60 + l.minute) - (t.h * 60 + t.m); return d >= 0 && d <= w; }
async function tryClaim(uid: string, kind: string, date: string) { const { error } = await admin.from('notif_log').insert({ user_id: uid, kind, sent_for_date: date }); return !error; }

async function whatToSend(uid: string, prof: any, local: ReturnType<typeof localParts>, today: string): Promise<Due[]> {
  const out: Due[] = [];
  if (prof.notif_workout && prof.notif_workout_time) {
    const t = parseHHMM(prof.notif_workout_time);
    if (t && withinWindow(local, t, 15)) {
      const { count } = await admin.from('workouts').select('id', { count: 'exact', head: true }).eq('user_id', uid).gte('started_at', `${today}T00:00:00Z`);
      if ((count || 0) === 0) out.push({ kind: 'workout', title: 'Time to train 💪', body: "You haven't logged a workout today. Even 15 minutes counts." });
    }
  }
  if (prof.notif_protein && prof.notif_protein_time && prof.protein_goal) {
    const t = parseHHMM(prof.notif_protein_time);
    if (t && withinWindow(local, t, 15)) {
      const { data: meals } = await admin.from('meals').select('protein_g, created_at').eq('user_id', uid).gte('created_at', `${today}T00:00:00Z`);
      const total = (meals || []).reduce((a: number, m: any) => a + (Number(m.protein_g) || 0), 0);
      const goal = Number(prof.protein_goal);
      if (total < goal) { const left = Math.max(0, Math.round(goal - total)); out.push({ kind: 'protein', title: 'Protein check 🥩', body: `You're at ${Math.round(total)}g of ${goal}g — ${left}g to go.` }); }
    }
  }
  if (local.hour === 21 && local.minute < 15) {
    const { count: woToday } = await admin.from('workouts').select('id', { count: 'exact', head: true }).eq('user_id', uid).gte('started_at', `${today}T00:00:00Z`);
    const { count: ckToday } = await admin.from('daily_checkins').select('logged_date', { count: 'exact', head: true }).eq('user_id', uid).eq('logged_date', today);
    if ((woToday || 0) === 0 && (ckToday || 0) === 0) {
      const since = new Date(); since.setDate(since.getDate() - 14);
      const { data: recentW } = await admin.from('workouts').select('started_at').eq('user_id', uid).gte('started_at', since.toISOString());
      const { data: recentC } = await admin.from('daily_checkins').select('logged_date').eq('user_id', uid).gte('logged_date', since.toISOString().slice(0, 10));
      const dates = new Set<string>();
      (recentW || []).forEach((w: any) => dates.add((w.started_at as string).slice(0, 10)));
      (recentC || []).forEach((c: any) => dates.add(c.logged_date as string));
      let streak = 0;
      for (let i = 1; i < 14; i++) { const d = new Date(); d.setDate(d.getDate() - i); if (dates.has(d.toISOString().slice(0, 10))) streak++; else break; }
      if (streak >= 2) out.push({ kind: 'streak_save', title: `Save your ${streak}-day streak 🔥`, body: 'A 5-second check-in keeps it alive. Tap and mark today.' });
    }
  }
  if (local.hour === 18 && local.minute < 15) {
    const threeAgo = new Date(); threeAgo.setDate(threeAgo.getDate() - 3);
    const { count: in3 } = await admin.from('workouts').select('id', { count: 'exact', head: true }).eq('user_id', uid).gte('started_at', threeAgo.toISOString());
    const { count: meals3 } = await admin.from('meals').select('id', { count: 'exact', head: true }).eq('user_id', uid).gte('created_at', threeAgo.toISOString());
    if ((in3 || 0) === 0 && (meals3 || 0) === 0) {
      const cutoff = new Date(); cutoff.setDate(cutoff.getDate() - 30);
      const { count: recentNudge } = await admin.from('notif_log').select('kind', { count: 'exact', head: true }).eq('user_id', uid).eq('kind', 're_engage').gte('sent_at', cutoff.toISOString());
      if ((recentNudge || 0) === 0) out.push({ kind: 're_engage', title: 'We miss you 👋', body: "It's been a few days. One quick session and you're back in rhythm." });
    }
  }
  // Weekly recap — Sunday 10:00 local.
  if (local.weekday === 'Sun' && local.hour === 10 && local.minute < 15) {
    const weekAgo = new Date(); weekAgo.setDate(weekAgo.getDate() - 7);
    const [{ data: wo }, { data: prs }] = await Promise.all([
      admin.from('workouts').select('id, duration_seconds, exercises(sets(weight_kg, reps))').eq('user_id', uid).gte('started_at', weekAgo.toISOString()),
      admin.from('personal_records').select('exercise_name, weight_kg, reps').eq('user_id', uid).gte('achieved_at', weekAgo.toISOString()).order('weight_kg', { ascending: false }).limit(1)
    ]);
    const sessions = (wo || []).length;
    let totalVol = 0; let totalSets = 0; let totalMin = 0;
    (wo || []).forEach((w: any) => {
      totalMin += Math.round((Number(w.duration_seconds) || 0) / 60);
      (w.exercises || []).forEach((ex: any) => (ex.sets || []).forEach((s: any) => {
        const v = (Number(s.weight_kg) || 0) * (Number(s.reps) || 0);
        totalVol += v; totalSets++;
      }));
    });
    if (sessions > 0 || totalSets > 0) {
      const tonnes = totalVol >= 1000 ? `${(totalVol / 1000).toFixed(1)}t` : `${Math.round(totalVol)}kg`;
      const topPr = prs && prs[0] ? ` Top PR: ${prs[0].exercise_name} ${prs[0].weight_kg}kg × ${prs[0].reps}.` : '';
      out.push({ kind: 'weekly_recap', title: 'Your week in lifts 📊', body: `${sessions} session${sessions === 1 ? '' : 's'} · ${totalSets} sets · ${tonnes} moved.${topPr}` });
    }
  }
  return out;
}
