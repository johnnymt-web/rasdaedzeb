-- =========================================================================
-- ⛔ DO NOT APPLY YET — S1 secure role provisioning (auth-critical)
-- =========================================================================
-- Prerequisites before applying:
--   1. Run the signup test (does role=admin self-signup currently fail or succeed?).
--   2. Apply & test on a Supabase BRANCH / staging DB first, not production.
--   3. Confirm a real signup still: assigns student by default, links parent/
--      counselor from pre_boarding, and that admin BulkTools onboarding still
--      produces counselor/admin accounts.
--
-- What this fixes:
--   • S1: active handle_new_user assigns admin/counselor from USER METADATA
--     (self-signup escalation surface). This restores the secure design:
--     role comes ONLY from the admin-managed pre_boarding table; metadata role
--     is ignored; self-signup defaults to 'student'.
--   • I1: restores school resolution + parent/counselor auto-linking that the
--     current stripped-down trigger dropped.
--   • Adjusts enforce_role_assignment so a privileged role provisioned via
--     pre_boarding (admin-managed) is trusted even when auth.uid() is NULL
--     (i.e. during admin.createUser), while self-signup still cannot escalate.
-- =========================================================================

-- 1) Secure autolinker: role from pre_boarding ONLY, never from metadata.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  pre_role            public.app_role;
  pre_grade           TEXT;
  pre_name            TEXT;
  pre_school_name     TEXT;
  pre_counselor_email TEXT;
  resolved_school_id  UUID;
  resolved_counselor_id UUID;
  target_id           UUID;
  link_record         RECORD;
BEGIN
  SELECT assigned_role, assigned_grade, full_name, target_school_name, assigned_counselor_email
    INTO pre_role, pre_grade, pre_name, pre_school_name, pre_counselor_email
  FROM public.pre_boarding WHERE LOWER(email) = LOWER(NEW.email);

  IF pre_school_name IS NOT NULL THEN
    SELECT id INTO resolved_school_id FROM public.schools WHERE name = pre_school_name;
  END IF;
  IF resolved_school_id IS NULL THEN
    SELECT id INTO resolved_school_id FROM public.schools WHERE is_default = true;
  END IF;

  INSERT INTO public.profiles (id, full_name, email, grade, school_id, is_archived)
  VALUES (
    NEW.id,
    COALESCE(pre_name, NEW.raw_user_meta_data->>'full_name', ''),
    LOWER(NEW.email),
    COALESCE(pre_grade, NEW.raw_user_meta_data->>'grade', ''),
    resolved_school_id,
    false
  );

  -- SECURITY: role comes ONLY from pre_boarding. Metadata role is ignored.
  -- Self-signup (no pre_boarding row) → 'student'.
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, COALESCE(pre_role, 'student'::public.app_role));

  IF pre_counselor_email IS NOT NULL THEN
    SELECT id INTO resolved_counselor_id FROM public.profiles WHERE email = pre_counselor_email;
    IF resolved_counselor_id IS NOT NULL THEN
      INSERT INTO public.counselor_students (counselor_id, student_id)
      VALUES (resolved_counselor_id, NEW.id) ON CONFLICT DO NOTHING;
    END IF;
  END IF;

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

  DELETE FROM public.pre_boarding WHERE LOWER(email) = LOWER(NEW.email);
  RETURN NEW;
END;
$$;

-- 2) Trust pre_boarding-provisioned privileged roles (admin-managed source),
--    while still blocking self-assignment by non-admins.
CREATE OR REPLACE FUNCTION public.enforce_role_assignment()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.role IN ('admin', 'counselor') THEN
    IF public.has_role(auth.uid(), 'admin'::public.app_role) THEN
      RETURN NEW;
    END IF;
    IF EXISTS (
      SELECT 1 FROM public.pre_boarding pb
      JOIN public.profiles p ON LOWER(p.email) = LOWER(pb.email)
      WHERE p.id = NEW.user_id AND pb.assigned_role = NEW.role
    ) THEN
      RETURN NEW;
    END IF;
    RAISE EXCEPTION 'Only administrators (or admin pre-boarding) can assign admin/counselor roles';
  END IF;
  RETURN NEW;
END;
$$;

-- Note: keep AuthPage.tsx signup from sending privileged role in metadata is
-- harmless now (metadata role is ignored), but should be cleaned up separately.
