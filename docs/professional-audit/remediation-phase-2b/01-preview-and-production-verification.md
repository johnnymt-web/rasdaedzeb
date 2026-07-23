# Phase 2B — Preview & Production Verification (PF-012)

Run in a **disposable** environment (Supabase Preview branch or local `supabase start`) with **synthetic** users/data only. Read-only catalog checks are safe anywhere. **Do not apply to production until these pass.** No real student data; no secrets below.

## A. Migration history / apply
- [ ] Push branch → open PR; confirm the **Supabase Preview** check applies `20260723150000_block_assessment_history_deletion` cleanly (or local `supabase db reset`).
- [ ] Migration appears in `schema_migrations` (applied once).

## B. Catalog verification (read-only)

### B1 — Unsafe policies are gone
```sql
select tablename, policyname, cmd
from pg_policies
where schemaname='public' and cmd='DELETE'
  and tablename in ('assessments','big_five_assessments','caas_assessments','work_values_assessments')
order by tablename, policyname;
-- EXPECT: only the restrictive "No client delete of ..." rows (permissive='f').
--         NO "Delete own assessments" / "Delete own big_five" / "Delete own caas".
```

### B2 — Restrictive deny present on all four tables
```sql
select tablename, policyname, permissive, roles, cmd, qual
from pg_policies
where schemaname='public' and policyname ilike 'No client delete of %'
order by tablename;
-- EXPECT: 4 rows, permissive = 'f' (RESTRICTIVE), roles = {public}, cmd = DELETE,
--         qual = false, one per assessment table.
```

### B3 — SELECT/INSERT/UPDATE unchanged (regression)
```sql
select tablename, cmd, count(*)
from pg_policies
where schemaname='public'
  and tablename in ('assessments','big_five_assessments','caas_assessments','work_values_assessments')
  and cmd in ('SELECT','INSERT','UPDATE')
group by tablename, cmd order by tablename, cmd;
-- EXPECT: unchanged from pre-apply (Scoped select / Insert own / Update own /
--         Superadmin select / student-read policies still present).
```

## C. Synthetic runtime tests (disposable DB, synthetic users only)

Fixtures: student S (with ≥1 row in each assessment table), student T, counselor C, school-admin SA (S's school), platform-admin PA (`user_roles.role='admin'`). Impersonate via `request.jwt.claims` (`role='authenticated'`, `sub=<uid>`); anon = no JWT.

| # | Actor | Statement | Expected |
|---|---|---|---|
| C1 | Student S | `delete from assessments where user_id='<S>'` | **0 rows deleted / denied** (rows remain) |
| C2 | Student S | `delete from big_five_assessments where student_id='<S>'` | denied |
| C3 | Student S | `delete from caas_assessments where student_id='<S>'` | denied |
| C4 | Student S | `delete from work_values_assessments where student_id='<S>'` | denied |
| C5 | Student S | delete a **prior-cycle** row (e.g. `cycle_number=1`) | denied (longitudinal history preserved) |
| C6 | Student S | `delete from assessments where user_id='<T>'` (another student) | denied (also blocked by SELECT scope) |
| C7 | Student S | `select … from assessments/big_five/caas/work_values where …=S` | **succeeds** (read history unaffected) |
| C8 | Counselor C | delete any assessment row | denied |
| C9 | School-admin SA / Platform-admin PA | delete any assessment row | denied (no client role has DELETE) |
| C10 | Anonymous | delete any assessment row | denied |
| C11 | service_role | `delete from assessments where id='<x>'` | **succeeds** (BYPASSRLS — internal maintenance) |
| C12 | Student S | run the retake RPC `select public.start_new_assessment_cycle();` then verify prior rows still exist | new cycle created; **no** prior attempt deleted |

Rule: verifying denial means the row **still exists** afterward (RLS DELETE that matches no row deletes nothing; a restrictive `USING(false)` yields 0 affected rows / permission error depending on client).

## D. Retake / history preservation
- [ ] C12 confirms retaking creates a new cycle and preserves all prior attempts (grade_band, question_set_version, cycle_number, timestamps intact).
- [ ] Report cycle selector still shows prior cycles.

## E. Cascade review (informational, read-only)
```sql
-- Confirm the only cascade path to assessment history is auth.users deletion:
select tc.table_name, kcu.column_name, rc.delete_rule, ccu.table_name as references
from information_schema.referential_constraints rc
join information_schema.table_constraints tc on tc.constraint_name=rc.constraint_name
join information_schema.key_column_usage kcu on kcu.constraint_name=rc.constraint_name
join information_schema.constraint_column_usage ccu on ccu.constraint_name=rc.constraint_name
where tc.table_schema='public'
  and tc.table_name in ('assessments','big_five_assessments','caas_assessments','work_values_assessments');
-- EXPECT: student/user_id -> auth.users with delete_rule = CASCADE (satellite
--         tables). Account erasure via the admin-only delete_user RPC is one
--         governed deletion path.
```
- [ ] Confirm `profiles` has no student DELETE policy (no alternate cascade entry point).
- [ ] **Residual cascade path (verify + track):** `public.request_self_deletion()` (SECURITY DEFINER, no role gate) lets an authenticated user delete their own `auth.users` row → cascades to all four assessment tables. Confirm its current grants:
```sql
select p.proname, p.prosecdef,
       array(select r.rolname from pg_proc pp
             join aclexplode(pp.proacl) a on true
             join pg_roles r on r.oid = a.grantee
             where pp.oid = p.oid and a.privilege_type = 'EXECUTE') as exec_grants
from pg_proc p join pg_namespace n on n.oid = p.pronamespace
where n.nspname='public' and p.proname in ('request_self_deletion','delete_user');
-- If request_self_deletion is EXECUTEable by anon/authenticated (or PUBLIC),
-- a student can erase their own assessment history via whole-account deletion.
-- This is out of Phase 2B's direct-DELETE scope but MUST be governed before
-- pilot (anon REVOKE + consent/parental gate + audit_logs entry). See 02-...md.
```

## F. Rollback
Removes ONLY this remediation (re-opens PF-012 — do only for a confirmed defect):
```sql
DROP POLICY IF EXISTS "No client delete of assessments"  ON public.assessments;
DROP POLICY IF EXISTS "No client delete of big_five"     ON public.big_five_assessments;
DROP POLICY IF EXISTS "No client delete of caas"         ON public.caas_assessments;
DROP POLICY IF EXISTS "No client delete of work_values"  ON public.work_values_assessments;
```
Do **not** restore the old permissive `Delete own …` policies (that is the vulnerability). Never run rollback against production data.

## G. Deployment sequence
1. CI: `npm ci && npx vitest run src/test/assessmentDeletionProtection.test.ts` + `tsc` green.
2. Apply in preview; run B1–B3 + C1–C12 + E.
3. Snapshot `pg_policies`; apply to production via the transactional migration workflow.
4. Post-apply: re-run B1–B3; smoke-test one synthetic student DELETE (expect denied) and a student retake (expect history preserved).

**Stop conditions:** any client role can DELETE an assessment row; any unsafe `Delete own …` policy still present; SELECT/INSERT/UPDATE regressed; retake deletes history.
