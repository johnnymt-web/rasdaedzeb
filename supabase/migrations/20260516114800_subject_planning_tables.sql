-- ============================================================
-- Phase 8: Subject-Choice Planner Tables
-- ============================================================

-- 1. Student Subject Plans
-- Tracks formal subject choices and rationale
CREATE TABLE IF NOT EXISTS public.student_subject_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  academic_year TEXT NOT NULL, -- e.g., "2024-2025"
  subjects JSONB NOT NULL DEFAULT '[]', -- Array of { name, level, interest_score, confidence_score }
  rationale TEXT,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'submitted', 'reviewed')),
  counselor_feedback TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(student_id, academic_year)
);

-- 2. Enable RLS
ALTER TABLE public.student_subject_plans ENABLE ROW LEVEL SECURITY;

-- 3. RLS Policies
-- Students can manage their own plans
CREATE POLICY "Students can manage their own subject plans"
  ON public.student_subject_plans
  FOR ALL
  USING (auth.uid() = student_id);

-- Counselors can view and update plans for their students
CREATE POLICY "Counselors can view and update student subject plans"
  ON public.student_subject_plans
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.counselor_students
      WHERE counselor_id = auth.uid() AND student_id = public.student_subject_plans.student_id
    )
  );

-- Admins can view all
CREATE POLICY "Admins can view all subject plans"
  ON public.student_subject_plans
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('admin', 'superadmin')
    )
  );
