# Phase 1B — Final Acceptance Review

**Reviewer:** independent application-security review · **Date:** 2026-07-22 · **Branch:** `fix/ai-endpoint-containment-phase1a` (uncommitted) · **Mode:** review; one confirmed acceptance defect fixed (see Objective C).

## Verdict: **Accept with conditions**

All active AI-provider egress in the reviewed scope is guarded and fails closed; the seven-function inventory is confirmed complete; every provider function now carries repository-controlled `verify_jwt = true`. **Safe to commit** and **safe to deploy with AI disabled.** Enabling AI, and the post-deploy runtime confirmations, remain conditions.

## Files reviewed (complete files / diffs)
`supabase/config.toml`; `supabase/functions/_shared/aiFeatureFlag.ts`; the 7 provider functions (`career-coach`, `generate-parent-insight`, `generate-synthesis`, `localize-careers`, `counselor-coach`, `parent-coach`, `admin-insights`); `src/test/aiFeatureFlag.test.ts`; `docs/professional-audit/remediation-phase-1a/` and `remediation-phase-1b/`.

## Objective A — Complete AI egress inventory: **confirmed complete**

Bounded search across `supabase/functions/` for OpenAI/Anthropic/Lovable URLs, keys, `chat/completions`, `v1/messages`, `messages.create`, model env vars, and `fetch()` to model endpoints. Every external-model signal resides in exactly the **seven** guarded functions. Findings:
- **No additional reachable provider function.** The other functions make no model call: `bulk-onboard-users`, `refresh-onet-cache`, `submit-assessment` have **no `fetch()`**; `onet-proxy` fetches `services.onetcenter.org` (O*NET career DB, **not** an AI provider).
- **No shared-helper egress.** `supabase/functions/_shared/` contains only `aiFeatureFlag.ts` (pure flag parser; no network).
- **No unexpected external host** — all http(s) targets in functions are deno.land/esm.sh (imports), the three AI providers, O*NET, or Supabase.
- **No new provider egress found** → containment can be declared complete for the reviewed scope.

## Objective B — Guard correctness: **pass (all 7)**

For each provider function: imports the real shared `parseAiEnabled()` (no duplicate); the guard is the first statement after the OPTIONS branch. Verified (structural verifier, 57/57) that between `serve(async …)` and the guard there is **no** `req.json()`, **no** `auth.getUser()`, **no** provider `fetch(...)`, and **no** `handleLegacy(`/`callAnthropic(` call — so when disabled: nothing parsed, no student data assembled or logged, no provider client/call/cost. Disabled response is a deterministic `503` with `{"error":"AI features are currently disabled."}`, CORS preserved (`...corsHeaders`; `localize-careers` uses its local `json()` helper → same headers/body/status), and no env/config leaked. Flag read only from `Deno.env` → **no client-controlled bypass** (no body/query/header/email/`isTestUser`). Fail-closed parser unchanged from Phase 1A (only `"true"` trimmed/case-insensitive enables). **Containment genuinely prevents all reviewed provider calls when the flag is missing/false.**

## Objective C — `localize-careers` authentication: **resolved → `verify_jwt=true` (defect fixed)**

Independently traced callers: the sole invocation is `src/services/onetService.ts:431`, `supabase.functions.invoke("localize-careers", { body: { texts, lang } })`. `functions.invoke()` **automatically attaches the authenticated user's JWT**; all reachable callers are inside authenticated career-exploration flows (behind `ProtectedRoute`). The payload is O*NET career-taxonomy text (titles/descriptions/tasks), **not** student PII, but the call incurs OpenAI cost and has **no** public-access justification. Enabling `verify_jwt` breaks no legitimate caller (they already send a JWT).

Per the task rule ("if `verify_jwt=true` is clearly required and existing callers already supply JWTs, treat the missing configuration as a confirmed acceptance defect") and the modification rule permitting this specific fix, I set `verify_jwt = true` for `localize-careers`, updated the config comment, moved it into the test's authenticated set, and corrected the Phase 1B summary. **Conclusion: `verify_jwt=true` is required and safe.** All seven provider functions are now authenticated.

## Objective D — Configuration, tests, documentation

- **config.toml:** every `[functions.*]` section appears exactly once (verified, no duplicates); **7** real `verify_jwt = true` assignments — exactly the seven provider functions; **no `verify_jwt = false`** anywhere; non-provider functions (`bulk-onboard-users`, `onet-proxy`, `refresh-onet-cache`, `submit-assessment`) unchanged; `project_id` unchanged.
- **Tests:** import the production parser (not a copy); cover all 7 provider functions (guard-before-work) and all 7 authenticated `verify_jwt` assertions; parser fail-closed cases retained. Assertions tolerate whitespace/formatting (regex-based, window-based) yet still trip if a guard is moved after sensitive work. *Minor brittleness note (non-blocking):* the config regex `\[functions\.X\][\s\S]*?verify_jwt…` is not hard-anchored to the section boundary; harmless today because every provider section has `verify_jwt` immediately beneath it.
- **Documentation:** accurately distinguishes **containment** (this work) from **authentication** (verify_jwt), **consent** (not implemented), **authorization** (not implemented), and **quotas/abuse** (not implemented). Phase 1A D2 corrected. **No doc overstates Phase 1B as privacy compliance or production readiness** — both docs explicitly state consent/assent/quotas/record-authorization are out of scope.

## Defects found

- **Confirmed acceptance defect (fixed): `localize-careers` missing `verify_jwt`.** Resolved per Objective C.
- No other defects. No security regression (changes only add a fail-closed gate + strengthen JWT config; success paths unchanged when enabled).

## Tests executed & results

| Command | Result |
|---|---|
| Dependency-free structural verifier (7× guard-placement + 7× config `verify_jwt` + no-`false` + duplicate-section) | **57 passed, 0 failed** (Node v24.18.0) |
| `npx tsc --noEmit -p tsconfig.app.json` | 8 errors, **all pre-existing `TS2307` "Cannot find module" (`date-fns`, `embla-carousel-react`)** from the corrupt local `node_modules`; **none reference any Phase 1A/1B file** (demonstrably unrelated) |
| `git diff --check` | clean |
| `npx vitest run src/test/aiFeatureFlag.test.ts` | **Not runnable** — local `node_modules` is a broken partial install (`Cannot find package '.../debug'`); deps not repaired per scope. Run in CI: `npm ci && npx vitest run src/test/aiFeatureFlag.test.ts` |

## Three distinct decisions

- **Safe to commit:** **Yes.** Scoped (config + 7 functions + shared helper + test + docs), internally consistent, no secrets, no regression; verification passes and the only tooling failures are unrelated environment breakage.
- **Safe to deploy with AI disabled:** **Yes.** Deploy keeps `AI_FEATURES_ENABLED` unset → all 7 functions return `503`, no provider calls. Deploy also begins enforcing `verify_jwt=true` at the gateway for all 7 (desired; legitimate callers use `functions.invoke`, which sends the JWT).
- **Safe to enable AI (`AI_FEATURES_ENABLED=true`):** **No — not yet.** Requires runtime consent/assent (R9), per-user quotas/abuse controls (R4), executed legal/DPA pack (incl. Lovable-gateway, OpenAI, Anthropic sub-processors), and completion of the production checklist.

## Remaining production checks (pre-enable)

Per `remediation-phase-1b/01-production-verification-checklist.md`: confirm `verify_jwt=true` deployed for all 7; anonymous / anon-key-only / malformed / expired JWT → **401**; flag-off + valid JWT → **503** with **zero** usage across OpenAI/Anthropic/Lovable dashboards and **no** student payload in logs; rollback = unset flag (instant kill switch). Plus CI `npm ci && npx vitest …`.

## Git status conclusion

Tracked modifications: `supabase/config.toml` + 7 function `index.ts` files (+92 lines). Untracked additions: `supabase/functions/_shared/`, `src/test/aiFeatureFlag.test.ts`, `docs/professional-audit/` (plus pre-existing unrelated untracked items). **No migration created; no DB, production configuration, or environment variable changed; no dependency installed/upgraded; no OpenAI/Anthropic/Lovable request made; nothing deployed.** Changes remain **uncommitted**.
