import { describe, it, expect } from "vitest";
import { readFileSync, readdirSync } from "node:fs";
import { resolve } from "node:path";

// PF-007 structural regression tests. Real RLS/RPC/audit behavior must be
// validated at runtime against a disposable Postgres (synthetic users) — see
// docs/professional-audit/remediation-phase-2d/02-preview-and-production-verification.md.
// These assertions guard the audited superadmin read boundary: the five direct
// SELECT policies stay removed, the RPCs stay superadmin-gated + audited, the
// audit metadata never carries the psychometric payload, and the privileged
// screens never read the protected tables directly again.

const root = process.cwd();
const migDir = resolve(root, "supabase/migrations");
const migration = (() => {
  const f = readdirSync(migDir).find((n) => n.includes("audited_superadmin_read_boundary"));
  if (!f) throw new Error("PF-007 migration not found");
  return readFileSync(resolve(migDir, f), "utf8");
})();

const PROTECTED_TABLES = [
  "profiles",
  "assessments",
  "big_five_assessments",
  "caas_assessments",
  "work_values_assessments",
];

const READ_RPCS = [
  "superadmin_list_students",
  "superadmin_get_student_profile",
  "superadmin_get_student_report_bundle",
  "superadmin_platform_counts",
];

// Per-function bodies (from CREATE OR REPLACE FUNCTION to the $$ ; terminator).
const fnBody = (name: string) => {
  const m = migration.match(new RegExp(`CREATE OR REPLACE FUNCTION public\\.${name}\\b[\\s\\S]*?\\$\\$;`));
  if (!m) throw new Error(`function body not found: ${name}`);
  return m[0];
};

describe("PF-007 migration — removes the five direct superadmin SELECT policies", () => {
  const dropped = [
    ['Superadmin select all profiles', 'profiles'],
    ['Superadmin select all assessments', 'assessments'],
    ['Superadmin select all big_five', 'big_five_assessments'],
    ['Superadmin select all caas', 'caas_assessments'],
    ['Superadmin select all work_values', 'work_values_assessments'],
  ] as const;
  for (const [name, table] of dropped) {
    it(`drops "${name}" on ${table}`, () => {
      expect(migration).toMatch(new RegExp(`DROP POLICY IF EXISTS "${name}"\\s+ON public\\.${table}`));
    });
  }

  it("drops ONLY superadmin SELECT policies (no ordinary scoped policy removed)", () => {
    const drops = migration.match(/DROP POLICY[^\n;]*/gi) || [];
    expect(drops.length).toBe(5);
    for (const d of drops) expect(d).toMatch(/Superadmin select all/);
  });

  it("creates no new policy and touches no RLS predicate", () => {
    expect(migration).not.toMatch(/CREATE POLICY|ALTER POLICY/i);
    expect(migration).not.toMatch(/FOR (SELECT|INSERT|UPDATE|DELETE)/i);
  });
});

describe("PF-007 migration — audited SECURITY DEFINER read RPCs", () => {
  for (const fn of READ_RPCS) {
    it(`${fn} is SECURITY DEFINER with a pinned search_path`, () => {
      const body = fnBody(fn);
      expect(body).toMatch(/SECURITY DEFINER/);
      expect(body).toMatch(/SET search_path = public/);
    });

    it(`${fn} rejects non-superadmins internally`, () => {
      const body = fnBody(fn);
      expect(body).toMatch(/IF NOT public\.has_role\(auth\.uid\(\), 'superadmin'::public\.app_role\) THEN/);
      expect(body).toMatch(/RAISE EXCEPTION/);
    });

    it(`${fn} writes an audit event BEFORE returning`, () => {
      const body = fnBody(fn);
      const auditAt = body.indexOf("INSERT INTO public.audit_logs");
      const returnAt = body.search(/\bRETURN\b/);
      expect(auditAt).toBeGreaterThan(-1);
      expect(returnAt).toBeGreaterThan(-1);
      expect(auditAt).toBeLessThan(returnAt);
    });
  }

  it("uses the four expected audit actions", () => {
    for (const a of ["READ_STUDENT_LIST", "READ_STUDENT", "READ_STUDENT_REPORT", "READ_PLATFORM_COUNTS"]) {
      expect(migration).toMatch(new RegExp(`'${a}'`));
    }
  });

  it("logs the list as ONE event with a result_count (not one per row)", () => {
    const body = fnBody("superadmin_list_students");
    expect((body.match(/INSERT INTO public\.audit_logs/g) || []).length).toBe(1);
    expect(body).toMatch(/'result_count'/);
  });

  it("report bundle covers all four assessment tables", () => {
    const body = fnBody("superadmin_get_student_report_bundle");
    for (const t of ["assessments", "big_five_assessments", "caas_assessments", "work_values_assessments"]) {
      expect(body).toMatch(new RegExp(`FROM public\\.${t}\\b`));
    }
  });
});

describe("PF-007 migration — audit metadata carries no psychometric payload", () => {
  it("no audit_logs INSERT embeds a raw row (to_jsonb) or SELECT *", () => {
    const inserts = migration.match(/INSERT INTO public\.audit_logs[\s\S]*?\);/g) || [];
    expect(inserts.length).toBe(READ_RPCS.length);
    for (const ins of inserts) {
      expect(ins).not.toMatch(/to_jsonb/);
      expect(ins).not.toMatch(/select\s+\*/i);
    }
  });
});

describe("PF-007 migration — privilege hardening", () => {
  for (const fn of READ_RPCS) {
    it(`${fn}: REVOKE from PUBLIC + anon, GRANT to authenticated only`, () => {
      expect(migration).toMatch(new RegExp(`REVOKE EXECUTE ON FUNCTION public\\.${fn}\\([^)]*\\)\\s+FROM PUBLIC`));
      expect(migration).toMatch(new RegExp(`REVOKE EXECUTE ON FUNCTION public\\.${fn}\\([^)]*\\)\\s+FROM anon`));
      expect(migration).toMatch(new RegExp(`GRANT  ?EXECUTE ON FUNCTION public\\.${fn}\\([^)]*\\)\\s+TO authenticated`));
    });
  }
});

// ---- Frontend privileged paths ----
const readFile = (rel: string) => readFileSync(resolve(root, rel), "utf8");
const SUPERADMIN_SCREENS = [
  "src/components/superadmin/StudentRoster.tsx",
  "src/pages/SuperAdminStudentDetail.tsx",
  "src/components/superadmin/AdminAssignment.tsx",
  "src/pages/SuperAdminDashboard.tsx",
];

describe("PF-007 app surface — superadmin screens no longer read the protected tables directly", () => {
  for (const f of SUPERADMIN_SCREENS) {
    it(`${f} issues no direct .from(<protected>).select()`, () => {
      const text = readFile(f);
      for (const t of PROTECTED_TABLES) {
        const re = new RegExp(`from\\(\\s*["'\`]${t}["'\`]\\s*\\)[\\s\\S]{0,80}?\\.select\\(`);
        expect(re.test(text)).toBe(false);
      }
    });
  }

  it("the superadmin detail screen routes reads through the audited RPCs", () => {
    const text = readFile("src/pages/SuperAdminStudentDetail.tsx");
    expect(text).toMatch(/superadmin_get_student_profile/);
    expect(text).toMatch(/superadmin_get_student_report_bundle/);
  });

  it("ComprehensiveReportView keeps the counselor direct-read path AND accepts a preloaded bundle", () => {
    const text = readFile("src/components/assessment/ComprehensiveReportView.tsx");
    expect(text).toMatch(/preloadedBundle/);
    // counselor path (direct reads) must still exist for the non-preloaded case
    expect(text).toMatch(/from\("assessments"\)\.select\("\*"\)/);
  });
});

describe("PF-007 app surface — no service-role secret in the frontend", () => {
  it("no shipped src file references a service-role key", () => {
    const offenders: string[] = [];
    const walk = (dir: string) => {
      for (const e of readdirSync(dir, { withFileTypes: true })) {
        if (e.name === "test") continue; // test files are not in the browser bundle
        const p = resolve(dir, e.name);
        if (e.isDirectory()) walk(p);
        else if (/\.(ts|tsx)$/.test(e.name) && !/\.(test|spec)\.tsx?$/.test(e.name)) {
          const text = readFileSync(p, "utf8");
          if (/service_role|SERVICE_ROLE|SUPABASE_SERVICE/.test(text)) offenders.push(p);
        }
      }
    };
    walk(resolve(root, "src"));
    expect(offenders).toEqual([]);
  });
});
