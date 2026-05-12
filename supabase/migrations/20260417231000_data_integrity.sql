-- ==========================================================
-- DATA INTEGRITY CONSTRAINTS
-- ==========================================================

-- 1. Profiles Hardening
ALTER TABLE public.profiles 
  ALTER COLUMN email SET NOT NULL,
  ALTER COLUMN full_name SET NOT NULL;

-- 2. Audit Logs Hardening
ALTER TABLE public.audit_logs
  ALTER COLUMN admin_id SET NOT NULL,
  ALTER COLUMN action SET NOT NULL,
  ALTER COLUMN target_type SET NOT NULL;

-- 3. Pre-Boarding Hardening
ALTER TABLE public.pre_boarding
  ALTER COLUMN assigned_role SET NOT NULL;

-- 4. Constraint on Assessments (Logic Check)
-- Note: results is a JSONB array. We can't easily CHECK nested values in pure SQL without a function, 
-- but we can add a basic structure check or just leave it to the app logic for now.
-- For now, let's ensure completed_at is never after now().
ALTER TABLE public.assessments
  ADD CONSTRAINT completed_at_check CHECK (completed_at <= now() + interval '1 minute');

-- 5. User Roles Casing Protection
-- Ensure roles are always valid from the enum
-- (Postgres handles this via the TYPE public.app_role)
