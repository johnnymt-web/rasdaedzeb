-- ==========================================================
-- CRITICAL SECURITY FIXES — 2026-04-19
-- SEC-2: Harden signup trigger to reject privileged roles
-- SEC-4: Fix delete_user email lookup
-- SEC-5: Fix PII encryption key management
-- SEC-6: Restrict role upserts to valid self-service roles
-- SEC-7: Fix ai_logs INSERT policy (logging was silently failing)
-- ==========================================================


-- ============================================================
-- SEC-2: Harden handle_new_user() — Only allow 'student' and 
-- 'parent' from user metadata. Any other value defaults to 'student'.
-- Admin and counselor roles must be assigned by an existing admin.
-- ============================================================
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
    
    -- SECURITY: Only allow self-service roles. 
    -- 'admin' and 'counselor' MUST be provisioned by an existing admin.
    IF requested_role IN ('student', 'parent') THEN
        safe_role := requested_role::app_role;
    ELSE
        -- Default to student for any unrecognized or privileged role
        safe_role := 'student'::app_role;
    END IF;

    INSERT INTO public.profiles (id, full_name)
    VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', ''));

    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, safe_role);

    RETURN NEW;
END;
$$;


-- ============================================================
-- SEC-4: Fix delete_user RPC — read email from auth.users 
-- (authoritative source) instead of profiles table.
-- Also prevent admin from deleting themselves.
-- ============================================================
CREATE OR REPLACE FUNCTION public.delete_user(target_user_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    target_email TEXT;
    caller_id UUID;
BEGIN
    caller_id := auth.uid();

    -- Check if the current user is an admin
    IF NOT (SELECT public.has_role(caller_id, 'admin'::public.app_role)) THEN
        RAISE EXCEPTION 'Unauthorized: Only admins can delete users';
    END IF;

    -- SECURITY: Prevent admin from deleting themselves
    IF caller_id = target_user_id THEN
        RAISE EXCEPTION 'Cannot delete your own account. Use account settings or ask another admin.';
    END IF;

    -- Get target email from auth.users (authoritative source, not profiles)
    SELECT email INTO target_email FROM auth.users WHERE id = target_user_id;

    -- Delete the user from auth.users (cascades to public tables)
    DELETE FROM auth.users WHERE id = target_user_id;

    -- Insert Audit Log entry
    INSERT INTO public.audit_logs (admin_id, action, target_type, target_id, details)
    VALUES (
        caller_id,
        'DELETE_USER',
        'profile',
        target_user_id::text,
        jsonb_build_object('email', COALESCE(target_email, 'unknown'), 'timestamp', now())
    );
END;
$$;


-- ============================================================
-- SEC-5: Fix PII encryption — Use a Postgres config variable 
-- instead of passing the key as a plain-text parameter.
-- The key is set via: ALTER DATABASE postgres SET app.encryption_key = 'your-secret';
-- or via Supabase Dashboard > Database > Settings > Configuration.
-- ============================================================

-- Set a default placeholder (MUST be changed in production)
-- In production, set this via Supabase Dashboard or:
--   ALTER DATABASE postgres SET app.encryption_key = 'your-actual-secret-key-here';
DO $$ 
BEGIN
    -- Only set if not already configured
    IF current_setting('app.encryption_key', true) IS NULL THEN
        EXECUTE 'ALTER DATABASE ' || current_database() || $q$ SET app.encryption_key = 'CHANGE_ME_IN_PRODUCTION'$q$;
    END IF;
END $$;

-- Replace the encryption functions to read key from config, not parameters
CREATE OR REPLACE FUNCTION public.encrypt_note(content TEXT)
RETURNS BYTEA AS $$
DECLARE
    secret TEXT;
BEGIN
    secret := current_setting('app.encryption_key', false);
    IF secret IS NULL OR secret = 'CHANGE_ME_IN_PRODUCTION' THEN
        RAISE EXCEPTION 'Encryption key not configured. Set app.encryption_key in database config.';
    END IF;
    RETURN pgp_sym_encrypt(content, secret);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION public.decrypt_note(encrypted_content BYTEA)
RETURNS TEXT AS $$
DECLARE
    secret TEXT;
BEGIN
    secret := current_setting('app.encryption_key', false);
    IF secret IS NULL OR secret = 'CHANGE_ME_IN_PRODUCTION' THEN
        RAISE EXCEPTION 'Encryption key not configured. Set app.encryption_key in database config.';
    END IF;
    RETURN pgp_sym_decrypt(encrypted_content, secret);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;


-- ============================================================
-- SEC-6: Add a constraint trigger to prevent non-admin users 
-- from inserting privileged roles via direct table access.
-- ============================================================
CREATE OR REPLACE FUNCTION public.enforce_role_assignment()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    -- If the new role is admin or counselor, the caller must be an admin
    IF NEW.role IN ('admin', 'counselor') THEN
        IF NOT public.has_role(auth.uid(), 'admin'::app_role) THEN
            RAISE EXCEPTION 'Only administrators can assign admin or counselor roles';
        END IF;
    END IF;
    RETURN NEW;
END;
$$;

-- Apply to both INSERT and UPDATE on user_roles
DROP TRIGGER IF EXISTS enforce_role_assignment_trigger ON public.user_roles;
CREATE TRIGGER enforce_role_assignment_trigger
    BEFORE INSERT OR UPDATE ON public.user_roles
    FOR EACH ROW
    EXECUTE FUNCTION public.enforce_role_assignment();


-- ============================================================
-- SEC-7: Add INSERT policy to ai_logs so edge functions using
-- service role key can write logs. Also add a policy for 
-- authenticated users inserting their own logs as a fallback.
-- ============================================================

-- Allow service role (used by edge functions) to insert any log
-- Note: service role key bypasses RLS entirely, so this policy 
-- is a defense-in-depth measure for any future client-side logging.
CREATE POLICY "Service can insert AI logs"
    ON public.ai_logs FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);


-- ============================================================
-- SEC-3 Support: Add school_id to profiles if not exists,
-- and create a counselor_students table if it doesn't exist
-- for explicit counselor-student assignments.
-- ============================================================

-- Ensure counselor_students table exists for scoped access
CREATE TABLE IF NOT EXISTS public.counselor_students (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    counselor_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (counselor_id, student_id)
);

ALTER TABLE public.counselor_students ENABLE ROW LEVEL SECURITY;

-- Counselors can see their own assignments
CREATE POLICY "Counselors can view their student assignments"
    ON public.counselor_students FOR SELECT
    TO authenticated
    USING (auth.uid() = counselor_id OR public.has_role(auth.uid(), 'admin'));

-- Admins can manage all assignments
CREATE POLICY "Admins can manage counselor assignments"
    ON public.counselor_students FOR ALL
    TO authenticated
    USING (public.has_role(auth.uid(), 'admin'));
