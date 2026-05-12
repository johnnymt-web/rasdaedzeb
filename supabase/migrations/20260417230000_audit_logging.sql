-- ==========================================================
-- ADMINISTRATIVE AUDIT LOGGING SYSTEM
-- ==========================================================

-- 1. Create Audit Logs Table
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    admin_id UUID NOT NULL REFERENCES auth.users(id),
    action TEXT NOT NULL, -- e.g., 'DELETE_USER', 'BULK_IMPORT', 'ROLE_CHANGE'
    target_type TEXT NOT NULL, -- e.g., 'profile', 'assessment', 'bulk_file'
    target_id TEXT, -- ID of the affected resource
    details JSONB DEFAULT '{}', -- Flexible metadata
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. RLS Policies
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view audit logs"
    ON public.audit_logs FOR SELECT
    TO authenticated
    USING (public.has_role(auth.uid(), 'admin'));

-- 3. Update delete_user RPC to include automatic logging
CREATE OR REPLACE FUNCTION public.delete_user(target_user_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    target_email TEXT;
BEGIN
    -- Check if the current user is an admin
    IF NOT (SELECT public.has_role(auth.uid(), 'admin'::public.app_role)) THEN
        RAISE EXCEPTION 'Unauthorized: Only admins can delete users';
    END IF;

    -- Get target email for the audit log before deletion
    SELECT email INTO target_email FROM public.profiles WHERE id = target_user_id;

    -- Delete the user from auth.users (cascades to public tables)
    DELETE FROM auth.users WHERE id = target_user_id;

    -- Insert Audit Log entry
    INSERT INTO public.audit_logs (admin_id, action, target_type, target_id, details)
    VALUES (
        auth.uid(),
        'DELETE_USER',
        'profile',
        target_user_id::text,
        jsonb_build_object('email', target_email, 'timestamp', now())
    );
END;
$$;
