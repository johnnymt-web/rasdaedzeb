import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Sparkles, Target, ShieldCheck, GraduationCap, Briefcase } from "lucide-react";
import { Link } from "react-router-dom";
import EmployabilityTracker from "@/components/student/EmployabilityTracker";
import { useTranslation } from "react-i18next";

export default function StudentSkills() {
  const { t } = useTranslation();

  return (
    <div className="space-y-8">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
          <div className="mb-6">
            <Link to="/student" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="w-4 h-4 mr-1.5" />
              {t("student_skills_page.back")}
            </Link>
          </div>

          <div className="mb-8">
            <h1 className="text-2xl md:text-3xl font-heading font-bold text-foreground mb-2">
              {t("student_skills_page.title")}
            </h1>
            <p className="text-muted-foreground">
              {t("student_skills_page.subtitle")}
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Tracker */}
            <div className="lg:col-span-2 space-y-8">
              <EmployabilityTracker />
              
              <div className="card-warm p-6 bg-secondary/5 border-secondary/20">
                <h3 className="font-heading font-bold text-foreground mb-3 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-secondary" />
                  {t("student_skills_page.why_matter")}
                </h3>
                <div className="space-y-4">
                  <div className="flex gap-4">
                    <div className="w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center shrink-0">
                      <ShieldCheck className="w-5 h-5 text-secondary" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-foreground">{t("student_skills_page.verified_title")}</h4>
                      <p className="text-xs text-muted-foreground mt-1">
                        {t("student_skills_page.verified_desc")}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center shrink-0">
                      <GraduationCap className="w-5 h-5 text-secondary" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-foreground">{t("student_skills_page.transition_title")}</h4>
                      <p className="text-xs text-muted-foreground mt-1">
                        {t("student_skills_page.transition_desc")}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Side Info */}
            <div className="space-y-6">
              <div className="card-warm p-6 surface-amber">
                <h3 className="font-heading font-semibold text-foreground mb-2 flex items-center gap-2">
                  <Target className="w-4 h-4 text-amber-600" />
                  {t("student_skills_page.counselor_review_title")}
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {t("student_skills_page.counselor_review_desc")}
                </p>
              </div>

              <div className="card-warm p-6">
                <h3 className="font-heading font-semibold text-foreground mb-4">{t("assessment_results.skills_gap.comparison_title")}</h3>
                <div className="space-y-3">
                  <div className="p-3 rounded-lg bg-muted/40">
                    <div className="text-[10px] uppercase font-bold text-primary mb-1">{t("assessment_results.skills_gap.discovery_label")}</div>
                    <p className="text-xs text-muted-foreground">{t("assessment_results.skills_gap.discovery_desc")}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-muted/40">
                    <div className="text-[10px] uppercase font-bold text-secondary mb-1">{t("assessment_results.skills_gap.employability_label")}</div>
                    <p className="text-xs text-muted-foreground">{t("assessment_results.skills_gap.employability_desc")}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
    </div>
  );
}
