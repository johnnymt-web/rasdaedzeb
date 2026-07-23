-- =========================================================================
-- PF-011: protect controlled profile fields (grade, current_assessment_cycle)
-- from direct student edits — enforced in the database, not just the UI.
-- =========================================================================
-- Root cause: the "Update own profile" RLS policy allows a student to UPDATE
-- their own profiles row with no column restriction (only school_id was guarded
-- by protect_school_id_update). So a student could set `grade` (which drives
-- grade band + which assessments are shown/interpreted) or
-- `current_assessment_cycle` (which groups longitudinal attempts) to any value
-- via a direct API/DB call.
--
-- Fix: broaden the single existing profile-protection trigger to also guard
-- `grade` and `current_assessment_cycle`. Trusted-update boundary:
--   * service_role / internal (non-'authenticated' JWT) — bypass (onboarding,
--     promotion scripts, edge functions), exactly as the prior school_id guard.
--   * platform admin (has_role 'admin', which superadmin inherits) OR the
--     student's school admin — may change grade and cycle.
--   * the student — may NOT change grade at all, and may advance their own
--     cycle ONLY through public.start_new_assessment_cycle() (a controlled +1
--     on their own row), never by a direct UPDATE.
-- Unchanged: full_name, avatar_url, preferred_language, etc. remain
-- student-editable; the school_id guard is preserved verbatim.
--
-- This supersedes public.protect_school_id_update(); the single BEFORE UPDATE
-- protection trigger is renamed to reflect its broader scope (no second,
-- overlapping trigger is added).
-- =========================================================================

CREATE OR REPLACE FUNCTION public.protect_controlled_profile_fields()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  -- true only for ordinary end-user requests; service_role / internal callers
  -- carry a different JWT 'role' (or none) and therefore bypass every check.
  v_authenticated boolean :=
    NULLIF(current_setting('request.jwt.claims', true), '')::jsonb->>'role' = 'authenticated';
BEGIN
  IF v_authenticated THEN

    -- (1) school_id — preserved from protect_school_id_update: school admins only.
    IF NEW.school_id IS DISTINCT FROM OLD.school_id
       AND NOT public.is_school_admin_for_user(OLD.id) THEN
      RAISE EXCEPTION 'Not authorized to change school_id directly. Contact an administrator.';
    END IF;

    -- (2) grade — system/administration controlled. Platform admin or the
    -- student's school admin only; never the student.
    IF NEW.grade IS DISTINCT FROM OLD.grade
       AND NOT (public.has_role(auth.uid(), 'admin'::public.app_role)
                OR public.is_school_admin_for_user(OLD.id)) THEN
      RAISE EXCEPTION 'Not authorized to change grade directly. Contact an administrator.';
    END IF;

    -- (3) current_assessment_cycle — system controlled. Allowed only for:
    --   * platform admin / the student's school admin, OR
    --   * the trusted retake path: the app.cycle_update_ok flag (set ONLY inside
    --     public.start_new_assessment_cycle()) AND the row being changed is the
    --     caller's OWN profile (OLD.id = auth.uid()).
    -- The flag alone is not sufficient — it is bound to the authenticated owner
    -- so it cannot authorize a change to any other row even if it were ever set.
    IF NEW.current_assessment_cycle IS DISTINCT FROM OLD.current_assessment_cycle
       AND NOT (
             (current_setting('app.cycle_update_ok', true) = 'on' AND OLD.id = auth.uid())
             OR public.has_role(auth.uid(), 'admin'::public.app_role)
             OR public.is_school_admin_for_user(OLD.id)
           ) THEN
      RAISE EXCEPTION 'Not authorized to change the assessment cycle directly. Use the retake flow.';
    END IF;

  END IF;

  RETURN NEW;
END;
$$;

-- Retarget the single profile-protection trigger to the broadened function.
DROP TRIGGER IF EXISTS tr_protect_school_id ON public.profiles;
DROP TRIGGER IF EXISTS tr_protect_controlled_profile_fields ON public.profiles;
CREATE TRIGGER tr_protect_controlled_profile_fields
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.protect_controlled_profile_fields();

-- The old single-purpose function is no longer referenced by any trigger.
DROP FUNCTION IF EXISTS public.protect_school_id_update();

-- =========================================================================
-- Trusted path: a student starts a new assessment cycle (controlled +1 on their
-- OWN row only). SECURITY DEFINER + a transaction-local flag lets this one path
-- through the trigger; arbitrary client cycle writes stay blocked.
-- Replaces the previous client-side `UPDATE profiles SET current_assessment_cycle`.
-- =========================================================================
CREATE OR REPLACE FUNCTION public.start_new_assessment_cycle()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_uid uuid := auth.uid();
  v_new integer;
BEGIN
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Bless this transaction so the profile-protection trigger permits the cycle
  -- change (transaction-local; resets automatically).
  PERFORM set_config('app.cycle_update_ok', 'on', true);

  UPDATE public.profiles
     SET current_assessment_cycle = COALESCE(current_assessment_cycle, 1) + 1
   WHERE id = v_uid
   RETURNING current_assessment_cycle INTO v_new;

  IF v_new IS NULL THEN
    RAISE EXCEPTION 'Profile not found for current user';
  END IF;

  RETURN v_new;
END;
$$;

REVOKE ALL ON FUNCTION public.start_new_assessment_cycle() FROM public;
GRANT EXECUTE ON FUNCTION public.start_new_assessment_cycle() TO authenticated;

-- =========================================================================
-- Rollback procedure (removes ONLY this remediation):
--   DROP TRIGGER IF EXISTS tr_protect_controlled_profile_fields ON public.profiles;
--   DROP FUNCTION IF EXISTS public.start_new_assessment_cycle();
--   DROP FUNCTION IF EXISTS public.protect_controlled_profile_fields();
--   -- MANDATORY on rollback: recreate the original school_id guard from
--   -- 20260605210211_phase1a_security_rls.sql (public.protect_school_id_update()
--   -- + trigger tr_protect_school_id). This new function SUPERSEDES it, so
--   -- dropping this trigger without restoring that one would leave school_id
--   -- unprotected (re-opening the earlier tenant-boundary issue). Do NOT treat
--   -- restoring the school_id guard as optional.
-- Note: rolling back also re-opens PF-011 (students could edit grade/cycle) and
-- breaks the app retake RPC — revert AssessmentHistory.tsx too, or forward-fix.
-- =========================================================================
