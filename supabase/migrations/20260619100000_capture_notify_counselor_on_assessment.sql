-- =========================================================================
-- Repo-sync (drift capture): notify_counselor_on_assessment function + trigger.
-- These objects existed ONLY in the live DB (never in the repo). This records the
-- CURRENT LIVE definitions so a from-scratch rebuild reproduces production.
--   * Function: the live-corrected version (the SQL-Editor fix removed a bad
--     reference to NEW.type; `assessments` has no `type` column, only
--     `assessment_type`). Captured verbatim from pg_get_functiondef.
--   * Trigger: captured verbatim from pg_get_triggerdef (AFTER INSERT,
--     WHEN completed_at IS NOT NULL), wrapped with DROP IF EXISTS for idempotency.
--     The EXECUTE FUNCTION call is schema-qualified (public.) for reproducibility;
--     this does not change runtime behavior.
-- NOT applied by Claude Code — repo hygiene only. SECURITY DEFINER search_path is
-- intentionally left as-is (faithful to live); hardening is a separate task.
-- =========================================================================

CREATE OR REPLACE FUNCTION public.notify_counselor_on_assessment()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
  v_counselor_id uuid;
  v_student_name text;
  v_assessment_type text;
BEGIN
  SELECT ca.counselor_id INTO v_counselor_id
  FROM counselor_assignments ca
  WHERE ca.student_id = NEW.user_id
  LIMIT 1;

  IF v_counselor_id IS NULL THEN
    RETURN NEW;
  END IF;

  SELECT full_name INTO v_student_name
  FROM profiles
  WHERE id = NEW.user_id;

  v_assessment_type := COALESCE(NEW.assessment_type, 'assessment');

  INSERT INTO notifications (counselor_id, student_id, type, message)
  VALUES (
    v_counselor_id,
    NEW.user_id,
    'assessment_completed',
    v_student_name || ' completed ' || v_assessment_type
  );

  RETURN NEW;
END;
$function$;

-- Idempotent equivalent of the verified live trigger:
DROP TRIGGER IF EXISTS on_assessment_completed ON public.assessments;
CREATE TRIGGER on_assessment_completed
  AFTER INSERT ON public.assessments
  FOR EACH ROW
  WHEN ((new.completed_at IS NOT NULL))
  EXECUTE FUNCTION public.notify_counselor_on_assessment();
