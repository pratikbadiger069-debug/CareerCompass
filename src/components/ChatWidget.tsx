import { useState, useEffect, useRef, type FormEvent } from "react";
import { useRouterState } from "@tanstack/react-router";
import { AnimatePresence, motion } from "framer-motion";
import { MessageSquare, X, Send, Bot, User as UserIcon, RefreshCw, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAuth } from "@/hooks/useAuth";
import { usePrefersReducedMotion } from "@/hooks/use-reduced-motion";
import { getWidgetScaleFade, getFadeUp } from "@/lib/motion";
import { supabase } from "@/integrations/supabase/client";
import { sendAdvisorChatMessage } from "@/lib/geminiApi";

export type LocalChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  isError?: boolean;
};

export function ChatWidget() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { user } = useAuth();
  const prefersReduced = usePrefersReducedMotion();

  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<LocalChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isPending, setIsPending] = useState(false);
  const [hasLoadedHistory, setHasLoadedHistory] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Visible on /dashboard, /roadmap, /colleges, and /backup (hidden on /demo and /roadmap/:shareId)
  const isVisible =
    (pathname.startsWith("/dashboard") ||
      pathname === "/roadmap" ||
      pathname.startsWith("/colleges") ||
      pathname.startsWith("/backup")) &&
    !pathname.startsWith("/demo") &&
    !pathname.includes("/roadmap/");

  // Load history from Supabase when panel is opened for the first time
  useEffect(() => {
    if (!isOpen || hasLoadedHistory || !user?.id) return;

    async function loadHistory() {
      try {
        const { data, error } = await supabase
          .from("chat_messages")
          .select("id, role, content, created_at")
          .eq("user_id", user!.id)
          .order("created_at", { ascending: true })
          .limit(30);

        if (error) {
          console.error("[ChatWidget] Error loading chat history:", error);
          setMessages([]);
        } else {
          // Rule 3: Use ?? [] fallback
          const fetched = (data ?? []).map((msg) => ({
            id: msg.id,
            role: (msg.role === "user" ? "user" : "assistant") as "user" | "assistant",
            content: msg.content,
          }));
          setMessages(fetched);
        }
      } catch (err) {
        console.error("[ChatWidget] Exception loading chat history:", err);
        setMessages([]);
      } finally {
        setHasLoadedHistory(true);
      }
    }

    loadHistory();
  }, [isOpen, hasLoadedHistory, user]);

  // Auto scroll to bottom whenever messages update or pending state changes
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        if (scrollRef.current) {
          scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
      }, 50);
    }
  }, [messages, isPending, isOpen]);

  // Focus input on panel open
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 150);
    }
  }, [isOpen]);

  if (!isVisible) {
    return null;
  }

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend ?? inputMessage).trim();
    if (!text || isPending || !user?.id) return;

    setInputMessage("");
    const userMsgId = `user-${Date.now()}`;
    const userMsg: LocalChatMessage = {
      id: userMsgId,
      role: "user",
      content: text,
    };

    // 1. Optimistically update UI
    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setIsPending(true);

    try {
      // 2. Persist user message to Supabase
      await supabase.from("chat_messages").insert({
        user_id: user.id,
        role: "user",
        content: text,
      });

      // 3. Build history payload (Rule 3: use ?? [] fallback)
      const historyPayload = (messages ?? []).map((m) => ({
        role: m.role,
        content: m.content,
      }));

      // 4. Call server function via frontend entry point
      const response = await sendAdvisorChatMessage(text, historyPayload);

      // Check if response is empty or a generic network failure
      if (!response.reply) {
        // Show inline error bubble for retry
        setMessages((prev) => [
          ...prev,
          {
            id: `err-${Date.now()}`,
            role: "assistant",
            content: "Couldn't reach the AI assistant. Please try again.",
            isError: true,
          },
        ]);
        return;
      }

      // 5. Append reply and persist to Supabase
      const botMsg: LocalChatMessage = {
        id: `bot-${Date.now()}`,
        role: "assistant",
        content: response.reply,
      };

      await supabase.from("chat_messages").insert({
        user_id: user.id,
        role: "assistant",
        content: response.reply,
      });

      setMessages((prev) => [...prev, botMsg]);
    } catch (err) {
      console.error("[ChatWidget] Error sending message:", err);
      const errMessage =
        err instanceof Error && err.message
          ? err.message
          : "Couldn't send message — please try again.";
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          role: "assistant",
          content: errMessage,
          isError: true,
        },
      ]);
    } finally {
      setIsPending(false);
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    handleSendMessage();
  };

  const widgetVariants = getWidgetScaleFade(prefersReduced);
  const bubbleVariants = getFadeUp(prefersReduced);

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {/* Expandable Chat Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            variants={widgetVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="card-glow-top glass-card mb-4 flex h-[520px] max-h-[82vh] w-[calc(100vw-2rem)] flex-col overflow-hidden rounded-2xl border border-violet-500/25 bg-charcoal-deep/95 shadow-2xl backdrop-blur-2xl sm:w-[390px]"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-violet-500/20 bg-charcoal-mid/80 px-4 py-3 backdrop-blur-sm">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-violet-500/20 text-violet-300 shadow-sm ring-1 ring-violet-500/30">
                  <Bot className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="flex items-center gap-1.5 font-display text-xs font-bold tracking-tight text-foreground">
                    CareerCompass Advisor
                    <Sparkles className="h-3 w-3 text-violet-400 animate-pulse" />
                  </h3>
                  <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                    <span className="size-1.5 rounded-full bg-violet-400 animate-pulse" />
                    <span className="text-violet-300 font-medium">AI Guidance • Online</span>
                  </div>
                </div>
              </div>

              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 rounded-full text-muted-foreground hover:text-foreground"
                onClick={() => setIsOpen(false)}
                aria-label="Close Chat"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Messages Body */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3.5">
              {messages.length === 0 && !isPending && (
                <div className="flex h-full flex-col items-center justify-center text-center p-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-500/15 text-violet-400 border border-violet-500/30 mb-3 shadow-lg shadow-violet-500/10">
                    <Bot className="h-6 w-6" />
                  </div>
                  <p className="text-sm font-semibold text-foreground">
                    Hi! I'm your CareerCompass Advisor.
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground max-w-[250px] leading-relaxed">
                    Ask me anything about your career recommendation, roadmap steps, stream selection, or entrance exam prep.
                  </p>
                  <div className="mt-4 flex flex-wrap justify-center gap-1.5 max-w-[280px]">
                    {[
                      "What skills should I learn first?",
                      "Which stream is best for data science?",
                      "What exams should I prepare for?",
                    ].map((promptText) => (
                      <button
                        key={promptText}
                        type="button"
                        onClick={() => handleSendMessage(promptText)}
                        className="rounded-lg border border-violet-500/30 bg-violet-500/10 px-2.5 py-1 text-[11px] font-medium text-violet-300 hover:bg-violet-500/20 hover:text-white transition-colors"
                      >
                        {promptText}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {(messages ?? []).map((msg) => (
                <motion.div
                  key={msg.id}
                  variants={bubbleVariants}
                  initial="hidden"
                  animate="visible"
                  className={`flex items-start gap-2 ${
                    msg.role === "user" ? "flex-row-reverse" : "flex-row"
                  }`}
                >
                  <div
                    className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${
                      msg.role === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-violet-500/20 text-violet-300 border border-violet-500/30"
                    }`}
                  >
                    {msg.role === "user" ? (
                      <UserIcon className="h-3.5 w-3.5" />
                    ) : (
                      <Bot className="h-3.5 w-3.5" />
                    )}
                  </div>

                  <div
                    className={`max-w-[80%] rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed ${
                      msg.role === "user"
                        ? "bg-primary text-primary-foreground rounded-tr-none"
                        : msg.isError
                          ? "bg-destructive/10 text-destructive border border-destructive/20 rounded-tl-none"
                          : "bg-charcoal-mid/90 text-foreground border border-violet-500/20 rounded-tl-none"
                    }`}
                  >
                    {msg.isError ? (
                      <div className="flex flex-col gap-1.5">
                        <span className="font-medium">{msg.content}</span>
                        <button
                          onClick={() => {
                            // Find last user message content to retry
                            const lastUserMsg = [...messages]
                              .reverse()
                              .find((m) => m.role === "user");
                            if (lastUserMsg) {
                              handleSendMessage(lastUserMsg.content);
                            }
                          }}
                          className="inline-flex w-fit items-center gap-1 text-[11px] font-semibold text-primary underline hover:opacity-80"
                        >
                          <RefreshCw className="h-3 w-3" /> Retry
                        </button>
                      </div>
                    ) : (
                      msg.content
                    )}
                  </div>
                </motion.div>
              ))}

              {/* Typing Indicator */}
              {isPending && (
                <div className="flex items-start gap-2">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-violet-500/20 text-violet-300 border border-violet-500/30">
                    <Bot className="h-3.5 w-3.5" />
                  </div>
                  <div className="rounded-2xl rounded-tl-none bg-charcoal-mid/90 px-4 py-3 text-xs text-violet-300 border border-violet-500/20 flex items-center gap-1">
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-violet-400/80 [animation-delay:-0.3s]" />
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-violet-400/80 [animation-delay:-0.15s]" />
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-violet-400/80" />
                  </div>
                </div>
              )}
            </div>

            {/* Input Footer */}
            <form
              onSubmit={handleSubmit}
              className="border-t border-violet-500/20 bg-charcoal-deep/90 p-3 flex items-center gap-2 backdrop-blur-md"
            >
              <Input
                ref={inputRef}
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Ask your advisor about careers, roadmaps, exams..."
                disabled={isPending}
                className="h-9.5 text-xs rounded-xl bg-charcoal-mid/80 border-violet-500/20 text-foreground placeholder:text-muted-foreground/70 focus-visible:ring-1 focus-visible:ring-violet-500/50"
              />
              <Button
                type="submit"
                size="icon"
                disabled={!inputMessage.trim() || isPending}
                className="h-9.5 w-9.5 shrink-0 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-sm hover:from-violet-500 hover:to-indigo-500 transition-all disabled:opacity-50"
                aria-label="Send Message"
              >
                <Send className="h-3.5 w-3.5" />
              </Button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Action Toggle Button */}
      <Button
        onClick={() => setIsOpen((prev) => !prev)}
        size="icon"
        className="group relative h-13 w-13 rounded-full bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-[0_4px_24px_rgba(139,92,246,0.4)] ring-2 ring-violet-500/40 hover:from-violet-500 hover:to-indigo-500 hover:scale-105 active:scale-95 transition-all duration-300"
        aria-label={isOpen ? "Close Advisor Chat" : "Open Advisor Chat"}
      >
        <span className="absolute -inset-1 rounded-full bg-violet-500/25 blur-sm -z-10 group-hover:bg-violet-500/45 transition-colors" />
        <AnimatePresence mode="wait" initial={false}>
          {isOpen ? (
            <motion.div
              key="close"
              initial={{ scale: 0, rotate: -90 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0, rotate: 90 }}
              transition={{ duration: 0.15 }}
            >
              <X className="h-5 w-5" />
            </motion.div>
          ) : (
            <motion.div
              key="open"
              initial={{ scale: 0, rotate: 90 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0, rotate: -90 }}
              transition={{ duration: 0.15 }}
            >
              <MessageSquare className="h-5 w-5" />
            </motion.div>
          )}
        </AnimatePresence>
      </Button>
    </div>
  );
}
