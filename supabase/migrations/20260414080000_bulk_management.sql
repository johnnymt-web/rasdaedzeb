-- ==========================================================
-- 1. SCHOOLS INFRASTRUCTURE
-- ==========================================================
CREATE TABLE IF NOT EXISTS public.schools (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Insert Default School
INSERT INTO public.schools (name, is_default)
VALUES ('Default School', true)
ON CONFLICT (name) DO NOTHING;

-- Profile Enhancement
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS email TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS school_id UUID REFERENCES public.schools(id);
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_archived BOOLEAN DEFAULT false;

-- Backfill school_id for existing users
UPDATE public.profiles 
SET school_id = (SELECT id FROM public.schools WHERE is_default = true)
WHERE school_id IS NULL;

-- Indexing for performance
CREATE INDEX IF NOT EXISTS idx_profiles_is_archived ON public.profiles(is_archived);
CREATE INDEX IF NOT EXISTS idx_profiles_school_id ON public.profiles(school_id);

-- ==========================================================
-- 2. ASSIGNMENT TABLES
-- ==========================================================
CREATE TABLE IF NOT EXISTS public.counselor_schools (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  counselor_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(counselor_id, school_id)
);

CREATE TABLE IF NOT EXISTS public.counselor_students (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  counselor_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(counselor_id, student_id)
);

-- ==========================================================
-- 3. PRE-BOARDING ENHANCEMENTS
-- ==========================================================
CREATE TABLE IF NOT EXISTS public.pre_boarding (
  email TEXT PRIMARY KEY,
  assigned_role public.app_role NOT NULL DEFAULT 'student',
  assigned_grade TEXT,
  full_name TEXT,
  target_school_name TEXT,
  assigned_counselor_email TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.pre_boarding_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_email TEXT NOT NULL,
  student_email TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(parent_email, student_email)
);

-- RLS
ALTER TABLE public.schools ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.counselor_schools ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.counselor_students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pre_boarding ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pre_boarding_links ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view schools" ON public.schools FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can manage schools" ON public.schools FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can manage assignments" ON public.counselor_schools FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can manage student assignments" ON public.counselor_students FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can manage pre-boarding" ON public.pre_boarding FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can manage pre-boarding links" ON public.pre_boarding_links FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- ==========================================================
-- 4. THE MASTER AUTOLINKER TRIGGER
-- ==========================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  pre_role public.app_role;
  pre_grade TEXT;
  pre_name TEXT;
  pre_school_name TEXT;
  pre_counselor_email TEXT;
  
  resolved_school_id UUID;
  resolved_counselor_id UUID;
  target_id UUID;
  link_record RECORD;
BEGIN
  -- A. GATHER PRE-BOARDING DATA
  SELECT 
    assigned_role, assigned_grade, full_name, target_school_name, assigned_counselor_email
  INTO 
    pre_role, pre_grade, pre_name, pre_school_name, pre_counselor_email
  FROM public.pre_boarding
  WHERE LOWER(email) = LOWER(NEW.email);

  -- B. RESOLVE SCHOOL
  IF pre_school_name IS NOT NULL THEN
    SELECT id INTO resolved_school_id FROM public.schools WHERE name = pre_school_name;
  END IF;
  
  IF resolved_school_id IS NULL THEN
    SELECT id INTO resolved_school_id FROM public.schools WHERE is_default = true;
  END IF;

  -- C. CREATE PROFILE
  INSERT INTO public.profiles (id, full_name, email, grade, school_id, is_archived)
  VALUES (
    NEW.id, 
    COALESCE(pre_name, NEW.raw_user_meta_data->>'full_name', ''),
    LOWER(NEW.email),
    COALESCE(pre_grade, NEW.raw_user_meta_data->>'grade', ''),
    resolved_school_id,
    false
  );
  
  -- D. ASSIGN ROLE
  INSERT INTO public.user_roles (user_id, role)
  VALUES (
    NEW.id, 
    COALESCE(pre_role, 'student'::public.app_role)
  );

  -- E. RESOLVE COUNSELOR ASSIGNMENT
  IF pre_counselor_email IS NOT NULL THEN
    SELECT id INTO resolved_counselor_id FROM public.profiles WHERE email = pre_counselor_email;
    IF resolved_counselor_id IS NOT NULL THEN
      INSERT INTO public.counselor_students (counselor_id, student_id)
      VALUES (resolved_counselor_id, NEW.id)
      ON CONFLICT DO NOTHING;
    END IF;
  END IF;

  -- F. RESOLVE SHADOW LINKS (Parents)
  FOR link_record IN SELECT student_email FROM public.pre_boarding_links WHERE parent_email = NEW.email LOOP
    SELECT id INTO target_id FROM public.profiles WHERE email = link_record.student_email;
    IF target_id IS NOT NULL THEN
      INSERT INTO public.parent_students (parent_id, student_id) VALUES (NEW.id, target_id) ON CONFLICT DO NOTHING;
    END IF;
  END LOOP;

  FOR link_record IN SELECT parent_email FROM public.pre_boarding_links WHERE student_email = NEW.email LOOP
    SELECT id INTO target_id FROM public.profiles WHERE email = link_record.parent_email;
    IF target_id IS NOT NULL THEN
      INSERT INTO public.parent_students (parent_id, student_id) VALUES (target_id, NEW.id) ON CONFLICT DO NOTHING;
    END IF;
  END LOOP;

  -- G. CLEANUP
  DELETE FROM public.pre_boarding WHERE email = NEW.email;
  
  RETURN NEW;
END;
$$;
