-- =========================================================================
-- RGKB PRM-WP03 — Evidence & Provenance Runtime Foundation (Step 2).
-- =========================================================================
-- Authorized by: Owner PRM-WP03 Human Gate, 2026-08-25, scoped to Step 2 and
-- the M-1 fail-closed boundary.
--
-- Controlling sources:
--   * Step 2 — Knowledge Object / Evidence / Provenance / Citation Substrate
--     v0.1 (semantics)
--   * Step 1 — Governed Object / Versioning / Referential / Lifecycle
--     Substrate v0.1 (identity / version / lifecycle / referential mechanics)
--   * Owner-accepted Controlled Subject-Type Catalog Specification v0.1
--   * Merged WP02 Tier 1 + Tier 2 migrations (the governed-family substrate)
--
-- THIS MIGRATION CREATES NO NEW GOVERNED FAMILY. Every governed subject it
-- touches is an already Owner-admitted catalog family, and every governed
-- identity it uses is the WP02 registry instance_id. There is no second
-- instance registry, no second version allocator, no second subject-type
-- catalog, no second Pattern authority and no second provenance authority.
--
-- M-1 IS OPEN AND FAIL-CLOSED. The source, source-expression and
-- source-manifestation levels are created ONLY as enduring conceptual
-- identities (Step 2 §3.5, §7.6): they are not governed instances, are not
-- registered in rgkb.governed_instance, and are never governance-act targets.
-- The governance-bearing source-descriptor, identity-determination and
-- external-identifier-attachment families are NOT created, NOT admitted to the
-- catalog, and NOT assigned a Pattern. Consequently NO cross-level link is
-- created between the three identity levels: the determination that a
-- manifestation is an instance of an expression, or an expression a form of a
-- work, is exactly the curated governance subject M-1 leaves unresolved
-- (Step 2 §3.3), and expressing it as a mechanical foreign key would resolve
-- M-1 by schema convenience. Any path needing that determination therefore
-- fails closed (Step 2 §14.4).
--
-- NOT IMPLEMENTED HERE, deliberately:
--   * F-04 dependency re-binding workflow — OPEN, untouched.
--   * F-07 current-version resolution — OPEN. rgkb.resolve_current_version()
--     is NOT modified; no latest/current/recency/version_sequence heuristic is
--     introduced anywhere.
--   * F-09 rights-document physical entity — DEFERRED; no rights-document
--     identity family is created.
--   * F-12 reviewer identity / F-14 contributor normalization — DEFERRED; no
--     reviewer or contributor governed family is created.
--   * Step 3+ semantics: no validation determination, no interpretation
--     taxonomy, no scoring, no runtime eligibility.
--   * Runtime / student / session decision provenance — OUT OF SCOPE
--     (Step 2 §7.4). No student, session, profile, assessment, school, parent
--     or counselor identifier appears in any canonical table below.
--   * Citation rendering — Step 2 §12.3 defers the rendering architecture; no
--     style template, sequencing or rendered-string authority is created.
--   * Ingestion, crawling, extraction pipelines, embeddings, vector search,
--     RAG, external AI.
--
-- DEFERRED VOCABULARIES are represented as unconstrained NOT NULL / nullable
-- text, never as a closed CHECK list, so that a later controlled
-- specification can fix them without this migration having pre-empted it.
-- Only vocabularies Step 1 / Step 2 actually FIX are constrained: the three
-- CONTENT ORIGIN classes (Step 2 §2.1), the two editorial classes (Step 1 §7),
-- and the four mandatory evidence-role distinctions (Step 2 §6.2).
--
-- ACCESS MODEL: none. Containment only, at least as strict as WP02 — rgkb
-- schema, RLS enabled and forced, ZERO policies, REVOKE from
-- PUBLIC/anon/authenticated, no SECURITY DEFINER, nothing in public. The live
-- Supabase exposed-schema configuration is NOT verified and no remote access
-- is authorized.
--
-- STYLE: single-line string literals only, matching every other migration.
-- =========================================================================

-- -------------------------------------------------------------------------
-- 1) Source domain — ENDURING CONCEPTUAL IDENTITIES ONLY (Step 2 §3.1, §7.6).
--
--    Three distinct levels that MUST NOT be conflated and MUST NOT share one
--    representation (§3.1). None of them carries instance_id, none is
--    registered in rgkb.governed_instance, and none is a governance-act
--    target (§3.5, §7.6, Step 1 §2.1/§2.2/§11.1).
--
--    They carry NO attributes beyond their own identity. In particular they
--    carry no title, no filename, no supplied metadata and no external
--    identifier, because §3.3/§3.4 make the assertion that any such value
--    denotes a given level a governance-bearing determination rather than a
--    mechanical attribute — and that determination is M-1-unresolved.
--
--    They also carry NO cross-level foreign key, for the same reason. This is
--    the fail-closed realization §14.4 requires while M-1 is OPEN, not an
--    omission.
-- -------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS rgkb.source_identity (
  source_id uuid PRIMARY KEY DEFAULT gen_random_uuid()
);

COMMENT ON TABLE rgkb.source_identity IS 'Step 2 §3.1 source level: the abstract intellectual work, as an ENDURING CONCEPTUAL IDENTITY only. Not a governed instance, never registered in rgkb.governed_instance, never a governance-act target (§3.5, §7.6). Carries no descriptor, metadata or external identifier: those are M-1-unresolved governance-bearing determinations.';

CREATE TABLE IF NOT EXISTS rgkb.source_expression_identity (
  expression_id uuid PRIMARY KEY DEFAULT gen_random_uuid()
);

COMMENT ON TABLE rgkb.source_expression_identity IS 'Step 2 §3.1 source-expression level: a specific intellectual form of a work, as an ENDURING CONCEPTUAL IDENTITY only. Scientific evidence claims bind here (§3.2). Not a governed instance and never a governance-act target. It carries no link to a source: the determination that an expression is a form of a work is M-1-unresolved (§3.3, §3.5).';

CREATE TABLE IF NOT EXISTS rgkb.source_manifestation_identity (
  manifestation_id uuid PRIMARY KEY DEFAULT gen_random_uuid()
);

COMMENT ON TABLE rgkb.source_manifestation_identity IS 'Step 2 §3.1 source-manifestation level: a specific acquired representation, as an ENDURING CONCEPTUAL IDENTITY only. Physical locators, pagination, offsets, fingerprints and acquisition provenance resolve here (§3.2). It carries no link to an expression: the determination that a manifestation is an instance of an expression is M-1-unresolved (§3.3, §3.5), and a fingerprint, filename or supplied metadata may never establish it.';

CREATE OR REPLACE FUNCTION rgkb.source_identity_write_guard()
RETURNS trigger
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $$
BEGIN
  IF TG_OP = 'UPDATE' THEN
    RAISE EXCEPTION 'RGKB Step 2 §3.1/§7.6 fail closed: an enduring source-hierarchy identity is stable and is not updatable. It carries identity only; any descriptor, metadata or external-identifier assertion about it is a governance-bearing determination whose family is M-1-unresolved.' USING ERRCODE = 'RG090';
  ELSE
    RAISE EXCEPTION 'RGKB Step 2 §3.1/§7.6 fail closed: an enduring source-hierarchy identity must not be deleted; evidence anchors bound to it must remain resolvable indefinitely (Step 1 §5.3).' USING ERRCODE = 'RG091';
  END IF;
END;
$$;

COMMENT ON FUNCTION rgkb.source_identity_write_guard() IS 'PRM-WP03 immutability guard for the three enduring source-hierarchy identity levels (Step 2 §3.1, §3.3, §7.6).';

DROP TRIGGER IF EXISTS source_identity_write_guard ON rgkb.source_identity;
CREATE TRIGGER source_identity_write_guard
  BEFORE UPDATE OR DELETE ON rgkb.source_identity
  FOR EACH ROW EXECUTE FUNCTION rgkb.source_identity_write_guard();

DROP TRIGGER IF EXISTS source_expression_identity_write_guard ON rgkb.source_expression_identity;
CREATE TRIGGER source_expression_identity_write_guard
  BEFORE UPDATE OR DELETE ON rgkb.source_expression_identity
  FOR EACH ROW EXECUTE FUNCTION rgkb.source_identity_write_guard();

DROP TRIGGER IF EXISTS source_manifestation_identity_write_guard ON rgkb.source_manifestation_identity;
CREATE TRIGGER source_manifestation_identity_write_guard
  BEFORE UPDATE OR DELETE ON rgkb.source_manifestation_identity
  FOR EACH ROW EXECUTE FUNCTION rgkb.source_identity_write_guard();

ALTER TABLE rgkb.source_identity ENABLE ROW LEVEL SECURITY;
ALTER TABLE rgkb.source_identity FORCE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE rgkb.source_identity FROM PUBLIC;
REVOKE ALL ON TABLE rgkb.source_identity FROM anon;
REVOKE ALL ON TABLE rgkb.source_identity FROM authenticated;

ALTER TABLE rgkb.source_expression_identity ENABLE ROW LEVEL SECURITY;
ALTER TABLE rgkb.source_expression_identity FORCE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE rgkb.source_expression_identity FROM PUBLIC;
REVOKE ALL ON TABLE rgkb.source_expression_identity FROM anon;
REVOKE ALL ON TABLE rgkb.source_expression_identity FROM authenticated;

ALTER TABLE rgkb.source_manifestation_identity ENABLE ROW LEVEL SECURITY;
ALTER TABLE rgkb.source_manifestation_identity FORCE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE rgkb.source_manifestation_identity FROM PUBLIC;
REVOKE ALL ON TABLE rgkb.source_manifestation_identity FROM anon;
REVOKE ALL ON TABLE rgkb.source_manifestation_identity FROM authenticated;

-- -------------------------------------------------------------------------
-- 2) Governed localized text (Step 2 §5.3) — Pattern A family, admitted.
--
--    Language is EXPLICIT and mandatory: Step 2 §5.3 states there is no
--    implicit default language for governed content, so the column is NOT NULL
--    with NO DEFAULT and must be non-blank. The exact language-tag vocabulary
--    is not fixed by Step 2 and is therefore not constrained here.
--
--    The governed wording belongs to the VERSION, not to the localization
--    identity, so that historical wording stays resolvable and correction
--    proceeds by a new version rather than a rewrite in place (Step 1 §5.1).
-- -------------------------------------------------------------------------
--    CONTENT ORIGIN applies here too. Step 2 §2.1 binds EVERY governed
--    content-bearing object, and a localized-text version carries governed
--    wording, so it carries its own mandatory exactly-one classification. It
--    is NOT inherited from the knowledge version that references it, and is
--    not inferred from language, position or any other state (§2.5).
ALTER TABLE rgkb.localized_governed_text_version
  ADD COLUMN IF NOT EXISTS language_code text NOT NULL,
  ADD COLUMN IF NOT EXISTS governed_wording text NOT NULL,
  ADD COLUMN IF NOT EXISTS editorial_class text NOT NULL,
  ADD COLUMN IF NOT EXISTS content_origin text NOT NULL,
  ADD COLUMN IF NOT EXISTS origin_derivation_instance_id uuid,
  ADD CONSTRAINT localized_text_language_explicit CHECK (length(btrim(language_code)) > 0),
  ADD CONSTRAINT localized_text_editorial_class_fixed CHECK (editorial_class IN ('draft', 'content_asserted')),
  ADD CONSTRAINT localized_text_content_origin_fixed
    CHECK (content_origin IN ('direct_source_evidence', 'derived_interpretation', 'constructed_content')),
  ADD CONSTRAINT localized_text_origin_derivation_fk FOREIGN KEY (origin_derivation_instance_id)
    REFERENCES rgkb.derivation_record (instance_id),
  ADD CONSTRAINT localized_text_derived_needs_derivation
    CHECK (content_origin <> 'derived_interpretation' OR origin_derivation_instance_id IS NOT NULL);

COMMENT ON COLUMN rgkb.localized_governed_text_version.content_origin IS 'Step 2 §2.1: a localized-text version is a governed content-bearing object and carries its OWN exactly-one CONTENT ORIGIN. It is never inherited from the knowledge version that references it, never defaulted, and never inferred from language, position, evidence status or epistemic characterization (§2.5).';

COMMENT ON COLUMN rgkb.localized_governed_text_version.language_code IS 'Step 2 §5.3: governed text declares its language. NOT NULL with no default — there is no implicit default language for governed content. The exact language-tag vocabulary is not fixed by Step 2 and is not constrained here.';

COMMENT ON COLUMN rgkb.localized_governed_text_version.governed_wording IS 'Step 2 §5.3: the exact governed wording, carried by the immutable version. Historical wording remains resolvable; correction creates a new version and never rewrites this in place.';

COMMENT ON COLUMN rgkb.localized_governed_text_version.editorial_class IS 'Step 1 §7 two-class editorial partition: draft (mutable) or content_asserted (immutable). Exit from draft is irreversible. This asserts content only — never approval, validation, translation fidelity, contextual validity or runtime eligibility (Step 1 §7.2, Step 2 §5.3).';

-- -------------------------------------------------------------------------
-- 3) Evidence anchor (Step 2 §4.1, §4.2) — Pattern B family, admitted.
--
--    An anchor is a LOCATION, not a claim (§4.1). What follows from it is
--    carried by a typed evidence link (§6.1), never by the anchor.
--
--    The scientific binding is to the SOURCE EXPRESSION (§3.2) and is
--    mandatory. The manifestation reference is the optional physical
--    resolution. Binding a scientific evidence claim directly to a
--    manifestation in place of the expression is prohibited (§3.2), which is
--    why expression_id is NOT NULL and manifestation_id is nullable and never
--    a substitute for it.
--
--    Both references are to ENDURING identities. Reaching one is a
--    stable-identity reference and MUST NOT be reported as having resolved a
--    governed instance (§7.6).
--
--    DEFERRED and therefore unconstrained: the locator-type vocabulary, the
--    structural locator schemes, and the content-fingerprint algorithm (§3.3,
--    §4.1, §16.5). Columns exist because §4.1 fixes that an anchor carries
--    them; their vocabularies are not pre-empted here.
--
--    No artificial stable-identity/version pair is imposed on an anchor
--    (§4.2). Correction creates a NEW anchor record; the WP02 Pattern B write
--    guard already refuses UPDATE and DELETE, so an old anchor can never be
--    mutated to make a newer locator appear historical (§4.4).
-- -------------------------------------------------------------------------
ALTER TABLE rgkb.evidence_anchor
  ADD COLUMN IF NOT EXISTS expression_id uuid NOT NULL,
  ADD COLUMN IF NOT EXISTS manifestation_id uuid,
  ADD COLUMN IF NOT EXISTS locator_type text NOT NULL,
  ADD COLUMN IF NOT EXISTS locator_payload text NOT NULL,
  ADD COLUMN IF NOT EXISTS span_start integer,
  ADD COLUMN IF NOT EXISTS span_end integer,
  ADD COLUMN IF NOT EXISTS integrity_value text,
  ADD COLUMN IF NOT EXISTS retained_excerpt text,
  ADD COLUMN IF NOT EXISTS extraction_derivation_instance_id uuid NOT NULL,
  ADD CONSTRAINT evidence_anchor_expression_fk FOREIGN KEY (expression_id)
    REFERENCES rgkb.source_expression_identity (expression_id),
  ADD CONSTRAINT evidence_anchor_manifestation_fk FOREIGN KEY (manifestation_id)
    REFERENCES rgkb.source_manifestation_identity (manifestation_id),
  ADD CONSTRAINT evidence_anchor_extraction_fk FOREIGN KEY (extraction_derivation_instance_id)
    REFERENCES rgkb.derivation_record (instance_id),
  ADD CONSTRAINT evidence_anchor_span_ordered CHECK (span_start IS NULL OR span_end IS NULL OR span_end >= span_start),
  ADD CONSTRAINT evidence_anchor_retention_fail_closed CHECK (retained_excerpt IS NULL);

COMMENT ON CONSTRAINT evidence_anchor_retention_fail_closed ON rgkb.evidence_anchor IS 'Step 2 §4.1 permits retained excerpt text ONLY where rights permit retention. WP03 has no authority to determine that permission, and absence of a rights determination is not permission — so retention fails closed. The column exists because §4.1 fixes it; a later authorized package may replace this constraint once a governed rights determination can establish retention. No rights flag and no legal decision is invented here, and F-09 / WP09 are not closed.';

COMMENT ON COLUMN rgkb.evidence_anchor.expression_id IS 'Step 2 §3.2/§4.1: the scientific binding. An evidence claim is about what an edition states, so the anchor binds to the source EXPRESSION, never to a manifestation in its place. This is an enduring identity reference, not a governed instance (§7.6).';

COMMENT ON COLUMN rgkb.evidence_anchor.manifestation_id IS 'Step 2 §3.2/§4.1: optional physical resolution of the locator. Never a substitute for the expression binding, and never promoted to expression identity (§3.3).';

COMMENT ON COLUMN rgkb.evidence_anchor.locator_type IS 'Step 2 §4.1: the locator scheme. The controlled locator-type vocabulary and the structural locator schemes are DEFERRED (§16.5) and are deliberately not constrained here.';

COMMENT ON COLUMN rgkb.evidence_anchor.integrity_value IS 'Step 2 §4.1/§3.3: manifestation-level integrity attribute. It proves the acquired file has not changed; it is NOT evidence of edition identity, and the fingerprint algorithm is DEFERRED.';

COMMENT ON COLUMN rgkb.evidence_anchor.retained_excerpt IS 'Step 2 §4.1: retained excerpt text only where rights permit retention. WP03 records the column; it makes no retention permission determination.';

COMMENT ON COLUMN rgkb.evidence_anchor.extraction_derivation_instance_id IS 'Step 2 §4.1/§7.2: provenance of the extraction act, as the exact governed derivation-record instance. Typed by referencing the derivation_record family directly.';

-- -------------------------------------------------------------------------
-- 4) Rights / document anchor (Step 2 §4.3) — Pattern B family, admitted.
--
--    Rights evidence is frequently not scholarly: a licence text, permission
--    message, terms of use, contract clause, statutory provision or
--    correspondence record has no author/year/page in the scholarly sense
--    (§4.3). It therefore carries the same locator shape but is NOT forced
--    into the scholarly source-expression binding: expression_id is nullable
--    here and mandatory on the scientific anchor.
--
--    Scientific evidence and rights evidence are distinct and neither
--    substitutes for the other; they are separate governed families that share
--    ONE typed evidence-linking concept (§6.5).
--
--    F-09 — the physical rights-document entity — remains DEFERRED. No
--    rights-document identity family is created here.
-- -------------------------------------------------------------------------
--    F-09 BOUNDARY. A rights anchor MUST NOT borrow the scientific
--    source-expression or source-manifestation identity as a surrogate
--    rights-document authority: that would force rights material into
--    scholarly-source semantics and would quietly manufacture the physical
--    rights-document entity F-09 defers. It therefore carries NO
--    expression_id and NO manifestation_id at all. Its locator is recorded,
--    but the document authority it resolves against does not yet exist, so
--    traversal through the rights side remains explicitly INCOMPLETE and
--    fails closed rather than resolving to a scientific source.
ALTER TABLE rgkb.rights_document_anchor
  ADD COLUMN IF NOT EXISTS locator_type text NOT NULL,
  ADD COLUMN IF NOT EXISTS locator_payload text NOT NULL,
  ADD COLUMN IF NOT EXISTS integrity_value text,
  ADD COLUMN IF NOT EXISTS retained_excerpt text,
  ADD COLUMN IF NOT EXISTS extraction_derivation_instance_id uuid,
  ADD CONSTRAINT rights_anchor_extraction_fk FOREIGN KEY (extraction_derivation_instance_id)
    REFERENCES rgkb.derivation_record (instance_id),
  ADD CONSTRAINT rights_anchor_retention_fail_closed CHECK (retained_excerpt IS NULL);

COMMENT ON TABLE rgkb.rights_document_anchor IS 'Step 2 §4.3 rights/document anchor. Distinct from scientific scholarly evidence and never a substitute for it; it participates in the SAME typed evidence-linking concept (§6.5). It deliberately carries no source-expression or source-manifestation reference: the physical rights-document entity is DEFERRED (F-09) and a scientific source identity must never stand in for it. Rights-side traversal is therefore explicitly incomplete until F-09 is resolved.';

-- -------------------------------------------------------------------------
-- 5) Knowledge object version (Step 2 §5.2) — Pattern A family, admitted.
--
--    CONTENT ORIGIN is mandatory and single-valued (§2.1). The three classes
--    are FIXED by Step 2, so they are constrained; nothing else about the
--    object may imply them (§2.5), and there is no default — an unclassified
--    row cannot be inserted at all, which is what §2.6 requires instead of
--    defaulting to direct source evidence.
--
--    §2.3: derived interpretation MUST record the derivation naming its exact
--    governed inputs. That is enforced structurally below.
--    §2.2: direct source evidence MUST resolve to an evidence anchor. That is
--    a cross-row invariant and is enforced at COMMIT (§9).
--
--    The governed assertion itself IS governed localized text, referenced as
--    the EXACT localized-text version — knowing the knowledge version is not
--    sufficient to establish what wording a reader saw (§5.3, §7.5).
--
--    Scope qualification and knowledge type exist because §5.2 fixes that the
--    version carries them; their vocabularies are DEFERRED (developmental
--    scope is F-10) and are not constrained. Scope is an applicability
--    qualifier and must never become an assertion about an individual (§15).
--
--    Epistemic characterization is non-numeric by constraint (§5.4): a label
--    that reads as a percentage, probability or score is refused.
-- -------------------------------------------------------------------------
ALTER TABLE rgkb.knowledge_unit_version
  ADD COLUMN IF NOT EXISTS content_origin text NOT NULL,
  ADD COLUMN IF NOT EXISTS editorial_class text NOT NULL,
  ADD COLUMN IF NOT EXISTS assertion_text_instance_id uuid NOT NULL,
  ADD COLUMN IF NOT EXISTS knowledge_type text,
  ADD COLUMN IF NOT EXISTS population_scope text,
  ADD COLUMN IF NOT EXISTS developmental_scope text,
  ADD COLUMN IF NOT EXISTS context_scope text,
  ADD COLUMN IF NOT EXISTS epistemic_characterization text,
  ADD COLUMN IF NOT EXISTS origin_derivation_instance_id uuid,
  ADD CONSTRAINT knowledge_unit_version_content_origin_fixed
    CHECK (content_origin IN ('direct_source_evidence', 'derived_interpretation', 'constructed_content')),
  ADD CONSTRAINT knowledge_unit_version_editorial_class_fixed
    CHECK (editorial_class IN ('draft', 'content_asserted')),
  ADD CONSTRAINT knowledge_unit_version_assertion_fk FOREIGN KEY (assertion_text_instance_id)
    REFERENCES rgkb.localized_governed_text_version (instance_id),
  ADD CONSTRAINT knowledge_unit_version_origin_derivation_fk FOREIGN KEY (origin_derivation_instance_id)
    REFERENCES rgkb.derivation_record (instance_id),
  ADD CONSTRAINT knowledge_unit_version_derived_needs_derivation
    CHECK (content_origin <> 'derived_interpretation' OR origin_derivation_instance_id IS NOT NULL),
  ADD CONSTRAINT knowledge_unit_version_epistemic_not_numeric
    CHECK (epistemic_characterization IS NULL OR epistemic_characterization !~ '^[0-9]+([.,][0-9]+)?%?$');

COMMENT ON COLUMN rgkb.knowledge_unit_version.content_origin IS 'Step 2 §2.1: exactly one CONTENT ORIGIN — direct_source_evidence, derived_interpretation or constructed_content. Governance-bearing, never multi-valued, never defaulted, never inferred from family, evidence status or epistemic characterization (§2.5). Reclassification after the immutability boundary proceeds by a new version, never in place.';

COMMENT ON COLUMN rgkb.knowledge_unit_version.assertion_text_instance_id IS 'Step 2 §5.2/§5.3/§7.5: the governed assertion itself, as the EXACT governed localized-text version. The stable localization identity is not sufficient — what wording a reader saw must be resolvable.';

COMMENT ON COLUMN rgkb.knowledge_unit_version.developmental_scope IS 'Step 2 §5.2/§15: applicability qualifier only. It MUST NOT be converted into a deterministic assertion that an individual is in a particular developmental stage. The developmental vocabulary is DEFERRED (F-10) and is not constrained here.';

COMMENT ON COLUMN rgkb.knowledge_unit_version.epistemic_characterization IS 'Step 2 §5.4: qualitative, controlled, non-arithmetic. It MUST NOT be summed, weighted, averaged or converted into a confidence value or master score, and MUST NOT be computed from evidence-link labels. Numeric or percentage-shaped labels are refused by constraint. The exact vocabulary is DEFERRED.';

-- -------------------------------------------------------------------------
-- 6) Knowledge object relation (Step 2 §5.5) — Pattern B family, admitted.
--
--    A relation binds VERSION to VERSION, never stable identity to stable
--    identity, because its truth depends on exactly what each side stated.
--
--    It carries NO validation status: that would be a second independently
--    writable truth about the same fact (§5.5, Step 1 §8.2). It carries NO
--    free-text evidence basis: evidence linkage goes through the one typed
--    evidence-link mechanism (§5.5, §6.4).
--
--    The predicate vocabulary is open in the controlling architecture and is
--    therefore not constrained here.
-- -------------------------------------------------------------------------
ALTER TABLE rgkb.knowledge_unit_relation
  ADD COLUMN IF NOT EXISTS source_version_instance_id uuid NOT NULL,
  ADD COLUMN IF NOT EXISTS target_version_instance_id uuid NOT NULL,
  ADD COLUMN IF NOT EXISTS predicate text NOT NULL,
  ADD COLUMN IF NOT EXISTS population_scope text,
  ADD COLUMN IF NOT EXISTS developmental_scope text,
  ADD COLUMN IF NOT EXISTS context_scope text,
  ADD CONSTRAINT knowledge_unit_relation_source_fk FOREIGN KEY (source_version_instance_id)
    REFERENCES rgkb.knowledge_unit_version (instance_id),
  ADD CONSTRAINT knowledge_unit_relation_target_fk FOREIGN KEY (target_version_instance_id)
    REFERENCES rgkb.knowledge_unit_version (instance_id),
  ADD CONSTRAINT knowledge_unit_relation_predicate_present CHECK (length(btrim(predicate)) > 0),
  ADD CONSTRAINT knowledge_unit_relation_distinct_endpoints
    CHECK (source_version_instance_id <> target_version_instance_id);

COMMENT ON TABLE rgkb.knowledge_unit_relation IS 'Step 2 §5.5 governed assertion about specific immutable knowledge versions. Version to version, never stable identity to stable identity. Carries no relation-local validation status and no free-text evidence basis; evidence comes through the typed evidence link. Correction creates a new relation record.';

-- -------------------------------------------------------------------------
-- 7) Typed evidence link (Step 2 §6) — Pattern B family, admitted.
--
--    THE ONLY AUTHORITATIVE POINTER from a governed object to its evidence
--    (§6.1). Both endpoints are EXACT governed instances: the supported
--    instance references the WP02 registry directly, so any admitted governed
--    family may be supported by the one mechanism (§6.5), and the anchor
--    endpoint references the evidence_anchor family directly, which types it.
--
--    Neither endpoint may be a bare stable identity, a domain code, an
--    ordering attribute or an external identifier (§6.1, Step 1 §11.1) — none
--    of those columns is referenced by any constraint here.
--
--    EVIDENCE ROLE. §6.2 fixes that four distinctions must remain expressible
--    — supports, corroborates, contradicts, context — while DEFERRING the
--    exact vocabulary. The narrowest representation preserving exactly that is
--    a mandatory role CLASS constrained to those four, and nothing more. This
--    does NOT close the deferred vocabulary: a later controlled specification
--    may add a specialization column beneath the class without contradicting
--    anything fixed here. Contradicting evidence is a legitimate role and its
--    links must never be removed, suppressed or downgraded (§6.2, §10.5).
--
--    SUPPORT CHARACTERIZATION is subject to §5.4 in full: controlled,
--    non-arithmetic, never aggregated across an object's links to produce that
--    object's epistemic characterization (§6.3). Its vocabulary is DEFERRED,
--    so it is unconstrained except that a numeric or percentage-shaped label
--    is refused.
--
--    COMMENTARY is explicitly NOT the pointer (§6.4). Its presence is not
--    evidence that a link exists; an object bearing only commentary is
--    unsupported and a consequential path requiring its support fails closed.
-- -------------------------------------------------------------------------
--    ONE FAMILY, BOTH ANCHOR KINDS (§4.3, §6.5). A link may name an exact
--    scientific evidence_anchor OR an exact rights_document_anchor. Each
--    endpoint is a real typed foreign key, so the reference stays structurally
--    exact and unambiguous, and a CHECK requires EXACTLY ONE of them — never
--    both, never neither. This is one governed typed_evidence_link family, not
--    a second ad-hoc rights evidence-link family.
ALTER TABLE rgkb.typed_evidence_link
  ADD COLUMN IF NOT EXISTS supported_instance_id uuid NOT NULL,
  ADD COLUMN IF NOT EXISTS evidence_anchor_instance_id uuid,
  ADD COLUMN IF NOT EXISTS rights_anchor_instance_id uuid,
  ADD COLUMN IF NOT EXISTS evidence_role_class text NOT NULL,
  ADD COLUMN IF NOT EXISTS support_characterization text,
  ADD COLUMN IF NOT EXISTS commentary text,
  ADD CONSTRAINT typed_evidence_link_supported_fk FOREIGN KEY (supported_instance_id)
    REFERENCES rgkb.governed_instance (instance_id),
  ADD CONSTRAINT typed_evidence_link_anchor_fk FOREIGN KEY (evidence_anchor_instance_id)
    REFERENCES rgkb.evidence_anchor (instance_id),
  ADD CONSTRAINT typed_evidence_link_rights_anchor_fk FOREIGN KEY (rights_anchor_instance_id)
    REFERENCES rgkb.rights_document_anchor (instance_id),
  ADD CONSTRAINT typed_evidence_link_exactly_one_anchor
    CHECK ((evidence_anchor_instance_id IS NOT NULL) <> (rights_anchor_instance_id IS NOT NULL)),
  ADD CONSTRAINT typed_evidence_link_role_class_fixed
    CHECK (evidence_role_class IN ('supports', 'corroborates', 'contradicts', 'context')),
  ADD CONSTRAINT typed_evidence_link_support_not_numeric
    CHECK (support_characterization IS NULL OR support_characterization !~ '^[0-9]+([.,][0-9]+)?%?$');

COMMENT ON COLUMN rgkb.typed_evidence_link.evidence_role_class IS 'Step 2 §6.2: the four distinctions that must remain expressible — supports, corroborates, contradicts, context. Controlled, never free text. The exact role vocabulary is DEFERRED; this class does not close it and a later controlled specification may specialize beneath it.';

COMMENT ON COLUMN rgkb.typed_evidence_link.support_characterization IS 'Step 2 §6.3 with §5.4 in full: controlled, ordinal only where defensible, non-arithmetic, never aggregated across an object''s links and never convertible into a master score. Vocabulary DEFERRED; numeric or percentage-shaped labels are refused by constraint.';

COMMENT ON COLUMN rgkb.typed_evidence_link.commentary IS 'Step 2 §6.4: optional free text that is explicitly NOT the authoritative pointer. Its presence is never evidence that a link exists, and it can never stand in place of one.';

-- -------------------------------------------------------------------------
-- 8) Derivation record and its exact inputs (Step 2 §7.2) — Pattern B family.
--
--    Every input MUST be an exact governed instance. A bare stable identity, a
--    family, a collection, "the current version" or a free-text object name is
--    never an input (§7.2, Step 1 §11.1/§11.6) — the input column references
--    the WP02 registry itself, so nothing else is structurally admissible.
--
--    rgkb.derivation_record_input is a NORMALIZED DEPENDENT STRUCTURE, not a
--    governed family. It has no instance_id of its own, is not registered in
--    rgkb.governed_instance, and is not admitted to the subject-type catalog.
--    A join table is not a governed family (Step 1 §2.5).
--
--    ATTRIBUTION. §7.2 requires a typed, attributable actor; "some process did
--    it" is not acceptable. F-12 (reviewer identity) and F-14 (contributor
--    normalization) remain DEFERRED, so no reviewer or contributor governed
--    family is created. The narrowest traceable representation is therefore a
--    mandatory non-blank actor kind plus a mandatory non-blank actor
--    reference, with the actor-type vocabulary left unconstrained for the
--    later controlled specification that owns it.
--
--    act_time records when the act occurred (§7.2). It is provenance, never a
--    resolution input: no ordering, recency or "latest" heuristic reads it
--    anywhere in this substrate (§12.2, Step 1 §9.4).
-- -------------------------------------------------------------------------
ALTER TABLE rgkb.derivation_record
  ADD COLUMN IF NOT EXISTS output_instance_id uuid NOT NULL,
  ADD COLUMN IF NOT EXISTS derivation_type text NOT NULL,
  ADD COLUMN IF NOT EXISTS actor_kind text NOT NULL,
  ADD COLUMN IF NOT EXISTS actor_reference text NOT NULL,
  ADD COLUMN IF NOT EXISTS act_time timestamptz NOT NULL,
  ADD COLUMN IF NOT EXISTS machine_process_identity text,
  ADD COLUMN IF NOT EXISTS machine_process_version text,
  ADD CONSTRAINT derivation_record_output_fk FOREIGN KEY (output_instance_id)
    REFERENCES rgkb.governed_instance (instance_id),
  ADD CONSTRAINT derivation_record_type_present CHECK (length(btrim(derivation_type)) > 0),
  ADD CONSTRAINT derivation_record_actor_attributable
    CHECK (length(btrim(actor_kind)) > 0 AND length(btrim(actor_reference)) > 0),
  ADD CONSTRAINT derivation_record_machine_pair_complete
    CHECK ((machine_process_identity IS NULL) = (machine_process_version IS NULL)),
  ADD CONSTRAINT derivation_record_machine_pair_non_blank
    CHECK (machine_process_identity IS NULL
           OR (length(btrim(machine_process_identity)) > 0 AND length(btrim(machine_process_version)) > 0));

COMMENT ON COLUMN rgkb.derivation_record.machine_process_identity IS 'Step 2 §7.2: where a machine process participated, its identity AND version are recorded together — both present or both absent, and non-blank when present. No machine-provider taxonomy is invented; the vocabulary is not constrained.';

COMMENT ON COLUMN rgkb.derivation_record.actor_reference IS 'Step 2 §7.2: typed, attributable actor. Deliberately an opaque non-blank reference and NOT a governed identity: reviewer identity (F-12) and contributor normalization (F-14) remain DEFERRED, and WP03 creates no reviewer or contributor governed family.';

COMMENT ON COLUMN rgkb.derivation_record.act_time IS 'Step 2 §7.2: the time of the derivation act. Provenance only — never read as a resolution, recency or currency input anywhere in this substrate (§12.2, Step 1 §9.4).';

CREATE TABLE IF NOT EXISTS rgkb.derivation_record_input (
  derivation_instance_id uuid NOT NULL,
  input_instance_id      uuid NOT NULL,
  CONSTRAINT derivation_record_input_pk PRIMARY KEY (derivation_instance_id, input_instance_id),
  CONSTRAINT derivation_record_input_derivation_fk FOREIGN KEY (derivation_instance_id)
    REFERENCES rgkb.derivation_record (instance_id),
  CONSTRAINT derivation_record_input_instance_fk FOREIGN KEY (input_instance_id)
    REFERENCES rgkb.governed_instance (instance_id)
);

COMMENT ON TABLE rgkb.derivation_record_input IS 'Step 2 §7.2 exact governed inputs of a derivation. A normalized dependent structure of the derivation_record family — NOT a governed family: it has no instance_id of its own, is not registered in rgkb.governed_instance and is not admitted to the subject-type catalog. Every input is an exact governed instance; a stable identity, family, collection or current version can never be one.';

ALTER TABLE rgkb.derivation_record_input ENABLE ROW LEVEL SECURITY;
ALTER TABLE rgkb.derivation_record_input FORCE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE rgkb.derivation_record_input FROM PUBLIC;
REVOKE ALL ON TABLE rgkb.derivation_record_input FROM anon;
REVOKE ALL ON TABLE rgkb.derivation_record_input FROM authenticated;

CREATE OR REPLACE FUNCTION rgkb.derivation_input_write_guard()
RETURNS trigger
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $$
BEGIN
  IF TG_OP = 'UPDATE' THEN
    RAISE EXCEPTION 'RGKB Step 2 §7.2/§7.3 fail closed: a derivation input set is not editable in place. The historical derivation continues to name the exact inputs it consumed; correction creates a new derivation record.' USING ERRCODE = 'RG092';
  ELSE
    RAISE EXCEPTION 'RGKB Step 2 §7.3 fail closed: a derivation input must not be removed. Provenance must survive derivation, and the chain is not rewritten when an input is later superseded, withdrawn, retracted or quarantined.' USING ERRCODE = 'RG093';
  END IF;
END;
$$;

COMMENT ON FUNCTION rgkb.derivation_input_write_guard() IS 'PRM-WP03 immutability guard for rgkb.derivation_record_input (Step 2 §7.2, §7.3). Historical derivations stay historically exact.';

DROP TRIGGER IF EXISTS derivation_record_input_write_guard ON rgkb.derivation_record_input;
CREATE TRIGGER derivation_record_input_write_guard
  BEFORE UPDATE OR DELETE ON rgkb.derivation_record_input
  FOR EACH ROW EXECUTE FUNCTION rgkb.derivation_input_write_guard();

-- -------------------------------------------------------------------------
-- 9) Cross-row Step 2 invariants, enforced at COMMIT.
--
--    Both are DEFERRABLE INITIALLY DEFERRED constraint triggers, exactly like
--    the WP02 atomicity checks, so that the dependent rows may be written as
--    separate statements of one transaction.
--
--    RG100 — §2.2: direct source evidence MUST resolve to an evidence anchor.
--            A knowledge version classified direct_source_evidence with no
--            typed evidence link resolves to nothing, so it fails closed.
--    RG110 — §7.2: a derivation record MUST name every exact governed
--            instance it consumed. A derivation with no input names nothing,
--            and a derivation naming its own output as an input is circular.
--
--    Under FORCE ROW LEVEL SECURITY with zero policies, a caller that cannot
--    see the dependent rows cannot establish either invariant and is refused.
--    That is the correct direction: an unprovable invariant fails closed.
-- -------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION rgkb.direct_evidence_has_anchor_check()
RETURNS trigger
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $$
DECLARE
  v_link_count integer;
BEGIN
  IF NEW.content_origin <> 'direct_source_evidence' THEN
    RETURN NULL;
  END IF;

  SELECT count(*) INTO v_link_count
    FROM rgkb.typed_evidence_link AS l
   WHERE l.supported_instance_id = NEW.instance_id;

  IF v_link_count < 1 THEN
    RAISE EXCEPTION 'RGKB Step 2 §2.2/§14.1 fail closed: content classified as direct source evidence must resolve to an evidence anchor through a typed evidence link. Free-text commentary is never the pointer, and absence of a link is not evidence of support.' USING ERRCODE = 'RG100';
  END IF;

  RETURN NULL;
END;
$$;

COMMENT ON FUNCTION rgkb.direct_evidence_has_anchor_check() IS 'PRM-WP03 deferred check (Step 2 §2.2, §6.4, §14.1). A direct-source-evidence knowledge version without a typed evidence link is refused at COMMIT.';

DROP TRIGGER IF EXISTS knowledge_unit_version_direct_evidence_check ON rgkb.knowledge_unit_version;
CREATE CONSTRAINT TRIGGER knowledge_unit_version_direct_evidence_check
  AFTER INSERT ON rgkb.knowledge_unit_version
  DEFERRABLE INITIALLY DEFERRED
  FOR EACH ROW EXECUTE FUNCTION rgkb.direct_evidence_has_anchor_check();

--    The same check applies unchanged to governed localized text: it is a
--    content-bearing object carrying its own CONTENT ORIGIN, so
--    direct_source_evidence wording must resolve through the SAME canonical
--    typed evidence-link mechanism. One function, one mechanism, no second
--    provenance authority.
DROP TRIGGER IF EXISTS localized_text_direct_evidence_check ON rgkb.localized_governed_text_version;
CREATE CONSTRAINT TRIGGER localized_text_direct_evidence_check
  AFTER INSERT ON rgkb.localized_governed_text_version
  DEFERRABLE INITIALLY DEFERRED
  FOR EACH ROW EXECUTE FUNCTION rgkb.direct_evidence_has_anchor_check();

-- -------------------------------------------------------------------------
--    DERIVATION / OUTPUT INTEGRITY (RG120).
--
--    A derivation reference is not sufficient merely because it names some
--    derivation record. Where a governed object declares an origin or
--    extraction derivation, that derivation's output_instance_id MUST be
--    exactly the instance carrying the reference — otherwise the object would
--    claim provenance from an act that produced something else.
--
--    Three short dedicated checks rather than one dynamic-SQL check: each
--    names its own column directly, so there is no runtime column resolution
--    to get wrong, and no second provenance authority is created.
-- -------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION rgkb.knowledge_version_origin_output_check()
RETURNS trigger
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $$
DECLARE
  v_output uuid;
BEGIN
  IF NEW.origin_derivation_instance_id IS NULL THEN
    RETURN NULL;
  END IF;

  SELECT d.output_instance_id INTO v_output
    FROM rgkb.derivation_record AS d
   WHERE d.instance_id = NEW.origin_derivation_instance_id;

  IF v_output IS DISTINCT FROM NEW.instance_id THEN
    RAISE EXCEPTION 'RGKB Step 2 §7.2 fail closed: the referenced derivation record must name THIS governed instance as its exact output. A derivation that produced something else is not this object provenance.' USING ERRCODE = 'RG120';
  END IF;

  RETURN NULL;
END;
$$;

CREATE OR REPLACE FUNCTION rgkb.localized_text_origin_output_check()
RETURNS trigger
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $$
DECLARE
  v_output uuid;
BEGIN
  IF NEW.origin_derivation_instance_id IS NULL THEN
    RETURN NULL;
  END IF;

  SELECT d.output_instance_id INTO v_output
    FROM rgkb.derivation_record AS d
   WHERE d.instance_id = NEW.origin_derivation_instance_id;

  IF v_output IS DISTINCT FROM NEW.instance_id THEN
    RAISE EXCEPTION 'RGKB Step 2 §7.2 fail closed: the referenced derivation record must name THIS localized-text version as its exact output.' USING ERRCODE = 'RG120';
  END IF;

  RETURN NULL;
END;
$$;

CREATE OR REPLACE FUNCTION rgkb.anchor_extraction_output_check()
RETURNS trigger
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $$
DECLARE
  v_output uuid;
BEGIN
  IF NEW.extraction_derivation_instance_id IS NULL THEN
    RETURN NULL;
  END IF;

  SELECT d.output_instance_id INTO v_output
    FROM rgkb.derivation_record AS d
   WHERE d.instance_id = NEW.extraction_derivation_instance_id;

  IF v_output IS DISTINCT FROM NEW.instance_id THEN
    RAISE EXCEPTION 'RGKB Step 2 §4.1/§7.2 fail closed: the extraction derivation must name THIS anchor as its exact output. The provenance of the extraction act belongs to the anchor it produced.' USING ERRCODE = 'RG120';
  END IF;

  RETURN NULL;
END;
$$;

DROP TRIGGER IF EXISTS knowledge_unit_version_origin_output_check ON rgkb.knowledge_unit_version;
CREATE CONSTRAINT TRIGGER knowledge_unit_version_origin_output_check
  AFTER INSERT ON rgkb.knowledge_unit_version
  DEFERRABLE INITIALLY DEFERRED
  FOR EACH ROW EXECUTE FUNCTION rgkb.knowledge_version_origin_output_check();

DROP TRIGGER IF EXISTS localized_text_origin_output_check ON rgkb.localized_governed_text_version;
CREATE CONSTRAINT TRIGGER localized_text_origin_output_check
  AFTER INSERT ON rgkb.localized_governed_text_version
  DEFERRABLE INITIALLY DEFERRED
  FOR EACH ROW EXECUTE FUNCTION rgkb.localized_text_origin_output_check();

DROP TRIGGER IF EXISTS evidence_anchor_extraction_output_check ON rgkb.evidence_anchor;
CREATE CONSTRAINT TRIGGER evidence_anchor_extraction_output_check
  AFTER INSERT ON rgkb.evidence_anchor
  DEFERRABLE INITIALLY DEFERRED
  FOR EACH ROW EXECUTE FUNCTION rgkb.anchor_extraction_output_check();

DROP TRIGGER IF EXISTS rights_anchor_extraction_output_check ON rgkb.rights_document_anchor;
CREATE CONSTRAINT TRIGGER rights_anchor_extraction_output_check
  AFTER INSERT ON rgkb.rights_document_anchor
  DEFERRABLE INITIALLY DEFERRED
  FOR EACH ROW EXECUTE FUNCTION rgkb.anchor_extraction_output_check();

CREATE OR REPLACE FUNCTION rgkb.derivation_has_exact_inputs_check()
RETURNS trigger
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $$
DECLARE
  v_input_count integer;
  v_self_count  integer;
BEGIN
  SELECT count(*) INTO v_input_count
    FROM rgkb.derivation_record_input AS i
   WHERE i.derivation_instance_id = NEW.instance_id;

  IF v_input_count < 1 THEN
    RAISE EXCEPTION 'RGKB Step 2 §7.2 fail closed: a derivation record must name every exact governed instance it consumed. A derivation naming no input is not a governed derivation.' USING ERRCODE = 'RG110';
  END IF;

  SELECT count(*) INTO v_self_count
    FROM rgkb.derivation_record_input AS i
   WHERE i.derivation_instance_id = NEW.instance_id
     AND i.input_instance_id = NEW.output_instance_id;

  IF v_self_count > 0 THEN
    RAISE EXCEPTION 'RGKB Step 2 §7.2 fail closed: a derivation output must not also be one of its own inputs; provenance must remain a traversable chain rather than a cycle.' USING ERRCODE = 'RG111';
  END IF;

  RETURN NULL;
END;
$$;

COMMENT ON FUNCTION rgkb.derivation_has_exact_inputs_check() IS 'PRM-WP03 deferred check (Step 2 §7.2). A derivation record with no exact governed input, or one consuming its own output, is refused at COMMIT.';

DROP TRIGGER IF EXISTS derivation_record_inputs_check ON rgkb.derivation_record;
CREATE CONSTRAINT TRIGGER derivation_record_inputs_check
  AFTER INSERT ON rgkb.derivation_record
  DEFERRABLE INITIALLY DEFERRED
  FOR EACH ROW EXECUTE FUNCTION rgkb.derivation_has_exact_inputs_check();

-- -------------------------------------------------------------------------
-- 10) Deterministic provenance traversal (Step 2 §12.1, §12.2, §12.4).
--
--     The traversal substrate IS the exact typed foreign-key graph above. The
--     two functions below expose the minimum forward and backward walks the
--     WP03 traceability contract needs; no broader recursive engine is built.
--
--     Determinism (§12.2): every step is an exact key join. There is no string
--     matching, no title matching, no label similarity, no filename matching,
--     no nearest-match, no recency heuristic, no ordering heuristic and no
--     "latest" fallback anywhere — and no ORDER BY, LIMIT or DESC appears.
--
--     Two reference levels are kept separate (§7.6): the returned
--     enduring_expression_identity and enduring_manifestation_identity columns
--     are STABLE-IDENTITY references. Reaching one has NOT resolved a governed
--     instance, and a caller MUST NOT report it as if it had.
--
--     Backward traversal is NOT itself proof of support (§12.1): the returned
--     evidence_role_class and support_characterization control what the
--     relationship means.
--
--     Resolution failure (§12.5): an unresolvable step yields no row rather
--     than a partial chain presented as complete. A consequential dependent
--     path treats the empty result as FAIL CLOSED — these functions never
--     substitute a fallback.
-- -------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION rgkb.anchor_level_evidence_for_instance(p_instance_id uuid)
RETURNS TABLE (
  supported_instance_id            uuid,
  evidence_link_instance_id        uuid,
  evidence_role_class              text,
  support_characterization         text,
  anchor_kind                      text,
  anchor_instance_id               uuid,
  locator_type                     text,
  locator_payload                  text,
  enduring_expression_identity     uuid,
  enduring_manifestation_identity  uuid,
  canonical_source_chain_status    text
)
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = ''
AS $$
  SELECT l.supported_instance_id,
         l.instance_id,
         l.evidence_role_class,
         l.support_characterization,
         'scientific_evidence_anchor',
         a.instance_id,
         a.locator_type,
         a.locator_payload,
         a.expression_id,
         a.manifestation_id,
         'incomplete_m1_unresolved'
    FROM rgkb.typed_evidence_link AS l
    JOIN rgkb.evidence_anchor AS a
      ON a.instance_id = l.evidence_anchor_instance_id
   WHERE l.supported_instance_id = p_instance_id
  UNION ALL
  SELECT l.supported_instance_id,
         l.instance_id,
         l.evidence_role_class,
         l.support_characterization,
         'rights_document_anchor',
         r.instance_id,
         r.locator_type,
         r.locator_payload,
         NULL::uuid,
         NULL::uuid,
         'incomplete_f09_unresolved'
    FROM rgkb.typed_evidence_link AS l
    JOIN rgkb.rights_document_anchor AS r
      ON r.instance_id = l.rights_anchor_instance_id
   WHERE l.supported_instance_id = p_instance_id;
$$;

COMMENT ON FUNCTION rgkb.anchor_level_evidence_for_instance(uuid) IS 'Step 2 §12.1 ANCHOR-LEVEL traversal only — deliberately NOT a canonical provenance chain, and named so it cannot be mistaken for one. It walks exact governed instance -> typed evidence link -> anchor (scientific or rights) by exact key joins; no string, label, nearest-match, recency or latest heuristic. The enduring_* columns are stable-identity references and MUST NOT be reported as resolved governed instances (§7.6). canonical_source_chain_status is constant and always states INCOMPLETE: the canonical source chain additionally requires the governed source-identity determination that M-1 leaves unresolved, and the rights side additionally requires the physical rights-document entity that F-09 defers. No interface here claims complete canonical provenance, and any consequential path requiring it MUST FAIL CLOSED. An empty result is an unresolved chain, never a partial chain presented as complete (§12.5).';

CREATE OR REPLACE FUNCTION rgkb.instances_referencing_anchor(p_anchor_instance_id uuid)
RETURNS TABLE (
  evidence_anchor_instance_id uuid,
  evidence_link_instance_id   uuid,
  supported_instance_id       uuid,
  supported_subject_type      text,
  evidence_role_class         text
)
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = ''
AS $$
  SELECT coalesce(l.evidence_anchor_instance_id, l.rights_anchor_instance_id),
         l.instance_id,
         l.supported_instance_id,
         g.subject_type,
         l.evidence_role_class
    FROM rgkb.typed_evidence_link AS l
    JOIN rgkb.governed_instance AS g
      ON g.instance_id = l.supported_instance_id
   WHERE l.evidence_anchor_instance_id = p_anchor_instance_id
      OR l.rights_anchor_instance_id = p_anchor_instance_id;
$$;

COMMENT ON FUNCTION rgkb.instances_referencing_anchor(uuid) IS 'Step 2 §12.1 backward traversal: evidence anchor -> typed evidence links -> the exact governed instances referencing it. Backward reachability is NOT proof of support: evidence_role_class states what the relationship means, and a contradicting link is reached by the same walk (§6.2, §12.1).';

CREATE OR REPLACE FUNCTION rgkb.derivation_inputs_for_output(p_output_instance_id uuid)
RETURNS TABLE (
  output_instance_id      uuid,
  derivation_instance_id  uuid,
  derivation_type         text,
  input_instance_id       uuid,
  input_subject_type      text
)
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = ''
AS $$
  SELECT d.output_instance_id,
         d.instance_id,
         d.derivation_type,
         i.input_instance_id,
         g.subject_type
    FROM rgkb.derivation_record AS d
    JOIN rgkb.derivation_record_input AS i
      ON i.derivation_instance_id = d.instance_id
    JOIN rgkb.governed_instance AS g
      ON g.instance_id = i.input_instance_id
   WHERE d.output_instance_id = p_output_instance_id;
$$;

COMMENT ON FUNCTION rgkb.derivation_inputs_for_output(uuid) IS 'Step 2 §7.3/§12.1: governed output -> derivation record -> every exact governed input. Provenance survives derivation: the inputs stay reachable and their own evidence remains reachable from them. Nothing here transfers CONTENT ORIGIN, epistemic characterization, validation, approval or runtime availability from input to output.';

-- -------------------------------------------------------------------------
-- 11) Containment for the objects added here.
-- -------------------------------------------------------------------------
REVOKE ALL ON FUNCTION rgkb.source_identity_write_guard() FROM PUBLIC;
REVOKE ALL ON FUNCTION rgkb.source_identity_write_guard() FROM anon;
REVOKE ALL ON FUNCTION rgkb.source_identity_write_guard() FROM authenticated;
REVOKE ALL ON FUNCTION rgkb.derivation_input_write_guard() FROM PUBLIC;
REVOKE ALL ON FUNCTION rgkb.derivation_input_write_guard() FROM anon;
REVOKE ALL ON FUNCTION rgkb.derivation_input_write_guard() FROM authenticated;
REVOKE ALL ON FUNCTION rgkb.direct_evidence_has_anchor_check() FROM PUBLIC;
REVOKE ALL ON FUNCTION rgkb.direct_evidence_has_anchor_check() FROM anon;
REVOKE ALL ON FUNCTION rgkb.direct_evidence_has_anchor_check() FROM authenticated;
REVOKE ALL ON FUNCTION rgkb.derivation_has_exact_inputs_check() FROM PUBLIC;
REVOKE ALL ON FUNCTION rgkb.derivation_has_exact_inputs_check() FROM anon;
REVOKE ALL ON FUNCTION rgkb.derivation_has_exact_inputs_check() FROM authenticated;
REVOKE ALL ON FUNCTION rgkb.anchor_level_evidence_for_instance(uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION rgkb.anchor_level_evidence_for_instance(uuid) FROM anon;
REVOKE ALL ON FUNCTION rgkb.anchor_level_evidence_for_instance(uuid) FROM authenticated;
REVOKE ALL ON FUNCTION rgkb.knowledge_version_origin_output_check() FROM PUBLIC;
REVOKE ALL ON FUNCTION rgkb.knowledge_version_origin_output_check() FROM anon;
REVOKE ALL ON FUNCTION rgkb.knowledge_version_origin_output_check() FROM authenticated;
REVOKE ALL ON FUNCTION rgkb.localized_text_origin_output_check() FROM PUBLIC;
REVOKE ALL ON FUNCTION rgkb.localized_text_origin_output_check() FROM anon;
REVOKE ALL ON FUNCTION rgkb.localized_text_origin_output_check() FROM authenticated;
REVOKE ALL ON FUNCTION rgkb.anchor_extraction_output_check() FROM PUBLIC;
REVOKE ALL ON FUNCTION rgkb.anchor_extraction_output_check() FROM anon;
REVOKE ALL ON FUNCTION rgkb.anchor_extraction_output_check() FROM authenticated;
REVOKE ALL ON FUNCTION rgkb.instances_referencing_anchor(uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION rgkb.instances_referencing_anchor(uuid) FROM anon;
REVOKE ALL ON FUNCTION rgkb.instances_referencing_anchor(uuid) FROM authenticated;
REVOKE ALL ON FUNCTION rgkb.derivation_inputs_for_output(uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION rgkb.derivation_inputs_for_output(uuid) FROM anon;
REVOKE ALL ON FUNCTION rgkb.derivation_inputs_for_output(uuid) FROM authenticated;

-- =========================================================================
-- Rollback (additive-only; drops nothing that existed before this migration):
--   DROP FUNCTION IF EXISTS rgkb.derivation_inputs_for_output(uuid);
--   DROP FUNCTION IF EXISTS rgkb.instances_referencing_anchor(uuid);
--   DROP FUNCTION IF EXISTS rgkb.anchor_level_evidence_for_instance(uuid);
--   DROP FUNCTION IF EXISTS rgkb.anchor_extraction_output_check();
--   DROP FUNCTION IF EXISTS rgkb.localized_text_origin_output_check();
--   DROP FUNCTION IF EXISTS rgkb.knowledge_version_origin_output_check();
--   DROP TRIGGER IF EXISTS derivation_record_inputs_check ON rgkb.derivation_record;
--   DROP FUNCTION IF EXISTS rgkb.derivation_has_exact_inputs_check();
--   DROP TRIGGER IF EXISTS knowledge_unit_version_direct_evidence_check ON rgkb.knowledge_unit_version;
--   DROP FUNCTION IF EXISTS rgkb.direct_evidence_has_anchor_check();
--   DROP TABLE IF EXISTS rgkb.derivation_record_input;
--   DROP FUNCTION IF EXISTS rgkb.derivation_input_write_guard();
--   ALTER TABLE rgkb.derivation_record DROP COLUMN machine_process_version, DROP COLUMN machine_process_identity, DROP COLUMN act_time, DROP COLUMN actor_reference, DROP COLUMN actor_kind, DROP COLUMN derivation_type, DROP COLUMN output_instance_id;
--   ALTER TABLE rgkb.typed_evidence_link DROP COLUMN commentary, DROP COLUMN support_characterization, DROP COLUMN evidence_role_class, DROP COLUMN rights_anchor_instance_id, DROP COLUMN evidence_anchor_instance_id, DROP COLUMN supported_instance_id;
--   ALTER TABLE rgkb.knowledge_unit_relation DROP COLUMN context_scope, DROP COLUMN developmental_scope, DROP COLUMN population_scope, DROP COLUMN predicate, DROP COLUMN target_version_instance_id, DROP COLUMN source_version_instance_id;
--   ALTER TABLE rgkb.knowledge_unit_version DROP COLUMN origin_derivation_instance_id, DROP COLUMN epistemic_characterization, DROP COLUMN context_scope, DROP COLUMN developmental_scope, DROP COLUMN population_scope, DROP COLUMN knowledge_type, DROP COLUMN assertion_text_instance_id, DROP COLUMN editorial_class, DROP COLUMN content_origin;
--   ALTER TABLE rgkb.rights_document_anchor DROP COLUMN extraction_derivation_instance_id, DROP COLUMN retained_excerpt, DROP COLUMN integrity_value, DROP COLUMN locator_payload, DROP COLUMN locator_type;
--   ALTER TABLE rgkb.evidence_anchor DROP COLUMN extraction_derivation_instance_id, DROP COLUMN retained_excerpt, DROP COLUMN integrity_value, DROP COLUMN span_end, DROP COLUMN span_start, DROP COLUMN locator_payload, DROP COLUMN locator_type, DROP COLUMN manifestation_id, DROP COLUMN expression_id;
--   ALTER TABLE rgkb.localized_governed_text_version DROP COLUMN origin_derivation_instance_id, DROP COLUMN content_origin, DROP COLUMN editorial_class, DROP COLUMN governed_wording, DROP COLUMN language_code;
--   DROP TABLE IF EXISTS rgkb.source_manifestation_identity;
--   DROP TABLE IF EXISTS rgkb.source_expression_identity;
--   DROP TABLE IF EXISTS rgkb.source_identity;
--   DROP FUNCTION IF EXISTS rgkb.source_identity_write_guard();
-- No table, column, policy, grant, function or row outside the rgkb schema is
-- touched by this migration.
-- =========================================================================
