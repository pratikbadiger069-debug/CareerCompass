import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { motion } from "framer-motion";
import {
  Compass,
  GraduationCap,
  MessageSquare,
  Route as RouteIcon,
  Sparkles,
  Target,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { RevealOnScroll } from "@/components/motion/RevealOnScroll";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { usePrefersReducedMotion } from "@/hooks/use-reduced-motion";
import {
  getFadeUp,
  getStaggerContainer,
  getScaleOnHover,
  getCardHover,
} from "@/lib/motion";

const DESCRIPTION =
  "CareerCompass matches you to careers you'll thrive in, builds a step-by-step roadmap, answers your questions and tracks the colleges you care about.";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "CareerCompass — AI-Powered Career & Education Advisor" },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: "CareerCompass — AI-Powered Career & Education Advisor" },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Landing,
});

const FEATURES = [
  {
    icon: Target,
    title: "Career matches",
    body: "Ranked career paths with match scores, skills to build, salary ranges and growth outlook.",
  },
  {
    icon: RouteIcon,
    title: "Personal roadmap",
    body: "Exams, courses, skills and experience broken into dated milestones you can tick off.",
  },
  {
    icon: MessageSquare,
    title: "AI advisor chat",
    body: "Ask anything about streams, majors, entrance tests or switching fields — any time.",
  },
  {
    icon: GraduationCap,
    title: "Saved colleges",
    body: "Shortlist programs with tuition, deadlines and notes so nothing slips past you.",
  },
];

const STEPS = [
  {
    title: "Tell us about you",
    body: "Your grade, interests, strengths and where you'd like to study or work.",
  },
  {
    title: "Get matched",
    body: "CareerCompass reads your profile and surfaces careers that genuinely fit — with reasons.",
  },
  {
    title: "Follow your roadmap",
    body: "Turn the match into milestones, colleges and next steps you can act on this month.",
  },
];

function Landing() {
  const navigate = useNavigate();
  const { isAuthenticated, loading } = useAuth();
  const [demoBusy, setDemoBusy] = useState(false);
  const prefersReduced = usePrefersReducedMotion();

  const fadeUp = getFadeUp(prefersReduced);
  const stagger = getStaggerContainer(prefersReduced);
  const scale = getScaleOnHover(prefersReduced);
  const card = getCardHover(prefersReduced);

  async function startDemo(): Promise<void> {
    if (isAuthenticated) {
      navigate({ to: "/dashboard" });
      return;
    }
    setDemoBusy(true);
    const { error } = await supabase.auth.signInAnonymously();
    setDemoBusy(false);
    if (error) {
      toast.error("Couldn't start demo mode. Please try again.");
      return;
    }
    toast.success("Demo mode ready — your progress is saved as a guest.");
    navigate({ to: "/dashboard" });
  }

  /* ── Hero stagger timing ──────────────────────────────────────────── */
  const heroContainer = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: prefersReduced ? 0 : 0.15,
      },
    },
  };

  return (
    <div className="min-h-screen">
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-6">
        <span className="font-display text-lg font-bold tracking-tight">
          Career<span className="text-primary">Compass</span>
        </span>
        {!loading && isAuthenticated ? (
          <Button asChild size="sm">
            <Link to="/dashboard">Go to dashboard</Link>
          </Button>
        ) : (
          <Button asChild variant="ghost" size="sm">
            <Link to="/auth" search={{ mode: "signin" }}>
              Sign in
            </Link>
          </Button>
        )}
      </header>

      {/* ─── Hero ─── */}
      <section className="hero-glow border-b border-border/50">
        <motion.div
          variants={heroContainer}
          initial="hidden"
          animate="visible"
          className="mx-auto w-full max-w-4xl px-6 pt-16 pb-24 text-center"
        >
          {/* Badge */}
          <motion.span
            variants={fadeUp}
            className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-xs font-semibold tracking-wide text-primary uppercase"
          >
            <Sparkles className="size-3.5" />
            Guidance that keeps up with you
          </motion.span>

          {/* Headline */}
          <motion.h1
            variants={fadeUp}
            className="mt-8 text-4xl leading-[1.08] font-bold text-balance sm:text-6xl"
          >
            CareerCompass — AI-Powered Career &amp; Education Advisor
          </motion.h1>

          {/* Subheadline */}
          <motion.p
            variants={fadeUp}
            className="mx-auto mt-6 max-w-2xl text-base text-pretty text-muted-foreground sm:text-lg"
          >
            {DESCRIPTION}
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            variants={fadeUp}
            className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row"
          >
            <motion.div {...scale}>
              <Button asChild size="lg" className="w-full font-semibold sm:w-auto">
                <Link to="/auth" search={{ mode: "signup" }}>
                  Sign Up
                </Link>
              </Button>
            </motion.div>
            <motion.div {...scale}>
              <Button
                size="lg"
                variant="outline"
                disabled={demoBusy}
                onClick={startDemo}
                className="w-full border-primary/60 text-primary hover:bg-primary/10 hover:text-primary sm:w-auto"
              >
                {demoBusy ? "Starting demo…" : "Try Demo Mode"}
              </Button>
            </motion.div>
          </motion.div>

          <motion.p
            variants={fadeUp}
            className="mt-4 text-xs text-muted-foreground"
          >
            Demo mode opens a guest workspace instantly — no email needed.
          </motion.p>
        </motion.div>
      </section>

      {/* ─── How it works ─── */}
      <section className="mx-auto w-full max-w-6xl px-6 py-20">
        <RevealOnScroll>
          <h2 className="text-2xl font-bold sm:text-3xl">How it works</h2>
        </RevealOnScroll>

        <motion.ol
          variants={stagger}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          className="mt-10 grid gap-6 overflow-hidden md:grid-cols-3"
        >
          {STEPS.map((step, i) => (
            <motion.li
              key={step.title}
              variants={fadeUp}
              {...card}
              className="rounded-2xl border border-border/60 bg-card/60 p-6 backdrop-blur"
            >
              <span className="font-display text-3xl font-bold text-primary/70">0{i + 1}</span>
              <h3 className="mt-4 text-lg font-semibold">{step.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{step.body}</p>
            </motion.li>
          ))}
        </motion.ol>
      </section>

      {/* ─── Features ─── */}
      <section className="border-y border-border/50 bg-charcoal-deep/60">
        <div className="mx-auto w-full max-w-6xl px-6 py-20">
          <RevealOnScroll>
            <h2 className="text-2xl font-bold sm:text-3xl">Everything in one place</h2>
          </RevealOnScroll>

          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.15 }}
            className="mt-10 grid gap-6 overflow-hidden sm:grid-cols-2"
          >
            {FEATURES.map(({ icon: Icon, title, body }) => (
              <motion.article
                key={title}
                variants={fadeUp}
                {...card}
                className="flex gap-4 rounded-2xl border border-border/60 bg-card/60 p-6"
              >
                <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/15 text-primary">
                  <Icon className="size-5" />
                </span>
                <div>
                  <h3 className="text-lg font-semibold">{title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{body}</p>
                </div>
              </motion.article>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ─── Final CTA ─── */}
      <RevealOnScroll className="mx-auto w-full max-w-3xl px-6 py-24 text-center">
        <Compass className="mx-auto size-8 text-primary" />
        <h2 className="mt-6 text-2xl font-bold sm:text-3xl">Find the path that fits you</h2>
        <p className="mt-3 text-muted-foreground">
          Start free today and keep every match, milestone and college in one workspace.
        </p>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <motion.div {...scale}>
            <Button asChild size="lg" className="w-full font-semibold sm:w-auto">
              <Link to="/auth" search={{ mode: "signup" }}>
                Sign Up
              </Link>
            </Button>
          </motion.div>
          <motion.div {...scale}>
            <Button
              size="lg"
              variant="outline"
              disabled={demoBusy}
              onClick={startDemo}
              className="w-full border-primary/60 text-primary hover:bg-primary/10 hover:text-primary sm:w-auto"
            >
              Try Demo Mode
            </Button>
          </motion.div>
        </div>
      </RevealOnScroll>

      <footer className="border-t border-border/50 py-8 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} CareerCompass. AI-powered career &amp; education guidance.
      </footer>
    </div>
  );
}
