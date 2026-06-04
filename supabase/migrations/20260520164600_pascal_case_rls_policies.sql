-- Enable RLS for PascalCase tables only if they exist
DO $$ BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'ContentLibrary') THEN
    ALTER TABLE public."ContentLibrary" ENABLE ROW LEVEL SECURITY;
  END IF;
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'CounselorCaseload') THEN
    ALTER TABLE public."CounselorCaseload" ENABLE ROW LEVEL SECURITY;
  END IF;
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'FeatureFlag') THEN
    ALTER TABLE public."FeatureFlag" ENABLE ROW LEVEL SECURITY;
  END IF;
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'GradeGroup') THEN
    ALTER TABLE public."GradeGroup" ENABLE ROW LEVEL SECURITY;
  END IF;
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'Intervention') THEN
    ALTER TABLE public."Intervention" ENABLE ROW LEVEL SECURITY;
  END IF;
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'InterventionFlag') THEN
    ALTER TABLE public."InterventionFlag" ENABLE ROW LEVEL SECURITY;
  END IF;
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'ParentAccess') THEN
    ALTER TABLE public."ParentAccess" ENABLE ROW LEVEL SECURITY;
  END IF;
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'Reflection') THEN
    ALTER TABLE public."Reflection" ENABLE ROW LEVEL SECURITY;
  END IF;
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'Report') THEN
    ALTER TABLE public."Report" ENABLE ROW LEVEL SECURITY;
  END IF;
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'School') THEN
    ALTER TABLE public."School" ENABLE ROW LEVEL SECURITY;
  END IF;
END $$;


-- 1. ContentLibrary
DO $$ BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'ContentLibrary') THEN
    CREATE POLICY "Users can read own school content library" ON public."ContentLibrary"
    FOR SELECT USING (school_id = public.get_jwt_school_id());

    CREATE POLICY "Admins can manage school content library" ON public."ContentLibrary"
    FOR ALL USING (
      school_id = public.get_jwt_school_id() AND
      lower(public.get_jwt_role()::text) IN ('admin', 'school_admin')
    );
  END IF;
END $$;


-- 2. CounselorCaseload
DO $$ BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'CounselorCaseload') THEN
    CREATE POLICY "Staff can access school counselor caseloads" ON public."CounselorCaseload"
    FOR ALL USING (
      school_id = public.get_jwt_school_id() AND
      lower(public.get_jwt_role()::text) IN ('admin', 'school_admin', 'counselor', 'teacher')
    );
  END IF;
END $$;


-- 3. FeatureFlag
DO $$ BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'FeatureFlag') THEN
    CREATE POLICY "Users can read own school feature flags" ON public."FeatureFlag"
    FOR SELECT USING (school_id = public.get_jwt_school_id());

    CREATE POLICY "Admins can manage school feature flags" ON public."FeatureFlag"
    FOR ALL USING (
      school_id = public.get_jwt_school_id() AND
      lower(public.get_jwt_role()::text) IN ('admin', 'school_admin')
    );
  END IF;
END $$;


-- 4. GradeGroup
DO $$ BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'GradeGroup') THEN
    CREATE POLICY "Users can read own school grade groups" ON public."GradeGroup"
    FOR SELECT USING (school_id = public.get_jwt_school_id());

    CREATE POLICY "Admins can manage school grade groups" ON public."GradeGroup"
    FOR ALL USING (
      school_id = public.get_jwt_school_id() AND
      lower(public.get_jwt_role()::text) IN ('admin', 'school_admin')
    );
  END IF;
END $$;


-- 5. Intervention
DO $$ BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'Intervention') THEN
    CREATE POLICY "Staff can access school interventions" ON public."Intervention"
    FOR ALL USING (
      school_id = public.get_jwt_school_id() AND
      lower(public.get_jwt_role()::text) IN ('admin', 'school_admin', 'counselor', 'teacher')
    );
  END IF;
END $$;


-- 6. InterventionFlag
DO $$ BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'InterventionFlag') THEN
    CREATE POLICY "Staff can access school intervention flags" ON public."InterventionFlag"
    FOR ALL USING (
      school_id = public.get_jwt_school_id() AND
      lower(public.get_jwt_role()::text) IN ('admin', 'school_admin', 'counselor', 'teacher')
    );
  END IF;
END $$;


-- 7. ParentAccess
DO $$ BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'ParentAccess') THEN
    CREATE POLICY "Parents can view their own linked access" ON public."ParentAccess"
    FOR SELECT USING (parent_id = auth.uid()::text);

    CREATE POLICY "Staff can manage school parent access" ON public."ParentAccess"
    FOR ALL USING (
      school_id = public.get_jwt_school_id() AND
      lower(public.get_jwt_role()::text) IN ('admin', 'school_admin', 'counselor', 'teacher')
    );
  END IF;
END $$;


-- 8. Reflection
DO $$ BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'Reflection') THEN
    CREATE POLICY "Students can manage their own reflections" ON public."Reflection"
    FOR ALL USING (student_id = auth.uid()::text);

    CREATE POLICY "Staff can read school reflections" ON public."Reflection"
    FOR SELECT USING (
      school_id = public.get_jwt_school_id() AND
      lower(public.get_jwt_role()::text) IN ('admin', 'school_admin', 'counselor', 'teacher')
    );
  END IF;
END $$;


-- 9. Report
DO $$ BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'Report') THEN
    CREATE POLICY "Students can manage their own reports" ON public."Report"
    FOR ALL USING (student_id = auth.uid()::text);

    CREATE POLICY "Staff can read school reports" ON public."Report"
    FOR SELECT USING (
      school_id = public.get_jwt_school_id() AND
      lower(public.get_jwt_role()::text) IN ('admin', 'school_admin', 'counselor', 'teacher')
    );
  END IF;
END $$;


-- 10. School
DO $$ BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'School') THEN
    CREATE POLICY "Users can read their own school" ON public."School"
    FOR SELECT USING (id = public.get_jwt_school_id());

    CREATE POLICY "Admins can manage their school" ON public."School"
    FOR ALL USING (
      id = public.get_jwt_school_id() AND
      lower(public.get_jwt_role()::text) IN ('admin', 'school_admin')
    );
  END IF;
END $$;
