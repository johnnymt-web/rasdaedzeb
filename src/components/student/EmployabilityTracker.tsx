import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2, CheckCircle2, Circle, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";

const SKILLS: { id: SkillCategory; labelKey: string; descKey: string }[] = [
  { id: "resume", labelKey: "skills_tracker.resume", descKey: "skills_tracker.resume_desc" },
  { id: "interview", labelKey: "skills_tracker.interview", descKey: "skills_tracker.interview_desc" },
  { id: "networking", labelKey: "skills_tracker.networking", descKey: "skills_tracker.networking_desc" },
  { id: "financial_lit", labelKey: "skills_tracker.financial", descKey: "skills_tracker.financial_desc" },
];

type SkillCategory = "resume" | "interview" | "networking" | "financial_lit";
type SkillStatus = "not_started" | "in_progress" | "verified";

export default function EmployabilityTracker() {
  const { user } = useAuth();
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [localFallback, setLocalFallback] = useState<any[]>(() => {
    const saved = localStorage.getItem(`fallback_skills_${user?.id}`);
    return saved ? JSON.parse(saved) : [];
  });

  const { data: skills = [], isLoading, error: queryError } = useQuery({
    queryKey: ["employability-skills", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("employability_skills")
        .select("*")
        .eq("student_id", user!.id);
      if (error) {
        console.warn("DB Fetch failed, falling back to local storage:", error.message);
        return localFallback;
      }
      return data || [];
    },
    enabled: !!user?.id,
  });

  const toggleSkill = useMutation({
    mutationFn: async ({ category, currentStatus }: { category: SkillCategory; currentStatus: SkillStatus }) => {
      if (currentStatus === "verified") {
        throw new Error(t("skills_tracker.verified_locked"));
      }
      const newStatus = currentStatus === "not_started" ? "in_progress" : "not_started";
      
      try {
        const { data: existing, error: fetchError } = await supabase
          .from("employability_skills")
          .select("id")
          .eq("student_id", user!.id)
          .eq("skill_category", category)
          .single();
        
        if (fetchError && fetchError.code !== 'PGRST116') throw fetchError; // Ignore "not found"

        let error;
        if (existing) {
          ({ error } = await supabase.from("employability_skills").update({ status: newStatus }).eq("id", existing.id));
        } else {
          ({ error } = await supabase.from("employability_skills").insert({ student_id: user!.id, skill_category: category, status: newStatus }));
        }
        
        if (error) throw error;
      } catch (err: any) {
        console.error("DB update failed, using local fallback:", err.message);
        // Update local fallback
        const updated = [...localFallback];
        const idx = updated.findIndex(s => s.skill_category === category);
        if (idx >= 0) {
          updated[idx].status = newStatus;
        } else {
          updated.push({ student_id: user!.id, skill_category: category, status: newStatus });
        }
        setLocalFallback(updated);
        localStorage.setItem(`fallback_skills_${user?.id}`, JSON.stringify(updated));
        toast.info(t("skills_tracker.saved_locally"));
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employability-skills", user?.id] });
    },
    onError: (err: any) => {
      if (err.message?.includes("PGRST116")) return; // Silence single() missing error
      toast.error(err.message || t("skills_tracker.update_failed"));
    }
  });

  if (isLoading) {
    return <div className="flex justify-center p-6"><Loader2 className="w-5 h-5 animate-spin text-muted-foreground" /></div>;
  }

  // We only show the error screen if we have NO data AND no local fallback
  if (queryError && localFallback.length === 0) {
    const isMissingTable = queryError.message?.includes("relation") || queryError.message?.includes("not found");
    
    return (
      <div className="card-warm p-6 bg-destructive/5 border-destructive/20 text-center">
        <AlertCircle className="w-8 h-8 text-destructive mx-auto mb-2" />
        <h3 className="text-sm font-bold text-foreground">
          {isMissingTable ? t("skills_tracker.maintenance") : t("skills_tracker.connection_issue")}
        </h3>
        <p className="text-xs text-muted-foreground mt-1 mb-4">
          {isMissingTable 
            ? t("skills_tracker.maintenance_desc")
            : t("skills_tracker.connection_desc")}
        </p>
        <div className="flex flex-col gap-2">
          <Button size="sm" onClick={() => {
            // Activate local mode explicitly
            setLocalFallback([{ student_id: 'temp', skill_category: 'init', status: 'not_started' }]);
            toast.success(t("skills_tracker.offline_activated"));
          }}>
            {t("skills_tracker.offline_mode")}
          </Button>
          <Button size="sm" variant="outline" onClick={() => queryClient.invalidateQueries({ queryKey: ["employability-skills", user?.id] })}>
            {t("skills_tracker.retry")}
          </Button>
        </div>
      </div>
    );
  }

  const getStatusIcon = (status: SkillStatus | string) => {
    switch (status) {
      case 'verified': return <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" />;
      case 'in_progress': return <CheckCircle2 className="w-5 h-5 text-primary shrink-0" />;
      default: return <Circle className="w-5 h-5 text-muted-foreground shrink-0" />;
    }
  };

  const getStatusText = (status: SkillStatus | string) => {
    switch (status) {
      case 'verified': return t("skills_tracker.verified");
      case 'in_progress': return t("skills_tracker.self_marked");
      default: return t("skills_tracker.not_started");
    }
  };

  return (
    <div className="card-warm p-6 bg-gradient-to-br from-indigo-50 to-white dark:from-indigo-950/20 dark:to-transparent border-indigo-100/50">
      <h2 className="font-heading font-semibold text-lg text-foreground mb-1">{t("skills_tracker.title")}</h2>
      <p className="text-xs text-muted-foreground mb-6">{t("skills_tracker.desc")}</p>
      
      <div className="space-y-3">
        {SKILLS.map((skill) => {
          const record = skills.find((s: any) => s.skill_category === skill.id) || { status: 'not_started' };
          
          return (
            <div key={skill.id} className="flex items-center justify-between p-3 rounded-lg bg-background/60 hover:bg-background transition-colors border border-transparent hover:border-border">
              <div className="flex items-start gap-3">
                <button 
                  onClick={() => toggleSkill.mutate({ category: skill.id, currentStatus: record.status })}
                  disabled={record.status === 'verified'}
                  className={`mt-0.5 ${record.status === 'verified' ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                >
                  {getStatusIcon(record.status)}
                </button>
                <div>
                  <p className="text-sm font-medium text-foreground leading-tight">{t(skill.labelKey)}</p>
                  <p className="text-[11px] text-muted-foreground line-clamp-1 mt-0.5 max-w-[200px]">{t(skill.descKey)}</p>
                </div>
              </div>
              <Tooltip>
                <TooltipTrigger>
                  <div className={`text-[10px] font-medium tracking-wider uppercase px-2 py-1 rounded-md ${
                    record.status === 'verified' ? 'bg-green-100 text-green-700 dark:bg-green-900/30' :
                    record.status === 'in_progress' ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'
                  }`}>
                    {getStatusText(record.status).split(' ')[0]}
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{getStatusText(record.status)}</p>
                </TooltipContent>
              </Tooltip>
            </div>
          );
        })}
      </div>
    </div>
  );
}
