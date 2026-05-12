import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Sparkles, User, ArrowLeft, BarChart3, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
};

const getPromptStarters = (t: any) => [
  { text: t("admin.insights.starters.health"), icon: "📊" },
  { text: t("admin.insights.starters.outreach"), icon: "📣" },
  { text: t("admin.insights.starters.interests"), icon: "📈" },
  { text: t("admin.insights.starters.engagement"), icon: "👨‍👩‍👧" },
];

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/admin-insights`;

export default function AdminInsights() {
  const { session } = useAuth();
  const { t } = useTranslation();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const starters = getPromptStarters(t);

  // Fetch school metrics context
  const { data: metrics, isLoading: loadingMetrics } = useQuery({
    queryKey: ["admin-insights-metrics"],
    queryFn: async () => {
      const { data: studentRoles } = await supabase.from("user_roles").select("user_id").eq("role", "student");
      const studentIds = (studentRoles || []).map(r => r.user_id);
      
      const { data: assessments } = await supabase
        .from("assessments")
        .select("user_id, completed_at, results, created_at, assessment_type")
        .in("user_id", studentIds);

      const { data: profiles } = await supabase.from("profiles").select("id, grade").in("id", studentIds);
      
      // Calculate basic stats for AI context
      const total = studentIds.length;
      const completed = (assessments || []).filter(a => a.completed_at).length;
      const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;
      
      return { total, completed, completionRate, assessments, profiles };
    }
  });

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return;

    const userMsg: Message = {
      id: Math.random().toString(36).substring(2, 15),
      role: "user",
      content: text.trim(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    const history = [...messages, userMsg].map((m) => ({
      role: m.role,
      content: m.content,
    }));

    // Inject hidden system context if this is the first message
    if (messages.length === 0) {
      // Map metrics to a simpler format to save tokens and avoid leakage
      const simplifiedAssessments = metrics?.assessments?.slice(0, 30).map((a: any) => ({
        type: a.assessment_type,
        date: a.completed_at?.split('T')[0],
        top_category: (a.results as any)?.[0]?.category
      }));

      const contextString = `School Stats Context:
Total Students: ${metrics?.total}
Assessments Completed: ${metrics?.completed}
Overall Completion Rate: ${metrics?.completionRate}%
Data Snapshot (Latest): ${JSON.stringify(simplifiedAssessments)}

IMPORTANT: Please respond in the user's preferred language. The current user interface language is: ${t("common.pathfinder") === "Pathfinder" ? "English" : "Georgian"} (${t("common.pathfinder")}).
`;
      history.unshift({
        role: "user",
        content: `[INTERNAL SYSTEM METRICS - DO NOT DISCLOSE RAW DATA TO USER]\n${contextString}`
      });
    }

    try {
      const resp = await fetch(CHAT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify({ messages: history }),
      });

      if (!resp.ok || !resp.body) throw new Error("Failed to start stream");

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let assistantContent = "";
      const assistantId = Math.random().toString(36).substring(2, 15);

      setMessages((prev) => [...prev, { id: assistantId, role: "assistant", content: "" }]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split("\n");
        
        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const dataStr = line.slice(6).trim();
            if (dataStr === "[DONE]") break;
            try {
              const parsed = JSON.parse(dataStr);
              const delta = parsed.choices?.[0]?.delta?.content;
              if (delta) {
                assistantContent += delta;
                setMessages(prev => prev.map(m => m.id === assistantId ? { ...m, content: assistantContent } : m));
              }
            } catch (e) {}
          }
        }
      }
    } catch (err) {
      console.error("Chat error:", err);
      setMessages((prev) => [...prev, { id: Math.random().toString(36).substring(2, 15), role: "assistant", content: t("admin.insights.error_assistant") }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  return (
    <div className="flex-1 flex flex-col">
        <div className="py-4">
          <Link to="/admin" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-4 h-4" />
            {t("admin.insights.back_dashboard")}
          </Link>
        </div>

        <div className="flex-1 flex flex-col min-h-0 bg-card/30 rounded-2xl border border-border/50 mb-6 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-border bg-muted/30 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <BarChart3 className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h2 className="font-heading font-bold text-foreground">{t("admin.insights.agent_title")}</h2>
                <div className="flex items-center gap-2 text-[10px] text-muted-foreground uppercase font-semibold">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                  {t("admin.insights.live_context")}
                </div>
              </div>
            </div>
          </div>

          <ScrollArea className="flex-1 px-6 py-4" ref={scrollRef}>
            <AnimatePresence initial={false}>
              {messages.length === 0 ? (
                <div className="py-12 flex flex-col items-center text-center space-y-6">
                  <div className="w-16 h-16 rounded-3xl bg-primary/10 flex items-center justify-center">
                    <Sparkles className="w-8 h-8 text-primary" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-heading font-bold text-foreground mb-2">{t("admin.insights.initial_title")}</h1>
                    <p className="text-muted-foreground text-sm max-w-sm mx-auto">
                      {t("admin.insights.initial_desc")}
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-2 max-w-lg w-full">
                    {starters.map((p) => (
                      <button
                        key={p.text}
                        onClick={() => sendMessage(p.text)}
                        className="text-xs px-4 py-3 rounded-xl border border-border bg-background hover:bg-muted transition-colors text-foreground text-left flex items-center gap-2"
                      >
                        <span className="text-lg">{p.icon}</span>
                        {p.text}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="space-y-6 pb-4">
                  {messages.map((msg) => (
                    <div key={msg.id} className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                      {msg.role === "assistant" && (
                        <Avatar className="w-8 h-8 mt-1">
                          <AvatarFallback className="bg-primary/10 text-primary text-xs"><Sparkles className="w-4 h-4" /></AvatarFallback>
                        </Avatar>
                      )}
                      <div className={`max-w-[85%] rounded-2xl px-5 py-3 text-sm leading-relaxed ${
                        msg.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted/50 text-foreground border border-border"
                      }`}>
                        <div className="prose prose-sm dark:prose-invert max-w-none">
                          <ReactMarkdown>{msg.content}</ReactMarkdown>
                        </div>
                      </div>
                      {msg.role === "user" && (
                        <Avatar className="w-8 h-8 mt-1">
                          <AvatarFallback className="bg-muted text-foreground text-xs"><User className="w-4 h-4" /></AvatarFallback>
                        </Avatar>
                      )}
                    </div>
                  ))}
                  {isLoading && messages[messages.length-1].role === 'user' && (
                    <div className="flex gap-3 items-center">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center animate-pulse"><Sparkles className="w-4 h-4 text-primary" /></div>
                      <div className="text-xs text-muted-foreground italic">{t("admin.insights.analyzing")}</div>
                    </div>
                  )}
                </div>
              )}
            </AnimatePresence>
          </ScrollArea>

          <div className="p-4 border-t border-border bg-background">
            <div className="flex gap-2 items-end">
              <Textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={loadingMetrics ? t("admin.insights.loading_data") : t("admin.insights.placeholder")}
                className="min-h-[44px] max-h-[120px] resize-none rounded-xl border-border bg-muted/50"
                rows={1}
                disabled={isLoading || loadingMetrics}
                autoFocus
              />
              <Button
                size="icon"
                onClick={() => sendMessage(input)}
                disabled={!input.trim() || isLoading || loadingMetrics}
                className="rounded-xl h-[44px] w-[44px] shrink-0"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
            <p className="text-[10px] text-muted-foreground mt-2 text-center">
              {t("admin.insights.disclaimer")}
            </p>
          </div>
        </div>
    </div>
  );
}
