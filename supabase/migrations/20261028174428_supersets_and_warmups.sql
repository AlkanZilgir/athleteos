-- Warm-up sets and supersets in a logged session.
--
-- A warm-up set is logged like any other set but is not a working set: the app
-- excludes it from session volume, set counts, personal records and the ghost
-- suggestion for the first working set.
alter table public.sets
  add column if not exists is_warmup boolean not null default false;

-- Consecutive exercises in a session that share a group number are performed
-- as a superset: alternate them, rest after the round. NULL means standalone.
-- Both tables already carry full row-level grants for the browser roles, so no
-- grant change is needed for the new columns.
alter table public.exercises
  add column if not exists superset_group smallint;
