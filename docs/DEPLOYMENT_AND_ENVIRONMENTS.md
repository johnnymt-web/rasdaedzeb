# Deployment & Environments (Governance)

> Competency 9 (deployment governance). Tags: ✅ verified · ⓘ inferred · ❓ unknown.

## 1. Environments ✅
| Env | What | Source of truth |
|---|---|---|
| **Local** | working copy `…/Super Riasec` | git |
| **GitHub** | `johnnymt-web/rasdaedzeb` | remote branches/PRs/Actions |
| **Vercel** | **two projects** (`rasdaedzeb` + `super-riasec`), both auto-deploy `main` to Production | ⚠️ intentional duplication (owner-confirmed) |
| **Supabase** | project `sxhzxlfxfveidjrepvwe` (DB + Auth + Edge Functions) | live DB / dashboard |

## 2. Deploy flows ✅
- **Frontend → Vercel:** push to `main` → both Vercel projects build & deploy Production.
- **Edge functions → Supabase:** push to `main` → GitHub Action `Deploy Supabase Edge Functions` runs `supabase functions deploy`.
- **Migrations → Supabase:** **applied MANUALLY** by the owner in the SQL Editor (not via the Action). This is the main drift source.
- CI gates on `main`/PRs: **Typecheck** + **Test** (vitest).

## 3. Branch → environment mapping
- `main` → Production (Vercel + functions).
- Other branches → Vercel **Preview** deployments; CI runs on PRs. No prod impact.

## 4. ⚠️ Known gotchas (learned the hard way) ✅
1. **Edge-function local imports can fail to bundle.** `submit-assessment` boot-crashed (500 `EDGE_FUNCTION_ERROR`, no logs) because `import ./scoring.ts` wasn't bundled. **Fix:** inline / keep functions self-contained. Symptom of a boot crash = none of your `console.log`s appear.
2. **Cold starts.** First call after idle (boot + remote module fetch) can exceed a short client timeout → false "could not sync". Client submit timeout was raised 15s→45s. (❓ verify live.)
3. **Migration drift / non-reproducibility.** The repo `migrations/` folder also contains legacy untracked seed SQL (`QUICK_SETUP.sql`, `CONSOLIDATED_GUIDANCE_SETUP.sql`, `DB_HEALTH_RECOVERY.sql`, `SCHEMA_FIX.sql`); the **`Supabase Preview` check fails on `main`** — the DB cannot be cleanly rebuilt from the folder. Live DB is correct; the folder is not a faithful source of truth.
4. **Live-only fixes not captured.** The `notify_counselor_on_assessment` trigger fix was applied in the SQL Editor only — **not in a repo migration** (drift to close).
5. **Enum add gotcha.** `ALTER TYPE … ADD VALUE` must be its own migration (separate transaction from any use of the new value).

## 5. Deploy ordering rules
- DB schema that a function depends on (e.g. new columns) must be **applied before** the function/client that uses it goes live, or the function errors.
- RLS lockdown that blocks client writes must come **after** the server-write path is verified.

## 6. Env vars ✅
- Frontend (Vite, build-time): `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`, `VITE_SUPABASE_PROJECT_ID`. Per-environment in Vercel; rebuild after changing.
- Edge functions: Supabase auto-injects `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`. Provider keys (`ANTHROPIC_API_KEY`, `OPENAI_API_KEY`, `LOVABLE_API_KEY`) set as function secrets. **Never expose to frontend.**

## Related
`CLAUDE_CODE_WORKFLOW.md` · `ARCHITECTURE.md` · `CURRENT_PROJECT_STATUS.md`
