-- =========================================================================
-- RGKB PRM-WP02 — TIER 1 governed-object / version runtime substrate.
-- =========================================================================
-- Controlling sources (normative, not paraphrased here):
--   * RGKB Controlled Schema Specification Step 1 — Governed Object /
--     Versioning / Referential / Lifecycle Substrate v0.1
--     (docs/rgkb/04-canonical-knowledge-database/)
--   * PRM-WP02 Governed Object / Version Runtime Architecture Proposal v0.1
--     (docs/rgkb/remediation/), §5.1 "Tier 1 — catalog-independent"
--   * Pilot Readiness Remediation Master Plan v0.1, PRM-WP02
--
-- SCOPE: Tier 1 ONLY — the catalog-INDEPENDENT substrate. Tier 2 (WP02 §5.2)
-- is structurally BLOCKED pending a separately accepted controlled
-- subject-type catalog specification, and nothing below implements, seeds, or
-- prepares a workaround for it.
--
-- Deliberately NOT implemented here (Tier 2 / OPEN findings):
--   * governed_instance.subject_type, governed_instance.pattern  (WP02 §5.2.1)
--   * any concrete Pattern A version table / Pattern B record table (§5.2.2)
--   * object_id, domain_code, version_sequence                    (§5.2.3)
--   * any subject-type catalog membership                (Step 1 §2.5, §14.5)
--   * F-04 dependency re-binding workflow — remains OPEN     (Step 1 §14.1)
--   * F-07 applicability inputs — remains OPEN         (Step 1 §9.3, §14.1)
--   * any RLS/auth ACCESS MODEL for this substrate (WP02 §13; CLAUDE.md §3 —
--     that is separate L2 work requiring its own Owner gate)
--
-- WHY A DEDICATED, NON-EXPOSED SCHEMA (containment, not an access model):
-- Supabase exposes the `public` schema through PostgREST, and Supabase's
-- default privileges hand new `public` tables to `anon`/`authenticated`.
-- This substrate has NO authorized access model yet, so it must not be
-- reachable by any client. `rgkb` is not in the API-exposed schema list, and
-- the REVOKEs + RLS below are defence in depth. Enabling RLS with ZERO
-- policies is a deny-all containment posture; it deliberately expresses no
-- opinion about who may eventually read or write this substrate.
--
-- NO ROWS ARE INSERTED BY THIS MIGRATION. Both tables are created empty and
-- are held empty by explicit fail-closed write guards (see notes at each
-- guard). No production or runtime data is created, required, or authorized.
--
-- STYLE NOTE: every string literal below is written on a single line, matching
-- the existing migrations. Newline-continued literals are not used anywhere in
-- this repository and could not be verified locally (no database is available
-- to this change, and remote/production execution is not authorized).
-- =========================================================================

-- -------------------------------------------------------------------------
-- 1) Containment schema.
-- -------------------------------------------------------------------------
CREATE SCHEMA IF NOT EXISTS rgkb;

COMMENT ON SCHEMA rgkb IS 'RGKB canonical knowledge substrate (PRM-WP02 Tier 1). Not API-exposed. No access model is authorized yet; contents are non-operational.';

REVOKE ALL ON SCHEMA rgkb FROM PUBLIC;
REVOKE ALL ON SCHEMA rgkb FROM anon;
REVOKE ALL ON SCHEMA rgkb FROM authenticated;

-- -------------------------------------------------------------------------
-- 2) governed_instance — the exact-instance identity registry.
--    Step 1 §2.1 (registry), §3.2 (governed instance identity).
--
--    Logical attributes deliberately reduced to `instance_id` alone:
--      * `subject_type` / `pattern` are Tier 2 (WP02 §5.2.1) — `subject_type`
--        has nothing real to reference and `pattern`'s derivation rule has
--        nothing to derive from while the catalog is empty.
--      * Step 1 §2.1 forbids storing lifecycle, approval, validation,
--        runtime, retirement, readiness, or any master-status field here.
--      * No `created_at` is stored: Step 1 §9.4 prohibits recency ordering as
--        a tie-break, and this table must not offer one.
--
--    Step 1 §4 requires each registry row to carry exactly one `subject_type`
--    value. That column is Tier 2, so the invariant is honoured the only
--    truthful way available now: the registry holds NO rows at all (§4 guard
--    below), rather than admitting rows that would violate it.
-- -------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS rgkb.governed_instance (
  instance_id uuid PRIMARY KEY DEFAULT gen_random_uuid()
);

COMMENT ON TABLE rgkb.governed_instance IS 'Step 1 §2.1 exact-instance identity registry (PRM-WP02 Tier 1 substrate). Carries no lifecycle, approval, validation, runtime, retirement, readiness or master-status field (Step 1 §2.1). Membership is NOT immutability, NOT governance eligibility and NOT lifecycle state. Non-operational at Tier 1.';

COMMENT ON COLUMN rgkb.governed_instance.instance_id IS 'Step 1 §2.1/§3.2: opaque, registry-allocated exact governed instance identity. Carries no scientific, semantic or governance meaning; no meaning may be inferred from its ordering or value. Allocated at creation of the concrete governed instance (§11.5); never reused, reallocated or transferred (§3.2).';

ALTER TABLE rgkb.governed_instance ENABLE ROW LEVEL SECURITY;
ALTER TABLE rgkb.governed_instance FORCE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE rgkb.governed_instance FROM PUBLIC;
REVOKE ALL ON TABLE rgkb.governed_instance FROM anon;
REVOKE ALL ON TABLE rgkb.governed_instance FROM authenticated;

-- -------------------------------------------------------------------------
-- 3) subject_type_catalog — the catalog SUBSTRATE SHAPE only.
--    Step 1 §2.5 (subject-type catalog), WP02 §5.1.2.
--
--    Step 1 §2.1 requires the catalog to answer exactly one question per
--    subject type: is this family Pattern A or Pattern B? The minimum shape
--    satisfying that is `subject_type` -> `pattern`, with the pattern
--    vocabulary structurally limited to A / B.
--
--    MEMBERSHIP IS NOT CREATED HERE. Step 1 §14.5 defers the concrete
--    membership of the catalog to a later controlled specification, and
--    §2.5 makes admission of a family whose pattern assignment is not fixed
--    by a controlling source a governance/schema fault that MUST FAIL CLOSED.
--    No such controlled specification exists, so every possible admission
--    today is an unresolved-family admission. The guard in §5 enforces that.
-- -------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS rgkb.subject_type_catalog (
  subject_type text PRIMARY KEY,
  pattern      text NOT NULL,
  CONSTRAINT subject_type_catalog_pattern_is_a_or_b
    CHECK (pattern IN ('A', 'B'))
);

COMMENT ON TABLE rgkb.subject_type_catalog IS 'Step 1 §2.5 controlled subject-type catalog SUBSTRATE SHAPE (PRM-WP02 Tier 1). Intentionally EMPTY: concrete membership is deferred by Step 1 §14.5 to a later controlled specification. Catalog membership is not eligibility (§2.5).';

COMMENT ON COLUMN rgkb.subject_type_catalog.subject_type IS 'Step 1 §2.5: the governed subject family identifier. No family is admitted by this migration.';

COMMENT ON COLUMN rgkb.subject_type_catalog.pattern IS 'Step 1 §2.5/§4: the family''s single fixed Pattern A or Pattern B assignment, and the sole authority for the DERIVED pattern classification of §2.1. Vocabulary is structurally limited to A / B.';

ALTER TABLE rgkb.subject_type_catalog ENABLE ROW LEVEL SECURITY;
ALTER TABLE rgkb.subject_type_catalog FORCE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE rgkb.subject_type_catalog FROM PUBLIC;
REVOKE ALL ON TABLE rgkb.subject_type_catalog FROM anon;
REVOKE ALL ON TABLE rgkb.subject_type_catalog FROM authenticated;

-- -------------------------------------------------------------------------
-- 4) Registry write guard — fail closed, Tier 1.
--
--    Step 1 §11.5 requires the registry entry and the concrete governed
--    instance to come into existence TOGETHER: "a registry entry MUST NOT
--    exist without its concrete governed instance."
--
--    At Tier 1 there is NO concrete governed member table at all (Tier 2 is
--    blocked), so every row insertable today would necessarily be an orphan
--    registry entry — i.e. a direct violation of §11.5. The honest Tier 1
--    realization is therefore to hold the registry structurally
--    non-operational rather than to weaken the atomicity invariant or to
--    pretend it is satisfied. The Tier 2 migration that introduces the first
--    concrete governed family is where this guard is replaced by real atomic
--    creation enforcement, under its own authorization.
--
--    UPDATE is refused because `instance_id` must never be reused,
--    reallocated or transferred (§3.2, §11.2).
--    DELETE is refused because a governed instance must remain resolvable
--    indefinitely and a registry entry must not be removed (§5.3).
-- -------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION rgkb.governed_instance_write_guard()
RETURNS trigger
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    RAISE EXCEPTION 'RGKB Step 1 §11.5 fail closed: a governed_instance registry entry cannot be created without its concrete governed instance, and no concrete governed family exists at PRM-WP02 Tier 1 (Tier 2 BLOCKED pending the controlled subject-type catalog specification).' USING ERRCODE = 'RG010';
  ELSIF TG_OP = 'UPDATE' THEN
    RAISE EXCEPTION 'RGKB Step 1 §3.2 fail closed: instance_id must not be reused, reallocated or transferred; a registry row is not updatable.' USING ERRCODE = 'RG011';
  ELSE
    RAISE EXCEPTION 'RGKB Step 1 §5.3 fail closed: a governed instance must remain resolvable indefinitely; a registry entry must not be removed.' USING ERRCODE = 'RG012';
  END IF;
END;
$$;

COMMENT ON FUNCTION rgkb.governed_instance_write_guard() IS 'PRM-WP02 Tier 1 fail-closed write guard for rgkb.governed_instance (Step 1 §11.5 atomic creation, §3.2 identity non-transfer, §5.3 non-deletion). Replaced by real atomic-creation enforcement when Tier 2 introduces the first concrete governed family, under separate authorization.';

DROP TRIGGER IF EXISTS governed_instance_write_guard ON rgkb.governed_instance;
CREATE TRIGGER governed_instance_write_guard
  BEFORE INSERT OR UPDATE OR DELETE ON rgkb.governed_instance
  FOR EACH ROW EXECUTE FUNCTION rgkb.governed_instance_write_guard();

-- -------------------------------------------------------------------------
-- 5) Catalog write guard — fail closed, Tier 1.
--
--    Step 1 §2.5: "A family whose pattern assignment is not fixed [by the
--    controlling coverage assignment] MUST NOT be admitted to the catalog
--    until that assignment is fixed by a controlled specification. Admission
--    of an unresolved family is a governance/schema fault and MUST FAIL
--    CLOSED." No controlled catalog specification exists, so every admission
--    available today is an unresolved-family admission.
--
--    UPDATE is refused because §2.5 change control forbids reclassification
--    in place: it requires explicit owner adjudication and a new controlled
--    specification version.
-- -------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION rgkb.subject_type_catalog_write_guard()
RETURNS trigger
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $$
BEGIN
  IF TG_OP = 'UPDATE' THEN
    RAISE EXCEPTION 'RGKB Step 1 §2.5 fail closed: a family Pattern A/B assignment must not be reclassified in place; that requires explicit owner adjudication and a new controlled specification version.' USING ERRCODE = 'RG021';
  ELSIF TG_OP = 'INSERT' THEN
    RAISE EXCEPTION 'RGKB Step 1 §2.5 fail closed: no controlled subject-type catalog specification exists, so every admission is an unresolved-family admission, which is a governance/schema fault. PRM-WP02 Tier 2 remains BLOCKED.' USING ERRCODE = 'RG020';
  ELSE
    RAISE EXCEPTION 'RGKB Step 1 §2.5 fail closed: catalog membership is controlled; removal requires a controlled specification version.' USING ERRCODE = 'RG022';
  END IF;
END;
$$;

COMMENT ON FUNCTION rgkb.subject_type_catalog_write_guard() IS 'PRM-WP02 Tier 1 fail-closed write guard for rgkb.subject_type_catalog (Step 1 §2.5 admission control and change control). Keeps the catalog substrate provably empty until a controlled catalog specification exists.';

DROP TRIGGER IF EXISTS subject_type_catalog_write_guard ON rgkb.subject_type_catalog;
CREATE TRIGGER subject_type_catalog_write_guard
  BEFORE INSERT OR UPDATE OR DELETE ON rgkb.subject_type_catalog
  FOR EACH ROW EXECUTE FUNCTION rgkb.subject_type_catalog_write_guard();

-- -------------------------------------------------------------------------
-- 6) Current-version resolution SKELETON — derived, never stored.
--    Step 1 §9 (contract/skeleton only), §10.1–§10.3; WP02 §5.1.3, §8.
--
--    This is a FUNCTION, not a column: Step 1 §9.2 requires runtime
--    resolvability to be a DERIVED conjunctive predicate and forbids a stored
--    authoritative boolean or any independently settable representation. No
--    `is_current` (or equivalent master-state) column exists anywhere in this
--    migration, by construction.
--
--    Every path fails closed at Tier 1, with a distinct governance reason:
--
--      RG001  zero eligible versions          (§10.1) — absence of an eligible
--             version is not permission and is never an implicit selection of
--             any other version.
--      RG002  more than one eligible version  (§10.2, §9.4) — a governance
--             fault, raised, never silently tie-broken. NO recency, priority,
--             ordering or version_sequence heuristic is applied; candidates
--             are deliberately NOT de-duplicated, because normalizing a
--             candidate set down to one is itself a form of silent selection.
--      RG003  exactly one candidate           (§9.3, §10.3) — still not
--             resolvable, because the predicate's applicability inputs
--             (developmental/grade scope F-10; validation applicability F-13;
--             rights-permitted-act semantics; resolution-scope vocabulary)
--             are unspecified. Until a controlled specification fixes them
--             the predicate MUST NOT be treated as evaluable for a
--             consequential path. F-07 REMAINS OPEN; this function does not
--             close it and must not be read as closing it.
--
--    The cardinality check runs FIRST because §9.4 fixes the cardinality rule
--    "independently of the pending applicability inputs" — a multiple-eligible
--    governance fault must surface as such, not be masked by RG003.
--
--    The function has no RETURN statement: at Tier 1 there is no condition
--    under which a resolved instance may be handed back, and returning NULL
--    would risk being read as "nothing blocks you".
--
--    Governance-event routing for the §10.2 fault is DEFERRED. No audit/event
--    schema or semantics is invented here; the fault surfaces as an explicit
--    database exception, which a later, separately authorized package may
--    route once a governed event shape exists (Step 1 §8.3, §11.4).
-- -------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION rgkb.resolve_current_version(
  p_candidate_instance_ids uuid[]
)
RETURNS uuid
LANGUAGE plpgsql
STABLE
SECURITY INVOKER
SET search_path = ''
AS $$
DECLARE
  v_candidate_count integer;
BEGIN
  v_candidate_count := coalesce(array_length(p_candidate_instance_ids, 1), 0);

  IF v_candidate_count = 0 THEN
    RAISE EXCEPTION 'RGKB Step 1 §10.1 fail closed: zero eligible versions. Absence of an eligible version is not permission and is not an implicit selection of any other version.' USING ERRCODE = 'RG001';
  END IF;

  IF v_candidate_count > 1 THEN
    RAISE EXCEPTION 'RGKB Step 1 §10.2 governance fault, fail closed: % eligible versions. No recency, priority, ordering or version_sequence tie-break is authorized (§9.4).', v_candidate_count USING ERRCODE = 'RG002';
  END IF;

  RAISE EXCEPTION 'RGKB Step 1 §9.3/§10.3 fail closed: the current-version resolution predicate is not evaluable. Its applicability inputs are unspecified (F-10 developmental/grade scope; F-13 validation applicability; rights-permitted-act semantics; resolution-scope vocabulary). F-07 remains OPEN.' USING ERRCODE = 'RG003';
END;
$$;

COMMENT ON FUNCTION rgkb.resolve_current_version(uuid[]) IS 'Step 1 §9 current-version resolution CONTRACT/SKELETON (PRM-WP02 Tier 1). Derived, never stored (§9.2). Fails closed on zero eligible (§10.1), on multiple eligible as a governance fault with no tie-break (§10.2/§9.4), and on the not-yet-evaluable predicate (§9.3/§10.3). Does NOT close F-07.';

REVOKE ALL ON FUNCTION rgkb.resolve_current_version(uuid[]) FROM PUBLIC;
REVOKE ALL ON FUNCTION rgkb.resolve_current_version(uuid[]) FROM anon;
REVOKE ALL ON FUNCTION rgkb.resolve_current_version(uuid[]) FROM authenticated;

-- =========================================================================
-- Rollback (additive-only migration; drops nothing pre-existing):
--   DROP FUNCTION IF EXISTS rgkb.resolve_current_version(uuid[]);
--   DROP TRIGGER IF EXISTS subject_type_catalog_write_guard ON rgkb.subject_type_catalog;
--   DROP FUNCTION IF EXISTS rgkb.subject_type_catalog_write_guard();
--   DROP TRIGGER IF EXISTS governed_instance_write_guard ON rgkb.governed_instance;
--   DROP FUNCTION IF EXISTS rgkb.governed_instance_write_guard();
--   DROP TABLE IF EXISTS rgkb.subject_type_catalog;
--   DROP TABLE IF EXISTS rgkb.governed_instance;
--   DROP SCHEMA IF EXISTS rgkb;
-- No existing table, column, policy, grant, function or row is modified by
-- this migration, so rollback cannot affect any pre-existing behaviour.
-- =========================================================================
