# RGKB Canonical Entity Model v0.1

Status: WORKING DRAFT — ARCHITECTURE ONLY  
Phase: 7.0 — Canonical Knowledge Database Foundation  
Implementation status: NO DATABASE MIGRATION AUTHORIZED  
Production status: NOT AUTHORIZED  
Retrieval / embeddings status: DEFERRED

---

## 1. Purpose

This document defines the initial canonical entity model for the RasDaEdzeb / Career Development Research-Grounded Knowledge Base (RGKB).

The purpose of the model is to establish a machine-readable scientific knowledge layer that preserves:

- source identity;
- source version identity;
- evidence provenance;
- knowledge-unit granularity;
- construct semantics;
- cross-source relations;
- validation dimensions;
- rights status;
- contextual applicability;
- scientific guardrails;
- interpretation-rule provenance;
- human-review history;
- lifecycle and version state.

The canonical RGKB is not a user-facing content-management system, is not an assessment-results store, and is not an AI prompt repository.

---

## 2. Architectural Boundary

The canonical RGKB will use a dedicated PostgreSQL schema:

`rgkb`

The existing table:

`public.knowledge_resources`

remains a separate presentation / CMS layer and is not the canonical scientific source of truth.

The target architecture is:

Authoritative Sources  
→ Source Characterization  
→ Knowledge Units  
→ Evidence / Provenance  
→ Constructs / Relations / Validation / Guardrails  
→ Approved Interpretation Rules  
→ RGIM  
→ Controlled Application or Publication Projection

Direct browser CRUD against canonical RGKB tables is prohibited by design.

---

## 3. Core Architectural Invariants

1. Source is not the same entity as Source Version.
2. Source is not the same entity as Knowledge Unit.
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
17. Self-efficacy is a process / intervention / outcome construct and must not be converted into an additional assessment merely for integration convenience.
18. Cross-assessment channels are complementary and non-additive.
19. Discrepancy across assessment channels is an inquiry signal, not an averaging target.
20. Consequential AI interpretation requires an appropriate human-review boundary.

---

## 4. Logical Domains

The initial canonical model contains eight logical domains:

1. Source
2. Rights
3. Knowledge
4. Evidence
5. Semantics
6. Relations
7. Validation
8. Governance

Intervention, retrieval, embedding, and agent-specific layers are deferred until the canonical evidence and governance model is stable.

---

## 5. Source Domain

### 5.1 `rgkb.sources`

Represents the intellectual identity of a source.

Examples include:

- book;
- article;
- manual;
- technical report;
- policy document;
- validated professional framework.

A `source` is not a specific PDF, scan, edition, translation, or repository copy.

Initial conceptual fields:

- `id`
- `source_code`
- `title`
- `source_type`
- `authors`
- `publication_year`
- `publisher`
- `doi`
- `isbn`
- `canonical_url`
- `original_language`
- `authority_class`
- `lifecycle_status`
- `created_at`
- `updated_at`

`source_code` is a stable human-readable identifier such as `SRC-001`.

The database primary identity may use UUID while preserving stable domain identifiers for provenance and auditability.

---

### 5.2 `rgkb.source_versions`

Represents a specific edition, manifestation, translation, or acquired version of a source.

Examples:

- first edition;
- revised edition;
- publisher PDF;
- repository PDF;
- translated edition;
- scanned copy.

Initial conceptual fields:

- `id`
- `source_id`
- `version_code`
- `version_label`
- `edition`
- `publication_date`
- `language`
- `content_fingerprint`
- `locator_scheme`
- `acquisition_source`
- `lifecycle_status`
- `created_at`

Evidence anchors must resolve to a specific `source_version`, not only to the abstract source.

---

## 6. Rights Domain

### 6.1 `rgkb.source_rights`

Rights status must be represented independently from scientific validity.

Initial conceptual fields:

- `id`
- `source_version_id`
- `rights_status`
- `use_scope`
- `quotation_allowed`
- `derivative_extraction_allowed`
- `machine_processing_allowed`
- `redistribution_allowed`
- `evidence_reference`
- `reviewed_by`
- `reviewed_at`
- `decision_status`
- `notes`

Invariant:

`rights_status = unknown` must never be interpreted as permission.

Rights clearance must not be collapsed into scientific validation.

---

## 7. Knowledge Domain

### 7.1 `rgkb.knowledge_units`

A Knowledge Unit (KU) is the smallest independently governable scientific or professional assertion in the RGKB.

A KU is not:

- an entire chapter;
- an arbitrary paragraph;
- a quotation by itself;
- an AI recommendation;
- a student-specific interpretation;
- an assessment result.

Initial conceptual fields:

- `id`
- `ku_code`
- `statement`
- `knowledge_type`
- `scope`
- `population_scope`
- `developmental_scope`
- `context_scope`
- `certainty_level`
- `source_characterization_status`
- `lifecycle_status`
- `supersedes_ku_id`
- `created_at`
- `updated_at`

Example stable identifier:

`KU-001-CH5-014`

Knowledge Units preserve scientific assertions.

Interpretation logic is represented separately.

---

## 8. Evidence Domain

### 8.1 `rgkb.evidence_anchors`

Represents an exact location inside a specific source version.

Initial conceptual fields:

- `id`
- `source_version_id`
- `locator_type`
- `chapter`
- `section`
- `page_start`
- `page_end`
- `paragraph_locator`
- `anchor_text_hash`
- `notes`

The model must support locator schemes other than page numbers because pagination may differ across versions.

---

### 8.2 `rgkb.knowledge_unit_evidence`

Many-to-many bridge between Knowledge Units and evidence anchors.

Initial conceptual fields:

- `id`
- `knowledge_unit_id`
- `evidence_anchor_id`
- `evidence_role`
- `support_strength`
- `is_primary`
- `notes`

A KU may be supported by one primary anchor and multiple corroborating anchors.

---

### 8.3 `rgkb.citations`

Citation representation is distinct from evidence anchoring.

Evidence answers:

"Which passage supports the assertion?"

Citation answers:

"How should the source be referenced in a generated or reviewed output?"

Initial conceptual fields:

- `id`
- `source_version_id`
- `citation_style`
- `short_citation`
- `full_citation`
- `locator_template`

This entity is a foundation for source-to-answer traceability.

---

## 9. Semantics Domain

### 9.1 `rgkb.constructs`

Canonical vocabulary for theoretical and applied constructs.

Examples include:

- RIASEC interests;
- self-efficacy;
- career adaptability;
- Big Five traits;
- work values;
- employability skills.

Initial conceptual fields:

- `id`
- `construct_code`
- `canonical_name`
- `definition`
- `construct_family`
- `measurement_status`
- `developmental_relevance`
- `lifecycle_status`
- `notes`

---

### 9.2 `rgkb.knowledge_unit_constructs`

Many-to-many relationship between Knowledge Units and Constructs.

Initial conceptual fields:

- `knowledge_unit_id`
- `construct_id`
- `relation_type`
- `notes`

A single Knowledge Unit may legitimately address multiple constructs.

---

## 10. Relations Domain

### 10.1 `rgkb.knowledge_unit_relations`

Represents explicit semantic relationships among Knowledge Units.

Initial controlled predicates:

- `supports`
- `corroborates`
- `refines`
- `extends`
- `qualifies`
- `contradicts`
- `contextualizes`
- `operationalizes`
- `depends_on`
- `supersedes`

Initial conceptual fields:

- `id`
- `subject_knowledge_unit_id`
- `predicate`
- `object_knowledge_unit_id`
- `evidence_basis`
- `validation_status`
- `created_at`

Contradictory evidence must remain machine-visible and must not be silently merged or averaged.

---

## 11. Validation Domain

### 11.1 `rgkb.validation_records`

Validation must be multidimensional.

A single universal `validated = true` flag is prohibited.

Initial conceptual fields:

- `id`
- `subject_type`
- `subject_id`
- `validation_dimension`
- `status`
- `review_method`
- `evidence_reference`
- `reviewer_id`
- `reviewed_at`
- `notes`

Initial validation dimensions may include:

- `scientific`
- `source_identity`
- `extraction_fidelity`
- `cross_source`
- `rights`
- `georgian_context`
- `psychometric`
- `developmental`
- `safeguarding`
- `technical`
- `human_semantic`

Different validation dimensions remain independent unless an explicitly governed gate defines a composite decision.

---

### 11.2 `rgkb.cross_source_validations`

Represents explicit cross-source comparison and adjudication.

Initial conceptual fields:

- `id`
- `validation_code`
- `subject_construct_id`
- `scope`
- `method`
- `outcome`
- `confidence`
- `lifecycle_status`
- `review_record_id`
- `created_at`
- `updated_at`

Cross-source validation does not erase disagreement.

---

## 12. Governance Domain

### 12.1 `rgkb.guardrails`

Guardrails are first-class governed entities.

Examples:

- RIASEC interest scores must not be represented as measures of ability.
- Cross-assessment discrepancy must not be resolved through automatic averaging.
- Consequential AI interpretation requires appropriate human review.

Initial conceptual fields:

- `id`
- `guardrail_code`
- `title`
- `rule_text`
- `severity`
- `scope`
- `trigger_condition`
- `prohibited_action`
- `required_action`
- `evidence_basis`
- `lifecycle_status`
- `version`
- `created_at`
- `updated_at`

---

### 12.2 `rgkb.interpretation_rules`

Interpretation Rules form a governed bridge between validated knowledge and RGIM.

They are not free-form prompts.

Initial conceptual fields:

- `id`
- `rule_code`
- `rule_type`
- `condition_spec`
- `output_constraint`
- `developmental_scope`
- `construct_scope`
- `evidence_requirement`
- `human_review_requirement`
- `lifecycle_status`
- `version`
- `created_at`
- `updated_at`

Every active interpretation rule must be traceable to its evidence basis and applicable guardrails.

---

### 12.3 `rgkb.review_records`

Human review must be represented as a history, not as a single boolean.

Initial conceptual fields:

- `id`
- `subject_type`
- `subject_id`
- `review_type`
- `reviewer_id`
- `decision`
- `rationale`
- `reviewed_at`
- `supersedes_review_id`

Review decisions must remain auditable across revisions.

---

## 13. Access Boundary

Canonical RGKB tables must not be directly writable by ordinary browser clients.

Target access posture:

- `anon`: no direct canonical table access;
- authenticated student: no direct canonical table access;
- parent: no direct canonical table access;
- counselor: no direct canonical table access;
- school admin: no direct canonical table CRUD;
- trusted server-side processes: controlled and purpose-specific access;
- runtime retrieval: purpose-built bounded read boundary.

If a public RPC bridge is required, it must follow hardened repository conventions:

- `SECURITY DEFINER`;
- fixed `search_path`;
- schema-qualified object references;
- explicit authorization inside the function;
- `REVOKE EXECUTE ... FROM PUBLIC`;
- `REVOKE EXECUTE ... FROM anon`;
- minimum necessary `GRANT EXECUTE`;
- bounded return shape;
- audit for consequential access;
- fail-closed behavior.

A generic unrestricted `get_all_rgkb()` endpoint is prohibited.

---

## 14. Traceability Contract

The intended traceability chain is:

AI / RGIM Output  
→ Interpretation Rule  
→ Guardrail / Construct  
→ Knowledge Unit  
→ Evidence Anchor  
→ Source Version  
→ Source

Every consequential machine-generated interpretation must be capable of resolving backward through this chain.

Traceability must distinguish:

- primary evidence;
- corroborating evidence;
- contradictory evidence;
- contextual validation;
- rights status;
- human review state.

---

## 15. Lifecycle and Versioning

Canonical entities that influence machine behavior must support explicit lifecycle state.

Illustrative states may include:

- `draft`
- `under_review`
- `validated`
- `approved`
- `restricted`
- `superseded`
- `retired`
- `quarantined`

Exact enumerations are not authorized by this document and must be finalized before SQL implementation.

Versioning must preserve historical decisions and must not overwrite evidence or review history destructively.

---

## 16. Deferred Components

The following are explicitly outside the Phase 7.0 canonical-core implementation scope:

- pgvector;
- embeddings;
- semantic similarity search;
- RAG pipeline;
- chunk embeddings;
- agent memory;
- automated intervention engine;
- student-specific personalization;
- automatic source extraction;
- production API exposure;
- automatic publication into `public.knowledge_resources`.

These components may be designed only after the canonical evidence, validation, rights, provenance, and governance model is sufficiently stable.

---

## 17. Open Design Questions Before SQL Authorization

The following remain unresolved and require controlled design review:

1. exact database enum strategy versus reference tables;
2. canonical identifier format and immutability rules;
3. generic `subject_type / subject_id` patterns versus typed relation tables;
4. reviewer identity model for internal and external reviewers;
5. content fingerprint algorithm and source-version identity rules;
6. rights-state vocabulary;
7. validation-state vocabulary;
8. lifecycle-state vocabulary;
9. exact cross-source adjudication model;
10. exact RPC / Edge Function read boundary;
11. audit-event schema for RGKB access and governance changes;
12. migration sequencing and rollback strategy.

No SQL migration should be created until these issues are reviewed.

---

## 18. Phase 7.0 Gate

This document authorizes architecture review only.

It does not authorize:

- database migration;
- schema deployment;
- production data ingestion;
- direct client access;
- embeddings;
- automated interpretation;
- RGIM production integration;
- agent production access.

Next gate:

**Canonical Entity Model Review → Controlled Schema Specification → Owner Authorization → SQL Migration Design**