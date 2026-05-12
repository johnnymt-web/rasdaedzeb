
-- Table linking parents to their student children
CREATE TABLE public.parent_students (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_id uuid NOT NULL,
  student_id uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (parent_id, student_id)
);

ALTER TABLE public.parent_students ENABLE ROW LEVEL SECURITY;

-- Parents can see their own links
CREATE POLICY "Parents can view own links"
  ON public.parent_students FOR SELECT
  TO authenticated
  USING (auth.uid() = parent_id);

-- Admins can manage all links
CREATE POLICY "Admins can manage links"
  ON public.parent_students FOR ALL
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Counselors can view all links
CREATE POLICY "Counselors can view links"
  ON public.parent_students FOR SELECT
  TO authenticated
  USING (has_role(auth.uid(), 'counselor'::app_role));

-- Parents can view their linked student's assessments
CREATE POLICY "Parents can view linked student assessments"
  ON public.assessments FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.parent_students
      WHERE parent_students.parent_id = auth.uid()
        AND parent_students.student_id = assessments.user_id
    )
  );

-- Parents can view their linked student's profile
CREATE POLICY "Parents can view linked student profiles"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.parent_students
      WHERE parent_students.parent_id = auth.uid()
        AND parent_students.student_id = profiles.id
    )
  );
