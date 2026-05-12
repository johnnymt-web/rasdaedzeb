import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  AlertTriangle, ChevronRight, Users, Calendar, FileText,
  TrendingUp, Clock, CheckCircle2, Loader2
} from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";

interface StudentWithAssessment {
  id: string;
  full_name: string | null;
  grade: string | null;
  school_name?: string | null;
  parents?: string[];
  latestAssessment: {
    completed_at: string | null;
    created_at: string;
    results: unknown;
  } | null;
}

function deriveAttentionItems(students: StudentWithAssessment[], t: any) {
  const items: { id: string; name: string; grade: string; reason: string; urgency: "high" | "medium" | "low" }[] = [];
  const now = Date.now();

  for (const s of students) {
    const name = s.full_name || t("counselor.unnamed_student");
    const grade = s.grade || "—";

    if (!s.latestAssessment) {
      items.push({ id: s.id, name, grade, reason: t("counselor.no_assessment"), urgency: "high" });
    } else if (!s.latestAssessment.completed_at) {
      const started = new Date(s.latestAssessment.created_at).getTime();
      const daysSince = Math.floor((now - started) / (1000 * 60 * 60 * 24));
      if (daysSince > 14) {
        items.push({ id: s.id, name, grade, reason: t("counselor.incomplete_days", { count: daysSince }), urgency: "high" });
      } else if (daysSince > 3) {
        items.push({ id: s.id, name, grade, reason: t("counselor.in_progress_days", { count: daysSince }), urgency: "medium" });
      }
    }
  }

  // Sort by urgency
  const order = { high: 0, medium: 1, low: 2 };
  items.sort((a, b) => order[a.urgency] - order[b.urgency]);
  return items;
}

const CounselorDashboard = () => {
  const { user, profile } = useAuth();
  const { t } = useTranslation();

  const { data, isLoading } = useQuery({
    queryKey: ["counselor-dashboard", user?.id],
    queryFn: async () => {
      try {
        // 1. Get all student IDs from user_roles
        const { data: allStudentRoles, error: rolesErr } = await supabase
          .from("user_roles")
          .select("user_id")
          .eq("role", "student");
        
        if (rolesErr) throw rolesErr;

        const allStudentIds = (allStudentRoles || []).map(r => r.user_id);
        if (allStudentIds.length === 0) {
          return { students: [], totalStudents: 0 };
        }

        // 2. Determine Counselor Scope
        const [{ data: counselorProfile, error: cpErr }, { data: assignments, error: asErr }] = await Promise.all([
          supabase.from("profiles").select("school_id").eq("id", user!.id).single(),
          supabase.from("counselor_students").select("student_id").eq("counselor_id", user!.id)
        ]);

        if (cpErr) throw cpErr;
        if (asErr) throw asErr;

        const assignedIds = (assignments || []).map(a => a.student_id);
        
        // 3. Fetch Profiles for ALL students
        const { data: profiles, error: profErr } = await supabase
          .from("profiles")
          .select("id, full_name, grade, school_id, is_archived")
          .in("id", allStudentIds);

        if (profErr) throw profErr;

        const { data: allSchools, error: schErr } = await supabase.from("schools").select("id, name");
        if (schErr) throw schErr;
        const schoolMap = new Map((allSchools || []).map(s => [s.id, s.name]));

        const scopedProfiles = (profiles || []).filter(p => {
          if (assignedIds.includes(p.id)) return true;
          if (counselorProfile?.school_id && p.school_id === counselorProfile.school_id) return true;
          if (!counselorProfile?.school_id && assignedIds.length === 0) return true;
          if (!p.school_id) return true;
          return false;
        }).filter(p => !p.is_archived);

        const scopedIds = scopedProfiles.map(p => p.id);
        const counselorSchoolName = counselorProfile?.school_id ? schoolMap.get(counselorProfile.school_id) || t("counselor.global_dashboard") : t("counselor.global_dashboard");

        if (scopedIds.length === 0) return { students: [], totalStudents: 0, counselorSchoolName };

        const { data: assessments, error: assErr } = await supabase
          .from("assessments")
          .select("user_id, completed_at, created_at, results")
          .in("user_id", scopedIds)
          .order("created_at", { ascending: false });

        if (assErr) throw assErr;

        const { data: parentLinks, error: plErr } = await supabase.from("parent_students").select("parent_id, student_id").in("student_id", scopedIds);
        if (plErr) throw plErr;

        let parentMap = new Map<string, string[]>();
        
        if (parentLinks && parentLinks.length > 0) {
          const parentIds = [...new Set(parentLinks.map(l => l.parent_id))];
          const { data: parentProfiles, error: ppErr } = await supabase.from("profiles").select("id, full_name").in("id", parentIds);
          if (ppErr) throw ppErr;
          const parentProfileMap = new Map((parentProfiles || []).map(p => [p.id, p.full_name || "Unnamed Parent"]));
          
          for (const link of parentLinks) {
            const parentName = parentProfileMap.get(link.parent_id);
            if (parentName) {
              const existing = parentMap.get(link.student_id) || [];
              parentMap.set(link.student_id, [...existing, parentName]);
            }
          }
        }

        const latestByUser = new Map<string, typeof assessments[0]>();
        for (const a of assessments || []) {
          if (!latestByUser.has(a.user_id)) {
            latestByUser.set(a.user_id, a);
          }
        }

        const students: StudentWithAssessment[] = scopedProfiles.map((p) => ({
          id: p.id,
          full_name: p.full_name,
          grade: p.grade,
          school_name: p.school_id ? schoolMap.get(p.school_id) : t("users.unassigned"),
          parents: parentMap.get(p.id) || [],
          latestAssessment: latestByUser.get(p.id) || null,
        }));

        return { students, totalStudents: students.length, counselorSchoolName };
      } catch (err) {
        throw err;
      }
    },
    enabled: !!user?.id,
  });

  const students = data?.students || [];
  const totalStudents = data?.totalStudents || 0;
  const completedCount = students.filter((s) => s.latestAssessment?.completed_at).length;
  const completionRate = totalStudents > 0 ? Math.round((completedCount / totalStudents) * 100) : 0;
  const attentionItems = deriveAttentionItems(students, t);

  const stats = [
    { label: t("counselor.stat_students"), value: String(totalStudents), icon: Users },
    { label: t("counselor.stat_assessments"), value: `${completionRate}%`, icon: CheckCircle2 },
    { label: t("counselor.stat_attention"), value: String(attentionItems.length), icon: AlertTriangle },
    { label: t("counselor.stat_completed"), value: String(completedCount), icon: Calendar },
  ];

  const hour = new Date().getHours();
  let greetingKey = "counselor.greeting_generic";
  if (hour < 12) greetingKey = "counselor.greeting_morning";
  else if (hour < 17) greetingKey = "counselor.greeting_afternoon";
  else greetingKey = "counselor.greeting_evening";

  const greeting = t(greetingKey, { name: profile?.full_name || "" });

  return (
    <div className="space-y-8">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
          <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <h1 className="text-2xl md:text-3xl font-heading font-bold text-foreground mb-2">
                {greeting}
              </h1>
              <p className="text-muted-foreground">
                {t("counselor.attention_subtitle")}
              </p>
            </div>
            
            {/* Counselor Status */}
            <div className="flex flex-col gap-2 items-start md:items-end p-4 bg-muted/30 rounded-xl border border-border/50">
              <span className="text-sm font-medium text-muted-foreground">{t("counselor.tracking")}</span>
              <div className="flex flex-wrap items-center gap-2 text-sm">
                <span className="bg-primary/10 text-primary border border-primary/20 px-2.5 py-1 rounded-md font-medium">
                  {data?.counselorSchoolName || t("common.loading")}
                </span>
                <span className="bg-background border border-border px-2.5 py-1 rounded-md font-medium text-foreground">
                  {t("counselor.students_count", { count: totalStudents })}
                </span>
              </div>
            </div>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <>
              {/* Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                {stats.map((stat) => (
                  <div key={stat.label} className="card-warm p-4">
                    <stat.icon className="w-5 h-5 text-muted-foreground mb-2" />
                    <div className="text-2xl font-heading font-bold text-foreground">{stat.value}</div>
                    <div className="text-xs text-muted-foreground">{stat.label}</div>
                  </div>
                ))}
              </div>

              <div className="grid lg:grid-cols-5 gap-6">
                {/* Needs attention */}
                <div className="lg:col-span-3">
                  <div className="card-warm p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="font-heading font-semibold text-lg text-foreground flex items-center gap-2">
                        <AlertTriangle className="w-5 h-5 text-secondary" />
                        {t("counselor.attention_title")}
                      </h2>
                      <span className="text-sm text-muted-foreground">{t("counselor.students_count_label", { count: attentionItems.length })}</span>
                    </div>
                    {attentionItems.length === 0 ? (
                      <div className="text-center py-8">
                        <CheckCircle2 className="w-8 h-8 text-primary mx-auto mb-2" />
                        <p className="text-sm text-muted-foreground">{t("counselor.all_on_track")}</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {attentionItems.slice(0, 6).map((student, i) => (
                          <Link key={i} to={`/counselor/student/${student.id}`} className={`flex items-center gap-4 p-3 rounded-lg transition-colors hover:ring-1 hover:ring-border ${
                            student.urgency === "high" ? "surface-rose" : student.urgency === "medium" ? "surface-amber" : "bg-muted/50"
                          }`}>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-semibold text-foreground">{student.name}</span>
                                <span className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                                  {student.grade}
                                </span>
                                {students.find(s => s.id === student.id)?.school_name && (
                                  <span className="text-[10px] text-primary bg-primary/10 px-1.5 py-0.5 rounded font-medium">
                                    {students.find(s => s.id === student.id)?.school_name}
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-2 mt-1">
                                <p className="text-xs text-muted-foreground truncate">{student.reason}</p>
                                {students.find(s => s.id === student.id)?.parents && students.find(s => s.id === student.id)!.parents!.length > 0 && (
                                  <span className="text-[10px] text-amber-600 bg-amber-100 px-1.5 py-0.5 rounded font-medium truncate max-w-[150px]">
                                    {t("counselor.parents_label", { names: students.find(s => s.id === student.id)?.parents?.join(", ") })}
                                  </span>
                                )}
                              </div>
                            </div>
                            <div className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                              student.urgency === "high" ? "badge-rose" : student.urgency === "medium" ? "badge-amber" : "badge-sage"
                            }`}>
                              {t(`common.${student.urgency}`)}
                            </div>
                            <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Sidebar */}
                <div className="lg:col-span-2 space-y-6">
                  {/* Recent completions */}
                  <div className="card-warm p-6">
                    <h2 className="font-heading font-semibold text-lg text-foreground mb-4 flex items-center gap-2">
                      <Clock className="w-5 h-5 text-accent" />
                      {t("counselor.recent_title")}
                    </h2>
                    {(() => {
                      const completed = students
                        .filter((s) => s.latestAssessment?.completed_at)
                        .sort((a, b) =>
                          new Date(b.latestAssessment!.completed_at!).getTime() -
                          new Date(a.latestAssessment!.completed_at!).getTime()
                        )
                        .slice(0, 5);

                      if (completed.length === 0) {
                        return <p className="text-sm text-muted-foreground text-center py-4">{t("counselor.no_recent")}</p>;
                      }

                      return (
                        <div className="space-y-3">
                          {completed.map((s) => (
                            <Link key={s.id} to={`/counselor/student/${s.id}`} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors">
                              <div className="flex-1 min-w-0">
                                <div className="text-sm font-medium text-foreground">{s.full_name || t("counselor.unnamed")}</div>
                                <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                                  <span>{s.grade || "—"}</span>
                                  {s.school_name && (
                                    <span className="bg-muted px-1.5 py-0.5 rounded">{s.school_name}</span>
                                  )}
                                  {s.parents && s.parents.length > 0 && (
                                    <span className="bg-amber-100 text-amber-600 px-1.5 py-0.5 rounded truncate max-w-[120px]">
                                      {t("counselor.parents_label", { names: s.parents.join(", ") })}
                                    </span>
                                  )}
                                </div>
                              </div>
                              <span className="text-xs text-muted-foreground">
                                {new Date(s.latestAssessment!.completed_at!).toLocaleDateString()}
                              </span>
                            </Link>
                          ))}
                        </div>
                      );
                    })()}
                  </div>

                  {/* AI Copilot */}
                  <div className="card-interactive p-6 surface-sky">
                    <h3 className="font-heading font-semibold text-foreground mb-2 flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-accent" />
                      {t("counselor.copilot_title")}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      {t("counselor.copilot_desc")}
                    </p>
                    <div className="space-y-2 mb-4">
                      {[
                        t("counselor.copilot.starters.interventions"), 
                        t("counselor.copilot.starters.subjects"), 
                        t("counselor.copilot.starters.summary")
                      ].map((q) => (
                        <Link key={q} to={`/counselor/coach?prompt=${encodeURIComponent(q)}`} className="w-full text-left text-xs p-2.5 rounded-lg bg-background/80 text-foreground hover:bg-background transition-colors block">
                          {q}
                        </Link>
                      ))}
                    </div>
                    <Button size="sm" className="w-full" asChild>
                      <Link to="/counselor/coach">
                        <FileText className="w-4 h-4" />
                        {t("counselor.copilot_btn")}
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>
            </>
          )}
        </motion.div>
    </div>
  );
};

export default CounselorDashboard;
