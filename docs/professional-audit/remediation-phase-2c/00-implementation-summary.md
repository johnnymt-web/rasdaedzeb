# Phase 2C — Govern Self-Deletion / Account-Erasure Path (PF-013): Implementation Summary

**Branch:** `fix/self-deletion-governance-phase2c` · **Date:** 2026-07-23 · **Scope:** contain the ungoverned client-executable self-deletion RPC. Discovered during PF-012 review (`docs/professional-audit/remediation-phase-2b/02-final-security-review.md`). **Status: applied and verified in production — see the Production evidence section; PF-013 Closed in production.** (This doc was authored pre-apply; the production-evidence and status sections below reflect the confirmed deployed state.)

## PF-013 confirmation — **CONFIRMED**

An ordinary authenticated student can invoke a `SECURITY DEFINER` function that deletes their own `auth.users` row, cascading to erase their entire account and longitudinal assessment history, with no audit / consent / assent / parental-governance / safeguarding step.

## Exact destructive path

```
student (authenticated)
  → PostgREST  supabase.rpc('request_self_deletion')
  → public.request_self_deletion()  [SECURITY DEFINER, runs as owner]
  → DELETE FROM auth.users WHERE id = auth.uid()
  → FK ON DELETE CASCADE
  → profiles, assessments, big_five_assessments, caas_assessments,
    work_values_assessments, reflections, student_goals, skill snapshots, … erased
```

## Function signature & SECURITY DEFINER review

Source: `supabase/migrations/20260417233000_gdpr_self_delete.sql`.

| Property | Value |
|---|---|
| Signature | `public.request_self_deletion()` — **zero arguments** |
| Returns | `void` · Language `plpgsql` |
| SECURITY DEFINER | **Yes** |
| `search_path` | `SET search_path = public` (**pinned**) |
| Target derivation | **`auth.uid()` only** — no arbitrary `target_user_id` argument → cannot delete another user |
| Destructive op | `DELETE FROM auth.users …` — **fully schema-qualified** (not search-path-shadowable) |
| Anonymous behavior | `auth.uid()` is NULL → `WHERE id = NULL` matches 0 rows (**fails safe / no-op**), but the function is still *executable* by anon pre-remediation |
| GUC/session bypass | none |
| Partial-state risk | single statement in one transaction; failure rolls back the whole cascade — no partial destructive state |
| Audit entry before delete | **none** |
| Reversible | **no** (hard cascade) |

**Conclusion:** the function *body* is not the flaw — it derives its target safely, pins `search_path`, and qualifies `auth.users`. The flaw is that it is **client-executable** (default `EXECUTE` to `PUBLIC`) while performing an **ungoverned, unaudited, irreversible** destructive cascade. Least-change remediation = remove client EXECUTE; **do not modify the body**.

## Current EXECUTE privileges (repository evidence)

No `GRANT`/`REVOKE` for `request_self_deletion` exists anywhere in the repo → PostgreSQL's default applies: **`EXECUTE` granted to `PUBLIC`**, so `anon` and `authenticated` (and every client role) can execute it. It is exposed via PostgREST — present in generated `src/integrations/supabase/types.ts` (`request_self_deletion: { Args: never; Returns: undefined }`).

| Role | Direct destructive EXECUTE (before) |
|---|---|
| PUBLIC / anon / authenticated / student / counselor / school admin / platform admin / superadmin | ✅ (via PUBLIC default) |
| service_role / internal | ✅ via an **explicit direct grant** (`service_role=X/postgres`, confirmed in the production ACL) — a trusted internal grant, **not** via PUBLIC |

## Cascade surface (from `auth.users` deletion)

All reference `auth.users(id) ON DELETE CASCADE` (direct cascade): `assessments` (`user_id`), `big_five_assessments`, `caas_assessments`, `work_values_assessments`, `reflections`, `student_goals`, `student_skill_snapshots`, `skills_gap_analyses`, plus profiles/roles and other user-owned records. `mentors.user_id` is `ON DELETE SET NULL`. Full FK enumeration is a read-only check in `01-…md` §E. This phase does **not** redesign cascades.

## Audit status

`request_self_deletion` writes **no** audit record. By contrast the admin `delete_user` writes an `audit_logs` row. Because containment removes the client path entirely (no destructive client RPC remains), no new audit mechanism is built here; a governed future privacy-request workflow must include audit. Documented as an open governance requirement — **not** built in this phase.

## Consent / assent / parental-governance evidence

The repository has **no** governed-deletion prerequisites: no date-of-birth / minor-status field, no parental-consent record, no student-assent record, no deletion-request status, no DSAR/privacy-request workflow, no safeguarding-review step. The only consent artifact is `ai_processing_consent` (`20260618150000`), scoped to **AI processing**, not deletion. **Repository evidence is insufficient to implement a legally/safeguarding-complete self-service erasure workflow** — so the safe action is containment now, and a governed request→review→approval workflow later (separate phase). This is a security/safeguarding boundary, **not** a legal conclusion about erasure rights and **not** a claim that data must be retained indefinitely.

## Comparison with governed admin deletion (`public.delete_user`)

`public.delete_user(target_user_id uuid)` (`20260419100000`): `SECURITY DEFINER`, `search_path=public`, **checks `has_role(caller,'admin')`**, **blocks self-delete**, **writes `audit_logs`**, cascades. It is **materially better governed** than `request_self_deletion` (role check + audit + self-delete guard). It remains the governed erasure path and is **unchanged** by this phase. The two are **not** merged.

## Remediation implemented (containment)

Privilege-hardening only — remove destructive-RPC EXECUTE from client roles; function body untouched; no client role receives a replacement destructive RPC.

```sql
REVOKE EXECUTE ON FUNCTION public.request_self_deletion() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.request_self_deletion() FROM anon;
REVOKE EXECUTE ON FUNCTION public.request_self_deletion() FROM authenticated;
```

### Post-remediation authorization matrix

| Role | Direct destructive RPC EXECUTE | Submit deletion/privacy request | Approve/process deletion |
|---|---|---|---|
| anon | ❌ revoked | n/a (no workflow exists) | ❌ |
| student | ❌ revoked | n/a (no workflow exists) | ❌ |
| counselor | ❌ revoked | n/a | ❌ |
| school admin | ❌ revoked | n/a | ❌ |
| platform admin | ❌ revoked (uses `delete_user`) | n/a | ✅ via governed `delete_user` |
| superadmin | ❌ revoked (uses `delete_user`) | n/a | ✅ via governed `delete_user` |
| service_role / internal | ✅ **retained** — explicit direct grant (`service_role=X/postgres`); a trusted internal database/API role, **not** an ordinary browser/student identity | n/a | ✅ direct/admin governed paths |

*(No request/approval workflow rows are asserted as functional because none exists in the repo. Admin deletion capability shown reflects the pre-existing `delete_user` path, unchanged here. `service_role` retaining EXECUTE does **not** reopen PF-013: PF-013 is ordinary-client/student direct execution, and `service_role` is never an ordinary browser/student identity — see the production-evidence section.)*

## Migration filename

`supabase/migrations/20260723160000_govern_self_deletion_rpc.sql` (one additive, privilege-only migration).

## Files changed

| File | Change |
|---|---|
| `supabase/migrations/20260723160000_govern_self_deletion_rpc.sql` | **new** — REVOKE client EXECUTE on `request_self_deletion()` |
| `src/test/selfDeletionGovernance.test.ts` | **new** — structural regression tests |
| `docs/professional-audit/remediation-phase-2c/00-implementation-summary.md` | **new** — this file |
| `docs/professional-audit/remediation-phase-2c/01-preview-and-production-verification.md` | **new** — runtime/rollback spec |

**No application source changed.** The self-deletion RPC has **no** frontend caller (only the admin `delete_user` is called, in `UserManagement.tsx`/`CounselorManagement.tsx`; the `en.json` "delete account" strings belong to that admin flow) → **containment causes no application regression.**

## Tests

Structural regression (`src/test/selfDeletionGovernance.test.ts`): exact zero-arg signature; REVOKE from PUBLIC/anon/authenticated; no `GRANT EXECUTE`; every privilege statement targets only `request_self_deletion` (does not touch `delete_user`/`start_new_assessment_cycle`); no function-body/policy/trigger/scoring change; no `.rpc('request_self_deletion')` caller in `src`. **16/16 assertions pass** via the dependency-free verifier (vitest can't run locally — broken `node_modules`; CI: `npm ci && npx vitest run src/test/selfDeletionGovernance.test.ts`).

## Production evidence (verified 2026-07-23)

The migration has since been applied and verified in production (recorded here as documentation housekeeping; no code/SQL/migration/test was changed to record it):

| Item | Verified value |
|---|---|
| Migration `20260723160000` in `supabase_migrations.schema_migrations` | **exactly 1 row** |
| Function | `public.request_self_deletion()` |
| Owner (`pg_proc.proowner`) | `postgres` |
| `SECURITY DEFINER` (`prosecdef`) | `true` |
| `search_path` (`proconfig`) | `search_path=public` (pinned) |
| `pg_proc.proacl` | `{postgres=X/postgres,service_role=X/postgres}` |
| `has_function_privilege('anon', …, 'EXECUTE')` | **false** |
| `has_function_privilege('authenticated', …, 'EXECUTE')` | **false** |
| `has_function_privilege('service_role', …, 'EXECUTE')` | **true** |
| PUBLIC EXECUTE | **removed** |
| Ordinary student/browser client can invoke the destructive RPC | **no** |

**Interpretation.** The ACL `{postgres=X/postgres,service_role=X/postgres}` shows the only remaining grantees are the owner (`postgres`) and `service_role`, each via an **explicit direct grant** — there is no `=X/…` PUBLIC entry, confirming PUBLIC/anon/authenticated EXECUTE is gone. `service_role` therefore did **not** hold EXECUTE via PUBLIC; it has an independent, explicit grant that (correctly) survived the PUBLIC revoke. This **retained `service_role` EXECUTE is a trusted internal database/API capability and does not reopen PF-013**, whose confirmed vulnerability is *ordinary client/student direct execution of the destructive `request_self_deletion()` RPC* — a role `service_role` never occupies (PostgREST serves browsers as `anon`/`authenticated`, never `service_role`). **No further REVOKE from `service_role` is warranted** absent an independently justified requirement.

## PF-013 status — **Closed in production**

Closure applies to the confirmed vulnerability: **ordinary client/student direct execution of the destructive `request_self_deletion()` RPC**, which is now blocked at the PostgreSQL EXECUTE-privilege boundary (anon/authenticated/PUBLIC = false). The broader requirement for a **governed deletion-request / safeguarding / consent / audit workflow remains open** (separate future phase) — this closure does not claim that work is complete.

## Limitations

This phase contains the direct-execution path; it does **not** build the governed privacy-request workflow (a documented follow-up requiring minor-status, parental consent, assent, safeguarding review, and audit). No claim is made about retention periods.

## Confirmation

The remediation migration has been applied and verified in production (evidence above). This documentation-housekeeping update changed **docs only** — no SQL, migration, test, application code, or configuration was modified, and nothing was deployed or applied as part of it. PF-011 (profile/grade/cycle protection) and PF-012 (assessment DELETE restrictive policies) are untouched. No unrelated remediation started.
