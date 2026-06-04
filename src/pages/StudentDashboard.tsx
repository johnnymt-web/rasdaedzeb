import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  Sparkles, ChevronRight, BookOpen, Compass, Target, MessageCircle,
  CheckCircle2, Circle, Clock, Loader2, Briefcase, User
} from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useTranslation } from "react-i18next";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import RiasecRadarChart from "@/components/assessment/RiasecRadarChart";
import { normalizeRiasecResults, RIASEC_CATEGORIES } from "@/utils/riasec";
import { getGradeBand, getBandMessaging } from "@/utils/gradeBands";

interface AssessmentResult {
  category: string;
  pct: number;
  score?: number;
}

const StudentDashboard = () => {
  const { user, profile } = useAuth();
  const { t } = useTranslation();

  const { data: allAssessments, isLoading } = useQuery({
    queryKey: ["all-assessments", user?.id],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from("assessments")
          .select("*")
          .eq("user_id", user!.id)
          .order("created_at", { ascending: false });
        if (error) throw error;
        return data || [];
      } catch (err) {
        throw err;
      }
    },
    enabled: !!user?.id,
  });

  const latestAssessment = allAssessments?.find(a => {
    if (a.assessment_type?.toLowerCase() === 'skills') return false;
    const results = a.results as any[];
    if (!Array.isArray(results)) return false;
    
    // Check for any RIASEC category, ignoring case
    return results.some((r) => {
      const cat = (r.category || r.key || r.label || "").toLowerCase();
      return RIASEC_CATEGORIES.some(baseCat => baseCat.toLowerCase() === cat);
    });
  });

  const { data: assessmentCount } = useQuery({
    queryKey: ["assessment-count", user?.id],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from("assessments")
          .select("id")
          .eq("user_id", user!.id)
          .not("completed_at", "is", null);
        if (error) throw error;
        return data?.length ?? 0;
      } catch (err) {
        throw err;
      }
    },
    enabled: !!user?.id,
  });

  const { data: followUps = [] } = useQuery({
    queryKey: ["student-follow-ups", user?.id],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from("counselor_follow_ups")
          .select("*")
          .eq("student_id", user!.id)
          .eq("status", "pending");
        if (error) throw error;
        return data || [];
      } catch (err) {
        throw err;
      }
    },
    enabled: !!user?.id,
  });

  const { data: studentInfo } = useQuery({
    queryKey: ["student-status-info", user?.id],
    queryFn: async () => {
      try {
        let schoolName = t("dashboard.student.unknown_school", "Unassigned School");
        let counselorName = t("dashboard.student.unknown_counselor", "Unassigned Counselor");

        if (profile?.school_id) {
          const { data: schoolData, error: sErr } = await supabase.from("schools").select("name").eq("id", profile.school_id).maybeSingle();
          if (sErr) throw sErr;
          if (schoolData) schoolName = schoolData.name;
        }

        const { data: assignment, error: aErr } = await supabase.from("counselor_students").select("counselor_id").eq("student_id", user!.id).maybeSingle();
        if (aErr) throw aErr;

        if (assignment) {
          const { data: counselorData, error: cErr } = await supabase.from("profiles").select("full_name").eq("id", assignment.counselor_id).maybeSingle();
          if (cErr) throw cErr;
          if (counselorData && counselorData.full_name) counselorName = counselorData.full_name;
        }

        return { schoolName, counselorName };
      } catch (err) {
        throw err;
      }
    },
    enabled: !!user?.id && !!profile,
  });

  const hasCompleted = !!latestAssessment?.completed_at;
  const rawResults = latestAssessment?.results;

  const topInterests = normalizeRiasecResults(rawResults).slice(0, 3);



  // Dynamic journey steps - Two-Pillar Architecture
  const journeySteps = [
    {
      title: t("dashboard.student.journey_steps.assessment"),
      status: hasCompleted ? "completed" : "current",
      label: hasCompleted 
        ? `${t("dashboard.student.journey_steps.completed")}${assessmentCount && assessmentCount > 1 ? ` (${assessmentCount}×)` : ""}` 
        : t("dashboard.student.journey_steps.start_now"),
      to: "/student/assessment",
    },
    {
      title: t("dashboard.student.journey_steps.profile"),
      status: hasCompleted ? "current" : "locked",
      label: hasCompleted ? t("dashboard.student.journey_steps.view_trends") : t("dashboard.student.journey_steps.locked"),
      to: "/student/report",
    },
    {
      title: "Career Exposure",
      status: hasCompleted ? "current" : "locked",
      label: hasCompleted ? "Log Activities" : t("dashboard.student.journey_steps.locked"),
      to: "/student/exposure",
    },
    {
      title: "Action Plan",
      status: hasCompleted ? "current" : "locked",
      label: hasCompleted ? "Manage Tasks" : t("dashboard.student.journey_steps.locked"),
      to: "/student/actions",
    },
    {
      title: t("dashboard.student.journey_steps.portfolio"),
      status: hasCompleted ? "current" : "locked",
      label: hasCompleted ? t("dashboard.student.journey_steps.open_portfolio") : t("dashboard.student.journey_steps.locked"),
      to: "/student/portfolio",
    },
    {
      title: t("dashboard.student.journey_steps.skills"),
      status: hasCompleted ? "current" : "locked",
      label: hasCompleted ? t("dashboard.student.journey_steps.mark_skills") : t("dashboard.student.journey_steps.locked"),
      to: "/student/skills",
    },
  ];

  const completedCount = journeySteps.filter((s) => s.status === "completed").length;
  const firstName = profile?.full_name?.split(" ")[0] || t("common.user", "there");
  
  const band = getGradeBand(profile?.grade);
  const messaging = getBandMessaging(band);

  return (
    <div className="space-y-8">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
          {/* Welcome */}
          <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <h1 className="text-2xl md:text-3xl font-heading font-bold text-foreground mb-2">
                {t("dashboard.student.welcome", { name: firstName })}
              </h1>
              <p className="text-muted-foreground">
                {hasCompleted
                  ? t("dashboard.student.progress_subtitle")
                  : messaging.dashboardSubtitle}
              </p>
            </div>
            
            {/* Status Information */}
            <div className="flex flex-col gap-3 items-start md:items-end p-4 bg-muted/30 rounded-xl border border-border/50">
              <div className="flex flex-wrap items-center gap-2 text-sm">
                {profile?.grade && (
                  <span className="bg-background border border-border px-2.5 py-1 rounded-md font-medium text-foreground">{profile.grade}</span>
                )}
                <span className="bg-primary/10 text-primary border border-primary/20 px-2.5 py-1 rounded-md font-medium">
                  {studentInfo?.schoolName || t("dashboard.student.school_loading")}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-muted-foreground flex items-center gap-1.5">
                  <User className="w-4 h-4" />
                  {t("dashboard.student.counselor_label")} <strong className="text-foreground">{studentInfo?.counselorName || t("dashboard.student.counselor_loading")}</strong>
                </span>
                <Link to="/student/coach">
                  <Button size="sm" variant="outline" className="gap-1.5 h-8">
                    <MessageCircle className="w-3.5 h-3.5" />
                    {t("dashboard.student.chat")}
                  </Button>
                </Link>
              </div>
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Main content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Progress card */}
              <div className="card-warm p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-heading font-semibold text-lg text-foreground">{t("dashboard.student.journey_title")}</h2>
                  <span className="badge-sage">{t("dashboard.student.journey_progress", { completed: completedCount, total: journeySteps.length })}</span>
                </div>
                <div className="space-y-3">
                  {journeySteps.map((step, i) => (
                    <div key={i} className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
                      step.status === "current" ? "surface-amber" : ""
                    }`}>
                      {step.status === "completed" ? (
                        <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0" />
                      ) : step.status === "current" ? (
                        <Circle className="w-5 h-5 text-secondary flex-shrink-0" />
                      ) : (
                        <Clock className="w-5 h-5 text-muted-foreground/40 flex-shrink-0" />
                      )}
                      <span className={`flex-1 text-sm font-medium ${
                        step.status === "locked" ? "text-muted-foreground/50" : "text-foreground"
                      }`}>{step.title}</span>
                      {step.status === "current" && (
                        <Link to={step.to}>
                          <Button size="sm" variant="warm">
                            {step.label}
                            <ChevronRight className="w-4 h-4" />
                          </Button>
                        </Link>
                      )}
                      {step.status === "completed" && (
                        <span className="text-xs text-primary font-medium">{step.label}</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Career Discovery Profile (RIASEC) */}
              <div className="card-warm p-6">
                <h2 className="font-heading font-semibold text-lg text-foreground mb-3">Career Discovery Profile</h2>
                {isLoading ? (
                  <div className="flex items-center gap-2 text-muted-foreground py-4">
                    <Loader2 className="w-4 h-4 animate-spin" /> {t("dashboard.student.loading_results")}
                  </div>
                ) : topInterests.length > 0 ? (
                  <>
                    <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                      {t("dashboard.student.top_interests", { 
                        list: topInterests.map((item, i) => {
                          if (i === 0) return item.label;
                          if (i === topInterests.length - 1) return ` ${t("common.and") || "and"} ${item.label}`;
                          return `, ${item.label}`;
                        }).join('')
                      })}
                    </p>
                    <div className="space-y-3">
                      {topInterests.map((interest) => (
                        <div key={interest.name}>
                          <div className="flex justify-between text-sm mb-1">
                            <span className="font-medium text-foreground">{interest.label}</span>
                            <span className="text-muted-foreground">{interest.pct}%</span>
                          </div>
                          <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                            <div className={`h-full rounded-full ${interest.color}`} style={{ width: `${interest.pct}%` }} />
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="mt-5">
                      <h3 className="text-sm font-medium text-foreground mb-2">{t("dashboard.student.riasec_profile")}</h3>
                      <RiasecRadarChart
                        assessments={[{
                          id: latestAssessment!.id,
                          results: rawResults as Array<{ category: string; pct: number }>,
                          completed_at: latestAssessment!.completed_at || "",
                          created_at: latestAssessment!.created_at,
                        }]}
                      />
                    </div>
                    <div className="flex gap-2 mt-6">
                      <Link to="/student/report">
                        <Button variant="outline" size="sm">
                          {t("dashboard.student.full_report")}
                          <ChevronRight className="w-4 h-4" />
                        </Button>
                      </Link>
                      <Link to="/student/assessment/history">
                        <Button variant="ghost" size="sm">
                          {t("dashboard.student.compare")}
                          <ChevronRight className="w-4 h-4" />
                        </Button>
                      </Link>
                    </div>
                  </>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    {t("dashboard.student.no_assessment")}
                  </p>
                )}
              </div>

              {/* Pending Action Items from Counselor */}
              {followUps.length > 0 && (
                <div className="card-warm p-6 surface-rose">
                  <h2 className="font-heading font-semibold text-lg text-foreground mb-3 flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-destructive animate-pulse"></span>
                    {t("dashboard.student.actions_needed")}
                  </h2>
                  <div className="space-y-2">
                    {followUps.map((action) => (
                      <div key={action.id} className="p-3 bg-background/60 rounded-lg flex items-start gap-3">
                        <CheckCircle2 className="w-5 h-5 text-muted-foreground mt-0.5 opacity-50" />
                        <div>
                          <p className="text-sm font-medium text-foreground">{action.title}</p>
                          <p className="text-xs text-muted-foreground mt-1">{t("dashboard.student.assigned_by")}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* AI Coach */}
              <div className="card-interactive p-6 surface-sage">
                <div className="flex items-center gap-2 mb-3">
                  <MessageCircle className="w-5 h-5 text-primary" />
                  <h3 className="font-heading font-semibold text-foreground">{t("dashboard.student.coach.title")}</h3>
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                  {t("dashboard.student.coach.desc")}
                </p>
                <div className="space-y-2 mb-4">
                  {[
                    { key: "match", text: t("dashboard.student.coach.prompts.match") },
                    { key: "strengths", text: t("dashboard.student.coach.prompts.strengths") },
                    { key: "subjects", text: t("dashboard.student.coach.prompts.subjects") }
                  ].map((q) => (
                    <Link key={q.key} to={`/student/coach?prompt=${encodeURIComponent(q.text)}`} className="block w-full text-left text-xs p-2.5 rounded-lg bg-background/80 text-foreground hover:bg-background transition-colors">
                      <Sparkles className="w-3 h-3 inline mr-1.5 text-primary" />
                      {q.text}
                    </Link>
                  ))}
                </div>
                <Link to="/student/coach">
                  <Button size="sm" variant="default" className="w-full">
                    {t("dashboard.student.coach.cta")}
                  </Button>
                </Link>
              </div>

              {/* Quick links */}
              <div className="card-warm p-6">
                <h3 className="font-heading font-semibold text-foreground mb-3">{t("dashboard.student.quick_explore.title")}</h3>
                <div className="space-y-2">
                  {[
                    { icon: Compass, label: "Career Exposure", desc: "Log your exploration", to: "/student/exposure" },
                    { icon: Target, label: "Action Plan", desc: "Manage your goals", to: "/student/actions" },
                    { icon: BookOpen, label: t("dashboard.student.quick_explore.careers.label"), desc: t("dashboard.student.quick_explore.careers.desc"), to: "/student/explore" },
                    { icon: Briefcase, label: t("dashboard.student.quick_explore.opportunities.label"), desc: t("dashboard.student.quick_explore.opportunities.desc"), to: "/student/opportunities" }
                  ].map((item) => (
                    <Link key={item.label} to={item.to} className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-muted transition-colors text-left">
                      <item.icon className="w-5 h-5 text-muted-foreground" />
                      <div>
                        <div className="text-sm font-medium text-foreground">{item.label}</div>
                        <div className="text-xs text-muted-foreground">{item.desc}</div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
    </div>
  );
};

export default StudentDashboard;
