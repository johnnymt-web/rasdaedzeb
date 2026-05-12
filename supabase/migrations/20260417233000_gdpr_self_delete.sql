-- ==========================================================
-- GDPR COMPLIANCE (RIGHT TO ERASURE)
-- ==========================================================

-- 1. Function to allow users to delete their own account
-- This is more secure than giving users direct DELETE access to auth.users
CREATE OR REPLACE FUNCTION public.request_self_deletion()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    -- Only allows deleting the user calling the function
    DELETE FROM auth.users WHERE id = auth.uid();
    
    -- Note: Cascading deletes handle the rest of the public tables
END;
$$;
