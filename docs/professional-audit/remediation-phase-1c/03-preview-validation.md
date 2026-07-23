# Phase 1C.3 — Preview & Clean-Deploy Validation

**Date:** 2026-07-23 · **Branch:** `fix/superadmin-policy-drift-phase1c` · **Migration:** `supabase/migrations/20260723120000_capture_superadmin_select_policies.sql` (commit `bc8215c`; review commit `a537fe0`). **Mode:** validation attempt — no production touched.

## Verdict: **Validation blocked**

No safe executable database environment is available in this session, and installing tooling is out of scope. Static validation (SQL structure, dependency ordering, semantic equivalence) passed in Phase 1C.2 and is re-affirmed here, but **no migration was executed against any database** (local, preview, or production). Per §4 Path C, this document provides the exact owner/CI-run validation runbook and stops. The migration remains **correct and safe to retain** (no defect); it simply has **not yet been executed** anywhere.

## Environment

| Check | Result |
|---|---|
| Validation path used | **Path C** — no executable environment (runbook only) |
| Supabase CLI | **not available** (`supabase: command not found`) |
| Docker | **not available** (`docker: command not found`) |
| psql / pg_prove | **not available** |
| Node.js | v24.18.0 (usable for static SQL text checks only — cannot execute Postgres) |
| Local disposable DB config | none found |
| CI workflows present | `.github/workflows/`: `deploy-functions.yml`, `test.yml`, `typecheck.yml` (no repo-defined migration-apply workflow) |
| Supabase Preview | **exists as the Supabase GitHub App** (branching integration) — observed green on prior PRs (#11, #19–#24); runs on a **pushed PR**, not invocable from this CLI |
| Production connection used | **None.** No production credentials, no remote `db push`, no SQL Editor use |

Because Path A (Supabase Preview) requires pushing the branch and opening a PR — a remote action whose result cannot be executed/observed from this session — and Path B (local stack) requires absent, install-prohibited tooling, neither can be run here. Production is off-limits. → **Path C.**

## Clean replay

- **Executed:** **No — blocked** (no CLI/Docker/DB).
- **Static substitute performed (1C.2, re-affirmed):** dependency ordering proven from migration history — every referenced object (`public.app_role` `20260329052231`; `superadmin` enum value `20260618160000`; `public.has_role` `20260329052231`/`20260618170000`; tables `profiles` `20260329052231`, `assessments` `20260402061517`, `big_five_assessments`/`caas_assessments` `20260505203000`, `work_values_assessments` `20260508180000`) is created **before** `20260723120000` and **never dropped/renamed**; timestamp is unique and highest. SQL structure: parens balanced, quotes even, statements terminated, valid UTF-8, correct `CREATE POLICY` clause order.
- **Reproducibility caveat (unchanged, PF-019):** the folder also contains legacy **non-timestamped** SQL (`QUICK_SETUP.sql`, `SCHEMA_FIX.sql`, `DB_HEALTH_RECOVERY.sql`, `CONSOLIDATED_GUIDANCE_SETUP.sql`) and `*.cjs`. Prior PR "Supabase Preview" checks passed, indicating the timestamped sequence applies on ephemeral branches, but **whole-folder clean-deploy reproducibility is a separate open concern** and is not proven here. The migration-under-review's own correctness is independent of that.

## Policy verification — **not executed** (query provided; see Runbook §V1)

Expected on success: exactly **5** rows (`profiles`, `assessments`, `big_five_assessments`, `caas_assessments`, `work_values_assessments`), each `PERMISSIVE / SELECT / {public} / has_role(auth.uid(),'superadmin'::app_role) / with_check NULL`; and **0** superadmin non-SELECT policies.

## Access tests — **not executed** (synthetic-role SQL + expected outcomes provided; see Runbook §V2)

Roles to cover: ordinary authenticated, student, counselor, school-admin, superadmin, anonymous, and a write-attempt. All require synthetic fixtures in a disposable DB — not creatable here.

## Repeatability (already-patched state) — **not executed**

The migration is `DROP POLICY IF EXISTS` + `CREATE POLICY`, so re-running the SQL against a DB that already has the five policies is expected to succeed and leave exactly five (no duplicates, no writes). Retained as a deployment condition; runbook §V3.

## Rollback — **not executed** (SQL provided; see Runbook §V4)

The documented rollback drops only the five named policies; inspection confirms it touches no other policy, `has_role`, `user_roles`, data, or schema. Execution deferred to the disposable environment.

## Defects

- **Blocking:** none in the migration.
- **Non-blocking / environment limitation:** no executable DB environment in this session (tooling absent; install prohibited) → all runtime validations deferred to owner/CI.
- **Unrelated repository limitation:** PF-019 whole-folder migration reproducibility (legacy non-timestamped SQL) — pre-existing, out of scope.

---

# Owner / CI Validation Runbook (Path A — Supabase Preview, recommended)

Run in a **disposable** environment only (Supabase Preview branch, or local `supabase start` if the owner has CLI+Docker). Never against production. No real student data.

## Step 0 — Clean-deploy replay
- **Preview:** push branch `fix/superadmin-policy-drift-phase1c` and open a PR. The **Supabase Preview** check provisions an ephemeral branch DB and runs the migration sequence (`db reset`-equivalent). Confirm it is **green** and that migration `20260723120000` is listed applied.
- **Local (if CLI+Docker present):**
  ```bash
  supabase start
  supabase db reset      # applies all migrations onto a fresh local DB
  ```
  Confirm output targets the **local** stack (no remote project ref) and that `20260723120000_capture_superadmin_select_policies` applies without error.

## V1 — Catalog verification (read-only)
```sql
select schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
from pg_policies
where schemaname = 'public'
  and policyname in (
    'Superadmin select all assessments','Superadmin select all big_five',
    'Superadmin select all caas','Superadmin select all profiles',
    'Superadmin select all work_values')
order by tablename, policyname;
-- EXPECT: exactly 5 rows; each PERMISSIVE / {public} / SELECT /
--         has_role(auth.uid(), 'superadmin'::app_role) / with_check = NULL

select schemaname, tablename, policyname, cmd, qual, with_check
from pg_policies
where schemaname = 'public'
  and ( policyname ilike '%superadmin%'
        or coalesce(qual,'') ilike '%superadmin%'
        or coalesce(with_check,'') ilike '%superadmin%')
  and cmd <> 'SELECT'
order by tablename, policyname;
-- EXPECT: 0 rows (no superadmin write policy)
```

## V2 — Synthetic role-access tests (disposable DB, synthetic users/data only)
Create synthetic `auth.users` + `public.profiles` + `public.user_roles` rows: one student A, one student B, one counselor, one school-admin, one superadmin (insert `user_roles.role='superadmin'` directly as the DB owner in the test DB — bypasses `enforce_role_assignment`, acceptable for a fixture). Then, impersonating each (e.g. `set request.jwt.claims` / Supabase test helpers), assert:

| Actor | Query | Expected |
|---|---|---|
| Student A | `select count(*) from profiles` | only rows A can see via existing policies (self + any parent/counselor links); **not** B's psychometric rows |
| Student A | `select count(*) from big_five_assessments where student_id = <B>` | **0** |
| Counselor | `select … from assessments where user_id = <unassigned student>` | **0** (assignment/school scope unchanged) |
| School-admin | reads outside own school | **0** (scope unchanged) |
| **Superadmin** | `select count(*) from {profiles,assessments,big_five_assessments,caas_assessments,work_values_assessments}` | **> 0 across schools** (new read path works) |
| Anonymous (`auth.uid() null`) | any select on the five tables | **0** |
| Any non-service role | `insert/update/delete` on the five tables via these policies | **denied** (policies are SELECT-only; `assessments` writes remain service-role-locked) |

Rule: do **not** weaken any existing policy to make a test pass.

## V3 — Already-patched repeatability
With the five policies present, re-run the migration file's SQL once (as a single transaction). EXPECT success, still exactly five policies (V1), no duplicates, no write policy, no table/function change. (This tests SQL repeatability, not the migration runner; do not fake a second tracked application.)

## V4 — Rollback validation
```sql
DROP POLICY IF EXISTS "Superadmin select all assessments"   ON public.assessments;
DROP POLICY IF EXISTS "Superadmin select all big_five"      ON public.big_five_assessments;
DROP POLICY IF EXISTS "Superadmin select all caas"          ON public.caas_assessments;
DROP POLICY IF EXISTS "Superadmin select all profiles"      ON public.profiles;
DROP POLICY IF EXISTS "Superadmin select all work_values"   ON public.work_values_assessments;
```
EXPECT: V1 now returns 0 superadmin SELECT rows; all other policies, `has_role`, `user_roles`, and data unchanged. Then re-apply the migration and confirm V1 returns the five again. **Never run rollback against production** (it would re-break superadmin visibility).

---

## Readiness

| Statement | Status |
|---|---|
| Migration correct | ✅ (static review 1C.2 + re-affirmed) |
| Clean-deploy reproduced | ❌ not executed (blocked) → owner/CI Step 0 |
| Preview apply passed | ❌ not executed → owner PR (Supabase Preview) |
| Synthetic RLS tests passed | ❌ not executed → runbook V2 |
| Safe for production apply | ⚠️ conditional — after Step 0 + V1–V4 pass and 1C.2 §E conditions |
| Remaining deployment conditions | Preview/clean-DB green; transactional apply; pre-apply `pg_policies` snapshot + backup; V1 = 5 rows / 0 writes; V2 synthetic tests; V4 rollback rehearsed; live evidence still matches |
| **PF-006** | Captured in code; **not yet production-verified** → open |
| **PF-007** | **Open**, untouched |

## Git status conclusion

Branch `fix/superadmin-policy-drift-phase1c`; migration committed (`bc8215c`) and unchanged; review committed (`a537fe0`). The only new working-tree file is this document (plus pre-existing unrelated untracked audit files). **No production SQL applied, no database created or modified, no branch pushed or merged, nothing deployed.**
