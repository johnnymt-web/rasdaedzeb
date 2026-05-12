import { motion } from "framer-motion";
import { 
  BarChart3, TrendingUp, Users, CheckCircle2, 
  Clock, ArrowLeft, Loader2, PieChart
} from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";

const RIASEC_CATEGORIES = ["Realistic", "Investigative", "Artistic", "Social", "Enterprising", "Conventional"] as const;

export default function CounselorInsights() {
  const { t } = useTranslation();

  const { data: insights, isLoading } = useQuery({
    queryKey: ["counselor-group-insights"],
    queryFn: async () => {
      // 1. Get all students
      const { data: studentRoles } = await supabase.from("user_roles").select("user_id").eq("role", "student");
      const studentIds = (studentRoles || []).map(r => r.user_id);

      if (studentIds.length === 0) return null;

      // 2. Fetch profiles & assessments
      const [profilesResp, assessmentsResp] = await Promise.all([
        supabase.from("profiles").select("id, grade").in("id", studentIds),
        supabase.from("assessments").select("user_id, completed_at, results").in("user_id", studentIds).order("created_at", { ascending: false })
      ]);

      const assessments = assessmentsResp.data || [];
      const profiles = profilesResp.data || [];

      // Latest assessment per student
      const latestByUser = new Map();
      for (const a of assessments) {
        if (!latestByUser.has(a.user_id)) latestByUser.set(a.user_id, a);
      }

      // Metrics
      const total = studentIds.length;
      const completed = Array.from(latestByUser.values()).filter(a => a.completed_at).length;
      const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

      // Interest Distribution
      const interestCounts: Record<string, number> = {};
      let totalPrimary = 0;
      for (const a of latestByUser.values()) {
        if (!a.completed_at || !a.results) continue;
        const results = a.results as any[];
        if (!Array.isArray(results) || results.length === 0) continue;
        const sorted = [...results].sort((x, y) => y.pct - x.pct);
        const primary = sorted[0]?.category;
        if (primary) {
          interestCounts[primary] = (interestCounts[primary] || 0) + 1;
          totalPrimary++;
        }
      }

      const interestDistribution = RIASEC_CATEGORIES.map(cat => ({
        name: cat,
        pct: totalPrimary > 0 ? Math.round(((interestCounts[cat] || 0) / totalPrimary) * 100) : 0
      })).sort((a, b) => b.pct - a.pct);

      // Grade Breakdown
      const gradeMap = new Map();
      for (const p of profiles) {
        const g = p.grade || t("users.unassigned");
        if (!gradeMap.has(g)) gradeMap.set(g, { total: 0, done: 0 });
        const entry = gradeMap.get(g);
        entry.total++;
        if (latestByUser.get(p.id)?.completed_at) entry.done++;
      }

      const gradeBreakdown = Array.from(gradeMap.entries()).map(([grade, d]) => ({
        grade,
        count: d.total,
        pct: d.total > 0 ? Math.round((d.done / d.total) * 100) : 0
      })).sort((a, b) => (parseInt(a.grade) || 0) - (parseInt(b.grade) || 0));

      return { total, completionRate, completed, interestDistribution, gradeBreakdown };
    }
  });

  return (
    <div className="space-y-8">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
          <div className="mb-6">
            <Link to="/counselor" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground">
              <ArrowLeft className="w-4 h-4 mr-1.5" />
              {t("counselor.back_dashboard")}
            </Link>
          </div>

          <div className="mb-8">
            <h1 className="text-2xl md:text-3xl font-heading font-bold text-foreground mb-2">
              {t("counselor.insights_title")}
            </h1>
            <p className="text-muted-foreground max-w-2xl">
              {t("counselor.insights_desc")}
            </p>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : !insights ? (
            <div className="card-warm p-12 text-center">
              <Users className="w-10 h-10 text-muted-foreground mx-auto mb-4" />
              <h2 className="text-lg font-heading font-bold mb-2">{t("users.no_users")}</h2>
              <p className="text-sm text-muted-foreground">{t("admin.interest_no_data")}</p>
            </div>
          ) : (
            <div className="space-y-8">
              {/* Quick stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="card-warm p-5">
                  <Users className="w-5 h-5 text-primary mb-3" />
                  <div className="text-2xl font-heading font-bold">{insights.total}</div>
                  <div className="text-xs text-muted-foreground">{t("counselor.stat_students")}</div>
                </div>
                <div className="card-warm p-5">
                  <CheckCircle2 className="w-5 h-5 text-green-500 mb-3" />
                  <div className="text-2xl font-heading font-bold">{insights.completionRate}%</div>
                  <div className="text-xs text-muted-foreground">{t("admin.stat_completion")}</div>
                </div>
                <div className="card-warm p-5">
                  <Clock className="w-5 h-5 text-amber-500 mb-3" />
                  <div className="text-2xl font-heading font-bold">{insights.total - insights.completed}</div>
                  <div className="text-xs text-muted-foreground">{t("admin.stat_followup")}</div>
                </div>
                <div className="card-warm p-5">
                  <TrendingUp className="w-5 h-5 text-accent mb-3" />
                  <div className="text-2xl font-heading font-bold">RIASEC</div>
                  <div className="text-xs text-muted-foreground">{t("assessment.riasec.summary")}</div>
                </div>
              </div>

              <div className="grid lg:grid-cols-2 gap-6">
                {/* Interest Chart */}
                <div className="card-warm p-6">
                  <div className="flex items-center gap-2 mb-6">
                    <PieChart className="w-5 h-5 text-primary" />
                    <h2 className="font-heading font-semibold text-lg">{t("counselor.interest_dist")}</h2>
                  </div>
                  <div className="space-y-4">
                    {insights.interestDistribution.map((i) => (
                      <div key={i.name}>
                        <div className="flex justify-between text-xs mb-1.5 font-medium">
                          <span>{t(`assessment.riasec.categories.${i.name}`)}</span>
                          <span className="text-muted-foreground">{i.pct}%</span>
                        </div>
                        <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-primary/80 transition-all duration-700"
                            style={{ width: `${i.pct}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Grade progress */}
                <div className="card-warm p-6">
                  <div className="flex items-center gap-2 mb-6">
                    <BarChart3 className="w-5 h-5 text-secondary" />
                    <h2 className="font-heading font-semibold text-lg">{t("counselor.progress_grade")}</h2>
                  </div>
                  <div className="space-y-6">
                    {insights.gradeBreakdown.map((g) => (
                      <div key={g.grade}>
                        <div className="flex justify-between items-end mb-2">
                          <div>
                            <span className="text-sm font-bold">{g.grade}</span>
                            <span className="text-[10px] text-muted-foreground ml-2 uppercase tracking-wider">{t("counselor.students_count", { count: g.count })}</span>
                          </div>
                          <span className="text-xs font-semibold">{t("counselor.done_label", { pct: g.pct })}</span>
                        </div>
                        <div className="w-full h-4 bg-muted rounded-md overflow-hidden p-0.5">
                          <div 
                            className="h-full bg-secondary/70 rounded-sm transition-all duration-1000"
                            style={{ width: `${g.pct}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </motion.div>
    </div>
  );
}
