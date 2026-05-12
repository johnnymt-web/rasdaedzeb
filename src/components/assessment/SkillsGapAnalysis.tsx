import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchOnetData } from "@/services/onetService";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import {
  TrendingUp, TrendingDown, Minus, Loader2,
  AlertCircle, CheckCircle2, Target
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";

interface SkillGap {
  skill: string;
  required: number;
  student: number;
  gap: number;
}

interface SkillsGapProps {
  occupationCode: string;
  occupationTitle: string;
}

export default function SkillsGapAnalysis({ occupationCode, occupationTitle }: SkillsGapProps) {
  const { user } = useAuth();
  const { t } = useTranslation();

  const { data: gapData, isLoading, error } = useQuery({
    queryKey: ["skills-gap", occupationCode, user?.id],
    queryFn: async () => {
      // 1. Fetch required skills from O*NET
      const onetSkills = await fetchOnetData(`/mnm/careers/${occupationCode}/skills`);
      const requiredSkills: { name: string; score: number }[] = (onetSkills || []).map((s: any) => ({
        name: s.name || s.element?.name || "Unknown",
        score: s.score?.value || s.importance || 50,
      }));

      // 2. Fetch student's self-assessed skills from latest snapshot
      let studentSkills: Record<string, number> = {};
      if (user) {
        const { data: snapshot } = await supabase
          .from("student_skill_snapshots" as any)
          .select("skills")
          .eq("student_id", user.id)
          .order("snapshot_at", { ascending: false })
          .limit(1)
          .maybeSingle();

        if ((snapshot as any)?.skills && Array.isArray((snapshot as any).skills)) {
          ((snapshot as any).skills as any[]).forEach((s: any) => {
            studentSkills[s.name?.toLowerCase()] = s.self_rating || 0;
          });
        }
      }

      // 3. Calculate gaps
      const gaps: SkillGap[] = requiredSkills.slice(0, 10).map((rs) => {
        const normalizedRequired = Math.round((rs.score / 100) * 7); // Normalize to 0-7
        const studentLevel = studentSkills[rs.name.toLowerCase()] ?? 0;
        return {
          skill: rs.name,
          required: normalizedRequired,
          student: studentLevel,
          gap: normalizedRequired - studentLevel,
        };
      });

      // 4. Summary
      const matched = gaps.filter((g) => g.gap <= 0).length;
      const toDevelop = gaps.filter((g) => g.gap > 0).length;
      const readiness = gaps.length > 0 ? Math.round((matched / gaps.length) * 100) : 0;

      return { gaps, matched, toDevelop, readiness };
    },
    enabled: !!occupationCode,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error || !gapData) {
    return (
      <div className="text-center py-6 text-muted-foreground text-sm">
        <AlertCircle className="w-5 h-5 mx-auto mb-2 opacity-30" />
        {t("assessment_results.skills_gap.error")}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Target className="w-5 h-5 text-primary" />
        <h4 className="text-sm font-bold text-foreground">{t("assessment_results.skills_gap.title")}</h4>
      </div>

      {/* Readiness Score */}
      <div className="flex items-center gap-4 p-3 rounded-xl bg-muted/30 border border-border/50">
        <div className="text-center">
          <span className={`text-2xl font-heading font-bold ${
            gapData.readiness >= 70 ? "text-emerald-600" :
            gapData.readiness >= 40 ? "text-amber-600" : "text-rose-600"
          }`}>
            {gapData.readiness}%
          </span>
          <p className="text-[10px] text-muted-foreground">{t("assessment_results.skills_gap.readiness")}</p>
        </div>
        <div className="flex-1 text-xs text-muted-foreground space-y-0.5">
          <p className="flex items-center gap-1.5">
            <CheckCircle2 className="w-3 h-3 text-emerald-500" />
            {t("assessment_results.skills_gap.matched_count", { count: gapData.matched })}
          </p>
          <p className="flex items-center gap-1.5">
            <TrendingUp className="w-3 h-3 text-amber-500" />
            {t("assessment_results.skills_gap.to_develop_count", { count: gapData.toDevelop })}
          </p>
        </div>
      </div>

      {/* Skill bars */}
      <div className="space-y-2.5">
        {gapData.gaps.map((g, i) => (
          <motion.div
            key={g.skill}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="space-y-1"
          >
            <div className="flex items-center justify-between text-xs">
              <span className="font-medium text-foreground truncate max-w-[60%]">{g.skill}</span>
              <div className="flex items-center gap-1.5">
                {g.gap <= 0 ? (
                  <Badge className="bg-emerald-500/10 text-emerald-600 text-[9px] py-0 h-4">{t("assessment_results.skills_gap.status.match")}</Badge>
                ) : g.gap <= 2 ? (
                  <Badge className="bg-amber-500/10 text-amber-600 text-[9px] py-0 h-4">{t("assessment_results.skills_gap.status.close")}</Badge>
                ) : (
                  <Badge className="bg-rose-500/10 text-rose-600 text-[9px] py-0 h-4">{t("assessment_results.skills_gap.status.gap")}</Badge>
                )}
              </div>
            </div>
            <div className="flex gap-1 h-1.5">
              <div className="flex-1 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-500 rounded-full transition-all"
                  style={{ width: `${(g.student / 7) * 100}%` }}
                />
              </div>
              <div className="flex-1 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary/40 rounded-full transition-all"
                  style={{ width: `${(g.required / 7) * 100}%` }}
                />
              </div>
            </div>
            <div className="flex justify-between text-[9px] text-muted-foreground">
              <span>{t("assessment_results.skills_gap.levels.you")}: {g.student}/7</span>
              <span>{t("assessment_results.skills_gap.levels.required")}: {g.required}/7</span>
            </div>
          </motion.div>
        ))}
      </div>
      <p className="text-[10px] text-muted-foreground italic text-center pt-2">
        {t("assessment_results.skills_gap.cta")}
      </p>
    </div>
  );
}
