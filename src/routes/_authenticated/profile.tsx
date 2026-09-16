import { useEffect, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  AlertCircle,
  ArrowLeft,
  Check,
  Compass,
  Loader2,
  RefreshCw,
  Save,
  Sparkles,
  User,
} from "lucide-react";
import { toast } from "sonner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import { useAuth } from "@/hooks/useAuth";
import { generateCareerRoadmap } from "@/lib/geminiApi";

const EDUCATION_STAGES = [
  { value: "class_10", label: "Class 10" },
  { value: "class_12", label: "Class 12" },
  { value: "ug_1", label: "UG 1st year" },
  { value: "ug_mid", label: "UG 2nd / 3rd year" },
  { value: "ug_final", label: "UG Final year" },
  { value: "pg", label: "Postgraduate" },
  { value: "working", label: "Working professional" },
  { value: "gap_year", label: "Gap year / Break" },
];

const STREAMS = [
  { value: "science_pcm", label: "Science (PCM)" },
  { value: "science_pcb", label: "Science (PCB)" },
  { value: "commerce", label: "Commerce" },
  { value: "arts", label: "Arts & Humanities" },
  { value: "engineering", label: "Engineering" },
  { value: "medical", label: "Medical & Health" },
  { value: "business", label: "Business & Management" },
  { value: "design", label: "Design & Media" },
  { value: "other", label: "Other / Undecided" },
];

const MARKS = ["Above 90%", "80-90%", "70-80%", "60-70%", "Below 60%", "Prefer not to say"];

const GOAL_TYPES = [
  "Get into a top college",
  "Land my first job",
  "Switch careers",
  "Study abroad",
  "Upskill in my current field",
  "Start something of my own",
];

const BUDGET_RANGES = [
  "Under ₹1 lakh",
  "₹1-5 lakh",
  "₹5-15 lakh",
  "₹15-40 lakh",
  "Above ₹40 lakh",
  "Scholarship / funding needed",
];

const TIMELINES = ["Within 6 months", "6-12 months", "1-2 years", "2-4 years", "Still exploring"];

const AVAILABLE_INTERESTS = [
  "Technology",
  "Science & Research",
  "Healthcare",
  "Finance",
  "Design",
  "Writing",
  "Media & Film",
  "Law & Policy",
  "Engineering",
  "Sustainability",
  "Psychology",
  "Entrepreneurship",
];

export const Route = createFileRoute("/_authenticated/profile")({
  head: () => ({
    meta: [
      { title: "CareerCompass — Edit Profile & Regenerate Roadmap" },
      {
        name: "description",
        content:
          "Edit your CareerCompass profile and explicitly regenerate your AI career roadmap.",
      },
    ],
  }),
  component: ProfilePage,
});

function ProfilePage() {
  const { user, isGuest } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [regenError, setRegenError] = useState<string | null>(null);

  // Form State
  const [educationStage, setEducationStage] = useState("");
  const [stream, setStream] = useState("");
  const [currentMarks, setCurrentMarks] = useState("");
  const [institutionName, setInstitutionName] = useState("");
  const [interests, setInterests] = useState<string[]>([]);
  const [currentSkillsInput, setCurrentSkillsInput] = useState("");
  const [goalType, setGoalType] = useState("");
  const [budgetRange, setBudgetRange] = useState("");
  const [timeline, setTimeline] = useState("");
  const [careerGoals, setCareerGoals] = useState("");
  const [extraContext, setExtraContext] = useState("");

  useEffect(() => {
    if (!user || isGuest) {
      setLoading(false);
      return;
    }

    async function loadProfile() {
      try {
        const { data, error } = await supabase
          .from("user_profiles")
          .select("*")
          .eq("user_id", user!.id)
          .maybeSingle();

        if (error) {
          console.error("[Profile] Error loading profile:", error);
        } else if (data) {
          setEducationStage(data.education_stage ?? "");
          setStream(data.stream ?? "");
          setCurrentMarks(data.current_marks ?? "");
          setInstitutionName(data.institution_name ?? "");
          // Rule 3: Use ?? [] fallback
          setInterests(data.interests ?? []);
          setCurrentSkillsInput((data.current_skills ?? []).join(", "));
          setGoalType(data.goal_type ?? "");
          setBudgetRange(data.budget_range ?? "");
          setTimeline(data.timeline ?? "");
          setCareerGoals(data.career_goals ?? data.career_goal ?? "");
          setExtraContext(data.extra_context ?? "");
        }
      } catch (err) {
        console.error("[Profile] Exception loading profile:", err);
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, [user, isGuest]);

  const toggleInterest = (interest: string) => {
    setInterests((prev) =>
      (prev ?? []).includes(interest)
        ? (prev ?? []).filter((i) => i !== interest)
        : [...(prev ?? []), interest],
    );
  };

  const buildProfilePayload = () => {
    const skillsArray = currentSkillsInput
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    return {
      user_id: user!.id,
      education_stage: educationStage || null,
      stream: stream || null,
      current_marks: currentMarks || null,
      institution_name: institutionName.trim() || null,
      interests,
      current_skills: skillsArray,
      goal_type: goalType || null,
      budget_range: budgetRange || null,
      timeline: timeline || null,
      career_goals: careerGoals.trim() || null,
      career_goal: careerGoals.trim() || null,
      extra_context: extraContext.trim() || null,
      updated_at: new Date().toISOString(),
    };
  };

  // Save Profile alone (MUST NOT trigger regeneration)
  const handleSaveProfile = async () => {
    if (!user?.id || isGuest) return;

    setIsSaving(true);
    try {
      const payload = buildProfilePayload();
      const { error } = await supabase
        .from("user_profiles")
        .upsert(payload, { onConflict: "user_id" });

      if (error) {
        toast.error(`Failed to save profile: ${error.message}`);
      } else {
        toast.success("Profile updated successfully!");
      }
    } catch (err) {
      console.error("[Profile] Save error:", err);
      toast.error("Could not save profile. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  // Separate explicit action: Regenerate Roadmap
  const handleRegenerateRoadmap = async () => {
    if (!user?.id || isGuest) return;

    setIsRegenerating(true);
    setRegenError(null);

    try {
      // 1. Save profile first
      const payload = buildProfilePayload();
      const { error: saveErr } = await supabase
        .from("user_profiles")
        .upsert(payload, { onConflict: "user_id" });

      if (saveErr)
        throw new Error(`Failed to update profile before regeneration: ${saveErr.message}`);

      // 2. Delete existing milestones and recommendations
      const { error: milestonesDeleteError } = await supabase
        .from("roadmap_milestones")
        .delete()
        .eq("user_id", user.id);
      if (milestonesDeleteError) {
        throw new Error(`Failed to clear old roadmap: ${milestonesDeleteError.message}`);
      }

      const { error: recommendationsDeleteError } = await supabase
        .from("career_recommendations")
        .delete()
        .eq("user_id", user.id);
      if (recommendationsDeleteError) {
        throw new Error(
          `Failed to clear old recommendations: ${recommendationsDeleteError.message}`,
        );
      }

      // 3. Call AI Gateway
      const aiResult = await generateCareerRoadmap(payload as Record<string, unknown>);

      // 4. Parse & Insert career_recommendations
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

      const recsToInsert = (aiRecs ?? []).map((rec) => ({
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

      // 5. Parse & Insert roadmap_milestones
      const aiRoadmap = (aiResult as Record<string, unknown>)["roadmap"] as
        | Array<{
            phase: string;
            timeframe: string;
            milestones: Array<{ title: string; description: string }>;
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

        (aiRoadmap ?? []).forEach((phase, phaseIndex) => {
          const linkedRec = insertedRecs[Math.min(phaseIndex, insertedRecs.length - 1)];
          if (!linkedRec) return;
          (phase.milestones ?? []).forEach((milestone, milestoneIndex) => {
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

      toast.success("Roadmap regenerated! Redirecting to Dashboard...");
      navigate({ to: "/dashboard" });
    } catch (err) {
      console.error("[Profile] Regenerate error:", err);
      setRegenError(err instanceof Error ? err.message : "Regeneration failed.");
    } finally {
      setIsRegenerating(false);
    }
  };

  return (
    <main className="mx-auto min-h-screen w-full max-w-4xl px-6 py-10">
      {/* Header */}
      <header className="mb-8 border-b border-border/50 pb-6">
        <Link to="/dashboard">
          <Button variant="ghost" size="sm" className="mb-4 gap-2 text-xs">
            <ArrowLeft className="size-4" /> Back to Dashboard
          </Button>
        </Link>
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <User className="size-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Edit Student Profile</h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              Update your stream, skills, and goals. Separate button to trigger AI roadmap
              regeneration.
            </p>
          </div>
        </div>
      </header>

      {loading ? (
        <Card className="p-8 space-y-6">
          <Skeleton className="h-8 w-1/3" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-20 w-full" />
        </Card>
      ) : (
        <div className="space-y-8">
          {/* Error Banner if Regeneration Failed */}
          {regenError && (
            <Alert variant="destructive">
              <AlertCircle className="size-4" />
              <AlertTitle>Regeneration Failed</AlertTitle>
              <AlertDescription className="mt-2 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <span>{regenError}</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRegenerateRoadmap}
                  className="gap-2 shrink-0 bg-background"
                >
                  <RefreshCw className="size-3.5" /> Retry Regeneration
                </Button>
              </AlertDescription>
            </Alert>
          )}

          {/* Single-Page Form Card */}
          <Card className="border-border/70 bg-card/80 shadow-sm">
            <CardHeader className="border-b border-border/50 pb-4">
              <CardTitle className="text-base font-semibold">Profile Details</CardTitle>
            </CardHeader>

            <CardContent className="p-6 space-y-6">
              {/* Row 1: Stage & Stream */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="education_stage" className="text-xs font-semibold">
                    Education Stage
                  </Label>
                  <Select value={educationStage} onValueChange={setEducationStage}>
                    <SelectTrigger id="education_stage" className="text-xs">
                      <SelectValue placeholder="Select stage" />
                    </SelectTrigger>
                    <SelectContent>
                      {EDUCATION_STAGES.map((item) => (
                        <SelectItem key={item.value} value={item.value} className="text-xs">
                          {item.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="stream" className="text-xs font-semibold">
                    Stream / Discipline
                  </Label>
                  <Select value={stream} onValueChange={setStream}>
                    <SelectTrigger id="stream" className="text-xs">
                      <SelectValue placeholder="Select stream" />
                    </SelectTrigger>
                    <SelectContent>
                      {STREAMS.map((item) => (
                        <SelectItem key={item.value} value={item.value} className="text-xs">
                          {item.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Row 2: Marks & Institution */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="current_marks" className="text-xs font-semibold">
                    Academic Performance / Marks
                  </Label>
                  <Select value={currentMarks} onValueChange={setCurrentMarks}>
                    <SelectTrigger id="current_marks" className="text-xs">
                      <SelectValue placeholder="Select percentage" />
                    </SelectTrigger>
                    <SelectContent>
                      {MARKS.map((m) => (
                        <SelectItem key={m} value={m} className="text-xs">
                          {m}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="institution_name" className="text-xs font-semibold">
                    School / College Name
                  </Label>
                  <Input
                    id="institution_name"
                    value={institutionName}
                    onChange={(e) => setInstitutionName(e.target.value)}
                    placeholder="e.g. DPS R.K. Puram"
                    className="text-xs"
                  />
                </div>
              </div>

              {/* Row 3: Goals & Timeline */}
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="goal_type" className="text-xs font-semibold">
                    Primary Goal
                  </Label>
                  <Select value={goalType} onValueChange={setGoalType}>
                    <SelectTrigger id="goal_type" className="text-xs">
                      <SelectValue placeholder="Select goal" />
                    </SelectTrigger>
                    <SelectContent>
                      {GOAL_TYPES.map((g) => (
                        <SelectItem key={g} value={g} className="text-xs">
                          {g}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="budget_range" className="text-xs font-semibold">
                    Budget Range
                  </Label>
                  <Select value={budgetRange} onValueChange={setBudgetRange}>
                    <SelectTrigger id="budget_range" className="text-xs">
                      <SelectValue placeholder="Select budget" />
                    </SelectTrigger>
                    <SelectContent>
                      {BUDGET_RANGES.map((b) => (
                        <SelectItem key={b} value={b} className="text-xs">
                          {b}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="timeline" className="text-xs font-semibold">
                    Target Timeline
                  </Label>
                  <Select value={timeline} onValueChange={setTimeline}>
                    <SelectTrigger id="timeline" className="text-xs">
                      <SelectValue placeholder="Select timeline" />
                    </SelectTrigger>
                    <SelectContent>
                      {TIMELINES.map((t) => (
                        <SelectItem key={t} value={t} className="text-xs">
                          {t}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Row 4: Interests */}
              <div className="space-y-2">
                <Label className="text-xs font-semibold">Interests</Label>
                <div className="flex flex-wrap gap-2 pt-1">
                  {AVAILABLE_INTERESTS.map((interest) => {
                    const selected = (interests ?? []).includes(interest);
                    return (
                      <Badge
                        key={interest}
                        onClick={() => toggleInterest(interest)}
                        className={`cursor-pointer text-xs py-1 px-3 transition-colors ${
                          selected
                            ? "bg-primary text-primary-foreground hover:bg-primary/90"
                            : "bg-muted text-muted-foreground hover:bg-muted/80 border border-border"
                        }`}
                      >
                        {selected && <Check className="mr-1 size-3" />}
                        {interest}
                      </Badge>
                    );
                  })}
                </div>
              </div>

              {/* Row 5: Current Skills */}
              <div className="space-y-2">
                <Label htmlFor="current_skills" className="text-xs font-semibold">
                  Current Acquired Skills (Comma Separated)
                </Label>
                <Input
                  id="current_skills"
                  value={currentSkillsInput}
                  onChange={(e) => setCurrentSkillsInput(e.target.value)}
                  placeholder="Python, Public Speaking, Graphic Design, Mathematics..."
                  className="text-xs"
                />
              </div>

              {/* Row 6: Career Goals Text */}
              <div className="space-y-2">
                <Label htmlFor="career_goals" className="text-xs font-semibold">
                  Specific Career Aspirations
                </Label>
                <Input
                  id="career_goals"
                  value={careerGoals}
                  onChange={(e) => setCareerGoals(e.target.value)}
                  placeholder="e.g. Become a Machine Learning Engineer in a top tech firm"
                  className="text-xs"
                />
              </div>

              {/* Row 7: Extra Context */}
              <div className="space-y-2">
                <Label htmlFor="extra_context" className="text-xs font-semibold">
                  Extra Qualitative Context
                </Label>
                <Textarea
                  id="extra_context"
                  value={extraContext}
                  onChange={(e) => setExtraContext(e.target.value)}
                  placeholder="Location constraints, preferred work style, target exams..."
                  className="min-h-20 text-xs resize-y"
                />
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons: Save Profile vs Regenerate Roadmap */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 rounded-2xl border border-border/70 bg-card/80 p-5 shadow-sm">
            <div>
              <p className="text-sm font-semibold text-foreground">Save or Regenerate</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Saving updates your profile silently. Regenerating wipes existing roadmap items and
                runs AI matching.
              </p>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <Button
                type="button"
                variant="outline"
                onClick={handleSaveProfile}
                disabled={isSaving || isRegenerating}
                className="flex-1 sm:flex-none gap-2 text-xs"
              >
                {isSaving ? (
                  <Loader2 className="size-3.5 animate-spin" />
                ) : (
                  <Save className="size-3.5" />
                )}
                Save Profile
              </Button>

              <Button
                type="button"
                onClick={handleRegenerateRoadmap}
                disabled={isSaving || isRegenerating}
                className="flex-1 sm:flex-none gap-2 text-xs"
              >
                {isRegenerating ? (
                  <Loader2 className="size-3.5 animate-spin" />
                ) : (
                  <Sparkles className="size-3.5 text-amber-300" />
                )}
                Regenerate Roadmap
              </Button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
