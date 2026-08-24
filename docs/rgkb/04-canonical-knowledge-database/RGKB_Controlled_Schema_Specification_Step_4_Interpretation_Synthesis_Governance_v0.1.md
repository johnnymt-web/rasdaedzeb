# RGKB Controlled Schema Specification — Step 4: Interpretation & Synthesis Governance — v0.1

- Phase: 7.1 — Controlled Schema Specification
- Step: 4 — Interpretation & Synthesis Governance
- Artifact type: Logical governance specification
- Version: v0.1
- Status: DRAFT — CONTROLLED AUTHORING
- Date: 2026-08-24
- Controlling architecture: RGKB_Canonical_Entity_Model_v0.2.1
- Controlling foundation: Step 1 — Governed Object / Versioning / Referential / Lifecycle Substrate v0.1
- Controlling foundation: Step 2 — Knowledge Object / Evidence / Provenance / Citation Substrate v0.1
- Controlling foundation: Step 3 — Scientific Knowledge Governance v0.1
- Gate authority: Owner Gate 0 adjudication; Owner closure of Step 3 (merge commit
  `8201643c5f627af9866cd0488c1d23a0441a110e`); Owner authorization of Phase 4 artifact
  development (RESUMED MACRO AUTHORIZATION PACKAGE v0.1, 2026-08-24)
- Production status: NOT AUTHORIZED FOR PRODUCTION

This document is subordinate to the approved canonical entity model, to the owner
adjudications recorded in the Owner Gate 0 Adjudication Record, and to the accepted
Step 1, Step 2 and Step 3 substrates. It specifies logical governance semantics only.
It creates no SQL, DDL, migration, Supabase, runtime, agent, RGIM, scoring, report-
generation, intervention, or production authorization. Later physical implementation
MAY realize these semantics. It MUST NOT weaken, reinterpret, or bypass the governance
constraints stated here.

## 1. Scope and Authority

### 1.1 What this document is

This document is an implementation-ready LOGICAL governance specification.

It specifies the Step 4 interpretation-and-synthesis governance substrate: the
authority boundary between direct assessment evidence, governed scientific knowledge,
synthesis inference, contextual interpretation, and human judgment; the eligibility
preconditions for a governed input to participate in interpretation or synthesis; the
construct-semantics firewall; the interpretation claim taxonomy; non-additive
synthesis governance; convergence, divergence and discrepancy governance; developmental
interpretation governance; uncertainty and abstention governance; the logical
architecture of the Integrated Career Profile; the guidance/recommendation boundary;
localization and context governance for interpretive output; and the traceability,
explainability and auditability obligations of every consequential interpretive or
synthesis path.

It is subordinate to `RGKB_Canonical_Entity_Model_v0.2.1`, which remains the
controlling architecture, and to the accepted Step 1, Step 2 and Step 3
specifications, which remain the controlling identity/versioning/lifecycle,
knowledge/evidence/provenance, and scientific-validation substrates respectively.

Within that subordination, this document is authoritative for later Step 4 physical
realization unless superseded by a later controlled specification version.

### 1.2 What this document is not

This document is NOT:

- an AI agent, RGIM, scoring engine, synthesis engine, or intervention engine;
- a database, runtime service, or report generator;
- a production prompt or production workflow;
- scientific, psychometric, rights, contextual, translation-fidelity, or safeguarding
  validation evidence;
- SQL, DDL, or a PostgreSQL physical schema; a migration or a Supabase schema change;
  an RLS, grant, or RPC specification;
- an activation, release-gate, or runtime-eligibility implementation;
- an operational scoring-correspondence implementation or a runtime provenance
  implementation;
- production authorization for any of the above.

### 1.3 Specification is governance architecture, not interpretive output

The existence of this specification does NOT establish that any interpretation,
synthesis claim, integrated profile, guidance statement, construct, or knowledge
object has become scientifically validated, developmentally appropriate, or safe to
present to a student.

This document specifies how interpretive and synthesis determinations are governed,
bounded, classified, traced and failed closed. It makes none of them.

Documentation completeness is not evidence completeness (Step 3 §1.3). Absence of
evidence, validation, rights, safeguarding approval, or explicit owner authorization
is NOT permission.

### 1.4 Non-authorization boundary

This document grants no authorization for SQL or DDL implementation, migrations,
Supabase changes, staging or production deployment, data ingestion, student-data
handling, runtime activation, RGIM or agent implementation, scoring-engine changes,
report-generation code, intervention-engine implementation, or any repository-history
action.

Later implementation MUST fail closed where required by this specification, and MUST
NOT weaken these boundaries.

### 1.5 Relationship to the Step 1, Step 2 and Step 3 substrates

Step 1 governs identity, versioning, immutability, lifecycle and referential
semantics. Step 2 governs what governed objects mean, what supports them, and how
that support is traced. Step 3 governs whether, on which dimension, by whose
authority and on what evidence a governed object has been determined scientifically
acceptable, and the developmental/grade applicability separation.

Step 4 governs a materially different question: given governed objects that are
eligible under Step 3, and given a student's operational assessment results (which
are never canonical knowledge — Canonical Entity Model §4.1(9), Step 3 §2.2), what
statements MAY, MUST, MUST NOT and CANNOT be produced about what those results mean,
individually and in combination, and what remains outside interpretation entirely.

Step 4 introduces no second identity authority, no second versioning authority, no
second lifecycle authority, no second provenance authority, and no second validation
truth store. Where Step 4 relies on a governed instance, that instance carries its
Step 1 identity as its own identity, exactly as Step 3 requires (Step 3 §14.1).

Where Step 4 names a semantic obligation and Step 1, Step 2 or Step 3 name the
mechanism that carries it, the earlier step governs the mechanism. Where this
document and a controlling document appear to conflict, the conflict MUST be reported
and adjudicated, and MUST NOT be silently reconciled. The full integration contract
is stated in §15.

### 1.6 Normative language

The Step 1 §1.4 vocabulary applies unchanged, as carried by Step 2 §1.5 and Step 3
§1.6, with the additions required by Step 4 scope.

- **MUST / MUST NOT** — mandatory requirement.
- **SHOULD / SHOULD NOT** — strong recommendation; deviation requires documented
  justification.
- **MAY** — permitted but not required.
- **FAIL CLOSED** — the dependent action does not proceed when required authoritative
  conditions cannot be established. It does not mean proceed with a warning, a
  default, or the nearest available answer.
- **ABSTAIN** — the governed outcome for an interpretive act whose required
  conditions cannot be established: no statement is produced, positive or negative,
  on the question at issue. Abstention is a governed outcome, not an omission (§10.3).
- **INTERPRETATION CLAIM** — a discrete governed statement produced by an
  interpretation or synthesis path, classified under the taxonomy of §6.
- **CONSTRUCT-LEVEL INTERPRETATION**, **CROSS-ASSESSMENT SYNTHESIS**, **INTEGRATED
  PROFILE CLAIM**, **CONTEXTUAL HYPOTHESIS**, **DEVELOPMENTAL INTERPRETATION**,
  **INQUIRY SIGNAL**, **DISCREPANCY SIGNAL**, **GUIDANCE STATEMENT**,
  **RECOMMENDATION**, **CONSEQUENTIAL DECISION** — defined in §3.2.
- **SYNTHESIS RULE** — a governed specialization of the Interpretation Rule Version
  family (Canonical Entity Model §15), defined in §3.5.
- **INTEGRATED CAREER PROFILE** — the primary runtime synthesis output, whose
  logical architecture is governed by §11.

No additional lifecycle, identity, evidence or validation vocabulary is defined in
this document. That vocabulary remains governed by Step 1, Step 2 and Step 3.

## 2. The Interpretation-Synthesis Boundary

### 2.1 What Step 4 governs

Step 4 governs the transformation of governed scientific knowledge and eligible
assessment results into statements a person may read, and the boundary before a
statement becomes a decision.

Step 4 governs this pipeline, and the boundary immediately after it:

```
MEASUREMENT → INTERPRETATION → SYNTHESIS → GUIDANCE  |  CONSEQUENTIAL DECISION
```

**MEASUREMENT** is the operational scoring of an administered instrument scale for
one student. It is operational data (Canonical Entity Model §3.3, §22.1) and is never
canonical knowledge (Canonical Entity Model §4.1(9)).

**INTERPRETATION** is the application of a governed, construct-scoped interpretation
rule (Canonical Entity Model §15) to an eligible measurement, producing a
construct-level statement about what that specific result may be taken to mean,
within the rule's governed constraints.

**SYNTHESIS** is the application of a governed synthesis rule (§3.5) across two or
more eligible construct-level interpretations, producing statements about
convergence, divergence, tension, or an integrated theme, without erasing the
construct identity of its inputs (§7, §11).

**GUIDANCE** is a bounded class of exploratory, reflective or inquiry-oriented
statement that may follow from interpretation or synthesis (§12).

**CONSEQUENTIAL DECISION** is categorically outside this pipeline. Nothing produced
by interpretation, synthesis, or guidance may cross into a consequential decision
without meaningful, non-ceremonial human review (§12.4, invariant 7 of §16).

### 2.2 What Step 4 does not govern

Step 4 does NOT govern:

- the operational scoring pipeline that produces a measurement, or its identifiers
  (Canonical Entity Model §10.7);
- the governed correspondence mechanism itself, which remains governed by Canonical
  Entity Model §10.7 and is only relied upon here as an eligibility precondition
  (§4.2);
- RGIM, agent, or runtime implementation of any interpretation or synthesis rule;
- authentication, account provisioning, consent mechanics, or platform permissions;
- the design of the runtime decision provenance store, which remains outside the
  canonical substrate under Canonical Entity Model §22 and Step 3 §5.7;
- privacy or access-control architecture governing who may read an Integrated Career
  Profile, which is explicitly deferred to a later phase (§11.7).

Student-linked or session-linked operational data MUST NOT enter the canonical
knowledge substrate in any form as a result of this specification, including as an
interpretation input example, a synthesis-rule test case, or an evidence citation.

### 2.3 What Step 4 must prevent by construction

Consistent with the Phase 4 objective, this specification is written so that no
governed path it authorizes can silently perform any of the following conversions.
Each is bound to the section that enforces it.

| Prohibited silent conversion | Enforced by |
|---|---|
| measurement → inference | §4 (eligibility), §6 (claim taxonomy) |
| inference → fact | §6.4, §10 |
| correlation → certainty | §10, §16 |
| interest → ability | §5.2, §17.A |
| personality → destiny | §5.3, §17.C |
| disagreement → an average | §7, §8, §17.L |
| exploration guidance → consequential decision | §12, §17.I |

## 3. Definitions and the Interpretation Authority Boundary (R4.1)

### 3.1 Purpose

This section formally distinguishes the classes of statement the interpretation and
synthesis pipeline may produce, and fixes the authority boundary between direct
assessment evidence, governed scientific knowledge, synthesis inference, contextual
interpretation, and human judgment. Every later section in this specification presumes
these definitions.

### 3.2 The interpretation claim taxonomy — definitions

Every class below is a distinct kind of governed statement. None may be inferred from,
substituted for, or silently promoted into another. Their permissible sources,
authority and traceability requirements are fixed in full in §6; this section states
what each class *is*.

- **Assessment result.** The operational, student-linked score or response profile
  produced for one student by an administered instrument scale, resolved through a
  governed correspondence to a canonical instrument scale where applicable (Canonical
  Entity Model §10.7). Not canonical knowledge. Not an interpretation.
- **Construct-level interpretation.** A statement about what an eligible assessment
  result means with respect to a single named construct, produced by a governed
  interpretation rule bound to exactly that construct (Canonical Entity Model §15,
  §16.1).
- **Cross-assessment synthesis.** A statement produced by a governed synthesis rule
  (§3.5) that relates eligible construct-level interpretations from two or more
  constructs, preserving each construct's identity (§7).
- **Integrated profile claim.** A synthesis-layer statement that appears in the
  primary section of an Integrated Career Profile (§11), traceable to the specific
  construct-level interpretations and synthesis rules it draws upon. It is a
  governed subtype of Cross-assessment synthesis, not a parallel class (§6.2).
- **Contextual inference.** A settled, governed statement applying a developmental,
  cultural, or situational qualifier (origin D, §3.3) to an interpretation or
  synthesis claim. Distinguished from a Contextual hypothesis by NOT being
  unsettled: it is a governed contextual determination, not a tentative one.
- **Contextual hypothesis.** A tentative, explicitly uncertain statement offered for
  exploration rather than assertion, whose governed evidence does not settle the
  question it addresses (§10.2). Distinguished from Contextual inference by its
  explicitly unsettled status.
- **Developmental interpretation.** A statement whose applicability is qualified by
  developmental relevance scope (Step 3 §12.2), never by grade scope alone (§9).
- **Inquiry signal.** A governed prompt for further exploration, question, or
  discussion, raised because evidence is incomplete, discrepant, or otherwise
  warrants inquiry rather than assertion (§8.4, §12.2).
- **Discrepancy signal.** A governed statement that names an unresolved tension or
  contradiction between two or more eligible inputs, preserved rather than resolved
  (§8).
- **Guidance statement.** A bounded, non-deterministic exploratory statement — a
  reflection prompt, exploration direction, or discussion prompt — that does not
  assign, exclude, rank, or determine anything about the student (§12.2).
- **Recommendation.** Any statement that goes beyond guidance to propose a specific
  course of action. A recommendation is permitted only within the constraints of
  §12.3 and remains categorically distinct from a consequential decision.
- **Consequential decision.** A determination that admits, rejects, employs,
  dismisses, excludes, disciplines, tracks, diagnoses, or otherwise materially affects
  a student's access to opportunity, standing, or treatment. Interpretation and
  synthesis under this specification MUST NOT produce a consequential decision under
  any circumstance (§12.4).

### 3.3 The five-way authority boundary

Every interpretation claim traces to one or more points of origin on the following
authority boundary, exactly as its taxonomy row (§6.2) declares. A claim that cannot
be placed on this boundary is not a governed claim and MUST NOT be produced (§6.6).

| Origin | What it is | What it is not |
|---|---|---|
| **A — Direct assessment evidence** | An eligible, resolved assessment result (§4) | Not an interpretation; carries no meaning beyond the scored value |
| **B — Governed scientific knowledge** | An eligible governed knowledge object version under Step 2/3, satisfying the applicability matrix (Step 3 §7) | Not evidence about this student; general scientific content |
| **C — Synthesis inference** | The output of a governed synthesis rule combining two or more construct-level interpretations (§7) | Not a new master construct; never additive (§7.3) |
| **D — Contextual interpretation** | A developmental, cultural, or situational qualifier applied under §9, §13 | Not a scientific claim in its own right; an applicability qualifier |
| **E — Human judgment** | An attributable act by an authorized human reviewer, counselor, or guardian, outside the automated pipeline | Not derivable from A–D; never simulated by a machine process (Step 3 §8.5) |

**Origin-set cardinality is not row cardinality.** A claim's authority-origin SET
contains one or more entries from A–E, bounded exactly by what its taxonomy row
(§6.2) declares as permissible source — never padded with an origin the row does not
declare, and never missing an origin the row requires. A claim's taxonomy-ROW
membership is separately fixed at exactly one (§6.3). These are two independent
cardinality rules and MUST NOT be conflated: origin-set membership is one-or-more;
row membership is exactly-one.

A resolved origin set of zero entries is not a valid claim and MUST FAIL CLOSED
(§3.6, §10.4). Multi-origin claims — including every construct-specific
interpretation (A+B) and every synthesis-layer or profile-layer claim (C, together
with the transitively traceable origins of every contributing input) — remain fully
reconstructable under §14 exactly as a single-origin claim is. Multi-origin
cardinality never reduces the traceability obligation of §14, and never permits
collapsing distinct origins into one undifferentiated citation.

### 3.4 What the boundary makes answerable

A conforming implementation of this specification MUST be able to answer, for any
interpretation claim it presents, each of the following questions, using only the
traceable record required by §14. Each question is resolved to an origin only where
that origin is actually part of the claim's taxonomy-row origin set (§3.3, §6.2).
Where a question's origin is not part of that set, the governed answer is explicitly
**NOT APPLICABLE — no such origin for this claim class**, never a fabricated,
borrowed, or generic-checklist origin.

1. "What was actually measured?" — resolves to origin A where A is part of the
   claim's origin set (for example, a construct-level interpretation or a direct
   result-derived statement); NOT APPLICABLE for a claim class whose row carries no
   A origin, such as a pure contextual inference or contextual hypothesis (§6.2).
2. "What was interpreted from the measurement?" — resolves to origin A plus the
   exact construct-level interpretation rule version applied, where the claim's row
   requires both; NOT APPLICABLE otherwise.
3. "What was synthesized across constructs?" — resolves to origin C plus the exact
   synthesis rule version and every construct-level interpretation it consumed,
   where the claim's row carries origin C (cross-assessment synthesis, integrated
   profile claim, or a discrepancy signal produced under §8); NOT APPLICABLE for a
   claim class that is not a synthesis-layer claim.
4. "What remains uncertain?" — resolves to the uncertainty state of §10 for every
   claim class. This question is universal and carries no origin-conditioning.
5. "What requires human judgment?" — resolves to origin E and to every point at
   which this specification requires human review (§12.4, §16 invariant 7), where
   the claim's row carries origin E or a human-review requirement otherwise applies
   to it; NOT APPLICABLE where neither holds.

An implementation MUST NOT pad questions 1, 2, 3, or 5 with an origin the claim's
taxonomy row does not declare merely to avoid an explicit NOT APPLICABLE answer. A
claim whose full resolved origin set is empty is not a valid claim and MUST FAIL
CLOSED (§3.3, §3.6, §10.4); a claim that correctly answers some questions NOT
APPLICABLE while its actual origin set remains non-empty and fully reconstructable
has satisfied this section for those questions.

An implementation that cannot answer all five questions — including correctly
determining which are NOT APPLICABLE — for a given claim has not satisfied this
specification for that claim, and the claim MUST FAIL CLOSED (§10.4).

### 3.5 The synthesis rule is a specialization, not a new family

A synthesis rule is NOT a new Step 1 governed family. It is a governed Interpretation
Rule Version (Canonical Entity Model §15.2) that:

- carries typed bindings to two or more constructs (Canonical Entity Model §16.1,
  already structurally permitted — a rule version's construct bindings are not
  cardinality-limited by the controlling architecture);
- carries a `rule_class` value of **cross-construct synthesis**, distinguished from
  **single-construct interpretation**, as a required attribute of the rule version;
- is additionally bound, wherever it draws on more than one construct, by every
  constraint of §7 (non-additive synthesis governance) and §8 (convergence/divergence/
  discrepancy governance), which apply only to rules of this class.

The exact controlled vocabulary for `rule_class` beyond this two-way distinction is
DEFERRED to a later controlled specification, consistent with the deferral pattern of
Step 3 §9.1 for review method. What is NOT deferred is that the distinction between
single-construct and cross-construct rules is fixed now, because §7's prohibitions
depend on being able to identify which rules they bind.

No physical schema, executable specification language, or activation logic is
designed by this section (§15.3 non-authorization pattern applies unchanged from
Canonical Entity Model §14.4/§15.3).

### 3.6 No claim without a traceable origin

Every interpretation claim of any class in §3.2 MUST resolve to at least one origin
in §3.3, and every synthesis-layer or profile-layer claim MUST resolve to a
reconstructable set of contributing origins (§14). A claim resolving to no origin, or
to an origin this specification does not recognize, MUST FAIL CLOSED.

## 4. Governed Input Eligibility (R4.2)

### 4.1 Purpose

This section defines the prerequisites under which an assessment result or a governed
scientific-knowledge object may participate in interpretation or synthesis. It applies
before §5 through §14 apply, because none of those sections may act on an ineligible
input.

### 4.2 Eligibility of an assessment result

An assessment result is eligible to enter interpretation or synthesis only where ALL
of the following independently hold. This is a conjunctive gate (Step 3 §4.3); no
element compensates for another.

1. **Governed correspondence resolves.** The result resolves, through an explicit,
   auditable, version-aware governed correspondence, to a canonical instrument-scale
   identity and version (Canonical Entity Model §10.7, invariant 38). An unresolved
   correspondence FAILS CLOSED per Canonical Entity Model §10.7.4 — this
   specification adds no exception.
2. **Instrument version eligibility.** The canonical instrument version and instrument
   scale the result resolves to carry a satisfied REQUIRED validation determination on
   every dimension the applicability matrix marks REQUIRED for that family (Step 3
   §7.5), and no eligible determination marks the instrument or scale withdrawn,
   superseded, retracted, or quarantined (Step 3 §6.7).
3. **Construct-scale mapping eligibility.** The construct↔scale mapping the result
   depends upon is itself an eligible governed instance under §4.3, not merely
   asserted.
4. **Administration and grade-band relevance.** The result was administered within a
   grade-band administrative context the instrument version declares applicable
   (grade scope, Step 3 §12.2) — an administrative fact only, carrying no
   developmental claim (§9.2).
5. **Non-contradictory status.** The result is not flagged by the operational domain
   as partial, contradictory-with-itself, or invalidated at the point of scoring. This
   specification does not define that operational flagging mechanism; it requires only
   that where such a flag exists and is unresolved, the result is ineligible.
6. **Language/localization context resolved.** Where the interpretation or synthesis
   path outputs governed localized text, the exact localized-text version to be
   rendered is resolvable for the declared delivery language (Step 2 §5.3, Canonical
   Entity Model §18.6), consistent with §13.

Where any element cannot be established, the result is ineligible for the
corresponding path, and any consequential path requiring it MUST FAIL CLOSED (§10.4).
Ineligibility is never destructive: the result is not deleted, and the instrument,
scale, or correspondence records remain resolvable exactly as Step 1 §5.3 and Step 3
§6.7 require.

### 4.3 Eligibility of a governed knowledge object

A governed knowledge object version, guardrail version, interpretation rule version,
synthesis rule, or construct definition version is eligible to participate in
interpretation or synthesis only where ALL of the following hold:

1. It has crossed its Step 1 immutability boundary and carries a content-asserted
   editorial state (Step 1 §7.2).
2. Every REQUIRED validation dimension the applicability matrix fixes for its family
   (Step 3 §7.5) carries a satisfied, non-withdrawn, non-superseded, eligible
   determination (Step 3 §6.7). Where a cell is CONDITIONAL and the triggering
   condition cannot be established as a governed determination, treat as REQUIRED and
   unsatisfied (Step 3 §7.4).
3. It is runtime-available under the DERIVED activation/quarantine axis (Step 1 §8.3);
   a quarantined object is never eligible regardless of its other axes.
4. Its developmental relevance scope (Step 3 §12.2) is `applicable` or
   `conditionally applicable` (with the condition established) for the student's
   administrative grade-band context; `outside supported scope` or `unresolved` MUST
   FAIL CLOSED (Step 3 §12.4).
5. Where the object is bound to a guardrail through a governance binding (Canonical
   Entity Model §16.1), the guardrail is itself eligible under this same test; a rule
   bound to an ineligible guardrail is itself ineligible (Canonical Entity Model
   §16.4, "fail-closed dependency rule," applied transitively).

### 4.4 No unsupported fallback and no heuristic substitution

The following are prohibited without exception:

- substituting an ineligible assessment result with a different, more convenient
  result;
- substituting an ineligible governed knowledge object with a superseded or withdrawn
  version of the same object;
- inferring eligibility from the mere existence of a plausible-looking identifier,
  label, or naming convention (Canonical Entity Model §10.7.3, §16.2);
- treating "the construct is obviously relevant" as a substitute for a satisfied
  construct-scale mapping determination;
- treating recency, popularity, or convenience as a tie-break where more than one
  candidate input is eligible and the governed derivation rule cannot resolve them to
  exactly one governed answer (Step 3 §6.5, §6.7).

Where no eligible input exists for a required element of an interpretation or
synthesis path, that path MUST ABSTAIN on the statement that depends on it (§10.3),
not substitute a plausible-seeming alternative.

### 4.5 Partial and missing results at the synthesis layer

Cross-assessment synthesis over N constructs requires each contributing construct's
interpretation to independently satisfy §4.2 and §4.3. Where fewer than the number of
constructs a synthesis rule declares as its minimum contributing set are eligible:

- the synthesis rule MUST NOT manufacture a plausible value for the missing
  construct (§17.F);
- the synthesis rule MUST either produce a narrower synthesis claim scoped to only
  the eligible constructs (where the rule's governed definition explicitly permits a
  reduced-input mode) or ABSTAIN on the full synthesis claim;
- the Integrated Career Profile (§11) MUST represent the missing construct as
  missing, not as silently absent from the narrative.

## 5. Construct Semantics Firewall (R4.3)

### 5.1 Purpose and mechanism

This section fixes, for each governed construct family the platform administers, the
explicit prohibited-semantic-substitution model: the set of conversions no
interpretation or synthesis rule may perform, regardless of how strong the
contributing evidence appears. Every prohibition in this section is independent of
every eligibility determination in §4 — a fully eligible input still MUST NOT cross
these lines.

This firewall binds guardrail authoring (Canonical Entity Model §14) and
interpretation/synthesis rule authoring (§3.5) alike. A guardrail encoding one of
these prohibitions takes precedence over any conflicting rule output per the
guardrail precedence invariant (Canonical Entity Model §16.3, invariant 27).

### 5.2 RIASEC — interest is not ability

RIASEC represents vocational interest orientation (Canonical Entity Model invariant
16; Step 1 §13; Step 3 §15). An interpretation or synthesis rule MUST NOT represent,
imply, or allow a reader to infer that a RIASEC result establishes:

- ability;
- intelligence;
- competence;
- achievement;
- verified skill;
- predicted occupational success.

A high RIASEC interest score is evidence of stated or demonstrated preference only.
It is never evidence of capability, and no synthesis rule may treat it as a proxy for
capability even where no competing skill evidence exists (§17.A).

### 5.3 Big Five — tendency is not destiny

Personality-related traits or tendencies MUST NOT be represented as:

- diagnosis;
- pathology;
- fixed identity;
- destiny;
- a career-suitability verdict;
- an occupational exclusion rule.

A Big Five result describes a measured tendency at the time of administration. An
interpretation rule bound to a Big Five construct MUST NOT phrase output in
categorical, unchangeable, or clinical language, and MUST NOT be used by any synthesis
or guidance path to exclude an occupational, subject, or activity direction from
exploration.

### 5.4 CAAS / Career Adaptability — readiness is not guaranteed capability

Adaptability and readiness constructs MUST NOT be represented as:

- general intelligence;
- general competence;
- verified occupational capability;
- guaranteed future success.

A CAAS-family result describes self-reported readiness/adaptability tendencies. It
MUST NOT be converted, by any synthesis rule, into a claim about what the student can
or will actually accomplish.

### 5.5 Work Values — preference is not qualification

What a student values or prefers in work MUST NOT be represented as:

- capability;
- qualification;
- occupational competence;
- a deterministic occupational assignment.

A work-values result states what the student reports valuing. It is permitted to
inform exploration guidance (§12.2) about which occupational directions might be
worth investigating further; it MUST NOT be presented as evidence the student is
suited, entitled, or qualified for any specific occupation.

### 5.6 Employability Skills — measured or self-reported is not verified performance

Employability-skills constructs, whether measured or self-reported, MUST NOT be
converted into:

- verified workplace performance;
- a professional qualification;
- occupational certification;
- guaranteed job readiness.

Where skill-related evidence is strong, that strength describes the assessed
construct's own scope and MUST NOT expand into a general employability verdict
(§17.B, prohibiting the inverse conflation — ability-related evidence converted into
a preference claim).

### 5.7 EQ-related results — measurement is not moral or clinical judgment

EQ-related results MUST NOT become:

- psychological diagnosis;
- moral judgment;
- fixed interpersonal identity;
- deterministic social prediction.

An interpretation rule bound to an EQ-family construct MUST phrase output as a
descriptive, time-bound tendency and MUST NOT be used to characterize the student's
character or worth.

### 5.8 Self-efficacy — process/intervention/outcome construct, never a seventh channel

Self-efficacy remains governed according to the Phase 3 / Canonical Entity Model
scientific model (Canonical Entity Model invariant 17; Step 1 §13; Step 3 §15). It MAY
function as a process, intervention, or outcome construct where a specific governed
knowledge object version and interpretation rule scientifically authorize that use.

Self-efficacy MUST NOT become an additional independent assessment channel merged
into synthesis on the same footing as RIASEC, Big Five, CAAS, Work Values,
Employability Skills, or EQ. This prohibition is absolute and admits no exception:
no interpretation rule, no synthesis rule, and no governed authorization of any kind
— however explicit, however well-evidenced — may convert self-efficacy into a
seventh peer channel, and no rule may assign it an aggregation, weighting, or
normalization role across other constructs' results (§7.5). Self-efficacy's only
governed uses are the process, intervention, and outcome uses stated in the
preceding paragraph; there is no fourth use, and this specification creates none.

### 5.9 The prohibited-substitution matrix

The following table consolidates §5.2–§5.8 as a single reference. A cell marked ✗
states a conversion this specification prohibits absolutely; no eligibility, no
convergence, and no synthesis rule may override it.

| Construct family | ✗ Ability/skill | ✗ Diagnosis/identity | ✗ Guaranteed capability | ✗ Qualification | ✗ Moral/social verdict | ✗ 7th channel |
|---|---|---|---|---|---|---|
| RIASEC (interest) | ✗ | | | | | |
| Big Five (personality) | | ✗ | | | | |
| CAAS (adaptability) | | | ✗ | | | |
| Work Values | | | | ✗ | | |
| Employability Skills | | | ✗ | ✗ | | |
| EQ | | ✗ | | | ✗ | |
| Self-efficacy | | | | | | ✗ |

### 5.10 Firewall violations fail closed

An interpretation or synthesis rule whose declared output_constraint (Canonical Entity
Model §15.2) cannot be shown, at authoring time, to respect every applicable row of
§5.9 is not eligible for activation (Canonical Entity Model §17.4). Where a runtime
output would cross one of these lines and no guardrail blocks it, that is a guardrail
coverage gap, not a permission — the corresponding consequential path MUST FAIL CLOSED
under the general fail-closed rule of §10.4 pending a governed guardrail.

## 6. Interpretation Claim Taxonomy (R4.4)

### 6.1 Purpose

This section fixes the governed taxonomy a reader can use to distinguish, for any
claim presented, WHAT THE ASSESSMENT SHOWED from WHAT THE SYSTEM INFERRED. It builds
directly on the claim classes defined in §3.2.

### 6.2 The taxonomy table

For each permissible claim class, this table fixes the permissible source — the
claim's authority-origin SET under §3.3, one or more letters as required by the
class — the required authority, the required provenance, the uncertainty
expectation, the traceability requirement, and the prohibited overstatement.

A rendered claim belongs to exactly one row of this table (§6.3). That row's
permissible-source set may itself name more than one origin; row cardinality and
origin-set cardinality are governed independently (§3.3) and neither substitutes for
the other.

**Complete §3.2 correspondence.** Every class defined in §3.2 maps to exactly one of
the following: a dedicated row below, using the identical §3.2 term; or an explicit
governed subtype of a dedicated row, stated at the row's name or immediately
following the table. No §3.2 class is left unmapped, and no row below introduces a
claim class §3.2 does not define.

- Assessment result → the *Direct result-derived statement* row: the presented-claim
  form of an eligible assessment result (§4.2). The two terms name the input object
  and the claim about it respectively, and are intentionally distinct, not a naming
  inconsistency.
- Construct-level interpretation → the *Construct-level interpretation* row.
  *Scientifically supported interpretation* is its governed subtype, defined
  immediately following the table: every scientifically supported interpretation
  MUST be a construct-level interpretation whose underlying KU version additionally
  carries a satisfied REQUIRED `scientific`-dimension determination (Step 3 §7); it
  is not a parallel or independent row.
- Cross-assessment synthesis → the *Cross-assessment synthesis* row.
  *Integrated profile claim* is its governed subtype, defined immediately following
  the table.
- Contextual inference → the *Contextual inference* row (settled D-origin
  qualifier).
- Contextual hypothesis → the *Contextual hypothesis* row (unsettled D-origin
  qualifier); distinguished from Contextual inference solely by its unsettled
  status, per §3.2.
- Developmental interpretation → the *Developmental interpretation* row.
- Inquiry signal → the *Inquiry signal* row.
- Discrepancy signal → the *Discrepancy signal* row.
- Guidance statement → the *Guidance statement* row.
- Recommendation → the *Recommendation* row.
- Consequential decision → no row. It remains categorically prohibited output
  (§12.4) and is not a permissible taxonomy class.

| Claim class | Permissible source | Required authority | Required provenance | Uncertainty expectation | Traceability requirement | Prohibited overstatement |
|---|---|---|---|---|---|---|
| Direct result-derived statement | A only | Governed correspondence (§4.2) | Exact assessment result + exact instrument-scale version | None asserted beyond the measured value | Resolves to A alone | Implying meaning beyond the scored value |
| Construct-level interpretation | A + B via one interpretation rule | Interpretation rule version, construct-scoped | Rule version, bound KU version(s), bound guardrail version(s) | Governed by the rule's evidence requirements (§15.4 of Canonical Entity Model) | Resolves to exact rule version + exact result | Extending beyond the single bound construct |
| Cross-assessment synthesis | C, from ≥2 construct-level interpretations | Synthesis rule (§3.5) | Every contributing construct-level interpretation, by exact instance | MUST NOT exceed the weakest contributing claim's uncertainty (§8.3) | Resolves to synthesis rule version + every contributing claim | Treating convergence as proof (§8.2) |
| Contextual inference | D | Human or governed contextual rule under §9/§13 | The contextual qualifier applied, its governed basis, and the exact interpretation or synthesis claim it qualifies, by exact instance | Explicitly qualified as inference, never as measurement | Resolves to the qualifier's governed source; the qualified claim remains separately traceable through its own chain (§14) and is never folded into this row's origin set | Presenting a contextual qualifier as a scientific claim |
| Developmental interpretation | B or C, qualified by developmental relevance scope | Satisfied REQUIRED `developmental` dimension (Step 3 §7) | Developmental relevance scope of the contributing KU version(s) | MUST NOT be derived from grade or age alone (§9.4) | Resolves to the developmental scope determination | Substituting grade scope for developmental relevance (§9) |
| Discrepancy signal | C, from conflicting contributing claims | Synthesis rule with discrepancy-handling behaviour (§8) | Every conflicting contributing claim, named individually | Explicit — the signal exists because of unresolved disagreement | Resolves to all conflicting claims | Averaging or silently resolving the conflict (§8.5) |
| Inquiry signal | Any of A–D where evidence is incomplete | The rule or human judgment that raised it | The specific gap that motivated it | Explicit — raised because evidence is insufficient | Resolves to the gap identified | Presenting as though evidence were sufficient |
| Contextual hypothesis | D, unsettled | Human judgment or an explicitly hypothesis-typed rule output | The unsettled question and why it is unsettled | Explicit, carries no confidence value (§10.2) | Resolves to its origin and its unsettled basis | Presenting as a settled finding |
| Guidance statement | Inherited from its motivating claim(s): the same origin set as whatever interpretation/synthesis claim(s) it responds to (§3.3, one or more of A–D as applicable) — never a manufactured origin merely to complete this column | Bounded by §12 | The exact motivating interpretation or synthesis claim(s), by exact instance | N/A — guidance is not a truth claim | Resolves to its motivating claim(s), and through them only to the origins those claims actually carry | Crossing into recommendation or consequential decision (§12.3, §12.4) |
| Recommendation | Same origin set as its motivating claim(s) (§3.3, one or more of A–D as applicable) | Interpretation/synthesis rule authority of the motivating claim(s), plus the §12.3 conditions satisfied | The exact motivating interpretation or synthesis claim(s) it proposes an action in response to | MUST NOT exceed the uncertainty of its motivating claim(s) (§10) | Resolves to its motivating claim(s) + the satisfied §12.3 conditions | Assigning, excluding, ranking, or determining occupational/academic/disciplinary standing; crossing into a consequential decision (§12.4) |
| Unsupported claim | None | None | None | N/A | Cannot be resolved to §3.3 | Prohibited outright — MUST FAIL CLOSED if produced (§6.5) |

**Scientifically supported interpretation — governed subtype of Construct-level
interpretation.** A scientifically supported interpretation (§3.2, §6.2) is the
governed subtype of a Construct-level interpretation claim whose underlying
knowledge-unit version additionally carries a satisfied REQUIRED determination on
the `scientific` dimension (Step 3 §7), supported by typed evidence links to
evidence anchors (Step 2 §6.1). It inherits, and does not replace, the parent row's
full requirement set: its permissible source remains A + B via one interpretation
rule (§3.3), its required authority remains the construct-scoped interpretation rule
version, and its required provenance remains the rule version plus the bound KU
version(s) and guardrail version(s). Scientific support adds three things on top of
the parent row, and adds nothing else: the satisfied `scientific`-dimension
determination itself; the typed evidence links supporting it; and an uncertainty
expectation additionally bounded by the epistemic characterization of its KU version
(Step 2 §5.4) — a scientifically supported interpretation MUST NOT be presented as
more certain than that characterization supports. For purposes of §6.3's
exactly-one-row rule, a scientifically supported interpretation resolves to exactly
the Construct-level interpretation row; it is a governed qualification of that row,
never a second, competing row.

**Integrated profile claim — governed subtype of Cross-assessment synthesis.** An
integrated profile claim (§3.2, §11) is the governed subtype of a Cross-assessment
synthesis claim that additionally satisfies every requirement of §11.2–§11.3: it
appears in the primary integrated-theme section of an Integrated Career Profile, and
it names, individually, every contributing construct-level interpretation and the
exact synthesis rule version that produced it. It carries the Cross-assessment
synthesis row's permissible source, required authority, required provenance, and
uncertainty expectation unchanged, with one additional traceability obligation
beyond that row: resolvability to the specific Integrated Profile Architecture
version and profile section it appears in (§11.3, §18.1). Its prohibited
overstatement is the Cross-assessment synthesis row's overstatement (treating
convergence as proof, §8.2) plus the profile-specific prohibition of §11.4 (erasing
which construct(s) contributed to a given statement). A claim that does not satisfy
§11.2–§11.3 in addition to the Cross-assessment synthesis row's own requirements is
not a governed integrated profile claim; it MUST either be treated as an ordinary
cross-assessment synthesis claim or MUST FAIL CLOSED where it also fails the
Cross-assessment synthesis row's requirements (§10.4).

### 6.3 Reading the taxonomy

A reader — student, parent, counselor, or reviewer — MUST be able to determine a
claim's row in §6.2 from what is rendered with it, not from external knowledge of how
the system works. This requires, at minimum, that a rendered claim be accompanied by
enough structural context (section placement in the Integrated Career Profile
architecture, §11.3) or explicit labelling to place it in exactly one row.

A claim that could plausibly belong to more than one row as rendered has not
satisfied this section, because it does not let a reader distinguish what was shown
from what was inferred.

### 6.4 No silent promotion between rows

The following are prohibited without exception:

- rendering a construct-level interpretation without indicating that it is an
  interpretation, such that a reader could mistake it for a direct result-derived
  statement;
- rendering a cross-assessment synthesis claim without naming that it draws on
  multiple constructs;
- rendering a contextual inference or contextual hypothesis with the same visual or
  textual register as a scientifically supported interpretation;
- rendering an inquiry signal or discrepancy signal as though it were a resolved
  finding;
- rendering guidance as though it were a recommendation, or a recommendation as
  though it were a consequential decision.

### 6.5 Unsupported claim is not a producible class

"Unsupported claim" in §6.2 is not a permitted output. It is listed to make explicit
that a claim resolving to no §3.3 origin, or to more claim classes than one
simultaneously, is not a governed claim. Any path that would produce one MUST FAIL
CLOSED before output (§10.4), not render the claim with a disclaimer.

### 6.6 Relationship to §3

This taxonomy operationalizes the definitions of §3.2 against the authority boundary
of §3.3. Sections §7 through §14 state, for each taxonomy row that involves more than
one construct or more than one input, the specific governance rules that apply beyond
this table.

## 7. Non-Additive Synthesis Governance (R4.5)

### 7.1 Purpose

This section defines synthesis without manufacturing a hidden master construct,
extending the no-master-score invariant (Canonical Entity Model §4.3, invariant 29;
Step 1 §8.5; Step 3 §4.3) from the scientific-validation layer, where it is already
closed, into the interpretation-and-synthesis layer, where it has not previously been
stated.

### 7.2 The prohibited list

The following are prohibited without exception, at every point in the interpretation
and synthesis pipeline:

- a master validation score;
- a master student score;
- a universal career-fit score;
- cross-test arithmetic averaging;
- arbitrary weighted aggregation;
- scientifically unsupported normalization across heterogeneous constructs;
- hidden ranking;
- hidden composite suitability score;
- a "best career" calculation from heterogeneous assessments;
- deterministic occupation matching;
- conversion of several weak signals into one falsely strong signal.

This list is the direct extension of the independent-dimension gate contract (Step 3
§4.3) and the axis-independence rule (Step 1 §8.5) to construct-level interpretation
outputs. Where those sections prohibit aggregating *validation dimensions*, this
section prohibits aggregating *construct-level interpretation claims*. The two
prohibitions are structurally identical and neither substitutes for the other.

### 7.3 Complementary constructs remain scientifically distinct

Complementary constructs MUST remain scientifically distinct even when they are
presented together in one synthesis claim or in the Integrated Career Profile (§11).

A synthesis rule combining RIASEC, Big Five, CAAS, Work Values, Employability Skills
and EQ inputs MUST preserve, for every claim it produces, which construct(s)
contributed to that specific claim. A synthesis claim that cannot name its
contributing constructs individually is not a governed synthesis claim (§3.6).

### 7.4 Integrated presentation is not numerical aggregation

Presenting several construct-level interpretations together, in one narrative
section, under one integrated theme (§11), is permitted and is the intended purpose
of the Integrated Career Profile. This is presentation, not aggregation.

A synthesis rule MUST NOT compute any numeric value — a score, an index, a percentage,
a weight, or a rank — from more than one construct's result or interpretation, for
the purpose of that presentation or any other. Grouping claims under a shared theme
label is permitted; deriving a number from them is not.

### 7.5 Self-efficacy cannot be smuggled in as aggregation glue

A synthesis rule MUST NOT use a self-efficacy construct as an implicit weighting or
normalization factor across other constructs' results, under any authorization.
Doing so would reintroduce arithmetic aggregation under a different name and is
additionally an absolute, non-waivable violation of §5.8.

### 7.6 Verification obligation on synthesis rule authoring

Before a synthesis rule may be activated (Canonical Entity Model §17.4), its declared
`output_constraint` MUST be demonstrated, in the specification language it is
authored in, to contain no arithmetic combination operator applied across more than
one construct's contributing value. This specification does not design that
specification language (Canonical Entity Model §14.4, §15.3); it fixes the
requirement the language must be able to express and enforce.

## 8. Convergence, Divergence and Discrepancy (R4.6)

### 8.1 Purpose and relationship to Step 3 §10–§11

Step 3 §10–§11 governs disagreement among competing *scientific positions* held in
the canonical substrate — for example, two published sources disagreeing about a
construct's predictive validity. That substrate, its adjudication mechanism, and its
findings (F-05, F-06 closed; the participating-position family deferred) are
UNCHANGED by this section and are not reopened here.

This section governs a structurally analogous but materially different question:
disagreement among *one student's own eligible construct-level interpretations* at
the synthesis layer — for example, a student's RIASEC interest theme and Big Five
tendency appearing to point in different directions. That disagreement is
student-linked, operational, and lives in runtime provenance (Canonical Entity Model
§22), never in the canonical substrate. The two "discrepancy" concepts MUST NOT be
conflated: a scientific-position conflict is adjudicated once, canonically, for all
students; a synthesis-layer discrepancy is evaluated per student, per synthesis event,
and is never written back into the canonical substrate.

### 8.2 Convergence is not proof

Where several eligible construct-level interpretations appear to point toward a
common theme, a synthesis rule MAY represent that convergence as support for an
integrated theme (§11.3).

Convergence MUST NOT be treated as proof merely because multiple assessments appear
aligned. The strength of a synthesis claim MUST NOT exceed the scientific authority
of its weakest contributing construct-level interpretation (§8.3). Apparent alignment
across constructs measuring related but distinct things is expected and is not, by
itself, independent confirmation of anything (§17.E).

### 8.3 Claim strength does not exceed its weakest contributor

Where a synthesis claim draws on interpretations of differing epistemic
characterization (Step 2 §5.4) or differing uncertainty state (§10), the synthesis
claim's own uncertainty expectation (§6.2) MUST be at least as cautious as its most
uncertain contributor. A synthesis rule MUST NOT let a strongly-evidenced contributing
claim mask a weakly-evidenced one.

### 8.4 The governed disposition set for disagreement

Where convergence, divergence, tension, contradiction, partial agreement, or missing
evidence is present among contributing inputs, a synthesis rule MUST resolve to
exactly one of the following governed dispositions. This set is the minimum required
distinction; the exact controlled vocabulary encoding is DEFERRED to a later
controlled specification, consistent with the deferral pattern already used for
evidence status (Step 2 §8.2) and validation-outcome vocabularies (Step 3 §4.1).

- **INTERPRET** — contributing inputs converge and each independently satisfies
  §4/§5/§6; an integrated theme may be stated, qualified per §8.2–§8.3.
- **QUALIFY** — contributing inputs partially agree; a theme may be stated only with
  an explicit qualification naming the partial disagreement.
- **PRESERVE DISCREPANCY** — contributing inputs materially disagree; the disagreement
  MUST be surfaced as a discrepancy signal (§3.2, §6.2), not resolved.
- **REQUEST INQUIRY** — evidence is incomplete or the disagreement's basis is unclear;
  an inquiry signal MUST be raised (§12.2) rather than a claim.
- **RETAIN MULTIPLE HYPOTHESES** — more than one contextual interpretation is
  plausible and none is preferred by governed evidence; each MUST be presented,
  none MUST be presented as more likely without governed support (§10.2).
- **ABSTAIN** — none of the above can be established; no statement is produced
  (§10.3).

### 8.5 Prohibited resolutions of disagreement

The following are prohibited without exception, extending Step 3 §10.5's prohibitions
on scientific-position adjudication to the synthesis layer:

- averaging, summing, weighting, or otherwise numerically aggregating conflicting
  construct-level interpretations or the results underlying them;
- representing the state of a disagreement as one outcome value plus one confidence
  value;
- silently preferring one construct's interpretation over another's without recording
  a QUALIFY or PRESERVE DISCREPANCY disposition;
- omitting one side of a discrepancy from the Integrated Career Profile;
- inferring convergence from the absence of a recorded discrepancy;
- treating the more recently administered assessment as authoritative by virtue of
  recency;
- treating the assessment with the larger item count, or the more "objective-seeming"
  construct, as authoritative by virtue of count or type;
- deleting, downgrading, or unlinking a discrepant contributing claim to present a
  cleaner integrated theme.

Absence of a recorded discrepancy is not evidence of agreement (§10.4, extending Step
3 §10.5's final sentence to the synthesis layer).

### 8.6 Discrepancy is an inquiry signal, not an averaging target

A discrepancy MAY legitimately become an inquiry signal, a contextual question, a
developmental question, a prompt for counselor discussion, a reason for cautious
language, a reason to retain multiple hypotheses, or a reason to abstain. It MUST NOT
be treated as a defect to be smoothed over, and its purpose is never to be erased
(Canonical Entity Model invariant 19; Step 3 §11.4).

Material contradictions between contributing construct-level interpretations MUST
remain visible in the Integrated Career Profile (§11.4), not only in an internal
audit trail.

## 9. Developmental Interpretation Governance (R4.7)

### 9.1 Purpose

This section preserves and applies, at the interpretation and synthesis layer, the
grade-scope/developmental-relevance-scope separation that Step 3 §12 already CLOSED as
F-10. This section does not reopen F-10. It states how that closed distinction
constrains interpretation and synthesis output, which Step 3 explicitly left to a
later step (Step 3 §12 governs applicability determinations; it does not govern
interpretive language).

### 9.2 Grade governs administration and presentation only

Grade or grade-band context MAY govern:

- which instrument version and question-set version were administered;
- which localized-text register and vocabulary level is used in presentation;
- which school-context framing (subject choices, extracurricular examples) is used.

Grade MUST NOT be treated as evidence of, or a substitute for, any developmental claim
about the student (Step 3 §12.3, §12.5, unchanged and restated here for interpretation
authoring guidance).

### 9.3 Developmental interpretation requires its own governed basis

A developmental interpretation (§3.2) is permitted only where a governed knowledge
object version carries a satisfied REQUIRED determination on the `developmental`
dimension (Step 3 §7.5), scoped to developmental relevance scope, and that
determination's scope covers the student's administrative grade-band context under a
governed, non-deterministic mapping (§9.4).

No interpretation or synthesis rule may itself assert a developmental-stage
vocabulary; any such assertion is a separate scientific claim requiring its own KU
version, evidence, and scientific determination (Step 3 §12.3, unchanged).

### 9.4 Prohibited developmental inferences at the interpretation layer

Restating and applying Step 3 §12.5 to interpretation and synthesis output
specifically, the following are prohibited without exception:

- an interpretation or guidance statement that infers the student's developmental
  stage from grade or age;
- a synthesis rule that substitutes grade scope for developmental relevance scope
  when deciding whether a developmental interpretation may be produced;
- language that treats a grade band as a psychological classification of the student
  ("as a 9th grader, you are at the stage of...");
- widening a developmental interpretation's stated scope because it appears useful
  for a student outside that scope;
- deriving developmental applicability from any other validation dimension (Step 3
  §12.5, final bullet).

### 9.5 Interaction with the Integrated Career Profile

Where the Integrated Career Profile (§11) presents developmentally scoped content
differently for different grade bands, that variation MUST be justified by (a) grade
scope for administration/presentation register, or (b) an independently satisfied
developmental determination for developmental content — never by treating (a) as
sufficient justification for (b).

## 10. Uncertainty, Missing Evidence and Abstention (R4.8)

### 10.1 The governed uncertainty states

Extending Step 3 §11.2's evidence-level states and Step 2 §8.4's status states to the
interpretation-and-synthesis layer, the following states MUST remain distinguishable
wherever the distinction matters:

- **result uncertainty** — the measurement itself carries a known margin (e.g. scale
  reliability), where the operational domain records one;
- **measurement uncertainty (governed)** — a governed knowledge object version states
  a scientifically characterized limitation on what the instrument can establish
  (Step 3 §11.2 "limitation");
- **evidence uncertainty** — the question a claim addresses applies and governed
  evidence does not settle it (Step 3 §11.2 "uncertainty");
- **synthesis uncertainty** — arising from §8.3, where a synthesis claim's own
  uncertainty is bounded by its weakest contributor;
- **contextual uncertainty** — a developmental, cultural, or situational qualifier
  (§9, §13) whose applicability is itself not fully established;
- **missing input** — a required contributing construct-level interpretation is
  wholly absent (§4.5);
- **incomplete input** — a required contributing construct-level interpretation exists
  but does not cover the full scope a synthesis rule expects;
- **unresolved contradiction** — §8.4's PRESERVE DISCREPANCY disposition applies and
  has not been adjudicated by human judgment;
- **unresolved authority** — a required reviewer authority (Step 3 §8) cannot be
  established for a determination the claim depends on;
- **unsupported inference** — a candidate statement cannot be placed on the §3.3
  authority boundary at all.

Collapsing any of these into another, or into a pass, is prohibited, exactly as Step 2
§8.4 and Step 3 §4.4 prohibit at their own layers.

### 10.2 No invented confidence values

An interpretation or synthesis path MUST NOT invent a numerical confidence
percentage, probability, or score without an explicit scientific authority for that
specific number (extending Step 2 §5.4 and Step 3 §11.3's non-arithmetic requirement
to interpretive and synthesis output).

An interpretation or synthesis path MUST NOT manufacture a certainty label — "high
confidence," "strongly indicates," "proven" — unsupported by the epistemic
characterization of its contributing governed knowledge (Step 2 §5.4).

Contextual hypotheses (§3.2, §6.2) carry no confidence value at all; they are
qualitatively distinguished from stronger claim classes by their row in §6.2, not by
an attached number.

### 10.3 Abstention is the governed outcome, not heuristic completion

Where an interpretation or synthesis claim cannot be justified under §3 through §9,
the governed outcome is ABSTAIN: no statement is produced on that question, positive
or negative.

Abstention MUST NOT be silently substituted with:

- the most plausible-sounding statement;
- a hedged version of an unjustifiable claim, presented as though hedging made it
  justifiable;
- a generic statement that avoids the specific question without disclosing that
  abstention occurred.

Where a section of the Integrated Career Profile abstains on a construct or theme, the
profile MUST disclose that the section was not produced and, where determinable,
disclose the general reason class (missing input, ineligible input, unresolved
authority, unresolved contradiction, unsupported inference) without exposing internal
implementation detail that carries no governance meaning.

### 10.4 Fail-closed rule for interpretation and synthesis

A consequential interpretation or synthesis path MUST FAIL CLOSED where, at minimum:

- a required input is ineligible under §4;
- a required construct semantics firewall row (§5.9) cannot be shown to be respected;
- a candidate claim cannot be placed in exactly one row of the taxonomy of §6.2;
- a synthesis claim would require prohibited aggregation under §7.2;
- a discrepancy exists and no disposition of §8.4 can be established;
- a developmental interpretation is attempted and §9.3's basis cannot be established;
- an uncertainty state of §10.1 applies and cannot be resolved to a governed
  representation;
- the claim would cross into a consequential decision under §12.4;
- traceability under §14 cannot be established for the claim.

FAIL CLOSED here carries the same meaning Step 1 §10, Step 2 §14 and Step 3 §13
already fix: the dependent action does not proceed, nothing is deleted or rewritten,
and every governed instance the path touched remains resolvable exactly as it was
before the attempt.

### 10.5 M-1 is not touched or closed by this section

This section does not depend on, and does not adjudicate, the source-hierarchy pattern
assignment question of M-1. M-1 remains OPEN and FAIL-CLOSED exactly as Step 3 §17.2
leaves it (§19.2). Nothing in this specification supplies authoritative grounds to
close it, and it is not closed here.

## 11. Integrated Career Profile Governance (R4.9)

### 11.1 Nature and status

The Integrated Career Profile is the primary synthesis-layer output presented to a
student, parent, or counselor. It is a RUNTIME output, produced by applying eligible
interpretation and synthesis rules to one student's eligible assessment results. It
is student-linked operational data. It is NEVER canonical knowledge, and no instance
of it may enter the RGKB (Canonical Entity Model §4.1(9), §22.1).

What IS governed here, and IS canonical, is the **Integrated Profile Architecture**:
the governed template that fixes which sections an Integrated Career Profile may
contain, which claim classes (§6.2) are permitted in which section, the required
traceability fields for each section, and the ordering and appendix rules of §11.5.
The Integrated Profile Architecture is defined as a governed family in §18.

### 11.2 The profile is synthesis, not flattening

The primary section of an Integrated Career Profile MUST NOT merely concatenate
isolated per-assessment sections (RIASEC result + Big Five result + CAAS result +
Work Values result + Skills result + EQ result presented as unrelated blocks).

Instead, the primary section MUST be organized around **integrated themes**: named
groupings that represent how interests, personality-related tendencies,
adaptability/readiness, work values, skill-related evidence, and socio-emotional/
contextual evidence relate to one exploration-relevant question, together with:

- convergence and divergence among the contributing constructs (§8);
- tensions and discrepancies, preserved rather than smoothed (§8.6);
- developmental considerations, where independently justified (§9.3);
- exploration implications (§12.2), where they follow;
- the uncertainty state of the theme (§10.1);
- the explicit limits of what the theme does and does not establish.

### 11.3 Traceability of an integrated theme

Every integrated theme MUST remain traceable, per §14, to:

- the exact synthesis rule version that produced it;
- every contributing construct-level interpretation, by exact instance, and the
  construct each belongs to;
- the disposition of §8.4 that governed how its contributing inputs were combined;
- the uncertainty state of §10.1 that applies to it.

An integrated theme that cannot be traced to this minimum set is not a governed
theme and MUST NOT be included in the profile (§10.4).

### 11.4 The integrated layer must not erase construct identity

A reader MUST be able to determine, for any statement in an integrated theme, which
construct(s) it draws upon. This is the profile-layer application of §7.3 and §6.4:
integrated presentation is not license to blur which measured construct is doing
the work in a given sentence.

### 11.5 Supporting appendices

Individual assessment sections MUST remain available as supporting appendices,
preserving:

- construct-specific results and their construct-level interpretations (§3.2);
- instrument identity and version, where applicable (Canonical Entity Model §10.3);
- the interpretation boundaries of §5 (construct semantics firewall) restated for
  that construct;
- provenance sufficient to satisfy §14 for that construct alone;
- the uncertainty state relevant to that construct's own interpretation.

The appendices are not optional decoration. Where a reader wants to verify an
integrated theme against its source construct, the appendix is where that
verification happens. An Integrated Profile Architecture version that omits
appendices, or that makes them unreachable from the themes that cite them, does not
satisfy this section.

### 11.6 Missing, ineligible, or abstained content

Where §4.5 or §10.3 caused an integrated theme, or an entire construct's appendix, to
be abstained or narrowed, the Integrated Career Profile MUST disclose that fact rather
than silently omit the section (§10.3).

### 11.7 What this section does not authorize

This section does not authorize:

- an implementation of the Integrated Career Profile generator, RGIM, or any runtime
  service;
- a report-rendering format, UI, or presentation layer;
- who may read a given Integrated Career Profile, which is a privacy/access-control
  question explicitly deferred to a later phase and NOT pulled into Step 4 (Phase 4
  authorization §19);
- storage, retention, or consent architecture for profile instances, which remains
  governed by the runtime provenance boundary of Canonical Entity Model §22 and is
  not designed here.

## 12. Guidance and Recommendation Boundary (R4.10)

### 12.1 Purpose

This section fixes the boundary between permissible developmental/career exploration
guidance and impermissible deterministic or consequential recommendation, and states
the absolute prohibition on the interpretation/synthesis layer producing a
consequential decision.

### 12.2 Permitted guidance

The following output classes are permitted, subject to every other constraint of this
specification (§5 construct firewall, §10 uncertainty, §14 traceability):

- reflection prompts;
- exploration questions;
- occupational exploration directions (naming fields to look into, not assigning
  one);
- learning opportunities;
- project exploration suggestions;
- club exploration suggestions;
- subject exploration suggestions;
- counselor discussion prompts;
- parent discussion prompts, where age-appropriate and consistent with applicable
  consent/safeguarding boundaries (outside Step 4 scope to design, but not to be
  contradicted by it);
- questions requiring more evidence (inquiry signals, §3.2);
- development opportunities.

A guidance statement never assigns, excludes, ranks, or determines anything about the
student. It opens a direction; it does not close one.

A guidance statement carries no authority-origin set of its own (§3.3, §6.2): its
permissible source is inherited exactly from whatever interpretation or synthesis
claim(s) motivated it, never manufactured to satisfy a generic traceability
checklist. Where guidance responds to more than one motivating claim, its inherited
origin set is the union of those claims' actual origin sets, and nothing more.

### 12.3 Recommendation is bounded, not prohibited

A recommendation (§3.2) — a statement proposing a specific course of action, beyond
open-ended guidance — is permitted only where:

- it remains within the guidance-class outputs of §12.2 in substance (i.e., it
  recommends exploring, investigating, or discussing something, not that something be
  done to or for the student by an authority);
- it does not assign, exclude, rank, or determine occupational, academic, or
  disciplinary standing;
- it is traceable under §14 to the interpretation or synthesis claim(s) that
  motivated it;
- it does not overstate certainty beyond what §10 permits.

A recommendation that fails any of these conditions has crossed into deterministic
recommendation or consequential decision and MUST FAIL CLOSED (§10.4).

### 12.4 The interpretation layer must never produce a consequential decision

The interpretation and synthesis layer governed by this specification MUST NOT
autonomously determine, and MUST NOT be represented as having determined:

- admission;
- rejection;
- employment;
- dismissal;
- exclusion;
- disciplinary outcome;
- academic tracking;
- fixed occupational assignment;
- student worth;
- psychological diagnosis;
- access to opportunity;
- or any other consequential outcome.

This list is a domain-scoped worked application of the general consequentiality
question (F-11, §19.2), not the general controlled classification F-11 requires.
Where a candidate output does not clearly fall inside or outside this list, the
fail-closed default of Step 3 §13.6 applies: treat it as consequential, and require
human review before it proceeds.

### 12.5 Meaningful human review, not ceremonial review

Where consequential use is later contemplated for any output of this pipeline,
meaningful human review remains mandatory (Canonical Entity Model invariant 20; Step
1 §13; Step 3 §15). Meaningful review requires, at minimum:

- an identified, attributable human reviewer authority (Step 3 §8.3), whose
  competence covers the interpretation or synthesis dimension at issue (Step 3 §8.4,
  extended here to the interpretation/synthesis layer — this is the specific
  extension that further specifies, without closing, M-2, §19.3);
- the reviewer's genuine ability to override or withhold the output (Step 3 §8.5);
- a review method recorded, not inferred from role or outcome (Step 3 §9.1).

A review event that merely rubber-stamps machine output without the reviewer having a
genuine ability to change or withhold it is not meaningful review and does not satisfy
this section.

### 12.6 Inherited under-18 safeguarding boundary

This specification inherits, and does not redesign, the under-18 safeguarding
boundary already fixed by Step 3 §15 and Canonical Entity Model invariant 20. These
are preserved here as normative prerequisites and fail-closed boundaries on any
interpretation, synthesis, or guidance output that may reach a participant under 18 —
not as consent, privacy, authentication, or safeguarding-process implementation
mechanics, none of which this specification designs (§12.7, §20).

- **No sole automated consequential decision.** For a participant under 18, a
  consequential decision (§3.2, §12.4) MUST NOT be made solely by an automated
  system, under any circumstance. This restates, and does not relax, the absolute
  bar of §12.4 for the specific case of a minor.
- **Applicable parent or guardian permission.** Where applicable parent or guardian
  permission is required by governing policy for an interpretation, synthesis, or
  guidance output to reach the student, that permission is a precondition this
  specification does not itself establish, verify, or waive. Where it cannot be
  established as satisfied, the dependent path MUST FAIL CLOSED.
- **Student assent.** Where applicable student assent is required by governing
  policy, it is likewise a precondition this specification does not establish,
  verify, or waive. Where it cannot be established as satisfied, the dependent path
  MUST FAIL CLOSED.
- **Communicated limits of confidentiality.** Where governing policy requires that
  the limits of confidentiality be communicated to the student before an
  interpretation, synthesis, or guidance output is delivered, that communication is
  a precondition this specification does not itself deliver or verify. Where it
  cannot be established as satisfied, the dependent path MUST FAIL CLOSED.
- **No AI safeguarding substitution.** No interpretation, synthesis, or guidance
  rule governed by this specification may be used to investigate suspected abuse,
  determine whether abuse occurred, or otherwise substitute for the responsible
  human safeguarding process. Any output that would do so is not a governed claim
  under §3 and MUST FAIL CLOSED (§10.4), regardless of how it is phrased or
  classified.

This section states inherited boundaries and fail-closed preconditions only. It does
not design consent architecture, authentication, guardian/assent verification
mechanics, confidentiality-notice delivery, or the safeguarding-response process
itself — all of which remain outside Step 4 scope (§12.7, §20).

### 12.7 Privacy and access control are out of scope

Detailed privacy/access-control architecture — who may view a profile, under what
consent, retained for how long — belongs to a later phase. This specification does
not design it, does not assume it exists, and MUST NOT be read as having silently
authorized any particular access model.

## 13. Localization and Context Governance (R4.11)

### 13.1 Purpose

This section preserves, at the interpretation-and-synthesis layer, the distinction
Step 3 §4.2 and Canonical Entity Model §18.3 already fix at the localized-text and
validation layers: Georgian contextual relevance is not the same fact as translation
fidelity. Linguistically correct translation does not by itself establish construct
equivalence, contextual appropriateness, cultural validity, or scientific validity.

### 13.2 What must coexist without substitution

The following four properties of a localized interpretive or guidance statement MUST
remain independently determined and MUST NOT substitute for one another:

- **source fidelity** — the source-language governed text accurately states the
  interpretation rule's governed meaning;
- **translation fidelity** — the Georgian localized-text version is a faithful
  rendering of the governed source-language meaning (Step 2 §5.3);
- **cultural/contextual framing** — the wording is contextually valid for the
  Georgian educational, cultural and linguistic setting (Step 3's `georgian_context`
  dimension, §7.5);
- **developmental communication** — the wording is registered appropriately for the
  student's grade-band administrative context (§9.2), which is a presentation
  concern, not a developmental-relevance claim in its own right.

### 13.3 A localized explanation must not change construct meaning

Where an interpretation or synthesis rule supplies canonical governed text to output,
it MUST reference that text by exact localized-text version identity (Canonical
Entity Model §18.6, §22.2), not by localization identity or source-language version
alone (Step 2 §5.3).

A localized rendering MUST NOT alter which construct(s) a claim draws upon, which
row of the taxonomy (§6.2) it belongs to, or which prohibited-substitution row of §5.9
it is subject to. Translation is a rendering operation; it MUST NOT change the
governed meaning of what is rendered (Step 2 §2.5, "a rendering MUST NOT alter" the
underlying classification).

### 13.4 Machine translation at generation time is not authoritative

Consistent with Canonical Entity Model §18.5, machine translation performed at
generation time MUST NOT become authoritative governed text for any interpretation
or synthesis output. Where a localized-text version required for a claim has not been
through governed translation-fidelity review, the claim is not eligible for that
language, and the path MUST FAIL CLOSED for that language rather than fall back to
ungoverned machine translation.

### 13.5 Context governance does not create a new validation dimension

This section does not introduce a new Step 3 validation dimension. It applies the
existing `georgian_context` and `translation_fidelity` dimensions (Step 3 §4.1,
§7.5) to interpretation and synthesis output, and requires that the eligibility test
of §4.2(6) be satisfied before any localized claim is produced.

## 14. Traceability, Explainability and Auditability (R4.12)

### 14.1 Purpose

This section fixes what a material integrated claim must be traceable to, and what an
authorized human reviewer must be able to understand about why a material
interpretation was produced. It extends the canonical provenance chain (Step 2 §7.1),
the runtime provenance record (Canonical Entity Model §22.2), and the source-to-answer
traceability contract (Canonical Entity Model §23.1) to cover interpretation and
synthesis claims specifically.

### 14.2 The extended chain

Every material interpretation or synthesis claim MUST be capable of resolving
backward through the governed steps its taxonomy row (§6.2) and actual origin set
(§3.3, §3.4) place in its chain. The full chain, where every step is applicable, is:

```
Interpretation/synthesis claim (this specification, §3.2, §6.2)
→ interpretation or synthesis rule version (§3.5, Canonical Entity Model §15)
→ guardrail version(s) consulted and their evaluation outcomes (Canonical Entity
  Model §14, §16.3)
→ eligible assessment result(s) (§4.2) and the governed correspondence(s) they
  resolved through (Canonical Entity Model §10.7)
→ construct(s) and instrument scale(s) involved (Canonical Entity Model §10)
→ knowledge-unit version(s) relied upon (Step 2 §5.2)
→ typed evidence link(s) (Step 2 §6.1)
→ evidence anchor(s) (Step 2 §4.1)
→ source expression → source (Step 2 §3.1)
```

A step is resolved only where its corresponding origin is actually part of the
claim's origin set (§3.4). Where a step's origin is not part of that set — for
example, a pure contextual inference or contextual hypothesis (origin D only, §6.2)
carries no assessment-result or instrument-scale link, and a guidance statement
carries no knowledge-unit or evidence-anchor link of its own beyond what its
motivating claim(s) already carry — the chain records that step as NOT APPLICABLE
for that claim, and no assessment, synthesis, contextual, or human-judgment link may
be manufactured to fill it (§3.4). Every step that IS applicable remains fully
resolvable to an exact governed instance; an applicable step MUST NOT be omitted
merely because a different claim class would not have required it.

with the taxonomy row (§6.2), the §3.3 authority-boundary origin(s) actually
contributing to the claim, the §8.4 disposition (where applicable), the §10.1
uncertainty state, and the exact localized-text version rendered (§13.3), resolvable
at each applicable governed step.

This is the Canonical Entity Model §23.1 chain, extended upstream by one layer (the
interpretation/synthesis claim and its rule), row-conditioned per this section, and
annotated with the Step 4-specific classification each applicable step also carries.

### 14.3 What traceability must distinguish

Traceability MUST distinguish, at minimum, everything Canonical Entity Model §23.2
already requires, plus:

- which taxonomy row (§6.2) a claim belongs to;
- which §3.3 authority-boundary origin(s) a claim resolves to;
- which §8.4 disposition governed a synthesis claim's handling of its contributing
  inputs, where more than one input contributed;
- which uncertainty state (§10.1) applies to the claim;
- whether the claim is guidance, recommendation, or (prohibited) consequential
  decision under §12, and if guidance or recommendation, which motivating claim(s)
  it traces to and which origins those motivating claims actually carry (§6.2);
- for a contextual inference or contextual hypothesis, the exact interpretation or
  synthesis claim it qualifies, by exact instance — resolvable independently through
  that claim's own chain, and never merged into the qualifier's own origin D (§3.2,
  §6.2).

### 14.4 What an authorized reviewer must be able to understand

An authorized human reviewer inspecting a material interpretation or synthesis claim
MUST be able to determine, from the traceable record of §14.2–§14.3 alone, for each
origin actually part of the claim's origin set (§3.3, §3.4) — and to correctly
determine NOT APPLICABLE for any origin the claim's taxonomy row does not carry:

- what was measured, where origin A applies (origin A);
- what governed knowledge was applied and its evidence, where origin B applies
  (origin B);
- what synthesis inference was performed and over which inputs, where origin C
  applies (origin C);
- what contextual interpretation was layered on, and its governed basis, where
  origin D applies (origin D);
- where human judgment was required, and whether it occurred and by whom, where
  origin E applies or human review is otherwise required (origin E, §12.5);
- why any discrepancy present was preserved rather than resolved, where applicable
  (§8.4, §8.6);
- why the claim's uncertainty is expressed as it is (§10.1–§10.2) — universal, as in
  §3.4.

Correctly determining that an origin is NOT APPLICABLE for a given claim, because its
taxonomy row does not carry that origin, satisfies this section for that origin. Only
an origin the row DOES carry, and that cannot be resolved to an exact governed
instance, is a traceability failure under §10.4.

### 14.5 Explainability arises from provenance, not from fluency

Explainability MUST arise from governed provenance and synthesis logic — the chain of
§14.2, resolved to exact governed instances. It MUST NOT be manufactured after the
fact as a plausible-sounding narrative.

A fluent, well-written explanation that cannot be reduced to the §14.2 chain is not
evidence of traceability and MUST NOT be treated as satisfying this section. Fluency
is not proof.

### 14.6 Runtime provenance carries the Step 4 record

Consistent with Canonical Entity Model §22.1–§22.3, the record required by this
section is runtime decision provenance: it lives outside the canonical `rgkb`
substrate, it is student-linked operational data, and it references the canonical
substrate only through immutable governed-instance identities. This specification
does not design that store. It fixes what the store must be able to hold, extending
Canonical Entity Model §22.2's list with the Step 4-specific fields of §14.3.

## 15. Step 1, Step 2 and Step 3 Integration Contract

### 15.1 No competing authority

Every Step 4 object that is a governance subject is a governed instance under Step 1
§2.1 and carries its Step 1 registry identity as its own identity (Step 3 §14.1,
carried forward unchanged).

Step 4 introduces:

- no second identity allocator, namespace, or registry;
- no second versioning mechanism;
- no second lifecycle authority or fifth lifecycle axis;
- no second provenance authority beyond the runtime provenance boundary already fixed
  by Canonical Entity Model §22;
- no second validation truth store;
- no second evidence-linking mechanism.

### 15.2 Step 1 semantics inherited unchanged

Pattern A and Pattern B semantics, immutability boundaries, the irreversibility of
draft exit, correction and supersession semantics, historical preservation, the
independence of the four lifecycle axes, the referential invariants, and the
fail-closed rules of Step 1 §10 are inherited unchanged. Step 4 defines no additional
immutability boundary and creates no exception to either boundary.

### 15.3 Step 2 semantics inherited unchanged

Step 4 reuses, and does not replace, the CONTENT ORIGIN classification, the typed
evidence link as the only authoritative evidence pointer, the canonical provenance
chain, conflict representation, the prohibition on silent source replacement, and
machine traceability determinism. Where a Step 4 claim requires evidence, it resolves
through the Step 2 typed evidence link via the interpretation or synthesis rule's own
bindings; Step 4 introduces no distinct ad-hoc evidence mechanism (Step 2 §6.5).

### 15.4 Step 3 semantics inherited unchanged

Step 4 reuses, and does not replace:

- the validation dimensions and the independent-dimension gate contract (Step 3 §4);
- the citable validation determination and derivation rule (Step 3 §5–§6);
- the validation applicability matrix (Step 3 §7), used here as an eligibility
  precondition (§4.3);
- scientific reviewer authority and its dimension-specificity (Step 3 §8), extended
  here to interpretation/synthesis review (§12.5) without redefining it;
- cross-source comparison and adjudication (Step 3 §10), left untouched at the
  scientific-position layer and distinguished, not reused, at the synthesis layer
  (§8.1);
- the grade-scope/developmental-relevance-scope separation (Step 3 §12), applied here
  without modification (§9);
- the fail-closed rules of Step 3 §13, extended by the interpretation-specific
  fail-closed conditions of §10.4.

### 15.5 Prohibited redefinitions

Step 4 MUST NOT, and does not:

- redefine governed instance, governed object, governed version, or governed record;
- alter registry membership rules, pattern classification, or the derivation of
  pattern from subject type;
- alter either immutability boundary;
- alter correction, supersession, or historical-preservation rules;
- alter the fail-closed rules of Step 1 §10, Step 2 §14, or Step 3 §13;
- alter the referential invariants of Step 1 §11;
- reclassify any family between Pattern A and Pattern B;
- redefine CONTENT ORIGIN, evidence status, source availability, epistemic
  characterization, support characterization, validation dimensions, the
  determination substrate, the derivation rule, the applicability matrix, or
  reviewer-authority semantics;
- close, downgrade, or reinterpret F-05, F-06, F-10, or F-13, which Step 3 already
  CLOSED (§19.4);
- close M-1, F-08, F-09, or F-14, which remain OPEN/DEFERRED unchanged by this
  document (§19.2, §19.5).

Where a genuine conflict between this specification and Step 1, Step 2, or Step 3 is
discovered, it MUST be reported for adjudication and MUST NOT be silently reconciled.

## 16. Scientific and Safeguarding Invariants Preserved

This specification preserves the controlling scientific and governance invariants. It
does not weaken, replace, or authorize deviation from any of them. Each invariant is
stated together with its enforcing Step 4 section and its upstream source.

| # | Invariant | Enforced by (Step 4) | Upstream source |
|---|---|---|---|
| 1 | RIASEC interest is not ability, intelligence, competence, achievement, or verified skill | §5.2, §17.A | Canonical Entity Model §4.1(16); Step 1 §13; Step 3 §15 |
| 2 | No deterministic grade → developmental stage mapping | §9.2–§9.4, §17.J | Step 3 §12.3, §12.5 (F-10 CLOSED) |
| 3 | No master validation score, master assessment score, or universal student score | §7.2, §17.K | Canonical Entity Model §4.3, invariant 29; Step 1 §8.5; Step 3 §4.3 |
| 4 | Self-efficacy must not become an additional assessment channel, under any authorization | §5.8, §7.5 | Canonical Entity Model invariant 17; Step 1 §13; Step 3 §15 |
| 5 | Complementary assessment channels remain non-additive | §7.3–§7.4 | Canonical Entity Model invariant 18; Step 1 §13; Step 3 §15 |
| 6 | Discrepancy is an inquiry signal and must not simply be averaged away | §8.6, §17.L | Canonical Entity Model invariant 19; Step 3 §11.4, §15 |
| 7 | Consequential AI requires meaningful human review | §12.4–§12.5 | Canonical Entity Model invariant 20; Step 3 §8.5, §15 |
| 8 | Interpretation involving minors preserves safeguarding and meaningful human-override boundaries | §12.5–§12.6, §17.N | Step 3 §15 ("For participants under 18...") |
| 9 | Material contradictions remain visible | §8.5–§8.6, §11.4 | Step 3 §10.4–§10.5, §11.1; Canonical Entity Model invariant 12–13 |
| 10 | Scientific validation or interpretive legitimacy does not itself create legal/data-use rights | §1.3, §12.7 | Step 3 §4.2; Canonical Entity Model invariant 6 |
| 11 | Georgian contextual relevance is not equivalent to translation fidelity | §13.1–§13.3 | Step 3 §4.2, §15; Canonical Entity Model §18.3 |
| 12 | Student/runtime operational data do not become RGKB scientific knowledge merely because useful for interpretation | §2.2, §11.1, §14.6 | Step 3 §2.2, §15; Canonical Entity Model §22.1, invariant 9 |
| 13 | Documentation completeness is not evidence completeness | §1.3 | Step 3 §1.3, §15 |
| 14 | Phase 4 does not authorize RGIM runtime, intervention runtime, RGO production activation, agent execution, or any production implementation | §1.4, §11.7, §20 | Step 3 §18; Canonical Entity Model §26.5 |

No later realization of this specification may silently weaken these constraints.
Where a later realization and these constraints conflict, the conflict MUST be
reported and adjudicated, and MUST NOT be silently reconciled.

## 17. Adversarial / Counterexample Analysis

This section demonstrates the governance rules of §3–§14 against the required
representative failure cases. These are specification-level worked examples. No
executable test is implemented by this section.

**A. High RIASEC interest + low skill-related evidence.**
Governance issue: interest must not be converted into competence. Governed outcome:
**QUALIFY**. The RIASEC-derived construct-level interpretation may state interest
only (§5.2); the low skill-related evidence remains a separate construct-level
interpretation (§7.3); a synthesis claim MAY note the divergence between reported
interest and skill-related evidence as a discrepancy signal (§8.4 PRESERVE
DISCREPANCY) but MUST NOT infer competence from interest.

**B. Strong skill-related evidence + low interest.**
Governance issue: ability-related evidence must not be converted into preference.
Governed outcome: **QUALIFY**, symmetric to A. Skill-related evidence remains scoped
to its own construct (§5.6); it MUST NOT be presented as though the student prefers
or values the related activity.

**C. Personality tendency appears inconsistent with an interest theme.**
Governance issue: do not force artificial consistency. Governed outcome: **RETAIN
MULTIPLE HYPOTHESES** or **PRESERVE DISCREPANCY** (§8.4), depending on whether a
governed contextual basis exists to hold both plausible. The synthesis rule MUST NOT
suppress either input to manufacture a coherent narrative (§8.5).

**D. Work values conflict with an otherwise attractive occupation direction.**
Governance issue: retain the tension rather than average it away. Governed outcome:
**PRESERVE DISCREPANCY**. The tension itself becomes an inquiry signal appropriate
for counselor/parent discussion guidance (§12.2); no synthesis rule may resolve it by
weighting one side (§8.5).

**E. Several assessments appear convergent but underlying evidence is weak or
incomplete.**
Governance issue: multiple weak signals do not become one strong fact. Governed
outcome: **QUALIFY**, bounded by §8.3 — the synthesis claim's uncertainty cannot be
lower than its weakest contributor's, regardless of how many weak contributors agree.

**F. One assessment channel is missing.**
Governance issue: do not manufacture the missing construct. Governed outcome:
**REQUEST INQUIRY** or narrowed **INTERPRET** on the remaining eligible constructs
only (§4.5), with the missing construct explicitly disclosed in the Integrated Career
Profile (§11.6), never silently filled in.

**G. A result is stale, superseded, partial, or ineligible.**
Governance issue: apply governed eligibility / abstention rules. Governed outcome:
**ABSTAIN** on any claim depending on that result (§4.2, §4.4, §10.3); the ineligible
result is never substituted with a more convenient one.

**H. Two inputs contradict materially.**
Governance issue: preserve discrepancy and appropriate inquiry. Governed outcome:
**PRESERVE DISCREPANCY** (§8.4), surfaced as a discrepancy signal in both the
integrated theme and, where relevant, the relevant appendices (§11.3–§11.5), never
merged into one averaged statement (§8.5).

**I. The system attempts an unsupported occupation recommendation.**
Governance issue: reject deterministic recommendation and return to exploration
guidance. Governed outcome: the recommendation FAILS CLOSED under §12.3 (it assigns
rather than opens a direction); the path MUST fall back to a bounded guidance
statement (§12.2) or ABSTAIN, never proceed with the deterministic recommendation.

**J. Grade is incorrectly used as developmental stage.**
Governance issue: reject deterministic grade-stage mapping. Governed outcome: FAILS
CLOSED under §9.4; the candidate developmental interpretation is not produced unless
an independent developmental-relevance-scope determination (§9.3) supports it.

**K. A hidden master score is proposed.**
Governance issue: prohibit. Governed outcome: FAILS CLOSED under §7.2 and §7.6
outright; a synthesis rule proposing one is not eligible for activation.

**L. A discrepancy is averaged away.**
Governance issue: prohibit. Governed outcome: FAILS CLOSED under §8.5; the averaging
operation itself is a prohibited resolution, and any rule performing it is not
eligible for activation (§7.6, applied by extension).

**M. An inference is phrased as if directly measured.**
Governance issue: reclassify or reject the claim. Governed outcome: FAILS the
taxonomy test of §6.3 (cannot be placed in exactly one row without ambiguity) and
MUST FAIL CLOSED under §10.4, or be reclassified and re-rendered under its correct
taxonomy row (§6.4) before output.

**N. An under-18 consequential use is proposed without meaningful human review.**
Governance issue: fail closed. Governed outcome: FAILS CLOSED under §12.4–§12.6; the
interpretation/synthesis layer is categorically barred from producing the
consequential decision itself (§12.4), any path attempting to bypass the meaningful
human-review requirement of §12.5 does not proceed, and — for a participant under 18
specifically — §12.6's inherited safeguarding boundary independently fails the path
closed where sole automated determination is attempted or where applicable guardian
permission, student assent, or communicated confidentiality limits cannot be
established as satisfied.

## 18. Family-to-Pattern Assignment for Step 4

### 18.1 The register

This section is the single authoritative family-to-pattern assignment register for
the family this specification introduces. It appears exactly once in the register.

Each assigned family carries exactly one basis, using the same basis vocabulary Step
3 §16.1 established:

- **[table]** — assigned in the controlling coverage assignment;
- **[text]** — assigned by controlling architecture text outside the coverage
  assignment;
- **[derived]** — a Step 4 determination, obtained by applying the controlling
  Pattern A criterion to a family that no controlling source assigns.

**Assignment register.**

- Integrated Profile Architecture — Pattern A — [derived].

Step 4 introduces exactly one new governed family.

**Basis of the [derived] assignment.**

No controlling source assigns the Integrated Profile Architecture under a named
family, in the coverage assignment or elsewhere. It is classified here by applying
the controlling Pattern A criterion (Step 3 §16.1): one enduring conceptual object —
the template governing which sections, claim classes, and traceability fields an
Integrated Career Profile instance may contain — that may carry multiple governed
semantic revisions over time, whose correction is a revision of the same enduring
template rather than the recording of a different thing. A historical consumer must
be able to cite the exact architecture version a given profile instance was rendered
against, exactly as Step 3 §7.9 requires for the validation applicability matrix.

This is a Step 4 determination, not a quotation or restatement of controlling text.
If the Owner or a later controlled specification determines otherwise, that
determination controls and this register is superseded for it.

### 18.2 Families relied upon but not newly assigned

Step 4 relies upon, and does not re-assign, the following existing assignments.

- **Interpretation Rule / Interpretation Rule Version** — Pattern A — assigned by the
  controlling coverage assignment (Canonical Entity Model §15). The **synthesis
  rule** of §3.5 is a governed specialization of this family, identified by a
  `rule_class` attribute value, and is NOT a new family.
- **Guardrail / Guardrail Version** — Pattern A — assigned by the controlling coverage
  assignment (Canonical Entity Model §14). Every guardrail invoked by §5 is an
  ordinary instance of this family.
- **Knowledge Unit / Knowledge Unit Version, Construct, Construct Definition Version,
  Instrument / Instrument Version / Instrument Scale, Construct-Scale Mapping,
  Governance Binding** — assigned by the controlling coverage assignment (Canonical
  Entity Model §5, §10, §16). Step 4 uses these unchanged as eligibility inputs
  (§4.3) and synthesis-binding targets (§7.3).
- **Review / decision event** — Pattern B — assigned by the controlling coverage
  assignment. Step 4 uses this substrate, via Step 3 §8, for the reviewer-authority
  record required by §12.5, as a semantic use of that family rather than a new one.

A mismatch between any of these assignments and its use here is a governance/schema
fault and MUST FAIL CLOSED (Step 1 §2.1).

### 18.3 Controlled vocabularies introduced, not families

The following are controlled vocabularies this specification fixes the minimum
distinctions for, exactly as Step 2 and Step 3 fix minimum distinctions for evidence
status, epistemic characterization, and validation outcomes without creating new
governed families for them:

- the interpretation claim taxonomy rows of §6.2;
- the §3.3 authority-boundary origin labels A–E;
- the §8.4 disagreement-disposition set;
- the §10.1 uncertainty-state set;
- the `rule_class` two-way distinction of §3.5.

None of these is a governed object family. None is registered in `governed_instance`.
Each is a controlled value attached to an existing governed object (a rule version's
`rule_class`) or to a runtime provenance record (a claim's taxonomy row, origin,
disposition, or uncertainty state), consistent with how Step 3 §4.1 treats the
validation-dimension outcome vocabulary. The exact machine-encodable vocabulary
beyond the distinctions fixed here is DEFERRED to a later controlled specification.

### 18.4 Families deliberately not introduced

This specification deliberately does not introduce:

- a "discrepancy record" family — student-level discrepancy is runtime, operational
  data and is represented in runtime provenance under the vocabulary of §18.3, not as
  a new canonical family (§8.1);
- an "Integrated Career Profile instance" family — an actual rendered profile is
  student-linked runtime output and, per §11.1 and Canonical Entity Model §22.1,
  MUST NOT enter the canonical substrate in any form;
- an "interpretation claim" record family — a claim instance is either canonical
  (where it is exactly a rule version's declared output constraint, already covered
  by Canonical Entity Model §15) or runtime (where it is what a specific rule
  produced for a specific student, governed by §14.6, never canonical).

Any later controlled specification proposing to introduce one of these as a governed
family MUST do so by explicit owner adjudication and a new controlled specification
version (Step 1 §2.5), not by inference from this document.

## 19. Carried-Finding Disposition Register

This register records the disposition of carried findings as they stand after Step 4.
Recording a finding here is registration, not resolution. Only findings explicitly
marked CLOSED are closed, and only to the extent stated. No finding is closed by this
specification.

### 19.1 CLOSED prior to Step 4 — unchanged, not reopened

**F-05 — citable validation-determination identity. CLOSED by Step 3, unchanged.**
Step 4 relies on the citation contract of Step 3 §5.5 for §14's traceability
requirements without altering it.

**F-06 — validation derivation rule. CLOSED by Step 3, unchanged.**
Step 4 relies on Step 3 §6's eligibility-derivation semantics for §4.3 without
altering them.

**F-10 — developmental / grade scope. CLOSED by Step 3, unchanged.**
Step 4 §9 applies, and does not reopen or reinterpret, the grade-scope /
developmental-relevance-scope separation Step 3 §12 already closed.

**F-13 — validation applicability matrix. CLOSED by Step 3, unchanged.**
Step 4 §4.3 relies on the matrix as an eligibility precondition without altering its
cells or governance contract.

### 19.2 OPEN — F-04, F-07, F-11 (narrowed for the interpretation domain), M-1

**F-04 — dependency re-binding workflow. OPEN, unchanged.**
Step 4 introduces additional binding usage (synthesis rules bound to multiple
constructs, §3.5) but does not specify the re-binding workflow — its triggers, the
authority required, or the identification of affected dependents when a bound
construct or KU version changes. If anything, Step 4 increases the number of bindings
whose re-binding would need this workflow, but it supplies no part of it. F-04 remains
NOT closed.

**F-07 — current-version resolution and cardinality. OPEN, unchanged.**
Step 4 does not supply any additional applicability input to the Step 1 §9
resolution predicate beyond what Step 3 already supplied. F-07 remains narrowed as
Step 3 left it and is NOT further narrowed or closed by Step 4.

**F-11 — consequentiality classification. OPEN, narrowed for the interpretation/
synthesis domain only.**
Step 3 held this dependency fail-closed by treating unclassified paths as
consequential (Step 3 §13.6), without supplying a classification. Step 4 §12.4
supplies a domain-scoped worked list of unambiguously consequential outcomes
(admission, rejection, employment, dismissal, exclusion, disciplinary outcome,
academic tracking, fixed occupational assignment, student worth, diagnosis, access to
opportunity) specific to interpretation and career-guidance output, and fixes that
anything not clearly excluded by this list remains subject to the Step 3 §13.6
fail-closed default. This narrows F-11 for the domain this specification governs. It
does NOT supply the general architectural consequentiality-classification mechanism
F-11 requires across the platform, and does NOT close F-11.

**M-1 — source-hierarchy and external-identifier pattern assignment. OPEN /
FAIL-CLOSED, unchanged.**
Step 4 does not touch the source, source-expression, or source-manifestation pattern
assignment. Every eligibility test in §4.3 that ultimately depends on source identity
inherits the Step 2 §3.5 / Step 3 §17.2 fail-closed consequence unchanged: a
consequential path depending on the unresolved source-descriptor or
identity-determination families MUST FAIL CLOSED. M-1 remains OPEN and is NOT closed
by this document. §10.5 states this explicitly for the interpretation layer.

### 19.3 PARTIALLY SPECIFIED / still OPEN — F-12, M-2

**F-12 — platform-role versus reviewer-authority implementation. PARTIALLY SPECIFIED
/ still OPEN, unchanged.**
Step 4 relies on the Step 3 §8 logical authority contract (reviewer identity is
canonical and independent of platform authentication; platform role is not
scientific competence) for the human-review requirement of §12.5, without specifying
authentication, onboarding, or platform-permission mechanics. F-12 is not touched
beyond this reliance and remains NOT closed.

**M-2 — named scientific review authority for operational correspondence. PARTIALLY
SPECIFIED / still OPEN, further specified by Step 4.**
Step 3 specified the general requirement that every determination identify a
reviewer authority whose competence covers the dimension determined (Step 3 §8.3–
§8.4). Step 4 §12.5 extends that dimension-specificity requirement explicitly to the
interpretation/synthesis dimension: meaningful human review of a consequential-
adjacent interpretation or synthesis output requires a reviewer authority whose
competence covers interpretation or synthesis specifically, not merely a general
platform role. This further specifies, but does not complete, the M-2 requirement —
no operational scoring-channel correspondence review workflow is specified. M-2
remains NOT closed.

### 19.4 DEFERRED — F-08, F-09, F-14 — unchanged

Untouched by Step 4. No closure is claimed for any of them.

- **F-08 — living-web-source convention.** Untouched.
- **F-09 — rights-document physical entity.** Untouched.
- **F-14 — contributor / citation sequencing.** Untouched. The Owner Gate 0
  sequencing constraint that contributor normalization precede citation rendering is
  carried unchanged and unclosed.

### 19.5 AFFIRMED CONSTRAINT — L-1, unchanged

**L-1 — immutable binding constraint. AFFIRMED CONSTRAINT, extended without
exception.**
Step 4 extends L-1 to synthesis-rule bindings (§3.5, §7.3) and to Integrated Profile
Architecture versions (§18.1): historical bindings and historical architecture
versions are immutable and MUST NOT be repointed in place. L-1 is not an independent
open work item and MUST NOT be recorded as DEFERRED.

### 19.6 CONFIRMED STRENGTH / NO ACTION — N-1, unchanged

**N-1. CONFIRMED STRENGTH / NO ACTION, unchanged.**
Step 4 produced no contradictory evidence and does not reopen it. It is not an open
defect, requires no corrective action, and MUST NOT be represented as an unresolved
finding requiring remediation. It MUST NOT be recorded as DEFERRED.

### 19.7 Step 4 boundary deferrals

The following are DEFERRED to later controlled steps or specifications and are
outside Step 4 scope:

- the exact controlled vocabulary encoding for the taxonomy rows, disposition set,
  and uncertainty states of §18.3;
- the exact `rule_class` vocabulary beyond the two-way distinction of §3.5;
- the executable specification language for synthesis-rule `output_constraint`
  content (§7.6), which remains a separate, separately authorized deliverable
  exactly as Canonical Entity Model §14.4/§15.3 already state;
- the design of the runtime provenance store carrying the §14 record (§14.6);
- privacy and access-control architecture for Integrated Career Profile instances
  (§11.7, §12.7);
- consent, authentication, guardian/assent verification, and confidentiality-notice
  delivery mechanics for the inherited under-18 safeguarding boundary of §12.6;
- the general architectural consequentiality-classification mechanism (F-11),
  narrowed but not completed by §12.4;
- the dependency re-binding workflow (F-04), unaffected by Step 4's additional
  binding usage;
- the referential enforcement technique for governance subjects (Step 1 §11.3),
  relied upon unchanged;
- external-reviewer authentication and onboarding mechanics (Step 3 §8.6), relied
  upon unchanged.

A deferral is not a decision. No deferred item may be treated as resolved, permitted,
or authorized because it is recorded here.

## 20. Explicit Non-Authorization

This specification authorizes none of the following:

- SQL or DDL; physical database types, keys, indexes, constraint syntax, or triggers;
  PostgreSQL schema design; migrations; Supabase schema, security, or configuration
  changes; RLS policies, grants, RPC definitions, or Edge Functions;
- deployment to any environment; production changes, production access, or
  production activation;
- activation, quarantine, or release-gate implementation;
- data ingestion, automated extraction, or acquisition pipelines;
- embeddings, vector storage, or retrieval-augmented generation;
- runtime provenance implementation, or the Integrated Career Profile generator;
- scoring implementation or scoring-engine changes; assessment item changes or
  assessment scoring changes; psychometric algorithm changes;
- operational scoring-channel correspondence implementation;
- reviewer authentication, onboarding, or platform-permission implementation;
- automated consequential-decision implementation of any kind;
- student-data processing;
- RGIM, agent, interpretation, synthesis, or intervention runtime implementation;
- privacy or access-control implementation for Integrated Career Profile instances;
- consent mechanics, authentication, guardian/assent verification,
  confidentiality-notice delivery, or safeguarding-response process implementation
  for the inherited under-18 boundary of §12.6;
- repository staging, commit, push, pull-request creation, merge, branch deletion, or
  worktree deletion;
- Phase 5 architecture or implementation of any kind.

This specification makes no claim of:

- production readiness;
- scientific validation of any specific interpretation or synthesis rule;
- psychometric validation;
- rights clearance;
- contextual or translation-fidelity validation;
- safeguarding clearance;
- closure of any carried finding other than those already closed by Step 3 and
  explicitly restated as unchanged in §19.1.

Describing a behaviour in this model does not authorize implementing it. Each such
action or determination requires its own authorization at its applicable gate, and
approval in one context does not extend to another.

Later physical realization MAY realize the semantics specified here. It MUST NOT
weaken, reinterpret, or bypass the governance constraints stated here (§1.4).

## 21. Next Controlled Step

Step 4 defines the interpretation-and-synthesis governance substrate only.

Work that builds on this substrate is not authorized by it. Continuation requires, at
minimum:

- a Step 4 integration review against the controlling canonical entity model, the
  Owner Gate 0 Adjudication Record, and the accepted Step 1, Step 2 and Step 3
  specifications;
- an owner closure decision for Step 4;
- separate owner authorization for any later step, including any Phase 5 work.

Findings recorded as OPEN or PARTIALLY SPECIFIED in §19.2 and §19.3 remain open after
Step 4. Their resolution is later controlled work and is not authorized here.

In particular, RGIM runtime, intervention runtime, RGO production activation, agent
execution, the Integrated Career Profile generator, and any consequential-decision
implementation remain unauthorized and unspecified. The existence of this
specification is the precondition for later interpretation/synthesis implementation
work, not permission to begin it.

Completion of this document does not by itself close any carried finding beyond those
already closed by Step 3, does not confer an evidence level on prior or future work,
and does not convert documentation completeness into scientific, rights, validation,
safety, operational, or production-readiness evidence.
