# Phase 2C — Final Security & Acceptance Review (PF-013)

**Reviewer role:** independent PostgreSQL / Supabase-authorization / privacy-engineering / safeguarding reviewer.
**Scope reviewed:** `supabase/migrations/20260723160000_govern_self_deletion_rpc.sql`, `src/test/selfDeletionGovernance.test.ts`, `docs/professional-audit/remediation-phase-2c/`, the origin migration `20260417233000_gdpr_self_delete.sql`, `public.delete_user` (`20260419100000`), relevant function grants/ownership/generated types, and the `auth.users` FK cascade surface. Review-only except one minimal doc-completeness addition (below).
**Date:** 2026-07-23 · **Branch:** `fix/self-deletion-governance-phase2c`.

---

## Verdict — **ACCEPT WITH CONDITIONS**

The containment migration is correct, minimal, and privilege-only; it closes PF-013's client entry point with no application regression and without touching the function body, RLS, scoring, or the governed admin path. Acceptance conditions were **runtime verification in a disposable DB** (privilege boundary + service_role/owner states + admin-path regression) and a documented **maintainability residual** (a future `DROP`+`CREATE` of the function would reset PUBLIC EXECUTE). No code defect was found; the only change this review made was adding missing owner/`prosecdef`/`service_role` verification queries to the `01` doc.

> **Update (2026-07-23) — applied & verified in production; PF-013 Closed in production.** The runtime conditions have since been confirmed against production: anon/authenticated EXECUTE = false, service_role EXECUTE = **true** (via an explicit direct grant — see the corrected service-role conclusion), owner `postgres`, `SECURITY DEFINER = true`, `search_path = public`, PUBLIC EXECUTE removed, migration present once in `schema_migrations`. One pre-apply reasoning error is corrected below (service_role was expected to *lose* EXECUTE; it correctly *retains* it via an explicit grant). See the Readiness and Service-role sections.

---

## PF-013 confirmation — CONFIRMED

Verified against `20260417233000_gdpr_self_delete.sql` and repo grant evidence, all pre-remediation facts hold:

- `public.request_self_deletion()` exists; **zero arguments**; `SECURITY DEFINER`; `LANGUAGE plpgsql`.
- Target derived **only** from `auth.uid()`; body is `DELETE FROM auth.users WHERE id = auth.uid()`.
- Deletion cascades (FK `ON DELETE CASCADE`) into assessment/history data.
- **No** role / parental-consent / assent / safeguarding / DSAR gate; **no** audit write by this function.
- **No** repository `REVOKE EXECUTE` previously restricted it → PostgreSQL default `EXECUTE TO PUBLIC` made it client-executable, and PostgREST exposes it (present in generated `types.ts`).

Correctly characterized as **PF-013 — Ungoverned self-deletion / account-erasure path**.

---

## Function-body conclusion — body is safe; **no modification required**

Zero args; target solely from `auth.uid()` (no caller-supplied target ID → **no cross-user deletion**); anonymous call resolves `auth.uid()=NULL` → `WHERE id = NULL` matches nothing (fails safe); `auth.users` is **schema-qualified**; `search_path` is **pinned** to `public`; **no dynamic SQL**, no caller-controlled identifier; single destructive statement is transactionally atomic (failure rolls back the whole cascade — no partial state). **The body is not the defect — its client-executability is.** Least-change remediation (privilege REVOKE, body untouched) is the correct choice.

---

## Owner / SECURITY DEFINER conclusion

The migration `20260417233000` was applied via the Supabase SQL Editor, whose statements run as **`postgres`**, so the function owner is a **privileged, non-client role** (`postgres`/`supabase_admin` class — to be confirmed at runtime via `pg_get_userbyid(proowner)`, query added to `01` §B4). Consequences:

- The **owner always retains EXECUTE** — `REVOKE … FROM PUBLIC` does not strip the owner's inherent right. This is expected and safe.
- The owner/definer is **never a PostgREST client identity** (PostgREST connects as `authenticator` → switches to `anon`/`authenticated`/`service_role`, never `postgres`), so ordinary client roles **cannot impersonate the owner**.
- Owner, `SECURITY DEFINER`, `service_role`, and `PUBLIC` are correctly **not conflated**: SECURITY DEFINER governs *whose privileges the body runs with*; EXECUTE grants govern *who may call it*. The fix targets the latter without altering the former.

---

## Effective EXECUTE matrix (post-migration)

| Role | Direct `request_self_deletion()` EXECUTE | Admin / governed deletion |
|---|---|---|
| PUBLIC | ❌ revoked | — |
| anon | ❌ (only held via PUBLIC) | ❌ |
| authenticated | ❌ (only held via PUBLIC) | ❌ |
| student | ❌ | ❌ |
| counselor | ❌ | ❌ |
| school admin | ❌ | ❌ |
| platform admin | ❌ (not this RPC) | ✅ via `delete_user` (`has_role 'admin'` + audit) |
| superadmin | ❌ (not this RPC) | ✅ via `delete_user` |
| service_role / internal | ✅ **retained** — explicit direct grant (`service_role=X/postgres`), a trusted internal role (not an ordinary client) | ✅ Admin API / direct `auth.users` DELETE / `delete_user` |
| function owner (`postgres`) | ✅ (ownership; not a client identity) | ✅ |

Effective semantics, not assumptions (**production-confirmed 2026-07-23**): `anon`/`authenticated` held EXECUTE **only** through the PUBLIC default, so revoking PUBLIC removes it for them (verified `has_function_privilege` = false). `service_role`, however, holds an **explicit direct grant** (production ACL `{postgres=X/postgres,service_role=X/postgres}`) and therefore **retains** EXECUTE (verified = true) — this is intended and safe (see the service-role conclusion). The explicit per-role REVOKEs on anon/authenticated are harmless belt-and-suspenders (a REVOKE of a non-existent direct grant is a no-op notice → clean/idempotent replay).

---

## Service-role conclusion — **retains EXECUTE via explicit grant; intended and safe (not a defect)**

**Correction (production evidence, 2026-07-23):** `service_role` **retains** EXECUTE after the PUBLIC revoke (verified `has_function_privilege('service_role', …) = true`; production ACL `{postgres=X/postgres,service_role=X/postgres}`). My pre-apply review reasoned that `service_role` would *lose* EXECUTE on the assumption it held the privilege only via PUBLIC — that assumption was **wrong**: `service_role` holds an **explicit direct grant** on this function (independent of `bypassrls`, which is indeed a separate mechanism). The migration's `REVOKE … FROM PUBLIC` does not touch that explicit grant, so it correctly survives.

This is **intended and safe, not a defect and not a reopening of PF-013.** PF-013 is *ordinary client/student direct execution* of the destructive RPC; `service_role` is a **trusted internal database/API role that PostgREST never assigns to a browser/student session** (clients are served as `anon`/`authenticated`). The retained privilege is a trusted internal capability. Per the task, **no** REVOKE from `service_role` is recommended absent an independently justified requirement. Runtime confirmation query is in `01` §B5.

---

## PostgREST conclusion — no UI regression

The function will remain listed in generated types / PostgREST introspection, but **presence in types does not grant execution** — a revoked role's call fails at the PostgreSQL privilege boundary (`permission denied for function request_self_deletion`) before the body runs. There is **no frontend caller** of `request_self_deletion` (searched `.rpc(` / delete-account / privacy / account-settings; only the admin `delete_user` is called, in `UserManagement.tsx` / `CounselorManagement.tsx`; the `en.json` "delete account" strings belong to that admin flow). **No UI regression is introduced.**

---

## Admin-deletion regression conclusion — unaffected

`public.delete_user(uuid)` is a **separate**, better-governed function: role-checked (`has_role(caller,'admin')`), blocks self-delete, controlled target handling, writes `audit_logs`, and is the path the live admin UI uses. The Phase 2C migration names **only** `request_self_deletion` — it does **not** revoke or alter `delete_user` (nor `start_new_assessment_cycle`), verified structurally. Admin deletion continues to function.

---

## Cascade conclusion

The `auth.users` cascade surface is as claimed: `assessments` (`user_id`), `big_five_assessments`, `caas_assessments`, `work_values_assessments`, plus `reflections`, `student_goals`, `student_skill_snapshots`, `skills_gap_analyses`, profiles/roles, etc., all `ON DELETE CASCADE` (`mentors` = `SET NULL`). **PF-012's restrictive DELETE policies do not — and are not meant to — block FK cascades initiated by a trusted `auth.users` deletion** (RESTRICTIVE RLS constrains direct client `DELETE` statements, not system-initiated referential cascades). Phase 2C correctly addresses the **client entry point** (who can trigger the account deletion) rather than attempting to block legitimate referential cascades. PF-011 and PF-012 are untouched.

---

## Safeguarding / privacy boundary

Repository evidence supports the "no governed self-erasure workflow" claim: **no** DOB/minor-status, parental-consent, assent, deletion-request, safeguarding-review, DSAR-approval, or immutable deletion-audit mechanism exists (only `ai_processing_consent`, AI-scoped). The approach is correctly framed as **containment** — direct destructive self-erasure is disabled pending a governed request → review → approval workflow — and is **explicitly not** a denial of privacy/erasure rights and makes **no** retention-period claim. No legal conclusion is drawn beyond repository evidence. ✅

---

## Default-privilege nuance (maintainability residual)

`CREATE OR REPLACE FUNCTION` **preserves** an existing ACL, so the REVOKE persists across a future in-place body change. However, a future **`DROP` + `CREATE`** of `request_self_deletion` would reset privileges to the PostgreSQL default (**EXECUTE to PUBLIC again**), silently re-opening PF-013. The structural test guards the *repository migration*, but cannot prevent a live DROP+CREATE. This is a **maintainability consideration, not a current defect**. Recommended (out of this phase): consider a hardened default-privileges posture (`ALTER DEFAULT PRIVILEGES … REVOKE EXECUTE ON FUNCTIONS FROM PUBLIC`) as a platform-wide follow-up — **not** redesigned here.

---

## Migration safety — CONFIRMED

Exact zero-arg identity signature; correct `REVOKE` syntax; **no `GRANT`** broadening; **no** function-body replacement; **no** RLS / trigger / assessment-policy / scoring change (structurally verified); timestamp `20260723160000` orders after the origin and after Phase 2B; REVOKE is idempotent → clean replay and already-patched replay are safe; privilege-only. Production application is safe (subject to human "go").

---

## Test review — CONFIRMED (structural only, honestly scoped)

`src/test/selfDeletionGovernance.test.ts` asserts: exact zero-arg signature (and no arbitrary-arg overload); REVOKE from PUBLIC / anon / authenticated; no `GRANT EXECUTE`; every privilege statement targets only `request_self_deletion` (does **not** touch `delete_user` or `start_new_assessment_cycle`); no function-body / policy / trigger / `FOR SELECT|INSERT|UPDATE|DELETE` / scoring change; and no `.rpc('request_self_deletion')` caller in `src`. Comments are stripped before matching (avoids prose false-positives). **16/16 assertions pass** via the dependency-free verifier. The test file header explicitly defers real EXECUTE-privilege behavior to the disposable-DB runtime matrix — **not represented as runtime proof.**

---

## Validation performed

| Check | Result |
|---|---|
| `git status --short` | only 3 new untracked Phase 2C artifacts; no tracked source modified |
| `git diff --check` | clean |
| Structural verifier (16 assertions) | **16/16 pass** |
| `npx tsc --noEmit -p tsconfig.app.json` | pre-existing `TS2307` missing-module errors only; **0 in the Phase 2C test** |
| `npx vitest run …` | **blocked** locally (broken `node_modules`); CI: `npm ci && npx vitest run src/test/selfDeletionGovernance.test.ts` |

No dependencies installed, no SQL applied, no production access, no deploy.

---

## Defects

**None acceptance-blocking.**

- **D1 (Low, non-blocking) — documentation completeness.** The `01` verification doc lacked owner (`proowner`), `prosecdef`/`proconfig`, and `has_function_privilege('service_role', …)` checks that a rigorous runtime verification of this finding needs. **Correction applied** (doc-only): added `§B4` (owner/SECURITY DEFINER/search_path) and `§B5` (service_role/anon/authenticated EXECUTE) read-only queries with expected results. Migration/test/body unchanged.
- **R1 (Informational, non-blocking) — maintainability residual.** A future `DROP`+`CREATE` of the function resets PUBLIC EXECUTE (see default-privilege nuance). Tracked as a follow-up; not fixed here.

No incorrect signature, incomplete revoke, cross-function revocation, broken admin path, unsafe GRANT, false service-role assumption, incorrect rollback guidance, or structural-test false positive was found.

---

## Readiness — **all conditions met; now applied & verified in production (2026-07-23)**

- **Safe to commit:** ✅ done (migration + test + docs merged).
- **Safe for preview apply:** ✅ done.
- **Safe to merge to main:** ✅ done — the runtime privilege matrix was confirmed in production (anon/authenticated EXECUTE = false; **service_role EXECUTE = true** via its explicit direct grant; owner `postgres` retains EXECUTE; `delete_user` admin path intact).
- **Safe for production apply:** ✅ **applied** — migration `20260723160000` present exactly once in `schema_migrations`; ACL `{postgres=X/postgres,service_role=X/postgres}`; `SECURITY DEFINER = true`; `search_path = public`; PUBLIC EXECUTE removed. Ordinary student/browser clients cannot invoke the destructive RPC.
- **Remaining conditions:** none for PF-013 closure. The broader **governed deletion-request / safeguarding / consent / audit workflow remains open** as a separate future phase.
- **PF-013 status:** **Closed in production** — closure scoped to *ordinary client/student direct execution of `request_self_deletion()`* (now blocked at the EXECUTE-privilege boundary). Not a claim that all future privacy/erasure governance work is complete.

*(The verdict and pre-apply readiness above were authored before deployment; this block records the confirmed post-deployment state per the production-evidence housekeeping. The migration/test/function themselves are unchanged.)*

---

## Confirmation

The remediation has since been **applied and verified in production** (evidence recorded in `00-implementation-summary.md` → Production evidence). This documentation-housekeeping revision changed **docs only** — no SQL was applied, no migration/test/application/config was modified, and nothing was deployed as part of it. PF-011 and PF-012 are untouched. No other remediation phase was started.
