-- Create reflections table
CREATE TABLE public.reflections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  assessment_id UUID REFERENCES public.assessments(id) ON DELETE CASCADE,
  prompt TEXT NOT NULL,
  response TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.reflections ENABLE ROW LEVEL SECURITY;

-- Students can view their own reflections
CREATE POLICY "Students can view own reflections"
  ON public.reflections FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Students can insert their own reflections
CREATE POLICY "Students can insert own reflections"
  ON public.reflections FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Students can update their own reflections
CREATE POLICY "Students can update own reflections"
  ON public.reflections FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- Counselors can view all reflections
CREATE POLICY "Counselors can view all reflections"
  ON public.reflections FOR SELECT
  TO authenticated
  USING (has_role(auth.uid(), 'counselor'::app_role));

-- Parents can view linked student reflections
CREATE POLICY "Parents can view linked student reflections"
  ON public.reflections FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.parent_students
      WHERE parent_students.parent_id = auth.uid()
        AND parent_students.student_id = reflections.user_id
    )
  );

-- Admin can view all reflections
CREATE POLICY "Admins can view all reflections"
  ON public.reflections FOR SELECT
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER update_reflections_updated_at
  BEFORE UPDATE ON public.reflections
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
