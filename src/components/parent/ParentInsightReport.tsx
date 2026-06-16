import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Sparkles, Loader2, AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

interface Props {
  studentId: string;
  studentName: string;
}

interface InsightReport {
  summary: string;
  strengths: string[];
  suggestions: string[];
  generatedAt: string;
}

export default function ParentInsightReport({ studentId, studentName }: Props) {
  const [refreshKey, setRefreshKey] = useState(0);

  const { data: report, isLoading, isError } = useQuery({
    queryKey: ["parent-insight-report", studentId, refreshKey],
    queryFn: async (): Promise<InsightReport> => {
      const { data: assessmentData, error: assessmentError } = await (supabase
        .from("assessments" as any)
        .select("assessment_type, results, completed_at")
        .eq("user_id", studentId)
        .not("completed_at", "is", null)
        .order("completed_at", { ascending: false })) as any;

      if (assessmentError) throw assessmentError;

      if (!assessmentData || assessmentData.length === 0) {
        return {
          summary: `${studentName} has not completed any assessments yet. Encourage them to start with the Career Interests assessment.`,
          strengths: [],
          suggestions: ["Ask your child to log in and complete their first assessment."],
          generatedAt: new Date().toISOString(),
        };
      }

      const { data, error } = await supabase.functions.invoke("generate-parent-insight", {
        body: { studentId, studentName, assessments: assessmentData },
      });

      if (error) throw error;
      return { ...data, generatedAt: new Date().toISOString() };
    },
    enabled: !!studentId,
    staleTime: 1000 * 60 * 10,
  });

  if (isLoading) {
    return (
      <div className="flex items-center gap-3 p-6 text-muted-foreground">
        <Loader2 className="w-5 h-5 animate-spin" />
        <span className="text-sm">Generating insight report...</span>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex items-center gap-3 p-6 text-destructive">
        <AlertCircle className="w-5 h-5" />
        <span className="text-sm">Could not load insight report. Please try again.</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-primary" />
          <h3 className="font-heading font-bold text-lg">AI Insight Report</h3>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setRefreshKey(k => k + 1)}
          className="text-xs gap-1.5"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Refresh
        </Button>
      </div>

      {report && (
        <>
          <div className="p-5 bg-primary/5 rounded-2xl border border-primary/20">
            <p className="text-sm leading-relaxed text-foreground">{report.summary}</p>
          </div>

          {report.strengths.length > 0 && (
            <div>
              <h4 className="font-bold text-sm mb-3 text-foreground">Observed Strengths</h4>
              <ul className="space-y-2">
                {report.strengths.map((s, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-foreground/80">
                    <span className="mt-1 w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                    {s}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {report.suggestions.length > 0 && (
            <div>
              <h4 className="font-bold text-sm mb-3 text-foreground">How You Can Help</h4>
              <ul className="space-y-2">
                {report.suggestions.map((s, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-foreground/80">
                    <span className="mt-1 w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
                    {s}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <p className="text-[10px] text-muted-foreground">
            Generated {new Date(report.generatedAt).toLocaleString()}
          </p>
        </>
      )}
    </div>
  );
}
