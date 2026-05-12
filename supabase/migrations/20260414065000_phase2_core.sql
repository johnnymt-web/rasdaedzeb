-- Create custom enums if they don't exist
DO $$ BEGIN
    CREATE TYPE goal_status AS ENUM ('not_started', 'in_progress', 'completed');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE saved_item_type AS ENUM ('subject', 'pathway', 'profession', 'career_family');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE meeting_status AS ENUM ('scheduled', 'completed', 'cancelled');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE follow_up_status AS ENUM ('pending', 'completed');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE event_type AS ENUM ('webinar', 'workshop', 'deadline', 'notice');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE event_audience AS ENUM ('all', 'students', 'parents');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;


-- ==========================================================
-- 1. STUDENT GOALS
-- ==========================================================
CREATE TABLE public.student_goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  status goal_status NOT NULL DEFAULT 'not_started',
  target_date DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.student_goals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Students can manage own goals"
  ON public.student_goals FOR ALL
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Counselors can view all goals"
  ON public.student_goals FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'counselor'));

CREATE POLICY "Parents can view linked student goals"
  ON public.student_goals FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.parent_students
    WHERE parent_students.parent_id = auth.uid() AND parent_students.student_id = student_goals.user_id
  ));


-- ==========================================================
-- 2. SAVED PATHWAYS
-- ==========================================================
CREATE TABLE public.saved_pathways (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  type saved_item_type NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, title, type) -- Prevent duplicate saves of same item
);

ALTER TABLE public.saved_pathways ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Students can manage own saved items"
  ON public.saved_pathways FOR ALL
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Counselors can view saved items"
  ON public.saved_pathways FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'counselor'));

CREATE POLICY "Parents can view linked student saved items"
  ON public.saved_pathways FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.parent_students
    WHERE parent_students.parent_id = auth.uid() AND parent_students.student_id = saved_pathways.user_id
  ));


-- ==========================================================
-- 3. COUNSELOR MEETINGS
-- ==========================================================
CREATE TABLE public.counselor_meetings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  counselor_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  scheduled_at TIMESTAMPTZ NOT NULL,
  duration_mins INTEGER DEFAULT 30,
  status meeting_status NOT NULL DEFAULT 'scheduled',
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.counselor_meetings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Counselors can manage their meetings"
  ON public.counselor_meetings FOR ALL
  TO authenticated
  USING (auth.uid() = counselor_id);

CREATE POLICY "Students can view their meetings"
  ON public.counselor_meetings FOR SELECT
  TO authenticated
  USING (auth.uid() = student_id);

CREATE POLICY "Parents can view linked student meetings"
  ON public.counselor_meetings FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.parent_students
    WHERE parent_students.parent_id = auth.uid() AND parent_students.student_id = counselor_meetings.student_id
  ));


-- ==========================================================
-- 4. COUNSELOR FOLLOW-UPS (INTERVENTIONS)
-- ==========================================================
CREATE TABLE public.counselor_follow_ups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  counselor_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  status follow_up_status NOT NULL DEFAULT 'pending',
  due_date DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.counselor_follow_ups ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Counselors can manage follow_ups"
  ON public.counselor_follow_ups FOR ALL
  TO authenticated
  USING (auth.uid() = counselor_id);

CREATE POLICY "Students can view and update their follow_ups"
  ON public.counselor_follow_ups FOR SELECT
  TO authenticated
  USING (auth.uid() = student_id);

-- Explicitly allow students to update status to completed
CREATE POLICY "Students can complete their follow_ups"
  ON public.counselor_follow_ups FOR UPDATE
  TO authenticated
  USING (auth.uid() = student_id)
  WITH CHECK (auth.uid() = student_id);


-- ==========================================================
-- 5. SCHOOL EVENTS
-- ==========================================================
CREATE TABLE public.school_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  event_date TIMESTAMPTZ NOT NULL,
  type event_type NOT NULL DEFAULT 'notice',
  target_audience event_audience NOT NULL DEFAULT 'all',
  created_by UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.school_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Counselors and Admins can manage events"
  ON public.school_events FOR ALL
  TO authenticated
  USING (
    public.has_role(auth.uid(), 'counselor') OR 
    public.has_role(auth.uid(), 'admin')
  );

CREATE POLICY "Users can view relevant events"
  ON public.school_events FOR SELECT
  TO authenticated
  USING (
    target_audience = 'all' OR
    (target_audience = 'students' AND public.has_role(auth.uid(), 'student')) OR
    (target_audience = 'parents' AND public.has_role(auth.uid(), 'parent')) OR
    public.has_role(auth.uid(), 'counselor') OR
    public.has_role(auth.uid(), 'admin')
  );


-- ==========================================================
-- Triggers for updated_at
-- ==========================================================
CREATE TRIGGER update_student_goals_updated_at
  BEFORE UPDATE ON public.student_goals
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_counselor_meetings_updated_at
  BEFORE UPDATE ON public.counselor_meetings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_counselor_follow_ups_updated_at
  BEFORE UPDATE ON public.counselor_follow_ups
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
