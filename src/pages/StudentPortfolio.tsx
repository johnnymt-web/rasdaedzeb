import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Plus, CheckCircle2, Circle, Loader2, Bookmark, FileText } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import EmployabilityTracker from "@/components/student/EmployabilityTracker";
import { useTranslation } from "react-i18next";

export default function StudentPortfolio() {
  const { user } = useAuth();
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [newGoal, setNewGoal] = useState("");

  const [localGoals, setLocalGoals] = useState<any[]>(() => {
    const saved = localStorage.getItem(`fallback_goals_${user?.id}`);
    return saved ? JSON.parse(saved) : [];
  });

  const { data: goals = [], isLoading: loadingGoals, error: goalsError } = useQuery({
    queryKey: ["student-goals", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("student_goals")
        .select("*")
        .eq("user_id", user!.id)
        .order("created_at", { ascending: false });
      
      if (error) {
        console.warn("Goals DB fetch failed, using local fallback:", error.message);
        return localGoals;
      }
      return data || [];
    },
    enabled: !!user?.id,
  });

  const { data: saves = [], isLoading: loadingSaves } = useQuery({
    queryKey: ["student-saves", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("saved_pathways")
        .select("*")
        .eq("user_id", user!.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id,
  });

  const { data: reflections = [], isLoading: loadingReflections } = useQuery({
    queryKey: ["student-all-reflections", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("reflections")
        .select("*")
        .eq("user_id", user!.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id,
  });

  const addGoal = useMutation({
    mutationFn: async (title: string) => {
      try {
        const { error } = await supabase.from("student_goals").insert({
          user_id: user!.id,
          title,
          status: "not_started"
        });
        if (error) throw error;
      } catch (err: any) {
        console.error("Failed to save goal to DB, using local fallback:", err.message);
        const newLocalGoal = {
          id: `local-${Date.now()}`,
          user_id: user!.id,
          title,
          status: "not_started",
          created_at: new Date().toISOString()
        };
        const updated = [newLocalGoal, ...localGoals];
        setLocalGoals(updated);
        localStorage.setItem(`fallback_goals_${user?.id}`, JSON.stringify(updated));
        toast.info(t("portfolio.goal_saved_locally"));
      }
    },
    onSuccess: () => {
      setNewGoal("");
      queryClient.invalidateQueries({ queryKey: ["student-goals", user?.id] });
      toast.success(t("portfolio.goal_added"));
    },
    onError: (err: any) => {
      if (err.message) toast.error(err.message);
    }
  });

  const toggleGoalStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: "not_started" | "in_progress" | "completed" }) => {
      const newStatus = status === "completed" ? "not_started" : "completed";
      
      if (id.startsWith('local-')) {
        const updated = localGoals.map(g => g.id === id ? { ...g, status: newStatus } : g);
        setLocalGoals(updated);
        localStorage.setItem(`fallback_goals_${user?.id}`, JSON.stringify(updated));
        return;
      }

      const { error } = await supabase.from("student_goals").update({ status: newStatus }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["student-goals", user?.id] });
    }
  });

  const removeSave = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("saved_pathways").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["student-saves", user?.id] });
    }
  });

  const isLoading = loadingGoals || loadingSaves || loadingReflections;

  const savedSubjects = saves.filter(s => s.type === "subject");
  const savedPathways = saves.filter(s => s.type === "pathway");
  const savedProfessions = saves.filter(s => s.type === "profession");
  const savedFamilies = saves.filter(s => s.type === "career_family");

  return (
    <div className="space-y-8">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
          <div className="mb-6">
            <Link to="/student" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground">
              <ArrowLeft className="w-4 h-4 mr-1.5" />
              {t("portfolio.back")}
            </Link>
          </div>

          <div className="mb-8 flex items-end justify-between">
            <div>
              <h1 className="text-2xl md:text-3xl font-heading font-bold text-foreground mb-2">
                {t("portfolio.title")}
              </h1>
              <p className="text-muted-foreground">
                {t("portfolio.subtitle")}
              </p>
            </div>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <div className="grid lg:grid-cols-3 gap-6">
              
              {/* Goals & Skills */}
              <div className="lg:col-span-2 space-y-6">
                <EmployabilityTracker />
                
                <div className="card-warm p-6">
                  <h2 className="font-heading font-semibold text-lg text-foreground mb-4">{t("portfolio.action_goals")}</h2>
                  <div className="flex gap-2 mb-4">
                    <Input 
                      placeholder={t("portfolio.goal_placeholder")}
                      value={newGoal}
                      onChange={e => setNewGoal(e.target.value)}
                      onKeyDown={e => e.key === "Enter" && newGoal.trim() && addGoal.mutate(newGoal)}
                    />
                    <Button onClick={() => newGoal.trim() && addGoal.mutate(newGoal)} disabled={!newGoal.trim() || addGoal.isPending}>
                      {addGoal.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                    </Button>
                  </div>
                  
                  <div className="space-y-2">
                    {goals.length === 0 ? (
                      <p className="text-sm text-muted-foreground italic">{t("portfolio.no_goals")}</p>
                    ) : (
                      goals.map(goal => (
                        <div key={goal.id} className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                          <button onClick={() => toggleGoalStatus.mutate({ id: goal.id, status: goal.status })}>
                            {goal.status === "completed" 
                              ? <CheckCircle2 className="w-5 h-5 text-primary" />
                              : <Circle className="w-5 h-5 text-muted-foreground hover:text-foreground" />
                            }
                          </button>
                          <span className={`text-sm ${goal.status === "completed" ? "line-through text-muted-foreground" : "text-foreground"}`}>
                            {goal.title}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Reflections */}
                <div className="card-warm p-6">
                  <h2 className="font-heading font-semibold text-lg text-foreground mb-4 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-secondary" />
                    {t("portfolio.past_reflections")}
                  </h2>
                  <div className="space-y-4">
                    {reflections.length === 0 ? (
                      <p className="text-sm text-muted-foreground italic">{t("portfolio.no_reflections")}</p>
                    ) : (
                      reflections.map(ref => (
                        <div key={ref.id} className="p-4 rounded-xl bg-muted/30">
                          <p className="text-xs font-semibold text-muted-foreground mb-1">{ref.prompt}</p>
                          <p className="text-sm text-foreground italic">"{ref.response}"</p>
                          <p className="text-[10px] text-muted-foreground mt-2 text-right">
                            {new Date(ref.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>

              {/* Sidebar Saves */}
              <div className="space-y-6">
                <div className="card-warm p-6">
                  <h2 className="font-heading font-semibold text-lg text-foreground mb-4 flex items-center gap-2">
                    <Bookmark className="w-5 h-5 text-primary" />
                    {t("portfolio.saved_subjects")}
                  </h2>
                  <div className="flex flex-wrap gap-2">
                    {savedSubjects.length === 0 ? (
                      <p className="text-sm text-muted-foreground italic">{t("portfolio.no_subjects")}</p>
                    ) : (
                      savedSubjects.map(save => (
                        <div key={save.id} className="text-xs bg-primary/10 text-primary px-3 py-1.5 rounded-full flex items-center gap-2 group">
                          {save.title}
                          <button onClick={() => removeSave.mutate(save.id)} className="opacity-0 group-hover:opacity-100 hover:text-destructive">
                            &times;
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                <div className="card-warm p-6">
                  <h2 className="font-heading font-semibold text-lg text-foreground mb-4 flex items-center gap-2">
                    <Bookmark className="w-5 h-5 text-rose-500" />
                    {t("portfolio.saved_careers")}
                  </h2>
                  <div className="space-y-2">
                    {savedProfessions.length === 0 ? (
                      <p className="text-sm text-muted-foreground italic">{t("portfolio.no_careers")}</p>
                    ) : (
                      savedProfessions.map(save => (
                        <div key={save.id} className="text-sm p-3 rounded-lg bg-rose-50 flex items-center justify-between group dark:bg-rose-900/10">
                          <span className="font-medium text-rose-700 dark:text-rose-400">{save.title}</span>
                          <button onClick={() => removeSave.mutate(save.id)} className="opacity-0 group-hover:opacity-100 hover:text-destructive p-1 rounded-sm">
                            &times;
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                <div className="card-warm p-6">
                  <h2 className="font-heading font-semibold text-lg text-foreground mb-4 flex items-center gap-2">
                    <Bookmark className="w-5 h-5 text-amber-500" />
                    {t("portfolio.saved_pathways")}
                  </h2>
                  <div className="space-y-2">
                    {savedPathways.length === 0 ? (
                      <p className="text-sm text-muted-foreground italic">{t("portfolio.no_pathways")}</p>
                    ) : (
                      savedPathways.map(save => (
                        <div key={save.id} className="text-sm p-3 rounded-lg surface-amber flex items-center justify-between group">
                          <span>{save.title}</span>
                          <button onClick={() => removeSave.mutate(save.id)} className="opacity-0 group-hover:opacity-100 hover:text-destructive p-1 rounded-sm">
                            &times;
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                <div className="card-warm p-6">
                  <h2 className="font-heading font-semibold text-lg text-foreground mb-4 flex items-center gap-2">
                    <Bookmark className="w-5 h-5 text-sky-500" />
                    {t("portfolio.interest_families")}
                  </h2>
                  <div className="flex flex-wrap gap-2">
                    {savedFamilies.length === 0 ? (
                      <p className="text-sm text-muted-foreground italic">{t("portfolio.no_families")}</p>
                    ) : (
                      savedFamilies.map(save => (
                        <div key={save.id} className="text-xs bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400 px-3 py-1.5 rounded-full flex items-center gap-2 group">
                          {save.title}
                          <button onClick={() => removeSave.mutate(save.id)} className="opacity-0 group-hover:opacity-100 hover:text-destructive">
                            &times;
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>

            </div>
          )}
        </motion.div>
    </div>
  );
}
