-- =========================================================================
-- Make `superadmin` a REAL role — step 2 of 2: privileges + provisioning guard.
-- ⛔ APPLY ONLY AFTER 20260618160000_app_role_add_superadmin.sql HAS COMMITTED
--    (a new enum value cannot be used in the same transaction it is added).
-- Phase-12: core auth-function change. Staged review/approval required.
-- =========================================================================
-- WHY THIS IS PAIRED WITH THE ENUM MIGRATION:
-- Once 'superadmin' exists in the enum, the OLD enforce_role_assignment did NOT
-- guard it (it only checked admin/counselor) — so anyone could self-grant
-- 'superadmin'. This migration closes that escalation hole. Do NOT ship the enum
-- migration to production without this one.
-- =========================================================================

-- 1) superadmin INHERITS admin: has_role(uid,'admin') is true for superadmins,
--    so superadmin automatically satisfies every existing admin-gated RLS policy.
--    (Only superadmin->admin is inherited; nothing grants 'superadmin' itself.)
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id
      AND (role = _role OR (role = 'superadmin' AND _role = 'admin'))
  )
$function$;

-- 2) Provisioning guard: only an existing superadmin may grant 'superadmin'
--    (admins cannot self-promote). Existing admin/counselor logic is preserved;
--    note superadmins now also pass the admin check below via has_role inheritance.
CREATE OR REPLACE FUNCTION public.enforce_role_assignment()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  IF NEW.role = 'superadmin' THEN
    IF public.has_role(auth.uid(), 'superadmin'::public.app_role) THEN
      RETURN NEW;
    END IF;
    RAISE EXCEPTION 'Only a superadmin can assign the superadmin role';
  END IF;

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
$function$;

-- =========================================================================
-- BOOTSTRAP (run once, manually, by the project owner — the trigger blocks the
-- first superadmin otherwise). Replace <USER_ID> with the target admin's id:
--
--   ALTER TABLE public.user_roles DISABLE TRIGGER enforce_role_assignment_trigger;
--   UPDATE public.user_roles SET role = 'superadmin' WHERE user_id = '<USER_ID>';
--   ALTER TABLE public.user_roles ENABLE TRIGGER enforce_role_assignment_trigger;
--
-- ROLLBACK (restore prior behaviour):
--   -- revert has_role: drop the "(role='superadmin' AND _role='admin')" clause.
--   -- revert enforce_role_assignment: remove the NEW.role='superadmin' branch.
-- =========================================================================
