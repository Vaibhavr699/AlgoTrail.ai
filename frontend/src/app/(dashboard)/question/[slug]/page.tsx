"use client";

import { useState, useEffect, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  ExternalLink,
  Lightbulb,
  BookOpen,
  Clock,
  Play,
  Pause,
  RotateCcw,
  CheckCircle2,
  Loader2,
  ChevronRight,
  Sparkles,
  StickyNote,
  Save,
} from "lucide-react";
import { TopNav } from "@/components/layout/top-nav";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { DifficultyBadge } from "@/components/topic/difficulty-badge";
import { PatternTag } from "@/components/topic/pattern-tag";
import { Badge } from "@/components/ui/badge";
import {
  useTopic,
  useProgress,
  useUpdateProgress,
  useLeetCodeProblem,
  useAIHint,
  useAIExplain,
  useNote,
  useUpsertNote,
} from "@/hooks/use-dsa";
import { cn } from "@/lib/utils";
import type { AIHint, AIExplanation, QuestionOut, Status } from "@/types";

export default function QuestionDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const router = useRouter();
  const progress = useProgress();

  const [question, setQuestion] = useState<QuestionOut | null>(null);
  const [topicSlug, setTopicSlug] = useState<string>("");

  // Find the question from topics
  useTopic(topicSlug);

  // Find which topic contains this question
  useEffect(() => {
    if (!slug) return;
    const fetchQuestion = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/api/questions/${slug}`
        );
        if (res.ok) {
          const q = await res.json();
          setQuestion(q);
        }
      } catch {}
    };
    fetchQuestion();
  }, [slug]);

  // Get topic slug from question's topic_id
  useEffect(() => {
    if (question && !topicSlug) {
      const fetchTopic = async () => {
        try {
          const res = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/api/topics`
          );
          const topics = await res.json();
          const found = topics.find((t: { id: string }) => t.id === question.topic_id);
          if (found) setTopicSlug(found.slug);
        } catch {}
      };
      fetchTopic();
    }
  }, [question, topicSlug]);

  const currentProgress = useMemo(() => {
    if (!question || !progress.data) return null;
    return progress.data.find((p) => p.question_id === question.id) ?? null;
  }, [question, progress.data]);

  if (!question) {
    return (
      <>
        <TopNav title="Loading..." />
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-[rgb(var(--muted))]" />
        </div>
      </>
    );
  }

  return (
    <>
      <TopNav title={question.title} />
      <div className="flex-1 p-6 max-w-6xl w-full mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-2">
            <button
              onClick={() => router.back()}
              className="inline-flex items-center gap-1.5 text-sm text-[rgb(var(--muted))] hover:text-[rgb(var(--foreground))] transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </button>
            <h1 className="text-2xl font-bold tracking-tight">{question.title}</h1>
            <div className="flex flex-wrap items-center gap-2">
              <DifficultyBadge difficulty={question.difficulty} />
              <PatternTag pattern={question.pattern} />
              {question.companies.slice(0, 5).map((c) => (
                <Badge key={c} variant="outline" className="text-[11px]">
                  {c}
                </Badge>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <StatusButton questionId={question.id} currentStatus={currentProgress?.status ?? "NOT_STARTED"} />
            {question.leetcode_slug && (
              <a
                href={`https://leetcode.com/problems/${question.leetcode_slug}/`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-lg border border-[rgb(var(--border))] px-3 py-2 text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                <ExternalLink className="h-4 w-4" />
                LeetCode
              </a>
            )}
          </div>
        </div>

        {/* Main content */}
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Tabs defaultValue="problem">
              <TabsList>
                <TabsTrigger value="problem">
                  <BookOpen className="h-3.5 w-3.5 mr-1.5" />
                  Problem
                </TabsTrigger>
                <TabsTrigger value="hints">
                  <Lightbulb className="h-3.5 w-3.5 mr-1.5" />
                  AI Hints
                </TabsTrigger>
                <TabsTrigger value="solution">
                  <Sparkles className="h-3.5 w-3.5 mr-1.5" />
                  Explain
                </TabsTrigger>
                <TabsTrigger value="notes">
                  <StickyNote className="h-3.5 w-3.5 mr-1.5" />
                  Notes
                </TabsTrigger>
              </TabsList>

              <TabsContent value="problem">
                <ProblemTab leetcodeSlug={question.leetcode_slug} question={question} />
              </TabsContent>
              <TabsContent value="hints">
                <HintsTab questionSlug={question.slug} existingHint={question.hint} />
              </TabsContent>
              <TabsContent value="solution">
                <ExplainTab questionSlug={question.slug} />
              </TabsContent>
              <TabsContent value="notes">
                <NotesTab questionId={question.id} questionSlug={question.slug} />
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            <TimerCard questionId={question.id} currentTimeSpent={currentProgress?.time_spent ?? 0} />

            {question.key_insight && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Key Insight</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-[rgb(var(--muted))] leading-relaxed">
                    {question.key_insight}
                  </p>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Progress</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-[rgb(var(--muted))]">Status</span>
                  <span className="font-medium">{formatStatus(currentProgress?.status ?? "NOT_STARTED")}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[rgb(var(--muted))]">Attempts</span>
                  <span className="font-mono">{currentProgress?.attempts ?? 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[rgb(var(--muted))]">Time spent</span>
                  <span className="font-mono">{formatTime(currentProgress?.time_spent ?? 0)}</span>
                </div>
                {topicSlug && (
                  <Link
                    href={`/topic/${topicSlug}`}
                    className="mt-3 flex items-center gap-1 text-xs font-medium text-brand-600 hover:text-brand-700"
                  >
                    View topic
                    <ChevronRight className="h-3 w-3" />
                  </Link>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
}

function StatusButton({ questionId, currentStatus }: { questionId: string; currentStatus: Status }) {
  const update = useUpdateProgress();
  const statusFlow: Status[] = ["NOT_STARTED", "IN_PROGRESS", "SOLVED", "NEEDS_REVIEW"];
  const next = statusFlow[(statusFlow.indexOf(currentStatus) + 1) % statusFlow.length];

  const colors: Record<Status, string> = {
    NOT_STARTED: "bg-gray-100 text-gray-700 hover:bg-gray-200",
    IN_PROGRESS: "bg-blue-100 text-blue-700 hover:bg-blue-200",
    SOLVED: "bg-emerald-100 text-emerald-700 hover:bg-emerald-200",
    NEEDS_REVIEW: "bg-amber-100 text-amber-700 hover:bg-amber-200",
  };

  return (
    <button
      onClick={() => update.mutate({ questionId, status: next })}
      disabled={update.isPending}
      className={cn("inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors", colors[currentStatus])}
    >
      {currentStatus === "SOLVED" && <CheckCircle2 className="h-4 w-4" />}
      {update.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : formatStatus(currentStatus)}
    </button>
  );
}

function ProblemTab({ leetcodeSlug, question }: { leetcodeSlug: string | null; question: QuestionOut }) {
  const lc = useLeetCodeProblem(leetcodeSlug);

  if (!leetcodeSlug) {
    return (
      <Card>
        <CardContent className="py-10 text-center">
          <BookOpen className="h-10 w-10 mx-auto text-[rgb(var(--muted))] mb-3" />
          <p className="text-sm text-[rgb(var(--muted))]">
            No LeetCode link available for this problem.
          </p>
          {question.hint && (
            <p className="mt-4 text-sm text-[rgb(var(--foreground))]">
              <strong>Hint:</strong> {question.hint}
            </p>
          )}
        </CardContent>
      </Card>
    );
  }

  if (lc.isLoading) {
    return (
      <Card>
        <CardContent className="py-10 flex items-center justify-center gap-2">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span className="text-sm text-[rgb(var(--muted))]">Loading problem from LeetCode...</span>
        </CardContent>
      </Card>
    );
  }

  if (lc.error || !lc.data) {
    return (
      <Card>
        <CardContent className="py-10 text-center">
          <p className="text-sm text-[rgb(var(--muted))]">Could not load problem details.</p>
          <a
            href={`https://leetcode.com/problems/${leetcodeSlug}/`}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 inline-flex items-center gap-1 text-sm text-brand-600 hover:text-brand-700"
          >
            Open on LeetCode <ExternalLink className="h-3.5 w-3.5" />
          </a>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="pt-5">
        {lc.data.is_paid_only ? (
          <div className="py-8 text-center">
            <p className="text-sm text-[rgb(var(--muted))]">This is a LeetCode Premium problem.</p>
            <a
              href={`https://leetcode.com/problems/${leetcodeSlug}/`}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 inline-flex items-center gap-1 text-sm text-brand-600 hover:text-brand-700"
            >
              Open on LeetCode <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </div>
        ) : (
          <div
            className="prose prose-sm max-w-none dark:prose-invert prose-pre:bg-gray-50 dark:prose-pre:bg-gray-900 prose-pre:rounded-lg prose-pre:text-xs"
            dangerouslySetInnerHTML={{ __html: lc.data.content || "" }}
          />
        )}
        {lc.data.hints.length > 0 && (
          <div className="mt-6 border-t border-[rgb(var(--border))] pt-4">
            <h4 className="text-sm font-semibold mb-2">LeetCode Hints</h4>
            <ul className="space-y-1.5">
              {lc.data.hints.map((h, i) => (
                <HintReveal key={i} index={i + 1} text={h} />
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function HintReveal({ index, text }: { index: number; text: string }) {
  const [open, setOpen] = useState(false);
  return (
    <li>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 text-sm text-brand-600 hover:text-brand-700"
      >
        <Lightbulb className="h-3.5 w-3.5" />
        {open ? `Hint ${index}` : `Show Hint ${index}`}
      </button>
      {open && <p className="mt-1 ml-5 text-sm text-[rgb(var(--muted))]">{text}</p>}
    </li>
  );
}

function HintsTab({ questionSlug, existingHint }: { questionSlug: string; existingHint: string | null }) {
  const hintMutation = useAIHint(questionSlug);
  const [hints, setHints] = useState<AIHint[]>([]);
  const [currentLevel, setCurrentLevel] = useState(1);

  const requestHint = async (level: number) => {
    const result = await hintMutation.mutateAsync(level);
    setHints((prev) => [...prev.filter((h) => h.level !== level), result]);
    setCurrentLevel(Math.min(level + 1, 3));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <Lightbulb className="h-5 w-5 text-amber-500" />
          Progressive Hints
        </CardTitle>
        <p className="text-xs text-[rgb(var(--muted))]">
          Get AI-powered hints that gradually reveal the approach — from a nudge to pseudocode.
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {existingHint && (
          <div className="rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 p-3">
            <p className="text-xs font-semibold text-amber-700 dark:text-amber-400 mb-1">Built-in Hint</p>
            <p className="text-sm">{existingHint}</p>
          </div>
        )}

        {hints.map((h) => (
          <div key={h.level} className="rounded-lg border border-[rgb(var(--border))] p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-brand-600">Level {h.level}/3</span>
              <Badge variant="outline" className="text-[10px]">{h.key_concept}</Badge>
            </div>
            <p className="text-sm leading-relaxed">{h.hint}</p>
            <p className="text-xs text-[rgb(var(--muted))]">Target: {h.complexity_target}</p>
          </div>
        ))}

        {currentLevel <= 3 && (
          <button
            onClick={() => requestHint(currentLevel)}
            disabled={hintMutation.isPending}
            className="inline-flex items-center gap-2 rounded-lg bg-amber-500 text-white px-4 py-2 text-sm font-medium hover:bg-amber-600 transition-colors disabled:opacity-50"
          >
            {hintMutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Lightbulb className="h-4 w-4" />
            )}
            {currentLevel === 1 ? "Get a nudge" : currentLevel === 2 ? "Show approach" : "Show pseudocode"}
          </button>
        )}
      </CardContent>
    </Card>
  );
}

function ExplainTab({ questionSlug }: { questionSlug: string }) {
  const explainMutation = useAIExplain(questionSlug);
  const [explanation, setExplanation] = useState<AIExplanation | null>(null);
  const [language, setLanguage] = useState("python");

  const requestExplain = async () => {
    const result = await explainMutation.mutateAsync(language);
    setExplanation(result);
  };

  if (!explanation) {
    return (
      <Card>
        <CardContent className="py-10 text-center space-y-4">
          <Sparkles className="h-10 w-10 mx-auto text-brand-500" />
          <div>
            <h3 className="font-semibold">AI Solution Explanation</h3>
            <p className="text-sm text-[rgb(var(--muted))] mt-1">
              Get a step-by-step explanation with code, complexity analysis, and common pitfalls.
            </p>
          </div>
          <div className="flex items-center justify-center gap-2">
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="rounded-lg border border-[rgb(var(--border))] px-3 py-2 text-sm bg-[rgb(var(--card))]"
            >
              <option value="python">Python</option>
              <option value="javascript">JavaScript</option>
              <option value="typescript">TypeScript</option>
              <option value="java">Java</option>
              <option value="cpp">C++</option>
              <option value="go">Go</option>
            </select>
            <button
              onClick={requestExplain}
              disabled={explainMutation.isPending}
              className="inline-flex items-center gap-2 rounded-lg bg-brand-500 text-white px-4 py-2 text-sm font-medium hover:bg-brand-600 transition-colors disabled:opacity-50"
            >
              {explainMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Sparkles className="h-4 w-4" />
              )}
              Explain Solution
            </button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="pt-5 space-y-5">
        <div>
          <h3 className="font-semibold text-lg">{explanation.approach}</h3>
          <p className="text-sm text-[rgb(var(--muted))] mt-1 leading-relaxed">{explanation.intuition}</p>
        </div>

        <div>
          <h4 className="text-sm font-semibold mb-2">Steps</h4>
          <ol className="space-y-1.5">
            {explanation.steps.map((s, i) => (
              <li key={i} className="flex gap-2 text-sm">
                <span className="font-mono text-brand-600 shrink-0">{i + 1}.</span>
                <span>{s}</span>
              </li>
            ))}
          </ol>
        </div>

        <div>
          <h4 className="text-sm font-semibold mb-2">Code</h4>
          <pre className="rounded-lg bg-gray-50 dark:bg-gray-900 p-4 text-xs overflow-x-auto">
            <code>{explanation.code}</code>
          </pre>
        </div>

        <div className="grid sm:grid-cols-2 gap-3">
          <div className="rounded-lg bg-emerald-50 dark:bg-emerald-900/20 p-3">
            <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">Time Complexity</p>
            <p className="text-sm font-mono mt-1">{explanation.time_complexity}</p>
          </div>
          <div className="rounded-lg bg-blue-50 dark:bg-blue-900/20 p-3">
            <p className="text-xs font-semibold text-blue-700 dark:text-blue-400">Space Complexity</p>
            <p className="text-sm font-mono mt-1">{explanation.space_complexity}</p>
          </div>
        </div>

        {explanation.common_mistakes.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold mb-2">Common Mistakes</h4>
            <ul className="space-y-1">
              {explanation.common_mistakes.map((m, i) => (
                <li key={i} className="text-sm text-[rgb(var(--muted))] flex gap-2">
                  <span className="text-red-400">!</span> {m}
                </li>
              ))}
            </ul>
          </div>
        )}

        {explanation.follow_up && (
          <div className="rounded-lg border border-[rgb(var(--border))] p-3">
            <p className="text-xs font-semibold mb-1">Follow-up</p>
            <p className="text-sm text-[rgb(var(--muted))]">{explanation.follow_up}</p>
          </div>
        )}

        <button
          onClick={requestExplain}
          disabled={explainMutation.isPending}
          className="text-sm text-brand-600 hover:text-brand-700 flex items-center gap-1"
        >
          {explainMutation.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RotateCcw className="h-3.5 w-3.5" />}
          Regenerate
        </button>
      </CardContent>
    </Card>
  );
}

function NotesTab({ questionId, questionSlug }: { questionId: string; questionSlug: string }) {
  const note = useNote(questionSlug);
  const upsertNote = useUpsertNote();
  const [content, setContent] = useState("");
  const [codeSnippet, setCodeSnippet] = useState("");
  const [language, setLanguage] = useState("python");
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    if (note.data && !initialized) {
      setContent(note.data.content || "");
      setCodeSnippet(note.data.code_snippet || "");
      setLanguage(note.data.language || "python");
      setInitialized(true);
    }
  }, [note.data, initialized]);

  const save = () => {
    upsertNote.mutate({ questionId, content, language, codeSnippet: codeSnippet || undefined });
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">Your Notes</CardTitle>
          <button
            onClick={save}
            disabled={upsertNote.isPending}
            className="inline-flex items-center gap-1.5 rounded-lg bg-brand-500 text-white px-3 py-1.5 text-sm font-medium hover:bg-brand-600 transition-colors disabled:opacity-50"
          >
            {upsertNote.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
            Save
          </button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="text-xs font-semibold text-[rgb(var(--muted))] mb-1.5 block">Notes</label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Write your approach, key observations, edge cases..."
            rows={6}
            className="w-full rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--card))] p-3 text-sm placeholder:text-[rgb(var(--muted))]/50 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 resize-none"
          />
        </div>
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-semibold text-[rgb(var(--muted))]">Code Snippet</label>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="rounded border border-[rgb(var(--border))] px-2 py-0.5 text-xs bg-[rgb(var(--card))]"
            >
              <option value="python">Python</option>
              <option value="javascript">JavaScript</option>
              <option value="typescript">TypeScript</option>
              <option value="java">Java</option>
              <option value="cpp">C++</option>
            </select>
          </div>
          <textarea
            value={codeSnippet}
            onChange={(e) => setCodeSnippet(e.target.value)}
            placeholder="Paste your solution code here..."
            rows={8}
            className="w-full rounded-lg border border-[rgb(var(--border))] bg-gray-50 dark:bg-gray-900 p-3 text-xs font-mono placeholder:text-[rgb(var(--muted))]/50 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 resize-none"
          />
        </div>
      </CardContent>
    </Card>
  );
}

function TimerCard({ questionId, currentTimeSpent }: { questionId: string; currentTimeSpent: number }) {
  const [seconds, setSeconds] = useState(0);
  const [running, setRunning] = useState(false);
  const update = useUpdateProgress();

  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(id);
  }, [running]);

  const total = currentTimeSpent + seconds;

  const saveTime = () => {
    if (seconds > 0) {
      update.mutate({ questionId, status: "IN_PROGRESS", timeSpent: total });
      setSeconds(0);
      setRunning(false);
    }
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2">
          <Clock className="h-4 w-4" />
          Timer
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-mono font-bold text-center py-3">
          {formatTime(total)}
        </div>
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => setRunning(!running)}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-medium transition-colors",
              running
                ? "bg-red-100 text-red-700 hover:bg-red-200"
                : "bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
            )}
          >
            {running ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            {running ? "Pause" : "Start"}
          </button>
          {seconds > 0 && !running && (
            <button
              onClick={saveTime}
              disabled={update.isPending}
              className="inline-flex items-center gap-1.5 rounded-lg bg-brand-500 text-white px-4 py-2 text-sm font-medium hover:bg-brand-600 transition-colors disabled:opacity-50"
            >
              {update.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
              Save
            </button>
          )}
          {seconds > 0 && (
            <button
              onClick={() => { setSeconds(0); setRunning(false); }}
              className="inline-flex items-center justify-center rounded-lg border border-[rgb(var(--border))] p-2 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              <RotateCcw className="h-4 w-4" />
            </button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function formatTime(totalSeconds: number): string {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  if (h > 0) return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

function formatStatus(status: Status): string {
  return status.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()).replace(/\bNot Started\b/, "Not Started");
}
