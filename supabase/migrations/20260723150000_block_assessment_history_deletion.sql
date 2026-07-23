-- =========================================================================
-- PF-012: protect assessment / longitudinal history from direct hard deletion.
-- =========================================================================
-- This system stores minors' longitudinal career-development and psychometric
-- history. Independent audit finding PF-012 confirmed that a student could
-- HARD-DELETE their own completed assessment attempts via direct API/DB access,
-- because permissive DELETE RLS policies granted ownership-based delete:
--   "Delete own assessments" ON assessments            (is_self(user_id))
--   "Delete own big_five"    ON big_five_assessments   (is_self(student_id))
--   "Delete own caas"        ON caas_assessments        (is_self(student_id))
-- Live pg_policies evidence (session export A2, 2026-07-23) confirms these three
-- are the ONLY DELETE policies on any completed-assessment table
-- (work_values_assessments already had none). No application code deletes
-- assessment rows, and the retake/cycle flow (Phase 2A) creates a NEW cycle
-- rather than deleting prior attempts — so removing client delete breaks nothing.
--
-- Boundary (least privilege): NO client role may hard-delete assessment history.
--   * student / counselor / school-admin / platform-admin / superadmin / anon
--       -> DELETE denied at the database.
--   * service_role (BYPASSRLS) and ON DELETE CASCADE triggered by account
--       erasure remain the only deletion paths. Two account-erasure RPCs exist:
--       the admin-only, audited public.delete_user (SECURITY DEFINER, has_role
--       'admin'), and public.request_self_deletion (SECURITY DEFINER, no role
--       gate) which lets an authenticated user delete THEIR OWN auth.users row.
--       Both cascade to this table. This migration deliberately does NOT change
--       that: whole-account self-erasure is GDPR right-to-erasure, a different
--       action from the surgical "delete one attempt, keep the account" vector
--       PF-012 targets — and a restrictive DELETE policy cannot (by design)
--       constrain a SECURITY-DEFINER cascade anyway. NOTE (residual, tracked
--       follow-up): request_self_deletion is NOT well-governed for minors (no
--       audit entry, no consent/parental gate, no anon REVOKE) and IS a
--       student-accessible cascade path that erases assessment history. It must
--       be governed before pilot; it is out of Phase 2B's direct-DELETE scope.
--       profiles has no student DELETE policy and does not share the auth.users
--       FK target, so there is no *additional* cascade bypass beyond the two
--       account-erasure RPCs above.
--
-- Privacy note: legitimate privacy/consent-driven erasure of a minor's data is a
-- SEPARATE governed workflow (account-level delete_user + future DSAR process),
-- NOT direct table DELETE. This migration blocks uncontrolled deletion while
-- preserving that governed erasure path. It makes no claim about required
-- retention periods.
-- =========================================================================

-- 1) Remove the unsafe ownership-based DELETE grants (the PF-012 root cause).
DROP POLICY IF EXISTS "Delete own assessments" ON public.assessments;
DROP POLICY IF EXISTS "Delete own big_five"    ON public.big_five_assessments;
DROP POLICY IF EXISTS "Delete own caas"        ON public.caas_assessments;

-- 2) Explicit, regression-proof denial of client DELETE on every completed-
--    assessment table. RESTRICTIVE policies are AND-ed with any permissive
--    policy, so even if a future migration re-introduces a permissive
--    "Delete own ..." policy, client DELETE stays denied. USING (false) matches
--    no row. service_role bypasses RLS and is unaffected; cascade deletes from
--    account erasure are performed by the system / SECURITY DEFINER and are
--    unaffected. SELECT / INSERT / UPDATE behavior is untouched.
DROP POLICY IF EXISTS "No client delete of assessments" ON public.assessments;
CREATE POLICY "No client delete of assessments"
  ON public.assessments AS RESTRICTIVE FOR DELETE TO public USING (false);

DROP POLICY IF EXISTS "No client delete of big_five" ON public.big_five_assessments;
CREATE POLICY "No client delete of big_five"
  ON public.big_five_assessments AS RESTRICTIVE FOR DELETE TO public USING (false);

DROP POLICY IF EXISTS "No client delete of caas" ON public.caas_assessments;
CREATE POLICY "No client delete of caas"
  ON public.caas_assessments AS RESTRICTIVE FOR DELETE TO public USING (false);

DROP POLICY IF EXISTS "No client delete of work_values" ON public.work_values_assessments;
CREATE POLICY "No client delete of work_values"
  ON public.work_values_assessments AS RESTRICTIVE FOR DELETE TO public USING (false);

-- =========================================================================
-- Rollback (re-opens PF-012 — do only for a confirmed defect):
--   DROP POLICY IF EXISTS "No client delete of assessments"  ON public.assessments;
--   DROP POLICY IF EXISTS "No client delete of big_five"     ON public.big_five_assessments;
--   DROP POLICY IF EXISTS "No client delete of caas"         ON public.caas_assessments;
--   DROP POLICY IF EXISTS "No client delete of work_values"  ON public.work_values_assessments;
--   -- Restoring the old permissive "Delete own ..." policies is NOT recommended
--   -- (that is the vulnerability). Prefer a governed deletion workflow instead.
-- =========================================================================
