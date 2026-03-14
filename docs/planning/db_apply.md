# DB Apply Run Log

## Summary
- Supabase CLI installed successfully.
- Attempted `db push` via `SUPABASE_DB_URL`, but remote connection failed from this environment.
- Migrations and seed have not been applied yet; validation of tables/RLS is pending.

## Commands Attempted
- `supabase --version` -> installed (v2.75.0)
- `supabase link --project-ref exflogkvcmeecbxiurfl` -> failed: access token not provided
- `supabase db push --db-url "$SUPABASE_DB_URL" --yes` -> failed: no route to host
- `supabase db push --db-url "$SUPABASE_DB_URL" --yes --dns-resolver https` -> failed: DNS resolver returned no valid IPs

## Required Manual Steps
1. Run from a network that can reach `db.exflogkvcmeecbxiurfl.supabase.co:5432`
2. Apply migrations (either method)
   - With DB URL: `supabase db push --db-url "$SUPABASE_DB_URL" --yes`
   - Or with access token:
     - Set `SUPABASE_ACCESS_TOKEN` in `.env.local`
     - `supabase link --project-ref exflogkvcmeecbxiurfl`
     - `supabase db push --yes`
3. Seed demo data (only if not already in migrations)
   - `supabase db seed --file supabase/migrations/0005_seed_demo.sql`
4. Validate schema + RLS
   - `supabase db remote list` (optional)
   - In SQL editor, verify tables exist and policies are enabled on:
     - `patients`, `encounters`, `clinical_documents`, `documentation_gaps`, `queries`, `code_suggestions`, `audit_logs`

## Notes / Assumptions
- Migrations are present under `supabase/migrations/0001_*` through `0005_*`.
- The seed script uses fixed UUIDs for repeatable demo data.
- RLS policies are defined in the migration files; verify `ALTER TABLE ... ENABLE ROW LEVEL SECURITY` exists for each protected table.

If you want me to run these steps here, I need outbound connectivity to the Supabase DB host (current environment can’t reach it).

## Latest Attempts (2026-03-14)
- Loaded `.env.local` into shell:
  - `export $(grep -v '^#' .env.local | xargs)`
- `supabase db push --db-url "$SUPABASE_DB_URL" --yes` -> failed: `lookup db.exflogkvcmeecbxiurfl.supabase.co: no such host` (DNS resolution failure in sandbox)
- Rerun with escalated permissions -> failed: `dial tcp [2406:da14:271:991d:dce1:b2b7:7886:4d55]:5432: connect: no route to host`

## Conclusion
- This environment cannot reach the Supabase DB host over the network (DNS/route blocked).
- Please run the push/seed commands locally on a network that can reach the DB host, or provide a network path that allows outbound access to `db.exflogkvcmeecbxiurfl.supabase.co:5432`.

## Latest Attempt (2026-03-14, escalated)
- Loaded `.env.local` into shell:
  - `export $(grep -v '^#' .env.local | xargs)`
- `supabase db push --db-url "$SUPABASE_DB_URL" --yes` -> connected to remote, attempted to apply `0005_seed_demo.sql`
- Failure:
  - `ERROR: insert or update on table "users" violates foreign key constraint "users_id_fkey" (SQLSTATE 23503)`
  - Key `(id)=(44444444-4444-4444-4444-444444444441)` is not present in table `auth.users`

## Required Fix Before Seed
- The seed inserts `public.users` with `id` referencing `auth.users`. Ensure the matching rows exist in `auth.users` first.
- Options:
  - Insert demo users into `auth.users` before `public.users` seed (preferred).
  - Or relax the FK for demo (not recommended).

## Next Steps
1. Insert demo auth users into `auth.users` (with matching UUIDs), then re-run:
   - `supabase db push --db-url "$SUPABASE_DB_URL" --yes`
2. If `0005_seed_demo.sql` is the only remaining migration, you can:
   - Split auth seed into a separate file and run via `supabase db seed --file ...`

## Latest Attempt (2026-03-14, after seed fix)
- Updated `0005_seed_demo.sql` to create an auth instance if none exists.
- `supabase db push --db-url "$SUPABASE_DB_URL" --yes` failed:
  - `ERROR: prepared statement "lrupsc_1_0" already exists (SQLSTATE 42P05)`
- This typically happens when using a **pooler** connection string. The Supabase CLI uses prepared statements and is incompatible with the transaction pooler.

## Required Connection Update
- Use the **direct** Postgres connection string (host `db.<project-ref>.supabase.co`) instead of the pooler host (`*.pooler.supabase.com`).
- Update `SUPABASE_DB_URL` and rerun:
  - `supabase db push --db-url "$SUPABASE_DB_URL" --yes`

## Latest Attempt (2026-03-14, pooler + seed fixes)
- Updated `0005_seed_demo.sql`:
  - Ensure `auth.instances` row exists using explicit `id`.
  - Added `organization_id`, `is_demo`, `data_source` columns to `public.query_responses` (if missing) and populated seed row.
- `supabase db push --db-url "$SUPABASE_DB_URL" --yes` -> **success**

## Validation
- Full RLS/table validation not executed here (no SQL inspection tooling available).
- Suggested manual checks in Supabase SQL editor:
  - `select count(*) from public.users;`
  - `select count(*) from public.patients;`
  - `select count(*) from public.query_responses;`
  - `select relrowsecurity from pg_class where relname in ('patients','encounters','clinical_documents','documentation_gaps','queries','query_responses','code_suggestions');`
