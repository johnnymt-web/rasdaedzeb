import { describe, it, expect } from "vitest";
import {
  gradeToBand,
  riasecBankKey,
  scoreRiasec,
  scoreSkills,
  scoreEq,
  ScoringError,
  type Answers,
} from "./scoring";

describe("gradeToBand (mirror of src/utils/gradeBands.ts)", () => {
  it("maps numeric grades to bands", () => {
    expect(gradeToBand("Grade 7")).toBe("discovery");
    expect(gradeToBand("8")).toBe("discovery");
    expect(gradeToBand("Grade 9")).toBe("exploration");
    expect(gradeToBand("11")).toBe("planning");
    expect(gradeToBand("Grade 12")).toBe("planning");
    expect(gradeToBand("13")).toBe("transition");
    expect(gradeToBand(null)).toBe("unknown");
    expect(gradeToBand("")).toBe("unknown");
    expect(gradeToBand("N/A")).toBe("unknown");
  });

  it("maps band -> RIASEC bank key like the live client", () => {
    expect(riasecBankKey("discovery")).toBe("discovery");
    expect(riasecBankKey("exploration")).toBe("exploration");
    expect(riasecBankKey("planning")).toBe("planning");
    expect(riasecBankKey("transition")).toBe("planning"); // transition collapses into planning
    expect(riasecBankKey("unknown")).toBe("discovery");    // fallback to discovery bank
  });
});

// Build a 48-item RIASEC answer set: per-category uniform values unless overridden.
function riasecAnswers(perCat: [number, number, number, number, number, number], overrides: Answers = {}): Answers {
  const a: Answers = {};
  for (let id = 1; id <= 48; id++) {
    const catIdx = Math.ceil(id / 8) - 1;
    a[String(id)] = perCat[catIdx];
  }
  return { ...a, ...overrides };
}

describe("scoreRiasec (48-item grade bank; category = ceil(id/8))", () => {
  it("computes per-category pct and sorts descending (matches AssessmentPage)", () => {
    // R=5(100), I=4(80), A=3(60), S=2(40), E=1(20), C=mixed -> 50
    const answers = riasecAnswers([5, 4, 3, 2, 1, 2]);
    // Conventional ids 41-48: make 45-48 = 3 so sum = 4*2 + 4*3 = 20 -> 50%
    for (let id = 45; id <= 48; id++) answers[String(id)] = 3;

    const { results, questionSetVersion } = scoreRiasec(answers, "planning");
    expect(questionSetVersion).toBe("riasec_planning_v1_48");
    expect(results).toEqual([
      { category: "Realistic", pct: 100 },
      { category: "Investigative", pct: 80 },
      { category: "Artistic", pct: 60 },
      { category: "Conventional", pct: 50 },
      { category: "Social", pct: 40 },
      { category: "Enterprising", pct: 20 },
    ]);
  });

  it("derives the bank version from the grade band", () => {
    const answers = riasecAnswers([3, 3, 3, 3, 3, 3]);
    expect(scoreRiasec(answers, "discovery").questionSetVersion).toBe("riasec_discovery_v1_48");
    expect(scoreRiasec(answers, "exploration").questionSetVersion).toBe("riasec_exploration_v1_48");
    expect(scoreRiasec(answers, "transition").questionSetVersion).toBe("riasec_planning_v1_48");
  });

  it("REJECTS the 30-item fallback structure rather than mis-scoring", () => {
    const fallback: Answers = {};
    for (let id = 1; id <= 30; id++) fallback[String(id)] = 3;
    expect(() => scoreRiasec(fallback, "discovery")).toThrow(ScoringError);
  });

  it("rejects out-of-range ids and invalid values", () => {
    const bad = riasecAnswers([3, 3, 3, 3, 3, 3]);
    delete bad["48"];
    bad["49"] = 3; // out of range, still 48 keys
    expect(() => scoreRiasec(bad, "planning")).toThrow(ScoringError);

    const badVal = riasecAnswers([3, 3, 3, 3, 3, 3]);
    badVal["1"] = 6; // > 5
    expect(() => scoreRiasec(badVal, "planning")).toThrow(ScoringError);
  });
});

describe("scoreSkills (ids 101-105, one category each)", () => {
  it("computes pct = round(value/5*100) and sorts descending", () => {
    const answers: Answers = { "101": 5, "102": 4, "103": 3, "104": 2, "105": 1 };
    const { results, questionSetVersion } = scoreSkills(answers);
    expect(questionSetVersion).toBe("skills_v1_5");
    expect(results).toEqual([
      { category: "Communication", pct: 100 },
      { category: "Problem Solving", pct: 80 },
      { category: "Digital Literacy", pct: 60 },
      { category: "Teamwork", pct: 40 },
      { category: "Adaptability", pct: 20 },
    ]);
  });

  it("rejects wrong item count", () => {
    expect(() => scoreSkills({ "101": 5, "102": 4 })).toThrow(ScoringError);
  });
});

describe("scoreEq (12 items, 4 dimensions x 3, fixed order, includes score)", () => {
  it("computes average score + pct in dimension order (matches EqAssessment)", () => {
    const answers: Answers = {
      sa1: 5, sa2: 4, sa3: 4,   // 13/3 = 4.333... -> pct 87
      sm1: 3, sm2: 3, sm3: 3,   // 3 -> 60
      soa1: 4, soa2: 4, soa3: 4, // 4 -> 80
      rm1: 2, rm2: 2, rm3: 2,   // 2 -> 40
    };
    const { results, questionSetVersion } = scoreEq(answers);
    expect(questionSetVersion).toBe("eq_v1_12");
    expect(results.map((r) => r.category)).toEqual([
      "Self-Awareness",
      "Self-Management",
      "Social Awareness",
      "Relationship Management",
    ]);
    expect(results[0].score).toBeCloseTo(13 / 3, 10);
    expect(results[0].pct).toBe(87);
    expect(results[1]).toEqual({ category: "Self-Management", score: 3, pct: 60 });
    expect(results[2]).toEqual({ category: "Social Awareness", score: 4, pct: 80 });
    expect(results[3]).toEqual({ category: "Relationship Management", score: 2, pct: 40 });
  });

  it("rejects missing items", () => {
    expect(() => scoreEq({ sa1: 5, sa2: 4, sa3: 4 })).toThrow(ScoringError);
  });
});
