import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { resolve } from "node:path";

// =========================================================================
// Big Five Tier 1 - presentation & locale-structure regression tests.
//
// STATIC / SOURCE-CONTRACT assertions only. These do not render components;
// they assert on the source of the two active Big Five student-facing
// surfaces and on locale structure. They exist because the Tier 1
// presentation contract (direction, labelling, no ranking, no percentage)
// previously had no automated guard at all.
//
// They deliberately do NOT judge whether EN/KA prose is psychologically
// appropriate or non-diagnostic. That remains HUMAN REVIEW.
//
// Passing this file is E2 local/static evidence only.
// =========================================================================

const root = process.cwd();
const read = (p: string) => readFileSync(resolve(root, p), "utf8");
const sha256 = (s: string) =>
  createHash("sha256").update(Buffer.from(s, "utf8")).digest("hex");

const cardSrc = read("src/components/assessment/BigFiveResultCard.tsx");
const crvSrc = read("src/components/assessment/ComprehensiveReportView.tsx");

// Isolate the Big Five section of the shared report component so assertions
// never leak into RIASEC / CAAS / Work Values / EQ sections.
const bigFiveBlock = (() => {
  const START = '{isVisible("bigfive") && bigFive.isComplete && (';
  const a = crvSrc.indexOf(START);
  if (a === -1) throw new Error("Big Five section not found in ComprehensiveReportView");
  const b = crvSrc.indexOf("</section>", a);
  if (b === -1) throw new Error("Big Five section end not found");
  return crvSrc.slice(a, b + "</section>".length);
})();

// "Rendered" view: developer comments and CSS bar geometry removed, so a
// comment mentioning "percentage" or a `width: ${x}%` never trips a check.
// Note: the // strip is line-based and assumes no URL literals in these
// blocks (verified true for both surfaces).
const rendered = (src: string) =>
  src
    .replace(/\{\s*\/\*[\s\S]*?\*\/\s*\}/g, "")
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .split("\n")
    .map((l) => l.replace(/\/\/.*$/, ""))
    .join("\n")
    .replace(/width:\s*`\$\{[^`]*\}%`/g, "width:<css-geometry>");

const cardRendered = rendered(cardSrc);
const blockRendered = rendered(bigFiveBlock);

const SURFACES: Array<[string, string]> = [
  ["BigFiveResultCard", cardRendered],
  ["ComprehensiveReportView Big Five block", blockRendered],
];

const DOMAINS = [
  "openness", "conscientiousness", "extraversion", "agreeableness", "neuroticism",
];

// ---- 1. Factor-IV direction ---------------------------------------------

describe("Big Five Tier 1 - factor IV is never inverted", () => {
  it.each(SURFACES)("%s applies no 100-score or 120-score inversion", (_n, src) => {
    expect(src).not.toMatch(/100\s*-\s*(score|displayScore|pct)/);
    expect(src).not.toMatch(/120\s*-\s*(score|displayScore|pct)/);
  });

  it.each(SURFACES)("%s does not derive Emotional Stability from the stored value", (_n, src) => {
    expect(src).not.toMatch(/emotional\s*stability/i);
  });

  it("the card meter reports the stored score, not the bar width", () => {
    expect(cardRendered).toContain("aria-valuenow={displayScore}");
    expect(cardRendered).not.toContain("aria-valuenow={barWidth}");
  });
});

// ---- 2. Label / value consistency ---------------------------------------

describe("Big Five Tier 1 - labels and values stay in one direction", () => {
  // Invariant A - the card's domain definition covers exactly the five factors.
  it("card TRAITS definition contains exactly the five domain keys", () => {
    const keys: string[] = [];
    const re = /\{\s*key:\s*"([a-z]+)",\s*label:/g;
    let m: RegExpExecArray | null;
    while ((m = re.exec(cardRendered)) !== null) keys.push(m[1]);
    expect(keys.sort()).toEqual([...DOMAINS].sort());
    expect(keys).toHaveLength(5);
  });

  // Invariant B - labels/descriptions resolve from the Big Five i18n namespace.
  // Accepts either the dynamic `${trait.key}` binding or per-domain literals,
  // so the test asserts the contract rather than one spelling of it.
  it("card resolves every domain label from the traits.* namespace", () => {
    for (const d of DOMAINS) {
      const dynamic = cardRendered.includes("assessment_results.big_five.traits.${trait.key}");
      const literal = cardRendered.includes(`assessment_results.big_five.traits.${d}`);
      expect(dynamic || literal).toBe(true);
    }
  });

  it("card resolves descriptions via the dynamic domain binding", () => {
    expect(cardRendered).toContain("assessment_results.big_five.descriptions.${trait.key}");
  });

  it("report Big Five block uses traits.* and descriptions.*", () => {
    expect(blockRendered).toContain("assessment_results.big_five.traits.${r.key}");
    expect(blockRendered).toContain("assessment_results.big_five.descriptions.${r.key}");
  });

  it.each(SURFACES)("%s renders the localized scale_note", (_n, src) => {
    expect(src).toContain("assessment_results.big_five.scale_note");
  });
});

// ---- 3. Factor-IV label contract ----------------------------------------

describe("Big Five Tier 1 - factor IV label contract", () => {
  const en = JSON.parse(read("src/i18n/locales/en.json"));
  const ka = JSON.parse(read("src/i18n/locales/ka.json"));
  const enLabel = en.assessment_results.big_five.traits.neuroticism;
  const kaLabel = ka.assessment_results.big_five.traits.neuroticism;

  // Owner-approved label, pinned exactly. This is a label/direction contract,
  // NOT an automated judgement of psychological wording quality.
  it("EN factor IV label is exactly the approved Neuroticism-direction label", () => {
    expect(enLabel).toBe("Stress Response & Sensitivity");
  });

  // The KA label is pinned by fingerprint rather than by a raw literal, so this
  // file stays pure ASCII and introduces no non-ASCII write path. The digest is
  // a stricter contract than any substring or negative check: exactly one string
  // satisfies it. Verified 10/10 at the KA localization approval step.
  it("KA factor IV label matches the approved UTF-8 fingerprint exactly", () => {
    expect(typeof kaLabel).toBe("string");
    expect(Array.from(kaLabel as string)).toHaveLength(33);
    expect(Buffer.byteLength(kaLabel as string, "utf8")).toBe(93);
    expect(sha256(kaLabel as string)).toBe(
      "87f94eb288f763af57ac77a2d1c516935f715c19e5603385e1db35f2f6723525",
    );
  });

  // Negative guard retained for EN only. For KA the fingerprint above subsumes
  // it, so no Georgian negative literal is needed.
  it("EN factor IV label is not an Emotional Stability label", () => {
    expect(typeof enLabel).toBe("string");
    expect((enLabel as string).length).toBeGreaterThan(0);
    expect(enLabel).not.toMatch(/emotional\s*stability/i);
  });
});

// ---- 4. The removed silent-inversion logic stays removed -----------------

describe("Big Five Tier 1 - the 100-score defect stays fixed", () => {
  it.each(SURFACES)("%s contains no silent inversion branch", (_n, src) => {
    expect(src).not.toMatch(/trait\.key\s*===\s*["']neuroticism["']\s*\?/);
    expect(src).not.toMatch(/r\.key\s*===\s*["']neuroticism["']\s*\?/);
  });
});

// ---- 5. Presentation regression ------------------------------------------

describe("Big Five Tier 1 - presentation contract", () => {
  it.each(SURFACES)("%s renders no percentage score suffix", (_n, src) => {
    expect(src).not.toMatch(/\{\s*(score|displayScore|r\.pct)\s*\}\s*%/);
  });

  it.each(SURFACES)("%s renders no '/ 100' suffix", (_n, src) => {
    expect(src).not.toMatch(/\/\s*100/);
    expect(src).not.toContain("SCALE_SUFFIX");
  });

  it.each(SURFACES)("%s performs no top-trait or ranking selection", (_n, src) => {
    expect(src).not.toMatch(/\.sort\s*\(/);
    expect(src).not.toMatch(/topTrait|strongestTrait|getTopResults/);
  });

  it("report Big Five block does not call getRichInterpretation", () => {
    expect(blockRendered).not.toContain("getRichInterpretation");
    expect(blockRendered).not.toMatch(/interpret\.(level|explanation|guidance)/);
  });

  it("card exposes the 20-100 meter contract", () => {
    expect(cardSrc).toContain("const SCALE_MIN = 20;");
    expect(cardSrc).toContain("const SCALE_MAX = 100;");
    expect(cardRendered).toContain('role="meter"');
    expect(cardRendered).toContain("aria-valuemin={SCALE_MIN}");
    expect(cardRendered).toContain("aria-valuemax={SCALE_MAX}");
  });

  it("report Big Five block exposes the 20-100 meter contract", () => {
    expect(crvSrc).toContain("const BIG_FIVE_SCALE_MIN = 20;");
    expect(crvSrc).toContain("const BIG_FIVE_SCALE_MAX = 100;");
    expect(blockRendered).toContain('role="meter"');
    expect(blockRendered).toContain("aria-valuenow={score}");
    expect(blockRendered).toContain("aria-valuemin={BIG_FIVE_SCALE_MIN}");
    expect(blockRendered).toContain("aria-valuemax={BIG_FIVE_SCALE_MAX}");
  });
});

// ---- 6. EN/KA locale structure parity ------------------------------------

describe("Big Five Tier 1 - EN/KA locale structure parity", () => {
  const en = JSON.parse(read("src/i18n/locales/en.json"));
  const ka = JSON.parse(read("src/i18n/locales/ka.json"));
  const enB = en.assessment_results.big_five;
  const kaB = ka.assessment_results.big_five;

  it("big_five key sets are identical", () => {
    expect(Object.keys(kaB)).toEqual(Object.keys(enB));
  });

  it("traits and descriptions key sets are identical and complete", () => {
    expect(Object.keys(kaB.traits)).toEqual(Object.keys(enB.traits));
    expect(Object.keys(kaB.descriptions)).toEqual(Object.keys(enB.descriptions));
    expect(Object.keys(enB.descriptions)).toHaveLength(5);
    expect(Object.keys(enB.traits)).toHaveLength(5);
  });

  it("both locales carry about_title, scale_note and reading_note", () => {
    for (const b of [enB, kaB]) {
      expect(typeof b.about_title).toBe("string");
      expect(typeof b.scale_note).toBe("string");
      expect(typeof b.reading_note).toBe("string");
      expect(b.scale_note).toContain("{{min}}");
      expect(b.scale_note).toContain("{{max}}");
    }
  });

  it("the retired ranked-insight keys are absent from both locales", () => {
    for (const b of [enB, kaB]) {
      expect(b).not.toHaveProperty("analytical_insight");
      expect(b).not.toHaveProperty("insights");
    }
  });
});
