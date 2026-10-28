# Live schema snapshot

`supabase db pull` cannot run on this project: the CLI fails to open a direct
database connection ("Initialising login role... connection timeout"), and the
remote migration history contains 19 entries that predate version control and
have no local SQL. `supabase db dump` needs Docker, which is not installed.

So this directory is generated instead, by querying the live catalogue through
the Supabase MCP connector. It is **documentation, not migrations** — nothing
here is applied by `supabase db push`, and the files deliberately live outside
`supabase/migrations/` so they cannot be.

The point is reviewability. Before this, the only server-side authorization
boundary in the app — RLS, since the browser queries Postgres directly with the
anon key — existed nowhere a reviewer could see it. Now a change to a policy or
a grant shows up as a diff.

## Files

| File | What it holds | Regenerate with |
|---|---|---|
| `policies.sql` | Every RLS policy on `public`, as runnable DDL | `queries/dump-policies.sql` |
| `grants.md` | Table-level privileges for `anon` and `authenticated` | `queries/dump-grants.sql` |

## Keeping it honest

Regenerate after any change to policies or grants, and commit the diff with the
change. A snapshot that silently drifts is worse than none, because it invites
trust it has not earned.

Snapshot taken 2026-10-28.
