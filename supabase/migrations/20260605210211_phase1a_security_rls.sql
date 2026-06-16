-- =========================================================================
-- A. BASE SCHEMA
-- =========================================================================
CREATE TABLE IF NOT EXISTS public.schools (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS school_id UUID REFERENCES public.schools(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS idx_profiles_school_id ON public.profiles(school_id);

CREATE TABLE IF NOT EXISTS public.counselor_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  counselor_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  assigned_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_unique_active_assignment ON public.counselor_assignments(counselor_id, student_id) WHERE active = true;
CREATE INDEX IF NOT EXISTS idx_ca_school ON public.counselor_assignments(school_id);
CREATE INDEX IF NOT EXISTS idx_ca_counselor ON public.counselor_assignments(counselor_id);
CREATE INDEX IF NOT EXISTS idx_ca_student ON public.counselor_assignments(student_id);
CREATE INDEX IF NOT EXISTS idx_ca_active ON public.counselor_assignments(active);

-- Explicitly enable RLS on all relevant tables
ALTER TABLE public.schools ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.big_five_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.caas_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.counselor_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.parent_students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.counselor_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- =========================================================================
-- B. HELPER FUNCTIONS (Safe, Explicit Actor, Path-Secured)
-- =========================================================================
CREATE OR REPLACE FUNCTION public.is_self(user_uid UUID) RETURNS BOOLEAN
LANGUAGE sql STABLE SET search_path = public AS $$ SELECT auth.uid() = user_uid $$;

CREATE OR REPLACE FUNCTION public.is_parent_of_student(target_student_id UUID)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.parent_students WHERE parent_id = auth.uid() AND student_id = target_student_id
  )
$$;

CREATE OR REPLACE FUNCTION public.is_assigned_counselor(target_student_id UUID)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.counselor_assignments
    WHERE counselor_id = auth.uid() AND student_id = target_student_id AND active = true
  )
$$;

CREATE OR REPLACE FUNCTION public.is_school_admin_for_user(target_user_id UUID)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles r
    JOIN public.profiles admin_p ON admin_p.id = r.user_id
    JOIN public.profiles target_p ON target_p.id = target_user_id
    WHERE r.user_id = auth.uid() AND r.role = 'admin' 
    AND admin_p.school_id IS NOT NULL 
    AND admin_p.school_id = target_p.school_id
  )
$$;

CREATE OR REPLACE FUNCTION public.can_access_student_record(target_student_id UUID)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT public.is_self(target_student_id) OR public.is_parent_of_student(target_student_id) OR public.is_assigned_counselor(target_student_id)
$$;

CREATE OR REPLACE FUNCTION public.can_access_student_assessment(target_student_id UUID)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT public.is_self(target_student_id) OR public.is_parent_of_student(target_student_id) OR public.is_assigned_counselor(target_student_id)
$$;

-- =========================================================================
-- C. TRIGGERS (Validation & Protections)
-- =========================================================================
-- 1. Validate Assignments safely using IS DISTINCT FROM
CREATE OR REPLACE FUNCTION public.validate_counselor_assignment()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_counselor_school UUID;
  v_student_school UUID;
BEGIN
  IF NEW.school_id IS NULL THEN RAISE EXCEPTION 'Assignment school_id cannot be null'; END IF;

  IF NOT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = NEW.counselor_id AND role = 'counselor') THEN
    RAISE EXCEPTION 'counselor_id must have counselor role';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = NEW.student_id AND role = 'student') THEN
    RAISE EXCEPTION 'student_id must have student role';
  END IF;

  SELECT school_id INTO v_counselor_school FROM public.profiles WHERE id = NEW.counselor_id;
  SELECT school_id INTO v_student_school FROM public.profiles WHERE id = NEW.student_id;
  
  IF v_counselor_school IS NULL OR v_student_school IS NULL THEN RAISE EXCEPTION 'Users must have a valid school_id'; END IF;
  IF v_counselor_school IS DISTINCT FROM NEW.school_id OR v_student_school IS DISTINCT FROM NEW.school_id THEN
    RAISE EXCEPTION 'Counselor and student must belong to the assignment school_id';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS tr_validate_counselor_assignment ON public.counselor_assignments;
CREATE TRIGGER tr_validate_counselor_assignment BEFORE INSERT OR UPDATE ON public.counselor_assignments
FOR EACH ROW EXECUTE FUNCTION public.validate_counselor_assignment();

-- 2. Protect profiles.school_id from self-update
CREATE OR REPLACE FUNCTION public.protect_school_id_update()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.school_id IS DISTINCT FROM OLD.school_id THEN
    -- Only allow if actor is a school admin for the OLD school, or bypass if service_role.
    IF NULLIF(current_setting('request.jwt.claims', true), '')::jsonb->>'role' = 'authenticated' THEN
       IF NOT public.is_school_admin_for_user(OLD.id) THEN
         RAISE EXCEPTION 'Not authorized to change school_id directly. Contact an administrator.';
       END IF;
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS tr_protect_school_id ON public.profiles;
CREATE TRIGGER tr_protect_school_id BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.protect_school_id_update();

-- =========================================================================
-- D. EXACT DROPS OF OLD POLICIES
-- =========================================================================
DROP POLICY IF EXISTS "Counselors can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Counselors can view all assessments" ON public.assessments;
DROP POLICY IF EXISTS "Counselors can read student Big Five results" ON public.big_five_assessments;
DROP POLICY IF EXISTS "Counselors can read student CAAS results" ON public.caas_assessments;
DROP POLICY IF EXISTS "Counselors can view all goals" ON public.student_goals;
DROP POLICY IF EXISTS "Admins can view all roles" ON public.user_roles;
DROP POLICY IF EXISTS "Counselors can view all roles" ON public.user_roles;

-- Drop idempotent new policies to ensure clean run
DROP POLICY IF EXISTS "Users view own school" ON public.schools;
DROP POLICY IF EXISTS "Scoped select profiles" ON public.profiles;
DROP POLICY IF EXISTS "Update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Scoped select assessments" ON public.assessments;
DROP POLICY IF EXISTS "Insert own assessments" ON public.assessments;
DROP POLICY IF EXISTS "Update own assessments" ON public.assessments;
DROP POLICY IF EXISTS "Delete own assessments" ON public.assessments;
DROP POLICY IF EXISTS "Scoped select big_five" ON public.big_five_assessments;
DROP POLICY IF EXISTS "Insert own big_five" ON public.big_five_assessments;
DROP POLICY IF EXISTS "Update own big_five" ON public.big_five_assessments;
DROP POLICY IF EXISTS "Delete own big_five" ON public.big_five_assessments;
DROP POLICY IF EXISTS "Scoped select caas" ON public.caas_assessments;
DROP POLICY IF EXISTS "Insert own caas" ON public.caas_assessments;
DROP POLICY IF EXISTS "Update own caas" ON public.caas_assessments;
DROP POLICY IF EXISTS "Delete own caas" ON public.caas_assessments;
DROP POLICY IF EXISTS "Scoped select goals" ON public.student_goals;
DROP POLICY IF EXISTS "Insert own goals" ON public.student_goals;
DROP POLICY IF EXISTS "Update own goals" ON public.student_goals;
DROP POLICY IF EXISTS "Delete own goals" ON public.student_goals;
DROP POLICY IF EXISTS "Scoped select parent_students" ON public.parent_students;
DROP POLICY IF EXISTS "Scoped select assignments" ON public.counselor_assignments;
DROP POLICY IF EXISTS "Admin insert assignments" ON public.counselor_assignments;
DROP POLICY IF EXISTS "Admin update assignments" ON public.counselor_assignments;
DROP POLICY IF EXISTS "Admin update roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admin insert roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admin delete roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admin view roles" ON public.user_roles;


-- =========================================================================
-- E. NEW CRUD POLICIES WITH STRICT WITH CHECK CLAUSES
-- =========================================================================
-- Schools
CREATE POLICY "Users view own school" ON public.schools FOR SELECT USING (id = (SELECT school_id FROM public.profiles WHERE id = auth.uid()));

-- Profiles
CREATE POLICY "Scoped select profiles" ON public.profiles FOR SELECT USING (public.can_access_student_record(id) OR public.is_school_admin_for_user(id));
CREATE POLICY "Update own profile" ON public.profiles FOR UPDATE USING (public.is_self(id)) WITH CHECK (public.is_self(id));
CREATE POLICY "Insert own profile" ON public.profiles FOR INSERT WITH CHECK (public.is_self(id));

-- Assessments / Big Five / CAAS / Goals
CREATE POLICY "Scoped select assessments" ON public.assessments FOR SELECT USING (public.can_access_student_assessment(user_id));
CREATE POLICY "Insert own assessments" ON public.assessments FOR INSERT WITH CHECK (public.is_self(user_id));
CREATE POLICY "Update own assessments" ON public.assessments FOR UPDATE USING (public.is_self(user_id)) WITH CHECK (public.is_self(user_id));
CREATE POLICY "Delete own assessments" ON public.assessments FOR DELETE USING (public.is_self(user_id));

CREATE POLICY "Scoped select big_five" ON public.big_five_assessments FOR SELECT USING (public.can_access_student_assessment(student_id));
CREATE POLICY "Insert own big_five" ON public.big_five_assessments FOR INSERT WITH CHECK (public.is_self(student_id));
CREATE POLICY "Update own big_five" ON public.big_five_assessments FOR UPDATE USING (public.is_self(student_id)) WITH CHECK (public.is_self(student_id));
CREATE POLICY "Delete own big_five" ON public.big_five_assessments FOR DELETE USING (public.is_self(student_id));

CREATE POLICY "Scoped select caas" ON public.caas_assessments FOR SELECT USING (public.can_access_student_assessment(student_id));
CREATE POLICY "Insert own caas" ON public.caas_assessments FOR INSERT WITH CHECK (public.is_self(student_id));
CREATE POLICY "Update own caas" ON public.caas_assessments FOR UPDATE USING (public.is_self(student_id)) WITH CHECK (public.is_self(student_id));
CREATE POLICY "Delete own caas" ON public.caas_assessments FOR DELETE USING (public.is_self(student_id));

CREATE POLICY "Scoped select goals" ON public.student_goals FOR SELECT USING (public.can_access_student_record(user_id));
CREATE POLICY "Insert own goals" ON public.student_goals FOR INSERT WITH CHECK (public.is_self(user_id));
CREATE POLICY "Update own goals" ON public.student_goals FOR UPDATE USING (public.is_self(user_id)) WITH CHECK (public.is_self(user_id));
CREATE POLICY "Delete own goals" ON public.student_goals FOR DELETE USING (public.is_self(user_id));

-- Parent Students (Read-only for clients)
CREATE POLICY "Scoped select parent_students" ON public.parent_students FOR SELECT USING (public.is_self(parent_id) OR public.is_assigned_counselor(student_id));

-- Counselor Assignments (No Delete)
CREATE POLICY "Scoped select assignments" ON public.counselor_assignments FOR SELECT USING (public.is_self(counselor_id) OR public.is_self(student_id) OR public.is_school_admin_for_user(student_id));
CREATE POLICY "Admin insert assignments" ON public.counselor_assignments FOR INSERT WITH CHECK (public.is_school_admin_for_user(student_id));
CREATE POLICY "Admin update assignments" ON public.counselor_assignments FOR UPDATE USING (public.is_school_admin_for_user(student_id)) WITH CHECK (public.is_school_admin_for_user(student_id));

-- User Roles (Strict Admin Only)
CREATE POLICY "Admin view roles" ON public.user_roles FOR SELECT USING (public.is_school_admin_for_user(user_id));
CREATE POLICY "Admin update roles" ON public.user_roles FOR UPDATE USING (public.is_school_admin_for_user(user_id)) WITH CHECK (public.is_school_admin_for_user(user_id));
-- Note: Global platform roles must be inserted via service_role

