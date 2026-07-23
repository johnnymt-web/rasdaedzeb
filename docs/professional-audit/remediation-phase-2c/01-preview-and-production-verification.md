# Phase 2C — Preview & Production Verification (PF-013)

> **STATUS (2026-07-23): applied and verified in production — PF-013 Closed in production.** Production checks confirmed: migration `20260723160000` = 1 row in `schema_migrations`; owner `postgres`; `SECURITY DEFINER = true`; `search_path = public`; ACL `{postgres=X/postgres,service_role=X/postgres}`; `has_function_privilege` → anon **false**, authenticated **false**, service_role **true**; PUBLIC EXECUTE removed. See `00-implementation-summary.md` → Production evidence. The disposable-DB steps below remain the reusable verification procedure (and document what was checked).

Run reusable checks in a **disposable** environment (Supabase Preview branch or local `supabase start`) with **synthetic** users only. Read-only catalog/privilege checks are safe anywhere. No real student data; no secrets below.

## A. Migration history / apply
- [ ] Push branch → open PR; confirm the **Supabase Preview** check applies `20260723160000_govern_self_deletion_rpc` cleanly (or local `supabase db reset`).
- [ ] Migration appears once in `schema_migrations`.

## B. Function privilege checks (read-only)

### B1 — routine_privileges snapshot
```sql
select routine_schema, routine_name, grantee, privilege_type
from information_schema.routine_privileges
where routine_schema = 'public'
  and routine_name = 'request_self_deletion'
order by grantee;
-- EXPECT post-remediation: NO row granting EXECUTE to PUBLIC, anon, or
-- authenticated. (Only the function owner retains EXECUTE; owner grants are not
-- listed as a separate grantee row.)
```

### B2 — has_function_privilege for the exact signature
```sql
select
  has_function_privilege('anon',          'public.request_self_deletion()', 'EXECUTE') as anon_exec,
  has_function_privilege('authenticated', 'public.request_self_deletion()', 'EXECUTE') as authd_exec;
-- EXPECT: both FALSE post-remediation.
```

### B3 — regression: governed admin deletion still executable
```sql
select
  has_function_privilege('authenticated', 'public.delete_user(uuid)', 'EXECUTE') as delete_user_exec;
-- EXPECT: TRUE (delete_user is unchanged; its internal has_role('admin') check
-- still gates actual deletion). Also confirm start_new_assessment_cycle grants
-- are unchanged (PF-011/2A untouched).
```

### B4 — owner / SECURITY DEFINER / pinned search_path (read-only)
```sql
select
  n.nspname                       as schema,
  p.proname                       as function,
  pg_get_userbyid(p.proowner)     as owner,
  p.prosecdef                     as security_definer,
  p.proconfig                     as config           -- expect {search_path=public}
from pg_proc p
join pg_namespace n on n.oid = p.pronamespace
where n.nspname = 'public' and p.proname = 'request_self_deletion';
-- EXPECT: owner is a privileged role (e.g. postgres / supabase_admin), NOT a
-- client role; security_definer = true; config pins search_path=public.
-- The owner always retains EXECUTE (ownership is not removed by REVOKE FROM
-- PUBLIC) and is never a PostgREST client identity, so owner retention is safe.
```

### B5 — client roles vs service_role EXECUTE state (verify, do not assume)
```sql
select
  has_function_privilege('anon',          'public.request_self_deletion()', 'EXECUTE') as anon_exec,          -- expect FALSE
  has_function_privilege('authenticated', 'public.request_self_deletion()', 'EXECUTE') as authd_exec,         -- expect FALSE
  has_function_privilege('service_role',  'public.request_self_deletion()', 'EXECUTE') as service_exec;       -- expect TRUE
-- VERIFIED IN PRODUCTION (2026-07-23): anon = FALSE, authenticated = FALSE,
-- service_role = TRUE. Function EXECUTE is a SEPARATE mechanism from RLS bypass,
-- so service_role's result is decided by its GRANTS, not bypassrls. The
-- production ACL {postgres=X/postgres,service_role=X/postgres} shows service_role
-- holds an EXPLICIT DIRECT grant (not via PUBLIC), which correctly survived the
-- PUBLIC revoke. This is intended and safe: service_role is a trusted internal
-- database/API role, never an ordinary browser/student identity, so its retained
-- EXECUTE does NOT reopen PF-013 (ordinary-client direct execution is blocked).
-- Do NOT REVOKE from service_role absent an independently justified requirement.
```

## C. Synthetic runtime tests (disposable DB, synthetic users only)

Impersonate via `request.jwt.claims` (`role='authenticated'`, `sub=<uid>`); anon = no JWT / anon role.

| # | Actor | Action | Expected |
|---|---|---|---|
| C1 | Anonymous | `select public.request_self_deletion();` | **denied at EXECUTE privilege boundary** (permission denied for function) |
| C2 | Student S | `select public.request_self_deletion();` | **denied at EXECUTE privilege boundary** (account + history preserved) |
| C3 | Counselor C | `select public.request_self_deletion();` | denied |
| C4 | School-admin SA | `select public.request_self_deletion();` | denied |
| C5 | Platform-admin / superadmin | `select public.request_self_deletion();` | denied (governed deletion is `delete_user`, not this RPC) |
| C6 | Admin PA | `select public.delete_user('<synthetic student>');` | **succeeds** (governed: `has_role 'admin'` + `audit_logs` entry) — confirms trusted path intact |
| C7 | Non-admin (student) | `select public.delete_user('<other>');` | denied by the function's internal role check (`Unauthorized`) |
| C8 | service_role / internal | direct governed erasure (admin API / `delete_user`) | remains available |

Rule: "denied at EXECUTE privilege boundary" means PostgREST/Postgres returns a *permission denied for function* error **before** the body runs — the row still exists afterward.

## D. Cascade verification (informational, read-only)
```sql
-- Enumerate every FK that cascades from auth.users deletion, to document the
-- destructive surface the containment protects.
select tc.table_schema, tc.table_name, kcu.column_name, rc.delete_rule
from information_schema.referential_constraints rc
join information_schema.table_constraints tc on tc.constraint_name = rc.constraint_name
join information_schema.key_column_usage kcu on kcu.constraint_name = rc.constraint_name
join information_schema.constraint_column_usage ccu on ccu.constraint_name = rc.constraint_name
where ccu.table_schema = 'auth' and ccu.table_name = 'users'
order by rc.delete_rule, tc.table_name;
-- EXPECT: assessments/big_five/caas/work_values + reflections/goals/snapshots
-- with delete_rule = CASCADE (the erasure surface); mentors = SET NULL.
```

## E. Audit verification
- [ ] Confirm `request_self_deletion` writes **no** audit entry (documented gap; irrelevant post-containment since clients can't call it).
- [ ] Confirm the governed `delete_user` path still writes an `audit_logs` row (C6).

## F. Regression checks
- [ ] Synthetic student login unaffected.
- [ ] Profile update (allowed fields) unaffected — **PF-011** untouched.
- [ ] Assessment submission unaffected.
- [ ] **PF-012** restrictive assessment DELETE policies unaffected (no policy touched by this migration).
- [ ] Admin `delete_user` deletion + audit unaffected.

## G. Rollback
**Technical rollback ≠ re-opening the vulnerability.** This migration only removes client EXECUTE; the function body is unchanged. Removing the containment (restoring broad client EXECUTE) would **intentionally re-open PF-013** — do **not** do this to "restore the old state."
```sql
-- TECHNICAL rollback (re-opens PF-013 — NOT recommended):
GRANT EXECUTE ON FUNCTION public.request_self_deletion() TO authenticated;
```
Preferred instead of rollback if a self-service erasure feature is genuinely needed: a **governed forward-fix** — a non-destructive privacy/erasure *request* → safeguarding/parental review → admin-processed `delete_user`, with minor-status + consent/assent + audit. That is a separate phase.

## H. Legal / safeguarding follow-up boundary
This phase is a **security/safeguarding containment**, not a legal determination. It does **not** deny any user's privacy or erasure rights and makes **no** claim that data must be retained indefinitely. The open governance requirements (documented, not built here): minor-status/DOB, parental consent, student assent, deletion-request status, safeguarding review, audit, and a DSAR workflow — required before any user-facing self-service erasure is exposed.

## I. Deployment sequence
1. CI: `npm ci && npx vitest run src/test/selfDeletionGovernance.test.ts` + `tsc` green.
2. Apply in preview; run B1–B3 + C1–C8 + D + F.
3. Snapshot `routine_privileges`; apply to production via the transactional migration workflow **after explicit human "go"**.
4. Post-apply: re-run B1–B2/B4–B5 (anon/authenticated EXECUTE = false, service_role = true, owner = postgres) and C2 (student denied) + C6 (admin `delete_user` still works). **Done in production 2026-07-23 — all confirmed.**

**Stop conditions:** any client role can still EXECUTE `request_self_deletion`; the admin `delete_user` path breaks; any assessment RLS / PF-011 / PF-012 behavior regresses.
