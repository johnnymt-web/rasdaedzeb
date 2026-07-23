-- =========================================================================
-- PF-013: govern the ungoverned self-deletion / account-erasure path.
-- =========================================================================
-- This platform stores minors' longitudinal career-development and psychometric
-- history. Audit finding PF-013 confirmed that
--   public.request_self_deletion()  (20260417233000_gdpr_self_delete.sql)
-- is a SECURITY DEFINER function that runs `DELETE FROM auth.users WHERE
-- id = auth.uid()`, cascading (ON DELETE CASCADE) to profiles, assessments,
-- big_five_assessments, caas_assessments, work_values_assessments, reflections,
-- goals, skill snapshots, and every other auth.users-owned record.
--
-- Because functions default to EXECUTE granted to PUBLIC, an ordinary
-- authenticated student could call it directly over PostgREST
-- (`supabase.rpc('request_self_deletion')`) and irreversibly erase their entire
-- account and assessment history — with NO audit entry, NO consent/assent check,
-- NO parental-governance step, and NO safeguarding review. The frontend does not
-- currently call it, but PostgREST exposes it (it appears in the generated
-- Supabase types), so UI absence is not a boundary.
--
-- CONTAINMENT (this migration): remove destructive-RPC EXECUTE from ordinary
-- browser/API client roles. This is a security/safeguarding boundary, NOT a
-- denial of any user's privacy/erasure rights. Governed account erasure remains
-- available through the admin-only, audited public.delete_user(target_user_id)
-- RPC (has_role 'admin' + audit_logs write). A future user-facing privacy /
-- right-to-erasure request should be a SEPARATE, non-destructive request →
-- review → approval workflow (with minor-status / parental-consent / assent /
-- audit), implemented in its own phase — not a client-callable destructive RPC.
--
-- The function body is left UNCHANGED: it already derives its target solely from
-- auth.uid() (no arbitrary target argument), pins `search_path = public`, and
-- fully schema-qualifies auth.users, so it is not the vulnerability — its
-- client-executability is. No table/policy/scoring/trigger is touched.
-- =========================================================================

-- Remove EXECUTE from the default PUBLIC grant and from the Supabase client
-- roles explicitly (anon/authenticated hold it only via PUBLIC; the per-role
-- REVOKEs are explicit belt-and-suspenders and are safe no-ops if no direct
-- grant exists). Exact zero-argument identity signature.
REVOKE EXECUTE ON FUNCTION public.request_self_deletion() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.request_self_deletion() FROM anon;
REVOKE EXECUTE ON FUNCTION public.request_self_deletion() FROM authenticated;

-- No EXECUTE is granted to any client role. The function owner (definer) retains
-- EXECUTE for any future trusted internal/server use; governed user deletion is
-- performed via public.delete_user. service_role uses direct/admin deletion
-- paths and does not require this RPC.

-- =========================================================================
-- Rollback (technical only — re-opens PF-013; do NOT run to restore the
-- vulnerable state). Restoring broad client EXECUTE re-exposes ungoverned,
-- unaudited, irreversible self-erasure of a minor's account. Prefer a governed
-- forward-fix (a non-destructive privacy-request workflow) instead:
--   GRANT EXECUTE ON FUNCTION public.request_self_deletion() TO authenticated;
-- =========================================================================
