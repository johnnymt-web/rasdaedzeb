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

## 4. Tooling reality (verified this environment)
- ✅ **No local Node/npm/npx/supabase CLI.** Cannot run builds/tests/typecheck locally.
  Verification happens in **CI** (GitHub Actions) and via the **GitHub API**.
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
