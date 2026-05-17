import { useState } from "react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Sparkles, Loader2, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";

interface ReflectionPromptProps {
  assessmentId: string;
  topInterest: string;
}

const ReflectionPrompt = ({ assessmentId, topInterest }: ReflectionPromptProps) => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [response, setResponse] = useState("");
  const [isDone, setIsDone] = useState(false);
  
  // Pick a random prompt based on the student's top interest for a personalized touch
  const [prompt] = useState(() => {
    const promptKeys = ["0", "1", "2", "3"];
    const randomKey = promptKeys[Math.floor(Math.random() * promptKeys.length)];
    return t("reflection.prefix", { interest: topInterest }) + t(`reflection.prompts.${randomKey}`);
  });

  const queryKey = ["student-reflections", assessmentId];

  // Check if they already reflected on this assessment
  const { data: existingReflection, isLoading } = useQuery({
    queryKey,
    queryFn: async () => {
      let query = (supabase.from("reflections" as any) as any).select("*").eq("user_id", user!.id);
      
      if (assessmentId && assessmentId !== "latest") {
        query = query.eq("assessment_id", assessmentId);
      } else {
        query = query.is("assessment_id", null);
      }

      const { data, error } = await query.order('created_at', { ascending: false }).limit(1).maybeSingle();
      
      if (error && error.code !== 'PGRST116') throw error; 
      return data;
    },
    enabled: !!user,
  });

  const saveMutation = useMutation({
    mutationFn: async (text: string) => {
      const payload: any = {
        user_id: user!.id,
        prompt: prompt,
        response: text.trim(),
      };
      
      if (assessmentId && assessmentId !== "latest") {
        payload.assessment_id = assessmentId;
      }

      const { error } = await (supabase.from("reflections" as any) as any).insert([payload]);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
      setIsDone(true);
      toast.success(t("reflection.toast_success"));
    },
    onError: () => toast.error(t("reflection.toast_error")),
  });

  if (isLoading) {
    return (
      <div className="flex justify-center p-8">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (existingReflection || isDone) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="card-warm bg-sage/10 border-sage/20 p-6 text-center"
      >
        <div className="w-12 h-12 bg-sage/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 className="w-6 h-6 text-sage" />
        </div>
        <h3 className="font-heading font-semibold text-foreground mb-2">{t("reflection.complete")}</h3>
        <p className="text-sm text-muted-foreground max-w-md mx-auto mb-4">
          {t("reflection.saved_desc")}
        </p>
        {existingReflection && (
          <div className="bg-background/50 rounded-xl p-4 text-left max-w-lg mx-auto">
            <p className="text-xs font-semibold text-muted-foreground mb-1">{t("reflection.your_reflection")}</p>
            <p className="text-sm text-foreground italic">"{existingReflection.response}"</p>
          </div>
        )}
      </motion.div>
    );
  }

  return (
    <div className="card-warm border-primary/20 p-6 md:p-8">
      <div className="flex items-start gap-4 mb-6">
        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
          <Sparkles className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h2 className="font-heading font-semibold text-lg text-foreground mb-1">
            {t("reflection.title")}
          </h2>
          <p className="text-sm text-foreground md:text-base font-medium">
            {prompt}
          </p>
        </div>
      </div>

      <div className="space-y-4">
        <Textarea
          placeholder={t("reflection.placeholder")}
          value={response}
          onChange={(e) => setResponse(e.target.value)}
          rows={4}
          className="resize-none bg-background/50 border-border focus:border-primary/50"
        />
        <div className="flex justify-end">
          <Button 
            onClick={() => saveMutation.mutate(response)}
            disabled={response.trim().length < 10 || saveMutation.isPending}
            className="w-full sm:w-auto"
          >
            {saveMutation.isPending ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : null}
            {t("reflection.save_btn")}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ReflectionPrompt;
