# Domain Knowledge — Career Development (Grades 7–12)

> Level 2 (Domain) · Competency 3 (career-dev) + supports 4 & 7.
> Tags: ✅ verified (source/introspection) · ⓘ inferred · ❓ unknown.

## 1. What the platform does
A developmental career-guidance ecosystem for school students aged ~12–18. Students complete
psychometric/career instruments; the system produces **age-appropriate, non-deterministic**
interpretation and connects students, parents, counselors, schools (and mentors). The goal is
**exploration and growth**, never a deterministic "your career is X." ✅ (verified in AI prompts
and the `softenInterpretation`/"responses suggest…" wording).

## 2. Grade bands (the core developmental model) ✅
From `src/utils/gradeBands.ts` (`getGradeBand`):
| Band | Grades | Focus |
|---|---|---|
| `discovery` | 6–8 | Curiosity, confidence, interests; play-based, no career pressure |
| `exploration` | 9–10 | Connect interests to subjects & broad fields; subject choice |
| `planning` | 11–12 | Compare realistic pathways; applications; decisions |
| `transition` | 13 | Final pathway confirmation; post-school steps |
| `unknown` | other/none | Defaults to discovery-style handling |

**Rule:** never give grade-11 advice to a grade-7 student. Content, instruments, and
interpretation are **grade-band aware**.

## 3. The six instruments ✅
| Instrument | Table | Grade gating | Notes |
|---|---|---|---|
| **RIASEC** (Holland interests) | `assessments` (type `riasec`) | all (grade-aware question bank) | 6 Holland types; 48-item banks per band |
| **Employability Skills** | `assessments` (type `skills`) | all | 5 items (ids 101–105) |
| **Big Five** (personality) | `big_five_assessments` | exploration+ ⓘ | reverse-keyed items |
| **CAAS** (career adaptability) | `caas_assessments` | grade ≥ 11 ✅ | concern/control/curiosity/confidence |
| **Work Values** | `work_values_assessments` | grade ≥ 9 ✅ | 6 categories, uneven item counts |
| **EQ** (emotional skills) | `assessments` (type `eq`) | grade ≥ 11 ✅ | 4 dimensions × 3 |

`getRecommendedAssessmentsForGradeBand` ✅ controls which instruments each band sees.
Exact scoring math → `docs/ASSESSMENT_SCORING_RULES.md`.

## 4. RIASEC / Holland framework ✅
Six types: **R**ealistic, **I**nvestigative, **A**rtistic, **S**ocial, **E**nterprising,
**C**onventional. A student's top-3 form a 3-letter code (e.g. "SIA"). The **scoring frame is
held constant across grade bands** (comparability over time); only the **question wording**
changes by band/language. This is intentional psychometric design — see
`docs/ASSESSMENT_SCORING_RULES.md` for the dual-structure (48-item bank vs 30-item fallback) caveat.

## 5. Roles & workflows ✅
DB enum `app_role` = `student | parent | counselor | admin | superadmin` ✅ (superadmin added 2026-06; inherits admin).
- **Student**: takes assessments, sees own report + AI coach.
- **Parent**: linked via `parent_students`; sees their child's insight; **records AI-processing consent** (design).
- **Counselor**: assigned students (`counselor_assignments`/`counselor_students`); dashboards, notes, follow-ups, meetings, AI copilot.
- **Admin**: school-level management, bulk onboarding, insights.
- **Superadmin**: cross-school management (`/superadmin`: schools, admin assignment). Inherits all admin access.
- **Mentorship bridge**: grade-aware multi-instrument student↔mentor matching → see `docs/MENTORSHIP_BRIDGE.md`.

## 6. Interpretation tone (domain rule) ✅
- Use "your responses suggest…", "you may want to explore…"; never "you should become…".
- Non-diagnostic; no clinical/psychometric jargon to students.
- Encourage discussion with counselor/parent.
- Strengths-based; developmental stage-anchored.
These rules are enforced in AI prompts and UI wording — see `docs/AI_INTERPRETATION_RULES.md`.

## 7. Audience & language
Primary audience is **Georgian-speaking**. Career interpretation must read naturally and be
age-appropriate in Georgian. → `docs/LOCALIZATION_GEORGIAN.md`.

## Related rules
`ASSESSMENT_SCORING_RULES.md` · `AI_INTERPRETATION_RULES.md` · `LOCALIZATION_GEORGIAN.md` · `SECURITY_PRIVACY_RULES.md`
