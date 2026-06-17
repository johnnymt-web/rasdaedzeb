-- =========================================================================
-- G5 Phase B — Migration 2 (RLS LOCKDOWN ONLY)
-- ⛔ DO NOT APPLY until the edge-function save flow is verified in staging
--    AND explicit approval is given. This is the Phase-12-sensitive step.
-- =========================================================================
-- Removes the ability for clients to INSERT/UPDATE rows in public.assessments
-- directly. After this, the ONLY writer is the submit-assessment edge function
-- (service role, which bypasses RLS), so stored `results` are always recomputed
-- server-side and can never be fabricated by a modified client.
--
-- Preserved intentionally:
--   * "Scoped select assessments" (SELECT) — students/counselors/etc. keep read access.
--   * "Delete own assessments"   (DELETE) — GDPR / self-service deletion stays.
--
-- Phase A tables (big_five_assessments, caas_assessments, work_values_assessments)
-- are NOT touched here — they are protected by their own recompute triggers.
-- =========================================================================

DROP POLICY IF EXISTS "Insert own assessments" ON public.assessments;
DROP POLICY IF EXISTS "Update own assessments" ON public.assessments;

-- =========================================================================
-- ROLLBACK (uncomment + run to restore direct client insert/update):
-- CREATE POLICY "Insert own assessments" ON public.assessments
--   FOR INSERT WITH CHECK (public.is_self(user_id));
-- CREATE POLICY "Update own assessments" ON public.assessments
--   FOR UPDATE USING (public.is_self(user_id)) WITH CHECK (public.is_self(user_id));
-- =========================================================================
