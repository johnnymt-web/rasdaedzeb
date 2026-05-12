import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Compass, ChevronLeft, ChevronRight, Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { calculateCaasScores, saveCaasAssessment } from "@/services/assessmentService";
import { useToast } from "@/hooks/use-toast";

// CAAS-International: 24 items, 6 per subscale
const CAAS_ITEMS = [
  // Concern (thinking about your future)
  { id: "q1", text: "Thinking about what my future will be like.", subscale: "concern" },
  { id: "q2", text: "Realizing that today's choices shape my future.", subscale: "concern" },
  { id: "q3", text: "Preparing for the future.", subscale: "concern" },
  { id: "q4", text: "Becoming aware of the educational and career choices I must make.", subscale: "concern" },
  { id: "q5", text: "Planning how to achieve my goals.", subscale: "concern" },
  { id: "q6", text: "Concerned about my career.", subscale: "concern" },
  // Control (taking ownership of your career)
  { id: "q7", text: "Keeping upbeat.", subscale: "control" },
  { id: "q8", text: "Making decisions by myself.", subscale: "control" },
  { id: "q9", text: "Taking responsibility for my actions.", subscale: "control" },
  { id: "q10", text: "Sticking up for my beliefs.", subscale: "control" },
  { id: "q11", text: "Counting on myself.", subscale: "control" },
  { id: "q12", text: "Doing what's right for me.", subscale: "control" },
  // Curiosity (exploring your options)
  { id: "q13", text: "Exploring my surroundings.", subscale: "curiosity" },
  { id: "q14", text: "Looking for opportunities to grow as a person.", subscale: "curiosity" },
  { id: "q15", text: "Investigating options before making a choice.", subscale: "curiosity" },
  { id: "q16", text: "Observing different ways of doing things.", subscale: "curiosity" },
  { id: "q17", text: "Probing deeply into questions I have.", subscale: "curiosity" },
  { id: "q18", text: "Becoming curious about new opportunities.", subscale: "curiosity" },
  // Confidence (believing in your abilities)
  { id: "q19", text: "Performing tasks efficiently.", subscale: "confidence" },
  { id: "q20", text: "Taking care to do things well.", subscale: "confidence" },
  { id: "q21", text: "Learning new skills.", subscale: "confidence" },
  { id: "q22", text: "Working up to my ability.", subscale: "confidence" },
  { id: "q23", text: "Overcoming obstacles.", subscale: "confidence" },
  { id: "q24", text: "Solving problems.", subscale: "confidence" },
];

const STRENGTH_OPTIONS = [
  { value: 1, label: "Not Strong" },
  { value: 2, label: "Somewhat Strong" },
  { value: 3, label: "Strong" },
  { value: 4, label: "Very Strong" },
  { value: 5, label: "Strongest" },
];

const SUBSCALE_INFO: Record<string, { label: string; color: string; emoji: string }> = {
  concern: { label: "Concern", color: "text-blue-500", emoji: "🎯" },
  control: { label: "Control", color: "text-emerald-500", emoji: "🛡️" },
  curiosity: { label: "Curiosity", color: "text-amber-500", emoji: "🔍" },
  confidence: { label: "Confidence", color: "text-rose-500", emoji: "💪" },
};

const ITEMS_PER_PAGE = 6;

export default function CaasAssessment() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [responses, setResponses] = useState<Record<string, number>>({});
  const [currentPage, setCurrentPage] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [startTime] = useState(Date.now());

  const totalPages = Math.ceil(CAAS_ITEMS.length / ITEMS_PER_PAGE);
  const currentItems = CAAS_ITEMS.slice(
    currentPage * ITEMS_PER_PAGE,
    (currentPage + 1) * ITEMS_PER_PAGE
  );
  const progress = (Object.keys(responses).length / CAAS_ITEMS.length) * 100;
  const allAnswered = Object.keys(responses).length === CAAS_ITEMS.length;
  const pageComplete = currentItems.every((item) => responses[item.id] !== undefined);

  const currentSubscale = currentItems[0]?.subscale;
  const subscaleInfo = SUBSCALE_INFO[currentSubscale] || { label: "", color: "", emoji: "" };

  const handleResponse = (itemId: string, value: number) => {
    setResponses((prev) => ({ ...prev, [itemId]: value }));
  };

  const handleSubmit = async () => {
    if (!user || !allAnswered) return;
    setSubmitting(true);
    try {
      await saveCaasAssessment(user.id, responses);
      toast({ title: "Assessment Complete!", description: "Your Career Adaptability profile has been saved." });
      navigate("/student/report");
    } catch (err) {
      toast({ title: "Error", description: "Failed to save assessment. Please try again.", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
          {/* Header */}
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
              <Compass className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-2xl font-heading font-bold">Career Adaptability</h1>
              <p className="text-sm text-muted-foreground">CAAS — Career Adapt-Abilities Scale</p>
            </div>
          </div>

          <p className="text-sm text-muted-foreground mt-3 mb-6 leading-relaxed">
            Rate how strongly you have developed each of the following abilities. 
            There are no right or wrong answers — focus on how you see yourself today.
          </p>

          {/* Progress */}
          <div className="mb-6">
            <div className="flex justify-between text-xs text-muted-foreground mb-1.5">
              <span>{Object.keys(responses).length} of {CAAS_ITEMS.length} answered</span>
              <span className={`font-semibold ${subscaleInfo.color}`}>
                {subscaleInfo.emoji} {subscaleInfo.label}
              </span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full"
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
              className="space-y-4"
            >
              {currentItems.map((item, idx) => (
                <div
                  key={item.id}
                  className={`p-5 rounded-xl border transition-all duration-200 ${
                    responses[item.id] !== undefined
                      ? "border-emerald-500/30 bg-emerald-500/5"
                      : "border-border bg-card"
                  }`}
                >
                  <p className="text-sm font-medium text-foreground mb-3">
                    <span className="text-muted-foreground mr-2">
                      {currentPage * ITEMS_PER_PAGE + idx + 1}.
                    </span>
                    {item.text}
                  </p>
                  <div className="flex gap-2">
                    {STRENGTH_OPTIONS.map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => handleResponse(item.id, opt.value)}
                        className={`flex-1 py-2 px-1 rounded-lg text-[11px] font-medium border transition-all ${
                          responses[item.id] === opt.value
                            ? "bg-emerald-500 text-white border-emerald-500 shadow-md scale-105"
                            : "bg-muted/50 text-muted-foreground border-transparent hover:border-emerald-500/30 hover:bg-emerald-500/10"
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
              <ChevronLeft className="w-4 h-4" /> Previous
            </Button>

            {currentPage < totalPages - 1 ? (
              <Button
                onClick={() => setCurrentPage((p) => p + 1)}
                disabled={!pageComplete}
                className="gap-1.5 bg-emerald-600 hover:bg-emerald-700"
              >
                Next <ChevronRight className="w-4 h-4" />
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={!allAnswered || submitting}
                className="gap-1.5 bg-emerald-600 hover:bg-emerald-700"
              >
                {submitting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Check className="w-4 h-4" />
                )}
                Submit Assessment
              </Button>
            )}
          </div>
        </motion.div>
    </div>
  );
}
