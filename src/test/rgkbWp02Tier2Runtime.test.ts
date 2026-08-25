import { describe, it, expect } from "vitest";
import { readFileSync, readdirSync } from "node:fs";
import { resolve } from "node:path";

// PRM-WP02 Tier 2 structural regression tests.
//
// Dependency-free structural assertions over the migration text, in the same
// style as the Tier 1 suite and the PF-012 / PF-013 governance tests. Real
// database behaviour (that the guards raise, that the deferred membership
// constraint refuses an orphan registry row at COMMIT) must be validated at
// runtime against a disposable Postgres — recorded below as
// DEFERRED-BY-DESIGN, not claimed here.
//
// What these tests protect is the governance shape: the exact 19-family
// catalog, the derived pattern, the two Pattern A identity levels, the Pattern
// B record contract, atomic creation, and the fact that F-04 and F-07 stay
// open and that no access model was invented.

const root = process.cwd();
const migDir = resolve(root, "supabase/migrations");

const tier2Files = readdirSync(migDir).filter((n) => n.includes("rgkb_wp02_tier2"));

const migration = (() => {
  if (tier2Files.length !== 1) {
    throw new Error(`expected exactly one WP02 Tier 2 migration, found ${tier2Files.length}`);
  }
  return readFileSync(resolve(migDir, tier2Files[0]), "utf8");
})();

const tier1 = (() => {
  const f = readdirSync(migDir).find((n) => n.includes("rgkb_wp02_tier1"));
  if (!f) throw new Error("Tier 1 migration not found");
  return { name: f, text: readFileSync(resolve(migDir, f), "utf8") };
})();

// Executable SQL only — strip full-line SQL comments.
const exec = migration
  .split(/\r?\n/)
  .filter((l) => !l.trimStart().startsWith("--"))
  .join("\n");

// Executable SQL with string literals blanked: forbidden-identifier checks must
// run against code, not against prose that legitimately names the forbidden
// thing inside a RAISE message or a COMMENT.
const code = exec.replace(/'(?:[^']|'')*'/g, "''");

const PATTERN_A = [
  "knowledge_unit",
  "guardrail",
  "interpretation_rule",
  "construct_definition",
  "rights_decision",
  "instrument",
  "localized_governed_text",
  "validation_derivation_rule",
  "validation_applicability_matrix",
  "integrated_profile_architecture",
  "instrument_scale",
];

const PATTERN_B = [
  "evidence_anchor",
  "knowledge_unit_relation",
  "review_decision_event",
  "governance_audit_event",
  "governance_binding",
  "rights_document_anchor",
  "typed_evidence_link",
  "derivation_record",
];

// The nine families the accepted catalog specification leaves UNRESOLVED.
// Admitting any of them would exceed the Human Gate's 19-family scope.
const UNRESOLVED_FAMILIES = [
  "construct_scale_mapping",
  "cross_source_position",
  "cross_source_participating_position",
  "source_descriptor",
  "identity_determination",
  "external_identifier_attachment",
  "cross_source_validation",
  "knowledge_unit_version_construct",
  "reviewer",
  "contributor",
];

const seededRows = [...exec.matchAll(/^\s*\('([a-z_]+)', '([AB])'\)[,;]/gm)].map((m) => [m[1], m[2]]);

const tableBody = (table: string) => {
  const m = new RegExp(`CREATE TABLE IF NOT EXISTS rgkb\\.${table} \\(([\\s\\S]*?)\\n\\);`).exec(exec);
  if (!m) throw new Error(`table ${table} not found`);
  return m[1];
};

describe("WP02 Tier 2 — controlled catalog population", () => {
  it("seeds exactly 19 rows in a single INSERT", () => {
    expect((exec.match(/INSERT\s+INTO/gi) || []).length).toBe(1);
    expect(seededRows).toHaveLength(19);
  });

  it("seeds exactly the 11 Owner-approved Pattern A codes", () => {
    expect(seededRows.filter(([, p]) => p === "A").map(([s]) => s)).toEqual(PATTERN_A);
  });

  it("seeds exactly the 8 Owner-approved Pattern B codes", () => {
    expect(seededRows.filter(([, p]) => p === "B").map(([s]) => s)).toEqual(PATTERN_B);
  });

  it("admits no twentieth family, no alias and no _version subject type", () => {
    const codes = seededRows.map(([s]) => s);
    expect(new Set(codes).size).toBe(19);
    for (const c of codes) expect(c).not.toMatch(/_version$/);
  });

  it("admits none of the nine unresolved families", () => {
    const codes = seededRows.map(([s]) => s);
    for (const f of UNRESOLVED_FAMILIES) expect(codes).not.toContain(f);
  });

  it("refreezes the catalog against admission, reclassification and removal", () => {
    expect(exec).toMatch(/ERRCODE = 'RG030'/); // further admission
    expect(exec).toMatch(/ERRCODE = 'RG031'/); // in-place reclassification
    expect(exec).toMatch(/ERRCODE = 'RG032'/); // removal of accepted membership
    expect(exec).toMatch(
      /CREATE TRIGGER subject_type_catalog_frozen_guard\s+BEFORE INSERT OR UPDATE OR DELETE ON rgkb\.subject_type_catalog/,
    );
  });

  it("lifts FORCE RLS only for the seed and restores it immediately", () => {
    // FORCE + zero policies denies DML to the table owner too, so a role
    // without BYPASSRLS could not seed at all. The lift is bracketed and the
    // end state is identical to Tier 1's: RLS enabled AND forced.
    const noForce = exec.indexOf("ALTER TABLE rgkb.subject_type_catalog NO FORCE ROW LEVEL SECURITY;");
    const insert = exec.indexOf("INSERT INTO rgkb.subject_type_catalog");
    const reForce = exec.indexOf("ALTER TABLE rgkb.subject_type_catalog FORCE ROW LEVEL SECURITY;");
    expect(noForce).toBeGreaterThan(-1);
    expect(insert).toBeGreaterThan(noForce);
    expect(reForce).toBeGreaterThan(insert);
    expect((exec.match(/NO FORCE ROW LEVEL SECURITY/g) || []).length).toBe(1);
  });

  it("replaces the Tier 1 admission guard rather than editing Tier 1", () => {
    expect(exec).toMatch(/DROP TRIGGER IF EXISTS subject_type_catalog_write_guard ON rgkb\.subject_type_catalog;/);
    // The Tier 1 migration still carries its own guard, untouched.
    expect(tier1.text).toMatch(/ERRCODE = 'RG020'/);
  });
});

describe("WP02 Tier 2 — registry subject_type and DERIVED pattern", () => {
  it("adds both columns as NOT NULL", () => {
    expect(exec).toMatch(/ADD COLUMN IF NOT EXISTS subject_type text NOT NULL/);
    expect(exec).toMatch(/ADD COLUMN IF NOT EXISTS pattern text NOT NULL/);
  });

  it("derives pattern from the catalog by composite foreign key", () => {
    expect(exec).toMatch(
      /CONSTRAINT governed_instance_pattern_derives_from_catalog\s+FOREIGN KEY \(subject_type, pattern\)\s+REFERENCES rgkb\.subject_type_catalog \(subject_type, pattern\)/,
    );
    expect(exec).toMatch(
      /ADD CONSTRAINT subject_type_catalog_type_pattern_key UNIQUE \(subject_type, pattern\)/,
    );
  });

  it("never silently corrects a contradictory pattern — no derivation write-back", () => {
    // A trigger that ASSIGNED NEW.pattern from the catalog would be a silent
    // correction; the constraint rejects instead. `:=` is plpgsql assignment —
    // a bare `=` here is a comparison and is legitimate.
    expect(code).not.toMatch(/NEW\.pattern\s*:=/);
    expect(code).not.toMatch(/NEW\.subject_type\s*:=/);
  });

  it("introduces no second pattern truth store", () => {
    // pattern exists on the registry and in the catalog only.
    const patternColumns = [...code.matchAll(/^\s*pattern\s+text/gm)];
    expect(patternColumns).toHaveLength(0); // no member table declares its own pattern
    expect((code.match(/ADD COLUMN IF NOT EXISTS pattern text/g) || []).length).toBe(1);
  });

  it("keeps subject_type non-transferable after allocation", () => {
    expect(exec).toMatch(/ERRCODE = 'RG011'/);
    expect(exec).toMatch(
      /CREATE TRIGGER governed_instance_write_guard\s+BEFORE UPDATE OR DELETE ON rgkb\.governed_instance/,
    );
  });

  it("keeps registry rows non-deletable", () => {
    expect(exec).toMatch(/ERRCODE = 'RG012'/);
  });
});

describe("WP02 Tier 2 — Pattern A structural contract (11 families)", () => {
  it("creates a stable identity and a version table for each of the 11 families", () => {
    for (const f of PATTERN_A) {
      expect(exec).toMatch(new RegExp(`CREATE TABLE IF NOT EXISTS rgkb\\.${f} \\(`));
      expect(exec).toMatch(new RegExp(`CREATE TABLE IF NOT EXISTS rgkb\\.${f}_version \\(`));
    }
  });

  it("creates exactly 30 member tables and nothing else", () => {
    const tables = [...exec.matchAll(/CREATE TABLE IF NOT EXISTS rgkb\.([a-z0-9_]+)/g)].map((m) => m[1]);
    expect(tables).toHaveLength(30);
    expect(new Set(tables).size).toBe(30);
    const expected = [...PATTERN_A.flatMap((f) => [f, `${f}_version`]), ...PATTERN_B].sort();
    expect([...tables].sort()).toEqual(expected);
  });

  it("keeps the stable identity out of the registry — it carries no instance_id", () => {
    for (const f of PATTERN_A) {
      const body = tableBody(f);
      expect(body).toMatch(/object_id\s+uuid PRIMARY KEY DEFAULT gen_random_uuid\(\)/);
      expect(body).toMatch(/domain_code text NOT NULL/);
      expect(body).not.toMatch(/instance_id/);
      expect(body).not.toMatch(/version_sequence/);
    }
  });

  it("makes the governed version carry the registry instance_id as its own identity", () => {
    for (const f of PATTERN_A) {
      const body = tableBody(`${f}_version`);
      expect(body).toMatch(/instance_id\s+uuid PRIMARY KEY/);
      expect(body).toMatch(
        new RegExp(`FOREIGN KEY \\(instance_id, subject_type\\)\\s+REFERENCES rgkb\\.governed_instance \\(instance_id, subject_type\\)`),
      );
    }
  });

  it("binds each version to exactly one stable identity", () => {
    for (const f of PATTERN_A) {
      const body = tableBody(`${f}_version`);
      expect(body).toMatch(/object_id\s+uuid NOT NULL/);
      expect(body).toMatch(new RegExp(`FOREIGN KEY \\(object_id\\)\\s+REFERENCES rgkb\\.${f} \\(object_id\\)`));
    }
  });

  it("enforces (object_id, version_sequence) uniqueness for every family", () => {
    for (const f of PATTERN_A) {
      expect(tableBody(`${f}_version`)).toMatch(
        new RegExp(`CONSTRAINT ${f}_version_sequence_unique UNIQUE \\(object_id, version_sequence\\)`),
      );
    }
  });

  it("never uses version_sequence as identity, target or tie-break", () => {
    // Not a primary key anywhere, and nothing orders/compares by it.
    expect(code).not.toMatch(/version_sequence[^,\n]*PRIMARY KEY/);
    expect(code).not.toMatch(/ORDER\s+BY|\bLIMIT\b|\bDESC\b|\bMAX\s*\(|GREATEST/i);
    expect(code).not.toMatch(/REFERENCES[^;]*\(version_sequence\)/);
  });

  it("makes stable identities immutable and non-deletable", () => {
    expect(exec).toMatch(/ERRCODE = 'RG040'/);
    expect(exec).toMatch(/ERRCODE = 'RG041'/);
    for (const f of PATTERN_A) {
      expect(exec).toMatch(
        new RegExp(`CREATE TRIGGER ${f}_write_guard\\s+BEFORE UPDATE OR DELETE ON rgkb\\.${f}\\b`),
      );
    }
  });

  it("invents no domain_code allocation format or policy", () => {
    for (const f of PATTERN_A) {
      expect(tableBody(f)).not.toMatch(/CHECK\s*\(\s*domain_code/i);
      expect(tableBody(f)).not.toMatch(/domain_code[^,\n]*DEFAULT/i);
    }
  });

  it("invents no domain payload column on any Pattern A table", () => {
    for (const f of PATTERN_A) {
      const idCols = tableBody(f).split("\n").filter((l) => /^\s{2}[a-z]/.test(l));
      expect(idCols.map((l) => l.trim().split(/\s+/)[0])).toEqual(["object_id", "domain_code"]);
      const verCols = tableBody(`${f}_version`).split("\n").filter((l) => /^\s{2}[a-z]/.test(l));
      expect(verCols.map((l) => l.trim().split(/\s+/)[0])).toEqual([
        "instance_id",
        "subject_type",
        "object_id",
        "version_sequence",
      ]);
    }
  });
});

describe("WP02 Tier 2 — Pattern B structural contract (8 families)", () => {
  it("creates one record table per family, with instance_id as the exact identity", () => {
    for (const f of PATTERN_B) {
      const body = tableBody(f);
      expect(body).toMatch(/instance_id\s+uuid PRIMARY KEY/);
      expect(body).toMatch(
        /FOREIGN KEY \(instance_id, subject_type\)\s+REFERENCES rgkb\.governed_instance \(instance_id, subject_type\)/,
      );
    }
  });

  it("imposes no artificial stable-identity / version family", () => {
    for (const f of PATTERN_B) {
      expect(exec).not.toMatch(new RegExp(`CREATE TABLE IF NOT EXISTS rgkb\\.${f}_version`));
      const body = tableBody(f);
      expect(body).not.toMatch(/object_id/);
      expect(body).not.toMatch(/version_sequence/);
      expect(body).not.toMatch(/domain_code/);
    }
  });

  it("carries no second identity duplicating instance_id, and no invented payload", () => {
    for (const f of PATTERN_B) {
      const cols = tableBody(f).split("\n").filter((l) => /^\s{2}[a-z]/.test(l));
      expect(cols.map((l) => l.trim().split(/\s+/)[0])).toEqual(["instance_id", "subject_type"]);
    }
  });

  it("makes correction append-only — no in-place update, no deletion", () => {
    expect(exec).toMatch(/ERRCODE = 'RG050'/);
    expect(exec).toMatch(/ERRCODE = 'RG051'/);
    for (const f of PATTERN_B) {
      expect(exec).toMatch(
        new RegExp(`CREATE TRIGGER ${f}_write_guard\\s+BEFORE UPDATE OR DELETE ON rgkb\\.${f}\\b`),
      );
    }
  });
});

describe("WP02 Tier 2 — atomic registry / concrete-instance creation", () => {
  it("replaces the Tier 1 blanket registry INSERT block", () => {
    // Tier 1's RG010 refused every INSERT because no concrete family existed.
    expect(tier1.text).toMatch(/ERRCODE = 'RG010'/);
    expect(exec).not.toMatch(/RG010/);
    expect(exec).toMatch(/DROP TRIGGER IF EXISTS governed_instance_write_guard ON rgkb\.governed_instance;/);
  });

  it("enforces no-orphan-registry by a deferred constraint trigger", () => {
    expect(exec).toMatch(
      /CREATE CONSTRAINT TRIGGER governed_instance_membership_check\s+AFTER INSERT ON rgkb\.governed_instance\s+DEFERRABLE INITIALLY DEFERRED\s+FOR EACH ROW/,
    );
    expect(exec).toMatch(/ERRCODE = 'RG060'/);
    expect(exec).toMatch(/v_member_count <> 1/);
  });

  it("resolves the member table from the row's own subject_type and pattern", () => {
    expect(exec).toMatch(/v_member_table := NEW\.subject_type \|\| '_version'/);
    expect(exec).toMatch(/v_member_table := NEW\.subject_type;/);
    expect(exec).toMatch(/format\('SELECT count\(\*\) FROM rgkb\.%I WHERE instance_id = \$1', v_member_table\)/);
  });

  it("makes one instance_id structurally incapable of belonging to two families", () => {
    // Composite FK into UNIQUE (instance_id, subject_type) plus a per-table
    // CHECK pinning subject_type to that family's constant.
    expect(exec).toMatch(/ADD CONSTRAINT governed_instance_instance_subject_key UNIQUE \(instance_id, subject_type\)/);
    for (const f of [...PATTERN_A.map((x) => `${x}_version`), ...PATTERN_B]) {
      expect(exec).toMatch(new RegExp(`CONSTRAINT ${f}_subject_type_fixed CHECK \\(subject_type = '${f.replace(/_version$/, "")}'\\)`));
    }
  });

  it("uses no unconstrained subject_type + subject_id polymorphism", () => {
    expect(code).not.toMatch(/subject_id/);
  });
});

describe("WP02 Tier 2 — F-04 and F-07 remain OPEN", () => {
  it("does not touch the current-version resolver", () => {
    expect(exec).not.toMatch(/resolve_current_version/);
  });

  it("introduces no latest/current/default-version heuristic", () => {
    expect(code).not.toMatch(/is_current|current_version|latest|default_version|most_recent/i);
    expect(code).not.toMatch(/ORDER\s+BY|\bLIMIT\b|\bDESC\b/i);
  });

  it("implements no F-04 dependency re-binding machinery", () => {
    expect(code).not.toMatch(/re_?bind|affected_dependent|dependency_repair|repoint/i);
  });

  it("gives governance_binding only its Pattern B structural shell", () => {
    const cols = tableBody("governance_binding").split("\n").filter((l) => /^\s{2}[a-z]/.test(l));
    expect(cols.map((l) => l.trim().split(/\s+/)[0])).toEqual(["instance_id", "subject_type"]);
  });

  it("stores no lifecycle / approval / readiness / master-status field anywhere", () => {
    expect(code).not.toMatch(
      /is_approved|is_validated|is_active|master_status|lifecycle_state|readiness_score|approval_score|validation_score|runtime_available/i,
    );
  });
});

describe("WP02 Tier 2 — containment: no access model invented", () => {
  it("creates no RLS policy", () => {
    expect(exec).not.toMatch(/CREATE POLICY|ALTER POLICY|DROP POLICY/i);
  });

  it("grants nothing to any role", () => {
    expect(exec).not.toMatch(/\bGRANT\b/i);
  });

  it("enables and forces RLS on all 30 member tables", () => {
    for (const f of [...PATTERN_A.flatMap((x) => [x, `${x}_version`]), ...PATTERN_B]) {
      expect(exec).toMatch(new RegExp(`ALTER TABLE rgkb\\.${f} ENABLE ROW LEVEL SECURITY;`));
      expect(exec).toMatch(new RegExp(`ALTER TABLE rgkb\\.${f} FORCE ROW LEVEL SECURITY;`));
      expect(exec).toMatch(new RegExp(`REVOKE ALL ON TABLE rgkb\\.${f} FROM anon;`));
      expect(exec).toMatch(new RegExp(`REVOKE ALL ON TABLE rgkb\\.${f} FROM authenticated;`));
    }
  });

  it("uses no SECURITY DEFINER", () => {
    expect(exec).not.toMatch(/SECURITY DEFINER/i);
    expect((exec.match(/SECURITY INVOKER/g) || []).length).toBe(5);
  });

  it("touches no object in the public schema", () => {
    expect(code).not.toMatch(/\bpublic\./i);
  });

  it("alters no pre-existing table outside rgkb and drops nothing", () => {
    const alters = [...exec.matchAll(/ALTER TABLE ([a-z_.]+)/g)].map((m) => m[1]);
    for (const t of alters) expect(t).toMatch(/^rgkb\./);
    expect(exec).not.toMatch(/DROP TABLE|DROP SCHEMA|DROP COLUMN|ALTER COLUMN|TRUNCATE/i);
  });

  it("claims no verified live API-exposure status", () => {
    expect(migration).not.toMatch(/not[- ]API[- ]exposed|non-API-exposed/i);
    expect(migration).toMatch(/NOT verified|not verified/i);
  });
});

describe("WP02 Tier 2 — no later-Step domain semantics", () => {
  it("introduces no Step 2–7 semantic vocabulary", () => {
    expect(code).not.toMatch(
      /locator|excerpt|fingerprint|epistemic|claim_taxonomy|disposition|orchestration|consent|safeguard|purpose|assent|uncertainty|discrepan/i,
    );
  });

  it("adds no column beyond the Step 1 identity/version attributes", () => {
    // Scan the CREATE TABLE bodies only — a global scan would also pick up
    // plpgsql DECLARE variables, which are not columns.
    const cols = [...PATTERN_A.flatMap((f) => [f, `${f}_version`]), ...PATTERN_B].flatMap((t) =>
      tableBody(t)
        .split("\n")
        .filter((l) => /^\s{2}[a-z]/.test(l))
        .map((l) => l.trim().split(/\s+/)[0]),
    );
    expect(new Set(cols)).toEqual(
      new Set(["object_id", "domain_code", "instance_id", "subject_type", "version_sequence"]),
    );
  });

  it("is a single narrow additive migration", () => {
    expect(tier2Files).toHaveLength(1);
    expect(tier2Files[0]).toMatch(/^\d{14}_rgkb_wp02_tier2_governed_family_substrate\.sql$/);
  });

  it("uses only single-line string literals, like every other migration", () => {
    expect(exec).not.toMatch(/'[ \t]*\r?\n[ \t]*'/);
  });
});

describe("WP02 Tier 2 — DEFERRED-BY-DESIGN (cannot be truthfully executed yet)", () => {
  it.todo(
    "runtime: RG030/031/032, RG040/041, RG050/051, RG011/012 and the deferred RG060 membership check actually raise in Postgres — DEFERRED: requires a disposable Postgres; no production or remote Supabase execution is authorized",
  );
  it.todo(
    "runtime: a bare governed_instance INSERT is accepted by the statement and refused at COMMIT — DEFERRED: same dependency; the deferred-constraint semantics can only be observed in a live transaction",
  );
  it.todo(
    "structural: version_sequence is strictly monotonic within its owning object_id — DEFERRED: enforcing more than (object_id, version_sequence) uniqueness requires reading existing rows, which FORCE ROW LEVEL SECURITY makes unreliable, and the governed write boundary that would own this check is itself deferred by Step 1 §11.5",
  );
  it.todo(
    "structural: domain_code is never reused across the lifetime of a family — DEFERRED: uniqueness plus non-deletion prevents reuse while rows persist, but a retired-code ledger would require the allocation authority Step 1 §3.3 defers",
  );
  it.todo(
    "verification: live Supabase API-exposed schema list excludes rgkb — DEFERRED: requires a remote Supabase check, which is not authorized",
  );
});
