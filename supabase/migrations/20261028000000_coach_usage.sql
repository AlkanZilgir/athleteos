-- Server-side quota for the Command Engine.
--
-- Before this, the free-tier limit of 7 coach messages per day lived entirely in
-- localStorage (js/settings.js PREM_LIMITS), which the user owns and can reset.
-- The counter now lives here and is incremented by the coach edge function
-- through claim_ai_use(), which is atomic: the limit check and the increment are
-- one statement, so two concurrent requests cannot both pass the last slot.

create table if not exists public.ai_usage (
  user_id uuid not null references auth.users(id) on delete cascade,
  used_date date not null,
  count integer not null default 0,
  updated_at timestamptz not null default now(),
  primary key (user_id, used_date)
);

alter table public.ai_usage enable row level security;

-- Read-own only, so the UI can show "N messages left today" without trusting a
-- client-side tally. There is deliberately NO insert/update/delete policy: RLS
-- denies by default, so the only write path is claim_ai_use under the service
-- role. A user cannot reset their own counter.
drop policy if exists au_select_own on public.ai_usage;
create policy au_select_own on public.ai_usage
  for select using (auth.uid() = user_id);

-- Returns the new count, or NULL when the caller is already at the limit.
-- SECURITY DEFINER so it can write a table the caller has no write access to.
create or replace function public.claim_ai_use(p_user uuid, p_limit integer)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  v_count integer;
begin
  insert into public.ai_usage as u (user_id, used_date, count, updated_at)
  values (p_user, current_date, 1, now())
  on conflict (user_id, used_date) do update
    set count = u.count + 1,
        updated_at = now()
    where u.count < p_limit
  returning u.count into v_count;

  return v_count;
end;
$$;

-- Only the service role may call it. The browser roles must not be able to
-- advance or inspect another user's counter.
revoke all on function public.claim_ai_use(uuid, integer) from public;
revoke all on function public.claim_ai_use(uuid, integer) from anon;
revoke all on function public.claim_ai_use(uuid, integer) from authenticated;
grant execute on function public.claim_ai_use(uuid, integer) to service_role;
