import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { History, RotateCcw, LayoutGrid, List } from "lucide-react";
import RiasecRadarChart from "@/components/assessment/RiasecRadarChart";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import ErrorBoundary from "@/components/ui/ErrorBoundary";
import { useTranslation } from "react-i18next";
import { useMemo, useState } from "react";
// Individual normalize functions are dynamically imported inside the query

interface Assessment {
  id: string;
  assessment_type: string;
  results: any[];
  completed_at: string;
  created_at: string;
}

export default function AssessmentHistory() {
  const { user, profile } = useAuth();
  const rawGrade = profile?.grade || user?.user_metadata?.grade || "7";
  const numericGrade = parseInt(rawGrade.toString().replace(/\D/g, "")) || 7;

  const isVisible = (id: string) => {
    if (numericGrade >= 7 && numericGrade <= 8) {
      return ["riasec", "skills"].includes(id);
    }
    if (numericGrade >= 9 && numericGrade <= 10) {
      return ["riasec", "skills", "bigfive", "workvalues"].includes(id);
    }
    if (numericGrade >= 11) {
      return true;
    }
    return ["riasec", "skills"].includes(id);
  };
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const { data: allAssessments, isLoading } = useQuery({
    queryKey: ["assessments-combined-history-radar", user?.id],
    queryFn: async () => {
      if (!user) return [];

      // Fetch each table individually to prevent one failure from crashing all
      const fetchSafe = async (query: any) => {
        try {
          const { data, error } = await query;
          if (error) {
            console.warn("Assessment history fetch warning:", error.message);
            return [];
          }
          return data || [];
        } catch (err) {
          console.warn("Assessment history fetch error:", err);
          return [];
        }
      };

      const [stdData, bigFiveData, caasData, workValuesData] = await Promise.all([
        fetchSafe(supabase.from("assessments").select("*").eq("user_id", user.id)),
        fetchSafe((supabase.from("big_five_assessments" as any) as any).select("*").eq("student_id", user.id)),
        fetchSafe((supabase.from("caas_assessments" as any) as any).select("*").eq("student_id", user.id)),
        fetchSafe(supabase.from("work_values_assessments").select("*").eq("student_id", user.id))
      ]);

      const processHistory = (data: any[], type: string, normalizeFn: (a: any) => any) => {
        return data.map(a => {
          try {
            const norm = normalizeFn(a);
            return {
              id: a.id,
              assessment_type: type,
              completed_at: a.completed_at || a.created_at,
              created_at: a.created_at,
              results: norm.results?.map((r: any) => ({ category: r.label, pct: r.pct || 0 })) || []
            };
          } catch {
            return null;
          }
        }).filter((x): x is NonNullable<typeof x> => x != null);
      };

      const { 
        normalizeBigFiveAssessment, 
        normalizeCaasAssessment, 
        normalizeWorkValuesAssessment,
        normalizeRiasecAssessment,
        normalizeSkillsAssessment
      } = await import("@/utils/assessmentNormalization");

      const riasecHistory = processHistory(stdData.filter((a: any) => a.assessment_type === 'riasec' || a.assessment_type === 'std' || !a.assessment_type), 'riasec', normalizeRiasecAssessment);
      const skillsHistory = processHistory(stdData.filter((a: any) => a.assessment_type === 'skills'), 'skills', normalizeSkillsAssessment);
      const bigFiveHistory = processHistory(bigFiveData, 'bigfive', normalizeBigFiveAssessment);
      const caasHistory = processHistory(caasData, 'caas', normalizeCaasAssessment);
      const workValuesHistory = processHistory(workValuesData, 'workvalues', normalizeWorkValuesAssessment);

      return [
        ...riasecHistory,
        ...skillsHistory,
        ...bigFiveHistory, 
        ...caasHistory,
        ...workValuesHistory
      ].sort((a: any, b: any) => 
        new Date(b.completed_at || b.created_at).getTime() - new Date(a.completed_at || a.created_at).getTime()
      );
    },
    enabled: !!user,
  });

  const grouped = useMemo(() => {
    if (!allAssessments) return {};
    return allAssessments.reduce((acc, a) => {
      const type = (a.assessment_type || 'other').toLowerCase();
      if (!acc[type]) acc[type] = [];
      acc[type].push(a);
      return acc;
    }, {} as Record<string, any[]>);
  }, [allAssessments]);

  const config = [
    { type: 'riasec', label: 'Discovery (RIASEC)', color: 'border-primary/20', cats: ["Realistic", "Investigative", "Artistic", "Social", "Enterprising", "Conventional"] },
    { type: 'skills', label: 'Employability Skills', color: 'border-amber-500/20', cats: ["Communication", "Problem Solving", "Digital Literacy", "Teamwork", "Adaptability"] },
    { type: 'bigfive', label: 'Learning and Working Style', color: 'border-violet-500/20', cats: ['Curiosity and imagination', 'Organization and follow-through', 'Social energy', 'Cooperation and empathy', 'Emotional sensitivity / stress response'] },
    { type: 'eq', label: 'Emotional Skills Reflection', color: 'border-blue-500/20', cats: ["Self-Awareness", "Self-Management", "Social Awareness", "Relationship Management"] },
    { type: 'workvalues', label: 'Work Values', color: 'border-indigo-500/20', cats: ["Achievement", "Independence", "Recognition", "Relationships", "Support", "Working Conditions"] },
    { type: 'caas', label: 'Career Adaptability', color: 'border-emerald-500/20', cats: ['Concern', 'Control', 'Curiosity', 'Confidence'] },
  ];

  return (
    <div className="space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-heading font-bold text-foreground">Assessment History</h1>
            <p className="text-muted-foreground">Review your past explorations</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex bg-muted rounded-lg p-1">
              <button onClick={() => setViewMode('grid')} className={`p-2 rounded-md transition-all ${viewMode === 'grid' ? 'bg-background shadow-sm text-primary' : 'text-muted-foreground'}`}>
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button onClick={() => setViewMode('list')} className={`p-2 rounded-md transition-all ${viewMode === 'list' ? 'bg-background shadow-sm text-primary' : 'text-muted-foreground'}`}>
                <List className="w-4 h-4" />
              </button>
            </div>
            <Button onClick={() => navigate("/student/assessment")} className="gap-2">
              <RotateCcw className="w-4 h-4" /> Retake Test
            </Button>
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[1,2,3,4].map(i => <div key={i} className="h-80 bg-muted/50 animate-pulse rounded-3xl" />)}
          </div>
        ) : !allAssessments?.length ? (
          <div className="card-warm p-12 text-center max-w-2xl mx-auto">
            <History className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="font-heading font-semibold text-lg">No history yet</h3>
            <Button onClick={() => navigate("/student/assessment")} className="mt-4">Start First Assessment</Button>
          </div>
        ) : (
          <div className={viewMode === 'grid' ? "grid grid-cols-1 md:grid-cols-2 gap-8" : "flex flex-col gap-8 max-w-3xl mx-auto"}>
            {config.filter(c => isVisible(c.type)).map(item => {
              const data = grouped[item.type];
              if (!data || data.length === 0) return null;
              return (
                <motion.div 
                  key={item.type} 
                  initial={{ opacity: 0, scale: 0.95 }} 
                  animate={{ opacity: 1, scale: 1 }}
                  className={`card-warm p-6 border-t-4 ${item.color} shadow-xl bg-card rounded-3xl`}
                >
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="font-heading font-bold text-lg">{item.label}</h2>
                    <span className="text-[10px] bg-muted px-2 py-1 rounded-full font-bold uppercase tracking-wider">
                      {data.length} {data.length === 1 ? 'Entry' : 'Entries'}
                    </span>
                  </div>
                  <ErrorBoundary name={`${item.label} Chart`}>
                    <RiasecRadarChart assessments={data} categories={item.cats} maxOverlays={2} />
                  </ErrorBoundary>
                </motion.div>
              );
            })}
          </div>
        )}
    </div>
  );
}
