import { describe, it, expect } from "vitest";
import { readFileSync, readdirSync } from "node:fs";
import { resolve } from "node:path";

// PF-011 structural regression tests. The actual DB-trigger behavior must be
// validated at runtime against a disposable Postgres (synthetic users) — see
// docs/professional-audit/remediation-phase-2a/01-production-verification-checklist.md.
// These assertions guard against the protection or its trusted retake path being
// silently removed from the repository.

const root = process.cwd();
const migDir = resolve(root, "supabase/migrations");
const migration = (() => {
  const f = readdirSync(migDir).find((n) => n.includes("protect_controlled_profile_fields"));
  if (!f) throw new Error("PF-011 migration not found");
  return readFileSync(resolve(migDir, f), "utf8");
})();
const assessmentHistory = readFileSync(resolve(root, "src/pages/AssessmentHistory.tsx"), "utf8");

describe("PF-011 migration — DB-enforced protection of controlled profile fields", () => {
  it("defines a BEFORE UPDATE trigger on public.profiles", () => {
    expect(migration).toMatch(/BEFORE UPDATE\s+ON public\.profiles/i);
  });

  it("guards grade with IS DISTINCT FROM (null-safe) and rejects unauthorized changes", () => {
    expect(migration).toMatch(/NEW\.grade IS DISTINCT FROM OLD\.grade/i);
    expect(migration).toMatch(/Not authorized to change grade/i);
  });

  it("guards current_assessment_cycle with IS DISTINCT FROM and rejects unauthorized changes", () => {
    expect(migration).toMatch(/NEW\.current_assessment_cycle IS DISTINCT FROM OLD\.current_assessment_cycle/i);
    expect(migration).toMatch(/Not authorized to change the assessment cycle/i);
  });

  it("bases authorization on trusted role helpers, not client-supplied claims", () => {
    expect(migration).toMatch(/has_role\(auth\.uid\(\)/);
    expect(migration).toMatch(/is_school_admin_for_user\(OLD\.id\)/);
    // Must not trust raw_user_meta_data for authorization.
    expect(migration).not.toMatch(/raw_user_meta_data/);
  });

  it("runs SECURITY DEFINER with a pinned search_path", () => {
    expect(migration).toMatch(/SECURITY DEFINER/);
    expect(migration).toMatch(/SET search_path = public/);
  });

  it("preserves the existing school_id protection", () => {
    expect(migration).toMatch(/NEW\.school_id IS DISTINCT FROM OLD\.school_id/i);
  });

  it("does not add any INSERT/UPDATE/DELETE grant or write policy", () => {
    expect(migration).not.toMatch(/CREATE POLICY/i);
    expect(migration).not.toMatch(/FOR (INSERT|UPDATE|DELETE)/i);
  });

  it("provides the trusted retake RPC executable only by authenticated users", () => {
    expect(migration).toMatch(/FUNCTION public\.start_new_assessment_cycle\(\)/);
    expect(migration).toMatch(/current_assessment_cycle = COALESCE\(current_assessment_cycle, 1\) \+ 1/);
    expect(migration).toMatch(/REVOKE ALL ON FUNCTION public\.start_new_assessment_cycle\(\) FROM public/);
    expect(migration).toMatch(/GRANT EXECUTE ON FUNCTION public\.start_new_assessment_cycle\(\) TO authenticated/);
    expect(migration).toMatch(/set_config\('app\.cycle_update_ok', 'on', true\)/);
  });

  it("binds the cycle bypass flag to the authenticated profile owner (not flag alone)", () => {
    // The flag must be paired with OLD.id = auth.uid() so it can never authorize
    // a change to another row even if the GUC were somehow set.
    expect(migration).toMatch(/app\.cycle_update_ok['"\s,)]*true\)\s*=\s*'on'\s*AND\s*OLD\.id\s*=\s*auth\.uid\(\)/);
  });
});

describe("PF-011 app change — retake uses the trusted RPC, not a direct cycle UPDATE", () => {
  it("calls start_new_assessment_cycle via rpc", () => {
    expect(assessmentHistory).toMatch(/rpc\(\s*["']start_new_assessment_cycle["']\s*\)/);
  });

  it("no longer issues a direct client update of current_assessment_cycle", () => {
    expect(assessmentHistory).not.toMatch(/\.update\(\s*\{\s*current_assessment_cycle/);
  });
});
