# CLAUDE.md — Project Constitution (read me first)

> Auto-loaded each Claude Code session. This is the **entry point** to the Project
> Knowledge System in `docs/`. Read the linked docs before non-trivial work.
> Tags used everywhere: **✅ verified** (checked against live/remote/source this is true) ·
> **ⓘ inferred** (from code/config, not directly confirmed) · **❓ unknown**.

## 1. What this project is
**Pathfinder / "Super Riasec"** — a **school-based career-development ecosystem for grades 7–12**
serving Georgian-speaking students, parents, counselors, and school admins. It handles
**minors' personal data**, **psychometric/career-assessment results**, **AI-generated
interpretation**, role-based access, and **third-party AI data processing**. ✅

This is **not a generic web app**. Treat every change through the lens of: *minors' data
protection, assessment integrity, age-appropriate guidance, and school-grade security.*

- Live app: `rasdaedzeb.vercel.app` (▲ Vercel) · GitHub: `johnnymt-web/rasdaedzeb`
- Supabase project ref: `sxhzxlfxfveidjrepvwe` (🟢 Supabase)

## 2. The nine competencies (apply all of them)
1. **Full-stack architecture** → `docs/ARCHITECTURE.md`
2. **Supabase/RLS security** → `docs/SECURITY_PRIVACY_RULES.md`
3. **Career-development domain** → `docs/DOMAIN_CAREER_DEVELOPMENT.md`
4. **Assessment integrity** → `docs/ASSESSMENT_SCORING_RULES.md`
5. **Minor-data privacy** → `docs/SECURITY_PRIVACY_RULES.md`
6. **AI integration safety** → `docs/AI_INTERPRETATION_RULES.md`
7. **Georgian localization** → `docs/LOCALIZATION_GEORGIAN.md`
8. **Testing discipline** → `docs/TESTING_DISCIPLINE.md`
9. **Deployment governance** → `docs/DEPLOYMENT_AND_ENVIRONMENTS.md`
- **Operating procedure** (how to work here) → `docs/CLAUDE_CODE_WORKFLOW.md`
- **Current status (living)** → `docs/CURRENT_PROJECT_STATUS.md` ← check this every session.

## 3. Non-negotiable safety rules (the "Phase-12" rules)
You may **directly** fix: typos, obvious TS errors, broken imports, small non-destructive
UI/validation, comments, clearly-safe refactors, documentation.

You must **explain → propose → get approval → stage** before:
- weakening or changing **RLS**, **authentication**, **authorization**, **roles**, or **privacy**;
- modifying **database schema / migrations**, **role logic**, **RLS policies**;
- changing **AI data handling** or **student-data visibility**;
- anything touching **minors' data exposure**.

Never, without an explicit human "go":
- apply a **production migration**, **RLS change**, or **RLS lockdown**;
- **merge to main**, **deploy to production**, remove a **`HOLD_`** prefix;
- **backfill/rewrite historical data**;
- deploy the **consent/DPA** system to prod;
- expose the **service-role key** or any secret to the frontend.

When in doubt: **stop and ask.** Approval in one context does not extend to the next.

## 3.1 Guard-Denial Response Contract

Operative form of architecture §20.7 (its controlling authority).
Applies to every session, base agent and skills alike.

A PreToolUse guard denial ends the current autonomous turn at once.
After a denial, do not:

- retry, reword, or re-wrap the command;
- attempt an equivalent outcome by any path;
- use another tool or interpreter to route around the guard;
- continue implementation autonomously.

A denial is the safety boundary working, not a transient error.
Classify each denial and stop:

- Case A, expected gate denial: the rule is a gated mutation.
  Emit the sanitized packet and STOP for owner action.
- Case B, unexpected denial: the action was meant to be allowed.
  Emit the packet, note a possible guard defect, request a new
  bounded diagnostic scope, and STOP.
- Case C, repeated or equivalent attempt: treat the retry as an
  orchestration failure and STOP.

Any further work needs a new owner-authorized continuation. It
must not continue the denied turn autonomously.

Emit this sanitized packet when you stop:

```
GUARD-DENIAL DECISION
CASE        : A | B | C
RULE        : guard rule tag, verbatim
REASON      : concise, sanitized
ATTEMPTED   : action category only
GATE        : HUMAN GATE 1 | HUMAN GATE 2 | n/a
OWNER DECISION REQUIRED : the human decision needed
NEXT SAFE ACTION        : one non-mutating step, or await owner
RETRY       : NONE
```

Never include raw commands, secrets, credentials, tokens, sensitive
paths, or unrelated command content. Use the action category only.

## 4. Tooling reality (verified this environment)
- ✅ **Node v24 + npx are present**; `tsc --noEmit` and `vitest` run **locally**. Prefer local
  verification (tsc / vitest / dependency-free structural checks); **CI** (GitHub Actions) remains
  the gate of record. **No Supabase / Vercel / GitHub CLI** installed.
- ✅ Git is **not on PATH**; use `C:\Program Files\Git\cmd\git.exe`.
- ✅ SQL is applied by the **owner in the Supabase SQL Editor** (not via CLI). Provide SQL; do not assume you can run it.
- ✅ Deploys: **Vercel** auto-deploys `main`; **edge functions** deploy via the `Deploy Supabase Edge Functions` Action on push to `main`.
- ✅ CI gates: **Typecheck** (`tsc --noEmit`) + **Test** (vitest), run on push-to-main and PRs.
- PowerShell shell (Windows). Use `;`/`if ($?)` to chain (no `&&`).

## 5. Communication norms
- ✅ Chat in **Georgian** by default (owner preference).
- ✅ **Label every action with its platform**: 🟦 GitHub / 🟢 Supabase / ▲ Vercel / 🖥️ terminal.
- Report outcomes faithfully: verified vs inferred vs unknown; if a test failed, say so.

## 6. How to start any session
1. Read `docs/CURRENT_PROJECT_STATUS.md` (what's live / branch-only / gated / unknown).
2. Identify which competencies the task touches; read those docs.
3. If the task touches RLS/auth/migrations/minor-data/AI → follow §3 (explain → approve → stage).
4. Prefer the dedicated file/search tools; verify claims against source before asserting.

## 7. Orchestration governance (Claude Code)
**Controlling spec (authoritative, do not redesign):** `docs/claude-orchestration/01-approved-orchestration-architecture.md`.
**Machine-readable finding state:** `docs/professional-audit/STATE.json` (validate with `docs/professional-audit/state-validator.mjs`).
- ✅ **`.claude/` is the canonical** Claude Code config. `.agents/`, `.codex/`, `AGENTS.md` are **legacy/non-canonical** — leave untouched.
- **Autonomy L0–L3:** L0 read / L1 local-reversible = autonomous. **L2** (RLS, SECURITY DEFINER, scoring, AI-authz, psychometric interpretation, consent/safeguarding, migrations) = discovery+architecture → **HUMAN GATE 1** → implement → **independent review** → stop. **L3** (merge, deploy, prod SQL, **any `git push`**, AI enablement, real-data) = **HUMAN-ONLY**. When unsure, classify **up**.
- **Production/external mutation is human-only.** **No autonomous `git push` on any branch** (GCM makes push a live prod path). Never `git add .` / `-A` — stage explicit paths only.
- **Evidence before closure** (E0/E1/E2/E3/E4-C/E4-B; E1/E2 are **not** production proof; E4-C ≠ E4-B). **No silent closure:** implementer max = `IMPLEMENTED`; `PRODUCTION_VERIFIED` / `CLOSED` are **owner-controlled** (an `actor:"human"` value is **not** proof of human authorization).
- **AI stays disabled** until separately governed; enabling `AI_FEATURES_ENABLED` is human-only.
- **PowerShell/Windows is a first-class execution surface** (safety guard + tests must cover it).
- Changes to orchestration **safety config** (`.claude/settings*.json`, `.claude/hooks/**`, `.mcp.json`, `STATE.json` + validator) are **human-only**.
