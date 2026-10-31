import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  AlertCircle,
  ArrowRight,
  BarChart3,
  BookOpen,
  Check,
  CheckCircle,
  Compass,
  Database,
  DollarSign,
  ExternalLink,
  GraduationCap,
  Lightbulb,
  Link2,
  Loader2,
  MapPin,
  Map as MapIcon,
  Route as RouteIcon,
  ShieldCheck,
  Sparkles,
  Target,
  TrendingUp,
  User,
  Youtube,
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
  getYoutubeResourcesForMilestone,
  getYoutubeResourcesForSkill,
  getDirectYoutubeSearchUrl,
} from "@/lib/youtubeResources";
import {
  EDUCATION_LEVEL_PRESETS,
  getEduStageDetails,
  type SkillPreset,
} from "@/lib/educationSkillsData";
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
import { getUserLocation } from "@/lib/locationData";
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
  const [selectedEduStage, setSelectedEduStage] = useState<string>("class_12");
  const [targetSkillOrInterest, setTargetSkillOrInterest] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  const currentEduPreset = useMemo(() => {
    return getEduStageDetails(selectedEduStage);
  }, [selectedEduStage]);

  const activeTargetSkill = useMemo(() => {
    return (
      targetSkillOrInterest.trim() ||
      userProfile?.career_goal ||
      recommendations[0]?.career_title ||
      ""
    );
  }, [targetSkillOrInterest, userProfile?.career_goal, recommendations]);

  const activeTargetSkillYtResources = useMemo(() => {
    if (!activeTargetSkill) return [];
    return getYoutubeResourcesForSkill(activeTargetSkill);
  }, [activeTargetSkill]);

  const handleSelectSkillPreset = (preset: SkillPreset) => {
    setTargetSkillOrInterest(preset.name);
    setExtraContext(preset.prompt);
    toast.success(`Selected focus: ${preset.name}`);
  };

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
  const [customApiKey, setCustomApiKey] = useState(() => {
    return typeof window !== "undefined"
      ? localStorage.getItem("careercompass_custom_gemini_key") ?? ""
      : "";
  });

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
        if (profile.education_stage) {
          setSelectedEduStage(profile.education_stage);
        }
        if (profile.career_goal || profile.career_goals) {
          setTargetSkillOrInterest(profile.career_goal || profile.career_goals || "");
        }

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

        // Prepare context tailored to selected education level and specified skill/interest
        const stagePreset = getEduStageDetails(selectedEduStage || profile.education_stage);
        const stageLabel = stagePreset.label;

        const contextSegments: string[] = [];
        if (targetSkillOrInterest.trim()) {
          contextSegments.push(`Target Specific Skill / Track Focus: "${targetSkillOrInterest.trim()}"`);
        }
        contextSegments.push(`Education Level: ${stageLabel}`);
        if (extraContext.trim()) {
          contextSegments.push(`User Custom Notes & Constraints: ${extraContext.trim()}`);
        }
        const fullPromptContext = contextSegments.join(". ");

        const contextForRoadmap = forceRegenerate
          ? fullPromptContext
          : (profile.extra_context ?? "");
        const profileForRoadmap = {
          ...profile,
          education_stage: selectedEduStage || profile.education_stage,
          career_goal: targetSkillOrInterest.trim() || profile.career_goal,
          career_goals: targetSkillOrInterest.trim() || profile.career_goals,
          extra_context: contextForRoadmap,
        };

        if (forceRegenerate) {
          const { error: profileUpdateError } = await supabase
            .from("user_profiles")
            .update({
              extra_context: extraContext.trim() || null,
              education_stage: selectedEduStage || profile.education_stage,
              career_goal: targetSkillOrInterest.trim() || profile.career_goal,
            })
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
    [user, isGuest, applyAiPayload, extraContext, selectedEduStage, targetSkillOrInterest],
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
    <div className="min-h-screen bg-charcoal-deep hero-glow dot-grid-bg text-foreground">
      <HeaderNav />

      <main className="mx-auto w-full max-w-6xl px-6 py-8">
        {/* ─── Profile Status & Welcome Banner ─── */}
        <section className="card-glow-top glass-card mb-8 overflow-hidden rounded-2xl border border-white/10 p-6 shadow-xl">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary/20 text-primary font-bold ring-1 ring-primary/30">
                <User className="size-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="font-display text-2xl font-bold tracking-tight text-foreground">
                    {isGuest ? "Welcome to CareerCompass" : `Welcome back, ${userProfile?.full_name || user?.email?.split("@")[0] || "Student"}!`}
                  </h1>
                  <Badge variant="secondary" className="bg-primary/15 text-primary text-xs font-semibold ring-1 ring-primary/25">
                    {userProfile?.education_stage ? userProfile.education_stage.replace("_", " ").toUpperCase() : "Onboarded"}
                  </Badge>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  {userProfile?.stream ? `Stream: ${userProfile.stream} • Goal: ${userProfile.goal_type || userProfile.career_goal || "Explore"}` : "AI guidance and career options tailored to your profile."}
                </p>
                {(() => {
                  const loc = getUserLocation(user, userProfile);
                  return (
                    <div className="mt-2 flex items-center gap-2">
                      <Badge
                        variant="outline"
                        className="gap-1.5 border-primary/30 bg-primary/10 px-2.5 py-0.5 text-[11px] font-medium text-primary"
                      >
                        <MapPin className="size-3 text-primary" />
                        {loc ? `${loc.city}, ${loc.state}` : "Location: All India"}
                      </Badge>
                    </div>
                  );
                })()}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 self-start sm:self-center">
              <Link to="/profile">
                <Button size="sm" variant="outline" className="gap-2 rounded-full px-4 text-xs font-semibold border-primary/40 bg-primary/10 text-primary hover:bg-primary/20">
                  <User className="size-3.5" />
                  Edit Profile
                </Button>
              </Link>
              <Link to="/colleges">
                <Button size="sm" variant="outline" className="gap-2 rounded-full px-4 text-xs font-medium border-border/70 hover:border-primary/40">
                  <GraduationCap className="size-3.5" />
                  Colleges
                </Button>
              </Link>
              <Link to="/backup">
                <Button size="sm" variant="outline" className="gap-2 rounded-full px-4 text-xs font-medium border-border/70 hover:border-primary/40 text-primary hover:bg-primary/10">
                  <ShieldCheck className="size-3.5 text-primary" />
                  Backup Plans
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* ─── 1. AI-Powered Recommendations (FIRST SECTION BELOW WELCOME BANNER) ─── */}
        <section className="card-glow-top glass-card mb-10 rounded-2xl border border-white/10 p-6 shadow-xl">
          <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-500/15 text-violet-400 border border-violet-500/30">
                <Sparkles className="size-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-bold tracking-tight">AI-Powered Career Recommendations</h2>
                  <span className="ai-badge">AI Powered</span>
                </div>
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
              {/* Provide Additional Context, Skills & Interests (Fields 3 and 4) */}
              <div className="mb-8 rounded-2xl border border-violet-500/30 bg-gradient-to-br from-violet-500/10 via-card/90 to-charcoal-deep p-5 sm:p-6 shadow-xl backdrop-blur-md space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-white/10 pb-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-500/20 text-violet-300 border border-violet-500/30 shadow-inner">
                      <Target className="size-5" />
                    </div>
                    <div>
                      <h3 className="text-sm sm:text-base font-bold text-foreground flex items-center gap-2">
                        Provide Additional Context, Skills & Interests
                        <span className="ai-badge text-[10px]">AI Guided</span>
                      </h3>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Specify any target skill, career track, or interest and provide additional context to generate an adaptive AI roadmap.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Fields 1 and 2: Target Skill/Interest & Additional Context Inputs */}
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label htmlFor="target-skill" className="block text-xs font-semibold text-foreground">
                        1. Target Skill, Career Track or Specific Interest
                      </label>
                      <span className="text-[10px] text-violet-300 font-medium">Auto-fetches YouTube courses</span>
                    </div>
                    <Input
                      id="target-skill"
                      value={targetSkillOrInterest}
                      onChange={(e) => setTargetSkillOrInterest(e.target.value)}
                      placeholder="e.g. Generative AI, Full Stack Web Dev, Investment Banking, Robotics, Medical..."
                      className="text-xs bg-background/80"
                    />
                    <div className="flex flex-wrap items-center gap-1.5 pt-1">
                      <span className="text-[10px] text-muted-foreground">Popular:</span>
                      {[
                        "Generative AI & LLMs",
                        "Full Stack Web Dev",
                        "Data Structures (DSA)",
                        "Data Analytics & SQL",
                        "Cloud & DevOps",
                        "Investment Banking",
                        "Cybersecurity",
                      ].map((item) => (
                        <button
                          key={item}
                          type="button"
                          onClick={() => setTargetSkillOrInterest(item)}
                          className="rounded-full bg-white/5 hover:bg-violet-500/20 hover:text-violet-200 border border-white/10 px-2 py-0.5 text-[10px] text-muted-foreground transition-all"
                        >
                          {item}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label htmlFor="extra-context" className="block text-xs font-semibold text-foreground">
                      2. Additional Preferences & Context (Optional)
                    </label>
                    <Textarea
                      id="extra-context"
                      value={extraContext}
                      onChange={(event) => setExtraContext(event.target.value)}
                      maxLength={500}
                      disabled={status === "loading"}
                      placeholder="E.g. I prefer software over hardware, want remote work options, or want top colleges in Bangalore/Mumbai..."
                      className="min-h-16 resize-y text-xs bg-background/80"
                    />
                    <p className="text-right text-[10px] text-muted-foreground">
                      {extraContext.length}/500
                    </p>
                  </div>
                </div>

                {/* Live Curated YouTube Tutorials specifically for the target skill */}
                {Boolean(activeTargetSkill && activeTargetSkillYtResources.length > 0) && (
                  <div className="rounded-xl border border-red-500/25 bg-red-500/5 p-4 space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1.5 border-b border-red-500/15 pb-2.5">
                      <div className="flex items-center gap-2">
                        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-red-500/20 text-red-500">
                          <Youtube className="size-4" />
                        </div>
                        <div>
                          <span className="text-xs font-bold text-red-400 flex items-center gap-1.5 flex-wrap">
                            Curated YouTube Video Courses for:
                            <span className="text-white font-extrabold underline decoration-red-500/60">
                              {activeTargetSkill}
                            </span>
                          </span>
                          <p className="text-[10px] text-muted-foreground">
                            Free full-length courses, project walkthroughs & verified playlists to acquire this skill
                          </p>
                        </div>
                      </div>

                      <a
                        href={getDirectYoutubeSearchUrl(activeTargetSkill)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-[11px] font-semibold text-red-400 hover:text-red-300 hover:underline"
                      >
                        <span>Explore more {activeTargetSkill} on YouTube</span>
                        <ExternalLink className="size-3" />
                      </a>
                    </div>

                    <div className="grid gap-2.5 sm:grid-cols-3">
                      {activeTargetSkillYtResources.slice(0, 3).map((yt, idx) => (
                        <div
                          key={idx}
                          className="flex flex-col justify-between rounded-lg border border-white/10 bg-background/80 p-3 text-xs space-y-2 hover:border-red-500/40 transition-colors shadow-sm"
                        >
                          <div>
                            <div className="flex items-start justify-between gap-1 mb-1">
                              <span className="font-semibold text-foreground leading-snug line-clamp-2">
                                {yt.title}
                              </span>
                              {yt.badge && (
                                <Badge
                                  variant="outline"
                                  className="text-[9px] py-0 px-1 border-red-500/30 text-red-400 bg-red-500/10 shrink-0"
                                >
                                  {yt.badge}
                                </Badge>
                              )}
                            </div>
                            <p className="text-[11px] text-muted-foreground line-clamp-2">
                              <strong className="text-foreground/90">{yt.channel}:</strong>{" "}
                              {yt.description}
                            </p>
                          </div>
                          <a
                            href={yt.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center justify-center gap-1.5 rounded-md bg-red-500/15 hover:bg-red-500/25 text-red-400 py-1.5 px-2.5 text-[11px] font-semibold transition-colors mt-1"
                          >
                            <Youtube className="size-3.5 text-red-500 shrink-0" />
                            Watch Video Course
                            <ExternalLink className="size-3 shrink-0 opacity-80" />
                          </a>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Action Bar */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-2 border-t border-white/10">
                  <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                    <span className="text-foreground font-semibold">
                      Current Target:
                    </span>
                    <Badge variant="outline" className="border-primary/40 bg-primary/10 text-primary text-[11px] font-semibold">
                      {targetSkillOrInterest.trim() || "Comprehensive Career Roadmap"}
                    </Badge>
                    {userProfile?.education_stage && (
                      <span className="text-[11px] text-muted-foreground">
                        • Stage: {userProfile.education_stage.replace("_", " ").toUpperCase()}
                      </span>
                    )}
                  </div>

                  <Button
                    type="button"
                    onClick={() => void loadRecommendations(true)}
                    disabled={status === "loading"}
                    className="shrink-0 gap-2 font-bold shadow-lg ai-button hover:text-white px-5"
                  >
                    {status === "loading" ? (
                      <>
                        <Loader2 className="size-4 animate-spin" />
                        Generating Custom Roadmap...
                      </>
                    ) : (
                      <>
                        <Sparkles className="size-4 text-violet-200" />
                        {targetSkillOrInterest.trim()
                          ? `Generate Roadmap for ${targetSkillOrInterest.slice(0, 24)}${targetSkillOrInterest.length > 24 ? "..." : ""}`
                          : recommendations.length > 0
                            ? "Regenerate AI Roadmap"
                            : "Generate AI Roadmap"}
                      </>
                    )}
                  </Button>
                </div>
              </div>

              {/* Loading skeleton */}
              {status === "loading" && <LoadingSkeleton prefersReduced={prefersReduced} />}

              {/* Error state */}
              {status === "error" && (
                error?.toLowerCase().includes("not configured") || error?.toLowerCase().includes("api key") ? (
                  <div className="mb-6 rounded-2xl border border-violet-500/35 bg-gradient-to-br from-violet-500/10 via-card/90 to-charcoal-deep p-5 text-foreground backdrop-blur-md shadow-lg shadow-violet-500/5">
                    <div className="flex items-start gap-3.5">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-500/20 text-violet-300 border border-violet-500/30">
                        <Sparkles className="size-5 text-violet-400 animate-pulse" />
                      </div>
                      <div className="space-y-2.5 flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-bold text-violet-200">AI Service Activation & Key Setup</h3>
                          <span className="ai-badge">Gemini Flash</span>
                        </div>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                          Your recommendations and advisor chat are powered by Google Gemini. Enter your Gemini API key below to activate intelligent career guidance instantly:
                        </p>
                        <div className="pt-1 flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                          <Input
                            placeholder="Enter Gemini API key (AIza... or AQ...)"
                            value={customApiKey}
                            onChange={(e) => setCustomApiKey(e.target.value)}
                            type="password"
                            className="text-xs h-9 bg-background/90 border-violet-500/30 focus-visible:ring-violet-500/50"
                          />
                          <Button
                            size="sm"
                            onClick={() => {
                              if (customApiKey.trim()) {
                                localStorage.setItem("careercompass_custom_gemini_key", customApiKey.trim());
                                toast.success("Gemini API key saved to browser!");
                              }
                              void loadRecommendations(true);
                            }}
                            className="h-9 text-xs shrink-0 ai-button text-white font-medium px-4 shadow-sm"
                          >
                            <Sparkles className="size-3.5 mr-1 text-violet-200" /> Save & Activate AI
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => void loadRecommendations(true)}
                            className="h-9 text-xs shrink-0 border-violet-500/30 text-violet-300 hover:bg-violet-500/20 hover:text-white"
                          >
                            <Loader2 className="size-3.5 mr-1" />
                            Retry
                          </Button>
                        </div>
                        <p className="text-[11px] text-muted-foreground/75">
                          Tip: You can get a free API key at <a href="https://aistudio.google.com/" target="_blank" rel="noreferrer" className="text-violet-300 underline underline-offset-2 hover:text-white">Google AI Studio</a>.
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
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
                )
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
                    <Sparkles className="mx-auto mb-3 size-8 text-violet-400" />
                    <p className="font-medium text-foreground">No recommendations generated yet</p>
                    <p className="mt-1 text-xs">
                      Click <span className="font-semibold text-violet-400">"Generate AI Roadmap"</span> above to create your personalized recommendations.
                    </p>
                  </CardContent>
                </Card>
              )}
            </>
          ) : (
            <div className="rounded-xl border border-dashed border-violet-500/30 bg-violet-500/5 p-6 text-center">
              <Sparkles className="mx-auto mb-3 size-8 text-violet-400" />
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

        {/* ─── 2. Aligned Feature Hub Cards (Colleges & Backup) ─── */}
        <section className="mb-10 grid gap-4 sm:grid-cols-2">
          <Link to="/colleges">
            <Card className="group h-full border-border/60 bg-card/70 transition-all hover:border-primary/50 hover:bg-card hover:shadow-md">
              <CardContent className="flex flex-col justify-between p-5 h-full">
                <div>
                  <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary border border-primary/20">
                    <GraduationCap className="size-5" />
                  </div>
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-base group-hover:text-primary transition-colors">College Explorer & Comparer</h3>
                    <Badge variant="outline" className="bg-primary/10 text-primary border-primary/25 text-[10px]">
                      Verified Hub
                    </Badge>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                    Explore top universities, filter by your location & compare fees, entrance exams and ratings side-by-side.
                  </p>
                </div>
                <div className="mt-4 flex items-center gap-1 text-xs font-semibold text-primary">
                  Explore Colleges <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-1" />
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link to="/backup">
            <Card className="group h-full border-border/60 bg-card/70 transition-all hover:border-primary/50 hover:bg-card hover:shadow-md">
              <CardContent className="flex flex-col justify-between p-5 h-full">
                <div>
                  <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary border border-primary/20">
                    <ShieldCheck className="size-5" />
                  </div>
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-base group-hover:text-primary transition-colors">Backup & Fallback Plans</h3>
                    <Badge variant="outline" className="bg-primary/10 text-primary border-primary/25 text-[10px]">
                      Safety Net
                    </Badge>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                    Explore secondary career paths, entrance exam pivots, and risk mitigation strategies to ensure long-term career security.
                  </p>
                </div>
                <div className="mt-4 flex items-center gap-1 text-xs font-semibold text-primary">
                  View Backup Plans <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-1" />
                </div>
              </CardContent>
            </Card>
          </Link>
        </section>

        {/* ─── 3. Actionable Immediate Next Steps & Exam Connections ─── */}
        <section className="mb-10 space-y-6">
          <Card className="border-primary/20 bg-primary/5 shadow-sm">
            <CardHeader className="pb-3 border-b border-primary/15">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-base font-bold">
                  <Sparkles className="size-5 text-primary" />
                  Actionable Immediate Next Steps
                </CardTitle>
                <Badge variant="secondary" className="text-[10px] bg-primary/15 text-primary">
                  Guidance
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              {nextSteps.length > 0 ? (
                <ul className="grid gap-3 sm:grid-cols-2">
                  {nextSteps.map((stepItem, idx) => (
                    <li key={idx} className="flex items-start gap-3 rounded-xl border border-primary/20 bg-background/80 p-3.5 text-xs shadow-sm">
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/20 text-[11px] font-bold text-primary">
                        {idx + 1}
                      </span>
                      <span className="mt-0.5 font-medium text-foreground leading-relaxed">{stepItem}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Generate your AI career recommendations above to see personalized preparation milestones and next steps.
                </p>
              )}
            </CardContent>
          </Card>

          {/* Parallel Entrance Exam Connections Summary */}
          <Card className="border-border/60 bg-card/70 shadow-sm">
            <CardHeader className="pb-3 border-b border-border/40">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-base font-bold">
                  <Link2 className="size-5 text-primary" />
                  Parallel Entrance Exam Connections
                </CardTitle>
                <Link to="/backup">
                  <Button variant="ghost" size="sm" className="h-7 text-xs gap-1 text-primary hover:bg-primary/10">
                    Full Fallback Map <ArrowRight className="size-3" />
                  </Button>
                </Link>
              </div>
              <p className="text-xs text-muted-foreground">
                Target key entrance exams alongside overlapping alternatives to maximize your admission safety net.
              </p>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid gap-3 sm:grid-cols-3">
                {EXAM_CONNECTIONS.slice(0, 3).map((conn, idx) => (
                  <div key={idx} className="rounded-xl border border-border/60 bg-background/60 p-3.5 text-xs">
                    <Badge variant="outline" className="mb-1.5 text-[10px] border-primary/30 text-primary">
                      Primary: {conn.exam}
                    </Badge>
                    <p className="font-semibold text-foreground text-xs mt-1">
                      Parallel: {Array.isArray(conn.connected_exams) ? conn.connected_exams.join(", ") : conn.connected_exams}
                    </p>
                    <p className="mt-1.5 text-[11px] text-muted-foreground leading-relaxed line-clamp-2">
                      {conn.note}
                    </p>
                  </div>
                ))}
              </div>
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

      <CardContent className="pt-0 space-y-2">
        {/* YouTube Learning Shortcut */}
        {(() => {
          const yt = getYoutubeResourcesForMilestone(rec.career_title, "Track", rec.career_title);
          if (!yt || yt.length === 0) return null;
          const firstYt = yt[0];
          return (
            <a
              href={firstYt.url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="flex items-center justify-between rounded-lg border border-red-500/25 bg-red-500/10 px-3 py-1.5 text-[11px] font-medium text-red-400 hover:bg-red-500/15 transition-colors"
            >
              <span className="flex items-center gap-1.5 truncate">
                <Youtube className="size-3.5 text-red-500 shrink-0" />
                <span className="truncate">{firstYt.title}</span>
              </span>
              <ExternalLink className="size-3 shrink-0 ml-1 opacity-80" />
            </a>
          );
        })()}

        {/* View Roadmap button */}
        <Button asChild variant="outline" size="sm" className="w-full gap-2 text-xs">
          <Link to="/roadmap" search={{ rec: rec.id }}>
            <MapIcon className="size-4 text-primary" />
            View Full Roadmap & Video Guides
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
              <p className="mb-2 flex items-center justify-between text-xs font-semibold text-rose-600 dark:text-rose-400">
                <span className="flex items-center gap-1.5">
                  <AlertCircle className="size-3.5" /> High Priority / Missing ({(highPriorityMissing ?? []).length})
                </span>
                <span className="text-[10px] text-muted-foreground">Click for video</span>
              </p>
              <div className="flex flex-wrap gap-1.5">
                {(highPriorityMissing ?? []).length > 0 ? (
                  (highPriorityMissing ?? []).map((skill) => (
                    <a
                      key={skill}
                      href={getDirectYoutubeSearchUrl(skill)}
                      target="_blank"
                      rel="noopener noreferrer"
                      title={`Watch YouTube tutorials to learn ${skill}`}
                      className="inline-flex items-center gap-1 rounded-md bg-rose-500/15 px-2 py-0.5 text-xs font-medium text-rose-700 dark:text-rose-300 border border-rose-500/30 hover:bg-rose-500/25 transition-all group"
                    >
                      <span>! {skill}</span>
                      <Youtube className="size-3 text-red-500 opacity-80 group-hover:opacity-100" />
                    </a>
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
              <p className="mb-2 flex items-center justify-between text-xs font-semibold text-blue-600 dark:text-blue-400">
                <span className="flex items-center gap-1.5">
                  <BookOpen className="size-3.5" /> Needs to Learn ({(remainingMissing ?? []).length})
                </span>
                <span className="text-[10px] text-muted-foreground">Click for video</span>
              </p>
              <div className="flex flex-wrap gap-1.5">
                {(remainingMissing ?? []).length > 0 ? (
                  (remainingMissing ?? []).map((skill) => (
                    <a
                      key={skill}
                      href={getDirectYoutubeSearchUrl(skill)}
                      target="_blank"
                      rel="noopener noreferrer"
                      title={`Watch YouTube tutorials to learn ${skill}`}
                      className="inline-flex items-center gap-1 rounded-md bg-blue-500/15 px-2 py-0.5 text-xs font-medium text-blue-700 dark:text-blue-300 border border-blue-500/30 hover:bg-blue-500/25 transition-all group"
                    >
                      <span>+ {skill}</span>
                      <Youtube className="size-3 text-red-500 opacity-80 group-hover:opacity-100" />
                    </a>
                  ))
                ) : (
                  <span className="text-xs text-muted-foreground italic">No secondary gaps</span>
                )}
              </div>
            </div>
          </div>

          {/* YouTube Video Tutorials for Missing Target Skills */}
          {missing.length > 0 && (
            <div className="mt-3 rounded-xl border border-red-500/20 bg-red-500/5 p-3.5 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-xs font-bold text-red-400">
                  <Youtube className="size-4 text-red-500" />
                  YouTube Video Tutorials for Skills You Need to Acquire
                </span>
                <span className="text-[10px] text-muted-foreground">Free Course Guides</span>
              </div>
              <div className="grid gap-2.5 sm:grid-cols-2 md:grid-cols-3">
                {missing.slice(0, 3).map((missingSkill) => {
                  const yt = getYoutubeResourcesForSkill(missingSkill)[0];
                  return (
                    <div
                      key={missingSkill}
                      className="flex flex-col justify-between rounded-lg border border-border/50 bg-background/80 p-2.5 text-xs space-y-2 hover:border-red-500/40 transition-colors"
                    >
                      <div>
                        <div className="flex items-center justify-between gap-1 mb-1">
                          <span className="font-bold text-foreground truncate">{missingSkill}</span>
                          <Badge
                            variant="outline"
                            className="text-[9px] px-1 py-0 border-rose-500/30 text-rose-400 bg-rose-500/10 shrink-0"
                          >
                            Skill Gap
                          </Badge>
                        </div>
                        <p className="text-[11px] text-muted-foreground line-clamp-1">
                          {yt ? `${yt.channel}: ${yt.title}` : `Complete video course for ${missingSkill}`}
                        </p>
                      </div>
                      <a
                        href={yt?.url || getDirectYoutubeSearchUrl(missingSkill)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center gap-1.5 rounded bg-red-500/15 hover:bg-red-500/25 px-2 py-1 text-[11px] font-semibold text-red-400 transition-colors"
                      >
                        <Youtube className="size-3 text-red-500" />
                        Watch {missingSkill} Video
                        <ExternalLink className="size-2.5 opacity-80" />
                      </a>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
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
