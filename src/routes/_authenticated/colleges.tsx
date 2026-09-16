import { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowLeft,
  BookmarkCheck,
  BookmarkPlus,
  Building2,
  GraduationCap,
  MapPin,
  Sparkles,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import { useAuth } from "@/hooks/useAuth";
import { usePrefersReducedMotion } from "@/hooks/use-reduced-motion";
import { getStaggerContainer, getFadeUp, getCardHover } from "@/lib/motion";
import { motion } from "framer-motion";

type SavedCollege = Tables<"saved_colleges">;

export type CollegeSuggestion = {
  name: string;
  course: string;
  city: string;
  fees_total: string;
  entrance: string;
  why: string;
  careerTitle?: string;
};

// Fallback recommendations if user has no generated colleges yet
const DEFAULT_INDIAN_COLLEGES: CollegeSuggestion[] = [
  {
    name: "Indian Institute of Technology (IIT) Bombay",
    course: "B.Tech Computer Science & Engineering",
    city: "Mumbai, Maharashtra",
    fees_total: "₹8.5 Lakhs (4 Years)",
    entrance: "JEE Advanced",
    why: "Premier engineering institution with world-class faculty and tech placements.",
    careerTitle: "Software Engineer / Tech Lead",
  },
  {
    name: "Shri Ram College of Commerce (SRCC)",
    course: "B.Com (Hons) / B.A. Economics",
    city: "New Delhi, Delhi",
    fees_total: "₹90,000 (3 Years)",
    entrance: "CUET UG",
    why: "Top business and finance college in India with strong recruitment from consulting firms.",
    careerTitle: "Financial Analyst / Consultant",
  },
  {
    name: "National Law School of India University (NLSIU)",
    course: "B.A. LL.B. (Hons)",
    city: "Bengaluru, Karnataka",
    fees_total: "₹14 Lakhs (5 Years)",
    entrance: "CLAT",
    why: "India's premier legal institution for corporate law and judiciary pathways.",
    careerTitle: "Corporate Lawyer / Legal Advisor",
  },
  {
    name: "BITS Pilani",
    course: "B.E. Computer Science / Electronics",
    city: "Pilani, Rajasthan",
    fees_total: "₹22 Lakhs (4 Years)",
    entrance: "BITSAT",
    why: "Leading private engineering institute with zero-attendance requirement and top startups.",
    careerTitle: "Product Engineer / Tech Founder",
  },
  {
    name: "All India Institute of Medical Sciences (AIIMS)",
    course: "MBBS",
    city: "New Delhi, Delhi",
    fees_total: "₹6,000 (5.5 Years)",
    entrance: "NEET UG",
    why: "Apex medical institute with high clinical exposure and top residency matches.",
    careerTitle: "Medical Specialist / Surgeon",
  },
];

export const Route = createFileRoute("/_authenticated/colleges")({
  head: () => ({
    meta: [
      { title: "CareerCompass — College Finder & Saved Colleges" },
      {
        name: "description",
        content:
          "Explore AI-recommended colleges in India for your career path and manage your saved target institutions.",
      },
      { property: "og:title", content: "CareerCompass — College Finder" },
    ],
  }),
  component: CollegesPage,
});

function CollegesPage() {
  const { user, isGuest } = useAuth();
  const prefersReduced = usePrefersReducedMotion();

  const [savedColleges, setSavedColleges] = useState<SavedCollege[]>([]);
  const [suggestedColleges, setSuggestedColleges] = useState<CollegeSuggestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);

  const stagger = getStaggerContainer(prefersReduced);
  const fadeUp = getFadeUp(prefersReduced);
  const cardHover = getCardHover(prefersReduced);

  const loadData = async () => {
    if (!user || isGuest) {
      setSuggestedColleges(DEFAULT_INDIAN_COLLEGES);
      setLoading(false);
      return;
    }

    try {
      // 1. Fetch saved colleges
      const { data: savedData, error: savedErr } = await supabase
        .from("saved_colleges")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (savedErr) console.error("[Colleges] Error loading saved colleges:", savedErr);
      // Rule 3: Use ?? [] fallback
      setSavedColleges(savedData ?? []);

      // 2. Fetch career recommendations to extract colleges
      const { data: recsData, error: recsErr } = await supabase
        .from("career_recommendations")
        .select("*")
        .eq("user_id", user.id);

      if (recsErr) console.error("[Colleges] Error loading recommendations:", recsErr);

      const extracted: CollegeSuggestion[] = [];
      (recsData ?? []).forEach((rec) => {
        const list = (rec as any).colleges as Array<any> | undefined;
        (list ?? []).forEach((col) => {
          if (col && (col.name || col.college_name)) {
            extracted.push({
              name: col.name ?? col.college_name ?? "University",
              course: col.course ?? col.program ?? "Degree Program",
              city: col.city ?? "India",
              fees_total: col.fees_total ?? col.tuition_estimate ?? "Varies",
              entrance: col.entrance ?? col.application_deadline ?? "Direct / Entrance Exam",
              why: col.why ?? col.notes ?? `Fits career path: ${rec.career_title}`,
              careerTitle: rec.career_title,
            });
          }
        });
      });

      // Use extracted colleges if present, else fallback to default Indian colleges
      setSuggestedColleges(extracted.length > 0 ? extracted : DEFAULT_INDIAN_COLLEGES);
    } catch (err) {
      console.error("[Colleges] Exception loading colleges data:", err);
      setSuggestedColleges(DEFAULT_INDIAN_COLLEGES);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user, isGuest]);

  // Save college to database
  const handleSaveCollege = async (col: CollegeSuggestion) => {
    if (!user?.id || isGuest) {
      toast.error("Please sign in to save colleges.");
      return;
    }

    setSavingId(col.name);
    try {
      const { error } = await supabase.from("saved_colleges").insert({
        user_id: user.id,
        college_name: col.name,
        program: col.course,
        city: col.city,
        tuition_estimate: col.fees_total,
        application_deadline: col.entrance,
        notes: col.why,
      });

      if (error) {
        toast.error(`Failed to save college: ${error.message}`);
      } else {
        toast.success(`Saved ${col.name} to your target list!`);
        await loadData(); // Refresh saved colleges list
      }
    } catch (err) {
      console.error("[Colleges] Error saving college:", err);
      toast.error("Could not save college. Please try again.");
    } finally {
      setSavingId(null);
    }
  };

  // Remove saved college from database
  const handleRemoveSavedCollege = async (savedId: string, name: string) => {
    if (!user?.id) return;

    try {
      const { error } = await supabase
        .from("saved_colleges")
        .delete()
        .eq("id", savedId)
        .eq("user_id", user.id);

      if (error) {
        toast.error(`Failed to remove college: ${error.message}`);
      } else {
        toast.success(`Removed ${name} from your list.`);
        setSavedColleges((prev) => (prev ?? []).filter((item) => item.id !== savedId));
      }
    } catch (err) {
      console.error("[Colleges] Error deleting saved college:", err);
      toast.error("Could not remove college.");
    }
  };

  const isCollegeSaved = (name: string) => {
    return (savedColleges ?? []).some(
      (s) => s.college_name.trim().toLowerCase() === name.trim().toLowerCase(),
    );
  };

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
            <GraduationCap className="size-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">College Finder</h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              Explore top institutions matched to your recommendations & track saved colleges
            </p>
          </div>
        </div>
      </header>

      {loading ? (
        <div className="space-y-6">
          <Skeleton className="h-40 w-full rounded-2xl" />
          <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-48 w-full rounded-2xl" />
            ))}
          </div>
        </div>
      ) : (
        <div className="space-y-10">
          {/* Top Section: Saved Colleges */}
          <section>
            <div className="mb-4 flex items-center gap-2">
              <BookmarkCheck className="size-5 text-primary" />
              <h2 className="text-lg font-bold">Saved Target Colleges ({savedColleges.length})</h2>
            </div>

            {(savedColleges ?? []).length === 0 ? (
              <Card className="border-dashed border-border/70 bg-card/40 p-6 text-center">
                <CardContent className="space-y-2 p-0">
                  <Building2 className="mx-auto size-8 text-muted-foreground/50" />
                  <p className="text-xs font-medium text-foreground">No saved colleges yet</p>
                  <p className="text-xs text-muted-foreground">
                    Click "Save College" on any suggested institution below to build your target
                    list.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <motion.div
                variants={stagger}
                initial="hidden"
                animate="visible"
                className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
              >
                {(savedColleges ?? []).map((col) => (
                  <motion.div
                    key={col.id}
                    variants={fadeUp}
                    whileHover={cardHover.whileHover}
                    className="flex flex-col justify-between rounded-xl border border-primary/20 bg-primary/5 p-4 shadow-sm"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="text-sm font-bold text-foreground leading-snug">
                          {col.college_name}
                        </h3>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemoveSavedCollege(col.id, col.college_name)}
                          className="h-7 w-7 text-muted-foreground hover:text-destructive shrink-0"
                          title="Remove from saved"
                        >
                          <Trash2 className="size-3.5" />
                        </Button>
                      </div>

                      {col.program && (
                        <p className="mt-1 text-xs font-semibold text-primary">{col.program}</p>
                      )}

                      <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-muted-foreground">
                        {col.city && (
                          <span className="flex items-center gap-1">
                            <MapPin className="size-3 text-muted-foreground/70" /> {col.city}
                          </span>
                        )}
                        {col.tuition_estimate && (
                          <span className="font-medium text-foreground">
                            Fees: {col.tuition_estimate}
                          </span>
                        )}
                      </div>

                      {col.notes && (
                        <p className="mt-2.5 text-xs text-muted-foreground/90 line-clamp-2">
                          {col.notes}
                        </p>
                      )}
                    </div>

                    <div className="mt-3 border-t border-primary/10 pt-2 flex items-center justify-between text-[11px] text-muted-foreground">
                      <span>Saved Institution</span>
                      <Badge variant="outline" className="text-[10px] bg-background">
                        {col.application_deadline ?? "Target"}
                      </Badge>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </section>

          {/* Bottom Section: Suggested Colleges */}
          <section>
            <div className="mb-4 flex items-center gap-2">
              <Sparkles className="size-5 text-primary" />
              <h2 className="text-lg font-bold">
                Recommended Institutions for Your Stream & Goals
              </h2>
            </div>

            <motion.div
              variants={stagger}
              initial="hidden"
              animate="visible"
              className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
            >
              {(suggestedColleges ?? []).map((col, idx) => {
                const saved = isCollegeSaved(col.name);

                return (
                  <motion.div
                    key={`${col.name}-${idx}`}
                    variants={fadeUp}
                    whileHover={cardHover.whileHover}
                    className="flex flex-col h-full justify-between rounded-2xl border border-border/70 bg-card/80 p-5 shadow-sm transition-all"
                  >
                    <div>
                      {col.careerTitle && (
                        <Badge
                          variant="secondary"
                          className="mb-2 text-[10px] uppercase tracking-wide"
                        >
                          {col.careerTitle}
                        </Badge>
                      )}

                      <h3 className="text-base font-bold text-foreground leading-snug">
                        {col.name}
                      </h3>

                      <p className="mt-1 text-xs font-semibold text-primary">{col.course}</p>

                      <div className="mt-3 space-y-1.5 rounded-xl bg-muted/40 p-3 text-xs">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Location:</span>
                          <span className="font-medium text-foreground">{col.city}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Fees Estimate:</span>
                          <span className="font-medium text-foreground">{col.fees_total}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Entrance Exam:</span>
                          <span className="font-semibold text-primary">{col.entrance}</span>
                        </div>
                      </div>

                      <p className="mt-3 text-xs text-muted-foreground leading-relaxed">
                        {col.why}
                      </p>
                    </div>

                    <Button
                      onClick={() => handleSaveCollege(col)}
                      disabled={saved || savingId === col.name}
                      variant={saved ? "outline" : "default"}
                      size="sm"
                      className="mt-5 w-full gap-2 text-xs"
                    >
                      {saved ? (
                        <>
                          <BookmarkCheck className="size-3.5 text-emerald-500" /> Saved to List
                        </>
                      ) : (
                        <>
                          <BookmarkPlus className="size-3.5" /> Save College
                        </>
                      )}
                    </Button>
                  </motion.div>
                );
              })}
            </motion.div>
          </section>
        </div>
      )}
    </main>
  );
}
