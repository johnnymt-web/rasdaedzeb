// =========================================================================
// G5 Phase B — pure, dependency-free server-side scoring.
// Mirrors the LIVE frontend scoring EXACTLY:
//   RIASEC -> src/pages/AssessmentPage.tsx  (48-item grade banks, 8 items/category)
//   Skills -> src/pages/AssessmentPage.tsx  (5 items, ids 101-105)
//   EQ     -> src/pages/EqAssessment.tsx    (12 items, 4 dimensions x 3)
// Grade band -> src/utils/gradeBands.ts (getGradeBand)
//
// Keep this file free of imports so it can be consumed by BOTH the Deno edge
// function (index.ts) and the Node/vitest unit tests (scoring.test.ts).
// If the frontend question structure or scoring changes, update this in lock-step.
// =========================================================================

export type AssessmentType = "riasec" | "skills" | "eq";
export type GradeBand =
  | "discovery"
  | "exploration"
  | "planning"
  | "transition"
  | "unknown";

export type Answers = Record<string, number>;

export interface RiasecOrSkillsResult {
  category: string;
  pct: number;
}
export interface EqResult {
  category: string;
  score: number;
  pct: number;
}

export interface ScoredAssessment {
  results: RiasecOrSkillsResult[] | EqResult[];
  questionSetVersion: string;
}

/** Thrown when a submission does not match the expected/current structure. */
export class ScoringError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ScoringError";
  }
}

// ---- Grade band (mirror of src/utils/gradeBands.ts getGradeBand) ----
export function gradeToBand(gradeStr: string | null | undefined): GradeBand {
  if (!gradeStr) return "unknown";
  const match = String(gradeStr).match(/\d+/);
  if (!match) return "unknown";
  const grade = parseInt(match[0], 10);
  if (grade >= 6 && grade <= 8) return "discovery";
  if (grade >= 9 && grade <= 10) return "exploration";
  if (grade >= 11 && grade <= 12) return "planning";
  if (grade >= 13) return "transition";
  return "unknown";
}

/** band -> RIASEC bank key used by the live client (transition collapses into planning;
 *  discovery + unknown fall to the discovery bank, matching AssessmentPage.tsx). */
export function riasecBankKey(
  band: GradeBand,
): "discovery" | "exploration" | "planning" {
  if (band === "exploration") return "exploration";
  if (band === "planning" || band === "transition") return "planning";
  return "discovery";
}

// ---- shared validation ----
function assertValue(type: string, key: string, v: unknown): number {
  if (typeof v !== "number" || !Number.isFinite(v) || v < 1 || v > 5) {
    throw new ScoringError(
      `${type} item "${key}" has invalid value (${String(v)}); expected an integer 1-5.`,
    );
  }
  return v;
}

// =========================================================================
// RIASEC — 48-item grade banks only. ids 1-48, category = ceil(id/8).
// Rejects any other structure (e.g. the 30-item fallback) rather than mis-scoring.
// =========================================================================
const RIASEC_CATEGORIES = [
  "Realistic",
  "Investigative",
  "Artistic",
  "Social",
  "Enterprising",
  "Conventional",
] as const;
const RIASEC_ITEMS_PER_CATEGORY = 8;
const RIASEC_TOTAL_ITEMS = 48;

export function scoreRiasec(answers: Answers, band: GradeBand): ScoredAssessment {
  const keys = Object.keys(answers);
  if (keys.length !== RIASEC_TOTAL_ITEMS) {
    throw new ScoringError(
      `RIASEC submission has ${keys.length} answers; expected ${RIASEC_TOTAL_ITEMS} (48-item grade bank). ` +
        `Fallback/other structures are not accepted for server-side scoring.`,
    );
  }
  const sums = new Array(RIASEC_CATEGORIES.length).fill(0);
  for (const key of keys) {
    const id = Number(key);
    if (!Number.isInteger(id) || id < 1 || id > RIASEC_TOTAL_ITEMS) {
      throw new ScoringError(
        `RIASEC submission contains invalid item id "${key}"; expected ids 1-${RIASEC_TOTAL_ITEMS}.`,
      );
    }
    const v = assertValue("RIASEC", key, answers[key]);
    const catIdx = Math.ceil(id / RIASEC_ITEMS_PER_CATEGORY) - 1; // 0..5
    sums[catIdx] += v;
  }
  const maxPossible = RIASEC_ITEMS_PER_CATEGORY * 5; // 40
  const results: RiasecOrSkillsResult[] = RIASEC_CATEGORIES.map((category, i) => ({
    category,
    pct: Math.round((sums[i] / maxPossible) * 100),
  })).sort((a, b) => b.pct - a.pct);

  return { results, questionSetVersion: `riasec_${riasecBankKey(band)}_v1_48` };
}

// =========================================================================
// Skills — 5 items, ids 101-105, one category each.
// =========================================================================
const SKILLS_MAP: Record<string, string> = {
  "101": "Communication",
  "102": "Problem Solving",
  "103": "Digital Literacy",
  "104": "Teamwork",
  "105": "Adaptability",
};
const SKILLS_IDS = ["101", "102", "103", "104", "105"];

export function scoreSkills(answers: Answers): ScoredAssessment {
  const keys = Object.keys(answers);
  if (keys.length !== SKILLS_IDS.length) {
    throw new ScoringError(
      `Skills submission has ${keys.length} answers; expected ${SKILLS_IDS.length} (ids 101-105).`,
    );
  }
  for (const id of SKILLS_IDS) {
    if (!(id in answers)) {
      throw new ScoringError(`Skills submission is missing item "${id}".`);
    }
  }
  const results: RiasecOrSkillsResult[] = SKILLS_IDS.map((id) => {
    const v = assertValue("Skills", id, answers[id]);
    return { category: SKILLS_MAP[id], pct: Math.round((v / 5) * 100) };
  }).sort((a, b) => b.pct - a.pct);

  return { results, questionSetVersion: "skills_v1_5" };
}

// =========================================================================
// EQ — 12 items, 4 dimensions x 3, fixed dimension order (NOT sorted).
// =========================================================================
const EQ_DIMENSIONS = [
  "Self-Awareness",
  "Self-Management",
  "Social Awareness",
  "Relationship Management",
] as const;
const EQ_ITEM_DIMENSION: Record<string, string> = {
  sa1: "Self-Awareness", sa2: "Self-Awareness", sa3: "Self-Awareness",
  sm1: "Self-Management", sm2: "Self-Management", sm3: "Self-Management",
  soa1: "Social Awareness", soa2: "Social Awareness", soa3: "Social Awareness",
  rm1: "Relationship Management", rm2: "Relationship Management", rm3: "Relationship Management",
};
const EQ_IDS = Object.keys(EQ_ITEM_DIMENSION);

export function scoreEq(answers: Answers): ScoredAssessment {
  const keys = Object.keys(answers);
  if (keys.length !== EQ_IDS.length) {
    throw new ScoringError(
      `EQ submission has ${keys.length} answers; expected ${EQ_IDS.length} (sa/sm/soa/rm x3).`,
    );
  }
  for (const id of EQ_IDS) {
    if (!(id in answers)) {
      throw new ScoringError(`EQ submission is missing item "${id}".`);
    }
    assertValue("EQ", id, answers[id]);
  }
  const results: EqResult[] = EQ_DIMENSIONS.map((dim) => {
    const items = EQ_IDS.filter((id) => EQ_ITEM_DIMENSION[id] === dim);
    const total = items.reduce((sum, id) => sum + answers[id], 0);
    const score = total / items.length; // average 1-5, full precision (matches frontend)
    return { category: dim, score, pct: Math.round((score / 5) * 100) };
  });

  return { results, questionSetVersion: "eq_v1_12" };
}

// ---- dispatcher ----
export function scoreAssessment(
  type: AssessmentType,
  answers: Answers,
  band: GradeBand,
): ScoredAssessment {
  switch (type) {
    case "riasec":
      return scoreRiasec(answers, band);
    case "skills":
      return scoreSkills(answers);
    case "eq":
      return scoreEq(answers);
    default:
      throw new ScoringError(`Unsupported assessment_type "${String(type)}".`);
  }
}
