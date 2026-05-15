
export function parseGrade(grade: any): number {
  if (grade === null || grade === undefined) return 7;
  const numeric = parseInt(grade.toString().replace(/\D/g, ""));
  return isNaN(numeric) ? 7 : numeric;
}

export function isAssessmentVisible(assessmentId: string, grade: number): boolean {
  const g = grade;
  // Level 1: Grades 6-8
  if (g <= 8) {
    return ["riasec", "skills"].includes(assessmentId);
  }
  // Level 2: Grades 9-10
  if (g <= 10) {
    return ["riasec", "skills", "bigfive", "workvalues"].includes(assessmentId);
  }
  // Level 3: Grades 11+
  return true;
}
