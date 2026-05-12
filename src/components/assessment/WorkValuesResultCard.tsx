import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { motion } from "framer-motion";
import { Target, Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";

export default function WorkValuesResultCard({ result: initialResult }: { result?: any }) {
  const { user } = useAuth();
  const { t } = useTranslation();

  const VALUES = [
    { key: "achievement", label: t("assessment_results.work_values.values.achievement"), color: "bg-blue-500", textColor: "text-blue-600", emoji: "🎯" },
    { key: "independence", label: t("assessment_results.work_values.values.independence"), color: "bg-amber-500", textColor: "text-amber-600", emoji: "⚡" },
    { key: "recognition", label: t("assessment_results.work_values.values.recognition"), color: "bg-violet-500", textColor: "text-violet-600", emoji: "🏆" },
    { key: "relationships", label: t("assessment_results.work_values.values.relationships"), color: "bg-rose-500", textColor: "text-rose-600", emoji: "🤝" },
    { key: "support", label: t("assessment_results.work_values.values.support"), color: "bg-emerald-500", textColor: "text-emerald-600", emoji: "🛡️" },
    { key: "working_conditions", label: t("assessment_results.work_values.values.working_conditions"), color: "bg-slate-500", textColor: "text-slate-600", emoji: "🏢" },
  ];

  const { data: fetchedResult, isLoading, isError } = useQuery({
    queryKey: ["work-values-latest", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("work_values_assessments")
        .select("*")
        .eq("student_id", user!.id)
        .order("completed_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !!user && !initialResult,
  });

  const result = initialResult || fetchedResult;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (isError || !result) return null;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Target className="w-5 h-5 text-rose-600" />
        <h3 className="font-heading font-semibold text-lg text-foreground">{t("assessment_results.work_values.title")}</h3>
      </div>

      <div className="space-y-3">
        {VALUES.map((val, i) => {
          const score = (result as any)[val.key] as number || 0;
          const percentage = (score / 5) * 100;

          return (
            <motion.div
              key={val.key}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              className="group"
            >
              <div className="flex justify-between text-sm mb-1">
                <span className="font-medium text-foreground flex items-center gap-1.5">
                  <span className="opacity-70">{val.emoji}</span>
                  {val.label}
                </span>
                <span className={`font-semibold ${val.textColor}`}>{score.toFixed(1)} / 5</span>
              </div>
              <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                <motion.div
                  className={`h-full rounded-full ${val.color}`}
                  initial={{ width: 0 }}
                  animate={{ width: `${percentage}%` }}
                  transition={{ duration: 0.8, delay: i * 0.1 }}
                />
              </div>
            </motion.div>
          );
        })}
      </div>
      <div className="mt-6 p-4 bg-rose-50 rounded-xl border border-rose-100">
        <h4 className="text-xs font-bold uppercase tracking-wider text-rose-700 mb-2">{t("assessment_results.work_values.analytical_insight")}</h4>
        <p className="text-xs text-rose-900 leading-relaxed italic">
          {(() => {
            const sorted = [...VALUES].sort((a, b) => ((result as any)[b.key] || 0) - ((result as any)[a.key] || 0));
            const top = sorted[0];
            return t(`assessment_results.work_values.insights.${top.key}`);
          })()}
        </p>
      </div>

      <p className="text-[10px] text-muted-foreground text-center pt-2 italic">
        {t("assessment_results.work_values.footer", { date: new Date((result as any).completed_at).toLocaleDateString() })}
      </p>
    </div>
  );
}
