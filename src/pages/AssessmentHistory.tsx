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

interface Assessment {
  id: string;
  assessment_type: string;
  results: any[];
  completed_at: string;
  created_at: string;
}

export default function AssessmentHistory() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const { data: allAssessments, isLoading } = useQuery({
    queryKey: ["assessments-combined-history-radar", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const [std, bigFive, caas, workValues] = await Promise.all([
        supabase.from("assessments").select("*").eq("user_id", user.id),
        supabase.from("big_five_assessments" as any).select("*").eq("student_id", user.id),
        supabase.from("caas_assessments" as any).select("*").eq("student_id", user.id),
        supabase.from("work_values_assessments").select("*").eq("student_id", user.id)
      ]);

      const normalizedBigFive = ((bigFive.data as any[]) || []).map(a => ({
        id: a.id, assessment_type: 'bigfive', completed_at: a.completed_at, created_at: a.completed_at,
        results: [
          { category: 'Openness', pct: Math.round(a.openness || 0) },
          { category: 'Conscientiousness', pct: Math.round(a.conscientiousness || 0) },
          { category: 'Extraversion', pct: Math.round(a.extraversion || 0) },
          { category: 'Agreeableness', pct: Math.round(a.agreeableness || 0) },
          { category: 'Neuroticism', pct: Math.round(a.neuroticism || 0) }
        ]
      }));

      const normalizedCaas = ((caas.data as any[]) || []).map(a => ({
        id: a.id, assessment_type: 'caas', completed_at: a.completed_at, created_at: a.completed_at,
        results: [
          { category: 'Concern', pct: Math.round((a.concern || 0) * 20) },
          { category: 'Control', pct: Math.round((a.control || 0) * 20) },
          { category: 'Curiosity', pct: Math.round((a.curiosity || 0) * 20) },
          { category: 'Confidence', pct: Math.round((a.confidence || 0) * 20) }
        ]
      }));

      const normalizedWorkValues = ((workValues.data as any[]) || []).map(a => ({
        id: a.id, assessment_type: 'workvalues', completed_at: a.completed_at, created_at: a.completed_at,
        results: [
          { category: 'Achievement', pct: Math.round((a.achievement || 0) * 20) },
          { category: 'Independence', pct: Math.round((a.independence || 0) * 20) },
          { category: 'Recognition', pct: Math.round((a.recognition || 0) * 20) },
          { category: 'Relationships', pct: Math.round((a.relationships || 0) * 20) },
          { category: 'Support', pct: Math.round((a.support || 0) * 20) },
          { category: 'Working Conditions', pct: Math.round((a.working_conditions || 0) * 20) }
        ]
      }));

      return [
        ...(std.data || []), 
        ...normalizedBigFive, 
        ...normalizedCaas,
        ...normalizedWorkValues
      ].sort((a, b) => 
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
    { type: 'bigfive', label: 'Personality (Big Five)', color: 'border-violet-500/20', cats: ['Openness', 'Conscientiousness', 'Extraversion', 'Agreeableness', 'Neuroticism'] },
    { type: 'eq', label: 'Emotional Intelligence', color: 'border-blue-500/20', cats: ["Self-Awareness", "Self-Management", "Social Awareness", "Relationship Management"] },
    { type: 'workvalues', label: 'Work Values', color: 'border-indigo-500/20', cats: ["Achievement", "Independence", "Recognition", "Relationships", "Support", "Working Conditions"] },
    { type: 'caas', label: 'Career Adaptability', color: 'border-emerald-500/20', cats: ['Concern', 'Control', 'Curiosity', 'Confidence'] },
  ];

  return (
    <div className="space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-heading font-bold text-foreground">Diagnostic History</h1>
            <p className="text-muted-foreground">Multi-dimensional analysis of your progress</p>
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
            {config.map(item => {
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
