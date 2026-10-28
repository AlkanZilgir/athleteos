-- Bound the scheduled_pushes queue.
--
-- The INSERT policy pins user_id and nothing else, so a client could queue any
-- number of rows, with any content, scheduled arbitrarily far ahead. Delivery
-- is per-user so the blast radius was always the inserting user's own devices,
-- but nothing stopped the table growing without limit.
--
-- A rest-timer row fires minutes after it is written. Anything claiming to fire
-- more than a day out is not a rest timer.
alter table public.scheduled_pushes
  drop constraint if exists scheduled_pushes_fire_at_window;

alter table public.scheduled_pushes
  add constraint scheduled_pushes_fire_at_window
  check (fire_at < created_at + interval '1 day')
  not valid;  -- not valid: existing rows are drained within 15 minutes anyway,
              -- and a failed migration here would block the deploy for nothing.

-- Cap pending rows per user. A legitimate client holds one rest timer at a
-- time and deletes it on completion; a handful of stragglers is normal, a
-- thousand is not.
create or replace function public.scheduled_pushes_cap()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_pending integer;
begin
  select count(*) into v_pending
  from public.scheduled_pushes
  where user_id = new.user_id and sent_at is null;

  if v_pending >= 50 then
    raise exception 'scheduled_pushes: too many pending rows for this user'
      using errcode = 'check_violation';
  end if;

  return new;
end;
$$;

drop trigger if exists scheduled_pushes_cap_trg on public.scheduled_pushes;
create trigger scheduled_pushes_cap_trg
  before insert on public.scheduled_pushes
  for each row execute function public.scheduled_pushes_cap();
