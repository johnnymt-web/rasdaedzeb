import { describe, it, expect } from "vitest";
import { readFileSync, readdirSync } from "node:fs";
import { resolve } from "node:path";

// PF-012 structural regression tests. Real DB DELETE behavior must be validated
// at runtime against a disposable Postgres (synthetic users) — see
// docs/professional-audit/remediation-phase-2b/01-preview-and-production-verification.md.
// These assertions guard against the client-delete protection being removed or
// the unsafe "Delete own ..." policies being reintroduced in the repository.

const root = process.cwd();
const migDir = resolve(root, "supabase/migrations");
const migration = (() => {
  const f = readdirSync(migDir).find((n) => n.includes("block_assessment_history_deletion"));
  if (!f) throw new Error("PF-012 migration not found");
  return readFileSync(resolve(migDir, f), "utf8");
})();

const ASSESSMENT_TABLES = [
  "assessments",
  "big_five_assessments",
  "caas_assessments",
  "work_values_assessments",
];

// Every source file that could contain a client delete of assessment data.
const srcFiles = (() => {
  const out: string[] = [];
  const walk = (dir: string) => {
    for (const e of readdirSync(dir, { withFileTypes: true })) {
      const p = resolve(dir, e.name);
      if (e.isDirectory()) walk(p);
      else if (/\.(ts|tsx)$/.test(e.name)) out.push(p);
    }
  };
  walk(resolve(root, "src"));
  return out.map((p) => ({ p, text: readFileSync(p, "utf8") }));
})();

describe("PF-012 migration — removes unsafe student DELETE policies", () => {
  it("drops the three ownership-based DELETE policies", () => {
    expect(migration).toMatch(/DROP POLICY IF EXISTS "Delete own assessments" ON public\.assessments/);
    expect(migration).toMatch(/DROP POLICY IF EXISTS "Delete own big_five"\s+ON public\.big_five_assessments/);
    expect(migration).toMatch(/DROP POLICY IF EXISTS "Delete own caas"\s+ON public\.caas_assessments/);
  });
});

describe("PF-012 migration — explicit restrictive deny of client DELETE on all assessment tables", () => {
  for (const t of ASSESSMENT_TABLES) {
    it(`denies client DELETE on ${t} via a RESTRICTIVE ... USING (false) policy`, () => {
      const re = new RegExp(
        `CREATE POLICY "No client delete of [a-z_]+"\\s+ON public\\.${t} AS RESTRICTIVE FOR DELETE TO public USING \\(false\\)`,
      );
      expect(migration).toMatch(re);
    });
  }
});

describe("PF-012 migration — scope discipline", () => {
  it("does not create or drop any SELECT / INSERT / UPDATE policy", () => {
    expect(migration).not.toMatch(/FOR (SELECT|INSERT|UPDATE)/i);
    // The only DROP POLICY lines target DELETE policies (unsafe ones + our own).
    const drops = migration.match(/DROP POLICY[^\n;]*/gi) || [];
    for (const d of drops) {
      expect(d).toMatch(/Delete own|No client delete/);
    }
  });

  it("does not alter scoring, triggers, or grants", () => {
    expect(migration).not.toMatch(/CREATE (OR REPLACE )?FUNCTION/i);
    expect(migration).not.toMatch(/CREATE TRIGGER/i);
    expect(migration).not.toMatch(/GRANT|REVOKE/i);
  });
});

describe("PF-012 app surface — no client delete of assessment data", () => {
  it("no source file issues a .delete() on an assessment table", () => {
    const offenders: string[] = [];
    for (const { p, text } of srcFiles) {
      for (const t of ASSESSMENT_TABLES) {
        const re = new RegExp(`from\\(\\s*["'\`]${t}["'\`]\\s*\\)[\\s\\S]{0,120}?\\.delete\\(`);
        if (re.test(text)) offenders.push(`${p} (${t})`);
      }
    }
    expect(offenders).toEqual([]);
  });
});
