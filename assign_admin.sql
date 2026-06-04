ALTER TABLE public.user_roles DISABLE TRIGGER enforce_role_assignment_trigger;
UPDATE public.user_roles SET role = 'admin' WHERE user_id = 'e10eb763-63f0-49d0-abe4-c10a4120f3ba';
ALTER TABLE public.user_roles ENABLE TRIGGER enforce_role_assignment_trigger;
UPDATE public.profiles SET full_name = 'Johnny Admin' WHERE id = 'e10eb763-63f0-49d0-abe4-c10a4120f3ba';
