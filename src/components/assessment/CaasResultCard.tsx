import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { motion } from "framer-motion";
import { Compass, Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";

export default function CaasResultCard({ result: initialResult }: { result?: any }) {
  const { user } = useAuth();
  const { t } = useTranslation();

  const SUBSCALES = [
    { key: "concern", label: t("assessment_results.caas.factors.Concern"), color: "bg-blue-500", textColor: "text-blue-600", desc: t("assessment_results.caas.sub_descs.concern") },
    { key: "control", label: t("assessment_results.caas.factors.Control"), color: "bg-emerald-500", textColor: "text-emerald-600", desc: t("assessment_results.caas.sub_descs.control") },
    { key: "curiosity", label: t("assessment_results.caas.factors.Curiosity"), color: "bg-amber-500", textColor: "text-amber-600", desc: t("assessment_results.caas.sub_descs.curiosity") },
    { key: "confidence", label: t("assessment_results.caas.factors.Confidence"), color: "bg-rose-500", textColor: "text-rose-600", desc: t("assessment_results.caas.sub_descs.confidence") },
  ];

  const { data: fetchedResult, isLoading, isError } = useQuery({
    queryKey: ["caas-latest", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("caas_assessments" as any)
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

  const totalScore = (result as any).total_score || 0;

  const getStatusText = (score: number) => {
    if (score >= 4) return t("assessment_results.caas.levels.excellent");
    if (score >= 3) return t("assessment_results.caas.levels.good");
    if (score >= 2) return t("assessment_results.caas.levels.developing");
    return t("assessment_results.caas.levels.emerging");
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Compass className="w-5 h-5 text-emerald-600" />
        <h3 className="font-heading font-semibold text-lg text-foreground">{t("assessment_results.caas.title")}</h3>
      </div>

      {/* Overall Score */}
      <div className="flex items-center gap-4 p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/20">
        <div className="text-center">
          <span className="text-3xl font-heading font-bold text-emerald-600">
            {totalScore.toFixed(1)}
          </span>
          <p className="text-[10px] text-muted-foreground">/5.0</p>
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium text-foreground">{t("assessment_results.caas.overall")}</p>
          <p className="text-xs text-muted-foreground">
            {getStatusText(totalScore)}
          </p>
        </div>
      </div>

      {/* Subscale bars */}
      <div className="space-y-3">
        {SUBSCALES.map((sub, i) => {
          const score = (result as any)[sub.key] as number || 0;
          const percent = (score / 5) * 100;

          return (
            <motion.div
              key={sub.key}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.08 }}
            >
              <div className="flex items-center justify-between mb-1">
                <div>
                  <span className="text-sm font-medium text-foreground">{sub.label}</span>
                  <span className="text-[10px] text-muted-foreground ml-2">{sub.desc}</span>
                </div>
                <span className={`text-sm font-bold ${sub.textColor}`}>
                  {score.toFixed(1)}
                </span>
              </div>
              <div className="h-2.5 bg-muted rounded-full overflow-hidden">
                <motion.div
                  className={`h-full ${sub.color} rounded-full`}
                  initial={{ width: 0 }}
                  animate={{ width: `${percent}%` }}
                  transition={{ delay: 0.3 + i * 0.08, duration: 0.6, ease: "easeOut" }}
                />
              </div>
            </motion.div>
          );
        })}
      </div>

      <div className="mt-6 p-4 bg-emerald-50 rounded-xl border border-emerald-100">
        <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-700 mb-2">{t("assessment_results.caas.analytical_insight")}</h4>
        <p className="text-xs text-emerald-900 leading-relaxed italic">
          {(() => {
            const sorted = [
              { key: "Concern", val: (result as any).concern || 0 },
              { key: "Control", val: (result as any).control || 0 },
              { key: "Curiosity", val: (result as any).curiosity || 0 },
              { key: "Confidence", val: (result as any).confidence || 0 },
            ].sort((a, b) => b.val - a.val);
            return t(`assessment_results.caas.insights.${sorted[0].key}`);
          })()}
        </p>
      </div>

      <p className="text-[10px] text-muted-foreground text-center pt-2 italic">
        {t("assessment_results.caas.footer", { date: new Date((result as any).completed_at || (result as any).created_at).toLocaleDateString() })}
      </p>
    </div>
  );
}
