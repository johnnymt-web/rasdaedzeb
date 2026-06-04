
export function parseGrade(grade: any): number {
  if (grade === null || grade === undefined) return 7;
  const numeric = parseInt(grade.toString().replace(/\D/g, ""));
  return isNaN(numeric) ? 7 : numeric;
}

export function getAllowedAssessmentsForGrade(grade: number | undefined | string): string[] {
  const g = parseGrade(grade);
  if (g <= 8) {
    return ["riasec", "skills", "bigfive", "eq"];
  }
  if (g <= 10) {
    return ["riasec", "skills", "bigfive", "caas", "workvalues"];
  }
  return ["riasec", "skills", "bigfive", "eq", "caas", "workvalues"];
}

export function isAssessmentVisible(assessmentId: string, grade: number): boolean {
  return getAllowedAssessmentsForGrade(grade).includes(assessmentId);
}
