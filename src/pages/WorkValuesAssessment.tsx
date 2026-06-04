import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { 
  ArrowLeft, ArrowRight, CheckCircle2, 
  Target, Award, Heart, Shield, Layers, Zap
} from "lucide-react";

const QUESTIONS = [
  { id: 1, text: "I want a job where I can use my best abilities.", category: "achievement" },
  { id: 2, text: "I want a job where I can see the results of my work.", category: "achievement" },
  { id: 3, text: "I want a job where I can get a feeling of accomplishment.", category: "achievement" },
  { id: 4, text: "I want a job where I can try out my own ideas.", category: "independence" },
  { id: 5, text: "I want a job where I can make decisions on my own.", category: "independence" },
  { id: 6, text: "I want a job where I can plan my work with little supervision.", category: "independence" },
  { id: 7, text: "I want a job where I can move up to better positions.", category: "recognition" },
  { id: 8, text: "I want a job where I can be a leader.", category: "recognition" },
  { id: 9, text: "I want a job where I can be 'somebody' in the community.", category: "recognition" },
  { id: 10, text: "I want a job where I can do things for other people.", category: "relationships" },
  { id: 11, text: "I want a job where I can work with people I like.", category: "relationships" },
  { id: 12, text: "I want a job where I have good co-workers.", category: "relationships" },
  { id: 13, text: "I want a job where I can work without being forced to do things that are against my sense of right and wrong.", category: "relationships" },
  { id: 14, text: "I want a job where the company treats its workers fairly.", category: "support" },
  { id: 15, text: "I want a job where my boss provides clear guidance.", category: "support" },
  { id: 16, text: "I want a job where my boss backs up the workers.", category: "support" },
  { id: 17, text: "I want a job where I have steady work and pay.", category: "working_conditions" },
  { id: 18, text: "I want a job where I can stay busy all the time.", category: "working_conditions" },
  { id: 19, text: "I want a job where I have good equipment and a comfortable place to work.", category: "working_conditions" },
  { id: 20, text: "I want a job where I can do many different things.", category: "working_conditions" },
];

const CATEGORIES = [
  { key: "achievement", label: "Achievement", icon: Target, color: "bg-blue-500", text: "Using your abilities and seeing results." },
  { key: "independence", label: "Independence", icon: Zap, color: "bg-amber-500", text: "Making decisions and working on your own." },
  { key: "recognition", label: "Recognition", icon: Award, color: "bg-violet-500", text: "Advancement and prestige in your career." },
  { key: "relationships", label: "Relationships", icon: Heart, color: "bg-rose-500", text: "Working with others and helping people." },
  { key: "support", label: "Support", icon: Shield, color: "bg-emerald-500", text: "Management that stands behind employees." },
  { key: "working_conditions", label: "Working Conditions", icon: Layers, color: "bg-slate-500", text: "Security and good physical environment." },
];

export default function WorkValuesAssessment() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();

  const rawGrade = profile?.grade || user?.user_metadata?.grade || "7";
  const numericGrade = parseInt(rawGrade.toString().replace(/\D/g, "")) || 7;

  useEffect(() => {
    if (numericGrade < 9) {
      toast.error("This assessment is recommended for grades 9 and above.");
      navigate("/student/assessment");
    }
  }, [numericGrade, navigate]);
  const [currentStep, setCurrentStep] = useState(0); // -1: intro, 0-19: questions, 20: results
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const progress = (Object.keys(answers).length / QUESTIONS.length) * 100;

  const handleAnswer = (value: number) => {
    const newAnswers = { ...answers, [QUESTIONS[currentStep].id]: value };
    setAnswers(newAnswers);
    
    if (currentStep < QUESTIONS.length - 1) {
      setTimeout(() => setCurrentStep(currentStep + 1), 200);
    } else {
      submitAssessment(newAnswers);
    }
  };

  const submitAssessment = async (finalAnswers: Record<number, number>) => {
    if (!user?.id) {
      toast.error("You must be logged in to save results.");
      return;
    }

    setIsSubmitting(true);
    try {
      // Calculate scores (1-5 averages per category)
      const scores: Record<string, number> = {};
      CATEGORIES.forEach(cat => {
        const catQuestions = QUESTIONS.filter(q => q.category === cat.key);
        const total = catQuestions.reduce((sum, q) => sum + (finalAnswers[q.id] || 0), 0);
        scores[cat.key] = total / catQuestions.length;
      });

      const { error } = await supabase.from("work_values_assessments").insert({
        student_id: user.id,
        item_responses: finalAnswers,
        achievement: scores.achievement,
        independence: scores.independence,
        recognition: scores.recognition,
        relationships: scores.relationships,
        support: scores.support,
        working_conditions: scores.working_conditions,
      });

      if (error) throw error;
      setCurrentStep(QUESTIONS.length); // Show results
      toast.success("Assessment completed!");
    } catch (err: any) {
      console.error("Work values save failed:", err);
      toast.error("Cloud sync failed, but showing results locally.");
      setCurrentStep(QUESTIONS.length); // Show results anyway
    } finally {
      setIsSubmitting(false);
    }
  };

  if (currentStep === QUESTIONS.length) {
    return (
      <div className="space-y-8">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
            <div className="text-center mb-12">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 className="w-10 h-10 text-green-600" />
              </div>
              <h1 className="text-3xl md:text-4xl font-heading font-bold mb-4">Your Work Values are Ready</h1>
              <p className="text-muted-foreground text-lg">
                Understanding what motivates you is key to finding a career you'll love.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6 mb-12">
              {CATEGORIES.map((cat, i) => {
                const catQuestions = QUESTIONS.filter(q => q.category === cat.key);
                const score = catQuestions.reduce((sum, q) => sum + (answers[q.id] || 0), 0) / catQuestions.length;
                
                return (
                  <motion.div 
                    key={cat.key}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="card-warm p-6 flex items-start gap-4"
                  >
                    <div className={`w-12 h-12 rounded-2xl ${cat.color}/10 flex items-center justify-center flex-shrink-0`}>
                      <cat.icon className={`w-6 h-6 ${cat.color.replace('bg-', 'text-')}`} />
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-center mb-1">
                        <h3 className="font-heading font-bold text-foreground">{cat.label}</h3>
                        <span className="text-lg font-heading font-bold">{score.toFixed(1)}</span>
                      </div>
                      <p className="text-xs text-muted-foreground mb-3">{cat.text}</p>
                      <Progress value={(score / 5) * 100} className="h-1.5" />
                    </div>
                  </motion.div>
                );
              })}
            </div>

            <div className="flex flex-col md:flex-row gap-4 justify-center">
              <Button size="lg" className="rounded-full px-8" onClick={() => navigate("/student/explore")}>
                Explore Careers Matching My Values
              </Button>
              <Button size="lg" variant="outline" className="rounded-full px-8" onClick={() => navigate("/student")}>
                Return to Dashboard
              </Button>
            </div>
          </motion.div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
        <div className="mb-8 flex items-center justify-between">
          <Button variant="ghost" size="sm" onClick={() => navigate("/student/assessment")}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div className="flex-1 max-w-xs mx-8">
            <Progress value={progress} className="h-2" />
            <div className="flex justify-between mt-2">
              <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">
                Question {currentStep + 1} of {QUESTIONS.length}
              </span>
              <span className="text-[10px] text-muted-foreground font-bold">{Math.round(progress)}%</span>
            </div>
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="card-warm p-8 md:p-12 text-center shadow-xl border-primary/10"
          >
            <div className="mb-8">
              <h2 className="text-2xl md:text-3xl font-heading font-bold leading-tight text-foreground">
                {QUESTIONS[currentStep].text}
              </h2>
            </div>

            <div className="grid grid-cols-1 gap-3 max-w-md mx-auto">
              {[
                { label: "Extremely Important", val: 5 },
                { label: "Very Important", val: 4 },
                { label: "Important", val: 3 },
                { label: "Somewhat Important", val: 2 },
                { label: "Not Important", val: 1 },
              ].map((opt) => (
                <Button
                  key={opt.val}
                  variant={answers[QUESTIONS[currentStep].id] === opt.val ? "default" : "outline"}
                  className="h-14 rounded-2xl text-lg font-medium transition-all hover:scale-[1.02] active:scale-[0.98]"
                  onClick={() => handleAnswer(opt.val)}
                  disabled={isSubmitting}
                >
                  {opt.label}
                </Button>
              ))}
            </div>

            <div className="mt-12 flex items-center justify-between">
              <Button 
                variant="ghost" 
                disabled={currentStep === 0 || isSubmitting}
                onClick={() => setCurrentStep(currentStep - 1)}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Previous
              </Button>
              <div className="flex gap-1">
                {QUESTIONS.map((_, i) => (
                  <div 
                    key={i} 
                    className={`w-1.5 h-1.5 rounded-full ${i === currentStep ? 'bg-primary' : i < currentStep ? 'bg-primary/30' : 'bg-muted'}`} 
                  />
                ))}
              </div>
              <div className="w-24"></div> {/* spacer */}
            </div>
          </motion.div>
        </AnimatePresence>

        <div className="mt-12 text-center text-[10px] text-muted-foreground uppercase tracking-[0.2em] font-bold opacity-50">
          Super RIASEC • Work Importance Profiler
        </div>
    </div>
  );
}
