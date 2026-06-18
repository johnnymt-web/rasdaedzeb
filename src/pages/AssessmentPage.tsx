import { useMemo, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ChevronRight, ChevronLeft, Sparkles, Briefcase, Loader2 } from "lucide-react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";
import { getGradeBand } from "@/utils/gradeBands";
import { RIASEC_QUESTIONS_BY_GRADE, FALLBACK_RIASEC_QUESTIONS } from "@/data/riasecQuestions";

interface Question {
  id: number;
  text: string;
  category: string;
}

const getSkillsQuestions = (t: any): Question[] => [
  { id: 101, text: t("assessment.skills.questions.101"), category: "Communication" },
  { id: 102, text: t("assessment.skills.questions.102"), category: "Problem Solving" },
  { id: 103, text: t("assessment.skills.questions.103"), category: "Digital Literacy" },
  { id: 104, text: t("assessment.skills.questions.104"), category: "Teamwork" },
  { id: 105, text: t("assessment.skills.questions.105"), category: "Adaptability" },
];

const getOptions = (t: any) => [
  { label: t("assessment.options.1"), value: 1 },
  { label: t("assessment.options.2"), value: 2 },
  { label: t("assessment.options.3"), value: 3 },
  { label: t("assessment.options.4"), value: 4 },
  { label: t("assessment.options.5"), value: 5 },
];

export default function AssessmentPage() {
  const { t, i18n } = useTranslation();
  const { type = "riasec" } = useParams<{ type: string }>();
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [showResults, setShowResults] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const { user, profile } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (type !== "riasec" && type !== "skills") {
      navigate("/student/assessment");
    }
  }, [type, navigate]);

  const gradeBand = useMemo(() => {
    if (!profile?.grade) return "discovery";
    return getGradeBand(profile.grade);
  }, [profile]);

  const questions = useMemo(() => {
    if (type === "riasec") {
      const lang = (i18n.language?.startsWith("ka") ? "ka" : "en") as "en" | "ka";
      let bandKey: "discovery" | "exploration" | "planning" = "discovery";
      if (gradeBand === "exploration") bandKey = "exploration";
      else if (gradeBand === "planning" || gradeBand === "transition") bandKey = "planning";

      const bandQs = RIASEC_QUESTIONS_BY_GRADE[bandKey]?.[lang];
      if (bandQs && bandQs.length > 0) {
        return bandQs;
      }
      return FALLBACK_RIASEC_QUESTIONS(t);
    }
    if (type === "skills") return getSkillsQuestions(t);
    return [];
  }, [type, t, gradeBand, i18n.language]);

  const options = useMemo(() => getOptions(t), [t]);

  const results = useMemo(() => {
    if (!questions.length) return [];
    const categories = Array.from(new Set(questions.map(q => q.category)));
    const scores = categories.map((cat) => {
      const catQuestions = questions.filter((q) => q.category === cat);
      const total = catQuestions.reduce((sum, q) => sum + (answers[q.id] || 0), 0);
      const maxPossible = catQuestions.length * 5;
      return { category: cat, pct: Math.round((total / maxPossible) * 100) };
    });
    return scores.sort((a, b) => b.pct - a.pct);
  }, [questions, answers]);

  const handleFinish = async () => {
    if (isSaving) return;
    
    console.log("Finishing assessment. Current answers:", answers);
    setIsSaving(true);
    
    try {
      if (user) {
        // Explicitly convert numeric keys to strings for JSONB stability
        const sanitizedAnswers = Object.entries(answers).reduce((acc, [key, val]) => {
          acc[key] = val;
          return acc;
        }, {} as Record<string, number>);

        console.log("Attempting to sync assessment to cloud...");
        
        // Timeout guard against network/adblock hangs. 45s so a cold-start of the
        // submit-assessment edge function (first call after idle: boot + module
        // fetch can exceed 15s) still completes; warm calls return in ~2s.
        const timeoutPromise = new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error("Timeout")), 45000)
        );

        // Persist via the server-authoritative edge function. The client still
        // computes `results` locally (above) for the instant results screen, but
        // the STORED results are recomputed server-side from the raw answers.
        const syncPromise = (async () => {
          const { data, error } = await supabase.functions.invoke("submit-assessment", {
            body: { assessment_type: type || "riasec", answers: sanitizedAnswers },
          });
          if (error) return error;
          const fnError = (data as { error?: string } | null)?.error;
          return fnError ? new Error(fnError) : null;
        })();

        try {
          const error = await Promise.race([syncPromise, timeoutPromise]);
          if (error) {
            console.error("Supabase sync error:", error);
            toast.error(`Sync failed: ${error.message || "Please check console"}`);
          } else {
            console.log("Assessment synced successfully");
            toast.success("Assessment saved successfully!");
          }
        } catch (raceError: any) {
          if (raceError.message === "Timeout") {
            console.warn("Cloud sync timed out (possibly blocked by an ad-blocker or network issues)");
            toast.error("Could not sync to cloud. Showing results locally.");
          } else {
            throw raceError;
          }
        }
      } else {
        console.warn("No user found during save, showing local results only.");
      }
      
      // Always show results, even if sync failed or timed out
      setShowResults(true);
    } catch (err) {
      console.error("Critical assessment save failure:", err);
      toast.error("An unexpected error occurred. Showing results locally.");
      setShowResults(true);
    } finally {
      setIsSaving(false);
    }
  };

  if (showResults) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb', color: '#111827', padding: '40px 20px', textAlign: 'center', fontFamily: 'sans-serif' }}>
        <div style={{ maxWidth: '600px', margin: '0 auto', background: '#fff', padding: '30px', borderRadius: '24px', border: '1px solid #eee', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
          <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '10px' }}>Discovery Complete!</h1>
          <p style={{ color: '#6b7280', marginBottom: '30px' }}>Here are your top results:</p>

          <div style={{ textAlign: 'left', display: 'grid', gap: '20px' }}>
            {results.slice(0, 3).map((r, i) => (
              <div key={i} style={{ padding: '15px', border: '1px solid #e5e7eb', borderRadius: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ fontWeight: 'bold' }}>{r.category}</span>
                  <span style={{ fontWeight: 'bold', color: '#7c3aed' }}>{r.pct}%</span>
                </div>
                <div style={{ width: '100%', height: '8px', background: '#f3f4f6', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{ width: `${r.pct}%`, height: '100%', background: '#7c3aed' }}></div>
                </div>
              </div>
            ))}
          </div>

          <div style={{ marginTop: '40px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <button 
              onClick={() => window.location.href = "/student/report"}
              style={{ padding: '14px', background: '#7c3aed', color: '#fff', border: 'none', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer' }}
            >
              View Full Detailed Report
            </button>
            <button 
              onClick={() => window.location.href = "/student/assessment"}
              style={{ padding: '14px', background: 'transparent', color: '#6b7280', border: 'none', cursor: 'pointer' }}
            >
              Back to Assessment Hub
            </button>
          </div>
        </div>
      </div>
    );
  }

  const question = questions[currentQ];
  const progress = questions.length > 0 ? (Object.keys(answers).length / questions.length) * 100 : 0;

  return (
    <div className="space-y-8">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
          <div className="mb-8">
            <div className="flex justify-between text-xs font-semibold uppercase mb-3 text-muted-foreground">
              <span>Question {currentQ + 1} / {questions.length}</span>
            </div>
            <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
              <div className="h-full bg-primary transition-all duration-300" style={{ width: `${progress}%` }}></div>
            </div>
          </div>

          <AnimatePresence mode="wait">
            <motion.div 
              key={currentQ} 
              initial={{ opacity: 0, x: 20 }} 
              animate={{ opacity: 1, x: 0 }} 
              exit={{ opacity: 0, x: -20 }}
              className="card-warm p-10 bg-card border border-border rounded-3xl shadow-lg mb-8"
            >
              <h2 className="text-2xl font-heading font-bold mb-10 leading-tight">"{question?.text}"</h2>
              <div className="space-y-3">
                {options.map((opt) => (
                  <button 
                    key={opt.value} 
                    onClick={() => setAnswers({ ...answers, [question.id]: opt.value })}
                    className={`w-full p-4 rounded-xl border-2 text-left text-sm font-medium transition-all ${
                      answers[question.id] === opt.value ? "border-primary bg-primary/5 text-primary shadow-inner" : "border-border bg-background"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </motion.div>
          </AnimatePresence>

          <div className="flex justify-between">
            <Button variant="ghost" onClick={() => setCurrentQ(Math.max(0, currentQ - 1))} disabled={currentQ === 0}>
              <ChevronLeft className="w-4 h-4 mr-2" /> Previous
            </Button>
            <Button 
              onClick={() => currentQ === questions.length - 1 ? handleFinish() : setCurrentQ(currentQ + 1)} 
              disabled={!answers[question?.id] || isSaving}
            >
              {isSaving ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving...</>
              ) : (
                currentQ === questions.length - 1 ? "Complete Discovery" : "Next Question"
              )}
              {!isSaving && <ChevronRight className="w-4 h-4 ml-2" />}
            </Button>
          </div>
        </motion.div>
    </div>
  );
}
