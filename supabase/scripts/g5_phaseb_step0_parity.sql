-- =========================================================================
-- G5 Phase B — Step-0 PARITY / STRUCTURE SURVEY  (READ-ONLY, no writes)
-- Run in the STAGING Supabase branch AFTER Migration 1, BEFORE any RLS lockdown.
-- Purpose:
--   1. Classify each historical RIASEC row's question structure
--      (48-item grade bank vs 30-item fallback vs other).
--   2. For 48-item rows, recompute category pct (ceil(id/8), sum/40*100, round)
--      and diff against the stored results -> confirm server math matches history.
--   3. Surface any fallback/other rows for manual review.
-- This script DOES NOT modify or backfill any data.
-- =========================================================================

-- ---- Query A: RIASEC structure + parity per row ----
WITH riasec AS (
  SELECT id, answers, results
  FROM public.assessments
  WHERE assessment_type = 'riasec'
),
keys AS (
  SELECT r.id,
         count(*)                         AS n_answers,
         min((kv.key)::int)               AS min_id,
         max((kv.key)::int)               AS max_id,
         bool_and(kv.key ~ '^[0-9]+$')    AS all_numeric_ids
  FROM riasec r, jsonb_each_text(r.answers) kv
  GROUP BY r.id
),
structure AS (
  SELECT k.*,
    CASE
      WHEN all_numeric_ids AND n_answers = 48 AND min_id = 1 AND max_id = 48 THEN 'grade_bank_48'
      WHEN all_numeric_ids AND n_answers = 30 AND min_id = 1 AND max_id = 30 THEN 'fallback_30'
      ELSE 'other'
    END AS structure
  FROM keys k
),
recomputed AS (  -- only for 48-item rows
  SELECT r.id,
         (ARRAY['Realistic','Investigative','Artistic','Social','Enterprising','Conventional'])
           [ceil((kv.key)::int / 8.0)::int] AS category,
         round(sum(kv.value::numeric) / 40 * 100) AS calc_pct
  FROM riasec r
  JOIN structure s ON s.id = r.id AND s.structure = 'grade_bank_48',
       jsonb_each_text(r.answers) kv
  WHERE kv.value ~ '^-?[0-9]+(\.[0-9]+)?$'
  GROUP BY r.id, category
),
stored AS (
  SELECT r.id, (e->>'category') AS category, (e->>'pct')::numeric AS stored_pct
  FROM riasec r, jsonb_array_elements(r.results) e
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
    WHEN st.structure <> 'grade_bank_48' THEN 'REVIEW (not 48-item)'
    WHEN COALESCE(c.max_pct_diff, 0) <= 0.5 THEN 'MATCH'
    ELSE 'MISMATCH'
  END AS verdict
FROM structure st
LEFT JOIN cmp c ON c.id = st.id
ORDER BY verdict, st.id;

-- ---- Query B: structure distribution summary (RIASEC) ----
-- Expect all rows to be 'grade_bank_48' / MATCH. Any fallback_30 or other => review.
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
       count(*)                                  AS total_rows,
       count(*) FILTER (WHERE jsonb_typeof(answers) = 'object') AS object_answers
FROM public.assessments
WHERE assessment_type IN ('skills', 'eq')
GROUP BY assessment_type;
