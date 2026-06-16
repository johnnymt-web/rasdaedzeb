-- =========================================================================
-- AI SYNTHESIS REPORT CACHE (Phase 1 — deep interpretation)
-- Depends on helper functions from 20260605210211_phase1a_security_rls.sql:
--   public.can_access_student_assessment(uuid)
--   public.is_assigned_counselor(uuid)
-- Writes are performed by the generate-synthesis Edge Function using the
-- service_role key (which bypasses RLS), so only SELECT policies are defined.
-- =========================================================================

-- -------------------------------------------------------------------------
-- A. Student-safe cached report (self / parent / assigned counselor may read)
-- -------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.ai_reports (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id    UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  cache_key     TEXT NOT NULL,
  report_json   JSONB NOT NULL,
  model         TEXT NOT NULL,
  lang          TEXT NOT NULL DEFAULT 'ka',
  grade_band    TEXT,
  generated_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT uq_ai_reports UNIQUE (student_id, cache_key)
);

CREATE INDEX IF NOT EXISTS idx_ai_reports_student ON public.ai_reports(student_id);

ALTER TABLE public.ai_reports ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Scoped select ai_reports" ON public.ai_reports;
CREATE POLICY "Scoped select ai_reports" ON public.ai_reports
  FOR SELECT USING (public.can_access_student_assessment(student_id));

-- -------------------------------------------------------------------------
-- B. Counselor-only notes (flags / intervention / parent talking points)
--    Stored separately because RLS is row-level and cannot hide a column.
-- -------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.ai_report_counselor_notes (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id    UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  cache_key     TEXT NOT NULL,
  notes_json    JSONB NOT NULL,
  generated_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT uq_ai_notes UNIQUE (student_id, cache_key)
);

CREATE INDEX IF NOT EXISTS idx_ai_notes_student ON public.ai_report_counselor_notes(student_id);

ALTER TABLE public.ai_report_counselor_notes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Counselor select ai notes" ON public.ai_report_counselor_notes;
CREATE POLICY "Counselor select ai notes" ON public.ai_report_counselor_notes
  FOR SELECT USING (public.is_assigned_counselor(student_id));
