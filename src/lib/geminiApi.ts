import { generateRoadmap } from "./roadmap.functions";
import { sendChatMessage } from "./chat.functions";
import type { RoadmapResult } from "./roadmap.server";
import type { ChatHistoryInput } from "./chat.functions";

/**
 * Frontend entry point for career recommendations.
 * The AI call happens server-side (authenticated).
 */
export async function generateCareerRoadmap(
  userProfile: Record<string, unknown>,
  apiKey?: string,
): Promise<RoadmapResult> {
  const effectiveKey =
    apiKey ||
    (typeof window !== "undefined"
      ? localStorage.getItem("careercompass_custom_gemini_key") ?? undefined
      : undefined);
  return await generateRoadmap({ data: { userProfile, apiKey: effectiveKey } });
}

/**
 * Frontend entry point for sending contextual chat messages to the career advisor bot.
 * Auth-gated server function.
 */
export async function sendAdvisorChatMessage(
  message: string,
  history: ChatHistoryInput = [],
  apiKey?: string,
): Promise<{ reply: string }> {
  const effectiveKey =
    apiKey ||
    (typeof window !== "undefined"
      ? localStorage.getItem("careercompass_custom_gemini_key") ?? undefined
      : undefined);
  return await sendChatMessage({ data: { message, history, apiKey: effectiveKey } });
}
