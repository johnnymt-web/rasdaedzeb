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

**Last verified:** 2026-07-22
**Latest `main` commit:** `01895eb` — *Merge PR #24 (fix/grade-relevant-tests-single-source)*.
**How verified:** live git + GitHub API queries (branches, PRs, CI check-runs, deploy/status) and a
read-only production `information_schema` query run by the owner in the 🟢 Supabase SQL Editor; CI +
Vercel deploy status read from GitHub Actions / commit-status API.
**Assessment Cycles feature (2026-07-22):** shipped live. A student can force a full retake that starts
a new "assessment cycle": `profiles.current_assessment_cycle` increments and every subsequent result
row is tagged with `cycle_number`. The report filters to the selected cycle (with a cycle selector when
>1 cycle exists) and shows an explicit "new cycle in progress" state mid-retake; history preserves all
prior cycles. Merged via **PR #19/#20** (`feat/assessment-cycles`). The `current_assessment_cycle`
(profiles) + `cycle_number` (assessments, big_five/caas/work_values_assessments) columns were **applied
directly to production by the owner in the Supabase SQL Editor via a different tool (Antigravity/Gemini),
outside this repo's normal flow**; owner-run `information_schema` verification confirmed all 5 columns
exist, `is_nullable=YES`, `default=1` (so pre-existing rows and the still-unaware deployed code both keep
working — no submission breakage). The columns were then **captured** as repo migration
`20260722120000_capture_assessment_cycle_columns.sql` (IF-NOT-EXISTS no-op), and the generated
`src/integrations/supabase/types.ts` was hand-patched to match (PR #22) after the missing update first
broke Typecheck CI.
**Grade-relevant test visibility fix (2026-07-22, PR #24):** `getAllowedAssessmentsForGrade` listed
tests the assessment pages actually block by grade (bigfive/eq for grades ≤8; caas for ≤10). With the
cycle feature this became a real defect — younger students saw irrelevant tests, and the report counted
them as permanently "missing", which could leave a new cycle stuck as "incomplete" forever. Fixed by
delegating to the canonical `gradeBands.ts` mapping (single source of truth; matches the per-page guards
+ aiService/mentorService), unifying `AssessmentHistory`'s duplicated inline `isVisible`, and gating the
report's CAAS "next actions" by `isVisible`. Owner verified in production that CAAS no longer shows for
grades 9–10. Effect — discovery(6–8): riasec,skills · exploration(9–10): +bigfive,workvalues ·
planning(11+): +caas,eq.
**Consent/DPA premature-merge + revert (2026-07-22):** PR #14 (`chore/rebase-ai-consent-privacy-onto-main`
— the branch explicitly labeled "DO NOT MERGE YET") was **merged to `main` in error**, deploying the
consent-gating frontend to production while its backing `ai_processing_consent` table/RLS/`has_ai_consent()`
were **never applied to prod**. The `useAiConsent` hook is **fail-closed** (`.catch(() => setConsented(false))`),
so no minor data leaked — but AI coach features silently went dark for everyone. **Reverted via PR #21**
(`e146787`, `git revert -m 1`), restoring AI coach behavior; the consent migration file was re-captured
(file only, no app code) via **PR #23** to resolve a Supabase-Preview migration-drift check. Consent/DPA
remains branch-only and gated on the legal/policy prerequisites (unchanged).
**CI infra (2026-07-22):** the `Deploy Supabase Edge Functions` Action began failing on the first push to
`main` in ~a month; root cause was a stale/expired `SUPABASE_ACCESS_TOKEN` GitHub secret (not code/migration).
Owner rotated the token; all four checks (Typecheck, Test, Deploy, Supabase Preview) are green on `main`
and both ▲ Vercel projects deployed successfully at `01895eb`.
**How verified (2026-06-20 baseline, still valid):** live git + GitHub API queries and live Supabase
introspection (read-only); CI status read from GitHub Actions.
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
**E2 RLS lockdown verification (2026-06-20):** the Phase B lockdown was **applied manually** in the
🟢 Supabase SQL Editor and verified live. After-state: **write-capable policies on
`public.assessments` = 0 rows** (INSERT=0, UPDATE=0, ALL=0), **SELECT=3, DELETE=1, RLS enabled**.
A post-lockdown Skills submit created a new row (`assessment_type=skills`, `grade_band=discovery`,
`question_set_version=skills_v1_5`, `created_at = 2026-06-20 05:35:11+00`). `submit-assessment`
(service role) remains the **sole writer**; direct client INSERT/UPDATE is **blocked**. **Rollback
not needed.** Step-0 parity (read-only) was run and accepted: Query B all `answer_count = 48`;
Query A had only **harmless `max_pct_diff = 1` float-vs-decimal rounding artifacts** (app uses JS
`Math.round` in both the old client and the current server scorer; the SQL uses exact NUMERIC) — **no
integrity issue, no backfill**. Repo capture: the lockdown migration is now active in the repo (PR #11).

## ✅ Live on `main` / production (verified)
- **Assessment Cycles — LIVE (2026-07-22, PR #19/#20).** Forced full retake starts a new cycle
  (`profiles.current_assessment_cycle`++), every result row is tagged with `cycle_number`, and the report
  filters to the selected cycle + shows an "incomplete / new cycle in progress" state mid-retake. DB
  columns applied to prod out-of-band (owner via Antigravity/Gemini SQL) then captured as migration
  `20260722120000_capture_assessment_cycle_columns.sql`; `types.ts` hand-patched (PR #22). All nullable,
  `default=1` → no submission breakage. See the verification block above.
- **Grade-relevant test visibility — FIXED + LIVE (2026-07-22, PR #24).** Single source of truth for
  which assessments a grade sees (`getAllowedAssessmentsForGrade` → `gradeBands.ts`). CAAS/EQ/BigFive no
  longer shown or counted-as-missing for grades that can't take them; unblocks cycle completion for
  younger grades. Owner-verified in prod (CAAS hidden for 9–10).
- **Phase B RLS lockdown on `public.assessments` — LIVE (E2, 2026-06-20).** All four direct-client write policies dropped (`Insert own assessments`, `Update own assessments`, `Users can create their own assessments`, `Users can update their own assessments` — two policy generations); SELECT (3) + DELETE (1) preserved. Only the `submit-assessment` edge function (service role) can write → stored scores are tamper-proof. Captured in the repo as `supabase/migrations/20260618140000_g5_phaseb_assessments_rls_lockdown.sql` (un-HOLDed via **PR #11**, `9b52143`; rename-only 0/0; the `HOLD_`-prefixed file no longer exists). Live RLS was changed by the **owner in the SQL Editor** during E2 — Claude Code ran no SQL.
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
- **Consent/DPA system** — `ai_processing_consent` table + RLS + `has_ai_consent()`, server enforcement in 3 student-data AI fns, `AiConsentGate`/`ParentConsentControl`/`consentService`, `DATA-PROCESSING-REGISTER.md`. **Built, not applied, not merged.**
  - **⚠️ Prematurely merged then REVERTED (2026-07-22):** PR [#14](https://github.com/johnnymt-web/rasdaedzeb/pull/14) (`chore/rebase-ai-consent-privacy-onto-main`, the branch labeled "DO NOT MERGE YET") was **merged to `main` in error** (`8801548`), shipping the consent-gating frontend to production while the backing `ai_processing_consent` table/RLS/`has_ai_consent()` were **never applied to prod**. `useAiConsent` is **fail-closed** → **no minor data leaked**, but AI coach features silently went dark for everyone. **Reverted via PR #21** (`e146787`, `git revert -m 1`) restoring AI coach; the migration file was re-captured (file only, no app code) via **PR #23** to clear a Supabase-Preview migration-drift check. **Consent/DPA is once again branch-only and NOT live.**
    - Rebased branch (`chore/rebase-ai-consent-privacy-onto-main`, latest `0c1296a`) still passes the full CI matrix; `ai_processing_consent` migration applies cleanly in preview.
    - ⛔ **No production migration applied · no production SQL run · no live RLS changed · no Supabase functions deployed to prod · consent-gating NOT live on `main`.**
  - **Real student onboarding remains BLOCKED** by consent/DPA/legal-policy items: school DPA · parental consent form · student assent text · privacy notice (ka + en) · assessment disclaimer · retention schedule · DSAR/export/delete procedure · sub-processor DPAs · consent versioning · staff-copilot gating decision. *(Legal/policy items require legal review — not legal advice.)*
  - **Technical go-live is a separate gated task** (deploy ordering): apply migration **first** → regenerate Supabase types → remove `any` casts → deploy functions → deploy frontend → verify consent enforcement → **only then** consider pilot.
- **Audit document** — `docs/audit-environment-reconciliation` (`AUDIT-2026-06.md`). Not merged.
- `g5-phase-b` branch is now **behind `main`** (lacks the inline-fix + timeout-fix that are on main).

## ⛔ Gated / NOT approved
- ✅ **Migration 2 / RLS lockdown — DONE (E2, 2026-06-20).** Applied + verified live + captured in repo (see "Live on `main`"). No longer gated.
- Consent/DPA **production rollout** + merging `feat/ai-consent-privacy`.
- Merging `docs/audit-environment-reconciliation` (owner chose to keep it on its own branch).
- Historical **backfill/rewrite**.
- Any new prod migration / RLS change.

## ❓ Unknown / unverified
- ~~**Step-0 RIASEC parity survey** — never run.~~ ✅ **Run + accepted (E2, 2026-06-20)** — all RIASEC rows 48-item; only harmless 1-pt float-vs-decimal rounding artifacts; no integrity issue, no backfill. (`supabase/scripts/g5_phaseb_step0_parity.sql`.)
- ~~**Cold-start timeout fix** — deploying; not re-verified by a fresh cold submit.~~ ✅ **Resolved (D1, 2026-06-19)** — verified working in production after a service-worker cache refresh (see "Live on `main`").
- Full `ka` translation coverage/quality — not audited.

## 🔴 / ⚠️ Risks & drift (open)
- 🔴 **CRITICAL: consent/DPA gap for minors** — student data still flows to third-party AI in prod with no consent gating (consent system is branch-only). DPAs unsigned. *(Technical layer is now rebased + CI-green on `chore/rebase-ai-consent-privacy-onto-main` / PR #14 — verification only, NOT live; see Branch-only. Real onboarding remains blocked by the legal/policy items.)*
- 🟢 **Assessments tamper-proof — RESOLVED (E2, 2026-06-20).** RLS lockdown live: all direct-client INSERT/UPDATE policies on `public.assessments` dropped; `submit-assessment` (service role) is the sole writer. Direct client insert/update blocked.
- 🟡 **Migration drift** — broader folder reproducibility still open (legacy untracked SQL: `QUICK_SETUP.sql`, etc.). *Note:* the assessments **write-policy duplication** (two generations) is now resolved by the E2 lockdown, and the `notify_counselor_on_assessment` fix was captured via PR #5; the un-HOLDed lockdown migration **passed the `Supabase Preview` check on PR #11** (applies cleanly), but a single green PR run does not prove the whole `main` history rebuilds cleanly — broader reproducibility remains to be verified.
- 🟡 **Debug `[submit]` logs** in the live function (log `user.id`) — clean up.
- 🟡 `scoring.ts` duplicated (file + inlined in `index.ts`) — keep in sync.
- 🟢 **PWA / service-worker staleness — MITIGATED (PR #8, verified 2026-06-20).** The confirmed root cause of the D1 "Could not sync" was a stale **pre-Phase-B** cached bundle. Fixed by temporarily disabling the PWA via `selfDestroying` so existing clients unregister their SW + purge caches (verified: `controller === null`, old SW gone, Skills save works after hard reload). ⚠️ **Residual/temporary:** offline/install disabled; **`autoUpdate` is NOT a sufficient long-term update mechanism for this app** — the proper hardened PWA (A+B+D: update prompt + version/build-hash check + localStorage draft-persistence) is a **separate later task before re-enabling the PWA**.
- 🟡 **`onet-proxy` 500 / O*NET career fetch failing** — separate report-side issue ([onetService.ts:230](../src/services/onetService.ts#L230), "Error fetching RIASEC careers"). ❗ **Not** the assessment-save root cause; affects career-recommendation display only. Triage separately.
- 🟡 **Client "Cloud sync timed out" false-negative race** — observed once during E2: the toast fired but the `public.assessments` row **was** created (server save succeeded). The 45s client timeout/UX raced ahead of the resolved `submit-assessment` call. ❗ **Not** an RLS condition / not a rollback trigger. Fold the fix into the hardened-PWA / A+B+D + draft-persistence task (e.g. confirm the saved row instead of showing a false timeout). Watch for repeats during monitoring.
- 🟢 Two Vercel projects — intentional.

## 🔭 Monitoring — E2 RLS lockdown (opened 2026-06-20)
**E2 RLS lockdown remains technically complete.** Status: ✅ **internal/synthetic checks PASS** · ❓ **real-user pilot monitoring PENDING** (no real pilot users active yet).

### ✅ Internal / synthetic checks — PASS (2026-06-20)
- `question_set_version` **populated** on recent assessment rows (skills `skills_v1_5` ×9, riasec `discovery`/`exploration`/`planning` `_v1_48`, eq `eq_v1_12`).
- **No NULL/blank** `question_set_version` visible in the grouped 48h check.
- Post-lockdown **synthetic Skills save verified** (new row via `submit-assessment`).
- API Gateway showed **only successful 200/201** responses.
- **No** `42501` / permission-denied / row-level-security / `public.assessments` errors observed.
- **Rollback not needed.**

### ⚠️ Scope caveat — NOT real-user production-proven
- These are **internal/synthetic** checks only. **No real pilot users are active yet.**
- Therefore the lockdown is **internally/synthetically stable, NOT real-user production-proven.**
- **Real-user monitoring MUST be re-run at pilot onboarding.** During the real-user pilot window, watch:
  - **RLS-denied insert errors (`42501`)** on `public.assessments` — a cluster = residual stale clients on the old direct-insert path (they just need a reload — **not** a rollback trigger);
  - **stale-client "couldn't save" reports** (resolved by a hard reload);
  - **`question_set_version` population** on real submissions (must be non-NULL → arrived via `submit-assessment`);
  - the **"Cloud sync timed out" false-negative race** (toast with a saved row → log for the client-UX task; without a saved row → investigate/escalate).
- **Keep the rollback SQL available** as an operational contingency **only during the real pilot monitoring window** (recreate the 4 write policies — see the lockdown migration's rollback block).

> **Top open risk before real student onboarding: consent/DPA for minors (🔴)** — see Risks & the consent/DPA workstream plan.

## 🚫 Must NOT be touched without explicit approval
RLS policies/helpers · `app_role`/role logic · production migrations · the RLS lockdown · merges to
`main` · production deploys · `HOLD_` removal · consent prod rollout · any historical data backfill ·
service-role key / any secret (never to frontend).

## Suggested safest next steps (see handoff report for full plan)
1. ✅ **Done (PR #5):** captured the live-only `notify_counselor_on_assessment` fix (fn + trigger) as a repo migration. *(Optional follow-up: confirm grade_band/superadmin migrations match live.)*
2. ✅ **Done (D1, 2026-06-19):** verified cold-start/save works in production; root cause of the failure was a **stale PWA cache**, not the server.
3. ✅ **Done (PR #8, verified 2026-06-20):** stale-bundle/cache risk mitigated by temporarily disabling the PWA via `selfDestroying`. Pre-lockdown safety prerequisite complete.
4. ✅ **Done (E2 + PR #11, 2026-06-20):** RLS lockdown applied + verified live + captured in repo; `public.assessments` is now tamper-proof (service-role-only writes). **Monitor 24–48h** (see "Active monitoring").
5. **Hardened PWA (A+B+D)** + localStorage draft-persistence + fix the "Cloud sync timed out" false-negative race — build reliable update UX **before re-enabling the PWA** (currently disabled via `selfDestroying`).
6. 🔴 *(Owner)* **Consent/DPA decisions + DPAs** before any consent prod work — now the top open risk.
7. Clean up debug `[submit]` logs + dedupe `scoring.ts`; verify broader migration-folder reproducibility.
8. Triage the separate `onet-proxy`/O*NET 500 (career-fetch display only).
