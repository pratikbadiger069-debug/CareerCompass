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
  Star,
  ShieldCheck,
  Building2,
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
    title: "AI Career Matches",
    body: "Ranked career paths with match scores, required skills, salary benchmarks, and 5-year growth outlook.",
    color: "#d6fd70",
    image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=700&auto=format&fit=crop",
    tag: "94% Accuracy",
  },
  {
    icon: RouteIcon,
    title: "Personal Roadmap",
    body: "Entrance exams, core certifications, and experience broken into dated milestones you can tick off.",
    color: "#06b6d4",
    image: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?q=80&w=700&auto=format&fit=crop",
    tag: "Step-by-Step",
  },
  {
    icon: MessageSquare,
    title: "24/7 AI Advisor Chat",
    body: "Ask anything about streams, major selection, entrance cutoffs, or switching fields in real time.",
    color: "#8b5cf6",
    image: "https://images.unsplash.com/photo-1531482615713-2afd69097998?q=80&w=700&auto=format&fit=crop",
    tag: "Gemini Powered",
  },
  {
    icon: GraduationCap,
    title: "Colleges & Comparison",
    body: "Explore verified universities across India, filter by your city/state, and compare fees side-by-side.",
    color: "#7c3aed",
    image: "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?q=80&w=700&auto=format&fit=crop",
    tag: "Verified Data",
  },
];

const TESTIMONIALS = [
  {
    name: "Aarav Sharma",
    role: "Class 12 (PCM) · Mumbai",
    target: "Targeting IIT Bombay & BITS Pilani",
    quote:
      "CareerCompass removed all the confusion around entrance exams. Seeing my primary CS path alongside parallel exam pivots gave me complete peace of mind.",
    avatar:
      "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=300&auto=format&fit=crop",
    rating: 5,
  },
  {
    name: "Priya Nair",
    role: "Class 11 (PCB) · Pune",
    target: "Biotechnology & Healthcare Research",
    quote:
      "I was stressed about only taking NEET. CareerCompass revealed high-growth alternative careers in Bioinformatics that perfectly match my biology strengths.",
    avatar:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=300&auto=format&fit=crop",
    rating: 5,
  },
  {
    name: "Karan Mehta",
    role: "Commerce Graduate · New Delhi",
    target: "Financial Modeling & MBA Programs",
    quote:
      "The side-by-side college comparison and fee transparency helped my family choose the right university without paying exorbitant counselor fees.",
    avatar:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=300&auto=format&fit=crop",
    rating: 5,
  },
];

const STEPS = [
  { num: "01", title: "Tell us about you", body: "Your grade, interests, strengths and where you'd like to study or work." },
  { num: "02", title: "Get matched", body: "CareerCompass reads your profile and surfaces careers that genuinely fit — with reasons." },
  { num: "03", title: "Follow your roadmap", body: "Turn the match into milestones, colleges and next steps you can act on this month." },
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
            {["Features", "How it works"].map((l) => (
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
                className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground transition-all hover:bg-primary/90 hover:shadow-[0_0_24px_rgba(214,253,112,0.4)]"
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
                  className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground transition-all hover:bg-primary/90 hover:shadow-[0_0_24px_rgba(214,253,112,0.4)]"
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
          style={{ background: "radial-gradient(circle, rgba(214, 253, 112, 0.25) 0%, transparent 70%)" }}
        />
        <div
          className="pointer-events-none absolute bottom-0 right-0 h-[400px] w-[400px] opacity-20"
          style={{ background: "radial-gradient(circle, rgba(79, 70, 229, 0.25) 0%, transparent 70%)" }}
        />

        <div className="relative z-10 mx-auto w-full max-w-4xl text-center">
          {/* Section tag */}
          <span data-hero className="section-tag mb-8 inline-flex">
            <Sparkles className="size-3.5 text-violet-400" />
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
              className="group inline-flex items-center gap-2.5 rounded-full bg-primary px-7 py-3.5 text-sm font-bold text-primary-foreground shadow-[0_0_32px_rgba(214,253,112,0.3)] transition-all hover:bg-primary/90 hover:shadow-[0_0_48px_rgba(214,253,112,0.45)] hover:-translate-y-0.5"
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

          {/* Hero visual — Rich Interactive Showcase with Photography & Floating HUD */}
          <div data-hero className="mt-16 relative mx-auto max-w-4xl">
            {/* Ambient Backlight Glow */}
            <div className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-primary/30 via-violet-500/20 to-primary/30 blur-xl opacity-40 -z-10" />

            <div className="relative overflow-hidden rounded-3xl border border-border/60 bg-charcoal-deep shadow-2xl glass-card">
              {/* Top reflection line */}
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/60 to-transparent z-20" />

              {/* Hero Image with Cinematic Gradient Overlay */}
              <div className="relative h-[340px] sm:h-[420px] w-full overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=1400&auto=format&fit=crop"
                  alt="Students exploring career roadmaps on CareerCompass"
                  className="h-full w-full object-cover object-center filter brightness-[0.55] contrast-[1.1] scale-105 transition-transform duration-1000 hover:scale-100"
                  loading="eager"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-charcoal-deep via-charcoal-deep/60 to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-r from-charcoal-deep/80 via-transparent to-charcoal-deep/80" />

                {/* Floating HUD Cards & Live Indicators */}
                <div className="absolute inset-0 p-5 sm:p-8 flex flex-col justify-between z-10">
                  {/* Top Bar Floating Badges */}
                  <div className="flex flex-wrap items-center justify-between gap-2.5">
                    <div className="flex items-center gap-2 rounded-full border border-primary/30 bg-charcoal-deep/90 px-3.5 py-1.5 backdrop-blur-md shadow-lg">
                      <span className="size-2 rounded-full bg-primary animate-pulse" />
                      <span className="text-xs font-semibold text-foreground">
                        AI Roadmap Engine <span className="text-primary font-bold">Active</span>
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 rounded-full border border-violet-500/30 bg-charcoal-deep/90 px-3.5 py-1.5 backdrop-blur-md shadow-lg">
                      <Sparkles className="size-3.5 text-violet-400" />
                      <span className="text-xs font-semibold text-violet-300">
                        98% Recommendation Fit
                      </span>
                    </div>
                  </div>

                  {/* Center / Bottom Floating Interactive Overlay Cards */}
                  <div className="grid gap-3 sm:grid-cols-3 text-left">
                    {/* Floating Card 1 */}
                    <div className="rounded-2xl border border-primary/25 bg-charcoal-deep/90 p-4 backdrop-blur-xl shadow-xl">
                      <div className="flex items-center gap-2 text-primary text-xs font-bold mb-1">
                        <Brain className="size-4" /> Top Recommendation
                      </div>
                      <p className="text-sm font-bold text-foreground">Software Architect</p>
                      <p className="text-[11px] text-muted-foreground mt-0.5">High Demand • ₹18-35 LPA</p>
                    </div>

                    {/* Floating Card 2 */}
                    <div className="rounded-2xl border border-border/60 bg-charcoal-deep/90 p-4 backdrop-blur-xl shadow-xl">
                      <div className="flex items-center gap-2 text-violet-400 text-xs font-bold mb-1">
                        <Building2 className="size-4" /> Target University
                      </div>
                      <p className="text-sm font-bold text-foreground">IIT Bombay / BITS</p>
                      <p className="text-[11px] text-muted-foreground mt-0.5">JEE Cutoffs & Verified</p>
                    </div>

                    {/* Floating Card 3 */}
                    <div className="rounded-2xl border border-emerald-500/30 bg-charcoal-deep/90 p-4 backdrop-blur-xl shadow-xl">
                      <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold mb-1">
                        <ShieldCheck className="size-4" /> Fallback Safety Net
                      </div>
                      <p className="text-sm font-bold text-foreground">Data Science Pivot</p>
                      <p className="text-[11px] text-muted-foreground mt-0.5">Zero Year Drop Risk</p>
                    </div>
                  </div>
                </div>
              </div>
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
            { icon: Brain, label: "AI-powered matching", desc: "Deep profile analysis gives you career matches ranked by genuine fit.", color: "#8b5cf6" },
            { icon: TrendingUp, label: "Growth outlook", desc: "Real salary data and 5-year demand forecasts for every recommended path.", color: "#06b6d4" },
            { icon: Users, label: "Student community", desc: "4,900+ students on the platform sharing milestones and wins.", color: "#4f46e5" },
            { icon: Zap, label: "Instant clarity", desc: "Most users have their roadmap ready in under 48 hours from signup.", color: "#7c3aed" },
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

        <div className="mt-14 grid gap-6 sm:grid-cols-2">
          {FEATURES.map(({ icon: Icon, title, body, color, image, tag }) => (
            <article
              key={title}
              data-feature-card
              className="card-glow-top glass-card group overflow-hidden rounded-2xl border border-border/60 transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-xl hover:shadow-primary/5 flex flex-col justify-between"
            >
              {/* Feature Preview Image */}
              <div className="relative h-44 w-full overflow-hidden bg-charcoal-mid">
                <img
                  src={image}
                  alt={title}
                  className="h-full w-full object-cover filter brightness-[0.7] contrast-[1.05] transition-transform duration-500 group-hover:scale-105"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-charcoal-deep via-transparent to-transparent" />
                <span className="absolute top-3.5 right-3.5 rounded-full border border-white/15 bg-black/60 px-3 py-1 text-[11px] font-semibold text-white backdrop-blur-md">
                  {tag}
                </span>
                <div
                  className="absolute bottom-3 left-4 flex size-10 items-center justify-center rounded-xl border border-white/15 shadow-lg backdrop-blur-md"
                  style={{ background: `${color}25` }}
                >
                  <Icon className="size-5" style={{ color }} />
                </div>
              </div>

              {/* Card Body */}
              <div className="p-6">
                <h3 className="text-lg font-bold text-foreground group-hover:text-primary transition-colors">
                  {title}
                </h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                  {body}
                </p>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* ─── Student Success Stories & Pictures ─────────────────────────── */}
      <section className="border-t border-border/30 bg-charcoal/40 py-24">
        <div className="mx-auto w-full max-w-6xl px-6">
          <div className="text-center">
            <span className="section-tag mb-6 inline-flex">
              <Sparkles className="size-3.5 text-primary" />
              Real Student Stories
            </span>
            <h2 className="mt-4 text-4xl font-bold sm:text-5xl">
              Trusted by students across India
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-sm text-muted-foreground">
              From Class 10 stream confusion to college entrance exam pivots — here is how CareerCompass provides clarity.
            </p>
          </div>

          <div className="mt-14 grid gap-6 md:grid-cols-3">
            {TESTIMONIALS.map(({ name, role, target, quote, avatar, rating }) => (
              <div
                key={name}
                className="card-glow-top glass-card group flex flex-col justify-between rounded-2xl border border-border/60 p-6 transition-all duration-300 hover:-translate-y-1 hover:border-primary/30"
              >
                <div>
                  {/* Star Rating */}
                  <div className="flex items-center gap-1 text-amber-400 mb-3">
                    {Array.from({ length: rating }).map((_, i) => (
                      <Star key={i} className="size-3.5 fill-amber-400 text-amber-400" />
                    ))}
                  </div>

                  <p className="text-xs leading-relaxed text-foreground/90 italic">
                    &ldquo;{quote}&rdquo;
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-border/40 flex items-center gap-3">
                  <img
                    src={avatar}
                    alt={name}
                    className="size-11 rounded-full object-cover ring-2 ring-primary/30"
                    loading="lazy"
                  />
                  <div>
                    <h4 className="text-sm font-bold text-foreground">{name}</h4>
                    <p className="text-[11px] text-primary font-medium">{role}</p>
                    <p className="text-[10px] text-muted-foreground">{target}</p>
                  </div>
                </div>
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
            background: "linear-gradient(135deg, rgba(17, 18, 24, 0.88) 0%, rgba(8, 8, 12, 0.96) 100%)",
          }}
        >
          {/* Background atmosphere picture */}
          <img
            src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?q=80&w=1200&auto=format&fit=crop"
            alt="Students graduating"
            className="absolute inset-0 h-full w-full object-cover object-center opacity-15 filter brightness-75 pointer-events-none"
            loading="lazy"
          />
          {/* Glow */}
          <div
            className="pointer-events-none absolute inset-0 rounded-3xl opacity-35"
            style={{ background: "radial-gradient(ellipse 80% 60% at 50% -10%, rgba(214, 253, 112, 0.25), transparent)" }}
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
                className="group inline-flex items-center gap-2.5 rounded-full bg-primary px-8 py-3.5 text-sm font-bold text-primary-foreground shadow-[0_0_32px_rgba(214,253,112,0.3)] transition-all hover:bg-primary/90 hover:shadow-[0_0_48px_rgba(214,253,112,0.45)] hover:-translate-y-0.5"
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
