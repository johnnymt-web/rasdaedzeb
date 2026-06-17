-- =========================================================================
-- G5 (Option C): sanity guardrails on client-computed assessment scores.
-- Rejects out-of-range / impossible values and requires the raw item_responses
-- to be present. Added NOT VALID so existing rows are never rejected; the checks
-- are enforced on all new INSERT/UPDATE. (Full server-side rescoring = Option B,
-- a separate, larger change.)
-- Note: covers big_five_assessments + caas_assessments (explicit numeric score
-- columns). RIASEC/Skills/EQ store results as JSONB and would be covered by B.
-- =========================================================================

-- Big Five: each trait is a 0-100 normalized score; raw responses required.
ALTER TABLE public.big_five_assessments DROP CONSTRAINT IF EXISTS chk_bigfive_ranges;
ALTER TABLE public.big_five_assessments
  ADD CONSTRAINT chk_bigfive_ranges CHECK (
    openness BETWEEN 0 AND 100 AND
    conscientiousness BETWEEN 0 AND 100 AND
    extraversion BETWEEN 0 AND 100 AND
    agreeableness BETWEEN 0 AND 100 AND
    neuroticism BETWEEN 0 AND 100
  ) NOT VALID;

ALTER TABLE public.big_five_assessments DROP CONSTRAINT IF EXISTS chk_bigfive_has_responses;
ALTER TABLE public.big_five_assessments
  ADD CONSTRAINT chk_bigfive_has_responses CHECK (item_responses IS NOT NULL) NOT VALID;

-- CAAS: subscale means + total are on a 1-5 scale (allow 0 for defensiveness);
-- percentile is 0-100; raw responses required.
ALTER TABLE public.caas_assessments DROP CONSTRAINT IF EXISTS chk_caas_ranges;
ALTER TABLE public.caas_assessments
  ADD CONSTRAINT chk_caas_ranges CHECK (
    concern BETWEEN 0 AND 5 AND
    control BETWEEN 0 AND 5 AND
    curiosity BETWEEN 0 AND 5 AND
    confidence BETWEEN 0 AND 5 AND
    total_score BETWEEN 0 AND 5 AND
    percentile BETWEEN 0 AND 100
  ) NOT VALID;

ALTER TABLE public.caas_assessments DROP CONSTRAINT IF EXISTS chk_caas_has_responses;
ALTER TABLE public.caas_assessments
  ADD CONSTRAINT chk_caas_has_responses CHECK (item_responses IS NOT NULL) NOT VALID;
