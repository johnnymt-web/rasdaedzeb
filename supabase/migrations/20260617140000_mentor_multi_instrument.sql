-- =========================================================================
-- Mentor matching: multi-instrument profile (Phase 4 #9 refinement)
-- Matching now uses the assessments appropriate to the student's grade band:
--   interests (RIASEC), skill gaps (Skills), needs (CAAS/EQ), values (Work
--   Values) and rapport (Big Five) — not Holland code alone.
-- =========================================================================

ALTER TABLE public.mentors
  ADD COLUMN IF NOT EXISTS coachable_skills text[],  -- maps to student skill gaps (Skills test)
  ADD COLUMN IF NOT EXISTS specialties      text[],  -- maps to student needs (CAAS/EQ)
  ADD COLUMN IF NOT EXISTS role_values      text[],  -- maps to student Work Values
  ADD COLUMN IF NOT EXISTS style_tags       text[];  -- maps to rapport (Big Five / EQ style)

-- Enrich the demo mentors so grade-aware multi-instrument matching is meaningful.
UPDATE public.mentors SET
  coachable_skills = ARRAY['digital literacy','problem solving'],
  specialties      = ARRAY['exploration','future-planning'],
  role_values      = ARRAY['achievement','independence'],
  style_tags       = ARRAY['structure','patient-pace']
WHERE full_name = 'ნინო ბერიძე';

UPDATE public.mentors SET
  coachable_skills = ARRAY['problem solving','communication'],
  specialties      = ARRAY['resilience','future-planning'],
  role_values      = ARRAY['achievement','relationships'],
  style_tags       = ARRAY['structure','reassurance']
WHERE full_name = 'გიორგი კაპანაძე';

UPDATE public.mentors SET
  coachable_skills = ARRAY['digital literacy','communication'],
  specialties      = ARRAY['confidence-building','exploration'],
  role_values      = ARRAY['independence','recognition'],
  style_tags       = ARRAY['high-energy','patient-pace']
WHERE full_name = 'თამარ ლომიძე';

UPDATE public.mentors SET
  coachable_skills = ARRAY['communication','teamwork'],
  specialties      = ARRAY['ownership','confidence-building'],
  role_values      = ARRAY['achievement','recognition','independence'],
  style_tags       = ARRAY['high-energy']
WHERE full_name = 'დავით ჯავახიშვილი';

UPDATE public.mentors SET
  coachable_skills = ARRAY['communication','teamwork'],
  specialties      = ARRAY['interpersonal-support','resilience','confidence-building'],
  role_values      = ARRAY['relationships','support'],
  style_tags       = ARRAY['reassurance','patient-pace']
WHERE full_name = 'ანა მგელაძე';

UPDATE public.mentors SET
  coachable_skills = ARRAY['problem solving','digital literacy'],
  specialties      = ARRAY['future-planning','ownership'],
  role_values      = ARRAY['achievement','working_conditions'],
  style_tags       = ARRAY['structure']
WHERE full_name = 'ლევან ცქიტიშვილი';
