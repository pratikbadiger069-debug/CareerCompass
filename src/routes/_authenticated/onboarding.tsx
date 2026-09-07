
import { useEffect, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";
import { usePrefersReducedMotion } from "@/hooks/use-reduced-motion";
import { getScaleOnHover } from "@/lib/motion";

export const Route = createFileRoute("/_authenticated/onboarding")({
  head: () => ({
    meta: [
      { title: "Set Up Your CareerCompass Profile" },
      {
        name: "description",
        content:
          "Tell CareerCompass about your education, interests and goals so we can build your personalised career roadmap.",
      },
      { property: "og:title", content: "Set Up Your CareerCompass Profile" },
      {
        property: "og:description",
        content:
          "Five quick steps to unlock personalised career matches and a step-by-step roadmap.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Onboarding,
});

const EDUCATION_STAGES = [
  { value: "class_10", label: "Class 10", hint: "Choosing a stream soon" },
  { value: "class_12", label: "Class 12", hint: "Preparing for college" },
  { value: "ug_1", label: "UG 1st year", hint: "Just started my degree" },
  { value: "ug_mid", label: "UG 2nd / 3rd year", hint: "Mid-degree" },
  { value: "ug_final", label: "UG Final year", hint: "Graduating soon" },
  { value: "pg", label: "Postgraduate", hint: "Masters or beyond" },
  { value: "working", label: "Working professional", hint: "Already employed" },
  { value: "gap_year", label: "Gap year / Break", hint: "Exploring options" },
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

const MARKS = [
  "Above 90%",
  "80-90%",
  "70-80%",
  "60-70%",
  "Below 60%",
  "Prefer not to say",
];

const INTERESTS = [
  { emoji: "💻", label: "Technology" },
  { emoji: "🧪", label: "Science & Research" },
  { emoji: "🩺", label: "Healthcare" },
  { emoji: "📈", label: "Finance" },
  { emoji: "🎨", label: "Design" },
  { emoji: "✍️", label: "Writing" },
  { emoji: "🎬", label: "Media & Film" },
  { emoji: "⚖️", label: "Law & Policy" },
  { emoji: "🏗️", label: "Engineering" },
  { emoji: "🌱", label: "Sustainability" },
  { emoji: "🧠", label: "Psychology" },
  { emoji: "🚀", label: "Entrepreneurship" },
];

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

const TIMELINES = [
  "Within 6 months",
  "6-12 months",
  "1-2 years",
  "2-4 years",
  "Still exploring",
];

const TOTAL_STEPS = 5;

type FormState = {
  education_stage: string;
  stream: string;
  current_marks: string;
  institution_name: string;
  interests: string[];
  current_skills: string[];
  goal_type: string;
  budget_range: string;
  timeline: string;
  career_goal: string;
  extra_context: string;
};

const EMPTY: FormState = {
  education_stage: "",
  stream: "",
  current_marks: "",
  institution_name: "",
  interests: [],
  current_skills: [],
  goal_type: "",
  budget_range: "",
  timeline: "",
  career_goal: "",
  extra_context: "",
};

function Onboarding() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<FormState>(EMPTY);
  const [skillDraft, setSkillDraft] = useState("");
  const [saving, setSaving] = useState(false);
  const prefersReduced = usePrefersReducedMotion();
  const scale = getScaleOnHover(prefersReduced);

  useEffect(() => {
    let active = true;
    if (!user) return;
    supabase
      .from("user_profiles")
      .select(
        "education_stage, stream, current_marks, institution_name, interests, current_skills, goal_type, budget_range, timeline, career_goal, extra_context",
      )
      .eq("user_id", user.id)
      .maybeSingle()
      .then(({ data }) => {
        if (!active || !data) return;
        setForm((prev) => ({
          ...prev,
          education_stage: data.education_stage ?? "",
          stream: data.stream ?? "",
          current_marks: data.current_marks ?? "",
          institution_name: data.institution_name ?? "",
          interests: data.interests ?? [],
          current_skills: data.current_skills ?? [],
          goal_type: data.goal_type ?? "",
          budget_range: data.budget_range ?? "",
          timeline: data.timeline ?? "",
          career_goal: data.career_goal ?? "",
          extra_context: data.extra_context ?? "",
        }));
      });
    return () => {
      active = false;
    };
  }, [user]);

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function toggleInterest(label: string) {
    setForm((prev) => ({
      ...prev,
      interests: prev.interests.includes(label)
        ? prev.interests.filter((i) => i !== label)
        : [...prev.interests, label],
    }));
  }

  function addSkill() {
    const value = skillDraft.trim();
    if (!value) return;
    if (!form.current_skills.includes(value)) {
      set("current_skills", [...form.current_skills, value]);
    }
    setSkillDraft("");
  }

  const canContinue =
    (step === 1 && !!form.education_stage) ||
    (step === 2 && !!form.stream) ||
    (step === 3 && form.interests.length > 0) ||
    (step === 4 && !!form.goal_type && !!form.budget_range && !!form.timeline) ||
    (step === 5 && form.career_goal.trim().length > 0);

  async function submit() {
    if (!user) return;
    setSaving(true);
    const { error } = await supabase.from("user_profiles").upsert(
      {
        user_id: user.id,
        education_stage: form.education_stage,
        stream: form.stream,
        current_marks: form.current_marks || null,
        institution_name: form.institution_name.trim() || null,
        interests: form.interests,
        current_skills: form.current_skills,
        goal_type: form.goal_type,
        budget_range: form.budget_range,
        timeline: form.timeline,
        career_goal: form.career_goal.trim(),
        extra_context: form.extra_context.trim() || null,
        onboarding_completed: true,
      },
      { onConflict: "user_id" },
    );
    setSaving(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Profile saved — building your roadmap.");
    navigate({ to: "/dashboard" });
  }

  return (
    <main className="mx-auto min-h-screen w-full max-w-3xl px-6 py-12">
      <div className="sticky top-0 z-10 -mx-6 bg-background/85 px-6 pb-4 pt-2 backdrop-blur">
        <div className="flex items-baseline justify-between text-sm">
          <span className="font-medium">Step {step} of {TOTAL_STEPS}</span>
          <span className="text-muted-foreground">
            {Math.round((step / TOTAL_STEPS) * 100)}% complete
          </span>
        </div>
        <Progress value={(step / TOTAL_STEPS) * 100} className="mt-2 h-2" />
      </div>

      <h1 className="mt-8 text-3xl font-bold tracking-tight">
        {step === 1 && "Where are you right now?"}
        {step === 2 && "Tell us about your studies"}
        {step === 3 && "What are you drawn to?"}
        {step === 4 && "What are you aiming for?"}
        {step === 5 && "Describe your dream outcome"}
      </h1>
      <p className="mt-2 text-muted-foreground">
        {step === 1 && "This shapes every recommendation we make."}
        {step === 2 && "Your stream and performance help us match realistic paths."}
        {step === 3 && "Pick as many as you like — at least one."}
        {step === 4 && "Goals, budget and timing keep the roadmap practical."}
        {step === 5 && "In your own words. The more detail, the better the plan."}
      </p>

      <div className="mt-8 space-y-8 overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={prefersReduced ? { opacity: 0 } : { opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={prefersReduced ? { opacity: 0 } : { opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
          >
            {step === 1 && (
              <div className="grid gap-3 sm:grid-cols-2">
                {EDUCATION_STAGES.map((option) => {
                  const active = form.education_stage === option.value;
                  return (
                    <motion.button
                      key={option.value}
                      type="button"
                      onClick={() => set("education_stage", option.value)}
                      aria-pressed={active}
                      {...scale}
                      animate={active && !prefersReduced ? { scale: [1, 1.05, 1] } : {}}
                      transition={{ duration: 0.2 }}
                      className={cn(
                        "rounded-xl border border-border/60 bg-card/60 p-4 text-left transition hover:border-primary/60",
                        active &&
                        "border-primary bg-primary/10 ring-1 ring-primary",
                      )}
                    >
                      <span className="block font-medium">{option.label}</span>
                      <span className="mt-1 block text-sm text-muted-foreground">{option.hint}</span>
                    </motion.button>
                  );
                })}
              </div>
            )}

            {step === 2 && (
              <>
                <div>
                  <Label className="mb-3 block">Stream</Label>
                  <div className="grid gap-3 sm:grid-cols-3">
                    {STREAMS.map((option) => {
                      const active = form.stream === option.value;
                      return (
                        <motion.button
                          key={option.value}
                          type="button"
                          onClick={() => set("stream", option.value)}
                          aria-pressed={active}
                          {...scale}
                          animate={active && !prefersReduced ? { scale: [1, 1.05, 1] } : {}}
                          transition={{ duration: 0.2 }}
                          className={cn(
                            "rounded-xl border border-border/60 bg-card/60 p-4 text-sm font-medium transition hover:border-primary/60",
                            active &&
                            "border-primary bg-primary/10 ring-1 ring-primary",
                          )}
                        >
                          {option.label}
                        </motion.button>
                      );
                    })}
                  </div>
                </div>
                <div className="grid gap-6 sm:grid-cols-2">
                  <div>
                    <Label htmlFor="marks">Current marks</Label>
                    <Select
                      value={form.current_marks}
                      onValueChange={(v) => set("current_marks", v)}
                    >
                      <SelectTrigger id="marks" className="mt-2">
                        <SelectValue placeholder="Select a range" />
                      </SelectTrigger>
                      <SelectContent>
                        {MARKS.map((m) => (
                          <SelectItem key={m} value={m}>
                            {m}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="institution">School / college name</Label>
                    <Input
                      id="institution"
                      className="mt-2"
                      maxLength={120}
                      placeholder="e.g. Delhi Public School"
                      value={form.institution_name}
                      onChange={(e) => set("institution_name", e.target.value)}
                    />
                  </div>
                </div>
              </>
            )}

            {step === 3 && (
              <>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {INTERESTS.map((item) => {
                    const active = form.interests.includes(item.label);
                    return (
                      <motion.button
                        key={item.label}
                        type="button"
                        onClick={() => toggleInterest(item.label)}
                        aria-pressed={active}
                        {...scale}
                        animate={active && !prefersReduced ? { scale: [1, 1.05, 1] } : {}}
                        transition={{ duration: 0.2 }}
                        className={cn(
                          "rounded-xl border border-border/60 bg-card/60 p-4 text-center transition hover:border-primary/60",
                          active && "border-primary bg-primary/10 ring-1 ring-primary",
                        )}
                      >
                        <span className="block text-2xl">{item.emoji}</span>
                        <span className="mt-2 block text-sm font-medium">{item.label}</span>
                      </motion.button>
                    );
                  })}
                </div>
                <div>
                  <Label htmlFor="skills">Current skills</Label>
                  <div className="mt-2 flex gap-2">
                    <Input
                      id="skills"
                      maxLength={40}
                      placeholder="Type a skill and press Enter"
                      value={skillDraft}
                      onChange={(e) => setSkillDraft(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === ",") {
                          e.preventDefault();
                          addSkill();
                        }
                      }}
                    />
                    <Button type="button" variant="outline" onClick={addSkill}>
                      Add
                    </Button>
                  </div>
                  {form.current_skills.length > 0 && (
                    <ul className="mt-3 flex flex-wrap gap-2">
                      {form.current_skills.map((skill) => (
                        <li key={skill}>
                          <button
                            type="button"
                            onClick={() =>
                              set(
                                "current_skills",
                                form.current_skills.filter((s) => s !== skill),
                              )
                            }
                            className="rounded-full border border-border/60 bg-secondary px-3 py-1 text-sm text-secondary-foreground transition hover:border-destructive/60"
                            aria-label={`Remove ${skill}`}
                          >
                            {skill} <span aria-hidden>×</span>
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </>
            )}

            {step === 4 && (
              <div className="grid gap-6">
                <div>
                  <Label htmlFor="goal">Primary goal</Label>
                  <Select value={form.goal_type} onValueChange={(v) => set("goal_type", v)}>
                    <SelectTrigger id="goal" className="mt-2">
                      <SelectValue placeholder="Select your goal" />
                    </SelectTrigger>
                    <SelectContent>
                      {GOAL_TYPES.map((g) => (
                        <SelectItem key={g} value={g}>
                          {g}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="budget">Budget range</Label>
                  <Select value={form.budget_range} onValueChange={(v) => set("budget_range", v)}>
                    <SelectTrigger id="budget" className="mt-2">
                      <SelectValue placeholder="Select a budget" />
                    </SelectTrigger>
                    <SelectContent>
                      {BUDGET_RANGES.map((b) => (
                        <SelectItem key={b} value={b}>
                          {b}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="timeline">Timeline</Label>
                  <Select value={form.timeline} onValueChange={(v) => set("timeline", v)}>
                    <SelectTrigger id="timeline" className="mt-2">
                      <SelectValue placeholder="Select a timeline" />
                    </SelectTrigger>
                    <SelectContent>
                      {TIMELINES.map((t) => (
                        <SelectItem key={t} value={t}>
                          {t}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            {step === 5 && (
              <div className="grid gap-6">
                <div>
                  <Label htmlFor="career-goal">Your career goal</Label>
                  <Textarea
                    id="career-goal"
                    className="mt-2 min-h-32"
                    maxLength={1000}
                    placeholder="e.g. I want to become a data scientist at a product company within three years."
                    value={form.career_goal}
                    onChange={(e) => set("career_goal", e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="extra">Anything else we should know? (optional)</Label>
                  <Textarea
                    id="extra"
                    className="mt-2 min-h-24"
                    maxLength={1000}
                    placeholder="Constraints, family expectations, relocation preferences…"
                    value={form.extra_context}
                    onChange={(e) => set("extra_context", e.target.value)}
                  />
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="mt-10 flex items-center justify-between gap-4">
        <Button
          type="button"
          variant="ghost"
          onClick={() => setStep((s) => Math.max(1, s - 1))}
          disabled={step === 1 || saving}
        >
          Back
        </Button>
        {step < TOTAL_STEPS ? (
          <motion.div {...scale}>
            <Button
              type="button"
              onClick={() => setStep((s) => Math.min(TOTAL_STEPS, s + 1))}
              disabled={!canContinue}
            >
              Continue
            </Button>
          </motion.div>
        ) : (
          <motion.div {...scale}>
            <Button type="button" onClick={submit} disabled={!canContinue || saving}>
              {saving && <Loader2 className="mr-2 size-4 animate-spin" />}
              {saving ? "Saving…" : "✨ Generate My Roadmap"}
            </Button>
          </motion.div>
        )}
      </div>
    </main>
  );
}