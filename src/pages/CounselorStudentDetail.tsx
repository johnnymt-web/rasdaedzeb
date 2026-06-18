import { useParams, Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import RiasecRadarChart from "@/components/assessment/RiasecRadarChart";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowLeft, User, GraduationCap, Calendar, CheckCircle2, Circle, Clock, Loader2, Compass, Brain, Target, BrainCircuit, Sparkles, MessageSquare, Plus, Star, Map as MapIcon } from "lucide-react";
import { format } from "date-fns";
import StudentNotes from "@/components/counselor/StudentNotes";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { toast } from "sonner";
import { Progress } from "@/components/ui/progress";
import { useTranslation } from "react-i18next";
import { generateAiSynthesis, SynthesisResponse } from "@/services/aiService";
import { useEffect, useState } from "react";
import ComprehensiveReportView from "@/components/assessment/ComprehensiveReportView";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { normalizeAllAssessments } from "@/utils/assessmentNormalization";

interface AssessmentResult {
  category: string;
  pct: number;
  score: number;
}

const CounselorStudentDetail = () => {
  const { studentId } = useParams<{ studentId: string }>();
  const { t } = useTranslation();

  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ["counselor-student-profile", studentId],
    queryFn: async () => {
      const { data: profileData, error } = await supabase
        .from("profiles")
        .select("id, full_name, grade, created_at, school_id")
        .eq("id", studentId!)
        .single();
      if (error) throw error;

      if (profileData.school_id) {
        const { data: schoolData } = await supabase
          .from("schools")
          .select("name")
          .eq("id", profileData.school_id)
          .single();
        
        return { ...profileData, school_name: schoolData?.name };
      }

      return profileData;
    },
    enabled: !!studentId,
  });

  const { data: assessments, isLoading: assessmentsLoading } = useQuery({
    queryKey: ["counselor-student-assessments", studentId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("assessments")
        .select("id, results, completed_at, created_at, answers, assessment_type")
        .eq("user_id", studentId!)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!studentId,
  });
  
  const queryClient = useQueryClient();

  const { data: skills = [], isLoading: skillsLoading } = useQuery({
    queryKey: ["counselor-student-skills", studentId],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from("employability_skills")
          .select("*")
          .eq("student_id", studentId!);
        
        if (error) {
          if (error.code === '42P01' || error.message?.includes('cache')) {
            console.warn("Skills table missing - Counselor view falling back to empty");
            return [];
          }
          throw error;
        }
        return data || [];
      } catch (err) {
        console.warn("Recoverable error in skills query:", err);
        return [];
      }
    },
    enabled: !!studentId,
  });

  const normData = normalizeAllAssessments(assessments || []);

  const bigFive = normData.bigFive.isComplete 
    ? (Array.isArray(normData.bigFive.results) ? normData.bigFive.results.reduce((acc, r) => ({ ...acc, [r.key]: r.pct }), {} as Record<string, number>) : {})
    : null;

  const caas = normData.caas.isComplete
    ? {
        ...((Array.isArray(normData.caas.results) ? normData.caas.results.reduce((acc, r) => ({ ...acc, [r.key]: r.score }), {} as Record<string, number>) : {})),
        total_score: (Array.isArray(normData.caas.results) ? normData.caas.results.reduce((sum, r) => sum + (r.score || 0), 0) / Math.max(1, normData.caas.results.length) : 0)
      }
    : null;

  const workValues = normData.workValues.isComplete
    ? (Array.isArray(normData.workValues.results) ? normData.workValues.results.reduce((acc, r) => ({ ...acc, [r.key]: r.score }), {} as Record<string, number>) : {})
    : null;

  const { data: eqAssessment, isLoading: eqLoading } = useQuery({
    queryKey: ["counselor-student-eq", studentId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("assessments")
        .select("*")
        .eq("user_id", studentId!)
        .eq("assessment_type", "eq")
        .order("completed_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!studentId,
  });

  const verifySkill = useMutation({
    mutationFn: async ({ category }: { category: string }) => {
      try {
        const { error } = await supabase
          .from("employability_skills")
          .upsert({ 
            student_id: studentId!, 
            skill_category: category as any, 
            status: 'verified' 
          }, { onConflict: 'student_id,skill_category' });
        
        if (error) {
          if (error.code === '42P01' || error.message?.includes('cache')) {
            throw new Error(t("skills_tracker.maintenance"));
          }
          throw error;
        }
      } catch (err: any) {
        throw err;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["counselor-student-skills", studentId] });
      toast.success(t("counselor.student_detail.verified"));
    },
    onError: (err: any) => toast.error(err.message || "Failed to verify skill")
  });

  const isLoading = profileLoading || assessmentsLoading || eqLoading;

  const completedAssessments = (assessments || []).filter(
    (a) => (a.completed_at || a.created_at) && a.results
  );

  const latestResults: AssessmentResult[] =
    completedAssessments.length > 0
      ? (completedAssessments[0].results as unknown as AssessmentResult[])
      : [];

  const topInterests = [...latestResults]
    .sort((a, b) => b.pct - a.pct)
    .slice(0, 3);

  const chartAssessments = completedAssessments.map((a) => ({
    id: a.id,
    results: (Array.isArray(a.results) ? a.results : []) as unknown as { category: string; pct: number }[],
    completed_at: a.completed_at || a.created_at,
    created_at: a.created_at,
  }));

  // Parse EQ results from generic JSON
  let eqResults: Record<string, number> = {};
  if (eqAssessment?.results) {
    const parsed = eqAssessment.results as any[];
    parsed.forEach(p => {
      eqResults[p.category] = p.score;
    });
  }

  const { data: activities, isLoading: activitiesLoading } = useQuery({
    queryKey: ["counselor-student-activities", studentId],
    queryFn: async () => {
      const { data, error } = await (supabase.from("career_exposure_activities" as any) as any)
        .select("*")
        .eq("student_id", studentId!)
        .order("activity_date", { ascending: false });
      if (error) throw error;
      return data || [];
    },
    enabled: !!studentId,
  });

  const { data: actionPlans, isLoading: actionPlansLoading } = useQuery({
    queryKey: ["counselor-student-action-plans", studentId],
    queryFn: async () => {
      const { data, error } = await (supabase.from("student_action_plans" as any) as any)
        .select("*")
        .eq("student_id", studentId!)
        .order("due_date", { ascending: true });
      if (error) throw error;
      return data || [];
    },
    enabled: !!studentId,
  });

  const commentMutation = useMutation({
    mutationFn: async ({ id, comment }: { id: string; comment: string }) => {
      const { error } = await (supabase.from("career_exposure_activities" as any) as any)
        .update({ counselor_comment: comment })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["counselor-student-activities"] });
      toast.success("Comment saved");
    },
  });

  const addActionMutation = useMutation({
    mutationFn: async (newData: any) => {
      const { error } = await (supabase.from("student_action_plans" as any) as any)
        .insert([{ 
          ...newData, 
          student_id: studentId, 
          assigned_by: (await supabase.auth.getUser()).data.user?.id,
          assigned_by_role: "counselor"
        }]);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["counselor-student-action-plans"] });
      toast.success("Action plan item added");
    },
  });

  const updateActionStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await (supabase.from("student_action_plans" as any) as any)
        .update({ status })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["counselor-student-action-plans"] });
      toast.success("Status updated");
    },
  });

  const { data: subjectPlan, isLoading: subjectPlanLoading } = useQuery({
    queryKey: ["counselor-student-subject-plan", studentId],
    queryFn: async () => {
      const { data, error } = await (supabase.from("student_subject_plans" as any) as any)
        .select("*")
        .eq("student_id", studentId!)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!studentId,
  });

  const subjectFeedbackMutation = useMutation({
    mutationFn: async (feedback: string) => {
      const { error } = await (supabase.from("student_subject_plans" as any) as any)
        .update({ counselor_feedback: feedback, status: 'reviewed' })
        .eq("student_id", studentId!);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["counselor-student-subject-plan"] });
      toast.success("Subject plan feedback saved");
    },
  });

  const { data: pathways = [], isLoading: pathwaysLoading } = useQuery({
    queryKey: ["counselor-student-pathways", studentId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("student_career_pathways" as any)
        .select("*")
        .eq("student_id", studentId!)
        .order("created_at", { ascending: true });
      if (error) throw error;
      return data;
    },
    enabled: !!studentId,
  });

  const [activeTab, setActiveTab] = useState<"overview" | "report" | "exposure" | "plan" | "subjects" | "pathways" | "notes">("overview");

  const [synthesis, setSynthesis] = useState<SynthesisResponse | null>(null);
  const [isSynthesizing, setIsSynthesizing] = useState(false);

  useEffect(() => {
    const fetchSynthesis = async () => {
      if (latestResults.length > 0) {
        setIsSynthesizing(true);
        const data = await generateAiSynthesis({
          primaryInterest: topInterests[0]?.category,
          traits: bigFive,
          adapt: caas,
          values: workValues,
          eqResults
        });
        setSynthesis(data);
        setIsSynthesizing(false);
      }
    };
    
    
    if (!isLoading) {
      fetchSynthesis();
    }
  }, [isLoading, latestResults.length]);

  return (
    <div className="space-y-8">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
          {/* Back link */}
          <Button variant="ghost" size="sm" className="mb-4 -ml-2" asChild>
            <Link to="/counselor">
              <ArrowLeft className="w-4 h-4 mr-1" />
              {t("counselor.back_dashboard")}
            </Link>
          </Button>

          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : !profile ? (
            <div className="text-center py-20">
              <p className="text-muted-foreground">{t("counselor.student_detail.not_found")}</p>
            </div>
          ) : (
            <div>
              {/* Student header */}
              <div className="card-warm p-6 mb-6">
                <div className="flex flex-col md:flex-row md:items-start gap-6">
                  <div className="flex items-start gap-4 flex-1">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <User className="w-6 h-6 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h1 className="text-xl md:text-2xl font-heading font-bold text-foreground">
                        {profile?.full_name || t("counselor.unnamed_student")}
                      </h1>
                      <div className="flex flex-wrap gap-4 mt-2 text-sm text-muted-foreground">
                        {profile?.grade && (
                          <span className="flex items-center gap-1">
                            <GraduationCap className="w-4 h-4" />
                            {profile.grade}
                          </span>
                        )}
                        {/* @ts-ignore - profile school_name injected in select */}
                        {profile?.school_id && (
                          <span className="flex items-center gap-1 bg-muted px-2 py-0.5 rounded text-xs">
                            <Compass className="w-3 h-3" />
                            {/* @ts-ignore */}
                            {profile.school_name || t("users.unknown_school")}
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {t("counselor.student_detail.joined", { date: profile?.created_at ? format(new Date(profile.created_at), "MMM d, yyyy") : "—" })}
                        </span>
                      </div>
                    </div>
                    </div>
                  </div>
                </div>

              {/* Tab Switcher */}
              <div className="flex gap-2 p-1 bg-muted/30 rounded-xl w-fit mb-6">
                {[
                  { id: "overview", label: "Overview", icon: Brain },
                  { id: "exposure", label: "Career Exposure", icon: Compass },
                  { id: "plan", label: "Action Plan", icon: Target },
                  { id: "subjects", label: "Subjects", icon: GraduationCap },
                  { id: "pathways", label: "Pathways", icon: MapIcon },
                  { id: "report", label: "Discovery Profile", icon: Sparkles },
                  { id: "notes", label: "Counselor Notes", icon: MessageSquare }
                ].map((tab) => (
                  <Button
                    key={tab.id}
                    variant={activeTab === tab.id ? "warm" : "ghost"}
                    size="sm"
                    onClick={() => setActiveTab(tab.id as any)}
                    className="gap-2 rounded-lg"
                  >
                    <tab.icon className="w-4 h-4" />
                    {tab.label}
                  </Button>
                ))}
              </div>

              {activeTab === "overview" && (
                <div className="space-y-6">
                  <div className="grid lg:grid-cols-5 gap-6">
                    {/* RIASEC chart */}
                    <div className="lg:col-span-3">
                      <div className="card-warm p-6 h-full">
                        <h2 className="font-heading font-semibold text-lg text-foreground mb-4">
                          {t("counselor.student_detail.radar_title")}
                        </h2>
                        {chartAssessments.length > 0 ? (
                          <RiasecRadarChart assessments={chartAssessments} maxOverlays={3} />
                        ) : (
                          <div className="text-center py-12">
                            <Clock className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                            <p className="text-sm text-muted-foreground">
                              {t("counselor.no_recent")}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Quick Brief Section */}
                    <div className="lg:col-span-2">
                      <div className="card-warm p-6 border-amber-200 bg-amber-50/30 h-full relative">
                        <h2 className="font-heading font-bold text-sm text-amber-800 mb-4 flex items-center gap-2">
                          <Brain className="w-4 h-4" />
                          Guidance Brief
                        </h2>
                        
                        {isSynthesizing ? (
                          <div className="flex flex-col items-center justify-center py-6">
                            <Loader2 className="w-5 h-5 animate-spin text-amber-500 mb-2" />
                            <span className="text-xs text-amber-700">Generating insights...</span>
                          </div>
                        ) : synthesis ? (
                            <div className="space-y-4">
                              <p className="text-xs text-amber-900/80 leading-relaxed mb-4">
                                {synthesis.summary || "Complete more assessments to generate a guidance summary."}
                              </p>
                              {synthesis.recommendations.length > 0 && (
                                <div className="space-y-2">
                                  {synthesis.recommendations.map((r, i) => (
                                    <div key={i} className="text-[11px] bg-amber-200/40 text-amber-900 px-3 py-2 rounded-lg border border-amber-200/60 leading-relaxed">
                                      • {r}
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                        ) : (
                          <p className="text-xs text-amber-900/80 leading-relaxed mb-3">
                            Waiting for assessment data...
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

              <div className="grid lg:grid-cols-3 gap-6">


                {/* Top interests sidebar */}
                <div className="lg:col-span-2 space-y-6">
                  {topInterests.length > 0 && (
                    <div className="card-warm p-6">
                      <h2 className="font-heading font-semibold text-lg text-foreground mb-4">
                        {t("counselor.student_detail.top_interests")}
                      </h2>
                      <div className="space-y-3">
                        {topInterests.map((interest, i) => (
                          <div key={interest.category} className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                              i === 0 ? "bg-primary/15 text-primary" :
                              i === 1 ? "bg-secondary/15 text-secondary" :
                              "bg-accent/15 text-accent"
                            }`}>
                              {i + 1}
                            </div>
                            <div className="flex-1">
                              <div className="text-sm font-medium text-foreground">
                                {t(`assessment.riasec.categories.${interest.category}`)}
                              </div>
                              <Progress
                                value={interest.pct}
                                className="h-2 mt-1"
                                indicatorClassName={
                                  i === 0 ? "bg-primary" : i === 1 ? "bg-secondary" : "bg-accent"
                                }
                              />
                            </div>
                            <span className="text-sm font-semibold text-foreground">
                              {interest.pct}%
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Personality & Adaptability Summary */}
                  {(bigFive || caas) && (
                    <div className="card-warm p-6 space-y-6">
                      {bigFive && (
                        <div>
                          <h3 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2">
                            <Brain className="w-4 h-4 text-violet-500" />
                            Learning & Working Style
                          </h3>
                          <div className="grid grid-cols-2 gap-2">
                            {[
                              { label: "Open", val: bigFive.openness, color: "bg-violet-500" },
                              { label: "Cons.", val: bigFive.conscientiousness, color: "bg-blue-500" },
                              { label: "Extr.", val: bigFive.extraversion, color: "bg-amber-500" },
                              { label: "Agre.", val: bigFive.agreeableness, color: "bg-emerald-500" }
                            ].map(t => (
                              <div key={t.label} className="p-2 rounded bg-muted/30">
                                <div className="text-[10px] text-muted-foreground uppercase font-bold">{t.label}</div>
                                <div className="text-sm font-heading font-bold">{Math.round(t.val)}%</div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {caas && (
                        <div className="pt-4 border-t">
                          <h3 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2">
                            <Compass className="w-4 h-4 text-emerald-500" />
                            Career Adaptability
                          </h3>
                          <div className="flex items-center gap-3">
                            <div className="text-2xl font-heading font-bold text-emerald-600">{caas.total_score.toFixed(1)}</div>
                            <div className="text-[10px] leading-tight text-muted-foreground uppercase font-bold">
                              Overall Score<br/>(1.0 - 5.0)
                            </div>
                          </div>
                        </div>
                      )}

                      {workValues && (
                        <div className="pt-4 border-t">
                          <h3 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2">
                            <Target className="w-4 h-4 text-rose-500" />
                            Work Values
                          </h3>
                          <div className="grid grid-cols-1 gap-2">
                            {[
                              { label: "Achievement", val: workValues.achievement || 0, color: "bg-blue-500" },
                              { label: "Independence", val: workValues.independence || 0, color: "bg-amber-500" },
                              { label: "Relationships", val: workValues.relationships || 0, color: "bg-rose-500" }
                            ].map(v => (
                              <div key={v.label} className="space-y-1">
                                <div className="flex justify-between text-[10px] font-bold uppercase">
                                  <span>{v.label}</span>
                                  <span>{v.val.toFixed(1)}</span>
                                </div>
                                <Progress value={(v.val / 5) * 100} className="h-1" />
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {Object.keys(eqResults).length > 0 && (
                        <div className="pt-4 border-t">
                          <h3 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2">
                            <BrainCircuit className="w-4 h-4 text-blue-500" />
                            Emotional Skills Reflection
                          </h3>
                          <div className="grid grid-cols-1 gap-2">
                            {[
                              { label: "Self-Awareness", val: eqResults["Self-Awareness"] },
                              { label: "Self-Management", val: eqResults["Self-Management"] },
                              { label: "Social Awareness", val: eqResults["Social Awareness"] },
                              { label: "Relationship Mgmt", val: eqResults["Relationship Management"] }
                            ].map(v => (
                              <div key={v.label} className="space-y-1">
                                <div className="flex justify-between text-[10px] font-bold uppercase">
                                  <span>{v.label}</span>
                                  <span>{v.val.toFixed(1)}</span>
                                </div>
                                <Progress value={(v.val / 5) * 100} className="h-1" />
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Skills Verification Sidebar */}
                  <div className="card-warm p-6">
                    <h2 className="font-heading font-semibold text-lg text-foreground mb-4 flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5 text-primary" />
                      {t("counselor.student_detail.skills_title")}
                    </h2>
                    <div className="space-y-3">
                      {[
                        { id: "resume", label: t("skills_tracker.resume") },
                        { id: "interview", label: t("skills_tracker.interview") },
                        { id: "networking", label: t("skills_tracker.networking") },
                        { id: "financial_lit", label: t("skills_tracker.financial") }
                      ].map((skill) => {
                        const record = Array.isArray(skills) ? skills.find((s: any) => s.skill_category === skill.id) : null;
                        const isVerified = record?.status === 'verified';
                        
                        return (
                          <div key={skill.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                            <div className="flex items-center gap-3">
                              {isVerified ? (
                                <CheckCircle2 className="w-4 h-4 text-green-500" />
                              ) : (
                                <Circle className="w-4 h-4 text-muted-foreground" />
                              )}
                              <span className="text-sm font-medium">{skill.label}</span>
                            </div>
                            {!isVerified && (
                              <Button 
                                size="xs" 
                                variant="warm"
                                className="h-7 text-[10px]"
                                disabled={verifySkill.isPending}
                                onClick={() => verifySkill.mutate({ category: skill.id })}
                              >
                                {t("counselor.student_detail.verify")}
                              </Button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

              {activeTab === "exposure" && (
                <div className="space-y-6">
                  <div className="card-warm p-6">
                    <h2 className="text-xl font-heading font-bold text-foreground mb-6 flex items-center gap-2">
                      <Compass className="w-6 h-6 text-primary" />
                      Career Exposure Activities
                    </h2>
                    
                    {activitiesLoading ? (
                      <Loader2 className="w-6 h-6 animate-spin mx-auto my-8 text-muted-foreground" />
                    ) : activities?.length === 0 ? (
                      <div className="text-center py-12 border border-dashed rounded-2xl">
                        <p className="text-muted-foreground">No activities logged by this student yet.</p>
                      </div>
                    ) : (
                      <div className="grid md:grid-cols-2 gap-6">
                        {(activities as any[])?.map((activity) => (
                          <div key={activity.id} className="border rounded-2xl p-5 bg-white shadow-sm flex flex-col h-full">
                            <div className="flex justify-between items-start mb-4">
                              <div className="bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-bold uppercase">
                                {activity.activity_type.replace('_', ' ')}
                              </div>
                              <div className="text-xs text-muted-foreground flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                {format(new Date(activity.activity_date), "MMM d, yyyy")}
                              </div>
                            </div>
                            <h3 className="font-bold text-foreground mb-2">{activity.title}</h3>
                            <p className="text-sm text-muted-foreground mb-4 flex-1">{activity.description}</p>
                            
                            {activity.reflection && (
                              <div className="bg-muted/30 p-3 rounded-xl mb-4 italic text-sm">
                                "{activity.reflection}"
                              </div>
                            )}

                            <div className="pt-4 border-t mt-auto">
                              <label className="text-[10px] font-bold text-muted-foreground uppercase block mb-2">Counselor Feedback</label>
                              <div className="flex gap-2">
                                <input 
                                  className="flex-1 bg-muted/50 border-none rounded-lg text-sm p-2 h-9 focus:ring-1 focus:ring-primary"
                                  placeholder="Leave a comment..."
                                  defaultValue={activity.counselor_comment || ""}
                                  onBlur={(e) => {
                                    if (e.target.value !== (activity.counselor_comment || "")) {
                                      commentMutation.mutate({ id: activity.id, comment: e.target.value });
                                    }
                                  }}
                                />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {activeTab === "plan" && (
                <div className="space-y-6">
                  <div className="card-warm p-6">
                    <div className="flex justify-between items-center mb-6">
                      <h2 className="text-xl font-heading font-bold text-foreground flex items-center gap-2">
                        <Target className="w-6 h-6 text-primary" />
                        Student Action Plan
                      </h2>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button size="sm" className="gap-2">
                            <Plus className="w-4 h-4" />
                            Assign Task
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Assign Action Item</DialogTitle>
                          </DialogHeader>
                          <form onSubmit={(e) => {
                            e.preventDefault();
                            const form = e.target as HTMLFormElement;
                            const formData = new FormData(form);
                            addActionMutation.mutate({
                              title: formData.get("title"),
                              category: formData.get("category"),
                              due_date: formData.get("due_date") || null,
                              status: "pending"
                            });
                            form.reset();
                          }} className="space-y-4 py-4">
                            <div className="space-y-2">
                              <label className="text-sm font-medium">Task Title</label>
                              <Input name="title" required placeholder="e.g., Research engineering majors" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <label className="text-sm font-medium">Category</label>
                                <Select name="category" defaultValue="exploration">
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="exploration">Exploration</SelectItem>
                                    <SelectItem value="subject_choice">Subject Choice</SelectItem>
                                    <SelectItem value="skill_building">Skill Building</SelectItem>
                                    <SelectItem value="application">Application</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              <div className="space-y-2">
                                <label className="text-sm font-medium">Due Date</label>
                                <Input name="due_date" type="date" />
                              </div>
                            </div>
                            <DialogFooter>
                              <Button type="submit">Assign Item</Button>
                            </DialogFooter>
                          </form>
                        </DialogContent>
                      </Dialog>
                    </div>

                    {actionPlansLoading ? (
                      <Loader2 className="w-6 h-6 animate-spin mx-auto my-8 text-muted-foreground" />
                    ) : actionPlans?.length === 0 ? (
                      <div className="text-center py-12 border border-dashed rounded-2xl">
                        <p className="text-muted-foreground">No action items assigned.</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {(actionPlans as any[])?.map((action) => (
                          <div key={action.id} className="flex items-center gap-4 p-4 rounded-xl border bg-white shadow-sm">
                            <div className={`w-3 h-3 rounded-full flex-shrink-0 ${action.status === 'completed' ? 'bg-green-500' : 'bg-amber-400'}`} />
                            <div className="flex-1">
                              <h4 className={`text-sm font-bold ${action.status === 'completed' ? 'text-muted-foreground line-through' : 'text-foreground'}`}>
                                {action.title}
                              </h4>
                              <div className="flex items-center gap-3 mt-1">
                                <span className="text-[10px] uppercase font-bold text-muted-foreground/60">{action.category}</span>
                                {action.due_date && (
                                  <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                                    <Clock className="w-3 h-3" />
                                    Due: {format(new Date(action.due_date), "MMM d")}
                                  </span>
                                )}
                              </div>
                            </div>
                            <Select 
                              defaultValue={action.status} 
                              onValueChange={(v: string) => updateActionStatusMutation.mutate({ id: action.id, status: v })}
                            >
                              <SelectTrigger className="w-32 h-8 text-xs">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="pending">Pending</SelectItem>
                                <SelectItem value="in_progress">In Progress</SelectItem>
                                <SelectItem value="completed">Completed</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {activeTab === "subjects" && (
                <div className="space-y-6">
                  <div className="card-warm p-6">
                    <div className="flex justify-between items-center mb-6">
                      <h2 className="text-xl font-heading font-bold text-foreground flex items-center gap-2">
                        <GraduationCap className="w-6 h-6 text-primary" />
                        Subject-Choice Plan Review
                      </h2>
                      {subjectPlan && (
                        <div className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                          (subjectPlan as any).status === 'submitted' ? 'bg-amber-100 text-amber-700' : 
                          (subjectPlan as any).status === 'reviewed' ? 'bg-emerald-100 text-emerald-700' : 
                          'bg-muted text-muted-foreground'
                        }`}>
                          {(subjectPlan as any).status}
                        </div>
                      )}
                    </div>

                    {subjectPlanLoading ? (
                      <Loader2 className="w-6 h-6 animate-spin mx-auto my-8 text-muted-foreground" />
                    ) : !subjectPlan ? (
                      <div className="text-center py-12 border border-dashed rounded-2xl">
                        <p className="text-muted-foreground">No subject plan has been drafted by this student.</p>
                      </div>
                    ) : (
                      <div className="grid lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-2 space-y-4">
                          <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Proposed Subjects</h3>
                          <div className="space-y-3">
                            {((subjectPlan as any).subjects as any[]).map((subject, idx) => (
                              <div key={idx} className="p-4 bg-white border rounded-xl shadow-sm">
                                <div className="flex justify-between items-start mb-3">
                                  <h4 className="font-bold text-foreground">{subject.name}</h4>
                                  <div className="flex gap-2">
                                    <div className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded">Int: {subject.interest_score}/5</div>
                                    <div className="text-[10px] bg-amber-100 text-amber-700 px-2 py-0.5 rounded">Conf: {subject.confidence_score}/5</div>
                                  </div>
                                </div>
                                {subject.notes && <p className="text-xs text-muted-foreground italic">"{subject.notes}"</p>}
                              </div>
                            ))}
                          </div>

                          {(subjectPlan as any).rationale && (
                            <div className="mt-6">
                              <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-3">Choice Rationale</h3>
                              <div className="p-4 bg-muted/30 rounded-xl text-sm leading-relaxed whitespace-pre-wrap">
                                {(subjectPlan as any).rationale}
                              </div>
                            </div>
                          )}
                        </div>

                        <div className="space-y-6">
                          <div className="card-warm p-6 surface-sage">
                            <h3 className="font-heading font-bold text-foreground mb-4">Counselor Review</h3>
                            <form onSubmit={(e) => {
                              e.preventDefault();
                              const feedback = (e.target as any).feedback.value;
                              subjectFeedbackMutation.mutate(feedback);
                            }} className="space-y-4">
                              <Textarea 
                                name="feedback"
                                placeholder="Provide guidance or approval for these choices..."
                                className="min-h-[150px] text-sm bg-white/50"
                                defaultValue={(subjectPlan as any).counselor_feedback || ""}
                              />
                              <Button type="submit" className="w-full" disabled={subjectFeedbackMutation.isPending}>
                                Save & Mark as Reviewed
                              </Button>
                            </form>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {activeTab === "pathways" && (
                <div className="space-y-6">
                  <div className="card-warm p-6">
                    <h2 className="text-xl font-heading font-bold text-foreground mb-6 flex items-center gap-2">
                      <MapIcon className="w-6 h-6 text-primary" />
                      Career Pathway Architecture
                    </h2>
                    
                    {pathwaysLoading ? (
                      <Loader2 className="w-6 h-6 animate-spin mx-auto my-8 text-muted-foreground" />
                    ) : pathways?.length === 0 ? (
                      <div className="text-center py-12 border border-dashed rounded-2xl">
                        <p className="text-muted-foreground">No career pathways architected yet.</p>
                      </div>
                    ) : (
                      <div className="space-y-6">
                        {(pathways as any[]).map((path) => (
                          <div key={path.id} className={`p-6 rounded-2xl border-2 ${path.is_primary ? 'border-primary bg-primary/[0.02]' : 'bg-white'} transition-all`}>
                            <div className="flex justify-between items-start mb-6">
                              <div>
                                <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                                  {path.title}
                                  {path.is_primary && <Star className="w-4 h-4 text-primary fill-primary" />}
                                </h3>
                                <p className="text-xs text-muted-foreground">Architected on {format(new Date(path.created_at), "MMM d, yyyy")}</p>
                              </div>
                            </div>

                            <div className="grid md:grid-cols-3 gap-6">
                              <div className="p-4 bg-muted/20 rounded-xl">
                                <Label className="text-[10px] uppercase font-bold text-muted-foreground block mb-2">1. Academic Base</Label>
                                <div className="flex flex-wrap gap-1.5">
                                  {(path.subjects as string[]).map(s => (
                                    <span key={s} className="bg-white border text-[10px] px-2 py-1 rounded-md font-medium">{s}</span>
                                  ))}
                                </div>
                              </div>
                              <div className="p-4 bg-muted/20 rounded-xl">
                                <Label className="text-[10px] uppercase font-bold text-muted-foreground block mb-2">2. Higher Ed Goal</Label>
                                <p className="text-sm font-bold text-foreground">{path.higher_ed_goal || "Not set"}</p>
                              </div>
                              <div className="p-4 bg-muted/20 rounded-xl">
                                <Label className="text-[10px] uppercase font-bold text-muted-foreground block mb-2">3. Career Destination</Label>
                                <p className="text-sm font-bold text-foreground">{path.title}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {activeTab === "report" && (
                <div className="space-y-8">
                  <div className="card-warm p-8">
                    <h2 className="text-xl font-heading font-bold text-foreground mb-6 flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-primary" />
                      Student Discovery Profile
                    </h2>
                    <div className="border-t pt-6">
                      <ComprehensiveReportView 
                        studentId={studentId!} 
                        grade={profile?.grade || undefined}
                        isCounselorView={true}
                      />
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "notes" && (
                <div className="mt-8">
                  {studentId && <StudentNotes studentId={studentId} />}
                </div>
              )}
            </div>
          )}
        </motion.div>
      </div>
    );
};

export default CounselorStudentDetail;
