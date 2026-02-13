Inspect the Supabase database for the requested information: "$ARGUMENTS"

Use the Supabase CLI from /Users/mbaldwin/Curby/curby-supabase to inspect the linked project.

Available inspection commands:
- `npx supabase inspect db table-stats --linked` — table sizes and row counts
- `npx supabase inspect db index-stats --linked` — index usage and efficiency
- `npx supabase inspect db bloat --linked` — dead tuple estimates
- `npx supabase inspect db vacuum-stats --linked` — vacuum operation stats
- `npx supabase inspect db outliers --linked` — slowest queries
- `npx supabase inspect db calls --linked` — most frequently called queries
- `npx supabase functions list` — deployed edge functions

For schema details, read the SQL files in /Users/mbaldwin/Curby/curby/supabase-backup/ (create_db.sql, rls_policies.sql).
For migrations, check /Users/mbaldwin/Curby/curby-supabase/supabase/migrations/.

If the user didn't specify what to inspect, give an overview: table stats, index stats, and any outlier queries.
