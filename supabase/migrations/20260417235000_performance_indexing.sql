-- ==========================================================
-- PERFORMANCE INDEXING
-- ==========================================================

-- 1. Assessments Index (Most used query: user history)
CREATE INDEX IF NOT EXISTS idx_assessments_user_id_completed_at 
  ON public.assessments(user_id, completed_at DESC);

-- 2. Audit Logs Index (Admin dashboard queries)
CREATE INDEX IF NOT EXISTS idx_audit_logs_admin_created 
  ON public.audit_logs(admin_id, created_at DESC);

-- 3. Pre-boarding Index (Signup performance)
CREATE INDEX IF NOT EXISTS idx_pre_boarding_email 
  ON public.pre_boarding(email);

-- 4. User Roles Index (Policy check performance)
-- This is critical as every RLS check calls public.has_role
CREATE INDEX IF NOT EXISTS idx_user_roles_composite 
  ON public.user_roles(user_id, role);
