# RGKB Controlled Schema Specification — Step 3: Scientific Knowledge Governance — v0.1

- Phase: 7.1 — Controlled Schema Specification
- Step: 3 — Scientific Knowledge Governance
- Artifact type: Logical governance specification
- Version: v0.1
- Status: DRAFT — CONTROLLED AUTHORING
- Date: 2026-08-23
- Controlling architecture: RGKB_Canonical_Entity_Model_v0.2.1
- Controlling foundation: Step 1 Governed Object / Versioning / Referential /
  Lifecycle Substrate v0.1
- Controlling foundation: Step 2 Knowledge Object / Evidence / Provenance /
  Citation Substrate v0.1
- Gate authority: Owner Gate 0 adjudication; Owner Phase 3 authorization of
  2026-08-23
- Production status: NOT AUTHORIZED FOR PRODUCTION

This document is subordinate to the approved canonical entity model, to the
owner adjudications recorded in the Owner Gate 0 Adjudication Record, and to
the accepted Step 1 and Step 2 substrates. It specifies logical governance
semantics only. It creates no SQL, DDL, migration, Supabase, runtime,
ingestion, deployment, production, or student-data authorization. Later
physical implementation may realize these semantics, but MUST NOT weaken,
reinterpret, or bypass the governance constraints stated here.

## 1. Scope and Authority

### 1.1 What this document is

This document is an implementation-ready LOGICAL governance specification.

It specifies the Step 3 scientific-knowledge governance substrate: the
distinction between human review and validation, the independent validation
dimensions, the citable validation determination, the governed derivation of
current validation state, the validation-dimension applicability matrix,
scientific reviewer authority, cross-source scientific adjudication, the
representation of scientific disagreement and uncertainty, developmental and
contextual applicability, and the fail-closed behaviour of every consequential
path that depends on any of these.

It is subordinate to RGKB_Canonical_Entity_Model_v0.2.1, which remains the
controlling architecture.

It is subordinate to the accepted Step 1 specification, which remains the
controlling governed-identity, versioning, lifecycle and subject-family
substrate, and to the accepted Step 2 specification, which remains the
controlling knowledge-object, evidence, source, derivation, provenance and
citation substrate.

Within that subordination, this document is authoritative for later Step 3
physical realization unless superseded by a later controlled specification
version.

### 1.2 What this document is not

This document is NOT:

- scientific validation evidence;
- psychometric validation evidence;
- a rights determination;
- a Georgian contextual-validity determination;
- a translation-fidelity determination;
- a safeguarding certification;
- SQL, DDL, or a PostgreSQL physical schema;
- a migration or a Supabase schema change;
- an RLS, grant, or RPC specification;
- an activation, release-gate, or runtime-eligibility implementation;
- an external-reviewer authentication or onboarding design;
- an operational scoring-correspondence implementation;
- a runtime provenance implementation;
- an RGIM, agent, interpretation, or intervention implementation;
- production authorization.

### 1.3 Specification is governance architecture, not validation evidence

The existence of this specification does NOT establish that any instrument,
construct, knowledge object, guardrail, interpretation rule, localized text,
source, or determination has become scientifically or psychometrically
validated.

This document specifies how such determinations are governed, recorded, cited,
derived, and failed closed. It makes none of them.

Documentation completeness is not evidence completeness. Absence of evidence,
validation, rights, safeguarding approval, or explicit owner authorization is
NOT permission.

### 1.4 Non-authorization boundary

This document grants no authorization for SQL or DDL implementation,
migrations, Supabase changes, staging or production deployment, data ingestion
or automated extraction, student-data handling, runtime activation, production
RGIM or agent use, or any repository-history action.

Later implementation MUST fail closed where required by this specification, and
MUST NOT weaken these boundaries.

### 1.5 Relationship to the Step 1 and Step 2 substrates

Step 1 governs identity, versioning, immutability, lifecycle, referential
semantics and subject-family classification. Step 2 governs what the governed
objects mean, what supports them, and how that support is traced. Step 3
governs whether, on which dimension, by whose authority, and on what evidence a
governed object has been determined to be scientifically acceptable — and what
happens when that cannot be established.

Step 3 introduces no second identity authority, no second versioning authority,
no second lifecycle authority, no second provenance authority, and no second
validation truth store. Every Step 3 object that is a governance subject is a
governed instance under Step 1 §2.1 and carries its Step 1 identity as its own
identity.

Where Step 3 names a semantic obligation and Step 1 or Step 2 names the
mechanism that carries it, Step 1 or Step 2 governs the mechanism. Where this
document and a controlling document appear to conflict, the conflict MUST be
reported and adjudicated, and MUST NOT be silently reconciled.

The full integration contract is stated in §14.

### 1.6 Normative language

The Step 1 §1.4 vocabulary applies unchanged, as carried by Step 2 §1.5, with
the additions required by Step 3 scope.

- **MUST / MUST NOT** — mandatory requirement.
- **SHALL / SHALL NOT** — mandatory equivalent, where used.
- **SHOULD / SHOULD NOT** — strong recommendation; deviation requires
  documented justification.
- **MAY** — permitted but not required.
- **DERIVED** — not independently writable authoritative state.
- **OPEN** — unresolved specification work; not authorized to assume.
- **DEFERRED** — intentionally postponed to a later controlled step.
- **FAIL CLOSED** — the dependent action does not proceed when required
  authoritative conditions cannot be established.
- **VALIDATION DIMENSION** — one of the independent governed questions of §4
  about a governed subject instance.
- **VALIDATION DETERMINATION** — the exact citable governed instance that
  states the governed answer for one subject instance on one dimension (§5).
- **CURRENT VALIDATION STATE** — the DERIVED, non-authoritative projection of
  which determination is operative now (§6).
- **VALIDATION DERIVATION RULE** — the named, governed, versioned rule by which
  current validation state is derived from the determination substrate (§6).
- **APPLICABILITY** — whether a dimension applies to a subject family at all
  (§7), as distinct from whether it has been satisfied.

No additional lifecycle vocabulary is defined in this document. Lifecycle
vocabulary remains governed by Step 1 §7 and Step 1 §8.

## 2. The Scientific-Governance Boundary

### 2.1 What Step 3 governs

Step 3 governs the canonical, non-student-linked determination of scientific
and governance acceptability for governed subject instances held in the RGKB.

It governs the recording, attribution, citation, supersession and fail-closed
consumption of those determinations.

### 2.2 What Step 3 does not govern

Step 3 does NOT govern:

- what any individual student's assessment result means;
- any student-linked, session-linked, or individual-linked record;
- runtime decision provenance, which remains outside the canonical substrate
  (Step 2 §7.4);
- activation, release, or runtime-eligibility logic;
- the operational scoring pipeline or its identifiers;
- authentication, account provisioning, or platform permissions.

Student-linked or student-level operational data MUST NOT enter the canonical
knowledge substrate in any form, including as a validation input, a reviewer
attribution, an adjudication qualifier, or an example.

### 2.3 The applicability precondition

Activation logic is outside Step 3 scope and is not specified here.

The validation-dimension applicability matrix (§7) is a specification-stage
precondition for any later activation logic, as required by the Owner Gate 0
sequencing constraint. The matrix MUST exist before activation logic is
specified. Its existence authorizes no activation logic and confers no runtime
eligibility.

### 2.4 Determination is not authorization

A validation determination establishes a governed scientific answer on one
dimension. It does not confer approval, rights clearance, runtime availability,
safeguarding clearance, or production readiness.

Approval and validation remain DERIVED and are never self-granted (Step 1
§8.2). Runtime availability remains DERIVED from the activation and quarantine
event chain (Step 1 §8.3). Nothing in Step 3 confers either.

## 3. Human Review and Validation Are Different Things

### 3.1 The distinction is mandatory

**Human review** is an attributable human decision or action event: a named
reviewer identity, acting in a role, made a determination at a time, about an
exact immutable governed subject instance, for a stated reason.

**Validation** is an evidence-backed governance answer for a defined dimension:
the governed answer to "does this subject instance satisfy dimension X?"

These are materially different facts. They MUST NOT be collapsed into one
representation, and neither may be inferred from the other.

A review event that occurred does not establish that any dimension is
satisfied. A dimension recorded as satisfied without an attributable review
event behind it is not a governed determination.

### 3.2 One immutable substrate

Both are carried on one immutable, append-only review and decision event
substrate. That substrate is the canonical `Review / decision event` family of
the controlling coverage assignment, and it is a Pattern B governed record
family under Step 1 §2.4.

Step 3 introduces no parallel review store, no parallel validation store, and
no independently writable current-state store. A second independently writable
representation of the same governed fact is prohibited.

### 3.3 Correction, supersession and withdrawal

An event on this substrate is immutable at first governance use (Step 1 §2.4).

Correction proceeds by recording a new event, with the relationship between the
superseded event and the correcting event itself governed (Step 1 §5.3, Step 2
§9.2).

Withdrawal and retraction are governed acts recorded as governed records. They
are not deletions. A withdrawn determination MUST remain resolvable
indefinitely, and every act that relied on it continues to resolve to it
(Step 2 §9.4, Step 2 §9.5).

Re-review supersedes rather than overwrites. The earlier determination and the
evidence it weighed remain resolvable.

### 3.4 The exact governed subject instance rule

Every review and every validation determination MUST record the exact immutable
governed subject instance it acted upon.

For a Pattern A subject that is the exact version instance. For a Pattern B
subject that is the exact governed record instance (Step 1 §11.1).

Reviewing or validating "whatever the current object is" is never sufficient
and is prohibited. A determination that names a bare stable identity, a domain
code, an ordering attribute, or an external identifier as its authoritative
subject is not a governed determination.

Where the subject is governed localized text, the determination MUST name the
exact localized-text version instance, not the localization identity and not
the source-language version (Step 2 §5.3).

## 4. Validation Dimensions and Their Independence

### 4.1 The dimensions

The controlling architecture fixes the following independent validation
dimensions. Step 3 adopts them unchanged and adds none.

- **scientific** — is the assertion scientifically supported for the scope it
  claims?
- **psychometric** — are the measurement properties claimed for an instrument,
  scale, or measurement assertion supported?
- **source_identity** — is the curated determination that a manifestation is an
  instance of an expression, and an expression a form of a work, correct
  (Step 2 §3.3)?
- **extraction_fidelity** — does the anchored or extracted content faithfully
  represent what the source expression states at the anchored location
  (Step 2 §2.2)?
- **cross_source** — how does this subject stand against competing governed
  positions bearing on the same question (§10)?
- **rights** — do the required rights or permissions exist for the intended
  act?
- **georgian_context** — is the content contextually valid for the Georgian
  educational, cultural and linguistic setting?
- **translation_fidelity** — is the localized text a faithful rendering of the
  governed source-language meaning?
- **developmental** — is the subject applicable within the stated developmental
  relevance scope (§12.2)? This dimension is determined against developmental
  relevance scope only. Grade scope is a separate administrative and structural
  applicability concept, carries no evidentiary claim of its own, and is never
  determined on this dimension (§7.1, §12.3).
- **safeguarding** — does the subject satisfy the applicable safeguarding
  constraints for use with minors?
- **technical** — is the machine-consumable form of an executable subject valid
  against its named, versioned specification language?
- **human_semantic** — does an authorized human reader judge the governed
  meaning to be what it purports to be?

The exact controlled value vocabulary of each dimension's determination outcome
is DEFERRED to a later controlled specification. What is NOT deferred is that
the dimensions are distinct, independent, and non-substitutable.

### 4.2 No dimension substitutes for another

No dimension may be derived from, substituted for, or inferred from another.

In particular, and without exception:

- scientific validation is not rights clearance, and rights clearance is not
  scientific validation;
- translation fidelity does not establish Georgian contextual validity, and
  contextual validity does not establish translation fidelity;
- extraction fidelity does not establish that the extracted assertion is
  scientifically supported;
- source identity does not establish extraction fidelity;
- psychometric support does not establish developmental applicability;
- technical validity of a machine-consumable form does not establish that its
  content is scientifically supported;
- human semantic review does not establish any evidence-backed dimension it did
  not examine;
- safeguarding clearance is established by none of the others.

A localized governed text does not inherit the validation state of its
source-language text. Each localized governed text carries its own
determinations for the dimensions that apply to it (Step 2 §5.3).

### 4.3 The independent-dimension gate contract

Where a path requires several dimensions, the gate is **conjunctive over
independent dimensions**. Every required dimension MUST independently satisfy
its requirement, evaluated on its own evidence.

The following are prohibited, without exception:

- a master validation score;
- a weighted validation score;
- averaging, summing, or otherwise numerically aggregating dimensions;
- a threshold created from dimension aggregation;
- a composite validity index;
- a universal confidence value;
- compensating a failed or unestablished dimension with a stronger result on
  another dimension.

A gate is satisfied only when each required dimension holds on its own. There
is no arithmetic by which dimensions may be combined, and no quantity that may
stand in for the set of them.

### 4.4 Unknown is not PASS

The following MUST NOT be treated as satisfaction of a dimension:

- **unknown** — the dimension applies and has not been answered;
- **unresolved** — the dimension applies, has been examined, and no governed
  answer has been reached;
- **conflicting** — the dimension applies and governed evidence disagrees;
- **deferred** — the dimension applies and has been intentionally postponed;
- **not reviewed** — no review event bears on the dimension for this subject
  instance;
- **withdrawn** — the determination that previously answered it has been
  withdrawn or retracted.

These states are materially different from one another and from satisfaction,
and MUST remain distinguishable (Step 2 §8.4). Collapsing any of them into
another, or into a pass, is prohibited.

**Not applicable is not a pass** unless the non-applicability is itself a
governed determination, valid for that subject family and that use, recorded
under §7.4. Undetermined non-applicability MUST FAIL CLOSED (§13).

Absence of a determination MUST NOT be converted into an affirmative answer of
any kind. Absence of evidence is not evidence of absence.

## 5. The Citable Validation Determination

*(This section addresses carried finding F-05.)*

### 5.1 Three distinct things

A historical consumer must be able to establish which exact determination a
past act relied upon, rather than recomputing whatever is current now. That
requires three things to be kept distinct and never conflated.

**A — The immutable review/decision evidence.** The attributable human act, and
every other event bearing on the question, held on the append-only review and
decision event substrate of §3.2. This is the evidentiary record of what was
done, by whom, when, and why.

**B — The exact citable validation determination.** The specific governed
instance on that substrate whose content is the governed answer for one subject
instance on one dimension. This is what a relying act cites.

**C — The derived current validation state.** The projection of which
determination is operative now for that subject instance and dimension,
computed from the determination chain by the governed derivation rule of §6.

A is the substrate. B is an exact governed instance drawn from it. C is a
DERIVED view over it. They are not interchangeable.

### 5.2 The determination is an exact governed instance

A validation determination is an exact governed instance on the canonical
`Review / decision event` substrate, carrying its Step 1 registry identity as
its own identity (Step 1 §2.1).

It is therefore citable by that identity, permanently resolvable, and immutable
after first governance use.

Step 3 introduces no separate validation-determination family and no second
validation truth store. Determination is a governed semantic use of the
existing review and decision event substrate, in the same manner that the
controlling architecture treats adjudication as a review and decision event on
that substrate.

Not every event on the substrate is a determination. An event that records a
review method, an observation, a conflict-of-interest declaration, a
supersession relationship, or a withdrawal is an event on the substrate without
being the governed answer for a dimension. Which events constitute
determinations is a property of the event's own governed content, not of its
position, ordering, or recency.

### 5.3 What a validation determination carries

A validation determination carries, at minimum:

- its governed instance identity, which is its Step 1 registry identity;
- the exact governed subject instance determined (§3.4);
- the single validation dimension determined;
- the determination outcome, from that dimension's controlled vocabulary;
- the scope qualification within which the determination holds (§12);
- the reviewer authority responsible for it (§8);
- the review method relied upon (§9);
- the typed evidence linkage supporting it (§5.4);
- the rationale;
- the time of the determining act;
- where it supersedes or withdraws a prior determination, the governed
  relationship to that prior determination.

A determination MUST determine exactly one dimension for exactly one subject
instance. A single record purporting to determine several dimensions at once is
prohibited, because it would make the dimensions inseparable and defeat §4.3.

### 5.4 A determination is evidence-backed

A validation determination that requires evidence MUST carry its support as
typed evidence links under Step 2 §6.1, to exact evidence anchors, with
evidence role and support characterization.

Free-text commentary MAY accompany a determination. It MUST NOT be the
authoritative evidence pointer, and its presence MUST NOT be treated as
evidence that a link exists (Step 2 §6.4).

The same typed evidence-linking concept applies here as everywhere else in the
substrate. A distinct ad-hoc evidence field for validation is prohibited
(Step 2 §6.5).

A determination whose required evidence is only free-text commentary is
unsupported for the purposes of this specification, and any consequential path
requiring its support MUST FAIL CLOSED (§13.1).

### 5.5 Citation by the relying act

Every governance act, activation decision, adjudication, traceability chain, or
consequential path that relies on a validation determination, or that resolved
for one and found none, MUST record all three of the following.

1. **The resolution outcome, as an exact reference.** Either the exact
   validation determination instance relied upon, cited by governed instance
   identity (Step 1 §11.1), or an explicit **no_determination** result recording
   that resolution yielded no eligible determination. A no_determination result
   is a recorded outcome, not an omission, and an act that simply records
   nothing has not recorded a no_determination result.
2. **The exact validation derivation rule version used** (§6.4), so that the
   resolution is reproducible.
3. **The resolution context**, as a governed `as_of` temporal reference or an
   equivalent governed temporal marker sufficient to reproduce the state of the
   determination substrate against which resolution was performed.

Recording only the subject, only the dimension, only the outcome value, or only
"the current state at the time" is not sufficient and is prohibited. An act that
records the outcome without the determination instance, the rule version, and
the resolution context cannot be reconstructed, because it cannot show which
determination produced that outcome, under which rule, over which state.

This is a canonical reference contract. It states what a relying act must be
able to name. It does not design the store that holds it (§5.7).

### 5.6 Historical reconstruction

Because determinations are immutable governed instances that remain resolvable
indefinitely (Step 1 §5.3), a relying act from any past date can be re-resolved
to exactly the determination it cited, even after that determination has been
superseded, withdrawn, or retracted.

Historical reconstruction MUST keep two questions distinct, and MUST be able to
answer each separately:

- **what was actually relied upon at the time** — the determination instance or
  no_determination result recorded by the act, under the derivation rule version
  it recorded, at the resolution context it recorded (§5.5);
- **what current state would be derived now** — the result of applying a current
  derivation rule version to the substrate as it stands today.

These are different questions with legitimately different answers. Presenting
the second as the first destroys the audit trail and is prohibited.

A no_determination or fail-closed outcome MUST be reconstructable exactly as a
positive determination is. An act that failed closed, and why it failed closed,
is part of the governed history and MUST NOT be reconstructed as though no
resolution had been attempted, nor be silently repaired by a determination
recorded later.

A superseding determination MUST NOT be represented as the determination a
prior act relied upon (Step 2 §9.2).

An audit trail that can no longer show which determination was relied upon, on
which evidence, by whose authority, is not an audit trail.

### 5.7 What this section does not do

This section specifies the canonical contract that a runtime provenance store
must be able to satisfy. It does not design that store, and it does not
authorize its implementation. Runtime decision provenance remains outside the
canonical substrate (Step 2 §7.4).

## 6. The Validation Derivation Rule

*(This section addresses carried finding F-06.)*

### 6.1 Current validation state is DERIVED

Authoritative current validation state for a subject instance on a dimension is
DERIVED from the immutable determination substrate. It MUST NOT have an
independently writable representation anywhere in the substrate (Step 1 §8.2).

A materialized current-state representation MAY exist only as a recomputable,
non-authoritative projection. It is a cache, never a source of truth, and it
MUST NOT be editable as a means of changing a validation answer.

Where current validation state cannot be established from authoritative
evidence, any act requiring it MUST FAIL CLOSED (§13.1).

### 6.2 The derivation rule is a governed object

The derivation from determinations to current state is not an implementation
detail. It is a governed rule with governed meaning, because two different
derivations over the same determinations can yield different answers about
whether a claim about minors may proceed.

A validation derivation rule is therefore a governed object with:

- a stable identity naming the enduring rule;
- immutable versions carrying the rule's governed content;
- a name, so that a relying act can state which rule it used;
- permanent resolvability of every historical version.

It is a Pattern A governed object under Step 1 §2.2, with immutable versions
under Step 1 §2.3. Its family-to-pattern assignment and the basis for it are
recorded in §16.

The validation derivation rule is distinct from the Step 2 §7.2 derivation
record. A Step 2 derivation record states that a governed output was produced
from identified governed inputs. A Step 3 validation derivation rule states how
current validation state is computed from determinations. The two MUST NOT be
conflated, and neither substitutes for the other.

### 6.3 Required properties of the derivation

A validation derivation rule version MUST be:

- **named** — identifiable as a rule, not an anonymous procedure;
- **governed** — a governed object subject to the same review, immutability and
  supersession semantics as any other governed object;
- **versioned** — each semantic revision is a new immutable version;
- **historically resolvable** — every version that was ever relied upon remains
  resolvable indefinitely;
- **deterministic** — the same governed inputs MUST yield the same result;
- **total over its declared inputs** — it MUST state its behaviour for the
  unknown, unresolved, conflicting, deferred, not-reviewed and withdrawn states
  of §4.4, and MUST NOT leave any of them undefined;
- **non-authoritative as a cache** — any materialization is a projection only.

Determinism MUST NOT depend on string matching, label similarity, naming
convention, structural proximity, ordering, recency, count, or heuristic
selection (Step 2 §12.2).

### 6.4 The derivation rule version is itself cited

Because the rule can change, the answer can change without any determination
changing. Therefore a relying act that depends on derived current state MUST
record the exact derivation rule version it used, alongside the determination
instances it relied upon (§5.5).

Where the derivation rule version used by a past act cannot be resolved, that
act's derived state is not reconstructable, and any path requiring that
reconstruction MUST FAIL CLOSED (§13.1).

### 6.5 What the derivation MUST NOT do

A validation derivation rule MUST NOT:

- aggregate independent validation dimensions into a score, an index, or any
  single value (§4.3);
- treat an independently writable status as authoritative truth;
- erase, hide, or bypass a withdrawal, retraction, or supersession;
- treat the most recent determination as authoritative by virtue of recency
  alone, where recency is not itself the governed rule content;
- treat the more numerous determinations as authoritative by virtue of count;
- convert unknown, unresolved, not-reviewed, deferred, or withdrawn into a pass
  (§4.4);
- infer a determination for one dimension from determinations on others;
- resolve a conflict between determinations by averaging or by silently
  selecting a side (§11).

Where more than one determination is eligible to be operative and the rule
cannot yield exactly one governed answer, the condition is a governance fault.
The dependent path MUST FAIL CLOSED and no heuristic tie-break is authorized
(Step 1 §9.4, Step 1 §10.2).

### 6.6 Withdrawal and supersession behaviour

Withdrawal of a determination removes it from being operative. It does not
delete it, does not alter any past act that relied upon it, and does not
retroactively change what that past act relied upon (§3.3, §5.6).

Where withdrawal leaves no operative determination for a required dimension,
the dimension is not satisfied, and any consequential path requiring it MUST
FAIL CLOSED. It MUST NOT fall back to a superseded determination, to an earlier
determination, or to a default.

### 6.7 Candidate eligibility

A validation derivation rule version MUST explicitly define which determinations
are eligible candidates for becoming operative current state, and its behaviour
for each of the following. None may be left undefined, and none may be handled
by an unstated default.

- **superseded determinations** — a determination superseded by a later governed
  determination is not an eligible candidate.
- **withdrawn or retracted determinations** — a withdrawn or retracted
  determination is not an eligible candidate.
- **expired or otherwise no-longer-valid determinations** — where a
  determination carries a governed validity bound, or a governed act or
  condition has rendered it no longer valid, it MUST NOT become operative
  current state. The controlled vocabulary of validity bounds and expiry
  conditions is DEFERRED to a later controlled specification; the prohibition is
  not deferred.
- **determinations lacking valid reviewer authority for the dimension and scope
  being resolved** — where the recorded reviewer authority is missing,
  insufficient, invalid, or not applicable to the dimension or the scope under
  resolution, the determination MUST NOT be treated as an authoritative eligible
  candidate (§8.3, §8.4).
- **competing determinations** — where several determinations remain eligible
  and the governed rule cannot resolve them to exactly one governed answer, the
  condition is a governance fault.
- **the states of §4.4** — unknown, unresolved, conflicting, deferred, not
  reviewed and withdrawn, each of which MUST be defined by the rule and none of
  which may be converted into a pass.

**Cardinality.** Zero eligible determinations is a fail-closed condition.

Where one or more eligible determinations exist, the governed rule MUST yield
exactly one governed answer, on the rule's own stated content. A single eligible
determination that the rule resolves is a resolvable outcome; so is a set of
several eligible determinations that the governed rule resolves to exactly one
governed answer.

Multiple eligible determinations MUST FAIL CLOSED where, and only where, the
governed rule cannot resolve them to exactly one governed answer. That condition
is a governance fault and MUST be raised rather than silently resolved
(Step 1 §9.4, Step 1 §10.2).

**No tie-break, no fallback.** No recency, count, ordering, or other heuristic
tie-break is authorized. There is no fallback to a superseded, expired,
withdrawn, or authority-invalid determination, and no fallback to a default
value.

Ineligibility is never destructive. An ineligible determination remains an
immutable governed instance, remains permanently resolvable, and continues to be
exactly what any past act that relied upon it relied upon (§5.6, §13.8).

Any materialized current state derived under this section remains a
recomputable, non-authoritative projection (§6.1).

This section governs eligibility semantics only. It does not design the
executable rule language, and it does not design any cache or materialization
implementation.

## 7. Validation-Dimension Applicability Matrix

*(This section addresses carried finding F-13.)*

### 7.1 What the matrix fixes

The matrix states, for every governed subject family currently fixed by a
controlling source, which validation dimensions apply to that family, which are
required where applicable, which do not apply, and which remain unresolved.

Applicability is a distinct question from satisfaction. That a dimension applies
says nothing about whether it has been determined, and that a dimension does not
apply says nothing about the subject's standing on any dimension that does.

The matrix is a family-level specification property. No instance may override
it, and no rendering, projection, or traversal may alter it.

The matrix is itself a governed, versioned and historically citable artifact.
Its governance contract is stated in §7.9, and the fail-closed behaviour for a
missing row, cell, or version is stated in §7.10.

Where the developmental dimension is stated below, it is determined against the
developmental relevance scope of §12.2. It is never determined against grade
scope, and an applicable grade scope never satisfies it (§12.4).

### 7.2 Applicability values

Each cell of the matrix carries exactly one value.

- **REQUIRED** — the dimension applies to the family, and a satisfied governed
  determination is required wherever an instance of that family sits on a
  consequential path.
- **CONDITIONAL** — the dimension applies to the family only where a stated
  condition holds for the instance. Where the condition holds, the dimension is
  required. The condition MUST be expressed as a controlled condition
  qualification drawn from a governed vocabulary carried by the matrix version;
  free text MUST NOT be the authoritative gating semantics, and a free-text note
  MUST NOT be evaluated as a condition. Whether the condition holds MUST itself
  be a governed determination; where that cannot be established, the dependent
  path MUST FAIL CLOSED (§13.4).
- **NOT APPLICABLE** — the dimension does not apply to the family. This is the
  governed non-applicability of §7.4.
- **UNRESOLVED** — applicability has not been fixed by any controlling source
  and is not fixed here. Any consequential path requiring that determination
  MUST FAIL CLOSED (§13.4). An UNRESOLVED cell MUST NOT be read as NOT
  APPLICABLE, and MUST NOT be guessed.

### 7.3 Subject universe of the matrix

The matrix covers the governed subject families fixed by the controlling
coverage assignment, by controlling architecture text, by Step 2 §9.1, and by
§16 of this specification.

It does NOT cover, and MUST NOT be extended by inference to cover:

- the source-descriptor, identity-determination and external-identifier-
  attachment families, whose pattern assignment is not fixed by any controlling
  source. They remain inadmissible to the subject-type catalog, and no
  consequential path may depend on them (Step 2 §3.5, M-1 OPEN);
- the bare source, source-expression and source-manifestation identities. These
  are enduring conceptual identities, not governed instances, and are therefore
  not validation subjects at all (Step 2 §7.6). The `source_identity` dimension
  attaches to the governance-bearing source-identity determination, never to
  the bare enduring identity;
- any family a later controlled specification may introduce.

### 7.4 Governed non-applicability

A NOT APPLICABLE value in this matrix is a governed determination made by this
controlled specification at family level. It is valid for that family and for
any use of it, and it satisfies the §4.4 requirement that non-applicability be
governed.

Non-applicability asserted anywhere other than this matrix, or asserted for an
instance in contradiction of this matrix, is not governed and MUST NOT be
treated as a pass.

Where a CONDITIONAL dimension's triggering condition is not established for an
instance, the result is not non-applicability. It is an unestablished
condition, and the dependent consequential path MUST FAIL CLOSED (§13.4).

### 7.5 Pattern A families

**Governed knowledge object version** — canonical family `Knowledge Unit`.

- scientific — REQUIRED.
- human_semantic — REQUIRED.
- developmental — REQUIRED; scope qualification is part of the version's
  governed meaning (§12).
- psychometric — CONDITIONAL, where the assertion claims a measurement
  property.
- extraction_fidelity — CONDITIONAL, where CONTENT ORIGIN is direct source
  evidence (Step 2 §2.2).
- cross_source — CONDITIONAL, where governed competing positions bear on the
  same question (§10).
- rights — CONDITIONAL, where the governed content reproduces or depends on
  rights-restricted source material.
- safeguarding — CONDITIONAL, where the subject sits on a student-facing or
  otherwise consequential path.
- source_identity — NOT APPLICABLE; it attaches to the source-identity
  determination, not to the assertion (§7.3).
- georgian_context — NOT APPLICABLE at this level; it attaches to the governed
  localized text.
- translation_fidelity — NOT APPLICABLE at this level; it attaches to the exact
  localized-text version.
- technical — NOT APPLICABLE; a knowledge assertion is not machine-executable
  content.

**Governed localized text version** — canonical family `Localized governed
text`.

- translation_fidelity — REQUIRED; it attaches to this exact version, not to
  the localization identity and not to the source-language version (Step 2
  §5.3).
- georgian_context — REQUIRED where the text is governed for the Georgian
  delivery context; CONDITIONAL on the declared context otherwise. Contextual
  validity and translation fidelity remain distinct and neither establishes the
  other.
- developmental — REQUIRED; developmental register of the wording is part of
  its applicability.
- human_semantic — REQUIRED.
- extraction_fidelity — CONDITIONAL, where the wording reproduces quoted source
  material.
- rights — CONDITIONAL, where the wording reproduces rights-restricted text.
- safeguarding — CONDITIONAL, where the text is student-facing.
- scientific — NOT APPLICABLE at this level; the scientific claim is determined
  at the knowledge object version. A localized text does not inherit that
  determination, and does not carry it either.
- psychometric, source_identity, cross_source, technical — NOT APPLICABLE.

**Guardrail version.**

- safeguarding — REQUIRED; guardrails are a primary safeguarding surface.
- technical — REQUIRED; the machine-consumable form must be valid against its
  named, versioned specification language.
- developmental — REQUIRED.
- human_semantic — REQUIRED.
- scientific — CONDITIONAL, where the guardrail encodes a scientific
  constraint.
- psychometric — CONDITIONAL, where it encodes a measurement constraint.
- cross_source — CONDITIONAL, where governed positions disagree on the
  constraint.
- georgian_context — CONDITIONAL, where it constrains Georgian output.
- source_identity, extraction_fidelity, rights, translation_fidelity — NOT
  APPLICABLE.

**Interpretation rule version.**

- scientific — REQUIRED; an interpretation rule asserts interpretive meaning.
- safeguarding — REQUIRED.
- technical — REQUIRED.
- developmental — REQUIRED.
- human_semantic — REQUIRED.
- psychometric — CONDITIONAL, where the rule depends on measurement properties.
- cross_source — CONDITIONAL.
- georgian_context — CONDITIONAL, where it governs Georgian output.
- source_identity, extraction_fidelity, rights, translation_fidelity — NOT
  APPLICABLE.

**Construct definition version.**

- scientific — REQUIRED.
- human_semantic — REQUIRED.
- psychometric — CONDITIONAL, where the definition claims measurement
  properties.
- extraction_fidelity — CONDITIONAL, where the definition is drawn from quoted
  source material.
- cross_source — CONDITIONAL.
- developmental — CONDITIONAL, where the construct is scoped developmentally.
- rights — CONDITIONAL.
- georgian_context — CONDITIONAL.
- source_identity, translation_fidelity, safeguarding, technical — NOT
  APPLICABLE.

**Instrument, instrument version, and instrument scale.**

- psychometric — REQUIRED; this family is the primary psychometric subject.
- scientific — REQUIRED.
- rights — REQUIRED; instrument material is commonly rights-restricted.
- developmental — REQUIRED; the supported population and grade range is part of
  the instrument's governed applicability.
- human_semantic — REQUIRED.
- translation_fidelity — CONDITIONAL, where a localized instrument form exists.
- georgian_context — CONDITIONAL.
- cross_source — CONDITIONAL.
- safeguarding — CONDITIONAL.
- source_identity, extraction_fidelity, technical — NOT APPLICABLE.

**Rights decision version.**

- rights — REQUIRED; this family is the rights determination subject.
- human_semantic — REQUIRED.
- source_identity — CONDITIONAL, where the decision depends on which expression
  or manifestation it covers.
- safeguarding — CONDITIONAL.
- scientific, psychometric, extraction_fidelity, cross_source,
  georgian_context, translation_fidelity, developmental, technical — NOT
  APPLICABLE.

**Validation derivation rule version** — introduced by this specification
(§6, §16).

- technical — REQUIRED; the machine-consumable derivation must be valid against
  its named, versioned specification language.
- human_semantic — REQUIRED.
- safeguarding — CONDITIONAL, where the rule governs a safeguarding-relevant
  gate.
- scientific — NOT APPLICABLE; the rule is a governance computation, not a
  scientific assertion. Its correctness is determined on the technical and
  human_semantic dimensions.
- psychometric, source_identity, extraction_fidelity, cross_source, rights,
  georgian_context, translation_fidelity, developmental — NOT APPLICABLE.

### 7.6 Pattern B families

**Evidence anchor.**

- extraction_fidelity — REQUIRED; this family is the primary subject of the
  dimension.
- source_identity — REQUIRED; the anchor binds a source expression, and whether
  that expression identity is correct is a governed question (Step 2 §3.3).
- rights — CONDITIONAL, where excerpt text is retained, since retention is
  rights-conditioned.
- human_semantic — CONDITIONAL.
- scientific — NOT APPLICABLE; an anchor states where something is, not that
  anything follows from it (Step 2 §4.1).
- psychometric, cross_source, georgian_context, translation_fidelity,
  developmental, safeguarding, technical — NOT APPLICABLE.

**Rights or document anchor.**

- extraction_fidelity — REQUIRED.
- rights — REQUIRED.
- source_identity — CONDITIONAL, where the anchored document's identity is
  itself in question.
- human_semantic — CONDITIONAL.
- all other dimensions — NOT APPLICABLE.

**Typed evidence link.**

- scientific — REQUIRED; whether the anchored evidence bears on the supported
  object in the role and to the degree claimed is a scientific judgment.
- human_semantic — REQUIRED.
- psychometric — CONDITIONAL.
- cross_source — CONDITIONAL.
- developmental — CONDITIONAL, where the link's support is scope-qualified.
- extraction_fidelity — NOT APPLICABLE; it attaches to the anchor.
- source_identity, rights, georgian_context, translation_fidelity,
  safeguarding, technical — NOT APPLICABLE.

**Knowledge object relation** — canonical family `Knowledge-unit relation`.

- scientific — REQUIRED.
- developmental — REQUIRED; the relation carries scope qualification.
- human_semantic — REQUIRED.
- psychometric — CONDITIONAL.
- cross_source — CONDITIONAL.
- all other dimensions — NOT APPLICABLE.

**Derivation record** — the Step 2 §7.2 provenance record.

- technical — CONDITIONAL, where a machine process participated in the
  derivation act.
- human_semantic — CONDITIONAL.
- scientific — NOT APPLICABLE. A derivation record establishes that a
  derivation occurred and from what; it does not assert that the derivation is
  correct. Correctness attaches to the derived output, on that output's own
  dimensions (Step 2 §7.2).
- all other dimensions — NOT APPLICABLE.

**Families whose governed realization is unresolved — no normative cells.**

The cross-source participating position family and the construct ↔ scale mapping
family have no normative matrix cells. The controlling sources record each as
admitting two realizations and defer the choice between them, so neither family
is admitted to the subject-type catalog (§16.3).

A family that is not admitted MUST NOT be admitted through the matrix. No
consequential path may depend on either family, and any such path MUST FAIL
CLOSED (Step 1 §2.5, Step 2 §9.1, and §13.4 of this specification).

The following mappings are recorded as **PROSPECTIVE and NON-AUTHORITATIVE**.
They are a record of the intended shape only. They are not matrix cells, they
carry no normative force, they MUST NOT be used for consequential resolution,
and they MUST NOT be cited as applicability. They acquire normative force only
if a later controlled specification fixes the family's realization and admits
the family, at which point they MUST be re-derived rather than assumed.

- Prospective, non-authoritative — cross-source participating position:
  scientific, cross_source, developmental and human_semantic would be REQUIRED;
  psychometric would be CONDITIONAL; all other dimensions would be NOT
  APPLICABLE.
- Prospective, non-authoritative — construct ↔ scale mapping: scientific,
  psychometric and human_semantic would be REQUIRED; cross_source and
  developmental would be CONDITIONAL; all other dimensions would be NOT
  APPLICABLE.

**Governance binding.**

- human_semantic — REQUIRED.
- scientific, psychometric, developmental — UNRESOLVED. Whether a governance
  binding carries validation determinations of its own, as distinct from the
  determinations carried by the objects it binds, depends on the dependency
  re-binding workflow, which is not specified and remains OPEN as F-04. This
  specification does not fix it and does not infer it.
- technical — CONDITIONAL, where the binding has a machine-consumable form.
- source_identity, extraction_fidelity, cross_source, rights,
  georgian_context, translation_fidelity, safeguarding — NOT APPLICABLE.

Any consequential path that requires a scientific, psychometric, or
developmental determination about a governance binding MUST FAIL CLOSED while
those cells remain UNRESOLVED (§13.4).

### 7.7 Families that are not validation subjects

**Review / decision event**, including validation determinations (§5) and
adjudications (§10).

Every dimension is NOT APPLICABLE for this family.

A determination is corrected by supersession or withdrawal on the same
substrate, never by validating it (§3.3). Making a determination a validation
subject would create an unbounded regress of determinations about
determinations, and would produce a second governed truth about the same fact,
which is prohibited.

This does not place determinations beyond scrutiny. Their evidence, authority,
method and conflict-of-interest declarations are recorded (§5.3, §8, §9), and a
determination judged wrong is superseded or withdrawn by a further attributable
governed act.

**Governance / audit event.**

Every dimension is NOT APPLICABLE for this family.

Audit and event logging is append-only, may reference heterogeneous or
non-canonical targets under the bounded exception of Step 1 §11.4, and carries
no authoritative governance state. It is therefore not a validation subject.
Its integrity obligations are not validation determinations.

### 7.8 The matrix is a precondition, not an authorization

This matrix satisfies the Owner Gate 0 sequencing constraint that the
validation applicability matrix be produced before any activation logic is
specified.

It specifies no activation logic, no release gate, no runtime eligibility, and
no threshold. It confers no approval on any subject and establishes no
determination. It states only which dimensions are in scope for which families.

The matrix remains distinct from activation logic in every version. A matrix
version MUST NOT carry activation criteria, release gates, thresholds, or
runtime-eligibility rules.

### 7.9 The matrix is itself a governed, versioned artifact

The applicability matrix is governance-bearing. Two different matrices over the
same subjects can yield different answers about whether a claim affecting minors
may proceed. The matrix is therefore a governed object, not a static appendix.

A validation applicability matrix is a governed object with:

- a stable identity naming the enduring matrix;
- immutable governed versions carrying the matrix's governed content;
- permanent historical resolvability of every version ever relied upon;
- exact version citation by any later governance act that relies upon it.

It is a Pattern A governed object under Step 1 §2.2, with immutable versions
under Step 1 §2.3. Its family-to-pattern assignment and the basis for it are
recorded in §16.

**Cell semantics.** A matrix version states, for each governed subject family
and each validation dimension, exactly one applicability value from §7.2, and
for a CONDITIONAL value the controlled condition qualification that governs it.
A cell is identified by the pair of governed subject family and validation
dimension. No cell may carry two values, and no value may be inferred from a
neighbouring cell, from the family's pattern, or from another dimension.

**Citation by the relying act.** Any governance act, determination, or
consequential path that depends on applicability MUST record the exact matrix
version it relied upon, alongside the determination instances and the derivation
rule version it recorded (§5.5, §6.4). Recording only the applicability value is
not sufficient, because the value cannot be reconstructed without the version
that produced it.

**Correction.** A matrix version is immutable once it has left draft. Correction
creates a new version under the same stable identity; it is never an in-place
edit, and a correcting version MUST NOT be represented as the version a prior
act relied upon (Step 1 §5.3, Step 2 §9.2).

The normative cells stated in §7.5 through §7.7 are the content of the initial
matrix version authored by this specification. The prospective,
non-authoritative mappings recorded in §7.6 are expressly NOT part of that
content and are not matrix cells. Where a later matrix version and this section
text differ, the governed matrix version controls for acts that cite it, and the
divergence MUST be reported rather than reconciled by silent editing.

### 7.10 Missing matrix row, cell, or version

Where a required applicability answer cannot be obtained, the dependent
consequential path MUST FAIL CLOSED. This applies at minimum where:

- no matrix version can be resolved;
- the exact matrix version a past act cited cannot be resolved;
- the matrix version contains no row for the governed subject family;
- the row contains no cell for the required validation dimension;
- the cell carries UNRESOLVED (§7.2);
- the cell carries CONDITIONAL and its controlled condition qualification is
  absent, unresolvable, or expressed only as free text (§7.2);
- the subject belongs to a family that has no normative cells (§7.6).

Absence of a row, a cell, or a version MUST NOT be read as NOT APPLICABLE, MUST
NOT be read as REQUIRED, and MUST NOT be guessed in either direction. Absence is
the unknown state of §4.4, and it is not a pass.

## 8. Scientific Reviewer Authority

### 8.1 Reviewer identity is canonical and independent

A reviewer identity is a canonical governed concept, independent of any
platform authentication identity.

An internal reviewer MAY optionally be associated with a platform user
identity. An external reviewer — an academic subject-matter expert, an external
psychometrician, a rights counsel, a safeguarding authority — MUST NOT require
a fabricated platform account. Creating platform accounts merely to satisfy a
referential constraint would pollute the authentication surface of a system
handling minors' data.

### 8.2 Platform role is not scientific competence

A platform role is an access-control fact. Scientific or professional
competence is a governance fact about a person's authority to determine a
dimension.

The two MUST NOT be equated, and neither may be inferred from the other.

Possession of an administrative or elevated platform role MUST NOT be treated
as establishing competence to determine any validation dimension. Absence of a
platform role MUST NOT be treated as absence of competence.

A determination whose only claim to authority is the determiner's platform role
is not a governed scientific determination.

### 8.3 What the reviewer-authority record must be able to carry

The governance record MUST be capable of preserving, as applicable to the
determination:

- reviewer identity;
- reviewer role;
- internal or external status;
- affiliation;
- the scientific or professional competence or authority relied upon for the
  dimension being determined;
- conflict-of-interest declaration;
- review method (§9);
- the validation dimension determined;
- the exact governed subject instance determined (§3.4);
- the determination outcome;
- the rationale;
- the time of the determining act;
- the supersession or withdrawal relationship to any prior determination.

Attribution MUST be to an identified reviewer authority. "Some process
determined it" is not acceptable attribution, and an unattributable
determination is not a governed determination.

### 8.4 Competence is dimension-specific

Authority to determine one dimension does not confer authority to determine
another.

A psychometrician's authority on the psychometric dimension does not establish
authority on rights, safeguarding, or Georgian contextual validity. Rights
counsel's authority on rights does not establish scientific authority.

Where a determination requires competence the recorded reviewer authority does
not establish for that dimension, the determination is not governed for that
dimension, and any consequential path requiring it MUST FAIL CLOSED (§13.3).

### 8.5 Machine assistance does not become authority

Machine assistance during review is not prohibited. Machine output becoming an
authoritative determination is prohibited.

An automated process MUST NOT be recorded as the reviewer authority for any
dimension. Where a machine process participated, its identity and version are
recorded as part of the method (§9.2), not as the authority.

Consequential AI-supported interpretation requires meaningful human review, and
an authorized human reviewer MUST retain the ability to override or withhold
the proposed determination.

### 8.6 What this section does not specify

This section specifies the logical authority contract only.

It does NOT specify or authorize authentication, external-reviewer onboarding,
credential verification mechanics, platform user provisioning, platform
permissions, or any operational correspondence workflow. Those remain outside
Step 3 scope and unspecified.

Consequently, the clarification of the scientific-authority contract here does
NOT close the platform-role versus reviewer-authority implementation finding,
and does NOT close the named-scientific-review-authority requirement for
operational correspondence. Both remain OPEN (§17).

## 9. Review Method, Competence and Conflict of Interest

### 9.1 Method is part of the determination's meaning

The method by which a determination was reached is governance-bearing. A
dimension determined by full independent replication and the same dimension
determined by a documentary check are not the same governed fact, even where
the outcome value is identical.

The review method MUST therefore be recorded as part of the determination
(§5.3), and MUST NOT be inferred from the outcome, the reviewer's role, or the
dimension.

The controlled method vocabulary is DEFERRED to a later controlled
specification. What is NOT deferred is that method is recorded, is not free
text standing in for a controlled value where a controlled value is required,
and is never omitted on a consequential path.

### 9.2 Machine participation is recorded as method

Where a machine process participated in reaching a determination, the identity
and version of that process MUST be recorded as part of the method.

This records what participated. It does not confer authority (§8.5), does not
establish that the determination is correct, and does not reduce the human
review obligation.

### 9.3 Conflict of interest

A conflict-of-interest declaration MUST be recordable against a determination.

Absence of a recorded declaration is not a declaration of no conflict. It is
the unknown state of §4.4, and MUST NOT be converted into an affirmative
finding that no conflict exists.

Where a consequential path requires that conflicts be governed and no
declaration can be established, that path MUST FAIL CLOSED (§13.3).

### 9.4 Independence of review

Independent review means the determination was made by an authority whose
judgement is not derived from the act being determined.

A determination MUST NOT be treated as independent merely because it was
recorded separately, at a later time, or by a different platform identity.

Whether independence is required for a given dimension and use is an activation
and release question, which is outside Step 3 scope and is not specified here.
Step 3 requires only that the facts needed to answer it are recorded and
resolvable.

## 10. Cross-Source Comparison and Adjudication

### 10.1 Scope of comparison

Cross-source comparison MUST support comparison at the level of a specific
claim, including at the level of exact governed knowledge object versions, and
at construct level where the disagreement is genuinely about a construct.

Restricting comparison to construct level alone is prohibited, because
scientific disagreement is usually about a specific claim rather than an entire
construct.

### 10.2 Participating positions are first-class

Where several governed positions bear on one question, each participating
position MUST be representable as a first-class governed object carrying, at
minimum:

- the exact governed instance holding the position;
- its stance relative to the comparison question;
- its typed evidence, as typed evidence links to exact evidence anchors
  (Step 2 §6.1);
- its population qualifiers;
- its developmental qualifiers (§12);
- its cultural and contextual qualifiers;
- its measurement-method qualifiers.

A position is immutable once it has been included in an adjudication or review.
Correction creates a new position (Step 2 §9.2, Step 2 §10.3).

The realization of this family remains deferred by the controlling coverage
assignment, with the fail-closed consequence stated in §7.6.

### 10.3 Adjudication is a governed determination

An adjudication is a governed decision event on the immutable review and
decision event substrate (§3.2), carrying its own reviewer authority, method,
evidence and rationale.

An adjudication MUST record the exact governed instances of every position it
weighed, and MUST record the scope within which its outcome holds.

Re-adjudication supersedes rather than overwrites. The earlier adjudication and
the positions it weighed remain resolvable indefinitely.

### 10.4 Adjudication does not erase

Adjudication MUST NOT replace, delete, hide, detach, or downgrade supporting
positions, conflicting positions, contextual qualifiers, or the evidence any
position relied upon.

A current adjudicated view is a projection. It MUST NOT erase the positions it
summarizes, and it MUST remain traversable to every exact position it weighed.

Historical adjudications MUST remain reconstructable against the original
positions they considered. An adjudication that can no longer show what the
competing positions actually said is not an audit trail.

### 10.5 Prohibited resolutions

The following are prohibited as means of resolving or presenting scientific
disagreement:

- averaging, summing, weighting, or otherwise numerically aggregating
  conflicting positions or their evidence;
- representing the state of a disagreement as one outcome value plus one
  confidence value;
- silently replacing one conflicting object with another;
- omitting one side from a representation, traversal, or rendering;
- recording a preference without recording it as a governed adjudication with
  its own evidence and attribution;
- inferring consensus from the absence of a recorded conflict;
- treating the more recent position as authoritative by virtue of recency;
- treating the more numerous side as authoritative by virtue of count;
- deleting, downgrading, or unlinking contradicting evidence to present a
  cleaner picture.

Absence of a recorded conflict is not evidence of agreement. It is the unknown
state of §4.4 unless a governed determination establishes otherwise.

## 11. Scientific Disagreement, Limitation and Uncertainty

### 11.1 Disagreement is governed state

Conflict between governed evidence, claims, sources, positions or
determinations is a first-class governed state. It is not an error condition,
not a data-quality defect, and not a temporary state to be cleared.

Conflict MUST remain machine-visible, traversable, and resolvable to the exact
governed instances that disagree. It MUST NOT be hidden behind an aggregate, a
summary, or a preferred answer.

### 11.2 Materially different states MUST remain distinguishable

The substrate MUST keep the following distinguishable wherever the distinction
matters:

- **support** — governed evidence bears in favour of the subject;
- **limitation** — the subject is supported, but only within stated bounds, or
  with stated weaknesses in the supporting evidence;
- **contradiction** — governed evidence or a governed position bears against
  the subject;
- **uncertainty** — the question applies and the governed evidence does not
  settle it;
- **unresolved** — the question applies, has been examined, and no governed
  answer has been reached;
- **unknown** — the question applies and has not been examined.

Limitation is not weak support, and neither is contradiction. Uncertainty is
not disagreement. Collapsing any of these into another is prohibited.

### 11.3 No arithmetic evidence-strength score

Epistemic characterization and support characterization remain controlled,
ordinal only where an ordering is scientifically defensible, non-arithmetic,
and non-additive across layers (Step 2 §5.4, Step 2 §6.3).

There MUST be no universal arithmetic evidence-strength score, no composite
validity index, and no confidence scalar standing for the state of the
evidence.

A determination's outcome MUST NOT be computed from the labels of its evidence
links, and no dependent object's applicability may be computed from the labels
of the objects it binds.

Terminology MUST NOT invite false numeric precision.

### 11.4 Uncertainty MUST NOT become certainty

Uncertainty MUST NOT be converted into an affirmative determination, a default,
a fallback, or a rounded outcome.

Where a consequential path depends on a question the governed evidence does not
settle, the path MUST FAIL CLOSED (§13.5). It MUST NOT proceed on the most
likely answer, the most recent answer, or the most numerous answer.

Discrepancy is an inquiry signal, not an averaging target. Its purpose is not
to be erased.

### 11.5 Limitations travel with the subject

Where a determination holds only within stated limitations, those limitations
are part of the determination's governed meaning and MUST remain resolvable
from it.

A consumer that resolves the determination without its limitations has not
resolved the determination. Presenting a limited determination as unlimited is
prohibited.

## 12. Developmental, Population and Contextual Applicability

*(This section addresses carried finding F-10.)*

### 12.1 Scope qualification is applicability, not assertion

Scope qualification states the grade band, developmental relevance range,
population and context within which a governed subject is applicable (§12.2).

It is an applicability qualifier attaching to the governed subject. It is NOT,
and MUST NOT be converted into, an assertion about any individual person.

### 12.2 The scope concepts and their separation

Scope qualification comprises the following governed applicability concepts.
They are independent. None may be derived from, substituted for, or collapsed
into another, and they MUST NOT be combined into a single value.

- **grade scope** — the administrative or structural schooling band or bands to
  which a governed subject is addressed. It is an organizational fact about
  schooling. It asserts no developmental stage and no scientific developmental
  meaning about anyone.
- **developmental relevance scope** — the scientifically asserted developmental
  range within which the governed subject is applicable. It is evidence-backed,
  governed, and validatable on the developmental dimension (§4.1, §7).
- **population scope** — the population for which the subject is applicable.
- **context scope** — the educational, cultural, linguistic, measurement-method
  or setting qualifiers within which the subject is applicable.

Grade scope and developmental relevance scope are materially different governed
facts. They MUST NOT share one representation. Grade scope MUST NOT substitute
for developmental relevance scope on any path, and developmental relevance scope
MUST NOT be inferred from grade or from age (§12.5).

**Relationship to the controlling substrate.** The developmental scope carried
by Step 2 §5.2 is the developmental relevance scope named here. Grade scope is
separated out by this section so that an administrative band can never be read
as a scientific developmental assertion. Population scope and context scope are
unchanged. This is a refinement of the Step 2 concept for Step 3 purposes, not a
redefinition of it (§14.4).

Every scope is an applicability set or qualifier attaching to the governed
subject. No scope is an ordinal developmental-stage value, and no scope is a
property or classification of any individual (§12.1, §12.6).

### 12.3 Neither scope is a developmental-stage claim

Grade scope is expressed as a governed set of administrative grade or age bands
over the range the platform serves. Such a band is an organizational fact about
schooling. It is NOT a developmental stage, and it MUST NOT be named, labelled,
ordered, or treated as one. A grade scope carries no evidentiary claim of its
own and is not determined on the developmental dimension.

Developmental relevance scope is a scientific applicability assertion about
governed content. It states the developmental range within which that content is
applicable, it is evidence-backed, and it is determined on the developmental
dimension (§7). It is NOT a claim that any person occupies any stage, and it
MUST NOT be converted into one.

This specification deliberately fixes no vocabulary of developmental stages. A
claim that any developmental stage exists, that it has particular properties, or
that it corresponds to a particular grade or age band, is a scientific
assertion. It MUST be carried as a governed knowledge object version with its
own evidence and its own scientific determination, and MUST NOT be smuggled in
as a band label, as a scope name, or as an ordering of scope values.

### 12.4 The controlled applicability vocabulary

For a governed subject and a stated scope — grade scope, developmental
relevance scope, population scope, or context scope — applicability carries
exactly one of the following controlled values:

- **applicable** — the subject is applicable within the stated scope, on a
  governed determination;
- **conditionally applicable** — the subject is applicable within the stated
  scope only where a stated condition holds; the condition MUST itself be
  governed, and where it cannot be established the dependent path MUST FAIL
  CLOSED;
- **outside supported scope** — the subject is not applicable within the stated
  scope, on a governed determination;
- **unresolved** — applicability within the stated scope has not been
  determined.

**unresolved** is not permission and is not a pass. Any consequential path
requiring applicability for a stated scope MUST FAIL CLOSED where the value is
unresolved (§13.4).

**outside supported scope** is a governed negative determination. It is
materially different from unresolved, and the two MUST NOT share one
representation.

These four values are the complete controlled applicability vocabulary. They are
unordered labels. They MUST NOT be treated as an ordinal scale, arithmetically
combined, averaged, interpolated, or compared as magnitudes.

An applicability value for one scope concept MUST NOT be read as the value for
another. In particular, an applicable grade scope does not establish an
applicable developmental relevance scope, and MUST NOT be used in its place.

### 12.5 Prohibited inferences

The following are prohibited, without exception:

- inferring that an individual student is in any developmental stage from their
  grade, their age, or any band membership;
- substituting grade scope for developmental relevance scope, or treating either
  as evidence of the other;
- inferring developmental relevance from grade, from age, or from band
  membership;
- any deterministic mapping from a grade or age band to a developmental stage or
  to a developmental relevance scope;
- treating a band as evidence about a person rather than about a subject's
  applicability;
- converting any scope qualifier into a deterministic assertion about an
  individual, or into a property or classification of an individual;
- inferring applicability for a scope from applicability for an adjacent scope;
- arithmetic, interpolation, averaging, or ordinal comparison over scope values
  or over band sets;
- inferring applicability from the absence of a recorded exclusion;
- widening a stated scope because a subject appears useful outside it;
- deriving developmental applicability from any other validation dimension.

### 12.6 Scope and the individual remain separated

Whether any individual should receive any particular content is an operational
and professional decision made outside the canonical substrate, subject to the
safeguarding and human-review invariants of §15.

The canonical substrate states only for which scopes a governed subject is
applicable. It holds no student-linked data and makes no determination about
any person.

## 13. Fail-Closed Scientific Resolution and Reproducibility

FAIL CLOSED means the dependent action does not proceed. It does not mean
proceed with a warning, proceed with a default, proceed on the nearest
available answer, or fall back to unconstrained generation.

Failing closed is never destructive. It MUST NOT delete, rewrite, detach,
downgrade, or hide any determination, position, evidence link, anchor, or
historical record. Every governed instance remains resolvable indefinitely
(Step 1 §5.3, Step 2 §9.5).

### 13.1 Missing or unusable determination

A consequential path MUST FAIL CLOSED where, at minimum:

- no governed determination exists for a required dimension on the exact
  governed subject instance;
- the required determination exists but is unknown, unresolved, conflicting,
  deferred, not reviewed, or withdrawn (§4.4);
- the required determination cannot be resolved to its exact governed instance
  (§5.5);
- the determination's required evidence is only free-text commentary (§5.4);
- current validation state cannot be established from authoritative evidence
  (§6.1);
- the validation derivation rule version relied upon by a past act cannot be
  resolved, so that act's derived state is not reproducible (§6.4);
- the resolution context recorded by a past act cannot be resolved, so that
  act's resolution is not reproducible (§5.5);
- eligibility filtering yields zero eligible determinations (§6.7);
- the only determinations available are superseded, withdrawn, retracted,
  expired, or otherwise no longer valid, and are therefore ineligible (§6.7);
- the available determination lacks valid reviewer authority for the dimension
  and scope being resolved, and is therefore ineligible (§6.7);
- more than one determination is eligible to be operative and the derivation
  rule cannot yield exactly one governed answer (§6.5, §6.7);
- a required applicability answer cannot be obtained from a resolvable matrix
  version (§7.10).

### 13.2 Missing exact governed subject

A consequential path MUST FAIL CLOSED where the exact governed subject instance
a determination must name cannot be resolved, or where a determination names
only a stable identity, a domain code, an ordering attribute, or an external
identifier as its authoritative subject (§3.4, Step 1 §11.1).

A determination about the enduring conceptual object is not a determination
about the exact instance a consequential path uses (Step 2 §7.6).

### 13.3 Missing or insufficient reviewer authority

A consequential path MUST FAIL CLOSED where:

- the determination carries no identified reviewer authority (§8.3);
- the recorded authority does not establish competence for the dimension
  determined (§8.4);
- an automated process is recorded as the authority (§8.5);
- the path requires that conflicts of interest be governed and no declaration
  can be established (§9.3);
- the path requires a review method and none is recorded (§9.1).

### 13.4 Unresolved applicability

A consequential path MUST FAIL CLOSED where:

- the applicability of a required dimension to the subject family is UNRESOLVED
  in the matrix (§7.2);
- a CONDITIONAL dimension's triggering condition cannot be established as a
  governed determination (§7.4);
- developmental applicability for the required scope is unresolved (§12.4);
- the subject belongs to a family whose pattern assignment is not fixed, and
  which is therefore inadmissible to the subject-type catalog (§7.3, §7.6,
  Step 1 §2.5).

An UNRESOLVED applicability cell MUST NOT be read as NOT APPLICABLE, and MUST
NOT be guessed in either direction.

### 13.5 Unresolved contradiction on a consequential path

Where a consequential path depends on a question on which governed evidence or
governed positions conflict, and no governed adjudication resolves that
conflict for the applicable scope, the path MUST FAIL CLOSED (§10, §11).

The path MUST NOT proceed by averaging, by selecting a side, by preferring
recency or count, or by omitting one side.

Conflict itself is not a fault. Proceeding consequentially on an unadjudicated
conflict is.

### 13.6 Unestablished consequentiality fails closed

The rules of this section are stated for consequential paths. The controlled
classification of which paths are consequential is not specified by any
controlling source and remains OPEN as F-11 (§17).

Until that classification is fixed by a controlled specification, a path whose
consequentiality cannot be established MUST be treated as consequential for the
purposes of this section.

This is the fail-closed direction. Treating an unclassified path as
non-consequential in order to bypass a required determination is prohibited.

### 13.7 Absence is not evidence of absence

Absence of a determination, a review, a declaration, a conflict, a limitation,
or an applicability record MUST NOT be converted into an affirmative finding.

Specifically, and without exception:

- absence of a validation determination is not validation;
- absence of a human-review record is not review;
- absence of a recorded conflict of interest is not absence of conflict;
- absence of a recorded contradiction is not agreement;
- absence of a rights determination is not permission;
- absence of a safeguarding determination is not safeguarding clearance;
- absence of a recorded limitation is not the absence of limitations;
- absence of an applicability record is not applicability.

Where an affirmative condition is required and cannot be established, the
dependent path MUST FAIL CLOSED.

### 13.8 Reproducibility obligation

A past consequential act MUST remain reproducible against exactly what it
relied upon: the determination instances it cited or the no_determination result
it recorded, the derivation rule version it used, the matrix version it relied
upon, the resolution context it recorded, the evidence those determinations
linked, the reviewer authority recorded, and the scope within which each held
(§5.5, §6.4, §7.9).

An act that failed closed MUST be reproducible on the same terms as an act that
proceeded. The fail-closed outcome and its recorded cause are governed history.

Reproduction MUST NOT be performed by recomputing current state and presenting
the result as what was relied upon (§5.6).

Any later realization that breaks the permanent resolvability of governed
instances breaks this section.

## 14. Step 1 and Step 2 Integration Contract

### 14.1 No competing authority

Every Step 3 object that is a governance subject is a governed instance under
Step 1 §2.1 and carries its Step 1 registry identity as its own identity.

Step 3 introduces:

- no second identity allocator, namespace, or registry;
- no second versioning mechanism;
- no second lifecycle authority or fifth lifecycle axis;
- no second provenance authority;
- no second validation truth store;
- no second evidence-linking mechanism.

No Step 3 attribute may serve as a governed instance identity or as a
governance-act target (Step 1 §3.5, Step 1 §11.1).

### 14.2 Step 1 semantics inherited unchanged

Pattern A and Pattern B semantics, immutability boundaries, the irreversibility
of draft exit, correction and supersession semantics, historical preservation,
the independence of the four lifecycle axes, the referential invariants, and
the fail-closed rules of Step 1 §10 are inherited unchanged.

Step 3 defines no additional immutability boundary, relaxes neither boundary,
and creates no exception to either.

Every Step 3 family carries the fixed assignment recorded in the controlled
subject-type catalog, which remains the single authority for that assignment.
A mismatch between a family's catalog assignment and its use here is a
governance/schema fault and MUST FAIL CLOSED.

Approval and validation remain DERIVED and are never self-granted (Step 1
§8.2). Runtime availability remains DERIVED from the activation and quarantine
event chain (Step 1 §8.3). Step 3 confers neither.

### 14.3 Step 2 semantics inherited unchanged

Step 3 reuses, and does not replace:

- the governed knowledge object and its versions;
- the source, expression and manifestation boundary, including the distinction
  between enduring source identity and governed source-identity determination
  (Step 2 §3, Step 2 §7.6);
- the evidence anchor;
- the typed evidence link as the only authoritative evidence pointer;
- CONTENT ORIGIN classification;
- derivation records and the canonical provenance chain;
- conflict representation;
- the prohibition on silent source replacement;
- machine traceability and its determinism requirements.

Where a Step 3 determination requires evidence, it uses the Step 2 typed
evidence link (§5.4). A distinct ad-hoc evidence mechanism for validation is
prohibited (Step 2 §6.5).

Where a Step 3 determination concerns source identity, it determines the
governance-bearing source-identity determination instance, never the bare
enduring identity (§7.3, Step 2 §7.6).

### 14.4 Prohibited redefinitions

Step 3 MUST NOT, and does not:

- redefine governed instance, governed object, governed version, or governed
  record;
- alter registry membership rules;
- alter the derivation of pattern from subject type;
- alter either immutability boundary;
- alter correction, supersession, or historical-preservation rules;
- alter the fail-closed rules of Step 1 §10 or Step 2 §14;
- alter the referential invariants of Step 1 §11;
- reclassify any family between Pattern A and Pattern B;
- redefine CONTENT ORIGIN, evidence status, source availability, epistemic
  characterization, or support characterization;
- close, downgrade, or reinterpret any carried finding.

Where a genuine conflict between this specification and Step 1 or Step 2 is
discovered, it MUST be reported for adjudication and MUST NOT be silently
reconciled.

## 15. Scientific and Safeguarding Invariants Preserved

This specification preserves the controlling scientific and governance
invariants. It does not weaken, replace, or authorize deviation from any of
them, and it introduces no governance semantics that would weaken a later-stage
safeguard.

- RIASEC represents vocational interests. It MUST NOT be represented or
  interpreted as a measure of ability, intelligence, competence, or
  achievement.
- Developmental or grade scope is an applicability qualifier. It MUST NOT be
  converted into a deterministic assertion that an individual is in a
  particular developmental stage (§12).
- There is no master score. Independent dimensions, evidence channels, gates,
  or assessments MUST NOT be summed into a single global score, and no
  validation, epistemic, or support characterization may become one (§4.3,
  §11.3).
- Self-efficacy remains a process, intervention, and outcome construct. It MUST
  NOT be converted into an additional assessment.
- Complementary channels are non-additive. Their results MUST NOT be summed or
  averaged merely because they address related questions.
- Discrepancy between channels is an inquiry signal. It MUST NOT be treated as
  an averaging target whose purpose is to erase disagreement (§11.4).
- Contradictory or discrepant evidence MUST remain visible to authorized
  interpretation and review. It MUST NOT be merged, deleted, averaged, or
  normalized away to force apparent coherence (§10, §11).
- Consequential AI-supported interpretation requires meaningful human review,
  and an authorized human reviewer MUST retain the ability to override or
  withhold the proposed interpretation or action (§8.5).
- For participants under 18, a consequential decision MUST NOT be made solely
  by an automated system. Applicable parent or guardian permission, student
  assent, and the communicated limits of confidentiality remain controlling
  safeguards.
- AI systems MUST NOT be used to investigate suspected abuse, determine whether
  abuse occurred, or substitute for the responsible safeguarding process.
- Scientific validation and rights authorization are distinct governance
  questions. Neither substitutes for the other (§4.2).
- Georgian contextual validity and translation fidelity are distinct
  determinations. Neither establishes the other (§4.2).
- Data minimization applies. Information not necessary for the authorized
  purpose MUST NOT be collected, transferred, retained, or exposed merely
  because a system is capable of processing it.
- Student-linked or student-level operational data MUST NOT enter the canonical
  knowledge substrate, and runtime decision provenance remains outside it
  (§2.2).
- Documentation completeness is NOT evidence completeness. The existence of
  this specification does not establish that any required evidence, rights,
  validation, safety, or governance condition has been satisfied (§1.3).
- Absence of evidence, rights, validation, safeguarding approval, or explicit
  owner authorization is NOT permission (§13.7).
- Lifecycle axes MUST NOT be arithmetically combined, and there is no master
  lifecycle state (Step 1 §8.5).
- RGIM, intervention logic, and RGO production use remain gated and are not
  authorized here (§18).

No later realization of this specification may silently weaken these
constraints. Where a later realization and these constraints conflict, the
conflict MUST be reported and adjudicated, and MUST NOT be silently reconciled.

## 16. Family-to-Pattern Assignment for Step 3

### 16.1 The register

This section is the single authoritative family-to-pattern assignment register
for the families this specification introduces. Each family appears exactly
once in the register.

Sections §6.2 and §7.9 state the pattern of the validation derivation rule and
of the validation applicability matrix descriptively, where that pattern is
needed to state each section's own rules. Those statements are descriptive
restatements of this register, not independent assignment authorities. Where a
restatement and this register diverge, the divergence is a governance/schema
fault to be reported; this register remains the Step 3 assignment authority.

Each assigned family carries exactly one basis:

- **[table]** — assigned in the controlling coverage assignment under the
  canonical family name mapped alongside it;
- **[text]** — assigned by controlling architecture text outside the coverage
  assignment;
- **[derived]** — a Step 3 determination, obtained by applying the controlling
  pattern criterion to a family that no controlling source assigns.

**Assignment register.**

- validation derivation rule — Pattern A — [derived];
- validation applicability matrix — Pattern A — [derived].

Step 3 introduces exactly two new governed families.

**Basis of the [derived] assignments.**

No controlling source assigns either family under a named family, in the
coverage assignment or elsewhere. Each is classified here by applying the
controlling Pattern A criterion: one enduring conceptual object that may carry
multiple governed semantic revisions over time, whose correction is a revision
of the same thing rather than the recording of a different thing.

For the validation derivation rule, the enduring object is the named rule, and a
correction revises that rule (§6.2).

For the validation applicability matrix, the enduring object is the matrix, its
meaning may undergo governed semantic revision as families and dimensions are
added or refined, and a historical consumer must be able to cite the exact
version relied upon (§7.9). Pattern A is the realization that carries stable
identity, immutable versions, and exact historical version citation together.

These are Step 3 determinations, not quotations or restatements of controlling
text. If the Owner or a later controlled specification determines otherwise for
either family, that determination controls and this register is superseded for
it.

### 16.2 Assignments relied upon but not made here

Step 3 relies upon, and does not re-assign, the following existing assignments.
Their authority is stated for each; this specification is not their authority.

- `Review / decision event` — Pattern B — assigned by the controlling coverage
  assignment. Step 3 uses this substrate for review events, validation
  determinations (§5) and adjudications (§10), as a semantic use of that family
  rather than as a new family.
- `Knowledge Unit`, `Localized governed text`, `Evidence anchor`,
  `Knowledge-unit relation`, `Guardrail`, `Interpretation Rule`, `Construct
  definition`, `Rights decision`, `Instrument / instrument version / instrument
  scale`, `Governance / audit event`, `Governance binding` — assigned by the
  controlling coverage assignment.
- rights or document anchor — Pattern B — assigned by controlling architecture
  text outside the coverage assignment.
- typed evidence link, derivation record — Pattern B — assigned by Step 2 §9.1
  as Step 2 determinations.

A mismatch between any of these assignments and its use here is a
governance/schema fault and MUST FAIL CLOSED (Step 1 §2.1).

### 16.3 Families deliberately not assigned

The source-descriptor, identity-determination and external-identifier-
attachment families are not assigned, because no controlling source fixes their
assignment. They remain inadmissible to the subject-type catalog and carry no
consequential path (Step 2 §3.5, M-1 OPEN).

The cross-source participating position and construct ↔ scale mapping families
are not assigned. The controlling sources record each as admitting two
realizations and defer the choice to a later physical-realization
determination. Selecting between them here would be invention.

Because they are not assigned, neither family is admitted to the subject-type
catalog, and neither may be admitted through the applicability matrix. Neither
carries normative matrix cells; the mappings recorded for them in §7.6 are
prospective and non-authoritative, and MUST NOT be used for consequential
resolution. Any consequential path depending on either family MUST FAIL CLOSED
(§7.6, §13.4). §7.6, this section, and §17.1 state this identically.

Each assignment in §16.1 is fixed for its family and MUST equal the assignment
recorded in the controlled subject-type catalog. Reclassification requires
explicit owner adjudication and a new controlled specification version
(Step 1 §2.5). The consequences of non-assignment are stated in §7.3, §7.6 and
§13.4.

## 17. Carried-Finding Disposition Register

This register records the disposition of carried findings as they stand after
Step 3. Recording a finding here is registration, not resolution. Only the
findings explicitly marked CLOSED are closed, and only to the extent stated.

### 17.1 CLOSED by Step 3 — F-05, F-06, F-10, F-13

**F-05 — citable validation-determination identity. CLOSED by Step 3.**

Section 5 distinguishes the immutable review/decision evidence, the exact
citable validation determination, and the derived current validation state, and
fixes that the determination is an exact governed instance on the existing
review and decision event substrate, cited by governed instance identity. No
separate validation-determination family and no second validation truth store is
introduced (§5.2).

The historical citation contract is complete at §5.5: a relying act MUST record
the exact determination instance or an explicit no_determination result, the
exact validation derivation rule version used, and the governed resolution
context. §5.6 requires historical reconstruction to answer separately what was
actually relied upon and what current state would be derived now, and requires a
no_determination or fail-closed outcome to be reconstructable exactly as a
positive determination is. §13.8 carries the same obligation for reproducibility.

This is a canonical reference contract only. The runtime provenance store and
its physical schema are not designed and not authorized (§5.7).

**F-06 — validation derivation rule. CLOSED by Step 3.**

Section 6 fixes current validation state as DERIVED and never independently
writable, establishes the validation derivation rule as a named, governed,
versioned, historically resolvable and deterministic governed object (§6.2,
§6.3), requires the relying act to record the exact rule version used (§6.4),
prohibits aggregation into a score, reliance on writable status, and erasure of
withdrawal or supersession (§6.5), and fixes withdrawal and supersession
behaviour (§6.6).

Candidate eligibility is explicitly governed at §6.7, which defines rule
behaviour for superseded, withdrawn or retracted, expired or otherwise
no-longer-valid, authority-invalid, and competing determinations, together with
the §4.4 states, and leaves none of them undefined. Zero eligible determinations
fails closed; more than one unresolved by the governed rule is a governance fault
that fails closed; no recency, count, ordering, or heuristic tie-break is
authorized; and there is no fallback to a superseded, expired, withdrawn, or
authority-invalid determination. The corresponding fail-closed branches are
carried at §13.1. Any materialization remains a recomputable, non-authoritative
projection. The executable rule language and any cache implementation are not
designed.

**F-10 — developmental / grade scope. CLOSED by Step 3.**

Section 12 separates the governed applicability concepts (§12.2): grade scope as
an administrative or structural schooling band asserting no developmental
meaning; developmental relevance scope as the evidence-backed, governed,
developmentally-determined range within which content is applicable; and
population and context scope as the remaining qualifiers. Grade scope MUST NOT
substitute for developmental relevance scope, and developmental relevance MUST
NOT be inferred from grade or age.

§12.3 fixes that neither concept is a developmental-stage claim, that no
developmental-stage vocabulary is introduced, and that any developmental-stage
claim is a separate scientific assertion requiring its own governed knowledge
object version, evidence, and scientific determination. §12.4 retains the
controlled applicability vocabulary — applicable, conditionally applicable,
outside supported scope, unresolved — fixes the values as unordered labels that
may not be ordinally compared, arithmetically combined, or interpolated, and
fixes that a value for one scope concept is never the value for another. §12.5
prohibits deterministic grade-to-stage mapping, adjacent-band inference,
absence inference, scope widening, and treating any scope as a property of an
individual. §7.1 fixes that the developmental dimension is determined against
developmental relevance scope and never against grade scope. Unresolved
applicability fails closed (§12.4, §13.4).

The relationship to Step 2 §5.2 is stated explicitly as a refinement rather than
a redefinition (§12.2, §14.4). No deterministic student-stage inference is
created.

**F-13 — validation applicability matrix. CLOSED by Step 3.**

Section 7 states, for every governed subject family fixed by a controlling
source, which dimensions are REQUIRED, CONDITIONAL, NOT APPLICABLE or UNRESOLVED
(§7.5, §7.6, §7.7), with CONDITIONAL requiring a controlled condition
qualification rather than authoritative free text (§7.2).

The matrix is itself a governed artifact (§7.9): stable identity, immutable
governed versions, permanent historical resolvability, explicit cell semantics
by governed subject family × validation dimension, and mandatory exact version
citation by any later act that relies upon it. Correction creates a new version
and is never an in-place edit. Its family-to-pattern assignment is recorded at
§16.1 as Pattern A on the controlling Pattern A criterion.

§7.10 fixes that a missing matrix version, row, or cell, an UNRESOLVED cell, or
an ungoverned CONDITIONAL condition fails closed, and that absence is never read
as NOT APPLICABLE and never guessed.

Families whose governed realization is unresolved carry no normative cells and
are not admitted through the matrix; the cross-source participating position and
construct ↔ scale mapping mappings are recorded as prospective and
non-authoritative, unusable for consequential resolution (§7.6). §7.6, §16.3 and
this entry state this identically. Families whose pattern assignment is not fixed
at all remain excluded rather than guessed (§7.3, §13.4), and the UNRESOLVED
cells of the governance binding family are recorded as unresolved rather than
invented (§7.6).

The matrix is produced before any activation logic is specified, satisfying the
Owner Gate 0 sequencing constraint, and remains distinct from activation logic
in every version (§7.8, §2.3).

### 17.2 OPEN — F-04, F-07, F-11, M-1

**F-04 — dependency re-binding workflow. OPEN.**

Step 3 inherits the binding freeze rule without relaxation (§14.2) and records
the consequence that the scientific, psychometric and developmental
applicability of the governance binding family is UNRESOLVED precisely because
the re-binding workflow is unspecified (§7.6). The workflow realization — the
triggers requiring re-binding, the authority required, identification of
affected dependents, and fail-closed maintenance of unresolved consequential
paths — remains unspecified. Step 3 does not specify it. F-04 is NOT closed.

**F-07 — current-version resolution and cardinality. OPEN.**

Step 3 supplies two of the four applicability inputs the Step 1 resolution
predicate is pending on: developmental scope (§12, F-10) and validation
applicability (§7, F-13). The remaining two — rights-permitted-act semantics
and the resolution-scope vocabulary — are not supplied by Step 3 and remain
unspecified. Step 3 adds a determinism requirement of its own for validation
derivation (§6.3). Zero eligible determinations fail closed, and multiple
eligible determinations fail closed where, and only where, the governed
derivation rule cannot resolve them to exactly one governed answer; no heuristic
tie-break is authorized in either case (§6.5, §6.7). The predicate remains
non-evaluable for a consequential path. F-07 is narrowed but NOT closed.

**F-11 — consequentiality classification. OPEN.**

Step 3 states its fail-closed rules for consequential paths and depends
materially on that classification, which no controlling source fixes. §13.6
holds the dependency fail-closed by requiring that a path whose consequentiality
cannot be established be treated as consequential. That is a safe interim
constraint, not a classification. Step 3 specifies no consequentiality
vocabulary and no classification criteria. F-11 is NOT closed.

**M-1 — source-hierarchy and external-identifier pattern assignment. OPEN.**

Unchanged from Step 2. The bare source, source-expression and
source-manifestation identities remain enduring identities that are not
governed instances and are therefore not validation subjects (§7.3). The
governance-bearing source-descriptor, identity-determination and
external-identifier-attachment families remain unassigned, inadmissible to the
subject-type catalog, and fail-closed on any consequential path (§16.3). Step 3
neither fixes their pattern assignment nor closes M-1. Owner adjudication
remains required.

### 17.3 PARTIALLY SPECIFIED / still OPEN — F-12, M-2

**F-12 — platform-role versus reviewer-authority implementation. PARTIALLY
SPECIFIED / still OPEN.**

Step 3 specifies the logical authority contract: reviewer identity is canonical
and independent of platform authentication, platform role is not scientific
competence and neither may be inferred from the other, competence is
dimension-specific, and external reviewers require no fabricated platform
account (§8.1, §8.2, §8.4). It specifies no authentication, onboarding,
credential-verification, user-provisioning, or platform-permission mechanics
(§8.6). The implementation question F-12 names is untouched. F-12 is NOT
closed.

**M-2 — named scientific review authority for operational correspondence.
PARTIALLY SPECIFIED / still OPEN.**

Step 3 specifies the general requirement that every determination identify a
reviewer authority whose competence covers the dimension determined (§8.3,
§8.4), which is the scientific-authority contract M-2 depends upon. It
specifies no operational scoring-channel correspondence, no correspondence
review workflow, and no operational-domain realization, all of which remain
outside Step 3 scope and unauthorized (§18). Clarifying the authority contract
does not establish that M-2 implementation is complete. M-2 is NOT closed.

### 17.4 DEFERRED — F-08, F-09, F-14

The following findings remain DEFERRED. No closure is claimed for any of them.

- **F-08 — living-web-source convention.** Untouched by Step 3. Step 3 states
  no convention for continuously revised web sources.
- **F-09 — rights-document physical entity.** Materially touched by §7.6, which
  fixes the applicability of the rights and extraction_fidelity dimensions to
  the rights or document anchor family. Step 3 specifies no physical
  rights-document entity.
- **F-14 — contributor / citation sequencing.** Untouched by Step 3. The Owner
  Gate 0 sequencing constraint that contributor normalization precede citation
  rendering is carried unchanged and unclosed.

### 17.5 AFFIRMED CONSTRAINT — L-1

**L-1 — immutable binding constraint. AFFIRMED CONSTRAINT.**

Historical bindings and historical references are immutable and MUST NOT be
repointed in place. Step 3 restates and extends the constraint to its own
determinations through §3.3, §5.6, §6.6 and §13.8, and adds no exception to it.

L-1 is not an independent open work item, and MUST NOT be recorded as DEFERRED.

### 17.6 CONFIRMED STRENGTH / NO ACTION — N-1

**N-1. CONFIRMED STRENGTH / NO ACTION.**

N-1 is recorded as a confirmed strength. Step 3 produced no contradictory
evidence and does not reopen it. It is not an open defect, requires no
corrective action, and MUST NOT be represented as an unresolved finding
requiring remediation. It MUST NOT be recorded as DEFERRED.

### 17.7 Step 3 boundary deferrals

The following are DEFERRED to later controlled steps or specifications and are
outside the Step 3 scope:

- the controlled outcome vocabulary of each validation dimension (§4.1);
- the controlled review-method vocabulary (§9.1);
- the controlled reviewer-role, competence and affiliation vocabularies (§8.3);
- the exact activation and quarantine event shape, and all activation, release
  and runtime-eligibility logic (§2.3, §7.8);
- the referential enforcement technique for governance subjects
  (Step 1 §11.3);
- external-reviewer authentication and onboarding mechanics (§8.6);
- the physical realization of the cross-source participating position and
  construct ↔ scale mapping families (§16.3);
- the exact cross-source adjudication projection model (§10.4);
- whether independence of review is required for a given dimension and use
  (§9.4);
- the design of any runtime provenance store (§5.7).

A deferral is not a decision. No deferred item may be treated as resolved,
permitted, or authorized because it is recorded here.

## 18. Explicit Non-Authorization

This specification authorizes none of the following:

- SQL or DDL;
- physical database types, keys, indexes, constraint syntax, or triggers;
- PostgreSQL schema design;
- migrations;
- Supabase schema, security, or configuration changes;
- RLS policies, grants, RPC definitions, or Edge Functions;
- deployment to any environment;
- production changes, production access, or production activation;
- activation, quarantine, or release-gate implementation;
- data ingestion, automated extraction, or acquisition pipelines;
- embeddings, vector storage, or retrieval-augmented generation;
- runtime provenance implementation;
- scoring implementation or scoring-engine changes;
- assessment item changes or assessment scoring changes;
- psychometric algorithm changes;
- operational scoring-channel correspondence implementation;
- reviewer authentication, onboarding, or platform-permission implementation;
- automated consequential-decision implementation;
- student-data processing;
- RGIM, agent, interpretation, synthesis, or intervention implementation;
- repository staging, commit, push, pull-request creation, merge, branch
  deletion, or worktree deletion.

This specification makes no claim of:

- production readiness;
- scientific validation;
- psychometric validation;
- rights clearance;
- contextual validation;
- translation fidelity determination;
- safeguarding clearance;
- closure of any carried finding other than those explicitly closed in §17.1.

Describing a behaviour in this model does not authorize implementing it. Each
such action or determination requires its own authorization at its applicable
gate, and approval in one context does not extend to another.

Later physical realization MAY realize the semantics specified here. It MUST
NOT weaken, reinterpret, or bypass the governance constraints stated here
(§1.4).

## 19. Next Controlled Step

Step 3 defines the scientific-knowledge governance substrate only.

Work that builds on this substrate is not authorized by it. Continuation
requires, at minimum:

- a Step 3 integration review against the controlling canonical entity model,
  the Owner Gate 0 Adjudication Record, and the accepted Step 1 and Step 2
  specifications;
- an owner closure decision for Step 3;
- separate owner authorization for any later step.

Findings recorded as OPEN or PARTIALLY SPECIFIED in §17.2 and §17.3 remain open
after Step 3. Their resolution is later controlled work and is not authorized
here.

In particular, activation logic remains unauthorized and unspecified. The
existence of the applicability matrix is the precondition for later activation
work, not permission to begin it.

Completion of this document does not by itself close any carried finding beyond
those explicitly closed in §17.1, does not confer an evidence level on prior or
future work, and does not convert documentation completeness into scientific,
rights, validation, safety, operational, or production-readiness evidence.
