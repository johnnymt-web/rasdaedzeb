import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Brain, ChevronLeft, ChevronRight, Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { calculateBigFiveScores, saveBigFiveAssessment } from "@/services/assessmentService";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";

// IPIP-NEO-50 Items (10 per trait)
// We keep the IDs and metadata, but fetch the text from i18n
const BIG_FIVE_ITEMS = [
  // Extraversion (E)
  { id: "e1", trait: "extraversion", sign: 1 },
  { id: "e2", trait: "extraversion", sign: -1 },
  { id: "e3", trait: "extraversion", sign: 1 },
  { id: "e4", trait: "extraversion", sign: -1 },
  { id: "e5", trait: "extraversion", sign: 1 },
  { id: "e6", trait: "extraversion", sign: -1 },
  { id: "e7", trait: "extraversion", sign: 1 },
  { id: "e8", trait: "extraversion", sign: -1 },
  { id: "e9", trait: "extraversion", sign: 1 },
  { id: "e10", trait: "extraversion", sign: -1 },
  // Agreeableness (A)
  { id: "a1", trait: "agreeableness", sign: -1 },
  { id: "a2", trait: "agreeableness", sign: 1 },
  { id: "a3", trait: "agreeableness", sign: -1 },
  { id: "a4", trait: "agreeableness", sign: 1 },
  { id: "a5", trait: "agreeableness", sign: -1 },
  { id: "a6", trait: "agreeableness", sign: 1 },
  { id: "a7", trait: "agreeableness", sign: -1 },
  { id: "a8", trait: "agreeableness", sign: 1 },
  { id: "a9", trait: "agreeableness", sign: 1 },
  { id: "a10", trait: "agreeableness", sign: 1 },
  // Conscientiousness (C)
  { id: "c1", trait: "conscientiousness", sign: 1 },
  { id: "c2", trait: "conscientiousness", sign: -1 },
  { id: "c3", trait: "conscientiousness", sign: 1 },
  { id: "c4", trait: "conscientiousness", sign: -1 },
  { id: "c5", trait: "conscientiousness", sign: 1 },
  { id: "c6", trait: "conscientiousness", sign: -1 },
  { id: "c7", trait: "conscientiousness", sign: 1 },
  { id: "c8", trait: "conscientiousness", sign: -1 },
  { id: "c9", trait: "conscientiousness", sign: 1 },
  { id: "c10", trait: "conscientiousness", sign: 1 },
  // Neuroticism (N)
  { id: "n1", trait: "neuroticism", sign: 1 },
  { id: "n2", trait: "neuroticism", sign: -1 },
  { id: "n3", trait: "neuroticism", sign: 1 },
  { id: "n4", trait: "neuroticism", sign: -1 },
  { id: "n5", trait: "neuroticism", sign: 1 },
  { id: "n6", trait: "neuroticism", sign: 1 },
  { id: "n7", trait: "neuroticism", sign: 1 },
  { id: "n8", trait: "neuroticism", sign: 1 },
  { id: "n9", trait: "neuroticism", sign: 1 },
  { id: "n10", trait: "neuroticism", sign: 1 },
  // Openness (O)
  { id: "o1", trait: "openness", sign: 1 },
  { id: "o2", trait: "openness", sign: -1 },
  { id: "o3", trait: "openness", sign: 1 },
  { id: "o4", trait: "openness", sign: -1 },
  { id: "o5", trait: "openness", sign: 1 },
  { id: "o6", trait: "openness", sign: -1 },
  { id: "o7", trait: "openness", sign: 1 },
  { id: "o8", trait: "openness", sign: 1 },
  { id: "o9", trait: "openness", sign: 1 },
  { id: "o10", trait: "openness", sign: 1 },
];

const ITEMS_PER_PAGE = 5;

export default function BigFiveAssessment() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [responses, setResponses] = useState<Record<string, number>>({});
  const [currentPage, setCurrentPage] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [startTime] = useState(Date.now());

  const LIKERT_OPTIONS = [
    { value: 1, label: t("common.likert.very_inaccurate") },
    { value: 2, label: t("common.likert.moderately_inaccurate") },
    { value: 3, label: t("common.likert.neither") },
    { value: 4, label: t("common.likert.moderately_accurate") },
    { value: 5, label: t("common.likert.very_accurate") },
  ];

  const totalPages = Math.ceil(BIG_FIVE_ITEMS.length / ITEMS_PER_PAGE);
  const currentItems = BIG_FIVE_ITEMS.slice(
    currentPage * ITEMS_PER_PAGE,
    (currentPage + 1) * ITEMS_PER_PAGE
  );
  const progress = (Object.keys(responses).length / BIG_FIVE_ITEMS.length) * 100;
  const allAnswered = Object.keys(responses).length === BIG_FIVE_ITEMS.length;
  const pageComplete = currentItems.every((item) => responses[item.id] !== undefined);

  const handleResponse = (itemId: string, value: number) => {
    setResponses((prev) => ({ ...prev, [itemId]: value }));
  };

  const handleSubmit = async () => {
    if (!user || !allAnswered) return;
    setSubmitting(true);
    try {
      const timeTaken = Math.round((Date.now() - startTime) / 1000);
      await saveBigFiveAssessment(user.id, responses);
      toast({ 
        title: t("assessment.big_five.toast_success"), 
        description: t("assessment.big_five.toast_success_desc") 
      });
      navigate("/student/report");
    } catch (err) {
      toast({ 
        title: t("assessment.big_five.toast_error"), 
        description: t("assessment.big_five.toast_error_desc"), 
        variant: "destructive" 
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
          {/* Header */}
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-2xl bg-violet-500/10 text-violet-600 flex items-center justify-center">
              <Brain className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-2xl font-heading font-bold">{t("assessment.big_five.title")}</h1>
              <p className="text-sm text-muted-foreground">{t("assessment.big_five.subtitle")}</p>
            </div>
          </div>

          {/* Progress bar */}
          <div className="mt-6 mb-8">
            <div className="flex justify-between text-xs text-muted-foreground mb-1.5">
              <span>{t("assessment.big_five.answered", { count: Object.keys(responses).length, total: BIG_FIVE_ITEMS.length })}</span>
              <span>{t("assessment.big_five.page", { current: currentPage + 1, total: totalPages })}</span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-violet-500 to-purple-500 rounded-full"
                animate={{ width: `${progress}%` }}
                transition={{ type: "spring", stiffness: 100 }}
              />
            </div>
          </div>

          {/* Questions */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentPage}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-5"
            >
              {currentItems.map((item, idx) => (
                <div
                  key={item.id}
                  className={`p-5 rounded-xl border transition-all duration-200 ${
                    responses[item.id] !== undefined
                      ? "border-violet-500/30 bg-violet-500/5"
                      : "border-border bg-card"
                  }`}
                >
                  <p className="text-sm font-medium text-foreground mb-3">
                    <span className="text-muted-foreground mr-2">
                      {currentPage * ITEMS_PER_PAGE + idx + 1}.
                    </span>
                    {t(`assessment.big_five.questions.${item.id}`)}
                  </p>
                  <div className="flex gap-2">
                    {LIKERT_OPTIONS.map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => handleResponse(item.id, opt.value)}
                        className={`flex-1 py-2 px-1 rounded-lg text-[11px] font-medium border transition-all ${
                          responses[item.id] === opt.value
                            ? "bg-violet-500 text-white border-violet-500 shadow-md scale-105"
                            : "bg-muted/50 text-muted-foreground border-transparent hover:border-violet-500/30 hover:bg-violet-500/10"
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </motion.div>
          </AnimatePresence>

          {/* Navigation */}
          <div className="flex justify-between mt-8">
            <Button
              variant="outline"
              onClick={() => setCurrentPage((p) => Math.max(0, p - 1))}
              disabled={currentPage === 0}
              className="gap-1.5"
            >
              <ChevronLeft className="w-4 h-4" /> {t("common.previous")}
            </Button>

            {currentPage < totalPages - 1 ? (
              <Button
                onClick={() => setCurrentPage((p) => p + 1)}
                disabled={!pageComplete}
                className="gap-1.5 bg-violet-600 hover:bg-violet-700"
              >
                {t("common.next")} <ChevronRight className="w-4 h-4" />
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={!allAnswered || submitting}
                className="gap-1.5 bg-violet-600 hover:bg-violet-700"
              >
                {submitting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Check className="w-4 h-4" />
                )}
                {t("assessment.big_five.submit")}
              </Button>
            )}
          </div>
        </motion.div>
    </div>
  );
}
