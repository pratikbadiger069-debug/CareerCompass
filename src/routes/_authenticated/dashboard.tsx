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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import { useAuth } from "@/hooks/useAuth";
import { usePrefersReducedMotion } from "@/hooks/use-reduced-motion";
import { getStaggerContainer, getFadeUp, getCardHover } from "@/lib/motion";
import { RevealOnScroll } from "@/components/motion/RevealOnScroll";
import { generateCareerRoadmap } from "@/lib/geminiApi";
import { CAREER_PATHS, EXAM_CONNECTIONS, STREAM_VALUE_TO_PATH, type StreamPath } from "@/lib/careerCompass.paths";
import { motion, type Variants } from "framer-motion";

type Recommendation = Tables<"career_recommendations">;
type Milestone = Tables<"roadmap_milestones">;
type UserProfile = Tables<"user_profiles">;
type Status = "idle" | "loading" | "ready" | "error";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({
    meta: [
      { title: "CareerCompass — Your Career Map" },
      { name: "description", content: "Explore career options, backup paths, what-if scenarios and exam connections." },
      { property: "og:title", content: "CareerCompass — Your Career Map" },
      { property: "og:description", content: "Explore career options, backup paths, what-if scenarios and exam connections." },
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
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [selectedRecId, setSelectedRecId] = useState<string | null>(null);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [extraContext, setExtraContext] = useState("");
  const [error, setError] = useState<string | null>(null);


  const path = useMemo<StreamPath>(() => {
    const id = STREAM_VALUE_TO_PATH[stream] ?? "mpc";
    return CAREER_PATHS.find((item) => item.id === id) ?? CAREER_PATHS[0]!;
  }, [stream]);

  const scenario = path.whatIf[scenarioIndex] ?? path.whatIf[0];

  // --- Core fetch-or-generate logic ---
  const loadRecommendations = useCallback(async (forceRegenerate = false) => {
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

      if (!forceRegenerate && existing && existing.length > 0) {
        // Rows already exist — skip AI, load saved data.
        setRecommendations(existing);
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


      const contextForRoadmap = forceRegenerate ? extraContext.trim() : (profile.extra_context ?? "");
      const profileForRoadmap = { ...profile, extra_context: contextForRoadmap };

      if (forceRegenerate) {
        const { error: profileUpdateError } = await supabase
          .from("user_profiles")
          .update({ extra_context: contextForRoadmap || null })
          .eq("user_id", user.id);
        if (profileUpdateError) throw new Error(`Failed to save your context: ${profileUpdateError.message}`);

        // Delete dependent rows first, then remove the old recommendations.
        const { error: milestonesDeleteError } = await supabase
          .from("roadmap_milestones")
          .delete()
          .eq("user_id", user.id);
        if (milestonesDeleteError) throw new Error(`Failed to clear the old roadmap: ${milestonesDeleteError.message}`);

        const { error: recommendationsDeleteError } = await supabase
          .from("career_recommendations")
          .delete()
          .eq("user_id", user.id);
        if (recommendationsDeleteError) throw new Error(`Failed to clear old recommendations: ${recommendationsDeleteError.message}`);
      }

      const aiResult = await generateCareerRoadmap(profileForRoadmap as Record<string, unknown>);

      // 3a. Insert career_recommendations
      const aiRecs = (aiResult as Record<string, unknown>)["recommendations"] as
        | Array<{
            title: string;
            why: string;
            match_score: number;
            salary_range: string;
            demand_outlook: string;
            required_skills: string[];
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
        match_score: rec.match_score,
        salary_range: rec.salary_range,
        growth_outlook: rec.demand_outlook,
        required_skills: rec.required_skills ?? [],
        colleges: rec.colleges ?? [],
      }));


      const { data: insertedRecs, error: insertError } = await supabase
        .from("career_recommendations")
        .insert(recsToInsert)
        .select();

      if (insertError) throw new Error(`Failed to save recommendations: ${insertError.message}`);
      if (!insertedRecs) throw new Error("No recommendations returned after insert.");

      // 3b. Insert roadmap_milestones linked via recommendation_id
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
          // Map each phase to the recommendation at the same index, falling back to the last one
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

      // Re-fetch to get canonical data
      const { data: finalRecs } = await supabase
        .from("career_recommendations")
        .select("*")
        .eq("user_id", user.id);
      setRecommendations(finalRecs ?? insertedRecs);

      const finalRecIds = (finalRecs ?? insertedRecs).map((r) => r.id);
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
  }, [user, isGuest]);

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
    <main className="mx-auto min-h-screen w-full max-w-6xl px-6 py-10">
      {/* ─── Header ─── */}
      <header className="flex flex-col gap-4 border-b border-border/50 pb-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-primary">CareerCompass</p>
          <h1 className="mt-1 text-3xl font-bold">Your Career Map</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {isGuest ? "Demo mode — explore the map freely." : `Welcome back, ${user?.email ?? "student"}.`}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Link to="/compare">
            <Button variant="outline" size="sm" className="gap-1.5">
              <BarChart3 className="size-4 text-primary" /> Compare
            </Button>
          </Link>
          <Link to="/colleges">
            <Button variant="outline" size="sm" className="gap-1.5">
              <GraduationCap className="size-4 text-primary" /> Colleges
            </Button>
          </Link>
          <Link to="/profile">
            <Button variant="outline" size="sm" className="gap-1.5">
              <User className="size-4 text-primary" /> Profile
            </Button>
          </Link>
          <Button variant="outline" size="sm" onClick={signOut}>Sign out</Button>
        </div>
      </header>

      {/* ─── AI-Powered Recommendations (authenticated, non-guest only) ─── */}
      {!isGuest && (
        <section className="mt-8">
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="size-5 text-primary" />
              <h2 className="text-xl font-bold">Your AI-Powered Recommendations</h2>
            </div>
            <div className="flex items-center gap-2">
              <Link to="/compare">
                <Button variant="ghost" size="sm" className="gap-1 text-xs text-primary hover:text-primary">
                  <BarChart3 className="size-3.5" /> Compare All
                </Button>
              </Link>
              <Link to="/colleges">
                <Button variant="ghost" size="sm" className="gap-1 text-xs text-primary hover:text-primary">
                  <GraduationCap className="size-3.5" /> View Colleges
                </Button>
              </Link>
            </div>
          </div>

          <div className="mb-6 flex flex-col gap-4 rounded-xl border border-border/60 bg-card/50 p-4 sm:flex-row sm:items-end">
            <div className="min-w-0 flex-1">
              <label htmlFor="extra-context" className="mb-2 block text-sm font-semibold">
                Tell us more
              </label>
              <Textarea
                id="extra-context"
                value={extraContext}
                onChange={(event) => setExtraContext(event.target.value)}
                maxLength={500}
                disabled={status === "loading"}
                placeholder="Anything else we should know? E.g. specific companies you admire, a subject you struggled with, family expectations, health/location constraints..."
                className="min-h-24 resize-y"
              />
              <p className="mt-1 text-right text-xs text-muted-foreground">{extraContext.length}/500</p>
            </div>
            <Button
              type="button"
              onClick={() => void loadRecommendations(true)}
              disabled={status === "loading"}
              className="shrink-0 gap-2"
            >
              {status === "loading" ? <Loader2 className="size-4 animate-spin" /> : <Sparkles className="size-4" />}
              Generate My Roadmap
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
                  onClick={() => { setStatus("idle"); }}
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
                    onClick={() => setSelectedRecId(rec.id)}
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
                <p className="font-medium">No recommendations yet</p>
                <p className="mt-1 text-sm">Complete your profile to get personalized career guidance.</p>
              </CardContent>
            </Card>
          )}
        </section>
      )}

      {/* ─── Explore by Stream (existing static UI) ─── */}
      <section className="mt-12">
        <div className="mb-6 flex items-center gap-2">
          <Compass className="size-5 text-primary" />
          <h2 className="text-xl font-bold">Explore by Stream</h2>
        </div>

        <section className="grid gap-4 md:grid-cols-4">
          <MapStep icon={<Compass className="size-5" />} title="Where am I?" value={path.name} />
          <MapStep icon={<RouteIcon className="size-5" />} title="My options" value={`${path.options.length} paths`} />
          <MapStep icon={<ShieldCheck className="size-5" />} title="If it doesn't work" value={`${path.backups.length} backups`} />
          <MapStep icon={<ArrowRight className="size-5" />} title="Next" value="Build & explore" />
        </section>

        <section className="mt-8 rounded-2xl border border-primary/20 bg-primary/5 p-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-medium text-primary">Start with your current stream</p>
              <h2 className="mt-1 text-xl font-bold">Where are you right now?</h2>
            </div>
            <Select value={stream} onValueChange={(value) => { setStream(value); setScenarioIndex(0); }}>
              <SelectTrigger className="w-full sm:w-64"><SelectValue placeholder="Choose your stream" /></SelectTrigger>
              <SelectContent>
                {Object.entries(STREAM_VALUE_TO_PATH).map(([value, pathId]) => {
                  const item = CAREER_PATHS.find((candidate) => candidate.id === pathId);
                  return <SelectItem key={value} value={value}>{item?.name ?? value}</SelectItem>;
                })}
              </SelectContent>
            </Select>
          </div>
        </section>

        <section className="mt-8 grid gap-6 lg:grid-cols-2">
          <Card className="border-border/60 bg-card/70">
            <CardHeader><CardTitle className="flex items-center gap-2"><GraduationCap className="size-5 text-primary" /> Options from here</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {path.options.map((option) => (
                <div key={option.title} className="rounded-xl border border-border/60 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div><p className="font-semibold">{option.title}</p><p className="mt-1 text-sm text-muted-foreground">{option.description}</p></div>
                    <span className="rounded-full bg-primary/10 px-2 py-1 text-xs text-primary">{option.kind}</span>
                  </div>
                  <p className="mt-3 text-xs font-medium">Next: {option.nextSteps[0]}</p>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="border-border/60 bg-card/70">
            <CardHeader><CardTitle className="flex items-center gap-2"><Lightbulb className="size-5 text-primary" /> What If?</CardTitle></CardHeader>
            <CardContent>
              <Select value={String(scenarioIndex)} onValueChange={(value) => setScenarioIndex(Number(value))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {path.whatIf.map((item, index) => <SelectItem key={item.question} value={String(index)}>{item.question}</SelectItem>)}
                </SelectContent>
              </Select>
              {scenario && <div className="mt-4 rounded-xl bg-secondary/50 p-4"><p className="text-sm leading-6">{scenario.answer}</p><p className="mt-4 text-sm font-semibold">Possible next paths</p><ul className="mt-2 space-y-2 text-sm text-muted-foreground">{scenario.alternatives.map((item) => <li key={item} className="flex gap-2"><ArrowRight className="mt-0.5 size-4 shrink-0 text-primary" />{item}</li>)}</ul></div>}
            </CardContent>
          </Card>
        </section>

        <section className="mt-8 grid gap-6 lg:grid-cols-2">
          <Card className="border-border/60 bg-card/70">
            <CardHeader><CardTitle>Backup paths</CardTitle></CardHeader>
            <CardContent className="space-y-3">{path.backups.map((backup) => <div key={backup.title} className="rounded-xl border border-border/60 p-4"><p className="font-semibold">{backup.title}</p><p className="mt-1 text-sm text-muted-foreground">{backup.description}</p><p className="mt-2 text-xs">Why it works: {backup.whyItWorks}</p></div>)}</CardContent>
          </Card>

          <Card className="border-border/60 bg-card/70">
            <CardHeader><CardTitle className="flex items-center gap-2"><Link2 className="size-5 text-primary" /> Exam Connections</CardTitle></CardHeader>
            <CardContent className="space-y-3">{EXAM_CONNECTIONS.map((connection) => <div key={connection.exam} className="rounded-xl border border-border/60 p-4"><p className="font-semibold">{connection.exam}</p><p className="mt-1 text-sm text-muted-foreground">Also explore: {connection.connectedExams.join(", ")}</p><p className="mt-2 text-xs">{connection.note}</p></div>)}</CardContent>
          </Card>
        </section>
      </section>

      {/* ─── Summary ─── */}
      <Card className="mt-8 border-primary/20 bg-primary/5"><CardContent className="p-5"><p className="text-sm font-semibold">Your current direction</p><p className="mt-1 text-sm text-muted-foreground">{path.summary}</p><div className="mt-4 flex flex-wrap gap-2">{path.careers.map((career) => <span key={career} className="rounded-full border border-border/60 px-3 py-1 text-xs">{career}</span>)}</div></CardContent></Card>
    </main>
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
    (rec.match_score ?? 0) >= 80 ? "text-emerald-500" :
    (rec.match_score ?? 0) >= 60 ? "text-amber-500" :
    "text-red-400";

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
          {rec.match_score != null && (
            <Progress value={rec.match_score} className="mt-2 h-1.5" />
          )}
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
          <p className="mt-1 text-xs text-muted-foreground">This may take 15–30 seconds. We're analysing your profile with AI.</p>
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
function SkillGapTracker({
  rec,
  userSkills = [],
}: {
  rec: Recommendation;
  userSkills: string[];
}) {
  const requiredSkills = rec.required_skills ?? [];
  if (requiredSkills.length === 0) return null;

  const normalizedUserSkills = new Set(
    (userSkills ?? []).map((s) => s.trim().toLowerCase())
  );

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

  const percentage = Math.round(
    (acquired.length / requiredSkills.length) * 100
  );

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
                Targeting skills for <span className="font-semibold text-foreground">{rec.career_title}</span> against your profile skills
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
                <AlertCircle className="size-3.5" /> High Priority / Missing ({(highPriorityMissing ?? []).length})
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
                  <span className="text-xs text-muted-foreground italic">No high-priority gaps</span>
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
  return <Card className="border-border/60 bg-card/70"><CardContent className="p-4"><div className="flex items-center gap-2 text-primary">{icon}<span className="text-xs font-semibold uppercase tracking-wide">{title}</span></div><p className="mt-2 text-sm font-semibold">{value}</p></CardContent></Card>;
}
