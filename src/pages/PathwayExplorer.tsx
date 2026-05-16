import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Compass, Bookmark, BookmarkCheck, Loader2, GraduationCap, Briefcase, Wrench, BookOpen } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { pathways } from "@/data/pathways";
import { toast } from "sonner";
import { getGradeBand } from "@/utils/gradeBands";

const typeIcons = {
  University: <GraduationCap className="w-5 h-5" />,
  Vocational: <BookOpen className="w-5 h-5" />,
  Apprenticeship: <Wrench className="w-5 h-5" />,
  Employment: <Briefcase className="w-5 h-5" />,
};

export default function PathwayExplorer() {
  const { user, profile } = useAuth();
  const queryClient = useQueryClient();
  const [filterType, setFilterType] = useState<string>("All");

  const { data: latestAssessment, isLoading: loadingAssessment } = useQuery({
    queryKey: ["latest-assessment-pathways", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("assessments")
        .select("results")
        .eq("user_id", user!.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      
      if (error) {
        console.error("Error fetching assessment for pathways:", error);
        return null;
      }
      return data;
    },
    enabled: !!user?.id,
  });

  const { data: savedPathways = [], isLoading: loadingSaved } = useQuery({
    queryKey: ["saved-pathways", user?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from("saved_pathways")
        .select("title")
        .eq("user_id", user!.id)
        .eq("type", "pathway");
      return (data || []).map((p) => p.title);
    },
    enabled: !!user?.id,
  });

  const toggleSave = useMutation({
    mutationFn: async ({ title, isSaved }: { title: string; isSaved: boolean }) => {
      if (isSaved) {
        const { error } = await supabase
          .from("saved_pathways")
          .delete()
          .eq("user_id", user!.id)
          .eq("title", title)
          .eq("type", "pathway");
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("saved_pathways")
          .insert({
            user_id: user!.id,
            title,
            type: "pathway",
          });
        if (error) throw error;
      }
    },
    onSuccess: (_, { title, isSaved }) => {
      queryClient.invalidateQueries({ queryKey: ["saved-pathways", user?.id] });
      toast.success(isSaved ? `Removed ${title}` : `Saved ${title}`);
    },
    onError: () => toast.error("Something went wrong"),
  });

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

  const isLoading = loadingAssessment || loadingSaved;
  const band = getGradeBand(profile?.grade);

  const filteredPathways = pathways.filter(p => filterType === "All" || p.type === filterType);
  const types = ["All", "University", "Vocational", "Apprenticeship", "Employment"];

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
              Explore Pathways 🧭
            </h1>
            <p className="text-muted-foreground max-w-2xl">
              {(band === "planning" || band === "transition")
                ? "It's time to start planning your next steps after school. Explore these specific pathways and save the ones that align with your goals." 
                : "Explore the different types of routes you can take after high school. There is no single 'right' way to reach your career goals."}
            </p>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <>
              <div className="flex flex-wrap gap-2 mb-8">
                {types.map(t => (
                  <Button 
                    key={t}
                    variant={filterType === t ? "default" : "outline"}
                    size="sm"
                    onClick={() => setFilterType(t)}
                    className="rounded-full"
                  >
                    {t}
                  </Button>
                ))}
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredPathways.map(pathway => {
                  const isSaved = savedPathways.includes(pathway.title);
                  const isRecommended = topInterests.some(i => pathway.riasecCodes.includes(i));

                  return (
                    <div key={pathway.id} className={`card-warm p-5 flex flex-col h-full border-2 transition-colors ${isRecommended ? 'border-primary/40' : 'border-transparent'}`}>
                      {isRecommended && (
                        <div className="text-[10px] uppercase tracking-wider font-semibold text-primary mb-2">
                          ★ Strong Match for You
                        </div>
                      )}
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <div className="p-2 bg-muted rounded-lg text-muted-foreground">
                            {typeIcons[pathway.type as keyof typeof typeIcons]}
                          </div>
                          <div className="text-xs font-medium text-muted-foreground uppercase">{pathway.type}</div>
                        </div>
                        <button
                          onClick={() => toggleSave.mutate({ title: pathway.title, isSaved })}
                          className={`p-1.5 rounded-md transition-colors ${
                            isSaved ? "text-primary bg-primary/10" : "text-muted-foreground hover:bg-muted"
                          }`}
                        >
                          {isSaved ? <BookmarkCheck className="w-5 h-5" /> : <Bookmark className="w-5 h-5" />}
                        </button>
                      </div>

                      <h3 className="font-heading font-semibold text-lg text-foreground mb-2">
                        {pathway.title}
                      </h3>
                      
                      <p className="text-sm text-foreground/80 mb-4 flex-1">
                        {pathway.description}
                      </p>

                      <div className="mt-auto pt-4 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
                        <span>Duration: {pathway.duration}</span>
                        <div className="flex gap-1">
                          {pathway.riasecCodes.map(code => (
                            <span 
                              key={code} 
                              className={`px-1.5 py-0.5 rounded ${
                                topInterests.includes(code) ? "bg-primary/15 text-primary-foreground font-medium" : "bg-muted"
                              }`}
                            >
                              {code.substring(0,1)}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </motion.div>
    </div>
  );
}
