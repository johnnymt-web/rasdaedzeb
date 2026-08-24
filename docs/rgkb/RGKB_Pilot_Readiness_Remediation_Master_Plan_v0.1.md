# RGKB Pilot Readiness Remediation Master Plan — v0.1

- Artifact type: Cross-phase remediation PLANNING document (dependency-aware work-package
  map). Not a Step in the canonical controlled-schema series; not Step 9; not itself a
  governance specification.
- Version: v0.1
- Status: DRAFT — CONTROLLED AUTHORING
- Date: 2026-08-24
- Controlling foundation: Steps 1–8 (all accepted); `RGKB_Canonical_Entity_Model_v0.2.1`
- Gate authority: Owner Gate 0 adjudication; Owner closure of Step 8 (PR #51 merge commit
  `7818b4ad3894042166c9f6770832e270053458c1`); Owner authorization of this planning
  package (PILOT READINESS REMEDIATION MASTER PLAN MACRO AUTHORIZATION PACKAGE v0.1,
  2026-08-24)
- Production status: NOT AUTHORIZED FOR PRODUCTION, PILOT, OR PHASE 9

## Path-selection rationale

`docs/rgkb/` contains exactly one existing subfolder,
`04-canonical-knowledge-database/`, which holds the canonical entity model, the
Owner Gate 0 Adjudication Record, the Step 1–8 controlled-schema series, and
external review evidence. No existing planning/readiness/remediation location
exists anywhere under `docs/rgkb/`. `docs/professional-audit/remediation-phase-*`
is a separate, pre-existing, non-RGKB initiative (security/audit remediation)
and following its numbering convention here would incorrectly imply this
artifact belongs to that lineage. Placing this document inside
`04-canonical-knowledge-database/` — where it would sit alongside Steps 1–8 and
be byte-preservation-registered in the same `.gitattributes` file — would
imply it is part of the canonical controlled-schema series or a de facto
"Step 9," which it is not: it is a planning artifact that references Steps 1–8
but adds no governance semantics of its own. Accordingly this document is
placed one level up, directly under `docs/rgkb/`, as a sibling to
`04-canonical-knowledge-database/`:

`docs/rgkb/RGKB_Pilot_Readiness_Remediation_Master_Plan_v0.1.md`

This is exactly the fallback path specified in the authorization package.

## 1. Purpose, Authority, and Non-Authorization

### 1.1 What this document is

A dependency-aware, evidence-driven remediation program that organizes the
gaps identified in the accepted Step 8 artifact
(`RGKB_Controlled_Schema_Specification_Step_8_Pilot_Readiness_v0.1.md`, SHA-256
`704ae0c135023ae7d054e80bc319414b9707a0aed6b3ee7724f3e0d9770144c5`) into 19
ordered work packages (PRM-WP01–WP19), each with dependencies, required
evidence, authority, and acceptance criteria. It answers what work is
required, in what order, what can run in parallel, what blocks what, what
evidence each package must produce, who may perform or close each type of
work, and what exact evidence would permit a later Pilot Readiness
Evidence Re-assessment.

### 1.2 What this document is not, and does not do

This document does not implement any remediation; does not change any P-gate
state; does not declare pilot readiness; does not authorize pilot execution,
real student data, deployment, AI enablement, or Phase 9. It authorizes
nothing beyond its own existence as a planning artifact. The full
non-authorization list is restated at §15.

### 1.3 Baseline verification

- `origin/main` fetched and verified: `7818b4ad3894042166c9f6770832e270053458c1`
  — exact match to the authoritative baseline. **PASS.**
- Step 8 artifact at that commit verified: SHA-256
  `704ae0c135023ae7d054e80bc319414b9707a0aed6b3ee7724f3e0d9770144c5`, 100,422
  bytes, 1,728 lines — exact match to the accepted identity. **PASS.**
- No baseline mismatch. Not a Genuine Exception.

### 1.4 Remediation principles (restated as controlling)

1. A work package produces evidence for a future P-gate re-assessment. It does
   not itself change a P-gate's state.
2. Only PRM-WP18 (Pilot Readiness Evidence Re-assessment) may change a P-gate
   state, and only using Step 8's own four-state evidence contract.
3. No master remediation-progress score, weighted index, percentage, or
   "mostly ready" claim, at any level of this plan — program, wave, or
   work-package.
4. Every applicable P-gate has at least one remediation path in this plan.
5. No downstream work package is scheduled as unconditionally proceeding
   before its controlling prerequisite's evidence exists.
6. Authority categories (Claude/engineering, Owner, qualified legal counsel,
   qualified safeguarding authority, qualified scientific/review authority,
   human-only Git/prod) are never silently substituted for one another.
7. A finding (F-04, F-07, F-11, F-12, M-1, M-2, L-1, N-1) is carried forward
   unchanged by this plan; a work package may produce evidence relevant to a
   finding but does not itself close it.
8. Fail-closed, minors-protection, safeguarding, and consequential-decision
   boundaries established in Steps 1–8 remain absolute throughout remediation
   and are never relaxed "to make progress."
9. Pilot authorization (PRM-WP19) is separate, human, and terminal — no amount
   of completed remediation self-authorizes it.
10. Phase 9 is not addressed, scheduled, or implied anywhere in this plan.

## 2. Current Pilot-Readiness State (carried unchanged from Step 8)

This plan changes none of the following. They are the starting state this
remediation program is organized against.

| Gate | State |
|---|---|
| P1 — Baseline / Artifact Integrity | **SATISFIED** |
| P2 — Pilot Scope / Owner Parameters | **UNRESOLVED / NOT EVIDENCED** |
| P3 — Canonical Knowledge / Version Integrity | **NOT SATISFIED** |
| P4 — Evidence / Provenance Integrity | **NOT SATISFIED** |
| P5 — Scientific Governance | **NOT SATISFIED** |
| P6 — Interpretation / Synthesis Fidelity | **NOT SATISFIED** |
| P7 — Orchestration / Tool Boundary | **NOT SATISFIED** |
| P8 — Privacy / Data-Use Authority | **NOT SATISFIED** |
| P9 — Minors / Safeguarding | **NOT SATISFIED** |
| P10 — Human Review / Reviewer Competence | **NOT SATISFIED** |
| P11 — Consequentiality Boundary | **NOT SATISFIED** |
| P12 — Audit / Replay | **UNRESOLVED / NOT EVIDENCED** |
| P13 — Environment Isolation | **UNRESOLVED / NOT EVIDENCED** |
| P14 — Failure / Stop / Incident Control | **UNRESOLVED / NOT EVIDENCED** |
| P15 — Human Operating Model / Runbook | **UNRESOLVED / NOT EVIDENCED** |
| P16 — Synthetic Rehearsal Evidence | **UNRESOLVED / NOT EVIDENCED** |

No composite of the above is computed anywhere in this document.

## 3. Carried Findings

Unchanged, no closure implied or performed by this document:

- **CLOSED:** F-05, F-06, F-10, F-13.
- **OPEN:** F-04 (dependency re-binding workflow), F-07 (current-version
  resolution and cardinality), M-1 (source-hierarchy pattern assignment,
  OPEN / FAIL-CLOSED).
- **PARTIALLY SPECIFIED / OPEN:** F-11 (consequentiality classification —
  "materially determine or control" boundary), F-12 (platform-role vs.
  reviewer-authority implementation), M-2 (named scientific review authority
  for operational correspondence).
- **DEFERRED:** F-08, F-09, F-14.
- **L-1 — AFFIRMED CONSTRAINT** (unchanged).
- **N-1. CONFIRMED STRENGTH / NO ACTION** (unchanged, exact string).
- **PR8-1** — No end-to-end integrated runtime implementation of the Step 1–7
  governed model was evidenced.
- **PR8-2** — No isolated pilot/staging environment distinct from production
  was evidenced.
- **PR8-3** — No dedicated pilot runbook, incident-response document, or
  named pilot operating roles were found in the inspected evidence scope.

Findings-to-work-package mapping appears at §8.

## 4. Program Architecture — Layers A–J

This plan organizes remediation into ten planning layers. These are
organizational groupings for this document only, not newly authorized
execution phases and not a renumbering of Steps 1–8.

- **Layer A — Pilot Scope and Owner Parameters** (P2) → PRM-WP01.
- **Layer B — RGKB Foundational Runtime Substrate** (P3–P6) → PRM-WP02–WP05.
- **Layer C — Orchestration / Tool / Consequentiality Safety** (P7, P11) →
  PRM-WP06, WP07.
- **Layer D — Privacy / Minors / Safeguarding**, split into three
  non-substitutable authority tracks (P8, P9) → PRM-WP08 (technical), WP09
  (legal/policy), WP10 (safeguarding operational).
- **Layer E — Human Review / Competence / Operating Model** (P10, P14, P15) →
  PRM-WP11, WP15, WP16.
- **Layer F — Audit / Traceability / Replay** (P12) → PRM-WP12, conditional
  WP13.
- **Layer G — Pilot Environment Isolation** (P13) → PRM-WP14.
- **Layer H — Synthetic Rehearsal** (P16) → PRM-WP17.
- **Layer I — Pilot Readiness Evidence Re-assessment** (P1–P16) → PRM-WP18.
- **Layer J — Separate Owner Pilot Authorization** → PRM-WP19, human-only,
  terminal.

## 5. Work Package Definitions (PRM-WP01–WP19)

Each work package states all 18 required fields. "Authorized future work
type" states who may perform the work under a *later, separate* authorization
— this Master Plan authorizes none of it now.

---

### PRM-WP01 — Pilot Scope & Owner Parameter Definition

- **Purpose:** Establish the complete, Owner-approved Pilot Scope Profile
  (Step 8 §4.2) so every scope-dependent downstream package has a concrete
  target rather than a generic/worst-case assumption.
- **P-gate(s) addressed:** P2 (primary); precondition for precise P8, P9,
  P13, P14, P15 evaluation.
- **Findings addressed:** none directly carried-forward; remedies the
  parameter gap Step 8 §4 identifies.
- **Controlling source:** Step 8 §4, §6.
- **Dependencies:** none (earliest package).
- **Authorized future work type:** Owner decision-gathering; Claude may
  prepare intake templates and option sets, non-binding.
- **Required inputs:** Step 8 §4.2's full parameter table. Its 15 rows are
  not uniform: 13 are marked `OWNER INPUT REQUIRED` (genuine Owner policy
  choices) and 2 are governance-fixed, non-parameter rows carried directly
  from a controlling source — "Identity-linked / safeguarding-relevant
  attributes expected" (governed by Step 6 §3.1.2 at runtime, not a fixed
  pilot parameter) and "Explicitly prohibited uses" (Step 4 §12.4 / Step 6
  §9.3.3, absolute, no pilot-specific waiver possible). This package must not
  collapse that distinction.
- **Owner-supplied inputs (the 13 genuine parameter rows only):** intended
  purpose; cohort/school/site; pilot dates; participant age/grade scope;
  data domains involved; enabled assessments/features; output categories
  permitted; recipients; external tools if any; human roles (named
  individuals + competence basis); environment; retention window; excluded
  functions.
- **Implementation / process scope:** structured intake and option
  presentation for the 13 genuine parameter rows only; Owner (and legal/
  safeguarding authority where a parameter falls in their domain) supplies
  the actual values or an explicit exclusion. For the 2 governance-fixed
  rows, this package carries the value forward from its controlling source
  (Step 6 §3.1.2; Step 4 §12.4 / Step 6 §9.3.3) into the Pilot Scope Profile
  as a fixed, non-negotiable entry — it is documented, not decided.
- **Explicit non-scope:** no invented, assumed, or defaulted parameter value
  for any of the 13 genuine rows; no consent/assent collection; no account
  creation; no Owner override of a governance-fixed row. An Owner marking a
  pilot scope as "including" an absolutely prohibited use (e.g. an actual
  consequential decision, Step 4 §12.4 / Step 6 §9.3.3) does not create an
  exception — the prohibition is unaffected by any pilot-scope declaration,
  and the Pilot Scope Profile must record the use as excluded regardless of
  what the Owner writes.
- **Required evidence:** a completed Pilot Scope Profile in which (a) every
  one of the 13 `OWNER INPUT REQUIRED` rows carries an Owner-attributable
  value or an explicit Owner "excluded from this pilot" determination, and
  (b) both governance-fixed rows are represented exactly as their controlling
  source states, not as Owner-decided.
- **Negative / failure evidence:** any of the 13 parameter rows left blank or
  silently defaulted is registered UNRESOLVED, never treated as resolved; any
  attempt to represent a governance-fixed row as an Owner policy choice, or
  to record an absolute prohibition as pilot-permitted, is itself registered
  as a defect in the Profile, not accepted.
- **Acceptance criteria:** every required Owner-supplied pilot parameter has
  an attributable resolution, and every governance-fixed row is represented
  according to its controlling source. No percentage or count-based
  completeness metric is used.
- **Fail-closed condition:** any downstream package needing a specific
  unresolved parameter may not proceed on an assumed value; that
  sub-dependency remains blocked.
- **Closure authority:** Owner.
- **Downstream packages unlocked:** precise scoping for WP08, WP09, WP10,
  WP11, WP14, WP15, WP16.

---

### PRM-WP02 — Governed Object / Version Runtime Foundation

- **Purpose:** Implement the Step 1 governed-instance/version registry
  runtime substrate.
- **P-gate(s) addressed:** P3.
- **Findings addressed:** PR8-1 (this package begins closing the integrated-
  runtime gap for its layer); must not silently resolve F-04 (dependency
  re-binding, OPEN) or F-07 (current-version resolution/cardinality, OPEN) by
  implementation choice.
- **Controlling source:** Step 1 (full).
- **Dependencies:** none upstream; earliest engineering package.
- **Authorized future work type:** engineering implementation, under a later
  explicit implementation authorization (per CLAUDE.md §3, this is L2-class
  work: discovery/architecture → Human Gate 1 → implement → independent
  review → stop).
- **Required inputs:** Step 1 full spec; F-04/F-07's exact open questions.
- **Owner-supplied inputs:** none to begin design; Owner adjudication
  required only if implementation cannot proceed without resolving F-04/F-07.
- **Implementation / process scope:** `governed_instance` registry data
  model; stable-identity/immutable-version referencing; exact-instance
  citation enforcement (Step 1 §11.1).
- **Explicit non-scope:** no Step 3/4/5/6 semantics; no RLS/auth change
  beyond what the registry's own access model strictly requires, and that
  sub-scope is itself L2 and gated separately.
- **Required evidence:** implementation code; automated tests (positive and
  negative); traceability to exact Step 1 sections; fail-closed tests for
  version-mismatch/superseded-instance cases (Step 8 adversarial case C).
- **Negative / failure evidence:** a test proving the registry rejects a
  stale/superseded reference, not merely accepts a valid one.
- **Acceptance criteria:** exact-instance citation and version integrity
  demonstrably enforced under reproducible automated test.
- **Fail-closed condition:** ambiguous version resolution fails closed, never
  silently resolves to "latest."
- **Closure authority:** engineering evidence only; P3's state is changed
  only by PRM-WP18.
- **Downstream packages unlocked:** PRM-WP03.

---

### PRM-WP03 — Evidence & Provenance Runtime Foundation

- **Purpose:** Implement the Step 2 evidence/provenance/citation substrate.
- **P-gate(s) addressed:** P4.
- **Findings addressed:** PR8-1; must preserve M-1's OPEN / FAIL-CLOSED
  disposition for unresolved source-hierarchy pattern assignment — must not
  resolve M-1 by default implementation behavior.
- **Controlling source:** Step 2.
- **Dependencies:** PRM-WP02 (evidence/provenance records reference governed
  object identity/version).
- **Authorized future work type:** engineering implementation, later-
  authorized; L2-class.
- **Required inputs:** Step 2 spec; M-1's exact fail-closed rule.
- **Owner-supplied inputs:** none to begin; Owner/legal input only if a
  genuinely novel source-hierarchy case arises that M-1 does not cover.
- **Implementation / process scope:** evidence records; citation model;
  provenance chain; source-hierarchy classification per M-1's accepted rule.
- **Explicit non-scope:** no Step 3 determination logic (consumes the
  substrate WP04 will use, does not itself determine).
- **Required evidence:** implementation + tests; traceability to Step 2;
  reproducibility; fail-closed test for M-1's unresolved-pattern case.
- **Negative / failure evidence:** test proving an unresolved source-
  hierarchy case is rejected, not silently classified.
- **Acceptance criteria:** evidence/provenance records demonstrably
  traceable and reproducible under test.
- **Fail-closed condition:** unresolved source-pattern assignment fails
  closed (M-1 preserved, not resolved).
- **Closure authority:** engineering evidence only; P4's state is changed
  only by PRM-WP18.
- **Downstream packages unlocked:** PRM-WP04.

---

### PRM-WP04 — Scientific Determination Runtime Foundation

- **Purpose:** Implement the Step 3 scientific determination/dimension
  substrate.
- **P-gate(s) addressed:** P5.
- **Findings addressed:** PR8-1; implementation must reflect F-05/F-06/F-10/
  F-13's CLOSED rationale correctly, never reopen or contradict them.
- **Controlling source:** Step 3.
- **Dependencies:** PRM-WP03 (determinations ground in evidence records).
- **Authorized future work type:** engineering implementation, later-
  authorized, L2-class; requires qualified scientific/review authority input
  on determination-dimension fidelity, not engineering judgment alone.
- **Required inputs:** Step 3 spec; F-05/F-06/F-10/F-13's closed rationale.
- **Owner-supplied inputs:** none to begin.
- **Implementation / process scope:** determination/dimension substrate;
  eligibility computation; scientific-gate enforcement.
- **Explicit non-scope:** no Step 4 taxonomy classification (produces input
  for it, does not itself classify claims).
- **Required evidence:** implementation + tests; qualified scientific/review
  authority sign-off on fidelity to Step 3's model; traceability;
  reproducibility.
- **Negative / failure evidence:** test proving an ineligible/unresolved
  determination fails closed rather than defaulting to eligible.
- **Acceptance criteria:** determination substrate demonstrably reproduces
  Step 3's fixed rules under test, reviewed for fidelity by qualified
  scientific/review authority.
- **Fail-closed condition:** unresolved/ineligible determination fails
  closed.
- **Closure authority:** engineering evidence + qualified scientific/review
  authority; P5's state is changed only by PRM-WP18.
- **Downstream packages unlocked:** PRM-WP05.

---

### PRM-WP05 — Interpretation & Synthesis Taxonomy Runtime

- **Purpose:** Implement the exact Step 4 ten-row claim taxonomy (plus its
  two governed subtypes) as a runtime classification/enforcement layer.
- **P-gate(s) addressed:** P6.
- **Findings addressed:** PR8-1.
- **Controlling source:** Step 4.
- **Dependencies:** PRM-WP04 (taxonomy classification consumes Step 3
  determinations).
- **Authorized future work type:** engineering implementation, later-
  authorized, L2-class; qualified scientific/review authority input on
  taxonomy fidelity.
- **Required inputs:** Step 4's exact taxonomy/subtype rules; §4.5
  (reduced-input/abstain rule); §5.8 (self-efficacy exception boundary);
  §12.4 (unsupported-claim absolute prohibition).
- **Owner-supplied inputs:** none to begin.
- **Implementation / process scope:** exactly-one-of-ten-rows classification;
  subtype handling; discrepancy/multiple-hypothesis preservation; unsupported-
  claim prohibition enforcement.
- **Explicit non-scope:** no Step 5 orchestration/disposition logic (consumes
  taxonomy output, does not itself orchestrate).
- **Required evidence:** implementation + tests covering every taxonomy row
  and both subtypes; adversarial tests for Step 8 cases E–K; qualified
  scientific/review authority fidelity sign-off; reproducibility.
- **Negative / failure evidence:** tests proving master-score collapse (case
  G), self-efficacy-as-seventh-channel (case H), and grade→stage mapping
  (case F) are each rejected.
- **Acceptance criteria:** every taxonomy row demonstrably reachable and
  mutually exclusive under test; no collapse/averaging defect present.
- **Fail-closed condition:** a claim that cannot be classified to exactly one
  row fails closed — never forced into an ill-fitting row, never silently
  produced as "Unsupported claim."
- **Closure authority:** engineering evidence + qualified scientific/review
  authority; P6's state is changed only by PRM-WP18.
- **Downstream packages unlocked:** PRM-WP06.

---

### PRM-WP06 — Governed Orchestration / Tool Boundary Runtime

- **Purpose:** Implement Step 5's governed roles, Orchestration Event
  Record, Tier model, and disposition set as actual runtime orchestration.
- **P-gate(s) addressed:** P7.
- **Findings addressed:** PR8-1.
- **Controlling source:** Step 5; Step 6 (Tier/consequentiality interaction);
  Step 7 §8 (integration); Step 7 §8.3 ("modify operational data" unmapped/
  fail-closed rule).
- **Dependencies:** PRM-WP05 (orchestration acts on Step 4-classified
  claims); requires Step 6 authority context for the Tier boundary (informs
  PRM-WP07).
- **Authorized future work type:** engineering implementation, later-
  authorized, L2-class.
- **Required inputs:** Step 5 full spec; Step 7 §8.3.
- **Owner-supplied inputs:** none to begin; Owner authorization required
  before any Tier 2/3 capability is enabled (none is enabled by this
  package).
- **Implementation / process scope:** OER structure; the eight-disposition
  set (PROCEED, QUALIFY, PRESERVE DISCREPANCY, REQUEST INQUIRY, RETAIN
  MULTIPLE HYPOTHESES, ESCALATE, ABSTAIN, FAIL CLOSED); Tier 0/1 enforcement.
  Tier 2 (canonical-data mutation) and Tier 3 (external side effects) remain
  explicitly unimplemented/disabled pending separate authorization.
- **Explicit non-scope:** no Tier 2/3 capability enabled; no AI feature
  enablement.
- **Required evidence:** implementation + tests for every disposition;
  adversarial tests for Step 8 cases K, L; OER completeness tests;
  reproducibility.
- **Negative / failure evidence:** test proving untrusted content cannot
  elevate authority (case L); test proving "modify operational data" stays
  fail-closed/unmapped, never silently treated as Tier 1.
- **Acceptance criteria:** every disposition demonstrably reachable and
  correctly triggered under test; Tier boundary enforced; no heuristic
  fallback on handoff failure.
- **Fail-closed condition:** handoff failure fails closed, never falls back
  to an unverified heuristic.
- **Closure authority:** engineering evidence only; P7's state is changed
  only by PRM-WP18.
- **Downstream packages unlocked:** PRM-WP07, and (jointly with WP01) PRM-WP08.

---

### PRM-WP07 — Consequentiality & Absolute Fail-Closed Enforcement

- **Purpose:** Implement Step 6 §9.3's consequentiality classification
  (output roll-up / proposed-use classification / consequential-decision
  act) and the absolute technical fail-closed enforcement for machine
  consequential-decision candidates.
- **P-gate(s) addressed:** P11 (primary); materially informs P7's
  completeness.
- **Findings addressed:** F-11 (PARTIALLY SPECIFIED / OPEN) — central to this
  package; implementation MUST NOT resolve F-11's unresolved "materially
  determine or control" boundary by engineering guess. A novel case falling
  in that gap requires OWNER ADJUDICATION, or is constrained out of scope, or
  fails closed. PR8-1 also relevant.
- **Controlling source:** Step 6 §9, §11; Step 5 (via PRM-WP06).
- **Dependencies:** PRM-WP06 and Step 6 authority context.
- **Authorized future work type:** engineering implementation, later-
  authorized, L2-class; Owner adjudication required for any F-11 boundary
  case surfaced during design.
- **Required inputs:** Step 6 §9.3.1/§9.3.2/§9.3.3; F-11's exact current
  specification and unresolved scope.
- **Owner-supplied inputs:** adjudication of any novel consequentiality
  boundary case this package's design surfaces that F-11 does not already
  resolve.
- **Implementation / process scope:** §9.3.1 output roll-up (secondary,
  non-authoritative); §9.3.2 proposed-use classification; absolute technical
  fail-closed for §9.3.3 candidates.
- **Explicit non-scope:** no mechanism that routes a consequential-decision
  candidate "for approval" — that pattern is prohibited outright (Step 8
  adversarial case W); no performance of the consequential decision itself,
  under any framing.
- **Required evidence:** implementation + tests for the absolute fail-closed
  path (case W); tests confirming ROLL-UP UNRESOLVED rows (Developmental
  interpretation, Contextual inference, Contextual hypothesis, Inquiry
  signal, Discrepancy signal) are never silently assigned a roll-up;
  reproducibility.
- **Negative / failure evidence:** a test that attempts to route a
  consequential-decision candidate through any path (approval-routing,
  human-review bypass, disposition substitution) and confirms rejection.
- **Acceptance criteria:** demonstrated, reproducible, absolute technical
  fail-closed for every consequential-decision-candidate test case; F-11's
  remaining open scope explicitly documented as still open.
- **Fail-closed condition:** this package's entire purpose is the fail-closed
  condition — partial success does not relax it.
- **Closure authority:** engineering evidence + Owner adjudication of any
  F-11 boundary case surfaced; P11's state is changed only by PRM-WP18; F-11
  itself closes only by a separate, explicit Owner/policy determination,
  never by this package's implementation alone.
- **Downstream packages unlocked:** strengthens PRM-WP17 (rehearsal scenarios
  11, 12; adversarial V, W).

---

### PRM-WP08 — Privacy / Purpose / Consent Technical Enforcement

- **Purpose:** Implement Step 6 §4–§5's purpose-authorization and
  consent/assent technical enforcement.
- **P-gate(s) addressed:** P8 (primary); the technical portion of P9.
- **Findings addressed:** PR8-1; the consent/DPA evidence at Step 8 §9.2
  (migration file merged to baseline; enforcement application code confirmed
  absent).
- **Controlling source:** Step 6 §4, §5.
- **Dependencies — START:** PRM-WP01 (purpose/recipient/data-domain scope
  alignment). Core purpose-authorization and consent/assent-check logic can
  be designed and unit-implemented against WP01's scope alone, independent of
  PRM-WP06's completion.
  **Dependencies — COMPLETION / INTEGRATION:** PRM-WP06. The enforcement
  logic cannot be verified as actually gating real requests until it is wired
  into PRM-WP06's orchestration/Tier substrate; final acceptance therefore
  requires PRM-WP06 to exist, even though initial design/implementation does
  not.
- **Authorized future work type:** engineering implementation under later
  explicit authorization AND explicit Owner authorization specifically for
  any RLS/auth-adjacent change (CLAUDE.md §3: explain → propose → approve →
  stage; production SQL is human-only).
- **Required inputs:** the existing `ai_processing_consent` migration and its
  known gap; PRM-WP01's purpose/recipient/data-domain scope.
- **Owner-supplied inputs:** explicit approval before merging or applying any
  consent-enforcement code or RLS/schema change.
- **Implementation / process scope:** purpose-authorization check;
  consent/assent enforcement wiring (`has_ai_consent()` and equivalent);
  read/write/share/export scope enforcement; retention-enforcement hooks.
- **Explicit non-scope:** no lawful-basis/consenting-age/legal decision
  (that is PRM-WP09's domain); no production SQL/migration application
  without separate Owner go-ahead; no real consent collection.
- **Required evidence:** implementation + tests (positive/negative) for
  purpose/consent enforcement; adversarial tests for Step 8 cases N, O;
  reproducibility; a recorded Owner approval prior to any RLS/migration
  application beyond a test/preview environment.
- **Negative / failure evidence:** test proving a request without established
  purpose authorization fails closed (Step 8 rehearsal scenario 7).
- **Acceptance criteria:** demonstrated, reproducible enforcement under test
  in a non-production environment; Owner approval recorded for any schema/RLS
  change before application anywhere beyond test/preview.
- **Fail-closed condition:** unresolved purpose/consent state fails closed;
  absence of a safeguard is never permission (Step 6 §6.3).
- **Closure authority:** engineering evidence + Owner approval for any
  schema/RLS change; P8's state is changed only by PRM-WP18. This package
  does not constitute or substitute for PRM-WP09's legal sign-off.
- **Downstream packages unlocked:** strengthens PRM-WP10, PRM-WP17.

---

### PRM-WP09 — Legal & Policy Pilot Readiness

- **Purpose:** Bring the existing `docs/legal/` DRAFT pack to a legally
  reviewed, Owner/School-approved state.
- **P-gate(s) addressed:** P8 / P9 (human/legal evidence portion).
- **Findings addressed:** none of the carried findings directly govern this
  authority track; it remedies the legal-review gap Step 8 §9.2/§17 (PR8-1's
  DRAFT-pack citation) identified.
- **Controlling source:** Step 6 §4–§8 (the requirements the legal pack must
  satisfy); `docs/legal/README.md`'s own nine open legal decisions.
- **Dependencies:** PRM-WP01 (pilot scope determines which legal instruments
  are actually needed, e.g. the specific school/site for the DPA).
- **Authorized future work type:** two distinct authority acts, kept
  separate — (i) qualified legal counsel review and determination, and (ii)
  Owner/School factual input and execution. Neither substitutes for the
  other. Claude may only maintain drafts, never approve or determine.
- **Required inputs:** the 12-document `docs/legal/` pack; its nine open
  legal decisions; PRM-WP01's scope.
- **Owner / organizational factual inputs** (facts only the Owner/School can
  supply, not legal determinations): the participating legal entity, school,
  and site; the actual data flows and third-party AI sub-processors in use;
  countries/locations actually involved; pilot operational constraints (e.g.
  cohort size, duration) as already fixed by PRM-WP01.
- **Qualified legal counsel determinations** (require legal advice, not
  Owner fact-supply — per `docs/legal/README.md`'s own `⚖️ LEGAL DECISION`
  markers): applicable jurisdiction/governing law; lawful basis for
  processing; the consenting-age/consent-verification standard; the
  international-transfer mechanism for the actual sub-processors PRM-WP01/
  the Owner identifies; legally required retention periods; DSAR response
  timelines; breach-notification timelines; special-category/sensitive-data
  classification of psychometric minor data. None of these is an
  Owner-supplied input — they are produced BY counsel, informed by the
  Owner/organizational facts above.
- **Implementation / process scope, split by authority:**
  - *Owner/School decision or execution:* signing the School DPA and
    sub-processor DPAs once counsel has determined their required terms;
    publishing the privacy notice once counsel has approved its wording;
    executing the consent-form/assent-text rollout once counsel has approved
    the language; operational adoption of the retention schedule and DSAR
    procedure once counsel has confirmed they meet legal requirements.
  - *Legal counsel review/sign-off:* determining each item in the "qualified
    legal counsel determinations" list above; reviewing and approving the
    wording of every document in `docs/legal/` before it is relied upon for
    pilot entry; issuing the sign-off record.
- **Explicit non-scope:** Claude does not draft final legal language beyond
  existing structural placeholders; Claude approves, signs, or determines
  nothing; the Owner does not supply a legal determination in place of
  counsel, and counsel does not execute an agreement in place of the Owner/
  School; this package is not technical enforcement (that is PRM-WP08).
- **Required evidence:** counsel's determination record for each item in the
  "qualified legal counsel determinations" list; signed/executed DPA(s);
  published privacy notice; finalized consent form and assent text;
  documented retention schedule; documented DSAR procedure; a distinct,
  attributable Owner/School execution record for each item in the "Owner/
  School decision or execution" list.
- **Negative / failure evidence:** any `[[PLACEHOLDER]]` or
  `⚖️ LEGAL DECISION` marker still present in a document being relied on for
  pilot entry is registered UNRESOLVED, never treated as decided; any
  document executed by the Owner/School without a preceding counsel
  determination/sign-off is registered a process defect, not accepted
  evidence.
- **Acceptance criteria:** `docs/legal/PILOT_GATE_CHECKLIST.md` §A (hard
  blockers) fully checked, with each item carrying both its counsel
  determination/sign-off record and, where applicable, its separate Owner/
  School execution record.
- **Fail-closed condition:** any unresolved §A item, or any item missing
  either its counsel determination or its Owner/School execution record,
  blocks P8/P9 human-evidence closure regardless of technical-enforcement
  status.
- **Closure authority:** qualified legal counsel (for the determinations
  list) and Owner/School (for the execution list) — jointly required, never
  either alone.
- **Downstream packages unlocked:** strengthens P8/P9 re-assessment at
  PRM-WP18; precondition for any real-data pilot regardless of PRM-WP08's
  technical completion.

---

### PRM-WP10 — Safeguarding Operational Boundary & Routing Readiness

- **Purpose:** Establish and evidence the operational adequacy of the
  detect→stop→route→never-investigate safeguarding boundary (Step 6 §8)
  against the actual pilot scope.
- **P-gate(s) addressed:** P9 (safeguarding portion).
- **Findings addressed:** L-1 (AFFIRMED CONSTRAINT, preserved absolutely,
  never relaxed by this package); PR8-3.
- **Controlling source:** Step 6 §8; Step 8 §9.1/§9.2 (existing safeguarding-
  adjacent code cited, adequacy unassessed).
- **Dependencies:** PRM-WP01 (scope determines which routing paths are
  actually exercised).
- **Authorized future work type:** two distinct authority acts, kept
  separate — safeguarding adequacy review and determination belongs
  exclusively to the qualified safeguarding authority; Owner acts are limited
  to designation of that authority, supply of organizational/pilot facts, and
  organizational adoption/assignment of the responsible safeguarding process
  where that assignment is within Owner authority (e.g. naming which staff
  role receives an escalation, once the safeguarding authority has determined
  the routing design is adequate). The Owner does not determine adequacy.
  Claude may inventory/document existing code (`StudentCoach.tsx`,
  `ParentCoach.tsx`, `parent-coach` edge function) but must not determine
  adequacy itself.
- **Required inputs:** existing safeguarding-adjacent code inventory (Step 8
  §9.2); Step 6 §8's exact boundary requirements.
- **Owner-supplied inputs:** designation of a qualified safeguarding
  authority; relevant organizational/pilot facts the authority needs to
  perform its review (e.g. actual routing paths, actual staff/process
  available to receive an escalation); organizational adoption/assignment of
  the responsible safeguarding process once the authority has determined it
  adequate; the Owner's acceptance of the resulting operational arrangement
  for the pilot. The Owner does not supply, and cannot supply, the adequacy
  determination itself — that is safeguarding-authority-produced evidence,
  not an Owner input (see Required evidence).
- **Implementation / process scope:** qualified-authority review of existing
  detect/stop/route code against Step 6 §8; gap remediation if deficiencies
  are found (separately authorized engineering work); confidentiality-limit
  disclosure design.
- **Explicit non-scope:** Claude does not self-certify safeguarding adequacy;
  the Owner does not certify safeguarding adequacy; no AI investigation/
  determination capability is ever introduced, regardless of this package's
  outcome (Step 6 §8.1, absolute).
- **Required evidence:** the qualified safeguarding authority's written
  adequacy determination (or gap list) — this is safeguarding-authority-
  produced evidence, not an Owner-supplied input; evidence the stop/route
  behavior is demonstrated, not merely coded; reviewed confidentiality-limit
  disclosure text; the Owner's organizational-adoption record, kept as a
  separate, distinct evidence item from the authority's determination.
- **Negative / failure evidence:** any gap the safeguarding authority
  identifies is registered OPEN, never silently closed by engineering
  self-assessment or by Owner acceptance of the operational arrangement in
  place of the authority's own determination.
- **Acceptance criteria:** the qualified safeguarding authority issues an
  explicit adequacy determination for the actual pilot-scoped routing paths,
  AND the Owner has organizationally adopted/assigned the resulting process.
  Either alone is insufficient.
- **Fail-closed condition:** absent a positive adequacy determination FROM
  THE QUALIFIED SAFEGUARDING AUTHORITY specifically, the safeguarding-routing
  path remains NOT SATISFIED regardless of code presence, regardless of
  Owner acceptance, and regardless of any Owner-side organizational
  assignment made without that determination.
- **Closure authority:** the safeguarding-adequacy conclusion is closed
  exclusively by the qualified safeguarding authority; the organizational-
  adoption/assignment record is closed by the Owner. Neither substitutes for
  the other, and this package is not accepted on either alone.
- **Downstream packages unlocked:** strengthens PRM-WP17 (rehearsal scenario
  9) and P9 re-assessment at PRM-WP18.

---

### PRM-WP11 — Reviewer Competence / Human Review Model

- **Purpose:** Establish named, dimension-specific, competent human reviewers
  distinct from platform role.
- **P-gate(s) addressed:** P10.
- **Findings addressed:** F-12 (PARTIALLY SPECIFIED / OPEN); M-2 (PARTIALLY
  SPECIFIED / OPEN).
- **Controlling source:** Step 6 §5.3, §10; Step 8 §10.1.
- **Dependencies — START:** PRM-WP01 (scope determines which review
  dimensions are exercised). Role naming, competence-basis documentation, and
  the roster itself can be produced against WP01's scope alone.
  **Dependencies — COMPLETION / VALIDATION:** PRM-WP06. A functioning,
  recorded review event (not merely a named roster) requires PRM-WP06's OER
  to exist; full validation of this package's review-event evidence is
  therefore gated on PRM-WP06, even though role-naming is not.
- **Authorized future work type:** Owner role-naming + qualified-authority
  competence attestation; Claude may prepare a competence-basis template.
- **Required inputs:** Step 6 §5.3's platform-role≠competence rule; Step 8
  §10.1's reviewer requirements (attributable, competence-specific,
  provenance-informed, genuine change/reject/withhold/inquire ability,
  recorded review event).
- **Owner-supplied inputs:** named reviewer identities per dimension. The
  Owner names and assigns people; the Owner does not, by naming someone,
  certify their competence — competence attestation is a separate act by the
  appropriate qualified authority for that dimension (below).
- **Dimension-specific competence authority** (reviewer competence is not
  uniform — each dimension requires attestation from the qualified authority
  for that specific dimension, never from platform role or Owner assignment
  alone): scientific/interpretation-correspondence review → qualified
  scientific/review authority (addressing M-2); safeguarding-adjacent review
  → qualified safeguarding authority (aligned with PRM-WP10); privacy/legal
  review → qualified legal/privacy authority where applicable (aligned with
  PRM-WP09); any other professional dimension the pilot scope surfaces → the
  correspondingly appropriate qualified human authority for that dimension,
  identified when the dimension is identified, not assumed in advance.
- **Implementation / process scope:** reviewer role definition distinct from
  `app_role`/`superadmin`; review-event recording design (engineering,
  separately authorized); competence-basis documentation per dimension,
  matched to the correct qualified authority above.
- **Explicit non-scope:** Claude does not name individuals unless the Owner
  supplies them; Claude certifies no one's competence, for any dimension;
  Owner naming alone does not substitute for a qualified authority's
  competence attestation, for any dimension.
- **Required evidence:** a named reviewer roster with, per dimension, both
  the Owner's naming record and the correct qualified authority's competence
  attestation; a functioning review-event record once PRM-WP06's OER exists;
  concrete named-authority evidence relevant to F-12/M-2.
- **Negative / failure evidence:** any dimension without a named reviewer, or
  with a named reviewer lacking the correct dimension-specific competence
  attestation (e.g. a scientific dimension attested only by a safeguarding
  authority, or by no one), is registered UNRESOLVED for that dimension.
- **Acceptance criteria:** every review-requiring dimension in the actual
  pilot scope has both a named reviewer and a competence attestation from the
  correct qualified authority for that specific dimension.
- **Fail-closed condition:** absence of a competent, correctly-attested
  reviewer for a dimension means its dependent output fails closed or
  escalates, never releases on platform-role or Owner-naming basis alone.
- **Closure authority:** Owner (naming) + the correct dimension-specific
  qualified authority (competence attestation) — jointly, per dimension. This
  package may produce evidence relevant to F-12/M-2 but does not itself close
  either.
- **Downstream packages unlocked:** PRM-WP17 (rehearsal scenario 10); P10
  re-assessment at PRM-WP18.

---

### PRM-WP12 — Audit / Replay Gap Analysis

- **Purpose:** Perform a field-by-field comparison of existing audit/logging
  schema against Step 7 §13.1's required reconstructable record, before
  assuming new implementation is needed.
- **P-gate(s) addressed:** P12.
- **Findings addressed:** PR8-1 (partial — general audit infrastructure
  exists per Step 8 §11.2).
- **Controlling source:** Step 7 §13.1; existing `audit_logging.sql` /
  `ai_logging.sql` migrations.
- **Dependencies:** none — this package can begin read-only immediately,
  independent of PRM-WP01–WP11's completion.
- **Authorized future work type:** read-only engineering analysis, later-
  authorized.
- **Required inputs:** existing migration schema; Step 7 §13.1's full
  reconstructable-record field list.
- **Owner-supplied inputs:** none required.
- **Implementation / process scope:** field-by-field mapping of existing
  schema to required fields (request, purpose, scope, authority, canonical
  versions, evidence/provenance, scientific determinations, Step 4
  classifications, orchestration roles/dispositions, Step 6 six dimensions,
  human review, safeguarding routing, final disposition, later use, stop/
  escalation, incident); missing-field register.
- **Explicit non-scope:** no new logging implementation — produces only the
  gap analysis.
- **Required evidence:** the field-by-field mapping document; explicit
  missing-field register; one of three outcomes reached only with positive
  supporting evidence — **A** (existing fields sufficient) requires positive
  evidence of sufficiency for every required field; **B** (partially
  sufficient) requires positive evidence of which fields are covered plus an
  explicit list of which are missing; **C** (new implementation required)
  requires positive evidence that a required capability is genuinely absent.
  Where the mapping itself cannot reach one of these three evidenced
  conclusions, the result is **UNRESOLVED / NOT EVIDENCED** — no A/B/C
  conclusion is fabricated to force a decision.
- **Negative / failure evidence:** any field with genuinely ambiguous
  coverage is registered UNRESOLVED, never assumed covered under A, and never
  assumed missing under C without positive evidence either way.
- **Acceptance criteria:** complete field-by-field mapping produced; either
  one of A/B/C is reached with positive evidence, or the result is
  UNRESOLVED / NOT EVIDENCED with the specific ambiguous fields named.
- **Fail-closed condition:** an inconclusive mapping is recorded UNRESOLVED /
  NOT EVIDENCED and blocks reliance on P12 evidence at PRM-WP18 — it is never
  silently converted into outcome C or any other conclusion. An UNRESOLVED
  result does not automatically trigger PRM-WP13 either; it first requires a
  targeted follow-up evidence analysis (a narrower repeat of this package's
  method against the specific ambiguous fields) before B/C can be reached and
  PRM-WP13 considered.
- **Closure authority:** engineering evidence review; determines whether
  PRM-WP13 is triggered — triggering requires an evidence-supported B or C
  result specifically, never an UNRESOLVED one.
- **Downstream packages unlocked:** PRM-WP13 (conditional).

---

### PRM-WP13 — Audit / Replay Remediation (CONDITIONAL)

- **Purpose:** Implement whatever audit/logging gap PRM-WP12 identifies.
- **P-gate(s) addressed:** P12.
- **Findings addressed:** PR8-1.
- **Controlling source:** Step 7 §13.1; PRM-WP12's missing-field register.
- **Dependencies — START:** an evidence-supported PRM-WP12 outcome of B or C,
  strictly. This package does not exist as active work from an UNRESOLVED /
  NOT EVIDENCED PRM-WP12 result (that requires a follow-up evidence analysis
  first, per PRM-WP12) and does not exist as active work if PRM-WP12
  concludes outcome A (recorded not-needed, with the evidence basis, never
  silently skipped).
  **Dependencies — COMPLETION / END-TO-END VALIDATION:** PRM-WP02–WP08. The
  specific missing fields PRM-WP12 identifies can be implemented in the
  schema as soon as this package starts, but confirming the full Step 7
  §13.1 record is actually reconstructable end-to-end requires PRM-WP02–WP08
  to exist and produce real logged fields to reconstruct from. Schema-level
  implementation is therefore not blocked on PRM-WP02–WP08; final,
  end-to-end acceptance is.
- **Authorized future work type:** engineering implementation, later-
  authorized, and only if triggered.
- **Required inputs:** PRM-WP12's missing-field register.
- **Owner-supplied inputs:** none beyond the general later-implementation
  authorization.
- **Implementation / process scope:** exactly what PRM-WP12 identifies as
  missing — no broader scope assumed.
- **Explicit non-scope:** does not re-litigate PRM-WP12's mapping; does not
  implement fields already found sufficient.
- **Required evidence:** implementation + tests closing PRM-WP12's specific
  gaps; a successful end-to-end reconstruction demonstration once PRM-WP02–
  WP08 exist to generate the logged fields.
- **Negative / failure evidence:** a regression test confirming that, before
  this package's specific fix, the identified gap actually causes
  reconstruction to fail (proving the gap is real and the fix addresses it,
  not merely that reconstruction succeeds after the fact); any field PRM-WP12
  identified as missing that remains uncaptured after this package's
  implementation is registered as an open gap, not silently dropped.
- **Acceptance criteria:** every field PRM-WP12 identified as missing is now
  demonstrably captured, with end-to-end reconstruction confirmed once
  PRM-WP02–WP08 exist.
- **Fail-closed condition:** an unreconstructable path remains non-
  releasable (Step 8 adversarial case X) regardless of partial progress.
- **Closure authority:** engineering evidence; P12's state is changed only
  by PRM-WP18.
- **Downstream packages unlocked:** PRM-WP17 (only once this package, if
  triggered, is complete — see PRM-WP17's own dependency statement), and
  PRM-WP18.

---

### PRM-WP14 — Pilot Environment Architecture Decision & Isolation Evidence

- **Purpose:** Owner decision on pilot/staging environment architecture,
  plus evidence of the resulting isolation boundary.
- **P-gate(s) addressed:** P13.
- **Findings addressed:** PR8-2.
- **Controlling source:** Step 8 §3.3.
- **Dependencies:** none strictly upstream; should be decided before any
  real pilot deployment or real-data activity; benefits from, but is not
  strictly blocked by, PRM-WP01's scope.
- **Authorized future work type:** Owner architecture decision; engineering
  implementation of the chosen architecture under later separate
  authorization.
- **Required inputs:** Step 8 §13's environment-isolation requirements; the
  current single-production-environment baseline fact (Step 8 §9.2/§16.1
  P13).
- **Owner-supplied inputs:** the architecture choice itself (dedicated
  staging/pilot environment; isolated test project; another explicitly
  bounded design) — Claude does not choose on the Owner's behalf.
- **Implementation / process scope:** once chosen, evidence-gathering for
  data-store, secrets, access, deployment, logging, test/real-data,
  external-integration, and production-isolation boundaries, plus rollback/
  containment posture.
- **Explicit non-scope:** no production infrastructure change without
  separate Owner-authorized implementation; no real student data at any
  point.
- **Required evidence:** a documented architecture-decision record; evidence
  for each of the nine boundary types, specific to the chosen architecture.
- **Negative / failure evidence:** any boundary type without positive
  evidence is registered UNRESOLVED for that boundary specifically.
- **Acceptance criteria:** architecture decided; all nine boundary types
  evidenced for the chosen design.
- **Fail-closed condition:** absent full boundary evidence, no real-data
  pilot activity may occur in the environment, regardless of architecture
  choice.
- **Closure authority:** Owner (decision) + engineering (evidence, once
  implemented).
- **Downstream packages unlocked:** precondition for any real-data pilot
  activity, which remains explicitly out of scope for this entire plan.

---

### PRM-WP15 — Incident / Stop / Non-Resumption Runbook

- **Purpose:** Author the pilot incident-response/stop-authority runbook
  Step 8 identified as absent.
- **P-gate(s) addressed:** P14.
- **Findings addressed:** PR8-3.
- **Controlling source:** Step 8 §12.
- **Dependencies — START:** none. The runbook's structure (every §12.2 stop
  condition, the escalation chain, the evidence-preservation procedure) can
  be drafted immediately, independent of any other package.
  **Dependencies — COMPLETION / OPERATIONAL VALIDATION:** PRM-WP01 (named
  stop/incident authority), PRM-WP16 (the broader named operating roles this
  runbook's escalation chain routes to, including resumption authority), and
  PRM-WP14 (the concrete environment the runbook's containment steps apply
  to). The runbook cannot be operationally validated — as opposed to merely
  drafted — until all three supply concrete, named content.
- **Authorized future work type:** Owner + engineering-process
  documentation; Claude may draft a structural template.
- **Required inputs:** Step 8 §12.1's STOP PILOT PATH → PRESERVE EVIDENCE →
  RECORD INCIDENT → HUMAN/OWNER ESCALATION → NO AUTOMATED RESUMPTION chain;
  §12.2's minimum stop conditions.
- **Owner-supplied inputs:** the actual named stop/incident authority and
  resumption-authorization process (overlaps PRM-WP01/WP16's role-naming).
- **Implementation / process scope:** a runbook document covering every
  §12.2 stop condition, the escalation path, the evidence-preservation
  procedure, and the explicit non-resumption-without-reauthorization rule.
- **Explicit non-scope:** does not itself grant anyone stop/incident
  authority (an Owner act); does not implement the technical containment
  mechanisms (PRM-WP02–WP07's job; this documents the human process around
  them).
- **Required evidence:** a complete runbook document; confirmation every
  §12.2 condition has a documented response path.
- **Negative / failure evidence:** any §12.2 condition without a documented
  response is registered a runbook gap.
- **Acceptance criteria:** runbook complete and covers all minimum stop
  conditions, with named responsible parties once PRM-WP01/WP16 supply them.
- **Fail-closed condition:** an undocumented stop condition defaults to the
  most conservative response (full stop, Owner escalation) until documented.
- **Closure authority:** Owner.
- **Downstream packages unlocked:** P14 re-assessment at PRM-WP18;
  operational context for PRM-WP17's stop/non-resumption scenarios (17, 18).

---

### PRM-WP16 — Pilot Human Operating Model

- **Purpose:** Establish the full named human operating model Step 8 §13.1
  requires.
- **P-gate(s) addressed:** P15.
- **Findings addressed:** PR8-3.
- **Controlling source:** Step 8 §13.1.
- **Dependencies:** PRM-WP01 (role scope tied to pilot parameters); overlaps
  PRM-WP11 (reviewer roles) and PRM-WP15 (stop authority) but covers the
  broader operating set.
- **Authorized future work type:** Owner role assignment; Claude may prepare
  a role-definition template.
- **Required inputs:** Step 8 §13.1's full role list (pilot owner,
  operational lead, reviewer roles and competence basis, safeguarding-
  responsible process, incident/stop authority, resumption authority,
  support/escalation route, participant/guardian communication
  responsibility, confidentiality-communication responsibility, review/audit
  responsibility).
- **Owner-supplied inputs:** every named role and its holder.
- **Implementation / process scope:** role definitions, responsibility
  boundaries, and their documented relationship to PRM-WP11 and PRM-WP15.
- **Explicit non-scope:** Claude does not name individuals or assess their
  competence for these roles.
- **Required evidence:** a complete, named operating-model document with
  every §13.1 role assigned.
- **Negative / failure evidence:** any unassigned role is registered an open
  gap for P15.
- **Acceptance criteria:** every §13.1 role has a named, Owner-attributed
  holder.
- **Fail-closed condition:** absence of a named holder blocks reliance on
  that role's function during any pilot activity.
- **Closure authority:** Owner.
- **Downstream packages unlocked:** P15 re-assessment at PRM-WP18; a Tier B
  prerequisite for PRM-WP17 scenario 9 (a real named safeguarding-responsible
  destination) and scenario 18 (the named resumption authority), and, jointly
  with PRM-WP15, for scenario 17 (the named escalation authority receiving
  the runbook's chain). Not a prerequisite for scenario 10, which is a
  negative test of the review-sufficiency gate itself and requires no
  PRM-WP16 (or PRM-WP11) evidence.

---

### PRM-WP17 — Synthetic RGKB Rehearsal Execution

- **Purpose:** Execute the accepted Step 8 §14.2 18-scenario rehearsal
  matrix against actually implemented runtime, using synthetic/non-person
  data only.
- **P-gate(s) addressed:** P16 (primary); execution produces corroborating
  evidence relevant to P3–P11 as a byproduct.
- **Findings addressed:** PR8-1 (this package is the direct remedy — it
  cannot run until the runtime PR8-1 identifies as missing actually exists).
- **Controlling source:** Step 8 §14 (all 18 fully fielded scenarios) —
  grounded here field-by-field, not by wave position.
- **Dependencies — three tiers, kept distinct:**
  - **Tier A — START / technical execution** (needed to run the rehearsal at
    all, for any scenario): PRM-WP02–WP07 implemented; PRM-WP08's core
    enforcement logic implemented (its full WP06-integration per PRM-WP08's
    own completion dependency); a provisioned, isolated non-production
    environment (PRM-WP14). Absent Tier A, no scenario can be executed at
    all, and the whole rehearsal is NOT EVIDENCED.
  - **Tier B — SCENARIO-SPECIFIC full-evidence prerequisites**, determined
    from each scenario's own Step 8 §14.2 fields, not assumed from wave
    position:
    - *Scenario 9 (safeguarding routing):* Step 8 §14.2 states "Human action
      if any: mandatory — routed to the responsible human safeguarding
      process." This step cannot be genuinely exercised without a real,
      named destination. Full evidence requires PRM-WP16 (the named
      safeguarding-responsible role/process) to exist. It does NOT require
      PRM-WP10's own adequacy determination to be complete — PRM-WP10
      answers whether the boundary is adequate, a distinct question from
      whether the mechanical stop→route→log behavior can be demonstrated
      against a real destination. PRM-WP10 remains a separate, non-
      substitutable requirement for the broader P9 gate at PRM-WP18, not a
      strict precondition for scenario 9's rehearsal evidence specifically.
    - *Scenario 10 (reviewer competence unavailable):* Step 8 §14.2's entry
      condition IS the absence of a competence-evidenced reviewer; its
      Applicable Step 6 dimension is "REVIEW insufficient or not performed."
      This is a negative test of the review-sufficiency gate itself (part of
      Tier A's Track 1 substrate, specifically Step 6's dimension-checking
      logic within PRM-WP06/WP08). It does NOT require PRM-WP11's named
      roster to be complete — testing "unavailable" is most faithfully done
      precisely when no reviewer is yet configured for the dimension under
      test, or, if PRM-WP11 has since named reviewers for other dimensions,
      by exercising a dimension PRM-WP11 has not yet covered. PRM-WP11 is
      not a Tier B prerequisite for this scenario.
    - *Scenario 17 (environment/production-boundary violation):* Step 8
      §14.2 states "Human action if any: mandatory — STOP PILOT PATH →
      PRESERVE EVIDENCE → RECORD INCIDENT → HUMAN/OWNER ESCALATION → NO
      AUTOMATED RESUMPTION." Full evidence requires PRM-WP15 (the runbook
      defining this exact chain) and PRM-WP16 (a named human/Owner
      escalation authority to actually receive the escalation), in addition
      to Tier A's PRM-WP14 (an actual environment boundary to test crossing).
    - *Scenario 18 (stop condition / controlled non-resumption):* Step 8
      §14.2 states "Human action if any: mandatory — the named human
      authority of §13 must explicitly re-authorize before the path may
      resume; no automated retry." This is explicit and unconditional: full
      evidence requires PRM-WP16 complete, with an actual named resumption
      authority, since the scenario's entire content is that specific human
      act.
    - No scenario in Step 8 §14.2 references legal/DPA/consent-document
      completion as a Human Action, Audit Evidence, or Stop/Failure
      condition; PRM-WP09 is therefore NOT a Tier B (or Tier A) prerequisite
      for any PRM-WP17 scenario, regardless of its position in any execution
      wave. Scenario 16 (audit/replay evidence missing) requires the
      audit-readiness branch resolved: either (A) PRM-WP12 concluded outcome
      A with evidence (existing audit substrate sufficient, PRM-WP13 not
      needed), or (B/C) PRM-WP12 found a material gap and the triggered
      PRM-WP13 has completed.
  - **Tier C — FULL PRM-WP17 ACCEPTANCE**: every scenario's Tier A
    requirement, plus each scenario's own Tier B requirement where it has
    one. A scenario whose Tier B prerequisite is unmet is reported NOT
    EVIDENCED for that scenario specifically — the rehearsal is not silently
    marked passed for it, and no assumption or mock substitutes for a
    mandatory Step 8 human action unless Step 8's own scenario text permits a
    synthetic stand-in (none of scenarios 9, 17, or 18 do — each specifies an
    actual human act). A full PRM-WP17 rehearsal must not bypass a triggered,
    incomplete PRM-WP13; scenario 16 remains NOT EVIDENCED until the
    audit-readiness branch resolves.
- **Authorized future work type:** engineering test execution, later-
  authorized; must run in an isolated environment with zero real student
  data.
- **Required inputs:** Step 8 §14.2's complete scenario definitions; the
  implemented runtime (Tier A); for Tier B scenarios specifically, PRM-WP16's
  named operating roles (scenarios 9, 18) and PRM-WP15's runbook (scenario
  17).
- **Owner-supplied inputs:** none directly to this package beyond the
  environment (PRM-WP14) and prior authorizations; PRM-WP16's named roles are
  Owner-supplied to PRM-WP16, consumed here as a Tier B input, not re-supplied
  to PRM-WP17 separately.
- **Implementation / process scope:** execute all 18 scenarios (positive
  path; QUALIFY; discrepancy; inquiry; multiple hypotheses; abstention;
  privacy failure; minor-safeguard failure; safeguarding routing; reviewer
  unavailable; unresolved consequentiality; prohibited consequential-decision
  candidate; untrusted content; external-tool boundary; version mismatch;
  audit/replay failure; environment violation; stop/non-resumption); record
  expected vs. actual for each.
- **Explicit non-scope:** no real participant data under any circumstance
  (Step 8 §1.3 principle 11, absolute); no production system access; no
  actual consequential use.
- **Required evidence:** an executable rehearsal record per scenario;
  expected-vs-actual comparison; full run provenance; confirmation of zero
  unauthorized side effects and zero real student data; any defect or
  failure explicitly registered, never hidden or silently re-run until
  passing.
- **Negative / failure evidence:** any scenario not matching its expected
  outcome is registered a rehearsal FAILURE with the discrepancy documented
  — never treated as the matrix being wrong.
- **Acceptance criteria:** all 18 scenarios executed with recorded expected-
  vs-actual results; any mismatch triaged through the same governed
  correction discipline used for Steps 1–8, never silently.
- **Fail-closed condition:** an unexecutable scenario (missing runtime
  dependency) is registered NOT EVIDENCED for that scenario, never marked
  passed by assumption.
- **Closure authority:** engineering evidence; P16's state is changed only
  by PRM-WP18.
- **Downstream packages unlocked:** PRM-WP18.

---

### PRM-WP18 — Pilot Readiness Evidence Re-assessment

- **Purpose:** The single, later, formal re-assessment of all 16 P-gates
  using Step 8's own evidence contract, incorporating whatever evidence
  PRM-WP01–WP17 (and conditional WP13) actually produced.
- **P-gate(s) addressed:** P1–P16, all, independently.
- **Findings addressed:** re-examines whether PR8-1/PR8-2/PR8-3 and F-04/
  F-07/F-11/F-12/M-1/M-2 have material new evidence bearing on them; closes
  none of them itself — flags each for separate closure by its own authority
  where evidence now supports it.
- **Controlling source:** Step 8 §5 (evidence model), §16 (gate matrix +
  evidence contract), §1.3 (no-master-score principles).
- **Dependencies:** all required preceding evidence from whichever packages
  actually ran; a partial re-assessment (if only partial remediation
  occurred) is legitimate and must still avoid any composite score. For P12
  specifically, this package consumes PRM-WP12's actual outcome (A, B/C, or
  still UNRESOLVED) and, where B/C was reached, PRM-WP13's actual completion
  state — it does not assume P12 evidence exists merely because PRM-WP12 ran.
- **Authorized future work type:** engineering/evidence-review work, later-
  authorized; not implementation.
- **Required inputs:** every package's produced evidence; the original Step
  8 artifact's exact gate definitions.
- **Owner-supplied inputs:** none required to perform the re-assessment;
  Owner review of the result is expected.
- **Implementation / process scope:** re-evaluate P1–P16 independently to
  SATISFIED / NOT SATISFIED / UNRESOLVED-NOT EVIDENCED / NOT_APPLICABLE,
  using exactly Step 8 §5/§16.1's four-state model and evidence-category
  (A–E) discipline.
- **Explicit non-scope:** no score, percentage, weighted average, or
  composite readiness index under any framing (Step 8 §1.3 principles
  21–26, absolute); no pilot authorization.
- **Required evidence:** an updated evidence contract, gate-by-gate, citing
  the specific package evidence that changed each gate's state (or
  confirming no material change).
- **Negative / failure evidence:** any gate whose produced evidence is
  inconclusive remains UNRESOLVED / NOT EVIDENCED, never upgraded on
  optimism.
- **Acceptance criteria:** every applicable gate independently re-assessed
  with cited evidence; the mandatory plain-language summary is exactly one
  of the two Step 8-defined statements, never a percentage.
- **Fail-closed condition:** this package is not authorized to declare pilot
  readiness even if every gate resolves SATISFIED — the only permitted
  output is "gates evidenced," feeding PRM-WP19, never self-authorization.
- **Closure authority:** this is the only package with authority to change
  P-gate states; the underlying findings (F-11, etc.) still require their
  own separate closure authority per §7's Authority Matrix, not this
  package alone.
- **Downstream packages unlocked:** PRM-WP19.

---

### PRM-WP19 — Owner Pilot Authorization Gate

- **Purpose:** The separate, human, consequential act of authorizing (or
  not) an actual pilot, once PRM-WP18 shows the evidence picture.
- **P-gate(s) addressed:** none — a decision act, not an evidence-producing
  act.
- **Findings addressed:** none directly; presupposes F-11 and any other
  still-open finding has been separately, explicitly addressed by its own
  closure authority before the Owner would reasonably authorize a pilot
  touching the affected functionality.
- **Controlling source:** Step 8 §1.3 principle 26, §6.3, §16.4.
- **Dependencies:** PRM-WP18's result.
- **Authorized future work type:** HUMAN-ONLY.
- **Required inputs:** PRM-WP18's full re-assessment.
- **Owner-supplied inputs:** the authorization decision itself.
- **Implementation / process scope:** none — a decision, not a work product.
- **Explicit non-scope:** no automatic execution; this Master Plan does not
  perform, simulate, or pre-approve this act in any way.
- **Required evidence:** an explicit, dated, attributable Owner decision
  record — either an authorization or an explicit decline/withhold — once
  the Owner reviews PRM-WP18's result.
- **Negative / failure evidence:** absence of any such record means no pilot
  may proceed, regardless of how favorable PRM-WP18's evidence picture is.
- **Acceptance criteria:** an explicit, dated, attributable Owner decision
  record exists — authorize, or decline/withhold. Either outcome satisfies
  this package's own evidence requirement; only "authorize" permits
  proceeding to actual pilot activity, which remains outside this Master
  Plan's scope regardless.
- **Fail-closed condition:** absent explicit Owner authorization, the state
  remains NO PILOT unless and until a valid, dated, attributable Owner
  authorization is granted — this is a standing condition pending that
  specific human act, not an irreversible outcome; the same later explicit
  Owner authorization this package exists to model is the only thing that
  changes it, and no amount of remediation evidence substitutes for it.
- **Closure authority:** Owner, exclusively.
- **Downstream packages unlocked:** actual pilot execution — explicitly out
  of scope for this entire Master Plan and every package within it.

## 6. Dependency Model

This section distinguishes, for every package where they differ, the
dependency that must be satisfied to **start** work from the dependency that
must be satisfied for that work to be **complete / validated / accepted**.
Conflating the two was the source of unnecessary serialization in an earlier
draft of this plan; §5's individual work-package entries are the source of
truth, and this section summarizes them consistently.

### 6.1 Critical path

`PRM-WP02 → PRM-WP03 → PRM-WP04 → PRM-WP05 → PRM-WP06 → PRM-WP07` is the
engineering substrate chain, strictly serial: each layer's semantics require
the previous layer's output, starting from `PRM-WP02`, which itself has no
upstream dependency and may start immediately. `PRM-WP01` is not a
prerequisite for this chain's *start* — it is a prerequisite for
`PRM-WP08`'s *completion* (`PRM-WP08` may start, on core enforcement-logic
design, as soon as `PRM-WP01` concludes, independent of the WP02–WP07 chain's
progress, but its final integration requires `PRM-WP06`). The critical path is
therefore:

`PRM-WP02 → PRM-WP03 → PRM-WP04 → PRM-WP05 → PRM-WP06 → PRM-WP07 →`
`PRM-WP08 (completion, also requires PRM-WP01) →`
`PRM-WP17 (also requires the audit-readiness branch, §6.3, and PRM-WP14) →`
`PRM-WP18 → PRM-WP19` (human-only, terminal).

This is the longest chain and determines the earliest possible point at which
`PRM-WP17` (and therefore `PRM-WP18`/`WP19`) can begin. `PRM-WP01` joins this
chain at `PRM-WP08`'s completion, not at the chain's start — if `PRM-WP01`
completes before `PRM-WP07` finishes, it adds no additional delay; if it
completes later, it becomes the limiting factor for `PRM-WP08`'s completion
specifically.

### 6.2 Parallel, non-critical-path tracks

- `PRM-WP09` (legal), `PRM-WP10` (safeguarding) depend only on `PRM-WP01`,
  not on the engineering chain, and may run in parallel with
  `PRM-WP02–WP07` once `PRM-WP01` concludes.
- `PRM-WP11` (reviewer competence), `PRM-WP15` (runbook), `PRM-WP16`
  (operating model) may each **start** in parallel with `PRM-WP02–WP07` once
  `PRM-WP01` concludes (or, for `PRM-WP15`'s drafting, immediately, with no
  dependency at all); their **completion/validation** requires `PRM-WP06`
  (for `WP11`'s recorded review event) or `PRM-WP01` + `PRM-WP14` + `PRM-WP16`
  (for `WP15`'s operational validation) as detailed in §5.
- `PRM-WP12` (audit gap analysis) has no dependency at all and may begin
  immediately, in parallel with `PRM-WP01` and `PRM-WP02`. It is not on the
  critical path itself — only its conditional downstream (`PRM-WP13`) and
  `PRM-WP17` scenario 16 depend on its outcome.
- `PRM-WP14` (environment architecture) has no dependency at all and may
  begin immediately, in parallel with `PRM-WP01`/`PRM-WP02`/`PRM-WP12`,
  though its evidence-gathering step benefits from a settled pilot scope, and
  it must conclude before any real-data activity and before `PRM-WP17`.

### 6.3 Conditional package and the audit-readiness branch

`PRM-WP13` exists only if `PRM-WP12` reaches an evidence-supported outcome B
or C. If `PRM-WP12` reaches outcome A, `PRM-WP13` is recorded not-needed with
evidence, never silently omitted. If `PRM-WP12` remains UNRESOLVED / NOT
EVIDENCED, `PRM-WP13` is not triggered either — a targeted follow-up
evidence analysis is required first (per `PRM-WP12`'s own fail-closed
condition). `PRM-WP17`'s audit-readiness branch is therefore exactly one of:
(A) `PRM-WP12` outcome A, evidenced — proceed; (B/C) `PRM-WP12` outcome B or
C, evidenced, AND `PRM-WP13` complete — proceed; anything else (UNRESOLVED,
or B/C with `PRM-WP13` triggered but incomplete) — `PRM-WP17` scenario 16
specifically is NOT EVIDENCED, and `PRM-WP18` must reflect that rather than
assume P12 evidence exists merely because `PRM-WP12` ran.

### 6.4 Convergence point

`PRM-WP17` is the genuine hard convergence point, with dependencies stated
precisely in three tiers (full detail at `PRM-WP17`'s own §5 entry, grounded
scenario-by-scenario in Step 8 §14.2 rather than by wave position):

- **Tier A (start, all scenarios):** the engineering substrate (`WP02–WP08`,
  complete, including `WP08`'s `WP01`-dependent completion) and the
  environment decision (`WP14`).
- **Tier B (specific scenarios only, each individually grounded):** `WP16`
  for scenarios 9 and 18 (a real named destination/authority for a mandatory
  human act); `WP15` + `WP16` for scenario 17 (the runbook chain and its
  named escalation authority); the resolved audit-readiness branch (§6.3) for
  scenario 16. Scenario 10 requires no package beyond Tier A — it is a
  negative test of the review-sufficiency gate itself, not a test requiring
  `WP11`'s roster to be complete. `WP09` and `WP10`'s own adequacy
  determination are not Tier A or Tier B prerequisites for any scenario;
  `WP10`'s determination remains a separate requirement for the P9 gate at
  `PRM-WP18`, distinct from scenario 9's rehearsal evidence.
- **Tier C (full acceptance):** Tier A for every scenario, plus each
  scenario's own Tier B item where it has one; a scenario missing its Tier B
  item is reported NOT EVIDENCED specifically, not silently passed.

`PRM-WP18` requires everything that actually ran, consumed accurately rather
than assumed — including which PRM-WP17 scenarios reached full (Tier C)
evidence versus which remained NOT EVIDENCED for a missing Tier B item.
`PRM-WP19` is strictly downstream of `PRM-WP18` and human-only.

## 7. Authority Matrix

| Authority | Scope in this program |
|---|---|
| **Claude / engineering** | May implement only under a later, separate, explicit implementation authorization (this plan grants none). Performs read-only analysis, drafting, and template preparation now. Names no individual, certifies no one's competence, determines no legal question. |
| **Owner** | Pilot scope, both parameter rows and carrying-forward of governance-fixed rows (WP01); designation of the qualified safeguarding authority, supply of organizational/pilot facts, and organizational adoption/assignment of the resulting process, distinct from and never substituting for the authority's own adequacy determination (WP10); environment architecture decision (WP14); reviewer/role naming — naming only, not competence attestation (WP11, WP15, WP16); RLS/schema-change approval (WP08); Owner/School organizational factual inputs and execution of legal instruments, distinct from and never substituting for counsel's determinations (WP09); adjudication of novel F-11 boundary cases (WP07); review of WP18; the WP19 authorization decision itself. |
| **Qualified legal counsel** | The legal determinations list (lawful basis, consenting age, transfer mechanism, retention/DSAR/breach timelines, special-category classification) and document-wording review/sign-off for the `docs/legal/` pack (WP09); the privacy/legal dimension of reviewer competence attestation where a review dimension is legal/privacy-adjacent (WP11). Cannot be substituted by Owner fact-supply, by engineering evidence, or by Claude. |
| **Qualified safeguarding authority** | Safeguarding operational-adequacy determination (WP10), exclusively — the Owner designates the authority and adopts the resulting process, but does not determine adequacy; the safeguarding dimension of reviewer competence attestation (WP11). Cannot be substituted by Claude's self-assessment, by code review alone, or by Owner naming/adoption/acceptance. |
| **Qualified scientific / review authority** | Fidelity sign-off for Step 3/4 runtime substrates (WP04, WP05); the scientific/interpretation dimension of reviewer competence attestation, addressing M-2 (WP11). Cannot be substituted by Owner naming or platform role. |
| **Human-only Git / prod** | Any `git push`, PR creation, merge, deployment, production SQL, real-data action, or AI-feature enablement, at any point across every work package — unchanged from CLAUDE.md's standing constraints, not modified by this plan. |

No authority category substitutes for another anywhere in this program.
Reviewer competence specifically (WP11) is always attested by the qualified
authority matching the review dimension in question, never by Owner naming,
platform role, or a mismatched authority (e.g. a safeguarding authority
attesting a scientific dimension).

## 8. Findings Map

| Finding | Disposition (unchanged) | Primary remediation touchpoint |
|---|---|---|
| PR8-1 | New Phase 8 finding | PRM-WP02–WP08 (runtime); PRM-WP17 (executable proof) |
| PR8-2 | New Phase 8 finding | PRM-WP14 |
| PR8-3 | New Phase 8 finding | PRM-WP15, PRM-WP16 |
| F-04 | OPEN | PRM-WP02 (must not silently resolve) |
| F-07 | OPEN | PRM-WP02 (must not silently resolve) |
| M-1 | OPEN / FAIL-CLOSED | PRM-WP03 (must preserve, not resolve) |
| F-11 | PARTIALLY SPECIFIED / OPEN | PRM-WP07 (central; Owner adjudication path for novel cases) |
| F-12 | PARTIALLY SPECIFIED / OPEN | PRM-WP11 |
| M-2 | PARTIALLY SPECIFIED / OPEN | PRM-WP11 |
| F-08, F-09, F-14 | DEFERRED | No direct touchpoint identified in this program; not reopened |
| L-1 | AFFIRMED CONSTRAINT | PRM-WP10 (preserved absolutely) |
| N-1 | CONFIRMED STRENGTH / NO ACTION | No remediation touchpoint (no action required) |
| F-05, F-06, F-10, F-13 | CLOSED | PRM-WP04 (must reflect closed rationale correctly, not reopen) |

No entry in this table performs a closure. All dispositions above are the
same as Step 8's; this table only maps them to where remediation work
touches them.

## 9. Parallelization Model

- **Track 1 — Engineering runtime:** `WP02–WP07` (strictly ordered
  internally, no dependency on `WP01`), plus `WP08`'s completion (which does
  depend on `WP01`).
- **Track 1b — Audit analysis:** `WP12` (no dependency), plus conditional
  `WP13` (start depends on an evidence-supported `WP12` B/C outcome;
  end-to-end validation depends on Track 1's completion).
- **Track 2 — Legal / privacy:** `WP09` (depends on `WP01`).
- **Track 3 — Safeguarding:** `WP10` (depends on `WP01`).
- **Track 4 — Human operations:** `WP11`, `WP16` (start depends on `WP01`;
  `WP11`'s full validation depends on `WP06`); `WP15` (start has no
  dependency; operational validation depends on `WP01` + `WP14` + `WP16`).
- **Track 5 — Environment:** `WP14` (no dependency).

Tracks 1b, 5, and `WP15`'s drafting have no dependency and may begin
immediately, in parallel with Track 1's start. Tracks 2, 3, and the rest of
Track 4 depend only on `WP01`, not on Track 1's completion, and may run
concurrently with Track 1 once `WP01` concludes — `WP01` itself may run
concurrently with Track 1, since Track 1's start does not require it. Track 1
remains internally serial (`WP02→...→WP07`) because each runtime layer's
semantics require the previous layer's output; no parallelization within
Track 1 is safe. No track bypasses `WP17`'s convergence requirement
(including the audit-readiness branch, §6.3), `WP18`'s sole re-assessment
authority, or `WP19`'s human-only terminal gate.

## 10. Prioritization Model (qualitative, not scored)

No single weighted score is computed. Each work package is classified across
six qualitative dimensions; sequencing decisions (§11) are made by inspecting
these dimensions together, not by combining them into one number.

| WP | Blocking dependency | Safety criticality | Evidence value | Parallelizable | Human-decision dependency | Implementation dependency |
|---|---|---|---|---|---|---|
| WP01 | None | High (scopes safety-relevant work) | High | Cross-cutting | Owner | None |
| WP02 | None | Medium | High | No (serial start) | Low | None |
| WP03 | WP02 | Medium | High | No | Low | WP02 |
| WP04 | WP03 | High (scientific fidelity) | High | No | Medium (scientific authority) | WP03 |
| WP05 | WP04 | High (claim-integrity) | High | No | Medium (scientific authority) | WP04 |
| WP06 | WP05 | High (orchestration safety) | High | No | Low | WP05 |
| WP07 | WP06 | **Highest** (absolute fail-closed) | High | No | High (F-11 adjudication) | WP06 |
| WP08 | WP01 (start); WP06 (completion) | High (minors/privacy) | High | Yes (start, parallel to WP09/10) | High (RLS approval) | None (start); WP06 (completion) |
| WP09 | WP01 | High (legal exposure) | High | Yes | Very high (counsel/School) | None |
| WP10 | WP01 | **Highest** (child safety) | High | Yes | Very high (safeguarding authority) | None |
| WP11 | WP01 | Medium | Medium | Yes | High (named roles) | WP06 (for full validation) |
| WP12 | None | Low | Medium | Yes | None | None |
| WP13 | WP12 evidenced B/C (start) | Medium | Medium | Yes, if triggered | Low | WP12 (start); WP02–WP08 (end-to-end validation) |
| WP14 | None | High (isolation for real data) | High | Yes | High (architecture choice) | None |
| WP15 | None (draft); WP01/WP14/WP16 (validate) | High (containment) | Medium | Yes | Medium | None |
| WP16 | WP01 | High (accountability) | Medium | Yes | High (named roles) | None |
| WP17 | Tier A: WP02–WP08, WP14 (all scenarios). Tier B (scenario-specific): WP16 (sc. 9, 18); WP15+WP16 (sc. 17); audit-readiness branch §6.3 (sc. 16). No dependency on WP09/WP10/WP11 for any scenario (see §6.4) | High (proof of behavior) | **Highest** (executable) | No | Low | All of Track 1, Track 1b |
| WP18 | All produced evidence | High (accuracy of state) | Highest | No | Low | Depends on scope run |
| WP19 | WP18 | **Highest** (human consequential authorization) | N/A | No | **Total** | None |

## 11. Execution Waves

### 11.1 Proposed ordering

- **Wave 0 — Foundation kickoff (parallel):** `WP01`, `WP02`, `WP12`, `WP14`,
  and `WP15`'s drafting all start together; none of the five depends on any
  other, or on anything else.
- **Wave 1 — Core runtime foundation, continued (serial):**
  `WP03 → WP04 → WP05`, continuing the chain `WP02` began in Wave 0.
- **Wave 2 — Orchestration & consequentiality boundary (serial):**
  `WP06 → WP07`.
- **Wave 3 — Privacy / legal / safeguarding (parallel, Owner-scope-aligned):**
  `WP08` starts (core enforcement-logic design, needs only `WP01`); `WP09`;
  `WP10`. `WP08`'s completion additionally requires `WP06` (Wave 2).
- **Wave 4 — Human review / operating governance (parallel):** `WP11` and
  `WP16` start (need only `WP01`); `WP15`'s operational validation becomes
  possible once `WP01`, `WP14`, and `WP16` are all concrete.
- **Wave 5 — Conditional audit remediation:** `WP13`, only if `WP12` (Wave 0)
  reached an evidence-supported outcome B or C; if `WP12` reached outcome A
  or remains UNRESOLVED, this wave performs no `WP13` work (UNRESOLVED
  requires a follow-up evidence analysis under `WP12`'s own discipline before
  `WP13` can be considered at all).
- **Wave 6 — Synthetic rehearsal:** `WP17`, gated precisely on its own
  three-tier dependency model (§6.4, and its full statement at `WP17`'s §5
  entry) — Tier A (`WP02–WP08`, `WP14`) for all scenarios, plus each
  scenario's specific Tier B item where it has one (`WP16` for scenarios 9
  and 18; `WP15`+`WP16` for scenario 17; the resolved audit-readiness branch
  for scenario 16). This is NOT a blanket "every package in Waves 0–5 must
  finish" gate: `WP09`, `WP10`'s own adequacy determination, and `WP11`'s
  full roster are not prerequisites for any `WP17` scenario, and a scenario
  with no Tier B item (e.g. scenario 10) can be fully evidenced from Tier A
  alone, independent of Wave 3–4's completion.
- **Wave 7 — Evidence re-assessment:** `WP18`.
- **Wave 8 — Human pilot authorization gate:** `WP19`.

### 11.2 Explicit refinement: early-start eligibility

This numbering already reflects genuine dependency, not aesthetic
serialization — `WP02`, `WP12`, `WP14`, and `WP15`'s drafting are placed in
Wave 0 precisely because §5/§6 establish they have no upstream dependency.
The remaining early-start point worth stating explicitly: `WP09`, `WP10`,
`WP11`, and `WP16` depend only on `WP01`, not on `WP02–WP07`'s progress, so
if `WP01` concludes before Wave 1–2 finish, these may begin immediately in
parallel with Wave 1–2 rather than waiting for Wave 3/4's nominal slot.
Nothing in this section changes `WP17`'s hard convergence requirement
(including the audit-readiness branch), `WP13`'s conditionality on an
evidence-supported `WP12` B/C outcome specifically, `WP18`'s sole
re-assessment authority, or `WP19`'s terminal human-only status.

### 11.3 Rationale

`WP02` starts in Wave 0, not after `WP01`, because it has no pilot-scope
dependency — the governed-instance/version registry is general architecture,
not pilot-specific; only `WP08`'s final integration genuinely needs `WP01`.
Waves 1–2 (`WP03` onward) are strictly serial because each runtime layer's
semantics genuinely depend on the previous layer's output (identity →
evidence → determination → taxonomy → orchestration → consequentiality) —
this is not an organizational convenience, it is a logical dependency Steps
1–7 themselves establish. Waves 3–4, once `WP01` is available, run in
parallel because they are independent authority tracks (engineering, legal,
safeguarding, human-operations) that Steps 6 and 8 each treat as
non-substitutable — parallelizing them shortens the program without
weakening any gate, since none of their evidence depends on another's
completion. Wave 5 exists only conditionally, and only from evidence, never
from an inconclusive `WP12` result. Wave 6 is a genuine convergence point
because rehearsal requires an actually-implemented runtime and a decided
environment to execute against at all (Tier A), and specific scenarios
additionally require the resolved audit-readiness branch (scenario 16) or
named operating roles from `WP15`/`WP16` (scenarios 9, 17, 18) to be fully
evidenced (Tier B) — it is not, however, gated on `WP09`/`WP10`/`WP11`'s
completion, which no scenario's Step 8 §14.2 text requires. Waves 7–8 are
strictly sequential and non-parallelizable by construction:
re-assessment requires whatever evidence actually exists, and authorization
requires the re-assessment's result.

## 12. Evidence & Re-assessment Protocol

- No work package automatically changes a P-gate's evidence state.
- `PRM-WP18` is the only package with authority to change a P-gate's state,
  and only by applying Step 8 §5/§16.1's four-state model to whatever
  evidence actually exists at the time it runs.
- `PRM-WP18` may be performed on a partial evidence set (if only some
  packages have completed) — a partial re-assessment is legitimate, and its
  result section must explicitly state which packages' evidence it
  incorporated and which gates remain unchanged for lack of new evidence.
- The mandatory plain-language summary at any `PRM-WP18` run is exactly one
  of the two Step 8-defined statements:
  - **A.** "ALL APPLICABLE MANDATORY PILOT-ENTRY GATES CURRENTLY EVIDENCED —
    OWNER PILOT AUTHORIZATION STILL REQUIRED"
  - **B.** "PILOT-ENTRY EVIDENCE INCOMPLETE — [list exact unsatisfied/
    unresolved mandatory gates]"
  Never a percentage, score, or "mostly ready" statement.
- `PRM-WP19` is separate from, and never a consequence of, statement A.
  Statement A means the evidence exists; it does not mean a pilot is
  authorized.

## 13. Owner Pilot Authorization Boundary

This plan terminates at `PRM-WP19`. Pilot authorization is separate, human,
consequential, and Owner-controlled (Step 8 §1.3 principle 26, §16.4). No
remediation program, however complete, self-authorizes pilot entry. Pilot
launch remains HUMAN-ONLY. This Master Plan does not perform, simulate,
pre-approve, or schedule `PRM-WP19`'s outcome in any way.

## 14. Global Master Plan Quality Gates (M-Q1–M-Q10)

| Gate | Result | Basis |
|---|---|---|
| M-Q1 Source fidelity | PASS | Every work package traces to a specific Step 8 section and, where applicable, a specific Step 1–7 controlling source |
| M-Q2 Gate coverage | PASS | Every P2–P16 has at least one remediation path: §5's 19 work packages collectively address all 15 |
| M-Q3 Dependency integrity | PASS | §6/§11 place no downstream package before its controlling prerequisite; WP13's conditionality and WP17's convergence requirement are both explicit |
| M-Q4 Authority integrity | PASS | §7 keeps Claude/Owner/legal/safeguarding/scientific/human-only roles distinct throughout; no work package assigns closure authority to the wrong category |
| M-Q5 Evidence integrity | PASS | Every work package states Required Evidence and Negative/Failure Evidence explicitly |
| M-Q6 Safety fidelity | PASS | Fail-closed conditions, minors/safeguarding boundaries, and the absolute consequential-decision prohibition are restated unweakened in every relevant work package (WP07, WP08, WP09, WP10) |
| M-Q7 No false closure | PASS | Every work package uses "produces evidence for future re-assessment," never "closes P#"; §12 confirms only PRM-WP18 changes gate states |
| M-Q8 Parallelization integrity | PASS | §9/§11.2 identify genuine parallel tracks without bypassing WP01's scope dependency, WP13's conditionality, or WP17's convergence requirement |
| M-Q9 Pilot boundary | PASS | No real-data, pilot-execution, deployment, or AI-enablement authorization is created anywhere in this document |
| M-Q10 Phase boundary | PASS | Phase 9 is not scheduled, implied, or referenced as remediation work anywhere in this plan |

## 15. Explicit Non-Authorization

This Master Plan authorizes ONLY its own existence as one planning artifact,
plus the read-only analysis needed to author it. It does not authorize:
execution of PRM-WP01–WP19, in whole or in part; application/runtime
implementation; SQL/DDL/migrations; Supabase/RLS/auth changes; dependency
installation; AI enablement; external-tool activation; deployment; production
access or mutation; real student data; participant onboarding; consent/
assent collection; legal sign-off; safeguarding-adequacy determination;
reviewer-competence certification; pilot-rehearsal execution; pilot launch;
consequential use; Phase 9; or any git integration (add/commit/push/PR/
merge) for this artifact.

No implication of authorization may be inferred from this plan's
completeness or from the existence of a work-package ID.

## 16. Next Step

This Master Plan defines a remediation program only. It does not itself
supply any of the evidence, decisions, or implementation the program
describes. Continuation requires, at minimum: Owner review of this plan;
Owner decision on which work packages to authorize and in what order (this
plan's proposed waves are a recommendation, not a binding schedule); a
separate, explicit implementation authorization for each engineering package
before any code is written; and, only after `PRM-WP18`'s re-assessment and a
separate `PRM-WP19` Owner act, consideration of pilot entry. Phase 9 remains
NOT AUTHORIZED and is not started or implied by this document.
