import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  AlertCircle,
  ArrowRight,
  BarChart3,
  BookOpen,
  CheckCircle,
  CheckCircle2,
  Circle,
  Compass,
  DollarSign,
  GraduationCap,
  Info,
  Map as MapIcon,
  Sparkles,
  TrendingUp,
  UserCheck,
  Zap,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { usePrefersReducedMotion } from "@/hooks/use-reduced-motion";
import { getStaggerContainer, getFadeUp, getCardHover } from "@/lib/motion";
import { RevealOnScroll } from "@/components/motion/RevealOnScroll";
import { DEMO_PROFILE, DEMO_RECOMMENDATIONS, DEMO_MILESTONES } from "@/lib/demoData";
import { motion } from "framer-motion";

export const Route = createFileRoute("/demo")({
  head: () => ({
    meta: [
      { title: "CareerCompass — Interactive Demo Mode" },
      {
        name: "description",
        content:
          "Explore an interactive zero-cost demo of CareerCompass AI recommendations, skill gap analysis, and roadmaps.",
      },
      { property: "og:title", content: "CareerCompass — Interactive Demo Mode" },
    ],
  }),
  component: DemoPage,
});

function DemoPage() {
  const prefersReduced = usePrefersReducedMotion();
  const [selectedRecId, setSelectedRecId] = useState(DEMO_RECOMMENDATIONS[0].id);
  const [demoMilestones, setDemoMilestones] = useState(DEMO_MILESTONES);
  const [activeTab, setActiveTab] = useState("dashboard");

  const stagger = getStaggerContainer(prefersReduced);
  const fadeUp = getFadeUp(prefersReduced);
  const cardHover = getCardHover(prefersReduced);

  const selectedRec =
    DEMO_RECOMMENDATIONS.find((r) => r.id === selectedRecId) ?? DEMO_RECOMMENDATIONS[0];

  const toggleMilestone = (id: string) => {
    setDemoMilestones((prev) =>
      prev.map((m) =>
        m.id === id
          ? {
              ...m,
              status: m.status === "completed" ? "pending" : "completed",
            }
          : m,
      ),
    );
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Persistent Demo Mode Banner */}
      <div className="sticky top-0 z-40 border-b border-primary/20 bg-primary/10 px-4 py-2.5 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 text-xs font-medium text-foreground">
          <div className="flex items-center gap-2">
            <Info className="size-4 shrink-0 text-primary" />
            <span>
              You're viewing demo data — sign up to generate your own personalized roadmap.
            </span>
          </div>
          <Link to="/auth">
            <Button size="sm" className="h-7 gap-1.5 px-3 text-xs shadow-sm">
              <UserCheck className="size-3.5" /> Sign Up Free
            </Button>
          </Link>
        </div>
      </div>

      <main className="mx-auto max-w-6xl px-6 py-8">
        {/* Navigation Tabs */}
        <div className="mb-8 flex flex-col gap-4 border-b border-border/60 pb-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <Badge variant="outline" className="mb-1 text-[10px] uppercase tracking-wide">
              Instant Demo Mode
            </Badge>
            <h1 className="text-2xl font-bold">CareerCompass Interactive Preview</h1>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full sm:w-auto">
            <TabsList className="grid w-full grid-cols-4 sm:w-auto">
              <TabsTrigger value="dashboard" className="text-xs">
                Dashboard
              </TabsTrigger>
              <TabsTrigger value="roadmap" className="text-xs">
                Roadmap
              </TabsTrigger>
              <TabsTrigger value="compare" className="text-xs">
                Compare
              </TabsTrigger>
              <TabsTrigger value="colleges" className="text-xs">
                Colleges
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Tab 1: Dashboard & Skill Gap Tracker */}
        {activeTab === "dashboard" && (
          <div className="space-y-8">
            <section>
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="size-5 text-primary" />
                  <h2 className="text-xl font-bold">AI Recommended Careers (Demo Student)</h2>
                </div>
              </div>

              <motion.div
                variants={stagger}
                initial="hidden"
                animate="visible"
                className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
              >
                {DEMO_RECOMMENDATIONS.map((rec) => (
                  <div
                    key={rec.id}
                    onClick={() => setSelectedRecId(rec.id)}
                    className={`cursor-pointer rounded-2xl transition-all ${
                      selectedRecId === rec.id
                        ? "ring-2 ring-primary ring-offset-2 ring-offset-background"
                        : ""
                    }`}
                  >
                    <motion.div
                      variants={fadeUp}
                      whileHover={cardHover.whileHover}
                      className="flex flex-col justify-between h-full rounded-2xl border border-border/70 bg-card p-5 shadow-sm"
                    >
                      <div>
                        <div className="flex items-start justify-between gap-2">
                          <h3 className="text-base font-bold text-foreground leading-tight">
                            {rec.career_title}
                          </h3>
                          <Badge className="bg-primary/10 text-primary border-primary/20 shrink-0">
                            {rec.match_score}%
                          </Badge>
                        </div>
                        <p className="mt-2 text-xs text-muted-foreground line-clamp-2">
                          {rec.description}
                        </p>
                      </div>

                      <div className="mt-4 pt-3 border-t border-border/50 flex items-center justify-between text-xs">
                        <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                          {rec.salary_range}
                        </span>
                        <span className="text-muted-foreground text-[11px]">
                          {rec.growth_outlook}
                        </span>
                      </div>
                    </motion.div>
                  </div>
                ))}
              </motion.div>
            </section>

            {/* Skill Gap Tracker */}
            <DemoSkillGapTracker rec={selectedRec} userSkills={DEMO_PROFILE.current_skills} />
          </div>
        )}

        {/* Tab 2: Roadmap */}
        {activeTab === "roadmap" && (
          <div className="space-y-6">
            <Card className="border-border/70 bg-card/80 p-6">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between mb-6">
                <div>
                  <h2 className="text-lg font-bold flex items-center gap-2">
                    <MapIcon className="size-5 text-primary" /> Roadmap: {selectedRec.career_title}
                  </h2>
                  <p className="text-xs text-muted-foreground mt-1">
                    Click checkboxes to toggle milestone completion in this demo.
                  </p>
                </div>
                <Badge variant="outline" className="w-fit">
                  {demoMilestones.filter((m) => m.status === "completed").length} of{" "}
                  {demoMilestones.length} Done
                </Badge>
              </div>

              <div className="space-y-4">
                {demoMilestones.map((m) => (
                  <div
                    key={m.id}
                    onClick={() => toggleMilestone(m.id)}
                    className="flex items-start gap-3 rounded-xl border border-border/60 bg-card p-4 cursor-pointer hover:border-primary/40 transition-colors"
                  >
                    <button className="mt-0.5 shrink-0 text-primary">
                      {m.status === "completed" ? (
                        <CheckCircle2 className="size-5 text-emerald-500 fill-emerald-500/10" />
                      ) : (
                        <Circle className="size-5 text-muted-foreground" />
                      )}
                    </button>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4
                          className={`text-sm font-semibold ${
                            m.status === "completed"
                              ? "line-through text-muted-foreground"
                              : "text-foreground"
                          }`}
                        >
                          {m.title}
                        </h4>
                        <Badge variant="secondary" className="text-[10px]">
                          {m.category}
                        </Badge>
                      </div>
                      <p className="mt-1 text-xs text-muted-foreground">{m.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        )}

        {/* Tab 3: Comparison */}
        {activeTab === "compare" && (
          <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {DEMO_RECOMMENDATIONS.map((rec) => (
              <Card key={rec.id} className="border-border/70 bg-card p-5 space-y-4">
                <div className="flex justify-between items-start">
                  <h3 className="font-bold text-base">{rec.career_title}</h3>
                  <Badge>{rec.match_score}% Match</Badge>
                </div>
                <div className="space-y-1 text-xs text-muted-foreground">
                  <p>
                    <strong>Salary:</strong> {rec.salary_range}
                  </p>
                  <p>
                    <strong>Demand:</strong> {rec.growth_outlook}
                  </p>
                </div>
                <p className="text-xs text-muted-foreground">{rec.description}</p>
                <div>
                  <span className="text-xs font-semibold block mb-1.5">Required Skills:</span>
                  <div className="flex flex-wrap gap-1">
                    {rec.required_skills.map((s) => (
                      <Badge key={s} variant="outline" className="text-[10px]">
                        {s}
                      </Badge>
                    ))}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Tab 4: Colleges */}
        {activeTab === "colleges" && (
          <div className="grid gap-6 grid-cols-1 sm:grid-cols-2">
            {DEMO_RECOMMENDATIONS.flatMap((r) => r.colleges).map((col, i) => (
              <Card key={i} className="border-border/70 bg-card p-5 space-y-3">
                <div className="flex justify-between items-start">
                  <h3 className="font-bold text-base text-foreground">{col.name}</h3>
                  <Badge variant="secondary" className="text-[10px]">
                    {col.city}
                  </Badge>
                </div>
                <p className="text-xs font-semibold text-primary">{col.course}</p>
                <div className="text-xs text-muted-foreground space-y-1">
                  <p>
                    <strong>Fees:</strong> {col.fees_total}
                  </p>
                  <p>
                    <strong>Entrance Exam:</strong> {col.entrance}
                  </p>
                </div>
                <p className="text-xs text-muted-foreground italic leading-relaxed">{col.why}</p>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

function DemoSkillGapTracker({
  rec,
  userSkills,
}: {
  rec: (typeof DEMO_RECOMMENDATIONS)[0];
  userSkills: string[];
}) {
  const normalizedUserSkills = new Set(userSkills.map((s) => s.toLowerCase()));
  const acquired = rec.required_skills.filter((s) => normalizedUserSkills.has(s.toLowerCase()));
  const missing = rec.required_skills.filter((s) => !normalizedUserSkills.has(s.toLowerCase()));
  const highPriority = missing.slice(0, 2);
  const remaining = missing.slice(2);
  const percentage = Math.round((acquired.length / rec.required_skills.length) * 100);

  return (
    <RevealOnScroll>
      <Card className="border-border/70 bg-card p-6 shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <div>
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <Zap className="size-4 text-amber-500" /> Demo Skill Gap Tracker: {rec.career_title}
            </CardTitle>
            <p className="text-xs text-muted-foreground mt-0.5">
              Matching target skills against Demo Student Profile
            </p>
          </div>
          <span className="text-xl font-bold text-primary">{percentage}%</span>
        </div>

        <Progress value={percentage} className="h-2 mb-4" />

        <div className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-xl bg-emerald-500/10 p-3">
            <p className="text-xs font-semibold text-emerald-600 mb-1 flex items-center gap-1">
              <CheckCircle className="size-3" /> Acquired ({acquired.length})
            </p>
            <div className="flex flex-wrap gap-1">
              {acquired.map((s) => (
                <Badge
                  key={s}
                  className="bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 text-[10px]"
                >
                  ✓ {s}
                </Badge>
              ))}
            </div>
          </div>

          <div className="rounded-xl bg-rose-500/10 p-3">
            <p className="text-xs font-semibold text-rose-600 mb-1 flex items-center gap-1">
              <AlertCircle className="size-3" /> High Priority ({highPriority.length})
            </p>
            <div className="flex flex-wrap gap-1">
              {highPriority.map((s) => (
                <Badge
                  key={s}
                  className="bg-rose-500/20 text-rose-700 dark:text-rose-300 text-[10px]"
                >
                  ! {s}
                </Badge>
              ))}
            </div>
          </div>

          <div className="rounded-xl bg-blue-500/10 p-3">
            <p className="text-xs font-semibold text-blue-600 mb-1 flex items-center gap-1">
              <BookOpen className="size-3" /> Needs to Learn ({remaining.length})
            </p>
            <div className="flex flex-wrap gap-1">
              {remaining.map((s) => (
                <Badge
                  key={s}
                  className="bg-blue-500/20 text-blue-700 dark:text-blue-300 text-[10px]"
                >
                  + {s}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </Card>
    </RevealOnScroll>
  );
}
