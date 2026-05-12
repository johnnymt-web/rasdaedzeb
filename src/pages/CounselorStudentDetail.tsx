import { useParams, Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import RiasecRadarChart from "@/components/assessment/RiasecRadarChart";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowLeft, User, GraduationCap, Calendar, CheckCircle2, Circle, Clock, Loader2, Compass, Brain, Target, BrainCircuit, Sparkles } from "lucide-react";
import { format } from "date-fns";
import StudentNotes from "@/components/counselor/StudentNotes";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { toast } from "sonner";
import { Progress } from "@/components/ui/progress";
import { useTranslation } from "react-i18next";
import { generateAiSynthesis, SynthesisResponse } from "@/services/aiService";
import { useEffect, useState } from "react";
import ComprehensiveReportView from "@/components/assessment/ComprehensiveReportView";

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
        .select("id, results, completed_at, created_at, answers")
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

  const { data: bigFive, isLoading: bigFiveLoading } = useQuery({
    queryKey: ["counselor-student-big-five", studentId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("big_five_assessments" as any)
        .select("*")
        .eq("student_id", studentId!)
        .order("completed_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (error) throw error;
      return data as any;
    },
    enabled: !!studentId,
  });

  const { data: caas, isLoading: caasLoading } = useQuery({
    queryKey: ["counselor-student-caas", studentId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("caas_assessments" as any)
        .select("*")
        .eq("student_id", studentId!)
        .order("completed_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (error) throw error;
      return data as any;
    },
    enabled: !!studentId,
  });

  const { data: workValues, isLoading: workValuesLoading } = useQuery({
    queryKey: ["counselor-student-work-values", studentId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("work_values_assessments")
        .select("*")
        .eq("student_id", studentId!)
        .order("completed_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!studentId,
  });

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

  const isLoading = profileLoading || assessmentsLoading || bigFiveLoading || caasLoading || workValuesLoading || eqLoading;

  const completedAssessments = (assessments || []).filter(
    (a) => a.completed_at && a.results
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
    completed_at: a.completed_at!,
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
            <>
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

                  {/* Quick Brief Section */}
                  <div className="card-warm p-5 border-amber-200 bg-amber-50/30 md:w-96 relative">
                    <h2 className="font-heading font-bold text-sm text-amber-800 mb-2 flex items-center gap-2">
                      <Brain className="w-4 h-4" />
                      AI Counselor Brief
                    </h2>
                    
                    {isSynthesizing ? (
                      <div className="flex flex-col items-center justify-center py-6">
                        <Loader2 className="w-5 h-5 animate-spin text-amber-500 mb-2" />
                        <span className="text-xs text-amber-700">Generating insights...</span>
                      </div>
                    ) : synthesis ? (
                      <>
                        <p className="text-xs text-amber-900/80 leading-relaxed mb-3">
                          {synthesis.summary || "Complete more assessments to generate a clinical summary."}
                        </p>
                        {synthesis.recommendations.length > 0 && (
                          <div className="space-y-1.5">
                            {synthesis.recommendations.map((r, i) => (
                              <div key={i} className="text-[10px] bg-amber-200/40 text-amber-900 px-2 py-1 rounded border border-amber-200/60">
                                • {r}
                              </div>
                            ))}
                          </div>
                        )}
                      </>
                    ) : (
                      <p className="text-xs text-amber-900/80 leading-relaxed mb-3">
                        Waiting for assessment data...
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div className="grid lg:grid-cols-5 gap-6">
                {/* RIASEC chart */}
                <div className="lg:col-span-3">
                  <div className="card-warm p-6">
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
                            Big Five Traits
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
                            Emotional Intelligence
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

              <div className="mt-8 grid lg:grid-cols-3 gap-6">
                {/* Assessment history - Moved to its own section below */}
                <div className="lg:col-span-2">
                  <div className="card-warm p-6">
                    <h2 className="font-heading font-semibold text-lg text-foreground mb-4">
                      {t("counselor.student_detail.history_title")}
                    </h2>
                    {(assessments || []).length === 0 ? (
                      <p className="text-sm text-muted-foreground text-center py-4">
                        {t("counselor.no_recent")}
                      </p>
                    ) : (
                      <div className="space-y-3">
                        {(assessments || []).map((a) => (
                          <div
                            key={a.id}
                            className="flex items-center gap-3 p-3 rounded-lg bg-muted/50"
                          >
                            {a.completed_at ? (
                              <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0" />
                            ) : (
                              <Clock className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                            )}
                            <div className="flex-1 min-w-0">
                              <div className="text-sm font-medium text-foreground">
                                {a.completed_at ? t("counselor.student_detail.status_completed") : t("counselor.student_detail.status_in_progress")}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {format(new Date(a.created_at), `MMM d, yyyy '${t("counselor.student_detail.at")}' h:mm a`)}
                              </div>
                            </div>
                            {a.completed_at && a.results && (
                              <div className="text-xs text-muted-foreground">
                                {t("assessment.riasec.top_areas")}:{" "}
                                {(a.results as unknown as AssessmentResult[])
                                  .sort((x, y) => y.pct - x.pct)
                                  .slice(0, 2)
                                  .map((r) => r.category.charAt(0))
                                  .join("")}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-8 space-y-8">
                <div className="card-warm p-8">
                  <h2 className="text-xl font-heading font-bold text-foreground mb-6 flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-primary" />
                    Unified Student Diagnostic Report
                  </h2>
                  <div className="border-t pt-6">
                    <ComprehensiveReportView 
                      studentId={studentId!} 
                      grade={profile?.grade || undefined}
                      isCounselorView={true}
                    />
                  </div>
                </div>

                {/* Notes section */}
                {studentId && <StudentNotes studentId={studentId} />}
              </div>
            </>
          )}
        </motion.div>
    </div>
  );
};

export default CounselorStudentDetail;
