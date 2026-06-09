-- Durable backstop queue for short-lived scheduled pushes (rest-timer complete).
-- Drained every minute by the rest-push-cron edge function.
create table if not exists public.scheduled_pushes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  fire_at timestamptz not null,
  title text not null default 'AthleteOS',
  body text not null default '',
  tag text not null default 'rest',
  url text not null default '/',
  sent_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists scheduled_pushes_due_idx
  on public.scheduled_pushes (fire_at) where sent_at is null;
create index if not exists scheduled_pushes_user_idx
  on public.scheduled_pushes (user_id);

alter table public.scheduled_pushes enable row level security;

drop policy if exists sp_select_own on public.scheduled_pushes;
drop policy if exists sp_insert_own on public.scheduled_pushes;
drop policy if exists sp_delete_own on public.scheduled_pushes;
create policy sp_select_own on public.scheduled_pushes
  for select using (auth.uid() = user_id);
create policy sp_insert_own on public.scheduled_pushes
  for insert with check (auth.uid() = user_id);
create policy sp_delete_own on public.scheduled_pushes
  for delete using (auth.uid() = user_id);

-- pg_cron job (run once, in the SQL editor — not part of CLI migrations):
--   select cron.schedule(
--     'rest-push-cron-1m', '* * * * *',
--     $$ select net.http_post(
--          url := 'https://<project>.supabase.co/functions/v1/rest-push-cron',
--          headers := jsonb_build_object('Content-Type','application/json','x-cron-secret','<CRON_SECRET>'),
--          body := '{}'::jsonb, timeout_milliseconds := 30000) $$);
