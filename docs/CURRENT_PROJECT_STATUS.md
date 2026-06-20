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

**Last verified:** 2026-06-20
**Latest `main` commit:** `d430dde` — *Merge PR #8 (fix/pwa-selfdestroying-disable)*.
**How verified:** live git + GitHub API queries (branches, PRs, CI check-runs, deploy/status) and live
Supabase introspection done earlier in the session (read-only); CI status read from GitHub Actions.
**D1 cold-start/save verification (2026-06-19):** manual production test by the owner — a fresh Skills
submission was confirmed to call `submit-assessment`, return success, and insert a new
`public.assessments` row (`created_at = 2026-06-19 18:25:05.595441+00`). ✅ Verified by the owner in
the browser (Network) + the live DB row.
**PWA `selfDestroying` verification (2026-06-20, PR #8):** ▲ Vercel Production deployed `d430dde`
successfully (both projects); CI Typecheck + Test + Deploy green. Owner browser verification:
`navigator.serviceWorker.controller` returned **`null`**, the old SW was deleted/redundant/unregistered,
and the **Skills** assessment saved successfully after `Ctrl+Shift+R` in a normal Chrome profile
(Incognito save also succeeded earlier). ✅ Confirms the earlier failure was **stale browser cache /
old client bundle** — not `submit-assessment`, not the Supabase insert, not an extension blocker.

## ✅ Live on `main` / production (verified)
- **Phase B `submit-assessment`** edge function — server-authoritative RIASEC/Skills/EQ scoring — **LIVE and working** (prod submissions saved for grade-11 all-3 and grade-7 RIASEC/Skills). Scoring is **inlined** in `index.ts`.
- `assessments.grade_band` + `question_set_version` columns — applied (Migration 1).
- **superadmin** is a real DB role (enum + `has_role` inheritance + provisioning guard) — applied + bootstrapped — **LIVE**.
- Phase A server-side scoring triggers (Big Five/CAAS/Work Values) — LIVE.
- **Typecheck + Test CI green** on `main`; superadmin/typecheck-debt work **completed** (merged via PR #2).
- `notify_counselor_on_assessment` function **fixed live** (removed bad `NEW.type`) **and now captured in repo migrations** — `20260619100000_capture_notify_counselor_on_assessment.sql` (function + `on_assessment_completed` trigger), merged via **PR #5** (Task 1 / migration-sync). Repo hygiene only; **no prod migration was run by Claude Code**.
- Cold-start client timeout 15s→45s — committed to `main` (`89969bf`) and **verified working in production** (D1, 2026-06-19). `submit-assessment` saves RIASEC/Skills/EQ server-side; a fresh Skills submit inserted a row at `18:25:05+00`.
- **D1 verification — root cause of the observed "Could not sync" was a stale PWA/service-worker cached client bundle**, NOT a `submit-assessment` server failure. ✅ The browser had been running a **pre-Phase-B** bundle (the timeout-warning string predates the `submit-assessment` invoke: commit `881ee5c` < `8b04313`), so it never called `submit-assessment` — no request in Network, no row inserted. After **unregistering the service worker + clearing site data + hard reload**, the current bundle ran and the save succeeded. The 45s timeout fix and the edge function were fine all along; they simply were not the code executing.
- **Project Knowledge System** — `CLAUDE.md` + 10 `docs/*` operating docs — **merged to `main` via PR #3** (latest `main` = `b4fb008`); verified present with a clean tree.
- **PWA temporarily disabled via `selfDestroying`** — `vite.config.ts` `VitePWA({ selfDestroying: true })`, **merged via PR #8** (`d430dde`) and **verified live in production** (2026-06-20). Ships a self-unregistering service worker that purges caches on existing clients, so users stop running stale pre-Phase-B bundles **before** the RLS lockdown. Pre-lockdown safety measure; **temporary** — a hardened PWA (update prompt + version check + localStorage draft-persistence, "A+B+D") is a separate later task **before re-enabling the PWA**. No offline/install while disabled (acceptable — platform depends on Supabase cloud save).

## 🌿 Branch-only (NOT live, NOT merged)
- **Consent/DPA system** — `feat/ai-consent-privacy` (9 commits): `ai_processing_consent` table + RLS + `has_ai_consent()`, server enforcement in 3 AI fns, `AiConsentGate`/`ParentConsentControl`/`consentService`, `DATA-PROCESSING-REGISTER.md`. **Built, not applied, not merged.**
- **Audit document** — `docs/audit-environment-reconciliation` (`AUDIT-2026-06.md`). Not merged.
- `g5-phase-b` branch is now **behind `main`** (lacks the inline-fix + timeout-fix that are on main).

## ⛔ Gated / NOT approved
- **Migration 2 / RLS lockdown** on `assessments` — applied once then **rolled back**; currently **NOT active** → direct client insert is still technically possible. Pre-lockdown prerequisites are now **met** (✅ cold-start verified D1; ✅ stale-bundle/cache mitigated via PR #8 `selfDestroying`), **but the lockdown remains GATED** and must **not** be applied without a **separate pre-lockdown approval/report**. The migration file is `HOLD_20260618140000_…` (HOLD-prefixed).
- Consent/DPA **production rollout** + merging `feat/ai-consent-privacy`.
- Merging `docs/audit-environment-reconciliation` (owner chose to keep it on its own branch).
- Historical **backfill/rewrite**.
- Any new prod migration / RLS change.

## ❓ Unknown / unverified
- **Step-0 RIASEC parity survey** — never run (`supabase/scripts/g5_phaseb_step0_parity.sql`).
- ~~**Cold-start timeout fix** — deploying; not re-verified by a fresh cold submit.~~ ✅ **Resolved (D1, 2026-06-19)** — verified working in production after a service-worker cache refresh (see "Live on `main`").
- Full `ka` translation coverage/quality — not audited.

## 🔴 / ⚠️ Risks & drift (open)
- 🔴 **CRITICAL: consent/DPA gap for minors** — student data still flows to third-party AI in prod with no consent gating (consent system is branch-only). DPAs unsigned.
- 🟠 **Assessments not tamper-proof** — RLS lockdown inactive (function works, but direct client insert not blocked).
- 🟡 **Migration drift** — `Supabase Preview` check FAILS on `main`; DB not rebuildable from the migrations folder (legacy untracked SQL). *(Note: the previously-flagged live-only `notify_counselor_on_assessment` fix is now captured in repo via PR #5 — see "Live on main"; broader folder reproducibility is still open.)*
- 🟡 **Debug `[submit]` logs** in the live function (log `user.id`) — clean up.
- 🟡 `scoring.ts` duplicated (file + inlined in `index.ts`) — keep in sync.
- 🟢 **PWA / service-worker staleness — MITIGATED (PR #8, verified 2026-06-20).** The confirmed root cause of the D1 "Could not sync" was a stale **pre-Phase-B** cached bundle. Fixed by temporarily disabling the PWA via `selfDestroying` so existing clients unregister their SW + purge caches (verified: `controller === null`, old SW gone, Skills save works after hard reload). ⚠️ **Residual/temporary:** offline/install disabled; **`autoUpdate` is NOT a sufficient long-term update mechanism for this app** — the proper hardened PWA (A+B+D: update prompt + version/build-hash check + localStorage draft-persistence) is a **separate later task before re-enabling the PWA**.
- 🟡 **`onet-proxy` 500 / O*NET career fetch failing** — separate report-side issue ([onetService.ts:230](../src/services/onetService.ts#L230), "Error fetching RIASEC careers"). ❗ **Not** the assessment-save root cause; affects career-recommendation display only. Triage separately.
- 🟢 Two Vercel projects — intentional.

## 🚫 Must NOT be touched without explicit approval
RLS policies/helpers · `app_role`/role logic · production migrations · the RLS lockdown · merges to
`main` · production deploys · `HOLD_` removal · consent prod rollout · any historical data backfill ·
service-role key / any secret (never to frontend).

## Suggested safest next steps (see handoff report for full plan)
1. ✅ **Done (PR #5):** captured the live-only `notify_counselor_on_assessment` fix (fn + trigger) as a repo migration. *(Optional follow-up: confirm grade_band/superadmin migrations match live.)*
2. ✅ **Done (D1, 2026-06-19):** verified cold-start/save works in production; root cause of the failure was a **stale PWA cache**, not the server.
3. ✅ **Done (PR #8, verified 2026-06-20):** stale-bundle/cache risk mitigated by temporarily disabling the PWA via `selfDestroying`. Pre-lockdown safety prerequisite complete.
4. *(Gated)* **Re-apply RLS lockdown** — prerequisites now met (cold-start ✅, stale-cache ✅) but still requires a **separate pre-lockdown approval/report** before any action.
5. **Hardened PWA (A+B+D)** + localStorage draft-persistence — build reliable update UX **before re-enabling the PWA** (currently disabled via `selfDestroying`).
6. *(Owner)* Consent/DPA decisions + DPAs before any consent prod work.
7. Triage the separate `onet-proxy`/O*NET 500 (career-fetch display only).
