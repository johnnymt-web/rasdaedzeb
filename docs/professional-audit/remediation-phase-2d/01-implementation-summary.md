# Phase 2D.2 — Audited Superadmin Read Boundary (PF-007): Implementation Summary

**Branch:** `fix/privileged-read-audit-phase2d` · **Date:** 2026-07-23 · **Scope:** remove the five direct superadmin SELECT policies and route cross-school reads through audited `SECURITY DEFINER` RPCs. **Status: applied and runtime-verified in production — see the Production evidence section; PF-007 Closed in production.** (This doc was authored pre-apply; the production-evidence and status sections below reflect the confirmed deployed state.) Controlling design: `00-discovery-and-architecture.md`.

## PF-007 root cause

A `superadmin` could read every school's minors' PII + psychometric results with **no audit trail**, via five permissive global `FOR SELECT` policies (`20260723120000_capture_superadmin_select_policies.sql`) on `profiles` + the four assessment tables. `audit_logs` had **no** read-event logging, and PostgreSQL **cannot** trigger on `SELECT` — so the only reliable in-repo record point is a `SECURITY DEFINER` RPC boundary, which is only effective once the direct-SELECT bypass is removed.

## Architecture implemented (Phase 2D.1 Option A)

Remove the five direct policies; provide narrow, superadmin-gated `SECURITY DEFINER` read RPCs that **authorize → read → write ONE audit event → return**, atomically and fail-closed. After the migration a superadmin's direct `.from(<table>).select(...)` on the five tables returns **no** cross-school rows (no policy grants them SELECT); the RPCs — reading as the function owner (RLS-exempt) — are the only client path. `audit_logs` is reused **unchanged** (client-immutable: SELECT-only policy, no client INSERT/UPDATE/DELETE).

## Five policies removed

`Superadmin select all profiles` (profiles), `Superadmin select all assessments` (assessments), `Superadmin select all big_five` (big_five_assessments), `Superadmin select all caas` (caas_assessments), `Superadmin select all work_values` (work_values_assessments). **No** self/parent/counselor/school-admin scoped policy is touched (the migration drops exactly these five and creates/alters no policy).

## RPCs created (all `SECURITY DEFINER`, `search_path=public`, superadmin-gated, audited)

| RPC | Purpose | Audit action | Screen |
|---|---|---|---|
| `superadmin_list_students(p_search text, p_limit int≤500, p_offset int)` → `jsonb[]` | cross-school profile list/search (bounded page) | `READ_STUDENT_LIST` (one event/request, `result_count`, **no raw search term**) | StudentRoster, AdminAssignment |
| `superadmin_get_student_profile(p_student_id uuid, p_reason text)` → `jsonb` | one student's profile + school name | `READ_STUDENT` (target student, target school) | SuperAdminStudentDetail (header) |
| `superadmin_get_student_report_bundle(p_student_id uuid, p_reason text)` → `jsonb` | profile cycle + all 4 assessment tables for one student | `READ_STUDENT_REPORT` (target student; **counts only**, never the payload) | SuperAdminStudentDetail (report) |
| `superadmin_platform_counts()` → `jsonb` | aggregate `{schools, users, assessments}` (non-PII) | `READ_PLATFORM_COUNTS` | SuperAdminDashboard |

## Exact authorization model

Each RPC first runs `IF NOT public.has_role(auth.uid(),'superadmin'::public.app_role) THEN RAISE EXCEPTION`. `has_role(_, 'superadmin')` is true **only** for `user_roles.role='superadmin'` — platform `admin` does **not** satisfy it (admin↔superadmin inheritance is one-way: superadmin→admin only). So **anon, student, counselor, school admin, and platform admin are all rejected**; actor is derived from `auth.uid()` (never a parameter or JWT metadata); superadmin status is the trusted `user_roles` value (not client-settable — `enforce_role_assignment`). Privilege hardening: `REVOKE EXECUTE … FROM PUBLIC`, `FROM anon`; `GRANT EXECUTE … TO authenticated` (each RPC re-checks superadmin internally — RLS is never the sole guard inside the DEFINER function).

## Audit event contents (metadata only)

`audit_logs`: `admin_id=auth.uid()` (actor), `action` (above), `target_type` (`profile`/`student_report`/`platform`), `target_id` (student id for detail/report; null for list/counts), `details` = `{actor_role:'superadmin', access_mode, resource_class, target_school_id?, result_count?, search_applied(boolean, not the term), counts?, reason?}`, `created_at`. **Never stored:** assessment answers, raw responses, scores, report/AI text, prompts, or the raw search term (could contain a minor's name). Structurally enforced: no `audit_logs` INSERT embeds `to_jsonb(...)` or `SELECT *` (test-checked).

## Fail-closed behavior

Audit INSERT and data read/return occur in **one** function invocation (one transaction). Sensitive data is returned **only after** the audit INSERT succeeds; any failure `RAISE`s and aborts the whole function → **no data returned**. Audit failures are never caught-and-ignored. Applies to list, detail, report, and counts.

## Direct-read bypass conclusion

With the five policies removed, superadmin has **no** RLS SELECT grant on the five tables → direct PostgREST reads return empty; the audited RPCs are the sole cross-school door. **PF-007's unaudited direct-read bypass is closed in code** — and, as of 2026-07-23, **verified in production** (see the Production evidence section).

## Application files changed

| File | Change |
|---|---|
| `src/components/superadmin/StudentRoster.tsx` | profiles list → `rpc('superadmin_list_students', {p_limit:500})`; client-side search over the fetched page |
| `src/pages/SuperAdminStudentDetail.tsx` | profile header → `rpc('superadmin_get_student_profile')`; report → `rpc('superadmin_get_student_report_bundle')` passed as `preloadedBundle`; renders report only once the bundle loads |
| `src/components/assessment/ComprehensiveReportView.tsx` | **new optional `preloadedBundle` prop** + exported `SuperadminReportBundle` type; when supplied, renders from it and performs **no** direct reads. **Counselor/student path unchanged** (no prop → existing scoped direct reads) |
| `src/components/superadmin/AdminAssignment.tsx` | cross-school profiles list → `rpc('superadmin_list_students', {p_limit:500})` |
| `src/pages/SuperAdminDashboard.tsx` | count reads → `rpc('superadmin_platform_counts')` |

RPC calls use `(supabase as any).rpc(...)` because the generated Supabase types are regenerated **after** the migration is applied (documented; consistent with the existing `start_new_assessment_cycle` pattern). No service-role key is introduced anywhere in the frontend (test-checked). `SchoolManagement.tsx` reads only `schools` (non-PII) → unchanged.

## Counselor regression conclusion

`ComprehensiveReportView` in counselor mode receives **no** `preloadedBundle`, so it keeps its existing direct reads governed by the unchanged `can_access_student_assessment` (self/parent/counselor) scoped policies. The superadmin removal does not affect counselor/school-scoped access. (Runtime confirmation in `02-…md`.)

## Migration filename

`supabase/migrations/20260723170000_audited_superadmin_read_boundary.sql` (one additive migration: 5 policy drops + 4 RPCs + privilege hardening).

## Tests

`src/test/privilegedReadAudit.test.ts` (structural regression): the 5 policies dropped (exactly, only superadmin ones); no CREATE/ALTER POLICY, no `FOR SELECT/…`; each RPC is `SECURITY DEFINER` + pinned search_path + superadmin gate + audit-before-return; four expected actions; list logs one event with `result_count`; report bundle covers all 4 assessment tables; no audit INSERT embeds `to_jsonb`/`SELECT *`; REVOKE PUBLIC+anon / GRANT authenticated for all 4; the 4 superadmin screens issue no direct `.from(<protected>).select()`; detail uses both RPCs; `ComprehensiveReportView` keeps the counselor path AND accepts the bundle; no service-role secret in shipped frontend. **51/51 assertions pass** via the dependency-free verifier (vitest blocked locally — broken `node_modules`; CI: `npm ci && npx vitest run src/test/privilegedReadAudit.test.ts`). `tsc`: **0 new errors** (only the pre-existing 10 `TS2307` date-fns/embla baseline).

## Production evidence (verified 2026-07-23)

The migration has since been applied and runtime-verified in production (recorded here as documentation housekeeping; no code/SQL/migration/test was changed to record it):

| Item | Verified value |
|---|---|
| Migration `20260723170000` in `supabase_migrations.schema_migrations` | **exactly 1 row** |
| Five `Superadmin select all …` global SELECT policies | **removed** |
| Four audited RPCs (`superadmin_list_students`, `_get_student_profile`, `_get_student_report_bundle`, `_platform_counts`) | **present** |
| Privileged RPC EXECUTE for `anon` / `PUBLIC` | **none** (endpoint not executable) |
| `authenticated` EXECUTE | granted, but each RPC independently enforces the trusted `superadmin` role |
| `service_role` / privileged DB roles | may retain internal EXECUTE as expected (trusted, not a browser identity) |
| Direct global superadmin cross-school SELECT | **removed** — privileged reads now pass through the audited RPC boundary |
| Runtime audit events observed | `READ_PLATFORM_COUNTS`, `READ_STUDENT`, `READ_STUDENT_REPORT` |
| Audit payload | **metadata only** — actor role, access mode, resource class, target student id (where applicable), target school id, record/result counts, optional reason. **No** assessment answers, raw psychometric responses, scores, report text, AI prompts, or full sensitive payload |

## PF-007 status — **Closed in production**

Closure is scoped to the confirmed finding: **privileged/superadmin cross-school reads of the five PF-007 tables can no longer use the former unaudited global SELECT path and are routed through the audited privileged-read boundary.** This does **not** claim that all database/server/service-role reads across the platform are globally audited. Outside this closure unless separately governed: PostgreSQL owner/superuser activity, trusted service-role/internal maintenance, infrastructure-level DB auditing, and unrelated future privileged read surfaces.

## Limitations

- **Forced-audit-failure test** (audit INSERT fails → privileged data must not be returned) was **not** intentionally executed against production. It is covered by implementation design + static review and remains a **regression-test condition** for a disposable test/preview DB — **not** an open production vulnerability.
- Roster/admin-assignment lists are bounded to the first **500** profiles (client-side search over the page) — sufficient for pilot scale; a future server-side search/pagination increment can lift this.
- Non-blocking follow-ups (not implemented here): bound `p_reason` if a reason workflow is introduced; add an `id` tiebreaker for deterministic list ordering if server pagination is added; improve the superadmin detail/report error UI; regenerate Supabase types to remove the temporary `(supabase as any).rpc(...)`.
- In-tenant (school-admin/counselor) read logging and cross-school reads of other tables are out of scope (superadmin has no global policy there today).

## Confirmation

The remediation migration has been **applied and runtime-verified in production** (evidence above). This documentation-housekeeping update changed **docs only** — no SQL, migration, test, application code, or configuration was modified, and nothing was deployed or applied as part of it. PF-006's capture is superseded by the removal here (the 5 policies were the PF-007 vector); PF-011 (grade/cycle), PF-012 (delete denial), PF-013 (self-deletion) objects are untouched. No scoring/AI change. No unrelated remediation started.
