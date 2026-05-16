-- 0. Ensure mapping table exists
CREATE TABLE IF NOT EXISTS public.parent_students (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(parent_id, student_id)
);

ALTER TABLE public.parent_students ENABLE ROW LEVEL SECURITY;

-- 1. Career Exposure Activities
CREATE POLICY "Parents can view linked student activities"
  ON public.career_exposure_activities FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.parent_students
    WHERE parent_students.parent_id = auth.uid() 
      AND parent_students.student_id = public.career_exposure_activities.student_id
  ));

-- 2. Student Action Plans
CREATE POLICY "Parents can view linked student action plans"
  ON public.student_action_plans FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.parent_students
    WHERE parent_students.parent_id = auth.uid() 
      AND parent_students.student_id = public.student_action_plans.student_id
  ));

-- 3. Student Subject Plans
CREATE POLICY "Parents can view linked student subject plans"
  ON public.student_subject_plans FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.parent_students
    WHERE parent_students.parent_id = auth.uid() 
      AND parent_students.student_id = public.student_subject_plans.student_id
  ));

-- 4. Student Career Pathways
CREATE POLICY "Parents can view linked student pathways"
  ON public.student_career_pathways FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.parent_students
    WHERE parent_students.parent_id = auth.uid() 
      AND parent_students.student_id = public.student_career_pathways.student_id
  ));
