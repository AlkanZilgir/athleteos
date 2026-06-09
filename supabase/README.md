# AthleteOS — Supabase backend

Project ref: `apnxpcehjapfhcybciqd` ("athleteos", eu-west-1).

These files are the **source of record** for the backend that runs on Supabase.
They are deployed from the dashboard / MCP, not auto-deployed from this repo —
keep them in sync when you change a function.

## Edge functions (`functions/`)

| Function | verify_jwt | Trigger | Purpose |
|---|---|---|---|
| `create-checkout-session` | yes | app | Stripe Checkout for monthly/yearly/lifetime. 7-day trial on yearly; lifetime is one-time `payment` mode. Reads price IDs from secrets. |
| `create-portal-session` | yes | app | Stripe billing portal (manage/cancel). |
| `stripe-webhook` | no | Stripe | Syncs `profiles.is_premium` / `premium_plan` / `premium_until` from Stripe events. Preserves lifetime on cancel. |
| `send-push` | yes | app | One-off web push to the calling user's own devices. |
| `push-cron` | no | pg_cron `*/15 * * * *` | Daily reminders (workout, protein, streak-save, re-engage, weekly recap), timezone-aware. |
| `rest-push-cron` | no | pg_cron `* * * * *` | Drains `scheduled_pushes` — backstop delivery for the rest-timer "complete" alert when the app/SW were killed. |

## Migrations (`migrations/`)

- `*_scheduled_pushes.sql` — backstop queue table for rest-timer pushes (RLS: own-rows only).

## pg_cron jobs (created via SQL editor, not CLI)

```sql
-- daily reminders
select cron.schedule('push-cron-15m', '*/15 * * * *', $$ ... rest-cron http_post ... $$);
-- rest-timer backstop
select cron.schedule('rest-push-cron-1m', '* * * * *', $$ ... http_post rest-push-cron ... $$);
```
Both pass `x-cron-secret: <CRON_SECRET>`.

## Required secrets (Edge Function env)

- `VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`, `VAPID_SUBJECT` — web push.
- `CRON_SECRET` — shared secret guarding the cron functions.
- `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET` — **flip to live keys before launch.**
- `STRIPE_PRICE_MONTHLY`, `STRIPE_PRICE_YEARLY`, `STRIPE_PRICE_LIFETIME` — live price IDs.
- `APP_BASE_URL` — production return URL (e.g. `https://athleteos.app/index.html`).
