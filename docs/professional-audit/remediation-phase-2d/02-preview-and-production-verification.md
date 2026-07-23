# Phase 2D.2 — Preview & Production Verification (PF-007)

Run in a **disposable** environment (Supabase Preview branch or local `supabase start`) with **synthetic** users only. Read-only catalog checks are safe anywhere. **Do not apply to production until these pass** and explicit human approval is given. No real student data; no secrets below.

## A. Migration history / apply
- [ ] Push branch → PR; confirm the **Supabase Preview** check applies `20260723170000_audited_superadmin_read_boundary` cleanly (or local `supabase db reset`).
- [ ] Migration appears once in `supabase_migrations.schema_migrations`.
- [ ] After apply, **regenerate** `src/integrations/supabase/types.ts` so the four `superadmin_*` RPCs are typed (removes the temporary `(supabase as any)` casts in a follow-up).

## B. Catalog verification (read-only)

### B1 — the five direct superadmin SELECT policies are gone
```sql
select tablename, policyname, cmd
from pg_policies
where schemaname='public' and policyname ilike 'Superadmin select all %'
order by tablename;
-- EXPECT: 0 rows. No permissive superadmin global SELECT remains on
-- profiles/assessments/big_five_assessments/caas_assessments/work_values_assessments.
```

### B2 — ordinary scoped SELECT policies still present (regression)
```sql
select tablename, policyname, cmd
from pg_policies
where schemaname='public'
  and tablename in ('profiles','assessments','big_five_assessments','caas_assessments','work_values_assessments')
  and cmd='SELECT'
order by tablename, policyname;
-- EXPECT: the Scoped/own/parent/counselor/school-admin SELECT policies unchanged;
--         NONE named 'Superadmin select all ...'.
```

### B3 — the four RPCs: owner, SECURITY DEFINER, search_path, grants
```sql
select p.proname, pg_get_userbyid(p.proowner) as owner, p.prosecdef, p.proconfig
from pg_proc p join pg_namespace n on n.oid=p.pronamespace
where n.nspname='public' and p.proname in
  ('superadmin_list_students','superadmin_get_student_profile',
   'superadmin_get_student_report_bundle','superadmin_platform_counts');
-- EXPECT: 4 rows; owner postgres; prosecdef=true; proconfig={search_path=public}.

select routine_name, grantee, privilege_type
from information_schema.routine_privileges
where routine_schema='public' and routine_name like 'superadmin_%'
order by routine_name, grantee;
-- EXPECT: EXECUTE granted to authenticated; NOT to PUBLIC/anon.

select has_function_privilege('anon','public.superadmin_list_students(text,integer,integer)','EXECUTE') as anon_exec;
-- EXPECT: false.
```

## C. Synthetic runtime tests (disposable DB, synthetic users only)

Fixtures: superadmin **SA**; student **S** (with ≥1 row in each assessment table, in school X); counselor **C** assigned to S; school-admin **AD** of school X; another student **T** (school Y). Impersonate via `request.jwt.claims`.

### C1 — direct bypass removed (the core PF-007 check)
| Actor | Statement | Expected |
|---|---|---|
| SA | `select * from profiles` (cross-school) | **0 rows** (own scoped access only) |
| SA | `select * from assessments` / `big_five_assessments` / `caas_assessments` / `work_values_assessments` | **0 rows** each |

### C2 — audited RPCs return data + write exactly one event
| Actor | Call | Expected |
|---|---|---|
| SA | `select public.superadmin_list_students(null,200,0)` | returns list; **+1** `audit_logs` row `action=READ_STUDENT_LIST` with `details.result_count`; **no** per-student rows |
| SA | `select public.superadmin_get_student_profile('<S>')` | returns S's profile; **+1** `READ_STUDENT`, `target_id=S`, `details.target_school_id` set |
| SA | `select public.superadmin_get_student_report_bundle('<S>')` | returns `{std,big_five,caas,work_values,current_cycle}`; **+1** `READ_STUDENT_REPORT`; `details` has `counts` only — **no** answers/scores/report text |
| SA | `select public.superadmin_platform_counts()` | returns `{schools,users,assessments}`; **+1** `READ_PLATFORM_COUNTS` |

Check each: `select count(*) from audit_logs` before/after differs by **exactly one**; inspect the row's `details` to confirm no sensitive payload.

### C3 — non-superadmins rejected
| Actor | Call | Expected |
|---|---|---|
| anon | any `superadmin_*` | **permission denied for function** (EXECUTE revoked) |
| S / C / AD / platform-admin | any `superadmin_*` | **`Unauthorized: superadmin role required`** exception; **no** data; no data-bearing audit row |

### C4 — fail-closed (disposable DB only)
Temporarily force the audit INSERT to fail (e.g. rename `audit_logs` or add a failing constraint in a throwaway DB), then `select public.superadmin_get_student_report_bundle('<S>')`:
- EXPECT: function **raises**, returns **no** bundle. Restore afterward. **Never run in production.**

### C5 — counselor regression (no superadmin RPC needed)
- C reads S's report through the **normal** UI path (direct scoped reads) → still works; C does **not** need any `superadmin_*` RPC.
- C calling `superadmin_get_student_report_bundle('<S>')` → rejected (not superadmin).

### C6 — audit-log tamper resistance
| Actor | Statement | Expected |
|---|---|---|
| SA | `delete from audit_logs where id='<their READ event>'` | **denied** (no client DELETE policy) |
| SA | `update audit_logs set details='{}' where …` | **denied** (no client UPDATE policy) |
| SA | `insert into audit_logs(admin_id,action,target_type) values(auth.uid(),'FAKE','x')` | **denied** (no client INSERT policy — only SECURITY DEFINER writes) |

## D. PF regression
- [ ] **PF-011:** student cannot self-change `grade`/`current_assessment_cycle` (trigger + RPC intact).
- [ ] **PF-012:** client DELETE on the four assessment tables still denied (restrictive policies intact).
- [ ] **PF-013:** `request_self_deletion` still non-executable by anon/authenticated (grants intact).
- [ ] Student login / profile update / assessment submission unaffected.

## E. Rollback
**Technical rollback ≠ fixing forward.** Restoring the five `Superadmin select all …` policies (from the `20260723120000` definitions) and dropping the four RPCs **re-opens PF-007's unaudited direct read** — do this **only** as a deliberate emergency if the RPC path breaks superadmin operations and cannot be hotfixed. **Preferred recovery is a forward-fix to the RPCs.** Never restore unaudited global SELECT as the default.
```sql
-- EMERGENCY technical rollback (re-opens PF-007 — not the default):
--   (re-create the five policies from 20260723120000) ;
--   DROP FUNCTION IF EXISTS public.superadmin_list_students(text,integer,integer);
--   DROP FUNCTION IF EXISTS public.superadmin_get_student_profile(uuid,text);
--   DROP FUNCTION IF EXISTS public.superadmin_get_student_report_bundle(uuid,text);
--   DROP FUNCTION IF EXISTS public.superadmin_platform_counts();
```

## F. Deployment sequence
1. CI: `npm ci && npx vitest run src/test/privilegedReadAudit.test.ts` + `tsc` green.
2. Apply in preview; run B1–B3 + C1–C6 + D; regenerate types.
3. Snapshot `pg_policies` + `routine_privileges`; apply to production via the transactional migration workflow **after explicit human "go"**.
4. Post-apply: re-run B1 (0 superadmin policies) + a synthetic superadmin detail open (expect data + audit rows) + C1 (direct select empty) + C6 (tamper denied).

**Stop conditions:** any superadmin direct cross-school `select` still returns rows; any `superadmin_*` RPC returns data without an audit row; audit `details` contains psychometric payload; a non-superadmin successfully calls an RPC; counselor/scoped reads regress; PF-011/012/013 regress.
