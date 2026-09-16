import { CAREER_COMPASS_CHAT_SYSTEM_PROMPT } from "./chat.prompt";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

export type ChatHistoryItem = {
  role: "user" | "assistant";
  content: string;
};

export async function sendMessage(
  data: { message: string; history?: ChatHistoryItem[] },
  supabase: SupabaseClient<Database>,
  userId: string,
): Promise<{ reply: string }> {
  try {
    const { message, history = [] } = data;
    const safeHistory = (history ?? []).map((h) => ({
      role: h.role,
      content: h.content,
    }));

    // Fetch context in parallel using RLS-scoped user_id queries
    const [profileRes, recRes, milestonesRes] = await Promise.all([
      supabase.from("user_profiles").select("*").eq("user_id", userId).maybeSingle(),
      supabase
        .from("career_recommendations")
        .select("*")
        .eq("user_id", userId)
        .eq("is_dismissed", false)
        .order("is_saved", { ascending: false })
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle(),
      supabase.from("roadmap_milestones").select("title, status").eq("user_id", userId).limit(20),
    ]);

    const userProfile = profileRes.data ?? null;
    const selectedRecommendation = recRes.data ?? null;
    const roadmapMilestones = milestonesRes.data ?? [];

    const systemPrompt = CAREER_COMPASS_CHAT_SYSTEM_PROMPT(
      userProfile,
      selectedRecommendation,
      roadmapMilestones,
    );

    const apiKey = process.env["LOVABLE_API_KEY"];
    if (!apiKey) {
      throw new Error("AI gateway key missing on server.");
    }

    const gatewayUrl = "https://ai.gateway.lovable.dev/v1/chat/completions";
    const response = await fetch(gatewayUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          ...safeHistory,
          { role: "user", content: message },
        ],
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error(`[chat.server] AI Gateway Error (${response.status}):`, errText);
      return { reply: "Couldn't reach the assistant — try again" };
    }

    const payload = (await response.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };

    const reply = payload.choices?.[0]?.message?.content?.trim();
    if (!reply) {
      return { reply: "Couldn't reach the assistant — try again" };
    }

    return { reply };
  } catch (err) {
    console.error("[chat.server] Exception during sendMessage:", err);
    return { reply: "Couldn't reach the assistant — try again" };
  }
}
