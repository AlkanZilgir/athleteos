-- Stop pg_cron and pg_net history from eating the database.
--
-- WHAT HAPPENED (2026-10-28): logins started returning 504. GoTrue could not
-- open a Postgres connection at all:
--   "failed to connect to host=localhost user=supabase_auth_admin
--    dial tcp [::1]:5432: operation was canceled"
--
-- Neither extension prunes its own history. rest-push-cron fires every minute,
-- so each day leaves 1,440 rows in cron.job_run_details and another 1,440 in
-- net._http_response. Running since June, they had grown to 134 MB and 116 MB
-- -- 250 MB of a 263 MB database, about 95% of it, against roughly 13 MB of
-- actual app data. Autovacuum grinding on that much dead space starved a
-- shared free-tier instance of the IO and CPU the auth service needed.
--
-- Nothing in the application was at fault, and nothing in the schema was
-- misconfigured. The missing piece was a retention policy.
--
-- Recovery was: truncate cron.job_run_details (134 MB -> 32 kB), pause both
-- cron jobs so the instance could breathe, then re-enable them behind this job.
-- net._http_response could not be truncated: the pg_net background worker holds
-- the lock and respawns instantly, winning the race every time. It is dead
-- space that pg_net will reuse rather than extend, so it is not growing, but it
-- will only shrink on disk after a VACUUM FULL during a quiet window or a
-- project restart.
--
-- Keep a short window. Two days of cron history is enough to debug a failed
-- run; a pg_net response older than a day is of no use to anyone.

do $$
begin
  perform cron.unschedule('prune-cron-and-net-logs');
exception when others then
  null;  -- not scheduled yet
end $$;

select cron.schedule(
  'prune-cron-and-net-logs',
  '17 3 * * *',
  $$
    delete from cron.job_run_details where end_time < now() - interval '2 days';
    delete from net._http_response   where created  < now() - interval '1 day';
  $$
);
