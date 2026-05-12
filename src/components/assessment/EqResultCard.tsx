import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { motion } from "framer-motion";
import { BrainCircuit, Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";

export default function EqResultCard({ result: initialResult }: { result?: any }) {
  const { user } = useAuth();
  const { t } = useTranslation();

  const DOMAINS = [
    { key: "Self-Awareness", label: t("assessment_results.eq.domains.Self-Awareness"), color: "bg-blue-500", textColor: "text-blue-600", emoji: "🪞" },
    { key: "Self-Management", label: t("assessment_results.eq.domains.Self-Management"), color: "bg-indigo-500", textColor: "text-indigo-600", emoji: "🧘" },
    { key: "Social Awareness", label: t("assessment_results.eq.domains.Social Awareness"), color: "bg-violet-500", textColor: "text-violet-600", emoji: "📡" },
    { key: "Relationship Management", label: t("assessment_results.eq.domains.Relationship Management"), color: "bg-fuchsia-500", textColor: "text-fuchsia-600", emoji: "🤝" },
  ];

  const { data: fetchedResult, isLoading, isError } = useQuery({
    queryKey: ["eq-latest", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("assessments")
        .select("*")
        .eq("user_id", user!.id)
        .eq("assessment_type", "eq")
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

  if (isError || !result || !result.results) return null;

  const parsedResults = result.results as any[];
  const scores: Record<string, number> = {};
  parsedResults.forEach(r => {
    scores[r.category] = r.score;
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <BrainCircuit className="w-5 h-5 text-blue-600" />
        <h3 className="font-heading font-semibold text-lg text-foreground">{t("assessment_results.eq.title")}</h3>
      </div>

      <div className="space-y-4 pt-2">
        {DOMAINS.map((domain, i) => {
          const score = scores[domain.key] || 0;
          const percentage = (score / 5) * 100;

          return (
            <motion.div
              key={domain.key}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              className="group"
            >
              <div className="flex justify-between text-sm mb-1.5">
                <span className="font-medium text-foreground flex items-center gap-1.5">
                  <span className="opacity-70">{domain.emoji}</span>
                  {domain.label}
                </span>
                <span className={`font-semibold ${domain.textColor}`}>{score.toFixed(1)} / 5</span>
              </div>
              <div className="w-full h-2.5 bg-muted rounded-full overflow-hidden">
                <motion.div
                  className={`h-full rounded-full ${domain.color}`}
                  initial={{ width: 0 }}
                  animate={{ width: `${percentage}%` }}
                  transition={{ duration: 0.8, delay: i * 0.1 }}
                />
              </div>
            </motion.div>
          );
        })}
      </div>
      <div className="mt-6 p-4 bg-blue-50 rounded-xl border border-blue-100">
        <h4 className="text-xs font-bold uppercase tracking-wider text-blue-700 mb-2">{t("assessment_results.eq.analytical_insight")}</h4>
        <p className="text-xs text-blue-900 leading-relaxed italic">
          {(() => {
            const sortedDomains = [...DOMAINS].sort((a, b) => (scores[b.key] || 0) - (scores[a.key] || 0));
            const topDomain = sortedDomains[0];
            return t(`assessment_results.eq.insights.${topDomain.key}`);
          })()}
        </p>
      </div>

      <p className="text-[10px] text-muted-foreground text-center pt-2 italic">
        {t("assessment_results.eq.footer", { date: new Date((result as any).completed_at).toLocaleDateString() })}
      </p>
    </div>
  );
}
