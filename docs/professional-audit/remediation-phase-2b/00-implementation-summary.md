# Phase 2B — Protect Assessment History from Direct Deletion (PF-012): Implementation Summary

**Branch:** `fix/assessment-deletion-protection-phase2b` · **Date:** 2026-07-23 · **Scope:** block direct hard-deletion of assessment/history records. Nothing applied/deployed; no production change.

## PF-012 root cause (confirmed)

RLS granted students ownership-based **hard DELETE** on their own completed-assessment rows. Traced path: `student → Supabase/API DELETE → permissive DELETE RLS policy (is_self) → assessment table row removed`. The offending policies (`20260605210211_phase1a_security_rls.sql`):
- `Delete own assessments` — `ON assessments FOR DELETE USING (is_self(user_id))`
- `Delete own big_five` — `ON big_five_assessments FOR DELETE USING (is_self(student_id))`
- `Delete own caas` — `ON caas_assessments FOR DELETE USING (is_self(student_id))`

**Live confirmation:** the `pg_policies` export A2 captured earlier this session (2026-07-23) shows these are the **only** DELETE policies on any completed-assessment table; `work_values_assessments` already had none. UI hiding was not a boundary — a direct API/console DELETE succeeded.

## Affected-table inventory (repository + live evidence)

| Table | Purpose | Owner col | Prior DELETE policy | Notes |
|---|---|---|---|---|
| `public.assessments` | RIASEC / Skills / EQ attempts (`assessment_type`) | `user_id` | **`Delete own assessments` (unsafe)** | also Phase-B write-locked (service-role INSERT only) |
| `public.big_five_assessments` | Big Five attempts | `student_id` | **`Delete own big_five` (unsafe)** | |
| `public.caas_assessments` | CAAS attempts | `student_id` | **`Delete own caas` (unsafe)** | |
| `public.work_values_assessments` | Work Values attempts | `student_id` | none | already delete-denied |

Not completed-assessment attempts (checked, no student DELETE policy, out of scope): `reflections`, `employability_skills`, `student_skill_snapshots`, `skills_gap_analyses`, `ai_reports`/`ai_report_counselor_notes` (regenerable synthesis cache), `student_goals` (career goals). EQ/RIASEC/Skills have no separate tables — they live in `public.assessments`.

## Unsafe policies found & removed

The three `Delete own …` policies above (the sole PF-012 vector).

## Final deletion authorization model

**No client role may hard-delete assessment history.** Deletion is reserved for trusted internal/governed operations.

| Table → / Role ↓ | anon | student/owner | counselor | school admin | platform admin | superadmin | service_role / internal |
|---|---|---|---|---|---|---|---|
| assessments | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ (BYPASSRLS; + governed account-erasure cascade) |
| big_five_assessments | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |
| caas_assessments | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |
| work_values_assessments | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |

Least privilege: no repository/product evidence that counselors or admins need to hard-delete assessment attempts (admins archive students via `profiles.is_archived`, and account removal goes through the governed `delete_user` RPC). So **no** client DELETE policy is granted to any role. `service_role` bypasses RLS by design for internal maintenance.

## Database remediation (migration)

`supabase/migrations/20260723150000_block_assessment_history_deletion.sql`:
1. **DROP** the three unsafe `Delete own …` policies.
2. **ADD** an explicit **restrictive** deny on all four assessment tables: `AS RESTRICTIVE FOR DELETE TO public USING (false)`. Restrictive policies are AND-ed with any permissive policy, so even if a future migration re-introduces a permissive `Delete own …` policy (a realistic regression vector), client DELETE stays denied. SELECT/INSERT/UPDATE untouched; no function/trigger/grant/scoring change.

`service_role` (BYPASSRLS) and `ON DELETE CASCADE` from governed account erasure are unaffected (restrictive policies do not constrain BYPASSRLS roles or system-initiated cascades).

## Privacy / erasure distinction

This blocks **uncontrolled** direct DELETE while **preserving** governed erasure: account-level deletion via the admin-only `public.delete_user` RPC (`SECURITY DEFINER`, `has_role 'admin'` check, writes an `audit_logs` entry) cascades assessment rows — the legitimate erasure path. A full DSAR/consent-driven erasure workflow is a **separate governed process** (not implemented here, documented as follow-up). No claim is made about required retention periods.

## Cascade review

- Satellite tables (`big_five_/caas_/work_values_assessments`) declare `student_id … REFERENCES auth.users(id) ON DELETE CASCADE`; `assessments.user_id` is the student's `auth.users` id. So the **only** cascade path to assessment history is deleting the `auth.users` account row.
- That row is reachable through **two** SECURITY DEFINER RPCs: (a) the admin-only, audited `public.delete_user` (`has_role 'admin'`, writes `audit_logs`) — **not** student-accessible; and (b) `public.request_self_deletion` (`20260417233000_gdpr_self_delete.sql`), which has **no role gate** and lets an authenticated user delete **their own** `auth.users` row. `request_self_deletion` is exposed via PostgREST (present in generated `types.ts`), has **no explicit REVOKE** in the repo, and is **not** called from the frontend — but a student could invoke it directly. `profiles` has **no** student DELETE policy and its FK targets `auth.users` (deleting a profiles row is not student-accessible and does not cascade to assessments), so there is no *additional* bypass beyond these two account-erasure RPCs.
- **Residual (tracked follow-up, out of Phase 2B's direct-DELETE scope):** `request_self_deletion` IS a student-accessible cascade path that erases a minor's assessment history. This is whole-account GDPR self-erasure — a materially different action from the surgical PF-012 vector (delete one attempt, keep the account) — and a restrictive DELETE policy cannot, by design, constrain a SECURITY-DEFINER cascade. It is nonetheless **not well-governed for minors** (no audit entry, no consent/parental gate, no anon REVOKE) and **must be governed before pilot**. Phase 2B does not change it. See `02-final-security-review.md`.

## Application files changed

**None.** Repository search found **zero** `.delete()` calls on any assessment table (the app never deletes assessment history). Phase 2A's retake creates a **new cycle** (via `start_new_assessment_cycle()`), preserving prior attempts — it does not delete. Removing the DELETE policies breaks no workflow.

## Tests added

`src/test/assessmentDeletionProtection.test.ts` — CI-runnable structural regression: the migration drops the three unsafe policies; adds a restrictive `USING (false)` DELETE deny on all four tables; touches no SELECT/INSERT/UPDATE policy and no function/trigger/grant; and **no source file** issues a `.delete()` on an assessment table. Runtime DB tests (synthetic users) are specified in `01-preview-and-production-verification.md` (pending — no local Postgres).

## Commands executed & results

| Command | Result |
|---|---|
| Migration + app-surface structural verifier (11 assertions, Node, correct escaping) | **11/11 pass**; parens balanced; valid UTF-8 |
| `npx tsc --noEmit -p tsconfig.app.json` | pre-existing `TS2307` missing-module errors only; **0 in any Phase 2B file** |
| `git diff --check` | clean |
| `npx vitest run src/test/assessmentDeletionProtection.test.ts` | **not runnable** — local `node_modules` broken (vite-node/`debug`); CI: `npm ci && npx vitest run …` |

## Limitations

- Runtime DELETE-denial behavior (student/anon rejection, restrictive-policy effect, service-role bypass, cascade via `delete_user`) requires a disposable Postgres with synthetic users — pending; full spec in `01-…`.

## Confirmation

No SQL applied; nothing deployed. One migration created (not applied). No application file changed. No unrelated remediation started (no scoring/AI/consent/superadmin/PF-011 change; PF-011's Phase 2A work is on a separate branch).
