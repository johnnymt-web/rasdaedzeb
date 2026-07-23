# Phase 1B — Production Verification Checklist

Run **after deploying this branch** and **before ever setting `AI_FEATURES_ENABLED=true`**. Use a **staging** project / throwaway test account. No secrets below. Covers every function modified in Phase 1A + 1B.

Modified provider functions:
`career-coach`, `generate-parent-insight` (1A) · `generate-synthesis`, `localize-careers`, `counselor-coach`, `parent-coach`, `admin-insights` (1B).

## A. Deployed `verify_jwt` status
For each of the six authenticated functions — `career-coach`, `generate-parent-insight`, `generate-synthesis`, `counselor-coach`, `parent-coach`, `admin-insights`:
- [ ] Dashboard → Edge Functions → function → "Verify JWT" is **ON**.
- [ ] Cross-check `supabase/config.toml` shows `verify_jwt = true` under its `[functions.<name>]`.
- [ ] `localize-careers`: confirm its intended posture (see D-note below). If it must be authenticated, add `verify_jwt = true`; if intentionally public, record the decision. It is flag-contained either way.

## B. Anonymous request rejection (no Authorization header)
For each of the six authenticated functions:
```
curl -i -X POST "$SUPABASE_URL/functions/v1/<function>" \
  -H "Content-Type: application/json" -d '{}'
```
- [ ] **Expected `401`** from the gateway (function code never runs). A `503` here means JWT enforcement is OFF — fix `verify_jwt`.

## C. Anon-key-only rejection (anon key, no user JWT)
```
curl -i -X POST "$SUPABASE_URL/functions/v1/<function>" \
  -H "Authorization: Bearer $ANON_KEY" -H "apikey: $ANON_KEY" \
  -H "Content-Type: application/json" -d '{}'
```
- [ ] **Expected `401`** for each authenticated function — anon key must not be accepted as user auth.

## D. Malformed and expired JWT rejection
- [ ] `Authorization: Bearer not-a-jwt` → `401` (each authenticated function).
- [ ] Known-expired user JWT → `401`.
- [ ] **`localize-careers` note:** if left public, B/C/D will NOT return 401 for it — that is expected only if the public contract is intended. Confirm the decision before enabling AI.

## E. Flag-off response (valid user JWT, `AI_FEATURES_ENABLED` unset/false)
For every modified function (all seven), with a valid JWT where required:
```
curl -i -X POST "$SUPABASE_URL/functions/v1/<function>" \
  -H "Authorization: Bearer $VALID_USER_JWT" \
  -H "Content-Type: application/json" -d '{ ...minimal body... }'
```
- [ ] **Expected `503`** with body `{"error":"AI features are currently disabled."}`.

## F. Zero provider usage while disabled
- [ ] After the Section E calls, confirm **no** requests recorded in the OpenAI dashboard, the Anthropic console, and the Lovable AI gateway dashboard for those invocations.

## G. No student payloads in logs (disabled path)
- [ ] Dashboard → each function → Logs for the Section E calls contain **no** `studentName`, `reportContext`, `assessments`, `studentId`, message content, or key/secret values. (The guard returns before body parsing and before any `console.log` of content.)

## H. Rollback procedure
- [ ] **Instant kill switch:** ensure `AI_FEATURES_ENABLED` is unset/`false` in Edge Function secrets → all seven functions return `503` on next invocation, no redeploy needed.
- [ ] **Revert JWT config:** restore previous `config.toml` and redeploy (not recommended — weakens the boundary).
- [ ] **Revert code:** changes are on branch `fix/ai-endpoint-containment-phase1a`; do not merge, or revert the merge commit. Guards are additive and safe to keep while AI stays disabled.

## I. Keep disabled until consent/assent + quotas
- [ ] Confirm no environment has `AI_FEATURES_ENABLED=true` for real users.
- [ ] Do **not** enable until runtime consent/assent (R9) + per-user quotas (R4) are implemented and the legal pack (incl. Lovable-gateway / OpenAI / Anthropic sub-processor DPAs) is executed. `true` may be used only in staging with test data for verification.

### Interpreting results
- B/C/D → `401` = gateway JWT enforcement working. `503` there instead = `verify_jwt` OFF; fix first.
- E → `503` + Section F zero usage = fail-closed containment working across all providers.
- Any `200` with real AI content while the flag is unset → **stop**: the flag is not wired in that environment; re-check the deploy.
