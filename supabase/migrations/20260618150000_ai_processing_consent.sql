-- =========================================================================
-- AI processing consent for minors (C2 data layer) — ADDITIVE, default-DENY.
-- Not applied to production until reviewed/approved (Phase-12: new table + RLS
-- on minor data). On a feature branch only.
-- =========================================================================
-- Model: school = data controller, Pathfinder = processor. Parental/guardian
-- consent (or admin school-attestation) is required before any student data is
-- sent to third-party AI sub-processors (Anthropic / OpenAI / Lovable gateway).
-- Assessments themselves work WITHOUT this consent; only the AI layer is gated.
-- =========================================================================

CREATE TABLE IF NOT EXISTS public.ai_processing_consent (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id     uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  consent_given  boolean NOT NULL DEFAULT false,
  consent_method text,                       -- 'parent_portal' | 'school_attestation'
  consented_by   uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  consented_at   timestamptz,
  withdrawn_at   timestamptz,
  created_at     timestamptz NOT NULL DEFAULT now(),
  updated_at     timestamptz NOT NULL DEFAULT now(),
  UNIQUE (student_id)
);

ALTER TABLE public.ai_processing_consent ENABLE ROW LEVEL SECURITY;

-- Read: the student, their linked parent, their assigned counselor, or an admin.
DROP POLICY IF EXISTS "ai_consent_select" ON public.ai_processing_consent;
CREATE POLICY "ai_consent_select" ON public.ai_processing_consent FOR SELECT USING (
  public.is_self(student_id)
  OR public.has_role(auth.uid(), 'admin'::public.app_role)
  OR EXISTS (SELECT 1 FROM public.parent_students ps WHERE ps.parent_id = auth.uid() AND ps.student_id = ai_processing_consent.student_id)
  OR EXISTS (SELECT 1 FROM public.counselor_students cs WHERE cs.counselor_id = auth.uid() AND cs.student_id = ai_processing_consent.student_id)
);

-- Record consent: a linked parent/guardian, or an admin (school attestation). Students cannot self-consent.
DROP POLICY IF EXISTS "ai_consent_insert" ON public.ai_processing_consent;
CREATE POLICY "ai_consent_insert" ON public.ai_processing_consent FOR INSERT WITH CHECK (
  public.has_role(auth.uid(), 'admin'::public.app_role)
  OR EXISTS (SELECT 1 FROM public.parent_students ps WHERE ps.parent_id = auth.uid() AND ps.student_id = ai_processing_consent.student_id)
);

DROP POLICY IF EXISTS "ai_consent_update" ON public.ai_processing_consent;
CREATE POLICY "ai_consent_update" ON public.ai_processing_consent FOR UPDATE
USING (
  public.has_role(auth.uid(), 'admin'::public.app_role)
  OR EXISTS (SELECT 1 FROM public.parent_students ps WHERE ps.parent_id = auth.uid() AND ps.student_id = ai_processing_consent.student_id)
)
WITH CHECK (
  public.has_role(auth.uid(), 'admin'::public.app_role)
  OR EXISTS (SELECT 1 FROM public.parent_students ps WHERE ps.parent_id = auth.uid() AND ps.student_id = ai_processing_consent.student_id)
);

-- Server-side gate used by edge functions (service role): consent given AND not withdrawn.
CREATE OR REPLACE FUNCTION public.has_ai_consent(p_student uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.ai_processing_consent
    WHERE student_id = p_student AND consent_given = true AND withdrawn_at IS NULL
  );
$$;

-- keep updated_at fresh
CREATE OR REPLACE FUNCTION public.touch_ai_consent_updated_at() RETURNS trigger
LANGUAGE plpgsql AS $$ BEGIN NEW.updated_at := now(); RETURN NEW; END $$;
DROP TRIGGER IF EXISTS trg_ai_consent_touch ON public.ai_processing_consent;
CREATE TRIGGER trg_ai_consent_touch BEFORE UPDATE ON public.ai_processing_consent
  FOR EACH ROW EXECUTE FUNCTION public.touch_ai_consent_updated_at();

-- Rollback: DROP TABLE public.ai_processing_consent CASCADE;
--           DROP FUNCTION IF EXISTS public.has_ai_consent(uuid);
--           DROP FUNCTION IF EXISTS public.touch_ai_consent_updated_at();
