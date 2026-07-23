import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import {
  parseAiEnabled,
  AI_DISABLED_BODY,
  AI_DISABLED_STATUS,
} from "../../supabase/functions/_shared/aiFeatureFlag";

// Phase 1A containment tests (PF-001 / PF-002). Pure + repository-structure
// assertions only — no Deno runtime, no provider calls.

const root = process.cwd();
const read = (rel: string) => readFileSync(resolve(root, rel), "utf8");

describe("parseAiEnabled — fail-closed AI containment flag", () => {
  it("blocks when the flag is missing (undefined/null)", () => {
    expect(parseAiEnabled(undefined)).toBe(false);
    expect(parseAiEnabled(null)).toBe(false);
  });

  it("blocks when the flag is empty or whitespace", () => {
    expect(parseAiEnabled("")).toBe(false);
    expect(parseAiEnabled("   ")).toBe(false);
    expect(parseAiEnabled("\t\n")).toBe(false);
  });

  it('blocks the literal string "false" (the classic fail-open trap)', () => {
    expect(parseAiEnabled("false")).toBe(false);
    expect(parseAiEnabled("FALSE")).toBe(false);
    expect(parseAiEnabled("False")).toBe(false);
  });

  it("blocks malformed / non-true values", () => {
    for (const v of ["0", "1", "yes", "no", "on", "off", "enabled", "tru", "true1", "{}", "null", "undefined"]) {
      expect(parseAiEnabled(v)).toBe(false);
    }
  });

  it('enables ONLY on the exact token "true" (case-insensitive, trimmed)', () => {
    expect(parseAiEnabled("true")).toBe(true);
    expect(parseAiEnabled("TRUE")).toBe(true);
    expect(parseAiEnabled("True")).toBe(true);
    expect(parseAiEnabled("  true  ")).toBe(true);
  });

  it("never uses permissive Boolean() truthiness (Boolean('false') === true)", () => {
    // Guard against a regression to `Boolean(env.get(...))`.
    expect(Boolean("false")).toBe(true); // demonstrates the trap
    expect(parseAiEnabled("false")).toBe(false); // our parser avoids it
  });
});

describe("disabled response contract leaks no configuration", () => {
  it("uses 503 and a stable, config-free message", () => {
    expect(AI_DISABLED_STATUS).toBe(503);
    const body = JSON.stringify(AI_DISABLED_BODY).toLowerCase();
    for (const leak of ["key", "env", "openai", "anthropic", "secret", "token", "flag", "ai_features_enabled"]) {
      expect(body.includes(leak)).toBe(false);
    }
  });
});

// Every Edge Function that calls an external AI provider (Phase 1A + 1B).
const PROVIDER_FUNCTIONS = [
  "career-coach",
  "generate-parent-insight",
  "generate-synthesis",
  "localize-careers",
  "counselor-coach",
  "parent-coach",
  "admin-insights",
] as const;

// Every provider function is intended for authenticated use and must carry
// explicit verify_jwt = true. localize-careers is included: its only caller
// (src/services/onetService.ts) invokes it from authenticated sessions that
// already send the user JWT, so enforcement breaks no legitimate caller.
const AUTHENTICATED_PROVIDER_FUNCTIONS = [
  "career-coach",
  "generate-parent-insight",
  "generate-synthesis",
  "localize-careers",
  "counselor-coach",
  "parent-coach",
  "admin-insights",
] as const;

describe("R3 — reproducible JWT enforcement in config.toml", () => {
  const config = read("supabase/config.toml");

  for (const fn of AUTHENTICATED_PROVIDER_FUNCTIONS) {
    it(`declares ${fn} with verify_jwt = true`, () => {
      expect(config).toMatch(new RegExp(`\\[functions\\.${fn}\\][\\s\\S]*?verify_jwt\\s*=\\s*true`));
    });
  }

  it("never disables JWT verification anywhere", () => {
    expect(config).not.toMatch(/verify_jwt\s*=\s*false/);
  });
});

describe("R2 — fail-closed guard precedes all request/provider work in every provider function", () => {
  const guardRe = /parseAiEnabled\(Deno\.env\.get\(["']AI_FEATURES_ENABLED["']\)\)/;
  const providerFetchRe =
    /fetch\(["'`]https:\/\/(api\.openai\.com|api\.anthropic\.com|ai\.gateway\.lovable\.dev)/;

  for (const fn of PROVIDER_FUNCTIONS) {
    it(`${fn}: imports the shared flag and guards before body parsing / auth / provider call`, () => {
      const src = read(`supabase/functions/${fn}/index.ts`);
      expect(src).toContain("parseAiEnabled");

      const guardIdx = src.search(guardRe);
      const serveIdx = src.indexOf("serve(async");
      expect(guardIdx).toBeGreaterThan(-1);
      expect(serveIdx).toBeGreaterThan(-1);
      // Guard lives inside the request handler.
      expect(guardIdx).toBeGreaterThan(serveIdx);

      // Nothing sensitive may appear between serve() entry and the guard.
      const preGuard = src.slice(serveIdx, guardIdx);
      expect(preGuard).not.toContain("req.json()");
      expect(preGuard).not.toContain("auth.getUser()");
      expect(preGuard).not.toMatch(providerFetchRe);
      expect(preGuard).not.toMatch(/\b(handleLegacy|callAnthropic)\(/);
    });
  }
});
