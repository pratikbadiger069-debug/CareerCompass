import { generateRoadmap } from "./roadmap.functions";

/**
 * Frontend entry point for career recommendations.
 * The AI call happens server-side (authenticated); no API key ever reaches the browser.
 */
export async function generateCareerRoadmap(
  userProfile: Record<string, unknown>,
): Promise<Record<string, unknown>> {
  return await generateRoadmap({ data: { userProfile } });
}