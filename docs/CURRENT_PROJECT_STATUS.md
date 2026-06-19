# Current Project Status (LIVING FILE)

> **Single source of truth for "what is real right now."** Other docs link here instead of
> duplicating status. Tags: ✅ verified · ⓘ inferred · ❓ unknown · 🔴 failed/blocked.

## 🔁 Maintenance rule (do not skip)
**This file MUST be updated after any major change**, including:
merge to `main` · production deployment · Supabase migration · RLS change · edge-function
deployment · consent/DPA rollout · Phase B lockdown · major branch-status change.
Each update must refresh: **last-verified date**, **how verified**, **live / branch-only / gated /
unknown**, and the **must-not-touch** list. Keep it honest (verified vs inferred vs unknown).

---

**Last verified:** 2026-06-19
**Latest `main` commit:** `ae10883` — *Merge PR #5 (chore/migration-sync)*.
**How verified:** live git + GitHub API queries (branches, PRs, CI check-runs, deploy runs) and live
Supabase introspection done earlier in the session (read-only); CI status read from GitHub Actions.
The migration-sync merge was verified via `git fetch` + `git pull --ff-only` to `main` and
`git ls-files` (the new migration present on `main`; working tree clean).

## ✅ Live on `main` / production (verified)
- **Phase B `submit-assessment`** edge function — server-authoritative RIASEC/Skills/EQ scoring — **LIVE and working** (prod submissions saved for grade-11 all-3 and grade-7 RIASEC/Skills). Scoring is **inlined** in `index.ts`.
- `assessments.grade_band` + `question_set_version` columns — applied (Migration 1).
- **superadmin** is a real DB role (enum + `has_role` inheritance + provisioning guard) — applied + bootstrapped — **LIVE**.
- Phase A server-side scoring triggers (Big Five/CAAS/Work Values) — LIVE.
- **Typecheck + Test CI green** on `main`; superadmin/typecheck-debt work **completed** (merged via PR #2).
- `notify_counselor_on_assessment` function **fixed live** (removed bad `NEW.type`) **and now captured in repo migrations** — `20260619100000_capture_notify_counselor_on_assessment.sql` (function + `on_assessment_completed` trigger), merged via **PR #5** (Task 1 / migration-sync). Repo hygiene only; **no prod migration was run by Claude Code**.
- Cold-start client timeout 15s→45s — committed to `main` (`89969bf`).
- **Project Knowledge System** — `CLAUDE.md` + 10 `docs/*` operating docs — **merged to `main` via PR #3** (latest `main` = `b4fb008`); verified present with a clean tree.

## 🌿 Branch-only (NOT live, NOT merged)
- **Consent/DPA system** — `feat/ai-consent-privacy` (9 commits): `ai_processing_consent` table + RLS + `has_ai_consent()`, server enforcement in 3 AI fns, `AiConsentGate`/`ParentConsentControl`/`consentService`, `DATA-PROCESSING-REGISTER.md`. **Built, not applied, not merged.**
- **Audit document** — `docs/audit-environment-reconciliation` (`AUDIT-2026-06.md`). Not merged.
- `g5-phase-b` branch is now **behind `main`** (lacks the inline-fix + timeout-fix that are on main).

## ⛔ Gated / NOT approved
- **Migration 2 / RLS lockdown** on `assessments` — applied once then **rolled back**; currently **NOT active** → direct client insert is still technically possible. Re-apply only after cold-start verification **and** explicit approval. The migration file is `HOLD_20260618140000_…` (HOLD-prefixed).
- Consent/DPA **production rollout** + merging `feat/ai-consent-privacy`.
- Merging `docs/audit-environment-reconciliation` (owner chose to keep it on its own branch).
- Historical **backfill/rewrite**.
- Any new prod migration / RLS change.

## ❓ Unknown / unverified
- **Step-0 RIASEC parity survey** — never run (`supabase/scripts/g5_phaseb_step0_parity.sql`).
- **Cold-start timeout fix** — deploying; not re-verified by a fresh cold submit.
- Full `ka` translation coverage/quality — not audited.

## 🔴 / ⚠️ Risks & drift (open)
- 🔴 **CRITICAL: consent/DPA gap for minors** — student data still flows to third-party AI in prod with no consent gating (consent system is branch-only). DPAs unsigned.
- 🟠 **Assessments not tamper-proof** — RLS lockdown inactive (function works, but direct client insert not blocked).
- 🟡 **Migration drift** — `Supabase Preview` check FAILS on `main`; DB not rebuildable from the migrations folder (legacy untracked SQL). *(Note: the previously-flagged live-only `notify_counselor_on_assessment` fix is now captured in repo via PR #5 — see "Live on main"; broader folder reproducibility is still open.)*
- 🟡 **Debug `[submit]` logs** in the live function (log `user.id`) — clean up.
- 🟡 `scoring.ts` duplicated (file + inlined in `index.ts`) — keep in sync.
- 🟢 Two Vercel projects — intentional.

## 🚫 Must NOT be touched without explicit approval
RLS policies/helpers · `app_role`/role logic · production migrations · the RLS lockdown · merges to
`main` · production deploys · `HOLD_` removal · consent prod rollout · any historical data backfill ·
service-role key / any secret (never to frontend).

## Suggested safest next steps (see handoff report for full plan)
1. ✅ **Done (PR #5):** captured the live-only `notify_counselor_on_assessment` fix (fn + trigger) as a repo migration. *(Optional follow-up: confirm grade_band/superadmin migrations match live.)*
2. **Verify the cold-start fix** (one cold submit).
3. *(Gated)* Re-apply RLS lockdown after #2 + approval.
4. *(Owner)* Consent/DPA decisions + DPAs before any consent prod work.
