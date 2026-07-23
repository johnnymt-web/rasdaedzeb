# Phase 2D.3 — Final Security & Acceptance Review (PF-007)

**Reviewer role:** independent PostgreSQL / Supabase-RLS / SECURITY-DEFINER / audit-logging / privacy / app-integration reviewer.
**Scope reviewed:** `20260723170000_audited_superadmin_read_boundary.sql`, `src/test/privilegedReadAudit.test.ts`, the three phase-2d docs, the five refactored frontend files, and earlier RLS/helper/audit definitions as needed. Review-only — **no** scoped file was modified (no acceptance-blocking defect found).
**Date:** 2026-07-23 · **Branch:** `fix/privileged-read-audit-phase2d`.

---

## Verdict — **ACCEPT WITH CONDITIONS**

The implementation correctly moves the superadmin cross-school read from a direct, unaudited global RLS path to an audited `SECURITY DEFINER` RPC boundary, and removes the direct path. The migration, RPC hardening, audit atomicity/fail-closed, data minimization, per-student binding, and the shared-component refactor are all sound. Conditions were **runtime verification in a disposable DB** and a few **minor, non-blocking follow-ups** (below). No code defect blocks commit.

> **Update (2026-07-23) — applied & runtime-verified in production; PF-007 Closed in production.** The runtime conditions have since been confirmed against production: the five global superadmin SELECT policies are removed, the four audited RPCs exist, `anon`/`PUBLIC` cannot execute them, direct global cross-school SELECT is gone, and `READ_PLATFORM_COUNTS`/`READ_STUDENT`/`READ_STUDENT_REPORT` audit events were observed with metadata-only payloads. The only unrun matrix item is the **forced-audit-failure (C4)** test, intentionally kept to a disposable/preview DB (a regression-test condition, not a production vulnerability). See the Readiness section.

---

## PF-007 security-boundary conclusion — objective met

Before: `superadmin browser → direct PostgREST SELECT → global "Superadmin select all …" policy → sensitive rows → no audit`. After: `superadmin browser → superadmin_* RPC → has_role('superadmin') check → audit INSERT → owner-privileged read → result`. The first path is removed for all five tables (§ below), so the audited RPC is the only client route to cross-school data.

---

## Five-policy removal conclusion — CONFIRMED

The migration drops exactly `Superadmin select all profiles/assessments/big_five/caas/work_values` on their correct tables (names/tables verified against `20260723120000`). Structural test asserts **exactly 5 DROP POLICY lines, all `Superadmin select all …`**; no `CREATE/ALTER POLICY`, no `FOR SELECT/INSERT/UPDATE/DELETE`. No PF-011/PF-012/PF-013 object is touched.

---

## Effective direct-read matrix (superadmin, after removal)

Determined from the **live** SELECT policies (phase1a rewrite is authoritative; the old broad "Admins/Counselors can view all …" policies were dropped at `phase1a:145-152`):

| Table | Remaining SELECT policy that could match a superadmin | Superadmin direct global read? |
|---|---|---|
| `profiles` | `Scoped select profiles` = `can_access_student_record(id) OR is_school_admin_for_user(id)` | **No.** `can_access_student_record` = self/parent/counselor; `is_school_admin_for_user` matches only a `user_roles.role='admin'` row **with equal school_id** — a pure superadmin (role='superadmin') does **not** satisfy it. |
| `assessments` | `Scoped select assessments` = `can_access_student_assessment(user_id)` (+ original self/parent policies) | **No.** self/parent/counselor only; admin/superadmin not included. |
| `big_five_/caas_/work_values_assessments` | `Scoped select …` = `can_access_student_assessment(student_id)` | **No.** Same. |

So a superadmin retains only *incidental scoped* reads (their own record, or students they happen to parent/counsel) — **the global cross-school capability now exists only through the audited RPCs.** This matches the §21 requirement (not "zero rows always", but "no global capability outside audited RPCs"). *(Runtime C1 will confirm empties for a superadmin with no scoped relationship.)*

---

## RPC security conclusions

All four (`superadmin_list_students(text,int,int)`, `superadmin_get_student_profile(uuid,text)`, `superadmin_get_student_report_bundle(uuid,text)`, `superadmin_platform_counts()`): `RETURNS jsonb`, `SECURITY DEFINER`, `SET search_path = public`, owner `postgres` (via SQL-editor apply). Hardening verified: `REVOKE EXECUTE FROM PUBLIC` + `FROM anon`, `GRANT TO authenticated`; each **re-checks** `has_role(auth.uid(),'superadmin'::public.app_role)` internally and `RAISE`s otherwise — RLS is never the sole guard.

- **Actor from `auth.uid()` only** — no actor/role parameter; no `raw_user_meta_data` trust; superadmin status from trusted `user_roles` (`enforce_role_assignment` blocks self-grant).
- **Anonymous fails safe** — `has_role(null,'superadmin')` → false → `RAISE`; also EXECUTE revoked from anon.
- **No injection surface** — no dynamic SQL/`EXECUTE`; `p_search` is used as a bound value in `ILIKE '%'||p_search||'%'` (a parameter, not concatenated into executable SQL); no caller-controlled table/column/order (fixed `ORDER BY created_at`); all objects schema-qualified (`public.*`).
- **Missing target** — profile/report return `null`/empty bundle and still write the audit row (attempted access recorded).

---

## Audit atomicity / fail-closed conclusion — CONFIRMED

Each RPC order is: authorize → (internal lookups into local vars) → build/read data into a local var → **`INSERT INTO public.audit_logs`** → **`RETURN`**. The sensitive value is returned **only after** the audit INSERT; any INSERT failure `RAISE`s and aborts the single function invocation/transaction, returning nothing. No exception is caught-and-ignored. The pre-audit profile lookup (for `target_school_id`) reads into a variable and is **not** returned before logging — no audit gap and no early sensitive disclosure.

---

## Audit data-minimization conclusion — CONFIRMED

Audit `details` carry metadata only: `actor_role`, `access_mode`, `resource_class`, `target_school_id?`, `result_count?`, `search_applied` (**boolean, not the raw term**), `counts?` (row counts), `reason?`. **No** answers/raw responses/scores/result objects/report text/AI prompts/reflections/full profile/raw search term are written. Structurally enforced and tested: no `audit_logs` INSERT contains `to_jsonb(` or `SELECT *` (the row serializer appears only in the *returned* bundle, never in the audit VALUES).

---

## Report-bundle conclusion (highest priority) — CONFIRMED

`superadmin_get_student_report_bundle`: every source binds to the **same** `p_student_id` — `assessments.user_id`, `big_five/caas/work_values.student_id`, and the profile cycle lookup (`profiles.id`) — so **no cross-student mixing** is possible. Return shape `{std, big_five, caas, work_values, current_cycle}` matches what `ComprehensiveReportView` consumes; per-table `ORDER BY completed_at DESC NULLS LAST` matches the prior UI reads. Exactly **one** `READ_STUDENT_REPORT` event; payload not logged (only `counts`). Missing/partial data → empty arrays. Audit failure → no bundle.

---

## Platform-counts conclusion

Needed: `profiles`/`assessments` counts required the removed global policies, so a superadmin-gated RPC is justified. Returns aggregate integers only (`schools/users/assessments`) — no row-level data. One `READ_PLATFORM_COUNTS` per dashboard mount (react-query cached) — not an event storm. Appropriately scoped.

---

## Application regression conclusion

- **StudentRoster** — uses `superadmin_list_students` only; search is **client-side over the fetched page**, so there is **no audit event per keystroke** (one fetch/one event on mount). No direct global profile select remains.
- **SuperAdminStudentDetail** — profile + report come solely from the two audited RPCs; no fallback to protected-table reads; report renders only once the bundle loads (else a loader — fails closed). Route/`studentId` cannot bypass authorization (the RPC self-gates on superadmin). Each RPC called once (distinct query keys) → no unintended duplicate audit rows.
- **AdminAssignment** — cross-school profile list via `superadmin_list_students` (superadmin-gated); the remaining `.from("profiles")` is the school-assignment **UPDATE** (a write), not a read; `user_roles`/`schools` reads are non-PF-007 tables.
- **SuperAdminDashboard** — counts via the audited RPC; no direct `.select()` on the five tables; failure surfaces as loading state, not an unaudited fallback.

---

## Counselor conclusion — no regression

`ComprehensiveReportView` receives `preloadedBundle` **only** on the superadmin route. Counselor/student mode passes no bundle → the `if (preloadedBundle) return …` guard is skipped and the existing scoped direct reads run under the unchanged `can_access_student_assessment` policies. Counselors call **no** `superadmin_*` RPC and gain no new requirement. The `queryKey` includes a `preloaded`/`direct` discriminator, so caches never collide. Switching students changes the key → old data is replaced by a loader, not left stale.

---

## Repository-wide bypass conclusion — CONFIRMED (no remaining global path)

Searched all of `src` for `.from(<one of the five>)`. Findings: every other direct read is **scoped** — student self-reads (`AssessmentHistory`, `StudentDashboard`), counselor reads (`CounselorDashboard/StudentDetail/Insights/Notes` via `is_assigned_counselor`), parent reads, or **admin tools** (`UserManagement`, `BulkTools`, `CounselorManagement`, `AdminInsights`) governed by `is_school_admin_for_user` (school-scoped) / with **no** admin assessment policy at all. Because no live policy grants a pure superadmin (or `admin`, which superadmin inherits) **global** SELECT on the five tables after the drop, these paths **cannot** return cross-school rows to a superadmin — they return only scoped rows or (for admin-tool assessment reads) empty. **No remaining route lets a superadmin exploit their identity to obtain global cross-school rows without the audited RPC.** PF-007 is fully remediated at the code level.

*(Note — functional, not security: `aiService.ts` and the admin bulk/insight tools issue direct reads that, for a cross-school superadmin, now return RLS-empty. This may degrade superadmin AI-synthesis/bulk features cross-school, but leaks nothing. Out of PF-007's read-audit scope; flagged for the owner.)*

---

## Migration correctness

`RETURNS jsonb` matches every `RETURN` (jsonb built via `jsonb_build_object`/`jsonb_agg`/`to_jsonb`); `count(*)`→integer and `current_assessment_cycle`→integer assignments are valid; `jsonb_array_length` operates on jsonb arrays; columns (`user_id`/`student_id`/`completed_at`/`current_assessment_cycle`/`is_archived`) exist in prior migrations; all objects qualified; `has_role`/`app_role`/`audit_logs` predate this timestamp. Timestamp `20260723170000` is unique and correctly ordered after 2B/2C. `DROP POLICY IF EXISTS` + `CREATE OR REPLACE FUNCTION` + explicit `REVOKE/GRANT` → clean replay and already-patched apply are both idempotent; no unrelated object dropped/replaced.

---

## Defects

**None acceptance-blocking.** Minor, non-blocking follow-ups (documented, not fixed here per the review's default-no-change rule):

1. **`reason` length not bounded** (Low). `superadmin_get_student_profile`/`_report_bundle` accept `p_reason text` stored verbatim in `audit_logs.details`. The current UI always passes `null`, but a direct RPC caller could store a large string. **Recommend** a defensive `left(p_reason, 500)` (or a CHECK) when a reason workflow is introduced. Not exploitable for data exposure; non-blocking.
2. **List ordering lacks a stable tiebreaker** (Low). `ORDER BY created_at DESC NULLS LAST` without an `id` tiebreaker is non-deterministic across equal timestamps — irrelevant today (roster fetches ≤500 once and filters client-side; no real pagination), but add `, id` before server-side pagination is used.
3. **Report/profile RPC error shows an infinite loader** (Low, UX). In `SuperAdminStudentDetail`, a report-bundle query *error* (vs loading) leaves `reportBundle` undefined → perpetual spinner with no error message. Fails **closed** (no stale/leaked data); add an error state for polish.
4. **`(supabase as any).rpc(...)`** (maintainability). Intentional/temporary until `types.ts` is regenerated post-apply (noted in `02-…md` §A). Returned data is cast to explicit shapes; null/degraded responses render as empty rather than crashing. Regenerate types as a follow-up.

No blocking issue found: no direct bypass, no unsafe DEFINER, no skippable/insufficient audit, no sensitive audit payload, no non-superadmin access, no wrong grant, no invalid SQL, no cross-student mix, no counselor regression, no stale-sensitive-UI leak, no impactful test false-positive.

---

## Validation performed

| Check | Result |
|---|---|
| Structural verifier (51 assertions) | **51/51 pass** |
| Report-bundle per-student binding | all four sources + profile bound to `p_student_id` (grep-confirmed) |
| `git diff --check` | clean (only a benign CRLF-normalization notice) |
| `npx tsc --noEmit -p tsconfig.app.json` | **0 new errors** (only the pre-existing 10 `TS2307` date-fns/embla baseline) |
| `npx vitest run` | **blocked** locally (broken `node_modules`); CI: `npm ci && npx vitest run src/test/privilegedReadAudit.test.ts` |

No dependencies installed, no SQL applied, no deploy.

---

## Readiness — **all conditions met; applied & runtime-verified in production (2026-07-23)**

- **Safe to commit:** ✅ done (migration + test + 5 refactors + docs merged).
- **Safe for preview apply:** ✅ done.
- **Safe to merge to main:** ✅ done — the runtime matrix was confirmed (production + preview): C1 direct-select-empty, one-audit-row-per-RPC with metadata-only payload, non-superadmin denial, counselor regression, C6 tamper-resistance.
- **Safe for production apply:** ✅ **applied** — migration `20260723170000` present once in `schema_migrations`; five global superadmin SELECT policies removed; four audited RPCs present; no `anon`/`PUBLIC` RPC EXECUTE; direct global cross-school SELECT removed; audit events `READ_PLATFORM_COUNTS`/`READ_STUDENT`/`READ_STUDENT_REPORT` observed with metadata-only payloads.
- **Remaining conditions:** none for PF-007 closure. The **forced-audit-failure (C4)** test was intentionally **not** run in production — it stays a disposable/preview **regression-test condition**, not an open production vulnerability. Non-blocking follow-ups persist (bound `p_reason`; list `id` tiebreaker; detail/report error UI; regenerate types).
- **PF-007 status:** **Closed in production** — scoped to *privileged/superadmin cross-school reads of the five PF-007 tables no longer using the former unaudited global SELECT path*. Not a claim that all DB/server/service-role reads platform-wide are globally audited (PostgreSQL owner/superuser activity, trusted service-role/internal maintenance, infrastructure-level auditing, and unrelated future privileged read surfaces remain outside this closure unless separately governed).

*(The verdict and pre-apply readiness above were authored before deployment; this block records the confirmed post-deployment state per the production-evidence housekeeping. The migration/test/RPCs/frontend are unchanged.)*

---

## Confirmation

The remediation has since been **applied and runtime-verified in production** (evidence in `01-implementation-summary.md` → Production evidence). This documentation-housekeeping revision changed **docs only** — no SQL was applied, no migration/test/application/config was modified, and nothing was deployed as part of it. PF-011/PF-012/PF-013 untouched. No other remediation phase was started.
