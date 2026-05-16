import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { 
  ArrowLeft, Compass, Bookmark, CheckCircle2, 
  Circle, Loader2, FileText, ArrowRight,
  GraduationCap, BookOpen, Target, Plus, Trash2, Star, Save, Info, Sparkles,
  Map, Briefcase, School
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { getGradeBand } from "@/utils/gradeBands";
import { 
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter 
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface CareerPathway {
  id: string;
  title: string;
  career_id?: string;
  higher_ed_goal?: string;
  subjects: string[];
  skills_to_develop: string[];
  is_primary: boolean;
}

export default function PathwayPlanner() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isAdding, setIsAdding] = useState(false);

  // Fetch pathways
  const { data: pathways = [], isLoading: loadingPathways } = useQuery({
    queryKey: ["student-career-pathways", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("student_career_pathways" as any)
        .select("*")
        .eq("student_id", user!.id)
        .order("created_at", { ascending: true });
      if (error) throw error;
      return data as CareerPathway[];
    },
    enabled: !!user?.id,
  });

  // Fetch saved subjects for reference
  const { data: savedSubjects = [] } = useQuery({
    queryKey: ["saved-subjects-ref", user?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from("student_subject_plans")
        .select("subjects")
        .eq("student_id", user!.id)
        .maybeSingle();
      return (data?.subjects || []) as any[];
    },
    enabled: !!user?.id,
  });

  const createPathway = useMutation({
    mutationFn: async (newPath: Partial<CareerPathway>) => {
      const { error } = await supabase
        .from("student_career_pathways" as any)
        .insert([{ ...newPath, student_id: user!.id }]);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["student-career-pathways"] });
      toast.success("Pathway created!");
      setIsAdding(false);
    },
    onError: (err: any) => toast.error(err.message)
  });

  const deletePathway = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("student_career_pathways" as any).delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["student-career-pathways"] });
      toast.success("Pathway removed");
    }
  });

  const setPrimary = useMutation({
    mutationFn: async (id: string) => {
      // Supabase UNIQUE index will handle the primary constraint or we do it via rpc/two calls
      // Here we do two calls for simplicity if no RPC
      await supabase.from("student_career_pathways" as any).update({ is_primary: false }).eq("student_id", user!.id);
      const { error } = await supabase.from("student_career_pathways" as any).update({ is_primary: true }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["student-career-pathways"] });
      toast.success("Primary pathway set!");
    }
  });

  const band = getGradeBand(profile?.grade);

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
          <div>
            <div className="flex items-center gap-2 text-primary font-bold text-sm uppercase tracking-widest mb-2">
              <Map className="w-4 h-4" />
              Strategic Planning
            </div>
            <h1 className="text-3xl md:text-4xl font-heading font-bold mb-3">Pathway Architect</h1>
            <p className="text-muted-foreground max-w-2xl leading-relaxed">
              Design your long-term journey by connecting your current academic choices to university goals and career families.
            </p>
          </div>
          <Dialog open={isAdding} onOpenChange={setIsAdding}>
            <DialogTrigger asChild>
              <Button className="gap-2 rounded-xl h-11 px-6 shadow-lg shadow-primary/20">
                <Plus className="w-5 h-5" />
                New Pathway
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Architect New Pathway</DialogTitle>
              </DialogHeader>
              <form onSubmit={(e) => {
                e.preventDefault();
                const form = e.target as HTMLFormElement;
                const formData = new FormData(form);
                createPathway.mutate({
                  title: formData.get("title") as string,
                  higher_ed_goal: formData.get("higher_ed") as string,
                  subjects: savedSubjects.map(s => s.name).slice(0, 3) // Preview/Default
                });
              }} className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Pathway Name</Label>
                  <Input name="title" placeholder="e.g., Computer Science & AI" required />
                </div>
                <div className="space-y-2">
                  <Label>Higher Ed Destination</Label>
                  <Input name="higher_ed" placeholder="e.g., BSc Software Engineering" required />
                </div>
                <div className="p-4 bg-muted/30 rounded-xl">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase mb-2">Pre-linked Subjects</p>
                  <div className="flex flex-wrap gap-2">
                    {savedSubjects.length > 0 ? (
                      savedSubjects.map(s => (
                        <span key={s.name} className="text-[11px] bg-white border px-2 py-0.5 rounded-md">{s.name}</span>
                      ))
                    ) : (
                      <span className="text-xs text-muted-foreground italic">No subjects planned yet.</span>
                    )}
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit" disabled={createPathway.isPending}>
                    Initialize Pathway
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {loadingPathways ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : pathways.length === 0 ? (
          <div className="text-center py-24 border-2 border-dashed rounded-[32px] bg-muted/5">
            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <Compass className="w-10 h-10 text-primary" />
            </div>
            <h3 className="text-xl font-bold text-foreground mb-2">No Pathways Defined</h3>
            <p className="text-muted-foreground max-w-sm mx-auto mb-8 leading-relaxed">
              You haven't architected any career journeys yet. Start by defining your first destination.
            </p>
            <Button onClick={() => setIsAdding(true)} variant="outline" className="rounded-xl px-8 h-12">
              Architect My First Path
            </Button>
          </div>
        ) : (
          <div className="space-y-12">
            <AnimatePresence mode="popLayout">
              {pathways.map((path) => (
                <motion.div 
                  key={path.id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className={`relative overflow-hidden rounded-[32px] border-2 transition-all ${
                    path.is_primary ? "border-primary bg-primary/[0.02]" : "border-border bg-white"
                  }`}
                >
                  {path.is_primary && (
                    <div className="absolute top-0 right-0 bg-primary text-white px-6 py-1.5 rounded-bl-2xl text-[10px] font-bold uppercase tracking-widest flex items-center gap-2">
                      <Star className="w-3 h-3 fill-white" />
                      Primary Focus
                    </div>
                  )}

                  <div className="p-8">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                      <div>
                        <h2 className="text-2xl font-bold text-foreground mb-1">{path.title}</h2>
                        <div className="flex items-center gap-2 text-muted-foreground text-sm">
                          <Map className="w-4 h-4" />
                          Long-term career journey
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {!path.is_primary && (
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="rounded-lg h-9 text-xs"
                            onClick={() => setPrimary.mutate(path.id)}
                          >
                            Set as Primary
                          </Button>
                        )}
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-9 w-9 text-muted-foreground hover:text-destructive"
                          onClick={() => deletePathway.mutate(path.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8 relative">
                      {/* Connector Lines (Desktop Only) */}
                      <div className="hidden md:block absolute top-[28px] left-[25%] right-[25%] h-0.5 bg-dashed-border opacity-20" />
                      
                      {/* Step 1: Subjects */}
                      <div className="space-y-4 relative z-10">
                        <div className="w-14 h-14 rounded-2xl bg-sage-100 flex items-center justify-center text-sage-600 mb-2">
                          <BookOpen className="w-7 h-7" />
                        </div>
                        <div>
                          <h4 className="font-bold text-sm uppercase tracking-wider text-muted-foreground mb-3">1. Academic Base</h4>
                          <div className="flex flex-wrap gap-1.5">
                            {path.subjects.length > 0 ? (
                              path.subjects.map(s => (
                                <span key={s} className="bg-white border text-[11px] px-2.5 py-1 rounded-md font-medium text-foreground/70">
                                  {s}
                                </span>
                              ))
                            ) : (
                              <span className="text-xs text-muted-foreground italic">None linked</span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Step 2: Higher Ed */}
                      <div className="space-y-4 relative z-10">
                        <div className="w-14 h-14 rounded-2xl bg-blue-100 flex items-center justify-center text-blue-600 mb-2">
                          <GraduationCap className="w-7 h-7" />
                        </div>
                        <div>
                          <h4 className="font-bold text-sm uppercase tracking-wider text-muted-foreground mb-3">2. Higher Education</h4>
                          <p className="font-bold text-foreground">{path.higher_ed_goal || "Not set"}</p>
                          <p className="text-xs text-muted-foreground mt-1">Undergraduate target</p>
                        </div>
                      </div>

                      {/* Step 3: Career */}
                      <div className="space-y-4 relative z-10">
                        <div className="w-14 h-14 rounded-2xl bg-amber-100 flex items-center justify-center text-amber-600 mb-2">
                          <Briefcase className="w-7 h-7" />
                        </div>
                        <div>
                          <h4 className="font-bold text-sm uppercase tracking-wider text-muted-foreground mb-3">3. Career Family</h4>
                          <p className="font-bold text-foreground">{path.title}</p>
                          <p className="text-xs text-muted-foreground mt-1">Ultimate destination</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {/* AI Insight Card */}
            <div className="card-warm p-8 surface-amber relative overflow-hidden group">
              <Sparkles className="absolute -right-4 -top-4 w-32 h-32 text-amber-200/40 rotate-12 transition-transform group-hover:scale-110" />
              <div className="relative z-10 flex flex-col md:flex-row items-start gap-6">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/20 flex items-center justify-center text-amber-700 flex-shrink-0">
                  <Info className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-amber-900 mb-2">Pathway Strategy</h3>
                  <p className="text-sm text-amber-800/80 leading-relaxed max-w-3xl mb-4">
                    Based on your primary pathway, you should prioritize developing skills in <strong>communication</strong> and <strong>technical literacy</strong>. 
                    Your subject choices in Mathematics and Computer Science provide a strong foundation for your Higher Ed goal.
                  </p>
                  <Button variant="link" className="text-amber-900 p-0 font-bold flex items-center gap-1">
                    Review with AI Coach
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}

function BriefcaseIcon(props: any) {
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
      <rect width="20" height="14" x="2" y="7" rx="2" ry="2" />
      <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
    </svg>
  );
}
