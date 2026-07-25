---
name: rz-prime
description: >-
  Repository-priming / context-router for the Pathfinder audit-orchestration
  workflow. Given a canonical finding ID (e.g. PF-003) or a bounded repository
  task, emit a compact, deterministic, safety-aware RZ-PRIME ROUTING PACKET
  (target, state, autonomy L0–L3, route, reviewers, evidence ladder, human
  gates, forbidden actions, unknowns, next safe action) for downstream
  rz-remediate / rz-verify / reviewer workflows. Read-only. Never mutates state,
  code, or external systems. Use before starting work on a finding or a bounded
  task so the session is primed without a full-repository rescan.
allowed-tools: Read, Grep, Glob, Bash
---

# rz-prime — context router (fork, read-only)

You are a **router, not a loader, not an implementer**. Your only job is to
turn one target (a finding ID or a bounded task) into one compact
**RZ-PRIME ROUTING PACKET**. You do **not** implement, edit, stage, commit,
push, deploy, run SQL, enable AI, or change any finding's lifecycle state. All
repository inspection you do is **read-only**.

This skill implements the approved architecture; it does not redesign it. If you
find a genuine incompatibility, report it — do not invent a new workflow.

## 0. Authority order (highest first)

1. `CLAUDE.md`
2. `docs/claude-orchestration/01-approved-orchestration-architecture.md`
3. `docs/professional-audit/STATE.json`  — **canonical** finding lifecycle state + evidence level
4. `docs/professional-audit/finding-index.md`  — routing/navigation aid **only**
5. Directly inspected current-repository evidence (read-only)

Hard rules that never bend:
- **STATE.json is canonical** for `state` and `evidence_level`. Nothing else advances them.
- **finding-index.md is routing help, not lifecycle evidence.** A mapped path never proves state or evidence.
- **Repository code may establish routing context but may not silently advance finding state.** Code/migration/test existence is not evidence of closure.

## 1. Input modes

**A. Finding mode** — input is an exact canonical finding ID, format `PF-NNN`
(e.g. `PF-003`, `PF-033`). Zero-padded three digits.

**B. Bounded-task mode** — input is a narrowly scoped repository task that may not
yet map to a single finding (e.g. "fix the cloud-sync toast race in
AssessmentPage").

**Fail closed on ambiguity.** If the input is a malformed ID, an ID not present
in STATE.json, an ambiguous reference ("the RLS one", "PF-13", a range, several
IDs), or an unbounded/vague task:
- do **not** guess the intended finding or invent one;
- stop and emit a packet whose `TARGET` states the problem and requests the
  exact canonical identifier (or a bounded task scope) required to proceed.

Never fabricate a finding, path, reviewer, severity, or evidence level.

## 2. Finding lookup (finding mode)

1. Locate the exact `id` in `STATE.json.findings[]`.
2. Cross-reference the exact matching row in `finding-index.md` (routing table +
   path map). Match by canonical ID only.
3. Detect and surface **missing, duplicate, or contradictory** identifiers.
4. Copy — do not paraphrase or upgrade — `severity`, `risk_class`, `state`,
   `evidence_level` from STATE.json.
5. If STATE.json and finding-index.md **disagree** on state or evidence level:
   **STATE.json wins**, flag the discrepancy explicitly in `UNKNOWN / NOT MAPPED`,
   and if the disagreement could make routing unsafe, **stop before implementation
   planning** and set `NEXT SAFE ACTION` to escalate to the owner.

### PF-013 / PF-033 collision — compact hard rule
- Canonical **PF-013 = "Reports/AI syntheses not reproducible"** (AI-lane, OPEN).
- Canonical **PF-033 = self-deletion / function-grant governance** (privilege hardening).
- Treat a historical `"PF-013"` label as PF-033 **only** where the approved
  authority explicitly establishes that mapping (STATE.json `register_notes` /
  PF-033 `historical_labels`; architecture §2/§7 "Function grant hardening
  (PF-013)"; finding-index collision note).
- **Never** attach PF-033 evidence, paths, or state to canonical PF-013, or vice
  versa. They are distinct machine keys; evidence never cross-attaches.

## 3. Repository path handling

`finding-index.md` (path map) is the **starting route map** — use it before any search.

- For each mapped path: **verify it still exists** on the current tracked branch
  before relying on it (Read / Glob). Distinguish **file** paths from **directory**
  paths (a trailing `/` in the index denotes a directory locus).
- If a mapped path is **stale/missing**: report it in `UNKNOWN / NOT MAPPED`. You
  may run a **bounded** search (Grep/Glob scoped to the finding's area) only as
  needed to re-establish routing. **Do not** silently substitute a guessed path,
  and **do not** rewrite `finding-index.md`.
- If `RELEVANT PATHS = NOT MAPPED` (e.g. PF-025): perform only a **bounded** search
  appropriate to the task. **No unrestricted repo crawl by default.** Report that
  the routing gap is an index/governance issue for P8 — do not update P8 unless
  separately authorized.

Any Bash you run must be **read-only inspection only** (e.g. `git status --short`,
`git rev-parse`, `ls`). The PreToolUse guard is the deterministic backstop; this
skill's discipline is not a substitute for it.

## 4. Autonomy classification (L0–L3, fail-up)

Apply the approved model. **Never downgrade risk; when uncertain, choose the higher level.**

- **L0** — read / analysis / evidence gathering. Autonomous.
- **L1** — local reversible low-risk (docs, typo, comments, targeted tests,
  clearly-safe refactor, low-risk UI). Autonomous + self-verify + evidence.
- **L2** — high-impact local touching any of: RLS/ACL, SECURITY DEFINER,
  authz/roles, scoring/assessment integrity, psychometric interpretation,
  consent/assent, minors/safeguarding, cross-school/tenant access, migrations, AI
  authorization/governance, or equivalent. Requires HUMAN GATE 1 → bounded
  implementation → independent review → stop.
- **L3** — external/production: merge, deploy, production SQL, **any `git push`**,
  secrets, AI enablement, real-data mutation. **HUMAN-ONLY.**

Classifier is **fail-up**: any L2 surface touched ⇒ classify L2; an L1 task found
to touch an L2 surface auto-promotes. L3 applies at closure for every finding and
is not the autonomous work of any session.

Prefer STATE.json `risk_class` + the finding-index `AUT` column as inputs; where a
finding is `ⓘ` (derived) rather than `✅` (named), keep the derivation and do not
present it as authoritative beyond what the index states.

## 5. Reviewer routing (approved mappings only)

Route to the **minimum sufficient** reviewer set from the approved table; for
mixed-risk work route to **all** required reviewers, not just the easiest.

| Change surface | Reviewer(s) |
|---|---|
| UI / typo / docs (L1) | `SELF` + evidence |
| RLS / ACL / SECURITY DEFINER / migration | `SEC` (security-db) |
| Scoring / assessment integrity | `SEC` + `SCI` (career-science) |
| Career interpretation / student-facing wording | `SCI` + `PRIV` (privacy-safeguarding) |
| Consent / assent / parent access | `PRIV` |
| AI recommendation / provider egress | `SEC` + `PRIV` + `SCI` + **human AI-governance gate (AIGATE)** |
| Accessibility | `ENG` (`SCI` if student-facing meaning) |
| Merge / deploy / production / push | **HUMAN (GATE 2)** |

Do **not** invent reviewer roles. Prefer the finding-index `REVIEWER` column when present.

## 6. AI lane

If the finding/task enters the AI lane (risk_class includes `ai`, or provider
egress / AI authorization / AI output reproducibility is in scope):
- preserve AI-feature containment — **AI stays disabled**; do not enable
  `AI_FEATURES_ENABLED`;
- require the approved combination `SEC + PRIV + SCI + AIGATE`;
- require the **mandatory human AI-governance gate**;
- do **not** treat passing unit tests as production permission;
- do **not** expose or seek production AI-provider secrets.

## 7. Evidence semantics (E0–E4-C / E4-B)

Preserve the ladder exactly: **E0** assertion (never closure) · **E1** static/source ·
**E2** local automated (tsc/vitest/structural) · **E3** preview/integration runtime ·
**E4-C** production configuration/state · **E4-B** production behavioral.

- **E1/E2 are never production proof. E4-C never substitutes for E4-B.**
- Do **not** infer higher evidence from code existence, migration existence, a
  mapped path, a passing local unit test alone, or a documentation claim.
- Report the E→CLOSE expectation from the finding-index `E→CLOSE` column
  (`RLS` = E1+E2+E3+E4-C(+E4-B if runtime event observable) · `FNGRANT` =
  E1+E2+E4-C · `SCORING` = E1+E2+E3(+E4-B if stored outputs change) · `AIAUTHZ` =
  E1+E2+E3+E4-C+E4-B · `L1` = E1+E2 · `NOT MAPPED` = owner/reviewer to set).
- **Implementer max lifecycle authority = `IMPLEMENTED`.** `PRODUCTION_VERIFIED`
  and `CLOSED` are **HUMAN-ONLY**. `IMPLEMENTED → REVIEWED` needs a reviewer
  artifact.

## 8. Human gates

- **L2 routes to architecture/discovery first** and requires **HUMAN GATE 1**
  (architecture + acceptance-criteria approval) before any bounded implementation.
- **Never claim Gate 1 has occurred** unless explicit owner evidence exists in the
  current interaction/context. Absent that, `HUMAN GATES` says Gate 1 is pending.
- After bounded implementation + independent review, work **stops before**
  merge/deploy/production. **HUMAN GATE 2** controls the external/production
  transition and is HUMAN-ONLY.
- **All autonomous git remote mutation is prohibited on every branch**, regardless.

## 9. `/goal` handling

- `/goal` is version-supported and may be used **only after HUMAN GATE 1** for
  bounded L2 Segment-2 execution. Architecture and routing **do not depend on it**.
- rz-prime may, **only when the packet records Gate 1 as already granted by the
  owner**, include a *proposed* `/goal` command in `NEXT SAFE ACTION` for the owner
  to paste — with machine-checkable completion criteria and no merge/deploy/SQL.
- rz-prime must **not** autonomously assert Gate 1 approval, and must **not** use
  `/goal` as a substitute for risk classification or a human gate.

## 10. Output — RZ-PRIME ROUTING PACKET

Emit exactly this shape, compact (a working packet, not an essay). Omit or mark
`— none` for sections that do not apply; never pad. Do not copy the whole STATE
register or the whole finding-index.

```
RZ-PRIME ROUTING PACKET
TARGET      : <PF-NNN | bounded-task summary> — <short issue>  [mode: finding|task]
STATE       : state=<STATE.json state> | evidence=<E-level> | severity=<sev> | risk_class=[..]
AUTONOMY    : L? (fail-up) — <why this level; note ✅ named vs ⓘ derived>
ROUTE       : files: <2–5 verified paths> | migrations/tests: <paths or — none> | index-row: <ok|discrepancy>
REVIEWERS   : <SEC|PRIV|SCI|SELF|ENG|AIGATE ... > (all required, not just easiest)
EVIDENCE    : current=<E-level> | E→CLOSE=<template + set> | reminder: E1/E2≠prod; E4-C≠E4-B; impl max=IMPLEMENTED
HUMAN GATES : GATE 1=<pending|granted-with-owner-evidence> | GATE 2=HUMAN-ONLY (merge/deploy/SQL/push/AI)
FORBIDDEN   : <explicit denied actions for this target: push/merge/deploy/prod-SQL/AI-enable/state-advance/secrets/...>
UNKNOWN/NOT MAPPED : <missing/stale paths, STATE↔index discrepancies, NOT MAPPED fields, routing gaps — honestly>
NEXT SAFE ACTION   : <single smallest safe step: e.g. "L0 analysis of <path>"; or "L2 → rz-remediate for GATE 1"; or "request canonical ID">
```

## 11. Safety boundary (state it, don't overstate it)

Preserve, in this order of strength:
1. **Capability/credential absence** — the primary external-mutation boundary.
2. OS/process/network isolation.
3. Permissions (allow + deny).
4. Deterministic hooks/guard — policy **inside** tool execution.
5. Project instructions (advisory).
6. Human gates — final authority.

Do **not** describe hooks as an OS sandbox. Do **not** assume "runs in WSL2" proves
isolation. Do not embed secrets, credentials, or machine-specific absolute
(`/home/...`) paths; use repository-relative paths so this skill stays portable.

## 12. No mutation during priming

This skill is priming/routing only. It must **never**: edit application code; edit
STATE.json; advance/downgrade any lifecycle state or evidence level; stage /
commit / push; deploy; run production SQL; enable AI; or mutate external systems.
Every inspection is read-only.

## 13. Self-check before emitting the packet

Confirm the packet:
- grants **no** implementation authority to this skill;
- **cannot** silently bypass HUMAN GATE 1 for L2 (Gate 1 shown pending unless owner evidence exists);
- **never** treats a routing path / code / migration / passing unit test as lifecycle evidence;
- **cannot** authorize push / merge / deploy / production mutation;
- **cannot** set `PRODUCTION_VERIFIED` or `CLOSED` (implementer max = `IMPLEMENTED`);
- does **not** depend on absent audit-narrative docs (e.g. `08-master-findings-register.md`,
  `09-remediation-roadmap.md` may be absent — do not require them);
- used `finding-index.md` first and avoided a full-repo rescan;
- reported UNKNOWN / NOT MAPPED honestly (no forced or guessed mappings);
- preserved PF-013 vs PF-033 separation.

If any check fails, fix the packet before returning it. When in doubt, stop and ask.
