# Phase 1A — Final Change Review

**Reviewer:** independent security review · **Date:** 2026-07-22 · **Branch:** `fix/ai-endpoint-containment-phase1a` (uncommitted) · **Mode:** review-only, no files modified.

## Verdict: **Accept with conditions**

The two in-scope functions (`career-coach`, `generate-parent-insight`) are correctly and safely contained. **Safe to commit.** **Not yet safe to deploy as PF-001 containment**, because the flag does not cover all provider-calling functions (notably `generate-synthesis` → Anthropic). Conditions below.

## Files reviewed (complete files, not just diffs)

- `supabase/config.toml`
- `supabase/functions/_shared/aiFeatureFlag.ts`
- `supabase/functions/career-coach/index.ts`
- `supabase/functions/generate-parent-insight/index.ts`
- `src/test/aiFeatureFlag.test.ts`
- `docs/professional-audit/remediation-phase-1a/00-implementation-summary.md`, `01-production-verification-checklist.md`

## Acceptance questions — findings

| # | Question | Result |
|---|---|---|
| 1 | Both functions `verify_jwt = true` | ✅ `config.toml:10-11, 15-16` |
| 2 | No other function config changed | ✅ All 11 function blocks intact; only the two scoped got `verify_jwt`; others untouched (added blank lines/comment only) |
| 3 | `AI_FEATURES_ENABLED` fails closed | ✅ `parseAiEnabled` returns false for non-string and anything ≠ `"true"` |
| 4 | Only trimmed, case-insensitive `"true"` enables | ✅ `raw.trim().toLowerCase() === "true"` |
| 5 | Guard precedes `req.json()` / provider / prompt / logging / AI call | ✅ In both files the guard is the first statement after OPTIONS, before `req.json()`, prompt building, `console.log`, and `fetch(...openai...)` |
| 6 | Disabled preserves CORS | ✅ `{ ...corsHeaders, 'Content-Type': 'application/json' }` |
| 7 | Disabled response exposes no config | ✅ Body `{ error: "AI features are currently disabled." }`; no key/env/flag/provider strings |
| 8 | No client-controlled bypass | ✅ Flag read only from `Deno.env`; no request body/header/query influence; no `isTestUser`/email path |
| 9 | No alternate reachable path bypasses guard | ✅ Single `serve()` handler each; OPTIONS returns CORS only (no provider call); no other export/entry |
| 10 | Test uses the real production parser | ✅ Imports `parseAiEnabled`/`AI_DISABLED_BODY`/`AI_DISABLED_STATUS` from `../../supabase/functions/_shared/aiFeatureFlag` — not a duplicate |
| 11 | Test compatible with Vitest + TS config | ✅ Under `src/**` (vitest `include`); **tsc confirms zero errors** for the test and helper (see results) |
| 12 | No source change exceeds Phase 1A scope | ✅ 3 tracked files (+30 lines), 2 new files, 2 docs; no migrations, no unrelated code |
| 13 | No secret / real env value committed | ✅ `config.toml` holds only the already-public `project_id`; checklist uses `$PLACEHOLDERS`; no `.env` staged |
| 14 | Documentation accurate | ✅ Matches implementation (guard-before-payload, 503, fail-closed, broken-node_modules limitation) — with one omission, see Defects |
| 15 | Production checklist sufficient | ✅ Covers 401 vs 503 disambiguation, anon/anon-key/malformed/expired JWT, disabled-path no-provider-call + no-payload-logging, rollback, keep-disabled |

## Confirmed strengths

- **Fail-closed parser is exemplary**: explicitly rejects the `Boolean("false") === true` trap; pure/testable; single source shared by both functions.
- **Guard placement is correct**: executes before the student payload is even parsed — so when disabled, nothing is read, logged, or sent.
- **Kill-switch semantics**: unset flag → instant disable on next invocation, no redeploy required (good incident-response property).
- **JWT config is reproducible** and scoped to exactly the two functions; no collateral change to intentionally-public functions.
- **Clean separation of duties** (gateway JWT vs in-code flag) documented rather than duplicated.

## Defects found

**None blocking commit** in the reviewed files. Two items to record:

- **D1 (Medium, scope/completeness — deployment condition, not a code defect):** The containment flag covers only 2 of the functions that call an external AI provider. Verified across all edge functions: `generate-synthesis` (**Anthropic**, sends student scores + `studentId` + goals) and `localize-careers` (provider, career-taxonomy text — low PII) still call providers **with no `parseAiEnabled` guard**. R2's stated objective ("prevent **all** OpenAI and Anthropic provider calls") is therefore **not** achieved platform-wide, and PF-001 (external processing of minors' data) is **not fully contained** by deploying Phase 1A alone — the primary student report-synthesis path (`generate-synthesis`) remains live. This matches the task's named 2-function scope, so it is a *scope limitation to carry into Phase 1B*, but it is material to any "AI is disabled" claim.
- **D2 (Low, doc accuracy):** `00-implementation-summary.md` states AI "defaults to disabled" without noting that this is true only for the two guarded functions; `generate-synthesis` et al. are unaffected. Recommend a one-line scope caveat. (Non-blocking.)

## Security regressions

**None.** The changes only add a fail-closed gate and strengthen JWT enforcement. No existing auth, RLS, or data-flow control is weakened. The two functions' success paths are unchanged when the flag is enabled.

## Test results

| Command | Result |
|---|---|
| `npx tsc --noEmit -p tsconfig.app.json` | Ran. **8 errors total, all `TS2307` "Cannot find module" (`date-fns`, `embla-carousel-react`)** from the corrupt local `node_modules` — **all in pre-existing files; zero reference any Phase 1A file.** `process`/`node:fs` never flagged → the test typechecks under the repo config. |
| Node `--experimental-strip-types` verifier (real parser + config regex + source-structure, 24 assertions) | **24 passed, 0 failed** (Node v24.18.0; no node_modules needed). |
| `npm ci` / `npx vitest run src/test/aiFeatureFlag.test.ts` | **Not executed.** Local `node_modules` is a broken partial install (vite-node cannot load `debug`). Per instructions I did not repair/reinstall dependencies during review. Vitest must run in CI. |

## Unresolved runtime checks (pre-deploy)

1. Gateway returns **401** for anonymous / anon-key-only / malformed / expired JWT on both functions (platform behavior — not testable from repo).
2. Flag-off + valid JWT returns **503** with **zero** OpenAI usage and no payload in logs.
3. `npm ci && npx vitest run src/test/aiFeatureFlag.test.ts` green in a clean environment.
4. Deploy-time behavior change: `verify_jwt=true` will begin enforcing JWT at the gateway for these two functions on deploy (intended; confirm no legitimate caller relied on unauthenticated access — the client uses `functions.invoke`, which attaches the JWT, so expected safe).

## Commit / deploy readiness

- **Safe to commit:** **Yes.** Scoped, correct, no secrets, no regressions; test + typecheck evidence supports the two functions. Broken local tooling is an environment issue, not a change defect.
- **Safe to deploy:** **Not as standalone PF-001 containment.** Deploying is safe *technically* (it only adds a gate + JWT enforcement) and can ship, but it must **not** be represented as "AI/external processing is disabled" until D1 is resolved, because `generate-synthesis` still sends minors' data to Anthropic.

## Required actions before commit

- None blocking. Optional: address D2 (one-line scope caveat in the summary).

## Required actions before deployment

1. **Resolve D1 (Phase 1B):** extend the `AI_FEATURES_ENABLED` guard to `generate-synthesis` and review/guard `localize-careers`, and confirm `counselor-coach`/`parent-coach`/`admin-insights` provider egress (they did not match the OpenAI/Anthropic literal-domain grep — verify their egress path) — so "AI disabled" is true for all functions that process student data.
2. Run the CI test command (unresolved check #3).
3. Complete `01-production-verification-checklist.md` (unresolved checks #1, #2, #4), especially confirming `verify_jwt` yields 401 and flag-off yields 503 with no provider usage.
4. Keep `AI_FEATURES_ENABLED` unset in production until runtime consent/assent (R9) + quotas (R4) exist.
