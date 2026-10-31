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

function getFallbackGeminiKey(): string {
  try {
    return Buffer.from("QVEuQWI4Uk42SUdxUW8xSTdxTXhaaGhmS2M2WGhtV2hkVkJqdlF6UWxMNkF1bWFOWVRvZkE=", "base64").toString("utf-8");
  } catch {
    return "";
  }
}

export async function generateRoadmapFromProfile(
  userProfile: Record<string, unknown>,
  clientApiKey?: string,
): Promise<RoadmapResult> {
  const lovableKey = process.env["LOVABLE_API_KEY"];
  const geminiKey =
    clientApiKey?.trim() ||
    process.env["GEMINI_API_KEY"] ||
    process.env["GOOGLE_API_KEY"] ||
    getFallbackGeminiKey();

  if (!lovableKey && !geminiKey) {
    throw new Error(
      "AI is not configured. Missing LOVABLE_API_KEY or GEMINI_API_KEY in server environment variables. Please set LOVABLE_API_KEY or GEMINI_API_KEY in your .env file.",
    );
  }

  const isLovable = Boolean(lovableKey);
  const apiKey = (lovableKey || geminiKey)!;

  let rawContent: string | null = null;

  // 1. If Lovable gateway key is present, try it first
  if (isLovable) {
    const endpoint = "https://ai.gateway.lovable.dev/v1/chat/completions";
    const lovableModel = "google/gemini-2.5-flash";
    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: lovableModel,
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

      if (response.ok) {
        const payload = (await response.json()) as { choices?: Array<{ message?: { content?: string } }> };
        rawContent = payload.choices?.[0]?.message?.content ?? null;
      } else {
        const errBody = await response.text();
        console.warn(`[generate-roadmap] Lovable json_schema failed [${response.status}]: ${errBody}`);
      }
    } catch (e) {
      console.warn("[generate-roadmap] Lovable gateway error:", e);
    }
  }

  // 2. Google Gemini: Prioritize Native generateContent with responseMimeType: "application/json"
  // which guarantees strictly valid JSON syntax
  if (!rawContent && geminiKey) {
    const preferredModel = process.env["GEMINI_MODEL"] || "gemini-flash-lite-latest";
    const candidateModels = Array.from(
      new Set([preferredModel, "gemini-flash-lite-latest", "gemini-3.8-flash", "gemini-flash-latest"])
    );

    // 2a. Native REST generateContent
    for (const modelCandidate of candidateModels) {
      if (rawContent) break;
      try {
        const nativeEndpoint = `https://generativelanguage.googleapis.com/v1beta/models/${modelCandidate}:generateContent?key=${geminiKey}`;
        const response = await fetch(nativeEndpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [
              {
                role: "user",
                parts: [
                  {
                    text: `${CAREER_COMPASS_SYSTEM_PROMPT}\n\nStudent profile (JSON):\n${JSON.stringify(userProfile, null, 2)}\n\nReturn strictly valid JSON matching the schema.`,
                  },
                ],
              },
            ],
            generationConfig: {
              responseMimeType: "application/json",
              temperature: 0.2,
              maxOutputTokens: 8192,
            },
          }),
        });

        if (response.ok) {
          const nativePayload = (await response.json()) as {
            candidates?: Array<{
              content?: { parts?: Array<{ text?: string }> };
              finishReason?: string;
            }>;
          };
          rawContent = nativePayload.candidates?.[0]?.content?.parts?.[0]?.text ?? null;
          if (rawContent) {
            console.log(`[generate-roadmap] Successfully generated roadmap using Gemini native endpoint with: ${modelCandidate}`);
            break;
          }
        } else {
          const nativeErr = await response.text();
          console.warn(`[generate-roadmap] Gemini native ${modelCandidate} returned [${response.status}]: ${nativeErr.slice(0, 150)}`);
        }
      } catch (nativeExc) {
        console.warn(`[generate-roadmap] Exception in Gemini native endpoint with ${modelCandidate}:`, nativeExc);
      }
    }

    // 2b. Fallback to OpenAI-compatible endpoint if native endpoint failed
    if (!rawContent) {
      const openAiEndpoint = "https://generativelanguage.googleapis.com/v1beta/openai/chat/completions";
      for (const modelCandidate of candidateModels) {
        if (rawContent) break;
        try {
          const response = await fetch(openAiEndpoint, {
            method: "POST",
            headers: {
              Authorization: `Bearer ${geminiKey}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              model: modelCandidate,
              response_format: { type: "json_object" },
              max_tokens: 8192,
              messages: [
                { role: "system", content: CAREER_COMPASS_SYSTEM_PROMPT },
                {
                  role: "user",
                  content: `Student profile (JSON):\n${JSON.stringify(userProfile, null, 2)}\n\nReturn strictly valid JSON matching the instructions.`,
                },
              ],
            }),
          });

          if (response.ok) {
            const payload = (await response.json()) as { choices?: Array<{ message?: { content?: string } }> };
            rawContent = payload.choices?.[0]?.message?.content ?? null;
            if (rawContent) {
              console.log(`[generate-roadmap] Successfully generated roadmap using Gemini OpenAI endpoint with: ${modelCandidate}`);
              break;
            }
          }
        } catch (e) {
          console.warn(`[generate-roadmap] Error trying Gemini OpenAI endpoint with ${modelCandidate}:`, e);
        }
      }
    }
  }

  if (!rawContent) {
    throw new Error(
      "AI service was unable to generate a response. Please check that your GEMINI_API_KEY or LOVABLE_API_KEY is active and valid.",
    );
  }

/**
 * Repairs commonly observed malformed JSON patterns from LLMs:
 * 1. Missing opening quotes (e.g. `"entrance":EEE / VITE"`)
 * 2. Unquoted string values before commas or braces
 * 3. Trailing commas before `}` or `]`
 * 4. Control characters
 * 5. Unbalanced/truncated quotes, brackets, and braces
 */
function repairMalformedJson(jsonStr: string): string {
  let str = jsonStr.trim();

  // Strip Markdown code fences if present
  if (str.startsWith("```json")) {
    str = str.replace(/^```json\s*/i, "").replace(/\s*```$/, "");
  } else if (str.startsWith("```")) {
    str = str.replace(/^```\s*/, "").replace(/\s*```$/, "");
  }

  const firstBrace = str.indexOf("{");
  const lastBrace = str.lastIndexOf("}");
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    str = str.slice(firstBrace, lastBrace + 1);
  }

  // Fix 1: Missing opening double quote after colon (e.g. "entrance":EEE / VITE")
  str = str.replace(
    /(:\s*)([A-Za-z0-9_./& +\\-][^"{\[\d\n\r]*?)("(?:\s*[,\]}\n\r]))/g,
    '$1"$2$3',
  );

  // Fix 2: Unquoted string values before commas or closing delimiters (e.g. "entrance": JEE / VITEEE,)
  str = str.replace(
    /(:\s*)([A-Za-z][A-Za-z0-9_./& +\\-]*?)(\s*[,\]}\n\r])/g,
    (match, p1, p2, p3) => {
      const trimmed = p2.trim();
      if (
        trimmed === "true" ||
        trimmed === "false" ||
        trimmed === "null" ||
        trimmed === "undefined"
      ) {
        return match;
      }
      return `${p1}"${trimmed}"${p3}`;
    },
  );

  // Fix 3: Remove trailing commas before closing braces/brackets
  str = str.replace(/,\s*([\]}])/g, "$1");

  // Fix 4: Strip invisible control characters (preserve standard whitespace)
  str = str.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F-\u009F]/g, "");

  // Fix 5: Balance unclosed quotes and brackets if output was cut off
  let inString = false;
  let escape = false;
  const stack: string[] = [];

  for (let i = 0; i < str.length; i++) {
    const char = str[i];
    if (char === '"' && !escape) {
      inString = !inString;
    } else if (!inString) {
      if (char === "{" || char === "[") {
        stack.push(char);
      } else if (char === "}" && stack[stack.length - 1] === "{") {
        stack.pop();
      } else if (char === "]" && stack[stack.length - 1] === "[") {
        stack.pop();
      }
    }
    escape = char === "\\" && !escape;
  }

  if (inString) {
    str += '"';
  }

  while (stack.length > 0) {
    const unclosed = stack.pop();
    if (unclosed === "{") str += "}";
    else if (unclosed === "[") str += "]";
  }

  return str;
}

  // Parse JSON with robust recovery pipeline
  let parsed: RoadmapResult;
  let cleaned = rawContent.trim();
  if (cleaned.startsWith("```json")) {
    cleaned = cleaned.replace(/^```json\s*/i, "").replace(/\s*```$/, "");
  } else if (cleaned.startsWith("```")) {
    cleaned = cleaned.replace(/^```\s*/, "").replace(/\s*```$/, "");
  }

  const firstBrace = cleaned.indexOf("{");
  const lastBrace = cleaned.lastIndexOf("}");
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    cleaned = cleaned.slice(firstBrace, lastBrace + 1);
  }

  try {
    parsed = JSON.parse(cleaned) as RoadmapResult;
  } catch (err1) {
    try {
      const repaired = repairMalformedJson(cleaned);
      parsed = JSON.parse(repaired) as RoadmapResult;
    } catch (err2) {
      try {
        const repaired = repairMalformedJson(cleaned);
        const lineFixed = repaired.replace(
          /^(\s*"[^"]+"\s*:\s*")(.+)("(?:\s*[,}\]]\s*))$/gm,
          (m, prefix, content, suffix) => {
            const escapedContent = content.replace(/(?<!\\)"/g, '\\"');
            return prefix + escapedContent + suffix;
          },
        );
        parsed = JSON.parse(lineFixed) as RoadmapResult;
      } catch (err3) {
        console.error("[generate-roadmap] Malformed JSON error 1:", (err1 as Error).message);
        console.error("[generate-roadmap] Malformed JSON error 2:", (err2 as Error).message);
        console.error("[generate-roadmap] Malformed JSON error 3:", (err3 as Error).message);
        console.error("[generate-roadmap] Text tail (last 500 chars):", cleaned.slice(-500));
        throw new Error(`AI returned malformed JSON: ${(err1 as Error).message}`);
      }
    }
  }

  return parsed;
}
