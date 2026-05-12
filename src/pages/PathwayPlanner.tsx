import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { 
  ArrowLeft, Compass, Bookmark, CheckCircle2, 
  Circle, Loader2, FileText, ArrowRight,
  GraduationCap, BookOpen, Target
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import EmployabilityTracker from "@/components/student/EmployabilityTracker";
import { getGradeBand } from "@/utils/gradeBands";

export default function PathwayPlanner() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: goals = [], isLoading: loadingGoals } = useQuery({
    queryKey: ["student-goals-plan", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("student_goals")
        .select("*")
        .eq("user_id", user!.id)
        .order("created_at", { ascending: false });
      return data || [];
    },
    enabled: !!user?.id,
  });

  const { data: saves = [], isLoading: loadingSaves } = useQuery({
    queryKey: ["student-saves-plan", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("saved_pathways")
        .select("*")
        .eq("user_id", user!.id)
        .order("created_at", { ascending: false });
      return data || [];
    },
    enabled: !!user?.id,
  });

  const toggleGoalStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const newStatus = status === "completed" ? "not_started" : "completed";
      const { error } = await supabase.from("student_goals").update({ status: newStatus }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["student-goals-plan", user?.id] });
    }
  });

  const isLoading = loadingGoals || loadingSaves;
  const savedSubjects = saves.filter((s: any) => s.type === "subject");
  const savedPathways = saves.filter((s: any) => s.type === "pathway");
  const band = getGradeBand(profile?.grade);

  return (
    <div className="space-y-8">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-heading font-bold mb-2">My Pathway Plan 🗺️</h1>
              <p className="text-muted-foreground max-w-2xl">
                Your personal roadmap from secondary education to your career destination.
                This plan combines your saved interests, academic focus, and readiness goals.
              </p>
            </div>
            <Link to="/student/explore/pathways">
              <Button variant="outline" className="gap-2">
                <Compass className="w-4 h-4" />
                Explore More Pathways
              </Button>
            </Link>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Left Column: The Roadmap Timeline */}
              <div className="lg:col-span-2 space-y-8">
                
                {/* 1. Academic & Interest Core */}
                <section className="relative pl-8 border-l-2 border-primary/20 space-y-6">
                  <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-primary border-4 border-background" />
                  <div>
                    <h2 className="text-xl font-heading font-semibold flex items-center gap-2 mb-4">
                      <BookOpen className="w-5 h-5 text-primary" />
                      Academic & Interest Core
                    </h2>
                    <div className="card-warm p-5">
                      <h3 className="text-sm font-medium text-muted-foreground mb-3 font-heading uppercase tracking-wider">
                        Pinned Subjects
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {savedSubjects.length > 0 ? (
                          savedSubjects.map((s: any) => (
                            <span key={s.id} className="badge-sage px-3 py-1 text-sm">{s.title}</span>
                          ))
                        ) : (
                          <div className="text-sm text-center py-4 w-full text-muted-foreground border border-dashed rounded-lg">
                            No subjects pinned yet. 
                            <Link to="/student/subjects" className="text-primary hover:underline ml-1">Browse Connections</Link>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* 2. Destination Pathways */}
                  <div className="absolute -left-[9px] top-[40%] w-4 h-4 rounded-full bg-secondary border-4 border-background" />
                  <div>
                    <h2 className="text-xl font-heading font-semibold flex items-center gap-2 mb-4">
                      <GraduationCap className="w-5 h-5 text-secondary" />
                      Destination Pathways
                    </h2>
                    <div className="grid sm:grid-cols-2 gap-4">
                      {savedPathways.length > 0 ? (
                        savedPathways.map((s: any) => (
                          <div key={s.id} className="card-warm p-4 flex items-center justify-between group">
                            <div className="flex items-center gap-3">
                              <Compass className="w-4 h-4 text-secondary" />
                              <span className="font-medium">{s.title}</span>
                            </div>
                            <ArrowRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                          </div>
                        ))
                      ) : (
                        <div className="col-span-full card-warm p-6 text-center text-muted-foreground border-dashed">
                          <p>You haven't saved any destination pathways yet.</p>
                          <Link to="/student/explore/pathways">
                            <Button variant="link" className="text-primary p-0 h-auto font-semibold mt-2">Start Exploring</Button>
                          </Link>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* 3. Action Roadmap */}
                  <div className="absolute -left-[9px] bottom-0 w-4 h-4 rounded-full bg-amber-500 border-4 border-background" />
                  <div>
                    <h2 className="text-xl font-heading font-semibold flex items-center gap-2 mb-4">
                      <Target className="w-5 h-5 text-amber-500" />
                      Action Roadmap
                    </h2>
                    <div className="card-warm p-6 space-y-4">
                      {goals.length > 0 ? (
                        goals.map((goal: any) => (
                          <div key={goal.id} className="flex items-start gap-3 p-2 rounded-lg hover:bg-muted/30 transition-colors">
                            <button 
                              onClick={() => toggleGoalStatus.mutate({ id: goal.id, status: goal.status })}
                              className="mt-0.5"
                            >
                              {goal.status === "completed" 
                                ? <CheckCircle2 className="w-5 h-5 text-sage-600" />
                                : <Circle className="w-5 h-5 text-muted-foreground hover:text-primary" />
                              }
                            </button>
                            <span className={`text-sm ${goal.status === "completed" ? "line-through text-muted-foreground" : "font-medium"}`}>
                              {goal.title}
                            </span>
                          </div>
                        ))
                      ) : (
                        <p className="text-sm text-muted-foreground text-center py-4">
                          No specific goal actions set. Use the Portfolio to add transition tasks.
                        </p>
                      )}
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="w-full text-xs"
                        onClick={() => navigate("/student/portfolio")}
                      >
                        Edit Plan Actions 📝
                      </Button>
                    </div>
                  </div>
                </section>
              </div>

              {/* Sidebar: Readiness */}
              <div className="space-y-6">
                <EmployabilityTracker />
                
                <div className="card-warm p-6 bg-primary/5 border-primary/10">
                  <h3 className="font-heading font-semibold text-lg mb-2">Need advice?</h3>
                  <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
                    Your pathway plan is a living document. Discuss your destinations with your counselor to ensure alignment with university requirements or vocational prerequisites.
                  </p>
                  <Link to="/student/coach">
                    <Button className="w-full">Chat with AI Coach</Button>
                  </Link>
                </div>
              </div>
            </div>
          )}
        </motion.div>
    </div>
  );
}
