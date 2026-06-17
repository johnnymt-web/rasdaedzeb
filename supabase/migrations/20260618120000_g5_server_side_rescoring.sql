-- =========================================================================
-- G5 Phase A (Option B) — server-authoritative assessment scoring
-- Applied 2026-06-18 via Supabase SQL Editor (parity-validated: 0 mismatches).
-- =========================================================================
-- Problem: Big Five / CAAS / Work Values scores were computed in the browser
-- and inserted as trusted values, so a modified client could store fabricated
-- psychometric results. (G5-C CHECK constraints only bound the ranges.)
--
-- Fix: BEFORE INSERT/UPDATE triggers recompute every score column from the raw
-- item_responses JSONB, overwriting whatever the client sent. Scores are now
-- derived server-side and cannot be tampered with.
--
-- The scoring functions are pure/IMMUTABLE and mirror the frontend TS exactly
-- (verified by diffing all existing rows -> 0 mismatches before enabling):
--   * Big Five  : src/services/assessmentService.ts (SIGN_MAP / TRAIT_MAP, normalize)
--   * CAAS      : src/services/assessmentService.ts (CAAS_SUBSCALE_BY_ID, means)
--   * WorkValues: src/pages/WorkValuesAssessment.tsx (category averages 3,3,3,4,3,4)
-- If those TS maps ever change, these functions MUST be updated to match.
--
-- Scope note: RIASEC / EQ / Skills live in the generic `assessments` table as
-- freeform `results` JSONB with frontend-only item maps; they are deferred to a
-- later edge-function phase (Phase B).
-- =========================================================================

-- ---- Pure scoring functions (mirror frontend TS) ----

CREATE OR REPLACE FUNCTION public.g5_score_big_five(resp jsonb)
RETURNS jsonb LANGUAGE sql IMMUTABLE AS $$
  WITH r AS (
    SELECT left(key,1) AS trait,
           CASE WHEN key IN ('e2','e4','e6','e8','e10','a1','a3','a5','a7',
                             'c2','c4','c6','c8','n2','n4','o2','o4','o6')
                THEN 6 - value::numeric ELSE value::numeric END AS adj
    FROM jsonb_each_text(resp)
    WHERE left(key,1) IN ('e','a','c','n','o')
      AND value ~ '^-?[0-9]+(\.[0-9]+)?$'
  ),
  a AS (SELECT trait, sum(adj) s, count(*) c FROM r GROUP BY trait)
  SELECT jsonb_build_object(
    'extraversion',      COALESCE((SELECT s/(c*5)*100 FROM a WHERE trait='e'),0),
    'agreeableness',     COALESCE((SELECT s/(c*5)*100 FROM a WHERE trait='a'),0),
    'conscientiousness', COALESCE((SELECT s/(c*5)*100 FROM a WHERE trait='c'),0),
    'neuroticism',       COALESCE((SELECT s/(c*5)*100 FROM a WHERE trait='n'),0),
    'openness',          COALESCE((SELECT s/(c*5)*100 FROM a WHERE trait='o'),0)
  );
$$;

CREATE OR REPLACE FUNCTION public.g5_score_caas(resp jsonb)
RETURNS jsonb LANGUAGE sql IMMUTABLE AS $$
  WITH r AS (
    SELECT CASE
             WHEN key IN ('q1','q2','q3','q4','q5','q6') THEN 'concern'
             WHEN key IN ('q7','q8','q9','q10','q11','q12') THEN 'control'
             WHEN key IN ('q13','q14','q15','q16','q17','q18') THEN 'curiosity'
             WHEN key IN ('q19','q20','q21','q22','q23','q24') THEN 'confidence'
           END AS sub,
           value::numeric AS v
    FROM jsonb_each_text(resp)
    WHERE value ~ '^-?[0-9]+(\.[0-9]+)?$'
  ),
  a AS (SELECT sub, avg(v) m FROM r WHERE sub IS NOT NULL GROUP BY sub),
  m AS (
    SELECT COALESCE((SELECT m FROM a WHERE sub='concern'),0)    concern,
           COALESCE((SELECT m FROM a WHERE sub='control'),0)    control,
           COALESCE((SELECT m FROM a WHERE sub='curiosity'),0)  curiosity,
           COALESCE((SELECT m FROM a WHERE sub='confidence'),0) confidence
  )
  SELECT jsonb_build_object(
    'concern', concern, 'control', control, 'curiosity', curiosity, 'confidence', confidence,
    'total_score', (concern+control+curiosity+confidence)/4,
    'percentile', round(((concern+control+curiosity+confidence)/4)/5*100)
  ) FROM m;
$$;

CREATE OR REPLACE FUNCTION public.g5_score_work_values(resp jsonb)
RETURNS jsonb LANGUAGE sql IMMUTABLE AS $$
  WITH r AS (
    SELECT CASE
             WHEN key IN ('1','2','3') THEN 'achievement'
             WHEN key IN ('4','5','6') THEN 'independence'
             WHEN key IN ('7','8','9') THEN 'recognition'
             WHEN key IN ('10','11','12','13') THEN 'relationships'
             WHEN key IN ('14','15','16') THEN 'support'
             WHEN key IN ('17','18','19','20') THEN 'working_conditions'
           END AS cat,
           value::numeric AS v
    FROM jsonb_each_text(resp)
    WHERE value ~ '^-?[0-9]+(\.[0-9]+)?$'
  ),
  a AS (SELECT cat, sum(v) s FROM r WHERE cat IS NOT NULL GROUP BY cat)
  SELECT jsonb_build_object(
    'achievement',        COALESCE((SELECT s/3 FROM a WHERE cat='achievement'),0),
    'independence',       COALESCE((SELECT s/3 FROM a WHERE cat='independence'),0),
    'recognition',        COALESCE((SELECT s/3 FROM a WHERE cat='recognition'),0),
    'relationships',      COALESCE((SELECT s/4 FROM a WHERE cat='relationships'),0),
    'support',            COALESCE((SELECT s/3 FROM a WHERE cat='support'),0),
    'working_conditions', COALESCE((SELECT s/4 FROM a WHERE cat='working_conditions'),0)
  );
$$;

-- ---- Enforcement trigger functions ----

CREATE OR REPLACE FUNCTION public.g5_apply_big_five() RETURNS trigger
LANGUAGE plpgsql AS $$
DECLARE s jsonb;
BEGIN
  IF NEW.item_responses IS NULL THEN RETURN NEW; END IF;
  s := public.g5_score_big_five(NEW.item_responses);
  NEW.openness          := (s->>'openness')::numeric;
  NEW.conscientiousness := (s->>'conscientiousness')::numeric;
  NEW.extraversion      := (s->>'extraversion')::numeric;
  NEW.agreeableness     := (s->>'agreeableness')::numeric;
  NEW.neuroticism       := (s->>'neuroticism')::numeric;
  NEW.facet_scores      := s;
  RETURN NEW;
END $$;

CREATE OR REPLACE FUNCTION public.g5_apply_caas() RETURNS trigger
LANGUAGE plpgsql AS $$
DECLARE s jsonb;
BEGIN
  IF NEW.item_responses IS NULL THEN RETURN NEW; END IF;
  s := public.g5_score_caas(NEW.item_responses);
  NEW.concern     := (s->>'concern')::numeric;
  NEW.control     := (s->>'control')::numeric;
  NEW.curiosity   := (s->>'curiosity')::numeric;
  NEW.confidence  := (s->>'confidence')::numeric;
  NEW.total_score := (s->>'total_score')::numeric;
  NEW.percentile  := (s->>'percentile')::numeric;
  RETURN NEW;
END $$;

CREATE OR REPLACE FUNCTION public.g5_apply_work_values() RETURNS trigger
LANGUAGE plpgsql AS $$
DECLARE s jsonb;
BEGIN
  IF NEW.item_responses IS NULL THEN RETURN NEW; END IF;
  s := public.g5_score_work_values(NEW.item_responses);
  NEW.achievement        := (s->>'achievement')::numeric;
  NEW.independence       := (s->>'independence')::numeric;
  NEW.recognition        := (s->>'recognition')::numeric;
  NEW.relationships      := (s->>'relationships')::numeric;
  NEW.support            := (s->>'support')::numeric;
  NEW.working_conditions := (s->>'working_conditions')::numeric;
  RETURN NEW;
END $$;

-- ---- Triggers ----

DROP TRIGGER IF EXISTS g5_rescore_big_five ON public.big_five_assessments;
CREATE TRIGGER g5_rescore_big_five BEFORE INSERT OR UPDATE ON public.big_five_assessments
  FOR EACH ROW EXECUTE FUNCTION public.g5_apply_big_five();

DROP TRIGGER IF EXISTS g5_rescore_caas ON public.caas_assessments;
CREATE TRIGGER g5_rescore_caas BEFORE INSERT OR UPDATE ON public.caas_assessments
  FOR EACH ROW EXECUTE FUNCTION public.g5_apply_caas();

DROP TRIGGER IF EXISTS g5_rescore_work_values ON public.work_values_assessments;
CREATE TRIGGER g5_rescore_work_values BEFORE INSERT OR UPDATE ON public.work_values_assessments
  FOR EACH ROW EXECUTE FUNCTION public.g5_apply_work_values();
