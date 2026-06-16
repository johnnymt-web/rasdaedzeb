import { supabase } from "@/integrations/supabase/client";
import {
  getTopResults,
  getLowResults,
  type normalizeAllAssessments,
} from "@/utils/assessmentNormalization";
import { getRecommendedAssessmentsForGradeBand, type GradeBand } from "@/utils/gradeBands";

export interface Mentor {
  id: string;
  full_name: string;
  profession: string;
  organization?: string | null;
  holland_code: string;
  bio?: string | null;
  fields?: string[] | null;
  coachable_skills?: string[] | null;
  specialties?: string[] | null;
  role_values?: string[] | null;
  style_tags?: string[] | null;
}

export type MatchFactor = "interest" | "skill" | "need" | "values" | "style";

export interface MentorMatch extends Mentor {
  matchScore: number;   // 0-100
  reasons: MatchFactor[]; // which factors drove the match (explainable)
}

export interface MentorRequest {
  id: string;
  mentor_id: string;
  status: "pending" | "accepted" | "declined";
}

/**
 * The student's match profile, derived from ONLY the assessments that are both
 * recommended for their grade band AND completed. This makes matching grade-aware:
 * a grade 7-8 student is matched on interests + skills, while a grade 11-12 student
 * also brings career-adaptability needs (CAAS), emotional needs (EQ), work values
 * and personality.
 */
export interface StudentMatchProfile {
  gradeBand: GradeBand;
  hollandCode: string;
  skillGaps: string[];
  needs: string[];
  topValues: string[];
  styleTags: string[];
  availableFactors: MatchFactor[];
}

type NormData = ReturnType<typeof normalizeAllAssessments>;

const lowPct = (assessment: NormData["caas"], key: string, thr = 60): boolean => {
  const r = assessment.results.find((x) => x.key === key);
  return !!r && (r.pct ?? 0) < thr;
};

export function buildStudentMatchProfile(normData: NormData, gradeBand: GradeBand): StudentMatchProfile {
  const recommended = getRecommendedAssessmentsForGradeBand(gradeBand);
  const has = (id: string, complete: boolean) => recommended.includes(id) && complete;
  const availableFactors: MatchFactor[] = [];

  // Interest (RIASEC)
  let hollandCode = "";
  if (has("riasec", normData.riasec.isComplete)) {
    hollandCode = getTopResults(normData.riasec.results, 3).map((r) => r.key[0].toUpperCase()).join("");
    if (hollandCode) availableFactors.push("interest");
  }

  // Skill gaps (Employability Skills)
  let skillGaps: string[] = [];
  if (has("skills", normData.skills.isComplete)) {
    skillGaps = getLowResults(normData.skills.results, 50).map((r) => String(r.key).toLowerCase());
    if (skillGaps.length) availableFactors.push("skill");
  }

  // Needs (CAAS career-adaptability + EQ) → support the student actually needs
  const needs: string[] = [];
  if (has("caas", normData.caas.isComplete)) {
    if (lowPct(normData.caas, "confidence")) needs.push("confidence-building");
    if (lowPct(normData.caas, "concern")) needs.push("future-planning");
    if (lowPct(normData.caas, "curiosity")) needs.push("exploration");
    if (lowPct(normData.caas, "control")) needs.push("ownership");
  }
  if (has("eq", normData.eq.isComplete)) {
    if (lowPct(normData.eq, "self_management")) needs.push("resilience");
    if (lowPct(normData.eq, "social_awareness") || lowPct(normData.eq, "relationship_management")) {
      needs.push("interpersonal-support");
    }
  }
  if (needs.length) availableFactors.push("need");

  // Work Values
  let topValues: string[] = [];
  if (has("workvalues", normData.workValues.isComplete)) {
    topValues = getTopResults(normData.workValues.results, 3).map((r) => String(r.key).toLowerCase());
    if (topValues.length) availableFactors.push("values");
  }

  // Rapport / style (Big Five)
  const styleTags: string[] = [];
  if (has("bigfive", normData.bigFive.isComplete)) {
    const bf = (key: string) => normData.bigFive.results.find((r) => r.key === key)?.pct ?? 50;
    if (bf("conscientiousness") < 45) styleTags.push("structure");
    if (bf("extraversion") < 45) styleTags.push("patient-pace");
    if (bf("extraversion") > 65) styleTags.push("high-energy");
    if (bf("neuroticism") > 60) styleTags.push("reassurance");
    if (styleTags.length) availableFactors.push("style");
  }

  return { gradeBand, hollandCode, skillGaps, needs, topValues, styleTags, availableFactors };
}

/** Position-weighted Holland-code overlap (0-100). */
export function hollandOverlapScore(studentCode: string, mentorCode: string): number {
  const s = (studentCode || "").toUpperCase().slice(0, 3).split("");
  const m = (mentorCode || "").toUpperCase().slice(0, 3).split("");
  if (s.length === 0 || m.length === 0) return 0;
  let score = 0;
  s.forEach((letter, i) => {
    const idx = m.indexOf(letter);
    if (idx !== -1) score += (3 - i) * (idx === i ? 1.5 : 1);
  });
  return Math.round((score / ((3 + 2 + 1) * 1.5)) * 100);
}

const overlapRatio = (a: string[] = [], b: string[] = []): number => {
  if (!a.length) return 0;
  const bl = b.map((x) => x.toLowerCase());
  return a.filter((x) => bl.includes(x.toLowerCase())).length / a.length;
};

const BASE_WEIGHTS: Record<MatchFactor, number> = {
  interest: 0.25, skill: 0.20, need: 0.25, values: 0.15, style: 0.15,
};

/**
 * Score a mentor against the student's grade-aware profile. Weights are
 * renormalized across only the factors the student actually has (so a discovery
 * student isn't penalized for lacking CAAS/EQ they never take).
 */
export function scoreMentor(profile: StudentMatchProfile, mentor: Mentor): { score: number; reasons: MatchFactor[] } {
  const present = profile.availableFactors.length ? profile.availableFactors : (["interest"] as MatchFactor[]);
  const totalW = present.reduce((sum, f) => sum + BASE_WEIGHTS[f], 0) || 1;

  const factorScore: Record<MatchFactor, number> = {
    interest: hollandOverlapScore(profile.hollandCode, mentor.holland_code) / 100,
    skill: overlapRatio(profile.skillGaps, mentor.coachable_skills ?? []),
    need: overlapRatio(profile.needs, mentor.specialties ?? []),
    values: overlapRatio(profile.topValues, mentor.role_values ?? []),
    style: overlapRatio(profile.styleTags, mentor.style_tags ?? []),
  };

  let score = 0;
  const reasons: MatchFactor[] = [];
  for (const f of present) {
    score += (BASE_WEIGHTS[f] / totalW) * factorScore[f];
    if (factorScore[f] > 0.34) reasons.push(f);
  }
  return { score: Math.round(score * 100), reasons };
}

/** Active mentors ranked by grade-aware multi-instrument match. */
export const getMatchedMentors = async (profile: StudentMatchProfile, limit = 6): Promise<MentorMatch[]> => {
  const { data, error } = await (supabase.from("mentors" as any) as any)
    .select("id, full_name, profession, organization, holland_code, bio, fields, coachable_skills, specialties, role_values, style_tags")
    .eq("active", true);
  if (error) throw error;
  const mentors = (data || []) as Mentor[];
  return mentors
    .map((m) => {
      const { score, reasons } = scoreMentor(profile, m);
      return { ...m, matchScore: score, reasons };
    })
    .sort((a, b) => b.matchScore - a.matchScore)
    .slice(0, limit);
};

export const getMyMentorRequests = async (studentId: string): Promise<MentorRequest[]> => {
  const { data, error } = await (supabase.from("mentor_requests" as any) as any)
    .select("id, mentor_id, status")
    .eq("student_id", studentId);
  if (error) throw error;
  return (data || []) as MentorRequest[];
};

export const requestMentor = async (studentId: string, mentorId: string, message: string): Promise<void> => {
  const { error } = await (supabase.from("mentor_requests" as any) as any).insert([
    { student_id: studentId, mentor_id: mentorId, message: message?.trim() || null },
  ]);
  if (error) throw error;
};
