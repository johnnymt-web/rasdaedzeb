import { describe, it, expect } from "vitest";
import { readFileSync, readdirSync } from "node:fs";
import { resolve } from "node:path";

// PRM-WP03 Evidence & Provenance Runtime structural regression tests.
//
// Dependency-free structural assertions over the migration text, in the same
// style as the WP02 Tier 1 / Tier 2 suites. Real database behaviour — that the
// guards raise, that the deferred RG100 / RG110 checks refuse at COMMIT — must
// be validated at runtime against a disposable Postgres, and is recorded below
// as DEFERRED-BY-EXECUTION-EVIDENCE rather than claimed here.
//
// What these tests protect is Step 2's governance shape: exact-instance
// pointers, the mandatory CONTENT ORIGIN classification, explicit language,
// the three non-conflated source levels, the M-1 fail-closed boundary, the one
// coherent evidence-linking concept, conflict preservation, provenance
// survival across derivation, and deterministic traversal.

const root = process.cwd();
const migDir = resolve(root, "supabase/migrations");

const wp03Files = readdirSync(migDir).filter((n) => n.includes("rgkb_wp03"));

const migration = (() => {
  if (wp03Files.length !== 1) {
    throw new Error(`expected exactly one WP03 migration, found ${wp03Files.length}`);
  }
  return readFileSync(resolve(migDir, wp03Files[0]), "utf8");
})();

const tier2 = (() => {
  const f = readdirSync(migDir).find((n) => n.includes("rgkb_wp02_tier2"));
  if (!f) throw new Error("WP02 Tier 2 migration not found");
  return readFileSync(resolve(migDir, f), "utf8");
})();

// Executable SQL only.
const exec = migration
  .split(/\r?\n/)
  .filter((l) => !l.trimStart().startsWith("--"))
  .join("\n");

// Executable SQL with string literals blanked — forbidden-identifier checks
// must run against code, not against prose in a COMMENT or RAISE message.
const code = exec.replace(/'(?:[^']|'')*'/g, "''");

const CONTENT_ORIGINS = ["direct_source_evidence", "derived_interpretation", "constructed_content"];
const EVIDENCE_ROLES = ["supports", "corroborates", "contradicts", "context"];

// The three governance-bearing families M-1 leaves unresolved.
const M1_FAMILIES = [
  "source_descriptor",
  "identity_determination",
  "external_identifier",
  "external_identifier_attachment",
];

const alterBlock = (table: string) => {
  const m = new RegExp(`ALTER TABLE rgkb\\.${table}\\n([\\s\\S]*?);\\n`).exec(exec);
  if (!m) throw new Error(`ALTER block for ${table} not found`);
  return m[1];
};

describe("WP03 — no second identity, version or provenance authority", () => {
  it("creates no new governed family and never touches the subject-type catalog", () => {
    expect(exec).not.toMatch(/subject_type_catalog/);
    expect(exec).not.toMatch(/INSERT\s+INTO/i);
  });

  it("creates no second instance registry or version allocator", () => {
    // The only new tables are the three enduring source identities and the
    // derivation-input join table. None of them carries instance_id.
    const tables = [...exec.matchAll(/CREATE TABLE IF NOT EXISTS rgkb\.([a-z0-9_]+)/g)].map((m) => m[1]);
    expect([...tables].sort()).toEqual([
      "derivation_record_input",
      "source_expression_identity",
      "source_identity",
      "source_manifestation_identity",
    ]);
    expect(code).not.toMatch(/CREATE TABLE[\s\S]{0,200}instance_id\s+uuid PRIMARY KEY/);
    // version_sequence is never DEFINED here — the only occurrences are the
    // RC2 editorial guards asserting it must not change, which is the WP02
    // ordering attribute being protected, not a second allocator.
    expect(code).not.toMatch(/ADD COLUMN IF NOT EXISTS version_sequence|version_sequence\s+integer/);
    for (const m of code.match(/version_sequence/g) || []) void m;
    expect(code.match(/version_sequence/g) || []).toEqual(
      new Array((code.match(/NEW\.version_sequence IS DISTINCT FROM OLD\.version_sequence/g) || []).length * 2).fill("version_sequence"),
    );
  });

  it("uses the WP02 registry for every governed endpoint", () => {
    for (const fk of [
      "typed_evidence_link_supported_fk",
      "derivation_record_output_fk",
      "derivation_record_input_instance_fk",
    ]) {
      expect(exec).toMatch(new RegExp(`CONSTRAINT ${fk} FOREIGN KEY[\\s\\S]{0,120}REFERENCES rgkb\\.governed_instance \\(instance_id\\)`));
    }
  });

  it("never lets object_id, domain_code, version_sequence or an external identifier be an authoritative pointer", () => {
    for (const bad of ["object_id", "domain_code", "version_sequence", "external_identifier", "doi", "isbn"]) {
      expect(code).not.toMatch(new RegExp(`REFERENCES[^;]*\\(${bad}\\)`, "i"));
    }
    // object_id appears only inside the RC2 editorial guards, asserting that
    // the WP02 stable-identity link must not change. It is never a pointer
    // target and never a governed-subject substitute here.
    for (const occ of code.match(/[^\n]*\bobject_id\b[^\n]*/g) || []) {
      expect(occ).toMatch(/IS DISTINCT FROM/);
    }
    expect(code).not.toMatch(/\bdomain_code\b/);
  });
});

describe("WP03 — M-1 fail-closed boundary", () => {
  it("admits no source-descriptor, identity-determination or external-identifier family", () => {
    for (const f of M1_FAMILIES) {
      expect(code).not.toMatch(new RegExp(`CREATE TABLE IF NOT EXISTS rgkb\\.${f}`));
    }
  });

  it("keeps the three source levels as enduring identities, not governed instances", () => {
    for (const t of ["source_identity", "source_expression_identity", "source_manifestation_identity"]) {
      const m = new RegExp(`CREATE TABLE IF NOT EXISTS rgkb\\.${t} \\(([\\s\\S]*?)\\n\\);`).exec(exec);
      expect(m).not.toBeNull();
      expect(m![1]).not.toMatch(/instance_id/);
      expect(m![1]).not.toMatch(/subject_type/);
    }
  });

  it("creates no cross-level link between the three source levels", () => {
    // The determination that a manifestation is an instance of an expression,
    // or an expression a form of a work, is exactly the M-1-unresolved
    // governance subject. Expressing it as a mechanical FK would resolve M-1
    // by schema convenience.
    expect(code).not.toMatch(/REFERENCES rgkb\.source_identity/);
    const expr = /CREATE TABLE IF NOT EXISTS rgkb\.source_expression_identity \(([\s\S]*?)\n\);/.exec(exec)![1];
    const manif = /CREATE TABLE IF NOT EXISTS rgkb\.source_manifestation_identity \(([\s\S]*?)\n\);/.exec(exec)![1];
    expect(expr).not.toMatch(/source_id/);
    expect(manif).not.toMatch(/expression_id/);
  });

  it("stores no descriptor, metadata, filename or fingerprint on a source level", () => {
    for (const t of ["source_identity", "source_expression_identity", "source_manifestation_identity"]) {
      const body = /CREATE TABLE IF NOT EXISTS rgkb\.[a-z_]+ \(([\s\S]*?)\n\);/.exec(
        exec.slice(exec.indexOf(`CREATE TABLE IF NOT EXISTS rgkb.${t} (`)),
      )![1];
      const cols = body.split("\n").filter((l) => /^\s{2}[a-z]/.test(l)).map((l) => l.trim().split(/\s+/)[0]);
      expect(cols).toHaveLength(1);
      expect(cols[0]).toMatch(/_id$/);
    }
  });

  it("keeps the enduring identities immutable and non-deletable", () => {
    expect(exec).toMatch(/ERRCODE = 'RG090'/);
    expect(exec).toMatch(/ERRCODE = 'RG091'/);
    for (const t of ["source_identity", "source_expression_identity", "source_manifestation_identity"]) {
      expect(exec).toMatch(new RegExp(`BEFORE UPDATE OR DELETE ON rgkb\\.${t}\\b`));
    }
  });
});

describe("WP03 — CONTENT ORIGIN classification", () => {
  it("is mandatory, single-valued and constrained to the three fixed classes", () => {
    const block = alterBlock("knowledge_unit_version");
    expect(block).toMatch(/ADD COLUMN IF NOT EXISTS content_origin text NOT NULL/);
    expect(block).toMatch(
      new RegExp(`CHECK \\(content_origin IN \\('${CONTENT_ORIGINS.join("', '")}'\\)\\)`),
    );
  });

  it("has no default — unclassified content is never treated as direct source evidence", () => {
    expect(code).not.toMatch(/content_origin[^,\n]*DEFAULT/i);
  });

  it("requires a governed derivation for derived interpretation", () => {
    expect(exec).toMatch(
      /CHECK \(content_origin <> 'derived_interpretation' OR origin_derivation_instance_id IS NOT NULL\)/,
    );
    expect(exec).toMatch(/origin_derivation_instance_id\)\s+REFERENCES rgkb\.derivation_record \(instance_id\)/);
  });

  it("requires direct source evidence to resolve to an evidence anchor, at COMMIT", () => {
    expect(exec).toMatch(/ERRCODE = 'RG100'/);
    expect(exec).toMatch(
      /CREATE CONSTRAINT TRIGGER knowledge_unit_version_direct_evidence_check\s+AFTER INSERT OR UPDATE ON rgkb\.knowledge_unit_version\s+DEFERRABLE INITIALLY DEFERRED/,
    );
  });

  it("introduces no arithmetic, scoring or aggregate epistemic semantics", () => {
    expect(code).not.toMatch(/score|confidence|weight|average|avg\(|sum\(|percent/i);
    // RC2 made both deferred vocabularies fail closed outright, which
    // subsumes the earlier anti-numeric guard.
    expect(exec).toMatch(/CHECK \(epistemic_characterization IS NULL\)/);
    expect(exec).toMatch(/CHECK \(support_characterization IS NULL\)/);
  });
});

describe("WP03 — governed localized text", () => {
  it("requires an explicit, non-blank language with no default", () => {
    const block = alterBlock("localized_governed_text_version");
    expect(block).toMatch(/ADD COLUMN IF NOT EXISTS language_code text NOT NULL/);
    expect(block).toMatch(/CHECK \(length\(btrim\(language_code\)\) > 0\)/);
    expect(code).not.toMatch(/language_code[^,\n]*DEFAULT/i);
  });

  it("carries the governed wording on the version, under the Step 1 editorial boundary", () => {
    const block = alterBlock("localized_governed_text_version");
    expect(block).toMatch(/ADD COLUMN IF NOT EXISTS governed_wording text NOT NULL/);
    expect(block).toMatch(/CHECK \(editorial_class IN \('draft', 'content_asserted'\)\)/);
  });

  it("is referenced by the exact localized-text version, not the localization identity", () => {
    expect(exec).toMatch(
      /assertion_text_instance_id\)\s+REFERENCES rgkb\.localized_governed_text_version \(instance_id\)/,
    );
    expect(alterBlock("knowledge_unit_version")).toMatch(
      /ADD COLUMN IF NOT EXISTS assertion_text_instance_id uuid NOT NULL/,
    );
  });

  it("infers no fidelity, validity, approval or eligibility from a localized version", () => {
    expect(code).not.toMatch(/translation_fidelity|contextual_validity|is_approved|is_validated|runtime_available/i);
  });
});

describe("WP03 — evidence anchor", () => {
  it("binds scientifically to the source expression, mandatorily", () => {
    const block = alterBlock("evidence_anchor");
    expect(block).toMatch(/ADD COLUMN IF NOT EXISTS expression_id uuid NOT NULL/);
    expect(block).toMatch(/expression_id\)\s+REFERENCES rgkb\.source_expression_identity \(expression_id\)/);
  });

  it("treats the manifestation as an optional physical resolution, never a substitute", () => {
    const block = alterBlock("evidence_anchor");
    expect(block).toMatch(/ADD COLUMN IF NOT EXISTS manifestation_id uuid,/);
    expect(block).toMatch(/manifestation_id\)\s+REFERENCES rgkb\.source_manifestation_identity/);
  });

  it("carries a locator and is a location, not a claim", () => {
    const block = alterBlock("evidence_anchor");
    expect(block).toMatch(/ADD COLUMN IF NOT EXISTS locator_type text NOT NULL/);
    expect(block).toMatch(/ADD COLUMN IF NOT EXISTS locator_payload text NOT NULL/);
    // No role / support / claim semantics live on the anchor.
    expect(block).not.toMatch(/evidence_role|support_characterization|predicate/);
  });

  it("leaves the deferred vocabularies unconstrained", () => {
    const block = alterBlock("evidence_anchor");
    expect(block).not.toMatch(/CHECK\s*\(\s*locator_type/i);
    expect(block).not.toMatch(/CHECK\s*\(\s*integrity_value/i);
  });

  it("imposes no artificial stable-identity or version family on an anchor", () => {
    expect(exec).not.toMatch(/rgkb\.evidence_anchor_version/);
    expect(alterBlock("evidence_anchor")).not.toMatch(/object_id|version_sequence/);
  });

  it("records the extraction act as an exact governed derivation instance", () => {
    expect(alterBlock("evidence_anchor")).toMatch(
      /extraction_derivation_instance_id\)\s+REFERENCES rgkb\.derivation_record \(instance_id\)/,
    );
  });
});

describe("WP03 — rights / document anchor stays distinct", () => {
  it("borrows no scientific source identity as a surrogate rights authority", () => {
    // F-09 boundary: a rights anchor must not resolve against source_expression
    // or source_manifestation, which would quietly manufacture the physical
    // rights-document entity F-09 defers.
    const block = alterBlock("rights_document_anchor");
    expect(block).not.toMatch(/expression_id/);
    expect(block).not.toMatch(/manifestation_id/);
    expect(block).toMatch(/ADD COLUMN IF NOT EXISTS locator_type text NOT NULL/);
    expect(block).toMatch(/ADD COLUMN IF NOT EXISTS locator_payload text NOT NULL/);
  });

  it("keeps rights-side traversal explicitly incomplete", () => {
    expect(exec).toMatch(/'incomplete_f09_unresolved'/);
  });

  it("creates no rights-document identity family — F-09 stays deferred", () => {
    expect(code).not.toMatch(/CREATE TABLE IF NOT EXISTS rgkb\.rights_document\b/);
    expect(migration).toMatch(/F-09/);
  });
});

describe("WP03 — typed evidence link is the only authoritative pointer", () => {
  it("uses exact governed instances at both endpoints", () => {
    const block = alterBlock("typed_evidence_link");
    expect(block).toMatch(/ADD COLUMN IF NOT EXISTS supported_instance_id uuid NOT NULL/);
    expect(block).toMatch(/supported_instance_id\)\s+REFERENCES rgkb\.governed_instance \(instance_id\)/);
    expect(block).toMatch(/evidence_anchor_instance_id\)\s+REFERENCES rgkb\.evidence_anchor \(instance_id\)/);
  });

  it("is ONE family that can name either anchor kind, exactly one per link", () => {
    const block = alterBlock("typed_evidence_link");
    expect(block).toMatch(/rights_anchor_instance_id\)\s+REFERENCES rgkb\.rights_document_anchor \(instance_id\)/);
    expect(block).toMatch(
      /CHECK \(\(evidence_anchor_instance_id IS NOT NULL\) <> \(rights_anchor_instance_id IS NOT NULL\)\)/,
    );
    // no second, ad-hoc rights evidence-link family
    expect(code).not.toMatch(/rights_evidence_link|rights_typed_link/);
  });

  it("preserves the four mandatory evidence-role distinctions without closing the deferred vocabulary", () => {
    expect(exec).toMatch(new RegExp(`CHECK \\(evidence_role_class IN \\('${EVIDENCE_ROLES.join("', '")}'\\)\\)`));
    expect(migration).toMatch(/DEFERRED; this class does not close it/);
  });

  it("keeps contradiction expressible", () => {
    expect(exec).toMatch(/'contradicts'/);
  });

  it("makes commentary explicitly not the pointer", () => {
    const block = alterBlock("typed_evidence_link");
    expect(block).toMatch(/ADD COLUMN IF NOT EXISTS commentary text/);
    // commentary is nullable and carries no constraint that could make it load-bearing
    expect(block).not.toMatch(/commentary text NOT NULL/);
    expect(migration).toMatch(/explicitly NOT the authoritative pointer/);
  });

  it("aggregates no evidence and derives no object-level epistemic label from links", () => {
    expect(code).not.toMatch(/sum\(|avg\(|count\(\*\)[\s\S]{0,80}epistemic/i);
  });

  it("adds no per-family ad-hoc evidence field", () => {
    // One concept: only typed_evidence_link carries evidence_role_class.
    expect((exec.match(/evidence_role_class/g) || []).length).toBeGreaterThan(0);
    for (const t of ["knowledge_unit_version", "knowledge_unit_relation", "evidence_anchor"]) {
      expect(alterBlock(t)).not.toMatch(/evidence_role|evidence_basis/);
    }
  });
});

describe("WP03 — knowledge object relations", () => {
  it("binds version to version, never stable identity to stable identity", () => {
    const block = alterBlock("knowledge_unit_relation");
    expect(block).toMatch(/source_version_instance_id\)\s+REFERENCES rgkb\.knowledge_unit_version \(instance_id\)/);
    expect(block).toMatch(/target_version_instance_id\)\s+REFERENCES rgkb\.knowledge_unit_version \(instance_id\)/);
    expect(block).not.toMatch(/rgkb\.knowledge_unit \(object_id\)/);
  });

  it("carries no relation-local validation truth and no free-text evidence basis", () => {
    const block = alterBlock("knowledge_unit_relation");
    expect(block).not.toMatch(/validation|evidence_basis|is_valid|status/i);
  });

  it("keeps endpoints distinct and the predicate present", () => {
    const block = alterBlock("knowledge_unit_relation");
    expect(block).toMatch(/CHECK \(length\(btrim\(predicate\)\) > 0\)/);
    expect(block).toMatch(/CHECK \(source_version_instance_id <> target_version_instance_id\)/);
  });
});

describe("WP03 — derivation and provenance preservation", () => {
  it("names the exact governed output", () => {
    expect(alterBlock("derivation_record")).toMatch(
      /output_instance_id\)\s+REFERENCES rgkb\.governed_instance \(instance_id\)/,
    );
  });

  it("represents multiple inputs as a normalized dependent structure, not a governed family", () => {
    const body = /CREATE TABLE IF NOT EXISTS rgkb\.derivation_record_input \(([\s\S]*?)\n\);/.exec(exec)![1];
    expect(body).toMatch(/PRIMARY KEY \(derivation_instance_id, input_instance_id\)/);
    expect(body).not.toMatch(/\binstance_id\s+uuid PRIMARY KEY/);
    expect(body).not.toMatch(/subject_type/);
    expect(migration).toMatch(/NOT a governed family/);
  });

  it("accepts only exact governed instances as inputs", () => {
    const body = /CREATE TABLE IF NOT EXISTS rgkb\.derivation_record_input \(([\s\S]*?)\n\);/.exec(exec)![1];
    expect(body).toMatch(/input_instance_id\)\s+REFERENCES rgkb\.governed_instance \(instance_id\)/);
    expect(body).not.toMatch(/text|name|latest|current/i);
  });

  it("requires at least one input and refuses a self-consuming derivation, at COMMIT", () => {
    expect(exec).toMatch(/ERRCODE = 'RG110'/);
    expect(exec).toMatch(/ERRCODE = 'RG111'/);
    expect(exec).toMatch(
      /CREATE CONSTRAINT TRIGGER derivation_record_inputs_check\s+AFTER INSERT ON rgkb\.derivation_record\s+DEFERRABLE INITIALLY DEFERRED/,
    );
  });

  it("requires typed, attributable actorship without creating reviewer or contributor governance", () => {
    const block = alterBlock("derivation_record");
    expect(block).toMatch(/ADD COLUMN IF NOT EXISTS actor_kind text NOT NULL/);
    expect(block).toMatch(/ADD COLUMN IF NOT EXISTS actor_reference text NOT NULL/);
    expect(block).toMatch(/CHECK \(length\(btrim\(actor_kind\)\) > 0 AND length\(btrim\(actor_reference\)\) > 0\)/);
    expect(code).not.toMatch(/CREATE TABLE IF NOT EXISTS rgkb\.(reviewer|contributor)\b/);
    expect(migration).toMatch(/F-12/);
    expect(migration).toMatch(/F-14/);
  });

  it("keeps historical derivations exact — inputs are immutable and non-removable", () => {
    expect(exec).toMatch(/ERRCODE = 'RG092'/);
    expect(exec).toMatch(/ERRCODE = 'RG093'/);
    expect(exec).toMatch(/BEFORE UPDATE OR DELETE ON rgkb\.derivation_record_input/);
  });

  it("transfers nothing from input to output", () => {
    // No trigger or generated column copies origin/epistemic/validation state.
    expect(code).not.toMatch(/NEW\.content_origin\s*:=/);
    expect(code).not.toMatch(/NEW\.epistemic_characterization\s*:=/);
    expect(code).not.toMatch(/GENERATED ALWAYS AS/i);
  });
});

describe("WP03 — deterministic traversal", () => {
  it("exposes forward, backward and derivation walks as exact key joins", () => {
    for (const fn of ["anchor_level_evidence_for_instance", "instances_referencing_anchor", "derivation_inputs_for_output"]) {
      expect(exec).toMatch(new RegExp(`CREATE OR REPLACE FUNCTION rgkb\\.${fn}\\(`));
    }
  });

  it("uses no string, label, nearest-match, recency or latest heuristic", () => {
    expect(code).not.toMatch(/ORDER\s+BY|\bLIMIT\b|\bDESC\b|\bMAX\s*\(|GREATEST|LIKE|ILIKE|similar|~\*/i);
    expect(code).not.toMatch(/latest|most_recent|current_version|fallback|nearest/i);
  });

  it("cannot be mistaken for a complete canonical provenance chain", () => {
    // The canonical source chain additionally requires the governed
    // source-identity determination M-1 blocks, and the rights side requires
    // the physical rights-document entity F-09 defers.
    expect(exec).toMatch(/canonical_source_chain_status\s+text/);
    expect(exec).toMatch(/'incomplete_m1_unresolved'/);
    expect(exec).toMatch(/anchor_level_evidence_for_instance/);
    expect(code).not.toMatch(/complete_canonical|canonical_provenance_chain\(/i);
  });

  it("keeps the enduring-identity reference level explicit and separate", () => {
    expect(exec).toMatch(/enduring_expression_identity\s+uuid/);
    expect(exec).toMatch(/enduring_manifestation_identity\s+uuid/);
    expect(migration).toMatch(/MUST NOT be reported as resolved governed instances/);
  });

  it("returns the role so backward reachability is not read as proof of support", () => {
    expect(exec).toMatch(/instances_referencing_anchor[\s\S]{0,600}evidence_role_class/);
  });

  it("is SECURITY INVOKER with a safe search_path, never a definer path", () => {
    expect(exec).not.toMatch(/SECURITY DEFINER/i);
    expect((exec.match(/SECURITY INVOKER/g) || []).length).toBe(17);
    expect((exec.match(/SET search_path = ''/g) || []).length).toBe(17);
  });
});

describe("WP03 — non-scope and containment", () => {
  it("adds no student, session or runtime identifier to any canonical table", () => {
    expect(code).not.toMatch(/student|profile_id|assessment_id|school_id|session_id|parent_id|counselor_id|user_id|auth\./i);
  });

  it("implements no ingestion, embedding, retrieval or external-tool machinery", () => {
    expect(code).not.toMatch(/embedding|vector|crawl|ingest|retrieval|rag|openai|anthropic|http/i);
  });

  it("implements no Step 3+ determination, taxonomy or scoring semantics", () => {
    expect(code).not.toMatch(/validation_outcome|determination|claim_taxonomy|interpretation_claim|recommendation|riasec|big_five|caas/i);
  });

  it("does not touch the current-version resolver and adds no F-04 machinery", () => {
    expect(exec).not.toMatch(/resolve_current_version/);
    expect(code).not.toMatch(/re_?bind|affected_dependent|repoint/i);
  });

  it("invents no access model", () => {
    expect(exec).not.toMatch(/CREATE POLICY|ALTER POLICY|DROP POLICY/i);
    expect(exec).not.toMatch(/\bGRANT\b/i);
    expect(code).not.toMatch(/\bpublic\./i);
    for (const t of ["source_identity", "source_expression_identity", "source_manifestation_identity", "derivation_record_input"]) {
      expect(exec).toMatch(new RegExp(`ALTER TABLE rgkb\\.${t} ENABLE ROW LEVEL SECURITY;`));
      expect(exec).toMatch(new RegExp(`ALTER TABLE rgkb\\.${t} FORCE ROW LEVEL SECURITY;`));
      expect(exec).toMatch(new RegExp(`REVOKE ALL ON TABLE rgkb\\.${t} FROM anon;`));
    }
  });

  it("alters only rgkb objects and drops nothing", () => {
    const alters = [...exec.matchAll(/ALTER TABLE ([a-z_.]+)/g)].map((m) => m[1]);
    expect(alters.length).toBeGreaterThan(0);
    for (const t of alters) expect(t).toMatch(/^rgkb\./);
    expect(exec).not.toMatch(/DROP TABLE|DROP SCHEMA|DROP COLUMN|ALTER COLUMN|TRUNCATE|DELETE FROM/i);
  });

  it("leaves the merged WP02 Tier 2 migration untouched", () => {
    expect(tier2).toMatch(/ERRCODE = 'RG060'/);
    expect(tier2).toMatch(/ERRCODE = 'RG070'/);
  });

  it("implements no citation rendering", () => {
    expect(code).not.toMatch(/citation|apa|mla|render|format_citation|bibliograph/i);
  });

  it("is a single narrow additive migration using single-line literals", () => {
    expect(wp03Files).toHaveLength(1);
    expect(wp03Files[0]).toMatch(/^\d{14}_rgkb_wp03_evidence_provenance_runtime\.sql$/);
    expect(exec).not.toMatch(/'[ \t]*\r?\n[ \t]*'/);
  });
});

describe("WP03 RC1 — localized text carries its own CONTENT ORIGIN", () => {
  const block = () => alterBlock("localized_governed_text_version");

  it("is mandatory and constrained to the same three fixed classes", () => {
    expect(block()).toMatch(/ADD COLUMN IF NOT EXISTS content_origin text NOT NULL/);
    expect(block()).toMatch(
      new RegExp(`CHECK \\(content_origin IN \\('${CONTENT_ORIGINS.join("', '")}'\\)\\)`),
    );
  });

  it("has no default and is never inherited from the knowledge version", () => {
    expect(block()).not.toMatch(/content_origin[^,\n]*DEFAULT/i);
    expect(code).not.toMatch(/NEW\.content_origin\s*:=/);
  });

  it("requires its own governed derivation when derived", () => {
    expect(block()).toMatch(
      /CHECK \(content_origin <> 'derived_interpretation' OR origin_derivation_instance_id IS NOT NULL\)/,
    );
    expect(block()).toMatch(/origin_derivation_instance_id\)\s+REFERENCES rgkb\.derivation_record \(instance_id\)/);
  });

  it("resolves direct source content through the SAME canonical link mechanism", () => {
    expect(exec).toMatch(
      /CREATE CONSTRAINT TRIGGER localized_text_direct_evidence_check\s+AFTER INSERT OR UPDATE ON rgkb\.localized_governed_text_version\s+DEFERRABLE INITIALLY DEFERRED\s+FOR EACH ROW EXECUTE FUNCTION rgkb\.direct_evidence_has_anchor_check\(\)/,
    );
  });
});

describe("WP03 RC1 — derivation / output integrity", () => {
  it("requires the referenced derivation to name this instance as its exact output", () => {
    expect(exec).toMatch(/ERRCODE = 'RG120'/);
    for (const t of [
      "knowledge_unit_version_origin_output_check",
      "localized_text_origin_output_check",
      "evidence_anchor_extraction_output_check",
      "rights_anchor_extraction_output_check",
    ]) {
      expect(exec).toMatch(new RegExp(`CREATE CONSTRAINT TRIGGER ${t}`));
    }
  });

  it("makes evidence-anchor extraction provenance mandatory", () => {
    expect(alterBlock("evidence_anchor")).toMatch(
      /ADD COLUMN IF NOT EXISTS extraction_derivation_instance_id uuid NOT NULL/,
    );
  });

  it("requires machine identity and version both-or-neither, non-blank when present", () => {
    const block = alterBlock("derivation_record");
    expect(block).toMatch(
      /CHECK \(\(machine_process_identity IS NULL\) = \(machine_process_version IS NULL\)\)/,
    );
    expect(block).toMatch(
      /length\(btrim\(machine_process_identity\)\) > 0 AND length\(btrim\(machine_process_version\)\) > 0/,
    );
  });

  it("invents no machine-provider taxonomy", () => {
    expect(code).not.toMatch(/CHECK\s*\(\s*machine_process_identity IN/i);
  });
});

describe("WP03 RC1 — retained excerpt fails closed", () => {
  it("refuses retained excerpt on both anchor families", () => {
    expect(alterBlock("evidence_anchor")).toMatch(
      /CONSTRAINT evidence_anchor_retention_fail_closed CHECK \(retained_excerpt IS NULL\)/,
    );
    expect(alterBlock("rights_document_anchor")).toMatch(
      /CONSTRAINT rights_anchor_retention_fail_closed CHECK \(retained_excerpt IS NULL\)/,
    );
  });

  it("invents no rights permission flag and closes no legal finding", () => {
    expect(code).not.toMatch(/rights_permitted|retention_allowed|may_retain|license_ok/i);
    expect(migration).toMatch(/absence of a rights determination is not permission/);
    expect(code).not.toMatch(/retained_excerpt text NOT NULL/);
  });

  it("keeps locator and provenance usable without retained text", () => {
    expect(alterBlock("evidence_anchor")).toMatch(/ADD COLUMN IF NOT EXISTS locator_payload text NOT NULL/);
  });
});

describe("WP03 RC2 — Pattern A editorial immutability", () => {
  const GUARDED = [
    ["knowledge_unit_version", "knowledge_version_editorial_guard"],
    ["localized_governed_text_version", "localized_text_editorial_guard"],
  ] as const;

  it("replaces the blanket UPDATE block with an editorial-boundary guard", () => {
    for (const [table, fn] of GUARDED) {
      expect(exec).toMatch(new RegExp(`CREATE OR REPLACE FUNCTION rgkb\\.${fn}\\(`));
      expect(exec).toMatch(
        new RegExp(`CREATE TRIGGER [a-z_]+\\s+BEFORE UPDATE OR DELETE ON rgkb\\.${table}\\s+FOR EACH ROW EXECUTE FUNCTION rgkb\\.${fn}\\(\\)`),
      );
    }
    // the WP02 generic member guard is detached from these two tables only
    expect(exec).toMatch(/DROP TRIGGER IF EXISTS knowledge_unit_version_write_guard ON rgkb\.knowledge_unit_version;/);
    expect(exec).toMatch(
      /DROP TRIGGER IF EXISTS localized_governed_text_version_write_guard ON rgkb\.localized_governed_text_version;/,
    );
  });

  it("permits draft editing and refuses every update once content_asserted", () => {
    expect(exec).toMatch(/ERRCODE = 'RG130'/);
    // the guard returns NEW (allowing the write) only after the draft check
    expect(exec).toMatch(/IF OLD\.editorial_class = 'content_asserted' THEN[\s\S]{0,600}RG130/);
    expect((exec.match(/RETURN NEW;/g) || []).length).toBeGreaterThanOrEqual(2);
  });

  it("makes draft exit irreversible", () => {
    // content_asserted -> draft is an UPDATE of a content_asserted row, which
    // RG130 refuses outright; no path restores mutability.
    expect(code).not.toMatch(/NEW\.editorial_class\s*:=/);
    expect(migration).toMatch(/exit from draft is IRREVERSIBLE|draft exit is irreversible|irreversible/i);
  });

  it("keeps identity and ordering immutable in every editorial state", () => {
    expect(exec).toMatch(/ERRCODE = 'RG132'/);
    for (const col of ["instance_id", "subject_type", "object_id", "version_sequence", "previous_sequence"]) {
      expect(exec).toMatch(new RegExp(`NEW\\.${col} IS DISTINCT FROM OLD\\.${col}`));
    }
  });

  it("refuses deletion in every state", () => {
    expect(exec).toMatch(/ERRCODE = 'RG133'/);
  });

  it("re-evaluates the cross-row invariants on UPDATE, not only INSERT", () => {
    // A draft edit must not bypass any cross-row invariant, so NO constraint
    // trigger on either content-bearing table may fire on INSERT only.
    expect(exec).not.toMatch(
      /AFTER INSERT ON rgkb\.(knowledge_unit_version|localized_governed_text_version)\b/,
    );
    const updateTriggers = exec.match(
      /AFTER INSERT OR UPDATE ON rgkb\.(knowledge_unit_version|localized_governed_text_version)/g,
    ) || [];
    expect(updateTriggers.length).toBeGreaterThanOrEqual(4);
  });
});

describe("WP03 RC2 — direct source evidence requires a SCIENTIFIC anchor", () => {
  it("counts only links carrying an exact evidence_anchor endpoint", () => {
    expect(exec).toMatch(
      /WHERE l\.supported_instance_id = NEW\.instance_id\s+AND l\.evidence_anchor_instance_id IS NOT NULL;/,
    );
  });

  it("states that a rights anchor does not satisfy it", () => {
    expect(exec).toMatch(/A rights\/document anchor does not satisfy it/);
  });

  it("keeps rights anchors inside the same shared linking concept", () => {
    expect(alterBlock("typed_evidence_link")).toMatch(
      /rights_anchor_instance_id\)\s+REFERENCES rgkb\.rights_document_anchor \(instance_id\)/,
    );
    expect(code).not.toMatch(/rights_evidence_link|rights_typed_link/);
  });

  it("still refuses free-text commentary as the pointer", () => {
    const block = alterBlock("typed_evidence_link");
    expect(block).not.toMatch(/commentary text NOT NULL/);
  });
});

describe("WP03 RC2 — complete scientific anchor minimum fields", () => {
  const block = () => alterBlock("evidence_anchor");

  it("requires a non-blank locator type and payload", () => {
    expect(block()).toMatch(
      /CHECK \(length\(btrim\(locator_type\)\) > 0 AND length\(btrim\(locator_payload\)\) > 0\)/,
    );
  });

  it("requires a mandatory non-blank integrity value without fixing an algorithm", () => {
    expect(block()).toMatch(/ADD COLUMN IF NOT EXISTS integrity_value text NOT NULL/);
    expect(block()).toMatch(/CHECK \(length\(btrim\(integrity_value\)\) > 0\)/);
    expect(block()).not.toMatch(/sha|md5|blake|CHECK\s*\(\s*integrity_value IN/i);
  });

  it("keeps extraction provenance mandatory and RG120-correlated", () => {
    expect(block()).toMatch(/ADD COLUMN IF NOT EXISTS extraction_derivation_instance_id uuid NOT NULL/);
    expect(exec).toMatch(/CREATE CONSTRAINT TRIGGER evidence_anchor_extraction_output_check/);
  });

  it("leaves span offsets optional and retention fail-closed", () => {
    expect(block()).toMatch(/ADD COLUMN IF NOT EXISTS span_start integer,/);
    expect(block()).toMatch(/CONSTRAINT evidence_anchor_retention_fail_closed CHECK \(retained_excerpt IS NULL\)/);
  });
});

describe("WP03 RC2 — deferred controlled vocabularies fail closed", () => {
  it("refuses any epistemic characterization value until a vocabulary is authorized", () => {
    expect(alterBlock("knowledge_unit_version")).toMatch(
      /CONSTRAINT knowledge_unit_version_epistemic_deferred CHECK \(epistemic_characterization IS NULL\)/,
    );
  });

  it("refuses any support characterization value until a vocabulary is authorized", () => {
    expect(alterBlock("typed_evidence_link")).toMatch(
      /CONSTRAINT typed_evidence_link_support_deferred CHECK \(support_characterization IS NULL\)/,
    );
  });

  it("invents no vocabulary value or semantic code", () => {
    expect(code).not.toMatch(/epistemic_characterization IN \(|support_characterization IN \(/);
    expect(code).not.toMatch(/strong|weak|moderate|high|low|tentative|robust/i);
  });

  it("keeps the four mandatory evidence-role distinctions unaffected", () => {
    expect(exec).toMatch(new RegExp(`CHECK \\(evidence_role_class IN \\('${EVIDENCE_ROLES.join("', '")}'\\)\\)`));
  });

  it("preserves non-arithmetic, non-additive, no-master-score", () => {
    expect(code).not.toMatch(/sum\(|avg\(|score|confidence|weight/i);
  });
});

describe("WP03 RC3 — CONTENT ORIGIN transition prohibitions", () => {
  it("rejects every promotion Step 2 §2.5 fixes, in both guards", () => {
    const guards = exec.match(/ERRCODE = 'RG140'/g) || [];
    expect(guards).toHaveLength(2); // knowledge version + localized text
    expect(exec).toMatch(
      /OLD\.content_origin = 'derived_interpretation' AND NEW\.content_origin = 'direct_source_evidence'/,
    );
    expect(exec).toMatch(
      /OLD\.content_origin = 'constructed_content' AND NEW\.content_origin IN \('derived_interpretation', 'direct_source_evidence'\)/,
    );
  });

  it("applies even while the version is still draft", () => {
    // the transition check sits BEFORE the content_asserted branch, so a draft
    // row is still subject to it
    for (const m of exec.match(/RG140[\s\S]{0,400}?RG130/g) || []) expect(m).toMatch(/RG130/);
    expect((exec.match(/RG140[\s\S]{0,400}?RG130/g) || []).length).toBe(2);
  });

  it("never rewrites content_origin and invents no ranking system", () => {
    expect(code).not.toMatch(/NEW\.content_origin\s*:=/);
    expect(code).not.toMatch(/content_origin_rank|origin_level|origin_score/i);
  });
});

describe("WP03 RC3 — a bound localized text must already be immutable", () => {
  it("refuses binding a still-draft localized-text version", () => {
    expect(exec).toMatch(/ERRCODE = 'RG160'/);
    expect(exec).toMatch(/v_editorial_class IS DISTINCT FROM 'content_asserted'/);
    expect(exec).toMatch(
      /CREATE CONSTRAINT TRIGGER knowledge_unit_version_assertion_text_check\s+AFTER INSERT OR UPDATE ON rgkb\.knowledge_unit_version\s+DEFERRABLE INITIALLY DEFERRED/,
    );
  });

  it("keeps a content_asserted localized version bindable", () => {
    // the check passes only for content_asserted, so that value is the
    // admissible one; nothing else is required of the binding
    expect(exec).toMatch(/SELECT t\.editorial_class INTO v_editorial_class/);
  });

  it("guarantees bound wording cannot change afterwards", () => {
    // content_asserted rows are refused every UPDATE by the editorial guard
    expect(exec).toMatch(/ERRCODE = 'RG130'/);
  });

  it("invents no is_bound / is_immutable flag and mutates no editorial_class", () => {
    expect(code).not.toMatch(/is_bound|is_immutable|bound_at|is_published|is_activated/i);
    expect(code).not.toMatch(/NEW\.editorial_class\s*:=|OLD\.editorial_class\s*:=/);
  });
});

describe("WP03 RC3 — constructed content carries no authoritative evidence", () => {
  it("closes direction A: a link targeting constructed content is refused", () => {
    expect(exec).toMatch(/CREATE OR REPLACE FUNCTION rgkb\.evidence_link_target_not_constructed_check\(/);
    expect(exec).toMatch(
      /CREATE CONSTRAINT TRIGGER typed_evidence_link_target_check\s+AFTER INSERT OR UPDATE ON rgkb\.typed_evidence_link/,
    );
  });

  it("closes direction B: reclassifying to constructed while a link exists is refused", () => {
    expect(exec).toMatch(/CREATE OR REPLACE FUNCTION rgkb\.constructed_content_no_evidence_check\(/);
    for (const t of ["knowledge_unit_version_constructed_check", "localized_text_constructed_check"]) {
      expect(exec).toMatch(new RegExp(`CREATE CONSTRAINT TRIGGER ${t}\\s+AFTER INSERT OR UPDATE`));
    }
  });

  it("raises RG150 on both directions and keeps commentary permitted", () => {
    expect((exec.match(/ERRCODE = 'RG150'/g) || []).length).toBe(2);
    expect(alterBlock("typed_evidence_link")).toMatch(/ADD COLUMN IF NOT EXISTS commentary text/);
  });

  it("introduces no ad-hoc evidence mechanism and keeps the shared family", () => {
    expect(code).not.toMatch(/rights_evidence_link|rights_typed_link|evidence_note|support_field/);
    expect(alterBlock("typed_evidence_link")).toMatch(/rights_anchor_instance_id\)\s+REFERENCES/);
  });
});

describe("WP03 RC3 — a knowledge relation must resolve to governed evidence", () => {
  it("refuses a relation with zero typed evidence links", () => {
    expect(exec).toMatch(/ERRCODE = 'RG170'/);
    expect(exec).toMatch(
      /CREATE CONSTRAINT TRIGGER knowledge_unit_relation_evidence_check\s+AFTER INSERT OR UPDATE ON rgkb\.knowledge_unit_relation\s+DEFERRABLE INITIALLY DEFERRED/,
    );
  });

  it("requires the link to name that exact relation instance", () => {
    expect(exec).toMatch(/relation_has_evidence_check[\s\S]{0,800}l\.supported_instance_id = NEW\.instance_id/);
  });

  it("keeps free-text evidence basis prohibited and adds no second link family", () => {
    expect(alterBlock("knowledge_unit_relation")).not.toMatch(/evidence_basis|evidence_note/i);
    const linkFamilies = exec.match(/CREATE TABLE IF NOT EXISTS rgkb\.[a-z_]*evidence[a-z_]*/g) || [];
    expect(linkFamilies).toHaveLength(0);
  });
});

describe("WP03 RC3 — derivation input set cannot grow historically", () => {
  it("declares an immutable input cardinality on the derivation record", () => {
    const block = alterBlock("derivation_record");
    expect(block).toMatch(/ADD COLUMN IF NOT EXISTS input_count integer NOT NULL/);
    expect(block).toMatch(/CHECK \(input_count >= 1\)/);
  });

  it("requires the actual input set to equal the declaration at COMMIT", () => {
    expect(exec).toMatch(/v_input_count <> NEW\.input_count/);
    expect(exec).toMatch(/ERRCODE = 'RG110'/);
  });

  it("refuses a later INSERT that would enlarge the historical set", () => {
    expect(exec).toMatch(/ERRCODE = 'RG180'/);
    expect(exec).toMatch(
      /CREATE CONSTRAINT TRIGGER derivation_record_input_frozen_check\s+AFTER INSERT ON rgkb\.derivation_record_input\s+DEFERRABLE INITIALLY DEFERRED/,
    );
    expect(exec).toMatch(/v_declared IS NULL OR v_actual <> v_declared/);
  });

  it("keeps multi-input initial construction possible", () => {
    // the join table takes any number of exact inputs; only the declared
    // cardinality must match, so N inputs in the creating transaction is fine
    const body = /CREATE TABLE IF NOT EXISTS rgkb\.derivation_record_input \(([\s\S]*?)\n\);/.exec(exec)![1];
    expect(body).toMatch(/PRIMARY KEY \(derivation_instance_id, input_instance_id\)/);
  });

  it("still refuses update and delete of inputs", () => {
    expect(exec).toMatch(/ERRCODE = 'RG092'/);
    expect(exec).toMatch(/ERRCODE = 'RG093'/);
  });

  it("invents no caller-writable lock and uses no time or ordering authority", () => {
    expect(code).not.toMatch(/\blocked\b|finalized|is_frozen|first_governance_use/i);
    expect(code).not.toMatch(/ORDER\s+BY|\bLIMIT\b|\bDESC\b|now\(\)|current_timestamp/i);
  });
});

describe("WP03 — DEFERRED-BY-EXECUTION-EVIDENCE (runtime only)", () => {
  it.todo(
    "runtime: RG090/091, RG092/093, RG130/132/133/140 and the deferred RG100 / RG110 / RG111 / RG120 / RG150 / RG160 / RG170 / RG180 checks actually raise in Postgres — DEFERRED: requires a disposable Postgres; no production or remote Supabase execution is authorized",
  );
  it.todo(
    "runtime: a direct_source_evidence knowledge version with no typed evidence link is refused at COMMIT, and a derivation with no input is refused at COMMIT — DEFERRED: deferred-constraint semantics are observable only in a live transaction",
  );
  it.todo(
    "runtime: the three traversal functions return exactly the expected exact-key rows over seeded synthetic governed state — DEFERRED: requires a disposable Postgres and synthetic fixtures that WP03 is not authorized to create",
  );
  it.todo(
    "structural: locator-type, fingerprint-algorithm, evidence-role, support-characterization, epistemic and knowledge-type vocabularies — DEFERRED by Step 2 (§3.3, §5.4, §6.2, §6.3, §16.5); constraining them here would pre-empt the controlled specification that owns them",
  );
  it.todo(
    "governance: source-descriptor / identity-determination / external-identifier-attachment Pattern assignment — DEFERRED by M-1, which is OPEN; the cross-level source linkage stays unimplemented and fails closed until an Owner decision fixes it",
  );
});
