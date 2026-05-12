-- ============================================================
-- FEATURE 5: WORK VALUES (O*NET WORK IMPORTANCE PROFILER)
-- ============================================================

CREATE TABLE IF NOT EXISTS public.work_values_assessments (
  id                UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id        UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  item_responses    JSONB       NOT NULL DEFAULT '{}',
  achievement       NUMERIC(4,2) CHECK (achievement BETWEEN 1 AND 5),
  independence      NUMERIC(4,2) CHECK (independence BETWEEN 1 AND 5),
  recognition       NUMERIC(4,2) CHECK (recognition BETWEEN 1 AND 5),
  relationships     NUMERIC(4,2) CHECK (relationships BETWEEN 1 AND 5),
  support           NUMERIC(4,2) CHECK (support BETWEEN 1 AND 5),
  working_conditions NUMERIC(4,2) CHECK (working_conditions BETWEEN 1 AND 5),
  version           TEXT        NOT NULL DEFAULT 'ONET-WIP-Short-v1',
  completed_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_work_values_student_latest ON public.work_values_assessments (student_id, completed_at DESC);

ALTER TABLE public.work_values_assessments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Students can read own Work Values results"
  ON public.work_values_assessments FOR SELECT
  USING (auth.uid() = student_id);

CREATE POLICY "Students can insert own Work Values assessments"
  ON public.work_values_assessments FOR INSERT
  WITH CHECK (auth.uid() = student_id);

CREATE POLICY "Counselors can read student Work Values results"
  ON public.work_values_assessments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p_counselor
      JOIN public.profiles p_student ON p_student.school_id = p_counselor.school_id
      WHERE p_counselor.id = auth.uid()
        AND p_student.id = work_values_assessments.student_id
        AND public.has_role(auth.uid(), 'counselor')
    )
  );

CREATE TRIGGER update_work_values_updated_at
  BEFORE UPDATE ON public.work_values_assessments
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
