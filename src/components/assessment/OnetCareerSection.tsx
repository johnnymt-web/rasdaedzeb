import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getLocalizedCareersByRiasec, getLocalizedCareerDetail, OnetCareer } from "@/services/onetService";
import { 
  Briefcase, TrendingUp, GraduationCap, 
  ChevronRight, ExternalLink, Loader2,
  AlertCircle, Sparkles, MapPin
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useTranslation } from "react-i18next";
import SkillsGapAnalysis from "@/components/assessment/SkillsGapAnalysis";

interface OnetCareerSectionProps {
  riasecCode: string; // e.g., "RIA"
}

export default function OnetCareerSection({ riasecCode }: OnetCareerSectionProps) {
  const { t, i18n } = useTranslation();
  const lang = i18n.language?.startsWith("ka") ? "ka" : "en";
  const [selectedCareerCode, setSelectedCareerCode] = useState<string | null>(null);

  const { data: careers, isLoading, error } = useQuery({
    queryKey: ["onet-careers", riasecCode, lang],
    queryFn: () => getLocalizedCareersByRiasec(riasecCode, lang),
    enabled: !!riasecCode && riasecCode.length === 3,
  });

  const { data: careerDetail, isLoading: isLoadingDetail } = useQuery({
    queryKey: ["onet-career-detail", selectedCareerCode, lang],
    queryFn: () => getLocalizedCareerDetail(selectedCareerCode!, lang),
    enabled: !!selectedCareerCode,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="card-warm p-6 text-center text-muted-foreground">
        <AlertCircle className="w-8 h-8 mx-auto mb-2 opacity-20" />
        <p className="text-sm">{t("assessment_results.onet.error")}</p>
      </div>
    );
  }

  if (!careers || careers.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <Sparkles className="w-5 h-5 text-primary" />
        <h2 className="font-heading font-semibold text-lg text-foreground">{t("assessment_results.onet.title")}</h2>
      </div>
      
      <div className="grid gap-3">
        {careers?.map((career) => (
          <button
            key={career.code}
            onClick={() => setSelectedCareerCode(career.code)}
            className="flex items-center justify-between p-4 rounded-xl bg-card border border-border hover:border-primary/50 hover:shadow-md transition-all text-left group"
          >
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-heading font-bold text-foreground group-hover:text-primary transition-colors">
                  {career.title}
                </h3>
                {career.outlook && (
                  <Badge 
                    variant="secondary" 
                    className={`${
                      career.outlook === 'Bright Outlook' 
                        ? 'bg-amber-100 text-amber-700 hover:bg-amber-100' 
                        : career.outlook === 'Average'
                          ? 'bg-blue-100 text-blue-700 hover:bg-blue-100'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-100'
                    } text-[10px] py-0 px-2 h-4`}
                  >
                    {t(`assessment_results.onet.outlook.${career.outlook}`, career.outlook)}
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <GraduationCap className="w-3 h-3" /> {t("assessment_results.onet.job_zone")} {career.job_zone}
                </span>
                {career.salary_range && (
                  <span className="flex items-center gap-1">
                    <Briefcase className="w-3 h-3" /> {career.salary_range}
                  </span>
                )}
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
          </button>
        ))}
      </div>

      <Dialog open={!!selectedCareerCode} onOpenChange={(open) => !open && setSelectedCareerCode(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          {isLoadingDetail ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
            </div>
          ) : careerDetail ? (
            <div className="space-y-6">
              <DialogHeader>
                <div className="flex items-center gap-2 mb-1">
                  <DialogTitle className="text-2xl font-heading font-bold text-foreground">
                    {careerDetail.title}
                  </DialogTitle>
                  {careerDetail.outlook && (
                    <Badge 
                      variant="secondary" 
                      className={
                        careerDetail.outlook === 'Bright Outlook' 
                          ? 'bg-amber-100 text-amber-700' 
                          : careerDetail.outlook === 'Average'
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-slate-100 text-slate-700'
                      }
                    >
                      {t(`assessment_results.onet.outlook.${careerDetail.outlook}`, careerDetail.outlook)}
                    </Badge>
                  )}
                </div>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {careerDetail.description}
                </p>
              </DialogHeader>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <h4 className="flex items-center gap-2 text-sm font-bold text-foreground mb-2">
                      <Briefcase className="w-4 h-4 text-primary" /> {t("assessment_results.onet.key_tasks")}
                    </h4>
                    <ul className="space-y-1.5">
                      {careerDetail.tasks?.map((task, i) => (
                        <li key={i} className="text-xs text-muted-foreground flex gap-2">
                          <span className="text-primary">•</span> {task}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h4 className="flex items-center gap-2 text-sm font-bold text-foreground mb-2">
                      <TrendingUp className="w-4 h-4 text-secondary" /> {t("assessment_results.onet.top_skills")}
                    </h4>
                    <div className="flex flex-wrap gap-1.5">
                      {careerDetail.skills?.map((skill, i) => (
                        <Badge key={i} variant="outline" className="text-[10px] font-medium">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <h4 className="flex items-center gap-2 text-sm font-bold text-foreground mb-2">
                      <GraduationCap className="w-4 h-4 text-amber-500" /> {t("assessment_results.onet.education")}
                    </h4>
                    <div className="space-y-1.5">
                      {careerDetail.education?.map((edu, i) => (
                        <div key={i} className="text-xs text-muted-foreground p-2 rounded bg-muted/50">
                          {edu}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="p-4 rounded-xl surface-sage border border-primary/10">
                    <h4 className="flex items-center gap-2 text-sm font-bold text-foreground mb-2">
                      <MapPin className="w-4 h-4 text-primary" /> {t("assessment_results.onet.salary_insight")}
                    </h4>
                    <p className="text-xs text-foreground/80 mb-2">
                      {careerDetail.salary_range 
                        ? t("assessment_results.onet.median_salary", { salary: careerDetail.salary_range }) 
                        : t("assessment_results.onet.salary_fallback")}
                    </p>
                    <p className="text-[10px] text-muted-foreground italic">
                      {t("assessment_results.onet.national_averages")}
                    </p>
                  </div>
                </div>
              </div>

              {/* Skills Gap Analysis */}
              <div className="border-t border-border pt-4">
                <SkillsGapAnalysis
                  occupationCode={careerDetail.code}
                  occupationTitle={careerDetail.title}
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-border">
                <Button variant="outline" size="sm" onClick={() => setSelectedCareerCode(null)}>
                  {t("common.cancel")}
                </Button>
                <Button size="sm" asChild>
                  <a 
                    href={`https://www.onetonline.org/link/summary/${careerDetail.code}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="gap-1.5"
                  >
                    {t("assessment_results.onet.view_on_onet")} <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </Button>
              </div>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
      
      <div className="mt-8 pt-4 border-t border-border/50 text-center">
        <div className="flex flex-col items-center gap-2">
          <a href="https://services.onetcenter.org/" target="_blank" rel="noopener noreferrer" title="This site incorporates information from O*NET Web Services. Click to learn more.">
            <img src="https://www.onetcenter.org/image/link/onet-in-it.svg" className="w-24 h-auto opacity-50 hover:opacity-100 transition-opacity" alt="O*NET in-it" />
          </a>
          <p className="text-[9px] text-muted-foreground leading-relaxed">
            {t("explorer.onet_disclaimer")}
          </p>
        </div>
      </div>
    </div>
  );
}
