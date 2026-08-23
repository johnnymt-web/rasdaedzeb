# RGKB Controlled Schema Specification — Step 2: Knowledge Object / Evidence / Provenance / Citation Substrate — v0.1

- Phase: 7.1 — Controlled Schema Specification
- Step: 2 — Knowledge Object / Evidence / Provenance / Citation Substrate
- Artifact type: Logical schema specification
- Version: v0.1
- Status: DRAFT — CONTROLLED AUTHORING
- Date: 2026-08-23
- Controlling architecture: RGKB_Canonical_Entity_Model_v0.2.1
- Controlling foundation: Step 1 Governed Object / Versioning / Referential /
  Lifecycle Substrate v0.1
- Gate authority: Owner Gate 0 adjudication; Master Phase 2 authorization of
  2026-08-23
- Production status: NOT AUTHORIZED FOR PRODUCTION

This document is subordinate to the approved canonical entity model, to the
owner adjudications recorded in the Owner Gate 0 Adjudication Record, and to
the accepted Step 1 substrate. It specifies logical schema semantics only. It
creates no SQL, DDL, migration, Supabase, runtime, ingestion, deployment,
production, or student-data authorization. Later physical implementation may
realize these semantics, but MUST NOT weaken, reinterpret, or bypass the
governance constraints stated here.

## 1. Scope and Authority

### 1.1 What this document is

This document is an implementation-ready LOGICAL schema specification.

It specifies the Step 2 knowledge-object, evidence, source, derivation,
provenance and citation substrate for the RGKB canonical knowledge layer.

It is subordinate to RGKB_Canonical_Entity_Model_v0.2.1, which remains the
controlling architecture.

It is subordinate to the accepted Step 1 specification, which remains the
controlling governed-identity, versioning, lifecycle and subject-family
substrate.

Within that subordination, this document is authoritative for later Step 2
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
- an ingestion or extraction pipeline design;
- an embedding, vector-storage, or retrieval design;
- a runtime provenance implementation;
- an agent or RGIM production design;
- a citation-rendering implementation;
- production authorization.

### 1.3 Non-authorization boundary

This document grants no authorization for:

- SQL or DDL implementation;
- migrations;
- Supabase changes;
- staging or production deployment;
- data ingestion or automated extraction;
- student-data handling;
- runtime activation;
- production RGIM or agent use.

Absence of evidence, validation, rights, safeguarding approval, or explicit
owner authorization is NOT permission.

Later implementation MUST fail closed where required by this specification, and
MUST NOT weaken these boundaries.

### 1.4 Relationship to the Step 1 substrate

Step 1 governs identity, versioning, immutability, lifecycle, referential
semantics and subject-family classification. Step 2 governs what the governed
objects mean, what supports them, and how that support is traced.

Step 2 introduces no second identity authority, no second versioning authority,
and no second lifecycle authority. Every Step 2 object that is a governance
subject is a governed instance under Step 1 §2.1, and carries its Step 1
identity as its own identity.

Where Step 2 names a semantic obligation and Step 1 names the mechanism that
carries it, Step 1 governs the mechanism. Where this document and Step 1 appear
to conflict, the conflict MUST be reported and adjudicated, and MUST NOT be
silently reconciled.

The full integration contract is stated in §13.

### 1.5 Normative language

The following terms carry defined meaning throughout this document. They are
the Step 1 §1.4 vocabulary, unchanged, with two additions required by Step 2
scope.

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
- **CONTENT ORIGIN** — the mandatory classification of governed content as
  direct source evidence, derived interpretation, or constructed content (§2).
- **AUTHORITATIVE POINTER** — the typed governed relationship that carries an
  evidentiary or provenance dependency, as distinct from any commentary about
  it (§6).

No additional lifecycle vocabulary is defined in this document. Lifecycle
vocabulary remains governed by Step 1 §7 and Step 1 §8.

## 2. Content-Origin Classification

### 2.1 The classification is mandatory

Every governed content-bearing object in the Step 2 substrate MUST carry
exactly one CONTENT ORIGIN classification.

The admissible values are:

- direct source evidence (§2.2);
- derived interpretation (§2.3);
- constructed content (§2.4).

The classification is governance-bearing. It forms part of the meaning of the
object that carries it, and is subject to the Step 1 immutability boundary
applicable to that object (Step 1 §5).

An object whose CONTENT ORIGIN cannot be established is not classifiable, and
any act depending on that classification MUST FAIL CLOSED (§14.2).

### 2.2 Direct source evidence

Direct source evidence is content whose governed meaning is what an identified
external source states at an identified location.

Direct source evidence MUST resolve to an evidence anchor (§4.1) that names the
source expression and the locator within it.

Direct source evidence MUST NOT be produced by summarizing, paraphrasing,
generalizing, combining, correcting, updating, or translating a source such
that the resulting statement is no longer what the source states.

A faithful quotation, a faithful structural extraction, and a faithful
locator-bound restatement that a reviewer would accept as what the source says
remain direct source evidence. Anything that adds a conclusion the source does
not state is derived interpretation (§2.3).

### 2.3 Derived interpretation

Derived interpretation is content the RGKB produces from one or more governed
inputs by a governed derivation act (§7.2).

Derived interpretation MUST record the derivation, and the derivation MUST name
the exact governed inputs it consumed (§7.2).

Derived interpretation MUST NOT be represented, cited, rendered, or traversed
as direct source evidence.

The strength of the underlying evidence does not convert a derivation into
direct evidence. A derivation supported by strong primary sources remains a
derivation.

### 2.4 Constructed content

Constructed content is organizational, explanatory, structural, editorial, or
implementation content that the RGKB authors for its own purposes and that no
external source asserts.

Examples of the class, without fixing any vocabulary: navigational grouping
labels, internal explanatory notes, structural scaffolding text, and
implementation-facing descriptions.

Constructed content MUST NOT be represented, cited, rendered, or traversed as
direct source evidence or as derived interpretation.

Constructed content MUST NOT carry an evidentiary support claim. It MAY carry
commentary and MAY reference governed objects, but such a reference is not an
AUTHORITATIVE POINTER (§6.4).

### 2.5 Classification rules and prohibitions

The following are prohibited, without exception:

- promoting derived interpretation to direct source evidence;
- promoting constructed content to derived interpretation or to direct source
  evidence;
- reclassifying an object's CONTENT ORIGIN in place after that object has
  crossed its Step 1 immutability boundary;
- assigning more than one CONTENT ORIGIN to a single governed object;
- inferring CONTENT ORIGIN from the object's family, its position in a
  structure, its evidence-status label, or its epistemic characterization;
- treating the absence of a classification as an assertion that the content is
  direct source evidence.

Correction of a CONTENT ORIGIN after the immutability boundary MUST proceed by
the correction mechanism applicable to that object's Step 1 pattern (§9.2). It
MUST NOT be performed in place.

A CONTENT ORIGIN classification is a property of the governed object. It is not
a property of a rendering of that object, and a rendering MUST NOT alter it.

### 2.6 Failure behaviour

Where CONTENT ORIGIN cannot be established for an object on a consequential
path, that path MUST FAIL CLOSED (§14.2).

Unclassified content MUST NOT be treated as direct source evidence by default,
and MUST NOT be treated as unsupported by default. Unclassified is a distinct
state from classified-and-unsupported (§8.4).

## 3. Source Domain

### 3.1 Three source levels

The source domain has three distinct conceptual levels. They MUST NOT be
conflated, and no two of them may share one representation.

- **Source** — the abstract intellectual work, independent of any edition,
  translation, or copy.
- **Source expression** — a specific intellectual form of that work: an
  edition, revision, translation, language-specific form, or officially revised
  release.
- **Source manifestation** — a specific acquired representation: a supplied
  file, a scan, a print copy in hand, an archived capture.

A statement about what a work says is a statement about an expression. A
statement about pagination, byte offsets, or file integrity is a statement
about a manifestation.

### 3.2 What binds at which level

Scientific evidence claims MUST bind to the source expression. A claim is about
what a given edition states, not about which acquired copy a curator happened
to obtain.

Physical locators, pagination, span offsets, content fingerprints and
acquisition provenance MUST resolve at the manifestation. An evidence anchor
MAY additionally reference a manifestation so that its locator is physically
resolvable (§4.1).

Work-level identity resolves at the source, with expression-level overrides
where an edition legitimately differs.

Binding a scientific evidence claim directly to a manifestation, in place of
the expression, is prohibited. Two manifestations of one expression may
legitimately differ in fingerprint and pagination without differing in what the
edition states.

### 3.3 Source identity is a curated determination

A content fingerprint over an acquired file proves that this file has not
changed. It does NOT prove that the file is the edition it claims to be, that
two files are the same edition, or that a re-scan of an edition is equivalent.

Therefore:

- a fingerprint is a manifestation-level integrity attribute;
- expression identity — the determination that a given manifestation is an
  instance of a given expression, and that a given expression is a form of a
  given work — is a curated, evidence-backed determination;
- that determination is a governance subject in its own right and is subject to
  validation.

A fingerprint match MUST NOT be treated as evidence of edition identity, and an
edition-identity determination MUST NOT be inferred from filename, supplied
metadata, or naming convention alone.

The exact fingerprint algorithm is DEFERRED to a later controlled
specification.

### 3.4 External identifiers

External identifiers — for example a DOI, ISBN, ISSN, URL, handle, accession
number, or framework-specific code — attach to a level of the source hierarchy,
and which level varies by identifier scheme.

An external identifier MUST NOT be hardcoded as belonging to exactly one fixed
level.

An external identifier MUST NOT become a governed instance identity, and MUST
NOT make the object to which it attaches a governed instance (Step 1 §3.5).

The assertion that a given external identifier denotes a given source,
expression, or manifestation is itself a governance-bearing assertion, not a
mechanical attribute. It is subject to §3.5.

The controlled scheme vocabulary and the level-aware attachment structure are
DEFERRED to a later controlled specification.

### 3.5 Pattern assignment for the source hierarchy — M-1

This section discharges the Owner Gate 0 §7.5 requirement that Step-stage
specification either assign the source, source-expression, source-manifestation
and external-identifier levels explicitly in the coverage assignment, or state
explicitly that their pattern assignment remains a deferred physical-realization
item.

**What is fixed here.**

The bare source, source-expression and source-manifestation identity levels are
enduring conceptual identities. They are NOT governed instances, MUST NOT be
registered in the governed-instance registry, and MUST NOT be authoritative
governance-act targets (Step 1 §2.1, Step 1 §2.2, Step 1 §11.1).

It follows that source-identity governance MUST cite the exact governed
descriptor or determination instance — the governed object that carries the
curated determination of §3.3 — and MUST NOT cite a bare enduring source or
expression identity. This is the forward constraint already recorded against
M-1 and it is now normative for Step 2.

**What is not fixed here.**

The controlling coverage assignment does not fix whether the governance-bearing
source-descriptor, identity-determination and external-identifier-attachment
families are Pattern A or Pattern B. This specification does not fix it, does
not infer it, and does not select between the two admissible realizations.

Both realizations are architecturally admissible, and each has a stated
consequence:

- as Pattern A, a descriptor family carries a stable descriptor identity with
  immutable descriptor versions, and correction produces a new version;
- as Pattern B, a determination family carries immutable determination records,
  and correction produces a new record with a governed replacement
  relationship.

Whichever is chosen, the architectural requirement is unchanged: immutability
after the applicable boundary, exact historical identity, and reconstructability
of any determination that a governance act relied upon.

**Consequence while unresolved.**

Under Step 1 §2.5, a family whose pattern assignment is not fixed by a
controlling source MUST NOT be admitted to the subject-type catalog until that
assignment is fixed by a controlled specification, and admission of an
unresolved family is a governance/schema fault that MUST FAIL CLOSED.

Therefore the source-descriptor, identity-determination and
external-identifier-attachment families MUST NOT be admitted to the catalog on
the strength of this document, and no consequential path may depend on them
until their assignment is fixed.

M-1 remains OPEN. Its proposed disposition and the Owner decision it requires
are recorded in §16.1. Nothing in this section closes it.

## 4. Evidence Domain

### 4.1 Evidence anchor

An evidence anchor is an exact, resolvable location within a source expression,
optionally resolved through a specific manifestation.

An evidence anchor carries, at minimum:

- the source expression being anchored, which is the scientific binding;
- an optional manifestation reference, which is the physical resolution;
- a locator type and a locator payload;
- character or span offsets where available;
- an integrity value over the anchored text;
- retained excerpt text only where rights permit retention;
- the provenance of the extraction act (§7.2).

Locator schemes other than page numbers MUST be supported, and structural
locators SHOULD be preferred over page numbers, because pagination varies
across manifestations of one expression (§3.2).

An evidence anchor is not a claim. It states where something is, not that
anything follows from it. What follows is carried by a typed evidence link
(§6.1).

### 4.2 Pattern B semantics for evidence anchors

An evidence anchor is a Pattern B governed record under Step 1 §2.4.

Every evidence anchor MUST be a governed instance from the moment the concrete
anchor is created, whether or not it has crossed first governance use
(Step 1 §2.1).

The immutability boundary is first governance use, as enumerated in
Step 1 §2.4. After that boundary the anchor's semantic locator content is
immutable, including where applicable:

- the source-expression reference;
- the manifestation reference;
- the locator type and locator payload;
- section, paragraph, or span coordinates;
- character or span offsets;
- the integrity value;
- the retained excerpt identity and content, where retention is permitted.

Boundary-crossed state is DERIVED from authoritative governance-use evidence
and MUST NOT be an independently writable value (Step 1 §5.2).

No artificial stable-identity and version pair may be imposed on an evidence
anchor merely so that a version can be cited (Step 1 §2.4). Whether any anchor
version family is ever warranted is DEFERRED to a later controlled
specification.

### 4.3 Rights and document anchors

Rights evidence is frequently not scholarly. A licence text, a permission
message, publisher terms of use, a contract clause, a statutory provision, or a
correspondence record does not carry author, publication year and page range in
the scholarly sense.

Forcing such material into scholarly-source semantics is prohibited. A
rights or document anchor resolves against rights and document material rather
than against scientific source expressions.

Rights and document anchors follow the same Pattern B semantics as scientific
evidence anchors (§4.2), and participate in the same typed evidence-linking
concept (§6.5), so that the question "what evidence supports this
determination?" is one traversable question regardless of determination type.

Rights evidence and scientific evidence remain distinct governance questions.
Neither substitutes for the other (§15).

### 4.4 Anchor correction and replacement

If a locator or an extracted passage later proves incorrect, the historical
anchor MUST NOT be updated in place.

A new evidence anchor MUST be created, and the replacement or supersession
relationship between the superseded anchor and the correcting anchor is itself
governed (§9.2).

Historical references MUST continue to resolve to the original anchor, so that
any past decision remains reconstructable against the evidence it actually
cited.

A correcting anchor MUST NOT be represented as the anchor that a prior decision
relied upon.

### 4.5 Anchor integrity

An anchor integrity value establishes that the anchored text has not changed
since anchoring. It does NOT establish that the anchor is scientifically
correct, that the locator is the right locator, that the expression identity is
correct (§3.3), or that the anchored passage supports any particular claim.

An integrity match MUST NOT be treated as validation, as evidentiary support,
or as a substitute for review.

## 5. Knowledge Object Domain

### 5.1 Governed knowledge object

A governed knowledge object is the smallest independently governable scientific
or professional assertion held in the RGKB.

A governed knowledge object is NOT an entire chapter, an arbitrary paragraph, a
quotation standing alone, a machine-generated recommendation, a student-specific
interpretation, or an assessment result.

A governed knowledge object is a Pattern A governed object under Step 1 §2.2.
Its stable identity is the enduring conceptual identity of the assertion. That
stable identity carries no governance-bearing semantic payload, is not a
governed instance, and is never an authoritative governance-act target
(Step 1 §2.2, Step 1 §11.1).

The stable identity carries the semantics-free human-readable domain code
governed by Step 1 §3.3. No scientific meaning may be inferred from that code.

### 5.2 Knowledge object version

A knowledge object version is a Pattern A immutable version under Step 1 §2.3.
It carries the governance-bearing meaning of the knowledge object.

A knowledge object version carries, at minimum:

- its governed instance identity, which is its Step 1 registry identity;
- the stable conceptual identity it revises;
- its ordering attribute within that stable identity;
- its editorial semantic class, draft or non-draft / content-asserted;
- its CONTENT ORIGIN classification (§2.1);
- the governed assertion itself, as governed localized text (§5.3);
- knowledge type;
- scope qualification, covering population scope, developmental scope and
  context scope;
- epistemic characterization (§5.4);
- the provenance of the act that produced it (§7.2).

A governance act requiring an exact knowledge subject MUST record the exact
version identity, and MUST NOT record the stable identity alone
(Step 1 §2.3, Step 1 §11.1).

Scope qualification is an applicability qualifier. It MUST NOT be converted
into a deterministic assertion about any individual (§15).

### 5.3 Governed localized text

Governed human-readable text declares its language. There is no implicit
default language for governed content.

Governed localized text is a Pattern A governed object under Step 1 §2.2, with
a stable localization identity and immutable localized-text versions. Each
governed translation or adaptation is a distinct immutable version carrying the
governed wording itself.

While a localized-text version is in draft it MAY be edited. Once it leaves
draft, or is reviewed, validated, bound to another governed object, activated,
published, or used in runtime output, its governed text is immutable
(Step 1 §5.1).

Correction requires a new localized-text version. The wording a reader saw is
never rewritten under them. Historical localized-text versions MUST remain
resolvable indefinitely, including superseded, retracted and quarantined
versions (Step 1 §5.3).

A localized text does NOT inherit the validation state of its source-language
text. Each localized governed text carries its own validation state for the
dimensions that apply to it.

Translation fidelity and contextual validity are distinct determinations.
Translation fidelity attaches to the exact localized-text version, not to the
localization identity and not to the source-language version. Neither
determination establishes the other (§15).

Machine translation performed at generation time MUST NOT become authoritative
governed text. Machine assistance during curation is not prohibited;
unreviewed machine output becoming canonical is prohibited.

Knowing the knowledge object version is NOT sufficient to establish what
wording a reader actually saw. The exact localized-text version used MUST be
resolvable (§7.5).

### 5.4 Epistemic characterization is not a number

Epistemic characterization — how well supported an assertion is — uses
controlled vocabularies, ordinal only where an ordering is scientifically
defensible.

Epistemic characterization MUST be non-arithmetic. It MUST NOT be added,
multiplied, weighted, averaged, or otherwise numerically aggregated.

Epistemic characterization MUST be non-additive across layers. A knowledge
object version's epistemic label MUST NOT be computed from the labels of its
evidence links, and no dependent object's applicability may be computed from
the labels of the knowledge objects it binds.

Epistemic characterization MUST NOT be convertible into a universal confidence
value, a composite validity index, or any master score (§15).

Terminology MUST NOT invite false numeric precision. Labels reading as
qualitative determinations are required; labels reading as a percentage,
probability, or score are prohibited. The exact vocabulary is DEFERRED to a
later controlled specification.

Epistemic characterization is a distinct axis from CONTENT ORIGIN (§2), from
evidence status (§8.2), and from the Step 1 lifecycle axes (Step 1 §8). None of
these may be derived from, or collapsed into, another.

### 5.5 Knowledge object relations

A relation between knowledge object versions is a governed assertion about
specific immutable versions. It is a Pattern B governed record under
Step 1 §2.4.

Relations bind version to version, not stable identity to stable identity,
because the truth of a relation depends on exactly what each side stated.

A relation carries, at minimum, the predicate, the source version, the target
version, its scope qualification, and its evidence linkage (§6.1).

After the relation has crossed first governance use, none of the predicate, the
source version, the target version, the scope qualification, or the evidence
linkage may mutate in place. Correction creates a new relation record
(§9.2).

A relation MUST NOT carry its own validation status. Validation state comes
from the governed review and decision substrate, and a relation-local status
would be a second independently writable truth about the same fact
(Step 1 §8.2).

A relation MUST NOT carry a free-text evidence basis in place of typed evidence
links (§6.4).

## 6. Claim Support and Typed Evidence Linking

### 6.1 The typed evidence link is the only authoritative pointer

The AUTHORITATIVE POINTER from a governed object to the evidence supporting it
is always a typed governed relationship from that object to an evidence anchor.

A typed evidence link carries, at minimum:

- the exact governed instance being supported;
- the exact evidence anchor;
- the evidence role (§6.2);
- the support characterization (§6.3);
- optional commentary that is explicitly not the pointer (§6.4).

Both endpoints MUST be exact governed instances. A typed evidence link MUST NOT
reference a bare stable identity, a domain code, an ordering attribute, or an
external identifier as either endpoint (Step 1 §11.1).

A typed evidence link is itself a Pattern B governed record under Step 1 §2.4,
and becomes immutable at first governance use.

### 6.2 Evidence role

Evidence role states what part the anchored evidence plays for the supported
object. The role vocabulary MUST at minimum distinguish evidence that supports,
evidence that corroborates, evidence that contradicts, and evidence that
supplies context.

Evidence role is a controlled vocabulary. It MUST NOT be free text.

Contradicting evidence is a legitimate and required role. A governed object MAY
carry links to evidence that contradicts it, and such links MUST NOT be removed,
suppressed, or downgraded in order to present a cleaner support picture
(§10.5).

The exact role vocabulary is DEFERRED to a later controlled specification. What
is NOT deferred is that the four distinctions above must remain expressible.

### 6.3 Support characterization

Support characterization states how strongly the anchored evidence bears on the
supported object.

Support characterization is subject to §5.4 in full: controlled, ordinal only
where defensible, non-arithmetic, non-additive across layers, and never
convertible into a master score.

Support characterization MUST NOT be aggregated across the links of one object
to produce that object's epistemic characterization. The two are distinct
determinations at distinct layers.

### 6.4 Free text is never the pointer

A free-text evidence reference, evidence basis, or citation string MUST NOT be
the authoritative evidence pointer. Such fields cannot be validated, cannot be
traversed, and break silently when a source is re-editioned.

Free-text commentary MAY accompany a typed evidence link. It MUST NOT stand in
place of one, and its presence MUST NOT be treated as evidence that a link
exists.

A governed object bearing only free-text commentary about its evidence is
unsupported for the purposes of this specification, and any consequential path
requiring its support MUST FAIL CLOSED (§14.1).

### 6.5 One coherent evidence-linking concept

The same typed evidence-linking concept applies wherever a governed object
requires evidence, including knowledge object versions, knowledge object
relations, source-identity determinations (§3.3), rights determinations, and
any later governed object that carries an evidentiary claim.

A distinct ad-hoc evidence field per family is prohibited. One traversable
concept is required so that "what evidence supports this?" is a single question
with a single mechanism regardless of the object asked about.

## 7. Derivation and the Canonical Provenance Chain

### 7.1 The canonical provenance chain

The canonical provenance chain answers one question: why is this governed
knowledge scientifically justified?

The chain resolves backward through:

- the governed knowledge object version;
- its governed localized text version, where governed text is involved;
- its typed evidence links;
- the evidence anchors those links reference;
- the source expression each anchor binds;
- the source that expression is a form of;
- and, where a locator required physical resolution, the manifestation the
  anchor referenced.

Where a governed object was produced by derivation, the chain also resolves
through the derivation record and each of its exact governed inputs (§7.2).

Every step in the chain is a governed transition through an AUTHORITATIVE
POINTER. No step may be established by naming convention, string matching,
label similarity, or structural proximity.

The canonical provenance chain is distinct from runtime decision provenance
(§7.4). Neither may be reconstructed from the other alone, and the two MUST NOT
be merged.

### 7.2 Derivation records

A derivation record is the governed statement that a governed output was
produced from identified governed inputs by an identified act.

A derivation record is a Pattern B governed record under Step 1 §2.4.

A derivation record carries, at minimum:

- the exact governed instance produced;
- every exact governed instance consumed as input;
- the derivation type;
- the actor, typed and attributable;
- the time of the act;
- where a machine process participated, the identity and version of that
  process.

Every input MUST be an exact governed instance. A derivation MUST NOT name a
bare stable identity, a family, a collection, or "the current version" as an
input (Step 1 §11.1, Step 1 §11.6).

"Some process did it" is not acceptable attribution. An unattributable
derivation is not a governed derivation.

A derivation record MUST NOT be mutated in place after first governance use.
Correction creates a new derivation record, and the relationship between the
superseded and correcting record is itself governed (§9.2).

A derivation record establishes that a derivation occurred and from what. It
does NOT establish that the derivation is correct, validated, approved, or
runtime-eligible. Those remain independent axes (Step 1 §8).

### 7.3 Provenance preservation across derivation

Provenance MUST survive derivation.

Where a governed output is derived from governed inputs, the evidence reachable
from those inputs MUST remain reachable from the output through the derivation
record. Derivation MUST NOT flatten, summarize, or discard the provenance of
its inputs.

Derivation MUST NOT transfer the CONTENT ORIGIN of an input to its output. An
output derived from direct source evidence is derived interpretation, not
direct source evidence (§2.3).

Derivation MUST NOT transfer epistemic characterization from input to output,
and MUST NOT compute an output's epistemic characterization from its inputs'
(§5.4).

Derivation MUST NOT transfer validation, approval, or runtime availability from
input to output. Each is independently determined (Step 1 §8.2, Step 1 §8.3).

Where an input is later superseded, withdrawn, retracted, or quarantined, the
derivation record continues to name the exact input instance it consumed. The
historical derivation is not rewritten. What changes is the status reachable
through the chain, not the chain itself (§8.5, §9.5).

### 7.4 The runtime provenance boundary

Runtime decision provenance records what a system did for a specific person, in
a specific session, at a specific time. It is operational data containing
personal context, and for this platform that includes minors' personal data.

Runtime decision provenance MUST NOT be held in the canonical knowledge
substrate. Student-linked, session-linked and individual-linked records MUST
NOT enter it in any form.

Runtime provenance references the canonical substrate only through exact
immutable governed instance identities, including localized-text version
identities. It stores identities, not copies of canonical content, and it does
not write into the canonical substrate.

Because governed instances are immutable and remain resolvable indefinitely
(Step 1 §5.3), a runtime record from any past date can be re-resolved to exactly
the knowledge, text and governed objects that were used, even after those have
been superseded.

The design of any runtime provenance store — its schema, retention, access
control, and consent linkage — is outside the scope of this specification and is
not authorized by it (§17).

### 7.5 Traceability requirements

Traceability over the canonical chain MUST be able to distinguish, at minimum:

- evidence that supports, corroborates, contradicts, or contextualizes (§6.2);
- direct source evidence from derived interpretation from constructed content
  (§2);
- the exact governed localized text rendered, by localized-text version
  identity, not merely by localization identity (§5.3);
- contextual validity from translation fidelity (§15);
- the rights state relied upon at the time of use;
- the validation and human-review state relied upon at the time of use;
- the exact governed instance each governed-instance dependency resolved to;
- an enduring source-hierarchy identity from a governance-bearing
  source-identity determination or descriptor instance (§7.6).

Where a dependency is a governed instance, traceability that resolves only to a
stable identity, or only to "whatever the current version is", does not satisfy
this section. A chain that cannot show which exact instance was relied upon
proves nothing about what was true at the time.

The enduring source, source-expression and source-manifestation identities of
§3.1 are not governed instances (§3.5). Their place in the chain is governed by
§7.6, which distinguishes the two levels and MUST NOT be read as relaxing the
preceding paragraph for any governed-instance dependency.

Traceability is meaningful only because governed instances are immutable and
permanently resolvable. Any later realization that breaks that property breaks
this section.

### 7.6 Source identity: enduring identity versus governed determination

The canonical chain of §7.1 traverses two materially different kinds of node.
They MUST NOT be conflated in representation, traversal, storage, export, or
rendering.

**Enduring source-identity nodes.**

The source, source expression and source manifestation identities of §3.1 are
enduring conceptual identities. They are NOT governed instances, MUST NOT be
registered in the governed-instance registry, and are never authoritative
governance-act targets (§3.5, Step 1 §2.1, Step 1 §2.2, Step 1 §11.1).

Traversal that reaches such a node is a stable-identity reference. It is
permitted only where the intended semantic target is explicitly the enduring
conceptual object (Step 1 §11.6). Reaching such a node MUST NOT be recorded,
reported, or rendered as having resolved a governed instance.

**Governance-bearing source-identity determinations.**

The curated determination that a manifestation is an instance of an expression,
or that an expression is a form of a work (§3.3), is a governance subject.
Where a governance act depends on such a determination, it MUST cite the exact
governed descriptor or determination instance carrying that determination, and
MUST NOT cite the bare source or expression identity in its place (§3.5,
Step 1 §11.1).

**What each level satisfies.**

The §7.5 requirement to resolve the exact governed instance a dependency
resolved to applies to governed-instance dependencies. Naming a bare source,
source-expression, or source-manifestation identity does NOT satisfy that
requirement, and no traversal, report, or rendering may present the naming of an
enduring identity as satisfying it.

Conversely, a governed source-identity determination is not the enduring source
identity it is about. Machine traceability MUST preserve both levels and MUST
NOT collapse a governed determination instance to a bare source-hierarchy
identity, or present a bare source-hierarchy identity as the governed instance a
decision relied upon.

**Fail-closed while M-1 is OPEN.**

No controlling source fixes the Pattern A / Pattern B assignment of the
source-descriptor, identity-determination and external-identifier-attachment
families (§3.5). Those families MUST NOT be admitted to the subject-type
catalog, and a consequential path requiring one of them MUST FAIL CLOSED
(§3.5, §14.4).

This section states the distinction between the two reference levels. It does
not fix those pattern assignments and does not close M-1, which remains OPEN
(§16.1).

## 8. Evidence and Source Status

### 8.1 Status axes MUST NOT collapse

Materially different states MUST NOT be collapsed into one label.

The following are distinct axes. Each is independently determined, and none may
be derived from, or substituted for, another:

- CONTENT ORIGIN — what kind of content this is (§2);
- evidence status — the standing of the evidence itself (§8.2);
- source availability — whether the source can still be resolved (§8.3);
- epistemic characterization — how well supported an assertion is (§5.4);
- support characterization — how strongly a specific link bears (§6.3);
- the Step 1 lifecycle axes — editorial class, approval and validation, runtime
  availability, and historical lineage (Step 1 §8).

A single combined status field over these axes is prohibited, as is any
arithmetic combination of them (Step 1 §8.5).

### 8.2 Evidence status

Evidence status states the standing of an evidence object or of the material it
anchors, independently of whether anything currently relies on it.

The vocabulary MUST at minimum keep the following materially different states
distinguishable:

- evidence that stands as recorded;
- evidence whose source material has been corrected or re-issued;
- evidence whose source material has been retracted or withdrawn by its
  originating authority;
- evidence that has been superseded by a later governed evidence object;
- evidence that is contested by other governed evidence (§10);
- evidence whose standing has not been determined.

Retraction by an originating authority and supersession within the RGKB are
different facts and MUST NOT share one label. A retracted source is not merely
an older source.

Evidence status MUST NOT be interpreted as validation, approval, rights
clearance, or runtime eligibility.

The exact vocabulary is DEFERRED to a later controlled specification. What is
NOT deferred is that the six distinctions above must remain expressible, and
that collapsing any two of them is prohibited.

### 8.3 Source availability

Source availability states whether a source, expression, or manifestation can
still be resolved, and is distinct from evidence status.

A source that has become unavailable does not thereby become invalid, and a
source that remains available does not thereby become valid.

Loss of availability MUST NOT cause deletion, rewriting, or silent detachment
of any anchor, link, or derivation that referenced it. The historical record
continues to name what it named (§9.5).

Where a consequential path requires evidence that can no longer be resolved,
that path MUST FAIL CLOSED (§14.1). It MUST NOT substitute an alternative
source (§11).

### 8.4 Unknown, unresolved, conflicting, deferred and not-applicable

These five states are materially different and MUST remain distinguishable
wherever the distinction matters:

- **unknown** — the question applies and has not been answered;
- **unresolved** — the question applies, has been examined, and no governed
  answer has been reached;
- **conflicting** — the question applies and governed evidence disagrees (§10);
- **deferred** — the question applies and has been intentionally postponed
  under a controlled decision;
- **not applicable** — the question does not apply to this subject.

Collapsing any of these into another is prohibited. In particular, unknown MUST
NOT be recorded as not applicable, and unresolved MUST NOT be recorded as
deferred.

None of these five states is permission. Absence of a determination MUST NOT be
converted into evidence of absence, and MUST NOT be treated as an affirmative
answer of any kind (§14.5).

### 8.5 Status is DERIVED where it depends on governed evidence

Where a status depends on governed acts or governed evidence, it is DERIVED
from that evidence and MUST NOT be an independently writable authoritative
value (Step 1 §8.2).

A materialized status representation MAY exist only as a recomputable,
non-authoritative projection.

Where a DERIVED status cannot be established from authoritative evidence, any
act requiring it MUST FAIL CLOSED (§14.1).

## 9. Version, Correction and Supersession

### 9.1 Pattern assignment for Step 2 families

This section is the single authoritative family-to-pattern assignment register
for the families this specification defines. Each family appears exactly once
in the register.

Sections §4.2, §5.1, §5.2, §5.3, §5.5, §6.1 and §7.2 restate a family's pattern
where that pattern is needed to state the section's own rules. Those statements
are descriptive restatements of this register, not independent assignment
authorities. Where a restatement and this register diverge, the divergence is a
governance/schema fault to be reported; this register remains the Step 2
assignment authority.

Assignments do not share one provenance. Each assigned family carries exactly
one basis:

- **[table]** — assigned in the controlling coverage assignment under the
  canonical family name mapped below;
- **[text]** — assigned by controlling architecture text outside the coverage
  assignment;
- **[derived]** — a Step 2 determination, obtained by applying the controlling
  Pattern B criterion to a family that no controlling source assigns.

**Assignment register.**

- governed knowledge object — Pattern A — [table];
- governed localized text — Pattern A — [table];
- evidence anchor — Pattern B — [table];
- knowledge object relation — Pattern B — [table];
- review, decision or adjudication record — Pattern B — [table];
- rights or document anchor — Pattern B — [text];
- typed evidence link — Pattern B — [derived];
- derivation record — Pattern B — [derived].

**Canonical family-name mapping for the [table] assignments.**

Step 2 terminology and the controlling coverage table do not use identical
family labels in every case. The mapping is explicit:

- governed knowledge object → `Knowledge Unit`;
- governed localized text → `Localized governed text`;
- evidence anchor → `Evidence anchor`;
- knowledge object relation → `Knowledge-unit relation`;
- review, decision or adjudication record → `Review / decision event`.

Only `Evidence anchor` is the same family label apart from capitalization.
The other Step 2 labels are local terminology mapped to the controlling family
names above; they MUST NOT be represented as verbatim coverage-table names.

The controlling coverage assignment does not name a separate adjudication
family. The controlling architecture states that adjudication decisions are
review/decision events on the immutable substrate (§13.4 of that architecture).
Accordingly, `review, decision or adjudication record` in this Step 2 register
uses the Pattern B assignment of the canonical `Review / decision event` family;
it does not assert that the coverage table itself names an adjudication family.

**Basis of the [text] assignment.**

The controlling architecture states explicitly, outside the coverage
assignment, that rights/document anchors follow the same Pattern B immutability
semantics as scientific evidence anchors.

**Basis of the [derived] assignments.**

The controlling sources assign neither the typed evidence link nor the
derivation record under a named family in the coverage assignment. Each is
classified here by applying the controlling Pattern B criterion: each is an
atomic historical assertion whose correction is the recording of a different
thing rather than a revision of the same thing.

These two are Step 2 determinations, not quotations or restatements of
controlling text. If the Owner or a later controlled specification determines
otherwise for either family, that determination controls and this register is
superseded for it.

**Families deliberately not assigned.**

The source-descriptor, identity-determination and
external-identifier-attachment families are not assigned, because no
controlling source fixes their assignment (§3.5).

The cross-source participating position family is not assigned. The controlling
coverage assignment records it as Pattern B with Pattern A permitted as an
alternative, and defers the choice between them to a later physical-realization
determination. Selecting between them here would be invention. What the
controlling source does fix, and what §10.3 carries, is that a participating
position is immutable once it has been included in an adjudication or review,
and that exact historical identity is preserved.

Each assignment above is fixed for its family and MUST equal the assignment
recorded in the controlled subject-type catalog. Reclassification requires
explicit owner adjudication and a new controlled specification version
(Step 1 §2.5). The consequences of non-assignment are stated once, in §13.2.

### 9.2 Correction

Correction MUST NOT mutate governed history.

For a Pattern A Step 2 family, correction after the immutability boundary MUST
proceed by creating a new version under the same stable identity
(Step 1 §5.3).

For a Pattern B Step 2 family, correction after the immutability boundary MUST
proceed by creating a new record, with the relationship between the superseded
record and the correcting record itself governed (Step 1 §5.3).

A correcting object MUST NOT be represented as the object that a prior
governance act relied upon. The prior act continues to name the exact instance
it named (§7.3).

Correction of a CONTENT ORIGIN classification is subject to this section in
full. It is never an in-place edit (§2.5).

### 9.3 Supersession and partial supersession

A version revision and a conceptual supersession are different facts and MUST
NOT share one representation (Step 1 §5.3).

A version chain expresses revision of the same governed concept under one
stable identity. A supersession expresses one distinct governed subject
replacing, narrowing, or invalidating another, and is carried by a governed
relation (§5.5).

Partial supersession MUST remain expressible. A governed subject MAY supersede
another only within a stated scope — for example a population, a developmental
band, a context, or a construct — leaving the superseded subject authoritative
outside that scope.

Supersession MUST NOT delete, hide, or detach the superseded subject, its
evidence links, or its provenance.

The representation of scope qualification and the exact realization of partial
supersession are DEFERRED to a later controlled specification.

### 9.4 Withdrawal and retraction

Withdrawal and retraction are governed acts recorded as governed records. They
are not deletions.

Withdrawal within the RGKB and retraction by an originating external authority
are distinct facts and MUST NOT share one representation or one label (§8.2).

A withdrawn or retracted object MUST remain resolvable indefinitely. Every
anchor, link, derivation and governance act that referenced it continues to
resolve to it.

Withdrawal or retraction of an object does NOT retroactively alter any
derivation that consumed it, any act that relied on it, or any historical
record naming it. It alters what a current consequential path may proceed on
(§14.1).

### 9.5 Historical continuity

Every Step 2 governed instance MUST remain resolvable indefinitely. No governed
instance may be deleted, and no registry entry may be removed
(Step 1 §5.3).

A historical reference MUST NOT be repointed in place. A reference recorded
against an exact governed instance continues to denote that instance
(Step 1 §5.3, L-1).

Any governance act, validation determination, adjudication, or traceability
chain that relied on a governed instance MUST remain reconstructable against
the exact instance it relied upon.

An audit trail that can no longer show what the evidence, the wording, or the
competing positions actually said at the time is not an audit trail.

## 10. Conflict and Contradiction

### 10.1 Conflict is governed state

Conflict between governed evidence, claims, sources, or determinations is a
first-class governed state. It is not an error condition, not a data-quality
defect, and not a temporary state to be cleared.

Conflict MUST be representable, traversable, and resolvable to the exact
governed instances that disagree.

Conflict MUST remain visible to authorized interpretation and review. It MUST
NOT be hidden behind an aggregate, a summary, or a preferred answer.

### 10.2 Contradiction relations

A contradiction is expressed as a governed relation between exact governed
instances (§5.5), or as a typed evidence link carrying a contradicting role
(§6.2).

A contradiction relation MUST name both sides as exact governed instances, and
MUST carry its scope qualification, so that a contradiction holding only within
a stated population, developmental band, or context is not represented as a
universal contradiction.

A contradiction relation is a governed assertion in its own right. It is itself
subject to evidence linking (§6.1), and it is itself correctable only by a new
record (§9.2).

### 10.3 Competing positions

Where several governed positions bear on one question, each participating
position MUST be representable as a first-class governed object carrying, at
minimum, the exact governed instance holding the position, its stance relative
to the question, its typed evidence, and its contextual qualifiers.

A participating position is immutable once it has been included in an
adjudication or review. Correction creates a new position (§9.2).

Historical adjudications MUST remain reconstructable against the original
positions they considered (§9.5).

### 10.4 Adjudication does not erase

Adjudication of a conflict MUST NOT replace or erase supporting positions,
conflicting positions, or contextual qualifiers.

An adjudication is a governed decision record. Re-adjudication supersedes
rather than overwrites, and the earlier adjudication and the positions it
weighed remain resolvable.

A single outcome value plus a single confidence value MUST NOT be used to
represent the state of a scientific disagreement. That representation destroys
precisely the information a counselor, reviewer, or auditor would need in order
to reason about a contested claim.

### 10.5 Prohibited resolutions

The following are prohibited as means of resolving or presenting conflict:

- averaging, summing, weighting, or otherwise numerically aggregating
  conflicting evidence or positions;
- silently replacing one conflicting object with another;
- omitting one side from a representation, traversal, or rendering;
- recording a preference without recording it as a governed adjudication with
  its own evidence and attribution;
- inferring consensus from the absence of a recorded conflict;
- treating the more recent object as authoritative by virtue of recency;
- treating the more numerous side as authoritative by virtue of count;
- deleting, downgrading, or unlinking contradicting evidence in order to
  present a cleaner support picture (§6.2).

Discrepancy is an inquiry signal, not an averaging target (§15).

Absence of a recorded conflict is not evidence of agreement. It is the
unknown state of §8.4, unless a governed determination establishes otherwise.

## 11. No Silent Source Replacement

### 11.1 The rule

A source, source expression, source manifestation, evidence anchor, governed
claim, citation target, or any other provenance-bearing dependency MUST NOT be
silently substituted with another object, however similar in meaning.

Where identity or evidentiary meaning matters, a substitute is a different
object and MUST be recorded as one.

### 11.2 What counts as prohibited substitution

The following are prohibited without an explicit governed act:

- repointing an existing anchor, link, derivation input, or relation endpoint
  to a different governed instance;
- replacing a source expression with a different edition, revision, or
  translation while retaining the original references;
- replacing a manifestation with a different acquired copy where a locator
  depends on the original;
- substituting a secondary source where a primary source was cited, or a
  primary where a secondary was cited;
- substituting a meaning-equivalent approximation, a summary, or a
  paraphrase for the cited object;
- substituting a re-anchored locator without recording the re-anchoring;
- resolving a broken reference to the nearest available alternative;
- allowing an ingestion, migration, or maintenance process to re-resolve a
  reference by title, label, identifier similarity, or search.

Elevating secondary evidence to primary standing, and converting derived
content into source fact, are prohibited in every case (§2.5).

### 11.3 Permitted re-anchoring

Re-anchoring is permitted only as an explicit governed act that creates a new
evidence anchor and records the replacement relationship (§4.4).

The superseded anchor remains resolvable, and every prior reference to it
continues to resolve to it. A governance act that relied on the superseded
anchor is never retroactively described as having relied on the new one
(§7.3, §9.2).

A re-anchoring act MUST record what changed and why, and MUST be attributable.

### 11.4 Failure behaviour

Where a provenance-bearing dependency cannot be resolved to the exact governed
instance it names, the dependent consequential path MUST FAIL CLOSED (§14.1).

It MUST NOT proceed on a substitute, a nearest match, a parent object, a later
version, or a default.

An unresolvable dependency is a governance fault where the reference should
have remained resolvable, and MUST be raised as a governance event rather than
silently repaired.

## 12. Machine-Traceable Citation and Provenance Navigation

### 12.1 Forward and backward traversal

The substrate MUST support deterministic traversal in both directions where the
relationship is defined:

- from a governed knowledge object version forward through its typed evidence
  links, anchors, expressions and sources, and through any derivation record to
  its exact inputs;
- from a source, expression, anchor, or governed input backward to the governed
  objects that reference it.

Backward traversal MUST NOT be treated as an assertion of support. That an
object references an anchor is established by the link; what the reference
means is established by the link's role and support characterization
(§6.2, §6.3).

### 12.2 Determinism

Traversal MUST be deterministic. The same query over the same governed state
MUST yield the same result.

Traversal MUST NOT depend on string matching, label similarity, title matching,
naming convention, structural proximity, ordering, or heuristic selection.

Where more than one candidate satisfies a resolution that must yield one
result, the condition is a governance fault, the dependent path MUST FAIL
CLOSED, and no recency, priority, or ordering heuristic is authorized as a
tie-break (Step 1 §9.4, Step 1 §10.2).

### 12.3 Citation is a rendering, not the foundation

A citation is a human-readable rendering of structured bibliographic and
locator metadata that already exists in the source, expression, manifestation,
external-identifier and evidence-anchor objects.

A rendered citation string MUST NOT be the provenance foundation, MUST NOT be
an AUTHORITATIVE POINTER, and MUST NOT be the mechanism by which a reference is
resolved.

A citation rendering MUST be reproducible from the governed objects it renders.
Where a rendering and the governed objects disagree, the governed objects
control, and the disagreement is a fault to be reported rather than reconciled
by editing the rendering.

Storing a rendered string in place of the structured metadata is prohibited.
The citation-rendering architecture, template implementation and style
vocabulary are DEFERRED to a later controlled specification.

### 12.4 What traversal must never manufacture

Traversal MUST NOT create, infer, or imply:

- an evidence link that no governed link records;
- a derivation that no derivation record records;
- a support relationship from mere co-occurrence, shared source, or shared
  anchor;
- agreement from the absence of a recorded contradiction (§10.5);
- a CONTENT ORIGIN that no classification records (§2.6);
- a validation, approval, rights, or runtime state (Step 1 §8).

A traversal result is a report of governed state. It is never itself a
governance act, and it confers no eligibility.

### 12.5 Resolution failure behaviour

Where a required traversal step cannot be resolved, the traversal MUST report
the failure. It MUST NOT return a partial chain presented as complete, and MUST
NOT silently omit an unresolvable step.

Where the traversal supports a consequential path, that path MUST FAIL CLOSED
(§14.1).

## 13. Step 1 Integration Contract

### 13.1 No competing identity or version authority

Every Step 2 object that is a governance subject is a governed instance under
Step 1 §2.1, and carries its Step 1 registry identity as its own identity.

Step 2 introduces no second identity allocator, no second identity namespace,
no second versioning mechanism, and no second lifecycle authority.

No Step 2 attribute — including an external identifier, a domain code, a
locator, an integrity value, a citation string, or an ordering attribute — may
serve as a governed instance identity or as a governance-act target
(Step 1 §3.5, Step 1 §11.1).

Where Step 2 requires an identity, it uses the Step 1 identity. Where Step 2
requires a version, it uses the Step 1 version instance. Where Step 2 requires
an immutability boundary, it uses the Step 1 boundary for the applicable
pattern.

### 13.2 Family-to-pattern classification

Every Step 2 family carries the fixed Pattern A or Pattern B assignment
recorded in the controlled subject-type catalog. The catalog remains the single
authority for that assignment (Step 1 §2.5).

The assignments this specification relies upon are listed in §9.1. A mismatch
between a family's catalog assignment and its use here is a governance/schema
fault and MUST FAIL CLOSED (Step 1 §2.1).

Families whose assignment is not fixed MUST NOT be admitted to the catalog and
MUST NOT carry a consequential path (§3.5).

Catalog membership of any Step 2 family MUST NOT be interpreted as evidence
that any instance of it is immutable, approved, validated, runtime-available,
or eligible for a consequential governance act (Step 1 §2.5).

### 13.3 Immutability boundaries inherited unchanged

Pattern A Step 2 objects become immutable on exit from draft, and that exit is
irreversible (Step 1 §5.1, Step 1 §7.3).

Pattern B Step 2 objects become immutable at first governance use, as
enumerated in Step 1 §2.4, and boundary-crossed state is DERIVED
(Step 1 §5.2).

Step 2 defines no additional boundary, relaxes neither boundary, and creates no
exception to either.

The binding freeze rule of Step 1 §6.3 applies to every Step 2 binding family
that a controlled specification declares meaning-defining or
governance-bearing. Typed evidence links and derivation inputs are governed by
that rule wherever so declared; the declaration itself remains a family-level
specification property that no instance may override (Step 1 §6.2).

### 13.4 Referential rules inherited unchanged

Every authoritative Step 2 governance act cites the exact governed instance it
acted upon (Step 1 §11.1).

Family-restricted references are structurally typed by governed instance
identity together with subject family (Step 1 §11.2).

No authoritative polymorphism is introduced. The bounded append-only audit and
event exception of Step 1 §11.4 remains bounded to audit and event logging and
is not extended by this specification.

Registry entry and concrete instance come into existence together
(Step 1 §11.5).

Stable-identity references are permitted only where the intended semantic
target is explicitly the enduring conceptual object, and any resolution to an
exact instance is itself governed, auditable, and fail-closed
(Step 1 §11.6).

### 13.5 Lifecycle axes inherited unchanged

The four Step 1 lifecycle axes remain independent. Step 2 adds no fifth axis and
introduces no master lifecycle state.

CONTENT ORIGIN, evidence status, source availability, epistemic
characterization and support characterization are Step 2 determinations. None
of them is a lifecycle axis, none may be derived from a lifecycle axis, and
none may be combined with one (§8.1, Step 1 §8.5).

Approval and validation remain DERIVED and never self-granted
(Step 1 §8.2). Runtime availability remains DERIVED from the activation and
quarantine event chain (Step 1 §8.3). Nothing in Step 2 confers either.

### 13.6 Prohibited redefinitions

Step 2 MUST NOT, and does not:

- redefine governed instance, governed object, governed version, or governed
  record;
- alter registry membership rules;
- alter the derivation of `pattern` from `subject_type`;
- alter either immutability boundary;
- alter the irreversibility of draft exit;
- alter correction, supersession, or historical-preservation rules;
- alter the fail-closed rules of Step 1 §10;
- alter the referential invariants of Step 1 §11;
- reclassify any family between Pattern A and Pattern B;
- close, downgrade, or reinterpret any carried finding.

Where a genuine conflict between this specification and Step 1 is discovered,
it MUST be reported for adjudication and MUST NOT be silently reconciled
(§1.4).

## 14. Fail-Closed Rules

FAIL CLOSED means the dependent action does not proceed. It does not mean
proceed with a warning, proceed with a default, or fall back to unconstrained
generation.

### 14.1 Unresolvable or insufficient evidence

A consequential path MUST FAIL CLOSED where, at minimum:

- a required typed evidence link does not exist, and only free-text commentary
  is present (§6.4);
- a required evidence anchor cannot be resolved to its exact governed instance
  (§11.4);
- a required source, expression, or manifestation can no longer be resolved
  (§8.3);
- a required DERIVED status cannot be established from authoritative evidence
  (§8.5);
- a required derivation input cannot be resolved to the exact instance the
  derivation names (§7.2);
- a required traversal step cannot be resolved (§12.5).

### 14.2 Unclassified content origin

A consequential path MUST FAIL CLOSED where the CONTENT ORIGIN of a required
governed object cannot be established (§2.6).

Unclassified content MUST NOT be treated as direct source evidence, and MUST
NOT be treated as unsupported, by default.

### 14.3 Unresolved conflict on a consequential path

Where a consequential path depends on a question on which governed evidence
conflicts, and no governed adjudication resolves that conflict for the
applicable scope, the path MUST FAIL CLOSED.

The path MUST NOT proceed by averaging, by selecting a side, by preferring
recency or count, or by omitting one side (§10.5).

Conflict itself is not a fault. Proceeding consequentially on an unadjudicated
conflict is.

### 14.4 Unresolved source or classification authority

A consequential path MUST FAIL CLOSED where:

- an expression-identity determination required by the path has not been made,
  or cannot be resolved to its exact governed instance (§3.3);
- a family required by the path has no fixed pattern assignment (§3.5,
  §13.2);
- a binding family's meaning-defining classification cannot be established
  (Step 1 §6.2).

### 14.5 Absence is not evidence of absence

Absence of a record, a determination, a link, a conflict, or a status MUST NOT
be converted into an affirmative finding.

Specifically, and without exception:

- absence of evidence is not evidence of absence;
- absence of a recorded conflict is not agreement (§10.5);
- absence of a classification is not a classification (§2.6);
- absence of a rights determination is not permission;
- absence of a validation determination is not validation;
- absence of a human-review record is not review;
- absence of a recorded objection is not consent.

Where an affirmative condition is required and cannot be established, the
dependent path MUST FAIL CLOSED.

## 15. Scientific and Governance Invariants Preserved

This specification preserves the controlling scientific and governance
invariants. It does not weaken, replace, or authorize deviation from any of
them, and it introduces no evidence or provenance semantics that would weaken a
later-stage safeguard.

- RIASEC represents vocational interests. It MUST NOT be represented or
  interpreted as a measure of ability, intelligence, competence, or
  achievement.
- Developmental or grade scope is an applicability qualifier. It MUST NOT be
  converted into a deterministic assertion that an individual is in a
  particular developmental stage.
- There is no master score. Independent dimensions, evidence channels, gates,
  or assessments MUST NOT be summed into a single global score, and no
  epistemic or support characterization may become one (§5.4, §6.3).
- Self-efficacy remains a process, intervention, and outcome construct. It MUST
  NOT be converted into an additional assessment.
- Complementary channels are non-additive. Their results MUST NOT be summed or
  averaged merely because they address related questions.
- Discrepancy between channels is an inquiry signal. It MUST NOT be treated as
  an averaging target whose purpose is to erase disagreement (§10.5).
- Contradictory or discrepant evidence MUST remain visible to authorized
  interpretation and review. It MUST NOT be merged, deleted, averaged, or
  normalized away to force apparent coherence (§10).
- Consequential AI-supported interpretation requires meaningful human review,
  and an authorized human reviewer MUST retain the ability to override or
  withhold the proposed interpretation or action.
- For participants under 18, a consequential decision MUST NOT be made solely
  by an automated system. Applicable parent or guardian permission, student
  assent, and the communicated limits of confidentiality remain controlling
  safeguards.
- Scientific validation and rights authorization are distinct governance
  questions. Neither substitutes for the other (§4.3).
- Contextual validity and translation fidelity are distinct determinations.
  Neither establishes the other (§5.3).
- Data minimization applies. Information not necessary for the authorized
  purpose MUST NOT be collected, transferred, retained, or exposed merely
  because a system is capable of processing it.
- Student-linked or student-level operational data MUST NOT enter the canonical
  knowledge substrate, and runtime decision provenance remains outside it
  (§7.4).
- Documentation completeness is NOT evidence completeness. The existence of a
  specification does not establish that the required evidence, rights,
  validation, safety, or governance conditions have been satisfied.
- Absence of evidence, rights, validation, safeguarding approval, or explicit
  owner authorization is NOT permission (§1.3, §14.5).
- Lifecycle axes MUST NOT be arithmetically combined, and there is no master
  lifecycle state (Step 1 §8.5, §8.1).

No later realization of this specification may silently weaken these
constraints. Where a later realization and these constraints conflict, the
conflict MUST be reported and adjudicated, and MUST NOT be silently reconciled.

## 16. Open, Affirmed, and Deferred Register

This register records the disposition of carried findings as they stand after
Step 2. No finding is closed by this specification. Recording a finding here is
registration, not resolution.

### 16.1 OPEN — F-04, F-07, M-1

**F-04 — dependency re-binding workflow. OPEN.**

The policy and classification constraints remain as settled in Step 1 §6. Step 2
inherits the freeze rule for its binding families without relaxation
(§13.3). The workflow realization — the triggers requiring re-binding, the
authority required, the identification of affected dependents, and the
fail-closed maintenance of unresolved consequential paths — remains
unspecified. Step 2 does not specify it and does not require its closure.
F-04 is NOT closed.

**F-07 — current-version resolution and cardinality. OPEN.**

Step 2 depends on Step 1 §9 for any resolution of a current version, and adds a
determinism requirement of its own for traversal (§12.2). Both fail closed on
zero and on more than one eligible result, and neither authorizes a heuristic
tie-break. The applicability inputs of the Step 1 predicate remain unspecified.
Step 2 supplies none of them. F-07 is NOT closed.

**M-1 — source-hierarchy and external-identifier pattern assignment. OPEN.**

*Previous disposition:* OPEN, carried from Owner Gate 0 §7.5 through Phase 1.

*Step 2 impact:* Step 2 discharges the Gate 0 §7.5 requirement to address the
levels explicitly (§3.5). It fixes that the bare source, source-expression and
source-manifestation identity levels are NOT governed instances and are never
authoritative governance-act targets, and it makes normative that
source-identity governance MUST cite the exact governed descriptor or
determination instance. It does NOT fix whether the governance-bearing
descriptor, identity-determination and external-identifier-attachment families
are Pattern A or Pattern B, because no controlling source fixes that and
selecting between the two admissible realizations would be invention.

*Proposed disposition:* remain OPEN, with the scope of what remains open now
narrowed to a single question — the pattern assignment of those three
governance-bearing families.

*Consequence while open:* those families MUST NOT be admitted to the
subject-type catalog, and no consequential path may depend on them
(§3.5, §14.4).

*Owner adjudication required:* yes. M-1 is NOT closed by this specification.

### 16.2 AFFIRMED CONSTRAINT — L-1

**L-1 — immutable binding constraint. AFFIRMED CONSTRAINT.**

Historical bindings and historical references are immutable and MUST NOT be
repointed in place. Step 2 restates and extends the constraint to its own
families through §9.5, §11.2 and §11.3, and adds no exception to it.

L-1 is not an independent open work item, and MUST NOT be recorded as DEFERRED.

### 16.3 CONFIRMED STRENGTH / NO ACTION — N-1

**N-1. CONFIRMED STRENGTH / NO ACTION.**

N-1 is recorded as a confirmed strength. Step 2 produced no contradictory
evidence and does not reopen it. It is not an open defect, requires no
corrective action, and MUST NOT be represented as an unresolved finding
requiring remediation. It MUST NOT be recorded as DEFERRED.

### 16.4 DEFERRED — F-05, F-06, F-08, F-09, F-10, F-11, F-12, F-13, F-14, M-2

The following findings remain DEFERRED. No closure is claimed for any of them:

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

Four of these are materially touched by Step 2 without being advanced or
closed:

- **F-05** is touched by §6.5, which requires one coherent evidence-linking
  concept reaching validation determinations. Step 2 does not specify the
  citable identity of a validation determination.
- **F-08** is touched by §3.1 and §8.3, which require expression-level binding
  and distinguish availability from validity. Step 2 states no convention for
  continuously revised web sources.
- **F-09** is touched by §4.3, which requires a rights or document anchor
  concept participating in the same linking pattern. Step 2 specifies no
  physical rights-document entity.
- **F-14** is touched by §12.3, which fixes citation as a reproducible
  rendering rather than the foundation. Step 2 specifies no contributor
  normalization and no citation sequencing, and the Gate 0 §7.4 sequencing
  constraint — contributor normalization ahead of citation rendering — is
  carried unchanged and unclosed.

The Gate 0 §7.4 constraint that the validation applicability matrix must be
produced before any activation logic is specified is likewise carried unchanged
and unclosed.

### 16.5 Step 2 boundary deferrals

The following are DEFERRED to later controlled steps or specifications and are
outside the Step 2 scope:

- the evidence-status vocabulary values (§8.2);
- the evidence-role vocabulary values (§6.2);
- the epistemic and support characterization vocabularies (§5.4, §6.3);
- the content fingerprint algorithm (§3.3);
- the controlled external-identifier scheme vocabulary and level-aware
  attachment structure (§3.4);
- the pattern assignment of the source-descriptor, identity-determination and
  external-identifier-attachment families (§3.5);
- whether any evidence-anchor version family is ever warranted (§4.2);
- scope qualification and the realization of partial supersession (§9.3);
- the citation-rendering architecture, templates and style vocabulary (§12.3);
- locator-type vocabulary and structural locator schemes (§4.1);
- derivation-type vocabulary (§7.2);
- the design of any runtime provenance store (§7.4).

A deferral is not a decision. No deferred item may be treated as resolved,
permitted, or authorized because it is recorded here.

## 17. Explicit Non-Authorization

This specification authorizes none of the following:

- SQL or DDL;
- physical database types, keys, indexes, constraint syntax, or triggers;
- migrations;
- Supabase schema, security, or configuration changes;
- RLS policies, grants, or RPC definitions;
- deployment to any environment;
- production changes or production access;
- data ingestion, automated extraction, or acquisition pipelines;
- embeddings, vector storage, or retrieval-augmented generation;
- RGIM or agent production implementation;
- runtime provenance implementation;
- operational scoring-channel correspondence implementation;
- scoring-engine changes;
- automated consequential-decision implementation;
- student-data processing;
- citation-rendering implementation;
- repository staging, commit, push, pull-request creation, or merge.

This specification makes no claim of:

- production readiness;
- scientific validation;
- psychometric validation;
- rights clearance;
- contextual validation;
- translation fidelity determination;
- safeguarding clearance;
- closure of any carried finding.

Describing a behaviour in this model does not authorize implementing it. Each
such action or determination requires its own authorization at its applicable
gate, and approval in one context does not extend to another.

Later physical realization MAY realize the semantics specified here. It MUST
NOT weaken, reinterpret, or bypass the governance constraints stated here
(§1.3).

## 18. Next Controlled Step

Step 2 defines the knowledge-object, evidence, source, derivation, provenance
and citation substrate only.

Work that builds on this substrate is not authorized by it. Continuation
requires, at minimum:

- a Step 2 integration review against the controlling canonical entity model,
  the Owner Gate 0 Adjudication Record, and the accepted Step 1 specification;
- an owner closure decision for Step 2;
- separate owner authorization for any later step.

Findings recorded as OPEN in §16.1 remain OPEN after Step 2. Their resolution
is later controlled work and is not authorized here. In particular, the
narrowed M-1 question of §3.5 requires owner adjudication before the affected
families may enter the subject-type catalog.

Completion of this document does not by itself close any carried finding, does
not confer an evidence level on prior or future work, and does not convert
documentation completeness into scientific, rights, validation, safety,
operational, or production-readiness evidence.
