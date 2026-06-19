# Assessment Scoring Rules (Integrity)

> Competency 4 (assessment integrity). Tags: ✅ verified · ⓘ inferred · ❓ unknown.

## 1. Integrity principle
**Scores are recomputed server-side and never trusted from the client.** The client may compute
results locally for instant display, but the **stored** results are authoritative and recomputed
on the server. Tampered/fabricated scores must be impossible.

## 2. Where scoring happens ✅
| Instruments | Mechanism | Status |
|---|---|---|
| Big Five, CAAS, Work Values | **DB `BEFORE INSERT/UPDATE` triggers** (`g5_apply_*` calling `g5_score_*`) recompute the score columns from `item_responses` | ✅ live (Phase A) |
| RIASEC, Skills, EQ | **`submit-assessment` edge function** recomputes `results` from `answers`, sets `grade_band` + `question_set_version`, inserts via service role | ✅ live (Phase B) |

Phase A scoring functions are **parity-validated** against all existing rows (0 mismatches) before
enabling. Phase B has **vitest parity tests** (`scoring.test.ts`).

## 3. Exact scoring (mirror frontend) ✅
- **Big Five:** per trait, reverse-key adjust (`6 - v` for negatively-keyed items per `SIGN_MAP`), normalize `sum/(count*5)*100`. Columns 0–100 + `facet_scores`.
- **CAAS:** per subscale mean (1–5) via `CAAS_SUBSCALE_BY_ID`; `total_score` = mean of 4; `percentile = round(total/5*100)`.
- **Work Values:** per-category average; **uneven item counts** (achievement/independence/recognition/support = 3; relationships/working_conditions = 4).
- **RIASEC:** ids 1–48, category = `ceil(id/8)` → 6 Holland types; `pct = round(sum/(8*5)*100)`; results `[{category,pct}]` sorted desc.
- **Skills:** ids 101–105, one category each; `pct = round(v/5*100)`; sorted desc.
- **EQ:** ids `sa/sm/soa/rm ×3` → 4 dimensions; per-dim average `score` (1–5) + `pct`; results `[{category,score,pct}]` in **fixed dimension order** (not sorted).

If you change any frontend question/scoring map, you **must** update the server scorers in
lock-step (Phase A SQL functions and Phase B `submit-assessment`).

## 4. ⚠️ RIASEC dual-structure gotcha ✅
Two incompatible RIASEC item structures exist:
- **Grade banks** (discovery/exploration/planning): ids 1–48, **8 items/category** (`ceil(id/8)`).
- **`FALLBACK_RIASEC_QUESTIONS`**: ids 1–30, **5 items/category** (different mapping).
The fallback is currently **unreachable** in the live client (banks are populated), but the server
**rejects non-48-item RIASEC** rather than mis-scoring. `question_set_version` records which set
(e.g. `riasec_planning_v1_48`) so future divergence is unambiguous.

## 5. Provenance columns ✅
`assessments.grade_band` (derived server-side from `profiles.grade`) and
`assessments.question_set_version` (e.g. `riasec_<band>_v1_48`, `skills_v1_5`, `eq_v1_12`).

## 6. Tamper-proofing status (read CURRENT_PROJECT_STATUS for live state)
- Phase A triggers: ✅ live & tamper-proof.
- Phase B function: ✅ live & recomputes; **BUT the RLS lockdown (Migration 2) that blocks direct
  client inserts is NOT active** (rolled back) — so direct client insert into `assessments` is still
  technically possible until the lockdown is (re)applied. Gated; needs approval.
- **Step-0 parity survey** (historical RIASEC structure check) ❓ has not been run.

## 7. Known DB-trigger lesson ✅
A pre-existing trigger `notify_counselor_on_assessment` referenced a non-existent `NEW.type`
column (correct: `assessment_type`), which **blocked all assessment inserts** when a student had a
counselor. Fixed live via SQL Editor — ⚠️ **this fix is not yet captured in a repo migration** (drift).

## Related rules
`DOMAIN_CAREER_DEVELOPMENT.md` · `SECURITY_PRIVACY_RULES.md` · `TESTING_DISCIPLINE.md` · `CURRENT_PROJECT_STATUS.md`
