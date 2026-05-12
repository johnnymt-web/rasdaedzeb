import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowLeft, BookOpen, Bookmark, BookmarkCheck, Lightbulb, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getSubjectsByInterests, schoolSubjects } from "@/data/subjectConnections";
import { toast } from "sonner";
import { getGradeBand } from "@/utils/gradeBands";

const SubjectChoices = () => {
  const { user, profile } = useAuth();
  const queryClient = useQueryClient();
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

  // Fetch saved subjects
  const { data: savedSubjects = [], isLoading: loadingSaved } = useQuery({
    queryKey: ["saved-subjects", user?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from("saved_pathways")
        .select("title")
        .eq("user_id", user!.id)
        .eq("type", "subject");
      return (data || []).map(s => s.title);
    },
    enabled: !!user?.id,
  });

  // Toggle save mutation
  const toggleSave = useMutation({
    mutationFn: async ({ title, isSaved }: { title: string; isSaved: boolean }) => {
      if (isSaved) {
        const { error } = await supabase
          .from("saved_pathways")
          .delete()
          .eq("user_id", user!.id)
          .eq("title", title)
          .eq("type", "subject");
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("saved_pathways")
          .insert({
            user_id: user!.id,
            title,
            type: "subject",
          });
        if (error) throw error;
      }
    },
    onSuccess: (_, { title, isSaved }) => {
      queryClient.invalidateQueries({ queryKey: ["saved-subjects", user?.id] });
      toast.success(isSaved ? `Removed ${title}` : `Saved ${title}`);
    },
    onError: () => toast.error("Something went wrong"),
  });

  const isLoading = loadingAssessment || loadingSaved;

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

  return (
    <div className="space-y-8">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
          <div className="mb-6">
            <Link to="/student" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground">
              <ArrowLeft className="w-4 h-4 mr-1.5" />
              Back to Journey
            </Link>
          </div>

          <div className="mb-8">
            <h1 className="text-2xl md:text-3xl font-heading font-bold text-foreground mb-2">
              Subject Connections 📚
            </h1>
            <p className="text-muted-foreground max-w-2xl">
              {band === "discovery" 
                ? "Explore subjects you might enjoy based on your interests. Keep your options open!" 
                : band === "alignment"
                ? "Connect your career interests to your upcoming subject choices."
                : "Review subjects that align with your planned pathways and career interests."}
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
                  Because you have strong interests in <strong>{topInterests.join(" and ")}</strong>, 
                  we've highlighted subjects that match those themes well.
                </p>
              </div>

              <div className="flex gap-2 mb-6">
                <Button 
                  variant={filter === "recommended" ? "default" : "outline"} 
                  size="sm"
                  onClick={() => setFilter("recommended")}
                  className="rounded-full"
                >
                  Recommended for me
                </Button>
                <Button 
                  variant={filter === "all" ? "default" : "outline"} 
                  size="sm"
                  onClick={() => setFilter("all")}
                  className="rounded-full"
                >
                  Browse all subjects
                </Button>
              </div>

              {displaySubjects.length === 0 && filter === "recommended" ? (
                <div className="text-center py-12 text-muted-foreground bg-muted/20 rounded-xl">
                  <p>No specific subject recommendations found for {topInterests.join(" and ")}.</p>
                  <Button variant="link" onClick={() => setFilter("all")}>Browse all subjects instead</Button>
                </div>
              ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {displaySubjects.map((subject) => {
                    const isSaved = savedSubjects.includes(subject.name);
                    return (
                      <div key={subject.id} className="card-interactive p-5 flex flex-col h-full">
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="font-heading font-semibold text-foreground">{subject.name}</h3>
                          <button
                            onClick={() => toggleSave.mutate({ title: subject.name, isSaved })}
                            disabled={toggleSave.isPending}
                            className={`p-1.5 rounded-md transition-colors ${
                              isSaved ? "text-primary bg-primary/10" : "text-muted-foreground hover:bg-muted"
                            }`}
                          >
                            {isSaved ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
                          </button>
                        </div>
                        
                        <div className="text-xs font-medium text-muted-foreground mb-3 uppercase tracking-wider">
                          {subject.category}
                        </div>
                        
                        <p className="text-sm text-foreground/80 mb-4 flex-1">
                          {subject.description}
                        </p>
                        
                        <div className="flex flex-wrap gap-1 mt-auto">
                          {subject.riasecCodes.map(code => (
                            <span 
                              key={code} 
                              className={`text-[10px] px-2 py-0.5 rounded-full ${
                                topInterests.includes(code) ? "bg-primary/15 text-primary-foreground font-medium" : "bg-muted text-muted-foreground"
                              }`}
                            >
                              {code}
                            </span>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </motion.div>
    </div>
  );
};

export default SubjectChoices;
