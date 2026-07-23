# Phase 2A — Final Security & Acceptance Review (PF-011)

**Reviewer:** independent Postgres/RLS/trigger-security review · **Date:** 2026-07-23 · **Branch:** `fix/profile-field-protection-phase2a` (uncommitted). Two minimal hardening corrections were applied during review (§Defects); no other change.

## Verdict: **Accept with conditions**

The implementation correctly enforces controlled-field protection at the database layer, the RPC is safe and owner-scoped, and the previously-noted GUC concern was hardened to bind the bypass to the authenticated owner. It is **safe to commit, merge, and validate in preview.** The conditions are the runtime trigger/RLS tests, which require a disposable Postgres and could not be executed here.

## Root-cause confirmation

- **Prior vulnerability:** `Update own profile` (`phase1a:193`) = `FOR UPDATE USING (is_self(id)) WITH CHECK (is_self(id))` — row-level self-update with **no column restriction**; only `school_id` was trigger-guarded. So the profile owner could directly write `grade` and `current_assessment_cycle`. UI hiding was not a security boundary.
- **New boundary:** a `BEFORE UPDATE` trigger on `public.profiles` (`protect_controlled_profile_fields`, `SECURITY DEFINER`, `search_path=public`) that rejects unauthorized changes to `school_id`, `grade`, and `current_assessment_cycle`. Database-trigger enforcement is the correct boundary (independent of client/UI).

## Trigger conclusion

- **Protected:** `grade`, `current_assessment_cycle`, and the preserved `school_id` — all via null-safe `IS DISTINCT FROM`; unrelated fields (`full_name`, `avatar_url`, `preferred_language`, …) remain student-editable. ✅
- **Authorization:** derived from trusted helpers `public.has_role(auth.uid(),'admin')` and `public.is_school_admin_for_user(OLD.id)`; **never** `raw_user_meta_data` or request-body role. `RAISE EXCEPTION` (no silent revert); messages are generic (no authz internals). ✅
- **Fail-safe context:** the whole block is gated on JWT `role='authenticated'`; a NULL/missing claim → `v_authenticated=false` → enforcement is skipped **only** for non-authenticated (service/internal) contexts, which by definition are trusted. Anonymous end-users cannot reach `profiles` UPDATE at all (RLS `is_self`, `auth.uid()` null). For the cycle/grade checks, `has_role(NULL,…)` and `is_school_admin_for_user` both return false → an authenticated actor with no admin role is rejected. ✅
- **`search_path` pinned** to `public`; schema-qualified helper calls. ✅
- **Trigger ordering:** exactly **one** protection trigger remains (`tr_protect_controlled_profile_fields`); the old `tr_protect_school_id` + `protect_school_id_update()` are dropped **only after** the superseding function/trigger (with equal-or-stronger school_id protection) is created. The other profile trigger (`update_profiles_updated_at`) only sets `updated_at`; order is immaterial because any violation `RAISE`s and aborts. No bypass via ordering. ✅

## Transaction-local flag review (§6 — the high-risk area)

- **Flag:** `app.cycle_update_ok`, set via `set_config('app.cycle_update_ok','on', true)` — the third arg `true` makes it **transaction-local**.
- **Set only** inside `start_new_assessment_cycle()` (SECURITY DEFINER). **Read** by the trigger.
- **Spoofability analysis (can an ordinary authenticated user set it?):** No path found — supabase-js/PostgREST issues a **single** SQL statement per request (no multi-statement to prepend `set_config`); PostgREST does **not** expose a generic `set_config`/`SET` interface or allow clients to set arbitrary `app.*` GUCs via headers/JWT (only the `request.*` namespace is populated by PostgREST); no other exposed RPC sets this GUC. Transaction-local (`true`) → **no connection-pool leak** across pooled requests, and it is cleared automatically on COMMIT/ROLLBACK (so exception paths clear it). Nested/reused transactions do not retain it past their boundary.
- **Hardening applied (defense-in-depth, per the preferred property):** the trigger no longer trusts the flag alone. The cycle change is now allowed only when `(app.cycle_update_ok='on' AND OLD.id = auth.uid())` **or** an admin. The bypass is thus bound to **both** the trusted execution context (flag set only by the RPC) **and** the authenticated profile owner — so even a hypothetical stray flag could never authorize a change to another row. Combined with RLS (`is_self`) this is now belt-and-suspenders. ✅

## RPC conclusion — `public.start_new_assessment_cycle()`

- `SECURITY DEFINER` (necessary — it must set the blessed flag and update through the trigger) with `search_path=public`, schema-qualified. ✅
- **No client-selected target:** takes **no arguments**; resolves the subject solely via `v_uid := auth.uid()` and updates `WHERE id = v_uid`. Cannot touch another student's row. ✅
- **Anonymous rejected:** `IF v_uid IS NULL THEN RAISE EXCEPTION 'Not authenticated'`. Not granted to `anon` (`REVOKE ALL FROM public; GRANT EXECUTE TO authenticated`). ✅
- **Increment semantics:** exactly one atomic `current_assessment_cycle = COALESCE(current,1)+1` on the caller's row; **no arbitrary/decrement/reset value** possible; NULL handled via COALESCE; raises if no profile row. ✅
- **Concurrency:** two concurrent calls serialize on the row `UPDATE` lock → each applies one increment (net +2 for two calls). This is correct per-call behavior, not a defect. **Idempotency note:** rapid double-invocation yields multiple cycles; the client guards with `isStartingNewCycle` (button disabled), and rate limiting is explicitly out of scope this phase — documented, non-blocking.
- **Minimal result:** returns the new integer only; exposes no other profile data. Cannot alter `grade`. ✅

## Authorization matrix (final, as implemented)

| Actor | Ordinary profile fields | `grade` (direct) | `current_assessment_cycle` (direct) | Start cycle via RPC |
|---|---|---|---|---|
| Student (owner) | ✅ (existing policy) | ❌ rejected | ❌ rejected | ✅ own row only, controlled +1 |
| Counselor | (their own profile only) | ❌ rejected | ❌ rejected | ✅ only for their own profile (not a student-management path) |
| School admin (same school) | — | ✅ | ✅ | — |
| School admin (other school) | — | ❌ (school mismatch) | ❌ | — |
| Platform admin (`admin`) / superadmin (inherits `admin`) | — | ✅ | ✅ | — |
| service_role / internal | ✅ bypass | ✅ bypass | ✅ bypass | n/a |
| Anonymous | ❌ (no profile access) | ❌ | ❌ | ❌ (RPC raises) |

Verified against helper logic, not assumption: `has_role` grants `admin` to superadmins via the `role='superadmin' AND _role='admin'` clause (`20260618170000`). Counselors are **not** granted controlled-field writes (no repository evidence of such a workflow). service_role bypass is required for onboarding/promotion/edge functions and cannot be impersonated by an authenticated user (distinct JWT `role`).

## School-admin scope

`is_school_admin_for_user(OLD.id)`: actor from `auth.uid()`; target's `school_id` read from the stored `profiles` row (BEFORE-trigger = OLD value); requires actor `role='admin'` with **non-NULL** matching `school_id`. A client cannot pass a different school. A combined `school_id + grade` update cannot bypass: the grade check evaluates against the **stored (OLD)** school, and the `school_id` change is independently blocked for non-school-admins. NULL school fails safely. ✅

## Historical integrity

Assessment attempts store their context at submission — `assessments.grade_band`, `question_set_version`, `cycle_number`; satellite tables carry `cycle_number`. Changing the current `profiles.grade` does not retroactively reinterpret earlier attempts. The migration introduces no regression here. (Any residual "report re-derives band from current grade for display gating" is pre-existing and out of scope.) ✅

## Application compatibility

`AssessmentHistory.tsx`: the direct `.update({current_assessment_cycle})` is **fully removed**; the retake now calls `(supabase as any).rpc("start_new_assessment_cycle")` through the authenticated client; errors are thrown (no success shown on failure — the `toast.error`/return path is preserved); `refreshProfile()` updates UI state; the button is disabled during the call (`isStartingNewCycle`); **no** user-supplied cycle number is sent; **no** silent fallback to a direct update. `(supabase as any)` is required only because the RPC is absent from generated `types.ts` — a maintainability note (regenerate types later), not a security defect. ✅

## Defects

| # | Severity | Blocking | Evidence | Correction |
|---|---|---|---|---|
| D1 | Medium | No (hardening) | Cycle branch allowed the change on `app.cycle_update_ok='on'` **without** binding to `OLD.id = auth.uid()`; the task's preferred property requires binding the bypass to the authenticated owner (no exploitable spoof path was found, but flag-alone reliance was undesirable) | **Fixed:** trigger now requires `(flag='on' AND OLD.id = auth.uid())`; test asserts it |
| D2 | Low | No | Rollback comment said restoring the `school_id` guard was "if reverting fully" (optional), which could re-open the older tenant-boundary issue | **Fixed:** rollback now marks restoring `protect_school_id_update` + `tr_protect_school_id` **MANDATORY** |

No other defect. No spoofable bypass (post-D1), no cross-user RPC, no anonymous execution, no arbitrary cycle value, no school-admin scope failure, no lost `school_id` protection, correct grants, valid SQL.

## Validation

| Command | Result |
|---|---|
| Migration structural + owner-binding + parens/UTF-8 (Node) | **8/8 pass**; parens balanced |
| Full test-assertion mirror (11 assertions vs hardened files, Node) | **11/11 pass** |
| `npx tsc --noEmit -p tsconfig.app.json` | 10 errors, **all pre-existing `TS2307` missing-module**; **0 in any Phase 2A file** |
| `git diff --check` | clean |
| `npx vitest run src/test/profileFieldProtection.test.ts` | **not runnable** — local `node_modules` broken (`debug`/vite-node); CI: `npm ci && npx vitest run …` |

**Runtime limitations:** DB-trigger behavior (student rejection, RPC success, cross-user RPC failure, school-admin same/cross-school, counselor rejection, anonymous rejection, concurrent increments, NULL transitions, unchanged-value no-op, ordinary-field success, school_id protection) requires a disposable Postgres with synthetic users — **pending**; full spec in `01-production-verification-checklist.md`.

## Readiness

| Decision | Status |
|---|---|
| Safe to commit | ✅ Yes |
| Safe to merge | ✅ Yes |
| Safe for preview | ✅ Yes (preview run is itself a required condition) |
| Safe for production apply | ⚠️ Conditional — after CI green + preview runtime tests (§B of the checklist) pass and a pre-apply snapshot is taken |
| Remaining conditions | CI vitest+tsc green; preview A1–A3 catalog + B1–B8 synthetic runtime tests; transactional apply |
| **PF-011** | **Remediated in code (DB-enforced, owner-bound)**; production apply + runtime verification pending |

## Git status conclusion

Branch `fix/profile-field-protection-phase2a`: modified `src/pages/AssessmentHistory.tsx`; new `supabase/migrations/20260723130000_protect_controlled_profile_fields.sql`, `src/test/profileFieldProtection.test.ts`, and `docs/professional-audit/remediation-phase-2a/` (incl. this review). During review, only the migration (D1, D2) and the test (D1 assertion) were edited — no other file. **No SQL applied, no migration run, no database/production/config/dependency change, nothing deployed, no branch merged.** PF-012 not started.
