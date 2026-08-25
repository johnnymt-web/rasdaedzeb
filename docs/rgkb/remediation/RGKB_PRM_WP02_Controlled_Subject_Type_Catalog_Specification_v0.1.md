# PRM-WP02 — Controlled Subject-Type Catalog Specification — v0.1

- Work package: PRM-WP02 — Governed Object / Version Runtime Foundation, the
  controlled subject-type catalog specification that Tier 2 requires.
- Authorization level: **DISCOVERY + CONTROLLED AUTHORING ONLY.** No schema, no
  migration, no SQL, no RLS/auth, no catalog row, no Tier 2 implementation.
- Controlling sources: RGKB Canonical Entity Model v0.2.1; Controlled Schema
  Specification Steps 1–7; accepted PRM-WP02 artifact; accepted Pilot Readiness
  Remediation Master Plan.
- Status: **DRAFT, RC1 CORRECTION APPLIED, ODQ-9 OWNER-APPROVED — READY FOR
  OWNER REVIEW.** Tier 2 remains **BLOCKED** pending a separate Human Gate.
  WP02 NOT CLOSED. F-04 OPEN. F-07 OPEN. M-1 OPEN. Seven Owner decisions remain
  OPEN (§9).
- Baseline: `origin/main` `2cc13957dcef2638e951d1232a24a850236a6135`.
- Date: 2026-08-25 (drafted; RC1 source-fidelity correction; ODQ-9 Owner
  decision recorded).
- Owner decisions recorded in this artifact: **ODQ-9 — APPROVED, 2026-08-25**
  (the 19 `subject_type` identifiers). No other ODQ is decided.

## 1. Purpose and authority

Step 1 §2.1 requires every `governed_instance` to carry exactly one
`subject_type`, and requires `pattern` to **equal** that subject type's fixed
assignment in the controlled subject-type catalog. Step 1 §14.5 defers the
catalog's concrete membership to "later controlled steps". PRM-WP02 §5.2 records
Tier 2 as structurally **BLOCKED** until that deferral is discharged.

This document discharges it, and nothing more. It is the controlled
specification of **which governed families exist, and which pattern each
carries**. It performs no implementation (§15).

**This document is not an assignment authority.** Step 2 §9.1, Step 3 §16.1 and
Step 4 §18.1 are the assignment registers for the families their specifications
introduce; the Canonical Entity Model §5.7.4 coverage assignment is the
authority for the families it names. This document **collects and reconciles**
those existing assignments into one catalog-shaped register. Where this document
and a controlling source diverge, **the controlling source governs and this
document is defective**.

## 2. Controlling-source hierarchy

Applied in this order. A lower tier never overrides a higher one.

1. **RGKB Canonical Entity Model v0.2.1** — §5.7.4 is the *coverage assignment*
   that Step 1 §2.5 names as the assignment authority ("Family-to-pattern
   assignments are drawn from the coverage assignment of the controlling
   canonical entity model").
2. **Controlling architecture text outside §5.7.4** — Canonical Entity Model
   statements that fix a pattern without a coverage-table row.
3. **Step-level assignment registers** — Step 2 §9.1, Step 3 §16.1, Step 4
   §18.1. Each is authoritative *only for the families its own specification
   introduces*, and each says so.
4. **Step 1** — the meaning of Pattern A/B, catalog admission rules, and the
   fail-closed consequences (§2.1, §2.5, §3, §4, §10).
5. **Steps 5, 6, 7** — each records **zero new governed families** (Step 5 §19.1,
   Step 6 §19.1, Step 7 §3.4/§16.5). They contribute exclusions, not admissions.

**Step 8 is not used as an assignment source.** It is consulted only for
cross-phase constraints; no family is admitted here on the strength of a
rehearsal or readiness example.

**Basis vocabulary** (adopted verbatim from Step 2 §9.1 / Step 3 §16.1 so
provenance is not flattened):

- **[table]** — assigned in the Canonical Entity Model §5.7.4 coverage
  assignment;
- **[text]** — assigned by controlling architecture text outside §5.7.4;
- **[derived]** — a Step-level determination, made by applying the controlling
  Pattern criterion to a family no controlling source assigns. A [derived]
  assignment is the authoring Step's determination, superseded if the Owner or a
  later controlled specification determines otherwise.

## 3. Exact definition of catalog membership

A family is **admitted** to the controlled subject-type catalog if and only if:

1. it is a **governed family** — its concrete instances are governed instances
   registered in `governed_instance` (Step 1 §2.1); **and**
2. its Pattern A / Pattern B assignment is **fixed** by a controlling source at
   tier 1, 2 or 3 of §2.

Admission is **not** eligibility. Step 1 §2.5: "Presence of a family in the
catalog MUST NOT be interpreted as evidence that any instance of that family is
immutable, approved, validated, runtime-available, or eligible for a
consequential governance act."

A family failing (2) **MUST NOT be admitted**. Step 1 §2.5: "Admission of an
unresolved family is a governance/schema fault and MUST FAIL CLOSED."

A family failing (1) is **EXCLUDED** — it is not a catalog candidate at all,
because it never becomes a `governed_instance`.

## 4. Pattern A / Pattern B meaning inherited from Step 1

Restated for use here; Step 1 §2.2–§2.4 and Canonical Entity Model §5.7.1–§5.7.3
govern.

**Pattern A — versioned governed object.** One enduring conceptual object may
carry multiple governed semantic revisions. Structure: *stable identity +
immutable semantic versions*. Immutability boundary: **exit from draft**,
irreversible.

> **The governed instance of a Pattern A family is the VERSION, never the stable
> identity.** Step 1 §2.1: "`governed_instance` MUST NOT contain Pattern A stable
> identities." Step 1 §2.2: a stable identity "MUST NOT be an authoritative
> governance-act target, and MUST NOT be registered in `governed_instance`."
> Admitting `knowledge_unit` with `pattern = 'A'` therefore admits *knowledge
> unit versions* to the registry — it does **not** admit the stable identity.

**Pattern B — immutable append-only governed record.** The object is itself an
atomic historical assertion, evidence location, relation, position, or event;
correction records a *different thing*, not a revision of the same thing.
Immutability boundary: **first governance use** (Step 1 §2.4), whose crossed
state is DERIVED and never independently writable.

`pattern` is **DERIVED** from this catalog and is never independently writable
(Step 1 §2.1). A mismatch is a governance/schema fault that MUST FAIL CLOSED.

## 5. Source-derived family inventory

Every candidate below was investigated against §2's hierarchy. **36 candidates**
were investigated: **19 admitted** (11 Pattern A, 8 Pattern B), **9 UNRESOLVED
— DO NOT ADMIT**, **8 EXCLUDED**.

No candidate was admitted because an implementation shape seemed convenient, and
no candidate was invented.

> **Classification is not table design.** A family's Pattern A/B classification
> and its physical Tier 2 table realization are different questions. Where a
> controlling source fixes the pattern but leaves the physical stable-identity /
> version table shape to later design, the family is **FIXED**, and the table
> shape is recorded as a Tier 2 physical-realization note (§16) — never as an
> unresolved pattern assignment. RC1 corrected one row that had confused the
> two (§14).

### 5.1 FIXED — PATTERN A (admitted)

| # | `subject_type` (**OWNER-APPROVED**) | Family name | Basis | Controlling source | Admission |
|---|---|---|---|---|---|
| A1 | `knowledge_unit` | Knowledge Unit | [table] | CEM §5.7.4 row 1; §5.1, §8.2. Step 2 §9.1 maps its local label "governed knowledge object" → `Knowledge Unit` | **PERMITTED** |
| A2 | `guardrail` | Guardrail | [table] | CEM §5.7.4 row 2; §5.1, §14.2. Relied on unchanged by Step 4 §18.2 | **PERMITTED** |
| A3 | `interpretation_rule` | Interpretation Rule | [table] | CEM §5.7.4 row 3; §5.1, §15.2. Step 4 §18.2: the synthesis rule is a `rule_class` specialization of this family, **not** a new family | **PERMITTED** |
| A4 | `construct_definition` | Construct definition | [table] | CEM §5.7.4 row 4; §5.1, §10.1 | **PERMITTED** |
| A5 | `rights_decision` | Rights decision | [table] | CEM §5.7.4 row 5; §5.1, §7.2 (`rights_declaration` identity + `rights_decision_version`) | **PERMITTED** |
| A6 | `instrument` | Instrument | [table] | CEM §5.7.4 row 6; §10.3 (`rgkb.instrument` identity, `rgkb.instrument_version` version) | **PERMITTED** |
| A7 | `localized_governed_text` | Localized governed text | [table] | CEM §5.7.4 row 7; §18.6. Step 2 §9.1 assigns the same family as "governed localized text" | **PERMITTED** |
| A8 | `validation_derivation_rule` | Validation derivation rule | [derived] Step 3 | Step 3 §16.1 — Step 3 determination on the Pattern A criterion; §6.2 | **PERMITTED** |
| A9 | `validation_applicability_matrix` | Validation applicability matrix | [derived] Step 3 | Step 3 §16.1 — Step 3 determination on the Pattern A criterion; §7.9 | **PERMITTED** |
| A10 | `integrated_profile_architecture` | Integrated Profile Architecture | [derived] Step 4 | Step 4 §18.1 — Step 4 determination on the Pattern A criterion | **PERMITTED** |
| A11 | `instrument_scale` | Instrument scale | [table] | CEM §5.7.4 row 6 (same row assigns Pattern A to "Instrument / instrument version / **instrument scale**"); §10.3 names `rgkb.instrument_scale` as a canonical registry entity; §10.7.2 exposes canonical identifiers for "instrument version **and/or instrument scale**"; §10.7.3 names the "canonical RGKB **instrument-scale identity / version**". Relied on as already assigned by Step 3 §16.2 and Step 4 §18.2 | **PERMITTED** |

**Row 6 admits two families, not one, and not three.** Canonical Entity Model
§5.7.4 row 6 covers three *named entities* — instrument, instrument version,
instrument scale — under one Pattern A assignment. Under §4, a Pattern A family
comprises a stable identity **and** its versions as two identity levels of one
family. `rgkb.instrument` + `rgkb.instrument_version` are therefore one family
(A6); `rgkb.instrument_scale`, which §10.7.3 gives its own "identity / version",
is a second family (A11).

**No `instrument_version` subject type exists, deliberately.** For a Pattern A
family the governed instance *is* the version; creating a separate
`instrument_version` catalog row would split one family into two subject types
and would additionally encode Pattern A in an identifier (§11). The same holds
for every other Pattern A family in this table.

### 5.2 FIXED — PATTERN B (admitted)

| # | `subject_type` (**OWNER-APPROVED**) | Family name | Basis | Controlling source | Admission |
|---|---|---|---|---|---|
| B1 | `evidence_anchor` | Evidence anchor | [table] | CEM §5.7.4 row 8; §9.2.1. Step 2 §4.2, §9.1 | **PERMITTED** |
| B2 | `knowledge_unit_relation` | Knowledge-unit relation | [table] | CEM §5.7.4 row 9; §11.1.1 ("It follows **Pattern B**"). Step 2 §9.1 label "knowledge object relation" | **PERMITTED** |
| B3 | `review_decision_event` | Review / decision event | [table] | CEM §5.7.4 row 12; §12.2. Step 2 §9.1, Step 3 §16.2, Step 4 §18.2 all rely on it without re-assigning | **PERMITTED** |
| B4 | `governance_audit_event` | Governance / audit event | [table] | CEM §5.7.4 row 13; §21.1 | **PERMITTED** |
| B5 | `governance_binding` | Governance binding | [table] | CEM §5.7.4 row 14; §16.1 | **PERMITTED** |
| B6 | `rights_document_anchor` | Rights or document anchor | [text] | CEM §9.4 (rights evidence needs its own anchor concept, same Pattern B semantics as scientific anchors). Step 2 §9.1 records the [text] basis; Step 3 §16.2 confirms | **PERMITTED** |
| B7 | `typed_evidence_link` | Typed evidence link | [derived] Step 2 | Step 2 §9.1 — Step 2 determination on the Pattern B criterion; §6.1 | **PERMITTED** |
| B8 | `derivation_record` | Derivation record | [derived] Step 2 | Step 2 §9.1 — Step 2 determination on the Pattern B criterion; §7.2 | **PERMITTED** |

**Adjudication is not a separate family.** Step 2 §9.1 records that the coverage
assignment names no adjudication family; adjudication decisions are review/
decision events on the immutable substrate. B3 covers them. Step 3 §16.2 uses
B3 for review events, validation determinations (§5) and adjudications (§10) as
*semantic uses* of one family.

### 5.3 UNRESOLVED — DO NOT ADMIT

Each row fails §3 criterion (2). **Runtime admission is FORBIDDEN.** Any
consequential path depending on any of these MUST FAIL CLOSED (Step 1 §10.3;
Step 2 §3.5; Step 3 §16.3).

| # | Family | Why unresolved | Controlling source |
|---|---|---|---|
| U1 | Construct ↔ scale mapping | CEM §5.7.4 row 11 records "**A or B, per §10.4**" and §10.4.1 states both realizations are admissible, deferring the choice. Selecting one here would be invention | CEM §5.7.4, §10.4.1, §26.6(28); Step 3 §16.3 |
| U2 | Cross-source participating position | CEM §5.7.4 row 10 records "**B (or A, per §13.2)**"; §13.2.1 defers the realization | CEM §5.7.4, §13.2.1, §26.6(29); Step 2 §9.1, Step 3 §16.3 |
| U3 | Source-descriptor family | **M-1.** No controlling source fixes Pattern A/B | Step 1 §14.1; Step 2 §3.5, §9.1; Step 3 §16.3 |
| U4 | Identity-determination family | **M-1.** As U3 | Step 1 §14.1; Step 2 §3.5, §9.1; Step 3 §16.3 |
| U5 | External-identifier-attachment family | **M-1.** As U3. CEM §2.2/§3.5 additionally forbid an external identifier ever becoming a governed instance identity | Step 1 §3.5, §14.1; Step 2 §3.5, §9.1 |
| U6 | Cross-source validation exercise (`rgkb.cross_source_validation`) | Named as an entity carrying identity and scope (CEM §13.2), but **no coverage-assignment row and no Step register assigns it**. Whether it is a governed family at all, and its pattern, are both unfixed | CEM §13.2; absent from §5.7.4 and from Step 2 §9.1 / Step 3 §16.1 / Step 4 §18.1 |
| U7 | KU-version ↔ construct mapping (`rgkb.knowledge_unit_version_construct`) | CEM §10.6 names it. It is **not** the Knowledge-unit relation family: §11.1 binds KU version ↔ KU version, while §10.6 binds KU version ↔ construct. No source assigns it | CEM §10.6 vs §11.1; absent from §5.7.4 |
| ~~U8~~ | ~~Instrument scale as a distinct family~~ | **RETIRED IN RC1 — NOT UNRESOLVED.** The pre-RC1 draft treated `rgkb.instrument_scale` as unfixed. That was a source-fidelity defect: CEM §5.7.4 row 6 assigns Pattern A to instrument scale explicitly, and §10.7.3 names its "identity / version". The family is admitted at **A11**. What remains open is only its physical table shape, recorded as a Tier 2 realization note (§16.4), not as a pattern question | CEM §5.7.4 row 6, §10.3, §10.7.2, §10.7.3; Step 3 §16.2; Step 4 §18.2 |
| U9 | Reviewer identity (`rgkb.reviewer`) | CEM §12.4 names it and defers its mechanics; **F-12** (platform-role vs reviewer-authority) is DEFERRED. No pattern assigned | CEM §12.4, §26.7; Step 1 §14.4 (F-12) |
| U10 | Contributor | CEM §6.5 recognizes contributor normalization as required and **deliberately defers** it; **F-14** DEFERRED | CEM §6.5, §26.7; Step 1 §14.4 (F-14) |

**Nine families are unresolved:** U1–U7, U9, U10. `U8` is retired in place rather
than renumbered, so that every other identifier — and every cross-reference to
it, including in the Owner's review record — stays byte-stable. `U8` MUST NOT be
reused for a different family.

**Nothing in this section is a recommendation.** Where two realizations are
admissible (U1, U2), this document states both and selects neither.

### 5.4 EXCLUDED — NOT A `governed_instance`

Each row fails §3 criterion (1). These are **not catalog candidates**; excluding
them is not a deferral.

| # | Candidate | Why excluded | Controlling source |
|---|---|---|---|
| X1 | **Pattern A stable identities** (the `governed_object` level of every A-row above) | An enduring conceptual identity is never a governed instance and is never a governance-act target | Step 1 §2.1, §2.2, §3.1, §11.1; CEM §5.1 |
| X2 | Orchestration Event Record / Governed Request Envelope | Student-linked, session-linked operational runtime data, outside canonical `rgkb`, "**not assigned a Pattern A or Pattern B classification of any kind**" | Step 5 §19.2, §19.4; Step 6 §19.3; Step 7 §3.4, §4.1; CEM §22 |
| X3 | Integrated Career Profile **instance** | A rendered profile is student-linked runtime output and MUST NOT enter the canonical substrate in any form. (Distinct from A10, which is the *architecture template*) | Step 4 §18.4, §11.1; CEM §22.1 |
| X4 | Interpretation claim record | Either exactly a rule version's declared output constraint (already A3), or runtime output (never canonical) | Step 4 §18.4, §14.6 |
| X5 | Discrepancy record | Student-level discrepancy is runtime operational data represented under Step 4 §18.3 vocabularies | Step 4 §18.4, §8.1 |
| X6 | Controlled vocabularies / classifications (all of them) | A controlled value set is not a governed family, carries no independent identity, and is never a citable governed instance. Covers Step 3 §4.1 outcome vocabularies; Step 4 §18.3 (taxonomy rows, origin labels A–E, disagreement dispositions, uncertainty states, `rule_class`); Step 5 §19.4 (object/event classification, role set, Tier model, disposition set, trigger classes, outcome states); Step 6 §19.2 (all eight concepts, incl. content domains, action categories, safeguarding routing conditions, consequentiality use classification, the six privacy/safeguarding dimensions) | Step 3 §4.1; Step 4 §18.3; Step 5 §19.4; Step 6 §19.2, §19.4 |
| X7 | `rights_permission` | A typed permission **carried by** a rights decision version — a component of A5, not an independent family | CEM §7.2 |
| X8 | Operational / student assessment data (results, responses, item data, platform-derived norms, profiles) | Operational-data boundary: student-linked or student-level operational data MUST NOT enter the canonical knowledge substrate | CEM §3.3, §10.5; Step 1 §13 |

## 6. Per-family record

§5's tables carry, for each family: the proposed canonical `subject_type`
identifier, the human-readable family name, the FIXED A / FIXED B / EXCLUDED /
UNRESOLVED state, the controlling source, the exact rationale, and whether
runtime admission is permitted. No family carries a fifth state.

**Runtime admission summary.** Permitted: A1–A11, B1–B8 (**19 families**), and
only once Tier 2 is separately authorized (§16). Forbidden: U1–U7, U9, U10
(**9 unresolved families**) and X1–X8 (**8 excluded**, not governed instances).

## 7. Explicit unresolved register

| ID | Unresolved item | State | Fail-closed behaviour while unresolved |
|---|---|---|---|
| U1 | Construct ↔ scale mapping realization | UNRESOLVED | Not admitted; no consequential path may depend on it (Step 3 §16.3, §7.6, §13.4) |
| U2 | Cross-source participating position realization | UNRESOLVED | Not admitted; as U1 |
| U3–U5 | Source-descriptor / identity-determination / external-identifier-attachment | UNRESOLVED (**M-1**) | Not admitted; source-identity governance must cite the exact governed descriptor or determination instance and never a bare enduring source identity (Step 2 §3.5) |
| U6 | Cross-source validation exercise | UNRESOLVED | Not admitted |
| U7 | KU-version ↔ construct mapping | UNRESOLVED | Not admitted |
| ~~U8~~ | ~~Instrument scale as a distinct family~~ | **RETIRED IN RC1** — not unresolved; admitted at A11 | n/a — only its physical table shape remains a Tier 2 design question (§16.4) |
| U9 | Reviewer identity | UNRESOLVED (**F-12** DEFERRED) | Not admitted |
| U10 | Contributor | UNRESOLVED (**F-14** DEFERRED) | Not admitted |
| ~~ID-1~~ | ~~The `subject_type` machine-identifier vocabulary itself~~ | **CLOSED — APPROVED BY OWNER DECISION, 2026-08-25** (§11, ODQ-9) | n/a — the 19 spellings are now normative |

**Count:** nine unresolved **families** (U1–U7, U9, U10) — **unchanged by the
ODQ-9 decision**. **ID-1 was never a family row**; it was the
identifier-vocabulary item, counted separately, and it is now closed.

Additionally carried, untouched by this document: **F-04 OPEN**, **F-07 OPEN**.
This document implements no dependency re-binding workflow and no current-version
resolution semantics, and closes neither finding.

## 8. M-1 treatment

**M-1 remains OPEN. This document does not close it.**

Step 1 §14.1 states M-1 precisely: "The pattern assignment of the source,
source-expression, source-manifestation, and external-identifier levels is not
fixed by the controlling coverage assignment. This specification does not fix it
and does not infer it."

Step 2 §3.5 confirms the same for Step 2 and records that **both** realizations
remain architecturally admissible, each with a stated consequence — a Pattern A
descriptor family with immutable descriptor versions, or a Pattern B
determination family with governed replacement relationships. Step 3 §16.3
repeats the non-assignment.

**No accepted controlling source contains a later resolution.** The Canonical
Entity Model §26.6 lists the v0.2.1-introduced physical-realization questions and
M-1's families are not among them; §26.7 records F-04–F-14 as unresolved.
Searching the accepted Steps 1–7 finds only restatements of non-assignment, never
an assignment. Therefore U3, U4 and U5 remain **UNRESOLVED — DO NOT ADMIT**, and
the Owner decision is recorded at **ODQ-1** rather than taken here.

**What this document does carry forward** (already normative, and not a
closure): source-identity governance MUST cite the exact governed descriptor or
determination instance, and MUST NOT cite a bare enduring source or expression
identity (Step 2 §3.5, from Step 1's A1 constraint). That constrains any later
resolution; it does not resolve M-1.

## 9. Owner Decision Queue

Only genuinely unresolved governance choices appear here. **No option is
recommended**, and none is preferred for implementation convenience.

**Queue status.** One item is closed by Owner decision (ODQ-9, 2026-08-25); one
is retired as never having been a genuine decision (ODQ-4, RC1); **seven remain
OPEN**: ODQ-1, ODQ-2, ODQ-3, ODQ-5, ODQ-6, ODQ-7, ODQ-8. No identifier has been
renumbered.

| ODQ | State |
|---|---|
| ODQ-1 — M-1 source-hierarchy families | **OPEN** |
| ODQ-2 — construct ↔ scale realization | **OPEN** |
| ODQ-3 — cross-source position realization | **OPEN** |
| ~~ODQ-4~~ — instrument scale | **RETIRED IN RC1** |
| ODQ-5 — cross-source validation exercise | **OPEN** |
| ODQ-6 — KU-version ↔ construct mapping | **OPEN** |
| ODQ-7 — reviewer identity | **OPEN** |
| ODQ-8 — contributor | **OPEN** |
| ODQ-9 — `subject_type` vocabulary | **APPROVED / CLOSED BY OWNER DECISION — 2026-08-25** |

---

**ODQ-1 — M-1: pattern assignment for the source-hierarchy families**
- **Families:** source-descriptor; identity-determination; external-identifier-attachment.
- **Question:** is each family Pattern A or Pattern B?
- **Admissible choices:** (a) Pattern A — stable descriptor identity + immutable descriptor versions, correction produces a new version; (b) Pattern B — immutable determination records, correction produces a new record with a governed replacement relationship. Both are architecturally admissible (Step 2 §3.5). The choice may differ per family.
- **Evidence:** Step 1 §14.1; Step 2 §3.5, §9.1; Step 3 §16.3; CEM §6, §26.7.
- **Consequence:** (a) yields version-citation semantics and a draft-exit immutability boundary; (b) yields record-citation semantics and a first-governance-use boundary. Either way the architectural requirement is unchanged: immutability after the boundary, exact historical identity, reconstructability.
- **While unresolved:** not admitted; no consequential path may depend on these families; M-1 stays OPEN.

**ODQ-2 — Construct ↔ scale mapping physical realization**
- **Question:** Pattern A versioned governed assertion, or Pattern B immutable append-only assertion?
- **Admissible choices:** exactly the two the architecture names (CEM §10.4.1).
- **Evidence:** CEM §5.7.4 row 11, §10.4.1, §26.6(28); Step 3 §16.3.
- **Consequence:** determines whether a guardrail evaluation or interpretation-rule binding cites a mapping *version* or a mapping *record*. The requirement — immutability and exact historical identity — holds either way.
- **While unresolved:** not admitted; consequential paths depending on it FAIL CLOSED.

**ODQ-3 — Cross-source participating position physical realization**
- **Question:** Pattern B records, or Pattern A versioned positions?
- **Evidence:** CEM §5.7.4 row 10, §13.2.1, §26.6(29); Step 2 §9.1; Step 3 §16.3.
- **Consequence:** determines how a historical adjudication reconstructs the competing positions it considered.
- **While unresolved:** not admitted.

**~~ODQ-4~~ — RETIRED IN RC1. No Owner decision is required.**
- The pre-RC1 draft asked whether `instrument_scale` is a distinct governed family and what pattern it carries. **The controlling source already answers both.** CEM §5.7.4 row 6 assigns Pattern A to "Instrument / instrument version / **instrument scale**"; §10.3 names `rgkb.instrument_scale` as a canonical registry entity; §10.7.3 names the "canonical RGKB **instrument-scale identity / version**"; Step 3 §16.2 and Step 4 §18.2 both rely on the row as already assigned. Asking the Owner to decide it would have manufactured an Owner decision the sources do not require.
- **Disposition:** admitted at **A11 — FIXED, Pattern A**. Only its physical table shape remains, as a Tier 2 realization note (§16.4) — not an Owner governance decision.
- **`ODQ-4` MUST NOT be reused** for a different question. Numbering is held stable; ODQ-5 … ODQ-9 keep their identifiers.

**ODQ-5 — Is the cross-source validation exercise a governed family?**
- **Evidence:** CEM §13.2; absent from §5.7.4 and from every Step register.
- **While unresolved:** not admitted.

**ODQ-6 — Is the KU-version ↔ construct mapping a governed family, and which pattern?**
- **Note:** it is **not** covered by the Knowledge-unit relation row (B2), which binds version ↔ version (CEM §11.1), whereas this binds version ↔ construct (CEM §10.6).
- **While unresolved:** not admitted.

**ODQ-7 — Is reviewer identity a governed family?** (interacts with **F-12**, DEFERRED). **While unresolved:** not admitted.

**ODQ-8 — Is contributor a governed family?** (interacts with **F-14**, DEFERRED; CEM §6.5 defers it deliberately). **While unresolved:** not admitted.

**ODQ-9 — Approve the `subject_type` machine-identifier vocabulary — APPROVED / CLOSED BY OWNER DECISION, 2026-08-25**
- **Question asked:** are the **19** proposed identifiers in §5.1/§5.2 accepted as the runtime `subject_type` codes? (18 pre-RC1, plus `instrument_scale` added at A11.)
- **Evidence presented:** no accepted source defines a `subject_type` code vocabulary (§11). Each identifier is a semantics-free snake_case rendering of the family name its controlling source uses.
- **Owner decision (recorded verbatim):** „ვამტკიცებ ODQ-9-ს — 19 subject_type კოდი მიღებულია." — *ODQ-9 approved; the 19 subject_type codes are accepted.*
- **Date:** 2026-08-25.
- **Effect.** All **19** identifiers listed in §5.1/§5.2 are the **accepted runtime `subject_type` vocabulary** for the 19 admitted families. Their **spelling is now normative** for later, separately authorized Tier 2 implementation. ODQ-9 and its register entry `ID-1` are **CLOSED**.
- **Explicitly NOT decided by this act.** It does **not** authorize catalog population, Tier 2 implementation, SQL or migration, or any `governed_instance.subject_type` / `.pattern` change. It does **not** resolve M-1 and does **not** resolve ODQ-1, ODQ-2, ODQ-3, ODQ-5, ODQ-6, ODQ-7 or ODQ-8. It changes **no** Pattern A/B assignment, closes neither F-04 nor F-07, changes no P-gate, and authorizes neither WP03 nor pilot, real data, production, deployment or Phase 9.
- **Relationship to classification.** The family-to-pattern classifications of §5.1/§5.2 are **exactly unchanged** by this decision. They never depended on identifier spelling (§11), and approving the spellings did not revisit them.

---

## 10. Prohibited / invented mappings register

Recorded so a later reader can verify that none of the following happened.

**No subject type was invented.** Every admitted family traces to a named family
in a controlling source (§5.1, §5.2 cite the exact section per row).

**No pattern assignment was invented.** Every admitted assignment carries a
[table], [text] or [derived] basis, and every [derived] basis is an *existing*
Step-level determination (Step 2 §9.1, Step 3 §16.1, Step 4 §18.1) — this
document makes no new [derived] determination of its own.

**No assessment family was classified.** RIASEC, Big Five, CAAS, EQ,
Employability Skills and Work Values are **not** catalog families. They are
instruments in the operational product; any RGKB-canonical representation of one
would be an *instance* of A6 (and its scales instances of A11), created only by a
separately authorized curation act — never by this document, which creates no
rows. Likewise, the operational scoring channels those products expose are **not**
A11 instances: CEM §10.7.1 places the operational side outside canonical RGKB, and
§10.7.3 forbids strings and aliases from being the authoritative correspondence.

**No stable identity was admitted as a governed instance** (X1).

**No operational or student data was reclassified as canonical knowledge** (X8).

**No forbidden semantics is encoded in any identifier** (§11).

**No conflict was silently reconciled.** One naming divergence was found and is
recorded, not reconciled: Step 2 §9.1 uses local labels ("governed knowledge
object", "governed localized text", "knowledge object relation", "review,
decision or adjudication record") for four coverage-assignment families, and
§9.1 itself supplies the explicit mapping and states these "MUST NOT be
represented as verbatim coverage-table names". §5.1/§5.2 use the coverage-table
family names and record the Step 2 labels as local terminology. This is a
documented mapping, not a conflict. **No substantive conflict between
controlling sources was found**; had one been found it would appear in §9 for
Owner adjudication rather than being resolved here.

## 11. `subject_type` identifier discipline

No accepted source defines a `subject_type` code vocabulary — verified by search
across the Canonical Entity Model and Steps 1–7. The only `subject_type` mention
in the Canonical Entity Model (§12.6) is the **prohibition** on unconstrained
`subject_type` + `subject_id` polymorphism.

The 19 identifiers of §5.1/§5.2 were therefore put to the Owner separately from
the normative family classification, which does not depend on them.

> **OWNER DECISION — 2026-08-25: APPROVED.** „ვამტკიცებ ODQ-9-ს — 19
> subject_type კოდი მიღებულია." The **19** identifiers in §5.1/§5.2 are the
> **accepted runtime `subject_type` vocabulary**, and their **spelling is
> normative** for later separately authorized Tier 2 implementation. ODQ-9 and
> `ID-1` are CLOSED (§7, §9).

**The accepted vocabulary size is exactly 19.** Under this accepted vocabulary,
and until a new controlled specification version says otherwise:

- no alias may be added for any accepted identifier;
- no `_version` variant may be added;
- no Pattern A/B encoding and no lifecycle/status encoding may be added;
- no accepted identifier may be renamed;
- **no twentieth identifier may be introduced.** A new identifier would require a
  new admitted family, which requires a controlling-source assignment plus a new
  controlled specification version (Step 1 §2.5).

**Construction rule used:** lowercase snake_case of the controlling source's own
family name. Nothing else.

**Forbidden encodings — none present.** No identifier encodes Pattern A/B,
lifecycle state, validation state, approval state, scientific judgment, grade,
source authority, or ordering.

- No `_a` / `_b` / `pattern_` element, and **no `_version` suffix** — a
  `_version` suffix would encode Pattern A, since only Pattern A families have
  versions. `knowledge_unit` is the family; that its governed instances are
  versions is carried by `pattern = 'A'`, not by the identifier. This is why
  A6 is `instrument` and not `instrument_version`, and why A11 is
  `instrument_scale` and not `instrument_scale_version`.
- No `draft`, `approved`, `validated`, `active`, `retired`, `current`, `ready`
  element.
- No numeric or ordinal element; no grade or developmental element; no source or
  authority element.
- `validation_derivation_rule` and `validation_applicability_matrix` name the
  *subject matter* of those families, which is what their controlling source
  calls them (Step 3 §16.1); neither asserts a validation state.

## 12. Fail-closed rules

1. **Unresolved family, any use.** A family in §5.3 MUST NOT be admitted. Any
   consequential path depending on one MUST FAIL CLOSED (Step 1 §2.5, §10.3).
2. **Pattern mismatch.** If a `governed_instance.pattern` value does not equal
   this catalog's assignment for its `subject_type`, that is a governance/schema
   fault that MUST FAIL CLOSED and MUST NOT be silently corrected (Step 1 §2.1).
3. **Unassigned family admitted.** Admission of a family with no fixed
   assignment is itself a fault and MUST FAIL CLOSED (Step 1 §2.5).
4. **Stable identity cited as a governance subject.** A governance act citing a
   stable identity, `domain_code`, `version_sequence`, or external identifier as
   its authoritative subject MUST FAIL CLOSED (Step 1 §11.1).
5. **Excluded object registered.** Registering any §5.4 candidate in
   `governed_instance` is a fault and MUST FAIL CLOSED.
6. **Reclassification.** Moving a family between Pattern A and Pattern B requires
   explicit owner adjudication **and** a new controlled specification version. It
   MUST NOT occur in place and MUST NOT be applied retroactively unless
   separately adjudicated (Step 1 §2.5; CEM §5.7).
7. **Absence is never permission.** Absence of an assignment, of evidence, or of
   an Owner decision is not authorization to admit (Step 1 §1.3).

## 13. Traceability matrix

| Requirement | Controlling source | Where discharged here |
|---|---|---|
| Catalog fixes each family's A/B assignment | Step 1 §2.5 | §5.1, §5.2 |
| Assignments drawn from the coverage assignment | Step 1 §2.5 | §2 tier 1; [table] rows |
| Unresolved family MUST NOT be admitted | Step 1 §2.5 | §3, §5.3, §12.1 |
| Each family carries exactly one A/B assignment | Step 1 §4 | §5 (each family appears once) |
| Catalog membership is not eligibility | Step 1 §2.5 | §3 |
| Pattern is DERIVED, not independently writable | Step 1 §2.1 | §4, §12.2 |
| Stable identities excluded from the registry | Step 1 §2.1, §2.2 | §4 callout, X1 |
| Pattern A/B criteria | CEM §5.7.1–§5.7.3; Step 1 §2.3, §2.4 | §4 |
| Coverage assignment table | CEM §5.7.4 | §5.1 A1–A7 **and A11**, §5.2 B1–B5 |
| Instrument scale is a canonical registry entity under Pattern A | CEM §5.7.4 row 6; §10.3; §10.7.2; §10.7.3; Step 3 §16.2; Step 4 §18.2 | A11 |
| Canonical vs operational scale identity (correspondence is operational) | CEM §10.7.1, §10.7.3, §10.7.5 | A11 note, §10, X8 |
| Rights/document anchor Pattern B outside the table | CEM §9.4 | B6 |
| Step 2 assignment register | Step 2 §9.1 | A1, A7, B1, B2, B3, B6, B7, B8 |
| Step 3 assignment register | Step 3 §16.1 | A8, A9 |
| Step 4 assignment register | Step 4 §18.1 | A10 |
| Steps 5/6/7 introduce zero families | Step 5 §19.1; Step 6 §19.1; Step 7 §3.4, §16.5 | §2 tier 5, X2, X6 |
| Controlled vocabularies are not families | Step 3 §4.1; Step 4 §18.3; Step 5 §19.4; Step 6 §19.4 | X6 |
| Runtime provenance is outside `rgkb` | CEM §22; Step 5 §19.2 | X2 |
| Student-linked data excluded | CEM §3.3, §10.5; Step 1 §13 | X3, X5, X8 |
| M-1 not closed | Step 1 §14.1; Step 2 §3.5; Step 3 §16.3 | §8, U3–U5, ODQ-1 |
| F-04 / F-07 not closed | Step 1 §14.1 | §7, §15 |
| Reclassification requires adjudication + new version | Step 1 §2.5 | §12.6 |

## 14. Self-audit results

Performed against §12 of the authorizing package. Result: **PASS**, with the
corrections noted.

| Check | Result |
|---|---|
| No invented catalog membership | **PASS** — every admitted family cites a named family in a controlling source |
| No invented Pattern assignment | **PASS** — every assignment carries [table]/[text]/[derived] provenance; no new [derived] determination is made by this document |
| No M-1 silent closure | **PASS** — §8; U3–U5 unresolved; ODQ-1 raised |
| No Pattern A/B conflation | **PASS** — §4 separates the criteria; the two "A or B" coverage rows (U1, U2) are left unresolved rather than collapsed |
| No stable identity entered as `governed_instance` | **PASS** — §4 callout and X1 state it explicitly |
| No operational/student data misclassified as RGKB knowledge | **PASS** — X2, X3, X5, X8 |
| No runtime implementation | **PASS** — §15 |
| No WP03 semantics | **PASS** — no evidence/provenance runtime design appears; Step 2 is used only as an assignment source |
| F-04 OPEN | **PASS** — untouched |
| F-07 OPEN | **PASS** — untouched |
| Tier 2 still BLOCKED | **PASS** — §15 |
| P-gates unchanged | **PASS** — only PRM-WP18 may change one |

### 14.1 RC1 self-audit (after Owner review)

| Check | Result |
|---|---|
| §5.7.4 row 6 represented without narrowing its Pattern A coverage | **PASS** — all three named entities of row 6 are carried; none is left unassigned |
| Instrument stable identity is not treated as a `governed_instance` | **PASS** — X1 and §4 hold for A6 and A11 alike; the governed instance is the version |
| `instrument_version` is not made a separate subject type | **PASS** — §5.1 states the rule explicitly and no such row exists |
| `instrument_scale` Pattern A coverage preserved | **PASS** — A11, [table] basis |
| Physical table design not invented | **PASS** — §16.4 records the shape as a Tier 2 design question and specifies none |
| All classification counts reconcile | **PASS** — 11 + 8 + 9 + 8 = 36 in §5, §6, §7, §16 |
| Every ODQ item is a genuinely unresolved question | **PASS** — ODQ-4 retired because the source answers it; 8 items remain |
| No other admitted A/B assignment changed without source evidence | **PASS** — A1–A10 and B1–B8 are byte-unchanged by RC1 |

**RC1 correction (Owner-identified, material).** The pre-RC1 draft placed
`rgkb.instrument_scale` under UNRESOLVED (U8) with an Owner decision (ODQ-4).
Re-reading the sources directly confirms that was a **source-fidelity defect**,
not a conservative choice: CEM §5.7.4 row 6 assigns Pattern A to instrument
scale by name; §10.3 names `rgkb.instrument_scale` as a canonical registry
entity; §10.7 opens by recording that v0.2 "correctly established canonical
instrument identity, instrument version, instrument scale/channel"; §10.7.2
exposes canonical identifiers for the "instrument version and/or instrument
scale"; §10.7.3 names the "canonical RGKB instrument-scale **identity /
version**", which is precisely a Pattern A structure; and Step 3 §16.2 and Step 4
§18.2 both rely on the row as already assigned. What is genuinely open is only
the **physical table shape**, and CEM §26.6 does not even list it among the
deferred realization questions. Converting a physical-shape question into an
unresolved *pattern* question understated what the controlling source fixes and
would have manufactured an unnecessary Owner decision. Corrected: A11 admitted;
U8 and ODQ-4 retired in place; counts, cross-references and §16 reconciled.

**Corrections made during the original self-audit** (autonomous,
documentation-only):

1. *(Superseded by RC1.)* `instrument_scale` was moved out of A6 into U8/ODQ-4.
   RC1 reverses this: the family is admitted at **A11**, and the reasoning above
   records why the original move was wrong.
2. **KU-version ↔ construct mapping was initially assumed covered by B2.** CEM
   §11.1 binds KU version ↔ KU version; §10.6 binds KU version ↔ construct.
   Different relations. **U7 / ODQ-6** were raised rather than admitting it under
   B2's assignment.
3. **`_version`-suffixed identifiers were rejected.** A `_version` suffix encodes
   Pattern A, which §11 forbids. Family-level identifiers are used instead.
4. **Two unassigned entities were nearly omitted.** `rgkb.cross_source_validation`
   (U6) and `rgkb.reviewer` (U9) are named by the architecture but assigned by no
   register; omitting them silently would have left a later implementer free to
   admit them. Both were added as UNRESOLVED.

### 14.2 ODQ-9 formalization self-audit (2026-08-25)

| Check | Result |
|---|---|
| Exactly 19 approved identifiers | **PASS** — 11 in §5.1 + 8 in §5.2 |
| All 19 map one-to-one to the 19 admitted families | **PASS** — one identifier per row, no row without one, no identifier without a row |
| No identifier changed spelling | **PASS** — the §5.1/§5.2 identifier column is byte-unchanged; only the column header's status label changed |
| Pattern A count remains 11 | **PASS** |
| Pattern B count remains 8 | **PASS** |
| Unresolved family count remains 9 | **PASS** — U1–U7, U9, U10 |
| Excluded count remains 8 | **PASS** — X1–X8 |
| ODQ-9 only is closed by this Owner decision | **PASS** — §9 queue table |
| All other ODQs preserve their prior state | **PASS** — ODQ-1/2/3/5/6/7/8 OPEN, ODQ-4 RETIRED; no renumbering |
| No implementation authorization implied | **PASS** — §9 ODQ-9 "Explicitly NOT decided", §15, §16.0 |

No documentation inconsistency was found requiring correction beyond the status
updates themselves. The `ID-1` register row (§7) was closed in step with ODQ-9,
because it was the same item under its register identifier.

## 15. Explicit statement: no implementation

**NO IMPLEMENTATION WAS PERFORMED.** This document creates no schema, no
migration, no SQL, no DDL, no RLS or auth policy, no grant, no function, and no
catalog row. It does not populate `rgkb.subject_type_catalog`, does not alter
`rgkb.governed_instance`, does not modify the resolver, and does not touch the
merged PRM-WP02 Tier 1 migration or its tests.

It does not authorize `governed_instance.subject_type`,
`governed_instance.pattern`, any concrete Pattern A/B table, `object_id`,
`domain_code`, `version_sequence`, catalog population, stable-identity/version
runtime implementation, or PRM-WP03.

**The ODQ-9 Owner approval (2026-08-25) does not change any of the above.**
Approving the 19 identifier spellings is a naming decision recorded in a
document; it creates nothing, populates nothing, and authorizes nothing.

**PRM-WP02 Tier 2 remains BLOCKED pending a separate Human Gate.** **WP02 is NOT
CLOSED.** **F-04 OPEN. F-07 OPEN. M-1 OPEN.** Seven Owner decisions remain OPEN
(§9). **P1–P16 unchanged** — only PRM-WP18 may change a P-gate state. **Pilot NOT
AUTHORIZED. Real data NOT AUTHORIZED. Phase 9 NOT AUTHORIZED.**

## 16. Future Tier 2 implementation implications

Recorded as implications of this specification, not as authorization.

0. **What the Owner has and has not accepted so far.** The **19 `subject_type`
   codes are Owner-approved** (ODQ-9, 2026-08-25) and their spelling is normative
   for Tier 2. The **family classifications of §5.1/§5.2 stand as specified**,
   awaiting acceptance of this specification as a whole. **Neither approval
   authorizes any implementation:** actual catalog population and runtime
   implementation still require a **separate Human Gate**, and **Tier 2 remains
   BLOCKED** until it is granted. **WP02 remains NOT CLOSED.**
1. **Catalog population would be a separately authorized act.** If the
   specification is accepted, the **19** admitted families of §5.1/§5.2 become
   the permitted membership, under the Owner-approved codes. The Tier 1 `RG020`
   admission guard exists precisely to keep the catalog empty until then, and its
   removal or replacement is Tier 2 work requiring its own gate.
2. **`governed_instance.subject_type` and `.pattern` become implementable** — but
   only against accepted membership, with `pattern` DERIVED from the catalog and
   a fail-closed mismatch check (Step 1 §2.1; §12.2 here).
3. **Concrete member tables remain family-by-family work.** **Eleven** Pattern A
   families need stable-identity + version tables; **eight** Pattern B families
   need append-only record tables. The Tier 1 `RG010` guard is replaced by real
   atomic creation enforcement only when the first concrete family exists.
4. **Physical realization questions that are NOT pattern questions.** The
   following families are FIXED, but their physical stable-identity / version
   table shape is a Tier 2 design question: **A11 `instrument_scale`** — CEM
   §10.7.2 exposes its canonical identifiers "as determined by Controlled Schema
   Specification", and §10.7.3's chain requires a resolvable instrument-scale
   identity/version, without fixing table shape. Designing it is Tier 2 work; it
   is **not** an Owner pattern decision and **not** an unresolved assignment.
   Relatedly, the operational scale ↔ scoring-channel **correspondence** is owned
   by the operational domain, not by RGKB (CEM §10.7.1, §10.7.5), and is outside
   this catalog entirely.
5. **`object_id` / `domain_code` / `version_sequence` attach to Pattern A tables
   only**, and remain non-governance-act targets (Step 1 §3, §11.1).
6. **The nine unresolved families — U1–U7, U9 and U10 — stay outside Tier 2**
   until their ODQ items are adjudicated. (`ID-1`, the identifier-vocabulary
   item, is not a family and is counted separately; `U8` is retired, §5.3.)
   Tier 2 may proceed for the admitted families without them, provided every path
   touching an unresolved family fails closed.
7. **F-07 is unaffected.** Admitting families supplies the *stable identity*
   substrate the resolver lacks, but not the resolution-scope vocabulary or the
   eligibility applicability inputs. The Tier 1 resolver must continue to fail
   closed as not-evaluable.
8. **No access model is implied.** The substrate's RLS/auth model remains
   separate, later, gated L2 work.
