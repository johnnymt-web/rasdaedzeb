# RGKB Controlled Schema Specification — Step 7: End-to-End Integration — v0.1

- Phase: 7.1 — Controlled Schema Specification
- Step: 7 — End-to-End Integration
- Artifact type: Implementation-ready LOGICAL end-to-end integration governance
  specification
- Version: v0.1
- Status: DRAFT — CONTROLLED AUTHORING
- Date: 2026-08-24
- Controlling architecture: RGKB_Canonical_Entity_Model_v0.2.1
- Controlling foundation: Step 1 — Governed Object / Versioning / Referential / Lifecycle Substrate v0.1
- Controlling foundation: Step 2 — Knowledge Object / Evidence / Provenance / Citation Substrate v0.1
- Controlling foundation: Step 3 — Scientific Knowledge Governance v0.1
- Controlling foundation: Step 4 — Interpretation & Synthesis Governance v0.1
- Controlling foundation: Step 5 — Agent & Orchestration Integration v0.1
- Controlling foundation: Step 6 — Privacy, Safeguarding & Consequential Decision Governance v0.1
- Gate authority: Owner Gate 0 adjudication; Owner closure of Step 6 (merge commit
  `57c03072e5a2b9e745878f46558a5d5cc0e63709`); Owner authorization of Phase 7
  artifact development (MACRO AUTHORIZATION PACKAGE v0.1, 2026-08-24)
- Production status: NOT AUTHORIZED FOR PRODUCTION

This document is subordinate to the approved canonical entity model and to the
accepted Step 1–6 substrates. It specifies logical integration semantics only. It
creates no SQL, DDL, migration, Supabase, runtime, agent, orchestration, tool,
prompt, or production authorization. Later physical implementation MAY realize
these semantics. It MUST NOT weaken, reinterpret, broaden, narrow, duplicate, or
supersede any Step 1–6 semantic.

## 1. Scope, Authority and Non-Authorization

### 1.1 What this document is

This document proves and specifies how the independently governed semantics of
Steps 1–6 compose across the full request lifecycle into one internally coherent
governed system, without semantic loss, authority escalation, provenance loss,
hidden fallback, state collapse, scientific reinterpretation, privacy/safeguarding
weakening, consequential-decision automation, or false closure of any unresolved
finding.

Its purpose is integration, not summary. Where this document restates a Step 1–6
rule, that restatement is not a new rule; it is the same rule, cited, so that the
seam it applies at is explicit.

### 1.2 What this document is not

This document is NOT: application or runtime code; an agent, orchestration, or tool
implementation; a prompt or model/provider configuration; a RAG/embeddings design;
an API; SQL, DDL, a migration, or a Supabase/RLS/auth change; account provisioning
or role implementation; production data or student-data processing; consent-storage
mechanics; safeguarding case-management software; an external side effect or
notification system; production deployment or pilot execution; Phase 8 or Phase 9
work of any kind. The complete list is restated in full at §19.

### 1.3 Integration is not authorization

Describing how Steps 1–6 compose does not authorize implementing the composition.
Documentation completeness is not evidence completeness, and it is not compliance
completeness (§2.3 invariants 36–37). Absence of evidence, rights, validation,
safeguarding approval, or explicit owner authorization is NOT permission (inherited
from Step 1 §1.3 through Step 6 §1.3, unchanged).

### 1.4 Conflict discipline

A genuine incompatibility between controlling sources is reported here as **OWNER
ADJUDICATION REQUIRED** (§16.4). It is never "resolved" by inventing a rule, and no
external legal, scientific, regulatory, or policy rule is invented to fill an
authority gap (Step 6 §1.6, carried unchanged; §2.3 invariant 39).

### 1.5 Normative language

The vocabulary fixed by Step 1 §1.4 through Step 6 §1.7 applies unchanged. This
document adds only:

- **SEAM** — a material transition between two governed stages of the reference
  flow (§5), at which a **SEAM CONTRACT** (§5.2) must hold.
- **GOVERNED REQUEST ENVELOPE** — the single, end-to-end name for the Step 5 §5.2
  Orchestration Event Record as extended by the Step 6 §13.1/§19.3 fields; not a
  new record (§4.1).
- **STATE TUPLE** — the complete, non-collapsed set of per-layer states that must
  propagate together across a seam (§11.1); never a master score.

No additional identity, lifecycle, evidence, validation, claim-taxonomy,
orchestration-disposition, or determination-dimension vocabulary is defined here.
That vocabulary remains governed exclusively by Steps 1–6.

## 2. Controlling Architecture and Integration Principles

### 2.1 Controlling sources

This document treats as controlling, and only as controlling: the Canonical Entity
Model v0.2.1; the Owner Gate 0 adjudications; and the accepted Step 1–6
specifications. Nothing outside these sources is authoritative for this document.

### 2.2 The five integration principles

Every section below applies these five principles, stated once here so they are not
repeated at each seam:

1. **No semantic loss.** A concept crossing a seam keeps the exact meaning its
   governing Step gives it. A seam that would require renaming, compressing, or
   reinterpreting a concept to make it fit the next stage is a defect, not a
   simplification.
2. **No authority escalation.** No stage may exercise more authority downstream
   than its own governing Step grants it. Retrieval remains not-validation
   (Step 5 §7.1); orchestration remains not-scientific-authority (Step 5 §3.3);
   agreement, confidence, and fluency remain not-evidence (Step 5 §10.2, Step 6
   passim).
3. **No provenance loss.** Every governed instance, version, evidence link, and
   determination a downstream stage relies upon remains resolvable to its exact
   upstream origin (Step 1 §11.1, Step 2 §7, Step 4 §14, Step 5 §5.2/§14,
   Step 6 §13.1).
4. **No hidden fallback.** Where a required upstream condition is not established,
   the dependent seam FAILS CLOSED or ESCALATES exactly as its governing Step
   requires; no downstream stage invents a substitute (Step 4 §4.4, Step 5 §6.2,
   Step 6 §14.3).
5. **No state collapse.** Every independently governed state — lifecycle,
   evidence/provenance, scientific determination, Step 4 claim class, Step 5
   disposition, each Step 6 determination dimension, human-review state — remains
   separately recorded and separately consulted. None is ever aggregated into a
   composite score (§11).

### 2.3 The 50 inherited invariants, mapped

All accepted Step 1–6 invariants remain binding in full and are not weakened by
this document. The following table maps each of the 50 load-bearing invariants
this specification is required to preserve to the section of THIS document that
enforces it at the integration layer, and to its upstream source. Every "§2.3
invariant N" citation elsewhere in this document resolves to this table.

| # | Invariant | Enforced by (this document) | Upstream source |
|---|---|---|---|
| 1 | Generated agent output is not canonical knowledge merely because generated | §3.3 | Step 5 §3.3 |
| 2 | Agent/model confidence is not scientific authority | §8.2 | Step 5 §10.2 |
| 3 | Retrieval is not scientific validation | §6.4 | Step 5 §7.1 |
| 4 | RIASEC interest is not ability/intelligence/competence/achievement/deterministic occupational suitability | §7.2 | Step 4 §5.2 |
| 5 | No deterministic grade → developmental-stage mapping | §7.2 | Step 4 §9.4 |
| 6 | No master validation score | §11.2 | Step 3 §4.3, Step 4 §7.2 |
| 7 | No master student score | §11.2 | Step 4 §7.2 |
| 8 | No master career-fit score | §11.2 | Step 4 §7.2 |
| 9 | Self-efficacy remains process/intervention/outcome and never a seventh peer channel | §7.2 | Step 4 §5.8 (absolute) |
| 10 | Complementary assessment channels remain non-additive | §7.2 | Step 4 §7.3–§7.4 |
| 11 | Discrepancy remains visible and must not be averaged away | §7.2, §11.4 | Step 4 §8.5–§8.6 |
| 12 | Multiple plausible hypotheses may remain multiple | §7.2 | Step 4 §10.2 |
| 13 | Unsupported evidence must not be invented to complete an interpretation | §6.3, §7.1 | Step 4 §4.4, §10.3 |
| 14 | Scientific validity does not create privacy/data-use authority | §7.1 | Step 3 §4.2, Step 6 §3.3 |
| 15 | Scientific validity does not create legal rights | §7.1 | Step 3 §4.2 |
| 16 | Read permission does not imply write | §9.2 | Step 6 §5.2 |
| 17 | Read permission does not imply share or export | §9.2 | Step 6 §5.2 |
| 18 | Compute/use permission does not imply disclosure | §9.2 | Step 6 §5.2 |
| 19 | Prior authorized purpose does not authorize a new purpose | §9.2, §5.4 | Step 6 §4.4 |
| 20 | Student/runtime data is not canonical RGKB knowledge | §3.2 | Step 6 §3.1.1 |
| 21 | Person-specific safeguarding content is not canonical knowledge | §9.3 | Step 6 §3.1.3, §8.4 |
| 22 | Guardian permission and student assent are distinct | §9.2 | Step 6 §6.2 |
| 23 | Missing safeguard is not permission | §9.2 | Step 6 §6.3 |
| 24 | AI must not investigate suspected abuse or determine whether abuse occurred | §10.3 | Step 6 §8.1 (absolute) |
| 25 | Platform role is not reviewer competence | §10.2 | Step 6 §5.3, §10.2 |
| 26 | Human review must be meaningful and attributable | §10.2 | Step 4 §12.5, Step 6 §10.2 |
| 27 | A machine-produced consequential-decision candidate FAILS CLOSED absolutely | §10.1 | Step 5 §9.5/§11.3, Step 6 §11.1 |
| 28 | Human review cannot cure a prohibited machine-produced consequential candidate | §10.1 | Step 6 §11.1, §11.3 |
| 29 | Later consequential use of a permitted antecedent output is a separate governed act | §10.4 | Step 6 §9.3.2, §11.2 |
| 30 | Under 18: no solely automated consequential decision | §10.1 | Step 6 §11.3 |
| 31 | Unresolved consequentiality fails closed against automated consequential use | §9.2 | Step 6 §9.5, §14.3 |
| 32 | Untrusted content cannot elevate governance authority | §8.2 | Step 5 §13, Step 6 §12.3 |
| 33 | Tool capability is not data-use or side-effect authority | §8.3 | Step 5 §8.4, Step 6 §12.2/§12.4 |
| 34 | Explainability is provenance-based, not private chain-of-thought | §13.2 | Step 4 §14.5, Step 5 §14.5, Step 6 §13.2 |
| 35 | Historical audit truth is not rewritten when later authorization changes | §12.4, §13.3 | Step 1 §5.3, Step 6 §13.3–§13.4 |
| 36 | Documentation completeness is not evidence completeness | §1.3 | Step 1–6 §1.3 (unified) |
| 37 | Documentation completeness is not compliance completeness | §1.3 | Step 6 §1.3 |
| 38 | Georgian contextual relevance is distinct from translation fidelity | §2.2 principle 1 (inherited unchanged) | Step 4 §13.1–§13.3 |
| 39 | No jurisdiction-specific legal/compliance claim may be invented | §1.4 | Step 6 §1.6 |
| 40 | No production student-data processing is authorized | §19 | Step 5 §1.4, Step 6 §1.4 |
| 41 | No production consequential execution is authorized | §19, §10.1 | Step 6 §11.4 |
| 42 | Exact Step 4 taxonomy must survive every downstream handoff | §7.2 | Step 4 §6.2 |
| 43 | Step 5 disposition and Step 6 determination dimensions remain distinct | §12.1 | Step 6 §14.2 |
| 44 | No cross-phase state may be silently collapsed into a master status | §11.2 | Step 1 §8.5, Step 6 §14.2 |
| 45 | No downstream stage may silently cure an upstream fail-closed condition | §12.5 | New at Step 7 — direct extension of Step 1–6's own fail-closed rules across seams |
| 46 | No downstream stage may silently broaden an upstream authorization | §12.5 | New at Step 7 — direct extension of Step 6 §4.4 across seams |
| 47 | Provenance and exact controlling versions must survive handoffs | §6.2 | Step 1 §11.1, Step 2 §7 |
| 48 | A handoff failure must not trigger heuristic fallback | §12.2 | Step 1 §9.4, Step 5 §6.2, Step 6 §14.4 |
| 49 | A retry/replay must not mutate canonical truth or historical audit merely to make the replay succeed | §12.4 | Step 3 §13.8, Step 6 §13.3–§13.4 |
| 50 | Phase 7 does not authorize implementation merely by describing an integrated architecture | §1.3, §14.4 | Step 6 §1.3 pattern, applied here |

No later realization of this specification may silently weaken any of these
constraints. Where a later realization and these constraints conflict, the
conflict MUST be reported per §16.4 and MUST NOT be silently reconciled.

## 3. Integrated System / Data / Authority Boundary

### 3.1 Content classification remains exclusively Step 6's

The classification of WHAT KIND OF CONTENT OR DATA an object is remains governed
exclusively by Step 6 §3.1.1–§3.1.2: exactly one of the seven base content domains,
plus zero or more applicable orthogonal content attributes (identity-linked,
safeguarding-relevant). Phase 7 does NOT create a second, competing, mutually-
exclusive content taxonomy. Every integration concept in §3.2 below describes a
ROLE, RECORD TYPE, EVENT TYPE, or GOVERNED DETERMINATION TYPE relevant to the
integrated flow — never a rival content-domain classification, and never a basis
for reclassifying content already classified under Step 6 §3.1.1–§3.1.2.

### 3.2 Integration roles, records, and events — non-competing facets

The following are the materially different roles, record types, and event types
the integrated flow distinguishes. Because several of them are not "content" at
all — some are acts, some are governed determinations ABOUT content, some are
presentation forms of already-classified content — they are NOT a second
exactly-one-of-N partition, and more than one facet may legitimately apply to what
is, at the content level, a single Step 6 base-domain instance. This table
describes relationships; it does not classify.

| Facet | What it is | Relationship to Step 6 §3.1 content classification |
|---|---|---|
| Canonical knowledge | A governed instance under Step 1–3 | Its content is base domain "Canonical RGKB knowledge" (Step 6 §3.1.1) |
| Operational/student/runtime content | A student-linked operational fact | Base domain "Operational assessment result" or "Student/profile/context data" (Step 6 §3.1.1); frequently identity-linked (§3.1.2) |
| Evidence/provenance | An anchor, typed link, or derivation record (Step 2) | A governed record ABOUT canonical or operational content; not itself an assertion or a base-domain instance in its own right (Step 2 §4.1) |
| Scientific determinations | A validation dimension or review/decision event (Step 3) | A governed record ABOUT a canonical-knowledge instance — Step 3's Review/decision event family — not a new content domain |
| Step 4 claims | The full taxonomy of §7.2 | Once produced for a specific student, the claim's CONTENT is base domain "Generated student-specific output" (Step 6 §3.1.1); its CLASSIFICATION is governed exclusively by the Step 4 §6.2 taxonomy, never by this table |
| Orchestration state | Roles, handoffs, disposition (Step 5) | Operational record content, base domain "Orchestration/runtime provenance" (Step 6 §3.1.1) |
| Step 6 determination state | The six dimensions of Step 6 §14.2 | A governed record about a proposed act; not itself reclassified by this table |
| Human-review records | An attributable review/decision event | Base domain is always "Human-review record" (one of Step 6's seven base domains, Step 6 §3.1.1) — it does NOT switch to "Canonical RGKB knowledge" merely because its subject is canonical. Its CANONICAL STATUS is a separate, conditional property, exactly as Step 6 §3.1.1 fixes it: canonical only where the review is itself a governed determination on a canonical-knowledge subject (Step 3 §5); operational where the review is of student-specific output. The two cases are distinguished by WHAT was reviewed, never by reclassifying the record's own base domain |
| External/untrusted content | Retrieved/uploaded content not itself governed (Step 5 §13.1) | Base domain "External/untrusted content" (Step 6 §3.1.1) unless and until separately curated through Canonical Entity Model §19 |
| Rendered output | The presentation-layer instantiation of a permitted Step 4 claim (or of informational content) delivered to a reader | NOT a competing claim taxonomy: a rendered output's classification is always inherited from the exact Step 4 §6.2 row it presents (§7.2); rendering is a presentation act, never a reclassification act |
| Consequential use | A proposed use of an already-produced, permitted output (Step 6 §9.3.2) | A distinct governed EVENT, not a content domain; evaluated independently of, and never merged with, consequential decision (next row) |
| Consequential decision | The determination/act itself (Step 6 §9.3.3) | A distinct, always-prohibited governed ACT, categorically separate from consequential use; the two MUST NOT share one row, one concept, or one classification at any seam (§10.1) |

### 3.3 No facet becomes another, and none becomes canonical, by crossing a seam

Restating §2.2 principle 1 for this specific boundary: an operational assessment
result does not become canonical knowledge by being retrieved into an
interpretation seam (Step 6 §3.2). A Step 4 claim does not become canonical
knowledge by being reviewed, cited, or stored in an audit record (Step 6 §3.2,
extended). A person-specific safeguarding disclosure never becomes canonical
knowledge under any circumstance, regardless of how many seams it crosses (Step 6
§3.1.3, §8.4). General governed safeguarding knowledge (a guardrail, a policy rule)
remains eligible for ordinary curation precisely because it is not person-specific
(Step 6 §3.1.3) — this distinction is unaffected by integration. No facet of §3.2
reclassifies content Step 6 §3.1 has already classified.

### 3.4 No new governed family introduced by integration

Phase 7 introduces no new Pattern A or Pattern B governed family. Every object this
document names is either an existing governed family (Step 1–4), an existing
operational/runtime record (Step 5 §5.2, extended by Step 6 §13.1/§19.3, and here
by §4.1), or an existing controlled vocabulary (Step 3–6). This is confirmed, not
merely asserted, at §16.5.

## 4. Governed Request Envelope

### 4.1 One envelope, not a new record

The Governed Request Envelope is the Step 5 §5.2 Orchestration Event Record,
carrying the additional required fields Step 6 §13.1/§19.3 already established, now
named for its end-to-end role. It is not a third record. It remains operational,
outside the canonical `rgkb` substrate, never a governed instance (Step 5 §19.2,
Step 6 §19.3).

### 4.2 Progressive population across the lifecycle

The envelope is populated progressively as the request moves through the reference
flow of §14; it is not fully populated in advance. §4.3 fixes what MUST already be
present before the first governed act. §4.4 fixes what is appended, seam by seam,
only once each fact is actually produced. Before each subsequent seam, every field
THAT SEAM requires MUST already be present and resolved, or that seam follows its
own governing FAIL CLOSED / ESCALATE behavior (§5.2) — a seam is never satisfied by
a field the envelope does not yet, and cannot yet, carry.

### 4.3 Fields required before the first governed act

Before any governed act in the reference flow proceeds, the envelope MUST already
carry, where applicable (NOT_APPLICABLE per §5.3 where a field genuinely does not
apply to this request — never fabricated to complete the set):

- request identity and purpose (Step 6 §4.1);
- data/content classification: base domain and orthogonal attributes (Step 6
  §3.1.1–§3.1.2);
- data scope (Step 6 §4.1);
- actor/role (Step 5 §4.2) and action category (Step 6 §5.1);
- recipient/destination, where relevant (Step 6 §4.1);
- purpose-authorization state (Step 6 §14.2, dimension 1);
- action/access-scope state (Step 6 §14.2, dimension 2);
- minors/safeguard-prerequisite state (Step 6 §14.2, dimension 3);
- safeguarding-routing-condition state (Step 6 §14.2, dimension 4) — recognizable
  from the data/content classification above, independent of any downstream output.

These four Step 6 determination dimensions (1–4) are knowable from who is asking,
what data, and what action is proposed, and are therefore required up front. The
remaining two dimensions (5–6) depend on facts only later seams produce, and are
governed by §4.4 — they are never required, and never fabricated, before then.

### 4.4 Fields appended as they are produced

The following fields do NOT exist before their producing seam, and are NEVER
required before it. Each is appended to the envelope exactly when its producing
seam actually resolves it — never fabricated or assumed in advance:

- exact governed canonical-knowledge instance identities and versions (produced at
  §6.3);
- evidence/provenance references (produced at §6.3, §7.1);
- scientific eligibility state (produced at §7.1);
- Step 4 output classification: exact taxonomy row, and, where it resolves,
  secondary roll-up (produced at §7.2);
- orchestration role and Step 5 §10.3 disposition (produced at §8.1);
- consequentiality-resolution state (Step 6 §14.2, dimension 5), and, where
  resolved, the §9.3.2 use class (produced at §9.2 — never before a candidate
  output exists to classify);
- human-review-sufficiency state (Step 6 §14.2, dimension 6), produced at §10.2,
  only once a review requirement has actually been evaluated and, where required,
  a review event has occurred.

A seam that has not yet run has not yet produced its fields. That is not a defect
in the envelope; it is the correct, non-circular state of a request that has not
yet reached that seam.

### 4.5 No master request score

The envelope is a STATE TUPLE (§11.1), never a single aggregate value. Nothing in
this section authorizes computing a "request score," a "readiness score," or any
composite value from its fields (§2.3 invariant 44, §11.2).

## 5. Cross-Phase Seam Contract Model

### 5.1 What a seam is

A seam is a material transition between two governed stages of the reference flow
of §14. Every seam this document identifies is governed by exactly one seam
contract, in the fixed six-part form of §5.2. A stage that is genuinely
NOT_APPLICABLE to a given request is skipped (§5.3); a seam contract is never
partially applied.

### 5.2 The seam contract form

Every seam contract states:

- **INPUTS** — the exact governed instances, operational data, and prior
  envelope state the seam consumes;
- **PRECONDITIONS** — the governed conditions (Step 1–6) that must independently
  hold before the seam may proceed;
- **PERMITTED OUTPUT** — what the seam may produce when its preconditions hold;
- **PROPAGATED STATE** — exactly which STATE TUPLE elements (§11.1) the seam
  carries forward, unchanged, into the envelope;
- **FAILURE BEHAVIOR** — the exact FAIL CLOSED / ESCALATE / ABSTAIN outcome, and
  its governing rule, when a precondition is not established;
- **AUDIT EVIDENCE** — what the seam adds to the reconstructable record of §13.

Sections §6 through §10 instantiate this form for the material seams of the
reference flow. §14.3 collects them into one table.

### 5.3 Applicability, not a mandatory full pipeline

A stage is traversed only where it is applicable to the request's actual purpose,
data scope, and content — restating Step 6 §15.2's row/purpose-conditioned model at
the integration layer. Required upstream classification (§3, data/content
classification) is never skipped merely because the expected answer looks simple
(Step 6 §15.2, RC6.B); only stages that genuinely do not apply, as established BY
that classification, are legitimately omitted. No stage may infer permission from
another stage's successful result (§2.2 principle 2).

### 5.4 Cross-cutting gates are re-checked, not visited once

Privacy, safeguarding, and consequentiality gates (Step 6) are not a single stage
in a strictly linear pipeline. Step 6 §2.1 already requires that its preconditions
apply "at the stage where the relevant act occurs" — which, across an end-to-end
path, is potentially more than one point: before governed knowledge eligibility is
consulted (a read/use act), before rendering output (a disclosure-adjacent act),
and again before any later consequential use (a distinct governed act, §9.3.2).
Passing a Step 6 gate once does NOT satisfy it for a later, materially different
act. This is an integration clarification, not a new rule: it follows directly from
Step 6 §4.4's no-silent-secondary-use rule and §11.2's antecedent/use separation,
applied across the full request lifecycle rather than within Step 6 alone.

## 6. Identity / Version / Evidence / Provenance Integration (R7.3)

### 6.1 Purpose

This section specifies the seam by which Step 1–2 identity, versioning, and
evidence/provenance survive into every downstream stage.

### 6.2 What MUST survive every handoff

- **Governed object identity and version identity** — every downstream reference
  is to an exact governed instance, cited by `instance_id` (Step 1 §11.1), never to
  a stable identity, domain code, or "current version" (Step 1 §11.1, §11.6).
- **Lifecycle state** — the four independent axes (Step 1 §8) are preserved
  separately; no stage collapses them into one status.
- **References** — a stable-identity reference is resolved to an exact governed
  instance before any consequential downstream use; resolution failure FAILS
  CLOSED (Step 1 §10.3).
- **Evidence identity and citation/provenance chains** — the canonical provenance
  chain (Step 2 §7.1) remains traversable from any downstream Step 4 claim back to
  its source expression, unflattened (Step 2 §7.3).
- **Historical truth** — superseded, withdrawn, or retracted instances remain
  permanently resolvable; a downstream stage never presents a superseded instance
  as current (Step 1 §5.3, Step 3 §6.6, §15.A).

### 6.3 The seam contract: Version/Evidence/Provenance Resolution

- **INPUTS**: a stable-identity or governed-instance reference from the envelope.
- **PRECONDITIONS**: the exact governed instance resolves (Step 1 §11.6); it is not
  superseded, withdrawn, or ineligible (Step 1 §5.3, Step 3 §6.7); its evidence
  chain is traversable where the downstream act requires it (Step 2 §7.5).
- **PERMITTED OUTPUT**: the exact governed instance identity, available for
  scientific-eligibility evaluation (§7).
- **PROPAGATED STATE**: instance identity, version, lifecycle axes, evidence/
  provenance references.
- **FAILURE BEHAVIOR**: unresolved or ineligible instance → FAIL CLOSED (Step 1
  §10.1–§10.3); no recency, count, or convenience heuristic substitutes (Step 1
  §9.4, restated).
- **AUDIT EVIDENCE**: the exact instance identity resolved (or the no-determination/
  fail-closed outcome), per Step 1 §11.1 and Step 4 §14.2's row-conditioned model.

### 6.4 Retrieval is not validation; storage/retrieval does not confer canonical
status

Restated absolutely for the integration layer: locating a candidate instance (Step
5 §7.1) never substitutes for the independent scientific-eligibility test of §7, and
storing or retrieving operational data never makes it canonical (Step 6 §3.2). A
seam that would treat "it was found" as "it is valid" is a defect (§15.C).

## 7. Scientific Governance → Interpretation / Synthesis Integration (R7.4, R7.5)

### 7.1 The scientific-eligibility seam (R7.4)

- **INPUTS**: the exact governed instance resolved at §6.3; the applicable
  validation-dimension applicability matrix version (Step 3 §7.9).
- **PRECONDITIONS**: every REQUIRED validation dimension for the instance's family
  carries a satisfied, non-withdrawn, eligible determination (Step 3 §6.7, §7.5);
  no dimension is inferred from another (Step 3 §4.2); unknown/unresolved/
  conflicting states are not treated as satisfaction (Step 3 §4.4).
- **PERMITTED OUTPUT**: the instance is eligible for interpretation/synthesis
  invocation (§7.2).
- **PROPAGATED STATE**: the per-dimension determination states (never aggregated
  into one validity score, Step 3 §4.3); the epistemic characterization (Step 2
  §5.4, non-arithmetic).
- **FAILURE BEHAVIOR**: any REQUIRED dimension unsatisfied, unresolved, or
  ineligible → FAIL CLOSED (Step 3 §13.1); fluency, relevance, retrieval success, or
  confidence never promotes an ineligible candidate (§15.C, §15.L).
- **AUDIT EVIDENCE**: the exact determination instance(s) cited, the derivation
  rule version, and the resolution context (Step 3 §5.5).

Scientific validation remains distinct from rights, privacy authority, safeguarding
clearance, reviewer competence, and consequential authority (Step 3 §4.2, Step 6
§3.3's six distinct authorities) — none is inferred from another at this seam or any
other.

### 7.2 The interpretation/synthesis seam (R7.5) — the exact Step 4 taxonomy is
controlling

The full Step 4 §6.2 claim taxonomy is the primary, controlling classification of
every antecedent output. Phase 7 introduces no shorthand that replaces or collapses
it. The complete taxonomy, restated for integration completeness:

| Step 4 §6.2 row | Nature | Governed subtype relationship |
|---|---|---|
| Direct result-derived statement | Origin A only | — |
| Construct-level interpretation | Origin A+B, one interpretation rule | Carries **Scientifically supported interpretation** as its governed SUBTYPE (Step 4 §6.2), never a standalone row |
| Cross-assessment synthesis | Origin C, ≥2 construct-level interpretations | Carries **Integrated profile claim** as its governed subtype (Step 4 §11.1) |
| Contextual inference | Origin D, settled | — |
| Contextual hypothesis | Origin D, unsettled | — |
| Developmental interpretation | Origin B or C, developmental-scope qualified | — |
| Inquiry signal | Any of A–D, evidence incomplete | — |
| Discrepancy signal | Origin C, conflicting contributing claims | — |
| Guidance statement | Bounded, non-truth-claim | — |
| Recommendation | Bounded, motivating-claim-traced | — |
| Unsupported claim | N/A | Never producible (Step 4 §6.5) |

- **INPUTS**: eligible instance(s) from §7.1; the applicable, eligible
  interpretation or synthesis rule version (Step 4 §3.5).
- **PRECONDITIONS**: the rule is eligible (Step 4 §4.3); every construct-semantics-
  firewall row applicable to the construct is respected (Step 4 §5.9); the
  candidate resolves to exactly one taxonomy row (Step 4 §6.3).
- **PERMITTED OUTPUT**: the exact Step 4 claim, classified by its taxonomy row.
- **PROPAGATED STATE**: the taxonomy row; the Step 4 §3.3 authority-origin set
  actually contributing (Step 4 §3.4, row-conditioned — not fabricated for rows
  that do not carry a given origin); the uncertainty state (Step 4 §10.1); any §8.4
  discrepancy
  disposition.
- **FAILURE BEHAVIOR**: unclassifiable, ineligible, or firewall-violating candidates
  FAIL CLOSED (Step 4 §10.4); no orchestration shortcut may reconstruct a forbidden
  joint output from individually-permitted steps (Step 5 §9.3, unaffected by Step
  6 or Step 7 — restated here as the integration-layer form of the same rule).
- **AUDIT EVIDENCE**: the Step 4 §14.2 row-conditioned chain, resolved to exact
  governed instances at every applicable step.

## 8. Agent / Orchestration Integration (R7.6)

### 8.1 The orchestration seam

- **INPUTS**: the classified Step 4 claim (§7.2); the applicable governed role
  (Step 5 §4.2).
- **PRECONDITIONS**: the acting role's authority matches the act attempted (Step 5
  §4.3); every applicable guardrail is evaluated (Canonical Entity Model §16.3);
  input eligibility (Step 5 §6) independently holds.
- **PERMITTED OUTPUT**: a governed orchestration disposition (Step 5 §10.3:
  PROCEED, QUALIFY, PRESERVE DISCREPANCY, REQUEST INQUIRY, RETAIN MULTIPLE
  HYPOTHESES, ESCALATE, ABSTAIN, FAIL CLOSED).
- **PROPAGATED STATE**: the role that acted; the disposition; the Orchestration
  Event Record fields of Step 5 §5.2.
- **FAILURE BEHAVIOR**: per Step 5 §10.3/§11.1/§11.3 exactly — an actual
  consequential-decision candidate FAILS CLOSED absolutely and is never merely an
  ESCALATE trigger on the candidate itself; the surrounding request MAY still
  ESCALATE to an independent human-controlled process (§10.1 of this document).
- **AUDIT EVIDENCE**: the reconstructable path of Step 5 §14.2, row-conditioned.

### 8.2 No authority from agreement, confidence, or repetition

Multi-agent agreement, model confidence, and repeated retrieval or generation
create no scientific, privacy, safeguarding, or consequential authority at the
integration layer, exactly as Step 5 §10.2 and Step 6 passim already fix (§15.K,
§15.L). Untrusted content remains data, never orchestration, privacy, or
safeguarding authority, across every seam it touches (Step 5 §13, Step 6 §12.3,
§15.M).

### 8.3 Tool/side-effect boundary carried forward unchanged

The Step 5 §8 Tier model, refined (not redefined) by Step 6 §5.1, governs every
tool or side-effecting act anywhere in the integrated flow. "Modify operational
data" remains explicitly unmapped to any existing Tier and FAILS CLOSED absent a
later, separately authorized mechanism (Step 6 §5.1, §16.3–§16.4). External-tool
data receipt specifically is governed by §8.2's technical-capability-is-not-
authority rule and case §15.W below.

## 9. Privacy / Safeguarding / Consequentiality Integration (R7.7)

### 9.1 Step 6 as a cross-cutting gate

Step 6 is integrated as a gate that applies at every stage where the relevant act
occurs (§5.4), not as a single check appended after output has already been
produced. The base content domain and orthogonal attributes (Step 6 §3.1.1–§3.1.2)
of the request's data are established BEFORE governed-knowledge eligibility is
consulted (§6–§7), because eligibility itself depends on knowing what kind of
content is being acted upon.

### 9.2 The privacy/safeguarding/consequentiality seam

- **INPUTS**: the envelope's classified data/content, purpose, actor/role, and
  action category (§4.3).
- **PRECONDITIONS**: purpose authorization (Step 6 §4.1); access/action scope
  (Step 6 §5); applicable minors' safeguards — guardian permission, student assent,
  communicated confidentiality limits, kept distinct (Step 6 §6.2); data
  minimization (Step 6 §7); no safeguarding-routing condition is unresolved without
  the conservative default of Step 6 §14.2 dimension 4.
- **PERMITTED OUTPUT**: the six Step 6 §14.2 determination dimensions, each
  independently resolved (PURPOSE_AUTHORIZED/NOT_AUTHORIZED/UNRESOLVED,
  ACCESS_WITHIN_SCOPE/OUT_OF_SCOPE/UNRESOLVED, SAFEGUARD_SATISFIED/NOT_SATISFIED/
  UNRESOLVED, SAFEGUARDING_ROUTE_TRIGGERED/NOT_TRIGGERED/UNRESOLVED,
  CONSEQUENTIALITY_RESOLVED/UNRESOLVED, REVIEW_MEANINGFUL/INSUFFICIENT/NOT_
  PERFORMED — each or NOT_APPLICABLE).
- **PROPAGATED STATE**: all six dimensions, each on its own terms; never
  aggregated (Step 6 §14.2, final paragraph; §11.2 of this document).
- **FAILURE BEHAVIOR**: exactly the Step 6 §14.3 bindings, unmodified: unauthorized
  purpose/access → FAIL CLOSED; unresolved-but-resolvable authorization → ESCALATE;
  a consequential-decision candidate → FAIL CLOSED absolutely (§10.1); unresolved
  consequentiality → automated consequential use FAILS CLOSED, request MAY
  ESCALATE; a triggered or unresolved safeguarding-routing condition → ESCALATE to
  the responsible human safeguarding process, never automated investigation.
- **AUDIT EVIDENCE**: the resolved value of every applicable dimension, and the
  base domain/attribute classification relied upon (Step 6 §13.1).

### 9.3 Person-specific safeguarding content across every seam

Content carrying the safeguarding-relevant attribute AND concerning a real,
identifiable person's actual situation never becomes canonical knowledge, at any
seam, regardless of how many stages of the reference flow it has already crossed
(Step 6 §3.1.3, §8.4). General governed safeguarding knowledge remains eligible for
ordinary curation, unaffected by integration (Step 6 §3.1.3).

## 10. Human Review / Consequential Use / Human Routing (R7.8, R7.9)

### 10.1 Output / use / decision separation, preserved absolutely

Three governed events remain permanently distinct across every seam:

1. the antecedent Step 4 output-production event, classified primarily by its
   exact taxonomy row (§7.2), and only secondarily, where a controlling mapping
   exists, by the Step 6 §9.3.1 roll-up (never a replacement for the primary
   classification);
2. a separate, later proposed-use event, classified under Step 6 §9.3.2 as
   consequential-adjacent use or consequential use;
3. the consequential decision itself, Step 6 §9.3.3 — a separate, always-
   prohibited act, never a use class and never an output-type class.

A machine-produced consequential-decision candidate MUST FAIL CLOSED absolutely, at
every seam, without exception (Step 5 §9.5/§11.3, Step 6 §11.1). Human review does
NOT cure that prohibited candidate (Step 6 §11.1, §11.3). The surrounding request
MAY route — ESCALATE — to an independent, human-controlled decision process, which
makes its own determination rather than approving the agent's candidate (Step 5
§11.3, Step 6 §11.1, carried unchanged through every integration seam).

### 10.2 Meaningful human review integration

Every human-review requirement anywhere in the integrated flow — scientific (Step 3
§8), interpretive (Step 4 §12.5), orchestration escalation (Step 5 §11.2),
safeguarding routing (Step 6 §8), or consequential-use review (Step 6 §10.2) —
resolves to the same unified minimum: an attributable, competence-specific,
non-ceremonial reviewer with genuine ability to change/reject/withhold/inquire, a
recorded review event, and access to the evidence/provenance the review requires
(Step 6 §10.2, integrating Step 3 §8 and Step 4 §12.5). A platform role is not
reviewer competence at any seam (Step 6 §5.3, restated). Absence of a human
response is not approval at any seam (Step 5 §11.5, Step 6 restated). An automated
system is never recorded as, or simulated as, the human reviewer, anywhere in the
integrated flow (Step 3 §8.5, Step 5 §11.4, Step 6 §10.3).

### 10.3 Safeguarding routing integration

```
DETECT/RECOGNIZE GOVERNED ROUTING CONDITION
  → STOP the ordinary automated path as required
  → ROUTE / ESCALATE to the responsible human safeguarding process
  → DO NOT investigate, determine, or adjudicate the underlying facts
```

This machine boundary (Step 6 §8.3) is unmodified by integration. Phase 7 does not
design a safeguarding case workflow (Step 6 §8.5, restated; §19).

### 10.4 Later consequential use is a separately governed act, integrated

Where a permitted Step 4 output is later contemplated for consequential use, that
use requires the human-governed process and meaningful review of §10.2, BEFORE the
use — evaluated independently of, and without altering, the antecedent output's own
eligibility (Step 6 §9.3.2, §11.2; §15.V of this document).

## 11. State Composition / Disposition / No-Master-State Contract (R7.10)

### 11.1 The STATE TUPLE

The full governed state of any material act at any point in the integrated flow is
the tuple of every applicable, independently determined state:

```
( lifecycle state (Step 1 §8, 4 axes),
  evidence/provenance state (Step 2 §7–§8),
  scientific determination state (Step 3 §4, per validation dimension),
  Step 4 claim classification (taxonomy row + origin set + uncertainty state),
  Step 5 orchestration disposition (§10.3),
  Step 6 determination dimensions ×6 (§14.2),
  human-review state (§10.2 of this document) )
```

### 11.2 No master state, score, or composite of any kind

This tuple is NEVER aggregated, weighted, summed, averaged, or otherwise
numerically or ordinally collapsed into a single "ready," "safe," "validated,"
"fit," "approved," master, composite, or precedence score, at any seam, for any
purpose (Step 1 §8.5, Step 3 §4.3, Step 4 §7.2, Step 6 §14.2 final paragraph,
extended here to the full end-to-end tuple; §15.F, §15.Z).

### 11.3 Conjunctive gating, not scoring

A candidate act may proceed only when every applicable element of the tuple
independently permits it — a logical conjunction over independent, applicable
gates, exactly as Step 3 §4.3's independent-dimension gate contract already
requires, extended here across all six Steps rather than within Step 3 alone. This
MAY be expressed as a conjunction; it MUST NOT be expressed, computed, or
represented as a composite score of any kind.

### 11.4 Partial failure does not erase other state

Where one applicable gate fails, the act does not proceed (§11.5), but no other
element of the tuple is thereby erased, downgraded, or hidden. A failed
consequentiality check does not erase a satisfied purpose-authorization
determination; both remain independently recorded (Step 6 §14.3, final paragraph,
restated for the full tuple).

### 11.5 FAIL CLOSED at any applicable mandatory gate

FAIL CLOSED at any applicable mandatory gate means the dependent act does not
proceed. This carries the same meaning fixed at every layer of this substrate: no
warning-and-proceed, no default, no nearest-available-answer (Step 1 §10 through
Step 6 §14.4, unmodified).

## 12. Failure Propagation / Escalation / Abstention / Replay (R7.10, R7.11)

### 12.1 Disposition and determination propagate together, never collapsed

A seam's outcome is always the pair of (Step 5 orchestration disposition, every
applicable Step 6 determination-dimension value), exactly as Step 6 §14.2 already
fixes, propagated unchanged through every subsequent seam. No later seam collapses
this pair into a single value (§11.2).

### 12.2 No heuristic fallback on handoff failure

A handoff failure — an unresolved reference, an ineligible instance, an
unclassifiable claim, an unauthorized purpose, an unresolved safeguard — MUST NOT
trigger a heuristic fallback of any kind: no recency, count, convenience,
"best-available," or majority-vote substitute is authorized at any seam (Step 1
§9.4, Step 4 §4.4, Step 5 §6.2, Step 6 §14.4, unified here).

### 12.3 Replay reproduces recorded decisions, not fabricated reasoning

A replay of a past end-to-end path MUST reproduce the exact governed inputs,
versions, and rules the original path recorded, and the exact decisions it
reached — never a retrospectively fabricated chain-of-thought presented as
explanation (Step 4 §14.5, Step 5 §14.5, Step 6 §13.2, unified here; §2.3 invariant
34). No private chain-of-thought is required or captured at any seam (same
sources).

### 12.4 A retry/replay does not mutate history to succeed

A retry or replay MUST NOT mutate canonical truth, operational history, or audit
record merely to make the replay succeed. Where the original path failed closed,
the replay reproduces that fail-closed outcome and its recorded cause; it does not
retroactively repair the condition that caused it (Step 1 §5.3, Step 3 §13.8, Step
6 §13.3–§13.4, unified here; §2.3 invariant 35).

### 12.5 Downstream stages do not cure or broaden upstream state

No downstream seam may silently cure an upstream FAIL CLOSED condition, and no
downstream seam may silently broaden an upstream authorization (§2.3 invariants
45–46). Where an upstream stage failed closed, every downstream seam inherits that
failure; where an upstream authorization was scoped to a purpose, no downstream
seam widens that scope without its own independent authorization determination
(Step 6 §4.4).

## 13. End-to-End Auditability and Traceability (R7.11)

### 13.1 The minimum reconstructable end-to-end record

A conforming implementation MUST be able to reconstruct, for any material end-to-
end path, via the Governed Request Envelope (§4):

- what request was made, and for what purpose (Step 6 §4.1);
- what data/content was used — base domain, attributes, exact operational
  instance (Step 6 §3.1.1–§3.1.2);
- under what authority (Step 6 §14.2, dimension 1);
- which exact canonical-knowledge versions were used (Step 1 §11.1);
- what evidence/provenance supported them (Step 2 §7);
- what scientific determinations applied, per dimension (Step 3 §5–§6);
- what Step 4 claim(s) were produced, by exact taxonomy row and origin set (Step 4
  §14.2);
- what orchestration roles and handoffs occurred, and their dispositions (Step 5
  §5.2, §14.2);
- what privacy/safeguarding/consequentiality determinations applied, per dimension
  (Step 6 §14.2);
- whether human review or safeguarding routing occurred, and its outcome (§10.2–
  §10.3 of this document);
- what final disposition resulted;
- what rendered output, if any, was permitted, and its exact taxonomy
  classification.

### 13.2 No chain-of-thought; explainability from provenance

Restated absolutely for the integrated system: no private reasoning trace is
required or captured at any seam. Explainability arises entirely from the governed
provenance and recorded decisions of §13.1 (§12.3, §2.3 invariant 34).

### 13.3 Historical truth is not rewritten

Authorization or lifecycle changes at any layer MUST NOT rewrite the historical
record of what was actually used, decided, and done at the time it happened (§12.4,
§2.3 invariant 35).

## 14. Logical End-to-End Reference Architecture

### 14.1 The reference flow

```
REQUEST
  → REQUEST / PURPOSE / DATA CLASSIFICATION           (§4, Step 6 §3–§4)
  → AUTHORITY / ACCESS / RECIPIENT / SAFEGUARD PRECONDITIONS  (§9, Step 6 §4–§7)
  → GOVERNED KNOWLEDGE ELIGIBILITY                     (§6, Step 1–2)
  → VERSION / EVIDENCE / PROVENANCE RESOLUTION         (§6.3)
  → SCIENTIFIC GOVERNANCE                              (§7.1, Step 3)
  → INTERPRETATION / SYNTHESIS                         (§7.2, Step 4)
  → ORCHESTRATION / HANDOFF                            (§8, Step 5)
  → PRIVACY / SAFEGUARDING / CONSEQUENTIALITY GATES     (§9, Step 6 — re-checked
    wherever a new act occurs, §5.4)
  → HUMAN REVIEW / SAFEGUARDING ROUTING / ESCALATION AS REQUIRED  (§10)
  → PERMITTED RENDERED OUTPUT OR GOVERNED NON-PROCEEDING OUTCOME
  → END-TO-END AUDIT / REPLAY RECORD                   (§13)
```

### 14.2 Applicability, not a mandatory full traversal

Not every request traverses every stage. Shorter paths are permitted only where the
omitted stage is genuinely NOT_APPLICABLE, as established by the classification
stages that are never skipped (§5.3). A direct result-derived statement about
already-eligible data requires no synthesis or guidance stage. A purely
informational, non-student-linked retrieval still performs §3/§4's classification
(never skipped) but may then legitimately skip every minors/safeguarding/
consequentiality-specific stage (Step 6 §15.2, carried forward at §5.3 of this
document).

### 14.3 The seam contract table

| Seam | Governing section | Failure mode |
|---|---|---|
| Version/Evidence/Provenance Resolution | §6.3 | FAIL CLOSED |
| Scientific Governance | §7.1 | FAIL CLOSED |
| Interpretation/Synthesis | §7.2 | FAIL CLOSED |
| Orchestration/Handoff | §8.1 | FAIL CLOSED / ESCALATE (per Step 5 §10.3) |
| Privacy/Safeguarding/Consequentiality | §9.2 | FAIL CLOSED / ESCALATE (per dimension, Step 6 §14.3) |
| Human Review / Safeguarding Routing | §10 | ESCALATE / FAIL CLOSED |

### 14.4 No production authorization from this diagram

Depicting this reference flow does not authorize building it. Each stage's actual
implementation requires its own separately authorized, later-phase work (§19).

### 14.5 Logical end-to-end path validation matrix

This matrix proves R7.12's required representative end-to-end behaviors using only
existing Step 1–6 rules; it invents no new scenario taxonomy. Each path states its
entry condition, the seams it traverses, the stages it legitimately omits, what
identity/version/provenance/classification/disposition/determination state it
preserves, its human-review/routing requirement where applicable, its final
outcome, its audit evidence, and confirmation that no unauthorized external side
effect occurs.

**1. PROCEED (successful path).**
Entry: an eligible, single-construct interpretation request with every precondition
satisfied. Traversed: Purpose/Data Classification → Authority/Access/Safeguard
Preconditions → Knowledge Eligibility → Version/Evidence/Provenance → Scientific
Governance → Interpretation → Orchestration → Privacy/Safeguarding/Consequentiality
gates → Output. Omitted (NOT_APPLICABLE): Synthesis (single construct only); Human
Review/Escalation (no trigger present); Safeguarding routing (the data/content
classification of §4.3 establishes no safeguarding-relevant attribute is present,
Step 6 §3.1.2, resolved at the §9.2 gate as `SAFEGUARDING_ROUTE_NOT_TRIGGERED`).
Preserved: exact KU version, instrument-scale version, and rule version cited
(§6.2–§7.2). Step 4 classification: Construct-level interpretation (primary,
controlling, §7.2) — its §9.3.1 secondary roll-up resolves "Interpretive output."
Step 5 disposition: **PROCEED**. Step 6 state: `PURPOSE_AUTHORIZED`,
`ACCESS_WITHIN_SCOPE`, `SAFEGUARD_SATISFIED` or `NOT_APPLICABLE`,
`SAFEGUARDING_ROUTE_NOT_TRIGGERED`; no §9.3.2 proposed-use event exists in this
path, so the consequentiality-USE portion of dimension 5 is `NOT_APPLICABLE` — only
the §9.3.1 output roll-up above is resolved, and it is not itself a use
classification; review dimension `NOT_APPLICABLE`. Human review: not required.
Outcome: permitted rendered construct-level interpretation. Audit: full §13.1
record, every cited instance exact. No unauthorized side effect: confirmed — Tier 0
only (§8.3).

**2. QUALIFY.**
Entry: an interpretation whose contributing evidence carries a stated epistemic
limitation (Step 2 §5.4). Traversed: as PROCEED through Interpretation, where the
claim's uncertainty expectation is bound by that limitation (Step 4 §10). Omitted:
Synthesis, Escalation. Preserved: same as PROCEED, plus the specific limitation
basis. Step 4 classification: Scientifically supported interpretation — the
governed SUBTYPE of Construct-level interpretation (Step 4 §6.2), never a
standalone row; epistemically bounded. Its §9.3.1 secondary roll-up resolves
"Interpretive output" (inherited from its parent row, §7.2). Step 5 disposition:
**QUALIFY**. Step 6 state: as PROCEED; the §9.3.1 roll-up carries the qualification
explicit; no §9.3.2 proposed-use event exists in this path, so the
consequentiality-USE portion of dimension 5 remains `NOT_APPLICABLE` — the roll-up
is a description of the OUTPUT, not a use classification. Human review: not
required. Outcome: permitted, rendered WITH the qualification stated, never
silently dropped. Audit: the epistemic characterization/limitation basis recorded.
No unauthorized side effect: confirmed — Tier 0.

**3. PRESERVE DISCREPANCY.**
Entry: a cross-assessment synthesis request where two contributing construct-level
interpretations materially conflict. Traversed: as PROCEED through Interpretation
(producing two construct-level interpretation claims) → Synthesis, resolving to
Step 4 §8.4 PRESERVE DISCREPANCY. Omitted: Escalation (the discrepancy alone does
not, by itself, reach the "material contradiction that no governed disposition
resolves" trigger of Step 5 §11.1 in this instance). Preserved: both contributing
construct-level interpretations remain individually cited and resolvable — never
merged (Step 4 §8.5). Step 4 classification: the synthesis produces TWO distinct
governed claim instances, each resolving to exactly one Step 4 §6.2 taxonomy row —
they are never presented as one claim carrying two rows (Step 4 §6.3): a
Cross-assessment synthesis claim (§9.3.1 roll-up: "Interpretive output") naming the
integrated theme, and a separate Discrepancy signal claim (§9.3.1 roll-up: **ROLL-
UP UNRESOLVED** — classified directly under §9.2's effect-and-use test against its
own exact row, per Step 6 §9.3.1). Step 5 disposition: **PRESERVE DISCREPANCY**.
Step 6 state: the Cross-assessment synthesis claim's roll-up is "Interpretive
output"; the Discrepancy signal claim's roll-up is unresolved and its
consequentiality is evaluated directly against its own row; no §9.3.2 proposed-use
event exists for either, so the consequentiality-USE portion of dimension 5 is
`NOT_APPLICABLE` for both; other dimensions as PROCEED. Human review: not
automatically required. Outcome: permitted, both claims rendered with both sides
visible, neither preferred without governed basis. Audit: both conflicting claims
individually resolved and cited, each under its own exact taxonomy row. No
unauthorized side effect: confirmed — Tier 0.

**4. REQUEST INQUIRY.**
Entry: evidence is incomplete for a requested construct-level interpretation
(Step 4 §10.1 "missing input"). Traversed: as PROCEED through Knowledge Eligibility
(partial) → Interpretation attempted, insufficient evidence detected. Omitted:
Synthesis (no second eligible construct); Human Review (the inquiry signal itself
requires none to be produced, though a human MAY act on it in a separate, later
act outside this path). Preserved: the specific gap that motivated the signal
(Step 4 §10.3). Step 4 classification: Inquiry signal (primary, controlling row).
Its §9.3.1 secondary roll-up is **ROLL-UP UNRESOLVED** (Step 6 §9.3.1) — it is
never assigned "Informational/descriptive output" or any other bucket merely
because it reads as non-assertive in ordinary language. Step 5 disposition:
**REQUEST INQUIRY**. Step 6 state: no §9.3.2 proposed-use event exists — an
inquiry signal proposes no use of anything — so the consequentiality-USE portion of
dimension 5 is `NOT_APPLICABLE`, not resolved to any class; other dimensions as
PROCEED. Human review: not required to produce the signal. Outcome: permitted,
rendered as an inquiry signal naming the specific gap. Audit: the missing element
recorded. No unauthorized side effect: confirmed — Tier 0.

**5. RETAIN MULTIPLE HYPOTHESES.**
Entry: more than one contextual hypothesis is plausible and no governed evidence
resolves them (Step 4 §10.2). Traversed: as PROCEED through Interpretation, where
the contextual-qualification step produces two or more Contextual hypothesis
claims. Omitted: Synthesis (not required for this case); Escalation. Preserved:
each hypothesis individually traced to its own unsettled basis. Step 4
classification: Contextual hypothesis (multiple instances; primary, controlling
row for each). Each instance's §9.3.1 secondary roll-up is **ROLL-UP UNRESOLVED**
(Step 6 §9.3.1) — never assigned an informational bucket merely by default. Step 5
disposition: **RETAIN MULTIPLE HYPOTHESES**. Step 6 state: no §9.3.2 proposed-use
event exists for any instance, so the consequentiality-USE portion of dimension 5
is `NOT_APPLICABLE` for each; other dimensions as PROCEED. Human review: not
required. Outcome: permitted, all hypotheses rendered together, none preferred
without governed support. Audit: each hypothesis's basis recorded. No unauthorized
side effect: confirmed — Tier 0.

**6. ESCALATE.**
Entry: a candidate output's consequentiality is genuinely unresolved (Step 6 §9.5),
or a required reviewer authority is unresolved but a responsible human process can
resolve it. Traversed: as PROCEED/QUALIFY through Interpretation/Orchestration →
Privacy/Safeguarding/Consequentiality gate resolves `CONSEQUENTIALITY_UNRESOLVED`
→ Human Review/Escalation engaged. Omitted: Output rendering — not yet permitted;
the path pauses here, it does not silently continue. Preserved: the full envelope
state resolved up to the escalation point remains available to the reviewer (§4.4,
§13.1). Step 4 classification: e.g. a bounded Recommendation, pending use
classification. Step 5 disposition: **ESCALATE**. Step 6 state:
`CONSEQUENTIALITY_UNRESOLVED` (dimension 5), binding to ESCALATE per §9.2/§14.3;
other dimensions resolved as applicable. Human review: required — an attributable,
competent reviewer is engaged (§10.2); the review event is recorded. Outcome:
non-proceeding outcome for the automated path pending review; a favorable review
authorizes only a separate, subsequent governed act, never this same act
retroactively. Audit: the escalation trigger and reviewer engagement recorded. No
unauthorized side effect: confirmed — no Tier 3 act occurs pending review.

**7. ABSTAIN.**
Entry: a cross-assessment synthesis request expects two contributing constructs.
Every upstream mandatory gate for BOTH candidate constructs runs independently:
purpose authorization, access scope, and applicable safeguards resolve for the
request as a whole; each candidate construct independently undergoes Version/
Evidence/Provenance Resolution (§6.3) and Scientific Governance (§7.1). One
candidate resolves eligible; the other does not (its own instance is superseded)
and that candidate alone FAILS CLOSED under §6.3/§7.1 — this upstream FAIL CLOSED
is not overridden, cured, or converted by anything that follows (§2.2 principle 4,
§12.5). Interpretation then produces a single, valid Construct-level interpretation
for the one eligible construct (§7.2) — a genuine PROCEED outcome for that
construct alone. Synthesis is then attempted over the (now single) construct set:
the applicable synthesis rule's own governed definition does not permit a
reduced-input mode, so the synthesis rule itself resolves to ABSTAIN on the full
synthesis claim — the exact accepted controlling rule permitting this outcome is
Step 4 §4.5: "the synthesis rule MUST either produce a narrower synthesis claim
scoped to only the eligible constructs (where the rule's governed definition
explicitly permits a reduced-input mode) or ABSTAIN on the full synthesis claim."
Traversed: Purpose/Data Classification → Authority/Access/Safeguard Preconditions →
Knowledge Eligibility/Version/Evidence/Provenance/Scientific Governance for each
candidate construct independently → Interpretation (for the eligible construct) →
Synthesis (abstains). Omitted: Escalation (nothing here is ambiguous or requires
human classification — the rule's own governed definition already answers the
reduced-input question); Human Review (not automatically required). Preserved: the
ineligible construct's FAIL CLOSED outcome and its exact cause remain recorded,
never erased by the synthesis-level ABSTAIN (§12.5); the eligible construct's own
Construct-level interpretation remains a separately valid, separately rendered
PROCEED outcome — the two acts (single-construct interpretation and two-construct
synthesis) are not collapsed into one outcome (§11.4). Step 4 classification: the
single eligible Construct-level interpretation is produced and rendered (its own
PROCEED); no Cross-assessment synthesis claim is produced for the abstained act.
Step 5 disposition: **ABSTAIN** on the synthesis act specifically; the sibling
single-construct act separately and simultaneously resolves **PROCEED** — the two
dispositions coexist for two distinct governed acts, exactly as §11.4 requires.
Step 6 state: consequentiality `NOT_APPLICABLE` for the abstained synthesis (no
synthesis output exists to classify); the sibling PROCEED act's own Step 6 state
resolves independently, as in Path 1. Human review: not automatically required.
Outcome: non-proceeding for the full synthesis claim specifically — nothing is
rendered for it; the eligible single-construct interpretation is still rendered as
its own, separate, valid output. Audit: the reduced-input determination, the rule's
own no-reduced-mode declaration, and the ineligible construct's fail-closed cause
are all recorded (Step 4 §4.5, §13.1). No unauthorized side effect: confirmed —
Tier 0 only.

**8. Safeguarding-routing path.**
Entry: content carries the safeguarding-relevant attribute (Step 6 §3.1.2) and the
routing condition is recognized, or is unresolved and therefore conservatively
treated as triggering (Step 6 §14.2, dimension 4's exception). Traversed:
Request/Purpose/Data Classification (the attribute is recognized here) →
Authority/Access/Safeguard Preconditions → `SAFEGUARDING_ROUTE_TRIGGERED` →
ordinary automated processing STOPS for this content → the governed
orchestration/routing control path records and executes the required ESCALATE
handoff → Human Review/Safeguarding Routing. Omitted: Knowledge Eligibility,
Scientific Governance, and Interpretation/Synthesis never run on this content for
ordinary output-production purposes — the ordinary claim-producing processing path
never reaches them (§10.3). This is distinct from Orchestration itself: the
governed orchestration/routing control layer DOES run, precisely in order to
record and execute the required ESCALATE/handoff (Step 5 §10.3) — "ordinary
automated processing stops" and "the orchestration layer records ESCALATE" are not
in tension; the latter is exactly the act that accomplishes the former. Preserved:
the classification that triggered routing (base domain plus the safeguarding-
relevant attribute). Step 4 classification: `NOT_APPLICABLE` — no Step 4 claim is
produced via the ordinary processing path. Step 5 disposition: **ESCALATE** (the
orchestration-layer act of stopping ordinary processing and handing off, Step 5
§10.3). Step 6 state: `SAFEGUARDING_ROUTE_TRIGGERED`; other dimensions as
applicable. Human review: mandatory, and specifically the responsible human
safeguarding process, not a general reviewer (§10.3); the automated system never
investigates, determines, or adjudicates the underlying facts. Outcome:
non-proceeding for the ordinary automated path; the safeguarding process is a
separate, human-controlled process this document does not design (§19). Audit: the
routing event is recorded, and that investigation/determination were explicitly NOT
performed by the automated system is itself recorded. No unauthorized side effect:
confirmed — no automated investigative or disclosure act of any kind occurs.

**9. FAIL CLOSED.**
Entry: any required precondition across §6–§10 cannot be established — an
unauthorized purpose, a superseded version, a construct-firewall violation, or an
unresolved required safeguard, among others. Traversed: the path halts at whichever
seam's precondition failed; every seam upstream of that point completed normally.
Omitted: every seam downstream of the failure point. Preserved: the exact governed
instances and state resolved up to the failure point remain resolvable; nothing is
deleted or rewritten (§11.5). Step 4 classification: `NOT_APPLICABLE` if the
failure occurred before Interpretation; otherwise the disqualified candidate's row
is recorded as ineligible and never rendered. Step 5 disposition: **FAIL CLOSED**.
Step 6 state: whichever dimension(s) triggered the failure (for example
`PURPOSE_NOT_AUTHORIZED` or `ACCESS_OUT_OF_SCOPE`); others as resolved up to that
point. Human review: not automatically required, unless the specific failure
independently also satisfies an escalation trigger of §9.1. Outcome:
non-proceeding — nothing is rendered. Audit: the exact failed precondition and its
governing rule are recorded (§13.1). No unauthorized side effect: confirmed — no
Tier 1, 2, or 3 act proceeds past the failure point.

## 15. Adversarial A–Z Integration Validation Matrix

Each case states the governing rule(s) and the required governed disposition. No
case is resolved by majority vote, model confidence, or undocumented fallback.

**A. Superseded canonical version enters downstream flow as if current.**
Rule: Step 1 §5.3, §10.1; §6.3. Disposition: **FAIL CLOSED** — the superseded
instance is ineligible under §6.3's FAILURE BEHAVIOR; the dependent act does not
proceed unless and until the current eligible version is independently resolved.
No fallback to the superseded instance, and no other heuristic substitute, is
authorized (Step 1 §9.4, §10.1).

**B. Evidence/provenance identity is lost at a handoff.**
Rule: Step 2 §7.3; §6.2–§6.3. Disposition: **FAIL CLOSED** — an unreconstructable
provenance chain fails the downstream act that depends on it (§13.1).

**C. Retrieved content is treated as scientifically validated merely because
retrieval succeeded.**
Rule: Step 5 §7.1; §6.4. Disposition: **FAIL CLOSED** on the validation claim;
retrieval is not validation.

**D. RIASEC interest is transformed downstream into ability/intelligence/
competence.**
Rule: Step 4 §5.2; §2.3 invariant 4. Disposition: **FAIL CLOSED** — construct-
semantics-firewall violation, absolute, at any seam.

**E. Grade is converted deterministically to developmental stage.**
Rule: Step 4 §9.4; Step 6 §6 (grade ≠ safeguard basis); §2.3 invariant 5.
Disposition: **FAIL CLOSED**.

**F. Multiple assessment channels are averaged into a master student/career-fit
score.**
Rule: §11.2; Step 4 §7.2. Disposition: **FAIL CLOSED** — absolute prohibition, no
exception at any seam.

**G. Self-efficacy becomes a seventh peer assessment channel.**
Rule: Step 4 §5.8 (absolute, no exception); §2.3 invariant 9. Disposition: **FAIL
CLOSED**.

**H. A discrepancy is silently averaged away.**
Rule: Step 4 §8.5; §2.3 invariant 11. Disposition: **FAIL CLOSED** on the averaging
act; **PRESERVE DISCREPANCY** is the only governed disposition.

**I. Multiple plausible hypotheses are forced into one because the pipeline wants
one answer.**
Rule: Step 4 §10.2; Step 5 §10.2. Disposition: **RETAIN MULTIPLE HYPOTHESES** — the
forcing act itself FAILS CLOSED.

**J. Phase 7 shorthand collapses or replaces an exact Step 4 taxonomy row.**
Rule: §7.2 (this document introduces no such shorthand); Step 4 §6.2 remains
primary and controlling. Disposition: **FAIL CLOSED** on any implementation
attempting this; not a permitted Phase 7 output under any framing.

**K. An unsupported claim is rendered because all agents agree.**
Rule: Step 4 §6.5; Step 5 §10.2 (majority agreement creates no truth). Disposition:
**FAIL CLOSED** — "Unsupported claim" is never producible regardless of agent
consensus.

**L. Model confidence overrides an unresolved scientific determination.**
Rule: Step 3 §8.5; Step 5 §10.2; §7.1. Disposition: **FAIL CLOSED** — confidence is
not a validation dimension.

**M. Retrieved/untrusted content contains instructions that attempt to elevate
authority.**
Rule: Step 5 §13.3; Step 6 §12.3; §8.2. Disposition: the instruction is **evaluated
as data and rejected as governance**; the underlying act proceeds or fails closed
exactly as it would without the embedded instruction.

**N. Read authorization is treated as permission to share/export.**
Rule: Step 6 §5.2; §2.3 invariants 16–17. Disposition: **FAIL CLOSED** on the
share/export act.

**O. Data authorized for one purpose is silently reused for another purpose.**
Rule: Step 6 §4.4; §5.4; §2.3 invariant 19. Disposition: **FAIL CLOSED** on the new
purpose absent its own authorization.

**P. Guardian permission exists but required student assent does not.**
Rule: Step 6 §6.2; §2.3 invariant 22. Disposition: **FAIL CLOSED** or **ESCALATE** —
guardian permission never substitutes for assent.

**Q. Safeguarding-relevant disclosure continues through ordinary automated
interpretation instead of routing.**
Rule: Step 6 §8.1–§8.3; §10.3. Disposition: **ESCALATE** to the responsible human
safeguarding process; the ordinary automated path **STOPS** for that content.

**R. AI is asked to investigate whether abuse actually occurred.**
Rule: Step 6 §8.1 (absolute); §10.3; §2.3 invariant 24. Disposition: **ESCALATE**/
route only; the investigation act itself is never performed, under any framing.

**S. Consequentiality is unresolved but automated consequential use proceeds.**
Rule: Step 6 §9.5, §14.3; §9.2; §2.3 invariant 31. Disposition: automated
consequential use **FAILS CLOSED**; the request MAY **ESCALATE** for human
classification.

**T. A machine-produced consequential-decision candidate is sent to a human for
approval instead of being failed closed.**
Rule: Step 6 §11.1, §11.3; §10.1; §2.3 invariants 27–28. Disposition: the candidate
**FAILS CLOSED** absolutely — routing it to a human "for approval" does not cure
it; only routing the *surrounding request* to an *independent* human-controlled
process (not an approval of the candidate) is permitted.

**U. A reviewer has platform authority but lacks domain-specific competence.**
Rule: Step 6 §5.3, §10.2; §2.3 invariant 25. Disposition: `REVIEW_INSUFFICIENT`;
**ESCALATE** to a competent reviewer or **FAIL CLOSED**.

**V. A permitted interpretation/recommendation is later used consequentially
without a separately governed human process.**
Rule: Step 6 §9.3.2, §11.2; §10.4; §2.3 invariant 29. Disposition: the consequential
use **FAILS CLOSED** pending the required review; the antecedent output's own
eligibility is unaffected.

**W. An external tool receives data merely because the tool is technically
available.**
Rule: Step 5 §8.4; Step 6 §12.2, §12.4; §8.3; §2.3 invariant 33. Disposition: **FAIL
CLOSED** on the transmission absent explicit Tier 3 authorization.

**X. Required audit/provenance is missing but a rendered output is still
released.**
Rule: §13.1; Step 4 §14.5; Step 5 §14.5. Disposition: **FAIL CLOSED** on the
release; an unreconstructable path is not a renderable path.

**Y. A genuine cross-phase conflict is silently reconciled rather than registered
for Owner adjudication.**
Rule: §1.4, §16.4. Disposition: the silent reconciliation is itself the violation;
the correct governed act is to **register OWNER ADJUDICATION REQUIRED** (§16.4) and
FAIL CLOSED on the dependent path pending it.

**Z. Phase 7 creates a new aggregate "ready," "safe," "validated," "fit,"
"approved," or similar master status/score.**
Rule: §11.2 (absolute prohibition). Disposition: **FAIL CLOSED** on any
implementation attempting this; this document itself creates no such status,
confirmed at §18 (Q10).

## 16. Cross-Phase Conflict / Gap / Owner-Adjudication Contract

### 16.1 What counts as a genuine conflict

A genuine conflict is a case where two controlling sources (Step 1–6, Canonical
Entity Model) impose requirements that cannot both be satisfied by any governed
act. A difference in vocabulary, emphasis, or level of detail across Steps is not a
conflict; it is the ordinary layering this document integrates.

### 16.2 Conflicts found during this integration

No genuine conflict among Step 1–6 controlling sources was found during authoring
of this version. Every seam contract in §6–§10 was constructed by directly applying
each Step's own stated rule at the point it governs, without needing to override
another Step's rule to make the composition work.

### 16.3 Gaps found during this integration

One integration-level clarification, not a conflict and not a new finding, was
made explicit at §5.4: Step 6 preconditions must be re-checked at every distinct
act across an end-to-end path, not satisfied once. This follows directly from
Step 6 §4.4 and §11.2 applied end-to-end; it states no new rule.

### 16.4 The Owner-adjudication registration form

Where a genuine conflict is discovered (by this document or a later one), it MUST
be registered here, or in a successor document, with: the exact conflicting
requirements, cited by section; the affected seam(s); and the dependent path's
fail-closed state pending Owner adjudication. It MUST NOT be silently reconciled
(§1.4). No entry is registered under this heading in this version because §16.2
found none.

### 16.5 No new governed family confirmed

Consistent with §3.4: every concept this document introduces (Seam, Seam Contract,
Governed Request Envelope, State Tuple) is a controlled classification, a
restatement of an existing operational record, or a descriptive integration
concept — never a new Pattern A/B governed family, and never registered in
`governed_instance`. No OWNER ADJUDICATION REQUIRED item arises from family
assignment in this version.

## 17. Carried Findings and Phase 7 Findings

This register records findings as they stand after Step 7. No finding is closed by
this specification. Recording a finding here is registration, not resolution.

### 17.1 CLOSED — unchanged, not reopened

**F-05, F-06, F-10, F-13 — CLOSED (Step 3), unchanged.** Integration relies on the
citation contract, derivation rule, developmental/grade separation, and
applicability matrix throughout §6–§9 without altering any of them.

### 17.2 OPEN — unchanged

**F-04 — dependency re-binding workflow. OPEN, unchanged.** Not touched by
integration.

**F-07 — current-version resolution and cardinality. OPEN, unchanged.**
Integration supplies no new applicability input to the Step 1 §9 resolution
predicate.

**M-1 — source-hierarchy and external-identifier pattern assignment. OPEN /
FAIL-CLOSED, unchanged.** Every seam in §6 that depends on source identity
inherits this fail-closed consequence unchanged.

### 17.3 PARTIALLY SPECIFIED / OPEN — unchanged

**F-12 — platform-role versus reviewer-authority implementation. PARTIALLY
SPECIFIED / still OPEN, unchanged.** §10.2 integrates, but does not further
specify beyond, the Step 6 §5.3/§10.2 boundary; authentication/onboarding
implementation remains out of scope (§19).

**M-2 — named scientific review authority for operational correspondence.
PARTIALLY SPECIFIED / still OPEN, unchanged.** §10.2 integrates the existing
dimension-specific competence requirement across every review type; no new
operational correspondence workflow is specified.

**F-11 — consequentiality classification. PARTIALLY SPECIFIED / OPEN, unchanged.**
Integration relies on, and does not extend, the Step 6 §9 general effect-and-use
principle and its explicit ROLL-UP UNRESOLVED treatment for rows the illustrative
list does not resemble (Step 6 §9.3.1, §20.2). The remaining open portion is the
same LOGICAL/POLICY gap Step 6 §20.2 already identifies — the "materially determine
or control" boundary for genuinely novel cases is not yet sufficiently governed by
any controlling source. Phase 7 integration work is implementation-adjacent
composition, not new scientific/policy authority, and explicitly MUST NOT and does
NOT manufacture that authority (§1.4, §2.3 invariant 39). F-11 is NOT closed by this
document.

### 17.4 DEFERRED — unchanged

**F-08, F-09, F-14 — DEFERRED, unchanged.** Untouched by integration; not modified
merely because this document mentions adjacent concepts.

### 17.5 AFFIRMED CONSTRAINT

**L-1 — immutable binding constraint. AFFIRMED CONSTRAINT, unchanged.** §12.4 and
§13.3 restate, and do not weaken, L-1's historical-truth-preservation principle
across the full integrated flow. L-1 is not an independent open work item and MUST
NOT be recorded as DEFERRED.

### 17.6 CONFIRMED STRENGTH / NO ACTION

**N-1. CONFIRMED STRENGTH / NO ACTION, unchanged.** Integration produced no
contradictory evidence and does not reopen it. It is not an open defect, requires
no corrective action, and MUST NOT be represented as an unresolved finding
requiring remediation. It MUST NOT be recorded as DEFERRED.

### 17.7 Genuinely new Phase 7 findings

None. No genuinely new cross-phase finding was identified during this integration
(§16.2–§16.3). Where a future review identifies one, it MUST be registered with a
new finding identifier, never by recycling an existing one, together with evidence,
affected seam, severity, fail-closed impact, disposition, and required Owner
adjudication where applicable.

## 18. Global Acceptance Gates Q1–Q10

| Gate | Result | Basis |
|---|---|---|
| Q1 Source fidelity | PASS | Every seam contract cites an existing Step 1–6 rule; new Phase 7 concepts (Seam, Seam Contract, Governed Request Envelope, State Tuple) are explicitly labeled as integration-layer descriptions, not new authority |
| Q2 Governance fidelity | PASS | No Owner boundary or accepted rule weakened; §2.2, §16.2 |
| Q3 Scientific fidelity | PASS | §7.2 preserves the full Step 4 taxonomy and construct firewall unmodified |
| Q4 Internal consistency | PASS (self-audited, §18.1) | No contradictory definitions found; see revalidation in the result package |
| Q5 Cross-phase consistency | PASS | §16.2: no genuine conflict found; every seam composes Step 1–6 without silent escalation |
| Q6 Traceability | PASS | §13.1 minimum reconstructable record |
| Q7 Safety | PASS | §9–§10 preserve every minors/safeguarding/human-review/consequential-use fail-closed boundary unmodified |
| Q8 Repository integrity | PASS | Only this artifact created; verified in the result package |
| Q9 Reproducibility | PASS | Stable artifact identity recorded in the result package; structural checks are script-reproducible |
| Q10 No false closure | PASS | §17 closes nothing; F-11 explicitly PARTIALLY SPECIFIED/OPEN with rationale; no phase, compliance, or production-readiness status is claimed complete |

### 18.1 Self-audit performed

Before finalizing, this document was checked for: duplicate headings; unresolved
internal `§` cross-references, including every lettered adversarial reference
against the actually-defined A–Z cases of §15; malformed tables; and stray
references to a "master score," "ready" status, or similar prohibited composite.
Results are reported in the Phase 7 result package (§18 of that package, item 10).

## 19. Explicit Non-Authorization

This specification authorizes none of the following: application or runtime code;
agent or orchestration runtime; prompts; model/provider configuration; RAG or
embeddings implementation; APIs; external tools or side effects; SQL, DDL,
migrations, or PostgreSQL/Supabase changes; RLS, authentication, account
provisioning, or role implementation; production or student-data processing;
consent-storage mechanics; safeguarding case-management software; notification
systems; production deployment or pilot execution; modification of Steps 1–6;
repository staging, commit, push, PR creation, merge, branch deletion, worktree
deletion, or `.gitattributes` modification; and Phase 8 or Phase 9 architecture or
implementation of any kind.

This specification makes no claim of: production readiness; legal or regulatory
compliance in any jurisdiction; runtime safety of any actual implementation;
scientific validation of any specific rule; or closure of any carried finding
beyond those already closed by Step 3 and restated unchanged in §17.1.

Describing this integration does not authorize implementing it. Later physical
realization MAY realize the semantics specified here and MUST NOT weaken,
reinterpret, or bypass them (§1.3–§1.4).

## 20. Next Step

Step 7 integrates the Step 1–6 substrates at the logical level only. Work that
builds on this integration is not authorized by it. Continuation requires an
integration review against Steps 1–6 and the Canonical Entity Model, an owner
closure decision for Step 7, and separate owner authorization for any later step,
including Phase 8.

Findings recorded as OPEN or PARTIALLY SPECIFIED in §17.2–§17.3 remain open.
Authentication, consent mechanics, safeguarding-case workflow, agent/orchestration
runtime, and any consequential-decision mechanism remain unauthorized and
unspecified. The existence of this specification is a precondition for later work,
not permission to begin it.

Completion of this document does not by itself close any carried finding beyond
F-05/F-06/F-10/F-13 (already closed by Step 3), does not confer an evidence,
legal, or compliance level on prior or future work, and does not convert
documentation completeness into scientific, rights, validation, safety,
operational, or production-readiness evidence.
