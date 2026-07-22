# Phase 1B — External AI Egress Inventory & Implementation Summary

**Branch:** `fix/ai-endpoint-containment-phase1a` (continues Phase 1A; uncommitted) · **Date:** 2026-07-22 · **Scope:** extend the existing fail-closed `AI_FEATURES_ENABLED` guard to the remaining provider-calling functions named in the Phase 1A final review. No deploy, no SQL, no provider call, no dependency change.

## Function classification (the 5 named functions)

All five are **Active external AI egress**. Confirmed by reading each function's reachable handler.

| Function | Classification | Provider | Reachable call site | Data sent externally | Auth (`getUser`) | `verify_jwt` action | Flag now enforced |
|---|---|---|---|---|---|---|---|
| `generate-synthesis` | Active external AI egress | **Anthropic** (`api.anthropic.com/v1/messages`) | `index.ts:157`, `:197` via `callAnthropic`/`handleLegacy`, invoked inside `serve()` after guard | Normalized assessment dimension scores, `studentId` (UUID), grade band, free-text goals | Yes (`:287`) | **set `verify_jwt = true`** | ✅ |
| `localize-careers` | Active external AI egress | **OpenAI** (`api.openai.com/v1/chat/completions`) | `index.ts:46` | Career strings (titles/descriptions/tasks) + target lang — **career taxonomy text, not student PII** | No in-code `getUser()`, **but sole caller sends a JWT** (see below) | **set `verify_jwt = true`** (resolved in acceptance review) | ✅ |
| `counselor-coach` | Active external AI egress (via gateway) | **Lovable AI gateway** (`ai.gateway.lovable.dev`) | `index.ts:138` | Counselor chat messages + report/student context | Yes (`:97`) | **set `verify_jwt = true`** | ✅ |
| `parent-coach` | Active external AI egress (via gateway) | **Lovable AI gateway** | `index.ts:171` | Parent chat messages + child context | Yes (`:135`) | **set `verify_jwt = true`** | ✅ |
| `admin-insights` | Active external AI egress (via gateway) | **Lovable AI gateway** | `index.ts:127` | Admin/school analytics context | Yes (`:75`) | **set `verify_jwt = true`** | ✅ |

No function in the named set was classified "No external AI egress", "Dead/unreachable", or "Cannot confirm" — all five actively reach a provider.

## Functions modified

Guard added (import `parseAiEnabled`, `AI_DISABLED_BODY`, `AI_DISABLED_STATUS` from `../_shared/aiFeatureFlag.ts`; fail-closed check immediately after the OPTIONS branch, before any body parsing, auth resolution, prompt building, provider-client work, logging, or provider call):

- `supabase/functions/generate-synthesis/index.ts`
- `supabase/functions/localize-careers/index.ts` (uses its local `json()` helper for the disabled response → same `503` + `{"error":"AI features are currently disabled."}` body, CORS preserved)
- `supabase/functions/counselor-coach/index.ts`
- `supabase/functions/parent-coach/index.ts`
- `supabase/functions/admin-insights/index.ts`

`supabase/config.toml`: added `verify_jwt = true` for `admin-insights`, `counselor-coach`, `generate-synthesis`, `parent-coach` (joining `career-coach`, `generate-parent-insight` from Phase 1A). `localize-careers` deliberately left unset.

`src/test/aiFeatureFlag.test.ts`: extended to cover all seven provider functions (guard-before-work structural checks) and all six authenticated functions (`verify_jwt = true`), reusing the shared parser (not duplicated).

`docs/professional-audit/remediation-phase-1a/00-implementation-summary.md`: D2 corrected (scope caveat added).

## Functions NOT modified, and why

- No guard change to `submit-assessment`, `bulk-onboard-users`, `onet-proxy`, `refresh-onet-cache` — outside the named set; `onet-proxy`/`refresh-onet-cache` fetch O*NET (not an AI provider), `submit-assessment`/`bulk-onboard-users` make no provider call. Not touched.
- The shared helper `supabase/functions/_shared/aiFeatureFlag.ts` was reused unchanged (no second flag, no per-function flag).

## JWT configuration changes

Six provider functions now carry repository-controlled `verify_jwt = true` (all that resolve `auth.getUser()`). **`localize-careers` is the single unresolved JWT decision:** it has no `getUser()` and may be an intra-app/public utility; silently forcing `verify_jwt = true` could break a legitimate unauthenticated/inter-function caller, so its posture is left unset **and documented**. It is still fully contained by the fail-closed flag regardless of JWT. No function has `verify_jwt = false`. No duplicate/conflicting `[functions.*]` sections (single block, verified).

## Guard placement (uniform)

For every modified function the guard is the first statement after the `OPTIONS` preflight branch — verified that between `serve(async …)` entry and the guard there is **no** `req.json()`, **no** `auth.getUser()`, **no** provider `fetch(...)`, and **no** `handleLegacy(`/`callAnthropic(` call. So when disabled: no body parsed, no student data assembled or logged, no provider client/call, deterministic `503` with CORS preserved and no config disclosed. No client-controlled bypass (flag read only from `Deno.env`; no body/query/header/email/`isTestUser` path).

## Tests executed & results

| Command | Result |
|---|---|
| Node `--experimental-strip-types` structural verifier (7 functions × guard-placement + 6 × config `verify_jwt` + no-`false`) | **56 passed, 0 failed** (Node v24.18.0; dependency-free) |
| `npx tsc --noEmit -p tsconfig.app.json` | **8 errors, all pre-existing `TS2307` "Cannot find module" (`date-fns`, `embla-carousel-react`)** from the corrupt local `node_modules`; **none reference any Phase 1A/1B file** |
| `npx vitest run src/test/aiFeatureFlag.test.ts` | **Not executed** — local `node_modules` is a broken partial install (vite-node cannot load `debug`); dependencies were not repaired per scope. Must run in CI. |

**CI / clean-env command:** `npm ci && npx vitest run src/test/aiFeatureFlag.test.ts && npx tsc --noEmit -p tsconfig.app.json`

## Unresolved questions

1. ~~`localize-careers` JWT posture~~ **RESOLVED (acceptance review):** its only caller (`src/services/onetService.ts:431`) uses `supabase.functions.invoke()` from authenticated sessions, which already attaches the user JWT; `verify_jwt = true` is now set and breaks no caller. (All 7 provider functions now carry `verify_jwt = true`.)
2. **Lovable gateway data-flow** — `counselor-coach`/`parent-coach`/`admin-insights` egress via `ai.gateway.lovable.dev` (a third-party AI proxy); the sub-processor/DPA implications are a legal-review item (out of Phase 1B scope), but egress is now contained by the flag.
3. Runtime gateway `verify_jwt` behavior (401 on missing/invalid JWT) and flag-off `503`-with-zero-provider-usage require post-deploy verification — see `01-production-verification-checklist.md`.

## Confirmation

No OpenAI / Anthropic / Lovable-gateway request was made. Nothing was deployed. No migration created; no SQL applied. No database or production configuration changed. No environment variable set in any environment. No dependency installed or upgraded. All changes are additive containment, staged on a branch, **not committed**.
