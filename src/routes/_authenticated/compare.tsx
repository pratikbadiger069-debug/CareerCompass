import { createFileRoute, redirect, Link } from "@tanstack/react-router";
import { ArrowRight, BarChart3, GraduationCap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { HeaderNav } from "@/components/HeaderNav";

export const Route = createFileRoute("/_authenticated/compare")({
  beforeLoad: () => {
    throw redirect({
      to: "/colleges",
      search: { tab: "compare" },
    });
  },
  head: () => ({
    meta: [
      { title: "CareerCompass — Compare Colleges" },
      {
        name: "description",
        content: "Compare colleges and universities directly inside the College Explorer.",
      },
    ],
  }),
  component: CompareRedirectPage,
});

function CompareRedirectPage() {
  return (
    <div className="min-h-screen bg-charcoal-deep hero-glow dot-grid-bg text-foreground">
      <HeaderNav />
      <main className="mx-auto flex w-full max-w-xl flex-col items-center justify-center px-6 py-24 text-center">
        <Card className="border-border/70 bg-card/90 p-8 shadow-xl">
          <CardHeader className="pb-3 text-center">
            <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary ring-1 ring-primary/20">
              <GraduationCap className="size-7" />
            </div>
            <CardTitle className="text-xl font-bold">College Comparison has moved</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <p className="text-xs text-muted-foreground leading-relaxed">
              College comparison is now integrated seamlessly into the College Explorer. You can select and compare colleges side by side right where you discover them.
            </p>
            <Link to="/colleges" search={{ tab: "compare" }}>
              <Button className="w-full gap-2 text-xs font-semibold">
                Open College Explorer Comparison <ArrowRight className="size-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
