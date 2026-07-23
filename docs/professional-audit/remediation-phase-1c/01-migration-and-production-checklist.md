# Phase 1C — Introspection, Migration & Production Checklist

**Status (updated 2026-07-23, Phase 1C.1):** evidence **received** (A1–A4) and migration **created** — `supabase/migrations/20260723120000_capture_superadmin_select_policies.sql` — using **Strategy A (deterministic `DROP POLICY IF EXISTS` + `CREATE POLICY`)**. **Not applied** (no SQL run; owner applies after review). This document retains (A) the introspection queries that produced the evidence, (D) the post-application verification query, and (E) rollback. All queries below are **read-only** and change nothing.

**Local validation performed on the migration file:** exactly 5 `CREATE POLICY` + 5 executable `DROP POLICY`; all `FOR SELECT`, all `TO public`, all `USING public.has_role(auth.uid(), 'superadmin'::public.app_role)`; **0** `WITH CHECK`, **0** `FOR INSERT/UPDATE/DELETE`, **0** `GRANT`/`ALTER TABLE`/function definitions; exactly the five confirmed tables; `git diff --check` clean. (No `supabase` CLI is available locally per CLAUDE.md §4, so live SQL syntax/apply validation happens in CI/Supabase Preview — not run here.)

## A. Read-only production introspection (run these first)

Run in the Supabase SQL Editor (read-only). Paste the **verbatim** output back for the migration to be written from evidence.

### A1 — The five candidate policies (by proposed name)
```sql
select schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
from pg_policies
where policyname in (
  'Superadmin select all profiles',
  'Superadmin select all assessments',
  'Superadmin select all big_five',
  'Superadmin select all caas',
  'Superadmin select all work_values'
)
order by schemaname, tablename, policyname;
```

### A2 — ALL policies on the five affected tables (catches renamed/extra production-only policies)
```sql
select schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
from pg_policies
where schemaname = 'public'
  and tablename in ('profiles','assessments','big_five_assessments','caas_assessments','work_values_assessments')
order by tablename, cmd, policyname;
```

### A3 — Any policy anywhere whose USING references superadmin (catches other-named drift)
```sql
select schemaname, tablename, policyname, cmd, roles, qual
from pg_policies
where qual ilike '%superadmin%'
order by schemaname, tablename, policyname;
```

### A4 — Confirm the helper function definition matches the repo (should equal migration 20260618170000)
```sql
select p.proname,
       pg_get_functiondef(p.oid) as definition,
       p.prosecdef as security_definer,
       p.proconfig as settings          -- expect {search_path=public}
from pg_proc p
join pg_namespace n on n.oid = p.pronamespace
where n.nspname = 'public' and p.proname = 'has_role';
```

**Evidence sufficiency gate:** a migration may be written only if A1 (or A2) returns, for **all five** policies: exact `policyname`, `cmd = 'SELECT'`, `permissive`, `roles`, and a complete `qual`; and A4 confirms `has_role` is `SECURITY DEFINER` with `search_path=public`. If any policy is missing from A1/A2, it was **not** applied in production — capture only what actually exists and record the rest as still-missing.

## B. Turning evidence into the migration (Strategy A — deterministic replacement)

Only after A1/A2 confirm exact definitions. File name suggestion: `supabase/migrations/20260723xxxxxx_capture_superadmin_select_policies.sql`. Template — **substitute each `qual`/`roles` with the exact introspected value; do not paste from memory**:

```sql
-- Capture-only: reproduce the production-applied superadmin read policies that
-- were added out-of-band (PF-006). Additive, SELECT-only; widens nothing beyond
-- what already exists live. Idempotent for clean + already-patched databases.
-- Definitions below are transcribed verbatim from pg_policies (A1/A2), date <>.

drop policy if exists "Superadmin select all profiles" on public.profiles;
create policy "Superadmin select all profiles" on public.profiles
  for select
  to <ROLES FROM pg_policies.roles>          -- e.g. public
  using ( <EXACT qual FROM pg_policies> );   -- e.g. has_role(auth.uid(), 'superadmin'::app_role)

-- …repeat for assessments, big_five_assessments, caas_assessments, work_values_assessments…
```

**Why Strategy A (not B):** the objective is to *normalize the repository to the reviewed production definition* so a clean deploy reproduces production. The change is additive and read-only (`FOR SELECT` only), so `drop policy if exists` + `create policy` is safe and idempotent — on a clean DB it simply creates; on the already-patched production DB it re-creates the identical policy (no behavior change, no window of exposure since it is not applied here and, when applied, only ever re-establishes the same SELECT grant). Strategy B (guarded precondition/fail-on-conflict) is unnecessary because there is no risk of silently overwriting a *different* meaningful definition: any pre-existing policy of the same name is, by construction, the same superadmin SELECT grant we are capturing. If A2 reveals a same-named policy with a **different** `qual`, stop and reconcile manually (do not auto-replace).

**Prohibited in the migration:** any INSERT/UPDATE/DELETE policy; any change to the existing `Scoped select …` / lockdown policies; any broadening of `qual`; any change to `has_role` or other helpers; any unrelated object.

## C. Pre-application review checklist

- [ ] Every `create policy` `qual`/`roles` is transcribed **verbatim** from A1/A2 output (not from this repo's prose or prior chat).
- [ ] `cmd` is `SELECT` for all five; **no** `with_check`, **no** write policies.
- [ ] Tables and functions are schema-qualified (`public.`).
- [ ] No existing policy is dropped except the same-named superadmin one being recaptured.
- [ ] `has_role` (A4) matches migration `20260618170000` (SECURITY DEFINER, `search_path=public`); if it differs live, capture that separately — do **not** silently redefine it here.
- [ ] Migration is additive: diff shows only new `Superadmin select all …` policies.

## D. Post-application verification (read-only, after the owner applies it)

```sql
-- Expect exactly the five superadmin SELECT policies, SELECT-only, unchanged qual.
select tablename, policyname, cmd, roles, qual
from pg_policies
where policyname ilike 'Superadmin select all%'
order by tablename;

-- Confirm NO write policy was introduced under a superadmin name.
select tablename, policyname, cmd
from pg_policies
where policyname ilike 'Superadmin%' and cmd <> 'SELECT';   -- expect 0 rows
```
Then confirm a clean `db reset` (staging/preview) now reproduces these five policies (Supabase Preview should stay green).

## E. Rollback

Additive and reversible. To revert:
```sql
drop policy if exists "Superadmin select all profiles" on public.profiles;
drop policy if exists "Superadmin select all assessments" on public.assessments;
drop policy if exists "Superadmin select all big_five" on public.big_five_assessments;
drop policy if exists "Superadmin select all caas" on public.caas_assessments;
drop policy if exists "Superadmin select all work_values" on public.work_values_assessments;
```
Dropping them removes only the superadmin global-read grant; all other policies (student/parent/counselor/admin/lockdown) are untouched. Note: dropping in production would re-break superadmin visibility — only roll back if the capture was incorrect.

## F. Evidence to preserve

- The raw A1/A2/A4 output (timestamped) attached to the migration PR as the transcription source.
- A note of any policy from the proposed five that A1/A2 shows **absent** (i.e., never applied) — that is still-open drift, not to be invented into the migration.

## G. Remaining production checks (migration created, not yet applied)

1. **Review** `20260723120000_capture_superadmin_select_policies.sql` against the A1/A2 evidence (already transcribed verbatim; `qual` schema-qualified but semantically identical).
2. **Apply** in production/preview via the normal migration flow (owner). This DROP-IF-EXISTS + CREATE is idempotent — on the already-patched production DB it re-establishes the identical SELECT grant (no behavior change).
3. **Post-apply verification** — run Section D; expect exactly the five superadmin SELECT policies unchanged, and zero superadmin write policies.
4. **Reproducibility** — confirm a clean `db reset` / Supabase Preview now reproduces the five policies (green).

**PF-006:** these five policies are now captured in code; **production-verification of the apply + clean-deploy reproduction is still pending.** PF-007 privileged-read logging remains open and out of scope.
