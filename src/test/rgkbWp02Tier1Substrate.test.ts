import { describe, it, expect } from "vitest";
import { readFileSync, readdirSync } from "node:fs";
import { resolve } from "node:path";

// PRM-WP02 Tier 1 structural regression tests.
//
// These are dependency-free structural assertions over the migration text, in
// the same style as the PF-012 / PF-013 governance tests. Real database
// behaviour (that RG003 actually raises, that the write guards actually
// refuse) must be validated at runtime against a disposable Postgres —
// recorded below as DEFERRED-BY-DESIGN, not claimed here.
//
// What these tests protect is the governance shape: that Tier 2 stays blocked,
// that F-04/F-07 stay open, that no subject type is invented, that no stored
// master-state column appears, and that no tie-break heuristic creeps into the
// resolver.

const root = process.cwd();
const migDir = resolve(root, "supabase/migrations");

const migrationFiles = readdirSync(migDir).filter((n) => n.includes("rgkb_wp02_tier1"));

const migration = (() => {
  if (migrationFiles.length !== 1) {
    throw new Error(`expected exactly one WP02 Tier 1 migration, found ${migrationFiles.length}`);
  }
  return readFileSync(resolve(migDir, migrationFiles[0]), "utf8");
})();

// Executable SQL only — strip full-line SQL comments so assertions never match
// the explanatory header or the rollback block.
const exec = migration
  .split(/\r?\n/)
  .filter((l) => !l.trimStart().startsWith("--"))
  .join("\n");

// Executable SQL with every string literal blanked. COMMENT ON bodies and
// RAISE EXCEPTION messages are prose; forbidden-identifier assertions must run
// against code, not against prose that legitimately names the forbidden thing.
const code = exec.replace(/'(?:[^']|'')*'/g, "''");

const tableBody = (table: string) => {
  const m = new RegExp(`CREATE TABLE IF NOT EXISTS rgkb\\.${table} \\(([\\s\\S]*?)\\n\\);`).exec(exec);
  if (!m) throw new Error(`table ${table} not found`);
  return m[1];
};

const resolverBody = (() => {
  const m = /CREATE OR REPLACE FUNCTION rgkb\.resolve_current_version\(([\s\S]*?)\$\$;/.exec(exec);
  if (!m) throw new Error("resolve_current_version not found");
  return m[1];
})();

const wp02Doc = readFileSync(
  resolve(root, "docs/rgkb/remediation/RGKB_PRM_WP02_Governed_Object_Runtime_Architecture_Proposal_v0.1.md"),
  "utf8",
);

// Tier 2 identifiers that must not appear anywhere in executable code.
const TIER2_IDENTIFIERS = ["object_id", "domain_code", "version_sequence"];

// The six live assessment families. None of them may be admitted to, or even
// named by, the catalog substrate — classifying them is Tier 2 work.
const ASSESSMENT_FAMILIES = /riasec|big[_ ]?five|caas|adapt[- ]?abilit|emotional[_ ]?intelligence|\beq\b|employab|work[_ ]?values/i;

describe("WP02 Tier 1 — governed_instance registry shape", () => {
  it("creates the registry in the dedicated rgkb containment schema, outside public", () => {
    expect(exec).toMatch(/CREATE SCHEMA IF NOT EXISTS rgkb;/);
    expect(exec).toMatch(/CREATE TABLE IF NOT EXISTS rgkb\.governed_instance \(/);
  });

  it("allocates instance_id via the repository's opaque UUID mechanism", () => {
    expect(tableBody("governed_instance")).toMatch(
      /instance_id uuid PRIMARY KEY DEFAULT gen_random_uuid\(\)/,
    );
  });

  it("carries instance_id and nothing else", () => {
    const columns = tableBody("governed_instance")
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean);
    expect(columns).toHaveLength(1);
    expect(columns[0]).toMatch(/^instance_id\b/);
  });

  it("declares no Tier 2 identity/classification column", () => {
    const body = tableBody("governed_instance");
    expect(body).not.toMatch(/subject_type/);
    expect(body).not.toMatch(/pattern/);
    for (const id of TIER2_IDENTIFIERS) expect(body).not.toMatch(new RegExp(id));
  });

  it("stores no lifecycle / approval / readiness / master-status field (Step 1 §2.1)", () => {
    expect(code).not.toMatch(
      /is_current|master_status|lifecycle_state|readiness_score|approval_score|validation_score|runtime_available|is_approved|is_validated|is_active/i,
    );
  });

  it("stores no timestamp that could become a recency tie-break (Step 1 §9.4)", () => {
    expect(tableBody("governed_instance")).not.toMatch(/created_at|timestamp|now\(\)/i);
  });
});

describe("WP02 Tier 1 — subject-type catalog substrate", () => {
  it("creates the substrate shape subject_type -> pattern", () => {
    const body = tableBody("subject_type_catalog");
    expect(body).toMatch(/subject_type text PRIMARY KEY/);
    expect(body).toMatch(/pattern\s+text NOT NULL/);
  });

  it("structurally limits the pattern vocabulary to A and B", () => {
    expect(tableBody("subject_type_catalog")).toMatch(
      /CHECK \(pattern IN \('A', 'B'\)\)/,
    );
  });

  it("populates ZERO subject-type rows", () => {
    expect(exec).not.toMatch(/INSERT\s+INTO/i);
    expect(exec).not.toMatch(/\bCOPY\b/i);
    expect(exec).not.toMatch(/\bTRUNCATE\b/i);
    expect(exec).not.toMatch(/\bDELETE\s+FROM\b/i);
  });

  it("introduces no seed, placeholder or default subject type", () => {
    const body = tableBody("subject_type_catalog");
    expect(body).not.toMatch(/DEFAULT/i);
    expect(code).not.toMatch(/placeholder|sample_|example_|tbd|todo_/i);
  });

  it("classifies none of the six live assessment families", () => {
    expect(code).not.toMatch(ASSESSMENT_FAMILIES);
  });

  it("refuses admission while no controlled catalog specification exists (§2.5)", () => {
    expect(exec).toMatch(/ERRCODE = 'RG020'/);
    expect(exec).toMatch(
      /CREATE TRIGGER subject_type_catalog_write_guard\s+BEFORE INSERT OR UPDATE OR DELETE ON rgkb\.subject_type_catalog/,
    );
  });

  it("refuses in-place reclassification of a family (§2.5 change control)", () => {
    expect(exec).toMatch(/ERRCODE = 'RG021'/);
  });
});

describe("WP02 Tier 1 — registry atomicity held fail-closed, not weakened", () => {
  it("refuses registry INSERT because no concrete governed instance can exist yet (§11.5)", () => {
    expect(exec).toMatch(/ERRCODE = 'RG010'/);
    expect(exec).toMatch(
      /CREATE TRIGGER governed_instance_write_guard\s+BEFORE INSERT OR UPDATE OR DELETE ON rgkb\.governed_instance/,
    );
  });

  it("refuses registry UPDATE — instance_id is never reused or transferred (§3.2)", () => {
    expect(exec).toMatch(/ERRCODE = 'RG011'/);
  });

  it("refuses registry DELETE — a registry entry must not be removed (§5.3)", () => {
    expect(exec).toMatch(/ERRCODE = 'RG012'/);
  });

  it("creates no concrete Pattern A or Pattern B member table", () => {
    const tables = [...exec.matchAll(/CREATE TABLE IF NOT EXISTS ([a-z_.]+)/g)].map((m) => m[1]);
    expect(tables).toEqual(["rgkb.governed_instance", "rgkb.subject_type_catalog"]);
  });
});

describe("WP02 Tier 1 — current-version resolution skeleton (F-07 stays OPEN)", () => {
  it("is a derived function, never a stored boolean (§9.2)", () => {
    expect(exec).toMatch(
      /CREATE OR REPLACE FUNCTION rgkb\.resolve_current_version\(\)\s*RETURNS uuid/,
    );
  });

  it("accepts no caller-supplied candidate set", () => {
    // Step 1 §9.4 fixes cardinality within one stable identity and one
    // resolution scope, over ELIGIBLE versions. None of those three can be
    // derived at Tier 1, so a caller-supplied array must not be accepted and
    // then counted as if it were the eligible-version set.
    // Assert against code, not prose: the RAISE message legitimately explains
    // that no caller-supplied candidate set may stand in for the eligible set.
    const resolverCode = resolverBody.replace(/'(?:[^']|'')*'/g, "''");
    expect(exec).not.toMatch(/resolve_current_version\([^)]*\w/);
    expect(resolverCode).not.toMatch(/array_length|cardinality\s*\(|candidate|uuid\[\]/i);
  });

  it("fails closed because the predicate is not evaluable (§9.3, §10.3)", () => {
    expect(resolverBody).toMatch(/ERRCODE = 'RG003'/);
  });

  it("claims no executable cardinality enforcement (§10.1 / §10.2 codes absent)", () => {
    expect(exec).not.toMatch(/RG001|RG002/);
  });

  it("applies no recency / priority / ordering / version_sequence tie-break (§9.4)", () => {
    const resolverCode = resolverBody.replace(/'(?:[^']|'')*'/g, "''");
    expect(resolverCode).not.toMatch(/ORDER\s+BY|\bLIMIT\b|\bDESC\b|\bMAX\s*\(|GREATEST|DISTINCT/i);
    expect(resolverCode).not.toMatch(/version_sequence|created_at|priority|\bnow\(\)/i);
  });

  it("never returns a value — absence of evidence is not permission (§1.3, §10.3)", () => {
    // `RETURNS uuid` in the signature is not a RETURN statement; \b...\b keeps
    // them distinct. No execution path may hand back a resolved instance.
    expect(resolverBody).not.toMatch(/\bRETURN\b/);
  });

  it("does not claim to close F-07 and names its still-missing inputs", () => {
    expect(exec).toMatch(/F-07\s+remains OPEN|Does NOT close F-07/);
    expect(migration).toMatch(/F-10/);
    expect(migration).toMatch(/F-13/);
    expect(migration).toMatch(/resolution-scope vocabulary/);
    expect(migration).toMatch(/stable-identity runtime substrate/);
  });
});

describe("WP02 Tier 1 — Step 1 §9.4/§10 logical rules recorded, not runtime-claimed", () => {
  // These rules are fixed by Step 1 now. Tier 1 does not yet enforce them at
  // runtime (no identity/scope/eligibility substrate), so they are locked as
  // documented requirements rather than manufactured from caller input.
  const rules: Array<[string, RegExp]> = [
    ["zero eligible fails closed", /zero eligible\s*\n?--\s*fails closed|zero eligible[\s\S]{0,40}fails closed/i],
    ["exactly one is the only potentially resolvable cardinality", /exactly one eligible is the only potentially\s*\n--\s*resolvable cardinality/i],
    ["multiple eligible is a governance fault", /more than one eligible is a governance\s*\n--\s*fault/i],
    ["no tie-break is ever authorized", /no recency, priority, ordering or `version_sequence`\s*\n--\s*tie-break is ever authorized/i],
  ];
  for (const [name, re] of rules) {
    it(`records that ${name} (§9.4/§10.1/§10.2)`, () => {
      expect(migration).toMatch(re);
    });
  }

  it("states plainly that runtime cardinality enforcement is deferred", () => {
    expect(migration).toMatch(/DEFERRED-BY-DESIGN until the/);
    expect(migration).toMatch(/does not yet\s*\n--\s*RUNTIME-ENFORCE them/);
  });
});

describe("WP02 Tier 1 — Tier 2 block and F-04 lock", () => {
  it("defines no Tier 2 identifier anywhere in executable SQL", () => {
    for (const id of TIER2_IDENTIFIERS) {
      expect(code).not.toMatch(new RegExp(id));
    }
  });

  it("adds no governed_instance.subject_type / .pattern column", () => {
    expect(code).not.toMatch(/ALTER TABLE\s+rgkb\.governed_instance\s+ADD/i);
  });

  it("implements no F-04 dependency re-binding machinery", () => {
    expect(code).not.toMatch(/re_?bind|binding_family|binding_set|affected_dependent/i);
  });

  it("keeps the accepted WP02 artifact's Tier 2 block and F-04/F-07 status intact", () => {
    expect(wp02Doc).toMatch(/\*\*BLOCKED\*\*/);
    expect(wp02Doc).toMatch(/F-04 treatment[\s\S]{0,80}remains OPEN/);
    expect(wp02Doc).toMatch(/F-07 treatment[\s\S]{0,80}remains OPEN/);
  });
});

describe("WP02 Tier 1 — containment: no access model invented, nothing existing touched", () => {
  it("invents no RLS policy", () => {
    expect(exec).not.toMatch(/CREATE POLICY|ALTER POLICY|DROP POLICY/i);
  });

  it("grants nothing to any role — containment is REVOKE-only", () => {
    expect(exec).not.toMatch(/\bGRANT\b/i);
    expect(exec).toMatch(/REVOKE ALL ON TABLE rgkb\.governed_instance FROM anon/);
    expect(exec).toMatch(/REVOKE ALL ON TABLE rgkb\.subject_type_catalog FROM anon/);
    expect(exec).toMatch(/REVOKE ALL ON FUNCTION rgkb\.resolve_current_version\(\) FROM anon/);
  });

  it("does not assert the live schema is API-unexposed — that was never verified", () => {
    // Schema placement is an intended containment layer. The live Supabase
    // exposed-schema configuration was not remotely checked, and no remote
    // check is authorized, so the migration must not claim it as fact.
    expect(migration).not.toMatch(/not[- ]API[- ]exposed|non-API-exposed|is not in the API-exposed/i);
    expect(migration).toMatch(/NOT VERIFIED/);
    expect(migration).toMatch(/intended containment layer/i);
  });

  it("enables row level security on both substrate tables (deny-all, zero policies)", () => {
    expect(exec).toMatch(/ALTER TABLE rgkb\.governed_instance ENABLE ROW LEVEL SECURITY/);
    expect(exec).toMatch(/ALTER TABLE rgkb\.subject_type_catalog ENABLE ROW LEVEL SECURITY/);
  });

  it("uses no SECURITY DEFINER", () => {
    expect(exec).not.toMatch(/SECURITY DEFINER/i);
    expect((exec.match(/SECURITY INVOKER/g) || []).length).toBe(3);
  });

  it("touches no object in the public schema", () => {
    expect(code).not.toMatch(/\bpublic\./i);
  });

  it("alters no pre-existing table and drops nothing in executable SQL", () => {
    const alters = [...exec.matchAll(/ALTER TABLE ([a-z_.]+)/g)].map((m) => m[1]);
    expect(alters.length).toBeGreaterThan(0);
    for (const t of alters) expect(t).toMatch(/^rgkb\./);
    expect(exec).not.toMatch(/DROP TABLE|DROP SCHEMA|DROP COLUMN|ALTER COLUMN/i);
  });

  it("uses only single-line string literals, like every other migration", () => {
    // Newline-continued literals appear nowhere else in supabase/migrations and
    // could not be verified locally (no database is available to this change).
    // A RAISE format must be a literal, so a parse failure here would only
    // surface at apply time.
    expect(exec).not.toMatch(/'[ \t]*\r?\n[ \t]*'/);
  });

  it("is a single narrow migration, and only the WP02 migrations reference rgkb", () => {
    // ADAPTED WHEN TIER 2 LANDED (PRM-WP02 Tier 2 Human Gate, 2026-08-25).
    // This assertion runs against the whole repository, not against the Tier 1
    // file. It originally read `expect(touching).toEqual(migrationFiles)` —
    // i.e. Tier 1 was the ONLY migration referencing rgkb — which was true and
    // worth locking while Tier 2 was BLOCKED. Tier 2 is now Owner-authorized
    // and legitimately references rgkb, so that form is factually obsolete.
    // The smallest change that keeps the guard meaningful: Tier 1 is still
    // exactly one migration, and the set of migrations touching rgkb is still
    // closed — only the two authorized WP02 migrations, nothing else.
    // No Tier 1 implementation history is rewritten by this change.
    expect(migrationFiles).toHaveLength(1);
    const touching = readdirSync(migDir).filter(
      (n) => n.endsWith(".sql") && /\brgkb\b/i.test(readFileSync(resolve(migDir, n), "utf8")),
    );
    expect(touching.filter((n) => !/rgkb_wp02_tier[12]/.test(n))).toEqual([]);
    expect(touching).toContain(migrationFiles[0]);
  });
});

describe("WP02 Tier 1 — DEFERRED-BY-DESIGN (cannot be truthfully executed yet)", () => {
  it.todo(
    "positive: instance_id is allocated atomically with its concrete governed instance — DEFERRED: requires a Tier 2 concrete member table (WP02 §5.2.2)",
  );
  it.todo(
    "negative: a pattern value mismatching the catalog assignment is rejected as a fault — DEFERRED: requires governed_instance.pattern (Tier 2, WP02 §5.2.1) and a populated catalog (Step 1 §14.5)",
  );
  it.todo(
    "negative: a stale / superseded exact-instance reference is rejected — DEFERRED: requires Tier 2 Pattern A version tables (Master Plan PRM-WP02 negative evidence)",
  );
  it.todo(
    "runtime: RG003 and both write guards actually raise in Postgres — DEFERRED: requires a disposable Postgres; no production or remote Supabase execution is authorized",
  );
  it.todo(
    "negative: zero eligible versions within one stable identity and one resolution scope fails closed (Step 1 §10.1) — DEFERRED: requires a Pattern A stable-identity runtime substrate (Tier 2), a resolution-scope vocabulary (Step 1 §14.5) and the eligibility predicate (F-10/F-13/rights); a caller-supplied uuid[] is not evidence of that set",
  );
  it.todo(
    "negative: more than one eligible version raises a governance fault with no tie-break (Step 1 §10.2/§9.4) — DEFERRED: same identity/scope/eligibility substrate dependency as above",
  );
  it.todo(
    "verification: live Supabase API-exposed schema list excludes rgkb — DEFERRED: requires a remote Supabase check, which is not authorized; REVOKE + deny-all RLS are the locally evidenced controls",
  );
});
