import { generateRoadmap } from "./roadmap.functions";
import { sendChatMessage } from "./chat.functions";
import type { RoadmapResult } from "./roadmap.server";
import type { ChatHistoryInput } from "./chat.functions";

/**
 * Frontend entry point for career recommendations.
 * The AI call happens server-side (authenticated); no API key ever reaches the browser.
 */
export async function generateCareerRoadmap(
  userProfile: Record<string, unknown>,
): Promise<RoadmapResult> {
  return await generateRoadmap({ data: { userProfile } });
}

/**
 * Frontend entry point for sending contextual chat messages to the career advisor bot.
 * Auth-gated server function — no client-side API key exposure.
 */
export async function sendAdvisorChatMessage(
  message: string,
  history: ChatHistoryInput = [],
): Promise<{ reply: string }> {
  return await sendChatMessage({ data: { message, history } });
}
