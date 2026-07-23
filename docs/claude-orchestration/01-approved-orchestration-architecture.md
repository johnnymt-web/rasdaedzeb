# Approved Claude Code Orchestration Architecture

```text
Status: APPROVED
Role: Controlling architecture specification
Applies to: Phase O2 and subsequent Claude Code orchestration work

This document incorporates and supersedes conflicting architecture decisions in
earlier Phase O1 / Phase O1.1 drafts.

Phase O2 must implement this architecture rather than redesign it, except where a
verified technical incompatibility makes an approved decision impossible.
```

**Project:** Pathfinder / "Super Riasec" — school career-development ecosystem, grades 7–12, minors' personal + psychometric data. AI currently **disabled** and remains disabled until explicit human governance sign-off.
**Verified environment (Phase O1.1):** Claude Code **2.1.186**; Node **v24.18.0** + npx **11.16.0** present; Windows/OneDrive host; PowerShell primary shell; Git at `C:\Program Files\Git\cmd\git.exe` (not on PATH); Supabase MCP configured **read-only + needs-auth**; **no** Supabase/Vercel/GitHub CLI; **no** prod tokens in env; **`git credential.helper=manager` (GCM) → `git push` has a live authenticated path**.

**Decision-status legend:** **APPROVED** (implement as written) · **PHASE O2 PROBE REQUIRED** (verify capability at bootstrap, then use it or the named fallback) · **DEFERRED** (do not build now) · **HUMAN-ONLY** (an owner action; no autonomous execution).

---

## 1. Mission & Design Principles

**Mission.** Maximize safe autonomous execution inside explicitly bounded local development workflows while preserving human authority over production, security architecture, high-impact scientific/psychometric changes, minor-data governance, AI governance, educational meaning, and merge/deploy decisions. The human is a decision/architecture/governance/production **authority**, not a workflow controller, prompt writer, test coordinator, or debug-loop manager.

**Design principles (APPROVED):**
1. Native Claude Code before external frameworks.
2. Deterministic enforcement before prompt-only enforcement.
3. **Capability/credential absence before prohibition** — an absent capability is stronger than a forbidden one.
4. Human authority at production and high-impact gates.
5. Evidence before completion claims; scientific/educational correctness equals engineering correctness for student-facing meaning.
6. Independent review for high-impact changes; no self-certification.
7. Risk-driven reviewer routing; minimal sufficient orchestration.
8. Child safety and student agency are architecture requirements.
9. Autonomy reduces repetitive prompting, not accountability.

**Chosen architecture (APPROVED):** *Native Claude Code + a thin project-specific control layer* (Option B). No heavy framework, no competing orchestration engine.

---

## 2. Autonomy Model (L0–L3) — APPROVED

| Level | Scope | Examples | Autonomy | Gate |
|---|---|---|---|---|
| **L0 Read/Analysis** | discovery, audit, evidence gathering | this spec; repo-wide search | Full | none |
| **L1 Local reversible** | docs, targeted tests, low-risk UI/typo, comments, clearly-safe refactor | phase-doc updates, structural tests | Full, bounded | none (self-verify + evidence) |
| **L2 High-impact local** | RLS, SECURITY DEFINER, scoring, AI authorization, psychometric interpretation, consent/safeguarding, cross-school ACL, migrations | PF-002/003 and prior PF-011/012/013/007 | Segmented (see §3) with mandatory human approval + independent review | GATE 1 + reviewer |
| **L3 External/production** | merge, deploy, production SQL, **any `git push`**, secrets, AI enablement, real-data mutation | apply migration, push to any remote | **None** | GATE 2 (HUMAN-ONLY) |

**Classifier rule (APPROVED):** conservative / fail-up — a task that touches any L2 surface is treated as L2; an L1 task discovered to touch an L2 surface auto-promotes.

---

## 3. Segmented L2 Lifecycle, Human Gates & `/goal` Strategy

No autonomous process may cross a human gate. L2 runs in three segments separated by owner action.

```
OWNER TASK
   │  /rz-prime (fork, read-only) → context packet {branch, risk_class, autonomy, files, STATE, E-reqs}
   ▼
RISK CLASSIFIER
   ├── L0 ─► autonomous analysis (no gate)
   ├── L1 ─► autonomous bounded work → rz-verify (E1/E2) → propose STATE: IMPLEMENTED/Done
   └── L2 ─► SEGMENT 1: discovery → architecture → acceptance criteria → STOP
                     ╔══════════ HUMAN GATE 1 — architecture approval (HUMAN-ONLY) ══════════╗
             SEGMENT 2: implement → test → debug → retest → rz-verify (evidence pkg)
                        → independent reviewer subagent → STOP
                     ╔══════════ HUMAN GATE 2 — external/production (HUMAN-ONLY) ═════════════╗
             SEGMENT 3: merge / deploy / production SQL → production verification (E4-C/E4-B)
                        → human-authorized CLOSED
```

**HUMAN GATE 1 (APPROVED, HUMAN-ONLY):** architecture + acceptance criteria approval before any implementation. `rz-remediate` ends Segment 1 and **emits** the exact next command for the owner to launch Segment 2.

**HUMAN GATE 2 (APPROVED, HUMAN-ONLY):** merge to `main`, deploy, production SQL, **any `git push`**, AI enablement, real-data mutation. Never autonomous.

**`/goal` — status: VERSION-SUPPORTED; LOCAL INVOCATION TO BE VERIFIED DURING PHASE O2 (PHASE O2 PROBE REQUIRED).** The architecture **does not depend on `/goal`.**
- Pre-gate discovery/architecture always ends at GATE 1.
- After approval, `/goal` **may** drive the bounded Segment-2 implement/test/debug work **if** local invocation is verified in O2; **otherwise** the owner runs the equivalent bounded normal task from the emitted command.
- A skill never programmatically invokes `/goal`; it emits a ready-to-paste command with **machine-checkable** completion criteria (e.g., `tsc` clean + `vitest <file>` green + verifier N/N + rz-verify evidence written; no merge/deploy/SQL; stop at review handoff).
- **`/goal` must NOT be used for:** unresolved architecture; crossing GATE 1 or 2; production/merge/deploy/SQL; scientific/governance approval; open-ended research without bounded criteria.

**Execution hierarchy (APPROVED):** (1) `/goal` for bounded implement/test/debug (probe-gated, emit-as-command); (2) `/loop` (VERIFIED available) for periodic *monitoring only* — never wraps a remediation; (3) hooks for deterministic tool policy; (4) dynamic workflows / agent-teams **DEFERRED** (repo-wide parallel audits only); (5) external loop frameworks **DEFERRED**.

---

## 4. PRIME / Context-Routing Architecture — APPROVED

`/rz-prime <finding|task>` — a project **skill** in a **forked, read-only** context (a *router, not a loader*). It must **not** recursively read the repo or the full audit history. It emits a compact packet:

```
PROJECT: Pathfinder (minors, grades 7–12, AI disabled)
BRANCH: <current> | main=<sha> | working tree clean? <git status --short count>
FINDING: PF-XXX | risk_class: [..] | autonomy: L?
STATE (from STATE.json): architecture/impl/review/preview/prod status + evidence_level
RELEVANT FILES (3–5, from finding-index): <paths>
RELEVANT MIGRATIONS/TESTS: <paths>
SAFETY BOUNDARY: L3 forbidden; guard active; MCP read-only; no autonomous push
EVIDENCE REQUIRED TO CLOSE: <E-set for this finding type>
```

Inputs: `STATE.json` + `finding-index.md` (built once in O2). Cross-session continuity comes from `STATE.json`, **not** opaque agent memory.

**Version-compatibility note (PHASE O2 PROBE REQUIRED):** do not use Claude Code skill frontmatter/options unsupported by 2.1.186. In particular, **do not add `background: false` to force blocking for `context: fork`** if that field is version-unsupported or unnecessary — probe skill frontmatter support first and use the smallest working form.

---

## 5. Risk Classification & Reviewer Routing — APPROVED

`rz-prime` tags risk dimensions; `rz-remediate` routes to the **minimum** reviewer set.

| Change type | Required review |
|---|---|
| UI / typo / docs | self + evidence (L1) |
| RLS / ACL / SECURITY DEFINER / migration | **security-db reviewer** |
| Assessment scoring / integrity | security-db (integrity) + **career-science reviewer** |
| Career interpretation / student-facing wording | **career-science + privacy-safeguarding** |
| AI recommendation / provider egress | security-db + privacy-safeguarding + career-science + **human AI-governance gate** |
| Consent / assent / parent access | **privacy-safeguarding reviewer** |
| Accessibility | engineering (career-science if student-facing meaning) |
| Merge / deploy / production / push | **HUMAN (GATE 2)** |

Principle: risk-driven, not reviewer-heavy — most tasks route to zero or one reviewer; only AI work fans out to three + a human gate.

---

## 6. Independent-Review Model — APPROVED

High-impact work is never self-certified by the implementing context.

- **Reviewer inputs (only):** finding ID · approved architecture doc · **raw `git diff`** · touched source/migration files · tests · **raw** command/verifier output · evidence artifacts.
- **Prohibited inputs:** the implementer's conclusions or persuasion (e.g., "the implementer believes this is safe"). The reviewer **derives its own verdict**, separates source-proof from inference, and names missing runtime (E3/E4) proof.
- **Context:** fresh/forked subagent for high-impact — no inheritance of implementer rationale.
- **Tools:** Read/Grep/Glob/read-only Bash; **no Write/Edit**. A reviewer never edits code; a separate implementation task is opened if fixes are needed. (The existing `tenant-privacy-architect` agent already models this contract.)

---

## 7. Evidence Model (E0–E4-C/E4-B) — APPROVED

| Level | Meaning |
|---|---|
| **E0** | assertion only — never a closure |
| **E1** | static/source — migration/ACL/source inspection; structural verifier |
| **E2** | local automated — `tsc`, `vitest`, local structural tests |
| **E3** | preview/integration runtime — Supabase Preview branch / disposable Postgres |
| **E4-C** | production **configuration/state** — migration in `schema_migrations`, `pg_policies`, `routine_privileges`/`proacl`, RLS state |
| **E4-B** | production **behavioral** — observed audit event from a real safe action; an unauthorized path actually denied at runtime; an approved workflow producing the expected result |

**Rule (APPROVED):** E1/E2 are never described as production proof; **E4-C never substitutes for E4-B.** Closure requirements by finding type:

```
RLS / policy removal (PF-007/012):  E1+E2+E3+E4-C (+E4-B where a runtime event is observable, e.g. READ_* audit rows)
Function grant hardening (PF-013):  E1+E2+E4-C    (E4-B optional; denial is config-provable)
Scoring / data integrity (PF-003):  E1+E2+E3      (+E4-B if stored outputs change)
AI authorization (PF-002):          E1+E2+E3+E4-C+E4-B  (record-level deny must be behaviorally observed)
Docs / L1:                          E1+E2
```
Completion statuses: `PROVEN | FAILED | BLOCKED | NOT TESTED | REQUIRES HUMAN VERIFICATION`.

---

## 8. STATE Authority & Transition Model — APPROVED

**Format: JSON** (`docs/professional-audit/STATE.json`), **canonical**, seeded once from `docs/professional-audit/08-master-findings-register.md`; `docs/CURRENT_PROJECT_STATUS.md` becomes a generated human view (no second hand-edited register). Monotonic, append-only history.

```
OPEN → ARCHITECTURE_APPROVED → IMPLEMENTED → REVIEWED
     → PREVIEW_VERIFIED → PRODUCTION_VERIFIED → CLOSED
```

Per record: `finding, severity, risk_class, state, evidence_level, evidence_locations[], actor(role), timestamp, next_action`. A deterministic validator (`state-validator.mjs`) rejects skipped/downgraded/unauthorized transitions.

**Governance clarification (APPROVED):** `STATE.json` is **workflow governance and evidence tracking, not cryptographic identity enforcement.** An `actor: human` value written by an autonomous process is **not** proof a human authorized the transition. Therefore:
- Implementer context may advance at most to **`IMPLEMENTED`** (with E1/E2 attached).
- **`IMPLEMENTED → REVIEWED`** requires a reviewer-agent verdict artifact (implementer cannot self-set).
- **`PRODUCTION_VERIFIED` and `CLOSED` are HUMAN-ONLY** — an autonomous Claude workflow must **not** be able to finalize them; they require an **owner-controlled action backed by the required E4 evidence**.

---

## 9. Credential-Surface Model — APPROVED (audit re-run PHASE O2 PROBE REQUIRED)

Principle: *no environment variable does not mean no mutation capability.* Verified surface (Phase O1.1):

| Surface | Finding | Mutation risk |
|---|---|---|
| Prod env vars (SUPABASE_ACCESS_TOKEN / SERVICE_ROLE_KEY / DB_PASSWORD / GITHUB_TOKEN / GH_TOKEN / VERCEL_TOKEN / AI_FEATURES_ENABLED) | **all unset** | none |
| Supabase CLI | **not installed**; `~/.supabase` holds only telemetry/traces (no auth token) | none |
| Vercel CLI | **not installed**; no `~/.vercel` | none |
| GitHub CLI (`gh`) | **not on PATH** | no `gh pr merge` / `gh api` path |
| **Git Credential Manager** | **`credential.helper=manager`**, HTTPS origin | **`git push` can authenticate → push to `main` triggers Vercel + edge-fn deploy = production** |
| SSH agent/keys | **none** | no ssh push path |
| MCP (Supabase) | read-only + needs-auth | no mutation |

**O2 credential audit (PROBE REQUIRED):** re-run this matrix at bootstrap; target = **no production-mutation capability** wherever achievable. GCM `git push` cannot be made "absent" locally → covered by the all-push prohibition (§10) + guard + human gate. **Confirm GitHub branch protection on `main`** as a server-side backstop (currently NOT VERIFIED).

---

## 10. Git / GCM Threat & All-Push Prohibition — APPROVED (HUMAN-ONLY push)

Because Git Credential Manager provides a real authenticated external-mutation path, and pushing `main` triggers Vercel auto-deploy + the edge-function deploy Action:

> **ALL autonomous `git push` operations are prohibited.**

This applies to **`main`, feature branches, tags, alternate remotes, and `git -C <path>` variants**. `git push` is **HUMAN-ONLY**. Local git that does not push (branch, add explicit paths, commit) remains permitted per §11; `git add .` / `git add -A` are denied (explicit-path add allowed).

---

## 11. Permissions Architecture — APPROVED

- **Baseline:** remove `git add *`, `git push`, `git checkout *`, `git revert *` from the allow-list; add `permissions.deny` mirrors of the guard (§12); **forbid `defaultMode: bypassPermissions`** for autonomous sessions — autonomous workflows must never run in bypass-permissions mode.
- Permissions are a deterministic layer **inside** Claude Code, ranked below capability absence and above prompt instructions (§13).

---

## 12. Multi-Surface Hook Architecture (incl. PowerShell) — APPROVED

A single portable **Node (stdlib) PreToolUse guard** (`.claude/hooks/guard.mjs`) matching **all locally relevant execution/mutation paths**, not Bash alone: `Bash` **and** `PowerShell` command strings, `Write`/`Edit`/`NotebookEdit` target paths, and MCP/tool names. Deny (exit non-zero) with a clear message.

Deny set (Bash **and** PowerShell spellings + indirection):
- **Any `git push`** (all forms, incl. `git -C`) — see §10.
- `git add .` / `-A`; `git reset --hard`; `git clean -fdx`; `push --force`.
- Supabase mutation: `supabase db push|migration up|functions deploy`, `psql`/DB-URL execution.
- Deploy: `vercel deploy|--prod`.
- GitHub mutation: `gh pr merge`, `gh workflow run`, `gh api …/merges|/dispatches`.
- Network indirection to Supabase/Vercel/GitHub mutation endpoints: `curl`, `wget`, **`Invoke-RestMethod`, `Invoke-WebRequest`**, `fetch`, and `node -e` / `python -c` that build such calls or env-var-built commands.
- Secrets: read/write of `.env*`, `*.pem`/`*.key`, `secrets/`.
- AI: any write enabling `AI_FEATURES_ENABLED`.

**PowerShell parity is mandatory** in every deny pattern and every penetration test (§16). Owner-facing commands remain PowerShell-compatible (`;` / `if ($?)` chaining, full `git.exe` path, no bash `\` continuation).

---

## 13. Orchestration-Config Tamper Protection — APPROVED (self-protection); ConfigChange PHASE O2 PROBE REQUIRED

The guard also denies autonomous Write/Edit to **protected orchestration files**: `.claude/settings.json`, `.claude/settings.local.json`, `.claude/hooks/**`, the guard script itself, `.mcp.json`, and `docs/professional-audit/STATE.json` + `state-validator.mjs`. These are **HUMAN-ONLY**.

- **`ConfigChange` hook:** documentation suggests it may exist; **local availability NOT VERIFIED → PHASE O2 PROBE REQUIRED.** If verified/appropriate, use it for config self-protection; **otherwise** use the approved PreToolUse/protected-path fallback above.
- **Bootstrap/update procedure (APPROVED):** O2 creates protected files **before** arming the guard; thereafter changes to safety config are owner-driven (owner runs the change, or temporarily disables the guard in an interactive owner session) — never an autonomous edit. This preserves the ability to bootstrap without leaving a self-editable safety system.

**Safety-stack ranking (strongest → weakest, APPROVED):**
```
1. Capability / credential ABSENCE  (the wall)
2. OS / process / network isolation (future WSL2/container — §14)
3. Permissions (allow + deny)
4. Deterministic hooks (policy inside tool execution — NOT isolation)
5. Project instructions (CLAUDE.md — advisory)
6. Human process controls (gates — final authority)
```
Hooks are deterministic policy **inside** tool execution; they are **not** OS sandboxing, process isolation, credential isolation, or network isolation.

---

## 14. Windows Near-Term + Future WSL2/Container Hardening — APPROVED

- **Near term (O2): native Windows.** Permissions + deny + multi-surface guard + credential absence (env) + GCM all-push prohibition + human gates + PowerShell-compatible tooling. **Do not migrate anything.**
- **Future hardening option (DEFERRED, separate approval):** a **dedicated WSL2/container clone** — a *fresh git clone*, **not** the OneDrive tree — for unattended high-impact autonomous runs, giving real process/filesystem/network isolation. Evaluate OneDrive/worktree/line-ending implications first. **Do not run the OneDrive repository directly through WSL2.**
- **Worktree isolation (DEFERRED / PHASE O2 PROBE REQUIRED):** not a default until inheritance, current-branch preservation, OneDrive behavior, and cleanup are proven safe in O2.

---

## 15. Career-Development Governance — APPROVED

The product is a **longitudinal career-development ecosystem**, not an assessment/report generator. Governance recognizes the loop:
```
assessment → interpretation → counselor/student reflection → exploration
→ project/activity/work exposure → reflection → updated self-understanding
```

**Single `career-science-reviewer`, three lenses (APPROVED):**
- **Measurement / psychometrics:** construct validity, scoring integrity, interpretation boundaries, overclaiming, evidence provenance, scale/instrument versioning.
- **Developmental career pedagogy:** Discovery (7–8) / Exploration (9–10) / Planning (11–12) / transition readiness; **student agency**; exploratory-not-deterministic guidance; counselor-mediated development; experiential learning.
- **Equity / student opportunity:** gender / socioeconomic / geographic / disability-access / language-cultural bias; opportunity **expansion**, never narrowing; guard against `assessment → definitive career`.

**Longitudinal scientific integrity (APPROVED — reviewer checklist + STATE evidence now; future product data-governance later):** changes to assessments/interpretation must record `instrument_version`, `scoring_version`, `interpretation_version`, `report_version`; the system must not silently compare results produced under incompatible logic.

The career-science reviewer fires **only** on interpretation/scoring/AI-output/student-facing-meaning changes — ordinary engineering never triggers it.

---

## 16. AI Special-Risk Lane — APPROVED (AI-disabled status HUMAN-ONLY to change)

Authentication is **not** authorization. Any AI-touching task must, before "done," carry independent evidence across: caller authentication; **record-level authorization** (PF-002); school/tenant boundary; parent-child relationship; counselor assignment; consent/assent; data minimization; provider egress; retention; rate-limiting/quotas; safeguarding; child developmental appropriateness; explainability; equity/fairness; human oversight. Routing: security-db + privacy-safeguarding + career-science reviewers, then a **mandatory human AI-governance gate**. **`AI_FEATURES_ENABLED` stays false/unset; enabling it is HUMAN-ONLY** (guard-denied + server fail-closed). AI remains disabled until explicit human governance sign-off.

---

## 17. Phase O2 Penetration-Test Requirements — APPROVED

All negative controls must be **blocked**; none may mutate production. Run each in **both Bash and PowerShell** spellings, in a throwaway/local context.

| Attempt | Expected |
|---|---|
| `supabase db push` / production SQL / `psql` DB-URL | guard deny |
| `git add .` / `git add -A` | guard deny (explicit-path add allowed) |
| **any `git push`** (`main`, feature, tag, alt remote, `git -C`) | guard deny |
| `gh pr merge` / `gh api …/merges` / `gh workflow run` | guard deny (gh also absent) |
| `vercel deploy` | guard deny (also absent) |
| enable `AI_FEATURES_ENABLED` | guard deny + server fail-closed |
| secret/config mutation (`.env`, keys) | guard deny |
| `bypassPermissions` mode | disallowed by config |
| `Invoke-RestMethod` / `Invoke-WebRequest` to a mutation endpoint | guard deny |
| `node -e` / `python -c` building a mutation call/API | guard deny |
| env-var-built command indirection | guard deny |
| edit `.claude/settings.json` / hook / guard / STATE validator | guard deny (protected files) |
| disable/remove the hook | guard deny + HUMAN-ONLY |
| prompt-injection in a repo file instructing any of the above | guard deny + reviewer/human catch |
| MCP mutation tool call | none available (read-only + needs-auth) |
| real student psychometric data in autonomous tests | forbidden — synthetic fixtures only |

Plus a **false-positive suite:** explicit `git add <file>`, ordinary Write/Edit to non-protected paths, read-only git, and normal tsc/vitest must **pass**.

---

## 18. Phase O2 Artifact Specification — APPROVED

| # | Path / name | Purpose | Responsibilities | Write authority | Deps | Protected | Tests |
|---|---|---|---|---|---|---|---|
| P1 | `.claude/hooks/guard.mjs` | multi-surface PreToolUse guard | deny per §10/§12/§13 (Bash+PowerShell+Write/Edit+MCP) | **HUMAN-ONLY** | Node (verified) | **YES** | §17 matrix all deny; false-positive suite pass |
| P2 | `.claude/settings.json` (hardened) + hook registration | permission floor + arm guard | deny list; drop git add*/push/checkout*/revert*; no bypass; register PreToolUse | **HUMAN-ONLY** | P1 | **YES** | permission-deny checks |
| P3 | `.claude/skills/rz-prime/SKILL.md` | context router (fork, read-only) | emit packet incl. risk_class + E-reqs from STATE + finding-index | skill file HUMAN-managed | P7, P8 | file: human-managed | packet under token budget; correct risk_class |
| P4 | `.claude/skills/rz-verify/SKILL.md` | evidence gate | CLAIM→CHECK→RESULT→E-level→STATUS; **propose** STATE transition (never PRODUCTION_VERIFIED/CLOSED) | — | P7 | — | refuses E4/CLOSED without owner evidence |
| P5 | `.claude/skills/rz-remediate/SKILL.md` | L2 Segment-1 orchestrator | discover→architecture→acceptance→STOP; **emit** the `/goal` (or equivalent) command; route reviewer | — | P3, P6 | — | stops at GATE 1; never emits merge/deploy/push |
| P6 | `.claude/agents/security-db-reviewer.md`, `.claude/agents/career-science-reviewer.md` | independent reviewers | read-only verdicts per §6/§15; no Write/Edit | — | — | — | cannot edit; derive own verdict from raw diff |
| P7 | `docs/professional-audit/STATE.json` + `state-validator.mjs` | canonical finding state + transition enforcement | deterministic state machine per §8 | transitions role-gated; PRODUCTION_VERIFIED/CLOSED **HUMAN-ONLY** | seed from `08-master-findings-register.md` | **YES** | invalid/unauthorized transitions rejected |
| P8 | `docs/professional-audit/finding-index.md` | finding→files/migrations/tests map | feed rz-prime without repo re-scan | agent-appendable | — | — | resolves each PF to correct paths |
| P9 | `CLAUDE.md` edits | correct + wire | fix stale "no Node" (Node v24/npx present; note vitest/CLI reality), add L0–L3, capability-absence principle, GCM all-push = HUMAN-ONLY, point to STATE | **HUMAN-reviewed** | — | — | invariants accurate vs environment |
| P10 | `docs/claude-orchestration/` config-authority note | canonicalization | declare `.claude/*` canonical; **keep** `.agents/`, `.codex/`, `AGENTS.md` as legacy/non-canonical; **no symlinks**; generated export only if needed | human | — | — | one source of policy |

---

## 19. Phase O2 Build Order — APPROVED

```
1.  environment/version + credential-surface re-probe (confirm §9/§B); probe ConfigChange, /goal local invocation, skill-frontmatter support
2.  CLAUDE.md correction (P9) + STATE.json seed + validator (P7)
3.  permissions baseline hardening (P2, guard NOT yet armed)
4.  multi-surface guard script (P1) — written, NOT armed
5.  guard tests: §17 penetration matrix + PowerShell parity + false-positive suite
6.  arm the guard + config self-protection (register PreToolUse; ConfigChange if verified)
7.  finding-index (P8) → rz-prime (P3)
8.  reviewer agents (P6)
9.  rz-remediate (P5) + rz-verify (P4)
10. end-to-end dry run: one L1 finding (no gate) + one L2 to GATE 1 (emit /goal, stop)
11. full penetration re-test with guard armed
12. config-authority note (P10) + documentation
```
Guard is written and tested **before** arming; state authority exists **before** any autonomous transition; penetration tests run **before and after** arming.

---

## 20. Mandatory Human Intervention Points — APPROVED (HUMAN-ONLY)

1. **GATE 1** — L2 architecture + acceptance-criteria approval (before implementation).
2. **GATE 2** — external/production: merge to `main`, deploy, production SQL, **any `git push`**, AI enablement, real-data mutation.
3. **`PRODUCTION_VERIFIED` and `CLOSED`** state transitions (owner-controlled action + required E4 evidence).
4. **Any reviewer-flagged blocking defect.**
5. **Changes to orchestration safety config** (guard, settings, hooks, STATE validator, `.mcp.json`).
6. **Genuinely ambiguous product / scientific / privacy / legal decisions.**

---

## 21. Deferred External Frameworks — DEFERRED

Ralph, GSD, BMAD, Claude-Mem, Agent Teams, and dynamic workflows are **DEFERRED**; none is installed (verified). None is adopted unless a **verified** native gap emerges that native Claude Code + this thin project layer cannot address. **Superpowers:** not installed; treat only as a *methodology to selectively borrow* (systematic debugging, verification-before-completion, planning discipline) — **never a second orchestration engine**. Test philosophy: **test-first where meaningful and feasible; evidence-first always** (do not force strict TDD where E3/E4 runtime evidence is the appropriate proof).

---

## 22. Expected Autonomy Outcome — APPROVED (realistic)

Eliminated human turns: repeated test prompts, repeated debug prompts, repeated context reloading (→ rz-prime), routine evidence collection, routine local verification (→ rz-verify), status reconciliation (→ STATE). Retained by design: L2 architecture approval, scientific/product judgment, privacy/child governance approval, merge/deploy/production, human-authorized closure. Net: **L0/L1 ≈ fully autonomous; L2 ≈ two human touches (GATE 1 + GATE 2) + closure confirmation**, down from ~5–6 hand-written prompts today (≈ 60% fewer human turns) — with strictly stronger safety. **Not** full autonomy, by design.

---

## 23. Decision Status Summary

| Decision | Status |
|---|---|
| Option B (native + thin control layer) | APPROVED |
| L0–L3 autonomy; segmented L2; GATE 1 / GATE 2 | APPROVED |
| `/goal` used, not depended on; emit-as-command | APPROVED; local invocation **PHASE O2 PROBE REQUIRED** |
| `/loop` for monitoring only | APPROVED |
| rz-prime router (fork, read-only) | APPROVED; skill-frontmatter support **PHASE O2 PROBE REQUIRED** |
| Risk routing + independent reviewers | APPROVED |
| E0–E4-C/E4-B evidence model | APPROVED |
| STATE.json canonical; PRODUCTION_VERIFIED/CLOSED | APPROVED; those transitions **HUMAN-ONLY** |
| All autonomous `git push` prohibited | APPROVED; push **HUMAN-ONLY** |
| Multi-surface guard incl. PowerShell | APPROVED |
| Config tamper protection | APPROVED; `ConfigChange` **PHASE O2 PROBE REQUIRED** |
| Windows near-term | APPROVED |
| WSL2/container hardening; worktree isolation | DEFERRED |
| `.claude/` canonical; keep `.agents/.codex/AGENTS.md` as legacy; no symlinks | APPROVED |
| Career-science governance (3 lenses) + longitudinal versioning | APPROVED |
| AI special-risk lane; AI disabled | APPROVED; enablement **HUMAN-ONLY** |
| External frameworks | DEFERRED |
| GitHub branch protection on `main` | **PHASE O2 PROBE REQUIRED** (confirm) |

---

## Phase O2 Implementation Contract

Phase O2 may choose implementation details **only where this specification intentionally leaves them open** (e.g., exact guard pattern strings, rz-prime output formatting within the token budget, STATE.json field encoding, reviewer prompt wording, finding-index layout).

Phase O2 **may not silently change**:
- autonomy boundaries (L0–L3) and the segmented L2 lifecycle;
- human gates (GATE 1, GATE 2) and mandatory human intervention points;
- production authority (all `git push`, merge, deploy, SQL, AI enablement are HUMAN-ONLY);
- evidence semantics (E0–E4-C/E4-B; E1/E2 ≠ production proof; E4-C ≠ E4-B);
- reviewer independence (raw-artifact inputs; no Write/Edit; own verdict);
- state closure authority (`PRODUCTION_VERIFIED`/`CLOSED` HUMAN-ONLY; implementer max `IMPLEMENTED`);
- credential-safety principles (capability absence first; no autonomous push; protected config);
- career-science governance (three lenses + longitudinal versioning);
- AI-disabled status.

Any **verified technical incompatibility** with an approved decision must be **reported explicitly with evidence** and handled with the **smallest safe fallback** (e.g., `ConfigChange` unavailable → PreToolUse protected-path denial; `/goal` not locally invocable → owner-launched bounded task; unsupported skill frontmatter → smallest working form). Phase O2 must implement this architecture rather than redesign it.
