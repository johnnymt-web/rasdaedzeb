import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { motion } from "framer-motion";
import { Brain, Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";

// The persisted Big Five domain score is sum/(items*5)*100 over 1-5 items, so its
// attainable range is 20-100 — not a percentage, a percentile, or a 0-100 normalisation.
// Keep these in sync with the scoring formula, not with the width of a progress bar.
const SCALE_MIN = 20;
const SCALE_MAX = 100;

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

      <div className="space-y-5">
        {TRAITS.map((trait, i) => {
          // Each domain is shown in the direction it was scored and stored.
          // No domain is inverted, re-labelled, ranked against the others, or combined.
          const score = (result as any)[trait.key] as number || 0;
          const displayScore = Math.round(score);
          // Visual geometry ONLY: map the attainable SCALE_MIN-SCALE_MAX range onto
          // 0-100% bar width, so a floor score reads as an empty bar rather than a
          // partly-filled one. Never surfaced as a value - the displayed number and
          // aria-valuenow both remain the actual persisted score.
          const barWidth = Math.min(
            100,
            Math.max(0, ((displayScore - SCALE_MIN) / (SCALE_MAX - SCALE_MIN)) * 100),
          );

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
                  {displayScore}
                </span>
              </div>
              <div
                className="h-2.5 bg-muted rounded-full overflow-hidden"
                role="meter"
                aria-label={trait.label}
                aria-valuenow={displayScore}
                aria-valuemin={SCALE_MIN}
                aria-valuemax={SCALE_MAX}
              >
                <motion.div
                  className={`h-full ${trait.color} rounded-full`}
                  initial={{ width: 0 }}
                  animate={{ width: `${barWidth}%` }}
                  transition={{ delay: 0.3 + i * 0.08, duration: 0.6, ease: "easeOut" }}
                />
              </div>
              <p className="text-[11px] text-muted-foreground leading-relaxed mt-1.5">
                {t(`assessment_results.big_five.descriptions.${trait.key}`)}
              </p>
            </motion.div>
          );
        })}
      </div>

      <div className="mt-6 p-4 bg-violet-50 rounded-xl border border-violet-100 space-y-2">
        <h4 className="text-xs font-bold uppercase tracking-wider text-violet-700">{t("assessment_results.big_five.about_title")}</h4>
        <p className="text-xs text-violet-900 leading-relaxed">
          {t("assessment_results.big_five.scale_note", { min: SCALE_MIN, max: SCALE_MAX })}
        </p>
        <p className="text-xs text-violet-900 leading-relaxed">
          {t("assessment_results.big_five.reading_note")}
        </p>
      </div>

      <p className="text-[10px] text-muted-foreground text-center pt-2 italic">
        {t("assessment_results.big_five.footer", { date: new Date((result as any).completed_at || (result as any).created_at).toLocaleDateString() })}
      </p>
    </div>
  );
}
