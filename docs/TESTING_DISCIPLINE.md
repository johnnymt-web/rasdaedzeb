# Testing Discipline

> Competency 8 (testing discipline). Tags: ✅ verified · ⓘ inferred · ❓ unknown.

## 1. Why testing is critical here
Tests guard **minors' data** and **guidance quality**: assessment scoring, RLS, AI interpretation,
and deployment gates all affect students. A silent scoring or RLS regression can corrupt a student's
guidance or expose data. Treat tests + the typecheck gate as load-bearing.

## 2. Tooling ✅
- **Type checking:** `tsc --noEmit -p tsconfig.app.json` via `npm run typecheck`, run in CI (`Typecheck` workflow). **strict** is on.
- **Unit tests:** `vitest` via the `Test` workflow (`npx vitest run`).
- ⚠️ **No local Node** → you cannot run these locally; rely on **CI** (push to main / open a PR).
- Triggers: both workflows run on `push` to `main` and on `pull_request`. A plain push to a non-main branch does **not** run them — open a PR.

## 3. Current coverage (honest) ⓘ
- `supabase/functions/submit-assessment/scoring.test.ts` — **parity + rejection tests** for RIASEC/Skills/EQ scoring (the strongest tests). ✅
- `src/test/example.test.ts` — placeholder.
- **Coverage is otherwise thin** — RLS, auth flows, most services/components are not unit-tested. This is a known gap to expand.

## 4. Rules for Claude Code
- **Never merge with a red Typecheck.** Get it green (fix in rounds — annotations are capped ~10–12 per check, so more errors may surface after each round).
- **Scoring changes require parity:** add/extend tests with known inputs → expected outputs, and (for DB triggers) a read-only parity query diffing recomputed vs stored values before enabling.
- Keep `submit-assessment/scoring.ts` and the **inlined** scoring in `index.ts` **in sync** (duplication exists for testability — a change to one must update the other).
- After a fix that can't be locally verified, push → check CI via the GitHub API → iterate.
- Prefer adding tests for: scoring math, grade-band derivation, consent gating logic, RLS-helper expectations.

## 5. Verifying CI (no local tools) ✅
- `GET …/actions/runs?branch=<b>` → run status.
- `GET …/commits/<sha>/check-runs` → per-check conclusions + (capped) annotations.
- Read the failing annotations, fix, push, re-check.

## Related
`ASSESSMENT_SCORING_RULES.md` · `CLAUDE_CODE_WORKFLOW.md` · `DEPLOYMENT_AND_ENVIRONMENTS.md`
