-- Regenerates ../policies.sql. Run through the Supabase MCP connector or the
-- SQL editor, then paste the single returned value over that file's body,
-- keeping its header comments.
select string_agg(stmt, E'\n' order by tbl, polname) as ddl
from (
  select c.relname as tbl, p.polname,
    format(
      'create policy %I on public.%I%s for %s%s%s;',
      p.polname, c.relname,
      case when p.polpermissive then '' else ' as restrictive' end,
      case p.polcmd when 'r' then 'select' when 'a' then 'insert'
                    when 'w' then 'update' when 'd' then 'delete' else 'all' end,
      coalesce(' using (' || pg_get_expr(p.polqual, p.polrelid) || ')', ''),
      coalesce(' with check (' || pg_get_expr(p.polwithcheck, p.polrelid) || ')', '')
    ) as stmt
  from pg_policy p
  join pg_class c on c.oid = p.polrelid
  join pg_namespace n on n.oid = c.relnamespace
  where n.nspname = 'public'
) s;
