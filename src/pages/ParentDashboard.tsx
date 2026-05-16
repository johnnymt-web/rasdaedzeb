import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { 
  Heart, MessageCircle, BookOpen, ChevronRight, Loader2, UserPlus, 
  ArrowLeft, Sparkles, Compass, Target, GraduationCap, Map, Star,
  Info, Calendar, CheckCircle2, Circle
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import RiasecRadarChart from "@/components/assessment/RiasecRadarChart";
import { normalizeRiasecResults } from "@/utils/riasec";
import { useTranslation } from "react-i18next";
import { format } from "date-fns";

const SURFACE_COLORS = ["surface-sage", "surface-amber", "surface-sky"];

type TabID = "overview" | "exposure" | "plans" | "pathways" | "support";

const ParentDashboard = () => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState<TabID>("overview");

  // Fetch linked students
  const { data: linkedStudents, isLoading: loadingLink } = useQuery({
    queryKey: ["parent-student-links", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("parent_students")
        .select("student_id")
        .eq("parent_id", user!.id);
      if (error) throw error;
      return data || [];
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

  // Student Profile
  const { data: activeProfile } = useQuery({
    queryKey: ["parent-active-student-profile", activeStudentId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, full_name, grade")
        .eq("id", activeStudentId!)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!activeStudentId,
  });

  // Latest Assessment
  const { data: latestAssessment, isLoading: loadingAssessment } = useQuery({
    queryKey: ["parent-student-assessment", activeStudentId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("assessments")
        .select("*")
        .eq("user_id", activeStudentId!)
        .not("completed_at", "is", null)
        .order("completed_at", { ascending: false })
        .limit(1)
        .single();
      if (error && error.code !== 'PGRST116') throw error;
      return data || null;
    },
    enabled: !!activeStudentId,
  });

  // Career Exposure
  const { data: exposures = [], isLoading: loadingExposures } = useQuery({
    queryKey: ["parent-student-exposures", activeStudentId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("career_exposure_activities")
        .select("*")
        .eq("student_id", activeStudentId!)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data || [];
    },
    enabled: !!activeStudentId && activeTab === "exposure",
  });

  // Action Plans
  const { data: actionPlans = [], isLoading: loadingActionPlans } = useQuery({
    queryKey: ["parent-student-action-plans", activeStudentId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("student_action_plans")
        .select("*")
        .eq("student_id", activeStudentId!)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data || [];
    },
    enabled: !!activeStudentId && activeTab === "plans",
  });

  // Pathway Architect
  const { data: pathways = [], isLoading: loadingPathways } = useQuery({
    queryKey: ["parent-student-pathways", activeStudentId],
    queryFn: async () => {
      const { data, error } = await (supabase.from("student_career_pathways" as any) as any)
        .select("*")
        .eq("student_id", activeStudentId!)
        .order("created_at", { ascending: true });
      if (error) throw error;
      return data || [];
    },
    enabled: !!activeStudentId && activeTab === "pathways",
  });

  const studentName = activeProfile?.full_name || "Your child";
  const firstName = studentName.split(" ")[0];

  const normalizedResults = normalizeRiasecResults(latestAssessment?.results);
  const topThree = normalizedResults.slice(0, 3);
  const hasAssessment = normalizedResults.length > 0;

  const isLoading = loadingLink || (activeStudentId && activeTab === "overview" && loadingAssessment);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  if (!linkedStudents || linkedStudents.length === 0) {
    return (
      <div className="text-center py-16">
        <UserPlus className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
        <h1 className="text-2xl font-heading font-bold text-foreground mb-2">{t("parent.no_linked")}</h1>
        <p className="text-muted-foreground max-w-md mx-auto">{t("parent.no_linked_desc")}</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-12">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        
        {/* Header & Student Selector */}
        <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="text-3xl font-heading font-bold text-foreground mb-2">
              {t("parent.journey", { name: firstName })}
            </h1>
            <p className="text-muted-foreground">
              {hasAssessment ? t("parent.review_desc", { name: firstName }) : t("parent.no_assessment", { name: firstName })}
            </p>
          </div>
          
          <div className="flex flex-col gap-2 items-start md:items-end p-4 bg-muted/30 rounded-2xl border border-border/50">
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{t("parent.my_children")}</span>
            <div className="flex flex-wrap items-center gap-2">
              {linkedStudents.map(childLink => (
                <button
                  key={childLink.student_id}
                  onClick={() => {
                    setSelectedStudentId(childLink.student_id);
                    localStorage.setItem("parent_selected_student_id", childLink.student_id);
                  }}
                  className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                    childLink.student_id === activeStudentId 
                      ? 'bg-primary text-white shadow-lg shadow-primary/20' 
                      : 'bg-white text-foreground border border-border hover:bg-muted'
                  }`}
                >
                  {childLink.student_id === activeStudentId ? activeProfile?.full_name : "Child View"}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex flex-wrap gap-2 mb-8 bg-muted/20 p-1 rounded-2xl w-fit">
          {[
            { id: "overview", label: "Overview", icon: BookOpen },
            { id: "exposure", label: "Exposure", icon: Compass },
            { id: "plans", label: "Actions", icon: Target },
            { id: "pathways", label: "Pathways", icon: Map },
            { id: "support", label: "Support Guide", icon: Heart },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as TabID)}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${
                activeTab === tab.id
                  ? "bg-white text-primary shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <tab.icon className={`w-4 h-4 ${activeTab === tab.id ? "text-primary" : ""}`} />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.2 }}
          >
            {activeTab === "overview" && (
              <div className="space-y-6">
                {!hasAssessment ? (
                  <div className="card-warm p-12 text-center">
                    <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <h2 className="text-xl font-bold mb-2">{t("parent.pending")}</h2>
                    <p className="text-muted-foreground max-w-md mx-auto">{t("parent.pending_desc", { name: firstName })}</p>
                  </div>
                ) : (
                  <div className="grid lg:grid-cols-2 gap-6">
                    <div className="card-warm p-8">
                      <h2 className="font-heading font-bold text-xl mb-6">{t("parent.noticed", { name: firstName })}</h2>
                      <div className="space-y-6">
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                          {topThree.map((item, i) => (
                            <div key={item.name} className={`p-4 rounded-2xl ${SURFACE_COLORS[i]} text-center border border-black/5`}>
                              <div className="text-[10px] uppercase font-bold text-muted-foreground/60 mb-1">
                                {i === 0 ? t("parent.top_match") : i === 1 ? t("parent.secondary") : t("parent.tertiary")}
                              </div>
                              <div className="text-sm font-bold text-foreground">{item.name}</div>
                              <div className="text-xs text-muted-foreground font-medium mt-1">{item.pct}%</div>
                            </div>
                          ))}
                        </div>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          {firstName} shows strong alignment with <span className="font-bold text-foreground">{topThree[0]?.name}</span> environments. 
                          These roles often involve {topThree[0]?.name === "Investigative" ? "critical thinking and research" : "hands-on projects and problem solving"}.
                        </p>
                      </div>
                    </div>
                    <div className="card-warm p-8">
                      <h2 className="font-heading font-bold text-xl mb-6 flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-primary" />
                        {t("parent.history_profile")}
                      </h2>
                      <RiasecRadarChart
                        assessments={latestAssessment ? [{
                          id: latestAssessment.id,
                          results: (latestAssessment.results as any[]) ?? [],
                          completed_at: latestAssessment.completed_at ?? "",
                          created_at: latestAssessment.created_at,
                        }] : []}
                      />
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === "exposure" && (
              <div className="card-warm p-8">
                <h2 className="text-2xl font-heading font-bold mb-6 flex items-center gap-2">
                  <Compass className="w-6 h-6 text-primary" />
                  Career Exploration Logs
                </h2>
                {loadingExposures ? (
                  <Loader2 className="w-6 h-6 animate-spin mx-auto" />
                ) : exposures.length === 0 ? (
                  <div className="text-center py-12 border-2 border-dashed rounded-3xl">
                    <p className="text-muted-foreground">No exploration activities logged yet.</p>
                  </div>
                ) : (
                  <div className="grid md:grid-cols-2 gap-4">
                    {exposures.map((activity: any) => (
                      <div key={activity.id} className="p-5 bg-white border rounded-2xl shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start mb-3">
                          <div className="bg-primary/5 text-primary text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded">
                            {activity.activity_type.replace('_', ' ')}
                          </div>
                          <span className="text-[10px] text-muted-foreground">{format(new Date(activity.created_at), "MMM d, yyyy")}</span>
                        </div>
                        <h4 className="font-bold text-foreground mb-1">{activity.title}</h4>
                        {activity.reflection && (
                          <p className="text-xs text-muted-foreground italic line-clamp-2 mt-2">"{activity.reflection}"</p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === "plans" && (
              <div className="card-warm p-8">
                <h2 className="text-2xl font-heading font-bold mb-6 flex items-center gap-2">
                  <Target className="w-6 h-6 text-primary" />
                  Action Goals
                </h2>
                {loadingActionPlans ? (
                  <Loader2 className="w-6 h-6 animate-spin mx-auto" />
                ) : actionPlans.length === 0 ? (
                  <div className="text-center py-12 border-2 border-dashed rounded-3xl">
                    <p className="text-muted-foreground">No active goals found.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {actionPlans.map((plan: any) => (
                      <div key={plan.id} className="flex items-center gap-4 p-4 bg-white border rounded-2xl">
                        {plan.status === 'completed' ? <CheckCircle2 className="w-5 h-5 text-sage-600" /> : <Circle className="w-5 h-5 text-muted-foreground" />}
                        <div className="flex-1">
                          <p className={`font-bold text-sm ${plan.status === 'completed' ? 'line-through text-muted-foreground' : ''}`}>{plan.title}</p>
                          <p className="text-[10px] text-muted-foreground uppercase font-medium">{plan.category}</p>
                        </div>
                        {plan.due_date && <div className="text-[10px] bg-muted px-2 py-1 rounded font-bold">Due: {format(new Date(plan.due_date), "MMM d")}</div>}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === "pathways" && (
              <div className="card-warm p-8">
                <h2 className="text-2xl font-heading font-bold mb-6 flex items-center gap-2">
                  <Map className="w-6 h-6 text-primary" />
                  Long-term Strategy
                </h2>
                {loadingPathways ? (
                  <Loader2 className="w-6 h-6 animate-spin mx-auto" />
                ) : pathways.length === 0 ? (
                  <div className="text-center py-12 border-2 border-dashed rounded-3xl">
                    <p className="text-muted-foreground">No pathways architected yet.</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {(pathways as any[]).map((path) => (
                      <div key={path.id} className={`p-6 rounded-[24px] border-2 ${path.is_primary ? 'border-primary bg-primary/[0.02]' : 'bg-white'}`}>
                        <div className="flex justify-between items-start mb-6">
                          <h3 className="font-bold text-lg flex items-center gap-2">
                            {path.title}
                            {path.is_primary && <Star className="w-4 h-4 text-primary fill-primary" />}
                          </h3>
                        </div>
                        <div className="grid md:grid-cols-3 gap-6">
                          <div className="p-4 bg-muted/20 rounded-xl">
                            <span className="text-[10px] font-bold uppercase text-muted-foreground block mb-2">Academic Base</span>
                            <div className="flex flex-wrap gap-1">
                              {(path.subjects as string[]).map(s => <span key={s} className="bg-white border px-2 py-0.5 rounded text-[10px]">{s}</span>)}
                            </div>
                          </div>
                          <div className="p-4 bg-muted/20 rounded-xl">
                            <span className="text-[10px] font-bold uppercase text-muted-foreground block mb-2">Higher Ed Goal</span>
                            <p className="text-xs font-bold">{path.higher_ed_goal || "Not set"}</p>
                          </div>
                          <div className="p-4 bg-muted/20 rounded-xl">
                            <span className="text-[10px] font-bold uppercase text-muted-foreground block mb-2">Career Goal</span>
                            <p className="text-xs font-bold">{path.title}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === "support" && (
              <div className="grid md:grid-cols-2 gap-6">
                <div className="card-warm p-8">
                  <div className="flex items-center gap-3 mb-6">
                    <Heart className="w-6 h-6 text-rose-500" />
                    <h2 className="font-heading font-bold text-xl">{t("parent.tips_title")}</h2>
                  </div>
                  <div className="space-y-4">
                    {[
                      `Discuss ${firstName}'s top RIASEC matches together`,
                      "Look at their exploration logs and ask what was most fun",
                      "Review their subject choices for the next academic year",
                      "Focus on their interests rather than just grades"
                    ].map((tip, i) => (
                      <div key={i} className="flex gap-4">
                        <div className="w-6 h-6 rounded-full bg-rose-100 flex items-center justify-center text-rose-500 font-bold text-xs flex-shrink-0 mt-0.5">{i+1}</div>
                        <p className="text-sm text-muted-foreground leading-relaxed">{tip}</p>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="card-warm p-8">
                  <div className="flex items-center gap-3 mb-6">
                    <MessageCircle className="w-6 h-6 text-primary" />
                    <h2 className="font-heading font-bold text-xl">{t("parent.convo_title")}</h2>
                  </div>
                  <div className="space-y-3">
                    {[
                      `What did you find most exciting in your ${topThree[0]?.name || 'recent'} result?`,
                      "Which of your subject choices are you most looking forward to?",
                      "Is there a career pathway we should research more?",
                      "How can I help you with your action goals this month?"
                    ].map((q, i) => (
                      <div key={i} className="p-4 rounded-2xl surface-sage text-sm italic">"{q}"</div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default ParentDashboard;
