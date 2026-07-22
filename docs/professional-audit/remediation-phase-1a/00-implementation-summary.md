# Phase 1A — AI Endpoint Containment: Implementation Summary

**Branch:** `fix/ai-endpoint-containment-phase1a` (off `main@01895eb`) · **Date:** 2026-07-22 · **Scope:** PF-001 + PF-002 containment only. Nothing deployed, no SQL, no provider calls, no dependency changes.

## Files changed

| File | Type | Change |
|---|---|---|
| `supabase/functions/_shared/aiFeatureFlag.ts` | **new** | Pure, fail-closed flag parser + disabled-response contract constants |
| `supabase/functions/career-coach/index.ts` | modified | Import shared flag; guard before `req.json()` / OpenAI call (+10 lines) |
| `supabase/functions/generate-parent-insight/index.ts` | modified | Same guard (+10 lines) |
| `supabase/config.toml` | modified | `verify_jwt = true` for `career-coach` and `generate-parent-insight` (+ explanatory comment) |
| `src/test/aiFeatureFlag.test.ts` | **new** | Vitest coverage: parser, disabled-contract, config assertions, source-structure |
| `docs/professional-audit/remediation-phase-1a/*` | new | This summary + production verification checklist |

No other tracked file was modified.

## R1 — Reproducible JWT enforcement

- `supabase/config.toml` now sets `verify_jwt = true` explicitly under `[functions.career-coach]` and `[functions.generate-parent-insight]`. Enforcement is no longer dependent on an undocumented Supabase dashboard default; it is version-controlled and reproducible on deploy.
- **Division of responsibility (documented, not duplicated):** JWT verification is enforced at the **Supabase gateway** (via `verify_jwt`), which rejects any request lacking a valid user JWT *before* the function code runs. The public anon key alone is not accepted as user authentication. The functions therefore do **not** re-implement JWT parsing in code (avoiding duplicate, drift-prone logic). Building the full per-student authorization model is explicitly out of Phase 1A scope (deferred to the Opus plan's Phase 2 / R4-R5).
- Other functions' `verify_jwt` state was intentionally **not** changed (out of scope; some — e.g. `onet-proxy`, `localize-careers` — may be intentionally public).
- **Dead code note:** `CHAT_URL` in `src/pages/StudentCoach.tsx:31` is a defined-but-unused raw-fetch constant; the live call path uses `supabase.functions.invoke('career-coach')` (`StudentCoach.tsx:126`), which attaches the user JWT. Left unchanged — it creates no bypass (it is never invoked). Flagged for a later cleanup, not modified here.

## R2 — Fail-closed AI feature flag

- New env flag **`AI_FEATURES_ENABLED`**. Parsed by `parseAiEnabled()` (`_shared/aiFeatureFlag.ts`): only the exact token `"true"` (case-insensitive, trimmed) enables AI. Missing / empty / `"false"` / malformed → **disabled**. Deliberately avoids `Boolean(env.get(...))` truthiness (`Boolean("false") === true` would fail open).
- The guard is placed in each function **immediately after the OPTIONS/CORS handler and before `await req.json()`** — so when disabled, the student payload is never parsed, never assembled into a provider payload, never logged, and no OpenAI/Anthropic request occurs.
- **Default behavior:** disabled. With no `AI_FEATURES_ENABLED` set (the production default this phase requires), both functions return the disabled response and make no external call.
  - **Scope correction (D2, resolved by Phase 1B):** Phase 1A disabled AI by default **only for the two initially guarded functions** (`career-coach`, `generate-parent-insight`). Other functions that call an external AI provider (`generate-synthesis` → Anthropic, `counselor-coach`/`parent-coach`/`admin-insights` → Lovable AI gateway, `localize-careers` → OpenAI) were **not** covered by Phase 1A. **Phase 1B** (`docs/professional-audit/remediation-phase-1b/`) extends the same fail-closed `AI_FEATURES_ENABLED` guard to all confirmed active provider-calling Edge Functions in the reviewed set. Even after Phase 1B, this containment does **not** implement consent, assent, quotas, or full record-level authorization.
- **No test-user bypass** was added. There is no `isTestUser` / email / query-param / hard-coded-email path. AI is off for everyone until `AI_FEATURES_ENABLED=true` is set in a controlled environment.

### Disabled response contract

- **Status:** `503 Service Unavailable` (`AI_DISABLED_STATUS`) — signals a deliberate, temporary "feature off" state, distinct from `401` (auth) and `500` (error).
- **Body:** `{ "error": "AI features are currently disabled." }` (`AI_DISABLED_BODY`) — no environment, key, provider, or flag details. CORS headers preserved.
- Client impact: `supabase.functions.invoke` surfaces non-2xx as an error; existing callers (`StudentCoach`, `ParentInsightReport`) already handle an error branch gracefully.

## Tests added

`src/test/aiFeatureFlag.test.ts` (fits the existing vitest architecture; `include: src/**`):
- **Parser (fail-closed):** undefined/null/empty/whitespace/`"false"`/`"FALSE"`/malformed → false; only `"true"` variants → true; explicit regression guard against `Boolean()` truthiness.
- **Disabled contract:** status is 503; body contains none of key/env/openai/anthropic/secret/token/flag.
- **R1 config:** `verify_jwt = true` present for both functions; **no** `verify_jwt = false` anywhere in `config.toml`.
- **R2 source-structure:** each function imports `parseAiEnabled` and the guard index precedes both `await req.json()` and the OpenAI `fetch(` — a regression tripwire if anyone moves the check below the payload/provider call.

## Commands executed & results

| Command | Result |
|---|---|
| `node --experimental-strip-types` verifier (real parser + config + source-structure, 24 assertions) | **24 passed, 0 failed** (Node v24.18.0; no node_modules needed) |
| `npx tsc --noEmit -p tsconfig.app.json` | Did **not** complete a clean pass — but **only** because the local `node_modules` is a corrupt/partial install (errors are all `Cannot find module 'date-fns' / 'embla-carousel-react'`). **No error references any file changed in this phase.** |
| `npx vitest run src/test/aiFeatureFlag.test.ts` | **Could not run** — vite-node startup error (`Cannot find package '.../node_modules/debug'`), same corrupt-install cause. |

## Limitations (honest)

- The local `node_modules` is a broken partial install; **installing/repairing dependencies is out of scope** for this phase, so `vitest` and a clean `tsc` could not be executed here. The parser logic, config, and source-structure were instead validated with a dependency-free Node type-stripping script (24/24 pass). The vitest suite must be run in CI (clean install) — see command below.
- Gateway `verify_jwt` runtime behavior (401 on missing/invalid JWT) cannot be proven locally; it is a Supabase platform behavior. See `01-production-verification-checklist.md` for the exact manual checks.

**CI / clean-environment command to run the added tests:**
```
npm ci && npx vitest run src/test/aiFeatureFlag.test.ts
npx tsc --noEmit -p tsconfig.app.json
```

## Confirmation

No provider (OpenAI/Anthropic) request was made. Nothing was deployed. No migration was created; no SQL was applied. No database or production setting was changed. No dependency was installed or upgraded. AI defaults to **disabled**. Both target functions have reproducible, version-controlled JWT requirements. Changes are staged on a branch and **not** committed.
