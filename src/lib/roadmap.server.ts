import { CAREER_COMPASS_SYSTEM_PROMPT } from "./roadmap.prompt";

export type Json = string | number | boolean | null | Json[] | { [key: string]: Json };
export type RoadmapResult = { [key: string]: Json };

const CAREER_COMPASS_SCHEMA = {
  type: "object",
  properties: {
    summary: {
      type: "string",
    },
    current_position: {
      type: "object",
      properties: {
        stage: { type: "string" },
        stream: { type: "string" },
        notes: { type: "string" },
      },
      required: ["stage", "stream", "notes"],
      additionalProperties: false,
    },
    recommendations: {
      type: "array",
      minItems: 1,
      items: {
        type: "object",
        properties: {
          title: { type: "string" },
          match_score: { type: "number" },
          why: { type: "string" },
          salary_range: { type: "string" },
          demand_outlook: { type: "string" },
          required_skills: {
            type: "array",
            items: { type: "string" },
          },
        },
        required: [
          "title",
          "match_score",
          "why",
          "salary_range",
          "demand_outlook",
          "required_skills",
        ],
        additionalProperties: false,
      },
    },
    option_paths: {
      type: "array",
      items: {
        type: "object",
        properties: {
          title: { type: "string" },
          kind: {
            type: "string",
            enum: ["education", "exam", "career", "skill"],
          },
          description: { type: "string" },
          next_steps: {
            type: "array",
            items: { type: "string" },
          },
        },
        required: ["title", "kind", "description", "next_steps"],
        additionalProperties: false,
      },
    },
    backup_paths: {
      type: "array",
      items: {
        type: "object",
        properties: {
          title: { type: "string" },
          description: { type: "string" },
          why_it_works: { type: "string" },
        },
        required: ["title", "description", "why_it_works"],
        additionalProperties: false,
      },
    },
    what_if: {
      type: "array",
      items: {
        type: "object",
        properties: {
          question: { type: "string" },
          answer: { type: "string" },
          alternatives: {
            type: "array",
            items: { type: "string" },
          },
        },
        required: ["question", "answer", "alternatives"],
        additionalProperties: false,
      },
    },
    exam_connections: {
      type: "array",
      items: {
        type: "object",
        properties: {
          exam: { type: "string" },
          connected_exams: {
            type: "array",
            items: { type: "string" },
          },
          note: { type: "string" },
        },
        required: ["exam", "connected_exams", "note"],
        additionalProperties: false,
      },
    },
    roadmap: {
      type: "array",
      items: {
        type: "object",
        properties: {
          phase: { type: "string" },
          timeframe: { type: "string" },
          milestones: {
            type: "array",
            items: {
              type: "object",
              properties: {
                title: { type: "string" },
                description: { type: "string" },
                resources: {
                  type: "array",
                  items: { type: "string" },
                },
              },
              required: ["title", "description", "resources"],
              additionalProperties: false,
            },
          },
        },
        required: ["phase", "timeframe", "milestones"],
        additionalProperties: false,
      },
    },
    next_steps: {
      type: "array",
      items: { type: "string" },
    },
  },
  required: [
    "summary",
    "current_position",
    "recommendations",
    "option_paths",
    "backup_paths",
    "what_if",
    "exam_connections",
    "roadmap",
    "next_steps",
  ],
  additionalProperties: false,
};

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
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "career_compass_plan",
          strict: true,
          schema: CAREER_COMPASS_SCHEMA,
        },
      },
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