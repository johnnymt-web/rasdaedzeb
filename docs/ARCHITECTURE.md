# Architecture Manual

> Level 3 (Architecture) · Competency 1 (full-stack).
> Tags: ✅ verified · ⓘ inferred · ❓ unknown.

## 1. Stack ✅
- **Frontend:** React 18 + Vite 5 + TypeScript (strict) + Tailwind + shadcn/ui, TanStack Query,
  react-router-dom v6, react-i18next (ka/en), PWA (vite-plugin-pwa), Sentry.
- **Backend:** Supabase — PostgreSQL + Auth + RLS + Edge Functions (Deno) + pg_cron/pg_net + Vault.
- **AI:** Anthropic (synthesis), OpenAI gpt-4o-mini (coaches/insight/localize), "Lovable AI gateway" (some coaches).
- **Hosting:** Vercel (two projects, intentional) deploying `main`.

## 2. Repo map ✅
```
src/
  pages/            role dashboards, assessment pages (AssessmentPage = riasec+skills, EqAssessment, CaasAssessment, WorkValuesAssessment, BigFive…)
  components/        assessment/, admin/, counselor/, parent/, superadmin/, consent/ (branch), layout/, ui/ (shadcn)
  services/         assessmentService, aiService, mentorService, onetService, consentService (branch)
  hooks/            useAuth (role + profile), useAiConsent (branch)
  utils/            gradeBands, riasec, assessmentNormalization
  data/             riasecQuestions (grade-band × language banks)
  integrations/supabase/  client.ts (env-driven), types.ts (generated)
supabase/
  functions/        11 edge functions (see §5)
  migrations/        timestamped SQL (+ legacy untracked seed files — see drift)
  scripts/           g5_phaseb_step0_parity.sql (read-only survey)
docs/                this knowledge system + MENTORSHIP_BRIDGE.md
```

## 3. Data model ✅
- **43 base tables** in `public` (verified via live introspection 2026-06-18).
- Assessment storage is split:
  - **Dedicated tables** (`big_five_assessments`, `caas_assessments`, `work_values_assessments`): explicit numeric score columns + `item_responses` JSONB.
  - **Generic `assessments` table** (RIASEC/Skills/EQ): `{ user_id, assessment_type, answers, results (JSONB), grade_band, question_set_version, completed_at, … }`.
- Linking tables: `parent_students`, `counselor_students`, `counselor_assignments`, `counselor_schools`, `pre_boarding`, `pre_boarding_links`.
- AI/ops: `ai_reports` (synthesis cache), `ai_logs`, `ai_usage_stats`, `notifications`, `audit_logs`, `onet_cache`.
- `app_role` enum includes `superadmin` ✅.

## 4. Auth & role flow ✅
- `src/integrations/supabase/client.ts` is **env-driven** (`VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`) — no hardcoded URL.
- `src/hooks/useAuth.tsx`: resolves role from `user_roles`; has a **dev-only** role override (`import.meta.env.DEV`), and client-side fallbacks (auto-create role/profile from metadata) — *defense-in-depth concern, contained by the `enforce_role_assignment` trigger* (see SECURITY doc).
- Provisioning: `handle_new_user` (role from `pre_boarding`, not metadata, post-S1) + `enforce_role_assignment` trigger (only admin/superadmin or pre_boarding may grant privileged roles).
- RLS helpers (live): `is_self`, `has_role` (superadmin inherits admin), `can_access_student_assessment`, `is_assigned_counselor`, `has_ai_consent` (branch). → SECURITY doc.

## 5. Edge functions (11, deployed) ✅
| Function | Provider | Auth in code | Purpose |
|---|---|---|---|
| `submit-assessment` | — (service-role insert) | JWT verify | **server-authoritative** RIASEC/Skills/EQ scoring (Phase B). Scoring is **inlined** (local import broke boot). |
| `generate-synthesis` | Anthropic | access guard + caller + 40/day | deep report; cached in `ai_reports` |
| `bulk-onboard-users` | — (admin.createUser) | admin only | bulk student/staff creation |
| `admin-insights` | Lovable gateway | admin only | cohort analytics chat |
| `counselor-coach` | Lovable gateway | counselor/admin | counselor copilot |
| `parent-coach` | Lovable gateway | JWT | parent chat |
| `career-coach` | OpenAI | JWT + consent (branch) | student report Q&A |
| `generate-parent-insight` | OpenAI | parent-link + consent (branch) | parent insight |
| `localize-careers` | OpenAI | (platform JWT) | translate career strings |
| `onet-proxy` | O*NET | (proxy) | occupation data |
| `refresh-onet-cache` | — | service role (cron) | cache refresh |

## 6. Assessment data flow ✅
1. Client computes results locally (instant display).
2. Client calls `submit-assessment` (Phase B: RIASEC/Skills/EQ) → server recomputes & inserts; OR
   dedicated tables (Big Five/CAAS/Work Values) → client insert, **DB trigger recomputes scores** (Phase A).
3. RLS scopes who can read.
→ details in `docs/ASSESSMENT_SCORING_RULES.md`.

## 7. AI flow ✅
Assessment scores → (consent-gated, design) → server-side prompt build (minimized) → provider →
result stored/cached. → `docs/AI_INTERPRETATION_RULES.md`.

## Related rules
`SECURITY_PRIVACY_RULES.md` · `ASSESSMENT_SCORING_RULES.md` · `DEPLOYMENT_AND_ENVIRONMENTS.md`
