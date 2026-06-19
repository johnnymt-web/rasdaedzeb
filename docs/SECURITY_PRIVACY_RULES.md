# Security & Privacy Rules

> Level 4 · Competencies 2 (Supabase/RLS) + 5 (minor-data privacy) + supports 6.
> Tags: ✅ verified · ⓘ inferred · ❓ unknown. **No secrets/tokens/student data in this repo.**

## 1. Golden rules (do not violate)
- **Never weaken RLS, auth, authorization, roles, or privacy.**
- **Never expose the service-role key or any secret to the frontend.** AI/provider keys are server-side only (✅ verified — all in `Deno.env`).
- **Never trust `user_id` / role / results from a client request body.** Derive identity from the JWT; recompute scores server-side.
- **Never apply RLS/role/migration changes to production without: explain → propose → approve → stage.**
- Treat all student data as **minors' personal data**.

## 2. RLS model ✅
- **RLS is enabled on 43/43 public tables** (verified via live introspection 2026-06-18). No table without policies.
- Helper functions (live):
  - `is_self(uuid)` — auth.uid() == target.
  - `has_role(uuid, app_role)` — **superadmin inherits admin** (`role = _role OR (role='superadmin' AND _role='admin')`) ✅.
  - `can_access_student_assessment`, `is_assigned_counselor` — scoped access.
  - `has_ai_consent(uuid)` — consent gate (⚠️ branch-only, not live yet).
- Access pattern: students see own; parents via `parent_students`; counselors via assignment; admins/superadmin broad.

## 3. Provisioning & escalation defense ✅
- `handle_new_user`: role comes **only from `pre_boarding`** (admin-managed); signup metadata role is ignored; self-signup → `student` (S1, live).
- `enforce_role_assignment` trigger (live): blocks granting `admin`/`counselor`/`superadmin` unless caller is admin/superadmin (or pre_boarding for admin/counselor). Closes self-promotion.
- ⚠️ `useAuth` has client-side fallbacks (set role from `user_metadata`, auto-create rows). These are **UI-level only**; RLS + the trigger are the real guard. Do not rely on client role state for security.

## 4. Minor-data privacy
- Audience is children (12–18). Apply data-minimization everywhere.
- **AI processing of minors' data requires consent** (school = controller, parental consent, default-deny). The **consent system is designed and built on `feat/ai-consent-privacy` but NOT merged/live** (⚠️ critical gap — see `CURRENT_PROJECT_STATUS.md`).
- Data sent to third-party AI must be minimized (scores + grade band; no names/email/school where avoidable). ✅ `generate-synthesis` already pseudonymous; `generate-parent-insight` name-withholding is on the consent branch.
- Free-text in `ai_logs` should be redacted (done on consent branch, not main). → `AI_INTERPRETATION_RULES.md`.

## 5. How to change RLS / roles / schema safely
1. Read the **current live definition** (read-only `pg_get_functiondef` / `pg_policies`) — do not guess.
2. Explain the issue, why it matters, affected files, migration/security risk.
3. Propose the safest fix; get explicit approval.
4. Stage (Supabase branch or a careful prod-staged order); validate (parity / self-test).
5. Apply only on "go." Keep a rollback ready (commented in the migration).
- Enum gotcha: `ALTER TYPE ... ADD VALUE` must be its **own migration**; the new value can't be used in the same transaction.

## 6. Secrets & data hygiene
- Do **not** put secrets, tokens (e.g. `sbp_…`), connection strings, or **student UUIDs/PII** into the repo or docs.
- Short-lived tokens (if ever used for read-only introspection) must be **revoked immediately** after use.

## Related rules
`AI_INTERPRETATION_RULES.md` · `ASSESSMENT_SCORING_RULES.md` · `CLAUDE_CODE_WORKFLOW.md` · `CURRENT_PROJECT_STATUS.md`
