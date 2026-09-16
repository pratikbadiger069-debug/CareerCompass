import { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowLeft,
  CheckCircle2,
  Circle,
  Compass,
  Lock,
  Map,
  Share2,
  Sparkles,
  UserCheck,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import { usePrefersReducedMotion } from "@/hooks/use-reduced-motion";
import { getStaggerContainer, getFadeUp } from "@/lib/motion";
import { motion } from "framer-motion";

type Recommendation = Tables<"career_recommendations">;
type Milestone = Tables<"roadmap_milestones">;

export const Route = createFileRoute("/roadmap/$shareId")({
  head: () => ({
    meta: [
      { title: "Shared Career Roadmap — CareerCompass" },
      {
        name: "description",
        content: "View a shared public career roadmap and milestone trajectory on CareerCompass.",
      },
      { property: "og:title", content: "Shared Career Roadmap — CareerCompass" },
    ],
  }),
  component: SharedRoadmapPage,
});

function SharedRoadmapPage() {
  const { shareId } = Route.useParams();
  const prefersReduced = usePrefersReducedMotion();

  const [recommendation, setRecommendation] = useState<Recommendation | null>(null);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const stagger = getStaggerContainer(prefersReduced);
  const fadeUp = getFadeUp(prefersReduced);

  useEffect(() => {
    async function fetchSharedData() {
      try {
        // Fetch public recommendation by share_id
        const { data: recData, error: recError } = await supabase
          .from("career_recommendations")
          .select("*")
          .eq("share_id", shareId)
          .eq("is_public", true)
          .maybeSingle();

        if (recError || !recData) {
          console.error("[SharedRoadmap] Not found or error:", recError);
          setNotFound(true);
          setLoading(false);
          return;
        }

        setRecommendation(recData);

        // Fetch linked milestones
        const { data: mData, error: mError } = await supabase
          .from("roadmap_milestones")
          .select("*")
          .eq("recommendation_id", recData.id)
          .order("order_index", { ascending: true });

        if (mError) {
          console.error("[SharedRoadmap] Error loading milestones:", mError);
        }

        // Rule 3: Use ?? [] fallback
        setMilestones(mData ?? []);
      } catch (err) {
        console.error("[SharedRoadmap] Exception:", err);
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    }

    fetchSharedData();
  }, [shareId]);

  if (loading) {
    return (
      <main className="mx-auto min-h-screen max-w-4xl px-6 py-10 space-y-6">
        <Skeleton className="h-10 w-1/2" />
        <Skeleton className="h-40 w-full rounded-2xl" />
        <Skeleton className="h-64 w-full rounded-2xl" />
      </main>
    );
  }

  if (notFound || !recommendation) {
    return (
      <main className="mx-auto flex min-h-screen max-w-md flex-col items-center justify-center px-6 py-16 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted text-muted-foreground mb-4">
          <Lock className="size-8" />
        </div>
        <h1 className="text-xl font-bold text-foreground">Roadmap Not Found or Private</h1>
        <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
          This shared roadmap link may have expired, been made private by its creator, or does not
          exist.
        </p>
        <Link to="/auth" className="mt-6">
          <Button size="sm" className="gap-2">
            <Sparkles className="size-4" /> Create Your Own Roadmap
          </Button>
        </Link>
      </main>
    );
  }

  const completedCount = (milestones ?? []).filter((m) => m.status === "completed").length;

  return (
    <div className="min-h-screen bg-background">
      {/* Top Read-Only Public Banner */}
      <div className="border-b border-primary/20 bg-primary/10 px-4 py-3">
        <div className="mx-auto flex max-w-4xl items-center justify-between gap-4 text-xs font-medium">
          <div className="flex items-center gap-2">
            <Share2 className="size-4 text-primary shrink-0" />
            <span>
              You are viewing a <strong>shared public roadmap</strong> for{" "}
              <span className="font-semibold text-primary">{recommendation.career_title}</span>.
            </span>
          </div>
          <Link to="/auth">
            <Button size="sm" className="h-7 text-xs gap-1.5 shadow-sm">
              <UserCheck className="size-3.5" /> Build Yours Free
            </Button>
          </Link>
        </div>
      </div>

      <main className="mx-auto max-w-4xl px-6 py-10">
        {/* Header Card */}
        <Card className="mb-8 border-border/70 bg-card/80 p-6 shadow-sm">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <Badge variant="outline" className="mb-2 text-[10px] uppercase tracking-wide">
                Read-Only Shared View
              </Badge>
              <h1 className="text-2xl font-bold text-foreground">{recommendation.career_title}</h1>
              <p className="mt-1 text-xs text-muted-foreground line-clamp-2 max-w-2xl">
                {recommendation.description}
              </p>
            </div>

            <div className="flex flex-col items-start sm:items-end shrink-0 gap-1">
              <Badge className="bg-primary/10 text-primary border-primary/20 text-xs">
                {recommendation.match_score ?? 85}% Match
              </Badge>
              <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 mt-1">
                {recommendation.salary_range}
              </span>
            </div>
          </div>
        </Card>

        {/* Milestones Read-Only Timeline */}
        <div className="space-y-4">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-lg font-bold flex items-center gap-2">
              <Map className="size-5 text-primary" /> Roadmap Milestones (
              {(milestones ?? []).length})
            </h2>
            <span className="text-xs text-muted-foreground font-medium">
              {completedCount} of {(milestones ?? []).length} Completed
            </span>
          </div>

          <motion.div variants={stagger} initial="hidden" animate="visible" className="space-y-3">
            {(milestones ?? []).map((m) => (
              <motion.div
                key={m.id}
                variants={fadeUp}
                className="flex items-start gap-3 rounded-2xl border border-border/60 bg-card p-4 shadow-sm"
              >
                <div className="mt-0.5 shrink-0 text-primary">
                  {m.status === "completed" ? (
                    <CheckCircle2 className="size-5 text-emerald-500 fill-emerald-500/10" />
                  ) : (
                    <Circle className="size-5 text-muted-foreground/60" />
                  )}
                </div>

                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3
                      className={`text-sm font-semibold ${
                        m.status === "completed"
                          ? "line-through text-muted-foreground"
                          : "text-foreground"
                      }`}
                    >
                      {m.title}
                    </h3>
                    <Badge variant="secondary" className="text-[10px]">
                      {m.category}
                    </Badge>
                  </div>
                  {m.description && (
                    <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                      {m.description}
                    </p>
                  )}
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </main>
    </div>
  );
}
