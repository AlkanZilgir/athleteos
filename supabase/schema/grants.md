# Table privileges for the browser roles

Generated from the live database 2026-10-28. Regenerate with
`queries/dump-grants.sql`. Read alongside `policies.sql`: a **policy** decides
which rows a role may touch, a **grant** decides which columns. Postgres cannot
express a column restriction inside a policy — that gap is what made the
`is_premium` self-grant possible before `20261028133548`.

`anon` and `authenticated` hold identical privileges on every table. That looks
alarming and mostly is not: `anon` cannot satisfy `auth.uid() = user_id`, so RLS
denies it everywhere except the `feedback` insert, which is deliberately open.

## The two tables that differ from the default

**`profiles`** — table-wide INSERT and UPDATE revoked. Write access is granted
per column instead, covering the 36 columns the client legitimately edits. The
five billing columns (`is_premium`, `premium_plan`, `premium_until`,
`stripe_customer_id`, `stripe_subscription_id`) are writable only by
`service_role`, via stripe-webhook.

> Adding a profiles column? Add it to the grant list in
> `migrations/20261028133548_profiles_column_grants.sql` as well, or writes to it
> fail silently with no client-side error.

**`ai_usage`** — INSERT, UPDATE, DELETE and TRUNCATE revoked from both browser
roles; SELECT kept so the UI can show the remaining allowance. RLS already
denied the writes (the table has only a select policy), but TRUNCATE is **not**
subject to RLS, so the grant had to go too. Only `service_role` writes it,
through `claim_ai_use()`.

## Everything else

| Table | anon | authenticated |
|---|---|---|
| body_measurements | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE | same |
| cardio_sessions | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE | same |
| custom_achievements | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE | same |
| custom_exercises | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE | same |
| daily_checkins | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE | same |
| exercises | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE | same |
| feedback | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE | same |
| meals | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE | same |
| notif_log | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE | same |
| personal_records | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE | same |
| progress_photos | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE | same |
| push_subscriptions | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE | same |
| scheduled_pushes | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE | same |
| sets | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE | same |
| sleep_logs | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE | same |
| user_prefs | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE | same |
| water_logs | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE | same |
| weight_logs | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE | same |
| workout_templates | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE | same |
| workouts | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE | same |
| ai_usage | REFERENCES, SELECT, TRIGGER | same |
| profiles | DELETE, REFERENCES, SELECT, TRIGGER, TRUNCATE (+ 36 columns INSERT/UPDATE) | same |

## On the blanket TRUNCATE

Every table above grants TRUNCATE to both browser roles. That is Supabase's
default for tables created in `public`, and TRUNCATE bypasses RLS entirely. It
is not reachable today because PostgREST exposes only row CRUD and never issues
TRUNCATE — the grant has no route to the client. It was tightened on `ai_usage`
because that table's whole job is to resist the user it counts. Revoking it
across the board is defensible hardening, but it is a wide change with no
demonstrated attack path, so it was left alone rather than done hastily.
