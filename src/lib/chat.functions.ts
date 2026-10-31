import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export type ChatHistoryInput = Array<{
  role: "user" | "assistant";
  content: string;
}>;

export const sendChatMessage = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { message: string; history?: ChatHistoryInput; apiKey?: string }) => {
    if (!input || typeof input.message !== "string" || !input.message.trim()) {
      throw new Error("message is required and must be a non-empty string");
    }
    return {
      message: input.message.trim(),
      history: Array.isArray(input.history) ? input.history : [],
      apiKey: input.apiKey,
    };
  })
  .handler(async ({ data, context }) => {
    const { sendMessage } = await import("./chat.server");
    return await sendMessage(data, context.supabase, context.userId);
  });
