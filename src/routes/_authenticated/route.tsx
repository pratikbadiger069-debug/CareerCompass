import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async ({ location }) => {
    // In SSR (server-side rendering), browser storage (localStorage) is not accessible.
    // Allow the initial shell to render on the server so the browser can hydrate
    // and verify authentication from localStorage on the client.
    if (typeof window === "undefined") {
      return { user: null, onboardingCompleted: false };
    }

    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) throw redirect({ to: "/auth" });

    // Enforce 5-step onboarding after login
    const { data: profile } = await supabase
      .from("user_profiles")
      .select("onboarding_completed")
      .eq("user_id", data.user.id)
      .maybeSingle();

    const onboardingCompleted = profile?.onboarding_completed ?? false;
    if (!onboardingCompleted && location.pathname !== "/onboarding") {
      throw redirect({ to: "/onboarding" });
    }

    return { user: data.user, onboardingCompleted };
  },
  component: () => <Outlet />,
});

