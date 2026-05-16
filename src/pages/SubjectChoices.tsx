import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { 
  ArrowLeft, BookOpen, Bookmark, BookmarkCheck, Lightbulb, 
  Loader2, Plus, Trash2, Info, Star, Save, Send, ChevronRight,
  Target, GraduationCap
} from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getSubjectsByInterests, schoolSubjects } from "@/data/subjectConnections";
import { toast } from "sonner";
import { getGradeBand } from "@/utils/gradeBands";
import { Textarea } from "@/components/ui/textarea";
import { 
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter 
} from "@/components/ui/dialog";

interface SubjectPlanItem {
  name: string;
  interest_score: number;
  confidence_score: number;
  notes?: string;
}

const SubjectChoices = () => {
  const { user, profile } = useAuth();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<"explorer" | "plan">("explorer");
  const [filter, setFilter] = useState<"recommended" | "all">("recommended");

  // Fetch assessment
  const { data: latestAssessment, isLoading: loadingAssessment } = useQuery({
    queryKey: ["latest-assessment-subjects", user?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from("assessments")
        .select("results")
        .eq("user_id", user!.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .single();
      return data;
    },
    enabled: !!user?.id,
  });

  // Fetch current plan
  const { data: currentPlan, isLoading: loadingPlan } = useQuery({
    queryKey: ["subject-plan", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("student_subject_plans")
        .select("*")
        .eq("student_id", user!.id)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  const [plannedSubjects, setPlannedSubjects] = useState<SubjectPlanItem[]>([]);
  const [rationale, setRationale] = useState("");

  useEffect(() => {
    if (currentPlan) {
      setPlannedSubjects(currentPlan.subjects as SubjectPlanItem[] || []);
      setRationale(currentPlan.rationale || "");
    }
  }, [currentPlan]);

  const saveMutation = useMutation({
    mutationFn: async (status: string = "draft") => {
      const { error } = await supabase
        .from("student_subject_plans")
        .upsert({
          student_id: user!.id,
          academic_year: "2024-2025",
          subjects: plannedSubjects,
          rationale,
          status,
          updated_at: new Date().toISOString()
        }, { onConflict: "student_id,academic_year" });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subject-plan"] });
      toast.success("Plan saved successfully!");
    },
    onError: (err: any) => toast.error(err.message),
  });

  const addToPlan = (subjectName: string) => {
    if (plannedSubjects.some(s => s.name === subjectName)) {
      toast.error("Subject already in plan");
      return;
    }
    setPlannedSubjects([...plannedSubjects, { 
      name: subjectName, 
      interest_score: 3, 
      confidence_score: 3 
    }]);
    toast.success(`Added ${subjectName} to plan`);
    setActiveTab("plan");
  };

  const removeFromPlan = (name: string) => {
    setPlannedSubjects(plannedSubjects.filter(s => s.name !== name));
  };

  const updatePlanItem = (name: string, field: keyof SubjectPlanItem, value: any) => {
    setPlannedSubjects(plannedSubjects.map(s => 
      s.name === name ? { ...s, [field]: value } : s
    ));
  };

  const rawResults = latestAssessment?.results;
  let topInterests: string[] = [];

  if (rawResults) {
    if (Array.isArray(rawResults)) {
      topInterests = (rawResults as Array<{ category: string; pct: number }>)
        .sort((a, b) => b.pct - a.pct)
        .slice(0, 2)
        .map(r => r.category);
    } else {
      const obj = rawResults as Record<string, number>;
      topInterests = Object.keys(obj)
        .sort((a, b) => obj[b] - obj[a])
        .slice(0, 2);
    }
  }

  const recommendedSubjects = getSubjectsByInterests(topInterests);
  const displaySubjects = filter === "recommended" && topInterests.length > 0 
    ? recommendedSubjects 
    : schoolSubjects;

  const band = getGradeBand(profile?.grade);

  const isLoading = loadingAssessment || loadingPlan;

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <div className="mb-6 flex items-center justify-between">
          <Link to="/student" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="w-4 h-4 mr-1.5" />
            Back to Journey
          </Link>
          <div className="flex gap-2 bg-muted/30 p-1 rounded-xl">
            <Button 
              variant={activeTab === "explorer" ? "warm" : "ghost"} 
              size="sm" 
              onClick={() => setActiveTab("explorer")}
              className="rounded-lg gap-2"
            >
              <BookOpen className="w-4 h-4" />
              Explorer
            </Button>
            <Button 
              variant={activeTab === "plan" ? "warm" : "ghost"} 
              size="sm" 
              onClick={() => setActiveTab("plan")}
              className="rounded-lg gap-2"
            >
              <Target className="w-4 h-4" />
              My Planner
              {plannedSubjects.length > 0 && (
                <span className="bg-primary/20 text-primary-700 px-1.5 py-0.5 rounded-md text-[10px] font-bold">
                  {plannedSubjects.length}
                </span>
              )}
            </Button>
          </div>
        </div>

        {activeTab === "explorer" ? (
          <div className="space-y-8">
            <div className="mb-8">
              <h1 className="text-3xl font-heading font-bold text-foreground mb-2 flex items-center gap-3">
                <GraduationCap className="w-8 h-8 text-primary" />
                Subject Connections
              </h1>
              <p className="text-muted-foreground max-w-2xl">
                {band === "discovery" 
                  ? "Explore subjects you might enjoy based on your interests. Keep your options open!" 
                  : "Connect your career interests to your upcoming subject choices."}
              </p>
            </div>

            {isLoading ? (
              <div className="flex justify-center py-20">
                <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
              </div>
            ) : topInterests.length === 0 ? (
              <div className="card-warm p-8 text-center max-w-md mx-auto mt-12">
                <BookOpen className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                <h2 className="font-heading font-semibold text-lg text-foreground mb-2">No Interests Found</h2>
                <p className="text-sm text-muted-foreground mb-4">
                  Please complete your career assessment first so we can recommend subjects based on your profile.
                </p>
                <Link to="/student/assessment">
                  <Button>Take Assessment</Button>
                </Link>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-2 mb-6 p-4 rounded-xl surface-sage">
                  <Lightbulb className="w-5 h-5 text-primary flex-shrink-0" />
                  <p className="text-sm text-foreground/80">
                    Based on your <strong>{topInterests.join(" and ")}</strong> interests, 
                    we've highlighted subjects that align with your profile.
                  </p>
                </div>

                <div className="flex gap-2 mb-6">
                  <Button 
                    variant={filter === "recommended" ? "default" : "outline"} 
                    size="sm"
                    onClick={() => setFilter("recommended")}
                    className="rounded-full"
                  >
                    Recommended
                  </Button>
                  <Button 
                    variant={filter === "all" ? "default" : "outline"} 
                    size="sm"
                    onClick={() => setFilter("all")}
                    className="rounded-full"
                  >
                    All Subjects
                  </Button>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {displaySubjects.map((subject) => {
                    const isPlanned = plannedSubjects.some(s => s.name === subject.name);
                    return (
                      <motion.div 
                        key={subject.id} 
                        layout
                        className="card-interactive p-6 flex flex-col h-full bg-white border shadow-sm group"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="font-heading font-bold text-foreground group-hover:text-primary transition-colors">{subject.name}</h3>
                          {isPlanned ? (
                            <span className="bg-primary/10 text-primary px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                              <BookmarkCheck className="w-3 h-3" />
                              Planned
                            </span>
                          ) : (
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-8 w-8 rounded-full"
                              onClick={() => addToPlan(subject.name)}
                            >
                              <Plus className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                        
                        <div className="text-[10px] font-bold text-muted-foreground mb-4 uppercase tracking-widest opacity-60">
                          {subject.category}
                        </div>
                        
                        <p className="text-sm text-muted-foreground mb-6 flex-1 leading-relaxed">
                          {subject.description}
                        </p>
                        
                        <div className="flex flex-wrap gap-1.5">
                          {subject.riasecCodes.map(code => (
                            <span 
                              key={code} 
                              className={`text-[10px] px-2 py-0.5 rounded-md font-bold ${
                                topInterests.includes(code) ? "bg-primary/15 text-primary border border-primary/20" : "bg-muted text-muted-foreground/60"
                              }`}
                            >
                              {code}
                            </span>
                          ))}
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        ) : (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h1 className="text-3xl font-heading font-bold text-foreground mb-2 flex items-center gap-3">
                  <Target className="w-8 h-8 text-primary" />
                  Subject Choice Plan
                </h1>
                <p className="text-muted-foreground">
                  Draft your intended subjects for the next academic year and provide your reasoning.
                </p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => saveMutation.mutate("draft")} disabled={saveMutation.isPending}>
                  <Save className="w-4 h-4 mr-2" />
                  Save Draft
                </Button>
                <Button onClick={() => saveMutation.mutate("submitted")} disabled={saveMutation.isPending} className="bg-primary text-white">
                  <Send className="w-4 h-4 mr-2" />
                  Submit for Review
                </Button>
              </div>
            </div>

            {plannedSubjects.length === 0 ? (
              <div className="text-center py-20 border-2 border-dashed rounded-3xl bg-muted/5">
                <BookOpen className="w-12 h-12 text-muted-foreground/20 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-foreground">Your planner is empty</h3>
                <p className="text-muted-foreground mb-6">Start by browsing the Explorer to find subjects that interest you.</p>
                <Button onClick={() => setActiveTab("explorer")}>Open Explorer</Button>
              </div>
            ) : (
              <div className="grid lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-4">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Planned Subjects ({plannedSubjects.length})</h3>
                  <AnimatePresence mode="popLayout">
                    {plannedSubjects.map((item) => (
                      <motion.div 
                        key={item.name}
                        layout
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="p-5 bg-white border rounded-2xl shadow-sm space-y-4 group"
                      >
                        <div className="flex items-center justify-between">
                          <h4 className="font-bold text-foreground flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-primary" />
                            {item.name}
                          </h4>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 text-muted-foreground/40 hover:text-destructive transition-colors"
                            onClick={() => removeFromPlan(item.name)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>

                        <div className="grid grid-cols-2 gap-8">
                          <div className="space-y-3">
                            <div className="flex items-center justify-between text-xs font-bold uppercase text-muted-foreground/70">
                              <span>Interest</span>
                              <span className="text-primary">{item.interest_score}/5</span>
                            </div>
                            <div className="flex gap-1.5">
                              {[1, 2, 3, 4, 5].map(i => (
                                <button 
                                  key={i} 
                                  onClick={() => updatePlanItem(item.name, "interest_score", i)}
                                  className={`h-2 flex-1 rounded-full transition-all ${i <= item.interest_score ? "bg-primary" : "bg-muted hover:bg-primary/20"}`}
                                />
                              ))}
                            </div>
                          </div>
                          <div className="space-y-3">
                            <div className="flex items-center justify-between text-xs font-bold uppercase text-muted-foreground/70">
                              <span>Confidence</span>
                              <span className="text-amber-600">{item.confidence_score}/5</span>
                            </div>
                            <div className="flex gap-1.5">
                              {[1, 2, 3, 4, 5].map(i => (
                                <button 
                                  key={i} 
                                  onClick={() => updatePlanItem(item.name, "confidence_score", i)}
                                  className={`h-2 flex-1 rounded-full transition-all ${i <= item.confidence_score ? "bg-amber-400" : "bg-muted hover:bg-amber-100"}`}
                                />
                              ))}
                            </div>
                          </div>
                        </div>

                        <div className="pt-2">
                          <Input 
                            placeholder="Brief note on why this subject... (optional)" 
                            className="text-xs h-8 border-transparent bg-muted/30 focus:bg-white focus:border-border transition-all"
                            value={item.notes || ""}
                            onChange={(e) => updatePlanItem(item.name, "notes", e.target.value)}
                          />
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>

                <div className="space-y-6">
                  <div className="card-warm p-6 surface-amber">
                    <h3 className="font-heading font-bold text-foreground mb-4 flex items-center gap-2">
                      <Info className="w-5 h-5 text-amber-600" />
                      Choice Rationale
                    </h3>
                    <p className="text-xs text-amber-800/80 mb-4 leading-relaxed">
                      Explain why you've chosen these subjects. How do they support your future goals or career interests?
                    </p>
                    <Textarea 
                      placeholder="My rationale for these choices is..."
                      className="min-h-[200px] text-sm border-amber-200/50 bg-white/50 focus:bg-white"
                      value={rationale}
                      onChange={(e) => setRationale(e.target.value)}
                    />
                  </div>

                  {currentPlan?.counselor_feedback && (
                    <div className="card-warm p-6 surface-sage">
                      <h3 className="font-heading font-bold text-foreground mb-3 flex items-center gap-2">
                        <MessageSquare className="w-5 h-5 text-primary" />
                        Counselor Feedback
                      </h3>
                      <p className="text-sm text-primary-900 bg-white/40 p-3 rounded-xl border border-primary/10">
                        {currentPlan.counselor_feedback}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default SubjectChoices;

function MessageSquare(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  );
}
