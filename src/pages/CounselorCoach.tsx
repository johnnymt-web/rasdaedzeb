import { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { motion, AnimatePresence } from "framer-motion";
import { Send, BrainCircuit, User, ArrowLeft } from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useTranslation } from "react-i18next";

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
};

const getPromptStarters = (t: any) => [
  { text: t("counselor.copilot.starters.meeting"), icon: "📋" },
  { text: t("counselor.copilot.starters.subjects"), icon: "🎯" },
  { text: t("counselor.copilot.starters.summary"), icon: "✉️" },
  { text: t("counselor.copilot.starters.interventions"), icon: "🔍" },
  { text: t("counselor.copilot.starters.profile"), icon: "📊" },
];

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/counselor-coach`;

export default function CounselorCoach() {
  const { session } = useAuth();
  const { t } = useTranslation();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [searchParams, setSearchParams] = useSearchParams();

  const starters = getPromptStarters(t);

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
        _user_id: session?.user.id || "",
        _daily_limit: 30
      });

      if (limitError) {
        console.warn("Usage RPC failed, allowing proceed:", limitError.message);
      } else if (!canProceed) {
        setMessages((prev) => [
          ...prev,
          { id: Math.random().toString(36).substring(2, 15), role: "assistant", content: t("counselor.copilot.limit_reached") },
        ]);
        setIsLoading(false);
        return;
      }
    } catch (err) {
      console.warn("Usage check bypassed due to error:", err);
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
        body: JSON.stringify({ messages: history }),
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      const contentType = resp.headers.get("content-type") || "";
      if (contentType.includes("application/json")) {
        const data = await resp.json();
        if (data.error) throw new Error(data.error);
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
          } catch { /* ignore */ }
        }
      }
    } catch (err) {
      console.error("Chat error:", err);
      setMessages((prev) => [
        ...prev,
        { id: Math.random().toString(36).substring(2, 15), role: "assistant", content: t("counselor.copilot.error") },
      ]);
    } finally {
      setIsLoading(false);
    }
  }, [messages, isLoading, session, t]);

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
            to="/counselor"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            {t("counselor.back_dashboard")}
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
                  <div className="w-16 h-16 rounded-2xl bg-sky-100 dark:bg-sky-900/30 flex items-center justify-center mx-auto">
                    <BrainCircuit className="w-8 h-8 text-sky-600 dark:text-sky-400" />
                  </div>
                  <div>
                    <h1 className="text-xl font-heading font-bold text-foreground mb-2">
                      {t("counselor.copilot_title")}
                    </h1>
                    <p className="text-muted-foreground text-sm max-w-md mx-auto">
                      {t("counselor.copilot.initial_desc")}
                    </p>
                    <p className="text-xs text-muted-foreground/60 mt-2">
                      {t("counselor.copilot.initial_judgment")}
                    </p>
                  </div>

                  <div className="flex flex-wrap justify-center gap-2 max-w-lg mx-auto">
                    {starters.map((p) => (
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
                        <AvatarFallback className="bg-sky-100 dark:bg-sky-900/30 text-sky-600 dark:text-sky-400 text-xs">
                          <BrainCircuit className="w-4 h-4" />
                        </AvatarFallback>
                      </Avatar>
                    )}

                    <div
                      className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                        msg.role === "user"
                          ? "bg-primary text-primary-foreground rounded-br-md"
                          : "bg-muted text-foreground rounded-bl-md"
                      }`}
                    >
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
                    <AvatarFallback className="bg-sky-100 dark:bg-sky-900/30 text-sky-600 dark:text-sky-400 text-xs">
                      <BrainCircuit className="w-4 h-4" />
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
                placeholder={t("counselor.copilot.placeholder")}
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
              {t("counselor.copilot.disclaimer")}
            </p>
          </div>
        </div>
    </div>
  );
}
