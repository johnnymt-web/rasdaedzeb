# Phase 1A — Production Verification Checklist

Run these manual checks **after deploying this branch** and **before ever setting `AI_FEATURES_ENABLED=true`**. No production secrets appear below. Use a **staging** project or a throwaway test account for the request checks; do not exercise paid providers against real student data.

Prerequisite for the JWT checks: know the project's public anon key and URL (both already public/bundled in the frontend) and be able to mint a normal user JWT (log in as a test account).

## 1. `verify_jwt=true` for `career-coach`
- Supabase Dashboard → Edge Functions → `career-coach` → confirm "Verify JWT" / enforce-JWT is **ON**.
- Cross-check: `supabase/config.toml` `[functions.career-coach]` has `verify_jwt = true`.

## 2. `verify_jwt=true` for `generate-parent-insight`
- Same as #1 for `generate-parent-insight`.

## 3. `AI_FEATURES_ENABLED` absent or false in production
- Dashboard → Edge Functions → Secrets (or `supabase secrets list`) → confirm `AI_FEATURES_ENABLED` is **not set**, or set to a non-`true` value.
- Expected: AI is disabled platform-wide.

## 4. Anonymous request is rejected (no Authorization header)
```
curl -i -X POST "$SUPABASE_URL/functions/v1/career-coach" \
  -H "Content-Type: application/json" -d '{"messages":[]}'
```
- **Expected:** HTTP `401` from the gateway (no function execution). If you get `503`, JWT enforcement is OFF (function ran and hit the flag) — fix `verify_jwt`. Repeat for `generate-parent-insight`.

## 5. Anon-key-only request is rejected (anon key, no user JWT)
```
curl -i -X POST "$SUPABASE_URL/functions/v1/career-coach" \
  -H "Authorization: Bearer $ANON_KEY" \
  -H "apikey: $ANON_KEY" \
  -H "Content-Type: application/json" -d '{"messages":[]}'
```
- **Expected:** HTTP `401`. The anon key must **not** be accepted as user authentication. Repeat for `generate-parent-insight`.

## 6. Malformed and expired JWTs are rejected
- Send `Authorization: Bearer not-a-jwt` → expect `401`.
- Send a known-expired user JWT → expect `401`.
- Repeat for both functions.

## 7. A disabled request creates no provider call (with a VALID user JWT, flag off)
```
curl -i -X POST "$SUPABASE_URL/functions/v1/career-coach" \
  -H "Authorization: Bearer $VALID_USER_JWT" \
  -H "Content-Type: application/json" -d '{"messages":[{"role":"user","content":"hi"}]}'
```
- **Expected:** HTTP `503` with body `{"error":"AI features are currently disabled."}`.
- Confirm in the OpenAI dashboard/usage that **no** request was recorded for this call. Repeat for `generate-parent-insight` (body e.g. `{"studentName":"Test","assessments":[]}`).

## 8. Logs contain no student payload (disabled path)
- Dashboard → Edge Functions → `career-coach` / `generate-parent-insight` → Logs for the #7 calls.
- **Expected:** no `reportContext`, no `studentName`, no `assessments`, no message content, no key/secret values. The disabled path returns before `req.json()`, so nothing should be logged.

## 9. Rollback steps
- **To re-disable AI instantly** (kill switch): unset `AI_FEATURES_ENABLED` (or set to `false`) in Edge Function secrets — takes effect on next invocation, no redeploy of code required.
- **To revert JWT config:** restore the previous `config.toml` (remove the two `verify_jwt = true` lines) and redeploy — *not recommended* (weakens the boundary).
- **To revert code:** this phase is on branch `fix/ai-endpoint-containment-phase1a`; do not merge, or revert the merge commit. The guard is additive and safe to keep even while AI stays disabled.

## 10. AI stays disabled until consent + assent exist
- Confirm no environment has `AI_FEATURES_ENABLED=true` for real users.
- **Do not enable** until runtime consent/assent enforcement (Opus plan R9 / `ai_processing_consent` + `has_ai_consent()`) is implemented, the legal pack is executed, and per-user quotas (R4) are in place. `AI_FEATURES_ENABLED=true` may be used **only** in an internal/staging environment with test data for verification.

---
### Interpreting results
- #4/#5/#6 return `401` → JWT enforcement working (gateway). `503` there instead → `verify_jwt` is OFF; correct it before anything else.
- #7 returns `503` + zero provider usage → fail-closed flag working.
- Any `200` with real AI content while the flag is unset → **stop**: the flag is not wired in that environment; re-check the deploy.
