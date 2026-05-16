import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  AlertTriangle, ChevronRight, Users, Calendar, FileText,
  TrendingUp, Clock, CheckCircle2, Loader2, Info
} from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { normalizeAllAssessments } from "@/utils/assessmentNormalization";

import { getGradeBand } from "@/utils/gradeBands";

interface StudentData {
  id: string;
  full_name: string | null;
  grade: string | null;
  school_name?: string | null;
  parents?: string[];
  normData: ReturnType<typeof normalizeAllAssessments>;
  latestActivityDate: string | null;
}

function deriveSupportNeeds(students: StudentData[], t: any) {
  const items: { id: string; name: string; grade: string; reason: string; urgency: "high" | "medium" | "low" }[] = [];

  for (const s of students) {
    const name = s.full_name || t("counselor.unnamed_student");
    const grade = s.grade || "—";
    const { riasec, caas, skills, eq, bigFive, workValues } = s.normData;
    const band = getGradeBand(s.grade);

    // 1. Missing basic assessment — high priority
    if (!riasec.isComplete) {
      items.push({ id: s.id, name, grade, reason: "Career Interests assessment not started", urgency: "high" });
    }

    // 2. Low CAAS dimensions (score < 3) — needs exploration support
    if (caas.isComplete && caas.results.length > 0) {
      const lowCaas = caas.results.filter(r => (r.score ?? 0) < 3.0);
      if (lowCaas.length > 0) {
        items.push({ 
          id: s.id, name, grade, 
          reason: `Exploration support recommended (${lowCaas.map(c => c.label).join(', ')})`, 
          urgency: "medium" 
        });
      }
    } else if (!caas.isComplete && riasec.isComplete && (band === "planning" || band === "transition")) {
      items.push({ id: s.id, name, grade, reason: "Career Adaptability reflection pending", urgency: "medium" });
    }

    // 3. Narrow exploration profile
    if (riasec.isComplete) {
      const topPct = riasec.results[0]?.pct || 0;
      if (topPct < 40) {
        items.push({ id: s.id, name, grade, reason: "Subject-choice/exploration support recommended", urgency: "medium" });
      }
    }

    // 4. EQ reflection check — low self-awareness or relationship management
    if (eq.isComplete && eq.results.length > 0) {
      const lowEq = eq.results.filter(r => (r.score ?? 0) < 2.5);
      if (lowEq.length > 0) {
        items.push({
          id: s.id, name, grade,
          reason: `Emotional skills growth area (${lowEq.map(e => e.label).join(', ')})`,
          urgency: "low"
        });
      }
    }

    // 5. Subject-choice discussion recommended for Grades 9-10
    if (band === "exploration" && riasec.isComplete && !workValues.isComplete) {
      items.push({ id: s.id, name, grade, reason: "Subject-choice discussion recommended — Work Values not yet completed", urgency: "low" });
    }

    // 6. Transition planning needed for Grades 11+
    if ((band === "planning" || band === "transition") && riasec.isComplete && !caas.isComplete && !skills.isComplete) {
      items.push({ id: s.id, name, grade, reason: "Transition planning needed — key reflections incomplete", urgency: "high" });
    }

    // 7. Portfolio/skills development 
    if (riasec.isComplete && !skills.isComplete && band !== "discovery") {
      items.push({ id: s.id, name, grade, reason: "Employability Skills check recommended", urgency: "low" });
    }
  }

  // Sort by urgency
  const order = { high: 0, medium: 1, low: 2 };
  items.sort((a, b) => order[a.urgency] - order[b.urgency]);
  // deduplicate by student id taking the highest urgency
  const uniqueItems = [];
  const seenIds = new Set();
  for (const item of items) {
    if (!seenIds.has(item.id)) {
      seenIds.add(item.id);
      uniqueItems.push(item);
    }
  }

  return uniqueItems;
}

const CounselorDashboard = () => {
  const { user, profile } = useAuth();
  const { t } = useTranslation();

  const { data, isLoading } = useQuery({
    queryKey: ["counselor-dashboard-enhanced", user?.id],
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
        const [{ data: counselorProfile }, { data: assignments }] = await Promise.all([
          supabase.from("profiles").select("school_id").eq("id", user!.id).single(),
          supabase.from("counselor_students").select("student_id").eq("counselor_id", user!.id)
        ]);

        const assignedIds = (assignments || []).map(a => a.student_id);
        
        // 3. Fetch Profiles for ALL students
        const { data: profiles, error: profErr } = await supabase
          .from("profiles")
          .select("id, full_name, grade, school_id, is_archived")
          .in("id", allStudentIds);

        if (profErr) throw profErr;

        const { data: allSchools } = await supabase.from("schools").select("id, name");
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

        // Fetch all assessments to normalize
        const [stdAss, bigFiveAss, caasAss, workValuesAss, parentLinks] = await Promise.all([
          supabase.from("assessments").select("*").in("user_id", scopedIds).order("created_at", { ascending: false }),
          supabase.from("big_five_assessments").select("*").in("student_id", scopedIds).order("completed_at", { ascending: false }),
          supabase.from("caas_assessments").select("*").in("student_id", scopedIds).order("completed_at", { ascending: false }),
          supabase.from("work_values_assessments").select("*").in("student_id", scopedIds).order("completed_at", { ascending: false }),
          supabase.from("parent_students").select("parent_id, student_id").in("student_id", scopedIds)
        ]);

        let parentMap = new Map<string, string[]>();
        if (parentLinks.data && parentLinks.data.length > 0) {
          const parentIds = [...new Set(parentLinks.data.map(l => l.parent_id))];
          const { data: parentProfiles } = await supabase.from("profiles").select("id, full_name").in("id", parentIds);
          const parentProfileMap = new Map((parentProfiles || []).map(p => [p.id, p.full_name || "Unnamed Parent"]));
          
          for (const link of parentLinks.data) {
            const parentName = parentProfileMap.get(link.parent_id);
            if (parentName) {
              const existing = parentMap.get(link.student_id) || [];
              parentMap.set(link.student_id, [...existing, parentName]);
            }
          }
        }

        const students: StudentData[] = scopedProfiles.map((p) => {
          const sStd = stdAss.data?.filter(a => a.user_id === p.id) || [];
          const sB5 = bigFiveAss.data?.filter(a => a.student_id === p.id) || [];
          const sCaas = caasAss.data?.filter(a => a.student_id === p.id) || [];
          const sWv = workValuesAss.data?.filter(a => a.student_id === p.id) || [];
          
          const normData = normalizeAllAssessments({ std: sStd, bigFive: sB5, caas: sCaas, workValues: sWv });
          
          // Get latest activity
          let latest = null;
          if (sStd.length > 0) latest = sStd[0].created_at;
          
          return {
            id: p.id,
            full_name: p.full_name,
            grade: p.grade,
            school_name: p.school_id ? schoolMap.get(p.school_id) : t("users.unassigned"),
            parents: parentMap.get(p.id) || [],
            normData,
            latestActivityDate: latest
          };
        });

        return { students, totalStudents: students.length, counselorSchoolName };
      } catch (err) {
        throw err;
      }
    },
    enabled: !!user?.id,
  });

  const students = data?.students || [];
  const totalStudents = data?.totalStudents || 0;
  const completedCount = students.filter((s) => s.normData.riasec.isComplete).length;
  const completionRate = totalStudents > 0 ? Math.round((completedCount / totalStudents) * 100) : 0;
  const attentionItems = deriveSupportNeeds(students, t);

  const stats = [
    { label: t("counselor.stat_students"), value: String(totalStudents), icon: Users },
    { label: "Interests Mapped", value: `${completionRate}%`, icon: CheckCircle2 },
    { label: "Needs Support", value: String(attentionItems.length), icon: AlertTriangle },
    { label: "Recent Activity", value: String(students.filter(s => s.latestActivityDate).length), icon: Calendar },
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
                        <Info className="w-5 h-5 text-blue-500" />
                        Students Needing Support
                      </h2>
                      <span className="text-sm text-muted-foreground">{attentionItems.length} students</span>
                    </div>
                    {attentionItems.length === 0 ? (
                      <div className="text-center py-8">
                        <CheckCircle2 className="w-8 h-8 text-primary mx-auto mb-2" />
                        <p className="text-sm text-muted-foreground">{t("counselor.all_on_track")}</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {attentionItems.slice(0, 10).map((student, i) => (
                          <Link key={i} to={`/counselor/student/${student.id}`} className={`flex items-center gap-4 p-3 rounded-lg transition-colors hover:ring-1 hover:ring-border ${
                            student.urgency === "high" ? "bg-rose-50/50" : student.urgency === "medium" ? "bg-amber-50/50" : "bg-muted/50"
                          }`}>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-semibold text-foreground">{student.name}</span>
                                <span className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                                  {student.grade}
                                </span>
                              </div>
                              <div className="flex items-center gap-2 mt-1">
                                <p className="text-xs text-muted-foreground truncate">{student.reason}</p>
                              </div>
                            </div>
                            <div className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                              student.urgency === "high" ? "bg-rose-100 text-rose-700" : student.urgency === "medium" ? "bg-amber-100 text-amber-700" : "bg-slate-100 text-slate-700"
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
                        .filter((s) => s.latestActivityDate)
                        .sort((a, b) =>
                          new Date(b.latestActivityDate!).getTime() -
                          new Date(a.latestActivityDate!).getTime()
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
                                </div>
                              </div>
                              <span className="text-xs text-muted-foreground">
                                {new Date(s.latestActivityDate!).toLocaleDateString()}
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
