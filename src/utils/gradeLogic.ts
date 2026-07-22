import { getGradeBand, getRecommendedAssessmentsForGradeBand } from "@/utils/gradeBands";

export function parseGrade(grade: any): number {
  if (grade === null || grade === undefined) return 7;
  const numeric = parseInt(grade.toString().replace(/\D/g, ""));
  return isNaN(numeric) ? 7 : numeric;
}

/**
 * Which assessments are relevant to (and unlocked for) a given grade.
 *
 * Single source of truth: delegates to the canonical grade-band mapping in
 * gradeBands.ts, which matches the per-page grade guards (BigFive/WorkValues
 * require grade ≥ 9; CAAS/EQ require grade ≥ 11). Previously this listed extra
 * tests (e.g. bigfive/eq for grades ≤ 8) that the assessment pages actually
 * block — so a younger student saw tests they couldn't take, and the report
 * counted them as permanently "missing", which would keep a new assessment
 * cycle stuck as "incomplete" forever.
 */
export function getAllowedAssessmentsForGrade(grade: number | undefined | string): string[] {
  const band = getGradeBand(String(parseGrade(grade)));
  return getRecommendedAssessmentsForGradeBand(band);
}

export function isAssessmentVisible(assessmentId: string, grade: number): boolean {
  return getAllowedAssessmentsForGrade(grade).includes(assessmentId);
}
