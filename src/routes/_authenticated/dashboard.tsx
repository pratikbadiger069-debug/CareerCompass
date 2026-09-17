import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  AlertCircle,
  ArrowRight,
  BarChart3,
  BookOpen,
  CheckCircle,
  Compass,
  DollarSign,
  GraduationCap,
  Lightbulb,
  Link2,
  Loader2,
  Map as MapIcon,
  Route as RouteIcon,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  User,
  Zap,
} from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import { useAuth } from "@/hooks/useAuth";
import { usePrefersReducedMotion } from "@/hooks/use-reduced-motion";
import { HeaderNav } from "@/components/HeaderNav";
import {
  PathDetailModal,
  type OptionPath,
  type BackupPath,
  type PathDetailRec,
} from "@/components/PathDetailModal";
import { sendChatMessage } from "@/lib/chat.functions";
import { getStaggerContainer, getFadeUp, getCardHover } from "@/lib/motion";
import { RevealOnScroll } from "@/components/motion/RevealOnScroll";
import { generateCareerRoadmap } from "@/lib/geminiApi";
import {
  CAREER_PATHS,
  EXAM_CONNECTIONS,
  STREAM_VALUE_TO_PATH,
  type StreamPath,
} from "@/lib/careerCompass.paths";
import { motion, type Variants } from "framer-motion";

type Recommendation = Tables<"career_recommendations">;
type Milestone = Tables<"roadmap_milestones">;
type UserProfile = Tables<"user_profiles">;
type Status = "idle" | "loading" | "ready" | "error";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({
    meta: [
      { title: "CareerCompass — Your Career Map" },
      {
        name: "description",
        content: "Explore career options, backup paths, what-if scenarios and exam connections.",
      },
      { property: "og:title", content: "CareerCompass — Your Career Map" },
      {
        property: "og:description",
        content: "Explore career options, backup paths, what-if scenarios and exam connections.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const { user, isGuest } = useAuth();
  const navigate = useNavigate();
  const prefersReduced = usePrefersReducedMotion();

  const stagger = getStaggerContainer(prefersReduced);
  const fadeUp = getFadeUp(prefersReduced);
  const cardHover = getCardHover(prefersReduced);

  // --- Static "Explore by stream" state (existing) ---
  const [stream, setStream] = useState("science_pcm");
  const [scenarioIndex, setScenarioIndex] = useState(0);

  // --- AI recommendation state ---
  const [status, setStatus] = useState<Status>("idle");
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [selectedRecId, setSelectedRecId] = useState<string | null>(null);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [extraContext, setExtraContext] = useState("");
  const [error, setError] = useState<string | null>(null);

  // Detail Modal & Dynamic AI Sections State
  const [selectedDetailRec, setSelectedDetailRec] = useState<PathDetailRec | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);

  const [aiOptionPaths, setAiOptionPaths] = useState<OptionPath[]>([]);
  const [aiBackupPaths, setAiBackupPaths] = useState<BackupPath[]>([]);
  const [whatIfScenarios, setWhatIfScenarios] = useState<Array<{ question: string; answer: string; alternatives: string[] }>>([]);
  const [examConnections, setExamConnections] = useState<Array<{ exam: string; connected_exams: string[]; note: string }>>([]);
  const [nextSteps, setNextSteps] = useState<string[]>([]);

  const [customQuestion, setCustomQuestion] = useState("");
  const [askingQuestion, setAskingQuestion] = useState(false);

  const path = useMemo<StreamPath>(() => {
    const id = STREAM_VALUE_TO_PATH[stream] ?? "mpc";
    return CAREER_PATHS.find((item) => item.id === id) ?? CAREER_PATHS[0]!;
  }, [stream]);

  const scenario = path.whatIf[scenarioIndex] ?? path.whatIf[0];

  const applyAiPayload = useCallback((payload: any) => {
    if (!payload) return;
    if (Array.isArray(payload.option_paths)) setAiOptionPaths(payload.option_paths);
    if (Array.isArray(payload.backup_paths)) setAiBackupPaths(payload.backup_paths);
    if (Array.isArray(payload.what_if)) setWhatIfScenarios(payload.what_if);
    if (Array.isArray(payload.exam_connections)) setExamConnections(payload.exam_connections);
    if (Array.isArray(payload.next_steps)) setNextSteps(payload.next_steps);
  }, []);

  const handleAskCustomQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customQuestion.trim() || askingQuestion) return;
    const q = customQuestion.trim();
    setAskingQuestion(true);
    setCustomQuestion("");

    try {
      const res = await sendChatMessage({
        data: { message: `What-If Scenario Question: ${q}` },
      });
      const newScenario = {
        question: q,
        answer: res.reply || "No response received.",
        alternatives: [],
      };
      setWhatIfScenarios((prev) => [...prev, newScenario]);
      toast.success("What-If answer generated!");
    } catch (err) {
      console.error("Error asking custom question:", err);
      toast.error("Failed to answer question. Please try again.");
    } finally {
      setAskingQuestion(false);
    }
  };

  // --- Core fetch-or-generate logic ---
  const loadRecommendations = useCallback(
    async (forceRegenerate = false) => {
      if (!user || isGuest) return;

      setStatus("loading");
      setError(null);

      try {
        // Load the profile first so saved context is available on every visit.
        const { data: profile, error: profileError } = await supabase
          .from("user_profiles")
          .select("*")
          .eq("user_id", user.id)
          .single();

        if (profileError) throw new Error(`Could not load your profile: ${profileError.message}`);
        setUserProfile(profile);
        setExtraContext(profile.extra_context ?? "");

        // Keep existing results unless this is an explicit manual regeneration.
        const { data: existing, error: fetchError } = await supabase
          .from("career_recommendations")
          .select("*")
          .eq("user_id", user.id);

        if (fetchError) throw new Error(fetchError.message);

        const cacheKey = `career_compass_full_${user.id}`;

        if (!forceRegenerate && existing && existing.length > 0) {
          const cachedStr = typeof window !== "undefined" ? localStorage.getItem(cacheKey) : null;
          if (cachedStr) {
            try {
              const cachedPayload = JSON.parse(cachedStr);
              applyAiPayload(cachedPayload);
              const cachedRecs = cachedPayload.recommendations as any[] | undefined;
              if (cachedRecs && cachedRecs.length > 0) {
                const merged = existing.map((r, i) => ({
                  ...r,
                  honest_challenges: cachedRecs[i]?.honest_challenges ?? null,
                  day_in_life: cachedRecs[i]?.day_in_life ?? null,
                  colleges: cachedRecs[i]?.colleges ?? [],
                }));
                setRecommendations(merged);
              } else {
                setRecommendations(existing);
              }
            } catch {
              setRecommendations(existing);
            }
          } else {
            setRecommendations(existing);
          }

          setSelectedRecId(existing[0]?.id ?? null);
          const recIds = existing.map((r) => r.id);
          const { data: savedMilestones } = await supabase
            .from("roadmap_milestones")
            .select("*")
            .in("recommendation_id", recIds)
            .order("order_index", { ascending: true });
          setMilestones(savedMilestones ?? []);
          setStatus("ready");
          return;
        }

        const contextForRoadmap = forceRegenerate
          ? extraContext.trim()
          : (profile.extra_context ?? "");
        const profileForRoadmap = { ...profile, extra_context: contextForRoadmap };

        if (forceRegenerate) {
          const { error: profileUpdateError } = await supabase
            .from("user_profiles")
            .update({ extra_context: contextForRoadmap || null })
            .eq("user_id", user.id);
          if (profileUpdateError)
            throw new Error(`Failed to save your context: ${profileUpdateError.message}`);

          const { error: milestonesDeleteError } = await supabase
            .from("roadmap_milestones")
            .delete()
            .eq("user_id", user.id);
          if (milestonesDeleteError)
            throw new Error(`Failed to clear the old roadmap: ${milestonesDeleteError.message}`);

          const { error: recommendationsDeleteError } = await supabase
            .from("career_recommendations")
            .delete()
            .eq("user_id", user.id);
          if (recommendationsDeleteError)
            throw new Error(
              `Failed to clear old recommendations: ${recommendationsDeleteError.message}`,
            );
        }

        const aiResult = await generateCareerRoadmap(profileForRoadmap as Record<string, unknown>);

        applyAiPayload(aiResult);
        if (typeof window !== "undefined") {
          localStorage.setItem(cacheKey, JSON.stringify(aiResult));
        }

        const aiRecs = (aiResult as Record<string, unknown>)["recommendations"] as
          | Array<{
              title: string;
              why: string;
              match_score: number;
              salary_range: string;
              demand_outlook: string;
              required_skills: string[];
              honest_challenges?: string;
              day_in_life?: string;
              colleges?: Array<{
                name: string;
                course: string;
                city: string;
                fees_total: string;
                entrance: string;
                why: string;
              }>;
            }>
          | undefined;

        if (!aiRecs || aiRecs.length === 0) throw new Error("AI returned no recommendations.");

        const recsToInsert = aiRecs.map((rec) => ({
          user_id: user.id,
          career_title: rec.title,
          description: rec.why,
          // The database stores match_score as an integer, while the model may
          // return a decimal such as 9.5. Normalize it before inserting.
          match_score: Number.isFinite(rec.match_score)
            ? Math.round(Math.max(0, Math.min(100, rec.match_score)))
            : null,
          salary_range: rec.salary_range,
          growth_outlook: rec.demand_outlook,
          required_skills: rec.required_skills ?? [],
        }));

        const { data: insertedRecs, error: insertError } = await supabase
          .from("career_recommendations")
          .insert(recsToInsert)
          .select();

        if (insertError) throw new Error(`Failed to save recommendations: ${insertError.message}`);
        if (!insertedRecs) throw new Error("No recommendations returned after insert.");

        const aiRoadmap = (aiResult as Record<string, unknown>)["roadmap"] as
          | Array<{
              phase: string;
              timeframe: string;
              milestones: Array<{ title: string; description: string; resources?: string[] }>;
            }>
          | undefined;

        if (aiRoadmap && aiRoadmap.length > 0) {
          const milestonesToInsert: Array<{
            user_id: string;
            recommendation_id: string;
            title: string;
            description: string;
            order_index: number;
            category: string;
          }> = [];

          aiRoadmap.forEach((phase, phaseIndex) => {
            const linkedRec = insertedRecs[Math.min(phaseIndex, insertedRecs.length - 1)];
            if (!linkedRec) return;
            phase.milestones.forEach((milestone, milestoneIndex) => {
              milestonesToInsert.push({
                user_id: user.id,
                recommendation_id: linkedRec.id,
                title: milestone.title,
                description: milestone.description ?? "",
                order_index: phaseIndex * 100 + milestoneIndex,
                category: phase.phase ?? "general",
              });
            });
          });

          if (milestonesToInsert.length > 0) {
            await supabase.from("roadmap_milestones").insert(milestonesToInsert);
          }
        }

        const { data: finalRecs } = await supabase
          .from("career_recommendations")
          .select("*")
          .eq("user_id", user.id);

        const recsToUse = finalRecs ?? insertedRecs;
        const mergedFinalRecs = recsToUse.map((r, i) => ({
          ...r,
          honest_challenges: aiRecs[i]?.honest_challenges ?? null,
          day_in_life: aiRecs[i]?.day_in_life ?? null,
          colleges: aiRecs[i]?.colleges ?? [],
        }));
        setRecommendations(mergedFinalRecs);

        const finalRecIds = recsToUse.map((r) => r.id);
        const { data: finalMilestones } = await supabase
          .from("roadmap_milestones")
          .select("*")
          .in("recommendation_id", finalRecIds)
          .order("order_index", { ascending: true });
        setMilestones(finalMilestones ?? []);

        setStatus("ready");
      } catch (err) {
        console.error("[Dashboard] loadRecommendations failed:", err);
        setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
        setStatus("error");
      }
    },
    [user, isGuest, applyAiPayload],
  );

  useEffect(() => {
    if (user && !isGuest && status === "idle") {
      loadRecommendations();
    }
  }, [user, isGuest, status, loadRecommendations]);

  async function signOut(): Promise<void> {
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  // Group milestones by recommendation_id for rendering
  const milestonesByRec = useMemo(() => {
    const map = new Map<string, Milestone[]>();
    for (const m of milestones) {
      if (!m.recommendation_id) continue;
      const list = map.get(m.recommendation_id) ?? [];
      list.push(m);
      map.set(m.recommendation_id, list);
    }
    return map;
  }, [milestones]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <HeaderNav />

      <main className="mx-auto w-full max-w-6xl px-6 py-8">
        {/* ─── Profile Status & Welcome Banner ─── */}
        <section className="mb-8 overflow-hidden rounded-2xl border border-primary/20 bg-gradient-to-r from-primary/10 via-primary/5 to-background p-6 shadow-sm">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary/20 text-primary font-bold">
                <User className="size-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-bold tracking-tight">
                    {isGuest ? "Welcome to CareerCompass" : `Welcome back, ${userProfile?.full_name || user?.email?.split("@")[0] || "Student"}!`}
                  </h1>
                  <Badge variant="secondary" className="bg-primary/15 text-primary text-xs font-semibold">
                    {userProfile?.education_stage ? userProfile.education_stage.replace("_", " ").toUpperCase() : "Onboarded"}
                  </Badge>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  {userProfile?.stream ? `Stream: ${userProfile.stream} • Goal: ${userProfile.goal_type || userProfile.career_goal || "Explore"}` : "AI guidance and career options tailored to your profile."}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-center">
              <Link to="/profile">
                <Button size="sm" className="gap-2 shadow-sm">
                  <User className="size-4" />
                  Profile Details & Settings
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* ─── 1. AI-Powered Recommendations (FIRST SECTION BELOW WELCOME BANNER) ─── */}
        <section className="mb-10 rounded-2xl border border-primary/20 bg-card/80 p-6 shadow-sm">
          <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/20 text-primary">
                <Sparkles className="size-5" />
              </div>
              <div>
                <h2 className="text-xl font-bold tracking-tight">AI-Powered Career Recommendations</h2>
                <p className="text-xs text-muted-foreground">
                  Personalized career paths generated based on your profile, marks, and interests.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Link to="/roadmap" search={{ rec: undefined }}>
                <Button variant="outline" size="sm" className="gap-1.5 text-xs border-primary/30 hover:bg-primary/10">
                  <MapIcon className="size-3.5 text-primary" /> Generate / View Full Roadmap
                </Button>
              </Link>
            </div>
          </div>

          {!isGuest ? (
            <>
              {/* Extra context prompt & Generate/Regenerate AI Roadmap button */}
              <div className="mb-6 flex flex-col gap-4 rounded-xl border border-border/60 bg-secondary/30 p-4 sm:flex-row sm:items-end">
                <div className="min-w-0 flex-1">
                  <label htmlFor="extra-context" className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Provide Additional Context or Interests
                  </label>
                  <Textarea
                    id="extra-context"
                    value={extraContext}
                    onChange={(event) => setExtraContext(event.target.value)}
                    maxLength={500}
                    disabled={status === "loading"}
                    placeholder="E.g. I prefer software engineering over hardware, want remote work options, or prefer colleges in Mumbai/Bengaluru..."
                    className="min-h-20 resize-y text-xs bg-background/80"
                  />
                  <p className="mt-1 text-right text-[11px] text-muted-foreground">
                    {extraContext.length}/500
                  </p>
                </div>
                <Button
                  type="button"
                  onClick={() => void loadRecommendations(true)}
                  disabled={status === "loading"}
                  className="shrink-0 gap-2 font-semibold shadow-md"
                >
                  {status === "loading" ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <Sparkles className="size-4 text-amber-300" />
                  )}
                  {recommendations.length > 0 ? "Regenerate AI Roadmap" : "Generate AI Roadmap"}
                </Button>
              </div>

              {/* Loading skeleton */}
              {status === "loading" && <LoadingSkeleton prefersReduced={prefersReduced} />}

              {/* Error state */}
              {status === "error" && (
                <Alert variant="destructive" className="mb-6">
                  <AlertCircle className="size-4" />
                  <AlertTitle>Failed to load recommendations</AlertTitle>
                  <AlertDescription className="mt-2 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <span>{error}</span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setStatus("idle");
                      }}
                      className="shrink-0 gap-2"
                    >
                      <Loader2 className="size-4" />
                      Retry
                    </Button>
                  </AlertDescription>
                </Alert>
              )}

              {/* Recommendations grid */}
              {status === "ready" && recommendations.length > 0 && (
                <>
                  <motion.div
                    variants={stagger}
                    initial="hidden"
                    animate="visible"
                    className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
                  >
                    {recommendations.map((rec) => (
                      <div
                        key={rec.id}
                        onClick={() => {
                          setSelectedRecId(rec.id);
                          setSelectedDetailRec(rec);
                          setDetailModalOpen(true);
                        }}
                        className={`cursor-pointer rounded-2xl transition-all ${
                          (selectedRecId ?? recommendations[0]?.id) === rec.id
                            ? "ring-2 ring-primary ring-offset-2 ring-offset-background"
                            : ""
                        }`}
                      >
                        <RecommendationCard
                          rec={rec}
                          milestones={milestonesByRec.get(rec.id) ?? []}
                          variants={fadeUp}
                          cardHoverProps={cardHover}
                        />
                      </div>
                    ))}
                  </motion.div>

                  {/* Path Detail Modal */}
                  <PathDetailModal
                    rec={selectedDetailRec}
                    optionPaths={aiOptionPaths}
                    backupPaths={aiBackupPaths}
                    open={detailModalOpen}
                    onOpenChange={setDetailModalOpen}
                  />

                  {/* Skill Gap Tracker for selected recommendation */}
                  {(() => {
                    const selectedRec =
                      recommendations.find((r) => r.id === (selectedRecId ?? recommendations[0]?.id)) ??
                      recommendations[0];
                    if (!selectedRec) return null;
                    return (
                      <SkillGapTracker
                        rec={selectedRec}
                        userSkills={userProfile?.current_skills ?? []}
                      />
                    );
                  })()}
                </>
              )}

              {status === "ready" && recommendations.length === 0 && (
                <Card className="border-border/60 bg-card/70">
                  <CardContent className="p-6 text-center text-muted-foreground">
                    <Sparkles className="mx-auto mb-3 size-8 text-primary/50" />
                    <p className="font-medium text-foreground">No recommendations generated yet</p>
                    <p className="mt-1 text-xs">
                      Click <span className="font-semibold text-primary">"Generate AI Roadmap"</span> above to create your personalized recommendations.
                    </p>
                  </CardContent>
                </Card>
              )}
            </>
          ) : (
            <div className="rounded-xl border border-dashed border-primary/30 bg-primary/5 p-6 text-center">
              <Sparkles className="mx-auto mb-3 size-8 text-primary" />
              <h3 className="font-bold text-base">Sign In to Unlock Personalized AI Recommendations</h3>
              <p className="mt-1 text-xs text-muted-foreground max-w-md mx-auto">
                Create an account or sign in to get tailored career recommendations, custom skill gap tracking, and college matching.
              </p>
              <div className="mt-4 flex justify-center gap-3">
                <Link to="/auth">
                  <Button size="sm" className="gap-2">
                    <User className="size-4" /> Sign In / Create Account
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </section>

        {/* ─── 2. Aligned Feature Hub Cards (4 Quick Action Cards) ─── */}
        <section className="mb-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Link to="/roadmap" search={{ rec: undefined }}>
            <Card className="group h-full border-border/60 bg-card/70 transition-all hover:border-primary/50 hover:bg-card hover:shadow-md">
              <CardContent className="flex flex-col justify-between p-5 h-full">
                <div>
                  <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 text-blue-500">
                    <MapIcon className="size-5" />
                  </div>
                  <h3 className="font-bold text-base group-hover:text-primary transition-colors">AI Roadmap</h3>
                  <p className="mt-1 text-xs text-muted-foreground leading-relaxed">Step-by-step milestones tailored to your career goal.</p>
                </div>
                <div className="mt-4 flex items-center gap-1 text-xs font-semibold text-primary">
                  View Roadmap <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-1" />
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link to="/colleges">
            <Card className="group h-full border-border/60 bg-card/70 transition-all hover:border-primary/50 hover:bg-card hover:shadow-md">
              <CardContent className="flex flex-col justify-between p-5 h-full">
                <div>
                  <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-purple-500/10 text-purple-500">
                    <GraduationCap className="size-5" />
                  </div>
                  <h3 className="font-bold text-base group-hover:text-primary transition-colors">College Explorer</h3>
                  <p className="mt-1 text-xs text-muted-foreground leading-relaxed">Match top universities based on marks, stream & budget.</p>
                </div>
                <div className="mt-4 flex items-center gap-1 text-xs font-semibold text-primary">
                  Explore Colleges <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-1" />
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link to="/compare">
            <Card className="group h-full border-border/60 bg-card/70 transition-all hover:border-primary/50 hover:bg-card hover:shadow-md">
              <CardContent className="flex flex-col justify-between p-5 h-full">
                <div>
                  <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-500">
                    <BarChart3 className="size-5" />
                  </div>
                  <h3 className="font-bold text-base group-hover:text-primary transition-colors">College Comparer</h3>
                  <p className="mt-1 text-xs text-muted-foreground leading-relaxed">Compare fees, entrance exams and ratings side by side.</p>
                </div>
                <div className="mt-4 flex items-center gap-1 text-xs font-semibold text-primary">
                  Compare Now <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-1" />
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link to="/profile">
            <Card className="group h-full border-border/60 bg-card/70 transition-all hover:border-primary/50 hover:bg-card hover:shadow-md">
              <CardContent className="flex flex-col justify-between p-5 h-full">
                <div>
                  <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-500">
                    <User className="size-5" />
                  </div>
                  <h3 className="font-bold text-base group-hover:text-primary transition-colors">My Profile & Skills</h3>
                  <p className="mt-1 text-xs text-muted-foreground leading-relaxed">Edit your 5 onboarding details & acquired skills.</p>
                </div>
                <div className="mt-4 flex items-center gap-1 text-xs font-semibold text-primary">
                  Edit Profile <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-1" />
                </div>
              </CardContent>
            </Card>
          </Link>
        </section>

        {/* ─── 3. Backup & Fallback Options (WITH "CHECK BACKUP ROADMAP" BUTTON) ─── */}
        <section className="mb-10">
          <Card className="border-border/60 bg-card/70 shadow-sm">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-lg font-bold">
                  <ShieldCheck className="size-5 text-emerald-500" />
                  Backup & Fallback Career Plans
                </CardTitle>
                <Badge variant="outline" className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 text-xs font-semibold">
                  Risk Mitigation
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">
                Secondary pathways to ensure long-term career security if primary entrance exams or goals change.
              </p>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {(aiBackupPaths.length > 0
                  ? aiBackupPaths
                  : path.backups.map(b => ({ title: b.title, description: b.description, why_it_works: b.whyItWorks }))
                ).map((backup, idx) => (
                  <div key={idx} className="flex flex-col justify-between rounded-xl border border-border/60 bg-card/60 p-4 text-xs hover:border-primary/40 transition-colors">
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <p className="font-bold text-sm text-foreground">{backup.title}</p>
                        <Badge variant="secondary" className="text-[10px] bg-primary/10 text-primary border-primary/20 shrink-0">
                          Backup Path
                        </Badge>
                      </div>
                      <p className="text-muted-foreground leading-relaxed">{backup.description}</p>
                      <p className="mt-2 text-primary font-medium">Why it works: {backup.why_it_works}</p>
                    </div>

                    <div className="mt-4 flex items-center gap-2 pt-3 border-t border-border/40">
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full text-xs gap-1.5 h-8 border-primary/30 hover:bg-primary/10 hover:text-primary font-medium"
                        onClick={() => {
                          const backupRec: PathDetailRec = {
                            career_title: backup.title,
                            description: backup.description,
                            why_it_works: backup.why_it_works,
                            match_score: 80,
                            salary_range: "Flexible / High Demand",
                            growth_outlook: "Stable Backup Option",
                            required_skills: ["Transferable Skills", "Core Fundamentals"],
                            honest_challenges: "May require complementary certifications or entrance exam pivot.",
                            day_in_life: "Focuses on high-impact domain responsibilities with flexible entry points."
                          };
                          setSelectedDetailRec(backupRec);
                          setDetailModalOpen(true);
                        }}
                      >
                        <MapIcon className="size-3.5 text-primary" />
                        Check Backup Roadmap
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </section>

        {/* ─── 4. Stream Pathways & Dynamic What-If Scenarios ─── */}
        <section className="mb-10">
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Compass className="size-5 text-primary" />
              <h2 className="text-xl font-bold">
                {userProfile?.stream ? `Stream Pathways for ${userProfile.stream}` : "Stream Pathways & Alternatives"}
              </h2>
            </div>
            <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 text-xs">
              {userProfile?.education_stage ? userProfile.education_stage.replace("_", " ").toUpperCase() : "Active Stream"}
            </Badge>
          </div>

          {/* 2-Column Grid: AI Option Paths & Dynamic What-If Scenarios */}
          <div className="grid gap-6 lg:grid-cols-2">
            {/* AI Option Paths */}
            <Card className="border-border/60 bg-card/70">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base font-bold">
                  <GraduationCap className="size-5 text-primary" />
                  {userProfile?.education_stage === "class_10" || userProfile?.education_stage === "class_12"
                    ? "Stream & Junior College Pathways"
                    : "Target Academic & Skill Pathways"}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {(aiOptionPaths.length > 0 ? aiOptionPaths : path.options).map((option, idx) => (
                  <div key={idx} className="rounded-xl border border-border/60 bg-card/60 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-bold text-xs text-foreground">{option.title}</p>
                        <p className="mt-1 text-xs text-muted-foreground leading-relaxed">{option.description}</p>
                      </div>
                      <Badge variant="secondary" className="shrink-0 text-[10px] uppercase font-semibold">
                        {option.kind}
                      </Badge>
                    </div>
                    {((option as any).next_steps || (option as any).nextSteps) && (
                      <p className="mt-3 text-xs font-semibold text-primary">
                        Next step: {((option as any).next_steps || (option as any).nextSteps)[0]}
                      </p>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Dynamic What-If Scenarios & Ask Custom Question */}
            <Card className="border-border/60 bg-card/70">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base font-bold">
                  <Lightbulb className="size-5 text-primary" />
                  Dynamic What-If Scenarios
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {whatIfScenarios.length > 0 ? (
                  <div className="space-y-3">
                    <Select
                      value={String(scenarioIndex)}
                      onValueChange={(value) => setScenarioIndex(Number(value))}
                    >
                      <SelectTrigger className="text-xs">
                        <SelectValue placeholder="Select a scenario" />
                      </SelectTrigger>
                      <SelectContent>
                        {whatIfScenarios.map((item, index) => (
                          <SelectItem key={index} value={String(index)} className="text-xs">
                            {item.question}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    {(() => {
                      const currentWhatIf = whatIfScenarios[scenarioIndex] ?? whatIfScenarios[0];
                      if (!currentWhatIf) return null;
                      return (
                        <div className="rounded-xl bg-secondary/50 p-4 text-xs">
                          <p className="font-bold text-foreground mb-1">{currentWhatIf.question}</p>
                          <p className="leading-relaxed text-muted-foreground">{currentWhatIf.answer}</p>
                          {currentWhatIf.alternatives && currentWhatIf.alternatives.length > 0 && (
                            <div className="mt-3 pt-3 border-t border-border/40">
                              <p className="font-semibold text-foreground mb-1">Alternative Next Paths:</p>
                              <ul className="space-y-1 text-muted-foreground">
                                {currentWhatIf.alternatives.map((alt, i) => (
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
                  <div className="rounded-xl bg-secondary/50 p-4 text-xs text-muted-foreground">
                    No What-If scenarios generated yet. Ask your question below!
                  </div>
                )}

                {/* Custom What-If Question Input */}
                <div className="border-t border-border/50 pt-4">
                  <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Ask Your Own What-If Question
                  </label>
                  <form onSubmit={handleAskCustomQuestion} className="flex gap-2">
                    <Input
                      placeholder="e.g. What if I want to switch to Data Science in year 2?"
                      value={customQuestion}
                      onChange={(e) => setCustomQuestion(e.target.value)}
                      disabled={askingQuestion}
                      className="text-xs"
                    />
                    <Button
                      type="submit"
                      size="sm"
                      disabled={askingQuestion || !customQuestion.trim()}
                      className="gap-1.5 shrink-0 text-xs font-medium"
                    >
                      {askingQuestion ? (
                        <Loader2 className="size-3.5 animate-spin" />
                      ) : (
                        <Sparkles className="size-3.5 text-amber-300" />
                      )}
                      Ask
                    </Button>
                  </form>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* ─── 5. Stream Entrance Exam Connections & Actionable Next Steps ─── */}
        <section className="mb-10 grid gap-6 lg:grid-cols-2">
          {/* Stream-Specific Exam Connections */}
          <Card className="border-border/60 bg-card/70">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base font-bold">
                <Link2 className="size-5 text-primary" />
                Stream Entrance Exam Connections
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {(examConnections.length > 0
                ? examConnections
                : EXAM_CONNECTIONS.map(c => ({ exam: c.exam, connected_exams: c.connectedExams, note: c.note }))
              ).map((connection, idx) => (
                <div key={idx} className="rounded-xl border border-border/60 bg-card/60 p-4 text-xs">
                  <p className="font-bold text-foreground">{connection.exam}</p>
                  <p className="mt-1 text-muted-foreground">
                    Connected exams: {Array.isArray(connection.connected_exams) ? connection.connected_exams.join(", ") : connection.connected_exams}
                  </p>
                  <p className="mt-2 text-primary font-medium">{connection.note}</p>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Actionable Next Steps */}
          <Card className="border-primary/20 bg-primary/5">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base font-bold">
                <Sparkles className="size-5 text-primary" />
                Actionable Immediate Next Steps
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 pt-0">
              {nextSteps.length > 0 ? (
                <ul className="space-y-2.5">
                  {nextSteps.map((stepItem, idx) => (
                    <li key={idx} className="flex items-start gap-3 rounded-xl border border-primary/20 bg-background/80 p-3 text-xs">
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/20 text-[11px] font-bold text-primary">
                        {idx + 1}
                      </span>
                      <span className="mt-0.5 font-medium text-foreground">{stepItem}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-xs text-muted-foreground leading-relaxed">{path.summary}</p>
              )}
            </CardContent>
          </Card>
        </section>
    </main>
    </div>
  );
}

/* ─── Recommendation Card ─── */
const MotionCard = motion.create(Card);

function RecommendationCard({
  rec,
  milestones,
  variants,
  cardHoverProps,
}: {
  rec: Recommendation;
  milestones: Milestone[];
  variants: Variants;
  cardHoverProps?: ReturnType<typeof getCardHover>;
}) {
  const scoreColor =
    (rec.match_score ?? 0) >= 80
      ? "text-emerald-500"
      : (rec.match_score ?? 0) >= 60
        ? "text-amber-500"
        : "text-red-400";

  return (
    <MotionCard
      variants={variants}
      {...cardHoverProps}
      className="group flex flex-col justify-between border-border/60 bg-card/70"
    >
      <div>
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-2">
            <CardTitle className="text-base leading-snug">{rec.career_title}</CardTitle>
            {rec.match_score != null && (
              <Badge variant="secondary" className={`shrink-0 font-bold ${scoreColor}`}>
                {rec.match_score}%
              </Badge>
            )}
          </div>
          {rec.match_score != null && <Progress value={rec.match_score} className="mt-2 h-1.5" />}
        </CardHeader>
        <CardContent className="space-y-4">
          {rec.description && (
            <p className="text-sm leading-relaxed text-muted-foreground">{rec.description}</p>
          )}

          {/* Metadata badges */}
          <div className="flex flex-wrap gap-2">
            {rec.salary_range && (
              <Badge variant="outline" className="gap-1 text-xs font-normal">
                <DollarSign className="size-3" /> {rec.salary_range}
              </Badge>
            )}
            {rec.growth_outlook && (
              <Badge variant="outline" className="gap-1 text-xs font-normal">
                <TrendingUp className="size-3" /> {rec.growth_outlook}
              </Badge>
            )}
          </div>

          {/* Skills */}
          {rec.required_skills.length > 0 && (
            <div>
              <p className="mb-2 flex items-center gap-1 text-xs font-semibold text-muted-foreground">
                <Zap className="size-3" /> Required Skills
              </p>
              <div className="flex flex-wrap gap-1.5">
                {rec.required_skills.map((skill) => (
                  <Badge key={skill} variant="secondary" className="text-[11px] font-normal">
                    {skill}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Milestones (collapsed preview) */}
          {milestones.length > 0 && (
            <div className="rounded-lg border border-border/40 bg-secondary/30 p-3">
              <p className="mb-2 text-xs font-semibold text-muted-foreground">Roadmap milestones</p>
              <ul className="space-y-1.5">
                {milestones.slice(0, 3).map((m) => (
                  <li key={m.id} className="flex items-start gap-2 text-xs">
                    <span className="mt-0.5 size-1.5 shrink-0 rounded-full bg-primary" />
                    <span>{m.title}</span>
                  </li>
                ))}
                {milestones.length > 3 && (
                  <li className="text-xs text-muted-foreground">+{milestones.length - 3} more</li>
                )}
              </ul>
            </div>
          )}
        </CardContent>
      </div>

      <CardContent className="pt-0">
        {/* View Roadmap button */}
        <Button asChild variant="outline" size="sm" className="w-full gap-2">
          <Link to="/roadmap" search={{ rec: rec.id }}>
            <MapIcon className="size-4" />
            View Roadmap
          </Link>
        </Button>
      </CardContent>
    </MotionCard>
  );
}

/* ─── Loading Skeleton ─── */
function LoadingSkeleton({ prefersReduced }: { prefersReduced: boolean }) {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 rounded-xl border border-primary/20 bg-primary/5 p-4">
        <Loader2 className="size-5 animate-spin text-primary" />
        <div>
          <p className="text-sm font-semibold">Generating your personalised career roadmap…</p>
          <p className="mt-1 text-xs text-muted-foreground">
            This may take 15–30 seconds. We're analysing your profile with AI.
          </p>
        </div>
      </div>
      {prefersReduced ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i} className="border-border/60 bg-card/70">
              <CardHeader className="pb-3">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="mt-2 h-1.5 w-full" />
              </CardHeader>
              <CardContent className="space-y-3">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
                <div className="flex gap-2">
                  <Skeleton className="h-5 w-20 rounded-full" />
                  <Skeleton className="h-5 w-24 rounded-full" />
                </div>
                <div className="flex gap-1.5">
                  <Skeleton className="h-5 w-14 rounded-full" />
                  <Skeleton className="h-5 w-16 rounded-full" />
                  <Skeleton className="h-5 w-12 rounded-full" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0.65 }}
          animate={{ opacity: [0.65, 1, 0.65] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
        >
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i} className="border-border/60 bg-card/70 animate-pulse">
              <CardHeader className="pb-3">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="mt-2 h-1.5 w-full" />
              </CardHeader>
              <CardContent className="space-y-3">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
                <div className="flex gap-2">
                  <Skeleton className="h-5 w-20 rounded-full" />
                  <Skeleton className="h-5 w-24 rounded-full" />
                </div>
                <div className="flex gap-1.5">
                  <Skeleton className="h-5 w-14 rounded-full" />
                  <Skeleton className="h-5 w-16 rounded-full" />
                  <Skeleton className="h-5 w-12 rounded-full" />
                </div>
              </CardContent>
            </Card>
          ))}
        </motion.div>
      )}
    </div>
  );
}

/* ─── Skill Gap Tracker Component ─── */
function SkillGapTracker({ rec, userSkills = [] }: { rec: Recommendation; userSkills: string[] }) {
  const requiredSkills = rec.required_skills ?? [];
  if (requiredSkills.length === 0) return null;

  const normalizedUserSkills = new Set((userSkills ?? []).map((s) => s.trim().toLowerCase()));

  const acquired: string[] = [];
  const missing: string[] = [];

  requiredSkills.forEach((skill) => {
    if (normalizedUserSkills.has(skill.trim().toLowerCase())) {
      acquired.push(skill);
    } else {
      missing.push(skill);
    }
  });

  const highPriorityMissing = missing.slice(0, 2);
  const remainingMissing = missing.slice(2);

  const percentage = Math.round((acquired.length / requiredSkills.length) * 100);

  return (
    <RevealOnScroll className="mt-8">
      <Card className="border-border/60 bg-card/70 shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Zap className="size-5 text-amber-500" />
                Skill Gap Tracker: {rec.career_title}
              </CardTitle>
              <p className="mt-1 text-xs text-muted-foreground">
                Targeting skills for{" "}
                <span className="font-semibold text-foreground">{rec.career_title}</span> against
                your profile skills
              </p>
            </div>
            <div className="text-right sm:text-right">
              <span className="text-2xl font-bold text-primary">{percentage}%</span>
              <p className="text-[11px] font-medium text-muted-foreground">Match Readiness</p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-medium">
              <span>Skill Match Progress</span>
              <span>
                {acquired.length} of {requiredSkills.length} Skills Acquired
              </span>
            </div>
            <Progress value={percentage} className="h-2.5" />
          </div>

          <div className="grid gap-4 sm:grid-cols-3 pt-2">
            {/* Acquired Skills (Green) */}
            <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-3">
              <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                <CheckCircle className="size-3.5" /> Acquired Skills ({(acquired ?? []).length})
              </p>
              <div className="flex flex-wrap gap-1.5">
                {(acquired ?? []).length > 0 ? (
                  (acquired ?? []).map((skill) => (
                    <Badge
                      key={skill}
                      className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/20"
                    >
                      ✓ {skill}
                    </Badge>
                  ))
                ) : (
                  <span className="text-xs text-muted-foreground italic">None matched yet</span>
                )}
              </div>
            </div>

            {/* High Priority Missing (Red) */}
            <div className="rounded-xl border border-rose-500/20 bg-rose-500/5 p-3">
              <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-rose-600 dark:text-rose-400">
                <AlertCircle className="size-3.5" /> High Priority / Missing (
                {(highPriorityMissing ?? []).length})
              </p>
              <div className="flex flex-wrap gap-1.5">
                {(highPriorityMissing ?? []).length > 0 ? (
                  (highPriorityMissing ?? []).map((skill) => (
                    <Badge
                      key={skill}
                      className="bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-500/30 hover:bg-rose-500/20"
                    >
                      ! {skill}
                    </Badge>
                  ))
                ) : (
                  <span className="text-xs text-muted-foreground italic">
                    No high-priority gaps
                  </span>
                )}
              </div>
            </div>

            {/* Skills to Learn (Blue) */}
            <div className="rounded-xl border border-blue-500/20 bg-blue-500/5 p-3">
              <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-blue-600 dark:text-blue-400">
                <BookOpen className="size-3.5" /> Needs to Learn ({(remainingMissing ?? []).length})
              </p>
              <div className="flex flex-wrap gap-1.5">
                {(remainingMissing ?? []).length > 0 ? (
                  (remainingMissing ?? []).map((skill) => (
                    <Badge
                      key={skill}
                      className="bg-blue-500/15 text-blue-700 dark:text-blue-300 border-blue-500/30 hover:bg-blue-500/20"
                    >
                      + {skill}
                    </Badge>
                  ))
                ) : (
                  <span className="text-xs text-muted-foreground italic">No secondary gaps</span>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </RevealOnScroll>
  );
}

/* ─── Map Step Card (existing) ─── */
function MapStep({ icon, title, value }: { icon: ReactNode; title: string; value: string }) {
  return (
    <Card className="border-border/60 bg-card/70">
      <CardContent className="p-4">
        <div className="flex items-center gap-2 text-primary">
          {icon}
          <span className="text-xs font-semibold uppercase tracking-wide">{title}</span>
        </div>
        <p className="mt-2 text-sm font-semibold">{value}</p>
      </CardContent>
    </Card>
  );
}
