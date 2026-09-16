import { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowLeft,
  BarChart3,
  CheckCircle2,
  DollarSign,
  MapPin,
  Sparkles,
  TrendingUp,
  Zap,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import { useAuth } from "@/hooks/useAuth";
import { usePrefersReducedMotion } from "@/hooks/use-reduced-motion";
import { getStaggerContainer, getFadeUp, getCardHover } from "@/lib/motion";
import { motion } from "framer-motion";

type Recommendation = Tables<"career_recommendations">;

export const Route = createFileRoute("/_authenticated/compare")({
  head: () => ({
    meta: [
      { title: "CareerCompass — Compare Careers" },
      {
        name: "description",
        content: "Compare your AI-recommended career paths side-by-side by match score, salary, growth, and required skills.",
      },
      { property: "og:title", content: "CareerCompass — Compare Careers" },
      {
        property: "og:description",
        content: "Compare your AI-recommended career paths side-by-side.",
      },
    ],
  }),
  component: ComparePage,
});

function ComparePage() {
  const { user, isGuest } = useAuth();
  const prefersReduced = usePrefersReducedMotion();

  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);

  const stagger = getStaggerContainer(prefersReduced);
  const fadeUp = getFadeUp(prefersReduced);
  const cardHover = getCardHover(prefersReduced);

  useEffect(() => {
    if (!user || isGuest) {
      setLoading(false);
      return;
    }

    async function fetchRecommendations() {
      try {
        const { data, error } = await supabase
          .from("career_recommendations")
          .select("*")
          .eq("user_id", user!.id)
          .order("match_score", { ascending: false });

        if (error) {
          console.error("[Compare] Error fetching recommendations:", error);
          setRecommendations([]);
        } else {
          // Rule 3: Use ?? [] fallback
          setRecommendations(data ?? []);
        }
      } catch (err) {
        console.error("[Compare] Exception fetching recommendations:", err);
        setRecommendations([]);
      } finally {
        setLoading(false);
      }
    }

    fetchRecommendations();
  }, [user, isGuest]);

  return (
    <main className="mx-auto min-h-screen w-full max-w-6xl px-6 py-10">
      {/* Header */}
      <header className="mb-8 border-b border-border/50 pb-6">
        <Link to="/dashboard">
          <Button variant="ghost" size="sm" className="mb-4 gap-2 text-xs">
            <ArrowLeft className="size-4" /> Back to Dashboard
          </Button>
        </Link>
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <BarChart3 className="size-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Career Comparison</h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              Side-by-side evaluation of your AI-matched career recommendations
            </p>
          </div>
        </div>
      </header>

      {/* Content */}
      {loading ? (
        <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i} className="border-border/60 bg-card/70 animate-pulse p-6 space-y-4">
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-8 w-full" />
            </Card>
          ))}
        </div>
      ) : (recommendations ?? []).length === 0 ? (
        <Card className="border-border/60 bg-card/70 text-center p-8">
          <CardContent className="space-y-3">
            <Sparkles className="mx-auto size-10 text-primary/40" />
            <h3 className="text-base font-semibold">No career recommendations found</h3>
            <p className="text-xs text-muted-foreground max-w-md mx-auto">
              Generate recommendations on your dashboard first to compare career options side-by-side.
            </p>
            <Link to="/dashboard">
              <Button size="sm" className="mt-2 gap-2">
                Go to Dashboard
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <motion.div
          variants={stagger}
          initial="hidden"
          animate="visible"
          /* Rule: Below 640px (sm), stack vertically (grid-cols-1). Above 640px, side-by-side grid */
          className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
        >
          {(recommendations ?? []).map((rec) => (
            <motion.div
              key={rec.id}
              variants={fadeUp}
              whileHover={cardHover.whileHover}
              className="flex flex-col h-full rounded-2xl border border-border/70 bg-card/80 p-5 shadow-sm transition-all"
            >
              {/* Title & Match Score */}
              <div className="mb-4">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="text-lg font-bold text-foreground leading-snug">
                    {rec.career_title}
                  </h3>
                  <Badge className="bg-primary/10 text-primary border-primary/20 shrink-0">
                    {rec.match_score ?? 85}% Match
                  </Badge>
                </div>
                <div className="mt-2 space-y-1">
                  <div className="flex justify-between text-[11px] text-muted-foreground font-medium">
                    <span>Fit Score</span>
                    <span>{rec.match_score ?? 85}%</span>
                  </div>
                  <Progress value={rec.match_score ?? 85} className="h-1.5" />
                </div>
              </div>

              {/* Salary & Growth Outlook */}
              <div className="grid grid-cols-2 gap-3 mb-4 rounded-xl bg-muted/40 p-3 text-xs">
                <div>
                  <span className="flex items-center gap-1 text-[11px] font-medium text-muted-foreground">
                    <DollarSign className="size-3 text-emerald-500" /> Salary Range
                  </span>
                  <p className="font-semibold text-foreground mt-0.5">
                    {rec.salary_range ?? "N/A"}
                  </p>
                </div>
                <div>
                  <span className="flex items-center gap-1 text-[11px] font-medium text-muted-foreground">
                    <TrendingUp className="size-3 text-blue-500" /> Demand
                  </span>
                  <p className="font-semibold text-foreground mt-0.5">
                    {rec.growth_outlook ?? "High Demand"}
                  </p>
                </div>
              </div>

              {/* Why it fits / Description */}
              <div className="mb-4 flex-1">
                <span className="text-xs font-semibold text-foreground block mb-1">
                  Why it fits you:
                </span>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {rec.description ?? "Strong alignment with your stream and background."}
                </p>
              </div>

              {/* Required Skills as Tags */}
              <div className="mb-5">
                <span className="text-xs font-semibold text-foreground block mb-2">
                  Required Skills:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {((rec.required_skills as string[]) ?? []).length > 0 ? (
                    ((rec.required_skills as string[]) ?? []).map((skill) => (
                      <Badge
                        key={skill}
                        variant="secondary"
                        className="text-[11px] font-normal py-0.5"
                      >
                        {skill}
                      </Badge>
                    ))
                  ) : (
                    <span className="text-xs text-muted-foreground italic">
                      Standard industry skills
                    </span>
                  )}
                </div>
              </div>

              {/* View Roadmap Action */}
              <Link to="/roadmap" search={{ rec: rec.id }} className="mt-auto">
                <Button variant="outline" size="sm" className="w-full gap-1.5 text-xs">
                  <Zap className="size-3.5 text-amber-500" /> View Roadmap
                </Button>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      )}
    </main>
  );
}
