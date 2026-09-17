import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  AlertTriangle,
  ArrowRight,
  Briefcase,
  Clock,
  DollarSign,
  GraduationCap,
  Map as MapIcon,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  Zap,
} from "lucide-react";
import { Link } from "@tanstack/react-router";

export type OptionPath = {
  title: string;
  kind: "education" | "exam" | "career" | "skill";
  description: string;
  next_steps: string[];
};

export type BackupPath = {
  title: string;
  description: string;
  why_it_works: string;
};

export type PathDetailRec = {
  id?: string;
  career_title: string;
  description?: string | null;
  why?: string | null;
  why_it_works?: string | null;
  match_score?: number | null;
  salary_range?: string | null;
  growth_outlook?: string | null;
  required_skills?: string[];
  honest_challenges?: string | null;
  day_in_life?: string | null;
  colleges?: Array<{
    name: string;
    course: string;
    city: string;
    fees_total: string;
    entrance: string;
    why: string;
  }>;
};

interface PathDetailModalProps {
  rec: PathDetailRec | null;
  optionPaths?: OptionPath[];
  backupPaths?: BackupPath[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PathDetailModal({
  rec,
  optionPaths = [],
  backupPaths = [],
  open,
  onOpenChange,
}: PathDetailModalProps) {
  if (!rec) return null;

  const scoreColor =
    (rec.match_score ?? 0) >= 80
      ? "text-emerald-500 bg-emerald-500/10 border-emerald-500/20"
      : (rec.match_score ?? 0) >= 60
        ? "text-amber-500 bg-amber-500/10 border-amber-500/20"
        : "text-red-400 bg-red-400/10 border-red-400/20";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto p-6 sm:p-8">
        <DialogHeader className="border-b border-border/50 pb-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                Career Path Detail
              </Badge>
              {rec.match_score != null && (
                <Badge variant="outline" className={`font-bold ${scoreColor}`}>
                  {rec.match_score}% Match Score
                </Badge>
              )}
            </div>
          </div>
          <DialogTitle className="mt-2 text-2xl font-bold tracking-tight">
            {rec.career_title}
          </DialogTitle>
          <DialogDescription className="text-sm leading-relaxed text-muted-foreground">
            {rec.why_it_works
              ? `Why it works: ${rec.why_it_works} — ${rec.description || ""}`
              : rec.why || rec.description || "Detailed analysis for this career recommendation."}
          </DialogDescription>
        </DialogHeader>

        <div className="mt-6 space-y-6">
          {/* Key Metrics Badges */}
          <div className="flex flex-wrap gap-3">
            {rec.salary_range && (
              <div className="flex items-center gap-2 rounded-xl border border-border/60 bg-card/80 px-4 py-2.5 text-xs">
                <DollarSign className="size-4 text-emerald-500" />
                <div>
                  <span className="block text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">
                    Salary Range
                  </span>
                  <span className="font-bold">{rec.salary_range}</span>
                </div>
              </div>
            )}
            {rec.growth_outlook && (
              <div className="flex items-center gap-2 rounded-xl border border-border/60 bg-card/80 px-4 py-2.5 text-xs">
                <TrendingUp className="size-4 text-blue-500" />
                <div>
                  <span className="block text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">
                    Growth Outlook
                  </span>
                  <span className="font-bold">{rec.growth_outlook}</span>
                </div>
              </div>
            )}
          </div>

          {/* Required Skills */}
          {rec.required_skills && rec.required_skills.length > 0 && (
            <div className="rounded-xl border border-border/60 bg-card/60 p-4">
              <h4 className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                <Zap className="size-4 text-primary" /> Required Core Skills
              </h4>
              <div className="flex flex-wrap gap-2">
                {rec.required_skills.map((skill) => (
                  <Badge key={skill} variant="secondary" className="px-3 py-1 text-xs font-medium">
                    {skill}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Day in the Life */}
          {rec.day_in_life && (
            <div className="rounded-xl border border-blue-500/20 bg-blue-500/5 p-4">
              <h4 className="mb-1 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-blue-400">
                <Clock className="size-4" /> A Day in the Life
              </h4>
              <p className="text-xs leading-relaxed text-foreground/90">{rec.day_in_life}</p>
            </div>
          )}

          {/* Honest Challenges */}
          {rec.honest_challenges && (
            <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4">
              <h4 className="mb-1 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-400">
                <AlertTriangle className="size-4" /> Honest Challenges & Trade-offs
              </h4>
              <p className="text-xs leading-relaxed text-foreground/90">{rec.honest_challenges}</p>
            </div>
          )}

          {/* Relevant Institutions / Colleges */}
          {rec.colleges && rec.colleges.length > 0 && (
            <div className="rounded-xl border border-border/60 bg-card/60 p-4">
              <h4 className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                <GraduationCap className="size-4 text-primary" /> Top Recommended Pathways & Institutions
              </h4>
              <div className="grid gap-3 sm:grid-cols-2">
                {rec.colleges.map((c, i) => (
                  <div key={i} className="rounded-lg border border-border/40 bg-background p-3 text-xs">
                    <p className="font-bold text-foreground">{c.name}</p>
                    <p className="text-muted-foreground">{c.course} • {c.city}</p>
                    <div className="mt-2 flex items-center justify-between text-[11px]">
                      <span className="text-primary font-medium">{c.entrance}</span>
                      <span className="text-muted-foreground">{c.fees_total}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Option & Backup Paths Section */}
          <div className="border-t border-border/50 pt-6">
            <h3 className="mb-4 flex items-center gap-2 text-base font-bold">
              <ShieldCheck className="size-5 text-primary" /> Alternative & Backup Options
            </h3>

            {/* Option Paths */}
            {optionPaths.length > 0 && (
              <div className="mb-4 space-y-3">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Parallel Option Pathways
                </p>
                <div className="grid gap-3 sm:grid-cols-2">
                  {optionPaths.map((opt, i) => (
                    <div key={i} className="rounded-xl border border-border/60 bg-card/80 p-4">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs">{opt.title}</span>
                        <Badge variant="outline" className="text-[10px] uppercase">
                          {opt.kind}
                        </Badge>
                      </div>
                      <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                        {opt.description}
                      </p>
                      {opt.next_steps && opt.next_steps.length > 0 && (
                        <div className="mt-2 text-[11px] text-primary">
                          <span className="font-semibold">Next step:</span> {opt.next_steps[0]}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Backup Paths */}
            {backupPaths.length > 0 && (
              <div className="space-y-3">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Fallback Backup Options ("Why this instead")
                </p>
                <div className="grid gap-3 sm:grid-cols-2">
                  {backupPaths.map((b, i) => (
                    <div key={i} className="rounded-xl border border-primary/20 bg-primary/5 p-4">
                      <span className="font-bold text-xs text-primary">{b.title}</span>
                      <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                        {b.description}
                      </p>
                      <div className="mt-2 text-[11px] font-medium text-foreground/90">
                        <span className="text-primary font-semibold">Why this works:</span> {b.why_it_works}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Action Button */}
        <div className="mt-6 flex justify-end gap-3 border-t border-border/50 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Close
          </Button>
          {rec.id && (
            <Button asChild>
              <Link to="/roadmap" search={{ rec: rec.id }} onClick={() => onOpenChange(false)}>
                <MapIcon className="mr-2 size-4" /> View Full Roadmap
              </Link>
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
