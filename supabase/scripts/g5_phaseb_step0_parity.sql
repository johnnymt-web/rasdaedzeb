-- =========================================================================
-- G5 Phase B — Step-0 PARITY / STRUCTURE SURVEY  (READ-ONLY, no writes)
-- Run in the STAGING Supabase branch (or read-only against PRODUCTION) AFTER
-- Migration 1 / before any RLS lockdown.
-- Purpose:
--   1. Classify each historical RIASEC row's question structure
--      (48-item grade bank vs 30-item fallback vs other vs non-numeric keys).
--   2. For 48-item rows, recompute category pct (ceil(id/8), sum/40*100, round)
--      and diff against the stored results -> confirm server math matches history.
--   3. Surface any fallback / other / non-numeric rows for manual review.
-- This script DOES NOT modify or backfill any data. SELECT-only.
-- Note: numeric key casting happens ONLY after a regex numeric check, so a row
-- with non-numeric answer keys is reported as REVIEW, never a fatal cast error.
-- =========================================================================

-- ---- Query A: RIASEC structure + parity per row (hardened) ----
WITH riasec AS (
  SELECT id, answers, results
  FROM public.assessments
  WHERE assessment_type = 'riasec'
),
kv AS (
  SELECT r.id, kv.key AS k, kv.value AS v, (kv.key ~ '^[0-9]+$') AS key_numeric
  FROM riasec r, jsonb_each_text(r.answers) kv
),
keys AS (
  SELECT id,
         count(*)                                   AS n_answers,
         bool_and(key_numeric)                      AS all_numeric_ids,
         min(CASE WHEN key_numeric THEN k::int END) AS min_id,  -- cast only after numeric check
         max(CASE WHEN key_numeric THEN k::int END) AS max_id
  FROM kv
  GROUP BY id
),
structure AS (
  SELECT k.*,
    CASE
      WHEN NOT all_numeric_ids                           THEN 'non_numeric_keys'
      WHEN n_answers = 48 AND min_id = 1 AND max_id = 48 THEN 'grade_bank_48'
      WHEN n_answers = 30 AND min_id = 1 AND max_id = 30 THEN 'fallback_30'
      ELSE 'other'
    END AS structure
  FROM keys k
),
recomputed AS (  -- only grade_bank_48 rows (keys guaranteed numeric); double-guarded
  SELECT kvv.id,
         (ARRAY['Realistic','Investigative','Artistic','Social','Enterprising','Conventional'])
           [ceil(kvv.k::int / 8.0)::int] AS category,
         round(sum(kvv.v::numeric) / 40 * 100) AS calc_pct
  FROM kv kvv
  JOIN structure s ON s.id = kvv.id AND s.structure = 'grade_bank_48'
  WHERE kvv.key_numeric AND kvv.v ~ '^-?[0-9]+(\.[0-9]+)?$'
  GROUP BY kvv.id, category
),
stored AS (
  SELECT r.id, (e->>'category') AS category, (e->>'pct')::numeric AS stored_pct
  FROM riasec r, jsonb_array_elements(r.results) e
  WHERE jsonb_typeof(r.results) = 'array'   -- guard against null / non-array results
),
cmp AS (
  SELECT rc.id, max(abs(rc.calc_pct - COALESCE(s.stored_pct, -999))) AS max_pct_diff
  FROM recomputed rc
  LEFT JOIN stored s ON s.id = rc.id AND s.category = rc.category
  GROUP BY rc.id
)
SELECT
  st.id,
  st.structure,
  st.n_answers,
  st.min_id,
  st.max_id,
  c.max_pct_diff,
  CASE
    WHEN st.structure = 'grade_bank_48' AND COALESCE(c.max_pct_diff, 0) <= 0.5 THEN 'MATCH'
    WHEN st.structure = 'grade_bank_48'                                        THEN 'MISMATCH'
    ELSE 'REVIEW (' || st.structure || ')'
  END AS verdict
FROM structure st
LEFT JOIN cmp c ON c.id = st.id
ORDER BY verdict, st.id;

-- ---- Query B: structure distribution summary (RIASEC) ----
-- Expect all rows to be answer_count = 48. Any 30 (or other) => review.
WITH riasec AS (
  SELECT r.id, count(*) AS n
  FROM public.assessments r, jsonb_each_text(r.answers) kv
  WHERE r.assessment_type = 'riasec'
  GROUP BY r.id
)
SELECT n AS answer_count, count(*) AS rows
FROM riasec GROUP BY n ORDER BY n;

-- ---- Query C: Skills / EQ structural sanity (counts only) ----
SELECT assessment_type,
       count(*)                                                AS total_rows,
       count(*) FILTER (WHERE jsonb_typeof(answers) = 'object') AS object_answers
FROM public.assessments
WHERE assessment_type IN ('skills', 'eq')
GROUP BY assessment_type;
