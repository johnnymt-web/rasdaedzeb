# Phase 1C.2 — Pre-Deployment Review of Superadmin Policy Migration

**Reviewer:** independent Postgres/Supabase-RLS/migration review · **Date:** 2026-07-23 · **Mode:** review-only (no files modified; no defect required a change). Migration under review: `supabase/migrations/20260723120000_capture_superadmin_select_policies.sql` (commit `bc8215c`).

## A. Verdict: **Approve with conditions**

The migration is syntactically valid, correctly ordered, semantically equivalent to the confirmed live policies, additive/SELECT-only, and safe for both clean and already-patched databases under transactional apply. It is **safe to retain, commit, merge, and apply in preview.** The conditions are the validations that cannot be executed from the repository alone: clean-DB replay / Supabase Preview execution, confirmation the apply workflow is transactional, and synthetic runtime access tests. Per the §19 standard these pending items make it *Approve with conditions* rather than *Approve*.

## B. Review summary

- **Migration reviewed:** `20260723120000_capture_superadmin_select_policies.sql` (commit `bc8215c`; `git show --stat` shows the SQL + the two 1C docs only).
- **Policy count:** exactly **5** (5 `DROP POLICY IF EXISTS` + 5 `CREATE POLICY`; 10 statements; no other DDL).
- **Dependencies:** all guaranteed to exist before this timestamp (table below).
- **SQL correctness:** parens balanced (net 0, never negative), quotes even, every statement `;`-terminated, valid UTF-8, correct `CREATE POLICY` clause order (`ON` → `AS PERMISSIVE` → `FOR SELECT` → `TO public` → `USING`).
- **Semantic equivalence:** matches A1/A2/A3 exactly (see §D).
- **Privilege impact:** adds a superadmin read path only; no write, no broadening, no other policy touched.
- **Clean-deploy readiness:** correct by construction; **replay not executed here** (condition).
- **Already-patched production readiness:** safe under transactional apply (identical re-creation); **transactionality to be confirmed** (condition).
- **Rollback readiness:** documented, scoped to the five policies only.

### Dependency / ordering table (all `< 20260723120000`, none dropped/renamed)

| Object | Creating migration | Before target? | Later drop/rename? |
|---|---|---|---|
| `public.app_role` (type) | `20260329052231_…` | ✅ | none |
| enum value `superadmin` | `20260618160000_app_role_add_superadmin` | ✅ (separate migration → committed before use) | none |
| `public.has_role(uuid, app_role)` | `20260329052231_…` + `20260618170000_superadmin_privileges` | ✅ | none |
| `public.profiles` | `20260329052231_…` | ✅ | none |
| `public.assessments` | `20260402061517_…` | ✅ | none |
| `public.big_five_assessments` | `20260505203000_unified_upgrades` | ✅ | none |
| `public.caas_assessments` | `20260505203000_unified_upgrades` | ✅ | none |
| `public.work_values_assessments` | `20260508180000_work_values` | ✅ | none |

Ordering is deterministic: `20260723120000` is the highest timestamped migration, unique (no duplicate), and all dependencies precede it. RLS is already enabled on all five tables (phase1a `20260605210211` for profiles/assessments/big_five/caas; `20260508180000` for work_values), so the policies are effective.

## C. Defects

**No blocking defect found.** No SQL/syntax error, no wrong policy name or table, no wrong command, no missing dependency qualification, no privilege broadening, no migration-order conflict, no incomplete policy. Two **non-blocking observations**:

- **N1 (Low, informational — non-blocking):** the migrations folder contains legacy **non-timestamped** files (`QUICK_SETUP.sql`, `SCHEMA_FIX.sql`, `DB_HEALTH_RECOVERY.sql`, `CONSOLIDATED_GUIDANCE_SETUP.sql`, `*.cjs`). By filename ordering these sort *after* timestamped migrations, but they do **not** reference any `Superadmin select` policy and use `CREATE TABLE IF NOT EXISTS`, so they cannot clobber these five policies. This is the pre-existing PF-019 repo-hygiene issue — **out of scope**, noted only so it is not mistaken for a sequencing risk introduced here.
- **N2 (Low — deployment condition, not a code defect):** already-patched-production safety depends on the apply workflow being transactional (see §7.1 analysis below). Confirm before apply.

## D. Production-evidence consistency (migration vs A1–A4)

Compared line-by-line against the A1/A2/A3/A4 exports recorded in the Phase 1C docs (raw CSVs were provided to this session and inspected):

| Attribute | Live (A1/A2/A3) | Migration | Match |
|---|---|---|---|
| Policy names (×5) | `Superadmin select all {assessments,big_five,caas,profiles,work_values}` | identical | ✅ |
| Tables | `assessments, big_five_assessments, caas_assessments, profiles, work_values_assessments` | identical | ✅ |
| Mode | `PERMISSIVE` | `AS PERMISSIVE` | ✅ |
| Command | `SELECT` | `FOR SELECT` | ✅ |
| Roles | `{public}` | `TO public` | ✅ |
| `USING` | `has_role(auth.uid(), 'superadmin'::app_role)` | `public.has_role(auth.uid(), 'superadmin'::public.app_role)` | ✅ semantically identical (schema-qualification is a no-op; `search_path` includes `public`) |
| `WITH CHECK` | `NULL` | absent | ✅ |
| `has_role` (A4) | `SECURITY DEFINER`, `STABLE`, `search_path=public`, reads `user_roles` | unchanged by this migration | ✅ |

A3 confirms **no other** superadmin policy exists; the migration adds none beyond the five. **No policy definition was reconstructed from memory** — all transcribed from the exports.

## Privilege & RLS analysis (§9)

- `TO public` means the policy is *evaluated* for all database roles (incl. Supabase `anon`, `authenticated`), but a row is returned **only if** the `USING` condition is true. It grants nothing on its own.
- **Non-superadmin authenticated user:** `has_role(auth.uid(),'superadmin')` returns false (no `user_roles` row with `role='superadmin'`) → **zero** additional rows. Their existing self/parent/counselor/admin policies are unchanged.
- **Anonymous (`auth.uid() IS NULL`):** `has_role(NULL,'superadmin')` → `EXISTS(… WHERE user_id = NULL …)` is never true → **no access**. Safe.
- **superadmin:** status comes from trusted `public.user_roles`; not client-settable (`enforce_role_assignment` blocks self-grant; `user_roles` writes are admin-scoped). Gains cross-school SELECT on the five tables only.
- **service_role:** bypasses RLS entirely — unchanged.
- Permissive combination is OR-based → the migration only *adds* the superadmin read path; it cannot restrict or bypass RLS for anyone else. No write path anywhere (`assessments` remains service-role-write-locked).

## 7.1 Already-patched production / 7.2 clean DB

- **Transactional apply (expected via Supabase migration workflow):** the whole file runs atomically; concurrent transactions see the pre-commit state then the identical post-commit state — **no observable access change, no absence window**, and a failure after `DROP` rolls back (original policy preserved). DDL takes a brief `ACCESS EXCLUSIVE` lock per table — momentary, immaterial to normal operation. **Condition:** confirm the apply path is transactional (do not assume). If applied **statement-by-statement** (e.g., pasted into the SQL Editor), a sub-millisecond window exists between `DROP` and `CREATE` where a concurrent superadmin read falls back to other policies (sees only its own rows) — an availability blip, **never** an over-grant. Mitigation: apply as one transaction / one migration file.
- **Clean DB:** `DROP POLICY IF EXISTS` is a harmless no-op; all dependencies exist; the five policies are created correctly; names conflict with no other migration. Reproduces the confirmed intended state. **Replay not executed here** (no local Supabase CLI/Docker/DB) — condition.

## Idempotency (§8)

Applying once succeeds; a clean DB reaches the intended state; an already-patched DB is normalized to the reviewed definition; manually re-running the raw SQL succeeds (`DROP IF EXISTS` + `CREATE`). **Distinction:** the SQL is *operationally repeatable*, but Supabase migration history (`schema_migrations`) normally records the version and runs each migration file **once** — so "idempotent" here means safe-if-re-run, not that it will re-run. Repeated execution does not change policy behavior.

## E. Deployment conditions (all must hold before production apply)

1. CI / Supabase Preview applies the migration cleanly (syntax + clean-DB replay) — **pending**.
2. Confirm the apply workflow is **transactional** (single migration file) — **pending** (N2).
3. Preserve a pre-apply `pg_policies` snapshot of the five tables.
4. Production backup + rollback readiness confirmed.
5. Post-apply catalog verification returns exactly the five rows (below).
6. Synthetic-role runtime access tests pass (below).
7. No superadmin write policy exists post-apply.
8. Live definitions still match the reviewed evidence at apply time (re-run A1/A3 if time has passed).

**Stop conditions:** any missing dependency; live definition ≠ reviewed evidence; an unexpected superadmin policy; syntax validation failure; non-transactional apply with uncontrolled partial-failure risk; post-apply verification ≠ expected five rows; any ordinary role gaining broader access.

## F. Post-apply checklist

**Catalog verification (read-only):**
```sql
select schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
from pg_policies
where policyname ilike 'Superadmin select all%'
order by tablename;
-- expect 5 rows: PERMISSIVE / {public} / SELECT / has_role(auth.uid(),'superadmin'::app_role) / with_check NULL

select count(*) as superadmin_write_policies
from pg_policies
where policyname ilike 'Superadmin%' and cmd <> 'SELECT';   -- expect 0
```
**Synthetic-role access tests (test DB, synthetic users only — never real student data):**
1. ordinary authenticated (non-superadmin) student cannot read another student via these policies;
2. student self-access unchanged; 3. counselor access unchanged; 4. school-admin scope unchanged;
5. superadmin reads rows across schools from all five tables; 6. anonymous gains nothing; 7. no role gains write.
**Rollback decision:** use the documented rollback (drops only the five named policies) **only** for a confirmed capture defect; after production apply, prefer a forward corrective migration. **Monitoring:** watch for RLS/`42501` errors and app errors post-apply.

## G. Final readiness distinctions

| Decision | Status |
|---|---|
| Safe to commit | ✅ Yes (already committed `bc8215c`) |
| Safe to merge | ✅ Yes |
| Safe to apply in **preview** | ✅ Yes (this is itself a required condition/validation) |
| Safe to apply in **production** | ⚠️ Conditional — after §E conditions (preview pass, transactional confirm, post-apply verification, synthetic tests) |
| **PF-006** | Repository drift **captured in code**; **production apply + clean-deploy reproduction still pending** → not yet closed |
| **PF-007** | **Open**, untouched (privileged-read audit logging out of scope) |

## D. Validation performed

- **Commands:** `git log --oneline -5`; `git show --stat bc8215c`; `git diff --check bc8215c^ bc8215c` (clean); dependency `grep`s (creation migrations + no drops/renames); duplicate-timestamp check (unique); mechanical parens/quotes/terminator/UTF-8 check via Node (balanced, even, valid).
- **Syntax validation:** by inspection + mechanical checks. **Not** validated against a live Postgres — no local Supabase CLI/Docker/DB available (CLAUDE.md §4); prior capture migrations (PR #5/#11) passed Supabase Preview, but **this file's clean-DB replay was not executed here.**
- **Limitations:** clean-database replay, preview execution, transactional-apply confirmation, and runtime access tests all require a database and are deferred to CI/Supabase Preview / the apply workflow. Exact commands are in this doc and `01-…`.

## Git status conclusion

Branch `fix/superadmin-policy-drift-phase1c`; the migration is committed (`bc8215c`); working tree has no pending scoped changes beyond this new review document. **No SQL was applied, no database or production state changed, no source/config/dependency modified, nothing deployed, no branch merged.**
