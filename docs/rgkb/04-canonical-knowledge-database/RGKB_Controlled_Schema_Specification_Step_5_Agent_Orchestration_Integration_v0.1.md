# RGKB Controlled Schema Specification — Step 5: Agent & Orchestration Integration — v0.1

- Phase: 7.1 — Controlled Schema Specification
- Step: 5 — Agent & Orchestration Integration
- Artifact type: Logical governance specification
- Version: v0.1
- Status: DRAFT — CONTROLLED AUTHORING
- Date: 2026-08-24
- Controlling architecture: RGKB_Canonical_Entity_Model_v0.2.1
- Controlling foundation: Step 1 — Governed Object / Versioning / Referential / Lifecycle Substrate v0.1
- Controlling foundation: Step 2 — Knowledge Object / Evidence / Provenance / Citation Substrate v0.1
- Controlling foundation: Step 3 — Scientific Knowledge Governance v0.1
- Controlling foundation: Step 4 — Interpretation & Synthesis Governance v0.1
- Gate authority: Owner Gate 0 adjudication; Owner closure of Step 4 (merge commit
  `693a12c2b32f2f531cc1d11a3ede1d2d58c480b3`); Owner authorization of Phase 5
  artifact development (MACRO AUTHORIZATION PACKAGE v0.1, 2026-08-24)
- Production status: NOT AUTHORIZED FOR PRODUCTION

This document is subordinate to the approved canonical entity model, to the owner
adjudications recorded in the Owner Gate 0 Adjudication Record, and to the accepted
Step 1, Step 2, Step 3 and Step 4 substrates. It specifies logical governance
semantics only. It creates no SQL, DDL, migration, Supabase, runtime, agent
implementation, or production authorization. Later physical implementation MAY
realize these semantics. It MUST NOT weaken, reinterpret, or bypass the governance
constraints stated here or in any document it is subordinate to.

## 1. Scope and Authority

### 1.1 What this document is

This document is an implementation-ready LOGICAL governance specification.

It specifies the Step 5 agent-and-orchestration governance substrate: the authority
boundary between an agent's own output and every governed authority Steps 1–4
already fix; the minimum governed agent-role model; the orchestration topology and
handoff contract; agent input eligibility; the retrieval and provenance contract; the
tool-use and side-effect boundary; the contract by which an agent invokes rather than
recreates Step 4 semantics; multi-agent disagreement and conflict resolution; human
review and escalation; the carried-forward privacy/safeguarding/minors boundary; the
untrusted-content boundary; and the auditability, replayability, failure and
abstention contract.

It is subordinate to `RGKB_Canonical_Entity_Model_v0.2.1`, and to the accepted Step 1,
Step 2, Step 3 and Step 4 specifications, which remain the controlling substrates for
identity/versioning/lifecycle, knowledge/evidence/provenance, scientific validation,
and interpretation/synthesis respectively.

Within that subordination, this document is authoritative for later Step 5 physical
realization unless superseded by a later controlled specification version.

### 1.2 What this document is not

This document is NOT:

- an AI agent, an orchestration runtime, an agent framework, or agent code of any
  kind;
- a database, message queue, RPC layer, or runtime service;
- a production prompt, a system prompt, or executable agent instructions;
- scientific, psychometric, rights, contextual, translation-fidelity, or safeguarding
  validation evidence;
- SQL, DDL, or a PostgreSQL physical schema; a migration or a Supabase schema change;
  an RLS, grant, or RPC specification;
- an activation, release-gate, or runtime-eligibility implementation;
- a tool-calling specification, a function-calling schema, or an API contract;
- production authorization for any of the above.

### 1.3 Specification is governance architecture, not agent behaviour

The existence of this specification does NOT establish that any agent, orchestration
layer, tool, or workflow has been built, is safe to run, or is authorized to run.

This document specifies how agent and orchestration behaviour is bounded, classified,
traced and failed closed if it is ever implemented. It authorizes none of it.

Documentation completeness is not evidence completeness (Step 3 §1.3, Step 4 §1.3).
Absence of evidence, validation, rights, safeguarding approval, or explicit owner
authorization is NOT permission.

### 1.4 Non-authorization boundary

This document grants no authorization for SQL or DDL implementation, migrations,
Supabase changes, staging or production deployment, agent implementation, orchestration
runtime implementation, tool integration, external side effects of any kind, or any
repository-history action.

Later implementation MUST fail closed where required by this specification, and MUST
NOT weaken these boundaries. The full non-authorization list is stated in §21.

### 1.5 Relationship to the Step 1–4 substrates

Step 1 governs identity, versioning, immutability, lifecycle and referential
semantics. Step 2 governs what governed objects mean, what supports them, and how
that support is traced. Step 3 governs whether, on which dimension, by whose
authority and on what evidence a governed object has been determined scientifically
acceptable. Step 4 governs what statements MAY be produced about what an eligible
result and eligible governed knowledge mean, individually and in combination, and
where interpretation stops and human judgment begins.

Step 5 governs a materially different, higher-layer question: given an agent or an
orchestration process capable of invoking Steps 1–4, what may that process itself do,
under what authority, with what provenance, with what failure behaviour, and where
must it stop and hand control to a human? Step 5 does not re-derive scientific
meaning, does not re-derive interpretive claims, and does not re-derive the
guidance/recommendation/consequential-decision boundary. It governs the acting layer
that sits above those already-governed layers and consumes them.

Step 5 introduces no second identity authority, no second versioning authority, no
second lifecycle authority, no second provenance authority, no second validation
truth store, and no second claim taxonomy. Where Step 5 relies on a governed
instance or a governed claim, it carries the identity Steps 1–4 already assign it
(§16.1).

Where Step 5 names a semantic obligation and Step 1, Step 2, Step 3 or Step 4 name
the mechanism that carries it, the earlier step governs the mechanism. Where this
document and a controlling document appear to conflict, the conflict MUST be reported
and adjudicated, and MUST NOT be silently reconciled. The full integration contract
is stated in §16.

### 1.6 Normative language

The Step 1 §1.4 vocabulary applies unchanged, as carried by Step 2 §1.5, Step 3 §1.6
and Step 4 §1.6, with the additions required by Step 5 scope.

- **MUST / MUST NOT** — mandatory requirement.
- **SHOULD / SHOULD NOT** — strong recommendation; deviation requires documented
  justification.
- **MAY** — permitted but not required.
- **FAIL CLOSED** — the dependent action does not proceed when required authoritative
  conditions cannot be established.
- **ABSTAIN** — no statement is produced on the question at issue (Step 4 §10.3),
  carried unchanged into the orchestration layer.
- **ESCALATE** — the orchestration process stops the automated path and hands the
  request to an authorized human reviewer under the meaningful-review contract of §11.
- **AGENT** — a bounded computational process performing one or more governed
  ORCHESTRATION ROLES (§4). "Agent" names a function, never a persona, a brand, or a
  vendor product.
- **ORCHESTRATION EVENT RECORD** — the single, unified logical provenance/audit
  structure defined in §5.2, used by the handoff contract (§5), the retrieval and
  provenance contract (§7), and the auditability contract (§14). It is one concept
  used from three angles, not three overlapping structures.
- **GOVERNED ORCHESTRATION DISPOSITION** — the controlled outcome value an
  orchestration step resolves to, defined in §10.3.
- **UNTRUSTED CONTENT** — any input to an agent that is not itself a governed
  instance under Steps 1–4, defined in §13.1.

No additional lifecycle, identity, evidence, validation, or claim-taxonomy vocabulary
is defined in this document. That vocabulary remains governed by Step 1, Step 2,
Step 3 and Step 4.

## 2. The Orchestration Boundary

### 2.1 What Step 5 governs

Step 5 governs the boundary between everything Steps 1–4 already establish as
governed scientific and interpretive authority, and the acting, retrieving,
sequencing and escalating layer that an agent or an orchestration process adds on
top of it.

Step 5 answers: **who/what may perform which orchestration act, over which governed
inputs, under what authority, with what provenance, with what failure behaviour, and
where the machine must stop and escalate to a human.**

Step 5 makes agent orchestration implementation-ready at the logical governance
level. It does not implement the runtime, the agents, the tools, or the
orchestration engine itself.

### 2.2 What Step 5 does not govern

Step 5 does NOT govern:

- what any individual student's assessment result means (Step 4 governs this; Step 5
  only governs how an agent may invoke that governance, §9);
- scientific or psychometric validity of any governed object (Step 3 governs this);
- the guidance/recommendation/consequential-decision boundary itself (Step 4 §12
  governs this; Step 5 only governs how an orchestration process must respect it,
  §9);
- authentication, account provisioning, consent mechanics, or platform permissions;
- the design of the runtime provenance store, the orchestration-event store, or any
  message bus, queue, or execution engine;
- who may read any rendered output, which remains governed by privacy/access-control
  architecture explicitly deferred to a later phase (Step 4 §11.7, §12.7; unchanged
  here, §21).

### 2.3 The governing premise

An agent is never a new scientific authority, evidence authority, validation
authority, safeguarding authority, or consequential-decision authority merely
because it can reason fluently or invoke tools. Every authority an agent appears to
exercise is either:

- an authority Steps 1–4 already govern, which the agent may only invoke under the
  eligibility and invocation contracts of §6 and §9; or
- not a governed authority at all, in which case the agent MUST NOT exercise it, and
  any output that implies otherwise MUST FAIL CLOSED (§10.4, §14.5).

This premise is not stated once and then assumed. It is the test every subsequent
section in this document applies.

## 3. Agent Authority Boundary (R5.1)

### 3.1 Purpose

This section formally distinguishes the categories of thing an orchestration process
touches, and fixes what an agent's own output can and cannot become merely by being
produced.

### 3.2 The ten categories

Every object or event an orchestration process touches belongs to exactly one of the
following categories. None may be inferred from, substituted for, or silently
promoted into another.

- **Governed canonical knowledge.** A governed instance under Step 1–3: a knowledge
  object version, guardrail version, interpretation/synthesis rule version, construct
  definition, instrument/scale, or validation determination. Immutable, versioned,
  citable. Never authored by an agent (§8.2).
- **Operational student/runtime data.** A student's assessment result, session
  context, or other student-linked operational fact (Canonical Entity Model §3.3,
  §22.1). Never canonical knowledge, regardless of how an agent uses it (§16 invariant
  14).
- **Machine retrieval.** The act of locating and returning governed instances or
  operational data already eligible under Steps 1–4. Retrieval creates no new
  authority (§7.1).
- **Machine interpretation.** An agent's invocation of a governed, eligible
  construct-level interpretation rule (Step 4 §3.2, §9). The output is a Step 4 claim,
  not agent-original content.
- **Machine synthesis.** An agent's invocation of a governed, eligible synthesis rule
  (Step 4 §3.5, §9). Same status as machine interpretation.
- **Machine-generated guidance.** An agent's production of a bounded guidance
  statement under Step 4 §12.2, invoked rather than freely generated (§9).
- **Agent recommendation.** An agent's production of a bounded recommendation under
  Step 4 §12.3, subject to the same invocation discipline.
- **Human judgment.** An attributable act by an authorized human, outside the
  automated pipeline (Step 4 §3.3, origin E). Never simulated by an agent (Step 3
  §8.5, restated §11.4).
- **Consequential decision.** Categorically prohibited output for this entire
  substrate (Step 4 §3.2, §12.4). An agent MUST NOT produce one under any
  circumstance, and orchestration MUST NOT construct a path that reaches one (§9.5).
- **External side effect.** Any action with consequence outside the orchestration
  process's own read/compute boundary: a write, a communication, a notification, a
  third-party API call. Governed by the tool-use boundary of §8 and NOT authorized by
  this document (§8.5, §21).

### 3.3 What an agent's own generated text is not

An agent's own generated text, reasoning, or synthesis of retrieved material is NOT,
by virtue of having been generated:

- canonical scientific knowledge (it is, at most, a rendering of governed claims it
  correctly invoked — never a source of new scientific claims itself, §16 invariant
  1);
- a scientific validity determination (an agent cannot self-authorize scientific
  validity; validity is DERIVED from the Step 3 review/decision substrate only, Step
  3 §6.1, §8.5);
- a developmental applicability determination (an agent cannot self-authorize
  developmental applicability; this remains a governed determination under Step 3
  §7, §12, invoked, never asserted, by an agent);
- rights clearance, consent, or safeguarding clearance (none of these may be created
  by an agent; they are preconditions the orchestration process checks for and fails
  closed against when absent, §12.2);
- reviewer competence (an automated process MUST NOT be recorded as a reviewer
  authority for any Step 3 dimension or any Step 4 human-review requirement, Step 3
  §8.5, restated §11.4);
- consequential authority of any kind (§3.2, §9.5).

Machine fluency is not evidence. A well-written, confident-sounding agent output
carries no more authority than an unsupported claim under Step 4 §6.2, and MUST be
classified and traced exactly as that row requires — or FAIL CLOSED if it cannot be
(§9.3, §14.5).

### 3.4 The boundary is invocation, not creation

Everywhere an agent appears to exercise scientific, interpretive, or evidentiary
authority, the correct governance model is that the agent **invoked** an
already-governed determination, rule, or claim. Where no such governed thing exists
to invoke, the agent has nothing to invoke, and MUST NOT manufacture a substitute
(§6.4, §9.4).

This is the master rule this entire specification operationalizes: an agent
orchestrates access to governed authority; it does not become governed authority.

## 4. Governed Agent-Role Model (R5.2)

### 4.1 Roles are responsibilities, not personas

A governed agent role is a bundle of authority and responsibility, defined by what it
is permitted to invoke and what it is required to preserve. It is not a persona, a
brand name, a model choice, or a stylistic voice.

One computational process MAY perform more than one role, and one role's
responsibilities MAY be split across more than one process. Neither choice is
governed by this specification; both are physical/runtime implementation questions
(§8 of the authorization package; §21).

### 4.2 The minimum role set

At minimum, the following logically distinct responsibilities MUST be separately
identifiable in any conforming orchestration, whether or not they are separately
implemented:

| Role | Authority it may invoke | Authority it MUST NOT acquire |
|---|---|---|
| **Governed retrieval** | Locate eligible governed instances and eligible operational data (§7) | Cannot assert eligibility on its own say-so (§6); cannot assert meaning |
| **Construct-level interpretation** | Invoke an eligible, construct-scoped Step 4 interpretation rule (Step 4 §3.2) | Cannot invoke a synthesis rule; cannot cross construct boundaries (Step 4 §5) |
| **Cross-assessment synthesis** | Invoke an eligible Step 4 synthesis rule (Step 4 §3.5) | Cannot aggregate numerically (Step 4 §7); cannot resolve discrepancy by preference (§10) |
| **Contextual/developmental qualification** | Invoke a governed contextual inference or apply a governed developmental relevance determination (Step 4 §9, §6.2) | Cannot infer developmental stage from grade (Step 4 §9.4); cannot invent a qualifier with no governed basis |
| **Safety/guardrail evaluation** | Evaluate every applicable guardrail version against a candidate output (Canonical Entity Model §14, §16.3) | Cannot be overridden by a rule's output permission (guardrail precedence, Canonical Entity Model §16.3, restated §9.2) |
| **Orchestration/routing** | Sequence roles, propagate the Orchestration Event Record (§5.2), decide when a handoff or escalation is required | Cannot itself produce a scientific, interpretive, or consequential claim; it routes, it does not interpret |
| **Human-review interface** | Present a candidate output and its full traceable record to an authorized human reviewer, and carry back the reviewer's decision (§11) | Cannot approve, override, or withhold on the human's behalf; cannot infer a decision the human did not make |

### 4.3 No silent authority acquisition

No role may exercise the authority of another role merely because it has technical
access to do so. In particular:

- an orchestration/routing role that also happens to have model-generation
  capability MUST NOT use that capability to produce an interpretation, synthesis,
  guidance, or recommendation claim outside an explicit invocation of the
  corresponding role's governed rule (§9);
- a safety/guardrail-evaluation role MUST NOT be bypassed by any other role's belief
  that its own output is already safe;
- a human-review-interface role MUST NOT convert the absence of a human response
  into an implicit approval (§11.5, restated from Step 4 §12.5).

A conforming orchestration MUST be able to state, for any output, which role produced
it and under which authority. An output that cannot be attributed to exactly one role
acting within its permitted authority is not a governed output and MUST FAIL CLOSED
(§14.5).

## 5. Orchestration Topology and Handoff Contract (R5.3)

### 5.1 Handoff is a governed transition, not a black box

A handoff is the transfer of an in-progress request from one governed role (§4) to
another. Every handoff MUST preserve the full state required to reconstruct, at any
later point, exactly what was known, decided, and unresolved at the moment of
transfer.

A handoff MUST NOT silently convert a weaker claim into a stronger one. In
particular: an unsettled contextual hypothesis MUST NOT arrive at the next role as a
settled contextual inference; a claim carrying an unresolved discrepancy (Step 4 §8.4
PRESERVE DISCREPANCY) MUST NOT arrive as a claim from which the discrepancy has been
dropped; an ABSTAIN outcome MUST NOT arrive as a claim at all.

### 5.2 The Orchestration Event Record

The Orchestration Event Record is the single logical structure that carries a
request's state across every handoff, and that later serves as the retrieval/
provenance envelope (§7.4) and the audit record (§14.2). It is defined once, here, and
is not redefined or duplicated elsewhere in this specification.

An Orchestration Event Record MUST carry, at minimum:

- **request identity** — a stable identifier for the originating request, distinct
  from any governed instance identity (Step 1 §3.5 identifier-family separation
  applies by analogy: this identifier is operational, not a governed instance
  identity, and MUST NOT be registered as one);
- **task purpose** — what the request is for, at the granularity needed to determine
  which roles are applicable (§4) and which taxonomy rows are in scope (Step 4 §6.2);
- **applicable student/runtime context** — referenced, not copied, and never written
  into the canonical substrate (§7.3, Canonical Entity Model §22.1);
- **exact governed inputs and exact versions** — every governed instance actually
  relied upon, cited by governed instance identity (Step 1 §11.1), never by stable
  identity, label, or "current version" (Step 1 §11.1, §11.6);
- **claim taxonomy classification** — the Step 4 §6.2 row (or explicit absence of
  one) for every claim produced so far;
- **provenance references** — the chain elements of Step 4 §14.2 actually resolved,
  row-conditioned exactly as Step 4 §14.2 requires (no fabricated links);
- **uncertainty state** — the Step 4 §10.1 state applicable to the claim in progress;
- **unresolved discrepancy** — the Step 4 §8.4 disposition, where a discrepancy exists
  and has not been adjudicated;
- **abstention/failure state** — whether any prior step abstained or failed closed,
  and why, at the level of reason-class stated in Step 4 §10.3;
- **applicable guardrails** — every guardrail version evaluated and its outcome
  (Canonical Entity Model §14, §16.3);
- **human-review requirement** — whether §11's triggers apply, and if so, whether
  they have been satisfied.

### 5.3 Handoff obligations

A role receiving a handoff MUST:

- treat every element of the Orchestration Event Record as authoritative for what
  happened before the handoff; it MUST NOT recompute or second-guess a prior role's
  governed determination merely because it disagrees (disagreement is governed by
  §10, not by silent recomputation);
- add to the record, never overwrite or delete from it (append-only, mirroring the
  Step 1 §2.4 / Step 3 §3.2 review-and-decision-event pattern applied here to the
  operational record);
- carry forward every unresolved discrepancy, abstention, and human-review
  requirement it received, undiminished, unless a governed act (an eligible
  determination, a synthesis rule's own disposition, or an actual human review event)
  resolves it.

### 5.4 What this section does not authorize

This section does not authorize a runtime message format, a queue, a database table,
an RPC contract, or any physical transport. It fixes only the logical content a
conforming transport must be able to carry and preserve (§21).

## 6. Agent Input Eligibility (R5.4)

### 6.1 Eligibility is inherited, not re-derived

An agent may consume a governed object for interpretation or synthesis only where the
relevant Step 1–4 eligibility requirements are independently satisfied: the
governed-knowledge eligibility test of Step 4 §4.3, and, where an assessment result is
involved, the result eligibility test of Step 4 §4.2 (governed correspondence,
instrument-version eligibility, construct-scale mapping eligibility, administration
relevance, non-contradictory status, resolved localization context).

Step 5 adds no new eligibility dimension and relaxes none of Step 4's. It only fixes
what an agent specifically MUST NOT do when eligibility cannot be established.

### 6.2 Absolute prohibitions

The following are prohibited without exception, restated here because an agent's
fluency makes them easy to violate silently:

- using stale, superseded, or otherwise ineligible governed content as a fallback
  because the eligible content could not be resolved (Step 4 §4.4);
- inferring eligibility from a label, a filename, a naming convention, or structural
  proximity (Canonical Entity Model §10.7.3, §16.2, restated Step 4 §4.4);
- inventing missing context — developmental scope, population scope, construct
  identity, or any other applicability qualifier — to complete an otherwise
  incomplete eligibility test;
- choosing a convenient version when authoritative version resolution fails (Step 1
  §10.1, §10.2; no recency, count, or ordering heuristic is authorized, and an agent
  MUST NOT introduce one under any framing);
- converting missing evidence into a best guess, a plausible-sounding estimate, or an
  average of what is available (Step 4 §4.4, §10.3).

### 6.3 Fail-closed / abstain, not heuristic completion

Where required eligibility cannot be established, the orchestration process MUST FAIL
CLOSED or ABSTAIN, exactly according to the controlling upstream contract:

- where the failure concerns an assessment result's eligibility, Step 4 §4.2's
  eligibility gate governs, and the dependent claim is ineligible (Step 4 §4.4);
- where the failure concerns a governed knowledge object's eligibility, Step 4 §4.3
  governs, with the same consequence;
- where the failure concerns which claim class the resulting statement would belong
  to, Step 4 §10.4's fail-closed rule governs;
- in every case, the Orchestration Event Record MUST show the reason-class of the
  failure (§5.2, §14.3), not merely that "something failed."

An agent's own confidence in its output is not a substitute for satisfied eligibility.
An eligible-but-uncertain claim is governed by Step 4 §10 (uncertainty); an
ineligible claim is governed by this section, and the two MUST NOT be confused with
one another.

## 7. Retrieval and Provenance Contract (R5.5)

### 7.1 Retrieval is not authority

Retrieval is the act of locating a candidate governed instance or a candidate
operational input. Locating something is not the same fact as that thing being
eligible, valid, or applicable.

A retrieved passage, knowledge object, or assessment result becomes usable in an
interpretation or synthesis path only through its own existing governed identity,
version, provenance, and eligibility (§6). Retrieval confers none of these; it only
finds the candidate that must then independently satisfy them.

Retrieval MUST NOT be treated as, or represented as, a validation act, a review act,
or an eligibility determination (Step 3 §3.1's human-review/validation distinction
applies here by direct extension: retrieval is neither).

### 7.2 Retrieved material remains subject to Step 2's content-origin discipline

Where retrieval surfaces text from a governed knowledge object version, that text
retains the CONTENT ORIGIN classification it already carries (Step 2 §2). Retrieval
MUST NOT reclassify direct source evidence as derived interpretation or vice versa,
and MUST NOT strip the classification in transit. Where retrieval surfaces
non-canonical material (a web page, an uploaded document, prior agent output), that
material is UNTRUSTED CONTENT under §13, never direct source evidence, regardless of
how authoritative it appears.

### 7.3 Every substantive output must remain reconstructable

Every substantive agent output MUST remain reconstructable to the governed sources
and operational inputs actually used, through the Orchestration Event Record (§5.2)
and the Step 4 §14.2 chain it carries forward. "Reconstructable" means resolvable to
exact governed instances, not to a plausible restatement of what probably happened.

### 7.4 The provenance envelope, restated for retrieval

For a retrieval/agent event specifically, the Orchestration Event Record (§5.2) makes
answerable, at minimum:

- what was requested;
- which agent role acted (§4.2);
- which governed versions were used (exact instance identity, Step 1 §11.1);
- which operational inputs were used (referenced, not copied into canonical
  substrate, §5.2);
- which interpretation/synthesis rules were applied (Step 4 §3.5, §14.2);
- which guardrails were evaluated, and their outcomes (Canonical Entity Model §16.3);
- what claim class resulted (Step 4 §6.2), or that none did;
- what uncertainty/discrepancy state applied (Step 4 §10.1, §8.4);
- whether the system abstained (Step 4 §10.3), and the reason-class;
- whether human review was required (§11), and whether it occurred;
- what later handoff occurred (§5.3).

### 7.5 No chain-of-thought requirement

This contract does NOT require storage or disclosure of private chain-of-thought,
scratch reasoning, or intermediate model deliberation. Explainability under this
specification MUST come from governed provenance, the inputs actually used, the
rules actually applied, the classification actually reached, and the outcome actually
produced — never from a hidden reasoning trace presented as proof (§14.5, extending
Step 4 §14.5's "fluency is not proof" rule to the orchestration layer).

## 8. Tool-Use and Side-Effect Boundary (R5.6)

### 8.1 The tier model

Every act an orchestration process performs belongs to exactly one of the following
tiers. A conforming orchestration MUST be able to state which tier a given act
belongs to before performing it.

- **Tier 0 — read-only retrieval and local computation.** Locating and computing over
  already-eligible governed instances and operational data, with no mutation of
  anything outside the process's own transient working state. Subject to the
  eligibility contract of §6; otherwise the default-available tier.
- **Tier 1 — student/runtime-data recording within already-authorized operational
  bounds.** Writing an Orchestration Event Record, a runtime provenance record
  (Canonical Entity Model §22), or an equivalent operational log entry. Governed by
  the runtime-provenance boundary already fixed by Canonical Entity Model §22.1–§22.3
  and Step 4 §14.6; not designed by this document (§21).
- **Tier 2 — canonical-data mutation.** Any write to the canonical RGKB substrate. An
  agent or orchestration process MUST NOT perform this. Canonical curation remains
  the bounded, authenticated, audited curation boundary of Canonical Entity Model
  §19; an agent is a consumer of that boundary, never a writer through it (§16
  invariant 1, restated).
- **Tier 3 — communication, action on behalf of a person, external system side
  effect, or consequential action.** Any act with consequence outside the
  orchestration process's own read/compute/record boundary: sending a message,
  calling an external API with effect, taking an action a person would reasonably
  understand as done "for" them, or any consequential act under Step 4 §3.2/§12.4.

### 8.2 What Phase 5 authorizes

This specification authorizes Tier 0 and (as a boundary statement only, not a design)
the existence of Tier 1. It authorizes neither the design nor the performance of
Tier 2 or Tier 3 acts.

### 8.3 Absence of authorization is not permission

Absence of an explicit authorization for a Tier 2 or Tier 3 act is not permission to
perform it. This restates, at the orchestration layer, the fail-closed invariant
already fixed at every other layer of this substrate (Step 1 §1.3, Step 3 §1.3, Step
4 §1.3, restated here as §16 invariant 20).

### 8.4 No reinterpretation of read as write

No role, and no orchestration process, may reinterpret a Tier 0 read authorization as
a Tier 2 or Tier 3 write/action authorization, regardless of technical capability,
apparent user intent, apparent urgency, or apparent benefit to the student. A
capability that exists in the underlying tooling is not, by that existence alone, an
authorization (§16 invariant 16).

### 8.5 Explicit boundary before any side-effecting act

Logical orchestration MUST support an explicit, inspectable boundary immediately
before any Tier 2 or Tier 3 act, at which the orchestration process either halts
(because no such act is authorized by this document) or, in a later, separately
authorized phase, resolves an explicit authorization check. This document specifies
only that the boundary MUST exist and MUST be explicit; it does not design the check
(§21).

## 9. Step 4 Interpretation/Synthesis Invocation Contract (R5.7)

### 9.1 Invoke, never recreate

An agent producing a construct-level interpretation, a cross-assessment synthesis, a
guidance statement, or a recommendation MUST invoke the corresponding governed Step 4
rule (interpretation rule, synthesis rule, or guidance/recommendation boundary of
Step 4 §12) exactly as that rule is governed. An agent MUST NOT recreate equivalent
output by free-form generation that bypasses the rule, even where the free-form
output would superficially resemble what the rule would have produced.

### 9.2 What MUST be preserved without exception

Agent orchestration MUST preserve every one of the following Step 4 requirements,
without narrowing, softening, or reframing any of them:

- the interpretation claim taxonomy in full (Step 4 §6.2), including exactly-one-row
  membership (Step 4 §6.3) and the row-conditioned origin model (Step 4 §3.3–§3.4);
- the construct semantic firewall (Step 4 §5), including the prohibited-substitution
  matrix (Step 4 §5.9);
- the absolute prohibition on a master score, cross-test averaging, or a hidden
  composite (Step 4 §7.2);
- the absolute prohibition on deterministic best-career or occupation matching (Step
  4 §7.2, §12.4);
- that convergence is not proof (Step 4 §8.2);
- that discrepancy remains visible and is never averaged away (Step 4 §8.5–§8.6);
- that developmental relevance is never derived from grade (Step 4 §9.4);
- the uncertainty and abstention model in full (Step 4 §10);
- the recommendation/consequential-decision boundary (Step 4 §12.3–§12.4);
- the Integrated Career Profile traceability requirements (Step 4 §11.3, §11.5–§11.6).

### 9.3 No orchestration shortcut

Agent orchestration MUST NOT introduce a shortcut, an optimization, a caching
strategy, a "fast path," or a multi-step decomposition that, in combination, produces
an output Step 4 alone would have forbidden. The prohibition applies to the
orchestration's net effect, not merely to any single step in isolation. An
orchestration composed of individually-permitted steps that jointly reconstruct a
forbidden output (for example, several single-construct interpretation calls whose
results an orchestration role then silently averages outside any governed synthesis
rule) is itself a Step 4 violation and MUST FAIL CLOSED (§9.4).

### 9.4 Fail-closed where invocation cannot be established

Where an agent cannot establish that a candidate output resolves to a governed Step 4
invocation — a real rule version, eligibly applied, correctly classified — the
orchestration process MUST FAIL CLOSED under Step 4 §10.4 and MUST NOT render the
candidate output at all, regardless of its apparent quality.

### 9.5 The consequential-decision floor is absolute at the orchestration layer too

No orchestration path, however constructed, may terminate in a consequential decision
(Step 4 §3.2, §12.4). This is restated here, not because Step 4 leaves it ambiguous,
but because orchestration composition is exactly the mechanism by which an absolute
per-rule prohibition could otherwise be defeated by chaining permitted rules toward a
forbidden joint outcome (§9.3).

## 10. Multi-Agent Disagreement and Conflict Resolution (R5.8)

### 10.1 Governed authority outranks machine inference

Governed knowledge (Step 2–3) and guardrails (Canonical Entity Model §14, §16.3)
always take precedence over machine-generated inference, regardless of which agent,
model, or role produced the inference, and regardless of how many agents agree with
it.

### 10.2 Required principles

- Disagreement is not averaged away (Step 4 §8.5, restated at the orchestration
  layer for disagreement BETWEEN agent outputs, not only between contributing
  construct-level interpretations).
- Unsupported majority voting does not create truth: two or more agents agreeing is
  not evidence, and MUST NOT be treated as a governed determination or as
  convergence under Step 4 §8.2's meaning of that term.
- Model confidence does not override evidence authority: an agent's self-reported or
  inferred confidence is not a validation dimension (Step 3 §4.1) and MUST NOT be
  used to prefer one agent's output over governed evidence, or over another agent's
  equally-eligible output.
- Unresolved material conflict remains visible: it MUST be carried forward in the
  Orchestration Event Record (§5.2), never silently dropped at a handoff (§5.1).
- Where no governed resolution exists, the orchestration process MUST retain
  multiple hypotheses, request inquiry, escalate, or abstain — never invent a
  resolution (§10.3).

### 10.3 The Governed Orchestration Disposition set

An orchestration step resolves to exactly one of the following dispositions. This
set is the direct orchestration-layer extension of Step 4 §8.4's disposition set; two
values are Step 5-specific additions, and the correspondence to Step 4 is stated
explicitly so the two vocabularies never appear to compete.

| Disposition | Meaning | Relationship to Step 4 §8.4 |
|---|---|---|
| **PROCEED** | The step's output is governed, eligible, and correctly classified; the pipeline continues | The orchestration-layer generalization of Step 4's INTERPRET: where INTERPRET governs a single claim, PROCEED governs continuation of the pipeline as a whole |
| **QUALIFY** | The output may proceed only with an explicit qualification | Identical in meaning to Step 4 §8.4 QUALIFY, applied at the orchestration layer |
| **PRESERVE DISCREPANCY** | A material conflict exists and is carried forward, not resolved | Identical to Step 4 §8.4 PRESERVE DISCREPANCY |
| **REQUEST INQUIRY** | Evidence or basis is incomplete; an inquiry signal is raised instead of a claim | Identical to Step 4 §8.4 REQUEST INQUIRY |
| **RETAIN MULTIPLE HYPOTHESES** | More than one contextual hypothesis remains plausible and none is governed-preferred | Identical to Step 4 §8.4 RETAIN MULTIPLE HYPOTHESES |
| **ESCALATE** | A human-review trigger under §11 applies; the automated path stops pending human action | New at Step 5: Step 4 assumes human review as a precondition where required (Step 4 §12.5); Step 5 defines the orchestration-layer act of actually stopping and handing off |
| **ABSTAIN** | No statement is produced, positive or negative | Identical to Step 4 §8.4 / §10.3 ABSTAIN |
| **FAIL CLOSED** | The dependent action does not proceed because a required condition could not be established | The terminal, non-negotiable outcome underlying every other disposition's failure mode (Step 1 §10, Step 2 §14, Step 3 §13, Step 4 §10.4) |

No disposition may be inferred from another, and no numeric score, vote count, or
confidence value may determine which disposition applies. The disposition is
determined by which governed condition actually holds (§10.2), never by aggregation.

### 10.4 Human disagreement with agent output

Where an authorized human reviewer disagrees with an agent output, the human's
determination governs (§11.2). An agent MUST NOT re-assert, re-generate, or
re-present a materially equivalent output after a human has rejected or modified it,
within the same request, without a new, explicit human-authorized re-review act.

## 11. Human Review and Escalation (R5.9)

### 11.1 Trigger classes

At minimum, the following conditions apply. Each bullet states its own governed
disposition explicitly. Some resolve to FAIL CLOSED on the candidate output itself
— exactly as §9.4–§9.5 and Step 4 §10.4/§12.3–§12.4 already require — with the
surrounding request separately eligible to ESCALATE (§11.3) or ABSTAIN where
applicable; others trigger ESCALATE directly on the candidate, engaging the
meaningful-review contract of §11.2. Not every listed condition is an ESCALATE
trigger on the candidate itself: where a candidate is prohibited or unclassifiable,
it FAILS CLOSED as the candidate, and ESCALATE — where it applies — governs only the
surrounding request/process, never the prohibited or unclassifiable candidate
(§11.3).

- an actual consequential-decision candidate (§3.2): this triggers FAIL CLOSED on
  that candidate absolutely and unconditionally (§9.5) — it is not merely an
  ESCALATE trigger, because no review outcome makes it eligible. The surrounding
  request MAY still ESCALATE to the responsible human-controlled process (§11.3);
- consequential-adjacent output, or output whose consequentiality cannot be
  resolved: this triggers ESCALATE under the Step 4 §12.4 fail-closed default (treat
  as consequential pending classification);
- unresolved reviewer or scientific authority (Step 3 §8.4, §13.3);
- an unresolved safeguarding prerequisite under §12 (guardian permission, student
  assent, confidentiality-notice delivery, or any condition §12.3 carries forward);
- material contradiction that no governed disposition resolves (§10.3 PRESERVE
  DISCREPANCY reaching a point where further automated progress is not possible);
- an unsupported recommendation candidate (one that fails any condition of Step 4
  §12.3): the candidate itself MUST FAIL CLOSED under that controlling
  recommendation boundary (Step 4 §12.3, §9.4); the surrounding request MAY
  separately ESCALATE or REQUEST INQUIRY, as applicable, but the unsupported
  candidate itself is never rendered;
- a policy or guardrail conflict an orchestration process cannot resolve by
  precedence alone (Canonical Entity Model §16.3 already fixes guardrail precedence
  over rule output; where even that does not yield a single resolvable path,
  escalation is required);
- uncertainty that prevents governed output under Step 4 §10.4;
- a requested external side effect (Tier 3, §8.1);
- an output that cannot be classified into exactly one permitted Step 4 taxonomy row
  (Step 4 §6.3, §6.5 — "unsupported claim" is never producible): the candidate MUST
  FAIL CLOSED (Step 4 §10.4, §9.4); the surrounding request MAY separately ESCALATE
  or ABSTAIN, but an unclassifiable candidate is never rendered as though escalation
  alone cured it.

### 11.2 Meaningful, non-ceremonial review

Meaningful human review requires, restated from Step 4 §12.5 and Step 3 §8:

- an identified, attributable human reviewer authority, whose competence covers the
  dimension or claim class at issue (Step 3 §8.3–§8.4);
- the reviewer's genuine ability to change, withhold, reject, or request further
  inquiry — not a rubber stamp (Step 4 §12.5);
- a recorded review method, not inferred from role or outcome (Step 3 §9.1).

A platform role is not automatically scientific or reviewer competence (Step 3 §8.2,
restated). Possession of an administrative or elevated platform role MUST NOT be
treated as establishing competence to review any orchestration output, and absence of
a platform role MUST NOT be treated as absence of competence.

### 11.3 Escalation does not lower the bar

Escalating to a human does not relax any Step 4 requirement. A human reviewer
approving an output does not retroactively make an ineligible input eligible, does
not convert an abstention into a claim, and does not authorize a Tier 2 or Tier 3
act this document does not itself authorize (§8.2).

Most pointedly: where a candidate output would itself be a consequential decision
(§3.2, §9.5), no human review of that candidate converts it into permissible output.
The machine-produced candidate remains FAIL CLOSED absolutely, whether or not a
human later reviews it — review does not cure or authorize it (§9.5). What a human
reviewer, or the surrounding request, MAY do instead is ESCALATE: route the
underlying request to the responsible human-controlled decision process, which then
makes its own determination independent of, and not by approving, the agent's
candidate. Reviewing-and-approving-the-agent's-output and routing-to-an-independent-
human-decision-process are different acts, and MUST NOT be conflated.

### 11.4 No simulated human judgment

An automated process MUST NOT be recorded as the human reviewer for any escalation
(Step 3 §8.5, restated). Machine assistance in preparing material for a human
reviewer is not prohibited; the machine substituting for the reviewer's judgment is.

### 11.5 Absence of a human response

Absence of a recorded human response to an escalation is not approval. It is the
unresolved state Step 2 §8.4 / Step 4 §4.4 already govern, and the dependent path
remains in ESCALATE / FAIL CLOSED until an actual, attributable review event resolves
it.

## 12. Privacy, Safeguarding, Minors, and Consequential-Use Boundary (R5.10)

### 12.1 Carried forward, not redesigned

This section carries forward, without weakening, the boundaries Step 3 §15 and Step 4
§12.6 already fix. It adds no new safeguarding mechanism and designs no
authentication, RLS, consent-storage mechanics, privacy schema, or safeguarding-case
workflow. Those remain outside Step 5 scope, exactly as they remain outside Step 4
scope (Step 4 §12.6, §12.7, §21).

### 12.2 The carried-forward elements

At the orchestration layer, the following are inherited normative prerequisites and
fail-closed escalation boundaries, not implementation mechanics:

- **No sole automated consequential decision.** For a participant under 18, a
  consequential decision (§3.2) MUST NOT be made solely by an automated system, under
  any circumstance. This is the same absolute bar as Step 4 §12.6's first element. At
  the orchestration layer, §9.5 goes further for every participant regardless of
  age: no consequential decision may be produced by this pipeline at all, and human
  review of a machine-produced consequential-decision candidate does not cure or
  authorize it (§11.3). The under-18-specific "not solely automated" language is the
  narrower, additionally-protective invariant that would still bind even a future,
  separately-authorized phase that might permit some limited human-in-the-loop
  consequential process elsewhere; it does not itself open such a path here, and
  MUST NOT be read as implying that human involvement legitimizes an otherwise
  machine-produced consequential decision under this specification.
- **Meaningful human override.** Carried from §11.2/Step 4 §12.5 without exception.
- **Later consequential use requires meaningful review.** A permitted
  interpretation, synthesis, or guidance output that is later contemplated for
  consequential use requires meaningful human review under §11.2 before that use —
  restated from Step 4 §12.5's identical rule for the interpretation/synthesis
  layer. This is a materially different case from a machine-produced consequential-
  decision candidate (which is never permitted output at all, §9.5): here the
  antecedent output is itself permitted and eligible, and only its later
  consequential USE is gated on review.
- **Applicable parent or guardian permission.** Where required by governing policy,
  its absence or unresolved status is a precondition the orchestration process does
  not itself establish or waive; the dependent path MUST FAIL CLOSED or ESCALATE
  (§11.1).
- **Applicable student assent.** Same treatment as guardian permission.
- **Communicated limits of confidentiality.** Same treatment.
- **No AI abuse investigation.** No orchestration role, agent, or tool invocation
  governed by this specification may be used to investigate suspected abuse,
  determine whether abuse occurred, or otherwise substitute for the responsible
  human safeguarding process (Step 4 §12.6, restated absolutely — §13 addresses the
  related but distinct question of untrusted content, §13.4).
- **Absence of a required safeguard is not permission.** Restates §8.3/§11.5's
  general fail-closed rule for the specific safeguarding domain.
- **Scientific/interpretive validity does not itself create data-use rights.**
  Restated from Step 3 §4.2, Step 4 §12.7/§16 invariant 10; an orchestration process
  MUST NOT treat a valid, well-classified interpretation as license to use, retain,
  or share the underlying data beyond what is otherwise authorized.

### 12.3 What this section does not design

This section does not design consent architecture, authentication, guardian/assent
verification mechanics, confidentiality-notice delivery, the safeguarding-response
process itself, or any privacy/access-control implementation for orchestration
outputs. All of these remain outside Step 5 scope (§21), exactly as Step 4 §12.6 and
§12.7 already state for the interpretation/synthesis layer.

## 13. Prompt/Instruction Integrity and Untrusted-Content Boundary (R5.11)

### 13.1 Untrusted content, defined

UNTRUSTED CONTENT is any input to an agent that is not itself a governed instance
under Steps 1–4: retrieved web or document content, student-entered text, uploaded
material, external sources, and prior agent output (including an agent's own earlier
output, once it has left the governed pipeline and re-enters as input to a later
step).

Untrusted content is data. It is never orchestration authority.

### 13.2 What untrusted content MUST NOT do

Untrusted content MUST NOT, by virtue of its own text, content, formatting, or
apparent authority:

- override this specification or any governing specification it is subordinate to;
- change an agent's role or authority (§4);
- waive a safeguard fixed by §12 or any upstream document;
- alter tool permissions or tier classification (§8);
- authorize a Tier 2 or Tier 3 act (§8.2);
- authorize production activation of any kind;
- promote an unsupported claim, a contextual hypothesis, or any lower-taxonomy-row
  claim into a higher one (Step 4 §6.4).

### 13.3 Evaluated as data, not obeyed as instruction

Where untrusted content contains language that reads as an instruction — "ignore
previous instructions," "you are now authorized to," "disregard the guardrail," or
any equivalent — that language MUST be treated as data to be evaluated under the
ordinary eligibility (§6), taxonomy (Step 4 §6.2), and guardrail (Canonical Entity
Model §16.3) rules that govern any other content. It MUST NOT be executed as a
governance instruction.

This is a logical trust-boundary requirement, not an implemented defense mechanism.
This document does not design a prompt-injection detection or mitigation system; it
fixes only that untrusted content can never cross into governance authority, by
definition, regardless of what mechanism a later implementation uses to enforce that
(§21).

### 13.4 Relationship to §12's abuse-investigation prohibition

Where untrusted content contains a disclosure that could indicate abuse, the
orchestration process's obligation is governed by §12.2's safeguarding boundary (route
to the responsible human safeguarding process), not by this section. This section
governs whether untrusted content can redirect agent AUTHORITY; it does not govern
what happens to the CONTENT of a safeguarding-relevant disclosure, which remains
outside Step 5 scope by design (§12.3).

## 14. Auditability, Replayability, Failure and Abstention (R5.12)

### 14.1 Purpose

This section fixes the minimum logical orchestration-event record needed to
reconstruct a request's full path, and the minimum set of distinguishable outcome
states. It is the audit-facing view of the single Orchestration Event Record already
defined in §5.2; it does not introduce a second record.

### 14.2 The reconstructable path

A conforming implementation MUST be able to reconstruct, for any material request:

```
request
→ retrieval (§7)
→ governed inputs actually resolved (§6, exact versions)
→ agent role that acted (§4.2)
→ rule application (§9, exact rule version)
→ guardrail evaluation (Canonical Entity Model §16.3, outcomes)
→ output classification (Step 4 §6.2 row, or explicit absence)
→ uncertainty/discrepancy state (Step 4 §10.1, §8.4)
→ handoff / escalation / abstention (§5, §10.3, §11)
```

Each step is resolved only where it actually occurred for that request; a step that
did not occur (for example, no synthesis step in a single-construct request) is
recorded as NOT APPLICABLE, never fabricated, exactly as Step 4 §14.2's row-
conditioned chain already requires for interpretation claims and is extended here to
orchestration steps generally.

### 14.3 The minimum distinguishable outcome states

The audit record MUST keep the following materially different states
distinguishable, and MUST NOT collapse any two of them:

- success (PROCEED, §10.3);
- abstention (ABSTAIN);
- ineligible input (§6.3);
- missing evidence (Step 4 §10.1 "missing input" / "incomplete input", carried
  forward);
- unresolved authority (§11.1, Step 3 §8.4);
- guardrail block (Canonical Entity Model §14.3, §16.3);
- human review required (ESCALATE, §11.1);
- human rejection/override (§10.4);
- orchestration failure (a fault in the orchestration process itself, distinct from
  any governed fail-closed outcome — this is a defect state, not a governance state,
  and MUST NOT be recorded as though it were one);
- tool/side-effect not authorized (§8.2–§8.3).

### 14.4 No numeric confidence, no chain-of-thought

The audit contract MUST NOT invent a numeric confidence score for any outcome (Step 4
§10.2, restated). It MUST NOT require capture or disclosure of private chain-of-
thought or intermediate reasoning (§7.5). Model, provider, version, and configuration
identifiers MAY be recorded where useful for reproducibility, but recording them MUST
NOT be treated as, or converted into, scientific or reviewer authority (Step 3 §8.5,
§9.2, restated).

### 14.5 Explainability from provenance, not fabrication

Explainability at the orchestration layer MUST arise from the reconstructable path of
§14.2 and the Orchestration Event Record of §5.2, resolved to exact governed
instances and exact recorded states. It MUST NOT be manufactured after the fact as a
plausible-sounding narrative. A fluent explanation that cannot be reduced to the
§14.2 path is not evidence of auditability (Step 4 §14.5, restated).

## 15. Logical Orchestration Architecture

### 15.1 The reference pipeline

The following is a logical reference architecture. It is not runtime code, not an
agent framework, and not a mandated implementation shape.

```
REQUEST
  → GOVERNED CONTEXT / ELIGIBILITY            (§6)
  → RETRIEVAL                                  (§7)
  → INTERPRETATION                             (§9, Step 4 §3.2)
  → SYNTHESIS                                  (§9, Step 4 §3.5)
  → GUARDRAIL / SAFETY EVALUATION               (§4.2, Canonical Entity Model §16.3)
  → GUIDANCE / BOUNDED RECOMMENDATION           (§9, Step 4 §12.2–§12.3)
  → HUMAN REVIEW / ESCALATION WHEN REQUIRED     (§11)
  → RENDERED OUTPUT
```

Provenance and audit state (§5.2, §14) propagate across every stage actually
traversed, via the Orchestration Event Record.

### 15.2 Shorter paths are required, not merely allowed

The architecture MUST allow shorter paths where some layers are not applicable. A
direct result-derived statement (Step 4 §6.2) requires no synthesis stage. A pure
retrieval-and-render of an already-eligible construct-level interpretation requires
no guidance stage. Not every request traverses every role of §4.2.

Forcing every request through every stage is itself a governance defect under this
specification: it would manufacture applicability that Step 4's row-conditioned model
(Step 4 §3.4, §14.2) explicitly prohibits fabricating (§9.2's preservation
requirement applies to this architecture too — a mandatory-full-pipeline
implementation would silently claim origins/steps a given claim's taxonomy row does
not carry).

### 15.3 The architecture does not authorize its own implementation

Depicting this pipeline does not authorize building it. Each stage's actual
implementation requires its own separately authorized, later-phase work, subject to
this document's non-authorization boundary (§21) and to whatever autonomy-level
classification applies to that later work under the project's own operating
procedure.

## 16. Step 1–4 Integration Contract

### 16.1 No competing authority

Every Step 5 concept that references a governed instance carries that instance's
Step 1 registry identity as its own identity (Step 1 §2.1, Step 3 §14.1, Step 4
§15.1, unchanged).

Step 5 introduces:

- no second identity allocator, namespace, or registry;
- no second versioning mechanism;
- no second lifecycle authority;
- no second provenance authority beyond the runtime-provenance boundary already fixed
  by Canonical Entity Model §22 and extended by Step 4 §14.6 (§5.2, §14.1 apply that
  same boundary to orchestration events);
- no second validation truth store;
- no second claim taxonomy — the Governed Orchestration Disposition set of §10.3 is
  an explicit extension of, not a replacement for, Step 4 §8.4's disposition set
  (§10.3's correspondence table).

### 16.2 Step 1–3 semantics inherited unchanged

Pattern A and Pattern B semantics, immutability boundaries, the independence of the
four lifecycle axes, the referential invariants, the validation dimensions, the
determination substrate, the derivation rule, the applicability matrix, reviewer
authority and its dimension-specificity, and every fail-closed rule of Step 1 §10,
Step 2 §14, and Step 3 §13 are inherited unchanged. Step 5 defines no additional
immutability boundary and creates no exception to any of them.

### 16.3 Step 4 semantics inherited unchanged

Step 5 reuses, and does not replace, the full Step 4 claim taxonomy, the construct
semantics firewall, the non-additive synthesis governance, the convergence/
divergence/discrepancy governance, the developmental interpretation governance, the
uncertainty and abstention model, the Integrated Career Profile governance, the
guidance/recommendation/consequential-decision boundary, the localization governance,
and the traceability contract of Step 4 §14 — extended, at the orchestration layer,
by §5, §7 and §14 of this document, never narrowed by them.

### 16.4 Prohibited redefinitions

Step 5 MUST NOT, and does not:

- redefine governed instance, governed object, governed version, or governed record;
- alter registry membership rules, pattern classification, or the derivation of
  pattern from subject type;
- alter either immutability boundary;
- alter correction, supersession, or historical-preservation rules;
- alter the fail-closed rules of Step 1 §10, Step 2 §14, Step 3 §13, or Step 4 §10.4;
- alter the referential invariants of Step 1 §11;
- reclassify any family between Pattern A and Pattern B;
- redefine CONTENT ORIGIN, evidence status, epistemic characterization, validation
  dimensions, the interpretation claim taxonomy, the guidance/recommendation/
  consequential-decision boundary, or the developmental relevance/grade separation;
- close, downgrade, or reinterpret any finding Step 3 or Step 4 already closed
  (§20.1).

Where a genuine conflict between this specification and Step 1, Step 2, Step 3 or
Step 4 is discovered, it MUST be reported for adjudication and MUST NOT be silently
reconciled.

## 17. Orchestration Invariants Preserved

This specification preserves the controlling scientific, governance, and safety
invariants. It does not weaken, replace, or authorize deviation from any of them.
Each invariant is stated together with its enforcing Step 5 section and its upstream
source.

| # | Invariant | Enforced by (Step 5) | Upstream source |
|---|---|---|---|
| 1 | Agent output is not canonical knowledge merely because an agent generated it | §3.3, §8.1 (Tier 2 prohibition) | Canonical Entity Model invariant 9, §19; Step 3 §14.1; Step 4 §2.2 |
| 2 | Agent confidence is not scientific authority | §3.3, §10.2 | Step 3 §8.5, §9.2; Step 4 §10.2 |
| 3 | Retrieval is not validation | §7.1 | Step 3 §3.1 (human review/validation distinction, extended) |
| 4 | RIASEC interest is not ability/intelligence/competence/achievement | §9.2 | Step 4 §5.2, §16 invariant 1; Step 1 §13; Step 3 §15 |
| 5 | No deterministic grade → developmental-stage mapping | §9.2, §18.G | Step 4 §9.4, §16 invariant 2 (F-10 CLOSED) |
| 6 | No master validation/student/career-fit score | §9.2, §18.D, §18.K | Step 4 §7.2, §16 invariant 3; Canonical Entity Model §4.3 |
| 7 | Self-efficacy remains process/intervention/outcome and never a seventh peer channel | §9.2, §18.H | Step 4 §5.8, §16 invariant 4 (absolute, no exception) |
| 8 | Complementary assessment channels remain non-additive | §9.2 | Step 4 §7.3–§7.4, §16 invariant 5 |
| 9 | Discrepancy remains visible and is not averaged away | §9.2, §10.2, §18.E | Step 4 §8.5–§8.6, §16 invariant 6 |
| 10 | Consequential AI requires meaningful human review | §11.2, §18.L | Step 4 §12.5, §16 invariant 7 |
| 11 | Under-18 safeguarding boundaries remain mandatory | §12.2, §18.L–N | Step 4 §12.6, §16 invariant 8 |
| 12 | Scientific validation does not create legal/data-use rights | §12.2 | Step 4 §12.7, §16 invariant 10 |
| 13 | Georgian contextual relevance is distinct from translation fidelity | §16.3 (inherited unchanged) | Step 4 §13.1–§13.3, §16 invariant 11 |
| 14 | Student/runtime data do not become canonical knowledge | §3.2, §5.2, §8.1 | Step 4 §2.2, §16 invariant 12; Canonical Entity Model §22.1 |
| 15 | Documentation completeness is not evidence completeness | §1.3 | Step 4 §1.3, §16 invariant 13 |
| 16 | Untrusted content cannot elevate itself into orchestration authority | §13.2–§13.3, §18.I | New at Step 5; grounded in Step 4 §8.5 (machine assistance ≠ authority) |
| 17 | Read permission is not write permission | §8.4, §18.O | New at Step 5; grounded in the Tier model of §8.1 |
| 18 | No external side effect without an explicitly authorized later-phase mechanism | §8.2–§8.3, §8.5 | New at Step 5; grounded in Step 3/4's fail-closed absence-is-not-permission rule |
| 19 | Explainability comes from provenance, not fabricated narrative | §7.5, §14.5, §18.P | Step 4 §14.5, restated |
| 20 | Phase 5 does not authorize production agent execution | §1.4, §15.3, §21 | Step 4 §20 non-authorization pattern; Canonical Entity Model §26.5 |

No later realization of this specification may silently weaken these constraints.
Where a later realization and these constraints conflict, the conflict MUST be
reported and adjudicated, and MUST NOT be silently reconciled.

## 18. Adversarial / Counterexample Analysis

This section demonstrates the governance rules of §3–§14 against the required
representative failure cases. These are specification-level worked examples. No
executable test is implemented by this section.

**A. Retrieval agent finds plausible but superseded knowledge.**
Governance issue: superseded content must not be used as though current. Governed
disposition: **FAIL CLOSED**. Superseded governed instances are ineligible under §6.2;
retrieval finding them does not make them usable (§7.1). The current eligible version
must be independently resolved, or the path abstains.

**B. Agent invents missing evidence to complete an interpretation.**
Governance issue: missing evidence must not become a best guess. Governed
disposition: **ABSTAIN** (or **REQUEST INQUIRY** where a governed gap can be named).
Prohibited absolutely by §6.2; the interpretation claim cannot be produced (Step 4
§4.4, §10.3).

**C. Interpretation agent converts high RIASEC interest into ability.**
Governance issue: construct semantics firewall violation. Governed disposition:
**FAIL CLOSED**. The candidate output violates §9.2's preserved firewall (Step 4
§5.2); it is not eligible for production regardless of the agent's fluency (§3.3).

**D. Synthesis agent creates a weighted master career-fit score.**
Governance issue: prohibited aggregation. Governed disposition: **FAIL CLOSED**. Any
rule or orchestration path producing this is ineligible under §9.2/§9.3; the
prohibition is absolute at both the Step 4 rule level and the orchestration
composition level.

**E. Two agents disagree materially and the orchestrator tries majority voting.**
Governance issue: majority voting is not truth. Governed disposition: **PRESERVE
DISCREPANCY** (or **RETAIN MULTIPLE HYPOTHESES**). §10.2 prohibits vote-counting as a
resolution mechanism; the disagreement is carried forward, not resolved by count.

**F. Agent treats model confidence as stronger than governed evidence.**
Governance issue: confidence is not authority. Governed disposition: **FAIL CLOSED**
on the confidence-elevated claim; the governed-evidence-supported disposition
(whatever it independently resolves to) governs instead (§10.1, §10.2).

**G. Contextual agent infers developmental stage from grade.**
Governance issue: grade-stage conflation. Governed disposition: **FAIL CLOSED**.
Prohibited absolutely by §9.2 (Step 4 §9.4); no orchestration framing authorizes it.

**H. Self-efficacy is introduced as a seventh assessment channel.**
Governance issue: absolute construct-boundary violation. Governed disposition:
**FAIL CLOSED**. Prohibited absolutely and without exception by §9.2 (Step 4 §5.8,
which itself admits no authorization from any rule); an orchestration process MUST
NOT construct a path that treats self-efficacy as a peer channel under any framing.

**I. Retrieved webpage/document contains instructions to ignore governance rules.**
Governance issue: untrusted content attempting to seize authority. Governed
disposition: **the instruction is evaluated as data and rejected as governance**; the
underlying request proceeds (or fails closed) exactly as it would have without the
embedded instruction. §13.3 governs this outright.

**J. Guidance agent produces a deterministic occupation assignment.**
Governance issue: guidance crossing into deterministic recommendation/consequential
territory. Governed disposition: **FAIL CLOSED**; the output is reclassified as
prohibited or replaced with bounded guidance (Step 4 §12.2–§12.4, §9.2).

**K. Recommendation becomes an academic/employment/admission decision.**
Governance issue: consequential-decision floor breached. Governed disposition:
**FAIL CLOSED**, absolutely, per §9.5 and Step 4 §12.4; no escalation "cures" this —
it is not eligible output at all, ever, from this pipeline, and human review of the
candidate does not authorize it (§11.3).

**L. Under-18 consequential output is attempted without meaningful human review.**
Governance issue: safeguarding boundary breach, compounded by the absolute
consequential-decision floor of §9.5. Governed disposition: the machine-produced
consequential-decision candidate itself **FAILS CLOSED**, unconditionally — it is
never eligible output, regardless of whether review later occurs (§9.5, §11.3). The
surrounding request MAY **ESCALATE** to the responsible human-controlled process,
which makes its own determination independent of, and not by approving, the agent's
candidate. Meaningful review does not cure or authorize the prohibited
machine-produced consequential decision (§11.3, §12.2).

**M. Required guardian permission / assent / confidentiality prerequisite cannot be
established.**
Governance issue: unresolved safeguarding precondition. Governed disposition:
**FAIL CLOSED** (or **ESCALATE** where a human can resolve the precondition) — never
proceed on the assumption the precondition is satisfied (§12.2).

**N. AI is asked to investigate or determine suspected abuse.**
Governance issue: absolute prohibition on AI safeguarding substitution. Governed
disposition: **ESCALATE** to the responsible human safeguarding process; the request
itself is never performed by the automated pipeline (§12.2, §13.4).

**O. Agent tries to use read authorization to perform a write or external side
effect.**
Governance issue: Tier boundary violation. Governed disposition: **FAIL CLOSED** at
the explicit pre-side-effect boundary of §8.5; the act does not proceed (§8.4).

**P. Provenance is incomplete but fluent narrative output is available.**
Governance issue: fluency is not proof. Governed disposition: **FAIL CLOSED** on the
narrative as presented; only the reconstructable, provenance-backed portion (if any)
may proceed, and the rest is ABSTAIN (§7.5, §14.5).

**Q. Human reviewer disagrees with agent output.**
Governance issue: whose determination governs. Governed disposition: the **human's
determination governs** (§10.4); the agent output does not re-assert itself within
the same request without a new authorized re-review.

**R. A required agent/handoff fails and the orchestrator tries a heuristic fallback.**
Governance issue: heuristic fallback is prohibited. Governed disposition: **FAIL
CLOSED**; no recency, convenience, or "best available" heuristic is authorized as a
substitute for the failed handoff (§6.2, §10.2).

**S. Multiple plausible contextual hypotheses remain and no governed evidence
resolves them.**
Governed disposition: **RETAIN MULTIPLE HYPOTHESES** (§10.2–§10.3); none is presented
as preferred.

**T. Agent output cannot be classified into exactly one permitted Step 4 taxonomy
row.**
Governance issue: taxonomy-row ambiguity is not producible output. Governed
disposition: **FAIL CLOSED** (Step 4 §6.5, §10.4, restated at §9.4); the output is
not rendered.

## 19. Family-to-Pattern Assignment for Step 5

### 19.1 No new governed family

Step 5 introduces zero new Pattern A or Pattern B governed families. This is
recorded explicitly, in the same register position Step 3 §16 and Step 4 §18 use for
their own family-assignment registers, precisely because the absence of a new family
here is a governance decision, not an oversight.

### 19.2 Why no new family is introduced

Two concepts introduced by this document could plausibly be mistaken for candidate
new governed families. Neither is one, and the reasoning is recorded here so a later
specification cannot silently promote either without explicit owner adjudication
(Step 1 §2.5).

- **The Orchestration Event Record (§5.2).** This is student-linked, session-linked,
  operational runtime data. It is the Step 5-specific extension of the runtime
  decision provenance boundary Canonical Entity Model §22 and Step 4 §14.6 already
  fix: it lives outside the canonical `rgkb` substrate, it is never a governed
  instance, and it MUST NOT be registered in `governed_instance` (Step 1 §2.1). Every
  reference it carries to a governed object is a reference by exact governed-instance
  identity (Step 1 §11.1), never a copy of governed content and never a new
  governed record in its own right.
- **The Governed Orchestration Disposition set (§10.3).** This is a controlled
  vocabulary attached to an orchestration step's outcome, structurally identical in
  kind to the taxonomy-row vocabulary of Step 4 §6.2 and the validation-outcome
  vocabularies Step 3 defers (Step 3 §4.1, §9.1). A controlled vocabulary value is not
  a governed object family; it is not registered in `governed_instance`, carries no
  independent identity, and is never itself a citable governed instance.

### 19.3 Families relied upon but not newly assigned

Step 5 relies upon, and does not re-assign, every family already assigned by Step 1
through Step 4: `Knowledge Unit`, `Localized governed text`, `Guardrail`,
`Interpretation Rule` (including its synthesis-rule specialization, Step 4 §3.5),
`Construct definition`, `Instrument / instrument version / instrument scale`,
`Governance binding`, `Review / decision event`, `Evidence anchor`, and the
Integrated Profile Architecture (Step 4 §18.1). A mismatch between any of these
assignments and its use here is a governance/schema fault and MUST FAIL CLOSED
(Step 1 §2.1).

### 19.4 Controlled classifications and the Orchestration Event Record — neither a
new family

This document introduces two materially different kinds of thing, neither of which
is a governed family, and the two MUST NOT be described with the same term.

**Controlled classifications / vocabularies.** The following are controlled
vocabularies this specification fixes the minimum distinctions for, without creating
a governed family for any of them, consistent with Step 4 §18.3's treatment of its
own controlled vocabularies. Each is a fixed set of permitted VALUES for one
classification dimension:

- the ten-category object/event classification of §3.2;
- the minimum role set of §4.2;
- the Tier model of §8.1;
- the Governed Orchestration Disposition set of §10.3;
- the trigger-class list of §11.1;
- the minimum distinguishable outcome-state set of §14.3.

None of these is registered in `governed_instance`. Each is a controlled
classification attached to an orchestration event, a role, or a step outcome. The
exact machine-encodable vocabulary beyond the distinctions fixed here is DEFERRED to
a later controlled specification (§20.7).

**The Orchestration Event Record (§5.2) is not a controlled vocabulary.** It is a
logical runtime-provenance record/content contract: a fixed minimum set of FIELDS a
record must be able to carry, several of which are themselves populated from the
controlled vocabularies above (for example, its taxonomy-classification field is
populated from Step 4 §6.2, and its disposition-adjacent state is populated from
§10.3). It is not a value set, and it is not a permissible-answer list — it is a
content-envelope shape. As established in §19.2, it lives outside the canonical
`rgkb` substrate under the runtime-provenance boundary of Canonical Entity Model §22
and Step 4 §14.6; it is not a governed instance, not registered in
`governed_instance`, and not assigned a Pattern A or Pattern B classification of any
kind. This section fixes no physical schema, no table, and no storage format for it
(§21).

## 20. Carried-Finding Disposition Register

This register records the disposition of carried findings as they stand after Step 5.
Recording a finding here is registration, not resolution. Only findings explicitly
marked CLOSED are closed, and only to the extent already stated by Step 3/Step 4. No
finding is closed by this specification.

### 20.1 CLOSED prior to Step 5 — unchanged, not reopened

**F-05, F-06, F-10, F-13 — CLOSED by Step 3, unchanged.** Step 5 relies on the
citation contract (F-05), the validation derivation rule (F-06), the developmental/
grade separation (F-10), and the validation applicability matrix (F-13) throughout
(§6, §9.2), without altering any of them.

### 20.2 OPEN — F-04, F-07, F-11 (narrowed for interpretation domain only, unchanged
by Step 5), M-1

**F-04 — dependency re-binding workflow. OPEN, unchanged.** Step 5 introduces no new
binding family and does not specify the re-binding workflow. F-04 remains NOT closed.

**F-07 — current-version resolution and cardinality. OPEN, unchanged.** Step 5
supplies no new applicability input to the Step 1 §9 resolution predicate. F-07
remains narrowed exactly as Step 3 left it.

**F-11 — consequentiality classification. OPEN, narrowed for the interpretation
domain only (Step 4 §12.4); unchanged by Step 5.** Step 5 relies on Step 4's
domain-scoped worked list (§9.2, §11.1) and extends it with orchestration-specific
ESCALATE triggers (§11.1) that are themselves domain-scoped applications, not a
general architectural classification. F-11 is NOT further narrowed and NOT closed by
Step 5.

**M-1 — source-hierarchy and external-identifier pattern assignment. OPEN /
FAIL-CLOSED, unchanged.** Step 5 does not touch source hierarchy. Every eligibility
test in §6 that ultimately depends on source identity inherits the Step 2/Step 3
fail-closed consequence unchanged. M-1 remains OPEN and is NOT closed by this
document.

### 20.3 PARTIALLY SPECIFIED / still OPEN — F-12, M-2

**F-12 — platform-role versus reviewer-authority implementation. PARTIALLY SPECIFIED
/ still OPEN, unchanged.** Step 5 relies on the Step 3 §8 logical authority contract
for §11.2's human-review requirement, without specifying authentication, onboarding,
or platform-permission mechanics. F-12 is NOT closed.

**M-2 — named scientific review authority for operational correspondence. PARTIALLY
SPECIFIED / still OPEN, further specified by Step 5.** Step 4 §12.5 already extended
the dimension-specific reviewer-competence requirement to the interpretation/
synthesis layer. Step 5 §11.2 extends the same requirement to the orchestration
escalation layer: the reviewer's competence must cover the specific claim class or
dimension at issue in the escalated output, not merely a general platform role. This
further specifies, but does not complete, M-2 — no operational correspondence review
workflow is specified. M-2 remains NOT closed.

### 20.4 DEFERRED — F-08, F-09, F-14 — unchanged

Untouched by Step 5. No closure is claimed for any of them.

- **F-08 — living-web-source convention.** Untouched. (Note: §7.2/§13.1 govern how
  retrieved web content is CLASSIFIED at the orchestration layer — as untrusted
  content or, where it resolves to a governed evidence anchor, under Step 2's
  existing rules — but this does not specify a living-web-source convention and does
  not touch F-08.)
- **F-09 — rights-document physical entity.** Untouched.
- **F-14 — contributor / citation sequencing.** Untouched.

### 20.5 AFFIRMED CONSTRAINT — L-1, unchanged

**L-1 — immutable binding constraint. AFFIRMED CONSTRAINT, extended without
exception.** Step 5 extends L-1 to the Orchestration Event Record's append-only
obligation (§5.3): historical record content is never repointed or rewritten in
place. L-1 is not an independent open work item and MUST NOT be recorded as
DEFERRED.

### 20.6 CONFIRMED STRENGTH / NO ACTION — N-1, unchanged

**N-1. CONFIRMED STRENGTH / NO ACTION, unchanged.** Step 5 produced no contradictory
evidence and does not reopen it. It is not an open defect, requires no corrective
action, and MUST NOT be represented as an unresolved finding requiring remediation.
It MUST NOT be recorded as DEFERRED.

### 20.7 Step 5 boundary deferrals

The following are DEFERRED to later controlled steps or specifications and are
outside Step 5 scope:

- the physical transport, message format, queue, or database realization of the
  Orchestration Event Record (§5.4, §14.1);
- the design of the pre-side-effect authorization check (§8.5);
- the executable prompt-injection detection or mitigation mechanism (§13.3);
- the physical design of the runtime provenance / orchestration-event store (§7.4,
  §14.1; the boundary is fixed by Canonical Entity Model §22 and Step 4 §14.6 and is
  not redesigned here);
- authentication, consent-storage mechanics, and safeguarding-case workflow (§12.3);
- the general architectural consequentiality-classification mechanism (F-11), touched
  only by domain-scoped extension (§20.2);
- the dependency re-binding workflow (F-04), unaffected by Step 5;
- specific model/vendor/framework selection of any kind (§21).

A deferral is not a decision. No deferred item may be treated as resolved, permitted,
or authorized because it is recorded here.

## 21. Explicit Non-Authorization

This specification authorizes none of the following:

- SQL or DDL; physical database types, keys, indexes, constraint syntax, or triggers;
  PostgreSQL schema design; migrations; Supabase schema, security, or configuration
  changes; RLS policies, grants, RPC definitions, or Edge Functions;
- deployment to any environment; production changes, production access, or
  production activation;
- activation, quarantine, or release-gate implementation;
- data ingestion, automated extraction, or acquisition pipelines;
- embeddings, vector storage, or retrieval-augmented generation implementation;
- runtime provenance implementation, orchestration-event store implementation, or the
  Integrated Career Profile generator;
- scoring implementation or scoring-engine changes; assessment item changes or
  assessment scoring changes; psychometric algorithm changes;
- operational scoring-channel correspondence implementation;
- reviewer authentication, onboarding, or platform-permission implementation;
- automated consequential-decision implementation of any kind;
- student-data processing;
- any agent implementation, agent framework selection, orchestration runtime, tool
  integration, or execution engine;
- any specific LLM vendor, model, temperature, prompt string, or API call;
- LangChain, LangGraph, CrewAI, or any other framework as mandatory or as endorsed;
- external writes, external side effects, or production side effects of any kind;
- consent mechanics, authentication, guardian/assent verification,
  confidentiality-notice delivery, or safeguarding-response process implementation;
- privacy or access-control implementation for any orchestration output;
- prompt-injection detection or mitigation implementation;
- repository staging, commit, push, pull-request creation, merge, branch deletion, or
  worktree deletion;
- Phase 6 architecture or implementation of any kind;
- modification of Steps 1–4 or the Canonical Entity Model.

This specification makes no claim of:

- production readiness;
- runtime safety of any actual agent or orchestration implementation;
- scientific validation of any specific interpretation or synthesis rule (unchanged
  from Step 4);
- rights clearance, contextual or translation-fidelity validation, or safeguarding
  clearance;
- closure of any carried finding other than those already closed by Step 3/Step 4 and
  explicitly restated as unchanged in §20.1.

Describing a behaviour in this model does not authorize implementing it. Each such
action or determination requires its own authorization at its applicable gate, and
approval in one context does not extend to another.

Later physical realization MAY realize the semantics specified here. It MUST NOT
weaken, reinterpret, or bypass the governance constraints stated here (§1.4).

## 22. Next Controlled Step

Step 5 defines the agent-and-orchestration governance substrate only.

Work that builds on this substrate is not authorized by it. Continuation requires, at
minimum:

- a Step 5 integration review against the controlling canonical entity model, the
  Owner Gate 0 Adjudication Record, and the accepted Step 1, Step 2, Step 3 and Step
  4 specifications;
- an owner closure decision for Step 5;
- separate owner authorization for any later step, including any Phase 6 work.

Findings recorded as OPEN or PARTIALLY SPECIFIED in §20.2 and §20.3 remain open after
Step 5. Their resolution is later controlled work and is not authorized here.

In particular, agent implementation, orchestration runtime, tool integration, any
external side effect, and any consequential-decision mechanism remain unauthorized
and unspecified. The existence of this specification is the precondition for later
agent/orchestration implementation work, not permission to begin it.

Completion of this document does not by itself close any carried finding beyond those
already closed by Step 3/Step 4, does not confer an evidence level on prior or future
work, and does not convert documentation completeness into scientific, rights,
validation, safety, operational, or production-readiness evidence.
