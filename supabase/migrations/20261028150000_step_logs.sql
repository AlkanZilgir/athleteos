-- Daily step count, one row per user per day.
-- Same shape as water_logs: upserted on (user_id, logged_date) so the app can
-- write the running total for today without reading it back first.
--
-- Distance and burn are NOT stored. Both are derived from steps plus the
-- athlete's height and bodyweight, which already live on profiles; storing a
-- derived figure means it goes stale the moment either input changes.
create table if not exists public.step_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  logged_date date not null,
  steps integer not null default 0 check (steps >= 0 and steps <= 200000),
  source text not null default 'manual',
  updated_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  unique (user_id, logged_date)
);

create index if not exists step_logs_user_date_idx
  on public.step_logs (user_id, logged_date desc);

alter table public.step_logs enable row level security;

drop policy if exists sl_select_own on public.step_logs;
drop policy if exists sl_insert_own on public.step_logs;
drop policy if exists sl_update_own on public.step_logs;
drop policy if exists sl_delete_own on public.step_logs;
create policy sl_select_own on public.step_logs
  for select using (auth.uid() = user_id);
create policy sl_insert_own on public.step_logs
  for insert with check (auth.uid() = user_id);
create policy sl_update_own on public.step_logs
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy sl_delete_own on public.step_logs
  for delete using (auth.uid() = user_id);

-- Daily step target lives beside the other goals rather than in its own table.
alter table public.profiles
  add column if not exists step_goal integer not null default 10000;

-- profiles has column-scoped write grants as of 20261028133548: table-wide
-- INSERT/UPDATE is revoked from the browser roles so a user cannot write their
-- own billing columns. A column added after that migration is therefore NOT
-- writable by the client until it is granted explicitly, and the failure is
-- silent — PostgREST drops the column rather than erroring. Grant it here so
-- this migration is self-contained and applying it cannot leave step_goal
-- read-only by accident.
grant update (step_goal) on public.profiles to authenticated, anon;
grant insert (step_goal) on public.profiles to authenticated, anon;
