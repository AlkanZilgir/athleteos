-- Make the quota counter unwritable by the client.
--
-- ai_usage inherited Supabase's default grants for a new table in public, which
-- hand anon and authenticated INSERT, UPDATE, DELETE and TRUNCATE. RLS already
-- denied the first three, because the table carries only a select policy and RLS
-- denies by default.
--
-- TRUNCATE is the one that mattered: it is NOT subject to row-level security. A
-- grant that RLS cannot restrain has no business sitting on the table whose
-- entire job is to resist the user it counts. Not reachable through PostgREST,
-- which never issues TRUNCATE, but the grant should not exist at all.
--
-- SELECT stays so the UI can show the remaining allowance honestly.
-- service_role keeps everything; claim_ai_use() runs as the definer.
revoke insert, update, delete, truncate on public.ai_usage from anon;
revoke insert, update, delete, truncate on public.ai_usage from authenticated;
