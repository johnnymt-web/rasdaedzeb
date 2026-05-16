import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, BrainCircuit, CheckCircle2, Loader2 } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Progress } from "@/components/ui/progress";

const EQ_QUESTIONS = [
  // Self-Awareness
  { id: "sa1", dimension: "Self-Awareness", text: "I can easily recognize my emotions as I experience them." },
  { id: "sa2", dimension: "Self-Awareness", text: "I know how my feelings affect my performance." },
  { id: "sa3", dimension: "Self-Awareness", text: "I am aware of my personal strengths and limitations." },
  // Self-Management
  { id: "sm1", dimension: "Self-Management", text: "I can stay calm and focused under pressure." },
  { id: "sm2", dimension: "Self-Management", text: "I adapt easily to changes and new situations." },
  { id: "sm3", dimension: "Self-Management", text: "I manage my negative emotions well instead of letting them take over." },
  // Social Awareness
  { id: "soa1", dimension: "Social Awareness", text: "I can usually sense how others are feeling without them telling me." },
  { id: "soa2", dimension: "Social Awareness", text: "I listen attentively and understand others' perspectives." },
  { id: "soa3", dimension: "Social Awareness", text: "I pick up on the emotional climate of a group or room easily." },
  // Relationship Management
  { id: "rm1", dimension: "Relationship Management", text: "I handle conflict with others effectively and respectfully." },
  { id: "rm2", dimension: "Relationship Management", text: "I find it easy to build and maintain relationships." },
  { id: "rm3", dimension: "Relationship Management", text: "I can inspire and guide others when needed." },
];

const LIKERT_OPTIONS = [
  { value: 1, label: "Never" },
  { value: 2, label: "Rarely" },
  { value: 3, label: "Sometimes" },
  { value: 4, label: "Often" },
  { value: 5, label: "Always" },
];

export default function EqAssessment() {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const { user, profile } = useAuth();
  const navigate = useNavigate();

  const rawGrade = profile?.grade || user?.user_metadata?.grade || "7";
  const numericGrade = parseInt(rawGrade.toString().replace(/\D/g, "")) || 7;

  useEffect(() => {
    if (numericGrade < 11) {
      toast.error("This assessment is recommended for grades 11 and above.");
      navigate("/student/assessment");
    }
  }, [numericGrade, navigate]);

  const handleAnswer = (questionId: string, value: number) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
    setTimeout(() => {
      if (currentStep < EQ_QUESTIONS.length - 1) {
        setCurrentStep((prev) => prev + 1);
      }
    }, 300);
  };

  const calculateResults = () => {
    const dimensions = ["Self-Awareness", "Self-Management", "Social Awareness", "Relationship Management"];
    const results: Record<string, number> = {};

    dimensions.forEach(dim => {
      const dimQuestions = EQ_QUESTIONS.filter(q => q.dimension === dim);
      const totalScore = dimQuestions.reduce((sum, q) => sum + (answers[q.id] || 0), 0);
      results[dim] = totalScore / dimQuestions.length; // Average score 1-5
    });

    return results;
  };

  const handleSubmit = async () => {
    if (!user) {
      toast.error("Your session has expired. Please log in again.");
      return;
    }
    
    setIsSubmitting(true);
    console.log("Starting EQ submission for user:", user.id);

    try {
      // Validate session again just in case
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error("No active session found during submission.");
      }

      const calculatedResults = calculateResults();
      const resultsArray = Object.keys(calculatedResults).map(key => ({
        category: key,
        score: calculatedResults[key],
        pct: (calculatedResults[key] / 5) * 100
      }));

      console.log("Calculated results:", resultsArray);

      const { error } = await supabase.from("assessments").insert({
        user_id: user.id,
        assessment_type: "eq",
        answers: answers,
        results: resultsArray,
        completed_at: new Date().toISOString(),
      });

      if (error) {
        console.error("Supabase insert error:", error);
        throw error;
      }

      console.log("EQ submission successful");
      toast.success("Emotional Skills profile saved!");
      
      // Give the UI a moment to show the success state before switching views
      setTimeout(() => {
        setIsComplete(true);
        setIsSubmitting(false);
      }, 500);

    } catch (error: any) {
      console.error("Critical error saving EQ reflection:", error);
      toast.error(error.message || "Failed to save results. Please check your connection.");
      setIsSubmitting(false);
    }
  };

  const progress = (Object.keys(answers).length / EQ_QUESTIONS.length) * 100;
  const currentQuestion = EQ_QUESTIONS[currentStep];

  if (isComplete) {
    return (
      <div className="space-y-8">
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="card-warm p-10 flex flex-col items-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-6">
              <CheckCircle2 className="w-8 h-8 text-blue-600" />
            </div>
            <h1 className="text-3xl font-heading font-bold mb-4">Reflection Complete!</h1>
            <p className="text-muted-foreground mb-8 text-lg">
              Your Emotional Skills profile has been mapped and saved.
            </p>
            <div className="flex gap-4">
              <Button onClick={() => navigate("/student/report")}>View My Report</Button>
              <Button variant="outline" onClick={() => navigate("/student/assessment")}>Back to Hub</Button>
            </div>
          </motion.div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
        <div className="mb-8">
          <Link to="/student/assessment" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-6">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Hub
          </Link>
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-blue-500/10 rounded-xl">
              <BrainCircuit className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl font-heading font-bold">Emotional Skills Reflection</h1>
              <p className="text-sm text-muted-foreground">Self & Social Awareness</p>
            </div>
          </div>
          <Progress value={progress} className="h-2 mb-2" />
          <div className="text-right text-xs text-muted-foreground font-medium">
            Question {currentStep + 1} of {EQ_QUESTIONS.length}
          </div>
        </div>

        <motion.div
          key={currentQuestion.id}
          initial={{ x: 20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          className="card-warm p-8 mb-8"
        >
          <div className="inline-block px-3 py-1 bg-blue-500/10 text-blue-600 text-xs font-semibold rounded-full mb-4">
            {currentQuestion.dimension}
          </div>
          <h2 className="text-xl font-medium mb-8 leading-relaxed">
            {currentQuestion.text}
          </h2>
          
          <div className="space-y-3">
            {LIKERT_OPTIONS.map((option) => {
              const isSelected = answers[currentQuestion.id] === option.value;
              return (
                <button
                  key={option.value}
                  onClick={() => handleAnswer(currentQuestion.id, option.value)}
                  className={`w-full p-4 rounded-xl border-2 text-left transition-all flex items-center justify-between group ${
                    isSelected
                      ? "border-blue-500 bg-blue-500/5 text-blue-700"
                      : "border-border hover:border-blue-300 hover:bg-blue-50"
                  }`}
                >
                  <span className="font-medium">{option.label}</span>
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                    isSelected ? "border-blue-500 bg-blue-500" : "border-muted-foreground/30 group-hover:border-blue-300"
                  }`}>
                    {isSelected && <div className="w-2 h-2 bg-white rounded-full" />}
                  </div>
                </button>
              );
            })}
          </div>
        </motion.div>

        <div className="flex justify-between items-center">
          <Button
            variant="outline"
            onClick={() => setCurrentStep((prev) => Math.max(0, prev - 1))}
            disabled={currentStep === 0 || isSubmitting}
          >
            Previous
          </Button>

          {currentStep === EQ_QUESTIONS.length - 1 ? (
            <Button
              onClick={handleSubmit}
              disabled={Object.keys(answers).length < EQ_QUESTIONS.length || isSubmitting}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {isSubmitting ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving...</>
              ) : (
                <><CheckCircle2 className="w-4 h-4 mr-2" /> Complete Reflection</>
              )}
            </Button>
          ) : (
            <Button
              onClick={() => setCurrentStep((prev) => Math.min(EQ_QUESTIONS.length - 1, prev + 1))}
              disabled={!answers[currentQuestion.id]}
            >
              Next <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          )}
        </div>
    </div>
  );
}
