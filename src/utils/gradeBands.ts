import i18next from "i18next";

export type GradeBand = "discovery" | "alignment" | "decision" | "unknown";

export const getGradeBand = (gradeStr: string | null | undefined): GradeBand => {
  if (!gradeStr) return "unknown";
  
  const match = gradeStr.match(/\d+/);
  if (!match) return "unknown";
  
  const grade = parseInt(match[0], 10);
  
  if (grade >= 6 && grade <= 8) return "discovery";
  if (grade >= 9 && grade <= 10) return "alignment";
  if (grade >= 11 && grade <= 13) return "decision";
  
  return "unknown";
};

export const getBandMessaging = (band: GradeBand) => {
  const t = i18next.t.bind(i18next);
  
  switch (band) {
    case "discovery":
      return {
        dashboardSubtitle: t("bands.discovery.dashboardSubtitle"),
        reportInsight: t("bands.discovery.reportInsight"),
        coachPrompt: t("bands.discovery.coachPrompt"),
      };
    case "alignment":
      return {
        dashboardSubtitle: t("bands.alignment.dashboardSubtitle"),
        reportInsight: t("bands.alignment.reportInsight"),
        coachPrompt: t("bands.alignment.coachPrompt"),
      };
    case "decision":
      return {
        dashboardSubtitle: t("bands.decision.dashboardSubtitle"),
        reportInsight: t("bands.decision.reportInsight"),
        coachPrompt: t("bands.decision.coachPrompt"),
      };
    default:
      return {
        dashboardSubtitle: t("bands.default.dashboardSubtitle"),
        reportInsight: t("bands.default.reportInsight"),
        coachPrompt: t("bands.default.coachPrompt"),
      };
  }
};
