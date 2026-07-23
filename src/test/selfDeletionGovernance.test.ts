import { describe, it, expect } from "vitest";
import { readFileSync, readdirSync } from "node:fs";
import { resolve } from "node:path";

// PF-013 structural regression tests. Real DB EXECUTE-privilege behavior must be
// validated at runtime against a disposable Postgres (synthetic users) — see
// docs/professional-audit/remediation-phase-2c/01-preview-and-production-verification.md.
// These assertions guard against the self-deletion RPC becoming client-executable
// again, and against this containment migration silently broadening privileges or
// touching assessment RLS / scoring.

const root = process.cwd();
const migDir = resolve(root, "supabase/migrations");
const migration = (() => {
  const f = readdirSync(migDir).find((n) => n.includes("govern_self_deletion_rpc"));
  if (!f) throw new Error("PF-013 migration not found");
  return readFileSync(resolve(migDir, f), "utf8");
})();

// Executable SQL only (strip full-line SQL comments) so assertions never match
// explanatory prose in the header/rollback comments.
const exec = migration
  .split(/\r?\n/)
  .filter((l) => !l.trimStart().startsWith("--"))
  .join("\n");

const SIG = "public\\.request_self_deletion\\(\\)";

// Every source file that could reference the self-deletion RPC.
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

describe("PF-013 migration — revokes client EXECUTE on request_self_deletion", () => {
  it("targets the exact zero-argument function signature", () => {
    expect(exec).toMatch(new RegExp(`ON FUNCTION ${SIG}`));
    // No arbitrary-argument overload is referenced.
    expect(exec).not.toMatch(/request_self_deletion\s*\([^)]*\w/);
  });

  it("revokes EXECUTE from PUBLIC", () => {
    expect(exec).toMatch(new RegExp(`REVOKE EXECUTE ON FUNCTION ${SIG} FROM PUBLIC`, "i"));
  });

  it("revokes EXECUTE from anon", () => {
    expect(exec).toMatch(new RegExp(`REVOKE EXECUTE ON FUNCTION ${SIG} FROM anon`, "i"));
  });

  it("revokes EXECUTE from authenticated", () => {
    expect(exec).toMatch(new RegExp(`REVOKE EXECUTE ON FUNCTION ${SIG} FROM authenticated`, "i"));
  });
});

describe("PF-013 migration — scope discipline (no privilege broadening or unrelated change)", () => {
  it("does not GRANT EXECUTE to any client role", () => {
    expect(exec).not.toMatch(/GRANT\s+EXECUTE/i);
  });

  it("only touches the request_self_deletion function's privileges", () => {
    const stmts = exec.match(/\b(REVOKE|GRANT)\b[^;]*;/gi) || [];
    expect(stmts.length).toBeGreaterThan(0);
    for (const s of stmts) {
      expect(s).toMatch(/request_self_deletion/);
    }
    // Must not touch the other governed deletion / cycle RPCs.
    expect(exec).not.toMatch(/delete_user/);
    expect(exec).not.toMatch(/start_new_assessment_cycle/);
  });

  it("does not modify the function body, any policy, trigger, or scoring", () => {
    expect(exec).not.toMatch(/CREATE (OR REPLACE )?FUNCTION/i);
    expect(exec).not.toMatch(/CREATE POLICY|DROP POLICY|ALTER POLICY/i);
    expect(exec).not.toMatch(/FOR (SELECT|INSERT|UPDATE|DELETE)/i);
    expect(exec).not.toMatch(/CREATE TRIGGER|ALTER TABLE/i);
  });
});

describe("PF-013 app surface — no client caller of the self-deletion RPC", () => {
  it("no source file invokes rpc('request_self_deletion')", () => {
    const offenders: string[] = [];
    for (const { p, text } of srcFiles) {
      if (/\.rpc\(\s*["'`]request_self_deletion["'`]/.test(text)) offenders.push(p);
    }
    expect(offenders).toEqual([]);
  });
});
