import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({
    meta: [
      { title: "Your CareerCompass Dashboard" },
      {
        name: "description",
        content: "Your career matches, roadmap, advisor chat and saved colleges in one place.",
      },
      { property: "og:title", content: "Your CareerCompass Dashboard" },
      {
        property: "og:description",
        content: "Your career matches, roadmap, advisor chat and saved colleges in one place.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const { user, isGuest } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  async function signOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  return (
    <main className="mx-auto min-h-screen w-full max-w-3xl px-6 py-16">
      <h1 className="text-3xl font-bold">Welcome to CareerCompass</h1>
      <p className="mt-2 text-muted-foreground">
        {isGuest
          ? "You're exploring in demo mode. Create an account to keep everything you build here."
          : `Signed in as ${user?.email ?? "your account"}.`}
      </p>

      <Card className="mt-8 border-border/60 bg-card/70">
        <CardHeader>
          <CardTitle>Your advisor is being set up</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm text-muted-foreground">
          <p>
            Career matches, your roadmap, the AI chat and saved colleges will appear here as they
            are built.
          </p>
          <Button variant="outline" onClick={signOut}>
            Sign out
          </Button>
        </CardContent>
      </Card>
    </main>
  );
}