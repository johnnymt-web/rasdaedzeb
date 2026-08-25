-- =========================================================================
-- RGKB PRM-WP02 — TIER 2 governed-family substrate.
-- =========================================================================
-- Authorized by: Owner PRM-WP02 Tier 2 Human Gate, 2026-08-25, scoped to the
-- accepted 19-family controlled subject-type catalog.
--
-- Controlling sources:
--   * Step 1 — Governed Object / Versioning / Referential / Lifecycle
--     Substrate v0.1
--   * PRM-WP02 Governed Object / Version Runtime Architecture Proposal v0.1,
--     PART I (accepted architecture; §5.2 Tier 2)
--   * Controlled Subject-Type Catalog Specification v0.1 (Owner-accepted,
--     merged) — the 19 admitted families and their fixed Pattern assignment
--   * Merged Tier 1 migration 20260825120000_rgkb_wp02_tier1_...
--
-- SCOPE: WP02 identity / version foundation ONLY. This migration implements
-- no Step 2 evidence semantics, no Step 3 validation semantics, no Step 4
-- interpretation semantics, no Step 5 orchestration semantics, no Step 6
-- privacy/safeguarding semantics and no Step 7 integration semantics. No
-- domain payload column is invented for any family.
--
-- The Tier 1 migration is NOT edited. Where a Tier 1 temporary guard is
-- superseded, it is replaced here, additively, and the reason is stated at
-- the replacement.
--
-- STILL OPEN, and untouched by this migration:
--   * F-04 dependency re-binding workflow — no trigger, authority,
--     dependent-discovery or repair mechanism is implemented. The
--     governance_binding family receives only its Pattern B structural
--     shell because it is an accepted catalog family; that is NOT an F-04
--     implementation.
--   * F-07 current-version resolution — rgkb.resolve_current_version() is
--     NOT modified. It remains argument-free and fails closed with RG003.
--   * M-1 and the nine unresolved families — none is admitted (see §2).
--
-- ACCESS MODEL: none. Containment only, at least as strict as Tier 1 —
-- dedicated rgkb schema, RLS enabled and forced, ZERO policies, REVOKE from
-- PUBLIC/anon/authenticated, no SECURITY DEFINER, nothing in public. The live
-- Supabase exposed-schema configuration is NOT verified and no remote access
-- is authorized.
--
-- STYLE: single-line string literals only, matching every other migration.
-- =========================================================================

-- -----------------------------------------------------------------------
-- 1) Catalog: unfreeze, seed the accepted 19 families, refreeze.
-- -----------------------------------------------------------------------
--
--    Step 1 §2.5 makes admission of a family whose pattern assignment is not
--    fixed a governance/schema fault. At Tier 1 no controlled catalog
--    specification existed, so the RG020 guard refused every admission. That
--    specification is now Owner-accepted and merged, so the guard's premise no
--    longer holds and it is superseded here — this is the exact and only
--    reason the Tier 1 guard is replaced.
--
--    After seeding the catalog is refrozen. Membership is CONTROLLED, not
--    merely seeded: no later admission, no in-place reclassification (Step 1
--    §2.5 change control) and no removal is possible without a new controlled
--    specification version and a new migration.
--
--    SEED VISIBILITY. Tier 1 left this table under FORCE ROW LEVEL SECURITY
--    with zero policies, which denies DML to the table OWNER as well — a role
--    without the BYPASSRLS attribute could not perform the seed at all. FORCE
--    is therefore lifted for exactly the seeding statement and restored
--    immediately, in this same migration. The end state is identical to Tier
--    1's: RLS enabled AND forced, zero policies. This is done because the
--    executing role's BYPASSRLS attribute cannot be verified from the
--    repository, and the seed must not depend on an unverified assumption.
DROP TRIGGER IF EXISTS subject_type_catalog_write_guard ON rgkb.subject_type_catalog;

ALTER TABLE rgkb.subject_type_catalog NO FORCE ROW LEVEL SECURITY;

INSERT INTO rgkb.subject_type_catalog (subject_type, pattern) VALUES
  ('knowledge_unit', 'A'),
  ('guardrail', 'A'),
  ('interpretation_rule', 'A'),
  ('construct_definition', 'A'),
  ('rights_decision', 'A'),
  ('instrument', 'A'),
  ('localized_governed_text', 'A'),
  ('validation_derivation_rule', 'A'),
  ('validation_applicability_matrix', 'A'),
  ('integrated_profile_architecture', 'A'),
  ('instrument_scale', 'A'),
  ('evidence_anchor', 'B'),
  ('knowledge_unit_relation', 'B'),
  ('review_decision_event', 'B'),
  ('governance_audit_event', 'B'),
  ('governance_binding', 'B'),
  ('rights_document_anchor', 'B'),
  ('typed_evidence_link', 'B'),
  ('derivation_record', 'B');

ALTER TABLE rgkb.subject_type_catalog FORCE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION rgkb.subject_type_catalog_frozen_guard()
RETURNS trigger
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    RAISE EXCEPTION 'RGKB Step 1 §2.5 fail closed: the controlled subject-type catalog is frozen at its accepted membership. Admitting a further family requires a new controlled specification version and explicit owner adjudication, not an insert.' USING ERRCODE = 'RG030';
  ELSIF TG_OP = 'UPDATE' THEN
    RAISE EXCEPTION 'RGKB Step 1 §2.5 fail closed: a family Pattern A/B assignment must not be reclassified in place; that requires explicit owner adjudication and a new controlled specification version.' USING ERRCODE = 'RG031';
  ELSE
    RAISE EXCEPTION 'RGKB Step 1 §2.5 fail closed: accepted catalog membership must not be removed; removal requires a new controlled specification version.' USING ERRCODE = 'RG032';
  END IF;
END;
$$;

COMMENT ON FUNCTION rgkb.subject_type_catalog_frozen_guard() IS 'PRM-WP02 Tier 2 controlled-membership guard for rgkb.subject_type_catalog (Step 1 §2.5). Supersedes the Tier 1 admission guard: the catalog now holds its accepted 19-family membership and is frozen against admission, reclassification and removal.';

DROP TRIGGER IF EXISTS subject_type_catalog_frozen_guard ON rgkb.subject_type_catalog;
CREATE TRIGGER subject_type_catalog_frozen_guard
  BEFORE INSERT OR UPDATE OR DELETE ON rgkb.subject_type_catalog
  FOR EACH ROW EXECUTE FUNCTION rgkb.subject_type_catalog_frozen_guard();

ALTER TABLE rgkb.subject_type_catalog
  ADD CONSTRAINT subject_type_catalog_type_pattern_key UNIQUE (subject_type, pattern);

-- -----------------------------------------------------------------------
-- 2) Registry: subject_type and DERIVED pattern.
-- -----------------------------------------------------------------------
--
--    Step 1 §2.1: a governed_instance carries exactly one subject_type drawn
--    from the controlled catalog, and pattern MUST EQUAL that subject type's
--    catalog assignment. pattern is DERIVED and is not a second authoritative
--    classification.
--
--    Derivation authority: the catalog, and only the catalog. A BEFORE INSERT
--    trigger (§6) READS the catalog assignment for the row's subject_type and:
--      * derives pattern when the caller omitted it;
--      * REJECTS a supplied value that contradicts the catalog (RG081) — it is
--        never silently corrected;
--      * fails closed when the subject_type has no catalog assignment (RG080),
--        which is also how an unknown, unresolved or excluded subject type is
--        refused.
--    The 19 assignments are NOT duplicated into CASE logic, an enum, constants
--    or a second table; there is exactly one family-to-pattern truth source.
--
--    The composite foreign key (subject_type, pattern) into the catalog remains
--    as DEFENCE IN DEPTH: even if the derivation trigger were ever bypassed,
--    divergence stays structurally impossible.
--
--    UNIQUE (instance_id, subject_type) exists so a concrete member table can
--    carry a composite foreign key back to it (§4), which is what makes one
--    instance_id structurally incapable of belonging to two families.
ALTER TABLE rgkb.governed_instance
  ADD COLUMN IF NOT EXISTS subject_type text NOT NULL,
  ADD COLUMN IF NOT EXISTS pattern text NOT NULL;

COMMENT ON COLUMN rgkb.governed_instance.subject_type IS 'Step 1 §2.1: the concrete governed family, drawn from the controlled subject-type catalog. Exactly one value per registry row (§4). Never transferable after allocation — the registry write guard refuses UPDATE (§3.2, §11.2).';

COMMENT ON COLUMN rgkb.governed_instance.pattern IS 'Step 1 §2.1: DERIVED Pattern A/B classification. Constrained by composite foreign key to equal the catalog assignment of subject_type; a mismatch is rejected as a governance/schema fault and is never silently corrected.';

ALTER TABLE rgkb.governed_instance
  ADD CONSTRAINT governed_instance_pattern_derives_from_catalog
    FOREIGN KEY (subject_type, pattern)
    REFERENCES rgkb.subject_type_catalog (subject_type, pattern);

ALTER TABLE rgkb.governed_instance
  ADD CONSTRAINT governed_instance_instance_subject_key UNIQUE (instance_id, subject_type);

-- -----------------------------------------------------------------------
-- 3) Shared write guards for the concrete family tables.
-- -----------------------------------------------------------------------
--
--    Stable identities (Pattern A only): object_id MUST be stable and MUST NOT
--    be reused (§2.2, §3.1); domain_code MUST be immutable once allocated and
--    MUST NOT be reused or repointed (§3.3). Both are enforced by refusing
--    UPDATE and DELETE outright.
--
--    Governed members (Pattern A versions and Pattern B records): instance_id
--    MUST NOT be reused, reallocated or transferred (§3.2), a version MUST NOT
--    be repointed to another stable identity (§2.3), and a governed instance
--    MUST remain resolvable indefinitely and MUST NOT be deleted (§5.3).
CREATE OR REPLACE FUNCTION rgkb.stable_identity_write_guard()
RETURNS trigger
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $$
BEGIN
  IF TG_OP = 'UPDATE' THEN
    RAISE EXCEPTION 'RGKB Step 1 §2.2/§3.1/§3.3 fail closed: a stable conceptual identity is immutable. object_id must not be reused or repointed and domain_code must not be changed, reused or repointed to another conceptual object.' USING ERRCODE = 'RG040';
  ELSE
    RAISE EXCEPTION 'RGKB Step 1 §2.2/§3.1 fail closed: a stable conceptual identity must not be deleted; its governed versions must remain resolvable indefinitely (§5.3).' USING ERRCODE = 'RG041';
  END IF;
END;
$$;

COMMENT ON FUNCTION rgkb.stable_identity_write_guard() IS 'PRM-WP02 Tier 2 immutability guard for Pattern A stable-identity tables (Step 1 §2.2, §3.1, §3.3, §5.3).';

CREATE OR REPLACE FUNCTION rgkb.governed_member_write_guard()
RETURNS trigger
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $$
BEGIN
  IF TG_OP = 'UPDATE' THEN
    RAISE EXCEPTION 'RGKB Step 1 §3.2/§2.3 fail closed: a governed instance identity must not be reused, reallocated or transferred, and a governed version must not be repointed to another stable identity.' USING ERRCODE = 'RG050';
  ELSE
    RAISE EXCEPTION 'RGKB Step 1 §5.3 fail closed: a governed instance must remain resolvable indefinitely and must not be deleted.' USING ERRCODE = 'RG051';
  END IF;
END;
$$;

COMMENT ON FUNCTION rgkb.governed_member_write_guard() IS 'PRM-WP02 Tier 2 immutability guard for concrete governed member tables — Pattern A versions and Pattern B records (Step 1 §2.3, §3.2, §5.3).';

CREATE OR REPLACE FUNCTION rgkb.stable_identity_has_version_check()
RETURNS trigger
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $$
DECLARE
  v_version_count integer;
BEGIN
  EXECUTE format('SELECT count(*) FROM rgkb.%I WHERE object_id = $1', TG_TABLE_NAME || '_version')
    INTO v_version_count
    USING NEW.object_id;

  IF v_version_count < 1 THEN
    RAISE EXCEPTION 'RGKB Step 1 §4 fail closed: one governed_object MUST own one or more governed_object_version instances. A stable identity holding no version instance asserts no governed meaning and must not remain a committed state.' USING ERRCODE = 'RG070';
  END IF;

  RETURN NULL;
END;
$$;

COMMENT ON FUNCTION rgkb.stable_identity_has_version_check() IS 'PRM-WP02 Tier 2 deferred cardinality check (Step 1 §4). Evaluated at COMMIT: a Pattern A stable identity that owns no governed version is refused, so no orphan stable identity can be committed. A caller that cannot see the version row cannot establish the invariant and is refused — fail closed, never open.';

CREATE OR REPLACE FUNCTION rgkb.governed_instance_pattern_derivation()
RETURNS trigger
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $$
DECLARE
  v_catalog_pattern text;
BEGIN
  SELECT c.pattern INTO v_catalog_pattern
    FROM rgkb.subject_type_catalog AS c
   WHERE c.subject_type = NEW.subject_type;

  IF v_catalog_pattern IS NULL THEN
    RAISE EXCEPTION 'RGKB Step 1 §2.1/§2.5 fail closed: the pattern of subject_type % cannot be established from the controlled subject-type catalog. An unknown, unresolved or excluded subject type is never admitted, and absence of a catalog assignment is not permission.', NEW.subject_type USING ERRCODE = 'RG080';
  END IF;

  IF NEW.pattern IS NULL THEN
    NEW.pattern := v_catalog_pattern;
  ELSIF NEW.pattern <> v_catalog_pattern THEN
    RAISE EXCEPTION 'RGKB Step 1 §2.1 fail closed: pattern is DERIVED from the controlled subject-type catalog and is not a second classification authority. The supplied value contradicts the catalog assignment for subject_type %, and is rejected as a governance/schema fault rather than silently corrected.', NEW.subject_type USING ERRCODE = 'RG081';
  END IF;

  RETURN NEW;
END;
$$;

COMMENT ON FUNCTION rgkb.governed_instance_pattern_derivation() IS 'PRM-WP02 Tier 2 derivation of rgkb.governed_instance.pattern (Step 1 §2.1). The controlled catalog is the only family-to-pattern authority: an omitted pattern is derived from it, a contradictory supplied pattern is refused (never corrected), and an unresolvable subject_type fails closed. The composite foreign key to the catalog remains as defence in depth.';

-- -----------------------------------------------------------------------
-- 4) Concrete member substrate — 11 Pattern A families.
-- -----------------------------------------------------------------------
--
--    Step 1 §2.2/§2.3 keep two identity levels strictly distinct:
--
--      rgkb.<family>          — the STABLE CONCEPTUAL IDENTITY. It carries
--                               object_id and the semantics-free domain_code.
--                               It is NOT a governed_instance, is NOT a
--                               governance-act target, and carries no
--                               instance_id (§2.1, §2.2, §11.1).
--
--      rgkb.<family>_version  — the GOVERNED VERSION INSTANCE. Its primary key
--                               IS the registry instance_id (§3.2: the version
--                               carries the registry identity as its own and
--                               never a second duplicating identity). It
--                               belongs to exactly one object_id (§4) and
--                               carries version_sequence as ORDERING ONLY.
--
--    version_sequence is not an identity, is not a governance-act target, and
--    is never a current-version tie-break (§3.4, §9.4). Nothing in this
--    migration selects, orders, compares, maximises or limits by it.
--
--    MONOTONICITY (§2.3, §3.4) is enforced STRUCTURALLY, with no reads at all,
--    so it does not depend on row visibility under row level security:
--
--      * previous_sequence names the version this one was authored after,
--        within the same stable identity, and is NULL on the first version;
--      * CHECK (version_sequence > previous_sequence) makes the step strictly
--        increasing — GAPS REMAIN PERMITTED, since only the direction is
--        constrained, never the size of the step;
--      * a self foreign key (object_id, previous_sequence) -> (object_id,
--        version_sequence) makes the named predecessor have to exist, for this
--        same stable identity;
--      * UNIQUE (object_id, previous_sequence) lets each version be followed
--        by at most one successor, so the chain cannot branch;
--      * a partial unique index on (object_id) WHERE previous_sequence IS NULL
--        allows exactly one first version per stable identity.
--
--    Together these force the version set of one stable identity to be a
--    single linear chain that can only be extended at its tail, so every newly
--    created version necessarily carries a version_sequence strictly greater
--    than every version created before it. That is monotonic creation order.
--
--    THIS IS NOT A CURRENCY MECHANISM. The chain records authoring order and
--    nothing else. It confers no scientific, approval, validation, runtime,
--    precedence or currency meaning, it is never a governance-act target, and
--    it MUST NOT be read as "the current version" — resolution remains F-07's
--    open question and the resolver remains fail-closed (§10.1 of Step 1 and
--    the untouched rgkb.resolve_current_version).
--
--    CARDINALITY (§4): one governed_object MUST own one or more version
--    instances. A stable identity holding none asserts no governed meaning.
--    Each stable-identity table therefore carries a DEFERRABLE INITIALLY
--    DEFERRED constraint trigger that refuses, at COMMIT, a stable identity
--    with zero versions (RG070). Deferral is what lets the first identity and
--    its first version be created in one transaction. A caller that cannot see
--    the version row cannot establish the invariant and is refused — fail
--    closed, never open.
--
--    domain_code carries NO format constraint here: Step 1 §3.3 defers the
--    allocation format, the allocation authority and the collision-prevention
--    mechanism to a later controlled specification, and inventing one is not
--    authorized. Uniqueness and immutability — the parts Step 1 does fix — are
--    enforced.
--
--    No domain payload column is added to any family. WP02 is the identity /
--    version foundation only.

CREATE TABLE IF NOT EXISTS rgkb.knowledge_unit (
  object_id   uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  domain_code text NOT NULL,
  CONSTRAINT knowledge_unit_domain_code_key UNIQUE (domain_code)
);

COMMENT ON TABLE rgkb.knowledge_unit IS 'Step 1 §2.2 Pattern A stable conceptual identity for the accepted catalog family knowledge_unit. Not a governed_instance and never a governance-act target (§2.1, §11.1).';

ALTER TABLE rgkb.knowledge_unit ENABLE ROW LEVEL SECURITY;
ALTER TABLE rgkb.knowledge_unit FORCE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE rgkb.knowledge_unit FROM PUBLIC;
REVOKE ALL ON TABLE rgkb.knowledge_unit FROM anon;
REVOKE ALL ON TABLE rgkb.knowledge_unit FROM authenticated;

DROP TRIGGER IF EXISTS knowledge_unit_write_guard ON rgkb.knowledge_unit;
CREATE TRIGGER knowledge_unit_write_guard
  BEFORE UPDATE OR DELETE ON rgkb.knowledge_unit
  FOR EACH ROW EXECUTE FUNCTION rgkb.stable_identity_write_guard();

DROP TRIGGER IF EXISTS knowledge_unit_has_version_check ON rgkb.knowledge_unit;
CREATE CONSTRAINT TRIGGER knowledge_unit_has_version_check
  AFTER INSERT ON rgkb.knowledge_unit
  DEFERRABLE INITIALLY DEFERRED
  FOR EACH ROW EXECUTE FUNCTION rgkb.stable_identity_has_version_check();

CREATE TABLE IF NOT EXISTS rgkb.knowledge_unit_version (
  instance_id       uuid PRIMARY KEY,
  subject_type      text NOT NULL DEFAULT 'knowledge_unit',
  object_id         uuid NOT NULL,
  version_sequence  integer NOT NULL,
  previous_sequence integer,
  CONSTRAINT knowledge_unit_version_subject_type_fixed CHECK (subject_type = 'knowledge_unit'),
  CONSTRAINT knowledge_unit_version_monotonic CHECK (previous_sequence IS NULL OR version_sequence > previous_sequence),
  CONSTRAINT knowledge_unit_version_instance_fk FOREIGN KEY (instance_id, subject_type)
    REFERENCES rgkb.governed_instance (instance_id, subject_type),
  CONSTRAINT knowledge_unit_version_object_fk FOREIGN KEY (object_id)
    REFERENCES rgkb.knowledge_unit (object_id),
  CONSTRAINT knowledge_unit_version_sequence_unique UNIQUE (object_id, version_sequence),
  CONSTRAINT knowledge_unit_version_previous_fk FOREIGN KEY (object_id, previous_sequence)
    REFERENCES rgkb.knowledge_unit_version (object_id, version_sequence),
  CONSTRAINT knowledge_unit_version_previous_unique UNIQUE (object_id, previous_sequence)
);

CREATE UNIQUE INDEX IF NOT EXISTS knowledge_unit_version_first_unique
  ON rgkb.knowledge_unit_version (object_id) WHERE previous_sequence IS NULL;

COMMENT ON TABLE rgkb.knowledge_unit_version IS 'Step 1 §2.3 Pattern A governed version instance for the accepted catalog family knowledge_unit. Its primary key is the registry instance_id (§3.2). version_sequence is ordering only and is never an identity, a governance-act target or a tie-break (§3.4, §9.4).';

COMMENT ON COLUMN rgkb.knowledge_unit_version.previous_sequence IS 'Step 1 §2.3/§3.4 monotonicity structure: the version_sequence this version was authored after, within the same stable identity. NULL on the first version only. It carries authoring order and nothing else — no scientific, approval, validation, runtime, precedence or currency meaning, and it is never a governance-act target or a resolution tie-break.';

ALTER TABLE rgkb.knowledge_unit_version ENABLE ROW LEVEL SECURITY;
ALTER TABLE rgkb.knowledge_unit_version FORCE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE rgkb.knowledge_unit_version FROM PUBLIC;
REVOKE ALL ON TABLE rgkb.knowledge_unit_version FROM anon;
REVOKE ALL ON TABLE rgkb.knowledge_unit_version FROM authenticated;

DROP TRIGGER IF EXISTS knowledge_unit_version_write_guard ON rgkb.knowledge_unit_version;
CREATE TRIGGER knowledge_unit_version_write_guard
  BEFORE UPDATE OR DELETE ON rgkb.knowledge_unit_version
  FOR EACH ROW EXECUTE FUNCTION rgkb.governed_member_write_guard();

CREATE TABLE IF NOT EXISTS rgkb.guardrail (
  object_id   uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  domain_code text NOT NULL,
  CONSTRAINT guardrail_domain_code_key UNIQUE (domain_code)
);

COMMENT ON TABLE rgkb.guardrail IS 'Step 1 §2.2 Pattern A stable conceptual identity for the accepted catalog family guardrail. Not a governed_instance and never a governance-act target (§2.1, §11.1).';

ALTER TABLE rgkb.guardrail ENABLE ROW LEVEL SECURITY;
ALTER TABLE rgkb.guardrail FORCE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE rgkb.guardrail FROM PUBLIC;
REVOKE ALL ON TABLE rgkb.guardrail FROM anon;
REVOKE ALL ON TABLE rgkb.guardrail FROM authenticated;

DROP TRIGGER IF EXISTS guardrail_write_guard ON rgkb.guardrail;
CREATE TRIGGER guardrail_write_guard
  BEFORE UPDATE OR DELETE ON rgkb.guardrail
  FOR EACH ROW EXECUTE FUNCTION rgkb.stable_identity_write_guard();

DROP TRIGGER IF EXISTS guardrail_has_version_check ON rgkb.guardrail;
CREATE CONSTRAINT TRIGGER guardrail_has_version_check
  AFTER INSERT ON rgkb.guardrail
  DEFERRABLE INITIALLY DEFERRED
  FOR EACH ROW EXECUTE FUNCTION rgkb.stable_identity_has_version_check();

CREATE TABLE IF NOT EXISTS rgkb.guardrail_version (
  instance_id       uuid PRIMARY KEY,
  subject_type      text NOT NULL DEFAULT 'guardrail',
  object_id         uuid NOT NULL,
  version_sequence  integer NOT NULL,
  previous_sequence integer,
  CONSTRAINT guardrail_version_subject_type_fixed CHECK (subject_type = 'guardrail'),
  CONSTRAINT guardrail_version_monotonic CHECK (previous_sequence IS NULL OR version_sequence > previous_sequence),
  CONSTRAINT guardrail_version_instance_fk FOREIGN KEY (instance_id, subject_type)
    REFERENCES rgkb.governed_instance (instance_id, subject_type),
  CONSTRAINT guardrail_version_object_fk FOREIGN KEY (object_id)
    REFERENCES rgkb.guardrail (object_id),
  CONSTRAINT guardrail_version_sequence_unique UNIQUE (object_id, version_sequence),
  CONSTRAINT guardrail_version_previous_fk FOREIGN KEY (object_id, previous_sequence)
    REFERENCES rgkb.guardrail_version (object_id, version_sequence),
  CONSTRAINT guardrail_version_previous_unique UNIQUE (object_id, previous_sequence)
);

CREATE UNIQUE INDEX IF NOT EXISTS guardrail_version_first_unique
  ON rgkb.guardrail_version (object_id) WHERE previous_sequence IS NULL;

COMMENT ON TABLE rgkb.guardrail_version IS 'Step 1 §2.3 Pattern A governed version instance for the accepted catalog family guardrail. Its primary key is the registry instance_id (§3.2). version_sequence is ordering only and is never an identity, a governance-act target or a tie-break (§3.4, §9.4).';

COMMENT ON COLUMN rgkb.guardrail_version.previous_sequence IS 'Step 1 §2.3/§3.4 monotonicity structure: the version_sequence this version was authored after, within the same stable identity. NULL on the first version only. It carries authoring order and nothing else — no scientific, approval, validation, runtime, precedence or currency meaning, and it is never a governance-act target or a resolution tie-break.';

ALTER TABLE rgkb.guardrail_version ENABLE ROW LEVEL SECURITY;
ALTER TABLE rgkb.guardrail_version FORCE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE rgkb.guardrail_version FROM PUBLIC;
REVOKE ALL ON TABLE rgkb.guardrail_version FROM anon;
REVOKE ALL ON TABLE rgkb.guardrail_version FROM authenticated;

DROP TRIGGER IF EXISTS guardrail_version_write_guard ON rgkb.guardrail_version;
CREATE TRIGGER guardrail_version_write_guard
  BEFORE UPDATE OR DELETE ON rgkb.guardrail_version
  FOR EACH ROW EXECUTE FUNCTION rgkb.governed_member_write_guard();

CREATE TABLE IF NOT EXISTS rgkb.interpretation_rule (
  object_id   uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  domain_code text NOT NULL,
  CONSTRAINT interpretation_rule_domain_code_key UNIQUE (domain_code)
);

COMMENT ON TABLE rgkb.interpretation_rule IS 'Step 1 §2.2 Pattern A stable conceptual identity for the accepted catalog family interpretation_rule. Not a governed_instance and never a governance-act target (§2.1, §11.1).';

ALTER TABLE rgkb.interpretation_rule ENABLE ROW LEVEL SECURITY;
ALTER TABLE rgkb.interpretation_rule FORCE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE rgkb.interpretation_rule FROM PUBLIC;
REVOKE ALL ON TABLE rgkb.interpretation_rule FROM anon;
REVOKE ALL ON TABLE rgkb.interpretation_rule FROM authenticated;

DROP TRIGGER IF EXISTS interpretation_rule_write_guard ON rgkb.interpretation_rule;
CREATE TRIGGER interpretation_rule_write_guard
  BEFORE UPDATE OR DELETE ON rgkb.interpretation_rule
  FOR EACH ROW EXECUTE FUNCTION rgkb.stable_identity_write_guard();

DROP TRIGGER IF EXISTS interpretation_rule_has_version_check ON rgkb.interpretation_rule;
CREATE CONSTRAINT TRIGGER interpretation_rule_has_version_check
  AFTER INSERT ON rgkb.interpretation_rule
  DEFERRABLE INITIALLY DEFERRED
  FOR EACH ROW EXECUTE FUNCTION rgkb.stable_identity_has_version_check();

CREATE TABLE IF NOT EXISTS rgkb.interpretation_rule_version (
  instance_id       uuid PRIMARY KEY,
  subject_type      text NOT NULL DEFAULT 'interpretation_rule',
  object_id         uuid NOT NULL,
  version_sequence  integer NOT NULL,
  previous_sequence integer,
  CONSTRAINT interpretation_rule_version_subject_type_fixed CHECK (subject_type = 'interpretation_rule'),
  CONSTRAINT interpretation_rule_version_monotonic CHECK (previous_sequence IS NULL OR version_sequence > previous_sequence),
  CONSTRAINT interpretation_rule_version_instance_fk FOREIGN KEY (instance_id, subject_type)
    REFERENCES rgkb.governed_instance (instance_id, subject_type),
  CONSTRAINT interpretation_rule_version_object_fk FOREIGN KEY (object_id)
    REFERENCES rgkb.interpretation_rule (object_id),
  CONSTRAINT interpretation_rule_version_sequence_unique UNIQUE (object_id, version_sequence),
  CONSTRAINT interpretation_rule_version_previous_fk FOREIGN KEY (object_id, previous_sequence)
    REFERENCES rgkb.interpretation_rule_version (object_id, version_sequence),
  CONSTRAINT interpretation_rule_version_previous_unique UNIQUE (object_id, previous_sequence)
);

CREATE UNIQUE INDEX IF NOT EXISTS interpretation_rule_version_first_unique
  ON rgkb.interpretation_rule_version (object_id) WHERE previous_sequence IS NULL;

COMMENT ON TABLE rgkb.interpretation_rule_version IS 'Step 1 §2.3 Pattern A governed version instance for the accepted catalog family interpretation_rule. Its primary key is the registry instance_id (§3.2). version_sequence is ordering only and is never an identity, a governance-act target or a tie-break (§3.4, §9.4).';

COMMENT ON COLUMN rgkb.interpretation_rule_version.previous_sequence IS 'Step 1 §2.3/§3.4 monotonicity structure: the version_sequence this version was authored after, within the same stable identity. NULL on the first version only. It carries authoring order and nothing else — no scientific, approval, validation, runtime, precedence or currency meaning, and it is never a governance-act target or a resolution tie-break.';

ALTER TABLE rgkb.interpretation_rule_version ENABLE ROW LEVEL SECURITY;
ALTER TABLE rgkb.interpretation_rule_version FORCE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE rgkb.interpretation_rule_version FROM PUBLIC;
REVOKE ALL ON TABLE rgkb.interpretation_rule_version FROM anon;
REVOKE ALL ON TABLE rgkb.interpretation_rule_version FROM authenticated;

DROP TRIGGER IF EXISTS interpretation_rule_version_write_guard ON rgkb.interpretation_rule_version;
CREATE TRIGGER interpretation_rule_version_write_guard
  BEFORE UPDATE OR DELETE ON rgkb.interpretation_rule_version
  FOR EACH ROW EXECUTE FUNCTION rgkb.governed_member_write_guard();

CREATE TABLE IF NOT EXISTS rgkb.construct_definition (
  object_id   uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  domain_code text NOT NULL,
  CONSTRAINT construct_definition_domain_code_key UNIQUE (domain_code)
);

COMMENT ON TABLE rgkb.construct_definition IS 'Step 1 §2.2 Pattern A stable conceptual identity for the accepted catalog family construct_definition. Not a governed_instance and never a governance-act target (§2.1, §11.1).';

ALTER TABLE rgkb.construct_definition ENABLE ROW LEVEL SECURITY;
ALTER TABLE rgkb.construct_definition FORCE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE rgkb.construct_definition FROM PUBLIC;
REVOKE ALL ON TABLE rgkb.construct_definition FROM anon;
REVOKE ALL ON TABLE rgkb.construct_definition FROM authenticated;

DROP TRIGGER IF EXISTS construct_definition_write_guard ON rgkb.construct_definition;
CREATE TRIGGER construct_definition_write_guard
  BEFORE UPDATE OR DELETE ON rgkb.construct_definition
  FOR EACH ROW EXECUTE FUNCTION rgkb.stable_identity_write_guard();

DROP TRIGGER IF EXISTS construct_definition_has_version_check ON rgkb.construct_definition;
CREATE CONSTRAINT TRIGGER construct_definition_has_version_check
  AFTER INSERT ON rgkb.construct_definition
  DEFERRABLE INITIALLY DEFERRED
  FOR EACH ROW EXECUTE FUNCTION rgkb.stable_identity_has_version_check();

CREATE TABLE IF NOT EXISTS rgkb.construct_definition_version (
  instance_id       uuid PRIMARY KEY,
  subject_type      text NOT NULL DEFAULT 'construct_definition',
  object_id         uuid NOT NULL,
  version_sequence  integer NOT NULL,
  previous_sequence integer,
  CONSTRAINT construct_definition_version_subject_type_fixed CHECK (subject_type = 'construct_definition'),
  CONSTRAINT construct_definition_version_monotonic CHECK (previous_sequence IS NULL OR version_sequence > previous_sequence),
  CONSTRAINT construct_definition_version_instance_fk FOREIGN KEY (instance_id, subject_type)
    REFERENCES rgkb.governed_instance (instance_id, subject_type),
  CONSTRAINT construct_definition_version_object_fk FOREIGN KEY (object_id)
    REFERENCES rgkb.construct_definition (object_id),
  CONSTRAINT construct_definition_version_sequence_unique UNIQUE (object_id, version_sequence),
  CONSTRAINT construct_definition_version_previous_fk FOREIGN KEY (object_id, previous_sequence)
    REFERENCES rgkb.construct_definition_version (object_id, version_sequence),
  CONSTRAINT construct_definition_version_previous_unique UNIQUE (object_id, previous_sequence)
);

CREATE UNIQUE INDEX IF NOT EXISTS construct_definition_version_first_unique
  ON rgkb.construct_definition_version (object_id) WHERE previous_sequence IS NULL;

COMMENT ON TABLE rgkb.construct_definition_version IS 'Step 1 §2.3 Pattern A governed version instance for the accepted catalog family construct_definition. Its primary key is the registry instance_id (§3.2). version_sequence is ordering only and is never an identity, a governance-act target or a tie-break (§3.4, §9.4).';

COMMENT ON COLUMN rgkb.construct_definition_version.previous_sequence IS 'Step 1 §2.3/§3.4 monotonicity structure: the version_sequence this version was authored after, within the same stable identity. NULL on the first version only. It carries authoring order and nothing else — no scientific, approval, validation, runtime, precedence or currency meaning, and it is never a governance-act target or a resolution tie-break.';

ALTER TABLE rgkb.construct_definition_version ENABLE ROW LEVEL SECURITY;
ALTER TABLE rgkb.construct_definition_version FORCE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE rgkb.construct_definition_version FROM PUBLIC;
REVOKE ALL ON TABLE rgkb.construct_definition_version FROM anon;
REVOKE ALL ON TABLE rgkb.construct_definition_version FROM authenticated;

DROP TRIGGER IF EXISTS construct_definition_version_write_guard ON rgkb.construct_definition_version;
CREATE TRIGGER construct_definition_version_write_guard
  BEFORE UPDATE OR DELETE ON rgkb.construct_definition_version
  FOR EACH ROW EXECUTE FUNCTION rgkb.governed_member_write_guard();

CREATE TABLE IF NOT EXISTS rgkb.rights_decision (
  object_id   uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  domain_code text NOT NULL,
  CONSTRAINT rights_decision_domain_code_key UNIQUE (domain_code)
);

COMMENT ON TABLE rgkb.rights_decision IS 'Step 1 §2.2 Pattern A stable conceptual identity for the accepted catalog family rights_decision. Not a governed_instance and never a governance-act target (§2.1, §11.1).';

ALTER TABLE rgkb.rights_decision ENABLE ROW LEVEL SECURITY;
ALTER TABLE rgkb.rights_decision FORCE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE rgkb.rights_decision FROM PUBLIC;
REVOKE ALL ON TABLE rgkb.rights_decision FROM anon;
REVOKE ALL ON TABLE rgkb.rights_decision FROM authenticated;

DROP TRIGGER IF EXISTS rights_decision_write_guard ON rgkb.rights_decision;
CREATE TRIGGER rights_decision_write_guard
  BEFORE UPDATE OR DELETE ON rgkb.rights_decision
  FOR EACH ROW EXECUTE FUNCTION rgkb.stable_identity_write_guard();

DROP TRIGGER IF EXISTS rights_decision_has_version_check ON rgkb.rights_decision;
CREATE CONSTRAINT TRIGGER rights_decision_has_version_check
  AFTER INSERT ON rgkb.rights_decision
  DEFERRABLE INITIALLY DEFERRED
  FOR EACH ROW EXECUTE FUNCTION rgkb.stable_identity_has_version_check();

CREATE TABLE IF NOT EXISTS rgkb.rights_decision_version (
  instance_id       uuid PRIMARY KEY,
  subject_type      text NOT NULL DEFAULT 'rights_decision',
  object_id         uuid NOT NULL,
  version_sequence  integer NOT NULL,
  previous_sequence integer,
  CONSTRAINT rights_decision_version_subject_type_fixed CHECK (subject_type = 'rights_decision'),
  CONSTRAINT rights_decision_version_monotonic CHECK (previous_sequence IS NULL OR version_sequence > previous_sequence),
  CONSTRAINT rights_decision_version_instance_fk FOREIGN KEY (instance_id, subject_type)
    REFERENCES rgkb.governed_instance (instance_id, subject_type),
  CONSTRAINT rights_decision_version_object_fk FOREIGN KEY (object_id)
    REFERENCES rgkb.rights_decision (object_id),
  CONSTRAINT rights_decision_version_sequence_unique UNIQUE (object_id, version_sequence),
  CONSTRAINT rights_decision_version_previous_fk FOREIGN KEY (object_id, previous_sequence)
    REFERENCES rgkb.rights_decision_version (object_id, version_sequence),
  CONSTRAINT rights_decision_version_previous_unique UNIQUE (object_id, previous_sequence)
);

CREATE UNIQUE INDEX IF NOT EXISTS rights_decision_version_first_unique
  ON rgkb.rights_decision_version (object_id) WHERE previous_sequence IS NULL;

COMMENT ON TABLE rgkb.rights_decision_version IS 'Step 1 §2.3 Pattern A governed version instance for the accepted catalog family rights_decision. Its primary key is the registry instance_id (§3.2). version_sequence is ordering only and is never an identity, a governance-act target or a tie-break (§3.4, §9.4).';

COMMENT ON COLUMN rgkb.rights_decision_version.previous_sequence IS 'Step 1 §2.3/§3.4 monotonicity structure: the version_sequence this version was authored after, within the same stable identity. NULL on the first version only. It carries authoring order and nothing else — no scientific, approval, validation, runtime, precedence or currency meaning, and it is never a governance-act target or a resolution tie-break.';

ALTER TABLE rgkb.rights_decision_version ENABLE ROW LEVEL SECURITY;
ALTER TABLE rgkb.rights_decision_version FORCE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE rgkb.rights_decision_version FROM PUBLIC;
REVOKE ALL ON TABLE rgkb.rights_decision_version FROM anon;
REVOKE ALL ON TABLE rgkb.rights_decision_version FROM authenticated;

DROP TRIGGER IF EXISTS rights_decision_version_write_guard ON rgkb.rights_decision_version;
CREATE TRIGGER rights_decision_version_write_guard
  BEFORE UPDATE OR DELETE ON rgkb.rights_decision_version
  FOR EACH ROW EXECUTE FUNCTION rgkb.governed_member_write_guard();

CREATE TABLE IF NOT EXISTS rgkb.instrument (
  object_id   uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  domain_code text NOT NULL,
  CONSTRAINT instrument_domain_code_key UNIQUE (domain_code)
);

COMMENT ON TABLE rgkb.instrument IS 'Step 1 §2.2 Pattern A stable conceptual identity for the accepted catalog family instrument. Not a governed_instance and never a governance-act target (§2.1, §11.1).';

ALTER TABLE rgkb.instrument ENABLE ROW LEVEL SECURITY;
ALTER TABLE rgkb.instrument FORCE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE rgkb.instrument FROM PUBLIC;
REVOKE ALL ON TABLE rgkb.instrument FROM anon;
REVOKE ALL ON TABLE rgkb.instrument FROM authenticated;

DROP TRIGGER IF EXISTS instrument_write_guard ON rgkb.instrument;
CREATE TRIGGER instrument_write_guard
  BEFORE UPDATE OR DELETE ON rgkb.instrument
  FOR EACH ROW EXECUTE FUNCTION rgkb.stable_identity_write_guard();

DROP TRIGGER IF EXISTS instrument_has_version_check ON rgkb.instrument;
CREATE CONSTRAINT TRIGGER instrument_has_version_check
  AFTER INSERT ON rgkb.instrument
  DEFERRABLE INITIALLY DEFERRED
  FOR EACH ROW EXECUTE FUNCTION rgkb.stable_identity_has_version_check();

CREATE TABLE IF NOT EXISTS rgkb.instrument_version (
  instance_id       uuid PRIMARY KEY,
  subject_type      text NOT NULL DEFAULT 'instrument',
  object_id         uuid NOT NULL,
  version_sequence  integer NOT NULL,
  previous_sequence integer,
  CONSTRAINT instrument_version_subject_type_fixed CHECK (subject_type = 'instrument'),
  CONSTRAINT instrument_version_monotonic CHECK (previous_sequence IS NULL OR version_sequence > previous_sequence),
  CONSTRAINT instrument_version_instance_fk FOREIGN KEY (instance_id, subject_type)
    REFERENCES rgkb.governed_instance (instance_id, subject_type),
  CONSTRAINT instrument_version_object_fk FOREIGN KEY (object_id)
    REFERENCES rgkb.instrument (object_id),
  CONSTRAINT instrument_version_sequence_unique UNIQUE (object_id, version_sequence),
  CONSTRAINT instrument_version_previous_fk FOREIGN KEY (object_id, previous_sequence)
    REFERENCES rgkb.instrument_version (object_id, version_sequence),
  CONSTRAINT instrument_version_previous_unique UNIQUE (object_id, previous_sequence)
);

CREATE UNIQUE INDEX IF NOT EXISTS instrument_version_first_unique
  ON rgkb.instrument_version (object_id) WHERE previous_sequence IS NULL;

COMMENT ON TABLE rgkb.instrument_version IS 'Step 1 §2.3 Pattern A governed version instance for the accepted catalog family instrument. Its primary key is the registry instance_id (§3.2). version_sequence is ordering only and is never an identity, a governance-act target or a tie-break (§3.4, §9.4).';

COMMENT ON COLUMN rgkb.instrument_version.previous_sequence IS 'Step 1 §2.3/§3.4 monotonicity structure: the version_sequence this version was authored after, within the same stable identity. NULL on the first version only. It carries authoring order and nothing else — no scientific, approval, validation, runtime, precedence or currency meaning, and it is never a governance-act target or a resolution tie-break.';

ALTER TABLE rgkb.instrument_version ENABLE ROW LEVEL SECURITY;
ALTER TABLE rgkb.instrument_version FORCE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE rgkb.instrument_version FROM PUBLIC;
REVOKE ALL ON TABLE rgkb.instrument_version FROM anon;
REVOKE ALL ON TABLE rgkb.instrument_version FROM authenticated;

DROP TRIGGER IF EXISTS instrument_version_write_guard ON rgkb.instrument_version;
CREATE TRIGGER instrument_version_write_guard
  BEFORE UPDATE OR DELETE ON rgkb.instrument_version
  FOR EACH ROW EXECUTE FUNCTION rgkb.governed_member_write_guard();

CREATE TABLE IF NOT EXISTS rgkb.localized_governed_text (
  object_id   uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  domain_code text NOT NULL,
  CONSTRAINT localized_governed_text_domain_code_key UNIQUE (domain_code)
);

COMMENT ON TABLE rgkb.localized_governed_text IS 'Step 1 §2.2 Pattern A stable conceptual identity for the accepted catalog family localized_governed_text. Not a governed_instance and never a governance-act target (§2.1, §11.1).';

ALTER TABLE rgkb.localized_governed_text ENABLE ROW LEVEL SECURITY;
ALTER TABLE rgkb.localized_governed_text FORCE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE rgkb.localized_governed_text FROM PUBLIC;
REVOKE ALL ON TABLE rgkb.localized_governed_text FROM anon;
REVOKE ALL ON TABLE rgkb.localized_governed_text FROM authenticated;

DROP TRIGGER IF EXISTS localized_governed_text_write_guard ON rgkb.localized_governed_text;
CREATE TRIGGER localized_governed_text_write_guard
  BEFORE UPDATE OR DELETE ON rgkb.localized_governed_text
  FOR EACH ROW EXECUTE FUNCTION rgkb.stable_identity_write_guard();

DROP TRIGGER IF EXISTS localized_governed_text_has_version_check ON rgkb.localized_governed_text;
CREATE CONSTRAINT TRIGGER localized_governed_text_has_version_check
  AFTER INSERT ON rgkb.localized_governed_text
  DEFERRABLE INITIALLY DEFERRED
  FOR EACH ROW EXECUTE FUNCTION rgkb.stable_identity_has_version_check();

CREATE TABLE IF NOT EXISTS rgkb.localized_governed_text_version (
  instance_id       uuid PRIMARY KEY,
  subject_type      text NOT NULL DEFAULT 'localized_governed_text',
  object_id         uuid NOT NULL,
  version_sequence  integer NOT NULL,
  previous_sequence integer,
  CONSTRAINT localized_governed_text_version_subject_type_fixed CHECK (subject_type = 'localized_governed_text'),
  CONSTRAINT localized_governed_text_version_monotonic CHECK (previous_sequence IS NULL OR version_sequence > previous_sequence),
  CONSTRAINT localized_governed_text_version_instance_fk FOREIGN KEY (instance_id, subject_type)
    REFERENCES rgkb.governed_instance (instance_id, subject_type),
  CONSTRAINT localized_governed_text_version_object_fk FOREIGN KEY (object_id)
    REFERENCES rgkb.localized_governed_text (object_id),
  CONSTRAINT localized_governed_text_version_sequence_unique UNIQUE (object_id, version_sequence),
  CONSTRAINT localized_governed_text_version_previous_fk FOREIGN KEY (object_id, previous_sequence)
    REFERENCES rgkb.localized_governed_text_version (object_id, version_sequence),
  CONSTRAINT localized_governed_text_version_previous_unique UNIQUE (object_id, previous_sequence)
);

CREATE UNIQUE INDEX IF NOT EXISTS localized_governed_text_version_first_unique
  ON rgkb.localized_governed_text_version (object_id) WHERE previous_sequence IS NULL;

COMMENT ON TABLE rgkb.localized_governed_text_version IS 'Step 1 §2.3 Pattern A governed version instance for the accepted catalog family localized_governed_text. Its primary key is the registry instance_id (§3.2). version_sequence is ordering only and is never an identity, a governance-act target or a tie-break (§3.4, §9.4).';

COMMENT ON COLUMN rgkb.localized_governed_text_version.previous_sequence IS 'Step 1 §2.3/§3.4 monotonicity structure: the version_sequence this version was authored after, within the same stable identity. NULL on the first version only. It carries authoring order and nothing else — no scientific, approval, validation, runtime, precedence or currency meaning, and it is never a governance-act target or a resolution tie-break.';

ALTER TABLE rgkb.localized_governed_text_version ENABLE ROW LEVEL SECURITY;
ALTER TABLE rgkb.localized_governed_text_version FORCE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE rgkb.localized_governed_text_version FROM PUBLIC;
REVOKE ALL ON TABLE rgkb.localized_governed_text_version FROM anon;
REVOKE ALL ON TABLE rgkb.localized_governed_text_version FROM authenticated;

DROP TRIGGER IF EXISTS localized_governed_text_version_write_guard ON rgkb.localized_governed_text_version;
CREATE TRIGGER localized_governed_text_version_write_guard
  BEFORE UPDATE OR DELETE ON rgkb.localized_governed_text_version
  FOR EACH ROW EXECUTE FUNCTION rgkb.governed_member_write_guard();

CREATE TABLE IF NOT EXISTS rgkb.validation_derivation_rule (
  object_id   uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  domain_code text NOT NULL,
  CONSTRAINT validation_derivation_rule_domain_code_key UNIQUE (domain_code)
);

COMMENT ON TABLE rgkb.validation_derivation_rule IS 'Step 1 §2.2 Pattern A stable conceptual identity for the accepted catalog family validation_derivation_rule. Not a governed_instance and never a governance-act target (§2.1, §11.1).';

ALTER TABLE rgkb.validation_derivation_rule ENABLE ROW LEVEL SECURITY;
ALTER TABLE rgkb.validation_derivation_rule FORCE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE rgkb.validation_derivation_rule FROM PUBLIC;
REVOKE ALL ON TABLE rgkb.validation_derivation_rule FROM anon;
REVOKE ALL ON TABLE rgkb.validation_derivation_rule FROM authenticated;

DROP TRIGGER IF EXISTS validation_derivation_rule_write_guard ON rgkb.validation_derivation_rule;
CREATE TRIGGER validation_derivation_rule_write_guard
  BEFORE UPDATE OR DELETE ON rgkb.validation_derivation_rule
  FOR EACH ROW EXECUTE FUNCTION rgkb.stable_identity_write_guard();

DROP TRIGGER IF EXISTS validation_derivation_rule_has_version_check ON rgkb.validation_derivation_rule;
CREATE CONSTRAINT TRIGGER validation_derivation_rule_has_version_check
  AFTER INSERT ON rgkb.validation_derivation_rule
  DEFERRABLE INITIALLY DEFERRED
  FOR EACH ROW EXECUTE FUNCTION rgkb.stable_identity_has_version_check();

CREATE TABLE IF NOT EXISTS rgkb.validation_derivation_rule_version (
  instance_id       uuid PRIMARY KEY,
  subject_type      text NOT NULL DEFAULT 'validation_derivation_rule',
  object_id         uuid NOT NULL,
  version_sequence  integer NOT NULL,
  previous_sequence integer,
  CONSTRAINT validation_derivation_rule_version_subject_type_fixed CHECK (subject_type = 'validation_derivation_rule'),
  CONSTRAINT validation_derivation_rule_version_monotonic CHECK (previous_sequence IS NULL OR version_sequence > previous_sequence),
  CONSTRAINT validation_derivation_rule_version_instance_fk FOREIGN KEY (instance_id, subject_type)
    REFERENCES rgkb.governed_instance (instance_id, subject_type),
  CONSTRAINT validation_derivation_rule_version_object_fk FOREIGN KEY (object_id)
    REFERENCES rgkb.validation_derivation_rule (object_id),
  CONSTRAINT validation_derivation_rule_version_sequence_unique UNIQUE (object_id, version_sequence),
  CONSTRAINT validation_derivation_rule_version_previous_fk FOREIGN KEY (object_id, previous_sequence)
    REFERENCES rgkb.validation_derivation_rule_version (object_id, version_sequence),
  CONSTRAINT validation_derivation_rule_version_previous_unique UNIQUE (object_id, previous_sequence)
);

CREATE UNIQUE INDEX IF NOT EXISTS validation_derivation_rule_version_first_unique
  ON rgkb.validation_derivation_rule_version (object_id) WHERE previous_sequence IS NULL;

COMMENT ON TABLE rgkb.validation_derivation_rule_version IS 'Step 1 §2.3 Pattern A governed version instance for the accepted catalog family validation_derivation_rule. Its primary key is the registry instance_id (§3.2). version_sequence is ordering only and is never an identity, a governance-act target or a tie-break (§3.4, §9.4).';

COMMENT ON COLUMN rgkb.validation_derivation_rule_version.previous_sequence IS 'Step 1 §2.3/§3.4 monotonicity structure: the version_sequence this version was authored after, within the same stable identity. NULL on the first version only. It carries authoring order and nothing else — no scientific, approval, validation, runtime, precedence or currency meaning, and it is never a governance-act target or a resolution tie-break.';

ALTER TABLE rgkb.validation_derivation_rule_version ENABLE ROW LEVEL SECURITY;
ALTER TABLE rgkb.validation_derivation_rule_version FORCE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE rgkb.validation_derivation_rule_version FROM PUBLIC;
REVOKE ALL ON TABLE rgkb.validation_derivation_rule_version FROM anon;
REVOKE ALL ON TABLE rgkb.validation_derivation_rule_version FROM authenticated;

DROP TRIGGER IF EXISTS validation_derivation_rule_version_write_guard ON rgkb.validation_derivation_rule_version;
CREATE TRIGGER validation_derivation_rule_version_write_guard
  BEFORE UPDATE OR DELETE ON rgkb.validation_derivation_rule_version
  FOR EACH ROW EXECUTE FUNCTION rgkb.governed_member_write_guard();

CREATE TABLE IF NOT EXISTS rgkb.validation_applicability_matrix (
  object_id   uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  domain_code text NOT NULL,
  CONSTRAINT validation_applicability_matrix_domain_code_key UNIQUE (domain_code)
);

COMMENT ON TABLE rgkb.validation_applicability_matrix IS 'Step 1 §2.2 Pattern A stable conceptual identity for the accepted catalog family validation_applicability_matrix. Not a governed_instance and never a governance-act target (§2.1, §11.1).';

ALTER TABLE rgkb.validation_applicability_matrix ENABLE ROW LEVEL SECURITY;
ALTER TABLE rgkb.validation_applicability_matrix FORCE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE rgkb.validation_applicability_matrix FROM PUBLIC;
REVOKE ALL ON TABLE rgkb.validation_applicability_matrix FROM anon;
REVOKE ALL ON TABLE rgkb.validation_applicability_matrix FROM authenticated;

DROP TRIGGER IF EXISTS validation_applicability_matrix_write_guard ON rgkb.validation_applicability_matrix;
CREATE TRIGGER validation_applicability_matrix_write_guard
  BEFORE UPDATE OR DELETE ON rgkb.validation_applicability_matrix
  FOR EACH ROW EXECUTE FUNCTION rgkb.stable_identity_write_guard();

DROP TRIGGER IF EXISTS validation_applicability_matrix_has_version_check ON rgkb.validation_applicability_matrix;
CREATE CONSTRAINT TRIGGER validation_applicability_matrix_has_version_check
  AFTER INSERT ON rgkb.validation_applicability_matrix
  DEFERRABLE INITIALLY DEFERRED
  FOR EACH ROW EXECUTE FUNCTION rgkb.stable_identity_has_version_check();

CREATE TABLE IF NOT EXISTS rgkb.validation_applicability_matrix_version (
  instance_id       uuid PRIMARY KEY,
  subject_type      text NOT NULL DEFAULT 'validation_applicability_matrix',
  object_id         uuid NOT NULL,
  version_sequence  integer NOT NULL,
  previous_sequence integer,
  CONSTRAINT validation_applicability_matrix_version_subject_type_fixed CHECK (subject_type = 'validation_applicability_matrix'),
  CONSTRAINT validation_applicability_matrix_version_monotonic CHECK (previous_sequence IS NULL OR version_sequence > previous_sequence),
  CONSTRAINT validation_applicability_matrix_version_instance_fk FOREIGN KEY (instance_id, subject_type)
    REFERENCES rgkb.governed_instance (instance_id, subject_type),
  CONSTRAINT validation_applicability_matrix_version_object_fk FOREIGN KEY (object_id)
    REFERENCES rgkb.validation_applicability_matrix (object_id),
  CONSTRAINT validation_applicability_matrix_version_sequence_unique UNIQUE (object_id, version_sequence),
  CONSTRAINT validation_applicability_matrix_version_previous_fk FOREIGN KEY (object_id, previous_sequence)
    REFERENCES rgkb.validation_applicability_matrix_version (object_id, version_sequence),
  CONSTRAINT validation_applicability_matrix_version_previous_unique UNIQUE (object_id, previous_sequence)
);

CREATE UNIQUE INDEX IF NOT EXISTS validation_applicability_matrix_version_first_unique
  ON rgkb.validation_applicability_matrix_version (object_id) WHERE previous_sequence IS NULL;

COMMENT ON TABLE rgkb.validation_applicability_matrix_version IS 'Step 1 §2.3 Pattern A governed version instance for the accepted catalog family validation_applicability_matrix. Its primary key is the registry instance_id (§3.2). version_sequence is ordering only and is never an identity, a governance-act target or a tie-break (§3.4, §9.4).';

COMMENT ON COLUMN rgkb.validation_applicability_matrix_version.previous_sequence IS 'Step 1 §2.3/§3.4 monotonicity structure: the version_sequence this version was authored after, within the same stable identity. NULL on the first version only. It carries authoring order and nothing else — no scientific, approval, validation, runtime, precedence or currency meaning, and it is never a governance-act target or a resolution tie-break.';

ALTER TABLE rgkb.validation_applicability_matrix_version ENABLE ROW LEVEL SECURITY;
ALTER TABLE rgkb.validation_applicability_matrix_version FORCE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE rgkb.validation_applicability_matrix_version FROM PUBLIC;
REVOKE ALL ON TABLE rgkb.validation_applicability_matrix_version FROM anon;
REVOKE ALL ON TABLE rgkb.validation_applicability_matrix_version FROM authenticated;

DROP TRIGGER IF EXISTS validation_applicability_matrix_version_write_guard ON rgkb.validation_applicability_matrix_version;
CREATE TRIGGER validation_applicability_matrix_version_write_guard
  BEFORE UPDATE OR DELETE ON rgkb.validation_applicability_matrix_version
  FOR EACH ROW EXECUTE FUNCTION rgkb.governed_member_write_guard();

CREATE TABLE IF NOT EXISTS rgkb.integrated_profile_architecture (
  object_id   uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  domain_code text NOT NULL,
  CONSTRAINT integrated_profile_architecture_domain_code_key UNIQUE (domain_code)
);

COMMENT ON TABLE rgkb.integrated_profile_architecture IS 'Step 1 §2.2 Pattern A stable conceptual identity for the accepted catalog family integrated_profile_architecture. Not a governed_instance and never a governance-act target (§2.1, §11.1).';

ALTER TABLE rgkb.integrated_profile_architecture ENABLE ROW LEVEL SECURITY;
ALTER TABLE rgkb.integrated_profile_architecture FORCE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE rgkb.integrated_profile_architecture FROM PUBLIC;
REVOKE ALL ON TABLE rgkb.integrated_profile_architecture FROM anon;
REVOKE ALL ON TABLE rgkb.integrated_profile_architecture FROM authenticated;

DROP TRIGGER IF EXISTS integrated_profile_architecture_write_guard ON rgkb.integrated_profile_architecture;
CREATE TRIGGER integrated_profile_architecture_write_guard
  BEFORE UPDATE OR DELETE ON rgkb.integrated_profile_architecture
  FOR EACH ROW EXECUTE FUNCTION rgkb.stable_identity_write_guard();

DROP TRIGGER IF EXISTS integrated_profile_architecture_has_version_check ON rgkb.integrated_profile_architecture;
CREATE CONSTRAINT TRIGGER integrated_profile_architecture_has_version_check
  AFTER INSERT ON rgkb.integrated_profile_architecture
  DEFERRABLE INITIALLY DEFERRED
  FOR EACH ROW EXECUTE FUNCTION rgkb.stable_identity_has_version_check();

CREATE TABLE IF NOT EXISTS rgkb.integrated_profile_architecture_version (
  instance_id       uuid PRIMARY KEY,
  subject_type      text NOT NULL DEFAULT 'integrated_profile_architecture',
  object_id         uuid NOT NULL,
  version_sequence  integer NOT NULL,
  previous_sequence integer,
  CONSTRAINT integrated_profile_architecture_version_subject_type_fixed CHECK (subject_type = 'integrated_profile_architecture'),
  CONSTRAINT integrated_profile_architecture_version_monotonic CHECK (previous_sequence IS NULL OR version_sequence > previous_sequence),
  CONSTRAINT integrated_profile_architecture_version_instance_fk FOREIGN KEY (instance_id, subject_type)
    REFERENCES rgkb.governed_instance (instance_id, subject_type),
  CONSTRAINT integrated_profile_architecture_version_object_fk FOREIGN KEY (object_id)
    REFERENCES rgkb.integrated_profile_architecture (object_id),
  CONSTRAINT integrated_profile_architecture_version_sequence_unique UNIQUE (object_id, version_sequence),
  CONSTRAINT integrated_profile_architecture_version_previous_fk FOREIGN KEY (object_id, previous_sequence)
    REFERENCES rgkb.integrated_profile_architecture_version (object_id, version_sequence),
  CONSTRAINT integrated_profile_architecture_version_previous_unique UNIQUE (object_id, previous_sequence)
);

CREATE UNIQUE INDEX IF NOT EXISTS integrated_profile_architecture_version_first_unique
  ON rgkb.integrated_profile_architecture_version (object_id) WHERE previous_sequence IS NULL;

COMMENT ON TABLE rgkb.integrated_profile_architecture_version IS 'Step 1 §2.3 Pattern A governed version instance for the accepted catalog family integrated_profile_architecture. Its primary key is the registry instance_id (§3.2). version_sequence is ordering only and is never an identity, a governance-act target or a tie-break (§3.4, §9.4).';

COMMENT ON COLUMN rgkb.integrated_profile_architecture_version.previous_sequence IS 'Step 1 §2.3/§3.4 monotonicity structure: the version_sequence this version was authored after, within the same stable identity. NULL on the first version only. It carries authoring order and nothing else — no scientific, approval, validation, runtime, precedence or currency meaning, and it is never a governance-act target or a resolution tie-break.';

ALTER TABLE rgkb.integrated_profile_architecture_version ENABLE ROW LEVEL SECURITY;
ALTER TABLE rgkb.integrated_profile_architecture_version FORCE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE rgkb.integrated_profile_architecture_version FROM PUBLIC;
REVOKE ALL ON TABLE rgkb.integrated_profile_architecture_version FROM anon;
REVOKE ALL ON TABLE rgkb.integrated_profile_architecture_version FROM authenticated;

DROP TRIGGER IF EXISTS integrated_profile_architecture_version_write_guard ON rgkb.integrated_profile_architecture_version;
CREATE TRIGGER integrated_profile_architecture_version_write_guard
  BEFORE UPDATE OR DELETE ON rgkb.integrated_profile_architecture_version
  FOR EACH ROW EXECUTE FUNCTION rgkb.governed_member_write_guard();

CREATE TABLE IF NOT EXISTS rgkb.instrument_scale (
  object_id   uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  domain_code text NOT NULL,
  CONSTRAINT instrument_scale_domain_code_key UNIQUE (domain_code)
);

COMMENT ON TABLE rgkb.instrument_scale IS 'Step 1 §2.2 Pattern A stable conceptual identity for the accepted catalog family instrument_scale. Not a governed_instance and never a governance-act target (§2.1, §11.1).';

ALTER TABLE rgkb.instrument_scale ENABLE ROW LEVEL SECURITY;
ALTER TABLE rgkb.instrument_scale FORCE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE rgkb.instrument_scale FROM PUBLIC;
REVOKE ALL ON TABLE rgkb.instrument_scale FROM anon;
REVOKE ALL ON TABLE rgkb.instrument_scale FROM authenticated;

DROP TRIGGER IF EXISTS instrument_scale_write_guard ON rgkb.instrument_scale;
CREATE TRIGGER instrument_scale_write_guard
  BEFORE UPDATE OR DELETE ON rgkb.instrument_scale
  FOR EACH ROW EXECUTE FUNCTION rgkb.stable_identity_write_guard();

DROP TRIGGER IF EXISTS instrument_scale_has_version_check ON rgkb.instrument_scale;
CREATE CONSTRAINT TRIGGER instrument_scale_has_version_check
  AFTER INSERT ON rgkb.instrument_scale
  DEFERRABLE INITIALLY DEFERRED
  FOR EACH ROW EXECUTE FUNCTION rgkb.stable_identity_has_version_check();

CREATE TABLE IF NOT EXISTS rgkb.instrument_scale_version (
  instance_id       uuid PRIMARY KEY,
  subject_type      text NOT NULL DEFAULT 'instrument_scale',
  object_id         uuid NOT NULL,
  version_sequence  integer NOT NULL,
  previous_sequence integer,
  CONSTRAINT instrument_scale_version_subject_type_fixed CHECK (subject_type = 'instrument_scale'),
  CONSTRAINT instrument_scale_version_monotonic CHECK (previous_sequence IS NULL OR version_sequence > previous_sequence),
  CONSTRAINT instrument_scale_version_instance_fk FOREIGN KEY (instance_id, subject_type)
    REFERENCES rgkb.governed_instance (instance_id, subject_type),
  CONSTRAINT instrument_scale_version_object_fk FOREIGN KEY (object_id)
    REFERENCES rgkb.instrument_scale (object_id),
  CONSTRAINT instrument_scale_version_sequence_unique UNIQUE (object_id, version_sequence),
  CONSTRAINT instrument_scale_version_previous_fk FOREIGN KEY (object_id, previous_sequence)
    REFERENCES rgkb.instrument_scale_version (object_id, version_sequence),
  CONSTRAINT instrument_scale_version_previous_unique UNIQUE (object_id, previous_sequence)
);

CREATE UNIQUE INDEX IF NOT EXISTS instrument_scale_version_first_unique
  ON rgkb.instrument_scale_version (object_id) WHERE previous_sequence IS NULL;

COMMENT ON TABLE rgkb.instrument_scale_version IS 'Step 1 §2.3 Pattern A governed version instance for the accepted catalog family instrument_scale. Its primary key is the registry instance_id (§3.2). version_sequence is ordering only and is never an identity, a governance-act target or a tie-break (§3.4, §9.4).';

COMMENT ON COLUMN rgkb.instrument_scale_version.previous_sequence IS 'Step 1 §2.3/§3.4 monotonicity structure: the version_sequence this version was authored after, within the same stable identity. NULL on the first version only. It carries authoring order and nothing else — no scientific, approval, validation, runtime, precedence or currency meaning, and it is never a governance-act target or a resolution tie-break.';

ALTER TABLE rgkb.instrument_scale_version ENABLE ROW LEVEL SECURITY;
ALTER TABLE rgkb.instrument_scale_version FORCE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE rgkb.instrument_scale_version FROM PUBLIC;
REVOKE ALL ON TABLE rgkb.instrument_scale_version FROM anon;
REVOKE ALL ON TABLE rgkb.instrument_scale_version FROM authenticated;

DROP TRIGGER IF EXISTS instrument_scale_version_write_guard ON rgkb.instrument_scale_version;
CREATE TRIGGER instrument_scale_version_write_guard
  BEFORE UPDATE OR DELETE ON rgkb.instrument_scale_version
  FOR EACH ROW EXECUTE FUNCTION rgkb.governed_member_write_guard();

-- -----------------------------------------------------------------------
-- 5) Concrete member substrate — 8 Pattern B families.
-- -----------------------------------------------------------------------
--
--    Step 1 §2.4: a Pattern B governed record is an atomic historical
--    assertion. The exact record identity IS the governed instance identity;
--    no artificial stable-identity/version pair is imposed so that a version
--    could be cited, and no second independently writable identity duplicates
--    instance_id (§2.4, §3.2).
--
--    Correction is append-only: a new record, never an in-place edit (§2.4,
--    §5.3). The write guard refuses UPDATE and DELETE, so the only correction
--    path is a new record.
--
--    No family-specific payload field is invented. The governed relationship
--    between a superseded record and its correcting record is itself governed
--    and belongs to later controlled specifications, not to WP02.

CREATE TABLE IF NOT EXISTS rgkb.evidence_anchor (
  instance_id  uuid PRIMARY KEY,
  subject_type text NOT NULL DEFAULT 'evidence_anchor',
  CONSTRAINT evidence_anchor_subject_type_fixed CHECK (subject_type = 'evidence_anchor'),
  CONSTRAINT evidence_anchor_instance_fk FOREIGN KEY (instance_id, subject_type)
    REFERENCES rgkb.governed_instance (instance_id, subject_type)
);

COMMENT ON TABLE rgkb.evidence_anchor IS 'Step 1 §2.4 Pattern B immutable append-only governed record for the accepted catalog family evidence_anchor. The exact record identity is the registry instance_id; no artificial stable-identity/version pair is imposed (§2.4).';

ALTER TABLE rgkb.evidence_anchor ENABLE ROW LEVEL SECURITY;
ALTER TABLE rgkb.evidence_anchor FORCE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE rgkb.evidence_anchor FROM PUBLIC;
REVOKE ALL ON TABLE rgkb.evidence_anchor FROM anon;
REVOKE ALL ON TABLE rgkb.evidence_anchor FROM authenticated;

DROP TRIGGER IF EXISTS evidence_anchor_write_guard ON rgkb.evidence_anchor;
CREATE TRIGGER evidence_anchor_write_guard
  BEFORE UPDATE OR DELETE ON rgkb.evidence_anchor
  FOR EACH ROW EXECUTE FUNCTION rgkb.governed_member_write_guard();

CREATE TABLE IF NOT EXISTS rgkb.knowledge_unit_relation (
  instance_id  uuid PRIMARY KEY,
  subject_type text NOT NULL DEFAULT 'knowledge_unit_relation',
  CONSTRAINT knowledge_unit_relation_subject_type_fixed CHECK (subject_type = 'knowledge_unit_relation'),
  CONSTRAINT knowledge_unit_relation_instance_fk FOREIGN KEY (instance_id, subject_type)
    REFERENCES rgkb.governed_instance (instance_id, subject_type)
);

COMMENT ON TABLE rgkb.knowledge_unit_relation IS 'Step 1 §2.4 Pattern B immutable append-only governed record for the accepted catalog family knowledge_unit_relation. The exact record identity is the registry instance_id; no artificial stable-identity/version pair is imposed (§2.4).';

ALTER TABLE rgkb.knowledge_unit_relation ENABLE ROW LEVEL SECURITY;
ALTER TABLE rgkb.knowledge_unit_relation FORCE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE rgkb.knowledge_unit_relation FROM PUBLIC;
REVOKE ALL ON TABLE rgkb.knowledge_unit_relation FROM anon;
REVOKE ALL ON TABLE rgkb.knowledge_unit_relation FROM authenticated;

DROP TRIGGER IF EXISTS knowledge_unit_relation_write_guard ON rgkb.knowledge_unit_relation;
CREATE TRIGGER knowledge_unit_relation_write_guard
  BEFORE UPDATE OR DELETE ON rgkb.knowledge_unit_relation
  FOR EACH ROW EXECUTE FUNCTION rgkb.governed_member_write_guard();

CREATE TABLE IF NOT EXISTS rgkb.review_decision_event (
  instance_id  uuid PRIMARY KEY,
  subject_type text NOT NULL DEFAULT 'review_decision_event',
  CONSTRAINT review_decision_event_subject_type_fixed CHECK (subject_type = 'review_decision_event'),
  CONSTRAINT review_decision_event_instance_fk FOREIGN KEY (instance_id, subject_type)
    REFERENCES rgkb.governed_instance (instance_id, subject_type)
);

COMMENT ON TABLE rgkb.review_decision_event IS 'Step 1 §2.4 Pattern B immutable append-only governed record for the accepted catalog family review_decision_event. The exact record identity is the registry instance_id; no artificial stable-identity/version pair is imposed (§2.4).';

ALTER TABLE rgkb.review_decision_event ENABLE ROW LEVEL SECURITY;
ALTER TABLE rgkb.review_decision_event FORCE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE rgkb.review_decision_event FROM PUBLIC;
REVOKE ALL ON TABLE rgkb.review_decision_event FROM anon;
REVOKE ALL ON TABLE rgkb.review_decision_event FROM authenticated;

DROP TRIGGER IF EXISTS review_decision_event_write_guard ON rgkb.review_decision_event;
CREATE TRIGGER review_decision_event_write_guard
  BEFORE UPDATE OR DELETE ON rgkb.review_decision_event
  FOR EACH ROW EXECUTE FUNCTION rgkb.governed_member_write_guard();

CREATE TABLE IF NOT EXISTS rgkb.governance_audit_event (
  instance_id  uuid PRIMARY KEY,
  subject_type text NOT NULL DEFAULT 'governance_audit_event',
  CONSTRAINT governance_audit_event_subject_type_fixed CHECK (subject_type = 'governance_audit_event'),
  CONSTRAINT governance_audit_event_instance_fk FOREIGN KEY (instance_id, subject_type)
    REFERENCES rgkb.governed_instance (instance_id, subject_type)
);

COMMENT ON TABLE rgkb.governance_audit_event IS 'Step 1 §2.4 Pattern B immutable append-only governed record for the accepted catalog family governance_audit_event. The exact record identity is the registry instance_id; no artificial stable-identity/version pair is imposed (§2.4).';

ALTER TABLE rgkb.governance_audit_event ENABLE ROW LEVEL SECURITY;
ALTER TABLE rgkb.governance_audit_event FORCE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE rgkb.governance_audit_event FROM PUBLIC;
REVOKE ALL ON TABLE rgkb.governance_audit_event FROM anon;
REVOKE ALL ON TABLE rgkb.governance_audit_event FROM authenticated;

DROP TRIGGER IF EXISTS governance_audit_event_write_guard ON rgkb.governance_audit_event;
CREATE TRIGGER governance_audit_event_write_guard
  BEFORE UPDATE OR DELETE ON rgkb.governance_audit_event
  FOR EACH ROW EXECUTE FUNCTION rgkb.governed_member_write_guard();

CREATE TABLE IF NOT EXISTS rgkb.governance_binding (
  instance_id  uuid PRIMARY KEY,
  subject_type text NOT NULL DEFAULT 'governance_binding',
  CONSTRAINT governance_binding_subject_type_fixed CHECK (subject_type = 'governance_binding'),
  CONSTRAINT governance_binding_instance_fk FOREIGN KEY (instance_id, subject_type)
    REFERENCES rgkb.governed_instance (instance_id, subject_type)
);

COMMENT ON TABLE rgkb.governance_binding IS 'Step 1 §2.4 Pattern B immutable append-only governed record for the accepted catalog family governance_binding. The exact record identity is the registry instance_id; no artificial stable-identity/version pair is imposed (§2.4).';

ALTER TABLE rgkb.governance_binding ENABLE ROW LEVEL SECURITY;
ALTER TABLE rgkb.governance_binding FORCE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE rgkb.governance_binding FROM PUBLIC;
REVOKE ALL ON TABLE rgkb.governance_binding FROM anon;
REVOKE ALL ON TABLE rgkb.governance_binding FROM authenticated;

DROP TRIGGER IF EXISTS governance_binding_write_guard ON rgkb.governance_binding;
CREATE TRIGGER governance_binding_write_guard
  BEFORE UPDATE OR DELETE ON rgkb.governance_binding
  FOR EACH ROW EXECUTE FUNCTION rgkb.governed_member_write_guard();

CREATE TABLE IF NOT EXISTS rgkb.rights_document_anchor (
  instance_id  uuid PRIMARY KEY,
  subject_type text NOT NULL DEFAULT 'rights_document_anchor',
  CONSTRAINT rights_document_anchor_subject_type_fixed CHECK (subject_type = 'rights_document_anchor'),
  CONSTRAINT rights_document_anchor_instance_fk FOREIGN KEY (instance_id, subject_type)
    REFERENCES rgkb.governed_instance (instance_id, subject_type)
);

COMMENT ON TABLE rgkb.rights_document_anchor IS 'Step 1 §2.4 Pattern B immutable append-only governed record for the accepted catalog family rights_document_anchor. The exact record identity is the registry instance_id; no artificial stable-identity/version pair is imposed (§2.4).';

ALTER TABLE rgkb.rights_document_anchor ENABLE ROW LEVEL SECURITY;
ALTER TABLE rgkb.rights_document_anchor FORCE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE rgkb.rights_document_anchor FROM PUBLIC;
REVOKE ALL ON TABLE rgkb.rights_document_anchor FROM anon;
REVOKE ALL ON TABLE rgkb.rights_document_anchor FROM authenticated;

DROP TRIGGER IF EXISTS rights_document_anchor_write_guard ON rgkb.rights_document_anchor;
CREATE TRIGGER rights_document_anchor_write_guard
  BEFORE UPDATE OR DELETE ON rgkb.rights_document_anchor
  FOR EACH ROW EXECUTE FUNCTION rgkb.governed_member_write_guard();

CREATE TABLE IF NOT EXISTS rgkb.typed_evidence_link (
  instance_id  uuid PRIMARY KEY,
  subject_type text NOT NULL DEFAULT 'typed_evidence_link',
  CONSTRAINT typed_evidence_link_subject_type_fixed CHECK (subject_type = 'typed_evidence_link'),
  CONSTRAINT typed_evidence_link_instance_fk FOREIGN KEY (instance_id, subject_type)
    REFERENCES rgkb.governed_instance (instance_id, subject_type)
);

COMMENT ON TABLE rgkb.typed_evidence_link IS 'Step 1 §2.4 Pattern B immutable append-only governed record for the accepted catalog family typed_evidence_link. The exact record identity is the registry instance_id; no artificial stable-identity/version pair is imposed (§2.4).';

ALTER TABLE rgkb.typed_evidence_link ENABLE ROW LEVEL SECURITY;
ALTER TABLE rgkb.typed_evidence_link FORCE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE rgkb.typed_evidence_link FROM PUBLIC;
REVOKE ALL ON TABLE rgkb.typed_evidence_link FROM anon;
REVOKE ALL ON TABLE rgkb.typed_evidence_link FROM authenticated;

DROP TRIGGER IF EXISTS typed_evidence_link_write_guard ON rgkb.typed_evidence_link;
CREATE TRIGGER typed_evidence_link_write_guard
  BEFORE UPDATE OR DELETE ON rgkb.typed_evidence_link
  FOR EACH ROW EXECUTE FUNCTION rgkb.governed_member_write_guard();

CREATE TABLE IF NOT EXISTS rgkb.derivation_record (
  instance_id  uuid PRIMARY KEY,
  subject_type text NOT NULL DEFAULT 'derivation_record',
  CONSTRAINT derivation_record_subject_type_fixed CHECK (subject_type = 'derivation_record'),
  CONSTRAINT derivation_record_instance_fk FOREIGN KEY (instance_id, subject_type)
    REFERENCES rgkb.governed_instance (instance_id, subject_type)
);

COMMENT ON TABLE rgkb.derivation_record IS 'Step 1 §2.4 Pattern B immutable append-only governed record for the accepted catalog family derivation_record. The exact record identity is the registry instance_id; no artificial stable-identity/version pair is imposed (§2.4).';

ALTER TABLE rgkb.derivation_record ENABLE ROW LEVEL SECURITY;
ALTER TABLE rgkb.derivation_record FORCE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE rgkb.derivation_record FROM PUBLIC;
REVOKE ALL ON TABLE rgkb.derivation_record FROM anon;
REVOKE ALL ON TABLE rgkb.derivation_record FROM authenticated;

DROP TRIGGER IF EXISTS derivation_record_write_guard ON rgkb.derivation_record;
CREATE TRIGGER derivation_record_write_guard
  BEFORE UPDATE OR DELETE ON rgkb.derivation_record
  FOR EACH ROW EXECUTE FUNCTION rgkb.governed_member_write_guard();

-- -----------------------------------------------------------------------
-- 6) Atomic registry / concrete-instance creation.
-- -----------------------------------------------------------------------
--
--    Step 1 §11.5: the registry entry and the concrete governed instance MUST
--    come into existence together. Neither may exist without the other.
--
--    Tier 1 satisfied this by refusing every registry INSERT (RG010), because
--    no concrete family existed and every row would have been an orphan. That
--    premise no longer holds: the 19 accepted families now exist. RG010 is
--    therefore superseded here — this is the exact and only reason the Tier 1
--    registry INSERT block is replaced. RG011 (no identity transfer) and RG012
--    (no removal) are preserved unchanged.
--
--    The replacement is structural, in two halves:
--
--    a) NO CONCRETE INSTANCE WITHOUT ITS REGISTRY ROW — immediate, by the
--       composite foreign key every member table carries into
--       rgkb.governed_instance (instance_id, subject_type). Because
--       instance_id is the registry primary key, that key also makes it
--       STRUCTURALLY IMPOSSIBLE for one instance_id to appear in two family
--       tables, and forces the concrete family to agree with the registry's
--       subject_type — and therefore, through §2's catalog foreign key, with
--       its pattern. No unconstrained subject_type + subject_id polymorphism
--       is introduced anywhere (§11.3).
--
--    b) NO ORPHAN REGISTRY ROW — a DEFERRABLE INITIALLY DEFERRED constraint
--       trigger evaluated at COMMIT. It requires exactly one member row for
--       the registry row, in the member table its own subject_type and pattern
--       determine.
--
--       STATEMENT ORDER. The member table's foreign key into the registry is
--       IMMEDIATE, so within the transaction the registry row is written
--       first and the member row second. Deferral does not make the order
--       arbitrary; it makes the ORPHAN TEST happen at commit rather than at
--       the registry INSERT, which is what allows the two writes to be
--       separate statements of one transaction at all. Step 1 §11.5 requires
--       the two to come into existence in the same committed transaction, not
--       in an arbitrary statement order, so this satisfies it. The immediate
--       member->registry key is deliberately NOT weakened to make a broader
--       claim true.
--
--    This deliberately does NOT expose a general registry INSERT path. A bare
--    registry INSERT is accepted by the statement and then REFUSED at commit,
--    so the only transaction that can succeed is one that creates both halves.
--
--    FAIL-CLOSED NOTE. The check reads the member table. Under FORCE ROW LEVEL
--    SECURITY with zero policies, a caller that cannot see the member row
--    cannot establish the invariant, and creation is refused. That is the
--    correct direction and is intended: while no access model is authorized,
--    an unprovable invariant must fail closed, never open.

CREATE OR REPLACE FUNCTION rgkb.governed_instance_write_guard()
RETURNS trigger
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $$
BEGIN
  IF TG_OP = 'UPDATE' THEN
    RAISE EXCEPTION 'RGKB Step 1 §3.2 fail closed: instance_id must not be reused, reallocated or transferred, and subject_type must not change after allocation; a registry row is not updatable.' USING ERRCODE = 'RG011';
  ELSE
    RAISE EXCEPTION 'RGKB Step 1 §5.3 fail closed: a governed instance must remain resolvable indefinitely; a registry entry must not be removed.' USING ERRCODE = 'RG012';
  END IF;
END;
$$;

COMMENT ON FUNCTION rgkb.governed_instance_write_guard() IS 'PRM-WP02 Tier 2 registry write guard. Supersedes the Tier 1 form: INSERT is no longer blocked outright because concrete governed families now exist, and atomicity is enforced by the deferred membership constraint instead. UPDATE (§3.2) and DELETE (§5.3) remain refused.';

DROP TRIGGER IF EXISTS governed_instance_write_guard ON rgkb.governed_instance;
CREATE TRIGGER governed_instance_write_guard
  BEFORE UPDATE OR DELETE ON rgkb.governed_instance
  FOR EACH ROW EXECUTE FUNCTION rgkb.governed_instance_write_guard();

DROP TRIGGER IF EXISTS governed_instance_pattern_derivation ON rgkb.governed_instance;
CREATE TRIGGER governed_instance_pattern_derivation
  BEFORE INSERT ON rgkb.governed_instance
  FOR EACH ROW EXECUTE FUNCTION rgkb.governed_instance_pattern_derivation();

CREATE OR REPLACE FUNCTION rgkb.governed_instance_membership_check()
RETURNS trigger
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $$
DECLARE
  v_member_table text;
  v_member_count integer;
BEGIN
  IF NEW.pattern = 'A' THEN
    v_member_table := NEW.subject_type || '_version';
  ELSE
    v_member_table := NEW.subject_type;
  END IF;

  EXECUTE format('SELECT count(*) FROM rgkb.%I WHERE instance_id = $1', v_member_table)
    INTO v_member_count
    USING NEW.instance_id;

  IF v_member_count <> 1 THEN
    RAISE EXCEPTION 'RGKB Step 1 §11.5 fail closed: the registry entry and its concrete governed instance must come into existence together. Expected exactly one concrete member for this instance_id in its governed family, found %.', v_member_count USING ERRCODE = 'RG060';
  END IF;

  RETURN NULL;
END;
$$;

COMMENT ON FUNCTION rgkb.governed_instance_membership_check() IS 'PRM-WP02 Tier 2 deferred atomicity check (Step 1 §11.5). Evaluated at COMMIT: a registry row without exactly one concrete member in the family its subject_type and pattern determine is refused, so a bare registry INSERT can never stand on its own.';

DROP TRIGGER IF EXISTS governed_instance_membership_check ON rgkb.governed_instance;
CREATE CONSTRAINT TRIGGER governed_instance_membership_check
  AFTER INSERT ON rgkb.governed_instance
  DEFERRABLE INITIALLY DEFERRED
  FOR EACH ROW EXECUTE FUNCTION rgkb.governed_instance_membership_check();

-- -----------------------------------------------------------------------
-- 7) Containment for the functions added here.
-- -----------------------------------------------------------------------
REVOKE ALL ON FUNCTION rgkb.subject_type_catalog_frozen_guard() FROM PUBLIC;
REVOKE ALL ON FUNCTION rgkb.subject_type_catalog_frozen_guard() FROM anon;
REVOKE ALL ON FUNCTION rgkb.subject_type_catalog_frozen_guard() FROM authenticated;
REVOKE ALL ON FUNCTION rgkb.stable_identity_write_guard() FROM PUBLIC;
REVOKE ALL ON FUNCTION rgkb.stable_identity_write_guard() FROM anon;
REVOKE ALL ON FUNCTION rgkb.stable_identity_write_guard() FROM authenticated;
REVOKE ALL ON FUNCTION rgkb.governed_member_write_guard() FROM PUBLIC;
REVOKE ALL ON FUNCTION rgkb.governed_member_write_guard() FROM anon;
REVOKE ALL ON FUNCTION rgkb.governed_member_write_guard() FROM authenticated;
REVOKE ALL ON FUNCTION rgkb.governed_instance_membership_check() FROM PUBLIC;
REVOKE ALL ON FUNCTION rgkb.governed_instance_membership_check() FROM anon;
REVOKE ALL ON FUNCTION rgkb.governed_instance_membership_check() FROM authenticated;
REVOKE ALL ON FUNCTION rgkb.stable_identity_has_version_check() FROM PUBLIC;
REVOKE ALL ON FUNCTION rgkb.stable_identity_has_version_check() FROM anon;
REVOKE ALL ON FUNCTION rgkb.stable_identity_has_version_check() FROM authenticated;
REVOKE ALL ON FUNCTION rgkb.governed_instance_pattern_derivation() FROM PUBLIC;
REVOKE ALL ON FUNCTION rgkb.governed_instance_pattern_derivation() FROM anon;
REVOKE ALL ON FUNCTION rgkb.governed_instance_pattern_derivation() FROM authenticated;

-- =========================================================================
-- Rollback (additive-only; drops nothing that existed before this migration,
-- except that it would leave the Tier 1 guards superseded — restore them from
-- the Tier 1 migration if this is ever reverted):
--   DROP TABLE IF EXISTS rgkb.knowledge_unit_version;
--   DROP TABLE IF EXISTS rgkb.knowledge_unit;
--   DROP TABLE IF EXISTS rgkb.guardrail_version;
--   DROP TABLE IF EXISTS rgkb.guardrail;
--   DROP TABLE IF EXISTS rgkb.interpretation_rule_version;
--   DROP TABLE IF EXISTS rgkb.interpretation_rule;
--   DROP TABLE IF EXISTS rgkb.construct_definition_version;
--   DROP TABLE IF EXISTS rgkb.construct_definition;
--   DROP TABLE IF EXISTS rgkb.rights_decision_version;
--   DROP TABLE IF EXISTS rgkb.rights_decision;
--   DROP TABLE IF EXISTS rgkb.instrument_version;
--   DROP TABLE IF EXISTS rgkb.instrument;
--   DROP TABLE IF EXISTS rgkb.localized_governed_text_version;
--   DROP TABLE IF EXISTS rgkb.localized_governed_text;
--   DROP TABLE IF EXISTS rgkb.validation_derivation_rule_version;
--   DROP TABLE IF EXISTS rgkb.validation_derivation_rule;
--   DROP TABLE IF EXISTS rgkb.validation_applicability_matrix_version;
--   DROP TABLE IF EXISTS rgkb.validation_applicability_matrix;
--   DROP TABLE IF EXISTS rgkb.integrated_profile_architecture_version;
--   DROP TABLE IF EXISTS rgkb.integrated_profile_architecture;
--   DROP TABLE IF EXISTS rgkb.instrument_scale_version;
--   DROP TABLE IF EXISTS rgkb.instrument_scale;
--   DROP TABLE IF EXISTS rgkb.evidence_anchor;
--   DROP TABLE IF EXISTS rgkb.knowledge_unit_relation;
--   DROP TABLE IF EXISTS rgkb.review_decision_event;
--   DROP TABLE IF EXISTS rgkb.governance_audit_event;
--   DROP TABLE IF EXISTS rgkb.governance_binding;
--   DROP TABLE IF EXISTS rgkb.rights_document_anchor;
--   DROP TABLE IF EXISTS rgkb.typed_evidence_link;
--   DROP TABLE IF EXISTS rgkb.derivation_record;
--   DROP FUNCTION IF EXISTS rgkb.governed_instance_pattern_derivation();
--   DROP FUNCTION IF EXISTS rgkb.stable_identity_has_version_check();
--   DROP FUNCTION IF EXISTS rgkb.governed_instance_membership_check();
--   DROP FUNCTION IF EXISTS rgkb.governed_member_write_guard();
--   DROP FUNCTION IF EXISTS rgkb.stable_identity_write_guard();
--   DROP FUNCTION IF EXISTS rgkb.subject_type_catalog_frozen_guard();
--   ALTER TABLE rgkb.governed_instance DROP CONSTRAINT governed_instance_instance_subject_key;
--   ALTER TABLE rgkb.governed_instance DROP CONSTRAINT governed_instance_pattern_derives_from_catalog;
--   ALTER TABLE rgkb.governed_instance DROP COLUMN pattern, DROP COLUMN subject_type;
--   ALTER TABLE rgkb.subject_type_catalog DROP CONSTRAINT subject_type_catalog_type_pattern_key;
--   DELETE FROM rgkb.subject_type_catalog;
-- No table, column, policy, grant, function or row outside the rgkb schema is
-- touched by this migration.
-- =========================================================================
