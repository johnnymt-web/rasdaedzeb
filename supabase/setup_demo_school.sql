DO $$
DECLARE
    v_demo_school_id UUID := '11111111-1111-1111-1111-111111111111';
    v_counselor_1 UUID;
    v_counselor_2 UUID;
    v_student_1 UUID;
    v_student_2 UUID;
    v_student_3 UUID;
    v_student_4 UUID;
    v_parent UUID;
    v_admin UUID;
BEGIN
    -- 1. Create Demo School
    INSERT INTO public.schools (id, name) VALUES (v_demo_school_id, 'Demo High School') ON CONFLICT (id) DO NOTHING;

    -- 2. Identify Test Users (using existing roles)
    SELECT user_id INTO v_counselor_1 FROM public.user_roles WHERE role = 'counselor' LIMIT 1;
    SELECT user_id INTO v_counselor_2 FROM public.user_roles WHERE role = 'counselor' AND user_id != v_counselor_1 LIMIT 1;
    
    SELECT user_id INTO v_student_1 FROM public.user_roles WHERE role = 'student' LIMIT 1;
    SELECT user_id INTO v_student_2 FROM public.user_roles WHERE role = 'student' AND user_id != v_student_1 LIMIT 1;
    SELECT user_id INTO v_student_3 FROM public.user_roles WHERE role = 'student' AND user_id NOT IN (v_student_1, v_student_2) LIMIT 1;
    SELECT user_id INTO v_student_4 FROM public.user_roles WHERE role = 'student' AND user_id NOT IN (v_student_1, v_student_2, v_student_3) LIMIT 1;
    
    SELECT user_id INTO v_admin FROM public.user_roles WHERE role = 'admin' LIMIT 1;

    -- 3. Update profiles to assign them to Demo School
    UPDATE public.profiles SET school_id = v_demo_school_id 
    WHERE id IN (v_counselor_1, v_counselor_2, v_student_1, v_student_2, v_student_3, v_student_4, v_admin);

    -- 4. Create explicit assignment for counselor_1 -> student_1
    IF v_counselor_1 IS NOT NULL AND v_student_1 IS NOT NULL THEN
        INSERT INTO public.counselor_assignments (school_id, counselor_id, student_id, active)
        VALUES (v_demo_school_id, v_counselor_1, v_student_1, true)
        ON CONFLICT DO NOTHING;
    END IF;

END $$;
