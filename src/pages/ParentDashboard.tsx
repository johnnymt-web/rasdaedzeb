import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Heart, MessageCircle, BookOpen, ChevronRight, Loader2, UserPlus, ArrowLeft, Sparkles } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import RiasecRadarChart from "@/components/assessment/RiasecRadarChart";
import { normalizeRiasecResults } from "@/utils/riasec";
import { useTranslation } from "react-i18next";

const SURFACE_COLORS = ["surface-sage", "surface-amber", "surface-sky"];

const ParentDashboard = () => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const location = useLocation();
  const isSupportView = location.pathname === "/parent/support";

  // Fetch all linked students
  const { data: linkedStudents, isLoading: loadingLink } = useQuery({
    queryKey: ["parent-student-links", user?.id],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from("parent_students")
          .select("student_id")
          .eq("parent_id", user!.id);
        if (error) throw error;
        return data || [];
      } catch (err) {
        throw err;
      }
    },
    enabled: !!user?.id,
  });

  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(() => localStorage.getItem("parent_selected_student_id"));

  useEffect(() => {
    if (linkedStudents && linkedStudents.length > 0) {
      const validSelection = linkedStudents.some(s => s.student_id === selectedStudentId);
      if (!selectedStudentId || !validSelection) {
        const firstId = linkedStudents[0].student_id;
        setSelectedStudentId(firstId);
        localStorage.setItem("parent_selected_student_id", firstId);
      }
    }
  }, [linkedStudents, selectedStudentId]);

  const activeStudentId = selectedStudentId || linkedStudents?.[0]?.student_id;

  const handleStudentSelect = (id: string) => {
    setSelectedStudentId(id);
    localStorage.setItem("parent_selected_student_id", id);
  };

  // Fetch student profiles for all children
  const { data: studentProfiles } = useQuery({
    queryKey: ["student-profiles", linkedStudents?.map(l => l.student_id)],
    queryFn: async () => {
      try {
        if (!linkedStudents || linkedStudents.length === 0) return [];
        const ids = linkedStudents.map(l => l.student_id);
        const { data, error } = await supabase
          .from("profiles")
          .select("id, full_name, grade")
          .in("id", ids);
        if (error) throw error;
        return data || [];
      } catch (err) {
        throw err;
      }
    },
    enabled: !!linkedStudents && linkedStudents.length > 0,
  });

  // Fetch student's latest completed assessment
  const { data: latestAssessment, isLoading: loadingAssessment } = useQuery({
    queryKey: ["parent-student-assessment", activeStudentId],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from("assessments")
          .select("*")
          .eq("user_id", activeStudentId!)
          .not("completed_at", "is", null)
          .order("completed_at", { ascending: false })
          .limit(1)
          .single();
        if (error && error.code !== 'PGRST116') throw error; // Ignore 406 Not Found
        return data || null;
      } catch (err) {
        throw err;
      }
    },
    enabled: !!activeStudentId,
  });

  // Fetch all completed assessments for radar chart
  const { data: allAssessments } = useQuery({
    queryKey: ["parent-student-all-assessments", activeStudentId],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from("assessments")
          .select("id, results, completed_at, created_at")
          .eq("user_id", activeStudentId!)
          .not("completed_at", "is", null)
          .order("completed_at", { ascending: false })
          .limit(3);
        if (error) throw error;
        return data || [];
      } catch (err) {
        throw err;
      }
    },
    enabled: !!activeStudentId,
  });

  const activeProfile = studentProfiles?.find(p => p.id === activeStudentId);
  const studentName = activeProfile?.full_name || "Your child";
  const firstName = studentName.split(" ")[0];

  // Parse RIASEC results
  const normalizedResults = normalizeRiasecResults(latestAssessment?.results);
  const topThree = normalizedResults.slice(0, 3);
  const hasAssessment = normalizedResults.length > 0;

  const isLoading = loadingLink || (activeStudentId ? loadingAssessment : false);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  // No linked student
  if (!linkedStudents || linkedStudents.length === 0) {
    return (
      <div className="space-y-8">
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="text-center py-16">
            <UserPlus className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h1 className="text-2xl font-heading font-bold text-foreground mb-2">{t("parent.no_linked")}</h1>
            <p className="text-muted-foreground max-w-md mx-auto">
              {t("parent.no_linked_desc")}
            </p>
        </motion.div>
      </div>
    );
  }

  // No assessment completed yet
  // hasAssessment is already defined above from normalizedResults.length > 0

  return (
    <div className="space-y-8">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
          
          <div className="mb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              {!isSupportView ? (
                <div className="flex items-center justify-between">
                  <h1 className="text-2xl md:text-3xl font-heading font-bold text-foreground">
                    {t("parent.journey", { name: firstName })}
                  </h1>
                </div>
              ) : (
                <div>
                  <Link to="/parent" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4">
                    <ArrowLeft className="w-4 h-4 mr-1.5" />
                    {t("parent.back_profile", { name: firstName })}
                  </Link>
                  <h1 className="text-2xl md:text-3xl font-heading font-bold text-foreground">
                    {t("parent.support_title", { name: firstName })}
                  </h1>
                </div>
              )}
              <p className="text-muted-foreground mt-2">
                {!isSupportView 
                  ? (hasAssessment ? t("parent.review_desc", { name: firstName }) : t("parent.no_assessment", { name: firstName }))
                  : t("parent.support_desc")}
              </p>
            </div>
            
            {/* Status Information */}
            <div className="flex flex-col gap-2 items-start md:items-end p-4 bg-muted/30 rounded-xl border border-border/50">
              <span className="text-sm font-medium text-muted-foreground">{t("parent.my_children")}</span>
              <div className="flex flex-wrap items-center gap-2 text-sm">
                {studentProfiles?.map(child => (
                  <button
                    key={child.id}
                    onClick={() => handleStudentSelect(child.id)}
                    className={`px-3 py-1.5 rounded-md font-medium border transition-colors ${
                      child.id === activeStudentId 
                        ? 'bg-primary/10 text-primary border-primary/30 shadow-sm' 
                        : 'bg-background text-foreground border-border hover:bg-muted'
                    }`}
                  >
                    {child.full_name || "Unnamed"} {child.grade ? `(${child.grade})` : ""}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {!isSupportView ? (
            /* CHILD PROFILE VIEW */
            hasAssessment ? (
              <div className="space-y-6">
                <div className="card-warm p-6">
                  <h2 className="font-heading font-semibold text-lg text-foreground mb-4">
                    {t("parent.noticed", { name: firstName })}
                  </h2>
                  <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                    {firstName} shows strong interests in{" "}
                    <strong className="text-foreground">{topThree[0]?.name}</strong>
                    {topThree[1] && (
                      <>
                        {" "}and{" "}
                        <strong className="text-foreground">{topThree[1]?.name}</strong>
                      </>
                    )}{" "}
                    areas based on their assessment results.
                  </p>
                  <div className="grid grid-cols-3 gap-3 mb-4">
                    {topThree.map((item, i) => (
                      <div key={item.name} className={`p-3 rounded-lg ${SURFACE_COLORS[i]} text-center`}>
                        <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1 font-semibold">
                          {i === 0 ? t("parent.top_match") : i === 1 ? t("parent.secondary") : t("parent.tertiary")}
                        </div>
                        <div className="text-sm font-bold text-foreground">{item.name}</div>
                        <div className="text-xs text-muted-foreground mt-0.5">{item.pct}%</div>
                      </div>
                    ))}
                  </div>
                </div>

                {allAssessments && allAssessments.length > 0 && (
                  <div className="card-warm p-6">
                    <h2 className="font-heading font-semibold text-lg text-foreground mb-4 flex items-center gap-2">
                      <BookOpen className="w-5 h-5 text-primary" />
                      {t("parent.history_profile")}
                    </h2>
                    <RiasecRadarChart
                      assessments={allAssessments.map((a) => ({
                        id: a.id,
                        results: (a.results as { category: string; pct: number }[]) ?? [],
                        completed_at: a.completed_at ?? "",
                        created_at: a.created_at,
                      }))}
                    />
                  </div>
                )}
                
                <div className="flex justify-center pt-4 no-print">
                  <Link to="/parent/support">
                    <Button variant="outline" className="gap-2">
                      <Heart className="w-4 h-4 text-rose-500" />
                      {t("parent.support_guide")}
                    </Button>
                  </Link>
                </div>
              </div>
            ) : (
              <div className="card-warm p-8 text-center">
                <BookOpen className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                <h2 className="font-heading font-semibold text-lg text-foreground mb-2">{t("parent.pending")}</h2>
                <p className="text-sm text-muted-foreground max-w-md mx-auto">
                  {t("parent.pending_desc", { name: firstName })}
                </p>
              </div>
            )
          ) : (
            /* SUPPORT GUIDE VIEW */
            <div className="grid md:grid-cols-2 gap-6">
              <div className="card-warm p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Heart className="w-5 h-5 text-rose-500" />
                  <h2 className="font-heading font-semibold text-lg text-foreground">{t("parent.tips_title")}</h2>
                </div>
                <div className="space-y-3">
                  {[
                    `Ask ${firstName} what they enjoyed most in the assessment`,
                    "Explore career stories together without pressure",
                    "Discuss subjects they find most interesting",
                    "Attend the upcoming parent guidance webinar",
                  ].map((tip, i) => (
                    <div key={i} className="flex items-start gap-3 text-sm">
                      <div className="w-6 h-6 rounded-full bg-rose-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-xs font-semibold text-rose-500">{i + 1}</span>
                      </div>
                      <span className="text-muted-foreground leading-relaxed">{tip}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="card-warm p-6">
                <div className="flex items-center gap-2 mb-4">
                  <MessageCircle className="w-5 h-5 text-primary" />
                  <h2 className="font-heading font-semibold text-lg text-foreground">{t("parent.convo_title")}</h2>
                </div>
                <div className="space-y-3">
                  {[
                    "What did you find most surprising about your results?",
                    `Can you tell me about a career in the ${topThree[0]?.name ?? "top"} area that sounds exciting?`,
                    "What school subjects do you look forward to most?",
                    "Is there a career family you'd like to learn more about?",
                  ].map((q, i) => (
                    <div key={i} className="p-3 rounded-lg surface-sage text-sm text-foreground">
                      "{q}"
                    </div>
                  ))}
                </div>
              </div>

              <div className="card-interactive p-6 surface-amber md:col-span-2">
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles className="w-5 h-5 text-secondary" />
                  <h3 className="font-heading font-semibold text-foreground">{t("parent.ai_title")}</h3>
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                  {t("parent.ai_desc", { name: firstName })}
                </p>
                <div className="space-y-2 mb-4">
                  {[`What do ${firstName}'s results mean?`, "How can I support without pressure?"].map((q) => (
                    <Link key={q} to={`/parent/coach?prompt=${encodeURIComponent(q)}`} className="w-full text-left text-xs p-2.5 rounded-lg bg-background/80 text-foreground hover:bg-background transition-colors block">
                      {q}
                    </Link>
                  ))}
                </div>
                <Link to="/parent/coach">
                  <Button size="sm" variant="warm" className="w-full">
                    {t("parent.consult_coach")}
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </motion.div>
    </div>
  );
};

export default ParentDashboard;

