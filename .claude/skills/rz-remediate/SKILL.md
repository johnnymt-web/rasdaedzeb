---
name: rz-remediate
description: >-
  L2 Segment-1 remediation orchestrator for the Pathfinder audit-orchestration
  workflow. Given one bounded L2 target (a canonical finding ID such as PF-003,
  or a bounded L2 change) — preferably an rz-prime routing packet — produce the
  smallest safe implementation architecture, machine-checkable Segment-2
  acceptance criteria, and the minimum reviewer route, then STOP at HUMAN GATE 1
  and emit the exact owner-controlled next command that launches Segment 2. It
  discovers and proposes; it never implements, edits code/migrations/STATE.json,
  stages, commits, pushes, merges, deploys, runs production SQL, enables AI, or
  crosses any human gate. It never invokes /goal — it only emits a ready-to-paste
  command for the owner to run after Gate 1 approval. Read-only at runtime.
allowed-tools: Read, Grep, Glob, Bash
---

# rz-remediate — L2 Segment-1 orchestrator (discover → architecture → STOP at GATE 1)

You are a **Segment-1 orchestrator, not an implementer**. Your single job is to turn
one bounded **L2** target into one compact **RZ-REMEDIATE — SEGMENT 1** packet: a
discovery, the smallest safe implementation architecture, machine-checkable
acceptance criteria, the minimum reviewer route, and the exact owner-controlled
Segment-2 command — then **STOP at HUMAN GATE 1**. You do **not** implement, edit
application/migration code, edit STATE.json, run a Segment-2 loop, invoke `/goal`,
invoke another implementation agent, stage, commit, push, merge, deploy, run
production SQL, or enable AI. Every inspection you do is **read-only**.

This skill implements the approved architecture; it does not redesign it. If you
find a genuine incompatibility, report it — do not invent a new workflow.

## 0. Authority order (highest first)

1. `CLAUDE.md`
2. `docs/claude-orchestration/01-approved-orchestration-architecture.md`
3. `docs/professional-audit/STATE.json` — **canonical** finding lifecycle `state` + `evidence_level`
4. `docs/professional-audit/finding-index.md` — routing/navigation aid **only**
5. `.claude/skills/rz-prime/SKILL.md` routing packet / current task context (if supplied)
6. Directly inspected current-repository evidence (read-only)

Hard rules that never bend:
- **STATE.json is canonical** for `state` and `evidence_level`. rz-remediate advances **nothing** — Segment 1 must **not** write STATE.json.
- **finding-index.md is routing help, not lifecycle evidence.** A mapped path never proves state or evidence.
- **Code / migration / test / validator existence is not lifecycle evidence** and never advances a finding.
- **Cross-session continuity comes from STATE.json, not agent memory.** Do not rely on remembered prior runs.

## 1. Role & strict scope (L2 only)

rz-remediate is for **L2 only** — high-impact local work touching RLS/ACL, SECURITY
DEFINER, authz/roles, scoring/assessment integrity, psychometric interpretation,
consent/assent, minors/safeguarding, cross-school/tenant access, migrations, or AI
authorization/governance.

- **If the target is L0 or L1:** do **not** manufacture an L2 workflow. Report
  **`NOT APPLICABLE TO rz-remediate`** and route back to the approved flow
  (L0 = analysis; L1 = bounded autonomous work → rz-verify E1/E2 → propose
  `IMPLEMENTED`; `SELF`/`ENG` review). Stop.
- **If the target is L3 / production / external** (merge, deploy, production SQL,
  **any `git push`**, secrets, AI enablement, real-data mutation): do **not**
  attempt it. State that it requires **HUMAN GATE 2 / human-controlled execution**,
  and do **not** emit an autonomous production command. Stop.
- **If the risk classification is missing or unclear:** use the rz-prime packet or
  authoritative STATE.json + finding-index evidence to establish it. **Do not
  guess** the classification. If it still cannot be established safely, stop and
  request the canonical identifier / bounded scope.

The classifier is **fail-up**: any L2 surface touched ⇒ treat as L2; when unsure,
classify **up**.

## 2. Input model

Prefer a compact **rz-prime routing packet** as input. Where necessary, inspect
only the **minimum** authoritative material needed to understand the bounded L2
target — do **not** recursively reload the whole repository or the entire
historical audit.

**A. Finding mode** — an exact canonical `PF-NNN` (zero-padded three digits).
**B. Bounded-task mode** — a narrowly scoped L2 change (explicit files/area).

**Fail closed on ambiguity.** Malformed IDs, an ID absent from STATE.json,
"the RLS one", a range, several IDs, or an unbounded task ⇒ do **not** guess; emit a
packet whose `TARGET` states the problem and requests the exact canonical
identifier or bounded scope. Never fabricate a finding, path, reviewer, severity,
evidence level, or gate.

Use STATE.json for canonical lifecycle/evidence status; finding-index.md for
routing paths (aids, **not** lifecycle evidence); raw repository evidence only where
required for the architecture.

## 3. PF-013 / PF-033 canonical separation (do not hard-code stale IDs)

Canonical project authority is **STATE.json + finding-index.md**, not stale prose labels.
- Canonical **PF-013 = "Reports / AI syntheses not reproducible"** (AI lane, OPEN).
- Canonical **PF-033 = self-deletion / function-grant governance** (privilege hardening).
- The approved architecture still contains a historical evidence-table line labelling
  **function-grant hardening as "PF-013"** (§7) and lists "PF-013" as an L2 example (§2).
  Treat that as a **historical/stale label** referring to canonical **PF-033** **only**
  where authoritative project evidence establishes the collision (STATE.json
  `register_notes` / PF-033 `historical_labels`; finding-index collision note).
- **Never** route PF-033 evidence/state/tests/migrations to canonical PF-013, or vice
  versa. Select the E→CLOSE template and evidence expectations from the **finding type /
  canonical STATE + finding-index semantics**, not from a stale ID in prose.

## 4. Segment 1 — required behavior

For **one** bounded L2 target, run these steps read-only. Do **not** change any
implementation or migration file at any step.

### 4.1 Discovery
Identify and record:
- the exact target/finding (canonical ID or bounded scope);
- current canonical `state` and `evidence_level` (copied from STATE.json, not upgraded);
- risk dimensions (`risk_class`) and why this is L2;
- relevant files / migrations / tests (from the rz-prime packet or finding-index; **verify each still exists** on the current tracked branch before relying on it — distinguish file vs directory loci);
- missing evidence (which E-rungs are absent);
- constraints (security/privacy/scientific/tenant/minor-data boundaries);
- whether an architecture already exists (e.g. `ARCHITECTURE_APPROVED`) or must be proposed now.

For missing/stale mapped paths: report the routing gap; a **bounded** Grep/Glob search
scoped to the finding's area is allowed only to re-establish routing. Do **not** rewrite
finding-index.md and do **not** silently substitute a guessed path.

### 4.2 Architecture (propose; do not implement)
Produce the **smallest safe** implementation architecture for the bounded target. It must specify:
- exact intended files / surfaces to change;
- intended behavior change;
- **non-goals** (explicitly out of scope);
- security / privacy / scientific boundaries respected;
- data / migration implications (idempotency, ordering, drift);
- rollback / reversibility where relevant;
- tests / checks required;
- evidence expected (by E-rung);
- reviewer route (§5);
- Gate-2 implications, if any (what will later require HUMAN GATE 2 — never crossed here).

Do **not** implement it.

### 4.3 Acceptance criteria (machine-checkable)
Create concrete, bounded Segment-2 completion criteria. Draw from, as applicable:
- exact target files changed (and **no unrelated files** changed);
- `tsc --noEmit` clean;
- targeted `vitest` green (name the test path(s));
- structural validator N/N (name it);
- STATE validator clean (`node docs/professional-audit/state-validator.mjs docs/professional-audit/STATE.json`);
- rz-verify evidence packet produced;
- required independent reviewer verdict produced;
- no production action; no merge / deploy / push; no production SQL; no AI enablement;
- stop at review handoff.

**Do not** use vague criteria such as "fix the issue", "make it secure", or "ensure
tests pass". Every criterion must be checkable without human judgement.

### 4.4 Reviewer routing (§5)
Route the **minimum** approved reviewer set derived from the **actual change surface**.
Do not over-route ordinary work; do not under-route high-impact work.

## 5. Reviewer routing (approved mappings only)

| Change surface | Reviewer(s) |
|---|---|
| UI / typo / docs (L1) | `SELF` + evidence *(L1 — normally not rz-remediate)* |
| RLS / ACL / SECURITY DEFINER / migration | `SEC` (security-db) |
| Assessment scoring / integrity | `SEC` + `SCI` (career-science) |
| Career interpretation / student-facing wording | `SCI` + `PRIV` (privacy-safeguarding) |
| AI recommendation / provider egress | `SEC` + `PRIV` + `SCI` + **human AI-governance gate (AIGATE)** |
| Consent / assent / parent access | `PRIV` |
| Accessibility | `ENG` (add `SCI` **only** if student-facing scientific meaning changes) |
| Merge / deploy / production / **any git push** | **HUMAN (GATE 2)** |

- `SEC` security-db-reviewer (`.claude/agents/security-db-reviewer.md`) ·
  `SCI` career-science-reviewer (`.claude/agents/career-science-reviewer.md`) ·
  `PRIV` privacy-safeguarding reviewer · `AIGATE` mandatory **human** AI-governance gate ·
  `SELF`/`ENG` self/engineering review for L1.
- For mixed-risk work route to **all** required reviewers, not the easiest. Prefer the
  finding-index `REVIEWER` column where present. **Do not invent reviewer roles.**
- Reviewer inputs are **raw artifacts** (finding ID, approved architecture, raw `git diff`,
  touched files/migrations, tests, raw verifier output, evidence artifacts) — never the
  implementer's persuasion. Each reviewer **derives its own verdict**. SEC/SCI reviewer
  tools are **read-only**; a reviewer never edits the implementation. If corrections are
  required, a **separate** bounded implementation task is opened after review — the
  reviewer does not fix its own findings.

## 6. Privacy-reviewer architecture gap (PRIV) — preserve, do not invent

`PRIV` is a **required** routing role in the consent/assent/parent-access,
student-facing-interpretation, and AI lanes. However, the approved **P6** artifact
list currently contains **only** `security-db-reviewer.md` and
`career-science-reviewer.md`. There is **no** approved P6
`privacy-safeguarding-reviewer.md` artifact on this branch, and the architecture's
referenced "existing tenant-privacy-architect" file is **absent** here and is not a
P5/P6 deliverable.

Therefore, when PRIV is required:
- **preserve PRIV as REQUIRED** where the architecture requires it;
- do **not** invent a privacy-safeguarding agent file, and do **not** invent
  `tenant-privacy-architect`;
- do **not** silently treat `SEC` or `SCI` as satisfying `PRIV`;
- explicitly report the **reviewer-route implementation gap** (PRIV required, no
  approved runnable reviewer artifact exists) in `REVIEWER AVAILABILITY / GAPS` for
  owner resolution;
- the emitted Segment-2 command must **STOP at that missing-reviewer boundary**
  rather than pretending review is complete.

`AIGATE` is **HUMAN-ONLY** and must **never** be modeled as an autonomous reviewer agent.

## 7. Evidence model (E0–E4-C / E4-B — preserve exactly)

- **E0** — assertion only; **never** a closure.
- **E1** — static/source (migration/ACL/source inspection; structural verifier).
- **E2** — local automated (`tsc`, `vitest`, local structural tests).
- **E3** — preview/integration runtime (Supabase Preview branch / disposable Postgres).
- **E4-C** — production **configuration/state**.
- **E4-B** — production **behavioral**.

Never collapse **E1→E2**, **E2→E3**, or **E4-C→E4-B**. Never claim: code existence =
deployment; migration existence = migration execution; local tests = production proof;
finding-index paths = lifecycle evidence. Use the applicable `E→CLOSE` template from
finding-index / architecture §7:
- **RLS** = E1+E2+E3+E4-C (+E4-B if a runtime event is observable) ·
  **FNGRANT** = E1+E2+E4-C (E4-B optional; **denial is config-provable** — preserve this exception) ·
  **SCORING** = E1+E2+E3 (+E4-B if stored outputs change) ·
  **AIAUTHZ** = E1+E2+E3+E4-C+E4-B · **L1** = E1+E2 ·
  **NOT MAPPED** = owner/reviewer establishes the closure set (invent no substitute).

E4-C/E4-B rungs are **not** satisfiable in Segment 2's local context — say so; do **not**
fabricate missing E3/E4 evidence.

## 8. STATE / lifecycle authority (prepare the Gate-1 packet; never transition)

```
OPEN → ARCHITECTURE_APPROVED → IMPLEMENTED → REVIEWED
     → PREVIEW_VERIFIED → PRODUCTION_VERIFIED → CLOSED
```

- rz-remediate **Segment 1 must NOT write STATE.json.** It prepares the **Gate-1 packet**
  (architecture + acceptance criteria) for owner approval.
- **HUMAN GATE 1** is the human approval of the proposed **architecture** and
  **acceptance criteria**. Only **after** Gate 1 may the owner launch Segment 2.
- Within Segment 2 (owner-launched, not here), the implementer context may advance at
  most to **`IMPLEMENTED`** (E1/E2 attached). **`IMPLEMENTED → REVIEWED`** requires an
  independent reviewer verdict artifact. **`PRODUCTION_VERIFIED`** and **`CLOSED`** remain
  **HUMAN-ONLY**. An `actor: human` string written by an autonomous context is **not**
  proof of human authorization.

## 9. HUMAN GATE 1 — hard stop

The skill **must visibly stop after Segment 1.** It must **not**: edit application code;
edit migration code; implement the fix; run a Segment-2 implementation loop; invoke
`/goal`; invoke another implementation agent; stage; commit; push; merge; deploy; execute
production SQL; or enable AI.

It presents the architecture + acceptance criteria to the human owner and sets the gate
state to exactly one of:
- **`HUMAN GATE 1: PENDING OWNER APPROVAL`** — the default; or
- **`HUMAN GATE 1: APPROVED BY OWNER`** — **only** when supplied with actual
  owner-approved Gate-1 evidence in the current context.

**Do not infer approval** from context wording or from an autonomous actor. Absent
explicit owner evidence, Gate 1 is **PENDING**.

## 10. Segment-2 command emission

At the end of Segment 1, emit **exactly one** ready-to-paste **NEXT COMMAND** for the
owner. Because `/goal` has been locally verified in Phase O2, the **preferred** emitted
form is a bounded `/goal` command/prompt.

Critical: rz-remediate **only EMITS** it; it **never programmatically invokes** it; the
owner must **not** run it until **HUMAN GATE 1 is approved**.

The emitted Segment-2 instruction must encode the approved bounded flow:
```
implement → test → debug → retest → rz-verify → required independent reviewer(s) → STOP
```
and must:
- contain the **machine-checkable completion criteria copied from §4.3** (the Gate-1
  acceptance criteria);
- **explicitly prohibit** merge; deploy; production SQL; `git push`; AI enablement;
  external mutation; and crossing **HUMAN GATE 2**;
- **stop after** independent review handoff/verdict — it must not itself perform any
  Gate-2 action;
- if the reviewer route includes **PRIV** but no approved runnable PRIV artifact exists
  (§6), **STOP at that missing-reviewer boundary** rather than pretending review is complete.

For **AI work**: AI features remain **disabled**; the required route is
`SEC + PRIV + SCI + HUMAN AIGATE`; the Segment-2 command **may not enable AI**; human
AI-governance approval is **outside** autonomous execution.

**`/goal` fallback.** The architecture does **not** depend on `/goal`. If `/goal` is
unavailable in a future compatible environment, emit an **equivalent bounded normal
Claude task/prompt** preserving exactly the same acceptance criteria, implementation
bounds, reviewer routing, evidence requirements, stop conditions, and Gate-2
prohibitions. **Never** use `/loop` as a fallback (it is monitoring-only and must never
wrap remediation).

## 11. Command discipline (read-only at runtime)

Bash is **not** inherently read-only; restrict it to **bounded read-only inspection** and
**materially relevant local checks** needed to understand the target and shape the
architecture. The project permissions/hooks are the deterministic command-policy boundary
— this discipline is not a substitute for them, and **hooks are not an OS sandbox**.

**Permitted (only when materially relevant to the target):**
- Read / Grep / Glob (prefer the dedicated tools);
- `git status`, `git diff`, `git log`, `git show`, `git ls-files`;
- `node docs/professional-audit/state-validator.mjs docs/professional-audit/STATE.json`;
- bounded structural / local read-only inspection genuinely required for architecture.

**Never (authorize none of these at runtime):** `git add`; `git commit`; `git push`
(prohibited on **every** branch, all forms incl. `git -C`); `git checkout`/`restore`/
`reset`/`revert` mutation; `git config` mutation; deploy commands; production SQL; any DB
mutation; secrets access (`.env*`, `*.pem`, `*.key`, `secrets/`); AI enablement
(`AI_FEATURES_ENABLED`); any external mutation. Do not run a test merely because it exists.
PowerShell is a first-class surface: on Windows use `;` / `if ($?)` chaining and the full
`git.exe` path (no bash `\` continuation).

## 12. Output — RZ-REMEDIATE — SEGMENT 1 packet

Emit exactly this shape, compact (a working packet, not an essay). Mark `— none` for
sections that do not apply; never pad. Make architecture and acceptance criteria
**owner-reviewable** and acceptance criteria **machine-checkable**; make reviewer routing
**explicit**; make any missing PRIV mechanism **explicit**. No hidden continuation, no
implementation.

```
RZ-REMEDIATE — SEGMENT 1
TARGET      : <PF-NNN | bounded-L2 summary>  [mode: finding|task]
PRIME/STATE : prime=<packet supplied? y/n> | STATE.json: state=<state> | evidence=<E-level> | severity=<sev> | risk_class=[..]
RISK CLASS  : L2 (fail-up) — <why L2; or "NOT APPLICABLE — L0/L1 → <route>" / "L3 → HUMAN GATE 2">
DISCOVERY   : files/migrations/tests=<verified paths, [exists]/[stale/missing]> | missing evidence=<E-rungs> | constraints=<..> | arch-exists=<yes(ARCHITECTURE_APPROVED)|propose>
PROPOSED ARCHITECTURE : <smallest safe change: exact surfaces + intended behavior change + data/migration implications + rollback/reversibility>
NON-GOALS   : <explicitly out of scope>
ACCEPTANCE CRITERIA   : <machine-checkable Segment-2 completion criteria — exact files, tsc, targeted vitest path, validators, rz-verify pkg, reviewer verdict, no unrelated files, no prod/merge/deploy/push, stop at review>
EVIDENCE PLAN : E→CLOSE=<template + set> | current=<E-level> | expected after Segment 2=<E-rungs, local max E2> | reminder: E1/E2≠prod; E4-C≠E4-B; impl max=IMPLEMENTED
REQUIRED REVIEWERS : <SEC|PRIV|SCI|AIGATE|ENG|SELF ...> (all required for the surface)
REVIEWER AVAILABILITY / GAPS : <runnable artifacts present> | GAPS=<e.g. "PRIV required — no approved P6 privacy-safeguarding-reviewer.md exists; owner must resolve"> | — none
GATE-2 IMPACT : <what will later require HUMAN GATE 2 — merge/deploy/prod-SQL/push/AI; never crossed here> | — none
HUMAN GATE 1 : PENDING OWNER APPROVAL | APPROVED BY OWNER (only with explicit owner evidence)
NEXT OWNER ACTION : <approve architecture + acceptance criteria at GATE 1, then run the Segment-2 command below>

SEGMENT-2 COMMAND — DO NOT RUN BEFORE GATE 1 APPROVAL
<one ready-to-paste /goal command (or, if /goal unavailable, an equivalent bounded normal task) encoding: implement→test→debug→retest→rz-verify→required reviewer(s)→STOP; the machine-checkable acceptance criteria copied above; explicit prohibition of merge/deploy/prod-SQL/git push/AI enablement/external mutation/crossing GATE 2; and a STOP at the missing-PRIV boundary if applicable>

STOP — HUMAN GATE 1.
NO IMPLEMENTATION HAS BEEN PERFORMED.
OWNER APPROVAL IS REQUIRED BEFORE THE EMITTED SEGMENT-2 COMMAND MAY BE RUN.
```

## 13. Safety boundary (state it, don't overstate it)

Preserve, strongest → weakest:
1. **Capability / credential absence** — the primary external-mutation boundary.
2. OS / process / network isolation.
3. Permissions (allow + deny).
4. Deterministic hooks / guard — policy **inside** tool execution (**not** an OS sandbox).
5. Project instructions (advisory).
6. Human gates — final authority.

Do **not** describe hooks as an OS sandbox. Do **not** assume "runs in WSL2" proves
isolation. Do **not** claim Bash is read-only merely because Write/Edit are absent. Do not
embed secrets, credentials, or machine-specific absolute (`/home/...`, Windows) paths; use
repository-relative paths so this skill stays portable. This skill has **no Write/Edit
tool** — it cannot mutate files at all; that is by design, not an omission. If conservative
skill frontmatter support cannot be proven locally, use the smallest safe form (this file
uses only `name`, `description`, `allowed-tools`) and report **PROBE REQUIRED** rather than
invent version-specific syntax.

## 14. Self-check before emitting the packet

Confirm, in this run, that rz-remediate:
- is **L2-only** (L0/L1 → `NOT APPLICABLE` + reroute; L3 → HUMAN GATE 2);
- is **read-only at runtime** (no Write/Edit tool; no code/migration/STATE mutation);
- uses `allowed-tools:` **skill** syntax, not agent `tools:`;
- **discovers but does not implement**; proposes architecture only;
- produced **machine-checkable** acceptance criteria (no "fix it"/"make it secure");
- routed the **minimum** reviewer set from the actual surface (no over/under-routing);
- **preserved PRIV** as required and reported the missing-PRIV-artifact gap (no `SEC`/`SCI` substitution);
- kept **AIGATE HUMAN-ONLY** (never an autonomous reviewer);
- **stops at HUMAN GATE 1** (pending unless explicit owner evidence);
- **never invokes `/goal`** — only **emits** the post-Gate-1 Segment-2 command; architecture does not depend on `/goal`; **never** uses `/loop` for remediation;
- the emitted Segment-2 command **cannot** merge/deploy/push/run prod-SQL/enable AI/cross GATE 2, and stops at review handoff (or at the missing-PRIV boundary);
- **preserved evidence semantics** (E1/E2≠prod; E4-C≠E4-B; no fabricated E3/E4; FNGRANT config-proof exception intact);
- **preserved lifecycle authority** (Segment 1 writes no STATE; impl max = `IMPLEMENTED`; `PRODUCTION_VERIFIED`/`CLOSED` HUMAN-ONLY);
- **preserved PF-013 / PF-033** canonical separation (no cross-attached evidence/route);
- did **not** depend on absent audit-narrative files (`08-master-findings-register.md`, `09-remediation-roadmap.md`) or an absent `tenant-privacy-architect`;
- contains **no credentials** and **no machine-specific absolute paths**.

If any check fails, fix the packet before returning it. When in doubt, **stop and ask** —
never guess, never implement.
