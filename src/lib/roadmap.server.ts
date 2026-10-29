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
          honest_challenges: { type: "string" },
          day_in_life: { type: "string" },
          colleges: {
            type: "array",
            items: {
              type: "object",
              properties: {
                name: { type: "string" },
                course: { type: "string" },
                city: { type: "string" },
                fees_total: { type: "string" },
                entrance: { type: "string" },
                why: { type: "string" },
              },
              required: ["name", "course", "city", "fees_total", "entrance", "why"],
              additionalProperties: false,
            },
          },
        },
        required: [
          "title",
          "match_score",
          "why",
          "salary_range",
          "demand_outlook",
          "required_skills",
          "honest_challenges",
          "day_in_life",
          "colleges",
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
      minItems: 4,
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
  const lovableKey = process.env["LOVABLE_API_KEY"];
  const geminiKey = process.env["GEMINI_API_KEY"] || process.env["GOOGLE_API_KEY"];

  if (!lovableKey && !geminiKey) {
    throw new Error(
      "AI is not configured. Missing LOVABLE_API_KEY or GEMINI_API_KEY in server environment variables. Please set LOVABLE_API_KEY or GEMINI_API_KEY in your .env file.",
    );
  }

  const isLovable = Boolean(lovableKey);
  const apiKey = lovableKey || geminiKey;
  const endpoint = isLovable
    ? "https://ai.gateway.lovable.dev/v1/chat/completions"
    : "https://generativelanguage.googleapis.com/v1beta/openai/chat/completions";
  const model = isLovable ? "google/gemini-2.5-flash" : "gemini-2.5-flash";

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
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
    if (response.status === 401 || response.status === 403) {
      throw new Error(
        "AI authentication failed. Please verify that your LOVABLE_API_KEY or GEMINI_API_KEY is valid.",
      );
    }
    if (response.status === 429) {
      throw new Error("AI rate limit reached. Please wait a moment and try again.");
    }
    if (response.status === 402) {
      throw new Error("AI credits exhausted. Please replenish credits on your AI provider account.");
    }
    throw new Error(`AI request failed [${response.status}]. Please check your AI configuration.`);
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
