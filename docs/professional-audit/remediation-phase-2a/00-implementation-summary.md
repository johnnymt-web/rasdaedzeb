# Phase 2A — Protect Student Grade & Assessment Cycle (PF-011): Implementation Summary

**Branch:** `fix/profile-field-protection-phase2a` · **Date:** 2026-07-23 · **Scope:** DB-enforced protection of controlled `profiles` fields only. Nothing applied/deployed; no production change.

## Confirmed root cause

The `Update own profile` RLS policy (`20260605210211_phase1a_security_rls.sql:193`) is `FOR UPDATE USING (is_self(id)) WITH CHECK (is_self(id))` — **no column restriction**. Only `school_id` was guarded (by the `protect_school_id_update` trigger). So an authenticated student could `UPDATE` their own `profiles` row and set:
- **`grade`** → changes grade band → changes which assessments are shown and how the report/AI interpret them (`gradeLogic.ts` / `gradeBands.ts`);
- **`current_assessment_cycle`** → changes which cycle's attempts are grouped → breaks longitudinal comparability.

Both were reachable by a direct API/DB call regardless of the UI. Traced path: `student client → supabase.update(profiles) → "Update own profile" policy (passes, is_self) → (only school_id trigger) → stored grade/cycle → gradeLogic/gradeBands drive assessment selection & interpretation`.

## Fields protected (exact)

- `public.profiles.grade`
- `public.profiles.current_assessment_cycle`

Equivalent-name search found no other controlled profile column (`grade_band` lives on `public.assessments`, server-stamped at submission; no `grade_level` / `development_stage` / `cycle` columns on `profiles`).

## Trusted-role matrix (minimum, evidence-based)

| Field | Student (owner) | Counselor | School admin | Platform admin / superadmin | service_role / internal |
|---|---|---|---|---|---|
| `grade` | ❌ | ❌ | ✅ | ✅ (`has_role 'admin'`; superadmin inherits) | ✅ bypass |
| `current_assessment_cycle` | ❌ direct — ✅ only via `start_new_assessment_cycle()` (controlled +1 on own row) | ❌ | ✅ | ✅ | ✅ bypass |

Rationale from repo evidence: the only legitimate `grade` writer is admin `BulkTools` (behind the admin route) — runs as `admin` → permitted; signup writes `grade` to `user_metadata` (not a profiles UPDATE). The only `current_assessment_cycle` writer is the student retake flow — re-routed to the RPC. Counselors have no grade/cycle-write workflow → not granted. service_role (onboarding/promotion scripts, edge functions) bypasses, exactly as the prior `school_id` guard.

## Database enforcement

Single migration `supabase/migrations/20260723130000_protect_controlled_profile_fields.sql`:
- **`public.protect_controlled_profile_fields()`** — `SECURITY DEFINER`, `SET search_path = public`, plpgsql. Supersedes `protect_school_id_update()`. Enforces (only for JWT `role='authenticated'` requests; service/internal bypass): `school_id` (preserved verbatim), `grade`, and `current_assessment_cycle`, each with null-safe `IS DISTINCT FROM`. Rejects unauthorized changes with `RAISE EXCEPTION` (no silent revert; non-sensitive message). Authorization uses trusted helpers `has_role(auth.uid(), 'admin')` and `is_school_admin_for_user(OLD.id)` — never `raw_user_meta_data` or client-supplied role.
- **Trigger** `tr_protect_controlled_profile_fields` `BEFORE UPDATE ON public.profiles` — replaces the single existing `tr_protect_school_id` (no second overlapping trigger; the old trigger + `protect_school_id_update()` are dropped). One protection trigger remains → no trigger-order ambiguity introduced.
- **`public.start_new_assessment_cycle()`** — `SECURITY DEFINER`, `search_path=public`; the trusted retake path. Sets a transaction-local flag (`set_config('app.cycle_update_ok','on',true)`) and does a controlled `current_assessment_cycle = COALESCE(...,1)+1` on `auth.uid()`'s own row. `REVOKE ALL FROM public` + `GRANT EXECUTE TO authenticated`. A direct client cycle `UPDATE` never sets the flag → rejected.

## Application files changed

- `src/pages/AssessmentHistory.tsx` — the retake handler now calls `(supabase as any).rpc("start_new_assessment_cycle")` instead of the direct `.update({ current_assessment_cycle })` (matches the repo's existing `rpc('delete_user')` pattern). This is the **only** app change required; no student grade-edit path existed (the Profile page updates `full_name` only; grade is read-only there), and admin `BulkTools` grade writes run as `admin` and remain permitted.

## Historical integrity (§7)

No retroactive risk: each assessment attempt already stores its context **at submission** — `assessments` carries `grade_band`, `question_set_version`, `cycle_number` (server-stamped by `submit-assessment`); the satellite tables carry `cycle_number`. Changing the current `profiles.grade` later does not alter these stored rows. No assessment-history redesign was done or needed.

## Tests added

- `src/test/profileFieldProtection.test.ts` — CI-runnable **structural** regression tests: the migration defines a `BEFORE UPDATE` trigger on `profiles`; guards `grade` and `current_assessment_cycle` with `IS DISTINCT FROM`; uses trusted role helpers (not `raw_user_meta_data`); `SECURITY DEFINER` + pinned `search_path`; preserves the `school_id` guard; adds no write policy/grant; provides `start_new_assessment_cycle()` (controlled +1, `GRANT … TO authenticated`, GUC flag). App assertions: retake calls the RPC and no longer issues a direct cycle `UPDATE`.
- **Runtime DB-trigger tests** (synthetic users, disposable Postgres) are specified in `01-production-verification-checklist.md` — these cannot run in vitest (no DB) and are marked **pending**.

## Commands executed & results

| Command | Result |
|---|---|
| Migration structural check (parens, guards, single trigger, drops old, RPC grant, no write policy, no raw_user_meta_data) via Node | **all pass**; valid UTF-8 |
| App-change assertions (rpc call present, no direct cycle update, no leftover var) via Node | **3/3 pass** |
| `npx tsc --noEmit -p tsconfig.app.json` | 10 errors, **all pre-existing `TS2307` missing-module** (`date-fns`/`embla`); **0 in any Phase 2A file** |
| `npx vitest run src/test/profileFieldProtection.test.ts` | **Not runnable** — local `node_modules` broken (vite-node/`debug`); run in CI: `npm ci && npx vitest run src/test/profileFieldProtection.test.ts` |

## Limitations

- Runtime trigger/RLS behavior (student rejection, admin success, RPC success, service bypass) requires a disposable Postgres with synthetic users — not available in this session; specified for CI/preview.
- The `start_new_assessment_cycle` RPC is not in the generated `types.ts` `Functions` map; the caller uses `(supabase as any).rpc(...)` (repo precedent) so typecheck stays clean. Regenerating types is a separate follow-up.

## Confirmation

No SQL was applied. Nothing was deployed. One migration created (not applied). One app file + one test file changed. No unrelated remediation started (PF-012 untouched). No RLS policy, scoring, AI, consent, or superadmin change.
