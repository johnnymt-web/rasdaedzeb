-- =========================================================================
-- PF-007: audited superadmin cross-school read boundary.
-- =========================================================================
-- This platform stores minors' PII and psychometric assessment data. Audit
-- finding PF-007 confirmed that a `superadmin` could perform cross-school reads
-- of profiles + all assessment tables with NO audit trail, via five permissive
-- global SELECT policies captured in 20260723120000_capture_superadmin_select_
-- policies.sql:
--   "Superadmin select all profiles"     ON public.profiles
--   "Superadmin select all assessments"  ON public.assessments
--   "Superadmin select all big_five"      ON public.big_five_assessments
--   "Superadmin select all caas"          ON public.caas_assessments
--   "Superadmin select all work_values"   ON public.work_values_assessments
--
-- Approved architecture (Phase 2D.1): remove those five direct SELECT policies
-- and route every privileged cross-school read through a SECURITY DEFINER RPC
-- that (1) verifies the superadmin role, (2) writes ONE audit_logs event, and
-- (3) returns the authorized data — atomically, fail-closed. After this
-- migration a superadmin's direct `.from(<table>).select(...)` returns NO
-- cross-school rows (no policy grants them SELECT); the audited RPCs — which read
-- as the function owner, bypassing RLS — become the only client path.
--
-- PostgreSQL cannot trigger on SELECT, so a SECURITY DEFINER RPC boundary is the
-- only in-repo mechanism that reliably records a privileged read. audit_logs is
-- reused unchanged (client-immutable: it has only a SELECT policy, no client
-- INSERT/UPDATE/DELETE — only SECURITY DEFINER writes reach it). No psychometric
-- payload is ever written to the audit metadata — only proof that access
-- occurred, by whom, to whose record.
--
-- Scope: superadmin cross-school reads of the five tables only. Ordinary self /
-- parent / counselor / school-admin scoped SELECT policies are UNCHANGED; no
-- scoring, AI, deletion (PF-012), self-deletion (PF-013), or grade/cycle
-- protection (PF-011) is touched. superadmin status is the trusted
-- user_roles.role value (not client-settable — enforce_role_assignment).
-- =========================================================================

-- 1) Remove the five direct superadmin global SELECT policies (the PF-007 vector).
DROP POLICY IF EXISTS "Superadmin select all profiles"    ON public.profiles;
DROP POLICY IF EXISTS "Superadmin select all assessments" ON public.assessments;
DROP POLICY IF EXISTS "Superadmin select all big_five"    ON public.big_five_assessments;
DROP POLICY IF EXISTS "Superadmin select all caas"        ON public.caas_assessments;
DROP POLICY IF EXISTS "Superadmin select all work_values" ON public.work_values_assessments;

-- =========================================================================
-- 2) Audited privileged-read RPCs (SECURITY DEFINER, superadmin-gated).
--    Each: authorize -> read -> write ONE audit event -> return (fail-closed:
--    data is returned only after the audit INSERT succeeds; any failure aborts
--    the whole function/transaction and returns nothing).
-- =========================================================================

-- 2a) Cross-school student/profile list (bounded, typed). One READ_STUDENT_LIST
--     event per request (never one per row). The raw search term is NOT stored
--     (it can contain a minor's name) — only whether a search was applied.
CREATE OR REPLACE FUNCTION public.superadmin_list_students(
  p_search text DEFAULT NULL,
  p_limit  integer DEFAULT 200,
  p_offset integer DEFAULT 0
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_limit  integer := least(greatest(coalesce(p_limit, 200), 1), 500);  -- bounded page
  v_offset integer := greatest(coalesce(p_offset, 0), 0);
  v_rows   jsonb;
  v_count  integer;
BEGIN
  IF NOT public.has_role(auth.uid(), 'superadmin'::public.app_role) THEN
    RAISE EXCEPTION 'Unauthorized: superadmin role required';
  END IF;

  SELECT coalesce(jsonb_agg(t), '[]'::jsonb), count(*)
    INTO v_rows, v_count
  FROM (
    SELECT p.id, p.full_name, p.email, p.grade, p.school_id, p.created_at, p.is_archived
    FROM public.profiles p
    WHERE p_search IS NULL
       OR p.full_name    ILIKE '%' || p_search || '%'
       OR p.email        ILIKE '%' || p_search || '%'
       OR p.grade::text  ILIKE '%' || p_search || '%'
    ORDER BY p.created_at DESC NULLS LAST
    LIMIT v_limit OFFSET v_offset
  ) t;

  INSERT INTO public.audit_logs (admin_id, action, target_type, target_id, details)
  VALUES (
    auth.uid(), 'READ_STUDENT_LIST', 'profile', NULL,
    jsonb_build_object(
      'actor_role', 'superadmin',
      'access_mode', 'list',
      'resource_class', 'profile',
      'result_count', v_count,
      'search_applied', (p_search IS NOT NULL AND length(trim(p_search)) > 0),
      'limit', v_limit,
      'offset', v_offset
    )
  );

  RETURN v_rows;
END;
$$;

-- 2b) Single cross-school profile detail. One READ_STUDENT event.
CREATE OR REPLACE FUNCTION public.superadmin_get_student_profile(
  p_student_id uuid,
  p_reason text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_profile   jsonb;
  v_school_id uuid;
BEGIN
  IF NOT public.has_role(auth.uid(), 'superadmin'::public.app_role) THEN
    RAISE EXCEPTION 'Unauthorized: superadmin role required';
  END IF;

  SELECT to_jsonb(x), x.school_id
    INTO v_profile, v_school_id
  FROM (
    SELECT p.id, p.full_name, p.email, p.grade, p.created_at, p.school_id,
           s.name AS school_name
    FROM public.profiles p
    LEFT JOIN public.schools s ON s.id = p.school_id
    WHERE p.id = p_student_id
  ) x;

  INSERT INTO public.audit_logs (admin_id, action, target_type, target_id, details)
  VALUES (
    auth.uid(), 'READ_STUDENT', 'profile', p_student_id::text,
    jsonb_build_object(
      'actor_role', 'superadmin',
      'access_mode', 'detail',
      'resource_class', 'profile',
      'target_school_id', v_school_id,
      'reason', p_reason
    )
  );

  RETURN v_profile;  -- null if not found (the attempted access is still audited)
END;
$$;

-- 2c) Full report bundle for one student (profile cycle + all four assessment
--     tables). One READ_STUDENT_REPORT event; the returned psychometric payload
--     is NEVER copied into the audit metadata (only non-sensitive row counts).
CREATE OR REPLACE FUNCTION public.superadmin_get_student_report_bundle(
  p_student_id uuid,
  p_reason text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_bundle    jsonb;
  v_cycle     integer;
  v_school_id uuid;
BEGIN
  IF NOT public.has_role(auth.uid(), 'superadmin'::public.app_role) THEN
    RAISE EXCEPTION 'Unauthorized: superadmin role required';
  END IF;

  SELECT p.current_assessment_cycle, p.school_id
    INTO v_cycle, v_school_id
  FROM public.profiles p
  WHERE p.id = p_student_id;

  v_bundle := jsonb_build_object(
    'std', (
      SELECT coalesce(jsonb_agg(to_jsonb(a) ORDER BY a.completed_at DESC NULLS LAST), '[]'::jsonb)
      FROM public.assessments a WHERE a.user_id = p_student_id
    ),
    'big_five', (
      SELECT coalesce(jsonb_agg(to_jsonb(b) ORDER BY b.completed_at DESC NULLS LAST), '[]'::jsonb)
      FROM public.big_five_assessments b WHERE b.student_id = p_student_id
    ),
    'caas', (
      SELECT coalesce(jsonb_agg(to_jsonb(c) ORDER BY c.completed_at DESC NULLS LAST), '[]'::jsonb)
      FROM public.caas_assessments c WHERE c.student_id = p_student_id
    ),
    'work_values', (
      SELECT coalesce(jsonb_agg(to_jsonb(w) ORDER BY w.completed_at DESC NULLS LAST), '[]'::jsonb)
      FROM public.work_values_assessments w WHERE w.student_id = p_student_id
    ),
    'current_cycle', coalesce(v_cycle, 1)
  );

  INSERT INTO public.audit_logs (admin_id, action, target_type, target_id, details)
  VALUES (
    auth.uid(), 'READ_STUDENT_REPORT', 'student_report', p_student_id::text,
    jsonb_build_object(
      'actor_role', 'superadmin',
      'access_mode', 'report',
      'resource_class', 'assessment_report',
      'target_school_id', v_school_id,
      'reason', p_reason,
      'counts', jsonb_build_object(
        'std',         jsonb_array_length(v_bundle->'std'),
        'big_five',    jsonb_array_length(v_bundle->'big_five'),
        'caas',        jsonb_array_length(v_bundle->'caas'),
        'work_values', jsonb_array_length(v_bundle->'work_values')
      )
    )
  );

  RETURN v_bundle;
END;
$$;

-- 2d) Platform aggregate counts (non-PII integers). Needs global visibility that
--     the removed policies used to provide, so it is superadmin-gated and audited
--     (READ_PLATFORM_COUNTS). Returns counts only — no row-level data.
CREATE OR REPLACE FUNCTION public.superadmin_platform_counts()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_counts jsonb;
BEGIN
  IF NOT public.has_role(auth.uid(), 'superadmin'::public.app_role) THEN
    RAISE EXCEPTION 'Unauthorized: superadmin role required';
  END IF;

  v_counts := jsonb_build_object(
    'schools',     (SELECT count(*) FROM public.schools),
    'users',       (SELECT count(*) FROM public.profiles),
    'assessments', (SELECT count(*) FROM public.assessments)
  );

  INSERT INTO public.audit_logs (admin_id, action, target_type, target_id, details)
  VALUES (
    auth.uid(), 'READ_PLATFORM_COUNTS', 'platform', NULL,
    jsonb_build_object('actor_role', 'superadmin', 'access_mode', 'aggregate', 'counts', v_counts)
  );

  RETURN v_counts;
END;
$$;

-- =========================================================================
-- 3) Privilege hardening: no PUBLIC/anon execution; only `authenticated` may
--    call, and each function still rejects any non-superadmin internally.
-- =========================================================================
REVOKE EXECUTE ON FUNCTION public.superadmin_list_students(text, integer, integer)      FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.superadmin_list_students(text, integer, integer)      FROM anon;
GRANT  EXECUTE ON FUNCTION public.superadmin_list_students(text, integer, integer)      TO authenticated;

REVOKE EXECUTE ON FUNCTION public.superadmin_get_student_profile(uuid, text)            FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.superadmin_get_student_profile(uuid, text)            FROM anon;
GRANT  EXECUTE ON FUNCTION public.superadmin_get_student_profile(uuid, text)            TO authenticated;

REVOKE EXECUTE ON FUNCTION public.superadmin_get_student_report_bundle(uuid, text)      FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.superadmin_get_student_report_bundle(uuid, text)      FROM anon;
GRANT  EXECUTE ON FUNCTION public.superadmin_get_student_report_bundle(uuid, text)      TO authenticated;

REVOKE EXECUTE ON FUNCTION public.superadmin_platform_counts()                          FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.superadmin_platform_counts()                          FROM anon;
GRANT  EXECUTE ON FUNCTION public.superadmin_platform_counts()                          TO authenticated;

-- =========================================================================
-- Rollback (technical only — re-opens PF-007's UNAUDITED cross-school read).
-- Preferred recovery is a FORWARD-FIX to the RPCs, NOT restoring direct global
-- SELECT. Restoring the five policies below re-enables superadmin direct reads
-- with no audit trail (the vulnerability) and must be a deliberate emergency
-- choice, not a default:
--   -- (re-create from 20260723120000 definitions) + DROP the four RPCs above.
-- =========================================================================
