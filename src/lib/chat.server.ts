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

    const lovableKey = process.env["LOVABLE_API_KEY"];
    const geminiKey = process.env["GEMINI_API_KEY"] || process.env["GOOGLE_API_KEY"];

    if (!lovableKey && !geminiKey) {
      return {
        reply:
          "AI Advisor is not configured yet. To enable AI career advising, please set LOVABLE_API_KEY or GEMINI_API_KEY in your environment variables (.env).",
      };
    }

    const isLovable = Boolean(lovableKey);
    const apiKey = lovableKey || geminiKey;
    const gatewayUrl = isLovable
      ? "https://ai.gateway.lovable.dev/v1/chat/completions"
      : "https://generativelanguage.googleapis.com/v1beta/openai/chat/completions";
    const model = isLovable
      ? "google/gemini-2.5-flash"
      : (process.env["GEMINI_MODEL"] || "gemini-2.0-flash");

    const response = await fetch(gatewayUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
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
      if (response.status === 401 || response.status === 403) {
        return {
          reply:
            "AI authentication failed. Please verify that your LOVABLE_API_KEY or GEMINI_API_KEY is valid.",
        };
      }
      if (response.status === 429) {
        return { reply: "AI rate limit reached. Please wait a moment and try asking again." };
      }
      if (response.status === 402) {
        return { reply: "AI credits exhausted. Please check your AI provider account credits." };
      }
      return { reply: `AI service returned an error (${response.status}). Please try again shortly.` };
    }

    const payload = (await response.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };

    const reply = payload.choices?.[0]?.message?.content?.trim();
    if (!reply) {
      return { reply: "The AI assistant returned an empty response. Please try rephrasing your question." };
    }

    return { reply };
  } catch (err) {
    console.error("[chat.server] Exception during sendMessage:", err);
    return {
      reply:
        err instanceof Error
          ? `AI request error: ${err.message}`
          : "An unexpected error occurred while contacting the AI assistant. Please try again.",
    };
  }
}
