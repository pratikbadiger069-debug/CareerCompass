import { useEffect, useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Compass,
  GraduationCap,
  Lightbulb,
  Link2,
  Loader2,
  Map as MapIcon,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import { useAuth } from "@/hooks/useAuth";
import { usePrefersReducedMotion } from "@/hooks/use-reduced-motion";
import { getStaggerContainer, getFadeUp, getCardHover } from "@/lib/motion";
import { HeaderNav } from "@/components/HeaderNav";
import { motion } from "framer-motion";
import {
  CAREER_PATHS,
  EXAM_CONNECTIONS,
  STREAM_VALUE_TO_PATH,
  type StreamPath,
} from "@/lib/careerCompass.paths";
import {
  PathDetailModal,
  type OptionPath,
  type BackupPath,
  type PathDetailRec,
} from "@/components/PathDetailModal";
import { sendChatMessage } from "@/lib/chat.functions";

export const Route = createFileRoute("/_authenticated/backup")({
  head: () => ({
    meta: [
      { title: "CareerCompass — Backup & Risk Mitigation Pathways" },
      {
        name: "description",
        content:
          "Explore secondary career paths, fallback options, and what-if scenarios to ensure long-term career security.",
      },
      { property: "og:title", content: "CareerCompass — Backup Pathways" },
    ],
  }),
  component: BackupPage,
});

function BackupPage() {
  const { user, isGuest } = useAuth();
  const prefersReduced = usePrefersReducedMotion();

  const stagger = getStaggerContainer(prefersReduced);
  const fadeUp = getFadeUp(prefersReduced);
  const cardHover = getCardHover(prefersReduced);

  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<Tables<"user_profiles"> | null>(null);
  const [stream, setStream] = useState<string>("science_pcm");
  const [scenarioIndex, setScenarioIndex] = useState(0);

  // Backup & What-If state
  const [aiBackupPaths, setAiBackupPaths] = useState<BackupPath[]>([]);
  const [aiOptionPaths, setAiOptionPaths] = useState<OptionPath[]>([]);
  const [whatIfScenarios, setWhatIfScenarios] = useState<
    Array<{ question: string; answer: string; alternatives: string[] }>
  >([]);
  const [examConnections, setExamConnections] = useState<
    Array<{ exam: string; connected_exams: string[]; note: string }>
  >([]);

  // Custom question state
  const [customQuestion, setCustomQuestion] = useState("");
  const [askingQuestion, setAskingQuestion] = useState(false);

  // Detail Modal state
  const [selectedDetailRec, setSelectedDetailRec] = useState<PathDetailRec | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);

  // Resolved path based on active stream
  const path = useMemo<StreamPath>(() => {
    const id = STREAM_VALUE_TO_PATH[stream] ?? "mpc";
    return CAREER_PATHS.find((item) => item.id === id) ?? CAREER_PATHS[0]!;
  }, [stream]);

  // Initial Data Load
  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        if (user && !isGuest) {
          const { data: profile } = await supabase
            .from("user_profiles")
            .select("*")
            .eq("user_id", user.id)
            .maybeSingle();

          if (profile) {
            setUserProfile(profile);
            if (profile.stream) {
              setStream(profile.stream);
            }
          }

          // Check cached AI payload from localStorage
          const cacheKey = `career_compass_full_${user.id}`;
          if (typeof window !== "undefined") {
            const cachedStr = localStorage.getItem(cacheKey);
            if (cachedStr) {
              try {
                const cachedPayload = JSON.parse(cachedStr);
                if (Array.isArray(cachedPayload.backup_paths)) {
                  setAiBackupPaths(cachedPayload.backup_paths);
                }
                if (Array.isArray(cachedPayload.option_paths)) {
                  setAiOptionPaths(cachedPayload.option_paths);
                }
                if (Array.isArray(cachedPayload.what_if)) {
                  setWhatIfScenarios(cachedPayload.what_if);
                }
                if (Array.isArray(cachedPayload.exam_connections)) {
                  setExamConnections(cachedPayload.exam_connections);
                }
              } catch (e) {
                console.warn("[Backup] Cache parse error:", e);
              }
            }
          }
        }
      } catch (err) {
        console.error("[Backup] Error loading profile:", err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [user, isGuest]);

  // Handle custom what-if question
  const handleAskCustomQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customQuestion.trim() || askingQuestion) return;
    const q = customQuestion.trim();
    setAskingQuestion(true);
    setCustomQuestion("");

    try {
      const res = await sendChatMessage({
        data: { message: `What-If Scenario Question for stream ${stream}: ${q}` },
      });
      const newScenario = {
        question: q,
        answer: res.reply || "No response received.",
        alternatives: [],
      };
      setWhatIfScenarios((prev) => [...prev, newScenario]);
      setScenarioIndex(whatIfScenarios.length); // focus on newly added
      toast.success("What-If alternative generated!");
    } catch (err) {
      console.error("[Backup] Error asking question:", err);
      toast.error("Failed to answer question. Please try again.");
    } finally {
      setAskingQuestion(false);
    }
  };

  // Resolved list of backup options
  const backupList: BackupPath[] = useMemo(() => {
    if (aiBackupPaths.length > 0) return aiBackupPaths;
    return path.backups.map((b) => ({
      title: b.title,
      description: b.description,
      why_it_works: b.whyItWorks,
    }));
  }, [aiBackupPaths, path]);

  // Resolved list of option paths
  const optionList: OptionPath[] = useMemo(() => {
    if (aiOptionPaths.length > 0) return aiOptionPaths;
    return path.options;
  }, [aiOptionPaths, path]);

  // Resolved list of exam connections
  const resolvedExamConnections = useMemo(() => {
    if (examConnections.length > 0) return examConnections;
    return EXAM_CONNECTIONS.map((c) => ({
      exam: c.exam,
      connected_exams: c.connectedExams,
      note: c.note,
    }));
  }, [examConnections]);

  return (
    <div className="min-h-screen bg-charcoal-deep hero-glow dot-grid-bg text-foreground pb-24">
      <HeaderNav />

      <main className="mx-auto w-full max-w-6xl px-6 py-8">
        {/* Header */}
        <header className="mb-8 border-b border-white/8 pb-6">
          <Link to="/dashboard">
            <Button variant="ghost" size="sm" className="mb-4 gap-2 text-xs">
              <ArrowLeft className="size-4" /> Back to Dashboard
            </Button>
          </Link>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                <ShieldCheck className="size-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-bold tracking-tight">Backup & Risk Mitigation</h1>
                  <Badge variant="outline" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/30 text-xs">
                    Plan B Strategy
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Secondary career paths, fallback options & exam pivots to ensure long-term career security.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Link to="/colleges">
                <Button variant="outline" size="sm" className="gap-1.5 text-xs">
                  <GraduationCap className="size-4" />
                  Explore Target Colleges
                </Button>
              </Link>
            </div>
          </div>
        </header>

        {loading ? (
          <div className="space-y-6">
            <Skeleton className="h-44 w-full rounded-2xl" />
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-56 w-full rounded-2xl" />
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-10">
            {/* Stream Selector Bar */}
            <Card className="border-border/60 bg-card/80 p-4 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="flex items-center gap-2 text-xs">
                  <Compass className="size-4 text-primary shrink-0" />
                  <span className="font-semibold text-foreground">Active Stream:</span>
                  <Badge variant="secondary" className="font-medium text-xs">
                    {userProfile?.stream ? userProfile.stream.replace("_", " ").toUpperCase() : stream.replace("_", " ").toUpperCase()}
                  </Badge>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-muted-foreground">Switch Stream to Explore:</span>
                  <Select value={stream} onValueChange={setStream}>
                    <SelectTrigger className="h-8 text-xs w-48 bg-background">
                      <SelectValue placeholder="Select stream" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="science_pcm" className="text-xs">Science (PCM / MPC)</SelectItem>
                      <SelectItem value="science_pcb" className="text-xs">Science (PCB / BiPC)</SelectItem>
                      <SelectItem value="commerce" className="text-xs">Commerce</SelectItem>
                      <SelectItem value="arts" className="text-xs">Arts & Humanities</SelectItem>
                      <SelectItem value="engineering" className="text-xs">Engineering</SelectItem>
                      <SelectItem value="medical" className="text-xs">Medical & Health</SelectItem>
                      <SelectItem value="business" className="text-xs">Business & Management</SelectItem>
                      <SelectItem value="design" className="text-xs">Design & Media</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </Card>

            {/* ─── 1. Primary Backup Pathways ─── */}
            <section>
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="size-5 text-emerald-400" />
                  <h2 className="text-lg font-bold text-foreground">
                    Recommended Fallback Pathways ({backupList.length})
                  </h2>
                </div>
                <span className="ai-badge">Risk Mitigation</span>
              </div>

              <motion.div
                variants={stagger}
                initial="hidden"
                animate="visible"
                className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
              >
                {backupList.map((backup, idx) => (
                  <motion.div
                    key={idx}
                    variants={fadeUp}
                    whileHover={cardHover.whileHover}
                    className="flex flex-col justify-between rounded-2xl border border-border/70 bg-card/85 p-5 shadow-sm transition-all hover:border-emerald-500/40 hover:bg-card/95"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <Badge variant="secondary" className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          Backup Path {idx + 1}
                        </Badge>
                        <Badge variant="outline" className="text-[10px] text-muted-foreground border-border/60">
                          Stable Pivot
                        </Badge>
                      </div>

                      <h3 className="font-bold text-base text-foreground leading-snug">
                        {backup.title}
                      </h3>

                      <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
                        {backup.description}
                      </p>

                      <div className="mt-3 rounded-xl border border-white/5 bg-muted/40 p-3 text-xs">
                        <span className="font-semibold text-primary block mb-0.5">Why it works:</span>
                        <p className="text-muted-foreground text-[11px] leading-relaxed">
                          {backup.why_it_works}
                        </p>
                      </div>
                    </div>

                    <div className="mt-5 space-y-2 pt-2 border-t border-border/40">
                      <Button
                        variant="default"
                        size="sm"
                        className="w-full text-xs gap-1.5 h-8 font-semibold bg-primary text-primary-foreground hover:bg-primary/90"
                        onClick={() => {
                          const backupRec: PathDetailRec = {
                            career_title: backup.title,
                            description: backup.description,
                            why_it_works: backup.why_it_works,
                            match_score: 82,
                            salary_range: "Flexible / High Demand",
                            growth_outlook: "Stable Backup Option",
                            required_skills: ["Transferable Skills", "Core Fundamentals"],
                            honest_challenges: "May require complementary certifications or entrance exam pivot.",
                            day_in_life: "Focuses on high-impact domain responsibilities with flexible entry points.",
                          };
                          setSelectedDetailRec(backupRec);
                          setDetailModalOpen(true);
                        }}
                      >
                        <MapIcon className="size-3.5" />
                        Check Backup Roadmap
                      </Button>

                      <Link to="/colleges" search={{ tab: "explore" }}>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="w-full text-[11px] text-muted-foreground hover:text-foreground h-7 gap-1"
                        >
                          <GraduationCap className="size-3" />
                          View Relevant Colleges <ArrowRight className="size-3" />
                        </Button>
                      </Link>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </section>

            {/* ─── 2. Stream Pathways & Options ─── */}
            <section>
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <GraduationCap className="size-5 text-primary" />
                  <h2 className="text-lg font-bold text-foreground">
                    Connected Academic & Skill Pathways
                  </h2>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {optionList.map((opt, idx) => (
                  <Card key={idx} className="border-border/60 bg-card/75 p-4 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <Badge variant="secondary" className="text-[10px] uppercase font-semibold">
                          {opt.kind}
                        </Badge>
                      </div>
                      <h4 className="font-bold text-sm text-foreground">{opt.title}</h4>
                      <p className="mt-1.5 text-xs text-muted-foreground leading-relaxed">
                        {opt.description}
                      </p>
                    </div>
                    {opt.next_steps && opt.next_steps.length > 0 && (
                      <div className="mt-3 pt-2.5 border-t border-border/40 text-[11px] text-primary font-medium">
                        Next milestone: {opt.next_steps[0]}
                      </div>
                    )}
                  </Card>
                ))}
              </div>
            </section>

            {/* ─── 3. Dynamic What-If Scenarios ─── */}
            <section>
              <Card className="border-border/60 bg-card/80">
                <CardHeader className="pb-3 border-b border-border/50">
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2 text-base font-bold">
                      <Lightbulb className="size-5 text-primary" />
                      Dynamic What-If Scenarios & Question Tool
                    </CardTitle>
                    <span className="ai-badge">AI Assistant</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Simulate alternative outcomes if you miss a cutoff, decide to switch disciplines, or want to explore another domain.
                  </p>
                </CardHeader>
                <CardContent className="p-6 space-y-5">
                  {whatIfScenarios.length > 0 ? (
                    <div className="space-y-3">
                      <Select
                        value={String(scenarioIndex)}
                        onValueChange={(val) => setScenarioIndex(Number(val))}
                      >
                        <SelectTrigger className="text-xs bg-background">
                          <SelectValue placeholder="Select a scenario to inspect" />
                        </SelectTrigger>
                        <SelectContent>
                          {whatIfScenarios.map((item, idx) => (
                            <SelectItem key={idx} value={String(idx)} className="text-xs">
                              {item.question}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      {(() => {
                        const activeWhatIf = whatIfScenarios[scenarioIndex] ?? whatIfScenarios[0];
                        if (!activeWhatIf) return null;
                        return (
                          <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 text-xs space-y-2">
                            <p className="font-bold text-foreground text-sm">{activeWhatIf.question}</p>
                            <p className="leading-relaxed text-muted-foreground">{activeWhatIf.answer}</p>
                            {activeWhatIf.alternatives && activeWhatIf.alternatives.length > 0 && (
                              <div className="mt-3 pt-3 border-t border-border/40">
                                <p className="font-semibold text-foreground mb-1.5">Actionable Alternatives:</p>
                                <ul className="space-y-1.5 text-muted-foreground">
                                  {activeWhatIf.alternatives.map((alt, i) => (
                                    <li key={i} className="flex items-center gap-1.5">
                                      <ArrowRight className="size-3 text-primary shrink-0" />
                                      <span>{alt}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                        );
                      })()}
                    </div>
                  ) : (
                    <div className="rounded-xl bg-muted/40 p-4 text-xs text-muted-foreground">
                      No custom What-If scenarios asked yet. Ask a specific scenario question below!
                    </div>
                  )}

                  {/* Ask Question Form */}
                  <div className="pt-2 border-t border-border/40">
                    <label className="mb-2 block text-xs font-semibold text-foreground">
                      Ask your own What-If question (e.g. &quot;What if I miss the JEE Advanced cutoff?&quot;)
                    </label>
                    <form onSubmit={handleAskCustomQuestion} className="flex gap-2">
                      <Input
                        placeholder="e.g. What if I want to switch to Finance or Data Science later?"
                        value={customQuestion}
                        onChange={(e) => setCustomQuestion(e.target.value)}
                        disabled={askingQuestion}
                        className="text-xs bg-background"
                      />
                      <Button
                        type="submit"
                        size="sm"
                        disabled={askingQuestion || !customQuestion.trim()}
                        className="gap-1.5 shrink-0 text-xs font-semibold ai-button hover:text-white"
                      >
                        {askingQuestion ? (
                          <Loader2 className="size-3.5 animate-spin" />
                        ) : (
                          <Sparkles className="size-3.5 text-violet-200" />
                        )}
                        Ask AI
                      </Button>
                    </form>
                  </div>
                </CardContent>
              </Card>
            </section>

            {/* ─── 4. Entrance Exam Connections & Pivot Alternatives ─── */}
            <section>
              <Card className="border-border/60 bg-card/80">
                <CardHeader className="pb-3 border-b border-border/50">
                  <div className="flex items-center gap-2">
                    <Link2 className="size-5 text-primary" />
                    <CardTitle className="text-base font-bold">
                      Entrance Exam Fallback & Parallel Opportunities
                    </CardTitle>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Exams with overlapping syllabi that can serve as reliable backup entry points.
                  </p>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {resolvedExamConnections.map((conn, idx) => (
                      <div key={idx} className="rounded-xl border border-border/60 bg-card/60 p-4 text-xs">
                        <Badge variant="outline" className="mb-2 text-[10px] border-primary/30 text-primary">
                          Primary: {conn.exam}
                        </Badge>
                        <p className="font-semibold text-foreground mt-1">
                          Parallel Exams: {Array.isArray(conn.connected_exams) ? conn.connected_exams.join(", ") : conn.connected_exams}
                        </p>
                        <p className="mt-2 text-muted-foreground leading-relaxed text-[11px]">
                          {conn.note}
                        </p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </section>
          </div>
        )}

        {/* Modal for viewing Backup Roadmap Details */}
        <PathDetailModal
          rec={selectedDetailRec}
          open={detailModalOpen}
          onOpenChange={setDetailModalOpen}
          optionPaths={optionList}
          backupPaths={backupList}
          examConnections={resolvedExamConnections}
        />
      </main>
    </div>
  );
}

