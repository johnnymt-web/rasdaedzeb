CREATE POLICY "Counselors can view all roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'counselor'::app_role));