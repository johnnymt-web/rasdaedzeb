import { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Sparkles, User, ArrowLeft, AlertTriangle } from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import rehypeSanitize from "rehype-sanitize";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { getGradeBand, getBandMessaging } from "@/utils/gradeBands";
import { useTranslation } from "react-i18next";

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
  isSafeguarding?: boolean;
};

const PROMPT_STARTERS_KEYS = [
  { key: "coach.prompt_1", icon: "🧭" },
  { key: "coach.prompt_2", icon: "💪" },
  { key: "coach.prompt_3", icon: "📚" },
  { key: "coach.prompt_4", icon: "🌍" },
  { key: "coach.prompt_5", icon: "🛤️" },
];

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/career-coach`;

export default function StudentCoach() {
  const { profile, session, user } = useAuth();
  const { t, i18n } = useTranslation();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const hasAutoSent = useRef(false);

  // Dynamic system context for the coach
  const band = getGradeBand(profile?.grade);
  const messaging = getBandMessaging(band);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Auto-send prompt from URL query param (e.g. from dashboard quick buttons)
  useEffect(() => {
    const prompt = searchParams.get("prompt");
    if (prompt && !hasAutoSent.current && messages.length === 0) {
      hasAutoSent.current = true;
      const newParams = new URLSearchParams(searchParams);
      newParams.delete("prompt");
      setSearchParams(newParams, { replace: true });
      setTimeout(() => sendMessage(prompt), 100);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const lastSentRef = useRef<number>(0);

  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim() || isLoading) return;

    if (!user || !session) {
      return;
    }

    // Client-side rate limiting: 1 message per 2 seconds
    const now = Date.now();
    if (now - lastSentRef.current < 2000) {
      return;
    }
    lastSentRef.current = now;

    const userMsg: Message = {
      id: Math.random().toString(36).substring(2, 15),
      role: "user",
      content: text.trim(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    // Only send user and assistant messages — system prompt is handled server-side
    // 1. Rate Limit Check (Pre-boarding/Safety)
    try {
      const { data: canProceed, error: limitError } = await supabase.rpc("check_and_increment_ai_usage", {
        _user_id: user!.id,
        _daily_limit: 20 // Standard limit
      });

      if (limitError) {
        // Fallback
      } else if (!canProceed) {
        setMessages((prev) => [
          ...prev,
          { 
            id: Math.random().toString(36).substring(2, 15), 
            role: "assistant", 
            content: t("coach.rate_limit")
          },
        ]);
        setIsLoading(false);
        return;
      }
    } catch (err) {
      // Usage check bypassed
    }

    const history = [...messages, userMsg].map((m) => ({
      role: m.role,
      content: m.content,
    }));

    try {
      console.log("Attempting Edge Function call...");
      const { data, error: invokeError } = await supabase.functions.invoke('career-coach', {
        body: { messages: history }
      });

      if (!invokeError && data?.content) {
        setMessages((prev) => [
          ...prev,
          { id: Math.random().toString(36).substring(2, 15), role: "assistant", content: data.content }
        ]);
        setIsLoading(false);
        return;
      }

      console.warn("Edge Function failed or returned no content, trying direct fallback...");
      
      const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
      if (!apiKey) throw new Error("No API key configured");

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            { 
              role: 'system', 
              content: `You are the Pathfinder Career Coach — a warm, supportive, and encouraging AI assistant that helps students explore careers, interests, and school subjects. 
              IMPORTANT: Always respond in the language the user is speaking in. The user's current interface language is ${i18n.language === 'ka' ? 'Georgian (ka)' : 'English (en)'}.` 
            },
            ...history
          ],
        })
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error?.message || `OpenAI API Error ${response.status}`);
      }

      const aiData = await response.json();
      const content = aiData.choices[0].message.content;

      setMessages((prev) => [
        ...prev,
        { id: Math.random().toString(36).substring(2, 15), role: "assistant", content }
      ]);

    } catch (err: any) {
      console.error("AI Coach final failure:", err);
      setMessages((prev) => [
        ...prev,
        {
          id: Math.random().toString(36).substring(2, 15),
          role: "assistant",
          content: `${t("coach.error")} (${err.message || 'Connection Error'})`,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  }, [messages, isLoading, user, session]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  const showWelcome = messages.length === 0;

  return (
    <div className="flex-1 flex flex-col">
      <main className="flex-1 flex flex-col w-full">
        {/* Back link */}
        <div className="py-3">
          <Link
            to="/student"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            {t("coach.back")}
          </Link>
        </div>

        {/* Chat area */}
        <div className="flex-1 flex flex-col min-h-0">
          <ScrollArea className="flex-1" ref={scrollRef}>
            <div className="py-4 space-y-4">
              {showWelcome && (
                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center py-12 space-y-6"
                >
                  <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto">
                    <Sparkles className="w-8 h-8 text-primary" />
                  </div>
                  <div>
                    <h1 className="text-xl font-heading font-bold text-foreground mb-2">
                      {t("coach.welcome_title")}
                    </h1>
                    <p className="text-muted-foreground text-sm max-w-md mx-auto">
                      {t("coach.welcome_desc")}
                    </p>
                    <p className="text-xs text-muted-foreground/60 mt-2">
                      {t("coach.welcome_disclaimer")}
                    </p>
                  </div>

                  <div className="flex flex-wrap justify-center gap-2 max-w-lg mx-auto">
                    {PROMPT_STARTERS_KEYS.map((p) => (
                      <button
                        key={p.key}
                        onClick={() => sendMessage(t(p.key))}
                        className="text-sm px-4 py-2.5 rounded-xl border border-border bg-card hover:bg-muted transition-colors text-foreground text-left"
                      >
                        <span className="mr-1.5">{p.icon}</span>
                        {t(p.key)}
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
                    className={`flex gap-3 ${
                      msg.role === "user" ? "justify-end" : "justify-start"
                    }`}
                  >
                    {msg.role === "assistant" && (
                      <Avatar className="w-8 h-8 mt-0.5 flex-shrink-0">
                        <AvatarFallback className="bg-primary/10 text-primary text-xs">
                          <Sparkles className="w-4 h-4" />
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
                          {t("coach.safeguarding")}
                        </div>
                      )}
                      <div className="prose prose-sm max-w-none dark:prose-invert [&>p]:mb-2 [&>p:last-child]:mb-0">
                        <ReactMarkdown rehypePlugins={[rehypeSanitize]}>{msg.content}</ReactMarkdown>
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
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex gap-3 items-start"
                >
                  <Avatar className="w-8 h-8 flex-shrink-0">
                    <AvatarFallback className="bg-primary/10 text-primary text-xs">
                      <Sparkles className="w-4 h-4" />
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

          {/* Input area */}
          <div className="border-t border-border bg-background py-4">
            <div className="flex gap-2 items-end">
              <Textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={t("coach.input_placeholder")}
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
              {t("coach.disclaimer")}
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
