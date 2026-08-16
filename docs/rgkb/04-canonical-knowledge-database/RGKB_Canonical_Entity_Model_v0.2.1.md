# RGKB Canonical Entity Model v0.2.1

- Status: CONTROLLED AMENDMENT — ARCHITECTURE ONLY
- Phase: 7.0 — Canonical Knowledge Database Foundation
- Supersedes: RGKB Canonical Entity Model v0.2 (controlled revision), which superseded v0.1 (architecture review baseline)
- Basis: v0.2 independent review found **NO NEW BLOCKER**; review recommendations **R-02 CLOSED** and **R-03 CLOSED**; **R-01 PARTIALLY CLOSED**; advancement was withheld **only** for preconditions **F-01**, **F-02**, and **F-03**, followed by owner adjudication of those three findings
- Amendment scope: F-01, F-02, F-03 only. Findings F-04 through F-14 are **not** resolved here and remain tracked for Controlled Schema Specification
- Implementation status: NO DATABASE MIGRATION AUTHORIZED
- Production status: NOT AUTHORIZED
- Retrieval / embeddings status: DEFERRED

---

## 1. Status and Authority

### 1.1 What this document is

v0.2.1 is the owner-adjudicated **controlled amendment** of the Phase 7.0
canonical entity model for the RasDaEdzeb / Career Development Research-Grounded
Knowledge Base (RGKB).

v0.2 remains the reviewed architectural baseline. The independent review of v0.2
recorded **no new blocker**, closed **R-02** and **R-03**, partially closed
**R-01**, and withheld advancement solely on three preconditions:

- **F-01** — governed-object immutability coverage;
- **F-02** — localized governed text version traceability;
- **F-03** — canonical scale ↔ operational scoring-channel correspondence.

This amendment carries the v0.2 architecture forward unchanged and resolves
**only** those three preconditions. It is not a redesign, and it does not reopen
any other accepted v0.2 decision.

Findings **F-04 through F-14** from the same review are **deliberately not
resolved here**. They remain deferred to Controlled Schema Specification exactly
as the independent review determined.

### 1.2 What this document is not

This document is **architecture only**.

It does not authorize, and must not be read as authorizing:

- SQL, DDL, or migration authoring;
- schema deployment to any environment;
- production data ingestion;
- direct client access to canonical RGKB objects;
- embeddings, vector storage, or retrieval-augmented generation;
- RGIM production integration;
- automated consequential decision-making.

It does **not** state or imply that Controlled Schema Specification is approved.

### 1.3 Naming convention used here

Entity names in this document are **conceptual handles**, written for review
legibility only. Where a handle resembles a table name (for example
`rgkb.knowledge_unit_version`), it denotes a *conceptual entity*, not an
authorized physical table, column set, key, or constraint.

Physical naming, keys, constraints, enum-versus-reference-table choices,
normalization decisions, and index strategy are all reserved for the
Controlled Schema Specification stage (§26).

### 1.4 Authority of the adjudicated decisions

The decisions recorded in §5–§25 are owner-adjudicated. Within Phase 7.0 they
are settled architecture. They are not presented as optional alternatives and
must not be reopened as such by downstream design work; they may only be
changed by a new owner adjudication.

The amendments introduced by v0.2.1 (§5.7, §9.2.1, §10.4, §10.7, §11.1, §12.3,
§13.2, §18.6, §22, §23, §26.6) carry the same authority. Every other section
carries forward its v0.2 authority unchanged.

---

## 2. Purpose

The RGKB exists to hold a machine-readable **canonical scientific knowledge
layer** for a school-based career-development ecosystem serving grades 7–12,
whose outputs may be consequential for minors.

The model must preserve, as first-class and separately governable facts:

- source identity, edition identity, and acquired-copy identity;
- rights and licensing determinations, with their evidence;
- knowledge-unit granularity and immutable versioned meaning;
- typed evidence and canonical scientific provenance;
- construct semantics and instrument/scale semantics;
- relationships among knowledge claims, including disagreement;
- multidimensional validation and attributable human review;
- scientific guardrails as executable, governed objects;
- interpretation rules bound to the knowledge and guardrails they depend on;
- localization of governed human-readable text, with exact localized-text
  version identity (§18.6);
- lifecycle, approval, activation, and supersession state;
- curation and governance provenance;
- the boundary to runtime decision provenance held outside the RGKB;
- the boundary at which canonical scientific scale identity is correlated to
  operational scoring channels held outside the RGKB (§10.7).

The canonical RGKB is not a content-management system, not an assessment-results
store, not a student-data store, and not an AI prompt repository.

---

## 3. Architectural Boundaries

### 3.1 Schema boundary

Canonical scientific knowledge lives in a dedicated PostgreSQL schema:

`rgkb`

This decision from v0.1 is preserved.

### 3.2 Presentation boundary

`public.knowledge_resources` remains a **separate presentation / CMS layer**.

It is not the canonical scientific source of truth. Publication into a
presentation layer is a governed projection of canonical knowledge, never a
substitute for it, and never a back-door writer into it.

### 3.3 Operational-data boundary

Assessment results, student profiles, parent/counselor relationships, session
records, and any other minors' personal data are **operational student data**.

They are not canonical knowledge and must never be stored in `rgkb`.

The RGKB describes *what is scientifically known and how it may be used*. It
does not describe *any individual student*.

Where an operational scoring result must be shown to correspond to a canonical
governed scale, that correspondence is owned by the operational domain and is
governed as a boundary artefact (§10.7). It does not move student data into
`rgkb`, and it does not move unstable operational identifiers into canonical
scientific identity.

### 3.4 Conceptual boundaries preserved from v0.1

1. Knowledge is distinct from interpretation.
2. Constructs are distinct from assessment results.
3. Evidence is distinct from validation.
4. Scientific validity is distinct from rights clearance.
5. Georgian contextual validation is distinct from original-source validity.
6. Guardrails are not recommendations.
7. Publication resources are not canonical knowledge.

### 3.5 Target flow

Authoritative Sources
→ Source / Expression / Manifestation characterization
→ Rights determination
→ Evidence anchoring
→ Knowledge Unit versions
→ Constructs / Instruments / Scales / Relations
→ Validation and human review
→ Guardrail versions and Interpretation Rule versions with explicit bindings
→ RGIM or application runtime
→ Controlled application output or publication projection

Every arrow in this flow is a governed transition, not an implicit data flow.

---

## 4. Scientific and Governance Invariants

These invariants bind all downstream design. v0.1 invariants are retained and
extended.

### 4.1 Retained from v0.1

1. Source is not the same entity as an edition of that source.
2. Source is not the same entity as a Knowledge Unit.
3. Knowledge Unit is not the same entity as Citation.
4. Knowledge Unit is not the same entity as Interpretation Rule.
5. Evidence is not the same entity as Validation.
6. Scientific validation is independent from rights clearance.
7. Georgian contextual validation is independent from original-source validity.
8. Guardrails are not recommendations.
9. Assessment results are not canonical knowledge.
10. Publication resources are not canonical knowledge.
11. There is no universal master validation score.
12. Conflicting evidence must not be silently averaged.
13. Contradictions must be preserved as explicit relations or validation findings.
14. Consequential machine-generated interpretations must be traceable backward to evidence.
15. Every machine-consumable rule must have lifecycle and version state.
16. RIASEC interest results must not be represented as measures of ability.
17. Self-efficacy is a process / intervention / outcome construct and must not be
    converted into an additional assessment merely for integration convenience.
18. Cross-assessment channels are complementary and non-additive.
19. Discrepancy across assessment channels is an inquiry signal, not an averaging target.
20. Consequential AI interpretation requires an appropriate human-review boundary.

### 4.2 Added in v0.2

21. **Immutability invariant.** Governance-bearing semantic content, once it
    leaves draft or crosses the governance immutability boundary (§5.7.3), is
    immutable. Correction is expressed by a **new immutable governed instance** —
    a new version under a stable identity (Pattern A, §5.7.1) or a new
    append-only governed record (Pattern B, §5.7.2) — never by editing history.
    *(Refined in v0.2.1 so that the invariant covers all governance-bearing
    objects without forcing an identity/version family onto atomic records.)*
22. **Provenance-separation invariant.** Canonical scientific provenance and
    runtime decision provenance are distinct chains held in distinct domains.
    Student-linked runtime records never enter `rgkb`.
23. **Binding invariant.** Governance relationships between rules, guardrails,
    knowledge, and constructs are first-class typed relationships, never
    free-text scope matching.
24. **Typed-evidence invariant.** The authoritative evidence pointer is always a
    typed relationship to an evidence anchor. Free text may annotate; it may
    never be the authoritative pointer.
25. **Fail-closed invariant (rights).** Absence of an explicit applicable
    permission is not permission.
26. **Fail-closed invariant (governance).** A rule or output path whose required
    evidence, guardrail, validation state, rights state, or required human
    review is missing, invalid, superseded, unavailable, or unevaluable must
    fail closed.
27. **Guardrail precedence invariant.** A binding guardrail prohibition overrides
    a conflicting interpretation-rule permission or output constraint.
28. **Non-arithmetic epistemics invariant.** Epistemic and support labels are
    controlled, ordinal where appropriate, non-arithmetic, non-additive, and
    non-averaged across layers.
29. **No-master-score invariant.** See §4.3.
30. **Referential-governance invariant.** Authoritative governance state must
    not depend on unconstrained polymorphic references.
31. **Single-writable-truth invariant.** The same governed fact must not have two
    independently writable representations.
32. **Localization invariant.** Canonical governed text declares its language;
    a translation does not inherit the validation state of its source-language text.
33. **Executable-specification invariant.** Machine-consumable rule content must
    be expressed in a named, versioned, validated specification language, never
    as free-form prompt text or undocumented ad-hoc JSON.
34. **Curation-boundary invariant.** Canonical knowledge is written through a
    bounded, authenticated, audited curation boundary — not by ad-hoc SQL as a
    normal practice.
35. **Retention invariant.** Retention of extracted verbatim source text is
    rights-conditioned, and is a separate question from permission to output or
    quote that text.

### 4.2.1 Added in v0.2.1

36. **Governed-subject-instance invariant.** Every governance act — review,
    validation, binding, adjudication, activation, runtime use — records the
    **exact immutable governed subject instance** it acted upon: a version
    identifier for a Pattern A object, a record identifier for a Pattern B
    object. Acting on "whatever the current object is" is never sufficient
    (§5.7.5, §12.3).
37. **Localized-text version invariant.** Canonical governed localized text has
    its own immutable version identity. Knowing which Knowledge Unit version was
    used does **not** establish which governed Georgian wording a student,
    parent, counselor, or reviewer actually saw. Consequential runtime
    provenance and source-to-answer traceability must resolve the exact
    localized-text version used (§18.6, §22.2, §23).
38. **Governed-correspondence invariant.** An operational scoring result may
    enter a consequential interpretation path only through an explicit,
    auditable, version-aware governed correspondence to a canonical RGKB
    instrument-scale identity. String matching, naming conventions, and
    free-text assessment-type labels are not an authoritative correspondence
    mechanism. Unresolvable correspondence fails closed (§10.7).

### 4.3 No master score, no hidden averaging

**Invariant (binding, non-negotiable within Phase 7.0):**

Evidence strength, epistemic certainty, validation status, cross-source
adjudication, assessment scales, and rule applicability **must not** be
arithmetically collapsed into a universal confidence value, a composite
validity index, or any master score.

There must be no averaging, summing, weighting, or other numeric aggregation
across:

- assessment channels;
- evidence roles;
- validation dimensions;
- conflicting sources;
- constructs;
- localization variants;
- lifecycle axes.

Release and activation gates are expressed as **conjunctive criteria over
independent dimensions** — each required dimension must independently hold —
never as a weighted score crossing a threshold.

Any future quantitative aggregation would require a separately governed,
scientifically validated specification, explicitly authorized by the owner, and
is out of scope here.

---

## 5. Identity, Immutability, Versioning, and Supersession

*(Owner adjudication A, I, N; extended by v0.2.1 finding F-01)*

### 5.1 The identity / version split

Governance-bearing semantic content uses a two-level structure:

1. **Stable identity** — the enduring conceptual object. It has a stable
   internal key and a stable human-readable code. It carries no semantic
   payload that governance depends on.
2. **Immutable version** — a specific, historically fixed expression of that
   object's meaning at a point in governance time. It carries the semantic
   payload.

This applies at minimum to:

- Knowledge Units;
- Guardrails;
- Interpretation Rules;
- Construct definitions;
- Rights decisions.

Illustrative conceptual pairs:

- `rgkb.knowledge_unit` / `rgkb.knowledge_unit_version`
- `rgkb.guardrail` / `rgkb.guardrail_version`
- `rgkb.interpretation_rule` / `rgkb.interpretation_rule_version`
- `rgkb.construct` / `rgkb.construct_definition_version`
- `rgkb.rights_declaration` / `rgkb.rights_decision_version`

This structure is **Pattern A** in the coverage model of §5.7. It is not the
only legitimate immutability pattern, and it must not be applied mechanically to
every governance-bearing object.

### 5.2 Draft mutability and the immutability boundary

- While a version is **explicitly in draft**, its content may be edited freely.
- Once a version **exits draft** — that is, once it becomes eligible to be
  reviewed, validated, bound, activated, or referenced by any governance or
  runtime artefact — its semantically meaningful content is **immutable**.
- Correction after that point requires creating a **new version**.
- Historical versions remain **resolvable indefinitely**, including versions
  that were superseded, retracted, or quarantined.
- Purely non-semantic administrative annotation (for example an internal
  handling note that no governance decision depends on) may remain mutable, but
  must never be the carrier of governed meaning. See §9.4 and §22.4.

The equivalent boundary for objects that do not carry an identity/version family
is defined in §5.7.3.

### 5.3 What downstream references must point at

Downstream artefacts must reference the **immutable governed instance identity**
wherever historical meaning matters — the version identity for a Pattern A
object, the immutable record identity for a Pattern B object (§5.7). This
includes:

- evidence links;
- validation and review decisions;
- governance bindings between rules, guardrails, knowledge, and constructs;
- localized governed text actually rendered (§18.6);
- runtime traceability records held outside `rgkb`;
- future embeddings (§25).

Referencing only the stable identity is acceptable only where the reference is
deliberately "whatever the current governed version is" *and* the resolution of
"current" is itself governed and auditable. Wherever an audit must reconstruct
what was true at the time, the immutable governed instance identity is mandatory.

### 5.4 The mutable-integer-version prohibition

A mutable integer `version` column on a single mutable row — as appeared in the
v0.1 `guardrails` and `interpretation_rules` sketches — **must not be the sole
version mechanism**. It records that change happened while destroying what was
replaced, which defeats §4.2(21) and §23.

A monotonic sequence number *within* a version chain remains acceptable as an
ordering attribute of distinct immutable version rows.

### 5.5 Version revision versus conceptual supersession

These are different facts and must not share one representation.

| | **Version chain** | **Supersession relation** |
|---|---|---|
| Meaning | A revised representation of *the same* governed concept or assertion | One *distinct* conceptual object replacing, narrowing, or invalidating another |
| Subject | One stable identity, many versions | Two (or more) distinct stable identities / versions |
| Example | KU statement re-worded for accuracy; guardrail text clarified | A 2019 finding invalidated by a 2024 replication; a broad claim narrowed to a specific population |
| Representation | Version lineage under one identity | A typed relation between governed objects |

**Partial supersession is a required semantic capability**: object B may
supersede object A *only for a specified scope* (a population, a developmental
band, a context, a construct), leaving A authoritative elsewhere. The
architecture requires this capability; its exact representation is a Controlled
Schema Specification topic (§26).

### 5.6 Stable human-readable codes

*(Owner adjudication N)*

Human-readable domain codes must be:

- **semantics-free** — they encode no chapter, source, position, topic, or order;
- **immutable** — never edited once allocated;
- **never reused** — a retired code is never reissued;
- **never re-pointed** — a code never comes to denote a different object;
- **collision-safe** — centrally allocated, or otherwise structurally guaranteed unique.

The v0.1 example `KU-001-CH5-014` is **rejected**: it embeds source and chapter
placement, both of which can change without the assertion changing, and both of
which become false labels after re-editioning.

Acceptable illustrative form: `KU-000123`. The exact allocation format,
allocation authority, and check-character strategy remain open (§26).

Three identifier families remain separate and must not be conflated:

1. **Database identity** (for example UUID) — internal referential identity.
2. **Human-readable domain code** — stable citation and conversation handle.
3. **External identifiers** (DOI, ISBN, O\*NET code, ISSN, handle, accession) —
   belong to the level-aware external identifier structure of §6.4.

### 5.7 Governed-object immutability coverage

*(v0.2.1, finding F-01 — ACCEPT WITH MODIFICATION)*

The v0.2 identity/version architecture was clear for Knowledge Units,
Guardrails, Interpretation Rules, Construct definitions, and Rights decisions.
Several other governance-bearing objects sit on historical traceability paths
without an explicit immutability model. v0.2.1 closes that coverage gap.

The correction is **not** to give every entity an identity/version pair. Two
patterns are legitimate, and each governance-bearing object must be assigned to
exactly one of them.

#### 5.7.1 Pattern A — versioned governed object

Use when **one enduring conceptual object may carry multiple governed semantic
revisions over time**.

Conceptual structure:

**stable identity + immutable semantic versions**

- The stable identity endures and carries no governance-bearing payload.
- Each governed semantic revision creates a **new version**.
- Historical versions remain resolvable indefinitely.

Applies at minimum to the objects listed in §5.1.

#### 5.7.2 Pattern B — immutable append-only governed record

Use when the object **is itself an atomic historical assertion, evidence
location, relation, position, or event** — something whose correction is not a
"revision of the same thing" but the recording of a different thing.

Conceptual structure:

**immutable append-only governed record**

- Once the record is referenced by a non-draft governed version, or used in a
  governance decision, its semantic content is **immutable**.
- Correction creates a **new record**; the governance relationship between the
  old and new record (replacement, supersession, correction) is itself governed.
- The old record remains **resolvable** and is **never silently rewritten**.

Applies at minimum to: evidence anchors (§9.2.1), knowledge-unit relations
(§11.1), cross-source participating positions (§13.2), governance and audit
events (§21), and review/decision events (§12.2).

#### 5.7.3 The governance immutability boundary

Neither pattern permits in-place mutation of historical governed meaning.

For **Pattern A**, the boundary is exit from draft (§5.2).

For **Pattern B**, the boundary is first governance use. A Pattern B record may
be authored and corrected while it has **not yet** crossed that boundary. It has
crossed the boundary once it is any of:

- referenced by a non-draft governed version;
- referenced by another non-draft governed instance;
- used by validation or review;
- included in an authoritative provenance chain;
- relied upon by an activation, adjudication, or runtime-eligibility decision.

After that point its semantic content is immutable, and correction proceeds by
new record.

#### 5.7.4 Coverage assignment

| Governed object | Pattern | Section |
|---|---|---|
| Knowledge Unit | A | §5.1, §8.2 |
| Guardrail | A | §5.1, §14.2 |
| Interpretation Rule | A | §5.1, §15.2 |
| Construct definition | A | §5.1, §10.1 |
| Rights decision | A | §5.1, §7.2 |
| Instrument / instrument version / instrument scale | A | §10.3 |
| Localized governed text | A | §18.6 |
| Evidence anchor | B | §9.2.1 |
| Knowledge-unit relation | B | §11.1 |
| Cross-source participating position | B (or A, per §13.2) | §13.2 |
| Construct ↔ scale mapping | A or B, per §10.4 | §10.4 |
| Review / decision event | B | §12.2 |
| Governance / audit event | B | §21.1 |
| Governance binding (rule ↔ KU, rule ↔ guardrail, …) | B | §16.1 |

Where the table records a choice ("A or B"), the **architecture requirement is
immutability and exact historical identity**; the physical realization is a
Controlled Schema Specification topic (§26.6).

#### 5.7.5 Governance acts record instances, not objects

Every governance act records the exact immutable governed **instance** it acted
upon (§4.2.1(36)):

- for a Pattern A object — the exact **version identifier**;
- for a Pattern B object — the exact **immutable record identifier**.

This replaces any reading of v0.2 that would require an artificial
identity/version family on an atomic record merely so that a "version" could be
cited. See §12.3.

---

## 6. Source / Expression / Manifestation Domain

*(Owner adjudication E)*

### 6.1 Three conceptual levels

v0.1's two-level `sources` / `source_versions` model conflated edition identity
with acquired-file identity. v0.2 replaces it with three levels.

**Level 1 — Source / Work** (`rgkb.source`)

The abstract intellectual identity: the work itself, independent of any
edition, translation, or copy.

Examples: a named theory monograph; a named technical manual; a named
professional framework; a named policy instrument.

**Level 2 — Expression / Edition** (`rgkb.source_expression`)

A specific intellectual form of the work: edition, revision, translation,
language-specific form, or officially revised release.

Examples: first edition; third revised edition; the Georgian translation; the
2018 revision of a framework.

**Level 3 — Manifestation / Acquisition Copy** (`rgkb.source_manifestation`)

A specific acquired representation: a publisher PDF, a repository PDF, a scan,
a print copy in hand, an archived HTML capture, a supplied data file.

Examples: publisher-supplied PDF with a given file hash; library scan with
different pagination; an archived snapshot of a web-published framework.

### 6.2 What binds where

- **Scientific evidence claims bind to the Expression.** A claim is about what a
  given edition says, not about which PDF the curator happened to download.
- **Physical pagination, byte offsets, file hashes, and acquisition provenance
  resolve at the Manifestation.** An evidence anchor may additionally reference
  a manifestation to make its locator physically resolvable.
- **Contributors, titles, and work-level identity resolve at the Source**, with
  expression-level overrides where an edition legitimately differs (added
  editors, translators, revised titles).

### 6.3 Fingerprints prove file integrity, not edition identity

A content fingerprint over an acquired file proves that *this file* has not
changed. It does **not** prove that the file is the edition it claims to be,
that two files are the same edition, or that a re-scan of the same edition is
equivalent.

Therefore:

- fingerprints are **manifestation-level integrity attributes**;
- edition identity is a **curated, evidence-backed determination**, subject to
  the `source_identity` validation dimension (§12.5);
- two manifestations of the same expression may legitimately have different
  fingerprints and different pagination.

The exact fingerprint algorithm is a Controlled Schema Specification topic (§26).

### 6.4 Level-aware external identifiers

DOI, ISBN, ISSN, URL, handle, accession numbers, and framework-specific codes
must **not** be hardcoded as columns belonging to exactly one fixed level. A
DOI may identify a work or a specific expression; an ISBN typically identifies
an edition-and-binding; a URL frequently identifies a manifestation.

The architecture anticipates a **level-aware external identifier structure**
(`rgkb.external_identifier`, conceptually) able to attach a typed identifier
value to the correct level of the source hierarchy — and, where relevant, to
other canonical objects such as constructs or instruments.

Its exact shape, controlled scheme vocabulary, and validation rules are a
Controlled Schema Specification topic (§26).

### 6.5 Contributors

Contributor normalization (authors, editors, translators, issuing bodies) and
contributor roles are recognized as required, and are deliberately deferred to
the Controlled Schema Specification stage (§26). The v0.1 free-text `authors`
field is noted as insufficient for citation generation (§24) and for
disambiguating same-named contributors, but resolving it is not a Phase 7.0
architecture blocker.

---

## 7. Rights Domain

*(Owner adjudication F, T)*

### 7.1 Why the v0.1 model is replaced

v0.1 represented rights as a small set of booleans on a single mutable row
(`quotation_allowed`, `derivative_extraction_allowed`, …) with a free-text
`evidence_reference`. That cannot express who granted what, to whom, for which
purpose, under which jurisdiction, until when, on what evidence, or what the
state was at the time an earlier decision was made.

### 7.2 Conceptual entities

**`rgkb.rights_declaration`** — the stable identity of a rights position held
about a governed subject (typically a source expression or manifestation).

**`rgkb.rights_decision_version`** — the immutable, versioned rights
determination. New facts, renegotiation, or revocation produce a new version;
prior versions remain resolvable so that any historical use can be audited
against the rights state that applied at that time.

**`rgkb.rights_permission`** — a specific typed permission or prohibition
carried by a rights decision version.

**`rgkb.rights_evidence`** — typed evidence supporting a rights decision (§9.5).

### 7.3 Required expressive capability

The architecture must support, at minimum:

- licence / right identity (named licence, negotiated grant, statutory basis);
- rights holder;
- jurisdiction;
- source of authority (licence text, publisher terms, correspondence, statute);
- permission type;
- **explicit allow or explicit deny** (not merely presence/absence);
- permitted purpose;
- audience / use scope;
- conditions (attribution, non-commercial, internal-only, embargo);
- quantitative limits where applicable (word counts, extract proportions, copies);
- `valid_from`;
- `valid_until`;
- revocation and supersession;
- typed rights evidence;
- immutable rights decision history.

### 7.4 Distinct permission types

At minimum these must be separately representable and separately determinable:

1. **internal analysis** — reading and analysing internally;
2. **extraction into canonical KUs** — deriving governed assertions;
3. **machine processing** — automated parsing, indexing, computation;
4. **quotation / storage** — retaining verbatim text (see §7.6);
5. **redistribution / publication** — outward-facing distribution;
6. **consequential student-facing generation** — use in output that reaches a
   minor, where legally or contractually relevant.

Permission for one does not imply permission for any other.

### 7.5 Fail-closed rights invariant

**Absence of an explicit applicable permission is not permission.**

Consequences:

- `unknown`, `not yet determined`, missing rows, and expired permissions are all
  treated as *deny* at the point of use;
- a permission that has passed `valid_until` is not applicable;
- a revoked or superseded permission is not applicable;
- legal permission and scientific validity are independent: a rights-clear
  source may be scientifically invalid, and a scientifically excellent source
  may be rights-blocked. Neither substitutes for the other.

### 7.6 Rights-conditioned excerpt retention

*(Owner adjudication T)*

Evidence anchors **may** carry retained extracted or verbatim source text —
**where retention is permitted**.

It is **not** declared that all source text must be retained.

Rules:

- retention of verbatim text is **rights-conditioned**;
- **retention permission and output/quotation permission are separate questions**:
  text may be lawfully retained internally yet not quotable outward, and text
  that could be briefly quoted is not thereby retainable at scale;
- when retention is not permitted, an anchor may still carry **locator +
  fingerprint + provenance**, with no stored copyrighted text — the anchor
  remains scientifically useful and re-resolvable against the manifestation;
- `anchor_text_hash` verifies the integrity of anchored text and is **not** a
  substitute for holding the text;
- curator notes and other free-text fields must **never** become an uncontrolled
  place to park rights-restricted source excerpts. Retention is a governed,
  typed, rights-checked act or it does not happen.

This decision is made **before** retrieval design (§25), because retrieval and
embedding design depend on whether text may be retained at all.

---

## 8. Knowledge Unit Domain

### 8.1 Definition

A Knowledge Unit (KU) is the smallest independently governable scientific or
professional assertion in the RGKB.

A KU is not:

- an entire chapter;
- an arbitrary paragraph;
- a quotation by itself;
- an AI recommendation;
- a student-specific interpretation;
- an assessment result.

### 8.2 Identity and version

**`rgkb.knowledge_unit`** — stable identity. Carries the immutable
semantics-free code (§5.6) and lineage pointers. Carries no governed statement text.

**`rgkb.knowledge_unit_version`** — immutable versioned content, including:

- the governed assertion (as localized governed text, §18);
- knowledge type;
- scope qualification: population scope, developmental scope, context scope;
- epistemic characterization (§8.4);
- provenance of the extraction act (§21).

### 8.3 What was removed from the v0.1 KU sketch

- `supersedes_ku_id` as a bare column is replaced by the explicit split of §5.5:
  revision belongs to the version chain; conceptual replacement belongs to a
  typed relation with scope qualification.
- A single `lifecycle_status` is replaced by the four independent lifecycle
  axes of §17.
- The `KU-001-CH5-014` code form is rejected per §5.6.
- Free-text evidence pointers are replaced by typed evidence links (§9.3).

### 8.4 Epistemic characterization is not a number

*(Owner adjudication K)*

Fields such as `certainty_level`, `support_strength`, and cross-source
confidence:

- use **controlled vocabularies**, ordinal where an ordering is scientifically
  defensible;
- are **non-arithmetic**: they are not added, multiplied, weighted, or averaged;
- are **non-additive across layers**: a KU's epistemic label is not computed
  from its evidence links' labels, and a rule's applicability is not computed
  from its KUs' labels;
- are **never** convertible into a universal confidence or master score
  (§4.3), unless a future separately authorized scientific specification
  explicitly defines such a measure and its validity conditions.

Terminology should avoid inviting false numeric precision. Prefer labels that
read as qualitative determinations (for example `well_established`,
`emerging`, `contested`, `single_source`) over anything that reads as a
percentage, probability, or score. Exact vocabularies remain open (§26).

---

## 9. Evidence and Canonical Provenance Domain

*(Owner adjudication B, D; extended by v0.2.1 finding F-01A)*

### 9.1 The two provenance chains

The RGKB holds **one** of the two provenance chains the system needs.

**Chain 1 — Canonical provenance (inside `rgkb`).**

Canonical knowledge/rule version
→ evidence
→ source expression
→ source

It answers: **"Why is this knowledge or rule scientifically justified?"**

**Chain 2 — Runtime decision provenance (outside `rgkb`, see §22).**

Actual RGIM / application output event
→ immutable interpretation-rule version(s)
→ guardrail version(s) and their evaluation outcomes
→ knowledge-unit version(s)
→ localized-text version(s) actually rendered
→ validation state used
→ rights state used
→ human-review event where required
→ model / provider / system version

It answers: **"What did the system actually use and do for this output?"**

These chains must not be merged. Runtime provenance is student- and
session-linked operational data; placing it in `rgkb` would put minors'
personal data into the canonical scientific schema. That is prohibited (§3.3).

### 9.2 Evidence anchors

**`rgkb.evidence_anchor`** — an exact, resolvable location within a source
expression, optionally resolved through a specific manifestation (§6.2).

Conceptual content:

- the source expression being anchored (scientific binding);
- an optional manifestation reference (physical resolution: pagination, file);
- locator type and locator payload (structural locators preferred over page
  numbers, since pagination varies across manifestations);
- character or span offsets **where available** (§25.2);
- `anchor_text_hash` for integrity;
- retained excerpt text **only where rights permit** (§7.6);
- extraction provenance (§21).

The model must support locator schemes other than page numbers.

#### 9.2.1 Evidence anchors are immutable append-only governed records

*(v0.2.1, finding F-01A)*

An evidence anchor follows **Pattern B** (§5.7.2).

An anchor **may** be authored and corrected while it has **not yet** crossed the
governance immutability boundary (§5.7.3).

Once an evidence anchor is any of:

- referenced by a non-draft Knowledge Unit version;
- referenced by another non-draft governed version;
- used by validation or review;
- included in an authoritative provenance chain,

its **semantic locator content becomes immutable**. This includes, where
applicable:

- the source-expression reference;
- the manifestation reference;
- the locator type and locator payload;
- page / section / paragraph / span coordinates;
- character or span offsets;
- `anchor_text_hash`;
- the retained excerpt identity and content, where rights permit retention (§7.6).

**If a locator or extracted passage later proves incorrect, the historical
anchor is not updated in place.** A **new evidence anchor** is created, and the
replacement / supersession relationship between old and new anchor is governed
as appropriate. Historical references continue to resolve to the original
anchor, so that any past decision remains reconstructable against the evidence
it actually cited.

Evidence anchors are **not** required to carry an artificial stable identity +
version family. Immutable append-only record semantics are sufficient for this
architecture. Should later schema design demonstrate a genuine need for an
anchor version family, that is a Controlled Schema Specification determination
(§26.6), not an assumption of this document.

### 9.3 Typed evidence links

*(Owner adjudication D — BLOCKER)*

Free-text fields such as `evidence_reference` and `evidence_basis` are
**removed from the authoritative governance path**. They cannot be validated,
cannot be traversed, and silently break when sources are re-editioned.

The authoritative evidence pointer is always a **typed relationship** from a
governed version to an evidence anchor.

**`rgkb.knowledge_unit_version_evidence`** — typed link carrying:

- the KU version;
- the evidence anchor;
- evidence role (for example primary, corroborating, contradicting, contextual);
- support characterization (controlled, non-arithmetic, §8.4);
- an optional free-text commentary field that is explicitly **not** the pointer.

The same typed-link pattern applies wherever governed objects need evidence —
guardrail versions, interpretation-rule versions, construct definition versions,
construct↔scale mappings, and cross-source positions. **One coherent
evidence-linking concept** is used throughout rather than a different ad-hoc
field per entity.

Free-text notes may provide commentary. They must never be the authoritative
evidence pointer.

### 9.4 Rights evidence needs its own anchor concept

Rights evidence is frequently *not* scholarly: a licence text, a permission
email, publisher terms-of-use, a contract clause, a statutory provision, or a
records-of-correspondence file.

Forcing these into scholarly-source semantics (author, publication year, page
range) is wrong. The architecture therefore anticipates a **rights-evidence /
document anchor** concept that participates in the same evidence-linking
pattern but resolves against rights documents rather than scientific
expressions.

Both scientific evidence anchors and rights/document anchors are reachable
through one coherent evidence-linking concept, so that "what evidence supports
this determination?" is one traversable question regardless of determination type.

Rights/document anchors follow the same Pattern B immutability semantics as
scientific evidence anchors (§9.2.1).

### 9.5 What canonical provenance is not

Canonical provenance does not record which student saw what, which session
produced what, or which prompt was sent. That is runtime provenance (§22).

---

## 10. Semantics: Constructs, Instruments, and Scales

*(Owner adjudication J; extended by v0.2.1 findings F-01B and F-03)*

### 10.1 Constructs

**`rgkb.construct`** — stable identity of a theoretical or applied construct.

**`rgkb.construct_definition_version`** — immutable versioned definition,
including localized governed label and definition text (§18), construct family,
measurement status, and developmental relevance.

Examples: RIASEC interest types; self-efficacy; career adaptability; Big Five
traits; work values; employability skills.

Construct-to-construct relations (hierarchy, facet, near-synonym, distinct-but-
correlated) are recognized as needed and deferred to the Controlled Schema
Specification stage (§26).

### 10.2 Why an instrument/scale registry is required

Guardrails such as **"RIASEC interest is not ability"** are only enforceable if
the architecture can name *the actual scale the runtime sees*. Without an
instrument/scale registry, such a guardrail can only be matched by free-text
scope strings — which §4.2(23) prohibits.

### 10.3 Registry entities

**`rgkb.instrument`** — stable identity of an assessment or instrument as a
scientific object (not as an implementation).

**`rgkb.instrument_version`** — immutable version: instrument revision,
question-set version, scoring-model version, adaptation/translation identity.

**`rgkb.instrument_scale`** — a scale, dimension, subscale, or scoring channel
belonging to an instrument version. This is the object a runtime score is
produced *for*.

**`rgkb.construct_scale_mapping`** — the governed claim that a given scale
relates to a given construct.

### 10.4 Mapping semantics are explicit and governed

Mappings carry explicit relationship semantics, at minimum:

- `operationalizes` — the scale is a governed measure of the construct;
- `partially_operationalizes` — the scale covers part of the construct;
- `proxy_for` — the scale stands in for the construct with known limitations.

Mappings are **themselves evidence-linked and validation-governable** (§9.3,
§12): the claim "this scale measures this construct" is a scientific claim and
is treated as one.

#### 10.4.1 Construct ↔ scale mappings are immutable after governance use

*(v0.2.1, finding F-01B)*

Because the construct↔scale mapping is itself a governed scientific claim, its
semantic content **must not be mutable in place after governance use**.

A mapping is therefore represented as **either**:

- a **versioned governed assertion** (Pattern A, §5.7.1) — a stable mapping
  identity with immutable mapping versions; **or**
- an **immutable append-only governed assertion** (Pattern B, §5.7.2) — whose
  correction creates a **replacement record**, with the replacement relationship
  governed.

The architecture requirement is **immutability and exact historical identity**:
any guardrail evaluation, interpretation-rule binding, validation determination,
or traceability chain that relied on a mapping must remain reconstructable
against the exact mapping instance it relied on. The choice between the two
physical realizations is a Controlled Schema Specification topic (§26.6).

### 10.5 Hard boundary

The instrument/scale registry describes **scientific instrument semantics only**.

It **must not** contain individual student assessment results, response data,
item-level responses, norms derived from this platform's live student data, or
any student-linked value. Those are operational data (§3.3).

### 10.6 KU-version ↔ construct mapping

**`rgkb.knowledge_unit_version_construct`** — typed mapping from a KU version to
a construct, with explicit relation semantics. A single KU may legitimately
address multiple constructs.

### 10.7 Canonical scale ↔ operational scoring-channel correspondence

*(v0.2.1, finding F-03 — ACCEPT WITH MODIFICATION)*

v0.2 correctly established canonical instrument identity, instrument version,
instrument scale/channel, and construct↔scale mapping inside RGKB, and correctly
kept individual student results outside RGKB (§10.5, §3.3).

The missing architectural seam is **how an actual operational scoring result is
proven to correspond to the canonical scale that guardrails and interpretation
rules govern**. Without that seam, a guardrail bound to a canonical RIASEC
interest scale cannot be shown to apply to the score the runtime actually
produced. v0.2.1 establishes that seam as a **governed correspondence boundary**.

#### 10.7.1 Ownership — F-03A

The correspondence is owned by the **application / integration / operational
domain**, **not** by the canonical scientific RGKB.

Reason: operational identifiers, code-level aliases, scoring-pipeline
identifiers, deployment-specific names, and assessment execution records belong
to the application implementation. They change for engineering reasons that
carry no scientific meaning. **RGKB must not absorb unstable implementation
strings as canonical scientific identity.**

#### 10.7.2 Canonical side — F-03B

RGKB exposes **immutable canonical scientific identifiers** for the relevant
**instrument version** and/or **instrument scale**, as determined by Controlled
Schema Specification.

These identifiers mean exactly one thing:

> "This is the scientifically governed scale."

They do **not** identify a student's assessment administration, a session, a
submission, or any scoring run.

#### 10.7.3 Operational side — F-03C

The application / integration domain must maintain a **governed correspondence**
from a **stable operational scoring-channel / version identity** to the relevant
**canonical RGKB instrument-scale identity / version**.

Conceptual chain:

Operational assessment execution
→ operational scoring-channel / version identity
→ governed canonical correspondence
→ RGKB instrument-scale identity / version
→ construct mapping (§10.4)
→ applicable guardrails / interpretation rules (§14, §15, §16)

The correspondence must be:

- **explicit** — declared, not inferred;
- **auditable** — who established it, when, on what basis;
- **version-aware** — it names both the operational version identity and the
  canonical version identity;
- **testable** — resolvable and checkable outside the generation path;
- **fail-closed** — see §10.7.4.

**Free-text aliases, `assessment_type` strings, function names, question-set
labels, and naming conventions must NOT be the authoritative correspondence
mechanism.** They may be inputs to migration or lookup logic, but the governed
correspondence must resolve to **stable identities**. This is the operational
counterpart of §16.2: a correspondence that depends on a string is a
correspondence that can detach silently, and silent detachment of a
student-facing guardrail is exactly the failure this architecture exists to
prevent.

#### 10.7.4 Change behaviour — F-03D

If any of the following occurs:

- the operational scoring implementation changes;
- a question set changes;
- scoring logic changes;
- an assessment channel is renamed;
- an instrument version changes;
- a canonical scale is superseded,

the correspondence **must be explicitly reviewed and, where required,
re-established**. There is **no silent inheritance across scientifically
meaningful version changes**.

**Fail-closed rule.** If a runtime score cannot resolve, through a valid governed
correspondence, to a canonical scale required by a consequential interpretation
path, the path **fails closed** (§4.2(26), §4.2.1(38)). The application must not
guess from strings, must not fall back to a default channel, and must not
proceed with an unbound interpretation.

#### 10.7.5 Student-data boundary — F-03E

This correspondence **must not** move any of the following into RGKB:

- student scores;
- item responses;
- assessment sessions;
- student identifiers;
- counselor / parent context;
- runtime personalization data.

**RGKB owns scientific identity. The operational domain owns execution identity
and the mapping seam.**

The correspondence is a boundary artefact: it names a canonical identifier on
one side and an operational channel identity on the other. It never carries a
student-linked value across the boundary in either direction.

The physical realization of the correspondence — where it is stored, how it is
versioned, how it is reviewed, and how it is tested — belongs to the operational
domain and is a Controlled Schema Specification / operational-design topic
(§26.6). No implementation is authorized by this document.

---

## 11. Knowledge and Construct Relationships

*(Owner adjudication I; extended by v0.2.1 finding F-01C)*

### 11.1 KU-version relations

**`rgkb.knowledge_unit_version_relation`** — explicit typed semantic
relationships among KU versions.

Relations bind **version to version**, not identity to identity, because the
truth of "A contradicts B" depends on exactly what A and B said.

Initial controlled predicates (vocabulary open, §26):

`supports`, `corroborates`, `refines`, `extends`, `qualifies`, `contradicts`,
`contextualizes`, `operationalizes`, `depends_on`, `supersedes`.

#### 11.1.1 Relations are immutable governed assertions

*(v0.2.1, finding F-01C)*

A knowledge-unit relation is **itself a governed assertion about specific
immutable KU versions**. It follows **Pattern B** (§5.7.2).

Once a relation has been used in validation, governance, or runtime eligibility
determination, the following **must not mutate in place**:

- the predicate;
- the source KU version;
- the target KU version;
- the scope qualification;
- the evidence linkage (§9.3).

**Correction creates a new relation record.** An existing
contradiction, support, or supersession relation must never silently change
meaning while historical decisions still reference it — a reviewer who
adjudicated a contradiction must be able to see the contradiction as it was
stated at the time of adjudication.

### 11.2 Removed duplicated state

v0.1's `knowledge_unit_relations` carried its own `validation_status` and its
own `evidence_basis` free text. Both are removed:

- **`validation_status` is removed.** A relation is a governed assertion like any
  other; its validation state comes from the multidimensional validation and
  review substrate (§12). A relation-local status would be a second, competing,
  independently writable truth about the same fact — prohibited by §4.2(31).
- **`evidence_basis` free text is removed** in favour of typed evidence links (§9.3).

### 11.3 Supersession semantics

Per §5.5, `supersedes` as a **relation** means one distinct conceptual assertion
replaces, narrows, or invalidates another. It is not the mechanism for revising
the wording of the same assertion — that is the version chain.

**Partial supersession** must be expressible: relations require scope
qualification (population, developmental band, context, construct) so that B may
supersede A within a bounded scope while A remains authoritative elsewhere.

Relation scope qualification, predicate symmetry and directionality rules, and
the exact representation of partial supersession are Controlled Schema
Specification topics (§26).

### 11.4 Disagreement is preserved

Contradictory evidence remains machine-visible. It must not be silently merged,
resolved by deletion, or averaged away (§4.1(12), §4.3).

---

## 12. Validation, Review, and Reviewer Domain

*(Owner adjudication G, H; extended by v0.2.1 finding F-01E)*

### 12.1 Two different things, clearly separated

**Human Review** is an **attributable human decision or action event**: a named
person, acting in a role, made a determination at a time, about an exact
immutable governed subject instance, for a reason.

**Validation** is an **evidence-backed governance state or determination for a
defined dimension**: the current governed answer to "does this subject satisfy
dimension X?"

v0.1 held these as two independently mutable stores (`validation_records` and
`review_records`) that could disagree with each other about the same subject.

### 12.2 One immutable substrate, derived current state

v0.2 requires an **immutable, append-only decision/review event substrate**.
Authoritative current validation state is **derived from, or governed against,
that substrate** — it is never an independently writable parallel truth
(§4.2(31)).

Decision/review events are Pattern B records (§5.7.2): they are corrected by
supersession or withdrawal events, never by rewriting the original event.

Whether current state is materialized for query performance is an
implementation concern; if materialized, it must be a governed projection of the
event substrate, never a separately editable source of truth.

### 12.3 Required expressive capability

A decision/review event must be able to record:

- reviewer identity;
- reviewer role;
- internal / external status;
- affiliation;
- credential or authority level;
- conflict-of-interest declaration;
- review method;
- validation dimension;
- decision;
- rationale;
- timestamp;
- supersession of a prior decision;
- withdrawal / retraction;
- **the exact IMMUTABLE GOVERNED SUBJECT INSTANCE reviewed**.

#### 12.3.1 The governed subject instance rule

*(v0.2.1, finding F-01E — refines the v0.2 "exact subject VERSION" requirement)*

v0.2 required review and validation to record the exact subject **version**. Not
every legitimate governance subject uses an identity/version family (§5.7), so
that requirement is refined rather than dropped:

**Review and validation must record the exact IMMUTABLE GOVERNED SUBJECT
INSTANCE that was reviewed.**

- For a **versioned object** (Pattern A) — that means the exact **version
  identifier**.
- For an **immutable append-only governed record** (Pattern B) — that means the
  exact **immutable record identifier**.

**Never validate merely "whatever the current object is."** A review of "the KU"
is meaningless once the KU has a new version; a review of "the anchor" is
meaningless once a replacement anchor exists.

This refinement resolves the v0.2 mismatch without forcing artificial version
tables onto atomic records, and it is the governance-side statement of
§4.2.1(36).

### 12.4 Reviewer identity independent of `auth.users`

**`rgkb.reviewer`** — a canonical reviewer identity concept **independent from
`auth.users`**.

- An **internal reviewer** may optionally link to a platform user identity.
- An **external reviewer** — an academic subject-matter expert, an external
  psychometrician, a rights counsel — **must not require a fabricated
  `auth.users` account**. Creating platform accounts merely to satisfy a foreign
  key would pollute the authentication surface of a system handling minors' data.

External reviewer authentication and onboarding mechanics (how an external
expert's decision is captured and attributed in practice) are a Controlled
Schema Specification topic (§26).

### 12.5 Validation dimensions

Dimensions remain independent of one another. Initial candidates:

`scientific`, `source_identity`, `extraction_fidelity`, `cross_source`,
`rights`, `georgian_context`, `translation_fidelity`, `psychometric`,
`developmental`, `safeguarding`, `technical`, `human_semantic`.

`translation_fidelity` is added in v0.2 and is deliberately distinct from
`georgian_context` (§18.3). Per §18.6, a `translation_fidelity` determination
attaches to the exact **localized-text version**, not to the localization
identity and not to the source-language version.

Different dimensions never combine into a composite score (§4.3). Where a gate
requires several dimensions, it requires each of them independently
(conjunctive criteria).

Which dimensions apply to which subject types — the **validation-dimension
applicability matrix** — is a Controlled Schema Specification topic (§26).

### 12.6 Referential governance subjects

*(Owner adjudication H)*

Authoritative governance state **must not** rely on unconstrained
`subject_type` + `subject_id` polymorphic references, as used in v0.1's
`validation_records` and `review_records`. Unconstrained polymorphism permits
decisions attached to non-existent subjects, orphaned decisions after subject
removal, and silent type drift — unacceptable for the substrate that determines
whether consequential output about minors may proceed.

**Validation and review subjects require referential enforcement.**

The exact technique remains open for Controlled Schema Specification, for
example:

- typed link tables per subject type;
- mutually exclusive typed foreign keys with a check constraint;
- a governable-object supertype registry that all governable subjects register into.

Whichever technique is chosen must be able to reference **both** Pattern A
version instances and Pattern B record instances (§5.7.4).

No SQL implementation choice is made here.

**Exception.** Generic polymorphic `target_type` / `target_id` remains
acceptable for **append-only audit and event logging**, where referential
looseness is intentional — an audit record must survive the disappearance of
its target and must be able to reference objects outside the canonical model.

---

## 13. Cross-Source Validation

*(Owner adjudication L; extended by v0.2.1 finding F-01D)*

### 13.1 Scope is broader than constructs

v0.1 restricted cross-source validation to a `subject_construct_id`. That is too
coarse: scientific disagreement is usually about a **specific claim**, not about
an entire construct.

Cross-source validation must support **claim / KU-version-level comparison**, in
addition to construct-level comparison.

### 13.2 Participating positions are first-class

**`rgkb.cross_source_validation`** — the identity and scope of a cross-source
comparison exercise.

**`rgkb.cross_source_position`** — an explicit participating position within
that comparison, each carrying:

- the KU version (or source expression) holding the position;
- the position's stance relative to the comparison question;
- its typed evidence (§9.3);
- its contextual qualifiers (population, developmental band, cultural context,
  measurement approach).

#### 13.2.1 Positions are immutable after governance use

*(v0.2.1, finding F-01D)*

A cross-source participating position is a **governed representation of a
specific scientific position**.

Once a position has been included in an adjudication or review, the following
are **immutable**:

- its KU-version / source reference;
- its stance;
- its qualifiers;
- its evidence binding.

**Correction creates a new position record, or a new versioned position**,
depending on the realization chosen at Controlled Schema Specification
(§26.6) — the architecture requires immutability and exact historical identity,
not one particular table shape.

**Historical adjudications must remain reconstructable against the original
positions they considered.** An adjudication that can no longer show what the
competing positions actually said is not an audit trail.

### 13.3 Adjudication does not erase

Cross-source adjudication **must not** replace or erase:

- supporting positions;
- conflicting positions;
- contextual qualifiers.

The architecture must not rely on **one outcome plus one confidence scalar** to
represent the entire state of a scientific disagreement. That was the v0.1
`outcome` + `confidence` shape, and it is rejected: it destroys precisely the
information a counselor or reviewer would need in order to reason about a
contested claim affecting a student.

### 13.4 History-aware review

Adjudication decisions are review/decision events on the immutable substrate
(§12.2). Re-adjudication supersedes rather than overwrites; the earlier
adjudication and the positions it weighed remain resolvable.

The exact cross-source adjudication model (how a current adjudicated summary is
derived and presented without collapsing the positions) is a Controlled Schema
Specification topic (§26).

---

## 14. Guardrails

*(Owner adjudication A, C, P)*

### 14.1 Nature

Guardrails are first-class governed entities that **prohibit or require**
behaviour. They are not recommendations, hints, or prompt suggestions.

Examples:

- RIASEC interest scores must not be represented as measures of ability.
- Cross-assessment discrepancy must not be resolved through automatic averaging.
- Consequential AI interpretation requires appropriate human review.

### 14.2 Identity and version

**`rgkb.guardrail`** — stable identity, semantics-free immutable code.

**`rgkb.guardrail_version`** — immutable version carrying:

- localized governed guardrail text (§18), referenced by localized-text version
  identity (§18.6);
- severity;
- trigger condition, prohibited action, required action — expressed in a named,
  versioned specification language (§14.4);
- the identifier of the specification language and its version;
- human-review policy (§15.4);
- typed evidence links (§9.3);
- typed bindings to constructs and KU versions (§16).

The v0.1 mutable integer `version` column is removed (§5.4). The v0.1 free-text
`scope` and `evidence_basis` fields are removed in favour of typed bindings and
typed evidence.

### 14.3 Fail-closed guardrail behaviour

- An **unparseable** guardrail blocks the dependent consequential path.
- An **unevaluable mandatory** guardrail blocks the dependent consequential path.
- A guardrail whose bound knowledge or construct is invalid, superseded, or
  unavailable blocks the dependent consequential path.
- A guardrail that governs a canonical scale which the runtime score cannot
  resolve to through a valid governed correspondence blocks the dependent
  consequential path (§10.7.4).

"Blocks" means the consequential output does not proceed. It does not mean
"proceed with a warning" and it does not mean "fall back to unconstrained model
reasoning."

### 14.4 Machine-executable specification requirement

*(shared with §15.3)*

`trigger_condition`, `prohibited_action`, and `required_action` **must not**
degrade into free-form prompt text or arbitrary undocumented JSON.

The architecture requires a **named + versioned + validated** rule/specification
language:

- every executable guardrail version identifies its specification language and
  language version;
- before activation, the machine-readable specification must be **syntactically
  and semantically valid** against that language version;
- validity is a gate on activation (§17), not a runtime hope.

This document does **not** design the specification language. Designing it is a
separate, separately authorized deliverable.

---

## 15. Interpretation Rules

*(Owner adjudication A, C, P)*

### 15.1 Nature

Interpretation Rules are the governed bridge between validated canonical
knowledge and RGIM / application output. They are **not free-form prompts**.

### 15.2 Identity and version

**`rgkb.interpretation_rule`** — stable identity, semantics-free immutable code.

**`rgkb.interpretation_rule_version`** — immutable version carrying:

- rule type;
- condition specification and output constraint, in a named versioned
  specification language (§15.3);
- the identifier of the specification language and its version;
- developmental and audience scope;
- evidence requirements;
- human-review policy (§15.4);
- typed bindings to KU versions, guardrail versions, and constructs (§16);
- typed evidence links (§9.3);
- where the rule supplies canonical governed text to output, the localized-text
  version identity of that text (§18.6).

The v0.1 mutable integer `version` column is removed (§5.4). The v0.1 free-text
`construct_scope` is replaced by typed construct bindings (§16).

### 15.3 Machine-executable specification requirement

`condition_spec` and `output_constraint` are subject to the same requirement as
§14.4: named, versioned, validated specification language; syntactic and
semantic validity required before activation.

**Fail-closed:** a broken, unparseable, or unevaluable interpretation rule must
**not** silently substitute free-form AI reasoning. Falling back to
unconstrained generation is the exact failure mode the RGKB exists to prevent,
because it produces student-facing career guidance with no traceable evidence
basis.

The same fail-closed behaviour applies where a rule's required canonical scale
cannot be resolved from the operational scoring channel through a valid governed
correspondence (§10.7.4).

### 15.4 Human-review policy structure

`human_review_requirement` must be structured enough to represent:

- **required review type** (for example scientific, safeguarding, localization);
- **required reviewer authority** (role and credential level, §12.3);
- **blocking vs advisory** — whether output may proceed pending review;
- **behaviour when required review is unavailable** — which, for a blocking
  requirement, is fail-closed by §4.2(26).

A free-text "needs review" string cannot express any of this and is insufficient.

---

## 16. Governance Bindings and Precedence

*(Owner adjudication C — BLOCKER)*

### 16.1 First-class binding relationships

The following relationships are **first-class typed relationships**, not
free-text scope matching:

| Binding | Conceptual entity |
|---|---|
| Interpretation Rule Version ↔ Knowledge Unit Version | `rgkb.rule_version_knowledge_binding` |
| Interpretation Rule Version ↔ Guardrail Version | `rgkb.rule_version_guardrail_binding` |
| Interpretation Rule Version ↔ Construct | `rgkb.rule_version_construct_binding` |
| Guardrail Version ↔ Construct | `rgkb.guardrail_version_construct_binding` |
| Guardrail Version ↔ Knowledge Unit Version | `rgkb.guardrail_version_knowledge_binding` |

Bindings carry their own semantics (for example: required vs advisory; the role
the bound knowledge plays for the rule) and reference **immutable version
identities** (§5.3). Bindings are themselves Pattern B governed records
(§5.7.2): once a binding has been used in a governance or runtime decision, it
is corrected by a new binding record, not by rewriting the existing one.

### 16.2 Why free-text scope matching is prohibited

String-matched scope silently fails: a renamed construct, a re-worded scope
label, or a translated string breaks the binding with no error, so a guardrail
that was supposed to constrain a student-facing output simply stops applying and
nothing detects it. For a system producing consequential guidance to minors,
silent guardrail detachment is unacceptable.

The same reasoning is why the canonical↔operational scale correspondence must
not rest on strings (§10.7.3).

### 16.3 Precedence

**A binding guardrail prohibition overrides a conflicting interpretation-rule
output permission or constraint.**

Guardrails are the safety floor. Rules operate above that floor and cannot
raise themselves through it.

### 16.4 Fail-closed dependency rule

A rule whose required evidence or guardrail dependency is:

- invalid, or
- superseded, or
- unavailable, or
- failing a required gate,

**must fail closed** — the dependent consequential path does not proceed.

This applies transitively: if a bound KU version is quarantined, rules bound to
it fail closed; if a bound guardrail version cannot be evaluated, rules bound to
it fail closed.

---

## 17. Lifecycle, Approval, and Activation Model

*(Owner adjudication M)*

### 17.1 One status field cannot carry four unrelated facts

v0.1 used a single `lifecycle_status` mixing editorial state, approval, runtime
availability, and historical lineage. That permits **self-granted approval**: an
actor who can set an operational availability value can thereby confer approval,
with no review event anywhere.

### 17.2 Four independent axes

**Axis 1 — Editorial / content state.** Where the content is in authoring.
Illustrative: `draft`, `under_review`. Governs §5.2 draft mutability.

**Axis 2 — Approval / validation decision.** **Derived from governed
review/decision events** (§12.2). Not directly settable as a field edit.

**Axis 3 — Runtime availability.** Whether the object may be used by runtime.
Illustrative: `active`, `inactive`, `restricted`, `quarantined`.

**Axis 4 — Historical lineage.** Illustrative: `superseded`, `retired`. Never
implies deletion; historical versions remain resolvable (§5.2).

The axes are independent. An object may be approved but not active; active but
restricted in audience; superseded but still resolvable for audit.

### 17.3 Approval cannot be self-granted

**Approval must not be granted merely by changing an operational availability
state.** Approval derives from the review/decision substrate. Setting an object
to `active` is an activation act (§17.4) that is *gated on* approval; it does
not *produce* approval.

### 17.4 Activation and quarantine

- Activation is an explicit governance event (§21), gated on conjunctive
  criteria across the required independent dimensions (§4.3) — including, for
  executable objects, specification validity (§14.4, §15.3).
- Quarantine is an explicit governance event that removes runtime availability.
- **Reactivation after quarantine must follow explicitly authorized activation
  logic** — it is not a field revert. Whatever caused quarantine must be
  addressed and the activation criteria must be re-satisfied.

Exact vocabularies for each axis, and the exact activation/quarantine event
shape, remain open (§26).

---

## 18. Localization Model

*(Owner adjudication O; extended by v0.2.1 finding F-02)*

### 18.1 Governed text declares its language

All canonical governed human-readable text **declares its language**. There is
no implicit default language for governed content.

### 18.2 Localized governed text

**`rgkb.localized_text`** (conceptual) — governed human-readable text bound to
a specific governed version and a specific language, with its own provenance
and its own validation state.

Localization is required for at least:

- Knowledge Unit statements;
- Construct definitions and labels;
- Guardrail text;
- other governed human-readable text where required (rule-facing constraint
  descriptions, instrument and scale labels, cross-source position summaries).

### 18.3 Translation fidelity and Georgian contextual validity are distinct

These are **two separate validation dimensions** (§12.5):

- **`translation_fidelity`** — does the Georgian text faithfully render the
  source-language governed meaning?
- **`georgian_context`** — is the claim valid and appropriate in the Georgian
  educational, cultural, and labour-market context?

A faithful translation of a claim that does not hold in Georgia is
fidelity-valid and context-invalid. A locally sound adaptation that has drifted
from the source claim is context-valid and fidelity-invalid.

**Georgian contextual validation must not silently imply translation fidelity,
and translation fidelity must not silently imply contextual validity.**

### 18.4 Translations do not inherit validation

A localized text **does not automatically inherit** the validation status of the
source-language text. Each localized governed text carries its own validation
state for the dimensions that apply to it.

### 18.5 No ad-hoc generation-time translation as authoritative text

Ad-hoc AI translation performed at generation time **must not become the
authoritative scientific text**. Authoritative Georgian governed text is
curated, versioned, evidence-linked where applicable, and reviewed — like any
other governed content.

This does not prohibit machine assistance during curation; it prohibits
unreviewed machine output from being canonical.

### 18.6 Localized governed text has its own immutable version identity

*(v0.2.1, finding F-02 — ACCEPT)*

Localized governed text requires **its own exact immutable version identity**.
This matters most for the Georgian text actually shown to students, parents,
counselors, and reviewers: that wording is what a minor read, and it is what a
reviewer must be able to inspect after the fact.

Localized governed text follows **Pattern A** (§5.7.1):

1. A localized governed text family has a **stable localization identity** where
   appropriate — the enduring "this governed text, in this language" handle.
2. Each governed translation or adaptation is an **immutable localized-text
   VERSION**, carrying the governed wording itself.
3. While **explicitly in draft**, a localized-text version may be edited.
4. Once it exits draft, or is **reviewed, validated, bound to another governed
   object, activated, published, or used in runtime output**, its governed text
   is **immutable**.
5. **Correction requires a new localized-text version.** The wording a student
   saw is never rewritten under them.
6. **Historical localized-text versions remain resolvable** indefinitely,
   including superseded, retracted, and quarantined versions.
7. **Translation fidelity validation attaches to the exact localized-text
   version** (§12.5), not to the localization identity and not to the
   source-language version.
8. **Georgian contextual validation remains a distinct dimension** (§18.3) and
   does **not** automatically follow from translation fidelity, nor the reverse.

#### 18.6.1 Runtime capture and traceability

9. **Runtime decision provenance for consequential output MUST capture the exact
   localized-text version(s) actually used**, wherever canonical governed text
   was rendered to, or supplied to, the user (§22.2).
10. **Source-to-answer traceability must use localized-text VERSION identity**,
    not merely localization identity (§23.1).

State plainly:

> **Knowing the Knowledge Unit version is NOT sufficient to prove what Georgian
> wording a student saw.** The actual governed localized rendering used must be
> resolvable.

Two different Georgian localized-text versions of the same KU version may differ
in developmental register, in framing, or in a nuance that changes how a
14-year-old understands a statement about their future. Traceability that stops
at the KU version cannot distinguish them, and therefore cannot answer a
counselor's, a parent's, or a reviewer's question about what was actually said.

#### 18.6.2 Generated text does not become canonical

This requirement must **not** be satisfied by turning ephemeral natural-language
generation into canonical localized text. Canonical localized text remains
**curated, versioned, and reviewed** (§18.5).

Where consequential output includes generated surrounding language, the governed
localized text it rendered or quoted is still identified by its localized-text
version; the generated remainder is runtime output subject to guardrails, not
canonical governed text, and it never becomes a localized-text version by having
been shown.

The physical shape of the localized-text identity/version family, and how a
runtime record references it, are Controlled Schema Specification topics
(§26.6).

---

## 19. Canonical Curation / Write Boundary

*(Owner adjudication R)*

### 19.1 Separately authorized curation acts

Canonical writes are not one undifferentiated "edit RGKB" permission. The
following are **separately authorized acts**, each with its own authority
requirements and its own governance events (§21):

1. **ingestion / acquisition** — obtaining a manifestation;
2. **evidence anchoring / extraction** — creating anchors and extracting text;
3. **Knowledge Unit assertion** — asserting a governed claim;
4. **validation / review** — recording a decision on a dimension;
5. **rights determination** — deciding a rights position;
6. **guardrail / rule governance** — authoring or binding executable governance;
7. **activation / quarantine / publication decisions** — changing runtime
   availability or projecting outward.

An actor authorized for one is not thereby authorized for another. In
particular, the actor who asserts a KU must not be able to self-approve it
(§17.3).

### 19.2 Bounded write boundary

Canonical knowledge is written through a **bounded, authenticated, audited
curation / service boundary**. Every write is attributable to an actor and an
authorized act, and produces a governance event (§21).

**Direct ad-hoc SQL must not silently become the normal curation interface.**
Ad-hoc SQL bypasses act authorization, bypasses invariant enforcement, and
bypasses the event substrate — which would make the entire governance model
decorative.

### 19.3 Exceptional direct administration

If exceptional direct database administration is ever permitted (incident
recovery, migration repair), it must:

- remain **auditable** — recorded as a privileged governance event (§21);
- remain **subject to the same governance invariants** — it is not an exemption
  from immutability, fail-closed behaviour, or approval separation;
- be explicitly authorized, not assumed from credential possession (§20.7).

---

## 20. Security / Read Boundary

*(Owner adjudication Q)*

The private `rgkb` schema architecture from v0.1 is preserved and made explicit.
**None of these controls is implemented by this document.**

### 20.1 Schema exposure

- `rgkb` must remain **excluded from ordinary PostgREST / browser schema
  exposure**.
- Schema exposure state is a **verifiable, drift-controlled security property**,
  not merely a dashboard convention. It must be checkable, and a change to it
  must be detectable.

### 20.2 Role privileges

- `anon` receives **no direct canonical-table privileges**.
- `authenticated` receives **no direct canonical-table privileges**.
- Students, parents, counselors, and school admins receive no direct canonical
  table CRUD.

### 20.3 Trusted bridge functions

Where a trusted bridge is required:

- **least privilege** — bounded purpose, bounded return shape;
- `SECURITY DEFINER` only where genuinely required, with **hardened ownership**;
- **the function owner must be a dedicated least-privilege role**, not a broad
  superuser chosen for convenience;
- **schema-qualified object references** throughout;
- **`search_path` pinned / restricted safely**;
- **`EXECUTE` explicitly revoked from `PUBLIC` and `anon`**, and granted only
  where necessary;
- explicit authorization checks inside the function;
- fail-closed behaviour;
- audit for consequential access.

A generic unrestricted "return everything" RGKB endpoint is prohibited.

### 20.4 Bounded, auditable consequential access

Consequential access — access whose results feed student-facing output — is
bounded and auditable. Access that can influence what a minor is told about
their future is not an untracked read.

### 20.5 Generated types

Browser-generated Supabase types should **not** expose `rgkb` canonical tables.
Server-side type handling is a separate concern with its own mechanics
(deferred, §26).

### 20.6 Service-role possession is not authorization

**Possession of the service role does not authorize raw unrestricted RGKB access
by convention.** The service role bypasses RLS as a database mechanism; that is
a reason for stricter procedural governance, not a licence. Service-role paths
are still bound by §19 act authorization and §21 auditing.

### 20.7 Deferral

The exact RPC / Edge Function boundary, the production drift-verification
mechanics, and the server-side type-generation mechanics are Controlled Schema
Specification topics (§26). **Do not implement any of these controls yet.**

---

## 21. Canonical Governance and Audit Events

*(Owner adjudication S)*

### 21.1 First-class, append-only, actor-attributed

The architecture requires **first-class append-only curation / governance
provenance**: an immutable, actor-attributed event history for the canonical
knowledge layer. Governance events are Pattern B records (§5.7.2) by
construction: an event is never rewritten, only followed by further events.

### 21.2 Actors beyond `auth.users`

The actor model must support:

- **internal human curator**;
- **external reviewer** (no fabricated platform account, §12.4);
- **ingestion process**;
- **controlled system process**.

Actor identity is typed and attributable; "some process did it" is not
acceptable attribution.

### 21.3 Event categories

At minimum, distinguish:

- **acquisition event** — a manifestation was obtained;
- **ingestion event** — material entered the curation pipeline;
- **extraction event** — anchors or excerpts were produced;
- **assertion event** — a KU version was asserted;
- **review / decision event** — a validation or review decision was recorded;
- **activation / quarantine event** — runtime availability changed;
- **publication event** — canonical content was projected outward;
- **privileged access / governance event** — exceptional administration,
  privileged read, or governance configuration change, where applicable.

### 21.4 Relationship to §12

The review/decision events of §12.2 are part of this event substrate. They are
described separately because they carry additional reviewer-specific structure,
not because they live in a different world.

### 21.5 What this is not

This is **canonical governance provenance**. It must not be confused with
**student-specific runtime decision provenance** (§22). Governance events
describe what curators and reviewers did to the knowledge base. They do not
describe what any student saw.

### 21.6 Deferral

Exact physical audit-table placement may remain open. What is **not** open is
the requirement for an immutable, actor-attributed event history. Generic
polymorphic `target_type` / `target_id` is acceptable here (§12.6 exception).

---

## 22. Runtime Decision Provenance Boundary (Outside `rgkb`)

*(Owner adjudication B; extended by v0.2.1 findings F-02 and F-03)*

### 22.1 Why it is outside

Runtime decision provenance records what the system did **for a specific
student, in a specific session, at a specific time**. It is operational data
containing minors' personal context. It belongs to the application/operational
domain, **not** to the canonical scientific schema.

Placing it in `rgkb` would import minors' personal data into the canonical
knowledge layer, entangle student-data retention rules with scientific
provenance, and make the canonical schema's access boundary (§20) far harder to
keep tight.

### 22.2 What it records

For each consequential output event:

- the actual RGIM / application output event;
- the immutable interpretation-rule version(s) used;
- the guardrail version(s) consulted and their **evaluation outcomes**;
- the knowledge-unit version(s) used;
- **the exact localized-text version(s) actually used**, wherever canonical
  governed text was rendered to, or supplied to, the user (§18.6.1);
- **the governed correspondence(s) resolved**, where an operational scoring
  channel was mapped to a canonical instrument scale (§10.7.3) — recorded as the
  operational channel/version identity and the canonical instrument-scale
  identity/version it resolved to;
- the validation state relied upon at that time;
- the rights state relied upon at that time;
- the human-review event where required;
- the model / provider / system version.

### 22.3 How it references the RGKB

Runtime provenance references RGKB **only through immutable canonical version
identifiers** (§5.3) — including localized-text version identifiers (§18.6) and
canonical instrument-scale identifiers (§10.7.2). It stores the identifiers, not
copies of canonical content, and it does not write into `rgkb`.

Because canonical versions are immutable and remain resolvable, a runtime record
from any past date can be re-resolved to exactly the knowledge, rules, and
governed Georgian wording that were used — even after those versions have been
superseded.

### 22.4 The two questions

- **Canonical provenance answers:** *"Why is this knowledge or rule justified?"*
- **Runtime provenance answers:** *"What did the system actually use and do for
  this output?"*

Neither answers the other's question, and neither may be reconstructed from the
other alone.

### 22.5 Scope note

The design of the runtime provenance store — its schema, its retention policy,
its RLS, its consent linkage, its relationship to existing operational tables —
is **out of scope for this document**. What is in scope is the boundary: it
exists, it lives outside `rgkb`, and it references canonical immutable versions.

The same scope note applies to the operational side of the governed
correspondence (§10.7.5): the boundary is architecture; its realization is
operational design, and neither is authorized here.

---

## 23. Source-to-Answer Traceability Contract

*(Extended by v0.2.1 findings F-02 and F-03)*

### 23.1 The chain

Every consequential machine-generated interpretation must be capable of
resolving backward through:

Application / RGIM output event
→ runtime decision provenance record (§22)
→ interpretation-rule version
→ guardrail version(s) and evaluation outcomes
→ localized-text version(s) actually rendered (§18.6)
→ operational scoring-channel identity → governed correspondence → canonical
instrument-scale identity/version, where a score entered the path (§10.7)
→ construct(s) and instrument scale(s) involved
→ knowledge-unit version(s)
→ typed evidence link(s)
→ evidence anchor(s)
→ source expression
→ source

with rights state, validation state, **localized-text version identity**, and
human-review state resolvable at each governed step.

Traceability must resolve **localized-text VERSION identity**, not merely
localization identity (§18.6.1(10)).

### 23.2 What traceability must distinguish

- primary evidence;
- corroborating evidence;
- contradictory evidence;
- contextual qualifiers;
- contextual (Georgian) validation, separately from translation fidelity;
- **the exact governed Georgian wording rendered, by localized-text version**;
- rights status at the time of use;
- human-review state at the time of use;
- which guardrails were evaluated and what each returned;
- which canonical scale each operational score resolved to, and through which
  governed correspondence.

### 23.3 Immutability is what makes this work

Traceability is only meaningful because canonical versions and immutable
governed records are permanently resolvable (§5.2, §5.7). A traceability chain
that resolves to "whatever that KU says now" proves nothing about what was said
to a student last term — and a chain that resolves only to a KU version proves
nothing about the Georgian wording that student actually read (§18.6.1).

---

## 24. Citations and Presentation Projections

*(Owner adjudication U)*

### 24.1 Reframing

**Citation rendering is not the provenance foundation. Evidence and provenance
are the foundation.**

Citations are **human-readable renderings** of structured bibliographic and
locator metadata that already exist in the source, expression, manifestation,
contributor, external-identifier, and evidence-anchor entities.

### 24.2 Generated, with overrides

Prefer **generated citation renderings** from structured metadata, with
**explicit overrides** for exceptional sources that no template handles well
(unusual grey literature, institutional documents, non-standard framework
releases).

Storing every rendered style string for every source is rejected: it duplicates
structured data, drifts from it silently, and multiplies with each citation
style.

### 24.3 Presentation projections generally

Publication into `public.knowledge_resources` or any other presentation surface
is a **governed projection**, gated by:

- rights permission for the specific outward act (§7.4);
- the required validation dimensions (conjunctive, §4.3);
- an explicit publication governance event (§21.3).

A projection never becomes a second source of canonical truth (§3.2).

### 24.4 Deferral

The exact citation-rendering architecture, template implementation, and style
vocabulary are Controlled Schema Specification topics (§26).

---

## 25. Deferred Retrieval and Embeddings

*(Owner adjudication V)*

### 25.1 Still deferred

The following remain explicitly outside Phase 7.0 scope:

- pgvector and vector indexes;
- embeddings;
- chunking;
- semantic similarity search;
- RAG pipelines;
- agent memory;
- automated intervention engine;
- student-specific personalization;
- automatic source extraction;
- production API exposure;
- automatic publication into `public.knowledge_resources`.

**No embedding or vector entities are added in v0.2 or v0.2.1.**

### 25.2 What is anticipated now

Three things are established now so that future retrieval design is not forced
to retrofit them:

1. **Stable immutable version identifiers** (§5) — so that retrieved content has
   a fixed, resolvable identity.
2. **Character / span offsets in evidence anchors where available** (§9.2) — so
   that future chunking can align to governed anchors rather than re-deriving
   locations.
3. **Rights-conditioned text-retention state** (§7.6) — so that it is knowable,
   per source, whether text may be held at all.

### 25.3 Binding requirement for future embeddings

**Future embeddings must bind to immutable canonical version identities** — or,
for Pattern B objects, immutable governed record identities (§5.7).

An embedding bound to a mutable object silently becomes a vector of text that no
longer exists, retrieved as if authoritative. Binding to immutable instances
makes staleness detectable rather than invisible.

---

## 26. Controlled Schema Specification — Open Questions

These are recorded as **deliberate Controlled Schema Specification topics**.
They are not gaps in v0.2 / v0.2.1 and must not be overdesigned here.

### 26.1 Source, identifiers, and citation

1. Contributor normalization and contributor roles.
2. External identifier structures and controlled scheme vocabulary.
3. Exact citation template implementation and style vocabulary.
4. Exact content-fingerprint algorithm.
5. Canonical code allocation format and allocation authority (§5.6).

### 26.2 Semantics and relations

6. Construct-to-construct relations.
7. Predicate symmetry and directionality rules.
8. Relation scope qualification.
9. Partial supersession implementation (§11.3).
10. Controlled grade / developmental scope vocabulary.
11. Audience scope for rules and guardrails.

### 26.3 Governance and validation

12. Validation-dimension applicability matrix (which dimensions apply to which
    subject types).
13. Governance / release gates as **conjunctive independent-dimension criteria**
    — never weighted master scores (§4.3).
14. Exact cross-source adjudication model (§13.4).
15. Exact activation / quarantine event shape (§17.4).
16. Referential enforcement technique for governance subjects (§12.6).
17. External reviewer authentication and onboarding.
18. Exact epistemic, rights, validation, and lifecycle vocabularies.

### 26.4 Implementation mechanics

19. Exact PostgreSQL enum versus reference-table choices.
20. Exact RPC / Edge Function read boundary.
21. Migration sequencing.
22. Rollback strategy.
23. Production drift-verification mechanics (§20.1).
24. Supabase server-side type-generation mechanics (§20.5).
25. Audit-event physical placement (§21.6).

### 26.5 Separately authorized deliverables

26. The named, versioned rule/guardrail specification language (§14.4, §15.3) —
    a separate deliverable, not a schema-spec sub-item.
27. Runtime decision provenance store design (§22.5) — operational domain.

### 26.6 Introduced by v0.2.1

These follow directly from the F-01 / F-02 / F-03 closures. They are physical
realization questions only; the architectural requirement is settled above.

28. Physical realization of the construct↔scale mapping as Pattern A or
    Pattern B (§10.4.1).
29. Physical realization of cross-source participating positions as Pattern B
    records or Pattern A versioned positions (§13.2.1).
30. Physical shape of the evidence-anchor replacement / supersession
    relationship, and whether any anchor version family is ever warranted
    (§9.2.1).
31. Physical shape of the localized-text identity / version family, and how a
    runtime provenance record references a localized-text version (§18.6.2).
32. Realization of the operational governed correspondence — storage,
    versioning, review workflow, and test strategy — in the operational domain
    (§10.7.5).

### 26.7 Findings deferred by the v0.2 independent review

Findings **F-04 through F-14** of the v0.2 independent review are **not resolved
in v0.2.1** and remain tracked for Controlled Schema Specification. This
amendment deliberately does **not** redesign:

- dependency re-binding workflow;
- validation determination identity beyond what F-01 requires;
- derivation-rule implementation;
- current-version cardinality;
- living-web-source convention;
- rights-document physical entity;
- developmental vocabulary;
- consequentiality classification;
- platform-role versus reviewer-authority implementation;
- validation applicability matrix;
- contributor / citation sequencing.

Recording them here is registration, not architecture. No decision on any of
them is made or implied by this document.

---

## 27. Gate Statement

### 27.1 Explicit non-authorizations

This document explicitly states:

- **NO SQL MIGRATION AUTHORIZED**
- **NO SCHEMA DEPLOYMENT AUTHORIZED**
- **NO PRODUCTION DATA INGESTION AUTHORIZED**
- **NO DIRECT CLIENT RGKB ACCESS AUTHORIZED**
- **NO EMBEDDINGS / RAG AUTHORIZED**
- **NO RGIM PRODUCTION INTEGRATION AUTHORIZED**
- **NO AUTOMATED CONSEQUENTIAL DECISION-MAKING AUTHORIZED**

Additionally not authorized: agent production access, AI feature enablement,
publication into `public.knowledge_resources`, and any change to production
database objects or configuration.

### 27.2 Next gate

The next gate is:

**v0.2.1 Focused Independent Closure Review → Owner Adjudication → Controlled
Schema Specification**

The focused closure review is bounded to F-01, F-02, and F-03. Controlled Schema
Specification is **not** approved by this document; it is the stage that follows
owner adjudication of that closure review. Controlled Schema Specification is
itself an architecture-stage deliverable and does not authorize migration
authoring; migration design requires a further owner authorization after that
stage.

---

## 28. v0.1 → v0.2 Decision Summary

| Ref | Finding | Adjudication | Resolution in v0.2 |
|---|---|---|---|
| A | Mutable versioning of governance-bearing content | ACCEPT | §5 identity/version split; draft-only mutability; immutability after draft; correction by new version; mutable integer `version` prohibited (§5.4) |
| B | Single conflated provenance chain | ACCEPT WITH MODIFICATION | §9.1 canonical chain in `rgkb`; §22 runtime decision provenance outside `rgkb`, referencing immutable versions only |
| C | Governance bindings absent / free-text scope | ACCEPT | §16 five first-class typed bindings; guardrail-prohibition precedence; transitive fail-closed |
| D | Free-text evidence pointers | ACCEPT | §9.3 typed evidence links; `evidence_reference` / `evidence_basis` removed from authoritative path; §9.4 rights/document anchors |
| E | Two-level source model conflates edition and file | ACCEPT WITH MODIFICATION | §6 Source / Expression / Manifestation; fingerprints prove file not edition; §6.4 level-aware external identifiers |
| F | Boolean rights model | ACCEPT | §7 normalized rights: identity, holder, jurisdiction, authority, allow/deny, purpose, conditions, limits, validity window, revocation, typed evidence, immutable history; fail-closed |
| G | Validation and review as competing mutable stores | ACCEPT WITH MODIFICATION | §12 immutable decision-event substrate with derived current state; full reviewer attribution; §12.4 reviewer identity independent of `auth.users` |
| H | Unconstrained polymorphic governance subjects | ACCEPT | §12.6 referential enforcement required for governance subjects; technique open; polymorphism retained only for append-only audit |
| I | Duplicated validation / supersession state | ACCEPT | §11.2 relation-local `validation_status` and `evidence_basis` removed; §5.5 version chain vs supersession relation; partial supersession required |
| J | No instrument / scale registry | ACCEPT | §10.3 instrument, instrument version, scale, construct↔scale mapping with typed semantics; no student results |
| K | Numeric drift in epistemic fields | ACCEPT | §8.4 controlled, ordinal, non-arithmetic, non-additive, non-averaged; §4.3 no master score |
| L | Cross-source validation too coarse | ACCEPT | §13 claim/KU-version-level comparison; participating positions first-class; single outcome+confidence scalar rejected; history-aware |
| M | Single `lifecycle_status` conflates axes | ACCEPT | §17 four independent axes; approval derived from review events; no self-granted approval; governed reactivation |
| N | Semantic-position codes | ACCEPT WITH MODIFICATION | §5.6 `KU-001-CH5-014` rejected; semantics-free, immutable, never reused, never re-pointed, collision-safe |
| O | Localization unaddressed | ACCEPT WITH MODIFICATION | §18 language-declared governed text; localized versions; `translation_fidelity` distinct from `georgian_context`; no inherited validation; no ad-hoc generation-time authoritative translation |
| P | Executable rule fields undefined | ACCEPT | §14.4 / §15.3 named + versioned + validated specification language; validity gates activation; fail-closed; §15.4 structured human-review policy; DSL not designed here |
| Q | Security boundary underspecified | ACCEPT WITH MODIFICATION | §20 schema exposure as drift-controlled property; no `anon`/`authenticated` privileges; hardened `SECURITY DEFINER` ownership; pinned `search_path`; EXECUTE revocation; service-role possession ≠ authorization |
| R | No canonical write boundary | ACCEPT | §19 seven separately authorized curation acts; bounded audited curation boundary; ad-hoc SQL not a normal interface |
| S | No canonical governance provenance | ACCEPT | §21 append-only actor-attributed event history; actors beyond `auth.users`; eight event categories |
| T | Excerpt retention unbounded | ACCEPT WITH MODIFICATION | §7.6 rights-conditioned retention; retention ≠ output permission; locator+fingerprint+provenance without text; notes must not hold restricted excerpts |
| U | Citations framed as provenance | ACCEPT AS SCHEMA-SPEC REFINEMENT | §24 citations are renderings of structured metadata; generated with overrides; rendering architecture deferred |
| V | Retrieval anticipation | PRESERVE DEFERRAL | §25 embeddings/vectors still deferred and none added; version identifiers, span offsets, retention state anticipated; future embeddings bind to immutable versions |

### 28.1 Decisions preserved unchanged from v0.1

Dedicated `rgkb` schema; `public.knowledge_resources` as separate presentation
layer; assessment results as operational data; knowledge distinct from
interpretation; constructs distinct from assessment results; RIASEC interest is
not ability; self-efficacy not manufactured into a seventh assessment;
cross-assessment channels complementary and non-additive; discrepancy as inquiry
signal; no universal master validation or assessment score; conflicting evidence
remains visible; scientific validity separate from rights clearance; Georgian
contextual validation separate from original-source validity; consequential AI
interpretation requires a human-review boundary; no direct browser CRUD on
canonical tables; retrieval and intervention infrastructure deferred.

**All of these are preserved unchanged in v0.2.1.** Nothing in this amendment
weakens any of them, and nothing in this amendment reopens any accepted v0.2
decision.

### 28.2 Status

v0.2 was **ARCHITECTURE ONLY** and authorized **architecture review only**.

v0.2.1 is a **CONTROLLED AMENDMENT — ARCHITECTURE ONLY** and authorizes
**focused independent closure review only** (§27.2).

### 28.3 v0.2 → v0.2.1 amendment summary

| Ref | Precondition | Adjudication | Resolution in v0.2.1 |
|---|---|---|---|
| F-01 | Governed-object immutability coverage incomplete | ACCEPT WITH MODIFICATION | §5.7 two legitimate patterns — Pattern A versioned governed object, Pattern B immutable append-only governed record — with an explicit coverage assignment (§5.7.4) and a defined governance immutability boundary (§5.7.3); §4.2(21) refined; no mechanical identity/version pair forced onto atomic records |
| F-01A | Evidence anchors | ACCEPT WITH MODIFICATION | §9.2.1 anchors are Pattern B; editable before the boundary, immutable after reference by a non-draft governed version, review/validation use, or inclusion in an authoritative provenance chain; incorrect locators are corrected by **new anchor**, never in place; historical references keep resolving to the original anchor; no artificial version family required |
| F-01B | Construct ↔ scale mappings | ACCEPT WITH MODIFICATION | §10.4.1 the mapping is a governed scientific claim; represented as a versioned governed assertion **or** an immutable append-only assertion corrected by replacement record; requirement is immutability + exact historical identity; physical choice deferred (§26.6) |
| F-01C | KU relations | ACCEPT WITH MODIFICATION | §11.1.1 relations are Pattern B governed assertions about specific immutable KU versions; predicate, source/target versions, scope qualification, and evidence linkage immutable after governance use; correction creates a new relation record |
| F-01D | Cross-source positions | ACCEPT WITH MODIFICATION | §13.2.1 KU/source reference, stance, qualifiers, and evidence binding immutable once included in adjudication/review; correction by new position record or new versioned position; historical adjudications remain reconstructable |
| F-01E | Validation subject version rule | ACCEPT WITH MODIFICATION | §12.3.1 review/validation records the exact **immutable governed subject instance** — version identifier for Pattern A, record identifier for Pattern B; never "whatever the current object is"; §4.2.1(36) |
| F-02 | Localized governed text version traceability | ACCEPT | §18.6 localized governed text is Pattern A with stable localization identity and immutable localized-text versions; draft-editable, immutable after review/validation/binding/activation/publication/runtime use; correction by new version; historical versions resolvable; translation fidelity attaches to the exact localized-text version; Georgian context remains distinct; §18.6.1 runtime capture + §23 traceability use localized-text **version** identity; §18.6.2 generated text never becomes canonical localized text; §4.2.1(37) |
| F-03 | Canonical scale ↔ operational scoring-channel correspondence | ACCEPT WITH MODIFICATION | §10.7 governed correspondence boundary: **A** owned by the application/integration/operational domain, not RGKB (§10.7.1); **B** RGKB exposes immutable canonical instrument-version / instrument-scale identifiers that never denote a student administration (§10.7.2); **C** operational domain maintains an explicit, auditable, version-aware, testable, fail-closed correspondence from stable operational scoring-channel/version identity to canonical scale identity — never free-text aliases, `assessment_type` strings, function names, or naming conventions (§10.7.3); **D** correspondence explicitly reviewed/re-established on scoring, question-set, channel, or version change, with no silent inheritance and fail-closed on unresolvable correspondence (§10.7.4); **E** no student scores, item responses, sessions, identifiers, counselor/parent context, or personalization data enter RGKB (§10.7.5); §4.2.1(38) |

### 28.4 What v0.2.1 did not touch

Findings **F-04 through F-14** of the v0.2 independent review are **not resolved
in this amendment** (§26.7). They remain tracked for Controlled Schema
Specification, unexpanded and undecided.

No other accepted v0.2 architecture was reopened, and no style-only rewrite was
made to unrelated sections.
