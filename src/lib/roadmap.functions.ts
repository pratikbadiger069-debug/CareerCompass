import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const generateRoadmap = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { userProfile: Record<string, unknown> }) => {
    if (!input || typeof input.userProfile !== "object" || input.userProfile === null) {
      throw new Error("userProfile is required");
    }
    return { userProfile: input.userProfile };
  })
  .handler(async ({ data }) => {
    const { generateRoadmapFromProfile } = await import("./roadmap.server");
    return await generateRoadmapFromProfile(data.userProfile);
  });