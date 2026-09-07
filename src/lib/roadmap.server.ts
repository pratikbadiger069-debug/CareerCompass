import { CAREER_COMPASS_SYSTEM_PROMPT } from "./roadmap.prompt";

export type Json = string | number | boolean | null | Json[] | { [key: string]: Json };
export type RoadmapResult = { [key: string]: Json };

export async function generateRoadmapFromProfile(
  userProfile: Record<string, unknown>,
): Promise<RoadmapResult> {
  const apiKey = process.env["LOVABLE_API_KEY"];
  if (!apiKey) throw new Error("AI is not configured. Missing API key.");

  const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "google/gemini-2.5-flash",
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: CAREER_COMPASS_SYSTEM_PROMPT },
        {
          role: "user",
          content: `Student profile (JSON):\n${JSON.stringify(userProfile, null, 2)}\n\nReturn only the JSON object described in your instructions.`,
        },
      ],
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    console.error(`[generate-roadmap] AI request failed [${response.status}]: ${body}`);
    if (response.status === 429) throw new Error("Rate limit reached. Please try again shortly.");
    if (response.status === 402) throw new Error("AI credits exhausted. Please add credits.");
    throw new Error(`AI request failed [${response.status}]`);
  }

  const payload = (await response.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  const content = payload.choices?.[0]?.message?.content;
  if (!content) throw new Error("AI returned an empty response.");

  try {
    const parsed = JSON.parse(content) as RoadmapResult;
    console.log("[generate-roadmap] Parsed keys:", Object.keys(parsed));
    console.log("[generate-roadmap] Full content:", content);
    return parsed;
  } catch {
    const match = content.match(/\{[\s\S]*\}/);
    if (match) return JSON.parse(match[0]) as RoadmapResult;
    console.error("[generate-roadmap] Unparseable AI content:", content.slice(0, 500));
    throw new Error("AI returned malformed JSON.");
  }
}