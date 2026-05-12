-- RPC to delete a user from auth.users
-- This requires SECURITY DEFINER as it accesses the auth schema
CREATE OR REPLACE FUNCTION public.delete_user(target_user_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
BEGIN
  -- Check if the current user is an admin
  IF NOT (SELECT public.has_role(auth.uid(), 'admin'::public.app_role)) THEN
    RAISE EXCEPTION 'Unauthorized: Only admins can delete users';
  END IF;

  -- Delete the user from auth.users
  -- This will cascade to profiles, user_roles, and other tables with ON DELETE CASCADE
  DELETE FROM auth.users WHERE id = target_user_id;
END;
$$;
