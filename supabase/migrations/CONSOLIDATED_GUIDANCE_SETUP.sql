-- ============================================================
-- Consolidated Guidance Suite Migration
-- Ensures all tables for Phases 7-10 exist and have correct RLS
-- ============================================================

-- 1. Tables for Career Exposure & Action Plans (Phase 7)
CREATE TABLE IF NOT EXISTS public.career_exposure_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  activity_type TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  activity_date DATE,
  reflection TEXT,
  evidence_url TEXT,
  counselor_comment TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.student_action_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  due_date DATE,
  assigned_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Table for Subject Planning (Phase 8)
CREATE TABLE IF NOT EXISTS public.student_subject_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  academic_year TEXT NOT NULL,
  subjects JSONB DEFAULT '[]',
  rationale TEXT,
  counselor_feedback TEXT,
  status TEXT DEFAULT 'draft',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(student_id, academic_year)
);

-- 3. Table for Career Pathways (Phase 9)
CREATE TABLE IF NOT EXISTS public.student_career_pathways (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  higher_ed_goal TEXT,
  subjects JSONB DEFAULT '[]',
  is_primary BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Mapping Table for Parents (Phase 10)
CREATE TABLE IF NOT EXISTS public.parent_students (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(parent_id, student_id)
);

-- 5. Enable Row Level Security (RLS)
ALTER TABLE public.career_exposure_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_action_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_subject_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_career_pathways ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.parent_students ENABLE ROW LEVEL SECURITY;

-- 6. Apply Consolidated Security Policies
DO $$ 
BEGIN
    -- Drop existing policies to avoid duplicates
    DROP POLICY IF EXISTS "Students can manage own activities" ON public.career_exposure_activities;
    DROP POLICY IF EXISTS "Counselors can view all activities" ON public.career_exposure_activities;
    DROP POLICY IF EXISTS "Counselors can comment on activities" ON public.career_exposure_activities;
    DROP POLICY IF EXISTS "Parents can view linked student activities" ON public.career_exposure_activities;
    
    DROP POLICY IF EXISTS "Students manage own plans" ON public.student_action_plans;
    DROP POLICY IF EXISTS "Counselors manage plans" ON public.student_action_plans;
    DROP POLICY IF EXISTS "Parents can view linked student action plans" ON public.student_action_plans;
    
    DROP POLICY IF EXISTS "Students manage own subjects" ON public.student_subject_plans;
    DROP POLICY IF EXISTS "Counselors manage subjects" ON public.student_subject_plans;
    DROP POLICY IF EXISTS "Parents can view linked student subject plans" ON public.student_subject_plans;
    
    DROP POLICY IF EXISTS "Students manage own pathways" ON public.student_career_pathways;
    DROP POLICY IF EXISTS "Counselors view pathways" ON public.student_career_pathways;
    DROP POLICY IF EXISTS "Parents can view linked student pathways" ON public.student_career_pathways;
END $$;

-- 7. Create New Unified Policies
-- (Using Direct SQL for speed and to avoid looping error)

-- Activities
CREATE POLICY "Act_S" ON public.career_exposure_activities FOR ALL USING (auth.uid() = student_id);
CREATE POLICY "Act_C" ON public.career_exposure_activities FOR SELECT USING (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role::text IN ('counselor', 'admin')));
CREATE POLICY "Act_P" ON public.career_exposure_activities FOR SELECT USING (EXISTS (SELECT 1 FROM public.parent_students WHERE parent_id = auth.uid() AND student_id = career_exposure_activities.student_id));

-- Plans
CREATE POLICY "Pln_S" ON public.student_action_plans FOR ALL USING (auth.uid() = student_id);
CREATE POLICY "Pln_C" ON public.student_action_plans FOR ALL USING (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role::text IN ('counselor', 'admin')));
CREATE POLICY "Pln_P" ON public.student_action_plans FOR SELECT USING (EXISTS (SELECT 1 FROM public.parent_students WHERE parent_id = auth.uid() AND student_id = student_action_plans.student_id));

-- Subjects
CREATE POLICY "Sub_S" ON public.student_subject_plans FOR ALL USING (auth.uid() = student_id);
CREATE POLICY "Sub_C" ON public.student_subject_plans FOR ALL USING (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role::text IN ('counselor', 'admin')));
CREATE POLICY "Sub_P" ON public.student_subject_plans FOR SELECT USING (EXISTS (SELECT 1 FROM public.parent_students WHERE parent_id = auth.uid() AND student_id = student_subject_plans.student_id));

-- Pathways
CREATE POLICY "Pat_S" ON public.student_career_pathways FOR ALL USING (auth.uid() = student_id);
CREATE POLICY "Pat_C" ON public.student_career_pathways FOR SELECT USING (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role::text IN ('counselor', 'admin')));
CREATE POLICY "Pat_P" ON public.student_career_pathways FOR SELECT USING (EXISTS (SELECT 1 FROM public.parent_students WHERE parent_id = auth.uid() AND student_id = student_career_pathways.student_id));
