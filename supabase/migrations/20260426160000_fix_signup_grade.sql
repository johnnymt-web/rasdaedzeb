-- ==========================================================
-- FIX: Update handle_new_user() to copy grade and email
-- from signup metadata into the profiles table.
-- Previously only full_name was copied, meaning students
-- who selected a grade during signup would not have it
-- reflected in their profile.
-- ==========================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    requested_role TEXT;
    safe_role app_role;
BEGIN
    -- Extract requested role from signup metadata
    requested_role := LOWER(TRIM(COALESCE(NEW.raw_user_meta_data->>'role', 'student')));
    
    -- Allow all roles from metadata as requested by the user
    IF requested_role IN ('student', 'parent', 'counselor', 'admin') THEN
        safe_role := requested_role::app_role;
    ELSE
        -- Default to student for any unrecognized role
        safe_role := 'student'::app_role;
    END IF;

    INSERT INTO public.profiles (id, full_name, email, grade)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
        COALESCE(NEW.email, ''),
        NULLIF(TRIM(COALESCE(NEW.raw_user_meta_data->>'grade', '')), '')
    );

    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, safe_role);

    RETURN NEW;
END;
$$;
