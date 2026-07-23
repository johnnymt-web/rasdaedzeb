# Phase 2A — Production / Runtime Verification Checklist (PF-011)

Run in a **disposable** environment (Supabase Preview branch or local `supabase start`) with **synthetic** users/data only. Never against production data. Read-only catalog checks are safe anywhere. **Do not apply the migration to production until these pass.**

## A. Catalog verification (read-only)

### A1 — Trigger exists and points at the broadened function
```sql
select tgname, tgrelid::regclass as table, tgenabled,
       pg_get_triggerdef(oid) as def
from pg_trigger
where tgrelid = 'public.profiles'::regclass
  and not tgisinternal
order by tgname;
-- EXPECT: tr_protect_controlled_profile_fields (BEFORE UPDATE, FOR EACH ROW,
--         EXECUTE FUNCTION public.protect_controlled_profile_fields).
--         tr_protect_school_id should NO LONGER exist.
--         update_profiles_updated_at remains.
```

### A2 — Function definitions (security definer + pinned search_path)
```sql
select p.proname, p.prosecdef as security_definer, p.proconfig as settings
from pg_proc p join pg_namespace n on n.oid = p.pronamespace
where n.nspname='public'
  and p.proname in ('protect_controlled_profile_fields','start_new_assessment_cycle');
-- EXPECT: both security_definer = true, settings contains search_path=public.
-- EXPECT: protect_school_id_update no longer present.
```

### A3 — RPC execute grant
```sql
select grantee, privilege_type
from information_schema.routine_privileges
where routine_name = 'start_new_assessment_cycle' and routine_schema = 'public';
-- EXPECT: EXECUTE granted to authenticated; NOT to public/anon.
```

## B. Synthetic runtime tests (disposable DB, synthetic users)

Create synthetic `auth.users` + `public.profiles` + `public.user_roles`: student S (own school), student T, counselor C, school-admin SA (same school as S), platform-admin PA (`user_roles.role='admin'`). Impersonate each via the request JWT (`role='authenticated'`, `sub=<uid>`), e.g. in a test harness `set local request.jwt.claims = '{"role":"authenticated","sub":"<uid>"}'`.

### B1 — Student CANNOT change controlled fields (as S)
```sql
update public.profiles set grade = 'Year 13' where id = '<S>';                       -- EXPECT: ERROR "Not authorized to change grade..."
update public.profiles set current_assessment_cycle = 99 where id = '<S>';           -- EXPECT: ERROR "Not authorized to change the assessment cycle..."
update public.profiles set grade='Year 13', current_assessment_cycle=99 where id='<S>'; -- EXPECT: ERROR (both in one request rejected)
-- Bypass attempt: include unchanged values + one changed controlled value:
update public.profiles set full_name = full_name, grade = 'Year 13' where id='<S>';  -- EXPECT: ERROR (grade change still rejected)
```

### B2 — Student CAN update a permitted field (as S)
```sql
update public.profiles set full_name = 'New Name' where id = '<S>';                  -- EXPECT: success (unrelated field unaffected)
update public.profiles set grade = grade where id = '<S>';                           -- EXPECT: success (unchanged grade is not a modification — IS DISTINCT FROM)
```

### B3 — Student CAN advance own cycle only via the RPC (as S)
```sql
select public.start_new_assessment_cycle();                                          -- EXPECT: returns OLD+1; profiles.current_assessment_cycle incremented for S
-- Confirm the student still cannot set an arbitrary value directly (B1 already covers).
```

### B4 — Trusted roles succeed
```sql
-- as SA (school admin for S) OR PA (platform admin):
update public.profiles set grade = 'Year 11' where id = '<S>';                       -- EXPECT: success
update public.profiles set current_assessment_cycle = 3 where id = '<S>';            -- EXPECT: success
```

### B5 — Unauthorized staff rejected
```sql
-- as C (counselor):
update public.profiles set grade = 'Year 11' where id = '<S>';                       -- EXPECT: ERROR (counselors are not granted)
```

### B6 — Null / boundary behavior (as S unless noted)
```sql
-- value -> null and null -> value are both protected:
update public.profiles set grade = null where id = '<S>';                            -- EXPECT: ERROR
-- (set a null grade via admin first, then) student null -> value:
update public.profiles set grade = 'Year 12' where id = '<S>';                       -- EXPECT: ERROR
-- unchanged value is NOT a modification:
update public.profiles set current_assessment_cycle = current_assessment_cycle where id='<S>'; -- EXPECT: success
```

### B7 — service_role bypass (as service_role / migration context)
```sql
-- with service_role JWT (role != 'authenticated'):
update public.profiles set grade = 'Year 10' where id = '<S>';                       -- EXPECT: success (internal/onboarding path unaffected)
```

### B8 — No new write access & existing protections intact
- Confirm the five superadmin/assessment write policies are unchanged; `assessments` remains service-role-write-locked.
- Confirm `school_id` self-change by a non-school-admin still fails (existing guard preserved).
- Confirm role-escalation protection (`enforce_role_assignment`) is unchanged (this migration does not touch it).

## C. Historical assessment context (read-only, informational)

```sql
select assessment_type, grade_band, question_set_version, cycle_number
from public.assessments where user_id = '<S>' order by created_at desc limit 5;
-- Confirms attempts store grade_band/version/cycle at submission → changing the
-- current profile grade does not retroactively alter stored history.
```

## D. Rollback readiness

Rollback (removes ONLY this remediation; re-opens PF-011 — use only for a confirmed defect):
```sql
DROP TRIGGER IF EXISTS tr_protect_controlled_profile_fields ON public.profiles;
DROP FUNCTION IF EXISTS public.start_new_assessment_cycle();
DROP FUNCTION IF EXISTS public.protect_controlled_profile_fields();
-- To fully restore prior behavior, recreate protect_school_id_update() +
-- tr_protect_school_id from 20260605210211_phase1a_security_rls.sql.
```
After rollback the app's retake RPC call would fail — so only roll back together with reverting the `AssessmentHistory.tsx` change, or forward-fix instead.

## E. Deployment sequence

1. CI: `npm ci && npx vitest run src/test/profileFieldProtection.test.ts` + `tsc` green.
2. Apply migration in **preview**; run A1–A3 + B1–B8.
3. Confirm the app retake flow works against preview (RPC increments cycle; report reflects new cycle).
4. Take a pre-apply snapshot; apply to production via the transactional migration workflow.
5. Post-apply: re-run A1–A3; smoke-test one synthetic student retake; confirm no `42501`/authorization errors for legitimate admin grade edits.

**Stop conditions:** any trusted-role update rejected; any student update accepted; trigger absent or duplicated; `school_id`/role protections regressed.

## F. Notes

- `AI_FEATURES_ENABLED` / consent / PF-012 deletion / PF-007 logging are **out of scope** and unchanged.
- No real student identifiers or secrets appear in this document.
