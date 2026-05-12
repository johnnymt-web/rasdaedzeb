-- ==========================================================
-- 1. MULTI-ASSESSMENT FRAMEWORK
-- ==========================================================
-- Add assessment_type column to assessments table
ALTER TABLE public.assessments ADD COLUMN IF NOT EXISTS assessment_type TEXT DEFAULT 'riasec';

-- ==========================================================
-- 2. OPPORTUNITIES HUB
-- ==========================================================
DO $$ BEGIN
    CREATE TYPE opportunity_type AS ENUM ('internship', 'shadowing', 'career_fair', 'mentorship');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

CREATE TABLE public.opportunities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  company_name TEXT NOT NULL,
  type opportunity_type NOT NULL,
  description TEXT,
  application_url TEXT,
  deadline DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.opportunities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage opportunities"
  ON public.opportunities FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Students and Counselors can view opportunities"
  ON public.opportunities FOR SELECT
  TO authenticated
  USING (
    public.has_role(auth.uid(), 'student') OR 
    public.has_role(auth.uid(), 'counselor') OR
    public.has_role(auth.uid(), 'admin')
  );

-- ==========================================================
-- 3. EMPLOYABILITY SKILLS
-- ==========================================================
DO $$ BEGIN
    CREATE TYPE skill_category AS ENUM ('resume', 'interview', 'networking', 'financial_lit');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE skill_status AS ENUM ('not_started', 'in_progress', 'verified');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

CREATE TABLE public.employability_skills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  skill_category skill_category NOT NULL,
  status skill_status NOT NULL DEFAULT 'not_started',
  last_updated TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (student_id, skill_category)
);

ALTER TABLE public.employability_skills ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Students can manage own skills"
  ON public.employability_skills FOR ALL
  TO authenticated
  USING (auth.uid() = student_id);

CREATE POLICY "Counselors can view and verify skills"
  ON public.employability_skills FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'counselor'));

-- ==========================================================
-- 4. KNOWLEDGE RESOURCES
-- ==========================================================
DO $$ BEGIN
    CREATE TYPE target_role_enum AS ENUM ('student', 'parent', 'counselor', 'all');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

CREATE TABLE public.knowledge_resources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  category TEXT NOT NULL,
  target_role target_role_enum NOT NULL DEFAULT 'all',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.knowledge_resources ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage knowledge resources"
  ON public.knowledge_resources FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can view allowed resources"
  ON public.knowledge_resources FOR SELECT
  TO authenticated
  USING (
    target_role = 'all' OR
    (target_role = 'student' AND public.has_role(auth.uid(), 'student')) OR
    (target_role = 'parent' AND public.has_role(auth.uid(), 'parent')) OR
    (target_role = 'counselor' AND public.has_role(auth.uid(), 'counselor')) OR
    public.has_role(auth.uid(), 'admin')
  );

-- ==========================================================
-- Triggers for last_updated
-- ==========================================================

CREATE TRIGGER update_employability_skills_last_updated
  BEFORE UPDATE ON public.employability_skills
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
