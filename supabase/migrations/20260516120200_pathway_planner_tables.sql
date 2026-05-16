-- ============================================================
-- Phase 9: Pathway Planner Tables
-- ============================================================

-- 1. Student Career Pathways
-- Maps the progression from education to career
CREATE TABLE IF NOT EXISTS public.student_career_pathways (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL, -- e.g., "Software Engineering Pathway"
  career_id TEXT, -- Optional reference to O*NET Soc Code
  higher_ed_goal TEXT, -- e.g., "BSc in Computer Science"
  subjects JSONB DEFAULT '[]', -- Array of subject names that support this pathway
  skills_to_develop TEXT[], -- Array of specific skills
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'archived', 'completed')),
  is_primary BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Enable RLS
ALTER TABLE public.student_career_pathways ENABLE ROW LEVEL SECURITY;

-- 3. RLS Policies
CREATE POLICY "Students can manage own pathways"
  ON public.student_career_pathways
  FOR ALL
  USING (auth.uid() = student_id);

CREATE POLICY "Counselors and Admins can view pathways"
  ON public.student_career_pathways
  FOR SELECT
  USING (
    public.has_role(auth.uid(), 'counselor') OR 
    public.has_role(auth.uid(), 'admin')
  );

-- 4. Unique primary pathway per student (functional constraint)
-- Note: We'll handle the "only one primary" logic in the application layer 
-- or via a trigger if needed, but a partial index can enforce it.
CREATE UNIQUE INDEX idx_one_primary_pathway ON public.student_career_pathways (student_id) WHERE (is_primary = true);
