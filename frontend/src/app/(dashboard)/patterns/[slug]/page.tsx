"use client";

import { useEffect, useState, useRef, FormEvent } from "react";
import { useParams, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  Lightbulb,
  AlertTriangle,
  Sparkles,
  Code2,
  Clock,
  HardDrive,
  BookOpen,
  Send,
  Shapes,
  X,
  MessageCircle,
  Link2,
  ChevronRight,
} from "lucide-react";
import { DotsLoader } from "@/components/ui/dots-loader";
import { PageLoader } from "@/components/ui/page-loader";
import { TopNav } from "@/components/layout/top-nav";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AgentAvatar } from "@/components/onboarding/agent-avatar";
import { useTeachPattern, usePatternChat } from "@/hooks/use-dsa";
import { cn } from "@/lib/utils";
import type { PatternLesson, ChatMessage } from "@/types";

export default function PatternDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const searchParams = useSearchParams();
  const patternName = searchParams.get("name") || slug.replace(/-/g, " ");
  const topicContext = searchParams.get("topic") || undefined;

  const teachMutation = useTeachPattern();
  const [lesson, setLesson] = useState<PatternLesson | null>(null);
  const [chatOpen, setChatOpen] = useState(false);

  useEffect(() => {
    if (!lesson && !teachMutation.isPending) {
      teachMutation.mutateAsync({ patternName, topicContext }).then(setLesson);
    }
  }, [patternName]);

  if (teachMutation.isPending && !lesson) {
    return (
      <>
        <TopNav title={patternName} />
        <PageLoader />
      </>
    );
  }

  if (teachMutation.isError) {
    return (
      <>
        <TopNav title={patternName} />
        <div className="flex-1 flex flex-col items-center justify-center gap-4 p-6">
          <AlertTriangle className="h-10 w-10 text-red-400" />
          <p className="text-sm text-[rgb(var(--muted))]">Failed to load pattern lesson.</p>
          <button
            onClick={() => teachMutation.mutateAsync({ patternName, topicContext }).then(setLesson)}
            className="text-sm text-brand-600 hover:text-brand-700 font-medium"
          >
            Try again
          </button>
        </div>
      </>
    );
  }

  if (!lesson) return null;

  return (
    <>
      <TopNav title={lesson.pattern_name} />
      <div className="flex-1 p-6 max-w-6xl w-full mx-auto space-y-6">
        {/* Header */}
        <div>
          <Link
            href="/patterns"
            className="inline-flex items-center gap-1.5 text-sm text-[rgb(var(--muted))] hover:text-[rgb(var(--foreground))] transition-colors mb-3"
          >
            <ArrowLeft className="h-4 w-4" />
            All Patterns
          </Link>
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                <Shapes className="h-6 w-6 text-brand-500" />
                {lesson.pattern_name}
              </h1>
              <p className="mt-1 text-sm text-[rgb(var(--muted))]">{lesson.summary}</p>
            </div>
            <button
              onClick={() => setChatOpen(true)}
              className="inline-flex items-center gap-2 rounded-xl bg-brand-500 text-white px-4 py-2.5 text-sm font-medium hover:bg-brand-600 transition-colors shrink-0"
            >
              <MessageCircle className="h-4 w-4" />
              Ask Sage
            </button>
          </div>
        </div>

        {/* When to use */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Lightbulb className="h-5 w-5 text-amber-500" />
              When to Use This Pattern
            </CardTitle>
          </CardHeader>
          <CardContent>
            <FormattedList text={lesson.when_to_use} icon={<ChevronRight className="h-3.5 w-3.5 text-amber-500 shrink-0 mt-0.5" />} />
          </CardContent>
        </Card>

        {/* How it works */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-blue-500" />
              How It Works
            </CardTitle>
          </CardHeader>
          <CardContent>
            <NumberedSteps text={lesson.how_it_works} />
          </CardContent>
        </Card>

        {/* Code template */}
        <TemplateCard patternName={lesson.pattern_name} defaultTemplate={lesson.template} />

        {/* Complexity */}
        <div className="grid sm:grid-cols-2 gap-4">
          <Card className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="h-4 w-4 text-brand-500" />
              <span className="text-sm font-semibold">Time Complexity</span>
            </div>
            <p className="text-sm text-[rgb(var(--muted))]">{lesson.time_complexity}</p>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <HardDrive className="h-4 w-4 text-blue-500" />
              <span className="text-sm font-semibold">Space Complexity</span>
            </div>
            <p className="text-sm text-[rgb(var(--muted))]">{lesson.space_complexity}</p>
          </Card>
        </div>

        {/* Classic examples */}
        {lesson.classic_examples.length > 0 && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Classic Problems</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {lesson.classic_examples.map((ex, i) => (
                  <div key={i} className="flex gap-3 rounded-lg border border-[rgb(var(--border))] p-3">
                    <span className="text-xs font-mono text-brand-500 mt-0.5 shrink-0">{i + 1}.</span>
                    <div>
                      <p className="text-sm font-medium">{ex.problem}</p>
                      <p className="text-xs text-[rgb(var(--muted))] mt-0.5">{ex.why}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Common mistakes + Pro tips */}
        <div className="grid sm:grid-cols-2 gap-4">
          {lesson.common_mistakes.length > 0 && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-red-400" />
                  Common Mistakes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {lesson.common_mistakes.map((m, i) => (
                    <li key={i} className="text-xs text-[rgb(var(--muted))] flex gap-2">
                      <span className="text-red-400 shrink-0">!</span>
                      <span>{m}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {lesson.pro_tips.length > 0 && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-amber-500" />
                  Pro Tips
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {lesson.pro_tips.map((t, i) => (
                    <li key={i} className="text-xs text-[rgb(var(--muted))] flex gap-2">
                      <span className="text-amber-500 shrink-0">*</span>
                      <span>{t}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Related patterns */}
        {lesson.related_patterns.length > 0 && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Link2 className="h-5 w-5 text-indigo-500" />
                Related Patterns
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid sm:grid-cols-2 gap-2">
                {lesson.related_patterns.map((rp) => {
                  const rpSlug = rp.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
                  return (
                    <Link
                      key={rp}
                      href={`/patterns/${rpSlug}?name=${encodeURIComponent(rp)}`}
                      className="group flex items-center justify-between rounded-xl border border-[rgb(var(--border))] px-4 py-3 hover:border-brand-300 hover:bg-brand-50/50 dark:hover:bg-brand-900/10 transition-all"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <Shapes className="h-4 w-4 text-brand-500 shrink-0" />
                        <span className="text-sm font-medium truncate">{rp}</span>
                      </div>
                      <ArrowRight className="h-3.5 w-3.5 text-[rgb(var(--muted))] group-hover:text-brand-500 transition-colors shrink-0" />
                    </Link>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Chatbot */}
      {chatOpen && (
        <PatternChatbot
          patternName={lesson.pattern_name}
          onClose={() => setChatOpen(false)}
        />
      )}
    </>
  );
}

const LANGUAGES = [
  { value: "python", label: "Python" },
  { value: "javascript", label: "JavaScript" },
  { value: "typescript", label: "TypeScript" },
  { value: "java", label: "Java" },
  { value: "cpp", label: "C++" },
  { value: "go", label: "Go" },
];

function TemplateCard({ patternName, defaultTemplate }: { patternName: string; defaultTemplate: string }) {
  const [language, setLanguage] = useState("python");
  const [template, setTemplate] = useState(defaultTemplate);
  const [loading, setLoading] = useState(false);

  const switchLanguage = async (lang: string) => {
    setLanguage(lang);
    if (lang === "python") {
      setTemplate(defaultTemplate);
      return;
    }
    setLoading(true);
    try {
      const { api } = await import("@/lib/api");
      const result = await api.ai.patternTemplate(patternName, lang);
      setTemplate(result.template);
    } catch {
      setTemplate("// Failed to load template. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Code2 className="h-5 w-5 text-emerald-500" />
            Reusable Template
          </CardTitle>
          <select
            value={language}
            onChange={(e) => switchLanguage(e.target.value)}
            disabled={loading}
            className="rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--card))] px-3 py-1.5 text-xs font-medium focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 disabled:opacity-50"
          >
            {LANGUAGES.map((l) => (
              <option key={l.value} value={l.value}>{l.label}</option>
            ))}
          </select>
        </div>
      </CardHeader>
      <CardContent>
        <div className="relative">
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-50/80 dark:bg-gray-900/80 rounded-lg z-10">
              <DotsLoader size="md" className="text-brand-500" />
            </div>
          )}
          <pre className="rounded-lg bg-gray-50 dark:bg-gray-900 p-4 text-xs font-mono overflow-x-auto leading-relaxed">
            <code>{template}</code>
          </pre>
        </div>
      </CardContent>
    </Card>
  );
}

function splitIntoParts(text: string | string[]): string[] {
  if (Array.isArray(text)) return text.map((s) => String(s).trim()).filter(Boolean);
  const str = String(text || "");
  if (!str) return [];
  const byNewline = str.split(/\n+/).map((s) => s.trim()).filter(Boolean);
  if (byNewline.length > 1) return byNewline;
  const byNumbered = str.split(/(?:^|\.\s*)(?=\d+[\.\)\-]\s*)/).map((s) => s.trim()).filter(Boolean);
  if (byNumbered.length > 1) return byNumbered;
  const bySentence = str.split(/(?<=\.)\s+(?=[A-Z\d])/).map((s) => s.trim()).filter(Boolean);
  if (bySentence.length > 1) return bySentence;
  return [str];
}

function FormattedList({ text, icon }: { text: string | string[]; icon: React.ReactNode }) {
  const items = splitIntoParts(text);
  if (items.length <= 1) {
    return <p className="text-sm leading-relaxed">{items[0] || ""}</p>;
  }
  return (
    <ul className="space-y-2.5">
      {items.map((item, i) => (
        <li key={i} className="flex gap-2 text-sm leading-relaxed">
          {icon}
          <span>{item.replace(/^\d+[\.\)\-]\s*/, "")}</span>
        </li>
      ))}
    </ul>
  );
}

function NumberedSteps({ text }: { text: string | string[] }) {
  const steps = splitIntoParts(text);
  if (steps.length <= 1) {
    return <p className="text-sm leading-relaxed">{steps[0] || ""}</p>;
  }
  return (
    <div className="space-y-4">
      {steps.map((step, i) => {
        const clean = step.replace(/^\d+[\.\)\-]\s*/, "");
        return (
          <div key={i} className="flex gap-3">
            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-xs font-bold">
              {i + 1}
            </div>
            <p className="text-sm leading-relaxed pt-0.5">{clean}</p>
          </div>
        );
      })}
    </div>
  );
}

function PatternChatbot({ patternName, onClose }: { patternName: string; onClose: () => void }) {
  const chatMutation = usePatternChat();
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      content: `Hey! I'm Sage. I see you're learning **${patternName}**. Ask me anything — how it works, when to use it, walk through an example, or compare it with another pattern. I'm here to help!`,
    },
  ]);
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const send = async (e: FormEvent) => {
    e.preventDefault();
    const text = input.trim();
    if (!text || chatMutation.isPending) return;

    const userMsg: ChatMessage = { role: "user", content: text };
    const updated = [...messages, userMsg];
    setMessages(updated);
    setInput("");

    const apiMessages = updated
      .filter((m) => !(m.role === "assistant" && m === messages[0]))
      .map((m) => ({ role: m.role, content: m.content }));

    try {
      const result = await chatMutation.mutateAsync({ patternName, messages: apiMessages });
      setMessages((prev) => [...prev, { role: "assistant", content: result.reply }]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Sorry, I ran into an issue. Please try again!" },
      ]);
    }
  };

  return (
    <div className="fixed bottom-0 right-0 z-50 w-full sm:w-96 sm:bottom-6 sm:right-6">
      <div className="flex flex-col h-[500px] sm:h-[520px] rounded-t-2xl sm:rounded-2xl bg-[rgb(var(--card))] border border-[rgb(var(--border))] shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-[rgb(var(--border))] bg-brand-500 text-white">
          <AgentAvatar size="sm" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold">Sage</p>
            <p className="text-[10px] opacity-80">Helping with {patternName}</p>
          </div>
          <button onClick={onClose} className="h-7 w-7 rounded-full flex items-center justify-center hover:bg-white/20 transition-colors">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Messages */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-thin">
          {messages.map((msg, i) => (
            <div key={i} className={cn("flex gap-2.5", msg.role === "user" ? "justify-end" : "justify-start")}>
              {msg.role === "assistant" && <AgentAvatar size="sm" className="mt-0.5" />}
              <div
                className={cn(
                  "max-w-[80%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed",
                  msg.role === "user"
                    ? "bg-brand-500 text-white rounded-br-md"
                    : "bg-gray-100 dark:bg-gray-800 rounded-bl-md"
                )}
              >
                <p className="whitespace-pre-wrap">{msg.content}</p>
              </div>
            </div>
          ))}
          {chatMutation.isPending && (
            <div className="flex gap-2.5">
              <AgentAvatar size="sm" className="mt-0.5" />
              <div className="bg-gray-100 dark:bg-gray-800 rounded-2xl rounded-bl-md px-4 py-3">
                <div className="flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-[rgb(var(--muted))] animate-bounce" style={{ animationDelay: "0ms" }} />
                  <span className="h-1.5 w-1.5 rounded-full bg-[rgb(var(--muted))] animate-bounce" style={{ animationDelay: "150ms" }} />
                  <span className="h-1.5 w-1.5 rounded-full bg-[rgb(var(--muted))] animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Input */}
        <form onSubmit={send} className="border-t border-[rgb(var(--border))] p-3 flex items-center gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about this pattern..."
            className="flex-1 rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--background))] px-3.5 py-2.5 text-sm placeholder:text-[rgb(var(--muted))]/50 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
            disabled={chatMutation.isPending}
          />
          <button
            type="submit"
            disabled={chatMutation.isPending || !input.trim()}
            className="h-10 w-10 rounded-xl bg-brand-500 text-white flex items-center justify-center hover:bg-brand-600 transition-colors disabled:opacity-40"
          >
            <Send className="h-4 w-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
