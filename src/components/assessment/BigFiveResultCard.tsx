import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { motion } from "framer-motion";
import { Brain, Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";

export default function BigFiveResultCard({ result: initialResult }: { result?: any }) {
  const { user } = useAuth();
  const { t } = useTranslation();

  const TRAITS = [
    { key: "openness", label: t("assessment_results.big_five.traits.openness"), color: "bg-violet-500", textColor: "text-violet-600", emoji: "💡" },
    { key: "conscientiousness", label: t("assessment_results.big_five.traits.conscientiousness"), color: "bg-blue-500", textColor: "text-blue-600", emoji: "📋" },
    { key: "extraversion", label: t("assessment_results.big_five.traits.extraversion"), color: "bg-amber-500", textColor: "text-amber-600", emoji: "🗣️" },
    { key: "agreeableness", label: t("assessment_results.big_five.traits.agreeableness"), color: "bg-emerald-500", textColor: "text-emerald-600", emoji: "🤝" },
    { key: "neuroticism", label: t("assessment_results.big_five.traits.neuroticism"), color: "bg-rose-500", textColor: "text-rose-600", emoji: "🧘" },
  ];

  const { data: fetchedResult, isLoading, isError } = useQuery({
    queryKey: ["big-five-latest", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("big_five_assessments" as any)
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
        <Brain className="w-5 h-5 text-violet-600" />
        <h3 className="font-heading font-semibold text-lg text-foreground">{t("assessment_results.big_five.title")}</h3>
      </div>

      <div className="space-y-3">
        {TRAITS.map((trait, i) => {
          const score = (result as any)[trait.key] as number || 0;
          // For neuroticism, we invert the display to show "Emotional Stability"
          const displayScore = trait.key === "neuroticism" ? 100 - score : score;

          return (
            <motion.div
              key={trait.key}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.08 }}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium text-foreground flex items-center gap-1.5">
                  <span>{trait.emoji}</span> {trait.label}
                </span>
                <span className={`text-sm font-bold ${trait.textColor}`}>
                  {Math.round(displayScore)}%
                </span>
              </div>
              <div className="h-2.5 bg-muted rounded-full overflow-hidden">
                <motion.div
                  className={`h-full ${trait.color} rounded-full`}
                  initial={{ width: 0 }}
                  animate={{ width: `${displayScore}%` }}
                  transition={{ delay: 0.3 + i * 0.08, duration: 0.6, ease: "easeOut" }}
                />
              </div>
            </motion.div>
          );
        })}
      </div>

      <div className="mt-6 p-4 bg-violet-50 rounded-xl border border-violet-100">
        <h4 className="text-xs font-bold uppercase tracking-wider text-violet-700 mb-2">{t("assessment_results.big_five.analytical_insight")}</h4>
        <p className="text-xs text-violet-900 leading-relaxed italic">
          {(() => {
            const scores = TRAITS.map(t => ({ 
              key: t.key,
              score: t.key === "neuroticism" ? 100 - ((result as any)[t.key] || 0) : ((result as any)[t.key] || 0) 
            }));
            const topTrait = [...scores].sort((a, b) => b.score - a.score)[0];
            return t(`assessment_results.big_five.insights.${topTrait.key}`);
          })()}
        </p>
      </div>

      <p className="text-[10px] text-muted-foreground text-center pt-2 italic">
        {t("assessment_results.big_five.footer", { date: new Date((result as any).completed_at || (result as any).created_at).toLocaleDateString() })}
      </p>
    </div>
  );
}
