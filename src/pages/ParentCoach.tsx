import { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Heart, User, ArrowLeft, AlertTriangle } from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
  isSafeguarding?: boolean;
};

const PROMPT_STARTERS = [
  { text: "What do my child's assessment results mean?", icon: "📊" },
  { text: "How can I support without adding pressure?", icon: "💛" },
  { text: "What are the different pathways after school?", icon: "🛤️" },
  { text: "How do I talk to my child about careers?", icon: "💬" },
  { text: "My child seems unsure about their future", icon: "🤔" },
];

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/parent-coach`;

export default function ParentCoach() {
  const { user, session } = useAuth();

  const { data: studentContext } = useQuery({
    queryKey: ["parent-student-context", user?.id],
    queryFn: async () => {
      try {
        // Get linked student
        let studentIdToUse = localStorage.getItem("parent_selected_student_id");
        
        if (!studentIdToUse) {
          const { data: link, error: lErr } = await supabase
            .from("parent_students")
            .select("student_id")
            .eq("parent_id", user!.id)
            .limit(1)
            .maybeSingle();
          if (lErr) throw lErr;
          if (link) studentIdToUse = link.student_id;
        }
        
        if (!studentIdToUse) return null;

        // Get student profile + latest assessment in parallel
        const [profResp, assResp] = await Promise.all([
          supabase.from("profiles").select("full_name, grade").eq("id", studentIdToUse).single(),
          supabase
            .from("assessments")
            .select("results, completed_at")
            .eq("user_id", studentIdToUse)
            .not("completed_at", "is", null)
            .order("completed_at", { ascending: false })
            .limit(1)
            .maybeSingle(),
        ]);

        if (profResp.error) throw profResp.error;
        if (assResp.error) throw assResp.error;

        const profile = profResp.data;
        const assessment = assResp.data;

        let normalizedResults: { category: string; pct: number }[] = [];
        const rawResults = assessment?.results;
        if (Array.isArray(rawResults)) {
          normalizedResults = rawResults.map((r: any) => ({ category: String(r?.category || ""), pct: Number(r?.pct || 0) }));
        } else if (rawResults && typeof rawResults === "object") {
          normalizedResults = Object.entries(rawResults).map(([k, v]) => ({ category: k, pct: Number(v) }));
        }

        return {
          studentName: profile?.full_name || "Your child",
          grade: profile?.grade || null,
          results: normalizedResults,
        };
      } catch (err) {
        throw err;
      }
    },
    enabled: !!user?.id,
  });

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [searchParams, setSearchParams] = useSearchParams();

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim() || isLoading) return;

    const userMsg: Message = {
      id: Math.random().toString(36).substring(2, 15),
      role: "user",
      content: text.trim(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    // Rate Limit Check
    try {
      const { data: canProceed, error: limitError } = await supabase.rpc("check_and_increment_ai_usage", {
        _user_id: user!.id,
        _daily_limit: 15
      });

      if (limitError) {
        // Fallback
      } else if (!canProceed) {
        setMessages((prev) => [
          ...prev,
          { id: Math.random().toString(36).substring(2, 15), role: "assistant", content: "Daily AI limit reached. Please try again tomorrow." },
        ]);
        setIsLoading(false);
        return;
      }
    } catch (err) {
      // Usage check bypassed due to error
    }

    const history = [...messages, userMsg].map((m) => ({
      role: m.role,
      content: m.content,
    }));

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000);

      const resp = await fetch(CHAT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify({
          messages: history,
          studentContext: studentContext ?? undefined,
        }),
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      const contentType = resp.headers.get("content-type") || "";
      if (contentType.includes("application/json")) {
        const data = await resp.json();
        if (data.safeguarding) {
          setMessages((prev) => [
            ...prev,
            { id: Math.random().toString(36).substring(2, 15), role: "assistant", content: data.content, isSafeguarding: true },
          ]);
        } else if (data.error) {
          throw new Error(data.error);
        }
        setIsLoading(false);
        return;
      }

      if (!resp.ok) {
        const text = await resp.text();
        throw new Error(`Service unavailable (${resp.status}): ${text.slice(0, 50)}`);
      }
      
      if (!resp.body) throw new Error("No response body received");

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let assistantContent = "";
      const assistantId = Math.random().toString(36).substring(2, 15);

      setMessages((prev) => [...prev, { id: assistantId, role: "assistant", content: "" }]);

      let streamDone = false;
      while (!streamDone) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = buffer.indexOf("\n")) !== -1) {
          const line = buffer.slice(0, newlineIndex).trim();
          buffer = buffer.slice(newlineIndex + 1);
          if (!line || line === ":" || line === "keep-alive") continue;
          if (!line.startsWith("data: ")) continue;
          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") { streamDone = true; break; }
          try {
            const parsed = JSON.parse(jsonStr);
            const delta = parsed.choices?.[0]?.delta?.content;
            if (delta) {
              assistantContent += delta;
              const snapshot = assistantContent;
              setMessages((prev) => prev.map((m) => m.id === assistantId ? { ...m, content: snapshot } : m));
            }
          } catch (e) {
            buffer = line + "\n" + buffer;
            break;
          }
        }
      }

      if (buffer.trim()) {
        for (let raw of buffer.split("\n")) {
          if (!raw) continue;
          if (raw.endsWith("\r")) raw = raw.slice(0, -1);
          if (!raw.startsWith("data: ")) continue;
          const jsonStr = raw.slice(6).trim();
          if (jsonStr === "[DONE]") continue;
          try {
            const parsed = JSON.parse(jsonStr);
            const delta = parsed.choices?.[0]?.delta?.content;
            if (delta) {
              assistantContent += delta;
              const snapshot = assistantContent;
              setMessages((prev) => prev.map((m) => m.id === assistantId ? { ...m, content: snapshot } : m));
            }
          } catch {}
        }
      }
    } catch (err) {
      console.error("Chat error:", err);
      setMessages((prev) => [
        ...prev,
        { id: Math.random().toString(36).substring(2, 15), role: "assistant", content: "Sorry, I couldn't connect right now. Please try again in a moment. 😊" },
      ]);
    } finally {
      setIsLoading(false);
    }
  }, [messages, isLoading, session, user, studentContext]);

  useEffect(() => {
    const prompt = searchParams.get("prompt");
    if (prompt && !isLoading && messages.length === 0) {
      sendMessage(prompt);
      setSearchParams(new URLSearchParams());
    }
  }, [searchParams, sendMessage, isLoading, messages.length, setSearchParams]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  const showWelcome = messages.length === 0;

  return (
    <div className="flex-1 flex flex-col">
        <div className="py-3">
          <Link
            to="/parent"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to dashboard
          </Link>
        </div>

        <div className="flex-1 flex flex-col min-h-0">
          <ScrollArea className="flex-1" ref={scrollRef}>
            <div className="py-4 space-y-4">
              {showWelcome && (
                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center py-12 space-y-6"
                >
                  <div className="w-16 h-16 rounded-2xl bg-rose-100 flex items-center justify-center mx-auto">
                    <Heart className="w-8 h-8 text-rose-500" />
                  </div>
                  <div>
                    <h1 className="text-xl font-heading font-bold text-foreground mb-2">
                      Parent Support Assistant 👋
                    </h1>
                    <p className="text-muted-foreground text-sm max-w-md mx-auto">
                      I'm here to help you understand your child's career exploration journey,
                      interpret their assessment results, and find ways to support them — without the pressure.
                    </p>
                    <p className="text-xs text-muted-foreground/60 mt-2">
                      I'm an AI assistant — for personal or family concerns, please reach out to the school counselor.
                    </p>
                  </div>

                  <div className="flex flex-wrap justify-center gap-2 max-w-lg mx-auto">
                    {PROMPT_STARTERS.map((p) => (
                      <button
                        key={p.text}
                        onClick={() => sendMessage(p.text)}
                        className="text-sm px-4 py-2.5 rounded-xl border border-border bg-card hover:bg-muted transition-colors text-foreground text-left"
                      >
                        <span className="mr-1.5">{p.icon}</span>
                        {p.text}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}

              <AnimatePresence initial={false}>
                {messages.map((msg) => (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                    className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    {msg.role === "assistant" && (
                      <Avatar className="w-8 h-8 mt-0.5 flex-shrink-0">
                        <AvatarFallback className="bg-rose-100 text-rose-500 text-xs">
                          <Heart className="w-4 h-4" />
                        </AvatarFallback>
                      </Avatar>
                    )}

                    <div
                      className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                        msg.role === "user"
                          ? "bg-primary text-primary-foreground rounded-br-md"
                          : msg.isSafeguarding
                          ? "bg-destructive/10 border border-destructive/20 text-foreground rounded-bl-md"
                          : "bg-muted text-foreground rounded-bl-md"
                      }`}
                    >
                      {msg.isSafeguarding && (
                        <div className="flex items-center gap-1.5 mb-2 text-destructive font-medium text-xs">
                          <AlertTriangle className="w-3.5 h-3.5" />
                          Important — please read carefully
                        </div>
                      )}
                      <div className="prose prose-sm max-w-none dark:prose-invert [&>p]:mb-2 [&>p:last-child]:mb-0">
                        <ReactMarkdown>{msg.content}</ReactMarkdown>
                      </div>
                    </div>

                    {msg.role === "user" && (
                      <Avatar className="w-8 h-8 mt-0.5 flex-shrink-0">
                        <AvatarFallback className="bg-secondary/20 text-secondary text-xs">
                          <User className="w-4 h-4" />
                        </AvatarFallback>
                      </Avatar>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>

              {isLoading && messages[messages.length - 1]?.role === "user" && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-3 items-start">
                  <Avatar className="w-8 h-8 flex-shrink-0">
                    <AvatarFallback className="bg-rose-100 text-rose-500 text-xs">
                      <Heart className="w-4 h-4" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="bg-muted rounded-2xl rounded-bl-md px-4 py-3">
                    <div className="flex gap-1">
                      <span className="w-2 h-2 bg-muted-foreground/40 rounded-full animate-bounce [animation-delay:0ms]" />
                      <span className="w-2 h-2 bg-muted-foreground/40 rounded-full animate-bounce [animation-delay:150ms]" />
                      <span className="w-2 h-2 bg-muted-foreground/40 rounded-full animate-bounce [animation-delay:300ms]" />
                    </div>
                  </div>
                </motion.div>
              )}
            </div>
          </ScrollArea>

          <div className="border-t border-border bg-background py-4">
            <div className="flex gap-2 items-end">
              <Textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask about your child's results, how to support them, or career pathways…"
                className="min-h-[44px] max-h-[120px] resize-none rounded-xl border-border bg-muted/50"
                rows={1}
                disabled={isLoading}
              />
              <Button
                size="icon"
                onClick={() => sendMessage(input)}
                disabled={!input.trim() || isLoading}
                className="rounded-xl h-[44px] w-[44px] flex-shrink-0"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
            <p className="text-[11px] text-muted-foreground/50 mt-2 text-center">
              AI Parent Assistant provides general guidance only — not professional parenting or counseling advice.
            </p>
          </div>
        </div>
    </div>
  );
}
