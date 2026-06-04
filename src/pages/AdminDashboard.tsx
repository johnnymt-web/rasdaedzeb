import { motion, AnimatePresence } from "framer-motion";
import {
  Users, CheckCircle2, TrendingUp, AlertTriangle,
  BarChart3, ArrowUpRight, ArrowDownRight, Loader2,
  Calendar, UserPlus, Sparkles, ArrowLeft, ArrowRight
} from "lucide-react";
import { useLocation, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import ParentStudentLinker from "@/components/admin/ParentStudentLinker";
import CounselorManagement from "@/components/admin/CounselorManagement";
import SchoolParameters from "@/components/admin/SchoolParameters";
import KnowledgeCMS from "@/components/admin/KnowledgeCMS";
import BulkTools from "@/components/admin/BulkTools";
import UserManagement from "@/components/admin/UserManagement";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { useTranslation } from "react-i18next";

const RIASEC_CATEGORIES = ["Realistic", "Investigative", "Artistic", "Social", "Enterprising", "Conventional"] as const;

const AdminDashboard = () => {
  const location = useLocation();
  const { t } = useTranslation();
  const isSetup = location.pathname === "/admin/setup";
  const isSettings = location.pathname === "/admin/settings";
  const isContent = location.pathname === "/admin/content";
  const isBulk = location.pathname === "/admin/bulk";
  const isUsers = location.pathname === "/admin/users";
  const [selectedSchoolId, setSelectedSchoolId] = useState<string>("all");
  const emptyState = {
    totalStudents: 0,
    completedCount: 0,
    completionRate: 0,
    needingAttention: 0,
    gradeBreakdown: [] as { grade: string; students: number; completion: number }[],
    interestDistribution: [] as { name: string; pct: number }[],
    parentCount: 0,
    parentLinkedCount: 0,
  };

  // Fetch Schools
  const { data: schools = [] } = useQuery({
    queryKey: ["admin-schools"],
    queryFn: async () => {
      try {
        const { data, error } = await supabase.from("schools").select("*").order("name");
        if (error) throw error;
        return data || [];
      } catch (err) {
        throw err;
      }
    }
  });

  // Fetch all student IDs
  const { data: dashData, isLoading } = useQuery({
    queryKey: ["admin-dashboard-data", selectedSchoolId],
    queryFn: async () => {
      try {
        // 1. Get all students
        const { data: studentRoles, error: rolesErr } = await supabase
          .from("user_roles")
          .select("user_id, role")
          .in("role", ["student", "Student"] as any[]);

        if (rolesErr) throw rolesErr;
        
        const allStudentIds = (studentRoles || []).map(r => r.user_id);

        if (allStudentIds.length === 0) {
          return emptyState;
        }

        // 2. Fetch profiles for these students
        let profileQuery = supabase
          .from("profiles")
          .select("id, grade, school_id, is_archived")
          .in("id", allStudentIds);
        
        if (selectedSchoolId !== "all") {
          profileQuery = profileQuery.eq("school_id", selectedSchoolId);
        }

        const { data: profiles, error: profErr } = await profileQuery;
        if (profErr) throw profErr;

        // 3. Scoping & Archival Check
        const activeProfiles = (profiles || []).filter(p => p.is_archived !== true);
        const activeStudentIds = activeProfiles.map(p => p.id);

        if (activeStudentIds.length === 0) {
          return emptyState;
        }

        // 4. Run remaining queries in parallel for active students
        const [
          assResp,
          parentRolesResp,
          parentLinksResp
        ] = await Promise.all([
          supabase.from("assessments").select("user_id, completed_at, results, created_at").in("user_id", activeStudentIds).order("created_at", { ascending: false }),
          supabase.from("user_roles").select("user_id").eq("role", "parent"),
          supabase.from("parent_students").select("parent_id")
        ]);

        if (assResp.error) throw assResp.error;
        if (parentRolesResp.error) throw parentRolesResp.error;
        if (parentLinksResp.error) throw parentLinksResp.error;

        const assessments = assResp.data || [];
        const parentCount = parentRolesResp.data?.length ?? 0;
        const parentLinkedCount = new Set((parentLinksResp.data ?? []).map(l => l.parent_id)).size;

        // Compute latest assessment per student
        const latestByUser = new Map();
        for (const a of assessments) {
          if (!latestByUser.has(a.user_id)) latestByUser.set(a.user_id, a);
        }

        // Completion count
        let completedCount = 0;
        let needingAttention = 0;
        const now = Date.now();

        for (const sid of activeStudentIds) {
          const latest = latestByUser.get(sid);
          if (!latest) {
            needingAttention++;
          } else if (latest.completed_at || latest.created_at) {
            completedCount++;
          } else {
            const started = new Date(latest.created_at).getTime();
            const daysSince = Math.floor((now - started) / (1000 * 60 * 60 * 24));
            if (daysSince > 3) needingAttention++;
          }
        }

        const totalStudents = activeStudentIds.length;
        const completionRate = totalStudents > 0 ? Math.round((completedCount / totalStudents) * 100) : 0;

        // Grade breakdown
        const gradeMap = new Map();
        for (const p of activeProfiles) {
          const grade = p.grade || t("users.unassigned");
          if (!gradeMap.has(grade)) gradeMap.set(grade, { students: 0, completed: 0 });
          gradeMap.get(grade).students++;
          const latest = latestByUser.get(p.id);
          if (latest?.completed_at || latest?.created_at) gradeMap.get(grade).completed++;
        }

        const gradeBreakdown = Array.from(gradeMap.entries())
          .map(([grade, data]) => ({
            grade,
            students: data.students,
            completion: data.students > 0 ? Math.round((data.completed / data.students) * 100) : 0,
          }))
          .sort((a, b) => {
            const numA = parseInt(a.grade.toString().replace(/\D/g, "")) || 99;
            const numB = parseInt(b.grade.toString().replace(/\D/g, "")) || 99;
            return numA - numB;
          });

        // Interest distribution
        const interestCounts: Record<string, number> = {};
        let totalPrimary = 0;

        for (const [, a] of latestByUser) {
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

        const interestDistribution = RIASEC_CATEGORIES
          .map((cat) => ({
            name: t(`assessment.riasec.categories.${cat}`),
            pct: totalPrimary > 0 ? Math.round(((interestCounts[cat] || 0) / totalPrimary) * 100) : 0,
          }))
          .sort((a, b) => b.pct - a.pct);

        return {
          totalStudents,
          completedCount,
          completionRate,
          needingAttention,
          gradeBreakdown,
          interestDistribution,
          parentCount,
          parentLinkedCount,
        };
      } catch (err) {
        throw err;
      }
    },
  });

  const totalStudents = dashData?.totalStudents ?? 0;
  const completedCount = dashData?.completedCount ?? 0;
  const completionRate = dashData?.completionRate ?? 0;
  const needingAttention = dashData?.needingAttention ?? 0;
  const gradeBreakdown = dashData?.gradeBreakdown ?? [];
  const interestDistribution = dashData?.interestDistribution ?? [];
  const parentCount = dashData?.parentCount ?? 0;
  const parentLinkedCount = dashData?.parentLinkedCount ?? 0;
  const parentEngagement = parentCount > 0 ? Math.round((parentLinkedCount / parentCount) * 100) : 0;

  const selectedSchoolName = selectedSchoolId === "all" 
    ? t("admin.global_view") 
    : schools.find(s => s.id === selectedSchoolId)?.name || t("admin.school_overview");

  // Build dynamic action priorities
  const actionPriorities: { title: string; desc: string; surface: string; badge: string; urgency: string }[] = [];

  if (needingAttention > 0) {
    actionPriorities.push({
      title: t("admin.action_followup_title"),
      desc: t("admin.action_followup_desc", { count: needingAttention }),
      surface: "surface-rose",
      badge: "badge-rose",
      urgency: t("admin.urgency_attention"),
    });
  }

  if (parentCount > 0 && parentEngagement < 60) {
    actionPriorities.push({
      title: t("admin.action_parent_title"),
      desc: t("admin.action_parent_desc", { pct: parentEngagement }),
      surface: "surface-amber",
      badge: "badge-amber",
      urgency: t("admin.urgency_important"),
    });
  }

  const lowGrades = gradeBreakdown.filter((g) => g.completion < 50);
  if (lowGrades.length > 0) {
    actionPriorities.push({
      title: t("admin.action_grade_title"),
      desc: t("admin.action_grade_desc", { grades: lowGrades.map((g) => g.grade).join(", ") }),
      surface: "surface-sky",
      badge: "badge-sky",
      urgency: t("admin.urgency_upcoming"),
    });
  }

  if (actionPriorities.length === 0) {
    actionPriorities.push({
      title: t("admin.action_all_good_title"),
      desc: t("admin.action_all_good_desc"),
      surface: "surface-sage",
      badge: "badge-sage",
      urgency: t("admin.urgency_good"),
    });
  }

  const stats = [
    { label: t("admin.stat_total"), value: String(totalStudents), icon: Users },
    { label: t("admin.stat_completion"), value: `${completionRate}%`, icon: CheckCircle2 },
    { label: t("admin.stat_done"), value: String(completedCount), icon: Calendar },
    { label: t("admin.stat_followup"), value: String(needingAttention), icon: AlertTriangle },
  ];

  return (
    <div className="space-y-8">
        {/* School Filter Bar */}
        {!isSetup && !isContent && !isBulk && !isSettings && !isUsers && (
          <div className="mb-8 flex flex-col md:flex-row md:items-center justify-end gap-4">
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-muted-foreground">{t("admin.switch_school")}</span>
              <select 
                value={selectedSchoolId}
                onChange={(e) => setSelectedSchoolId(e.target.value)}
                className="bg-background border border-border rounded-lg px-3 py-1.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20"
                aria-label={t("admin.switch_school")}
              >
                <option value="all">{t("admin.global_view")}</option>
                {schools.map(school => (
                  <option key={school.id} value={school.id}>{school.name}</option>
                ))}
              </select>
            </div>
          </div>
        )}

        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
          <AnimatePresence mode="wait">
            {isSetup ? (
              <motion.div key="setup" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <div className="mb-8">
                  <Link to="/admin" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors">
                    <ArrowLeft className="w-4 h-4 mr-1.5" />
                    {t("admin.back_overview")}
                  </Link>
                  <h1 className="text-2xl md:text-3xl font-heading font-bold text-foreground mb-2">
                    {t("admin.setup_title")}
                  </h1>
                  <p className="text-muted-foreground">
                    {t("admin.setup_desc")}
                  </p>
                </div>
                <ParentStudentLinker />
              </motion.div>
            ) : isContent ? (
              <motion.div key="content" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <div className="mb-8">
                  <Link to="/admin" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors">
                    <ArrowLeft className="w-4 h-4 mr-1.5" />
                    {t("admin.back_overview")}
                  </Link>
                  <h1 className="text-2xl md:text-3xl font-heading font-bold text-foreground mb-2">
                    {t("admin.content_title")}
                  </h1>
                  <p className="text-muted-foreground">
                    {t("admin.content_desc")}
                  </p>
                </div>
                <KnowledgeCMS />
              </motion.div>
            ) : isUsers ? (
              <motion.div key="users" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <div className="mb-8">
                  <Link to="/admin" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors">
                    <ArrowLeft className="w-4 h-4 mr-1.5" />
                    {t("admin.back_overview")}
                  </Link>
                  <h1 className="text-2xl md:text-3xl font-heading font-bold text-foreground mb-2">
                    {t("admin.users_title")}
                  </h1>
                  <p className="text-muted-foreground">
                    {t("admin.users_desc")}
                  </p>
                </div>
                <UserManagement />
              </motion.div>
            ) : isBulk ? (
              <motion.div key="bulk" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <div className="mb-8">
                  <Link to="/admin" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors">
                    <ArrowLeft className="w-4 h-4 mr-1.5" />
                    {t("admin.back_overview")}
                  </Link>
                  <h1 className="text-2xl md:text-3xl font-heading font-bold text-foreground mb-2">
                    {t("admin.bulk_title")}
                  </h1>
                  <p className="text-muted-foreground">
                    {t("admin.bulk_desc")}
                  </p>
                </div>
                <BulkTools />
              </motion.div>
            ) : isSettings ? (
              <motion.div key="settings" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-10">
                <div className="mb-2">
                  <Link to="/admin" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors">
                    <ArrowLeft className="w-4 h-4 mr-1.5" />
                    {t("admin.back_overview")}
                  </Link>
                  <h1 className="text-2xl md:text-3xl font-heading font-bold text-foreground mb-2">
                    {t("admin.settings_title")}
                  </h1>
                  <p className="text-muted-foreground">
                    {t("admin.settings_desc")}
                  </p>
                </div>
                
                <section className="pt-4 border-t border-border">
                  <CounselorManagement />
                </section>

                <section className="pt-10 border-t border-border">
                  <SchoolParameters />
                </section>
              </motion.div>
            ) : (
              <motion.div key="overview" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <div className="mb-8 flex items-center justify-between gap-4">
                  <div>
                    <h1 className="text-2xl md:text-3xl font-heading font-bold text-foreground mb-2">
                      {selectedSchoolName}
                    </h1>
                    <p className="text-muted-foreground">
                      {selectedSchoolId === "all" 
                        ? t("admin.perf_all") 
                        : t("admin.perf_school", { name: selectedSchoolName })}
                    </p>
                  </div>
                  <Link to="/admin/insights">
                    <Button className="gap-2 bg-primary/10 text-primary hover:bg-primary/20 border-none shadow-none">
                      <Sparkles className="w-4 h-4" />
                      {t("admin.ask_ai")}
                    </Button>
                  </Link>
                </div>

                {isLoading ? (
                  <div className="flex items-center justify-center py-20">
                    <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                  </div>
                ) : totalStudents === 0 ? (
                  <div className="card-warm p-8 text-center">
                    <UserPlus className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                    <h2 className="font-heading font-semibold text-lg text-foreground mb-2">{t("admin.no_students_title")}</h2>
                    <p className="text-sm text-muted-foreground max-w-md mx-auto">
                      {t("admin.no_students_desc")}
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="grid md:grid-cols-2 gap-4 mb-8">
                      <Link to="/admin/analytics" className="card-warm p-6 surface-indigo flex items-center justify-between group">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-2xl bg-white/50 flex items-center justify-center text-indigo-600">
                            <TrendingUp className="w-6 h-6" />
                          </div>
                          <div>
                            <h3 className="font-bold text-indigo-900">Strategic Analytics</h3>
                            <p className="text-xs text-indigo-800/60">Subject demand & career trends</p>
                          </div>
                        </div>
                        <ArrowUpRight className="w-5 h-5 text-indigo-400 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                      </Link>
                      <Link to="/admin/users" className="card-warm p-6 bg-white border flex items-center justify-between group">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-2xl bg-muted flex items-center justify-center text-muted-foreground">
                            <Users className="w-6 h-6" />
                          </div>
                          <div>
                            <h3 className="font-bold text-foreground">User Management</h3>
                            <p className="text-xs text-muted-foreground">Students, Counselors, Parents</p>
                          </div>
                        </div>
                        <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:translate-x-1 transition-transform" />
                      </Link>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                      {stats.map((stat) => (
                        <div key={stat.label} className="card-warm p-5">
                          <stat.icon className="w-5 h-5 text-muted-foreground mb-3" />
                          <div className="text-2xl font-heading font-bold text-foreground">{stat.value}</div>
                          <div className="text-xs text-muted-foreground mt-1">{stat.label}</div>
                        </div>
                      ))}
                    </div>

                    <div className="grid lg:grid-cols-2 gap-6">
                      <div className="card-warm p-6">
                        <div className="flex items-center gap-2 mb-5">
                          <BarChart3 className="w-5 h-5 text-primary" />
                          <h2 className="font-heading font-semibold text-lg text-foreground">{t("admin.completion_by_grade")}</h2>
                        </div>
                        {gradeBreakdown.length === 0 ? (
                          <p className="text-sm text-muted-foreground text-center py-4">
                            {t("admin.no_grade_data")}
                          </p>
                        ) : (
                          <div className="space-y-4">
                            {gradeBreakdown.map((g) => (
                              <div key={g.grade}>
                                <div className="flex justify-between text-sm mb-1.5">
                                  <span className="font-medium text-foreground">{g.grade}</span>
                                  <span className="text-muted-foreground">{g.completion}% · {g.students} {t("admin.students")}</span>
                                </div>
                                <div className="w-full h-3 bg-muted rounded-full overflow-hidden">
                                  <div
                                    className="h-full rounded-full bg-primary transition-all duration-500"
                                    style={{ width: `${g.completion}%` }}
                                  />
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="card-warm p-6">
                        <div className="flex items-center gap-2 mb-5">
                          <TrendingUp className="w-5 h-5 text-secondary" />
                          <h2 className="font-heading font-semibold text-lg text-foreground">{t("admin.top_interests")}</h2>
                        </div>
                        <p className="text-sm text-muted-foreground mb-4">
                          {t("admin.top_interests_desc")}
                        </p>
                        {interestDistribution.every((i) => i.pct === 0) ? (
                          <p className="text-sm text-muted-foreground text-center py-4">
                            {t("admin.interest_no_data")}
                          </p>
                        ) : (
                          <div className="space-y-3">
                            {interestDistribution.map((interest) => (
                              <div key={interest.name} className="flex items-center gap-3">
                                <span className="text-sm font-medium text-foreground w-28">{interest.name}</span>
                                <div className="flex-1 h-6 bg-muted rounded-md overflow-hidden">
                                  <div
                                    className="h-full rounded-md bg-secondary/80 flex items-center px-2 transition-all duration-500"
                                    style={{ width: `${Math.max(interest.pct * 3, interest.pct > 0 ? 8 : 0)}%` }}
                                  >
                                    {interest.pct > 0 && (
                                      <span className="text-xs font-medium text-secondary-foreground">{interest.pct}%</span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="card-warm p-6 lg:col-span-2">
                        <h2 className="font-heading font-semibold text-lg text-foreground mb-4">{t("admin.attention_title")}</h2>
                        <div className="grid md:grid-cols-3 gap-4">
                          {actionPriorities.map((action) => (
                            <div key={action.title} className={`p-4 rounded-xl ${action.surface}`}>
                              <span className={`${action.badge} mb-2`}>{action.urgency}</span>
                              <h3 className="font-heading font-semibold text-sm text-foreground mt-2 mb-1">{action.title}</h3>
                              <p className="text-xs text-muted-foreground leading-relaxed">{action.desc}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
    </div>
  );
};

export default AdminDashboard;
