-- Regenerates ../grants.md (table level).
select grantee, table_name,
       string_agg(distinct privilege_type, ', ' order by privilege_type) as privs
from information_schema.table_privileges
where table_schema = 'public' and grantee in ('anon','authenticated')
group by grantee, table_name
order by table_name, grantee;

-- Column-level grants, which is where profiles differs from everything else.
select grantee, column_name, privilege_type
from information_schema.column_privileges
where table_schema = 'public' and table_name = 'profiles'
  and grantee in ('anon','authenticated')
order by grantee, column_name;

-- Sanity check that should always return zero rows: the billing columns must
-- never be writable by a browser role.
select column_name, grantee
from information_schema.column_privileges
where table_schema='public' and table_name='profiles'
  and grantee in ('anon','authenticated')
  and privilege_type in ('INSERT','UPDATE')
  and column_name in ('is_premium','premium_plan','premium_until',
                      'stripe_customer_id','stripe_subscription_id');
