import type { GradeBand } from "@/utils/gradeBands";

/**
 * Bump this whenever the prompt, schema, or model changes in a way that should
 * invalidate every cached report. It is part of the cache key, so a bump forces
 * a one-time regeneration for each student on next view.
 */
export const SYNTHESIS_SCHEMA_VERSION = 1;

export type SynthesisLang = "ka" | "en";

/** A single scored dimension passed to the synthesis engine. */
export interface SynthesisDimension {
  key: string;
  label: string;
  /** 0-100 normalized percentage (preferred). */
  pct?: number;
  /** Raw score on its native scale, when percentage is not meaningful (e.g. CAAS 1-5). */
  score?: number;
}

export interface SynthesisOnetCareer {
  title: string;
  code?: string;
  description?: string;
}

/** Full, structured input for a V2 synthesis report. */
export interface SynthesisInputV2 {
  studentId: string;
  gradeBand: GradeBand;
  lang: SynthesisLang;
  riasec: SynthesisDimension[];
  bigFive: SynthesisDimension[];
  caas: SynthesisDimension[];
  workValues: SynthesisDimension[];
  eq: SynthesisDimension[];
  skills: SynthesisDimension[];
  onetCareers?: SynthesisOnetCareer[];
  /** Optional free-text the student wrote about their own goals. */
  studentGoals?: string;
}

/** Student-safe report (never contains counselor-only material). */
export interface SynthesisReportV2 {
  schemaVersion: number;
  profileSummary: string;
  crossInstrumentInsights: string;
  careerMatches: Array<{
    title: string;
    onetCode?: string;
    matchReason: string;
    georgianPathway: string;
  }>;
  actionPlan: {
    extracurriculars: string[];
    skillsToBuild: string[];
    nextSteps: string[];
  };
}

/** Counselor-only material, stored in a separate, RLS-protected table. */
export interface CounselorNotes {
  flags: string[];
  recommendedIntervention: string;
  parentTalkingPoints: string[];
}

export interface SynthesisV2Response {
  report: SynthesisReportV2;
  /** Present only when the caller is an assigned counselor. */
  counselorNotes?: CounselorNotes;
  /** True when this response was served from cache (no model call). */
  cached: boolean;
}

/**
 * Deterministic FNV-1a-ish hash of a string. Stable across client/server.
 * (Not for security — only for cache-key derivation.)
 */
function stableHash(input: string): string {
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    hash = (hash << 5) - hash + input.charCodeAt(i);
    hash |= 0; // force 32-bit
  }
  return Math.abs(hash).toString(36);
}

/** Round dimension values so trivial float jitter doesn't bust the cache. */
function fingerprintDimensions(dims: SynthesisDimension[]): string {
  return dims
    .map((d) => `${d.key}:${Math.round(d.pct ?? (d.score ?? 0) * 10)}`)
    .sort()
    .join(",");
}

/**
 * Builds a deterministic cache key from the scored inputs + language + grade band
 * + schema version. Identical inputs → identical key → cache hit.
 */
export function buildSynthesisCacheKey(input: SynthesisInputV2): string {
  const fingerprint = [
    `v${SYNTHESIS_SCHEMA_VERSION}`,
    input.lang,
    input.gradeBand,
    `r=${fingerprintDimensions(input.riasec)}`,
    `b=${fingerprintDimensions(input.bigFive)}`,
    `c=${fingerprintDimensions(input.caas)}`,
    `w=${fingerprintDimensions(input.workValues)}`,
    `e=${fingerprintDimensions(input.eq)}`,
    `s=${fingerprintDimensions(input.skills)}`,
  ].join("|");
  return `v${SYNTHESIS_SCHEMA_VERSION}-${input.lang}-${stableHash(fingerprint)}`;
}
