import { describe, it, expect } from "vitest";
import { readFileSync, readdirSync } from "node:fs";
import { resolve } from "node:path";

// =========================================================================
// PF-003 — scoring-integrity static parity regression tests.
//
// These are STATIC / LOCAL regression assertions only.
//
// They compare the authoritative PostgreSQL scoring functions in
// 20260618120000_g5_server_side_rescoring.sql with the canonical frontend
// reference mappings.
//
// The deployed database rescoring path is authoritative for PERSISTED
// psychometric scores: BEFORE INSERT/UPDATE triggers overwrite
// client-supplied score columns from item_responses.
//
// The previously investigated NULL-item_responses bypass hypothesis was
// falsified by canonical schema, disposable PostgreSQL runtime evidence, and
// production read-only inspection.
//
// The proposed hardening migration was retired; it was optional
// defense-in-depth and is not required by this test.
//
// Passing this file is E2 local/static regression evidence only. It is not by
// itself runtime, preview, or production proof.
// =========================================================================

const root = process.cwd();
const migDir = resolve(root, "supabase/migrations");

const readMigration = (needle: string): string => {
  const f = readdirSync(migDir).find((n) => n.includes(needle));
  if (!f) throw new Error(`migration matching "${needle}" not found`);
  return readFileSync(resolve(migDir, f), "utf8");
};

// The pure scoring SQL lives in the original rescoring migration.
const rescoringSql = readMigration("g5_server_side_rescoring");

// Canonical TS reference sources (the reference mapping for each instrument).
const assessmentServiceTs = readFileSync(
  resolve(root, "src/services/assessmentService.ts"),
  "utf8",
);
const workValuesTsx = readFileSync(
  resolve(root, "src/pages/WorkValuesAssessment.tsx"),
  "utf8",
);
// Canonical questionnaire definition: BIG_FIVE_ITEMS carries the real per-item
// factor assignment (id + trait + sign), independent of any ID convention.
const bigFiveAssessmentTsx = readFileSync(
  resolve(root, "src/pages/BigFiveAssessment.tsx"),
  "utf8",
);

// The owner-approved reverse-key contract, pinned as an immutable literal so a
// coordinated TS+SQL change to a different set of 18 cannot pass silently.
const EXPECTED_BIG_FIVE_REVERSE_KEYS = [
  "e2", "e4", "e6", "e8", "e10",
  "a1", "a3", "a5", "a7",
  "c2", "c4", "c6", "c8",
  "n2", "n4",
  "o2", "o4", "o6",
];

// ---- helpers -------------------------------------------------------------

// Slice a single SQL function body out of a script by its name, up to the next
// CREATE ... FUNCTION (or end of string).
const sqlFunctionBody = (sql: string, fn: string): string => {
  const start = sql.indexOf(`FUNCTION public.${fn}(`);
  if (start === -1) throw new Error(`SQL function ${fn} not found`);
  const rest = sql.slice(start + 1);
  const nextIdx = rest.indexOf("CREATE OR REPLACE FUNCTION");
  return nextIdx === -1 ? rest : rest.slice(0, nextIdx);
};

// Extract every single-quoted token from a `key IN ( ... )` list.
const inListTokens = (segment: string): string[] => {
  const m = segment.match(/key IN \(([^)]*)\)/);
  if (!m) return [];
  return (m[1].match(/'([^']+)'/g) || []).map((t) => t.replace(/'/g, ""));
};

// Parse `WHEN key IN (...) THEN 'group'` branches -> group -> sorted ids.
const sqlCaseGroups = (fnBody: string): Record<string, string[]> => {
  const out: Record<string, string[]> = {};
  const re = /WHEN\s+key IN \(([^)]*)\)\s+THEN\s+'([a-z_]+)'/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(fnBody)) !== null) {
    const ids = (m[1].match(/'([^']+)'/g) || []).map((t) => t.replace(/'/g, ""));
    out[m[2]] = ids.sort();
  }
  return out;
};

const sorted = (a: string[]) => [...a].sort();

// ---- 1. Big Five parity --------------------------------------------------

describe("PF-003 parity — Big Five SQL scoring mirrors the canonical TS maps", () => {
  const bigFiveSql = sqlFunctionBody(rescoringSql, "g5_score_big_five");

  // Parsed from the questionnaire itself: {id, trait, sign} per item.
  const declaredItems = (() => {
    const re = /\{\s*id:\s*"([a-z]\d+)",\s*trait:\s*"([a-z]+)",\s*sign:\s*(-?1)\s*\}/g;
    const out: Array<{ id: string; trait: string; sign: number }> = [];
    let m: RegExpExecArray | null;
    while ((m = re.exec(bigFiveAssessmentTsx)) !== null) {
      out.push({ id: m[1], trait: m[2], sign: Number(m[3]) });
    }
    return out;
  })();

  // Canonical TS TRAIT_MAP: first-letter prefix -> trait name.
  const tsTraitMap = (() => {
    const block = assessmentServiceTs.match(
      /const TRAIT_MAP[^=]*=\s*\{([\s\S]*?)\};/,
    );
    if (!block) throw new Error("TRAIT_MAP not found in assessmentService.ts");
    const out: Record<string, string> = {};
    const re = /([a-z]):\s*"([a-z]+)"/g;
    let m: RegExpExecArray | null;
    while ((m = re.exec(block[1])) !== null) out[m[1]] = m[2];
    return out;
  })();

  // SQL trait assignment: the jsonb_build_object keys each read a prefix via
  // `WHERE trait='X'`, giving prefix -> trait name as the SQL scorer sees it.
  const sqlTraitByLetter = (() => {
    const out: Record<string, string> = {};
    const re =
      /'([a-z]+)',\s*COALESCE\(\(SELECT s\/\(c\*5\)\*100 FROM a WHERE trait='([a-z])'\)/g;
    let m: RegExpExecArray | null;
    while ((m = re.exec(bigFiveSql)) !== null) out[m[2]] = m[1];
    return out;
  })();

  // Canonical TS SIGN_MAP: enumerates every Big Five item id; entries valued -1
  // are reverse-keyed.
  const signPairs = (() => {
    const block = assessmentServiceTs.match(
      /const SIGN_MAP[^=]*=\s*\{([\s\S]*?)\};/,
    );
    if (!block) throw new Error("SIGN_MAP not found in assessmentService.ts");
    return block[1].match(/([a-z]\d+):\s*(-?1)/g) || [];
  })();
  const tsItemIds = signPairs.map((p) => p.split(":")[0].trim());
  const tsReverse = signPairs
    .filter((p) => /:\s*-1$/.test(p))
    .map((p) => p.split(":")[0].trim());

  it("TS TRAIT_MAP and the SQL prefix->trait map cover all five traits identically", () => {
    expect(Object.keys(tsTraitMap).sort()).toEqual(["a", "c", "e", "n", "o"]);
    expect(sqlTraitByLetter).toEqual(tsTraitMap);
  });

  it("assigns every Big Five item to the same trait in TS and SQL (item-by-item)", () => {
    expect(tsItemIds.length).toBe(50); // 5 traits x 10 items
    for (const id of tsItemIds) {
      const prefix = id[0];
      const tsTrait = tsTraitMap[prefix];
      expect(tsTrait).toBeDefined();
      // SQL derives the same item's trait from the same first-letter prefix.
      expect(sqlTraitByLetter[prefix]).toBe(tsTrait);
    }
    expect(bigFiveSql).toMatch(/left\(key,1\)\s+IN\s*\('e','a','c','n','o'\)/);
  });

  it("SQL reverse-keyed item set equals the TS SIGN_MAP negative set", () => {
    expect(tsReverse.length).toBe(18); // e/a/c/n/o reverse items
    expect(sorted(inListTokens(bigFiveSql))).toEqual(sorted(tsReverse));
  });

  it("declares exactly 10 items per factor, by ACTUAL trait assignment", () => {
    // Counts the `trait:` field on each item, never the ID prefix, so an item
    // reassigned to another factor while keeping its ID is caught.
    expect(declaredItems.length).toBe(50);
    const perTrait = declaredItems.reduce<Record<string, number>>((acc, it) => {
      acc[it.trait] = (acc[it.trait] || 0) + 1;
      return acc;
    }, {});
    expect(Object.keys(perTrait).sort()).toEqual([
      "agreeableness", "conscientiousness", "extraversion", "neuroticism", "openness",
    ]);
    for (const trait of Object.keys(perTrait)) {
      expect(perTrait[trait]).toBe(10);
    }
  });

  it("every item's declared factor agrees with the scoring TRAIT_MAP", () => {
    // The scorer resolves a trait from the ID prefix; the questionnaire declares
    // it explicitly. If those ever disagree, scoring silently misattributes an
    // item. This is the assertion an ID-prefix census cannot make.
    for (const item of declaredItems) {
      expect(tsTraitMap[item.id[0]]).toBe(item.trait);
    }
  });

  it("the TS reverse-key set is exactly the approved 18 IDs", () => {
    expect(sorted(tsReverse)).toEqual(sorted(EXPECTED_BIG_FIVE_REVERSE_KEYS));
  });

  it("the SQL reverse-key set is exactly the approved 18 IDs", () => {
    expect(sorted(inListTokens(bigFiveSql))).toEqual(sorted(EXPECTED_BIG_FIVE_REVERSE_KEYS));
  });

  it("the questionnaire's own negative-signed items are the approved 18 IDs", () => {
    // Third independent source: BIG_FIVE_ITEMS sign:-1, beside TS and SQL.
    const declaredReverse = declaredItems.filter((i) => i.sign === -1).map((i) => i.id);
    expect(sorted(declaredReverse)).toEqual(sorted(EXPECTED_BIG_FIVE_REVERSE_KEYS));
  });

  it("SQL normalizes sum/(n*5)*100 exactly like the TS normalize()", () => {
    expect(bigFiveSql).toContain("s/(c*5)*100");
    expect(assessmentServiceTs).toContain("(sum / (vals.length * 5)) * 100");
  });
});

// ---- 2. CAAS parity ------------------------------------------------------

describe("PF-003 parity — CAAS SQL scoring mirrors CAAS_SUBSCALE_BY_ID", () => {
  const EXPECTED_SUBSCALES = ["concern", "confidence", "control", "curiosity"];

  const caasBlock = assessmentServiceTs.match(
    /CAAS_SUBSCALE_BY_ID[^=]*=\s*\{([\s\S]*?)\};/,
  );
  const tsGroups = (() => {
    if (!caasBlock) throw new Error("CAAS_SUBSCALE_BY_ID not found");
    const out: Record<string, string[]> = {};
    const re = /(q\d+):\s*"([a-z]+)"/g;
    let m: RegExpExecArray | null;
    while ((m = re.exec(caasBlock[1])) !== null) {
      (out[m[2]] ||= []).push(m[1]);
    }
    for (const k of Object.keys(out)) out[k] = out[k].sort();
    return out;
  })();

  const caasSql = sqlFunctionBody(rescoringSql, "g5_score_caas");
  const sqlGroups = sqlCaseGroups(caasSql);

  it("the TS parser extracts the complete, non-empty CAAS subscale set", () => {
    expect(Object.keys(tsGroups).sort()).toEqual(EXPECTED_SUBSCALES);
    for (const sub of EXPECTED_SUBSCALES) expect(tsGroups[sub].length).toBe(6);
    const total = EXPECTED_SUBSCALES.reduce((n, s) => n + tsGroups[s].length, 0);
    expect(total).toBe(24);
  });

  it("every subscale maps to exactly the same item ids in SQL and TS", () => {
    expect(Object.keys(sqlGroups).sort()).toEqual(EXPECTED_SUBSCALES);
    for (const sub of EXPECTED_SUBSCALES) {
      expect(sqlGroups[sub]).toEqual(tsGroups[sub]);
    }
  });

  it("SQL total_score is the mean of the four subscale means (matches TS)", () => {
    expect(caasSql).toMatch(/\(concern\+control\+curiosity\+confidence\)\/4/);
    expect(assessmentServiceTs).toContain(
      "(result.concern + result.control + result.curiosity + result.confidence) / 4",
    );
  });
});

// ---- 3. Work Values parity ----------------------------------------------

describe("PF-003 parity — Work Values SQL scoring mirrors the TS category map", () => {
  const EXPECTED_CATEGORIES = [
    "achievement",
    "independence",
    "recognition",
    "relationships",
    "support",
    "working_conditions",
  ];

  // Canonical TS: QUESTIONS[].{ id, category } in WorkValuesAssessment.tsx.
  const tsGroups = (() => {
    const out: Record<string, string[]> = {};
    const re = /id:\s*(\d+),[^}]*?category:\s*"([a-z_]+)"/g;
    let m: RegExpExecArray | null;
    while ((m = re.exec(workValuesTsx)) !== null) {
      (out[m[2]] ||= []).push(m[1]);
    }
    for (const k of Object.keys(out)) out[k] = out[k].sort();
    return out;
  })();

  const wvSql = sqlFunctionBody(rescoringSql, "g5_score_work_values");
  const sqlGroups = sqlCaseGroups(wvSql);

  it("the TS parser extracts the complete, non-empty Work Values category set", () => {
    expect(Object.keys(tsGroups).sort()).toEqual(EXPECTED_CATEGORIES);
    for (const cat of EXPECTED_CATEGORIES) expect(tsGroups[cat].length).toBeGreaterThan(0);
    const total = EXPECTED_CATEGORIES.reduce((n, c) => n + tsGroups[c].length, 0);
    expect(total).toBe(20);
  });

  it("every category maps to exactly the same item ids in SQL and TS", () => {
    expect(Object.keys(sqlGroups).sort()).toEqual(EXPECTED_CATEGORIES);
    for (const cat of EXPECTED_CATEGORIES) {
      expect(sqlGroups[cat]).toEqual(tsGroups[cat]);
    }
  });

  it("each SQL category divisor equals its item count (a true average)", () => {
    const re = /s\/(\d+)\s+FROM a WHERE cat='([a-z_]+)'/g;
    let m: RegExpExecArray | null;
    let seen = 0;
    while ((m = re.exec(wvSql)) !== null) {
      const divisor = Number(m[1]);
      const cat = m[2];
      expect(divisor).toBe(sqlGroups[cat].length);
      seen++;
    }
    expect(seen).toBe(6);
  });
});
