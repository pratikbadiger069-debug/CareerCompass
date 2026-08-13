import { useMemo, useState, type ReactNode } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ArrowRight, Compass, GraduationCap, Lightbulb, Link2, Route as RouteIcon, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { CAREER_PATHS, EXAM_CONNECTIONS, STREAM_VALUE_TO_PATH, type StreamPath } from "@/lib/careerCompass.paths";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({
    meta: [
      { title: "CareerCompass — Your Career Map" },
      { name: "description", content: "Explore career options, backup paths, what-if scenarios and exam connections." },
      { property: "og:title", content: "CareerCompass — Your Career Map" },
      { property: "og:description", content: "Explore career options, backup paths, what-if scenarios and exam connections." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const { user, isGuest } = useAuth();
  const navigate = useNavigate();
  const [stream, setStream] = useState("science_pcm");
  const [scenarioIndex, setScenarioIndex] = useState(0);

  const path = useMemo<StreamPath>(() => {
    const id = STREAM_VALUE_TO_PATH[stream] ?? "mpc";
    return CAREER_PATHS.find((item) => item.id === id) ?? CAREER_PATHS[0];
  }, [stream]);

  const scenario = path.whatIf[scenarioIndex] ?? path.whatIf[0];

  async function signOut(): Promise<void> {
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  return (
    <main className="mx-auto min-h-screen w-full max-w-6xl px-6 py-10">
      <header className="flex flex-col gap-4 border-b border-border/50 pb-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-primary">CareerCompass</p>
          <h1 className="mt-1 text-3xl font-bold">Your Career Map</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {isGuest ? "Demo mode — explore the map freely." : `Welcome back, ${user?.email ?? "student"}.`}
          </p>
        </div>
        <Button variant="outline" onClick={signOut}>Sign out</Button>
      </header>

      <section className="mt-8 grid gap-4 md:grid-cols-4">
        <MapStep icon={<Compass className="size-5" />} title="Where am I?" value={path.name} />
        <MapStep icon={<RouteIcon className="size-5" />} title="My options" value={`${path.options.length} paths`} />
        <MapStep icon={<ShieldCheck className="size-5" />} title="If it doesn't work" value={`${path.backups.length} backups`} />
        <MapStep icon={<ArrowRight className="size-5" />} title="Next" value="Build & explore" />
      </section>

      <section className="mt-8 rounded-2xl border border-primary/20 bg-primary/5 p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-medium text-primary">Start with your current stream</p>
            <h2 className="mt-1 text-xl font-bold">Where are you right now?</h2>
          </div>
          <Select value={stream} onValueChange={(value) => { setStream(value); setScenarioIndex(0); }}>
            <SelectTrigger className="w-full sm:w-64"><SelectValue placeholder="Choose your stream" /></SelectTrigger>
            <SelectContent>
              {Object.entries(STREAM_VALUE_TO_PATH).map(([value, pathId]) => {
                const item = CAREER_PATHS.find((candidate) => candidate.id === pathId);
                return <SelectItem key={value} value={value}>{item?.name ?? value}</SelectItem>;
              })}
            </SelectContent>
          </Select>
        </div>
      </section>

      <section className="mt-8 grid gap-6 lg:grid-cols-2">
        <Card className="border-border/60 bg-card/70">
          <CardHeader><CardTitle className="flex items-center gap-2"><GraduationCap className="size-5 text-primary" /> Options from here</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {path.options.map((option) => (
              <div key={option.title} className="rounded-xl border border-border/60 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div><p className="font-semibold">{option.title}</p><p className="mt-1 text-sm text-muted-foreground">{option.description}</p></div>
                  <span className="rounded-full bg-primary/10 px-2 py-1 text-xs text-primary">{option.kind}</span>
                </div>
                <p className="mt-3 text-xs font-medium">Next: {option.nextSteps[0]}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="border-border/60 bg-card/70">
          <CardHeader><CardTitle className="flex items-center gap-2"><Lightbulb className="size-5 text-primary" /> What If?</CardTitle></CardHeader>
          <CardContent>
            <Select value={String(scenarioIndex)} onValueChange={(value) => setScenarioIndex(Number(value))}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {path.whatIf.map((item, index) => <SelectItem key={item.question} value={String(index)}>{item.question}</SelectItem>)}
              </SelectContent>
            </Select>
            {scenario && <div className="mt-4 rounded-xl bg-secondary/50 p-4"><p className="text-sm leading-6">{scenario.answer}</p><p className="mt-4 text-sm font-semibold">Possible next paths</p><ul className="mt-2 space-y-2 text-sm text-muted-foreground">{scenario.alternatives.map((item) => <li key={item} className="flex gap-2"><ArrowRight className="mt-0.5 size-4 shrink-0 text-primary" />{item}</li>)}</ul></div>}
          </CardContent>
        </Card>
      </section>

      <section className="mt-8 grid gap-6 lg:grid-cols-2">
        <Card className="border-border/60 bg-card/70">
          <CardHeader><CardTitle>Backup paths</CardTitle></CardHeader>
          <CardContent className="space-y-3">{path.backups.map((backup) => <div key={backup.title} className="rounded-xl border border-border/60 p-4"><p className="font-semibold">{backup.title}</p><p className="mt-1 text-sm text-muted-foreground">{backup.description}</p><p className="mt-2 text-xs">Why it works: {backup.whyItWorks}</p></div>)}</CardContent>
        </Card>

        <Card className="border-border/60 bg-card/70">
          <CardHeader><CardTitle className="flex items-center gap-2"><Link2 className="size-5 text-primary" /> Exam Connections</CardTitle></CardHeader>
          <CardContent className="space-y-3">{EXAM_CONNECTIONS.map((connection) => <div key={connection.exam} className="rounded-xl border border-border/60 p-4"><p className="font-semibold">{connection.exam}</p><p className="mt-1 text-sm text-muted-foreground">Also explore: {connection.connectedExams.join(", ")}</p><p className="mt-2 text-xs">{connection.note}</p></div>)}</CardContent>
        </Card>
      </section>

      <Card className="mt-8 border-primary/20 bg-primary/5"><CardContent className="p-5"><p className="text-sm font-semibold">Your current direction</p><p className="mt-1 text-sm text-muted-foreground">{path.summary}</p><div className="mt-4 flex flex-wrap gap-2">{path.careers.map((career) => <span key={career} className="rounded-full border border-border/60 px-3 py-1 text-xs">{career}</span>)}</div></CardContent></Card>
    </main>
  );
}

function MapStep({ icon, title, value }: { icon: ReactNode; title: string; value: string }) {
  return <Card className="border-border/60 bg-card/70"><CardContent className="p-4"><div className="flex items-center gap-2 text-primary">{icon}<span className="text-xs font-semibold uppercase tracking-wide">{title}</span></div><p className="mt-2 text-sm font-semibold">{value}</p></CardContent></Card>;
}
