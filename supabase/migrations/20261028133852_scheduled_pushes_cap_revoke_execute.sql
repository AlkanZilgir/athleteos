-- A trigger function still lands in the exposed API schema, where PostgREST
-- will offer it at /rest/v1/rpc/. Calling it outside a trigger context only
-- errors, but a SECURITY DEFINER function reachable by anon is noise the
-- database linter rightly flags, so close it.
revoke execute on function public.scheduled_pushes_cap() from public;
revoke execute on function public.scheduled_pushes_cap() from anon;
revoke execute on function public.scheduled_pushes_cap() from authenticated;
