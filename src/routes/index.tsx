import { useEffect, useRef, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  ArrowUpRight,
  Compass,
  GraduationCap,
  MessageSquare,
  Route as RouteIcon,
  Sparkles,
  Target,
  CheckCircle2,
  Brain,
  TrendingUp,
  Users,
  Zap,
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

// GSAP (loaded dynamically to keep SSR safe)
let gsap: typeof import("gsap").gsap | null = null;
let ScrollTrigger: typeof import("gsap/ScrollTrigger").ScrollTrigger | null = null;

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
    color: "oklch(0.72 0.19 145)",
  },
  {
    icon: RouteIcon,
    title: "Personal roadmap",
    body: "Exams, courses, skills and experience broken into dated milestones you can tick off.",
    color: "oklch(0.72 0.19 45)",
  },
  {
    icon: MessageSquare,
    title: "AI advisor chat",
    body: "Ask anything about streams, majors, entrance tests or switching fields — any time.",
    color: "oklch(0.70 0.11 210)",
  },
  {
    icon: GraduationCap,
    title: "Saved colleges",
    body: "Shortlist programs with tuition, deadlines and notes so nothing slips past you.",
    color: "oklch(0.60 0.15 300)",
  },
];

const STEPS = [
  { num: "01", title: "Tell us about you", body: "Your grade, interests, strengths and where you'd like to study or work." },
  { num: "02", title: "Get matched", body: "CareerCompass reads your profile and surfaces careers that genuinely fit — with reasons." },
  { num: "03", title: "Follow your roadmap", body: "Turn the match into milestones, colleges and next steps you can act on this month." },
];

const STATS = [
  { end: 94, suffix: "%", label: "Match accuracy" },
  { end: 12000, suffix: "+", label: "Career paths mapped" },
  { end: 4900, suffix: "+", label: "Students guided" },
  { end: 48, suffix: "h", label: "Avg. time to clarity" },
];

const PARTNERS = [
  "MIT OpenCourseWare",
  "Coursera",
  "LinkedIn Learning",
  "edX",
  "Khan Academy",
  "Udemy",
  "Google Career Certs",
  "Microsoft Learn",
];

async function loadGsap() {
  if (gsap && ScrollTrigger) return { gsap, ScrollTrigger };
  const g = await import("gsap");
  const st = await import("gsap/ScrollTrigger");
  gsap = g.gsap;
  ScrollTrigger = st.ScrollTrigger;
  gsap.registerPlugin(ScrollTrigger);
  return { gsap, ScrollTrigger };
}

function Landing() {
  const navigate = useNavigate();
  const { isAuthenticated, loading } = useAuth();
  const [demoBusy, setDemoBusy] = useState(false);

  const heroRef = useRef<HTMLElement>(null);
  const navRef = useRef<HTMLElement>(null);
  const marqueeRef = useRef<HTMLDivElement>(null);
  const aboutRef = useRef<HTMLElement>(null);
  const featuresRef = useRef<HTMLElement>(null);
  const stepsRef = useRef<HTMLElement>(null);
  const statsRef = useRef<HTMLElement>(null);
  const ctaRef = useRef<HTMLElement>(null);

  async function startDemo() {
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

  useEffect(() => {
    let ctx: ReturnType<typeof import("gsap").gsap.context> | null = null;
    let cleanupNav: (() => void) | undefined;

    loadGsap().then(({ gsap: g, ScrollTrigger: ST }) => {
      ctx = g.context(() => {
        // ── Navbar scroll behaviour ────────────────────────────────────────
        if (navRef.current) {
          const nav = navRef.current;
          ST.create({
            start: "top -60",
            onUpdate: (self) => {
              if (self.scroll() > 60) nav.classList.add("nav-scrolled");
              else nav.classList.remove("nav-scrolled");
            },
          });
        }

        // ── Hero entrance stagger ──────────────────────────────────────────
        if (heroRef.current) {
          const items = heroRef.current.querySelectorAll("[data-hero]");
          g.fromTo(
            items,
            { y: 45, opacity: 0 },
            {
              y: 0,
              opacity: 1,
              duration: 0.95,
              ease: "power3.out",
              stagger: 0.13,
              delay: 0.1,
              clearProps: "all",
            },
          );
        }

        // ── About section scroll reveal ────────────────────────────────────
        if (aboutRef.current) {
          const tag = aboutRef.current.querySelector("[data-tag]");
          const title = aboutRef.current.querySelectorAll("[data-title-word]");
          const cards = aboutRef.current.querySelectorAll("[data-about-card]");

          if (tag) {
            g.fromTo(tag, { x: -20, opacity: 0 }, {
              x: 0, opacity: 1, duration: 0.7, ease: "power3.out",
              scrollTrigger: { trigger: tag, start: "top 88%", toggleActions: "play none none none" },
            });
          }
          if (title.length) {
            g.fromTo(title, { y: "110%", opacity: 0 }, {
              y: "0%", opacity: 1, duration: 0.65, ease: "power3.out", stagger: 0.055,
              scrollTrigger: { trigger: aboutRef.current, start: "top 82%", toggleActions: "play none none none" },
            });
          }
          if (cards.length) {
            g.fromTo(cards, { y: 30, opacity: 0 }, {
              y: 0, opacity: 1, duration: 0.75, ease: "power3.out", stagger: 0.1,
              scrollTrigger: { trigger: aboutRef.current, start: "top 72%", toggleActions: "play none none none" },
            });
          }
        }

        // ── Features scroll reveal ─────────────────────────────────────────
        if (featuresRef.current) {
          const tag = featuresRef.current.querySelector("[data-tag]");
          const title = featuresRef.current.querySelector("[data-scroll]");
          const cards = featuresRef.current.querySelectorAll("[data-feature-card]");

          if (tag) {
            g.fromTo(tag, { x: -20, opacity: 0 }, {
              x: 0, opacity: 1, duration: 0.7, ease: "power3.out",
              scrollTrigger: { trigger: tag, start: "top 88%", toggleActions: "play none none none" },
            });
          }
          if (title) {
            g.fromTo(title, { y: 30, opacity: 0 }, {
              y: 0, opacity: 1, duration: 0.75, ease: "power3.out",
              scrollTrigger: { trigger: title, start: "top 88%", toggleActions: "play none none none" },
            });
          }
          if (cards.length) {
            g.fromTo(cards, { y: 35, opacity: 0 }, {
              y: 0, opacity: 1, duration: 0.75, ease: "power3.out", stagger: 0.1,
              scrollTrigger: { trigger: featuresRef.current, start: "top 78%", toggleActions: "play none none none" },
            });
          }
        }

        // ── Steps scroll reveal ────────────────────────────────────────────
        if (stepsRef.current) {
          const items = stepsRef.current.querySelectorAll("[data-step]");
          g.fromTo(items, { y: 35, opacity: 0 }, {
            y: 0, opacity: 1, duration: 0.75, ease: "power3.out", stagger: 0.12,
            scrollTrigger: { trigger: stepsRef.current, start: "top 80%", toggleActions: "play none none none" },
          });
        }

        // ── Stats counter animation ────────────────────────────────────────
        if (statsRef.current) {
          const counters = statsRef.current.querySelectorAll<HTMLElement>("[data-counter]");
          counters.forEach((el) => {
            const end = parseInt(el.dataset["counter"] ?? "0", 10);
            const suffix = el.dataset["suffix"] ?? "";
            const obj = { val: 0 };
            g.to(obj, {
              val: end,
              duration: 2.2,
              ease: "power2.out",
              onUpdate: () => {
                el.textContent = `${Math.round(obj.val).toLocaleString()}${suffix}`;
              },
              scrollTrigger: { trigger: el, start: "top 88%", toggleActions: "play none none none" },
            });
          });

          const statCards = statsRef.current.querySelectorAll("[data-stat-card]");
          g.fromTo(statCards, { y: 25, opacity: 0 }, {
            y: 0, opacity: 1, duration: 0.7, ease: "power3.out", stagger: 0.1,
            scrollTrigger: { trigger: statsRef.current, start: "top 82%", toggleActions: "play none none none" },
          });
        }

        // ── CTA section ────────────────────────────────────────────────────
        if (ctaRef.current) {
          const items = ctaRef.current.querySelectorAll("[data-cta]");
          g.fromTo(items, { y: 30, opacity: 0 }, {
            y: 0, opacity: 1, duration: 0.8, ease: "power3.out", stagger: 0.12,
            scrollTrigger: { trigger: ctaRef.current, start: "top 82%", toggleActions: "play none none none" },
          });
        }
      });
    });

    return () => {
      ctx?.revert();
      cleanupNav?.();
      ScrollTrigger?.getAll().forEach((t) => t.kill());
    };
  }, []);

  return (
    <div className="min-h-screen bg-charcoal-deep overflow-x-hidden">
      {/* ─── Navbar ──────────────────────────────────────────────────────── */}
      <header
        ref={navRef}
        className="fixed top-0 z-50 w-full border-b border-border/0 transition-all duration-500"
        style={{ transitionProperty: "background, border-color, box-shadow, backdrop-filter" }}
      >
        <div className="mx-auto flex h-[68px] max-w-6xl items-center justify-between px-6">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 font-display text-lg font-bold tracking-tight">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/15 text-primary ring-1 ring-primary/20 transition-all hover:scale-105 hover:bg-primary/25">
              <Compass className="size-5" />
            </div>
            <span className="text-foreground">
              Career<span className="text-primary">Compass</span>
            </span>
          </Link>

          {/* Nav links — desktop */}
          <nav className="hidden items-center gap-1 md:flex">
            {["Features", "How it works", "Stats"].map((l) => (
              <a
                key={l}
                href={`#${l.toLowerCase().replace(/\s+/g, "-")}`}
                className="rounded-lg px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-border/40 hover:text-foreground"
              >
                {l}
              </a>
            ))}
          </nav>

          {/* Right CTA */}
          <div className="flex items-center gap-3">
            {!loading && isAuthenticated ? (
              <Link
                to="/dashboard"
                className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground transition-all hover:bg-primary/90 hover:shadow-[0_0_24px_oklch(0.72_0.19_45/40%)]"
              >
                Dashboard <ArrowUpRight className="size-3.5" />
              </Link>
            ) : (
              <>
                <Link
                  to="/auth"
                  search={{ mode: "signin" }}
                  className="hidden rounded-full px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground sm:block"
                >
                  Sign in
                </Link>
                <Link
                  to="/auth"
                  search={{ mode: "signup" }}
                  className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground transition-all hover:bg-primary/90 hover:shadow-[0_0_24px_oklch(0.72_0.19_45/40%)]"
                >
                  Get started <ArrowUpRight className="size-3.5" />
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* ─── Hero ────────────────────────────────────────────────────────── */}
      <section
        ref={heroRef}
        id="hero"
        className="hero-glow dot-grid-bg relative min-h-screen flex flex-col items-center justify-center overflow-hidden px-6 pt-24 pb-16"
      >
        {/* Background glow orbs */}
        <div
          className="pointer-events-none absolute -top-32 left-1/2 -translate-x-1/2 h-[600px] w-[600px] rounded-full opacity-25"
          style={{ background: "radial-gradient(circle, oklch(0.72 0.19 45 / 35%) 0%, transparent 70%)" }}
        />
        <div
          className="pointer-events-none absolute bottom-0 right-0 h-[400px] w-[400px] opacity-15"
          style={{ background: "radial-gradient(circle, oklch(0.27 0.015 260 / 80%) 0%, transparent 70%)" }}
        />

        <div className="relative z-10 mx-auto w-full max-w-4xl text-center">
          {/* Section tag */}
          <span data-hero className="section-tag mb-8 inline-flex">
            <Sparkles className="size-3.5" />
            AI-Powered Career Guidance
          </span>

          {/* Headline */}
          <h1 data-hero className="mt-2 text-balance text-5xl font-bold leading-[1.05] tracking-tight sm:text-6xl lg:text-7xl">
            Find your path with{" "}
            <span className="gradient-text">AI precision</span>
          </h1>

          {/* Sub-headline */}
          <p data-hero className="mx-auto mt-7 max-w-2xl text-pretty text-base text-muted-foreground sm:text-lg">
            {DESCRIPTION}
          </p>

          {/* CTA buttons */}
          <div data-hero className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              to="/auth"
              search={{ mode: "signup" }}
              className="group inline-flex items-center gap-2.5 rounded-full bg-primary px-7 py-3.5 text-sm font-bold text-primary-foreground shadow-[0_0_32px_oklch(0.72_0.19_45/30%)] transition-all hover:bg-primary/90 hover:shadow-[0_0_48px_oklch(0.72_0.19_45/45%)] hover:-translate-y-0.5"
            >
              Start for free
              <ArrowUpRight className="size-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </Link>
            <button
              onClick={startDemo}
              disabled={demoBusy}
              className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-white/5 px-7 py-3.5 text-sm font-semibold text-foreground backdrop-blur-sm transition-all hover:border-primary/40 hover:bg-white/10 hover:-translate-y-0.5 disabled:opacity-60"
            >
              {demoBusy ? "Starting…" : "Try demo mode"}
            </button>
          </div>

          {/* Trust line */}
          <p data-hero className="mt-5 text-xs text-muted-foreground">
            No credit card · Demo workspace opens instantly
          </p>

          {/* Hero visual — 3D floating cards */}
          <div data-hero className="mt-16 relative mx-auto max-w-3xl">
            {/* Floating card grid */}
            <div
              className="relative h-[260px] sm:h-[320px] overflow-hidden rounded-2xl border border-border/40 glass-card"
              style={{
                background: "linear-gradient(135deg, oklch(0.22 0.012 260 / 70%) 0%, oklch(0.16 0.01 260 / 90%) 100%)",
              }}
            >
              {/* Top reflection line */}
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />

              {/* Mock UI preview */}
              <div className="flex h-full items-center justify-center gap-4 px-8 py-6">
                {/* Left panel */}
                <div className="hidden flex-1 sm:block">
                  <div className="rounded-xl border border-border/40 bg-charcoal-mid/80 p-4">
                    <div className="mb-3 flex items-center gap-2">
                      <div className="size-2.5 rounded-full bg-primary" />
                      <div className="h-2 w-24 rounded-full bg-foreground/20" />
                    </div>
                    {[94, 87, 82, 76].map((v, i) => (
                      <div key={i} className="mb-2.5 flex items-center gap-2">
                        <div className="h-1.5 w-full rounded-full bg-border/60">
                          <div
                            className="h-full rounded-full bg-primary transition-all"
                            style={{ width: `${v}%` }}
                          />
                        </div>
                        <span className="w-8 shrink-0 text-right text-xs font-medium text-muted-foreground">{v}%</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Center card */}
                <div className="flex-1 max-w-[200px]">
                  <div className="card-glow-top rounded-xl border border-primary/20 bg-charcoal-mid/80 p-4">
                    <Brain className="size-6 text-primary mb-2" />
                    <p className="text-xs font-semibold text-foreground mb-1">AI Match Score</p>
                    <p className="text-3xl font-bold text-primary font-display">94%</p>
                    <p className="text-xs text-muted-foreground mt-1">Software Engineer</p>
                    <div className="mt-3 flex gap-1">
                      {["Python", "ML", "APIs"].map((t) => (
                        <span key={t} className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Right panel */}
                <div className="hidden flex-1 sm:block">
                  <div className="rounded-xl border border-border/40 bg-charcoal-mid/80 p-4 space-y-2">
                    {["Complete CS50x", "Build portfolio", "Apply to roles", "Network daily"].map((s, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <CheckCircle2 className={`size-4 shrink-0 ${i < 2 ? "text-primary" : "text-border"}`} />
                        <span className="text-xs text-muted-foreground">{s}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Bottom reflection */}
              <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-border/40 to-transparent" />
            </div>
          </div>
        </div>
      </section>

      {/* ─── Marquee / Partners ──────────────────────────────────────────── */}
      <section className="border-y border-border/30 bg-charcoal py-6 overflow-hidden">
        <div ref={marqueeRef} className="relative">
          <div className="marquee-track">
            {[...PARTNERS, ...PARTNERS].map((p, i) => (
              <div
                key={i}
                className="mx-8 flex shrink-0 items-center gap-2 text-sm font-medium text-muted-foreground/60"
              >
                <div className="size-1.5 rounded-full bg-primary/40" />
                {p}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── About / Why section ─────────────────────────────────────────── */}
      <section
        ref={aboutRef}
        id="features"
        className="mx-auto w-full max-w-6xl px-6 py-24"
      >
        <div className="text-center">
          <span data-tag className="section-tag mb-6 inline-flex">
            <div className="size-1.5 rounded-sm bg-current" />
            Why CareerCompass
          </span>
          <div className="mt-4 overflow-hidden">
            <h2 className="text-balance text-4xl font-bold leading-tight sm:text-5xl">
              {["The", "AI", "career", "advisor", "built", "for"].map((w, i) => (
                <span key={i} className="overflow-clip-y mr-[0.25em] inline-block" style={{ display: "inline-block" }}>
                  <span data-title-word className="inline-block">
                    {w}
                  </span>
                </span>
              ))}
              <span className="overflow-clip-y inline-block">
                <span data-title-word className="gradient-text inline-block">
                  you
                </span>
              </span>
            </h2>
          </div>
        </div>

        {/* About cards grid */}
        <div className="mt-16 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { icon: Brain, label: "AI-powered matching", desc: "Deep profile analysis gives you career matches ranked by genuine fit.", color: "oklch(0.72 0.19 45)" },
            { icon: TrendingUp, label: "Growth outlook", desc: "Real salary data and 5-year demand forecasts for every recommended path.", color: "oklch(0.72 0.19 145)" },
            { icon: Users, label: "Student community", desc: "4,900+ students on the platform sharing milestones and wins.", color: "oklch(0.70 0.11 210)" },
            { icon: Zap, label: "Instant clarity", desc: "Most users have their roadmap ready in under 48 hours from signup.", color: "oklch(0.60 0.15 300)" },
          ].map(({ icon: Icon, label, desc, color }) => (
            <div
              key={label}
              data-about-card
              className="card-glow-top glass-card rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1 hover:border-primary/25 hover:shadow-lg hover:shadow-primary/5"
            >
              <div
                className="mb-4 flex size-11 items-center justify-center rounded-xl"
                style={{ background: `${color.replace(")", "/ 12%)")}` }}
              >
                <Icon className="size-5" style={{ color }} />
              </div>
              <h3 className="mb-2 text-base font-semibold">{label}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ─── How it works ────────────────────────────────────────────────── */}
      <section
        ref={stepsRef}
        id="how-it-works"
        className="border-y border-border/30 bg-charcoal py-24"
      >
        <div className="mx-auto w-full max-w-6xl px-6">
          <div className="text-center">
            <span className="section-tag mb-6 inline-flex">
              <div className="size-1.5 rounded-sm bg-current" />
              How it works
            </span>
            <h2 data-scroll className="mt-4 text-4xl font-bold sm:text-5xl">
              Three steps to your career
            </h2>
          </div>

          <div className="mt-14 grid gap-6 md:grid-cols-3">
            {STEPS.map(({ num, title, body }) => (
              <div
                key={num}
                data-step
                className="card-glow-top glass-card group relative rounded-2xl p-7 transition-all duration-300 hover:-translate-y-1 hover:border-primary/25"
              >
                <span className="font-display text-5xl font-extrabold text-primary/20 group-hover:text-primary/30 transition-colors">
                  {num}
                </span>
                <h3 className="mt-4 text-xl font-semibold">{title}</h3>
                <p className="mt-2.5 text-sm text-muted-foreground leading-relaxed">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Features ────────────────────────────────────────────────────── */}
      <section
        ref={featuresRef}
        id="features"
        className="mx-auto w-full max-w-6xl px-6 py-24"
      >
        <div className="text-center">
          <span data-tag className="section-tag mb-6 inline-flex">
            <div className="size-1.5 rounded-sm bg-current" />
            Features
          </span>
          <h2 data-scroll className="mt-4 text-4xl font-bold sm:text-5xl">
            Everything in one place
          </h2>
          <p data-scroll className="mx-auto mt-5 max-w-xl text-muted-foreground">
            Whether you're picking a stream or switching careers — CareerCompass keeps every insight, roadmap and deadline together.
          </p>
        </div>

        <div className="mt-14 grid gap-5 sm:grid-cols-2">
          {FEATURES.map(({ icon: Icon, title, body, color }) => (
            <article
              key={title}
              data-feature-card
              className="card-glow-top glass-card group flex gap-5 rounded-2xl p-7 transition-all duration-300 hover:-translate-y-1 hover:border-primary/25 hover:shadow-lg hover:shadow-primary/5"
            >
              <div
                className="flex size-12 shrink-0 items-center justify-center rounded-xl transition-transform group-hover:scale-110"
                style={{ background: `${color.replace(")", " / 12%)")}` }}
              >
                <Icon className="size-5" style={{ color }} />
              </div>
              <div>
                <h3 className="text-lg font-semibold">{title}</h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{body}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* ─── Stats ───────────────────────────────────────────────────────── */}
      <section
        ref={statsRef}
        id="stats"
        className="border-y border-border/30 bg-charcoal py-24"
      >
        <div className="mx-auto w-full max-w-6xl px-6">
          <div className="text-center">
            <span className="section-tag mb-6 inline-flex">
              <div className="size-1.5 rounded-sm bg-current" />
              By the numbers
            </span>
          </div>

          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {STATS.map(({ end, suffix, label }) => (
              <div
                key={label}
                data-stat-card
                className="card-glow-top glass-card rounded-2xl p-8 text-center transition-all duration-300 hover:-translate-y-1"
              >
                <div className="font-display text-5xl font-extrabold tracking-tight text-foreground">
                  <span
                    data-counter={end}
                    data-suffix={suffix}
                  >
                    0{suffix}
                  </span>
                </div>
                <p className="mt-3 text-sm text-muted-foreground">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Final CTA ───────────────────────────────────────────────────── */}
      <section ref={ctaRef} className="mx-auto w-full max-w-4xl px-6 py-28 text-center">
        <div
          className="relative overflow-hidden rounded-3xl border border-primary/20 p-12 sm:p-16"
          style={{
            background: "linear-gradient(135deg, oklch(0.22 0.012 260 / 80%) 0%, oklch(0.16 0.01 260 / 95%) 100%)",
          }}
        >
          {/* Glow */}
          <div
            className="pointer-events-none absolute inset-0 rounded-3xl opacity-30"
            style={{ background: "radial-gradient(ellipse 80% 60% at 50% -10%, oklch(0.72 0.19 45 / 30%), transparent)" }}
          />
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />

          <div className="relative z-10">
            <Compass data-cta className="mx-auto size-10 text-primary" />
            <h2 data-cta className="mt-6 text-balance text-4xl font-bold sm:text-5xl">
              Find the path that fits you
            </h2>
            <p data-cta className="mx-auto mt-5 max-w-lg text-muted-foreground">
              Start free today and keep every match, milestone and college in one workspace.
            </p>
            <div data-cta className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link
                to="/auth"
                search={{ mode: "signup" }}
                className="group inline-flex items-center gap-2.5 rounded-full bg-primary px-8 py-3.5 text-sm font-bold text-primary-foreground shadow-[0_0_32px_oklch(0.72_0.19_45/30%)] transition-all hover:bg-primary/90 hover:shadow-[0_0_48px_oklch(0.72_0.19_45/45%)] hover:-translate-y-0.5"
              >
                Sign up — it's free
                <ArrowUpRight className="size-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </Link>
              <button
                onClick={startDemo}
                disabled={demoBusy}
                className="inline-flex items-center gap-2 rounded-full border border-border/60 px-8 py-3.5 text-sm font-semibold text-foreground transition-all hover:border-primary/40 hover:bg-white/5 hover:-translate-y-0.5 disabled:opacity-60"
              >
                {demoBusy ? "Starting…" : "Try demo mode"}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Footer ──────────────────────────────────────────────────────── */}
      <footer className="border-t border-border/30 py-10">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 sm:flex-row">
          <span className="flex items-center gap-2 font-display text-sm font-bold">
            <Compass className="size-4 text-primary" />
            Career<span className="text-primary">Compass</span>
          </span>
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} CareerCompass. AI-powered career & education guidance.
          </p>
          <div className="flex gap-4 text-xs text-muted-foreground">
            <Link to="/auth" search={{ mode: "signin" }} className="hover:text-foreground transition-colors">
              Sign in
            </Link>
            <Link to="/auth" search={{ mode: "signup" }} className="hover:text-foreground transition-colors">
              Sign up
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
