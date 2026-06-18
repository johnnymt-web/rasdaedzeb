-- =========================================================================
-- G5 Phase B — Migration 1 (ADDITIVE ONLY, no RLS changes)
-- =========================================================================
-- Adds two columns to assessments so server-side scoring is explicit and
-- defensible:
--   * grade_band            — student's developmental band, derived server-side
--                             from profiles.grade (NOT from the client).
--   * question_set_version  — the exact question bank / scoring structure that
--                             was administered (e.g. riasec_planning_v1_48,
--                             skills_v1_5, eq_v1_12). Needed because RIASEC has
--                             two incompatible structures (48-item grade banks
--                             vs the 30-item fallback set); recording the version
--                             makes future server-side rescoring unambiguous.
--
-- Both values are written ONLY by the submit-assessment edge function.
-- This migration intentionally contains NO RLS changes (those are Migration 2).
-- =========================================================================

ALTER TABLE public.assessments ADD COLUMN IF NOT EXISTS grade_band text;
ALTER TABLE public.assessments ADD COLUMN IF NOT EXISTS question_set_version text;

COMMENT ON COLUMN public.assessments.grade_band IS
  'Developmental band derived server-side from profiles.grade (discovery/exploration/planning/transition/unknown). Set by submit-assessment edge function.';
COMMENT ON COLUMN public.assessments.question_set_version IS
  'Question bank / scoring structure administered, e.g. riasec_planning_v1_48, skills_v1_5, eq_v1_12. Set by submit-assessment edge function.';

-- Rollback: both columns are additive and harmless; they may remain.
-- To remove (not required):
--   ALTER TABLE public.assessments DROP COLUMN IF EXISTS question_set_version;
--   ALTER TABLE public.assessments DROP COLUMN IF EXISTS grade_band;
