-- =========================================================================
-- Capture-only: superadmin global-read SELECT policies (PF-006 drift capture).
-- =========================================================================
-- These five PERMISSIVE, SELECT-only policies were applied to production
-- out-of-band (Supabase SQL Editor) and were NOT present in repository
-- migrations, so a clean `db reset` did not reproduce the production RLS state.
-- This migration captures them verbatim from confirmed read-only production
-- evidence (pg_policies exports A1/A2/A3, 2026-07-23) so the repo reproduces
-- production and the grant is reviewable.
--
-- Live definition (identical for all five, per A1/A2/A3):
--   permissive = PERMISSIVE · cmd = SELECT · roles = {public}
--   qual = has_role(auth.uid(), 'superadmin'::app_role) · with_check = NULL
-- Written schema-qualified (public.has_role / public.app_role) — semantically
-- identical since search_path includes public (see has_role, A4 =
-- 20260618170000_superadmin_privileges.sql: SECURITY DEFINER, search_path=public).
--
-- Additive & read-only: grants superadmin SELECT only. Adds no INSERT/UPDATE/
-- DELETE, modifies no other policy, and does not touch public.has_role or
-- public.user_roles. DROP POLICY IF EXISTS + CREATE POLICY is idempotent:
-- a clean DB gets the policy; the already-patched production DB is normalized to
-- this exact reviewed definition. superadmin status is the trusted
-- public.user_roles.role value (not client-settable — enforce_role_assignment
-- blocks self-grant), so no ordinary authenticated user gains access.
--
-- NOTE: this only makes the existing production grant reproducible. It does NOT
-- add privileged-read audit logging — PF-007 remains open and out of scope.
-- =========================================================================

DROP POLICY IF EXISTS "Superadmin select all assessments" ON public.assessments;
CREATE POLICY "Superadmin select all assessments"
ON public.assessments
AS PERMISSIVE
FOR SELECT
TO public
USING (public.has_role(auth.uid(), 'superadmin'::public.app_role));

DROP POLICY IF EXISTS "Superadmin select all big_five" ON public.big_five_assessments;
CREATE POLICY "Superadmin select all big_five"
ON public.big_five_assessments
AS PERMISSIVE
FOR SELECT
TO public
USING (public.has_role(auth.uid(), 'superadmin'::public.app_role));

DROP POLICY IF EXISTS "Superadmin select all caas" ON public.caas_assessments;
CREATE POLICY "Superadmin select all caas"
ON public.caas_assessments
AS PERMISSIVE
FOR SELECT
TO public
USING (public.has_role(auth.uid(), 'superadmin'::public.app_role));

DROP POLICY IF EXISTS "Superadmin select all profiles" ON public.profiles;
CREATE POLICY "Superadmin select all profiles"
ON public.profiles
AS PERMISSIVE
FOR SELECT
TO public
USING (public.has_role(auth.uid(), 'superadmin'::public.app_role));

DROP POLICY IF EXISTS "Superadmin select all work_values" ON public.work_values_assessments;
CREATE POLICY "Superadmin select all work_values"
ON public.work_values_assessments
AS PERMISSIVE
FOR SELECT
TO public
USING (public.has_role(auth.uid(), 'superadmin'::public.app_role));

-- Rollback (removes ONLY these five superadmin SELECT grants; do not run unless
-- the capture was incorrect — dropping them re-breaks superadmin visibility):
--   DROP POLICY IF EXISTS "Superadmin select all assessments"   ON public.assessments;
--   DROP POLICY IF EXISTS "Superadmin select all big_five"      ON public.big_five_assessments;
--   DROP POLICY IF EXISTS "Superadmin select all caas"          ON public.caas_assessments;
--   DROP POLICY IF EXISTS "Superadmin select all profiles"      ON public.profiles;
--   DROP POLICY IF EXISTS "Superadmin select all work_values"   ON public.work_values_assessments;
