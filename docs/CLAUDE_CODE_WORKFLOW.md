# Claude Code Workflow (Operating Procedure)

> Level 5 (Operating Procedure). Tags: ✅ verified · ⓘ inferred · ❓ unknown.

## 1. Environment constraints (verified) ✅
- **No local Node/npm/npx/supabase CLI.** You cannot run build/test/typecheck locally.
- Git not on PATH → use `C:\Program Files\Git\cmd\git.exe`.
- PowerShell (Windows 5.1): no `&&`/ternary; chain with `;` and `if ($?) { … }`.
- SQL is run by the **owner in the Supabase SQL Editor** — provide copy-paste SQL.
- Verification is via **CI + GitHub API** (read run/check status), not local execution.

## 2. Branch & PR conventions ✅
- Trunk = `main` (auto-deploys to prod). **Never commit directly to `main` for risky changes; never merge without approval.**
- Feature branches: `feat/…`, `fix/…`, `docs/…`, `chore/…`. One concern per branch — **do not mix** docs, migrations, Phase B, consent, typecheck, refactor.
- `HOLD_<timestamp>_*.sql` = a migration that must **not** auto-apply; drop the prefix only on approval.
- Open a PR to run CI (Typecheck + Test on `pull_request`). A plain push to a non-main branch does **not** trigger them.

## 3. Approval gates (stop-and-ask) — from CLAUDE.md §3
Explain → propose → approve → stage before any RLS/auth/role/schema/migration/minor-data/AI-data change.
Hard stops (need explicit "go"): prod migration, RLS lockdown, merge to main, prod deploy, `HOLD_` removal, backfill, consent prod rollout.

## 4. How to apply changes
- **Code:** edit on a branch → push → open PR → confirm CI green → (gated) merge.
- **SQL/migrations:** write the migration file in repo **and** hand the owner exact SQL for the SQL Editor. Note: migrations are applied **manually** here (drift risk — see DEPLOYMENT doc).
- **Edge functions:** deploy via push to `main` (Action). ⚠️ Keep functions **self-contained** — a local `import ./x.ts` broke `submit-assessment`'s boot; scoring was inlined to fix it.
- **Frontend:** deploys via Vercel on push to `main`.

## 5. Verifying without local tools ✅
- CI status: GitHub API `…/actions/runs?branch=<b>` and `…/commits/<sha>/check-runs`.
- Typecheck failures: fetch check-run annotations (note: GitHub caps ~10–12 annotations → fix in rounds).
- Edge-function errors: ask the owner for the Supabase Edge Function **Logs** (console output / `event_message`) or the Network **Response** body; or add temporary `console.log` and redeploy.
- DB facts: read-only introspection run by the owner (or a short-lived token, revoked immediately).

## 6. Testing discipline (summary; full → TESTING_DISCIPLINE.md)
- Keep the **Typecheck** gate green; never merge red.
- Scoring changes require **parity tests/validation**.
- Treat CI as the source of truth for build/test health.

## 7. Communication ✅
- Default to **Georgian** in chat.
- **Label every action**: 🟦 GitHub / 🟢 Supabase / ▲ Vercel / 🖥️ terminal.
- Report verified vs inferred vs unknown; if something failed, say so with the evidence.

## 8. Maintain the knowledge system
After any major change, update `docs/CURRENT_PROJECT_STATUS.md` (see its maintenance rule).

## Related
`CLAUDE.md` · `DEPLOYMENT_AND_ENVIRONMENTS.md` · `TESTING_DISCIPLINE.md` · `SECURITY_PRIVACY_RULES.md`
