import { useCallback, useEffect, useMemo, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  ArrowLeft,
  Check,
  CheckCircle2,
  Circle,
  Loader2,
  Map,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
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
import { getCheckmarkPop } from "@/lib/motion";
import { RevealOnScroll } from "@/components/motion/RevealOnScroll";
import { motion, AnimatePresence } from "framer-motion";

type Recommendation = Tables<"career_recommendations">;
type Milestone = Tables<"roadmap_milestones">;

/* ────────────────────────────────────────────────────────────────────────── */
/*  Route definition                                                         */
/* ────────────────────────────────────────────────────────────────────────── */

export const Route = createFileRoute("/_authenticated/roadmap")({
  head: () => ({
    meta: [
      { title: "CareerCompass — Your Roadmap" },
      {
        name: "description",
        content:
          "Track your career milestones, mark them complete and visualise your progress.",
      },
      { property: "og:title", content: "CareerCompass — Your Roadmap" },
      {
        property: "og:description",
        content:
          "Track your career milestones, mark them complete and visualise your progress.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  validateSearch: (search: Record<string, unknown>) => ({
    rec: (search.rec as string) || undefined,
  }),
  component: RoadmapPage,
});

/* ────────────────────────────────────────────────────────────────────────── */
/*  Page component                                                           */
/* ────────────────────────────────────────────────────────────────────────── */

function RoadmapPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { rec: selectedRecId } = Route.useSearch();
  const prefersReduced = usePrefersReducedMotion();
  const checkmarkPop = getCheckmarkPop(prefersReduced);

  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  /* ── Fetch recommendations ─────────────────────────────────────────── */
  const loadRecommendations = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from("career_recommendations")
      .select("*")
      .eq("user_id", user.id)
      .order("match_score", { ascending: false });
    setRecommendations(data ?? []);
    return data ?? [];
  }, [user]);

  /* ── Fetch milestones for a specific recommendation ────────────────── */
  const loadMilestones = useCallback(
    async (recId: string) => {
      if (!user) return;
      const { data } = await supabase
        .from("roadmap_milestones")
        .select("*")
        .eq("recommendation_id", recId)
        .order("order_index", { ascending: true });
      setMilestones(data ?? []);
    },
    [user],
  );

  /* ── Initial load ──────────────────────────────────────────────────── */
  useEffect(() => {
    let cancelled = false;

    async function init() {
      setLoading(true);
      const recs = await loadRecommendations();
      if (cancelled || !recs || recs.length === 0) {
        setLoading(false);
        return;
      }

      // Use selectedRecId from URL, or fall back to the top-scoring rec
      const targetId =
        selectedRecId && recs.some((r) => r.id === selectedRecId)
          ? selectedRecId
          : recs[0]!.id;

      // If we picked a default and there's no rec in the URL, update it
      if (!selectedRecId || !recs.some((r) => r.id === selectedRecId)) {
        navigate({
          to: "/roadmap",
          search: { rec: targetId },
          replace: true,
        });
      }

      await loadMilestones(targetId);
      setLoading(false);
    }

    init();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  /* ── Handle recommendation switch ──────────────────────────────────── */
  async function onRecChange(newRecId: string) {
    navigate({ to: "/roadmap", search: { rec: newRecId }, replace: true });
    setLoading(true);
    await loadMilestones(newRecId);
    setLoading(false);
  }

  /* ── Toggle milestone completion ───────────────────────────────────── */
  async function toggleMilestone(milestone: Milestone) {
    const newStatus =
      milestone.status === "completed" ? "pending" : "completed";
    const previousMilestones = [...milestones];

    // Optimistic update
    setMilestones((prev) =>
      prev.map((m) => (m.id === milestone.id ? { ...m, status: newStatus } : m)),
    );
    setUpdatingId(milestone.id);

    const { error } = await supabase
      .from("roadmap_milestones")
      .update({ status: newStatus })
      .eq("id", milestone.id);

    setUpdatingId(null);

    if (error) {
      setMilestones(previousMilestones);
      toast.error("Failed to update milestone", {
        description: error.message,
      });
    } else {
      toast.success(
        newStatus === "completed"
          ? `"${milestone.title}" marked complete!`
          : `"${milestone.title}" marked pending`,
      );
    }
  }

  /* ── Derived state ─────────────────────────────────────────────────── */
  const activeRec = useMemo(
    () =>
      recommendations.find((r) => r.id === selectedRecId) ??
      recommendations[0] ??
      null,
    [recommendations, selectedRecId],
  );

  const completedCount = useMemo(
    () => milestones.filter((m) => m.status === "completed").length,
    [milestones],
  );

  const firstIncompleteId = useMemo(() => {
    const found = milestones.find((m) => m.status !== "completed");
    return found?.id ?? null;
  }, [milestones]);

  const progressPct =
    milestones.length > 0
      ? Math.round((completedCount / milestones.length) * 100)
      : 0;

  /* ── Render ────────────────────────────────────────────────────────── */
  return (
    <main className="mx-auto min-h-screen w-full max-w-3xl px-6 py-10">
      {/* Header */}
      <header className="flex flex-col gap-4 border-b border-border/50 pb-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="size-4" />
            Dashboard
          </Link>
          <span className="text-border">/</span>
          <div className="flex items-center gap-2">
            <Map className="size-5 text-primary" />
            <h1 className="text-2xl font-bold sm:text-3xl">Your Roadmap</h1>
          </div>
        </div>
      </header>

      {/* Recommendation selector */}
      {recommendations.length > 1 && (
        <section className="mt-6 rounded-xl border border-primary/20 bg-primary/5 p-4">
          <p className="mb-2 text-xs font-semibold text-primary">
            Viewing roadmap for
          </p>
          <Select
            value={activeRec?.id ?? ""}
            onValueChange={onRecChange}
          >
            <SelectTrigger id="rec-selector" className="w-full">
              <SelectValue placeholder="Select a career path" />
            </SelectTrigger>
            <SelectContent>
              {(recommendations ?? []).map((r) => (
                <SelectItem key={r.id} value={r.id}>
                  {r.career_title}
                  {r.match_score != null ? ` — ${r.match_score}% match` : ""}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </section>
      )}

      {/* Single recommendation header */}
      {recommendations.length === 1 && activeRec && (
        <section className="mt-6 rounded-xl border border-primary/20 bg-primary/5 p-4">
          <p className="text-xs font-semibold text-primary">
            Roadmap for
          </p>
          <p className="mt-1 text-lg font-bold">{activeRec.career_title}</p>
        </section>
      )}

      {/* Progress bar */}
      {!loading && milestones.length > 0 && (
        <section className="mt-6 flex items-center gap-4">
          <div className="flex-1">
            <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-emerald-500 transition-all duration-500 ease-out"
                style={{ width: `${progressPct}%` }}
              />
            </div>
          </div>
          <span className="shrink-0 text-sm font-semibold text-muted-foreground">
            {completedCount}/{milestones.length} done
          </span>
        </section>
      )}

      {/* Loading skeleton */}
      {loading && <TimelineSkeleton prefersReduced={prefersReduced} />}

      {/* Empty state — no recommendations */}
      {!loading && recommendations.length === 0 && (
        <Card className="mt-10 border-border/60 bg-card/70">
          <CardContent className="p-8 text-center">
            <Sparkles className="mx-auto mb-4 size-10 text-primary/40" />
            <p className="text-lg font-semibold">No career roadmap yet</p>
            <p className="mt-2 text-sm text-muted-foreground">
              Head to the dashboard and generate your AI-powered career
              recommendations first — your roadmap milestones will appear here.
            </p>
            <Button asChild className="mt-6">
              <Link to="/dashboard">Go to Dashboard</Link>
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Empty state — no milestones for this recommendation */}
      {!loading && recommendations.length > 0 && milestones.length === 0 && (
        <Card className="mt-10 border-border/60 bg-card/70">
          <CardContent className="p-8 text-center">
            <Map className="mx-auto mb-4 size-10 text-primary/40" />
            <p className="text-lg font-semibold">No milestones yet</p>
            <p className="mt-2 text-sm text-muted-foreground">
              This career path doesn't have any milestones. Try selecting a
              different career or regenerate your recommendations.
            </p>
          </CardContent>
        </Card>
      )}

      {/* ─── Timeline ─── */}
      {!loading && milestones.length > 0 && (
        <section className="relative mt-8">
          {/* Vertical line */}
          <div className="absolute left-[19px] top-0 bottom-0 w-px bg-border/60" />

          <ol className="space-y-0">
            {(milestones ?? []).map((milestone) => {
              const isCompleted = milestone.status === "completed";
              const isNext = milestone.id === firstIncompleteId;
              const isUpdating = milestone.id === updatingId;

              return (
                <RevealOnScroll
                  as="li"
                  key={milestone.id}
                  className="relative flex gap-4 pb-8 last:pb-0"
                >
                  {/* Dot / icon on the timeline */}
                  <div
                    className={`
                      relative z-10 mt-1 flex size-10 shrink-0 items-center justify-center rounded-full border-2 transition-all duration-300
                      ${
                        isCompleted
                          ? "border-emerald-500 bg-emerald-500/20"
                          : isNext
                            ? "border-primary bg-primary/10 roadmap-pulse"
                            : "border-muted bg-muted/40"
                      }
                    `}
                  >
                    <AnimatePresence mode="wait">
                      {isCompleted ? (
                        <motion.div
                          key="completed"
                          variants={checkmarkPop}
                          initial="hidden"
                          animate="visible"
                          exit="exit"
                        >
                          <CheckCircle2 className="size-5 text-emerald-400" />
                        </motion.div>
                      ) : isNext ? (
                        <motion.div
                          key="next"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.15 }}
                        >
                          <Sparkles className="size-4 text-primary" />
                        </motion.div>
                      ) : (
                        <motion.div
                          key="pending"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.15 }}
                        >
                          <Circle className="size-4 text-muted-foreground/50" />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Card */}
                  <Card
                    className={`
                      flex-1 transition-all duration-300
                      ${
                        isCompleted
                          ? "border-emerald-500/30 bg-emerald-500/5"
                          : isNext
                            ? "border-primary/40 bg-primary/5 shadow-md shadow-primary/5"
                            : "border-border/40 bg-card/50"
                      }
                    `}
                  >
                    <CardContent className="p-4 sm:p-5">
                      <div className="flex items-start gap-3">
                        {/* Checkbox */}
                        <Checkbox
                          id={`milestone-${milestone.id}`}
                          checked={isCompleted}
                          disabled={isUpdating}
                          onCheckedChange={() => toggleMilestone(milestone)}
                          className={`
                            mt-0.5 size-5 rounded
                            ${
                              isCompleted
                                ? "border-emerald-500 bg-emerald-500 data-[state=checked]:bg-emerald-500 data-[state=checked]:text-white"
                                : ""
                            }
                          `}
                        />

                        <div className="flex-1 space-y-1.5">
                          {/* Title */}
                          <label
                            htmlFor={`milestone-${milestone.id}`}
                            className={`
                              block cursor-pointer text-sm font-semibold leading-snug sm:text-base
                              ${isCompleted ? "text-emerald-400 line-through decoration-emerald-500/40" : ""}
                            `}
                          >
                            {milestone.title}
                          </label>

                          {/* Description */}
                          {milestone.description && (
                            <p
                              className={`text-xs leading-relaxed sm:text-sm ${
                                isCompleted
                                  ? "text-muted-foreground/60"
                                  : "text-muted-foreground"
                              }`}
                            >
                              {milestone.description}
                            </p>
                          )}

                          {/* Category badge + status */}
                          <div className="flex flex-wrap items-center gap-2 pt-1">
                            <Badge
                              variant="outline"
                              className={`text-[11px] font-medium ${
                                isCompleted
                                  ? "border-emerald-500/30 text-emerald-400"
                                  : isNext
                                    ? "border-primary/30 text-primary"
                                    : "border-border/60 text-muted-foreground"
                              }`}
                            >
                              {milestone.category}
                            </Badge>

                            <AnimatePresence>
                              {isCompleted && (
                                <motion.span
                                  variants={checkmarkPop}
                                  initial="hidden"
                                  animate="visible"
                                  exit="exit"
                                  className="flex items-center gap-1 text-[11px] font-medium text-emerald-400"
                                >
                                  <Check className="size-3" />
                                  Completed
                                </motion.span>
                              )}
                            </AnimatePresence>

                            {isNext && (
                              <span className="text-[11px] font-semibold text-primary">
                                ↗ Next up
                              </span>
                            )}

                            {isUpdating && (
                              <Loader2 className="size-3.5 animate-spin text-muted-foreground" />
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </RevealOnScroll>
              );
            })}
          </ol>

          {/* Completion message */}
          {completedCount === milestones.length && milestones.length > 0 && (
            <div className="mt-8 flex flex-col items-center gap-2 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-6 text-center">
              <CheckCircle2 className="size-10 text-emerald-400" />
              <p className="text-lg font-bold text-emerald-400">
                Roadmap Complete! 🎉
              </p>
              <p className="text-sm text-muted-foreground">
                You've completed every milestone for this career path.
                Outstanding work!
              </p>
            </div>
          )}
        </section>
      )}
    </main>
  );
}

/* ────────────────────────────────────────────────────────────────────────── */
/*  Loading skeleton                                                         */
/* ────────────────────────────────────────────────────────────────────────── */

function TimelineSkeleton({ prefersReduced }: { prefersReduced: boolean }) {
  const skeletonItems = Array.from({ length: 4 }).map((_, i) => (
    <div key={i} className="flex gap-4">
      <Skeleton className="size-10 shrink-0 rounded-full" />
      <div className="flex-1 space-y-2 rounded-xl border border-border/40 bg-card/50 p-5">
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
        <div className="flex gap-2 pt-1">
          <Skeleton className="h-5 w-16 rounded-full" />
          <Skeleton className="h-5 w-20 rounded-full" />
        </div>
      </div>
    </div>
  ));

  return (
    <div className="mt-8 space-y-6">
      {/* Progress bar skeleton */}
      <div className="flex items-center gap-4">
        <Skeleton className="h-2 flex-1 rounded-full" />
        <Skeleton className="h-4 w-16" />
      </div>

      {/* Timeline items skeleton */}
      {prefersReduced ? (
        <div className="space-y-6">{skeletonItems}</div>
      ) : (
        <motion.div
          initial={{ opacity: 0.65 }}
          animate={{ opacity: [0.65, 1, 0.65] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="space-y-6"
        >
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex gap-4 animate-pulse">
              <Skeleton className="size-10 shrink-0 rounded-full" />
              <div className="flex-1 space-y-2 rounded-xl border border-border/40 bg-card/50 p-5">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
                <div className="flex gap-2 pt-1">
                  <Skeleton className="h-5 w-16 rounded-full" />
                  <Skeleton className="h-5 w-20 rounded-full" />
                </div>
              </div>
            </div>
          ))}
        </motion.div>
      )}
    </div>
  );
}
