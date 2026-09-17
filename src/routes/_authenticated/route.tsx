import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async ({ location }) => {
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

