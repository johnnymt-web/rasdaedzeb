-- ============================================================
-- Phase 5/6: Career Guidance Development Program Tables
-- Creates career_exposure_activities and student_action_plans
-- ============================================================

-- 1. Career Exposure Activities
-- Tracks career learning activities (videos, interviews, visits, etc.)
CREATE TABLE IF NOT EXISTS public.career_exposure_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  activity_type TEXT NOT NULL CHECK (activity_type IN (
    'career_video', 'professional_interview', 'guest_speaker',
    'career_fair', 'workplace_visit', 'job_shadowing',
    'university_visit', 'mentor_meeting', 'project_completed',
    'volunteering', 'competition', 'other'
  )),
  title TEXT NOT NULL,
  description TEXT,
  activity_date DATE,
  reflection TEXT,
  evidence_url TEXT,
  counselor_comment TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.career_exposure_activities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Students can view own activities"
  ON public.career_exposure_activities FOR SELECT
  TO authenticated
  USING (auth.uid() = student_id);

CREATE POLICY "Students can insert own activities"
  ON public.career_exposure_activities FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = student_id);

CREATE POLICY "Students can update own activities"
  ON public.career_exposure_activities FOR UPDATE
  TO authenticated
  USING (auth.uid() = student_id);

CREATE POLICY "Counselors can view all activities"
  ON public.career_exposure_activities FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_roles.user_id = auth.uid()
        AND user_roles.role IN ('counselor', 'admin')
    )
  );

CREATE POLICY "Counselors can comment on activities"
  ON public.career_exposure_activities FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_roles.user_id = auth.uid()
        AND user_roles.role IN ('counselor', 'admin')
    )
  );

-- 2. Student Action Plans
-- Individual action items assigned by student, counselor, or system
CREATE TABLE IF NOT EXISTS public.student_action_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN (
    'exploration', 'reflection', 'skill_building',
    'subject_choice', 'pathway_planning', 'portfolio',
    'application', 'networking', 'other'
  )),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN (
    'pending', 'in_progress', 'completed', 'overdue', 'cancelled'
  )),
  due_date DATE,
  assigned_by UUID REFERENCES auth.users(id),
  assigned_by_role TEXT CHECK (assigned_by_role IN ('student', 'counselor', 'system')),
  related_report_section TEXT,
  completion_reflection TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.student_action_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Students can view own action plans"
  ON public.student_action_plans FOR SELECT
  TO authenticated
  USING (auth.uid() = student_id);

CREATE POLICY "Students can insert own action plans"
  ON public.student_action_plans FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = student_id);

CREATE POLICY "Students can update own action plans"
  ON public.student_action_plans FOR UPDATE
  TO authenticated
  USING (auth.uid() = student_id);

CREATE POLICY "Counselors can view all action plans"
  ON public.student_action_plans FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_roles.user_id = auth.uid()
        AND user_roles.role IN ('counselor', 'admin')
    )
  );

CREATE POLICY "Counselors can insert action plans for students"
  ON public.student_action_plans FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_roles.user_id = auth.uid()
        AND user_roles.role IN ('counselor', 'admin')
    )
  );

CREATE POLICY "Counselors can update action plans"
  ON public.student_action_plans FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_roles.user_id = auth.uid()
        AND user_roles.role IN ('counselor', 'admin')
    )
  );

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_career_exposure_student ON public.career_exposure_activities(student_id);
CREATE INDEX IF NOT EXISTS idx_career_exposure_type ON public.career_exposure_activities(activity_type);
CREATE INDEX IF NOT EXISTS idx_action_plans_student ON public.student_action_plans(student_id);
CREATE INDEX IF NOT EXISTS idx_action_plans_status ON public.student_action_plans(status);

-- Updated_at triggers
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_career_exposure_updated_at
  BEFORE UPDATE ON public.career_exposure_activities
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_action_plans_updated_at
  BEFORE UPDATE ON public.student_action_plans
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
