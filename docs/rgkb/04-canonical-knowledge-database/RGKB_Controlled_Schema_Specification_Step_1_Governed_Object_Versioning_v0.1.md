# RGKB Controlled Schema Specification — Step 1: Governed Object / Versioning / Referential / Lifecycle Substrate — v0.1

- Phase: 7.1 — Controlled Schema Specification
- Step: 1 — Governed Object / Versioning / Referential / Lifecycle Substrate
- Artifact type: Logical schema specification
- Version: v0.1
- Status: DRAFT — CONTROLLED AUTHORING
- Date: 2026-08-18
- Controlling architecture: RGKB_Canonical_Entity_Model_v0.2.1
- Gate authority: Owner Gate 0 adjudication + Final Step 1 Decision Register
- Production status: NOT AUTHORIZED FOR PRODUCTION

This document is subordinate to the approved canonical entity model and to the
owner adjudications recorded in the Owner Gate 0 Adjudication Record and the
Final Step 1 Decision Register. It specifies logical schema semantics only. It
creates no SQL, DDL, migration, Supabase, runtime, ingestion, deployment,
production, or student-data authorization. Later physical implementation may
realize these semantics, but MUST NOT weaken, reinterpret, or bypass the
governance constraints stated here.

## 1. Scope and Authority

### 1.1 What this document is

This document is an implementation-ready LOGICAL schema specification.

It specifies the Step 1 governed-object / versioning / referential / lifecycle
substrate for the RGKB canonical knowledge layer.

It is subordinate to RGKB_Canonical_Entity_Model_v0.2.1, which remains the
controlling architecture.

It is subordinate to the Owner Gate 0 adjudication and to the Final Step 1
Decision Register, which together define the bounded authorization under which
it is written.

Within that subordination, this document is authoritative for later Step 1
physical realization unless superseded by a later controlled specification
version.

### 1.2 What this document is not

This document is NOT:

- SQL;
- DDL;
- a PostgreSQL physical schema;
- a migration;
- a Supabase schema change;
- an RLS, grant, or RPC specification;
- runtime provenance implementation;
- operational scoring-channel correspondence implementation;
- data ingestion design;
- retrieval, RAG, RGIM, or agent production design;
- production authorization.

### 1.3 Non-authorization boundary

This document grants no authorization for:

- SQL or DDL implementation;
- migrations;
- Supabase changes;
- staging or production deployment;
- data ingestion;
- student-data handling;
- runtime activation;
- production RGIM or agent use.

Absence of evidence, validation, rights, safeguarding approval, or explicit
owner authorization is NOT permission.

Later implementation MUST fail closed where required by this specification, and
MUST NOT weaken these boundaries.

### 1.4 Normative language

The following terms carry defined meaning throughout this document.

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

No additional lifecycle vocabulary is defined in this section.

## 2. Core Logical Entities

### 2.1 governed_instance — the registry

`governed_instance` is the canonical exact-instance identity registry for the
Step 1 substrate. It is the single referential target for authoritative
governance acts.

**Membership.**

`governed_instance` MUST contain:

- every Pattern A version instance, from the moment that concrete version is
  created, whether draft or non-draft / content-asserted;
- every Pattern B governed record, from the moment that concrete record is
  created, whether or not it has crossed first governance use.

`governed_instance` MUST NOT contain Pattern A stable identities. A stable
identity is an enduring conceptual identity and is not a governed instance
(§2.2).

**Identity allocation.**

`instance_id` MUST be allocated when the concrete governed instance is created.
The registry entry and the concrete governed instance MUST come into existence
together. Delayed allocation at draft exit, or at any later boundary, is not
authorized.

**Registry membership is not immutability.**

Registry membership is NOT an immutability test. For Pattern A, draft remains
the mutable semantic class and exit from draft remains irreversible; for
Pattern B, first governance use remains the immutability boundary. Membership
does not alter either rule.

**Registry membership is not governance eligibility.**

Possession of an `instance_id` MUST NOT be interpreted as evidence that the
subject is immutable, approved, validated, runtime-available, retired or
non-retired, production-ready, or eligible for a consequential or authoritative
governance act.

Any governance act requiring an immutable or otherwise eligible subject MUST
evaluate those requirements separately, and MUST FAIL CLOSED where they cannot
be established.

**Registry membership is not lifecycle state.**

`governed_instance` MUST NOT carry lifecycle, approval, validation, runtime,
retirement, readiness, or any other governance state. No master status field
may be stored in the registry.

**Logical attributes.**

- `instance_id` — the exact governed instance identity;
- `subject_type` — the concrete governed family, drawn from the controlled
  subject-type catalog (§2.5);
- `pattern` — a DERIVED classification reflecting the subject family's fixed
  Pattern A / Pattern B assignment in the subject-type catalog; not
  independently writable.

**Pattern classification authority.**

`pattern` MUST equal the fixed assignment of `subject_type` in the controlled
subject-type catalog. A mismatch is a governance/schema fault and MUST FAIL
CLOSED. `pattern` is not a second authoritative source of classification.

`pattern` MUST NOT be independently set, overridden, downgraded, reclassified,
or used to contradict the catalog. Reclassification of a subject family between
Pattern A and Pattern B requires explicit owner adjudication and a new
controlled specification version.

**Identifier semantics.**

`instance_id` MUST be opaque. It MUST carry no scientific, semantic, or
governance meaning in the identifier itself. No scientific meaning may be
inferred from identifier ordering or value.

`instance_id` is the single referential currency for exact governed instances
throughout this specification.

**Family resolution.**

Each `governed_instance` MUST correspond to exactly one concrete governed
instance in exactly one governed family.

No two concrete governed instances may share the same `instance_id`, whether
within the same family or across different families.

Where a referencing entity is valid only for certain families, the reference
MUST be structurally typed using the governed instance identity together with
its subject family, so that admissible families are constrained structurally
rather than by convention.

No authoritative `subject_type` plus arbitrary `subject_id` polymorphism is
introduced by this section.

### 2.2 governed_object — Pattern A stable identity

`governed_object` is the stable conceptual identity of a Pattern A governed
object. It represents the enduring conceptual object across its versions.

**It is not a governance-act target.**

`governed_object` MUST NOT be an authoritative governance-act target, and MUST
NOT be registered in `governed_instance`.

**It carries no governed meaning.**

`governed_object` MUST NOT carry governance-bearing semantic payload. Governed
meaning belongs to the version instances, not to the enduring identity.

**Logical attributes.**

- `object_id` — the stable conceptual identity;
- `object_type` — the Pattern A governed family;
- `domain_code` — the human-readable domain code.

`object_id` MUST be stable and MUST NOT be reused.

`object_type` identifies the Pattern A governed family to which the object
belongs.

`domain_code` MUST be human-readable and semantics-free. It MUST be immutable,
MUST NOT be reused, and MUST NOT be repointed to another conceptual object.

**Stable identity is not instance identity.**

Stable identity MUST NOT be conflated with governed instance identity. They are
distinct identifier families and are not interchangeable.

**Permitted stable-identity references.**

A stable-identity reference is permitted only where the intended semantic target
is explicitly the enduring conceptual object.

Where a consequential process requires an exact version, resolution from stable
identity to an exact governed instance MUST itself be governed and auditable,
and MUST FAIL CLOSED where the exact instance cannot be resolved.

**External identifiers.**

External identifiers that legitimately attach to an enduring construct,
instrument, or similar stable object are DEFERRED to a later controlled mapping.
Such a mapping MUST NOT make the stable identity a `governed_instance`.

### 2.3 governed_object_version — Pattern A immutable version

`governed_object_version` is a concrete governed semantic revision of a
Pattern A governed object. It carries the governance-bearing meaning of that
object.

**Membership and identity.**

Every `governed_object_version` MUST be a `governed_instance` from the moment
the concrete version is created, whether draft or non-draft / content-asserted
(§2.1).

A `governed_object_version` MUST belong to exactly one stable conceptual
identity (§2.2).

**It carries the governed meaning.**

Governance-bearing semantic payload belongs to the version, not to the stable
identity. A governance act requiring an exact subject MUST record the exact
version identity, and MUST NOT record the stable identity alone.

**Logical attributes.**

- `instance_id` — the governed instance identity of this exact version;
- `object_id` — the stable conceptual identity that this version revises;
- `version_sequence` — ordering only, within the owning stable identity;
- editorial semantic class — draft or non-draft / content-asserted (§7).

**version_sequence is ordering only.**

`version_sequence` MUST be monotonic within its owning stable identity. Gaps
are permitted. Gap-free numbering carries no governance meaning, and no
scientific, approval, validation, runtime, or precedence meaning may be
inferred from the sequence value.

`version_sequence` MUST NOT be a governance-act target, and MUST NOT substitute
for the governed instance identity.

**Historical resolvability.**

Historical versions MUST remain resolvable indefinitely. A version MUST NOT be
deleted, silently rewritten, or repointed to another stable identity.

**Immutability boundary.**

The Pattern A immutability boundary is exit from draft. That boundary, and the
correction and replacement rules following from it, are specified in §5.

### 2.4 Pattern B governed-record contract

A Pattern B governed record is an atomic historical assertion, evidence
location, relation, position, or event. Its correction is not a revision of the
same thing but the recording of a different thing.

**Membership and identity.**

Every Pattern B governed record MUST be a `governed_instance` from the moment
the concrete record is created, whether or not it has crossed first governance
use (§2.1).

No artificial stable-identity / version pair may be imposed on a Pattern B
record merely so that a version can be cited. The exact record identity is the
governed instance identity.

**First governance use is the immutability boundary.**

A Pattern B record MAY be authored and corrected while it has not yet crossed
first governance use. It has crossed that boundary once it is any of:

- referenced by a non-draft governed version;
- referenced by another non-draft governed instance;
- used by validation or review;
- included in an authoritative provenance chain;
- relied upon by an activation, adjudication, or runtime-eligibility decision.

After that point its semantic content is immutable.

**Boundary-crossed state is DERIVED.**

Boundary-crossed state MUST be DERIVED from authoritative governance-use
evidence. It MUST NOT be represented as an independently writable boolean, and
MUST NOT be set, cleared, or overridden independently of that evidence.

Where boundary-crossed state cannot be established from authoritative evidence,
any act requiring an immutable subject MUST FAIL CLOSED.

**Correction by new record.**

Correction MUST proceed by creating a new record. The governance relationship
between the superseded record and the correcting record is itself governed.

The superseded record MUST remain resolvable, and MUST NOT be silently
rewritten or deleted.

### 2.5 Subject-type catalog

The subject-type catalog is a controlled system vocabulary. It enumerates the
governed subject families of the Step 1 substrate and fixes, for each family,
its Pattern A or Pattern B assignment.

**Purpose.**

The catalog exists to enforce family and pattern assignment. It is the single
authority for the DERIVED `pattern` classification of §2.1.

**Catalog status.**

The catalog is NOT characterized in this specification as a governed Pattern A
or Pattern B vocabulary. Whether the catalog is itself governed is DEFERRED to
a separate controlled authorization.

This deferral MUST NOT be read as permission to treat catalog contents as
ungoverned in effect, or to change a family's pattern assignment informally.

**Assignment authority.**

Family-to-pattern assignments are drawn from the coverage assignment of the
controlling canonical entity model.

A family whose pattern assignment is not fixed there MUST NOT be admitted to
the catalog until that assignment is fixed by a controlled specification.
Admission of an unresolved family is a governance/schema fault and MUST FAIL
CLOSED.

**Change control.**

Reclassification of a family between Pattern A and Pattern B requires explicit
owner adjudication and a new controlled specification version (§2.1). It MUST
NOT occur in place, and MUST NOT be applied retroactively unless separately
adjudicated.

**Catalog membership is not eligibility.**

Presence of a family in the catalog MUST NOT be interpreted as evidence that
any instance of that family is immutable, approved, validated,
runtime-available, or eligible for a consequential governance act.

## 3. Identifier Model

### 3.1 Stable conceptual identity

`object_id` is the stable conceptual identity of a Pattern A governed object
(§2.2). It denotes the enduring conceptual object, not any one of its governed
semantic revisions.

`object_id` MUST be stable for the life of the conceptual object, MUST NOT be
reused, and MUST NOT be repointed to a different conceptual object.

A stable conceptual identity is not a `governed_instance` (§2.1) and MUST NOT
be cited as the authoritative subject of a governance act (§11.1).

### 3.2 Governed instance identity

`instance_id` is the exact governed instance identity allocated by the registry
(§2.1). It denotes one concrete Pattern A version instance or one concrete
Pattern B governed record.

`instance_id` MUST be opaque, and MUST carry no scientific, semantic, or
governance meaning in the identifier itself. No such meaning may be inferred
from identifier ordering or value.

`instance_id` MUST be allocated when the concrete governed instance is created,
and MUST NOT be reused, reallocated, or transferred to another concrete
instance or to another governed family.

A Pattern A version and a Pattern B record each carry the registry identity as
their own identity. Neither carries a second identity duplicating it, which
would create two independently writable representations of the same governed
fact.

### 3.3 Semantics-free domain code

`domain_code` is the human-readable handle of a Pattern A governed object
(§2.2). It exists for human citation and reference.

`domain_code` MUST be semantics-free. It MUST NOT encode source, edition,
chapter, position, topic, ordering, scientific content, or governance state.
No scientific or governance meaning may be inferred from its value.

`domain_code` MUST be immutable once allocated, MUST NOT be reused, and MUST
NOT be repointed to another conceptual object.

`domain_code` MUST be unique. The allocation format, the allocation authority,
and the collision-prevention mechanism are DEFERRED to a later controlled
specification.

`domain_code` MUST NOT be a governance-act target. Where a governance act
requires an exact subject, it MUST cite `instance_id` (§11.1).

### 3.4 version_sequence as ordering only

`version_sequence` is an ordering attribute of a Pattern A version within its
owning stable identity (§2.3).

`version_sequence` MUST be monotonic within its owning stable identity. Gaps
are permitted. Gap-free numbering is NOT required and carries no governance
meaning.

No scientific, approval, validation, runtime, precedence, or currency meaning
may be inferred from a `version_sequence` value, or from the comparison of two
such values beyond authoring order within one stable identity.

`version_sequence` MUST NOT be a governance-act target, and MUST NOT substitute
for `instance_id`.

A mutable ordinal held on a single mutable record MUST NOT be used as a version
mechanism. Ordering is an attribute of distinct immutable version instances,
never a replacement for them.

### 3.5 Identifier families that must not be conflated

The following identifier families are distinct. They MUST NOT be conflated,
substituted for one another, or collapsed into a single identifier:

- governed instance identity — `instance_id` (§3.2);
- stable conceptual identity — `object_id` (§3.1);
- human-readable domain code — `domain_code` (§3.3);
- ordering attribute — `version_sequence` (§3.4);
- external identifiers attaching to enduring objects, DEFERRED to a later
  controlled mapping (§2.2).

An external identifier MUST NOT become a governed instance identity, and MUST
NOT make the object to which it attaches a `governed_instance` (§2.2).

Physical identifier types are outside the scope of this specification (§1.2).

## 4. Cardinalities

The following cardinalities are normative for the Step 1 substrate.

**Stable identity to versions.**

One `governed_object` MUST own one or more `governed_object_version` instances.
A stable identity holding no version instance asserts no governed meaning, and
MUST NOT be resolved to a governed subject.

**Version to registry.**

Each `governed_object_version` MUST correspond to exactly one
`governed_instance`, and each such `governed_instance` MUST correspond to
exactly one `governed_object_version`.

**Pattern B record to registry.**

Each Pattern B governed record MUST correspond to exactly one
`governed_instance`, and each such `governed_instance` MUST correspond to
exactly one Pattern B governed record.

**Registry to concrete instance.**

Each `governed_instance` MUST resolve to exactly one concrete governed instance
in exactly one governed family (§2.1). No `instance_id` may be held by two
concrete governed instances, whether within one family or across families.

**Version to stable identity.**

Each `governed_object_version` MUST belong to exactly one `governed_object`,
and MUST NOT be repointed to another stable identity (§2.3).

**Ordering uniqueness.**

Within one `governed_object`, a given `version_sequence` value MUST NOT be held
by more than one `governed_object_version`.

**Instance to subject family.**

Each `governed_instance` MUST carry exactly one `subject_type` value (§2.1).

**Subject family to pattern.**

Each family admitted to the controlled subject-type catalog MUST carry exactly
one Pattern A or Pattern B assignment (§2.5). A family carrying no assignment,
or more than one, is a governance/schema fault and MUST FAIL CLOSED.

**Runtime-resolvable versions.**

Within one `governed_object` and one resolution scope, the number of
runtime-resolvable versions MUST be zero or one. The zero case and the
more-than-one case are governed by §9.4, §10.1, and §10.2.

## 5. Immutability

### 5.1 Pattern A immutability boundary

The Pattern A immutability boundary is exit from draft.

While a `governed_object_version` is in the draft semantic class (§7.1), its
governance-bearing semantic content MAY be edited.

Once that version leaves the draft semantic class, its governance-bearing
semantic content is immutable. It MUST NOT be edited, replaced in place,
regenerated, or silently rewritten.

Exit from draft is irreversible for that version (§7.3). A version that has
left draft MUST NOT be returned to draft, and no later editorial state may
restore mutability to it.

Purely non-semantic administrative annotation, on which no governance decision
depends, MAY remain mutable. It MUST NOT carry governance-bearing meaning, and
MUST NOT become the carrier of a governed fact.

### 5.2 Pattern B first-governance-use immutability

The Pattern B immutability boundary is first governance use, as enumerated in
§2.4.

A Pattern B governed record MAY be authored and corrected while it has not yet
crossed first governance use. After it has crossed that boundary, its semantic
content is immutable.

Boundary-crossed state is DERIVED from authoritative governance-use evidence
(§2.4). It MUST NOT be represented as an independently writable value, and MUST
NOT be set, cleared, or overridden independently of that evidence.

Where boundary-crossed state cannot be established from authoritative evidence,
any act requiring an immutable subject MUST FAIL CLOSED (§10.3).

### 5.3 Correction, replacement, and historical preservation

Correction MUST NOT mutate governed history.

For Pattern A, correction after the immutability boundary MUST proceed by
creating a new version under the same stable identity.

For Pattern B, correction after the immutability boundary MUST proceed by
creating a new record. The governance relationship between the superseded
record and the correcting record is itself governed.

A version revision and a conceptual supersession are different facts and MUST
NOT share one representation. A version chain expresses revision of the same
governed concept under one stable identity. A supersession expresses one
distinct governed subject replacing, narrowing, or invalidating another.

Partial supersession MUST remain expressible: a governed subject MAY supersede
another only within a stated scope, leaving the superseded subject
authoritative outside that scope. The representation of scope qualification is
DEFERRED to a later controlled specification.

Governed instances MUST remain resolvable indefinitely. A governed instance
MUST NOT be deleted, and a registry entry MUST NOT be removed.

A historical reference MUST NOT be repointed in place. A reference recorded
against an exact governed instance continues to denote that instance.

## 6. Binding Families and the Freeze Rule

### 6.1 Meaning-defining / governance-bearing classification

A binding family is a typed governance-relationship family between governed
subjects.

A binding family is meaning-defining / governance-bearing when the bindings it
carries form part of the governed meaning of the depending subject.

Interpretation Rule binding families and Guardrail binding families are
explicitly classified as meaning-defining / governance-bearing.

The freeze rule of §6.3 applies to binding families explicitly classified as
meaning-defining / governance-bearing. It MUST NOT be generalized
indiscriminately to every relation or descriptive link.

### 6.2 Classification is a family-level specification property

The meaning-defining / governance-bearing classification is a property of the
binding family, declared in the controlled specification that defines that
family.

It is NOT a per-binding-instance attribute. A binding instance MUST NOT
override, downgrade, or alter the classification of its family.

No runtime, curation, or governance operation may reclassify an individual
binding in order to escape the freeze rule.

The classification is fixed within a given controlled specification version.

Reclassification of a binding family requires explicit owner adjudication and a
new controlled specification version.

Reclassification MUST NOT retroactively reinterpret historical bindings unless
a separate explicit owner adjudication authorizes and defines that treatment.

Each binding-family specification MUST explicitly declare whether the family is
meaning-defining / governance-bearing. Where that declaration is absent, the
classification is not established, and any act depending on it MUST FAIL CLOSED
(§10.3). Absence of a declaration MUST NOT be read as a declaration that the
family is not meaning-defining.

### 6.3 The binding freeze rule

Once a dependent Pattern A version crosses its immutability boundary (§5.1),
its meaning-defining / governance-bearing binding set is frozen.

For that version:

- no binding may be added;
- no binding may be removed;
- no binding may be replaced;
- no binding may be repointed in place.

Historical bindings remain immutable and MUST remain resolvable.

A binding MUST reference the exact governed instance it binds (§11.1). A
reference to a bare stable identity is not a frozen binding, and MUST NOT be
used where the freeze rule applies.

### 6.4 Re-binding requires a new dependent version

Any change to the meaning-defining / governance-bearing binding set of a
dependent Pattern A version that has crossed its immutability boundary MUST be
expressed as a new dependent version carrying its own bindings.

The prior version and its bindings remain intact, immutable, and auditable.

The dependency re-binding workflow — the triggers requiring re-binding, the
authority required to perform it, the identification of affected dependents,
and the fail-closed maintenance of unresolved consequential paths until
resolution — is OPEN and is recorded as F-04 in §14.1.

This section states the policy and classification constraints only. It does NOT
claim that the re-binding workflow is specified.

## 7. Editorial Semantic Partition

### 7.1 draft — mutable semantic class

Draft is the mutable semantic class of a Pattern A governed version.

While a version is in the draft class, its governance-bearing semantic content
MAY be edited (§5.1).

A draft version is a `governed_instance` from creation (§2.1). Draft membership
in the registry MUST NOT be interpreted as immutability, approval, validation,
runtime availability, or eligibility for a consequential governance act.

### 7.2 non-draft / content-asserted — immutable semantic class

Non-draft / content-asserted is the immutable semantic class of a Pattern A
governed version.

A version in this class has asserted its governance-bearing semantic content.
That content is immutable (§5.1).

Membership of this class asserts content only. It MUST NOT be interpreted as
approval, validation, runtime availability, or consequential eligibility, each
of which is an independent axis (§8).

### 7.3 Irreversibility of draft exit

Leaving the draft semantic class is irreversible for that version.

A version that has left draft MUST NOT return to draft, and MUST NOT regain
mutability by any editorial, administrative, curation, or runtime act.

Step 1 fixes only this two-class partition. It defines no broader editorial
vocabulary.

Any richer editorial state adopted by a later controlled specification MUST
belong to exactly one of these two semantic classes, and MUST NOT restore
mutability after the draft boundary has been crossed.

Editorial semantic class is one axis only (§8.1). It MUST NOT be used to
express approval, validation, runtime availability, or historical lineage.

## 8. Independent Lifecycle Axes

Step 1 recognizes four independent lifecycle axes. They are independent facts
about a governed subject and MUST NOT be collapsed into a single
representation.

### 8.1 Axis 1 — editorial / content assertion

Axis 1 is the editorial semantic class of §7: draft, or non-draft /
content-asserted.

Axis 1 is asserted. It is settable only while the version is in draft, and exit
from draft is irreversible (§7.3).

Axis 1 applies to Pattern A versions. For a Pattern B record the corresponding
boundary is first governance use, whose crossed state is DERIVED and is never
asserted (§5.2).

### 8.2 Axis 2 — approval / validation derivation

Axis 2 is the approval and validation determination for a governed subject on a
defined dimension.

Axis 2 is DERIVED from governed review and decision evidence. It MUST NOT have
an independently settable representation anywhere in the substrate.

Approval MUST NOT be self-granted, and MUST NOT be conferred by changing any
other axis. Making a subject runtime-available does not produce approval
(§8.3).

Validation dimensions are independent of one another. Where a gate requires
several dimensions, each MUST hold independently, and the dimensions MUST NOT
be combined into a composite value (§8.5).

The validation-dimension applicability matrix is DEFERRED and is recorded as
F-13 in §14.4.

### 8.3 Axis 3 — runtime availability

Axis 3 is whether a governed subject may be used by a runtime path.

Authoritative runtime availability is DERIVED from the activation and
quarantine governance-event chain. It MUST NOT become a second independently
writable source of truth.

A materialized runtime-availability representation MAY exist only as a
recomputable, non-authoritative projection of that event chain.

Runtime availability changes only by explicit governance event. Reactivation
after quarantine is not a field revert; the activation criteria MUST be
satisfied again.

Runtime availability MUST NOT be inferred from registry membership, catalog
membership, editorial semantic class, approval, or version ordering.

The exact activation and quarantine event shape is DEFERRED to a later
controlled specification.

### 8.4 Axis 4 — historical lineage

Axis 4 is the lineage position of a governed subject, for example superseded or
retired.

Lineage state MUST NOT imply deletion. A superseded or retired governed
instance MUST remain resolvable indefinitely (§5.3).

Lineage is expressed through governed relations and governance events. It MUST
NOT be expressed by rewriting the subject.

A version chain is not a supersession relation, and the two MUST NOT share one
representation (§5.3).

### 8.5 Axis independence and prohibited combination

The four axes are independent. A governed subject may be content-asserted but
not approved, approved but not runtime-available, runtime-available but
restricted in scope, or superseded yet still resolvable for audit.

There MUST be no master lifecycle state. No single field, value, or vocabulary
may represent the combined position of the axes.

There MUST be no arithmetic combination of axes. The axes MUST NOT be summed,
weighted, averaged, scored, or otherwise numerically aggregated, and MUST NOT
be collapsed into a value compared against a threshold.

Gates over the axes MUST be expressed as conjunctive criteria over the
independent required dimensions, each holding on its own.

## 9. Current-Version Resolution Contract

### 9.1 Status — contract / skeleton only

This section states a logical resolution CONTRACT / SKELETON only.

It is NOT implementation-complete, and it MUST NOT be presented as closing the
current-version resolution finding. That finding is OPEN and is recorded as
F-07 in §14.1.

### 9.2 Derived conjunctive predicate

Runtime resolvability is a DERIVED conjunctive predicate over independent
required conditions.

It MUST NOT be a stored authoritative boolean, and MUST NOT be independently
settable.

Every required condition MUST hold independently. The conditions MUST NOT be
weighted, scored, averaged, or otherwise numerically aggregated (§8.5).

A materialized resolution result MAY exist only as a recomputable,
non-authoritative projection.

### 9.3 Pending applicability inputs

The final applicability inputs of the predicate are not specified here. They
depend at minimum on:

- developmental / grade scope where applicable, DEFERRED as F-10 (§14.4);
- validation applicability, DEFERRED as F-13 (§14.4);
- rights-permitted-act semantics;
- resolution-scope vocabulary.

Until those inputs are fixed by a controlled specification, the predicate MUST
NOT be treated as evaluable for a consequential path, and any such path MUST
FAIL CLOSED (§10.3).

### 9.4 Cardinality rule

Within one stable identity and one resolution scope, the following is fixed
now, independently of the pending applicability inputs:

- zero eligible versions is a fail-closed condition (§10.1);
- exactly one eligible version is the only resolvable outcome;
- more than one eligible version is a governance fault (§10.2).

No recency heuristic, priority heuristic, ordering heuristic, or
`version_sequence` comparison is authorized as a tie-break. Selecting among
multiple eligible versions by any such heuristic is prohibited.

## 10. Fail-Closed Rules

FAIL CLOSED means the dependent action does not proceed. It does not mean
proceed with a warning, proceed with a default, or fall back to unconstrained
generation.

### 10.1 Zero eligible versions

Where resolution within one stable identity and one resolution scope yields
zero eligible versions, the dependent consequential path MUST FAIL CLOSED.

Absence of an eligible version is not permission. It MUST NOT be treated as an
implicit selection of any other version, including the most recently created
version or the version holding the highest `version_sequence`.

### 10.2 Multiple eligible versions

Where resolution yields more than one eligible version, the condition is a
governance fault.

The dependent consequential path MUST FAIL CLOSED, and the fault MUST be raised
as a governance event rather than silently resolved.

No heuristic tie-break is authorized (§9.4).

### 10.3 Unresolved exact governed instance

Where a consequential path requires an exact governed instance and that
instance cannot be resolved, the path MUST FAIL CLOSED.

This applies at minimum where:

- a stable-identity reference cannot be resolved to an exact governed instance
  (§11.6);
- required immutability of the subject cannot be established (§2.1, §5.2);
- a family's pattern assignment cannot be established (§2.5);
- `pattern` does not equal the catalog assignment of `subject_type` (§2.1);
- a binding family's meaning-defining classification cannot be established
  (§6.2);
- the resolution predicate is not evaluable (§9.3).

Absence of evidence, of an established condition, or of an authoritative
determination is NOT permission (§1.3).

## 11. Referential Invariants

### 11.1 Exact governed-instance references

Every authoritative governance act MUST record the exact governed instance it
acted upon, cited by `instance_id`.

For a Pattern A subject, that is the exact version instance. For a Pattern B
subject, that is the exact governed record.

Acting on whatever the current subject happens to be is never sufficient.

A governance act MUST NOT cite a bare stable identity, a `domain_code`, a
`version_sequence`, or an external identifier as its authoritative subject.

### 11.2 Typed family references

Where a referencing entity is valid only for certain governed families, the
reference MUST be structurally typed using the governed instance identity
together with its subject family, so that admissible families are constrained
structurally rather than by convention (§2.1).

A `governed_instance` carries exactly one `subject_type` value (§4). That value
MUST NOT be changed after allocation, because a registry identity is never
transferred between concrete instances or between families (§3.2).

### 11.3 Prohibition on authoritative polymorphism

Authoritative governance state MUST NOT depend on an unconstrained
`subject_type` plus arbitrary `subject_id` reference.

No such polymorphism is introduced by this specification.

The referential enforcement technique for typed governance-subject references
is DEFERRED to a later controlled specification. Whichever technique is chosen
MUST be able to reference both Pattern A version instances and Pattern B
governed records.

### 11.4 Bounded audit / event exception

Loose `target_type` / `target_id` references remain permitted for append-only
audit and event logging only.

The rationale for the exception is that audit targets may be heterogeneous or
non-canonical, and that audit must endure outside the canonical referential
model. The rationale is NOT that governed instances disappear: registry entries
are non-deletable and governed instances remain resolvable indefinitely (§5.3).

The exception is bounded to append-only audit and event logging. It MUST NOT
carry authoritative governance state, and MUST NOT be used to reintroduce
authoritative polymorphism under another name (§11.3).

### 11.5 Atomic registry and concrete-instance creation

The registry entry and the concrete governed instance MUST come into existence
together (§2.1).

A concrete governed instance MUST NOT exist without its registry entry, and a
registry entry MUST NOT exist without its concrete governed instance.

Delayed allocation at draft exit, at first governance use, or at any later
boundary is not authorized.

This is an obligation on the governed write boundary. The realization of that
boundary is DEFERRED to a later controlled specification.

### 11.6 Governed and auditable stable-identity resolution

A stable-identity reference is permitted only where the intended semantic
target is explicitly the enduring conceptual object (§2.2).

Where a consequential process requires an exact version, resolution from stable
identity to an exact governed instance MUST itself be governed and auditable,
and MUST FAIL CLOSED where the exact instance cannot be resolved (§10.3).

The resolved governed instance is what the governance act records. A stable
identity MUST NOT be recorded as the authoritative subject in place of the
exact governed instance it resolved to (§11.1).

## 12. Incorporated Owner Decisions as Normative Constraints

The owner decisions of the Final Step 1 Decision Register are incorporated as
normative constraints of this specification. Each is restated here with the
sections that carry it.

Where this section and a carrying section differ in wording, the carrying
section governs the detail and this section governs the constraint.

### 12.1 A1 — registry membership

`governed_instance` contains exactly Pattern A governed version instances and
Pattern B governed records. Pattern A stable identities are enduring conceptual
identities, are excluded from the registry, and are never authoritative
governance-act targets.

Carried by §2.1, §2.2, §3.1, §11.1, §11.6.

### 12.2 A2 — binding-set freeze

Once a dependent Pattern A version crosses its immutability boundary, its
meaning-defining / governance-bearing binding set is frozen: no binding may be
added, removed, replaced, or repointed in place, and any such change requires a
new dependent version. The rule applies to binding families explicitly
classified as meaning-defining / governance-bearing, and is not generalized
indiscriminately to every relation or descriptive link.

Carried by §6.1, §6.3, §6.4.

### 12.3 A3 — editorial semantic partition

Step 1 fixes only the semantic partition draft = mutable versus non-draft /
content-asserted = immutable. Exit from draft is irreversible, and no future
editorial state may restore mutability.

Carried by §5.1, §7.1, §7.2, §7.3.

### 12.4 C1 — subject-type catalog status

The subject-type catalog is a controlled system vocabulary enforcing family and
pattern assignment. Whether the catalog is itself governed is DEFERRED pending
separate authorization.

Carried by §2.5.

### 12.5 C2 — audit polymorphism rationale

Loose `target_type` / `target_id` remains permitted for append-only audit and
event logging because audit targets may be heterogeneous or non-canonical and
audit must endure outside the canonical referential model — not because
governed instances disappear, which they never do.

Carried by §11.4.

### 12.6 C3 — resolution predicate status

Current-version resolution is a logical contract / skeleton only. Zero eligible
versions fails closed, multiple eligible versions is a governance fault, and no
recency or priority heuristic is authorized. No closure of the current-version
resolution finding is claimed.

Carried by §9.1, §9.2, §9.3, §9.4, §10.1, §10.2, §14.1.

### 12.7 N1 — binding-family classification authority

A binding family's meaning-defining / governance-bearing classification is a
family-level specification property. No binding instance may override or
downgrade it. It is fixed within a controlled specification version, and may be
reclassified only by explicit owner adjudication together with a new controlled
specification version, without retroactive reinterpretation of historical
bindings. Interpretation Rule and Guardrail binding families remain explicitly
classified as meaning-defining / governance-bearing.

Carried by §6.1, §6.2.

### 12.8 Q2 — Pattern B boundary-crossed state

Pattern B boundary-crossed state is DERIVED from authoritative governance-use
evidence and is never an independently writable value. Any materialization is a
recomputable, non-authoritative projection.

Carried by §2.4, §5.2.

### 12.9 Q3 — runtime availability derivation

Authoritative runtime availability is DERIVED from the activation and
quarantine governance-event chain. Any materialized state is a recomputable
projection and never a second writable source of truth.

Carried by §8.3.

### 12.10 Q4 — version_sequence semantics

`version_sequence` is monotonic ordering only. Gaps are permitted, and gap-free
numbering carries no governance meaning.

Carried by §2.3, §3.4, §4, §9.4.

## 13. Scientific and Governance Invariants Preserved

This specification preserves the controlling scientific and governance
invariants. It does not weaken, replace, or authorize deviation from any of
them.

- RIASEC represents vocational interests. It MUST NOT be represented or
  interpreted as a measure of ability, intelligence, competence, or
  achievement.
- Developmental or grade scope is an applicability qualifier. It MUST NOT be
  converted into a deterministic assertion that an individual student is in a
  particular developmental stage.
- There is no master score. Independent dimensions, evidence channels, gates,
  or assessments MUST NOT be summed into a single global score.
- Self-efficacy remains a process, intervention, and outcome construct. It MUST
  NOT be converted into an additional assessment.
- Complementary channels are non-additive. Their results MUST NOT be summed or
  averaged merely because they address related questions.
- Discrepancy between channels is an inquiry signal. It MUST NOT be treated as
  an averaging target whose purpose is to erase disagreement.
- Contradictory or discrepant evidence MUST remain visible to authorized
  interpretation and review. It MUST NOT be merged, deleted, averaged, or
  normalized away to force apparent coherence.
- Consequential AI-supported interpretation requires meaningful human review,
  and an authorized human reviewer MUST retain the ability to override or
  withhold the proposed interpretation or action.
- For participants under 18, a consequential decision MUST NOT be made solely
  by an automated system. Applicable parent or guardian permission, student
  assent, and the communicated limits of confidentiality remain controlling
  safeguards.
- Scientific validation and rights authorization are distinct governance
  questions. Neither substitutes for the other.
- Georgian contextual validity and translation fidelity are distinct
  determinations. Neither establishes the other.
- Data minimization applies. Information not necessary for the authorized
  purpose MUST NOT be collected, transferred, retained, or exposed merely
  because a system is capable of processing it.
- Student-linked or student-level operational data MUST NOT enter the canonical
  knowledge substrate.
- Documentation completeness is NOT evidence completeness. The existence of a
  specification does not establish that the required evidence, rights,
  validation, safety, or governance conditions have been satisfied.
- Absence of evidence, rights, validation, safeguarding approval, or explicit
  owner authorization is NOT permission (§1.3).
- Lifecycle axes MUST NOT be arithmetically combined, and there is no master
  lifecycle state (§8.5).

No later realization of this specification may silently weaken these
constraints. Where a later realization and these constraints conflict, the
conflict MUST be reported and adjudicated, and MUST NOT be silently reconciled.

## 14. Open, Affirmed, and Deferred Register

This register records the disposition of carried findings for Step 1. No
finding is closed by this specification. Recording a finding here is
registration, not resolution.

### 14.1 OPEN — F-04, F-07, M-1

**F-04 — dependency re-binding workflow. OPEN.**

The policy and classification constraints are settled by A2 and N1 and are
carried by §6.1 through §6.4. The workflow realization — the triggers requiring
re-binding, the authority required to perform it, the identification of
affected dependents, and the fail-closed maintenance of unresolved
consequential paths until resolution — remains unspecified. F-04 is NOT closed.

**F-07 — current-version resolution and cardinality. OPEN.**

The resolution contract / skeleton is stated in §9, and the fail-closed
cardinality rules in §10.1 and §10.2. The applicability inputs of the predicate
remain unspecified (§9.3). No closure is claimed.

**M-1 — source-hierarchy and external-identifier pattern assignment. OPEN.**

The pattern assignment of the source, source-expression, source-manifestation,
and external-identifier levels is not fixed by the controlling coverage
assignment. This specification does not fix it and does not infer it.

Under §2.5, a family whose pattern assignment is not fixed by a controlling
source MUST NOT be admitted to the subject-type catalog until that assignment
is fixed by a controlled specification, and admission of an unresolved family
MUST FAIL CLOSED.

A1 constrains any later resolution: source-identity governance MUST cite the
exact governed descriptor or determination instance, not a bare enduring source
or expression identity. That constrains later design. It does NOT close M-1.

### 14.2 AFFIRMED CONSTRAINT — L-1

**L-1 — immutable binding constraint. AFFIRMED CONSTRAINT.**

Historical bindings and historical references are immutable and MUST NOT be
repointed in place (§5.3, §6.3).

L-1 is not an independent open work item, and MUST NOT be recorded as DEFERRED.

### 14.3 CONFIRMED STRENGTH / NO ACTION — N-1

**N-1. CONFIRMED STRENGTH / NO ACTION.**

N-1 is recorded as a confirmed strength. It is not an open defect, requires no
corrective action, and MUST NOT be represented as an unresolved finding
requiring remediation. It MUST NOT be recorded as DEFERRED.

### 14.4 DEFERRED — F-05, F-06, F-08, F-09, F-10, F-11, F-12, F-13, F-14, M-2

The following findings are DEFERRED. They are untouched by Step 1, and no
closure is claimed for any of them:

- F-05 — citable validation-determination identity;
- F-06 — validation derivation rule;
- F-08 — living-web-source convention;
- F-09 — rights-document physical entity;
- F-10 — developmental / grade scope;
- F-11 — consequentiality classification;
- F-12 — platform-role versus reviewer-authority implementation;
- F-13 — validation applicability matrix;
- F-14 — contributor / citation sequencing;
- M-2 — named scientific review authority for operational correspondence.

F-10 and F-13 are required applicability inputs to the resolution predicate of
§9.3.

Two sequencing constraints are carried without closure. The validation
applicability matrix MUST be produced before any activation logic is specified,
and contributor normalization MUST be sequenced ahead of citation rendering.
Neither constraint closes its finding, and neither authorizes implementation.

### 14.5 Step 1 boundary deferrals

The following are DEFERRED to later controlled steps or specifications and are
outside the Step 1 scope:

- physical identifier types, allocation format, and allocation authority
  (§3.2, §3.3);
- the concrete membership of the subject-type catalog (§2.5);
- whether the subject-type catalog is itself governed (§2.5);
- external-identifier mapping for enduring objects (§2.2, §3.5);
- scope qualification and the representation of partial supersession (§5.3);
- the referential enforcement technique for governance subjects (§11.3);
- the realization of the governed write boundary (§11.5);
- the activation and quarantine event shape (§8.3);
- the validation-dimension applicability matrix (§8.2);
- the resolution-scope vocabulary and rights-permitted-act semantics (§9.3);
- concrete Pattern B record families beyond the contract of §2.4.

A deferral is not a decision. No deferred item may be treated as resolved,
permitted, or authorized because it is recorded here.

## 15. Explicit Non-Authorization

This specification authorizes none of the following:

- SQL or DDL;
- physical database types, keys, indexes, constraint syntax, or triggers;
- migrations;
- Supabase schema, security, or configuration changes;
- RLS policies, grants, or RPC definitions;
- deployment to any environment;
- production changes or production access;
- data ingestion;
- embeddings, vector storage, or retrieval-augmented generation;
- RGIM or agent production implementation;
- runtime provenance implementation;
- operational scoring-channel correspondence implementation;
- student-data processing;
- repository staging, commit, push, pull-request creation, or merge.

This specification makes no claim of:

- production readiness;
- scientific validation;
- psychometric validation;
- rights clearance;
- Georgian contextual validation;
- translation fidelity determination;
- safeguarding clearance;
- closure of any carried finding.

Each such action or determination requires its own authorization at its
applicable gate. Approval in one context does not extend to another.

Later physical realization MAY realize the semantics specified here. It MUST
NOT weaken, reinterpret, or bypass the governance constraints stated here
(§1.3).

## 16. Next Controlled Step

Step 1 defines the governed-object, identity, versioning, referential, and
lifecycle substrate only.

Work that builds on this substrate is not authorized by it. Continuation
requires, at minimum:

- a Step 1 integration review against the controlling canonical entity model,
  the Owner Gate 0 Adjudication Record, and the Final Step 1 Decision Register;
- an owner closure decision for Step 1;
- separate owner authorization for any later step.

Findings recorded as OPEN in §14.1 remain OPEN after Step 1. Their resolution
is later controlled work and is not authorized here.

Completion of this document does not by itself close any carried finding, does
not confer an evidence level on prior or future work, and does not convert
documentation completeness into scientific, rights, validation, safety,
operational, or production-readiness evidence.
